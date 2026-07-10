import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { EquipmentForm } from "@/components/admin/EquipmentForm";
import {
  deleteEquipmentFn,
  listCategoriesFn,
  listEquipmentsFn,
  updateEquipmentFn,
} from "@/server/admin";

export const Route = createFileRoute("/admin/equipements/$id")({
  head: () => ({ meta: [{ title: "Modifier un équipement | Administration" }] }),
  loader: async ({ params }) => {
    const [equipments, categories] = await Promise.all([listEquipmentsFn(), listCategoriesFn()]);
    const equipment = equipments.find((e) => e.id === Number(params.id));
    if (!equipment) throw notFound();
    return { equipment, categories };
  },
  component: EditEquipmentPage,
});

function EditEquipmentPage() {
  const { equipment, categories } = Route.useLoaderData();
  const navigate = useNavigate();
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
              navigate({ to: "/admin/equipements" });
            } catch (err) {
              setError(err instanceof Error ? err.message : "Erreur à l'enregistrement.");
              setBusy(false);
            }
          }}
          onDelete={async () => {
            setBusy(true);
            try {
              await deleteEquipmentFn({ data: { id: equipment.id } });
              navigate({ to: "/admin/equipements" });
            } catch (err) {
              setError(err instanceof Error ? err.message : "Erreur à la suppression.");
              setBusy(false);
            }
          }}
        />
      </div>
    </div>
  );
}
