import { useEffect, type ReactNode } from "react";
import { PwaHost } from "@/pwa/PwaHost";
import { hydrateStores } from "@/stores/hydrate";

/** Shared wiring. Owned by the orchestrator: agents plug in through their own stub files, not by editing this. */
export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    void hydrateStores();
  }, []);
  return (
    <>
      {children}
      <PwaHost />
    </>
  );
}
