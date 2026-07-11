// Implémentation serveur des fonctions d'administration — importée
// dynamiquement depuis les handlers uniquement.
import { and, asc, count, desc, eq, gte, isNotNull, lte, ne, sql } from "drizzle-orm";
import {
  categories,
  customers,
  equipments,
  hashPassword,
  orders,
  reservationRequests,
  settings,
  users,
} from "@prestige/database";
import { getDb } from "../db";
import { invalidate } from "../cache";
import { requireUser } from "./auth";
import { deleteImageKitFile } from "./imagekit";
import { loadTheme } from "./public";
import type { ThemeConfig } from "@/lib/theme";
import type { ContactInfo } from "@/lib/contact";
import { loadContact, loadPageContent } from "./public";
import type { ContentOverrides } from "@/lib/content";
import type {
  AdminCategory,
  AdminCustomer,
  AdminEquipment,
  AdminOrder,
  AdminRequest,
  AdminUser,
  CategoryCreateInput,
  CategoryInput,
  CustomerInput,
  EquipmentInput,
  OrderInput,
  Report,
  ReportPeriod,
  RequestStatus,
} from "../admin";

/** Identifiant stable généré du nom FR : minuscules, sans accents, tirets. */
function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function listEquipments(): Promise<AdminEquipment[]> {
  await requireUser("accountant");
  return getDb()
    .select({
      id: equipments.id,
      slug: equipments.slug,
      code: equipments.code,
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
      imageKey: equipments.imageKey,
      featured: equipments.featured,
      published: equipments.published,
      position: equipments.position,
    })
    .from(equipments)
    .innerJoin(categories, eq(equipments.categoryId, categories.id))
    .orderBy(asc(categories.position), asc(equipments.position));
}

/** Message clair quand le slug ou le code heurte une contrainte d'unicité. */
function equipmentDuplicateMessage(err: unknown): string | null {
  if ((err as { code?: string }).code !== "23505") return null;
  const constraint = (err as { constraint_name?: string }).constraint_name ?? "";
  return constraint.includes("code")
    ? "Ce code est déjà utilisé par un autre équipement."
    : "Ce slug est déjà utilisé par un autre équipement.";
}

export async function createEquipment(data: EquipmentInput) {
  await requireUser("admin");
  try {
    await getDb()
      .insert(equipments)
      .values({ ...data, code: data.code?.trim() || null });
  } catch (err) {
    const message = equipmentDuplicateMessage(err);
    if (message) throw new Error(message);
    throw err;
  }
  invalidate("catalog");
  return { ok: true };
}

export async function updateEquipment(data: Partial<EquipmentInput> & { id: number }) {
  await requireUser("admin");
  const { id, slug: _slug, ...rest } = data; // le slug est immuable
  const db = getDb();
  const [old] = await db
    .select({ imageKey: equipments.imageKey })
    .from(equipments)
    .where(eq(equipments.id, id));
  try {
    await db
      .update(equipments)
      .set({
        ...rest,
        code: rest.code !== undefined ? rest.code?.trim() || null : undefined,
        updatedAt: sql`now()`,
      })
      .where(eq(equipments.id, id));
  } catch (err) {
    const message = equipmentDuplicateMessage(err);
    if (message) throw new Error(message);
    throw err;
  }
  // Photo remplacée ou retirée → suppression de l'ancien fichier ImageKit.
  if (old?.imageKey && rest.imageKey !== undefined && rest.imageKey !== old.imageKey) {
    void deleteImageKitFile(old.imageKey);
  }
  invalidate("catalog");
  return { ok: true };
}

export async function deleteEquipment(id: number) {
  await requireUser("admin");
  const db = getDb();
  const [old] = await db
    .select({ imageKey: equipments.imageKey })
    .from(equipments)
    .where(eq(equipments.id, id));
  await db.delete(equipments).where(eq(equipments.id, id));
  if (old?.imageKey) void deleteImageKitFile(old.imageKey);
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
      imageKey: categories.imageKey,
      position: categories.position,
    })
    .from(categories)
    .orderBy(asc(categories.position));
}

export async function updateCategory(data: CategoryInput & { id: number }) {
  await requireUser("admin");
  const { id, ...rest } = data;
  const db = getDb();
  const [old] = await db
    .select({ imageKey: categories.imageKey })
    .from(categories)
    .where(eq(categories.id, id));
  await db
    .update(categories)
    .set({ ...rest, updatedAt: sql`now()` })
    .where(eq(categories.id, id));
  if (old?.imageKey && rest.imageKey !== old.imageKey) {
    void deleteImageKitFile(old.imageKey);
  }
  invalidate("catalog");
  return { ok: true };
}

export async function createCategory(
  data: CategoryCreateInput,
): Promise<{ ok: boolean; error?: string }> {
  await requireUser("admin");
  const db = getDb();
  const slug = slugify(data.nameFr);
  if (!slug) {
    return { ok: false, error: "Le nom FR ne permet pas de générer un identifiant valide." };
  }
  const [last] = await db
    .select({ max: sql<number>`coalesce(max(${categories.position}), -1)` })
    .from(categories);
  try {
    await db.insert(categories).values({
      ...data,
      slug,
      // Textes alternatifs des images : le nom, en attendant une photo dédiée (ImageKit).
      altFr: data.nameFr,
      altEn: data.nameEn,
      position: (last?.max ?? -1) + 1,
    });
  } catch (err) {
    // 23505 = violation d'unicité (categories.slug)
    if ((err as { code?: string }).code === "23505") {
      return { ok: false, error: `Une catégorie avec l'identifiant « ${slug} » existe déjà.` };
    }
    throw err;
  }
  invalidate("catalog");
  return { ok: true };
}

export async function deleteCategory(id: number): Promise<{ ok: boolean; error?: string }> {
  await requireUser("admin");
  const db = getDb();
  const [old] = await db
    .select({ imageKey: categories.imageKey })
    .from(categories)
    .where(eq(categories.id, id));
  try {
    await db.delete(categories).where(eq(categories.id, id));
  } catch (err) {
    // 23503 = violation de clé étrangère (equipments.category_id, on delete restrict)
    if ((err as { code?: string }).code === "23503") {
      return {
        ok: false,
        error:
          "Impossible : la catégorie contient des équipements. Déplacez-les ou supprimez-les d'abord.",
      };
    }
    throw err;
  }
  if (old?.imageKey) void deleteImageKitFile(old.imageKey);
  invalidate("catalog");
  return { ok: true };
}

export async function listCustomers(): Promise<AdminCustomer[]> {
  await requireUser("accountant");
  return getDb()
    .select({
      id: customers.id,
      name: customers.name,
      phone: customers.phone,
      email: customers.email,
      note: customers.note,
    })
    .from(customers)
    .orderBy(asc(customers.name));
}

export async function createCustomer(
  data: CustomerInput,
): Promise<{ ok: boolean; id?: number; error?: string }> {
  await requireUser("admin");
  const [row] = await getDb()
    .insert(customers)
    .values({ ...data, email: data.email?.toLowerCase().trim() || null })
    .returning({ id: customers.id });
  if (!row) return { ok: false, error: "Création du client échouée." };
  return { ok: true, id: row.id };
}

export async function listOrders(): Promise<AdminOrder[]> {
  await requireUser("accountant");
  return getDb()
    .select({
      id: orders.id,
      customerId: orders.customerId,
      customerName: customers.name,
      customerPhone: customers.phone,
      equipmentId: orders.equipmentId,
      equipmentName: equipments.nameFr,
      equipmentCode: equipments.code,
      startDate: orders.startDate,
      endDate: orders.endDate,
      status: orders.status,
      note: orders.note,
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .innerJoin(equipments, eq(orders.equipmentId, equipments.id))
    .orderBy(desc(orders.startDate), desc(orders.id));
}

/**
 * Périodes inclusives : conflit si une autre commande `confirmee` du même
 * équipement chevauche [startDate, endDate]. `excludeId` = commande en cours
 * de modification.
 */
async function findOrderConflict(
  equipmentId: number,
  startDate: string,
  endDate: string,
  excludeId?: number,
): Promise<{ startDate: string; endDate: string } | undefined> {
  const conditions = [
    eq(orders.equipmentId, equipmentId),
    eq(orders.status, "confirmee"),
    lte(orders.startDate, endDate),
    gte(orders.endDate, startDate),
  ];
  if (excludeId !== undefined) conditions.push(ne(orders.id, excludeId));
  const [conflict] = await getDb()
    .select({ startDate: orders.startDate, endDate: orders.endDate })
    .from(orders)
    .where(and(...conditions))
    .limit(1);
  return conflict;
}

export async function createOrder(data: OrderInput): Promise<{ ok: boolean; error?: string }> {
  const me = await requireUser("admin");
  if (data.endDate < data.startDate) {
    return { ok: false, error: "La date de fin doit être égale ou postérieure au début." };
  }
  const conflict = await findOrderConflict(data.equipmentId, data.startDate, data.endDate);
  if (conflict) {
    return {
      ok: false,
      error: `Conflit : cet équipement est déjà loué du ${conflict.startDate} au ${conflict.endDate}.`,
    };
  }
  await getDb()
    .insert(orders)
    .values({ ...data, createdBy: me.id });
  return { ok: true };
}

export async function updateOrder(data: {
  id: number;
  startDate?: string;
  endDate?: string;
  note?: string | null;
  status?: "confirmee" | "annulee";
}): Promise<{ ok: boolean; error?: string }> {
  await requireUser("admin");
  const db = getDb();
  const [current] = await db.select().from(orders).where(eq(orders.id, data.id));
  if (!current) return { ok: false, error: "Commande introuvable." };

  const next = {
    startDate: data.startDate ?? current.startDate,
    endDate: data.endDate ?? current.endDate,
    status: data.status ?? current.status,
    note: data.note !== undefined ? data.note : current.note,
  };
  if (next.endDate < next.startDate) {
    return { ok: false, error: "La date de fin doit être égale ou postérieure au début." };
  }
  // Une commande confirmée (nouvelles dates ou réactivation) ne doit pas
  // chevaucher une autre commande confirmée du même équipement.
  if (next.status === "confirmee") {
    const conflict = await findOrderConflict(
      current.equipmentId,
      next.startDate,
      next.endDate,
      data.id,
    );
    if (conflict) {
      return {
        ok: false,
        error: `Conflit : cet équipement est déjà loué du ${conflict.startDate} au ${conflict.endDate}.`,
      };
    }
  }
  await db
    .update(orders)
    .set({ ...next, updatedAt: sql`now()` })
    .where(eq(orders.id, data.id));
  return { ok: true };
}

export async function listRequests(): Promise<AdminRequest[]> {
  await requireUser("accountant");
  const db = getDb();
  const rows = await db
    .select({
      id: reservationRequests.id,
      name: reservationRequests.name,
      phone: reservationRequests.phone,
      equipmentId: reservationRequests.equipmentId,
      equipmentLabel: reservationRequests.equipmentLabel,
      startDate: reservationRequests.startDate,
      endDate: reservationRequests.endDate,
      message: reservationRequests.message,
      lang: reservationRequests.lang,
      status: reservationRequests.status,
      handledByName: users.name,
      createdAt: reservationRequests.createdAt,
    })
    .from(reservationRequests)
    .leftJoin(users, eq(reservationRequests.handledBy, users.id))
    .orderBy(desc(reservationRequests.createdAt));
  // Commande issue de chaque demande validée (au plus une en pratique).
  const linked = await db
    .select({ requestId: orders.requestId, orderId: orders.id })
    .from(orders)
    .where(isNotNull(orders.requestId));
  const orderByRequest = new Map(linked.map((l) => [l.requestId, l.orderId]));
  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    orderId: orderByRequest.get(r.id) ?? null,
  }));
}

export async function updateRequestStatus(data: {
  id: number;
  status: RequestStatus;
}): Promise<{ ok: boolean; error?: string }> {
  const me = await requireUser("admin");
  await getDb()
    .update(reservationRequests)
    .set({ status: data.status, handledBy: me.id, handledAt: sql`now()`, updatedAt: sql`now()` })
    .where(eq(reservationRequests.id, data.id));
  return { ok: true };
}

/**
 * Valide une demande : trouve ou crée le client (par téléphone), crée la
 * commande liée (garde anti-chevauchement) et passe la demande en `traitee`.
 * L'équipement devient indisponible sur la période — la disponibilité
 * s'ajuste automatiquement puisqu'elle dérive des commandes confirmées.
 */
export async function validateRequest(id: number): Promise<{ ok: boolean; error?: string }> {
  const me = await requireUser("admin");
  const db = getDb();
  const [request] = await db
    .select()
    .from(reservationRequests)
    .where(eq(reservationRequests.id, id));
  if (!request) return { ok: false, error: "Demande introuvable." };
  if (!request.equipmentId || !request.startDate || !request.endDate) {
    return {
      ok: false,
      error:
        "La demande ne précise pas d'équipement et de dates — créez la commande manuellement depuis Commandes.",
    };
  }

  const conflict = await findOrderConflict(request.equipmentId, request.startDate, request.endDate);
  if (conflict) {
    return {
      ok: false,
      error: `Conflit : cet équipement est déjà loué du ${conflict.startDate} au ${conflict.endDate}.`,
    };
  }

  // Client existant (même téléphone) réutilisé, sinon créé depuis la demande.
  const [existing] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.phone, request.phone))
    .limit(1);
  let customerId = existing?.id;
  if (customerId === undefined) {
    const [created] = await db
      .insert(customers)
      .values({ name: request.name, phone: request.phone })
      .returning({ id: customers.id });
    customerId = created!.id;
  }

  await db.insert(orders).values({
    customerId,
    equipmentId: request.equipmentId,
    startDate: request.startDate,
    endDate: request.endDate,
    note: `Demande #${request.id}`,
    requestId: request.id,
    createdBy: me.id,
  });
  await db
    .update(reservationRequests)
    .set({ status: "traitee", handledBy: me.id, handledAt: sql`now()`, updatedAt: sql`now()` })
    .where(eq(reservationRequests.id, id));
  return { ok: true };
}

export async function listUsers(): Promise<AdminUser[]> {
  await requireUser("admin");
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
  role: "admin" | "accountant";
  password: string;
}): Promise<{ ok: boolean; error?: string }> {
  await requireUser("admin");
  try {
    await getDb()
      .insert(users)
      .values({
        email: data.email.toLowerCase().trim(),
        name: data.name,
        role: data.role,
        passwordHash: hashPassword(data.password),
      });
  } catch (err) {
    // 23505 = violation d'unicité (users.email)
    if ((err as { code?: string }).code === "23505") {
      return { ok: false, error: "Un compte existe déjà avec ce courriel." };
    }
    throw err;
  }
  return { ok: true };
}

export async function updateUser(data: {
  id: number;
  role?: "admin" | "accountant";
  active?: boolean;
  password?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const me = await requireUser("admin");
  if (data.id === me.id && data.active === false) {
    return { ok: false, error: "Impossible de désactiver son propre compte." };
  }
  const db = getDb();
  const [target] = await db
    .select({ role: users.role, active: users.active })
    .from(users)
    .where(eq(users.id, data.id));
  if (!target) return { ok: false, error: "Employé introuvable." };

  // Garde « dernier admin » : la plateforme doit toujours conserver au moins
  // un admin actif, sinon plus personne ne gère les comptes.
  const losesAdmin =
    target.role === "admin" &&
    target.active &&
    ((data.role !== undefined && data.role !== "admin") || data.active === false);
  if (losesAdmin) {
    const [row] = await db
      .select({ n: count() })
      .from(users)
      .where(and(eq(users.role, "admin"), eq(users.active, true)));
    if ((row?.n ?? 0) <= 1) {
      return {
        ok: false,
        error: "Impossible : c'est le dernier admin actif de la plateforme.",
      };
    }
  }

  const set: Record<string, unknown> = {};
  if (data.role) set.role = data.role;
  if (data.active !== undefined) set.active = data.active;
  if (data.password) set.passwordHash = hashPassword(data.password);
  if (Object.keys(set).length === 0) return { ok: true };
  await db.update(users).set(set).where(eq(users.id, data.id));
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
  const [activeOrders] = await db
    .select({ n: count() })
    .from(orders)
    .where(
      and(
        eq(orders.status, "confirmee"),
        lte(orders.startDate, sql`current_date`),
        gte(orders.endDate, sql`current_date`),
      ),
    );
  const [newRequests] = await db
    .select({ n: count() })
    .from(reservationRequests)
    .where(eq(reservationRequests.status, "nouvelle"));
  return {
    equipments: equipmentCount?.n ?? 0,
    users: userCount?.n ?? 0,
    activeOrders: activeOrders?.n ?? 0,
    newRequests: newRequests?.n ?? 0,
  };
}

export async function getContactForAdmin(): Promise<ContactInfo> {
  await requireUser("accountant");
  return loadContact();
}

export async function updateContact(data: ContactInfo) {
  const me = await requireUser("admin");
  await getDb()
    .insert(settings)
    .values({ key: "contact", value: data, updatedBy: me.id })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: data, updatedAt: sql`now()`, updatedBy: me.id },
    });
  invalidate("contact");
  return { ok: true };
}

export async function getPageContentForAdmin(): Promise<ContentOverrides> {
  await requireUser("accountant");
  return loadPageContent();
}

// ---------------------------------------------------------------- rapports

const PERIOD_DAYS: Record<Exclude<ReportPeriod, "all">, number> = {
  "30d": 30,
  "90d": 90,
  "12m": 365,
};

/** Lignes de demandes sur la période, avec la catégorie de l'équipement lié. */
async function requestsInPeriod(period: ReportPeriod) {
  const db = getDb();
  const rows = await db
    .select({
      createdAt: reservationRequests.createdAt,
      name: reservationRequests.name,
      phone: reservationRequests.phone,
      equipmentLabel: reservationRequests.equipmentLabel,
      startDate: reservationRequests.startDate,
      endDate: reservationRequests.endDate,
      lang: reservationRequests.lang,
      status: reservationRequests.status,
      categoryName: categories.nameFr,
    })
    .from(reservationRequests)
    .leftJoin(equipments, eq(reservationRequests.equipmentId, equipments.id))
    .leftJoin(categories, eq(equipments.categoryId, categories.id))
    .where(
      period === "all"
        ? undefined
        : gte(
            reservationRequests.createdAt,
            sql`now() - ${`${PERIOD_DAYS[period]} days`}::interval`,
          ),
    )
    .orderBy(desc(reservationRequests.createdAt));
  return rows;
}

export async function getReport(period: ReportPeriod): Promise<Report> {
  await requireUser("accountant");
  const rows = await requestsInPeriod(period);

  const STATUSES: RequestStatus[] = ["nouvelle", "en_cours", "traitee", "sans_suite"];
  const byStatus = STATUSES.map((status) => ({
    status,
    count: rows.filter((r) => r.status === status).length,
  }));

  const tally = <T extends string>(items: T[]) => {
    const map = new Map<T, number>();
    for (const k of items) map.set(k, (map.get(k) ?? 0) + 1);
    return [...map.entries()]
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count);
  };

  const byEquipment = tally(rows.map((r) => r.equipmentLabel)).map((e) => ({
    label: e.key,
    count: e.count,
  }));
  // Catégorie : nom de la catégorie de l'équipement, ou « Autre / plusieurs » si sans lien.
  const byCategory = tally(rows.map((r) => r.categoryName ?? "Autre / plusieurs")).map((c) => ({
    name: c.key,
    count: c.count,
  }));
  const byMonth = tally(rows.map((r) => r.createdAt.toISOString().slice(0, 7)))
    .map((m) => ({ month: m.key, count: m.count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return { period, total: rows.length, byStatus, byEquipment, byCategory, byMonth };
}

/** Échappement CSV (guillemets doublés, champ entre guillemets si besoin). */
function csvCell(value: string): string {
  return /[",\n;]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export async function exportRequestsCsv(
  period: ReportPeriod,
): Promise<{ filename: string; csv: string }> {
  await requireUser("accountant");
  const rows = await requestsInPeriod(period);
  const header = ["Reçue", "Nom", "Téléphone", "Équipement", "Début", "Fin", "Statut", "Langue"];
  const lines = rows.map((r) =>
    [
      r.createdAt.toISOString().slice(0, 10),
      r.name,
      r.phone,
      r.equipmentLabel,
      r.startDate ?? "",
      r.endDate ?? "",
      r.status,
      r.lang,
    ]
      .map((c) => csvCell(String(c)))
      .join(","),
  );
  // BOM UTF-8 (U+FEFF) pour qu'Excel affiche correctement les accents.
  const csv = "\uFEFF" + [header.join(","), ...lines].join("\r\n");
  return { filename: `demandes-${period}.csv`, csv };
}

export async function updatePageContent(data: ContentOverrides) {
  const me = await requireUser("admin");
  await getDb()
    .insert(settings)
    .values({ key: "page_content", value: data, updatedBy: me.id })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: data, updatedAt: sql`now()`, updatedBy: me.id },
    });
  invalidate("page_content");
  return { ok: true };
}
