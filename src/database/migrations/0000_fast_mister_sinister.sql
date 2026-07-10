CREATE TYPE "public"."equipment_status" AS ENUM('disponible', 'bientot', 'sur_demande');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('nouvelle', 'en_cours', 'traitee', 'sans_suite');--> statement-breakpoint
CREATE TYPE "public"."unavailability_reason" AS ENUM('loue', 'maintenance', 'autre');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('superadmin', 'admin', 'accountant');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name_fr" text NOT NULL,
	"name_en" text NOT NULL,
	"card_description_fr" text NOT NULL,
	"card_description_en" text NOT NULL,
	"page_description_fr" text NOT NULL,
	"page_description_en" text NOT NULL,
	"cta_fr" text NOT NULL,
	"cta_en" text NOT NULL,
	"alt_fr" text NOT NULL,
	"alt_en" text NOT NULL,
	"image_key" text,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "equipment_unavailabilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipment_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"reason" "unavailability_reason" DEFAULT 'loue' NOT NULL,
	"note" text,
	"request_id" integer,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"category_id" integer NOT NULL,
	"name_fr" text NOT NULL,
	"name_en" text NOT NULL,
	"detail_fr" text,
	"detail_en" text,
	"form_label_fr" text,
	"form_label_en" text,
	"status" "equipment_status" DEFAULT 'disponible' NOT NULL,
	"image_key" text,
	"featured" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "equipments_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reservation_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"equipment_id" integer,
	"equipment_label" text NOT NULL,
	"start_date" date,
	"end_date" date,
	"message" text,
	"lang" text NOT NULL,
	"status" "request_status" DEFAULT 'nouvelle' NOT NULL,
	"handled_by" integer,
	"handled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'admin' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "equipment_unavailabilities" ADD CONSTRAINT "equipment_unavailabilities_equipment_id_equipments_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_unavailabilities" ADD CONSTRAINT "equipment_unavailabilities_request_id_reservation_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."reservation_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_unavailabilities" ADD CONSTRAINT "equipment_unavailabilities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_requests" ADD CONSTRAINT "reservation_requests_equipment_id_equipments_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_requests" ADD CONSTRAINT "reservation_requests_handled_by_users_id_fk" FOREIGN KEY ("handled_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "equipment_unavailabilities_idx" ON "equipment_unavailabilities" USING btree ("equipment_id","start_date","end_date");--> statement-breakpoint
CREATE INDEX "equipments_category_idx" ON "equipments" USING btree ("category_id","position");--> statement-breakpoint
CREATE INDEX "reservation_requests_status_idx" ON "reservation_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reservation_requests_created_idx" ON "reservation_requests" USING btree ("created_at");