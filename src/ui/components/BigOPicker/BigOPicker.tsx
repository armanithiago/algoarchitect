import { useRef, type KeyboardEvent } from "react";
import { CircleCheck, CircleX } from "lucide-react";
import { Complexity, parseComplexity } from "@/ui/components/Complexity";
import { optionTileStates, type OptionTileState } from "@/ui/components/OptionTile";
import { cx } from "@/ui/lib/cx";

export interface BigOPickerProps {
  /** Id of the element that holds the question (the `title-3` in the Stage). */
  labelledBy: string;
  /** Complexity strings in the order given by the content (ascending growth). Never shuffled here. */
  choices: string[];
  selected: string | null;
  /** Set after Check: the group becomes read-only and shows the verdict. */
  verdict?: { correct: string; picked: string | null } | null;
  onSelect: (choice: string) => void;
}

/** Two columns when every choice is at most 12 characters, otherwise one column (design system §7.3). */
export function bigOColumns(choices: readonly string[]): 1 | 2 {
  return choices.every((c) => c.length <= 12) ? 2 : 1;
}

/** Accessible name: the spoken form, plus the verdict state ("O of log n, correct answer, your pick"). */
export function bigOChoiceName(value: string, state: OptionTileState, picked: boolean): string {
  const spoken = parseComplexity(value)?.spoken ?? value;
  if (state === "correct") return `${spoken}, correct answer${picked ? ", your pick" : ""}`;
  if (state === "incorrect") return `${spoken}, your pick, incorrect`;
  return spoken;
}

/**
 * BigOPicker (design system §7.3): a `radiogroup` of complexity choices rendered by `Complexity`, 48 px rows,
 * states identical to OptionTile. One tab stop (roving tabindex); arrows move in reading order and select.
 */
export function BigOPicker({ labelledBy, choices, selected, verdict = null, onSelect }: BigOPickerProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const columns = bigOColumns(choices);
  const anchorValue = verdict ? verdict.picked : selected;
  const anchor = Math.max(
    0,
    choices.findIndex((c) => c === anchorValue),
  );

  const move = (to: number) => {
    const next = (to + choices.length) % choices.length;
    refs.current[next]?.focus();
    const choice = choices[next];
    if (choice !== undefined && !verdict) onSelect(choice);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = refs.current.findIndex((el) => el === document.activeElement);
    if (current < 0) return;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault();
        move(current + 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        move(current - 1);
        break;
      case "Home":
        e.preventDefault();
        move(0);
        break;
      case "End":
        e.preventDefault();
        move(choices.length - 1);
        break;
      default:
    }
  };

  const stateOf = (c: string): OptionTileState => {
    if (verdict) {
      if (c === verdict.correct) return "correct";
      if (c === verdict.picked) return "incorrect";
      return "dimmed";
    }
    return c === selected ? "selected" : "default";
  };

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      data-columns={columns}
      onKeyDown={onKeyDown}
      className={cx("grid gap-2", columns === 2 ? "grid-cols-2" : "grid-cols-1")}
    >
      {choices.map((c, i) => {
        const state = stateOf(c);
        const picked = verdict ? c === verdict.picked : false;
        const readOnly = state === "correct" || state === "incorrect" || state === "dimmed";
        const checked = state === "selected" || state === "incorrect" || (state === "correct" && picked);
        const Icon = state === "correct" ? CircleCheck : state === "incorrect" ? CircleX : null;
        return (
          <button
            key={c}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-disabled={readOnly ? true : undefined}
            aria-label={bigOChoiceName(c, state, picked)}
            tabIndex={i === anchor ? 0 : -1}
            data-state={state}
            data-choice={c}
            onClick={() => {
              if (!readOnly) onSelect(c);
            }}
            className={cx(
              "flex min-h-12 items-center gap-1.5 rounded-md border-2 px-2 py-2 shadow-1",
              columns === 2 ? "justify-center" : "justify-start px-3.5",
              "transition-[background-color,border-color,color] duration-(--duration-fast) ease-standard",
              "motion-ok:active:scale-[0.99]",
              readOnly && "cursor-default",
              optionTileStates[state],
            )}
          >
            {Icon ? (
              <Icon
                aria-hidden="true"
                size={16}
                className={cx("shrink-0", state === "correct" ? "text-success-fg" : "text-error-fg")}
              />
            ) : null}
            <span aria-hidden="true">
              <Complexity value={c} size="mono-lg" className={state === "dimmed" ? "text-fg-muted" : undefined} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
