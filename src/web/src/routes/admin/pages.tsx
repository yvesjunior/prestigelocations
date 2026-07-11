import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ContactSettings } from "@/components/admin/ContactSettings";
import { PAGE_SECTIONS, getPath, type ContentOverrides } from "@/lib/content";
import { translations } from "@/lib/i18n";
import {
  getContactForAdminFn,
  getPageContentForAdminFn,
  updatePageContentFn,
} from "@/server/admin";

export const Route = createFileRoute("/admin/pages")({
  head: () => ({ meta: [{ title: "Pages | Administration" }] }),
  loader: async () => {
    const [overrides, contact] = await Promise.all([
      getPageContentForAdminFn(),
      getContactForAdminFn(),
    ]);
    return { overrides, contact };
  },
  component: PagesAdmin,
});

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";

function defaultValue(path: string, lang: "fr" | "en"): string {
  return String(getPath(translations[lang], path) ?? "");
}

function PagesAdmin() {
  const { overrides: saved, contact } = Route.useLoaderData();
  const router = useRouter();
  const [tab, setTab] = useState(PAGE_SECTIONS[0].key);
  const [overrides, setOverrides] = useState<ContentOverrides>(saved);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const section = PAGE_SECTIONS.find((s) => s.key === tab) ?? PAGE_SECTIONS[0];

  function valueOf(path: string, lang: "fr" | "en"): string {
    return overrides[path]?.[lang] ?? defaultValue(path, lang);
  }

  function setValue(path: string, lang: "fr" | "en", value: string) {
    setOverrides((prev) => ({
      ...prev,
      [path]: {
        fr: lang === "fr" ? value : (prev[path]?.fr ?? defaultValue(path, "fr")),
        en: lang === "en" ? value : (prev[path]?.en ?? defaultValue(path, "en")),
      },
    }));
  }

  function resetField(path: string) {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[path];
      return next;
    });
  }

  function isModified(path: string): boolean {
    const o = overrides[path];
    if (!o) return false;
    return o.fr !== defaultValue(path, "fr") || o.en !== defaultValue(path, "en");
  }

  async function save() {
    setBusy(true);
    setMessage(null);
    // On n'enregistre que ce qui diffère vraiment des textes d'origine.
    const cleaned: ContentOverrides = {};
    for (const [path, v] of Object.entries(overrides)) {
      if (!v.fr.trim() || !v.en.trim()) continue;
      if (v.fr !== defaultValue(path, "fr") || v.en !== defaultValue(path, "en")) {
        cleaned[path] = { fr: v.fr, en: v.en };
      }
    }
    try {
      await updatePageContentFn({ data: cleaned });
      setOverrides(cleaned);
      setMessage("Modifications enregistrées — le site public est à jour.");
      router.invalidate();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erreur à l'enregistrement.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold">Pages du site</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Modifiez les textes de chaque page dans les deux langues. « Texte d'origine » ramène un
        champ à sa version initiale. Les équipements et catégories s'éditent dans leurs pages
        dédiées.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {PAGE_SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setTab(s.key)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              tab === s.key
                ? "border-primary bg-secondary text-primary"
                : "border-border text-foreground/80 hover:border-primary/60"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-5">
        {tab === "contact" && <ContactSettings contact={contact} />}
        {section.fields.map((f) => (
          <div key={f.path} className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {f.label}
                {isModified(f.path) && <span className="ml-2 text-primary">— modifié</span>}
              </p>
              {overrides[f.path] && (
                <button
                  onClick={() => resetField(f.path)}
                  className="text-xs text-primary hover:underline"
                >
                  Texte d'origine
                </button>
              )}
            </div>
            <div className="mt-2 grid gap-3 md:grid-cols-2">
              {(["fr", "en"] as const).map((lang) => (
                <div key={lang}>
                  <p className="mb-1 text-[10px] font-bold text-muted-foreground uppercase">
                    {lang === "fr" ? "Français" : "English"}
                  </p>
                  {f.textarea ? (
                    <textarea
                      rows={3}
                      value={valueOf(f.path, lang)}
                      onChange={(e) => setValue(f.path, lang, e.target.value)}
                      className={inputCls}
                    />
                  ) : (
                    <input
                      value={valueOf(f.path, lang)}
                      onChange={(e) => setValue(f.path, lang, e.target.value)}
                      className={inputCls}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-4 mt-6 flex items-center gap-3">
        <button onClick={save} disabled={busy} className="btn-gold disabled:opacity-60">
          {busy ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
        {message && <span className="text-sm text-primary">{message}</span>}
      </div>
    </div>
  );
}
