import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** Rôle de la personne connectée : à bord, ou au poste sol. */
export type Role = "astro" | "sol";

type Session = {
  role: Role | null;
  identifiant: string;
};

type SessionContextValue = Session & {
  connecter: (role: Role, identifiant: string) => void;
  deconnecter: () => void;
  basculeTheme: () => void;
  definirTheme: (theme: "clair" | "sombre") => void;
  theme: "clair" | "sombre";
};

const STORAGE_KEY = "globalastro-session-v1";
const THEME_KEY = "globalastro-theme-v1";
const SessionContext = createContext<SessionContextValue | null>(null);

function lireSession(): Session {
  if (typeof window === "undefined") return { role: null, identifiant: "" };
  try {
    const brut = window.localStorage.getItem(STORAGE_KEY);
    if (!brut) return { role: null, identifiant: "" };
    const donnees = JSON.parse(brut) as Partial<Session>;
    const role = donnees.role === "astro" || donnees.role === "sol" ? donnees.role : null;
    return { role, identifiant: typeof donnees.identifiant === "string" ? donnees.identifiant : "" };
  } catch {
    return { role: null, identifiant: "" };
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(lireSession);
  const [theme, setTheme] = useState<"clair" | "sombre">(() => {
    if (typeof window === "undefined") return "clair";
    return window.localStorage.getItem(THEME_KEY) === "sombre" ? "sombre" : "clair";
  });

  useEffect(() => {
    document.documentElement.dataset.rfTheme = theme === "sombre" ? "dark" : "light";
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* stockage indisponible : le thème reste valable pour la session */
    }
  }, [theme]);

  const connecter = useCallback((role: Role, identifiant: string) => {
    const suivant = { role, identifiant };
    setSession(suivant);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(suivant));
    } catch {
      /* ignoré */
    }
  }, []);

  const deconnecter = useCallback(() => {
    setSession({ role: null, identifiant: "" });
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignoré */
    }
  }, []);

  const basculeTheme = useCallback(() => {
    setTheme((actuel) => (actuel === "sombre" ? "clair" : "sombre"));
  }, []);

  const definirTheme = useCallback((choix: "clair" | "sombre") => {
    setTheme(choix);
  }, []);

  const valeur = useMemo<SessionContextValue>(
    () => ({ ...session, connecter, deconnecter, basculeTheme, definirTheme, theme }),
    [session, connecter, deconnecter, basculeTheme, definirTheme, theme],
  );

  return <SessionContext.Provider value={valeur}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession doit être utilisé dans un SessionProvider.");
  return ctx;
}
