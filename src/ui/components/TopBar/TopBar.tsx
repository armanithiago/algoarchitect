import type { ReactNode } from "react";
import { cx } from "@/ui/lib/cx";

export interface TopBarProps {
  /** Stats, Settings, Study: a `title-2` heading at the left. Home passes none and uses `children` instead. */
  title?: string;
  /** Home: StreakCounter on the left, LevelBadge on the right. */
  children?: ReactNode;
  /** Content is scrolled under the bar: adds the 1 px bottom line (no shadow). */
  scrolled?: boolean;
  className?: string;
}

/** Display-only (design system §4.5, §7.7). Background is --canvas so Safari 26 tints its chrome correctly. */
export function TopBar({ title, children, scrolled = false, className }: TopBarProps) {
  return (
    <header
      data-state={scrolled ? "scrolled" : "default"}
      className={cx(
        "pt-safe px-gutter shrink-0 border-b bg-canvas",
        "min-h-[calc(var(--size-topbar)+env(safe-area-inset-top,0px))]",
        "short:min-h-[calc(3rem+env(safe-area-inset-top,0px))]",
        scrolled ? "border-line-subtle" : "border-transparent",
        className,
      )}
    >
      <div className="mx-auto flex min-h-14 max-w-content items-center justify-between gap-3 short:min-h-12">
        {title ? <h1 className="text-title-2 text-fg">{title}</h1> : null}
        {children}
      </div>
    </header>
  );
}
