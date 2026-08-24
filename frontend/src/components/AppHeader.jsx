import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function AppHeader({ user, page, setPage, logout, theme, toggleTheme }) {
  const headerRef = useRef(null);

  const links = [
    ["daily",    "Daily"],
    ["periodic", "Periodic"],
    ["history",  "History"],
    ["codes",    "Codes"],
    ["notes",    "Notes"],
  ];

  // ── Slide the whole header down once on first render ──────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: -64, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }
      );

      // Nav links stagger in
      gsap.fromTo(
        ".nav-links button",
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: 0.06, delay: 0.2 }
      );

      // Right-side actions fade in
      gsap.fromTo(
        ".nav-user > *",
        { opacity: 0, x: 12 },
        { opacity: 1, x: 0, duration: 0.35, ease: "power2.out", stagger: 0.08, delay: 0.3 }
      );
    }, headerRef);

    return () => ctx.revert();
  }, []);

  return (
    <header ref={headerRef} className="navbar app-header">
      <button className="nav-brand" onClick={() => setPage("daily")}>
        <span className="nav-brand-text">SMARTER</span>
      </button>
      <nav className="nav-links">
        {links.map(([id, label]) => (
          <button key={id} className={page === id ? "active" : ""} onClick={() => setPage(id)}>
            {label}
          </button>
        ))}
      </nav>
      <div className="nav-user">
        <button
          className="theme-toggle nav-block-btn"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
        <button
          className={`username nav-block-btn ${page === "profile" ? "active" : ""}`}
          onClick={() => setPage("profile")}
          title="View Profile"
        >
          signed in as <span>{user.username}</span>
        </button>
        <button className="logout nav-block-btn" onClick={logout}>
          Log out
        </button>
      </div>
    </header>
  );
}
