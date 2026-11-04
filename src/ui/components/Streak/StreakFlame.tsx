import { Flame, Snowflake } from "lucide-react";
import { cx } from "@/ui/lib/cx";

export type StreakFlameState = "done" | "pending" | "none";

export interface StreakFlameProps {
  state: StreakFlameState;
  /** A freeze covered yesterday: adds a 12 px snowflake badge. */
  frozen?: boolean;
  size?: 20 | 24;
  className?: string;
}

/** Decorative: the parent carries the accessible name. Shape is the non-color cue (filled / outline). */
export function StreakFlame({ state, frozen = false, size = 20, className }: StreakFlameProps) {
  return (
    <span
      aria-hidden="true"
      data-state={state}
      className={cx(
        "relative inline-flex shrink-0",
        state === "none" ? "text-fg-muted" : "text-streak",
        className,
      )}
    >
      <Flame size={size} fill={state === "done" ? "currentColor" : "none"} />
      {frozen ? <Snowflake size={12} className="absolute -bottom-0.5 -right-1 text-freeze" /> : null}
    </span>
  );
}
