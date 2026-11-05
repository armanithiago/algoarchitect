const ACRONYMS = new Set(["bfs", "dfs", "dp", "lru", "lfu", "dag", "avl", "mst", "kmp", "scc", "bst"]);

/**
 * Curated display names. Every concept used by a scenario needs an entry here: the content test fails otherwise
 * (src/content/content.test.ts), so a new scenario can never reach the summary with a mangled name.
 */
export const CONCEPT_NAMES: Record<string, string> = {
  "balanced-bst": "Balanced BST",
  "bellman-ford": "Bellman-Ford",
  bfs: "Breadth-first search",
  "bfs-shallowest-match": "BFS shallowest match",
  "binary-search": "Binary search",
  "binary-search-bounds": "Binary search bounds",
  "binary-search-on-answer": "Binary search on the answer",
  "bipartite-check": "Bipartite check",
  "bounded-shortest-path": "Hop-limited shortest path",
  "bst-minimum": "BST minimum lookup",
  "coin-change": "Coin change",
  "complement-lookup": "Complement lookup",
  "consistent-hashing": "Consistent hashing",
  "counting-sort": "Counting sort",
  "cycle-detection": "Cycle detection",
  dijkstra: "Dijkstra",
  "edit-distance": "Edit distance",
  "external-merge-sort": "External merge sort",
  "flood-fill": "Flood fill",
  "frequency-count": "Frequency counting",
  "grid-paths": "Grid path counting",
  "hash-set-dedup": "Hash set dedup",
  "inorder-traversal": "In-order traversal",
  "insertion-sort": "Insertion sort",
  knapsack: "0/1 knapsack",
  lcs: "Longest common subsequence",
  "level-order-traversal": "Level-order traversal",
  lis: "Longest increasing subsequence",
  "lowest-common-ancestor": "Lowest common ancestor",
  "lru-cache": "LRU cache",
  "max-non-adjacent-sum": "Non-adjacent selection",
  memoization: "Memoization",
  "merge-intervals": "Merge intervals",
  "merge-sorted-lists": "Merging sorted lists",
  "min-heap": "Min-heap",
  "minimum-spanning-tree": "Minimum spanning tree",
  "ordered-interval-index": "Ordered interval index",
  "postorder-traversal": "Postorder traversal",
  "prefix-sum-hashmap": "Prefix sum + hash map",
  "preorder-traversal": "Preorder traversal",
  quickselect: "Quickselect",
  "space-optimized-dp": "Space-optimized DP",
  "stable-sort": "Stable sort",
  "state-machine-dp": "State machine DP",
  "token-bucket": "Token bucket",
  "top-k-heap": "Top-K heap",
  "topological-sort": "Topological sort",
  trie: "Trie",
  "two-heaps-median": "Two-heap running median",
  "union-find": "Union-find",
};

/**
 * Display name for a concept slug (`consistent-hashing` -> "Consistent hashing", `bfs` -> "BFS").
 * The content schema stores only the slug; a curated display name can replace this later without touching callers.
 */
export function conceptName(slug: string): string {
  if (CONCEPT_NAMES[slug]) return CONCEPT_NAMES[slug];
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
