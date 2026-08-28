import { useEffect, useRef, useState } from "react";

// Tracks which of a set of horizontally-scroll-snapped elements is centered
// in their shared scroll container, updating as the user scrolls. Register
// each element with the returned `register(id)` ref callback; `containerRef`
// goes on the scrolling element itself.
//
// Pure DOM-observation mechanism, no knowledge of what the cards contain —
// kept separate from PetsCarousel so that component can stay focused on
// rendering instead of also owning the IntersectionObserver bookkeeping.
export function useCenteredCard(initialId: string | undefined) {
  const [centeredId, setCenteredId] = useState(initialId);
  const containerRef = useRef<HTMLDivElement>(null);
  const elements = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // observe() itself fires an initial callback with every element at
    // once — on a wide viewport where nothing needs to scroll, they all tie
    // at ratio 1, and picking a "winner" from a tie is unstable. Skip that
    // first batch entirely so the initial selection stands until the user
    // actually scrolls the strip.
    let isInitialBatch = true;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isInitialBatch) {
          isInitialBatch = false;
          return;
        }

        // Closest-to-center wins, not highest ratio — with snap-mandatory,
        // ties at ratio 1 are common (peeking neighbor cards), and center
        // distance is what "which one is centered" actually means here.
        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;
        let bestId: string | null = null;
        let bestDistance = Infinity;
        for (const entry of entries) {
          if (entry.intersectionRatio < 0.6) continue;
          const elementCenter =
            entry.boundingClientRect.left + entry.boundingClientRect.width / 2;
          const distance = Math.abs(elementCenter - containerCenter);
          const id = entry.target.getAttribute("data-centered-card-id");
          if (id && distance < bestDistance) {
            bestId = id;
            bestDistance = distance;
          }
        }
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
