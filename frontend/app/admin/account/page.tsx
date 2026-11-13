"use client";

import { useState } from "react";
import { AdminShell, Notice, PageHeader, api, getUser, useNotice } from "../shared";

export default function Account() {
  const user = getUser();
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const n = useNotice();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== again) return n.setErr("The new passwords do not match.");
    try {
      await api("/api/v1/admin/auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword: cur, newPassword: next }) });
      setCur(""); setNext(""); setAgain("");
      n.setOk("Password changed.");
    } catch (err: any) { n.setErr(err.message); }
  }

  return (
    <AdminShell>
      <PageHeader eyebrow="Account" title="My account" lead="Your sign-in details and password." />
      <div className="admin-grid-2">
        <div className="admin-panel">
          <h2>Profile</h2>
          <p><b>{user?.displayName}</b><br /><span className="admin-muted">{user?.email}</span></p>
          <p>Role: <span className="admin-status published">{user?.roles?.join(", ")}</span></p>
          <p className="admin-muted" style={{ fontSize: 12 }}>Sessions last 30 minutes and are cleared when the browser tab is closed.</p>
        </div>
        <form className="admin-panel admin-form" onSubmit={submit}>
          <h2>Change password</h2>
          <Notice ok={n.ok} err={n.err} />
          <label htmlFor="p-cur">Current password</label>
          <input id="p-cur" className="admin-input" type="password" required autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} />
          <label htmlFor="p-new">New password <span className="admin-help">14+ characters with upper, lower, digit and symbol</span></label>
          <input id="p-new" className="admin-input" type="password" required autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
          <label htmlFor="p-again">Repeat new password</label>
          <input id="p-again" className="admin-input" type="password" required autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} />
          <div className="admin-actions" style={{ marginTop: 16 }}><button className="admin-btn">Change password</button></div>
        </form>
      </div>
    </AdminShell>
  );
}
