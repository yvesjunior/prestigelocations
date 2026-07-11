// Server function ImageKit — wrapper client-safe (l'implémentation serveur est
// importée dynamiquement dans le handler). La clé privée ne quitte jamais le serveur :
// le navigateur reçoit une signature à durée limitée et téléverse directement chez ImageKit.
import { createServerFn } from "@tanstack/react-start";

export type UploadSignature = {
  publicKey: string;
  token: string;
  expire: number;
  signature: string;
  folder: string;
};

export const getImageKitSignatureFn = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ ok: true; signature: UploadSignature } | { ok: false; error: string }> =>
    (await import("./impl/imagekit")).getUploadSignature(),
);
