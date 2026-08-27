// XP curve: the 1st commit of a UTC calendar day is worth BASE_XP_PER_COMMIT;
// each subsequent commit that same day is worth XP_DECAY_RATE times the
// previous one's value. This is the sole capping mechanism — no separate
// hard daily cutoff — because a geometric series converges on its own: the
// asymptotic ceiling is BASE_XP_PER_COMMIT / (1 - XP_DECAY_RATE) = 200 XP/day,
// unreachable in practice but approached within a handful of commits. XP
// only accrues from commits during the development phase (freezes at
// Deploy); deploy-triggered growth or branching evolutions are future work.
// See docs/adr/013-xp-daily-diminishing-returns.md.
//
// Values are x10 the "natural" 3/0.85 curve purely so rounding a push's XP
// to the nearest integer (see xpForPush and recordCommit in service.ts)
// doesn't lose much precision between consecutive commits in a day.
export const BASE_XP_PER_COMMIT = 30;
export const XP_DECAY_RATE = 0.85;

// xpForPush and the raw SQL update in service.ts's recordCommit both
// implement this same closed-form geometric sum — as a DB-side expression
// there (not a read-then-write) so concurrent webhook deliveries for the
// same repo can't race on a stale read, the same reasoning as the sick/
// openIssueCount updates. Kept here too, as a plain function, so the formula
// itself is unit-testable independent of the database.
export function xpForPush(
  commitsSoFarToday: number,
  commitCount: number,
): number {
  return Math.round(
    BASE_XP_PER_COMMIT *
      XP_DECAY_RATE ** commitsSoFarToday *
      ((1 - XP_DECAY_RATE ** commitCount) / (1 - XP_DECAY_RATE)),
  );
}

// Comfortably above the top stage threshold — XP has no purpose past
// "adult", so it's capped well below the pgInteger range instead of growing
// forever.
export const MAX_XP = 1_000_000;

export type Stage = "egg" | "hatchling" | "juvenile" | "adult";

const STAGE_THRESHOLDS: [Stage, number][] = [
  ["adult", 3000],
  ["juvenile", 1200],
  ["hatchling", 300],
  ["egg", 0],
];

export function stageForXp(xp: number): Stage {
  return stageProgress(xp).stage;
}

// floor: the xp threshold the current stage started at. ceiling: the next
// stage's threshold, or null if already at the top stage (adult) — used to
// render the xp progress bar under the badge art.
export function stageProgress(xp: number): {
  stage: Stage;
  floor: number;
  ceiling: number | null;
} {
  for (let i = 0; i < STAGE_THRESHOLDS.length; i++) {
    const [stage, floor] = STAGE_THRESHOLDS[i];
    if (xp >= floor) {
      return {
        stage,
        floor,
        ceiling: i > 0 ? STAGE_THRESHOLDS[i - 1][1] : null,
      };
    }
  }
  return {
    stage: "egg",
    floor: 0,
    ceiling: STAGE_THRESHOLDS[STAGE_THRESHOLDS.length - 1][1],
  };
}
