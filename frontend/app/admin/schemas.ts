/** Field definitions that drive the admin content editor for each content type. */
export type Col = { key: string; label: string; kind?: "text" | "area" | "list" | "lines" };
export type Field = {
  key: string;
  label: string;
  kind: "text" | "textarea" | "lines" | "paras" | "select" | "check" | "rows";
  help?: string;
  placeholder?: string;
  options?: [string, string][];
  cols?: Col[];
  full?: boolean;
  rowsCount?: number;
};
export type Schema = {
  label: string;
  plural: string;
  titleLabel: string;
  publicPath: (slug: string) => string;
  fields: Field[];
  blank: () => Record<string, any>;
};

const pillars: [string, string][] = [["ai", "AI & Agentic Systems"], ["platforms", "Healthcare & Enterprise Platforms"], ["research", "Applied Research & Digital Infrastructure"]];
const statuses: [string, string][] = [["operational", "Operational (reported)"], ["initiative", "Active initiative"], ["poc", "Proof of concept"], ["historical", "Completed project"], ["research", "Research"]];

export const schemas: Record<string, Schema> = {
  project: {
    label: "Project",
    plural: "Projects",
    titleLabel: "Project title",
    publicPath: (s) => `/projects/${s}`,
    blank: () => ({ pillar: "platforms", status: "historical", featured: false, period: "", context: "", summary: "", challenge: "", solution: [], capabilities: [], reported: [], related: [] }),
    fields: [
      { key: "pillar", label: "Domain", kind: "select", options: pillars },
      { key: "status", label: "Status label", kind: "select", options: statuses, help: "Controls the badge and the attribution note shown on the page." },
      { key: "period", label: "Period", kind: "text", placeholder: "e.g. 2021 – 2023" },
      { key: "featured", label: "Feature on the home page", kind: "check" },
      { key: "context", label: "Project context", kind: "textarea", full: true, help: "Who the work was delivered for (the client) and in what capacity. Keep it accurate." },
      { key: "summary", label: "Summary", kind: "textarea", full: true },
      { key: "challenge", label: "Challenge", kind: "textarea", full: true },
      { key: "solution", label: "Solution and scope", kind: "lines", full: true, help: "One point per line.", rowsCount: 8 },
      { key: "capabilities", label: "Capabilities", kind: "lines", full: true, help: "One per line — shown as tags." },
      { key: "reported", label: "Reported figures", kind: "rows", full: true, help: "Only publish approved figures, with their original scope.", cols: [{ key: "label", label: "Label" }, { key: "value", label: "Value" }, { key: "note", label: "Note (optional)" }] },
      { key: "related", label: "Related links", kind: "rows", full: true, cols: [{ key: "label", label: "Link text" }, { key: "href", label: "Path, e.g. /research/ai-enabled-hmis" }] },
    ],
  },
  research: {
    label: "Research item",
    plural: "Research",
    titleLabel: "Title",
    publicPath: (s) => `/research/${s}`,
    blank: () => ({ kind: "Manuscript", status: "", authors: "", affiliation: "", theme: "", summary: "", keywords: [], body: [] }),
    fields: [
      { key: "kind", label: "Type", kind: "text", placeholder: "e.g. Conceptual framework · manuscript" },
      { key: "status", label: "Publication status", kind: "text", placeholder: "e.g. Manuscript — not yet peer-reviewed" },
      { key: "authors", label: "Authors", kind: "text" },
      { key: "affiliation", label: "Affiliation", kind: "text" },
      { key: "theme", label: "Research theme", kind: "text", full: true },
      { key: "summary", label: "Summary", kind: "textarea", full: true },
      { key: "keywords", label: "Keywords", kind: "lines", full: true, help: "One per line." },
      { key: "body", label: "Page sections", kind: "rows", full: true, help: "Free-form sections shown on the research page. Separate paragraphs with a blank line.", cols: [{ key: "heading", label: "Heading" }, { key: "text", label: "Text", kind: "area" }] },
    ],
  },
  leader: {
    label: "Leader profile",
    plural: "Leadership",
    titleLabel: "Full name (with title)",
    publicPath: () => "/leadership",
    blank: () => ({ initials: "", role: "", headline: "", bio: [], highlights: [], focus: [], expertise: [], career: [], credentials: [], work: [] }),
    fields: [
      { key: "role", label: "Role", kind: "text" },
      { key: "initials", label: "Initials", kind: "text", placeholder: "e.g. MA" },
      { key: "headline", label: "Headline", kind: "text", full: true },
      { key: "bio", label: "Biography", kind: "paras", full: true, help: "Separate paragraphs with a blank line.", rowsCount: 10 },
      { key: "highlights", label: "Key figures", kind: "rows", full: true, cols: [{ key: "value", label: "Value, e.g. 16+" }, { key: "label", label: "Label" }] },
      { key: "focus", label: "Areas of focus", kind: "lines", full: true, help: "One per line." },
      { key: "expertise", label: "Technical expertise", kind: "rows", full: true, cols: [{ key: "group", label: "Group" }, { key: "items", label: "Items (comma separated)", kind: "list" }] },
      { key: "career", label: "Career", kind: "rows", full: true, cols: [{ key: "period", label: "Period" }, { key: "title", label: "Title" }, { key: "org", label: "Organisation" }, { key: "points", label: "Points (one per line)", kind: "lines" }] },
      { key: "credentials", label: "Education and certification", kind: "lines", full: true, help: "One per line." },
      { key: "work", label: "Selected work and research links", kind: "rows", full: true, cols: [{ key: "label", label: "Link text" }, { key: "href", label: "Path, e.g. /projects/oneverse-aios" }] },
    ],
  },
};
