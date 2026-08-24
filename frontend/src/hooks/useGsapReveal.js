/**
 * useGsapReveal — generic stagger-in hook.
 * Usage: const ref = useGsapReveal(".child-selector", { delay: 0.1 });
 * Place the returned ref on the parent container.
 */
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function useGsapReveal(selector = "*", options = {}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        selector,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: options.duration ?? 0.45,
          ease: options.ease ?? "power3.out",
          stagger: options.stagger ?? 0.07,
          delay: options.delay ?? 0,
        }
      );
    }, containerRef);

    return () => ctx.revert();
  // Re-run when a dependency key changes (e.g. the list length)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.dep]);

  return containerRef;
}
