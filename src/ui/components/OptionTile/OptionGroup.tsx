import { useRef, type KeyboardEvent } from "react";
import { OptionTile, type OptionTileState } from "./OptionTile";

export interface OptionChoice {
  id: string;
  label: string;
}

export interface OptionGroupProps {
  /** Id of the element that holds the question text ("Which approach fits best?"). */
  labelledBy: string;
  /** In DISPLAY order. */
  options: OptionChoice[];
  selectedId: string | null;
  /** Set after Check: the group becomes read-only and shows the verdict. */
  verdict?: { correctId: string; pickedId: string | null } | null;
  onSelect: (id: string) => void;
}

const LETTERS = "ABCD";

/**
 * `radiogroup` with a roving tabindex (design system §7.2): one tab stop, arrows move focus AND selection,
 * Space/Enter on a tile selects. After Check arrows only move focus.
 */
export function OptionGroup({ labelledBy, options, selectedId, verdict = null, onSelect }: OptionGroupProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const anchorId = verdict ? verdict.pickedId : selectedId;
  const anchor = Math.max(
    0,
    options.findIndex((o) => o.id === anchorId),
  );

  const move = (to: number) => {
    const next = (to + options.length) % options.length;
    refs.current[next]?.focus();
    const opt = options[next];
    if (opt && !verdict) onSelect(opt.id);
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
        move(options.length - 1);
        break;
      default:
    }
  };

  const stateOf = (id: string): OptionTileState => {
    if (verdict) {
      if (id === verdict.correctId) return "correct";
      if (id === verdict.pickedId) return "incorrect";
      return "dimmed";
    }
    return id === selectedId ? "selected" : "default";
  };

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} onKeyDown={onKeyDown} className="flex flex-col gap-2">
      {options.map((o, i) => (
        <OptionTile
          key={o.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          id={`option-${o.id}`}
          keyLabel={LETTERS[i] ?? String(i + 1)}
          label={o.label}
          state={stateOf(o.id)}
          picked={verdict ? o.id === verdict.pickedId : false}
          tabIndex={i === anchor ? 0 : -1}
          onSelect={() => onSelect(o.id)}
        />
      ))}
    </div>
  );
}
