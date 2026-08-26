// Placeholder XP/leveling curve — the real thresholds are an open product
// decision, same as the health curve in health.ts. XP only accrues from
// commits during the development phase; deploy-triggered growth or branching
// evolutions are future work (see docs/open-questions.md).
const XP_PER_COMMIT = 10;

export type Stage = "egg" | "hatchling" | "juvenile" | "adult";

const STAGE_THRESHOLDS: [Stage, number][] = [
  ["adult", 300],
  ["juvenile", 120],
  ["hatchling", 30],
  ["egg", 0],
];

export function stageForXp(xp: number): Stage {
  for (const [stage, threshold] of STAGE_THRESHOLDS) {
    if (xp >= threshold) return stage;
  }
  return "egg";
}

export function boostedXp(xp: number): number {
  return xp + XP_PER_COMMIT;
}
