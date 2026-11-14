export type Metric = {
  id: string;
  label: string;
  value: string;
  unit?: string;
  reference: string;
  status: "nominal" | "attention" | "unavailable";
  statusLabel: string;
  points?: number[];
};

export const dashboardMetrics: Metric[] = [
  {
    id: "HR-01",
    label: "FC REPOS",
    value: "58",
    unit: "bpm",
    reference: "61 bpm pré-vol",
    status: "nominal",
    statusLabel: "Nominal",
    points: [61, 60, 61, 60, 59, 60, 59, 58, 59, 58, 57, 58, 58, 58],
  },
  {
    id: "BP-02",
    label: "TENSION ARTÉRIELLE",
    value: "118/76",
    unit: "mmHg",
    reference: "120/80 mmHg pré-vol",
    status: "nominal",
    statusLabel: "Nominal",
    points: [120, 119, 121, 118, 119, 117, 120, 118, 119, 118, 117, 118, 118, 118],
  },
  {
    id: "BL-03",
    label: "PERTE OSSEUSE",
    value: "−1,4",
    unit: "% / 90j",
    reference: "0 % au jour 0",
    status: "attention",
    statusLabel: "Dégradation",
    points: [
      0, -0.08, -0.19, -0.27, -0.39, -0.48, -0.56, -0.71, -0.78, -0.9, -1.02, -1.1, -1.24, -1.4,
    ],
  },
  {
    id: "DMO-04",
    label: "DENSITÉ OSSEUSE",
    value: "NON RENS.",
    unit: "T-score",
    reference: "T-score J0 non renseigné",
    status: "unavailable",
    statusLabel: "Sans donnée",
  },
  {
    id: "VIS-05",
    label: "ACUITÉ VISUELLE",
    value: "NON RENS.",
    unit: "20/20",
    reference: "Mesure pré-vol requise",
    status: "unavailable",
    statusLabel: "Sans donnée",
  },
  {
    id: "SL-06",
    label: "DURÉE DE SOMMEIL",
    value: "6h 12",
    reference: "7h00 pré-vol",
    status: "attention",
    statusLabel: "Dégradation",
    points: [412, 405, 390, 388, 372, 405, 350, 396, 422, 378, 370, 365, 374, 372],
  },
  {
    id: "CO2-07",
    label: "CONCENTRATION CO₂",
    value: "NON RENS.",
    unit: "ppm",
    reference: "Référence mission non renseignée",
    status: "unavailable",
    statusLabel: "Sans donnée",
  },
  {
    id: "RAD-08",
    label: "EXPOSITION RADIATIONS",
    value: "0,62",
    unit: "mSv/j",
    reference: "0,58 mSv/j mission",
    status: "attention",
    statusLabel: "Dégradation",
    points: [54, 55, 56, 54, 57, 58, 57, 59, 58, 60, 59, 61, 62, 62],
  },
];

function Sparkline({ points, status }: { points: number[]; status: Metric["status"] }) {
  const width = 240;
  const height = 68;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const coords = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - 8 - ((point - min) / span) * (height - 20);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const last = coords.split(" ").at(-1)?.split(",") ?? ["240", "30"];

  return (
    <div className="chart" aria-label="Tendance sur 14 jours">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img">
        <line x1="0" y1="13" x2={width} y2="13" className="chart-grid" />
        <line x1="0" y1="34" x2={width} y2="34" className="chart-grid" />
        <line x1="0" y1="55" x2={width} y2="55" className="chart-grid" />
        <polyline points={coords} className={`chart-line ${status}`} />
        <circle cx={last[0]} cy={last[1]} r="3.5" className={`chart-dot ${status}`} />
      </svg>
      <div className="chart-labels">
        <span>J−13</span>
        <span>AUJ.</span>
      </div>
    </div>
  );
}

export default function MetricCard({ metric, index }: { metric: Metric; index: number }) {
  return (
    <article className={`metric-card metric-${index + 1}`}>
      <div className="card-header">
        <div>
          <p className="metric-label">{metric.label}</p>
          <p className="sensor-id">CAPTEUR {metric.id}</p>
        </div>
        <div className={`status-pill ${metric.status}`}>
          <span className="status-dot" />
          {metric.statusLabel}
        </div>
      </div>

      <div className="metric-reading">
        <span className="measurement-label">MESURE EN VOL</span>
        <span className={`metric-value ${metric.value.length > 6 ? "metric-value-text" : ""}`}>
          {metric.value}
        </span>
        {metric.unit && <span className="metric-unit">{metric.unit}</span>}
      </div>

      <div className="metric-detail">
        <span className={`detail-mark ${metric.status}`} />
        <span>RÉF. : {metric.reference}</span>
      </div>

      <div className="trend-heading">
        <span>TENDANCE 14 JOURS</span>
        <span>UTC</span>
      </div>
      {metric.points ? (
        <Sparkline points={metric.points} status={metric.status} />
      ) : (
        <div className="no-data-chart">AUCUNE SÉRIE EN VOL DISPONIBLE</div>
      )}
    </article>
  );
}
