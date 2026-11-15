/**
 * Façade vers le backend AstroPulse (passerelle à bord + poste sol).
 *
 * Principe : chaque appel renvoie `null` en cas d'échec (service éteint, réseau
 * coupé, délai dépassé). Les écrans gardent alors leurs données de démonstration :
 * la démonstration ne peut pas casser parce qu'un service n'est pas lancé.
 *
 * Adresses configurables par variables d'environnement Vite :
 *   VITE_GATEWAY_URL  (défaut http://localhost:8000)
 *   VITE_GROUND_URL   (défaut http://localhost:9000)
 *   VITE_ASTRO_PIN    (défaut 1234)
 *   VITE_DOCTOR_PIN   (défaut doctor)
 */

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

export const ADRESSE_BORD = env.VITE_GATEWAY_URL ?? "http://localhost:8000";
export const ADRESSE_SOL = env.VITE_GROUND_URL ?? "http://localhost:9000";
/** Module central HELIX (receiver.py) : capteurs simulés, seuils, base CSV. */
export const ADRESSE_MODULE = env.VITE_HELIX_URL ?? "http://localhost:8000";
const PIN_ASTRO = env.VITE_ASTRO_PIN ?? "1234";
const PIN_MEDECIN = env.VITE_DOCTOR_PIN ?? "doctor";

const ENTETES_ASTRO: Record<string, string> = { "X-PIN": PIN_ASTRO };
const ENTETES_MEDECIN: Record<string, string> = { "X-PIN": PIN_MEDECIN };

export type Gravite = "ok" | "warning" | "critical";

export type LienBord = {
  enabled: boolean;
  last_ok: string | null;
  last_error: string | null;
  pending_rows: number;
};

export type AlerteBord = {
  id: number;
  sensor: string | null;
  kind: string;
  severity: Gravite;
  message: string;
  ts: string;
  acknowledged: number;
};

export type CapteurBord = {
  label: string;
  unit: string;
  decimals: number;
  value: number;
  ts: string;
  age_s: number;
  stale: boolean;
  status: Gravite;
  baseline?: number | null;
  shift_pct?: number | null;
};

export type MesuresBord = { astronaut: string; sensors: Record<string, CapteurBord> };

export type MessageBord = { id: number; text: string; ts: string; read: number };

export type MembreSol = {
  id: string;
  last_seen: string;
  minutes_since: number;
  status: Gravite | "silent";
  alerts_24h: number;
  latest: Record<string, { value: number; at: string }>;
};

export type SerieSol = {
  label: string;
  unit: string;
  decimals: number;
  daily: { d: string; v: number; lo: number; hi: number }[];
  hourly: { h: string; v: number }[];
  baseline: number | null;
  recent: number | null;
  shift_pct: number | null;
};

export type DetailSol = {
  astronaut: string;
  sensors: Record<string, SerieSol>;
  alerts: { id: number; sensor: string | null; severity: Gravite; message: string; ts: string }[];
};

export type MessageSol = { id: number; text: string; ts: string; status: "sent" | "delivered" | "read" };

async function appel<T>(
  base: string,
  chemin: string,
  entetes: Record<string, string>,
  options: { methode?: string; corps?: unknown; delai?: number } = {},
): Promise<T | null> {
  const { methode = "GET", corps, delai = 3000 } = options;
  if (typeof window === "undefined" || typeof window.fetch !== "function") return null;

  const controle = new AbortController();
  const minuteur = window.setTimeout(() => controle.abort(), delai);
  try {
    const reponse = await fetch(`${base}${chemin}`, {
      method: methode,
      headers: corps ? { ...entetes, "Content-Type": "application/json" } : entetes,
      body: corps ? JSON.stringify(corps) : undefined,
      signal: controle.signal,
    });
    if (!reponse.ok) return null;
    return (await reponse.json()) as T;
  } catch {
    return null;
  } finally {
    window.clearTimeout(minuteur);
  }
}

/* ------------------------------------------------------------------ bord --- */

export const lienBord = () => appel<LienBord>(ADRESSE_BORD, "/api/link-status", ENTETES_ASTRO);
export const mesuresBord = () => appel<MesuresBord>(ADRESSE_BORD, "/api/latest", ENTETES_ASTRO);
export const alertesBord = () => appel<AlerteBord[]>(ADRESSE_BORD, "/api/alerts", ENTETES_ASTRO);
export const messagesBord = () => appel<MessageBord[]>(ADRESSE_BORD, "/api/messages", ENTETES_ASTRO);

export const acquitterAlerteBord = (id: number) =>
  appel<{ ok: boolean }>(ADRESSE_BORD, `/api/alerts/${id}/ack`, ENTETES_ASTRO, { methode: "POST" });

export const lireMessageBord = (id: number) =>
  appel<{ ok: boolean }>(ADRESSE_BORD, `/api/messages/${id}/ack`, ENTETES_ASTRO, { methode: "POST" });

/* ------------------------------------------------------------------ sol ---- */

export const equipageSol = () => appel<MembreSol[]>(ADRESSE_SOL, "/api/astronauts", ENTETES_MEDECIN);
export const detailSol = (astronaute: string, jours = 14) =>
  appel<DetailSol>(ADRESSE_SOL, `/api/astronauts/${encodeURIComponent(astronaute)}?days=${jours}`, ENTETES_MEDECIN);
export const lienSol = () => appel<{ last_sync: string | null }>(ADRESSE_SOL, "/api/link", ENTETES_MEDECIN);
export const messagesSol = (astronaute: string) =>
  appel<MessageSol[]>(ADRESSE_SOL, `/api/messages?astronaut=${encodeURIComponent(astronaute)}`, ENTETES_MEDECIN);

export const envoyerConsigneSol = (astronaute: string, texte: string) =>
  appel<{ id: number; status: string }>(ADRESSE_SOL, "/api/messages", ENTETES_MEDECIN, {
    methode: "POST",
    corps: { astronaut_id: astronaute, text: texte },
  });

export type MessageSolEtiquette = MessageSol & { astronaut_id: string };

/**
 * Les messages de tous les destinataires en un seul lot. Sans ça, l'écran n'interroge
 * que le destinataire sélectionné : les consignes adressées aux autres disparaissent
 * dès qu'on change de destinataire.
 */
export async function messagesSolTous(astronautes: string[]): Promise<MessageSolEtiquette[]> {
  if (astronautes.length === 0) return [];
  const lots = await Promise.all(
    astronautes.map(async (astronaute) => {
      const messages = await messagesSol(astronaute);
      return (messages ?? []).map((message) => ({ ...message, astronaut_id: astronaute }));
    }),
  );
  return lots.flat().sort((a, b) => (a.ts < b.ts ? 1 : -1));
}

/* --------------------------------------------------------------- sonde ----- */

/* --------------------------------------------------- module central ------- */

export type MesureModule = {
  date_utc: string;
  capteur: string;
  parametre: string;
  valeur: string;
  unite: string;
  mode: string;
  statut: string;
};

export type HistoriqueModule = { parametre: string | null; nombre: number; points: MesureModule[] };

export const moduleSante = () => appel<{ ok: boolean }>(ADRESSE_MODULE, "/sante", {});
export const moduleDerniere = () =>
  appel<Record<string, MesureModule>>(ADRESSE_MODULE, "/derniere", {}, { delai: 2500 });
export const moduleHistorique = (parametre: string, n = 120) =>
  appel<HistoriqueModule>(
    ADRESSE_MODULE,
    `/historique?parametre=${encodeURIComponent(parametre)}&n=${n}`,
    {},
    { delai: 3000 },
  );
export const moduleParametres = () => appel<string[]>(ADRESSE_MODULE, "/parametres", {});

/* --------------------------------------------------- comptes (module) ----- */

export type CompteModule = {
  identifiant: string;
  role: "astro" | "sol";
  profil?: Record<string, unknown>;
  cree_le?: string;
};

type ReponseCompte = { ok: boolean; compte?: CompteModule; erreur?: string };

/** Inscription dans la base du module central. Renvoie null si le module ne répond pas. */
export const inscrireCompteModule = (compte: {
  identifiant: string;
  role: string;
  motDePasse: string;
  profil?: unknown;
}) => appel<ReponseCompte>(ADRESSE_MODULE, "/astronautes", {}, { methode: "POST", corps: compte });

/** Vérification d'un identifiant et d'un mot de passe auprès de la base. */
export const connexionModule = (identifiant: string, motDePasse: string) =>
  appel<ReponseCompte>(ADRESSE_MODULE, "/connexion", {}, {
    methode: "POST",
    corps: { identifiant, motDePasse },
  });

export const astronautesModule = () => appel<CompteModule[]>(ADRESSE_MODULE, "/astronautes", {});

/* -------------------------------------------------- consignes (module) ---- */

export type ConsigneModule = {
  id: string;
  destinataire: string;
  texte: string;
  mise_en_file: string;
  etat: string;
  cree_le: string;
  lue_le: string;
};

export const consignesModule = () => appel<ConsigneModule[]>(ADRESSE_MODULE, "/consignes", {}, { delai: 2_500 });

export const envoyerConsigneModule = (destinataire: string, texte: string, miseEnFile: string) =>
  appel<{ ok: boolean; consigne?: ConsigneModule; erreur?: string }>(ADRESSE_MODULE, "/consignes", {}, {
    methode: "POST",
    corps: { destinataire, texte, mise_en_file: miseEnFile },
  });

export const etatConsigneModule = (id: string, etat: string) =>
  appel<{ ok: boolean }>(ADRESSE_MODULE, `/consignes/${id}/etat`, {}, { methode: "POST", corps: { etat } });

/* --------------------------------------------------------------- sonde ----- */

export type EtatBackend = { bord: boolean; sol: boolean; module: boolean; mode: "live" | "demo" };

/**
 * La sonde n'est active que si un backend est réellement joignable :
 * soit les adresses sont fournies au moment de la compilation, soit la page
 * tourne en local (démonstration hors ligne sur un portable).
 * Sur le site en ligne sans backend configuré, aucune requête n'est tentée :
 * la console du navigateur reste propre.
 */
const hoteLocal =
  typeof window !== "undefined" && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);

export const SONDE_ACTIVE = Boolean(env.VITE_GATEWAY_URL || env.VITE_GROUND_URL || env.VITE_HELIX_URL) || hoteLocal;

/** Interroge les trois services : sert à savoir si l'interface parle à du vrai matériel. */
export async function sonderBackend(): Promise<EtatBackend> {
  if (!SONDE_ACTIVE) return { bord: false, sol: false, module: false, mode: "demo" };
  const [bord, sol, module] = await Promise.all([lienBord(), equipageSol(), moduleSante()]);
  const vivant = bord !== null || sol !== null || module !== null;
  return { bord: bord !== null, sol: sol !== null, module: module !== null, mode: vivant ? "live" : "demo" };
}

/** Libellés lisibles pour l'interface. */
export const LIBELLE_GRAVITE: Record<Gravite, string> = {
  ok: "Nominal",
  warning: "À suivre",
  critical: "Critique",
};

export const LIBELLE_CAPTEUR: Record<string, string> = {
  heart_rate: "Fréquence cardiaque",
  temperature: "Température corporelle",
  spo2: "Saturation en oxygène",
};

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toISOString().slice(11, 19) + " UTC";
}
