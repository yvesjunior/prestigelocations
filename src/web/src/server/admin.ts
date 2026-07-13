// Server functions du tableau d'administration — wrappers client-safe.
// Écritures et comptes employés = rôle admin, lectures = accountant+.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ThemeConfig } from "@/lib/theme";
import { themeConfigSchema } from "@/lib/theme";
import { contactInfoSchema, type ContactInfo } from "@/lib/contact";
import { contentOverridesSchema, type ContentOverrides } from "@/lib/content";
import { brandingSchema, type Branding } from "@/lib/branding";
import { pricingSchema, type Pricing } from "@/lib/pricing";
import { heroSchema, type Hero } from "@/lib/hero";
import { aboutSchema, type About } from "@/lib/about";

// ---------------------------------------------------------------- types

export type AdminEquipment = {
  id: number;
  slug: string;
  code: string | null;
  categoryId: number;
  categorySlug: string;
  categoryName: string;
  nameFr: string;
  nameEn: string;
  detailFr: string | null;
  detailEn: string | null;
  formLabelFr: string | null;
  formLabelEn: string | null;
  status: "disponible" | "bientot" | "sur_demande";
  imageKey: string | null;
  dailyPriceCents: number | null;
  weeklyPriceCents: number | null;
  weekendPriceCents: number | null;
  monthlyPriceCents: number | null;
  published: boolean;
  position: number;
};

export type AdminCategory = {
  id: number;
  slug: string;
  nameFr: string;
  nameEn: string;
  cardDescriptionFr: string;
  cardDescriptionEn: string;
  pageDescriptionFr: string;
  pageDescriptionEn: string;
  ctaFr: string;
  ctaEn: string;
  bulletsFr: string[];
  bulletsEn: string[];
  imageKey: string | null;
  position: number;
};

export type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "accountant";
  active: boolean;
  lastLoginAt: string | null;
};

export type AdminCustomer = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  note: string | null;
};

export type AdminOrder = {
  id: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerNote: string | null;
  equipments: { id: number; name: string; code: string | null }[];
  startDate: string;
  endDate: string;
  status: "confirmee" | "annulee";
  note: string | null;
};

export type RequestStatus = "nouvelle" | "en_cours" | "traitee" | "sans_suite";

export type ReportPeriod = "30d" | "90d" | "12m" | "all";

export type Report = {
  period: ReportPeriod;
  total: number;
  byStatus: { status: RequestStatus; count: number }[];
  byEquipment: { label: string; count: number }[];
  byCategory: { name: string; count: number }[];
  byMonth: { month: string; count: number }[]; // "AAAA-MM" -> volume
};

export type AdminRequest = {
  id: number;
  name: string;
  phone: string;
  // Équipements demandés (equipmentId null = « Autre / plusieurs »).
  equipments: { equipmentId: number | null; label: string }[];
  startDate: string | null;
  endDate: string | null;
  message: string | null;
  lang: string;
  status: RequestStatus;
  handledByName: string | null;
  createdAt: string;
  orderId: number | null;
};

const equipmentInput = z.object({
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "slug en minuscules, chiffres et tirets"),
  code: z.string().max(30).nullable(),
  categoryId: z.number().int(),
  nameFr: z.string().min(1),
  nameEn: z.string().min(1),
  detailFr: z.string().nullable(),
  detailEn: z.string().nullable(),
  formLabelFr: z.string().nullable(),
  formLabelEn: z.string().nullable(),
  status: z.enum(["disponible", "bientot", "sur_demande"]),
  imageKey: z.string().nullable(),
  dailyPriceCents: z.number().int().min(0).nullable(),
  weeklyPriceCents: z.number().int().min(0).nullable(),
  weekendPriceCents: z.number().int().min(0).nullable(),
  monthlyPriceCents: z.number().int().min(0).nullable(),
  published: z.boolean(),
  position: z.number().int().min(0),
});
export type EquipmentInput = z.infer<typeof equipmentInput>;

const categoryInput = z.object({
  nameFr: z.string().min(1),
  nameEn: z.string().min(1),
  cardDescriptionFr: z.string().min(1),
  cardDescriptionEn: z.string().min(1),
  pageDescriptionFr: z.string().min(1),
  pageDescriptionEn: z.string().min(1),
  ctaFr: z.string().min(1),
  ctaEn: z.string().min(1),
  // Points forts (texte libre) — lignes vides ignorées côté serveur.
  bulletsFr: z.array(z.string().min(1)).max(20),
  bulletsEn: z.array(z.string().min(1)).max(20),
  imageKey: z.string().nullable(),
  position: z.number().int().min(0),
});
export type CategoryInput = z.infer<typeof categoryInput>;

// Création : le slug est généré du nom FR, la position ajoutée en fin de liste,
// la photo et les points forts s'ajoutent ensuite depuis la fiche.
const categoryCreateInput = categoryInput.omit({
  position: true,
  imageKey: true,
  bulletsFr: true,
  bulletsEn: true,
});
export type CategoryCreateInput = z.infer<typeof categoryCreateInput>;

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date au format AAAA-MM-JJ");

const customerInput = z.object({
  name: z.string().min(1),
  phone: z.string().min(7),
  email: z.string().email().nullable(),
  note: z.string().nullable(),
});
export type CustomerInput = z.infer<typeof customerInput>;

const orderInput = z.object({
  customerId: z.number().int(),
  equipmentIds: z.array(z.number().int()).min(1),
  startDate: dateStr,
  endDate: dateStr,
  note: z.string().nullable(),
});
export type OrderInput = z.infer<typeof orderInput>;

// ---------------------------------------------------------------- équipements

export const listEquipmentsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminEquipment[]> => (await import("./impl/admin")).listEquipments(),
);

export const createEquipmentFn = createServerFn({ method: "POST" })
  .validator(equipmentInput)
  .handler(async ({ data }) => (await import("./impl/admin")).createEquipment(data));

export const updateEquipmentFn = createServerFn({ method: "POST" })
  .validator(equipmentInput.partial().extend({ id: z.number().int() }))
  .handler(async ({ data }) => (await import("./impl/admin")).updateEquipment(data));

export const deleteEquipmentFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int(), force: z.boolean().optional() }))
  .handler(async ({ data }) => (await import("./impl/admin")).deleteEquipment(data.id, data.force));

// ---------------------------------------------------------------- catégories

export const listCategoriesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminCategory[]> => (await import("./impl/admin")).listCategories(),
);

export const updateCategoryFn = createServerFn({ method: "POST" })
  .validator(categoryInput.extend({ id: z.number().int() }))
  .handler(async ({ data }) => (await import("./impl/admin")).updateCategory(data));

export const createCategoryFn = createServerFn({ method: "POST" })
  .validator(categoryCreateInput)
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> =>
    (await import("./impl/admin")).createCategory(data),
  );

export const deleteCategoryFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> =>
    (await import("./impl/admin")).deleteCategory(data.id),
  );

// ---------------------------------------------------------------- clients & commandes

export const listCustomersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminCustomer[]> => (await import("./impl/admin")).listCustomers(),
);

export const createCustomerFn = createServerFn({ method: "POST" })
  .validator(customerInput)
  .handler(async ({ data }): Promise<{ ok: boolean; id?: number; error?: string }> =>
    (await import("./impl/admin")).createCustomer(data),
  );

export const listOrdersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminOrder[]> => (await import("./impl/admin")).listOrders(),
);

export const createOrderFn = createServerFn({ method: "POST" })
  .validator(orderInput)
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> =>
    (await import("./impl/admin")).createOrder(data),
  );

export const updateOrderFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.number().int(),
      startDate: dateStr.optional(),
      endDate: dateStr.optional(),
      note: z.string().nullable().optional(),
      status: z.enum(["confirmee", "annulee"]).optional(),
      equipmentIds: z.array(z.number().int()).min(1).optional(),
    }),
  )
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> =>
    (await import("./impl/admin")).updateOrder(data),
  );

// ---------------------------------------------------------------- demandes

export const listRequestsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminRequest[]> => (await import("./impl/admin")).listRequests(),
);

export const updateRequestStatusFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.number().int(),
      status: z.enum(["nouvelle", "en_cours", "traitee", "sans_suite"]),
    }),
  )
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> =>
    (await import("./impl/admin")).updateRequestStatus(data),
  );

// Édition d'une demande (après l'appel téléphonique) : l'équipement, les dates
// et le message sont ajustés selon ce qui a été convenu, avant la conversion en
// commande. equipmentId null = « Autre / plusieurs équipements » ; dates nulles
// = période non précisée (la conversion reste alors bloquée tant qu'elles
// manquent).
const requestEditInput = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  phone: z.string().min(7),
  // Équipements demandés (vide = « Autre / plusieurs équipements »).
  equipmentIds: z.array(z.number().int()),
  startDate: dateStr.nullable(),
  endDate: dateStr.nullable(),
  message: z.string().nullable(),
});
export type RequestEditInput = z.infer<typeof requestEditInput>;

export const updateRequestFn = createServerFn({ method: "POST" })
  .validator(requestEditInput)
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> =>
    (await import("./impl/admin")).updateRequest(data),
  );

export const validateRequestFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> =>
    (await import("./impl/admin")).validateRequest(data.id),
  );

// ---------------------------------------------------------------- rapports

const reportPeriod = z.object({ period: z.enum(["30d", "90d", "12m", "all"]) });

export const getReportFn = createServerFn({ method: "GET" })
  .validator(reportPeriod)
  .handler(async ({ data }): Promise<Report> =>
    (await import("./impl/admin")).getReport(data.period),
  );

export const exportRequestsCsvFn = createServerFn({ method: "GET" })
  .validator(reportPeriod)
  .handler(async ({ data }): Promise<{ filename: string; csv: string }> =>
    (await import("./impl/admin")).exportRequestsCsv(data.period),
  );

// ---------------------------------------------------------------- employés

export const listUsersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminUser[]> => (await import("./impl/admin")).listUsers(),
);

export const createUserFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
      name: z.string().min(1),
      role: z.enum(["admin", "accountant"]),
      password: z.string().min(10),
    }),
  )
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> =>
    (await import("./impl/admin")).createUser(data),
  );

export const updateUserFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.number().int(),
      role: z.enum(["admin", "accountant"]).optional(),
      active: z.boolean().optional(),
      password: z.string().min(10).optional(),
    }),
  )
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> =>
    (await import("./impl/admin")).updateUser(data),
  );

// ---------------------------------------------------------------- thème

export const getThemeForAdminFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ThemeConfig> => (await import("./impl/admin")).getThemeForAdmin(),
);

export const updateThemeFn = createServerFn({ method: "POST" })
  .validator(themeConfigSchema)
  .handler(async ({ data }) => (await import("./impl/admin")).updateTheme(data));

export const resetThemeFn = createServerFn({ method: "POST" }).handler(async () =>
  (await import("./impl/admin")).resetTheme(),
);

// ---------------------------------------------------------------- tableau de bord

export const getAdminStatsFn = createServerFn({ method: "GET" }).handler(async () =>
  (await import("./impl/admin")).getAdminStats(),
);

// ---------------------------------------------------------------- coordonnées

export const getContactForAdminFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ContactInfo> => (await import("./impl/admin")).getContactForAdmin(),
);

export const updateContactFn = createServerFn({ method: "POST" })
  .validator(contactInfoSchema)
  .handler(async ({ data }) => (await import("./impl/admin")).updateContact(data));

// ---------------------------------------------------------------- pages

export const getPageContentForAdminFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ContentOverrides> => (await import("./impl/admin")).getPageContentForAdmin(),
);

export const updatePageContentFn = createServerFn({ method: "POST" })
  .validator(contentOverridesSchema)
  .handler(async ({ data }) => (await import("./impl/admin")).updatePageContent(data));

// ---------------------------------------------------------------- logo / marque

export const getBrandingForAdminFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<Branding> => (await import("./impl/admin")).getBrandingForAdmin(),
);

export const updateBrandingFn = createServerFn({ method: "POST" })
  .validator(brandingSchema)
  .handler(async ({ data }) => (await import("./impl/admin")).updateBranding(data));

// ---------------------------------------------------------------- tarifs

export const getPricingForAdminFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<Pricing> => (await import("./impl/admin")).getPricingForAdmin(),
);

export const updatePricingFn = createServerFn({ method: "POST" })
  .validator(pricingSchema)
  .handler(async ({ data }) => (await import("./impl/admin")).updatePricing(data));

// ---------------------------------------------------------------- diaporama accueil

export const getHeroForAdminFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<Hero> => (await import("./impl/admin")).getHeroForAdmin(),
);

export const updateHeroFn = createServerFn({ method: "POST" })
  .validator(heroSchema)
  .handler(async ({ data }) => (await import("./impl/admin")).updateHero(data));

// ---------------------------------------------------------------- image « À propos »

export const getAboutForAdminFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<About> => (await import("./impl/admin")).getAboutForAdmin(),
);

export const updateAboutFn = createServerFn({ method: "POST" })
  .validator(aboutSchema)
  .handler(async ({ data }) => (await import("./impl/admin")).updateAbout(data));
