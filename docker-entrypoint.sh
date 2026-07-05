#!/bin/sh
set -e

PGDATA="${PGDATA:-/var/lib/postgresql/data}"
POSTGRES_USER="${POSTGRES_USER:-chapel}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-chapel}"
POSTGRES_DB="${POSTGRES_DB:-chapel}"

export DATABASE_URL="${DATABASE_URL:-postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@127.0.0.1:5432/${POSTGRES_DB}}"

shutdown() {
  if [ -n "$NODE_PID" ]; then
    kill -TERM "$NODE_PID" 2>/dev/null || true
    wait "$NODE_PID" 2>/dev/null || true
  fi
  if [ -d "$PGDATA" ] && su-exec postgres pg_ctl -D "$PGDATA" status >/dev/null 2>&1; then
    su-exec postgres pg_ctl -D "$PGDATA" -m fast -w stop || true
  fi
  exit 0
}

trap shutdown TERM INT

if [ ! -s "$PGDATA/PG_VERSION" ]; then
  echo "[CHAPEL] Initializing PostgreSQL..."
  mkdir -p "$PGDATA"
  chown postgres:postgres "$PGDATA"
  su-exec postgres initdb -D "$PGDATA" --auth-local=trust --auth-host=scram-sha-256

  su-exec postgres pg_ctl -D "$PGDATA" -o "-c listen_addresses=''" -w start

  su-exec postgres psql -v ON_ERROR_STOP=1 --username postgres <<-EOSQL
		CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';
		CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER};
		GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};
EOSQL

  su-exec postgres pg_ctl -D "$PGDATA" -m fast -w stop
fi

echo "[CHAPEL] Starting PostgreSQL..."
su-exec postgres pg_ctl -D "$PGDATA" -o "-c listen_addresses='127.0.0.1'" -w start

until su-exec postgres pg_isready -q -d "$POSTGRES_DB"; do
  sleep 1
done

echo "[CHAPEL] Running migrations..."
node scripts/migrate.mjs

echo "[CHAPEL] Starting application..."
node ./.output/server/index.mjs &
NODE_PID=$!
wait "$NODE_PID"
