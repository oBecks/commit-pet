import { auth, clerkClient } from "@clerk/nextjs/server";
import { Octokit } from "octokit";

// null means "not signed in" or "no GitHub account connected" — callers use
// that to distinguish "show a connect-GitHub prompt" from "show zero repos".
export async function getUserGithubToken(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const client = await clerkClient();
  const { data } = await client.users.getUserOauthAccessToken(userId, "github");
  return data[0]?.token ?? null;
}

// Installations of the commit-pet GitHub App (lib/github/app-auth.ts) that
// this signed-in user can access, via GitHub's `GET /user/installations`.
// That endpoint only accepts a GitHub App user-to-server token, so Clerk's
// GitHub connection must be configured with the commit-pet App's own OAuth
// client id/secret — a generic GitHub OAuth App's token won't resolve any
// installations here. See docs/adr/008-github-app-auth.md.
export async function getAccessibleInstallationIds(): Promise<number[] | null> {
  const token = await getUserGithubToken();
  if (!token) return null;

  const octokit = new Octokit({ auth: token });
  const { data } =
    await octokit.rest.apps.listInstallationsForAuthenticatedUser();
  return data.installations.map((installation) => installation.id);
}
