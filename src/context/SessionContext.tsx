import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as api from "@/data/api";
import { SUPABASE_CONFIGURE, connexionSupabase, inscrireCompteSupabase } from "@/data/supabase";

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

type ResultatConnexion = { ok: boolean; message?: string; viaBase?: boolean };

type SessionContextValue = Session & {
  connecter: (role: Role, identifiant: string, motDePasse?: string) => Promise<ResultatConnexion>;
  entrerDemo: (role: Role) => void;
  deconnecter: () => void;
  basculeTheme: () => void;
  definirTheme: (theme: "clair" | "sombre") => void;
  theme: "clair" | "sombre";
  comptes: Compte[];
  creerCompte: (compte: Omit<Compte, "creeLe">) => Promise<ResultatConnexion>;
};

const STORAGE_KEY = "globalastro-session-v1";
const THEME_KEY = "globalastro-theme-v1";
const COMPTES_KEY = "globalastro-comptes-v1";
const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Deux comptes de démonstration, toujours disponibles. Ils servent de porte d'entrée à qui
 * ne veut pas créer de compte : sans eux, un visiteur resterait dehors, puisque la connexion
 * refuse désormais tout identifiant inconnu.
 */
export const MOT_DE_PASSE_DEMO = "demo1234";

export const COMPTES_DEMO: Compte[] = [
  {
    identifiant: "cdr.mbaye",
    motDePasse: MOT_DE_PASSE_DEMO,
    role: "astro",
    profil: { poidsKg: 78, tailleM: 1.82, sexe: "H" },
    creeLe: "2026-01-01T00:00:00.000Z",
  },
  {
    identifiant: "dr.anderson",
    motDePasse: MOT_DE_PASSE_DEMO,
    role: "sol",
    profil: { service: "Centre de contrôle · Houston" },
    creeLe: "2026-01-01T00:00:00.000Z",
  },
];

/** Comptes réellement inscrits dans ce navigateur (hors comptes de démonstration). */
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

/** Comptes de démonstration puis comptes inscrits, sans doublon. */
function tousLesComptes(inscrits: Compte[]): Compte[] {
  const connus = new Set(COMPTES_DEMO.map((compte) => compte.identifiant.toLowerCase()));
  return [...COMPTES_DEMO, ...inscrits.filter((compte) => !connus.has(compte.identifiant.toLowerCase()))];
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
  const [comptesInscrits, setComptesInscrits] = useState<Compte[]>(lireComptes);
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

  const ouvrir = useCallback((compte: Compte) => {
    const suivant: Session = { role: compte.role, identifiant: compte.identifiant, profil: compte.profil };
    setSession(suivant);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(suivant));
    } catch {
      /* ignoré */
    }
  }, []);

  const comptes = useMemo(() => tousLesComptes(comptesInscrits), [comptesInscrits]);

  /** Ajoute un compte à la liste locale (miroir de ce qui existe dans une base). */
  const memoriser = useCallback((compte: Compte) => {
    setComptesInscrits((liste) => {
      if (liste.some((connu) => connu.identifiant.toLowerCase() === compte.identifiant.toLowerCase())) {
        return liste;
      }
      const suivante = [...liste, compte];
      try {
        window.localStorage.setItem(COMPTES_KEY, JSON.stringify(suivante));
      } catch {
        /* ignoré */
      }
      return suivante;
    });
  }, []);

  const connecter = useCallback(
    async (role: Role, identifiantSaisi: string, motDePasse?: string): Promise<ResultatConnexion> => {
      const identifiant = identifiantSaisi.trim();

      const local = comptes.find((c) => c.identifiant.toLowerCase() === identifiant.toLowerCase());
      if (local) {
        if (motDePasse !== undefined && motDePasse !== local.motDePasse) {
          return { ok: false, message: "Mot de passe incorrect pour ce compte." };
        }
        ouvrir(local);
        return { ok: true };
      }

      // Base du sol (Supabase) d'abord : c'est elle qui partage les comptes entre les appareils.
      if (SUPABASE_CONFIGURE) {
        const duSol = await connexionSupabase(identifiant, motDePasse ?? "");
        if (duSol?.ok && duSol.compte) {
          const miroir: Compte = {
            identifiant: duSol.compte.identifiant,
            motDePasse: motDePasse ?? "",
            role: duSol.compte.role,
            profil: duSol.compte.profil as Profil | undefined,
            creeLe: duSol.compte.cree_le ?? new Date().toISOString(),
          };
          memoriser(miroir);
          ouvrir(miroir);
          return { ok: true, viaBase: true };
        }
        if (duSol && duSol.ok === false) {
          return { ok: false, message: duSol.message ?? "Connexion refusée par la base du sol." };
        }
      }

      // Identifiant inconnu ici : on le demande à la base du module central, si elle tourne.
      // Sur le site en ligne, aucune base n'existe : on ne tente même pas la requête, pour ne
      // pas laisser d'erreur réseau dans la console du navigateur.
      const reponse = api.SONDE_ACTIVE ? await api.connexionModule(identifiant, motDePasse ?? "") : null;
      if (reponse?.ok && reponse.compte) {
        const miroir: Compte = {
          identifiant: reponse.compte.identifiant,
          motDePasse: motDePasse ?? "",
          role: reponse.compte.role,
          profil: reponse.compte.profil as Profil | undefined,
          creeLe: reponse.compte.cree_le ?? new Date().toISOString(),
        };
        memoriser(miroir);
        ouvrir(miroir);
        return { ok: true, viaBase: true };
      }
      if (reponse && reponse.ok === false) {
        return { ok: false, message: reponse.erreur ?? "Connexion refusée par la base." };
      }

      return {
        ok: false,
        message: `Aucun compte sous cet identifiant (${
          role === "astro" ? "astronaute" : "médecin"
        }). Créez-le, ou utilisez l’un des comptes d’accès.`,
      };
    },
    [comptes, ouvrir],
  );

  const entrerDemo = useCallback(
    (role: Role) => {
      const compte = COMPTES_DEMO.find((c) => c.role === role) ?? COMPTES_DEMO[0];
      ouvrir(compte);
    },
    [ouvrir],
  );

  const creerCompte = useCallback(
    async (compte: Omit<Compte, "creeLe">): Promise<ResultatConnexion> => {
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

      // La base du sol fait référence : elle refuse les doublons et garde l'empreinte.
      // À défaut, le module central, puis le stockage de ce navigateur.
      if (SUPABASE_CONFIGURE) {
        const duSol = await inscrireCompteSupabase({
          identifiant,
          role: compte.role,
          motDePasse: compte.motDePasse,
          profil: compte.profil,
        });
        if (duSol && duSol.ok === false) {
          return { ok: false, message: duSol.message ?? "Inscription refusée par la base du sol." };
        }
      } else if (api.SONDE_ACTIVE) {
        const reponse = await api.inscrireCompteModule({
          identifiant,
          role: compte.role,
          motDePasse: compte.motDePasse,
          profil: compte.profil,
        });
        if (reponse && reponse.ok === false) {
          return { ok: false, message: reponse.erreur ?? "Inscription refusée par la base." };
        }
      }

      const nouveau: Compte = { ...compte, identifiant, creeLe: new Date().toISOString() };
      setComptesInscrits((liste) => {
        const suivante = [...liste, nouveau];
        try {
          window.localStorage.setItem(COMPTES_KEY, JSON.stringify(suivante));
        } catch {
          /* ignoré */
        }
        return suivante;
      });

      return {
        ok: true,
        viaBase: SUPABASE_CONFIGURE || api.SONDE_ACTIVE,
        message: SUPABASE_CONFIGURE
          ? "Inscription enregistrée dans la base du sol."
          : "Compte créé dans ce navigateur.",
      };
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
    () => ({ ...session, connecter, entrerDemo, deconnecter, basculeTheme, definirTheme, theme, comptes, creerCompte }),
    [session, connecter, entrerDemo, deconnecter, basculeTheme, definirTheme, theme, comptes, creerCompte],
  );

  return <SessionContext.Provider value={valeur}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession doit être utilisé dans un SessionProvider.");
  return ctx;
}
