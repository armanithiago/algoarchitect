/** Vibration patterns in ms (design system §6.5). Android Chrome only; a silent no-op everywhere else. */
export const HAPTIC_PATTERNS = {
  correct: [12],
  wrong: [24, 60, 24],
  streakExtended: [15, 40, 15],
  levelUp: [20, 50, 20, 50, 40],
} as const;

export type HapticKind = keyof typeof HAPTIC_PATTERNS;

export const canVibrate = (): boolean => typeof navigator !== "undefined" && "vibrate" in navigator;

/** Call only from a user-activation path (the Check tap, the Done tap). */
export function haptic(kind: HapticKind, enabled: boolean): void {
  if (!enabled || !canVibrate()) return;
  try {
    navigator.vibrate([...HAPTIC_PATTERNS[kind]]);
  } catch {
    // Some browsers throw outside a user gesture; haptics are never essential.
  }
}
