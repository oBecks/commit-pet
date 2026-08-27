import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/app/_components/Logo";

export function Nav() {
  return (
    <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-dash-border bg-dash-card px-6 sm:px-12">
      <Link href="/dashboard" className="flex items-center gap-2.5">
        <Logo className="h-7 w-7" />
        <span className="text-lg font-bold text-dash-heading">Commit Pet</span>
      </Link>
      <UserButton userProfileMode="navigation" userProfileUrl="/user-profile" />
    </div>
  );
}
