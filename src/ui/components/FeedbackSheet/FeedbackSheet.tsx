import { useId, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, CircleCheck, CircleX } from "lucide-react";
import { Button } from "@/ui/components/Button";
import { Chip } from "@/ui/components/Chip";
import { Complexity } from "@/ui/components/Complexity";
import { Sheet } from "@/ui/components/Sheet";
import { cx } from "@/ui/lib/cx";

export interface FeedbackOther {
  id: string;
  /** Key letter in the displayed order (A-D). */
  keyLabel: string;
  label: string;
  rationale: string;
  /** The user's own wrong pick: listed first, "Your pick", error-colored icon. */
  isPick: boolean;
}

export interface FeedbackCheck {
  /** Stable key (the validation index). */
  id: string;
  /** Text or rich content (a Complexity chip, a mono sequence). Prefix and value, e.g. "Big-O: O(log n)". */
  label: ReactNode;
  passed: boolean;
}

export interface FeedbackSheetProps {
  open: boolean;
  correct: boolean;
  xp: number;
  /** Label of the correct option: "Why {answer} wins". */
  answerLabel: string;
  explanation: string;
  complexity?: { time: string; space: string };
  /** The wrong options, user's pick first. */
  others: FeedbackOther[];
  /** Validation results ("Your checks"). Omit when the session has none. */
  checks?: FeedbackCheck[];
  /** "2 of 2 checks passed". Omit when there are no checks. */
  summaryLine?: string;
  /** Footer says "See summary" instead of "Next scenario". */
  last: boolean;
  /** Footer button and Esc. The only exit: no swipe, no scrim tap. */
  onNext: () => void;
  /** Where focus lands when the sheet closes: the first heading of the next step. */
  returnFocus?: () => HTMLElement | null | undefined;
}

/**
 * FeedbackSheet, explanation variant (design system §7.8, §8.7): a modal bottom sheet (centered dialog from `md`).
 * Header, "Why {answer} wins", "Why the others lose" (open by default), optional "Your checks", sticky footer.
 */
export function FeedbackSheet({
  open,
  correct,
  xp,
  answerLabel,
  explanation,
  complexity,
  others,
  checks,
  summaryLine,
  last,
  onNext,
  returnFocus,
}: FeedbackSheetProps) {
  const uid = useId();
  const headingId = `${uid}-verdict`;
  const [othersOpen, setOthersOpen] = useState(true);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setOthersOpen(true); // open by default every time the sheet appears
  }
  const Icon = correct ? CircleCheck : CircleX;

  return (
    <Sheet
      open={open}
      labelledBy={headingId}
      onEscape={onNext}
      returnFocus={returnFocus}
      footerFade
      footer={
        <Button size="lg" onClick={onNext} data-testid="feedback-next">
          {last ? "See summary" : "Next scenario"}
        </Button>
      }
    >
      <div
        data-state={correct ? "correct" : "incorrect"}
        className="flex flex-col gap-4 px-4 pb-4 pt-6 sm:px-6"
      >
        <div className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-x-2 border-b border-line-subtle pb-4">
          <Icon aria-hidden="true" size={24} className={correct ? "text-success-fg" : "text-error-fg"} />
          <h2 id={headingId} tabIndex={-1} className="text-title-2 text-fg outline-none">
            {correct ? "Correct" : "Not quite"}
          </h2>
          {xp > 0 ? <Chip tone="accent">+{xp} XP</Chip> : <span />}
          {summaryLine ? (
            <p className="col-span-2 col-start-2 text-caption text-fg-muted">{summaryLine}</p>
          ) : null}
        </div>

        <section className="flex flex-col gap-2">
          <h3 className="text-title-3 text-fg">Why {answerLabel} wins</h3>
          <p className="text-body text-fg">{explanation}</p>
          {complexity ? (
            <dl className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
              <div className="flex items-center gap-2">
                <dt className="text-body-sm text-fg-secondary">Time</dt>
                <dd>
                  <Complexity value={complexity.time} chip />
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="text-body-sm text-fg-secondary">Space</dt>
                <dd>
                  <Complexity value={complexity.space} chip />
                </dd>
              </div>
            </dl>
          ) : null}
        </section>

        {others.length > 0 ? (
          <section className="flex flex-col gap-3">
            <button
              type="button"
              aria-expanded={othersOpen}
              aria-controls={`${uid}-others`}
              onClick={() => setOthersOpen((v) => !v)}
              className="-my-2 flex min-h-12 w-full items-center justify-between gap-3 rounded-md text-left text-title-3 text-fg"
            >
              Why the others lose
              {othersOpen ? (
                <ChevronUp aria-hidden="true" size={20} className="text-fg-muted" />
              ) : (
                <ChevronDown aria-hidden="true" size={20} className="text-fg-muted" />
              )}
            </button>
            {othersOpen ? (
              <ul id={`${uid}-others`} className="flex flex-col gap-3">
                {others.map((o) => (
                  <li
                    key={o.id}
                    className="grid grid-cols-[1rem_1fr] gap-x-2"
                    data-pick={o.isPick ? "" : undefined}
                  >
                    <CircleX
                      aria-hidden="true"
                      size={16}
                      className={cx("mt-0.5", o.isPick ? "text-error-fg" : "text-fg-muted")}
                    />
                    <span className="text-body-sm font-semibold text-fg">
                      {o.keyLabel} {o.label}
                      {o.isPick ? <span className="text-error-fg">{" · Your pick"}</span> : null}
                    </span>
                    <p className="col-start-2 text-body-sm text-fg-secondary">{o.rationale}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        {checks && checks.length > 0 ? (
          <section className="flex flex-col gap-2">
            <h3 className="text-title-3 text-fg">Your checks</h3>
            <ul className="flex flex-col gap-2">
              {checks.map((c) => (
                <li
                  key={c.id}
                  data-passed={c.passed ? "" : undefined}
                  className="flex items-center gap-2 text-body-sm text-fg"
                >
                  {c.passed ? (
                    <CircleCheck aria-hidden="true" size={20} className="text-success-fg" />
                  ) : (
                    <CircleX aria-hidden="true" size={20} className="text-error-fg" />
                  )}
                  {c.label}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </Sheet>
  );
}
