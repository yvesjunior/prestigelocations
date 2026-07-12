CREATE TABLE "reservation_request_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"equipment_id" integer,
	"equipment_label" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reservation_requests" DROP CONSTRAINT "reservation_requests_equipment_id_equipments_id_fk";
--> statement-breakpoint
ALTER TABLE "reservation_request_items" ADD CONSTRAINT "reservation_request_items_request_id_reservation_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."reservation_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_request_items" ADD CONSTRAINT "reservation_request_items_equipment_id_equipments_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reservation_request_items_request_idx" ON "reservation_request_items" USING btree ("request_id");--> statement-breakpoint
INSERT INTO "reservation_request_items" ("request_id", "equipment_id", "equipment_label") SELECT "id", "equipment_id", "equipment_label" FROM "reservation_requests";--> statement-breakpoint
ALTER TABLE "reservation_requests" DROP COLUMN "equipment_id";--> statement-breakpoint
ALTER TABLE "reservation_requests" DROP COLUMN "equipment_label";