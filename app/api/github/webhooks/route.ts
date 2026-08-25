import { NextRequest, NextResponse } from "next/server";
import { Webhooks } from "@octokit/webhooks";
import { getInstallationOctokit } from "@/lib/github/app-auth";
import {
  markDeployed,
  recordCommit,
  removeRepo,
  setOpenIssueCount,
  upsertInstallation,
  upsertRepo,
} from "@/lib/pets/service";

function toGithubRepo(repo: { id: number; name: string; full_name: string; private: boolean }) {
  const [owner] = repo.full_name.split("/");
  return { id: repo.id, name: repo.name, owner, fullName: repo.full_name, isPrivate: repo.private };
}

// The `repositories`/`repositories_added` payloads on installation events
// are minimal (no open_issues_count), so newly-installed repos need an
// explicit API call to seed their pet with the real current count —
// otherwise a repo installed with pre-existing open issues would report
// healthy until its next issue webhook. See docs/open-questions.md.
async function fetchOpenIssueCount(installationId: number, owner: string, repo: string) {
  const { data } = await getInstallationOctokit(installationId).rest.repos.get({ owner, repo });
  return data.open_issues_count;
}

// Isolates one repo's processing so a failed lookup (rate limit, repo
// deleted mid-flight, etc.) doesn't throw out of the handler and abort the
// rest of a multi-repo install batch — GitHub's own retry would just hit
// the same failure again for that repo anyway.
async function addRepoWithIssueCount(
  installationId: number,
  repo: { id: number; name: string; full_name: string; private: boolean },
) {
  const githubRepo = toGithubRepo(repo);
  try {
    const openIssueCount = await fetchOpenIssueCount(installationId, githubRepo.owner, githubRepo.name);
    await upsertRepo(installationId, githubRepo, openIssueCount);
  } catch (err) {
    console.error(`Failed to add repo ${githubRepo.fullName} for installation ${installationId}`, err);
  }
}

let webhooksInstance: Webhooks | null = null;

// Built lazily so importing this route (e.g. Next.js collecting route data at
// build time) doesn't require GITHUB_WEBHOOK_SECRET to be set.
function getWebhooks(): Webhooks {
  if (webhooksInstance) return webhooksInstance;

  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("GITHUB_WEBHOOK_SECRET is not set");
  }

  const webhooks = new Webhooks({ secret });

  webhooks.on(["installation.created", "installation.unsuspend"], async ({ payload }) => {
    const account = payload.installation.account;
    if (!account) return;

    await upsertInstallation({
      id: payload.installation.id,
      accountLogin: "login" in account ? account.login : account.slug,
      accountType: "type" in account ? account.type : "Organization",
    });

    // One repo's lookup failing (rate limit, repo gone, etc.) shouldn't
    // abort the rest of a multi-repo install batch — isolate each repo so
    // the others still get their pet created.
    for (const repo of payload.repositories ?? []) {
      await addRepoWithIssueCount(payload.installation.id, repo);
    }
  });

  webhooks.on("installation_repositories.added", async ({ payload }) => {
    for (const repo of payload.repositories_added) {
      await addRepoWithIssueCount(payload.installation.id, repo);
    }
  });

  webhooks.on("installation_repositories.removed", async ({ payload }) => {
    for (const repo of payload.repositories_removed) {
      await removeRepo(repo.id);
    }
  });

  webhooks.on("push", async ({ payload }) => {
    await recordCommit(payload.repository.id);
  });

  webhooks.on("release.published", async ({ payload }) => {
    await markDeployed(payload.repository.id);
  });

  // GitHub's `open_issues_count` on the repository payload counts open PRs
  // too (PRs are issues under the API) — see docs/open-questions.md for the
  // caveat this leaves on ADR-005's "any open issue" rule.
  webhooks.on(
    ["issues.opened", "issues.closed", "issues.reopened", "issues.deleted"],
    async ({ payload }) => {
      await setOpenIssueCount(payload.repository.id, payload.repository.open_issues_count);
    },
  );

  webhooksInstance = webhooks;
  return webhooks;
}

export async function POST(req: NextRequest) {
  const id = req.headers.get("x-github-delivery");
  const name = req.headers.get("x-github-event");
  const signature = req.headers.get("x-hub-signature-256");
  const payload = await req.text();

  if (!id || !name || !signature) {
    return NextResponse.json({ error: "missing github webhook headers" }, { status: 400 });
  }

  try {
    await getWebhooks().verifyAndReceive({ id, name: name as never, signature, payload });
  } catch (err) {
    console.error("GitHub webhook rejected", err);
    return NextResponse.json({ error: "invalid signature or handler error" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
