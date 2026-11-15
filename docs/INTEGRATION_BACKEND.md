# Intégration du frontend GlobalAstro Health avec le backend AstroPulse

Note de travail — ce qui a été testé, ce qui marche, et les deux choses à changer.

---

## 1. Testé pour de vrai (le 15/11)

Les deux services ont été lancés (`ground.main` sur 9000, `gateway.main` sur 8000 avec
`LINK_DELAY=2 SYNC_INTERVAL=3`), puis alimentés par le simulateur :
`history --days 14 --drift 3` (30 225 mesures) puis `live --mode spike --count 5`.

Résultats obtenus, sans modification du code :

| Point de la chaîne | Résultat |
|---|---|
| Ingestion ESP32 (`POST /data`) | 200, validation + stockage |
| Détection de dérive lente | `Heart rate has drifted +15.6% over the last 24 h: recent average 83.5 vs your baseline 72.2 bpm` |
| Détection de pic (z-score) | `Heart rate 135.0 bpm is unusual for you: your normal is 72.2 ± 2.6 (z = +24.1)` |
| Synchro passerelle → sol | 12 093 résumés reçus |
| Vue médecin | `astro_1 · status critical · 5 alertes sur 24 h` |
| Consigne médecin | `POST /api/messages` → `sent` → récupérée par la passerelle → `delivered` |
| Acquittement d'alerte à bord | `POST /api/alerts/{id}/ack` → `{"ok": true}` |
| **Coupure du lien** | file à bord 15 → 24 mesures, compteur du sol figé, puis les alertes en file repartent à 0 |

La coupure du lien fonctionne réellement : c'est la démonstration la plus forte du
projet, et elle est vérifiée.

---

## 2. Ce qui bloque le frontend (le point à corriger en premier)

### CORS — obligatoire

Testé avec `Origin: https://www.globalastro.health` :

| Test | Résultat |
|---|---|
| En-tête `Access-Control-Allow-Origin` | **absent** |
| Préflight `OPTIONS` | **405** |

Le navigateur refuse donc tout appel depuis notre site. Correctif : `CORSMiddleware`.

**À ajouter dans `gateway/main.py` et `ground/main.py`**, juste après la création de
`app` :

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",              # vite dev
        "https://www.globalastro.health",     # site en ligne
        "https://globalastro-health.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],                      # X-PIN, X-API-Key
)
```

Pour la démonstration, `allow_origins=["*"]` suffit ; la liste ci-dessus est plus
propre.

### Contenu mixte — à connaître pour le jour J

Le site est en **https**, un backend local tourne en **http** : le navigateur bloque
l'appel. Deux solutions, au choix :

1. **Tout en local** : le frontend servi en `http://localhost:5173`, le backend en
   `http://localhost:8000` / `:9000`. Simple, suffisant pour la démo.
2. **Par un relais** : le frontend appelle une fonction serverless en https, qui
   elle-même appelle le backend. Plus de travail, mais ça marche depuis le site en
   ligne.

---

## 3. Ce que le frontend consomme

| Écran | Route | En-tête |
|---|---|---|
| Astronaute · Hors ligne | `GET /api/link-status` | `X-PIN` |
| Astronaute · Alerte | `GET /api/alerts` · `POST /api/alerts/{id}/ack` | `X-PIN` |
| Astronaute · mesures | `GET /api/latest` · `GET /api/history?sensor=&hours=` | `X-PIN` |
| Astronaute · consignes reçues | `GET /api/messages` · `POST /api/messages/{id}/ack` | `X-PIN` |
| Médecin · Équipage | `GET /api/astronauts` · `GET /api/astronauts/{id}` | `X-PIN` |
| Médecin · Consignes envoyées | `POST /api/messages` · `GET /api/messages?astronaut=` | `X-PIN` |
| Médecin · état du lien | `GET /api/link` | `X-PIN` |

Le frontend bascule automatiquement en **mode démonstration** si une route ne répond
pas : la démo ne peut pas casser à cause d'un service éteint.

---

## 4. Deux limites à connaître

**Couverture des capteurs.** Le backend expose `heart_rate`, `temperature`, `spo2`.
L'interface affiche sept indicateurs issus de la liste des dangers de la NASA :
sommeil, variabilité cardiaque, tension artérielle, densité osseuse, débit cardiaque,
rayonnement, exercice. **Seuls le cœur et la saturation ont une donnée derrière.**
Ajouter des capteurs est facile de votre côté (le dictionnaire `SENSORS` de
`shared/schemas.py` porte libellé, unité, bornes physiques, seuils critiques) mais
entraîne le firmware et le réglage des seuils d'anomalie.

**Authentification.** `X-PIN` appelé depuis une page web expose le PIN dans le
bundle JavaScript. Pour un prototype de hackathon, c'est acceptable à condition de
le dire ; la solution propre est le relais de la section 2.

---

## 5. Question de nom

Le backend s'appelle **AstroPulse**, le produit s'appelle **GlobalAstro Health**
(domaine `globalastro.health`, dépôt `globalastro-health`, logo). Il faut un seul nom
pour la soumission. Proposition : **GlobalAstro Health** est le produit présenté au
jury, *AstroPulse* reste le nom du composant backend dans la documentation technique.
À valider.
