import MetricCard from "@/components/MetricCard";
import ModuleCentral from "@/components/ModuleCentral";
import { useSession } from "@/context/SessionContext";
import { cartesPourMembre, membrePour, useEquipageSimule } from "@/data/simulation";
import { missionDay } from "@/data/missionData";

/**
 * Tableau de bord de l'équipage.
 *
 * Les cartes sont bâties sur la simulation partagée — la même source que celle que lit le poste
 * au sol. Avant, elles venaient d'un jeu de valeurs figées : le médecin voyait donc des chiffres
 * qui bougeaient pendant que l'équipage en voyait d'autres, immobiles. Une seule source, deux
 * interfaces : elles ne peuvent plus se contredire.
 */
export default function Dashboard() {
  const { identifiant } = useSession();
  const { membres } = useEquipageSimule();
  const membre = membrePour(membres, identifiant);
  const cartes = cartesPourMembre(membre);

  return (
    <>
      <div className="u-shead">
        <div>
          <h2>Indicateurs clés de la mission</h2>
          <p>
            Comparaison avec les références pré-vol · fenêtre glissante de 14 jours
            {membre ? ` · ${membre.nom}` : ""}
          </p>
        </div>
        <div className="right">
          <span className="u-chip mono">J{missionDay}</span>
          <span className="u-chip">{membre?.source === "module" ? "Capteurs du bord" : "Mesures simulées"}</span>
        </div>
      </div>

      <div className="u-grid metrics">
        {cartes.map((carte, index) => (
          <MetricCard key={carte.id} metric={carte} index={index} />
        ))}
      </div>

      <ModuleCentral />
    </>
  );
}
