import { useEffect, useState } from "react";
import { useSession, type Role } from "@/context/SessionContext";

const CHOIX: { role: Role; titre: string; texte: string }[] = [
  { role: "astro", titre: "Astronaute", texte: "À bord. Suit ses indicateurs et agit." },
  { role: "sol", titre: "Médecin au sol", texte: "Sur Terre. Suit l’équipage et prépare des consignes." },
];

type Mode = "connexion" | "inscription";

export default function LoginScreen() {
  const { connecter, creerCompte, entrerDemo, comptes, theme } = useSession();
  const [mode, setMode] = useState<Mode>("connexion");
  const [role, setRole] = useState<Role>("astro");
  const [identifiant, setIdentifiant] = useState("cdr.mbaye");
  const [motDePasse, setMotDePasse] = useState("demo1234");
  const [voir, setVoir] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");

  // Profil du nouvel astronaute : ces valeurs alimentent la simulation des capteurs.
  const [poids, setPoids] = useState("78");
  const [taille, setTaille] = useState("1.82");
  const [sexe, setSexe] = useState<"H" | "F">("H");
  const [service, setService] = useState("Centre de contrôle");

  // Ceinture et bretelles : si la connexion s'affiche alors qu'un tiroir de navigation
  // était ouvert, l'interdiction de défiler posée sur le body doit tomber — sinon le
  // choix du rôle devient inatteignable sur téléphone.
  useEffect(() => {
    document.body.style.overflow = "";
  }, []);

  const basculerMode = () => {
    setMode((actuel) => (actuel === "connexion" ? "inscription" : "connexion"));
    setErreur("");
    setSucces("");
  };

  const soumettre = async () => {
    setErreur("");
    setSucces("");

    if (identifiant.trim().length < 3) {
      setErreur("Identifiant trop court : au moins 3 caractères.");
      return;
    }

    if (mode === "inscription") {
      const poidsNombre = Number.parseFloat(poids.replace(",", "."));
      const tailleNombre = Number.parseFloat(taille.replace(",", "."));

      if (role === "astro" && (!Number.isFinite(poidsNombre) || !Number.isFinite(tailleNombre))) {
        setErreur("Poids et taille doivent être des nombres (ex. 78 et 1.82).");
        return;
      }

      const creation = await creerCompte({
        identifiant: identifiant.trim(),
        motDePasse,
        role,
        profil:
          role === "astro"
            ? { poidsKg: poidsNombre, tailleM: tailleNombre, sexe }
            : { service: service.trim() },
      });

      if (!creation.ok) {
        setErreur(creation.message ?? "Création impossible.");
        return;
      }

      const entree = await connecter(role, identifiant.trim(), motDePasse);
      if (!entree.ok) {
        setErreur(entree.message ?? "Connexion impossible.");
        return;
      }
      return;
    }

    const entree = await connecter(role, identifiant.trim(), motDePasse);
    if (!entree.ok) {
      setErreur(entree.message ?? "Connexion impossible.");
      return;
    }
  };

  const inscription = mode === "inscription";

  return (
    <div className="u-login">
      <form
        className="u-login-card"
        onSubmit={(event) => {
          event.preventDefault();
          void soumettre();
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
            {comptes.length > 0 && (
              <div className="u-fact">
                <span className="u-dot" aria-hidden="true" style={{ marginTop: 5 }} />
                <span>
                  <b>{comptes.length}</b> compte(s) créé(s) dans ce navigateur.
                </span>
              </div>
            )}
          </div>
        </aside>

        <div className="u-login-main">
          <div className="u-h">{inscription ? "Créer un compte" : "Connexion"}</div>
          <p>
            {inscription
              ? "Le compte est conservé dans ce navigateur : c’est un prototype, il n’y a pas de serveur d’identité."
              : "Choisissez votre rôle : l’interface change entièrement."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
            <label className="u-field">
              <span className="u-label">{role === "astro" ? "Identifiant de mission" : "Identifiant du médecin"}</span>
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
                  autoComplete={inscription ? "new-password" : "current-password"}
                  onChange={(event) => setMotDePasse(event.target.value)}
                />
                <button type="button" className="u-btn" onClick={() => setVoir((v) => !v)}>
                  {voir ? "Masquer" : "Voir"}
                </button>
              </span>
            </label>

            <div>
              <p className="u-label" style={{ marginBottom: 6 }}>
                {inscription ? "Type de compte" : "Rôle dans la mission"}
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

            {inscription && role === "astro" && (
              <>
                <p className="u-note" style={{ margin: 0 }}>
                  Ces trois valeurs alimentent la simulation des capteurs (receiver + capteurs Python) : elles
                  servent au poids, à la masse maigre et au débit cardiaque.
                </p>
                <span style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <label className="u-field">
                    <span className="u-label">Poids (kg)</span>
                    <input className="u-input" value={poids} onChange={(event) => setPoids(event.target.value)} />
                  </label>
                  <label className="u-field">
                    <span className="u-label">Taille (m)</span>
                    <input className="u-input" value={taille} onChange={(event) => setTaille(event.target.value)} />
                  </label>
                  <label className="u-field">
                    <span className="u-label">Sexe</span>
                    <select className="u-input" value={sexe} onChange={(event) => setSexe(event.target.value as "H" | "F")}>
                      <option value="H">H</option>
                      <option value="F">F</option>
                    </select>
                  </label>
                </span>
              </>
            )}

            {inscription && role === "sol" && (
              <label className="u-field">
                <span className="u-label">Service</span>
                <input className="u-input" value={service} onChange={(event) => setService(event.target.value)} />
              </label>
            )}

            {erreur && (
              <div className="u-info" role="alert">
                <span>{erreur}</span>
              </div>
            )}
            {succes && (
              <div className="u-info" role="status" style={{ background: "var(--u-ok-soft)", color: "var(--u-ok)" }}>
                <span>{succes}</span>
              </div>
            )}

            <button className="u-btn is-primary is-wide" type="submit" style={{ height: 36 }}>
              {inscription ? "Créer le compte et entrer" : "Se connecter"}
            </button>

            <button
              type="button"
              className="u-btn is-quiet is-wide"
              onClick={basculerMode}
              style={{ textDecoration: "underline" }}
            >
              {inscription ? "J’ai déjà un compte" : "Créer un compte astronaute ou médecin"}
            </button>

            {!inscription && (
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 4 }}>
                <p className="u-label" style={{ margin: 0 }}>
                  Pas de compte sous la main
                </p>
                <span style={{ display: "flex", gap: 7 }}>
                  <button type="button" className="u-btn is-wide" onClick={() => entrerDemo("astro")}>
                    Démonstration · astronaute
                  </button>
                  <button type="button" className="u-btn is-wide" onClick={() => entrerDemo("sol")}>
                    Démonstration · médecin
                  </button>
                </span>
              </div>
            )}
          </div>

          <p style={{ fontSize: 11, color: "var(--u-ink-3)", marginTop: 16, lineHeight: 1.5 }}>
            Comptes de démonstration : <b>cdr.mbaye</b> (astronaute) et <b>dr.anderson</b> (médecin), mot de passe{" "}
            <b>demo1234</b>.{" "}
            {inscription && comptes.length > 0
              ? `Comptes connus : ${comptes.map((c) => `${c.identifiant} (${c.role === "astro" ? "astronaute" : "médecin"})`).join(", ")}. `
              : ""}
            Prototype d’aide à la décision : aucune donnée médicale réelle n’est traitée. NASA Space Apps 2026 ·
            équipe K2/\Labs.
          </p>
        </div>
      </form>
    </div>
  );
}
