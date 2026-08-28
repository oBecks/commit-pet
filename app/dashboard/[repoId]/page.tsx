import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccessibleInstallationIds } from "@/lib/github/user-auth";
import { getDashboardPet } from "@/lib/pets/dashboard-data";
import { repoShortName } from "@/lib/pets/repo-name";
import { getMcpTokenStatus } from "@/lib/mcp/tokens";
import { fadeUp } from "@/lib/ui/motion";
import { PetDetailSection } from "../_components/PetDetailSection";

export async function generateMetadata({
  params,
}: PageProps<"/dashboard/[repoId]">): Promise<Metadata> {
  const { repoId } = await params;
  const repoIdNum = Number(repoId);
  if (!Number.isInteger(repoIdNum)) return {};

  const installationIds = await getAccessibleInstallationIds();
  if (installationIds === null) return {};

  const pet = await getDashboardPet(repoIdNum, installationIds);
  return { title: pet?.fullName };
}

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

  const tokenStatus = await getMcpTokenStatus(repoIdNum);

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8 sm:px-12">
      <div
        className={`flex items-center gap-2 text-[13px] ${fadeUp().className}`}
      >
        <Link
          href="/dashboard"
          className="font-semibold text-dash-accent hover:text-[#C2560B]"
        >
          ← Dashboard
        </Link>
        <span className="text-dash-muted">/</span>
        <span className="text-dash-muted">{repoShortName(pet.fullName)}</span>
      </div>

      <PetDetailSection pet={pet} tokenStatus={tokenStatus} />
    </div>
  );
}
