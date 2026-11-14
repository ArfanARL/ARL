import Link from "next/link";
import ClientsStrip from "../../components/ClientsStrip";
import HeroBackground from "../../components/HeroBackground";
import HmisFlow from "../../components/HmisFlow";
import ProjectCard from "../../components/ProjectCard";
import StatsStrip from "../../components/StatsStrip";
import { pillars } from "../../lib/content";
import { getLeaders, getProjects, getResearch } from "../../lib/data";

const pipeline = [
  ["Research", "Evidence, evaluation and responsible-AI design before anything is built."],
  ["Architecture", "Standards-based, secure and governed designs that fit the institution."],
  ["Engineering", "Integrated software, data and AI components, tested for reliability."],
  ["Operation", "Deployment, monitoring and continuous improvement with human oversight."],
];

const paths = [
  { href: "/solutions#platforms", label: "Healthcare platforms" },
  { href: "/solutions#ai", label: "Agentic AI" },
  { href: "/research", label: "Applied research" },
];

function PillarIcon({ id }: { id: string }) {
  return (
    <svg className="pillar-icon" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {id === "ai" && (<><circle cx="20" cy="8" r="3.4" /><circle cx="8" cy="30" r="3.4" /><circle cx="32" cy="30" r="3.4" /><circle cx="20" cy="21" r="2.4" /><path d="M20 11.4V18.6M17.9 22.6 10.6 27.6M22.1 22.6l7.3 5M11.4 30h17.2" /></>)}
      {id === "platforms" && (<><rect x="6" y="9" width="28" height="22" rx="4" /><path d="M20 15v10M15 20h10" /><path d="M11 35h18" /></>)}
      {id === "research" && (<><path d="M20 4l12 7v14l-12 7-12-7V11z" /><circle cx="20" cy="18" r="4" /><path d="M23 21l5 5" /></>)}
    </svg>
  );
}

const featuredSlugs = ["provincial-hmis", "emr-cct-integration", "intelligent-file-management"];

export default async function HomePage() {
  const [projects, research, leaders] = await Promise.all([getProjects(), getResearch(), getLeaders()]);
  const flagged = projects.filter((p) => p.featured);
  const featured = (flagged.length >= 3 ? flagged : featuredSlugs.map((s) => projects.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => Boolean(p))).slice(0, 3);
  return (
    <>
      <section className="hero" id="home" aria-labelledby="hero-title">
        <div className="hero-grid" aria-hidden="true" />
        <HeroBackground />
        <div className="hero-content">
          <p className="eyebrow"><span /> RESEARCH-LED TECHNOLOGY. REAL-WORLD OUTCOMES.</p>
          <h1 id="hero-title">Intelligent Systems. <em>Practical Impact.</em></h1>
          <p className="hero-copy">Agentic Research Labs researches, designs and engineers AI-enabled platforms, healthcare and enterprise information systems, and secure digital infrastructure for complex institutional environments.</p>
          <p className="hero-copy hero-copy-2">From applied research and solution architecture to integration and operational delivery, we turn complex challenges into dependable digital capability.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/contact">Discuss a Project <span aria-hidden="true">→</span></Link>
            <Link className="text-link" href="/projects">Explore Our Work <span aria-hidden="true">↗</span></Link>
          </div>
          <ul className="hero-paths" aria-label="Where to start">
            {paths.map((p) => <li key={p.href}><Link href={p.href}>{p.label} <span aria-hidden="true">→</span></Link></li>)}
          </ul>
          <div className="hero-footnote"><span>INDEPENDENT THINKING. DISCIPLINED DELIVERY.</span></div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
          <div className="core-node"><span>ARL</span><small>INTELLIGENCE<br />IN PRACTICE</small></div>
          <span className="node node-a">AGENTIC AI</span><span className="node node-b">HEALTHCARE</span><span className="node node-c">RESEARCH</span>
          <span className="art-caption">APPLIED INTELLIGENCE / 01</span>
        </div>
        <div className="hero-bottomline"><span>EST. 2007 · LAHORE · PAKISTAN</span><span>RESEARCH / ENGINEERING / IMPLEMENTATION</span></div>
      </section>

      <StatsStrip />

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
                <div className="pillar-top"><span className="pillar-number">{item.number}</span><PillarIcon id={item.id} /></div>
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

      <section className="health-band" aria-labelledby="health-title">
        <div className="section-wrap health-inner">
          <div className="health-copy" data-reveal>
            <p className="eyebrow">03 / HEALTHCARE AT SCALE</p>
            <h2 id="health-title">From the clinic to the<br />provincial core.</h2>
            <p>Healthcare information is only useful when it connects. Our provincial HMIS links facilities, district hubs and a secure core around a unified patient record — with AI as governed decision support, never a silent replacement for clinical judgement.</p>
            <ul className="health-points">
              <li><b>Longitudinal record</b> — one patient history across facilities</li>
              <li><b>Connected diagnostics</b> — LIS, RIS, PACS and blood-bank traceability</li>
              <li><b>Standards-based</b> — ICD-11, SNOMED CT, LOINC, HL7/FHIR</li>
              <li><b>Surveillance</b> — ICD-11 disease signals for public-health teams</li>
            </ul>
            <div className="health-actions">
              <Link className="button button-primary" href="/projects/provincial-hmis">Read the case study <span aria-hidden="true">→</span></Link>
              <Link className="text-link" href="/research/ai-enabled-hmis">Evaluation research ↗</Link>
            </div>
          </div>
          <div data-reveal style={{ transitionDelay: "120ms" }}><HmisFlow /></div>
        </div>
      </section>

      <section className="pipeline section-wrap" aria-labelledby="pipeline-title">
        <div className="section-heading" data-reveal>
          <div><p className="eyebrow dark-eyebrow">04 / HOW WE WORK</p><h2 id="pipeline-title">From research to<br />operational capability.</h2></div>
          <p>Complex environments need more than a promising prototype. Every engagement moves through the same four disciplined stages.</p>
        </div>
        <ol className="pipeline-steps">
          {pipeline.map(([title, text], i) => (
            <li key={title} data-reveal style={{ transitionDelay: `${i * 110}ms` }}>
              <span className="pipeline-num">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="work section-wrap" aria-labelledby="work-title">
        <div className="section-heading work-heading" data-reveal>
          <div><p className="eyebrow dark-eyebrow">05 / SELECTED EXPERIENCE</p><h2 id="work-title">Featured projects.</h2></div>
          <p>Our leadership’s experience includes public-health information systems, hospital platforms, government enterprise applications, agentic AI workflows, geospatial decision support and medical-imaging integration.</p>
        </div>
        <div className="project-grid">
          {featured.map((p, i) => <ProjectCard key={p.slug} project={p} delay={i * 90} />)}
        </div>
        <p className="section-note" data-reveal>
          Every project is delivered through Agentic Research Labs for public-sector and development-sector clients. Each case study names the client context, and reported figures are shown with their original scope.
        </p>
        <Link className="inline-link" href="/projects">View all {projects.length} projects <span aria-hidden="true">↗</span></Link>
      </section>

      <ClientsStrip />

      <section className="approach" aria-labelledby="approach-title">
        <div className="section-wrap approach-inner">
          <div className="approach-heading" data-reveal>
            <p className="eyebrow">06 / RESEARCH</p>
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
          <p className="eyebrow dark-eyebrow">07 / LEADERSHIP</p>
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
            <p className="eyebrow">08 / START A CONVERSATION</p>
            <h2 id="cta-title">Have a complex institutional challenge?</h2>
            <p>Let’s explore the right combination of research, architecture and engineering.</p>
          </div>
          <Link className="button button-light" href="/contact">Contact Agentic Research Labs <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </>
  );
}
