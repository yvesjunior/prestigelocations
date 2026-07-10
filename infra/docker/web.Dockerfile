# Build context: repository root (see infra/docker-compose.yml)
# Le dépôt est un monorepo npm workspaces (src/web + src/database).

# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY src/web/package.json src/web/
COPY src/database/package.json src/database/
RUN npm ci

COPY src ./src

# The nitro preset (node-server) is set in vite.config.ts.
ARG VITE_BASE_URL=
ENV VITE_BASE_URL=$VITE_BASE_URL
RUN npm run build -w @prestige/web

# ---- run stage ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build --chown=node:node /app/src/web/.output ./.output

USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
