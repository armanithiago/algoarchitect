/**
 * Session state machine (E3-02). Pure functions: no React, Zustand or IndexedDB. Time comes from the `now`
 * argument. Invalid transitions return the SAME state object (never throw), so callers can detect a no-op.
 * VALIDATIONS_ENABLED is false in Sprint 2: there are no validation steps (Sprint 3 adds them here).
 */
import {
  XP_MATCH_CORRECT,
  XP_SESSION_COMPLETE,
  idleSession,
  type ItemResult,
  type SessionItem,
  type SessionState,
  type SessionSummary,
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
    durationMs: Math.max(0, now - (s.questionStartedAt ?? now)),
  };
  return { ...s, step: { kind: "question", selectedOptionId: s.step.selectedOptionId, checked: true }, results: [...s.results, result] };
}

export function continueFromVerdict(s: MachineState): MachineState {
  if (s.step.kind !== "question" || !s.step.checked) return s;
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
  if (s.step.kind !== "question" && s.step.kind !== "feedback") return s;
  return { ...s, step: { kind: "summary" }, summary: summarize(s, now, true), questionStartedAt: null };
}
