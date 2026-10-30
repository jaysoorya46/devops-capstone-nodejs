#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mkdir -p "$HOME/devops-backups"
chmod +x "$PROJECT_DIR/scripts/backup.sh" "$PROJECT_DIR/scripts/cleanup-logs.sh"

# Installs one daily backup and one weekly cleanup without duplicating existing entries.
TMP="$(mktemp)"
(crontab -l 2>/dev/null || true) | grep -v 'devops-capstone-nodejs/scripts/' > "$TMP" || true
echo "0 22 * * * $PROJECT_DIR/scripts/backup.sh >> $HOME/devops-backups/cron.log 2>&1" >> "$TMP"
echo "30 22 * * 0 $PROJECT_DIR/scripts/cleanup-logs.sh >> $HOME/devops-backups/cron.log 2>&1" >> "$TMP"
crontab "$TMP"
rm -f "$TMP"
echo "Cron installed: daily backup at 22:00; weekly cleanup Sunday at 22:30."
