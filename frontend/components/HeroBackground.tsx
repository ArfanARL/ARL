"use client";

import { useEffect, useRef } from "react";

/**
 * Animated hero backdrop for a healthcare-research company:
 *  - a drifting network of "agents" (circles), "health" nodes (crosses) and "research" nodes (hexagons)
 *  - signal pulses that travel between linked nodes, as agents exchanging messages
 *  - a scrolling ECG trace along the lower edge
 *  - gentle reaction to the pointer
 * Pauses when off-screen or the tab is hidden; renders one still frame for reduced-motion users.
 */

type Node = { x: number; y: number; vx: number; vy: number; r: number; kind: 0 | 1 | 2; phase: number };
type Pulse = { a: number; b: number; t: number; speed: number };

const TEAL = "114,203,183";
const LINK = 135;

/** One heartbeat, u in [0,1) -> vertical offset in px (negative = up). */
function ecg(u: number): number {
  if (u < 0.15) return 0;
  if (u < 0.25) return -Math.sin(((u - 0.15) / 0.1) * Math.PI) * 5; // P wave
  if (u < 0.33) return 0;
  if (u < 0.36) return ((u - 0.33) / 0.03) * 5; // Q
  if (u < 0.4) return 5 - ((u - 0.36) / 0.04) * 44; // R spike
  if (u < 0.44) return -39 + ((u - 0.4) / 0.04) * 49; // S
  if (u < 0.48) return 10 - ((u - 0.44) / 0.04) * 10;
  if (u < 0.62) return 0;
  if (u < 0.78) return -Math.sin(((u - 0.62) / 0.16) * Math.PI) * 9; // T wave
  return 0;
}

export default function HeroBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const host = canvas.parentElement as HTMLElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, raf = 0, last = performance.now(), spawn = 0;
    let onScreen = true;
    let nodes: Node[] = [];
    let pulses: Pulse[] = [];
    const mouse = { x: -999, y: -999 };

    function resize() {
      const r = host.getBoundingClientRect();
      w = r.width; h = r.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(w * dpr); canvas!.height = Math.round(h * dpr);
      canvas!.style.width = `${w}px`; canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(24, Math.min(84, Math.round((w * h) / 16000)));
      nodes = Array.from({ length: count }, () => {
        const k = Math.random();
        return { x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28, r: 1.5 + Math.random() * 1.7, kind: (k < 0.2 ? 1 : k < 0.38 ? 2 : 0) as 0 | 1 | 2, phase: Math.random() * 6.28 };
      });
      pulses = [];
      if (reduce) draw(0);
    }

    function neighbours(i: number): number[] {
      const out: number[] = [];
      for (let j = 0; j < nodes.length; j++) {
        if (j === i) continue;
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (dx * dx + dy * dy < LINK * LINK) out.push(j);
      }
      return out;
    }

    function drawNode(n: Node, glow: number) {
      const c = ctx!;
      c.fillStyle = `rgba(${n.kind === 1 ? "200,240,232" : "139,213,198"},${0.55 + glow * 0.4})`;
      c.strokeStyle = c.fillStyle;
      c.lineWidth = 1.2;
      if (n.kind === 0) {
        c.beginPath(); c.arc(n.x, n.y, n.r + glow, 0, 6.283); c.fill();
      } else if (n.kind === 1) {
        const s = n.r + 2 + glow; // medical cross
        c.beginPath(); c.moveTo(n.x - s, n.y); c.lineTo(n.x + s, n.y); c.moveTo(n.x, n.y - s); c.lineTo(n.x, n.y + s); c.lineWidth = 1.6; c.stroke();
      } else {
        const s = n.r + 2.5 + glow; // hexagon = molecule / research
        c.beginPath();
        for (let k = 0; k < 6; k++) { const a = (Math.PI / 3) * k + 0.5; const px = n.x + Math.cos(a) * s, py = n.y + Math.sin(a) * s; k ? c.lineTo(px, py) : c.moveTo(px, py); }
        c.closePath(); c.stroke();
      }
    }

    function draw(t: number) {
      const c = ctx!;
      c.clearRect(0, 0, w, h);

      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            c.strokeStyle = `rgba(${TEAL},${(1 - Math.sqrt(d2) / LINK) * 0.3})`;
            c.lineWidth = 1;
            c.beginPath(); c.moveTo(nodes[i].x, nodes[i].y); c.lineTo(nodes[j].x, nodes[j].y); c.stroke();
          }
        }
      }

      // pointer links
      for (const n of nodes) {
        const dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 170) {
          c.strokeStyle = `rgba(190,240,228,${(1 - d / 170) * 0.55})`;
          c.lineWidth = 1;
          c.beginPath(); c.moveTo(mouse.x, mouse.y); c.lineTo(n.x, n.y); c.stroke();
        }
      }

      // pulses (agent messages)
      for (const p of pulses) {
        const a = nodes[p.a], b = nodes[p.b];
        const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t;
        const g = c.createRadialGradient(x, y, 0, x, y, 9);
        g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(0.35, `rgba(${TEAL},.6)`); g.addColorStop(1, `rgba(${TEAL},0)`);
        c.fillStyle = g; c.beginPath(); c.arc(x, y, 9, 0, 6.283); c.fill();
      }

      // nodes
      for (const n of nodes) {
        const mx = n.x - mouse.x, my = n.y - mouse.y;
        const near = Math.max(0, 1 - Math.hypot(mx, my) / 150);
        const breathe = 0.5 + 0.5 * Math.sin(t / 900 + n.phase);
        drawNode(n, near + breathe * 0.25);
      }

      // ECG trace
      const base = h * 0.88;
      const period = Math.max(300, w / 3.2);
      const scroll = (t / 1000) * 70;
      const grad = c.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, `rgba(${TEAL},0)`); grad.addColorStop(0.25, `rgba(${TEAL},.55)`); grad.addColorStop(0.8, `rgba(${TEAL},.95)`); grad.addColorStop(1, `rgba(${TEAL},0)`);
      c.strokeStyle = grad; c.lineWidth = 1.7; c.lineJoin = "round";
      c.beginPath();
      let headY = base;
      const headX = w * 0.78;
      for (let x = 0; x <= w; x += 3) {
        const u = ((((x + scroll) % period) + period) % period) / period;
        const y = base + ecg(u);
        x === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
        if (Math.abs(x - headX) < 2) headY = y;
      }
      c.stroke();
      const hg = c.createRadialGradient(headX, headY, 0, headX, headY, 12);
      hg.addColorStop(0, "rgba(255,255,255,.95)"); hg.addColorStop(0.4, `rgba(${TEAL},.55)`); hg.addColorStop(1, `rgba(${TEAL},0)`);
      c.fillStyle = hg; c.beginPath(); c.arc(headX, headY, 12, 0, 6.283); c.fill();
    }

    function frame(now: number) {
      raf = 0;
      if (!onScreen || document.hidden) return;
      const dt = Math.min(now - last, 50);
      last = now;

      for (const n of nodes) {
        const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
        if (d < 190 && d > 1) { n.vx += (dx / d) * 0.004; n.vy += (dy / d) * 0.004; }
        n.vx *= 0.995; n.vy *= 0.995;
        n.x += n.vx * dt * 0.06 * 16; n.y += n.vy * dt * 0.06 * 16;
        if (n.x < -10) n.x = w + 10; else if (n.x > w + 10) n.x = -10;
        if (n.y < -10) n.y = h + 10; else if (n.y > h + 10) n.y = -10;
      }

      spawn += dt;
      if (spawn > 380 && pulses.length < 14) {
        spawn = 0;
        const a = Math.floor(Math.random() * nodes.length);
        const nb = neighbours(a);
        if (nb.length) pulses.push({ a, b: nb[Math.floor(Math.random() * nb.length)], t: 0, speed: 0.0007 + Math.random() * 0.0006 });
      }
      for (const p of pulses) p.t += p.speed * dt;
      pulses = pulses.filter((p) => p.t < 1);

      draw(now);
      raf = requestAnimationFrame(frame);
    }

    const start = () => { if (!reduce && !raf && onScreen && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };

    const onMove = (e: PointerEvent) => { const r = host.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    const onLeave = () => { mouse.x = -999; mouse.y = -999; };
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen) start(); }, { threshold: 0 });
    const ro = new ResizeObserver(resize);
    const onVis = () => { if (!document.hidden) start(); };

    resize();
    io.observe(host); ro.observe(host);
    host.addEventListener("pointermove", onMove); host.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      host.removeEventListener("pointermove", onMove); host.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} className="hero-canvas" aria-hidden="true" />;
}
