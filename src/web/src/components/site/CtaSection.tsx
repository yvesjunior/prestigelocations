import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import ctaTrailer from "@/assets/cta-trailer.jpg";
import logo from "@/assets/logo.png";
import { pagePaths, useLang, useT } from "@/lib/i18n";
import { phoneHref } from "@/lib/contact";
import { useContact } from "@/lib/useContact";

export function CtaSection() {
  const lang = useLang();
  const t = useT();
  const contact = useContact();

  return (
    <section className="relative overflow-hidden">
      <img
        src={ctaTrailer}
        alt={t.ctaSection.imageAlt}
        width={1280}
        height={720}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-surface/85" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-[1.2fr_1fr_auto] lg:px-8">
        <div>
          <h2 className="font-serif text-3xl leading-tight font-bold uppercase md:text-4xl">
            <span className="text-foreground">{t.ctaSection.titleLine1}</span>
            <br />
            <span className="text-primary">{t.ctaSection.titleLine2}</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            {t.ctaSection.text}
          </p>
        </div>

        <div className="flex flex-col items-start gap-5">
          <a href={phoneHref(contact.phone)} className="group flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-primary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Phone className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-xl font-bold text-foreground">{contact.phone}</span>
              <span className="block text-xs text-muted-foreground">{t.ctaSection.phoneNote}</span>
            </span>
          </a>
          <Link to={pagePaths.contact[lang]} className="btn-gold">
            {t.ctaSection.button}
          </Link>
        </div>

        <div className="hidden flex-col items-center md:flex">
          <img
            src={logo}
            alt="Emblème Prestige Locations"
            width={512}
            height={512}
            loading="lazy"
            className="h-28 w-28 object-contain"
          />
          <span className="mt-2 font-serif text-xl font-bold tracking-[0.1em] text-primary">
            PRESTIGE
          </span>
          <span className="text-[0.6rem] font-medium tracking-[0.45em] text-primary/80 uppercase">
            Locations
          </span>
        </div>
      </div>
    </section>
  );
}
