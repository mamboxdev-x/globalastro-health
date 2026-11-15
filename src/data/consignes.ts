import { useCallback, useEffect, useRef, useState } from "react";
import { SONDE_ACTIVE, consignesModule, envoyerConsigneModule, etatConsigneModule } from "@/data/api";

/**
 * Les consignes voyagent du sol vers le bord, par deux transports :
 *
 *  1. la base du module central, quand elle répond — c'est le seul moyen qu'une instruction
 *     écrite sur un poste arrive sur un autre appareil (le médecin sur son PC, l'astronaute
 *     sur sa tablette) ;
 *  2. le stockage du navigateur, toujours — c'est ce qui permet de fonctionner hors ligne et
 *     de retrouver ses consignes après un changement de rôle sur le même poste.
 *
 * Les consignes venues de la base portent l'identifiant `base-<n>` : on sait ainsi où
 * renvoyer l'accusé de réception.
 */

export type EtatConsigne = "attente" | "transmise" | "lue";

export type ConsignePartagee = {
  id: string;
  ts: number;
  miseEnFile: string;
  destinataire: string;
  texte: string;
  etat: EtatConsigne;
  lueLe?: string;
  origine: "base" | "poste";
};

const CLE = "globalastro-consignes-v1";
const PREFIXE_BASE = "base-";

/** Identifiant de connexion proposé par défaut à l'astronaute : il reçoit la consigne d'exemple. */
export const ASTRONAUTE_DEMO = "cdr.mbaye";

const DEPART: ConsignePartagee[] = [
  {
    id: "c-086",
    ts: Date.parse("2026-02-12T12:44:00Z"),
    miseEnFile: "jour 86 · 12:44 UTC",
    destinataire: ASTRONAUTE_DEMO,
    texte: "Réévaluer la charge d’entraînement et transmettre le ressenti articulaire",
    etat: "lue",
    lueLe: "jour 86 · 13:20 UTC",
    origine: "poste",
  },
  {
    id: "c-085",
    ts: Date.parse("2026-02-11T08:12:00Z"),
    miseEnFile: "jour 85 · 08:12 UTC",
    destinataire: "ing.kouassi",
    texte: "Relever la pression artérielle deux fois par jour pendant trois jours",
    etat: "transmise",
    origine: "poste",
  },
];

export function lireConsignes(): ConsignePartagee[] {
  if (typeof window === "undefined") return DEPART;
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return DEPART;
    const donnees = JSON.parse(brut);
    return Array.isArray(donnees) && donnees.length > 0 ? (donnees as ConsignePartagee[]) : DEPART;
  } catch {
    return DEPART;
  }
}

function ecrireConsignes(liste: ConsignePartagee[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLE, JSON.stringify(liste));
  } catch {
    /* stockage indisponible : on garde l'état en mémoire */
  }
}

const ORDRE: Record<EtatConsigne, number> = { attente: 0, transmise: 1, lue: 2 };

function trier(liste: ConsignePartagee[]): ConsignePartagee[] {
  return [...liste].sort((a, b) => b.ts - a.ts);
}

/**
 * Fusionne ce qui vient de la base avec ce qui est déjà connu ici. La base fait foi pour ses
 * propres consignes ; celles écrites ici et pas encore remontées restent visibles. En cas de
 * conflit d'état, c'est le plus avancé qui gagne (un accusé de réception ne revient jamais en
 * arrière).
 */
function fusionner(locales: ConsignePartagee[], deLaBase: ConsignePartagee[]): ConsignePartagee[] {
  const parId = new Map(locales.map((consigne) => [consigne.id, consigne]));
  for (const distante of deLaBase) {
    const locale = parId.get(distante.id);
    if (locale && ORDRE[locale.etat] > ORDRE[distante.etat]) {
      parId.set(distante.id, { ...distante, etat: locale.etat, lueLe: locale.lueLe ?? distante.lueLe });
    } else {
      parId.set(distante.id, distante);
    }
  }
  return trier([...parId.values()]);
}

export function useConsignes() {
  const [liste, setListe] = useState<ConsignePartagee[]>(() => lireConsignes());
  const baseUtilisable = useRef(SONDE_ACTIVE);

  const enregistrer = useCallback((suivante: ConsignePartagee[]) => {
    const triee = trier(suivante);
    setListe(triee);
    ecrireConsignes(triee);
    return triee;
  }, []);

  // ce qu'un autre poste a écrit arrive ici
  useEffect(() => {
    if (!baseUtilisable.current) return;
    let vivant = true;
    const tirer = async () => {
      const distantes = await consignesModule();
      if (!vivant || !distantes) return;
      const converties: ConsignePartagee[] = distantes.map((distante) => ({
        id: `${PREFIXE_BASE}${distante.id}`,
        ts: Date.parse(distante.cree_le) || Date.now(),
        miseEnFile: distante.mise_en_file || `jour — · ${distante.cree_le.slice(11, 16)} UTC`,
        destinataire: distante.destinataire,
        texte: distante.texte,
        etat: (distante.etat as EtatConsigne) ?? "attente",
        lueLe: distante.lue_le ? distante.lue_le.slice(11, 16) : undefined,
        origine: "base",
      }));
      setListe((actuelle) => {
        const fusion = fusionner(actuelle, converties);
        ecrireConsignes(fusion);
        return fusion;
      });
    };
    void tirer();
    const minuteur = window.setInterval(tirer, 5_000);
    return () => {
      vivant = false;
      window.clearInterval(minuteur);
    };
  }, []);

  // deux onglets du même poste se resynchronisent
  useEffect(() => {
    const surStockage = (evenement: StorageEvent) => {
      if (evenement.key === CLE) setListe(lireConsignes());
    };
    window.addEventListener("storage", surStockage);
    return () => window.removeEventListener("storage", surStockage);
  }, []);

  const ajouter = useCallback(
    async (texte: string, destinataire: string, miseEnFile: string) => {
      const locale: ConsignePartagee = {
        id: `c-${Date.now()}`,
        ts: Date.now(),
        miseEnFile,
        destinataire,
        texte,
        etat: "attente",
        origine: "poste",
      };
      let suivante = enregistrer([locale, ...lireConsignes()]);

      // on tente la base : c'est ce qui fait traverser l'instruction d'un appareil à l'autre
      if (baseUtilisable.current) {
        const reponse = await envoyerConsigneModule(destinataire, texte, miseEnFile);
        if (reponse?.ok && reponse.consigne) {
          const confirmee: ConsignePartagee = {
            ...locale,
            id: `${PREFIXE_BASE}${reponse.consigne.id}`,
            ts: Date.parse(reponse.consigne.cree_le) || locale.ts,
            origine: "base",
          };
          suivante = enregistrer([confirmee, ...suivante.filter((consigne) => consigne.id !== locale.id)]);
        }
      }
      return suivante;
    },
    [enregistrer],
  );

  const changerEtat = useCallback((id: string, etat: EtatConsigne, lueLe?: string) => {
    setListe((actuelle) => {
      const suivante = actuelle.map((consigne) =>
        consigne.id === id ? { ...consigne, etat, lueLe: lueLe ?? consigne.lueLe } : consigne,
      );
      ecrireConsignes(suivante);
      return suivante;
    });
    if (baseUtilisable.current && id.startsWith(PREFIXE_BASE)) {
      void etatConsigneModule(id.slice(PREFIXE_BASE.length), etat);
    }
  }, []);

  return { liste, ajouter, changerEtat };
}
