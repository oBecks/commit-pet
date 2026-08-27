import { SignIn } from "@clerk/nextjs";
import { Logo } from "@/app/_components/Logo";
import { clerkAppearance } from "@/app/_components/clerk-appearance";

export default function SignInPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-dash-bg px-6 py-16">
      <div className="flex items-center gap-2.5">
        <Logo className="h-9 w-9" />
        <span className="text-xl font-bold text-dash-heading">Commit Pet</span>
      </div>
      <SignIn appearance={clerkAppearance} fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
