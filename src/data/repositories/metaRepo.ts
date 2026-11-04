import { getDb } from "../db";
import type { MetaValues } from "../types";

export type MetaKey = keyof MetaValues;

export const metaRepo = {
  async get<K extends MetaKey>(key: K): Promise<MetaValues[K] | undefined> {
    const row = await getDb().meta.get(key);
    return row?.value as MetaValues[K] | undefined;
  },

  async set<K extends MetaKey>(key: K, value: MetaValues[K]): Promise<void> {
    await getDb().meta.put({ key, value });
  },

  /**
   * Records schemaVersion (always current), contentVersion (null if absent) and installedAt (only on
   * the very first run, never overwritten). Returns the installedAt value.
   */
  async ensureInitialised(now: Date = new Date()): Promise<string> {
    const db = getDb();
    return db.transaction("rw", db.meta, async () => {
      await db.meta.put({ key: "schemaVersion", value: db.verno });
      if (!(await db.meta.get("contentVersion"))) await db.meta.put({ key: "contentVersion", value: null });
      const existing = await db.meta.get("installedAt");
      if (typeof existing?.value === "string") return existing.value;
      const installedAt = now.toISOString();
      await db.meta.put({ key: "installedAt", value: installedAt });
      return installedAt;
    });
  },
};
