# Commit Pet

A little pet that grows as you commit — and gets to retire once your project ships.

<img src="https://commit-pet.vercel.app/api/badge/1346542776" alt="commit-pet badge" width="150" height="220" />

## How it works

Every repo with commit-pet installed gets its own pet, tied to that repo's activity:

- **Development phase** — the default. Every commit feeds the pet: health goes up, and it grows through four stages as XP accumulates — `egg` → `hatchling` → `juvenile` → `adult`.
- **Deployed phase** — entered once a release is published (or an agent explicitly marks it deployed via MCP). The pet stops needing commits and instead gets **sick** if the repo has open issues.

The badge above is a live, embeddable SVG (`/api/badge/[repoId]`) — same backend, same pet state, just a different view than the eventual dashboard.

See [docs/glossary.md](docs/glossary.md) for the full vocabulary, and [docs/adr/](docs/adr/) for the reasoning behind each mechanic.

## Status

This is a personal project, still early. The GitHub App is currently **private** (only installable by its owner) — the badge endpoint itself works for any public repo it's installed on, but there's no public "install this on your repo" flow yet.

## Getting Started

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

Setting up your own instance (GitHub App, database, env vars) is documented in [docs/github-app-setup.md](docs/github-app-setup.md).

