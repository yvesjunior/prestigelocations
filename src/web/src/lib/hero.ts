// Diaporama de l'accueil — la BD est la source de vérité (table settings, clé
// "hero", éditée dans l'admin > Paramètres > onglet Accueil). Chaque diapo est
// une clé d'image ImageKit (comme les photos d'équipements/catégories). Liste
// vide = diaporama par défaut bundlé (src/assets/hero-slide-2/3/4.webp).
import { z } from "zod";

const MAX_SLIDES = 8;

export const heroSchema = z.object({
  slides: z.array(z.string().min(1)).max(MAX_SLIDES),
});

export type Hero = z.infer<typeof heroSchema>;

export const DEFAULT_HERO: Hero = {
  slides: [],
};

export { MAX_SLIDES as MAX_HERO_SLIDES };
