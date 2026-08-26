import type { Stage } from "@/lib/pets/growth";
import type { Mood } from "@/lib/pets/mood";
import type { Phase } from "@/lib/pets/sample-data";

const STAGE_LABEL: Record<Stage, string> = {
  egg: "Egg",
  hatchling: "Hatchling",
  juvenile: "Juvenile",
  adult: "Adult",
};

const PHASE_LABEL: Record<Phase, string> = {
  development: "Development",
  deployed: "Deployed",
};

const MOOD: Record<Mood, { label: string; bg: string; text: string; dot: string }> = {
  healthy: {
    label: "Healthy",
    bg: "bg-healthy-bg",
    text: "text-healthy-text",
    dot: "bg-healthy-dot",
  },
  tired: {
    label: "Tired",
    bg: "bg-tired-bg",
    text: "text-tired-text",
    dot: "bg-tired-dot",
  },
  sick: {
    label: "Sick",
    bg: "bg-sick-bg",
    text: "text-sick-text",
    dot: "bg-sick-dot",
  },
};

export function StagePill({ stage }: { stage: Stage }) {
  return (
    <span className="rounded-full bg-dash-neutral-pill px-2.5 py-1 text-xs font-semibold text-dash-heading">
      {STAGE_LABEL[stage]}
    </span>
  );
}

export function PhasePill({ phase }: { phase: Phase }) {
  return (
    <span className="whitespace-nowrap rounded-full border border-dash-border px-2.5 py-1 text-[11px] font-semibold tracking-wide text-dash-muted uppercase">
      {PHASE_LABEL[phase]}
    </span>
  );
}

export function MoodPill({ mood }: { mood: Mood }) {
  const { label, bg, text, dot } = MOOD[mood];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${bg} ${text}`}
    >
      <span className={`size-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
