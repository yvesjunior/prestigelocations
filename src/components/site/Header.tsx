import { Link } from "@tanstack/react-router";
import { CalendarCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";

const navItems = [
  { to: "/", label: "Accueil" },
  { to: "/equipements", label: "Équipements" },
  { to: "/services", label: "Services" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img
            src={logo}
            alt="Logo Prestige Locations"
            width={512}
            height={512}
            className="h-12 w-12 object-contain"
          />
          <span className="leading-tight">
            <span className="block font-serif text-lg font-bold tracking-[0.08em] text-primary">
              PRESTIGE
            </span>
            <span className="block text-[0.6rem] font-medium tracking-[0.45em] text-primary/80 uppercase">
              Locations
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-xs font-semibold tracking-[0.12em] text-foreground/85 uppercase transition-colors hover:text-primary"
              activeProps={{
                className:
                  "text-xs font-semibold tracking-[0.12em] uppercase text-primary border-b-2 border-primary pb-1",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link to="/contact" className="btn-gold-outline">
            <CalendarCheck className="h-4 w-4" />
            Réserver
          </Link>
        </div>

        <button
          type="button"
          className="text-primary md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border/60 bg-background px-4 pt-2 pb-4 md:hidden">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-semibold tracking-[0.1em] uppercase transition-colors hover:bg-secondary hover:text-primary"
                  activeProps={{
                    className:
                      "block rounded-md px-3 py-2.5 text-sm font-semibold tracking-[0.1em] uppercase bg-secondary text-primary",
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 px-3">
              <Link to="/contact" onClick={() => setOpen(false)} className="btn-gold w-full">
                <CalendarCheck className="h-4 w-4" />
                Réserver
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
