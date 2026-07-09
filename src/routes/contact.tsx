import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { SectionTitle } from "@/components/site/SectionTitle";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Réservation | Prestige Locations" },
      {
        name: "description",
        content:
          "Réservez votre équipement dès aujourd'hui. Appelez le 819-269-3129 ou écrivez-nous — réponse rapide garantie.",
      },
      { property: "og:title", content: "Contact & Réservation | Prestige Locations" },
      {
        property: "og:description",
        content: "Réservez votre équipement dès aujourd'hui. Réponse rapide garantie.",
      },
    ],
  }),
  component: ContactPage,
});

const infos = [
  {
    icon: Phone,
    label: "Téléphone",
    value: "819-269-3129",
    href: "tel:8192693129",
    note: "Réponse rapide garantie",
  },
  {
    icon: Mail,
    label: "Courriel",
    value: "prestigelocations@outlook.com",
    href: "mailto:prestigelocations@outlook.com",
    note: "Réponse en moins de 24 h",
  },
  {
    icon: MapPin,
    label: "Région desservie",
    value: "Sherbrooke, Québec",
    note: "Service dans toute la région",
  },
];

function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = encodeURIComponent(
      `Demande de réservation — ${data.get("equipement") || "Équipement"}`,
    );
    const body = encodeURIComponent(
      `Nom : ${data.get("nom")}\nTéléphone : ${data.get("telephone")}\nÉquipement : ${data.get("equipement")}\n\nMessage :\n${data.get("message")}`,
    );
    window.location.href = `mailto:prestigelocations@outlook.com?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-10 lg:px-8">
        <SectionTitle
          eyebrow="Contact"
          title="Réservez votre équipement"
          subtitle="Réponse rapide garantie"
        />
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 lg:grid-cols-[1fr_1.3fr] lg:px-8">
        <div className="space-y-5">
          {infos.map((info) => (
            <div
              key={info.label}
              className="flex items-start gap-4 rounded-xl border border-border/60 bg-card p-6"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/60 text-primary">
                <info.icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-xs font-bold tracking-[0.15em] text-primary uppercase">
                  {info.label}
                </p>
                {info.href ? (
                  <a
                    href={info.href}
                    className="mt-1 block text-lg font-semibold break-all transition-colors hover:text-primary"
                  >
                    {info.value}
                  </a>
                ) : (
                  <p className="mt-1 text-lg font-semibold">{info.value}</p>
                )}
                <p className="text-xs text-muted-foreground">{info.note}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-7 md:p-9">
          <h2 className="font-serif text-2xl font-semibold tracking-wide uppercase">
            Demande de réservation
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Remplissez le formulaire et nous vous répondrons rapidement.
          </p>

          {sent ? (
            <div className="mt-8 rounded-lg border border-primary/40 bg-secondary p-6 text-center">
              <p className="font-semibold text-primary">Merci !</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Votre application courriel devrait s'ouvrir. Vous pouvez aussi nous appeler au
                819-269-3129.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="nom" className="mb-1.5 block text-xs font-semibold tracking-wide uppercase">
                    Nom complet
                  </label>
                  <input
                    id="nom"
                    name="nom"
                    required
                    className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label htmlFor="telephone" className="mb-1.5 block text-xs font-semibold tracking-wide uppercase">
                    Téléphone
                  </label>
                  <input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    required
                    className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="819-000-0000"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="equipement" className="mb-1.5 block text-xs font-semibold tracking-wide uppercase">
                  Équipement souhaité
                </label>
                <select
                  id="equipement"
                  name="equipement"
                  className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option>Mini-pelle</option>
                  <option>Tracteur compact</option>
                  <option>Trailer dompeur</option>
                  <option>Trailer fermé</option>
                  <option>Trailer plateforme</option>
                  <option>Compacteur</option>
                  <option>Scie à béton</option>
                  <option>Marteau-piqueur</option>
                  <option>Autre / plusieurs équipements</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="mb-1.5 block text-xs font-semibold tracking-wide uppercase">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Dates souhaitées, durée de location, détails du projet..."
                />
              </div>
              <button type="submit" className="btn-gold w-full">
                Envoyer ma demande
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
