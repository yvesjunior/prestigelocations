// Public site origin (e.g. https://prestigelocations.ca), baked at build time.
// Empty in dev: hreflang links and absolute sitemap URLs are skipped.
// Les coordonnées (téléphone/courriel) vivent en BD — voir lib/contact.ts.
export const BASE_URL = import.meta.env.VITE_BASE_URL ?? "";
