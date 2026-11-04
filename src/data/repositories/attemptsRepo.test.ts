import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initialProfile, useProfileStore } from "@/stores/profile";
import { DB_NAME, closeDb, getDb } from "../db";
import { attemptsRepo } from "./attemptsRepo";

async function wipe() {
  closeDb();
  await Dexie.delete(DB_NAME);
  useProfileStore.setState({ ...initialProfile });
}
beforeEach(wipe);
afterEach(wipe);

const base = { scenarioId: "dp-001", concept: "knapsack", domain: "dp", correct: true, durationMs: 1200, timestamp: 1000 };

describe("attemptsRepo", () => {
  it("writes a row with section 4.3 defaults", async () => {
    expect(await attemptsRepo.record(base)).toBe(true);
    const rows = await getDb().attempts.toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ ...base, validationResults: [], studied: false });
    expect(typeof rows[0].id).toBe("number");
  });

  it("allows explicit validationResults and studied", async () => {
    await attemptsRepo.record({ ...base, validationResults: [true, false], studied: true });
    expect(await getDb().attempts.toArray()).toMatchObject([{ validationResults: [true, false], studied: true }]);
  });

  it("lists by scenario oldest first, and counts", async () => {
    await attemptsRepo.record({ ...base, timestamp: 3 });
    await attemptsRepo.record({ ...base, timestamp: 1 });
    await attemptsRepo.record({ ...base, scenarioId: "dp-002", timestamp: 2 });
    expect((await attemptsRepo.listByScenario("dp-001")).map((r) => r.timestamp)).toEqual([1, 3]);
    expect(await attemptsRepo.count()).toBe(3);
  });

  it("skips silently when storage is blocked", async () => {
    useProfileStore.setState({ storageBlocked: true });
    expect(await attemptsRepo.record(base)).toBe(false);
    useProfileStore.setState({ storageBlocked: false });
    expect(await attemptsRepo.count()).toBe(0);
  });

  it("never throws when the database fails", async () => {
    const db = getDb();
    db.close();
    expect(await attemptsRepo.record(base)).toBe(false);
    expect(await attemptsRepo.listByScenario("x")).toEqual([]);
    expect(await attemptsRepo.count()).toBe(0);
  });
});
