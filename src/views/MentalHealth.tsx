import { cardiovascularData, formatSignedMinutes, sleepData, sleepDifferenceMinutes } from "@/data/missionData";

const psychologicalIndicators = [
  { code: "PHQ-9", label: "DÉPISTAGE DÉPRESSIF" },
  { code: "GAD-7", label: "DÉPISTAGE ANXIÉTÉ" },
  { code: "WHO-5", label: "INDICE DE BIEN-ÊTRE" },
];

function ComplementaryData() {
  return (
    <article className="mental-card mood-module">
      <div className="mental-card-header">
        <div><p className="panel-kicker">INDICATEURS COMPLÉMENTAIRES</p><h2>Paramètres psychologiques</h2></div>
        <div className="completion-badge">0/3</div>
      </div>
      <p className="module-instruction">
        Les questionnaires ci-dessous ne sont pas renseignés dans cette démonstration. Aucune interprétation psychologique n'est produite.
      </p>
      <div className="missing-data-list">
        {psychologicalIndicators.map((indicator, index) => (
          <div className="missing-data-row" key={indicator.code}>
            <span className="missing-index">0{index + 1}</span>
            <div><strong>{indicator.code}</strong><small>{indicator.label}</small></div>
            <span className="missing-value">NON RENSEIGNÉ</span>
          </div>
        ))}
      </div>
      <div className="mood-footer"><span>AUCUNE RÉPONSE ENREGISTRÉE</span><span>MODE DÉMONSTRATION</span></div>
    </article>
  );
}

function SleepJournal() {
  const current = sleepData.days[sleepData.days.length - 1];
  return (
    <article className="mental-card sleep-module">
      <div className="mental-card-header">
        <div><p className="panel-kicker">JOURNAL DU SOMMEIL · DONNÉES FICTIVES</p><h2>Durée sur les sept dernières périodes</h2></div>
        <div className="sleep-efficiency"><span>DERNIÈRE VALEUR</span><strong>{current.duration}</strong></div>
      </div>
      <div className="sleep-summary">
        <div><span>DERNIÈRE VALEUR</span><strong>{current.duration}</strong></div>
        <div><span>RÉFÉRENCE ILLUSTRATIVE</span><strong>7h00</strong></div>
        <div className="sleep-delta"><span>ÉCART CALCULÉ</span><strong>{formatSignedMinutes(sleepDifferenceMinutes)}</strong></div>
      </div>
      <div className="sleep-bars" role="img" aria-label={`Durées de sommeil de démonstration : ${sleepData.days.map((entry) => `${entry.day} ${entry.duration}`).join(", ")}`}>
        {sleepData.days.map((entry) => (
          <div className="sleep-day" key={entry.day} aria-hidden="true">
            <span className="sleep-duration">{entry.duration}</span>
            <div className="sleep-track"><span style={{ height: `${Math.round((entry.minutes / 450) * 100)}%` }} /></div>
            <span className="sleep-day-label">{entry.day}</span>
          </div>
        ))}
      </div>
      <p className="module-instruction">La comparaison porte sur la dernière valeur affichée ; elle ne calcule pas une tendance clinique ni une moyenne glissante.</p>
    </article>
  );
}

function DocumentedCardiacData() {
  return (
    <article className="mental-card cohesion-module">
      <div className="mental-card-header">
        <div><p className="panel-kicker">INDICATEURS CARDIOVASCULAIRES · DÉMO</p><h2>Valeurs complémentaires</h2></div>
        <div className="status-pill nominal"><span className="status-dot" />ILLUSTRATIF</div>
      </div>
      <div className="cohesion-readings">
        <div>
          <span>VARIABILITÉ CARDIAQUE</span>
          <strong>{cardiovascularData.hrvMs} <small>ms HRV</small></strong>
          <div className="flat-meter"><span style={{ width: "63%" }} /></div>
          <p>RÉFÉRENCE DE DÉMO : 51 MS</p>
        </div>
        <div>
          <span>FRÉQUENCE CARDIAQUE AU REPOS</span>
          <strong>{cardiovascularData.heartRateBpm} <small>bpm</small></strong>
          <div className="flat-meter"><span style={{ width: "58%" }} /></div>
          <p>RÉFÉRENCE DE DÉMO : 61 BPM</p>
        </div>
      </div>
      <p className="module-instruction">Les valeurs affichées ne proviennent pas d'un dispositif médical connecté.</p>
    </article>
  );
}

export default function MentalHealth() {
  return (
    <section className="mental-overview" aria-labelledby="mental-title">
      <div className="section-heading mental-heading">
        <div><h2 id="mental-title">Sommeil & données complémentaires</h2><p>Suivi de démonstration · aucun diagnostic ni questionnaire complété</p></div>
        <div className="privacy-label">DONNÉES FICTIVES · NON MÉDICALES</div>
      </div>
      <div className="mental-grid">
        <ComplementaryData />
        <SleepJournal />
        <DocumentedCardiacData />
      </div>
    </section>
  );
}
