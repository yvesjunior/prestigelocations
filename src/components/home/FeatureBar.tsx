import { Clock, Headset, ShieldCheck, ThumbsUp } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Équipements fiables",
    text: "Des machines récentes et bien entretenues pour des travaux efficaces.",
  },
  {
    icon: ThumbsUp,
    title: "Réservation simple",
    text: "Réservez en quelques clics et récupérez votre équipement rapidement.",
  },
  {
    icon: Clock,
    title: "Flexibilité totale",
    text: "Location à la journée, à la semaine ou au mois selon vos besoins.",
  },
  {
    icon: Headset,
    title: "Service courtois",
    text: "Une équipe disponible et à l'écoute pour vous accompagner dans vos projets.",
  },
];

export function FeatureBar() {
  return (
    <section className="border-y border-border/60 bg-card">
      <div className="mx-auto grid max-w-7xl gap-px sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="flex flex-col items-center px-6 py-10 text-center lg:border-l lg:border-border/60 lg:first:border-l-0"
          >
            <f.icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
            <h3 className="mt-4 text-sm font-bold tracking-[0.12em] uppercase">{f.title}</h3>
            <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-muted-foreground">
              {f.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
