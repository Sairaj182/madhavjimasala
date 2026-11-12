FROM node:22.14-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/auth/package.json packages/auth/package.json
COPY packages/db/package.json packages/db/package.json
RUN pnpm install --frozen-lockfile --prod=false
COPY packages/db packages/db
RUN pnpm exec prisma generate --schema packages/db/prisma/schema.prisma
COPY packages/auth packages/auth
COPY apps/api apps/api
RUN pnpm --filter api build

FROM base AS runtime
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S -G app app
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build --chown=app:app /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=app:app /app/packages/db ./packages/db
COPY --from=build --chown=app:app /app/packages/auth ./packages/auth
USER app
EXPOSE 4000
CMD ["node", "apps/api/dist/index.cjs"]
