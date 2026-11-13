import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "../../../../components/PageHero";
import { StatusBadge } from "../../../../components/ProjectCard";
import { pillarName, statusInfo } from "../../../../lib/content";
import { getProject, getProjects } from "../../../../lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return {};
  return { title: p.title, description: p.summary, alternates: { canonical: `/projects/${p.slug}` } };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <>
      <PageHero variant="projects" eyebrow={pillarName[project.pillar].toUpperCase()} title={project.title} lead={project.summary}>
        <div className="hero-meta"><StatusBadge status={project.status} />{project.period && <span>{project.period}</span>}</div>
      </PageHero>

      <article className="section-wrap case">
        <div className="case-grid">
          <div className="case-main">
            <section data-reveal>
              <h2>Project context</h2>
              <p>{project.context}</p>
            </section>
            <section data-reveal>
              <h2>Challenge</h2>
              <p>{project.challenge}</p>
            </section>
            <section data-reveal>
              <h2>Solution and scope</h2>
              <ul className="check-list">
                {project.solution.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </section>
            {project.related && (
              <section data-reveal>
                <h2>Related</h2>
                <ul className="link-list">
                  {project.related.map((r) => <li key={r.href}><Link href={r.href}>{r.label} <span aria-hidden="true">↗</span></Link></li>)}
                </ul>
              </section>
            )}
          </div>
          <aside className="case-side">
            <div className="side-card" data-reveal>
              <h2>Capabilities</h2>
              <ul className="tag-list">{project.capabilities.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
            {project.reported && (
              <div className="side-card" data-reveal>
                <h2>{project.status === "operational" ? "Reported figures" : "Scope figures"}</h2>
                <dl className="figures">
                  {project.reported.map((f) => (
                    <div key={f.label}><dd>{f.value}</dd><dt>{f.label}{f.note ? <small>{f.note}</small> : null}</dt></div>
                  ))}
                </dl>
              </div>
            )}
            <div className="side-card note" data-reveal>
              <h2>Status and attribution</h2>
              <p><StatusBadge status={project.status} /></p>
              <p>{statusInfo[project.status].note}</p>
            </div>
          </aside>
        </div>
      </article>

      <section className="cta-band">
        <div className="section-wrap cta-inner">
          <div><h2>Next: {next.title}</h2><p><Link href="/projects" className="text-link">← All projects</Link></p></div>
          <Link className="button button-light" href={`/projects/${next.slug}`}>Next case study <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </>
  );
}
