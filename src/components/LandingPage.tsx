"use client";

import { ContactSection } from "@/components/ContactSection";
import { Hero } from "@/components/Hero";
import { brand } from "@/lib/copy";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-obsidian">
      <Hero />

      <ContactSection />

      <footer className="relative z-20 border-t border-white/[0.06] bg-obsidian px-6 py-8">
        <p className="text-center font-mono text-[10px] tracking-[0.2em] text-bone/25">
          © {new Date().getFullYear()} {brand.name}
        </p>
      </footer>
    </div>
  );
}
