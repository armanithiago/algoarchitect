import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

const getSnapshot = (): boolean => (typeof navigator === "undefined" ? true : navigator.onLine !== false);

/** Server and first-paint assumption: online (nothing in the MVP needs the network anyway). */
const getServerSnapshot = (): boolean => true;

/** `navigator.onLine` plus `online` / `offline` events (design system §7.21). SSR-safe. */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
