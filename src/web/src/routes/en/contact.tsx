import { getCatalogFn, getContactFn } from "@/server/public";
import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/pages/ContactPage";
import { pageHead } from "@/lib/i18n";

export const Route = createFileRoute("/en/contact")({
  // ?equipement=<slug> — préselectionne l'équipement dans le formulaire
  // (boutons « Vérifier la disponibilité » des pages de catégories).
  validateSearch: (search: Record<string, unknown>): { equipement?: string } => ({
    equipement: typeof search.equipement === "string" ? search.equipement : undefined,
  }),
  loader: async () => {
    const [catalog, contact] = await Promise.all([getCatalogFn(), getContactFn()]);
    return { catalog, contact };
  },
  head: ({ loaderData }) => pageHead("contact", "en", loaderData?.contact.phone),
  component: ContactPage,
});
