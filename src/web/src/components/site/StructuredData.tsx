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
    name: "Prestige Locations",
    description:
      "Location d'équipements : machinerie, remorques et petits équipements pour vos travaux.",
    url: site,
    telephone: contact.phone,
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Wôlinak",
      addressRegion: "QC",
      addressCountry: "CA",
    },
    areaServed: { "@type": "AdministrativeArea", name: "Québec" },
  };
  if (logo) data.image = logo;

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
