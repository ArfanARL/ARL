"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { leaders as seedLeaders, projects as seedProjects, research as seedResearch } from "../../../../lib/content";
import { AdminShell, Notice, PageHeader, api, fmtDate, getUser, isAdministrator, slugify, useNotice } from "../../shared";
import { schemas, type Col, type Field } from "../../schemas";

type Entry = { id: string; type: string; slug: string; title: string; data: Record<string, any>; isPublished: boolean; sortOrder: number; updatedAtUtc: string; updatedBy: string };
type Draft = { id: string; slug: string; title: string; data: Record<string, any>; isPublished: boolean; sortOrder: number; slugTouched: boolean };

const newDraft = (blank: Record<string, any>): Draft => ({ id: "", slug: "", title: "", data: structuredClone(blank), isPublished: false, sortOrder: 100, slugTouched: false });

function seedFor(type: string) {
  if (type === "project") return seedProjects.map((p, i) => ({ type, slug: p.slug, title: p.title, data: p, isPublished: true, sortOrder: (i + 1) * 10 }));
  if (type === "research") return seedResearch.map((r, i) => ({ type, slug: r.slug, title: r.title, data: r, isPublished: true, sortOrder: (i + 1) * 10 }));
  return seedLeaders.map((l, i) => ({ type, slug: l.slug, title: l.name, data: l, isPublished: true, sortOrder: (i + 1) * 10 }));
}

export default function EntriesAdmin() {
  const { type } = useParams<{ type: string }>();
  const schema = schemas[type];
  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const n = useNotice();
  const admin = isAdministrator(getUser());

  const load = useCallback(async () => {
    try { setEntries(await api<Entry[]>(`/api/v1/admin/content/entries?type=${type}`)); } catch (e: any) { n.setErr(e.message); } finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);
  useEffect(() => { setDraft(null); setLoading(true); load(); }, [load]);

  if (!schema) return <AdminShell><h1>Unknown content type</h1></AdminShell>;

  function edit(e: Entry) {
    n.clear();
    setDraft({ id: e.id, slug: e.slug, title: e.title, data: structuredClone(e.data), isPublished: e.isPublished, sortOrder: e.sortOrder, slugTouched: true });
  }
  function setData(key: string, value: any) { setDraft((d) => (d ? { ...d, data: { ...d.data, [key]: value } } : d)); }

  async function save(publish?: boolean) {
    if (!draft) return;
    setSaving(true);
    n.clear();
    const payload = { type, slug: draft.slug || slugify(draft.title), title: draft.title, data: draft.data, isPublished: publish ?? draft.isPublished, sortOrder: Number(draft.sortOrder) || 0 };
    try {
      const saved = draft.id
        ? await api<Entry>(`/api/v1/admin/content/entries/${draft.id}`, { method: "PUT", body: JSON.stringify(payload) })
        : await api<Entry>("/api/v1/admin/content/entries", { method: "POST", body: JSON.stringify(payload) });
      await load();
      edit(saved);
      n.setOk(`${schema.label} saved${saved.isPublished ? " and published — the public site refreshes within a minute" : " as a draft"}.`);
    } catch (e: any) { n.setErr(e.message); } finally { setSaving(false); }
  }
  async function remove() {
    if (!draft?.id || !confirm(`Permanently delete “${draft.title}”? This removes it from the website and cannot be undone.`)) return;
    try { await api(`/api/v1/admin/content/entries/${draft.id}`, { method: "DELETE" }); setDraft(null); await load(); n.setOk(`${schema.label} deleted.`); } catch (e: any) { n.setErr(e.message); }
  }
  async function importSeed() {
    if (!confirm(`Import the website's current built-in ${schema.plural.toLowerCase()} into the database? Existing entries are never overwritten.`)) return;
    try {
      const r = await api<{ created: number; skipped: number }>("/api/v1/admin/content/import", { method: "POST", body: JSON.stringify({ entries: seedFor(type) }) });
      await load();
      n.setOk(`Imported ${r.created} ${schema.plural.toLowerCase()} (${r.skipped} already existed).`);
    } catch (e: any) { n.setErr(e.message); }
  }

  const publicUrl = draft ? schema.publicPath(draft.slug || slugify(draft.title)) : "";

  return (
    <AdminShell>
      <PageHeader eyebrow="Website content" title={schema.plural} lead={`Create and edit ${schema.plural.toLowerCase()} shown on the public website. Drafts are never shown publicly.`}
        actions={<><button className="admin-btn" onClick={() => { n.clear(); setDraft(newDraft(schema.blank())); }}>New {schema.label.toLowerCase()}</button>{admin && entries.length === 0 && !loading && <button className="admin-btn secondary" onClick={importSeed}>Import current site content</button>}</>} />
      <Notice ok={n.ok} err={n.err} />
      {!loading && entries.length === 0 && (
        <p className="admin-info">No {schema.plural.toLowerCase()} are managed here yet, so the website shows its built-in content. {admin ? "Use “Import current site content” to bring it in, then edit freely." : "Ask an administrator to import the current content."}</p>
      )}

      <div className="admin-split">
        <div className="admin-list" role="list" aria-label={schema.plural}>
          {entries.map((e) => (
            <button key={e.id} role="listitem" aria-current={draft?.id === e.id} onClick={() => edit(e)}>
              <b>{e.title}</b>
              <span className={`admin-status ${e.isPublished ? "published" : "draft"}`}>{e.isPublished ? "Published" : "Draft"}</span>
              <br /><small>Updated {fmtDate(e.updatedAtUtc)}</small>
            </button>
          ))}
          {entries.length === 0 && <p className="admin-empty">Nothing here yet.</p>}
        </div>

        <div>
          {!draft && <div className="admin-panel"><p className="admin-muted" style={{ margin: 0 }}>Select an entry to edit it, or create a new one.</p></div>}
          {draft && (
            <form key={draft.id || "new"} className="admin-panel admin-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
              <div className="admin-editor-head">
                <h2 style={{ margin: 0 }}>{draft.id ? `Edit ${schema.label.toLowerCase()}` : `New ${schema.label.toLowerCase()}`}</h2>
                {draft.id && draft.isPublished && <a className="admin-btn secondary small" href={publicUrl} target="_blank" rel="noopener">View on website ↗</a>}
              </div>
              <div className="admin-form-grid">
                <div className="full">
                  <label htmlFor="f-title">{schema.titleLabel}</label>
                  <input id="f-title" className="admin-input" required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value, slug: draft.slugTouched ? draft.slug : slugify(e.target.value) })} />
                </div>
                <div>
                  <label htmlFor="f-slug">URL slug <span className="admin-help">{publicUrl}</span></label>
                  <input id="f-slug" className="admin-input" required value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value), slugTouched: true })} />
                </div>
                <div>
                  <label htmlFor="f-order">Display order <span className="admin-help">lower comes first</span></label>
                  <input id="f-order" className="admin-input" type="number" value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })} />
                </div>
                {schema.fields.map((f) => (
                  <div key={f.key} className={f.full || f.kind === "rows" ? "full" : ""}>
                    <FieldInput field={f} value={draft.data[f.key]} onChange={(v) => setData(f.key, v)} />
                  </div>
                ))}
              </div>
              <div className="admin-savebar">
                <label className="admin-check" style={{ margin: 0 }}><input type="checkbox" checked={draft.isPublished} onChange={(e) => setDraft({ ...draft, isPublished: e.target.checked })} /> Published</label>
                <button className="admin-btn" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
                {draft.id && admin && <button type="button" className="admin-btn danger" onClick={remove}>Delete</button>}
                <button type="button" className="admin-btn secondary" onClick={() => setDraft(null)}>Close</button>
                {draft.id && <span className="admin-muted" style={{ marginLeft: "auto", fontSize: 12 }}>Last saved by {entries.find((x) => x.id === draft.id)?.updatedBy}</span>}
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

/* ----------------------------------------------------------------- field inputs */

const toLines = (v: unknown) => (Array.isArray(v) ? (v as string[]).join("\n") : "");
const fromLines = (s: string) => s.split("\n");
const tidy = (v: string[]) => v.map((x) => x.trim()).filter(Boolean);

function FieldInput({ field, value, onChange }: { field: Field; value: any; onChange: (v: any) => void }) {
  const id = `f-${field.key}`;
  const label = (<label htmlFor={id}>{field.label}{field.help && <span className="admin-help">{field.help}</span>}</label>);
  switch (field.kind) {
    case "text": return (<>{label}<input id={id} className="admin-input" value={value ?? ""} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} /></>);
    case "textarea": return (<>{label}<textarea id={id} className="admin-textarea" value={value ?? ""} onChange={(e) => onChange(e.target.value)} /></>);
    case "select": return (<>{label}<select id={id} className="admin-select" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>{field.options!.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></>);
    case "check": return (<label className="admin-check"><input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} /> {field.label}</label>);
    case "lines": return (<LinesInput id={id} label={label} rows={field.rowsCount ?? 5} value={value} onChange={onChange} />);
    case "paras": return (<ParasInput id={id} label={label} rows={field.rowsCount ?? 8} value={value} onChange={onChange} />);
    case "rows": return (<RowsEditor label={field.label} help={field.help} cols={field.cols!} value={Array.isArray(value) ? value : []} onChange={onChange} />);
  }
}

// Keep the raw text while typing; commit a cleaned array on every change.
function LinesInput({ id, label, rows, value, onChange }: { id: string; label: React.ReactNode; rows: number; value: any; onChange: (v: string[]) => void }) {
  const [text, setText] = useState(toLines(value));
  useEffect(() => { if (tidy(fromLines(text)).join("\n") !== tidy(Array.isArray(value) ? value : []).join("\n")) setText(toLines(value)); }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return (<>{label}<textarea id={id} className="admin-textarea" rows={rows} value={text} onChange={(e) => { setText(e.target.value); onChange(tidy(fromLines(e.target.value))); }} /></>);
}
function ParasInput({ id, label, rows, value, onChange }: { id: string; label: React.ReactNode; rows: number; value: any; onChange: (v: string[]) => void }) {
  const join = (v: unknown) => (Array.isArray(v) ? (v as string[]).join("\n\n") : "");
  const split = (s: string) => s.split(/\n{2,}/).map((x) => x.trim()).filter(Boolean);
  const [text, setText] = useState(join(value));
  useEffect(() => { if (split(text).join("\n\n") !== join(value)) setText(join(value)); }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return (<>{label}<textarea id={id} className="admin-textarea" rows={rows} value={text} onChange={(e) => { setText(e.target.value); onChange(split(e.target.value)); }} /></>);
}

function CellInput({ col, value, onChange }: { col: Col; value: any; onChange: (v: any) => void }) {
  if (col.kind === "area") return (<textarea className="admin-textarea" rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />);
  if (col.kind === "lines") return (<LinesCell value={value} onChange={onChange} />);
  if (col.kind === "list") return (<ListCell value={value} onChange={onChange} />);
  return (<input className="admin-input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />);
}
function LinesCell({ value, onChange }: { value: any; onChange: (v: string[]) => void }) {
  const [text, setText] = useState(toLines(value));
  return (<textarea className="admin-textarea" rows={4} value={text} onChange={(e) => { setText(e.target.value); onChange(tidy(fromLines(e.target.value))); }} />);
}
function ListCell({ value, onChange }: { value: any; onChange: (v: string[]) => void }) {
  const [text, setText] = useState(Array.isArray(value) ? value.join(", ") : "");
  return (<input className="admin-input" value={text} onChange={(e) => { setText(e.target.value); onChange(tidy(e.target.value.split(","))); }} />);
}

function RowsEditor({ label, help, cols, value, onChange }: { label: string; help?: string; cols: Col[]; value: any[]; onChange: (v: any[]) => void }) {
  // Stable keys so row-local text state survives reordering.
  const [keys, setKeys] = useState<number[]>(() => value.map((_, i) => i));
  const [next, setNext] = useState(value.length);
  useEffect(() => { if (keys.length !== value.length) { setKeys(value.map((_, i) => i)); setNext(value.length); } }, [value.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (i: number, key: string, v: any) => onChange(value.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)));
  const add = () => { onChange([...value, {}]); setKeys([...keys, next]); setNext(next + 1); };
  const remove = (i: number) => { onChange(value.filter((_, idx) => idx !== i)); setKeys(keys.filter((_, idx) => idx !== i)); };
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const v = [...value]; [v[i], v[j]] = [v[j], v[i]]; onChange(v);
    const k = [...keys]; [k[i], k[j]] = [k[j], k[i]]; setKeys(k);
  };

  return (
    <div>
      <span className="admin-label">{label}{help && <span className="admin-help">{help}</span>}</span>
      <div className="rows-editor">
        {value.map((row, i) => (
          <div className="row" key={keys[i] ?? i} style={{ gridTemplateColumns: cols.length > 2 && cols.every((c) => !c.kind || c.kind === "text") ? `repeat(${cols.length}, 1fr)` : cols.length === 2 ? "1fr 1fr" : "1fr 1fr" }}>
            {cols.map((c) => (
              <div key={c.key} style={c.kind === "area" || c.kind === "lines" ? { gridColumn: "1 / -1" } : undefined}>
                <label>{c.label}</label>
                <CellInput col={c} value={row[c.key]} onChange={(v) => update(i, c.key, v)} />
              </div>
            ))}
            <div className="row-actions" style={{ gridColumn: "1 / -1" }}>
              <button type="button" className="admin-btn secondary small" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
              <button type="button" className="admin-btn secondary small" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move down">↓</button>
              <button type="button" className="admin-btn danger small" onClick={() => remove(i)}>Remove</button>
            </div>
          </div>
        ))}
        <button type="button" className="admin-btn secondary small" onClick={add}>+ Add</button>
      </div>
    </div>
  );
}
