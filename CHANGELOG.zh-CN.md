# 更新日志

gogoga 主题 每个版本的主要变化都记在这里。格式参照 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循[语义化版本](https://semver.org/lang/zh-CN/)。English: [CHANGELOG.md](CHANGELOG.md).

## [Unreleased]

## [0.3.0] - 2026-11-16

### 新增（#2，pinery-sls 的建议；都在 Style Settings 里，默认关）
- **标题配色**：「标题配色方案」可选彩虹、海洋、森林、暮色，一到六级标题各用一种颜色，深色模式有对应的一套；也可以单独给某一级设颜色，单独设的优先。
- **多彩强调**：斜体、粗斜体各用一种文字颜色；高亮里再加斜体、加粗、粗斜体，各用一种底色（粉、绿、蓝）。五个颜色都能改，「配色 → 斜体颜色」设过的话以它为准。
- **任务与列表**：
  - 「复选框形状」可选方框或圆形。
  - 「扩展任务状态」：`- [>]` `- [<]` `- [!]` `- [-]` `- [/]` `- [?]` `- [*]` 等 21 种写法各显示成自己的图标和颜色（Phosphor 图标），不再都是一个对勾；`- [-]` 和 `- [x]` 一样带删除线，其余不带。
  - 「彩虹缩进线」：嵌套列表每一级的竖线一种颜色。
- **文件列表**（只对 Obsidian 自带的文件列表生效）：
  - 「文件类型图标」：笔记、图片、PDF、音频、视频、白板、Bases、代码、压缩包各有图标。
  - 「文件夹图标颜色」可选灰色、强调色、彩虹（顶层文件夹依次换色，子文件夹跟着上级）。
- **笔记属性字号**（排版里）：属性名、值和「添加笔记属性」一起调，默认 12px 不变。

### 修复
- 同时打开「标题等级标记」和编辑器行号时，H1、H2 小标签和行号叠在一起（#2）。现在开着行号时，小标签放在行号和正文之间，鼠标移到标题上要显示折叠箭头时让开。

## [0.2.1] - 2026-11-15

### 修复
- 侧栏里的任务框左边不再被裁掉。侧栏字号小，任务框会伸出列表左边，在实时预览的查询块（Tasks、Dataview）里左边框被裁掉。现在任务项总会给复选框留够位置；主编辑区样子不变。

## [0.2.0] - 2026-11-09

### 新增
- Style Settings 里新增「荧光笔记」一组（每项默认关）：笔记标题和一级标题压在马克笔色块上；二三级标题下半截刷一道荧光笔；`==高亮==` 两头斜着收尾，像真的荧光笔划过（带颜色的高亮保持原色）；`<u>下划线</u>` 换成粗记号笔线，gogoga 脑图节点里的下划线也一样；删除线变成灰字加红线。另有一个「荧光笔颜色」统一调，浅色、深色都适用。

## [0.1.7] - 2026-10-28

### 新增
- Style Settings 里可以设置标题颜色（一到六级）和斜体颜色，浅色、深色分开设置；不设时和原来一样。

## [0.1.6] - 2026-10-28

### 新增
- Style Settings 里的加粗选项：样式（经典、强调色、荧光笔下划线）、加粗颜色、加粗程度和笔画加粗。默认样子不变。

## [0.1.5] - 2026-10-22

### 新增
- 悬停行强调可以单独设颜色。
- 标题等级标记：在标题旁显示 H1–H6。
- 正文字重设置。
- Tolaria 风格的核心文件列表样式。

### 改进
- 强调色悬停、字体渲染两项设置的说明写得更清楚。

## [0.1.4] - 2026-10-21

### 新增
- Style Settings 新增「悬停行强调」和「聚焦模式」两个开关。
- 这两项也可以按笔记（cssclasses）或用自带的 CSS 片段全局打开，不装插件也行。

## [0.1.3] - 2026-10-20

### 改进
- 强调色跟随 Obsidian 的强调色设置，不再固定为蓝色。

## [0.1.2] - 2026-10-18

### 新增
- 爱发电赞助链接。

## [0.1.1] - 2026-10-15

### 新增
- Style Settings 的选项文字支持英文和简体中文，跟随 Obsidian 的语言。
- 英文 README，另附简体中文版。

## [0.1.0] - 2026-10-14

首个公开版本。

### 新增
- 参照 Tolaria 设计语言的浅色、深色配色，三层背景层次。
- Tolaria 式的嵌套列表符号、标题节奏、自适应表格、低调的标签胶囊。
- Notebook Navigator 和属性侧栏的配套样式。
- Style Settings：强调色和行内代码颜色、正文字体、行宽、表格最小列宽，以及「隐藏一级标题分隔线」「统一列表符号」「使用系统字体渲染」三个可选开关。

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
