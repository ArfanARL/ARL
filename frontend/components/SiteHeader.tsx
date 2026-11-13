"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";

const links = [
  { href: "/about", label: "About" },
  { href: "/solutions", label: "Solutions" },
  { href: "/projects", label: "Projects" },
  { href: "/research", label: "Research" },
  { href: "/leadership", label: "Leadership" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
      <Link className="brand" href="/" aria-label="Agentic Research Labs home">
        <Logo />
      </Link>
      <button
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="main-navigation"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <span /><span /><span />
      </button>
      <nav id="main-navigation" aria-label="Main navigation">
        {links.map((l) => (
          <Link key={l.href} href={l.href} aria-current={isActive(l.href) ? "page" : undefined}>
            {l.label}
          </Link>
        ))}
        <Link className="nav-contact" href="/contact" aria-current={isActive("/contact") ? "page" : undefined}>
          Contact <span aria-hidden="true">↗</span>
        </Link>
      </nav>
    </header>
  );
}
