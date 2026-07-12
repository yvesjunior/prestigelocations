// Image de marque — la BD est la source de vérité (table settings, clé
// "branding", éditée dans l'admin > Paramètres > onglet Logo). Le logo est une
// clé d'image ImageKit (comme les photos d'équipements/catégories) ; null =
// logo par défaut bundlé (src/assets/logo.png).
import { z } from "zod";

export const brandingSchema = z.object({
  logoKey: z.string().nullable(),
});

export type Branding = z.infer<typeof brandingSchema>;

export const DEFAULT_BRANDING: Branding = {
  logoKey: null,
};
