# i18n — multilingual architecture

Default language: **English** (authored inline in the HTML).

## How it works
- Every translatable string uses `<span data-lang="en">…</span>` + `<span data-lang="zh">…</span>` siblings (or is generated that way from `site.js` nav/footer).
- **English & 中文** are authored inline; CSS shows the matching `body.lang-*` variant.
- **日本語 / 한국어 / Español / Deutsch / Français / Português** load JSON dictionaries from `assets/i18n/dict/<code>.json` (keys = hash of English HTML). `site.js` injects sibling spans on language switch.
- `setLang(code)` sets `body.class = "lang-<code>"`, updates `<html lang>`, persists to `localStorage["forgeax-lang"]`.

## Supported languages
| code | name | source |
|---|---|---|
| en | English | inline HTML (default) |
| zh | 中文 | inline HTML |
| ja | 日本語 | `dict/ja.json` |
| ko | 한국어 | `dict/ko.json` |
| es | Español | `dict/es.json` |
| de | Deutsch | `dict/de.json` |
| fr | Français | `dict/fr.json` |
| pt | Português | `dict/pt.json` |

## Build pipeline
```bash
node scripts/website/extract-i18n.mjs    # → assets/i18n/catalog.json
node scripts/website/build-i18n-dict.mjs # → assets/i18n/dict/*.json (Google Translate)
```

## JS helpers (site.js)
- `window.forgeaxGetLang()` — active language code
- `window.forgeaxApplyI18n(root?)` — inject dict spans under `root` (default `document`)
- `window.forgeaxL10n({ zh, en })` — pick translated string from MK_DATA-style objects
- `window.forgeaxT(zh, en)` — build bilingual span HTML
- `window.forgeaxUi("copied")` — small UI chrome strings

Dynamic pages should listen for `forgeax:langchange` and re-render or call `forgeaxApplyI18n`.
