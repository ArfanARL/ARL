"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell, Notice, PageHeader, api, getUser, useNotice } from "../shared";

type U = { id: string; email: string; displayName: string; isEnabled: boolean; role: string; lockedOut?: boolean };
const blank = { email: "", displayName: "", role: "Editor", password: "" };

export default function UsersAdmin() {
  const [users, setUsers] = useState<U[]>([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<U | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const n = useNotice();
  const me = getUser()?.email;

  const load = useCallback(async () => { try { setUsers(await api<U[]>("/api/v1/admin/users")); } catch (e: any) { n.setErr(e.message); } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { load(); }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    try { await api("/api/v1/admin/users", { method: "POST", body: JSON.stringify(form) }); setForm(blank); await load(); n.setOk("User created. Share the temporary password securely and ask them to change it from My account."); } catch (err: any) { n.setErr(err.message); }
  }
  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      await api(`/api/v1/admin/users/${editing.id}`, { method: "PUT", body: JSON.stringify({ displayName: editing.displayName, role: editing.role, isEnabled: editing.isEnabled, newPassword: newPassword || undefined }) });
      setEditing(null); setNewPassword(""); await load(); n.setOk("User updated.");
    } catch (err: any) { n.setErr(err.message); }
  }

  return (
    <AdminShell adminOnly>
      <PageHeader eyebrow="System" title="Users & roles" lead="Administrators manage everything. Editors can edit content and handle enquiries but cannot delete content, manage users or view the audit log." />
      <Notice ok={n.ok} err={n.err} />
      <div className="admin-grid-2">
        <div className="admin-panel">
          <h2>Accounts ({users.length})</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Role</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td><b>{u.displayName}</b>{u.email === me ? " (you)" : ""}<br /><span className="admin-muted">{u.email}</span></td>
                    <td>{u.role}</td>
                    <td><span className={`admin-status ${u.isEnabled ? "published" : "draft"}`}>{u.isEnabled ? "Active" : "Disabled"}</span>{u.lockedOut ? <><br /><small className="admin-muted">locked out</small></> : null}</td>
                    <td><button className="admin-btn secondary small" onClick={() => { setEditing({ ...u }); setNewPassword(""); n.clear(); }}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          {editing ? (
            <form className="admin-panel admin-form" onSubmit={saveEdit}>
              <h2>Edit {editing.email}</h2>
              <label htmlFor="e-name">Display name</label>
              <input id="e-name" className="admin-input" required value={editing.displayName} onChange={(e) => setEditing({ ...editing, displayName: e.target.value })} />
              <label htmlFor="e-role">Role</label>
              <select id="e-role" className="admin-select" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })}><option>Administrator</option><option>Editor</option></select>
              <label className="admin-check"><input type="checkbox" checked={editing.isEnabled} onChange={(e) => setEditing({ ...editing, isEnabled: e.target.checked })} /> Account enabled</label>
              <label htmlFor="e-pw">Reset password <span className="admin-help">leave blank to keep the current password</span></label>
              <input id="e-pw" className="admin-input" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <div className="admin-actions" style={{ marginTop: 16 }}><button className="admin-btn">Save changes</button><button type="button" className="admin-btn secondary" onClick={() => setEditing(null)}>Cancel</button></div>
            </form>
          ) : (
            <form className="admin-panel admin-form" onSubmit={create}>
              <h2>Add user</h2>
              <label htmlFor="n-email">Email address</label>
              <input id="n-email" className="admin-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <label htmlFor="n-name">Display name</label>
              <input id="n-name" className="admin-input" required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
              <label htmlFor="n-role">Role</label>
              <select id="n-role" className="admin-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option>Editor</option><option>Administrator</option></select>
              <label htmlFor="n-pw">Temporary password <span className="admin-help">at least 14 characters with upper, lower, digit and symbol</span></label>
              <input id="n-pw" className="admin-input" type="password" required autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <div className="admin-actions" style={{ marginTop: 16 }}><button className="admin-btn">Create user</button></div>
            </form>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
