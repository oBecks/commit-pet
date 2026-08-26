// Placeholder Dashboard data, shaped like the real `pets`/`repos` rows
// (lib/db/schema.ts) rather than a hand-rolled parallel model — stage and
// mood are deliberately NOT stored here, same as the real schema: derive them
// with stageForXp()/moodFor() the way production code does, so a component
// written against this shape keeps working once it reads real rows. Stands
// in until the Dashboard has real auth and can resolve "which installations
// can this signed-in user see" (open question, see docs/open-questions.md —
// Org access control). repoId mirrors the real numeric GitHub repo id the
// badge endpoint keys on (app/api/badge/[repoId]).
export type Phase = "development" | "deployed";

export type SamplePet = {
  repoId: string;
  fullName: string;
  phase: Phase;
  xp: number;
  health: number;
  sick: boolean;
  openIssueCount: number;
  lastCommitRelative: string | null;
  deployedRelative: string | null;
  installedOn: string;
};

export const SAMPLE_PETS: SamplePet[] = [
  {
    repoId: "848213001",
    fullName: "acme/api-gateway",
    phase: "development",
    xp: 420,
    health: 95,
    sick: false,
    openIssueCount: 0,
    lastCommitRelative: "2h ago",
    deployedRelative: null,
    installedOn: "Jun 3, 2026",
  },
  {
    repoId: "848213002",
    fullName: "acme/mobile-app",
    phase: "development",
    xp: 210,
    health: 32,
    sick: false,
    openIssueCount: 0,
    lastCommitRelative: "4 days ago",
    deployedRelative: null,
    installedOn: "Jul 11, 2026",
  },
  {
    repoId: "848213093",
    fullName: "acme/billing-service",
    phase: "deployed",
    xp: 90,
    health: 34,
    sick: true,
    openIssueCount: 2,
    lastCommitRelative: null,
    deployedRelative: "14 days ago",
    installedOn: "Aug 2, 2026",
  },
  {
    repoId: "848213004",
    fullName: "acme/design-system",
    phase: "development",
    xp: 12,
    health: 100,
    sick: false,
    openIssueCount: 0,
    lastCommitRelative: "1h ago",
    deployedRelative: null,
    installedOn: "Aug 20, 2026",
  },
  {
    repoId: "848213005",
    fullName: "acme/docs-site",
    phase: "deployed",
    xp: 620,
    health: 100,
    sick: false,
    openIssueCount: 0,
    lastCommitRelative: null,
    deployedRelative: "61 days ago",
    installedOn: "Apr 2, 2026",
  },
  {
    repoId: "848213006",
    fullName: "acme/worker-queue",
    phase: "development",
    xp: 250,
    health: 92,
    sick: false,
    openIssueCount: 0,
    lastCommitRelative: "5h ago",
    deployedRelative: null,
    installedOn: "May 15, 2026",
  },
];

export function getSamplePet(repoId: string): SamplePet | undefined {
  return SAMPLE_PETS.find((pet) => pet.repoId === repoId);
}
