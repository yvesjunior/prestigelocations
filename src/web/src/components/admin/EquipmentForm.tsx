import { useState } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { AdminCategory, AdminEquipment } from "@/server/admin";

export interface EquipmentFormValues {
  slug: string;
  code: string | null;
  categoryId: number;
  nameFr: string;
  nameEn: string;
  detailFr: string | null;
  detailEn: string | null;
  formLabelFr: string | null;
  formLabelEn: string | null;
  status: "disponible" | "bientot" | "sur_demande";
  imageKey: string | null;
  published: boolean;
  position: number;
}

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";
const labelCls = "mb-1 block text-xs font-semibold uppercase text-muted-foreground";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function EquipmentForm({
  initial,
  categories,
  isNew,
  onSubmit,
  onDelete,
  busy,
}: {
  initial: Partial<AdminEquipment>;
  categories: AdminCategory[];
  isNew: boolean;
  onSubmit: (values: EquipmentFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
  busy: boolean;
}) {
  const [v, setV] = useState<EquipmentFormValues>({
    slug: initial.slug ?? "",
    code: initial.code ?? null,
    categoryId: initial.categoryId ?? categories[0]?.id ?? 0,
    nameFr: initial.nameFr ?? "",
    nameEn: initial.nameEn ?? "",
    detailFr: initial.detailFr ?? null,
    detailEn: initial.detailEn ?? null,
    formLabelFr: initial.formLabelFr ?? null,
    formLabelEn: initial.formLabelEn ?? null,
    status: initial.status ?? "disponible",
    imageKey: initial.imageKey ?? null,
    published: initial.published ?? true,
    position: initial.position ?? 0,
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = <K extends keyof EquipmentFormValues>(key: K, value: EquipmentFormValues[K]) =>
    setV((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
      className="max-w-3xl space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Nom (FR) *</label>
          <input
            required
            value={v.nameFr}
            onChange={(e) => {
              set("nameFr", e.target.value);
              if (isNew) set("slug", slugify(e.target.value));
            }}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Nom (EN) *</label>
          <input
            required
            value={v.nameEn}
            onChange={(e) => set("nameEn", e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Ligne détaillée page Équipements (FR)</label>
          <input
            value={v.detailFr ?? ""}
            onChange={(e) => set("detailFr", e.target.value || null)}
            placeholder="Sinon le nom est affiché"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Ligne détaillée page Équipements (EN)</label>
          <input
            value={v.detailEn ?? ""}
            onChange={(e) => set("detailEn", e.target.value || null)}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Libellé du formulaire de contact (FR)</label>
          <input
            value={v.formLabelFr ?? ""}
            onChange={(e) => set("formLabelFr", e.target.value || null)}
            placeholder="Sinon le nom est affiché"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Libellé du formulaire de contact (EN)</label>
          <input
            value={v.formLabelEn ?? ""}
            onChange={(e) => set("formLabelEn", e.target.value || null)}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={labelCls}>Catégorie *</label>
          <select
            value={v.categoryId}
            onChange={(e) => set("categoryId", Number(e.target.value))}
            className={inputCls}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameFr}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Statut *</label>
          <select
            value={v.status}
            onChange={(e) => set("status", e.target.value as EquipmentFormValues["status"])}
            className={inputCls}
          >
            <option value="disponible">Disponible</option>
            <option value="bientot">Bientôt disponible</option>
            <option value="sur_demande">Sur demande</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Ordre dans la catégorie</label>
          <input
            type="number"
            min={0}
            value={v.position}
            onChange={(e) => set("position", Number(e.target.value))}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Code (optionnel)</label>
          <input
            value={v.code ?? ""}
            onChange={(e) => set("code", e.target.value || null)}
            placeholder="Ex. MP-01"
            title="Distingue deux unités portant le même nom — affiché entre parenthèses"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Identifiant (slug)</label>
          <input
            value={v.slug}
            onChange={(e) => set("slug", slugify(e.target.value))}
            disabled={!isNew}
            required
            className={`${inputCls} disabled:opacity-50`}
            title={isNew ? "" : "Le slug est immuable après création"}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={v.published}
            onChange={(e) => set("published", e.target.checked)}
            className="h-4 w-4 accent-[var(--primary)]"
          />
          Publié sur le site
        </label>
      </div>

      <div>
        <label className={labelCls}>Photo</label>
        <ImageUpload
          imageKey={v.imageKey}
          folder="equipements"
          alt={v.nameFr || "Équipement"}
          onChange={(key) => set("imageKey", key)}
        />
      </div>

      <div className="flex items-center gap-3 border-t border-border/60 pt-5">
        <button type="submit" disabled={busy} className="btn-gold disabled:opacity-60">
          {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
        {onDelete &&
          (confirmDelete ? (
            <span className="flex items-center gap-2 text-sm">
              Confirmer la suppression définitive ?
              <button
                type="button"
                onClick={onDelete}
                className="rounded-md bg-destructive px-3 py-1.5 text-sm font-semibold text-destructive-foreground"
              >
                Supprimer
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-muted-foreground hover:underline"
              >
                Annuler
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-sm text-destructive hover:underline"
            >
              Supprimer définitivement
            </button>
          ))}
      </div>
    </form>
  );
}
