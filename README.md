# gogoga

**English** | [简体中文](https://github.com/JackWeiGogoga/gogoga-theme/blob/main/README.zh-CN.md)

![gogoga in light and dark mode](https://raw.githubusercontent.com/JackWeiGogoga/gogoga-theme/main/screenshots/preview.png)

An Obsidian theme that replicates the design language of
[Tolaria](https://github.com/refactoringhq/tolaria): Notion-flavored light
palette, warm charcoal dark palette, `#155DFF` accent, Inter typography, blue
list markers, and an H1-as-title layout with a divider.

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
- **Companion plugins**:
  [`gogoga-icons`](https://github.com/JackWeiGogoga/gogoga-icons) swaps Obsidian's Lucide UI icons
  for Phosphor (the set Tolaria uses), and
  [`gogoga-outline`](https://github.com/JackWeiGogoga/gogoga-outline) pins a Codex-style heading rail
  to the edge of the editor — dashes that rise in a dock-like wave under the
  cursor, with section previews and click-to-scroll.
  [`gogoga-youtube`](https://github.com/JackWeiGogoga/gogoga-youtube) manages grouped YouTube channel
  subscriptions, recent uploads, read state, and opt-in video notes using
  public RSS feeds, with a generated native Bases view.
- **Style Settings support**: accent and inline-code colors (per light/dark),
  body font, text measure, and table column floor, plus opt-in toggles to hide
  the H1 divider, use one bullet shape at every nesting level, and fall back to
  the system's font rendering. Every toggle is off by default, so the theme
  keeps its intended look without the plugin. Option labels follow Obsidian's
  language: English, or Simplified Chinese when Obsidian is set to Chinese.

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
  [gogoga-icons](https://github.com/JackWeiGogoga/gogoga-icons) companion plugin.

### Full setup guide

[docs/setup.md](https://github.com/JackWeiGogoga/gogoga-theme/blob/main/docs/setup.md) (Chinese) walks through building a whole vault
around this theme from scratch: core-plugin choices, folder layout, Notebook
Navigator settings, Templater automation for auto-populated properties, daily
notes with date subfolders, plus the non-obvious gotchas found along the way.

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

## Support

gogoga is free and open source. If this theme helps you, you can support its development on [afdian (爱发电)](https://afdian.com/a/jackweigogoga). Obsidian also shows a support button for it in the community directory. Bug reports and ideas help just as much.

## License and trademarks

Distributed under **AGPL-3.0-or-later** (see [LICENSE](https://github.com/JackWeiGogoga/gogoga-theme/blob/main/LICENSE)), as a
derivative of Tolaria's design system. This project is not affiliated with
or endorsed by the Tolaria project; "Tolaria" is a trademark of its authors
and is used here only to describe provenance.
