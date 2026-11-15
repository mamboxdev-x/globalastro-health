# Fiche projet — GlobalAstro Health

**One-liner** — *Un outil d'aide à la décision qui rend l'équipage capable de repérer seul les
changements de santé en mission longue, et qui prépare la décision du médecin au sol sans jamais
prétendre agir en direct.*

| | |
|---|---|
| **Équipe** | K2/\Labs |
| **Défi** | Create Health Monitoring Software for Astronauts on Space Missions |
| **Édition** | NASA Space Apps Challenge 2026 |
| **Application** | https://www.globalastro.health |
| **Dépôt** | github.com/mamboxdev-x/globalastro-health |

## Le problème

Cinq dangers documentés par le *Human Research Program* de la NASA : radiation spatiale,
isolement et confinement, distance de la Terre, gravité altérée, environnement fermé hostile.
Ils produisent des changements immunitaires, une perte de densité osseuse, des événements
cardiovasculaires et des troubles du comportement.

**Le point que tout le monde oublie :** il n'y a pas de médecin à bord, et le signal met des
dizaines de minutes à atteindre la Terre. L'énoncé le dit : *« les astronautes portent eux-mêmes
une grande partie de la responsabilité de repérer ces changements »*. Un tableau de bord qui
affiche des courbes ne répond donc pas à la question posée — *quand un résultat justifie-t-il
l'attention de l'équipage ou des chirurgiens de vol ?*

## Ce qu'on a construit

**Deux interfaces, deux métiers.** L'application en sert deux, et l'écran change entièrement
selon qui se connecte : l'astronaute à bord (7 écrans) et le médecin au sol (4 écrans).

- **À bord** : tableau de bord des indicateurs, os et cœur, santé mentale, **rayonnement en % de
  la limite de carrière** (jamais en mSv absolus — la limite NASA est définie en risque), alertes
  avec actions correctives, mode hors ligne, et réception des consignes du sol.
- **Au sol** : état de l'équipage avec les valeurs reçues à l'instant, alertes **dérivées des
  mesures hors plage**, journal des mesures, et le cycle complet d'une consigne :
  *à la prochaine fenêtre → livrée au bord → lue par l'équipage*.

**Le délai de 12 minutes n'est pas décoratif** : il structure l'interface du sol, qui ne propose
jamais d'agir en direct — seulement de préparer.

## L'architecture

| | |
|---|---|
| **À bord** | 15 capteurs simulés (MAX30102, MAX30205, MH-Z19, MPU6050, DEXA, Jamar, Omron, GSR, dosimètre…) → **module central Python** → seuils, statuts, base locale. **Aucune dépendance au réseau.** |
| **Au sol** | **Supabase (PostgreSQL)** : comptes, consignes, mesures reçues. Le site est statique : l'API REST de Supabase tient lieu de serveur. |
| **Liaison** | Fenêtre de communication. Les mesures restent à bord et repartent à la fenêtre suivante ; le médecin prépare, l'équipage accuse réception. |

## Ce qui est réel, ce qui est simulé

**Fonctionne** : les deux interfaces, l'inscription et la connexion, le cycle des consignes avec
accusé de réception, le calcul des seuils et des alertes, les 15 capteurs simulés et leurs 25
paramètres, la base du sol.

**Simulé** : les valeurs elles-mêmes. Aucune donnée médicale réelle n'est publique, et l'écran
**dit toujours** d'où vient le chiffre affiché — `capteurs du module` ou `simulation`.

**Non implémenté** : la transmission spatiale réelle, le chiffrement des paquets, et un vrai
modèle de sécurité pour la base du sol.

## Pile technique

React 19 · TypeScript · Vite · Python 3 (module central, `http.server`, aucune dépendance) ·
PostgreSQL (Supabase) · polices embarquées · aucune dépendance de graphiques — les courbes sont
dessinées à la main en SVG.

## Sources NASA

Les 5 dangers et les risques du HRP (os **77**, cardiovasculaire **179**, comportemental **99**,
autonomie **175**), NASA-STD-3001 §4.2.10 pour la limite de dose de carrière, ainsi que les
sources ouvertes visées (OSDR/GeneLab, DONKI, Curiosity RAD, NTRS). Détail et liens exacts :
`docs/SOURCES_NASA.md`.

## Pour la démonstration

`demo/lancer_demo.bat` (Windows) ou `./demo/lancer_demo.sh` : un seul geste démarre le module
central, les capteurs et l'interface. Comptes : `cdr.mbaye` (astronaute) et `dr.anderson`
(médecin), mot de passe `orbite2026`. Déroulé minuté : `docs/SCENARIO_DEMO.md`.
