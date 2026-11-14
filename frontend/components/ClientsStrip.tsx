import { clients } from "../lib/content";

/** Text-only client list. Names are shown as text; logos are not used. */
export default function ClientsStrip({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <section className={`clients-strip clients-${tone}`} aria-labelledby="clients-title">
      <div className="section-wrap">
        <div className="clients-head" data-reveal>
          <p className="eyebrow">CLIENTS</p>
          <h2 id="clients-title">Delivered for public-sector and development clients.</h2>
        </div>
        <ul className="clients-list" data-reveal style={{ transitionDelay: "90ms" }}>
          {clients.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </div>
    </section>
  );
}
