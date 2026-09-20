"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { testimonial } from "@/lib/copy";
import { SectionReveal } from "@/components/SectionReveal";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useTranslations } from "@/lib/useTranslations";

gsap.registerPlugin(ScrollTrigger);

export function TestimonialSection() {
  const t = useTranslations();
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion || !panelRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        panelRef.current,
        { y: 24 },
        {
          y: -24,
          ease: "none",
          scrollTrigger: {
            trigger: panelRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    });

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <SectionReveal>
      <section
        className="relative z-20 border-t border-white/[0.06] bg-obsidian px-6 py-16 sm:px-10 sm:py-24 lg:px-16"
        aria-label="Client testimonial"
      >
        <div
          ref={panelRef}
          className="mx-auto max-w-3xl rounded-sm border border-white/[0.08] bg-white/[0.03] px-6 py-10 backdrop-blur-md sm:px-10 sm:py-14"
        >
          <p className="text-xl leading-relaxed tracking-tight text-bone/80 sm:text-2xl sm:leading-relaxed">
            &ldquo;{t.testimonial.quote}&rdquo;
          </p>
          <footer className="mt-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-champagne/60">
              {t.testimonial.author}
            </p>
            <p className="font-mono text-[10px] tracking-[0.15em] text-bone/30">
              {t.testimonial.company}
            </p>
          </footer>
        </div>
      </section>
    </SectionReveal>
  );
}
