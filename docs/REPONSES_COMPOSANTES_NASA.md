# Composantes du projet — réponses à remplir dans le formulaire

**Projet :** GlobalAstro Health
**Équipe :** K2/\Labs
**Défi :** Create Health Monitoring Software for Astronauts on Space Missions
**Édition :** NASA Space Apps Challenge 2026

Ce document ne remplace pas le formulaire : il contient le texte à y coller, point par point,
dans l'ordre où le formulaire les demande. Les réponses marquées **[à compléter]** demandent une
information que seule l'équipe détient.

---

## 1. Nom du projet et résumé général

**Nom du projet :** GlobalAstro Health

**Résumé (158 mots) :**

> En mission longue, personne ne peut surveiller l'équipage : il n'y a pas de médecin à bord, et le
> signal met des dizaines de minutes à atteindre la Terre. Les astronautes portent donc eux-mêmes
> la responsabilité de repérer les changements de leur santé. Un tableau de bord qui défile ne
> répond pas à cette question. GlobalAstro Health est un système d'aide à la décision construit
> autour d'une seule question : quand un résultat justifie-t-il l'attention de l'équipage ou des
> chirurgiens de vol ? Il équipe les deux extrémités de la mission. À bord, sept écrans donnent à
> l'équipage les moyens de repérer seul une dérive : indicateurs, os et cœur, santé mentale,
> rayonnement, alertes, mode hors ligne, consignes reçues. Au sol, quatre écrans donnent au médecin
> l'état de l'équipage et le cycle complet d'une consigne, de sa préparation à son accusé de
> réception. Les cinq dangers documentés par le programme de recherche humaine de la NASA
> structurent l'interface.

*(Contrainte respectée : entre 50 et 200 mots.)*

---

## 2. Lien vers le projet et lien vers la démonstration

> **Attention : le formulaire ne demande qu'UN SEUL lien** — soit un diaporama (7 diapositives
> maximum, la page de titre comptant), soit une vidéo de 30 secondes sous-titrée en anglais.
> **C'est le point à trancher avant de soumettre.**

**Lien du projet (application en ligne) :**

```
https://www.globalastro.health
```

**Lien à donner comme « démonstration » — choisir l'un des deux :**

| Option | Ce qu'il faut faire | État |
|---|---|---|
| **Diaporama (recommandé)** | Déposer `Diaporama_GlobalAstro_Health.pdf` (7 diapositives) sur Google Drive ou GitHub, en accès public, et coller le lien | Prêt, à héberger |
| Vidéo de 30 s | Enregistrer l'écran, sous-titres anglais obligatoires, déposer sur YouTube, lien public | À produire |

**Trois vérifications à faire avant de coller un lien :**

1. Ouvrir le lien **dans une fenêtre de navigation privée** : aucun mot de passe, aucune connexion,
   aucune demande d'autorisation ne doit apparaître.
2. Vérifier que le lien est accessible sans compte (ni Google, ni GitHub).
3. Vérifier qu'aucune personne de moins de 18 ans n'apparaît à l'image ou au son.

**Comptes d'accès à indiquer aux évaluateurs** (l'application demande une connexion — elle est
livrée avec deux comptes prêts) :

| Rôle | Identifiant | Mot de passe |
|---|---|---|
| Astronaute à bord | `cdr.mbaye` | `orbite2026` |
| Médecin au sol | `dr.anderson` | `orbite2026` |

*(Un évaluateur peut aussi créer son propre compte depuis l'écran de connexion, en choisissant son
rôle.)*

---

## 3. Détails du projet

### Que fait-il exactement ?

Le système sert deux métiers, avec deux interfaces entièrement différentes selon qui se connecte.

**À bord, pour l'équipage — sept écrans :**

1. **Tableau de bord** — les indicateurs de l'équipage réunis, chacun avec sa référence pré-vol et
   sa tendance, pour repérer une dérive et non lire un chiffre.
2. **Os et cœur** — densité minérale osseuse et paramètres cardiovasculaires, avec les
   contre-mesures d'exercice réellement utilisées à bord de la Station spatiale internationale.
3. **Santé mentale** — sommeil, charge de travail, moral : le danger « isolement et confinement ».
4. **Rayonnement** — l'exposition exprimée en **pourcentage de la limite de carrière**, jamais en
   millisieverts absolus, avec la contre-mesure d'abri.
5. **Alertes** — l'écart constaté, la conduite à tenir, et l'action corrective à cocher.
6. **Hors ligne** — ce qui continue de fonctionner sans liaison, et la préparation de la demande de
   synchronisation.
7. **Instructions** — les consignes venues du sol, avec accusé de réception.

**Au sol, pour le médecin — quatre vues :**

1. **Équipage** — les membres suivis, leurs valeurs reçues à la dernière fenêtre, l'écart à la
   référence ; toute personne inscrite apparaît, y compris depuis un autre appareil.
2. **Alertes** — dérivées automatiquement des mesures hors plage, jamais saisies à la main.
3. **Journal** — les dernières mesures reçues du bord, triées par gravité, avec la plage attendue.
4. **Consignes** — l'écriture d'une consigne et son cycle d'état : *en attente* → *livrée au bord* →
   *lue par l'équipage*.

### Comment fonctionne-t-il ?

**À bord**, quinze capteurs (oxymètre MAX30102, thermomètre MAX30205, capteur de CO₂ MH-Z19,
centrale inertielle MPU6050, DEXA, dynamomètre Jamar, tensiomètre Omron, résistance cutanée,
dosimètre, bracelet, ceinture, laboratoire, calcul, InBody, balance) produisent 25 paramètres
physiologiques et environnementaux. Ils alimentent un **module central écrit en Python**, sans
aucune dépendance externe, qui calcule les seuils, attribue un statut (nominal, à suivre, critique)
et tient l'historique local. **Rien dans cette chaîne ne dépend du réseau** : une coupure de liaison
ne doit pas interrompre la surveillance.

**La liaison est le cœur du raisonnement.** Il n'y a pas de flux continu entre le bord et la Terre.
Les mesures restent à bord et partent **à la fenêtre de communication**. C'est pour cela que
l'interface du sol ne propose jamais d'agir en direct : elle prépare, l'équipage applique, et
l'accusé de réception remonte à la fenêtre suivante. Le délai n'est pas un détail d'implémentation,
c'est ce qui définit les deux métiers.

**Au sol**, une base hébergée (PostgreSQL) porte les comptes, les consignes et les mesures reçues.
Le site étant statique, c'est son interface REST qui tient lieu de serveur applicatif.

### Quels avantages apporte-t-il ?

- **Il répond à la question du défi, pas à une autre.** La difficulté n'est pas de mesurer, c'est de
  décider quand une mesure mérite une action. Chaque écran est construit autour de cette décision.
- **Il tient compte du délai réel.** Aucune promesse d'intervention immédiate : le sol prépare.
- **Il est utilisable par un non-médecin.** Les écrans parlent de conduite à tenir avant de parler de
  pathologie.
- **Il fonctionne hors ligne**, ce qui est la condition de survie de tout outil embarqué.
- **Il ne ment jamais sur ses données.** Chaque valeur affichée indique sa provenance, et le système
  dit clairement ce qui est mesuré, ce qui est simulé et ce qui reste à construire.
- **Il relie réellement les deux extrémités.** Une consigne écrite au sol arrive à bord, et l'accusé
  de réception revient : la boucle complète est démontrée, pas décrite.

---

## 4. Utilisation de l'IA (question obligatoire)

> Le formulaire précise que **cette réponse sert uniquement à la collecte de données : les juges ne
> la voient pas**. En revanche, ils peuvent voir tout indicateur de génération par intelligence
> artificielle présent dans le projet. Nous avons donc choisi de l'écrire aussi dans la description
> du projet, par honnêteté, plutôt que de le laisser deviner.

**Outils utilisés : [à compléter par chacun — voici ce qui est établi pour le dépôt]**

| Outil | Où et comment il a été utilisé |
|---|---|
| **Hermes Agent** (agent de développement assisté par un grand modèle de langage) | Écriture et relecture du code des deux interfaces, du module central en Python et de la base du sol ; rédaction de la documentation du dépôt ; écriture des scripts de vérification ; analyse des données de mesure pour vérifier la cohérence entre les deux interfaces. Utilisé comme un outil de développement, sous décision et relecture humaines. |
| **[à compléter]** | Documents, présentation, visuels, extraction de données : à préciser selon ce que chaque membre a utilisé. |

**Précisions que nous apportons :**

- **Aucun élément de marque ou de design de la NASA n'a été généré ni utilisé** (logo, drapeau,
  identifiant de mission, police, habillage). La NASA n'approuve aucune entité non gouvernementale
  américaine : nous citons ses ressources, nous ne les republions pas et nous ne nous présentons pas
  comme approuvés par elle.
- **Les valeurs affichées dans l'application sont simulées**, et l'interface l'indique. Aucune donnée
  médicale réelle n'est utilisée, donc aucune donnée personnelle n'a transité par un outil d'IA.
- **Aucune image de synthèse ne figure dans le produit.** L'identité visuelle (logo, palette) a été
  créée par l'équipe.

---

## 5. Données de la NASA utilisées

*(Rappel du règlement : **au moins une ressource NASA du défi est obligatoire** pour concourir aux
prix mondiaux.)*

| Ressource | Ce que nous en avons tiré | Lien |
|---|---|---|
| Taxonomie des cinq dangers des vols spatiaux habités — programme de recherche humaine de la NASA | La colonne vertébrale de l'interface : les cinq dangers structurent les écrans, et chaque écran renvoie au danger correspondant | https://www.nasa.gov/hrp/hazards/ |
| Human Research Roadmap — risque 77 | *Risk of Bone Fracture due to Spaceflight-induced Changes to Bone* : fonde l'écran « Os et cœur » | https://humanresearchroadmap.nasa.gov/risks/ |
| Human Research Roadmap — risque 179 | *Risk of Cardiovascular Adaptations Contributing to Adverse Mission Performance and Health Outcomes* | https://humanresearchroadmap.nasa.gov/risks/ |
| Human Research Roadmap — risque 99 | *Risk of Adverse Cognitive or Behavioral Changes and Psychiatric Disorders* : fonde l'écran « Santé mentale » | https://humanresearchroadmap.nasa.gov/risks/ |
| Human Research Roadmap — risque 175 | *Risk of Adverse Mission Outcomes Due to Earth Independent Human-Systems Operations* : fonde l'écran « Hors ligne » | https://humanresearchroadmap.nasa.gov/risks/ |
| NASA-STD-3001, volume 1, §4.2.10 | La limite de dose de carrière s'exprime en **risque**, non en millisieverts absolus : c'est pourquoi l'écran « Rayonnement » affiche un pourcentage de cette limite | https://standards.nasa.gov/standard/nasa/nasa-std-3001 |
| NASA — risque cardiovasculaire | La contre-mesure de pression négative des membres inférieurs (LBNP, Chibis) | https://www.nasa.gov/directorates/esdmd/hhp/cv-risk/ |
| NASA — risque musculaire | L'effet d'un programme d'exercice suivi sur la récupération musculaire | https://www.nasa.gov/directorates/esdmd/hhp/muscle-risk/ |
| Liste des risques du programme de recherche humaine | La liste complète des risques, parcourue pour vérifier que nous n'oublions pas un danger | https://www.nasa.gov/hrp/risks/ |

**Comment ces ressources sont utilisées, concrètement :** elles ne sont pas citées en bibliographie,
elles **décident de la structure du produit**. Les cinq dangers déterminent les cinq familles
d'écrans à bord ; la formulation de la limite de dose par la NASA interdit d'afficher une dose en
millisieverts absolus ; la contre-mesure d'abri de l'éruption solaire devient une action proposée à
l'équipage.

---

## 6. Données des agences spatiales partenaires et autres ressources

*(Facultatif mais encouragé.)*

| Ressource | Ce que nous en avons tiré | Lien |
|---|---|---|
| Agence spatiale canadienne — *How does radiation affect the human body in space?* | Les trois composantes du rayonnement spatial (rayons cosmiques galactiques, particules solaires, rayonnement piégé), les effets à long terme (cataractes, cancers, atteinte de la descendance), et le fait qu'en orbite basse l'atmosphère et le champ magnétique terrestre protègent encore en partie | https://asc-csa.gc.ca/eng/astronauts/space-medicine/radiation.asp |
| Agence spatiale canadienne — expérience **Radi-N2** | La part des neutrons (environ 30 % de la dose reçue à bord de la Station spatiale) et la contre-mesure : cartographier les zones les plus protégées du véhicule pour y replier l'équipage lors d'une éruption solaire majeure | https://asc-csa.gc.ca/eng/sciences/radi-n2.asp |

**Autres ressources techniques utilisées :**

| Ressource | Usage |
|---|---|
| React 19, TypeScript, Vite | Interfaces des deux postes |
| Python 3 (bibliothèque standard seule) | Module central à bord, sans aucune dépendance externe |
| PostgreSQL (service hébergé) | Base du sol : comptes, consignes, mesures reçues |
| Documentation des capteurs (MAX30102, MAX30205, MH-Z19, MPU6050, DEXA, Jamar, Omron) | Références réelles des quinze capteurs décrits |

---

## Récapitulatif avant de soumettre

| Point du formulaire | État |
|---|---|
| Nom du projet | Fait |
| Résumé général (50 à 200 mots) | Fait — 158 mots |
| Lien du projet | Fait — `https://www.globalastro.health` |
| Lien de la démonstration (diaporama ou vidéo) | **À héberger et coller** |
| Détails du projet | Fait |
| Utilisation de l'IA | Fait — reste à compléter par les autres membres |
| Données de la NASA | Fait — neuf ressources, dont cinq risques du Human Research Roadmap |
| Données des agences partenaires | Fait — deux ressources de l'Agence spatiale canadienne |
| Vérification en navigation privée | **À faire** le jour de la soumission |
