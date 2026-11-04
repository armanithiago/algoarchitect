import { BookOpen, ChartColumn, Play, Settings, type LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cx } from "@/ui/lib/cx";

export interface TabItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Exact match only (the "/" route would otherwise match every page). */
  end?: boolean;
}

/** Four tabs, never five (design system v1.1, §7.6). */
export const TABS: readonly TabItem[] = [
  { to: "/", label: "Play", icon: Play, end: true },
  { to: "/study", label: "Study", icon: BookOpen },
  { to: "/stats", label: "Stats", icon: ChartColumn },
  { to: "/settings", label: "Settings", icon: Settings },
];

/**
 * Opaque (never translucent) `<nav>` of links. They are pages, not a tablist, so React Router sets
 * `aria-current="page"` on the active one. Needs a Router above it.
 */
export function BottomTabBar({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Main"
      className={cx(
        "relative z-[var(--z-nav)] shrink-0 border-t border-line-subtle bg-surface",
        "pb-[env(safe-area-inset-bottom,0px)]",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-content">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="group flex flex-1 flex-col items-center justify-center gap-1 text-tab focus-visible:outline-offset-[-2px]"
          >
            {({ isActive }) => (
              <>
                <span
                  data-state={isActive ? "selected" : "default"}
                  className={cx(
                    "grid h-8 w-14 place-items-center rounded-full motion-ok:transition-colors motion-ok:duration-(--duration-fast)",
                    isActive ? "bg-accent-subtle text-accent-fg" : "text-fg-muted",
                  )}
                >
                  <Icon size={24} aria-hidden="true" className="motion-ok:group-active:scale-[0.92]" />
                </span>
                <span className={isActive ? "text-fg" : "text-fg-muted"}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
