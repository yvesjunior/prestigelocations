import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useLocation,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ThemeTweaker } from "@/components/dev/ThemeTweaker";
import { getThemeFn } from "@/server/public";
import { themeToCss } from "@/lib/theme";
import { pagePaths, useLang, useT } from "@/lib/i18n";

function NotFoundComponent() {
  const lang = useLang();
  const t = useT();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t.notFound.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t.notFound.text}</p>
        <div className="mt-6">
          <Link to={pagePaths.home[lang]} className="btn-gold">
            {t.notFound.back}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const lang = useLang();
  const t = useT();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {t.errorPage.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.errorPage.text}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-gold"
          >
            {t.errorPage.retry}
          </button>
          <a href={pagePaths.home[lang]} className="btn-gold-outline">
            {t.errorPage.home}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // Thème (BD, cache 60 s) injecté en variables CSS — l'admin est la source de vérité.
  loader: async () => ({ theme: await getThemeFn() }),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Prestige Locations | Location d'équipements à Sherbrooke" },
      {
        name: "description",
        content:
          "Location d'équipements fiables à Sherbrooke : mini-pelle, remorques, compacteurs et plus. Simple, rapide et sans tracas. 819-269-3129.",
      },
      { name: "author", content: "Prestige Locations" },
      {
        property: "og:title",
        content: "Prestige Locations | Location d'équipements à Sherbrooke",
      },
      {
        property: "og:description",
        content:
          "Le bon équipement, au bon moment. Machinerie, remorques et petits équipements en location à la journée, semaine ou mois.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const lang = useLang();
  return (
    <html lang={lang}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { theme } = Route.useLoaderData();
  const pathname = useLocation({ select: (l) => l.pathname });
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <QueryClientProvider client={queryClient}>
      {/* Variables CSS du thème (SSR) — priment sur les valeurs de styles.css */}
      <style dangerouslySetInnerHTML={{ __html: themeToCss(theme) }} />
      {isAdmin ? (
        <Outlet />
      ) : (
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
          </main>
          <Footer />
        </div>
      )}
      {import.meta.env.DEV && !isAdmin && <ThemeTweaker />}
    </QueryClientProvider>
  );
}
