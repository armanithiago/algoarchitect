import type { Description, Target, TargetInfo } from "./model";
import type { TraceMode } from "./types";

/** What the three renderers (graph canvas, array canvas, list) share. Selection lives in the parent via `value`. */
export interface ViewProps {
  mode: TraceMode;
  targets: Target[];
  infos: Map<string, TargetInfo>;
  descs: Map<string, Description>;
  /** After Check: every target is `aria-disabled` and taps are ignored. */
  readOnly: boolean;
  /** A tap on a target (the parent decides what it changes). */
  onTap: (id: string) => void;
  /** Roving tabindex: the one target that is in the tab order. */
  activeId: string;
  onActive: (id: string) => void;
  registerRef: (id: string, el: HTMLButtonElement | null) => void;
}
