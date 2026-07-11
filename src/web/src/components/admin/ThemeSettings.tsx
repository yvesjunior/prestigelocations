import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ACCENT_PRESETS, DEFAULT_THEME, themeToCssVars, type ThemeConfig } from "@/lib/theme";
import { resetThemeFn, updateThemeFn } from "@/server/admin";

const SLIDERS: { key: keyof ThemeConfig; label: string; min: number; max: number; step: number }[] =
  [
    { key: "bgL", label: "Fond de page", min: 0.03, max: 0.4, step: 0.005 },
    { key: "surfaceL", label: "Sections sombres", min: 0.03, max: 0.35, step: 0.005 },
    { key: "cardL", label: "Cartes", min: 0.05, max: 0.45, step: 0.005 },
    { key: "accentL", label: "Fonds d'accent", min: 0.08, max: 0.5, step: 0.005 },
    { key: "borderL", label: "Bordures", min: 0.1, max: 0.6, step: 0.005 },
    { key: "warmth", label: "Chaleur (0 = gris)", min: 0, max: 0.04, step: 0.001 },
    { key: "hue", label: "Teinte des fonds", min: 0, max: 360, step: 1 },
    { key: "goldL", label: "Accent — luminosité", min: 0.4, max: 0.95, step: 0.005 },
    { key: "goldC", label: "Accent — saturation", min: 0, max: 0.25, step: 0.005 },
    { key: "goldH", label: "Accent — teinte", min: 0, max: 360, step: 1 },
  ];

/** Applique le thème en direct sur la page (aperçu avant enregistrement). */
function preview(theme: ThemeConfig) {
  const root = document.documentElement.style;
  for (const [k, v] of Object.entries(themeToCssVars(theme))) root.setProperty(k, v);
}

function clearPreview() {
  const root = document.documentElement.style;
  for (const k of Object.keys(themeToCssVars(DEFAULT_THEME))) root.removeProperty(k);
}

export function ThemeSettings({ saved }: { saved: ThemeConfig }) {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeConfig>(saved);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    preview(theme);
  }, [theme]);
  // À la sortie de la page, on retire l'aperçu (le thème enregistré reprend la main).
  useEffect(() => () => clearPreview(), []);

  const set = (key: keyof ThemeConfig, value: number) =>
    setTheme((prev) => ({ ...prev, [key]: value }));

  async function save() {
    setBusy(true);
    await updateThemeFn({ data: theme });
    setBusy(false);
    setMessage("Thème enregistré — le site public est à jour.");
    router.invalidate();
  }

  async function reset() {
    setBusy(true);
    await resetThemeFn();
    setTheme(DEFAULT_THEME);
    setBusy(false);
    setMessage("Thème réinitialisé au réglage par défaut.");
    router.invalidate();
  }

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-muted-foreground">
        Les réglages s'appliquent en aperçu sur cette page ; « Enregistrer » les publie sur le site.
        « Réinitialiser » revient au thème par défaut.
      </p>

      <div className="mt-6 rounded-xl border border-border/60 bg-card p-5">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Couleur d'accent
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ACCENT_PRESETS.map((p) => {
            const active =
              theme.goldL === p.goldL && theme.goldC === p.goldC && theme.goldH === p.goldH;
            return (
              <button
                key={p.key}
                onClick={() =>
                  setTheme((prev) => ({
                    ...prev,
                    goldL: p.goldL,
                    goldC: p.goldC,
                    goldH: p.goldH,
                  }))
                }
                className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  active ? "border-primary text-primary" : "border-border text-foreground/80"
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ background: `oklch(${p.goldL} ${p.goldC} ${p.goldH})` }}
                />
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {SLIDERS.map((s) => (
            <label key={s.key} className="block text-sm">
              <span className="flex justify-between">
                <span>{s.label}</span>
                <span className="text-primary">{theme[s.key]}</span>
              </span>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={theme[s.key]}
                onChange={(e) => set(s.key, Number(e.target.value))}
                className="w-full accent-[var(--primary)]"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button onClick={save} disabled={busy} className="btn-gold disabled:opacity-60">
          {busy ? "…" : "Enregistrer"}
        </button>
        <button onClick={reset} disabled={busy} className="btn-gold-outline disabled:opacity-60">
          Réinitialiser
        </button>
        {message && <span className="text-sm text-primary">{message}</span>}
      </div>
    </div>
  );
}
