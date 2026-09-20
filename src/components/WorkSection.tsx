"use client";

import { useRef, type MouseEvent } from "react";
import { workProjects } from "@/lib/copy";
import { MagneticButton } from "@/components/MagneticButton";
import { useTranslations } from "@/lib/useTranslations";

function WorkCard({ projectKey }: { projectKey: string }) {
  const t = useTranslations();
  const cardRef = useRef<HTMLDivElement>(null);
  const project = workProjects.find((p) => p.id === projectKey)!;
  const pKey = projectKey as keyof typeof t.work.projects;
  const translated = t.work.projects[pKey];

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  };

  const onLeave = () => {
    const el = cardRef.current;
    if (el) el.style.transform = "";
  };

  return (
    <article
      ref={cardRef}
      className="work-card group relative flex h-[min(68vh,500px)] w-[var(--work-card-width)] shrink-0 snap-center flex-col justify-between rounded-sm border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-md transition-transform duration-300"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-champagne/50">
          {translated.category}
        </p>
        <h3 className="mt-4 text-2xl font-medium tracking-tight text-bone sm:text-3xl">
          {translated.title}
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-bone/45">
          {translated.outcome}
        </p>
      </div>
      <div className="flex items-end justify-between">
        <span className="font-mono text-[10px] tracking-[0.2em] text-bone/25">
          {project.year}
        </span>
        <MagneticButton
          className="rounded-sm border border-white/[0.1] bg-white/[0.04] px-4 py-2 font-mono text-[9px] uppercase tracking-[0.25em] text-bone/60 transition-colors hover:border-champagne/30 hover:text-bone"
        >
          {t.work.caseStudy}
          <span aria-hidden>→</span>
        </MagneticButton>
      </div>
      <div
        className="pointer-events-none absolute inset-0 rounded-sm opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(600px circle at var(--mx,50%) var(--my,50%), rgba(209,199,189,0.06), transparent 40%)",
        }}
        aria-hidden
      />
    </article>
  );
}

export function WorkSection() {
  const t = useTranslations();

  return (
    <section
      id="work"
      className="relative isolate z-30 border-t border-white/[0.06] bg-obsidian [--work-card-width:min(400px,calc(100vw-3rem))]"
    >
      <div className="px-6 pb-6 pt-16 sm:px-10 sm:pt-20 lg:px-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-champagne/50">
          {t.work.eyebrow}
        </p>
        <h2 className="mt-4 max-w-xl text-3xl font-medium tracking-tighter text-bone sm:text-4xl">
          {t.work.heading}
        </h2>
      </div>

      <div
        className="work-scroll flex gap-6 overflow-x-auto overflow-y-hidden px-6 pb-16 sm:px-10 lg:px-16"
        style={{
          scrollPaddingInline: "max(1.5rem, calc((100vw - var(--work-card-width)) / 2))",
        }}
      >
        {workProjects.map((project) => (
          <WorkCard key={project.id} projectKey={project.id} />
        ))}
      </div>
    </section>
  );
}
