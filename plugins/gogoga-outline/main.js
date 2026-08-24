'use strict';
/* gogoga-outline — a Codex-style heading rail on the edge of the editor.
 * At rest the rail is a column of identical short dashes. Moving the
 * mouse along it raises a dock-like wave: each dash grows by a gaussian
 * falloff of its distance to the cursor, and a preview card (heading +
 * first lines of the section) slides along with the crest.
 * Companion to the gogoga theme. */

const { Plugin, MarkdownView, PluginSettingTab, Setting } = require('obsidian');

const DEFAULTS = {
  side: 'right',
  minHeadings: 2,
  showPreview: true,
  previewChars: 140,
};

/* Wave geometry */
const BASE_W = 12;   // dash width at rest
const MAX_EXTRA = 34; // extra width at the crest
const BASE_H = 2;
const MAX_EXTRA_H = 2;
const SIGMA = 22;    // falloff radius in px

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
    this.activeIndex = -1;
    this.hoverIndex = -1;
    this.raf = 0;
    this.onScroll = () => this.syncActive();

    this.el = view.contentEl.createDiv({ cls: 'gg-outline' });
    this.listEl = this.el.createDiv({ cls: 'gg-outline-list' });
    this.previewEl = this.el.createDiv({ cls: 'gg-outline-preview' });

    this.listEl.addEventListener('mousemove', (e) => this.queueWave(e));
    this.listEl.addEventListener('mouseleave', () => this.resetWave());

    this.apply();
    this.refresh();
  }

  apply() {
    this.el.dataset.side = this.plugin.settings.side;
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
    this.hidePreview();
    this.hoverIndex = -1;

    if (this.headings.length < this.plugin.settings.minHeadings) {
      this.el.addClass('gg-outline-empty');
      return;
    }
    this.el.removeClass('gg-outline-empty');

    this.headings.forEach((h, i) => {
      const item = this.listEl.createEl('button', {
        cls: 'gg-outline-item',
        attr: { type: 'button', 'aria-label': h.heading },
      });
      item.createSpan({ cls: 'gg-outline-tick' });
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.scrollTo(i);
      });
    });

    this.attachScroll();
    this.syncActive();
  }

  /* ---------------- The wave ---------------- */

  queueWave(e) {
    this.lastY = e.clientY;
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
        if (this.plugin.settings.showPreview) {
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

  /** Pixel offset of a document line in the editing-mode scroller.
      (Reading mode uses line-based APIs instead — its DOM is
      virtualized, so pixel positions are unreliable there.) */
  lineTop(line) {
    const cm = this.view.editor && this.view.editor.cm;
    if (!cm) return null;
    try {
      const pos = cm.state.doc.line(line + 1).from;
      return cm.lineBlockAt(pos).top;
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

    const s = this.scroller();
    const top = this.lineTop(line);
    if (!s || top == null) return;
    s.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    this.setActive(index);
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

    const s = this.scroller();
    if (!s) return;
    const probe = s.scrollTop + 40;
    let next = -1;
    for (let i = 0; i < this.headings.length; i++) {
      const top = this.lineTop(this.headings[i].position.start.line);
      if (top == null) continue;
      if (top <= probe) next = i;
      else break;
    }
    this.setActive(next);
  }

  setActive(index) {
    if (index === this.activeIndex) return;
    this.activeIndex = index;
    const items = this.listEl.children;
    for (let i = 0; i < items.length; i++) {
      items[i].toggleClass('is-active', i === index);
    }
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
    this.detachScroll();
    this.el.remove();
  }
}

module.exports = class GogogaOutline extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULTS, await this.loadData());
    this.rails = new Map();

    this.addSettingTab(new GogogaOutlineSettings(this.app, this));

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
  }
}
