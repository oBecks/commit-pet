# ADR-008: Authenticate to GitHub via a GitHub App, not PATs

## Status

Accepted

## Context

commit-pet needs to receive commit/issue/release events and call the GitHub API on the user's behalf. The two common approaches are a GitHub App (installable, fine-grained permissions, built-in webhook subscriptions) or asking users to paste a Personal Access Token and configure a webhook manually.

## Decision

commit-pet ships as a GitHub App. Owners install it (org- or account-level) and select which repos it can access; installation handles both API auth and webhook subscription.

## Alternatives considered

- **PAT + manual webhook setup** — much less upfront build work (no app manifest, no installation callback flow), but pushes real configuration burden onto every user and doesn't scope cleanly to orgs. Rejected given the decision to be a public multi-user product (see [ADR-009](009-public-multi-tenant.md)) — that audience expects an installable app, not manual token wrangling.

## Consequences

- Requires building the GitHub App registration (manifest, permissions: contents:read, issues:read, metadata:read minimum), install/uninstall webhook handling, and installation-token refresh logic.
- Installation tokens are short-lived and per-installation — the backend needs to manage token caching/refresh, not just store a static credential.
- Org installs mean one Installation can cover many repos and possibly many human Owners (org members) — access-control on the Dashboard side needs to account for "who in this org can see/manage this installation's pets," not just a single owning user.
