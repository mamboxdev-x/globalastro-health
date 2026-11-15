@echo off
chcp 65001 > nul
setlocal
cd /d "%~dp0.."

echo ============================================================
echo   GlobalAstro Health - demonstration locale
echo ============================================================
echo.
echo   Ce script demarre :
echo     1. le module central (capteurs simules, port 8000)
echo     2. les capteurs simules
echo     3. l'interface (http://localhost:5173)
echo.

where python >nul 2>&1
if errorlevel 1 (
  echo [ERREUR] Python est introuvable dans le PATH.
  echo          Installez Python 3.10+ depuis python.org, puis relancez.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [i] Premiere utilisation : installation des dependances npm...
  call npm.cmd install
  echo.
)

echo [1/3] Module central...
start "GlobalAstro - module central" cmd /k "cd /d %~dp0..\backend\simulation-capteurs && python receiver.py"

timeout /t 3 /nobreak >nul

echo [2/3] Capteurs simules...
start "GlobalAstro - capteurs" cmd /k "cd /d %~dp0..\backend\simulation-capteurs && python capteurs.py 2"

timeout /t 2 /nobreak >nul

echo [3/3] Interface...
echo.
echo   Ouvrez http://localhost:5173 dans le navigateur.
echo   Identifiants : cdr.mbaye (astronaute) ou dr.anderson (medecin), mot de passe orbite2026
echo.
echo   Fermer les deux fenetres "module central" et "capteurs" pour arreter la demonstration.
echo.
start "" http://localhost:5173
call npm.cmd run dev

endlocal
