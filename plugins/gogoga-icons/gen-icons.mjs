// Generate gogoga-icons main.js from Phosphor regular SVGs.
// Mapping: Obsidian/Lucide icon id -> Phosphor icon file name (regular weight).
// Run `npm install` first (pulls @phosphor-icons/core), then `npm run generate`.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const CANDIDATES = [
  new URL("./node_modules/@phosphor-icons/core/assets/regular/", import.meta.url).pathname,
  new URL("./package/assets/regular/", import.meta.url).pathname, // extracted `npm pack` fallback
];
const ASSETS = CANDIDATES.find((p) => existsSync(p));
if (!ASSETS) {
  console.error("Phosphor assets not found — run `npm install` first.");
  process.exit(1);
}

// value: phosphor name, or { name, mirror: true } to flip horizontally
const MAP = {
  // navigation & chrome
  "search": "magnifying-glass",
  "x": "x",
  "plus": "plus",
  "minus": "minus",
  "check": "check",
  "chevron-right": "caret-right",
  "chevron-down": "caret-down",
  "chevron-left": "caret-left",
  "chevron-up": "caret-up",
  "chevrons-up-down": "caret-up-down",
  "more-horizontal": "dots-three",
  "more-vertical": "dots-three-vertical",
  "menu": "list",
  "settings": "gear",
  "sliders-horizontal": "sliders-horizontal",
  "x-circle": "x-circle",
  "plus-circle": "plus-circle",
  // legacy collapse triangle: points down expanded, rotated -90deg collapsed
  "right-triangle": "caret-down",

  // files & folders
  "folder": "folder",
  "folder-open": "folder-open",
  "folder-closed": "folder",
  "folder-plus": "folder-plus",
  "file": "file",
  "file-text": "file-text",
  "files": "files",
  "file-plus": "file-plus",
  "file-plus-2": "file-plus",
  "file-search": "file-magnifying-glass",
  "file-x": "file-x",
  "file-code": "file-code",

  // views & panes
  "book-open": "book-open",
  "pencil": "pencil-simple",
  "pencil-line": "pencil-simple-line",
  "edit": "pencil-simple",
  "edit-2": "pencil-simple",
  "edit-3": "pencil-simple-line",
  "panel-left": "sidebar-simple",
  "panel-right": { name: "sidebar-simple", mirror: true },
  "layout-grid": "squares-four",

  // actions
  "copy": "copy",
  "clipboard-list": "clipboard-text",
  "trash": "trash",
  "trash-2": "trash",
  "star": "star",
  "bookmark": "bookmark-simple",
  "link": "link",
  "link-2": "link-simple",
  "unlink": "link-break",
  "external-link": "arrow-square-out",
  "download": "download-simple",
  "upload": "upload-simple",
  "share-2": "share-network",
  "pin": "push-pin",
  "pin-off": "push-pin-slash",
  "filter": "funnel",
  "refresh-cw": "arrows-clockwise",
  "refresh-ccw": "arrows-counter-clockwise",
  "rotate-ccw": "arrow-counter-clockwise",
  "undo-2": "arrow-u-up-left",
  "redo-2": "arrow-u-up-right",
  "save": "floppy-disk",

  // arrows
  "arrow-left": "arrow-left",
  "arrow-right": "arrow-right",
  "arrow-up": "arrow-up",
  "arrow-down": "arrow-down",
  "arrow-up-right": "arrow-up-right",

  // info & status
  "info": "info",
  "alert-triangle": "warning",
  "alert-circle": "warning-circle",
  "help-circle": "question",
  "bell": "bell",
  "eye": "eye",
  "eye-off": "eye-slash",
  "lock": "lock-simple",
  "clock": "clock",
  "history": "clock-counter-clockwise",
  "calendar": "calendar-blank",
  "calendar-days": "calendar-dots",

  // content & formatting
  "hash": "hash",
  "tag": "tag",
  "align-left": "text-align-left",
  "check-square": "check-square",
  "toggle-left": "toggle-left",
  "binary": "hash",
  "image": "image",
  "table": "table",
  "quote": "quotes",
  "list": "list-bullets",
  "list-ordered": "list-numbers",
  "list-checks": "list-checks",
  "code": "code",
  "code-2": "code",
  "terminal": "terminal",
  "terminal-square": "terminal-window",
  "bold": "text-b",
  "italic": "text-italic",
  "strikethrough": "text-strikethrough",
  "underline": "text-underline",
  "highlighter": "highlighter",
  "sticky-note": "note",

  // misc
  "home": "house",
  "globe": "globe",
  "palette": "palette",
  "puzzle": "puzzle-piece",
  "wrench": "wrench",
  "keyboard": "keyboard",
  "sun": "sun",
  "moon": "moon",
  "git-fork": "git-fork",
  "git-branch": "git-branch",
  "paperclip": "paperclip",
  "command": "command",
};

const icons = {};
const missing = [];
for (const [id, spec] of Object.entries(MAP)) {
  const { name, mirror } = typeof spec === "string" ? { name: spec } : spec;
  const path = `${ASSETS}${name}.svg`;
  if (!existsSync(path)) { missing.push(`${id} -> ${name}`); continue; }
  let body = readFileSync(path, "utf8")
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>[\s\S]*$/, "")
    .replace(/<rect width="256" height="256" fill="none"\s*\/>/g, "")
    .trim();
  icons[id] = (mirror ? "M|" : "") + body;
}

const out = `'use strict';
/* gogoga-icons — replaces Obsidian's built-in Lucide icons with Phosphor
 * (regular weight), the icon set used by Tolaria. Generated file; the
 * mapping lives in gen-icons.mjs. Phosphor Icons are MIT licensed. */
const { Plugin, addIcon } = require('obsidian');

// Phosphor draws on a 256 grid; Obsidian custom icons use a 100 grid.
const SCALE = 'scale(0.390625)';
const MIRROR = 'translate(100 0) scale(-0.390625 0.390625)';

const ICONS = ${JSON.stringify(icons, null, 0)};

module.exports = class GogogaIcons extends Plugin {
  onload() {
    for (const [id, raw] of Object.entries(ICONS)) {
      const mirrored = raw.startsWith('M|');
      const body = mirrored ? raw.slice(2) : raw;
      const content = '<g transform="' + (mirrored ? MIRROR : SCALE) +
        '" fill="currentColor" stroke="none">' + body + '</g>';
      addIcon(id, content);
      addIcon('lucide-' + id, content);
    }
  }
  // Built-in icons are restored when the app reloads; addIcon has no
  // unregister API, so onunload intentionally does nothing.
  onunload() {}
};
`;

writeFileSync(new URL("./main.js", import.meta.url).pathname, out);
console.log(`generated ${Object.keys(icons).length} icons`);
if (missing.length) console.log("MISSING:\n  " + missing.join("\n  "));
