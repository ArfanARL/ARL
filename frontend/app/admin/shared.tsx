"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LogoMark } from "../../components/Logo";
import { API_BASE_URL } from "../../lib/config";

export const API = API_BASE_URL;
const TOKEN_KEY = "arl_admin_token";
const USER_KEY = "arl_admin_user";

export type AdminUser = { displayName: string; email: string; roles: string[] };

export function getToken() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(TOKEN_KEY) || "";
}
export function getUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}
export function saveSession(token: string, user: AdminUser) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
export const isAdministrator = (u: AdminUser | null) => Boolean(u?.roles?.includes("Administrator"));

/** Authenticated JSON request to the Core API. Throws Error with a readable message. */
export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${getToken()}`);
  if (init.body) headers.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetch(`${API}${path}`, { ...init, headers, cache: "no-store" });
  } catch {
    throw new Error("Cannot reach the API. Check that the Core API is running.");
  }
  if (response.status === 401) {
    clearSession();
    window.location.href = "/admin/login";
    throw new Error("Your session expired. Please sign in again.");
  }
  if (response.status === 403) throw new Error("You do not have permission to do that.");
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const fieldErrors = body.errors ? Object.values(body.errors as Record<string, string[]>).flat().join(" ") : "";
    throw new Error(body.error || fieldErrors || body.title || `Request failed (${response.status})`);
  }
  return (response.status === 204 ? null : await response.json()) as T;
}

export async function downloadCsv(path: string, filename: string) {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${getToken()}` } });
  if (!res.ok) throw new Error(`Export failed (${res.status})`);
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const slugify = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
export const fmtDate = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

/** Transient success / error messages. */
export function useNotice() {
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const clear = useCallback(() => { setOk(""); setErr(""); }, []);
  return { ok, err, setOk: (m: string) => { setErr(""); setOk(m); }, setErr: (m: string) => { setOk(""); setErr(m); }, clear };
}
export function Notice({ ok, err }: { ok?: string; err?: string }) {
  return (<>{ok && <p className="admin-ok" role="status">{ok}</p>}{err && <p className="admin-error" role="alert">{err}</p>}</>);
}

const nav: { heading: string; adminOnly?: boolean; items: { href: string; label: string; icon: string }[] }[] = [
  { heading: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: "▦" }] },
  { heading: "Inbox", items: [{ href: "/admin/enquiries", label: "Contact enquiries", icon: "✉" }] },
  {
    heading: "Website content",
    items: [
      { href: "/admin/entries/project", label: "Projects", icon: "◧" },
      { href: "/admin/entries/research", label: "Research", icon: "◈" },
      { href: "/admin/entries/leader", label: "Leadership", icon: "☺" },
      { href: "/admin/content", label: "Pages", icon: "☰" },
    ],
  },
  { heading: "System", adminOnly: true, items: [{ href: "/admin/users", label: "Users & roles", icon: "⚿" }, { href: "/admin/audit", label: "Audit log", icon: "◷" }] },
  { heading: "Account", items: [{ href: "/admin/account", label: "My account", icon: "⚙" }] },
];

export function AdminShell({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const pathname = usePathname();
  const [state, setState] = useState<"checking" | "ready" | "denied">("checking");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) { window.location.href = "/admin/login"; return; }
    const u = getUser();
    setUser(u);
    setState(adminOnly && !isAdministrator(u) ? "denied" : "ready");
  }, [adminOnly]);
  useEffect(() => setOpen(false), [pathname]);

  function logout() { clearSession(); window.location.href = "/admin/login"; }

  if (state === "checking") return <div className="admin-wrap" style={{ padding: 40 }}>Checking administrator session…</div>;
  const admin = isAdministrator(user);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/"));

  return (
    <div className="admin-wrap">
      <header className="admin-top">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="admin-menu-btn" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen((o) => !o)}>☰</button>
          <Link className="admin-brand" href="/admin"><LogoMark size={34} onDark /><span>AGENTIC RESEARCH LABS <small>/ ADMIN</small></span></Link>
        </div>
        <div className="admin-userbox">
          <div className="who">{user?.displayName || user?.email}<span>{user?.roles?.join(", ")}</span></div>
          <button className="admin-btn secondary small" onClick={logout}>Sign out</button>
        </div>
      </header>
      <div className="admin-layout">
        <aside className={`admin-side${open ? " open" : ""}`} aria-label="Admin navigation">
          {nav.filter((g) => !g.adminOnly || admin).map((g) => (
            <div key={g.heading}>
              <h2>{g.heading}</h2>
              {g.items.map((i) => (
                <Link key={i.href} href={i.href} aria-current={active(i.href) ? "page" : undefined}><span className="ico" aria-hidden="true">{i.icon}</span>{i.label}</Link>
              ))}
            </div>
          ))}
          <h2>Public site</h2>
          <a href="/" target="_blank" rel="noopener"><span className="ico" aria-hidden="true">↗</span>View website</a>
        </aside>
        <main className="admin-main">
          {state === "denied" ? (<><h1>Administrators only</h1><p className="admin-lead">Your role does not have access to this section.</p><Link className="admin-btn" href="/admin">Back to dashboard</Link></>) : children}
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, lead, actions }: { eyebrow: string; title: string; lead?: string; actions?: React.ReactNode }) {
  return (
    <div className="admin-panel-head" style={{ alignItems: "flex-end", marginBottom: 8 }}>
      <div><p className="admin-eyebrow">{eyebrow}</p><h1>{title}</h1>{lead && <p className="admin-lead" style={{ marginBottom: 12 }}>{lead}</p>}</div>
      {actions && <div className="admin-actions">{actions}</div>}
    </div>
  );
}
