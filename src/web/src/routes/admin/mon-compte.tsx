import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { changeMyPasswordFn } from "@/server/auth";

export const Route = createFileRoute("/admin/mon-compte")({
  head: () => ({ meta: [{ title: "Mon compte | Administration" }] }),
  component: MyAccountPage,
});

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";
const labelCls = "mb-1 block text-xs font-semibold uppercase text-muted-foreground";

function MyAccountPage() {
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const next = String(data.get("next"));
    if (next !== String(data.get("confirm"))) {
      setMessage({ ok: false, text: "La confirmation ne correspond pas." });
      return;
    }
    setBusy(true);
    const res = await changeMyPasswordFn({
      data: { current: String(data.get("current")), next },
    });
    setBusy(false);
    if (res.ok) {
      setMessage({ ok: true, text: "Mot de passe mis à jour." });
      form.reset();
    } else {
      setMessage({ ok: false, text: res.error ?? "Erreur." });
    }
  }

  return (
    <div className="max-w-sm">
      <h1 className="text-xl font-bold">Mon compte</h1>
      <form
        onSubmit={onSubmit}
        className="mt-6 space-y-4 rounded-xl border border-border/60 bg-card p-5"
      >
        <div>
          <label className={labelCls}>Mot de passe actuel</label>
          <input name="current" type="password" required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Nouveau mot de passe (min. 10 caractères)</label>
          <input name="next" type="password" required minLength={10} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Confirmer le nouveau mot de passe</label>
          <input name="confirm" type="password" required minLength={10} className={inputCls} />
        </div>
        {message && (
          <p className={`text-sm ${message.ok ? "text-primary" : "text-destructive"}`}>
            {message.text}
          </p>
        )}
        <button type="submit" disabled={busy} className="btn-gold w-full disabled:opacity-60">
          {busy ? "…" : "Changer le mot de passe"}
        </button>
      </form>
    </div>
  );
}
