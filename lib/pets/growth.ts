// Placeholder XP/leveling curve — the real thresholds are an open product
// decision, same as the health curve in health.ts. XP only accrues from
// commits during the development phase; deploy-triggered growth or branching
// evolutions are future work (see docs/open-questions.md).
//
// Exported as constants rather than a boostedXp(xp) helper: the increment is
// applied as a database-side arithmetic expression (see recordCommit in
// service.ts) so concurrent webhook deliveries for the same repo can't race
// on a stale read, the same reasoning as the sick/openIssueCount updates.
export const XP_PER_COMMIT = 10;
// Comfortably above the top stage threshold — XP has no purpose past
// "adult", so it's capped well below the pgInteger range instead of growing
// forever (a repo would need ~1M commits to reach this).
export const MAX_XP = 1_000_000;

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
