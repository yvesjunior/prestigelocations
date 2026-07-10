import { Tractor, Truck, Wrench } from "lucide-react";
import { CategoryCard } from "./CategoryCard";
import { SectionTitle } from "@/components/site/SectionTitle";
import { useT } from "@/lib/i18n";
import catMachinerie from "@/assets/cat-machinerie.jpg";
import catRemorques from "@/assets/cat-remorques.jpg";
import catPetits from "@/assets/cat-petits-equipements.jpg";

const visuals = [
  { image: catMachinerie, icon: Tractor },
  { image: catRemorques, icon: Truck },
  { image: catPetits, icon: Wrench },
];

export function CategoriesSection() {
  const t = useT();

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
      <SectionTitle
        eyebrow={t.categoriesSection.eyebrow}
        title={t.categoriesSection.title}
        subtitle={t.categoriesSection.subtitle}
      />
      <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {t.categoriesSection.categories.map((c, i) => (
          <CategoryCard key={c.title} category={{ ...c, ...visuals[i] }} />
        ))}
      </div>
    </section>
  );
}
