import { useLoaderData } from "@tanstack/react-router";
import { staticCatalog, type CatalogData } from "./catalog";

/**
 * Catalogue fourni par le loader de la route courante (BD via getCatalogFn),
 * avec repli sur le catalogue statique (route sans loader, BD indisponible).
 */
export function useCatalog(): CatalogData {
  const data = useLoaderData({ strict: false }) as { catalog?: CatalogData } | undefined;
  return data?.catalog ?? staticCatalog;
}
