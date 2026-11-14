const sleepDays = [
  { day: "J−6", duration: "6h28", minutes: 388 },
  { day: "J−5", duration: "6h12", minutes: 372 },
  { day: "J−4", duration: "6h45", minutes: 405 },
  { day: "J−3", duration: "5h50", minutes: 350 },
  { day: "J−2", duration: "6h36", minutes: 396 },
  { day: "J−1", duration: "7h02", minutes: 422 },
  { day: "J87", duration: "6h12", minutes: 372 },
];

const psychologicalIndicators = [
  { code: "PHQ-9", label: "DÉPISTAGE DÉPRESSIF" },
  { code: "GAD-7", label: "DÉPISTAGE ANXIÉTÉ" },
  { code: "WHO-5", label: "INDICE DE BIEN-ÊTRE" },
];

function ComplementaryData() {
  return (
    <article className="mental-card mood-module">
      <div className="mental-card-header">
        <div>
          <p className="panel-kicker">DONNÉES COMPLÉMENTAIRES</p>
          <h2>Paramètres psychologiques</h2>
        </div>
        <div className="completion-badge">0/3</div>
      </div>
      <p className="module-instruction">
        Ces indicateurs sont documentés, mais aucune valeur sourcée en vol n’est disponible.
      </p>
      <div className="missing-data-list">
        {psychologicalIndicators.map((indicator, index) => (
          <div className="missing-data-row" key={indicator.code}>
            <span className="missing-index">0{index + 1}</span>
            <div>
              <strong>{indicator.code}</strong>
              <small>{indicator.label}</small>
            </div>
            <span className="missing-value">NON RENSEIGNÉ</span>
          </div>
        ))}
      </div>
      <div className="mood-footer">
        <span>AUCUNE MESURE EN VOL</span>
        <span>SOURCE DOCUMENTAIRE</span>
      </div>
    </article>
  );
}

function SleepJournal() {
  return (
    <article className="mental-card sleep-module">
      <div className="mental-card-header">
        <div>
          <p className="panel-kicker">DONNÉE PHYSIOLOGIQUE DOCUMENTÉE</p>
          <h2>Durée de sommeil — 7 derniers jours</h2>
        </div>
        <div className="sleep-efficiency">
          <span>MESURE J87</span>
          <strong>6h12</strong>
        </div>
      </div>
      <div className="sleep-summary">
        <div>
          <span>MESURE EN VOL</span>
          <strong>6h12</strong>
        </div>
        <div>
          <span>RÉFÉRENCE PRÉ-VOL</span>
          <strong>7h00</strong>
        </div>
        <div className="sleep-delta">
          <span>ÉCART À LA RÉFÉRENCE</span>
          <strong>−48 min</strong>
        </div>
      </div>
      <div className="sleep-bars" aria-label="Durées de sommeil des sept derniers jours">
        {sleepDays.map((entry) => (
          <div className="sleep-day" key={entry.day}>
            <span className="sleep-duration">{entry.duration}</span>
            <div className="sleep-track">
              <span style={{ height: `${Math.round((entry.minutes / 450) * 100)}%` }} />
            </div>
            <span className="sleep-day-label">{entry.day}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function DocumentedCardiacData() {
  return (
    <article className="mental-card cohesion-module">
      <div className="mental-card-header">
        <div>
          <p className="panel-kicker">DONNÉES CARDIOVASCULAIRES DOCUMENTÉES</p>
          <h2>Réponse autonome</h2>
        </div>
        <div className="status-pill nominal">
          <span className="status-dot" />
          NOMINAL
        </div>
      </div>
      <div className="cohesion-readings">
        <div>
          <span>VARIABILITÉ CARDIAQUE</span>
          <strong>
            54 <small>ms HRV</small>
          </strong>
          <div className="flat-meter">
            <span style={{ width: "63%" }} />
          </div>
          <p>RÉFÉRENCE PRÉ-VOL : 51 MS</p>
        </div>
        <div>
          <span>FRÉQUENCE CARDIAQUE AU REPOS</span>
          <strong>
            58 <small>bpm</small>
          </strong>
          <div className="flat-meter">
            <span style={{ width: "58%" }} />
          </div>
          <p>RÉFÉRENCE PRÉ-VOL : 61 BPM</p>
        </div>
      </div>
    </article>
  );
}

export default function MentalHealth() {
  return (
    <section className="mental-overview" aria-labelledby="mental-title">
      <div className="section-heading mental-heading">
        <div>
          <h2 id="mental-title">Sommeil & données complémentaires</h2>
          <p>Mesures en vol séparées des références pré-vol</p>
        </div>
        <div className="privacy-label">DONNÉES SOURCÉES UNIQUEMENT</div>
      </div>
      <div className="mental-grid">
        <ComplementaryData />
        <SleepJournal />
        <DocumentedCardiacData />
      </div>
    </section>
  );
}
