import { expectedTargets, gradeValidation, initialAnswer, isAnswerComplete } from "./validation";
import type { Validation } from "@/domain/content/schema";

const visual = { kind: "graph" as const, nodes: [], edges: [] } as never;
const bigO: Validation = { type: "bigO", question: "Lookup cost for one key?", choices: ["O(1)", "O(log n)", "O(n)"], answer: "O(log n)" };
const first: Validation = { type: "traceFirstStep", question: "Which node is finalized first?", visual, answerTargetId: "B" };
const order: Validation = { type: "traceOrder", question: "Tap the order. Neighbors alphabetical.", visual, algorithm: "bfs", tieBreak: "alphabetical", givenPrefix: 1, answer: ["Y", "B", "D", "A"] };

describe("validation grading", () => {
  it("pre-fills only the order prefix", () => {
    expect(initialAnswer(bigO)).toBeNull();
    expect(initialAnswer(first)).toBeNull();
    expect(initialAnswer(order)).toEqual({ type: "order", ids: ["Y"] });
  });
  it("knows when Check may be pressed", () => {
    expect(isAnswerComplete(bigO, null)).toBe(false);
    expect(isAnswerComplete(bigO, { type: "bigO", choice: "O(2)" })).toBe(false);
    expect(isAnswerComplete(bigO, { type: "bigO", choice: "O(n)" })).toBe(true);
    expect(isAnswerComplete(first, { type: "target", id: "B" })).toBe(true);
    expect(isAnswerComplete(order, { type: "order", ids: ["Y", "B"] })).toBe(false);
    expect(isAnswerComplete(order, { type: "order", ids: ["Y", "B", "D", "A"] })).toBe(true);
    expect(isAnswerComplete(order, { type: "order", ids: ["Y", "B", "B", "A"] })).toBe(false);
    expect(isAnswerComplete(order, { type: "bigO", choice: "O(n)" })).toBe(false);
  });
  it("grades bigO and first step", () => {
    expect(gradeValidation(bigO, { type: "bigO", choice: "O(log n)" }).correct).toBe(true);
    expect(gradeValidation(bigO, { type: "bigO", choice: "O(n)" }).correct).toBe(false);
    expect(gradeValidation(first, { type: "target", id: "B" }).correct).toBe(true);
    expect(gradeValidation(first, { type: "target", id: "A" }).correct).toBe(false);
    expect(gradeValidation(first, null).correct).toBe(false);
  });
  it("grades order per position with no partial credit", () => {
    expect(gradeValidation(order, { type: "order", ids: ["Y", "B", "D", "A"] })).toEqual({ correct: true, positions: [true, true, true, true] });
    expect(gradeValidation(order, { type: "order", ids: ["Y", "B", "A", "D"] })).toEqual({ correct: false, positions: [true, true, false, false] });
    expect(gradeValidation(order, { type: "bigO", choice: "x" }).correct).toBe(false);
  });
  it("reveals the expected targets", () => {
    expect(expectedTargets(bigO)).toEqual([]);
    expect(expectedTargets(first)).toEqual(["B"]);
    expect(expectedTargets(order)).toEqual(["Y", "B", "D", "A"]);
  });
});
