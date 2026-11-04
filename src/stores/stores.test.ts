import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type DbModule = typeof import("@/data/db");
type ProfileModule = typeof import("./profile");
type HydrateModule = typeof import("./hydrate");
type RepoModule = typeof import("@/data/repositories/profileRepo");

/** A fresh module graph = a fresh app process (same IndexedDB underneath, like a real restart). */
async function freshApp() {
  vi.resetModules();
  const db: DbModule = await import("@/data/db");
  const profile: ProfileModule = await import("./profile");
  const hydrate: HydrateModule = await import("./hydrate");
  const repo: RepoModule = await import("@/data/repositories/profileRepo");
  return {
    db,
    ...profile,
    ...hydrate,
    repo,
    /** Simulates closing the app: pending write dropped, connection closed. */
    shutdown: () => {
      profile.cancelProfileSave();
      db.closeDb();
    },
  };
}

const NOON = (y: number, m: number, d: number) => () => new Date(y, m - 1, d, 12, 0, 0);

beforeEach(async () => {
  vi.resetModules();
  const { closeDb } = await import("@/data/db");
  closeDb();
  await Dexie.delete("algoarchitect");
});
afterEach(async () => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  const { closeDb } = await import("@/data/db");
  closeDb();
});

describe("hydrateStores", () => {
  it("first run: creates the default profile and meta.installedAt", async () => {
    const app = await freshApp();
    const s0 = app.useProfileStore.getState();
    expect(s0.hydrated).toBe(false);
    await app.hydrateStores(NOON(2026, 11, 4));
    const s = app.useProfileStore.getState();
    expect(s).toMatchObject({ hydrated: true, storageBlocked: false, xp: 0, streakDoneToday: false, lastActiveLocalDate: null });
    expect(s.settings).toEqual({ haptics: true, analytics: false, codeLanguage: "pseudo" });
    expect((await app.repo.profileRepo.get())?.xp).toBe(0);
    const { metaRepo } = await import("@/data/repositories/metaRepo");
    expect(await metaRepo.get("installedAt")).toBe(new Date(2026, 10, 4, 12).toISOString());
    expect(await metaRepo.get("schemaVersion")).toBe(1);
    expect(await metaRepo.get("contentVersion")).toBeNull();
    app.shutdown();
  });

  it("returning user: loads stored profile and derives streakDoneToday from the local day", async () => {
    const app = await freshApp();
    await app.db.getDb().open();
    await app.repo.profileRepo.save({
      id: "me",
      xp: 410,
      level: 3,
      streakCount: 5,
      longestStreak: 8,
      lastActiveLocalDate: "2026-11-04",
      freezesAvailable: 1,
      settings: { haptics: false, analytics: true, codeLanguage: "cs" },
    });
    await app.hydrateStores(NOON(2026, 11, 4));
    expect(app.useProfileStore.getState()).toMatchObject({
      hydrated: true,
      xp: 410,
      streakCount: 5,
      longestStreak: 8,
      freezesAvailable: 1,
      streakDoneToday: true,
      lastActiveLocalDate: "2026-11-04",
      settings: { haptics: false, analytics: true, codeLanguage: "cs" },
    });
    app.shutdown();

    // Next local day: same data, streakDoneToday false.
    const next = await freshApp();
    await next.hydrateStores(NOON(2026, 11, 5));
    expect(next.useProfileStore.getState()).toMatchObject({ xp: 410, streakDoneToday: false });
    next.shutdown();
  });

  it("a midnight just before/after flips streakDoneToday", async () => {
    const app = await freshApp();
    await app.db.getDb().open();
    await app.repo.profileRepo.save({ ...app.repo.defaultProfileRow(), lastActiveLocalDate: "2026-11-04" });
    await app.hydrateStores(() => new Date(2026, 10, 4, 23, 59, 59));
    expect(app.useProfileStore.getState().streakDoneToday).toBe(true);
    app.shutdown();
    const later = await freshApp();
    await later.hydrateStores(() => new Date(2026, 10, 5, 0, 0, 1));
    expect(later.useProfileStore.getState().streakDoneToday).toBe(false);
    later.shutdown();
  });

  it("is idempotent (StrictMode double effect)", async () => {
    const app = await freshApp();
    const a = app.hydrateStores();
    const b = app.hydrateStores();
    expect(a).toBe(b);
    await a;
    app.shutdown();
  });

  it("requests persistent storage once, feature-detected, and never throws", async () => {
    const persist = vi.fn(async () => true);
    vi.stubGlobal("navigator", { ...navigator, storage: { persist } });
    const app = await freshApp();
    await app.hydrateStores();
    app.resetHydrationForTests();
    await app.hydrateStores();
    expect(persist).toHaveBeenCalledTimes(1);
    app.shutdown();

    const throwing = vi.fn(async () => {
      throw new Error("denied");
    });
    vi.stubGlobal("navigator", { storage: { persist: throwing } });
    const app2 = await freshApp();
    await expect(app2.hydrateStores()).resolves.toBeUndefined();
    expect(app2.useProfileStore.getState().storageBlocked).toBe(false);
    app2.shutdown();

    vi.stubGlobal("navigator", {});
    const app3 = await freshApp();
    await expect(app3.hydrateStores()).resolves.toBeUndefined();
    app3.shutdown();
  });
});

describe("storageBlocked", () => {
  it("indexedDB missing: hydrated + storageBlocked, still works in memory", async () => {
    vi.stubGlobal("indexedDB", undefined);
    const app = await freshApp();
    await expect(app.hydrateStores()).resolves.toBeUndefined();
    expect(app.useProfileStore.getState()).toMatchObject({ hydrated: true, storageBlocked: true, xp: 0 });
    app.useProfileStore.getState().addXp(25);
    app.useProfileStore.getState().updateSettings({ haptics: false });
    await app.flushProfileSave();
    expect(app.useProfileStore.getState()).toMatchObject({ xp: 25, storageBlocked: true });
    expect(app.useProfileStore.getState().settings.haptics).toBe(false);
    app.useProfileStore.getState().resetProfile();
    expect(app.useProfileStore.getState()).toMatchObject({ xp: 0, hydrated: true, storageBlocked: true });
  });

  it("opening the database throws (blocked / quota): same fallback", async () => {
    const app = await freshApp();
    vi.spyOn(app.db.getDb(), "open").mockRejectedValue(new Error("SecurityError"));
    await expect(app.hydrateStores()).resolves.toBeUndefined();
    expect(app.useProfileStore.getState()).toMatchObject({ hydrated: true, storageBlocked: true });
    app.shutdown();
  });

  it("a write failing mid-session flips storageBlocked and keeps the in-memory state", async () => {
    const app = await freshApp();
    await app.hydrateStores();
    vi.spyOn(app.repo.profileRepo, "save").mockRejectedValue(new Error("QuotaExceededError"));
    app.useProfileStore.getState().addXp(10);
    await app.flushProfileSave();
    expect(app.useProfileStore.getState()).toMatchObject({ xp: 10, storageBlocked: true });
    app.shutdown();
  });
});

describe("persistence", () => {
  it("restart simulation: state written, app torn down, fresh module graph rehydrates the same state", async () => {
    const app = await freshApp();
    await app.hydrateStores();
    app.useProfileStore.getState().addXp(120);
    app.useProfileStore.getState().addXp(30);
    app.useProfileStore.getState().updateSettings({ codeLanguage: "cs", haptics: false });
    await app.flushProfileSave();
    const before = app.useProfileStore.getState();
    app.shutdown();

    const restarted = await freshApp();
    expect(restarted.useProfileStore.getState().hydrated).toBe(false);
    expect(restarted.useProfileStore.getState().xp).toBe(0); // nothing in memory yet
    await restarted.hydrateStores();
    const after = restarted.useProfileStore.getState();
    expect(after.xp).toBe(150);
    expect(after.settings).toEqual({ haptics: false, analytics: false, codeLanguage: "cs" });
    expect(after.settings).toEqual(before.settings);
    expect((await restarted.repo.profileRepo.get())?.level).toBe(2);
    restarted.shutdown();
  });

  it("debounces about 150 ms: nothing written before, one write after", async () => {
    const app = await freshApp();
    await app.hydrateStores();
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const save = vi.spyOn(app.repo.profileRepo, "save");
    app.useProfileStore.getState().addXp(10);
    app.useProfileStore.getState().addXp(10);
    app.useProfileStore.getState().updateSettings({ analytics: true });
    await vi.advanceTimersByTimeAsync(149);
    expect(save).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(2);
    expect(save).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
    expect(await app.repo.profileRepo.get()).toMatchObject({ xp: 20, settings: { analytics: true } });
    app.shutdown();
  });

  it("flushes on visibilitychange (hidden) and pagehide, before the debounce elapses", async () => {
    const app = await freshApp();
    await app.hydrateStores();
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    app.useProfileStore.getState().addXp(40);
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
    vi.useRealTimers();
    await vi.waitFor(async () => expect((await app.repo.profileRepo.get())?.xp).toBe(40));

    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    app.useProfileStore.getState().addXp(5);
    window.dispatchEvent(new Event("pagehide"));
    vi.useRealTimers();
    await vi.waitFor(async () => expect((await app.repo.profileRepo.get())?.xp).toBe(45));

    // Visible again must not write anything stale or throw.
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
    document.dispatchEvent(new Event("visibilitychange"));
    app.shutdown();
  });

  it("resetProfile persists the default profile and keeps hydrated true", async () => {
    const app = await freshApp();
    await app.hydrateStores();
    app.useProfileStore.getState().addXp(500);
    await app.flushProfileSave();
    app.useProfileStore.getState().resetProfile();
    expect(app.useProfileStore.getState()).toMatchObject({ hydrated: true, xp: 0 });
    await app.flushProfileSave();
    expect(await app.repo.profileRepo.get()).toMatchObject({ xp: 0, level: 1 });
    app.shutdown();
  });

  it("ignores NaN/zero XP and never goes negative", async () => {
    const app = await freshApp();
    await app.hydrateStores();
    const { addXp } = app.useProfileStore.getState();
    addXp(Number.NaN);
    addXp(0);
    expect(app.useProfileStore.getState().xp).toBe(0);
    addXp(-50);
    expect(app.useProfileStore.getState().xp).toBe(0);
    expect(app.useProfileStore.getState()).toMatchObject({ hydrated: true });
    app.shutdown();
  });

  it("changes made before hydration are not written over the stored profile", async () => {
    const app = await freshApp();
    await app.hydrateStores();
    app.useProfileStore.getState().addXp(70);
    await app.flushProfileSave();
    app.shutdown();

    const second = await freshApp();
    second.useProfileStore.getState().addXp(5); // before hydrate: hydrated=false, save is skipped
    await second.flushProfileSave();
    expect((await second.repo.profileRepo.get())?.xp).toBe(70);
    await second.hydrateStores();
    expect(second.useProfileStore.getState().xp).toBe(70);
    second.shutdown();
  });
});
