import { currentSleepDuration, formatSignedPercent, formatSignedMinutes, sleepDifferenceMinutes, sleepDifferencePercent } from "@/data/missionData";

export default function AlertBox() {
  return (
    <div className="alert-banner" role="status" aria-labelledby="alert-title">
      <div className="alert-code">ALERTE DE DÉMONSTRATION / MH-SL-072</div>
      <div className="alert-banner-main">
        <div className="alert-symbol" aria-hidden="true">!</div>
        <div>
          <h2 id="alert-title">ÉCART DE SOMMEIL À SURVEILLER</h2>
          <p>
            Valeur illustrative de {currentSleepDuration.replace("h", " h ")}, soit {formatSignedMinutes(sleepDifferenceMinutes)}
            {` (${formatSignedPercent(sleepDifferencePercent)})`} par rapport à la référence de 7 h.
          </p>
        </div>
        <div className="alert-severity">
          <span>NIVEAU DÉMO</span>
          <strong>02</strong>
        </div>
      </div>
      <div className="clinical-note">
        <span>NOTE DE CONTEXTE</span>
        <p>
          L'écart est calculé entre la dernière valeur de sommeil affichée et la référence illustrative.
          La durée de persistance n'est pas calculée par ce prototype ; cette alerte ne constitue pas un avis médical.
        </p>
      </div>
    </div>
  );
}
