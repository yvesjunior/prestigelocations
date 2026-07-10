import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/components/pages/AboutPage";
import { pageHead } from "@/lib/i18n";

export const Route = createFileRoute("/en/about")({
  head: () => pageHead("about", "en"),
  component: AboutPage,
});
