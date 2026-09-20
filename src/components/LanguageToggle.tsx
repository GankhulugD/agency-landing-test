"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "mn" : "en")}
      className={cn(
        "group fixed right-4 top-4 z-[190] flex shrink-0 items-center gap-2 rounded-sm border border-white/[0.08] bg-obsidian/90 px-3 py-1.5 backdrop-blur-md transition-colors hover:border-champagne/30 sm:right-6 sm:top-6"
      )}
      aria-label="Toggle language"
    >
      <span
        className={cn(
          "font-mono text-[9px] uppercase tracking-[0.2em] transition-colors",
          language === "en" ? "text-champagne/80" : "text-bone/30"
        )}
      >
        EN
      </span>
      <span className="h-3 w-px bg-white/10" aria-hidden />
      <span
        className={cn(
          "font-mono text-[9px] uppercase tracking-[0.2em] transition-colors",
          language === "mn" ? "text-champagne/80" : "text-bone/30"
        )}
      >
        МН
      </span>
    </button>
  );
}
