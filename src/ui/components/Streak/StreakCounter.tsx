import { Snowflake } from "lucide-react";
import { cx } from "@/ui/lib/cx";
import { StreakFlame } from "./StreakFlame";

export interface StreakCounterProps {
  count: number;
  /** A session was completed today. */
  doneToday: boolean;
  /** Freezes available (max 2). Omit to hide the freeze count. */
  freezes?: number;
  frozen?: boolean;
  className?: string;
}

export function streakLabel(count: number, doneToday: boolean, freezes?: number): string {
  const streak = count === 0 ? "No active streak" : `${count}-day streak, ${doneToday ? "today complete" : "not yet today"}`;
  if (freezes === undefined) return streak;
  return `${streak}, ${freezes} ${freezes === 1 ? "freeze" : "freezes"} available`;
}

/** Display-only (no tap target). One accessible name for the whole group. */
export function StreakCounter({ count, doneToday, freezes, frozen = false, className }: StreakCounterProps) {
  const state = count === 0 ? "none" : doneToday ? "done" : "pending";
  return (
    <div
      role="img"
      aria-label={streakLabel(count, doneToday, freezes)}
      data-state={state}
      className={cx("inline-flex items-center gap-1.5", className)}
    >
      <StreakFlame state={state} frozen={frozen} />
      <span aria-hidden="true" className="text-title-3 tabular-nums text-fg">
        {count}
      </span>
      {freezes === undefined ? null : (
        <span aria-hidden="true" className="ml-2 inline-flex items-center gap-1 text-freeze">
          <Snowflake size={16} />
          <span className="text-caption tabular-nums text-fg-secondary">{freezes}</span>
        </span>
      )}
    </div>
  );
}
