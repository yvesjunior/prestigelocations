import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { BASE_URL } from "@/lib/site";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/fr", changefreq: "weekly", priority: "1.0" },
          { path: "/fr/equipements", changefreq: "weekly", priority: "0.9" },
          { path: "/fr/services", changefreq: "monthly", priority: "0.8" },
          { path: "/fr/a-propos", changefreq: "monthly", priority: "0.6" },
          { path: "/fr/contact", changefreq: "monthly", priority: "0.8" },
          { path: "/en", changefreq: "weekly", priority: "1.0" },
          { path: "/en/equipment", changefreq: "weekly", priority: "0.9" },
          { path: "/en/services", changefreq: "monthly", priority: "0.8" },
          { path: "/en/about", changefreq: "monthly", priority: "0.6" },
          { path: "/en/contact", changefreq: "monthly", priority: "0.8" },
        ];

        // Pages de catégories (BD). BD indisponible → sitemap sans elles,
        // plutôt qu'une erreur 500.
        try {
          const [{ cached }, { loadCatalog }] = await Promise.all([
            import("@/server/cache"),
            import("@/server/impl/public"),
          ]);
          const catalog = await cached("catalog", 60_000, loadCatalog);
          for (const c of catalog.categories) {
            entries.push(
              { path: `/fr/equipements/${c.slug}`, changefreq: "weekly", priority: "0.8" },
              { path: `/en/equipment/${c.slug}`, changefreq: "weekly", priority: "0.8" },
            );
          }
        } catch (err) {
          console.error("sitemap : catégories ignorées (BD indisponible).", err);
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
