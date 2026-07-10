import { Link } from "@tanstack/react-router";
import { CalendarCheck, Phone } from "lucide-react";
import heroImage from "@/assets/hero-excavator.jpg";
import { pagePaths, useLang, useT } from "@/lib/i18n";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

export function Hero() {
  const lang = useLang();
  const t = useT();

  return (
    <section className="relative overflow-hidden">
      <img
        src={heroImage}
        alt={t.hero.imageAlt}
        width={1536}
        height={1024}
        className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
      />
      <div className="absolute inset-0" style={{ background: "var(--overlay-hero)" }} />

      <div className="relative mx-auto max-w-7xl px-4 py-24 md:py-32 lg:px-8">
        <div className="max-w-xl">
          <p className="text-xs font-bold tracking-[0.3em] text-primary uppercase">
            Prestige Locations
          </p>
          <h1 className="mt-4 text-4xl leading-[1.05] font-extrabold tracking-tight uppercase md:text-6xl">
            <span className="text-foreground">{t.hero.titleLine1}</span>
            <br />
            <span className="text-primary">{t.hero.titleLine2}</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-foreground/85">
            {t.hero.description}
          </p>

          <div className="mt-8">
            <Link to={pagePaths.contact[lang]} className="btn-gold">
              <CalendarCheck className="h-4 w-4" />
              {t.hero.cta}
            </Link>
          </div>

          <a href={PHONE_HREF} className="group mt-8 inline-flex items-center gap-3">
            <Phone className="h-6 w-6 text-primary" />
            <span>
              <span className="block text-2xl font-bold text-foreground transition-colors group-hover:text-primary">
                {PHONE_DISPLAY}
              </span>
              <span className="block text-xs text-foreground/70">{t.hero.phoneNote}</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
