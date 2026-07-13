import { getRouteApi } from "@tanstack/react-router";
import { DEFAULT_MODE, isAdvanced, type SiteMode } from "./mode";

const rootApi = getRouteApi("__root__");

/** Mode du site fourni par le loader racine (env SITE_MODE), repli « basic ». */
export function useMode(): SiteMode {
  const data = rootApi.useLoaderData() as { mode?: SiteMode } | undefined;
  return data?.mode ?? DEFAULT_MODE;
}

/** Vrai si la couche avancée (calendrier, commandes, rapports) est activée. */
export function useIsAdvanced(): boolean {
  return isAdvanced(useMode());
}
