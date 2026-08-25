# ADR-005: Sickness is driven by any open GitHub Issue

## Status
Accepted

## Context
Once a Pet is Deployed (ADR-003), it needs a signal for "something is wrong" distinct from commit cadence. Candidates were GitHub Issues, failing CI runs, or both.

## Decision
A Deployed Pet is **Sick** whenever its Repo has one or more open GitHub Issues, regardless of label. It heals (Sick = false) once zero issues are open. No distinction is made between an issue labeled `bug` and any other open issue.

## Alternatives considered
- **Only issues labeled `bug`** — more precise signal (a feature request wouldn't make the pet sick), but requires the user to label consistently, which many repos don't do. Rejected in favor of the zero-config default.
- **Failing CI as the (or an additional) signal** — reflects code health more directly, but requires reading workflow run conclusions and deciding which workflow/job counts. Deferred, not ruled out.

## Consequences
- Repos that use Issues as a general backlog/triage tool (not just bugs) will show a permanently or frequently Sick pet. This is a known, accepted tradeoff of the zero-config choice — worth watching for user feedback once real usage happens.
- No severity gradation: 1 open issue and 50 open issues both just mean "Sick." If that turns out to feel wrong, revisit as a new ADR rather than silently changing behavior.
