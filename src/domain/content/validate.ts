/** Cross-field authoring rules (sprint plan §9 "Content" row). Used by `npm test` (content check) and the loader. */
import { ScenarioBundleSchema, VIEWBOX, type Scenario, type Visual } from "./schema";

export interface ContentIssue {
  scenarioId: string;
  path: string;
  message: string;
}

/** Growth order for ascending-order check (design system §7.3). Unknown forms are skipped, not rejected. */
const RANK: Record<string, number> = {
  "O(1)": 0, "O(log n)": 1, "O(sqrt n)": 2, "O(n)": 3, "O(n log n)": 4, "O(n^2)": 5, "O(n^3)": 6, "O(2^n)": 7, "O(n!)": 8,
};

const MIN_NODE_GAP = 52;
const MIN_EDGE_MARGIN = 26;

function visualTargets(v: Visual): string[] {
  return v.kind === "array" ? v.cells.map((c) => c.id) : v.nodes.map((n) => n.id);
}

function checkVisual(v: Visual, at: (m: string) => void) {
  const ids = visualTargets(v);
  if (new Set(ids).size !== ids.length) at("visual has duplicate target ids");
  if (v.kind === "array") return;
  if (v.kind === "graph" && v.nodes.length > 8) at("a graph has at most 8 nodes");
  if (v.kind === "tree" && v.nodes.length > 12) at("a tree has at most 12 nodes");
  for (const e of v.edges) {
    if (!ids.includes(e.from) || !ids.includes(e.to)) at(`edge ${e.from}-${e.to} references an unknown node`);
  }
  if (v.start && !ids.includes(v.start)) at(`start node ${v.start} does not exist`);
  for (const n of v.nodes) {
    if (n.x < MIN_EDGE_MARGIN || n.x > VIEWBOX.width - MIN_EDGE_MARGIN || n.y < MIN_EDGE_MARGIN || n.y > VIEWBOX.height - MIN_EDGE_MARGIN)
      at(`node ${n.id} is closer than ${MIN_EDGE_MARGIN} units to the viewBox edge`);
  }
  for (let i = 0; i < v.nodes.length; i++)
    for (let j = i + 1; j < v.nodes.length; j++) {
      const a = v.nodes[i], b = v.nodes[j];
      if (Math.hypot(a.x - b.x, a.y - b.y) < MIN_NODE_GAP) at(`nodes ${a.id} and ${b.id} are closer than ${MIN_NODE_GAP} units (48 px hit targets would overlap)`);
    }
}

export function checkScenario(s: Scenario): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const add = (path: string, message: string) => issues.push({ scenarioId: s.id, path, message });

  if (!s.id.startsWith(`${s.domain}-`)) add("id", `id prefix must match domain "${s.domain}"`);
  const optionIds = s.options.map((o) => o.id);
  if (new Set(optionIds).size !== optionIds.length) add("options", "option ids must be unique");
  if (!optionIds.includes(s.correctOptionId)) add("correctOptionId", "must be one of the option ids");
  if (new Set(s.options.map((o) => o.label.toLowerCase())).size !== s.options.length) add("options", "option labels must be unique");

  s.validations.forEach((v, i) => {
    const at = (m: string) => add(`validations[${i}]`, m);
    if (v.type === "bigO") {
      if (new Set(v.choices).size !== v.choices.length) at("choices must be unique");
      if (!v.choices.includes(v.answer)) at("answer must be one of the choices");
      const ranks = v.choices.map((c) => RANK[c]).filter((r) => r !== undefined);
      if (ranks.some((r, k) => k > 0 && r < ranks[k - 1])) at("choices must be in ascending order of growth, never shuffled");
    } else {
      checkVisual(v.visual, at);
      const ids = visualTargets(v.visual);
      if (v.type === "traceFirstStep" && !ids.includes(v.answerTargetId)) at("answerTargetId is not a node in the visual");
      if (v.type === "traceOrder") {
        if (v.answer.some((a) => !ids.includes(a))) at("answer references an unknown node");
        if (new Set(v.answer).size !== v.answer.length) at("answer must not repeat a node");
        if (v.givenPrefix > v.answer.length - 1) at("givenPrefix leaves nothing to tap");
        if (!/alphabetical|authored|first|order/i.test(v.question) && v.tieBreak === "alphabetical")
          at("the question text must state the tie-break rule (e.g. 'Neighbors are queued in alphabetical order')");
        // Sprint 5 (E6-08): run `algorithm` on the visual and require the result to equal `answer`.
      }
    }
  });
  return issues;
}

export function checkBundle(raw: unknown): { issues: ContentIssue[]; scenarios: Scenario[] } {
  const parsed = ScenarioBundleSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      scenarios: [],
      issues: parsed.error.issues.map((i) => ({ scenarioId: String(i.path[1] ?? "bundle"), path: i.path.slice(2).join(".") || i.path.join("."), message: i.message })),
    };
  }
  const scenarios = parsed.data.scenarios;
  const issues = scenarios.flatMap(checkScenario);
  const seen = new Set<string>();
  for (const s of scenarios) {
    if (seen.has(s.id)) issues.push({ scenarioId: s.id, path: "id", message: "duplicate scenario id" });
    seen.add(s.id);
  }
  return { issues, scenarios };
}

export const formatIssues = (issues: ContentIssue[]): string =>
  issues.map((i) => `  ${i.scenarioId} › ${i.path}: ${i.message}`).join("\n");
