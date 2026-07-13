ALTER TABLE "categories" ADD COLUMN "bullets_fr" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "bullets_en" jsonb DEFAULT '[]'::jsonb NOT NULL;