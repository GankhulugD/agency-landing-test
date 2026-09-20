"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { impactStats } from "@/lib/copy";
import { SectionReveal } from "@/components/SectionReveal";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useTranslations } from "@/lib/useTranslations";

gsap.registerPlugin(ScrollTrigger);

export function ImpactStats() {
  const t = useTranslations();
  const sectionRef = useRef<HTMLElement>(null);
  const valueRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (reducedMotion) {
      impactStats.forEach((stat, i) => {
        const el = valueRefs.current[i];
        if (el) el.textContent = `${stat.value}${stat.suffix}`;
      });
      return;
    }

    const ctx = gsap.context(() => {
      impactStats.forEach((stat, i) => {
        const el = valueRefs.current[i];
        if (!el) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: stat.value,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            el.textContent = `${Math.round(obj.val)}${stat.suffix}`;
          },
        });
      });
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <SectionReveal>
      <section
        id="impact"
        ref={sectionRef}
        className="relative z-20 border-t border-white/[0.06] bg-obsidian px-6 py-16 sm:px-10 sm:py-20 lg:px-16"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-6">
          {impactStats.map((stat, i) => (
            <div key={stat.id} className="text-center sm:text-left">
              <p
                className="text-3xl font-medium tracking-tight text-bone sm:text-4xl"
                aria-label={`${stat.value}${stat.suffix} ${stat.label}`}
              >
                <span ref={(el) => { valueRefs.current[i] = el; }}>0</span>
              </p>
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.25em] text-bone/35">
                {t.impact[stat.id as keyof typeof t.impact]}
              </p>
            </div>
          ))}
        </div>
      </section>
    </SectionReveal>
  );
}
