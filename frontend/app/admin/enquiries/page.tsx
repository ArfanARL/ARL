"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell, Notice, PageHeader, api, downloadCsv, fmtDate, getUser, isAdministrator, useNotice } from "../shared";

type Enquiry = { id: string; name: string; email: string; organisation?: string; message: string; status: string; createdAtUtc: string; notes?: string };
const STATUSES = [["new", "New"], ["in_review", "In review"], ["responded", "Responded"], ["closed", "Closed"]];
const PAGE = 25;

export default function Enquiries() {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [notes, setNotes] = useState("");
  const n = useNotice();
  const admin = isAdministrator(getUser());

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE) });
      if (status) params.set("status", status);
      if (query) params.set("q", query);
      const d = await api(`/api/v1/admin/contact-enquiries?${params}`);
      setItems(d.items || []);
      setTotal(d.total || 0);
    } catch (e: any) { n.setErr(e.message); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, query]);
  useEffect(() => { load(); }, [load]);

  function open(e: Enquiry) { setSelected(e); setNotes(e.notes || ""); n.clear(); }

  async function patch(body: object, message: string) {
    if (!selected) return;
    try {
      const updated = await api<Enquiry>(`/api/v1/admin/contact-enquiries/${selected.id}`, { method: "PATCH", body: JSON.stringify(body) });
      setSelected(updated);
      setItems((list) => list.map((x) => (x.id === updated.id ? updated : x)));
      n.setOk(message);
    } catch (e: any) { n.setErr(e.message); }
  }
  async function remove() {
    if (!selected || !confirm(`Permanently delete the enquiry from ${selected.name}? This cannot be undone.`)) return;
    try { await api(`/api/v1/admin/contact-enquiries/${selected.id}`, { method: "DELETE" }); setSelected(null); n.setOk("Enquiry deleted."); load(); } catch (e: any) { n.setErr(e.message); }
  }
  async function exportCsv() {
    try { await downloadCsv(`/api/v1/admin/contact-enquiries/export.csv${status ? `?status=${status}` : ""}`, "enquiries.csv"); n.setOk("Export downloaded."); } catch (e: any) { n.setErr(e.message); }
  }
  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <AdminShell>
      <PageHeader eyebrow="Inbox" title="Contact enquiries" lead="Review, respond to and track enquiries from the website contact form." actions={<button className="admin-btn secondary" onClick={exportCsv}>Export CSV</button>} />
      <Notice ok={n.ok} err={n.err} />
      <form className="admin-toolbar" onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(q); }}>
        <input className="admin-input grow" placeholder="Search name, email, organisation or message…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search enquiries" />
        <select className="admin-select" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} aria-label="Filter by status">
          <option value="">All statuses</option>{STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button className="admin-btn secondary">Search</button>
      </form>

      <div className="admin-split" style={{ gridTemplateColumns: selected ? "minmax(0,1.5fr) minmax(320px,1fr)" : "1fr" }}>
        <div className="admin-panel" style={{ marginBottom: 0 }}>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Received</th><th>Contact</th><th>Message</th><th>Status</th></tr></thead>
              <tbody>
                {items.map((x) => (
                  <tr key={x.id} className={selected?.id === x.id ? "is-selected" : ""} onClick={() => open(x)} style={{ cursor: "pointer" }}>
                    <td style={{ whiteSpace: "nowrap" }}>{fmtDate(x.createdAtUtc)}</td>
                    <td><b>{x.name}</b><br /><span className="admin-muted">{x.email}</span>{x.organisation ? <><br /><span className="admin-muted">{x.organisation}</span></> : null}</td>
                    <td className="clip">{x.message.length > 110 ? x.message.slice(0, 110) + "…" : x.message}</td>
                    <td><span className={`admin-status ${x.status}`}>{x.status.replace("_", " ")}</span>{x.notes ? <><br /><small className="admin-muted">has notes</small></> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {items.length === 0 && <p className="admin-empty">No enquiries found.</p>}
          <div className="admin-pager">
            <span>{total} {total === 1 ? "enquiry" : "enquiries"}</span>
            <span className="admin-actions">
              <button className="admin-btn secondary small" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span>Page {page} of {pages}</span>
              <button className="admin-btn secondary small" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
            </span>
          </div>
        </div>

        {selected && (
          <aside className="admin-panel admin-detail" style={{ marginBottom: 0 }} aria-label="Enquiry details">
            <div className="admin-panel-head"><h2>Enquiry</h2><button className="admin-btn secondary small" onClick={() => setSelected(null)}>Close</button></div>
            <dl>
              <dt>From</dt><dd>{selected.name}</dd>
              <dt>Email</dt><dd><a href={`mailto:${selected.email}?subject=Re: your enquiry to Agentic Research Labs`}>{selected.email}</a></dd>
              {selected.organisation && (<><dt>Organisation</dt><dd>{selected.organisation}</dd></>)}
              <dt>Received</dt><dd>{fmtDate(selected.createdAtUtc)}</dd>
            </dl>
            <div className="admin-message">{selected.message}</div>
            <label className="admin-label" htmlFor="enq-status">Status</label>
            <select id="enq-status" className="admin-select" value={selected.status} onChange={(e) => patch({ status: e.target.value }, "Status updated.")}>
              {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <label className="admin-label" htmlFor="enq-notes">Internal notes <span className="admin-help">visible to staff only</span></label>
            <textarea id="enq-notes" className="admin-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={4000} />
            <div className="admin-actions" style={{ marginTop: 12 }}>
              <button className="admin-btn" onClick={() => patch({ notes }, "Notes saved.")}>Save notes</button>
              <a className="admin-btn secondary" href={`mailto:${selected.email}?subject=Re: your enquiry to Agentic Research Labs`}>Reply by email</a>
              {admin && <button className="admin-btn danger" onClick={remove}>Delete</button>}
            </div>
          </aside>
        )}
      </div>
    </AdminShell>
  );
}
