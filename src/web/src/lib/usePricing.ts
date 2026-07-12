import { getRouteApi } from "@tanstack/react-router";
import { DEFAULT_PRICING, type Pricing } from "./pricing";

const rootApi = getRouteApi("__root__");

/** Réglage des tarifs fourni par le loader racine (BD), avec repli sur le défaut. */
export function usePricing(): Pricing {
  const data = rootApi.useLoaderData() as { pricing?: Pricing } | undefined;
  return data?.pricing ?? DEFAULT_PRICING;
}
