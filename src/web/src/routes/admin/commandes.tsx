import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  createCustomerFn,
  createOrderFn,
  listCustomersFn,
  listEquipmentsFn,
  listOrdersFn,
  updateOrderFn,
  type AdminOrder,
} from "@/server/admin";

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
  equipmentId: 0,
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
  const [form, setForm] = useState({ ...EMPTY_FORM, equipmentId: equipments[0]?.id ?? 0 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [today] = useState(todayIso);

  const set = <K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Périodes déjà réservées pour l'équipement sélectionné (aide à la saisie).
  const bookedPeriods = orders
    .filter(
      (o) => o.equipmentId === form.equipmentId && o.status === "confirmee" && o.endDate >= today,
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

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
      if (editingId !== null) {
        return updateOrderFn({
          data: {
            id: editingId,
            startDate: form.startDate,
            endDate: form.endDate,
            note: form.note.trim() || null,
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
          equipmentId: form.equipmentId,
          startDate: form.startDate,
          endDate: form.endDate,
          note: form.note.trim() || null,
        },
      });
    });
    if (ok) {
      setForm({ ...EMPTY_FORM, equipmentId: equipments[0]?.id ?? 0 });
      setEditingId(null);
    }
  }

  function startEdit(o: AdminOrder) {
    setEditingId(o.id);
    setForm({
      ...EMPTY_FORM,
      equipmentId: o.equipmentId,
      customerId: String(o.customerId),
      startDate: o.startDate,
      endDate: o.endDate,
      note: o.note ?? "",
    });
    setError(null);
  }

  function cancelOrder(o: AdminOrder) {
    if (
      !confirm(
        `Annuler la commande de ${o.customerName} (${o.equipmentName}) ? Les dates seront libérées.`,
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
        Une commande lie un client et un équipement pour une période : l'équipement est indisponible
        sur ces dates. Annuler une commande libère les dates (aucune suppression — l'historique
        reste).
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
                    {o.equipmentCode ? `${o.equipmentName} (${o.equipmentCode})` : o.equipmentName}
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
                    {o.status === "confirmee" ? (
                      <>
                        <button
                          disabled={busy}
                          onClick={() => startEdit(o)}
                          className="text-xs text-primary hover:underline"
                        >
                          Modifier
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => cancelOrder(o)}
                          className="ml-3 text-xs text-destructive hover:underline"
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <button
                        disabled={busy}
                        onClick={() => reactivateOrder(o)}
                        className="text-xs text-primary hover:underline"
                      >
                        Réactiver
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <form onSubmit={onSubmit} className="mt-8 rounded-xl border border-border/60 bg-card p-5">
        <p className="text-sm font-bold">
          {editing
            ? `Modifier la commande — ${editing.equipmentName} pour ${editing.customerName}`
            : "Nouvelle commande"}
        </p>

        {!editing && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Équipement</label>
              <select
                value={form.equipmentId}
                onChange={(e) => set("equipmentId", Number(e.target.value))}
                className={inputCls}
              >
                {equipments.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.code ? `${eq.nameFr} (${eq.code})` : eq.nameFr}
                  </option>
                ))}
              </select>
              {bookedPeriods.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Déjà réservé :{" "}
                  {bookedPeriods.map((b) => `du ${b.startDate} au ${b.endDate}`).join(" · ")}
                </p>
              )}
            </div>
            <div>
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
            {busy ? "Enregistrement…" : editing ? "Enregistrer les dates" : "Créer la commande"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ ...EMPTY_FORM, equipmentId: equipments[0]?.id ?? 0 });
              }}
              className="text-sm text-muted-foreground hover:underline"
            >
              Annuler la modification
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
