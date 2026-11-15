import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { appliquerTraduction, type Langue } from "@/i18n/traduire";

const CLE_STOCKAGE = "globalastro-langue-v1";

type ValeurLangue = {
  langue: Langue;
  definirLangue: (langue: Langue) => void;
};

const LangueContext = createContext<ValeurLangue | null>(null);

function langueInitiale(): Langue {
  if (typeof window === "undefined") return "fr";
  try {
    return window.localStorage.getItem(CLE_STOCKAGE) === "en" ? "en" : "fr";
  } catch {
    return "fr";
  }
}

/**
 * Langue de l'interface. Le français reste la langue de référence : les écrans sont écrits en
 * français, et l'anglais est posé par-dessus au moment de l'affichage (voir src/i18n/traduire.ts).
 * Le choix est conservé d'une visite à l'autre.
 */
export function LangueProvider({ children }: { children: ReactNode }) {
  const [langue, setLangue] = useState<Langue>(langueInitiale);

  useEffect(() => {
    document.documentElement.lang = langue;
    try {
      window.localStorage.setItem(CLE_STOCKAGE, langue);
    } catch {
      /* stockage indisponible : la langue vaudra pour cette visite seulement */
    }
    // la traduction s'applique maintenant, puis suit les redessins de l'application
    return appliquerTraduction(langue);
  }, [langue]);

  const definirLangue = useCallback((valeur: Langue) => setLangue(valeur), []);
  const valeur = useMemo(() => ({ langue, definirLangue }), [langue, definirLangue]);
  return <LangueContext.Provider value={valeur}>{children}</LangueContext.Provider>;
}

export function useLangue(): ValeurLangue {
  const contexte = useContext(LangueContext);
  if (!contexte) throw new Error("useLangue doit être utilisé à l'intérieur de LangueProvider.");
  return contexte;
}

export type { Langue };
