"use client";

import { ContactSection } from "@/components/ContactSection";
import { GrainOverlay } from "@/components/GrainOverlay";
import { Hero } from "@/components/Hero";
import { ImpactStats } from "@/components/ImpactStats";
import { LanguageToggle } from "@/components/LanguageToggle";
import { PartnerMarquee } from "@/components/PartnerMarquee";
import { Preloader } from "@/components/Preloader";
import { ProcessSection } from "@/components/ProcessSection";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SiteFooter } from "@/components/SiteFooter";
import { SmoothScroll } from "@/components/SmoothScroll";
import { WorkSection } from "@/components/WorkSection";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-obsidian">
      <Preloader />
      <SmoothScroll />
      <ScrollProgress />
      <GrainOverlay />
      <LanguageToggle />

      <Hero />

      <PartnerMarquee />
      <WorkSection />
      <ImpactStats />
      <ProcessSection />

      <ContactSection />
      <SiteFooter />
    </div>
  );
}
