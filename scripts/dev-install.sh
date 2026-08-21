#!/usr/bin/env bash
# Install the theme + companion plugin from this repo into a vault.
set -euo pipefail

VAULT="${1:?usage: dev-install.sh <vault-path>}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"

[ -d "$VAULT/.obsidian" ] || { echo "error: $VAULT is not an Obsidian vault"; exit 1; }

mkdir -p "$VAULT/.obsidian/themes/gogoga" "$VAULT/.obsidian/plugins/gogoga-icons"
cp "$REPO/theme.css" "$REPO/manifest.json" "$VAULT/.obsidian/themes/gogoga/"
cp "$REPO/plugins/gogoga-icons/main.js" \
   "$REPO/plugins/gogoga-icons/manifest.json" \
   "$VAULT/.obsidian/plugins/gogoga-icons/"

echo "installed into $VAULT (reload Obsidian with Cmd+R)"
