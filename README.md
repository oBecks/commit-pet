# Commit Pet

A little pet that grows as you commit — and gets to retire once your project ships.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[commit-pet.vercel.app](https://commit-pet.vercel.app)**

<img src="https://commit-pet.vercel.app/api/badge/1346542776" alt="commit-pet badge" width="195" height="286" />

## Install it on your repo

1. **[Install the GitHub App](https://github.com/apps/commit-pet)** and pick the repo(s) you want a pet for.
2. **Grab your repo's numeric ID** — sign in with GitHub on [the dashboard](https://commit-pet.vercel.app/dashboard) and open your repo's pet, or fetch it directly:
   ```bash
   curl -s https://api.github.com/repos/<owner>/<repo> | grep -m1 '"id"'
   ```
3. **Drop the badge in your own README**, swapping in that ID:
   ```md
   <img src="https://commit-pet.vercel.app/api/badge/<repoId>" alt="commit-pet badge" width="195" height="286" />
   ```

That's it — every commit from now on feeds your pet.

> **Note:** only public repos are supported right now — private repos 404 on the badge endpoint ([ADR-011](docs/adr/011-private-repo-badges-blocked.md)).

## Pet gallery

Your pet grows through four stages as XP accumulates, and its mood tints its colors based on repo health:

|               | Healthy                                                                                  | Tired                                                                                | Sick                                                                               |
| ------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| **Egg**       | <img src="docs/pet-gallery/egg-healthy.svg" width="90" alt="egg, healthy" />             | <img src="docs/pet-gallery/egg-tired.svg" width="90" alt="egg, tired" />             | <img src="docs/pet-gallery/egg-sick.svg" width="90" alt="egg, sick" />             |
| **Hatchling** | <img src="docs/pet-gallery/hatchling-healthy.svg" width="90" alt="hatchling, healthy" /> | <img src="docs/pet-gallery/hatchling-tired.svg" width="90" alt="hatchling, tired" /> | <img src="docs/pet-gallery/hatchling-sick.svg" width="90" alt="hatchling, sick" /> |
| **Juvenile**  | <img src="docs/pet-gallery/juvenile-healthy.svg" width="90" alt="juvenile, healthy" />   | <img src="docs/pet-gallery/juvenile-tired.svg" width="90" alt="juvenile, tired" />   | <img src="docs/pet-gallery/juvenile-sick.svg" width="90" alt="juvenile, sick" />   |
| **Adult**     | <img src="docs/pet-gallery/adult-healthy.svg" width="90" alt="adult, healthy" />         | <img src="docs/pet-gallery/adult-tired.svg" width="90" alt="adult, tired" />         | <img src="docs/pet-gallery/adult-sick.svg" width="90" alt="adult, sick" />         |

Tired means health has dropped low; sick means the repo has open issues once it's deployed (see "How it works" below). These images are generated straight from the same art in [lib/pets/render.ts](lib/pets/render.ts) via `pnpm dlx tsx scripts/generate-pet-gallery.ts` — rerun that after any art change to keep this table in sync.

## How it works

Every repo with commit-pet installed gets its own pet, tied to that repo's activity:

- **Development phase** — the default. Every commit feeds the pet: health goes up, and it grows through four stages as XP accumulates — `egg` → `hatchling` → `juvenile` → `adult`.
- **Deployed phase** — entered once a release is published (or an agent explicitly marks it deployed via MCP). The pet stops needing commits and instead gets **sick** if the repo has open issues.

The badge above is a live, embeddable SVG (`/api/badge/[repoId]`) — same backend, same pet state, just a different view than the dashboard.

## Dashboard

Sign in with GitHub on [the dashboard](https://commit-pet.vercel.app/dashboard) to see every repo you have commit-pet installed on, in one place — the same live pet state as the badge, plus each repo's numeric ID for badge setup and its **MCP access** card for generating a token (see below).

Sign-in only resolves which of your repos you can see (via a live GitHub API call); no separate account or membership list is stored.

## MCP access

Let a coding agent (Claude Code, Cursor, etc.) see and update your pet directly from your repo's checkout — check status, mark deployed, or mark an issue fixed — instead of only reacting to webhooks.

1. Open your repo's dashboard page (`commit-pet.vercel.app/dashboard/<repoId>`) and generate an MCP token from the **MCP access** card. It's shown once, so copy it right away — regenerating revokes the old one.
2. Configure your MCP client with that token as a bearer token, pointed at:
   ```text
   https://commit-pet.vercel.app/api/mcp
   ```

Each token is scoped to exactly one repo, so an agent can only ever see and control the pet for the repo it was configured for. Available tools:

| Tool               | Description                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `get_pet_status`   | Get the pet's phase (development/deployed), health, mood, growth stage, XP, and open issue count.                      |
| `mark_deployed`    | Mark the pet as deployed, entering the deployed phase. Idempotent.                                                     |
| `mark_issue_fixed` | Tell the pet an issue was fixed, decrementing its open issue count by one — independent of GitHub's own issue tracker. |

See [ADR-007](docs/adr/007-mcp-scope.md) for why the MCP server exposes full pet-state control rather than just deployment marking, and [ADR-014](docs/adr/014-mcp-repo-token-auth.md) for the token auth model.

## Workflow

```text
push → webhook → recordCommit() → Postgres (xp, health)
                                        │
        GET /api/badge/[repoId] ───────┘
                │
        currentHealth() → renderPetSvg() → SVG
```

1. **Push** — you push a commit to a repo with the GitHub App installed.
2. **Webhook** — GitHub POSTs a signed `push` event to `/api/github/webhooks`.
3. **Write** — the handler verifies the signature and calls `recordCommit()`, which bumps `xp` and `health` in Postgres.
4. **Render** — on the next request to `/api/badge/[repoId]`, the route reads the current row, applies lazy health decay via `currentHealth()`, and passes the result to `renderPetSvg()` to generate the SVG.

No cron job, no cached image — pet state is only ever written by a webhook or an MCP call (see "How it works" above), and every badge request renders straight from whatever's in the database at that moment.

See [docs/glossary.md](docs/glossary.md) for the full vocabulary, and [docs/adr/](docs/adr/) for the reasoning behind each mechanic.
