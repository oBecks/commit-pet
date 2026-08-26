import { stageProgress } from "@/lib/pets/growth";
import type { DashboardPet } from "@/lib/pets/dashboard-data";
import { Bar } from "./Bar";

export function GrowthCard({ pet }: { pet: DashboardPet }) {
  const { floor, ceiling } = stageProgress(pet.xp);
  const progress = ceiling === null ? 1 : (pet.xp - floor) / (ceiling - floor);
  const label =
    ceiling === null
      ? `${pet.xp.toLocaleString()} XP — max stage reached`
      : `${pet.xp} / ${ceiling} XP — ${ceiling - pet.xp} XP to next stage`;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dash-border bg-dash-card p-6">
      <h2 className="text-[15px] font-bold text-dash-heading">Growth</h2>
      <Bar progress={progress} />
      <span className="text-xs text-dash-muted">{label}</span>
      <p className="text-xs text-dash-muted">
        {pet.lastCommitRelative
          ? `Last commit ${pet.lastCommitRelative}`
          : "No commits yet"}
      </p>
    </div>
  );
}
