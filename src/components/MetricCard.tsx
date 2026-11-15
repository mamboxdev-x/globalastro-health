import type { Metric } from "@/data/missionData";

export type { Metric } from "@/data/missionData";

const TONE: Record<Metric["status"], { chip: string; ligne: string }> = {
  nominal: { chip: "is-ok", ligne: "nominal" },
  attention: { chip: "is-warn", ligne: "attention" },
  critique: { chip: "is-alert", ligne: "critical" },
  unavailable: { chip: "", ligne: "nominal" },
};

function Sparkline({ points, status, label }: { points: number[]; status: Metric["status"]; label: string }) {
  const safe = points.filter(Number.isFinite);
  if (safe.length === 0) {
    return <div className="u-chart-empty">Série non disponible</div>;
  }

  const width = 260;
  const height = 44;
  const min = Math.min(...safe);
  const max = Math.max(...safe);
  const span = max - min || 1;
  const coords = safe.map((point, index) => ({
    x: ((safe.length > 1 ? index / (safe.length - 1) : 1) * width).toFixed(1),
    y: (height - 5 - ((point - min) / span) * (height - 12)).toFixed(1),
  }));
  const last = coords[coords.length - 1];

  return (
    <svg
      className="u-chart"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Tendance sur ${safe.length} points — ${label}`}
    >
      <line x1="0" y1={height - 5} x2={width} y2={height - 5} className="chart-grid" />
      <polyline points={coords.map((c) => `${c.x},${c.y}`).join(" ")} className={`chart-line ${TONE[status].ligne}`} />
      <circle cx={last.x} cy={last.y} r="2.6" className={`chart-dot ${TONE[status].ligne}`} />
    </svg>
  );
}

export default function MetricCard({ metric }: { metric: Metric; index: number }) {
  return (
    <article className="u-panel">
      <div className="u-panel-head">
        <div>
          <p className="u-panel-kicker">Indicateur {metric.id}</p>
          <h3 className="u-panel-title">{metric.label}</h3>
        </div>
        <div className="u-panel-right">
          <span className={`u-chip ${TONE[metric.status].chip}`}>
            <span className={`u-dot is-${metric.status === "attention" ? "warn" : "ok"}`} aria-hidden="true" />
            {metric.statusLabel}
          </span>
        </div>
      </div>

      <div className="u-panel-body">
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <span className="u-metric-value" style={{ minWidth: 0 }}>
            {metric.value}
            {metric.unit && <small>{metric.unit}</small>}
          </span>
          <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--u-ink-3)", textAlign: "right" }}>
            référence {metric.reference}
          </span>
        </div>
        <div style={{ marginTop: 12 }}>
          {metric.points ? (
            <Sparkline points={metric.points} status={metric.status} label={metric.label} />
          ) : (
            <div className="u-chart-empty">Série non disponible</div>
          )}
        </div>
      </div>
    </article>
  );
}
