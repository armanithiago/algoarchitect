/** Copy for validation steps (design system §1.4, §8.5, §8.6, §8.14): verdict details, announcements, "Your checks" rows. */
import type { ReactNode } from "react";
import type { Validation, Visual } from "@/domain/content/schema";
import type { ValidationResult } from "@/domain/session/types";
import { Complexity, parseComplexity } from "@/ui/components/Complexity";

type Order = Extract<Validation, { type: "traceOrder" }>;

/** The label shown on a node or cell (falls back to the id). */
export function targetLabel(visual: Visual, id: string): string {
  if (visual.kind === "array") return visual.cells.find((c) => c.id === id)?.label ?? id;
  return visual.nodes.find((n) => n.id === id)?.label ?? id;
}

const spokenOf = (c: string) => parseComplexity(c)?.spoken ?? c;

const Seq = ({ children }: { children: ReactNode }) => (
  <span className="notation text-mono text-fg">{children}</span>
);

function labelsOf(v: Order, ids: readonly string[]): string[] {
  return ids.map((id) => targetLabel(v.visual, id));
}

/** "Y B D A E C" for the wrong-order verdict (at most 8 targets of 3 characters: 38 characters with the prefix). */
function orderWords(v: Order): string {
  return labelsOf(v, v.answer).join(" ");
}

/** The one-line detail under the verdict title. */
export function verdictDetail(v: Validation, correct: boolean): ReactNode {
  if (v.type === "bigO") {
    return correct ? (
      <>
        <Complexity value={v.answer} />.
      </>
    ) : (
      <>
        It&apos;s <Complexity value={v.answer} />.
      </>
    );
  }
  if (v.type === "traceFirstStep") {
    const label = targetLabel(v.visual, v.answerTargetId);
    return correct ? `${label} is the first step.` : `The first step is ${label}.`;
  }
  if (correct) return <Seq>{labelsOf(v, v.answer).join(" → ")}</Seq>;
  return <Seq>{`Order: ${orderWords(v)}`}</Seq>;
}

/** Text for the polite live region after Check. */
export function verdictAnnouncement(v: Validation, correct: boolean, xp: number): string {
  const lead = correct ? "Correct." : "Not quite.";
  const plus = xp > 0 ? ` Plus ${xp} XP.` : "";
  if (v.type === "bigO") return `${lead} ${correct ? "" : "It's "}${spokenOf(v.answer)}.${plus}`;
  if (v.type === "traceFirstStep") {
    const label = targetLabel(v.visual, v.answerTargetId);
    return `${lead} ${correct ? `${label} is the first step.` : `The first step is ${label}.`}${plus}`;
  }
  return `${lead} ${correct ? labelsOf(v, v.answer).join(", then ") : `Order: ${orderWords(v)}`}.${plus}`;
}

/** Row text for "Your checks" (design system §7.8, §8.7). */
export function checkRowLabel(v: Validation, result: ValidationResult): ReactNode {
  if (v.type === "bigO") {
    return (
      <>
        Big-O: <Complexity value={v.answer} />
      </>
    );
  }
  if (v.type === "traceFirstStep") {
    return `Trace first step: ${result.correct ? targetLabel(v.visual, v.answerTargetId) : "missed"}`;
  }
  if (result.correct) {
    return (
      <>
        Trace order: <Seq>{labelsOf(v, v.answer).join(" → ")}</Seq>
      </>
    );
  }
  const inPlace = (result.positions ?? []).filter(Boolean).length;
  return `Trace order: ${inPlace} of ${v.answer.length} in place`;
}
