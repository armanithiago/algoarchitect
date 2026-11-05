/**
 * TEST HELPER (not imported by app code): drives the UI with a small in-memory implementation of the
 * SessionStore contract, so screens are tested against the types and not against the real store.
 */
import bundle from "@/content/scenarios.v1.json";
import { ScenarioBundleSchema, type Scenario } from "@/domain/content/schema";
import { gradeValidation, initialAnswer, isAnswerComplete } from "@/domain/session/validation";
import {
  idleSession,
  XP_VALIDATION_CORRECT,
  XP_MATCH_CORRECT,
  XP_SESSION_COMPLETE,
  type SessionItem,
  type SessionStore,
} from "@/domain/session/types";
import { useSessionStore } from "@/stores/session";

export const seedScenarios: Scenario[] = ScenarioBundleSchema.parse(bundle).scenarios;

/** `optionOrder` = authored order unless given (the wrong-pick tests want a known display order). */
export function makeItems(count: number, order?: string[]): SessionItem[] {
  return seedScenarios.slice(0, count).map((scenario) => ({
    scenario,
    optionOrder: order ?? scenario.options.map((o) => o.id),
  }));
}

/** Replaces the store with a working fake of the contract and starts on item 0. */
export function installFakeSession(
  items: SessionItem[],
  opts: {
    practice?: boolean;
    /** false: skip the validation steps (match -> explanation). Default true, as the contract. */ validations?: boolean;
  } = {},
): void {
  const withValidations = opts.validations ?? true;
  const set = useSessionStore.setState;
  const get = useSessionStore.getState;
  const actions: Pick<
    SessionStore,
    | "start"
    | "select"
    | "check"
    | "continueFromVerdict"
    | "setAnswer"
    | "checkValidation"
    | "continueFromValidation"
    | "nextScenario"
    | "end"
    | "reset"
  > = {
    start: async () => {},
    setAnswer: (answer) => {
      const s = get().step;
      if (s.kind === "validation" && !s.checked) set({ step: { ...s, answer } });
    },
    checkValidation: () => {
      const s = get().step;
      const it = get().items[get().index];
      const v = it?.scenario.validations[s.kind === "validation" ? s.index : -1];
      if (s.kind !== "validation" || s.checked || !it || !v || !isAnswerComplete(v, s.answer) || !s.answer)
        return;
      const grade = gradeValidation(v, s.answer);
      const xp = grade.correct ? XP_VALIDATION_CORRECT : 0;
      const results = get().results.map((r) =>
        r.scenarioId === it.scenario.id
          ? {
              ...r,
              xp: r.xp + xp,
              validations: [
                ...r.validations,
                { type: v.type, correct: grade.correct, answer: s.answer!, positions: grade.positions, xp },
              ],
            }
          : r,
      );
      set({ step: { ...s, checked: true }, results });
    },
    continueFromValidation: () => {
      const s = get().step;
      const it = get().items[get().index];
      if (s.kind !== "validation" || !s.checked || !it) return;
      const next = it.scenario.validations[s.index + 1];
      set({
        step: next
          ? { kind: "validation", index: s.index + 1, answer: initialAnswer(next), checked: false }
          : { kind: "feedback" },
      });
    },
    select: (optionId) => {
      const s = get().step;
      if (s.kind === "question" && !s.checked)
        set({ step: { kind: "question", selectedOptionId: optionId, checked: false } });
    },
    check: () => {
      const s = get().step;
      if (s.kind !== "question" || s.checked || s.selectedOptionId === null) return;
      const { scenario } = get().items[get().index]!;
      const correct = s.selectedOptionId === scenario.correctOptionId;
      set({
        step: { ...s, checked: true },
        results: [
          ...get().results,
          {
            scenarioId: scenario.id,
            concept: scenario.concept,
            domain: scenario.domain,
            pickedOptionId: s.selectedOptionId,
            correct,
            xp: correct ? XP_MATCH_CORRECT : 0,
            validations: [],
            durationMs: 4000,
          },
        ],
      });
    },
    continueFromVerdict: () => {
      if (get().step.kind !== "question") return;
      const first = withValidations ? get().items[get().index]?.scenario.validations[0] : undefined;
      set({
        step: first
          ? { kind: "validation", index: 0, answer: initialAnswer(first), checked: false }
          : { kind: "feedback" },
      });
    },
    nextScenario: () => {
      if (get().step.kind !== "feedback") return;
      const next = get().index + 1;
      if (next < get().items.length) {
        set({ index: next, step: { kind: "question", selectedOptionId: null, checked: false } });
      } else {
        get().end();
      }
    },
    end: () => {
      const { results } = get();
      const correct = results.filter((r) => r.correct).length;
      set({
        step: { kind: "summary" },
        summary: {
          total: results.length,
          correct,
          xpEarned: correct * XP_MATCH_CORRECT + XP_SESSION_COMPLETE,
          durationMs: 278_000,
          results,
          practice: get().practice,
          endedEarly: get().index + 1 < get().items.length || get().step.kind === "question",
        },
      });
    },
    reset: () => set({ ...idleSession }),
  };
  set({
    ...idleSession,
    ...actions,
    items,
    index: 0,
    practice: opts.practice ?? false,
    startedAt: 0,
    step: { kind: "question", selectedOptionId: null, checked: false },
  });
}

export function resetSession(): void {
  useSessionStore.setState({ ...idleSession });
}
