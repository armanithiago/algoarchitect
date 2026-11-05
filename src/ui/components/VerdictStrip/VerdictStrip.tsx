import { CircleCheck, CircleX } from "lucide-react";
import { Chip } from "@/ui/components/Chip";
import { cx } from "@/ui/lib/cx";

export interface VerdictStripProps {
  correct: boolean;
  /** One line: "Consistent hashing is the fit." / "Best fit: Consistent hashing." */
  detail: string;
  /** Shown as a chip only when above zero. */
  xp?: number;
  /** The AnswerDock live region already announces the verdict; this keeps the `status` role without a second announcement. */
  silent?: boolean;
  className?: string;
}

/** Plain strip above the choices after Check (design system §7.5): icon, verdict, XP chip, one detail line. No background. */
export function VerdictStrip({ correct, detail, xp = 0, silent = false, className }: VerdictStripProps) {
  const Icon = correct ? CircleCheck : CircleX;
  return (
    <div
      role="status"
      aria-live={silent ? "off" : undefined}
      data-state={correct ? "correct" : "incorrect"}
      className={cx(
        "grid grid-cols-[1.5rem_1fr_auto] items-center gap-x-2 py-1 animate-fade-in motion-ok:animate-rise-in",
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        size={24}
        className={cx("motion-ok:animate-pop-in", correct ? "text-success-fg" : "text-error-fg")}
      />
      <span className="text-title-3 text-fg">{correct ? "Correct" : "Not quite"}</span>
      {xp > 0 ? <Chip tone="accent">+{xp} XP</Chip> : <span />}
      <span className="col-span-2 col-start-2 text-body-sm text-fg-secondary">{detail}</span>
    </div>
  );
}
