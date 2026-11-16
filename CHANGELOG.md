# Changelog

All notable changes to gogoga theme are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/). 中文版见 [CHANGELOG.zh-CN.md](CHANGELOG.zh-CN.md).

## [Unreleased]

## [0.3.0] - 2026-11-16

### Added (#2, suggested by pinery-sls; all in Style Settings, off by default)
- **Heading colors**: a "Heading palette" (Rainbow, Ocean, Forest, Sunset) gives each heading level its own color, with a matching set for dark mode; a color set for a single level wins over the palette.
- **Colorful emphasis**: italic and bold italic get their own text colors, and highlights that are also italic, bold or both get their own backgrounds (pink, green, blue). All five colors can be changed; the italic color under Colors wins when set.
- **Tasks and lists**:
  - "Checkbox shape": square or round.
  - "More task states": 21 markers such as `- [>]` `- [<]` `- [!]` `- [-]` `- [/]` `- [?]` `- [*]` each show their own icon and color (Phosphor icons) instead of a plain check; `- [-]` is struck through like `- [x]`, the others aren't.
  - "Rainbow indent lines": each nesting level of a list draws its guide line in its own color.
- **File explorer** (Obsidian's own file explorer only):
  - "File type icons" for notes, images, PDF, audio, video, canvas, Bases, code and archives.
  - "Folder icon color": gray, accent color, or rainbow (top-level folders take turns, subfolders follow their parent).
- **Properties text size** (under Typography) for property names, values and "Add property"; 12px by default as before.

### Fixed
- With both heading level markers and editor line numbers on, the H1/H2 tags sat on top of the line numbers (#2). With line numbers on, the tag now sits between the numbers and the text, and gives way to the fold arrow when the mouse is over the heading.

## [0.2.1] - 2026-11-15

### Fixed
- Task checkboxes in a side pane are no longer cut off on the left. At the smaller side-pane font size the box stuck out past the list edge, and inside a live-preview query block (Tasks, Dataview) its left border was clipped. Task items now always leave room for the checkbox; the main editor looks the same.

## [0.2.0] - 2026-11-09

### Added
- **Highlighter notes** in Style Settings (each item off by default): the note title and H1 on a solid marker block; a highlighter stroke across the lower half of H2 and H3; `==highlights==` with slanted ends like a real highlighter (colored highlights keep their colors); `<u>underline</u>` as a thick marker line, including underlines in gogoga Mind Map nodes; strikethrough as gray text with a red line. Plus one highlighter color for all of them, light and dark.

## [0.1.7] - 2026-10-28

### Added
- Heading color (H1–H6) and italic color in Style Settings, per light/dark mode; unset keeps the current look.

## [0.1.6] - 2026-10-28

### Added
- Bold text options in Style Settings: style (classic, accent color, highlighter), bold color, weight and stroke. The default look is unchanged.

## [0.1.5] - 2026-10-22

### Added
- Its own color for the hover line highlight.
- Heading level markers that show H1–H6 beside headings.
- Body text weight setting.
- Tolaria-style look for the core file explorer.

### Changed
- Clearer descriptions for the accent hover and font rendering options.

## [0.1.4] - 2026-10-21

### Added
- Style Settings toggles for highlighting the line under the mouse and for focus mode.
- Both can also be turned on per note (cssclasses) or globally with the bundled CSS snippets, without any plugin.

## [0.1.3] - 2026-10-20

### Changed
- The accent follows Obsidian's accent color setting instead of a fixed blue.

## [0.1.2] - 2026-10-18

### Added
- Funding link.

## [0.1.1] - 2026-10-15

### Added
- Style Settings labels in English and Simplified Chinese, following Obsidian's language.
- English README with a Simplified Chinese translation.

## [0.1.0] - 2026-10-14

First public release.

### Added
- Light and dark palettes after Tolaria's design language, with three surface tiers.
- Tolaria-style nested bullets, heading rhythm, adaptive tables and quiet tag chips.
- Matching styles for Notebook Navigator and the properties side panel.
- Style Settings: accent and inline code colors, body font, line width, table column floor, and opt-in toggles to hide the H1 divider, use one bullet shape, and use the system font rendering.

[Unreleased]: https://github.com/JackWeiGogoga/gogoga-theme/compare/0.3.0...HEAD
[0.3.0]: https://github.com/JackWeiGogoga/gogoga-theme/compare/0.2.1...0.3.0
[0.2.1]: https://github.com/JackWeiGogoga/gogoga-theme/compare/0.2.0...0.2.1
[0.2.0]: https://github.com/JackWeiGogoga/gogoga-theme/compare/0.1.7...0.2.0
[0.1.7]: https://github.com/JackWeiGogoga/gogoga-theme/compare/0.1.6...0.1.7
[0.1.6]: https://github.com/JackWeiGogoga/gogoga-theme/compare/0.1.5...0.1.6
[0.1.5]: https://github.com/JackWeiGogoga/gogoga-theme/compare/0.1.4...0.1.5
[0.1.4]: https://github.com/JackWeiGogoga/gogoga-theme/compare/0.1.3...0.1.4
[0.1.3]: https://github.com/JackWeiGogoga/gogoga-theme/compare/0.1.2...0.1.3
[0.1.2]: https://github.com/JackWeiGogoga/gogoga-theme/compare/0.1.1...0.1.2
[0.1.1]: https://github.com/JackWeiGogoga/gogoga-theme/compare/0.1.0...0.1.1
[0.1.0]: https://github.com/JackWeiGogoga/gogoga-theme/releases/tag/0.1.0
