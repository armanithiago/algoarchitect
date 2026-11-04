import { beforeEach, describe, expect, it } from "vitest";
import { useToastStore, type ToastItem } from "./useToastStore";

const t = (id: string, variant: ToastItem["variant"] = "info"): ToastItem => ({ id, variant, message: id });
const s = () => useToastStore.getState();

describe("useToastStore", () => {
  beforeEach(() => s().reset());

  it("shows the first toast immediately and queues the rest (one at a time)", () => {
    s().show(t("a", "success"));
    s().show(t("b", "error"));
    expect(s().current?.id).toBe("a");
    expect(s().queue.map((q) => q.id)).toEqual(["b"]);
  });

  it("promotes the next toast in FIFO order on dismiss", () => {
    s().show(t("a", "success"));
    s().show(t("b", "success"));
    s().show(t("c", "success"));
    s().dismiss();
    expect(s().current?.id).toBe("b");
    s().dismiss();
    expect(s().current?.id).toBe("c");
    s().dismiss();
    expect(s().current).toBeNull();
  });

  it("replaces a toast with the same id instead of duplicating it", () => {
    s().show(t("a", "success"));
    s().show({ ...t("a", "success"), message: "new" });
    expect(s().current?.message).toBe("new");
    expect(s().queue).toHaveLength(0);
    s().show(t("b", "success"));
    s().show({ ...t("b", "success"), message: "newer" });
    expect(s().queue).toHaveLength(1);
    expect(s().queue[0].message).toBe("newer");
  });

  it("holds update and info toasts back while suspended", () => {
    s().setSuspended(true);
    s().show(t("u", "update"));
    s().show(t("i", "info"));
    expect(s().current).toBeNull();
    expect(s().queue.map((q) => q.id)).toEqual(["u", "i"]);
  });

  it("still shows success and error toasts while suspended", () => {
    s().setSuspended(true);
    s().show(t("u", "update"));
    s().show(t("e", "error"));
    expect(s().current?.id).toBe("e");
    s().dismiss();
    expect(s().current).toBeNull();
    expect(s().queue.map((q) => q.id)).toEqual(["u"]);
  });

  it("releases the queue when the session ends", () => {
    s().setSuspended(true);
    s().show(t("u", "update"));
    s().setSuspended(false);
    expect(s().current?.id).toBe("u");
    expect(s().queue).toHaveLength(0);
  });

  it("moves a visible update toast back to the queue when a session starts", () => {
    s().show(t("u", "update"));
    s().setSuspended(true);
    expect(s().current).toBeNull();
    expect(s().queue.map((q) => q.id)).toEqual(["u"]);
    s().setSuspended(false);
    expect(s().current?.id).toBe("u");
  });

  it("dismissing a queued id removes it without touching the current toast", () => {
    s().show(t("a", "success"));
    s().show(t("b", "success"));
    s().dismiss("b");
    expect(s().current?.id).toBe("a");
    expect(s().queue).toHaveLength(0);
  });
});
