import { useCallback, useId, useRef, useState, type KeyboardEvent } from "react";
import { List, Undo2, Waypoints } from "lucide-react";
import { Button } from "@/ui/components/Button";
import { ArrayCanvas } from "./ArrayCanvas";
import { GraphCanvas } from "./GraphCanvas";
import { ListView } from "./ListView";
import {
  computeStates,
  describeTargets,
  getTargets,
  isArrayVisual,
  nextValue,
  readoutParts,
  summaryText,
  undoValue,
} from "./model";
import type { TraceCanvasProps } from "./types";

/**
 * Trace a visual: tap the first step (`mode="first"`) or every step in visit order (`mode="order"`).
 * Design system §7.4 and §7.23. Controlled: the selection lives in `value`, so the Canvas and the List share it.
 */
export function TraceCanvas({
  visual,
  mode,
  value,
  onChange,
  givenPrefix,
  totalSteps,
  checked,
  expected,
  labelledBy,
  view,
  onViewChange,
}: TraceCanvasProps) {
  const summaryId = useId();
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const [active, setActive] = useState<string | null>(null);

  const targets = getTargets(visual);
  const descs = describeTargets(visual);
  const prefix = mode === "order" ? givenPrefix : 0;
  const infos = computeStates(targets, mode, value, prefix, checked, expected);

  // Roving tabindex: the selected target, else the first one the user can still tap.
  const fallback =
    (mode === "first" ? value[0] : undefined) ??
    targets.find((t) => !infos.get(t.id)?.locked)?.id ??
    targets[0]?.id ??
    "";
  const activeId = active !== null && targets.some((t) => t.id === active) ? active : fallback;

  const registerRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) refs.current.set(id, el);
    else refs.current.delete(id);
  }, []);

  const tap = (id: string) => {
    if (checked) return;
    if (infos.get(id)?.locked) return;
    const next = nextValue(mode, value, id, prefix, totalSteps);
    if (next) onChange(next);
  };

  const undo = () => {
    const next = undoValue(value, prefix);
    if (!next) return;
    // The Undo button disappears with the last user tap; keep focus on the target that was removed.
    if (next.length <= prefix) refs.current.get(value[value.length - 1]!)?.focus();
    onChange(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Backspace" && mode === "order" && !checked) {
      if (undoValue(value, prefix)) {
        e.preventDefault();
        undo();
      }
      return;
    }
    const nav: Record<string, number | undefined> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const from = (e.target as HTMLElement).closest<HTMLElement>("[data-trace-id]");
    if (!from || targets.length === 0) return;
    const at = targets.findIndex((t) => t.id === from.dataset.traceId);
    let to = -1;
    if (e.key === "Home") to = 0;
    else if (e.key === "End") to = targets.length - 1;
    else if (nav[e.key] !== undefined) to = (at + nav[e.key]! + targets.length) % targets.length;
    if (to < 0) return;
    e.preventDefault();
    const target = targets[to]!;
    setActive(target.id);
    refs.current.get(target.id)?.focus();
  };

  const array = isArrayVisual(visual);
  const readout = readoutParts(visual, mode, value, totalSteps, checked, expected);
  const showUndo = mode === "order" && !checked && value.length > prefix;
  const shared = { mode, targets, infos, descs, readOnly: checked, onTap: tap, activeId, onActive: setActive, registerRef };

  return (
    <section
      className="rounded-lg border border-line-subtle bg-surface px-3 pb-3 pt-2 shadow-1"
      data-state={checked ? "checked" : "default"}
      data-mode={mode}
      data-view={view}
      onKeyDown={onKeyDown}
    >
      <div className="-mr-1 flex min-h-10 items-center justify-between gap-2">
        <span className="min-w-0 text-caption text-fg-muted">{visual.caption}</span>
        <span className="flex shrink-0 items-center">
          {showUndo ? (
            <Button variant="ghost" size="sm" onClick={undo} leadingIcon={<Undo2 aria-hidden="true" size={16} />}>
              Undo
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange(view === "list" ? "canvas" : "list")}
            leadingIcon={view === "list" ? <Waypoints aria-hidden="true" size={16} /> : <List aria-hidden="true" size={16} />}
          >
            {view === "list" ? (array ? "Array" : visual.kind === "tree" ? "Tree" : "Graph") : "List"}
          </Button>
        </span>
      </div>
      <span id={summaryId} className="sr-only">
        {summaryText(visual, mode, prefix)}
      </span>
      <div
        role={mode === "first" ? "radiogroup" : "group"}
        aria-labelledby={labelledBy}
        aria-describedby={summaryId}
        aria-disabled={checked ? true : undefined}
      >
        {view === "list" ? (
          <ListView {...shared} />
        ) : array ? (
          <ArrayCanvas {...shared} />
        ) : (
          <GraphCanvas {...shared} visual={visual} />
        )}
      </div>
      <p aria-live="polite" className="pt-2 text-caption text-fg-muted">
        {readout.lead}
        {readout.mono !== null ? <span className="font-mono [font-variant-ligatures:none]">{readout.mono}</span> : null}
        {readout.tail}
      </p>
    </section>
  );
}
