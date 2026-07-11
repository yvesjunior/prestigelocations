import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  listRequestsFn,
  updateRequestStatusFn,
  validateRequestFn,
  type AdminRequest,
  type RequestStatus,
} from "@/server/admin";

export const Route = createFileRoute("/admin/demandes")({
  head: () => ({ meta: [{ title: "Demandes | Administration" }] }),
  loader: async () => ({ requests: await listRequestsFn() }),
  component: RequestsPage,
});

const STATUS: { value: RequestStatus; label: string }[] = [
  { value: "nouvelle", label: "Nouvelle" },
  { value: "en_cours", label: "En cours" },
  { value: "traitee", label: "Traitée" },
  { value: "sans_suite", label: "Sans suite" },
];

const STATUS_CLS: Record<RequestStatus, string> = {
  nouvelle: "bg-primary/25 text-primary",
  en_cours: "bg-secondary text-primary",
  traitee: "bg-secondary text-muted-foreground",
  sans_suite: "bg-destructive/20 text-destructive",
};

function RequestsPage() {
  const { requests } = Route.useLoaderData();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true);
    setError(null);
    try {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Erreur.");
        return;
      }
      router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setBusy(false);
    }
  }

  function validate(r: AdminRequest) {
    if (
      !confirm(
        `Valider la demande de ${r.name} (${r.equipmentLabel}, du ${r.startDate} au ${r.endDate}) ?\n` +
          "Une commande sera créée et l'équipement deviendra indisponible sur cette période.",
      )
    )
      return;
    run(() => validateRequestFn({ data: { id: r.id } }));
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-xl font-bold">Demandes de réservation</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Les demandes envoyées par le formulaire public. « Valider » crée la commande (client +
        période) et rend l'équipement indisponible sur ces dates.
      </p>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-card text-left text-xs tracking-wider text-primary uppercase">
              <th className="px-4 py-3">Reçue</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Équipement</th>
              <th className="px-4 py-3">Période souhaitée</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  Aucune demande pour l'instant.
                </td>
              </tr>
            )}
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-border/40 align-top last:border-0">
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {r.createdAt.slice(0, 10)}
                  <span className="block text-xs uppercase">{r.lang}</span>
                </td>
                <td className="px-4 py-3 font-medium">
                  {r.name}
                  <span className="block text-xs font-normal text-muted-foreground">{r.phone}</span>
                </td>
                <td className="px-4 py-3">{r.equipmentLabel}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {r.startDate ? `${r.startDate} → ${r.endDate}` : "—"}
                </td>
                <td
                  className="max-w-[220px] px-4 py-3 text-muted-foreground"
                  title={r.message ?? ""}
                >
                  <span className="line-clamp-2">{r.message ?? ""}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs ${STATUS_CLS[r.status]}`}>
                    {STATUS.find((s) => s.value === r.status)?.label}
                  </span>
                  {r.handledByName && (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      par {r.handledByName}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {r.orderId ? (
                    <Link to="/admin/commandes" className="text-xs text-primary hover:underline">
                      Commande créée →
                    </Link>
                  ) : (
                    <>
                      {r.equipmentId && r.startDate && r.endDate && (
                        <button
                          disabled={busy}
                          onClick={() => validate(r)}
                          className="text-xs text-primary hover:underline"
                        >
                          Valider → commande
                        </button>
                      )}
                      <select
                        value={r.status}
                        disabled={busy}
                        onChange={(e) =>
                          run(() =>
                            updateRequestStatusFn({
                              data: { id: r.id, status: e.target.value as RequestStatus },
                            }),
                          )
                        }
                        className="ml-3 rounded-md border border-input bg-background px-2 py-1 text-xs"
                      >
                        {STATUS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
