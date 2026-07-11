import { defineConfig, loadEnv } from "vite";
import { fileURLToPath } from "node:url";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Le .env vit à la racine du dépôt (voir TASK.md > Environnements) : on y lit
// les VITE_* (client) et on hydrate process.env pour les server functions en dev
// (DATABASE_URL, IMAGEKIT_*). Les variables déjà présentes dans l'environnement
// gardent la priorité.
const envDir = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig(({ command, mode }) => {
  const fileEnv = loadEnv(mode, envDir, "");
  for (const [key, value] of Object.entries(fileEnv)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
  return {
    envDir,
    server: { host: "::", port: 8080 },
    plugins: [
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tailwindcss(),
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      tanstackStart({ server: { entry: "server" } }),
      // The nitro plugin only participates in builds; `node-server` produces .output/server/index.mjs.
      ...(command === "build" ? [nitro({ preset: "node-server" })] : []),
      viteReact(),
    ],
  };
});
