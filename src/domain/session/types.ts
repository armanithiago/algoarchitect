/**
 * CONTRACT between the session logic (Agent L) and the UI (Agent U). Sprint plan §4.4, design system §8.1.
 * Agent L implements `src/domain/session/*` (pure) and `src/stores/session.ts` (Zustand wrapper).
 * Agent U only READS `useSessionStore` and calls its actions. Do not change this file without the orchestrator.
 */
import type { Domain, Scenario } from "@/domain/content/schema";

export const SESSION_SIZE = 10;
/** Sprint 3 turns this on: mini-validations (Big-O, trace) after the scenario match. In Sprint 2 the flow is
 *  question -> verdict -> explanation (feedback) -> next. */
export const VALIDATIONS_ENABLED = false;
export const XP_MATCH_CORRECT = 10;
export const XP_SESSION_COMPLETE = 20;

/** One question in a session. `optionOrder` is the option ids in DISPLAY order (shuffled per session, E3-05). */
export interface SessionItem {
  scenario: Scenario;
  optionOrder: string[];
}

/** idle -> question -> (verdict is `checked: true`) -> feedback -> (next) -> question ... -> summary. */
export type SessionStep =
  | { kind: "idle" }
  | { kind: "question"; selectedOptionId: string | null; checked: boolean }
  | { kind: "feedback" }
  | { kind: "summary" };

export interface ItemResult {
  scenarioId: string;
  concept: string;
  domain: Domain;
  pickedOptionId: string;
  correct: boolean;
  xp: number;
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
  /** After the verdict: open the explanation (`feedback`). */
  continueFromVerdict: () => void;
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
