/**
 * CONTRACT: `useSessionStore` implements `SessionStore` from src/domain/session/types.ts.
 * Thin Zustand wrapper over the pure machine (src/domain/session/machine.ts). Side effects live here:
 * content loading, attempt rows, the one-time XP award and toast suspension. Actions never throw.
 */
import { create } from "zustand";
import { attemptsRepo } from "@/data/repositories/attemptsRepo";
import { loadScenarios } from "@/domain/content/loader";
import * as machine from "@/domain/session/machine";
import { composeSession } from "@/domain/session/selector";
import { SESSION_SIZE, type SessionStore, type SessionSummary } from "@/domain/session/types";
import { useToastStore } from "@/ui/components/Toast/useToastStore";
import { useProfileStore } from "./profile";

/** Extra (non-contract) fields. Optional for readers; the UI may show `loadError` on Home. */
export interface SessionExtras {
  /** Set when `start()` failed (invalid or missing content). Cleared by the next `start()` / `reset()`. */
  loadError?: string | null;
  /** Clock mark for the current question (see MachineState). */
  questionStartedAt: number | null;
}

type Store = SessionStore & SessionExtras;

const now = () => Date.now();
const idle = { ...machine.idleMachine, loadError: null };

/** Summary objects already paid out. Guards against a double award (double tap, StrictMode, re-entry). */
let awarded = new WeakSet<SessionSummary>();
/** Increments on every start/reset so a slow `start()` cannot overwrite a newer state. */
let generation = 0;

const setToasts = (suspended: boolean) => useToastStore.getState().setSuspended(suspended);

export const useSessionStore = create<Store>()((set, get) => {
  /** Applies a machine result; on first arrival at a summary awards XP once and releases the toasts. */
  const apply = (next: machine.MachineState) => {
    if (next === (get() as machine.MachineState)) return;
    set(next);
    const summary = next.summary;
    if (next.step.kind === "summary" && summary && !awarded.has(summary)) {
      awarded.add(summary);
      setToasts(false);
      if (summary.xpEarned > 0) useProfileStore.getState().addXp(summary.xpEarned);
    }
  };
  const current = (): machine.MachineState => get();

  return {
    ...idle,

    start: async (options) => {
      const gen = ++generation;
      try {
        const scenarios = await loadScenarios();
        if (gen !== generation) return;
        const items = composeSession({ scenarios, count: options?.count ?? SESSION_SIZE, rng: Math.random });
        if (items.length === 0) throw new Error("No scenarios available");
        set({ ...machine.startMachine(items, { practice: options?.practice ?? false, now: now() }), loadError: null });
        setToasts(true);
      } catch (e) {
        if (gen !== generation) return;
        setToasts(false);
        set({ ...machine.idleMachine, loadError: e instanceof Error ? e.message : String(e) });
      }
    },

    select: (optionId) => apply(machine.select(current(), optionId)),

    check: () => {
      const before = current();
      const next = machine.check(before, now());
      if (next === before) return;
      apply(next);
      const r = next.results[next.results.length - 1];
      if (r) {
        void attemptsRepo.record({
          scenarioId: r.scenarioId,
          concept: r.concept,
          domain: r.domain,
          correct: r.correct,
          durationMs: r.durationMs,
          timestamp: now(),
        });
      }
    },

    // PLACEHOLDERS (Sprint 3): Agent L implements validation steps in the machine and wires these.
    setAnswer: () => {},
    checkValidation: () => {},
    continueFromValidation: () => {},
    continueFromVerdict: () => apply(machine.continueFromVerdict(current())),
    nextScenario: () => apply(machine.nextScenario(current(), now())),
    end: () => apply(machine.end(current(), now())),

    reset: () => {
      generation++;
      setToasts(false);
      set({ ...idle });
    },
  };
});

/** Test helper: back to idle and forget paid-out summaries. */
export function resetSessionForTests(): void {
  generation++;
  awarded = new WeakSet();
  useSessionStore.setState({ ...idle });
}
