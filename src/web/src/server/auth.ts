// Server functions d'authentification — wrappers client-safe (l'implémentation
// serveur est importée dynamiquement dans les handlers).
// Spécification : TASK.md > Phase 4 > « Authentification des employés ».
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "accountant";
};

export const getSessionFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionUser | null> => {
    try {
      const { currentUser } = await import("./impl/auth");
      return await currentUser();
    } catch {
      return null;
    }
  },
);

export const loginFn = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email(), password: z.string().min(1) }))
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> => {
    const { login } = await import("./impl/auth");
    return login(data);
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const { logout } = await import("./impl/auth");
  await logout();
  return { ok: true };
});

export const changeMyPasswordFn = createServerFn({ method: "POST" })
  .validator(z.object({ current: z.string().min(1), next: z.string().min(10) }))
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> => {
    const { changeMyPassword } = await import("./impl/auth");
    return changeMyPassword(data);
  });
