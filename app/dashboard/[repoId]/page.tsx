import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccessibleInstallationIds } from "@/lib/github/user-auth";
import { getDashboardPet } from "@/lib/pets/dashboard-data";
import { Hero } from "../_components/Hero";
import { GrowthCard } from "../_components/GrowthCard";
import { OpenIssuesCard } from "../_components/OpenIssuesCard";
import { HealthCard } from "../_components/HealthCard";
import { BadgeCard } from "../_components/BadgeCard";
import { RepoInfoCard } from "../_components/RepoInfoCard";

export default async function PetDetailPage({
  params,
}: PageProps<"/dashboard/[repoId]">) {
  const { repoId } = await params;
  const repoIdNum = Number(repoId);
  if (!Number.isInteger(repoIdNum)) notFound();

  const installationIds = await getAccessibleInstallationIds();
  if (installationIds === null) notFound();

  // Scoped to the signed-in user's own installations — see
  // lib/pets/dashboard-data.ts. Returns null (not found) for a repoId that
  // exists but belongs to someone else's installation, same as one that
  // doesn't exist at all.
  const pet = await getDashboardPet(repoIdNum, installationIds);
  if (!pet) notFound();

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8 sm:px-12">
      <div className="flex items-center gap-2 text-[13px]">
        <Link
          href="/dashboard"
          className="font-semibold text-dash-accent hover:text-[#C2560B]"
        >
          ← Dashboard
        </Link>
        <span className="text-dash-muted">/</span>
        <span className="text-dash-muted">{pet.fullName}</span>
      </div>

      <div className="flex flex-col items-start gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6 lg:flex-[2]">
          <Hero pet={pet} />
          {pet.phase === "development" ? (
            <GrowthCard pet={pet} />
          ) : (
            <OpenIssuesCard pet={pet} />
          )}
        </div>

        <div className="flex w-full flex-col gap-6 lg:w-auto lg:flex-1">
          <HealthCard pet={pet} />
          <BadgeCard pet={pet} />
          <RepoInfoCard pet={pet} />
        </div>
      </div>
    </div>
  );
}
