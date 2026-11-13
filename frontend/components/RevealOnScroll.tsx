"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Progressive enhancement: content is fully visible without JavaScript. Once mounted (and only
 * when the visitor has not asked for reduced motion) elements marked [data-reveal] fade in as
 * they enter the viewport. Re-runs on every route change.
 */
export default function RevealOnScroll() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const root = document.documentElement;
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" },
    );
    targets.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in");
      else observer.observe(el);
    });
    root.classList.add("reveal-ready");
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
