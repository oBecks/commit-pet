# ADR-010: Postgres + Drizzle as the default data store, pending confirmation

## Status

Proposed (pragmatic default to unblock scaffolding — revisit if it doesn't fit)

## Context

[Open question](../open-questions.md) at the end of the grilling session: data store was explicitly left as "decide later." Scaffolding the data model and webhook receiver requires picking something now.

## Decision

Use Postgres (any standard host — Neon/Vercel Postgres/Supabase/local, just a `DATABASE_URL`) via Drizzle ORM, with `drizzle-kit` for migrations. Chosen over Prisma for a lighter runtime footprint and more direct SQL-shaped types, and over SQLite because [ADR-009](009-public-multi-tenant.md) already commits to multi-tenant scale where serverless Postgres is the more common fit for a Next.js-on-Vercel-shaped app.

## Alternatives considered

- **Prisma** — more batteries-included (studio, migration UX), but heavier runtime and generated-client step. Not rejected outright, just not the default; swapping ORMs later is a contained, mechanical change since it only touches `lib/db/`.
- **SQLite/Turso** — simpler locally, but fights the multi-tenant/serverless direction already committed to.

## Consequences

- All persistence code lives under `lib/db/`, so revisiting this ADR means rewriting that folder, not the domain logic in `lib/pets/`.
- Requires a real `DATABASE_URL` to run anything beyond `pnpm build` — see `.env.example`.
