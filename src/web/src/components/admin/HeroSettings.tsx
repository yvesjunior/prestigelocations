import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { MAX_HERO_SLIDES } from "@/lib/hero";

/**
 * Éditeur du diaporama de l'accueil (haut de la page d'accueil), affiché dans
 * Pages › Accueil. Composant **contrôlé** : la liste des diapos vit dans la
 * page parente et est enregistrée par son unique bouton « Enregistrer les
 * modifications » (pas de bouton d'enregistrement séparé — évite le piège des
 * deux boutons). Chaque diapo est une image ImageKit ; liste vide = diaporama
 * par défaut du site.
 */
export function HeroSettings({
  slides,
  onChange,
}: {
  slides: string[];
  onChange: (slides: string[]) => void;
}) {
  function replaceAt(index: number, key: string | null) {
    // ImageUpload rend null quand on retire la photo → on supprime la diapo.
    onChange(
      key === null
        ? slides.filter((_, i) => i !== index)
        : slides.map((k, i) => (i === index ? key : k)),
    );
  }

  function addSlide(key: string | null) {
    if (key !== null) onChange([...slides, key]);
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-bold">Diaporama de l'accueil</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Les grandes photos qui défilent en haut de la page d'accueil. Ajoutez-en une ou plusieurs
        (elles défilent automatiquement) ; l'ordre ci-dessous est l'ordre d'affichage (flèches ↑↓).
        Format paysage recommandé. Aucune photo = diaporama par défaut du site.
        <span className="mt-1 block text-primary">
          N'oubliez pas « Enregistrer les modifications » en bas de page.
        </span>
      </p>

      <div className="mt-4 space-y-4">
        {slides.map((key, index) => (
          <div key={`${key}-${index}`} className="rounded-md border border-border/60 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Photo {index + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Monter"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="rounded p-1 text-foreground/70 hover:text-primary disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Descendre"
                  disabled={index === slides.length - 1}
                  onClick={() => move(index, 1)}
                  className="rounded p-1 text-foreground/70 hover:text-primary disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Retirer cette photo"
                  onClick={() => replaceAt(index, null)}
                  className="rounded p-1 text-destructive hover:opacity-80"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <ImageUpload
              imageKey={key}
              folder="hero"
              alt={`Diapo ${index + 1} de l'accueil`}
              onChange={(k) => replaceAt(index, k)}
            />
          </div>
        ))}
      </div>

      {slides.length < MAX_HERO_SLIDES ? (
        <div className="mt-4 rounded-md border border-dashed border-border p-3">
          <span className="mb-2 block text-xs font-semibold text-muted-foreground">
            Ajouter une photo
          </span>
          {/* imageKey=null → le bouton « Téléverser » ajoute une diapo à la liste. */}
          <ImageUpload imageKey={null} folder="hero" alt="Nouvelle diapo" onChange={addSlide} />
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">
          Maximum de {MAX_HERO_SLIDES} photos atteint.
        </p>
      )}
    </div>
  );
}
