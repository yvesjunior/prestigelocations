import { useLocation } from "@tanstack/react-router";
import { BASE_URL, EMAIL, PHONE_DISPLAY } from "./site";

export type Lang = "fr" | "en";

export const pagePaths = {
  home: { fr: "/fr", en: "/en" },
  equipment: { fr: "/fr/equipements", en: "/en/equipment" },
  services: { fr: "/fr/services", en: "/en/services" },
  about: { fr: "/fr/a-propos", en: "/en/about" },
  contact: { fr: "/fr/contact", en: "/en/contact" },
} as const;

export type PageKey = keyof typeof pagePaths;

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
  categoriesSection: {
    eyebrow: "Nos équipements",
    title: "Trois catégories",
    subtitle: "Pour répondre à tous vos besoins",
    categories: [
      {
        title: "Machinerie",
        description:
          "Des machines performantes pour vos travaux d'excavation, de terrassement et plus encore.",
        cta: "Voir la machinerie",
        items: [
          { label: "Mini-pelle" },
          { label: "Tracteur compact" },
          { label: "Plateforme élévatrice", note: "(bientôt disponible)" },
          { label: "Et plus encore" },
        ],
      },
      {
        title: "Remorques",
        description:
          "Une vaste sélection de remorques pour transporter vos matériaux et équipements.",
        cta: "Voir les remorques",
        items: [
          { label: "Trailer dompeur" },
          { label: "Trailer fermé" },
          { label: "Trailer plateforme" },
          { label: "Et plus encore" },
        ],
      },
      {
        title: "Petits équipements",
        description: "L'outillage et les petits équipements essentiels pour bien faire le travail.",
        cta: "Voir les petits équipements",
        items: [
          { label: "Compacteurs" },
          { label: "Scies à béton" },
          { label: "Marteaux-piqueurs" },
          { label: "Et plus encore" },
        ],
      },
    ],
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
  meta: {
    home: {
      title: "Prestige Locations | Location d'équipements à Sherbrooke",
      description:
        "Location d'équipements fiables à Sherbrooke : mini-pelle, remorques, compacteurs et plus. Simple, rapide et sans tracas. 819-269-3129.",
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
        "Réservez votre équipement dès aujourd'hui. Appelez le 819-269-3129 ou écrivez-nous — réponse rapide garantie.",
      ogDescription: "Réservez votre équipement dès aujourd'hui. Réponse rapide garantie.",
    },
  },
  equipmentPage: {
    eyebrow: "Nos équipements",
    title: "Notre inventaire",
    subtitle: "Tout ce qu'il faut pour vos projets",
    checkAvailability: "Vérifier la disponibilité",
    sections: [
      {
        title: "Machinerie",
        alt: "Mini-pelle sur un chantier",
        description:
          "Des machines performantes et bien entretenues pour vos travaux d'excavation, de terrassement, d'aménagement paysager et plus encore.",
        items: [
          "Mini-pelle (excavatrice compacte)",
          "Tracteur compact avec accessoires",
          "Plateforme élévatrice (bientôt disponible)",
          "Godets et accessoires variés",
        ],
      },
      {
        title: "Remorques",
        alt: "Remorques dompeur, fermée et plateforme",
        description:
          "Une vaste sélection de remorques pour transporter vos matériaux, véhicules et équipements en toute sécurité.",
        items: [
          "Trailer dompeur — idéal pour la terre, la pierre et les débris",
          "Trailer fermé — protégez votre cargaison des intempéries",
          "Trailer plateforme — pour véhicules et machinerie",
          "Attaches et accessoires de remorquage",
        ],
      },
      {
        title: "Petits équipements",
        alt: "Compacteur, scie à béton et marteau-piqueur",
        description:
          "L'outillage et les petits équipements essentiels pour bien faire le travail, du début à la fin.",
        items: [
          "Compacteurs à plaque vibrante",
          "Scies à béton",
          "Marteaux-piqueurs",
          "Outillage spécialisé sur demande",
        ],
      },
    ],
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
    sentText: `Votre application courriel devrait s'ouvrir. Vous pouvez aussi nous appeler au ${PHONE_DISPLAY}.`,
    nameLabel: "Nom complet",
    namePlaceholder: "Votre nom",
    phoneLabel: "Téléphone",
    phonePlaceholder: "819-000-0000",
    equipmentLabel: "Équipement souhaité",
    equipmentOptions: [
      "Mini-pelle",
      "Tracteur compact",
      "Trailer dompeur",
      "Trailer fermé",
      "Trailer plateforme",
      "Compacteur",
      "Scie à béton",
      "Marteau-piqueur",
      "Autre / plusieurs équipements",
    ],
    messageLabel: "Message",
    messagePlaceholder: "Dates souhaitées, durée de location, détails du projet...",
    submit: "Envoyer ma demande",
    mailSubject: "Demande de réservation",
    mailFallbackEquipment: "Équipement",
    mailBody: { name: "Nom", phone: "Téléphone", equipment: "Équipement", message: "Message" },
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
    title: "Three categories",
    subtitle: "To meet all your needs",
    categories: [
      {
        title: "Machinery",
        description:
          "High-performance machines for your excavation, grading and earthmoving work, and more.",
        cta: "See the machinery",
        items: [
          { label: "Mini excavator" },
          { label: "Compact tractor" },
          { label: "Aerial lift", note: "(coming soon)" },
          { label: "And more" },
        ],
      },
      {
        title: "Trailers",
        description: "A wide selection of trailers to haul your materials and equipment.",
        cta: "See the trailers",
        items: [
          { label: "Dump trailer" },
          { label: "Enclosed trailer" },
          { label: "Flatbed trailer" },
          { label: "And more" },
        ],
      },
      {
        title: "Small equipment",
        description: "The essential tools and small equipment to get the job done right.",
        cta: "See the small equipment",
        items: [
          { label: "Plate compactors" },
          { label: "Concrete saws" },
          { label: "Jackhammers" },
          { label: "And more" },
        ],
      },
    ],
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
  meta: {
    home: {
      title: "Prestige Locations | Equipment Rentals in Sherbrooke",
      description:
        "Reliable equipment rentals in Sherbrooke: mini excavator, trailers, compactors and more. Simple, fast and hassle-free. 819-269-3129.",
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
        "Book your equipment today. Call 819-269-3129 or write to us — fast response guaranteed.",
      ogDescription: "Book your equipment today. Fast response guaranteed.",
    },
  },
  equipmentPage: {
    eyebrow: "Our equipment",
    title: "Our inventory",
    subtitle: "Everything you need for your projects",
    checkAvailability: "Check availability",
    sections: [
      {
        title: "Machinery",
        alt: "Mini excavator on a job site",
        description:
          "High-performance, well-maintained machines for your excavation, grading, landscaping work and more.",
        items: [
          "Mini excavator (compact excavator)",
          "Compact tractor with attachments",
          "Aerial lift (coming soon)",
          "Buckets and various attachments",
        ],
      },
      {
        title: "Trailers",
        alt: "Dump, enclosed and flatbed trailers",
        description:
          "A wide selection of trailers to haul your materials, vehicles and equipment safely.",
        items: [
          "Dump trailer — ideal for soil, stone and debris",
          "Enclosed trailer — protect your cargo from the weather",
          "Flatbed trailer — for vehicles and machinery",
          "Hitches and towing accessories",
        ],
      },
      {
        title: "Small equipment",
        alt: "Compactor, concrete saw and jackhammer",
        description:
          "The essential tools and small equipment to get the job done right, from start to finish.",
        items: [
          "Vibrating plate compactors",
          "Concrete saws",
          "Jackhammers",
          "Specialized tools on request",
        ],
      },
    ],
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
    sentText: `Your email app should open. You can also call us at ${PHONE_DISPLAY}.`,
    nameLabel: "Full name",
    namePlaceholder: "Your name",
    phoneLabel: "Phone",
    phonePlaceholder: "819-000-0000",
    equipmentLabel: "Desired equipment",
    equipmentOptions: [
      "Mini excavator",
      "Compact tractor",
      "Dump trailer",
      "Enclosed trailer",
      "Flatbed trailer",
      "Compactor",
      "Concrete saw",
      "Jackhammer",
      "Other / multiple items",
    ],
    messageLabel: "Message",
    messagePlaceholder: "Desired dates, rental duration, project details...",
    submit: "Send my request",
    mailSubject: "Booking request",
    mailFallbackEquipment: "Equipment",
    mailBody: { name: "Name", phone: "Phone", equipment: "Equipment", message: "Message" },
  },
};

export const translations: Record<Lang, Dict> = { fr, en };

export function useT(): Dict {
  return translations[useLang()];
}

/** Head (title/meta/hreflang links) for a localized page. */
export function pageHead(key: PageKey, lang: Lang) {
  const m = translations[lang].meta[key];
  return {
    meta: [
      { title: m.title },
      { name: "description", content: m.description },
      { property: "og:title", content: m.title },
      { property: "og:description", content: m.ogDescription },
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

export { EMAIL, PHONE_DISPLAY };
