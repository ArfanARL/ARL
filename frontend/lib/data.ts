/**
 * Content access layer for the public website.
 *
 * Content managed in the admin console is served by the Core API. If the API is unreachable, or
 * has no published entries for a type yet, the site falls back to the built-in content in
 * `lib/content.ts`, so the public site never depends on the API being up.
 * Responses are cached and revalidated every 60 seconds.
 */
import { API_BASE_URL } from "./config";
import { leaders as staticLeaders, projects as staticProjects, research as staticResearch, type Leader, type Project, type ResearchItem } from "./content";

type Row<T> = { slug: string; title: string; data: Partial<T> };

async function fetchEntries<T>(type: "project" | "research" | "leader"): Promise<Row<T>[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/content/${type}`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const rows = (await res.json()) as Row<T>[];
    return Array.isArray(rows) && rows.length > 0 ? rows : null;
  } catch {
    return null;
  }
}

const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const str = (v: unknown, d = "") => (typeof v === "string" ? v : d);

function toProject(r: Row<Project>): Project {
  const d = r.data;
  return {
    slug: r.slug,
    title: r.title,
    pillar: (d.pillar as Project["pillar"]) ?? "platforms",
    status: (d.status as Project["status"]) ?? "historical",
    featured: Boolean(d.featured),
    period: d.period || undefined,
    context: str(d.context),
    summary: str(d.summary),
    challenge: str(d.challenge),
    solution: arr<string>(d.solution),
    capabilities: arr<string>(d.capabilities),
    reported: arr<{ label: string; value: string; note?: string }>(d.reported).length ? arr(d.reported) : undefined,
    related: arr<{ label: string; href: string }>(d.related).length ? arr(d.related) : undefined,
  };
}

function toResearch(r: Row<ResearchItem>): ResearchItem {
  const d = r.data;
  return {
    slug: r.slug,
    title: r.title,
    kind: str(d.kind, "Research"),
    status: str(d.status),
    authors: str(d.authors),
    affiliation: d.affiliation || undefined,
    theme: str(d.theme),
    summary: str(d.summary),
    keywords: arr<string>(d.keywords),
    body: arr<{ heading: string; text: string }>(d.body),
  };
}

function toLeader(r: Row<Leader>): Leader {
  const d = r.data;
  return {
    slug: r.slug,
    initials: str(d.initials, r.title.replace(/^(Mr|Ms|Mrs|Dr)\.?\s+/i, "").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()),
    name: r.title,
    role: str(d.role),
    headline: str(d.headline),
    bio: arr<string>(d.bio),
    highlights: arr<{ value: string; label: string }>(d.highlights),
    focus: arr<string>(d.focus),
    expertise: arr<{ group: string; items: string[] }>(d.expertise).length ? arr(d.expertise) : undefined,
    career: arr<NonNullable<Leader["career"]>[number]>(d.career).length ? arr(d.career) : undefined,
    credentials: arr<string>(d.credentials),
    work: arr<{ label: string; href: string }>(d.work).length ? arr(d.work) : undefined,
  };
}

export async function getProjects(): Promise<Project[]> {
  return ((await fetchEntries<Project>("project"))?.map(toProject)) ?? staticProjects;
}
export async function getProject(slug: string) {
  return (await getProjects()).find((p) => p.slug === slug);
}
export async function getResearch(): Promise<ResearchItem[]> {
  return ((await fetchEntries<ResearchItem>("research"))?.map(toResearch)) ?? staticResearch;
}
export async function getLeaders(): Promise<Leader[]> {
  return ((await fetchEntries<Leader>("leader"))?.map(toLeader)) ?? staticLeaders;
}
