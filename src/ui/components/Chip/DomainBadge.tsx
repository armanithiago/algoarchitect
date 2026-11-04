import { DOMAINS, type Domain } from "@/ui/lib/domain";
import { cx } from "@/ui/lib/cx";
import { Chip } from "./Chip";

export type DomainBadgeVariant = "subtle" | "dot" | "icon";

export interface DomainBadgeProps {
  domain: Domain;
  variant?: DomainBadgeVariant;
  /** Optional count shown after the label (Home mix: "Graphs 3"). */
  count?: number;
  /** Use the full name instead of the short one (Stats rows). */
  full?: boolean;
  className?: string;
}

/** Always text plus icon or dot: the color is only a third cue. */
export function DomainBadge({ domain, variant = "subtle", count, full = false, className }: DomainBadgeProps) {
  const meta = DOMAINS[domain];
  const label = full ? meta.label : meta.short;
  const Icon = meta.icon;

  if (variant === "icon") {
    // 32 px square for Stats rows; the label travels with it for assistive tech.
    return (
      <span
        role="img"
        aria-label={meta.label}
        data-domain={domain}
        data-variant="icon"
        className={cx("grid size-8 shrink-0 place-items-center rounded-sm", meta.subtle, className)}
      >
        <Icon size={20} aria-hidden="true" />
      </span>
    );
  }

  if (variant === "dot") {
    return (
      <Chip
        data-domain={domain}
        data-variant="dot"
        className={className}
        icon={<span aria-hidden="true" className={cx("size-2 shrink-0 rounded-full", meta.dot)} />}
      >
        {label}
        {count === undefined ? null : <span className="tabular-nums">{count}</span>}
      </Chip>
    );
  }

  return (
    <span
      data-domain={domain}
      data-variant="subtle"
      className={cx(
        "inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full px-2 text-caption font-semibold",
        meta.subtle,
        className,
      )}
    >
      <Icon size={16} aria-hidden="true" />
      {label}
    </span>
  );
}
