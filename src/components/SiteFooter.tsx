import { useTranslations } from "@/lib/useTranslations";

const FOOTER_LINKS = [
  { href: "#hero", labelKey: "home" },
  { href: "#work", labelKey: "work" },
  { href: "#process", labelKey: "process" },
  { href: "#contact", labelKey: "contact" },
] as const;

export function SiteFooter() {
  const t = useTranslations();
  const year = new Date().getFullYear();
  
  return (
    <footer className="relative z-20 border-t border-white/[0.06] bg-obsidian px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
        <p className="font-mono text-[10px] tracking-[0.2em] text-bone/25">
          {t.footer.copyright.replace('{year}', year.toString())}
        </p>
        <nav
          className="flex flex-wrap items-center justify-center gap-5"
          aria-label="Footer"
        >
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-[9px] uppercase tracking-[0.25em] text-bone/35 transition-colors hover:text-champagne/60"
            >
              {t.nav[link.labelKey as keyof typeof t.nav]}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
