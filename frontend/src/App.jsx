import { useEffect, useState } from "react";
import { api } from "./services/api.js";
import { AppDataProvider, useAppData } from "./context/AppDataContext.jsx";
import AppHeader from "./components/AppHeader.jsx";
import AuthView from "./pages/AuthView.jsx";
import Codes from "./pages/Codes.jsx";
import History from "./pages/History.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Notes from "./pages/Notes.jsx";
import Profile from "./pages/Profile.jsx";
import Tasks from "./pages/Tasks.jsx";

// ─── Loading overlay shown while pre-fetching all data ──────────────────────

function DataLoadingScreen() {
  return (
    <div className="boot">
      <div className="boot-spinner" />
      <div className="boot-label">Loading your workspace…</div>
    </div>
  );
}

// ─── Inner app (has access to AppDataContext) ────────────────────────────────

function AppInner({ user, page, setPage, logout, theme, toggleTheme, flash, showFlash }) {
  const { loading, error, prefetchAll } = useAppData();

  // Run the initial pre-fetch once when this component mounts (i.e. right after login).
  useEffect(() => {
    prefetchAll();
  }, []);

  if (loading) return <DataLoadingScreen />;

  if (error) {
    return (
      <div className="boot">
        <div className="boot-label" style={{ color: "var(--danger, #e74c3c)" }}>
          {error}
        </div>
        <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={prefetchAll}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <AppHeader user={user} page={page} setPage={setPage} logout={logout} theme={theme} toggleTheme={toggleTheme} />
      <main className={`container ${["history", "codes", "notes"].includes(page) ? "container-grid" : ""}`}>
        {flash && <div className={`flash flash-${flash.type}`}>{flash.message}</div>}
        {page === "daily"    && <Tasks type="daily"    showFlash={showFlash} />}
        {page === "periodic" && <Tasks type="periodic" showFlash={showFlash} />}
        {page === "history"  && <History />}
        {page === "codes"    && <Codes showFlash={showFlash} />}
        {page === "notes"    && <Notes showFlash={showFlash} />}
        {page === "profile"  && <Profile showFlash={showFlash} />}
      </main>
    </>
  );
}

// ─── Root component ──────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [page, setPage] = useState("landing");
  const [authMode, setAuthMode] = useState("login");
  const [flash, setFlash] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  useEffect(() => {
    api("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setCheckingAuth(false));
  }, []);

  function showFlash(message, type = "success") {
    setFlash({ message, type });
    window.setTimeout(() => setFlash(null), 3200);
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST", body: "{}" });
    setUser(null);
    setPage("landing");
  }

  function openLogin() {
    setAuthMode("login");
    setPage("auth");
  }

  // Checking session cookie
  if (checkingAuth) return <div className="boot">SMARTER</div>;

  // Not logged in
  if (!user) {
    if (page === "auth") {
      return (
        <AuthView
          initialMode={authMode}
          onLogin={(nextUser) => {
            setUser(nextUser);
            setPage("daily");
          }}
          onBack={() => setPage("landing")}
          showFlash={showFlash}
          flash={flash}
        />
      );
    }
    return <LandingPage onLogin={openLogin} />;
  }

  // Logged in — wrap with data provider so all pages share the cache
  return (
    <AppDataProvider>
      <AppInner
        user={user}
        page={page}
        setPage={setPage}
        logout={logout}
        theme={theme}
        toggleTheme={toggleTheme}
        flash={flash}
        showFlash={showFlash}
      />
    </AppDataProvider>
  );
}
