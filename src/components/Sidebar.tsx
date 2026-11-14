import { NavIcon, type IconName } from "@/assets/NavIcons";

export type ScreenName =
  | "Tableau de bord"
  | "Os & Cœur"
  | "Santé mentale"
  | "Alerte"
  | "Hors ligne";

const navItems: { label: ScreenName; icon: IconName }[] = [
  { label: "Tableau de bord", icon: "dashboard" },
  { label: "Os & Cœur", icon: "heart" },
  { label: "Santé mentale", icon: "mind" },
  { label: "Alerte", icon: "alert" },
  { label: "Hors ligne", icon: "offline" },
];

type SidebarProps = {
  active: ScreenName;
  onNavigate: (screen: ScreenName) => void;
};

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="helix-mark" aria-hidden="true"><span /><span /><span /></div>
        <div><div className="brand-name">GLOBALASTRO</div><div className="brand-subtitle">HEALTH SYSTEM</div></div>
      </div>

      <nav className="primary-nav" aria-label="Navigation principale">
        <p className="nav-section-label">MODULES</p>
        {navItems.map((item) => (
          <button
            type="button"
            key={item.label}
            className={`nav-item ${active === item.label ? "active" : ""}`}
            onClick={() => onNavigate(item.label)}
            aria-current={active === item.label ? "page" : undefined}
            title={item.label}
            aria-label={item.label}
          >
            <NavIcon name={item.icon} />
            <span>{item.label}</span>
            {item.label === "Alerte" && <span className="nav-count alert-count" aria-label="Une alerte">1</span>}
          </button>
        ))}
      </nav>

      <div className="system-status">
        <div className="system-status-line">
          <span className={`status-dot ${active === "Alerte" ? "alert-dot" : active === "Hors ligne" ? "offline-dot" : ""}`} />
          <span>{active === "Alerte" ? "ALERTE À EXAMINER" : active === "Hors ligne" ? "MODE HORS LIGNE · DÉMO" : "PROTOCOLE DE DÉMO"}</span>
        </div>
        <div className="sync-time">AUCUNE SYNCHRONISATION RÉELLE</div>
      </div>
    </aside>
  );
}
