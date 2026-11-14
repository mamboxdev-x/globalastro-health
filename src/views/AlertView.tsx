import AlertBox from "@/components/AlertBox";
import { useDemoState } from "@/context/DemoStateContext";

const alertActions = [
  { id: "light", title: "Examiner le protocole de récupération lumineuse", detail: "À discuter avec le personnel médical compétent" },
  { id: "load", title: "Réévaluer la charge cognitive non critique", detail: "Point de suivi proposé · non exécuté automatiquement" },
  { id: "sleep", title: "Consigner le sommeil et le ressenti", detail: "Saisie de démonstration avant la prochaine période de repos" },
] as const;

export default function AlertView() {
  const { checkedAlertActions, toggleAlertAction, contactRequestPrepared, prepareContactRequest } = useDemoState();

  return (
    <section className="alert-overview" aria-labelledby="alert-title">
      <AlertBox />

      <section className="priority-panel" aria-labelledby="priority-title">
        <div className="priority-header">
          <div>
            <p className="panel-kicker">MESURES DE SUIVI</p>
            <h2 id="priority-title">Actions à examiner</h2>
          </div>
          <span>{checkedAlertActions.length}/3 SUIVIES DANS LA DÉMO</span>
        </div>
        <div className="priority-list">
          {alertActions.map((action, index) => {
            const isChecked = checkedAlertActions.includes(action.id);
            return (
              <button
                type="button"
                className={`priority-action ${isChecked ? "checked" : ""}`}
                key={action.id}
                onClick={() => toggleAlertAction(action.id)}
                aria-pressed={isChecked}
              >
                <span className="priority-number">0{index + 1}</span>
                <span className="priority-copy">
                  <strong>{action.title}</strong>
                  <small>{action.detail}</small>
                </span>
                <span className="priority-check" aria-hidden="true">
                  {isChecked ? "✓" : ""}
                </span>
              </button>
            );
          })}
        </div>
        <p className="helper-text">Les cases mémorisent uniquement un suivi dans l'interface ; elles ne confirment pas la réalisation d'un acte médical.</p>
      </section>

      <div className="contact-panel">
        <div className="contact-action-wrap">
          <button
            type="button"
            className={`contact-button ${contactRequestPrepared ? "contacted" : ""}`}
            onClick={prepareContactRequest}
            aria-pressed={contactRequestPrepared}
          >
            {contactRequestPrepared ? "DEMANDE PRÉPARÉE LOCALEMENT" : "PRÉPARER UNE DEMANDE AU MÉDECIN"}
          </button>
          <p className="helper-text" role="status">
            {contactRequestPrepared
              ? "La demande est seulement préparée dans cette interface. Aucun message n'a été envoyé."
              : "Aucun canal de communication n'est connecté : le bouton prépare uniquement un état de démonstration."}
          </p>
        </div>
        <div className="transmission-delay">
          <span>DÉLAI DE COMMUNICATION INDICATIF</span>
          <strong>12 MIN ALLER-RETOUR</strong>
        </div>
      </div>
    </section>
  );
}
