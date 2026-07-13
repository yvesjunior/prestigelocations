import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Eye, Plus } from "lucide-react";
import { listEquipmentsFn, updateEquipmentFn } from "@/server/admin";
import { iconActionCls } from "@/components/admin/action-icons";

export const Route = createFileRoute("/admin/equipements/")({
  head: () => ({ meta: [{ title: "Équipements | Administration" }] }),
  loader: async () => ({ equipments: await listEquipmentsFn() }),
  component: EquipmentListPage,
});

const STATUS_LABEL: Record<string, string> = {
  disponible: "Disponible",
  bientot: "Bientôt",
  sur_demande: "Sur demande",
};

function EquipmentListPage() {
  const { equipments } = Route.useLoaderData();
  const router = useRouter();

  async function togglePublished(id: number, published: boolean) {
    await updateEquipmentFn({ data: { id, published } });
    router.invalidate();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Équipements</h1>
        <Link to="/admin/equipements/nouveau" className="btn-gold-outline">
          <Plus className="h-4 w-4" /> Ajouter
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-card text-left text-xs tracking-wider text-primary uppercase">
              <th className="px-4 py-3">Nom (FR)</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Publié</th>
              <th className="px-4 py-3">Ordre</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {equipments.map((e) => (
              <tr key={e.id} className="border-b border-border/40 last:border-0 hover:bg-card/60">
                <td className="px-4 py-3 font-medium">{e.nameFr}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.code ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.categoryName}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      e.status === "disponible"
                        ? "bg-secondary text-primary"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {STATUS_LABEL[e.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => togglePublished(e.id, !e.published)}
                    className={`rounded px-2 py-0.5 text-xs transition-colors ${
                      e.published
                        ? "bg-secondary text-primary"
                        : "bg-destructive/20 text-destructive"
                    }`}
                    title={e.published ? "Cliquer pour masquer du site" : "Cliquer pour publier"}
                  >
                    {e.published ? "Oui" : "Masqué"}
                  </button>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{e.position}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to="/admin/equipements/$id"
                    params={{ id: String(e.id) }}
                    title="Voir la fiche (modifier / supprimer)"
                    className={`inline-flex ${iconActionCls.view}`}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Voir</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
