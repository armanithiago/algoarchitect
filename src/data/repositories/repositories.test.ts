import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DB_NAME, closeDb, getDb } from "../db";
import { metaRepo } from "./metaRepo";
import { defaultProfileRow, normalizeProfileRow, profileRepo } from "./profileRepo";

async function wipe() {
  closeDb();
  await Dexie.delete(DB_NAME);
}
beforeEach(wipe);
afterEach(wipe);

describe("profileRepo", () => {
  it("returns undefined before the first save", async () => {
    expect(await profileRepo.get()).toBeUndefined();
  });

  it("round-trips a row and derives level from xp", async () => {
    const row = { ...defaultProfileRow(), xp: 350, level: 99, lastActiveLocalDate: "2026-11-04" };
    await profileRepo.save(row);
    const back = await profileRepo.get();
    expect(back).toEqual({ ...row, level: 3 });
  });

  it("is a singleton keyed 'me'", async () => {
    await profileRepo.save({ ...defaultProfileRow(), xp: 1 });
    await profileRepo.save({ ...defaultProfileRow(), xp: 2 });
    expect(await getDb().profile.count()).toBe(1);
    expect((await profileRepo.get())?.xp).toBe(2);
  });

  it("clear removes the row", async () => {
    await profileRepo.save(defaultProfileRow());
    await profileRepo.clear();
    expect(await profileRepo.get()).toBeUndefined();
  });

  it("normalizes partial or invalid rows with defaults", () => {
    expect(normalizeProfileRow(undefined)).toEqual(defaultProfileRow());
    const n = normalizeProfileRow({ xp: -5, streakCount: Number.NaN, settings: { codeLanguage: "cs" } } as never);
    expect(n.xp).toBe(0);
    expect(n.streakCount).toBe(0);
    expect(n.settings).toEqual({ haptics: true, analytics: false, codeLanguage: "cs" });
  });
});

describe("metaRepo", () => {
  it("get returns undefined for missing keys, set/get round-trips", async () => {
    expect(await metaRepo.get("contentVersion")).toBeUndefined();
    await metaRepo.set("contentVersion", "1.2.0");
    expect(await metaRepo.get("contentVersion")).toBe("1.2.0");
  });

  it("ensureInitialised records schemaVersion, contentVersion null, installedAt once", async () => {
    const first = await metaRepo.ensureInitialised(new Date("2026-01-02T03:04:05.000Z"));
    expect(first).toBe("2026-01-02T03:04:05.000Z");
    expect(await metaRepo.get("schemaVersion")).toBe(1);
    expect(await metaRepo.get("contentVersion")).toBeNull();
    const second = await metaRepo.ensureInitialised(new Date("2030-01-01T00:00:00.000Z"));
    expect(second).toBe(first);
    expect(await metaRepo.get("installedAt")).toBe(first);
  });

  it("ensureInitialised does not clobber an existing contentVersion", async () => {
    await metaRepo.set("contentVersion", "3");
    await metaRepo.ensureInitialised();
    expect(await metaRepo.get("contentVersion")).toBe("3");
  });
});
