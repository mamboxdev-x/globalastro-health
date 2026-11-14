import { useDemoState } from "@/context/DemoStateContext";
import { boneDensityData, cardiovascularData, currentCardiacOutput, formatSignedPercent } from "@/data/missionData";

function BoneDensityChart() {
  const values = boneDensityData.points;
  const points = values
    .map((value, index) => {
      const x = 48 + (index / (values.length - 1)) * 514;
      const y = 22 + (Math.abs(value) / 2.5) * 180;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const thresholdY = 22 + (Math.abs(boneDensityData.alertThresholdPercent) / 2.5) * 180;
  const finalY = 22 + (Math.abs(boneDensityData.changePercent) / 2.5) * 180;

  return (
    <svg
      className="u-chart"
      viewBox="0 0 590 250"
      role="img"
      aria-label={`Variation de la densité minérale osseuse sur 90 jours : ${formatSignedPercent(boneDensityData.changePercent)} depuis le jour 0. Seuil de suivi : ${formatSignedPercent(boneDensityData.alertThresholdPercent)}.`}
    >
      {[22, 58, 94, 130, 166, 202].map((y) => <line key={y} x1="48" y1={y} x2="562" y2={y} className="clinical-grid-line" />)}
      {[48, 176.5, 305, 433.5, 562].map((x) => <line key={x} x1={x} y1="22" x2={x} y2="202" className="clinical-grid-line vertical" />)}
      <line x1="48" y1={thresholdY} x2="562" y2={thresholdY} className="critical-line" />
      <rect x="400" y={thresholdY - 17} width="162" height="16" rx="3" className="critical-label-bg" />
      <text x="553" y={thresholdY - 5} textAnchor="end" className="critical-label">SEUIL −2,0 %</text>
      <polyline points={points} className="bone-data-line" />
      <circle cx="562" cy={finalY} r="3.5" className="bone-data-dot" />
      {[
        ["0,0", 25], ["−0,5", 61], ["−1,0", 97], ["−1,5", 133], ["−2,0", 169], ["−2,5", 205],
      ].map(([label, y]) => <text key={label} x="38" y={y} textAnchor="end" className="axis-label">{label}</text>)}
      {[["J0", 48], ["J30", 219], ["J60", 390], ["J90", 562]].map(([label, x]) => (
        <text key={label} x={x} y="226" textAnchor={label === "J0" ? "start" : label === "J90" ? "end" : "middle"} className="axis-label">{label}</text>
      ))}
      <text x="48" y="244" className="axis-caption">VARIATION DEPUIS LE JOUR 0 (%)</text>
    </svg>
  );
}

function CardioChart() {
  const output = cardiovascularData.cardiacOutputLitersPerMinute;
  const pressure = cardiovascularData.systolicPressureMmHg;
  const mapPoints = (values: readonly number[], min: number, max: number) =>
    values.map((value, index) => {
      const x = 42 + (index / (values.length - 1)) * 324;
      const y = 28 + ((max - value) / (max - min)) * 158;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  const lastOutputY = 28 + ((5.6 - output[output.length - 1]) / (5.6 - 4.5)) * 158;
  const lastPressureY = 28 + ((126 - pressure[pressure.length - 1]) / (126 - 108)) * 158;

  return (
    <svg
      className="u-chart"
      viewBox="0 0 405 250"
      role="img"
      aria-label="Débit cardiaque (axe gauche, 4,5 à 5,6 L/min) et pression systolique (axe droit, 108 à 126 mmHg) sur 12 points."
    >
      {[28, 67.5, 107, 146.5, 186].map((y) => <line key={y} x1="42" y1={y} x2="366" y2={y} className="clinical-grid-line" />)}
      {[42, 150, 258, 366].map((x) => <line key={x} x1={x} y1="28" x2={x} y2="186" className="clinical-grid-line vertical" />)}
      <polyline points={mapPoints(output, 4.5, 5.6)} className="cardiac-output-line" />
      <polyline points={mapPoints(pressure, 108, 126)} className="pressure-line" />
      <circle cx="366" cy={lastOutputY} r="3" className="cardiac-output-dot" />
      <circle cx="366" cy={lastPressureY} r="3" className="pressure-dot" />
      <text x="33" y="31" textAnchor="end" className="axis-label">5,6</text>
      <text x="33" y="110" textAnchor="end" className="axis-label">5,0</text>
      <text x="33" y="189" textAnchor="end" className="axis-label">4,5</text>
      <text x="374" y="31" textAnchor="start" className="axis-label">126</text>
      <text x="374" y="110" textAnchor="start" className="axis-label">117</text>
      <text x="374" y="189" textAnchor="start" className="axis-label">108</text>
      {[["J0", 42], ["J30", 150], ["J60", 258], ["J90", 366]].map(([label, x]) => (
        <text key={label} x={x} y="210" textAnchor={label === "J0" ? "start" : label === "J90" ? "end" : "middle"} className="axis-label">{label}</text>
      ))}
      <text x="42" y="234" className="axis-caption">DÉBIT · AXE GAUCHE — PRESSION · AXE DROIT</text>
    </svg>
  );
}

const exercises = [
  { id: "ared", name: "ARED — squats", duration: "35 min", code: "Force · membres inférieurs" },
  { id: "t2", name: "Tapis roulant T2", duration: "25 min", code: "Cardio · charge axiale" },
  { id: "cevis", name: "Vélo CEVIS", duration: "20 min", code: "Cardio · endurance" },
] as const;

function ExercisePanel() {
  const { validatedExercises, toggleExercise } = useDemoState();

  return (
    <section className="u-panel" aria-labelledby="exercise-title">
      <div className="u-panel-head">
        <div>
          <p className="u-panel-kicker">Charge d’entraînement · jour 87</p>
          <h2 className="u-panel-title" id="exercise-title">
            Séances du jour
          </h2>
        </div>
        <div className="u-panel-right">
          <span className="u-chip mono">{validatedExercises.length}/3 validées</span>
        </div>
      </div>

      <div className="u-panel-body tight">
        <div className="u-rows">
          {exercises.map((exercise) => {
            const isValidated = validatedExercises.includes(exercise.id);
            return (
              <div className="u-row" key={exercise.id}>
                <span className="u-row-k">
                  <b>{exercise.name}</b>
                  <small>{exercise.code}</small>
                </span>
                <span className="u-row-value is-muted">{exercise.duration}</span>
                <button
                  type="button"
                  className={`u-btn ${isValidated ? "is-done" : ""}`}
                  onClick={() => toggleExercise(exercise.id)}
                  aria-pressed={isValidated}
                  aria-label={`${isValidated ? "Retirer la validation de" : "Valider"} ${exercise.name}`}
                >
                  {isValidated ? "Validée" : "Valider"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="u-panel-foot">
        La validation marque la séance comme faite dans l’interface ; elle ne provient pas d’un capteur.
      </div>
    </section>
  );
}

export default function BoneHeart() {
  return (
    <>
      <div className="u-shead">
        <div>
          <h2>Os &amp; Cœur</h2>
          <p>Densité osseuse et fonction cardiovasculaire · fenêtre de 90 jours</p>
        </div>
        <div className="right">
          <span className="u-chip mono">J0 → J90</span>
          <span className="u-chip">Données simulées</span>
        </div>
      </div>

      <div className="u-grid g2">
        <section className="u-panel" aria-labelledby="bone-title">
          <div className="u-panel-head">
            <div>
              <p className="u-panel-kicker">Densité minérale osseuse</p>
              <h2 className="u-panel-title" id="bone-title">
                Variation depuis le jour 0
              </h2>
            </div>
            <div className="u-panel-right">
              <span className="u-metric-value" style={{ fontSize: 21 }}>
                {formatSignedPercent(boneDensityData.changePercent).replace(" %", "")}
                <small>% depuis J0</small>
              </span>
            </div>
          </div>
          <div className="u-panel-body">
            <div className="u-legend">
              <span><i /> Variation mesurée</span>
              <span><i className="alert dashed" /> Seuil de suivi −2,0 %</span>
            </div>
            <div style={{ marginTop: 10 }}>
              <BoneDensityChart />
            </div>
          </div>
          <div className="u-panel-foot">
            Le T-score absolu n’est pas mesuré à bord ; il ne peut pas être déduit de cette variation relative.
          </div>
        </section>

        <section className="u-panel" aria-labelledby="cardio-title">
          <div className="u-panel-head">
            <div>
              <p className="u-panel-kicker">Fonction cardiovasculaire</p>
              <h2 className="u-panel-title" id="cardio-title">
                Débit &amp; pression systolique
              </h2>
            </div>
            <div className="u-panel-right">
              <span className="u-metric-value" style={{ fontSize: 21 }}>
                118/76
                <small>mmHg</small>
              </span>
            </div>
          </div>
          <div className="u-panel-body">
            <div className="u-stats" style={{ marginTop: -14, marginBottom: 12 }}>
              <div className="u-stat">
                <span className="u-stat-k">Débit cardiaque</span>
                <span className="u-stat-v">
                  {currentCardiacOutput.toFixed(1).replace(".", ",")}
                  <small>L/min</small>
                </span>
              </div>
              <div className="u-stat">
                <span className="u-stat-k">Fréquence de repos</span>
                <span className="u-stat-v">
                  {cardiovascularData.heartRateBpm}
                  <small>bpm</small>
                </span>
              </div>
            </div>
            <div className="u-legend">
              <span><i /> Débit · axe gauche</span>
              <span><i className="dashed" /> Pression · axe droit</span>
            </div>
            <div style={{ marginTop: 10 }}>
              <CardioChart />
            </div>
          </div>
        </section>
      </div>

      <ExercisePanel />
    </>
  );
}
