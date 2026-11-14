import { useSession } from "@/context/SessionContext";
import { currentSleepDuration, missionDay, sleepData, sleepDifferenceMinutes } from "@/data/missionData";

const EQUIPAGE = [
  {
    initiales: "MB",
    nom: "Cmdt Mbaye",
    resume: `Sommeil ${currentSleepDuration} · écart ${sleepDifferenceMinutes} min`,
    etat: "warn" as const,
    libelle: "À suivre",
  },
  {
    initiales: "KP",
    nom: "Ing. Kouassi",
    resume: "Tous les indicateurs dans la référence pré-vol",
    etat: "ok" as const,
    libelle: "Nominal",
  },
  {
    initiales: "AS",
    nom: "Dr Aminata S.",
    resume: "Densité osseuse −1,4 % sur 90 jours",
    etat: "warn" as const,
    libelle: "À suivre",
  },
];

const REFERENCE_MINUTES = 420;

export default function GroundView() {
  const { deconnecter, basculeTheme, theme, identifiant } = useSession();

  return (
    <div className="u-app">
      <aside className="u-rail">
        <div className="u-brand">
          <div className="u-brand-mark" aria-hidden="true" />
          <div>
            <div className="u-brand-name">GlobalAstro</div>
            <div className="u-brand-sub">Poste sol</div>
          </div>
        </div>

        <nav className="u-nav" aria-label="Navigation du poste sol">
          <p className="u-nav-label">Surveillance</p>
          <button type="button" className="u-nav-btn is-active">
            <span>Équipage</span>
          </button>
          <button type="button" className="u-nav-btn">
            <span>Alertes reçues</span>
            <span className="u-nav-count">1</span>
          </button>
          <button type="button" className="u-nav-btn">
            <span>Journal des mesures</span>
          </button>
          <button type="button" className="u-nav-btn">
            <span>Consignes envoyées</span>
          </button>
        </nav>

        <div className="u-railfoot">
          <div className="u-railfoot-row">
            <span className="u-dot is-alert" aria-hidden="true" />
            <span>Station sol · liaison par fenêtres</span>
          </div>
          <div className="u-railfoot-note">aucune action en direct</div>
        </div>
      </aside>

      <main className="u-main" id="main-content">
        <header className="u-top">
          <div>
            <div className="u-title">Équipage · {EQUIPAGE.length} membres</div>
            <div className="u-sub">
              Dernière remontée jour {missionDay} · 12:18 UTC · prochaine fenêtre 12:52 UTC
            </div>
          </div>
          <div className="u-top-actions">
            <span className="u-chip">{identifiant || "médecin au sol"}</span>
            <span className="u-chip is-warn">
              <span className="u-dot is-warn" aria-hidden="true" />
              Prototype · données simulées
            </span>
            <button type="button" className="u-btn is-quiet" onClick={basculeTheme}>
              {theme === "sombre" ? "Thème clair" : "Thème sombre"}
            </button>
            <button type="button" className="u-btn is-quiet" onClick={deconnecter}>
              Quitter
            </button>
          </div>
        </header>

        <div className="u-body">
          <div className="u-info">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16h.01" />
            </svg>
            <span>
              <b>Vous ne pouvez pas agir en direct.</b>
              Une consigne écrite maintenant sera lue par l’équipage après la prochaine fenêtre de communication, au
              mieux : le signal met 12 minutes pour un aller-retour.
            </span>
          </div>

          <div className="u-grid g2">
            <section className="u-panel" aria-labelledby="crew-title">
              <div className="u-panel-head">
                <div>
                  <p className="u-panel-kicker">Dernières mesures reçues · 12:18 UTC</p>
                  <h2 className="u-panel-title" id="crew-title">
                    État de l’équipage
                  </h2>
                </div>
                <div className="u-panel-right">
                  <span className="u-chip mono">J{missionDay}</span>
                </div>
              </div>

              <div className="u-panel-body tight">
                <div className="u-rows">
                  {EQUIPAGE.map((membre) => (
                    <div className="u-row" key={membre.initiales}>
                      <span className="u-row-value is-muted" style={{ width: 26 }}>{membre.initiales}</span>
                      <span className="u-row-k">
                        <b>{membre.nom}</b>
                        <small>{membre.resume}</small>
                      </span>
                      <span className={`u-chip ${membre.etat === "ok" ? "is-ok" : "is-warn"}`}>
                        <span className={`u-dot is-${membre.etat}`} aria-hidden="true" />
                        {membre.libelle}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="u-panel-foot">
                Ces valeurs proviennent de la couche de démonstration et ne sont pas transmises par un capteur réel.
              </div>
            </section>

            <section className="u-panel" aria-labelledby="consigne-title">
              <div className="u-panel-head">
                <div>
                  <p className="u-panel-kicker">Destinataire · Cmdt Mbaye</p>
                  <h2 className="u-panel-title" id="consigne-title">
                    Instruction à transmettre
                  </h2>
                </div>
                <div className="u-panel-right">
                  <span className="u-chip is-warn mono">12 min</span>
                </div>
              </div>

              <div className="u-panel-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label className="u-field">
                  <span className="u-label">Consigne</span>
                  <input className="u-input" defaultValue="Reporter l’exercice ARED et viser 8 h de sommeil sur 3 nuits" />
                </label>
                <label className="u-field">
                  <span className="u-label">Fenêtre d’envoi</span>
                  <input className="u-input" readOnly value={`Prochain contact · jour ${missionDay} 12:52 UTC`} />
                </label>
                <button type="button" className="u-btn is-primary is-wide">
                  Mettre en file pour la prochaine fenêtre
                </button>
              </div>

              <div className="u-panel-foot">
                La consigne partirait avec les mesures suivantes. Rien n’est transmis dans cette démonstration :
                l’écran mémorise seulement l’intention.
              </div>
            </section>
          </div>

          <section className="u-panel" aria-labelledby="ground-sleep-title">
            <div className="u-panel-head">
              <div>
                <p className="u-panel-kicker">Reçu de l’équipage · 7 dernières nuits</p>
                <h2 className="u-panel-title" id="ground-sleep-title">
                  Sommeil à bord
                </h2>
              </div>
              <div className="u-panel-right">
                <span className="u-chip is-warn mono">3 nuits sous la référence</span>
              </div>
            </div>

            <div className="u-panel-body">
              <div
                className="u-bars"
                role="img"
                aria-label={`Sommeil à bord : ${sleepData.days.map((entry) => `${entry.day} ${entry.duration}`).join(", ")}`}
              >
                {sleepData.days.map((entry) => (
                  <div className="u-bar" key={entry.day} aria-hidden="true">
                    <span className="u-bar-value">{entry.duration}</span>
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

            <div className="u-panel-foot">Référence pré-vol 7 h 00. Les barres ambre sont sous la référence.</div>
          </section>
        </div>

        <footer className="u-foot">
          <span>
            GlobalAstro Health <b>v1.2.0</b>
          </span>
          <span className="mid">Poste sol · prototype de démonstration · aucune donnée réelle</span>
          <span>K2/\Labs</span>
        </footer>
      </main>
    </div>
  );
}
