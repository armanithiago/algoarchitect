import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DB_NAME, closeDb, getDb } from "@/data/db";
import { resetContentCacheForTests } from "@/domain/content/loader";
import { SESSION_SIZE, XP_MATCH_CORRECT, XP_SESSION_COMPLETE } from "@/domain/session/types";
import { initialProfile, useProfileStore } from "./profile";
import { resetSessionForTests, useSessionStore } from "./session";
import { useToastStore } from "@/ui/components/Toast/useToastStore";

const s = () => useSessionStore.getState();
const flush = () => new Promise((r) => setTimeout(r, 20));

async function wipe() {
  closeDb();
  await Dexie.delete(DB_NAME);
  useProfileStore.setState({ ...initialProfile, hydrated: true });
  useToastStore.getState().reset();
  resetSessionForTests();
  resetContentCacheForTests();
}
beforeEach(wipe);
afterEach(async () => {
  vi.restoreAllMocks();
  await wipe();
});

/** Answers the current question with the correct option if `right`, else a wrong one. */
function answer(right: boolean) {
  const item = s().items[s().index];
  const wrong = item.optionOrder.find((id) => id !== item.scenario.correctOptionId) as string;
  s().select(right ? item.scenario.correctOptionId : wrong);
  s().check();
  s().continueFromVerdict();
}

describe("session store", () => {
  it("starts idle", () => {
    expect(s().step.kind).toBe("idle");
    expect(s().loadError).toBeNull();
  });

  it("start loads, composes and suspends toasts", async () => {
    await s().start();
    expect(s().step).toEqual({ kind: "question", selectedOptionId: null, checked: false });
    expect(s().items.length).toBeGreaterThan(0);
    expect(s().items.length).toBeLessThanOrEqual(SESSION_SIZE);
    expect(s().practice).toBe(false);
    expect(useToastStore.getState().suspended).toBe(true);
  });

  it("honours practice and count", async () => {
    await s().start({ practice: true, count: 2 });
    expect(s().practice).toBe(true);
    expect(s().items).toHaveLength(2);
  });

  it("sets loadError and stays idle when content is invalid", async () => {
    vi.resetModules();
    vi.doMock("@/content/scenarios.v1.json", () => ({ default: { schema: 1, contentVersion: 1, scenarios: [{ id: "x" }] } }));
    const { useSessionStore: fresh } = await import("./session");
    await fresh.getState().start();
    expect(fresh.getState().step.kind).toBe("idle");
    expect(fresh.getState().loadError).toMatch(/invalid/i);
    expect(useToastStore.getState().suspended).toBe(false);
    fresh.getState().reset();
    expect(fresh.getState().loadError).toBeNull();
    vi.doUnmock("@/content/scenarios.v1.json");
  });

  it("a full session writes one attempt per Check and awards XP exactly once", async () => {
    await s().start({ count: 3 });
    answer(true);
    s().nextScenario();
    answer(false);
    s().nextScenario();
    answer(true);
    s().nextScenario();
    expect(s().step.kind).toBe("summary");
    const sum = s().summary;
    expect(sum).toMatchObject({ total: 3, correct: 2, endedEarly: false, xpEarned: 2 * XP_MATCH_CORRECT + XP_SESSION_COMPLETE });
    expect(useProfileStore.getState().xp).toBe(sum?.xpEarned);
    expect(useToastStore.getState().suspended).toBe(false);

    // repeated taps / re-entry must not pay again
    s().nextScenario();
    s().end();
    s().continueFromVerdict();
    expect(useProfileStore.getState().xp).toBe(sum?.xpEarned);

    await flush();
    const rows = await getDb().attempts.toArray();
    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.correct)).toEqual([true, false, true]);
    expect(rows[0]).toMatchObject({ validationResults: [], studied: false });
    expect(rows[0].scenarioId).toBe(sum?.results[0].scenarioId);
  });

  it("double Check records one attempt", async () => {
    await s().start({ count: 2 });
    s().select(s().items[0].optionOrder[0]);
    s().check();
    s().check();
    await flush();
    expect(await getDb().attempts.count()).toBe(1);
  });

  it("check without a selection records nothing", async () => {
    await s().start({ count: 2 });
    s().check();
    await flush();
    expect(await getDb().attempts.count()).toBe(0);
    expect(s().results).toHaveLength(0);
  });

  it("end finishes early: no bonus, answers kept, XP for correct only, toasts resume", async () => {
    await s().start({ count: 3 });
    answer(true);
    s().end();
    expect(s().summary).toMatchObject({ endedEarly: true, total: 1, xpEarned: XP_MATCH_CORRECT });
    expect(useProfileStore.getState().xp).toBe(XP_MATCH_CORRECT);
    expect(useToastStore.getState().suspended).toBe(false);
    s().end();
    expect(useProfileStore.getState().xp).toBe(XP_MATCH_CORRECT);
  });

  it("ending with zero answers awards nothing", async () => {
    await s().start({ count: 2 });
    s().end();
    expect(useProfileStore.getState().xp).toBe(0);
  });

  it("a second session awards again (restart)", async () => {
    for (let i = 0; i < 2; i++) {
      await s().start({ count: 1 });
      answer(true);
      s().nextScenario();
    }
    expect(useProfileStore.getState().xp).toBe(2 * (XP_MATCH_CORRECT + XP_SESSION_COMPLETE));
  });

  it("does not record attempts when storage is blocked, but the session still works", async () => {
    useProfileStore.setState({ storageBlocked: true });
    await s().start({ count: 1 });
    answer(true);
    s().nextScenario();
    await flush();
    expect(s().step.kind).toBe("summary");
    useProfileStore.setState({ storageBlocked: false });
    expect(await getDb().attempts.count()).toBe(0);
  });

  it("reset returns to idle and releases toasts", async () => {
    await s().start();
    s().reset();
    expect(s().step.kind).toBe("idle");
    expect(s().items).toEqual([]);
    expect(useToastStore.getState().suspended).toBe(false);
  });

  it("reset during a slow start wins over the late result", async () => {
    const p = s().start();
    s().reset();
    await p;
    expect(s().step.kind).toBe("idle");
  });

  it("select after check is ignored and the selection is changeable before", async () => {
    await s().start({ count: 1 });
    const [a, b] = s().items[0].optionOrder;
    s().select(a);
    s().select(b);
    expect(s().step).toMatchObject({ selectedOptionId: b });
    s().check();
    s().select(a);
    expect(s().step).toMatchObject({ selectedOptionId: b, checked: true });
  });
});
