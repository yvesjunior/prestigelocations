import { useMemo } from "react";
import { enUS } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import type { AdminOrder } from "@/server/admin";

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

/**
 * Calendrier de disponibilité d'un équipement : périodes réservées (commandes
 * confirmées) surlignées + liste des commandes. En lecture seule — pour bloquer
 * des dates, créer une commande (Commandes) ou valider une demande (Demandes).
 */
export function EquipmentAvailability({
  orders,
  equipmentId,
}: {
  orders: AdminOrder[];
  equipmentId: number;
}) {
  const today = todayIso();

  const equipmentOrders = useMemo(
    () =>
      orders
        .filter((o) => o.equipments.some((e) => e.id === equipmentId))
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [orders, equipmentId],
  );

  const booked = useMemo(
    () =>
      equipmentOrders
        .filter((o) => o.status === "confirmee")
        .map((o) => ({ from: fromIso(o.startDate), to: fromIso(o.endDate) })),
    [equipmentOrders],
  );

  // Ouvre le calendrier sur la première période réservée encore à venir (sinon
  // le mois courant) : les jours « réservés » sont ainsi visibles d'emblée,
  // même quand la réservation est dans un mois futur.
  const defaultMonth = useMemo(() => {
    const todayDate = fromIso(today);
    const upcoming = booked.find((b) => b.to >= todayDate);
    return upcoming?.from ?? todayDate;
  }, [booked, today]);

  const hasBooked = booked.length > 0;

  return (
    <div>
      <h2 className="text-lg font-bold">Disponibilité</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Périodes réservées (commandes confirmées). Pour bloquer des dates, créez une commande dans{" "}
        <span className="text-primary">Commandes</span> ou validez une demande dans{" "}
        <span className="text-primary">Demandes</span>.
      </p>

      <div className="mt-4 grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <Calendar
            mode="single"
            selected={undefined}
            onSelect={() => {}}
            locale={enUS}
            defaultMonth={defaultMonth}
            buttonVariant="outline"
            numberOfMonths={1}
            modifiers={{ booked }}
            modifiersClassNames={{
              booked: "!bg-primary !text-primary-foreground rounded-md font-semibold",
            }}
            classNames={{ root: "relative" }}
          />
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-3 w-3 rounded bg-primary" />
            {hasBooked ? "Période réservée" : "Aucune période réservée"}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-5">
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">Commandes</p>
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
