// Implémentation serveur de l'authentification — importée dynamiquement
// depuis les handlers uniquement (jamais côté client).
import { createHash, randomBytes } from "node:crypto";
import {
  deleteCookie,
  getCookie,
  getRequestHeader,
  getRequestIP,
  setCookie,
} from "@tanstack/react-start/server";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { sessions, users, verifyPassword, hashPassword } from "@prestige/database";
import { getDb } from "../db";
import { clearRateLimit, rateLimit } from "../rate-limit";
import type { SessionUser } from "../auth";

const COOKIE_NAME = "prestige_session";
const SESSION_DAYS = 7;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Utilisateur de la session courante, ou null. */
export async function currentUser(): Promise<SessionUser | null> {
  const token = getCookie(COOKIE_NAME);
  if (!token) return null;
  const db = getDb();
  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      active: users.active,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, sql`now()`)));
  if (!row || !row.active) return null;
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}

/** Garde serveur : session requise + rôle suffisant. Jette une erreur sinon. */
export async function requireUser(
  minRole: "accountant" | "admin" | "superadmin" = "admin",
): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  const level = { accountant: 0, admin: 1, superadmin: 2 } as const;
  // accountant = lecture seule : toute fonction exigeant "admin" lui est refusée.
  if (level[user.role] < level[minRole]) throw new Error("FORBIDDEN");
  return user;
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<{ ok: boolean; error?: string }> {
  const email = data.email.toLowerCase().trim();
  const ip = getRequestIP() ?? "unknown";
  // 5 échecs par IP/compte → blocage 15 min.
  const limitKey = `login:${ip}:${email}`;
  if (!rateLimit(limitKey, 5, 15 * 60_000)) {
    return { ok: false, error: "Trop de tentatives. Réessayez dans 15 minutes." };
  }

  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  // Message générique : ne révèle pas si le courriel existe.
  if (!user || !user.active || !verifyPassword(data.password, user.passwordHash)) {
    return { ok: false, error: "Identifiants invalides." };
  }

  clearRateLimit(limitKey);
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000);
  await db.insert(sessions).values({
    tokenHash: hashToken(token),
    userId: user.id,
    expiresAt,
    ip,
    userAgent: getRequestHeader("user-agent")?.slice(0, 255) ?? null,
  });
  // Purge opportuniste des sessions expirées.
  await db.delete(sessions).where(lt(sessions.expiresAt, sql`now()`));
  await db
    .update(users)
    .set({ lastLoginAt: sql`now()` })
    .where(eq(users.id, user.id));

  setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 3600,
  });
  return { ok: true };
}

export async function logout(): Promise<void> {
  const token = getCookie(COOKIE_NAME);
  if (token) {
    await getDb()
      .delete(sessions)
      .where(eq(sessions.tokenHash, hashToken(token)));
  }
  deleteCookie(COOKIE_NAME, { path: "/" });
}

export async function changeMyPassword(data: {
  current: string;
  next: string;
}): Promise<{ ok: boolean; error?: string }> {
  const me = await requireUser("accountant");
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, me.id));
  if (!user || !verifyPassword(data.current, user.passwordHash)) {
    return { ok: false, error: "Mot de passe actuel invalide." };
  }
  await db
    .update(users)
    .set({ passwordHash: hashPassword(data.next) })
    .where(eq(users.id, me.id));
  return { ok: true };
}
