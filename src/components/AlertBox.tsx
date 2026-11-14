export default function AlertBox() {
  return (
    <div className="alert-banner">
      <div className="alert-code">ALERTE / MH-SL-072</div>
      <div className="alert-banner-main">
        <div className="alert-symbol" aria-hidden="true">
          !
        </div>
        <div>
          <h2 id="alert-title">DÉRIVE DÉTECTÉE</h2>
          <p>Baisse prolongée de la durée de sommeil (−18 %) par rapport à la référence pré-vol</p>
        </div>
        <div className="alert-severity">
          <span>NIVEAU</span>
          <strong>02</strong>
        </div>
      </div>
      <div className="clinical-note">
        <span>NOTE CLINIQUE</span>
        <p>
          Écart persistant de la durée de sommeil sur 72 h, sans autre mesure non documentée.
          Intervention préventive recommandée dans le cycle en cours.
        </p>
      </div>
    </div>
  );
}
