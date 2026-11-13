import Link from "next/link";
import ProjectCard from "../../components/ProjectCard";
import { pillars } from "../../lib/content";
import { getLeaders, getProjects, getResearch } from "../../lib/data";

const featuredSlugs = ["provincial-hmis", "emr-cct-integration", "intelligent-file-management"];

export default async function HomePage() {
  const [projects, research, leaders] = await Promise.all([getProjects(), getResearch(), getLeaders()]);
  const flagged = projects.filter((p) => p.featured);
  const featured = (flagged.length >= 3 ? flagged : featuredSlugs.map((s) => projects.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => Boolean(p))).slice(0, 3);
  return (
    <>
      <section className="hero" id="home" aria-labelledby="hero-title">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow"><span /> RESEARCH-LED TECHNOLOGY. REAL-WORLD OUTCOMES.</p>
          <h1 id="hero-title">Intelligent Systems. <em>Practical Impact.</em></h1>
          <p className="hero-copy">Agentic Research Labs researches, designs and engineers AI-enabled platforms, healthcare and enterprise information systems, and secure digital infrastructure for complex institutional environments.</p>
          <p className="hero-copy hero-copy-2">From applied research and solution architecture to integration and operational delivery, we turn complex challenges into dependable digital capability.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/contact">Discuss a Project <span aria-hidden="true">→</span></Link>
            <Link className="text-link" href="/projects">Explore Our Work <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="hero-footnote"><span>INDEPENDENT THINKING. DISCIPLINED DELIVERY.</span></div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
          <div className="core-node"><span>ARL</span><small>INTELLIGENCE<br />IN PRACTICE</small></div>
          <span className="node node-a">AI SYSTEMS</span><span className="node node-b">RESEARCH</span><span className="node node-c">ENTERPRISE</span>
          <span className="art-caption">APPLIED INTELLIGENCE / 01</span>
        </div>
        <div className="hero-bottomline"><span>EST. 2007 · LAHORE · PAKISTAN</span><span>RESEARCH / ENGINEERING / IMPLEMENTATION</span></div>
      </section>

      <section className="intro section-wrap" aria-labelledby="about-title">
        <p className="eyebrow dark-eyebrow">01 / WHO WE ARE</p>
        <div className="intro-content" data-reveal>
          <h2 id="about-title">Technology should do more than automate isolated tasks.</h2>
          <div>
            <p>It should help institutions connect information, improve decisions and deliver essential services with greater clarity and control. Established in 2007, Agentic Research Labs brings together applied AI, software engineering, data intelligence and systems integration to address these challenges.</p>
            <Link className="inline-link" href="/about">About the company <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <section className="capabilities" id="capabilities" aria-labelledby="cap-title">
        <div className="section-wrap">
          <div className="section-heading" data-reveal>
            <div><p className="eyebrow dark-eyebrow">02 / THREE STRATEGIC PILLARS</p><h2 id="cap-title">Three connected areas<br />of expertise.</h2></div>
            <p>From intelligent applications to the infrastructure beneath them, we focus on technology that solves meaningful operational problems.</p>
          </div>
          <div className="pillar-grid">
            {pillars.map((item, i) => (
              <article className="pillar-card" key={item.id} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="pillar-top"><span className="pillar-number">{item.number}</span><span className="pillar-cross" aria-hidden="true">＋</span></div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <ul>{item.offerings.slice(0, 3).map((tag) => <li key={tag}>{tag.split(" (")[0]}</li>)}</ul>
                </div>
                <Link href={`/solutions#${item.id}`} aria-label={`Explore ${item.title}`}>↗</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="work section-wrap" aria-labelledby="work-title">
        <div className="section-heading work-heading" data-reveal>
          <div><p className="eyebrow dark-eyebrow">03 / SELECTED EXPERIENCE</p><h2 id="work-title">Featured projects.</h2></div>
          <p>Our leadership’s experience includes public-health information systems, hospital platforms, government enterprise applications, agentic AI workflows, geospatial decision support and medical-imaging integration.</p>
        </div>
        <div className="project-grid">
          {featured.map((p, i) => <ProjectCard key={p.slug} project={p} delay={i * 90} />)}
        </div>
        <p className="section-note" data-reveal>
          Project work has been undertaken in different employment and consultancy contexts. Each case study identifies its project context so that prior professional experience is not confused with projects contracted directly to Agentic Research Labs.
        </p>
        <Link className="inline-link" href="/projects">View all {projects.length} projects <span aria-hidden="true">↗</span></Link>
      </section>

      <section className="approach" aria-labelledby="approach-title">
        <div className="section-wrap approach-inner">
          <div className="approach-heading" data-reveal>
            <p className="eyebrow">04 / RESEARCH</p>
            <h2 id="approach-title">Research with purpose.<br /><em>Engineering with discipline.</em></h2>
            <p>Complex environments require more than a promising prototype. Our research work examines how AI and health information systems can be governed, evaluated and trusted over time.</p>
            <Link className="text-link" href="/research">Explore our research <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="research-stack">
            {research.map((r, i) => (
              <article className="research-mini" key={r.slug} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
                <span>{r.kind}</span>
                <h3><Link href={`/research/${r.slug}`}>{r.title}</Link></h3>
                <p>{r.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="leadership section-wrap" aria-labelledby="lead-title">
        <div data-reveal>
          <p className="eyebrow dark-eyebrow">05 / LEADERSHIP</p>
          <h2 id="lead-title">Experience shaped by<br />complex technology environments.</h2>
          <p className="leadership-intro">The company is led by professionals bringing together technology leadership, operational delivery and applied research.</p>
          <Link className="inline-link" href="/leadership">Meet the leadership <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="leaders-grid">
          {leaders.map((l, i) => (
            <article className="leader-card" key={l.name} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="leader-initials" aria-hidden="true">{l.initials}</span>
              <div><h3>{l.name}</h3><p>{l.role}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-band" aria-labelledby="cta-title">
        <div className="section-wrap cta-inner">
          <div data-reveal>
            <p className="eyebrow">06 / START A CONVERSATION</p>
            <h2 id="cta-title">Have a complex institutional challenge?</h2>
            <p>Let’s explore the right combination of research, architecture and engineering.</p>
          </div>
          <Link className="button button-light" href="/contact">Contact Agentic Research Labs <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </>
  );
}
