# ADR-009: Build as a public multi-tenant product from the start

## Status

Accepted

## Context

commit-pet could be scoped as a personal tool for one GitHub account first, generalizing later, or designed for arbitrary GitHub users/orgs to install from day one.

## Decision

Design and build for public multi-tenancy from the start: any GitHub user or org can install the App and get pets for their repos.

## Alternatives considered

- **Personal tool first, generalize later** — less upfront design cost (can hardcode assumptions like "one owner"), but every other accepted decision this session (GitHub App over PAT, per-repo Pet scoping, public Badge) already assumes multi-tenant shape. Rejected as it would mean redoing auth and data-model work rather than saving it.

## Consequences

- Data model must key everything by `installation_id` / `account_id`, never assume a single hardcoded owner.
- Needs real signup/install onboarding flow (GitHub App install → callback → dashboard), not just "run locally with my token."
- Abuse/rate-limit/quota considerations become relevant much sooner (e.g. webhook volume from many installations, GitHub API rate limits shared per-installation vs per-app).
- Data store choice (deferred, see [open-questions.md](../open-questions.md)) should be picked with multi-tenant scale in mind, not a single-user sqlite file assumption.
