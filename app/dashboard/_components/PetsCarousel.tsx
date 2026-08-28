"use client";

import type { DashboardPet } from "@/lib/pets/dashboard-data";
import type { McpTokenStatus } from "@/lib/mcp/tokens";
import { fadeUp } from "@/lib/ui/motion";
import { PetCardContent } from "./PetCard";
import { PetDetailSection } from "./PetDetailSection";
import { useCenteredCard } from "./useCenteredCard";

// Swipe/scroll the strip left and right to choose a pet — whichever card is
// centered becomes "selected" (see useCenteredCard). Tapping a card just
// scrolls it to center; the centering hook is what actually flips selection,
// so touch swipe and tap land on the same state instead of racing each
// other.
export function PetsCarousel({
  pets,
  tokenStatuses,
}: {
  pets: DashboardPet[];
  tokenStatuses: Record<string, McpTokenStatus>;
}) {
  const { centeredId, containerRef, register } = useCenteredCard(
    pets[0]?.repoId,
  );
  const selected = pets.find((p) => p.repoId === centeredId) ?? pets[0];
  const tokenStatus = tokenStatuses[selected.repoId] ?? {
    exists: false,
    lastUsedRelative: null,
  };

  return (
    <div className="flex flex-col gap-8">
      <div
        ref={containerRef}
        className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-2 sm:-mx-12 sm:px-12"
      >
        {pets.map((pet, i) => (
          <button
            key={pet.repoId}
            type="button"
            ref={register(pet.repoId)}
            data-centered-card-id={pet.repoId}
            onClick={(e) =>
              e.currentTarget.scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest",
              })
            }
            className={`group flex w-[78%] max-w-[300px] shrink-0 snap-center flex-col gap-4 rounded-2xl border p-6 text-left transition-[transform,box-shadow,border-color] duration-200 ease-out ${fadeUp(Math.min(i, 6) * 40)} hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-10px_rgba(43,33,21,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dash-bg active:translate-y-0 sm:w-72 ${
              pet.repoId === selected.repoId
                ? "border-dash-accent bg-dash-card shadow-[0_10px_28px_-10px_rgba(43,33,21,0.28)]"
                : "border-dash-border bg-dash-card"
            }`}
          >
            <PetCardContent pet={pet} />
          </button>
        ))}
      </div>

      <PetDetailSection
        key={selected.repoId}
        pet={selected}
        tokenStatus={tokenStatus}
      />
    </div>
  );
}
