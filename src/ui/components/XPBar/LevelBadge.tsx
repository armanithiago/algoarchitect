import { cx } from "@/ui/lib/cx";

export interface LevelBadgeProps {
  level: number;
  className?: string;
}

/** Rounded square with "L3". The `xl` size (progress ring, Level-up screen) arrives with E4-03. */
export function LevelBadge({ level, className }: LevelBadgeProps) {
  return (
    <span
      role="img"
      aria-label={`Level ${level}`}
      data-size="sm"
      className={cx(
        "grid size-8 shrink-0 place-items-center rounded-sm border border-accent-line bg-accent-subtle",
        "text-caption font-bold tabular-nums text-accent-fg",
        className,
      )}
    >
      <span aria-hidden="true">L{level}</span>
    </span>
  );
}
