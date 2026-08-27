import { cache } from "react";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { repos, pets } from "@/lib/db/schema";
import { currentHealth } from "./health";

export type Phase = "development" | "deployed";

// Shape the Dashboard components render against — same shape the placeholder
// sample data used (lib/pets/sample-data.ts, now removed) so this swap-in
// didn't require touching any component. Derived fields (health, relative
// timestamps) are computed here rather than stored, same pattern as the rest
// of the pet model.
export type DashboardPet = {
  repoId: string;
  fullName: string;
  isPrivate: boolean;
  phase: Phase;
  xp: number;
  health: number;
  sick: boolean;
  openIssueCount: number;
  lastCommitRelative: string | null;
  deployedRelative: string | null;
  installedOn: string;
};

type PetRow = {
  repoId: number;
  fullName: string;
  isPrivate: boolean;
  installedAt: Date;
  phase: Phase;
  xp: number;
  health: number;
  lastCommitAt: Date | null;
  sick: boolean;
  openIssueCount: number;
  deployedAt: Date | null;
};

const PET_ROW_COLUMNS = {
  repoId: repos.id,
  fullName: repos.fullName,
  isPrivate: repos.isPrivate,
  installedAt: repos.createdAt,
  phase: pets.phase,
  xp: pets.xp,
  health: pets.health,
  lastCommitAt: pets.lastCommitAt,
  sick: pets.sick,
  openIssueCount: pets.openIssueCount,
  deployedAt: pets.deployedAt,
} as const;

// Every pet visible to a signed-in user, across every installation they can
// access. See lib/github/user-auth.ts for how `installationIds` is resolved
// from the user's connected GitHub account.
export async function getDashboardPets(
  installationIds: number[],
): Promise<DashboardPet[]> {
  if (installationIds.length === 0) return [];

  const rows = await db
    .select(PET_ROW_COLUMNS)
    .from(repos)
    .innerJoin(pets, eq(pets.repoId, repos.id))
    .where(inArray(repos.installationId, installationIds));

  return rows.map(toDashboardPet);
}

// Scoped by `installationIds` so a user can't view another user's repo by
// guessing its numeric id — this is the authorization boundary for the pet
// detail page, not just a lookup.
//
// Wrapped in React's cache() so the pet detail route calling this from both
// generateMetadata and its page component (app/dashboard/[repoId]/page.tsx)
// shares one query per request instead of two.
export const getDashboardPet = cache(
  async (
    repoId: number,
    installationIds: number[],
  ): Promise<DashboardPet | null> => {
    if (installationIds.length === 0) return null;

    const [row] = await db
      .select(PET_ROW_COLUMNS)
      .from(repos)
      .innerJoin(pets, eq(pets.repoId, repos.id))
      .where(
        and(
          eq(repos.id, repoId),
          inArray(repos.installationId, installationIds),
        ),
      )
      .limit(1);

    return row ? toDashboardPet(row) : null;
  },
);

function toDashboardPet(row: PetRow): DashboardPet {
  return {
    repoId: String(row.repoId),
    fullName: row.fullName,
    isPrivate: row.isPrivate,
    phase: row.phase,
    xp: row.xp,
    health: currentHealth(row.health, row.lastCommitAt),
    sick: row.sick,
    openIssueCount: row.openIssueCount,
    lastCommitRelative: row.lastCommitAt
      ? relativeTime(row.lastCommitAt)
      : null,
    // deployedAt is set once, on the development -> deployed transition, and
    // never overwritten again (see markDeployed in lib/pets/service.ts) — so
    // this stays exact regardless of later touches like issue-count changes
    // or repeat idempotent markDeployed calls.
    deployedRelative:
      row.phase === "deployed" && row.deployedAt
        ? relativeTime(row.deployedAt)
        : null,
    installedOn: formatInstalledOn(row.installedAt),
  };
}

// Exported for lib/mcp/tokens.ts, which formats a token's last-used time the
// same way the rest of the Dashboard formats timestamps.
export function relativeTime(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatInstalledOn(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
