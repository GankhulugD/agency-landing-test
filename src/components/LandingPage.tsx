"use client";

import { Hero } from "@/components/Hero";
import { SocialLinks } from "@/components/SocialLinks";
import { brand } from "@/lib/copy";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-obsidian">
      <Hero />

      <section
        id="contact"
        className="border-t border-white/[0.06] px-6 py-28 sm:px-10"
      >
        <div className="mx-auto max-w-xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-champagne/50">
            Contact
          </p>
          <h2 className="mt-4 text-2xl font-medium tracking-tighter text-bone sm:text-3xl">
            Begin with clarity.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-bone/45">
            Tell us where you are. We&apos;ll chart where to go.
          </p>
          <a
            href="mailto:hello@namooncompass.com"
            className="mt-10 inline-block border border-white/[0.12] px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/70 transition-all duration-500 hover:border-champagne/40 hover:text-bone"
          >
            Initiate
          </a>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
          <SocialLinks />
          <p className="font-mono text-[10px] tracking-[0.2em] text-bone/25">
            © {new Date().getFullYear()} {brand.name}
          </p>
        </div>
      </footer>
    </div>
  );
}
