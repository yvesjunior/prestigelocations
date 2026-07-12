// Envoi de courriels via l'API HTTP de SendGrid — importé dynamiquement côté
// serveur uniquement. Best-effort : la BD est la source de vérité (la demande
// est toujours enregistrée) ; le courriel n'est qu'une notification. Clé API
// absente (dev) → simple ligne de log, jamais d'erreur remontée.
import { BASE_URL } from "@/lib/site";
import { loadContact } from "./public";

const SENDGRID_ENDPOINT = "https://api.sendgrid.com/v3/mail/send";
// Nom d'expéditeur affiché dans les boîtes de réception.
const FROM_NAME = "Prestige Locations";

function mailConfig() {
  const apiKey = process.env.SENDGRID_API_KEY;
  // L'adresse d'expédition doit être un « Single Sender » vérifié ou sur un
  // domaine authentifié chez SendGrid (SPF/DKIM), sinon le courriel part en spam.
  const from = process.env.SENDGRID_FROM;
  if (!apiKey || !from) return null;
  return { apiKey, from };
}

type MailInput = { to: string; subject: string; text: string; html?: string };

/** Envoi bas niveau, best-effort. SendGrid non configuré → log, jamais d'erreur. */
async function sendMail({ to, subject, text, html }: MailInput): Promise<void> {
  const cfg = mailConfig();
  if (!cfg) {
    console.info(`Courriel non configuré (SENDGRID_*) — envoi ignoré : ${subject}`);
    return;
  }
  try {
    // Ordre imposé par SendGrid : text/plain avant text/html.
    const content: { type: string; value: string }[] = [{ type: "text/plain", value: text }];
    if (html) content.push({ type: "text/html", value: html });
    const res = await fetch(SENDGRID_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${cfg.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: cfg.from, name: FROM_NAME },
        subject,
        content,
      }),
    });
    // SendGrid répond 202 Accepted en cas de succès.
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.warn(`Courriel « ${subject} » refusé par SendGrid (${res.status}) : ${detail}`);
    }
  } catch (err) {
    console.warn(`Courriel « ${subject} » non envoyé :`, err);
  }
}

/** Notifie l'administrateur de la plateforme (adresse = coordonnées en BD). */
async function notifyAdmin(input: { subject: string; text: string; html?: string }): Promise<void> {
  const contact = await loadContact();
  await sendMail({ to: contact.email, ...input });
}

/** Échappe le texte fourni par l'utilisateur avant insertion dans du HTML. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type NewRequestNotification = {
  name: string;
  phone: string;
  equipmentLabels: string[];
  startDate: string | null;
  endDate: string | null;
  message: string | null;
  lang: "fr" | "en";
};

/**
 * Courriel « nouvelle demande de réservation » → administrateur.
 * Libellés en français (langue du gérant) ; la langue du demandeur est
 * reportée comme un champ. Version HTML sobre + repli texte.
 */
export async function notifyNewRequest(r: NewRequestNotification): Promise<void> {
  const hasRange = Boolean(r.startDate && r.endDate);
  const period = hasRange ? `du ${r.startDate} au ${r.endDate}` : "période non précisée";
  const adminUrl = BASE_URL ? `${BASE_URL}/admin/demandes` : "/admin/demandes";
  const equipmentText = r.equipmentLabels.join(", ") || "Autre / plusieurs équipements";
  const subject = `Nouvelle demande de réservation — ${equipmentText}`;

  const text = [
    `Nom : ${r.name}`,
    `Téléphone : ${r.phone}`,
    `${r.equipmentLabels.length > 1 ? "Équipements" : "Équipement"} : ${equipmentText}`,
    `Période souhaitée : ${period}`,
    `Langue : ${r.lang}`,
    r.message ? `Message :\n${r.message}` : null,
    "",
    `À traiter dans l'administration : ${adminUrl}`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const rows: [string, string][] = [
    ["Nom", r.name],
    ["Téléphone", r.phone],
    [r.equipmentLabels.length > 1 ? "Équipements" : "Équipement", equipmentText],
    ["Période souhaitée", period],
    ["Langue", r.lang],
  ];
  if (r.message) rows.push(["Message", r.message]);

  const rowsHtml = rows
    .map(
      ([k, v]) =>
        `<tr>` +
        `<td style="padding:8px 12px;color:#6b7280;font-size:13px;vertical-align:top;white-space:nowrap">${k}</td>` +
        `<td style="padding:8px 12px;color:#111827;font-size:14px;white-space:pre-wrap">${escapeHtml(v)}</td>` +
        `</tr>`,
    )
    .join("");

  const html = `<div style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
    <tr><td style="background:#1f2937;padding:18px 24px">
      <div style="color:#c9a227;font-size:12px;letter-spacing:.08em;text-transform:uppercase">Prestige Locations</div>
      <div style="color:#ffffff;font-size:18px;font-weight:600;margin-top:2px">Nouvelle demande de réservation</div>
    </td></tr>
    <tr><td style="padding:16px 12px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%">${rowsHtml}</table>
    </td></tr>
    <tr><td style="padding:8px 24px 24px">
      <a href="${adminUrl}" style="display:inline-block;background:#c9a227;color:#1f2937;text-decoration:none;font-weight:600;font-size:14px;padding:10px 18px;border-radius:8px">Traiter dans l'administration</a>
    </td></tr>
  </table>
</div>`;

  await notifyAdmin({ subject, text, html });
}
