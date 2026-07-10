import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SectionTitle } from "@/components/site/SectionTitle";
import { CtaSection } from "@/components/site/CtaSection";
import { pagePaths, useLang, useT } from "@/lib/i18n";
import catMachinerie from "@/assets/cat-machinerie.jpg";
import catRemorques from "@/assets/cat-remorques.jpg";
import catPetits from "@/assets/cat-petits-equipements.jpg";

const images = [catMachinerie, catRemorques, catPetits];

export function EquipmentPage() {
  const lang = useLang();
  const t = useT();

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-8 lg:px-8">
        <SectionTitle
          eyebrow={t.equipmentPage.eyebrow}
          title={t.equipmentPage.title}
          subtitle={t.equipmentPage.subtitle}
        />
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 pb-20 lg:px-8">
        {t.equipmentPage.sections.map((section, i) => (
          <section key={section.title} className="grid items-center gap-10 md:grid-cols-2">
            <img
              src={images[i]}
              alt={section.alt}
              width={1024}
              height={768}
              loading="lazy"
              className={`aspect-[4/3] w-full rounded-xl border border-border/60 object-cover ${
                i % 2 === 1 ? "md:order-2" : ""
              }`}
            />
            <div>
              <h2 className="font-serif text-3xl font-semibold tracking-wide uppercase">
                {section.title}
              </h2>
              <div className="mt-3 h-px w-16 bg-primary/70" />
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {section.description}
              </p>
              <ul className="mt-6 space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex items-baseline gap-3 text-sm text-foreground/90">
                    <Check className="h-4 w-4 shrink-0 translate-y-0.5 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <Link to={pagePaths.contact[lang]} className="btn-gold-outline">
                  {t.equipmentPage.checkAvailability}
                </Link>
              </div>
            </div>
          </section>
        ))}
      </div>

      <CtaSection />
    </>
  );
}
