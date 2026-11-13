import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "../../../components/PageHero";
import { getLeaders } from "../../../lib/data";

export const metadata: Metadata = {
  title: "Leadership",
  description: "The leadership of Agentic Research Labs: Mr. Abid Ghaffar, Chief Executive Officer, and Mr. Muhammad Arfan, Director, Operations & Research.",
  alternates: { canonical: "/leadership" },
};

export default async function LeadershipPage() {
  const leaders = await getLeaders();
  return (
    <>
      <PageHero eyebrow="LEADERSHIP" title={<>Experience shaped by <em>complex technology environments.</em></>} lead="The company is led by professionals bringing together technology leadership, operational delivery and applied research.">
        <nav className="hero-meta" aria-label="Jump to profile">
          {leaders.map((l) => <a key={l.slug} href={`#${l.slug}`}>{l.name} ↓</a>)}
        </nav>
      </PageHero>

      <section className="section-wrap leader-list">
        {leaders.map((l, i) => (
          <article className="leader-profile" key={l.slug} id={l.slug} data-reveal style={{ transitionDelay: `${i * 60}ms` }}>
            <div className="leader-aside">
              <span className="leader-initials big" aria-hidden="true">{l.initials}</span>
              <h2>{l.name}</h2>
              <p className="leader-role">{l.role}</p>
              <p className="leader-headline">{l.headline}</p>
              <dl className="leader-stats">
                {l.highlights.map((h) => (
                  <div key={h.label}><dd>{h.value}</dd><dt>{h.label}</dt></div>
                ))}
              </dl>
            </div>

            <div className="leader-body">
              {l.bio.map((b) => <p key={b}>{b}</p>)}

              <h3 className="list-title">Areas of focus</h3>
              <ul className="tag-list">{l.focus.map((f) => <li key={f}>{f}</li>)}</ul>

              {l.expertise && (
                <>
                  <h3 className="list-title">Technical expertise</h3>
                  <div className="expertise-grid">
                    {l.expertise.map((g) => (
                      <div key={g.group}>
                        <strong>{g.group}</strong>
                        <ul>{g.items.map((it) => <li key={it}>{it}</li>)}</ul>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {l.career && (
                <>
                  <h3 className="list-title">Career</h3>
                  <ol className="career">
                    {l.career.map((c) => (
                      <li key={c.title}>
                        <span className="career-period">{c.period}</span>
                        <div>
                          <strong>{c.title}</strong>
                          <em>{c.org}</em>
                          <ul>{c.points.map((p) => <li key={p}>{p}</li>)}</ul>
                        </div>
                      </li>
                    ))}
                  </ol>
                </>
              )}

              {l.credentials.length > 0 && (
                <>
                  <h3 className="list-title">Education and certification</h3>
                  <ul className="check-list">{l.credentials.map((c) => <li key={c}>{c}</li>)}</ul>
                </>
              )}

              {l.work && (
                <>
                  <h3 className="list-title">Selected work and research</h3>
                  <ul className="link-list">
                    {l.work.map((w) => <li key={w.href}><Link href={w.href}>{w.label} <span aria-hidden="true">↗</span></Link></li>)}
                  </ul>
                </>
              )}
            </div>
          </article>
        ))}
        <p className="section-note">Both leaders are credited as leadership and design contributors for the provincial HMIS initiative. Project-specific contributions are described in each <Link href="/projects">case study</Link>.</p>
      </section>
    </>
  );
}
