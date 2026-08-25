import { NextRequest, NextResponse } from "next/server";
import { Webhooks } from "@octokit/webhooks";
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

    for (const repo of payload.repositories ?? []) {
      await upsertRepo(payload.installation.id, toGithubRepo(repo as never));
    }
  });

  webhooks.on("installation_repositories.added", async ({ payload }) => {
    for (const repo of payload.repositories_added) {
      await upsertRepo(payload.installation.id, toGithubRepo(repo as never));
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
