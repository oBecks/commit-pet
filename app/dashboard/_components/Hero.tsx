import { stageForXp } from "@/lib/pets/growth";
import { moodFor } from "@/lib/pets/mood";
import type { SamplePet } from "@/lib/pets/sample-data";
import { PetArt } from "./PetArt";
import { MoodPill, PhasePill, StagePill } from "./Pills";

const PHASE_BLURB: Record<SamplePet["phase"], (pet: SamplePet) => string> = {
  development: () => "In development — every commit feeds this pet.",
  deployed: (pet) =>
    `Deployed ${pet.deployedRelative} — stopped needing commits, now watches for open issues instead.`,
};

export function Hero({ pet }: { pet: SamplePet }) {
  const stage = stageForXp(pet.xp);
  const mood = moodFor(pet.health, pet.sick);

  return (
    <div className="flex items-center gap-7 rounded-2xl border border-dash-border bg-dash-card p-8">
      <PetArt stage={stage} mood={mood} className="h-[170px] w-auto shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-bold text-dash-heading">
            {pet.fullName}
          </h1>
          <PhasePill phase={pet.phase} />
        </div>
        <div className="flex items-center gap-2">
          <StagePill stage={stage} />
          <MoodPill mood={mood} />
        </div>
        <p className="text-sm text-dash-muted">{PHASE_BLURB[pet.phase](pet)}</p>
      </div>
    </div>
  );
}
