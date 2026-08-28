import type { CSSProperties } from "react";

// The one entrance animation used across the Dashboard and auth pages for
// content that mounts once per page load (cards, sections, page headers).
//
// className is a fixed literal string, never interpolated, because Tailwind
// generates CSS by scanning source files for class text at build time — it
// does not execute this function. An arbitrary-value class built from
// `delayMs` (e.g. `` `[animation-delay:${delayMs}ms]` ``) would never appear
// as literal text anywhere Tailwind scans, so it would compile to nothing.
// The delay goes through a real inline style instead, which has no such
// restriction.
const FADE_UP_CLASS =
  "motion-safe:animate-[fade-up_450ms_cubic-bezier(0.16,1,0.3,1)_both]";

export function fadeUp(delayMs = 0): {
  className: string;
  style?: CSSProperties;
} {
  return {
    className: FADE_UP_CLASS,
    style: delayMs > 0 ? { animationDelay: `${delayMs}ms` } : undefined,
  };
}
