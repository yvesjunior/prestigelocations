import { Tractor, Truck, Wrench, type LucideIcon } from "lucide-react";
import { CategoryCard } from "./CategoryCard";
import { SectionTitle } from "@/components/site/SectionTitle";
import { BLANK_IMAGE, imageUrl } from "@/lib/images";
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

// Catégorie inconnue sans photo : image neutre, jamais celle d'une autre catégorie.
const fallbackVisual = { image: BLANK_IMAGE, icon: Tractor };

export function CategoriesSection() {
  const lang = useLang();
  const t = useT();
  const { categories } = useCatalog();

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
          // Points forts éditables de la catégorie (texte libre), indépendants
          // des équipements.
          const items = c.bullets[lang].map((label) => ({ label }));
          return (
            <CategoryCard
              key={c.slug}
              category={{
                slug: c.slug,
                title: c.name[lang],
                description: c.cardDescription[lang],
                // Photo téléversée dans l'admin (ImageKit), sinon asset bundlé du slug.
                image: imageUrl(c.imageKey, { w: 800 }) ?? visual.image,
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
