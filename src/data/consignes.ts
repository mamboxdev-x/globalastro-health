import { useCallback, useEffect, useState } from "react";

/**
 * Les consignes écrites au sol doivent survivre au changement de rôle : le médecin les
 * écrit, puis se déconnecte, puis l’astronaute se connecte et doit les retrouver.
 * D’où un magasin partagé dans le navigateur plutôt qu’un état local à l’écran du sol.
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
};

const CLE = "globalastro-consignes-v1";

/** Identifiant de connexion proposé par défaut à l’astronaute : il reçoit la consigne d’exemple. */
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
  },
  {
    id: "c-085",
    ts: Date.parse("2026-02-11T08:12:00Z"),
    miseEnFile: "jour 85 · 08:12 UTC",
    destinataire: "ing.kouassi",
    texte: "Relever la pression artérielle deux fois par jour pendant trois jours",
    etat: "transmise",
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
    /* stockage indisponible : on garde l’état en mémoire */
  }
}

/**
 * Le magasin partagé, à utiliser aussi bien au sol qu’à bord. Les deux onglets se
 * resynchronisent par l’événement `storage` : une consigne écrite dans l’un apparaît
 * dans l’autre.
 */
export function useConsignes() {
  const [liste, setListe] = useState<ConsignePartagee[]>(() => lireConsignes());

  useEffect(() => {
    const surStockage = (evenement: StorageEvent) => {
      if (evenement.key === CLE) setListe(lireConsignes());
    };
    window.addEventListener("storage", surStockage);
    return () => window.removeEventListener("storage", surStockage);
  }, []);

  const ajouter = useCallback((texte: string, destinataire: string, miseEnFile: string) => {
    const nouvelle: ConsignePartagee = {
      id: `c-${Date.now()}`,
      ts: Date.now(),
      miseEnFile,
      destinataire,
      texte,
      etat: "attente",
    };
    setListe((actuelle) => {
      const suivante = [nouvelle, ...actuelle];
      ecrireConsignes(suivante);
      return suivante;
    });
    return nouvelle;
  }, []);

  const changerEtat = useCallback((id: string, etat: EtatConsigne, lueLe?: string) => {
    setListe((actuelle) => {
      const suivante = actuelle.map((consigne) =>
        consigne.id === id ? { ...consigne, etat, lueLe: lueLe ?? consigne.lueLe } : consigne,
      );
      ecrireConsignes(suivante);
      return suivante;
    });
  }, []);

  return { liste, ajouter, changerEtat };
}
