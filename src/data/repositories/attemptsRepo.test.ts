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
    await attemptsRepo.record({ ...base, validationResults: [{ type: "bigO", correct: true }], studied: true });
    expect(await getDb().attempts.toArray()).toMatchObject([{ validationResults: [{ type: "bigO", correct: true }], studied: true }]);
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

  it("add returns the id and updateValidations replaces the results", async () => {
    const id = await attemptsRepo.add(base);
    expect(typeof id).toBe("number");
    const results = [{ type: "traceOrder" as const, correct: false, positions: [true, false, true] }];
    expect(await attemptsRepo.updateValidations(id as number, results)).toBe(true);
    expect((await getDb().attempts.toArray())[0].validationResults).toEqual(results);
    expect(await attemptsRepo.updateValidations(9999, results)).toBe(false);
  });

  it("add/updateValidations skip when blocked and never throw on failure", async () => {
    const id = (await attemptsRepo.add(base)) as number;
    useProfileStore.setState({ storageBlocked: true });
    expect(await attemptsRepo.add(base)).toBeNull();
    expect(await attemptsRepo.updateValidations(id, [])).toBe(false);
    useProfileStore.setState({ storageBlocked: false });
    getDb().close();
    expect(await attemptsRepo.updateValidations(id, [])).toBe(false);
  });
});
