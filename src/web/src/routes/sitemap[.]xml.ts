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
