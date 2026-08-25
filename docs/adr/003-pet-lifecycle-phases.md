# ADR-003: Two lifecycle phases — Development and Deployed — with no permanent death

## Status
Accepted

## Context
The classic Tamagotchi model (decay → death without care) is high-pressure and, for a coding pet, would punish normal breaks in a project's active-development period. But a repo isn't in the same "needs constant feeding" state forever — once it's shipped, ongoing commit cadence stops being the right health signal; production stability (bugs) is.

## Decision
A Pet has exactly one of two phases:
- **Development** (default/starting phase): Health decays with inactivity and recovers with commits. Health can always recover — there is no death or unrecoverable state.
- **Deployed** (entered via a Deploy Event, see [ADR-004](004-deployment-signal.md)): the Pet no longer depends on commit cadence to sustain Health. Instead it becomes **Sick** whenever the repo has open GitHub Issues (see [ADR-005](005-sickness-signal.md)), and recovers when they're all closed.

Transition is one-directional in the common case (development → deployed) but nothing prevents re-entering development conceptually if that turns out to be needed (e.g. a major rewrite) — that reverse transition is not yet designed; see [open-questions.md](../open-questions.md).

## Alternatives considered
- **Decay-to-death** — rejected as too punishing for normal development pauses.
- **Growth-only, no penalty at all** — rejected as too low-stakes; loses the "care about your pet" hook entirely, and doesn't distinguish a stalled project from an active one.
- **Single phase forever (always decay-on-inactivity)** — rejected because it misrepresents a finished/shipped project as neglected just because commit velocity naturally drops after launch.

## Consequences
- The data model needs a `phase` field per Pet and separate logic paths for Health computation depending on phase.
- Two independent "bad state" concepts exist: low Health (development phase) and Sick (deployed phase) — they should probably be visually distinct in the Dashboard/Badge, not conflated into one "health bar".
- Exact Health decay/recovery curve is still open — see [open-questions.md](../open-questions.md).
