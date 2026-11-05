import { useProfileStore } from "@/stores/profile";
import { getDb } from "../db";
import type { AttemptRow, AttemptValidation } from "../types";

export type NewAttempt = Omit<AttemptRow, "id" | "validationResults" | "studied"> &
  Partial<Pick<AttemptRow, "validationResults" | "studied">>;

export const attemptsRepo = {
  /** Writes one attempt row. Never throws; skipped silently when storage is blocked. Resolves to true if written. */
  async record(attempt: NewAttempt): Promise<boolean> {
    return (await attemptsRepo.add(attempt)) !== null;
  },

  /** Like `record`, but resolves to the new row id (null when skipped or failed). Never throws. */
  async add(attempt: NewAttempt): Promise<number | null> {
    if (useProfileStore.getState().storageBlocked) return null;
    try {
      return await getDb().attempts.add({ validationResults: [], studied: false, ...attempt });
    } catch {
      return null;
    }
  },

  /** Replaces `validationResults` of an existing row. Never throws; true if a row was updated. */
  async updateValidations(id: number, validationResults: AttemptValidation[]): Promise<boolean> {
    if (useProfileStore.getState().storageBlocked) return false;
    try {
      return (await getDb().attempts.update(id, { validationResults })) === 1;
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
