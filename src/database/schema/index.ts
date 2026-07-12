import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const equipmentStatus = pgEnum("equipment_status", [
  "disponible",
  "bientot",
  "sur_demande",
]);

// `admin` = plein accès (catalogue, pages, paramètres, comptes employés) ;
// `accountant` = lecture seule (rapports). L'ancien rôle `superadmin` a été
// fusionné dans `admin` (migration 0001).
export const userRole = pgEnum("user_role", ["admin", "accountant"]);

export const requestStatus = pgEnum("request_status", [
  "nouvelle",
  "en_cours",
  "traitee",
  "sans_suite",
]);

export const unavailabilityReason = pgEnum("unavailability_reason", [
  "loue",
  "maintenance",
  "autre",
]);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameFr: text("name_fr").notNull(),
  nameEn: text("name_en").notNull(),
  // Paragraphe court de la carte (accueil)
  cardDescriptionFr: text("card_description_fr").notNull(),
  cardDescriptionEn: text("card_description_en").notNull(),
  // Paragraphe long de la page Équipements
  pageDescriptionFr: text("page_description_fr").notNull(),
  pageDescriptionEn: text("page_description_en").notNull(),
  ctaFr: text("cta_fr").notNull(),
  ctaEn: text("cta_en").notNull(),
  altFr: text("alt_fr").notNull(),
  altEn: text("alt_en").notNull(),
  imageKey: text("image_key"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const equipments = pgTable(
  "equipments",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    // Code court optionnel (ex. « MP-01 ») pour distinguer deux unités portant
    // le même nom — affiché partout où le nom seul serait ambigu.
    code: text("code").unique(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    nameFr: text("name_fr").notNull(),
    nameEn: text("name_en").notNull(),
    // Ligne détaillée de la page Équipements (sinon le nom est utilisé)
    detailFr: text("detail_fr"),
    detailEn: text("detail_en"),
    // Libellé du menu du formulaire de contact (sinon le nom est utilisé)
    formLabelFr: text("form_label_fr"),
    formLabelEn: text("form_label_en"),
    status: equipmentStatus("status").notNull().default("disponible"),
    imageKey: text("image_key"),
    published: boolean("published").notNull().default(true),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("equipments_category_idx").on(t.categoryId, t.position)],
);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: userRole("role").notNull().default("admin"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export const sessions = pgTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  ip: text("ip"),
  userAgent: text("user_agent"),
});

export const reservationRequests = pgTable(
  "reservation_requests",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    equipmentId: integer("equipment_id").references(() => equipments.id, {
      onDelete: "set null",
    }),
    // Libellé figé au moment de la demande (les rapports restent justes)
    equipmentLabel: text("equipment_label").notNull(),
    startDate: date("start_date"),
    endDate: date("end_date"),
    message: text("message"),
    lang: text("lang").notNull(),
    status: requestStatus("status").notNull().default("nouvelle"),
    handledBy: integer("handled_by").references(() => users.id, { onDelete: "set null" }),
    handledAt: timestamp("handled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("reservation_requests_status_idx").on(t.status),
    index("reservation_requests_created_idx").on(t.createdAt),
  ],
);

export const equipmentUnavailabilities = pgTable(
  "equipment_unavailabilities",
  {
    id: serial("id").primaryKey(),
    equipmentId: integer("equipment_id")
      .notNull()
      .references(() => equipments.id, { onDelete: "cascade" }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    reason: unavailabilityReason("reason").notNull().default("loue"),
    note: text("note"),
    requestId: integer("request_id").references(() => reservationRequests.id, {
      onDelete: "set null",
    }),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("equipment_unavailabilities_idx").on(t.equipmentId, t.startDate, t.endDate)],
);

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id, { onDelete: "set null" }),
});

// Clients de la plateforme — créés par les employés pour compléter une commande.
// Pas de connexion client pour l'instant (aucune colonne d'auth) ; si l'option
// s'active un jour, une migration ajoutera password_hash/active sans rien casser.
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderStatus = pgEnum("order_status", ["confirmee", "annulee"]);

// Commandes — une location confirmée : client + équipement + période (jours
// inclusifs). Une commande `confirmee` rend l'équipement indisponible sur sa
// période ; `annulee` libère les dates. La fin passée = commande terminée
// (dérivé de end_date, jamais stocké).
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    customerId: integer("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    equipmentId: integer("equipment_id")
      .notNull()
      .references(() => equipments.id, { onDelete: "restrict" }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    status: orderStatus("status").notNull().default("confirmee"),
    note: text("note"),
    // Renseigné quand la commande naît de la validation d'une demande publique.
    requestId: integer("request_id").references(() => reservationRequests.id, {
      onDelete: "set null",
    }),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("orders_equipment_idx").on(t.equipmentId, t.startDate, t.endDate),
    index("orders_customer_idx").on(t.customerId),
  ],
);
