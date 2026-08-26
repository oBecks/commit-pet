# ADR-001: GitHub API/webhooks as the sole activity signal

## Status

Accepted

## Context

A Pet needs to know when its owner is doing meaningful work on a Repo. We considered three sources: local git hooks on the developer's machine, a manual CLI check-in, or GitHub's API/webhooks.

## Decision

commit-pet is fed exclusively by GitHub (webhooks for real-time events, REST/GraphQL API for backfill/state checks). No local git hook and no manual CLI check-in.

## Alternatives considered

- **Local git hooks** — works offline and per-repo, but only sees commits made on the machine with the hook installed, and requires the user to install something locally per repo. Rejected: doesn't fit a hosted, multi-device, multi-user product.
- **Manual CLI check-in** — zero infrastructure, but depends on the user remembering to run it, which undermines the "your pet reacts to what you actually did" premise. Rejected.

## Consequences

- commit-pet needs a hosted backend reachable by GitHub webhooks (see [ADR-008](008-github-app-auth.md)).
- All signal is inherently GitHub-repo-scoped, which motivated pets being per-repo rather than per-user (see [ADR-002](002-pet-scoped-per-repo.md)).
- Commits/issues/releases made outside GitHub (e.g. pushed to a different remote) are invisible to the Pet.
