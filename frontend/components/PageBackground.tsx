"use client";

import { useEffect, useRef } from "react";

/**
 * Themed canvas backdrops for sub-page heroes.
 *  network   – drifting agent / medical-cross / hexagon network with message pulses (About, Leadership)
 *  solutions – three orbiting pillar hubs (AI, healthcare, research) exchanging signals
 *  projects  – a three-tier system (facilities → hubs → core) with data flowing upward
 *  research  – a rotating DNA double helix with floating molecule hexagons and data points
 *  contact   – radiating signal rings and outgoing messages
 * Pauses off-screen / in a hidden tab; draws a single still frame for reduced-motion users.
 */
export type Variant = "network" | "solutions" | "projects" | "research" | "contact";

type Ctx = CanvasRenderingContext2D;
type Pt = { x: number; y: number };
type Scene = { step: (dt: number) => void; draw: (t: number, mouse: Pt) => void };

const TEAL = "114,203,183";
const PALE = "190,240,228";
const TAU = Math.PI * 2;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/* ------------------------------------------------------------------ glyphs */
function cross(c: Ctx, x: number, y: number, s: number, a: number, lw = 1.6) {
  c.strokeStyle = `rgba(${PALE},${a})`; c.lineWidth = lw; c.lineCap = "round";
  c.beginPath(); c.moveTo(x - s, y); c.lineTo(x + s, y); c.moveTo(x, y - s); c.lineTo(x, y + s); c.stroke();
}
function hex(c: Ctx, x: number, y: number, s: number, a: number, rot = 0.5, lw = 1.3) {
  c.strokeStyle = `rgba(139,213,198,${a})`; c.lineWidth = lw;
  c.beginPath();
  for (let k = 0; k < 6; k++) { const an = (Math.PI / 3) * k + rot; const px = x + Math.cos(an) * s, py = y + Math.sin(an) * s; k ? c.lineTo(px, py) : c.moveTo(px, py); }
  c.closePath(); c.stroke();
}
function dot(c: Ctx, x: number, y: number, r: number, a: number, col = "139,213,198") {
  c.fillStyle = `rgba(${col},${a})`; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
}
function glow(c: Ctx, x: number, y: number, r: number) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(0.35, `rgba(${TEAL},.6)`); g.addColorStop(1, `rgba(${TEAL},0)`);
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
}
function line(c: Ctx, a: Pt, b: Pt, alpha: number, lw = 1) {
  c.strokeStyle = `rgba(${TEAL},${alpha})`; c.lineWidth = lw; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
}

/* ----------------------------------------------------------------- network */
function networkScene(c: Ctx, w: number, h: number): Scene {
  const LINK = 125;
  const count = Math.max(18, Math.min(56, Math.round((w * h) / 15000)));
  const nodes = Array.from({ length: count }, () => {
    const k = Math.random();
    return { x: rand(0, w), y: rand(0, h), vx: rand(-0.2, 0.2), vy: rand(-0.2, 0.2), r: rand(1.4, 3), kind: k < 0.2 ? 1 : k < 0.38 ? 2 : 0, ph: rand(0, TAU) };
  });
  let pulses: { a: number; b: number; t: number; sp: number }[] = [];
  let spawn = 0;
  return {
    step(dt) {
      for (const n of nodes) {
        n.x += n.vx * dt * 0.06 * 16; n.y += n.vy * dt * 0.06 * 16;
        if (n.x < -10) n.x = w + 10; else if (n.x > w + 10) n.x = -10;
        if (n.y < -10) n.y = h + 10; else if (n.y > h + 10) n.y = -10;
      }
      spawn += dt;
      if (spawn > 420 && pulses.length < 10) {
        spawn = 0;
        const a = Math.floor(Math.random() * nodes.length);
        const nb = nodes.map((_, j) => j).filter((j) => j !== a && Math.hypot(nodes[a].x - nodes[j].x, nodes[a].y - nodes[j].y) < LINK);
        if (nb.length) pulses.push({ a, b: nb[Math.floor(Math.random() * nb.length)], t: 0, sp: rand(0.0007, 0.0013) });
      }
      pulses.forEach((p) => (p.t += p.sp * dt));
      pulses = pulses.filter((p) => p.t < 1);
    },
    draw(t, m) {
      c.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (d < LINK) line(c, nodes[i], nodes[j], (1 - d / LINK) * 0.28);
      }
      for (const n of nodes) { const d = Math.hypot(n.x - m.x, n.y - m.y); if (d < 160) line(c, m, n, (1 - d / 160) * 0.5); }
      for (const p of pulses) glow(c, nodes[p.a].x + (nodes[p.b].x - nodes[p.a].x) * p.t, nodes[p.a].y + (nodes[p.b].y - nodes[p.a].y) * p.t, 8);
      for (const n of nodes) {
        const a = 0.5 + 0.3 * Math.sin(t / 900 + n.ph);
        if (n.kind === 1) cross(c, n.x, n.y, n.r + 2, a); else if (n.kind === 2) hex(c, n.x, n.y, n.r + 2.5, a); else dot(c, n.x, n.y, n.r, a);
      }
    },
  };
}

/* --------------------------------------------------------------- solutions */
function solutionsScene(c: Ctx, w: number, h: number): Scene {
  const hubs = [
    { p: { x: w * 0.66, y: h * 0.3 }, kind: "ai", label: "AGENTIC AI" },
    { p: { x: w * 0.9, y: h * 0.42 }, kind: "health", label: "HEALTHCARE" },
    { p: { x: w * 0.74, y: h * 0.66 }, kind: "research", label: "RESEARCH" },
  ];
  const sats = hubs.map(() => Array.from({ length: 3 }, (_, k) => ({ r: 38 + k * 13, sp: (k % 2 ? -1 : 1) * rand(0.0005, 0.0011), ph: rand(0, TAU), s: 1.8 + k * 0.4 })));
  const field = Array.from({ length: Math.round((w * h) / 22000) }, () => ({ x: rand(0, w), y: rand(0, h), vx: rand(-0.12, 0.12), vy: rand(-0.12, 0.12) }));
  const edges: [number, number][] = [[0, 1], [1, 2], [2, 0]];
  return {
    step(dt) {
      field.forEach((f) => { f.x += f.vx * dt * 0.06 * 16; f.y += f.vy * dt * 0.06 * 16; if (f.x < 0) f.x = w; if (f.x > w) f.x = 0; if (f.y < 0) f.y = h; if (f.y > h) f.y = 0; });
    },
    draw(t, m) {
      c.clearRect(0, 0, w, h);
      for (const f of field) dot(c, f.x, f.y, 1.2, 0.35);
      for (const f of field) { const d = Math.hypot(f.x - m.x, f.y - m.y); if (d < 130) line(c, m, f, (1 - d / 130) * 0.4); }
      edges.forEach(([a, b], i) => {
        line(c, hubs[a].p, hubs[b].p, 0.3, 1.2);
        for (let k = 0; k < 2; k++) {
          const u = ((t / 2600 + i * 0.33 + k * 0.5) % 1);
          const pa = k ? hubs[b].p : hubs[a].p, pb = k ? hubs[a].p : hubs[b].p;
          glow(c, pa.x + (pb.x - pa.x) * u, pa.y + (pb.y - pa.y) * u, 9);
        }
      });
      hubs.forEach((hub, i) => {
        const { x, y } = hub.p;
        c.strokeStyle = `rgba(${TEAL},.5)`; c.lineWidth = 1.3; c.beginPath(); c.arc(x, y, 27 + Math.sin(t / 700 + i) * 1.5, 0, TAU); c.stroke();
        c.fillStyle = "rgba(14,58,74,.7)"; c.beginPath(); c.arc(x, y, 26, 0, TAU); c.fill();
        if (hub.kind === "health") cross(c, x, y, 9, 1, 2.4);
        else if (hub.kind === "research") hex(c, x, y, 10, 1, 0.5, 1.8);
        else { for (const [dx, dy] of [[0, -9], [-8, 6], [8, 6]]) { line(c, { x, y }, { x: x + dx, y: y + dy }, 0.8, 1.2); dot(c, x + dx, y + dy, 2.6, 1, PALE); } dot(c, x, y, 2.4, 1, TEAL); }
        sats[i].forEach((s) => { const a = s.ph + t * s.sp; c.strokeStyle = `rgba(${TEAL},.12)`; c.lineWidth = 1; c.beginPath(); c.arc(x, y, s.r, 0, TAU); c.stroke(); dot(c, x + Math.cos(a) * s.r, y + Math.sin(a) * s.r, s.s, 0.85); });
        c.font = "500 9px ui-monospace, Consolas, monospace"; c.textAlign = "center"; c.fillStyle = `rgba(${PALE},.65)`;
        c.fillText(hub.label, x, y + 54);
      });
    },
  };
}

/* ---------------------------------------------------------------- projects */
function projectsScene(c: Ctx, w: number, h: number): Scene {
  const x0 = w * 0.5, x1 = w * 0.96;
  const core: Pt = { x: (x0 + x1) / 2, y: h * 0.2 };
  const hubs: Pt[] = [0, 1, 2].map((i) => ({ x: x0 + ((x1 - x0) * (i + 0.5)) / 3, y: h * 0.5 }));
  const facs: Pt[] = Array.from({ length: 8 }, (_, i) => ({ x: x0 + ((x1 - x0) * (i + 0.5)) / 8, y: h * 0.82 }));
  const hubOf = (i: number) => Math.min(2, Math.floor(i / 2.67));
  let pulses: { f: number; t: number; sp: number }[] = [];
  let spawn = 0;
  const lerp = (a: Pt, b: Pt, u: number): Pt => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });
  return {
    step(dt) {
      spawn += dt;
      if (spawn > 360 && pulses.length < 12) { spawn = 0; pulses.push({ f: Math.floor(Math.random() * facs.length), t: 0, sp: rand(0.00045, 0.0008) }); }
      pulses.forEach((p) => (p.t += p.sp * dt));
      pulses = pulses.filter((p) => p.t < 1);
    },
    draw(t, m) {
      c.clearRect(0, 0, w, h);
      for (let gx = x0 - 30; gx < w; gx += 36) for (let gy = 12; gy < h; gy += 36) dot(c, gx, gy, 0.9, 0.16);
      facs.forEach((f, i) => { line(c, f, hubs[hubOf(i)], 0.22); });
      hubs.forEach((hb) => line(c, hb, core, 0.3, 1.2));
      for (const p of pulses) {
        const hub = hubs[hubOf(p.f)];
        const pos = p.t < 0.5 ? lerp(facs[p.f], hub, p.t * 2) : lerp(hub, core, (p.t - 0.5) * 2);
        glow(c, pos.x, pos.y, 9);
      }
      facs.forEach((f, i) => { const a = 0.5 + 0.35 * Math.sin(t / 800 + i); cross(c, f.x, f.y, 6, a, 2); });
      hubs.forEach((hb, i) => { hex(c, hb.x, hb.y, 15, 0.9, 0.5, 1.6); dot(c, hb.x, hb.y, 3, 0.9, TEAL); const d = Math.hypot(hb.x - m.x, hb.y - m.y); if (d < 120) line(c, m, hb, (1 - d / 120) * 0.6); void i; });
      c.strokeStyle = `rgba(${TEAL},.85)`; c.lineWidth = 1.5; c.beginPath(); c.arc(core.x, core.y, 22 + Math.sin(t / 600) * 1.5, 0, TAU); c.stroke();
      c.strokeStyle = `rgba(${TEAL},.3)`; c.beginPath(); c.arc(core.x, core.y, 31, 0, TAU); c.stroke();
      dot(c, core.x, core.y, 6, 1, TEAL);
      c.font = "500 9px ui-monospace, Consolas, monospace"; c.textAlign = "left"; c.fillStyle = `rgba(${PALE},.5)`;
      c.fillText("PROVINCIAL CORE", core.x + 40, core.y + 3); c.fillText("DISTRICT HUBS", x1 - 78, hubs[0].y - 28); c.fillText("FACILITIES", x1 - 58, facs[0].y + 26);
    },
  };
}

/* ---------------------------------------------------------------- research */
function researchScene(c: Ctx, w: number, h: number): Scene {
  const mols = Array.from({ length: Math.max(5, Math.round(w / 170)) }, () => ({ x: rand(w * 0.3, w), y: rand(0, h), s: rand(8, 22), vy: -rand(0.05, 0.16), rot: rand(0, 3), vr: rand(-0.0004, 0.0004), a: rand(0.2, 0.55) }));
  const pts = Array.from({ length: 22 }, (_, i) => ({ i, off: rand(-1, 1), ph: rand(0, TAU) }));
  return {
    step(dt) {
      mols.forEach((m) => { m.y += m.vy * dt * 0.06 * 16; m.rot += m.vr * dt; if (m.y < -30) { m.y = h + 30; m.x = rand(w * 0.3, w); } });
    },
    draw(t, m) {
      c.clearRect(0, 0, w, h);
      mols.forEach((mo) => { hex(c, mo.x, mo.y, mo.s, mo.a, mo.rot, 1.2); hex(c, mo.x, mo.y, mo.s * 0.45, mo.a * 0.7, mo.rot, 1); });
      // data scatter with trend line (lower left of the helix area)
      const sx = w * 0.54, sw = w * 0.42, sy = h * 0.9, sh = h * 0.22;
      c.strokeStyle = `rgba(${TEAL},.18)`; c.lineWidth = 1; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + sw, sy); c.stroke();
      pts.forEach((p) => { const x = sx + (p.i / 21) * sw; const y = sy - (p.i / 21) * sh * 0.8 - (p.off * 0.5 + 0.5) * sh * 0.3 - Math.sin(t / 1200 + p.ph) * 2; dot(c, x, y, 1.8, 0.45); });
      // DNA double helix, flowing right to left
      const x0 = w * 0.52, x1 = w + 20, cy = h * 0.46, A = Math.min(h * 0.28, 62), k = 0.028, sp = t / 900;
      const strand: { x: number; y1: number; y2: number; z: number }[] = [];
      for (let x = x0; x <= x1; x += 7) {
        const th = x * k + sp; const fade = Math.min(1, (x - x0) / 90);
        strand.push({ x, y1: cy + Math.sin(th) * A, y2: cy - Math.sin(th) * A, z: Math.cos(th) * fade });
      }
      strand.forEach((s, i) => { if (i % 3 === 0) { c.strokeStyle = `rgba(${TEAL},${0.12 + Math.abs(s.z) * 0.28})`; c.lineWidth = 1.2; c.beginPath(); c.moveTo(s.x, s.y1); c.lineTo(s.x, s.y2); c.stroke(); } });
      for (const which of [1, 2] as const) {
        for (const s of strand) { const y = which === 1 ? s.y1 : s.y2; const z = which === 1 ? s.z : -s.z; dot(c, s.x, y, 1.6 + (z + 1) * 1.3, 0.25 + (z + 1) * 0.35, which === 1 ? "139,213,198" : PALE); }
      }
      for (const s of strand) { const d = Math.hypot(s.x - m.x, s.y1 - m.y); if (d < 70) dot(c, s.x, s.y1, 4.5 * (1 - d / 70) + 2, 0.9, "255,255,255"); }
    },
  };
}

/* ----------------------------------------------------------------- contact */
function contactScene(c: Ctx, w: number, h: number): Scene {
  const o: Pt = { x: w * 0.8, y: h * 0.5 };
  const R = Math.max(w * 0.45, 260);
  let msgs: { a: number; d: number; sp: number }[] = [];
  let spawn = 0;
  return {
    step(dt) {
      spawn += dt;
      if (spawn > 520 && msgs.length < 14) { spawn = 0; msgs.push({ a: rand(0, TAU), d: 20, sp: rand(0.05, 0.1) }); }
      msgs.forEach((m) => (m.d += m.sp * dt));
      msgs = msgs.filter((m) => m.d < R);
    },
    draw(t) {
      c.clearRect(0, 0, w, h);
      for (let i = 0; i < 4; i++) {
        const u = ((t / 4200 + i / 4) % 1);
        c.strokeStyle = `rgba(${TEAL},${(1 - u) * 0.38})`; c.lineWidth = 1.3; c.beginPath(); c.arc(o.x, o.y, 18 + u * R, 0, TAU); c.stroke();
      }
      for (const m of msgs) { const x = o.x + Math.cos(m.a) * m.d, y = o.y + Math.sin(m.a) * m.d; glow(c, x, y, 7 * (1 - m.d / R) + 2); }
      glow(c, o.x, o.y, 22 + Math.sin(t / 500) * 3);
      dot(c, o.x, o.y, 6, 1, TEAL);
      cross(c, o.x, o.y, 4, 1, 1.8);
    },
  };
}

const factories: Record<Variant, (c: Ctx, w: number, h: number) => Scene> = {
  network: networkScene, solutions: solutionsScene, projects: projectsScene, research: researchScene, contact: contactScene,
};

export default function PageBackground({ variant = "network" }: { variant?: Variant }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const host = canvas.parentElement as HTMLElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, last = performance.now(), onScreen = true;
    let scene: Scene | null = null;
    const mouse: Pt = { x: -999, y: -999 };

    function resize() {
      const r = host.getBoundingClientRect();
      w = r.width; h = r.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(w * dpr); canvas!.height = Math.round(h * dpr);
      canvas!.style.width = `${w}px`; canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene = factories[variant](ctx!, w, h);
      if (reduce) scene.draw(2500, mouse);
    }
    function frame(now: number) {
      raf = 0;
      if (!onScreen || document.hidden || !scene) return;
      const dt = Math.min(now - last, 50); last = now;
      scene.step(dt); scene.draw(now, mouse);
      raf = requestAnimationFrame(frame);
    }
    const start = () => { if (!reduce && !raf && onScreen && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const onMove = (e: PointerEvent) => { const r = host.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    const onLeave = () => { mouse.x = -999; mouse.y = -999; };
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen) start(); });
    const ro = new ResizeObserver(resize);
    const onVis = () => { if (!document.hidden) start(); };

    resize(); io.observe(host); ro.observe(host);
    host.addEventListener("pointermove", onMove); host.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    start();
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      host.removeEventListener("pointermove", onMove); host.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [variant]);

  return <canvas ref={ref} className="page-canvas" aria-hidden="true" />;
}
