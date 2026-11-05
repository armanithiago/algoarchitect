/** Test fixtures: the REAL trace visuals from the content bundle (and any drafts present). */
import bundle from "@/content/scenarios.v1.json";
import type { Visual } from "@/domain/content/schema";

export interface TraceFixture {
  scenarioId: string;
  type: "traceFirstStep" | "traceOrder";
  visual: Visual;
  /** First mode: [answerTargetId]; order mode: the answer sequence. */
  expected: string[];
  givenPrefix: number;
}

interface RawValidation {
  type: string;
  visual?: Visual;
  answerTargetId?: string;
  answer?: string[];
  givenPrefix?: number;
}
interface RawBundle {
  scenarios: { id: string; validations?: RawValidation[] }[];
}

export function traceFixtures(raw: RawBundle): TraceFixture[] {
  const out: TraceFixture[] = [];
  for (const s of raw.scenarios) {
    for (const v of s.validations ?? []) {
      if (v.type === "traceFirstStep" && v.visual && v.answerTargetId) {
        out.push({ scenarioId: s.id, type: "traceFirstStep", visual: v.visual, expected: [v.answerTargetId], givenPrefix: 0 });
      } else if (v.type === "traceOrder" && v.visual && v.answer) {
        out.push({ scenarioId: s.id, type: "traceOrder", visual: v.visual, expected: v.answer, givenPrefix: v.givenPrefix ?? 1 });
      }
    }
  }
  return out;
}

export const mainFixtures = traceFixtures(bundle as unknown as RawBundle);

const draftFiles = import.meta.glob("../../../content/drafts/*.json", { eager: true, import: "default" }) as Record<string, RawBundle>;
export const draftFixtures: { file: string; fixtures: TraceFixture[] }[] = Object.entries(draftFiles).map(([file, raw]) => ({
  file,
  fixtures: traceFixtures(raw),
}));

export function fixture(scenarioId: string): TraceFixture {
  const f = mainFixtures.find((x) => x.scenarioId === scenarioId);
  if (!f) throw new Error(`no trace fixture for ${scenarioId}`);
  return f;
}
