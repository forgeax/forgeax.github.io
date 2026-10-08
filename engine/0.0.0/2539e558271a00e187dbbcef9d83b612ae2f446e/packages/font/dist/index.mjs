import { AssetGuid } from '../../pack/dist/guid.mjs';
import { ok, err } from '../../types/dist/index.mjs';

// src/runtime/font-decoder.ts
function parseGuid(value) {
  if (value instanceof Uint8Array && value.length === 16) return value;
  if (Array.isArray(value) && value.length === 16 && value.every((item) => Number.isInteger(item) && item >= 0 && item <= 255)) {
    return Uint8Array.from(value);
  }
  if (typeof value !== "string") return void 0;
  const parsed = AssetGuid.parse(value);
  return parsed.ok ? parsed.value : void 0;
}
function validCommon(value) {
  if (value === null || typeof value !== "object") return false;
  const common = value;
  return ["lineHeight", "base", "distanceRange", "pxRange", "atlasWidth", "atlasHeight"].every(
    (key) => typeof common[key] === "number" && Number.isFinite(common[key])
  );
}
var fontContribution = {
  kind: { kind: "font" },
  consumer: "GlyphTextLayout",
  decoder: {
    async decode({ envelope }) {
      const payload = envelope.payload;
      if (payload !== null && typeof payload === "object") {
        const source = payload;
        const atlas = parseGuid(source.atlas ?? source.atlasGuid);
        const sampler = parseGuid(source.sampler ?? source.samplerGuid);
        if ((source.kind === void 0 || source.kind === "font") && atlas !== void 0 && sampler !== void 0 && source.glyphs !== null && typeof source.glyphs === "object" && validCommon(source.common)) {
          return ok({
            kind: "font",
            atlas,
            sampler,
            glyphs: source.glyphs,
            common: source.common,
            ...source.notdef === void 0 ? {} : { notdef: source.notdef }
          });
        }
      }
      return err({
        code: "asset-package-invalid",
        expected: "a font payload with atlas and sampler references",
        hint: "recook the font atlas and publish its local sub-assets",
        detail: { guid: envelope.guid, reason: "font owner validation failed" }
      });
    }
  }
};

export { fontContribution };
