import { useState } from "react";
import { useSession, type Role } from "@/context/SessionContext";

const CHOIX: { role: Role; titre: string; texte: string }[] = [
  { role: "astro", titre: "Astronaute", texte: "À bord. Suit ses indicateurs et agit." },
  { role: "sol", titre: "Médecin au sol", texte: "Sur Terre. Suit l’équipage et prépare des consignes." },
];

export default function LoginScreen() {
  const { connecter, theme } = useSession();
  const [role, setRole] = useState<Role>("astro");
  const [identifiant, setIdentifiant] = useState("cdr.mbaye");
  const [motDePasse, setMotDePasse] = useState("demo");
  const [voir, setVoir] = useState(false);
  const [erreur, setErreur] = useState("");

  const soumettre = () => {
    if (identifiant.trim().length < 3) {
      setErreur("Identifiant trop court : au moins 3 caractères.");
      return;
    }
    setErreur("");
    connecter(role, identifiant.trim());
  };

  return (
    <div className="u-login">
      <form
        className="u-login-card"
        onSubmit={(event) => {
          event.preventDefault();
          soumettre();
        }}
      >
        <aside className="u-login-aside">
          <img
            className="u-login-logo"
            src={theme === "sombre" ? "/logo-sombre.png" : "/logo-clair.png"}
            alt="GlobalAstro Health — la santé des astronautes"
          />

          <div>
            <p className="u-panel-kicker">Mission en cours</p>
            <div className="u-h" style={{ fontSize: 15 }}>Orbite basse · jour 87</div>
            <p style={{ fontSize: 12.5, color: "var(--u-ink-3)", marginTop: 4 }}>
              Surveillance de la santé d’un équipage de trois personnes en mission longue.
            </p>
          </div>

          <div className="u-login-facts">
            <div className="u-fact">
              <span className="u-dot is-warn" aria-hidden="true" style={{ marginTop: 5 }} />
              <span>
                Un aller-retour Terre ↔ orbite prend <b>12 min</b> : le médecin au sol prépare, il n’agit pas en
                direct.
              </span>
            </div>
            <div className="u-fact">
              <span className="u-dot is-ok" aria-hidden="true" style={{ marginTop: 5 }} />
              <span>
                Fonctionne <b>hors ligne</b> : les mesures restent à bord et repartent à la fenêtre suivante.
              </span>
            </div>
          </div>
        </aside>

        <div className="u-login-main">
          <div className="u-h">Connexion</div>
          <p>Choisissez votre rôle : l’interface change entièrement.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
            <label className="u-field">
              <span className="u-label">Identifiant de mission</span>
              <input
                className="u-input"
                value={identifiant}
                autoComplete="username"
                onChange={(event) => setIdentifiant(event.target.value)}
              />
            </label>

            <label className="u-field">
              <span className="u-label">Mot de passe</span>
              <span style={{ display: "flex", gap: 7 }}>
                <input
                  className="u-input"
                  type={voir ? "text" : "password"}
                  value={motDePasse}
                  autoComplete="current-password"
                  onChange={(event) => setMotDePasse(event.target.value)}
                />
                <button type="button" className="u-btn" onClick={() => setVoir((v) => !v)}>
                  {voir ? "Masquer" : "Voir"}
                </button>
              </span>
            </label>

            <div>
              <p className="u-label" style={{ marginBottom: 6 }}>
                Rôle dans la mission
              </p>
              <div className="u-roles" role="radiogroup" aria-label="Rôle dans la mission">
                {CHOIX.map((choix) => (
                  <button
                    key={choix.role}
                    type="button"
                    role="radio"
                    aria-checked={role === choix.role}
                    className={`u-role ${role === choix.role ? "is-on" : ""}`}
                    onClick={() => setRole(choix.role)}
                  >
                    <span className="u-role-radio" aria-hidden="true" />
                    <span>
                      <b>{choix.titre}</b>
                      <small>{choix.texte}</small>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {erreur && (
              <div className="u-info" role="alert">
                <span>{erreur}</span>
              </div>
            )}

            <button className="u-btn is-primary is-wide" type="submit" style={{ height: 36 }}>
              Se connecter
            </button>
          </div>

          <p style={{ fontSize: 11, color: "var(--u-ink-3)", marginTop: 16, lineHeight: 1.5 }}>
            Prototype d’aide à la décision : aucune donnée médicale réelle n’est traitée. NASA Space Apps 2026 ·
            équipe K2/\Labs.
          </p>
        </div>
      </form>
    </div>
  );
}
