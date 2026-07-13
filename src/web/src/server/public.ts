// Server functions publiques — wrappers client-safe : toute l'implémentation
// serveur (BD, drizzle) est importée dynamiquement dans les handlers.
// La BD est la seule source de contenu : si elle est injoignable, on renvoie
// une erreur SERVICE_UNAVAILABLE (503) et le site affiche la page de
// maintenance — jamais de données statiques périmées.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CatalogData } from "@/lib/catalog";
import type { ThemeConfig } from "@/lib/theme";
import type { ContactInfo } from "@/lib/contact";
import type { ContentOverrides } from "@/lib/content";
import type { Branding } from "@/lib/branding";
import type { Pricing } from "@/lib/pricing";
import type { Hero } from "@/lib/hero";
import type { About } from "@/lib/about";

export const SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE";

async function loadOr503<T>(key: string, load: () => Promise<T>): Promise<T> {
  try {
    const { cached } = await import("./cache");
    return await cached(key, 60_000, load);
  } catch (err) {
    console.error(`${key}: BD indisponible — page de maintenance.`, err);
    try {
      const { setResponseStatus } = await import("@tanstack/react-start/server");
      setResponseStatus(503);
    } catch {
      // Hors contexte de requête : le statut HTTP est secondaire, l'erreur suffit.
    }
    throw new Error(SERVICE_UNAVAILABLE);
  }
}

export const getCatalogFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<CatalogData> =>
    loadOr503("catalog", async () => (await import("./impl/public")).loadCatalog()),
);

export const getThemeFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ThemeConfig> =>
    loadOr503("theme", async () => (await import("./impl/public")).loadTheme()),
);

export const getContactFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ContactInfo> =>
    loadOr503("contact", async () => (await import("./impl/public")).loadContact()),
);

export const getPageContentFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ContentOverrides> =>
    loadOr503("page_content", async () => (await import("./impl/public")).loadPageContent()),
);

export const getBrandingFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<Branding> =>
    loadOr503("branding", async () => (await import("./impl/public")).loadBranding()),
);

export const getPricingFn = createServerFn({ method: "GET" }).handler(async (): Promise<Pricing> =>
  loadOr503("pricing", async () => (await import("./impl/public")).loadPricing()),
);

export const getHeroFn = createServerFn({ method: "GET" }).handler(async (): Promise<Hero> =>
  loadOr503("hero", async () => (await import("./impl/public")).loadHero()),
);

export const getAboutFn = createServerFn({ method: "GET" }).handler(async (): Promise<About> =>
  loadOr503("about", async () => (await import("./impl/public")).loadAbout()),
);

// ------------------------------------------------- demandes de réservation

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** Dates indisponibles des équipements choisis (union) — pour le calendrier public. */
export const getUnavailableRangesFn = createServerFn({ method: "GET" })
  .validator(z.object({ slugs: z.array(z.string().min(1)).max(50) }))
  .handler(async ({ data }): Promise<{ start: string; end: string }[]> => {
    try {
      return await (await import("./impl/public")).loadUnavailableRanges(data.slugs);
    } catch (err) {
      console.error("getUnavailableRanges :", err);
      return [];
    }
  });

export const submitReservationRequestFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(1).max(200),
      phone: z.string().min(7).max(30),
      equipmentSlugs: z.array(z.string().max(100)).max(50),
      startDate: dateStr.nullable(),
      endDate: dateStr.nullable(),
      message: z.string().max(3000).nullable(),
      lang: z.enum(["fr", "en"]),
      website: z.string().max(200),
    }),
  )
  .handler(
    async ({
      data,
    }): Promise<{
      ok: boolean;
      error?: "rate_limited" | "conflict" | "dates_required" | "generic";
    }> => (await import("./impl/public")).submitReservationRequest(data),
  );
