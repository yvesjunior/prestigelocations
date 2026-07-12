import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ThemeSettings } from "@/components/admin/ThemeSettings";
import { BrandingSettings } from "@/components/admin/BrandingSettings";
import { getBrandingForAdminFn, getThemeForAdminFn } from "@/server/admin";

export const Route = createFileRoute("/admin/parametres")({
  head: () => ({ meta: [{ title: "Paramètres | Administration" }] }),
  loader: async () => ({
    theme: await getThemeForAdminFn(),
    branding: await getBrandingForAdminFn(),
  }),
  component: SettingsPage,
});

const TABS = [
  { key: "apparence", label: "Apparence" },
  { key: "logo", label: "Logo" },
] as const;

function SettingsPage() {
  const { theme, branding } = Route.useLoaderData();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("apparence");

  return (
    <div>
      <h1 className="text-xl font-bold">Paramètres</h1>

      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              tab === t.key
                ? "border-primary bg-secondary text-primary"
                : "border-border text-foreground/80 hover:border-primary/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "apparence" && <ThemeSettings saved={theme} />}
        {tab === "logo" && <BrandingSettings saved={branding} />}
      </div>
    </div>
  );
}
