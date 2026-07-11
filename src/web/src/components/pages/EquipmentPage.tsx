import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SectionTitle } from "@/components/site/SectionTitle";
import { CtaSection } from "@/components/site/CtaSection";
import { categoryPagePath, useLang, useT } from "@/lib/i18n";
import { statusSuffix, withCode } from "@/lib/catalog";
import { CdnImage } from "@/components/site/CdnImage";
import { BLANK_IMAGE } from "@/lib/images";
import { useCatalog } from "@/lib/useCatalog";
import catMachinerie from "@/assets/cat-machinerie.jpg";
import catRemorques from "@/assets/cat-remorques.jpg";
import catPetits from "@/assets/cat-petits-equipements.jpg";

const imagesBySlug: Record<string, string> = {
  machinerie: catMachinerie,
  remorques: catRemorques,
  "petits-equipements": catPetits,
};

export function EquipmentPage() {
  const lang = useLang();
  const t = useT();
  const { categories, equipments } = useCatalog();

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
        {categories.map((category, i) => {
          const items = equipments
            .filter((e) => e.category === category.slug)
            .map((e) => {
              const base = withCode(e.detail?.[lang] ?? e.name[lang], e.code);
              const suffix = statusSuffix(e.status)?.[lang];
              return suffix ? `${base} ${suffix}` : base;
            });
          return (
            <section key={category.slug} className="grid items-center gap-10 md:grid-cols-2">
              <CdnImage
                imageKey={category.imageKey}
                fallbackSrc={imagesBySlug[category.slug] ?? BLANK_IMAGE}
                alt={category.alt[lang]}
                width={1024}
                height={768}
                className={`aspect-[4/3] w-full rounded-xl border border-border/60 object-cover ${
                  i % 2 === 1 ? "md:order-2" : ""
                }`}
              />
              <div>
                <h2 className="font-serif text-3xl font-semibold tracking-wide uppercase">
                  {category.name[lang]}
                </h2>
                <div className="mt-3 h-px w-16 bg-primary/70" />
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  {category.pageDescription[lang]}
                </p>
                <ul className="mt-6 space-y-3">
                  {items.map((item) => (
                    <li key={item} className="flex items-baseline gap-3 text-sm text-foreground/90">
                      <Check className="h-4 w-4 shrink-0 translate-y-0.5 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  {/* Vers la page dédiée de la catégorie (le bouton « Vérifier la
                      disponibilité » vit là-bas, sur chaque équipement). */}
                  <Link to={categoryPagePath(category.slug, lang)} className="btn-gold-outline">
                    {category.cta[lang]}
                  </Link>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <CtaSection />
    </>
  );
}
