import { getCatalogFn } from "@/server/public";
import { createFileRoute } from "@tanstack/react-router";
import { EquipmentPage } from "@/components/pages/EquipmentPage";
import { pageHead } from "@/lib/i18n";
import { equipmentListLd, ldMeta } from "@/lib/seo";

export const Route = createFileRoute("/en/equipment")({
  loader: async () => ({ catalog: await getCatalogFn() }),
  head: ({ loaderData }) => {
    const base = pageHead("equipment", "en");
    return {
      ...base,
      meta: [
        ...base.meta,
        ...(loaderData ? [ldMeta(equipmentListLd(loaderData.catalog, "en"))] : []),
      ],
    };
  },
  component: EquipmentPage,
});
