import { Tractor, Truck, Wrench, type LucideIcon } from "lucide-react";
import { CategoryCard } from "./CategoryCard";
import { SectionTitle } from "@/components/site/SectionTitle";
import { statusSuffix } from "@/lib/catalog";
import { useCatalog } from "@/lib/useCatalog";
import { useLang, useT } from "@/lib/i18n";
import catMachinerie from "@/assets/cat-machinerie.jpg";
import catRemorques from "@/assets/cat-remorques.jpg";
import catPetits from "@/assets/cat-petits-equipements.jpg";

const visualsBySlug: Record<string, { image: string; icon: LucideIcon }> = {
  machinerie: { image: catMachinerie, icon: Tractor },
  remorques: { image: catRemorques, icon: Truck },
  "petits-equipements": { image: catPetits, icon: Wrench },
};

const fallbackVisual = { image: catMachinerie, icon: Tractor };

export function CategoriesSection() {
  const lang = useLang();
  const t = useT();
  const { categories, equipments } = useCatalog();

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
      <SectionTitle
        eyebrow={t.categoriesSection.eyebrow}
        title={t.categoriesSection.title}
        subtitle={t.categoriesSection.subtitle}
      />
      <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const visual = visualsBySlug[c.slug] ?? fallbackVisual;
          const items = equipments
            .filter((e) => e.category === c.slug && e.featured)
            .map((e) => ({
              label: e.name[lang],
              note: statusSuffix(e.status)?.[lang],
            }));
          items.push({ label: t.categoriesSection.andMore, note: undefined });
          return (
            <CategoryCard
              key={c.slug}
              category={{
                title: c.name[lang],
                description: c.cardDescription[lang],
                image: visual.image,
                icon: visual.icon,
                cta: c.cta[lang],
                items,
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
