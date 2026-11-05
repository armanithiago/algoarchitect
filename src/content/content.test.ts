/**
 * CONTENT CI CHECK (sprint plan §9): `npm test` (or `npx vitest run src/content`) fails with a readable list of
 * problems if any scenario breaks the authoring rules. Run it after every content edit.
 */
import bundle from "./scenarios.v1.json";
import { checkBundle, formatIssues } from "@/domain/content/validate";
import { DOMAINS } from "@/domain/content/schema";
import { CONCEPT_NAMES } from "@/ui/lib/concept";

describe("scenarios.v1.json", () => {
  const { issues, scenarios } = checkBundle(bundle);

  it("passes every authoring rule", () => {
    expect(issues.length, `\n${formatIssues(issues)}\n`).toBe(0);
  });

  it("has unique ids and covers the domains listed below", () => {
    const counts = Object.fromEntries(DOMAINS.map((d) => [d, scenarios.filter((s) => s.domain === d).length]));
    // Informational: Sprint 2 target is 15 scenarios, 3 per domain. Sprint 3 target is 50, 10 per domain.
    console.info("scenarios per domain:", JSON.stringify(counts), "total:", scenarios.length);
    expect(new Set(scenarios.map((s) => s.id)).size).toBe(scenarios.length);
  });

  it("has a curated display name for every concept (shown in the session summary)", () => {
    const missing = [...new Set(scenarios.map((s) => s.concept))].filter((c) => !CONCEPT_NAMES[c]);
    expect(missing, `add these to CONCEPT_NAMES in src/ui/lib/concept.ts: ${missing.join(", ")}`).toEqual([]);
  });
});
