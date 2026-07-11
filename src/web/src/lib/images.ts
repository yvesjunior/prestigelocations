// Construction d'URLs ImageKit — aucun SDK : afficher une image ImageKit,
// c'est concaténer l'endpoint, des transformations et la clé (chemin du fichier).
// Sans VITE_IMAGEKIT_URL_ENDPOINT (dev sans compte), imageUrl renvoie null et
// les composants retombent sur les photos bundlées.

const ENDPOINT = (import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT as string | undefined)?.replace(
  /\/+$/,
  "",
);

export type ImageTransform = { w?: number; h?: number };

/**
 * Image de remplacement neutre (4:3, teinte sombre du thème) pour les
 * catégories sans photo : ne jamais afficher la photo d'une autre catégorie.
 */
export const BLANK_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#161616"/></svg>`,
  );

/** URL CDN d'une clé d'image (`image_key` en BD), ou null si non configurable. */
export function imageUrl(key: string | null | undefined, opts: ImageTransform = {}): string | null {
  if (!key || !ENDPOINT) return null;
  const tr = [opts.w && `w-${opts.w}`, opts.h && `h-${opts.h}`, "f-auto", "q-auto"]
    .filter(Boolean)
    .join(",");
  const path = key.startsWith("/") ? key : `/${key}`;
  return `${ENDPOINT}/tr:${tr}${path}`;
}
