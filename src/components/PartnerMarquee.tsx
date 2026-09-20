"use client";

import { partners } from "@/lib/copy";
import { SectionReveal } from "@/components/SectionReveal";
import { useTranslations } from "@/lib/useTranslations";

export function PartnerMarquee() {
  const t = useTranslations();
  const track = [...partners, ...partners];

  return (
    <SectionReveal>
      <section
        id="partners"
        className="relative z-20 border-t border-white/[0.06] bg-obsidian py-14 sm:py-16"
        aria-label="Partners and clients"
      >
        <p className="mb-8 text-center font-mono text-[9px] uppercase tracking-[0.35em] text-bone/30">
          {t.partners.heading}
        </p>
        <div className="marquee-mask overflow-hidden">
          <div className="marquee-track flex w-max gap-12 px-6 hover:[animation-play-state:paused]">
            {track.map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.25em] text-bone/25 transition-colors duration-500 hover:text-champagne/70"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}
