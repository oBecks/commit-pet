# Glossary

Core vocabulary for commit-pet. Keep this in sync as decisions evolve — link ADRs to the terms they define.

| Term | Definition |
|---|---|
| **Pet** | The virtual creature tied 1:1 to a **Repo**. Has a **Phase**, a **Health** level, and a **Sick** status. See [ADR-002](adr/002-pet-scoped-per-repo.md). |
| **Repo** | A GitHub repository that has commit-pet's GitHub App installed on it. The unit a Pet belongs to. |
| **Owner** | The GitHub user (or org) that installed the GitHub App on a Repo. |
| **Installation** | A GitHub App installation record linking an Owner to one or more Repos, and the credential commit-pet uses to receive webhooks and call the GitHub API for those repos. See [ADR-008](adr/008-github-app-auth.md). |
| **Phase** | The lifecycle stage of a Pet: `development` or `deployed`. Determines which mechanics apply. See [ADR-003](adr/003-pet-lifecycle-phases.md). |
| **Development phase** | Default phase for a new Pet. Health responds to commit activity on the Repo; no commits for a while lets Health decay. There is no death — Health can always recover. |
| **Deployed phase** | Entered when a Deploy Event fires. The Pet no longer needs commits to sustain Health — it's self-sufficient — but becomes **Sick** if the Repo has open Issues. See [ADR-003](adr/003-pet-lifecycle-phases.md), [ADR-004](adr/004-deployment-signal.md). |
| **Health** | A Pet's wellbeing metric during the Development phase. Decays with inactivity, recovers with commits. Exact decay/recovery curve is an open question — see [open-questions.md](open-questions.md). |
| **XP / Stage** | A Pet's cumulative growth points (XP) and the visual growth Stage (`egg` → `hatchling` → `juvenile` → `adult`) derived from it. Independent of Health/Sick — Stage is about how the Pet looks and grows over time, not its current wellbeing. Exact XP curve and thresholds are an open question — see [open-questions.md](open-questions.md) and `lib/pets/growth.ts`. |
| **Sick** | A boolean status a Deployed Pet can have. True whenever the Repo has one or more open GitHub Issues; false when zero are open. See [ADR-005](adr/005-sickness-signal.md). |
| **Commit Event** | A push/commit webhook from GitHub for a Repo. Feeds Health during the Development phase. |
| **Deploy Event** | A signal that transitions a Pet from `development` to `deployed`. Fires from either a published GitHub Release/tag, or an explicit call to the MCP server. See [ADR-004](adr/004-deployment-signal.md). |
| **Issue Event** | A GitHub Issues webhook (opened/closed) for a Repo. Used only while a Pet is in the Deployed phase, to set Sick. |
| **Dashboard** | The hosted web UI (this Next.js app) where an Owner views and manages their Pets. See [ADR-006](adr/006-presentation-surfaces.md). |
| **Badge / Widget** | A public, embeddable image (SVG) rendering a single Pet's current state, meant for READMEs and GitHub profiles. Same backend/state as the Dashboard. See [ADR-006](adr/006-presentation-surfaces.md). |
| **MCP Server** | commit-pet's Model Context Protocol server, letting AI coding agents query and mutate Pet state (health, sick status, deploy status) as part of their own workflow. See [ADR-007](adr/007-mcp-scope.md). |
