import { Link } from "@tanstack/react-router";
import { CalendarCheck, Phone } from "lucide-react";
import heroImage from "@/assets/hero-excavator.jpg";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <img
        src={heroImage}
        alt="Mini-pelle sur un chantier au crépuscule"
        width={1536}
        height={1024}
        className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
      />
      <div className="absolute inset-0" style={{ background: "var(--overlay-hero)" }} />

      <div className="relative mx-auto max-w-7xl px-4 py-24 md:py-32 lg:px-8">
        <div className="max-w-xl">
          <p className="text-xs font-bold tracking-[0.3em] text-primary uppercase">
            Prestige Locations
          </p>
          <h1 className="mt-4 text-4xl leading-[1.05] font-extrabold tracking-tight uppercase md:text-6xl">
            <span className="text-foreground">Le bon équipement,</span>
            <br />
            <span className="text-primary">au bon moment.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-foreground/85">
            Location d'équipements fiables et performants pour vos projets de toutes tailles.
            Simple, rapide et sans tracas.
          </p>

          <div className="mt-8">
            <Link to="/contact" className="btn-gold">
              <CalendarCheck className="h-4 w-4" />
              Réserver maintenant
            </Link>
          </div>

          <a href="tel:8192693129" className="group mt-8 inline-flex items-center gap-3">
            <Phone className="h-6 w-6 text-primary" />
            <span>
              <span className="block text-2xl font-bold text-foreground transition-colors group-hover:text-primary">
                819-269-3129
              </span>
              <span className="block text-xs text-foreground/70">Réponse rapide garantie</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
