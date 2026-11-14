import MetricCard from "@/components/MetricCard";
import { dashboardMetrics, missionDay } from "@/data/missionData";

export default function Dashboard() {
  return (
    <>
      <div className="u-shead">
        <div>
          <h2>Indicateurs clés de la mission</h2>
          <p>Comparaison avec les références pré-vol · fenêtre glissante de 14 jours</p>
        </div>
        <div className="right">
          <span className="u-chip mono">J{missionDay}</span>
          <span className="u-chip">Données simulées</span>
        </div>
      </div>

      <div className="u-grid metrics">
        {dashboardMetrics.map((metric, index) => (
          <MetricCard key={metric.id} metric={metric} index={index} />
        ))}
      </div>
    </>
  );
}
