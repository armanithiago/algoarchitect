import { beforeEach, describe, expect, it, vi } from "vitest";
import { useToastStore } from "@/ui/components/Toast";
import { registerPwa, UPDATE_TOAST_ID } from "./registerPwa";

const updateSW = vi.fn(async () => {});
let opts: { onNeedRefresh?: () => void } = {};
const load = async () => (o: typeof opts) => {
  opts = o;
  return updateSW;
};

describe("registerPwa", () => {
  beforeEach(() => {
    useToastStore.getState().reset();
    updateSW.mockClear();
    vi.unstubAllEnvs();
  });

  it("does nothing outside production builds", async () => {
    vi.stubEnv("PROD", false);
    expect(await registerPwa(load)).toBeUndefined();
  });

  it("shows the update toast when a new version is waiting; Refresh calls updateSW(true)", async () => {
    vi.stubEnv("PROD", true);
    await registerPwa(load);
    opts.onNeedRefresh?.();
    const cur = useToastStore.getState().current;
    expect(cur).toMatchObject({ id: UPDATE_TOAST_ID, variant: "update", message: "Update ready.", actionLabel: "Refresh" });
    cur?.onAction?.();
    expect(updateSW).toHaveBeenCalledWith(true);
  });

  it("queues the update toast during a session", async () => {
    vi.stubEnv("PROD", true);
    await registerPwa(load);
    useToastStore.getState().setSuspended(true);
    opts.onNeedRefresh?.();
    expect(useToastStore.getState().current).toBeNull();
    useToastStore.getState().setSuspended(false);
    expect(useToastStore.getState().current?.id).toBe(UPDATE_TOAST_ID);
  });
});
