# ADR-013: XP curve — commits-only, per-day geometric diminishing returns

## Status

Accepted

## Context

`lib/pets/growth.ts` originally hardcoded a flat `XP_PER_COMMIT = 10` — every commit worth the same, with no time dimension. That meant a repo could reach `adult` (the top Growth Stage, see [ADR-003](003-pet-lifecycle-phases.md)) in a single sitting of scripted commits, which undercuts Stage as a "grew over time" signal. It was always a known placeholder (see [open-questions.md](../open-questions.md)).

Growth Stage is purely cosmetic — it doesn't gate any feature, badge tier, or MCP capability — so the bar for this decision is "feels like earned growth," not correctness against some external metric.

## Decision

XP still comes from commits only, and still only during the Development phase — it **freezes at Deploy**, unchanged from the existing `recordCommit` phase gate. Deploy-triggered growth or branching evolutions remain future work.

Within a push, each commit is worth less than the one before it **on the same UTC calendar day**:

```text
BASE_XP_PER_COMMIT = 30   // 1st commit of the UTC day
XP_DECAY_RATE = 0.85      // each subsequent commit that day is worth 85% of the previous one
```

The XP for a push of `k` commits, when `n` commits already landed earlier that day, is the closed-form sum of that geometric sequence:

```text
xp = BASE_XP_PER_COMMIT * XP_DECAY_RATE^n * (1 - XP_DECAY_RATE^k) / (1 - XP_DECAY_RATE)
```

Each commit within a push counts as its own step in the sequence — a 5-commit push is not the same flat award as a 1-commit push. This also resolves the pre-existing ambiguity noted in [open-questions.md](../open-questions.md) where a multi-commit push and a single-commit push granted identical XP.

This single mechanism is deliberately the _only_ cap — there's no separate hard daily cutoff. A geometric series converges on its own: the asymptotic ceiling is `BASE_XP_PER_COMMIT / (1 - XP_DECAY_RATE) = 200 XP/day`, approached within the first ~10-15 commits of a day and effectively unbeatable no matter how many more commits land. Stage thresholds are unchanged in relative terms (`hatchling` 300 / `juvenile` 1200 / `adult` 3000 — a 10x scale-up from the original 30/120/300, purely so rounding a push's XP to the nearest integer doesn't lose much precision between consecutive commits in a day).

Resulting pace, days to reach a stage at a steady cadence:

| Cadence                             | `hatchling` (300) | `juvenile` (1200) | `adult` (3000)                                       |
| ----------------------------------- | ----------------- | ----------------- | ---------------------------------------------------- |
| 1 commit/day                        | 10 days           | 40 days           | 100 days (~3.3 months)                               |
| 3 commits/day                       | ~4 days           | ~16 days          | **~39 days (~5.5 weeks)**                            |
| Maxing out (50+ commits in one day) | ~1.5 days         | ~6 days           | ~15 days minimum — can't be rushed into a single day |

A repo with normal, steady commit activity reaches `adult` in about a month and a half; a repo trying to game it by dumping dozens of commits in one sitting still can't beat roughly two weeks.

Computed as a single DB-side SQL expression in `recordCommit` (`lib/pets/service.ts`), not a read-then-write, for the same reason the flat increment was before: concurrent webhook deliveries for the same repo can't race on a stale read. This needs a new `commitsToday` column on `pets` (reset whenever `lastCommitAt` falls on a different UTC day than `now()`) so the SQL expression knows how many commits already landed today without re-reading it non-atomically.

## Alternatives considered

- **Diminishing returns + a separate hard daily XP/commit-count cutoff** — rejected as two mechanisms doing the job of one; the geometric series already converges to a soft ceiling on its own.
- **Rolling 24h window per pet instead of a UTC calendar-day reset** — more "fair" in the sense that every pet's window starts from its own first commit, but harder to reason about globally and requires storing a rolling window's worth of commit timestamps instead of one counter. Rejected for simplicity; a shared UTC-day boundary is easy to explain and cheap to store.
- **XP keeps accruing after Deploy** — considered, since a Deployed repo can still receive commits (bug fixes). Rejected to keep Stage's story simple: growth is a Development-phase story about building the thing, matching Health's existing phase split ([ADR-003](003-pet-lifecycle-phases.md)).
- **Leveling gates a feature** (badge tier, MCP capability, dashboard surface) — considered, then set aside; Stage stays purely cosmetic, matching its current scope and keeping this change additive rather than opening new product surface.

## Consequences

- `pets` gains a `commits_today` column and a migration.
- `recordCommit` (`lib/pets/service.ts`) now takes a `commitCount` parameter; its one caller (the `push` webhook handler) passes `payload.commits.length`.
- Health's own per-push award is unaffected and stays a flat `COMMIT_BOOST` regardless of push size — that half of the pre-existing multi-commit-push ambiguity in [open-questions.md](../open-questions.md) remains open, only XP's half is resolved here.
- A day is defined as a UTC calendar boundary, not the repo owner's local time — a commit at 23:59 UTC and one two minutes later at 00:01 UTC are "different days" even though they're minutes apart. Not expected to matter in practice given the multi-week timescale involved, but worth knowing if the numbers ever look off by one commit's worth of XP near midnight UTC.
