import { useEffect, useRef, useState } from "react";

const STEPS = [
  { label: "AUTH",      pct: 12 },
  { label: "TASKS",     pct: 35 },
  { label: "HISTORY",   pct: 55 },
  { label: "CODES",     pct: 72 },
  { label: "NOTES",     pct: 85 },
  { label: "PROFILE",   pct: 96 },
  { label: "READY",     pct: 100 },
];

export default function LoadingScreen() {
  const [displayPct, setDisplayPct]   = useState(0);
  const [stepIdx,    setStepIdx]      = useState(0);
  const [done,       setDone]         = useState(false);
  const rafRef = useRef(null);
  const currentRef = useRef(0);

  // Drive the counter toward the next target percentage
  useEffect(() => {
    const target = STEPS[stepIdx]?.pct ?? 100;

    function tick() {
      const diff = target - currentRef.current;
      if (diff <= 0) return;
      // Ease-out: move faster when far away, slower near target
      const step = Math.max(0.4, diff * 0.045);
      currentRef.current = Math.min(target, currentRef.current + step);
      setDisplayPct(Math.floor(currentRef.current));
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [stepIdx]);

  // Advance through steps on a realistic schedule
  useEffect(() => {
    const delays = [380, 520, 480, 440, 460, 420, 0];
    let t;
    function schedule(idx) {
      if (idx >= STEPS.length) return;
      t = setTimeout(() => {
        setStepIdx(idx);
        if (idx === STEPS.length - 1) {
          // brief pause at 100% before revealing app
          setTimeout(() => setDone(true), 600);
        } else {
          schedule(idx + 1);
        }
      }, delays[idx]);
    }
    schedule(0);
    return () => clearTimeout(t);
  }, []);

  const label = STEPS[Math.min(stepIdx, STEPS.length - 1)]?.label ?? "READY";

  return (
    <div className={`ls-root${done ? " ls-exit" : ""}`}>
      {/* Noise overlay */}
      <div className="ls-noise" />

      {/* Floating grid dots */}
      <ul className="ls-dots" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <li key={i} className="ls-dot" style={{ "--i": i }} />
        ))}
      </ul>

      {/* Brand */}
      <div className="ls-brand">
        <span className="ls-brand-text">SMARTER</span>
        <span className="ls-brand-sub">TASKING</span>
      </div>

      {/* Counter */}
      <div className="ls-counter">
        <span className="ls-pct">{String(displayPct).padStart(3, "0")}</span>
        <span className="ls-pct-sym">%</span>
      </div>

      {/* Progress bar */}
      <div className="ls-bar-track">
        <div className="ls-bar-fill" style={{ width: `${displayPct}%` }} />
        <div className="ls-bar-glow"  style={{ left:  `${displayPct}%` }} />
      </div>

      {/* Status label */}
      <div className="ls-status">
        <span className="ls-step-dot" />
        <span className="ls-step-label">{label}</span>
      </div>
    </div>
  );
}
