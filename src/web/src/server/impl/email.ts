// Envoi de courriels — importé dynamiquement côté serveur uniquement.
// Best-effort : la BD est la source de vérité (la demande est toujours
// enregistrée) ; le courriel n'est qu'une notification. SMTP non configuré
// (dev) → simple ligne de log, jamais d'erreur remontée.
import nodemailer from "nodemailer";
import { loadContact } from "./public";

function smtpConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT ?? 587);
  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    from: process.env.SMTP_FROM ?? user,
  };
}

/** Notifie l'administrateur de la plateforme (adresse = coordonnées en BD). */
export async function notifyAdmin(subject: string, text: string): Promise<void> {
  const cfg = smtpConfig();
  if (!cfg) {
    console.info(`Courriel non configuré (SMTP_*) — notification ignorée : ${subject}`);
    return;
  }
  try {
    const contact = await loadContact();
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: cfg.auth,
    });
    await transporter.sendMail({ from: cfg.from, to: contact.email, subject, text });
  } catch (err) {
    console.warn(`Courriel « ${subject} » non envoyé :`, err);
  }
}
