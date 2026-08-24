import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const STEPS = [
  { label: "AUTH",    pct: 12 },
  { label: "TASKS",   pct: 35 },
  { label: "HISTORY", pct: 55 },
  { label: "CODES",   pct: 72 },
  { label: "NOTES",   pct: 85 },
  { label: "PROFILE", pct: 96 },
  { label: "READY",   pct: 100 },
];

const STEP_DELAYS = [0, 420, 560, 500, 460, 480, 440];

export default function LoadingScreen({ onDone }) {
  const rootRef    = useRef(null);
  const brandRef   = useRef(null);
  const counterRef = useRef(null);
  const barFillRef = useRef(null);
  const barGlowRef = useRef(null);
  const labelRef   = useRef(null);
  const dotsRef    = useRef(null);

  const [stepIdx,    setStepIdx]    = useState(0);
  const [labelText,  setLabelText]  = useState("INIT");
  const counterVal   = useRef({ n: 0 });

  // ── entrance animations on mount ────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Brand slides down + fade
      tl.fromTo(
        brandRef.current,
        { opacity: 0, y: -28 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
      );

      // Counter group scales up
      tl.fromTo(
        counterRef.current,
        { opacity: 0, scale: 0.88 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.4)" },
        "-=0.35"
      );

      // Bar track slides in
      tl.fromTo(
        ".ls-bar-track",
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.5, ease: "power2.out" },
        "-=0.2"
      );

      // Status row fades in
      tl.fromTo(
        ".ls-status",
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        "-=0.15"
      );

      // Dots scatter in with stagger
      tl.fromTo(
        ".ls-dot",
        { opacity: 0, scale: 0 },
        {
          opacity: 0.18,
          scale: 1,
          duration: 0.6,
          ease: "back.out(2)",
          stagger: { amount: 0.8, from: "random" },
        },
        0
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // ── drive counter + bar through steps ───────────────────────────────────────
  useEffect(() => {
    const delays = STEP_DELAYS;
    let timeout;

    function advance(idx) {
      if (idx >= STEPS.length) return;

      timeout = setTimeout(() => {
        const { label, pct } = STEPS[idx];

        // GSAP tween the numeric counter
        gsap.to(counterVal.current, {
          n: pct,
          duration: 0.65,
          ease: "power1.inOut",
          onUpdate() {
            if (counterRef.current) {
              const digits = String(Math.floor(counterVal.current.n)).padStart(3, "0");
              // Write directly to the span to avoid React state re-renders
              const span = counterRef.current.querySelector(".ls-pct");
              if (span) span.textContent = digits;
            }
          },
        });

        // GSAP tween the bar fill width
        gsap.to(barFillRef.current, {
          width: `${pct}%`,
          duration: 0.65,
          ease: "power1.inOut",
        });

        // GSAP tween the glow dot's left position
        gsap.to(barGlowRef.current, {
          left: `${pct}%`,
          duration: 0.65,
          ease: "power1.inOut",
        });

        // Animate in the new label
        setLabelText(label);
        gsap.fromTo(
          labelRef.current,
          { opacity: 0, y: 5 },
          { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
        );

        setStepIdx(idx);

        if (idx === STEPS.length - 1) {
          // At 100% — exit after a brief hold
          setTimeout(exitAnimation, 700);
        } else {
          advance(idx + 1);
        }
      }, delays[idx]);
    }

    advance(0);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exitAnimation() {
    gsap.to(rootRef.current, {
      opacity: 0,
      scale: 1.018,
      duration: 0.55,
      ease: "power2.in",
      onComplete: onDone,
    });
  }

  return (
    <div ref={rootRef} className="ls-root">
      {/* Noise grain */}
      <div className="ls-noise" />

      {/* Floating dots */}
      <ul ref={dotsRef} className="ls-dots" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <li key={i} className="ls-dot" />
        ))}
      </ul>

      {/* Brand */}
      <div ref={brandRef} className="ls-brand">
        <span className="ls-brand-text">SMARTER</span>
        <span className="ls-brand-sub">TASKING</span>
      </div>

      {/* Counter */}
      <div ref={counterRef} className="ls-counter">
        <span className="ls-pct">000</span>
        <span className="ls-pct-sym">%</span>
      </div>

      {/* Progress bar */}
      <div className="ls-bar-track">
        <div ref={barFillRef} className="ls-bar-fill" style={{ width: "0%" }} />
        <div ref={barGlowRef} className="ls-bar-glow"  style={{ left: "0%" }} />
      </div>

      {/* Status label */}
      <div className="ls-status">
        <span className="ls-step-dot" />
        <span ref={labelRef} className="ls-step-label">{labelText}</span>
      </div>
    </div>
  );
}
