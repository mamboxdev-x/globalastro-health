/**
 * Rayonnement spatial — cinquième danger des vols spatiaux habités.
 *
 * Les valeurs chiffrées ci-dessous sont des valeurs de DÉMONSTRATION, comme le
 * reste de l'application. Le cadre, lui, est sourcé : types de rayonnement et
 * part des neutrons (Agence spatiale canadienne), limite de carrière exprimée
 * en risque (norme NASA-STD-3001 §4.2.10). Détail et URL : docs/SOURCES_NASA.md
 */

export const radiationData = {
  /**
   * Dose intégrée depuis le début de la mission, en millisievert.
   * Valeur de démonstration : ne pas présenter comme une mesure réelle.
   */
  doseIntegreeMsV: 128,

  /**
   * Part de la limite de carrière déjà atteinte, en pourcentage.
   * On raisonne en pourcentage, jamais en millisievert absolu : la limite
   * officielle est définie en risque (≈ 3 % de risque de décès induit par
   * l'exposition) et dépend de l'âge, du sexe et de la durée de la mission.
   */
  pourcentageLimite: 41,

  /**
   * Part des neutrons dans la dose reçue à bord de la Station spatiale
   * internationale : environ 30 %, mesurée par l'expérience canadienne Radi-N2.
   */
  partNeutronsPourcent: 30,

  /** Débit de dose quotidien, en microsievert par jour, sur 14 jours (démonstration). */
  debitQuotidienMicroSv: [210, 198, 225, 240, 219, 205, 232, 248, 260, 241, 228, 215, 236, 252],

  /** Débit de dose maximal admissible retenu pour l'échelle du graphique (démonstration). */
  debitPlafondMicroSv: 320,

  /** Origine du rayonnement reçu (démonstration), d'après la classification de l'ASC. */
  origines: [
    { nom: "Rayons cosmiques galactiques", part: 62, note: "venus de l’extérieur du système solaire" },
    { nom: "Particules solaires", part: 23, note: "émises lors des éruptions solaires" },
    { nom: "Rayonnement piégé", part: 15, note: "retenu par le champ magnétique terrestre" },
  ],
} as const;

/** Contre-mesures documentées. Radi-N2 servait notamment à cartographier l'ISS. */
export const contreMesures = [
  {
    titre: "Cartographier la zone la plus protégée",
    detail: "Relever les zones du module qui offrent le meilleur abri en cas d’éruption solaire majeure.",
  },
  {
    titre: "Repli en cas d’éruption solaire",
    detail: "Regrouper l’équipage dans la zone la mieux blindée dès la détection de particules solaires.",
  },
  {
    titre: "Reporter les sorties extravéhiculaires",
    detail: "Une sortie pendant un pic de particules solaires expose au rayonnement sans écran du véhicule.",
  },
  {
    titre: "Surveiller les effets à long terme",
    detail: "Cataractes, cancers et effets sur la descendance sont suivis après la mission, pas à bord.",
  },
] as const;

/** Sources citées à l'écran et dans la soumission. */
export const sources = [
  {
    organisme: "ASC — Agence spatiale canadienne",
    titre: "How does radiation affect the human body in space?",
    url: "https://asc-csa.gc.ca/eng/astronauts/space-medicine/radiation.asp",
  },
  {
    organisme: "ASC — Agence spatiale canadienne",
    titre: "Radi-N2: Tracking space radiation and its risks",
    url: "https://asc-csa.gc.ca/eng/sciences/radi-n2.asp",
  },
  {
    organisme: "NASA — Human Research Program",
    titre: "5 Hazards of Human Spaceflight",
    url: "https://www.nasa.gov/hrp/hazards/",
  },
  {
    organisme: "NASA — Human Research Program",
    titre: "Risks of Human Spaceflight",
    url: "https://www.nasa.gov/hrp/risks/",
  },
] as const;

/** Consigne préparée en cas d'éruption solaire (contre-mesure documentée). */
export const consigneEruptionSolaire =
  "Éruption solaire détectée : rejoindre la zone la plus protégée du module et reporter toute sortie extravéhiculaire.";
