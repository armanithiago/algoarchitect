import { CircleCheck, CircleX } from "lucide-react";
import { cx } from "@/ui/lib/cx";
import { targetName, type TargetState } from "./model";
import type { ViewProps } from "./viewTypes";

const rows: Record<TargetState, string> = {
  default:
    "border-line-subtle bg-surface-raised text-fg active:border-line active:bg-surface-pressed " +
    "can-hover:hover:border-line can-hover:hover:bg-surface-hover",
  selected: "border-accent bg-accent-subtle text-fg",
  sequenced: "border-accent bg-accent-subtle text-fg",
  correct: "border-success bg-success-subtle text-fg",
  incorrect: "border-dashed border-error bg-error-subtle text-fg",
  dimmed: "border-line-subtle bg-surface text-fg-muted",
};
const keys: Record<TargetState, string> = {
  default: "bg-surface-hover text-fg-secondary",
  selected: "bg-accent text-on-accent",
  sequenced: "bg-accent text-on-accent",
  correct: "bg-success text-on-success",
  incorrect: "bg-error text-on-error",
  dimmed: "bg-surface-hover text-fg-disabled",
};
const pills: Partial<Record<TargetState, string>> = {
  selected: "bg-accent text-on-accent",
  sequenced: "bg-accent text-on-accent",
  correct: "bg-success text-on-success",
  incorrect: "bg-error text-on-error",
};

/** The non-visual alternative (E3-12): OptionTile-style rows with the same names, states and verdicts as the canvas. */
export function ListView({ mode, targets, infos, descs, readOnly, onTap, activeId, onActive, registerRef }: ViewProps) {
  return (
    <div className="flex flex-col gap-2 pt-1" data-testid="trace-list">
      {targets.map((t) => {
        const info = infos.get(t.id);
        if (!info) return null;
        const desc = descs.get(t.id);
        const base = desc?.name ?? t.label;
        const text = desc?.rowText ?? "";
        const caption =
          mode === "order"
            ? info.shouldBe !== null && info.state === "incorrect"
              ? `Should be ${info.shouldBe}`
              : null
            : info.state === "correct"
              ? "Correct"
              : info.state === "incorrect"
                ? "Your pick"
                : null;
        const isArray = text.startsWith("Index ");
        return (
          <button
            key={t.id}
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
              "flex min-h-12 w-full touch-manipulation items-start gap-3 rounded-md border-2 py-2.5 pl-3.5 pr-2.5 text-left text-body-sm font-medium shadow-1",
              "transition-[background-color,border-color,color] duration-(--duration-fast) ease-standard",
              "motion-ok:active:scale-[0.99]",
              readOnly || info.locked ? "cursor-default" : "cursor-pointer",
              rows[info.state],
            )}
          >
            <span
              aria-hidden="true"
              className={cx(
                "grid h-6 min-w-6 shrink-0 place-items-center rounded-sm px-1 font-mono text-mono-sm font-semibold transition-colors duration-(--duration-fast)",
                keys[info.state],
              )}
            >
              {t.label}
            </span>
            <span aria-hidden="true" className="flex min-w-0 flex-1 flex-col pt-0.5">
              <span className={isArray ? "font-mono" : undefined}>{text}</span>
              {caption ? (
                <span className={cx("text-caption font-semibold", info.state === "correct" ? "text-success-fg" : "text-error-fg")}>
                  {caption}
                </span>
              ) : null}
            </span>
            {mode === "order" && info.position !== null ? (
              <span
                aria-hidden="true"
                className={cx(
                  "grid h-6 min-w-7 shrink-0 place-items-center rounded-full px-1.5 font-mono text-mono-sm font-bold",
                  pills[info.state],
                )}
              >
                {info.position}
              </span>
            ) : mode === "first" && info.state === "correct" ? (
              <CircleCheck aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-success-fg" />
            ) : mode === "first" && info.state === "incorrect" ? (
              <CircleX aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-error-fg" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
