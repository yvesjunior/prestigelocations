import { getCatalogFn } from "@/server/public";
import { createFileRoute } from "@tanstack/react-router";
import { EquipmentPage } from "@/components/pages/EquipmentPage";
import { pageHead } from "@/lib/i18n";

export const Route = createFileRoute("/fr/equipements")({
  loader: async () => ({ catalog: await getCatalogFn() }),
  head: () => pageHead("equipment", "fr"),
  component: EquipmentPage,
});
