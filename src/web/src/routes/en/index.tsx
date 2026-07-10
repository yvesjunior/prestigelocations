import { getCatalogFn } from "@/server/public";
import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/pages/HomePage";
import { pageHead } from "@/lib/i18n";

export const Route = createFileRoute("/en/")({
  loader: async () => ({ catalog: await getCatalogFn() }),
  head: () => pageHead("home", "en"),
  component: HomePage,
});
