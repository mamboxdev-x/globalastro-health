import { useEffect, useState } from "react";
import Sidebar, { type ScreenName } from "@/components/Sidebar";
import { DemoStateProvider } from "@/context/DemoStateContext";
import Dashboard from "@/views/Dashboard";
import BoneHeart from "@/views/BoneHeart";
import MentalHealth from "@/views/MentalHealth";
import AlertView from "@/views/AlertView";
import OfflineSync from "@/views/OfflineSync";
import { missionDay } from "@/data/missionData";

const screenConfig: Record<ScreenName, { eyebrow: string; module: string }> = {
  "Tableau de bord": { eyebrow: "SYNTHÈSE DE LA MISSION", module: "MODULE MED-01" },
  "Os & Cœur": { eyebrow: "SUIVI PHYSIOLOGIQUE", module: "MODULE PHY-02" },
  "Santé mentale": { eyebrow: "BIEN-ÊTRE ET SOMMEIL", module: "MODULE PSY-03" },
  Alerte: { eyebrow: "SUIVI DES ALERTES", module: "MODULE ALT-04" },
  "Hors ligne": { eyebrow: "ÉTAT DU SYSTÈME", module: "MODULE COM-05" },
};

function ActiveScreen({ active }: { active: ScreenName }) {
  switch (active) {
    case "Os & Cœur": return <BoneHeart />;
    case "Santé mentale": return <MentalHealth />;
    case "Alerte": return <AlertView />;
    case "Hors ligne": return <OfflineSync />;
    case "Tableau de bord": return <Dashboard />;
  }
}

function AppShell() {
  const [active, setActive] = useState<ScreenName>("Tableau de bord");
  const [utcNow, setUtcNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setUtcNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar active={active} onNavigate={setActive} />
      <main className="main-content" id="main-content">
        <header className="topbar">
          <div className="mission-block">
            <p className="eyebrow">{screenConfig[active].eyebrow}</p>
            <h1>{active}</h1>
          </div>
          <div className="mission-time" aria-label="Heure actuelle en UTC">
            <span>MISSION JOUR {missionDay}</span>
            <span className="divider" aria-hidden="true" />
            <time dateTime={utcNow.toISOString()}>{utcNow.toISOString().slice(11, 16)} UTC</time>
          </div>
        </header>

        <div className="prototype-notice" role="note">
          <span className="notice-dot" aria-hidden="true" />
          PROTOTYPE · DONNÉES DE DÉMONSTRATION · AUCUN CAPTEUR NI SERVICE CONNECTÉ
        </div>

        <ActiveScreen active={active} />

        <footer className="footer">
          <span>GlobalAstro Health v1.2.0</span>
          <span className="footer-center">PROTOTYPE · SAUVEGARDE LOCALE SI DISPONIBLE</span>
          <span>{screenConfig[active].module}</span>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <DemoStateProvider>
      <AppShell />
    </DemoStateProvider>
  );
}
