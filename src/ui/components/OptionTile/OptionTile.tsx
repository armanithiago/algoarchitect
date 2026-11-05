import { forwardRef } from "react";
import { CircleCheck, CircleX } from "lucide-react";
import { cx } from "@/ui/lib/cx";

export type OptionTileState = "default" | "selected" | "correct" | "incorrect" | "dimmed";

export interface OptionTileProps {
  /** Key badge letter, A-D. Follows the displayed order. */
  keyLabel: string;
  label: string;
  state?: OptionTileState;
  /** The user chose this tile (matters for `correct`: "Best fit · your pick"). */
  picked?: boolean;
  tabIndex?: number;
  onSelect?: () => void;
  id?: string;
}

/** Surface classes per state; shared with BigOPicker so both read identically (design system §7.3). */
export const optionTileStates: Record<OptionTileState, string> = {
  default:
    "border-line-subtle bg-surface-raised text-fg active:border-line active:bg-surface-pressed " +
    "can-hover:hover:border-line can-hover:hover:bg-surface-hover",
  selected: "border-accent bg-accent-subtle text-fg",
  correct: "border-success bg-success-subtle text-fg",
  incorrect: "border-dashed border-error bg-error-subtle text-fg",
  dimmed: "border-line-subtle bg-surface text-fg-muted",
};

const keyBadge: Record<OptionTileState, string> = {
  default: "bg-surface-hover text-fg-secondary",
  selected: "bg-accent text-on-accent",
  correct: "bg-success text-on-success",
  incorrect: "bg-error text-on-error",
  dimmed: "bg-surface-hover text-fg-disabled",
};

/** Accessible name per design system §7.2: "Consistent hashing, best fit, your pick". */
export function optionTileName(label: string, state: OptionTileState, picked: boolean): string {
  if (state === "correct") return picked ? `${label}, best fit, your pick` : `${label}, best fit`;
  if (state === "incorrect") return `${label}, your pick, incorrect`;
  return label;
}

/**
 * One answer choice (design system §7.2). A `radio` in a `radiogroup` (see OptionGroup).
 * The 2 px border is always present so a state change never shifts layout; dashed = the wrong pick.
 */
export const OptionTile = forwardRef<HTMLButtonElement, OptionTileProps>(function OptionTile(
  { keyLabel, label, state = "default", picked = false, tabIndex, onSelect, id },
  ref,
) {
  const verdict = state === "correct" || state === "incorrect";
  const readOnly = verdict || state === "dimmed";
  const caption =
    state === "correct" ? (picked ? "Best fit · your pick" : "Best fit") : state === "incorrect" ? "Your pick" : null;
  const checked = state === "selected" || state === "incorrect" || (state === "correct" && picked);
  const StateIcon = state === "correct" ? CircleCheck : state === "incorrect" ? CircleX : null;

  return (
    <button
      ref={ref}
      id={id}
      type="button"
      role="radio"
      aria-checked={checked}
      aria-disabled={readOnly ? true : undefined}
      aria-label={optionTileName(label, state, picked)}
      tabIndex={tabIndex}
      data-state={state}
      onClick={() => {
        if (!readOnly) onSelect?.();
      }}
      className={cx(
        "flex min-h-12 w-full items-start gap-3 rounded-md border-2 py-2.5 pl-3.5 pr-2.5 text-left text-body font-medium shadow-1",
        "transition-[background-color,border-color,color] duration-(--duration-fast) ease-standard",
        "motion-ok:active:scale-[0.99]",
        readOnly && "cursor-default",
        optionTileStates[state],
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          "grid size-6 shrink-0 place-items-center rounded-sm font-mono text-mono-sm font-semibold",
          "transition-colors duration-(--duration-fast)",
          keyBadge[state],
        )}
      >
        {keyLabel}
      </span>
      <span aria-hidden="true" className="flex min-w-0 flex-1 flex-col">
        <span>{label}</span>
        {caption ? (
          <span
            className={cx(
              "text-caption font-semibold",
              state === "correct" ? "text-success-fg" : "text-error-fg",
            )}
          >
            {caption}
          </span>
        ) : null}
      </span>
      {StateIcon ? (
        <StateIcon
          aria-hidden="true"
          size={20}
          className={cx("mt-0.5 shrink-0", state === "correct" ? "text-success-fg" : "text-error-fg")}
        />
      ) : null}
    </button>
  );
});
