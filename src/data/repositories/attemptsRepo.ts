import { useProfileStore } from "@/stores/profile";
import { getDb } from "../db";
import type { AttemptRow } from "../types";

export type NewAttempt = Omit<AttemptRow, "id" | "validationResults" | "studied"> &
  Partial<Pick<AttemptRow, "validationResults" | "studied">>;

export const attemptsRepo = {
  /** Writes one attempt row. Never throws; skipped silently when storage is blocked. Resolves to true if written. */
  async record(attempt: NewAttempt): Promise<boolean> {
    if (useProfileStore.getState().storageBlocked) return false;
    try {
      await getDb().attempts.add({ validationResults: [], studied: false, ...attempt });
      return true;
    } catch {
      return false;
    }
  },

  /** Attempts for one scenario, oldest first. Returns [] when storage fails. */
  async listByScenario(scenarioId: string): Promise<AttemptRow[]> {
    try {
      return await getDb().attempts.where("scenarioId").equals(scenarioId).sortBy("timestamp");
    } catch {
      return [];
    }
  },

  async count(): Promise<number> {
    try {
      return await getDb().attempts.count();
    } catch {
      return 0;
    }
  },
};
