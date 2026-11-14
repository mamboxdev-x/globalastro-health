import { useDemoState } from "@/context/DemoStateContext";

const packetRows = [
  ["14:05:42", "ECG-HRV / BIO-04", "128,4", "EXEMPLE"],
  ["14:05:18", "TENSION / CARD-02", "42,8", "EXEMPLE"],
  ["14:04:56", "OS / DMO-04", "18,2", "EXEMPLE"],
  ["14:04:12", "SOMMEIL / ACT-07", "256,0", "EXEMPLE"],
  ["14:03:44", "RADIATION / RAD-01", "12,6", "EXEMPLE"],
];

export default function OfflineSync() {
  const { syncRequestPrepared, prepareSyncRequest } = useDemoState();

  return (
    <section className="offline-overview" aria-labelledby="offline-title">
      <div className="link-status-panel">
        <div className="link-status-top">
          <div className="link-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M5 8.5a11 11 0 0 1 13.5-1.3M3 12a15 15 0 0 1 2.8-2M8.5 13.3a5.5 5.5 0 0 1 5.8-.4M12 18h.1M3 3l18 18" /></svg>
          </div>
          <div>
            <p className="panel-kicker">ÉTAT DE LIAISON TERRE—ESPACE</p>
            <h2 id="offline-title">INTERFACE HORS LIGNE · MODE DÉMONSTRATION</h2>
          </div>
          <span className="los-badge">NON CONNECTÉ</span>
        </div>
        <div className="link-times">
          <div><span>DERNIÈRE SYNCHRONISATION</span><strong>NON DISPONIBLE</strong></div>
          <div><span>PROCHAINE FENÊTRE</span><strong>NON RENSEIGNÉE</strong></div>
          <div><span>PASSAGE ORBITAL</span><strong>NON CONNECTÉ</strong></div>
        </div>
      </div>

      <section className="buffer-panel" aria-labelledby="buffer-title">
        <div className="buffer-heading">
          <div>
            <p className="panel-kicker">STOCKAGE LOCAL · DONNÉES FICTIVES</p>
            <h2 id="buffer-title">Exemple de stockage tampon</h2>
          </div>
          <div className="buffer-value"><strong>14,8</strong><span>Mo / 64 Mo · exemple</span></div>
        </div>
        <div className="buffer-meta">
          <span>PAQUETS PRÉSENTÉS DANS LA MAQUETTE</span>
          <strong>2 410 · VALEUR FICTIVE</strong>
        </div>
        <div className="buffer-track" role="progressbar" aria-label="Espace utilisé dans l'exemple de stockage" aria-valuemin={0} aria-valuemax={100} aria-valuenow={23.1}>
          <span style={{ width: "23.1%" }} />
        </div>
        <div className="buffer-scale"><span>0 Mo</span><span>23,1 % ILLUSTRATIF</span><span>64 Mo</span></div>
      </section>

      <section className="packet-panel" aria-labelledby="packet-title">
        <div className="packet-header">
          <div><p className="panel-kicker">JOURNAL TECHNIQUE FICTIF</p><h2 id="packet-title">Échantillon de paquets</h2></div>
          <span>DONNÉES DE DÉMO</span>
        </div>
        <div className="packet-table-wrap">
          <table className="packet-table">
            <caption className="sr-only">Exemple fictif de paquets qui ne sont pas réellement stockés ni transmis</caption>
            <thead><tr><th scope="col">HORODATAGE EXEMPLE</th><th scope="col">SOURCE SIMULÉE</th><th scope="col">TAILLE (Ko)</th><th scope="col">STATUT</th></tr></thead>
            <tbody>
              {packetRows.map((row) => (
                <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${index}`} className={index === 3 ? "packet-status" : ""}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className={`sync-button ${syncRequestPrepared ? "queued" : ""}`}
          onClick={prepareSyncRequest}
          aria-pressed={syncRequestPrepared}
        >
          {syncRequestPrepared ? "DEMANDE DE SYNCHRONISATION SIMULÉE" : "SIMULER UNE DEMANDE DE SYNCHRONISATION"}
        </button>
        <p className="helper-text" role="status">
          {syncRequestPrepared
            ? "L'interface a enregistré une demande de démonstration. Aucun paquet n'a été transmis."
            : "Le stockage réel, le chiffrement, la file de paquets et la liaison radio ne sont pas implémentés."}
        </p>
      </section>
    </section>
  );
}
