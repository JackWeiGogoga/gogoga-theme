# Obsidian 配置

从零配置一个 Obsidian vault 的完整记录，配合 **gogoga 主题** 使用。整体思路参考 [Tolaria](https://github.com/refactoringhq/tolaria)：笔记平铺、靠属性和链接组织、三栏布局、键盘优先。

按下面的顺序从上往下做即可。

## 一、安装主题和图标插件

**主题 gogoga**：把 `theme.css` 和 `manifest.json` 放进 `<vault>/.obsidian/themes/gogoga/`，然后在 设置 → 外观 → 主题 里选择 gogoga。

**图标插件 gogoga-icons**（可选，但强烈建议）：把 `main.js` 和 `manifest.json` 放进 `<vault>/.obsidian/plugins/gogoga-icons/`。它把 Obsidian 内置的 Lucide 图标替换成 Phosphor 图标（Tolaria 用的那套），界面精致度提升明显。需要先在 设置 → 第三方插件 里关闭"安全模式"，再启用该插件。

**字体**：主题使用 Inter，建议从 [rsms.me/inter](https://rsms.me/inter/) 下载安装到系统。没装的话会回退到系统默认字体，观感会打折。

## 二、基础设置

**设置 → 外观**

| 项目 | 值 | 说明 |
| --- | --- | --- |
| 字体大小 | 15 | 主题的标题字号是相对这个基准计算的，改了会破坏比例 |
| 显示功能区 | 关闭 | 左侧图标条，三栏布局下是多余的 |

**设置 → 编辑器**

| 项目 | 值 | 说明 |
| --- | --- | --- |
| 显示行内标题 | 关闭 | 主题把正文第一个 H1 当作标题（Tolaria 模型），开着会重复显示 |
| 可读行长 | 开启 | 配合主题的 740px 行宽 |
| 文档内属性 | 可见 | 属性面板显示在正文顶部 |

## 三、核心插件取舍

Obsidian 默认开了一批核心插件，配合 gogoga + Notebook Navigator 的三栏布局，有些是功能重复的，有些则默认关着但很值得打开。

**建议开启**

| 插件 | 为什么 |
| --- | --- |
| 斜杠命令 Slash commands | **默认是关闭的**。这是复刻 Tolaria 最值得补的一块——BlockNote 编辑器的核心交互就是输入 `/` 唤出块菜单 |
| Bases | Obsidian 原生的数据库视图，可按 `type` 属性筛选出"所有 project"这类表格，是 Tolaria 的 views 在 Obsidian 里的对应物 |
| 属性 Properties | 属性驱动模型的地基 |
| 反向链接 + 出链 | 对应 Tolaria 的 "Referenced by" 面板 |
| 文件恢复 File recovery | 不用同步的话，这是唯一的后悔药，别关 |
| 笔记合成器 Note composer | 拆分/合并笔记，整理 inbox 时好用 |
| 命令面板 / 快速切换 / 全局搜索 / 悬停预览 / 大纲 | 键盘优先工作流的基础 |

**建议关闭**

| 插件 | 为什么 |
| --- | --- |
| 文件浏览器 File explorer | Notebook Navigator 完整替代了它，留着等于左侧栏有两个重复的文件树。NN 的代码不依赖它，关掉是安全的 |
| 标签面板 Tag pane | NN 的导航栏里已有 Tags 分组，重复 |
| 书签 Bookmarks | 与 NN 的 Shortcuts 功能重叠，二选一即可 |
| 关系图谱 Graph | 扁平链接型 vault 里观赏性大于实用性，容易变成噪音 |
| 同步 Sync | 不用 Obsidian 官方同步服务就关掉 |
| 模板 Templates | 已被 Templater 取代，两者同开会造成快捷键混淆 |

其余 `zk-prefixer`、`random-note`、`markdown-importer`、`slides`、`audio-recorder`、`publish`、`workspaces`、`webviewer` 都是特定场景才用的，保持默认关闭即可；Canvas 画白板才需要。

## 四、目录结构

不要用文件夹做知识分类——**文件夹只用于文件管理，知识组织交给链接和属性**。层级一深，"这篇该放哪"的纠结就会消耗记笔记的意愿。

```typescript
Vault/
├── （笔记平铺在根目录，靠 type / tags 属性组织）
├── inbox/          ← 未整理的快速记录
├── diary/          ← 日记，按 年/月 自动分子文件夹
├── templates/      ← 模板
└── attachments/    ← 附件
```

对应设置（设置 → 文件与链接）：

| 项目 | 值 |
| --- | --- |
| 附件默认存放路径 | 指定文件夹 → `attachments` |
| 新建笔记的默认位置 | 指定文件夹 → `inbox` |

新笔记默认落到 `inbox`，整理时再移到根目录，形成一个天然的收件箱流程。

## 五、配置 notebook-navigator 插件

Obsidian 原生没有 Tolaria 那样的"中间笔记列表栏"，靠这个插件补齐三栏布局。gogoga 主题**已经针对它做了完整适配**（通栏卡片、Tolaria 式选中态、安静的灰色标签 chip），装上即可，无需额外 CSS。

建议的设置（设置 → Notebook Navigator）：

| 项目 | 值 | 说明 |
| --- | --- | --- |
| 预览行数 | 2 | 与 Tolaria 的两行摘要一致 |
| 显示文件预览 / 日期 / 标签 | 开启 | 卡片信息层次 |
| 文件名行数 | 1 | 标题单行截断，卡片高度统一 |
| 日期格式 | `MMM D, YYYY` |  |
| 默认排序 | 修改时间倒序 |  |

注意：卡片的**行内间距和行高由插件的 JS 计算**（虚拟滚动列表），主题的 CSS 无法增加垂直空间——强行加会导致内容被裁切。想要更松的排版，请用插件自己的外观设置。

## 六、配置模板插件（Templater）

**为什么不用核心模板插件**：核心插件只能手动触发插入，且没有自动化能力——每建一篇笔记都要手动按一次。而我们想要的是"新建笔记自动带上属性"，这只有 Templater 能做到。

安装 Templater 后，**关闭核心的"模板"插件**（设置 → 核心插件），避免两套快捷键混淆。

### 模板文件

在 `templates/` 下建三个文件：

`note.md` — 根目录通用笔记

```typescript
---
type: note
created: <% tp.date.now("YYYY-MM-DD") %>
tags: []
---
<% tp.file.cursor() %>
```

`quick-note.md` — inbox 快速记录（时间戳精确到分钟，便于同日多条排序）

```typescript
---
type: note
created: <% tp.date.now("YYYY-MM-DD HH:mm") %>
tags: []
---
<% tp.file.cursor() %>
```

`daily.md` — 日记，见下一节。

### Templater 设置

| 项目 | 值 |
| --- | --- |
| Template folder location | `templates` |
| Trigger Templater on new file creation | 开启 |
| 触发模式 | Folder templates |
| Automatic jump to cursor | 开启 |

**Folder templates**（文件夹 → 模板的映射）：

| 文件夹 | 模板 |
| --- | --- |
| `/` | `templates/note.md` |
| `inbox` | `templates/quick-note.md` |
| `diary` | `templates/daily.md` |

**Ignore folders on creation**：加入 `templates` 和 `attachments`。不加的话，你新建模板文件时模板会套用到模板自己身上。

匹配规则是**逐级向上查找父目录**，所以 `diary/2026/08/` 下的文件会匹配到 `diary` 的模板；更具体的路径优先于 `/`。



## 七、配置日记目录和模板

用**核心的"日记"插件**负责文件创建与打开（它自带"今天已存在就直接打开"的逻辑），Templater 负责渲染模板里的语法。

### 日记插件设置（设置 → 日记）

| 项目 | 值 | 说明 |
| --- | --- | --- |
| 新建文件位置 | `diary` |  |
| 日期格式 | `YYYY/MM/YYYY-MM-DD` | 格式里的 `/` 会自动创建子文件夹，结果是 `diary/2026/08/2026-08-21.md` |
| 模板文件位置 | `templates/daily` |  |

文件名建议**不要**加星期（`ddd`/`dddd`）：它的输出跟随 Obsidian 的界面语言，中英文切换后新旧文件名会不一致。星期放在笔记标题里显示即可。

### 日记模板 `templates/daily.md`

```typescript
---
type: diary
---
# <% moment(tp.file.title, "YYYY-MM-DD").format("YYYY年MM月DD日 dddd") %>

← [[diary/<% tp.date.now("YYYY/MM/YYYY-MM-DD", -1, tp.file.title, "YYYY-MM-DD") %>|<% tp.date.now("YYYY-MM-DD", -1, tp.file.title, "YYYY-MM-DD") %>]] | [[diary/<% tp.date.now("YYYY/MM/YYYY-MM-DD", 1, tp.file.title, "YYYY-MM-DD") %>|<% tp.date.now("YYYY-MM-DD", 1, tp.file.title, "YYYY-MM-DD") %>]] →

## 🎯 今日目标

- [ ] <% tp.file.cursor() %>

## 💪 值得沉淀

- 
```

两个设计要点：

- **标题里的星期**：`moment(tp.file.title, ...)` 把文件名解析回日期再格式化，所以文件名保持干净的 `2026-08-21`，标题显示为「2026年08月21日 星期五」。
- **前后跳转链接带完整路径**：写成 [[diary/2026/08/2026-08-20|2026-08-20]] 而不是 [[2026-08-20]]。因为点击一个尚不存在的链接时，Obsidian 会按**链接里给出的路径**创建文件（缺失的文件夹也会自动建）；只写文件名的话，新笔记会跑到"新建笔记默认位置"（也就是 `inbox`）里去。竖线后面是显示别名，所以正文里看到的仍是简洁日期。

配合 `diary` 的 folder template，顺着链接往前翻时，每天的日记都会在正确位置自动生成并套好模板。

### 快捷键

设置 → 快捷键，搜索 `daily`，给这三条绑定：

- Open today's daily note —— 打开/创建今天的日记
- Open previous / next daily note —— 在**已存在**的日记之间跳转

## 八、踩坑记录

这些是配置过程中实际踩到、且不容易从文档里看出来的点。

**属性区不显示，不是 bug**：Obsidian 只在笔记有 frontmatter 时才显示属性区，空笔记会隐藏它。配好 Templater 的自动触发后，新笔记落地就带属性，这个问题自然消失。

**模板改动不会回溯**：Templater 的 `<% %>` 语法在笔记创建的那一刻就被渲染成最终文本、永久写入文件。之后再改模板，**已有的笔记不会跟着变**。所以模板结构最好在积累大量笔记之前定下来。

**Templater 与日记插件为什么不打架**：Templater 在新建文件时的逻辑是——正文为空则套用文件夹模板；正文非空则**就地渲染已有内容里的语法**。日记插件是先带着模板内容创建文件的，所以走的是第二条路径，两者天然分工，不会互相覆盖。

**不要添加你不会查询的属性**：`status: draft` 这类属性如果没有对应的视图或查询去消费它，就只是每篇笔记上多出来的一行噪音。参考 Tolaria 的做法——它的示例库里 23 篇笔记只有 9 篇带 `status`，且只给真正有生命周期的类型（项目、季度）使用。`type` 同理：先用默认值 `note`，等某类笔记攒够了、确实想单独看它们时，再给它起一个类型名。

**属性值的大小写要统一**：筛选时区分大小写，建议一开始就定好约定（推荐全小写，输入更快）。

`created` **保持纯日期**：写成 `2026-08-21` 时 Obsidian 会推断为 Date 类型，可在 Bases 里按日期排序筛选；一旦加上星期变成 `2026-08-21 星期五`，就退化成纯文本，日期能力全部失去。想要星期就单独加一个属性，或者只放在标题里。

`Cmd+R` **没有被 Obsidian 占用**：`app:reload`（重新加载应用）这条命令**没有默认快捷键**，Cmd+R 的刷新行为来自 Electron 层面。所以把 Cmd+R 绑给其他命令时，Obsidian 不会提示冲突，但刷新可能因此失效。调主题时需要频繁刷新的话，建议手动给 `app:reload` 绑一个键。

## 相关

- 主题与图标插件：gogoga（设计参考 Tolaria，AGPL-3.0）
- 三栏布局：[Notebook Navigator](https://github.com/johansan/notebook-navigator)
- 模板自动化：[Templater](https://github.com/SilentVoid13/Templater)
