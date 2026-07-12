import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { ImageUpload } from "./ImageUpload";
import { updateBrandingFn } from "@/server/admin";
import type { Branding } from "@/lib/branding";

/** Onglet « Logo » des Paramètres : téléverse le logo de la marque (ImageKit). */
export function BrandingSettings({ saved }: { saved: Branding }) {
  const router = useRouter();
  const [logoKey, setLogoKey] = useState<string | null>(saved.logoKey);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const dirty = logoKey !== saved.logoKey;

  async function save() {
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const res = await updateBrandingFn({ data: { logoKey } });
      if (!res.ok) {
        setError("Erreur à l'enregistrement.");
        return;
      }
      setDone(true);
      router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur à l'enregistrement.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-bold">Logo</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Logo affiché dans l'en-tête, le pied de page et l'onglet du navigateur. Téléversez de
        préférence un <span className="text-primary">PNG à fond transparent</span> : le site est
        sombre, un fond opaque apparaîtra comme un rectangle. Vide = logo par défaut du site.
      </p>
      <div className="mt-4">
        <ImageUpload
          imageKey={logoKey}
          folder="branding"
          alt="Logo Prestige Locations"
          onChange={setLogoKey}
        />
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {done && !dirty && <p className="mt-3 text-sm text-primary">Enregistré.</p>}
      <button
        type="button"
        onClick={save}
        disabled={busy || !dirty}
        className="btn-gold-outline mt-4 disabled:opacity-60"
      >
        {busy ? "Enregistrement…" : "Enregistrer"}
      </button>
    </div>
  );
}
