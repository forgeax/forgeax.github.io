import { ok, err } from '../../types/dist/index.mjs';

// src/artifact-path.ts
var PATH_HINT = "use a normalized package-relative artifact path without traversal, absolute prefixes, or remote URLs";
function validateArtifactPath(locator, context) {
  const decoded = decodeLocator(locator);
  if (!decoded.ok) return invalidPath(locator, context);
  const normalized = normalizeRelativePath(decoded.value);
  if (!normalized) return invalidPath(locator, context);
  return ok(normalized);
}
function decodeLocator(locator) {
  let decoded = locator;
  try {
    for (let pass = 0; pass < 3; pass += 1) {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
  } catch {
    return err(null);
  }
  return ok(decoded);
}
function normalizeRelativePath(locator) {
  if (locator.length === 0 || locator.includes("://")) return null;
  if (locator.startsWith("/") || /^[A-Za-z]:[\\/]/.test(locator)) return null;
  const segments = locator.replaceAll("\\", "/").split("/");
  const normalized = [];
  for (const segment of segments) {
    if (segment === "..") return null;
    if (segment === "" || segment === ".") continue;
    normalized.push(segment);
  }
  return normalized.length > 0 ? normalized.join("/") : null;
}
function invalidPath(locator, context) {
  return err({
    code: "asset-artifact-path-invalid",
    expected: "a normalized package-relative artifact path",
    hint: PATH_HINT,
    detail: {
      guid: context.guid,
      artifactKey: context.artifactKey,
      observed: locator,
      expected: context.packageRoot
    }
  });
}

export { validateArtifactPath };
