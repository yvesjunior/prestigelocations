import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound } from "lucide-react";
import { createUserFn, updateUserFn, type AdminUser } from "@/server/admin";
import { iconActionCls } from "@/components/admin/action-icons";

const ROLE_MATRIX = [
  { role: "admin", desc: "Tout : catalogue, pages, paramètres, comptes employés." },
  { role: "accountant", desc: "Lecture seule (rapports à venir)." },
];

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";
const labelCls = "mb-1 block text-xs font-semibold uppercase text-muted-foreground";
const ROLES = ["admin", "accountant"] as const;

function formatLastLogin(iso: string | null): string {
  if (!iso) return "Jamais";
  return new Date(iso).toLocaleDateString("fr-CA");
}

export function UserSettings({ users, meId }: { users: AdminUser[]; meId: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const ok = await run(() =>
      createUserFn({
        data: {
          name: String(data.get("name")),
          email: String(data.get("email")),
          role: data.get("role") as (typeof ROLES)[number],
          password: String(data.get("password")),
        },
      }),
    );
    if (ok) form.reset();
  }

  function resetPassword(id: number) {
    const password = prompt(
      "Nouveau mot de passe pour cet employé (min. 10 caractères) — à lui communiquer hors plateforme :",
    );
    if (!password) return;
    if (password.length < 10) {
      setError("Le mot de passe doit faire au moins 10 caractères.");
      return;
    }
    run(() => updateUserFn({ data: { id, password } }));
  }

  return (
    <div className="max-w-4xl">
      <div className="rounded-xl border border-border/60 bg-card p-4 text-sm">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Rôles et permissions
        </p>
        <ul className="mt-2 space-y-1">
          {ROLE_MATRIX.map((r) => (
            <li key={r.role}>
              <span className="rounded bg-secondary px-1.5 py-0.5 text-xs text-primary">
                {r.role}
              </span>{" "}
              <span className="text-muted-foreground">{r.desc}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          La plateforme conserve toujours au moins un admin actif ; les comptes se désactivent mais
          ne se suppriment jamais.
        </p>
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-card text-left text-xs tracking-wider text-primary uppercase">
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Courriel</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Actif</th>
              <th className="px-4 py-3">Dernière connexion</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-3 font-medium">
                  {u.name}
                  {u.id === meId && <span className="ml-1.5 text-xs text-primary">(vous)</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    disabled={busy}
                    onChange={(e) =>
                      run(() =>
                        updateUserFn({
                          data: { id: u.id, role: e.target.value as (typeof ROLES)[number] },
                        }),
                      )
                    }
                    className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    disabled={busy || u.id === meId}
                    title={
                      u.id === meId ? "Impossible de désactiver son propre compte." : undefined
                    }
                    onClick={() =>
                      run(() => updateUserFn({ data: { id: u.id, active: !u.active } }))
                    }
                    className={`rounded px-2 py-0.5 text-xs disabled:cursor-not-allowed disabled:opacity-60 ${
                      u.active ? "bg-secondary text-primary" : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {u.active ? "Actif" : "Désactivé"}
                  </button>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatLastLogin(u.lastLoginAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    disabled={busy}
                    title="Réinitialiser le mot de passe"
                    onClick={() => resetPassword(u.id)}
                    className={iconActionCls.neutral}
                  >
                    <KeyRound className="h-4 w-4" />
                    <span className="sr-only">Réinitialiser le mot de passe</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={onCreate} className="mt-8 rounded-xl border border-border/60 bg-card p-5">
        <p className="text-sm font-bold">Ajouter un employé</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelCls}>Nom</label>
            <input name="name" required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Courriel</label>
            <input name="email" type="email" required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Rôle</label>
            <select name="role" defaultValue="admin" className={inputCls}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Mot de passe (min. 10)</label>
            <input name="password" type="password" required minLength={10} className={inputCls} />
          </div>
        </div>
        <button type="submit" disabled={busy} className="btn-gold-outline mt-4 disabled:opacity-60">
          Créer le compte
        </button>
      </form>
    </div>
  );
}
