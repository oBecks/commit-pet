# ADR-012: Clerk for accounts, GitHub OAuth (via the commit-pet App) for repo scoping

## Status

Accepted

## Context

The Dashboard ([ADR-006](006-presentation-surfaces.md)) needed real user accounts instead of unauthenticated sample data, and a way to answer "which repos/pets can this signed-in person see" — an open question ever since [ADR-009](009-public-multi-tenant.md) committed to public multi-tenancy. `installations`/`repos` are keyed by GitHub App installation ([ADR-008](008-github-app-auth.md)), not by any notion of a human account, so nothing in the data model linked a person to a repo before this.

## Decision

- Use [Clerk](https://clerk.com) for authentication/session management, gating `/dashboard` in [app/dashboard/layout.tsx](../../app/dashboard/layout.tsx).
- Configure GitHub as a Clerk social connection using **commit-pet's own GitHub App's** OAuth client id/secret (not a separate generic OAuth App). Clerk then holds a GitHub App user-to-server access token per signed-in user.
- On each Dashboard request, exchange that token for the list of installations the user can access via `GET /user/installations` ([lib/github/user-auth.ts](../../lib/github/user-auth.ts)), and scope all Pet/Repo queries to those installation ids ([lib/pets/dashboard-data.ts](../../lib/pets/dashboard-data.ts)). No new `users` table — "who owns what" is resolved live from GitHub on every request rather than stored and kept in sync.
- Route protection lives in the page/layout, not in `proxy.ts` — Clerk's own current guidance favors resource-based auth checks, and there's an open `auth.protect()`-in-proxy redirect bug on Next.js 16 ([clerk/javascript#8302](https://github.com/clerk/javascript/issues/8302)) this sidesteps entirely.

## Alternatives considered

- **Generic Clerk GitHub OAuth (default "new OAuth App" setup)** — much simpler to configure, but `GET /user/installations` only recognizes tokens issued for the specific GitHub App being queried; a token from an unrelated OAuth App can't resolve commit-pet's installations at all. Rejected as a non-starter for this use case.
- **Store a `users` / `installation_members` table, synced via webhooks or periodic reconciliation** — would avoid a live GitHub API call per Dashboard load, but requires new webhook handling (org membership changes, installs/uninstalls) and a background sync story that doesn't exist yet. Deferred; live resolution is simpler for now and the Dashboard's request volume doesn't need the optimization yet.
- **Gate the Dashboard behind login without per-user repo scoping** — least work, but doesn't deliver "see _his_ repos" at all, and leaves [ADR-008](008-github-app-auth.md)'s open "org access control" question unresolved rather than answered.

## Consequences

- A user must have a connected GitHub account for the Dashboard to show anything; email-only Clerk accounts see a "connect GitHub" prompt instead of pets. See [docs/clerk-setup.md](../clerk-setup.md) for disabling other sign-in strategies if GitHub-only is wanted.
- Every Dashboard/pet-detail request makes a live call to GitHub's API to list installations — fine at current scale, but a future rate-limit or latency concern the "store a users table" alternative above would resolve if it becomes one.
- Org-level installations: any org member who authorizes commit-pet's GitHub App can see that installation's pets, since `GET /user/installations` returns org installations the user has access to. Finer-grained "which org members can manage vs. just view" is still unresolved (see [docs/open-questions.md](../open-questions.md)).
