"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="status-page">
      <p className="eyebrow dark-eyebrow">SOMETHING WENT WRONG</p>
      <h1>We hit an unexpected problem.</h1>
      <p>Please try again. If the problem continues, email info@agenticresearchlabs.com.</p>
      <button type="button" className="button button-primary" onClick={reset}>Try again</button>
    </main>
  );
}
