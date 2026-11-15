export type Metric = {
  id: string;
  label: string;
  value: string;
  unit?: string;
  reference: string;
  status: "nominal" | "attention" | "critique" | "unavailable";
  statusLabel: string;
  points?: number[];
};

export const missionDay = 87;

export const sleepData = {
  referenceMinutes: 420,
  days: [
    { day: "J−6", duration: "6h28", minutes: 388 },
    { day: "J−5", duration: "6h12", minutes: 372 },
    { day: "J−4", duration: "6h45", minutes: 405 },
    { day: "J−3", duration: "5h50", minutes: 350 },
    { day: "J−2", duration: "6h36", minutes: 396 },
    { day: "J−1", duration: "7h02", minutes: 422 },
    { day: "J87", duration: "6h12", minutes: 372 },
  ],
} as const;

export const currentSleepMinutes = sleepData.days[sleepData.days.length - 1].minutes;
export const currentSleepDuration = sleepData.days[sleepData.days.length - 1].duration;
export const sleepDifferenceMinutes = currentSleepMinutes - sleepData.referenceMinutes;
export const sleepDifferencePercent =
  (sleepDifferenceMinutes / sleepData.referenceMinutes) * 100;

export const boneDensityData = {
  changePercent: -1.4,
  alertThresholdPercent: -2.0,
  points: [
    0, -0.08, -0.19, -0.27, -0.39, -0.48, -0.56, -0.71, -0.78, -0.9, -1.02, -1.1, -1.24,
    -1.32, -1.4,
  ],
} as const;

export const cardiovascularData = {
  cardiacOutputLitersPerMinute: [5.2, 5.1, 5.3, 5.0, 5.2, 5.1, 5.0, 5.2, 5.1, 5.0, 5.1, 5.0],
  systolicPressureMmHg: [119, 118, 121, 117, 120, 119, 118, 116, 119, 118, 117, 118],
  heartRateBpm: 58,
  hrvMs: 54,
  bloodPressure: { systolic: 118, diastolic: 76 },
} as const;

export const currentCardiacOutput = cardiovascularData.cardiacOutputLitersPerMinute[
  cardiovascularData.cardiacOutputLitersPerMinute.length - 1
];

export const dashboardMetrics: Metric[] = [
  {
    id: "HR-01",
    label: "FC AU REPOS",
    value: String(cardiovascularData.heartRateBpm),
    unit: "bpm",
    reference: "61 bpm · référence pré-vol",
    status: "nominal",
    statusLabel: "Nominal",
    points: [61, 60, 61, 60, 59, 60, 59, 58, 59, 58, 57, 58, 58, 58],
  },
  {
    id: "BP-02",
    label: "TENSION ARTÉRIELLE",
    value: `${cardiovascularData.bloodPressure.systolic}/${cardiovascularData.bloodPressure.diastolic}`,
    unit: "mmHg",
    reference: "120/80 mmHg · référence illustrative",
    status: "nominal",
    statusLabel: "Nominal",
    points: [120, 119, 121, 118, 119, 117, 120, 118, 119, 118, 117, 118, 118, 118],
  },
  {
    id: "BL-03",
    label: "VARIATION DMO",
    value: formatSignedPercent(boneDensityData.changePercent).replace(" %", ""),
    unit: "% / 90 j",
    reference: "−1,4 % par rapport au jour 0",
    status: "attention",
    statusLabel: "À surveiller",
    points: [...boneDensityData.points],
  },
  {
    id: "DMO-04",
    label: "T-SCORE OSSEUX",
    value: "NON RENS.",
    unit: "T-score",
    reference: "T-score initial non fourni",
    status: "unavailable",
    statusLabel: "Indisponible",
  },
  {
    id: "VIS-05",
    label: "ACUITÉ VISUELLE",
    value: "NON RENS.",
    unit: "échelle à préciser",
    reference: "Mesure initiale non fournie",
    status: "unavailable",
    statusLabel: "Indisponible",
  },
  {
    id: "SL-06",
    label: "DURÉE DE SOMMEIL",
    value: currentSleepDuration,
    reference: "7h00 · référence illustrative",
    status: "attention",
    statusLabel: "À surveiller",
    points: sleepData.days.map((entry) => entry.minutes),
  },
  {
    id: "CO2-07",
    label: "CONCENTRATION CO₂",
    value: "NON RENS.",
    unit: "ppm",
    reference: "Mesure atmosphérique non fournie",
    status: "unavailable",
    statusLabel: "Indisponible",
  },
  {
    id: "RAD-08",
    label: "EXPOSITION AUX RADIATIONS",
    value: "0,62",
    unit: "mSv/j",
    reference: "Valeur illustrative · seuil à définir",
    status: "unavailable",
    statusLabel: "Seuil non défini",
    points: [54, 55, 56, 54, 57, 58, 57, 59, 58, 60, 59, 61, 62, 62],
  },
];

export function formatSignedMinutes(minutes: number): string {
  const sign = minutes < 0 ? "−" : minutes > 0 ? "+" : "";
  const absolute = Math.abs(minutes);
  const hours = Math.floor(absolute / 60);
  const remainder = absolute % 60;
  return `${sign}${hours > 0 ? `${hours} h ` : ""}${remainder} min`;
}

export function formatSignedPercent(value: number): string {
  const sign = value < 0 ? "−" : value > 0 ? "+" : "";
  return `${sign}${Math.abs(value).toFixed(1).replace(".", ",")} %`;
}
