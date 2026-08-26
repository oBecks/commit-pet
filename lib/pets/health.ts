// Placeholder tuning constants — the real curve is an open product decision.
// See docs/open-questions.md. Health decay is computed lazily on read from
// (storedHealth, lastCommitAt) rather than via a scheduled job, so there's no
// cron/background worker needed to keep it accurate.
const MAX_HEALTH = 100;
const DECAY_PER_DAY = 5;
const COMMIT_BOOST = 20;

export function currentHealth(
  storedHealth: number,
  lastCommitAt: Date | null,
): number {
  if (!lastCommitAt) return storedHealth;
  const daysSince =
    (Date.now() - lastCommitAt.getTime()) / (1000 * 60 * 60 * 24);
  const decayed = storedHealth - DECAY_PER_DAY * Math.max(0, daysSince);
  return clamp(Math.round(decayed));
}

export function boostedHealth(
  storedHealth: number,
  lastCommitAt: Date | null,
): number {
  return clamp(currentHealth(storedHealth, lastCommitAt) + COMMIT_BOOST);
}

function clamp(health: number): number {
  return Math.max(0, Math.min(MAX_HEALTH, health));
}
