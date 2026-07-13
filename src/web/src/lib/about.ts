// Image de la page « À propos » (section mission) — la BD est la source de
// vérité (table settings, clé "about", éditée dans l'admin > Pages > À propos).
// L'image est une clé ImageKit ; null = image bundlée par défaut
// (src/assets/hero-excavator3.jpg).
import { z } from "zod";

export const aboutSchema = z.object({
  imageKey: z.string().nullable(),
});

export type About = z.infer<typeof aboutSchema>;

export const DEFAULT_ABOUT: About = {
  imageKey: null,
};
