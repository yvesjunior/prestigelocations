import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Ban, ClipboardCheck, Eye, Pencil, RotateCcw } from "lucide-react";
import {
  listEquipmentsFn,
  listRequestsFn,
  updateRequestFn,
  updateRequestStatusFn,
  validateRequestFn,
  type AdminEquipment,
  type AdminRequest,
  type RequestStatus,
} from "@/server/admin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { iconActionCls } from "@/components/admin/action-icons";
import { MultiSelect } from "@/components/ui/multi-select";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 border-b border-border/40 py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm whitespace-pre-wrap">{value}</span>
    </div>
  );
}

export const Route = createFileRoute("/admin/demandes")({
  head: () => ({ meta: [{ title: "Demandes | Administration" }] }),
  loader: async () => ({
    requests: await listRequestsFn(),
    equipments: await listEquipmentsFn(),
  }),
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

type EditForm = {
  name: string;
  phone: string;
  equipmentIds: number[];
  startDate: string;
  endDate: string;
  message: string;
};

const INPUT_CLS =
  "w-full rounded-md border border-input bg-background px-2 py-1 text-sm disabled:opacity-60";

function RequestsPage() {
  const { requests, equipments } = Route.useLoaderData();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<EditForm | null>(null);
  const [viewing, setViewing] = useState<AdminRequest | null>(null);

  async function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true);
    setError(null);
    try {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Erreur.");
        return false;
      }
      router.invalidate();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  function startEdit(r: AdminRequest) {
    setError(null);
    setEditingId(r.id);
    setForm({
      name: r.name,
      phone: r.phone,
      // Seuls les équipements précis (equipmentId non nul) sont pré-cochés.
      equipmentIds: r.equipments.map((e) => e.equipmentId).filter((x): x is number => x !== null),
      startDate: r.startDate ?? "",
      endDate: r.endDate ?? "",
      message: r.message ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(null);
    setError(null);
  }

  async function save(id: number) {
    if (!form) return;
    const ok = await run(() =>
      updateRequestFn({
        data: {
          id,
          name: form.name.trim(),
          phone: form.phone.trim(),
          equipmentIds: form.equipmentIds,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          message: form.message.trim() || null,
        },
      }),
    );
    if (ok) cancelEdit();
  }

  function validate(r: AdminRequest) {
    if (
      !confirm(
        `Confirmer la demande de ${r.name} (${r.equipments.map((e) => e.label).join(", ")}, du ${r.startDate} au ${r.endDate}) ?\n` +
          "Une commande sera créée et les équipements deviendront indisponibles sur cette période.",
      )
    )
      return;
    run(() => validateRequestFn({ data: { id: r.id } }));
  }

  function patch(p: Partial<EditForm>) {
    setForm((f) => (f ? { ...f, ...p } : f));
  }

  function setStatus(r: AdminRequest, status: RequestStatus) {
    run(() => updateRequestStatusFn({ data: { id: r.id, status } }));
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-xl font-bold">Demandes de réservation</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Les demandes envoyées par le formulaire public. Après l'appel au client, « Éditer » ajuste
        les équipements et les dates convenus (la demande passe « en cours ») ; « Créer la commande
        » crée alors la commande (client + période) et rend ces équipements indisponibles sur ces
        dates. Le statut évolue tout seul selon vos actions.
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
            {requests.map((r) => {
              const editing = editingId === r.id && form !== null;
              const canConfirm =
                r.equipments.some((e) => e.equipmentId !== null) &&
                r.startDate !== null &&
                r.endDate !== null;
              return (
                <tr key={r.id} className="border-b border-border/40 align-top last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {r.createdAt.slice(0, 10)}
                    <span className="block text-xs uppercase">{r.lang}</span>
                  </td>
                  {editing ? (
                    <td className="px-4 py-3" colSpan={5}>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-xs text-muted-foreground">
                          Nom
                          <input
                            className={INPUT_CLS}
                            value={form.name}
                            disabled={busy}
                            onChange={(e) => patch({ name: e.target.value })}
                          />
                        </label>
                        <label className="text-xs text-muted-foreground">
                          Téléphone
                          <input
                            className={INPUT_CLS}
                            value={form.phone}
                            disabled={busy}
                            onChange={(e) => patch({ phone: e.target.value })}
                          />
                        </label>
                        <div className="text-xs text-muted-foreground sm:col-span-2">
                          Équipements ({form.equipmentIds.length}){" "}
                          <span className="text-muted-foreground/70">
                            — vide = Autre / plusieurs
                          </span>
                          <div className="mt-1">
                            <MultiSelect
                              options={equipments.map((eq: AdminEquipment) => ({
                                value: String(eq.id),
                                label: eq.code ? `${eq.nameFr} (${eq.code})` : eq.nameFr,
                              }))}
                              selected={form.equipmentIds.map(String)}
                              onChange={(vals) => patch({ equipmentIds: vals.map(Number) })}
                              disabled={busy}
                              placeholder="Choisir un ou plusieurs équipements…"
                              searchPlaceholder="Rechercher un équipement…"
                              emptyText="Aucun équipement trouvé."
                            />
                          </div>
                        </div>
                        <label className="text-xs text-muted-foreground">
                          Début
                          <input
                            type="date"
                            className={INPUT_CLS}
                            value={form.startDate}
                            disabled={busy}
                            onChange={(e) => patch({ startDate: e.target.value })}
                          />
                        </label>
                        <label className="text-xs text-muted-foreground">
                          Fin
                          <input
                            type="date"
                            className={INPUT_CLS}
                            value={form.endDate}
                            disabled={busy}
                            onChange={(e) => patch({ endDate: e.target.value })}
                          />
                        </label>
                        <label className="text-xs text-muted-foreground sm:col-span-2">
                          Message / note
                          <textarea
                            className={INPUT_CLS}
                            rows={2}
                            value={form.message}
                            disabled={busy}
                            onChange={(e) => patch({ message: e.target.value })}
                          />
                        </label>
                      </div>
                      <div className="mt-3 flex gap-3">
                        <button
                          disabled={busy}
                          onClick={() => save(r.id)}
                          className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-60"
                        >
                          Enregistrer
                        </button>
                        <button
                          disabled={busy}
                          onClick={cancelEdit}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          Annuler
                        </button>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium">
                        {r.name}
                        <span className="block text-xs font-normal text-muted-foreground">
                          {r.phone}
                        </span>
                      </td>
                      <td className="px-4 py-3">{r.equipments.map((e) => e.label).join(", ")}</td>
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
                    </>
                  )}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {r.orderId ? (
                      <Link to="/admin/commandes" className="text-xs text-primary hover:underline">
                        Commande créée →
                      </Link>
                    ) : editing ? null : (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Voir la demande"
                          disabled={busy}
                          onClick={() => setViewing(r)}
                          className={iconActionCls.view}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir</span>
                        </button>
                        {r.status === "sans_suite" ? (
                          <button
                            type="button"
                            title="Rouvrir la demande"
                            disabled={busy}
                            onClick={() => setStatus(r, "en_cours")}
                            className={iconActionCls.positive}
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span className="sr-only">Rouvrir</span>
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              title="Éditer la demande"
                              disabled={busy}
                              onClick={() => startEdit(r)}
                              className={iconActionCls.edit}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Éditer</span>
                            </button>
                            <button
                              type="button"
                              title="Sans suite"
                              disabled={busy}
                              onClick={() => setStatus(r, "sans_suite")}
                              className={iconActionCls.danger}
                            >
                              <Ban className="h-4 w-4" />
                              <span className="sr-only">Sans suite</span>
                            </button>
                            {canConfirm && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => validate(r)}
                                className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                              >
                                <ClipboardCheck className="h-3.5 w-3.5" />
                                Créer la commande
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={viewing !== null} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demande de réservation</DialogTitle>
            <DialogDescription>Reçue le {viewing?.createdAt.slice(0, 10)}</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div>
              <DetailRow label="Nom" value={viewing.name} />
              <DetailRow label="Téléphone" value={viewing.phone} />
              <DetailRow
                label={viewing.equipments.length > 1 ? "Équipements" : "Équipement"}
                value={viewing.equipments.map((e) => e.label).join("\n")}
              />
              <DetailRow
                label="Période"
                value={
                  viewing.startDate ? `${viewing.startDate} → ${viewing.endDate}` : "Non précisée"
                }
              />
              <DetailRow label="Langue" value={viewing.lang} />
              <DetailRow
                label="Statut"
                value={
                  (STATUS.find((s) => s.value === viewing.status)?.label ?? viewing.status) +
                  (viewing.handledByName ? ` (par ${viewing.handledByName})` : "")
                }
              />
              <DetailRow label="Message" value={viewing.message || "—"} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
