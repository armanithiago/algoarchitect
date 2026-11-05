import { Button } from "@/ui/components/Button";

export interface CoachMarkProps {
  children: string;
  onDismiss: () => void;
}

/**
 * First-session hint (design system §7.22): a callout anchored above the AnswerDock, arrow pointing down.
 * Place inside a `relative` parent. It does not block taps on the tiles and is announced politely once.
 */
export function CoachMark({ children, onDismiss }: CoachMarkProps) {
  return (
    <div
      role="status"
      data-state="default"
      className={
        "absolute inset-x-4 bottom-[calc(100%+0.25rem)] z-(--z-coach) mx-auto flex max-w-content items-center gap-2 " +
        "rounded-lg border border-accent-line bg-surface-raised py-2 pl-4 pr-2 shadow-2 animate-fade-in motion-ok:animate-rise-in " +
        "after:absolute after:left-8 after:top-full after:size-0 after:border-8 after:border-transparent after:border-t-accent-line after:content-['']"
      }
    >
      <p className="flex-1 text-body-sm text-fg">{children}</p>
      <Button variant="ghost" size="sm" onClick={onDismiss}>
        Got it
      </Button>
    </div>
  );
}
