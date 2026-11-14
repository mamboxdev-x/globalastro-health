import {
  currentSleepDuration,
  formatSignedMinutes,
  formatSignedPercent,
  sleepDifferenceMinutes,
  sleepDifferencePercent,
} from "@/data/missionData";

export default function AlertBox() {
  return (
    <section className="u-panel is-alert" aria-labelledby="alert-title">
      <div className="u-panel-head">
        <div>
          <p className="u-panel-kicker">Alerte MH-SL-072 · sommeil</p>
          <h2 className="u-panel-title" id="alert-title">
            Écart de sommeil à surveiller
          </h2>
        </div>
        <div className="u-panel-right">
          <span className="u-chip is-alert">Niveau 2</span>
        </div>
      </div>

      <div className="u-panel-body">
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
          <span className="u-metric-value">
            {currentSleepDuration.replace("h", " h ")}
            <small>cette nuit</small>
          </span>
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span className="u-chip is-warn mono">
              {formatSignedMinutes(sleepDifferenceMinutes)} · {formatSignedPercent(sleepDifferencePercent)}
            </span>
            <span style={{ fontSize: 11.5, color: "var(--u-ink-3)" }}>par rapport à la référence de 7 h 00</span>
          </span>
          <span style={{ marginLeft: "auto", textAlign: "right" }}>
            <span className="u-stat-k">Seuil d’alerte</span>
            <span className="u-big" style={{ display: "block" }}>
              −45 min
            </span>
          </span>
        </div>

        <div className="u-track is-warn" style={{ marginTop: 14 }}>
          <span style={{ width: "18%" }} />
        </div>
      </div>

      <div className="u-panel-foot">
        L’écart est calculé entre la dernière valeur de sommeil et la référence pré-vol. Il ne constitue pas un
        avis médical.
      </div>
    </section>
  );
}
