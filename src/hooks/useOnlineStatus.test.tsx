import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useOnlineStatus } from "./useOnlineStatus";
import { useOfflineBanner } from "./useOfflineBanner";

function setOnLine(value: boolean) {
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(value);
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("useOnlineStatus", () => {
  it("reads navigator.onLine initially", () => {
    setOnLine(false);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  it("follows offline and online events", () => {
    setOnLine(true);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
    act(() => {
      setOnLine(false);
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toBe(false);
    act(() => {
      setOnLine(true);
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current).toBe(true);
  });

  it("removes its listeners on unmount", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useOnlineStatus());
    unmount();
    const removed = remove.mock.calls.map((c) => c[0]);
    expect(removed).toContain("online");
    expect(removed).toContain("offline");
  });
});

describe("useOfflineBanner", () => {
  it("shows only after 1 s offline, then 'back' for 2 s, then hides", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ online }) => useOfflineBanner(online), {
      initialProps: { online: false },
    });
    expect(result.current.mode).toBe("hidden");
    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(result.current.mode).toBe("hidden");
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.mode).toBe("offline");

    rerender({ online: true });
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.mode).toBe("back");
    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(result.current.mode).toBe("hidden");
  });

  it("a blip shorter than 1 s never shows anything", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ online }) => useOfflineBanner(online), {
      initialProps: { online: false },
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    rerender({ online: true });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.mode).toBe("hidden");
  });

  it("dismissing hides it for the rest of the session, including the next outage", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ online }) => useOfflineBanner(online), {
      initialProps: { online: false },
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.mode).toBe("offline");
    act(() => result.current.dismiss());
    expect(result.current.mode).toBe("hidden");
    rerender({ online: true });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.mode).toBe("hidden");
    rerender({ online: false });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.mode).toBe("hidden");
  });
});
