import { BASE_URL } from "@/lib/site";
import { useContact } from "@/lib/useContact";
import { useBranding } from "@/lib/useBranding";
import { imageUrl } from "@/lib/images";

/**
 * Données structurées JSON-LD (schema.org LocalBusiness) — aide Google à
 * comprendre l'entreprise (nom, coordonnées, région) pour un meilleur
 * référencement / des résultats enrichis. Téléphone et courriel viennent de la
 * BD (coordonnées éditables dans l'admin). Adresse civique et horaires omis tant
 * qu'ils ne sont pas fournis (à compléter plus tard).
 */
export function StructuredData() {
  const contact = useContact();
  const { logoKey } = useBranding();
  const site = BASE_URL || "https://prestigelocations.ca";
  const logo = imageUrl(logoKey, { w: 512 });

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    // Type précis « location d'équipement » (schema.org n'en définit pas).
    additionalType: "http://www.productontology.org/id/Equipment_rental",
    name: "Prestige Locations",
    description:
      "Location d'équipements pour construction, excavation, terrassement et aménagement : " +
      "mini-pelle, tracteur compact, remorques (dompeur, fermée, plateforme), compacteurs, " +
      "scies à béton et petits outils. À la journée, à la semaine ou au mois, avec livraison.",
    keywords:
      "location d'équipement, location d'outils, construction, excavation, mini-pelle, " +
      "remorque, compacteur, terrassement, Centre-du-Québec, equipment rental, tool rental",
    url: site,
    telephone: contact.phone,
    email: contact.email,
    currenciesAccepted: "CAD",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Wôlinak",
      addressRegion: "QC",
      addressCountry: "CA",
    },
    // Villes principales du rayon de service (livraison « dans tout le
    // Centre-du-Québec » — voir la page Services). À confirmer avec le client.
    areaServed: [
      { "@type": "AdministrativeArea", name: "Centre-du-Québec" },
      { "@type": "City", name: "Wôlinak" },
      { "@type": "City", name: "Bécancour" },
      { "@type": "City", name: "Nicolet" },
      { "@type": "City", name: "Trois-Rivières" },
      { "@type": "City", name: "Drummondville" },
      { "@type": "City", name: "Victoriaville" },
    ],
    // Horaires 8h–18h, lun.–sam. (hypothèse — à ajuster si 7j/7 ou autre).
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "18:00",
    },
  };
  if (logo) data.image = logo;

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
