import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { listCategoriesFn, updateCategoryFn, type AdminCategory } from "@/server/admin";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "Catégories | Administration" }] }),
  loader: async () => ({ categories: await listCategoriesFn() }),
  component: CategoriesPage,
});

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";
const labelCls = "mb-1 block text-xs font-semibold uppercase text-muted-foreground";

function CategoryEditor({ category }: { category: AdminCategory }) {
  const router = useRouter();
  const [v, setV] = useState(category);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof AdminCategory>(key: K, value: AdminCategory[K]) =>
    setV((prev) => ({ ...prev, [key]: value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await updateCategoryFn({ data: v });
    setBusy(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.invalidate();
  }

  return (
    <form onSubmit={save} className="rounded-xl border border-border/60 bg-card p-5">
      <p className="text-sm font-bold tracking-wider text-primary uppercase">{category.slug}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Nom (FR)</label>
          <input
            value={v.nameFr}
            onChange={(e) => set("nameFr", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Nom (EN)</label>
          <input
            value={v.nameEn}
            onChange={(e) => set("nameEn", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Description carte accueil (FR)</label>
          <textarea
            rows={2}
            value={v.cardDescriptionFr}
            onChange={(e) => set("cardDescriptionFr", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Description carte accueil (EN)</label>
          <textarea
            rows={2}
            value={v.cardDescriptionEn}
            onChange={(e) => set("cardDescriptionEn", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Description page Équipements (FR)</label>
          <textarea
            rows={2}
            value={v.pageDescriptionFr}
            onChange={(e) => set("pageDescriptionFr", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Description page Équipements (EN)</label>
          <textarea
            rows={2}
            value={v.pageDescriptionEn}
            onChange={(e) => set("pageDescriptionEn", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Bouton (FR)</label>
          <input
            value={v.ctaFr}
            onChange={(e) => set("ctaFr", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Bouton (EN)</label>
          <input
            value={v.ctaEn}
            onChange={(e) => set("ctaEn", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Ordre d'affichage</label>
          <input
            type="number"
            min={0}
            value={v.position}
            onChange={(e) => set("position", Number(e.target.value))}
            className={inputCls}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button type="submit" disabled={busy} className="btn-gold-outline disabled:opacity-60">
          {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
        {saved && <span className="text-sm text-primary">Enregistré ✓</span>}
      </div>
    </form>
  );
}

function CategoriesPage() {
  const { categories } = Route.useLoaderData();
  return (
    <div>
      <h1 className="text-xl font-bold">Catégories</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Les identifiants (slugs) sont immuables ; une catégorie ne peut pas être supprimée si elle
        contient des équipements.
      </p>
      <div className="mt-6 space-y-6">
        {categories.map((c) => (
          <CategoryEditor key={c.id} category={c} />
        ))}
      </div>
    </div>
  );
}
