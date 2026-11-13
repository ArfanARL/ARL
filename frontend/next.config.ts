import type { NextConfig } from "next";

const apiOrigin = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
const isDev = process.env.NODE_ENV !== "production";
// Static export for GitHub Pages (set by the deploy workflow). Normal builds keep ISR and security headers.
const isExport = process.env.PAGES_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Content Security Policy. Next.js injects inline bootstrap scripts, so 'unsafe-inline' is
// required until a nonce-based policy is added (see docs/PROJECT_HANDOFF.md release gates).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin}${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' mailto:",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  ...(isExport
    ? { output: "export", basePath, trailingSlash: true, distDir: ".next-export", images: { unoptimized: true } }
    : { async headers() { return [{ source: "/:path*", headers: securityHeaders }]; } }),
};

export default nextConfig;
