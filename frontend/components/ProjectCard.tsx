import Link from "next/link";
import { pillarName, statusInfo, type Project } from "../lib/content";

export function StatusBadge({ status }: { status: Project["status"] }) {
  return <span className={`badge badge-${status}`}>{statusInfo[status].label}</span>;
}

export default function ProjectCard({ project, delay = 0 }: { project: Project; delay?: number }) {
  return (
    <article className="project-card" data-reveal style={{ transitionDelay: `${delay}ms` }}>
      <div className="project-card-top">
        <span className="project-pillar">{pillarName[project.pillar]}</span>
        <StatusBadge status={project.status} />
      </div>
      <h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3>
      <p>{project.summary}</p>
      <div className="project-card-foot">
        <span>{project.period ?? "Reported deployment"}</span>
        <Link href={`/projects/${project.slug}`} aria-label={`Read case study: ${project.title}`}>Case study ↗</Link>
      </div>
    </article>
  );
}
