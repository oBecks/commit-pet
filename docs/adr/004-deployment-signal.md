# ADR-004: Deployment is signaled by a GitHub Release/tag, or explicitly via MCP

## Status
Accepted

## Context
Entering the Deployed phase (ADR-003) needs a trigger. Deployment isn't something GitHub natively models as an event for arbitrary repos (unlike, say, GitHub Deployments API, which requires the user's CI to already call it). We wanted a zero-config default plus a way for an agent-driven workflow to declare it explicitly.

## Decision
A Pet transitions from `development` to `deployed` when either:
1. A GitHub Release is published on the Repo (tag-based), **or**
2. The MCP server's deployment tool is called explicitly for that repo (see [ADR-007](007-mcp-scope.md)).

Either path sets the same `phase = deployed` state; commit-pet does not distinguish which trigger caused it.

## Alternatives considered
- **CI/CD deploy event (watch GitHub Actions workflow runs for a "deploy" job)** — more precise, but requires guessing which job/workflow name means "deploy" across arbitrary user pipelines, which is fragile and high implementation cost. Deferred, not ruled out — could be added later as a third trigger.
- **Manual dashboard toggle only** — simplest, fully accurate to intent, but the user explicitly wanted the tag-based default plus an MCP path, so this was folded in as a *result* of the MCP tool rather than a separate UI-only mechanism.

## Consequences
- Repos that never cut a GitHub Release and never call the MCP tool will stay in `development` forever, even if actually live in production. That's an accepted limitation, not a bug.
- The MCP tool needs to resolve "which repo" unambiguously from the calling context — see the MCP-auth open question in [open-questions.md](../open-questions.md).
