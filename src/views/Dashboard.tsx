import MetricCard from "@/components/MetricCard";
import { dashboardMetrics } from "@/data/missionData";

export default function Dashboard() {
  return (
    <section className="overview" aria-labelledby="overview-title">
      <div className="section-heading">
        <div>
          <h2 id="overview-title">Indicateurs clés de la mission</h2>
          <p>Valeurs de démonstration · références illustratives · données non connectées</p>
        </div>
        <div className="telemetry" aria-label="Mode de démonstration, aucune télémétrie active">
          <span className="telemetry-pulse" />
          DONNÉES SIMULÉES
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
