/**
 * Pure logic for TraceCanvas (design system §7.4, §7.23): targets, generated descriptions, selection rules,
 * per-target states and the geometry shared by the canvas and the tests. No React in here.
 */
import { VIEWBOX, type Visual } from "@/domain/content/schema";
import type { TraceMode } from "./types";

export type GraphVisual = Extract<Visual, { kind: "graph" | "tree" }>;
export type ArrayVisual = Extract<Visual, { kind: "array" }>;

export const NODE_R = 18;
export const START_RING_GAP = 4;
export const FOCUS_GAP = 5;
export const HIT_SIZE = 48;
export const ARROW_LEN = 6;

export type TargetState = "default" | "selected" | "sequenced" | "correct" | "incorrect" | "dimmed";

export interface Target {
  id: string;
  label: string;
}

export interface TargetInfo {
  state: TargetState;
  /** 1-based step number of the user's tap (order mode), else null. */
  position: number | null;
  /** The user's pick is on this target (first mode: the selected one; order mode: any sequenced one). */
  picked: boolean;
  /** The target is a locked `givenPrefix` entry (order mode). */
  locked: boolean;
  /** Order mode, after Check, wrong row: the position this target should have had. */
  shouldBe: number | null;
}

export function isArrayVisual(visual: Visual): visual is ArrayVisual {
  return visual.kind === "array";
}

export function getTargets(visual: Visual): Target[] {
  return isArrayVisual(visual)
    ? visual.cells.map((c) => ({ id: c.id, label: c.label }))
    : visual.nodes.map((n) => ({ id: n.id, label: n.label }));
}

/* ---------- Selection model ---------- */

/** The next `value` after a tap on `id`, or null when the tap changes nothing. */
export function nextValue(
  mode: TraceMode,
  value: readonly string[],
  id: string,
  givenPrefix: number,
  totalSteps: number,
): string[] | null {
  if (mode === "first") return value.length === 1 && value[0] === id ? null : [id];
  const at = value.indexOf(id);
  if (at >= 0) {
    // Only the last user-tapped target can be removed; locked and earlier ones ignore taps.
    return at === value.length - 1 && at >= givenPrefix ? value.slice(0, -1) : null;
  }
  return value.length >= totalSteps ? null : [...value, id];
}

/** Undo: drops the last user tap, never a locked one. */
export function undoValue(value: readonly string[], givenPrefix: number): string[] | null {
  return value.length > givenPrefix ? value.slice(0, -1) : null;
}

/* ---------- States ---------- */

export function computeStates(
  targets: readonly Target[],
  mode: TraceMode,
  value: readonly string[],
  givenPrefix: number,
  checked: boolean,
  expected: readonly string[] | null,
): Map<string, TargetInfo> {
  const out = new Map<string, TargetInfo>();
  for (const t of targets) {
    const at = value.indexOf(t.id);
    const position = mode === "order" && at >= 0 ? at + 1 : null;
    const locked = mode === "order" && at >= 0 && at < givenPrefix;
    let state: TargetState = "default";
    let shouldBe: number | null = null;
    if (!checked) {
      if (mode === "first") state = at === 0 ? "selected" : "default";
      else if (at >= 0) state = "sequenced";
    } else if (mode === "first") {
      if (expected?.[0] === t.id) state = "correct";
      else if (value[0] === t.id) state = "incorrect";
      else state = "dimmed";
    } else if (at >= 0) {
      const ok = expected?.[at] === t.id;
      state = ok ? "correct" : "incorrect";
      const should = expected ? expected.indexOf(t.id) : -1;
      if (!ok && should >= 0) shouldBe = should + 1;
    } else {
      state = "dimmed";
    }
    out.set(t.id, { state, position, picked: mode === "first" ? at === 0 : at >= 0, locked, shouldBe });
  }
  return out;
}

/* ---------- Generated descriptions (shared by the canvas hit buttons and the List view) ---------- */

export interface Description {
  /** Accessible name base, e.g. "B · neighbors: C (3), S (2)". */
  name: string;
  /** Text shown in a List row next to the key badge (the label is already in the badge for graphs and trees). */
  rowText: string;
}

const byText = (a: string, b: string) => a.localeCompare(b, "en", { numeric: true });

function adjacency(visual: GraphVisual): Map<string, { id: string; weight?: number }[]> {
  const adj = new Map<string, { id: string; weight?: number }[]>(visual.nodes.map((n) => [n.id, []]));
  for (const e of visual.edges) {
    adj.get(e.from)?.push({ id: e.to, weight: e.weight });
    if (!e.directed) adj.get(e.to)?.push({ id: e.from, weight: e.weight });
  }
  return adj;
}

/** Parent/children for a tree. Root = `start`, else the first node; edges are treated as undirected links. */
export function treeStructure(visual: GraphVisual): {
  root: string;
  parent: Map<string, string | null>;
  children: Map<string, string[]>;
} {
  const root = visual.start ?? visual.nodes[0]!.id;
  const x = new Map(visual.nodes.map((n) => [n.id, n.x]));
  const links = new Map<string, string[]>(visual.nodes.map((n) => [n.id, []]));
  for (const e of visual.edges) {
    links.get(e.from)?.push(e.to);
    links.get(e.to)?.push(e.from);
  }
  const parent = new Map<string, string | null>([[root, null]]);
  const children = new Map<string, string[]>(visual.nodes.map((n) => [n.id, []]));
  const queue = [root];
  while (queue.length) {
    const cur = queue.shift()!;
    const kids = (links.get(cur) ?? []).filter((k) => !parent.has(k));
    kids.sort((a, b) => (x.get(a) ?? 0) - (x.get(b) ?? 0));
    for (const k of kids) {
      parent.set(k, cur);
      queue.push(k);
    }
    children.set(cur, kids);
  }
  return { root, parent, children };
}

export function describeTargets(visual: Visual): Map<string, Description> {
  const out = new Map<string, Description>();
  if (isArrayVisual(visual)) {
    visual.cells.forEach((c, i) => {
      const text = `Index ${i} · value ${c.label}`;
      out.set(c.id, { name: text, rowText: text });
    });
    return out;
  }
  const label = new Map(visual.nodes.map((n) => [n.id, n.label]));
  const lab = (id: string) => label.get(id) ?? id;
  if (visual.kind === "tree") {
    const { root, parent, children } = treeStructure(visual);
    for (const n of visual.nodes) {
      const p = parent.get(n.id);
      const role = n.id === root ? "root" : p === root ? "child of root" : p ? `child of ${lab(p)}` : "not connected";
      const kids = children.get(n.id) ?? [];
      const rowText = `${role} · children: ${kids.length ? kids.map(lab).join(", ") : "none"}`;
      out.set(n.id, { name: `${n.label} · ${rowText}`, rowText });
    }
    return out;
  }
  const adj = adjacency(visual);
  for (const n of visual.nodes) {
    const neigh = (adj.get(n.id) ?? [])
      .map((o) => ({ text: lab(o.id), weight: o.weight }))
      .sort((a, b) => byText(a.text, b.text))
      .map((o) => (o.weight !== undefined ? `${o.text} (${o.weight})` : o.text));
    const rowText = `${n.id === visual.start ? "start · " : ""}neighbors: ${neigh.length ? neigh.join(", ") : "none"}`;
    out.set(n.id, { name: `${n.label} · ${rowText}`, rowText });
  }
  return out;
}

export function summaryText(visual: Visual, mode: TraceMode, givenPrefix: number): string {
  let base: string;
  if (isArrayVisual(visual)) base = `Array, ${visual.cells.length} cells.`;
  else if (visual.kind === "tree") {
    const { root } = treeStructure(visual);
    base = `Tree, ${visual.nodes.length} nodes. Root: ${visual.nodes.find((n) => n.id === root)?.label ?? root}.`;
  } else {
    const weighted = visual.edges.some((e) => e.weight !== undefined);
    const directed = visual.edges.some((e) => e.directed);
    const kind = `${directed ? "Directed " : ""}${weighted ? "weighted" : "unweighted"}`;
    const start = visual.nodes.find((n) => n.id === visual.start);
    base = `${kind[0]!.toUpperCase()}${kind.slice(1)} graph, ${visual.nodes.length} nodes.${start ? ` Start: ${start.label}.` : ""}`;
  }
  if (mode === "first") return base;
  const noun = isArrayVisual(visual) ? "cells" : "nodes";
  const given = givenPrefix > 0 ? ` The first ${givenPrefix === 1 ? "step is" : `${givenPrefix} steps are`} given.` : "";
  return `${base}${given} Tap ${noun} in visit order; tap the last one again to undo.`;
}

/** Accessible name of one target: description + step + verdict (design system §7.4, §7.23). */
export function targetName(base: string, mode: TraceMode, info: TargetInfo): string {
  let name = base;
  if (mode === "order" && info.position !== null) name += `, step ${info.position}`;
  if (info.state === "correct") name += ", correct";
  else if (info.state === "incorrect") name += mode === "order" ? ", wrong position" : ", your pick, incorrect";
  return name;
}

export interface ReadoutParts {
  lead: string;
  /** The monospace part (the sequence), when any. */
  mono: string | null;
  tail: string;
}

export function readoutParts(
  visual: Visual,
  mode: TraceMode,
  value: readonly string[],
  totalSteps: number,
  checked: boolean,
  expected: readonly string[] | null,
): ReadoutParts {
  const label = new Map(getTargets(visual).map((t) => [t.id, t.label]));
  const lab = (id: string) => label.get(id) ?? id;
  const noun = isArrayVisual(visual) ? "cell" : "node";
  if (mode === "first") {
    const pick = value[0];
    if (pick === undefined) return { lead: `Tap a ${noun} · nothing selected`, mono: null, tail: "" };
    if (!checked || !expected?.length) return { lead: "Selected: ", mono: lab(pick), tail: "" };
    return {
      lead: "Selected: ",
      mono: lab(pick),
      tail: expected[0] === pick ? " · correct" : ` · should be ${lab(expected[0]!)}`,
    };
  }
  const seq = value.length ? value.map(lab).join(" → ") : "none";
  const progress = ` · ${value.length} of ${totalSteps}`;
  if (checked) return { lead: "Your order: ", mono: seq, tail: progress };
  return { lead: "Order: ", mono: seq, tail: `${progress}${value.length < totalSteps ? ` · tap the next ${noun}` : ""}` };
}

export function readoutText(...args: Parameters<typeof readoutParts>): string {
  const r = readoutParts(...args);
  return `${r.lead}${r.mono ?? ""}${r.tail}`;
}

/* ---------- Geometry ---------- */

export interface Point {
  x: number;
  y: number;
}

/** Ring radius of a node (the start node has an extra ring at r + 4). */
export function outerRadius(isStart: boolean): number {
  return NODE_R + (isStart ? START_RING_GAP : 0);
}

export interface EdgeShape {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  mid: Point;
  weight?: number;
  /** Arrowhead polygon points, when directed. */
  arrow?: string;
}

export function edgeShapes(visual: GraphVisual): EdgeShape[] {
  const pos = new Map(visual.nodes.map((n) => [n.id, n]));
  const shapes: EdgeShape[] = [];
  visual.edges.forEach((e, i) => {
    const a = pos.get(e.from);
    const b = pos.get(e.to);
    if (!a || !b) return;
    const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const ux = (b.x - a.x) / d;
    const uy = (b.y - a.y) / d;
    const ra = outerRadius(a.id === visual.start);
    const rb = outerRadius(b.id === visual.start);
    const x1 = a.x + ux * ra;
    const y1 = a.y + uy * ra;
    let x2 = b.x - ux * rb;
    let y2 = b.y - uy * rb;
    let arrow: string | undefined;
    if (e.directed) {
      const bx = x2 - ux * ARROW_LEN;
      const by = y2 - uy * ARROW_LEN;
      const hw = ARROW_LEN * 0.55;
      arrow = `${x2},${y2} ${bx - uy * hw},${by + ux * hw} ${bx + uy * hw},${by - ux * hw}`;
      x2 = bx;
      y2 = by;
    }
    shapes.push({
      key: `${e.from}-${e.to}-${i}`,
      x1,
      y1,
      x2,
      y2,
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      weight: e.weight,
      arrow,
    });
  });
  return shapes;
}

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Hit rectangle (CSS px, relative to the canvas box) of a node at a given canvas width. Always 48 x 48. */
export function hitRect(node: Point, canvasWidth: number): Rect {
  const scale = canvasWidth / VIEWBOX.width;
  const cx = node.x * scale;
  const cy = node.y * scale;
  return { left: cx - HIT_SIZE / 2, top: cy - HIT_SIZE / 2, right: cx + HIT_SIZE / 2, bottom: cy + HIT_SIZE / 2 };
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}
