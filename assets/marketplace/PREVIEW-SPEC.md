# Marketplace 右侧预览素材规范

Marketplace 详情弹窗**右侧**（主预览区 + 底部缩略图条）的截图 / 视频，统一放在本仓库：

```
forgeax-website/assets/marketplace/previews/{slug}/
```

`{slug}` **必须**与 Marketplace 卡片 `data-slug` 一致（例如 `wb-ui`、`agent-reia`）。  
构建脚本扫描该目录并生成 `manifest.json`，站点运行时按 slug 加载，**不要**把路径写进 HTML。

完整规范见下文；提交前请跑 `npm run build:previews` 校验 manifest。

---

## 1. 目录结构

```
assets/marketplace/previews/
├── manifest.json              # 自动生成，勿手改
├── preview-aliases.json       # 可选：slug 别名 → 共用另一 slug 的素材
├── _template/                 # 复制用的示例（不参与构建）
│   └── preview-meta.example.json
└── {slug}/                    # 每个模块一个文件夹
    ├── preview-meta.json      # 推荐：顺序 / 类型 / 角标 / 文案 SSOT
    ├── 01-studio-main.png
    ├── 02-output-hud.webm
    ├── 02-output-hud.poster.png
    └── 03-demo-flow.mp4
```

| 路径 | 谁维护 | 说明 |
|------|--------|------|
| `previews/{slug}/*` | 模块负责人 | 图片 / 视频 / meta |
| `previews/manifest.json` | CI / `build:previews` | 站点读取的唯一索引 |
| `previews/preview-aliases.json` | 站点维护者 | 多个 slug 共用一套素材时使用 |

---

## 2. 文件命名

### 2.1 推荐格式（无 `preview-meta.json` 时）

```
{序号}-{分类}-{简述}.{扩展名}
```

| 字段 | 规则 | 示例 |
|------|------|------|
| 序号 | 两位数字，`01` 起，决定画廊顺序 | `01`, `02` |
| 分类 | 见下表 | `studio`, `output`, `chat`, `demo` |
| 简述 | 小写 kebab-case，仅作识别 | `main`, `hud-loop` |
| 扩展名 | 见 §3 | `.png`, `.webm` |

**分类（category）**

| 值 | 右上角角标默认 | 适用场景 |
|----|----------------|----------|
| `studio` | 工作台 ID（如 `UI`、`REEL`） | Studio 窗口 / Dock 截图 |
| `output` / `ui` | `UI` | 模块产出物：游戏 HUD、生成结果、导出预览 |
| `chat` | `CHAT` | Agent 侧边栏对话截图 |
| `demo` | `DEMO` | 外链 demo、录屏、交互演示 |

示例：

```
wb-ui/
  01-studio-main.png       # Studio 工作台全貌
  02-output-hud.png        # UI 工坊生成的 HUD
  03-output-menu.webm      # 菜单交互动画
  03-output-menu.poster.png
```

仅 `{序号}.png`（如 `01.png`）也合法；分类默认：`agent-*` → `chat`，其余 → `studio`。

### 2.2 视频封面（poster）

每个视频**必须**有同名 poster：

```
02-output-hud.webm
02-output-hud.poster.png   # 或 meta 里显式指定 poster 文件名
```

缩略图条与首帧加载使用 poster；主预览区播放视频。

---

## 3. 媒体规格

### 3.1 图片

| 项 | 要求 |
|----|------|
| 格式 | PNG（首选）、WebP、JPEG |
| 推荐尺寸 | **3200 × 1840**（16:9 附近，2× DPR 下清晰） |
| 最小宽度 | 1600 px |
| 构图 | 主体居中；Studio 截图裁切 `.fx-dockshell`，不要带浏览器 chrome |
| 体积 | 单张 ≤ **800 KB**（PNG 可 TinyPNG / oxipng） |

### 3.2 视频

| 项 | 要求 |
|----|------|
| 格式 | **WebM**（首选，VP9）、MP4（H.264，Safari 回退） |
| 分辨率 | 1920 × 1080 或 1600 × 900 |
| 时长 | 5–30 s 循环片段为宜 |
| 体积 | ≤ **4 MB** / 条 |
| 音频 | 默认静音循环（`muted loop playsinline`） |

### 3.3 展示行为（站点侧）

- 主预览：`object-fit: contain`，点击静态图可 Lightbox 放大
- 多图时底部缩略图条 + 左右切换；单图时隐藏导航
- 左上角固定 `STUDIO`；右上角随当前 slide 的 `category` / `panelLabel` 变化

---

## 4. `preview-meta.json`（推荐）

有 2 张以上素材、或含视频 / 自定义角标时，**请提交 meta 文件**，避免仅靠文件名推断。

```jsonc
{
  "slides": [
    {
      "file": "01-studio-main.png",
      "type": "image",
      "category": "studio",
      "label": { "zh": "Studio 工作台", "en": "Studio workbench" },
      "panelLabel": { "zh": "UI", "en": "UI" }
    },
    {
      "file": "02-output-hud.webm",
      "type": "video",
      "category": "output",
      "poster": "02-output-hud.poster.png",
      "label": { "zh": "生成的 HUD", "en": "Generated HUD" },
      "panelLabel": { "zh": "UI", "en": "UI" }
    }
  ]
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `file` | ✓ | 本目录内文件名 |
| `type` | ✓ | `image` \| `video` |
| `category` | ✓ | `studio` \| `output` \| `chat` \| `demo` |
| `label` |  | 缩略图 `title` / 无障碍文案，双语 |
| `panelLabel` |  | 右上角角标；省略则用 category 默认值 |
| `poster` | 视频必填 | poster 文件名 |

`slides` 数组顺序 = 画廊顺序。未列出的媒体文件不会被收录。

模板：`previews/_template/preview-meta.example.json`

---

## 5. 两种提交方式

### A. 自动截图（Studio 工作台 / Agent）

适用于能在本地 Studio 复现的标准画面。

1. 在 `forgeax-studio/packages/studio-qa/src/marketplace-preview.config.mjs` 增加 `{slug}` 目标
2. 启动 Studio：`bun fx start`
3. 执行：

```bash
cd forgeax-studio
pnpm -F @forgeax/studio-qa qa:marketplace-previews -- --slug wb-ui
```

4. 输出 → `forgeax-website/assets/marketplace/previews/{slug}/01.png`
5. 自动调用 `build:previews` 刷新 manifest

默认参数：视口 1600×1000、DPR 2、裁切 `.fx-dockshell`（Agent 为 `[data-testid="chat-panel"]`）。

### B. 手动提交（产出物 / 录屏 / 设计稿）

1. 在 `previews/{slug}/` 放入文件 + 可选 `preview-meta.json`
2. 在 `forgeax-website` 根目录执行：

```bash
npm run build:previews
```

3. 本地验证：`npm run dev` → 打开 `/marketplace/` → 点击对应卡片
4. 提交 PR 到 `forgeax-website`（含素材与 manifest）

---

## 6. Slug 与别名

| 规则 | 说明 |
|------|------|
| slug 来源 | 与 `forgeax-studio/packages/marketplace/plugins/{dir}` 目录名一致；Agent 为 `agent-{name}` |
| 别名 | 在 `preview-aliases.json` 写 `"alias-slug": "canonical-slug"`，仅非 Agent 卡片生效 |
| Agent | **必须**使用独立 `agent-{name}/` 素材，不会继承关联工作台截图 |

---

## 7. PR 检查清单

- [ ] 文件夹名 = Marketplace `slug`
- [ ] 序号连续、无重复
- [ ] 图片 ≥1600px 宽，Studio 截图为 `.fx-dockshell` 区域
- [ ] 每个视频有 poster
- [ ] 已运行 `npm run build:previews`，`manifest.json` 已更新
- [ ] 本地 modal 中主预览清晰、缩略图与角标正确
- [ ] 素材无 token、内部 URL、未公开客户信息

---

## 8. 相关文件

| 文件 | 用途 |
|------|------|
| `scripts/website/build-marketplace-previews.mjs` | 扫描目录 → `manifest.json` |
| `marketplace/index.html` | 读取 manifest，渲染画廊 |
| `assets/forgeax/marketplace-cards.css` | 预览区样式 |
| `forgeax-studio/.../marketplace-preview.config.mjs` | 自动截图目标 |
| `forgeax-studio/.../capture-marketplace-previews.mjs` | Playwright 截图脚本 |
| 插件内 `MARKETPLACE-CARD-SPEC.md` | 左侧文案 `marketplace-card.json` 规范（与预览分离） |

左侧卡片文案走插件仓库的 `marketplace-card.json`；**右侧预览素材只走 `forgeax-website/assets/marketplace/previews/`**，二者分开维护、同一 slug 对齐。

---

## 9. Cursor 提交操作码（复制即用）

**每个模块独立目录**，路径里的 `{slug}` 换成目标模块（`wb-reel`、`wb-character`、`agent-reia` 等），**不是固定 UI 工坊**。

> 操作码全文（含 slug 对照表、单模块 / 单图 / 批量）：  
> **`assets/marketplace/previews/SUBMIT-PROMPT.md`**

**标准版** — 文件夹名 = slug，粘贴后只改 `slug = ...` 一行：

```
我已附上 Marketplace 预览素材文件夹，请按规范提交到 forgeax-website。

【模块】
- slug = wb-reel          ← 改成你的模块
- 目标目录：assets/marketplace/previews/wb-reel/
- 仓库：forgeax-website（不是 forgeax-studio）

【你要做的】
1. 读取我附带的文件夹（文件夹名应与 slug 一致）
2. 检查每张图片宽度；若 <1600px 请警告我
3. 命名：01-studio-main.png / 01-chat-main.png（Agent）/ 02-output-*.png / 视频+poster
4. panelLabel 按模块填（wb-ui→UI，wb-reel→REEL，agent-*→CHAT，其他 wb-*→去前缀大写）
5. ≥2 张或含视频时创建 preview-meta.json（双语 label）
6. 运行 npm run build:previews，确认 manifest slides 已更新

【禁止】放到 forgeax-studio、手改 manifest、压缩图片、混放其他 slug 素材
```

**查 slug**：Marketplace 卡片 HTML 属性 `data-slug`，或 `forgeax-studio/packages/marketplace/plugins/{目录名}`。

**注意**：拖本地原始文件夹进 Cursor；聊天截图会被压到 ~1024px 发糊。
