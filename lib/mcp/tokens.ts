import { randomBytes, createHash } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { mcpTokens } from "@/lib/db/schema";
import { relativeTime } from "@/lib/pets/dashboard-data";

// Prefixed so a leaked token is recognizable at a glance (same idea as
// GitHub's ghp_/gho_ prefixes), not for any parsing purpose.
const TOKEN_PREFIX = "cpat_";

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

// Generates a fresh token for repoId and stores its hash, overwriting any
// previous token for that repo — see the mcpTokens comment in
// lib/db/schema.ts for why that's sufficient as "revocation." Returns the raw
// token, which is shown to the caller exactly once and never persisted.
export async function generateMcpToken(repoId: number): Promise<string> {
  const rawToken = TOKEN_PREFIX + randomBytes(24).toString("base64url");

  await db
    .insert(mcpTokens)
    .values({ repoId, tokenHash: hashToken(rawToken) })
    .onConflictDoUpdate({
      target: mcpTokens.repoId,
      set: {
        tokenHash: hashToken(rawToken),
        createdAt: new Date(),
        lastUsedAt: null,
      },
    });

  return rawToken;
}

// Resolves a bearer token to the repo it authorizes, or null if it doesn't
// match any stored token.
export async function getRepoIdForToken(
  rawToken: string,
): Promise<number | null> {
  const [row] = await db
    .select({ repoId: mcpTokens.repoId })
    .from(mcpTokens)
    .where(eq(mcpTokens.tokenHash, hashToken(rawToken)))
    .limit(1);

  return row?.repoId ?? null;
}

// Bookkeeping only, deliberately not awaited by the request that resolved the
// token — a failed write here shouldn't fail the MCP call it's just recording
// stats for. The caller (app/api/mcp/route.ts) schedules this with Next's
// after() so it can still finish once the response has been sent, which a
// bare fire-and-forget call can't guarantee on a serverless platform.
//
// Matches by tokenHash (unique), not repoId: if the token were regenerated in
// the gap between auth and this callback firing, matching by repoId would
// stamp the *new* token's row for a request that actually authenticated with
// the old one.
export async function touchTokenLastUsed(rawToken: string): Promise<void> {
  try {
    await db
      .update(mcpTokens)
      .set({ lastUsedAt: new Date() })
      .where(eq(mcpTokens.tokenHash, hashToken(rawToken)));
  } catch (err) {
    console.error("Failed to update mcp token lastUsedAt", err);
  }
}

export type McpTokenStatus = { exists: boolean; lastUsedRelative: string | null };

export async function getMcpTokenStatus(
  repoId: number,
): Promise<McpTokenStatus> {
  const [row] = await db
    .select({ lastUsedAt: mcpTokens.lastUsedAt })
    .from(mcpTokens)
    .where(eq(mcpTokens.repoId, repoId))
    .limit(1);

  if (!row) return { exists: false, lastUsedRelative: null };
  return {
    exists: true,
    lastUsedRelative: row.lastUsedAt ? relativeTime(row.lastUsedAt) : null,
  };
}
