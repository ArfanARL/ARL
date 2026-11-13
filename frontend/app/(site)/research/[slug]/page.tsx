import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "../../../../components/PageHero";
import { hmisAiCapabilities, hmisRoadmap, raiDomains, raiGaps, raiLevels } from "../../../../lib/content";
import { getResearch } from "../../../../lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getResearch()).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = (await getResearch()).find((x) => x.slug === slug);
  if (!r) return {};
  return { title: r.title, description: r.summary, alternates: { canonical: `/research/${r.slug}` } };
}

export default async function ResearchPage({ params }: Props) {
  const { slug } = await params;
  const item = (await getResearch()).find((r) => r.slug === slug);
  if (!item) notFound();

  return (
    <>
      <PageHero variant="research" eyebrow={item.kind.toUpperCase()} title={item.title} lead={item.summary}>
        <div className="hero-meta"><span className="badge badge-research">Research</span><span>{item.authors}</span></div>
      </PageHero>

      <article className="section-wrap case">
        <div className="case-grid">
          <div className="case-main">
            {slug === "rai-ectf" ? <RaiBody /> : slug === "ai-enabled-hmis" ? <HmisBody /> : (
              <>
                {(item.body ?? []).map((s) => (
                  <section key={s.heading} data-reveal><h2>{s.heading}</h2>{s.text.split(/\n{2,}/).map((p) => <p key={p}>{p}</p>)}</section>
                ))}
                {(item.body ?? []).length === 0 && <section><p>{item.summary}</p></section>}
              </>
            )}
          </div>
          <aside className="case-side">
            <div className="side-card" data-reveal>
              <h2>Publication details</h2>
              <dl className="meta-list">
                <div><dt>Authors</dt><dd>{item.authors}</dd></div>
                {item.affiliation && <div><dt>Affiliation</dt><dd>{item.affiliation}</dd></div>}
                <div><dt>Status</dt><dd>{item.status}</dd></div>
                <div><dt>Theme</dt><dd>{item.theme}</dd></div>
              </dl>
            </div>
            <div className="side-card" data-reveal>
              <h2>Keywords</h2>
              <ul className="tag-list">{item.keywords.map((k) => <li key={k}>{k}</li>)}</ul>
            </div>
            <div className="side-card note" data-reveal>
              <h2>Research integrity</h2>
              <p>{slug !== "rai-ectf" && slug !== "ai-enabled-hmis"
                ? "Research is labelled by maturity. Claims of validation, accuracy or effectiveness are made only where supporting evidence is cited."
                : slug === "rai-ectf"
                ? "This is a conceptual study. The framework is not empirically validated; validation through expert review, instrument development, pilot training and longitudinal study is identified as the next stage. Generative AI tools supported drafting and revision; the author verified all outputs and remains responsible for the content."
                : "Operational figures and capabilities come from system-owner materials and have not been independently audited. No patient data was analysed, and the paper does not assert diagnostic accuracy, mortality reduction, time or cost savings, or causal clinical benefit."}</p>
            </div>
          </aside>
        </div>
      </article>

      <section className="cta-band">
        <div className="section-wrap cta-inner">
          <div><h2>Interested in collaborating?</h2><p>We welcome research collaboration and review.</p></div>
          <div className="cta-actions">
            <Link className="button button-light" href="/contact">Get in touch <span aria-hidden="true">↗</span></Link>
            <Link className="text-link" href="/research">← All research</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function RaiBody() {
  return (
    <>
      <section data-reveal>
        <h2>The question</h2>
        <p>AI-ethics training often stops at principles and awareness, leaving open whether the people who build, buy, supervise and use AI systems can recognise and act on ethical risk. Taking the Weidinger et al. taxonomy of 21 language-model risks in six areas as a baseline, the paper asks what changes for training and governance in light of later work on AI literacy, responsible-AI education, risk management, management-system standards and regulation.</p>
      </section>
      <section data-reveal>
        <h2>Seven persistent gaps</h2>
        <ol className="gap-list">{raiGaps.map((g) => <li key={g}>{g}</li>)}</ol>
      </section>
      <section data-reveal>
        <h2>The RAI-ECTF framework</h2>
        <p>The Responsible AI Ethical Competence and Training Framework combines <strong>three competence dimensions</strong> — knowledge, judgment and action — with <strong>five progression levels</strong> and <strong>twelve competency domains</strong>, supported by a staged training architecture, role-based pathways and multi-method assessment. Its organising logic is <em>Risk → Competence → Progression → Training → Assessment → Governance → Reassessment</em>.</p>
        <h3>Progression levels</h3>
        <div className="level-row">
          {raiLevels.map(([name, text], i) => (
            <div className="level" key={name}><span>{i + 1}</span><strong>{name}</strong><p>{text}</p></div>
          ))}
        </div>
        <h3>Twelve competency domains</h3>
        <div className="domain-grid">
          {raiDomains.map(([code, name, text]) => (
            <div className="domain" key={code}><span>{code}</span><strong>{name}</strong><p>{text}</p></div>
          ))}
        </div>
      </section>
      <section data-reveal>
        <h2>Assessment and governance</h2>
        <p>Evidence of competence is gathered through knowledge tests, scenario-based judgment, observed performance, portfolios and behavioural evidence — and connected to risk registers, impact assessments, incident reporting and oversight. The paper positions the framework against the NIST AI risk-management guidance, ISO/IEC 42001, UNESCO competency frameworks and the 2026 recalibration of the EU AI Act’s AI-literacy provision.</p>
      </section>
      <section data-reveal>
        <h2>Contribution and limits</h2>
        <p>The contribution is conceptual: a complementary competence layer, not a replacement for ethical principles, risk frameworks or management standards. The review is purposive rather than exhaustive and the framework has not been empirically validated.</p>
      </section>
    </>
  );
}

function HmisBody() {
  return (
    <>
      <section data-reveal>
        <h2>Aim</h2>
        <p>To characterise the architecture and AI-enabled operating model of a multi-hospital Healthcare Management Information System (HMIS) and to establish a defensible framework for measuring its impact — deliberately separating <em>reported implementation scale</em> from <em>verified effectiveness</em>.</p>
        <p>The paper describes a descriptive, implementation-focused case study. It is a system characterisation and evaluation protocol, not a controlled effectiveness study.</p>
      </section>
      <section data-reveal>
        <h2>Research questions</h2>
        <ol className="gap-list">
          <li>How is the HMIS organised to support longitudinal patient information and cross-facility operations?</li>
          <li>Which AI-enabled capabilities are embedded in or connected to clinical and administrative workflows?</li>
          <li>Through what mechanisms could these capabilities improve information availability, workflow efficiency, patient safety and population-health intelligence?</li>
          <li>Which quantitative and qualitative measures are needed to determine whether the system produces meaningful benefits without unacceptable harms?</li>
          <li>What governance and interoperability conditions are necessary for safe and equitable operation at scale?</li>
        </ol>
      </section>
      <section data-reveal>
        <h2>Architecture</h2>
        <p>A federated three-tier ecosystem: health facilities (Tier 1), district data hubs (Tier 2) and a secure provincial core (Tier 3) hosting a central longitudinal patient record, shared services, embedded AI, logistics, workforce management and the patient mobile-app server — mediated by an interoperability hub and secure gateway. Named standards include HL7/FHIR, ICD-11, SNOMED CT, LOINC, RxNorm, ICHI and ICPC-2; the paper notes that naming a standard does not establish conformance.</p>
        <p><Link className="inline-link" href="/projects/provincial-hmis">See the project case study <span aria-hidden="true">↗</span></Link></p>
      </section>
      <section data-reveal>
        <h2>AI-enabled capabilities and the evidence they require</h2>
        <div className="domain-grid">
          {hmisAiCapabilities.map(([name, text]) => (
            <div className="domain" key={name}><strong>{name}</strong><p>{text}</p></div>
          ))}
        </div>
        <p>AI is positioned as decision support under human oversight. Each capability is paired with the evidence needed to substantiate its value, such as time-motion studies, alert precision and override rates, or model sensitivity and specificity with subgroup performance.</p>
      </section>
      <section data-reveal>
        <h2>Theory of change and evaluation</h2>
        <p>Structured longitudinal records and connected workflows provide the information substrate; AI functions may reduce information-processing burdens or prioritise review; and these changes may contribute to patient, operational and population-health outcomes — but only if the functions are accurate, adopted, integrated and governed. Expected benefits are expressed as testable <em>hypotheses</em> at patient, facility and population level, with an evaluation design covering technical performance, adoption, usability, clinical processes, patient experience, equity, safety and economics.</p>
        <p>The paper treats the system-owner deployment and usage figures supplied at the time of writing (for example 167 hospitals and more than 300,000 individuals impacted daily) as <strong>system-reported measures</strong> whose definitions and measurement dates require confirmation, and calculates no effect sizes. The latest owner-reported footprint is shown on the project page.</p>
      </section>
      <section data-reveal>
        <h2>National-to-global roadmap</h2>
        <ol className="roadmap">
          {hmisRoadmap.map(([n, name, text]) => (
            <li key={n}><span>{n}</span><div><strong>{name}</strong><p>{text}</p></div></li>
          ))}
        </ol>
        <p>Equity and access conditions include low-bandwidth operation, multilingual experiences, low-cost Android devices and measurement of adoption and outcomes by geography, facility type, language, age, sex and disability.</p>
      </section>
      <section data-reveal>
        <h2>Contribution</h2>
        <p>The authors’ contribution in the manuscript is architecture analysis, standards mapping, workflow modelling and the development of a measurement framework. The paper includes workflow specifications for registration and identity resolution, clinical encounters, AI-assisted decision support, device integration, medication safety, discharge and referral, commodity traceability and ICD-11 surveillance, together with downtime and recovery management and an acceptance checklist.</p>
      </section>
    </>
  );
}
