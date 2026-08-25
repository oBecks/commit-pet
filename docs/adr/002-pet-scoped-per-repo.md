# ADR-002: One Pet per repository, not per user

## Status
Accepted

## Context
An Owner may have many repos in flight at once. We need to decide whether commit-pet models one aggregate Pet per user (fed by activity across all their repos) or one Pet per repo.

## Decision
Each Repo that has the GitHub App installed gets its own independent Pet.

## Alternatives considered
- **Per-user aggregate Pet** — simpler mental model (one pet to check on), but blends signal from unrelated projects and can't express per-repo lifecycle state like [Phase](../glossary.md) or [Sick](../glossary.md). Rejected: the lifecycle/deployment mechanic (ADR-003, ADR-004, ADR-005) is inherently a property of a single repo, not a user.

## Consequences
- An active Owner will accumulate many Pets — the Dashboard needs a list/overview view, not just a single-pet view.
- The data model keys Pet state by `(installation_id, repo_id)`, not by user alone.
- The Badge/Widget (ADR-006) embeds a specific repo's pet, which fits naturally with per-repo READMEs.
