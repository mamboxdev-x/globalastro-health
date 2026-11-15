import type { ReactNode } from "react";

export type IconName = "dashboard" | "heart" | "mind" | "alert" | "offline" | "radiation";

const iconPaths: Record<IconName, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  heart: (
    <>
      <path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.4 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
      <path d="M7 12h3l1.2-2.5 2 5 1.3-2.5H17" />
    </>
  ),
  mind: (
    <>
      <path d="M9.5 4.4A3.5 3.5 0 0 0 4 7.3a3.6 3.6 0 0 0 .7 2.1A4 4 0 0 0 6 17.2V20h5V5.5a3.5 3.5 0 0 0-1.5-1.1Z" />
      <path d="M14.5 4.4A3.5 3.5 0 0 1 20 7.3a3.6 3.6 0 0 1-.7 2.1 4 4 0 0 1-1.3 7.8V20h-5V5.5a3.5 3.5 0 0 1 1.5-1.1Z" />
      <path d="M7.5 9.5H11M13 13h3.5" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 3.6 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
      <path d="M12 8v4.5M12 16.5v.1" />
    </>
  ),
  offline: (
    <>
      <path d="M5 8.6A11 11 0 0 1 18.4 7M2.8 12a15 15 0 0 1 2.9-2.1M8.5 13.2a5.5 5.5 0 0 1 5.8-.3M12 18h.1" />
      <path d="m3 3 18 18" />
    </>
  ),
  radiation: (
    <>
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 2.5v3.4M12 18.1v3.4M2.5 12h3.4M18.1 12h3.4M5.3 5.3l2.4 2.4M16.3 16.3l2.4 2.4M18.7 5.3l-2.4 2.4M7.7 16.3l-2.4 2.4" />
    </>
  ),
};

export function NavIcon({ name }: { name: IconName }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      {iconPaths[name]}
    </svg>
  );
}
