import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  createCategoryFn,
  deleteCategoryFn,
  listCategoriesFn,
  updateCategoryFn,
  type AdminCategory,
} from "@/server/admin";

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

  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function remove() {
    if (
      !confirm(
        `Supprimer la catégorie « ${category.nameFr} » ? Impossible si elle contient des équipements.`,
      )
    )
      return;
    setBusy(true);
    setDeleteError(null);
    const result = await deleteCategoryFn({ data: { id: category.id } });
    setBusy(false);
    if (!result.ok) {
      setDeleteError(result.error ?? "Erreur.");
      return;
    }
    router.invalidate();
  }

  return (
    <form onSubmit={save} className="rounded-xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold tracking-wider text-primary uppercase">{category.slug}</p>
        <button
          type="button"
          disabled={busy}
          onClick={remove}
          className="text-xs text-destructive hover:underline"
        >
          Supprimer
        </button>
      </div>
      {deleteError && <p className="mt-2 text-sm text-destructive">{deleteError}</p>}
      <div className="mt-4">
        <label className={labelCls}>Photo (accueil et page Équipements)</label>
        <ImageUpload
          imageKey={v.imageKey}
          folder="categories"
          alt={v.nameFr}
          onChange={(key) => set("imageKey", key)}
        />
      </div>
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

const CREATE_DEFAULTS = {
  nameFr: "",
  nameEn: "",
  cardDescriptionFr: "",
  cardDescriptionEn: "",
  pageDescriptionFr: "",
  pageDescriptionEn: "",
  ctaFr: "Voir les équipements",
  ctaEn: "See the equipment",
};

const CREATE_FIELDS: { key: keyof typeof CREATE_DEFAULTS; label: string; textarea?: boolean }[] = [
  { key: "nameFr", label: "Nom (FR)" },
  { key: "nameEn", label: "Nom (EN)" },
  { key: "cardDescriptionFr", label: "Description carte accueil (FR)", textarea: true },
  { key: "cardDescriptionEn", label: "Description carte accueil (EN)", textarea: true },
  { key: "pageDescriptionFr", label: "Description page Équipements (FR)", textarea: true },
  { key: "pageDescriptionEn", label: "Description page Équipements (EN)", textarea: true },
  { key: "ctaFr", label: "Bouton (FR)" },
  { key: "ctaEn", label: "Bouton (EN)" },
];

function CategoryCreateForm() {
  const router = useRouter();
  const [v, setV] = useState(CREATE_DEFAULTS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await createCategoryFn({ data: v });
      if (!result.ok) {
        setError(result.error ?? "Erreur.");
        return;
      }
      setV(CREATE_DEFAULTS);
      router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={create} className="rounded-xl border border-border/60 bg-card p-5">
      <p className="text-sm font-bold">Ajouter une catégorie</p>
      <p className="mt-1 text-xs text-muted-foreground">
        L'identifiant est généré du nom FR. La nouvelle catégorie apparaît immédiatement sur le site
        public ; ajoutez-y sa photo et ses équipements depuis leurs fiches.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {CREATE_FIELDS.map((f) => (
          <div key={f.key}>
            <label className={labelCls}>{f.label}</label>
            {f.textarea ? (
              <textarea
                rows={2}
                required
                value={v[f.key]}
                onChange={(e) => setV((prev) => ({ ...prev, [f.key]: e.target.value }))}
                className={inputCls}
              />
            ) : (
              <input
                required
                value={v[f.key]}
                onChange={(e) => setV((prev) => ({ ...prev, [f.key]: e.target.value }))}
                className={inputCls}
              />
            )}
          </div>
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <button type="submit" disabled={busy} className="btn-gold-outline mt-4 disabled:opacity-60">
        {busy ? "Création…" : "Créer la catégorie"}
      </button>
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
        <CategoryCreateForm />
      </div>
    </div>
  );
}
