"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "partners", label: "Partners" },
  { id: "work", label: "Work" },
  { id: "process", label: "Process" },
  { id: "contact", label: "Contact" },
] as const;

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState("hero");

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const max =
        document.documentElement.scrollHeight - window.innerHeight || 1;
      setProgress(Math.min(1, scrollTop / max));

      const offset = window.innerHeight * 0.35;
      let current = "hero";
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= offset) {
          current = section.id;
        }
      }
      setActiveId(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[180] h-px bg-white/[0.06]"
        aria-hidden
      >
        <div
          className="h-full origin-left bg-gradient-to-r from-champagne/40 via-champagne/70 to-champagne/40"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <nav
        className="fixed right-4 top-1/2 z-[170] hidden -translate-y-1/2 flex-col gap-3 md:flex"
        aria-label="Section navigation"
      >
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="group flex items-center justify-end gap-2"
            aria-label={section.label}
            aria-current={activeId === section.id ? "true" : undefined}
          >
            <span
              className={cn(
                "font-mono text-[8px] uppercase tracking-[0.2em] opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                activeId === section.id ? "text-champagne/80" : "text-bone/40"
              )}
            >
              {section.label}
            </span>
            <span
              className={cn(
                "block rounded-full transition-all duration-300",
                activeId === section.id
                  ? "h-2 w-2 bg-champagne/80"
                  : "h-1.5 w-1.5 bg-white/20 group-hover:bg-white/40"
              )}
            />
          </a>
        ))}
      </nav>
    </>
  );
}
