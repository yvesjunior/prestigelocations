// Implémentation serveur ImageKit — importée dynamiquement depuis les handlers
// uniquement. Deux responsabilités : signer les téléversements du navigateur
// (HMAC-SHA1, clé privée jamais exposée) et supprimer les fichiers remplacés.
import { createHmac, randomUUID } from "node:crypto";
import { requireUser } from "./auth";
import type { UploadSignature } from "../imagekit";

const UPLOAD_EXPIRE_SECONDS = 10 * 60;

function config() {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const folder = process.env.IMAGEKIT_FOLDER ?? "prestigelocations";
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, folder };
}

export async function getUploadSignature(): Promise<
  { ok: true; signature: UploadSignature } | { ok: false; error: string }
> {
  await requireUser("admin");
  const cfg = config();
  if (!cfg) {
    return {
      ok: false,
      error: "ImageKit non configuré (IMAGEKIT_PUBLIC_KEY / IMAGEKIT_PRIVATE_KEY manquants).",
    };
  }
  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + UPLOAD_EXPIRE_SECONDS;
  const signature = createHmac("sha1", cfg.privateKey)
    .update(token + String(expire))
    .digest("hex");
  return {
    ok: true,
    signature: { publicKey: cfg.publicKey, token, expire, signature, folder: cfg.folder },
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// L'index de recherche ImageKit accuse quelques secondes de retard sur les
// téléversements : un fichier remplacé aussitôt après son upload n'est pas
// encore trouvable. On réessaie donc à intervalles espacés.
const DELETE_RETRY_DELAYS_MS = [0, 5_000, 20_000];

/**
 * Supprime un fichier ImageKit par sa clé (`image_key` = filePath). Best-effort
 * et non bloquant : à appeler SANS await (`void deleteImageKitFile(...)`) — les
 * échecs sont journalisés, jamais remontés ; la BD reste la source de vérité.
 */
export async function deleteImageKitFile(key: string): Promise<void> {
  const cfg = config();
  if (!cfg) return;
  const auth = `Basic ${Buffer.from(`${cfg.privateKey}:`).toString("base64")}`;
  const fileName = key.split("/").pop() ?? key;
  const filePath = key.startsWith("/") ? key : `/${key}`;
  let lastError: unknown = "fichier introuvable dans l'index de recherche";
  for (const delay of DELETE_RETRY_DELAYS_MS) {
    if (delay > 0) await sleep(delay);
    try {
      const search = await fetch(
        `https://api.imagekit.io/v1/files?searchQuery=${encodeURIComponent(`name = "${fileName}"`)}`,
        { headers: { Authorization: auth } },
      );
      if (!search.ok) throw new Error(`search HTTP ${search.status}`);
      const files = (await search.json()) as { fileId: string; filePath: string }[];
      const match = files.find((f) => f.filePath === filePath);
      if (!match) continue; // index en retard → nouvelle tentative
      const del = await fetch(`https://api.imagekit.io/v1/files/${match.fileId}`, {
        method: "DELETE",
        headers: { Authorization: auth },
      });
      if (del.ok || del.status === 404) return;
      throw new Error(`delete HTTP ${del.status}`);
    } catch (err) {
      lastError = err;
    }
  }
  console.warn(`ImageKit : suppression de « ${key} » échouée :`, lastError);
}
