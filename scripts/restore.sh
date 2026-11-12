#!/usr/bin/env bash
set -Eeuo pipefail
backup="${1:?usage: restore.sh <backup-file>}"
ROOT="${APP_DIR:-/opt/madhavji}"
[[ -r "$ROOT/.env.production" ]] || { echo 'Missing .env.production' >&2; exit 1; }
BACKUP_PASSPHRASE_FILE="${BACKUP_PASSPHRASE_FILE:-$(sed -n 's/^BACKUP_PASSPHRASE_FILE=//p' "$ROOT/.env.production" | tail -n 1)}"
[[ -f "$backup" ]] || { echo 'Backup file not found' >&2; exit 2; }
echo 'Restore replaces current database contents. Run only after making a separate backup.' >&2
if [[ "$backup" == *.enc ]]; then
  [[ -n "${BACKUP_PASSPHRASE_FILE:-}" && -r "$BACKUP_PASSPHRASE_FILE" ]] || { echo 'BACKUP_PASSPHRASE_FILE is required for encrypted backups' >&2; exit 1; }
  openssl enc -d -aes-256-cbc -pbkdf2 -in "$backup" -pass "file:$BACKUP_PASSPHRASE_FILE" | gzip -dc | docker compose --env-file "$ROOT/.env.production" -f "$ROOT/compose.production.yml" exec -T postgres sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
else
  gzip -dc "$backup" | docker compose --env-file "$ROOT/.env.production" -f "$ROOT/compose.production.yml" exec -T postgres sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
fi
