'use strict';
/* gogoga-outline — a Codex-style heading rail on the edge of the editor.
 * At rest the rail is a column of identical short dashes. Moving the
 * mouse along it raises a dock-like wave: each dash grows by a gaussian
 * falloff of its distance to the cursor, and a preview card (heading +
 * first lines of the section) slides along with the crest.
 *
 * Resting the pointer on the rail unfolds the whole outline beside it,
 * indented by heading level. The rail itself does not move — the panel
 * is a plain flyout — so nothing shifts out from under the cursor and
 * a 50-heading document behaves the same as a 5-heading one.
 * Companion to the gogoga theme. */

const { Plugin, MarkdownView, PluginSettingTab, Setting } = require('obsidian');

// Obsidian exposes the CodeMirror 6 packages to plugins. We only need
// EditorView.scrollIntoView; fall back to the instance's constructor if
// a build ever stops re-exporting the module.
let EditorView = null;
try {
  EditorView = require('@codemirror/view').EditorView;
} catch (e) {
  EditorView = null;
}

const DEFAULTS = {
  side: 'right',
  minHeadings: 2,
  showPreview: true,
  previewChars: 140,
  expandMode: 'dwell', // 'dwell' | 'hotkey'
  dwellDelay: 800,
  panelWidth: 240,
  panelMaxLevel: 6,
};

/* Wave geometry */
const BASE_W = 12;   // dash width at rest
const MAX_EXTRA = 34; // extra width at the crest
const BASE_H = 2;
const MAX_EXTRA_H = 2;
const SIGMA = 22;    // falloff radius in px

/* Expansion */
const DWELL_TOL = 6;     // px of drift that still counts as holding still
const CLOSE_GRACE = 180; // ms of slack for crossing the rail/panel gap
const INDENT_STEP = 12;  // px of indent per heading level
const STAGGER = 6;       // ms between row fade-ins
const STAGGER_CAP = 14;  // rows past this all share the last delay

/** Strip the markdown that would be noise in a short preview. */
function plainText(md) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

class Rail {
  constructor(plugin, view) {
    this.plugin = plugin;
    this.view = view;
    this.headings = [];
    this.rows = new Map(); // heading index -> panel row (insertion = doc order)
    this.activeIndex = -1;
    this.hoverIndex = -1;
    this.focusIndex = -1;
    this.expanded = false;
    this.pinned = false;
    this.raf = 0;
    this.dwellTimer = 0;
    this.closeTimer = 0;
    this.dwellAnchor = null;
    this.onScroll = () => this.syncActive();
    this.onDocKey = (e) => this.handleDocKey(e);

    this.el = view.contentEl.createDiv({ cls: 'gg-outline' });
    this.listEl = this.el.createDiv({ cls: 'gg-outline-list' });
    this.previewEl = this.el.createDiv({ cls: 'gg-outline-preview' });
    this.panelEl = this.el.createDiv({
      cls: 'gg-outline-panel',
      attr: { tabindex: '-1' },
    });
    this.panelListEl = this.panelEl.createDiv({ cls: 'gg-outline-panel-list' });

    this.listEl.addEventListener('mousemove', (e) => this.queueWave(e));
    this.listEl.addEventListener('mouseenter', () => this.cancelClose());
    this.listEl.addEventListener('mouseleave', () => this.onLeave(true));
    this.panelEl.addEventListener('mouseenter', () => this.cancelClose());
    this.panelEl.addEventListener('mouseleave', () => this.onLeave(false));
    this.panelEl.addEventListener('keydown', (e) => this.handlePanelKey(e));

    this.apply();
    this.refresh();
  }

  apply() {
    this.el.dataset.side = this.plugin.settings.side;
    this.el.style.setProperty(
      '--gg-panel-width',
      this.plugin.settings.panelWidth + 'px'
    );
  }

  /** The scrollable element differs between editing and reading mode. */
  scroller() {
    return this.view.getMode() === 'preview'
      ? this.view.contentEl.querySelector('.markdown-preview-view')
      : this.view.contentEl.querySelector('.cm-scroller');
  }

  refresh() {
    const file = this.view.file;
    const cache = file ? this.plugin.app.metadataCache.getFileCache(file) : null;
    this.headings = (cache && cache.headings) || [];

    this.detachScroll();
    this.listEl.empty();
    this.panelListEl.empty();
    this.rows.clear();
    this.hidePreview();
    this.hoverIndex = -1;
    this.focusIndex = -1;
    this.activeIndex = -1;

    if (this.headings.length < this.plugin.settings.minHeadings) {
      this.el.addClass('gg-outline-empty');
      this.collapse();
      return;
    }
    this.el.removeClass('gg-outline-empty');

    this.headings.forEach((h, i) => {
      const item = this.listEl.createEl('button', {
        cls: 'gg-outline-item',
        attr: { type: 'button' },
      });
      item.createSpan({ cls: 'gg-outline-tick' });
      // Not aria-label: Obsidian's tooltip system triggers off that
      // attribute, and a tooltip on every dash fights the preview card.
      // A visually hidden child names the button just as well.
      item.createSpan({ cls: 'gg-outline-label', text: h.heading });
      // Buttons grab focus on mousedown; letting them would pull the
      // caret out of the editor and make CodeMirror scroll it back into
      // view, landing us somewhere other than the heading.
      item.addEventListener('mousedown', (e) => e.preventDefault());
      item.addEventListener('click', (e) => {
        e.preventDefault();
        // With the panel open the dashes scrub it; a click commits.
        // Collapse first — it can hand focus back to the editor, and that
        // focus change scrolls the caret into view, which would fight the
        // scroll we are about to start.
        this.collapse();
        this.scrollTo(i);
      });
    });

    this.buildPanel();
    this.attachScroll();
    this.syncActive();
  }

  /* ---------------- The expanded panel ---------------- */

  /** One row per heading, indented by level. Indentation is normalized
      to the shallowest heading present, so a note written entirely in
      H2 is not indented for nothing. Headings deeper than the level cap
      are left out of the panel — their dash still marks the spot. */
  buildPanel() {
    const base = this.headings.reduce((m, h) => Math.min(m, h.level), 6);
    const cap = base + this.plugin.settings.panelMaxLevel - 1;
    let shown = 0;

    this.headings.forEach((h, i) => {
      if (h.level > cap) return;
      const depth = h.level - base;
      const row = this.panelListEl.createEl('button', {
        cls: 'gg-outline-row',
        text: h.heading,
        attr: { type: 'button', 'data-depth': String(Math.min(depth, 3)) },
      });
      row.style.paddingInlineStart = 8 + depth * INDENT_STEP + 'px';
      row.style.setProperty(
        '--gg-row-delay',
        Math.min(shown, STAGGER_CAP) * STAGGER + 'ms'
      );
      shown++;
      row.addEventListener('mousedown', (e) => e.preventDefault());
      row.addEventListener('click', (e) => {
        e.preventDefault();
        this.collapse();
        this.scrollTo(i);
      });
      row.addEventListener('mouseenter', () => this.setFocusRow(i));
      this.rows.set(i, row);
    });
  }

  expand(pinned) {
    this.cancelDwell();
    this.cancelClose();
    if (this.headings.length < this.plugin.settings.minHeadings) return;
    if (pinned) this.pinned = true;
    if (this.expanded) {
      if (pinned) this.panelEl.focus();
      return;
    }
    this.expanded = true;

    // The panel is centered on the rail, which is centered on the pane,
    // so capping it at 80% of the pane keeps both ends on screen.
    const host = this.view.contentEl.getBoundingClientRect();
    this.panelEl.style.maxHeight = Math.round(host.height * 0.8) + 'px';

    this.hidePreview();
    this.el.addClass('gg-outline-is-expanded');
    // Resting on a dash is what opened this, so that dash is what the
    // user is looking at — it takes the highlight. The command path has
    // no crest, so it falls back to the section currently on screen.
    const start = this.hoverIndex >= 0 ? this.hoverIndex : this.activeIndex;
    this.setFocusRow(this.rowIndexFor(start), true);
    document.addEventListener('keydown', this.onDocKey, true);
    if (pinned) this.panelEl.focus();
  }

  collapse() {
    this.cancelDwell();
    this.cancelClose();
    if (!this.expanded) return;
    this.expanded = false;
    this.pinned = false;
    this.el.removeClass('gg-outline-is-expanded');
    this.setFocusRow(-1);
    document.removeEventListener('keydown', this.onDocKey, true);
    if (this.panelEl.contains(document.activeElement)) {
      // Only when we took focus (pinned mode) — otherwise blurring here
      // would yank the caret out of an editor we never touched.
      this.panelEl.blur();
      if (this.view.editor) this.view.editor.focus();
    }
  }

  togglePinned() {
    if (this.expanded && this.pinned) this.collapse();
    else this.expand(true);
  }

  /** Re-arm on every real move, so scrubbing the wave never expands —
      only actually coming to rest does. */
  trackDwell(e) {
    if (this.expanded) return;
    if (this.plugin.settings.expandMode !== 'dwell') return;
    const a = this.dwellAnchor;
    if (
      a &&
      Math.abs(e.clientX - a.x) < DWELL_TOL &&
      Math.abs(e.clientY - a.y) < DWELL_TOL
    ) {
      return;
    }
    this.dwellAnchor = { x: e.clientX, y: e.clientY };
    window.clearTimeout(this.dwellTimer);
    this.dwellTimer = window.setTimeout(
      () => this.expand(false),
      this.plugin.settings.dwellDelay
    );
  }

  cancelDwell() {
    window.clearTimeout(this.dwellTimer);
    this.dwellTimer = 0;
    this.dwellAnchor = null;
  }

  cancelClose() {
    window.clearTimeout(this.closeTimer);
    this.closeTimer = 0;
  }

  /** Leaving either half starts a short close timer; entering the other
      half cancels it, which is what lets you cross the gap between the
      dashes and the panel without it snapping shut. */
  onLeave(fromRail) {
    this.cancelDwell();
    if (fromRail) this.resetWave();
    if (!this.expanded || this.pinned) return;
    this.cancelClose();
    this.closeTimer = window.setTimeout(() => this.collapse(), CLOSE_GRACE);
  }

  /** The panel row standing in for a heading: itself, or the nearest
      shallower heading above it when the depth cap left it out. */
  rowIndexFor(index) {
    for (let i = index; i >= 0; i--) if (this.rows.has(i)) return i;
    return -1;
  }

  setFocusRow(index, scrollIntoView) {
    const prev = this.rows.get(this.focusIndex);
    if (prev && index !== this.focusIndex) prev.removeClass('is-focus');
    this.focusIndex = index;
    const row = this.rows.get(index);
    if (!row) return;
    row.addClass('is-focus');
    if (scrollIntoView) this.revealRow(row);
  }

  /** Keep a row inside the panel's own viewport. scrollIntoView would
      also scroll every scrollable ancestor, including the editor. */
  revealRow(row) {
    const p = this.panelEl;
    const top = row.offsetTop;
    const bottom = top + row.offsetHeight;
    if (top < p.scrollTop) p.scrollTop = top;
    else if (bottom > p.scrollTop + p.clientHeight) {
      p.scrollTop = bottom - p.clientHeight;
    }
  }

  moveFocus(step) {
    const keys = Array.from(this.rows.keys());
    if (!keys.length) return;
    const at = keys.indexOf(this.focusIndex);
    const next =
      at < 0
        ? step > 0
          ? 0
          : keys.length - 1
        : Math.max(0, Math.min(keys.length - 1, at + step));
    this.setFocusRow(keys[next], true);
  }

  /* Escape is handled document-wide so it also closes a hover-expanded
     panel; the arrows stay on the panel so they only fire once it has
     focus, i.e. never while the user is typing in the editor. */
  handleDocKey(e) {
    if (e.key !== 'Escape' || !this.expanded) return;
    e.preventDefault();
    e.stopPropagation();
    this.collapse();
  }

  handlePanelKey(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.moveFocus(e.key === 'ArrowDown' ? 1 : -1);
    } else if (e.key === 'Enter' && this.focusIndex >= 0) {
      e.preventDefault();
      const target = this.focusIndex;
      this.collapse();
      this.scrollTo(target);
    }
  }

  /* ---------------- The wave ---------------- */

  queueWave(e) {
    this.lastY = e.clientY;
    this.trackDwell(e);
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.wave(this.lastY);
    });
  }

  wave(mouseY) {
    const items = this.listEl.children;
    let nearest = -1;
    let nearestDist = Infinity;

    for (let i = 0; i < items.length; i++) {
      const r = items[i].getBoundingClientRect();
      const dy = mouseY - (r.top + r.height / 2);
      const d = Math.abs(dy);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = i;
      }
      const boost = Math.exp(-(dy * dy) / (2 * SIGMA * SIGMA));
      const tick = items[i].firstChild;
      tick.style.width = BASE_W + MAX_EXTRA * boost + 'px';
      tick.style.height = BASE_H + MAX_EXTRA_H * boost + 'px';
    }

    if (nearest !== this.hoverIndex) {
      if (this.hoverIndex >= 0 && items[this.hoverIndex]) {
        items[this.hoverIndex].removeClass('is-crest');
      }
      this.hoverIndex = nearest;
      if (nearest >= 0) {
        items[nearest].addClass('is-crest');
        if (this.expanded) {
          // The panel already shows every heading, so the rail scrubs it
          // instead of stacking a preview card on top of it.
          this.setFocusRow(this.rowIndexFor(nearest), true);
        } else if (this.plugin.settings.showPreview) {
          this.showPreview(nearest, items[nearest]);
        }
      }
    }
  }

  resetWave() {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
    const items = this.listEl.children;
    for (let i = 0; i < items.length; i++) {
      const tick = items[i].firstChild;
      tick.style.width = '';
      tick.style.height = '';
      items[i].removeClass('is-crest');
    }
    this.hoverIndex = -1;
    this.hidePreview();
  }

  /* ---------------- Scroll plumbing ---------------- */

  attachScroll() {
    const s = this.scroller();
    if (!s) return;
    this.scrollEl = s;
    s.addEventListener('scroll', this.onScroll, { passive: true });
  }

  detachScroll() {
    if (this.scrollEl) this.scrollEl.removeEventListener('scroll', this.onScroll);
    this.scrollEl = null;
  }

  /** Scroller offset of a document line in editing mode.

      CM6 reports block positions relative to the top of the *document*,
      while scrollTop is relative to the top of the *scroller* — and
      Obsidian pads the scroller by --file-margins (32px by default), so
      the two origins are not the same. Measuring the gap rather than
      assuming it is zero is what keeps this honest across themes.

      (Reading mode uses line-based APIs instead — its DOM is
      virtualized, so pixel positions are unreliable there.) */
  lineTop(line) {
    const cm = this.view.editor && this.view.editor.cm;
    const s = this.scroller();
    if (!cm || !s) return null;
    return this.blockTop(cm, line, this.docOrigin(cm, s));
  }

  /** Distance between CM6's document origin and the scroller's scroll
      origin. One forced layout read, so callers walking every heading
      hoist it out of the loop. */
  docOrigin(cm, s) {
    const docTop =
      typeof cm.documentTop === 'number'
        ? cm.documentTop
        : cm.contentDOM.getBoundingClientRect().top;
    return docTop - s.getBoundingClientRect().top + s.scrollTop;
  }

  blockTop(cm, line, origin) {
    try {
      const pos = cm.state.doc.line(line + 1).from;
      return cm.lineBlockAt(pos).top + origin;
    } catch (e) {
      return null;
    }
  }

  scrollTo(index) {
    const h = this.headings[index];
    if (!h) return;
    const line = h.position.start.line;

    if (this.view.getMode() === 'preview') {
      // The preview virtualizes its DOM, so a pixel position only
      // exists while the target section is rendered. Prefer a smooth
      // pixel scroll when it is; otherwise fall back to Obsidian's
      // line-based applyScroll, which always works (but jumps).
      const s = this.scroller();
      const els = s ? Array.from(s.querySelectorAll('[data-heading]')) : [];
      const matches = els.filter(
        (el) => el.getAttribute('data-heading') === h.heading
      );
      if (s && matches.length === 1) {
        const top =
          matches[0].getBoundingClientRect().top -
          s.getBoundingClientRect().top +
          s.scrollTop;
        s.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      } else {
        this.view.currentMode.applyScroll(line);
      }
      this.setActive(index);
      return;
    }

    const cm = this.view.editor && this.view.editor.cm;
    const s = this.scroller();
    if (!cm || !s) return;

    // Editing mode is virtualized too: a line that has never been
    // rendered carries an *estimated* height, so a target computed from
    // the height map drifts by however much unmeasured content lies in
    // between — and drifts further mid-flight, as the scroll measures
    // those lines on the way past and rewrites the map underneath it.
    //
    // cm.viewport is the range CodeMirror has actually rendered. Inside
    // it every height is measured rather than estimated, so our own
    // arithmetic is exact and we can glide. Outside it, nothing we
    // compute is trustworthy, so CodeMirror places it instead — it
    // re-measures until its own target is stable. That lands exactly
    // but instantly, because it defers the scroll to its next measure
    // pass and there is no reliable moment to intercept.
    let pos = null;
    try {
      pos = cm.state.doc.line(line + 1).from;
    } catch (e) {
      pos = null;
    }
    const vp = cm.viewport;
    const rendered = pos != null && vp && pos >= vp.from && pos <= vp.to;

    if (rendered) {
      const top = this.blockTop(cm, line, this.docOrigin(cm, s));
      if (top != null) {
        s.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        this.setActive(index);
        return;
      }
    }

    const effect = this.scrollEffect(cm, line);
    if (effect) {
      cm.dispatch({ effects: effect });
    } else {
      const top = this.lineTop(line);
      if (top == null) return;
      s.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
    this.setActive(index);
  }

  /** CM6's scrollIntoView effect for a document line, or null if this
      build exposes neither route to it. */
  scrollEffect(cm, line) {
    const V = EditorView || cm.constructor;
    if (!V || typeof V.scrollIntoView !== 'function') return null;
    try {
      return V.scrollIntoView(cm.state.doc.line(line + 1).from, { y: 'start' });
    } catch (e) {
      return null;
    }
  }

  syncActive() {
    if (this.view.getMode() === 'preview') {
      // getScroll() reports the line at the top of the preview
      // viewport — immune to DOM virtualization.
      const line = this.view.currentMode.getScroll();
      if (line == null) return;
      let next = -1;
      for (let i = 0; i < this.headings.length; i++) {
        if (this.headings[i].position.start.line <= line + 0.5) next = i;
        else break;
      }
      this.setActive(next);
      return;
    }

    const cm = this.view.editor && this.view.editor.cm;
    const s = this.scroller();
    if (!cm || !s) return;
    const origin = this.docOrigin(cm, s);
    const probe = s.scrollTop + 40;
    let next = -1;
    for (let i = 0; i < this.headings.length; i++) {
      const top = this.blockTop(cm, this.headings[i].position.start.line, origin);
      if (top == null) continue;
      if (top <= probe) next = i;
      else break;
    }
    this.setActive(next);
  }

  setActive(index) {
    if (index === this.activeIndex) return;
    const prevRow = this.rows.get(this.activeIndex);
    if (prevRow) prevRow.removeClass('is-active');
    this.activeIndex = index;
    const items = this.listEl.children;
    for (let i = 0; i < items.length; i++) {
      items[i].toggleClass('is-active', i === index);
    }
    const row = this.rows.get(index);
    if (row) row.addClass('is-active');
  }

  /* ---------------- Preview ---------------- */

  /** Text between this heading and the next one, trimmed for display. */
  sectionPreview(index) {
    const editor = this.view.editor;
    if (!editor) return '';
    const start = this.headings[index].position.start.line + 1;
    const end = index + 1 < this.headings.length
      ? this.headings[index + 1].position.start.line
      : editor.lineCount();
    const lines = [];
    for (let l = start; l < end && lines.join(' ').length < 400; l++) {
      lines.push(editor.getLine(l));
    }
    const text = plainText(lines.join('\n'));
    const max = this.plugin.settings.previewChars;
    return text.length > max ? text.slice(0, max) + '…' : text;
  }

  showPreview(index, anchor) {
    const body = this.sectionPreview(index);
    this.previewEl.empty();
    this.previewEl.createDiv({
      cls: 'gg-outline-preview-title',
      text: this.headings[index].heading,
    });
    this.previewEl.createDiv({
      cls: 'gg-outline-preview-body',
      text: body || '（本节暂无正文）',
    });
    // Center on the crest dash, clamped so the card never leaves the pane.
    const host = this.view.contentEl.getBoundingClientRect();
    const railTop = this.el.getBoundingClientRect().top - host.top;
    const half = this.previewEl.offsetHeight / 2;
    let top = anchor.offsetTop + anchor.offsetHeight / 2;
    top = Math.max(half - railTop + 8, Math.min(top, host.height - railTop - half - 8));
    this.previewEl.style.top = top + 'px';
    this.el.addClass('gg-outline-has-preview');
  }

  hidePreview() {
    this.el.removeClass('gg-outline-has-preview');
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.cancelDwell();
    this.cancelClose();
    document.removeEventListener('keydown', this.onDocKey, true);
    this.detachScroll();
    this.el.remove();
  }
}

module.exports = class GogogaOutline extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULTS, await this.loadData());
    this.rails = new Map();

    this.addSettingTab(new GogogaOutlineSettings(this.app, this));

    this.addCommand({
      id: 'toggle-global-outline',
      name: '展开/收起全局大纲',
      checkCallback: (checking) => {
        const rail = this.activeRail();
        if (!rail || rail.headings.length < this.settings.minHeadings) return false;
        if (!checking) rail.togglePinned();
        return true;
      },
    });

    const sync = () => this.sync();
    this.registerEvent(this.app.workspace.on('layout-change', sync));
    this.registerEvent(this.app.workspace.on('active-leaf-change', sync));
    this.registerEvent(
      this.app.metadataCache.on('changed', (file) => {
        for (const [leaf, rail] of this.rails) {
          if (rail.view.file === file) rail.refresh();
        }
      })
    );
    this.app.workspace.onLayoutReady(sync);
  }

  activeRail() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return null;
    for (const rail of this.rails.values()) {
      if (rail.view === view) return rail;
    }
    return null;
  }

  /** One rail per open markdown pane; drop rails for closed panes. */
  sync() {
    const live = new Set();
    for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
      const view = leaf.view;
      if (!(view instanceof MarkdownView)) continue;
      live.add(leaf);
      const existing = this.rails.get(leaf);
      if (existing && existing.view === view) {
        existing.refresh();
      } else {
        if (existing) existing.destroy();
        this.rails.set(leaf, new Rail(this, view));
      }
    }
    for (const [leaf, rail] of this.rails) {
      if (!live.has(leaf)) {
        rail.destroy();
        this.rails.delete(leaf);
      }
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
    for (const rail of this.rails.values()) {
      rail.apply();
      rail.refresh();
    }
  }

  onunload() {
    for (const rail of this.rails.values()) rail.destroy();
    this.rails.clear();
  }
};

class GogogaOutlineSettings extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('显示位置')
      .setDesc('大纲导轨贴在编辑区的哪一侧')
      .addDropdown((d) =>
        d
          .addOption('right', '右侧')
          .addOption('left', '左侧')
          .setValue(this.plugin.settings.side)
          .onChange(async (v) => {
            this.plugin.settings.side = v;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('最少标题数')
      .setDesc('标题少于这个数量时不显示导轨')
      .addSlider((s) =>
        s
          .setLimits(1, 10, 1)
          .setDynamicTooltip()
          .setValue(this.plugin.settings.minHeadings)
          .onChange(async (v) => {
            this.plugin.settings.minHeadings = v;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('悬停显示章节预览')
      .setDesc('波峰所在的章节显示标题和开头内容')
      .addToggle((t) =>
        t.setValue(this.plugin.settings.showPreview).onChange(async (v) => {
          this.plugin.settings.showPreview = v;
          await this.plugin.saveSettings();
        })
      );

    containerEl.createEl('h3', { text: '全局大纲' });

    new Setting(containerEl)
      .setName('展开方式')
      .setDesc('鼠标在导轨上停住即可展开；也可以只保留快捷键')
      .addDropdown((d) =>
        d
          .addOption('dwell', '停留展开')
          .addOption('hotkey', '仅快捷键')
          .setValue(this.plugin.settings.expandMode)
          .onChange(async (v) => {
            this.plugin.settings.expandMode = v;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('停留延迟')
      .setDesc('鼠标静止多久后展开（毫秒）')
      .addSlider((s) =>
        s
          .setLimits(200, 1000, 50)
          .setDynamicTooltip()
          .setValue(this.plugin.settings.dwellDelay)
          .onChange(async (v) => {
            this.plugin.settings.dwellDelay = v;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('面板宽度')
      .addSlider((s) =>
        s
          .setLimits(180, 320, 10)
          .setDynamicTooltip()
          .setValue(this.plugin.settings.panelWidth)
          .onChange(async (v) => {
            this.plugin.settings.panelWidth = v;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('面板展开层级')
      .setDesc('比这更深的标题不进入面板，但导轨上仍然有它的刻度')
      .addSlider((s) =>
        s
          .setLimits(1, 6, 1)
          .setDynamicTooltip()
          .setValue(this.plugin.settings.panelMaxLevel)
          .onChange(async (v) => {
            this.plugin.settings.panelMaxLevel = v;
            await this.plugin.saveSettings();
          })
      );
  }
}
