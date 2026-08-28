"use client";

import type { DashboardPet } from "@/lib/pets/dashboard-data";
import type { McpTokenStatus } from "@/lib/mcp/tokens";
import { fadeUp } from "@/lib/ui/motion";
import { PetCardContent } from "./PetCard";
import { PetDetailSection } from "./PetDetailSection";
import { useCenteredCard } from "./useCenteredCard";

// Swipe/scroll the strip left and right to choose a pet — whichever card is
// centered becomes "selected" (see useCenteredCard). Tapping a card sets the
// selection directly (not just via scrollIntoView): when every card is
// already visible at once — no horizontal scrolling needed — scrollIntoView
// on an already-in-view card is a no-op, so nothing would ever tell the
// IntersectionObserver-driven centering to update and clicks would silently
// do nothing.
export function PetsCarousel({
  pets,
  tokenStatuses,
}: {
  pets: DashboardPet[];
  tokenStatuses: Record<string, McpTokenStatus>;
}) {
  const [firstPet] = pets;
  const { centeredId, containerRef, register, setCenteredId } = useCenteredCard(
    firstPet?.repoId,
  );

  // The dashboard only renders this component once it already knows there's
  // at least one pet (see PetsSection in app/dashboard/page.tsx) — this is
  // just making that invariant explicit instead of letting `selected` below
  // silently resolve to undefined for an empty list.
  if (!firstPet) return null;

  const selected = pets.find((p) => p.repoId === centeredId) ?? firstPet;
  const tokenStatus = tokenStatuses[selected.repoId] ?? {
    exists: false,
    lastUsedRelative: null,
  };

  return (
    <div className="flex flex-col gap-8">
      <div
        ref={containerRef}
        className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pt-2 pb-2 sm:-mx-12 sm:px-12"
      >
        {pets.map((pet, i) => {
          const isSelected = pet.repoId === selected.repoId;
          const entrance = fadeUp(Math.min(i, 6) * 40);
          return (
            <button
              key={pet.repoId}
              type="button"
              ref={register(pet.repoId)}
              data-centered-card-id={pet.repoId}
              aria-current={isSelected ? "true" : undefined}
              onClick={(e) => {
                setCenteredId(pet.repoId);
                e.currentTarget.scrollIntoView({
                  behavior: "smooth",
                  inline: "center",
                  block: "nearest",
                });
              }}
              className="group w-[78%] max-w-[300px] shrink-0 snap-center text-left sm:w-72"
            >
              <div
                style={entrance.style}
                className={`flex flex-col gap-4 rounded-2xl border p-6 transition-[transform,box-shadow,border-color] duration-200 ease-out ${entrance.className} group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_28px_-10px_rgba(43,33,21,0.28)] group-focus-visible:outline-none group-focus-visible:ring-2 group-focus-visible:ring-dash-accent/50 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-dash-bg group-active:translate-y-0 ${
                  isSelected
                    ? "border-dash-accent bg-dash-card shadow-[0_10px_28px_-10px_rgba(43,33,21,0.28)]"
                    : "border-dash-border bg-dash-card"
                }`}
              >
                <PetCardContent pet={pet} />
              </div>
            </button>
          );
        })}
      </div>

      <PetDetailSection
        key={selected.repoId}
        pet={selected}
        tokenStatus={tokenStatus}
      />
    </div>
  );
}
