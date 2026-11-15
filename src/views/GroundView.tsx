import { useEffect, useState } from "react";
import RailCompte from "@/components/RailCompte";
import { useBackend, useEquipageSol, useMessagesSolTous } from "@/context/BackendContext";
import { useSession, type Compte } from "@/context/SessionContext";
import { envoyerConsigneSol, formatDate } from "@/data/api";
import { useConsignes } from "@/data/consignes";
import {
  LIBELLES_PARAMETRES,
  gravite,
  horsPlage,
  plageNominale,
  useEquipageSimule,
  type MembreSimule,
} from "@/data/simulation";
import { radiationData } from "@/data/radiationData";
import {
  boneDensityData,
  cardiovascularData,
  currentCardiacOutput,
  currentSleepDuration,
  formatSignedMinutes,
  formatSignedPercent,
  missionDay,
  sleepData,
  sleepDifferenceMinutes,
} from "@/data/missionData";

/* --------------------------------------------------------------- données --- */

const EQUIPAGE = [
  {
    identifiant: "cdr.mbaye",
    initiales: "MB",
    nom: "Cmdt Mbaye",
    resume: `Sommeil ${currentSleepDuration} · écart ${sleepDifferenceMinutes} min`,
    etat: "warn" as const,
    libelle: "À suivre",
  },
  {
    identifiant: "ing.kouassi",
    initiales: "KP",
    nom: "Ing. Kouassi",
    resume: "Tous les indicateurs dans la référence pré-vol",
    etat: "ok" as const,
    libelle: "Nominal",
  },
  {
    identifiant: "dr.aminata",
    initiales: "AS",
    nom: "Dr Aminata S.",
    resume: `Densité osseuse ${formatSignedPercent(boneDensityData.changePercent)} sur 90 jours`,
    etat: "warn" as const,
    libelle: "À suivre",
  },
];

/** Identifiants déjà connus comme membres d'équipage : ils ne doivent pas être comptés deux fois. */
const IDENTIFIANTS_EQUIPAGE = new Set(EQUIPAGE.map((membre) => membre.identifiant.toLowerCase()));

/**
 * Un astronaute inscrit dans ce navigateur doit apparaître chez le médecin :
 * sinon le compte n'existe que pour la personne qui l'a créé. Les membres d'équipage déjà
 * suivis (les trois de la station) sont écartés, sans quoi ils apparaîtraient en double.
 */
function depuisComptes(comptes: Compte[]) {
  return comptes
    .filter((compte) => compte.role === "astro" && !IDENTIFIANTS_EQUIPAGE.has(compte.identifiant.toLowerCase()))
    .map((compte) => {
      const profil = compte.profil;
      const details = [
        profil?.poidsKg ? `${profil.poidsKg} kg` : null,
        profil?.tailleM ? `${profil.tailleM} m` : null,
        profil?.sexe ?? null,
      ]
        .filter(Boolean)
        .join(" · ");

      return {
        initiales: compte.identifiant.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase() || "??",
        nom: compte.identifiant,
        resume: details ? `Compte créé dans ce navigateur · ${details}` : "Compte créé dans ce navigateur",
        libelle: "Nouveau",
      };
    });
}

type Alerte = {
  id: string;
  niveau: "Niveau 2" | "Niveau 1";
  code: string;
  titre: string;
  origine: string;
  recue: string;
};

const ALERTES: Alerte[] = [
  {
    id: "mh-sl-072",
    niveau: "Niveau 2",
    code: "MH-SL-072",
    titre: "Écart de sommeil sur trois nuits",
    origine: "Cmdt Mbaye",
    recue: `jour ${missionDay} · 12:18 UTC`,
  },
  {
    id: "phy-dmo-04",
    niveau: "Niveau 1",
    code: "PHY-DMO-04",
    titre: `Densité osseuse à ${formatSignedPercent(boneDensityData.changePercent)} depuis J0`,
    origine: "Dr Aminata S.",
    recue: "jour 86 · 12:41 UTC",
  },
  {
    id: "phy-card-02",
    niveau: "Niveau 1",
    code: "PHY-CARD-02",
    titre: "Pression systolique en limite haute au réveil",
    origine: "Ing. Kouassi",
    recue: "jour 85 · 09:05 UTC",
  },
];

const JOURNAL = [
  { heure: "12:18:42", indicateur: "Durée de sommeil", valeur: currentSleepDuration, reference: "7 h 00", ecart: formatSignedMinutes(sleepDifferenceMinutes), etat: "warn" },
  { heure: "12:18:18", indicateur: "Fréquence cardiaque au repos", valeur: `${cardiovascularData.heartRateBpm} bpm`, reference: "61 bpm", ecart: "−3 bpm", etat: "ok" },
  { heure: "12:17:56", indicateur: "Variabilité cardiaque", valeur: `${cardiovascularData.hrvMs} ms`, reference: "55 ms", ecart: "−1 ms", etat: "ok" },
  { heure: "12:17:31", indicateur: "Pression systolique", valeur: "118/76", reference: "122/78", ecart: "−4 mmHg", etat: "ok" },
  { heure: "12:17:04", indicateur: "Débit cardiaque", valeur: `${currentCardiacOutput.toFixed(1).replace(".", ",")} L/min`, reference: "5,2 L/min", ecart: "−0,3", etat: "ok" },
  { heure: "12:16:12", indicateur: "Rayonnement intégré", valeur: `${radiationData.doseIntegreeMsV} mSv`, reference: `${radiationData.pourcentageLimite} % de la limite`, ecart: "cumul de mission", etat: "ok" },
  { heure: "12:16:40", indicateur: "Densité minérale osseuse", valeur: formatSignedPercent(boneDensityData.changePercent), reference: `seuil ${formatSignedPercent(boneDensityData.alertThresholdPercent)}`, ecart: "seuil non atteint", etat: "warn" },
];

/** Ligne affichée dans la file de transmission, quelle que soit sa source (API ou démonstration). */
type LigneConsigne = {
  id: string;
  miseEnFile: string;
  destinataire: string;
  texte: string;
  etat: "attente" | "transmise" | "lue";
};

const LIBELLE_ETAT: Record<LigneConsigne["etat"], { texte: string; classe: string }> = {
  attente: { texte: "à la prochaine fenêtre", classe: "is-warn" },
  transmise: { texte: "transmise au bord", classe: "is-accent" },
  lue: { texte: "lue par l’équipage", classe: "is-ok" },
};

/** Ce que le poste sol reçoit de la passerelle à bord (API AstroPulse). */
type MembreBord = {
  id: string;
  minutes_since: number;
  status: string;
  alerts_24h: number;
  latest: Record<string, { value: number }>;
};

const REFERENCE_MINUTES = 420;

/* ------------------------------------------------------------ sous-vues --- */

function BlocEquipage({
  consigneTexte,
  setConsigneTexte,
  destinataire,
  setDestinataire,
  destinataires,
  mettreEnFile,
  equipage,
  nouveaux,
  membres,
}: {
  consigneTexte: string;
  setConsigneTexte: (valeur: string) => void;
  destinataire: string;
  setDestinataire: (valeur: string) => void;
  destinataires: string[];
  mettreEnFile: () => void;
  equipage: MembreBord[] | null;
  nouveaux: { initiales: string; nom: string; resume: string; libelle: string }[];
  membres: MembreSimule[];
}) {
  return (
    <>
      <div className="u-info">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16h.01" />
        </svg>
        <span>
          <b>Vous ne pouvez pas agir en direct.</b>
          Une consigne écrite maintenant sera lue par l’équipage après la prochaine fenêtre de communication, au
          mieux : le signal met 12 minutes pour un aller-retour.
        </span>
      </div>

      <div className="u-grid g2">
        <section className="u-panel" aria-labelledby="crew-title">
          <div className="u-panel-head">
            <div>
              <p className="u-panel-kicker">
                {equipage ? "Reçu du bord · mesure réelle" : "Dernières mesures reçues · 12:18 UTC"}
              </p>
              <h2 className="u-panel-title" id="crew-title">
                État de l’équipage
              </h2>
            </div>
            <div className="u-panel-right">
              <span className="u-chip mono">J{missionDay}</span>
            </div>
          </div>

          <div className="u-panel-body tight">
            <div className="u-rows">
              {nouveaux.map((membre) => (
                <div className="u-row" key={`compte-${membre.nom}`}>
                  <span className="u-row-value is-muted" style={{ width: 26 }}>
                    {membre.initiales}
                  </span>
                  <span className="u-row-k">
                    <b>{membre.nom}</b>
                    <small>{membre.resume}</small>
                  </span>
                  <span className="u-chip">{membre.libelle}</span>
                </div>
              ))}
              {/* Les mêmes mesures que celles du tableau de bord de chaque membre : une seule source. */}
              {membres.map((membre) => {
                const { critiques, aSuivre } = horsPlage(membre.mesures);
                const niveau = gravite(membre.mesures);
                const fc = membre.mesures.frequence_cardiaque;
                const spo2 = membre.mesures.SpO2;
                const temperature = membre.mesures.temperature_corporelle;
                const sommeil = membre.mesures.sommeil_duree;
                return (
                  <div className="u-row" key={`sim-${membre.id}`}>
                    <span className="u-row-value is-muted" style={{ width: 26 }}>
                      {membre.initiales}
                    </span>
                    <span className="u-row-k">
                      <b>{membre.nom}</b>
                      <small>
                        {membre.fonction} · {fc ? `${fc.valeur} bpm` : "—"} · {spo2 ? `${spo2.valeur} %` : "—"} ·{" "}
                        {temperature ? `${temperature.valeur} °C` : "—"}
                        {sommeil ? ` · sommeil ${sommeil.valeur} h` : ""} ·{" "}
                        {critiques.length + aSuivre.length} paramètre(s) hors plage
                        {membre.source === "module" ? " · capteurs du module" : " · simulation"}
                      </small>
                    </span>
                    <span
                      className={`u-chip ${
                        niveau === "critique" ? "is-alert" : niveau === "attention" ? "is-warn" : "is-ok"
                      }`}
                    >
                      <span
                        className={`u-dot ${
                          niveau === "critique" ? "is-alert" : niveau === "attention" ? "is-warn" : "is-ok"
                        }`}
                        aria-hidden="true"
                      />
                      {niveau === "critique" ? "Critique" : niveau === "attention" ? "À suivre" : "Nominal"}
                    </span>
                  </div>
                );
              })}
              {equipage &&
                equipage.map((membre) => (
                  <div className="u-row" key={membre.id}>
                    <span className="u-row-k">
                      <b>{membre.id}</b>
                      <small>
                        vu il y a {Math.round(membre.minutes_since)} min · {membre.alerts_24h} alerte(s) sur 24 h
                        {membre.latest.heart_rate ? ` · ${Math.round(membre.latest.heart_rate.value)} bpm` : ""}
                        {membre.latest.spo2 ? ` · ${membre.latest.spo2.value.toFixed(1)} %` : ""}
                        {membre.latest.temperature ? ` · ${membre.latest.temperature.value.toFixed(1)} °C` : ""}
                      </small>
                    </span>
                    <span
                      className={`u-chip ${
                        membre.status === "critical" ? "is-alert" : membre.status === "ok" ? "is-ok" : "is-warn"
                      }`}
                    >
                      <span
                        className={`u-dot ${
                          membre.status === "critical" ? "is-alert" : membre.status === "ok" ? "is-ok" : "is-warn"
                        }`}
                        aria-hidden="true"
                      />
                      {membre.status === "silent"
                        ? "Silencieux"
                        : membre.status === "ok"
                          ? "Nominal"
                          : membre.status === "critical"
                            ? "Critique"
                            : "À suivre"}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="u-panel-foot">
            {nouveaux.length > 0 && (
              <>
                Les lignes marquées « Nouveau » sont des astronautes inscrits dans ce navigateur : le registre des
                comptes est lu directement, aucun capteur ne les alimente encore.{" "}
              </>
            )}
            {equipage
              ? "Valeurs lues sur le poste sol (API AstroPulse) : état calculé à partir des résumés synchronisés par la passerelle."
              : "Valeurs reçues à l’instant, identiques à celles du tableau de bord de chaque membre : une seule source alimente les deux interfaces."}
          </div>
        </section>

        <section className="u-panel" aria-labelledby="consigne-title">
          <div className="u-panel-head">
            <div>
              <p className="u-panel-kicker">Destinataire · {destinataire || destinataires[0] || "—"}</p>
              <h2 className="u-panel-title" id="consigne-title">
                Instruction à transmettre
              </h2>
            </div>
            <div className="u-panel-right">
              <span className="u-chip is-warn mono">12 min</span>
            </div>
          </div>

          <div className="u-panel-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label className="u-field">
              <span className="u-label">Destinataire</span>
              <select className="u-input" value={destinataire} onChange={(evenement) => setDestinataire(evenement.target.value)}>
                {destinataires.map((nom) => (
                  <option key={nom} value={nom}>
                    {nom}
                  </option>
                ))}
              </select>
            </label>
            <label className="u-field">
              <span className="u-label">Consigne</span>
              <input
                className="u-input"
                value={consigneTexte}
                onChange={(evenement) => setConsigneTexte(evenement.target.value)}
              />
            </label>
            <label className="u-field">
              <span className="u-label">Fenêtre d’envoi</span>
              <input className="u-input" readOnly value={`Prochain contact · jour ${missionDay} 12:52 UTC`} />
            </label>
            <button
              type="button"
              className="u-btn is-primary is-wide"
              onClick={mettreEnFile}
              disabled={consigneTexte.trim().length < 5}
            >
              Mettre en file pour la prochaine fenêtre
            </button>
          </div>

          <div className="u-panel-foot">
            La consigne partirait avec les mesures suivantes. Rien n’est transmis dans cette démonstration :
            l’écran mémorise seulement l’intention.
          </div>
        </section>
      </div>

      <section className="u-panel" aria-labelledby="ground-sleep-title">
        <div className="u-panel-head">
          <div>
            <p className="u-panel-kicker">Reçu de l’équipage · 7 dernières nuits</p>
            <h2 className="u-panel-title" id="ground-sleep-title">
              Sommeil à bord
            </h2>
          </div>
          <div className="u-panel-right">
            <span
              className={`u-chip mono ${
                sleepData.days.filter((nuit) => nuit.minutes < REFERENCE_MINUTES).length ? "is-warn" : "is-ok"
              }`}
            >
              {sleepData.days.filter((nuit) => nuit.minutes < REFERENCE_MINUTES).length} nuits sous la référence
            </span>
          </div>
        </div>

        <div className="u-panel-body">
          <div
            className="u-bars"
            role="img"
            aria-label={`Sommeil à bord : ${sleepData.days.map((entry) => `${entry.day} ${entry.duration}`).join(", ")}`}
          >
            {sleepData.days.map((entry) => (
              <div className="u-bar" key={entry.day} aria-hidden="true">
                <span className="u-bar-value">{entry.duration}</span>
                <div className="u-bar-track">
                  <span
                    className={entry.minutes < REFERENCE_MINUTES ? "is-under" : ""}
                    style={{ height: `${Math.round((entry.minutes / 480) * 100)}%` }}
                  />
                </div>
                <span className="u-bar-day">{entry.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="u-panel-foot">Référence pré-vol 7 h 00. Les barres ambre sont sous la référence.</div>
      </section>
    </>
  );
}

function BlocAlertes({
  traitees,
  basculer,
  membres,
}: {
  traitees: string[];
  basculer: (id: string) => void;
  membres: MembreSimule[];
}) {
  // Les alertes ne sont pas inventées : elles sortent des mesures reçues dès qu'un paramètre
  // quitte sa plage nominale. Même source que le tableau de bord du membre concerné.
  const alertes = membres.flatMap((membre) =>
    Object.entries(membre.mesures)
      .filter(([, mesure]) => mesure.statut === "critique" || mesure.statut === "attention")
      .map(([parametre, mesure]) => ({
        id: `${membre.id}-${parametre}`,
        niveau: mesure.statut === "critique" ? ("Niveau 2" as const) : ("Niveau 1" as const),
        code: `${membre.initiales}-${parametre.slice(0, 8).toUpperCase()}`,
        titre: `${LIBELLES_PARAMETRES[parametre] ?? parametre} · ${mesure.valeur} ${mesure.unite}`,
        origine: membre.nom,
        recue: `jour ${missionDay} · ${mesure.date_utc.slice(11, 16)} UTC`,
      })),
  );
  const restantes = alertes.filter((alerte) => !traitees.includes(alerte.id)).length;

  return (
    <>
      <div className="u-shead">
        <div>
          <h2>Alertes remontées par l’équipage</h2>
          <p>Transmises à la fermeture de chaque fenêtre de communication</p>
        </div>
        <div className="right">
          <span className={`u-chip ${restantes ? "is-alert" : "is-ok"}`}>
            {restantes ? `${restantes} à traiter` : "tout est traité"}
          </span>
        </div>
      </div>

      <section className="u-panel" aria-labelledby="alertes-recues">
        <div className="u-panel-head">
          <div>
            <p className="u-panel-kicker">Depuis le début de la mission</p>
            <h2 className="u-panel-title" id="alertes-recues">
              {alertes.length} alertes issues des mesures
            </h2>
          </div>
          <div className="u-panel-right">
            <span className="u-chip mono">{traitees.length} / {alertes.length} traitées</span>
          </div>
        </div>

        <div className="u-panel-body tight">
          <div className="u-rows">
            {alertes.length === 0 && (
              <div className="u-row">
                <span className="u-chip is-ok">à jour</span>
                <span className="u-row-k">
                  <b>Aucun paramètre hors plage</b>
                  <small>Toutes les mesures reçues sont dans leur plage nominale.</small>
                </span>
              </div>
            )}
            {alertes.map((alerte) => {
              const estTraitee = traitees.includes(alerte.id);
              return (
                <div className="u-row" key={alerte.id}>
                  <span className={`u-chip ${alerte.niveau === "Niveau 2" ? "is-alert" : "is-warn"}`}>{alerte.niveau}</span>
                  <span className="u-row-k">
                    <b>{alerte.titre}</b>
                    <small>
                      {alerte.code} · {alerte.origine} · reçue {alerte.recue}
                    </small>
                  </span>
                  <button
                    type="button"
                    className={`u-btn ${estTraitee ? "is-done" : ""}`}
                    aria-pressed={estTraitee}
                    onClick={() => basculer(alerte.id)}
                  >
                    {estTraitee ? "Traitée" : "Marquer traitée"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="u-panel-foot">
          Le traitement est mémorisé dans l’interface du poste sol ; il ne déclenche aucune action à bord.
        </div>
      </section>

      <div className="u-info">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16h.01" />
        </svg>
        <span>
          <b>Une alerte reçue a déjà 12 minutes de retard.</b>
          Elle décrit une situation au moment de l’émission, pas à l’instant où vous la lisez : préparez une consigne
          plutôt que de réagir à chaud.
        </span>
      </div>
    </>
  );
}

function BlocJournal({ membres }: { membres: MembreSimule[] }) {
  const SUIVIS = [
    "frequence_cardiaque",
    "SpO2",
    "temperature_corporelle",
    "frequence_respiratoire",
    "pression_systolique",
    "pression_diastolique",
    "debit_cardiaque",
    "dose_radiation",
    "t_score",
    "force_main_droite",
    "CRP",
    "sommeil_duree",
    "co2",
  ];
  const rang = (statut: string) => (statut === "critique" ? 0 : statut === "attention" ? 1 : 2);

  const lignes = membres
    .flatMap((membre) =>
      SUIVIS.map((parametre) => ({ parametre, mesure: membre.mesures[parametre], membre })).filter(
        (entree) => Boolean(entree.mesure),
      ),
    )
    .sort((a, b) => rang(a.mesure.statut) - rang(b.mesure.statut) || a.membre.nom.localeCompare(b.membre.nom))
    .slice(0, 18);

  const ecarts = lignes.filter((ligne) => ligne.mesure.statut !== "nominal").length;

  return (
    <>
      <div className="u-shead">
        <div>
          <h2>Journal des mesures</h2>
          <p>Mesures reçues pendant la dernière fenêtre de communication · horodatage UTC</p>
        </div>
        <div className="right">
          <span className="u-chip mono">J{missionDay} · 12:16 → 12:18</span>
        </div>
      </div>

      <section className="u-panel" aria-labelledby="journal-titre">
        <div className="u-panel-head">
          <div>
            <p className="u-panel-kicker">Dernière fenêtre · {lignes.length} mesures affichées</p>
            <h2 className="u-panel-title" id="journal-titre">
              Dernières valeurs reçues
            </h2>
          </div>
          <div className="u-panel-right">
            <span className={`u-chip ${ecarts ? "is-warn" : "is-ok"} mono`}>
              {ecarts ? `${ecarts} en écart` : "toutes dans la plage"}
            </span>
          </div>
        </div>

        <div className="u-panel-body tight">
          <table className="u-table">
            <caption className="sr-only">Mesures transmises par l’équipage lors de la dernière fenêtre</caption>
            <thead>
              <tr>
                <th scope="col">Heure UTC</th>
                <th scope="col">Indicateur</th>
                <th scope="col" className="is-num">Valeur</th>
                <th scope="col" className="is-num">Référence</th>
                <th scope="col">Écart</th>
                <th scope="col">État</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map(({ parametre, mesure, membre }) => (
                <tr key={`${membre.id}-${parametre}`}>
                  <td>{mesure.date_utc.slice(11, 19)}</td>
                  <td>
                    {membre.nom} · {LIBELLES_PARAMETRES[parametre] ?? parametre}
                  </td>
                  <td className="is-num">
                    {mesure.valeur} {mesure.unite}
                  </td>
                  <td className="is-num">{plageNominale(parametre)}</td>
                  <td>{mesure.statut === "nominal" ? "dans la plage" : "hors plage"}</td>
                  <td>
                    <span
                      className={`u-chip ${
                        mesure.statut === "critique" ? "is-alert" : mesure.statut === "attention" ? "is-warn" : "is-ok"
                      }`}
                    >
                      {mesure.statut === "critique" ? "Critique" : mesure.statut === "attention" ? "À suivre" : "Nominal"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="u-stats">
          <div className="u-stat">
            <span className="u-stat-k">Mesures affichées</span>
            <span className="u-stat-v">{lignes.length}</span>
          </div>
          <div className="u-stat">
            <span className="u-stat-k">Dans la plage</span>
            <span className="u-stat-v">{lignes.length - ecarts}</span>
          </div>
          <div className="u-stat">
            <span className="u-stat-k">Hors plage</span>
            <span className="u-stat-v">{ecarts}</span>
          </div>
          <div className="u-stat">
            <span className="u-stat-k">Membres suivis</span>
            <span className="u-stat-v">{membres.length}</span>
          </div>
        </div>

        <div className="u-panel-foot">
          Mêmes valeurs que celles affichées sur le tableau de bord des membres : une seule source alimente les deux
          interfaces, elles ne peuvent pas se contredire.
        </div>
      </section>
    </>
  );
}

function BlocConsignes({ consignes, reel }: { consignes: LigneConsigne[]; reel: boolean }) {
  const enAttente = consignes.filter((consigne) => consigne.etat === "attente").length;

  return (
    <>
      <div className="u-shead">
        <div>
          <h2>Consignes envoyées</h2>
          <p>Historique des instructions préparées au sol et mises en file pour l’équipage</p>
        </div>
        <div className="right">
          <span className="u-chip mono">{consignes.length} consignes</span>
        </div>
      </div>

      <section className="u-panel" aria-labelledby="consignes-titre">
        <div className="u-panel-head">
          <div>
            <p className="u-panel-kicker">File de transmission</p>
            <h2 className="u-panel-title" id="consignes-titre">
              {enAttente ? `${enAttente} consigne(s) en attente de fenêtre` : "Toutes les consignes sont transmises"}
            </h2>
          </div>
          <div className="u-panel-right">
            <span className={`u-chip ${enAttente ? "is-warn" : "is-ok"} mono`}>
              {enAttente ? "en attente" : "à jour"}
            </span>
          </div>
        </div>

        <div className="u-panel-body tight">
          <div className="u-rows">
            {consignes.map((consigne) => (
              <div className="u-row" key={consigne.id}>
                <span className="u-row-value is-muted" style={{ width: 120 }}>{consigne.miseEnFile}</span>
                <span className="u-row-k">
                  <b>{consigne.texte}</b>
                  <small>Destinataire · {consigne.destinataire}</small>
                </span>
                <span className={`u-chip ${LIBELLE_ETAT[consigne.etat].classe}`}>
                  {LIBELLE_ETAT[consigne.etat].texte}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="u-panel-foot">
          {reel
            ? "Deux origines se mêlent ici : les consignes écrites sur le poste sol, dont l’état est lu auprès du backend (envoyée → transmise → lue), et celles restées dans la file locale faute de destinataire connu du poste sol — un astronaute inscrit dans ce navigateur, par exemple."
            : "Une consigne mise en file part avec les mesures à l’ouverture de la prochaine fenêtre. Aucun message n’est envoyé depuis ce prototype."}
        </div>
      </section>

      <div className="u-info">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16h.01" />
        </svg>
        <span>
          <b>Une consigne envoyée n’est pas une consigne appliquée.</b>
          L’équipage la reçoit au mieux 6 minutes après l’ouverture de la fenêtre, et c’est lui qui décide de
          l’exécuter.
        </span>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- écran --- */

type VueSol = "equipage" | "alertes" | "journal" | "consignes";

const NAV: { id: VueSol; label: string }[] = [
  { id: "equipage", label: "Équipage" },
  { id: "alertes", label: "Alertes reçues" },
  { id: "journal", label: "Journal des mesures" },
  { id: "consignes", label: "Consignes envoyées" },
];

/** Comme à bord : le poste sol retrouve l'onglet où on l'a laissé après un rafraîchissement. */
const CLE_VUE_SOL = "globalastro-vue-sol-v1";

function lireVueSol(): VueSol {
  if (typeof window === "undefined") return "equipage";
  try {
    const garde = window.localStorage.getItem(CLE_VUE_SOL);
    return NAV.some((entree) => entree.id === garde) ? (garde as VueSol) : "equipage";
  } catch {
    return "equipage";
  }
}

export default function GroundView() {
  const { theme, comptes } = useSession();
  const { sol } = useBackend();
  const equipage = useEquipageSol(sol);
  const { membres } = useEquipageSimule();
  // les mesures viennent-elles du module central, ou de la simulation locale ?
  const flux = sol || membres.some((membre) => membre.source === "module");
  const equipeInscrite = depuisComptes(comptes);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [vue, setVue] = useState<VueSol>(lireVueSol);
  const [consigneTexte, setConsigneTexte] = useState("Reporter l’exercice ARED et viser 8 h de sommeil sur 3 nuits");
  const [destinataire, setDestinataire] = useState("");
  // Les consignes vivent dans un magasin partagé : l’astronaute doit les retrouver de son
  // côté après le changement de rôle, et son accusé de réception doit remonter ici.
  const { liste: consignesPartagees, ajouter } = useConsignes();
  const [traitees, setTraitees] = useState<string[]>([]);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    try {
      window.localStorage.setItem(CLE_VUE_SOL, vue);
    } catch {
      /* stockage indisponible */
    }
  }, [vue]);

  // Un destinataire est un identifiant de connexion : c’est avec celui-ci que l’astronaute
  // se connecte de son côté, et c’est donc celui-ci qui doit figurer sur la consigne.
  const destinataires = [
    ...equipeInscrite.map((membre) => membre.nom),
    ...(equipage ? equipage.map((membre) => membre.id) : EQUIPAGE.map((membre) => membre.identifiant)),
  ];
  const cible = destinataire || destinataires[0] || "";

  // Les consignes de tout l'équipage d'un coup : changer de destinataire ne doit pas
  // faire disparaître celles adressées aux autres.
  const destinatairesBackend = equipage ? equipage.map((membre) => membre.id) : [];
  const messagesReels = useMessagesSolTous(sol, destinatairesBackend, version);

  // Deux origines qui se complètent au lieu de s'exclure : ce qui est réellement parti
  // par le poste sol, et ce qui reste en file ici (astronaute inscrit dans ce navigateur,
  // ou poste sol injoignable). Avant, la liste du backend masquait la file locale : une
  // consigne mise en file disparaissait aussitôt.
  const consignesDuBackend: LigneConsigne[] =
    sol && messagesReels
      ? messagesReels.map((message) => ({
          id: `api-${message.astronaut_id}-${message.id}`,
          miseEnFile: formatDate(message.ts),
          destinataire: message.astronaut_id,
          texte: message.text,
          etat: message.status === "read" ? "lue" : message.status === "delivered" ? "transmise" : "attente",
        }))
      : [];

  const consignesAffichees: LigneConsigne[] = [
    ...consignesPartagees.map((consigne) => ({
      id: consigne.id,
      miseEnFile: consigne.miseEnFile,
      destinataire: consigne.destinataire,
      texte: consigne.texte,
      etat: consigne.etat,
    })),
    ...consignesDuBackend,
  ];

  // tiroir de navigation : Échap referme, et le fond ne défile pas tant qu'il est ouvert
  useEffect(() => {
    if (!menuOuvert) return;
    const surTouche = (evenement: KeyboardEvent) => {
      if (evenement.key === "Escape") setMenuOuvert(false);
    };
    window.addEventListener("keydown", surTouche);
    const defilementInitial = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", surTouche);
      document.body.style.overflow = defilementInitial;
    };
  }, [menuOuvert]);

  const allerA = (cible: VueSol) => {
    setVue(cible);
    setMenuOuvert(false);
  };

  const mettreEnFile = async () => {
    const texte = consigneTexte.trim();
    if (texte.length < 5) return;

    // La consigne ne part par le poste sol que si son destinataire y existe : un
    // astronaute inscrit dans ce navigateur n'est pas connu du backend, sa consigne
    // reste donc dans la file locale au lieu d'échouer en silence.
    const surLeBackend = equipage?.some((membre) => membre.id === cible) ?? false;
    if (sol && cible && surLeBackend) {
      const envoi = await envoyerConsigneSol(cible, texte);
      if (envoi) {
        setConsigneTexte("");
        setVersion((valeur) => valeur + 1);
        setVue("consignes");
        return;
      }
    }

    ajouter(texte, cible, `jour ${missionDay} · 12:52 UTC`);
    setConsigneTexte("");
    setVue("consignes");
  };

  const basculerAlerte = (id: string) => {
    setTraitees((liste) => (liste.includes(id) ? liste.filter((element) => element !== id) : [...liste, id]));
  };

  const TITRES: Record<VueSol, { titre: string; sous: string }> = {
    equipage: {
      titre: `Équipage · ${(equipage ? equipage.length : EQUIPAGE.length) + equipeInscrite.length} membres`,
      sous: `Dernière remontée jour ${missionDay} · 12:18 UTC · prochaine fenêtre 12:52 UTC`,
    },
    alertes: {
      titre: "Alertes reçues",
      sous: `${ALERTES.length} alertes depuis le début de la mission · ${ALERTES.length - traitees.length} à traiter`,
    },
    journal: {
      titre: "Journal des mesures",
      sous: `Fenêtre du jour ${missionDay} · 12:16 → 12:18 UTC · ${JOURNAL.length} mesures`,
    },
    consignes: {
      titre: "Consignes envoyées",
      sous: `${consignesAffichees.length} consignes dans la file · transmission à la prochaine fenêtre`,
    },
  };

  return (
    <div className={`u-app ${menuOuvert ? "is-open" : ""}`}>
      <aside className="u-rail" id="app-nav">
        <div className="u-brand">
          <img
            className="u-brand-logo"
            src={theme === "sombre" ? "/marque-sombre.png" : "/marque-clair.png"}
            alt=""
            aria-hidden="true"
          />
          <div>
            <div className="u-brand-name">GlobalAstro</div>
            <div className="u-brand-sub">Poste sol</div>
          </div>
        </div>

        <nav className="u-nav" aria-label="Navigation du poste sol">
          <p className="u-nav-label">Surveillance</p>
          {NAV.map((entree) => (
            <button
              type="button"
              key={entree.id}
              className={`u-nav-btn ${vue === entree.id ? "is-active" : ""}`}
              aria-current={vue === entree.id ? "page" : undefined}
              onClick={() => allerA(entree.id)}
            >
              <span>{entree.label}</span>
              {entree.id === "alertes" && ALERTES.length - traitees.length > 0 && (
                <span className="u-nav-count" aria-label={`${ALERTES.length - traitees.length} alertes à traiter`}>
                  {ALERTES.length - traitees.length}
                </span>
              )}
              {entree.id === "consignes" && consignesAffichees.some((c) => c.etat === "attente") && (
                <span className="u-nav-count" aria-label="Consignes en attente">
                  {consignesAffichees.filter((c) => c.etat === "attente").length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <RailCompte statut="Station sol · liaison par fenêtres" note="aucune action en direct" />
      </aside>

      <div className="u-scrim" onClick={() => setMenuOuvert(false)} aria-hidden="true" />

      <main className="u-main" id="main-content">
        <header className="u-top">
          <button
            type="button"
            className="u-burger"
            aria-label="Ouvrir le menu des modules"
            aria-expanded={menuOuvert}
            aria-controls="app-nav"
            onClick={() => setMenuOuvert((ouvert) => !ouvert)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <div>
            <div className="u-title">{TITRES[vue].titre}</div>
            <div className="u-sub">{TITRES[vue].sous}</div>
          </div>
          <div className="u-top-actions">
            <span className={`u-chip ${flux ? "is-ok" : "is-warn"}`}>
              <span className={`u-dot is-${flux ? "ok" : "warn"}`} aria-hidden="true" />
              <span className="u-wide-only">
                {sol
                  ? "Poste sol connecté"
                  : flux
                    ? "Mesures reçues du bord"
                    : "Simulation · aucune mesure réelle"}
              </span>
              <span className="u-narrow-only">{flux ? "Connecté" : "Démo"}</span>
            </span>
          </div>
        </header>

        <div className="u-body">
          {vue === "equipage" && (
            <BlocEquipage
              consigneTexte={consigneTexte}
              setConsigneTexte={setConsigneTexte}
              destinataire={destinataire}
              setDestinataire={setDestinataire}
              destinataires={destinataires}
              mettreEnFile={mettreEnFile}
              equipage={equipage}
              nouveaux={equipeInscrite}
              membres={membres}
            />
          )}
          {vue === "alertes" && <BlocAlertes traitees={traitees} basculer={basculerAlerte} membres={membres} />}
          {vue === "journal" && <BlocJournal membres={membres} />}
          {vue === "consignes" && <BlocConsignes consignes={consignesAffichees} reel={sol} />}
        </div>

        <footer className="u-foot">
          <span>
            GlobalAstro Health <b>v1.2.0</b>
          </span>
          <span className="mid">Poste sol · prototype de démonstration · aucune donnée réelle</span>
          <span>K2/\Labs</span>
        </footer>
      </main>
    </div>
  );
}
