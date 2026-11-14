import { useState } from "react";

function BoneDensityChart() {
  const values = [
    0, -0.08, -0.19, -0.27, -0.39, -0.48, -0.56, -0.71, -0.78, -0.9, -1.02, -1.1, -1.24, -1.32,
    -1.4,
  ];
  const points = values
    .map((value, index) => {
      const x = 48 + (index / (values.length - 1)) * 514;
      const y = 22 + (Math.abs(value) / 2.5) * 180;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const thresholdY = 22 + (2 / 2.5) * 180;

  return (
    <svg
      className="clinical-chart bone-chart"
      viewBox="0 0 590 245"
      role="img"
      aria-label="Densité minérale osseuse sur 90 jours, baisse de 1,4 pour cent"
    >
      {[22, 58, 94, 130, 166, 202].map((y) => (
        <line key={y} x1="48" y1={y} x2="562" y2={y} className="clinical-grid-line" />
      ))}
      {[48, 176.5, 305, 433.5, 562].map((x) => (
        <line key={x} x1={x} y1="22" x2={x} y2="202" className="clinical-grid-line vertical" />
      ))}

      <line x1="48" y1={thresholdY} x2="562" y2={thresholdY} className="critical-line" />
      <rect x="392" y={thresholdY - 18} width="170" height="18" className="critical-label-bg" />
      <text x="553" y={thresholdY - 6} textAnchor="end" className="critical-label">
        SEUIL CRITIQUE −2,0 %
      </text>

      <polyline points={points} className="bone-data-line" />
      <circle cx="562" cy={22 + (1.4 / 2.5) * 180} r="4" className="bone-data-dot" />

      <text x="38" y="25" textAnchor="end" className="axis-label">
        0,0
      </text>
      <text x="38" y="61" textAnchor="end" className="axis-label">
        −0,5
      </text>
      <text x="38" y="97" textAnchor="end" className="axis-label">
        −1,0
      </text>
      <text x="38" y="133" textAnchor="end" className="axis-label">
        −1,5
      </text>
      <text x="38" y="169" textAnchor="end" className="axis-label">
        −2,0
      </text>
      <text x="38" y="205" textAnchor="end" className="axis-label">
        −2,5
      </text>

      {[
        ["J0", 48],
        ["J30", 219],
        ["J60", 390],
        ["J90", 562],
      ].map(([label, x]) => (
        <text
          key={label}
          x={x}
          y="226"
          textAnchor={label === "J0" ? "start" : label === "J90" ? "end" : "middle"}
          className="axis-label"
        >
          {label}
        </text>
      ))}
      <text x="48" y="242" className="axis-caption">
        VARIATION DMO vs JOUR 0 (%)
      </text>
    </svg>
  );
}

function CardioChart() {
  const output = [5.2, 5.1, 5.3, 5.0, 5.2, 5.1, 5.0, 5.2, 5.1, 5.0, 5.1, 5.0];
  const pressure = [119, 118, 121, 117, 120, 119, 118, 116, 119, 118, 117, 118];
  const mapPoints = (values: number[], min: number, max: number) =>
    values
      .map((value, index) => {
        const x = 42 + (index / (values.length - 1)) * 324;
        const y = 28 + ((max - value) / (max - min)) * 158;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

  return (
    <svg
      className="clinical-chart cardio-chart"
      viewBox="0 0 405 245"
      role="img"
      aria-label="Débit cardiaque et tension artérielle sur 90 jours"
    >
      {[28, 67.5, 107, 146.5, 186].map((y) => (
        <line key={y} x1="42" y1={y} x2="366" y2={y} className="clinical-grid-line" />
      ))}
      {[42, 150, 258, 366].map((x) => (
        <line key={x} x1={x} y1="28" x2={x} y2="186" className="clinical-grid-line vertical" />
      ))}

      <polyline points={mapPoints(output, 4.5, 5.6)} className="cardiac-output-line" />
      <polyline points={mapPoints(pressure, 108, 126)} className="pressure-line" />
      <circle cx="366" cy={28 + ((5.6 - 5.0) / 1.1) * 158} r="3.5" className="cardiac-output-dot" />
      <circle cx="366" cy={28 + ((126 - 118) / 18) * 158} r="3.5" className="pressure-dot" />

      <text x="33" y="31" textAnchor="end" className="axis-label">
        MAX
      </text>
      <text x="33" y="189" textAnchor="end" className="axis-label">
        MIN
      </text>
      {[
        ["J0", 42],
        ["J30", 150],
        ["J60", 258],
        ["J90", 366],
      ].map(([label, x]) => (
        <text
          key={label}
          x={x}
          y="210"
          textAnchor={label === "J0" ? "start" : label === "J90" ? "end" : "middle"}
          className="axis-label"
        >
          {label}
        </text>
      ))}
      <text x="42" y="232" className="axis-caption">
        MESURES MOYENNES / PÉRIODE 24 H
      </text>
    </svg>
  );
}

const exercises = [
  { id: "ared", name: "ARED Squats", duration: "35 min", code: "FORCE / MEMBRES INF." },
  { id: "t2", name: "Tapis roulant T2", duration: "25 min", code: "CARDIO / CHARGE AXIALE" },
  { id: "cevis", name: "Vélo CEVIS", duration: "20 min", code: "CARDIO / ENDURANCE" },
];

function ExercisePanel() {
  const [validated, setValidated] = useState<string[]>([]);

  const toggleExercise = (id: string) => {
    setValidated((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  return (
    <section className="exercise-panel" aria-labelledby="exercise-title">
      <div className="exercise-panel-header">
        <div>
          <p className="panel-kicker">PROTOCOLE PRÉVENTIF / JOUR 87</p>
          <h2 id="exercise-title">Séances recommandées</h2>
        </div>
        <div className="session-progress">
          <strong>{validated.length}/3</strong>
          <span>VALIDÉES</span>
        </div>
      </div>
      <div className="exercise-list">
        {exercises.map((exercise, index) => {
          const isValidated = validated.includes(exercise.id);
          return (
            <article className="exercise-item" key={exercise.id}>
              <span className="exercise-index">0{index + 1}</span>
              <div className="exercise-copy">
                <h3>{exercise.name}</h3>
                <p>{exercise.code}</p>
              </div>
              <span className="exercise-duration">{exercise.duration}</span>
              <button
                type="button"
                className={`validate-button ${isValidated ? "validated" : ""}`}
                onClick={() => toggleExercise(exercise.id)}
                aria-pressed={isValidated}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {isValidated ? (
                    <path d="m5 12 4.5 4.5L19 7" />
                  ) : (
                    <>
                      <rect x="4" y="4" width="16" height="16" rx="1" />
                      <path d="M8 12h8M12 8v8" />
                    </>
                  )}
                </svg>
                <span>{isValidated ? "VALIDÉE" : "VALIDER"}</span>
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function BoneHeart() {
  return (
    <section className="clinical-overview" aria-labelledby="clinical-title">
      <div className="section-heading clinical-heading">
        <div>
          <h2 id="clinical-title">Suivi musculosquelettique & cardiovasculaire</h2>
          <p>Fenêtre d’analyse continue — 90 jours</p>
        </div>
        <div className="telemetry">
          <span className="telemetry-pulse" />
          TÉLÉMÉTRIE ACTIVE
        </div>
      </div>

      <div className="clinical-grid">
        <article className="clinical-card bone-density-card">
          <div className="clinical-card-header">
            <div>
              <p className="panel-kicker">DENSITÉ MINÉRALE OSSEUSE</p>
              <h3>Tendance DMO</h3>
            </div>
            <div className="clinical-reading attention-reading">
              <strong>−1,4</strong>
              <span>% vs J0</span>
            </div>
          </div>
          <div className="clinical-legend">
            <span>
              <i className="legend-line bone" /> MESURE DMO
            </span>
            <span>
              <i className="legend-line critical" /> SEUIL D’ALERTE
            </span>
          </div>
          <BoneDensityChart />
        </article>

        <article className="clinical-card cardio-card">
          <div className="clinical-card-header">
            <div>
              <p className="panel-kicker">FONCTION CARDIOVASCULAIRE</p>
              <h3>Débit & tension</h3>
            </div>
            <div className="pressure-reading">
              <strong>118/76</strong>
              <span>mmHg</span>
            </div>
          </div>
          <div className="cardio-stats">
            <div>
              <span>DÉBIT CARDIAQUE</span>
              <strong>
                5,0 <small>L/min</small>
              </strong>
            </div>
            <div>
              <span>PRESSION ART.</span>
              <strong>
                118/76 <small>mmHg</small>
              </strong>
            </div>
          </div>
          <div className="clinical-legend">
            <span>
              <i className="legend-line output" /> DÉBIT
            </span>
            <span>
              <i className="legend-line pressure" /> SYSTOLIQUE
            </span>
          </div>
          <CardioChart />
        </article>
      </div>

      <ExercisePanel />
    </section>
  );
}
