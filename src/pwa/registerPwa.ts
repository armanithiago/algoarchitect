import { useToastStore } from "@/ui/components/Toast";

export const UPDATE_TOAST_ID = "pwa-update";

type RegisterSW = (options: { onNeedRefresh?: () => void }) => (reloadPage?: boolean) => Promise<void>;

/** Lazy so tests and `vite dev` never resolve the `virtual:pwa-register` module. */
const loadRegisterSW = async (): Promise<RegisterSW> => (await import("./swRegistration")).registerSW;

/**
 * Registers the service worker and surfaces "Update ready." when a new version is waiting.
 * Production builds only: there is no service worker in `vite dev`.
 * Resolves to `updateSW` (undefined when skipped).
 */
export async function registerPwa(load: () => Promise<RegisterSW> = loadRegisterSW) {
  if (!import.meta.env.PROD) return undefined;
  const registerSW = await load();
  const updateSW = registerSW({
    onNeedRefresh() {
      useToastStore.getState().show({
        id: UPDATE_TOAST_ID,
        variant: "update",
        message: "Update ready.",
        actionLabel: "Refresh",
        onAction: () => void updateSW(true),
      });
    },
  });
  return updateSW;
}
