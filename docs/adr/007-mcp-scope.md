# ADR-007: MCP server exposes full pet-state control, not just deployment marking

## Status

Accepted

## Context

The deployment signal (ADR-004) already needed an MCP tool as an alternative to tag-based detection. The question was whether to scope the MCP server narrowly to just that, or let it expose the Pet's full state surface.

## Decision

The MCP server exposes full pet-state control: querying a Pet's current phase/health/sick status, and mutating it — marking deployed, and marking issues fixed/resolved from the agent's perspective. Not just a single "mark deployed" tool.

## Alternatives considered

- **Deployment status only** — matches the narrowest interpretation of the original need, but would mean building a second, separate mechanism later when agent workflows inevitably want to also query/report on health or sickness. Rejected as short-sighted given the stated goal of letting a coding agent participate in the pet's care loop.

## Consequences

- The MCP server needs the same authorization/repo-resolution mechanism as the webhook path — it's a second privileged write path into Pet state, not a read-only convenience. Security review of its auth model matters as much as the webhook handler's.
- API surface (REST/internal) should be designed so the MCP tool implementations and the Dashboard/webhook handlers all call the same core service functions, rather than the MCP server reimplementing state-mutation logic independently.
- Exactly how an MCP tool call is authenticated and scoped to one repo is not yet resolved — see [open-questions.md](../open-questions.md).
