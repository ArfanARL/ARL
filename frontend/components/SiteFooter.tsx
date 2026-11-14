import Link from "next/link";
import Logo from "./Logo";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <Link className="brand footer-brand" href="/" aria-label="Agentic Research Labs home">
          <Logo onDark />
        </Link>
        <p>Intelligent Systems. Practical Impact.</p>
      </div>
      <div className="footer-cols">
        <nav aria-label="Footer navigation">
          <h2>Explore</h2>
          <Link href="/about">About</Link>
          <Link href="/solutions">Solutions</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/research">Research</Link>
          <Link href="/leadership">Leadership</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <nav aria-label="Solutions">
          <h2>Solutions</h2>
          <Link href="/solutions#ai">AI & Agentic Systems</Link>
          <Link href="/solutions#platforms">Healthcare & Enterprise Platforms</Link>
          <Link href="/solutions#research">Applied Research & Digital Infrastructure</Link>
        </nav>
        <div>
          <h2>Company</h2>
          <p>Agentic Research Labs (Pvt) Ltd</p>
          <p>Established 2007</p>
          <p>Lahore, Pakistan</p>
        </div>
      </div>
      <div className="footer-bottom">
        <small>© {new Date().getFullYear()} Agentic Research Labs (Pvt) Ltd. All rights reserved.</small>
        <small>All projects are delivered through Agentic Research Labs. Reported figures are not independently audited.</small>
      </div>
    </footer>
  );
}
