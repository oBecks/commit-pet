# ADR-006: Web dashboard + embeddable badge, backed by the same state

## Status

Accepted

## Context

Users need to see their pets. Options ranged from a full hosted dashboard to a passive embeddable image (in the style of GitHub stats cards / Shields.io badges).

## Decision

Ship both, sharing one backend and one source of truth for Pet state:

- **Dashboard**: authenticated web UI listing all of an Owner's Pets across repos, with detail views.
- **Badge/Widget**: an unauthenticated, publicly embeddable SVG image endpoint per repo, meant to be dropped into a README or GitHub profile.

## Alternatives considered

- **Dashboard only** — richer, but loses the "shareable, public, low-friction" appeal that makes a pet fun to show off. Rejected as incomplete.
- **Badge only** — minimal build effort, but no place to see history, manage installations, or do anything beyond glance at current state. Rejected as too limited for a real product.

## Consequences

- The badge endpoint is public by definition — it must not leak anything an Owner wouldn't want public (e.g. private repo names/existence should be considered before exposing a badge URL for a private repo).
- Two rendering surfaces (React UI + server-rendered SVG) both need to read the same Pet-state API — argues for a single internal "get pet state" function/endpoint that both consume, rather than duplicating logic.
