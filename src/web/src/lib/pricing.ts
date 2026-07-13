// Réglage des tarifs — la BD est la source de vérité (table settings, clé
// "pricing", éditée dans l'admin > Paramètres > onglet Tarifs). Quand
// showDailyPrice est activé, le site affiche les tarifs des équipements qui en
// ont ; sinon aucun prix n'est montré.
import { z } from "zod";

export const pricingSchema = z.object({
  showDailyPrice: z.boolean(),
});

export type Pricing = z.infer<typeof pricingSchema>;

export const DEFAULT_PRICING: Pricing = {
  showDailyPrice: false,
};

/**
 * Périodes de location, dans l'ordre d'affichage. `field` = propriété (en cents)
 * sur un équipement ; `labelKey` = clé i18n sous `equipmentPage.periods`.
 * Ajouter une période = 1 entrée ici + 1 colonne BD + 1 libellé i18n.
 */
export const RATE_PERIODS = [
  { field: "dailyPriceCents", labelKey: "day" },
  { field: "weeklyPriceCents", labelKey: "week" },
  { field: "weekendPriceCents", labelKey: "weekend" },
  { field: "monthlyPriceCents", labelKey: "month" },
] as const;

export type RatePeriodKey = (typeof RATE_PERIODS)[number]["labelKey"];

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
