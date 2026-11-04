import { useCallback, useEffect, useRef, useState } from "react";
import type { OfflineBannerMode } from "@/ui/components/OfflineBanner";

/** Wait this long before showing the banner, so a blip never flashes it (design system §8.13). */
export const OFFLINE_SHOW_DELAY_MS = 1000;
/** "Back online." stays this long, then the banner collapses. */
export const BACK_ONLINE_MS = 2000;

/**
 * Banner state machine: offline for 1 s -> "offline"; online again -> "back" for 2 s -> "hidden".
 * Dismissing hides it for the rest of the session (as long as the hook stays mounted, i.e. in AppShell).
 */
export function useOfflineBanner(online: boolean): { mode: OfflineBannerMode; dismiss: () => void } {
  const [mode, setMode] = useState<OfflineBannerMode>("hidden");
  const [dismissed, setDismissed] = useState(false);
  const wasShown = useRef(false);

  useEffect(() => {
    if (!online) {
      if (dismissed) return;
      const id = window.setTimeout(() => {
        wasShown.current = true;
        setMode("offline");
      }, OFFLINE_SHOW_DELAY_MS);
      return () => window.clearTimeout(id);
    }
    if (!wasShown.current) return;
    wasShown.current = false;
    const show = window.setTimeout(() => setMode("back"), 0);
    const hide = window.setTimeout(() => setMode("hidden"), BACK_ONLINE_MS);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [online, dismissed]);

  const dismiss = useCallback(() => {
    wasShown.current = false;
    setDismissed(true);
    setMode("hidden");
  }, []);

  return { mode, dismiss };
}
