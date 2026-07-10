import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/pages/HomePage";
import { pageHead } from "@/lib/i18n";

export const Route = createFileRoute("/fr/")({
  head: () => pageHead("home", "fr"),
  component: HomePage,
});
