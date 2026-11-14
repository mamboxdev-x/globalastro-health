import AlertBox from "@/components/AlertBox";
import { useDemoState } from "@/context/DemoStateContext";

const alertActions = [
  { id: "light", title: "Examiner le protocole de récupération lumineuse", detail: "À valider avec le médecin au sol" },
  { id: "load", title: "Réévaluer la charge cognitive du jour", detail: "Alléger les tâches non critiques" },
  { id: "sleep", title: "Consigner le sommeil et le ressenti", detail: "Avant la prochaine période de repos" },
] as const;

export default function AlertView() {
  const { checkedAlertActions, toggleAlertAction, contactRequestPrepared, prepareContactRequest } = useDemoState();

  return (
    <>
      <div className="u-shead">
        <div>
          <h2>Alerte</h2>
          <p>Détection, dérive par rapport aux références et mesures de suivi</p>
        </div>
        <div className="right">
          <span className="u-chip is-alert">1 alerte ouverte</span>
        </div>
      </div>

      <AlertBox />

      <section className="u-panel" aria-labelledby="priority-title">
        <div className="u-panel-head">
          <div>
            <p className="u-panel-kicker">Mesures de suivi</p>
            <h2 className="u-panel-title" id="priority-title">
              Actions à examiner
            </h2>
          </div>
          <div className="u-panel-right">
            <span className="u-chip mono">{checkedAlertActions.length} / 3 suivies</span>
          </div>
        </div>

        <div className="u-panel-body tight">
          <div className="u-rows">
            {alertActions.map((action, index) => {
              const isChecked = checkedAlertActions.includes(action.id);
              return (
                <div className="u-row" key={action.id}>
                  <span className="u-row-value is-muted" style={{ width: 20 }}>{`0${index + 1}`}</span>
                  <span className="u-row-k">
                    <b>{action.title}</b>
                    <small>{action.detail}</small>
                  </span>
                  <button
                    type="button"
                    className={`u-btn ${isChecked ? "is-done" : ""}`}
                    onClick={() => toggleAlertAction(action.id)}
                    aria-pressed={isChecked}
                  >
                    {isChecked ? "Suivie" : "Marquer suivie"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="u-panel-foot">
          Le suivi est mémorisé dans l’interface uniquement : il ne confirme pas la réalisation d’un acte médical.
        </div>
      </section>

      <section className="u-panel" aria-labelledby="contact-title">
        <div className="u-panel-head">
          <div>
            <p className="u-panel-kicker">Liaison médecin au sol</p>
            <h2 className="u-panel-title" id="contact-title">
              Préparer une demande d’avis
            </h2>
          </div>
          <div className="u-panel-right">
            <span className="u-chip is-warn mono">aller-retour 12 min</span>
          </div>
        </div>

        <div className="u-panel-body">
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              className={`u-btn ${contactRequestPrepared ? "is-done" : "is-primary"}`}
              onClick={prepareContactRequest}
              aria-pressed={contactRequestPrepared}
            >
              {contactRequestPrepared ? "Demande préparée" : "Préparer la demande"}
            </button>
            <span style={{ fontSize: 12.5, color: "var(--u-ink-3)" }}>
              {contactRequestPrepared
                ? "La demande est prête dans l’interface. Aucun message n’a été envoyé."
                : "Aucun canal n’est connecté : le bouton prépare un état, il n’envoie rien."}
            </span>
          </div>
        </div>

        <div className="u-panel-foot">
          Le délai de 12 minutes correspond à un aller-retour Terre ↔ orbite basse : une consigne ne peut pas être
          appliquée en direct.
        </div>
      </section>
    </>
  );
}
