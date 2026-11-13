import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "../../../components/PageHero";
import ProjectCard from "../../../components/ProjectCard";
import { researchThemes } from "../../../lib/content";
import { getProjects, getResearch } from "../../../lib/data";

export const metadata: Metadata = {
  title: "Research",
  description: "Research themes, manuscripts, prototypes and proofs of concept from Agentic Research Labs — labelled by maturity.",
  alternates: { canonical: "/research" },
};

export default async function ResearchPage() {
  const [projects, research] = await Promise.all([getProjects(), getResearch()]);
  const pocs = projects.filter((p) => p.status === "poc" || p.slug === "intelligent-file-management");
  return (
    <>
      <PageHero eyebrow="RESEARCH" title={<>Applied research, <em>transparently labelled.</em></>} lead="We present work in progress and completed research openly. Each item is labelled as a manuscript, proof of concept, pilot or production system — and claims of validation are made only where evidence is cited." />

      <section className="section-wrap research-section" aria-labelledby="pubs-title">
        <div className="section-heading" data-reveal>
          <div><p className="eyebrow dark-eyebrow">MANUSCRIPTS</p><h2 id="pubs-title">Papers and frameworks.</h2></div>
          <p>These manuscripts have not yet been peer-reviewed or published. They are shared as research in progress.</p>
        </div>
        <div className="research-grid">
          {research.map((r, i) => (
            <article className="research-card" key={r.slug} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
              <p className="project-pillar">{r.kind}</p>
              <h3><Link href={`/research/${r.slug}`}>{r.title}</Link></h3>
              <p>{r.summary}</p>
              <p className="meta-line"><strong>Authors:</strong> {r.authors}</p>
              <p className="meta-line"><strong>Status:</strong> {r.status}</p>
              <ul className="tag-list">{r.keywords.slice(0, 5).map((k) => <li key={k}>{k}</li>)}</ul>
              <Link className="inline-link" href={`/research/${r.slug}`}>Read the summary <span aria-hidden="true">↗</span></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="capabilities" id="themes" aria-labelledby="themes-title">
        <div className="section-wrap">
          <div className="section-heading" data-reveal>
            <div><p className="eyebrow dark-eyebrow">RESEARCH THEMES</p><h2 id="themes-title">Where we are looking.</h2></div>
          </div>
          <div className="theme-grid">
            {researchThemes.map((t, i) => (
              <article className="theme-card" key={t.title} data-reveal style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                <span className="pillar-number">0{i + 1}</span>
                <h3>{t.title}</h3>
                <p>{t.detail}</p>
                <ul className="link-list">{t.links.map((l) => <li key={l.href}><Link href={l.href}>{l.label} <span aria-hidden="true">↗</span></Link></li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap research-section" aria-labelledby="poc-title">
        <div className="section-heading" data-reveal>
          <div><p className="eyebrow dark-eyebrow">PROTOTYPES AND PROOFS OF CONCEPT</p><h2 id="poc-title">From idea to engineering.</h2></div>
          <p>Design and proof-of-concept work is not presented as production deployment or as a measured outcome.</p>
        </div>
        <div className="project-grid">
          {pocs.map((p, i) => <ProjectCard key={p.slug} project={p} delay={i * 80} />)}
        </div>
      </section>
    </>
  );
}
