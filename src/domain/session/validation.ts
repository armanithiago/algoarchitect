/** Pure grading for mini-validations (Sprint 3). Shared by the machine (logic) and the screens (Check enabled?). */
import type { Validation } from "@/domain/content/schema";
import type { ValidationAnswer } from "./types";

/** The answer a validation starts with: `order` pre-fills (and locks) the first `givenPrefix` expected ids. */
export function initialAnswer(v: Validation): ValidationAnswer | null {
  if (v.type === "traceOrder") return { type: "order", ids: v.answer.slice(0, v.givenPrefix) };
  return null;
}

/** Can the user press Check? bigO/target need a choice; order needs every position filled. */
export function isAnswerComplete(v: Validation, a: ValidationAnswer | null): boolean {
  if (!a) return false;
  if (v.type === "bigO") return a.type === "bigO" && v.choices.includes(a.choice);
  if (v.type === "traceFirstStep") return a.type === "target" && a.id.length > 0;
  return a.type === "order" && a.ids.length === v.answer.length && new Set(a.ids).size === a.ids.length;
}

export interface Grade {
  correct: boolean;
  /** `traceOrder` only: whether each position matches the expected sequence. */
  positions?: boolean[];
}

/** A wrong-typed or incomplete answer grades as incorrect (never throws). */
export function gradeValidation(v: Validation, a: ValidationAnswer | null): Grade {
  if (!a) return { correct: false };
  if (v.type === "bigO") return { correct: a.type === "bigO" && a.choice === v.answer };
  if (v.type === "traceFirstStep") return { correct: a.type === "target" && a.id === v.answerTargetId };
  if (a.type !== "order") return { correct: false, positions: v.answer.map(() => false) };
  const positions = v.answer.map((id, i) => a.ids[i] === id);
  return { correct: positions.every(Boolean) && a.ids.length === v.answer.length, positions };
}

/** The ids the UI reveals after Check: bigO has none; first step is one id; order is the full sequence. */
export function expectedTargets(v: Validation): string[] {
  if (v.type === "traceFirstStep") return [v.answerTargetId];
  if (v.type === "traceOrder") return v.answer;
  return [];
}
