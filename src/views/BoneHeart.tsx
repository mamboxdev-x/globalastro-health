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
      className="clinical-chart bone-chart"
      viewBox="0 0 590 245"
      role="img"
      aria-label={`Évolution illustrative de la variation de densité minérale osseuse sur 90 jours : ${formatSignedPercent(boneDensityData.changePercent)} par rapport au jour 0. Le seuil de suivi illustratif est ${formatSignedPercent(boneDensityData.alertThresholdPercent)}.`}
    >
      {[22, 58, 94, 130, 166, 202].map((y) => <line key={y} x1="48" y1={y} x2="562" y2={y} className="clinical-grid-line" />)}
      {[48, 176.5, 305, 433.5, 562].map((x) => <line key={x} x1={x} y1="22" x2={x} y2="202" className="clinical-grid-line vertical" />)}
      <line x1="48" y1={thresholdY} x2="562" y2={thresholdY} className="critical-line" />
      <rect x="392" y={thresholdY - 18} width="170" height="18" className="critical-label-bg" />
      <text x="553" y={thresholdY - 6} textAnchor="end" className="critical-label">SEUIL DE SUIVI −2,0 %</text>
      <polyline points={points} className="bone-data-line" />
      <circle cx="562" cy={finalY} r="4" className="bone-data-dot" />
      {[
        ["0,0", 25], ["−0,5", 61], ["−1,0", 97], ["−1,5", 133], ["−2,0", 169], ["−2,5", 205],
      ].map(([label, y]) => <text key={label} x="38" y={y} textAnchor="end" className="axis-label">{label}</text>)}
      {[["J0", 48], ["J30", 219], ["J60", 390], ["J90", 562]].map(([label, x]) => (
        <text key={label} x={x} y="226" textAnchor={label === "J0" ? "start" : label === "J90" ? "end" : "middle"} className="axis-label">{label}</text>
      ))}
      <text x="48" y="242" className="axis-caption">VARIATION ILLUSTRATIVE VS JOUR 0 (%)</text>
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
      className="clinical-chart cardio-chart"
      viewBox="0 0 405 245"
      role="img"
      aria-label="Tendances illustratives sur 12 points. Axe gauche : débit cardiaque en litres par minute, de 4,5 à 5,6. Axe droit : pression systolique en mmHg, de 108 à 126. Les deux séries ont des échelles distinctes."
    >
      {[28, 67.5, 107, 146.5, 186].map((y) => <line key={y} x1="42" y1={y} x2="366" y2={y} className="clinical-grid-line" />)}
      {[42, 150, 258, 366].map((x) => <line key={x} x1={x} y1="28" x2={x} y2="186" className="clinical-grid-line vertical" />)}
      <polyline points={mapPoints(output, 4.5, 5.6)} className="cardiac-output-line" />
      <polyline points={mapPoints(pressure, 108, 126)} className="pressure-line" />
      <circle cx="366" cy={lastOutputY} r="3.5" className="cardiac-output-dot" />
      <circle cx="366" cy={lastPressureY} r="3.5" className="pressure-dot" />
      <text x="33" y="31" textAnchor="end" className="axis-label">5,6</text>
      <text x="33" y="110" textAnchor="end" className="axis-label">5,0</text>
      <text x="33" y="189" textAnchor="end" className="axis-label">4,5</text>
      <text x="374" y="31" textAnchor="start" className="axis-label">126</text>
      <text x="374" y="110" textAnchor="start" className="axis-label">117</text>
      <text x="374" y="189" textAnchor="start" className="axis-label">108</text>
      {[["J0", 42], ["J30", 150], ["J60", 258], ["J90", 366]].map(([label, x]) => (
        <text key={label} x={x} y="210" textAnchor={label === "J0" ? "start" : label === "J90" ? "end" : "middle"} className="axis-label">{label}</text>
      ))}
      <text x="42" y="232" className="axis-caption">12 POINTS ILLUSTRATIFS · AXES DISTINCTS</text>
    </svg>
  );
}

const exercises = [
  { id: "ared", name: "ARED Squats", duration: "35 min", code: "FORCE / MEMBRES INF." },
  { id: "t2", name: "Tapis roulant T2", duration: "25 min", code: "CARDIO / CHARGE AXIALE" },
  { id: "cevis", name: "Vélo CEVIS", duration: "20 min", code: "CARDIO / ENDURANCE" },
] as const;

function ExercisePanel() {
  const { validatedExercises, toggleExercise } = useDemoState();

  return (
    <section className="exercise-panel" aria-labelledby="exercise-title">
      <div className="exercise-panel-header">
        <div>
          <p className="panel-kicker">EXEMPLES DE SÉANCES / JOUR 87</p>
          <h2 id="exercise-title">Suivi des séances proposées</h2>
        </div>
        <div className="session-progress" aria-live="polite">
          <strong>{validatedExercises.length}/3</strong><span>MARQUÉES EN DÉMO</span>
        </div>
      </div>
      <div className="exercise-list">
        {exercises.map((exercise, index) => {
          const isValidated = validatedExercises.includes(exercise.id);
          return (
            <article className="exercise-item" key={exercise.id}>
              <span className="exercise-index">0{index + 1}</span>
              <div className="exercise-copy"><h3>{exercise.name}</h3><p>{exercise.code}</p></div>
              <span className="exercise-duration">{exercise.duration}</span>
              <button
                type="button"
                className={`validate-button ${isValidated ? "validated" : ""}`}
                onClick={() => toggleExercise(exercise.id)}
                aria-pressed={isValidated}
                aria-label={`${isValidated ? "Retirer la validation de démonstration pour" : "Marquer comme validée dans la démonstration :"} ${exercise.name}`}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {isValidated ? <path d="m5 12 4.5 4.5L19 7" /> : <><rect x="4" y="4" width="16" height="16" rx="1" /><path d="M8 12h8M12 8v8" /></>}
                </svg>
                <span>{isValidated ? "VALIDÉE · DÉMO" : "SIMULER LA VALIDATION"}</span>
              </button>
            </article>
          );
        })}
      </div>
      <p className="helper-text exercise-disclaimer">Ces actions sont des marqueurs d'interface conservés localement ; elles ne prouvent pas qu'une séance a été réalisée.</p>
    </section>
  );
}

export default function BoneHeart() {
  return (
    <section className="clinical-overview" aria-labelledby="clinical-title">
      <div className="section-heading clinical-heading">
        <div>
          <h2 id="clinical-title">Suivi musculosquelettique & cardiovasculaire</h2>
          <p>Graphiques illustratifs · fenêtre d'analyse de 90 jours</p>
        </div>
        <div className="telemetry"><span className="telemetry-pulse" />DONNÉES SIMULÉES</div>
      </div>

      <div className="clinical-grid">
        <article className="clinical-card bone-density-card">
          <div className="clinical-card-header">
            <div><p className="panel-kicker">VARIATION DE DENSITÉ MINÉRALE OSSEUSE</p><h3>Évolution par rapport au jour 0</h3></div>
            <div className="clinical-reading attention-reading"><strong>{formatSignedPercent(boneDensityData.changePercent).replace(" %", "")}</strong><span>% vs J0</span></div>
          </div>
          <div className="clinical-legend">
            <span><i className="legend-line bone" /> VARIATION DMO</span>
            <span><i className="legend-line critical" /> SEUIL ILLUSTRATIF −2,0 %</span>
          </div>
          <BoneDensityChart />
          <p className="module-instruction">Le T-score absolu n'est pas fourni ; il ne doit pas être déduit de cette variation relative.</p>
        </article>

        <article className="clinical-card cardio-card">
          <div className="clinical-card-header">
            <div><p className="panel-kicker">FONCTION CARDIOVASCULAIRE</p><h3>Débit & pression systolique</h3></div>
            <div className="pressure-reading"><strong>118/76</strong><span>mmHg · démo</span></div>
          </div>
          <div className="cardio-stats">
            <div><span>DÉBIT CARDIAQUE</span><strong>{currentCardiacOutput.toFixed(1).replace(".", ",")} <small>L/min</small></strong></div>
            <div><span>PRESSION ARTÉRIELLE</span><strong>118/76 <small>mmHg</small></strong></div>
          </div>
          <div className="clinical-legend">
            <span><i className="legend-line output" /> DÉBIT · AXE GAUCHE (L/min)</span>
            <span><i className="legend-line pressure" /> PRESSION · AXE DROIT (mmHg)</span>
          </div>
          <CardioChart />
        </article>
      </div>

      <ExercisePanel />
    </section>
  );
}
