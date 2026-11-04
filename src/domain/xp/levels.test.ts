import { levelOf, levelProgress, levelStart } from "./levels";

describe("levels", () => {
  it("starts level n at 50·n·(n−1) XP", () => {
    expect([1, 2, 3, 4].map(levelStart)).toEqual([0, 100, 300, 600]);
  });
  it("maps XP to levels at the boundaries", () => {
    expect([0, 99, 100, 299, 300, 599, 600].map(levelOf)).toEqual([1, 1, 2, 2, 3, 3, 4]);
  });
  it("reports progress inside a level", () => {
    expect(levelProgress(420)).toMatchObject({ level: 3, xpIntoLevel: 120, levelSpan: 300, xpToNext: 180, nextLevelAt: 600 });
  });
});
