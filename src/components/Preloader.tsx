"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { useTranslations } from "@/lib/useTranslations";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

const SESSION_KEY = "namoon-preloader-seen";

export function Preloader() {
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<"idle" | "showing" | "done">("idle");

  useEffect(() => {
    if (reducedMotion) {
      setPhase("done");
      return;
    }
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      setPhase("done");
      return;
    }
    sessionStorage.setItem(SESSION_KEY, "1");
    setPhase("showing");
  }, [reducedMotion]);

  useEffect(() => {
    if (phase !== "showing") return;

    const frame = requestAnimationFrame(() => {
      const overlay = document.getElementById("preloader-overlay");
      const needle = document.getElementById("preloader-needle");
      const wordmark = document.getElementById("preloader-wordmark");
      if (!overlay || !needle || !wordmark) {
        setPhase("done");
        return;
      }

      const tl = gsap.timeline({ onComplete: () => setPhase("done") });
      tl.fromTo(
        needle,
        { rotation: -90, opacity: 0 },
        { rotation: 0, opacity: 1, duration: 0.9, ease: "power2.out" }
      )
        .fromTo(
          wordmark,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          "-=0.35"
        )
        .to({}, { duration: 0.35 })
        .to(overlay, {
          opacity: 0,
          scale: 1.02,
          duration: 0.65,
          ease: "power2.inOut",
        });
    });

    return () => cancelAnimationFrame(frame);
  }, [phase]);

  if (phase !== "showing") return null;

  return (
    <div
      id="preloader-overlay"
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-obsidian"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <svg
        id="preloader-needle"
        width="48"
        height="48"
        viewBox="0 0 48 48"
        className="mb-6 text-champagne"
        aria-hidden
      >
        <line
          x1="24"
          y1="8"
          x2="24"
          y2="40"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity="0.4"
        />
        <polygon
          points="24,22 34,24 24,26 14,24"
          fill="currentColor"
          className="origin-center"
        />
        <circle cx="24" cy="24" r="2" fill="#f3f3f0" />
      </svg>
      <p
        id="preloader-wordmark"
        className={cn(
          "font-mono text-[10px] uppercase tracking-[0.45em] text-bone/70"
        )}
      >
        NAMOON COMPASS
      </p>
    </div>
  );
}
