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
        <div className="helix-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div>
          <div className="brand-name">GLOBALASTRO</div>
          <div className="brand-subtitle">HEALTH SYSTEM</div>
        </div>
      </div>

      <nav className="primary-nav" aria-label="Navigation principale">
        <p className="nav-section-label">SYSTÈMES</p>
        {navItems.map((item) => (
          <button
            type="button"
            key={item.label}
            className={`nav-item ${active === item.label ? "active" : ""}`}
            onClick={() => onNavigate(item.label)}
            aria-current={active === item.label ? "page" : undefined}
          >
            <NavIcon name={item.icon} />
            <span>{item.label}</span>
            {item.label === "Alerte" && <span className="nav-count alert-count">1</span>}
          </button>
        ))}
      </nav>

      <div className="system-status">
        <div className="system-status-line">
          <span
            className={`status-dot ${active === "Alerte" ? "alert-dot" : active === "Hors ligne" ? "offline-dot" : ""}`}
          />
          <span>
            {active === "Alerte"
              ? "ALERTE ACTIVE"
              : active === "Hors ligne"
                ? "MODE AUTONOME"
                : "SYSTÈME NOMINAL"}
          </span>
        </div>
        <div className="sync-time">SYNC 14:05:42 UTC</div>
      </div>
    </aside>
  );
}
