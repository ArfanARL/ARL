/**
 * Agentic Research Labs logo — "Orbit" mark: a research core with two crossing orbits and satellite
 * nodes. The wordmark is live text so it picks up the site fonts and stays crisp at any size.
 */
export function LogoMark({ size = 44, onDark = false, className = "" }: { size?: number; onDark?: boolean; className?: string }) {
  return (
    <svg className={`logo-mark${onDark ? " on-dark" : ""} ${className}`.trim()} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect className="bg" width="64" height="64" rx="14" fill="#10283c" stroke={onDark ? "#2f5c70" : "none"} strokeWidth="1.5" />
      <ellipse cx="32" cy="32" rx="23" ry="9" transform="rotate(-30 32 32)" fill="none" stroke="#72cbb7" strokeWidth="2.2" />
      <ellipse cx="32" cy="32" rx="23" ry="9" transform="rotate(30 32 32)" fill="none" stroke="#3f8f95" strokeWidth="2.2" />
      <circle cx="32" cy="32" r="6.5" fill="#72cbb7" />
      <circle cx="51.9" cy="20.5" r="3.2" fill="#ffffff" />
      <circle cx="12.1" cy="20.5" r="2.2" fill="#8bd5c6" />
    </svg>
  );
}

export function Wordmark({ onDark = false, tagline = false }: { onDark?: boolean; tagline?: boolean }) {
  return (
    <span className={`wordmark${onDark ? " on-dark" : ""}`}>
      <b>AGENTIC</b>
      <span>RESEARCH LABS</span>
      {tagline && <small>INTELLIGENT SYSTEMS. PRACTICAL IMPACT.</small>}
    </span>
  );
}

export default function Logo({ onDark = false, tagline = false, size = 44 }: { onDark?: boolean; tagline?: boolean; size?: number }) {
  return (
    <>
      <LogoMark size={size} onDark={onDark} />
      <Wordmark onDark={onDark} tagline={tagline} />
    </>
  );
}
