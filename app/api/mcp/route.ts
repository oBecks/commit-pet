import type { AuthInfo } from "@modelcontextprotocol/server";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { after } from "next/server";
import { getRepoIdForToken, touchTokenLastUsed } from "@/lib/mcp/tokens";
import { currentHealth } from "@/lib/pets/health";
import { moodFor } from "@/lib/pets/mood";
import { stageForXp } from "@/lib/pets/growth";
import {
  getPetByRepoId,
  markDeployed,
  markIssueFixed,
} from "@/lib/pets/service";

// Every tool call is scoped to exactly one repo, fixed by which token the
// caller authenticated with — see docs/adr/014-mcp-repo-token-auth.md. The
// authInfo.extra.repoId is set by verifyToken below, after withMcpAuth has
// already required and validated the bearer token, so this is only ever
// missing on a server bug, not a client error.
function requireRepoId(authInfo: AuthInfo | undefined): number {
  const repoId = authInfo?.extra?.repoId;
  if (typeof repoId !== "number") {
    throw new Error("mcp: resolved repoId missing from auth context");
  }
  return repoId;
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "get_pet_status",
      {
        title: "Get pet status",
        description:
          "Get this repo's commit-pet: phase (development/deployed), health, mood, growth stage, XP, and open issue count.",
      },
      async (ctx) => {
        const repoId = requireRepoId(ctx.http?.authInfo);
        const pet = await getPetByRepoId(repoId);
        if (!pet) {
          return {
            content: [{ type: "text", text: "No pet found for this repo." }],
            isError: true,
          };
        }

        const health = currentHealth(pet.health, pet.lastCommitAt);
        const status = {
          phase: pet.phase,
          health,
          mood: moodFor(health, pet.sick),
          sick: pet.sick,
          stage: stageForXp(pet.xp),
          xp: pet.xp,
          openIssueCount: pet.openIssueCount,
        };
        return { content: [{ type: "text", text: JSON.stringify(status) }] };
      },
    );

    server.registerTool(
      "mark_deployed",
      {
        title: "Mark deployed",
        description:
          "Mark this repo's pet as deployed, entering the deployed phase (docs/adr/004-deployment-signal.md). Idempotent.",
      },
      async (ctx) => {
        const repoId = requireRepoId(ctx.http?.authInfo);
        const updated = await markDeployed(repoId);
        if (!updated) {
          return {
            content: [{ type: "text", text: "No pet found for this repo." }],
            isError: true,
          };
        }
        return { content: [{ type: "text", text: "Marked deployed." }] };
      },
    );

    server.registerTool(
      "mark_issue_fixed",
      {
        title: "Mark issue fixed",
        description:
          "Tell the pet you fixed one issue, decrementing its open issue count by one. This is independent of GitHub's own issue tracker — use it for fixes that aren't necessarily a tracked GitHub issue closing.",
      },
      async (ctx) => {
        const repoId = requireRepoId(ctx.http?.authInfo);
        const updated = await markIssueFixed(repoId);
        if (!updated) {
          return {
            content: [{ type: "text", text: "No pet found for this repo." }],
            isError: true,
          };
        }
        return { content: [{ type: "text", text: "Marked one issue fixed." }] };
      },
    );
  },
  { serverInfo: { name: "commit-pet", version: "1.0.0" } },
);

// Static per-repo tokens, not OAuth — see docs/adr/014-mcp-repo-token-auth.md
// for why. getRepoIdForToken resolves (and validates) the token directly
// against the mcp_tokens table; no authorization server is involved.
const verifyToken = async (
  _req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> => {
  if (!bearerToken) return undefined;

  const repoId = await getRepoIdForToken(bearerToken);
  if (repoId === null) return undefined;

  after(() => touchTokenLastUsed(bearerToken));

  return {
    token: bearerToken,
    clientId: String(repoId),
    scopes: [],
    extra: { repoId },
  };
};

const authHandler = withMcpAuth(handler, verifyToken, { required: true });

export { authHandler as GET, authHandler as POST };
