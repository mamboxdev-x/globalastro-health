#!/usr/bin/env bash
# Demonstration locale complete : capteurs + module central + interface.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "============================================================"
echo "  GlobalAstro Health - demonstration locale"
echo "============================================================"
echo
echo "  1. le module central (capteurs simules, port 8000)"
echo "  2. les capteurs simules"
echo "  3. l'interface (http://localhost:5173)"
echo

if ! command -v python3 >/dev/null 2>&1; then
  echo "[ERREUR] python3 est introuvable. Installez Python 3.10+."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "[i] Premiere utilisation : installation des dependances npm..."
  npm install
  echo
fi

DOSSIER="backend/simulation-capteurs"

echo "[1/3] Module central..."
( cd "$DOSSIER" && python3 receiver.py ) > /tmp/globalastro-module.log 2>&1 &
PID_MODULE=$!

sleep 3

if curl -s --max-time 3 http://127.0.0.1:8000/sante >/dev/null 2>&1; then
  echo "      module central : en marche (port 8000)"
else
  echo "      [i] le module ne repond pas encore sur le port 8000 — journal : /tmp/globalastro-module.log"
fi

ADRESSE_RESEAU=$(hostname -I 2>/dev/null | awk '{print $1}')
if [ -n "${ADRESSE_RESEAU:-}" ]; then
  echo "      depuis un autre appareil du reseau : http://${ADRESSE_RESEAU}:8000"
fi

echo "[2/3] Capteurs simules..."
( cd "$DOSSIER" && python3 capteurs.py 2 ) > /tmp/globalastro-capteurs.log 2>&1 &
PID_CAPTEURS=$!

arreter() {
  echo
  echo "Arret de la demonstration..."
  kill "$PID_CAPTEURS" "$PID_MODULE" 2>/dev/null || true
}
trap arreter EXIT

echo "[3/3] Interface..."
echo
echo "  Ouvrez http://localhost:5173"
echo "  Identifiants : cdr.mbaye (astronaute) ou dr.anderson (medecin), mot de passe demo1234"
echo
echo "  Ctrl+C pour tout arreter."
echo

npm run dev
