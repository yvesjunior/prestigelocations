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

// ------------------------------------------------- demandes de réservation

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** Dates indisponibles d'un équipement (jamais de détails) — pour le calendrier public. */
export const getUnavailableRangesFn = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }): Promise<{ start: string; end: string }[]> => {
    try {
      return await (await import("./impl/public")).loadUnavailableRanges(data.slug);
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
      equipmentSlug: z.string().max(100).nullable(),
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
