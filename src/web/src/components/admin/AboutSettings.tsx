import { ImageUpload } from "./ImageUpload";

/**
 * Éditeur de l'image « À propos » (section mission), affiché dans Pages › À
 * propos. Composant **contrôlé** : la clé d'image vit dans la page parente et
 * est enregistrée par son unique bouton « Enregistrer les modifications ».
 * Vide = image par défaut du site.
 */
export function AboutSettings({
  imageKey,
  onChange,
}: {
  imageKey: string | null;
  onChange: (key: string | null) => void;
}) {
  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-bold">Image de la page « À propos »</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        La grande photo à côté de la section « Notre mission ». Format paysage recommandé. Aucune
        photo = image par défaut du site.
        <span className="mt-1 block text-primary">
          N'oubliez pas « Enregistrer les modifications » en bas de page.
        </span>
      </p>
      <div className="mt-4">
        <ImageUpload
          imageKey={imageKey}
          folder="about"
          alt="Image de la page À propos"
          onChange={onChange}
        />
      </div>
    </div>
  );
}
