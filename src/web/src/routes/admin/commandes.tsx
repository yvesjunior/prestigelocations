import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Ban, Eye, Pencil, RotateCcw } from "lucide-react";
import {
  createCustomerFn,
  createOrderFn,
  listCustomersFn,
  listEquipmentsFn,
  listOrdersFn,
  updateOrderFn,
  type AdminOrder,
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

export const Route = createFileRoute("/admin/commandes")({
  head: () => ({ meta: [{ title: "Commandes | Administration" }] }),
  loader: async () => {
    const [ordersList, customersList, equipmentsList] = await Promise.all([
      listOrdersFn(),
      listCustomersFn(),
      listEquipmentsFn(),
    ]);
    return { orders: ordersList, customers: customersList, equipments: equipmentsList };
  },
  component: OrdersPage,
});

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";
const labelCls = "mb-1 block text-xs font-semibold uppercase text-muted-foreground";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function statusBadge(o: AdminOrder, today: string): { label: string; cls: string } {
  if (o.status === "annulee")
    return { label: "Annulée", cls: "bg-destructive/20 text-destructive" };
  if (o.endDate < today) return { label: "Terminée", cls: "bg-secondary text-muted-foreground" };
  if (o.startDate > today) return { label: "À venir", cls: "bg-secondary text-primary" };
  return { label: "En cours", cls: "bg-primary/25 text-primary" };
}

const EMPTY_FORM = {
  equipmentIds: [] as number[],
  customerId: "" as string, // id numérique, ou "new" pour un nouveau client
  newName: "",
  newPhone: "",
  newEmail: "",
  startDate: "",
  endDate: "",
  note: "",
};

function OrdersPage() {
  const { orders, customers, equipments } = Route.useLoaderData();
  const router = useRouter();
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [today] = useState(todayIso);
  const [viewing, setViewing] = useState<AdminOrder | null>(null);

  const set = <K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Périodes déjà réservées des équipements sélectionnés (aide à la saisie).
  const bookedByEquipment = equipments
    .filter((e) => form.equipmentIds.includes(e.id))
    .map((e) => ({
      label: e.code ? `${e.nameFr} (${e.code})` : e.nameFr,
      periods: orders
        .filter(
          (o) =>
            o.status === "confirmee" &&
            o.endDate >= today &&
            o.id !== editingId &&
            o.equipments.some((x) => x.id === e.id),
        )
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    }))
    .filter((x) => x.periods.length > 0);

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await run(async () => {
      if (form.equipmentIds.length === 0) {
        return { ok: false as const, error: "Sélectionnez au moins un équipement." };
      }
      if (editingId !== null) {
        return updateOrderFn({
          data: {
            id: editingId,
            startDate: form.startDate,
            endDate: form.endDate,
            note: form.note.trim() || null,
            equipmentIds: form.equipmentIds,
          },
        });
      }
      let customerId = Number(form.customerId);
      if (form.customerId === "new") {
        const created = await createCustomerFn({
          data: {
            name: form.newName,
            phone: form.newPhone,
            email: form.newEmail.trim() || null,
            note: null,
          },
        });
        if (!created.ok || !created.id) {
          return { ok: false as const, error: created.error ?? "Création du client échouée." };
        }
        customerId = created.id;
      }
      return createOrderFn({
        data: {
          customerId,
          equipmentIds: form.equipmentIds,
          startDate: form.startDate,
          endDate: form.endDate,
          note: form.note.trim() || null,
        },
      });
    });
    if (ok) {
      setForm({ ...EMPTY_FORM });
      setEditingId(null);
    }
  }

  function startEdit(o: AdminOrder) {
    setEditingId(o.id);
    setForm({
      ...EMPTY_FORM,
      equipmentIds: o.equipments.map((e) => e.id),
      customerId: String(o.customerId),
      startDate: o.startDate,
      endDate: o.endDate,
      note: o.note ?? "",
    });
    setError(null);
    setViewing(null);
    document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelOrder(o: AdminOrder) {
    if (
      !confirm(
        `Annuler la commande de ${o.customerName} (${o.equipments.map((e) => e.name).join(", ")}) ? Les dates seront libérées.`,
      )
    )
      return;
    run(() => updateOrderFn({ data: { id: o.id, status: "annulee" } }));
  }

  function reactivateOrder(o: AdminOrder) {
    run(() => updateOrderFn({ data: { id: o.id, status: "confirmee" } }));
  }

  const editing = editingId !== null ? orders.find((o) => o.id === editingId) : null;

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-bold">Commandes</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Une commande lie un client et un ou plusieurs équipements pour une période : ces équipements
        sont indisponibles sur ces dates. Annuler une commande libère les dates (aucune suppression
        — l'historique reste).
      </p>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-card text-left text-xs tracking-wider text-primary uppercase">
              <th className="px-4 py-3">Équipement</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Du</th>
              <th className="px-4 py-3">Au</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  Aucune commande pour l'instant.
                </td>
              </tr>
            )}
            {orders.map((o) => {
              const badge = statusBadge(o, today);
              return (
                <tr key={o.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {o.equipments
                      .map((e) => (e.code ? `${e.name} (${e.code})` : e.name))
                      .join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    {o.customerName}
                    <span className="block text-xs text-muted-foreground">{o.customerPhone}</span>
                  </td>
                  <td className="px-4 py-3">{o.startDate}</td>
                  <td className="px-4 py-3">{o.endDate}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-muted-foreground">
                    {o.note ?? ""}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        title="Voir la commande"
                        disabled={busy}
                        onClick={() => setViewing(o)}
                        className={iconActionCls.view}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Voir</span>
                      </button>
                      {o.status === "confirmee" ? (
                        <>
                          <button
                            type="button"
                            title="Modifier la commande"
                            disabled={busy}
                            onClick={() => startEdit(o)}
                            className={iconActionCls.edit}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </button>
                          <button
                            type="button"
                            title="Annuler la commande"
                            disabled={busy}
                            onClick={() => cancelOrder(o)}
                            className={iconActionCls.danger}
                          >
                            <Ban className="h-4 w-4" />
                            <span className="sr-only">Annuler</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          title="Réactiver la commande"
                          disabled={busy}
                          onClick={() => reactivateOrder(o)}
                          className={iconActionCls.positive}
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span className="sr-only">Réactiver</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <form
        id="order-form"
        onSubmit={onSubmit}
        className="mt-8 rounded-xl border border-border/60 bg-card p-5"
      >
        <p className="text-sm font-bold">
          {editing
            ? `Modifier la commande — ${editing.equipments.map((e) => e.name).join(", ")} pour ${editing.customerName}`
            : "Nouvelle commande"}
        </p>

        <div className="mt-4">
          <label className={labelCls}>Équipements ({form.equipmentIds.length})</label>
          <MultiSelect
            options={equipments.map((eq) => ({
              value: String(eq.id),
              label: eq.code ? `${eq.nameFr} (${eq.code})` : eq.nameFr,
            }))}
            selected={form.equipmentIds.map(String)}
            onChange={(vals) => set("equipmentIds", vals.map(Number))}
            placeholder="Choisir un ou plusieurs équipements…"
            searchPlaceholder="Rechercher un équipement…"
            emptyText="Aucun équipement trouvé."
          />
          {bookedByEquipment.length > 0 && (
            <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
              {bookedByEquipment.map((b) => (
                <p key={b.label}>
                  <span className="text-foreground/70">{b.label}</span> — déjà réservé{" "}
                  {b.periods.map((p) => `du ${p.startDate} au ${p.endDate}`).join(" · ")}
                </p>
              ))}
            </div>
          )}
        </div>

        {!editing && (
          <div className="mt-4">
            <label className={labelCls}>Client</label>
            <select
              required
              value={form.customerId}
              onChange={(e) => set("customerId", e.target.value)}
              className={inputCls}
            >
              <option value="" disabled>
                Choisir un client…
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.phone}
                </option>
              ))}
              <option value="new">+ Nouveau client</option>
            </select>
          </div>
        )}

        {!editing && form.customerId === "new" && (
          <div className="mt-4 grid gap-4 rounded-md border border-border/60 p-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Nom du client</label>
              <input
                required
                value={form.newName}
                onChange={(e) => set("newName", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Téléphone</label>
              <input
                required
                minLength={7}
                value={form.newPhone}
                onChange={(e) => set("newPhone", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Courriel (optionnel)</label>
              <input
                type="email"
                value={form.newEmail}
                onChange={(e) => set("newEmail", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Du</label>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Au (inclus)</label>
            <input
              type="date"
              required
              min={form.startDate || undefined}
              value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Note (optionnel)</label>
            <input
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              placeholder="Chantier, livraison…"
              className={inputCls}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button type="submit" disabled={busy} className="btn-gold-outline disabled:opacity-60">
            {busy ? "Enregistrement…" : editing ? "Enregistrer" : "Créer la commande"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ ...EMPTY_FORM });
              }}
              className="text-sm text-muted-foreground hover:underline"
            >
              Annuler la modification
            </button>
          )}
        </div>
      </form>

      <Dialog open={viewing !== null} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commande</DialogTitle>
            <DialogDescription>{viewing && statusBadge(viewing, today).label}</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div>
              <DetailRow
                label={viewing.equipments.length > 1 ? "Équipements" : "Équipement"}
                value={viewing.equipments
                  .map((e) => (e.code ? `${e.name} (${e.code})` : e.name))
                  .join("\n")}
              />
              <DetailRow label="Client" value={viewing.customerName} />
              <DetailRow label="Téléphone" value={viewing.customerPhone} />
              <DetailRow label="Courriel" value={viewing.customerEmail || "—"} />
              <DetailRow label="Note client" value={viewing.customerNote || "—"} />
              <DetailRow label="Période" value={`${viewing.startDate} → ${viewing.endDate}`} />
              <DetailRow label="Statut" value={statusBadge(viewing, today).label} />
              <DetailRow label="Note commande" value={viewing.note || "—"} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
