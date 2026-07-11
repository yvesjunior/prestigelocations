import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import type { ContactInfo } from "@/lib/contact";
import { updateContactFn } from "@/server/admin";

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";
const labelCls = "mb-1 block text-xs font-semibold uppercase text-muted-foreground";

/** Téléphone et courriel de l'entreprise — affichés partout sur le site
 * (héro, pied de page, liens d'appel/courriel), pas seulement la page Contact. */
export function ContactSettings({ contact }: { contact: ContactInfo }) {
  const router = useRouter();
  const [phone, setPhone] = useState(contact.phone);
  const [email, setEmail] = useState(contact.email);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await updateContactFn({ data: { phone: phone.trim(), email: email.trim() } });
      setMessage({ ok: true, text: "Coordonnées enregistrées — le site public est à jour." });
      router.invalidate();
    } catch (err) {
      setMessage({
        ok: false,
        text: err instanceof Error ? err.message : "Erreur à l'enregistrement.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="rounded-xl border border-primary/40 bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Coordonnées de l'entreprise
        </p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Affichées sur <strong>tout le site</strong> : héro, pied de page, page contact et liens
        d'appel/courriel. Le formulaire de réservation envoie vers ce courriel.
      </p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <label className={labelCls}>Téléphone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            minLength={7}
            placeholder="819-000-0000"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Courriel</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className={inputCls}
          />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button type="submit" disabled={busy} className="btn-gold-outline disabled:opacity-60">
          {busy ? "Enregistrement…" : "Enregistrer les coordonnées"}
        </button>
        {message && (
          <span className={`text-sm ${message.ok ? "text-primary" : "text-destructive"}`}>
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
}
