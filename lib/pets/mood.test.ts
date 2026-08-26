import { describe, expect, it } from "vitest";
import { moodFor } from "./mood";

describe("moodFor", () => {
  it("is sick when the sick flag is set, regardless of health", () => {
    expect(moodFor(100, true)).toBe("sick");
    expect(moodFor(0, true)).toBe("sick");
  });

  it("is tired when health is below the threshold and not sick", () => {
    expect(moodFor(39, false)).toBe("tired");
  });

  it("is healthy when health is at or above the threshold and not sick", () => {
    expect(moodFor(40, false)).toBe("healthy");
    expect(moodFor(100, false)).toBe("healthy");
  });
});
