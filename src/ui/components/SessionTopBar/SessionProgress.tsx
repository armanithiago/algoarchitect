import { cx } from "@/ui/lib/cx";

export interface SessionProgressProps {
  /** 1-based number of the current scenario. */
  current: number;
  total: number;
  className?: string;
}

/**
 * N segments for N scenarios (design system §7.7). Correctness is deliberately NOT shown here.
 * Done = fg-secondary, current = accent, upcoming = track.
 */
export function SessionProgress({ current, total, className }: SessionProgressProps) {
  const now = Math.min(Math.max(current, 1), Math.max(total, 1));
  return (
    <div
      role="progressbar"
      aria-label="Session progress"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={now}
      aria-valuetext={`Scenario ${now} of ${total}`}
      data-state="default"
      className={cx("flex flex-1 gap-0.5", className)}
    >
      {Array.from({ length: total }, (_, k) => {
        const n = k + 1;
        return (
          <span
            key={n}
            data-segment={n < now ? "done" : n === now ? "current" : "upcoming"}
            className={cx(
              "h-1 flex-1 rounded-full motion-ok:transition-colors motion-ok:duration-(--duration-base)",
              n < now ? "bg-fg-secondary" : n === now ? "bg-accent" : "bg-track",
            )}
          />
        );
      })}
    </div>
  );
}
