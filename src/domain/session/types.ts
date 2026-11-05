/**
 * CONTRACT between the session logic (Agent L) and the UI (Agent U). Sprint plan §4.4, design system §8.1.
 * Agent L implements `src/domain/session/*` (pure) and `src/stores/session.ts` (Zustand wrapper).
 * Agent U only READS `useSessionStore` and calls its actions. Do not change this file without the orchestrator.
 */
import type { Domain, Scenario, Validation } from "@/domain/content/schema";

export const SESSION_SIZE = 10;
/** Sprint 3: mini-validations (Big-O, trace first step, trace order) run after the scenario match:
 *  question -> verdict -> validation(s) -> explanation (feedback) -> next. */
export const VALIDATIONS_ENABLED = true;
export const XP_MATCH_CORRECT = 10;
export const XP_VALIDATION_CORRECT = 5;
export const XP_SESSION_COMPLETE = 20;

/** One question in a session. `optionOrder` is the option ids in DISPLAY order (shuffled per session, E3-05). */
export interface SessionItem {
  scenario: Scenario;
  optionOrder: string[];
}

/**
 * The user's answer to a validation.
 *  - `bigO`: the chosen complexity string, e.g. "O(log n)".
 *  - `target`: one node/cell id (trace first step).
 *  - `order`: target ids in tap order. The first `givenPrefix` ids are pre-filled by `initialAnswer` and locked.
 */
export type ValidationAnswer =
  | { type: "bigO"; choice: string }
  | { type: "target"; id: string }
  | { type: "order"; ids: string[] };

export interface ValidationResult {
  type: Validation["type"];
  correct: boolean;
  answer: ValidationAnswer;
  /** `order` only: per-position correctness (same length as the answer), for the "k of n in place" report. */
  positions?: boolean[];
  xp: number;
}

/** idle -> question -> (verdict is `checked: true`) -> validation(s) -> feedback -> (next) -> question ... -> summary. */
export type SessionStep =
  | { kind: "idle" }
  | { kind: "question"; selectedOptionId: string | null; checked: boolean }
  /** `index` is the position in `scenario.validations`. `checked: true` shows the verdict. */
  | { kind: "validation"; index: number; answer: ValidationAnswer | null; checked: boolean }
  | { kind: "feedback" }
  | { kind: "summary" };

export interface ItemResult {
  scenarioId: string;
  concept: string;
  domain: Domain;
  pickedOptionId: string;
  /** The scenario match was right. */
  correct: boolean;
  /** Match XP plus validation XP. */
  xp: number;
  /** One entry per validation answered, in order. Empty until the first is checked. */
  validations: ValidationResult[];
  durationMs: number;
}

export interface SessionSummary {
  total: number;
  correct: number;
  /** Includes the session-completion bonus. Already added to the profile XP by the store. */
  xpEarned: number;
  durationMs: number;
  results: ItemResult[];
  /** Practice sessions never change review dates or the streak (sprint plan §4.4). */
  practice: boolean;
  /** The user ended early from the [X] ConfirmSheet. Answers so far are saved. */
  endedEarly: boolean;
}

export interface SessionState {
  step: SessionStep;
  items: SessionItem[];
  /** Index of the current item in `items`. */
  index: number;
  results: ItemResult[];
  startedAt: number | null;
  practice: boolean;
  summary: SessionSummary | null;
}

export interface SessionActions {
  /** Compose and start a session (selector E3-05). Safe to call from Home's "Start session". */
  start: (options?: { practice?: boolean; count?: number }) => Promise<void>;
  /** Choose an option (ignored once checked). Selecting the selected option keeps it selected. */
  select: (optionId: string) => void;
  /** Commit the selection: records the result and the attempt (IndexedDB), shows the verdict. No-op without a selection. */
  check: () => void;
  /** After the match verdict: first validation if the scenario has any, else the explanation (`feedback`). */
  continueFromVerdict: () => void;
  /** During a validation step: set/replace the answer (ignored once checked). */
  setAnswer: (answer: ValidationAnswer | null) => void;
  /** Grade the answer (needs `isAnswerComplete`), record it on the item result and the attempt, show the verdict. */
  checkValidation: () => void;
  /** After a validation verdict: the next validation, or the explanation (`feedback`) after the last. */
  continueFromValidation: () => void;
  /** After the explanation: next question, or `summary` after the last one (awards XP once). */
  nextScenario: () => void;
  /** [X] -> ConfirmSheet -> End session: finish early with the answers so far (summary with endedEarly). */
  end: () => void;
  reset: () => void;
}

export type SessionStore = SessionState & SessionActions;

export const idleSession: SessionState = {
  step: { kind: "idle" },
  items: [],
  index: 0,
  results: [],
  startedAt: null,
  practice: false,
  summary: null,
};
