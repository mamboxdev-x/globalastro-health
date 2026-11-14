import { useEffect, useState } from "react";
import RailCompte from "@/components/RailCompte";
import { useSession } from "@/context/SessionContext";
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
    initiales: "MB",
    nom: "Cmdt Mbaye",
    resume: `Sommeil ${currentSleepDuration} · écart ${sleepDifferenceMinutes} min`,
    etat: "warn" as const,
    libelle: "À suivre",
  },
  {
    initiales: "KP",
    nom: "Ing. Kouassi",
    resume: "Tous les indicateurs dans la référence pré-vol",
    etat: "ok" as const,
    libelle: "Nominal",
  },
  {
    initiales: "AS",
    nom: "Dr Aminata S.",
    resume: `Densité osseuse ${formatSignedPercent(boneDensityData.changePercent)} sur 90 jours`,
    etat: "warn" as const,
    libelle: "À suivre",
  },
];

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
  { heure: "12:16:40", indicateur: "Densité minérale osseuse", valeur: formatSignedPercent(boneDensityData.changePercent), reference: `seuil ${formatSignedPercent(boneDensityData.alertThresholdPercent)}`, ecart: "seuil non atteint", etat: "warn" },
];

type Consigne = {
  id: string;
  miseEnFile: string;
  destinataire: string;
  texte: string;
  etat: "en attente" | "transmise";
};

const CONSIGNES_INITIALES: Consigne[] = [
  {
    id: "c-086",
    miseEnFile: "jour 86 · 12:44 UTC",
    destinataire: "Dr Aminata S.",
    texte: "Réévaluer la charge d’entraînement et transmettre le ressenti articulaire",
    etat: "transmise",
  },
  {
    id: "c-085",
    miseEnFile: "jour 85 · 08:12 UTC",
    destinataire: "Ing. Kouassi",
    texte: "Relever la pression artérielle deux fois par jour pendant trois jours",
    etat: "transmise",
  },
];

const REFERENCE_MINUTES = 420;

/* ------------------------------------------------------------ sous-vues --- */

function BlocEquipage({
  consigneTexte,
  setConsigneTexte,
  destinataire,
  setDestinataire,
  mettreEnFile,
}: {
  consigneTexte: string;
  setConsigneTexte: (valeur: string) => void;
  destinataire: string;
  setDestinataire: (valeur: string) => void;
  mettreEnFile: () => void;
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
              <p className="u-panel-kicker">Dernières mesures reçues · 12:18 UTC</p>
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
              {EQUIPAGE.map((membre) => (
                <div className="u-row" key={membre.initiales}>
                  <span className="u-row-value is-muted" style={{ width: 26 }}>{membre.initiales}</span>
                  <span className="u-row-k">
                    <b>{membre.nom}</b>
                    <small>{membre.resume}</small>
                  </span>
                  <span className={`u-chip ${membre.etat === "ok" ? "is-ok" : "is-warn"}`}>
                    <span className={`u-dot is-${membre.etat}`} aria-hidden="true" />
                    {membre.libelle}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="u-panel-foot">
            Ces valeurs proviennent de la couche de démonstration et ne sont pas transmises par un capteur réel.
          </div>
        </section>

        <section className="u-panel" aria-labelledby="consigne-title">
          <div className="u-panel-head">
            <div>
              <p className="u-panel-kicker">Destinataire · {destinataire}</p>
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
                {EQUIPAGE.map((membre) => (
                  <option key={membre.nom} value={membre.nom}>
                    {membre.nom}
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
            <span className="u-chip is-warn mono">3 nuits sous la référence</span>
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

function BlocAlertes({ traitees, basculer }: { traitees: string[]; basculer: (id: string) => void }) {
  const restantes = ALERTES.length - traitees.length;

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
              {ALERTES.length} alertes reçues
            </h2>
          </div>
          <div className="u-panel-right">
            <span className="u-chip mono">{traitees.length} / {ALERTES.length} traitées</span>
          </div>
        </div>

        <div className="u-panel-body tight">
          <div className="u-rows">
            {ALERTES.map((alerte) => {
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

function BlocJournal() {
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
            <p className="u-panel-kicker">Fenêtre terminée · 6 mesures</p>
            <h2 className="u-panel-title" id="journal-titre">
              Dernières valeurs reçues
            </h2>
          </div>
          <div className="u-panel-right">
            <span className="u-chip is-warn mono">2 en écart</span>
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
              {JOURNAL.map((ligne) => (
                <tr key={ligne.heure}>
                  <td>{ligne.heure}</td>
                  <td>{ligne.indicateur}</td>
                  <td className="is-num">{ligne.valeur}</td>
                  <td className="is-num">{ligne.reference}</td>
                  <td>{ligne.ecart}</td>
                  <td>
                    <span className={`u-chip ${ligne.etat === "ok" ? "is-ok" : "is-warn"}`}>
                      {ligne.etat === "ok" ? "Dans la référence" : "À suivre"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="u-stats">
          <div className="u-stat">
            <span className="u-stat-k">Mesures reçues</span>
            <span className="u-stat-v">{JOURNAL.length}</span>
          </div>
          <div className="u-stat">
            <span className="u-stat-k">Dans la référence</span>
            <span className="u-stat-v">{JOURNAL.filter((l) => l.etat === "ok").length}</span>
          </div>
          <div className="u-stat">
            <span className="u-stat-k">À suivre</span>
            <span className="u-stat-v">{JOURNAL.filter((l) => l.etat !== "ok").length}</span>
          </div>
          <div className="u-stat">
            <span className="u-stat-k">Prochaine fenêtre</span>
            <span className="u-stat-v">12:52</span>
          </div>
        </div>

        <div className="u-panel-foot">
          Entre deux fenêtres, les mesures restent à bord dans le tampon local : le journal du poste sol ne se
          remplit qu’à la réception.
        </div>
      </section>
    </>
  );
}

function BlocConsignes({ consignes }: { consignes: Consigne[] }) {
  const enAttente = consignes.filter((consigne) => consigne.etat === "en attente").length;

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
                <span className={`u-chip ${consigne.etat === "en attente" ? "is-warn" : "is-ok"}`}>
                  {consigne.etat === "en attente" ? "à la prochaine fenêtre" : "transmise"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="u-panel-foot">
          Une consigne mise en file part avec les mesures à l’ouverture de la prochaine fenêtre. Aucun message n’est
          envoyé depuis ce prototype.
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

export default function GroundView() {
  const { theme } = useSession();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [vue, setVue] = useState<VueSol>("equipage");
  const [consigneTexte, setConsigneTexte] = useState("Reporter l’exercice ARED et viser 8 h de sommeil sur 3 nuits");
  const [destinataire, setDestinataire] = useState(EQUIPAGE[0].nom);
  const [consignes, setConsignes] = useState<Consigne[]>(CONSIGNES_INITIALES);
  const [traitees, setTraitees] = useState<string[]>([]);

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

  const mettreEnFile = () => {
    const texte = consigneTexte.trim();
    if (texte.length < 5) return;
    setConsignes((liste) => [
      {
        id: `c-${missionDay}-${liste.length + 1}`,
        miseEnFile: `jour ${missionDay} · 12:52 UTC`,
        destinataire,
        texte,
        etat: "en attente",
      },
      ...liste,
    ]);
    setConsigneTexte("");
    setVue("consignes");
  };

  const basculerAlerte = (id: string) => {
    setTraitees((liste) => (liste.includes(id) ? liste.filter((element) => element !== id) : [...liste, id]));
  };

  const TITRES: Record<VueSol, { titre: string; sous: string }> = {
    equipage: {
      titre: `Équipage · ${EQUIPAGE.length} membres`,
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
      sous: `${consignes.length} consignes dans la file · transmission à la prochaine fenêtre`,
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
              {entree.id === "consignes" && consignes.some((c) => c.etat === "en attente") && (
                <span className="u-nav-count" aria-label="Une consigne en attente">
                  {consignes.filter((c) => c.etat === "en attente").length}
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
            <span className="u-chip is-warn">
              <span className="u-dot is-warn" aria-hidden="true" />
              <span className="u-wide-only">Prototype · données simulées</span>
              <span className="u-narrow-only">Démo</span>
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
              mettreEnFile={mettreEnFile}
            />
          )}
          {vue === "alertes" && <BlocAlertes traitees={traitees} basculer={basculerAlerte} />}
          {vue === "journal" && <BlocJournal />}
          {vue === "consignes" && <BlocConsignes consignes={consignes} />}
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
