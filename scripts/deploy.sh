#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="${APP_DIR:-/opt/madhavji}"
COMPOSE="$ROOT/compose.production.yml"
ENV_FILE="$ROOT/.env.production"
cd "$ROOT"
cmd="${1:-}"
[[ -r "$ENV_FILE" ]] || { echo "Missing readable $ENV_FILE" >&2; exit 1; }
compose() { docker compose --env-file "$ENV_FILE" -f "$COMPOSE" "$@"; }
env_value() { sed -n "s/^$1=//p" "$ENV_FILE" | tail -n 1; }
GHCR_USERNAME="${GHCR_USERNAME:-$(env_value GHCR_USERNAME)}"
GHCR_TOKEN_FILE="${GHCR_TOKEN_FILE:-$(env_value GHCR_TOKEN_FILE)}"
if [[ -n "${GHCR_USERNAME:-}" && -n "${GHCR_TOKEN_FILE:-}" && -f "$GHCR_TOKEN_FILE" ]]; then
  read -r GHCR_TOKEN < "$GHCR_TOKEN_FILE"
  printf '%s' "$GHCR_TOKEN" | docker login ghcr.io --username "$GHCR_USERNAME" --password-stdin >/dev/null
  unset GHCR_TOKEN
fi
case "$cmd" in
 deploy)
   tag="${2:?usage: deploy <commit-sha>}"
   [[ "$tag" =~ ^[a-f0-9]{7,40}$ ]] || { echo 'Expected a Git commit SHA' >&2; exit 2; }
   API_REPOSITORY="${API_REPOSITORY:-$(env_value API_REPOSITORY)}"
   WEB_REPOSITORY="${WEB_REPOSITORY:-$(env_value WEB_REPOSITORY)}"
   [[ -n "$API_REPOSITORY" && -n "$WEB_REPOSITORY" ]] || { echo 'Set API_REPOSITORY and WEB_REPOSITORY in .env.production' >&2; exit 2; }
   export IMAGE_TAG="$tag" API_IMAGE="$API_REPOSITORY:$tag" WEB_IMAGE="$WEB_REPOSITORY:$tag"
   compose up -d --wait postgres redis
   "$ROOT/scripts/backup.sh"
   compose run --rm api node packages/db/node_modules/prisma/build/index.js migrate deploy --schema packages/db/prisma/schema.prisma
   compose up -d --remove-orphans
   "$ROOT/scripts/health.sh" ;;
 rollback)
   exec "$0" deploy "${2:?usage: rollback <commit-sha>}" ;;
 backup) exec "$ROOT/scripts/backup.sh" ;;
 restore) exec "$ROOT/scripts/restore.sh" "${2:?usage: restore <backup-file>}" ;;
 health) exec "$ROOT/scripts/health.sh" ;;
 logs) compose logs --tail=200 -f ;;
 *) echo 'commands: deploy <commit-sha> | rollback <commit-sha> | backup | restore <backup-file> | health | logs' >&2; exit 2 ;;
esac
