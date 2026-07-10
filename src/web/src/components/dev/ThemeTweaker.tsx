import { useEffect, useState } from "react";

// Panneau de réglage du thème — DEV UNIQUEMENT (jamais inclus dans le build de prod).
// Ajustez les curseurs, puis « Copier la config » et collez le résultat pour figer le thème.

interface ThemeValues {
  bgL: number; // luminosité du fond de page
  surfaceL: number; // luminosité des sections sombres (CTA, footer)
  cardL: number; // luminosité des cartes
  accentL: number; // luminosité secondary/muted
  borderL: number; // luminosité des bordures
  warmth: number; // chroma (chaleur) des fonds — 0 = gris pur
  hue: number; // teinte des fonds (75 ≈ brun doré)
  goldL: number;
  goldC: number;
  goldH: number;
}

// Thème par défaut validé (= valeurs de styles.css) ; le Reset revient ici.
const DEFAULTS: ThemeValues = {
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

const STORAGE_KEY = "prestige-theme-tweaker";

function apply(v: ThemeValues) {
  const root = document.documentElement.style;
  const bg = (l: number, cMul = 1) => `oklch(${l} ${(v.warmth * cMul).toFixed(4)} ${v.hue})`;
  root.setProperty("--background", bg(v.bgL));
  root.setProperty("--surface", bg(v.surfaceL));
  root.setProperty("--card", bg(v.cardL, 1.2));
  root.setProperty("--popover", bg(v.cardL, 1.2));
  root.setProperty("--surface-elevated", bg(v.cardL + 0.03, 1.3));
  root.setProperty("--secondary", bg(v.accentL, 1.5));
  root.setProperty("--muted", bg(v.accentL, 1.5));
  root.setProperty("--border", bg(v.borderL, 2.5));
  root.setProperty("--input", bg(v.borderL, 2.5));
  const gold = `oklch(${v.goldL} ${v.goldC} ${v.goldH})`;
  root.setProperty("--primary", gold);
  root.setProperty("--accent", gold);
  root.setProperty("--ring", gold);
  root.setProperty(
    "--gradient-gold",
    `linear-gradient(135deg, oklch(${v.goldL + 0.02} ${v.goldC} ${v.goldH + 3}), oklch(${v.goldL - 0.06} ${v.goldC} ${v.goldH - 7}))`,
  );
  root.setProperty(
    "--overlay-hero",
    `linear-gradient(to right, ${bg(v.surfaceL)}f2 0%, ${bg(v.surfaceL)}b8 40%, ${bg(v.surfaceL)}1f 100%)`
      .replaceAll(")f2", " / 0.95)")
      .replaceAll(")b8", " / 0.72)")
      .replaceAll(")1f", " / 0.12)"),
  );
}

function configText(v: ThemeValues): string {
  return JSON.stringify(v, null, 2);
}

const SLIDERS: {
  key: keyof ThemeValues;
  label: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { key: "bgL", label: "Fond de page", min: 0.05, max: 0.35, step: 0.005 },
  { key: "surfaceL", label: "Sections sombres", min: 0.03, max: 0.3, step: 0.005 },
  { key: "cardL", label: "Cartes", min: 0.08, max: 0.4, step: 0.005 },
  { key: "accentL", label: "Fonds d'accent", min: 0.1, max: 0.45, step: 0.005 },
  { key: "borderL", label: "Bordures", min: 0.15, max: 0.55, step: 0.005 },
  { key: "warmth", label: "Chaleur (0 = gris)", min: 0, max: 0.03, step: 0.001 },
  { key: "hue", label: "Teinte des fonds", min: 20, max: 120, step: 1 },
  { key: "goldL", label: "Or — luminosité", min: 0.55, max: 0.9, step: 0.005 },
  { key: "goldC", label: "Or — saturation", min: 0.05, max: 0.2, step: 0.005 },
  { key: "goldH", label: "Or — teinte", min: 50, max: 100, step: 1 },
];

export function ThemeTweaker() {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [values, setValues] = useState<ThemeValues>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULTS, ...(JSON.parse(saved) as ThemeValues) };
    } catch {
      /* défauts */
    }
    return DEFAULTS;
  });

  useEffect(() => {
    apply(values);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  }, [values]);

  const set = (key: keyof ThemeValues, value: number) => setValues((v) => ({ ...v, [key]: value }));

  const copy = async () => {
    await navigator.clipboard.writeText(configText(values));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const panel: React.CSSProperties = {
    position: "fixed",
    bottom: 12,
    right: 12,
    zIndex: 9999,
    width: 260,
    background: "#1c1c1c",
    color: "#eee",
    border: "1px solid #444",
    borderRadius: 10,
    padding: open ? "10px 12px" : "6px 10px",
    fontSize: 11,
    fontFamily: "ui-monospace, monospace",
    boxShadow: "0 8px 30px rgba(0,0,0,.6)",
  };

  return (
    <div style={panel}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ fontSize: 12 }}>🎨 Réglage du thème (dev)</strong>
        <button onClick={() => setOpen(!open)} style={{ cursor: "pointer", color: "#aaa" }}>
          {open ? "—" : "+"}
        </button>
      </div>
      {open && (
        <>
          {SLIDERS.map((s) => (
            <label key={s.key} style={{ display: "block", marginTop: 7 }}>
              <span style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{s.label}</span>
                <span style={{ color: "#e1a447" }}>{values[s.key]}</span>
              </span>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={values[s.key]}
                onChange={(e) => set(s.key, Number(e.target.value))}
                style={{ width: "100%", accentColor: "#e1a447" }}
              />
            </label>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <button
              onClick={copy}
              style={{
                flex: 1,
                cursor: "pointer",
                background: "#e1a447",
                color: "#141414",
                fontWeight: 700,
                borderRadius: 6,
                padding: "6px 0",
              }}
            >
              {copied ? "Copié ✓" : "Copier la config"}
            </button>
            <button
              onClick={() => setValues(DEFAULTS)}
              style={{
                cursor: "pointer",
                border: "1px solid #555",
                borderRadius: 6,
                padding: "6px 8px",
                color: "#ccc",
              }}
            >
              Reset
            </button>
          </div>
        </>
      )}
    </div>
  );
}
