// Implémentation serveur des fonctions d'administration — importée
// dynamiquement depuis les handlers uniquement.
import { asc, count, eq, sql } from "drizzle-orm";
import { categories, equipments, hashPassword, settings, users } from "@prestige/database";
import { getDb } from "../db";
import { invalidate } from "../cache";
import { requireUser } from "./auth";
import { loadTheme } from "./public";
import type { ThemeConfig } from "@/lib/theme";
import type {
  AdminCategory,
  AdminEquipment,
  AdminUser,
  EquipmentInput,
  CategoryInput,
} from "../admin";

export async function listEquipments(): Promise<AdminEquipment[]> {
  await requireUser("accountant");
  return getDb()
    .select({
      id: equipments.id,
      slug: equipments.slug,
      categoryId: equipments.categoryId,
      categorySlug: categories.slug,
      categoryName: categories.nameFr,
      nameFr: equipments.nameFr,
      nameEn: equipments.nameEn,
      detailFr: equipments.detailFr,
      detailEn: equipments.detailEn,
      formLabelFr: equipments.formLabelFr,
      formLabelEn: equipments.formLabelEn,
      status: equipments.status,
      featured: equipments.featured,
      published: equipments.published,
      position: equipments.position,
    })
    .from(equipments)
    .innerJoin(categories, eq(equipments.categoryId, categories.id))
    .orderBy(asc(categories.position), asc(equipments.position));
}

export async function createEquipment(data: EquipmentInput) {
  await requireUser("admin");
  await getDb().insert(equipments).values(data);
  invalidate("catalog");
  return { ok: true };
}

export async function updateEquipment(data: Partial<EquipmentInput> & { id: number }) {
  await requireUser("admin");
  const { id, slug: _slug, ...rest } = data; // le slug est immuable
  await getDb()
    .update(equipments)
    .set({ ...rest, updatedAt: sql`now()` })
    .where(eq(equipments.id, id));
  invalidate("catalog");
  return { ok: true };
}

export async function deleteEquipment(id: number) {
  await requireUser("admin");
  await getDb().delete(equipments).where(eq(equipments.id, id));
  invalidate("catalog");
  return { ok: true };
}

export async function listCategories(): Promise<AdminCategory[]> {
  await requireUser("accountant");
  return getDb()
    .select({
      id: categories.id,
      slug: categories.slug,
      nameFr: categories.nameFr,
      nameEn: categories.nameEn,
      cardDescriptionFr: categories.cardDescriptionFr,
      cardDescriptionEn: categories.cardDescriptionEn,
      pageDescriptionFr: categories.pageDescriptionFr,
      pageDescriptionEn: categories.pageDescriptionEn,
      ctaFr: categories.ctaFr,
      ctaEn: categories.ctaEn,
      position: categories.position,
    })
    .from(categories)
    .orderBy(asc(categories.position));
}

export async function updateCategory(data: CategoryInput & { id: number }) {
  await requireUser("admin");
  const { id, ...rest } = data;
  await getDb()
    .update(categories)
    .set({ ...rest, updatedAt: sql`now()` })
    .where(eq(categories.id, id));
  invalidate("catalog");
  return { ok: true };
}

export async function listUsers(): Promise<AdminUser[]> {
  await requireUser("superadmin");
  const rows = await getDb()
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      active: users.active,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .orderBy(asc(users.id));
  return rows.map((r) => ({ ...r, lastLoginAt: r.lastLoginAt?.toISOString() ?? null }));
}

export async function createUser(data: {
  email: string;
  name: string;
  role: "superadmin" | "admin" | "accountant";
  password: string;
}) {
  await requireUser("superadmin");
  await getDb()
    .insert(users)
    .values({
      email: data.email.toLowerCase().trim(),
      name: data.name,
      role: data.role,
      passwordHash: hashPassword(data.password),
    });
  return { ok: true };
}

export async function updateUser(data: {
  id: number;
  role?: "superadmin" | "admin" | "accountant";
  active?: boolean;
  password?: string;
}) {
  const me = await requireUser("superadmin");
  if (data.id === me.id && data.active === false) {
    return { ok: false, error: "Impossible de désactiver son propre compte." };
  }
  const set: Record<string, unknown> = {};
  if (data.role) set.role = data.role;
  if (data.active !== undefined) set.active = data.active;
  if (data.password) set.passwordHash = hashPassword(data.password);
  if (Object.keys(set).length === 0) return { ok: true };
  await getDb().update(users).set(set).where(eq(users.id, data.id));
  return { ok: true };
}

export async function getThemeForAdmin(): Promise<ThemeConfig> {
  await requireUser("accountant");
  return loadTheme();
}

export async function updateTheme(data: ThemeConfig) {
  const me = await requireUser("admin");
  await getDb()
    .insert(settings)
    .values({ key: "theme", value: data, updatedBy: me.id })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: data, updatedAt: sql`now()`, updatedBy: me.id },
    });
  invalidate("theme");
  return { ok: true };
}

export async function resetTheme() {
  await requireUser("admin");
  await getDb().delete(settings).where(eq(settings.key, "theme"));
  invalidate("theme");
  return { ok: true };
}

export async function getAdminStats() {
  await requireUser("accountant");
  const db = getDb();
  const [equipmentCount] = await db
    .select({ n: count() })
    .from(equipments)
    .where(eq(equipments.published, true));
  const [userCount] = await db.select({ n: count() }).from(users).where(eq(users.active, true));
  return { equipments: equipmentCount?.n ?? 0, users: userCount?.n ?? 0 };
}
