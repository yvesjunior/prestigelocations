import { useLoaderData } from "@tanstack/react-router";
import type { CatalogData } from "./catalog";

/**
 * Catalogue fourni par le loader de la route courante (BD via getCatalogFn).
 * Aucun repli statique : si la BD est indisponible, le loader échoue et le
 * site affiche la page de maintenance.
 */
export function useCatalog(): CatalogData {
  const data = useLoaderData({ strict: false }) as { catalog?: CatalogData } | undefined;
  if (!data?.catalog) {
    throw new Error("useCatalog : la route ne fournit pas `catalog` dans son loader.");
  }
  return data.catalog;
}
