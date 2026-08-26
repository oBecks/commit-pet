"use client";

import { useRef, useState } from "react";

type Status = "idle" | "copied" | "error";

export function CopyButton({ text }: { text: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const resetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef(false);

  async function handleClick() {
    // Guards against overlapping clicks, not just back-to-back ones: without
    // this, two in-flight writeText() calls can each resolve and schedule
    // their own reset timeout, and the second overwrites the ref before the
    // first's timeout is ever cleared.
    if (pending.current) return;
    pending.current = true;
    if (resetTimeout.current) clearTimeout(resetTimeout.current);
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    pending.current = false;
    resetTimeout.current = setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center justify-center gap-1.5 rounded-lg border border-dash-border p-2 text-sm font-semibold text-dash-heading hover:bg-dash-neutral-pill"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <rect x="9" y="9" width="12" height="12" rx="2" />
        <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
      </svg>
      {status === "copied"
        ? "Copied!"
        : status === "error"
          ? "Couldn't copy"
          : "Copy markdown"}
    </button>
  );
}
