export default function AppHeader({ user, page, setPage, logout }) {
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
        <button className="username" onClick={() => setPage("profile")}>
          signed in as <span>{user.username}</span>
        </button>
        <button className="logout" onClick={logout}>Log out</button>
      </div>
    </header>
  );
}
