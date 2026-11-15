#!/usr/bin/env python3
"""Module central HELIX : reçoit les mesures, calcule leur statut et les enregistre dans mesures.csv.

Routes :
  POST /mesures      reçoit une mesure ou une liste de mesures (JSON)
  GET  /derniere     dernière valeur de chaque paramètre, avec son statut (pour l'interface HELIX)
  GET  /historique   série d'un paramètre, pour les courbes de l'interface
  GET  /parametres   paramètres présents dans la base
  POST /astronautes  inscrit un astronaute ou un médecin (registre des comptes)
  GET  /astronautes  liste les comptes inscrits, sans leur mot de passe
  POST /connexion    vérifie un identifiant et un mot de passe
  POST /consignes    enregistre une consigne écrite au sol
  GET  /consignes    liste les consignes, filtrables par destinataire
  POST /consignes/<id>/etat  met à jour l'état d'une consigne (transmise, lue)
  GET  /sante        vérification que le module tourne
"""
import hashlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from datetime import datetime, timezone
from pathlib import Path
import csv
import json
import threading
from urllib.parse import parse_qs, urlparse

CSV_FILE = Path(__file__).with_name("mesures.csv")
CSV_COMPTES = Path(__file__).with_name("astronautes.csv")
CSV_CONSIGNES = Path(__file__).with_name("consignes.csv")
HOST = "0.0.0.0"
PORT = 8000

FIELDS = ["date_utc", "capteur", "parametre", "valeur", "unite", "mode", "statut"]
CHAMPS_COMPTES = ["identifiant", "role", "profil", "empreinte", "cree_le"]
CHAMPS_CONSIGNES = ["id", "destinataire", "texte", "mise_en_file", "etat", "cree_le", "lue_le"]

# Sel de démonstration : il n'a pas vocation à protéger quoi que ce soit de réel.
SEL = "helix-demo-2026"

# parametre -> (plage nominale, plage non critique)
#   dans la plage nominale        -> nominal
#   hors nominale, dans la 2e     -> attention
#   hors des deux                 -> critique
# Seuils indicatifs de démonstration, à ajuster librement.
SEUILS = {
    "frequence_cardiaque":    ((50, 100), (40, 130)),
    "SpO2":                   ((95, 100), (90, 100)),
    "temperature_corporelle": ((36.0, 37.5), (35.0, 38.0)),
    "frequence_respiratoire": ((12, 20), (8, 25)),
    "co2":                    ((0, 1000), (0, 1500)),
    "dose_radiation":         ((0, 0.8), (0, 1.2)),
    "pression_systolique":    ((90, 130), (80, 160)),
    "pression_diastolique":   ((60, 85), (50, 100)),
    "debit_cardiaque":        ((4, 8), (3, 10)),
    "t_score":                ((-1.0, 99), (-2.5, 99)),
    "force_main_droite":      ((27, 999), (16, 999)),
    "force_main_gauche":      ((27, 999), (16, 999)),
    "calcium":                ((2.20, 2.60), (2.00, 2.80)),
    "vitamine_D":             ((30, 60), (20, 100)),
    "CRP":                    ((0, 5), (0, 10)),
}

LOCK = threading.Lock()
DERNIERES = {}


def statut(parametre, valeur):
    if parametre not in SEUILS:
        return "info"
    try:
        v = float(valeur)
    except (TypeError, ValueError):
        return "info"
    (nmin, nmax), (cmin, cmax) = SEUILS[parametre]
    if nmin <= v <= nmax:
        return "nominal"
    if cmin <= v <= cmax:
        return "attention"
    return "critique"


def prepare_csv():
    """Si un ancien mesures.csv a un autre format, on le met de côté au lieu de le mélanger."""
    if CSV_FILE.exists():
        with CSV_FILE.open(encoding="utf-8") as f:
            entete = f.readline().strip().split(",")
        if entete != FIELDS:
            ancien = CSV_FILE.with_name("mesures_ancien.csv")
            CSV_FILE.replace(ancien)
            print(f"[INFO] Ancien format détecté : {CSV_FILE.name} renommé en {ancien.name}")


def save_measurements(payload):
    rows = payload if isinstance(payload, list) else [payload]
    with LOCK:
        new_file = not CSV_FILE.exists()
        with CSV_FILE.open("a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=FIELDS)
            if new_file:
                writer.writeheader()
            for item in rows:
                ligne = {
                    "date_utc": item.get("date_utc") or datetime.now(timezone.utc).isoformat(),
                    "capteur": item.get("capteur", "inconnu"),
                    "parametre": item.get("parametre", "inconnu"),
                    "valeur": item.get("valeur", ""),
                    "unite": item.get("unite", ""),
                    "mode": item.get("mode", ""),
                }
                ligne["statut"] = statut(ligne["parametre"], ligne["valeur"])
                writer.writerow(ligne)
                DERNIERES[ligne["parametre"]] = ligne
    return len(rows)


def empreinte(identifiant, mot_de_passe):
    """Empreinte du mot de passe : on ne stocke jamais le mot de passe en clair."""
    return hashlib.sha256(f"{SEL}:{identifiant}:{mot_de_passe}".encode("utf-8")).hexdigest()


def lire_comptes():
    if not CSV_COMPTES.exists():
        return []
    with CSV_COMPTES.open(encoding="utf-8") as f:
        return list(csv.DictReader(f))


def compte_public(ligne):
    """Ce qu'on accepte de renvoyer : jamais l'empreinte du mot de passe."""
    try:
        profil = json.loads(ligne.get("profil") or "{}")
    except json.JSONDecodeError:
        profil = {}
    return {
        "identifiant": ligne.get("identifiant", ""),
        "role": ligne.get("role", ""),
        "profil": profil,
        "cree_le": ligne.get("cree_le", ""),
    }


def inscrire_compte(donnees):
    identifiant = str(donnees.get("identifiant", "")).strip()
    role = str(donnees.get("role", "")).strip()
    mot_de_passe = str(donnees.get("motDePasse", ""))

    if len(identifiant) < 3:
        return 400, {"ok": False, "erreur": "Identifiant trop court : au moins 3 caractères."}
    if role not in ("astro", "sol"):
        return 400, {"ok": False, "erreur": "Rôle inconnu : attendu astro ou sol."}
    if len(mot_de_passe) < 4:
        return 400, {"ok": False, "erreur": "Mot de passe trop court : au moins 4 caractères."}

    with LOCK:
        connus = {ligne.get("identifiant", "").lower() for ligne in lire_comptes()}
        if identifiant.lower() in connus:
            return 409, {"ok": False, "erreur": "Cet identifiant est déjà inscrit dans la base."}

        nouveau = not CSV_COMPTES.exists()
        ligne = {
            "identifiant": identifiant,
            "role": role,
            "profil": json.dumps(donnees.get("profil") or {}, ensure_ascii=False),
            "empreinte": empreinte(identifiant, mot_de_passe),
            "cree_le": datetime.now(timezone.utc).isoformat(),
        }
        with CSV_COMPTES.open("a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=CHAMPS_COMPTES)
            if nouveau:
                writer.writeheader()
            writer.writerow(ligne)

    print(f"[INSCRIPTION] {identifiant} ({role}) enregistré dans {CSV_COMPTES.name}")
    return 201, {"ok": True, "compte": compte_public(ligne)}


def verifier_connexion(donnees):
    identifiant = str(donnees.get("identifiant", "")).strip().lower()
    mot_de_passe = str(donnees.get("motDePasse", ""))
    for ligne in lire_comptes():
        if ligne.get("identifiant", "").lower() == identifiant:
            if ligne.get("empreinte") == empreinte(ligne.get("identifiant", ""), mot_de_passe):
                print(f"[CONNEXION] {ligne.get('identifiant')} ({ligne.get('role')}) authentifié")
                return 200, {"ok": True, "compte": compte_public(ligne)}
            print(f"[CONNEXION] {identifiant} refusé : mot de passe incorrect")
            return 401, {"ok": False, "erreur": "Mot de passe incorrect."}
    return 404, {"ok": False, "erreur": "Aucun compte sous cet identifiant."}


def lire_consignes(destinataire=None):
    if not CSV_CONSIGNES.exists():
        return []
    with CSV_CONSIGNES.open(encoding="utf-8") as f:
        lignes = list(csv.DictReader(f))
    if destinataire:
        lignes = [l for l in lignes if l.get("destinataire", "").lower() == destinataire.lower()]
    return sorted(lignes, key=lambda l: l.get("cree_le", ""), reverse=True)


def enregistrer_consigne(donnees):
    destinataire = str(donnees.get("destinataire", "")).strip()
    texte = str(donnees.get("texte", "")).strip()
    if not destinataire:
        return 400, {"ok": False, "erreur": "Destinataire manquant."}
    if len(texte) < 5:
        return 400, {"ok": False, "erreur": "Consigne trop courte."}

    with LOCK:
        existantes = lire_consignes()
        suivant = max([int(l.get("id", "0") or 0) for l in existantes] or [0]) + 1
        ligne = {
            "id": str(suivant),
            "destinataire": destinataire,
            "texte": texte,
            "mise_en_file": str(donnees.get("mise_en_file", "")),
            "etat": "attente",
            "cree_le": datetime.now(timezone.utc).isoformat(),
            "lue_le": "",
        }
        nouveau = not CSV_CONSIGNES.exists()
        with CSV_CONSIGNES.open("a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=CHAMPS_CONSIGNES)
            if nouveau:
                writer.writeheader()
            writer.writerow(ligne)

    print(f"[CONSIGNE] pour {destinataire} : {texte[:60]}")
    return 201, {"ok": True, "consigne": ligne}


def changer_etat_consigne(identifiant, donnees):
    etat = str(donnees.get("etat", ""))
    if etat not in ("attente", "transmise", "lue"):
        return 400, {"ok": False, "erreur": "État inconnu."}

    with LOCK:
        lignes = lire_consignes()
        touchee = None
        for ligne in lignes:
            if ligne.get("id") == str(identifiant):
                ligne["etat"] = etat
                if etat == "lue" and not ligne.get("lue_le"):
                    ligne["lue_le"] = datetime.now(timezone.utc).isoformat()
                touchee = ligne
                break
        if touchee is None:
            return 404, {"ok": False, "erreur": "Consigne inconnue."}
        with CSV_CONSIGNES.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=CHAMPS_CONSIGNES)
            writer.writeheader()
            writer.writerows(sorted(lignes, key=lambda l: int(l.get("id", "0") or 0)))

    print(f"[CONSIGNE] {identifiant} -> {etat}")
    return 200, {"ok": True, "consigne": touchee}


def lire_historique(parametre=None, limite=200):
    """Dernières valeurs enregistrées, éventuellement filtrées sur un paramètre."""
    if not CSV_FILE.exists():
        return []
    with CSV_FILE.open(encoding="utf-8") as f:
        lignes = list(csv.DictReader(f))
    if parametre:
        lignes = [l for l in lignes if l.get("parametre") == parametre]
    return lignes[-limite:]


def parametres_enregistres():
    """Liste des paramètres présents dans la base, avec leur dernière valeur."""
    if not CSV_FILE.exists():
        return []
    with CSV_FILE.open(encoding="utf-8") as f:
        lignes = list(csv.DictReader(f))
    derniers = {}
    for ligne in lignes:
        derniers[ligne.get("parametre", "inconnu")] = ligne
    return sorted(derniers)


class Handler(BaseHTTPRequestHandler):
    def _json(self, code, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path == "/derniere":
            with LOCK:
                self._json(200, dict(DERNIERES))
        elif self.path.startswith("/historique"):
            requete = parse_qs(urlparse(self.path).query)
            parametre = (requete.get("parametre") or [None])[0]
            try:
                limite = int((requete.get("n") or ["200"])[0])
            except ValueError:
                limite = 200
            points = lire_historique(parametre, max(1, min(limite, 5000)))
            self._json(200, {"parametre": parametre, "nombre": len(points), "points": points})
        elif self.path == "/parametres":
            self._json(200, parametres_enregistres())
        elif self.path == "/astronautes":
            self._json(200, [compte_public(ligne) for ligne in lire_comptes()])
        elif self.path.startswith("/consignes"):
            requete = parse_qs(urlparse(self.path).query)
            destinataire = (requete.get("destinataire") or [None])[0]
            self._json(200, lire_consignes(destinataire))
        elif self.path == "/sante":
            self._json(200, {"ok": True})
        else:
            self.send_error(404, "Route inconnue")

    def do_POST(self):
        if self.path == "/consignes":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                donnees = json.loads(self.rfile.read(length).decode("utf-8"))
            except Exception as exc:  # noqa: BLE001
                self.send_error(400, f"Données invalides : {exc}")
                return
            code, reponse = enregistrer_consigne(donnees)
            self._json(code, reponse)
            return

        if self.path.startswith("/consignes/") and self.path.endswith("/etat"):
            identifiant = self.path[len("/consignes/") : -len("/etat")].strip("/")
            try:
                length = int(self.headers.get("Content-Length", "0"))
                donnees = json.loads(self.rfile.read(length).decode("utf-8"))
            except Exception as exc:  # noqa: BLE001
                self.send_error(400, f"Données invalides : {exc}")
                return
            code, reponse = changer_etat_consigne(identifiant, donnees)
            self._json(code, reponse)
            return

        if self.path in ("/astronautes", "/connexion"):
            try:
                length = int(self.headers.get("Content-Length", "0"))
                donnees = json.loads(self.rfile.read(length).decode("utf-8"))
            except Exception as exc:  # noqa: BLE001
                self.send_error(400, f"Données invalides : {exc}")
                return
            if self.path == "/astronautes":
                code, reponse = inscrire_compte(donnees)
            else:
                code, reponse = verifier_connexion(donnees)
            self._json(code, reponse)
            return

        if self.path != "/mesures":
            self.send_error(404, "Route inconnue")
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            count = save_measurements(payload)
            alertes = [p for p, l in DERNIERES.items() if l["statut"] == "critique"]
            print(f"[REÇU] {count} mesure(s) enregistrée(s) dans {CSV_FILE.name}"
                  + (f" | CRITIQUE : {', '.join(alertes)}" if alertes else ""))
            self._json(200, {"ok": True, "enregistrements": count})
        except Exception as exc:
            self.send_error(400, f"Données invalides : {exc}")

    def log_message(self, fmt, *args):
        pass  # on garde la console lisible : seuls les [REÇU] s'affichent


if __name__ == "__main__":
    prepare_csv()
    print("HELIX — MODULE CENTRAL DE RÉCEPTION")
    print(f"En attente des capteurs sur http://localhost:{PORT}/mesures")
    print(f"Dernières valeurs pour l'interface : http://localhost:{PORT}/derniere")
    print(f"Fichier de sortie : {CSV_FILE}")
    print("Arrêter avec Ctrl+C.\n")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
