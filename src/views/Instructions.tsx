import { useEffect } from "react";
import { useSession } from "@/context/SessionContext";
import { useConsignes, type ConsignePartagee, type EtatConsigne } from "@/data/consignes";
import { missionDay } from "@/data/missionData";

const LIBELLE: Record<EtatConsigne, { texte: string; classe: string }> = {
  attente: { texte: "en file au sol", classe: "is-warn" },
  transmise: { texte: "livrée au bord", classe: "is-accent" },
  lue: { texte: "lue", classe: "is-ok" },
};

function Ligne({
  consigne,
  aMoi,
  onLire,
}: {
  consigne: ConsignePartagee;
  aMoi: boolean;
  onLire?: () => void;
}) {
  return (
    <div className="u-row">
      <span className="u-row-value is-muted" style={{ width: 120 }}>
        {consigne.miseEnFile}
      </span>
      <span className="u-row-k">
        <b>{consigne.texte}</b>
        <small>
          {aMoi ? "À votre attention" : `Destinataire · ${consigne.destinataire}`}
          {consigne.lueLe ? ` · lue le ${consigne.lueLe}` : ""}
        </small>
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className={`u-chip ${LIBELLE[consigne.etat].classe}`}>{LIBELLE[consigne.etat].texte}</span>
        {aMoi && consigne.etat !== "lue" && onLire && (
          <button type="button" className="u-btn" onClick={onLire}>
            J’ai lu
          </button>
        )}
      </span>
    </div>
  );
}

/**
 * Écran de réception, côté astronaute : les consignes préparées au sol arrivent avec la
 * fenêtre de communication suivante, et l’équipage accuse réception ici — ce qui referme
 * la boucle ouverte par l’écran « Consignes envoyées » du médecin.
 */
export default function Instructions() {
  const { identifiant } = useSession();
  const { liste, changerEtat } = useConsignes();

  const mesConsignes = liste.filter((consigne) => consigne.destinataire === identifiant);
  const fileGenerale = liste.filter((consigne) => consigne.destinataire !== identifiant);
  const aLire = mesConsignes.filter((consigne) => consigne.etat !== "lue");
  const attente = mesConsignes.filter((consigne) => consigne.etat === "attente");
  const cleAttente = attente.map((consigne) => consigne.id).join(",");

  // La fenêtre de communication est passée : ce qui était encore en file au sol est
  // maintenant livré à bord. On ne le fait qu'une fois par consigne.
  useEffect(() => {
    attente.forEach((consigne) => changerEtat(consigne.id, "transmise"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleAttente]);

  const marquerLue = (consigne: ConsignePartagee) =>
    changerEtat(consigne.id, "lue", `jour ${missionDay} · ${new Date().toISOString().slice(11, 16)} UTC`);

  return (
    <>
      <div className="u-info">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16h.01" />
        </svg>
        <span>
          <b>Les consignes arrivent avec la fenêtre de communication.</b>
          Le sol ne peut pas vous parler en direct : comptez au mieux 12 minutes pour un aller-retour, et une
          consigne écrite hors fenêtre attend la suivante. Accusez réception une fois l’instruction lue, le médecin
          le verra de son côté.
        </span>
      </div>

      <section className="u-panel" aria-labelledby="recues-titre">
        <div className="u-panel-head">
          <div>
            <p className="u-panel-kicker">Poste sol · reçues à bord</p>
            <h2 className="u-panel-title" id="recues-titre">
              {aLire.length
                ? `${aLire.length} instruction(s) à lire`
                : mesConsignes.length
                  ? "Toutes vos instructions sont lues"
                  : "Aucune instruction pour vous"}
            </h2>
          </div>
          <div className="u-panel-right">
            <span className={`u-chip ${aLire.length ? "is-warn" : "is-ok"} mono`}>
              {aLire.length ? `jour ${missionDay}` : "à jour"}
            </span>
          </div>
        </div>

        <div className="u-panel-body tight">
          <div className="u-rows">
            {mesConsignes.length === 0 && (
              <div className="u-row">
                <span className="u-row-value is-muted" style={{ width: 120 }}>
                  —
                </span>
                <span className="u-row-k">
                  <b>Rien en attente</b>
                  <small>
                    Le poste sol n’a pas mis d’instruction à votre nom. Celles-ci apparaissent après la prochaine
                    fenêtre.
                  </small>
                </span>
                <span className="u-chip">silence radio</span>
              </div>
            )}
            {mesConsignes.map((consigne) => (
              <Ligne key={consigne.id} consigne={consigne} aMoi onLire={() => marquerLue(consigne)} />
            ))}
          </div>
        </div>

        {(aLire.length > 1 || mesConsignes.some((consigne) => consigne.etat === "lue")) && (
          <div className="u-panel-body" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {aLire.length > 1 && (
              <button
                type="button"
                className="u-btn is-primary"
                onClick={() => aLire.forEach((consigne) => marquerLue(consigne))}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
        )}

        <div className="u-panel-foot">
          Une consigne lue ici est marquée « lue par l’équipage » sur l’écran du médecin, au poste sol.
        </div>
      </section>

      <section className="u-panel" aria-labelledby="generale-titre">
        <div className="u-panel-head">
          <div>
            <p className="u-panel-kicker">File commune · à titre d’information</p>
            <h2 className="u-panel-title" id="generale-titre">
              Instructions destinées aux autres
            </h2>
          </div>
          <div className="u-panel-right">
            <span className="u-chip mono">{fileGenerale.length} consigne(s)</span>
          </div>
        </div>

        <div className="u-panel-body tight">
          <div className="u-rows">
            {fileGenerale.length === 0 ? (
              <div className="u-row">
                <span className="u-row-value is-muted" style={{ width: 120 }}>
                  —
                </span>
                <span className="u-row-k">
                  <b>File vide</b>
                  <small>Aucune consigne n’est adressée aux autres membres pour le moment.</small>
                </span>
                <span className="u-chip is-ok">à jour</span>
              </div>
            ) : (
              fileGenerale.map((consigne) => <Ligne key={consigne.id} consigne={consigne} aMoi={false} />)
            )}
          </div>
        </div>

        <div className="u-panel-foot">
          Affichées pour information : une consigne médicale reste destinée à la personne nommée. Vous ne pouvez
          accuser réception que de vos propres instructions.
        </div>
      </section>
    </>
  );
}
