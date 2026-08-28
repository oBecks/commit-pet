import { Fragment } from "react";
import type { Stage } from "@/lib/pets/growth";
import { PetArt } from "@/app/dashboard/_components/PetArt";
import { fadeUp } from "@/lib/ui/motion";
import { Logo } from "./Logo";

const STAGES: { stage: Stage; label: string }[] = [
  { stage: "egg", label: "Egg" },
  { stage: "hatchling", label: "Hatchling" },
  { stage: "juvenile", label: "Juvenile" },
  { stage: "adult", label: "Adult" },
];

// The only two sizings StageStrip is ever asked for — desktop brand panel
// vs. the compact mobile hero. A closed set of variants instead of five
// independent style props means there's no way to call it with a mismatched
// combination (e.g. mobile-sized art with desktop-sized chevrons).
const STAGE_STRIP_VARIANTS = {
  full: {
    artClassName: "h-20 w-auto",
    tileClassName: "px-3 py-5",
    chevronSize: 16,
    gapClassName: "gap-2.5",
    labels: true,
  },
  compact: {
    artClassName: "h-9 w-auto",
    tileClassName: "px-1.5 py-2.5",
    chevronSize: 12,
    gapClassName: "gap-1.5",
    labels: false,
  },
} as const;

// Shared growth-stage row, sized differently for the desktop brand panel vs.
// the compact mobile hero below. Labels are dropped on mobile — four
// two-word labels don't fit at that width without wrapping into the chevrons.
function StageStrip({ variant }: { variant: keyof typeof STAGE_STRIP_VARIANTS }) {
  const { artClassName, tileClassName, chevronSize, gapClassName, labels } =
    STAGE_STRIP_VARIANTS[variant];

  return (
    <div className={`flex items-stretch ${gapClassName}`}>
      {STAGES.map(({ stage, label }, i) => (
        <Fragment key={stage}>
          <div
            className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dash-border bg-dash-card/70 ${tileClassName}`}
          >
            <PetArt stage={stage} mood="healthy" className={artClassName} />
            {labels && (
              <span className="text-xs font-semibold text-dash-muted">
                {label}
              </span>
            )}
          </div>
          {i < STAGES.length - 1 && (
            <svg
              width={chevronSize}
              height={chevronSize}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="shrink-0 self-center text-dash-border"
              aria-hidden="true"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          )}
        </Fragment>
      ))}
    </div>
  );
}

// Shared left panel for sign-in/sign-up — hidden below lg, where
// MobileAuthHero (below) takes over. Doubles as the app's de facto landing
// page for signed-out visitors, since "/" redirects straight here instead of
// showing separate marketing content.
export function AuthBrandPanel() {
  return (
    <div className="relative hidden flex-col justify-center gap-12 overflow-hidden border-r border-dash-border bg-gradient-to-br from-dash-card to-dash-bg px-16 py-16 lg:flex">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-dash-accent/10 blur-3xl"
      />

      <div className="mx-auto flex w-full max-w-xl flex-col gap-12">
        <div className={`flex items-center gap-2.5 ${fadeUp()}`}>
          <Logo className="h-9 w-9" />
          <span className="text-xl font-bold text-dash-heading">
            Commit Pet
          </span>
        </div>

        <div className={`flex flex-col gap-4 ${fadeUp(80)}`}>
          <h1 className="max-w-[15ch] text-5xl leading-[1.1] font-bold tracking-tight text-dash-heading">
            A pet that grows as you commit.
          </h1>
          <p className="max-w-[38ch] text-lg text-dash-muted">
            Install it on a GitHub repo, watch it grow from egg to adult, and
            retire once you ship.
          </p>
        </div>

        <div className={fadeUp(160)}>
          <StageStrip variant="full" />
        </div>
      </div>
    </div>
  );
}

// Compact hero for the auth pages below `lg`, shown above the Clerk widget
// instead of just a bare logo. Same brand moment as AuthBrandPanel (headline,
// subtext, growth-stage strip) at mobile scale.
export function MobileAuthHero() {
  return (
    <div className="relative flex flex-col items-center gap-5 overflow-hidden bg-gradient-to-b from-dash-card to-dash-bg px-6 pt-12 pb-8 lg:hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-dash-accent/10 blur-3xl"
      />

      <div className={`flex items-center gap-2 ${fadeUp()}`}>
        <Logo className="h-7 w-7" />
        <span className="text-base font-bold text-dash-heading">
          Commit Pet
        </span>
      </div>

      <div className={`flex flex-col items-center gap-2 text-center ${fadeUp(80)}`}>
        <h1 className="max-w-[16ch] text-[26px] leading-[1.2] font-bold tracking-tight text-dash-heading">
          A pet that grows as you commit.
        </h1>
        <p className="max-w-[34ch] text-sm text-dash-muted">
          Install it on a GitHub repo, watch it grow from egg to adult, and
          retire once you ship.
        </p>
      </div>

      <div className={`w-full max-w-xs ${fadeUp(160)}`}>
        <StageStrip variant="compact" />
      </div>
    </div>
  );
}
