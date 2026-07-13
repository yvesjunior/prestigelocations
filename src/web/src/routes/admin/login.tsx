import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { getDevLoginHintFn, loginFn } from "@/server/auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Connexion | Administration Prestige Locations" }] }),
  loader: async () => ({ devHint: await getDevLoginHintFn() }),
  component: LoginPage,
});

const inputCls =
  "w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";

function LoginPage() {
  const { devHint } = Route.useLoaderData();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // presse-papier indisponible (http non sécurisé) — l'utilisateur copie à la main.
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await loginFn({ data: { email, password } });
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
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={busy} className="btn-gold w-full disabled:opacity-60">
            {busy ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        {/* Accès de démonstration — visible seulement si DEV_LOGIN_HINT=1 (jamais en prod). */}
        {devHint && (
          <div className="mt-6 rounded-lg border border-primary/40 bg-secondary/60 p-4 text-sm">
            <p className="font-semibold text-primary">Accès de démonstration</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Ce site est en version d'essai. Utilisez ces identifiants pour vous connecter et
              explorer l'administration. Ils n'apparaîtront pas sur le site en ligne final.
            </p>
            <div className="mt-3 space-y-2">
              {[
                { label: "Courriel", value: devHint.email },
                { label: "Mot de passe", value: devHint.password },
              ].map((c) => (
                <div key={c.label} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="block text-[10px] tracking-wide text-muted-foreground uppercase">
                      {c.label}
                    </span>
                    <code className="block truncate text-foreground">{c.value}</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(c.label, c.value)}
                    title={`Copier : ${c.label}`}
                    className="shrink-0 rounded-md border border-border p-1.5 text-foreground/70 transition-colors hover:border-primary/60 hover:text-primary"
                  >
                    {copied === c.label ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail(devHint.email);
                setPassword(devHint.password);
              }}
              className="btn-gold-outline mt-3 w-full text-xs"
            >
              Remplir le formulaire
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
