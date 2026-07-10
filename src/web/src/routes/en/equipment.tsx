import { getCatalogFn } from "@/server/public";
import { createFileRoute } from "@tanstack/react-router";
import { EquipmentPage } from "@/components/pages/EquipmentPage";
import { pageHead } from "@/lib/i18n";

export const Route = createFileRoute("/en/equipment")({
  loader: async () => ({ catalog: await getCatalogFn() }),
  head: () => pageHead("equipment", "en"),
  component: EquipmentPage,
});
