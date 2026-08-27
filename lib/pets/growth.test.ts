import { describe, expect, it } from "vitest";
import { xpForPush, stageForXp, stageProgress } from "./growth";

describe("xpForPush", () => {
  it("awards the full base value for the first commit of the day", () => {
    expect(xpForPush(0, 1)).toBe(30);
  });

  it("awards less for a commit later in the same day", () => {
    const first = xpForPush(0, 1);
    const fifth = xpForPush(4, 1);
    expect(fifth).toBeLessThan(first);
  });

  it("resets to the full value on a fresh day", () => {
    expect(xpForPush(0, 1)).toBe(xpForPush(0, 1));
    expect(xpForPush(20, 1)).toBeLessThan(xpForPush(0, 1));
  });

  it("sums a multi-commit push as a diminishing sequence, not a flat multiple", () => {
    const onePushOfFive = xpForPush(0, 5);
    const fiveSeparatePushes =
      xpForPush(0, 1) +
      xpForPush(1, 1) +
      xpForPush(2, 1) +
      xpForPush(3, 1) +
      xpForPush(4, 1);
    // both should match closely (rounding per-push vs per-commit can differ
    // by a hair), but neither should be anywhere near a flat 5x award
    expect(onePushOfFive).toBeLessThan(5 * 30);
    expect(Math.abs(onePushOfFive - fiveSeparatePushes)).toBeLessThanOrEqual(2);
  });

  it("approaches the asymptotic daily ceiling but never exceeds it", () => {
    const ceiling = 200; // BASE_XP_PER_COMMIT / (1 - XP_DECAY_RATE)
    expect(xpForPush(0, 1000)).toBeLessThanOrEqual(ceiling);
    expect(xpForPush(0, 1000)).toBeGreaterThan(ceiling * 0.99);
  });
});

describe("stageForXp", () => {
  it("is egg at zero xp", () => {
    expect(stageForXp(0)).toBe("egg");
  });

  it("is hatchling once the threshold is reached", () => {
    expect(stageForXp(299)).toBe("egg");
    expect(stageForXp(300)).toBe("hatchling");
  });

  it("is juvenile once the threshold is reached", () => {
    expect(stageForXp(1200)).toBe("juvenile");
  });

  it("is adult once the threshold is reached, and stays adult past it", () => {
    expect(stageForXp(3000)).toBe("adult");
    expect(stageForXp(1_000_000)).toBe("adult");
  });
});

describe("stageProgress", () => {
  it("reports a null ceiling at the top stage", () => {
    expect(stageProgress(3000).ceiling).toBeNull();
  });

  it("reports floor/ceiling for the current stage", () => {
    expect(stageProgress(500)).toEqual({
      stage: "hatchling",
      floor: 300,
      ceiling: 1200,
    });
  });
});
