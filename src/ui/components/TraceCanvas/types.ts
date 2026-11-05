/**
 * CONTRACT between the TraceCanvas author (Agent T) and the session screen author (Agent S).
 * Design system §7.4 (first step) and §7.23 (order mode). Agent T implements `TraceCanvas.tsx`; Agent S only renders it
 * with these props and must not change this file. The component is controlled: it holds no selection state itself.
 */
import type { Visual } from "@/domain/content/schema";

export type TraceMode = "first" | "order";
export type TraceView = "canvas" | "list";

export interface TraceCanvasProps {
  visual: Visual;
  mode: TraceMode;
  /**
   * Selected target ids in tap order.
   *  - mode "first": [] or [id] (tapping another target replaces it; tapping the selected one keeps it).
   *  - mode "order": starts with the `givenPrefix` locked ids, then the user's taps. Tapping an unselected target
   *    appends it; tapping the LAST user-tapped target removes it (undo); other numbered targets ignore taps.
   */
  value: string[];
  onChange: (ids: string[]) => void;
  /** Order mode: how many leading ids of `value` are pre-filled and locked (the start node). Ignored in "first". */
  givenPrefix: number;
  /** Order mode: total positions to fill (the expected sequence length), so the readout can say "3 of 6". */
  totalSteps: number;
  /** After Check: the view is read-only and reveals the verdict per target using `expected`. */
  checked: boolean;
  /** Only meaningful when `checked`: first mode [correctId]; order mode the full expected sequence. */
  expected: string[] | null;
  /** id of the heading that labels the question (aria-labelledby). */
  labelledBy: string;
  /** The user's choice between the SVG canvas and the accessible list (§7.4 "List view"). Controlled by the screen. */
  view: TraceView;
  onViewChange: (view: TraceView) => void;
}
