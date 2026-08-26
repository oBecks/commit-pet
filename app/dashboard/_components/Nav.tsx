import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export function Nav() {
  return (
    <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-dash-border bg-dash-card px-6 sm:px-12">
      <Link href="/dashboard" className="flex items-center gap-2.5">
        <svg width="26" height="26" viewBox="-33 -35 66 70" aria-hidden="true">
          <circle
            cx="0"
            cy="-8"
            r="31"
            fill="#FB923C"
            stroke="#C2560B"
            strokeWidth="2"
          />
          <ellipse cx="0" cy="9" rx="16" ry="12" fill="#FFF3E0" />
          <path d="M -3.5 5 L 3.5 5 L 0 9.5 Z" fill="#1F2937" />
          <circle cx="-12" cy="-9" r="9" fill="#fff" />
          <circle cx="12" cy="-9" r="9" fill="#fff" />
          <circle cx="-12" cy="-9" r="5.6" fill="#111827" />
          <circle cx="12" cy="-9" r="5.6" fill="#111827" />
        </svg>
        <span className="text-lg font-bold text-dash-heading">Commit Pet</span>
      </Link>
      <UserButton userProfileMode="navigation" userProfileUrl="/user-profile" />
    </div>
  );
}
