# ==========================================================
# CED Web — Production Dockerfile
# Approach: next build + next start (mirrors local behavior)
# ==========================================================

FROM node:22-alpine AS base

# ----------------------------------------------------------
# Stage 1: Install dependencies (cached layer)
# ----------------------------------------------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# ----------------------------------------------------------
# Stage 2: Build the application
# ----------------------------------------------------------
FROM base AS builder
WORKDIR /app

# Bring in installed dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy entire source (respects .dockerignore)
COPY . .

# Dummy value so the build passes "Collecting page data" step
# Overridden at runtime by docker-compose env_file
ENV MONGODB_URI="mongodb://placeholder:27017/build_only"

RUN npm run build

# ----------------------------------------------------------
# Stage 3: Production runner — mirrors `npm run start`
# ----------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3006
ENV HOSTNAME="0.0.0.0"

# --- Copy everything `next start` needs ---
# package.json  → npm run start script
# next.config.ts → basePath, images, headers, redirects
# node_modules  → next binary + all runtime deps
# .next         → compiled build output
# public        → static assets (images, robots.txt, etc.)
# messages      → next-intl translation JSON files
COPY --from=builder /app/package.json      ./package.json
COPY --from=builder /app/next.config.ts    ./next.config.ts
COPY --from=builder /app/node_modules      ./node_modules
COPY --from=builder /app/.next             ./.next
COPY --from=builder /app/public            ./public
COPY --from=builder /app/messages          ./messages
COPY --from=builder /app/src/i18n          ./src/i18n

EXPOSE 3006

# `next start` reads PORT env and handles basePath for
# static files automatically — no manual folder hacks needed.
CMD ["npm", "run", "start"]