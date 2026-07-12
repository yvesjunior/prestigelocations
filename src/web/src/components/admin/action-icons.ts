// Boutons d'action en icône, colorés par sémantique et partagés par toutes les
// pages d'administration (demandes, commandes, équipements, catégories,
// employés…) pour rester cohérents : voir (bleu), éditer (ambre), supprimer /
// annuler (rouge), rouvrir / réactiver (vert), neutre (gris → doré au survol).
const BASE = "rounded-md p-1.5 transition-colors disabled:opacity-60";

export const iconActionCls = {
  view: `${BASE} text-sky-500 hover:bg-sky-500/10`,
  edit: `${BASE} text-amber-500 hover:bg-amber-500/10`,
  danger: `${BASE} text-destructive hover:bg-destructive/10`,
  positive: `${BASE} text-emerald-500 hover:bg-emerald-500/10`,
  neutral: `${BASE} text-muted-foreground hover:bg-secondary hover:text-primary`,
} as const;

export type IconActionVariant = keyof typeof iconActionCls;
