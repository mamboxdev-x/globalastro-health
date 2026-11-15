# Scénario de démonstration

Déroulé pas à pas pour la présentation. **5 minutes**, deux rôles, un seul poste.

## Avant de commencer (2 minutes de préparation)

```bash
demo\lancer_demo.bat        # Windows
./demo/lancer_demo.sh       # Linux / macOS
```

Trois choses démarrent : le module central, les capteurs simulés, l'interface. Ouvrir
**http://localhost:5173**.

Si le jury est sur un autre appareil que le vôtre, le module doit être joignable sur le réseau
local (`VITE_HELIX_URL=http://<votre-ip>:8000`, voir `.env.example`).

**À vérifier avant d'entrer dans la salle :**

- [ ] La pastille en haut à droite affiche **« Système de bord connecté »** (elle dit « Démonstration » si le module ne répond pas).
- [ ] L'écran « Instructions » n'a **aucune consigne en attente** (sinon, les marquer comme lues).
- [ ] Le navigateur est en plein écran, zoom à 100 %.

## Le déroulé

### 1. La connexion — le rôle change tout (30 s)

L'écran de connexion s'ouvre déjà rempli : **`cdr.mbaye` / `demo1234`**. Cliquer **Se connecter**.

> « L'application sert deux métiers. À bord, l'astronaute est seul avec ses capteurs. Au sol, le
> médecin suit l'équipage — mais ne peut rien faire en direct : le signal met 12 minutes pour un
> aller-retour. L'interface change entièrement selon le rôle. »

### 2. Le tableau de bord — les capteurs tournent (1 min)

Rester sur **Tableau de bord**. Le panneau du bas affiche les mesures en direct.

- Montrer la **pastille `simulation`** (ou `capteurs du module`).
- **Changer le paramètre tracé** en bas du panneau (dose de radiation, par exemple).
- Laisser la courbe se déplacer 5 secondes.

> « 15 capteurs simulés remontent 25 paramètres : pouls, SpO₂, température, CO₂ de cabine,
> accéléromètres, densité osseuse, force de préhension, dose de radiation, sommeil, marqueurs
> sanguins. Ce sont de vraies références matérielles — MAX30102, MH-Z19, MPU6050, DEXA, Jamar,
> Omron. Chaque capteur simulé correspond à une pièce qu'on peut acheter. »

**Point clé à dire :** « Ce que vous voyez est calculé **à bord**, en local. Rien ne dépend du
réseau — c'est exactement le problème posé par l'énoncé. »

### 3. Les seuils produisent une action (45 s)

Aller sur **Os & Cœur** puis **Rayonnement**.

> « Un tableau de bord qui affiche des courbes ne répond pas au défi. La question de la NASA
> est : *quand un résultat justifie-t-il l'attention de l'équipage ?* Ici, chaque paramètre est
> comparé à une plage, et tout dépassement devient une **action corrective**. »

Sur **Rayonnement**, montrer la dose exprimée en **% de la limite de carrière**.

> « On n'affiche jamais de mSv absolus : la limite NASA est définie en *risque*, pas en dose.
> 41 % de la limite de carrière, dont environ 30 % de neutrons. »

### 4. Le cycle complet d'une consigne (1 min 30) — le moment fort

C'est la démonstration à ne pas rater : elle montre le délai et la boucle complète.

1. **Se déconnecter** (bouton en bas du rail de navigation).
2. Sur l'écran de connexion : identifiant **`dr.anderson`**, mot de passe **`demo1234`**, cocher **Médecin au sol**, puis **Se connecter**.
3. Sur **Équipage**, montrer les membres et leurs valeurs.
   > « Le médecin voit exactement ce que chaque membre voit à bord — c'est la même source. »
4. Choisir le destinataire **`cdr.mbaye`**, écrire une consigne (le champ est pré-rempli), cliquer **Mettre en file**.
   > « Elle part « à la prochaine fenêtre » : je ne peux pas agir maintenant, et l'interface ne prétend pas le contraire. »
5. **Se déconnecter**, se reconnecter en **astronaute** (`cdr.mbaye` / `demo1234`).
6. Ouvrir **Instructions** (dernière entrée du rail — une **pastille** indique le nombre à lire).
   > « Voilà la consigne, arrivée à la fenêtre de communication. »
7. Cliquer **J'ai lu**.
8. **Se déconnecter**, se reconnecter en **médecin** (`dr.anderson`), ouvrir **Consignes envoyées**.
   > « Et l'accusé de réception est remonté : **lue par l'équipage**. La boucle est fermée. »

### 5. Ce qui n'est pas branché (30 s) — la transparence paie

> « Par honnêteté : aucune donnée médicale réelle n'est affichée. Les valeurs sont fabriquées,
> et l'écran le dit toujours — *capteurs du module* ou *simulation*. La transmission
> Terre–espace n'est pas chiffrée, et la base du sol est ouverte à la clé publique : c'est un
> prototype, pas un dispositif médical. »

## Les questions qu'on va vous poser

| Question | Réponse |
|---|---|
| **« D'où viennent les données ? »** | « De 15 capteurs simulés, à bord, qui écrivent dans une base locale. Chaque capteur correspond à une référence réelle du marché. » |
| **« Comment gérez-vous la perte de liaison ? »** | « Le bord ne dépend jamais du réseau. Les mesures restent dans le tampon local et repartent à la fenêtre suivante — c'est l'écran *Hors ligne*. » |
| **« Où est la base de données ? »** | « En deux endroits. À bord : le module central, en local. Au sol : PostgreSQL hébergé (Supabase), qui garde les comptes, les consignes et les mesures reçues. » |
| **« Et si le médecin se trompe ? »** | « Il ne peut pas agir en direct. Chaque consigne porte son état : en file, livrée au bord, lue. Le délai est affiché partout. » |
| **« Pourquoi avoir séparé les deux rôles ? »** | « Parce que c'est le sujet : à bord, l'équipage doit décider seul. Au sol, on prépare. Confondre les deux aurait été malhonnête. » |
| **« Comment protégez-vous les mots de passe ? »** | « Empreinte SHA-256 calculée dans le navigateur, jamais le mot de passe en clair — ni dans la base du bord, ni dans celle du sol. Avec un sel fixe de démonstration, qu'on remplacerait en production. » |

## Si quelque chose ne marche pas

| Symptôme | Cause probable | Geste |
|---|---|---|
| La pastille dit **« Démonstration · backend non connecté »** | le module central ne tourne pas | relancer `demo\lancer_demo.bat` |
| Le panneau affiche **`simulation`** au lieu de `capteurs du module` | même cause | idem — la démonstration reste valable, les valeurs sont simplement fabriquées dans le navigateur |
| Le graphique ne bouge pas | la page est en veille | cliquer une fois dans la page, attendre 10 secondes |
| **« Aucun compte sous cet identifiant »** | faute de frappe | les comptes sont `cdr.mbaye` et `dr.anderson`, mot de passe `demo1234` |
| Rien ne s'affiche sur un second appareil | le module n'est pas joignable depuis cet appareil | démontrer sur un seul poste, ou renseigner `VITE_HELIX_URL` |

## Pour finir sur le site en ligne

**https://www.globalastro.health** — même application, sans module central ni base du sol : la
simulation partagée alimente alors les deux interfaces, et l'écran l'annonce clairement.
Utile si le jury veut ouvrir le lien sur son propre téléphone.
