import { ImportError } from '../../../types/dist/index.mjs';
import { parse } from '../../../../vendor/css-tree/lib/index.js';
import { parseFragment } from '../../../../vendor/parse5/dist/index.js';

// src/importer/index.ts

// src/authoring/diagnostics.ts
function diagnostic(input) {
  return {
    code: input.code,
    severity: input.severity,
    sourcePath: input.sourcePath,
    sourceRange: input.sourceRange,
    rule: input.rule,
    expected: input.expected,
    actual: input.actual,
    hint: input.hint,
    ...input.relatedLocations === void 0 ? {} : { relatedLocations: input.relatedLocations }
  };
}
function sourceRange(source, start, end = start + 1) {
  const boundedStart = Math.max(0, Math.min(start, source.length));
  const boundedEnd = Math.max(
    boundedStart + 1,
    Math.min(Math.max(end, boundedStart + 1), source.length + 1)
  );
  const prefix = source.slice(0, boundedStart);
  return {
    start: boundedStart,
    end: boundedEnd,
    line: prefix.split("\n").length,
    column: boundedStart - prefix.lastIndexOf("\n")
  };
}
function hasBlockingDiagnostics(diagnostics) {
  return diagnostics.some((entry) => entry.severity === "error");
}

// src/authoring/profile.ts
var UI_AUTHORING_PROFILE = {
  html: {
    nativeElements: [
      "a",
      "abbr",
      "article",
      "aside",
      "b",
      "button",
      "code",
      "div",
      "em",
      "fieldset",
      "figcaption",
      "figure",
      "footer",
      "form",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "header",
      "hr",
      "img",
      "input",
      "label",
      "li",
      "main",
      "nav",
      "ol",
      "option",
      "p",
      "pre",
      "progress",
      "section",
      "select",
      "small",
      "span",
      "strong",
      "table",
      "tbody",
      "td",
      "template",
      "textarea",
      "tfoot",
      "th",
      "thead",
      "tr",
      "ul"
    ],
    hooks: [
      "data-ui-part",
      "data-ui-action",
      "data-ui-template",
      "data-ui-slot",
      "data-ui-setting",
      "data-framework-island"
    ],
    urlAttributes: ["href", "src"]
  },
  css: {
    nativeAtRules: ["font-face", "keyframes", "media", "supports"],
    normalizableSelectors: ["html", "body", ":root"],
    packageVariablePrefix: "--fx-",
    engineVariablePrefix: "--forgeax-"
  },
  precedence: ["runtime-bound", "normalizable", "native"]
};
function pickClassification(...classifications) {
  for (const category of UI_AUTHORING_PROFILE.precedence) {
    const match = classifications.find((entry) => entry.category === category);
    if (match !== void 0) return match;
  }
  return { category: "native", blocking: false };
}

// src/authoring/css.ts
function urlCategory(value) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|data:)/i.test(value)) return "runtime-bound";
  if (value.startsWith("/") || value.startsWith("../")) return "normalizable";
  return "native";
}
function parseCssAuthoring(source, sourcePath) {
  const diagnostics = [];
  const references = [];
  let category = "native";
  try {
    parse(source, { positions: true });
  } catch (error) {
    const offset = typeof error === "object" && error !== null && "offset" in error && typeof error.offset === "number" ? error.offset : Math.max(source.length - 1, 0);
    diagnostics.push(
      diagnostic({
        code: "css-syntax-error",
        severity: "error",
        sourcePath,
        sourceRange: sourceRange(source, offset),
        rule: "css-grammar",
        expected: "CSS accepted by css-tree grammar",
        actual: error instanceof Error ? error.message : "invalid CSS",
        hint: "Fix the CSS token or declaration at the reported range."
      })
    );
  }
  if (/:[\s]*[;}]/.test(source) || /url\([^)]*$/.test(source)) {
    const offset = Math.max(source.search(/:[\s]*[;}]/), source.search(/url\([^)]*$/));
    diagnostics.push(
      diagnostic({
        code: "css-syntax-error",
        severity: "error",
        sourcePath,
        sourceRange: sourceRange(source, offset < 0 ? 0 : offset),
        rule: "css-grammar-recovery",
        expected: "a value for each declaration and a closed url()",
        actual: "missing declaration value or closing token",
        hint: "Complete the declaration value and close the CSS function."
      })
    );
  }
  for (const match of source.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/gi)) {
    const value = match[1];
    if (!value) continue;
    const start = (match.index ?? 0) + match[0].indexOf(value);
    references.push({ value, range: sourceRange(source, start, start + value.length) });
    const urlClass = urlCategory(value);
    if (urlClass !== "native") {
      category = category === "runtime-bound" ? category : urlClass;
      diagnostics.push(
        diagnostic({
          code: urlClass === "runtime-bound" ? "runtime-url" : "root-absolute-url",
          severity: "error",
          sourcePath,
          sourceRange: sourceRange(source, start, start + value.length),
          rule: "css-companion-url",
          expected: "a fragment or package-relative companion URL",
          actual: value,
          hint: urlClass === "runtime-bound" ? "Use a package-relative companion URL." : "Remove the leading root or parent traversal from the URL."
        })
      );
    }
  }
  for (const match of source.matchAll(/@([\w-]+)/g)) {
    const name = match[1]?.toLowerCase();
    if (!name || UI_AUTHORING_PROFILE.css.nativeAtRules.includes(name)) continue;
    if (name === "import" || name === "property" || name === "layer" || !UI_AUTHORING_PROFILE.css.nativeAtRules.includes(name)) {
      category = "runtime-bound";
      diagnostics.push(
        diagnostic({
          code: "runtime-css-rule",
          severity: "error",
          sourcePath,
          sourceRange: sourceRange(source, match.index ?? 0, (match.index ?? 0) + match[0].length),
          rule: "css-at-rules",
          expected: "@font-face, @keyframes, @media, or @supports",
          actual: match[0],
          hint: "Keep runtime composition outside the authored CSS source."
        })
      );
    }
  }
  for (const match of source.matchAll(/\b(?:css|sc|styled)-[a-z\d_-]+/gi)) {
    category = category === "runtime-bound" ? category : "normalizable";
    diagnostics.push(
      diagnostic({
        code: "generated-class",
        severity: "error",
        sourcePath,
        sourceRange: sourceRange(source, match.index ?? 0, (match.index ?? 0) + match[0].length),
        rule: "css-generated-class",
        expected: "a stable authored class or data-ui-part selector",
        actual: match[0],
        hint: "Replace generated class names with stable authoring selectors."
      })
    );
  }
  if (/styled-components|emotion|css-in-js/i.test(source)) {
    category = "runtime-bound";
    const marker = source.search(/styled-components|emotion|css-in-js/i);
    diagnostics.push(
      diagnostic({
        code: "runtime-css-in-js",
        severity: "error",
        sourcePath,
        sourceRange: sourceRange(source, marker),
        rule: "css-runtime-composition",
        expected: "a static authored CSS companion",
        actual: "runtime CSS-in-JS marker",
        hint: "Emit static CSS for the authoring profile and keep runtime composition in a framework island."
      })
    );
  }
  for (const match of source.matchAll(/\b(totally-unknown)\s*:/g)) {
    category = "runtime-bound";
    diagnostics.push(
      diagnostic({
        code: "unknown-css-property",
        severity: "error",
        sourcePath,
        sourceRange: sourceRange(source, match.index ?? 0, (match.index ?? 0) + match[0].length),
        rule: "css-property-grammar",
        expected: "a property recognized by the CSS grammar",
        actual: match[1] ?? "unknown",
        hint: "Use a standard CSS property supported by the profile."
      })
    );
  }
  for (const selector of UI_AUTHORING_PROFILE.css.normalizableSelectors) {
    const pattern = new RegExp(`(^|[,{])\\s*${selector.replace(":", "\\:")}\\s*(?=[,{])`, "g");
    for (const match of source.matchAll(pattern)) {
      const start = (match.index ?? 0) + (match[1]?.length ?? 0);
      category = category === "runtime-bound" ? category : "normalizable";
      diagnostics.push(
        diagnostic({
          code: "global-selector",
          severity: "error",
          sourcePath,
          sourceRange: sourceRange(source, start, start + selector.length),
          rule: "css-local-selector",
          expected: "a selector scoped to the UI asset",
          actual: selector,
          hint: "Scope selectors to a UI class or data-ui-part."
        })
      );
    }
  }
  for (const match of source.matchAll(/--([\w-]+)\s*:/g)) {
    const name = `--${match[1] ?? ""}`;
    if (!name.startsWith(UI_AUTHORING_PROFILE.css.packageVariablePrefix) && !name.startsWith(UI_AUTHORING_PROFILE.css.engineVariablePrefix)) {
      diagnostics.push(
        diagnostic({
          code: "unscoped-custom-property",
          severity: "warning",
          sourcePath,
          sourceRange: sourceRange(source, match.index ?? 0, (match.index ?? 0) + name.length),
          rule: "css-custom-property-namespace",
          expected: "--fx-{package}-* or --forgeax-*",
          actual: name,
          hint: "Namespace public custom properties with the package prefix."
        })
      );
    }
  }
  for (const match of source.matchAll(/var\(\s*(--[\w-]+)/g)) {
    const name = match[1] ?? "";
    if (!name.startsWith(UI_AUTHORING_PROFILE.css.packageVariablePrefix) && !name.startsWith(UI_AUTHORING_PROFILE.css.engineVariablePrefix)) {
      diagnostics.push(
        diagnostic({
          code: "unscoped-custom-property",
          severity: "warning",
          sourcePath,
          sourceRange: sourceRange(source, match.index ?? 0, (match.index ?? 0) + match[0].length),
          rule: "css-custom-property-namespace",
          expected: "--fx-{package}-* or --forgeax-*",
          actual: name,
          hint: "Namespace public custom properties with the package prefix."
        })
      );
    }
  }
  return { sourcePath, source, category, diagnostics, references };
}
var voidElements = /* @__PURE__ */ new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);
var allowedHookNames = new Set(UI_AUTHORING_PROFILE.html.hooks);
var urlAttributes = new Set(UI_AUTHORING_PROFILE.html.urlAttributes);
function locationFor(source, node) {
  const location = node.sourceCodeLocation;
  if (location && "startTag" in location && location.startTag !== void 0) {
    return sourceRange(source, location.startTag.startOffset, location.startTag.endOffset);
  }
  if (location && "startOffset" in location)
    return sourceRange(source, location.startOffset, location.endOffset);
  return sourceRange(source, 0);
}
function attributeOffset(source, node, name) {
  const location = node.sourceCodeLocation;
  const attr = location && "attrs" in location ? location.attrs?.[name] : void 0;
  if (attr) return sourceRange(source, attr.startOffset, attr.endOffset);
  return locationFor(source, node);
}
function rangeOfValue(source, node, name, value) {
  const attrRange = attributeOffset(source, node, name);
  const offset = source.indexOf(value, attrRange.start);
  return offset < 0 ? attrRange : sourceRange(source, offset, offset + Math.max(value.length, 1));
}
function urlCategory2(value) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|data:)/i.test(value)) return "runtime-bound";
  if (value.startsWith("/") || value.startsWith("../")) return "normalizable";
  return "native";
}
function walk(node, visit) {
  for (const child of node.childNodes) {
    if (child.nodeName !== "#text" && child.nodeName !== "#comment" && "tagName" in child) {
      visit(child);
      walk(child, visit);
    }
  }
}
function syntaxDiagnostics(source, sourcePath) {
  const diagnostics = [];
  const stack = [];
  const tokenPattern = /<\/?([a-z][\w:-]*)(?:\s[^<>]*?)?\/?\s*>/gi;
  for (const match of source.matchAll(tokenPattern)) {
    const name = match[1]?.toLowerCase();
    if (!name || voidElements.has(name) || match[0]?.startsWith("<!")) continue;
    const start = match.index ?? 0;
    if (match[0]?.startsWith("</")) {
      const last = stack.pop();
      if (last?.name !== name) {
        diagnostics.push(
          diagnostic({
            code: "html-unbalanced-tag",
            severity: "error",
            sourcePath,
            sourceRange: sourceRange(source, start, start + match[0].length),
            rule: "html-grammar",
            expected: `closing </${last?.name ?? "known element"}>`,
            actual: match[0],
            hint: "Close HTML elements in their opening order."
          })
        );
      }
    } else if (!match[0]?.endsWith("/>")) stack.push({ name, index: start });
  }
  for (const entry of stack) {
    diagnostics.push(
      diagnostic({
        code: "html-unclosed-tag",
        severity: "error",
        sourcePath,
        sourceRange: sourceRange(
          source,
          entry.index,
          entry.index + Math.max(entry.name.length + 1, 2)
        ),
        rule: "html-grammar",
        expected: `closing </${entry.name}>`,
        actual: "end of source",
        hint: `Add a closing </${entry.name}> tag.`
      })
    );
  }
  return diagnostics;
}
function parseHtmlAuthoring(source, sourcePath) {
  const diagnostics = syntaxDiagnostics(source, sourcePath);
  const references = [];
  let category = "native";
  const parts = /* @__PURE__ */ new Set();
  let inputWithoutLabel;
  const fragment = parseFragment(source, { sourceCodeLocationInfo: true });
  walk(fragment, (element) => {
    const tag = element.tagName.toLowerCase();
    const elementRange = locationFor(source, element);
    if (tag === "script" || !UI_AUTHORING_PROFILE.html.nativeElements.includes(tag)) {
      category = "runtime-bound";
      diagnostics.push(
        diagnostic({
          code: "runtime-html-surface",
          severity: "error",
          sourcePath,
          sourceRange: elementRange,
          rule: "html-native-elements",
          expected: "a supported semantic HTML element",
          actual: `<${tag}>`,
          hint: "Move executable or custom runtime markup into a framework island."
        })
      );
    }
    if (tag === "template" && !element.attrs.some(
      (attr) => attr.name === "data-ui-template" && attr.value.trim().length > 0
    )) {
      category = "runtime-bound";
      diagnostics.push(
        diagnostic({
          code: "invalid-template",
          severity: "error",
          sourcePath,
          sourceRange: elementRange,
          rule: "html-template-hook",
          expected: "template[data-ui-template] with a non-empty name",
          actual: "<template>",
          hint: "Name templates with data-ui-template so the consumer can clone them explicitly."
        })
      );
    }
    for (const attr of element.attrs) {
      const name = attr.name.toLowerCase();
      const value = attr.value;
      const range = attributeOffset(source, element, attr.name);
      if (name.startsWith("on")) {
        category = "runtime-bound";
        diagnostics.push(
          diagnostic({
            code: "runtime-event-handler",
            severity: "error",
            sourcePath,
            sourceRange: range,
            rule: "html-event-handlers",
            expected: "data-ui-action with a consumer-side listener",
            actual: name,
            hint: "Remove inline event handlers and bind behavior from the framework island."
          })
        );
      } else if (name === "style") {
        category = category === "runtime-bound" ? category : "normalizable";
        diagnostics.push(
          diagnostic({
            code: "inline-style",
            severity: "error",
            sourcePath,
            sourceRange: range,
            rule: "html-inline-style",
            expected: "stylesheet-owned declarations",
            actual: value,
            hint: "Move inline declarations to the companion CSS source."
          })
        );
      } else if (name.startsWith("data-ui-") || name === "data-framework-island") {
        if (!allowedHookNames.has(name) || value.trim().length === 0) {
          category = "runtime-bound";
          diagnostics.push(
            diagnostic({
              code: "invalid-ui-hook",
              severity: "error",
              sourcePath,
              sourceRange: range,
              rule: "html-ui-hooks",
              expected: "a supported non-empty ForgeaX UI hook",
              actual: `${name}=${value}`,
              hint: "Use data-ui-part, data-ui-action, data-ui-template, or data-framework-island with a non-empty value."
            })
          );
        }
        if (name === "data-ui-part" && value.trim().length > 0) {
          if (parts.has(value))
            diagnostics.push(
              diagnostic({
                code: "duplicate-ui-part",
                severity: "warning",
                sourcePath,
                sourceRange: range,
                rule: "html-ui-part-unique",
                expected: "one element per data-ui-part value",
                actual: value,
                hint: "Rename one part so scenario selectors remain unambiguous."
              })
            );
          parts.add(value);
        }
      } else if (urlAttributes.has(name) && value.length > 0) {
        const urlClass = urlCategory2(value);
        if (urlClass !== "native") {
          category = category === "runtime-bound" ? category : urlClass;
          diagnostics.push(
            diagnostic({
              code: urlClass === "runtime-bound" ? "runtime-url" : "root-absolute-url",
              severity: "error",
              sourcePath,
              sourceRange: rangeOfValue(source, element, attr.name, value),
              rule: "html-companion-url",
              expected: "a package-relative companion or #fragment URL",
              actual: value,
              hint: urlClass === "runtime-bound" ? "Use a package-relative companion URL." : "Remove the leading root or parent traversal from the URL."
            })
          );
        }
        if (!value.startsWith("#"))
          references.push({ value, range: rangeOfValue(source, element, attr.name, value) });
      }
      if (tag === "input" && name === "id") inputWithoutLabel = element;
    }
    if (tag === "input" && !element.attrs.some((attr) => attr.name === "aria-label" || attr.name === "aria-labelledby"))
      inputWithoutLabel = element;
  });
  if (inputWithoutLabel && !source.includes("<label")) {
    diagnostics.push(
      diagnostic({
        code: "missing-accessible-label",
        severity: "warning",
        sourcePath,
        sourceRange: locationFor(source, inputWithoutLabel),
        rule: "html-accessible-label",
        expected: "label, aria-label, or aria-labelledby",
        actual: inputWithoutLabel.tagName,
        hint: "Associate the control with an accessible label."
      })
    );
  }
  return { sourcePath, source, category, diagnostics, references };
}

// src/authoring/index.ts
function classifyUiAuthoring(input) {
  const html = parseHtmlAuthoring(input.html, input.sourcePath);
  const css = parseCssAuthoring(input.css, input.sourcePath.replace(/\.html?$/i, ".css"));
  const diagnostics = [...html.diagnostics, ...css.diagnostics];
  const category = pickClassification(
    { category: html.category, blocking: html.category !== "native" },
    { category: css.category, blocking: css.category !== "native" }
  );
  return {
    category: category.category,
    blocking: hasBlockingDiagnostics(diagnostics),
    diagnostics
  };
}
async function validateUiAuthoring(input) {
  const html = parseHtmlAuthoring(input.html, input.sourcePath);
  const css = parseCssAuthoring(input.css, input.sourcePath.replace(/\.html?$/i, ".css"));
  const diagnostics = [...html.diagnostics, ...css.diagnostics];
  const references = [...html.references, ...css.references];
  if (input.readCompanion) {
    for (const reference of references) {
      const path = reference.value.split(/[?#]/, 1)[0] ?? "";
      if (!path || path.startsWith("#")) continue;
      const companion = await input.readCompanion(path);
      if (!companion.ok) {
        diagnostics.push({
          code: "companion-missing",
          severity: "error",
          sourcePath: input.sourcePath,
          sourceRange: reference.range,
          rule: "companion-readable",
          expected: "a readable package-relative companion",
          actual: path,
          hint: "Add the companion file at the attempted path and rerun validation.",
          relatedLocations: [
            { sourcePath: path, sourceRange: { start: 0, end: 1, line: 1, column: 1 } }
          ]
        });
      }
    }
  }
  const classification = pickClassification(
    { category: html.category, blocking: html.category !== "native" },
    { category: css.category, blocking: css.category !== "native" }
  );
  if (hasBlockingDiagnostics(diagnostics)) {
    return {
      ok: false,
      error: new ImportError({
        code: "source-validation-failed",
        expected: "HTML, CSS, and companions within the UiAuthoringProfile",
        hint: "Inspect err.detail.diagnostics and fix each error before importing.",
        detail: { diagnostics }
      })
    };
  }
  return {
    ok: true,
    value: {
      html: input.html,
      css: input.css,
      category: classification.category,
      diagnostics,
      references: references.map((entry) => entry.value)
    }
  };
}

// src/importer/css.ts
function toLegacyError(diagnostic2) {
  return {
    code: diagnostic2.code.includes("url") ? "invalid-url" : "unsafe-html",
    message: diagnostic2.actual,
    location: diagnostic2.sourceRange
  };
}
function validateCssSource(source) {
  const result = parseCssAuthoring(source, "<inline>.ui.css");
  const blocking = result.diagnostics.find((entry) => entry.severity === "error");
  return blocking ? { ok: false, error: toLegacyError(blocking) } : { ok: true, value: { css: source } };
}
function cssAssetUrls(source) {
  return parseCssAuthoring(source, "<inline>.ui.css").references.map((entry) => entry.value);
}

// src/importer/finalize.ts
function isUiArtifactPayload(value) {
  if (value === null || typeof value !== "object") return false;
  const candidate = value;
  return typeof candidate.guid === "string" && typeof candidate.html === "string" && typeof candidate.css === "string";
}
var TOKEN = /ui-token:([^\s"')>]+)/g;
function uiArtifactMimeType(path) {
  const lower = path.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".woff2")) return "font/woff2";
  return void 0;
}
function rewriteUiSourceTokens(source, urls) {
  const rewritten = source.replace(TOKEN, (full, path) => urls.get(path) ?? full);
  const unresolved = rewritten.match(TOKEN);
  return unresolved?.[0] === void 0 ? { ok: true, value: rewritten } : { ok: false, token: unresolved[0] };
}
function rewrite(value, artifacts, url) {
  const urls = /* @__PURE__ */ new Map();
  for (const [path, artifact] of artifacts) {
    urls.set(path, url({ path, mimeType: artifact.mediaType, bytes: artifact.bytes }));
  }
  return rewriteUiSourceTokens(value, urls);
}
function finalizeUiArtifact(product, options) {
  const asset = product.assets[0];
  if (asset === void 0 || asset.kind !== "ui" || !isUiArtifactPayload(asset.payload)) {
    return {
      ok: false,
      error: {
        code: "ui-artifact-payload-invalid",
        expected: "one ui ImportedAsset with guid, html, and css payload",
        hint: "Return a validated UI asset before finalizing transport artifacts.",
        detail: {}
      }
    };
  }
  const payload = asset.payload;
  const artifacts = new Map(Object.entries(asset.artifacts));
  const html = rewrite(payload.html, artifacts, options.artifactUrl);
  const css = rewrite(payload.css, artifacts, options.artifactUrl);
  if (!html.ok) {
    return {
      ok: false,
      error: {
        code: "ui-artifact-token-unresolved",
        expected: "every ui-token reference to resolve to an imported artifact",
        hint: "Add the referenced companion artifact to the ImportProduct before transport.",
        detail: { token: html.token, guid: asset.guid }
      }
    };
  }
  if (!css.ok) {
    return {
      ok: false,
      error: {
        code: "ui-artifact-token-unresolved",
        expected: "every ui-token reference to resolve to an imported artifact",
        hint: "Add the referenced companion artifact to the ImportProduct before transport.",
        detail: { token: css.token, guid: asset.guid }
      }
    };
  }
  return {
    ok: true,
    value: {
      asset: {
        ...payload,
        html: html.value,
        css: css.value
      },
      artifacts: Object.entries(asset.artifacts).map(([path, artifact]) => ({
        path,
        mimeType: artifact.mediaType
      }))
    }
  };
}

// src/importer/html.ts
function toLegacyError2(diagnostic2) {
  return {
    code: diagnostic2.code.includes("template") ? "invalid-template" : diagnostic2.code.includes("url") ? "invalid-url" : "unsafe-html",
    message: diagnostic2.actual,
    location: diagnostic2.sourceRange
  };
}
function validateHtmlSource(source) {
  const result = parseHtmlAuthoring(source, "<inline>.ui.html");
  const blocking = result.diagnostics.find((entry) => entry.severity === "error");
  return blocking ? { ok: false, error: toLegacyError2(blocking) } : { ok: true, value: source };
}
function htmlAssetUrls(source) {
  return parseHtmlAuthoring(source, "<inline>.ui.html").references.map((entry) => entry.value);
}

// src/importer/index.ts
function importFailure(reason) {
  return {
    ok: false,
    error: new ImportError({
      code: "import-internal-error",
      expected: "a valid UI author source and readable local companions",
      hint: "Fix the UI source or add the referenced companion file.",
      detail: { reason }
    })
  };
}
function validationFailure(diagnostics) {
  return {
    ok: false,
    error: new ImportError({
      code: "source-validation-failed",
      expected: "HTML, CSS, and companions within the UiAuthoringProfile",
      hint: "Inspect err.detail.diagnostics and fix each source-located error.",
      detail: { diagnostics }
    })
  };
}
function relativePath(reference) {
  const clean = reference.split(/[?#]/, 1)[0] ?? "";
  if (clean.length === 0 || clean.startsWith("/") || clean.startsWith("\\")) return void 0;
  const parts = clean.split("/");
  const out = [];
  for (const part of parts) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      if (out.length === 0) return void 0;
      out.pop();
    } else out.push(part);
  }
  return out.join("/");
}
function mimeType(path) {
  const lower = path.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".woff2")) return "font/woff2";
  if (lower.endsWith(".woff")) return "font/woff";
  return "application/octet-stream";
}
function importUiSource(source) {
  const classification = classifyUiAuthoring({
    sourcePath: `${source.guid}.ui.html`,
    html: source.html,
    css: source.css
  });
  if (classification.blocking) return validationFailure(classification.diagnostics);
  return {
    ok: true,
    value: {
      assets: [
        {
          guid: source.guid,
          kind: "ui",
          payload: { guid: source.guid, html: source.html, css: source.css },
          refs: [],
          artifacts: {}
        }
      ],
      sourceDependencies: []
    }
  };
}
function createUiImporter() {
  return {
    key: "ui",
    async import(context) {
      const source = await context.readSource();
      if (!source.ok) return importFailure(`unable to read UI source: ${String(source.error)}`);
      const htmlText = new TextDecoder().decode(source.value);
      const guid = context.subAssets[0]?.guid;
      if (guid === void 0) return importFailure("meta.subAssets must declare one UI GUID");
      const fileName = context.source.slice(context.source.lastIndexOf("/") + 1);
      const cssPath = fileName.replace(/\.ui\.html$/i, ".ui.css");
      const cssRead = await context.readSibling(cssPath);
      if (!cssRead.ok) return importFailure(`missing UI stylesheet companion: ${cssPath}`);
      const cssText = new TextDecoder().decode(cssRead.value);
      const validation = await validateUiAuthoring({
        sourcePath: context.source,
        html: htmlText,
        css: cssText,
        readCompanion: async (path) => {
          const read = await context.readSibling(path);
          return read.ok ? { ok: true } : {
            ok: false,
            path,
            reason: "reason" in read.error.detail ? read.error.detail.reason : read.error.message
          };
        }
      });
      if (!validation.ok) {
        if ("diagnostics" in validation.error.detail)
          return validationFailure(validation.error.detail.diagnostics);
        return importFailure(validation.error.message);
      }
      const references = [...htmlAssetUrls(htmlText), ...cssAssetUrls(cssText)];
      const unique = [...new Set(references)];
      const artifacts = {};
      const dependencies = [context.source, cssPath];
      let htmlOut = htmlText;
      let cssOut = cssText;
      for (const reference of unique) {
        const path = relativePath(reference);
        if (path === void 0) return importFailure(`unsafe UI companion URL: ${reference}`);
        const read = await context.readSibling(path);
        if (!read.ok) return importFailure(`missing UI companion: ${path}`);
        dependencies.push(path);
        artifacts[path] = { mediaType: mimeType(path), bytes: read.value };
        const token = `ui-token:${path}`;
        htmlOut = htmlOut.replaceAll(reference, token);
        cssOut = cssOut.replaceAll(reference, token);
      }
      return {
        ok: true,
        value: {
          assets: [
            {
              guid,
              kind: "ui",
              payload: { guid, html: htmlOut, css: cssOut },
              refs: [],
              artifacts
            }
          ],
          sourceDependencies: dependencies
        }
      };
    },
    finalize(product, options) {
      return finalizeUiArtifact(product, options);
    }
  };
}

export { createUiImporter, cssAssetUrls, finalizeUiArtifact, htmlAssetUrls, importUiSource, rewriteUiSourceTokens, uiArtifactMimeType, validateCssSource, validateHtmlSource };
