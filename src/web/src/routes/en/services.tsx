import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "@/components/pages/ServicesPage";
import { pageHead } from "@/lib/i18n";

export const Route = createFileRoute("/en/services")({
  head: () => pageHead("services", "en"),
  component: ServicesPage,
});
