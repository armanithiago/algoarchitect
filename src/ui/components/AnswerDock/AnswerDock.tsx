import type { ReactNode } from "react";

export interface AnswerDockProps {
  /** Verdict strip, shown above the choices after Check. */
  verdict?: ReactNode;
  /** CoachMark, anchored above the dock. */
  coach?: ReactNode;
  /** The choices (OptionGroup). */
  children: ReactNode;
  /** The primary button (and its hidden hint). */
  action: ReactNode;
  /** Text for the polite live region: "Correct. Consistent hashing. Plus 10 XP." Empty until Check. */
  announcement: string;
}

/**
 * The fixed bottom region of a session step (design system §7.5, budget in §4.5): choices, an optional verdict strip
 * and one primary button. Padding `4px 16px max(12px, safe-area)`, `--canvas` background, 16 px fade above it.
 * It never scrolls; the Stage above it does.
 */
export function AnswerDock({ verdict, coach, children, action, announcement }: AnswerDockProps) {
  return (
    <div
      data-dock=""
      className={
        "px-gutter relative z-(--z-sticky) shrink-0 bg-canvas pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1 " +
        "before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-4 " +
        "before:bg-linear-to-t before:from-canvas before:to-transparent"
      }
    >
      {coach}
      <div className="mx-auto flex max-w-content flex-col gap-2">
        {verdict}
        {children}
        {action}
      </div>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
