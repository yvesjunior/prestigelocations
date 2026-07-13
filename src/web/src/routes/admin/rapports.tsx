import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { exportRequestsCsvFn, getReportFn, type Report, type ReportPeriod } from "@/server/admin";
import { getSiteModeFn } from "@/server/public";

export const Route = createFileRoute("/admin/rapports")({
  head: () => ({ meta: [{ title: "Rapports | Administration" }] }),
  // Page avancée : inaccessible en mode « basic » (URL directe → tableau de bord).
  beforeLoad: async () => {
    if ((await getSiteModeFn()) !== "advanced") throw redirect({ to: "/admin" });
  },
  validateSearch: (search: Record<string, unknown>): { periode?: ReportPeriod } => {
    const p = search.periode;
    return { periode: p === "30d" || p === "90d" || p === "12m" || p === "all" ? p : undefined };
  },
  loaderDeps: ({ search }) => ({ periode: search.periode ?? "90d" }),
  loader: async ({ deps }) => ({ report: await getReportFn({ data: { period: deps.periode } }) }),
  component: ReportsPage,
});

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "30d", label: "30 derniers jours" },
  { value: "90d", label: "90 derniers jours" },
  { value: "12m", label: "12 derniers mois" },
  { value: "all", label: "Depuis le début" },
];

const STATUS_LABEL: Record<string, string> = {
  nouvelle: "Nouvelles",
  en_cours: "En cours",
  traitee: "Traitées",
  sans_suite: "Sans suite",
};

function Bar({ count, max }: { count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="h-2 w-full rounded-full bg-secondary">
      <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: { key: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <p className="text-xs font-semibold tracking-wider text-primary uppercase">{title}</p>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Aucune donnée sur la période.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((r) => (
            <li
              key={r.key}
              className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-sm"
            >
              <span className="truncate" title={r.key}>
                {r.key}
              </span>
              <span className="font-semibold tabular-nums">{r.count}</span>
              <div className="col-span-2">
                <Bar count={r.count} max={max} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ReportsPage() {
  const { report } = Route.useLoaderData();
  const { periode } = Route.useSearch();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const current: ReportPeriod = periode ?? "90d";

  function setPeriod(value: ReportPeriod) {
    navigate({ search: { periode: value } });
    router.invalidate();
  }

  async function downloadCsv() {
    setDownloading(true);
    try {
      const { filename, csv } = await exportRequestsCsvFn({ data: { period: current } });
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  const r: Report = report;

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Rapports</h1>
        <button
          onClick={downloadCsv}
          disabled={downloading}
          className="btn-gold-outline disabled:opacity-60"
        >
          {downloading ? "…" : "Télécharger le CSV"}
        </button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Analyse des demandes de réservation reçues par le formulaire public.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              current === p.value
                ? "border-primary bg-secondary text-primary"
                : "border-border text-foreground/80 hover:border-primary/60"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <p className="text-3xl font-bold">{r.total}</p>
          <p className="text-sm text-muted-foreground">Demandes reçues</p>
        </div>
        {r.byStatus.map((s) => (
          <div key={s.status} className="rounded-xl border border-border/60 bg-card p-5">
            <p className="text-3xl font-bold">{s.count}</p>
            <p className="text-sm text-muted-foreground">{STATUS_LABEL[s.status]}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Breakdown
          title="Par équipement"
          rows={r.byEquipment.map((e) => ({ key: e.label, count: e.count }))}
        />
        <Breakdown
          title="Par catégorie"
          rows={r.byCategory.map((c) => ({ key: c.name, count: c.count }))}
        />
      </div>

      <div className="mt-4">
        <Breakdown
          title="Par mois"
          rows={r.byMonth.map((m) => ({ key: m.month, count: m.count }))}
        />
      </div>
    </div>
  );
}
