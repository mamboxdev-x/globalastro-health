import { useDemoState } from "@/context/DemoStateContext";
import { useBackend, useLienBord } from "@/context/BackendContext";
import { formatDate } from "@/data/api";

const packetRows = [
  ["14:05:42", "ECG-HRV / BIO-04", "128,4"],
  ["14:05:18", "Tension / CARD-02", "42,8"],
  ["14:04:56", "Os / DMO-04", "18,2"],
  ["14:04:12", "Sommeil / ACT-07", "256,0"],
  ["14:03:44", "Radiation / RAD-01", "12,6"],
];

export default function OfflineSync() {
  const { syncRequestPrepared, prepareSyncRequest } = useDemoState();
  const { bord } = useBackend();
  const lien = useLienBord(bord);

  return (
    <>
      <div className="u-shead">
        <div>
          <h2>Hors ligne</h2>
          <p>État de la liaison, stockage tampon et file d’attente</p>
        </div>
        <div className="right">
          <span className="u-chip is-warn">Liaison interrompue</span>
        </div>
      </div>

      {bord && (
        <section className="u-panel" aria-labelledby="lien-reel">
          <div className="u-panel-head">
            <div>
              <p className="u-panel-kicker">Passerelle de bord · valeurs réellement mesurées</p>
              <h2 className="u-panel-title" id="lien-reel">
                Liaison avec le poste sol
              </h2>
            </div>
            <div className="u-panel-right">
              <span className={`u-chip ${lien?.enabled ? "is-ok" : "is-alert"}`}>
                <span className={`u-dot ${lien?.enabled ? "is-ok" : "is-alert"}`} aria-hidden="true" />
                {lien?.enabled ? "connectée" : "coupée"}
              </span>
            </div>
          </div>

          <div className="u-stats">
            <div className="u-stat">
              <span className="u-stat-k">Mesures en file à bord</span>
              <span className="u-stat-v">{lien ? lien.pending_rows : "—"}</span>
            </div>
            <div className="u-stat">
              <span className="u-stat-k">Dernier échange réussi</span>
              <span className="u-stat-v" style={{ fontSize: 13 }}>{formatDate(lien?.last_ok ?? null)}</span>
            </div>
            <div className="u-stat">
              <span className="u-stat-k">Dernière erreur</span>
              <span className="u-stat-v" style={{ fontSize: 13 }}>{lien?.last_error ?? "aucune"}</span>
            </div>
          </div>

          <div className="u-panel-foot">
            Lu directement sur la passerelle de bord : la file d’attente et l’état du lien ne sont pas simulés par
            l’interface. La synchronisation attend la fermeture des fenêtres de 5 minutes avant d’envoyer.
          </div>
        </section>
      )}

      <section className="u-panel" aria-labelledby="link-title">
        <div className="u-link">
          <div className="u-link-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M5 8.5a11 11 0 0 1 13.5-1.3M3 12a15 15 0 0 1 2.8-2M8.5 13.3a5.5 5.5 0 0 1 5.8-.4M12 18h.1M3 3l18 18" />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <p className="u-panel-kicker">Liaison Terre — orbite</p>
            <h2 className="u-panel-title" id="link-title">
              Perte de signal en cours
            </h2>
          </div>
          <div className="u-panel-right">
            <span className="u-chip is-alert mono">LOS</span>
          </div>
        </div>

        <div className="u-stats">
          <div className="u-stat">
            <span className="u-stat-k">Dernier échange</span>
            <span className="u-stat-v">—</span>
          </div>
          <div className="u-stat">
            <span className="u-stat-k">Prochaine fenêtre</span>
            <span className="u-stat-v">—</span>
          </div>
          <div className="u-stat">
            <span className="u-stat-k">Paquets en attente</span>
            <span className="u-stat-v">
              2 410
              <small>· simulés</small>
            </span>
          </div>
        </div>

        <div className="u-panel-foot">
          La date du dernier échange et l’heure de la prochaine fenêtre ne sont pas fournies par ce prototype.
        </div>
      </section>

      <section className="u-panel" aria-labelledby="buffer-title">
        <div className="u-panel-head">
          <div>
            <p className="u-panel-kicker">Stockage local</p>
            <h2 className="u-panel-title" id="buffer-title">
              Tampon de données physiologiques
            </h2>
          </div>
          <div className="u-panel-right">
            <span className="u-metric-value" style={{ fontSize: 21 }}>
              14,8
              <small>Mo / 64 Mo</small>
            </span>
          </div>
        </div>

        <div className="u-panel-body">
          <div className="u-track" role="progressbar" aria-label="Occupation du tampon" aria-valuemin={0} aria-valuemax={100} aria-valuenow={23}>
            <span style={{ width: "23%" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontSize: 11.5, color: "var(--u-ink-3)" }}>
            <span>0 Mo</span>
            <span>23 % occupé</span>
            <span>64 Mo</span>
          </div>
        </div>

        <div className="u-panel-foot">
          Le chiffrement et l’écriture réelle des paquets ne sont pas implémentés dans ce prototype.
        </div>
      </section>

      <section className="u-panel" aria-labelledby="packet-title">
        <div className="u-panel-head">
          <div>
            <p className="u-panel-kicker">Journal technique</p>
            <h2 className="u-panel-title" id="packet-title">
              Paquets en file d’attente
            </h2>
          </div>
          <div className="u-panel-right">
            <span className="u-chip mono">5 derniers</span>
          </div>
        </div>

        <div className="u-panel-body tight">
          <table className="u-table">
            <caption className="sr-only">Exemple de paquets en attente de synchronisation</caption>
            <thead>
              <tr>
                <th scope="col">Horodatage UTC</th>
                <th scope="col">Source</th>
                <th scope="col" className="is-num">Taille (Ko)</th>
              </tr>
            </thead>
            <tbody>
              {packetRows.map((row) => (
                <tr key={row[0]}>
                  <td>{row[0]}</td>
                  <td>{row[1]}</td>
                  <td className="is-num">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="u-panel-body" style={{ borderTop: "1px solid var(--u-line)", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className={`u-btn ${syncRequestPrepared ? "is-done" : "is-primary"}`}
            onClick={prepareSyncRequest}
            aria-pressed={syncRequestPrepared}
          >
            {syncRequestPrepared ? "Synchronisation préparée" : "Préparer la synchronisation"}
          </button>
          <span style={{ fontSize: 12.5, color: "var(--u-ink-3)" }}>
            {syncRequestPrepared
              ? "La demande est enregistrée localement. Aucun paquet n’a été transmis."
              : "Les paquets repartiront en bloc dès le retour de la liaison."}
          </span>
        </div>
      </section>
    </>
  );
}
