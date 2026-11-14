import { NavIcon, type IconName } from "@/assets/NavIcons";
import { missionDay } from "@/data/missionData";

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
    <aside className="u-rail">
      <div className="u-brand">
        <div className="u-brand-mark" aria-hidden="true" />
        <div>
          <div className="u-brand-name">GlobalAstro</div>
          <div className="u-brand-sub">Santé équipage</div>
        </div>
      </div>

      <nav className="u-nav" aria-label="Navigation principale">
        <p className="u-nav-label">Modules</p>
        {navItems.map((item) => (
          <button
            type="button"
            key={item.label}
            className={`u-nav-btn ${active === item.label ? "is-active" : ""}`}
            onClick={() => onNavigate(item.label)}
            aria-current={active === item.label ? "page" : undefined}
          >
            <NavIcon name={item.icon} />
            <span>{item.label}</span>
            {item.label === "Alerte" && (
              <span className="u-nav-count" aria-label="Une alerte en cours">
                1
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="u-railfoot">
        <div className="u-railfoot-row">
          <span className="u-dot is-warn" aria-hidden="true" />
          <span>Poste à bord · jour {missionDay}</span>
        </div>
        <div className="u-railfoot-note">démonstration · aucune donnée réelle</div>
      </div>
    </aside>
  );
}
