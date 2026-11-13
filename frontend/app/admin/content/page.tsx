"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell, Notice, PageHeader, api, getUser, isAdministrator, slugify, useNotice } from "../shared";

type Page = { id: string; title: string; slug: string; summary: string; body: string; isPublished: boolean; sortOrder: number };
const empty: Page = { id: "", title: "", slug: "", summary: "", body: "", isPublished: false, sortOrder: 0 };

export default function ContentAdmin() {
  const [items, setItems] = useState<Page[]>([]);
  const [form, setForm] = useState<Page>(empty);
  const n = useNotice();
  const admin = isAdministrator(getUser());

  const load = useCallback(async () => { try { setItems(await api("/api/v1/admin/content/pages")); } catch (e: any) { n.setErr(e.message); } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = { title: form.title, slug: slugify(form.slug || form.title), summary: form.summary, body: form.body, isPublished: form.isPublished, sortOrder: Number(form.sortOrder) };
    try {
      if (form.id) await api(`/api/v1/admin/content/pages/${form.id}`, { method: "PUT", body: JSON.stringify(payload) });
      else await api("/api/v1/admin/content/pages", { method: "POST", body: JSON.stringify(payload) });
      setForm(empty); n.setOk("Page saved."); await load();
    } catch (err: any) { n.setErr(err.message); }
  }
  async function remove(id: string) {
    if (!confirm("Permanently delete this page?")) return;
    try { await api(`/api/v1/admin/content/pages/${id}`, { method: "DELETE" }); await load(); n.setOk("Page deleted."); } catch (e: any) { n.setErr(e.message); }
  }

  return (
    <AdminShell>
      <PageHeader eyebrow="Website content" title="Pages" lead="General-purpose pages served by the public content API (for example legal notices or announcements)." />
      <Notice ok={n.ok} err={n.err} />
      <div className="admin-grid-2">
        <div className="admin-panel">
          <h2>Existing pages ({items.length})</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Title</th><th>Slug</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td><b>{p.title}</b></td><td>/{p.slug}</td>
                    <td><span className={`admin-status ${p.isPublished ? "published" : "draft"}`}>{p.isPublished ? "Published" : "Draft"}</span></td>
                    <td className="admin-actions"><button className="admin-btn secondary small" onClick={() => { setForm(p); n.clear(); }}>Edit</button>{admin && <button className="admin-btn danger small" onClick={() => remove(p.id)}>Delete</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {items.length === 0 && <p className="admin-empty">No pages yet.</p>}
        </div>
        <form className="admin-panel admin-form" onSubmit={save}>
          <h2>{form.id ? "Edit page" : "Create page"}</h2>
          <label htmlFor="pg-title">Page title</label>
          <input id="pg-title" className="admin-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <label htmlFor="pg-slug">URL slug</label>
          <input id="pg-slug" className="admin-input" placeholder={slugify(form.title)} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <label htmlFor="pg-sum">Summary</label>
          <input id="pg-sum" className="admin-input" value={form.summary || ""} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          <label htmlFor="pg-body">Body</label>
          <textarea id="pg-body" className="admin-textarea" style={{ minHeight: 180 }} value={form.body || ""} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <label className="admin-check"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Published</label>
          <div className="admin-actions" style={{ marginTop: 16 }}><button className="admin-btn">Save page</button><button type="button" className="admin-btn secondary" onClick={() => setForm(empty)}>Clear</button></div>
        </form>
      </div>
    </AdminShell>
  );
}
