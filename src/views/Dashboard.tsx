import MetricCard, { dashboardMetrics } from "@/components/MetricCard";

export default function Dashboard() {
  return (
    <section className="overview" aria-labelledby="overview-title">
      <div className="section-heading">
        <div>
          <h2 id="overview-title">Indicateurs clés</h2>
          <p>Dernières mesures consolidées</p>
        </div>
        <div className="telemetry">
          <span className="telemetry-pulse" />
          TÉLÉMÉTRIE ACTIVE
        </div>
      </div>

      <div className="metric-grid">
        {dashboardMetrics.map((metric, index) => (
          <MetricCard key={metric.id} metric={metric} index={index} />
        ))}
      </div>
    </section>
  );
}
