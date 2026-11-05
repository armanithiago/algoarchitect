import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DB_NAME, closeDb, getDb } from "@/data/db";
import { resetContentCacheForTests } from "@/domain/content/loader";
import type { Validation } from "@/domain/content/schema";
import { expectedTargets } from "@/domain/session/validation";
import { SESSION_SIZE, XP_MATCH_CORRECT, XP_SESSION_COMPLETE, XP_VALIDATION_CORRECT, type ValidationAnswer } from "@/domain/session/types";
import { initialProfile, useProfileStore } from "./profile";
import { flushAttemptWrites, resetSessionForTests, useSessionStore } from "./session";
import { useToastStore } from "@/ui/components/Toast/useToastStore";

const s = () => useSessionStore.getState();
const flush = async () => {
  await flushAttemptWrites();
};

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
  // Sprint 3: play every validation (right/wrong) before the explanation
  while (s().step.kind === "validation") {
    const st = s().step as { index: number };
    const v = s().items[s().index].scenario.validations[st.index];
    s().setAnswer(right ? rightAnswer(v) : wrongAnswer(v));
    s().checkValidation();
    s().continueFromValidation();
  }
}

function rightAnswer(v: Validation): ValidationAnswer {
  if (v.type === "bigO") return { type: "bigO", choice: v.answer };
  if (v.type === "traceFirstStep") return { type: "target", id: v.answerTargetId };
  return { type: "order", ids: expectedTargets(v) };
}
function wrongAnswer(v: Validation): ValidationAnswer {
  if (v.type === "bigO") return { type: "bigO", choice: v.choices.find((c) => c !== v.answer) as string };
  const ids = v.visual.kind === "array" ? v.visual.cells.map((c) => c.id) : v.visual.nodes.map((n) => n.id);
  if (v.type === "traceFirstStep") return { type: "target", id: ids.find((id) => id !== v.answerTargetId) as string };
  return { type: "order", ids: [...v.answer.slice(0, v.givenPrefix), ...v.answer.slice(v.givenPrefix).reverse()] };
}
const nVals = () => s().items.reduce((n, i) => n + i.scenario.validations.length, 0);

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
    const rightVals = (sum?.results ?? []).filter((r) => r.correct).reduce((n, r) => n + r.validations.length, 0);
    expect(sum).toMatchObject({
      total: 3,
      correct: 2,
      endedEarly: false,
      xpEarned: 2 * XP_MATCH_CORRECT + rightVals * XP_VALIDATION_CORRECT + XP_SESSION_COMPLETE,
    });
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
    expect(rows[0]).toMatchObject({ studied: false });
    expect(rows[0].validationResults).toHaveLength(sum?.results[0].validations.length ?? -1);
    expect(rows[0].validationResults[0]).toMatchObject({ correct: true });
    expect(rows[1].validationResults[0]).toMatchObject({ correct: false });
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
    const xp = XP_MATCH_CORRECT + s().items[0].scenario.validations.length * XP_VALIDATION_CORRECT;
    expect(s().summary).toMatchObject({ endedEarly: true, total: 1, xpEarned: xp });
    expect(useProfileStore.getState().xp).toBe(xp);
    expect(useToastStore.getState().suspended).toBe(false);
    s().end();
    expect(useProfileStore.getState().xp).toBe(xp);
  });

  it("ending with zero answers awards nothing", async () => {
    await s().start({ count: 2 });
    s().end();
    expect(useProfileStore.getState().xp).toBe(0);
  });

  it("a second session awards again (restart)", async () => {
    let nValsPaid = 0;
    for (let i = 0; i < 2; i++) {
      await s().start({ count: 1 });
      nValsPaid += nVals() * XP_VALIDATION_CORRECT;
      answer(true);
      s().nextScenario();
    }
    expect(useProfileStore.getState().xp).toBe(2 * (XP_MATCH_CORRECT + 1 * XP_SESSION_COMPLETE) + nValsPaid);
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

  it("validations: double taps award and write once; the row is updated, not duplicated", async () => {
    await s().start({ count: 1 });
    const item = s().items[0];
    const n = item.scenario.validations.length;
    s().select(item.scenario.correctOptionId);
    s().check();
    s().continueFromVerdict();
    expect(s().step).toMatchObject({ kind: "validation", index: 0, checked: false });
    s().checkValidation(); // incomplete: no-op
    expect(s().results[0].validations).toHaveLength(0);
    s().setAnswer({ type: "bigO", choice: "bogus" }); // sanitized, no throw
    for (let i = 0; i < n; i++) {
      s().setAnswer(rightAnswer(item.scenario.validations[i]));
      s().checkValidation();
      s().checkValidation();
      s().continueFromValidation();
      s().continueFromValidation();
    }
    expect(s().step.kind).toBe("feedback");
    expect(s().results[0].validations).toHaveLength(n);
    expect(s().results[0].xp).toBe(XP_MATCH_CORRECT + n * XP_VALIDATION_CORRECT);
    s().nextScenario();
    expect(useProfileStore.getState().xp).toBe(XP_MATCH_CORRECT + n * XP_VALIDATION_CORRECT + XP_SESSION_COMPLETE);
    await flush();
    const rows = await getDb().attempts.toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0].validationResults).toHaveLength(n);
  });

  it("an app killed mid-item still has the match row; ending in a validation keeps results", async () => {
    await s().start({ count: 2 });
    const item = s().items[0];
    s().select(item.scenario.correctOptionId);
    s().check();
    s().continueFromVerdict();
    s().end();
    expect(s().summary).toMatchObject({ endedEarly: true, total: 1, xpEarned: XP_MATCH_CORRECT });
    await flush();
    const rows = await getDb().attempts.toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0].validationResults).toEqual([]);
  });

  it("validations do not write attempts when storage is blocked", async () => {
    useProfileStore.setState({ storageBlocked: true });
    await s().start({ count: 1 });
    answer(true);
    await flush();
    useProfileStore.setState({ storageBlocked: false });
    expect(await getDb().attempts.count()).toBe(0);
    expect(s().results[0].validations.length).toBeGreaterThan(0);
  });
});
