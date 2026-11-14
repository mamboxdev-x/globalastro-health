import type { Metric } from "@/data/missionData";

export type { Metric } from "@/data/missionData";

function Sparkline({ points, status, label }: { points: number[]; status: Metric["status"]; label: string }) {
  const width = 240;
  const height = 58;
  const safePoints = points.filter(Number.isFinite);
  const min = Math.min(...safePoints);
  const max = Math.max(...safePoints);
  const span = max - min || 1;
  const coordinates = safePoints.map((point, index) => {
    const x = safePoints.length > 1 ? (index / (safePoints.length - 1)) * width : width;
    const y = height - 8 - ((point - min) / span) * (height - 18);
    return { x: x.toFixed(1), y: y.toFixed(1) };
  });
  const polylinePoints = coordinates.map(({ x, y }) => `${x},${y}`).join(" ");
  const last = coordinates[coordinates.length - 1] ?? { x: String(width), y: "29" };

  if (safePoints.length === 0) {
    return <div className="no-data-chart">AUCUNE SÉRIE DE DÉMONSTRATION DISPONIBLE</div>;
  }

  return (
    <div className="chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label} : tendance illustrative sur ${safePoints.length} points, sans mesure de capteur réel`}
      >
        <line x1="0" y1="12" x2={width} y2="12" className="chart-grid" />
        <line x1="0" y1="29" x2={width} y2="29" className="chart-grid" />
        <line x1="0" y1="46" x2={width} y2="46" className="chart-grid" />
        <polyline points={polylinePoints} className={`chart-line ${status}`} />
        <circle cx={last.x} cy={last.y} r="3" className={`chart-dot ${status}`} />
      </svg>
      <div className="chart-labels"><span>POINT 1</span><span>DERNIER POINT</span></div>
    </div>
  );
}

export default function MetricCard({ metric, index }: { metric: Metric; index: number }) {
  return (
    <article className={`metric-card metric-${index + 1}`} aria-labelledby={`metric-${metric.id}`}>
      <div className="card-header">
        <div>
          <p className="metric-label" id={`metric-${metric.id}`}>{metric.label}</p>
          <p className="sensor-id">INDICATEUR {metric.id}</p>
        </div>
        <div className={`status-pill ${metric.status}`}>
          <span className="status-dot" />
          {metric.statusLabel}
        </div>
      </div>

      <div className="metric-reading">
        <span className="measurement-label">VALEUR DE DÉMONSTRATION</span>
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
        <span>TENDANCE ILLUSTRATIVE</span>
        <span>HISTORIQUE DE DÉMO</span>
      </div>
      {metric.points ? (
        <Sparkline points={metric.points} status={metric.status} label={metric.label} />
      ) : (
        <div className="no-data-chart">AUCUNE SÉRIE DISPONIBLE</div>
      )}
    </article>
  );
}
