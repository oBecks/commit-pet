import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { installations, repos, pets } from "@/lib/db/schema";
import { boostedHealth } from "./health";

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

export async function upsertRepo(installationId: number, repo: GithubRepo) {
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
  await db.insert(pets).values({ repoId: repo.id }).onConflictDoNothing({ target: pets.repoId });
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
      lastCommitAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(pets.repoId, repoId));
}

// Release published (or an explicit MCP deploy call): enter the deployed
// phase. See docs/adr/004-deployment-signal.md.
export async function markDeployed(repoId: number) {
  await db
    .update(pets)
    .set({ phase: "deployed", updatedAt: new Date() })
    .where(eq(pets.repoId, repoId));
}

// Issues opened/closed: only affects Sick status once a pet is deployed.
// See docs/adr/005-sickness-signal.md.
export async function setOpenIssueCount(repoId: number, openIssueCount: number) {
  const pet = await getPetByRepoId(repoId);
  if (!pet) return;

  await db
    .update(pets)
    .set({
      openIssueCount,
      sick: pet.phase === "deployed" && openIssueCount > 0,
      updatedAt: new Date(),
    })
    .where(eq(pets.repoId, repoId));
}

export async function getPetByRepoId(repoId: number) {
  const [pet] = await db.select().from(pets).where(eq(pets.repoId, repoId)).limit(1);
  return pet ?? null;
}
