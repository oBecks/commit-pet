// Placeholder mood thresholds — same "real tuning is an open product decision"
// caveat as growth.ts/health.ts. Sick (an explicit GitHub-issues signal, see
// ADR-005) always wins over a low-health tint: it's the stronger, more
// specific signal, so there's no point blending the two.
const TIRED_HEALTH_THRESHOLD = 40;

export type Mood = "healthy" | "tired" | "sick";

export function moodFor(health: number, sick: boolean): Mood {
  if (sick) return "sick";
  if (health < TIRED_HEALTH_THRESHOLD) return "tired";
  return "healthy";
}
