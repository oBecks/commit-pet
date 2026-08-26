import { SAMPLE_PETS } from "@/lib/pets/sample-data";
import { PetCard } from "./_components/PetCard";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-7 px-6 py-10 sm:px-12 sm:py-10">
      <div>
        <h1 className="mb-1.5 text-2xl font-bold text-dash-heading sm:text-[26px]">Your pets</h1>
        <p className="text-sm text-dash-muted">Every repo with Commit Pet installed, in one place.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_PETS.map((pet) => (
          <PetCard key={pet.repoId} pet={pet} />
        ))}
      </div>
    </div>
  );
}
