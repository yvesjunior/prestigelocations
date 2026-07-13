// Mode du site — « basic » (vitrine + demande simple par courriel) ou
// « advanced » (calendrier de disponibilité + gestion demandes→commandes +
// rapports). Défini par la variable d'environnement SITE_MODE (côté serveur,
// lu dans server/impl/public.ts), exposé au client via le loader racine.
// Défaut : « basic » (on n'active la couche avancée qu'explicitement).
// Voir [[useMode]] et getSiteModeFn.

export type SiteMode = "basic" | "advanced";

export const DEFAULT_MODE: SiteMode = "basic";

export const isAdvanced = (mode: SiteMode): boolean => mode === "advanced";
