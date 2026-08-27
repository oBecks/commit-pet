import { renderPetSvg } from "@/lib/pets/render";
import type { DashboardPet } from "@/lib/pets/dashboard-data";
import { CopyButton } from "./CopyButton";

export function BadgeCard({ pet }: { pet: DashboardPet }) {
  // The public badge endpoint 404s private repos by design (ADR-011) — no
  // point showing a snippet that won't render for anyone who pastes it.
  if (pet.isPrivate) {
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-dash-border bg-dash-card p-6">
        <h2 className="text-[15px] font-bold text-dash-heading">Your badge</h2>
        <p className="text-sm text-dash-muted">
          Badges aren&apos;t available for private repos yet — the badge
          endpoint is public and unauthenticated, so private repos get a 404 by
          design.
        </p>
      </div>
    );
  }

  const svg = renderPetSvg(pet.xp, pet.health, pet.sick);
  const snippet = `<img src="https://commit-pet.vercel.app/api/badge/${pet.repoId}" alt="commit-pet badge" width="195" height="286" />`;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dash-border bg-dash-card p-6">
      <h2 className="text-[15px] font-bold text-dash-heading">Your badge</h2>
      <div
        className="flex justify-center rounded-xl bg-dash-bg p-4 [&>svg]:h-[132px] [&>svg]:w-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="overflow-x-auto rounded-lg bg-[#2B2115] p-3">
        <code className="font-mono text-[11.5px] whitespace-pre text-[#F5EFE4]">
          {snippet}
        </code>
      </div>
      <CopyButton text={snippet} />
    </div>
  );
}
