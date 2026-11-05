import type { RefObject } from "react";
import { MemoryStick, Timer } from "lucide-react";
import type { Validation } from "@/domain/content/schema";
import type { ValidationAnswer, ValidationResult } from "@/domain/session/types";
import { expectedTargets, gradeValidation, isAnswerComplete } from "@/domain/session/validation";
import { useSessionStore } from "@/stores/session";
import { AnswerDock } from "@/ui/components/AnswerDock";
import { BigOPicker } from "@/ui/components/BigOPicker";
import { Button } from "@/ui/components/Button";
import { Chip } from "@/ui/components/Chip";
import { TraceCanvas } from "@/ui/components/TraceCanvas";
import type { TraceView } from "@/ui/components/TraceCanvas/types";
import { VerdictStrip } from "@/ui/components/VerdictStrip";
import { verdictAnnouncement, verdictDetail } from "./validationCopy";

const QUESTION_ID = "validation-question";
const KIND_LABEL: Record<Validation["type"], string> = {
  bigO: "",
  traceFirstStep: " · Trace",
  traceOrder: " · Order",
};
const REASON: Record<Validation["type"], string> = {
  bigO: "Select an answer first",
  traceFirstStep: "Tap a node first",
  traceOrder: "Tap every node in order first",
};

export interface ValidationStepProps {
  validation: Validation;
  /** Position in `scenario.validations` and how many there are: "Check 1 of 2". */
  index: number;
  total: number;
  answer: ValidationAnswer | null;
  checked: boolean;
  /** Set once the store has graded it. */
  result?: ValidationResult;
  titleRef: RefObject<HTMLHeadingElement>;
  /** Check, then Continue (with the 350 ms input guard). Owned by the page. */
  onPrimary: () => void;
  traceView: TraceView;
  onTraceView: (view: TraceView) => void;
}

/** One mini-validation (design system §8.5, §8.6, §8.14): stage with the question, choices or trace, dock with Check. */
export function ValidationStep({
  validation: v,
  index,
  total,
  answer,
  checked,
  result,
  titleRef,
  onPrimary,
  traceView,
  onTraceView,
}: ValidationStepProps) {
  const setAnswer = (a: ValidationAnswer | null) => useSessionStore.getState().setAnswer(a);
  const complete = isAnswerComplete(v, answer);
  const needsAnswer = !checked && !complete;
  const correct = result?.correct ?? (checked ? gradeValidation(v, answer).correct : false);
  const xp = result?.xp ?? 0;
  const MeasureIcon = v.type === "bigO" && v.measure === "space" ? MemoryStick : Timer;

  const traceValue =
    v.type === "traceOrder"
      ? answer?.type === "order"
        ? answer.ids
        : v.answer.slice(0, v.givenPrefix)
      : answer?.type === "target"
        ? [answer.id]
        : [];

  return (
    <>
      <main className="min-h-0 flex-1 touch-manipulation overflow-y-auto overscroll-y-contain">
        <div className="px-gutter mx-auto flex min-h-full max-w-content flex-col gap-3 pb-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-caption text-fg-muted">
              Check {index + 1} of {total}
              {KIND_LABEL[v.type]}
            </span>
            {v.type === "bigO" && v.measure ? (
              <Chip icon={<MeasureIcon aria-hidden="true" size={16} />}>
                {v.measure === "space" ? "Space" : "Time"}
              </Chip>
            ) : null}
          </div>
          <h1 id={QUESTION_ID} ref={titleRef} tabIndex={-1} className="text-title-3 text-fg outline-none">
            {v.question}
          </h1>
          {v.type !== "bigO" ? (
            <div className="mt-auto pt-3">
              <TraceCanvas
                visual={v.visual}
                mode={v.type === "traceOrder" ? "order" : "first"}
                value={traceValue}
                onChange={(ids) => {
                  if (v.type === "traceOrder") setAnswer({ type: "order", ids });
                  else setAnswer(ids.length > 0 ? { type: "target", id: ids[ids.length - 1]! } : null);
                }}
                givenPrefix={v.type === "traceOrder" ? v.givenPrefix : 0}
                totalSteps={v.type === "traceOrder" ? v.answer.length : 1}
                checked={checked}
                expected={checked ? expectedTargets(v) : null}
                labelledBy={QUESTION_ID}
                view={traceView}
                onViewChange={onTraceView}
              />
            </div>
          ) : null}
        </div>
      </main>

      <AnswerDock
        announcement={checked ? verdictAnnouncement(v, correct, xp) : ""}
        verdict={
          checked ? (
            <VerdictStrip silent correct={correct} xp={xp} detail={verdictDetail(v, correct)} />
          ) : null
        }
        action={
          <>
            <Button
              size="lg"
              disabled={needsAnswer}
              aria-describedby={needsAnswer ? "dock-hint" : undefined}
              onClick={onPrimary}
            >
              {checked ? "Continue" : "Check"}
            </Button>
            {needsAnswer ? (
              <span id="dock-hint" className="sr-only">
                {REASON[v.type]}
              </span>
            ) : null}
          </>
        }
      >
        {v.type === "bigO" ? (
          <BigOPicker
            labelledBy={QUESTION_ID}
            choices={v.choices}
            selected={answer?.type === "bigO" ? answer.choice : null}
            verdict={
              checked ? { correct: v.answer, picked: answer?.type === "bigO" ? answer.choice : null } : null
            }
            onSelect={(choice) => setAnswer({ type: "bigO", choice })}
          />
        ) : null}
      </AnswerDock>
    </>
  );
}
