/**
 * CONTRACT between the data layer (Agent C) and the UI (Agent B).
 * Agent C owns the implementation (hydration from and persistence to IndexedDB, see src/data/).
 * Agent B only READS through `useProfileStore` and must not change this shape.
 * Changing the shape needs both agents' agreement: ask the orchestrator.
 */
import { create } from "zustand";
import { profileRepo } from "@/data/repositories/profileRepo";
import { levelOf } from "@/domain/xp/levels";
import { createDebouncedSaver } from "./debouncedSaver";

export type CodeLanguage = "pseudo" | "cs";

export interface ProfileSettings {
  haptics: boolean;
  analytics: boolean;
  codeLanguage: CodeLanguage;
}

export interface ProfileState {
  /** False until IndexedDB has been read. UI shows skeletons (design system §7.20) while false. */
  hydrated: boolean;
  /** True if IndexedDB is unavailable (private mode etc.). The app still works in memory. */
  storageBlocked: boolean;
  xp: number;
  streakCount: number;
  longestStreak: number;
  /** A session was completed on the current local day. */
  streakDoneToday: boolean;
  freezesAvailable: number;
  /** "YYYY-MM-DD" in the device's local calendar, or null before the first session. */
  lastActiveLocalDate: string | null;
  settings: ProfileSettings;
}

export interface ProfileActions {
  addXp: (amount: number) => void;
  updateSettings: (patch: Partial<ProfileSettings>) => void;
  /** Erases the profile (Settings → Reset progress, Sprint 6). */
  resetProfile: () => void;
}

export const initialProfile: ProfileState = {
  hydrated: false,
  storageBlocked: false,
  xp: 0,
  streakCount: 0,
  longestStreak: 0,
  streakDoneToday: false,
  freezesAvailable: 0,
  lastActiveLocalDate: null,
  settings: { haptics: true, analytics: false, codeLanguage: "pseudo" },
};

export const PERSIST_DEBOUNCE_MS = 150;

async function saveCurrentProfile(): Promise<void> {
  const s = useProfileStore.getState();
  if (!s.hydrated || s.storageBlocked) return;
  try {
    await profileRepo.save({
      id: "me",
      xp: s.xp,
      level: levelOf(s.xp),
      streakCount: s.streakCount,
      longestStreak: s.longestStreak,
      lastActiveLocalDate: s.lastActiveLocalDate,
      freezesAvailable: s.freezesAvailable,
      settings: s.settings,
    });
  } catch {
    // Storage failed mid-session (quota, eviction, closed DB): keep working in memory.
    useProfileStore.setState({ storageBlocked: true });
  }
}

const saver = createDebouncedSaver(saveCurrentProfile, PERSIST_DEBOUNCE_MS);

/** Writes any pending change now (called on visibilitychange/pagehide and in tests). */
export const flushProfileSave = (): Promise<void> => saver.flush();
/** Drops any pending write (tests / teardown). */
export const cancelProfileSave = (): void => saver.cancel();

export const useProfileStore = create<ProfileState & ProfileActions>()((set) => ({
  ...initialProfile,
  addXp: (amount) => {
    if (!Number.isFinite(amount) || amount === 0) return;
    set((s) => ({ xp: Math.max(0, s.xp + amount) }));
    saver.schedule();
  },
  updateSettings: (patch) => {
    set((s) => ({ settings: { ...s.settings, ...patch } }));
    saver.schedule();
  },
  resetProfile: () => {
    set((s) => ({ ...initialProfile, hydrated: true, storageBlocked: s.storageBlocked }));
    saver.schedule();
  },
}));
