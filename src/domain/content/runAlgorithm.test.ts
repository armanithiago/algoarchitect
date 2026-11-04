import bundle from "@/content/scenarios.v1.json";
import { checkBundle } from "./validate";
import type { Visual } from "./schema";
import {
  bfsOrder, binarySearchProbes, checkAlgorithmAnswers, dfsOrder, dijkstraOrder, runTraceOrder, topoKahnOrder, treeOrder,
} from "./runAlgorithm";

const node = (id: string, x = 100, y = 100) => ({ id, label: id, x, y });
const graph = (edges: [string, string, number?][], ids: string[], extra: { start?: string } = {}): Visual => ({
  kind: "graph",
  nodes: ids.map((id) => node(id)),
  edges: edges.map(([from, to, weight]) => ({ from, to, ...(weight ? { weight } : {}) })),
  ...extra,
});

describe("runners on small known graphs", () => {
  // S-B, S-A, A-C, B-C, B-D
  const g = graph([["S", "B"], ["S", "A"], ["A", "C"], ["B", "C"], ["B", "D"]], ["S", "B", "A", "C", "D"], { start: "S" });

  it("bfs honors alphabetical vs authored neighbor order", () => {
    expect(bfsOrder(g, "alphabetical")).toEqual(["S", "A", "B", "C", "D"]);
    expect(bfsOrder(g, "authored")).toEqual(["S", "B", "A", "C", "D"]);
  });

  it("dfs is preorder over the chosen adjacency order", () => {
    expect(dfsOrder(g, "alphabetical")).toEqual(["S", "A", "C", "B", "D"]);
    expect(dfsOrder(g, "authored")).toEqual(["S", "B", "C", "A", "D"]);
  });

  it("dijkstra settles by distance, then by tie-break", () => {
    const w = graph([["S", "A", 7], ["S", "B", 2], ["S", "C", 4], ["A", "D", 1], ["B", "C", 3], ["C", "D", 2]], ["S", "A", "B", "C", "D"], { start: "S" });
    // dist: S0 B2 C4 D6 A7
    expect(dijkstraOrder(w, "alphabetical")).toEqual(["S", "B", "C", "D", "A"]);
    const tie = graph([["S", "B", 1], ["S", "A", 1]], ["S", "B", "A"], { start: "S" });
    expect(dijkstraOrder(tie, "alphabetical")).toEqual(["S", "A", "B"]);
    expect(dijkstraOrder(tie, "authored")).toEqual(["S", "B", "A"]);
  });

  it("kahn emits sources first and rejects cycles", () => {
    const dag: Visual = {
      kind: "graph",
      nodes: ["a", "b", "c", "d"].map((id) => node(id)),
      edges: [{ from: "b", to: "c", directed: true }, { from: "a", to: "c", directed: true }, { from: "c", to: "d", directed: true }],
    };
    expect(topoKahnOrder(dag, "alphabetical")).toEqual(["a", "b", "c", "d"]);
    const cyc: Visual = {
      kind: "graph",
      nodes: ["a", "b"].map((id) => node(id)),
      edges: [{ from: "a", to: "b", directed: true }, { from: "b", to: "a", directed: true }],
    };
    expect(() => topoKahnOrder(cyc, "alphabetical")).toThrow(/cycle/);
  });

  it("binary search probes use floor((lo + hi) / 2)", () => {
    const v = [4, 9, 15, 22, 31, 38, 46, 57, 63];
    expect(binarySearchProbes(v, 22)).toEqual([4, 1, 2, 3]);
    expect(binarySearchProbes(v, 31)).toEqual([4]);
    expect(binarySearchProbes(v, 5)).toEqual([4, 1, 0]);
  });

  it("tree traversals on a small BST", () => {
    //      2
    //     / \
    //    1   3      (4 hangs to the right of 3)
    const t: Visual = {
      kind: "tree",
      start: "2",
      nodes: [node("2", 160, 40), node("1", 100, 100), node("3", 220, 100), node("4", 260, 160)],
      edges: [{ from: "2", to: "1" }, { from: "2", to: "3" }, { from: "3", to: "4" }],
    };
    expect(treeOrder(t, "preorder", "authored")).toEqual(["2", "1", "3", "4"]);
    expect(treeOrder(t, "inorder", "authored")).toEqual(["1", "2", "3", "4"]);
    expect(treeOrder(t, "postorder", "authored")).toEqual(["1", "4", "3", "2"]);
  });
});

describe("scenarios.v1.json trace answers", () => {
  const { scenarios } = checkBundle(bundle);

  it("every traceOrder answer equals the algorithm's real output", () => {
    const traces = scenarios.flatMap((s) => s.validations.filter((v) => v.type === "traceOrder"));
    expect(traces.length).toBeGreaterThanOrEqual(3);
    const issues = checkAlgorithmAnswers(scenarios);
    expect(issues, JSON.stringify(issues, null, 2)).toEqual([]);
  });

  it("the answer is a prefix-aligned run of the full algorithm order", () => {
    for (const s of scenarios)
      for (const v of s.validations)
        if (v.type === "traceOrder") expect(runTraceOrder(v).slice(0, v.answer.length)).toEqual(v.answer);
  });
});
