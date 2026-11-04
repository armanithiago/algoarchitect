import { ArrowDownWideNarrow, Grid3x3, Hash, Network, Route, type LucideIcon } from "lucide-react";

export type Domain = "graphs" | "dp" | "trees" | "sorting" | "hashing";

export interface DomainMeta {
  /** Full name, used in Stats. */
  label: string;
  /** Short name, used in chips. */
  short: string;
  icon: LucideIcon;
  /** Static class strings only: Tailwind cannot detect names built at run time (design system §7.10). */
  subtle: string;
  dot: string;
}

export const DOMAINS: Record<Domain, DomainMeta> = {
  graphs: {
    label: "Graphs & Routing",
    short: "Graphs",
    icon: Route,
    subtle: "bg-graphs-subtle text-graphs-fg",
    dot: "bg-graphs",
  },
  dp: {
    label: "Dynamic Programming",
    short: "DP",
    icon: Grid3x3,
    subtle: "bg-dp-subtle text-dp-fg",
    dot: "bg-dp",
  },
  trees: {
    label: "Trees & Tries",
    short: "Trees",
    icon: Network,
    subtle: "bg-trees-subtle text-trees-fg",
    dot: "bg-trees",
  },
  sorting: {
    label: "Sorting & Searching",
    short: "Sorting",
    icon: ArrowDownWideNarrow,
    subtle: "bg-sorting-subtle text-sorting-fg",
    dot: "bg-sorting",
  },
  hashing: {
    label: "Hashing & Heaps",
    short: "Hashing",
    icon: Hash,
    subtle: "bg-hashing-subtle text-hashing-fg",
    dot: "bg-hashing",
  },
};

export const DOMAIN_ORDER: Domain[] = ["graphs", "dp", "trees", "sorting", "hashing"];
