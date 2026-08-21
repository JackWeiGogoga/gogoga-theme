# gogoga icons

Companion plugin for the [gogoga](../../) Obsidian theme. It replaces ~110 of
Obsidian's built-in Lucide UI icons with [Phosphor Icons](https://phosphoricons.com/)
(regular weight) — the icon set used by Tolaria — via Obsidian's `addIcon()` API.

## Install

Copy `main.js` and `manifest.json` into
`<vault>/.obsidian/plugins/gogoga-icons/`, then enable the plugin in
Settings → Community plugins (requires restricted mode off).

## Development

`main.js` is generated — do not edit it by hand. The mapping table lives in
`gen-icons.mjs` (`MAP`: Obsidian/Lucide icon id → Phosphor icon name). To
change or extend it:

```bash
npm install
npm run generate
```

The generator reads SVGs from `@phosphor-icons/core` (regular weight),
rescales them from Phosphor's 256 grid to Obsidian's 100 grid, and registers
them over the built-in icon ids (both bare and `lucide-`-prefixed).

Disabling the plugin restores the original icons after an app reload
(`addIcon` has no unregister API).

## Licenses

Phosphor Icons are MIT licensed. This plugin is distributed under
AGPL-3.0-or-later alongside the gogoga theme.
