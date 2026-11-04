import { checkScenario } from "./validate";
import { ScenarioSchema, type Scenario } from "./schema";
import bundle from "@/content/scenarios.v1.json";

const base = (bundle.scenarios[0] as unknown) as Scenario;
const mutate = (patch: Partial<Scenario>): Scenario => ({ ...base, ...patch });

describe("content validation rules", () => {
  it("accepts a good scenario", () => {
    expect(checkScenario(base)).toEqual([]);
  });
  it("rejects a correctOptionId that is not an option", () => {
    expect(checkScenario(mutate({ correctOptionId: "d" })).some((i) => i.path === "correctOptionId")).toBe(false); // d exists
    expect(checkScenario(mutate({ correctOptionId: "z" })).some((i) => i.path === "correctOptionId")).toBe(true);
  });
  it("rejects a Big-O answer that is not in the choices", () => {
    const s = mutate({ validations: [{ type: "bigO", question: "Lookup cost for one key on the ring?", choices: ["O(1)", "O(n)", "O(n^2)"], answer: "O(log n)" }] });
    expect(checkScenario(s).map((i) => i.message)).toContain("answer must be one of the choices");
  });
  it("rejects Big-O choices that are not in ascending order of growth", () => {
    const s = mutate({ validations: [{ type: "bigO", question: "Lookup cost for one key on the ring?", choices: ["O(n)", "O(1)", "O(log n)"], answer: "O(1)" }] });
    expect(checkScenario(s).some((i) => /ascending/.test(i.message))).toBe(true);
  });
  it("rejects trace nodes that are too close (hit targets would overlap)", () => {
    const g = (bundle.scenarios[1].validations[0] as { visual: unknown }).visual as never;
    const crowded = JSON.parse(JSON.stringify(g));
    crowded.nodes[1].x = crowded.nodes[0].x + 10;
    crowded.nodes[1].y = crowded.nodes[0].y + 10;
    const s = mutate({ validations: [{ type: "traceFirstStep", question: "Which node is finalized first after S?", visual: crowded, answerTargetId: "B" }] });
    expect(checkScenario(s).some((i) => /closer than 52/.test(i.message))).toBe(true);
  });
  it("enforces schema limits: 28-character option labels and 280-character prompts", () => {
    const longLabel = { ...base, options: base.options.map((o, i) => (i === 0 ? { ...o, label: "x".repeat(29) } : o)) };
    expect(ScenarioSchema.safeParse(longLabel).success).toBe(false);
    expect(ScenarioSchema.safeParse({ ...base, prompt: "x".repeat(281) }).success).toBe(false);
  });
});
