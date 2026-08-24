import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Modal({ title, children, onClose, wide = false }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  // ── Entrance ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Overlay fades in
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" }
      );
      // Panel scales up + slides in
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, scale: 0.92, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.38, ease: "back.out(1.6)" }
      );
    });
    return () => ctx.revert();
  }, []);

  // ── Close with exit animation ─────────────────────────────────────────────
  function handleClose() {
    gsap.to(contentRef.current, {
      opacity: 0,
      scale: 0.94,
      y: 12,
      duration: 0.22,
      ease: "power2.in",
    });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.22,
      ease: "power2.in",
      onComplete: onClose,
    });
  }

  return (
    <div
      ref={overlayRef}
      className="modal-overlay active"
      style={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && handleClose()}
    >
      <section
        ref={contentRef}
        className={`modal-content ${wide ? "modal-content-wide" : ""}`}
        style={{ opacity: 0 }}
      >
        <div className="view-modal-header">
          <h2>{title}</h2>
          <button className="view-action-btn" onClick={handleClose}>x</button>
        </div>
        {children}
      </section>
    </div>
  );
}
