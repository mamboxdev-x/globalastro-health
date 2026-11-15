/**
 * Table de traduction français → anglais.
 *
 * La clé est le texte français tel qu'il est écrit dans les écrans. Un texte qui n'est pas dans la
 * table reste en français : c'est volontaire, cela évite d'afficher une clé technique ou un vide.
 *
 * Les textes à valeur variable (un nombre de membres, un numéro de jour, une date) sont traités par
 * les RÈGLES plus bas. Les motifs ne doivent PAS porter le drapeau « g » : le moteur teste puis
 * remplace sur la même expression, et un drapeau global ferait avancer son curseur interne.
 */

export const DICTIONNAIRE_EN: Record<string, string> = {
  /* --- navigation et structure --- */
  "Tableau de bord": "Dashboard",
  "Os & Cœur": "Bones & Heart",
  "Santé mentale": "Mental health",
  "Rayonnement": "Radiation",
  "Alerte": "Alert",
  "Hors ligne": "Offline",
  "Instructions": "Instructions",
  "Équipage": "Crew",
  "Alertes reçues": "Alerts received",
  "Journal des mesures": "Measurement log",
  "Consignes envoyées": "Instructions sent",
  Modules: "Modules",
  "Navigation principale": "Main navigation",
  "Navigation du poste sol": "Ground station navigation",
  "Ouvrir le menu des modules": "Open the modules menu",
  "Santé équipage": "Crew health",
  "Poste sol": "Ground station",
  "Station sol · liaison par fenêtres": "Ground station · window-based link",
  Surveillance: "Monitoring",
  "Centre de contrôle": "Mission Control",
  "Centre de contrôle · Houston": "Mission Control · Houston",
  Commandant: "Commander",
  "Ingénieur de vol": "Flight engineer",
  "Spécialiste de mission": "Mission specialist",
  "Une alerte en cours": "One active alert",
  "Consignes en attente": "Pending instructions",
  "Instruction à transmettre": "Instruction to transmit",
  "Indicateurs clés de la mission": "Key mission indicators",
  "État de l’équipage": "Crew status",
  "Sommeil à bord": "Sleep on board",
  "Alertes remontées par l’équipage": "Alerts reported by the crew",
  "Alertes du système de bord": "On-board system alerts",
  "Actions à examiner": "Actions to review",
  "Préparer une demande d’avis": "Prepare a consultation request",
  "Indicateurs cardiovasculaires": "Cardiovascular indicators",
  "Paramètres psychologiques": "Psychological parameters",
  "Durée par nuit": "Duration per night",
  "Séances du jour": "Today's sessions",
  "Débit & pression systolique": "Output & systolic pressure",
  "Variation depuis le jour 0": "Change since day 0",

  /* --- statuts et états --- */
  Nominal: "Nominal",
  "À suivre": "Watch",
  "À surveiller": "Watch",
  Critique: "Critical",
  Indisponible: "Unavailable",
  "NON RENS.": "NOT SET",
  "Connecté": "Connected",
  "Simulé": "Simulated",
  "dans la plage": "in range",
  "hors plage": "out of range",
  "Dans la plage": "In range",
  "Hors plage": "Out of range",
  "à jour": "up to date",
  "Niveau 1": "Level 1",
  "Niveau 2": "Level 2",
  Silencieux: "Silent",
  "tout est traité": "all handled",
  "toutes dans la plage": "all in range",
  "en écart": "off",
  "Validée": "Validated",
  Nouveau: "New",
  Suivie: "Tracked",
  "Marquer suivie": "Mark as tracked",
  "Pris en compte": "Acknowledged",
  "Prendre en compte": "Acknowledge",
  "Marquer traitée": "Mark as handled",
  "Synchronisation préparée": "Sync prepared",
  "Demande préparée": "Request prepared",
  "Consigne préparée": "Instruction prepared",
  "Non renseigné": "Not set",
  "Non calculée": "Not computed",
  "Dans la référence": "Within reference",
  "Seuil non défini": "Threshold not set",
  "Liaison interrompue": "Link interrupted",
  "connectée": "connected",
  "coupée": "disconnected",
  aucune: "none",
  "à suivre": "to watch",
  "à traiter": "to handle",
  simulation: "simulation",
  "système": "system",
  "Série non disponible": "Series unavailable",
  "Pas encore assez de points — laissez tourner les capteurs.":
    "Not enough points yet — let the sensors run.",

  /* --- compte, thème, langue --- */
  "Thème de l’interface": "Interface theme",
  Clair: "Light",
  Sombre: "Dark",
  "Langue de l’interface": "Interface language",
  "Se déconnecter": "Sign out",
  "Médecin · poste sol": "Flight surgeon · ground",
  "Astronaute · à bord": "Astronaut · on board",
  "invité": "guest",
  "Rôle dans la mission": "Role in the mission",
  "Type de compte": "Account type",
  "Identifiant de mission": "Mission identifier",
  "Identifiant du médecin": "Flight surgeon identifier",
  "Poids (kg)": "Weight (kg)",
  "Taille (m)": "Height (m)",
  Sexe: "Sex",
  Service: "Service",
  Astronaute: "Astronaut",
  "À bord. Suit ses indicateurs et agit.": "On board. Monitors their readings and acts.",
  "Sur Terre. Suit l’équipage et prépare des consignes.":
    "On Earth. Monitors the crew and prepares instructions.",
  "Ces trois valeurs alimentent la simulation des capteurs (receiver + capteurs Python) : elles servent au poids, à la masse maigre et au débit cardiaque.":
    "These three values feed the sensor simulation (receiver + Python sensors): they drive weight, lean mass and cardiac output.",
  "Mission en cours": "Mission in progress",
  "Orbite basse · jour 87": "Low orbit · day 87",
  "Surveillance de la santé d’un équipage de trois personnes en mission longue.":
    "Health monitoring for a three-person crew on a long-duration mission.",
  "Un aller-retour Terre ↔ orbite prend": "A return trip Earth ↔ orbit takes",
  ": le médecin au sol prépare, il n’agit pas en direct.":
    ": the flight surgeon on the ground prepares, and does not act in real time.",
  Fonctionne: "Works",
  "hors ligne": "offline",
  ": les mesures restent à bord et repartent à la fenêtre suivante.":
    ": measurements stay on board and go out at the next window.",
  "compte(s) créé(s) dans ce navigateur.": "account(s) created in this browser.",
  "Le compte est conservé dans ce navigateur : c’est un prototype, il n’y a pas de serveur d’identité.":
    "The account is kept in this browser: this is a prototype, there is no identity server.",
  "Choisissez votre rôle : l’interface change entièrement.":
    "Choose your role: the interface changes completely.",
  "Prototype d’aide à la décision : aucune donnée médicale réelle n’est traitée. NASA Space Apps 2026 · équipe K2/\\Labs.":
    "Decision-support prototype: no real medical data is processed. NASA Space Apps 2026 · K2/\\Labs team.",

  /* --- connexion --- */
  "Se connecter": "Sign in",
  Connexion: "Sign in",
  "Créer un compte": "Create an account",
  "Créer le compte et entrer": "Create the account and enter",
  "J’ai déjà un compte": "I already have an account",
  "Créer un compte astronaute ou médecin": "Create an astronaut or flight surgeon account",
  Identifiant: "Identifier",
  "Mot de passe": "Password",
  "Astronaute à bord": "Astronaut on board",
  "Médecin au sol": "Flight surgeon on the ground",
  "médecin": "flight surgeon",
  "Connexion impossible.": "Sign-in failed.",
  "Identifiant trop court : au moins 3 caractères.": "Identifier too short: at least 3 characters.",
  "Mot de passe trop court : au moins 8 caractères.": "Password too short: at least 8 characters.",
  "Mot de passe trop court : au moins 4 caractères.": "Password too short: at least 4 characters.",
  "Aucun compte sous cet identifiant.": "No account under that identifier.",
  "Mot de passe incorrect.": "Wrong password.",
  "Cet identifiant est déjà pris.": "That identifier is already taken.",
  "Cet identifiant est déjà inscrit dans la base du sol.":
    "That identifier is already registered in the ground database.",
  "La base du sol n'a pas accepté l'inscription.": "The ground database did not accept the registration.",
  "Connexion refusée par la base du sol.": "Connection refused by the ground database.",
  "Connexion refusée par la base.": "Connection refused by the database.",
  "Inscription refusée par la base du sol.": "Registration refused by the ground database.",
  "Inscription refusée par la base.": "Registration refused by the database.",
  "Inscription enregistrée dans la base du sol.": "Registration recorded in the ground database.",
  "Compte créé dans ce navigateur.": "Account created in this browser.",
  "Compte créé dans ce navigateur": "Account created in this browser",
  "Création impossible.": "Account creation failed.",
  "Poids et taille doivent être des nombres (ex. 78 et 1.82).":
    "Weight and height must be numbers (e.g. 78 and 1.82).",
  "GlobalAstro Health — la santé des astronautes": "GlobalAstro Health — astronaut health",
  "L'élément #root est introuvable dans index.html.":
    "The #root element is missing from index.html.",

  /* --- mesures et paramètres --- */
  "Fréquence de repos": "Resting heart rate",
  "Fréquence cardiaque": "Heart rate",
  "Tension artérielle": "Blood pressure",
  "Pression systolique": "Systolic pressure",
  "Pression diastolique": "Diastolic pressure",
  "Fréquence respiratoire": "Respiratory rate",
  "Débit cardiaque": "Cardiac output",
  "Saturation en oxygène": "Oxygen saturation",
  "Température corporelle": "Body temperature",
  "Densité minérale osseuse": "Bone mineral density",
  "Densité osseuse · score T": "Bone density · T-score",
  "Score T": "T-score",
  "Durée de sommeil": "Sleep duration",
  "Force de préhension": "Grip strength",
  "Force de préhension · droite": "Grip strength · right",
  "Force de préhension · gauche": "Grip strength · left",
  "Variabilité cardiaque": "Heart rate variability",
  "Dose intégrée": "Cumulative dose",
  "Débit de dose": "Dose rate",
  "CO₂ de cabine": "Cabin CO₂",
  "Score de stress": "Stress score",
  "Répartition": "Breakdown",
  Valeur: "Value",
  "Référence": "Reference",
  Plage: "Range",
  Statut: "Status",
  Heure: "Time",
  Date: "Date",
  Mesure: "Measurement",
  "Paramètre": "Parameter",
  Destinataire: "Recipient",
  "Destinataire ·": "Recipient ·",
  Consigne: "Instruction",
  "Unité": "Unit",
  Capteur: "Sensor",
  capteur: "sensor",
  "Écart": "Difference",
  "État": "State",
  Indicateur: "Indicator",
  "référence": "reference",
  seuil: "threshold",
  "Fenêtre d’envoi": "Transmission window",
  "Mettre en file pour la prochaine fenêtre": "Queue for the next window",
  "Mettre en file": "Queue",
  Valider: "Confirm",
  Masquer: "Hide",
  Voir: "View",
  fermer: "close",
  Traiter: "Handle",
  "Traitée": "Handled",
  "traitées": "handled",
  "En attente": "Pending",
  "Prendre la tension": "Take blood pressure",
  "Se retirer au poste": "Withdraw to the post",

  /* --- valeurs, unités et références --- */
  "cette nuit": "this night",
  "par rapport à la référence de 7 h 00": "versus the 7 h 00 reference",
  "seuil non atteint": "threshold not reached",
  "cumul de mission": "cumulative mission",
  "de la limite de carrière": "of the career limit",
  "% de la dose": "% of the dose",
  "% de la limite": "% of the limit",
  "% / 90 j": "% / 90 d",
  "écart-type": "standard deviation",
  "échelle à préciser": "scale to be specified",
  "T-score": "T-score",
  "7h00 · référence illustrative": "7h00 · illustrative reference",
  "61 bpm · référence pré-vol": "61 bpm · pre-flight reference",
  "120/80 mmHg · référence illustrative": "120/80 mmHg · illustrative reference",
  "−1,4 % par rapport au jour 0": "−1.4 % versus day 0",
  "T-score initial non fourni": "Initial T-score not provided",
  "Mesure atmosphérique non fournie": "Atmospheric measurement not provided",
  "Mesure initiale non fournie": "Initial measurement not provided",
  "Valeur illustrative · seuil à définir": "Illustrative value · threshold to be defined",

  /* --- tableau de bord --- */
  "Comparaison avec les références pré-vol · fenêtre glissante de 14 jours":
    "Comparison with pre-flight references · 14-day rolling window",
  "Capteurs du bord": "On-board sensors",
  "Mesures simulées": "Simulated measurements",
  "Données simulées": "Simulated data",
  "Tous les indicateurs dans la référence pré-vol": "All indicators within pre-flight reference",
  "Écart de sommeil sur trois nuits": "Sleep deficit over three nights",
  "Pression systolique en limite haute au réveil": "Systolic pressure at the high limit on waking",
  "Fréquence cardiaque au repos": "Resting heart rate",
  "Mesures reçues en direct": "Live measurements received",
  "Paramètre tracé": "Plotted parameter",
  "paramètres": "parameters",
  "critique(s)": "critical",
  "points reçus": "points received",

  /* --- os et cœur --- */
  "Densité osseuse et fonction cardiovasculaire · fenêtre de 90 jours":
    "Bone density and cardiovascular function · 90-day window",
  "% depuis J0": "% since D0",
  "Variation mesurée": "Measured change",
  "Seuil de suivi −2,0 %": "Watch threshold −2.0 %",
  "SEUIL −2,0 %": "THRESHOLD −2.0 %",
  "VARIATION DEPUIS LE JOUR 0 (%)": "CHANGE SINCE DAY 0 (%)",
  "Débit cardiaque (axe gauche, 4,5 à 5,6 L/min) et pression systolique (axe droit, 108 à 126 mmHg) sur 12 points.":
    "Cardiac output (left axis, 4.5 to 5.6 L/min) and systolic pressure (right axis, 108 to 126 mmHg) over 12 points.",
  "DÉBIT · AXE GAUCHE — PRESSION · AXE DROIT": "OUTPUT · LEFT AXIS — PRESSURE · RIGHT AXIS",
  "Débit · axe gauche": "Output · left axis",
  "Pression · axe droit": "Pressure · right axis",
  "Fonction cardiovasculaire": "Cardiovascular function",
  "Charge d’entraînement · jour 87": "Training load · day 87",
  "ARED — squats": "ARED — squats",
  "Tapis roulant T2": "Treadmill T2",
  "Vélo CEVIS": "CEVIS bike",
  "Force · membres inférieurs": "Strength · lower limbs",
  "Cardio · charge axiale": "Cardio · axial load",
  "Cardio · endurance": "Cardio · endurance",
  "Retirer la validation de": "Unvalidate",
  "J0 → J90": "D0 → D90",
  "J−1": "D−1",
  "J−2": "D−2",
  "J−3": "D−3",
  "J−4": "D−4",
  "J−5": "D−5",
  "J−6": "D−6",
  "J−13": "D−13",

  /* --- santé mentale --- */
  "Dépistage dépressif": "Depression screening",
  "Dépistage anxiété": "Anxiety screening",
  "Indice de bien-être": "Well-being index",
  "Journal du sommeil · 7 dernières nuits": "Sleep log · last 7 nights",
  "Référence pré-vol": "Pre-flight reference",
  "Écart cette nuit": "Difference this night",
  "Nuits sous la référence": "Nights below the reference",
  "Questionnaires déclaratifs": "Self-report questionnaires",
  "Réponse autonome": "Autonomic response",
  "Sommeil / HRV": "Sleep / HRV",
  "Corrélation des deux derniers cycles": "Correlation of the last two cycles",
  "Sommeil, ressenti déclaratif et réponse autonome":
    "Sleep, self-reported feeling and autonomic response",
  "0 / 3 remplis": "0 / 3 completed",
  "Les questionnaires n’ont pas été soumis : aucun score n’est calculé et aucune interprétation psychologique n’est produite.":
    "The questionnaires have not been submitted: no score is computed and no psychological interpretation is produced.",
  "Valeurs simulées, sans dispositif médical connecté.":
    "Simulated values, with no connected medical device.",

  /* --- rayonnement --- */
  "Cinquième danger des vols spatiaux habités · dose cumulée et contre-mesures":
    "Fifth hazard of crewed spaceflight · cumulative dose and countermeasures",
  "Éruption en cours": "Eruption in progress",
  "Simuler une éruption solaire": "Simulate a solar flare",
  "Événement solaire · particules en hausse": "Solar event · rising particle flux",
  "Éruption solaire détectée": "Solar flare detected",
  "Éruption solaire détectée : rejoindre la zone la plus protégée du module et reporter toute sortie extravéhiculaire.":
    "Solar flare detected: move to the most protected area of the module and postpone any EVA.",
  "dose en pic": "peak dose",
  "Une éruption solaire majeure peut délivrer une dose élevée en quelques minutes. Les particules solaires sont la seule composante que l’on peut anticiper à bord : la contre-mesure est un abri, pas un soin.":
    "A major solar flare can deliver a high dose within minutes. Solar particles are the only component that can be anticipated on board: the countermeasure is shelter, not treatment.",
  "Repli dans la zone la plus protégée": "Fall back to the most protected area",
  "Regrouper l’équipage à l’endroit du module le mieux blindé":
    "Gather the crew in the best-shielded part of the module",
  "Report des sorties extravéhiculaires": "Postpone EVAs",
  "Hors du véhicule, l’équipage perd son écran contre les particules":
    "Outside the vehicle, the crew loses its shielding against particles",
  "Préparer la consigne d’abri": "Prepare the shelter instruction",
  "La consigne est préparée dans l’interface ; aucun message n’est transmis par ce prototype.":
    "The instruction is prepared in the interface; no message is transmitted by this prototype.",
  "Dose intégrée depuis le début de la mission": "Cumulative dose since the start of the mission",
  "Exposition cumulée": "Cumulative exposure",
  "Rayonnement intégré": "Cumulative radiation",
  "La limite officielle n’est pas un nombre de millisieverts : elle est définie en risque (norme NASA-STD-3001 §4.2.10) et dépend de l’âge, du sexe et de la durée de mission.":
    "The official limit is not a number of millisieverts: it is defined in terms of risk (NASA-STD-3001 §4.2.10 standard) and depends on age, sex and mission duration.",
  "Part des neutrons": "Neutron share",
  "Pic sur 14 jours": "14-day peak",
  "14 derniers jours": "last 14 days",
  "Débit de dose quotidien": "Daily dose rate",
  "les barres ambre dépassent": "amber bars exceed",
  "aujourd’hui": "today",
  "À bord de la Station spatiale, environ 30 % de la dose reçue vient des neutrons — mesuré par l’expérience canadienne Radi-N2, qui servait aussi à cartographier les zones les mieux protégées.":
    "On board the Space Station, about 30 % of the dose received comes from neutrons — measured by the Canadian Radi-N2 experiment, which was also used to map the best-protected areas.",
  "Origine du rayonnement reçu": "Source of the radiation received",
  "Trois composantes": "Three components",
  "orbite basse": "low orbit",
  "En orbite basse, l’atmosphère et le champ magnétique terrestre protègent encore en partie l’équipage. Sur un trajet vers la Lune ou Mars, cette protection disparaît — c’est là que le risque change d’échelle.":
    "In low orbit, the atmosphere and the Earth's magnetic field still partly protect the crew. On a trip to the Moon or Mars, that protection disappears — that is where the risk changes scale.",
  "Ce qui protège réellement": "What actually protects",
  "Contre-mesures": "Countermeasures",
  mesures: "measures",
  "Rayons cosmiques galactiques": "Galactic cosmic rays",
  "venus de l’extérieur du système solaire": "coming from outside the solar system",
  "Particules solaires": "Solar particles",
  "émises lors des éruptions solaires": "emitted during solar flares",
  "Rayonnement piégé": "Trapped radiation",
  "retenu par le champ magnétique terrestre": "held by the Earth's magnetic field",
  "Cartographier la zone la plus protégée": "Map the most protected area",
  "Relever les zones du module qui offrent le meilleur abri en cas d’éruption solaire majeure.":
    "Identify the parts of the module that offer the best shelter during a major solar flare.",
  "Repli en cas d’éruption solaire": "Fall back in case of a solar flare",
  "Regrouper l’équipage dans la zone la mieux blindée dès la détection de particules solaires.":
    "Gather the crew in the best-shielded area as soon as solar particles are detected.",
  "Reporter les sorties extravéhiculaires": "Postpone EVAs",
  "Une sortie pendant un pic de particules solaires expose au rayonnement sans écran du véhicule.":
    "Going outside during a solar particle peak exposes you to radiation without the vehicle's shielding.",
  "Surveiller les effets à long terme": "Monitor long-term effects",
  "Cataractes, cancers et effets sur la descendance sont suivis après la mission, pas à bord.":
    "Cataracts, cancers and effects on offspring are monitored after the mission, not on board.",
  "D’où viennent ces repères": "Where these references come from",
  Sources: "Sources",
  Afficher: "Show",
  ouvrir: "open",
  "ASC — Agence spatiale canadienne": "CSA — Canadian Space Agency",
  "NASA — Human Research Program": "NASA — Human Research Program",
  "Valeurs chiffrées simulées. Cadre et repères issus des ressources officielles du défi : Agence spatiale canadienne et programme de recherche humaine de la NASA.":
    "Simulated figures. Framework and references taken from the challenge's official resources: Canadian Space Agency and NASA Human Research Program.",

  /* --- alertes --- */
  "Alerte MH-SL-072 · sommeil": "Alert MH-SL-072 · sleep",
  "Écart de sommeil à surveiller": "Sleep deficit to watch",
  "Seuil d’alerte": "Alert threshold",
  "L’écart est calculé entre la dernière valeur de sommeil et la référence pré-vol. Il ne constitue pas un avis médical.":
    "The difference is computed between the latest sleep value and the pre-flight reference. It does not constitute medical advice.",
  "1 alerte ouverte": "1 open alert",
  "Détection, dérive par rapport aux références et mesures de suivi":
    "Detection, drift from references and follow-up measurements",
  "Détection à bord · lignes de base personnelles": "On-board detection · personal baselines",
  "alerte(s)": "alert(s)",
  "alerte(s) sur 24 h": "alert(s) in 24 h",
  "Aucune alerte enregistrée à bord pour l’instant.": "No alert recorded on board so far.",
  "Alertes produites par la passerelle de bord : pic par z-score sur ligne de base personnelle, dérive lente sur 24 h, seuils critiques par capteur. Les messages sont ceux du moteur, en anglais.":
    "Alerts produced by the on-board gateway: z-score spikes against a personal baseline, slow drift over 24 h, per-sensor critical thresholds. The messages are those of the engine, in English.",
  "Une alerte reçue a déjà 12 minutes de retard.": "An alert received is already 12 minutes late.",
  "Elle décrit une situation au moment de l’émission, pas à l’instant où vous la lisez : préparez une consigne plutôt que de réagir à chaud.":
    "It describes a situation at the moment it was sent, not at the moment you read it: prepare an instruction rather than reacting in the heat of the moment.",
  "Mesures de suivi": "Follow-up measurements",
  "Le suivi est mémorisé dans l’interface uniquement : il ne confirme pas la réalisation d’un acte médical.":
    "Tracking is recorded in the interface only: it does not confirm that a medical act was performed.",
  "Examiner le protocole de récupération lumineuse": "Review the light-recovery protocol",
  "À valider avec le médecin au sol": "To be confirmed with the flight surgeon on the ground",
  "Réévaluer la charge cognitive du jour": "Reassess today's cognitive load",
  "Alléger les tâches non critiques": "Lighten non-critical tasks",
  "Consigner le sommeil et le ressenti": "Log sleep and how you feel",
  "Avant la prochaine période de repos": "Before the next rest period",
  "Liaison médecin au sol": "Link to the flight surgeon on the ground",
  "aller-retour 12 min": "round trip 12 min",
  "La demande est prête dans l’interface. Aucun message n’a été envoyé.":
    "The request is ready in the interface. No message has been sent.",
  "Aucun canal n’est connecté : le bouton prépare un état, il n’envoie rien.":
    "No channel is connected: the button prepares a state, it sends nothing.",
  "Le délai de 12 minutes correspond à un aller-retour Terre ↔ orbite basse : une consigne ne peut pas être appliquée en direct.":
    "The 12-minute delay corresponds to a round trip Earth ↔ low orbit: an instruction cannot be applied in real time.",

  /* --- hors ligne et liaison --- */
  "État de la liaison, stockage tampon et file d’attente":
    "Link status, buffer storage and queue",
  "Passerelle de bord · valeurs réellement mesurées":
    "On-board gateway · actually measured values",
  "Liaison avec le poste sol": "Link to the ground station",
  "Mesures en file à bord": "Measurements queued on board",
  "Dernier échange réussi": "Last successful exchange",
  "Dernière erreur": "Last error",
  "Lu directement sur la passerelle de bord : la file d’attente et l’état du lien ne sont pas simulés par l’interface. La synchronisation attend la fermeture des fenêtres de 5 minutes avant d’envoyer.":
    "Read directly from the on-board gateway: the queue and the link status are not simulated by the interface. Synchronisation waits for the 5-minute windows to close before sending.",
  "Liaison Terre — orbite": "Earth — orbit link",
  "Perte de signal en cours": "Loss of signal in progress",
  "Dernier échange": "Last exchange",
  "Prochaine fenêtre": "Next window",
  "Paquets en attente": "Pending packets",
  "· simulés": "· simulated",
  "La date du dernier échange et l’heure de la prochaine fenêtre ne sont pas fournies par ce prototype.":
    "The date of the last exchange and the time of the next window are not provided by this prototype.",
  "Stockage local": "Local storage",
  "Tampon de données physiologiques": "Physiological data buffer",
  "Mo / 64 Mo": "MB / 64 MB",
  "Occupation du tampon": "Buffer usage",
  "23 % occupé": "23 % used",
  "Le chiffrement et l’écriture réelle des paquets ne sont pas implémentés dans ce prototype.":
    "Encryption and actual packet writing are not implemented in this prototype.",
  "Journal technique": "Technical log",
  "Paquets en file d’attente": "Packets in the queue",
  "5 derniers": "last 5",
  "Exemple de paquets en attente de synchronisation": "Sample packets awaiting synchronisation",
  "Horodatage UTC": "UTC timestamp",
  Source: "Source",
  "Taille (Ko)": "Size (KB)",
  "Préparer la synchronisation": "Prepare sync",
  "La demande est enregistrée localement. Aucun paquet n’a été transmis.":
    "The request is recorded locally. No packet has been transmitted.",
  "Les paquets repartiront en bloc dès le retour de la liaison.":
    "The packets will go out in a batch as soon as the link returns.",
  "ECG-HRV / BIO-04": "ECG-HRV / BIO-04",
  "Tension / CARD-02": "Blood pressure / CARD-02",
  "Os / DMO-04": "Bone / DMO-04",
  "Sommeil / ACT-07": "Sleep / ACT-07",
  "Radiation / RAD-01": "Radiation / RAD-01",

  /* --- consignes et instructions --- */
  "en file au sol": "queued on the ground",
  "livrée au bord": "delivered on board",
  lue: "read",
  "lue par l’équipage": "read by the crew",
  "à la prochaine fenêtre": "at the next window",
  "J’ai lu": "I have read it",
  "À votre attention": "For your attention",
  "Les consignes arrivent avec la fenêtre de communication.":
    "Instructions arrive with the communication window.",
  "Le sol ne peut pas vous parler en direct : comptez au mieux 12 minutes pour un aller-retour, et une consigne écrite hors fenêtre attend la suivante. Accusez réception une fois l’instruction lue, le médecin le verra de son côté.":
    "The ground cannot talk to you in real time: allow at least 12 minutes for a round trip, and an instruction written outside a window waits for the next one. Acknowledge once you have read the instruction, the flight surgeon will see it on their side.",
  "Poste sol · reçues à bord": "Ground station · received on board",
  "Toutes vos instructions sont lues": "All your instructions are read",
  "Aucune instruction pour vous": "No instruction for you",
  "Rien en attente": "Nothing pending",
  "Le poste sol n’a pas mis d’instruction à votre nom. Celles-ci apparaissent après la prochaine fenêtre.":
    "The ground station has not addressed any instruction to you. They appear after the next window.",
  "silence radio": "radio silence",
  "Tout marquer comme lu": "Mark all as read",
  "Une consigne lue ici est marquée « lue par l’équipage » sur l’écran du médecin, au poste sol.":
    "An instruction read here is marked \"read by the crew\" on the flight surgeon's screen at the ground station.",
  "File commune · à titre d’information": "Shared queue · for information",
  "Instructions destinées aux autres": "Instructions for others",
  "consigne(s)": "instruction(s)",
  "File vide": "Empty queue",
  "Aucune consigne n’est adressée aux autres membres pour le moment.":
    "No instruction is addressed to other members at the moment.",
  "Affichées pour information : une consigne médicale reste destinée à la personne nommée. Vous ne pouvez accuser réception que de vos propres instructions.":
    "Shown for information: a medical instruction remains addressed to the named person. You can only acknowledge your own instructions.",

  /* --- poste sol --- */
  "Poste sol connecté": "Ground station connected",
  "Mesures reçues du bord": "Measurements received from the crew",
  "Simulation · aucune mesure réelle": "Simulation · no real measurement",
  "Poste sol · mesures simulées · aucune donnée réelle":
    "Ground station · simulated measurements · no real data",
  "Mesures simulées · backend non connecté": "Simulated measurements · backend not connected",
  "Système de bord connecté": "On-board system connected",
  "Historique des instructions préparées au sol et mises en file pour l’équipage":
    "History of instructions prepared on the ground and queued for the crew",
  "File de transmission": "Transmission queue",
  "Toutes les consignes sont transmises": "All instructions transmitted",
  consignes: "instructions",
  "Une consigne mise en file part avec les mesures à l’ouverture de la prochaine fenêtre. Aucun message n’est envoyé depuis ce prototype.":
    "A queued instruction goes out with the measurements at the opening of the next window. No message is sent from this prototype.",
  "Deux origines se mêlent ici : les consignes écrites sur le poste sol, dont l’état est lu auprès du backend (envoyée → transmise → lue), et celles restées dans la file locale faute de destinataire connu du poste sol — un astronaute inscrit dans ce navigateur, par exemple.":
    "Two sources are mixed here: instructions written on the ground station, whose status is read from the backend (sent → transmitted → read), and those left in the local queue because the ground station does not know the recipient — an astronaut registered in this browser, for example.",
  "Une consigne envoyée n’est pas une consigne appliquée.":
    "An instruction sent is not an instruction applied.",
  "L’équipage la reçoit au mieux 6 minutes après l’ouverture de la fenêtre, et c’est lui qui décide de l’exécuter.":
    "The crew receives it at best 6 minutes after the window opens, and it is the crew that decides whether to carry it out.",
  "Vous ne pouvez pas agir en direct.": "You cannot act in real time.",
  "Une consigne écrite maintenant sera lue par l’équipage après la prochaine fenêtre de communication, au mieux : le signal met 12 minutes pour un aller-retour.":
    "An instruction written now will be read by the crew after the next communication window at best: the signal takes 12 minutes for a round trip.",
  "Reçu du bord · mesure réelle": "Received from the crew · real measurement",
  "Dernières mesures reçues · 12:18 UTC": "Latest measurements received · 12:18 UTC",
  "paramètre(s) hors plage": "parameter(s) out of range",
  "Les lignes marquées « Nouveau » sont des astronautes inscrits dans ce navigateur : le registre des comptes est lu directement, aucun capteur ne les alimente encore.":
    "The lines marked \"New\" are astronauts registered in this browser: the account register is read directly, no sensor feeds them yet.",
  "Valeurs lues sur le poste sol (API AstroPulse) : état calculé à partir des résumés synchronisés par la passerelle.":
    "Values read on the ground station (AstroPulse API): status computed from the summaries synchronised by the gateway.",
  "Valeurs reçues à l’instant, identiques à celles du tableau de bord de chaque membre : une seule source alimente les deux interfaces.":
    "Values received just now, identical to those on each member's dashboard: a single source feeds both interfaces.",
  "La consigne part à la prochaine fenêtre de communication, avec les mesures du lot suivant. L’équipage en accuse réception à bord.":
    "The instruction goes out at the next communication window, with the measurements of the next batch. The crew acknowledges receipt on board.",
  "Reçu de l’équipage · 7 dernières nuits": "Received from the crew · last 7 nights",
  "nuits sous la référence": "nights below the reference",
  "Référence pré-vol 7 h 00. Les barres ambre sont sous la référence.":
    "Pre-flight reference 7:00. Amber bars are below the reference.",
  "Transmises à la fermeture de chaque fenêtre de communication":
    "Sent at the close of each communication window",
  "Depuis le début de la mission": "Since the start of the mission",
  "alertes issues des mesures": "alerts from the measurements",
  "Aucun paramètre hors plage": "No parameter out of range",
  "Toutes les mesures reçues sont dans leur plage nominale.":
    "All measurements received are within their nominal range.",
  "Le traitement est mémorisé dans l’interface du poste sol ; il ne déclenche aucune action à bord.":
    "Handling is recorded in the ground station interface; it triggers no action on board.",
  "Mesures reçues pendant la dernière fenêtre de communication · horodatage UTC":
    "Measurements received during the last communication window · UTC timestamp",
  "Reçu du bord · base du sol": "Received from the crew · ground database",
  "Simulation partagée · en attente d’une fenêtre": "Shared simulation · awaiting a window",
  "Mesures transmises par l’équipage lors de la dernière fenêtre":
    "Measurements transmitted by the crew during the last window",
  "Heure UTC": "UTC time",
  "Mesures affichées": "Measurements shown",
  "Mesures transmises par le bord à la dernière fenêtre de communication et conservées dans la base du sol. Le poste sol ne voit rien entre deux fenêtres — c’est tout l’enjeu du délai.":
    "Measurements transmitted by the crew at the last communication window and kept in the ground database. The ground station sees nothing between two windows — that is the whole point of the delay.",
  "Mesures vivantes de l’équipage : une seule source alimente les deux interfaces. Elles rejoindront la base du sol à la prochaine fenêtre de communication.":
    "Live crew measurements: a single source feeds both interfaces. They will reach the ground database at the next communication window.",
  "Membres suivis": "Members monitored",
  "Système d’aide à la décision ·": "Decision-support system ·",
  "aucun dispositif médical connecté": "no connected medical device",
  "· aucune donnée réelle": "· no real data",
  "aucune donnée réelle · usage non médical": "no real data · not for medical use",
  "Poste sol ·": "Ground station ·",

  /* --- messages et erreurs --- */
  "useSession doit être utilisé dans un SessionProvider.":
    "useSession must be used within a SessionProvider.",
  "useDemoState doit être utilisé à l'intérieur de DemoStateProvider.":
    "useDemoState must be used within a DemoStateProvider.",
  "useLangue doit être utilisé à l'intérieur de LangueProvider.":
    "useLangue must be used within a LangueProvider.",

  /* --- textes relevés à l'écran, complétés après la première vérification --- */
  "ACUITÉ VISUELLE": "VISUAL ACUITY",
  "CONCENTRATION CO₂": "CO₂ CONCENTRATION",
  "DENSITÉ OSSEUSE · SCORE T": "BONE DENSITY · T-SCORE",
  "DURÉE DE SOMMEIL": "SLEEP DURATION",
  "DÉBIT CARDIAQUE": "CARDIAC OUTPUT",
  "EXPOSITION AUX RADIATIONS": "RADIATION EXPOSURE",
  "FC AU REPOS": "RESTING HEART RATE",
  "FC au repos": "Resting heart rate",
  "FORCE DE PRÉHENSION": "GRIP STRENGTH",
  "FRÉQUENCE RESPIRATOIRE": "RESPIRATORY RATE",
  "SATURATION EN OXYGÈNE": "OXYGEN SATURATION",
  "T-SCORE OSSEUX": "BONE T-SCORE",
  "TEMPÉRATURE CORPORELLE": "BODY TEMPERATURE",
  "TENSION ARTÉRIELLE": "BLOOD PRESSURE",
  "VARIATION DMO": "BMD CHANGE",
  "Activité électrodermale": "Electrodermal activity",
  "Dose de radiation": "Radiation dose",
  "Efficacité du sommeil": "Sleep efficiency",
  Impédance: "Impedance",
  "Perte osseuse depuis 2023": "Bone loss since 2023",
  "Protéine C-réactive": "C-reactive protein",
  "Préparer la demande": "Prepare the request",
  "Score T (DEXA)": "T-score (DEXA)",
  "Sommeil paradoxal": "REM sleep",
  "Sommeil profond": "Deep sleep",
  "Vitamine D": "Vitamin D",
  "Cmdt Mbaye": "Cdr Mbaye",
  "Ing. Kouassi": "Eng. Kouassi",
  "· capteurs du module": "· module sensors",
  "HRV · référence pré-vol": "HRV · pre-flight reference",
  "Dernières valeurs reçues": "Latest values received",
  "reçue": "received",
  "· reçue": "· received",
  "La validation marque la séance comme faite dans l’interface ; elle ne provient pas d’un capteur.":
    "Confirming marks the session as done in the interface; it does not come from a sensor.",
  "Le T-score absolu n’est pas mesuré à bord ; il ne peut pas être déduit de cette variation relative.":
    "The absolute T-score is not measured on board; it cannot be deduced from this relative change.",
  "Le rayonnement n’a pas de traitement à bord : la seule contre-mesure immédiate est l’abri, la seule contre-mesure longue est le suivi après la mission.":
    "Radiation cannot be treated on board: the only immediate countermeasure is shelter, the only long-term one is follow-up after the mission.",
  "Relever la pression artérielle deux fois par jour pendant trois jours":
    "Measure blood pressure twice a day for three days",
  "Reporter l’exercice ARED et viser 8 h de sommeil sur 3 nuits":
    "Postpone ARED exercise and aim for 8 h of sleep over 3 nights",
  "Réévaluer la charge d’entraînement et transmettre le ressenti articulaire":
    "Reassess the training load and report joint pain",
  "Dernières valeurs reçues du module central, avec le statut calculé par ses seuils":
    "Latest values received from the central module, with the status computed from its thresholds",
  "Une consigne mise en file part à l’ouverture de la prochaine fenêtre, avec les mesures du lot. Elle reste en attente tant que la base du sol n’est pas joignable.":
    "A queued instruction leaves at the opening of the next window, with the batch of measurements. It stays pending as long as the ground database is unreachable.",
};

/**
 * Règles pour les textes qui contiennent une valeur. Le remplacement suit la syntaxe de
 * String.replace : $1, $2 désignent les groupes capturés.
 */
export const REGLES_EN: { motif: RegExp; remplacement: string | ((...groupes: string[]) => string) }[] = [
  { motif: /^Équipage · (\d+) membres?$/, remplacement: "Crew · $1 members" },
  { motif: /^Poste à bord · jour (\d+)$/, remplacement: "On board · day $1" },
  { motif: /^jour (\d+) · (\d+:\d+) UTC$/, remplacement: "day $1 · $2 UTC" },
  /* les infobulles des courbes : le libellé qui suit le tiret se traduit lui aussi */
  {
    motif: /^Tendance sur (\d+) points? — (.+)$/,
    remplacement: (nombre, libelle) => `Trend over ${nombre} points — ${DICTIONNAIRE_EN[libelle] ?? libelle}`,
  },
  /* le pied de panneau qui accompagne les mesures reçues à bord — ce sont des gabarits entiers,
     avec le nom du membre au milieu */
  {
    motif: /^Mêmes valeurs que celles affichées au poste sol pour (.+) : c'est la seule source, les deux écrans ne peuvent pas se contredire\. Simulation locale annoncée comme telle — lancez le module central \(receiver\.py \+ capteurs\.py\) pour voir passer de vraies remontées\.$/,
    remplacement: (membre) =>
      `Same values as those shown on the ground station for ${membre}: a single source, so the two screens cannot contradict each other. The local simulation says so — start the central module (receiver.py + capteurs.py) to see real readings come in.`,
  },
  {
    motif: /^Mesures réellement reçues du module central \(receiver\.py\) pour (.+), seuils calculés par le module et conservés dans mesures\.csv\.$/,
    remplacement: (membre) =>
      `Measurements actually received from the central module (receiver.py) for ${membre}: thresholds computed by the module and kept in mesures.csv.`,
  },
  { motif: /^jour (\d+)$/, remplacement: "day $1" },
  { motif: /^J(\d+)$/, remplacement: "D$1" },
  { motif: /^(\d+) paramètres?$/, remplacement: "$1 parameters" },
  { motif: /^(\d+) mesures?$/, remplacement: "$1 measurements" },
  { motif: /^(\d+) membres?$/, remplacement: "$1 members" },
  { motif: /^(\d+) instruction\(s\) à lire$/, remplacement: "$1 instruction(s) to read" },
  { motif: /^(\d+) critique\(s\)$/, remplacement: "$1 critical" },
  { motif: /^(\d+) à suivre$/, remplacement: "$1 to watch" },
  { motif: /^\/(\d+) validées?$/, remplacement: "/$1 validated" },
  /* le poste au sol : les compteurs et les bandeaux portent souvent une valeur */
  {
    motif: /^(\d+) alertes depuis le début de la mission · (\d+) à traiter$/,
    remplacement: "$1 alerts since the start of the mission · $2 to handle",
  },
  { motif: /^(\d+) en écart$/, remplacement: "$1 out of range" },
  { motif: /^Score T \(DEXA\) · (.+) écart-type$/, remplacement: "T-score (DEXA) · $1 SD" },
  {
    motif: /^Fenêtre du jour (\d+) · (\d+:\d+) → (\d+:\d+) UTC · (\d+) mesures?$/,
    remplacement: "Window of day $1 · $2 → $3 UTC · $4 measurements",
  },
  {
    motif: /^(\d+) consignes? dans la file · transmission à la prochaine fenêtre$/,
    remplacement: "$1 instructions in the queue · transmission at the next window",
  },
  {
    motif: /^(\d+) consigne\(s\) en attente de fenêtre$/,
    remplacement: "$1 instruction(s) waiting for a window",
  },
  { motif: /^Simulation partagée · (.+)$/, remplacement: "Shared simulation · $1" },
  { motif: /^Capteurs du module central · (.+)$/, remplacement: "Central module sensors · $1" },
  { motif: /^Reçu du bord · base du sol · (.+)$/, remplacement: "Received from the crew · ground database · $1" },
  { motif: /^Simulation partagée · en attente d’une fenêtre · (.+)$/,
    remplacement: "Shared simulation · awaiting a window · $1" },
  { motif: /^Prochain contact · jour (\d+) (\d+:\d+) UTC$/, remplacement: "Next contact · day $1 $2 UTC" },
  { motif: /^jour (\d+) · (\d+:\d+) → (\d+:\d+)$/, remplacement: "day $1 · $2 → $3" },
  /* les dates : les abréviations de mois sont écrites en français par l'application */
  { motif: /^(\d+) janv\. (\d{4})$/, remplacement: "$1 Jan $2" },
  { motif: /^(\d+) févr\. (\d{4})$/, remplacement: "$1 Feb $2" },
  { motif: /^(\d+) mars (\d{4})$/, remplacement: "$1 Mar $2" },
  { motif: /^(\d+) avr\. (\d{4})$/, remplacement: "$1 Apr $2" },
  { motif: /^(\d+) mai (\d{4})$/, remplacement: "$1 May $2" },
  { motif: /^(\d+) juin (\d{4})$/, remplacement: "$1 Jun $2" },
  { motif: /^(\d+) juil\. (\d{4})$/, remplacement: "$1 Jul $2" },
  { motif: /^(\d+) août (\d{4})$/, remplacement: "$1 Aug $2" },
  { motif: /^(\d+) sept\. (\d{4})$/, remplacement: "$1 Sep $2" },
  { motif: /^(\d+) oct\. (\d{4})$/, remplacement: "$1 Oct $2" },
  { motif: /^(\d+) nov\. (\d{4})$/, remplacement: "$1 Nov $2" },
  { motif: /^(\d+) déc\. (\d{4})$/, remplacement: "$1 Dec $2" },
];
