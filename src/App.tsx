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
import Radiation from "@/views/Radiation";
import GroundView from "@/views/GroundView";
import { missionDay } from "@/data/missionData";

const moduleCode: Record<ScreenName, string> = {
  "Tableau de bord": "MED-01",
  "Os & Cœur": "PHY-02",
  "Santé mentale": "PSY-03",
  Rayonnement: "RAD-04",
  Alerte: "ALT-05",
  "Hors ligne": "COM-06",
};

function ActiveScreen({ active }: { active: ScreenName }) {
  switch (active) {
    case "Os & Cœur": return <BoneHeart />;
    case "Santé mentale": return <MentalHealth />;
    case "Rayonnement": return <Radiation />;
    case "Alerte": return <AlertView />;
    case "Hors ligne": return <OfflineSync />;
    case "Tableau de bord": return <Dashboard />;
  }
}

function AppShell() {
  const { role } = useSession();
  const [active, setActive] = useState<ScreenName>("Tableau de bord");
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [utcNow, setUtcNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setUtcNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  // le tiroir n'existe que dans la coquille : au changement de rôle (déconnexion),
  // il doit se refermer, sinon l'interdiction de défiler reste posée sur le body.
  useEffect(() => {
    setMenuOuvert(false);
  }, [role]);

  // tiroir de navigation : Échap referme, et le fond ne défile pas tant qu'il est ouvert
  useEffect(() => {
    if (!menuOuvert) return;
    const surTouche = (evenement: KeyboardEvent) => {
      if (evenement.key === "Escape") setMenuOuvert(false);
    };
    window.addEventListener("keydown", surTouche);
    const defilementInitial = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", surTouche);
      document.body.style.overflow = defilementInitial;
    };
  }, [menuOuvert]);

  const naviguer = (ecran: ScreenName) => {
    setActive(ecran);
    setMenuOuvert(false);
  };

  if (!role) return <LoginScreen />;
  if (role === "sol") return <GroundView />;

  return (
    <div className={`u-app ${menuOuvert ? "is-open" : ""}`}>
      <Sidebar active={active} onNavigate={naviguer} />
      <div className="u-scrim" onClick={() => setMenuOuvert(false)} aria-hidden="true" />

      <main className="u-main" id="main-content">
        <header className="u-top">
          <button
            type="button"
            className="u-burger"
            aria-label="Ouvrir le menu des modules"
            aria-expanded={menuOuvert}
            aria-controls="app-nav"
            onClick={() => setMenuOuvert((ouvert) => !ouvert)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <div>
            <div className="u-title">{active}</div>
            <div className="u-sub">
              Module {moduleCode[active]} · poste à bord · jour {missionDay}
            </div>
          </div>

          <div className="u-top-actions">
            <span className="u-chip is-warn">
              <span className="u-dot is-warn" aria-hidden="true" />
              <span className="u-wide-only">Prototype · données simulées</span>
              <span className="u-narrow-only">Démo</span>
            </span>
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
