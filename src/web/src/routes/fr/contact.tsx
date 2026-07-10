import { getCatalogFn } from "@/server/public";
import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/pages/ContactPage";
import { pageHead } from "@/lib/i18n";

export const Route = createFileRoute("/fr/contact")({
  loader: async () => ({ catalog: await getCatalogFn() }),
  head: () => pageHead("contact", "fr"),
  component: ContactPage,
});
