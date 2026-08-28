// The one entrance animation used across the Dashboard and auth pages for
// content that mounts once per page load (cards, sections, page headers).
// Centralized so the 450ms/easing tuning lives in one place instead of being
// copy-pasted into every className string that wants it.
export function fadeUp(delayMs = 0): string {
  const base =
    "motion-safe:animate-[fade-up_450ms_cubic-bezier(0.16,1,0.3,1)_both]";
  return delayMs > 0 ? `${base} [animation-delay:${delayMs}ms]` : base;
}
