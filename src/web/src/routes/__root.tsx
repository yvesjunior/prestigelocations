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
import {
  getBrandingFn,
  getContactFn,
  getPageContentFn,
  getPricingFn,
  getThemeFn,
} from "@/server/public";
import { imageUrl } from "@/lib/images";
import { DEFAULT_CONTACT } from "@/lib/contact";
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

function MaintenanceComponent() {
  const t = useT();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-serif text-lg font-bold tracking-wide text-primary">
          PRESTIGE LOCATIONS
        </p>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
          {t.maintenancePage.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.maintenancePage.text}</p>
        <div className="mt-6">
          {/* Rechargement complet : le loader racine a échoué au SSR, un simple
              reset du routeur ne suffit pas à repartir d'un état sain. */}
          <button onClick={() => window.location.reload()} className="btn-gold">
            {t.maintenancePage.retry}
          </button>
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

  // BD injoignable (SERVICE_UNAVAILABLE) → page de maintenance, jamais de
  // contenu statique périmé.
  if (error.message.includes("SERVICE_UNAVAILABLE")) {
    return <MaintenanceComponent />;
  }

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
  // Thème + coordonnées (BD, cache 60 s) — l'admin est la source de vérité.
  loader: async () => {
    const [theme, contact, content, branding, pricing] = await Promise.all([
      getThemeFn(),
      getContactFn(),
      getPageContentFn(),
      getBrandingFn(),
      getPricingFn(),
    ]);
    return { theme, contact, content, branding, pricing };
  },
  head: ({ loaderData }) => {
    // Favicon : logo téléversé (ImageKit) si présent, sinon l'icône bundlée.
    const faviconHref =
      imageUrl(loaderData?.branding?.logoKey, { w: 128, h: 128 }) ?? "/logo-icon.png";
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "Prestige Locations | Location d'équipements à Sherbrooke" },
        {
          name: "description",
          // Téléphone depuis la BD (repli sur le défaut si le loader a échoué).
          content: `Location d'équipements fiables à Sherbrooke : mini-pelle, remorques, compacteurs et plus. Simple, rapide et sans tracas. ${loaderData?.contact.phone ?? DEFAULT_CONTACT.phone}.`,
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
        { rel: "icon", href: faviconHref, type: "image/png" },
        { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
        { rel: "apple-touch-icon", href: faviconHref },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap",
        },
      ],
    };
  },
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
      {/* Panneau de réglage local — activé uniquement par VITE_THEME_TWEAKER=1 (tests) */}
      {import.meta.env.VITE_THEME_TWEAKER === "1" && !isAdmin && <ThemeTweaker />}
    </QueryClientProvider>
  );
}
