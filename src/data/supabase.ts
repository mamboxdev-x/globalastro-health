/**
 * Base du poste sol — Supabase (PostgreSQL).
 *
 * Seul le sol écrit ici. À bord, rien ne dépend de cette base : les mesures restent locales et
 * remontent à la fenêtre de communication suivante. Le site étant statique (Vercel), il n'a pas
 * de serveur : c'est l'API REST de Supabase qui tient lieu de base, avec la clé publique du
 * projet. Sans configuration, tout retombe sur le module central puis sur le stockage local.
 */

const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};
const URL_BASE = env.VITE_SUPABASE_URL;
const CLE_PUBLIQUE = env.VITE_SUPABASE_ANON_KEY;

/** Vrai si le projet Supabase est renseigné dans l'environnement. */
export const SUPABASE_CONFIGURE = Boolean(URL_BASE && CLE_PUBLIQUE);

/** Même sel que le module central : les deux bases reconnaissent les mêmes empreintes. */
const SEL = "helix-demo-2026";

/** Empreinte du mot de passe (SHA-256 côté navigateur) : le mot de passe n'est jamais stocké. */
export async function empreinte(identifiant: string, motDePasse: string): Promise<string> {
  const donnees = new TextEncoder().encode(`${SEL}:${identifiant}:${motDePasse}`);
  const digest = await crypto.subtle.digest("SHA-256", donnees);
  return [...new Uint8Array(digest)].map((octet) => octet.toString(16).padStart(2, "0")).join("");
}

type Options = {
  methode?: "GET" | "POST" | "PATCH";
  corps?: unknown;
  requete?: string;
};

async function appel<T>(table: string, options: Options = {}): Promise<T | null> {
  if (!SUPABASE_CONFIGURE) return null;
  const { methode = "GET", corps, requete = "" } = options;
  const controle = new AbortController();
  const minuteur = window.setTimeout(() => controle.abort(), 3_500);
  try {
    const reponse = await fetch(`${URL_BASE}/rest/v1/${table}${requete}`, {
      method: methode,
      signal: controle.signal,
      headers: {
        apikey: CLE_PUBLIQUE as string,
        Authorization: `Bearer ${CLE_PUBLIQUE}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: corps === undefined ? undefined : JSON.stringify(corps),
    });
    if (!reponse.ok) return null;
    const texte = await reponse.text();
    return texte ? (JSON.parse(texte) as T) : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(minuteur);
  }
}

/* ----------------------------------------------------------------- comptes -- */

export type CompteSupabase = {
  identifiant: string;
  role: "astro" | "sol";
  empreinte: string;
  profil: Record<string, unknown>;
  cree_le: string;
};

export const comptesSupabase = () =>
  appel<CompteSupabase[]>("comptes", { requete: "?select=identifiant,role,profil,cree_le&order=cree_le.asc" });

export async function inscrireCompteSupabase(compte: {
  identifiant: string;
  role: string;
  motDePasse: string;
  profil?: unknown;
}): Promise<{ ok: boolean; message?: string } | null> {
  const identifiant = compte.identifiant.trim();
  const existant = await appel<CompteSupabase[]>("comptes", {
    requete: `?identifiant=eq.${encodeURIComponent(identifiant)}&select=identifiant`,
  });
  if (existant && existant.length > 0) {
    return { ok: false, message: "Cet identifiant est déjà inscrit dans la base du sol." };
  }
  const cree = await appel<CompteSupabase[]>("comptes", {
    methode: "POST",
    corps: {
      identifiant,
      role: compte.role,
      empreinte: await empreinte(identifiant, compte.motDePasse),
      profil: compte.profil ?? {},
    },
  });
  return cree ? { ok: true } : { ok: false, message: "La base du sol n'a pas accepté l'inscription." };
}

/** Vérifie un couple identifiant / mot de passe auprès de la base du sol. */
export async function connexionSupabase(
  identifiant: string,
  motDePasse: string,
): Promise<{ ok: boolean; compte?: CompteSupabase; message?: string } | null> {
  const trouves = await appel<CompteSupabase[]>("comptes", {
    requete: `?identifiant=eq.${encodeURIComponent(identifiant.trim())}&select=*`,
  });
  if (!trouves) return null;
  if (trouves.length === 0) return { ok: false, message: "Aucun compte sous cet identifiant." };
  const compte = trouves[0];
  if (compte.empreinte !== (await empreinte(compte.identifiant, motDePasse))) {
    return { ok: false, message: "Mot de passe incorrect." };
  }
  return { ok: true, compte };
}

/* --------------------------------------------------------------- consignes -- */

export type ConsigneSupabase = {
  id: number;
  destinataire: string;
  texte: string;
  mise_en_file: string;
  etat: "attente" | "transmise" | "lue";
  cree_le: string;
  lue_le: string | null;
};

export const consignesSupabase = () =>
  appel<ConsigneSupabase[]>("consignes", { requete: "?select=*&order=cree_le.desc&limit=200" });

export const ecrireConsigneSupabase = (destinataire: string, texte: string, miseEnFile: string) =>
  appel<ConsigneSupabase[]>("consignes", {
    methode: "POST",
    corps: { destinataire, texte, mise_en_file: miseEnFile },
  });

export const marquerConsigneSupabase = (id: number, etat: string) =>
  appel<ConsigneSupabase[]>("consignes", {
    methode: "PATCH",
    requete: `?id=eq.${id}`,
    corps: etat === "lue" ? { etat, lue_le: new Date().toISOString() } : { etat },
  });

/* ---------------------------------------------------------------- mesures --- */

export type MesureSupabase = {
  membre: string;
  capteur: string;
  parametre: string;
  valeur: string;
  unite: string;
  statut: string;
  date_utc: string;
};

export const mesuresSupabase = (membre?: string) =>
  appel<MesureSupabase[]>("mesures", {
    requete: `?select=*${membre ? `&membre=eq.${encodeURIComponent(membre)}` : ""}&order=date_utc.desc&limit=200`,
  });

/** Transmission d'un lot de mesures au sol : c'est la fenêtre de communication. */
export const transmettreMesuresSupabase = (lot: MesureSupabase[]) =>
  appel<MesureSupabase[]>("mesures", { methode: "POST", corps: lot });
