import { Link } from "@tanstack/react-router";
import { Handshake, MapPin, Sparkles } from "lucide-react";
import { SectionTitle } from "@/components/site/SectionTitle";
import { CtaSection } from "@/components/site/CtaSection";
import { pagePaths, useLang, useT } from "@/lib/i18n";
import heroImage from "@/assets/hero-excavator.jpg";

const valueIcons = [Sparkles, Handshake, MapPin];

export function AboutPage() {
  const lang = useLang();
  const t = useT();

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-10 lg:px-8">
        <SectionTitle
          eyebrow={t.aboutPage.eyebrow}
          title={t.aboutPage.title}
          subtitle={t.aboutPage.subtitle}
        />
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 md:grid-cols-2 lg:px-8">
        <img
          src={heroImage}
          alt={t.aboutPage.imageAlt}
          width={1536}
          height={1024}
          loading="lazy"
          className="aspect-[4/3] w-full rounded-xl border border-border/60 object-cover"
        />
        <div>
          <h2 className="font-serif text-3xl font-semibold tracking-wide uppercase">
            {t.aboutPage.missionTitle}
          </h2>
          <div className="mt-3 h-px w-16 bg-primary/70" />
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {t.aboutPage.missionP1}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {t.aboutPage.missionP2}
          </p>
          <div className="mt-7">
            <Link to={pagePaths.equipment[lang]} className="btn-gold-outline">
              {t.aboutPage.discover}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <SectionTitle eyebrow={t.aboutPage.valuesEyebrow} title={t.aboutPage.valuesTitle} />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {t.aboutPage.values.map((v, i) => {
              const Icon = valueIcons[i];
              return (
                <div key={v.title} className="text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary/60 text-primary">
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </span>
                  <h3 className="mt-4 text-sm font-bold tracking-[0.12em] uppercase">{v.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {v.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
