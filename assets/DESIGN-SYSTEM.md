# ForgeaX Site — UI 规范（对齐 Studio）

本静态站 **必须** 服从 ForgeaX Studio 官方设计系统，不得自建平行色板。

## 唯一 Token 来源（SSOT）

| 层级 | Studio 源文件 | 本站副本 |
|------|---------------|----------|
| Primitive | `forgeax-studio/packages/interface/src/styles/primitive.css` | `assets/forgeax/primitive.css` |
| Semantic | `forgeax-studio/packages/interface/src/styles/tokens.css` | `assets/forgeax/tokens.css` |
| 动效 | `forgeax-studio/packages/interface/src/styles/motion.css` | `assets/forgeax/motion-site.css`（站点作用域） |
| 规范全文 | `forgeax-studio/.../forgeax-preview/DESIGN-SYSTEM.md` | 以 Studio 为准 |

**同步方式：** Studio token 变更后，复制 `primitive.css` + `tokens.css` 到 `assets/forgeax/`。

## 本站文件职责

| 文件 | 作用 |
|------|------|
| `assets/forgeax/primitive.css` | 原语色、半径、字体（只读副本） |
| `assets/forgeax/tokens.css` | 语义色、`--motion-*`、`--color-*`（只读副本） |
| `assets/forgeax/site-aliases.css` | 站点简写 `--bg-canvas` → `--color-background-canvas` |
| `assets/forgeax/motion-site.css` | `.forgeax-site` 下的 pressable / row / stagger 动效 |
| `assets/styles.css` | 站点布局组件（nav、card、prose、examples） |
| `assets/forgeax/linear-premium.css` | Linear 风格：环境光 mesh、玻璃卡片、高级排版 |
| `assets/motion-scroll.js` | 滚动进入视口时的丝滑 reveal |

## 图标（与 Studio 一致）

| 规则 | 标准 |
|------|------|
| 来源 | **Lucide** 线性图标（Studio 用 `lucide-react`） |
| 尺寸 | 卡片/导航 `20px`，`stroke-width: 1.8` |
| HTML | `<i data-lucide="bot"></i>` |
| **禁止** | emoji 作功能图标、自定义 SVG 图标集、manifest emoji |

## 动效（与 Studio 一致）

| 场景 | 实现 |
|------|------|
| 按钮/卡片 hover | `motion-site.css` → `--motion-hover-y` + `--motion-shadow-hover` |
| 列表行（Examples 侧栏） | `.motion-row` → 横向 `--motion-row-x` + 左侧品牌线 |
| 卡片网格入场 | `.motion-stagger` → `site-reveal-up` 递进 |
| 下拉菜单 | `site-dropdown-in` |
| 亮绿主按钮 | hover/active 保持 `--color-text-on-bright-primary` 黑字 |
| 无障碍 | `prefers-reduced-motion: reduce` 关闭动画 |

**禁止** 散写 `120ms ease`、`0.15s`、临时 cubic-bezier。

## 颜色规则

- 面板/卡片背景：`--color-background-elevated`
- 悬停：`--color-interaction-hover`
- 选中：`--color-interaction-selected-brand`
- 品牌：`--color-brand-primary` / `--primary`
- 亮底按钮文字：`--color-text-on-bright-primary`
- **禁止** 裸写 `rgba(212,255,72,…)`；用 `color-mix(in srgb, var(--primary) …)` 或 `--primary-bg`

## 页面约定

- `<body class="forgeax-site">`（`site.js` 也会自动添加）
- 样式入口：`<link href="/assets/styles.css?v=…">`
- 本地预览绿条：仅 localhost / `::1` 显示，上线无影响

## 本地预览

```bash
npm run dev
# http://localhost:4173
```

改 `assets/styles.css` 或 `assets/forgeax/*` 后 **Ctrl+Shift+R** 强刷。

## 验收清单

1. 无 emoji 功能图标（首页 feature 卡已换 Lucide）
2. 无硬编码 hex（除 primitive 层）
3. 主按钮 hover 全程黑字可读
4. 卡片 grid 有递进入场（首屏向下滚动可见）
5. Examples 侧栏 hover 有左滑 + 品牌竖线
6. `prefers-reduced-motion` 下无动画
