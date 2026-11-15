import { DICTIONNAIRE_EN, REGLES_EN } from "./dictionnaire";

export type Langue = "fr" | "en";

/**
 * Traduction de l'interface.
 *
 * Le texte est écrit en français directement dans les écrans : c'est la langue de travail de
 * l'équipe, et la réécrire partout en clés de traduction aurait été un chantier à haut risque sur
 * une application qui tourne. La traduction se fait donc à l'affichage, par-dessus : chaque texte
 * qui part à l'écran passe par cette table, et retrouve sa forme française dès qu'on repasse en
 * français. Une correspondance manquante laisse le texte d'origine — jamais de trou, jamais de clé
 * technique affichée.
 */
export function traduire(texte: string, langue: Langue): string {
  if (langue === "fr") return texte;
  const direct = DICTIONNAIRE_EN[texte];
  if (direct !== undefined) return direct;

  // les textes courts sont souvent encadrés d'espaces ou de puces : on retente sans
  const cle = texte.trim();
  if (!cle) return texte;
  const sansEspaces = DICTIONNAIRE_EN[cle];
  if (sansEspaces !== undefined) return texte.replace(cle, sansEspaces);

  for (const regle of REGLES_EN) {
    if (regle.motif.test(cle)) {
      const remplace = cle.replace(regle.motif, regle.remplacement);
      if (remplace !== cle) return texte.replace(cle, remplace);
    }
  }
  return texte;
}

/* ------------------------------------------------------------------ application au document */

type Souvenir = { original: string; traduit: string };

const souvenirsTexte = new WeakMap<Text, Souvenir>();
const souvenirsAttribut = new WeakMap<Element, Map<string, Souvenir>>();

/** Balises dont le contenu n'est jamais du texte affiché. */
const IGNOREES = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE", "SVG", "PATH"]);
/** Attributs qui portent du texte lu ou survolé par l'utilisateur. */
const ATTRIBUTS = ["placeholder", "title", "aria-label"];

function traiterTexte(noeud: Text, langue: Langue) {
  const parent = noeud.parentElement;
  if (!parent || IGNOREES.has(parent.tagName)) return;
  const souvenir = souvenirsTexte.get(noeud);
  const actuel = noeud.nodeValue ?? "";

  // Le noeud porte encore ce que nous venons d'y écrire : rien à faire, et surtout pas de boucle.
  if (souvenir && actuel === souvenir.traduit) return;

  if (!souvenir || souvenir.original !== actuel) {
    // texte neuf (ou modifié par l'application) : on le mémorise avant de le traduire
    souvenirsTexte.set(noeud, { original: actuel, traduit: actuel });
  }
  const memo = souvenirsTexte.get(noeud) as Souvenir;
  const attendu = traduire(memo.original, langue);
  memo.traduit = attendu;
  if (actuel !== attendu) noeud.nodeValue = attendu;
}

function traiterAttributs(element: Element, langue: Langue) {
  let memoire = souvenirsAttribut.get(element);
  for (const nom of ATTRIBUTS) {
    const valeur = element.getAttribute(nom);
    if (valeur === null || valeur === "") continue;
    if (!memoire) {
      memoire = new Map();
      souvenirsAttribut.set(element, memoire);
    }
    const souvenir = memoire.get(nom);
    if (souvenir && valeur === souvenir.traduit) continue;
    if (!souvenir || souvenir.original !== valeur) memoire.set(nom, { original: valeur, traduit: valeur });
    const memo = memoire.get(nom) as Souvenir;
    const attendu = traduire(memo.original, langue);
    memo.traduit = attendu;
    if (valeur !== attendu) element.setAttribute(nom, attendu);
  }
}

function parcourir(racine: Node, langue: Langue) {
  if (racine.nodeType === Node.TEXT_NODE) {
    traiterTexte(racine as Text, langue);
    return;
  }
  if (racine.nodeType !== Node.ELEMENT_NODE) return;
  traiterAttributs(racine as Element, langue);
  const marcheur = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let courant = marcheur.nextNode();
  while (courant) {
    if (courant.nodeType === Node.TEXT_NODE) traiterTexte(courant as Text, langue);
    else traiterAttributs(courant as Element, langue);
    courant = marcheur.nextNode();
  }
}

/**
 * Traduit le document, puis suit les changements : l'application se redessine sans arrêt (les
 * mesures défilent), donc les textes neufs doivent repasser par la table au fur et à mesure.
 * Le suivi s'arrête et les textes français sont rétablis dès qu'on repasse en français.
 */
export function appliquerTraduction(langue: Langue): () => void {
  parcourir(document.documentElement, langue);

  let planifie = false;
  const passer = () => {
    planifie = false;
    parcourir(document.documentElement, langue);
  };
  const observateur = new MutationObserver(() => {
    if (planifie) return;
    planifie = true;
    // Un délai nul plutôt qu'une image d'animation : dans un navigateur sans affichage (tests,
    // captures, serveur d'intégration), les images d'animation peuvent n'être jamais demandées,
    // et la traduction cesserait alors de suivre les redessins de l'application.
    window.setTimeout(passer, 0);
  });
  observateur.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRIBUTS,
  });

  /* Filet de sécurité : l'application se redessine en continu (les mesures défilent) et un
     observateur peut manquer un changement — un noeud remplacé plutôt que modifié, par exemple.
     Un passage régulier garantit que l'anglais reste en place ; le coût est négligeable (quelques
     centaines de noeuds, et un noeud déjà traduit n'est pas réécrit). */
  const filet = window.setInterval(() => parcourir(document.documentElement, langue), 600);

  return () => {
    observateur.disconnect();
    window.clearInterval(filet);
    // retour au français : on remet à chaque noeud le texte d'origine
    parcourir(document.documentElement, "fr");
  };
}
