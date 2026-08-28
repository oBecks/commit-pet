import { stageProgress } from "@/lib/pets/growth";
import { moodFor } from "@/lib/pets/mood";
import { repoShortName } from "@/lib/pets/repo-name";
import type { DashboardPet } from "@/lib/pets/dashboard-data";
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

// Presentational only — no wrapping Link/button, so callers pick the
// interaction (PetsCarousel wraps this in a selectable <button>). PetArt's
// hover/focus scale is driven by a `group` class on whatever wraps this.
export function PetCardContent({ pet }: { pet: DashboardPet }) {
  const { stage, floor, ceiling } = stageProgress(pet.xp);
  const mood = moodFor(pet.health, pet.sick);
  const progress = ceiling === null ? 1 : (pet.xp - floor) / (ceiling - floor);
  const progressLabel =
    ceiling === null
      ? `${pet.xp.toLocaleString()} XP · max stage`
      : `${pet.xp} / ${ceiling} XP`;

  return (
    <>
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
            {repoShortName(pet.fullName)}
          </span>
        </div>
        <PhasePill phase={pet.phase} />
      </div>

      <div className="flex justify-center py-2">
        <PetArt
          stage={stage}
          mood={mood}
          className="h-[140px] w-auto transition-transform duration-300 ease-out group-hover:scale-105 group-focus-visible:scale-105"
        />
      </div>

      <div>
        <Bar progress={progress} fillClassName={XP_BAR_FILL[mood]} />
        <div className="mt-1.5 text-center text-xs tabular-nums text-dash-muted">
          {pet.phase === "deployed"
            ? pet.deployedRelative
              ? `Deployed ${pet.deployedRelative}`
              : "Deployed"
            : progressLabel}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <StagePill stage={stage} />
        <MoodPill mood={mood} />
      </div>

      <div className="text-xs text-dash-muted">
        {pet.phase === "development" ? (
          pet.lastCommitRelative ? (
            `Last commit ${pet.lastCommitRelative}`
          ) : (
            "No commits yet"
          )
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
    </>
  );
}
