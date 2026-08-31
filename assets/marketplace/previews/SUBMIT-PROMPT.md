# Marketplace 预览素材 · Cursor 提交操作码

每个 Marketplace **模块各自独立**一个目录，**不是**都传到 UI 制作页。

```
assets/marketplace/previews/{slug}/
```

`{slug}` = 你要更新的那个模块 ID（见下方对照表）。  
把**以 slug 命名的文件夹**拖进 Cursor，粘贴操作码，**只改 slug 那一行**即可。

**提交前**：图片用原始 PNG（宽度 ≥1600px），**不要**只发聊天截图（会被压到 ~1024px 发糊）。

---

## 怎么查 slug

| 模块类型 | slug 规则 | 示例 |
|----------|-----------|------|
| 扩展页面 | 插件目录名 | `ui`、`reel`、`character`、`gen3d` |
| Agent | `agent-` + 名字 | `agent-reia`、`agent-arin`、`agent-suzu` |
| Skill | 插件目录名 | `skill-author-plugin` |
| Tool | 插件目录名 | `tool-balance-resim` |
| CLI / 模型 | 插件目录名 | `cli-forgeax`、`model-anthropic-text` |

不确定时：打开 [Marketplace 页面](https://forgeax.github.io/marketplace/) → 右键检查卡片 → 看 `data-slug="..."`  
或与 `forgeax-studio/packages/marketplace/plugins/{目录名}` 对齐。

---

## 操作码 A · 标准提交（单模块，推荐）

**用法**：文件夹名 = slug（如 `reel/`），粘贴后只改 `slug = ...` 一行。

```
我已附上 Marketplace 预览素材文件夹，请按规范提交到 forgeax-website。

【模块】
- slug = reel          ← 改成你的模块，如 character / agent-reia / gen3d
- 目标目录：assets/marketplace/previews/reel/
- 仓库：forgeax-website（不是 forgeax-studio）

【你要做的】
1. 读取我附带的文件夹（文件夹名应与 slug 一致）
2. 检查每张图片宽度；若 <1600px 请警告我，不要静默使用低清图
3. 按规范命名并放入 assets/marketplace/previews/{slug}/：
   - 01-studio-main.png     → category: studio（扩展页面 / Studio 界面）
   - 01-chat-main.png       → category: chat（Agent 对话截图时用）
   - 02-output-*.png        → category: output（模块产出物）
   - 03-demo-*.webm         → category: demo（录屏演示）
   - 视频必须配 *.poster.png
4. panelLabel 按模块填写（不是固定 UI）：
   - ui → UI；reel → REEL；character → CHARACTER
   - agent-* → CHAT；其他 authoring-* → 去掉 authoring- 前缀大写
5. ≥2 张或含视频时创建 preview-meta.json
   - 参考 assets/marketplace/previews/_template/preview-meta.example.json
   - label / panelLabel 双语 zh + en
6. 删除该 slug 目录下旧的不规范文件（如 01.png）
7. 在 forgeax-website 根目录执行：npm run build:previews
8. 确认 manifest.json 里 slides["{slug}"] 已更新

【禁止】
- 不要放到 forgeax-studio/packages/marketplace/plugins/
- 不要手改 manifest.json
- 不要压缩或缩放图片
- 不要把其他模块的素材放进本 slug 目录

【完成后告诉我】
- slug、提交了哪些文件、各自分辨率
- manifest 里该 slug 的 slides 条目
```

---

## 操作码 B · 仅替换一张图

```
请把我附带的 PNG 提交为 forgeax-website Marketplace 预览：

- slug：character          ← 改成你的模块
- 目标：assets/marketplace/previews/character/01-studio-main.png
- 若宽度 <1600px 先警告我
- preview-meta.json 里 category / panelLabel 按该模块填写（Agent 用 chat+CHAT，扩展页面用 studio+对应 Extension 名）
- 运行 npm run build:previews
- 不要放到 forgeax-studio
```

---

## 操作码 C · 多模块批量

一次提交**多个模块**时，顶层文件夹里每个子目录名 = slug：

```
我附带的文件夹结构为：

marketplace-previews/
  ui/
    01-studio-main.png
    ...
  reel/
    01-studio-main.png
    ...
  agent-reia/
    01-chat-main.png
    ...

请把每个子目录同步到 forgeax-website/assets/marketplace/previews/{子目录名}/

每个 slug 独立处理：
- 校验图片 ≥1600px
- panelLabel 按模块类型填写（见操作码 A）
- ≥2 张或含视频时补 preview-meta.json
- 视频检查 poster

全部完成后运行一次 npm run build:previews，汇总各 slug 的 slides 条数。
```

---

## 本地文件夹怎么命名（发给同事）

**单模块** — 文件夹名 = slug，拖进 Cursor：

```
reel/                    ← 影游模块，不是 ui
├── 01-studio-main.png
├── 02-output-branch.png
└── preview-meta.json

agent-reia/                 ← Agent 模块
├── 01-chat-main.png
└── preview-meta.json
```

**多模块** — 外层再包一层：

```
marketplace-previews/
├── ui/
├── gen3d/
└── agent-suzu/
```

---

## 常见 slug 速查（节选）

| 模块 | slug |
|------|------|
| UI 制作页 | `ui` |
| 影游 | `reel` |
| 角色编辑器 | `character` |
| 3D 生成 | `gen3d` |
| 叙事制作页 | `narrative` |
| 动画 | `anim` |
| Reia Agent | `agent-reia` |
| Arin Agent | `agent-arin` |
| 插件作者 | `plugin-author` |

完整列表见 Marketplace 页面各卡片的 `data-slug`。

规范全文：`assets/marketplace/PREVIEW-SPEC.md`
