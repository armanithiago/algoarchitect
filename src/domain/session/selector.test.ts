import { describe, expect, it } from "vitest";
import { DOMAINS, type Domain, type Scenario } from "@/domain/content/schema";
import { composeSession, seededRng, shuffle } from "./selector";

function make(domain: Domain, n: number, optionCount = 4): Scenario {
  const ids = ["a", "b", "c", "d"].slice(0, optionCount);
  return {
    id: `${domain}-${String(n).padStart(3, "0")}`,
    version: 1,
    domain,
    concept: `c-${domain}-${n}`,
    difficulty: 1,
    title: `T ${domain} ${n}`,
    prompt: "p".repeat(50),
    options: ids.map((id) => ({ id, label: `L${id}`, rationale: "r".repeat(12) })),
    correctOptionId: "b",
    explanation: "e".repeat(50),
    validations: [],
    study: [],
    tags: [],
  } as unknown as Scenario;
}

const pool15: Scenario[] = DOMAINS.flatMap((d) => [1, 2, 3].map((n) => make(d, n)));

describe("shuffle / seededRng", () => {
  it("is deterministic per seed and keeps the elements", () => {
    const a = shuffle([1, 2, 3, 4, 5], seededRng(7));
    expect(shuffle([1, 2, 3, 4, 5], seededRng(7))).toEqual(a);
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5]);
  });
  it("survives an rng returning exactly 1", () => {
    expect(shuffle([1, 2, 3], () => 1)).toHaveLength(3);
  });
});

describe("composeSession", () => {
  it("returns SESSION_SIZE (10) unique scenarios from 15", () => {
    const items = composeSession({ scenarios: pool15, rng: seededRng(1) });
    expect(items).toHaveLength(10);
    expect(new Set(items.map((i) => i.scenario.id)).size).toBe(10);
  });

  it("caps count at the available scenarios", () => {
    expect(composeSession({ scenarios: pool15.slice(0, 3), rng: seededRng(1) })).toHaveLength(3);
    expect(composeSession({ scenarios: pool15, count: 99, rng: seededRng(1) })).toHaveLength(15);
    expect(composeSession({ scenarios: pool15, count: 0, rng: seededRng(1) })).toEqual([]);
    expect(composeSession({ scenarios: [], rng: seededRng(1) })).toEqual([]);
  });

  it("balances domains round-robin (10 of 15 => 2 per domain)", () => {
    for (let seed = 0; seed < 50; seed++) {
      const items = composeSession({ scenarios: pool15, rng: seededRng(seed) });
      const counts = new Map<string, number>();
      for (const i of items) counts.set(i.scenario.domain, (counts.get(i.scenario.domain) ?? 0) + 1);
      expect([...counts.values()]).toEqual([2, 2, 2, 2, 2]);
    }
  });

  it("handles uneven domains without exceeding what exists", () => {
    const uneven = [make("graphs", 1), make("graphs", 2), make("graphs", 3), make("dp", 1)];
    const items = composeSession({ scenarios: uneven, count: 4, rng: seededRng(3) });
    expect(items.map((i) => i.scenario.id).sort()).toEqual(uneven.map((s) => s.id).sort());
  });

  it("filters by domain", () => {
    const items = composeSession({ scenarios: pool15, domain: "dp", rng: seededRng(2) });
    expect(items).toHaveLength(3);
    expect(items.every((i) => i.scenario.domain === "dp")).toBe(true);
  });

  it("honours excludeIds and de-duplicates the input", () => {
    const items = composeSession({ scenarios: [...pool15, pool15[0]], excludeIds: [pool15[1].id], count: 15, rng: seededRng(2) });
    expect(items).toHaveLength(14);
    expect(items.some((i) => i.scenario.id === pool15[1].id)).toBe(false);
    expect(new Set(items.map((i) => i.scenario.id)).size).toBe(14);
  });

  it("is deterministic for a seed and varies across seeds", () => {
    const run = (s: number) => composeSession({ scenarios: pool15, rng: seededRng(s) });
    expect(run(42)).toEqual(run(42));
    const sigs = new Set(Array.from({ length: 20 }, (_, s) => run(s).map((i) => i.scenario.id).join()));
    expect(sigs.size).toBeGreaterThan(5);
  });

  it("optionOrder is a permutation of the option ids (3 and 4 options)", () => {
    const items = composeSession({ scenarios: [make("dp", 1, 3), make("dp", 2, 4)], rng: seededRng(5) });
    for (const i of items) {
      expect([...i.optionOrder].sort()).toEqual(i.scenario.options.map((o) => o.id).sort());
    }
  });

  it("the correct option lands in every slot across many seeds, roughly uniformly", () => {
    const slots = [0, 0, 0, 0];
    const N = 2000;
    for (let seed = 0; seed < N; seed++) {
      const [item] = composeSession({ scenarios: [make("dp", 1)], count: 1, rng: seededRng(seed) });
      slots[item.optionOrder.indexOf(item.scenario.correctOptionId)]++;
    }
    for (const c of slots) {
      expect(c).toBeGreaterThan(N * 0.18);
      expect(c).toBeLessThan(N * 0.32);
    }
  });
});
