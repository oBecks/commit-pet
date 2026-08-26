import { moodFor, type Mood } from "@/lib/pets/mood";
import type { SamplePet } from "@/lib/pets/sample-data";
import { Bar } from "./Bar";
import { MOOD, MoodPill } from "./Pills";

// Sick and health are independent signals in the real model (lib/pets/mood.ts,
// lib/pets/health.ts): sick comes from openIssueCount once deployed, while
// health decays purely from time since the last commit, regardless of phase
// or sickness. The copy below reflects that instead of conflating the two.
const MOOD_BLURB: Record<Mood, string> = {
  healthy: "Steady commits (or a clean deploy) are keeping health topped up.",
  tired:
    "Health drops when the repo goes quiet — a fresh commit brings it back up.",
  sick: "Sick tracks open issues, separately from health — which keeps decaying based on time since the last commit.",
};

export function HealthCard({ pet }: { pet: SamplePet }) {
  const mood = moodFor(pet.health, pet.sick);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dash-border bg-dash-card p-6">
      <h2 className="text-[15px] font-bold text-dash-heading">Health</h2>
      <div className="flex items-baseline gap-2.5">
        <span className={`text-[32px] font-bold ${MOOD[mood].text}`}>
          {pet.health}%
        </span>
        <MoodPill mood={mood} />
      </div>
      <Bar progress={pet.health / 100} fillClassName={MOOD[mood].dot} />
      <p className="text-xs text-dash-muted">{MOOD_BLURB[mood]}</p>
    </div>
  );
}
