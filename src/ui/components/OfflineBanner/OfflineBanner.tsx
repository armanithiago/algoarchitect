import { useEffect, useState } from "react";
import { WifiOff, X } from "lucide-react";
import { cx } from "@/ui/lib/cx";

export type OfflineBannerMode = "hidden" | "offline" | "back";

export interface OfflineBannerProps {
  mode: OfflineBannerMode;
  onDismiss?: () => void;
}

const COLLAPSE_MS = 220; // --duration-base

/**
 * Neutral `inset` banner (never warning colors). The `role="status"` region is always mounted so the
 * change is announced once; its content collapses with --duration-base after `mode` goes to "hidden".
 */
export function OfflineBanner({ mode, onDismiss }: OfflineBannerProps) {
  const open = mode !== "hidden";
  const [shown, setShown] = useState<Exclude<OfflineBannerMode, "hidden">>("offline");
  const [wasOpen, setWasOpen] = useState(open);
  const [lingering, setLingering] = useState(false);
  // Adjust state while rendering (no effect): remember the last visible message and keep the
  // content mounted while the collapse transition runs.
  if (open && shown !== mode) setShown(mode);
  if (open !== wasOpen) {
    setWasOpen(open);
    setLingering(!open);
  }

  useEffect(() => {
    if (!lingering) return;
    const id = window.setTimeout(() => setLingering(false), COLLAPSE_MS);
    return () => window.clearTimeout(id);
  }, [lingering]);

  const mounted = open || lingering;
  const isOffline = shown === "offline";

  return (
    <div
      role="status"
      data-state={open ? shown : "hidden"}
      className={cx(
        "grid motion-ok:transition-[grid-template-rows] motion-ok:duration-(--duration-base) motion-ok:ease-standard",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div className="min-h-0 overflow-hidden">
        {mounted ? (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-surface-hover py-1.5 pl-3 pr-1 text-fg-secondary">
            {isOffline ? <WifiOff size={16} className="mt-2.5 shrink-0" aria-hidden="true" /> : null}
            <p className={cx("flex-1 pt-2 text-caption", !isOffline && "pb-2")}>
              {isOffline ? "Offline. Everything works; progress is saved on this device." : "Back online."}
            </p>
            {isOffline ? (
              <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss"
                className="hit-target grid size-9 shrink-0 place-items-center rounded-md text-fg-secondary active:bg-surface-pressed can-hover:hover:bg-surface-pressed"
              >
                <X size={20} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
