import { useSession } from "@/context/SessionContext";
import { missionDay, sleepData, currentSleepDuration, sleepDifferenceMinutes } from "@/data/missionData";

type Membre = {
  initiales: string;
  nom: string;
  resume: string;
  etat: "nominal" | "attention" | "alerte";
};

const EQUIPAGE: Membre[] = [
  {
    initiales: "MB",
    nom: "Cmdt Mbaye",
    resume: `sommeil ${currentSleepDuration} · écart ${sleepDifferenceMinutes} min`,
    etat: "attention",
  },
  { initiales: "KP", nom: "Ing. Kouassi", resume: "indicateurs dans les références pré-vol", etat: "nominal" },
  { initiales: "AS", nom: "Dr Aminata S.", resume: "perte osseuse −1,4 % sur 90 j", etat: "attention" },
];

const ETIQUETTE: Record<Membre["etat"], string> = {
  nominal: "nominal",
  attention: "à suivre",
  alerte: "alerte",
};

export default function GroundView() {
  const { deconnecter, basculeTheme, theme } = useSession();

  return (
    <div className="rf-app">
      <aside className="sidebar" aria-label="Navigation du poste sol">
        <div className="brand">
          <div className="helix-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <div className="brand-name">GLOBALASTRO</div>
            <div className="brand-subtitle">POSTE SOL</div>
          </div>
        </div>
        <nav className="primary-nav" aria-label="Navigation principale">
          <p className="nav-section-label">SURVEILLANCE</p>
          <button type="button" className="nav-item active">
            <span>Équipage</span>
          </button>
          <button type="button" className="nav-item">
            <span>Alertes reçues</span>
            <span className="nav-count alert-count">1</span>
          </button>
          <button type="button" className="nav-item">
            <span>Journal des mesures</span>
          </button>
          <button type="button" className="nav-item">
            <span>Charge physiologique</span>
          </button>
        </nav>
        <div className="system-status">
          <div className="system-status-line">
            <span className="status-dot" />
            <span>STATION SOL</span>
          </div>
          <div className="sync-time">Aucune action en direct</div>
        </div>
      </aside>

      <main className="rf-zone">
        <header className="rf-topbar">
          <div>
            <h1>Équipage · {EQUIPAGE.length} membres</h1>
            <div className="sous">
              Mission jour {missionDay} · dernière remontée J{missionDay} 12:18 UTC
            </div>
          </div>
          <div className="droite">
            <span className="rf-tag">prochain contact · J{missionDay} 12:52 UTC</span>
            <button type="button" className="rf-btn" onClick={basculeTheme}>
              {theme === "sombre" ? "Thème clair" : "Thème sombre"}
            </button>
            <button type="button" className="rf-btn" onClick={deconnecter}>
              Se déconnecter
            </button>
          </div>
        </header>

        <div className="rf-contenu">
          <div className="rf-bandeau" role="note">
            <span aria-hidden="true">⏱</span>
            <div>
              <b>Vous ne pouvez pas agir en direct.</b>
              Un aller-retour de signal prend <b>12 minutes</b>. Une consigne écrite maintenant sera
              lue par l'équipage après la prochaine fenêtre de communication — au mieux.
            </div>
          </div>

          <div className="rf-grille rf-g2">
            <section className="rf-carte" aria-labelledby="titre-equipage">
              <p className="rf-cap">État de l'équipage</p>
              <h3 id="titre-equipage">Dernière remontée de données</h3>
              {EQUIPAGE.map((m) => (
                <div className="rf-ligne" key={m.initiales}>
                  <span className="rf-avatar">{m.initiales}</span>
                  <span>
                    <span className="nom">{m.nom}</span>
                    <br />
                    <span style={{ fontSize: 12, color: "var(--rf-muted)" }}>{m.resume}</span>
                  </span>
                  <span
                    className={`rf-tag ${m.etat === "nominal" ? "vert" : m.etat === "attention" ? "ambre" : "rouge"}`}
                    style={{ marginLeft: "auto" }}
                  >
                    {ETIQUETTE[m.etat]}
                  </span>
                </div>
              ))}
              <p className="rf-cap" style={{ marginTop: 14 }}>
                Sommeil sur 7 jours · {sleepData.days.length} mesures reçues
              </p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 62 }}>
                {sleepData.days.map((j) => {
                  const h = Math.round((j.minutes / 480) * 100);
                  const sousReference = j.minutes < sleepData.referenceMinutes;
                  return (
                    <div
                      key={j.day}
                      title={`${j.day} · ${j.duration}`}
                      style={{
                        flex: 1,
                        height: `${h}%`,
                        borderRadius: 5,
                        background: sousReference ? "rgba(245,158,11,.75)" : "var(--rf-accent)",
                      }}
                    />
                  );
                })}
              </div>
              <p style={{ fontSize: 11.5, color: "var(--rf-muted)", margin: "8px 0 0" }}>
                Référence pré-vol : 7 h 00 · les barres ambre sont sous la référence.
              </p>
            </section>

            <section className="rf-carte" aria-labelledby="titre-consigne">
              <p className="rf-cap">Instruction à transmettre</p>
              <h3 id="titre-consigne">Destinataire : Cmdt Mbaye</h3>

              <div className="rf-champ" style={{ marginTop: 14 }}>
                <label htmlFor="consigne">Consigne</label>
                <input
                  id="consigne"
                  defaultValue="Reporter l'exercice ARED · priorité à 8 h de sommeil sur 3 nuits"
                />
              </div>
              <div className="rf-champ">
                <label htmlFor="fenetre">Fenêtre d'envoi</label>
                <input id="fenetre" defaultValue={`Prochain contact · J${missionDay} 12:52 UTC`} readOnly />
              </div>

              <button type="button" className="rf-bouton">
                Mettre en file pour la prochaine fenêtre
              </button>

              <p style={{ fontSize: 11.5, color: "var(--rf-muted)", margin: "10px 0 0" }}>
                La consigne partirait avec les mesures suivantes. <b>Rien n'est transmis dans cette
                démonstration</b> : l'écran mémorise seulement l'intention.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
