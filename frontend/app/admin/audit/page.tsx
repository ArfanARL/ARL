"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell, Notice, PageHeader, api, fmtDate, useNotice } from "../shared";

type Ev = { id: string; atUtc: string; actor: string; action: string; entity: string; entityId?: string; detail?: string; ip?: string };
const PAGE = 50;

export default function AuditAdmin() {
  const [items, setItems] = useState<Ev[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const n = useNotice();

  const load = useCallback(async () => {
    try {
      const p = new URLSearchParams({ page: String(page), pageSize: String(PAGE) });
      if (query) p.set("q", query);
      const d = await api(`/api/v1/admin/audit?${p}`);
      setItems(d.items); setTotal(d.total);
    } catch (e: any) { n.setErr(e.message); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query]);
  useEffect(() => { load(); }, [load]);
  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <AdminShell adminOnly>
      <PageHeader eyebrow="System" title="Audit log" lead="Sign-ins, content changes, enquiry handling and user administration." />
      <Notice err={n.err} />
      <form className="admin-toolbar" onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(q); }}>
        <input className="admin-input grow" placeholder="Search by user, action, entity or detail…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search audit log" />
        <button className="admin-btn secondary">Search</button>
      </form>
      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>When</th><th>User</th><th>Action</th><th>Entity</th><th>Detail</th><th>IP</th></tr></thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{fmtDate(e.atUtc)}</td><td>{e.actor}</td><td><b>{e.action}</b></td><td>{e.entity}</td><td className="clip">{e.detail}</td><td>{e.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 && <p className="admin-empty">No events found.</p>}
        <div className="admin-pager">
          <span>{total} events</span>
          <span className="admin-actions">
            <button className="admin-btn secondary small" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {page} of {pages}</span>
            <button className="admin-btn secondary small" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
          </span>
        </div>
      </div>
    </AdminShell>
  );
}
