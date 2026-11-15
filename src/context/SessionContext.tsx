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

/** Profil saisi à l'inscription. Pour un astronaute, il alimente la simulation des capteurs. */
export type Profil = {
  poidsKg?: number;
  tailleM?: number;
  sexe?: "H" | "F";
  service?: string;
};

export type Compte = {
  identifiant: string;
  motDePasse: string;
  role: Role;
  profil?: Profil;
  creeLe: string;
};

type Session = {
  role: Role | null;
  identifiant: string;
  profil?: Profil;
};

type SessionContextValue = Session & {
  connecter: (role: Role, identifiant: string, motDePasse?: string) => { ok: boolean; message?: string };
  deconnecter: () => void;
  basculeTheme: () => void;
  definirTheme: (theme: "clair" | "sombre") => void;
  theme: "clair" | "sombre";
  comptes: Compte[];
  creerCompte: (compte: Omit<Compte, "creeLe">) => { ok: boolean; message?: string };
};

const STORAGE_KEY = "globalastro-session-v1";
const THEME_KEY = "globalastro-theme-v1";
const COMPTES_KEY = "globalastro-comptes-v1";
const SessionContext = createContext<SessionContextValue | null>(null);

function lireComptes(): Compte[] {
  if (typeof window === "undefined") return [];
  try {
    const brut = window.localStorage.getItem(COMPTES_KEY);
    if (!brut) return [];
    const donnees = JSON.parse(brut);
    return Array.isArray(donnees) ? (donnees as Compte[]) : [];
  } catch {
    return [];
  }
}

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
  const [comptes, setComptes] = useState<Compte[]>(lireComptes);
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

  const connecter = useCallback(
    (role: Role, identifiantSaisi: string, motDePasse?: string) => {
      const identifiant = identifiantSaisi.trim();
      const compte = comptes.find((c) => c.identifiant.toLowerCase() === identifiant.toLowerCase());

      if (compte) {
        if (motDePasse !== undefined && motDePasse !== compte.motDePasse) {
          return { ok: false, message: "Mot de passe incorrect pour ce compte." };
        }
        const suivant: Session = { role: compte.role, identifiant: compte.identifiant, profil: compte.profil };
        setSession(suivant);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(suivant));
        } catch {
          /* ignoré */
        }
        return { ok: true };
      }

      // aucun compte enregistré sous cet identifiant : session de démonstration
      const suivant: Session = { role, identifiant };
      setSession(suivant);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(suivant));
      } catch {
        /* ignoré */
      }
      return { ok: true };
    },
    [comptes],
  );

  const creerCompte = useCallback(
    (compte: Omit<Compte, "creeLe">) => {
      const identifiant = compte.identifiant.trim();
      if (identifiant.length < 3) {
        return { ok: false, message: "Identifiant trop court : au moins 3 caractères." };
      }
      if (compte.motDePasse.length < 4) {
        return { ok: false, message: "Mot de passe trop court : au moins 4 caractères." };
      }
      if (comptes.some((c) => c.identifiant.toLowerCase() === identifiant.toLowerCase())) {
        return { ok: false, message: "Cet identifiant est déjà pris." };
      }

      const nouveau: Compte = { ...compte, identifiant, creeLe: new Date().toISOString() };
      const liste = [...comptes, nouveau];
      setComptes(liste);
      try {
        window.localStorage.setItem(COMPTES_KEY, JSON.stringify(liste));
      } catch {
        /* ignoré */
      }
      return { ok: true };
    },
    [comptes],
  );

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
    () => ({ ...session, connecter, deconnecter, basculeTheme, definirTheme, theme, comptes, creerCompte }),
    [session, connecter, deconnecter, basculeTheme, definirTheme, theme, comptes, creerCompte],
  );

  return <SessionContext.Provider value={valeur}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession doit être utilisé dans un SessionProvider.");
  return ctx;
}
