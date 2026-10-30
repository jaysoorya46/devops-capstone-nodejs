#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-$HOME/devops-backups}"
APP_NAME="${APP_NAME:-devops-capstone-app}"
mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT="$BACKUP_DIR/${APP_NAME}_logs_${STAMP}.tar.gz"

# Docker logs are captured into a dated archive. If the container is absent, exit safely.
if ! docker inspect "$APP_NAME" >/dev/null 2>&1; then
  echo "Container '$APP_NAME' not found; nothing to back up."
  exit 0
fi

docker logs --timestamps "$APP_NAME" > "$BACKUP_DIR/${APP_NAME}_${STAMP}.log"
tar -czf "$OUT" -C "$BACKUP_DIR" "${APP_NAME}_${STAMP}.log"
rm -f "$BACKUP_DIR/${APP_NAME}_${STAMP}.log"
echo "Backup created: $OUT"
