# Build context must be the monorepo root: docker build -f apps/api/Dockerfile .
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json ./apps/api/
COPY packages/auth/package.json ./packages/auth/
COPY packages/database/package.json ./packages/database/
COPY packages/rbac/package.json ./packages/rbac/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile
# Generate Prisma client — needs schema only, no DB connection required
COPY packages/database/prisma ./packages/database/prisma
COPY packages/database/prisma.config.ts ./packages/database/prisma.config.ts
RUN pnpm --filter @repo/database run db:generate

# Migrate stage — run DB migrations without starting the API
# Used by deploy.sh: docker build --target migrate && docker run --rm --env-file .env
FROM deps AS migrate
WORKDIR /app/packages/database
CMD ["node_modules/.bin/prisma", "migrate", "deploy"]

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Fonts required by sharp/librsvg for SVG text rendering.
# fc-cache -f builds the fontconfig cache so librsvg can find the fonts at runtime.
RUN apk add --no-cache fontconfig ttf-dejavu font-noto \
    && fc-cache -f

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 apiuser

COPY --from=deps --chown=apiuser:nodejs /app/node_modules ./node_modules
# pnpm v9 puts workspace package binaries in their own node_modules, not root
COPY --from=deps --chown=apiuser:nodejs /app/apps/api/node_modules ./apps/api/node_modules
# @prisma/client lives in packages/database/node_modules (pnpm strict isolation)
COPY --from=deps --chown=apiuser:nodejs /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps --chown=apiuser:nodejs /app/packages/database/generated ./packages/database/generated
# package.json files are required so Node can resolve subpath exports (e.g. @repo/auth/server)
COPY --chown=apiuser:nodejs packages/database/package.json ./packages/database/package.json
COPY --chown=apiuser:nodejs packages/auth/package.json ./packages/auth/package.json
COPY --chown=apiuser:nodejs packages/rbac/package.json ./packages/rbac/package.json
COPY --chown=apiuser:nodejs packages/database/src ./packages/database/src
COPY --chown=apiuser:nodejs packages/auth/src ./packages/auth/src
COPY --chown=apiuser:nodejs packages/rbac/src ./packages/rbac/src
COPY --chown=apiuser:nodejs apps/api/src ./apps/api/src
# Ticket assets and generated-ticket storage directory
COPY --chown=apiuser:nodejs apps/api/src/assets ./apps/api/src/assets
RUN mkdir -p /app/apps/api/tickets && chown apiuser:nodejs /app/apps/api/tickets

USER apiuser
EXPOSE 4000
ENV PORT=4000

CMD ["apps/api/node_modules/.bin/tsx", "apps/api/src/index.ts"]
