import { getCatalogFn, getContactFn } from "@/server/public";
import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/pages/HomePage";
import { pageHead } from "@/lib/i18n";

export const Route = createFileRoute("/en/")({
  loader: async () => {
    const [catalog, contact] = await Promise.all([getCatalogFn(), getContactFn()]);
    return { catalog, contact };
  },
  head: ({ loaderData }) => pageHead("home", "en", loaderData?.contact.phone),
  component: HomePage,
});
