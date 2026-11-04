import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/ui/lib/cx";

export type ChipTone = "neutral" | "accent" | "success" | "error" | "warning";

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: ChipTone;
  /** A 16 px icon (or dot) shown before the label. */
  icon?: ReactNode;
}

const tones: Record<ChipTone, string> = {
  neutral: "bg-surface-hover text-fg-secondary",
  accent: "bg-accent-subtle text-accent-fg tabular-nums",
  success: "bg-success-subtle text-success-fg",
  error: "bg-error-subtle text-error-fg",
  warning: "bg-warning-subtle text-warning-fg",
};

/** Non-interactive chip: 24 px tall, never a tap target. */
export function Chip({ tone = "neutral", icon, className, children, ...rest }: ChipProps) {
  return (
    <span
      data-state="default"
      data-tone={tone}
      className={cx(
        "inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full px-2 text-caption font-semibold",
        tones[tone],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </span>
  );
}
