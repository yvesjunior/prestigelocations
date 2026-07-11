ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
UPDATE "public"."users" SET "role" = 'admin' WHERE "role" = 'superadmin';--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'accountant');--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DEFAULT 'admin';