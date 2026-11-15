#!/usr/bin/env python3
"""Capteurs virtuels HELIX : simulation de mesures envoyées au module central (receiver.py).

Deux familles de données :
  - VARIABLES : changent en continu (marche aléatoire bornée autour d'une valeur de repos).
  - FIXES     : propres à la personne ou issues d'un examen ponctuel (DEXA, prise de sang,
                nuit de sommeil). Valeurs identiques à chaque envoi ; elles sont renvoyées
                périodiquement pour que le tableau de bord reste à jour.

Valeurs fictives de démonstration, pas des mesures médicales.
Usage : python capteurs.py [intervalle_en_secondes]
"""
import json
import math
import random
import sys
import time
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from urllib.error import URLError

RECEIVER_URL = "http://127.0.0.1:8000/mesures"
INTERVAL_SECONDS = float(sys.argv[1]) if len(sys.argv) > 1 else 2.0
FIXED_EVERY = 30  # les données fixes sont renvoyées tous les 30 cycles

# =============================================================================
# DONNÉES FIXES (ne changent jamais pendant la simulation)
# =============================================================================
SEXE, TAILLE_M, POIDS_KG = "H", 1.82, 78
VES_ML = 70                     # volume d'éjection systolique
REACTANCE_OHM = 55              # réactance du corps (impédancemétrie)
BMD_REF, BMD_SD = 0.95, 0.12    # référence jeune adulte (DEXA)
BMD_HISTORIQUE = [0.82, 0.80, 0.785, 0.765]   # g/cm², examens 2023 à 2026
CALCIUM, VITAMINE_D, CRP = 2.38, 39, 1.0      # dernière prise de sang (2026-06-15)
PHASES_SOMMEIL = [
    ("22:45", "23:20", "éveil"), ("23:20", "01:10", "léger"),
    ("01:10", "02:05", "profond"), ("02:05", "03:40", "léger"),
    ("03:40", "04:25", "REM"), ("04:25", "05:50", "léger"),
    ("05:50", "06:40", "REM"), ("06:40", "07:05", "éveil"),
]


def duree_h(debut, fin):
    f = "%H:%M"
    return (datetime.strptime(fin, f) - datetime.strptime(debut, f)).seconds / 3600


def mesure(now, capteur, parametre, valeur, unite, mode):
    return {"date_utc": now, "capteur": capteur, "parametre": parametre,
            "valeur": valeur, "unite": unite, "mode": mode}


def mesures_fixes(now):
    bmd = BMD_HISTORIQUE[-1]
    t_score = (bmd - BMD_REF) / BMD_SD
    perte_pct = (bmd - BMD_HISTORIQUE[0]) / BMD_HISTORIQUE[0] * 100

    total = sum(duree_h(a, b) for a, b, _ in PHASES_SOMMEIL)
    par_phase = {p: sum(duree_h(a, b) for a, b, ph in PHASES_SOMMEIL if ph == p)
                 for p in ("éveil", "léger", "profond", "REM")}
    dormi = total - par_phase["éveil"]

    F = "fixe"
    return [
        mesure(now, "Balance", "poids", POIDS_KG, "kg", F),
        mesure(now, "DEXA", "densite_osseuse_bmd", bmd, "g/cm2", F),
        mesure(now, "DEXA", "t_score", round(t_score, 2), "", F),
        mesure(now, "DEXA", "perte_osseuse_totale", round(perte_pct, 2), "%", F),
        mesure(now, "Laboratoire", "calcium", CALCIUM, "mmol/L", F),
        mesure(now, "Laboratoire", "vitamine_D", VITAMINE_D, "ng/mL", F),
        mesure(now, "Laboratoire", "CRP", CRP, "mg/L", F),
        mesure(now, "Bracelet", "sommeil_duree", round(dormi, 2), "h", F),
        mesure(now, "Bracelet", "sommeil_efficacite", round(dormi / total * 100), "%", F),
        mesure(now, "Bracelet", "sommeil_profond", round(par_phase["profond"] / total * 100), "%", F),
        mesure(now, "Bracelet", "sommeil_REM", round(par_phase["REM"] / total * 100), "%", F),
    ]


# =============================================================================
# DONNÉES VARIABLES (évoluent à chaque cycle, de façon continue)
# =============================================================================
ETAT = {"fc": 72.0, "spo2": 97.5, "fr": 16.0, "co2": 650.0, "gsr": 4.0, "pic": 0}


def clamp(x, lo, hi):
    return max(lo, min(hi, x))


def mesures_variables(cycle, now):
    e = ETAT
    V = "variable"
    h = datetime.now().hour + datetime.now().minute / 60

    # Marches aléatoires bornées : la valeur dérive doucement et revient vers le repos
    e["fc"] = clamp(e["fc"] + random.gauss(0, 1.2) + 0.1 * (72 - e["fc"]), 55, 110)
    e["spo2"] = clamp(e["spo2"] + random.gauss(0, 0.2) + 0.2 * (97.5 - e["spo2"]), 94, 100)
    e["fr"] = clamp(e["fr"] + random.gauss(0, 0.4) + 0.1 * (16 - e["fr"]), 10, 24)
    e["co2"] = clamp(e["co2"] + random.gauss(0, 25) + 0.02 * (650 - e["co2"]), 420, 1600)
    e["gsr"] = clamp(e["gsr"] + random.gauss(0, 0.15) + 0.05 * (4 - e["gsr"]), 2.0, 6.0)

    # Température : rythme circadien + bruit
    temp = 36.8 + 0.35 * math.sin(2 * math.pi * (h - 10) / 24) + random.gauss(0, 0.03)

    # Radiation : 0,62 mSv/jour en continu, avec de rares pics de quelques cycles
    if e["pic"] == 0 and random.random() < 0.01:
        e["pic"] = 5
    dose = 0.62 + random.gauss(0, 0.03)
    if e["pic"] > 0:
        dose += random.uniform(0.3, 0.7)
        e["pic"] -= 1

    fc = round(e["fc"])
    sorties = [
        mesure(now, "MAX30102", "frequence_cardiaque", fc, "bpm", V),
        mesure(now, "MAX30102", "SpO2", round(e["spo2"]), "%", V),
        mesure(now, "MPU6050", "acceleration_x", round(random.uniform(-0.25, 0.25), 3), "g", V),
        mesure(now, "MPU6050", "acceleration_y", round(random.uniform(-0.25, 0.25), 3), "g", V),
        mesure(now, "MPU6050", "acceleration_z", round(random.uniform(0.85, 1.15), 3), "g", V),
        mesure(now, "GSR", "activite_electrodermale", round(e["gsr"], 2), "uS", V),
        mesure(now, "MAX30205", "temperature_corporelle", round(temp, 2), "°C", V),
        mesure(now, "Ceinture", "frequence_respiratoire", round(e["fr"], 1), "resp/min", V),
        mesure(now, "MH-Z19", "co2", round(e["co2"]), "ppm", V),
        mesure(now, "Dosimetre", "dose_radiation", round(dose, 3), "mSv/j", V),
        # Débit cardiaque = FC (variable) x VES (fixe)
        mesure(now, "Calcul", "debit_cardiaque", round(fc * VES_ML / 1000, 1), "L/min", V),
    ]

    # Mesures ponctuelles (moins fréquentes, comme sur de vrais appareils)
    if cycle % 15 == 0:   # tensiomètre
        sys_ = 130 + (fc - 72) * 0.4 + random.gauss(0, 3)
        dia = 83 + (fc - 72) * 0.2 + random.gauss(0, 2)
        sorties.append(mesure(now, "Omron", "pression_systolique", round(sys_), "mmHg", V))
        sorties.append(mesure(now, "Omron", "pression_diastolique", round(dia), "mmHg", V))
    if cycle % 20 == 0:   # dynamomètre
        sorties.append(mesure(now, "Jamar", "force_main_droite", round(random.gauss(45.5, 0.7), 1), "kg", V))
        sorties.append(mesure(now, "Jamar", "force_main_gauche", round(random.gauss(42.5, 0.7), 1), "kg", V))
    if cycle % 10 == 0:   # impédancemétrie : la masse maigre suit l'impédance mesurée
        z = 480 + random.gauss(0, 3)
        ffm = (-4.104 + 0.518 * ((TAILLE_M * 100) ** 2 / z) + 0.231 * POIDS_KG
               + 0.130 * REACTANCE_OHM + (4.229 if SEXE == "H" else 0))
        sorties.append(mesure(now, "InBody", "impedance", round(z), "ohm", V))
        sorties.append(mesure(now, "InBody", "masse_maigre", round(ffm, 1), "kg", V))
        sorties.append(mesure(now, "InBody", "masse_grasse", round((POIDS_KG - ffm) / POIDS_KG * 100, 1), "%", V))
    return sorties


# =============================================================================
# Envoi
# =============================================================================
def send(payload):
    data = json.dumps(payload).encode("utf-8")
    request = Request(RECEIVER_URL, data=data, headers={"Content-Type": "application/json"}, method="POST")
    with urlopen(request, timeout=5) as response:
        return response.status, response.read().decode("utf-8")


if __name__ == "__main__":
    print("HELIX — CAPTEURS VIRTUELS")
    print(f"Envoi vers {RECEIVER_URL} toutes les {INTERVAL_SECONDS} secondes.")
    print("Arrêter avec Ctrl+C.\n")
    cycle = 0
    while True:
        now = datetime.now(timezone.utc).isoformat()
        mesures = mesures_variables(cycle, now)
        if cycle % FIXED_EVERY == 0:
            mesures += mesures_fixes(now)
        try:
            status, result = send(mesures)
            print(f"[ENVOYÉ] cycle {cycle} | {len(mesures)} mesures | HTTP {status} | {result}")
            for m in mesures:
                print(f"  [{m['mode'][:3]}] {m['capteur']:<12}{m['parametre']:<28}{m['valeur']} {m['unite']}")
        except URLError as exc:
            print(f"[ERREUR] Module central inaccessible : {exc}")
            print("Vérifie que receiver.py est lancé dans l'autre terminal.")
        cycle += 1
        time.sleep(INTERVAL_SECONDS)
