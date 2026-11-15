import { useState } from "react";
import { missionDay } from "@/data/missionData";
import { contreMesures, consigneEruptionSolaire, radiationData, sources } from "@/data/radiationData";

const PIC_MICROSV = 250;

export default function Radiation() {
  const [eruption, setEruption] = useState(false);
  const [consignePrete, setConsignePrete] = useState(false);
  const [sourceOuverte, setSourceOuverte] = useState(false);

  const doseMax = Math.max(...radiationData.debitQuotidienMicroSv);

  return (
    <>
      <div className="u-shead">
        <div>
          <h2>Rayonnement</h2>
          <p>Cinquième danger des vols spatiaux habités · dose cumulée et contre-mesures</p>
        </div>
        <div className="right">
          <span className="u-chip mono">J{missionDay}</span>
          <button
            type="button"
            className={`u-btn ${eruption ? "is-done" : ""}`}
            aria-pressed={eruption}
            onClick={() => {
              setEruption((actif) => !actif);
              setConsignePrete(false);
            }}
          >
            {eruption ? "Éruption en cours" : "Simuler une éruption solaire"}
          </button>
        </div>
      </div>

      {eruption && (
        <section className="u-panel is-alert" aria-labelledby="eruption-titre">
          <div className="u-panel-head">
            <div>
              <p className="u-panel-kicker">Événement solaire · particules en hausse</p>
              <h2 className="u-panel-title" id="eruption-titre">
                Éruption solaire détectée
              </h2>
            </div>
            <div className="u-panel-right">
              <span className="u-chip is-alert mono">dose en pic</span>
            </div>
          </div>

          <div className="u-panel-body">
            <p style={{ fontSize: 13, color: "var(--u-ink-2)", marginBottom: 12 }}>
              Une éruption solaire majeure peut délivrer une dose élevée en quelques minutes. Les particules solaires
              sont la seule composante que l’on peut anticiper à bord : la contre-mesure est un abri, pas un soin.
            </p>

            <div className="u-rows">
              <div className="u-row">
                <span className="u-row-k">
                  <b>Repli dans la zone la plus protégée</b>
                  <small>Regrouper l’équipage à l’endroit du module le mieux blindé</small>
                </span>
              </div>
              <div className="u-row">
                <span className="u-row-k">
                  <b>Report des sorties extravéhiculaires</b>
                  <small>Hors du véhicule, l’équipage perd son écran contre les particules</small>
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 14, flexWrap: "wrap" }}>
              <button
                type="button"
                className={`u-btn ${consignePrete ? "is-done" : "is-primary"}`}
                aria-pressed={consignePrete}
                onClick={() => setConsignePrete(true)}
              >
                {consignePrete ? "Consigne préparée" : "Préparer la consigne d’abri"}
              </button>
              {consignePrete && (
                <span style={{ fontSize: 12.5, color: "var(--u-ink-3)" }}>« {consigneEruptionSolaire} »</span>
              )}
            </div>
          </div>

          <div className="u-panel-foot">
            La consigne est préparée dans l’interface ; aucun message n’est transmis par ce prototype.
          </div>
        </section>
      )}

      <div className="u-grid g2">
        <section className="u-panel" aria-labelledby="dose-titre">
          <div className="u-panel-head">
            <div>
              <p className="u-panel-kicker">Dose intégrée depuis le début de la mission</p>
              <h2 className="u-panel-title" id="dose-titre">
                Exposition cumulée
              </h2>
            </div>
            <div className="u-panel-right">
              <span className="u-metric-value" style={{ fontSize: 21 }}>
                {radiationData.doseIntegreeMsV}
                <small>mSv</small>
              </span>
            </div>
          </div>

          <div className="u-panel-body">
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span className="u-big">{radiationData.pourcentageLimite} %</span>
              <span style={{ fontSize: 12.5, color: "var(--u-ink-3)" }}>de la limite de carrière</span>
            </div>
            <div className="u-track is-warn" style={{ marginTop: 10 }}>
              <span style={{ width: `${radiationData.pourcentageLimite}%` }} />
            </div>
            <p style={{ fontSize: 11.5, color: "var(--u-ink-3)", marginTop: 8 }}>
              La limite officielle n’est pas un nombre de millisieverts : elle est définie en risque (norme
              NASA-STD-3001 §4.2.10) et dépend de l’âge, du sexe et de la durée de mission.
            </p>
          </div>

          <div className="u-stats">
            <div className="u-stat">
              <span className="u-stat-k">Part des neutrons</span>
              <span className="u-stat-v">
                {radiationData.partNeutronsPourcent}
                <small>% de la dose</small>
              </span>
            </div>
            <div className="u-stat">
              <span className="u-stat-k">Pic sur 14 jours</span>
              <span className="u-stat-v">
                {doseMax}
                <small>µSv/jour</small>
              </span>
            </div>
          </div>
        </section>

        <section className="u-panel" aria-labelledby="debit-titre">
          <div className="u-panel-head">
            <div>
              <p className="u-panel-kicker">14 derniers jours</p>
              <h2 className="u-panel-title" id="debit-titre">
                Débit de dose quotidien
              </h2>
            </div>
            <div className="u-panel-right">
              <span className="u-chip mono">µSv / jour</span>
            </div>
          </div>

          <div className="u-panel-body">
            <div
              className="u-bars"
              style={{ height: 84 }}
              role="img"
              aria-label={`Débit de dose sur 14 jours, de ${radiationData.debitQuotidienMicroSv[0]} à ${doseMax} microsievert par jour`}
            >
              {radiationData.debitQuotidienMicroSv.map((valeur, index) => (
                <div className="u-bar" key={`debit-${index}`} title={`J−${13 - index} · ${valeur} µSv/jour`} aria-hidden="true">
                  <div className="u-bar-track">
                    <span
                      className={valeur >= PIC_MICROSV ? "is-under" : ""}
                      style={{ height: `${Math.round((valeur / radiationData.debitPlafondMicroSv) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontSize: 11, color: "var(--u-ink-3)" }}>
              <span>J−13</span>
              <span>les barres ambre dépassent {PIC_MICROSV} µSv</span>
              <span>aujourd’hui</span>
            </div>
          </div>

          <div className="u-panel-foot">
            À bord de la Station spatiale, environ 30 % de la dose reçue vient des neutrons — mesuré par l’expérience
            canadienne Radi-N2, qui servait aussi à cartographier les zones les mieux protégées.
          </div>
        </section>
      </div>

      <section className="u-panel" aria-labelledby="origines-titre">
        <div className="u-panel-head">
          <div>
            <p className="u-panel-kicker">Origine du rayonnement reçu</p>
            <h2 className="u-panel-title" id="origines-titre">
              Trois composantes
            </h2>
          </div>
          <div className="u-panel-right">
            <span className="u-chip mono">orbite basse</span>
          </div>
        </div>

        <div className="u-panel-body">
          <div className="u-rows">
            {radiationData.origines.map((origine) => (
              <div className="u-row" key={origine.nom}>
                <span className="u-row-k" style={{ flex: "1 1 auto" }}>
                  <b>{origine.nom}</b>
                  <small>{origine.note}</small>
                  <div className="u-track" style={{ marginTop: 6, maxWidth: 320 }}>
                    <span style={{ width: `${origine.part}%` }} />
                  </div>
                </span>
                <span className="u-row-value">{origine.part} %</span>
              </div>
            ))}
          </div>
        </div>

        <div className="u-panel-foot">
          En orbite basse, l’atmosphère et le champ magnétique terrestre protègent encore en partie l’équipage. Sur
          un trajet vers la Lune ou Mars, cette protection disparaît — c’est là que le risque change d’échelle.
        </div>
      </section>

      <section className="u-panel" aria-labelledby="contre-titre">
        <div className="u-panel-head">
          <div>
            <p className="u-panel-kicker">Ce qui protège réellement</p>
            <h2 className="u-panel-title" id="contre-titre">
              Contre-mesures
            </h2>
          </div>
          <div className="u-panel-right">
            <span className="u-chip">{contreMesures.length} mesures</span>
          </div>
        </div>

        <div className="u-panel-body tight">
          <div className="u-rows">
            {contreMesures.map((mesure) => (
              <div className="u-row" key={mesure.titre}>
                <span className="u-row-k">
                  <b>{mesure.titre}</b>
                  <small>{mesure.detail}</small>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="u-panel-foot">
          Le rayonnement n’a pas de traitement à bord : la seule contre-mesure immédiate est l’abri, la seule
          contre-mesure longue est le suivi après la mission.
        </div>
      </section>

      <section className="u-panel" aria-labelledby="sources-titre">
        <div className="u-panel-head">
          <div>
            <p className="u-panel-kicker">D’où viennent ces repères</p>
            <h2 className="u-panel-title" id="sources-titre">
              Sources
            </h2>
          </div>
          <div className="u-panel-right">
            <button type="button" className="u-btn" onClick={() => setSourceOuverte((ouvert) => !ouvert)} aria-expanded={sourceOuverte}>
              {sourceOuverte ? "Masquer" : "Afficher"}
            </button>
          </div>
        </div>

        {sourceOuverte && (
          <div className="u-panel-body tight">
            <div className="u-rows">
              {sources.map((source) => (
                <div className="u-row" key={source.url}>
                  <span className="u-row-k">
                    <b>{source.titre}</b>
                    <small>{source.organisme}</small>
                  </span>
                  <a href={source.url} target="_blank" rel="noreferrer" className="u-row-value" style={{ color: "var(--u-accent-ink)" }}>
                    ouvrir
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="u-panel-foot">
          Valeurs chiffrées simulées. Cadre et repères issus des ressources officielles du défi : Agence
          spatiale canadienne et programme de recherche humaine de la NASA.
        </div>
      </section>
    </>
  );
}
