import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
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
import LoadingScreen from "./components/LoadingScreen.jsx";

// ─── Boot screen (auth-check only — very brief) ───────────────────────────────
function BootScreen() {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.4)" }
    );
  }, []);
  return (
    <div className="boot" ref={ref}>
      SMARTER
    </div>
  );
}

// ─── Page wrapper — animates on every page change ────────────────────────────
function PageTransition({ page, children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.38, ease: "power3.out" }
    );
  }, [page]);

  return (
    <div ref={ref}>
      {children}
    </div>
  );
}

// ─── Inner app (has access to AppDataContext) ─────────────────────────────────
function AppInner({ user, page, setPage, logout, theme, toggleTheme, flash, showFlash }) {
  const { loading, error, prefetchAll } = useAppData();

  useEffect(() => {
    prefetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingScreen onDone={() => { }} />;

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
      <AppHeader
        user={user}
        page={page}
        setPage={setPage}
        logout={logout}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main
        className={`container ${["history", "codes", "notes"].includes(page) ? "container-grid" : ""
          }`}
      >
        {flash && <div className={`flash flash-${flash.type}`}>{flash.message}</div>}
        <PageTransition page={page}>
          {page === "daily" && <Tasks type="daily" showFlash={showFlash} />}
          {page === "periodic" && <Tasks type="periodic" showFlash={showFlash} />}
          {page === "history" && <History />}
          {page === "codes" && <Codes showFlash={showFlash} />}
          {page === "notes" && <Notes showFlash={showFlash} />}
          {page === "profile" && <Profile showFlash={showFlash} />}
        </PageTransition>
      </main>
    </>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [page, setPage] = useState("landing");
  const [authMode, setAuthMode] = useState("login");
  const [flash, setFlash] = useState(null);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

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

  if (checkingAuth) return <BootScreen />;

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
