FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts prisma7.config.ts ./
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
COPY public ./public

# prisma generate reads prisma7.config.ts, which requires DATABASE_URL.
# A placeholder is enough; the real URL is injected at container start.
ARG DATABASE_URL=postgresql://prisma:prisma@localhost:5432/prisma
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate
RUN npm run build
RUN mkdir -p dist/generated && cp -r generated/prisma dist/generated/prisma

FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat \
  && addgroup -S app && adduser -S app -G app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts prisma7.config.ts ./
RUN npm ci --omit=dev && npm install prisma@7.10.0 --omit=dev \
  && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/public ./public
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh && chown -R app:app /app

USER app
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
