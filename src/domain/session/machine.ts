/**
 * Session state machine (E3-02). Pure functions: no React, Zustand or IndexedDB. Time comes from the `now`
 * argument. Invalid transitions return the SAME state object (never throw), so callers can detect a no-op.
 * Sprint 3: mini-validation steps run between the match verdict and the explanation.
 */
import type { Validation } from "@/domain/content/schema";
import { gradeValidation, initialAnswer, isAnswerComplete } from "./validation";
import {
  VALIDATIONS_ENABLED,
  XP_MATCH_CORRECT,
  XP_VALIDATION_CORRECT,
  XP_SESSION_COMPLETE,
  idleSession,
  type ItemResult,
  type SessionItem,
  type SessionState,
  type SessionSummary,
  type ValidationAnswer,
  type ValidationResult,
} from "./types";

/** The contract state plus the clock mark for the current question (the contract has no field for it). */
export interface MachineState extends SessionState {
  /** When the current question appeared (epoch ms), or null outside a question. */
  questionStartedAt: number | null;
}

export const idleMachine: MachineState = { ...idleSession, questionStartedAt: null };

const firstQuestion = { kind: "question", selectedOptionId: null, checked: false } as const;

export function startMachine(items: SessionItem[], opts: { practice: boolean; now: number }): MachineState {
  if (items.length === 0) return idleMachine;
  return {
    step: { ...firstQuestion },
    items,
    index: 0,
    results: [],
    startedAt: opts.now,
    practice: opts.practice,
    summary: null,
    questionStartedAt: opts.now,
  };
}

export function select(s: MachineState, optionId: string): MachineState {
  if (s.step.kind !== "question" || s.step.checked) return s;
  const item = s.items[s.index];
  if (!item || !item.optionOrder.includes(optionId)) return s;
  return { ...s, step: { kind: "question", selectedOptionId: optionId, checked: false } };
}

/** Records the ItemResult for the current question and shows the verdict. No-op without a selection. */
export function check(s: MachineState, now: number): MachineState {
  if (s.step.kind !== "question" || s.step.checked || s.step.selectedOptionId === null) return s;
  const item = s.items[s.index];
  if (!item) return s;
  const correct = s.step.selectedOptionId === item.scenario.correctOptionId;
  const result: ItemResult = {
    scenarioId: item.scenario.id,
    concept: item.scenario.concept,
    domain: item.scenario.domain,
    pickedOptionId: s.step.selectedOptionId,
    correct,
    xp: correct ? XP_MATCH_CORRECT : 0,
    validations: [],
    durationMs: Math.max(0, now - (s.questionStartedAt ?? now)),
  };
  return { ...s, step: { kind: "question", selectedOptionId: s.step.selectedOptionId, checked: true }, results: [...s.results, result] };
}

export function continueFromVerdict(s: MachineState): MachineState {
  if (s.step.kind !== "question" || !s.step.checked) return s;
  const v = validationsOf(s)[0];
  if (VALIDATIONS_ENABLED && v) return { ...s, step: { kind: "validation", index: 0, answer: initialAnswer(v), checked: false } };
  return { ...s, step: { kind: "feedback" } };
}

function validationsOf(s: MachineState): Validation[] {
  return s.items[s.index]?.scenario.validations ?? [];
}

/** The ids a visual contains (graph nodes or array cells). */
function visualIds(v: Validation): string[] {
  if (v.type === "bigO") return [];
  return v.visual.kind === "array" ? v.visual.cells.map((c) => c.id) : v.visual.nodes.map((n) => n.id);
}

/** Returns the answer if it is acceptable for `v`, else undefined. Never throws. */
function sanitize(v: Validation, a: ValidationAnswer): ValidationAnswer | undefined {
  if (v.type === "bigO") return a.type === "bigO" && v.choices.includes(a.choice) ? a : undefined;
  if (v.type === "traceFirstStep") return a.type === "target" && visualIds(v).includes(a.id) ? a : undefined;
  if (a.type !== "order" || !Array.isArray(a.ids)) return undefined;
  const known = visualIds(v);
  const prefix = v.answer.slice(0, v.givenPrefix);
  const ok =
    a.ids.length <= v.answer.length &&
    prefix.every((id, i) => a.ids[i] === id) &&
    new Set(a.ids).size === a.ids.length &&
    a.ids.every((id) => known.includes(id));
  return ok ? a : undefined;
}

/** Sets or replaces the answer of an unchecked validation. Invalid answers are ignored; null clears. */
export function setAnswer(s: MachineState, answer: ValidationAnswer | null): MachineState {
  if (s.step.kind !== "validation" || s.step.checked) return s;
  const v = validationsOf(s)[s.step.index];
  if (!v) return s;
  const next = answer === null ? initialAnswer(v) : sanitize(v, answer);
  if (next === undefined) return s;
  return { ...s, step: { kind: "validation", index: s.step.index, answer: next, checked: false } };
}

/** Grades a complete answer, records it on the item result (and its XP) and shows the verdict. */
export function checkValidation(s: MachineState): MachineState {
  if (s.step.kind !== "validation" || s.step.checked) return s;
  const v = validationsOf(s)[s.step.index];
  const answer = s.step.answer;
  const last = s.results[s.results.length - 1];
  if (!v || !answer || !last || !isAnswerComplete(v, answer)) return s;
  const grade = gradeValidation(v, answer);
  const result: ValidationResult = {
    type: v.type,
    correct: grade.correct,
    answer,
    ...(grade.positions ? { positions: grade.positions } : {}),
    xp: grade.correct ? XP_VALIDATION_CORRECT : 0,
  };
  const updated: ItemResult = { ...last, xp: last.xp + result.xp, validations: [...last.validations, result] };
  return {
    ...s,
    results: [...s.results.slice(0, -1), updated],
    step: { kind: "validation", index: s.step.index, answer, checked: true },
  };
}

/** After a checked validation: the next one, or the explanation after the last. */
export function continueFromValidation(s: MachineState): MachineState {
  if (s.step.kind !== "validation" || !s.step.checked) return s;
  const next = s.step.index + 1;
  const v = validationsOf(s)[next];
  if (v) return { ...s, step: { kind: "validation", index: next, answer: initialAnswer(v), checked: false } };
  return { ...s, step: { kind: "feedback" } };
}

function summarize(s: MachineState, now: number, endedEarly: boolean): SessionSummary {
  const xp = s.results.reduce((sum, r) => sum + r.xp, 0);
  return {
    total: s.results.length,
    correct: s.results.filter((r) => r.correct).length,
    xpEarned: xp + (endedEarly ? 0 : XP_SESSION_COMPLETE),
    durationMs: Math.max(0, now - (s.startedAt ?? now)),
    results: s.results,
    practice: s.practice,
    endedEarly,
  };
}

export function nextScenario(s: MachineState, now: number): MachineState {
  if (s.step.kind !== "feedback") return s;
  if (s.index + 1 >= s.items.length) {
    return { ...s, step: { kind: "summary" }, summary: summarize(s, now, false), questionStartedAt: null };
  }
  return { ...s, index: s.index + 1, step: { ...firstQuestion }, questionStartedAt: now };
}

/** Finish early from any in-progress step. Keeps the answers so far, no completion bonus. */
export function end(s: MachineState, now: number): MachineState {
  if (s.step.kind !== "question" && s.step.kind !== "validation" && s.step.kind !== "feedback") return s;
  return { ...s, step: { kind: "summary" }, summary: summarize(s, now, true), questionStartedAt: null };
}
