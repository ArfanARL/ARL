import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "../../../components/PageHero";
import { company } from "../../../lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "Established in 2007, Agentic Research Labs (Pvt) Ltd is a Pakistan-based, research-led technology company developing LLM and agentic AI solutions and healthcare IT for enterprise and public-sector institutions.",
  alternates: { canonical: "/about" },
};

const steps = [
  ["Understand", "the operating environment, users, constraints and intended outcomes."],
  ["Design", "a solution architecture that fits the institution’s technical and governance requirements."],
  ["Build and integrate", "software, data and AI components using fit-for-purpose engineering."],
  ["Test", "workflows, security, reliability and user experience before operational adoption."],
  ["Improve", "continuously through monitoring, feedback and responsible change management."],
];

const principles = [
  ["Human-centred", "Technology should strengthen professional judgement and improve the experience of the people who use it."],
  ["Secure by design", "Security, privacy, access control and accountability belong in the architecture from the beginning."],
  ["Evidence-led", "We value clear requirements, measurable outcomes, careful evaluation and transparent limitations."],
  ["Built to operate", "We design for maintainability, integration and the realities of long-term operational environments."],
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="ABOUT" title={<>Advanced technology, grounded in <em>operational reality.</em></>} lead="A Pakistan-based technology and applied-research company focused on intelligent digital systems for enterprise, public-sector and essential-service environments." />

      <section className="glance" aria-label="Company at a glance">
        <dl className="section-wrap glance-grid">
          <div data-reveal><dd>Since {company.founded}</dd><dt>Established</dt></div>
          <div data-reveal style={{ transitionDelay: "60ms" }}><dd>Lahore</dd><dt>Pakistan</dt></div>
          <div data-reveal style={{ transitionDelay: "120ms" }}><dd>LLMs · Agentic AI</dd><dt>Research & development</dt></div>
          <div data-reveal style={{ transitionDelay: "180ms" }}><dd>Healthcare IT</dd><dt>Specialised software</dt></div>
        </dl>
      </section>

      <section className="section-wrap prose-section">
        <div className="two-col">
          <div data-reveal>
            <p className="eyebrow dark-eyebrow">WHO WE ARE</p>
            <h2>Applied AI, engineering and domain understanding.</h2>
          </div>
          <div className="prose" data-reveal>
            <p>Established in {company.founded}, Agentic Research Labs (Pvt) Ltd is a Pakistan-based technology and applied-research company focused on intelligent digital systems for enterprise, public-sector and essential-service environments. Our work spans AI and agentic systems, healthcare and enterprise platforms, data intelligence, geospatial technologies, systems integration and digital infrastructure.</p>
            <p>We approach technology through the full problem lifecycle: understanding operational needs, researching viable approaches, designing the architecture, engineering and integrating the solution, and supporting readiness for real-world use.</p>
          </div>
        </div>
      </section>

      <section className="section-wrap prose-section company-profile" aria-labelledby="profile-title">
        <div className="section-heading" data-reveal>
          <div><p className="eyebrow dark-eyebrow">COMPANY PROFILE</p><h2 id="profile-title">Established {company.founded}.<br />Focused on the next generation of intelligent systems.</h2></div>
          <p>{company.legalName} · {company.location}</p>
        </div>

        <ol className="company-timeline">
          {company.timeline.map((t, i) => (
            <li key={t.year} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="tl-year">{t.year}</span>
              <div><strong>{t.title}</strong><p>{t.text}</p></div>
            </li>
          ))}
        </ol>

        <h3 className="list-title scope-title" data-reveal>Principal line of business</h3>
        <div className="scope-grid">
          {company.scope.map(([title, text], i) => (
            <article className="scope-card" key={title} data-reveal style={{ transitionDelay: `${(i % 3) * 70}ms` }}>
              <span>0{i + 1}</span>
              <h4>{title}</h4>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <p className="section-note" data-reveal>All activities are subject to the necessary regulatory permissions.</p>

        <details className="clause" data-reveal>
          <summary>Registered business-object clauses</summary>
          <div className="clause-body">
            <h4>Current (modified) business objects</h4>
            <p>{company.modifiedObjects}</p>
            <h4>Original business objects</h4>
            <p>{company.originalObjects}</p>
          </div>
        </details>
      </section>

      <section className="vm-band">
        <div className="section-wrap vm-grid">
          <div data-reveal>
            <p className="eyebrow">OUR VISION</p>
            <p className="vm-text">To advance responsible, practical and trusted technology that strengthens institutions, improves essential services and expands the possibilities of digital transformation.</p>
          </div>
          <div data-reveal style={{ transitionDelay: "90ms" }}>
            <p className="eyebrow">OUR MISSION</p>
            <p className="vm-text">To research, design and implement secure, scalable and human-centred digital solutions by combining applied AI, software engineering, data intelligence and domain expertise.</p>
          </div>
        </div>
      </section>

      <section className="section-wrap prose-section">
        <div className="section-heading" data-reveal>
          <div><p className="eyebrow dark-eyebrow">HOW WE WORK</p><h2>From operating environment to operational capability.</h2></div>
        </div>
        <ol className="steps">
          {steps.map(([a, b], i) => (
            <li key={a} data-reveal style={{ transitionDelay: `${i * 70}ms` }}><span>0{i + 1}</span><p><strong>{a}</strong> {b}</p></li>
          ))}
        </ol>
      </section>

      <section className="approach" aria-labelledby="resp-title">
        <div className="section-wrap approach-inner">
          <div className="approach-heading" data-reveal>
            <p className="eyebrow">RESPONSIBLE TECHNOLOGY</p>
            <h2 id="resp-title">Fit for purpose.<br /><em>Explainable. Governed.</em></h2>
            <p>We believe AI and automation should be fit for purpose, explainable to their users and governed throughout their lifecycle. In sensitive domains such as healthcare and public administration, technology should support accountable professionals and established institutional processes — not silently replace them.</p>
          </div>
          <div className="principle-grid">
            {principles.map(([title, detail], index) => (
              <article className="principle" key={title} data-reveal style={{ transitionDelay: `${index * 80}ms` }}>
                <span>0{index + 1}</span><h3>{title}</h3><p>{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="section-wrap cta-inner">
          <div><h2>Meet the people behind the work.</h2><p>Leadership biographies and project experience.</p></div>
          <Link className="button button-light" href="/leadership">Leadership <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </>
  );
}
