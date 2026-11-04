import { describe, expect, it } from "vitest";
import type { Scenario } from "@/domain/content/schema";
import { check, continueFromVerdict, end, idleMachine, nextScenario, select, startMachine, type MachineState } from "./machine";
import { XP_MATCH_CORRECT, XP_SESSION_COMPLETE, type SessionItem } from "./types";

function item(n: number): SessionItem {
  return {
    scenario: {
      id: `dp-00${n}`,
      domain: "dp",
      concept: `concept-${n}`,
      correctOptionId: "b",
      options: ["a", "b", "c", "d"].map((id) => ({ id, label: id, rationale: "" })),
    } as unknown as Scenario,
    optionOrder: ["c", "a", "b", "d"],
  };
}
const items = [item(1), item(2)];
const T0 = 1000;

const started = () => startMachine(items, { practice: true, now: T0 });
const selected = (id = "b") => select(started(), id);
const checked = (id = "b", at = T0 + 400) => check(selected(id), at);
const verdict = () => continueFromVerdict(checked());

describe("startMachine", () => {
  it("opens the first question", () => {
    const s = started();
    expect(s.step).toEqual({ kind: "question", selectedOptionId: null, checked: false });
    expect(s).toMatchObject({ index: 0, results: [], startedAt: T0, practice: true, summary: null, questionStartedAt: T0 });
  });
  it("stays idle with no items", () => {
    expect(startMachine([], { practice: false, now: 1 })).toBe(idleMachine);
  });
});

describe("transitions (table)", () => {
  type Case = { name: string; from: () => MachineState; act: (s: MachineState) => MachineState; kind: string; same?: boolean };
  const cases: Case[] = [
    { name: "select on idle ignored", from: () => idleMachine, act: (s) => select(s, "a"), kind: "idle", same: true },
    { name: "select unknown option ignored", from: started, act: (s) => select(s, "zz"), kind: "question", same: true },
    { name: "select sets selection", from: started, act: (s) => select(s, "a"), kind: "question" },
    { name: "select after checked ignored", from: () => checked(), act: (s) => select(s, "a"), kind: "question", same: true },
    { name: "select in feedback ignored", from: verdict, act: (s) => select(s, "a"), kind: "feedback", same: true },
    { name: "check on idle ignored", from: () => idleMachine, act: (s) => check(s, 5), kind: "idle", same: true },
    { name: "check without selection is a no-op", from: started, act: (s) => check(s, 5), kind: "question", same: true },
    { name: "check twice ignored", from: () => checked(), act: (s) => check(s, 9999), kind: "question", same: true },
    { name: "check in feedback ignored", from: verdict, act: (s) => check(s, 5), kind: "feedback", same: true },
    { name: "continue before check ignored", from: selected, act: (s) => continueFromVerdict(s), kind: "question", same: true },
    { name: "continue on idle ignored", from: () => idleMachine, act: (s) => continueFromVerdict(s), kind: "idle", same: true },
    { name: "continue after check -> feedback", from: () => checked(), act: (s) => continueFromVerdict(s), kind: "feedback" },
    { name: "continue in feedback ignored", from: verdict, act: (s) => continueFromVerdict(s), kind: "feedback", same: true },
    { name: "next in question ignored", from: () => checked(), act: (s) => nextScenario(s, 5), kind: "question", same: true },
    { name: "next on idle ignored", from: () => idleMachine, act: (s) => nextScenario(s, 5), kind: "idle", same: true },
    { name: "next from feedback -> next question", from: verdict, act: (s) => nextScenario(s, T0 + 900), kind: "question" },
    { name: "end on idle ignored", from: () => idleMachine, act: (s) => end(s, 5), kind: "idle", same: true },
    { name: "end in question -> summary", from: started, act: (s) => end(s, 5000), kind: "summary" },
    { name: "end in feedback -> summary", from: verdict, act: (s) => end(s, 5000), kind: "summary" },
  ];
  it.each(cases)("$name", ({ from, act, kind, same }) => {
    const before = from();
    const after = act(before);
    expect(after.step.kind).toBe(kind);
    if (same) expect(after).toBe(before);
  });

  it("summary ignores everything", () => {
    const s = end(started(), 10);
    for (const out of [select(s, "a"), check(s, 1), continueFromVerdict(s), nextScenario(s, 1), end(s, 2)]) expect(out).toBe(s);
  });
});

describe("check", () => {
  it("correct answer records XP, ids and the measured duration", () => {
    const s = checked("b", T0 + 1234);
    expect(s.step).toEqual({ kind: "question", selectedOptionId: "b", checked: true });
    expect(s.results).toEqual([
      { scenarioId: "dp-001", concept: "concept-1", domain: "dp", pickedOptionId: "b", correct: true, xp: XP_MATCH_CORRECT, durationMs: 1234 },
    ]);
  });
  it("wrong answer earns no XP", () => {
    expect(checked("a").results[0]).toMatchObject({ correct: false, xp: 0, pickedOptionId: "a" });
  });
  it("changing the selection before check keeps the last pick", () => {
    expect(check(select(select(started(), "a"), "c"), T0 + 1).results[0].pickedOptionId).toBe("c");
  });
  it("duration restarts for each question", () => {
    const q2 = nextScenario(verdict(), T0 + 2000);
    expect(q2.questionStartedAt).toBe(T0 + 2000);
    expect(check(select(q2, "b"), T0 + 2500).results[1].durationMs).toBe(500);
  });
  it("never reports negative duration", () => {
    expect(check(selected(), T0 - 50).results[0].durationMs).toBe(0);
  });
});

describe("full run", () => {
  it("completing: bonus once, counts right", () => {
    let s = started();
    s = nextScenario(continueFromVerdict(check(select(s, "b"), T0 + 100)), T0 + 200);
    s = nextScenario(continueFromVerdict(check(select(s, "a"), T0 + 300)), T0 + 1000);
    expect(s.step).toEqual({ kind: "summary" });
    expect(s.summary).toMatchObject({
      total: 2,
      correct: 1,
      xpEarned: XP_MATCH_CORRECT + XP_SESSION_COMPLETE,
      durationMs: 1000 - 0,
      practice: true,
      endedEarly: false,
    });
    expect(s.summary?.results).toHaveLength(2);
  });

  it("ending early keeps answers, flags it and gives no bonus", () => {
    let s = nextScenario(continueFromVerdict(check(select(started(), "b"), T0 + 100)), T0 + 200);
    s = end(s, T0 + 700);
    expect(s.summary).toMatchObject({ total: 1, correct: 1, xpEarned: XP_MATCH_CORRECT, endedEarly: true, durationMs: 700 });
  });

  it("ending before any answer gives an empty summary", () => {
    expect(end(started(), T0 + 5).summary).toMatchObject({ total: 0, correct: 0, xpEarned: 0, endedEarly: true });
  });

  it("does not mutate previous states", () => {
    const a = started();
    const frozen = JSON.stringify(a);
    check(select(a, "b"), 5);
    expect(JSON.stringify(a)).toBe(frozen);
  });
});
