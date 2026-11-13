import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main id="main" className="status-page">
      <p className="eyebrow dark-eyebrow">404 / PAGE NOT FOUND</p>
      <h1>This page could not be found.</h1>
      <p>The address may be mistyped or the page may have moved.</p>
      <Link className="button button-primary" href="/">Return to the homepage <span aria-hidden="true">→</span></Link>
    </main>
  );
}
