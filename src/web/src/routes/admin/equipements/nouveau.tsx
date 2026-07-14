import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { EquipmentForm } from "@/components/admin/EquipmentForm";
import { createEquipmentFn, listCategoriesFn } from "@/server/admin";

export const Route = createFileRoute("/admin/equipements/nouveau")({
  head: () => ({ meta: [{ title: "Nouvel équipement | Administration" }] }),
  loader: async () => ({ categories: await listCategoriesFn() }),
  component: NewEquipmentPage,
});

function NewEquipmentPage() {
  const { categories } = Route.useLoaderData();
  const navigate = useNavigate();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <h1 className="text-xl font-bold">Nouvel équipement</h1>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-6">
        <EquipmentForm
          initial={{}}
          categories={categories}
          isNew
          busy={busy}
          onSubmit={async (values) => {
            setBusy(true);
            setError(null);
            try {
              await createEquipmentFn({ data: values });
              await router.invalidate();
              navigate({ to: "/admin/equipements" });
            } catch (err) {
              setError(err instanceof Error ? err.message : "Erreur à la création.");
              setBusy(false);
            }
          }}
        />
      </div>
    </div>
  );
}
