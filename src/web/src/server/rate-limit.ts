// Limitation de débit en mémoire (suffisant pour un seul conteneur).
const buckets = new Map<string, { count: number; resetAt: number }>();

/** Retourne true si l'appel est autorisé, false si la limite est atteinte. */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= max;
}

export function clearRateLimit(key: string) {
  buckets.delete(key);
}
