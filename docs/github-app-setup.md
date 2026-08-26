# Setting up the GitHub App

commit-pet authenticates to GitHub as a GitHub App ([ADR-008](adr/008-github-app-auth.md)), not a personal access token. This has to be created once, by hand, on github.com — there's no API to register a brand-new App from scratch.

## 1. Create the App

Go to **Settings → Developer settings → GitHub Apps → New GitHub App** (for a personal account) or your org's equivalent page.

- **Webhook URL**: `https://<your-deployment>/api/github/webhooks` (use an ngrok/tunnel URL while developing locally)
- **Webhook secret**: generate a random value, save it as `GITHUB_WEBHOOK_SECRET`

## 2. Permissions (repository)

| Permission | Access | Why |
|---|---|---|
| Contents | Read-only | Needed to receive `push` events |
| Issues | Read-only | Needed for the Sick signal ([ADR-005](adr/005-sickness-signal.md)) |
| Metadata | Read-only | Mandatory baseline permission |

Only request these three for now — anything the Dashboard/Badge/MCP work later needs should be added deliberately, not preemptively.

## 3. Subscribe to events

- `push`
- `release`
- `issues`
- `installation`
- `installation_repositories`
- `repository` (specifically the `privatized`/`publicized` actions — keeps
  the badge endpoint's private-repo check from going stale if a repo's
  visibility changes after install; see
  [ADR-011](adr/011-private-repo-badges-blocked.md)). GitHub may prompt for
  an additional permission (e.g. Administration: read) when you add this
  event — grant whatever it asks for.

## 4. After creation

- Generate a **private key** (downloads a `.pem`) — this is `GITHUB_APP_PRIVATE_KEY`. When putting it in a single-line env var, keep it as one string with literal `\n` for newlines; `lib/github/app-auth.ts` un-escapes that automatically.
- Note the **App ID** — this is `GITHUB_APP_ID`.
- Install the App on a test repo (**Install App** in the sidebar) to start generating webhook traffic.

Fill in `.env.example` → `.env.local` with all three values plus `DATABASE_URL` once you have a Postgres instance (see [ADR-010](adr/010-postgres-drizzle-default.md)).
