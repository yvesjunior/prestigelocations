import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { loginFn } from "@/server/auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Connexion | Administration Prestige Locations" }] }),
  component: LoginPage,
});

const inputCls =
  "w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";

function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await loginFn({
        data: {
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
        },
      });
      if (res.ok) {
        navigate({ to: "/admin" });
      } else {
        setError(res.error ?? "Identifiants invalides.");
      }
    } catch {
      setError("Erreur de connexion. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border/60 bg-card p-8">
        <p className="text-center font-serif text-2xl font-bold tracking-wide text-primary">
          PRESTIGE
        </p>
        <p className="mt-1 text-center text-xs tracking-[0.3em] text-muted-foreground uppercase">
          Administration
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase">
              Courriel
            </label>
            <input id="email" name="email" type="email" required autoFocus className={inputCls} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase">
              Mot de passe
            </label>
            <input id="password" name="password" type="password" required className={inputCls} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={busy} className="btn-gold w-full disabled:opacity-60">
            {busy ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
