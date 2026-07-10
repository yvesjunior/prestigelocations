# Build context: repository root (see infra/docker-compose.yml)

# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app

COPY src/web/package.json src/web/package-lock.json ./
RUN npm ci

COPY src/web ./

# The Lovable vite config targets Cloudflare Workers by default; force the Node server preset.
ENV NITRO_PRESET=node-server
ARG VITE_BASE_URL=
ENV VITE_BASE_URL=$VITE_BASE_URL
RUN npm run build

# ---- run stage ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build --chown=node:node /app/.output ./.output

USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
