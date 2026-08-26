import type { DashboardPet } from "@/lib/pets/dashboard-data";
import { ExternalLink } from "./ExternalLink";

export function OpenIssuesCard({ pet }: { pet: DashboardPet }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dash-border bg-dash-card p-6">
      <h2 className="text-[15px] font-bold text-dash-heading">Open issues</h2>

      {pet.openIssueCount === 0 ? (
        <p className="text-sm text-dash-muted">
          No open issues — this pet is happy.
        </p>
      ) : (
        <>
          <p className="text-sm text-dash-heading">
            <span className="font-semibold text-sick-text">
              {pet.openIssueCount}
            </span>{" "}
            open issue
            {pet.openIssueCount === 1 ? "" : "s"} on this repo.
          </p>
          <ExternalLink
            href={`https://github.com/${pet.fullName}/issues`}
            className="w-fit text-dash-accent hover:text-[#C2560B]"
          >
            View on GitHub
          </ExternalLink>
          <p className="text-xs text-dash-muted">
            Sick clears once these close — no action needed here.
          </p>
        </>
      )}
    </div>
  );
}
