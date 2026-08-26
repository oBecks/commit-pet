import type { SamplePet } from "@/lib/pets/sample-data";

export function OpenIssuesCard({ pet }: { pet: SamplePet }) {
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
          <a
            href={`https://github.com/${pet.fullName}/issues`}
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-dash-accent hover:text-[#C2560B]"
          >
            View on GitHub
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M7 17L17 7" />
              <path d="M9 7h8v8" />
            </svg>
          </a>
          <p className="text-xs text-dash-muted">
            Health recovers as these close — no action needed here.
          </p>
        </>
      )}
    </div>
  );
}
