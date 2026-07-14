// Coordonnées de l'entreprise — la BD est la source de vérité (table settings,
// clé "contact", éditée dans l'admin > Pages > onglet Contact). DEFAULT_CONTACT
// ne sert que de valeur initiale tant que la ligne n'existe pas en BD — c'est
// LE seul endroit du code où le téléphone/courriel apparaissent en dur.
import { z } from "zod";

export const contactInfoSchema = z.object({
  phone: z.string().min(7),
  email: z.string().email(),
  // Réseaux sociaux (optionnels) — URL complète ; vide/absent = icône masquée.
  facebook: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
});

export type ContactInfo = z.infer<typeof contactInfoSchema>;

// Placeholder neutre uniquement : les vraies coordonnées vivent en BD (clé
// settings "contact", éditée dans l'admin). Ne jamais coder les vraies valeurs ici.
export const DEFAULT_CONTACT: ContactInfo = {
  phone: "000-000-0000",
  email: "contact@example.com",
  facebook: null,
  instagram: null,
};

export function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** URL de réseau social normalisée (ajoute https:// au besoin), ou null si vide. */
export function socialHref(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}
