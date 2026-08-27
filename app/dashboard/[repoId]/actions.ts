"use server";

import { getAccessibleInstallationIds } from "@/lib/github/user-auth";
import { getRepoById } from "@/lib/pets/service";
import { generateMcpToken } from "@/lib/mcp/tokens";

// Same authorization boundary as the page itself (lib/pets/dashboard-data.ts):
// a repo that exists but belongs to an installation the signed-in user can't
// see is treated the same as one that doesn't exist.
export async function regenerateMcpToken(repoId: number): Promise<string> {
  const installationIds = await getAccessibleInstallationIds();
  if (installationIds === null) {
    throw new Error("Not signed in");
  }

  const repo = await getRepoById(repoId);
  if (!repo || !installationIds.includes(repo.installationId)) {
    throw new Error("Not authorized for this repo");
  }

  return generateMcpToken(repoId);
}
