import { useEffect, useRef, useState } from "react";

// Tracks which of a set of horizontally-scroll-snapped elements is centered
// in their shared scroll container, updating as the user scrolls. Register
// each element with the returned `register(id)` ref callback; `containerRef`
// goes on the scrolling element itself.
//
// Pure DOM-observation mechanism, no knowledge of what the cards contain —
// kept separate from PetsCarousel so that component can stay focused on
// rendering instead of also owning the IntersectionObserver bookkeeping.
//
// Assumes the registered set of elements is fixed for the component's
// lifetime (observe() is only called once, for whatever's registered by the
// time the effect runs) — true for PetsCarousel's pets, which are fetched
// once server-side and never added to or removed from after mount. A caller
// with a genuinely dynamic list would need this to observe/unobserve as
// elements are registered, not just once.
export function useCenteredCard(initialId: string | undefined) {
  const [centeredId, setCenteredId] = useState(initialId);
  const containerRef = useRef<HTMLDivElement>(null);
  const elements = useRef(new Map<string, HTMLElement>());
  // Latest known ratio per element, persisted across callbacks — a callback
  // only reports entries whose ratio crossed a threshold since last time, so
  // an element that's been sitting at ratio 1 throughout a scroll (nothing
  // changed for it) wouldn't otherwise be considered at all.
  const ratios = useRef(new Map<string, number>());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // observe() itself fires an initial callback with every element at
    // once — on a wide viewport where nothing needs to scroll, they all tie
    // at ratio 1. Deliberately not running the geometry-based tie-break on
    // this batch: for an even number of fully-visible cards, "closest to
    // container center" has no unique answer (two cards are equidistant),
    // so it would pick one arbitrarily instead of honoring `initialId`.
    // Skipping this batch keeps the initial selection stable until the user
    // actually scrolls the strip, which is the one thing "closest to
    // center" can't be ambiguous about.
    let isInitialBatch = true;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.getAttribute("data-centered-card-id");
          if (id) ratios.current.set(id, entry.intersectionRatio);
        }

        if (isInitialBatch) {
          isInitialBatch = false;
          return;
        }

        // Closest-to-center wins, not highest ratio — with snap-mandatory,
        // ties at ratio 1 are common (peeking neighbor cards), and center
        // distance is what "which one is centered" actually means here.
        // Recomputed over every registered element's latest known ratio and
        // live geometry, not just this callback's entries.
        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;
        let bestId: string | null = null;
        let bestDistance = Infinity;
        elements.current.forEach((el, id) => {
          if ((ratios.current.get(id) ?? 0) < 0.6) return;
          const rect = el.getBoundingClientRect();
          const distance = Math.abs(
            rect.left + rect.width / 2 - containerCenter,
          );
          if (distance < bestDistance) {
            bestId = id;
            bestDistance = distance;
          }
        });
        if (bestId) setCenteredId(bestId);
      },
      { root: container, threshold: [0.6, 0.75, 0.9, 1] },
    );

    elements.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function register(id: string) {
    return (el: HTMLElement | null) => {
      if (el) elements.current.set(id, el);
      else elements.current.delete(id);
    };
  }

  return { centeredId, containerRef, register };
}
