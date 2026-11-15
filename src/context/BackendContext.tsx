import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as api from "@/data/api";
import type {
  AlerteBord,
  EtatBackend,
  LienBord,
  MembreSol,
  MesuresBord,
  MessageBord,
  MessageSol,
} from "@/data/api";

/**
 * Sonde du backend AstroPulse. Tant qu'aucun service ne répond, l'interface
 * reste en mode démonstration et affiche ses valeurs simulées.
 */
type ValeurBackend = EtatBackend & { verifier: () => void };

const BackendContext = createContext<ValeurBackend>({
  bord: false,
  sol: false,
  mode: "demo",
  verifier: () => {},
});

export function BackendProvider({ children }: { children: ReactNode }) {
  const [etat, setEtat] = useState<EtatBackend>({ bord: false, sol: false, mode: "demo" });
  const monte = useRef(true);

  const verifier = useCallback(() => {
    void api.sonderBackend().then((resultat) => {
      if (monte.current) setEtat(resultat);
    });
  }, []);

  useEffect(() => {
    monte.current = true;
    // Aucun backend configuré et page servie depuis un domaine distant :
    // inutile de tenter une requête, on reste en mode démonstration.
    if (!api.SONDE_ACTIVE) return;
    verifier();
    const minuteur = window.setInterval(verifier, 20_000);
    return () => {
      monte.current = false;
      window.clearInterval(minuteur);
    };
  }, [verifier]);

  const valeur = useMemo(() => ({ ...etat, verifier }), [etat, verifier]);
  return <BackendContext.Provider value={valeur}>{children}</BackendContext.Provider>;
}

export function useBackend() {
  return useContext(BackendContext);
}

/** Interroge une ressource du backend tant que `actif` est vrai, puis à intervalle régulier. */
function useRessource<T>(
  actif: boolean,
  cle: string,
  charger: () => Promise<T | null>,
  intervalle: number,
): T | null {
  const [donnee, setDonnee] = useState<T | null>(null);
  const rappel = useRef(charger);
  rappel.current = charger;

  useEffect(() => {
    if (!actif) {
      setDonnee(null);
      return;
    }
    let vivant = true;
    const tirer = async () => {
      const resultat = await rappel.current();
      if (vivant) setDonnee(resultat);
    };
    void tirer();
    const minuteur = window.setInterval(tirer, intervalle);
    return () => {
      vivant = false;
      window.clearInterval(minuteur);
    };
  }, [actif, cle, intervalle]);

  return donnee;
}

/* --------------------------------------------------------------- bord ----- */

export function useLienBord(actif: boolean, intervalle = 5_000): LienBord | null {
  return useRessource(actif, "lien-bord", () => api.lienBord(), intervalle);
}

export function useAlertesBord(actif: boolean, intervalle = 8_000): AlerteBord[] | null {
  return useRessource(actif, "alertes-bord", () => api.alertesBord(), intervalle);
}

export function useMesuresBord(actif: boolean, intervalle = 8_000): MesuresBord | null {
  return useRessource(actif, "mesures-bord", () => api.mesuresBord(), intervalle);
}

export function useMessagesBord(actif: boolean, intervalle = 8_000): MessageBord[] | null {
  return useRessource(actif, "messages-bord", () => api.messagesBord(), intervalle);
}

/* ---------------------------------------------------------------- sol ----- */

export function useEquipageSol(actif: boolean, intervalle = 8_000): MembreSol[] | null {
  return useRessource(actif, "equipage-sol", () => api.equipageSol(), intervalle);
}

export function useMessagesSol(actif: boolean, astronaute: string, version = 0, intervalle = 8_000): MessageSol[] | null {
  return useRessource(actif, `messages-sol-${astronaute}-${version}`, () => api.messagesSol(astronaute), intervalle);
}
