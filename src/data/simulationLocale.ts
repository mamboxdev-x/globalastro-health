import { useEffect, useState } from "react";
import type { MesureModule } from "@/data/api";

/**
 * Simulation locale de démonstration.
 *
 * Sans module central joignable, l'interface restait figée : les chiffres ne bougeaient
 * jamais. Ces valeurs sont donc fabriquées dans le navigateur — une marche aléatoire autour
 * d'une référence — avec les mêmes seuils que le module central, et elles sont annoncées
 * comme telles à l'écran : ce ne sont pas des mesures.
 */

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
  { parametre: "poids", capteur: "Balance", unite: "kg", base: 71.8, amplitude: 0.3, decimales: 2, fixe: true },
  { parametre: "sommeil_duree", capteur: "Bracelet", unite: "h", base: 6.2, amplitude: 0.35, decimales: 2, fixe: true },
  { parametre: "sommeil_efficacite", capteur: "Bracelet", unite: "%", base: 84.5, amplitude: 2.5, decimales: 1, fixe: true },
  { parametre: "sommeil_profond", capteur: "Bracelet", unite: "min", base: 88, amplitude: 7, decimales: 0, fixe: true },
  { parametre: "CRP", capteur: "Laboratoire", unite: "mg/L", base: 1.8, amplitude: 0.4, decimales: 2, fixe: true },
  { parametre: "calcium", capteur: "Laboratoire", unite: "mmol/L", base: 2.38, amplitude: 0.05, decimales: 2, fixe: true },
  { parametre: "vitamine_D", capteur: "Laboratoire", unite: "ng/mL", base: 34, amplitude: 1.5, decimales: 1, fixe: true },
];

/** Mêmes seuils que le module central : les pastilles veulent dire la même chose des deux côtés. */
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

function statut(parametre: string, valeur: number): string {
  const seuil = SEUILS[parametre];
  if (!seuil) return "info";
  const [[nominalMin, nominalMax], [critiqueMin, critiqueMax]] = seuil;
  if (valeur >= nominalMin && valeur <= nominalMax) return "nominal";
  if (valeur >= critiqueMin && valeur <= critiqueMax) return "attention";
  return "critique";
}

const PROFONDEUR = 120;

export function useSimulationLocale(actif: boolean, cadence = 1_600) {
  const [dernier, setDernier] = useState<Record<string, MesureModule>>({});
  const [historique, setHistorique] = useState<Record<string, MesureModule[]>>({});

  useEffect(() => {
    if (!actif) {
      setDernier({});
      setHistorique({});
      return;
    }
    let vivant = true;
    const courant: Record<string, number> = {};
    for (const reference of REFERENCES) courant[reference.parametre] = reference.base;

    const pas = (decalageMs = 0) => {
      const maintenant = new Date(Date.now() - decalageMs).toISOString();
      const lot: Record<string, MesureModule> = {};

      for (const reference of REFERENCES) {
        const cible = reference.base + (Math.random() - 0.5) * 2 * reference.amplitude;
        // lissage léger : la valeur dérive au lieu de sauter d'un point à l'autre, mais reste vivante
        courant[reference.parametre] = courant[reference.parametre] * 0.55 + cible * 0.45;
        const arrondie = Number(courant[reference.parametre].toFixed(reference.decimales));

        lot[reference.parametre] = {
          date_utc: maintenant,
          capteur: reference.capteur,
          parametre: reference.parametre,
          valeur: arrondie.toFixed(reference.decimales),
          unite: reference.unite,
          mode: reference.fixe ? "fixe" : "variable",
          statut: statut(reference.parametre, arrondie),
        };
      }

      setDernier(lot);
      setHistorique((actuel) => {
        const suivant: Record<string, MesureModule[]> = { ...actuel };
        for (const [cle, mesure] of Object.entries(lot)) {
          suivant[cle] = [...(suivant[cle] ?? []), mesure].slice(-PROFONDEUR);
        }
        return suivant;
      });
    };

    // amorçage : la courbe a déjà de l'allure quand l'écran s'ouvre
    for (let index = 40; index > 0; index -= 1) pas(index * cadence);
    const minuteur = window.setInterval(pas, cadence);

    return () => {
      vivant = false;
      window.clearInterval(minuteur);
    };
  }, [actif, cadence]);

  return { dernier, pointsPour: (parametre: string) => historique[parametre] ?? [] };
}
