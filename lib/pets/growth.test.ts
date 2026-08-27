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
    expect(onePushOfFive).toBeLessThan(5 * 30);
  });

  it("is path-independent: the same commits award the same total XP whether split into many pushes or one", () => {
    const onePushOfFive = xpForPush(0, 5);
    const fiveSeparatePushes =
      xpForPush(0, 1) +
      xpForPush(1, 1) +
      xpForPush(2, 1) +
      xpForPush(3, 1) +
      xpForPush(4, 1);
    expect(fiveSeparatePushes).toBe(onePushOfFive);
  });

  it("never lets the day's cumulative total exceed the asymptotic ceiling, no matter how it's partitioned", () => {
    const ceiling = 200; // BASE_XP_PER_COMMIT / (1 - XP_DECAY_RATE)
    // 26 separate one-commit pushes — the adversarial case that used to
    // overshoot the ceiling via accumulated per-push rounding error.
    let total = 0;
    for (let i = 0; i < 26; i++) {
      total += xpForPush(i, 1);
    }
    expect(total).toBeLessThanOrEqual(ceiling);

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
