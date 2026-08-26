import Link from "next/link";

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
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-full bg-dash-neutral-pill">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-dash-muted"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
          </svg>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-dash-muted"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
