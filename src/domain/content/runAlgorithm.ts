/**
 * Reference runners for the trace validations (sprint plan §9: "trace-order answer equals the algorithm's output").
 * Pure TypeScript. Used by the content CI test to prove that every authored `answer` is what the algorithm really does.
 *
 * Conventions
 * - Edges come from `visual.edges`. They are undirected unless `directed: true`.
 * - `tieBreak: "alphabetical"` sorts neighbor ids (and equal-distance Dijkstra candidates, and Kahn's initial sources)
 *   with plain string comparison. `"authored"` keeps the order in which edges (and nodes) appear in the JSON.
 * - Trees are rooted at `visual.start`, or the first node. A node's children are its neighbors except its parent.
 *   For in-order, a child with a smaller x than its parent is a left child and the rest are right children, so a
 *   node with a single child is unambiguous on screen.
 * - Binary search reads node labels as numbers; the target is parsed from the question ("search for 22").
 */
import type { Scenario, Validation, Visual } from "./schema";

type NodeVisual = Extract<Visual, { kind: "graph" | "tree" }>;
type ArrayVisual = Extract<Visual, { kind: "array" }>;
export type TieBreak = "alphabetical" | "authored";
export type TraceOrderValidation = Extract<Validation, { type: "traceOrder" }>;

interface Neighbor {
  id: string;
  weight: number;
}

function assertNodeVisual(v: Visual): asserts v is NodeVisual {
  if (v.kind === "array") throw new Error("this algorithm needs a graph or tree visual");
}

const byId = (a: Neighbor, b: Neighbor) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/** Adjacency lists in traversal order for the given tie-break. */
export function adjacency(v: NodeVisual, tieBreak: TieBreak): Map<string, Neighbor[]> {
  const adj = new Map<string, Neighbor[]>(v.nodes.map((n) => [n.id, []]));
  for (const e of v.edges) {
    const w = e.weight ?? 1;
    adj.get(e.from)!.push({ id: e.to, weight: w });
    if (!e.directed) adj.get(e.to)!.push({ id: e.from, weight: w });
  }
  if (tieBreak === "alphabetical") for (const list of adj.values()) list.sort(byId);
  return adj;
}

const startOf = (v: NodeVisual) => v.start ?? v.nodes[0].id;

export function bfsOrder(v: Visual, tieBreak: TieBreak): string[] {
  assertNodeVisual(v);
  const adj = adjacency(v, tieBreak);
  const start = startOf(v);
  const seen = new Set([start]);
  const order: string[] = [];
  const queue = [start];
  while (queue.length) {
    const u = queue.shift()!;
    order.push(u);
    for (const n of adj.get(u)!) {
      if (!seen.has(n.id)) {
        seen.add(n.id);
        queue.push(n.id);
      }
    }
  }
  return order;
}

/** DFS preorder: visit a node when first reached, then descend into neighbors in adjacency order. */
export function dfsOrder(v: Visual, tieBreak: TieBreak): string[] {
  assertNodeVisual(v);
  const adj = adjacency(v, tieBreak);
  const seen = new Set<string>();
  const order: string[] = [];
  const visit = (u: string) => {
    seen.add(u);
    order.push(u);
    for (const n of adj.get(u)!) if (!seen.has(n.id)) visit(n.id);
  };
  visit(startOf(v));
  return order;
}

/** Order in which Dijkstra settles (finalizes) nodes, start first. Equal distances: smaller id / earlier node first. */
export function dijkstraOrder(v: Visual, tieBreak: TieBreak): string[] {
  assertNodeVisual(v);
  const adj = adjacency(v, tieBreak);
  const rank = new Map(v.nodes.map((n, i) => [n.id, i]));
  const dist = new Map<string, number>([[startOf(v), 0]]);
  const settled = new Set<string>();
  const order: string[] = [];
  for (;;) {
    let best: string | undefined;
    for (const [id, d] of dist) {
      if (settled.has(id)) continue;
      if (best === undefined) { best = id; continue; }
      const bd = dist.get(best)!;
      const tie = tieBreak === "alphabetical" ? id < best : rank.get(id)! < rank.get(best)!;
      if (d < bd || (d === bd && tie)) best = id;
    }
    if (best === undefined) return order;
    settled.add(best);
    order.push(best);
    for (const n of adj.get(best)!) {
      const nd = dist.get(best)! + n.weight;
      if (!settled.has(n.id) && nd < (dist.get(n.id) ?? Infinity)) dist.set(n.id, nd);
    }
  }
}

/** Kahn's algorithm with a FIFO queue. Sources and newly ready nodes are queued in tie-break order. Edges are dependency -> dependent. */
export function topoKahnOrder(v: Visual, tieBreak: TieBreak): string[] {
  assertNodeVisual(v);
  const adj = adjacency(v, tieBreak);
  const indeg = new Map(v.nodes.map((n) => [n.id, 0]));
  for (const list of adj.values()) for (const n of list) indeg.set(n.id, indeg.get(n.id)! + 1);
  const sources = v.nodes.map((n) => n.id).filter((id) => indeg.get(id) === 0);
  if (tieBreak === "alphabetical") sources.sort();
  const queue = sources;
  const order: string[] = [];
  while (queue.length) {
    const u = queue.shift()!;
    order.push(u);
    for (const n of adj.get(u)!) {
      indeg.set(n.id, indeg.get(n.id)! - 1);
      if (indeg.get(n.id) === 0) queue.push(n.id);
    }
  }
  if (order.length !== v.nodes.length) throw new Error("graph has a cycle, no topological order exists");
  return order;
}

/** Probe order of classic binary search with mid = floor((lo + hi) / 2). Stops when the target is found or the range is empty. */
export function binarySearchProbes(values: number[], target: number): number[] {
  const probes: number[] = [];
  let lo = 0;
  let hi = values.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    probes.push(mid);
    if (values[mid] === target) break;
    if (values[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return probes;
}

function childrenOf(v: NodeVisual, tieBreak: TieBreak) {
  const adj = adjacency(v, tieBreak);
  return (u: string, parent?: string) => adj.get(u)!.map((n) => n.id).filter((id) => id !== parent);
}

export function treeOrder(v: Visual, kind: "preorder" | "inorder" | "postorder", tieBreak: TieBreak): string[] {
  assertNodeVisual(v);
  const kids = childrenOf(v, tieBreak);
  const pos = new Map(v.nodes.map((n) => [n.id, n]));
  const order: string[] = [];
  const walk = (u: string, parent?: string) => {
    const cs = kids(u, parent);
    if (kind === "preorder") order.push(u);
    if (kind === "inorder") {
      const left = cs.filter((c) => pos.get(c)!.x < pos.get(u)!.x);
      const right = cs.filter((c) => pos.get(c)!.x >= pos.get(u)!.x);
      left.forEach((c) => walk(c, u));
      order.push(u);
      right.forEach((c) => walk(c, u));
      return;
    }
    cs.forEach((c) => walk(c, u));
    if (kind === "postorder") order.push(u);
  };
  walk(startOf(v));
  return order;
}

/** Reads "search for 22" (or "searching for 22") from a binary-search question. */
export function binarySearchTarget(question: string): number {
  const m = /search(?:ing)? for (-?\d+)/i.exec(question);
  if (!m) throw new Error('binary-search question must contain "search for <number>"');
  return Number(m[1]);
}

/** Runs the validation's own algorithm on its own visual and returns the full order the algorithm produces. */
export function runTraceOrder(v: TraceOrderValidation): string[] {
  const { visual, tieBreak } = v;
  switch (v.algorithm) {
    case "bfs": return bfsOrder(visual, tieBreak);
    case "dfs": return dfsOrder(visual, tieBreak);
    case "dijkstra": return dijkstraOrder(visual, tieBreak);
    case "topoKahn": return topoKahnOrder(visual, tieBreak);
    case "preorder":
    case "inorder":
    case "postorder": return treeOrder(visual, v.algorithm, tieBreak);
    case "binarySearch": {
      if (visual.kind !== "array") throw new Error("binarySearch needs an array visual");
      const cells = (visual as ArrayVisual).cells;
      const probes = binarySearchProbes(cells.map((c) => Number(c.label)), binarySearchTarget(v.question));
      return probes.map((i) => cells[i].id);
    }
  }
}

export interface AlgorithmIssue {
  scenarioId: string;
  message: string;
}

/** Content rule: every traceOrder `answer` equals the algorithm's output; Dijkstra/BFS first-step answers agree too. */
export function checkAlgorithmAnswers(scenarios: Scenario[]): AlgorithmIssue[] {
  const issues: AlgorithmIssue[] = [];
  for (const s of scenarios) {
    for (const val of s.validations) {
      if (val.type === "traceOrder") {
        const actual = runTraceOrder(val);
        if (actual.join(",") !== val.answer.join(","))
          issues.push({ scenarioId: s.id, message: `${val.algorithm} gives [${actual.join(", ")}] but answer is [${val.answer.join(", ")}]` });
      } else if (val.type === "traceFirstStep" && val.visual.kind !== "array") {
        const alg = /dijkstra/i.test(val.question) ? dijkstraOrder : /\b(bfs|breadth)/i.test(val.question) ? bfsOrder : undefined;
        if (!alg) continue;
        const next = alg(val.visual, "alphabetical")[1];
        if (next !== val.answerTargetId)
          issues.push({ scenarioId: s.id, message: `first step after the start is ${next} but answerTargetId is ${val.answerTargetId}` });
      }
    }
  }
  return issues;
}
