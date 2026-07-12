// Seed idempotent : catégories + équipements (upsert par slug, textes mis à jour,
// champs gérés par l'admin préservés) + création de l'admin initial.
import { eq, sql } from "drizzle-orm";
import { createDb, hashPassword, categories, equipments, users } from "./index.js";
import {
  catalogCategories,
  catalogEquipments,
} from "../web/src/lib/catalog.js";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgres://prestige:prestige@localhost:5432/prestige";

const db = createDb(DATABASE_URL);

async function main() {
  // Catégories
  for (const c of catalogCategories) {
    await db
      .insert(categories)
      .values({
        slug: c.slug,
        nameFr: c.name.fr,
        nameEn: c.name.en,
        cardDescriptionFr: c.cardDescription.fr,
        cardDescriptionEn: c.cardDescription.en,
        pageDescriptionFr: c.pageDescription.fr,
        pageDescriptionEn: c.pageDescription.en,
        ctaFr: c.cta.fr,
        ctaEn: c.cta.en,
        altFr: c.alt.fr,
        altEn: c.alt.en,
        imageKey: c.imageKey,
        position: c.position,
      })
      .onConflictDoUpdate({
        target: categories.slug,
        set: {
          nameFr: c.name.fr,
          nameEn: c.name.en,
          cardDescriptionFr: c.cardDescription.fr,
          cardDescriptionEn: c.cardDescription.en,
          pageDescriptionFr: c.pageDescription.fr,
          pageDescriptionEn: c.pageDescription.en,
          ctaFr: c.cta.fr,
          ctaEn: c.cta.en,
          altFr: c.alt.fr,
          altEn: c.alt.en,
          updatedAt: sql`now()`,
          // image_key et position préservés (gérés via l'admin)
        },
      });
  }

  // Équipements
  for (const e of catalogEquipments) {
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, e.category));
    if (!cat) throw new Error(`Catégorie introuvable pour ${e.slug}: ${e.category}`);

    await db
      .insert(equipments)
      .values({
        slug: e.slug,
        code: e.code ?? null,
        categoryId: cat.id,
        nameFr: e.name.fr,
        nameEn: e.name.en,
        detailFr: e.detail?.fr ?? null,
        detailEn: e.detail?.en ?? null,
        formLabelFr: e.formLabel?.fr ?? null,
        formLabelEn: e.formLabel?.en ?? null,
        status: e.status,
        published: e.published,
        imageKey: e.imageKey,
        position: e.position,
      })
      .onConflictDoUpdate({
        target: equipments.slug,
        set: {
          nameFr: e.name.fr,
          nameEn: e.name.en,
          detailFr: e.detail?.fr ?? null,
          detailEn: e.detail?.en ?? null,
          formLabelFr: e.formLabel?.fr ?? null,
          formLabelEn: e.formLabel?.en ?? null,
          updatedAt: sql`now()`,
          // status, published, image_key, position préservés (gérés via l'admin)
        },
      });
  }

  // Admin initial — jamais écrasé s'il existe.
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@prestige.local").toLowerCase();
  const adminName = process.env.ADMIN_NAME ?? "Administrateur";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "prestige-dev";
  if (adminPassword.length < 10) {
    throw new Error("ADMIN_PASSWORD doit faire au moins 10 caractères.");
  }
  await db
    .insert(users)
    .values({
      email: adminEmail,
      name: adminName,
      passwordHash: hashPassword(adminPassword),
      role: "admin",
    })
    .onConflictDoNothing({ target: users.email });

  console.log("Seed terminé : 3 catégories, 12 équipements, admin", adminEmail);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
