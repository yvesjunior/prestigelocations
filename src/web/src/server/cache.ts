// Cache mémoire minimal pour les lectures publiques (SSR sans toucher la BD
// à chaque requête). Invalidé par les écritures de l'admin.
const store = new Map<string, { value: unknown; expiresAt: number }>();

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value as T;
  const value = await load();
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export function invalidate(...keys: string[]) {
  for (const key of keys) store.delete(key);
}
