// Server functions publiques — wrappers client-safe : toute l'implémentation
// serveur (BD, drizzle) est importée dynamiquement dans les handlers.
import { createServerFn } from "@tanstack/react-start";
import { staticCatalog, type CatalogData } from "@/lib/catalog";
import { DEFAULT_THEME, type ThemeConfig } from "@/lib/theme";

export const getCatalogFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<CatalogData> => {
    try {
      const [{ cached }, { loadCatalog }] = await Promise.all([
        import("./cache"),
        import("./impl/public"),
      ]);
      return await cached("catalog", 60_000, loadCatalog);
    } catch (err) {
      console.error("getCatalog: BD indisponible, catalogue statique utilisé.", err);
      return staticCatalog;
    }
  },
);

export const getThemeFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ThemeConfig> => {
    try {
      const [{ cached }, { loadTheme }] = await Promise.all([
        import("./cache"),
        import("./impl/public"),
      ]);
      return await cached("theme", 60_000, loadTheme);
    } catch (err) {
      console.error("getTheme: BD indisponible, thème par défaut utilisé.", err);
      return DEFAULT_THEME;
    }
  },
);
