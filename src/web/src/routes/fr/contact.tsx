import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/pages/ContactPage";
import { pageHead } from "@/lib/i18n";

export const Route = createFileRoute("/fr/contact")({
  head: () => pageHead("contact", "fr"),
  component: ContactPage,
});
