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
// match any stored token. Called on every MCP request, so it also stamps
// lastUsedAt — best-effort (not awaited by the caller's response) since a
// failed write here shouldn't fail the request it's just bookkeeping for.
export async function getRepoIdForToken(
  rawToken: string,
): Promise<number | null> {
  const [row] = await db
    .select({ repoId: mcpTokens.repoId })
    .from(mcpTokens)
    .where(eq(mcpTokens.tokenHash, hashToken(rawToken)))
    .limit(1);

  if (!row) return null;

  db.update(mcpTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(mcpTokens.repoId, row.repoId))
    .catch((err) =>
      console.error("Failed to update mcp token lastUsedAt", err),
    );

  return row.repoId;
}

export async function getMcpTokenStatus(
  repoId: number,
): Promise<{ exists: boolean; lastUsedRelative: string | null }> {
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
