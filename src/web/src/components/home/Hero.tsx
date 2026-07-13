import { Link } from "@tanstack/react-router";
import { CalendarCheck, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import heroSlide2 from "@/assets/hero-slide-2.webp";
import heroSlide3 from "@/assets/hero-slide-3.webp";
import heroSlide4 from "@/assets/hero-slide-4.webp";
import { pagePaths, useLang, useT } from "@/lib/i18n";
import { phoneHref } from "@/lib/contact";
import { useContact } from "@/lib/useContact";
import { useHero } from "@/lib/useHero";
import { imageUrl } from "@/lib/images";

const SLIDE_INTERVAL_MS = 10_000; // rotation lente

export function Hero() {
  const lang = useLang();
  const t = useT();
  const contact = useContact();
  const hero = useHero();
  const [slide, setSlide] = useState(0);

  // Diaporama éditable depuis l'admin (clés ImageKit) ; sinon les 3 photos
  // bundlées par défaut. On garde des `alt` descriptifs pour l'accessibilité.
  const defaultSlides = [
    { src: heroSlide2, alt: t.hero.imageAlt2 },
    { src: heroSlide3, alt: t.hero.imageAlt3 },
    { src: heroSlide4, alt: t.hero.imageAlt4 },
  ];
  const customSlides = hero.slides
    .map((key) => imageUrl(key, { w: 1536 }))
    .filter((src): src is string => src !== null)
    .map((src) => ({ src, alt: t.hero.imageAlt }));
  const slides = customSlides.length > 0 ? customSlides : defaultSlides;
  const slideCount = slides.length;

  // Un setTimeout ré-armé à chaque changement (auto ou clic) : cliquer un point
  // relance le compte à rebours, et aucun minuteur périmé ne peut survivre.
  // Inutile de faire tourner un minuteur s'il n'y a qu'une seule diapo.
  useEffect(() => {
    if (slideCount <= 1) return;
    const id = setTimeout(() => setSlide((slide + 1) % slideCount), SLIDE_INTERVAL_MS);
    return () => clearTimeout(id);
  }, [slide, slideCount]);

  return (
    <section className="relative overflow-hidden">
      {/* Diaporama : fondu enchaîné, le texte et le voile restent fixes. */}
      {slides.map((s, i) => (
        <img
          key={s.src}
          src={s.src}
          alt={i === slide ? s.alt : ""}
          width={1536}
          height={1024}
          className={`absolute inset-y-0 right-0 h-full w-full object-cover object-[70%_center] transition-opacity duration-[2000ms] md:w-auto md:max-w-none ${
            i === slide ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
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

          <a href={phoneHref(contact.phone)} className="group mt-8 inline-flex items-center gap-3">
            <Phone className="h-6 w-6 text-primary" />
            <span>
              <span className="block text-2xl font-bold text-foreground transition-colors group-hover:text-primary">
                {contact.phone}
              </span>
              <span className="block text-xs text-foreground/70">{t.hero.phoneNote}</span>
            </span>
          </a>
        </div>
      </div>

      {/* Points de navigation du diaporama */}
      <div className="absolute right-6 bottom-5 flex gap-2">
        {slides.map((s, i) => (
          <button
            key={s.src}
            type="button"
            aria-label={`Photo ${i + 1}`}
            onClick={() => setSlide(i)}
            className={`h-2.5 w-2.5 rounded-full border border-primary transition-colors ${
              i === slide ? "bg-primary" : "bg-transparent hover:bg-primary/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
