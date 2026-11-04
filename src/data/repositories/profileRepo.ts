import { levelOf } from "@/domain/xp/levels";
import { getDb } from "../db";
import type { ProfileRow } from "../types";

export const PROFILE_ID = "me" as const;

export function defaultProfileRow(): ProfileRow {
  return {
    id: PROFILE_ID,
    xp: 0,
    level: 1,
    streakCount: 0,
    longestStreak: 0,
    lastActiveLocalDate: null,
    freezesAvailable: 0,
    settings: { haptics: true, analytics: false, codeLanguage: "pseudo" },
  };
}

/** Fills missing/invalid fields of a stored row with defaults (tolerates older or partial rows). */
export function normalizeProfileRow(raw: Partial<ProfileRow> | undefined): ProfileRow {
  const d = defaultProfileRow();
  if (!raw) return d;
  const num = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : fallback);
  const xp = num(raw.xp, d.xp);
  return {
    id: PROFILE_ID,
    xp,
    level: levelOf(xp),
    streakCount: num(raw.streakCount, d.streakCount),
    longestStreak: num(raw.longestStreak, d.longestStreak),
    lastActiveLocalDate: typeof raw.lastActiveLocalDate === "string" ? raw.lastActiveLocalDate : null,
    freezesAvailable: num(raw.freezesAvailable, d.freezesAvailable),
    settings: { ...d.settings, ...(raw.settings ?? {}) },
  };
}

export const profileRepo = {
  async get(): Promise<ProfileRow | undefined> {
    const raw = await getDb().profile.get(PROFILE_ID);
    return raw ? normalizeProfileRow(raw) : undefined;
  },

  async save(row: ProfileRow): Promise<void> {
    await getDb().profile.put({ ...row, id: PROFILE_ID, level: levelOf(row.xp) });
  },

  async clear(): Promise<void> {
    await getDb().profile.delete(PROFILE_ID);
  },
};
