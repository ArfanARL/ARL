import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/config";
import { getProjects, getResearch } from "../lib/data";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, research] = await Promise.all([getProjects(), getResearch()]);
  const pages = ["", "/about", "/solutions", "/projects", "/research", "/leadership", "/contact"];
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.8 })),
    ...projects.map((p) => ({ url: `${SITE_URL}/projects/${p.slug}`, changeFrequency: "yearly" as const, priority: 0.6 })),
    ...research.map((r) => ({ url: `${SITE_URL}/research/${r.slug}`, changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
