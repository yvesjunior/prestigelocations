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
 * Image par défaut (4:3) affichée quand aucune photo n'est définie — pour un
 * équipement ou une catégorie. Placeholder « pas de photo » sobre et de marque :
 * fond sombre du thème, pictogramme d'image et mot-symbole. SVG autonome (data
 * URI) → fonctionne sans CDN. On n'affiche jamais la photo d'un autre élément.
 */
export const BLANK_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">` +
      `<rect width="800" height="600" fill="#151515"/>` +
      `<g fill="none" stroke="#5c5340" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">` +
      `<rect x="315" y="205" width="170" height="150" rx="16"/>` +
      `<circle cx="356" cy="246" r="15"/>` +
      `<path d="M330 348 L378 296 L410 326 L448 280 L470 348"/>` +
      `</g>` +
      `<text x="400" y="415" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" ` +
      `font-size="30" fill="#6a6150" letter-spacing="3">PRESTIGE LOCATIONS</text>` +
      `<text x="400" y="452" text-anchor="middle" font-family="Arial, sans-serif" ` +
      `font-size="18" fill="#4c463a" letter-spacing="2">Photo à venir</text>` +
      `</svg>`,
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
