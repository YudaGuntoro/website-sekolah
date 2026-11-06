#!/usr/bin/env bash
set -euo pipefail
umask 077
: "${MYSQL_DEFAULTS_FILE:?Set MYSQL_DEFAULTS_FILE to a private MySQL client credentials file}"
: "${BACKUP_DIRECTORY:?Set BACKUP_DIRECTORY to a private backup directory}"
[[ -f "$MYSQL_DEFAULTS_FILE" ]] || { echo 'MySQL credentials file missing' >&2; exit 1; }
mkdir -p -- "$BACKUP_DIRECTORY"
backup_path="$BACKUP_DIRECTORY/cendekia_cms-$(date -u +%Y%m%dT%H%M%S%NZ).sql.gz"
temporary_path=$(mktemp "$BACKUP_DIRECTORY/.cendekia-backup-XXXXXX")
trap 'rm -f -- "$temporary_path"' EXIT
mysqldump --defaults-extra-file="$MYSQL_DEFAULTS_FILE" --single-transaction --routines --triggers --no-tablespaces --hex-blob --databases cendekia_cms | gzip > "$temporary_path"
gzip -t -- "$temporary_path"
[[ -s "$temporary_path" ]]
mv -n -- "$temporary_path" "$backup_path"
sha256sum -- "$backup_path" > "$backup_path.sha256"
echo "Backup completed: $backup_path"
