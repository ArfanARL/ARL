"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell, PageHeader, api, fmtDate } from "./shared";

type Dash = {
  enquiries: { total: number; last7Days: number; byStatus: { status: string; count: number }[]; recent: { id: string; name: string; organisation?: string; status: string; createdAtUtc: string; preview: string }[] };
  content: { type: string; total: number; published: number }[];
  pages: number;
  users: number | null;
  activity: { id: string; atUtc: string; actor: string; action: string; entity: string; detail?: string }[];
};
const typeLabel: Record<string, string> = { project: "Projects", research: "Research", leader: "Leadership" };

export default function AdminHome() {
  const [d, setD] = useState<Dash | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api<Dash>("/api/v1/admin/dashboard").then(setD).catch((e) => setError(e.message)); }, []);

  const count = (s: string) => d?.enquiries.byStatus.find((x) => x.status === s)?.count ?? 0;
  const published = d?.content.reduce((a, c) => a + c.published, 0) ?? 0;
  const totalContent = d?.content.reduce((a, c) => a + c.total, 0) ?? 0;

  return (
    <AdminShell>
      <PageHeader eyebrow="Control panel" title="Dashboard" lead="Enquiries, website content and recent activity at a glance." actions={<><Link className="admin-btn" href="/admin/enquiries">Review enquiries</Link><Link className="admin-btn secondary" href="/admin/entries/project">Edit projects</Link></>} />
      {error && <p className="admin-error">{error}</p>}
      {!d && !error && <p className="admin-muted">Loading…</p>}
      {d && (
        <>
          <div className="admin-cards">
            <div className="admin-card"><span>Awaiting response</span><strong>{count("new")}</strong><small>new enquiries</small></div>
            <div className="admin-card"><span>Last 7 days</span><strong>{d.enquiries.last7Days}</strong><small>{d.enquiries.total} enquiries in total</small></div>
            <div className="admin-card"><span>Published content</span><strong>{published}</strong><small>of {totalContent} managed entries</small></div>
            <div className="admin-card"><span>{d.users === null ? "Pages" : "Users"}</span><strong>{d.users ?? d.pages}</strong><small>{d.users === null ? "CMS pages" : "admin accounts"}</small></div>
          </div>

          {totalContent === 0 && (
            <p className="admin-info">The public website is currently showing its built-in content. Open <Link href="/admin/entries/project"><b>Projects</b></Link> and choose “Import current site content” to start managing it here.</p>
          )}

          <div className="admin-grid-2">
            <div className="admin-panel">
              <div className="admin-panel-head"><h2>Recent enquiries</h2><Link className="admin-btn secondary small" href="/admin/enquiries">View all</Link></div>
              {d.enquiries.recent.length === 0 && <p className="admin-empty">No enquiries yet.</p>}
              <div className="admin-table-wrap">
                <table className="admin-table"><tbody>
                  {d.enquiries.recent.map((e) => (
                    <tr key={e.id}>
                      <td><b>{e.name}</b>{e.organisation ? <><br /><span className="admin-muted">{e.organisation}</span></> : null}</td>
                      <td className="clip">{e.preview}</td>
                      <td><span className={`admin-status ${e.status}`}>{e.status.replace("_", " ")}</span><br /><small className="admin-muted">{fmtDate(e.createdAtUtc)}</small></td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
            </div>

            <div>
              <div className="admin-panel">
                <h2>Content</h2>
                <table className="admin-table"><tbody>
                  {["project", "research", "leader"].map((t) => {
                    const c = d.content.find((x) => x.type === t);
                    return (<tr key={t}><td><Link href={`/admin/entries/${t}`}><b>{typeLabel[t]}</b></Link></td><td>{c ? `${c.published} published / ${c.total}` : "built-in"}</td></tr>);
                  })}
                  <tr><td><Link href="/admin/content"><b>Pages</b></Link></td><td>{d.pages}</td></tr>
                </tbody></table>
              </div>
              {d.users !== null && (
                <div className="admin-panel">
                  <div className="admin-panel-head"><h2>Recent activity</h2><Link className="admin-btn secondary small" href="/admin/audit">Audit log</Link></div>
                  {d.activity.length === 0 && <p className="admin-empty">No activity recorded.</p>}
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
                    {d.activity.map((a) => (
                      <li key={a.id}><b>{a.action}</b> <span className="admin-muted">· {a.actor}</span><br /><small className="admin-muted">{fmtDate(a.atUtc)}{a.detail ? ` — ${a.detail}` : ""}</small></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
