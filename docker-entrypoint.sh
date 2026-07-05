#!/bin/sh
set -e
node scripts/migrate.mjs
exec node ./.output/server/index.mjs
