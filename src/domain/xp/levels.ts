/**
 * Level thresholds (sprint plan §4.4, design system §8.9 reading):
 * Level n starts at 50·n·(n−1) XP, so L1 = 0–99, L2 = 100–299, L3 = 300–599, L4 = 600–999.
 * Pure and framework-free. The full XP rules (E4-03) extend this module.
 */
export const levelStart = (level: number): number => 50 * level * (level - 1);

export function levelOf(xp: number): number {
  let level = 1;
  while (levelStart(level + 1) <= xp) level++;
  return level;
}

export interface LevelProgress {
  level: number;
  xpIntoLevel: number;
  levelSpan: number;
  xpToNext: number;
  nextLevelAt: number;
  fraction: number; // 0..1
}

export function levelProgress(xp: number): LevelProgress {
  const level = levelOf(xp);
  const start = levelStart(level);
  const nextLevelAt = levelStart(level + 1);
  const levelSpan = nextLevelAt - start;
  const xpIntoLevel = xp - start;
  return { level, xpIntoLevel, levelSpan, xpToNext: nextLevelAt - xp, nextLevelAt, fraction: xpIntoLevel / levelSpan };
}
