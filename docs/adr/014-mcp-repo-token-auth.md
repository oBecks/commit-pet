# ADR-014: MCP tool calls are authorized by a per-repo token minted from the Dashboard

## Status

Accepted

## Context

[ADR-007](007-mcp-scope.md) decided the MCP server exposes full pet-state control (query phase/health/sick, mark deployed, mark issues fixed), but explicitly left open how a call is authorized to act on exactly one repo. That's flagged as a real gap in [open-questions.md](../open-questions.md): "not just reuse the GitHub App token."

The calling context is a coding agent (Claude Code, Cursor, etc.) running inside one repo's checkout, configured with an MCP server entry once by a human. That's a fundamentally different shape than the Dashboard's auth ([ADR-012](012-clerk-github-oauth-scoping.md)): there's no browser, no Clerk session, and often no human present at call time (CI, autonomous agent runs) — so an interactive OAuth flow doesn't fit every case the tool needs to support, even though it fits some.

GitHub App installation tokens ([ADR-008](008-github-app-auth.md)) are minted server-side from the App's private key and scoped to an entire installation, which can cover many repos for an org. Handing one to an external agent would mean either distributing the App's private key off-server (defeats the point of ADR-008 rejecting PATs) or minting installation tokens on demand for external consumption — either way, over-granting a coding agent working in one repo access to every sibling repo in the same install.

## Decision

Add repo-scoped API tokens, generated from that repo's own Dashboard page ([app/dashboard/[repoId]](../../app/dashboard/[repoId])) by a signed-in user who already passes the existing "can this user see this repo" check ([ADR-012](012-clerk-github-oauth-scoping.md)'s live `GET /user/installations` resolution). Generating a token is a new privileged action gated by that same check, not a new access-control path.

- A new `mcp_tokens` table: `repo_id` (FK, unique — at most one row per repo), a hash of the token secret (never the raw value), `created_at`, `last_used_at`. Only one active token per repo at a time; generating a new one overwrites the row in place, which _is_ the revocation — there's no `revoked_at`/history tracking, since nothing reads a token once its hash is no longer stored anywhere to match against. Rotation is just "generate again."
- The raw token is shown once at generation time (same pattern as GitHub PATs, npm tokens, etc.) and never stored or displayable again.
- The MCP server is a Streamable HTTP endpoint (`app/api/mcp`, alongside the existing webhook/badge routes — commit-pet is already a hosted multi-tenant service per [ADR-009](009-public-multi-tenant.md), not a CLI users run locally), authenticated via `Authorization: Bearer <token>` on every request.
- The token resolves directly to one `repoId` via an `mcp_tokens` lookup — no GitHub API call, no installation token, no ambiguity about which repo a tool call targets. This is what actually answers ADR-004's "resolve which repo unambiguously from the calling context": the repo is fixed by which token the agent was configured with, matching the agent's real working context of "I am operating inside this one repo's checkout."
- MCP tool implementations call the same `lib/pets/service.ts` functions the webhook handlers use (`markDeployed`, `getPetByRepoId`, etc. — plus new "mark issue fixed" functions this unblocks), per ADR-007's consequence that these shouldn't be reimplemented.

## Alternatives considered

- **OAuth 2.1 authorization-code flow via Clerk, mirroring ADR-012's live resolution** — the MCP spec's own recommended auth model, and would avoid a new token table entirely. Rejected as the _only_ mechanism because it requires an interactive browser login, which doesn't fit headless/CI agent runs; and even when interactive, it resolves a _user_ and their accessible _installations_ (plural), not a single repo — the agent would still need a second step to pick one repo out of however many the signed-in user can see, which doesn't cleanly satisfy "resolve unambiguously." Not ruled out as a future addition for interactive clients layered on top of the same underlying repo-token model (e.g. the OAuth flow ends by minting/handing back a repo token once a repo is chosen), just not the whole answer today.
- **Per-installation token instead of per-repo** — simpler generation UX for org installs (one token, many repos), but reintroduces exactly the over-grant problem installation tokens already have: a coding agent working in one repo's checkout would be handed authority over every sibling repo in the install. Rejected as inconsistent with the "agent operates on the repo it's actually in" framing.
- **Reuse/proxy the GitHub App installation token directly** — rejected in Context above; wrong scope (installation, not repo) and wrong custody (would require exposing App-level credentials or a token-minting endpoint outside the server's own trusted call paths).
- **stdio-based local MCP server, run by the user with their own credentials** — would sidestep needing a hosted auth story at all, but commit-pet has no CLI distribution story and this would mean building one from scratch, plus pushes credential management back onto the user in exactly the way ADR-008 rejected for GitHub auth generally. Rejected as inconsistent with commit-pet's shape as a hosted app.

## Consequences

- New `mcp_tokens` table and migration; new Dashboard UI affordance (generate/rotate/revoke) on the repo detail page.
- A leaked repo token grants everything ADR-007 scoped the MCP server to for that one repo — query state and mark deployed/issues-fixed — but nothing beyond that repo. Blast radius is bounded to one repo, which is the main property this design is optimized for; rotation-by-regenerating is the only revocation UX for now, no token expiry.
- No `users`/membership table is introduced — token generation still resolves "who can see this repo" live via the same GitHub API call the Dashboard already makes, keeping ADR-012's "no stored membership" property intact.
- The OAuth alternative remains available as later, additive work for interactive clients; it is not blocked by this decision since both would ultimately produce/consume the same repo-token concept.
- Per-repo rate limiting or anomaly detection on token use (e.g. a token suddenly calling from a new IP) is not designed here — deferred, same spirit as other deferred hardening in [open-questions.md](../open-questions.md).
