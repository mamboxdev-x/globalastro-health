import { useEffect, useState } from "react";
import Sidebar, { type ScreenName } from "@/components/Sidebar";
import LoginScreen from "@/components/LoginScreen";
import { DemoStateProvider } from "@/context/DemoStateContext";
import { SessionProvider, useSession } from "@/context/SessionContext";
import Dashboard from "@/views/Dashboard";
import BoneHeart from "@/views/BoneHeart";
import MentalHealth from "@/views/MentalHealth";
import AlertView from "@/views/AlertView";
import OfflineSync from "@/views/OfflineSync";
import GroundView from "@/views/GroundView";
import { missionDay } from "@/data/missionData";

const moduleCode: Record<ScreenName, string> = {
  "Tableau de bord": "MED-01",
  "Os & Cœur": "PHY-02",
  "Santé mentale": "PSY-03",
  Alerte: "ALT-04",
  "Hors ligne": "COM-05",
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
  const { role, identifiant, deconnecter, basculeTheme, theme } = useSession();
  const [active, setActive] = useState<ScreenName>("Tableau de bord");
  const [utcNow, setUtcNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setUtcNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!role) return <LoginScreen />;
  if (role === "sol") return <GroundView />;

  return (
    <div className="u-app">
      <Sidebar active={active} onNavigate={setActive} />

      <main className="u-main">
        <header className="u-top">
          <div>
            <div className="u-title">{active}</div>
            <div className="u-sub">
              Module {moduleCode[active]} · poste à bord · jour {missionDay}
            </div>
          </div>

          <div className="u-top-actions">
            <span className="u-chip">{identifiant || "astronaute"}</span>
            <span className="u-chip is-warn">
              <span className="u-dot is-warn" aria-hidden="true" />
              Prototype · données simulées
            </span>
            <button type="button" className="u-btn is-quiet" onClick={basculeTheme}>
              {theme === "sombre" ? "Thème clair" : "Thème sombre"}
            </button>
            <button type="button" className="u-btn is-quiet" onClick={deconnecter}>
              Quitter
            </button>
            <div className="u-clock">
              <span>UTC</span>
              <b>{utcNow.toISOString().slice(11, 16)}</b>
            </div>
          </div>
        </header>

        <div className="u-body">
          <ActiveScreen active={active} />
        </div>

        <footer className="u-foot">
          <span>
            GlobalAstro Health <b>v1.2.0</b>
          </span>
          <span className="mid">
            Prototype de démonstration · <b>aucun dispositif médical connecté</b> · aucune donnée réelle
          </span>
          <span>K2/\Labs</span>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <DemoStateProvider>
        <AppShell />
      </DemoStateProvider>
    </SessionProvider>
  );
}
