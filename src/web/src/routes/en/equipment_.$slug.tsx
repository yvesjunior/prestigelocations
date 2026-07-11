import { createFileRoute, notFound } from "@tanstack/react-router";
import { CategoryPage } from "@/components/pages/CategoryPage";
import { categoryPagePath } from "@/lib/i18n";
import { BASE_URL } from "@/lib/site";
import { getCatalogFn } from "@/server/public";

export const Route = createFileRoute("/en/equipment_/$slug")({
  loader: async ({ params }) => {
    const catalog = await getCatalogFn();
    const category = catalog.categories.find((c) => c.slug === params.slug);
    if (!category) throw notFound();
    return { catalog, category };
  },
  head: ({ loaderData, params }) => ({
    meta: [
      { title: `${loaderData?.category.name.en ?? "Equipment"} | Prestige Locations` },
      { name: "description", content: loaderData?.category.pageDescription.en ?? "" },
      {
        property: "og:title",
        content: `${loaderData?.category.name.en ?? ""} | Prestige Locations`,
      },
      { property: "og:description", content: loaderData?.category.cardDescription.en ?? "" },
    ],
    links: BASE_URL
      ? [
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
  component: EnCategoryRoute,
});

function EnCategoryRoute() {
  const { slug } = Route.useParams();
  return <CategoryPage slug={slug} />;
}
