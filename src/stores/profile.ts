/**
 * CONTRACT between the data layer (Agent C) and the UI (Agent B).
 * Agent C owns the implementation (hydration from and persistence to IndexedDB, see src/data/).
 * Agent B only READS through `useProfileStore` and must not change this shape.
 * Changing the shape needs both agents' agreement: ask the orchestrator.
 */
import { create } from "zustand";

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

// STUB: Agent C replaces the body below (persistence, hydration) and keeps the exported API above.
export const useProfileStore = create<ProfileState & ProfileActions>()((set) => ({
  ...initialProfile,
  addXp: (amount) => set((s) => ({ xp: s.xp + amount })),
  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
  resetProfile: () => set({ ...initialProfile, hydrated: true }),
}));
