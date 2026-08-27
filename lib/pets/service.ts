import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { installations, repos, pets } from "@/lib/db/schema";
import { boostedHealth } from "./health";
import { BASE_XP_PER_COMMIT, XP_DECAY_RATE, MAX_XP } from "./growth";

type GithubRepo = {
  id: number;
  name: string;
  owner: string;
  fullName: string;
  isPrivate: boolean;
};

type GithubInstallation = {
  id: number;
  accountLogin: string;
  accountType: string;
};

export async function upsertInstallation(installation: GithubInstallation) {
  await db
    .insert(installations)
    .values(installation)
    .onConflictDoUpdate({
      target: installations.id,
      set: {
        accountLogin: installation.accountLogin,
        accountType: installation.accountType,
      },
    });
}

// openIssueCount seeds a newly-created pet with the repo's real current
// issue count (fetched from the GitHub API by the caller) — otherwise a
// repo installed with pre-existing open issues would default to 0 and
// under-report Sick the first time it's deployed. Ignored for a repo that
// already has a pet, since that pet's count is already tracked live.
export async function upsertRepo(
  installationId: number,
  repo: GithubRepo,
  openIssueCount: number,
) {
  await db
    .insert(repos)
    .values({ ...repo, installationId })
    .onConflictDoUpdate({
      target: repos.id,
      set: {
        installationId,
        name: repo.name,
        owner: repo.owner,
        fullName: repo.fullName,
        isPrivate: repo.isPrivate,
      },
    });

  // Every repo gets exactly one pet as soon as it's known. See docs/adr/002.
  await db
    .insert(pets)
    .values({ repoId: repo.id, openIssueCount })
    .onConflictDoNothing({ target: pets.repoId });
}

export async function removeRepo(repoId: number) {
  // Pet row cascades via FK in a future migration if we add ON DELETE
  // CASCADE; for now delete explicitly to keep behavior obvious. mcpTokens
  // already has ON DELETE CASCADE (lib/db/schema.ts), so the repos delete
  // below cleans that up on its own.
  await db.delete(pets).where(eq(pets.repoId, repoId));
  await db.delete(repos).where(eq(repos.id, repoId));
}

// Push event: feed the pet if it's still in the development phase.
// See docs/adr/003-pet-lifecycle-phases.md. commitCount is the number of
// commits in this push — each counts as its own step in that UTC day's
// diminishing-returns sequence, not one flat award per push. See
// docs/adr/013-xp-daily-diminishing-returns.md.
export async function recordCommit(repoId: number, commitCount: number) {
  const pet = await getPetByRepoId(repoId);
  if (!pet || pet.phase !== "development") return;

  // True when lastCommitAt falls on the same UTC calendar day as now() —
  // shared between commitsToday (below) and the xp expression so a commit
  // that starts a new day resets both consistently. `now() AT TIME ZONE
  // 'UTC'` (not bare now()) so the day boundary is pinned to UTC regardless
  // of the DB session's TimeZone setting.
  const sameDay = sql`${pets.lastCommitAt} IS NOT NULL AND date_trunc('day', ${pets.lastCommitAt}) = date_trunc('day', now() AT TIME ZONE 'UTC')`;
  // Commits already recorded today, before this push.
  const commitsBefore = sql`(CASE WHEN ${sameDay} THEN ${pets.commitsToday} ELSE 0 END)`;
  // Cumulative XP earned today after N commits — mirrors growth.ts's
  // dailyXpTotal. Rounded once per cumulative total (not once per push
  // increment) so a day's total is path-independent: the same commits award
  // the same XP whether they land in one push or many. See growth.ts.
  const dailyXpTotal = (commits: ReturnType<typeof sql>) =>
    sql`ROUND(${BASE_XP_PER_COMMIT} * ((1 - POWER(${XP_DECAY_RATE}, ${commits})) / (1 - ${XP_DECAY_RATE})))::integer`;

  // Re-checks phase in the WHERE clause (not just the read above) so a
  // concurrent markDeployed() can't leave a stale commit landing after the
  // pet already left development. health's own concurrency gap is tracked
  // in docs/open-questions.md rather than fixed here.
  //
  // xp mirrors growth.ts's xpForPush as a DB-side expression (not a
  // read-then-write) so concurrent webhook deliveries for the same repo
  // can't race on a stale read, the same reasoning as the sick/
  // openIssueCount updates.
  const updated = await db
    .update(pets)
    .set({
      health: boostedHealth(pet.health, pet.lastCommitAt),
      commitsToday: sql`${commitsBefore} + ${commitCount}`,
      xp: sql`LEAST(${pets.xp} + (${dailyXpTotal(sql`${commitsBefore} + ${commitCount}`)} - ${dailyXpTotal(commitsBefore)}), ${MAX_XP})`,
      lastCommitAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(pets.repoId, repoId), eq(pets.phase, "development")))
    .returning({ id: pets.id });

  // Can happen if a deploy webhook landed between the read above and this
  // write — not an error, just a lost race, nothing to retry.
  if (updated.length === 0) {
    console.warn(
      `recordCommit: pet ${repoId} left development phase mid-update, commit dropped`,
    );
  }
}

// Release published (or an explicit MCP deploy call): enter the deployed
// phase. See docs/adr/004-deployment-signal.md. Returns whether a pet row was
// actually updated, so callers (the MCP tool) can distinguish "did it" from
// "there's no pet for this repo."
export async function markDeployed(repoId: number): Promise<boolean> {
  // sick is derived from open_issue_count within this same UPDATE, rather
  // than from a separately-read pet object, so a concurrent issue webhook
  // for the same repo can't have its write clobbered by this one (or vice
  // versa) — see the review discussion on PR #3.
  //
  // deployedAt is set via COALESCE within this same UPDATE (not read-then-
  // write) so it's populated once, on the actual development -> deployed
  // transition, and left untouched on every subsequent call. The MCP
  // mark_deployed tool is documented as idempotent and can be called
  // repeatedly for an already-deployed pet — without this, a plain
  // `new Date()` here would reset the dashboard's "deployed X ago" display
  // to "just now" on every repeat call even though nothing changed.
  const updated = await db
    .update(pets)
    .set({
      phase: "deployed",
      sick: sql`${pets.openIssueCount} > 0`,
      deployedAt: sql`COALESCE(${pets.deployedAt}, now())`,
      updatedAt: new Date(),
    })
    .where(eq(pets.repoId, repoId))
    .returning({ id: pets.id });

  // Can happen if this release event was delivered before the installation/
  // installation_repositories event that creates the pet row. Not retried —
  // see docs/open-questions.md.
  if (updated.length === 0) {
    console.warn(
      `markDeployed: no pet for repo ${repoId}, deploy event dropped`,
    );
  }
  return updated.length > 0;
}

// Issues opened/closed: only affects Sick status once a pet is deployed.
// See docs/adr/005-sickness-signal.md.
export async function setOpenIssueCount(
  repoId: number,
  openIssueCount: number,
) {
  // sick derived from phase within this same UPDATE — see markDeployed.
  const updated = await db
    .update(pets)
    .set({
      openIssueCount,
      sick: sql`${pets.phase} = 'deployed' AND ${openIssueCount} > 0`,
      updatedAt: new Date(),
    })
    .where(eq(pets.repoId, repoId))
    .returning({ id: pets.id });

  if (updated.length === 0) {
    console.warn(
      `setOpenIssueCount: no pet for repo ${repoId}, issue event dropped`,
    );
  }
}

// Repository visibility changed (GitHub's `repository.privatized`/
// `publicized` events) — keeps the badge endpoint's isPrivate check
// (docs/adr/011-private-repo-badges-blocked.md) from serving a stale
// decision after a repo's visibility changes post-install.
export async function setRepoPrivate(repoId: number, isPrivate: boolean) {
  await db.update(repos).set({ isPrivate }).where(eq(repos.id, repoId));
}

// Agent-reported fix, via the MCP tool (docs/adr/007-mcp-scope.md) — distinct
// from setOpenIssueCount, which mirrors GitHub's own issue-tracker count.
// This just decrements by one: an agent calling this isn't necessarily
// closing a tracked GitHub issue, so it's a coarser, independent correction
// rather than an attempt to stay in sync with GitHub's count. Returns whether
// a pet row was actually updated, same reasoning as markDeployed above.
export async function markIssueFixed(repoId: number): Promise<boolean> {
  // sick derived from the post-decrement count within this same UPDATE, same
  // reasoning as markDeployed/setOpenIssueCount above.
  const updated = await db
    .update(pets)
    .set({
      openIssueCount: sql`GREATEST(${pets.openIssueCount} - 1, 0)`,
      sick: sql`${pets.phase} = 'deployed' AND GREATEST(${pets.openIssueCount} - 1, 0) > 0`,
      updatedAt: new Date(),
    })
    .where(eq(pets.repoId, repoId))
    .returning({ id: pets.id });

  if (updated.length === 0) {
    console.warn(`markIssueFixed: no pet for repo ${repoId}`);
  }
  return updated.length > 0;
}

export async function getRepoById(repoId: number) {
  const [repo] = await db
    .select()
    .from(repos)
    .where(eq(repos.id, repoId))
    .limit(1);
  return repo ?? null;
}

export async function getPetByRepoId(repoId: number) {
  const [pet] = await db
    .select()
    .from(pets)
    .where(eq(pets.repoId, repoId))
    .limit(1);
  return pet ?? null;
}
