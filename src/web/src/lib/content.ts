// Contenu éditable des pages — l'admin (« Pages ») enregistre des surcharges
// bilingues en BD (settings, clé "page_content") ; useT() les fusionne aux
// dictionnaires i18n à l'affichage. Un champ non surchargé garde son texte
// d'origine ; vider un champ = retour au texte d'origine.
import { z } from "zod";

export type ContentOverrides = Record<string, { fr: string; en: string }>;

export interface ContentField {
  /** Chemin pointé dans le dictionnaire i18n (liste blanche ci-dessous). */
  path: string;
  label: string;
  textarea?: boolean;
}

export interface PageSection {
  key: string;
  label: string;
  fields: ContentField[];
}

export const PAGE_SECTIONS: PageSection[] = [
  {
    key: "accueil",
    label: "Accueil",
    fields: [
      { path: "hero.titleLine1", label: "Héro — titre (ligne 1)" },
      { path: "hero.titleLine2", label: "Héro — titre (ligne 2, dorée)" },
      { path: "hero.description", label: "Héro — paragraphe", textarea: true },
      { path: "hero.cta", label: "Héro — bouton" },
      { path: "hero.phoneNote", label: "Héro — note sous le téléphone" },
      { path: "features.0.title", label: "Argument 1 — titre" },
      { path: "features.0.text", label: "Argument 1 — texte", textarea: true },
      { path: "features.1.title", label: "Argument 2 — titre" },
      { path: "features.1.text", label: "Argument 2 — texte", textarea: true },
      { path: "features.2.title", label: "Argument 3 — titre" },
      { path: "features.2.text", label: "Argument 3 — texte", textarea: true },
      { path: "features.3.title", label: "Argument 4 — titre" },
      { path: "features.3.text", label: "Argument 4 — texte", textarea: true },
      { path: "categoriesSection.title", label: "Section catégories — titre" },
      { path: "categoriesSection.subtitle", label: "Section catégories — sous-titre" },
    ],
  },
  {
    key: "services",
    label: "Services",
    fields: [
      { path: "servicesPage.title", label: "Titre de page" },
      { path: "servicesPage.subtitle", label: "Sous-titre" },
      { path: "servicesPage.services.0.title", label: "Formule 1 — titre" },
      { path: "servicesPage.services.0.text", label: "Formule 1 — texte", textarea: true },
      { path: "servicesPage.services.1.title", label: "Formule 2 — titre" },
      { path: "servicesPage.services.1.text", label: "Formule 2 — texte", textarea: true },
      { path: "servicesPage.services.2.title", label: "Formule 3 — titre" },
      { path: "servicesPage.services.2.text", label: "Formule 3 — texte", textarea: true },
      { path: "servicesPage.services.3.title", label: "Formule 4 — titre" },
      { path: "servicesPage.services.3.text", label: "Formule 4 — texte", textarea: true },
      { path: "servicesPage.stepsTitle", label: "Étapes — titre de section" },
      { path: "servicesPage.steps.0.title", label: "Étape 1 — titre" },
      { path: "servicesPage.steps.0.text", label: "Étape 1 — texte", textarea: true },
      { path: "servicesPage.steps.1.title", label: "Étape 2 — titre" },
      { path: "servicesPage.steps.1.text", label: "Étape 2 — texte", textarea: true },
      { path: "servicesPage.steps.2.title", label: "Étape 3 — titre" },
      { path: "servicesPage.steps.2.text", label: "Étape 3 — texte", textarea: true },
    ],
  },
  {
    key: "a-propos",
    label: "À propos",
    fields: [
      { path: "aboutPage.subtitle", label: "Sous-titre" },
      { path: "aboutPage.missionTitle", label: "Mission — titre" },
      { path: "aboutPage.missionP1", label: "Mission — paragraphe 1", textarea: true },
      { path: "aboutPage.missionP2", label: "Mission — paragraphe 2", textarea: true },
      { path: "aboutPage.valuesTitle", label: "Valeurs — titre de section" },
      { path: "aboutPage.values.0.title", label: "Valeur 1 — titre" },
      { path: "aboutPage.values.0.text", label: "Valeur 1 — texte", textarea: true },
      { path: "aboutPage.values.1.title", label: "Valeur 2 — titre" },
      { path: "aboutPage.values.1.text", label: "Valeur 2 — texte", textarea: true },
      { path: "aboutPage.values.2.title", label: "Valeur 3 — titre" },
      { path: "aboutPage.values.2.text", label: "Valeur 3 — texte", textarea: true },
    ],
  },
  {
    key: "contact",
    label: "Contact",
    fields: [
      { path: "contactPage.title", label: "Titre de page" },
      { path: "contactPage.subtitle", label: "Sous-titre" },
      { path: "contactPage.formTitle", label: "Formulaire — titre" },
      { path: "contactPage.formIntro", label: "Formulaire — introduction", textarea: true },
      { path: "contactPage.infos.regionValue", label: "Région desservie — valeur" },
      { path: "contactPage.infos.regionNote", label: "Région desservie — note" },
    ],
  },
  {
    key: "commun",
    label: "Sections communes",
    fields: [
      { path: "ctaSection.titleLine1", label: "Bandeau CTA — titre (ligne 1)" },
      { path: "ctaSection.titleLine2", label: "Bandeau CTA — titre (ligne 2, dorée)" },
      { path: "ctaSection.text", label: "Bandeau CTA — texte", textarea: true },
      { path: "ctaSection.button", label: "Bandeau CTA — bouton" },
      { path: "footer.blurb", label: "Pied de page — présentation", textarea: true },
      { path: "footer.regionLine1", label: "Pied de page — localisation (ligne 1)" },
      { path: "footer.regionLine2", label: "Pied de page — localisation (ligne 2)" },
    ],
  },
];

/** Liste blanche des chemins autorisés (sécurité : jamais de chemin arbitraire). */
export const ALLOWED_CONTENT_PATHS: ReadonlySet<string> = new Set(
  PAGE_SECTIONS.flatMap((s) => s.fields.map((f) => f.path)),
);

export const contentOverridesSchema = z.record(
  z.string().refine((p) => ALLOWED_CONTENT_PATHS.has(p), "chemin inconnu"),
  z.object({ fr: z.string().min(1), en: z.string().min(1) }),
);

export function getPath(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], obj);
}

export function setPath(obj: unknown, path: string, value: unknown): void {
  const keys = path.split(".");
  const last = keys.pop();
  const target = keys.reduce<unknown>(
    (acc, key) => (acc as Record<string, unknown> | undefined)?.[key],
    obj,
  );
  if (target && typeof target === "object" && last) {
    (target as Record<string, unknown>)[last] = value;
  }
}
