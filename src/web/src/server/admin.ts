// Server functions du tableau d'administration — wrappers client-safe.
// Écritures = rôle admin+, comptes employés = superadmin, lectures = accountant+.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ThemeConfig } from "@/lib/theme";
import { themeConfigSchema } from "@/lib/theme";

// ---------------------------------------------------------------- types

export type AdminEquipment = {
  id: number;
  slug: string;
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
  featured: boolean;
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
  position: number;
};

export type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: "superadmin" | "admin" | "accountant";
  active: boolean;
  lastLoginAt: string | null;
};

const equipmentInput = z.object({
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "slug en minuscules, chiffres et tirets"),
  categoryId: z.number().int(),
  nameFr: z.string().min(1),
  nameEn: z.string().min(1),
  detailFr: z.string().nullable(),
  detailEn: z.string().nullable(),
  formLabelFr: z.string().nullable(),
  formLabelEn: z.string().nullable(),
  status: z.enum(["disponible", "bientot", "sur_demande"]),
  featured: z.boolean(),
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
  position: z.number().int().min(0),
});
export type CategoryInput = z.infer<typeof categoryInput>;

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
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => (await import("./impl/admin")).deleteEquipment(data.id));

// ---------------------------------------------------------------- catégories

export const listCategoriesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminCategory[]> => (await import("./impl/admin")).listCategories(),
);

export const updateCategoryFn = createServerFn({ method: "POST" })
  .validator(categoryInput.extend({ id: z.number().int() }))
  .handler(async ({ data }) => (await import("./impl/admin")).updateCategory(data));

// ---------------------------------------------------------------- employés

export const listUsersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminUser[]> => (await import("./impl/admin")).listUsers(),
);

export const createUserFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
      name: z.string().min(1),
      role: z.enum(["superadmin", "admin", "accountant"]),
      password: z.string().min(10),
    }),
  )
  .handler(async ({ data }) => (await import("./impl/admin")).createUser(data));

export const updateUserFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.number().int(),
      role: z.enum(["superadmin", "admin", "accountant"]).optional(),
      active: z.boolean().optional(),
      password: z.string().min(10).optional(),
    }),
  )
  .handler(async ({ data }) => (await import("./impl/admin")).updateUser(data));

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
