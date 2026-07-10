// Implémentation serveur des lectures publiques — ce fichier n'est importé que
// dynamiquement depuis les handlers de server functions (jamais côté client).
import { asc, eq } from "drizzle-orm";
import { categories, equipments, settings } from "@prestige/database";
import { getDb } from "../db";
import type { CatalogData } from "@/lib/catalog";
import { DEFAULT_THEME, themeConfigSchema, type ThemeConfig } from "@/lib/theme";

export async function loadCatalog(): Promise<CatalogData> {
  const db = getDb();
  const cats = await db.select().from(categories).orderBy(asc(categories.position));
  const eqs = await db
    .select()
    .from(equipments)
    .where(eq(equipments.published, true))
    .orderBy(asc(equipments.position));
  const catById = new Map(cats.map((c) => [c.id, c.slug]));
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
      category: catById.get(e.categoryId) ?? "",
      name: { fr: e.nameFr, en: e.nameEn },
      detail: e.detailFr && e.detailEn ? { fr: e.detailFr, en: e.detailEn } : undefined,
      formLabel:
        e.formLabelFr && e.formLabelEn ? { fr: e.formLabelFr, en: e.formLabelEn } : undefined,
      status: e.status,
      featured: e.featured,
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
