import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/app/_components/Logo";
import { fadeUp } from "@/lib/ui/motion";

export function Nav() {
  return (
    <div
      className={`flex h-[72px] shrink-0 items-center justify-between border-b border-dash-border bg-dash-card px-6 sm:px-12 ${fadeUp().className}`}
    >
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 rounded-sm transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dash-card"
      >
        <Logo className="h-7 w-7" />
        <span className="text-lg font-bold text-dash-heading">Commit Pet</span>
      </Link>
      <UserButton userProfileMode="navigation" userProfileUrl="/user-profile" />
    </div>
  );
}
