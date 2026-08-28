import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/app/_components/AuthBrandPanel";
import { clerkAppearance } from "@/app/_components/clerk-appearance";

export default function SignUpPage() {
  return (
    <AuthShell>
      <SignUp appearance={clerkAppearance} fallbackRedirectUrl="/dashboard" />
    </AuthShell>
  );
}
