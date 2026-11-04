import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AlgoDatabase, DB_NAME, closeDb, getDb } from "./db";
import { CURRENT_SCHEMA_VERSION, migrations } from "./migrations";
import type { Migration } from "./migrations/types";
import { v1 } from "./migrations/v1";
import type { AttemptRow, ProfileRow, ReviewRow } from "./types";

const NAME = "algoarchitect-test";

async function wipe() {
  closeDb();
  await Dexie.delete(NAME);
  await Dexie.delete(DB_NAME);
}
beforeEach(wipe);
afterEach(wipe);

const review: ReviewRow = {
  scenarioId: "s1",
  easiness: 2.4,
  intervalDays: 3,
  repetitions: 2,
  dueAt: 1_700_000_000_000,
  lapses: 1,
  lastResult: "correct",
};
const attempt = (n: number): AttemptRow => ({
  scenarioId: `s${n}`,
  concept: "bfs",
  domain: "graphs",
  correct: n % 2 === 0,
  validationResults: [true, false],
  studied: false,
  durationMs: 1200 * n,
  timestamp: 1_700_000_000_000 + n,
});
const profile: ProfileRow = {
  id: "me",
  xp: 340,
  level: 3,
  streakCount: 4,
  longestStreak: 9,
  lastActiveLocalDate: "2026-11-03",
  freezesAvailable: 1,
  settings: { haptics: false, analytics: true, codeLanguage: "cs" },
};

describe("schema v1", () => {
  it("defines every store with the documented keys and indexes", async () => {
    const db = new AlgoDatabase(NAME);
    await db.open();
    expect(db.verno).toBe(1);
    expect(CURRENT_SCHEMA_VERSION).toBe(1);
    const names = db.tables.map((t) => t.name).sort();
    expect(names).toEqual(["attempts", "eventQueue", "meta", "profile", "reading", "reviews"]);
    const s = (n: string) => db.table(n).schema;
    expect(s("reviews").primKey.keyPath).toBe("scenarioId");
    expect(s("profile").primKey.keyPath).toBe("id");
    expect(s("reading").primKey.keyPath).toBe("chapterId");
    expect(s("meta").primKey.keyPath).toBe("key");
    expect(s("attempts").primKey.auto).toBe(true);
    expect(s("eventQueue").primKey.auto).toBe(true);
    expect(s("attempts").idxByName).toHaveProperty("scenarioId");
    expect(s("attempts").idxByName).toHaveProperty("concept");
    expect(s("attempts").idxByName).toHaveProperty("domain");
    expect(s("attempts").idxByName).toHaveProperty("timestamp");
    db.close();
  });

  it("queries attempts through their indexes", async () => {
    const db = new AlgoDatabase(NAME);
    await db.attempts.bulkAdd([attempt(1), attempt(2), attempt(3)]);
    expect(await db.attempts.where("concept").equals("bfs").count()).toBe(3);
    expect(await db.attempts.where("scenarioId").equals("s2").count()).toBe(1);
    expect(await db.attempts.where("timestamp").above(1_700_000_000_001).count()).toBe(2);
    db.close();
  });

  it("getDb returns a shared singleton until closed", () => {
    expect(getDb()).toBe(getDb());
    const first = getDb();
    closeDb();
    expect(getDb()).not.toBe(first);
  });

  it("getDb throws a clear error when IndexedDB is missing", () => {
    const original = globalThis.indexedDB;
    // @ts-expect-error simulate private mode / unsupported browser
    delete globalThis.indexedDB;
    try {
      expect(() => getDb()).toThrow(/unavailable/);
    } finally {
      globalThis.indexedDB = original;
    }
  });
});

describe("migrations", () => {
  async function seedV1Database() {
    // Written with plain Dexie and a hand-copied schema, independent of the app's migration list.
    const old = new Dexie(NAME);
    old.version(1).stores({
      reviews: "scenarioId",
      attempts: "++id, scenarioId, concept, domain, timestamp",
      profile: "id",
      eventQueue: "++id",
      reading: "chapterId",
      meta: "key",
    });
    await old.table("reviews").put(review);
    await old.table("attempts").bulkAdd([attempt(1), attempt(2)]);
    await old.table("profile").put(profile);
    await old.table("eventQueue").add({ name: "session_done", payload: { n: 1 }, timestamp: 5 });
    await old.table("reading").put({ chapterId: "c1", lastSectionId: "c1.2", sectionsRead: ["c1.1"], scrollPct: 40, updatedAt: 9 });
    await old.table("meta").bulkPut([
      { key: "schemaVersion", value: 1 },
      { key: "installedAt", value: "2026-01-01T00:00:00.000Z" },
    ]);
    old.close();
  }

  it("opens a database written at v1 with the current code and loses nothing", async () => {
    await seedV1Database();
    // Open under the shipped name through the shipped list (copying the file name is what getDb does).
    const db = new AlgoDatabase(NAME, migrations);
    await db.open();
    expect(await db.reviews.get("s1")).toEqual(review);
    expect(await db.attempts.count()).toBe(2);
    expect(await db.profile.get("me")).toEqual(profile);
    expect(await db.eventQueue.count()).toBe(1);
    expect((await db.reading.get("c1"))?.sectionsRead).toEqual(["c1.1"]);
    expect((await db.meta.get("installedAt"))?.value).toBe("2026-01-01T00:00:00.000Z");
    db.close();
  });

  // EXAMPLE ONLY (not shipped): proves the harness. Adds an index, a new store, and backfills a field.
  const v2Example: Migration = {
    version: 2,
    description: "example: index reviews.dueAt, add badges store, backfill attempts.source",
    stores: { reviews: "scenarioId, dueAt", badges: "id" },
    upgrade: async (tx) => {
      await tx
        .table("attempts")
        .toCollection()
        .modify((a: Record<string, unknown>) => {
          if (a.source === undefined) a.source = "session";
        });
    },
  };

  it("v1 -> v2 (example) keeps every row, adds the new index/store and backfills additively", async () => {
    await seedV1Database();
    const db = new AlgoDatabase(NAME, [v1, v2Example]);
    await db.open();
    expect(db.verno).toBe(2);

    expect(await db.reviews.get("s1")).toEqual(review);
    expect(await db.profile.get("me")).toEqual(profile);
    expect(await db.eventQueue.count()).toBe(1);
    expect(await db.reading.count()).toBe(1);
    expect(await db.meta.count()).toBe(2);

    const attempts = await db.attempts.toArray();
    expect(attempts).toHaveLength(2);
    for (const a of attempts) {
      expect(a).toMatchObject({ concept: "bfs", domain: "graphs", validationResults: [true, false] });
      expect((a as unknown as { source: string }).source).toBe("session");
    }
    // Untouched index survives, new index and store work.
    expect(await db.attempts.where("concept").equals("bfs").count()).toBe(2);
    expect(await db.reviews.where("dueAt").equals(review.dueAt).count()).toBe(1);
    expect(db.tables.map((t) => t.name)).toContain("badges");
    db.close();
  });

  it("a fresh install goes straight to the latest version", async () => {
    const db = new AlgoDatabase(NAME, [v1, v2Example]);
    await db.open();
    expect(db.verno).toBe(2);
    expect(await db.reviews.count()).toBe(0);
    db.close();
  });

  it("rejects a list with gaps (a missing step would strand users)", () => {
    expect(() => new AlgoDatabase(NAME, [v1, { ...v2Example, version: 3 }])).toThrow(/consecutive/);
  });

  it("the shipped list is consecutive from 1 and never declares a dropped store", () => {
    migrations.forEach((m, i) => {
      expect(m.version).toBe(i + 1);
      for (const spec of Object.values(m.stores)) expect(typeof spec).toBe("string");
    });
  });
});
