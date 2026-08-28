import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/app/_components/AuthBrandPanel";
import { clerkAppearance } from "@/app/_components/clerk-appearance";

export default function SignInPage() {
  return (
    <AuthShell>
      <SignIn appearance={clerkAppearance} fallbackRedirectUrl="/dashboard" />
    </AuthShell>
  );
}
