import { SignUp } from "@clerk/nextjs";
import { AuthBrandPanel, MobileAuthHero } from "@/app/_components/AuthBrandPanel";
import { clerkAppearance } from "@/app/_components/clerk-appearance";
import { fadeUp } from "@/lib/ui/motion";

export default function SignUpPage() {
  return (
    <div className="grid flex-1 lg:grid-cols-[1.15fr_1fr]">
      <AuthBrandPanel />
      <div className="flex flex-1 flex-col bg-dash-bg">
        <MobileAuthHero />
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 lg:py-16">
          <div className={fadeUp(200)}>
            <SignUp
              appearance={clerkAppearance}
              fallbackRedirectUrl="/dashboard"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
