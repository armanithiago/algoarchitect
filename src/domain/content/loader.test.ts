import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const JSON_PATH = "@/content/scenarios.v1.json";

async function freshLoader() {
  vi.resetModules();
  return import("./loader");
}

beforeEach(() => vi.resetModules());
afterEach(() => vi.doUnmock(JSON_PATH));

describe("loadScenarios", () => {
  it("loads and validates the shipped bundle, and caches it", async () => {
    const { loadScenarios } = await freshLoader();
    const a = await loadScenarios();
    expect(a.length).toBeGreaterThanOrEqual(3);
    expect(await loadScenarios()).toBe(a);
  });

  it("shares one in-flight load", async () => {
    const { loadScenarios } = await freshLoader();
    expect(loadScenarios()).toBe(loadScenarios());
  });

  it("fails closed on a corrupt bundle with readable issues, and does not cache the failure", async () => {
    vi.doMock(JSON_PATH, () => ({ default: { schema: 1, contentVersion: 1, scenarios: [{ id: "bad" }] } }));
    const { loadScenarios, ContentLoadError } = await freshLoader();
    const err = await loadScenarios().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ContentLoadError);
    expect((err as InstanceType<typeof ContentLoadError>).issues.length).toBeGreaterThan(0);
    expect((err as Error).message).toContain("invalid");
    // second call retries (failure not cached)
    await expect(loadScenarios()).rejects.toBeInstanceOf(ContentLoadError);
  });

  it("rejects cross-field violations (wrong correctOptionId)", async () => {
    const real = (await import("@/content/scenarios.v1.json")).default as unknown as { scenarios: Array<Record<string, unknown>> };
    const bad = { ...real, scenarios: [{ ...real.scenarios[0], correctOptionId: "z" }] };
    vi.doMock(JSON_PATH, () => ({ default: bad }));
    const { loadScenarios, ContentLoadError } = await freshLoader();
    await expect(loadScenarios()).rejects.toBeInstanceOf(ContentLoadError);
  });

  it("wraps an import failure", async () => {
    vi.doMock(JSON_PATH, () => {
      throw new Error("chunk failed");
    });
    const { loadScenarios } = await freshLoader();
    await expect(loadScenarios()).rejects.toThrow(/Could not load/);
  });

  it("resetContentCacheForTests drops the cache", async () => {
    const { loadScenarios, resetContentCacheForTests } = await freshLoader();
    const a = await loadScenarios();
    resetContentCacheForTests();
    expect(await loadScenarios()).not.toBe(a);
  });
});
