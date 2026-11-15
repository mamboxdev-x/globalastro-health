# Sources NASA et ASC — GlobalAstro Health

Fiche de traçabilité des ressources officielles du défi utilisées dans le projet.
Elle sert deux fois : dans la soumission écrite, et au micro devant le jury.

---

## 1. Les cinq dangers des vols spatiaux habités

Cadre officiel du programme de recherche humaine de la NASA. Notre interface couvre
les cinq : c'est la colonne vertébrale du produit, pas une décoration.

| Danger (NASA) | Écran de GlobalAstro Health | Risque correspondant au Human Research Roadmap |
|---|---|---|
| Rayonnement spatial | **Rayonnement** (RAD-04) | Exposition aux rayonnements — norme **NASA-STD-3001 §4.2.10** |
| Gravité altérée | **Os & Cœur** (PHY-02) | **Risque 77** — *Risk of Bone Fracture due to Spaceflight-induced Changes to Bone* · **Risque 179** — *Risk of Cardiovascular Adaptations Contributing to Adverse Mission Performance and Health Outcomes* |
| Isolement et confinement | **Santé mentale** (PSY-03) | **Risque 99** — *Risk of Adverse Cognitive or Behavioral Changes and Psychiatric Disorders* |
| Distance de la Terre | **Hors ligne** (COM-06) | **Risque 175** — *Risk of Adverse Mission Outcomes Due to Earth Independent Human-Systems Operations* |
| Environnement fermé et hostile | **Hors ligne** et **Tableau de bord** (partiel) | Habitabilité : température, pression, éclairage, bruit, microbes |

Page de référence : <https://www.nasa.gov/hrp/hazards/>
Liste des risques : <https://www.nasa.gov/hrp/risks/> — base détaillée : <https://humanresearchroadmap.nasa.gov/risks/>

---

## 2. Sources utilisées dans l'écran « Rayonnement »

| Repère affiché | Source |
|---|---|
| Trois composantes du rayonnement spatial : rayons cosmiques galactiques, particules solaires, rayonnement piégé | Agence spatiale canadienne — *How does radiation affect the human body in space?* <https://asc-csa.gc.ca/eng/astronauts/space-medicine/radiation.asp> |
| Effets à long terme : cataractes, cancers, atteinte de la descendance | même source |
| **Neutrons ≈ 30 % de la dose reçue à bord de la Station spatiale** | ASC — *Radi-N2: Tracking space radiation and its risks* <https://asc-csa.gc.ca/eng/sciences/radi-n2.asp> |
| Contre-mesure d'abri : cartographier les zones les plus protégées pour s'y replier en cas d'éruption solaire majeure | même source (objectif affiché de Radi-N2) |
| En orbite basse, l'atmosphère et le champ magnétique terrestre protègent encore en partie | ASC — page rayonnement |
| Contre-mesure cardiovasculaire : combinaison LBNP (Chibis) | NASA — *Risk of Cardiovascular Adaptations* <https://www.nasa.gov/directorates/esdmd/hhp/cv-risk/> |
| Avec le programme d'exercice suivi, les pertes musculaires au retour sont minimales | NASA — *Risk of Reduced Physical Performance Capabilities Due to Reduced Muscle Size, Strength, and Endurance* <https://www.nasa.gov/directorates/esdmd/hhp/muscle-risk/> |

---

## 3. Ce que nous n'affirmons pas

- **La limite de dose n'est pas un nombre de millisieverts.** La norme NASA-STD-3001
  §4.2.10 l'exprime en **risque** (de l'ordre de 3 % de risque de décès induit par
  l'exposition), et elle dépend de l'âge, du sexe et de la durée de mission. L'écran
  affiche donc un **pourcentage de la limite de carrière**, jamais une dose limite
  absolue sortie de nulle part.
- **Les valeurs chiffrées sont des données de démonstration** (dose intégrée, débit
  quotidien, répartition par origine). Elles illustrent le raisonnement ; elles ne
  proviennent d'aucune mesure réelle, et l'interface le dit.
- **Les trois séances d'exercice de l'écran « Os & Cœur » ne sont pas inventées** :
  ARED, tapis roulant T2 et vélo CEVIS sont les contre-mesures d'exercice réellement
  utilisées à bord de la Station spatiale internationale.
- **La chaîne de mesure présentée** (capteur → ESP32 → passerelle → stockage local →
  envoi à la fenêtre de communication) est une maquette. Aucun capteur n'est connecté.

---

## 4. Formulation prête pour la soumission

> GlobalAstro Health s'appuie sur la taxonomie officielle du programme de recherche
> humaine de la NASA : les cinq dangers des vols spatiaux habités structurent
> l'interface, et chaque écran renvoie au risque correspondant du Human Research
> Roadmap (77 pour l'os, 179 pour le cardiovasculaire, 99 pour le comportemental,
> 175 pour l'autonomie vis-à-vis de la Terre). L'écran « Rayonnement » reprend la
> classification de l'Agence spatiale canadienne et la contre-mesure documentée par
> l'expérience Radi-N2 : cartographier les zones les plus protégées du véhicule pour
> y replier l'équipage lors d'une éruption solaire.

---

## 5. Avertissement

Ces ressources appartiennent à la NASA et à l'Agence spatiale canadienne. La NASA
n'approuve aucune entité non gouvernementale américaine et décline toute
responsabilité quant aux informations figurant sur les sites non gouvernementaux :
nous citons nos sources, nous ne les republions pas, et nous ne nous présentons
jamais comme approuvés par la NASA.
