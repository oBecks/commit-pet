import type { DashboardPet } from "@/lib/pets/dashboard-data";
import { ExternalLink } from "./ExternalLink";

export function RepoInfoCard({ pet }: { pet: DashboardPet }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dash-border bg-dash-card p-6">
      <h2 className="text-[15px] font-bold text-dash-heading">Repo</h2>
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-dash-muted">Installed</span>
        <span className="font-semibold text-dash-heading">
          {pet.installedOn}
        </span>
      </div>
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-dash-muted">Repository</span>
        <ExternalLink
          href={`https://github.com/${pet.fullName}`}
          className="text-dash-accent hover:text-[#C2560B]"
        >
          View on GitHub
        </ExternalLink>
      </div>
    </div>
  );
}
