# gogoga outline

A heading rail pinned to the edge of the editor, in the style of Codex's
document navigator. Companion to the [gogoga](../../) theme, but it depends
on nothing from the theme and works anywhere.

## What it does

- **At rest**: a column of identical short dashes, one per heading. The dash
  for the section you are currently reading is accent-colored.
- **On hover**: a dock-style wave. Each dash grows by a gaussian falloff of
  its distance to the cursor, so the crest follows the pointer continuously
  rather than snapping between items.
- **Preview**: the section under the crest shows a card with its heading and
  the opening lines of that section, markdown stripped. The card slides
  along as the crest moves.
- **Click**: scrolls to that heading.

One rail per open markdown pane; rails follow pane splits and close with
them.

## Settings

Side (left/right), minimum heading count before the rail appears, and
whether hovering shows the preview card.

## Notes on scrolling behavior

Editing mode always scrolls smoothly: CodeMirror can report a pixel offset
for any line, rendered or not.

Reading mode is virtualized — sections scroll out of the DOM entirely — so
the plugin scrolls smoothly when the target heading is currently rendered
and falls back to Obsidian's line-based `applyScroll` (an instant jump) when
it is not. Nearby headings therefore glide and distant ones jump. Current-
section tracking in reading mode uses `getScroll()`, which is line-based and
unaffected by virtualization.

## Tuning

The wave constants sit at the top of `main.js`: `BASE_W` (dash length at
rest), `MAX_EXTRA` (added length at the crest), `SIGMA` (falloff radius in
px), and their height counterparts.

## License

AGPL-3.0-or-later, alongside the gogoga theme.
