import { createFileRoute, Link } from "@tanstack/react-router";
import { Handshake, MapPin, Sparkles } from "lucide-react";
import { SectionTitle } from "@/components/site/SectionTitle";
import { CtaSection } from "@/components/site/CtaSection";
import heroImage from "@/assets/hero-excavator.jpg";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos | Prestige Locations" },
      {
        name: "description",
        content:
          "Prestige Locations, votre partenaire de confiance pour la location d'équipements de qualité à Sherbrooke et dans toute la région.",
      },
      { property: "og:title", content: "À propos | Prestige Locations" },
      {
        property: "og:description",
        content: "Votre partenaire de confiance pour la location d'équipements de qualité.",
      },
    ],
  }),
  component: AboutPage,
});

const values = [
  {
    icon: Sparkles,
    title: "Qualité",
    text: "Des équipements récents, inspectés et entretenus rigoureusement avant chaque location.",
  },
  {
    icon: Handshake,
    title: "Confiance",
    text: "Un service honnête et transparent, sans frais cachés ni mauvaises surprises.",
  },
  {
    icon: MapPin,
    title: "Proximité",
    text: "Une entreprise d'ici, au service des gens de Sherbrooke et de toute la région.",
  },
];

function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-10 lg:px-8">
        <SectionTitle
          eyebrow="À propos"
          title="Prestige Locations"
          subtitle="Votre partenaire de confiance"
        />
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 md:grid-cols-2 lg:px-8">
        <img
          src={heroImage}
          alt="Mini-pelle Prestige Locations sur un chantier"
          width={1536}
          height={1024}
          loading="lazy"
          className="aspect-[4/3] w-full rounded-xl border border-border/60 object-cover"
        />
        <div>
          <h2 className="font-serif text-3xl font-semibold tracking-wide uppercase">
            Notre mission
          </h2>
          <div className="mt-3 h-px w-16 bg-primary/70" />
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Prestige Locations est née d'une idée simple : rendre la location d'équipements de
            qualité accessible, rapide et sans tracas. Que vous soyez un entrepreneur, un
            paysagiste ou un particulier qui réalise ses propres projets, vous méritez des
            équipements fiables et un service à la hauteur.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            De la mini-pelle aux remorques en passant par les petits équipements, chaque machine de
            notre inventaire est entretenue avec soin pour vous garantir des travaux efficaces, du
            premier au dernier coup de godet.
          </p>
          <div className="mt-7">
            <Link to="/equipements" className="btn-gold-outline">
              Découvrir nos équipements
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <SectionTitle eyebrow="Nos valeurs" title="Ce qui nous guide" />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary/60 text-primary">
                  <v.icon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <h3 className="mt-4 text-sm font-bold tracking-[0.12em] uppercase">{v.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {v.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
