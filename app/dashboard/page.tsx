import Link from "next/link";
import { getAccessibleInstallationIds } from "@/lib/github/user-auth";
import { getDashboardPets } from "@/lib/pets/dashboard-data";
import { PetCard } from "./_components/PetCard";

export default async function DashboardPage() {
  const installationIds = await getAccessibleInstallationIds();

  return (
    <div className="flex flex-1 flex-col gap-7 px-6 py-10 sm:px-12 sm:py-10">
      <div>
        <h1 className="mb-1.5 text-2xl font-bold text-dash-heading sm:text-[26px]">
          Your pets
        </h1>
        <p className="text-sm text-dash-muted">
          Every repo with Commit Pet installed, in one place.
        </p>
      </div>

      {installationIds === null ? (
        <ConnectGithubPrompt />
      ) : (
        <PetsGrid installationIds={installationIds} />
      )}
    </div>
  );
}

async function PetsGrid({ installationIds }: { installationIds: number[] }) {
  const pets = await getDashboardPets(installationIds);

  if (pets.length === 0) {
    return (
      <p className="text-sm text-dash-muted">
        No pets yet —{" "}
        <a
          href="https://github.com/apps/commit-pet"
          className="font-semibold text-dash-accent hover:text-[#C2560B]"
        >
          install Commit Pet
        </a>{" "}
        on a repo you can access to get one.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {pets.map((pet) => (
        <PetCard key={pet.repoId} pet={pet} />
      ))}
    </div>
  );
}

function ConnectGithubPrompt() {
  return (
    <p className="text-sm text-dash-muted">
      Connect your GitHub account to see your repos&apos; pets —{" "}
      <Link
        href="/user-profile"
        className="font-semibold text-dash-accent hover:text-[#C2560B]"
      >
        manage connected accounts
      </Link>
      .
    </p>
  );
}
