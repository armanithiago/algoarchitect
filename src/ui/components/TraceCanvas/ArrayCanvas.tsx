import { Check, X } from "lucide-react";
import { cx } from "@/ui/lib/cx";
import { targetName, type TargetInfo, type TargetState } from "./model";
import type { ViewProps } from "./viewTypes";

const cellStates: Record<TargetState, string> = {
  default: "bg-surface-raised active:bg-surface-pressed",
  selected: "bg-accent-subtle",
  sequenced: "bg-accent-subtle",
  correct: "bg-success-subtle",
  incorrect: "bg-error-subtle",
  dimmed: "bg-surface",
};
/** The 3 px state border is a separate overlay so a state change never shifts the 1 px separators. */
const frames: Partial<Record<TargetState, string>> = {
  selected: "border-accent",
  sequenced: "border-accent",
  correct: "border-success",
  incorrect: "border-dashed border-error",
};
const discs: Partial<Record<TargetState, string>> = {
  selected: "bg-accent text-on-accent",
  sequenced: "bg-accent text-on-accent",
  correct: "bg-success text-on-success",
  incorrect: "bg-error text-on-error",
};

function CellBadge({ info, mode }: { info: TargetInfo; mode: ViewProps["mode"] }) {
  const pop = "motion-ok:animate-pop-in";
  if (mode === "order" && info.position !== null) {
    return (
      <span
        aria-hidden="true"
        className={cx(
          "absolute right-0.5 top-0.5 z-10 grid size-[18px] place-items-center rounded-full font-mono text-mono-sm font-bold",
          discs[info.state] ?? discs.sequenced,
          pop,
        )}
      >
        {info.position}
      </span>
    );
  }
  if (mode === "first" && (info.state === "correct" || info.state === "incorrect")) {
    const Glyph = info.state === "correct" ? Check : X;
    return (
      <span aria-hidden="true" className={cx("absolute right-0.5 top-0.5 z-10 grid size-4 place-items-center rounded-full", discs[info.state], pop)}>
        <Glyph size={12} strokeWidth={3} absoluteStrokeWidth />
      </span>
    );
  }
  return null;
}

/**
 * Array: contiguous cells of at least 48 x 48 px (design system §7.4), index above in mono-sm. Six per row; a card narrower
 * than 6 x 48 px (a 320 px phone) wraps at five so no cell ever gets smaller than the 48 px target.
 * The cells are the buttons themselves, so there is no separate hit layer to drift.
 */
export function ArrayCanvas({ mode, targets, infos, descs, readOnly, onTap, activeId, onActive, registerRef }: ViewProps) {
  return (
    <div className="@container w-full" data-testid="trace-canvas-box">
      <div className="grid grid-cols-5 gap-y-1 pr-px @min-[18rem]:grid-cols-6">
        {targets.map((t, i) => {
          const info = infos.get(t.id);
          if (!info) return null;
          const base = descs.get(t.id)?.name ?? t.label;
          const frame = frames[info.state];
          return (
            <div key={t.id} className="-mr-px flex min-w-0 flex-col" data-array-cell="">
              <span aria-hidden="true" className="text-center font-mono text-mono-sm text-fg-muted">
                {i}
              </span>
              <button
                ref={(el) => registerRef(t.id, el)}
                type="button"
                data-trace-id={t.id}
                data-state={info.state}
                {...(mode === "first"
                  ? { role: "radio" as const, "aria-checked": info.picked }
                  : { "aria-pressed": info.position !== null })}
                aria-disabled={readOnly || info.locked ? true : undefined}
                aria-label={targetName(base, mode, info)}
                tabIndex={activeId === t.id ? 0 : -1}
                onClick={() => onTap(t.id)}
                onFocus={() => onActive(t.id)}
                className={cx(
                  "relative h-12 min-w-12 touch-manipulation border border-line-strong font-mono text-mono-node focus-visible:z-20 focus-visible:focus-ring-inset",
                  "transition-[background-color] duration-(--duration-fast) ease-standard",
                  info.state === "dimmed" ? "text-fg-muted" : "text-fg",
                  readOnly || info.locked ? "cursor-default" : "cursor-pointer",
                  cellStates[info.state],
                )}
              >
                {frame ? <span aria-hidden="true" className={cx("pointer-events-none absolute -inset-px z-10 border-[3px]", frame)} /> : null}
                <span aria-hidden="true">{t.label}</span>
                <CellBadge info={info} mode={mode} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
