import { useState } from "react";
import AlertBox from "@/components/AlertBox";

const alertActions = [
  { id: "light", title: "Protocole de récupération lumineuse", detail: "30 min / spectre bleu" },
  {
    id: "load",
    title: "Réduction de 20 % de la charge cognitive non critique",
    detail: "À appliquer aujourd’hui",
  },
  { id: "spo2", title: "Contrôle hydrique et mesure SpO2", detail: "Avant sommeil" },
];

export default function AlertView() {
  const [checked, setChecked] = useState<string[]>([]);
  const [contacted, setContacted] = useState(false);

  return (
    <section className="alert-overview" aria-labelledby="alert-title">
      <AlertBox />

      <section className="priority-panel" aria-labelledby="priority-title">
        <div className="priority-header">
          <div>
            <p className="panel-kicker">PROTOCOLE DE MITIGATION</p>
            <h2 id="priority-title">Actions prioritaires</h2>
          </div>
          <span>{checked.length}/3 EFFECTUÉES</span>
        </div>
        <div className="priority-list">
          {alertActions.map((action, index) => {
            const isChecked = checked.includes(action.id);
            return (
              <button
                type="button"
                className={`priority-action ${isChecked ? "checked" : ""}`}
                key={action.id}
                onClick={() =>
                  setChecked((current) =>
                    isChecked ? current.filter((id) => id !== action.id) : [...current, action.id],
                  )
                }
                aria-pressed={isChecked}
              >
                <span className="priority-number">0{index + 1}</span>
                <span className="priority-copy">
                  <strong>{action.title}</strong>
                  <small>{action.detail}</small>
                </span>
                <span className="priority-check" aria-hidden="true">
                  {isChecked && (
                    <svg viewBox="0 0 24 24">
                      <path d="m5 12 4.5 4.5L19 7" />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="contact-panel">
        <button
          type="button"
          className={`contact-button ${contacted ? "contacted" : ""}`}
          onClick={() => setContacted(true)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-5 4v-4.5a2.5 2.5 0 0 1-1-2Z" />
            <path d="M8 8h8M8 11h5" />
          </svg>
          {contacted ? "DEMANDE TRANSMISE AU MÉDECIN" : "CONTACTER LE MÉDECIN AU SOL"}
        </button>
        <div className="transmission-delay">
          <span>DÉLAI TRANSMISSION</span>
          <strong>12 MIN ALLER-RETOUR</strong>
        </div>
      </div>
    </section>
  );
}
