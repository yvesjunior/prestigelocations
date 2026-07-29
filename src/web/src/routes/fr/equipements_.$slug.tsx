import { createFileRoute, notFound } from "@tanstack/react-router";
import { CategoryPage } from "@/components/pages/CategoryPage";
import { categoryPagePath } from "@/lib/i18n";
import { categoryPageLd, ldMeta } from "@/lib/seo";
import { BASE_URL } from "@/lib/site";
import { getCatalogFn, getPricingFn } from "@/server/public";

export const Route = createFileRoute("/fr/equipements_/$slug")({
  loader: async ({ params }) => {
    const [catalog, pricing] = await Promise.all([getCatalogFn(), getPricingFn()]);
    const category = catalog.categories.find((c) => c.slug === params.slug);
    if (!category) throw notFound();
    return { catalog, category, pricing };
  },
  head: ({ loaderData, params }) => ({
    meta: [
      ...(loaderData
        ? categoryPageLd(
            loaderData.catalog,
            loaderData.category,
            "fr",
            loaderData.pricing.showDailyPrice,
          ).map(ldMeta)
        : []),
      { title: `${loaderData?.category.name.fr ?? "Équipements"} | Prestige Locations` },
      { name: "description", content: loaderData?.category.pageDescription.fr ?? "" },
      {
        property: "og:title",
        content: `${loaderData?.category.name.fr ?? ""} | Prestige Locations`,
      },
      { property: "og:description", content: loaderData?.category.cardDescription.fr ?? "" },
      { property: "og:locale", content: "fr_CA" },
      { property: "og:locale:alternate", content: "en_CA" },
      ...(BASE_URL
        ? [{ property: "og:url", content: `${BASE_URL}${categoryPagePath(params.slug, "fr")}` }]
        : []),
    ],
    links: BASE_URL
      ? [
          {
            rel: "canonical",
            href: `${BASE_URL}${categoryPagePath(params.slug, "fr")}`,
          },
          {
            rel: "alternate",
            hrefLang: "fr",
            href: `${BASE_URL}${categoryPagePath(params.slug, "fr")}`,
          },
          {
            rel: "alternate",
            hrefLang: "en",
            href: `${BASE_URL}${categoryPagePath(params.slug, "en")}`,
          },
          {
            rel: "alternate",
            hrefLang: "x-default",
            href: `${BASE_URL}${categoryPagePath(params.slug, "fr")}`,
          },
        ]
      : [],
  }),
  component: FrCategoryRoute,
});

function FrCategoryRoute() {
  const { slug } = Route.useParams();
  return <CategoryPage slug={slug} />;
}
