"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { processSteps } from "@/lib/copy";
import { SectionReveal } from "@/components/SectionReveal";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useTranslations } from "@/lib/useTranslations";
import { PROCESS_STEP_KEYS } from "@/lib/translations";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export function ProcessSection() {
  const t = useTranslations();
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    const line = lineRef.current;
    if (!section || !line || reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "bottom 40%",
            scrub: true,
          },
        }
      );

      stepRefs.current.forEach((step) => {
        if (!step) return;
        ScrollTrigger.create({
          trigger: step,
          start: "top 65%",
          end: "bottom 45%",
          onEnter: () => step.setAttribute("data-active", "true"),
          onEnterBack: () => step.setAttribute("data-active", "true"),
          onLeave: () => step.removeAttribute("data-active"),
          onLeaveBack: () => step.removeAttribute("data-active"),
        });
      });
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <SectionReveal>
      <section
        id="process"
        ref={sectionRef}
        className="relative z-20 border-t border-white/[0.06] bg-obsidian px-6 py-16 sm:px-10 sm:py-24 lg:px-16"
      >
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-champagne/50">
            {t.process.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-medium tracking-tighter text-bone sm:text-4xl">
            {t.process.heading}
          </h2>

          <div className="relative mt-12 sm:mt-16">
            <div
              ref={lineRef}
              className="absolute bottom-0 left-[11px] top-0 w-px origin-top bg-gradient-to-b from-champagne/50 via-champagne/20 to-transparent sm:left-[15px]"
              aria-hidden
            />

            <div className="space-y-10 sm:space-y-14">
              {processSteps.map((step, i) => (
                <div
                  key={step.id}
                  ref={(el) => { stepRefs.current[i] = el; }}
                  className="group relative pl-10 sm:pl-12"
                  data-active={reducedMotion ? "true" : undefined}
                >
                  <span
                    className={cn(
                      "absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[9px] transition-colors duration-500 sm:h-7 sm:w-7",
                      "border-white/[0.1] bg-obsidian text-bone/35",
                      "group-data-[active=true]:border-champagne/40 group-data-[active=true]:text-champagne/80"
                    )}
                  >
                    {step.index}
                  </span>
                  <h3
                    className={cn(
                      "text-xl font-medium tracking-tight text-bone/70 transition-colors duration-500 sm:text-2xl",
                      "group-data-[active=true]:text-bone"
                    )}
                  >
                    {t.process[PROCESS_STEP_KEYS[i]].title}
                  </h3>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-bone/40 transition-colors duration-500 group-data-[active=true]:text-bone/55">
                    {t.process[PROCESS_STEP_KEYS[i]].desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}
