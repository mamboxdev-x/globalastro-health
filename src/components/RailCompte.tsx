import { useSession } from "@/context/SessionContext";

/**
 * Bloc du bas du bandeau latéral : compte connecté, choix du thème, déconnexion.
 * Il vit dans le rail, et non dans la barre du haut : sur téléphone, le rail
 * étant un tiroir, ces commandes ne se mélangent plus avec le titre de l'écran.
 */
export default function RailCompte({ statut, note }: { statut: string; note: string }) {
  const { identifiant, role, theme, definirTheme, deconnecter } = useSession();

  const initiales = identifiant.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "GH";

  return (
    <div className="u-railfoot">
      <div className="u-compte">
        <span className="u-avatar" aria-hidden="true">
          {initiales}
        </span>
        <span className="u-compte-txt">
          <b>{identifiant || "invité"}</b>
          <small>{role === "sol" ? "Médecin · poste sol" : "Astronaute · à bord"}</small>
        </span>
      </div>

      <span className="u-seg-label" id="etiquette-theme">
        Thème de l’interface
      </span>
      <div className="u-seg" role="group" aria-labelledby="etiquette-theme">
        <button
          type="button"
          className={theme === "clair" ? "is-on" : ""}
          aria-pressed={theme === "clair"}
          onClick={() => definirTheme("clair")}
        >
          Clair
        </button>
        <button
          type="button"
          className={theme === "sombre" ? "is-on" : ""}
          aria-pressed={theme === "sombre"}
          onClick={() => definirTheme("sombre")}
        >
          Sombre
        </button>
      </div>

      <button type="button" className="u-btn is-wide" style={{ marginTop: 9 }} onClick={deconnecter}>
        Se déconnecter
      </button>

      <div className="u-railfoot-row" style={{ marginTop: 11 }}>
        <span className="u-dot is-warn" aria-hidden="true" />
        <span>{statut}</span>
      </div>
      <div className="u-railfoot-note">{note}</div>
    </div>
  );
}
