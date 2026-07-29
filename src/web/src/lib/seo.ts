// Données structurées JSON-LD construites depuis le catalogue (BD) — fil
// d'Ariane et listes Product/Offer pour les moteurs de recherche. Injectées
// via la clé `"script:ld+json"` des meta de route (TanStack head).
// Les tarifs ne sont publiés que si l'admin affiche les prix (showDailyPrice).
import { BASE_URL } from "@/lib/site";
import { imageUrl } from "@/lib/images";
import { pagePaths, categoryPagePath, type Lang } from "@/lib/i18n";
import { withCode, type CatalogCategory, type CatalogData, type CatalogEquipment } from "@/lib/catalog";

// En dev (VITE_BASE_URL vide), on garde des URLs absolues valides.
const SITE = BASE_URL || "https://prestigelocations.ca";

type Ld = Record<string, unknown>;

/** Entrée `meta` de route pour un bloc JSON-LD. Le runtime TanStack rend la clé
 *  "script:ld+json" en <script type="application/ld+json">, mais le type head
 *  de react-start ne l'expose pas encore — d'où le cast. */
export function ldMeta(ld: Ld) {
  return { "script:ld+json": ld } as unknown as { name: string; content: string };
}

function productLd(eq: CatalogEquipment, lang: Lang, pageUrl: string, showPrices: boolean): Ld {
  const p: Ld = {
    "@type": "Product",
    name: withCode(eq.name[lang], eq.code),
    url: pageUrl,
  };
  const desc = eq.detail?.[lang];
  if (desc) p.description = desc;
  const img = imageUrl(eq.imageKey, { w: 800 });
  if (img) p.image = img;
  if (showPrices && eq.dailyPriceCents) {
    const price = (eq.dailyPriceCents / 100).toFixed(2);
    const offer: Ld = {
      "@type": "Offer",
      price,
      priceCurrency: "CAD",
      // Tarif de location À LA JOURNÉE (et non prix de vente).
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price,
        priceCurrency: "CAD",
        referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "DAY" },
      },
    };
    if (eq.status === "disponible") offer.availability = "https://schema.org/InStock";
    if (eq.status === "bientot") offer.availability = "https://schema.org/PreOrder";
    p.offers = offer;
  }
  return p;
}

/** Fil d'Ariane + liste des équipements d'une page catégorie. */
export function categoryPageLd(
  catalog: CatalogData,
  category: CatalogCategory,
  lang: Lang,
  showPrices: boolean,
): Ld[] {
  const url = `${SITE}${categoryPagePath(category.slug, lang)}`;
  const equipments = catalog.equipments.filter((e) => e.category === category.slug);
  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: lang === "fr" ? "Accueil" : "Home",
          item: `${SITE}${pagePaths.home[lang]}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: lang === "fr" ? "Équipements" : "Equipment",
          item: `${SITE}${pagePaths.equipment[lang]}`,
        },
        { "@type": "ListItem", position: 3, name: category.name[lang], item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: category.name[lang],
      description: category.pageDescription[lang],
      itemListElement: equipments.map((eq, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: productLd(eq, lang, url, showPrices),
      })),
    },
  ];
}

/** Liste des catégories pour la page Équipements. */
export function equipmentListLd(catalog: CatalogData, lang: Lang): Ld {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: lang === "fr" ? "Équipements en location" : "Equipment for rent",
    itemListElement: catalog.categories.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name[lang],
      description: c.cardDescription[lang],
      url: `${SITE}${categoryPagePath(c.slug, lang)}`,
    })),
  };
}
