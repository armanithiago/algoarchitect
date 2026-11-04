import { useEffect, useRef, useState } from "react";

/** Grace period before the shimmer appears, so fast loads never flash (design system §7.20). */
export const SKELETON_DELAY_MS = 150;
/** Once painted, the shimmer stays at least this long. */
export const SKELETON_MIN_MS = 300;

/**
 * Drives the hydration skeleton.
 * - `showSkeleton`: render placeholder blocks instead of data (true while loading and during the minimum hold).
 * - `painted`: the placeholders are actually visible (false during the 150 ms grace period, so layout is kept but nothing flashes).
 */
export function useSkeleton(loading: boolean): { showSkeleton: boolean; painted: boolean } {
  const [painted, setPainted] = useState(false);
  const paintedAt = useRef(0);

  useEffect(() => {
    if (loading) {
      if (painted) return;
      const id = window.setTimeout(() => {
        paintedAt.current = Date.now();
        setPainted(true);
      }, SKELETON_DELAY_MS);
      return () => window.clearTimeout(id);
    }
    if (!painted) return;
    const remaining = Math.max(0, SKELETON_MIN_MS - (Date.now() - paintedAt.current));
    const id = window.setTimeout(() => setPainted(false), remaining);
    return () => window.clearTimeout(id);
  }, [loading, painted]);

  return { showSkeleton: loading || painted, painted };
}
