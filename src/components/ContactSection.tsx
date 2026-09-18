import { contact, socialLinks } from "@/lib/copy";
import { cn } from "@/lib/utils";

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
      <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
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
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M13.5 22v-8h2.7l.4-3.2H13.5V9.1c0-.9.3-1.6 1.7-1.6h1.5V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 4v2.6H7.8v3.2h2.8v8h2.9z" />
    </svg>
  );
}

const socialIcons = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
} as const;

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative z-20 scroll-mt-6 border-t border-white/[0.06] bg-obsidian px-6 py-20 sm:px-10 sm:py-28"
    >
      <div className="mx-auto max-w-lg">
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-champagne/50">
            Contact
          </p>
          <h2 className="mt-4 text-2xl font-medium tracking-tighter text-bone sm:text-3xl">
            Begin with clarity.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-bone/45">
            Reach us directly — call, email, or connect on social.
          </p>
        </div>

        <div className="mt-10 space-y-2">
          <a
            href={`mailto:${contact.email}`}
            className={linkClass}
          >
            <MailIcon className="h-4 w-4 shrink-0 text-champagne/60 transition-colors group-hover:text-champagne" />
            <div className="min-w-0 text-left">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-bone/35">
                Email
              </p>
              <p className="mt-0.5 truncate text-sm text-bone/80 transition-colors group-hover:text-bone">
                {contact.email}
              </p>
            </div>
          </a>

          {contact.phones.map((phone) => (
            <a key={phone.tel} href={`tel:${phone.tel}`} className={linkClass}>
              <PhoneIcon className="h-4 w-4 shrink-0 text-champagne/60 transition-colors group-hover:text-champagne" />
              <div className="text-left">
                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-bone/35">
                  Phone
                </p>
                <p className="mt-0.5 text-sm text-bone/80 transition-colors group-hover:text-bone">
                  {phone.display}
                </p>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8">
          <p className="mb-3 text-center font-mono text-[9px] uppercase tracking-[0.3em] text-bone/30">
            Social
          </p>
          <div className="space-y-2">
            {socialLinks.map((link) => {
              const Icon = socialIcons[link.id];
              return (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  <Icon className="h-4 w-4 shrink-0 text-champagne/60 transition-colors group-hover:text-champagne" />
                  <div className="text-left">
                    <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-bone/35">
                      {link.label}
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 text-sm text-bone/80 transition-colors group-hover:text-bone",
                        link.id === "instagram" && "truncate"
                      )}
                    >
                      {link.id === "instagram"
                        ? "@youth_marketing_agency"
                        : "Youth Marketing Agency"}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
