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

/* --------------------------------------------------------------- sonde ----- */

export type EtatBackend = { bord: boolean; sol: boolean; mode: "live" | "demo" };

/**
 * La sonde n'est active que si un backend est réellement joignable :
 * soit les adresses sont fournies au moment de la compilation, soit la page
 * tourne en local (démonstration hors ligne sur un portable).
 * Sur le site en ligne sans backend configuré, aucune requête n'est tentée :
 * la console du navigateur reste propre.
 */
const hoteLocal =
  typeof window !== "undefined" && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);

export const SONDE_ACTIVE = Boolean(env.VITE_GATEWAY_URL || env.VITE_GROUND_URL) || hoteLocal;

/** Interroge les deux services : sert à savoir si l'interface parle au vrai backend. */
export async function sonderBackend(): Promise<EtatBackend> {
  if (!SONDE_ACTIVE) return { bord: false, sol: false, mode: "demo" };
  const [bord, sol] = await Promise.all([lienBord(), equipageSol()]);
  return { bord: bord !== null, sol: sol !== null, mode: bord !== null || sol !== null ? "live" : "demo" };
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
