import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, CalendarRange, CalendarClock, Truck } from "lucide-react";
import { SectionTitle } from "@/components/site/SectionTitle";
import { CtaSection } from "@/components/site/CtaSection";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services de location | Prestige Locations" },
      {
        name: "description",
        content:
          "Location à la journée, à la semaine ou au mois, avec livraison disponible dans toute la région de Sherbrooke.",
      },
      { property: "og:title", content: "Services de location | Prestige Locations" },
      {
        property: "og:description",
        content: "Des formules flexibles : journée, semaine, mois et livraison sur le chantier.",
      },
    ],
  }),
  component: ServicesPage,
});

const services = [
  {
    icon: CalendarDays,
    title: "Location à la journée",
    text: "Pour les petits travaux et les projets d'un jour. Récupérez l'équipement le matin, rapportez-le en fin de journée.",
  },
  {
    icon: CalendarRange,
    title: "Location à la semaine",
    text: "Le format idéal pour les rénovations et les chantiers de moyenne durée, à un tarif avantageux.",
  },
  {
    icon: CalendarClock,
    title: "Location au mois",
    text: "Pour les projets d'envergure. Gardez l'équipement aussi longtemps que nécessaire, sans compromis.",
  },
  {
    icon: Truck,
    title: "Livraison disponible",
    text: "Nous livrons l'équipement directement sur votre chantier, partout dans la région de Sherbrooke.",
  },
];

const steps = [
  {
    num: "01",
    title: "Contactez-nous",
    text: "Appelez-nous ou écrivez-nous pour vérifier la disponibilité de l'équipement.",
  },
  {
    num: "02",
    title: "Réservez",
    text: "Choisissez la durée de location qui convient à votre projet.",
  },
  {
    num: "03",
    title: "Travaillez",
    text: "Récupérez votre équipement ou faites-le livrer, et réalisez vos projets.",
  },
];

function ServicesPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-8 lg:px-8">
        <SectionTitle
          eyebrow="Nos services"
          title="Des formules flexibles"
          subtitle="Adaptées à chaque projet"
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-border/60 bg-card p-7 text-center transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary/60 text-primary">
                <s.icon className="h-6 w-6" strokeWidth={1.5} />
              </span>
              <h3 className="mt-5 text-sm font-bold tracking-[0.12em] uppercase">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <SectionTitle eyebrow="Comment ça marche" title="Simple en trois étapes" />
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {steps.map((step) => (
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
            <Link to="/contact" className="btn-gold">
              Réserver maintenant
            </Link>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
