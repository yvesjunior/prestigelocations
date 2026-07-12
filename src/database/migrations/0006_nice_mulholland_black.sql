CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"equipment_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_equipment_id_equipments_id_fk";
--> statement-breakpoint
DROP INDEX "orders_equipment_idx";--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_equipment_id_equipments_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_equipment_idx" ON "order_items" USING btree ("equipment_id","order_id");--> statement-breakpoint
CREATE INDEX "orders_dates_idx" ON "orders" USING btree ("start_date","end_date");--> statement-breakpoint
INSERT INTO "order_items" ("order_id", "equipment_id") SELECT "id", "equipment_id" FROM "orders";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "equipment_id";