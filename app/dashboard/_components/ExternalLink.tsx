import type { ReactNode } from "react";

export function ExternalLink({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dash-card ${className}`}
    >
      {children}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M7 17L17 7" />
        <path d="M9 7h8v8" />
      </svg>
    </a>
  );
}
