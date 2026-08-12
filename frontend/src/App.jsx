import { useEffect, useState } from "react";
import { api } from "./services/api.js";
import AppHeader from "./components/AppHeader.jsx";
import AuthView from "./pages/AuthView.jsx";
import Codes from "./pages/Codes.jsx";
import History from "./pages/History.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Notes from "./pages/Notes.jsx";
import Profile from "./pages/Profile.jsx";
import Tasks from "./pages/Tasks.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [page, setPage] = useState("landing");
  const [authMode, setAuthMode] = useState("login");
  const [flash, setFlash] = useState(null);

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

  if (checkingAuth) return <div className="boot">SMARTER</div>;

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
    <>
      <AppHeader user={user} page={page} setPage={setPage} logout={logout} />
      <main className={`container ${["history", "codes", "notes"].includes(page) ? "container-grid" : ""}`}>
        {flash && <div className={`flash flash-${flash.type}`}>{flash.message}</div>}
        {page === "daily" && <Tasks type="daily" showFlash={showFlash} />}
        {page === "periodic" && <Tasks type="periodic" showFlash={showFlash} />}
        {page === "history" && <History />}
        {page === "codes" && <Codes showFlash={showFlash} />}
        {page === "notes" && <Notes showFlash={showFlash} />}
        {page === "profile" && <Profile showFlash={showFlash} />}
      </main>
    </>
  );
}
