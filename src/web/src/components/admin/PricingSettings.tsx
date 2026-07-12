import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { updatePricingFn } from "@/server/admin";
import type { Pricing } from "@/lib/pricing";

/** Onglet « Tarifs » des Paramètres : activer/désactiver l'affichage des prix. */
export function PricingSettings({ saved }: { saved: Pricing }) {
  const router = useRouter();
  const [showDailyPrice, setShowDailyPrice] = useState(saved.showDailyPrice);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const dirty = showDailyPrice !== saved.showDailyPrice;

  async function save() {
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const res = await updatePricingFn({ data: { showDailyPrice } });
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
      <h2 className="text-lg font-bold">Tarifs</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Quand cette option est activée, le site public affiche le{" "}
        <span className="text-primary">prix / jour</span> des équipements qui en ont un (défini sur
        la fiche de chaque équipement). Les équipements sans prix n'affichent rien.
      </p>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showDailyPrice}
          disabled={busy}
          onChange={(e) => setShowDailyPrice(e.target.checked)}
          className="h-4 w-4 accent-[var(--primary)]"
        />
        Afficher les prix / jour sur le site
      </label>
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
