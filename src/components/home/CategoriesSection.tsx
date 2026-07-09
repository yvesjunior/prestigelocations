import { Tractor, Truck, Wrench } from "lucide-react";
import { CategoryCard, type Category } from "./CategoryCard";
import { SectionTitle } from "@/components/site/SectionTitle";
import catMachinerie from "@/assets/cat-machinerie.jpg";
import catRemorques from "@/assets/cat-remorques.jpg";
import catPetits from "@/assets/cat-petits-equipements.jpg";

const categories: Category[] = [
  {
    title: "Machinerie",
    description:
      "Des machines performantes pour vos travaux d'excavation, de terrassement et plus encore.",
    image: catMachinerie,
    icon: Tractor,
    cta: "Voir la machinerie",
    items: [
      { label: "Mini-pelle" },
      { label: "Tracteur compact" },
      { label: "Plateforme élévatrice", note: "(bientôt disponible)" },
      { label: "Et plus encore" },
    ],
  },
  {
    title: "Remorques",
    description:
      "Une vaste sélection de remorques pour transporter vos matériaux et équipements.",
    image: catRemorques,
    icon: Truck,
    cta: "Voir les remorques",
    items: [
      { label: "Trailer dompeur" },
      { label: "Trailer fermé" },
      { label: "Trailer plateforme" },
      { label: "Et plus encore" },
    ],
  },
  {
    title: "Petits équipements",
    description:
      "L'outillage et les petits équipements essentiels pour bien faire le travail.",
    image: catPetits,
    icon: Wrench,
    cta: "Voir les petits équipements",
    items: [
      { label: "Compacteurs" },
      { label: "Scies à béton" },
      { label: "Marteaux-piqueurs" },
      { label: "Et plus encore" },
    ],
  },
];

export function CategoriesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
      <SectionTitle
        eyebrow="Nos équipements"
        title="Trois catégories"
        subtitle="Pour répondre à tous vos besoins"
      />
      <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <CategoryCard key={c.title} category={c} />
        ))}
      </div>
    </section>
  );
}
