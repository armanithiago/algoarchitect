/** Row types for the local IndexedDB model (sprint plan §4.3). Pure types, no runtime code. */

export type CodeLanguage = "pseudo" | "cs";

export interface ProfileSettingsRow {
  haptics: boolean;
  analytics: boolean;
  codeLanguage: CodeLanguage;
}

/** Key `scenarioId`. SM-2 variant state (§4.4). */
export interface ReviewRow {
  scenarioId: string;
  easiness: number;
  intervalDays: number;
  repetitions: number;
  /** Epoch milliseconds. */
  dueAt: number;
  lapses: number;
  lastResult: "correct" | "wrong" | null;
}

/** One answered mini-validation (Sprint 3). `positions` is set for traceOrder only. */
export interface AttemptValidation {
  type: "bigO" | "traceFirstStep" | "traceOrder";
  correct: boolean;
  positions?: boolean[];
}

/** Auto-increment `id`. Indexed on scenarioId, concept, domain, timestamp. */
export interface AttemptRow {
  id?: number;
  scenarioId: string;
  concept: string;
  domain: string;
  correct: boolean;
  /** One entry per validation answered. Rows written before Sprint 3 may hold plain booleans (true = passed). */
  validationResults: Array<boolean | AttemptValidation>;
  /** The user opened Study before checking. */
  studied: boolean;
  durationMs: number;
  /** Epoch milliseconds. */
  timestamp: number;
}

/** Singleton, key `'me'`. */
export interface ProfileRow {
  id: "me";
  xp: number;
  level: number;
  streakCount: number;
  longestStreak: number;
  /** "YYYY-MM-DD" in the device's local calendar, or null. */
  lastActiveLocalDate: string | null;
  freezesAvailable: number;
  settings: ProfileSettingsRow;
}

/** Auto-increment `id`. Analytics events waiting for a flush when online. */
export interface EventQueueRow {
  id?: number;
  name: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

/** Key `chapterId`. */
export interface ReadingRow {
  chapterId: string;
  lastSectionId: string | null;
  sectionsRead: string[];
  scrollPct: number;
  /** Epoch milliseconds. */
  updatedAt: number;
}

/** Key/value store. Known keys are typed in `MetaValues`. */
export interface MetaRow {
  key: string;
  value: unknown;
}

export interface MetaValues {
  schemaVersion: number;
  /** Null until the content bundle exists. */
  contentVersion: string | null;
  /** ISO 8601 timestamp of the first run. */
  installedAt: string;
}
