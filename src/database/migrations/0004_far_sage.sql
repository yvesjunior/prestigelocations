ALTER TABLE "equipments" ADD COLUMN "code" text;--> statement-breakpoint
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_code_unique" UNIQUE("code");