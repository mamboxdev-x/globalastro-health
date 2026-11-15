import { NavIcon, type IconName } from "@/assets/NavIcons";
import RailCompte from "@/components/RailCompte";
import { useSession } from "@/context/SessionContext";
import { useConsignes } from "@/data/consignes";
import { missionDay } from "@/data/missionData";

export type ScreenName =
  | "Tableau de bord"
  | "Os & Cœur"
  | "Santé mentale"
  | "Rayonnement"
  | "Alerte"
  | "Hors ligne"
  | "Instructions";

const navItems: { label: ScreenName; icon: IconName }[] = [
  { label: "Tableau de bord", icon: "dashboard" },
  { label: "Os & Cœur", icon: "heart" },
  { label: "Santé mentale", icon: "mind" },
  { label: "Rayonnement", icon: "radiation" },
  { label: "Alerte", icon: "alert" },
  { label: "Hors ligne", icon: "offline" },
  { label: "Instructions", icon: "message" },
];

type SidebarProps = {
  active: ScreenName;
  onNavigate: (screen: ScreenName) => void;
};

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  const { theme, identifiant } = useSession();
  const { liste } = useConsignes();
  const instructionsALire = liste.filter(
    (consigne) => consigne.destinataire === identifiant && consigne.etat !== "lue",
  ).length;

  return (
    <aside className="u-rail" id="app-nav">
      <div className="u-brand">
        <img
          className="u-brand-logo"
          src={theme === "sombre" ? "/marque-sombre.png" : "/marque-clair.png"}
          alt=""
          aria-hidden="true"
        />
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
            {item.label === "Instructions" && instructionsALire > 0 && (
              <span className="u-nav-count" aria-label={`${instructionsALire} instruction(s) à lire`}>
                {instructionsALire}
              </span>
            )}
          </button>
        ))}
      </nav>

      <RailCompte
        statut={`Poste à bord · jour ${missionDay}`}
        note="démonstration · aucune donnée réelle"
      />
    </aside>
  );
}
