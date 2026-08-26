import type { SamplePet } from "@/lib/pets/sample-data";

export function RepoInfoCard({ pet }: { pet: SamplePet }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dash-border bg-dash-card p-6">
      <h2 className="text-[15px] font-bold text-dash-heading">Repo</h2>
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-dash-muted">Installed</span>
        <span className="font-semibold text-dash-heading">{pet.installedOn}</span>
      </div>
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-dash-muted">Repository</span>
        <a
          href={`https://github.com/${pet.fullName}`}
          className="inline-flex items-center gap-1.5 font-semibold text-dash-accent hover:text-[#C2560B]"
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
      </div>
    </div>
  );
}
