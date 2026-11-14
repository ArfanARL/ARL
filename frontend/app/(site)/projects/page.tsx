import type { Metadata } from "next";
import PageHero from "../../../components/PageHero";
import ProjectsExplorer from "../../../components/ProjectsExplorer";
import { statusInfo } from "../../../lib/content";
import { getProjects } from "../../../lib/data";

export const metadata: Metadata = {
  title: "Projects",
  description: "Case studies across healthcare platforms, agentic AI, enterprise systems, GIS and digital infrastructure — each labelled by status and project context.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <PageHero variant="projects" eyebrow="PROJECTS" title={<>Selected work across <em>{projects.length} initiatives.</em></>} lead="Healthcare, AI, enterprise, GIS and infrastructure work — labelled so you can tell operational systems from completed projects and proofs of concept." />
      <section className="section-wrap projects-section">
        <ProjectsExplorer projects={projects} />
        <aside className="legend" aria-label="How projects are labelled">
          <h2>How we label our work</h2>
          <dl>
            {(["operational", "initiative", "poc", "historical"] as const).map((s) => (
              <div key={s}><dt><span className={`badge badge-${s}`}>{statusInfo[s].label}</span></dt><dd>{statusInfo[s].note}</dd></div>
            ))}
          </dl>
        </aside>
      </section>
    </>
  );
}
