export default function PageHero({ eyebrow, title, lead, children }: { eyebrow: string; title: React.ReactNode; lead?: string; children?: React.ReactNode }) {
  return (
    <section className="page-hero">
      <div className="hero-grid" aria-hidden="true" />
      <div className="page-hero-inner">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {lead && <p className="page-lead">{lead}</p>}
        {children}
      </div>
    </section>
  );
}
