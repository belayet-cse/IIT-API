# Multi-stage build: compile with full devDependencies, then assemble a
# runtime image with only production dependencies. Uses a Debian-based
# (not Alpine) image throughout so native deps (sharp, argon2) get
# prebuilt binaries matching the runtime's libc consistently.

FROM node:22-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json prisma.config.ts ./
COPY src/database/prisma ./src/database/prisma
RUN npm ci
COPY . .
RUN npm run build

# Separate stage for production-only node_modules, so the Prisma client
# (generated via postinstall) targets this exact runtime image.
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json prisma.config.ts ./
COPY src/database/prisma ./src/database/prisma
RUN npm ci --omit=dev

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/* \
  && useradd --create-home appuser
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/database/prisma ./src/database/prisma
COPY --from=builder /app/package.json /app/prisma.config.ts ./
RUN mkdir -p /app/uploads && chown -R appuser:appuser /app
USER appuser
EXPOSE 4000
CMD ["node", "dist/src/main.js"]
