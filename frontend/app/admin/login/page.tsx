"use client";

import { useState } from "react";
import { API, saveSession } from "../shared";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await fetch(`${API}/api/v1/admin/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      if (r.status === 429) throw new Error("Too many attempts. Please wait a few minutes and try again.");
      if (!r.ok) throw new Error(r.status === 401 ? "Invalid credentials." : "Unable to sign in. Check the API connection.");
      const d = await r.json();
      saveSession(d.accessToken, { displayName: d.user.displayName, email: d.user.email, roles: d.user.roles });
      window.location.href = "/admin";
    } catch (err: any) {
      setError(err.message === "Failed to fetch" ? "Cannot reach the API. Check that the Core API is running." : err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-wrap">
      <div className="admin-login">
        <p className="admin-eyebrow">Agentic Research Labs / Administration</p>
        <h1>Administrator sign in</h1>
        <p className="admin-muted">Use your authorised account to manage the website.</p>
        <form className="admin-form" onSubmit={submit} style={{ marginTop: 18 }}>
          <label htmlFor="email">Email address</label>
          <input id="email" className="admin-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          <label htmlFor="password">Password</label>
          <input id="password" className="admin-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          {error && <p className="admin-error" role="alert" style={{ marginTop: 14 }}>{error}</p>}
          <button className="admin-btn" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>
        <p className="admin-muted" style={{ marginTop: 22, fontSize: 12 }}>Access is restricted to authorised personnel. Activity is logged.</p>
      </div>
    </div>
  );
}
