#!/usr/bin/env bash
set -Eeuo pipefail
cd "${APP_DIR:-/opt/madhavji}"
[[ -r .env.production ]] || { echo 'Missing .env.production' >&2; exit 1; }
env_value() { sed -n "s/^$1=//p" .env.production | tail -n 1; }
BACKUP_PASSPHRASE_FILE="${BACKUP_PASSPHRASE_FILE:-$(env_value BACKUP_PASSPHRASE_FILE)}"
BACKUP_S3_URI="${BACKUP_S3_URI:-$(env_value BACKUP_S3_URI)}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-$(env_value BACKUP_RETENTION_DAYS)}"
mkdir -p backups
file="backups/postgres-$(date -u +%Y%m%dT%H%M%SZ).sql.gz"
docker compose --env-file .env.production -f compose.production.yml exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip > "$file"
if [[ -n "${BACKUP_PASSPHRASE_FILE:-}" ]]; then
  [[ -r "$BACKUP_PASSPHRASE_FILE" ]] || { echo "BACKUP_PASSPHRASE_FILE is not readable" >&2; exit 1; }
  openssl enc -aes-256-cbc -pbkdf2 -salt -in "$file" -out "$file.enc" -pass "file:$BACKUP_PASSPHRASE_FILE"
  rm -f "$file"
  file="$file.enc"
fi
if [[ -n "${BACKUP_S3_URI:-}" ]]; then
  command -v aws >/dev/null || { echo "aws CLI is required for BACKUP_S3_URI" >&2; exit 1; }
  aws s3 cp "$file" "$BACKUP_S3_URI/$(basename "$file")" --only-show-errors
fi
if [[ -n "${BACKUP_RETENTION_DAYS:-}" ]]; then
  find backups -type f -name 'postgres-*.sql.gz' -mtime "+$BACKUP_RETENTION_DAYS" -delete
fi
echo "Backup created: $file"
