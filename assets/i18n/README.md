# i18n — multilingual architecture

Default language: **English** (authored inline in the HTML, also the fallback).

## How it works today
- Every translatable string is wrapped in `<span data-lang="en">…</span><span data-lang="zh">…</span>`.
- `assets/site.js` holds the language registry (`LANGS`) and renders the **language dropdown** in the nav.
- `setLang(code)` sets `body.class = "lang-<code>"` and `<html lang>`, persists to `localStorage["forgeax-lang"]`.
- CSS rule: English shows by default; only `lang-zh` swaps to the Chinese variant. **Any language without its own variant falls back to English automatically.** So the 6 new languages already work — they just show English until translated.

## Supported languages (registry = `LANGS` in site.js + `languages.json` here)
| code | name | html lang | translated |
|---|---|---|---|
| en | English | en | ✅ (default) |
| zh | 简体中文 | zh-CN | ✅ |
| ja | 日本語 | ja | ⏳ falls back to English |
| ko | 한국어 | ko | ⏳ |
| fr | Français | fr | ⏳ |
| de | Deutsch | de | ⏳ |
| es | Español | es | ⏳ |
| ru | Русский | ru | ⏳ |

## Planned: JSON-dictionary system (for when translations land)
To scale past 2 fully-authored languages without duplicating every string inline:
1. Give each translatable element a stable key: `data-i18n="home.hero.title"`, keep the English text inline as the fallback.
2. Add one dictionary file per language here: `assets/i18n/<code>.json` = `{ "home.hero.title": "…" }`.
3. `site.js` fetches the active language's JSON and fills `[data-i18n]`; **missing keys keep the inline English** (graceful fallback).
4. Adding a new language = drop a new `<code>.json` + one row in `LANGS`. No HTML changes.

Until then, translation work is tracked in `/WEBSITE-TODO.md` (item: Multilingual).
