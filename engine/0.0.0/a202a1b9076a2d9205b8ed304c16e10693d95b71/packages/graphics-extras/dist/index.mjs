import { PROCEDURAL_FLOATS_PER_VERTEX, buildMeshAttributeMapForUvSets } from '../../geometry/dist/index.mjs';
import { TextError, ok as ok$1, err } from '../../types/dist/index.mjs';
import { ok } from '../../rhi/dist/index.mjs';
import { defineComponent } from '../../ecs/dist/index.mjs';

// src/glyph-layout.ts
var VERTEX_OFFSET = {
  position: 0,
  // vec3
  normal: 3,
  // vec3 (placeholder (0,0,1))
  uv: 6,
  // vec2
  tangent: 8
  // vec4 (placeholder (0,0,0,1))
};
var FONT_CONCURRENCY_LIMIT = 8;
var activeFontIds = /* @__PURE__ */ new Set();
function resetFontConcurrency() {
  activeFontIds.clear();
}
function trackFontConcurrency(fontId) {
  if (activeFontIds.has(fontId)) return;
  if (activeFontIds.size >= FONT_CONCURRENCY_LIMIT) {
    throw new TextError({
      code: "font-concurrency-exceeded",
      expected: String(FONT_CONCURRENCY_LIMIT),
      hint: "reuse a shared FontAsset across labels, or split text into fewer distinct fonts per frame",
      detail: { active: activeFontIds.size, limit: FONT_CONCURRENCY_LIMIT, rejected: fontId }
    });
  }
  activeFontIds.add(fontId);
}
var NEWLINE = "\n".codePointAt(0);
function layoutGlyphText(font, text, fontSize) {
  const s = fontSize;
  const { atlasWidth, atlasHeight, lineHeight } = font.common;
  const quads = [];
  let penX = 0;
  let penY = 0;
  let maxCornerDist = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp === NEWLINE) {
      penX = 0;
      penY -= lineHeight * s;
      continue;
    }
    const metric = font.glyphs[cp] ?? font.notdef;
    if (metric === void 0) {
      continue;
    }
    const x0 = penX + metric.bearingX * s;
    const yTop = penY - metric.bearingY * s + metric.size.h * s;
    const yBot = penY - metric.bearingY * s;
    const x1 = x0 + metric.size.w * s;
    quads.push({ x0, y0: yBot, x1, y1: yTop, m: metric });
    maxCornerDist = Math.max(
      maxCornerDist,
      Math.hypot(x0, yBot),
      Math.hypot(x1, yBot),
      Math.hypot(x0, yTop),
      Math.hypot(x1, yTop)
    );
    penX += metric.advance * s;
  }
  const glyphCount = quads.length;
  const vertices = new Float32Array(glyphCount * 4 * PROCEDURAL_FLOATS_PER_VERTEX);
  const indices = new Uint16Array(glyphCount * 6);
  for (let g = 0; g < glyphCount; g++) {
    const q = quads[g];
    const { region } = q.m;
    const u0 = region.x / atlasWidth;
    const u1 = (region.x + region.w) / atlasWidth;
    const v0 = region.y / atlasHeight;
    const v1 = (region.y + region.h) / atlasHeight;
    writeVertex(vertices, g * 4 + 0, q.x0, q.y1, u0, v0);
    writeVertex(vertices, g * 4 + 1, q.x1, q.y1, u1, v0);
    writeVertex(vertices, g * 4 + 2, q.x1, q.y0, u1, v1);
    writeVertex(vertices, g * 4 + 3, q.x0, q.y0, u0, v1);
    const vbase = g * 4;
    const ibase = g * 6;
    indices[ibase + 0] = vbase + 0;
    indices[ibase + 1] = vbase + 1;
    indices[ibase + 2] = vbase + 2;
    indices[ibase + 3] = vbase + 0;
    indices[ibase + 4] = vbase + 2;
    indices[ibase + 5] = vbase + 3;
  }
  return { vertices, indices, radius: maxCornerDist };
}
function writeVertex(out, vertexIndex, x, y, u, v) {
  const o = vertexIndex * PROCEDURAL_FLOATS_PER_VERTEX;
  out[o + VERTEX_OFFSET.position + 0] = x;
  out[o + VERTEX_OFFSET.position + 1] = y;
  out[o + VERTEX_OFFSET.position + 2] = 0;
  out[o + VERTEX_OFFSET.normal + 0] = 0;
  out[o + VERTEX_OFFSET.normal + 1] = 0;
  out[o + VERTEX_OFFSET.normal + 2] = 1;
  out[o + VERTEX_OFFSET.uv + 0] = u;
  out[o + VERTEX_OFFSET.uv + 1] = v;
  out[o + VERTEX_OFFSET.tangent + 0] = 0;
  out[o + VERTEX_OFFSET.tangent + 1] = 0;
  out[o + VERTEX_OFFSET.tangent + 2] = 0;
  out[o + VERTEX_OFFSET.tangent + 3] = 1;
}
function buildGlyphMeshAsset(layout) {
  const { vertices, indices, radius } = layout;
  return {
    kind: "mesh",
    vertices,
    indices,
    // `attributes.position` carries the 8 conservative-cube corners (half-side
    // = radius) so `register` computes the orientation-independent cube AABB
    // (D-5). The GPU vertex buffer is built from the interleaved `vertices`
    // (uploadMeshById reads `mesh.vertices`), fully decoupled from this
    // position attribute -- which exists only to drive `computeAABB`.
    attributes: {
      // Keep the conservative pick/cull position stream and the canonical
      // 12-float upload layout in one geometry-owned projection.
      ...buildMeshAttributeMapForUvSets(1),
      position: cubeCornerAttributes(radius).position
    },
    submeshes: [
      {
        indexOffset: 0,
        indexCount: indices.length,
        vertexCount: vertices.length / PROCEDURAL_FLOATS_PER_VERTEX,
        topology: "triangle-list",
        materialSlot: 0
      }
    ],
    materialSlots: [{ slotName: "Default" }]
  };
}
function conservativeCubeAabb(radius) {
  return Float32Array.of(-radius, -radius, -radius, radius, radius, radius);
}
function bakeGlyphMesh(world, layout) {
  const aabb = conservativeCubeAabb(layout.radius);
  const meshAsset = { ...buildGlyphMeshAsset(layout), aabb };
  const handle = world.allocSharedRef("MeshAsset", meshAsset);
  return ok({ handle, aabb });
}
function cubeCornerAttributes(radius) {
  const r = radius;
  return {
    position: Float32Array.of(
      -r,
      -r,
      -r,
      r,
      -r,
      -r,
      r,
      r,
      -r,
      -r,
      r,
      -r,
      -r,
      -r,
      r,
      r,
      -r,
      r,
      r,
      r,
      r,
      -r,
      r,
      r
    )
  };
}

// src/tile-bits.ts
var TILE_ID_MAX = 268435455;
var FLIP_H_BIT = 1 << 31;
var FLIP_V_BIT = 1 << 30;
var FLIP_D_BIT = 1 << 29;
var FLIP_HEX120_BIT = 1 << 28;
function encodeTileBits(tileId, flipH, flipV, flipDiagonal, flipHex120) {
  if (!Number.isInteger(tileId) || tileId < 0 || tileId > TILE_ID_MAX) {
    throw new RangeError(
      `encodeTileBits: tileId must be an integer in [0, ${TILE_ID_MAX}]; got ${tileId}`
    );
  }
  let packed = tileId >>> 0;
  if (flipH) packed |= FLIP_H_BIT;
  if (flipV) packed |= FLIP_V_BIT;
  if (flipDiagonal) packed |= FLIP_D_BIT;
  if (flipHex120) packed |= FLIP_HEX120_BIT;
  return packed >>> 0;
}
function decodeTileBits(packed) {
  const u = packed >>> 0;
  return {
    tileId: u & TILE_ID_MAX,
    flipH: (u & FLIP_H_BIT) !== 0,
    flipV: (u & FLIP_V_BIT) !== 0,
    flipDiagonal: (u & FLIP_D_BIT) !== 0,
    flipHex120: (u & FLIP_HEX120_BIT) !== 0
  };
}
var tilesetContribution = {
  kind: { kind: "tileset" },
  consumer: "tilemapChunkExtractSystem (physics consumer: missing evidence)",
  decoder: {
    async decode({ envelope }) {
      const payload = envelope.payload;
      if (payload !== null && typeof payload === "object") {
        const source = payload;
        const rawAtlases = source.atlases;
        const regions = source.regions;
        const tiles = source.tiles;
        const atlases = Array.isArray(rawAtlases) ? rawAtlases.map(
          (value) => typeof value === "number" && Number.isSafeInteger(value) ? envelope.refs[value] : value
        ) : void 0;
        if (source.kind === "tileset" && atlases !== void 0 && atlases.length > 0 && atlases.every(
          (atlas) => typeof atlas === "string" && atlas.length > 0
        ) && Array.isArray(regions) && regions.length > 0 && Array.isArray(tiles) && tiles.every(
          (tile) => tile !== null && typeof tile === "object" && typeof tile.regionIndex === "number" && tile.regionIndex >= 0 && tile.regionIndex < regions.length
        )) {
          return ok$1({
            ...source,
            kind: "tileset",
            atlases,
            regions,
            tiles
          });
        }
      }
      return err({
        code: "asset-package-invalid",
        expected: "a tileset with atlas GUIDs and in-range tile regions",
        hint: "repair the tileset regions; physics consumption is not installed by this owner",
        detail: { guid: envelope.guid, reason: "tileset owner validation failed" }
      });
    }
  }
};
var VIDEO_URL_RESOLUTION_BASE = "https://forgeax.invalid/";
var VIDEO_URL_WHITESPACE = /\s/u;
function hasVideoUrlControlCharacter(value) {
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code <= 31 || code === 127) return true;
  }
  return false;
}
function isBrowserResolvableVideoUrl(value) {
  if (typeof value !== "string" || value.length === 0 || value.trim().length === 0 || value !== value.trim() || hasVideoUrlControlCharacter(value) || VIDEO_URL_WHITESPACE.test(value) || value.startsWith("//")) {
    return false;
  }
  try {
    const resolved = new URL(value, VIDEO_URL_RESOLUTION_BASE);
    return resolved.protocol === "http:" || resolved.protocol === "https:";
  } catch {
    return false;
  }
}
var videoLoader = {
  kind: "video",
  load(payload) {
    if (!isBrowserResolvableVideoUrl(payload.url)) return void 0;
    return { kind: "video", url: payload.url };
  }
};
var videoContribution = {
  kind: { kind: "video" },
  consumer: "VideoSourceProvider",
  decoder: {
    async decode({ envelope }) {
      const payload = envelope.payload;
      return payload.kind === "video" && isBrowserResolvableVideoUrl(payload.url) ? ok$1(payload) : err({
        code: "asset-package-invalid",
        expected: "a browser-resolvable video URL descriptor",
        hint: "publish an http(s) video URL and let the host create the video element",
        detail: { guid: envelope.guid, reason: "video owner validation failed" }
      });
    }
  }
};
var VideoPlayer = defineComponent("VideoPlayer", {
  // The host HTMLVideoElement owns the live asset/presentation binding; the
  // portable play controls remain in the simulation projection.
  clip: { type: "shared<VideoAsset>" },
  playing: { type: "bool", default: false },
  loop: { type: "bool", default: false },
  currentTime: { type: "f32", default: 0, transient: true }
});

// src/video-player-system.ts
function probeVideoHighPerfUpload(device) {
  if (device === void 0) return false;
  if (device.caps.backendKind !== "webgpu") return false;
  return typeof device.importExternalTexture === "function";
}

// src/video-source-provider.ts
var VIDEO_SOURCE_PROVIDER_KEY = "VideoSourceProvider";
function videoSourceExtent(source) {
  const width = "videoWidth" in source ? source.videoWidth : source.displayWidth;
  const height = "videoHeight" in source ? source.videoHeight : source.displayHeight;
  if (width <= 0 || height <= 0 || "readyState" in source && source.readyState < 2)
    return void 0;
  return { width, height };
}

export { FONT_CONCURRENCY_LIMIT, VERTEX_OFFSET, VIDEO_SOURCE_PROVIDER_KEY, VideoPlayer, bakeGlyphMesh, buildGlyphMeshAsset, conservativeCubeAabb, decodeTileBits, encodeTileBits, layoutGlyphText, probeVideoHighPerfUpload, resetFontConcurrency, tilesetContribution, trackFontConcurrency, videoContribution, videoLoader, videoSourceExtent };
