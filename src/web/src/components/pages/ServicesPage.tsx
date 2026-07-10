import { Link } from "@tanstack/react-router";
import { CalendarDays, CalendarRange, CalendarClock, Truck } from "lucide-react";
import { SectionTitle } from "@/components/site/SectionTitle";
import { CtaSection } from "@/components/site/CtaSection";
import { pagePaths, useLang, useT } from "@/lib/i18n";

const icons = [CalendarDays, CalendarRange, CalendarClock, Truck];

export function ServicesPage() {
  const lang = useLang();
  const t = useT();

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-8 lg:px-8">
        <SectionTitle
          eyebrow={t.servicesPage.eyebrow}
          title={t.servicesPage.title}
          subtitle={t.servicesPage.subtitle}
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.servicesPage.services.map((s, i) => {
            const Icon = icons[i];
            return (
              <div
                key={s.title}
                className="rounded-xl border border-border/60 bg-card p-7 text-center transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary/60 text-primary">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <h3 className="mt-5 text-sm font-bold tracking-[0.12em] uppercase">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border/60 bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <SectionTitle eyebrow={t.servicesPage.stepsEyebrow} title={t.servicesPage.stepsTitle} />
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {t.servicesPage.steps.map((step) => (
              <div key={step.num} className="text-center">
                <span className="font-serif text-5xl font-bold text-primary/40">{step.num}</span>
                <h3 className="mt-3 text-sm font-bold tracking-[0.12em] uppercase">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to={pagePaths.contact[lang]} className="btn-gold">
              {t.servicesPage.cta}
            </Link>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
