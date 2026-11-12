#!/usr/bin/env bash
set -Eeuo pipefail
cd "${APP_DIR:-/opt/madhavji}"
[[ -r .env.production ]] || { echo 'Missing .env.production' >&2; exit 1; }
DOMAIN="${DOMAIN:-$(sed -n 's/^DOMAIN=//p' .env.production | tail -n 1)}"
docker compose --env-file .env.production -f compose.production.yml ps
curl --fail --silent --show-error "https://${DOMAIN:?set DOMAIN}/api/health" >/dev/null
echo 'Application health check passed'
