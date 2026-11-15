import { useEffect, useState } from "react";
import { ADRESSE_MODULE, SONDE_ACTIVE, type MesureModule } from "@/data/api";
import { SUPABASE_CONFIGURE, transmettreMesuresSupabase, type MesureSupabase } from "@/data/supabase";

/**
 * Simulation partagée de l'équipage.
 *
 * Un seul générateur alimente les deux interfaces : ce que le médecin lit chez un membre est
 * exactement ce que ce membre voit sur son propre tableau de bord. Sans cela, chaque écran
 * fabriquait ses chiffres de son côté, et les deux versions se contredisaient.
 *
 * Quand le module central répond (receiver.py + capteurs.py), ce sont ses mesures qui passent
 * pour le commandant : la simulation ne sert alors qu'aux deux autres membres.
 */

export type ProfilMembre = { poidsKg: number; tailleM: number; sexe: "H" | "F" };

export type MembreSimule = {
  id: string;
  nom: string;
  initiales: string;
  fonction: string;
  profil: ProfilMembre;
  mesures: Record<string, MesureModule>;
  historique: Record<string, MesureModule[]>;
  source: "module" | "simulation";
};

type Reference = {
  parametre: string;
  capteur: string;
  unite: string;
  base: number;
  amplitude: number;
  decimales: number;
  fixe?: boolean;
};

const REFERENCES: Reference[] = [
  { parametre: "frequence_cardiaque", capteur: "MAX30102", unite: "bpm", base: 68, amplitude: 7, decimales: 0 },
  { parametre: "SpO2", capteur: "MAX30102", unite: "%", base: 97.4, amplitude: 0.9, decimales: 1 },
  { parametre: "temperature_corporelle", capteur: "MAX30205", unite: "°C", base: 36.72, amplitude: 0.22, decimales: 2 },
  { parametre: "frequence_respiratoire", capteur: "Ceinture", unite: "resp/min", base: 15.2, amplitude: 2.4, decimales: 1 },
  { parametre: "debit_cardiaque", capteur: "Omron", unite: "L/min", base: 5.1, amplitude: 0.7, decimales: 2 },
  { parametre: "pression_systolique", capteur: "Omron", unite: "mmHg", base: 118, amplitude: 7, decimales: 0 },
  { parametre: "pression_diastolique", capteur: "Omron", unite: "mmHg", base: 74, amplitude: 5, decimales: 0 },
  { parametre: "co2", capteur: "MH-Z19", unite: "ppm", base: 735, amplitude: 90, decimales: 0 },
  { parametre: "dose_radiation", capteur: "Dosimetre", unite: "mSv/j", base: 0.62, amplitude: 0.14, decimales: 3 },
  { parametre: "activite_electrodermale", capteur: "GSR", unite: "µS", base: 3.6, amplitude: 0.8, decimales: 2 },
  { parametre: "t_score", capteur: "DEXA", unite: "écart-type", base: -1.5, amplitude: 0.03, decimales: 2, fixe: true },
  { parametre: "densite_osseuse_bmd", capteur: "DEXA", unite: "g/cm²", base: 1.02, amplitude: 0.02, decimales: 3, fixe: true },
  { parametre: "perte_osseuse_totale", capteur: "Calcul", unite: "%", base: 6.7, amplitude: 0.05, decimales: 2, fixe: true },
  { parametre: "force_main_droite", capteur: "Jamar", unite: "kg", base: 46.2, amplitude: 1.6, decimales: 1 },
  { parametre: "force_main_gauche", capteur: "Jamar", unite: "kg", base: 42.8, amplitude: 1.5, decimales: 1 },
  { parametre: "masse_maigre", capteur: "InBody", unite: "kg", base: 57.4, amplitude: 0.2, decimales: 2, fixe: true },
  { parametre: "masse_grasse", capteur: "InBody", unite: "%", base: 22.4, amplitude: 0.3, decimales: 1, fixe: true },
  { parametre: "poids", capteur: "Balance", unite: "kg", base: 71.8, amplitude: 0.3, decimales: 2, fixe: true },
  { parametre: "sommeil_duree", capteur: "Bracelet", unite: "h", base: 6.2, amplitude: 0.5, decimales: 2, fixe: true },
  { parametre: "sommeil_efficacite", capteur: "Bracelet", unite: "%", base: 84.5, amplitude: 3, decimales: 1, fixe: true },
  { parametre: "sommeil_profond", capteur: "Bracelet", unite: "min", base: 88, amplitude: 9, decimales: 0, fixe: true },
  { parametre: "sommeil_REM", capteur: "Bracelet", unite: "%", base: 19, amplitude: 2, decimales: 0, fixe: true },
  { parametre: "CRP", capteur: "Laboratoire", unite: "mg/L", base: 1.8, amplitude: 0.4, decimales: 2, fixe: true },
  { parametre: "calcium", capteur: "Laboratoire", unite: "mmol/L", base: 2.38, amplitude: 0.05, decimales: 2, fixe: true },
  { parametre: "vitamine_D", capteur: "Laboratoire", unite: "ng/mL", base: 34, amplitude: 1.5, decimales: 1, fixe: true },
];

/** Mêmes seuils que le module central : une pastille veut dire la même chose des deux côtés. */
const SEUILS: Record<string, [[number, number], [number, number]]> = {
  frequence_cardiaque: [[50, 100], [40, 130]],
  SpO2: [[95, 100], [90, 100]],
  temperature_corporelle: [[36.0, 37.5], [35.0, 38.0]],
  frequence_respiratoire: [[12, 20], [8, 25]],
  co2: [[0, 1000], [0, 1500]],
  dose_radiation: [[0, 0.8], [0, 1.2]],
  pression_systolique: [[90, 130], [80, 160]],
  pression_diastolique: [[60, 85], [50, 100]],
  debit_cardiaque: [[4, 8], [3, 10]],
  t_score: [[-1.0, 99], [-2.5, 99]],
  force_main_droite: [[27, 999], [16, 999]],
  force_main_gauche: [[27, 999], [16, 999]],
  calcium: [[2.2, 2.6], [2.0, 2.8]],
  vitamine_D: [[30, 60], [20, 100]],
  CRP: [[0, 5], [0, 10]],
};

/** Noms lisibles des paramètres : les deux interfaces s'en servent, la source est ici. */
export const LIBELLES_PARAMETRES: Record<string, string> = {
  frequence_cardiaque: "Fréquence cardiaque",
  frequence_respiratoire: "Fréquence respiratoire",
  temperature_corporelle: "Température corporelle",
  SpO2: "Saturation en oxygène",
  co2: "CO₂ de cabine",
  dose_radiation: "Dose de radiation",
  debit_cardiaque: "Débit cardiaque",
  pression_systolique: "Pression systolique",
  pression_diastolique: "Pression diastolique",
  t_score: "Score T (DEXA)",
  densite_osseuse_bmd: "Densité minérale osseuse",
  perte_osseuse_totale: "Perte osseuse depuis 2023",
  force_main_droite: "Force de préhension · droite",
  force_main_gauche: "Force de préhension · gauche",
  masse_maigre: "Masse maigre",
  masse_grasse: "Masse grasse",
  sommeil_duree: "Durée de sommeil",
  sommeil_efficacite: "Efficacité du sommeil",
  sommeil_profond: "Sommeil profond",
  sommeil_REM: "Sommeil paradoxal",
  calcium: "Calcium",
  vitamine_D: "Vitamine D",
  CRP: "Protéine C-réactive",
  poids: "Poids",
  impedance: "Impédance",
  activite_electrodermale: "Activité électrodermale",
};

/** Plage nominale d'un paramètre, écrite comme le module l'applique. */
export function plageNominale(parametre: string): string {
  const seuil = SEUILS[parametre];
  if (!seuil) return "—";
  const [[min, max]] = seuil;
  return `${min} – ${max}`;
}

export function statutMesure(parametre: string, valeur: number): string {
  const seuil = SEUILS[parametre];
  if (!seuil) return "info";
  const [[nominalMin, nominalMax], [critiqueMin, critiqueMax]] = seuil;
  if (valeur >= nominalMin && valeur <= nominalMax) return "nominal";
  if (valeur >= critiqueMin && valeur <= critiqueMax) return "attention";
  return "critique";
}

/** Le pire statut d'un membre : c'est lui qui colore sa ligne chez le médecin. */
export function gravite(mesures: Record<string, MesureModule>): "critique" | "attention" | "nominal" {
  const statuts = Object.values(mesures).map((mesure) => mesure.statut);
  if (statuts.includes("critique")) return "critique";
  if (statuts.includes("attention")) return "attention";
  return "nominal";
}

/** Le nombre de paramètres hors plage nominale : sert d'alarme sur la ligne du membre. */
export function horsPlage(mesures: Record<string, MesureModule>): { critiques: string[]; aSuivre: string[] } {
  const entrees = Object.entries(mesures);
  return {
    critiques: entrees.filter(([, mesure]) => mesure.statut === "critique").map(([cle]) => cle),
    aSuivre: entrees.filter(([, mesure]) => mesure.statut === "attention").map(([cle]) => cle),
  };
}

type ProfilSimule = {
  id: string;
  nom: string;
  initiales: string;
  fonction: string;
  profil: ProfilMembre;
  ecarts: Record<string, number>;
};

/** Les trois membres de la station, avec leur propre physiologie. */
export const EQUIPAGE_SIMULE: ProfilSimule[] = [
  {
    id: "cdr.mbaye",
    nom: "Cmdt Mbaye",
    initiales: "MB",
    fonction: "Commandant",
    profil: { poidsKg: 78, tailleM: 1.82, sexe: "H" },
    ecarts: {},
  },
  {
    id: "ing.kouassi",
    nom: "Ing. Kouassi",
    initiales: "KP",
    fonction: "Ingénieur de vol",
    profil: { poidsKg: 71, tailleM: 1.76, sexe: "H" },
    ecarts: { frequence_cardiaque: 7, pression_systolique: 6, temperature_corporelle: 0.18, co2: -60 },
  },
  {
    id: "dr.aminata",
    nom: "Dr Aminata S.",
    initiales: "AS",
    fonction: "Spécialiste de mission",
    profil: { poidsKg: 63, tailleM: 1.68, sexe: "F" },
    ecarts: {
      frequence_cardiaque: -5,
      dose_radiation: 0.1,
      sommeil_duree: -0.9,
      t_score: -0.45,
      force_main_droite: -5,
      force_main_gauche: -6,
    },
  },
];

const CADENCE = 1_600;
const PROFONDEUR = 120;
const TOUS_LES_COMBINE = 6; // on redemande le module tous les 6 pas, soit ~10 s
const TOUS_LES_ENVOIS = 19; // et on transmet au sol toutes les ~30 s : la fenêtre de communication

/** Paramètres transmis au sol : les mêmes que ceux du journal du médecin. */
const PARAMETRES_TRANSMIS = [
  "frequence_cardiaque",
  "SpO2",
  "temperature_corporelle",
  "frequence_respiratoire",
  "pression_systolique",
  "pression_diastolique",
  "debit_cardiaque",
  "dose_radiation",
  "t_score",
  "force_main_droite",
  "CRP",
  "sommeil_duree",
  "co2",
];

export type EtatSimulation = { membres: MembreSimule[]; moduleActif: boolean };

let etat: EtatSimulation | null = null;
let minuteur: number | null = null;
let pasCourant = 0;
const abonnes = new Set<(valeur: EtatSimulation) => void>();
let snapshotModule: Record<string, MesureModule> | null = null;
let moduleAbandonne = false;

const ID_COMMANDANT = EQUIPAGE_SIMULE[0].id;

function estFixe(parametre: string): boolean {
  return REFERENCES.find((reference) => reference.parametre === parametre)?.fixe ?? false;
}

/** Hachage stable : même entrée, même sortie, d'une session à l'autre. */
function hachage(texte: string, seau: number): number {
  let valeur = 2166136261 ^ Math.imul(seau, 2246822519);
  for (let index = 0; index < texte.length; index += 1) {
    valeur ^= texte.charCodeAt(index);
    valeur = Math.imul(valeur, 16777619);
  }
  valeur ^= valeur >>> 13;
  return ((valeur >>> 0) % 100_000) / 100_000;
}

/**
 * Bruit déterministe : la valeur d'un paramètre ne dépend que du membre, du paramètre et de
 * l'instant. Deux sessions ouvertes à la même minute affichent donc les mêmes nombres, et le
 * poste sol ne peut pas contredire le tableau de bord du membre.
 */
function bruit(texte: string, seau: number): number {
  return (hachage(texte, seau) + hachage(texte, seau + 7_919) + hachage(texte, seau + 104_729)) / 3;
}

function valeurDe(membre: ProfilSimule, reference: Reference, instant: number): number {
  const ecart = membre.ecarts[reference.parametre] ?? 0;
  // un examen (DEXA, sommeil, laboratoire) ne change pas d'une minute à l'autre
  const seau = reference.fixe ? 0 : Math.floor(instant / CADENCE);
  const derive = (bruit(`${membre.id}|${reference.parametre}`, seau) - 0.5) * 2 * reference.amplitude;
  return Number((reference.base + ecart + derive).toFixed(reference.decimales));
}

function construireMembre(
  membre: ProfilSimule,
  precedent: MembreSimule | undefined,
  horodatage: string,
  instant: number,
): MembreSimule {
  const mesures: Record<string, MesureModule> = {};
  const historique: Record<string, MesureModule[]> = { ...(precedent?.historique ?? {}) };
  const duModule = membre.id === ID_COMMANDANT && snapshotModule !== null;

  for (const reference of REFERENCES) {
    const mesureModule = duModule ? snapshotModule?.[reference.parametre] : undefined;
    if (mesureModule) {
      mesures[reference.parametre] = { ...mesureModule };
      continue;
    }
    const valeur = valeurDe(membre, reference, instant);
    mesures[reference.parametre] = {
      date_utc: horodatage,
      capteur: reference.capteur,
      parametre: reference.parametre,
      valeur: valeur.toFixed(reference.decimales),
      unite: reference.unite,
      mode: reference.fixe ? "fixe" : "variable",
      statut: statutMesure(reference.parametre, valeur),
    };
  }

  for (const [parametre, mesure] of Object.entries(mesures)) {
    // les paramètres fixes (DEXA, sommeil, laboratoire) ne bougent pas : un seul point suffit
    if (estFixe(parametre) && historique[parametre]?.length) continue;
    historique[parametre] = [...(historique[parametre] ?? []), mesure].slice(-PROFONDEUR);
  }

  return {
    id: membre.id,
    nom: membre.nom,
    initiales: membre.initiales,
    fonction: membre.fonction,
    profil: membre.profil,
    mesures,
    historique,
    source: duModule ? "module" : "simulation",
  };
}

function publier(suivant: EtatSimulation) {
  etat = suivant;
  for (const abonne of abonnes) abonne(suivant);
}

function pas(decalageMs = 0) {
  const instant = Date.now() - decalageMs;
  const horodatage = new Date(instant).toISOString();
  const precedents = etat?.membres ?? [];
  const membres = EQUIPAGE_SIMULE.map((membre) =>
    construireMembre(membre, precedents.find((connu) => connu.id === membre.id), horodatage, instant),
  );
  publier({ membres, moduleActif: snapshotModule !== null });
}

async function interrogerModule() {
  if (!SONDE_ACTIVE) return;
  try {
    const reponse = await fetch(`${ADRESSE_MODULE}/derniere`, { signal: AbortSignal.timeout(2_500) });
    if (!reponse.ok) throw new Error("module indisponible");
    const donnees = (await reponse.json()) as Record<string, MesureModule>;
    snapshotModule = Object.keys(donnees).length ? donnees : null;
  } catch {
    snapshotModule = null;
    // le module ne répond pas ici : inutile de redemander à chaque tour
    moduleAbandonne = true;
  }
}

/**
 * Transmission au sol, à la fenêtre de communication : c'est le seul moment où les mesures
 * quittent le bord. Le lot part d'un coup, pour les trois membres à la fois.
 */
async function transmettreAuSol() {
  const membres = etat?.membres ?? [];
  if (!membres.length) return;
  const lot: MesureSupabase[] = membres.flatMap((membre) =>
    PARAMETRES_TRANSMIS.flatMap((parametre) => {
      const mesure = membre.mesures[parametre];
      if (!mesure) return [];
      return [
        {
          membre: membre.id,
          capteur: mesure.capteur,
          parametre,
          valeur: mesure.valeur,
          unite: mesure.unite,
          statut: mesure.statut,
          date_utc: mesure.date_utc,
        },
      ];
    }),
  );
  if (lot.length) await transmettreMesuresSupabase(lot);
}

export function demarrerSimulation() {
  if (typeof window === "undefined" || minuteur !== null) return;
  // amorçage : les courbes ont déjà de l'allure quand l'écran s'ouvre
  for (let index = 40; index > 0; index -= 1) pas(index * CADENCE);

  minuteur = window.setInterval(() => {
    pasCourant += 1;
    if (pasCourant % TOUS_LES_COMBINE === 0 && !moduleAbandonne) void interrogerModule();
    if (SUPABASE_CONFIGURE && pasCourant % TOUS_LES_ENVOIS === 0) void transmettreAuSol();
    pas();
  }, CADENCE);

  void interrogerModule();
}

/** L'équipage simulé, partagé par les deux interfaces. */
export function useEquipageSimule(): EtatSimulation {
  const [valeur, setValeur] = useState<EtatSimulation>(() => etat ?? { membres: [], moduleActif: false });

  useEffect(() => {
    demarrerSimulation();
    abonnes.add(setValeur);
    if (etat) setValeur(etat);
    return () => {
      abonnes.delete(setValeur);
    };
  }, []);

  return valeur;
}

/** Le membre correspondant à l'identifiant connecté, ou le commandant à défaut. */
export function membrePour(membres: MembreSimule[], identifiant: string): MembreSimule | undefined {
  const cherche = identifiant.trim().toLowerCase();
  return membres.find((membre) => membre.id === cherche) ?? membres[0];
}
