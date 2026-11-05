const ACRONYMS = new Set(["bfs", "dfs", "dp", "lru", "lfu", "dag", "avl", "mst", "kmp", "scc", "bst"]);

/**
 * Display name for a concept slug (`consistent-hashing` -> "Consistent hashing", `bfs` -> "BFS").
 * The content schema stores only the slug; a curated display name can replace this later without touching callers.
 */
export function conceptName(slug: string): string {
  const words = slug.split("-").filter(Boolean);
  return words
    .map((w, i) => (ACRONYMS.has(w) ? w.toUpperCase() : i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** "4 min 38 s", "38 s" (design system §1.4). Rounds to the nearest second. */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m} min ${s} s` : `${s} s`;
}
