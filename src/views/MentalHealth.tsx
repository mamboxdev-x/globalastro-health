import { cardiovascularData, formatSignedMinutes, sleepData, sleepDifferenceMinutes } from "@/data/missionData";

const REFERENCE_MINUTES = 420;

const psychologicalIndicators = [
  { code: "PHQ-9", label: "Dépistage dépressif" },
  { code: "GAD-7", label: "Dépistage anxiété" },
  { code: "WHO-5", label: "Indice de bien-être" },
];

function SleepPanel() {
  const current = sleepData.days[sleepData.days.length - 1];
  return (
    <section className="u-panel" aria-labelledby="sleep-title">
      <div className="u-panel-head">
        <div>
          <p className="u-panel-kicker">Journal du sommeil · 7 dernières nuits</p>
          <h2 className="u-panel-title" id="sleep-title">
            Durée par nuit
          </h2>
        </div>
        <div className="u-panel-right">
          <span className="u-metric-value" style={{ fontSize: 21 }}>
            {current.duration}
            <small>cette nuit</small>
          </span>
        </div>
      </div>

      <div className="u-panel-body">
        <div className="u-bars" role="img" aria-label={`Durées de sommeil : ${sleepData.days.map((entry) => `${entry.day} ${entry.duration}`).join(", ")}`}>
          {sleepData.days.map((entry) => (
            <div className="u-bar" key={entry.day} aria-hidden="true">
              <span className="u-bar-value">{entry.duration.replace("h", "h")}</span>
              <div className="u-bar-track">
                <span
                  className={entry.minutes < REFERENCE_MINUTES ? "is-under" : ""}
                  style={{ height: `${Math.round((entry.minutes / 480) * 100)}%` }}
                />
              </div>
              <span className="u-bar-day">{entry.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="u-stats">
        <div className="u-stat">
          <span className="u-stat-k">Référence pré-vol</span>
          <span className="u-stat-v">
            7 h 00
          </span>
        </div>
        <div className="u-stat">
          <span className="u-stat-k">Écart cette nuit</span>
          <span className="u-stat-v" style={{ color: "var(--u-warn)" }}>
            {formatSignedMinutes(sleepDifferenceMinutes)}
          </span>
        </div>
        <div className="u-stat">
          <span className="u-stat-k">Nuits sous la référence</span>
          <span className="u-stat-v">
            {sleepData.days.filter((d) => d.minutes < REFERENCE_MINUTES).length}
            <small>/ {sleepData.days.length}</small>
          </span>
        </div>
      </div>
    </section>
  );
}

function PsychologicalPanel() {
  return (
    <section className="u-panel" aria-labelledby="psy-title">
      <div className="u-panel-head">
        <div>
          <p className="u-panel-kicker">Questionnaires déclaratifs</p>
          <h2 className="u-panel-title" id="psy-title">
            Paramètres psychologiques
          </h2>
        </div>
        <div className="u-panel-right">
          <span className="u-chip mono">0 / 3 remplis</span>
        </div>
      </div>

      <div className="u-panel-body tight">
        <div className="u-rows">
          {psychologicalIndicators.map((indicator) => (
            <div className="u-row" key={indicator.code}>
              <span className="u-row-k">
                <b>{indicator.code}</b>
                <small>{indicator.label}</small>
              </span>
              <span className="u-row-value is-muted">Non renseigné</span>
            </div>
          ))}
        </div>
      </div>

      <div className="u-panel-foot">
        Les questionnaires n’ont pas été soumis : aucun score n’est calculé et aucune interprétation psychologique
        n’est produite.
      </div>
    </section>
  );
}

function CardiacPanel() {
  const hrv = cardiovascularData.hrvMs;
  const hr = cardiovascularData.heartRateBpm;
  const hrvRef = 51;
  const hrRef = 61;

  return (
    <section className="u-panel" aria-labelledby="cardio-mental-title">
      <div className="u-panel-head">
        <div>
          <p className="u-panel-kicker">Réponse autonome</p>
          <h2 className="u-panel-title" id="cardio-mental-title">
            Indicateurs cardiovasculaires
          </h2>
        </div>
        <div className="u-panel-right">
          <span className="u-chip is-ok">Dans la référence</span>
        </div>
      </div>

      <div className="u-panel-body">
        <div className="u-rows">
          <div className="u-row">
            <span className="u-row-k">
              <b>Variabilité cardiaque</b>
              <small>HRV · référence pré-vol {hrvRef} ms</small>
            </span>
            <span className="u-row-value">
              {hrv} <span style={{ color: "var(--u-ink-3)" }}>ms</span>
            </span>
          </div>
          <div className="u-row">
            <span className="u-row-k">
              <b>Fréquence de repos</b>
              <small>Référence pré-vol {hrRef} bpm</small>
            </span>
            <span className="u-row-value">
              {hr} <span style={{ color: "var(--u-ink-3)" }}>bpm</span>
            </span>
          </div>
          <div className="u-row">
            <span className="u-row-k">
              <b>Sommeil / HRV</b>
              <small>Corrélation des deux derniers cycles</small>
            </span>
            <span className="u-row-value is-muted">Non calculée</span>
          </div>
        </div>
      </div>

      <div className="u-panel-foot">
        Valeurs simulées, sans dispositif médical connecté.
      </div>
    </section>
  );
}

export default function MentalHealth() {
  return (
    <>
      <div className="u-shead">
        <div>
          <h2>Santé mentale</h2>
          <p>Sommeil, ressenti déclaratif et réponse autonome</p>
        </div>
        <div className="right">
          <span className="u-chip mono">J87</span>
          <span className="u-chip">Données simulées</span>
        </div>
      </div>

      <SleepPanel />

      <div className="u-grid g2">
        <PsychologicalPanel />
        <CardiacPanel />
      </div>
    </>
  );
}
