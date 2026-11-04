/**
 * CONTRACT: mounted once by src/app/providers.tsx, inside the router-less provider tree.
 * Registers the service worker and hosts the toast layer ("Update ready." toast). Renders nothing
 * visible until a toast is shown. The future session feature calls
 * `useToastStore.getState().setSuspended(true | false)` to hold update toasts back during a session.
 */
import { useEffect } from "react";
import { ToastHost } from "@/ui/components/Toast";
import { registerPwa } from "./registerPwa";

export function PwaHost() {
  useEffect(() => {
    void registerPwa();
  }, []);
  return <ToastHost />;
}
