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

# Setup guide lives as a note in the vault; the repo copy drops the
# Obsidian frontmatter (leading --- block only, not later rules).
GUIDE="$VAULT/Obsidian 配置.md"
if [ -f "$GUIDE" ]; then
  mkdir -p "$REPO/docs"
  awk 'NR==1 && $0=="---" {infm=1; next} infm && $0=="---" {infm=0; next} !infm {print}' \
    "$GUIDE" > "$REPO/docs/setup.md"
fi

echo "synced from $VAULT — review with: git -C $REPO diff"
