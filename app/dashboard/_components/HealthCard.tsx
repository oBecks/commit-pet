import { moodFor, type Mood } from "@/lib/pets/mood";
import type { SamplePet } from "@/lib/pets/sample-data";
import { Bar } from "./Bar";
import { MoodPill } from "./Pills";

const MOOD_TEXT: Record<Mood, string> = {
  healthy: "text-healthy-text",
  tired: "text-tired-text",
  sick: "text-sick-text",
};

const MOOD_BAR_FILL: Record<Mood, string> = {
  healthy: "bg-healthy-dot",
  tired: "bg-tired-dot",
  sick: "bg-sick-dot",
};

const MOOD_BLURB: Record<Mood, string> = {
  healthy: "Steady commits (or a clean deploy) are keeping health topped up.",
  tired: "Health drops when the repo goes quiet — a fresh commit brings it back up.",
  sick: "Health decays while issues stay open, and recovers as they're resolved.",
};

export function HealthCard({ pet }: { pet: SamplePet }) {
  const mood = moodFor(pet.health, pet.sick);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dash-border bg-dash-card p-6">
      <h2 className="text-[15px] font-bold text-dash-heading">Health</h2>
      <div className="flex items-baseline gap-2.5">
        <span className={`text-[32px] font-bold ${MOOD_TEXT[mood]}`}>{pet.health}%</span>
        <MoodPill mood={mood} />
      </div>
      <Bar progress={pet.health / 100} fillClassName={MOOD_BAR_FILL[mood]} />
      <p className="text-xs text-dash-muted">{MOOD_BLURB[mood]}</p>
    </div>
  );
}
