import Link from "next/link";
import { stageProgress } from "@/lib/pets/growth";
import { moodFor } from "@/lib/pets/mood";
import type { SamplePet } from "@/lib/pets/sample-data";
import { PetArt } from "./PetArt";
import { Bar } from "./Bar";
import { MOOD, MoodPill, PhasePill, StagePill } from "./Pills";

// This is the XP growth bar, not the health bar, so "healthy" deliberately
// stays the brand accent instead of MOOD.healthy.dot — only tired/sick tint
// it, reusing the same dot colors HealthCard/MoodPill use elsewhere.
const XP_BAR_FILL = {
  healthy: "bg-dash-accent",
  tired: MOOD.tired.dot,
  sick: MOOD.sick.dot,
} as const;

export function PetCard({ pet }: { pet: SamplePet }) {
  const { stage, floor, ceiling } = stageProgress(pet.xp);
  const mood = moodFor(pet.health, pet.sick);
  const progress = ceiling === null ? 1 : (pet.xp - floor) / (ceiling - floor);
  const progressLabel =
    ceiling === null
      ? `${pet.xp.toLocaleString()} XP · max stage`
      : `${pet.xp} / ${ceiling} XP`;

  return (
    <Link
      href={`/dashboard/${pet.repoId}`}
      className="flex flex-col gap-4 rounded-2xl border border-dash-border bg-dash-card p-6 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0 text-dash-muted"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 9h18" />
          </svg>
          <span className="truncate text-sm font-semibold text-dash-heading">
            {pet.fullName}
          </span>
        </div>
        <PhasePill phase={pet.phase} />
      </div>

      <div className="flex justify-center py-2">
        <PetArt stage={stage} mood={mood} className="h-[140px] w-auto" />
      </div>

      <div>
        <Bar progress={progress} fillClassName={XP_BAR_FILL[mood]} />
        <div className="mt-1.5 text-center text-xs text-dash-muted">
          {pet.phase === "deployed"
            ? `Deployed ${pet.deployedRelative}`
            : progressLabel}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <StagePill stage={stage} />
        <MoodPill mood={mood} />
      </div>

      <div className="text-xs text-dash-muted">
        {pet.phase === "development" ? (
          `Last commit ${pet.lastCommitRelative}`
        ) : pet.openIssueCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 font-semibold text-sick-text">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              aria-hidden="true"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.3 3.9L2.7 17.3A1.5 1.5 0 0 0 4 19.5h16a1.5 1.5 0 0 0 1.3-2.2L13.7 3.9a1.5 1.5 0 0 0-2.6 0z" />
            </svg>
            {pet.openIssueCount} open issue{pet.openIssueCount === 1 ? "" : "s"}
          </span>
        ) : (
          "0 open issues"
        )}
      </div>
    </Link>
  );
}
