FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run icons && npm run build

FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache postgresql16 postgresql16-contrib su-exec \
  && mkdir -p /run/postgresql /var/lib/postgresql/data /data/audio /data/branding \
  && chown postgres:postgres /run/postgresql /var/lib/postgresql/data

ENV NODE_ENV=production
ENV PORT=2500
ENV PGDATA=/var/lib/postgresql/data
ENV POSTGRES_USER=chapel
ENV POSTGRES_PASSWORD=chapel
ENV POSTGRES_DB=chapel
ENV DATABASE_URL=postgresql://chapel:chapel@127.0.0.1:5432/chapel
ENV AUDIO_STORAGE_PATH=/data/audio
ENV BRANDING_STORAGE_PATH=/data/branding

COPY package.json package-lock.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/server/database ./server/database
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/scripts ./scripts

EXPOSE 2500

VOLUME ["/var/lib/postgresql/data", "/data/audio", "/data/branding"]

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
