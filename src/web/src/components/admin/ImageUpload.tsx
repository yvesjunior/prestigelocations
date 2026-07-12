import { useRef, useState } from "react";
import { imageUrl } from "@/lib/images";
import { getImageKitSignatureFn } from "@/server/imagekit";

const UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";
const MAX_SIZE_MB = 15;

/**
 * Téléversement d'une photo vers ImageKit : signature demandée au serveur,
 * envoi direct navigateur → CDN, puis `onChange(filePath)`. La clé n'est
 * persistée en BD qu'à l'enregistrement du formulaire parent.
 */
export function ImageUpload({
  imageKey,
  folder,
  alt,
  onChange,
}: {
  imageKey: string | null;
  folder: "categories" | "equipements" | "branding";
  alt: string;
  onChange: (key: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = imageUrl(imageKey, { w: 320 });

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        throw new Error(`Fichier trop lourd (max. ${MAX_SIZE_MB} Mo).`);
      }
      const res = await getImageKitSignatureFn();
      if (!res.ok) throw new Error(res.error);
      const { signature } = res;
      const form = new FormData();
      form.append("file", file);
      form.append("fileName", file.name);
      form.append("publicKey", signature.publicKey);
      form.append("signature", signature.signature);
      form.append("expire", String(signature.expire));
      form.append("token", signature.token);
      form.append("folder", `${signature.folder}/${folder}`);
      form.append("useUniqueFileName", "true");
      const uploadRes = await fetch(UPLOAD_URL, { method: "POST", body: form });
      const json = (await uploadRes.json()) as { filePath?: string; message?: string };
      if (!uploadRes.ok || !json.filePath) {
        throw new Error(json.message ?? `Téléversement refusé (HTTP ${uploadRes.status}).`);
      }
      onChange(json.filePath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de téléversement.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-start gap-4">
        {preview ? (
          <img
            src={preview}
            alt={alt}
            width={160}
            height={120}
            className="aspect-[4/3] w-40 rounded-md border border-border/60 object-cover"
          />
        ) : (
          <div className="flex aspect-[4/3] w-40 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
            {imageKey ? "Aperçu indisponible" : "Aucune photo"}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
            }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="btn-gold-outline disabled:opacity-60"
          >
            {busy ? "Téléversement…" : imageKey ? "Remplacer la photo" : "Téléverser une photo"}
          </button>
          {imageKey && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onChange(null)}
              className="text-left text-xs text-destructive hover:underline"
            >
              Retirer la photo (photo par défaut du site)
            </button>
          )}
          <p className="text-xs text-muted-foreground">
            JPG/PNG/WebP, max. {MAX_SIZE_MB} Mo. Prend effet à l'enregistrement.
          </p>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
