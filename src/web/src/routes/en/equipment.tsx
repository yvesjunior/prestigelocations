import { createFileRoute } from "@tanstack/react-router";
import { EquipmentPage } from "@/components/pages/EquipmentPage";
import { pageHead } from "@/lib/i18n";

export const Route = createFileRoute("/en/equipment")({
  head: () => pageHead("equipment", "en"),
  component: EquipmentPage,
});
