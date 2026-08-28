import type { Metadata } from "next";
import Link from "next/link";
import { getAccessibleInstallationIds } from "@/lib/github/user-auth";
import { getDashboardPets } from "@/lib/pets/dashboard-data";
import { getMcpTokenStatus, type McpTokenStatus } from "@/lib/mcp/tokens";
import { fadeUp } from "@/lib/ui/motion";
import { PetsCarousel } from "./_components/PetsCarousel";

export const metadata: Metadata = {
  title: "Your pets",
};

export default async function DashboardPage() {
  const installationIds = await getAccessibleInstallationIds();

  return (
    <div className="flex flex-1 flex-col gap-7 px-6 py-10 sm:px-12 sm:py-10">
      <div className={fadeUp()}>
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
        <PetsSection installationIds={installationIds} />
      )}
    </div>
  );
}

async function PetsSection({ installationIds }: { installationIds: number[] }) {
  const pets = await getDashboardPets(installationIds);

  if (pets.length === 0) {
    return (
      <p className="text-sm text-dash-muted">
        No pets yet —{" "}
        <a
          href="https://github.com/apps/commit-pet"
          className="rounded-sm font-semibold text-dash-accent transition-colors duration-150 hover:text-[#C2560B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dash-bg"
        >
          install Commit Pet
        </a>{" "}
        on a repo you can access to get one.
      </p>
    );
  }

  // One extra query per pet — fine at the handful-of-repos scale this
  // dashboard runs at. Keyed by repoId so PetsCarousel can look up whichever
  // pet is currently selected without re-fetching on every swipe.
  const tokenStatusEntries = await Promise.all(
    pets.map(async (pet): Promise<[string, McpTokenStatus]> => [
      pet.repoId,
      await getMcpTokenStatus(Number(pet.repoId)),
    ]),
  );
  const tokenStatuses = Object.fromEntries(tokenStatusEntries);

  return <PetsCarousel pets={pets} tokenStatuses={tokenStatuses} />;
}

function ConnectGithubPrompt() {
  return (
    <p className="text-sm text-dash-muted">
      Connect your GitHub account to see your repos&apos; pets —{" "}
      <Link
        href="/user-profile"
        className="rounded-sm font-semibold text-dash-accent transition-colors duration-150 hover:text-[#C2560B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dash-bg"
      >
        manage connected accounts
      </Link>
      .
    </p>
  );
}
