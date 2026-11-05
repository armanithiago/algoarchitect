/**
 * DRAFT CONTENT CHECK. Parallel authors each write `src/content/drafts/<name>.json` (same shape as scenarios.v1.json,
 * plus an optional `conceptNames: { slug: "Display name" }`). Every draft gets the same gates as the main bundle:
 * schema + authoring rules, the algorithm checker for trace-order answers, unique ids across ALL files, and a display
 * name for every concept. The orchestrator merges drafts into scenarios.v1.json with `node scripts/content/merge-drafts.mjs`.
 */
import main from "./scenarios.v1.json";
import { checkAlgorithmAnswers } from "@/domain/content/runAlgorithm";
import { checkBundle, formatIssues } from "@/domain/content/validate";
import { CONCEPT_NAMES } from "@/ui/lib/concept";

const drafts = import.meta.glob("./drafts/*.json", { eager: true, import: "default" }) as Record<string, unknown>;
const entries = Object.entries(drafts);

describe.skipIf(entries.length === 0)("content drafts", () => {
  const parsed = entries.map(([file, raw]) => ({ file, raw: raw as { conceptNames?: Record<string, string> }, ...checkBundle(raw) }));

  it.each(parsed.map((p) => [p.file, p] as const))("%s passes every authoring rule", (_file, p) => {
    expect(p.issues.length, `\n${formatIssues(p.issues)}\n`).toBe(0);
  });

  it.each(parsed.map((p) => [p.file, p] as const))("%s: every trace-order answer matches the real algorithm", (_file, p) => {
    const issues = checkAlgorithmAnswers(p.scenarios);
    expect(issues, JSON.stringify(issues, null, 2)).toEqual([]);
  });

  it("has unique ids across the main bundle and all drafts", () => {
    const ids = [...(main.scenarios as { id: string }[]).map((s) => s.id), ...parsed.flatMap((p) => p.scenarios.map((s) => s.id))];
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });

  it("has a display name for every concept (CONCEPT_NAMES or the draft's own conceptNames)", () => {
    const missing = parsed.flatMap((p) =>
      p.scenarios.map((s) => s.concept).filter((c) => !CONCEPT_NAMES[c] && !p.raw.conceptNames?.[c]).map((c) => `${p.file}: ${c}`),
    );
    expect(missing).toEqual([]);
  });
});
