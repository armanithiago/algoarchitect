import Dexie, { type Table } from "dexie";
import { migrations as shippedMigrations } from "./migrations";
import type { Migration } from "./migrations/types";
import type { AttemptRow, EventQueueRow, MetaRow, ProfileRow, ReadingRow, ReviewRow } from "./types";

export const DB_NAME = "algoarchitect";

export class AlgoDatabase extends Dexie {
  reviews!: Table<ReviewRow, string>;
  attempts!: Table<AttemptRow, number>;
  profile!: Table<ProfileRow, string>;
  eventQueue!: Table<EventQueueRow, number>;
  reading!: Table<ReadingRow, string>;
  meta!: Table<MetaRow, string>;

  constructor(name: string = DB_NAME, list: readonly Migration[] = shippedMigrations) {
    super(name);
    const ordered = [...list].sort((a, b) => a.version - b.version);
    ordered.forEach((m, i) => {
      if (m.version !== i + 1) {
        throw new Error(`Migrations must be consecutive from 1, got ${m.version} at position ${i + 1}`);
      }
      const v = this.version(m.version).stores(m.stores);
      if (m.upgrade) v.upgrade(m.upgrade);
    });
  }
}

let instance: AlgoDatabase | null = null;

/** Lazily creates the shared database. Throws if IndexedDB does not exist in this environment. */
export function getDb(): AlgoDatabase {
  if (instance) return instance;
  if (typeof indexedDB === "undefined" || !indexedDB) throw new Error("IndexedDB is unavailable");
  instance = new AlgoDatabase();
  return instance;
}

/** Closes and forgets the shared connection (tests, restart simulation). */
export function closeDb(): void {
  instance?.close();
  instance = null;
}
