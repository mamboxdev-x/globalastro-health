import { useState } from "react";
import { useSession, type Role } from "@/context/SessionContext";

type Choix = {
  role: Role;
  titre: string;
  texte: string;
};

const CHOIX: Choix[] = [
  {
    role: "astro",
    titre: "Astronaute",
    texte: "À bord. Suit ses indicateurs, agit, demande un avis au sol.",
  },
  {
    role: "sol",
    titre: "Docteur · sol",
    texte: "Sur Terre. Suit l'équipage, prépare des consignes.",
  },
];

export default function LoginScreen() {
  const { connecter } = useSession();
  const [role, setRole] = useState<Role>("astro");
  const [identifiant, setIdentifiant] = useState("cdr.mbaye");
  const [motDePasse, setMotDePasse] = useState("demo");
  const [voirMotDePasse, setVoirMotDePasse] = useState(false);
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
    <div className="rf-login">
      <form
        className="rf-login-carte"
        onSubmit={(e) => {
          e.preventDefault();
          soumettre();
        }}
      >
        <div className="rf-marque">
          <div className="rf-marque-icone" aria-hidden="true" />
          <div className="rf-marque-nom">
            GlobalAstro Health
            <small>Crew Health System</small>
          </div>
        </div>

        <div className="rf-champ">
          <label htmlFor="identifiant">Identifiant de mission</label>
          <input
            id="identifiant"
            value={identifiant}
            autoComplete="username"
            onChange={(e) => setIdentifiant(e.target.value)}
          />
        </div>

        <div className="rf-champ">
          <label htmlFor="motdepasse">Mot de passe</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              id="motdepasse"
              type={voirMotDePasse ? "text" : "password"}
              value={motDePasse}
              autoComplete="current-password"
              onChange={(e) => setMotDePasse(e.target.value)}
            />
            <button
              type="button"
              className="rf-btn"
              style={{ flex: "0 0 auto" }}
              onClick={() => setVoirMotDePasse((v) => !v)}
              aria-label={voirMotDePasse ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {voirMotDePasse ? "Masquer" : "Voir"}
            </button>
          </div>
        </div>

        <p className="rf-cap">Votre rôle dans la mission</p>
        <div className="rf-roles" role="radiogroup" aria-label="Rôle dans la mission">
          {CHOIX.map((c) => (
            <button
              key={c.role}
              type="button"
              role="radio"
              aria-checked={role === c.role}
              className={`rf-role ${role === c.role ? "on" : ""}`}
              onClick={() => setRole(c.role)}
            >
              <span className="puce" aria-hidden="true" />
              <span>
                <b>{c.titre}</b>
                <span className="texte">{c.texte}</span>
              </span>
            </button>
          ))}
        </div>

        {erreur && (
          <p className="rf-note" role="alert" style={{ borderLeft: "3px solid var(--rf-alert)" }}>
            {erreur}
          </p>
        )}

        <button className="rf-bouton" type="submit">
          Se connecter
        </button>

        <div className="rf-note">
          <b>Mode démonstration.</b> Aucune donnée médicale réelle : toutes les mesures sont simulées.
          Le rôle « Docteur · sol » ne transmet rien — il prépare une consigne, que le délai de
          communication rend visible (<b>12 min aller-retour</b>).
        </div>

        <p className="rf-pied-carte">
          Prototype · aucune donnée réelle · <b>GlobalAstro Health</b> — NASA Space Apps 2026
        </p>
      </form>
    </div>
  );
}
