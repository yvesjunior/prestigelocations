import { getRouteApi } from "@tanstack/react-router";
import { DEFAULT_ABOUT, type About } from "./about";

const rootApi = getRouteApi("__root__");

/** Image « À propos » fournie par le loader racine (BD), avec repli sur le défaut. */
export function useAbout(): About {
  const data = rootApi.useLoaderData() as { about?: About } | undefined;
  return data?.about ?? DEFAULT_ABOUT;
}
