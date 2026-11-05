import { describe, expect, it } from "vitest";
import bundle from "@/content/scenarios.v1.json";
import { ScenarioBundleSchema, type Scenario, type Validation } from "@/domain/content/schema";
import {
  check,
  checkValidation,
  continueFromValidation,
  continueFromVerdict,
  end,
  idleMachine,
  nextScenario,
  select,
  setAnswer,
  startMachine,
  type MachineState,
} from "./machine";
import { XP_MATCH_CORRECT, XP_SESSION_COMPLETE, XP_VALIDATION_CORRECT, type SessionItem, type ValidationAnswer } from "./types";
import { expectedTargets, initialAnswer } from "./validation";

const scenarios: Scenario[] = ScenarioBundleSchema.parse(bundle).scenarios;
const withType = (t: Validation["type"], pred: (v: Validation) => boolean = () => true) =>
  scenarios.find((s) => s.validations.some((v) => v.type === t && pred(v)));
const bigO = withType("bigO");
const first = withType("traceFirstStep");
const order = withType("traceOrder");
const orderWithPrefix = withType("traceOrder", (v) => v.type === "traceOrder" && v.givenPrefix > 0);
const twoVal: Scenario | undefined = bigO && first ? { ...bigO, validations: [bigO.validations[0], first.validations[0]] } : undefined;

const itemOf = (sc: Scenario): SessionItem => ({ scenario: sc, optionOrder: sc.options.map((o) => o.id) });
const T0 = 100;
const startOn = (sc: Scenario, more: Scenario[] = []) => startMachine([sc, ...more].map(itemOf), { practice: false, now: T0 });
/** Answers the match (right/wrong) and moves into the first validation. */
const inValidation = (sc: Scenario, right = true, more: Scenario[] = []): MachineState => {
  const wrong = sc.options.find((o) => o.id !== sc.correctOptionId)!.id;
  return continueFromVerdict(check(select(startOn(sc, more), right ? sc.correctOptionId : wrong), T0 + 50));
};
const correctAnswer = (v: Validation): ValidationAnswer => {
  if (v.type === "bigO") return { type: "bigO", choice: v.answer };
  if (v.type === "traceFirstStep") return { type: "target", id: v.answerTargetId };
  return { type: "order", ids: expectedTargets(v) };
};
const vOf = (s: MachineState, i = 0) => s.items[s.index].scenario.validations[i];

describe("seed content has every validation type", () => {
  it("finds one of each", () => {
    expect(bigO && first && order && orderWithPrefix).toBeTruthy();
  });
});

describe("continueFromVerdict", () => {
  it("enters the first validation with its initial answer", () => {
    const s = inValidation(order!);
    expect(s.step).toEqual({ kind: "validation", index: 0, answer: initialAnswer(vOf(s)), checked: false });
  });
  it("goes to feedback when the scenario has no validations", () => {
    const sc = { ...bigO!, validations: [] } as Scenario;
    expect(inValidation(sc).step).toEqual({ kind: "feedback" });
  });
});

describe("setAnswer", () => {
  const bo = () => inValidation(bigO!);
  const bov = () => vOf(bo()) as Extract<Validation, { type: "bigO" }>;
  const fs = () => inValidation(first!);
  const ord = () => inValidation(orderWithPrefix!);
  const ov = () => vOf(ord()) as Extract<Validation, { type: "traceOrder" }>;
  const ids = () => ov().answer;
  const ans = (s: MachineState) => (s.step.kind === "validation" ? s.step.answer : "n/a");

  it("accepts a valid bigO choice and replaces it", () => {
    const s = setAnswer(setAnswer(bo(), { type: "bigO", choice: bov().choices[0] }), { type: "bigO", choice: bov().choices[1] });
    expect(ans(s)).toEqual({ type: "bigO", choice: bov().choices[1] });
  });
  it("null clears bigO", () => {
    const s = setAnswer(setAnswer(bo(), { type: "bigO", choice: bov().choices[0] }), null);
    expect(ans(s)).toBeNull();
  });
  it("accepts a target in the visual", () => {
    const v = vOf(fs()) as Extract<Validation, { type: "traceFirstStep" }>;
    expect(ans(setAnswer(fs(), { type: "target", id: v.answerTargetId }))).toEqual({ type: "target", id: v.answerTargetId });
  });

  const base = [
    ["bigO with a target answer", bo, { type: "target", id: "x" }],
    ["bigO choice not offered", bo, { type: "bigO", choice: "O(nope)" }],
    ["target with an unknown id", fs, { type: "target", id: "zzz" }],
    ["target with a bigO answer", fs, { type: "bigO", choice: "O(1)" }],
    ["order with a bigO answer", ord, { type: "bigO", choice: "O(1)" }],
    ["order without the locked prefix", ord, { type: "order", ids: ["nope"] }],
    ["order with an unknown id", ord, { type: "order", ids: [ids()[0], "zzz"] }],
    ["order with duplicates", ord, { type: "order", ids: [ids()[0], ids()[1], ids()[1]] }],
    ["order longer than expected", ord, { type: "order", ids: [...ids(), ids()[0]] }],
  ] as const;
  it.each(base)("ignores %s (same state object)", (_n, from, answer) => {
    const s = from();
    expect(setAnswer(s, answer as ValidationAnswer)).toBe(s);
  });
  it("ignores an order answer whose ids is not an array", () => {
    const s = ord();
    expect(setAnswer(s, { type: "order", ids: undefined } as unknown as ValidationAnswer)).toBe(s);
  });

  it("order: append taps, keep the prefix, reset on null", () => {
    const given = ids().slice(0, ov().givenPrefix);
    expect(ans(ord())).toEqual({ type: "order", ids: given });
    const s = setAnswer(ord(), { type: "order", ids: ids().slice(0, given.length + 1) });
    expect(ans(s)).toEqual({ type: "order", ids: ids().slice(0, given.length + 1) });
    expect(ans(setAnswer(s, null))).toEqual({ type: "order", ids: given });
  });
  it("order: dropping below the prefix is ignored", () => {
    const s = ord();
    expect(setAnswer(s, { type: "order", ids: [] })).toBe(s);
  });

  it("is ignored outside an unchecked validation", () => {
    const a: ValidationAnswer = { type: "bigO", choice: bov().choices[0] };
    const checkedState = checkValidation(setAnswer(bo(), { type: "bigO", choice: bov().answer }));
    expect(setAnswer(checkedState, a)).toBe(checkedState);
    const q = startOn(bigO!);
    expect(setAnswer(q, a)).toBe(q);
    expect(setAnswer(idleMachine, a)).toBe(idleMachine);
    const fb = continueFromValidation(checkedState);
    expect(setAnswer(fb, a)).toBe(fb);
  });
});

describe("checkValidation / continueFromValidation", () => {
  it("is a no-op when incomplete, on the wrong step and when already checked", () => {
    const s = inValidation(bigO!);
    expect(checkValidation(s)).toBe(s);
    expect(checkValidation(idleMachine)).toBe(idleMachine);
    const q = startOn(bigO!);
    expect(checkValidation(q)).toBe(q);
    const o = inValidation(orderWithPrefix!);
    expect(checkValidation(o)).toBe(o);
    const done = checkValidation(setAnswer(s, correctAnswer(vOf(s))));
    expect(checkValidation(done)).toBe(done);
  });
  it("continue is a no-op before the check and outside validations", () => {
    const s = inValidation(bigO!);
    expect(continueFromValidation(s)).toBe(s);
    expect(continueFromValidation(idleMachine)).toBe(idleMachine);
    const q = startOn(bigO!);
    expect(continueFromValidation(q)).toBe(q);
  });
  it("wrong answer records 0 xp", () => {
    const s0 = inValidation(bigO!);
    const v = vOf(s0) as Extract<Validation, { type: "bigO" }>;
    const wrong = v.choices.find((c) => c !== v.answer)!;
    const s = checkValidation(setAnswer(s0, { type: "bigO", choice: wrong }));
    expect(s.results[0].validations).toEqual([{ type: "bigO", correct: false, answer: { type: "bigO", choice: wrong }, xp: 0 }]);
    expect(s.results[0].xp).toBe(XP_MATCH_CORRECT);
    expect(s.step).toMatchObject({ kind: "validation", checked: true });
  });
  it("wrong match plus right validation still earns the validation xp", () => {
    const s0 = inValidation(bigO!, false);
    const s = checkValidation(setAnswer(s0, correctAnswer(vOf(s0))));
    expect(s.results[0]).toMatchObject({ correct: false, xp: XP_VALIDATION_CORRECT });
  });
  it("order: all-or-nothing with per-position report", () => {
    const s0 = inValidation(orderWithPrefix!);
    const v = vOf(s0) as Extract<Validation, { type: "traceOrder" }>;
    const swapped = [...v.answer];
    [swapped[swapped.length - 1], swapped[swapped.length - 2]] = [swapped[swapped.length - 2], swapped[swapped.length - 1]];
    const s = checkValidation(setAnswer(s0, { type: "order", ids: swapped }));
    const r = s.results[0].validations[0];
    expect(r).toMatchObject({ type: "traceOrder", correct: false, xp: 0 });
    expect(r.positions).toEqual(v.answer.map((id, i) => swapped[i] === id));
    expect(r.positions?.filter((p) => !p)).toHaveLength(2);
    expect(s.results[0].xp).toBe(XP_MATCH_CORRECT);
  });
  it("continue goes to the next validation then feedback", () => {
    expect(twoVal).toBeTruthy();
    let s = inValidation(twoVal!);
    s = checkValidation(setAnswer(s, correctAnswer(vOf(s, 0))));
    s = continueFromValidation(s);
    expect(s.step).toEqual({ kind: "validation", index: 1, answer: initialAnswer(vOf(s, 1)), checked: false });
    s = checkValidation(setAnswer(s, correctAnswer(vOf(s, 1))));
    expect(s.results[0].validations).toHaveLength(2);
    s = continueFromValidation(s);
    expect(s.step).toEqual({ kind: "feedback" });
    expect(s.results[0].xp).toBe(XP_MATCH_CORRECT + 2 * XP_VALIDATION_CORRECT);
  });
});

describe("end during a validation", () => {
  it("ends early with the results so far, no bonus", () => {
    const s0 = inValidation(bigO!);
    const s1 = checkValidation(setAnswer(s0, correctAnswer(vOf(s0))));
    const e = end(s1, T0 + 999);
    expect(e.summary).toMatchObject({ total: 1, correct: 1, endedEarly: true, xpEarned: XP_MATCH_CORRECT + XP_VALIDATION_CORRECT });
    expect(end(inValidation(bigO!), 5).summary).toMatchObject({ total: 1, xpEarned: XP_MATCH_CORRECT, endedEarly: true });
  });
});

describe("full-scenario walk per validation type", () => {
  const cases: Array<[string, Scenario | undefined]> = [
    ["bigO", bigO],
    ["traceFirstStep", first],
    ["traceOrder", order],
  ];
  it.each(cases)("%s: all correct", (_n, sc) => {
    const scenario = sc!;
    const nVal = scenario.validations.length;
    let s = inValidation(scenario);
    for (let i = 0; i < nVal; i++) {
      expect(s.step).toMatchObject({ kind: "validation", index: i, checked: false });
      const v = vOf(s, i);
      const target = correctAnswer(v);
      if (target.type === "order") {
        // tap one by one, as the UI does
        for (let k = (s.step as { answer: { ids: string[] } }).answer.ids.length + 1; k <= target.ids.length; k++) {
          s = setAnswer(s, { type: "order", ids: target.ids.slice(0, k) });
        }
      } else s = setAnswer(s, target);
      s = checkValidation(s);
      s = continueFromValidation(s);
    }
    expect(s.step).toEqual({ kind: "feedback" });
    s = nextScenario(s, T0 + 500);
    expect(s.summary).toMatchObject({
      total: 1,
      correct: 1,
      xpEarned: XP_MATCH_CORRECT + nVal * XP_VALIDATION_CORRECT + XP_SESSION_COMPLETE,
    });
    expect(s.results[0].validations.every((r) => r.correct)).toBe(true);
  });
  it.each(cases)("%s: all wrong", (_n, sc) => {
    const scenario = sc!;
    let s = inValidation(scenario, false);
    for (let i = 0; i < scenario.validations.length; i++) {
      const v = vOf(s, i);
      let wrong: ValidationAnswer;
      if (v.type === "bigO") wrong = { type: "bigO", choice: v.choices.find((c) => c !== v.answer)! };
      else if (v.type === "traceFirstStep") {
        const ids = v.visual.kind === "array" ? v.visual.cells.map((c) => c.id) : v.visual.nodes.map((n) => n.id);
        wrong = { type: "target", id: ids.find((id) => id !== v.answerTargetId)! };
      } else wrong = { type: "order", ids: [...v.answer.slice(0, v.givenPrefix), ...v.answer.slice(v.givenPrefix).reverse()] };
      s = continueFromValidation(checkValidation(setAnswer(s, wrong)));
    }
    s = nextScenario(s, T0 + 500);
    expect(s.summary).toMatchObject({ total: 1, correct: 0, xpEarned: XP_SESSION_COMPLETE });
  });
});
