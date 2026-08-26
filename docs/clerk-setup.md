# Setting up Clerk

commit-pet uses [Clerk](https://clerk.com) for user accounts, with GitHub as the (recommended) sign-in method — see [ADR-012](adr/012-clerk-github-oauth-scoping.md). Two things have to be created by hand: a Clerk application, and a GitHub OAuth client for it to use.

## 1. Create the Clerk application

1. Sign up / log in at [dashboard.clerk.com](https://dashboard.clerk.com) and create a new application (e.g. "Commit Pet").
2. On the **API Keys** page, copy the **Publishable key** and **Secret key** into `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   ```
3. Restart `next dev` after adding these — they're read at startup.

At this point sign-in/sign-up already work with Clerk's default email option. GitHub sign-in (step 2 below) is what lets the Dashboard actually resolve "which repos does this person own."

## 2. Wire up GitHub as a social connection

This has to point at **commit-pet's own GitHub App** (the one from [docs/github-app-setup.md](github-app-setup.md)), not a fresh generic OAuth App — only a token issued for that specific App can call `GET /user/installations` and return commit-pet's installations (see [lib/github/user-auth.ts](../lib/github/user-auth.ts)).

1. In the Clerk Dashboard: **User & Authentication → SSO Connections → Add connection → For all users → GitHub**.
2. Toggle **Use custom credentials** — Clerk will show you an **Authorization callback URL**. Copy it.
3. On GitHub: go to the commit-pet GitHub App's settings page (**Settings → Developer settings → GitHub Apps → commit-pet**) → **General**.
   - Paste the Clerk callback URL into **Callback URL**.
   - Copy the **Client ID** shown there.
   - Click **Generate a new client secret** and copy it immediately (shown once).
4. Back in Clerk, paste that Client ID and Client secret into the GitHub connection's custom-credentials fields, then **Enable connection**.
5. If you want GitHub to be the _only_ sign-in method (recommended, since email-only accounts can't be matched to any repos), disable the Email/password and other social strategies on the **Authentication** page.

## 3. Verify

Sign in via GitHub locally, then check the Dashboard — it should call `GET /user/installations` with your Clerk-issued GitHub token and only show repos under installations you actually have access to. If it instead shows the "connect GitHub" prompt, double check step 2 used the GitHub _App's_ credentials, not a separate OAuth App's.
