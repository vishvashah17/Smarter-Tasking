export default function AppHeader({ user, page, setPage, logout, theme, toggleTheme }) {
  const links = [
    ["daily", "Daily"],
    ["periodic", "Periodic"],
    ["history", "History"],
    ["codes", "Codes"],
    ["notes", "Notes"],
  ];

  return (
    <header className="navbar app-header">
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
