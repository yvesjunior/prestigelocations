import { getRouteApi } from "@tanstack/react-router";
import { DEFAULT_HERO, type Hero } from "./hero";

const rootApi = getRouteApi("__root__");

/** Diaporama de l'accueil fourni par le loader racine (BD), avec repli sur le défaut. */
export function useHero(): Hero {
  const data = rootApi.useLoaderData() as { hero?: Hero } | undefined;
  return data?.hero ?? DEFAULT_HERO;
}
