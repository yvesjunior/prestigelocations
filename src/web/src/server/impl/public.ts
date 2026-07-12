// Implémentation serveur des lectures publiques — ce fichier n'est importé que
// dynamiquement depuis les handlers de server functions (jamais côté client).
import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { getRequestIP } from "@tanstack/react-start/server";
import { categories, equipments, orders, reservationRequests, settings } from "@prestige/database";
import { rateLimit } from "../rate-limit";
import { getDb } from "../db";
import type { CatalogData } from "@/lib/catalog";
import { DEFAULT_THEME, themeConfigSchema, type ThemeConfig } from "@/lib/theme";
import { contactInfoSchema, DEFAULT_CONTACT, type ContactInfo } from "@/lib/contact";
import { contentOverridesSchema, type ContentOverrides } from "@/lib/content";
import { brandingSchema, DEFAULT_BRANDING, type Branding } from "@/lib/branding";

export async function loadCatalog(): Promise<CatalogData> {
  const db = getDb();
  const cats = await db.select().from(categories).orderBy(asc(categories.position));
  const eqs = await db
    .select()
    .from(equipments)
    .where(eq(equipments.published, true))
    .orderBy(asc(equipments.position));
  const catById = new Map(cats.map((c) => [c.id, c.slug]));
  // La BD est la source de vérité : TOUTES les catégories sont affichées,
  // même sans équipement publié (le gérant décide via l'admin).
  return {
    categories: cats.map((c) => ({
      slug: c.slug,
      name: { fr: c.nameFr, en: c.nameEn },
      cardDescription: { fr: c.cardDescriptionFr, en: c.cardDescriptionEn },
      pageDescription: { fr: c.pageDescriptionFr, en: c.pageDescriptionEn },
      cta: { fr: c.ctaFr, en: c.ctaEn },
      alt: { fr: c.altFr, en: c.altEn },
      imageKey: c.imageKey,
      position: c.position,
    })),
    equipments: eqs.map((e) => ({
      slug: e.slug,
      code: e.code,
      category: catById.get(e.categoryId) ?? "",
      name: { fr: e.nameFr, en: e.nameEn },
      detail: e.detailFr && e.detailEn ? { fr: e.detailFr, en: e.detailEn } : undefined,
      formLabel:
        e.formLabelFr && e.formLabelEn ? { fr: e.formLabelFr, en: e.formLabelEn } : undefined,
      status: e.status,
      published: e.published,
      imageKey: e.imageKey,
      position: e.position,
    })),
  };
}

export async function loadTheme(): Promise<ThemeConfig> {
  const db = getDb();
  const [row] = await db.select().from(settings).where(eq(settings.key, "theme"));
  if (!row) return DEFAULT_THEME;
  const parsed = themeConfigSchema.safeParse(row.value);
  return parsed.success ? parsed.data : DEFAULT_THEME;
}

export async function loadContact(): Promise<ContactInfo> {
  const db = getDb();
  const [row] = await db.select().from(settings).where(eq(settings.key, "contact"));
  if (!row) return DEFAULT_CONTACT;
  const parsed = contactInfoSchema.safeParse(row.value);
  return parsed.success ? parsed.data : DEFAULT_CONTACT;
}

export async function loadBranding(): Promise<Branding> {
  const db = getDb();
  const [row] = await db.select().from(settings).where(eq(settings.key, "branding"));
  if (!row) return DEFAULT_BRANDING;
  const parsed = brandingSchema.safeParse(row.value);
  return parsed.success ? parsed.data : DEFAULT_BRANDING;
}

export async function loadPageContent(): Promise<ContentOverrides> {
  const db = getDb();
  const [row] = await db.select().from(settings).where(eq(settings.key, "page_content"));
  if (!row) return {};
  const parsed = contentOverridesSchema.safeParse(row.value);
  return parsed.success ? parsed.data : {};
}

/**
 * Périodes indisponibles d'un équipement (commandes confirmées, à venir ou en
 * cours). Uniquement des dates — jamais de client, de raison ou de note.
 */
export async function loadUnavailableRanges(
  slug: string,
): Promise<{ start: string; end: string }[]> {
  const db = getDb();
  const [equipment] = await db
    .select({ id: equipments.id })
    .from(equipments)
    .where(eq(equipments.slug, slug));
  if (!equipment) return [];
  const rows = await db
    .select({ start: orders.startDate, end: orders.endDate })
    .from(orders)
    .where(
      and(
        eq(orders.equipmentId, equipment.id),
        eq(orders.status, "confirmee"),
        gte(orders.endDate, sql`current_date`),
      ),
    )
    .orderBy(asc(orders.startDate));
  return rows;
}

export type RequestSubmission = {
  name: string;
  phone: string;
  equipmentSlug: string | null;
  startDate: string | null;
  endDate: string | null;
  message: string | null;
  lang: "fr" | "en";
  /** Honeypot anti-spam : rempli = robot, rejet silencieux. */
  website: string;
};

export async function submitReservationRequest(
  data: RequestSubmission,
): Promise<{ ok: boolean; error?: "rate_limited" | "conflict" | "dates_required" | "generic" }> {
  // Robot piégé par le honeypot : on répond « succès » sans rien enregistrer.
  if (data.website.trim() !== "") return { ok: true };

  const ip = getRequestIP() ?? "unknown";
  if (!rateLimit(`request:${ip}`, 5, 10 * 60_000)) {
    return { ok: false, error: "rate_limited" };
  }

  try {
    const db = getDb();
    let equipmentId: number | null = null;
    let equipmentLabel = "Autre / plusieurs équipements";
    if (data.equipmentSlug) {
      const [equipment] = await db
        .select({ id: equipments.id, nameFr: equipments.nameFr, code: equipments.code })
        .from(equipments)
        .where(and(eq(equipments.slug, data.equipmentSlug), eq(equipments.published, true)));
      if (equipment) {
        equipmentId = equipment.id;
        equipmentLabel = equipment.code
          ? `${equipment.nameFr} (${equipment.code})`
          : equipment.nameFr;
      }
    }

    const hasRange = Boolean(data.startDate && data.endDate);
    if (hasRange && data.endDate! < data.startDate!) {
      return { ok: false, error: "generic" };
    }
    // Équipement précis → la période est obligatoire (« Autre / plusieurs »
    // reste libre : pas de calendrier dans ce cas).
    if (equipmentId !== null && !hasRange) {
      return { ok: false, error: "dates_required" };
    }
    // Revalidation serveur : la plage souhaitée ne doit pas chevaucher une
    // commande confirmée (l'affichage du calendrier peut être périmé).
    if (equipmentId !== null && hasRange) {
      const [clash] = await db
        .select({ id: orders.id })
        .from(orders)
        .where(
          and(
            eq(orders.equipmentId, equipmentId),
            eq(orders.status, "confirmee"),
            lte(orders.startDate, data.endDate!),
            gte(orders.endDate, data.startDate!),
          ),
        )
        .limit(1);
      if (clash) return { ok: false, error: "conflict" };
    }

    await db.insert(reservationRequests).values({
      name: data.name,
      phone: data.phone,
      equipmentId,
      equipmentLabel,
      startDate: hasRange ? data.startDate : null,
      endDate: hasRange ? data.endDate : null,
      message: data.message,
      lang: data.lang,
    });

    // Notification best-effort — la demande est déjà enregistrée.
    const { notifyNewRequest } = await import("./email");
    void notifyNewRequest({
      name: data.name,
      phone: data.phone,
      equipmentLabel,
      startDate: hasRange ? data.startDate : null,
      endDate: hasRange ? data.endDate : null,
      message: data.message,
      lang: data.lang,
    });
    return { ok: true };
  } catch (err) {
    console.error("submitReservationRequest :", err);
    return { ok: false, error: "generic" };
  }
}
