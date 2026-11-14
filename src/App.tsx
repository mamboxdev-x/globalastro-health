import { useState } from "react";
import Sidebar, { type ScreenName } from "@/components/Sidebar";
import Dashboard from "@/views/Dashboard";
import BoneHeart from "@/views/BoneHeart";
import MentalHealth from "@/views/MentalHealth";
import AlertView from "@/views/AlertView";
import OfflineSync from "@/views/OfflineSync";

const screenConfig: Record<ScreenName, { eyebrow: string; module: string }> = {
  "Tableau de bord": { eyebrow: "SYNTHÈSE MÉDICALE", module: "MODULE MED-01" },
  "Os & Cœur": { eyebrow: "MODULE PHYSIOLOGIE", module: "MODULE PHY-02" },
  "Santé mentale": { eyebrow: "MODULE COMPORTEMENTAL", module: "MODULE PSY-03" },
  Alerte: { eyebrow: "GESTION DES ALERTES", module: "MODULE ALT-04" },
  "Hors ligne": { eyebrow: "SYSTÈME AUTONOME", module: "MODULE COM-05" },
};

export default function App() {
  const [active, setActive] = useState<ScreenName>("Santé mentale");

  const renderScreen = () => {
    if (active === "Os & Cœur") return <BoneHeart />;
    if (active === "Santé mentale") return <MentalHealth />;
    if (active === "Alerte") return <AlertView />;
    if (active === "Hors ligne") return <OfflineSync />;
    return <Dashboard />;
  };

  return (
    <div className="app-shell">
      <Sidebar active={active} onNavigate={setActive} />
      <main className="main-content">
        <header className="topbar">
          <div className="mission-block">
            <p className="eyebrow">{screenConfig[active].eyebrow}</p>
            <h1>{active}</h1>
          </div>
          <div className="mission-time">
            <span>MISSION JOUR 87</span>
            <span className="divider" />
            <time>14:06 UTC</time>
          </div>
        </header>

        {renderScreen()}

        <footer className="footer">
          <span>GlobalAstro Health v1.0.4</span>
          <span className="footer-center">DONNÉES LOCALES CHIFFRÉES</span>
          <span>{screenConfig[active].module}</span>
        </footer>
      </main>
    </div>
  );
}
