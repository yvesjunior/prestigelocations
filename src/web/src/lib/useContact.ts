import { getRouteApi } from "@tanstack/react-router";
import { DEFAULT_CONTACT, type ContactInfo } from "./contact";

const rootApi = getRouteApi("__root__");

/** Coordonnées fournies par le loader racine (BD), avec repli sur le défaut. */
export function useContact(): ContactInfo {
  const data = rootApi.useLoaderData() as { contact?: ContactInfo } | undefined;
  return data?.contact ?? DEFAULT_CONTACT;
}
