import { useState } from "react";
import { useSession } from "@/context/SessionContext";
import { LIBELLES_PARAMETRES as LIBELLES, membrePour, useEquipageSimule } from "@/data/simulation";
import type { MesureModule } from "@/data/api";

/** Paramètres qui bougent en continu : ce sont eux qu'on trace. */
const TRACABLES = [
  "frequence_cardiaque",
  "temperature_corporelle",
  "SpO2",
  "frequence_respiratoire",
  "debit_cardiaque",
  "dose_radiation",
  "pression_systolique",
  "pression_diastolique",
  "co2",
  "activite_electrodermale",
];

function nombre(valeur: string | number): number {
  const n = typeof valeur === "number" ? valeur : Number.parseFloat(String(valeur).replace(",", "."));
  return Number.isFinite(n) ? n : Number.NaN;
}

function Courbe({ points }: { points: MesureModule[] }) {
  const valeurs = points.map((p) => nombre(p.valeur)).filter(Number.isFinite);
  if (valeurs.length < 2) {
    return <div className="u-chart-empty">Pas encore assez de points — laissez tourner les capteurs.</div>;
  }

  const largeur = 280;
  const hauteur = 56;
  const mini = Math.min(...valeurs);
  const maxi = Math.max(...valeurs);
  const etendue = maxi - mini || 1;
  const suite = valeurs.map((valeur, index) => ({
    x: ((index / (valeurs.length - 1)) * largeur).toFixed(1),
    y: (hauteur - 6 - ((valeur - mini) / etendue) * (hauteur - 14)).toFixed(1),
  }));
  const dernier = suite[suite.length - 1];

  return (
    <>
      <svg
        className="u-chart"
        viewBox={`0 0 ${largeur} ${hauteur}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Courbe de ${valeurs.length} points, de ${mini} à ${maxi}`}
      >
        <line x1="0" y1={hauteur - 6} x2={largeur} y2={hauteur - 6} className="chart-grid" />
        <polyline points={suite.map((p) => `${p.x},${p.y}`).join(" ")} className="chart-line nominal" />
        <circle cx={dernier.x} cy={dernier.y} r="2.6" className="chart-dot nominal" />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "var(--u-ink-3)" }}>
        <span>min {mini}</span>
        <span>{valeurs.length} points reçus</span>
        <span>max {maxi}</span>
      </div>
    </>
  );
}

/**
 * Panneau branché sur le module central (receiver.py) : capteurs simulés,
 * seuils calculés côté module, courbes alimentées par l'historique CSV.
 */
export default function ModuleCentral() {
  const { identifiant } = useSession();
  const { membres } = useEquipageSimule();
  const [parametre, setParametre] = useState("frequence_cardiaque");

  // La même source que le poste sol : ce que le médecin lit chez ce membre est ce qui s'affiche ici.
  const membre = membrePour(membres, identifiant);
  const derniere = membre?.mesures ?? null;
  const points = membre?.historique[parametre] ?? [];
  const enDirect = membre?.source === "module";

  if (!derniere || !membre) return null;

  const mesures = Object.entries(derniere);
  const critiques = mesures.filter(([, m]) => m.statut === "critique").length;
  const aSuivre = mesures.filter(([, m]) => m.statut === "attention").length;
  const courante = derniere[parametre];

  return (
    <section className="u-panel" aria-labelledby="module-central">
      <div className="u-panel-head">
        <div>
          <p className="u-panel-kicker">
            {enDirect
              ? `Capteurs du module central · ${membre.nom}`
              : `Simulation partagée · ${membre.nom}`}
          </p>
          <h2 className="u-panel-title" id="module-central">
            Mesures reçues en direct
          </h2>
        </div>
        <div className="u-panel-right" style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {!enDirect && <span className="u-chip is-warn mono">simulation</span>}
          <span className="u-chip mono">{mesures.length} paramètres</span>
          {critiques > 0 && <span className="u-chip is-alert mono">{critiques} critique(s)</span>}
          {aSuivre > 0 && <span className="u-chip is-warn mono">{aSuivre} à suivre</span>}
        </div>
      </div>

      <div className="u-panel-body">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, flexWrap: "wrap" }}>
          <label className="u-field" style={{ minWidth: 220 }}>
            <span className="u-label">Paramètre tracé</span>
            <select className="u-input" value={parametre} onChange={(evenement) => setParametre(evenement.target.value)}>
              {TRACABLES.map((cle) => (
                <option key={cle} value={cle}>
                  {LIBELLES[cle] ?? cle}
                </option>
              ))}
            </select>
          </label>

          {courante && (
            <span className="u-metric-value" style={{ fontSize: 24 }}>
              {courante.valeur}
              <small>{courante.unite}</small>
            </span>
          )}
          {courante && (
            <span
              className={`u-chip ${
                courante.statut === "critique" ? "is-alert" : courante.statut === "attention" ? "is-warn" : courante.statut === "nominal" ? "is-ok" : ""
              }`}
              style={{ marginBottom: 4 }}
            >
              {courante.statut}
            </span>
          )}
          {courante && (
            <span style={{ fontSize: 11.5, color: "var(--u-ink-3)", marginBottom: 6 }}>
              capteur {courante.capteur} · {courante.mode} · {courante.date_utc.slice(11, 19)} UTC
            </span>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <Courbe points={points} />
        </div>
      </div>

      <div className="u-panel-body tight" style={{ borderTop: "1px solid var(--u-line)" }}>
        <table className="u-table">
          <caption className="sr-only">Dernières valeurs reçues du module central, avec le statut calculé par ses seuils</caption>
          <thead>
            <tr>
              <th scope="col">Paramètre</th>
              <th scope="col" className="is-num">Valeur</th>
              <th scope="col">Unité</th>
              <th scope="col">Capteur</th>
              <th scope="col">Statut</th>
            </tr>
          </thead>
          <tbody>
            {mesures
              .slice()
              .sort((a, b) => {
                const rang = (s: string) => (s === "critique" ? 0 : s === "attention" ? 1 : s === "nominal" ? 2 : 3);
                return rang(a[1].statut) - rang(b[1].statut) || a[0].localeCompare(b[0]);
              })
              .map(([cle, mesure]) => (
                <tr key={cle}>
                  <td>{LIBELLES[cle] ?? cle.replace(/_/g, " ")}</td>
                  <td className="is-num">{mesure.valeur}</td>
                  <td>{mesure.unite}</td>
                  <td>{mesure.capteur}</td>
                  <td>
                    <span
                      className={`u-chip ${
                        mesure.statut === "critique" ? "is-alert" : mesure.statut === "attention" ? "is-warn" : mesure.statut === "nominal" ? "is-ok" : ""
                      }`}
                    >
                      {mesure.statut}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="u-panel-foot">
        {enDirect
          ? `Mesures réellement reçues du module central (receiver.py) pour ${membre.nom}, seuils calculés par le module et conservés dans mesures.csv.`
          : `Mêmes valeurs que celles affichées au poste sol pour ${membre.nom} : c'est la seule source, les deux écrans ne peuvent pas se contredire. Simulation locale annoncée comme telle — lancez le module central (receiver.py + capteurs.py) pour voir passer de vraies remontées.`}
      </div>
    </section>
  );
}
