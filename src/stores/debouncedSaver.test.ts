import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDebouncedSaver } from "./debouncedSaver";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("createDebouncedSaver", () => {
  it("coalesces rapid changes into one write after the delay", async () => {
    const save = vi.fn(async () => {});
    const s = createDebouncedSaver(save, 150);
    s.schedule();
    await vi.advanceTimersByTimeAsync(100);
    s.schedule(); // resets the timer
    await vi.advanceTimersByTimeAsync(100);
    expect(save).not.toHaveBeenCalled();
    expect(s.pending).toBe(true);
    await vi.advanceTimersByTimeAsync(60);
    expect(save).toHaveBeenCalledTimes(1);
    expect(s.pending).toBe(false);
  });

  it("flush writes immediately and the timer does not write again", async () => {
    const save = vi.fn(async () => {});
    const s = createDebouncedSaver(save, 150);
    s.schedule();
    await s.flush();
    expect(save).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(500);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("flush with nothing pending is a no-op", async () => {
    const save = vi.fn(async () => {});
    await createDebouncedSaver(save).flush();
    expect(save).not.toHaveBeenCalled();
  });

  it("cancel drops the pending write", async () => {
    const save = vi.fn(async () => {});
    const s = createDebouncedSaver(save, 150);
    s.schedule();
    s.cancel();
    await vi.advanceTimersByTimeAsync(500);
    expect(save).not.toHaveBeenCalled();
  });

  it("a failing save never rejects and later saves still run, serialized", async () => {
    let calls = 0;
    const save = vi.fn(async () => {
      calls++;
      if (calls === 1) throw new Error("quota");
    });
    const s = createDebouncedSaver(save, 10);
    s.schedule();
    await expect(s.flush()).resolves.toBeUndefined();
    s.schedule();
    await s.flush();
    expect(save).toHaveBeenCalledTimes(2);
  });
});
