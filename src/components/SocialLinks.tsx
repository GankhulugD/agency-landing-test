import { socialLinks } from "@/lib/copy";
import { cn } from "@/lib/utils";

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

const icons = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
} as const;

export function SocialLinks({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <nav
      className={cn("flex items-center gap-3 sm:gap-4", className)}
      aria-label="Social media"
    >
      {socialLinks.map((link) => {
        const Icon = icons[link.id];
        return (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="text-bone/35 transition-colors duration-300 hover:text-champagne"
          >
            <Icon className={cn("h-4 w-4 sm:h-[18px] sm:w-[18px]", iconClassName)} />
          </a>
        );
      })}
    </nav>
  );
}
