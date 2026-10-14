#!/usr/bin/env bash
# Install the theme + companion plugin from this repo into a vault.
set -euo pipefail

VAULT="${1:?usage: dev-install.sh <vault-path>}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
# Companion plugins live in sibling repos under ../plugins/.
PLUGINS="$(cd "$REPO/../plugins" && pwd)"

[ -d "$VAULT/.obsidian" ] || { echo "error: $VAULT is not an Obsidian vault"; exit 1; }

mkdir -p \
  "$VAULT/.obsidian/themes/gogoga" \
  "$VAULT/.obsidian/plugins/gogoga-icons" \
  "$VAULT/.obsidian/plugins/gogoga-outline" \
  "$VAULT/.obsidian/plugins/gogoga-youtube"
cp "$REPO/theme.css" "$REPO/manifest.json" "$VAULT/.obsidian/themes/gogoga/"
cp "$PLUGINS/gogoga-icons/main.js" \
   "$PLUGINS/gogoga-icons/manifest.json" \
   "$VAULT/.obsidian/plugins/gogoga-icons/"
cp "$PLUGINS/gogoga-outline/main.js" \
   "$PLUGINS/gogoga-outline/manifest.json" \
   "$PLUGINS/gogoga-outline/styles.css" \
   "$VAULT/.obsidian/plugins/gogoga-outline/"
cp "$PLUGINS/gogoga-youtube/main.js" \
   "$PLUGINS/gogoga-youtube/manifest.json" \
   "$PLUGINS/gogoga-youtube/styles.css" \
   "$VAULT/.obsidian/plugins/gogoga-youtube/"

echo "installed into $VAULT (reload Obsidian with Cmd+R)"
