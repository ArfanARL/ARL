"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const stats = [
  { to: 2000, label: "Sites", note: "reported footprint" },
  { to: 25000, label: "Users", note: "administrative & clinical" },
  { to: 10000, label: "Mobile users", note: "patients & providers" },
  { to: 400000, label: "Clients processed daily", note: "counting unit not defined" },
];

function Counter({ to, run }: { to: number; run: boolean }) {
  const [v, setV] = useState(to);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1600;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setV(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, to]);
  return <>{v.toLocaleString("en-US")}+</>;
}

/** Reported provincial-HMIS figures with count-up on first view. Final values render without JavaScript. */
export default function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setRun(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="stats-strip" aria-label="Provincial HMIS reported footprint">
      <div className="section-wrap" ref={ref}>
        <p className="stats-kicker"><span className="pulse-dot" aria-hidden="true" /> PROVINCIAL HEALTHCARE MANAGEMENT INFORMATION SYSTEM</p>
        <dl className="stats-grid">
          {stats.map((s) => (
            <div key={s.label}>
              <dd><Counter to={s.to} run={run} /></dd>
              <dt>{s.label}<small>{s.note}</small></dt>
            </div>
          ))}
        </dl>
        <p className="stats-foot">Owner-reported figures, not independently audited. <Link href="/projects/provincial-hmis">Read the case study ↗</Link></p>
      </div>
    </section>
  );
}
