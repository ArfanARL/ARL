import type { Metadata, Viewport } from "next";
import { DM_Mono, DM_Sans, Manrope } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "../lib/config";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Manrope({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

const title = "Agentic Research Labs | Intelligent Systems. Practical Impact.";
const description =
  "Established in 2007, Agentic Research Labs is a research-led technology company in Lahore, Pakistan developing LLM and agentic AI solutions, healthcare IT and enterprise software for complex institutions and essential services.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: "%s | Agentic Research Labs" },
  description,
  applicationName: "Agentic Research Labs",
  keywords: ["agentic AI", "enterprise AI", "healthcare technology", "applied research", "responsible AI", "Lahore", "Pakistan"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Agentic Research Labs",
    title,
    description,
    url: "/",
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10283c",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Agentic Research Labs (Pvt) Ltd",
  slogan: "Intelligent Systems. Practical Impact.",
  foundingDate: "2007",
  logo: `${SITE_URL}/brand/logo-mark.svg`,
  url: SITE_URL,
  description,
  address: { "@type": "PostalAddress", addressLocality: "Lahore", addressCountry: "PK" },
  email: "info@agenticresearchlabs.com",
  employee: [
    { "@type": "Person", name: "Abid Ghaffar", jobTitle: "Chief Executive Officer" },
    { "@type": "Person", name: "Muhammad Arfan", jobTitle: "Director, Operations & Research" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body>
        <a className="skip-link" href="#main">Skip to main content</a>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
