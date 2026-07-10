import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "@/components/pages/ServicesPage";
import { pageHead } from "@/lib/i18n";

export const Route = createFileRoute("/fr/services")({
  head: () => pageHead("services", "fr"),
  component: ServicesPage,
});
