import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "octokit";

function getAppCredentials() {
  const appId = process.env.GITHUB_APP_ID;
  // Private keys stored in env vars typically need literal "\n" un-escaped.
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!appId || !privateKey) {
    throw new Error("Missing GITHUB_APP_ID or GITHUB_APP_PRIVATE_KEY");
  }
  return { appId, privateKey };
}

// Authenticated as a specific installation — scoped to the repos that
// installation was granted. See docs/adr/008-github-app-auth.md.
export function getInstallationOctokit(installationId: number) {
  const { appId, privateKey } = getAppCredentials();
  return new Octokit({
    authStrategy: createAppAuth,
    auth: { appId, privateKey, installationId },
  });
}
