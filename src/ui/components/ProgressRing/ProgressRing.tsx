import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cx } from "@/ui/lib/cx";

export interface ProgressRingProps {
  value: number;
  max: number;
  size?: 64 | 96;
  /** Centre text (`title-2`, tabular), e.g. `8/10`. */
  centerLabel: string;
  /** Small text under the ring, e.g. `correct`. */
  caption?: string;
  /** Spoken equivalent: "8 of 10 correct". */
  label: string;
  className?: string;
}

const STROKE = { 64: 8, 96: 10 } as const;

/** Round cap, starts at 12 o'clock, clockwise (design system §7.14). The SVG is hidden; `label` is spoken instead. */
export function ProgressRing({ value, max, size = 96, centerLabel, caption, label, className }: ProgressRingProps) {
  const reduced = useReducedMotion();
  const [drawn, setDrawn] = useState(reduced);
  useEffect(() => {
    if (reduced) return;
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, [reduced]);

  const stroke = STROKE[size];
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const fraction = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const offset = c * (1 - (drawn || reduced ? fraction : 0));

  return (
    <div data-state="default" className={cx("inline-flex flex-col items-center gap-1", className)}>
      <div className="relative grid place-items-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-track" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="stroke-accent motion-ok:transition-[stroke-dashoffset] motion-ok:duration-(--duration-slower) motion-ok:ease-standard"
          />
        </svg>
        <span aria-hidden="true" className="absolute text-title-2 tabular-nums text-fg">
          {centerLabel}
        </span>
      </div>
      {caption ? (
        <span aria-hidden="true" className="text-caption text-fg-muted">
          {caption}
        </span>
      ) : null}
      <span className="sr-only">{label}</span>
    </div>
  );
}
