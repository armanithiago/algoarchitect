import { afterEach, describe, expect, it } from "vitest";
import { localDateString } from "./localDate";

// tsconfig.app has no Node types; the test only needs process.env.TZ.
const env = (globalThis as unknown as { process: { env: Record<string, string | undefined> } }).process.env;
const originalTz = env.TZ;
afterEach(() => {
  if (originalTz === undefined) delete env.TZ;
  else env.TZ = originalTz;
});

describe("localDateString", () => {
  it("formats the local calendar day, zero padded", () => {
    expect(localDateString(new Date(2026, 0, 5, 12, 0, 0))).toBe("2026-01-05");
    expect(localDateString(new Date(2026, 10, 4, 12, 0, 0))).toBe("2026-11-04");
  });

  it("flips exactly at local midnight", () => {
    expect(localDateString(new Date(2026, 10, 4, 23, 59, 59, 999))).toBe("2026-11-04");
    expect(localDateString(new Date(2026, 10, 5, 0, 0, 0, 0))).toBe("2026-11-05");
  });

  it("handles month and year rollover and leap day", () => {
    expect(localDateString(new Date(2026, 11, 31, 23, 59))).toBe("2026-12-31");
    expect(localDateString(new Date(2027, 0, 1, 0, 0))).toBe("2027-01-01");
    expect(localDateString(new Date(2028, 1, 29, 8, 0))).toBe("2028-02-29");
  });

  it("uses the device time zone, not UTC, and follows a time zone change", () => {
    const instant = new Date("2026-11-04T23:30:00.000Z");
    env.TZ = "UTC";
    expect(localDateString(instant)).toBe("2026-11-04");
    env.TZ = "Asia/Tokyo"; // UTC+9: already Nov 5th
    expect(localDateString(instant)).toBe("2026-11-05");
    env.TZ = "America/Los_Angeles"; // UTC-8: still Nov 4th
    expect(localDateString(instant)).toBe("2026-11-04");
    env.TZ = "Pacific/Kiritimati"; // UTC+14
    expect(localDateString(instant)).toBe("2026-11-05");
  });

  it("defaults to the current time", () => {
    expect(localDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
