import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { installations, repos, pets } from "@/lib/db/schema";
import { boostedHealth } from "./health";
import { boostedXp } from "./growth";

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
      set: { accountLogin: installation.accountLogin, accountType: installation.accountType },
    });
}

// openIssueCount seeds a newly-created pet with the repo's real current
// issue count (fetched from the GitHub API by the caller) — otherwise a
// repo installed with pre-existing open issues would default to 0 and
// under-report Sick the first time it's deployed. Ignored for a repo that
// already has a pet, since that pet's count is already tracked live.
export async function upsertRepo(installationId: number, repo: GithubRepo, openIssueCount: number) {
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
  // Pet row cascades via FK in a future migration if we add ON DELETE CASCADE;
  // for now delete explicitly to keep behavior obvious.
  await db.delete(pets).where(eq(pets.repoId, repoId));
  await db.delete(repos).where(eq(repos.id, repoId));
}

// Push event: feed the pet if it's still in the development phase.
// See docs/adr/003-pet-lifecycle-phases.md.
export async function recordCommit(repoId: number) {
  const pet = await getPetByRepoId(repoId);
  if (!pet || pet.phase !== "development") return;

  await db
    .update(pets)
    .set({
      health: boostedHealth(pet.health, pet.lastCommitAt),
      xp: boostedXp(pet.xp),
      lastCommitAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(pets.repoId, repoId));
}

// Release published (or an explicit MCP deploy call): enter the deployed
// phase. See docs/adr/004-deployment-signal.md.
export async function markDeployed(repoId: number) {
  // sick is derived from open_issue_count within this same UPDATE, rather
  // than from a separately-read pet object, so a concurrent issue webhook
  // for the same repo can't have its write clobbered by this one (or vice
  // versa) — see the review discussion on PR #3.
  const updated = await db
    .update(pets)
    .set({
      phase: "deployed",
      sick: sql`${pets.openIssueCount} > 0`,
      updatedAt: new Date(),
    })
    .where(eq(pets.repoId, repoId))
    .returning({ id: pets.id });

  // Can happen if this release event was delivered before the installation/
  // installation_repositories event that creates the pet row. Not retried —
  // see docs/open-questions.md.
  if (updated.length === 0) {
    console.warn(`markDeployed: no pet for repo ${repoId}, deploy event dropped`);
  }
}

// Issues opened/closed: only affects Sick status once a pet is deployed.
// See docs/adr/005-sickness-signal.md.
export async function setOpenIssueCount(repoId: number, openIssueCount: number) {
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
    console.warn(`setOpenIssueCount: no pet for repo ${repoId}, issue event dropped`);
  }
}

export async function getRepoById(repoId: number) {
  const [repo] = await db.select().from(repos).where(eq(repos.id, repoId)).limit(1);
  return repo ?? null;
}

export async function getPetByRepoId(repoId: number) {
  const [pet] = await db.select().from(pets).where(eq(pets.repoId, repoId)).limit(1);
  return pet ?? null;
}
