import { useState } from "react";
import Stat from "../components/Stat.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import { api } from "../services/api.js";
import { shortDate } from "../utils/date.js";

export default function Profile({ showFlash }) {
  const { cache, invalidate } = useAppData();
  const profile = cache.profile ?? null;

  const [form, setForm] = useState({ current_password: "", new_password: "", confirm_password: "" });

  async function changePassword(event) {
    event.preventDefault();
    await api("/api/profile/change-password", { method: "POST", body: JSON.stringify(form) });
    setForm({ current_password: "", new_password: "", confirm_password: "" });
    showFlash("Password changed.");
    invalidate("profile");    // refresh profile in cache
  }

  if (!profile) return <div className="empty-state">Loading profile…</div>;
  const { user, stats } = profile;

  return (
    <>
      <h1>Profile</h1>
      <div className="profile-header">
        <div className="profile-avatar">{user.username[0].toUpperCase()}</div>
        <div className="profile-info">
          <h2>{user.username}</h2>
          <p>Member since {shortDate(user.created_at)}</p>
        </div>
      </div>
      <section className="profile-section">
        <div className="profile-section-title">Account Details</div>
        <ProfileField label="Username"        value={user.username} />
        <ProfileField label="Account Created" value={new Date(user.created_at).toLocaleString()} />
        <ProfileField label="User ID"         value={`${user.id.slice(0, 12)}...`} />
      </section>
      <section className="profile-section">
        <div className="profile-section-title">Your Stats</div>
        <div className="profile-stats">
          <Stat label="Total Tasks" value={stats.total_tasks} />
          <Stat label="Active"      value={stats.active_tasks} />
          <Stat label="Completed"   value={stats.completed_tasks} />
          <Stat label="Snippets"    value={stats.code_snippets} />
          <Stat label="Notes"       value={stats.notes} />
        </div>
      </section>
      <section className="profile-section">
        <div className="profile-section-title">Change Password</div>
        <form className="profile-form" onSubmit={changePassword}>
          <label>Current Password
            <input type="password" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} required />
          </label>
          <label>New Password
            <input type="password" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} required minLength="6" />
          </label>
          <label>Confirm New Password
            <input type="password" value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} required minLength="6" />
          </label>
          <button className="btn-primary">Change password</button>
        </form>
      </section>
    </>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className="profile-field">
      <span className="profile-field-label">{label}</span>
      <span className="profile-field-value">{value}</span>
    </div>
  );
}
