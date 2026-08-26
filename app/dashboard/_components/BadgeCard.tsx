import { renderPetSvg } from "@/lib/pets/render";
import type { SamplePet } from "@/lib/pets/sample-data";
import { CopyButton } from "./CopyButton";

export function BadgeCard({ pet }: { pet: SamplePet }) {
  const svg = renderPetSvg(pet.xp, pet.health, pet.sick);
  const snippet = `<img src="https://commit-pet.vercel.app/api/badge/${pet.repoId}" alt="commit-pet badge" width="150" height="220" />`;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dash-border bg-dash-card p-6">
      <h2 className="text-[15px] font-bold text-dash-heading">Your badge</h2>
      <div
        className="flex justify-center rounded-xl bg-dash-bg p-4 [&>svg]:h-[132px] [&>svg]:w-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="overflow-x-auto rounded-lg bg-[#2B2115] p-3">
        <code className="font-mono text-[11.5px] whitespace-pre text-[#F5EFE4]">{snippet}</code>
      </div>
      <CopyButton text={snippet} />
    </div>
  );
}
