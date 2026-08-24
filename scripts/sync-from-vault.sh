#!/usr/bin/env bash
# Pull the live theme + plugin files from a dev vault back into this repo.
set -euo pipefail

VAULT="${1:?usage: sync-from-vault.sh <vault-path>}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"

[ -f "$VAULT/.obsidian/themes/gogoga/theme.css" ] || { echo "error: theme not found in $VAULT"; exit 1; }

cp "$VAULT/.obsidian/themes/gogoga/theme.css" \
   "$VAULT/.obsidian/themes/gogoga/manifest.json" "$REPO/"

# Companion plugins: copy whatever the vault has, skipping any that
# are not installed there.
for name in gogoga-icons gogoga-outline; do
  src="$VAULT/.obsidian/plugins/$name"
  [ -d "$src" ] || continue
  mkdir -p "$REPO/plugins/$name"
  for f in main.js manifest.json styles.css gen-icons.mjs; do
    [ -f "$src/$f" ] && cp "$src/$f" "$REPO/plugins/$name/"
  done
done

# Setup guide lives as a note in the vault; the repo copy drops the
# Obsidian frontmatter (leading --- block only, not later rules).
for candidate in "$VAULT/Obsidian 配置.md" "$VAULT/inbox/Obsidian 配置.md"; do
  [ -f "$candidate" ] || continue
  mkdir -p "$REPO/docs"
  awk 'NR==1 && $0=="---" {infm=1; next} infm && $0=="---" {infm=0; next} !infm {print}' \
    "$candidate" > "$REPO/docs/setup.md"
  break
done

echo "synced from $VAULT — review with: git -C $REPO diff"
