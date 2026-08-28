import type { DashboardPet } from "@/lib/pets/dashboard-data";
import type { McpTokenStatus } from "@/lib/mcp/tokens";
import { fadeUp } from "@/lib/ui/motion";
import { Hero } from "./Hero";
import { GrowthCard } from "./GrowthCard";
import { OpenIssuesCard } from "./OpenIssuesCard";
import { HealthCard } from "./HealthCard";
import { BadgeCard } from "./BadgeCard";
import { RepoInfoCard } from "./RepoInfoCard";
import { McpTokenCard } from "./McpTokenCard";

// The Hero/Growth-or-Issues/Health/Badge/MCP/Repo layout for one pet — used
// both by the standalone /dashboard/[repoId] page and by PetsCarousel's
// inline detail view, so the layout only needs to be correct once.
export function PetDetailSection({
  pet,
  tokenStatus,
}: {
  pet: DashboardPet;
  tokenStatus: McpTokenStatus;
}) {
  return (
    <div className="flex flex-col items-start gap-6 lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-6 lg:flex-[2]">
        <div {...fadeUp(40)}>
          <Hero pet={pet} />
        </div>
        <div {...fadeUp(80)}>
          {pet.phase === "development" ? (
            <GrowthCard pet={pet} />
          ) : (
            <OpenIssuesCard pet={pet} />
          )}
        </div>
      </div>

      <div className="flex w-full flex-col gap-6 lg:w-auto lg:flex-1">
        <div {...fadeUp(120)}>
          <HealthCard pet={pet} />
        </div>
        <div {...fadeUp(160)}>
          <BadgeCard pet={pet} />
        </div>
        <div {...fadeUp(200)}>
          <McpTokenCard
            repoId={pet.repoId}
            hasToken={tokenStatus.exists}
            lastUsedRelative={tokenStatus.lastUsedRelative}
          />
        </div>
        <div {...fadeUp(240)}>
          <RepoInfoCard pet={pet} />
        </div>
      </div>
    </div>
  );
}
