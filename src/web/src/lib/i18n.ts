import { getRouteApi, useLocation } from "@tanstack/react-router";
import { useMemo } from "react";
import { DEFAULT_CONTACT } from "./contact";
import { setPath, type ContentOverrides } from "./content";
import { BASE_URL } from "./site";

export type Lang = "fr" | "en";

export const pagePaths = {
  home: { fr: "/fr", en: "/en" },
  equipment: { fr: "/fr/equipements", en: "/en/equipment" },
  services: { fr: "/fr/services", en: "/en/services" },
  about: { fr: "/fr/a-propos", en: "/en/about" },
  contact: { fr: "/fr/contact", en: "/en/contact" },
} as const;

export type PageKey = keyof typeof pagePaths;

/** Chemin de la page publique d'une catégorie (slug partagé entre les langues). */
export function categoryPagePath(slug: string, lang: Lang): string {
  return lang === "fr" ? `/fr/equipements/${slug}` : `/en/equipment/${slug}`;
}

export function useLang(): Lang {
  const pathname = useLocation({ select: (l) => l.pathname });
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "fr";
}

const fr = {
  header: {
    nav: [
      { key: "home" as PageKey, label: "Accueil" },
      { key: "equipment" as PageKey, label: "Équipements" },
      { key: "services" as PageKey, label: "Services" },
      { key: "about" as PageKey, label: "À propos" },
      { key: "contact" as PageKey, label: "Contact" },
    ],
    reserve: "Réserver",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
  },
  hero: {
    titleLine1: "Le bon équipement,",
    titleLine2: "au bon moment.",
    description:
      "Location d'équipements fiables et performants pour vos projets de toutes tailles. Simple, rapide et sans tracas.",
    cta: "Réserver maintenant",
    phoneNote: "Réponse rapide garantie",
    imageAlt: "Mini-pelle sur un chantier au crépuscule",
    imageAlt2: "Tracteur compact avec chargeur frontal",
    imageAlt3: "Mini-pelle Bobcat en train de creuser",
    imageAlt4: "Chargeuse-pelleteuse déversant du gravier",
  },
  features: [
    {
      title: "Équipements fiables",
      text: "Des machines récentes et bien entretenues pour des travaux efficaces.",
    },
    {
      title: "Réservation simple",
      text: "Réservez en quelques clics et récupérez votre équipement rapidement.",
    },
    {
      title: "Flexibilité totale",
      text: "Location à la journée, à la semaine ou au mois selon vos besoins.",
    },
    {
      title: "Service courtois",
      text: "Une équipe disponible et à l'écoute pour vous accompagner dans vos projets.",
    },
  ],
  // Les données des catégories/équipements vivent en BD (admin) — ici, uniquement
  // les libellés d'interface.
  categoriesSection: {
    eyebrow: "Nos équipements",
    title: "Nos catégories",
    subtitle: "Pour répondre à tous vos besoins",
    andMore: "Et plus encore",
  },
  ctaSection: {
    titleLine1: "Prêt à réaliser",
    titleLine2: "vos projets ?",
    text: "Contactez-nous dès aujourd'hui et réservez l'équipement qu'il vous faut.",
    phoneNote: "Réponse rapide garantie",
    button: "Nous contacter",
    imageAlt: "Remorque dompeur au coucher du soleil",
  },
  footer: {
    blurb:
      "Prestige Locations est votre partenaire de confiance pour la location d'équipements de qualité, au meilleur service.",
    navigation: "Navigation",
    servicesTitle: "Services",
    services: [
      "Location à la journée",
      "Location à la semaine",
      "Location au mois",
      "Livraison disponible",
    ],
    contact: "Contact",
    regionLine1: "Sherbrooke, Québec",
    regionLine2: "Service dans toute la région",
    rights: "Tous droits réservés.",
  },
  notFound: {
    title: "Page introuvable",
    text: "La page que vous cherchez n'existe pas ou a été déplacée.",
    back: "Retour à l'accueil",
  },
  errorPage: {
    title: "Cette page n'a pas pu être chargée",
    text: "Une erreur est survenue. Vous pouvez réessayer ou revenir à l'accueil.",
    retry: "Réessayer",
    home: "Accueil",
  },
  maintenancePage: {
    title: "Site en maintenance",
    text: "Nous effectuons une courte maintenance. Merci de réessayer dans quelques instants.",
    retry: "Réessayer",
  },
  meta: {
    home: {
      title: "Prestige Locations | Location d'équipements à Sherbrooke",
      description:
        "Location d'équipements fiables à Sherbrooke : mini-pelle, remorques, compacteurs et plus. Simple, rapide et sans tracas. {phone}.",
      ogDescription:
        "Le bon équipement, au bon moment. Machinerie, remorques et petits équipements en location à la journée, semaine ou mois.",
    },
    equipment: {
      title: "Équipements en location | Prestige Locations",
      description:
        "Mini-pelle, tracteur compact, remorques dompeur, fermées et plateformes, compacteurs, scies à béton et plus en location à Sherbrooke.",
      ogDescription: "Machinerie, remorques et petits équipements en location à Sherbrooke.",
    },
    services: {
      title: "Services de location | Prestige Locations",
      description:
        "Location à la journée, à la semaine ou au mois, avec livraison disponible dans toute la région de Sherbrooke.",
      ogDescription:
        "Des formules flexibles : journée, semaine, mois et livraison sur le chantier.",
    },
    about: {
      title: "À propos | Prestige Locations",
      description:
        "Prestige Locations, votre partenaire de confiance pour la location d'équipements de qualité à Sherbrooke et dans toute la région.",
      ogDescription: "Votre partenaire de confiance pour la location d'équipements de qualité.",
    },
    contact: {
      title: "Contact & Réservation | Prestige Locations",
      description:
        "Réservez votre équipement dès aujourd'hui. Appelez le {phone} ou écrivez-nous — réponse rapide garantie.",
      ogDescription: "Réservez votre équipement dès aujourd'hui. Réponse rapide garantie.",
    },
  },
  equipmentPage: {
    eyebrow: "Nos équipements",
    title: "Notre inventaire",
    subtitle: "Tout ce qu'il faut pour vos projets",
    checkAvailability: "Vérifier la disponibilité",
  },
  categoryPage: {
    back: "Tous nos équipements",
    empty:
      "Les équipements de cette catégorie arrivent bientôt — contactez-nous pour en savoir plus.",
  },
  servicesPage: {
    eyebrow: "Nos services",
    title: "Des formules flexibles",
    subtitle: "Adaptées à chaque projet",
    services: [
      {
        title: "Location à la journée",
        text: "Pour les petits travaux et les projets d'un jour. Récupérez l'équipement le matin, rapportez-le en fin de journée.",
      },
      {
        title: "Location à la semaine",
        text: "Le format idéal pour les rénovations et les chantiers de moyenne durée, à un tarif avantageux.",
      },
      {
        title: "Location au mois",
        text: "Pour les projets d'envergure. Gardez l'équipement aussi longtemps que nécessaire, sans compromis.",
      },
      {
        title: "Livraison disponible",
        text: "Nous livrons l'équipement directement sur votre chantier, partout dans la région de Sherbrooke.",
      },
    ],
    stepsEyebrow: "Comment ça marche",
    stepsTitle: "Simple en trois étapes",
    steps: [
      {
        num: "01",
        title: "Contactez-nous",
        text: "Appelez-nous ou écrivez-nous pour vérifier la disponibilité de l'équipement.",
      },
      {
        num: "02",
        title: "Réservez",
        text: "Choisissez la durée de location qui convient à votre projet.",
      },
      {
        num: "03",
        title: "Travaillez",
        text: "Récupérez votre équipement ou faites-le livrer, et réalisez vos projets.",
      },
    ],
    cta: "Réserver maintenant",
  },
  aboutPage: {
    eyebrow: "À propos",
    title: "Prestige Locations",
    subtitle: "Votre partenaire de confiance",
    imageAlt: "Mini-pelle Prestige Locations sur un chantier",
    missionTitle: "Notre mission",
    missionP1:
      "Prestige Locations est née d'une idée simple : rendre la location d'équipements de qualité accessible, rapide et sans tracas. Que vous soyez un entrepreneur, un paysagiste ou un particulier qui réalise ses propres projets, vous méritez des équipements fiables et un service à la hauteur.",
    missionP2:
      "De la mini-pelle aux remorques en passant par les petits équipements, chaque machine de notre inventaire est entretenue avec soin pour vous garantir des travaux efficaces, du premier au dernier coup de godet.",
    discover: "Découvrir nos équipements",
    valuesEyebrow: "Nos valeurs",
    valuesTitle: "Ce qui nous guide",
    values: [
      {
        title: "Qualité",
        text: "Des équipements récents, inspectés et entretenus rigoureusement avant chaque location.",
      },
      {
        title: "Confiance",
        text: "Un service honnête et transparent, sans frais cachés ni mauvaises surprises.",
      },
      {
        title: "Proximité",
        text: "Une entreprise d'ici, au service des gens de Sherbrooke et de toute la région.",
      },
    ],
  },
  contactPage: {
    eyebrow: "Contact",
    title: "Réservez votre équipement",
    subtitle: "Réponse rapide garantie",
    infos: {
      phoneLabel: "Téléphone",
      phoneNote: "Réponse rapide garantie",
      emailLabel: "Courriel",
      emailNote: "Réponse en moins de 24 h",
      regionLabel: "Région desservie",
      regionValue: "Sherbrooke, Québec",
      regionNote: "Service dans toute la région",
    },
    formTitle: "Demande de réservation",
    formIntro: "Remplissez le formulaire et nous vous répondrons rapidement.",
    sentTitle: "Merci !",
    sentText:
      "Votre demande a bien été envoyée — nous vous recontacterons rapidement. Vous pouvez aussi nous appeler au {phone}.",
    nameLabel: "Nom complet",
    namePlaceholder: "Votre nom",
    phoneLabel: "Téléphone",
    phonePlaceholder: "819-000-0000",
    equipmentLabel: "Équipements souhaités",
    equipmentPlaceholder: "Choisir un ou plusieurs équipements…",
    equipmentSearch: "Rechercher un équipement…",
    equipmentEmpty: "Aucun équipement trouvé.",
    otherOption: "Laissez vide pour une demande générale (autre / plusieurs équipements).",
    datesLabel: "Période souhaitée",
    datesHint: "Les journées grisées sont déjà réservées.",
    datesSelected: "Du {start} au {end}",
    datesClear: "Effacer les dates",
    notBookingNote:
      "Votre demande ne constitue pas une réservation confirmée — nous vous recontactons pour la finaliser.",
    messageLabel: "Message",
    messagePlaceholder: "Durée de location, détails du projet...",
    submit: "Envoyer ma demande",
    errors: {
      rate_limited: "Trop de demandes envoyées. Merci de réessayer dans quelques minutes.",
      conflict: "Cette période vient d'être réservée. Choisissez d'autres dates ou contactez-nous.",
      dates_required: "Choisissez la période souhaitée dans le calendrier.",
      generic: "L'envoi a échoué. Réessayez ou appelez-nous au {phone}.",
    },
  },
};

export type Dict = typeof fr;

const en: Dict = {
  header: {
    nav: [
      { key: "home", label: "Home" },
      { key: "equipment", label: "Equipment" },
      { key: "services", label: "Services" },
      { key: "about", label: "About" },
      { key: "contact", label: "Contact" },
    ],
    reserve: "Book now",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  hero: {
    titleLine1: "The right equipment,",
    titleLine2: "at the right time.",
    description:
      "Reliable, high-performance equipment rentals for projects of every size. Simple, fast and hassle-free.",
    cta: "Book now",
    phoneNote: "Fast response guaranteed",
    imageAlt: "Mini excavator on a job site at dusk",
    imageAlt2: "Compact tractor with front loader",
    imageAlt3: "Bobcat mini excavator digging",
    imageAlt4: "Backhoe loader dumping gravel",
  },
  features: [
    {
      title: "Reliable equipment",
      text: "Recent, well-maintained machines for efficient work.",
    },
    {
      title: "Easy booking",
      text: "Book in a few clicks and pick up your equipment quickly.",
    },
    {
      title: "Total flexibility",
      text: "Daily, weekly or monthly rentals to suit your needs.",
    },
    {
      title: "Friendly service",
      text: "An available, attentive team to support you through your projects.",
    },
  ],
  categoriesSection: {
    eyebrow: "Our equipment",
    title: "Our categories",
    subtitle: "To meet all your needs",
    andMore: "And more",
  },
  ctaSection: {
    titleLine1: "Ready to bring",
    titleLine2: "your projects to life?",
    text: "Contact us today and book the equipment you need.",
    phoneNote: "Fast response guaranteed",
    button: "Contact us",
    imageAlt: "Dump trailer at sunset",
  },
  footer: {
    blurb:
      "Prestige Locations is your trusted partner for quality equipment rentals with outstanding service.",
    navigation: "Navigation",
    servicesTitle: "Services",
    services: ["Daily rentals", "Weekly rentals", "Monthly rentals", "Delivery available"],
    contact: "Contact",
    regionLine1: "Sherbrooke, Québec",
    regionLine2: "Serving the entire region",
    rights: "All rights reserved.",
  },
  notFound: {
    title: "Page not found",
    text: "The page you are looking for doesn't exist or has been moved.",
    back: "Back to home",
  },
  errorPage: {
    title: "This page could not be loaded",
    text: "An error occurred. You can try again or go back to the home page.",
    retry: "Try again",
    home: "Home",
  },
  maintenancePage: {
    title: "Site under maintenance",
    text: "We're doing a short maintenance. Please try again in a few moments.",
    retry: "Try again",
  },
  meta: {
    home: {
      title: "Prestige Locations | Equipment Rentals in Sherbrooke",
      description:
        "Reliable equipment rentals in Sherbrooke: mini excavator, trailers, compactors and more. Simple, fast and hassle-free. {phone}.",
      ogDescription:
        "The right equipment, at the right time. Machinery, trailers and small equipment for rent by the day, week or month.",
    },
    equipment: {
      title: "Equipment for Rent | Prestige Locations",
      description:
        "Mini excavator, compact tractor, dump, enclosed and flatbed trailers, compactors, concrete saws and more for rent in Sherbrooke.",
      ogDescription: "Machinery, trailers and small equipment for rent in Sherbrooke.",
    },
    services: {
      title: "Rental Services | Prestige Locations",
      description:
        "Daily, weekly or monthly rentals, with delivery available throughout the Sherbrooke region.",
      ogDescription: "Flexible plans: day, week, month and on-site delivery.",
    },
    about: {
      title: "About Us | Prestige Locations",
      description:
        "Prestige Locations, your trusted partner for quality equipment rentals in Sherbrooke and throughout the region.",
      ogDescription: "Your trusted partner for quality equipment rentals.",
    },
    contact: {
      title: "Contact & Booking | Prestige Locations",
      description:
        "Book your equipment today. Call {phone} or write to us — fast response guaranteed.",
      ogDescription: "Book your equipment today. Fast response guaranteed.",
    },
  },
  equipmentPage: {
    eyebrow: "Our equipment",
    title: "Our inventory",
    subtitle: "Everything you need for your projects",
    checkAvailability: "Check availability",
  },
  categoryPage: {
    back: "All our equipment",
    empty: "Equipment for this category is coming soon — contact us to learn more.",
  },
  servicesPage: {
    eyebrow: "Our services",
    title: "Flexible plans",
    subtitle: "Tailored to every project",
    services: [
      {
        title: "Daily rentals",
        text: "For small jobs and one-day projects. Pick up the equipment in the morning, return it at the end of the day.",
      },
      {
        title: "Weekly rentals",
        text: "The ideal format for renovations and medium-length job sites, at an advantageous rate.",
      },
      {
        title: "Monthly rentals",
        text: "For large-scale projects. Keep the equipment as long as you need, without compromise.",
      },
      {
        title: "Delivery available",
        text: "We deliver the equipment straight to your job site, anywhere in the Sherbrooke region.",
      },
    ],
    stepsEyebrow: "How it works",
    stepsTitle: "Simple, in three steps",
    steps: [
      {
        num: "01",
        title: "Contact us",
        text: "Call or write to us to check equipment availability.",
      },
      {
        num: "02",
        title: "Book",
        text: "Choose the rental duration that fits your project.",
      },
      {
        num: "03",
        title: "Get to work",
        text: "Pick up your equipment or have it delivered, and bring your projects to life.",
      },
    ],
    cta: "Book now",
  },
  aboutPage: {
    eyebrow: "About",
    title: "Prestige Locations",
    subtitle: "Your trusted partner",
    imageAlt: "Prestige Locations mini excavator on a job site",
    missionTitle: "Our mission",
    missionP1:
      "Prestige Locations was born from a simple idea: making quality equipment rentals accessible, fast and hassle-free. Whether you're a contractor, a landscaper or a homeowner tackling your own projects, you deserve reliable equipment and service to match.",
    missionP2:
      "From the mini excavator to trailers and small equipment, every machine in our inventory is carefully maintained to guarantee efficient work, from the first scoop to the last.",
    discover: "Discover our equipment",
    valuesEyebrow: "Our values",
    valuesTitle: "What guides us",
    values: [
      {
        title: "Quality",
        text: "Recent equipment, rigorously inspected and maintained before every rental.",
      },
      {
        title: "Trust",
        text: "Honest, transparent service — no hidden fees, no bad surprises.",
      },
      {
        title: "Community",
        text: "A local business, serving the people of Sherbrooke and the entire region.",
      },
    ],
  },
  contactPage: {
    eyebrow: "Contact",
    title: "Book your equipment",
    subtitle: "Fast response guaranteed",
    infos: {
      phoneLabel: "Phone",
      phoneNote: "Fast response guaranteed",
      emailLabel: "Email",
      emailNote: "Reply within 24 hours",
      regionLabel: "Service area",
      regionValue: "Sherbrooke, Québec",
      regionNote: "Serving the entire region",
    },
    formTitle: "Booking request",
    formIntro: "Fill out the form and we'll get back to you quickly.",
    sentTitle: "Thank you!",
    sentText:
      "Your request has been sent — we'll get back to you shortly. You can also call us at {phone}.",
    nameLabel: "Full name",
    namePlaceholder: "Your name",
    phoneLabel: "Phone",
    phonePlaceholder: "819-000-0000",
    equipmentLabel: "Desired equipment",
    equipmentPlaceholder: "Choose one or more items…",
    equipmentSearch: "Search equipment…",
    equipmentEmpty: "No equipment found.",
    otherOption: "Leave empty for a general inquiry (other / multiple items).",
    datesLabel: "Desired period",
    datesHint: "Greyed-out days are already booked.",
    datesSelected: "From {start} to {end}",
    datesClear: "Clear dates",
    notBookingNote: "Your request is not a confirmed booking — we'll contact you to finalize it.",
    messageLabel: "Message",
    messagePlaceholder: "Rental duration, project details...",
    submit: "Send my request",
    errors: {
      rate_limited: "Too many requests sent. Please try again in a few minutes.",
      conflict: "This period was just booked. Pick other dates or contact us.",
      dates_required: "Please select your desired period in the calendar.",
      generic: "Sending failed. Try again or call us at {phone}.",
    },
  },
};

export const translations: Record<Lang, Dict> = { fr, en };

const rootApi = getRouteApi("__root__");

/** Surcharges de contenu enregistrées via l'admin (« Pages »), fusionnées au dictionnaire. */
function useContentOverrides(): ContentOverrides {
  let data: { content?: ContentOverrides } | undefined;
  try {
    data = rootApi.useLoaderData() as { content?: ContentOverrides } | undefined;
  } catch {
    data = undefined;
  }
  return data?.content ?? {};
}

export function useT(): Dict {
  const lang = useLang();
  const overrides = useContentOverrides();
  return useMemo(() => {
    const entries = Object.entries(overrides);
    if (entries.length === 0) return translations[lang];
    const dict = structuredClone(translations[lang]);
    for (const [path, value] of entries) setPath(dict, path, value[lang]);
    return dict;
  }, [lang, overrides]);
}

/** Head (title/meta/hreflang links) for a localized page. */
export function pageHead(key: PageKey, lang: Lang, phone?: string) {
  const m = translations[lang].meta[key];
  // Le téléphone vient de la BD (loader racine) ; le défaut ne sert qu'aux
  // rendus sans loader (page d'erreur/maintenance, où les meta importent peu).
  const withPhone = (s: string) => s.replaceAll("{phone}", phone ?? DEFAULT_CONTACT.phone);
  return {
    meta: [
      { title: m.title },
      { name: "description", content: withPhone(m.description) },
      { property: "og:title", content: m.title },
      { property: "og:description", content: withPhone(m.ogDescription) },
    ],
    links: BASE_URL
      ? [
          { rel: "alternate", hrefLang: "fr", href: `${BASE_URL}${pagePaths[key].fr}` },
          { rel: "alternate", hrefLang: "en", href: `${BASE_URL}${pagePaths[key].en}` },
          { rel: "alternate", hrefLang: "x-default", href: `${BASE_URL}${pagePaths[key].fr}` },
        ]
      : [],
  };
}
