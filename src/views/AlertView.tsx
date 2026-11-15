import { useState } from "react";
import AlertBox from "@/components/AlertBox";
import { useDemoState } from "@/context/DemoStateContext";
import { useAlertesBord, useBackend } from "@/context/BackendContext";
import { acquitterAlerteBord, formatDate, LIBELLE_CAPTEUR, LIBELLE_GRAVITE } from "@/data/api";

const alertActions = [
  { id: "light", title: "Examiner le protocole de récupération lumineuse", detail: "À valider avec le médecin au sol" },
  { id: "load", title: "Réévaluer la charge cognitive du jour", detail: "Alléger les tâches non critiques" },
  { id: "sleep", title: "Consigner le sommeil et le ressenti", detail: "Avant la prochaine période de repos" },
] as const;

export default function AlertView() {
  const { checkedAlertActions, toggleAlertAction, contactRequestPrepared, prepareContactRequest } = useDemoState();
  const { bord } = useBackend();
  const alertes = useAlertesBord(bord);
  const [prises, setPrises] = useState<number[]>([]);

  const prendreEnCompte = async (id: number) => {
    setPrises((liste) => (liste.includes(id) ? liste : [...liste, id]));
    await acquitterAlerteBord(id);
  };

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

      {bord && (
        <section className="u-panel" aria-labelledby="alertes-moteur">
          <div className="u-panel-head">
            <div>
              <p className="u-panel-kicker">Détection à bord · lignes de base personnelles</p>
              <h2 className="u-panel-title" id="alertes-moteur">
                Alertes du système de bord
              </h2>
            </div>
            <div className="u-panel-right">
              <span className="u-chip mono">{alertes ? alertes.length : 0} alerte(s)</span>
            </div>
          </div>

          <div className="u-panel-body tight">
            <div className="u-rows">
              {(alertes ?? []).map((alerte) => {
                const traitee = alerte.acknowledged === 1 || prises.includes(alerte.id);
                return (
                  <div className="u-row" key={alerte.id}>
                    <span className={`u-chip ${alerte.severity === "critical" ? "is-alert" : "is-warn"}`}>
                      {LIBELLE_GRAVITE[alerte.severity]}
                    </span>
                    <span className="u-row-k">
                      <b>{alerte.message}</b>
                      <small>
                        {LIBELLE_CAPTEUR[alerte.sensor ?? ""] ?? "système"} · {formatDate(alerte.ts)} · détection « {alerte.kind} »
                      </small>
                    </span>
                    <button
                      type="button"
                      className={`u-btn ${traitee ? "is-done" : ""}`}
                      aria-pressed={traitee}
                      onClick={() => prendreEnCompte(alerte.id)}
                    >
                      {traitee ? "Pris en compte" : "Prendre en compte"}
                    </button>
                  </div>
                );
              })}
              {alertes && alertes.length === 0 && (
                <div className="u-row">
                  <span className="u-row-k">
                    <small>Aucune alerte enregistrée à bord pour l’instant.</small>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="u-panel-foot">
            Alertes produites par la passerelle de bord : pic par z-score sur ligne de base personnelle, dérive lente
            sur 24 h, seuils critiques par capteur. Les messages sont ceux du moteur, en anglais.
          </div>
        </section>
      )}

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
