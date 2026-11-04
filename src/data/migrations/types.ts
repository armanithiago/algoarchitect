import type { Transaction } from "dexie";

/**
 * One schema version. Versions are consecutive integers starting at 1.
 * `stores` lists ONLY tables that are new or whose indexes change (Dexie keeps the rest).
 * `upgrade` runs once, in the upgrade transaction, for databases coming from an older version.
 */
export interface Migration {
  version: number;
  description: string;
  stores: Record<string, string>;
  upgrade?: (tx: Transaction) => void | Promise<void>;
}
