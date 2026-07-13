import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Inbox, Layers, Users } from "lucide-react";
import { getAdminStatsFn } from "@/server/admin";
import { useIsAdvanced } from "@/lib/useMode";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Tableau de bord | Administration" }] }),
  loader: async () => ({ stats: await getAdminStatsFn() }),
  component: DashboardPage,
});

function DashboardPage() {
  const { stats } = Route.useLoaderData();
  const advanced = useIsAdvanced();

  const cards = [
    // Compteurs demandes/commandes : seulement en mode « advanced ».
    ...(advanced
      ? [
          {
            to: "/admin/demandes",
            icon: Inbox,
            label: "Demandes nouvelles",
            value: stats.newRequests,
          },
          {
            to: "/admin/commandes",
            icon: ClipboardList,
            label: "Locations en cours",
            value: stats.activeOrders,
          },
        ]
      : []),
    {
      to: "/admin/equipements",
      icon: Layers,
      label: "Équipements publiés",
      value: stats.equipments,
    },
    { to: "/admin/employes", icon: Users, label: "Employés actifs", value: stats.users },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold">Tableau de bord</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/60"
          >
            <c.icon className="h-5 w-5 text-primary" />
            <p className="mt-3 text-3xl font-bold">{c.value}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </Link>
        ))}
      </div>
      {advanced && (
        <p className="mt-8 text-sm text-muted-foreground">
          La disponibilité (calendrier des périodes réservées) s'affiche sur la fiche de chaque
          équipement.
        </p>
      )}
    </div>
  );
}
