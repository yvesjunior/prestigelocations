import { createFileRoute, notFound, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { EquipmentForm } from "@/components/admin/EquipmentForm";
import { EquipmentAvailability } from "@/components/admin/EquipmentAvailability";
import {
  deleteEquipmentFn,
  listCategoriesFn,
  listEquipmentsFn,
  listOrdersFn,
  updateEquipmentFn,
} from "@/server/admin";
import { useIsAdvanced } from "@/lib/useMode";

export const Route = createFileRoute("/admin/equipements/$id")({
  head: () => ({ meta: [{ title: "Modifier un équipement | Administration" }] }),
  loader: async ({ params }) => {
    const [equipments, categories, orders] = await Promise.all([
      listEquipmentsFn(),
      listCategoriesFn(),
      listOrdersFn(),
    ]);
    const equipment = equipments.find((e) => e.id === Number(params.id));
    if (!equipment) throw notFound();
    return { equipment, categories, orders };
  },
  component: EditEquipmentPage,
});

function EditEquipmentPage() {
  const { equipment, categories, orders } = Route.useLoaderData();
  const navigate = useNavigate();
  const router = useRouter();
  const advanced = useIsAdvanced();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <h1 className="text-xl font-bold">
        Modifier : <span className="text-primary">{equipment.nameFr}</span>
      </h1>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-6">
        <EquipmentForm
          initial={equipment}
          categories={categories}
          isNew={false}
          busy={busy}
          onSubmit={async (values) => {
            setBusy(true);
            setError(null);
            try {
              await updateEquipmentFn({ data: { id: equipment.id, ...values } });
              // Vider le cache du routeur pour que la liste ET la fiche montrent
              // les nouvelles valeurs sans rafraîchir la page.
              await router.invalidate();
              navigate({ to: "/admin/equipements" });
            } catch (err) {
              setError(err instanceof Error ? err.message : "Erreur à l'enregistrement.");
              setBusy(false);
            }
          }}
          onDelete={async () => {
            setBusy(true);
            setError(null);
            try {
              const res = await deleteEquipmentFn({ data: { id: equipment.id } });
              // Lié à des commandes → confirmer le retrait de ces commandes.
              if (!res.ok && res.requiresConfirm) {
                const n = res.orderCount ?? 0;
                const ok = confirm(
                  `Cet équipement figure dans ${n} commande(s).\n\n` +
                    `Le supprimer le retirera de ces commandes ; celles qui ne contiennent ` +
                    `que cet équipement seront supprimées.\n\nContinuer la suppression ?`,
                );
                if (!ok) {
                  setBusy(false);
                  return;
                }
                await deleteEquipmentFn({ data: { id: equipment.id, force: true } });
              }
              await router.invalidate();
              navigate({ to: "/admin/equipements" });
            } catch (err) {
              setError(err instanceof Error ? err.message : "Erreur à la suppression.");
              setBusy(false);
            }
          }}
        />
      </div>

      {advanced && (
        <div className="mt-10 border-t border-border/60 pt-8">
          <EquipmentAvailability orders={orders} equipmentId={equipment.id} />
        </div>
      )}
    </div>
  );
}
