#!/usr/bin/env bash
# Pull the live theme + plugin files from a dev vault back into this repo.
set -euo pipefail

VAULT="${1:?usage: sync-from-vault.sh <vault-path>}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"

[ -f "$VAULT/.obsidian/themes/gogoga/theme.css" ] || { echo "error: theme not found in $VAULT"; exit 1; }

cp "$VAULT/.obsidian/themes/gogoga/theme.css" \
   "$VAULT/.obsidian/themes/gogoga/manifest.json" "$REPO/"
cp "$VAULT/.obsidian/plugins/gogoga-icons/main.js" \
   "$VAULT/.obsidian/plugins/gogoga-icons/manifest.json" \
   "$VAULT/.obsidian/plugins/gogoga-icons/gen-icons.mjs" \
   "$REPO/plugins/gogoga-icons/"

echo "synced from $VAULT — review with: git -C $REPO diff"
