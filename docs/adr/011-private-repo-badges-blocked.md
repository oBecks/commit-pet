# ADR-011: Private repos get a 404 from the badge endpoint

## Status
Accepted

## Context
[ADR-006](006-presentation-surfaces.md) flagged that the badge endpoint is public and unauthenticated by design, and that this must not leak anything an Owner wouldn't want public. [open-questions.md](../open-questions.md) left "disable for private repos, or require a signed/opaque URL" undecided. Building `GET /api/badge/[repoId]` (`app/api/badge/[repoId]/route.ts`) required picking one now.

## Decision
If the repo behind a `repoId` is private, the badge endpoint returns the same `404` it returns for an unknown/nonexistent `repoId` — no distinct "this repo is private" response. This avoids confirming a private repo's existence, name, or pet state to an unauthenticated caller purely from guessing/enumerating ids.

## Alternatives considered
- **Signed/opaque badge URLs** — would let private-repo owners still embed a badge (e.g. in an internal wiki) without making it guessable. Deferred: no signing/token infra exists yet, and no one has asked for a private-repo badge; adding it now would be speculative.
- **Distinct "private" placeholder image** — friendlier for an owner who mistakenly embeds their own private repo's badge, but confirms the repo's existence/privacy to anyone else probing the id. Rejected for the same leak reason as returning a different status code.

## Consequences
- A private repo simply has no working badge today. If signed/opaque badge URLs are wanted later, this ADR's blanket-404 behavior is what changes — the route already isolates the private-repo check in one place (`app/api/badge/[repoId]/route.ts`).
