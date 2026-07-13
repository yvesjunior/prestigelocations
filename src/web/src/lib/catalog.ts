// Données de seed du catalogue (types + contenu initial de la BD).
// La BD est la SEULE source de contenu du site : ce fichier n'est jamais
// affiché — si la BD est indisponible, le site montre la page de maintenance.

export type Localized = { fr: string; en: string };
export type EquipmentStatus = "disponible" | "bientot" | "sur_demande";

export interface CatalogCategory {
  slug: string;
  name: Localized;
  /** Paragraphe court de la carte (accueil). */
  cardDescription: Localized;
  /** Paragraphe long de la page Équipements. */
  pageDescription: Localized;
  cta: Localized;
  alt: Localized;
  /** Points forts en liste (carte accueil + page Équipements) — texte libre,
   *  indépendant des équipements, édité dans l'admin. */
  bullets: { fr: string[]; en: string[] };
  imageKey: string | null;
  position: number;
}

export interface CatalogEquipment {
  slug: string;
  /** Code court optionnel (ex. « MP-01 ») pour distinguer deux unités du même nom. */
  code?: string | null;
  category: string;
  /** Nom court (carte de l'accueil, listes). */
  name: Localized;
  /** Ligne détaillée de la page Équipements (sinon le nom est utilisé). */
  detail?: Localized;
  /** Libellé du menu du formulaire de contact (sinon le nom est utilisé). */
  formLabel?: Localized;
  status: EquipmentStatus;
  published: boolean;
  imageKey: string | null;
  /** Tarifs de location en cents (chacun optionnel ; définis via l'admin). */
  dailyPriceCents?: number | null;
  weeklyPriceCents?: number | null;
  weekendPriceCents?: number | null;
  monthlyPriceCents?: number | null;
  position: number;
}

export interface CatalogData {
  categories: CatalogCategory[];
  equipments: CatalogEquipment[];
}

/** Nom affiché, suivi du code entre parenthèses quand il existe. */
export function withCode(name: string, code?: string | null): string {
  return code ? `${name} (${code})` : name;
}

/** Suffixe affiché après le nom selon le statut (dérivé, jamais stocké). */
export function statusSuffix(status: EquipmentStatus): Localized | null {
  if (status === "bientot") return { fr: "(bientôt disponible)", en: "(coming soon)" };
  if (status === "sur_demande") return { fr: "sur demande", en: "on request" };
  return null;
}

export const catalogCategories: CatalogCategory[] = [
  {
    slug: "machinerie",
    name: { fr: "Machinerie", en: "Machinery" },
    cardDescription: {
      fr: "Des machines performantes pour vos travaux d'excavation, de terrassement et plus encore.",
      en: "High-performance machines for your excavation, grading and earthmoving work, and more.",
    },
    pageDescription: {
      fr: "Des machines performantes et bien entretenues pour vos travaux d'excavation, de terrassement, d'aménagement paysager et plus encore.",
      en: "High-performance, well-maintained machines for your excavation, grading, landscaping work and more.",
    },
    cta: { fr: "Voir la machinerie", en: "See the machinery" },
    alt: { fr: "Mini-pelle sur un chantier", en: "Mini excavator on a job site" },
    bullets: {
      fr: [
        "Mini-pelle (excavatrice compacte)",
        "Tracteur compact avec accessoires",
        "Plateforme élévatrice",
        "Godets et accessoires variés",
        "Et plus encore",
      ],
      en: [
        "Mini excavator (compact excavator)",
        "Compact tractor with attachments",
        "Aerial lift",
        "Buckets and various attachments",
        "And more",
      ],
    },
    imageKey: "/prestigelocations/categories/cat-machinerie.jpg",
    position: 0,
  },
  {
    slug: "remorques",
    name: { fr: "Remorques", en: "Trailers" },
    cardDescription: {
      fr: "Une vaste sélection de remorques pour transporter vos matériaux et équipements.",
      en: "A wide selection of trailers to haul your materials and equipment.",
    },
    pageDescription: {
      fr: "Une vaste sélection de remorques pour transporter vos matériaux, véhicules et équipements en toute sécurité.",
      en: "A wide selection of trailers to haul your materials, vehicles and equipment safely.",
    },
    cta: { fr: "Voir les remorques", en: "See the trailers" },
    alt: {
      fr: "Remorques dompeur, fermée et plateforme",
      en: "Dump, enclosed and flatbed trailers",
    },
    bullets: {
      fr: [
        "Trailer dompeur",
        "Trailer fermé",
        "Trailer plateforme",
        "Attaches et accessoires de remorquage",
        "Et plus encore",
      ],
      en: [
        "Dump trailer",
        "Enclosed trailer",
        "Flatbed trailer",
        "Hitches and towing accessories",
        "And more",
      ],
    },
    imageKey: "/prestigelocations/categories/cat-remorques.jpg",
    position: 1,
  },
  {
    slug: "petits-equipements",
    name: { fr: "Petits équipements", en: "Small equipment" },
    cardDescription: {
      fr: "L'outillage et les petits équipements essentiels pour bien faire le travail.",
      en: "The essential tools and small equipment to get the job done right.",
    },
    pageDescription: {
      fr: "L'outillage et les petits équipements essentiels pour bien faire le travail, du début à la fin.",
      en: "The essential tools and small equipment to get the job done right, from start to finish.",
    },
    cta: { fr: "Voir les petits équipements", en: "See the small equipment" },
    alt: {
      fr: "Compacteur, scie à béton et marteau-piqueur",
      en: "Compactor, concrete saw and jackhammer",
    },
    bullets: {
      fr: [
        "Compacteurs",
        "Scies à béton",
        "Marteaux-piqueurs",
        "Outillage spécialisé",
        "Et plus encore",
      ],
      en: ["Compactors", "Concrete saws", "Jackhammers", "Specialized tools", "And more"],
    },
    imageKey: "/prestigelocations/categories/cat-petits-equipements.jpg",
    position: 2,
  },
];

export const catalogEquipments: CatalogEquipment[] = [
  // — Machinerie
  {
    slug: "mini-pelle",
    code: "MP-01",
    category: "machinerie",
    name: { fr: "Mini-pelle", en: "Mini excavator" },
    detail: { fr: "Mini-pelle (excavatrice compacte)", en: "Mini excavator (compact excavator)" },
    status: "disponible",
    published: true,
    imageKey: null,
    position: 0,
  },
  {
    slug: "tracteur-compact",
    code: "TC-01",
    category: "machinerie",
    name: { fr: "Tracteur compact", en: "Compact tractor" },
    detail: {
      fr: "Tracteur compact avec accessoires",
      en: "Compact tractor with attachments",
    },
    status: "disponible",
    published: true,
    imageKey: null,
    position: 1,
  },
  {
    slug: "plateforme-elevatrice",
    code: "PE-01",
    category: "machinerie",
    name: { fr: "Plateforme élévatrice", en: "Aerial lift" },
    status: "bientot",
    published: true,
    imageKey: null,
    position: 2,
  },
  {
    slug: "godets-accessoires",
    code: "GA-01",
    category: "machinerie",
    name: { fr: "Godets et accessoires variés", en: "Buckets and various attachments" },
    status: "disponible",
    published: true,
    imageKey: null,
    position: 3,
  },
  // — Remorques
  {
    slug: "trailer-dompeur",
    code: "TD-01",
    category: "remorques",
    name: { fr: "Trailer dompeur", en: "Dump trailer" },
    detail: {
      fr: "Trailer dompeur — idéal pour la terre, la pierre et les débris",
      en: "Dump trailer — ideal for soil, stone and debris",
    },
    status: "disponible",
    published: true,
    imageKey: null,
    position: 0,
  },
  {
    slug: "trailer-ferme",
    code: "TF-01",
    category: "remorques",
    name: { fr: "Trailer fermé", en: "Enclosed trailer" },
    detail: {
      fr: "Trailer fermé — protégez votre cargaison des intempéries",
      en: "Enclosed trailer — protect your cargo from the weather",
    },
    status: "disponible",
    published: true,
    imageKey: null,
    position: 1,
  },
  {
    slug: "trailer-plateforme",
    code: "TP-01",
    category: "remorques",
    name: { fr: "Trailer plateforme", en: "Flatbed trailer" },
    detail: {
      fr: "Trailer plateforme — pour véhicules et machinerie",
      en: "Flatbed trailer — for vehicles and machinery",
    },
    status: "disponible",
    published: true,
    imageKey: null,
    position: 2,
  },
  {
    slug: "attaches-remorquage",
    code: "AR-01",
    category: "remorques",
    name: { fr: "Attaches et accessoires de remorquage", en: "Hitches and towing accessories" },
    status: "disponible",
    published: true,
    imageKey: null,
    position: 3,
  },
  // — Petits équipements
  {
    slug: "compacteur",
    code: "CP-01",
    category: "petits-equipements",
    name: { fr: "Compacteurs", en: "Plate compactors" },
    detail: { fr: "Compacteurs à plaque vibrante", en: "Vibrating plate compactors" },
    formLabel: { fr: "Compacteur", en: "Compactor" },
    status: "disponible",
    published: true,
    imageKey: null,
    position: 0,
  },
  {
    slug: "scie-a-beton",
    code: "SB-01",
    category: "petits-equipements",
    name: { fr: "Scies à béton", en: "Concrete saws" },
    formLabel: { fr: "Scie à béton", en: "Concrete saw" },
    status: "disponible",
    published: true,
    imageKey: null,
    position: 1,
  },
  {
    slug: "marteau-piqueur",
    code: "MA-01",
    category: "petits-equipements",
    name: { fr: "Marteaux-piqueurs", en: "Jackhammers" },
    formLabel: { fr: "Marteau-piqueur", en: "Jackhammer" },
    status: "disponible",
    published: true,
    imageKey: null,
    position: 2,
  },
  {
    slug: "outillage-specialise",
    code: "OS-01",
    category: "petits-equipements",
    name: { fr: "Outillage spécialisé", en: "Specialized tools" },
    status: "sur_demande",
    published: true,
    imageKey: null,
    position: 3,
  },
];
