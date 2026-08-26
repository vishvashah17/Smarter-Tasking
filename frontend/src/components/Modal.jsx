import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";

export default function Modal({ title, children, onClose, wide = false, icon = "✦", sharp = false }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  // ── Lock page scroll while open ───────────────────────────────────────────
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // ── Entrance ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    const ctx = gsap.context(() => {
      // Overlay fades in smoothly
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" }
      );
      // Panel spring animation
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, scale: 0.94, y: 16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "back.out(1.4)" }
      );
      // Stagger entry of form groups / action items strictly inside contentRef
      const animTargets = contentRef.current?.querySelectorAll(
        ".form-group, .modal-actions, .view-modal-body, .view-modal-meta"
      );
      if (animTargets && animTargets.length > 0) {
        gsap.fromTo(
          animTargets,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.28, ease: "power3.out", stagger: 0.05, delay: 0.05 }
        );
      }
    }, contentRef);
    return () => ctx.revert();
  }, []);

  // ── Close with exit animation ─────────────────────────────────────────────
  function handleClose() {
    gsap.to(contentRef.current, {
      opacity: 0,
      scale: 0.95,
      y: 12,
      duration: 0.18,
      ease: "power2.in",
    });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.18,
      ease: "power2.in",
      onComplete: onClose,
    });
  }

  return createPortal(
    <div
      ref={overlayRef}
      className="modal-overlay active"
      onMouseDown={(e) => e.target === e.currentTarget && handleClose()}
    >
      <section
        ref={contentRef}
        className={`modal-content ${wide ? "modal-content-wide" : ""} ${sharp ? "modal-content-sharp" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="view-modal-header">
          <div className="modal-title-group">
            {icon ? <span className="modal-title-badge">{icon}</span> : null}
            <h2 id="modal-title">{title}</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close modal"
          >
            x
          </button>
        </div>
        <div className="modal-body-container">
          {children}
        </div>
      </section>
    </div>,
    document.body
  );
}

