# Module central — simulation des capteurs

Le poste de bord : il reçoit les mesures des capteurs simulés, calcule leur statut, et garde
tout dans des fichiers **locaux**. C'est volontaire : à bord, il n'y a pas de réseau.

## Ce qu'il contient

| Fichier | Rôle |
|---|---|
| `receiver.py` | Le module central. Reçoit les mesures, applique les seuils, tient les fichiers. Écoute sur le port **8000**. |
| `capteurs.py` | Les 15 capteurs simulés. Envoient leurs mesures en JSON, en boucle. |
| `mesures.csv` | La base des mesures — créée au premier envoi. |
| `astronautes.csv` | Le registre des comptes (empreinte SHA-256, jamais le mot de passe). |
| `consignes.csv` | Les instructions du sol, avec leur état. |

## Lancer

```bash
python receiver.py          # à laisser tourner
python capteurs.py 2        # 2 = une mesure toutes les 2 secondes
```

## Les routes

| Route | Rôle |
|---|---|
| `POST /mesures` | reçoit une mesure ou une liste |
| `GET /derniere` | dernière valeur de chaque paramètre, avec son statut |
| `GET /historique?parametre=&n=` | série d'un paramètre, pour les courbes |
| `GET /parametres` | paramètres présents dans la base |
| `POST /astronautes` · `GET /astronautes` | inscription et liste des comptes |
| `POST /connexion` | vérifie un identifiant et un mot de passe |
| `POST /consignes` · `GET /consignes` | consignes écrites au sol |
| `POST /consignes/<id>/etat` | accusé de réception (transmise, lue) |
| `GET /sante` | le module répond |

## Les capteurs simulés

Chaque paramètre vient d'une référence matérielle réelle — c'est ce qui rend l'architecture
crédible : ces capteurs s'achètent.

| Capteur | Paramètres |
|---|---|
| `MAX30102` | fréquence cardiaque, SpO₂ |
| `MAX30205` | température corporelle |
| `MH-Z19` | CO₂ de cabine |
| `MPU6050` | accélérations X / Y / Z |
| `DEXA` | densité minérale osseuse, score T, perte osseuse |
| `InBody` | masse maigre, masse grasse, impédance |
| `Balance` | poids |
| `Jamar` | force de préhension, main droite et gauche |
| `Omron` | pression systolique et diastolique |
| `GSR` | activité électrodermale |
| `Dosimètre` | dose de radiation |
| `Bracelet` | durée, efficacité, sommeil profond, sommeil paradoxal |
| `Ceinture` | fréquence respiratoire |
| `Laboratoire` | CRP, calcium, vitamine D |
| `Calcul` | débit cardiaque |

Soit **25 paramètres**, sur les mêmes seuils que ceux appliqués côté interface : une pastille
veut dire la même chose des deux côtés.

## Les seuils

```python
SEUILS = {
  "frequence_cardiaque": ((50, 100), (40, 130)),   # nominal, puis non critique
  ...
}
```

Dans la plage nominale → `nominal`. Hors de la plage nominale mais dans la seconde →
`attention`. Hors des deux → `critique`. Les paramètres sans seuil (accélérations, impédance)
sortent en `info`.
