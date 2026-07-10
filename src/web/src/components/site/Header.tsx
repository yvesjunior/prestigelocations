import { Link, useLocation } from "@tanstack/react-router";
import { CalendarCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { pagePaths, useLang, useT, type Lang, type PageKey } from "@/lib/i18n";

function LangSwitcher({ className = "" }: { className?: string }) {
  const lang = useLang();
  const pathname = useLocation({ select: (l) => l.pathname });
  const currentKey =
    (Object.keys(pagePaths) as PageKey[]).find((k) =>
      Object.values(pagePaths[k]).includes(pathname as never),
    ) ?? "home";

  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-semibold tracking-[0.12em] uppercase ${className}`}
    >
      {(["fr", "en"] as Lang[]).map((l, i) => (
        <span key={l} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-border">/</span>}
          {l === lang ? (
            <span className="text-primary">{l}</span>
          ) : (
            <Link
              to={pagePaths[currentKey][l]}
              className="text-foreground/60 transition-colors hover:text-primary"
            >
              {l}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const lang = useLang();
  const t = useT();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <Link
          to={pagePaths.home[lang]}
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
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

        <nav className="hidden items-center gap-7 lg:flex">
          {t.header.nav.map((item) => (
            <Link
              key={item.key}
              to={pagePaths[item.key][lang]}
              className="text-xs font-semibold tracking-[0.12em] text-foreground/85 uppercase transition-colors hover:text-primary"
              activeProps={{
                className:
                  "text-xs font-semibold tracking-[0.12em] uppercase text-primary border-b-2 border-primary pb-1",
              }}
              activeOptions={{ exact: item.key === "home" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <LangSwitcher />
          <Link to={pagePaths.contact[lang]} className="btn-gold-outline">
            <CalendarCheck className="h-4 w-4" />
            {t.header.reserve}
          </Link>
        </div>

        <div className="flex items-center gap-4 lg:hidden">
          <LangSwitcher />
          <button
            type="button"
            className="text-primary"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t.header.closeMenu : t.header.openMenu}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border/60 bg-background px-4 pt-2 pb-4 lg:hidden">
          <ul className="flex flex-col gap-1">
            {t.header.nav.map((item) => (
              <li key={item.key}>
                <Link
                  to={pagePaths[item.key][lang]}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-semibold tracking-[0.1em] uppercase transition-colors hover:bg-secondary hover:text-primary"
                  activeProps={{
                    className:
                      "block rounded-md px-3 py-2.5 text-sm font-semibold tracking-[0.1em] uppercase bg-secondary text-primary",
                  }}
                  activeOptions={{ exact: item.key === "home" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 px-3">
              <Link
                to={pagePaths.contact[lang]}
                onClick={() => setOpen(false)}
                className="btn-gold w-full"
              >
                <CalendarCheck className="h-4 w-4" />
                {t.header.reserve}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
