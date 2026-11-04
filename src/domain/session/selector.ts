/** Scenario selector (E3-05). Pure: all randomness comes from the injected `rng` (returns [0, 1)). */
import type { Domain, Scenario } from "@/domain/content/schema";
import { SESSION_SIZE, type SessionItem } from "./types";

export interface ComposeOptions {
  scenarios: readonly Scenario[];
  count?: number;
  rng: () => number;
  domain?: Domain;
  excludeIds?: readonly string[];
}

/** Fisher-Yates, returns a new array. */
export function shuffle<T>(input: readonly T[], rng: () => number): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(rng() * (i + 1)));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Seedable PRNG (mulberry32) for tests and reproducible sessions. */
export function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * EXTENSION POINT (Sprint 4, E4-xx spaced repetition): due-review weighting plugs in here. Replace the plain
 * per-domain shuffle below with an ordering that puts due scenarios first; the round-robin and the option
 * shuffle stay as they are.
 */
function orderPool(pool: Scenario[], rng: () => number): Scenario[] {
  return shuffle(pool, rng);
}

export function composeSession({ scenarios, count = SESSION_SIZE, rng, domain, excludeIds = [] }: ComposeOptions): SessionItem[] {
  const excluded = new Set(excludeIds);
  const seen = new Set<string>();
  const eligible = scenarios.filter((s) => {
    if (excluded.has(s.id) || seen.has(s.id) || (domain && s.domain !== domain)) return false;
    seen.add(s.id);
    return true;
  });
  const want = Math.max(0, Math.min(Math.floor(count), eligible.length));

  // Group by domain (first-seen order, then shuffled), round-robin across the groups.
  const groups = new Map<Domain, Scenario[]>();
  for (const s of eligible) groups.set(s.domain, [...(groups.get(s.domain) ?? []), s]);
  const queues = shuffle([...groups.keys()], rng).map((d) => orderPool(groups.get(d) ?? [], rng));

  const picked: Scenario[] = [];
  for (let round = 0; picked.length < want; round++) {
    for (const q of queues) {
      if (picked.length >= want) break;
      if (round < q.length) picked.push(q[round]);
    }
  }

  return picked.map((scenario) => ({
    scenario,
    optionOrder: shuffle(
      scenario.options.map((o) => o.id),
      rng,
    ),
  }));
}
