/**
 * CONTRACT: called once at startup by src/app/providers.tsx.
 * Opens the database, loads the profile into the stores, sets `hydrated: true`.
 * It never throws: if IndexedDB is unavailable, it sets `storageBlocked: true` and `hydrated: true`.
 */
import { getDb } from "@/data/db";
import { metaRepo } from "@/data/repositories/metaRepo";
import { defaultProfileRow, profileRepo } from "@/data/repositories/profileRepo";
import { localDateString } from "@/domain/date/localDate";
import { flushProfileSave, useProfileStore } from "./profile";

let started: Promise<void> | null = null;
let listenersAttached = false;
let persistRequested = false;

async function requestPersistentStorage(): Promise<void> {
  if (persistRequested) return;
  persistRequested = true;
  try {
    const storage = typeof navigator !== "undefined" ? navigator.storage : undefined;
    if (storage && typeof storage.persist === "function") await storage.persist();
  } catch {
    // Best effort only.
  }
}

function attachFlushListeners(): void {
  if (listenersAttached) return;
  listenersAttached = true;
  const flush = () => void flushProfileSave();
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
  }
  if (typeof window !== "undefined") window.addEventListener("pagehide", flush);
}

async function run(now: () => Date): Promise<void> {
  attachFlushListeners();
  try {
    await getDb().open();
    await metaRepo.ensureInitialised(now());
    let row = await profileRepo.get();
    if (!row) {
      row = defaultProfileRow();
      await profileRepo.save(row);
    }
    useProfileStore.setState({
      hydrated: true,
      storageBlocked: false,
      xp: row.xp,
      streakCount: row.streakCount,
      longestStreak: row.longestStreak,
      freezesAvailable: row.freezesAvailable,
      lastActiveLocalDate: row.lastActiveLocalDate,
      streakDoneToday: row.lastActiveLocalDate !== null && row.lastActiveLocalDate === localDateString(now()),
      settings: row.settings,
    });
    void requestPersistentStorage();
  } catch {
    useProfileStore.setState({ hydrated: true, storageBlocked: true });
  }
}

/** Idempotent (React StrictMode runs effects twice): later calls return the first call's promise. */
export function hydrateStores(now: () => Date = () => new Date()): Promise<void> {
  started ??= run(now);
  return started;
}

/** Test helper: allows hydrating again in the same module instance. */
export function resetHydrationForTests(): void {
  started = null;
}
