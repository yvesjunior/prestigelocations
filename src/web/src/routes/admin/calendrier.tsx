import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { enUS } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import { listEquipmentsFn, listOrdersFn, type AdminOrder } from "@/server/admin";

export const Route = createFileRoute("/admin/calendrier")({
  head: () => ({ meta: [{ title: "Calendrier | Administration" }] }),
  loader: async () => {
    const [orders, equipments] = await Promise.all([listOrdersFn(), listEquipmentsFn()]);
    return { orders, equipments };
  },
  component: CalendarPage,
});

function fromIso(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
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

function CalendarPage() {
  const { orders, equipments } = Route.useLoaderData();
  const [equipmentId, setEquipmentId] = useState<number>(equipments[0]?.id ?? 0);
  const [today] = useState(todayIso);

  const equipmentOrders = useMemo(
    () =>
      orders
        .filter((o) => o.equipmentId === equipmentId)
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [orders, equipmentId],
  );

  // Périodes réservées (commandes confirmées) → jours surlignés dans le calendrier.
  const booked = useMemo(
    () =>
      equipmentOrders
        .filter((o) => o.status === "confirmee")
        .map((o) => ({ from: fromIso(o.startDate), to: fromIso(o.endDate) })),
    [equipmentOrders],
  );

  const selectedEquipment = equipments.find((e) => e.id === equipmentId);

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-bold">Calendrier de disponibilité</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Périodes réservées d'un équipement (issues des commandes confirmées). Pour bloquer des
        dates, créez une commande dans <span className="text-primary">Commandes</span> ou validez
        une demande dans <span className="text-primary">Demandes</span>.
      </p>

      <div className="mt-5 max-w-sm">
        <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">
          Équipement
        </label>
        <select
          value={equipmentId}
          onChange={(e) => setEquipmentId(Number(e.target.value))}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          {equipments.map((e) => (
            <option key={e.id} value={e.id}>
              {e.code ? `${e.nameFr} (${e.code})` : e.nameFr}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <Calendar
            mode="single"
            selected={undefined}
            onSelect={() => {}}
            locale={enUS}
            buttonVariant="outline"
            numberOfMonths={1}
            modifiers={{ booked }}
            modifiersClassNames={{ booked: "bg-primary/30 text-primary rounded-md" }}
            classNames={{ root: "relative" }}
          />
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-3 w-3 rounded bg-primary/30" /> Période réservée
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-5">
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            Commandes — {selectedEquipment?.nameFr ?? ""}
          </p>
          {equipmentOrders.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Aucune commande pour cet équipement.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border/40">
              {equipmentOrders.map((o) => {
                const badge = statusBadge(o, today);
                return (
                  <li key={o.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span>
                      <span className="font-medium">
                        {o.startDate} → {o.endDate}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {o.customerName} · {o.customerPhone}
                      </span>
                    </span>
                    <span className={`shrink-0 rounded px-2 py-0.5 text-xs ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
