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
/**
 * Les sources mélangent deux apostrophes : la droite (') et la typographique (’). Une même phrase
 * peut donc ne pas correspondre pour une seule différence de caractère invisible à l'œil. On essaie
 * les variantes avant de conclure qu'il n'y a pas de correspondance.
 */
function variantes(texte: string): string[] {
  if (!texte.includes("'") && !texte.includes("\u2019")) return [texte];
  return [texte, texte.replace(/\u2019/g, "'"), texte.replace(/'/g, "\u2019")];
}

function chercherDansLeDictionnaire(texte: string): string | undefined {
  for (const variante of variantes(texte)) {
    const trouve = DICTIONNAIRE_EN[variante];
    if (trouve !== undefined) return trouve;
  }
  return undefined;
}

export function traduire(texte: string, langue: Langue): string {
  if (langue === "fr") return texte;
  const direct = chercherDansLeDictionnaire(texte);
  if (direct !== undefined) return direct;

  // les textes courts sont souvent encadrés d'espaces ou de puces : on retente sans
  const cle = texte.trim();
  if (!cle) return texte;
  const sansEspaces = chercherDansLeDictionnaire(cle);
  if (sansEspaces !== undefined) return texte.replace(cle, sansEspaces);

  for (const regle of REGLES_EN) {
    if (!regle.motif.test(cle)) continue;
    let remplace: string;
    if (typeof regle.remplacement === "string") {
      remplace = cle.replace(regle.motif, regle.remplacement);
    } else {
      /* Une règle peut avoir besoin de traduire elle-même un morceau capturé (un libellé
         d'indicateur, par exemple) : elle reçoit alors les groupes capturés, sans les deux
         derniers arguments que String.replace ajoute toujours (position et chaîne d'origine). */
      const fabrique = regle.remplacement;
      remplace = cle.replace(regle.motif, (_correspondance, ...reste) =>
        fabrique(...(reste.slice(0, Math.max(0, reste.length - 2)) as string[])),
      );
    }
    if (remplace !== cle) return texte.replace(cle, remplace);
  }
  return texte;
}

/* ------------------------------------------------------------------ application au document */

type Souvenir = { original: string; affiche: string };

const souvenirsTexte = new WeakMap<Text, Souvenir>();
const souvenirsAttribut = new WeakMap<Element, Map<string, Souvenir>>();

/** Balises dont le contenu n'est jamais du texte affiché. */
const IGNOREES = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE", "SVG", "PATH"]);
/** Attributs qui portent du texte lu ou survolé par l'utilisateur. */
const ATTRIBUTS = ["placeholder", "title", "aria-label"];

function traiterTexte(noeud: Text, langue: Langue) {
  const parent = noeud.parentElement;
  if (!parent || IGNOREES.has(parent.tagName)) return;
  const actuel = noeud.nodeValue ?? "";
  const souvenir = souvenirsTexte.get(noeud);

  /* Le noeud a-t-il été réécrit par l'application depuis notre dernier passage ? Si sa valeur
     n'est ni le texte d'origine ni ce que nous y avons mis, c'est un texte neuf : il devient la
     nouvelle origine. Comparer au seul dernier texte écrit ne suffirait pas — en français, ce
     dernier texte EST le français, et l'on croirait à tort le travail déjà fait. */
  if (!souvenir || (actuel !== souvenir.original && actuel !== souvenir.affiche)) {
    souvenirsTexte.set(noeud, { original: actuel, affiche: actuel });
  }
  const memo = souvenirsTexte.get(noeud) as Souvenir;
  const attendu = traduire(memo.original, langue);
  if (actuel !== attendu) noeud.nodeValue = attendu;
  memo.affiche = attendu;
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
    if (!souvenir || (valeur !== souvenir.original && valeur !== souvenir.affiche)) {
      memoire.set(nom, { original: valeur, affiche: valeur });
    }
    const memo = memoire.get(nom) as Souvenir;
    const attendu = traduire(memo.original, langue);
    if (valeur !== attendu) element.setAttribute(nom, attendu);
    memo.affiche = attendu;
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
