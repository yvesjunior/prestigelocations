// Coordonnées de l'entreprise — la BD est la source de vérité (table settings,
// clé "contact", éditée dans l'admin > Pages > onglet Contact). DEFAULT_CONTACT
// ne sert que de valeur initiale tant que la ligne n'existe pas en BD — c'est
// LE seul endroit du code où le téléphone/courriel apparaissent en dur.
import { z } from "zod";

export const contactInfoSchema = z.object({
  phone: z.string().min(7),
  email: z.string().email(),
});

export type ContactInfo = z.infer<typeof contactInfoSchema>;

// Placeholder neutre uniquement : les vraies coordonnées vivent en BD (clé
// settings "contact", éditée dans l'admin). Ne jamais coder les vraies valeurs ici.
export const DEFAULT_CONTACT: ContactInfo = {
  phone: "000-000-0000",
  email: "contact@example.com",
};

export function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
