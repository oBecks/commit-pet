import { useId } from "react";
import { petArtwork } from "@/lib/pets/render";
import type { Stage } from "@/lib/pets/growth";
import type { Mood } from "@/lib/pets/mood";

export function PetArt({
  stage,
  mood,
  className,
}: {
  stage: Stage;
  mood: Mood;
  className?: string;
}) {
  const instanceId = useId();
  const { viewBox, defs, body } = petArtwork(stage, mood, instanceId);

  return (
    <svg viewBox={viewBox} className={className} role="img" aria-hidden="true">
      {defs && <defs dangerouslySetInnerHTML={{ __html: defs }} />}
      <g dangerouslySetInnerHTML={{ __html: body }} />
    </svg>
  );
}
