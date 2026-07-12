import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import logo from "@/assets/logo.png";
import { pagePaths, useLang, useT } from "@/lib/i18n";
import { phoneHref } from "@/lib/contact";
import { useContact } from "@/lib/useContact";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3h2.5v7h2.5z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Footer() {
  const lang = useLang();
  const t = useT();
  const contact = useContact();

  return (
    <footer className="border-t border-border/60 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Logo Prestige Locations"
              width={454}
              height={264}
              loading="lazy"
              className="h-12 w-auto object-contain"
            />
            <span className="leading-tight">
              <span className="block font-serif text-xl font-bold tracking-[0.08em] text-primary">
                PRESTIGE
              </span>
              <span className="block text-[0.65rem] font-medium tracking-[0.45em] text-primary/80 uppercase">
                Locations
              </span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {t.footer.blurb}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
            {t.footer.navigation}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {t.header.nav.map((item) => (
              <li key={item.key}>
                <Link
                  to={pagePaths[item.key][lang]}
                  className="text-sm text-foreground/80 transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
            {t.footer.servicesTitle}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {t.footer.services.map((s) => (
              <li key={s} className="text-sm text-foreground/80">
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
            {t.footer.contact}
          </h3>
          <ul className="mt-4 space-y-3">
            <li>
              <a
                href={phoneHref(contact.phone)}
                className="flex items-center gap-2.5 text-sm text-foreground/80 transition-colors hover:text-primary"
              >
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                {contact.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2.5 text-sm text-foreground/80 transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                {contact.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-foreground/80">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                {t.footer.regionLine1}
                <br />
                {t.footer.regionLine2}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row lg:px-8">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Prestige Locations. {t.footer.rights}
          </p>
          <div className="flex items-center gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
