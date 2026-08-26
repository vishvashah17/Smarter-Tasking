import { useEffect, useState } from "react";
import { api } from "../services/api.js";

export default function AuthView({ initialMode = "login", onLogin, onBack, showFlash, flash }) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ username: "", password: "", confirm_password: "" });

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  async function submit(event) {
    event.preventDefault();
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const data = await api(path, { method: "POST", body: JSON.stringify(form) });
      onLogin(data.user);
    } catch (err) {
      showFlash(err.message, "error");
    }
  }

  return (
    <main className="auth-wrapper">
      <section className="auth-panel">
        <div className="auth-box">
          <button className="auth-back" type="button" onClick={onBack}>Back to overview</button>
          <div className="auth-header">
            <img className="brand-logo auth-logo" src="/weblogo.png" alt="SmarterTasking" />
            <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>
            <p>{mode === "login" ? "Sign in to continue planning your work" : "Create your workspace and start organizing tasks"}</p>
          </div>
          {flash && <div className={`flash flash-${flash.type}`}>{flash.message}</div>}
          <form onSubmit={submit}>
            <label>Username
              <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required />
            </label>
            <label>Password
              <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength="6" />
            </label>
            {mode === "signup" && (
              <label>Confirm Password
                <input type="password" value={form.confirm_password} onChange={(event) => setForm({ ...form, confirm_password: event.target.value })} required minLength="6" />
              </label>
            )}
            <button type="submit">{mode === "login" ? "Log in" : "Sign up"}</button>
          </form>
          <div className="auth-footer">
            {mode === "login" ? "Need an account? " : "Already have an account? "}
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")}>
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
