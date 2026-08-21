# gogoga

An Obsidian theme that replicates the design language of
[Tolaria](https://github.com/refactoringhq/tolaria): Notion-flavored light
palette, warm charcoal dark palette, `#155DFF` accent, Inter typography, blue
list markers, and an H1-as-title layout with a divider.

> Screenshots: coming soon (`screenshots/`).

## Features

- **Two palettes** ported from Tolaria's design tokens: light
  (`#37352F` on white, `#F7F6F3` sidebar) and warm dark
  (`#E6E1D8` on `#1F1E1B`), accent `#155DFF` / `#78A4FF`
- **Editor typography**: Inter, 15px/1.5 scale, 740px measure, Tolaria's
  heading ladder (32/27/20/17) with negative letter-spacing, H1 and inline
  titles underlined by a divider
- **Details**: blue list markers, 18px checkboxes, dotted-underline
  wikilinks, accent-rail blockquotes, near-black dark code blocks, quiet
  gray property chips
- **Notebook Navigator adaptation**: full styling for the
  [Notebook Navigator](https://github.com/johansan/notebook-navigator)
  plugin's note list — edge-to-edge rows, Tolaria selection states, quiet
  tag chips — via the plugin's `--nn-theme-*` API
- **Companion plugin** [`gogoga-icons`](plugins/gogoga-icons/): swaps
  Obsidian's Lucide UI icons for Phosphor (the set Tolaria uses)

## Install

### Theme (manual)

Copy `theme.css` and `manifest.json` into
`<vault>/.obsidian/themes/gogoga/`, then select **gogoga** under
Settings → Appearance → Themes.

### Recommended setup

- Install the [Inter](https://rsms.me/inter/) font locally (the theme falls
  back to system fonts otherwise).
- Set the base font size to **15px** (Settings → Appearance) to match
  Tolaria's editor scale; heading sizes are relative to this base.
- For the three-pane Tolaria layout, install Notebook Navigator and the
  [gogoga-icons](plugins/gogoga-icons/) companion plugin.

## Development

The theme is a single hand-written `theme.css`: Tolaria's tokens
(`src/index.css`) and typography spec (`src/theme.json`) translated onto
Obsidian's CSS variable system. Section comments in the file map each block
back to its Tolaria source.

Sync helpers for working against a live vault:

```bash
scripts/dev-install.sh <vault-path>    # repo -> vault
scripts/sync-from-vault.sh <vault-path> # vault -> repo
```

## License and trademarks

Distributed under **AGPL-3.0-or-later** (see [LICENSE](LICENSE)), as a
derivative of Tolaria's design system. This project is not affiliated with
or endorsed by the Tolaria project; "Tolaria" is a trademark of its authors
and is used here only to describe provenance.
