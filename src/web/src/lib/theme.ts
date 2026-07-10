// Thème de la plateforme — partagé entre le site public (injection SSR),
// la page Apparence de l'admin et le panneau de réglage dev.
import { z } from "zod";

export const themeConfigSchema = z.object({
  bgL: z.number().min(0.03).max(0.4),
  surfaceL: z.number().min(0.03).max(0.35),
  cardL: z.number().min(0.05).max(0.45),
  accentL: z.number().min(0.08).max(0.5),
  borderL: z.number().min(0.1).max(0.6),
  warmth: z.number().min(0).max(0.04),
  hue: z.number().min(0).max(360),
  goldL: z.number().min(0.4).max(0.95),
  goldC: z.number().min(0).max(0.25),
  goldH: z.number().min(0).max(360),
});

export type ThemeConfig = z.infer<typeof themeConfigSchema>;

/** Thème par défaut validé par le prestataire (2026-07-10) — cible du « Réinitialiser ». */
export const DEFAULT_THEME: ThemeConfig = {
  bgL: 0.05,
  surfaceL: 0.08,
  cardL: 0.17,
  accentL: 0.2,
  borderL: 0.28,
  warmth: 0.005,
  hue: 75,
  goldL: 0.72,
  goldC: 0.155,
  goldH: 73,
};

/** Préréglages de couleur d'accent proposés dans l'admin. */
export const ACCENT_PRESETS: {
  key: string;
  label: string;
  goldL: number;
  goldC: number;
  goldH: number;
}[] = [
  {
    key: "or",
    label: "Or (défaut)",
    goldL: DEFAULT_THEME.goldL,
    goldC: DEFAULT_THEME.goldC,
    goldH: DEFAULT_THEME.goldH,
  },
  { key: "vert", label: "Vert", goldL: 0.7, goldC: 0.15, goldH: 150 },
  { key: "rouge", label: "Rouge", goldL: 0.62, goldC: 0.19, goldH: 25 },
  { key: "bleu", label: "Bleu", goldL: 0.68, goldC: 0.15, goldH: 250 },
];

/** Variables CSS générées par le thème (même mapping que le panneau dev). */
export function themeToCssVars(v: ThemeConfig): Record<string, string> {
  const bg = (l: number, cMul = 1) => `oklch(${l} ${(v.warmth * cMul).toFixed(4)} ${v.hue})`;
  const gold = `oklch(${v.goldL} ${v.goldC} ${v.goldH})`;
  return {
    "--background": bg(v.bgL),
    "--surface": bg(v.surfaceL),
    "--card": bg(v.cardL, 1.2),
    "--popover": bg(v.cardL, 1.2),
    "--surface-elevated": bg(v.cardL + 0.03, 1.3),
    "--secondary": bg(v.accentL, 1.5),
    "--muted": bg(v.accentL, 1.5),
    "--border": bg(v.borderL, 2.5),
    "--input": bg(v.borderL, 2.5),
    "--primary": gold,
    "--accent": gold,
    "--ring": gold,
    "--gradient-gold": `linear-gradient(135deg, oklch(${v.goldL + 0.02} ${v.goldC} ${v.goldH + 3}), oklch(${v.goldL - 0.06} ${v.goldC} ${v.goldH - 7}))`,
    "--shadow-gold": `0 10px 40px -12px oklch(${v.goldL} ${v.goldC} ${v.goldH} / 0.35)`,
    "--overlay-hero": `linear-gradient(to right, oklch(${v.surfaceL} ${v.warmth.toFixed(4)} ${v.hue} / 0.95) 0%, oklch(${v.surfaceL} ${v.warmth.toFixed(4)} ${v.hue} / 0.72) 40%, oklch(${v.surfaceL} ${v.warmth.toFixed(4)} ${v.hue} / 0.12) 100%)`,
  };
}

export function themeToCss(v: ThemeConfig): string {
  return `:root{${Object.entries(themeToCssVars(v))
    .map(([k, val]) => `${k}:${val}`)
    .join(";")}}`;
}
