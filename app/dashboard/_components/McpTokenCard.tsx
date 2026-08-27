"use client";

import { useState } from "react";
import { regenerateMcpToken } from "../[repoId]/actions";
import { CopyButton } from "./CopyButton";

export function McpTokenCard({
  repoId,
  hasToken,
  lastUsedRelative,
}: {
  repoId: string;
  hasToken: boolean;
  lastUsedRelative: string | null;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function handleGenerate() {
    setPending(true);
    setError(false);
    try {
      setToken(await regenerateMcpToken(Number(repoId)));
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dash-border bg-dash-card p-6">
      <h2 className="text-[15px] font-bold text-dash-heading">MCP access</h2>
      <p className="text-sm text-dash-muted">
        Let a coding agent see and update this pet directly: check status, mark
        deployed, or mark an issue fixed.
      </p>

      {token ? (
        <>
          <div className="overflow-x-auto rounded-lg bg-[#2B2115] p-3">
            <code className="font-mono text-[11.5px] whitespace-pre text-[#F5EFE4]">
              {token}
            </code>
          </div>
          <p className="text-xs text-dash-muted">
            Shown once — copy it now. Configure it as the bearer token for your
            MCP client, pointed at <code className="font-mono">/api/mcp</code>.
          </p>
          <CopyButton text={token} label="Copy token" />
        </>
      ) : (
        <>
          <p className="text-xs text-dash-muted">
            {hasToken
              ? `A token already exists (${lastUsedRelative ? `last used ${lastUsedRelative}` : "not used yet"}). Generating a new one revokes it.`
              : "No token generated yet."}
          </p>
          {error && (
            <p className="text-xs text-sick-text">
              Couldn&apos;t generate a token. Try again.
            </p>
          )}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={pending}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-dash-border p-2 text-sm font-semibold text-dash-heading hover:bg-dash-neutral-pill disabled:opacity-50"
          >
            {pending
              ? "Generating…"
              : hasToken
                ? "Regenerate token"
                : "Generate token"}
          </button>
        </>
      )}
    </div>
  );
}
