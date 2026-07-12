// Réglage des tarifs — la BD est la source de vérité (table settings, clé
// "pricing", éditée dans l'admin > Paramètres > onglet Tarifs). Quand
// showDailyPrice est activé, le site affiche le prix/jour des équipements qui
// en ont un ; sinon aucun prix n'est montré.
import { z } from "zod";

export const pricingSchema = z.object({
  showDailyPrice: z.boolean(),
});

export type Pricing = z.infer<typeof pricingSchema>;

export const DEFAULT_PRICING: Pricing = {
  showDailyPrice: false,
};

/** Formate un montant en cents en devise locale (ex. 8550 → « 85,50 $ » / « $85.50 »). */
export function formatMoney(cents: number, lang: "fr" | "en"): string {
  const amount = cents / 100;
  const whole = amount % 1 === 0;
  if (lang === "fr") {
    const s = whole ? String(amount) : amount.toFixed(2).replace(".", ",");
    return `${s} $`;
  }
  const s = whole ? String(amount) : amount.toFixed(2);
  return `$${s}`;
}
