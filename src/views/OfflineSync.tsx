import { useState } from "react";

const packetRows = [
  ["14:05:42", "ECG-HRV / BIO-04", "128,4", "EN ATTENTE"],
  ["14:05:18", "TENSION / CARD-02", "42,8", "EN ATTENTE"],
  ["14:04:56", "OS / DMO-04", "18,2", "EN ATTENTE"],
  ["14:04:12", "SOMMEIL / ACT-07", "256,0", "EN ATTENTE"],
  ["14:03:44", "RADIATION / RAD-01", "12,6", "EN ATTENTE"],
];

export default function OfflineSync() {
  const [syncState, setSyncState] = useState<"idle" | "queued">("idle");

  return (
    <section className="offline-overview" aria-labelledby="offline-title">
      <div className="link-status-panel">
        <div className="link-status-top">
          <div className="link-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M5 8.5a11 11 0 0 1 13.5-1.3M3 12a15 15 0 0 1 2.8-2M8.5 13.3a5.5 5.5 0 0 1 5.8-.4M12 18h.1M3 3l18 18" />
            </svg>
          </div>
          <div>
            <p className="panel-kicker">ÉTAT DE LIAISON TERRE—ESPACE</p>
            <h2 id="offline-title">LIAISON SOL : PERTE DE SIGNAL ORBITAL (LOS)</h2>
          </div>
          <span className="los-badge">MODE AUTONOME</span>
        </div>
        <div className="link-times">
          <div>
            <span>DERNIER SYNC</span>
            <strong>J87 12:18 UTC</strong>
          </div>
          <div>
            <span>PROCHAIN AOS</span>
            <strong>DANS 34 MIN</strong>
          </div>
          <div>
            <span>ORBIT PASS</span>
            <strong>REV 1284</strong>
          </div>
        </div>
      </div>

      <section className="buffer-panel" aria-labelledby="buffer-title">
        <div className="buffer-heading">
          <div>
            <p className="panel-kicker">MODULE MATÉRIEL / ESP32</p>
            <h2 id="buffer-title">Stockage tampon local</h2>
          </div>
          <div className="buffer-value">
            <strong>14,8</strong>
            <span>Mo / 64 Mo</span>
          </div>
        </div>
        <div className="buffer-meta">
          <span>DONNÉES STOCKÉES LOCALEMENT</span>
          <strong>2 410 PAQUETS CHIFFRÉS AES-256 EN ATTENTE</strong>
        </div>
        <div className="buffer-track" aria-label="23 pour cent du stockage local utilisé">
          <span style={{ width: "23.1%" }} />
        </div>
        <div className="buffer-scale">
          <span>0 Mo</span>
          <span>23,1 % UTILISÉ</span>
          <span>64 Mo</span>
        </div>
      </section>

      <section className="packet-panel" aria-labelledby="packet-title">
        <div className="packet-header">
          <div>
            <p className="panel-kicker">JOURNAL TECHNIQUE LOCAL</p>
            <h2 id="packet-title">Derniers paquets sauvegardés</h2>
          </div>
          <span>AUTO-ENREGISTREMENT ACTIF</span>
        </div>
        <div className="packet-table-wrap">
          <table className="packet-table">
            <thead>
              <tr>
                <th>HORODATAGE UTC</th>
                <th>CAPTEUR SOURCE</th>
                <th>TAILLE (Ko)</th>
                <th>STATUT</th>
              </tr>
            </thead>
            <tbody>
              {packetRows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (
                    <td key={cell} className={index === 3 ? "packet-status" : ""}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className={`sync-button ${syncState === "queued" ? "queued" : ""}`}
          onClick={() => setSyncState("queued")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 7v5h-5M4 17v-5h5M6.1 9a7 7 0 0 1 11.6-2.5L20 9M4 15l2.3 2.5A7 7 0 0 0 18 15" />
          </svg>
          {syncState === "queued" ? "SYNCHRONISATION MISE EN FILE" : "FORCER LA SYNCHRONISATION"}
        </button>
      </section>
    </section>
  );
}
