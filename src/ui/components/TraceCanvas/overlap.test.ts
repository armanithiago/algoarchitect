import { describe, expect, it } from "vitest";
import { VIEWBOX } from "@/domain/content/schema";
import { draftFixtures, mainFixtures } from "./fixtures";
import { HIT_SIZE, hitRect, rectsOverlap } from "./model";

/** 360 px wide phone: page gutter 16 x 2, card border 1 x 2, card padding 12 x 2 -> canvas box 304 px (scale 0.95). */
const CANVAS_360 = 304;
const all = [...mainFixtures.map((f) => ({ file: "scenarios.v1.json", f })), ...draftFixtures.flatMap((d) => d.fixtures.map((f) => ({ file: d.file, f })))];

describe("overlap guard: 48 px hit rectangles never overlap", () => {
  it("covers the real content", () => {
    expect(all.length).toBeGreaterThanOrEqual(7);
    expect(all.some(({ f }) => f.visual.kind === "graph")).toBe(true);
    expect(all.some(({ f }) => f.visual.kind === "tree")).toBe(true);
  });

  it.each(all.map(({ file, f }) => [`${file} ${f.scenarioId} ${f.type}`, f] as const))("%s", (_name, f) => {
    const v = f.visual;
    if (v.kind === "array") {
      // Cells are the buttons: 6 per row at 304 px is 50.7 px wide, and always 48 px tall.
      expect(CANVAS_360 / Math.min(6, v.cells.length)).toBeGreaterThanOrEqual(HIT_SIZE);
      expect(v.cells.length).toBeLessThanOrEqual(12);
      return;
    }
    for (const width of [CANVAS_360]) {
      const rects = v.nodes.map((n) => ({ id: n.id, r: hitRect(n, width) }));
      for (let i = 0; i < rects.length; i++) {
        for (let j = i + 1; j < rects.length; j++) {
          expect(rectsOverlap(rects[i]!.r, rects[j]!.r), `${rects[i]!.id} / ${rects[j]!.id} overlap at ${width}px`).toBe(false);
        }
      }
    }
    // The content rule behind it: centers at least 52 units apart (>= 49.4 px at 360), nodes inside the viewBox with a margin.
    for (let i = 0; i < v.nodes.length; i++) {
      const a = v.nodes[i]!;
      expect(a.x).toBeGreaterThanOrEqual(26);
      expect(a.x).toBeLessThanOrEqual(VIEWBOX.width - 26);
      expect(a.y).toBeGreaterThanOrEqual(26);
      expect(a.y).toBeLessThanOrEqual(VIEWBOX.height - 26);
      for (let j = i + 1; j < v.nodes.length; j++) {
        const b = v.nodes[j]!;
        expect(Math.hypot(a.x - b.x, a.y - b.y), `${a.id}/${b.id} distance`).toBeGreaterThanOrEqual(52);
      }
    }
  });

  it("the check can fail: two nodes 40 units apart do overlap", () => {
    expect(rectsOverlap(hitRect({ x: 100, y: 100 }, CANVAS_360), hitRect({ x: 140, y: 100 }, CANVAS_360))).toBe(true);
  });
});
