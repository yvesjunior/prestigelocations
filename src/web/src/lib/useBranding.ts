import { getRouteApi } from "@tanstack/react-router";
import { DEFAULT_BRANDING, type Branding } from "./branding";

const rootApi = getRouteApi("__root__");

/** Image de marque fournie par le loader racine (BD), avec repli sur le défaut. */
export function useBranding(): Branding {
  const data = rootApi.useLoaderData() as { branding?: Branding } | undefined;
  return data?.branding ?? DEFAULT_BRANDING;
}
