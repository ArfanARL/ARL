import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "../../../components/PageHero";
import { pillars } from "../../../lib/content";
import { getProjects } from "../../../lib/data";

export const metadata: Metadata = {
  title: "Solutions",
  description: "AI & Agentic Systems, Healthcare & Enterprise Platforms, and Applied Research & Digital Infrastructure.",
  alternates: { canonical: "/solutions" },
};

export default async function SolutionsPage() {
  const projects = await getProjects();
  return (
    <>
      <PageHero variant="solutions" eyebrow="SOLUTIONS" title={<>Three pillars. <em>One connected capability.</em></>} lead="We shape solutions around the mission, users, information and operating environment — not around technology for its own sake." />
      {pillars.map((p, i) => {
        const related = projects.filter((x) => x.pillar === p.id);
        return (
          <section key={p.id} id={p.id} className={`pillar-section section-wrap${i % 2 ? " alt" : ""}`} aria-labelledby={`${p.id}-title`}>
            <div className="two-col">
              <div data-reveal>
                <p className="eyebrow dark-eyebrow">PILLAR {p.number}</p>
                <h2 id={`${p.id}-title`}>{p.title}</h2>
                <p className="pillar-positioning">{p.positioning}</p>
                <p className="prose-p">{p.description}</p>
              </div>
              <div data-reveal style={{ transitionDelay: "90ms" }}>
                <h3 className="list-title">Primary offerings</h3>
                <ul className="check-list">
                  {p.offerings.map((o) => <li key={o}>{o}</li>)}
                </ul>
                <h3 className="list-title">Related projects</h3>
                <ul className="link-list">
                  {related.map((r) => <li key={r.slug}><Link href={`/projects/${r.slug}`}>{r.title} <span aria-hidden="true">↗</span></Link></li>)}
                </ul>
              </div>
            </div>
          </section>
        );
      })}
      <section className="cta-band">
        <div className="section-wrap cta-inner">
          <div><h2>Discuss your requirement.</h2><p>Tell us about the institution, users and outcome you have in mind.</p></div>
          <Link className="button button-light" href="/contact">Discuss a Project <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </>
  );
}
