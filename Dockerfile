FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=2500
ENV AUDIO_STORAGE_PATH=/data/audio

RUN mkdir -p /data/audio

COPY package.json package-lock.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/server/database ./server/database
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/scripts ./scripts

EXPOSE 2500

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
