import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SectionTitle } from "@/components/site/SectionTitle";
import { CtaSection } from "@/components/site/CtaSection";
import catMachinerie from "@/assets/cat-machinerie.jpg";
import catRemorques from "@/assets/cat-remorques.jpg";
import catPetits from "@/assets/cat-petits-equipements.jpg";

export const Route = createFileRoute("/equipements")({
  head: () => ({
    meta: [
      { title: "Équipements en location | Prestige Locations" },
      {
        name: "description",
        content:
          "Mini-pelle, tracteur compact, remorques dompeur, fermées et plateformes, compacteurs, scies à béton et plus en location à Sherbrooke.",
      },
      { property: "og:title", content: "Équipements en location | Prestige Locations" },
      {
        property: "og:description",
        content: "Machinerie, remorques et petits équipements en location à Sherbrooke.",
      },
    ],
  }),
  component: EquipementsPage,
});

const sections = [
  {
    title: "Machinerie",
    image: catMachinerie,
    alt: "Mini-pelle sur un chantier",
    description:
      "Des machines performantes et bien entretenues pour vos travaux d'excavation, de terrassement, d'aménagement paysager et plus encore.",
    items: [
      "Mini-pelle (excavatrice compacte)",
      "Tracteur compact avec accessoires",
      "Plateforme élévatrice (bientôt disponible)",
      "Godets et accessoires variés",
    ],
  },
  {
    title: "Remorques",
    image: catRemorques,
    alt: "Remorques dompeur, fermée et plateforme",
    description:
      "Une vaste sélection de remorques pour transporter vos matériaux, véhicules et équipements en toute sécurité.",
    items: [
      "Trailer dompeur — idéal pour la terre, la pierre et les débris",
      "Trailer fermé — protégez votre cargaison des intempéries",
      "Trailer plateforme — pour véhicules et machinerie",
      "Attaches et accessoires de remorquage",
    ],
  },
  {
    title: "Petits équipements",
    image: catPetits,
    alt: "Compacteur, scie à béton et marteau-piqueur",
    description:
      "L'outillage et les petits équipements essentiels pour bien faire le travail, du début à la fin.",
    items: [
      "Compacteurs à plaque vibrante",
      "Scies à béton",
      "Marteaux-piqueurs",
      "Outillage spécialisé sur demande",
    ],
  },
];

function EquipementsPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-8 lg:px-8">
        <SectionTitle
          eyebrow="Nos équipements"
          title="Notre inventaire"
          subtitle="Tout ce qu'il faut pour vos projets"
        />
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 pb-20 lg:px-8">
        {sections.map((section, i) => (
          <section
            key={section.title}
            className="grid items-center gap-10 md:grid-cols-2"
          >
            <img
              src={section.image}
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
                <Link to="/contact" className="btn-gold-outline">
                  Vérifier la disponibilité
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
