import { cx } from "@/ui/lib/cx";

export interface XPBarProps {
  level: number;
  /** Total XP. */
  xp: number;
  /** XP earned inside the current level. */
  xpIntoLevel: number;
  /** Size of the current level in XP. */
  levelSpan: number;
  /** Total XP at which the next level starts. */
  nextLevelAt: number;
  size?: "md" | "sm";
  className?: string;
}

/** Displays values from `domain/xp`; it does no XP math beyond the label differences. */
export function XPBar({ level, xp, xpIntoLevel, levelSpan, nextLevelAt, size = "md", className }: XPBarProps) {
  const pct = levelSpan > 0 ? Math.min(100, Math.max(0, (xpIntoLevel / levelSpan) * 100)) : 0;
  const toNext = nextLevelAt - xp;
  const valueText = `${xp} of ${nextLevelAt} XP, ${toNext} to level ${level + 1}`;

  const bar = (
    <div
      role="progressbar"
      aria-label={`Level ${level} progress`}
      aria-valuemin={0}
      aria-valuemax={levelSpan}
      aria-valuenow={xpIntoLevel}
      aria-valuetext={valueText}
      data-size={size}
      className={cx("overflow-hidden rounded-full bg-track", size === "sm" ? "h-1" : "h-2")}
    >
      <span
        className="block h-full rounded-full bg-xp motion-ok:transition-[width] motion-ok:duration-(--duration-slower) motion-ok:ease-standard"
        style={{ width: `${pct}%` }}
      />
    </div>
  );

  if (size === "sm") return <div className={className}>{bar}</div>;

  return (
    <div className={cx("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-title-3 text-fg">Level {level}</span>
        <span className="text-caption tabular-nums text-fg-muted">
          {xp}/{nextLevelAt} XP
        </span>
      </div>
      {bar}
      <span className="text-caption tabular-nums text-fg-muted">
        {toNext} XP to Level {level + 1}
      </span>
    </div>
  );
}
