import { SectionReveal } from "@/components/SectionReveal";
import { contact, socialLinks } from "@/lib/copy";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/useTranslations";

const linkClass =
  "group flex items-center gap-4 rounded-sm border border-white/[0.08] bg-white/[0.03] px-5 py-4 backdrop-blur-md transition-colors duration-500 hover:border-champagne/30 hover:bg-white/[0.05]";

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function ContactSection() {
  const t = useTranslations();
  
  return (
    <SectionReveal>
      <section
        id="contact"
        className="relative z-20 scroll-mt-6 border-t border-white/[0.06] bg-obsidian px-6 py-24 sm:px-10 sm:py-32"
      >
        <div className="mx-auto max-w-lg rounded-sm border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm sm:p-10">
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-champagne/50">
            {t.contact.eyebrow}
          </p>
          <h2 className="mt-4 text-2xl font-medium tracking-tighter text-bone sm:text-3xl">
            {t.contact.heading}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-bone/45">
            {t.contact.subheading}
          </p>
        </div>

        <div className="mt-10 space-y-2">
          <a
            href={`mailto:${contact.email}`}
            className={linkClass}
          >
            <MailIcon className="h-5 w-5 text-bone/40 transition-colors group-hover:text-champagne/70" />
            <div className="flex-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-bone/35">
                {t.contact.email}
              </p>
              <p className="mt-0.5 text-sm text-bone/70">{contact.email}</p>
            </div>
          </a>

          {contact.phones.map((phone) => (
            <a key={phone.tel} href={`tel:${phone.tel}`} className={linkClass}>
              <PhoneIcon className="h-5 w-5 text-bone/40 transition-colors group-hover:text-champagne/70" />
              <div className="flex-1">
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-bone/35">
                  {t.contact.phone}
                </p>
                <p className="mt-0.5 text-sm text-bone/70">{phone.display}</p>
              </div>
            </a>
          ))}

          {socialLinks.map((social) => (
            <a
              key={social.id}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(linkClass, "transition-transform active:scale-[0.98]")}
            >
              {social.id === "instagram" ? (
                <InstagramIcon className="h-5 w-5 text-bone/40 transition-colors group-hover:text-champagne/70" />
              ) : (
                <FacebookIcon className="h-5 w-5 text-bone/40 transition-colors group-hover:text-champagne/70" />
              )}
              <div className="flex-1">
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-bone/35">
                  {t.contact.social}
                </p>
                <p className="mt-0.5 text-sm text-bone/70">{social.label}</p>
              </div>
            </a>
          ))}
        </div>
        </div>
      </section>
    </SectionReveal>
  );
}
