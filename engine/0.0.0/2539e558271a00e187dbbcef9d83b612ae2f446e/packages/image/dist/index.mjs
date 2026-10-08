import { IMAGE_ERROR_HINTS, err, ok } from '../../types/dist/index.mjs';
export { err, ok } from '../../types/dist/index.mjs';
import { AssetGuid } from '../../pack/dist/guid.mjs';
import { parseKtx2, transcodeKtx2, transcodeBasis } from '../../codec/dist/index.mjs';

// src/errors.ts
var IMAGE_ERROR_EXPECTED = {
  "image-decode-failed": "PNG / JPG byte stream decodes successfully",
  "image-format-unsupported": "mime is one of ['image/png', 'image/jpeg']; uploadTexture format <-> colorSpace family agrees",
  "image-dimension-out-of-bounds": "width and height fall under device caps maxTextureDimension2D (or 16384 hard cap)",
  "image-meta-missing": "<source>.meta.json sidecar (importer: 'image') exists in the same directory",
  "image-hdr-decode-failed": "Radiance RGBE header is valid and pixel data decodes successfully",
  // feat-20260521-sprite-atlas-animation M1 T-03 — vite-plugin-image atlas
  // hook .expected literals (plan-strategy section 2 D-2 + AC-10 a/b/c).
  // ImageErrorImpl construction path is unchanged: the new atlas-* errors
  // flow through `new ImageErrorImpl({ code: 'atlas-...', ...detail })` and
  // pick the .expected string up from this Record at construction time
  // (charter P3 explicit failure SSOT — AI users surface .expected next to
  // .hint after switch (err.code) without parsing the message).
  "atlas-empty-input": "images.length >= 1",
  "atlas-size-exceeded": "image width x height <= maxAtlasSize^2 and each image fits in the atlas footprint",
  "atlas-region-mismatch": "sum(regions[i].w x regions[i].h) <= atlasWidth x atlasHeight",
  "image-surface-invalid": "PixelSurface dimensions and authoring inputs satisfy the RGBA8 contract"
};
var ImageErrorImpl = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(detail) {
    const code = detail.code;
    const expected = IMAGE_ERROR_EXPECTED[code];
    const hint = IMAGE_ERROR_HINTS[code];
    super(`[ImageError ${code}] expected: ${expected}; hint: ${hint}`);
    this.name = "ImageError";
    this.code = code;
    this.expected = expected;
    this.hint = hint;
    this.detail = detail;
  }
};
function imageError(detail) {
  return new ImageErrorImpl(detail);
}

// src/hdr-decoder.ts
var LF = 10;
function decodeHdr(bytes) {
  let pos = 0;
  if (bytes.length < 11) {
    return err(hdrDecodeError("file too short for Radiance HDR header"));
  }
  const magic = String.fromCharCode(...bytes.subarray(0, 11));
  if (magic !== "#?RADIANCE\n" && magic !== "#?RGBE\n") {
    return err(
      hdrDecodeError("missing or invalid Radiance HDR magic; expected #?RADIANCE or #?RGBE")
    );
  }
  pos = 11;
  let formatFound = false;
  while (pos < bytes.length) {
    const lineEnd = findByte(bytes, LF, pos);
    if (lineEnd === -1) return err(hdrDecodeError("header truncated before empty line"));
    const line = asciiSubstring(bytes, pos, lineEnd);
    pos = lineEnd + 1;
    if (line === "") break;
    if (line.startsWith("FORMAT=")) {
      const val = line.slice(7);
      if (val === "32-bit_rle_rgbe") {
        formatFound = true;
      }
    }
  }
  if (!formatFound) {
    return err(hdrDecodeError("missing or unsupported FORMAT; expected FORMAT=32-bit_rle_rgbe"));
  }
  if (pos >= bytes.length) return err(hdrDecodeError("missing resolution line"));
  const resLineEnd = findByte(bytes, LF, pos);
  if (resLineEnd === -1) return err(hdrDecodeError("resolution line truncated"));
  const resLine = asciiSubstring(bytes, pos, resLineEnd);
  pos = resLineEnd + 1;
  const resMatch = /^-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/.exec(resLine);
  if (resMatch === null) {
    return err(
      hdrDecodeError(`unexpected resolution line format: "${resLine}"; expected "-Y H +X W"`)
    );
  }
  const height = Number(resMatch[1]);
  const width = Number(resMatch[2]);
  if (height === void 0 || width === void 0 || height <= 0 || width <= 0) {
    return err(hdrDecodeError(`invalid dimensions: ${width}x${height}`));
  }
  const pixelCount = width * height;
  const rgbe = new Uint8Array(pixelCount * 4);
  const scanlineBytes = width * 4;
  for (let y = 0; y < height; y++) {
    if (pos + 4 > bytes.length) {
      return err(hdrDecodeError(`truncated at scanline ${y}: expected 4-byte prefix`));
    }
    const p0 = bytes[pos];
    const p1 = bytes[pos + 1];
    const pHi = bytes[pos + 2];
    const pLo = bytes[pos + 3];
    if (p0 === void 0 || p1 === void 0 || pHi === void 0 || pLo === void 0) {
      return err(hdrDecodeError(`truncated at scanline ${y}`));
    }
    const prefixWidth = pHi << 8 | pLo;
    if (p0 === 2 && p1 === 2 && prefixWidth === width && width >= 8 && width <= 32767) {
      const decoded = decodeNewRleScanline(bytes, pos + 4, width);
      if (decoded === null) {
        return err(hdrDecodeError(`RLE decode failed at scanline ${y}`));
      }
      const base = y * scanlineBytes;
      const channels = [decoded[0], decoded[1], decoded[2], decoded[3]];
      for (let x = 0; x < width; x++) {
        for (let ch = 0; ch < 4; ch++) {
          rgbe[base + x * 4 + ch] = channels[ch][x];
        }
      }
      pos += 4 + decoded.totalBytes;
    } else {
      return err(
        hdrDecodeError(
          "old-RLE format is not supported; only new-RLE (32-bit_rle_rgbe) is accepted"
        )
      );
    }
  }
  const out = new Float32Array(pixelCount * 4);
  for (let i = 0; i < pixelCount; i++) {
    const base = i * 4;
    const r = rgbe[base];
    const g = rgbe[base + 1];
    const b = rgbe[base + 2];
    const e = rgbe[base + 3];
    out[base + 3] = 1;
    if (e === 0) {
      out[base] = 0;
      out[base + 1] = 0;
      out[base + 2] = 0;
    } else {
      const f = 2 ** (e - 136);
      out[base] = (r + 0.5) * f;
      out[base + 1] = (g + 0.5) * f;
      out[base + 2] = (b + 0.5) * f;
    }
  }
  return ok({ width, height, data: out });
}
function decodeNewRleScanline(bytes, start, width) {
  const channels = [];
  let cursor = start;
  for (let ch = 0; ch < 4; ch++) {
    const data = new Uint8Array(width);
    let x = 0;
    while (x < width) {
      if (cursor >= bytes.length) return null;
      const code = bytes[cursor];
      cursor++;
      if (code > 128) {
        const count = code - 128;
        if (cursor >= bytes.length || x + count > width) return null;
        const val = bytes[cursor];
        cursor++;
        data.fill(val, x, x + count);
        x += count;
      } else {
        if (code === 0) continue;
        if (cursor + code > bytes.length || x + code > width) return null;
        for (let k = 0; k < code; k++) {
          data[x + k] = bytes[cursor + k];
        }
        cursor += code;
        x += code;
      }
    }
    channels.push(data);
  }
  const ch0 = channels[0];
  const ch1 = channels[1];
  const ch2 = channels[2];
  const ch3 = channels[3];
  if (ch0 === void 0 || ch1 === void 0 || ch2 === void 0 || ch3 === void 0) {
    return null;
  }
  return {
    0: ch0,
    1: ch1,
    2: ch2,
    3: ch3,
    totalBytes: cursor - start
  };
}
function findByte(bytes, target, start) {
  for (let i = start; i < bytes.length; i++) {
    if (bytes[i] === target) return i;
  }
  return -1;
}
function asciiSubstring(bytes, start, end) {
  let s = "";
  for (let i = start; i < end; i++) {
    s += String.fromCharCode(bytes[i]);
  }
  return s;
}
function hdrDecodeError(reason) {
  return imageError({
    code: "image-hdr-decode-failed",
    reason
  });
}

// src/image-decoder-browser.ts
async function decodeImageInBrowser(bytes, mime, opts = {}) {
  if (typeof createImageBitmap !== "function") {
    return err(
      imageError({
        code: "image-decode-failed",
        reason: "createImageBitmap is not available in this environment"
      })
    );
  }
  let bitmap;
  try {
    const blob = new Blob([bytes], { type: mime });
    bitmap = await createImageBitmap(blob, {
      colorSpaceConversion: "none",
      premultiplyAlpha: "none"
    });
  } catch (e) {
    return err(
      imageError({
        code: "image-decode-failed",
        reason: e instanceof Error ? e.message : String(e)
      })
    );
  }
  const canvas = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(bitmap.width, bitmap.height) : (() => {
    const c = document.createElement("canvas");
    c.width = bitmap.width;
    c.height = bitmap.height;
    return c;
  })();
  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    return err(
      imageError({
        code: "image-decode-failed",
        reason: "failed to acquire 2d canvas context for pixel readback"
      })
    );
  }
  ctx.drawImage(bitmap, 0, 0);
  const data = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  bitmap.close();
  return ok({
    bytes: new Uint8Array(data.data.buffer.slice(0)),
    width: data.width,
    height: data.height,
    mime,
    colorSpace: opts.colorSpace ?? "srgb",
    mipmap: opts.mipmap ?? true
  });
}

// src/image-decoder-node.ts
async function loadUpng() {
  const mod = await import('../../../vendor/upng-js/UPNG.js');
  return mod.default ?? mod;
}
async function loadJpeg() {
  const mod = await import('../../../vendor/jpeg-js/index.js');
  return mod.default ?? mod;
}

// src/to-asset-pack.ts
function toAssetPack(decoded, meta) {
  return {
    schemaVersion: "1.0.0",
    kind: "external-asset-package",
    importer: "image",
    source: "",
    importSettings: {
      colorSpace: meta.colorSpace,
      mipmap: meta.mipmap,
      addressMode: meta.addressMode,
      filterMode: meta.filterMode,
      ...meta.downscaleMaxDimension !== void 0 ? { downscaleMaxDimension: meta.downscaleMaxDimension } : {}
    },
    subAssets: [
      {
        guid: meta.guid,
        sourceIndex: 0,
        kind: "texture"
      }
    ]
  };
}

// src/pixel-surface.ts
function invalid(operation, field, value, expected) {
  return err(
    imageError({
      code: "image-surface-invalid",
      operation,
      field,
      value,
      expected
    })
  );
}
function finiteNumber(operation, field, value) {
  if (!Number.isFinite(value)) {
    return invalid(operation, field, String(value), "a finite number");
  }
  return ok(value);
}
function positiveDimension(operation, field, value) {
  if (!Number.isInteger(value) || value <= 0) {
    return invalid(operation, field, value, "a positive integer");
  }
  return ok(value);
}
function colorChannels(operation, color) {
  const channels = Array.isArray(color) ? color : color !== null && typeof color === "object" ? [
    color.r,
    color.g,
    color.b,
    color.a
  ] : void 0;
  if (channels === void 0 || channels.length !== 4) {
    return invalid(operation, "color", "malformed", "four finite RGBA8 channels");
  }
  const normalized = [0, 0, 0, 0];
  for (let index = 0; index < channels.length; index += 1) {
    const channel = channels[index];
    if (channel === void 0 || !Number.isFinite(channel) || channel < 0 || channel > 255) {
      return invalid(
        operation,
        `color[${index}]`,
        channel ?? "missing",
        "a finite number in [0, 255]"
      );
    }
    normalized[index] = Math.round(channel);
  }
  return ok(normalized);
}
function rounded(operation, field, value) {
  const result = finiteNumber(operation, field, value);
  return result.ok ? ok(Math.round(result.value)) : result;
}
function rectangle(operation, x, y, width, height) {
  const values = [x, y, width, height];
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === void 0 || !Number.isFinite(value)) {
      return invalid(
        operation,
        ["x", "y", "width", "height"][index] ?? "rectangle",
        String(value),
        "a finite number"
      );
    }
  }
  if (width <= 0 || height <= 0) {
    return invalid(
      operation,
      width <= 0 ? "width" : "height",
      width <= 0 ? width : height,
      "a positive number"
    );
  }
  return ok([Math.round(x), Math.round(y), Math.round(width), Math.round(height)]);
}
function writePixel(data, width, x, y, color) {
  if (x < 0 || y < 0 || x >= width) return;
  const offset = (y * width + x) * 4;
  data[offset] = color[0] ?? 0;
  data[offset + 1] = color[1] ?? 0;
  data[offset + 2] = color[2] ?? 0;
  data[offset + 3] = color[3] ?? 0;
}
function fillClippedRect(data, width, height, x, y, rectWidth, rectHeight, color) {
  const left = Math.max(0, x);
  const top = Math.max(0, y);
  const right = Math.min(width, x + rectWidth);
  const bottom = Math.min(height, y + rectHeight);
  for (let row = top; row < bottom; row += 1) {
    for (let column = left; column < right; column += 1) {
      writePixel(data, width, column, row, color);
    }
  }
}
function nextRandom(state) {
  let value = state >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return value >>> 0;
}
function makeSurface(options) {
  const width = positiveDimension("create", "width", options.width);
  if (!width.ok) return width;
  const height = positiveDimension("create", "height", options.height);
  if (!height.ok) return height;
  if (options.colorSpace !== void 0 && options.colorSpace !== "srgb" && options.colorSpace !== "linear") {
    return invalid("create", "colorSpace", String(options.colorSpace), "'srgb' or 'linear'");
  }
  if (options.mipmap !== void 0 && typeof options.mipmap !== "boolean") {
    return invalid("create", "mipmap", String(options.mipmap), "a boolean");
  }
  const data = new Uint8Array(width.value * height.value * 4);
  const colorSpace = options.colorSpace ?? "srgb";
  const mipmap = options.mipmap ?? false;
  const surface = {
    width: width.value,
    height: height.value,
    colorSpace,
    mipmap,
    data,
    setPixel(x, y, color) {
      const px = rounded("set-pixel", "x", x);
      if (!px.ok) return px;
      const py = rounded("set-pixel", "y", y);
      if (!py.ok) return py;
      const normalized = colorChannels("set-pixel", color);
      if (!normalized.ok) return normalized;
      writePixel(data, width.value, px.value, py.value, normalized.value);
      return ok(void 0);
    },
    fillRect(x, y, rectWidth, rectHeight, color) {
      const rect = rectangle("fill-rect", x, y, rectWidth, rectHeight);
      if (!rect.ok) return rect;
      const normalized = colorChannels("fill-rect", color);
      if (!normalized.ok) return normalized;
      fillClippedRect(
        data,
        width.value,
        height.value,
        rect.value[0] ?? 0,
        rect.value[1] ?? 0,
        rect.value[2] ?? 0,
        rect.value[3] ?? 0,
        normalized.value
      );
      return ok(void 0);
    },
    fillCircle(cx, cy, radius, color) {
      const centerX = rounded("fill-circle", "cx", cx);
      if (!centerX.ok) return centerX;
      const centerY = rounded("fill-circle", "cy", cy);
      if (!centerY.ok) return centerY;
      const circleRadius = rounded("fill-circle", "radius", radius);
      if (!circleRadius.ok) return circleRadius;
      if (circleRadius.value <= 0) {
        return invalid("fill-circle", "radius", circleRadius.value, "a positive number");
      }
      const normalized = colorChannels("fill-circle", color);
      if (!normalized.ok) return normalized;
      const radiusSquared = circleRadius.value * circleRadius.value;
      const left = Math.max(0, centerX.value - circleRadius.value);
      const right = Math.min(width.value - 1, centerX.value + circleRadius.value);
      const top = Math.max(0, centerY.value - circleRadius.value);
      const bottom = Math.min(height.value - 1, centerY.value + circleRadius.value);
      for (let row = top; row <= bottom; row += 1) {
        for (let column = left; column <= right; column += 1) {
          const dx = column - centerX.value;
          const dy = row - centerY.value;
          if (dx * dx + dy * dy <= radiusSquared)
            writePixel(data, width.value, column, row, normalized.value);
        }
      }
      return ok(void 0);
    },
    blit(source, destinationX, destinationY, sourceRect) {
      const destination = rounded("blit", "destinationX", destinationX);
      if (!destination.ok) return destination;
      const destinationYResult = rounded("blit", "destinationY", destinationY);
      if (!destinationYResult.ok) return destinationYResult;
      if (source === null || typeof source !== "object" || !Number.isInteger(source.width) || !Number.isInteger(source.height) || !(source.data instanceof Uint8Array) || source.data.length !== source.width * source.height * 4) {
        return invalid("blit", "source", "malformed", "a valid PixelSurface");
      }
      const rect = rectangle(
        "blit",
        sourceRect?.x ?? 0,
        sourceRect?.y ?? 0,
        sourceRect?.width ?? source.width,
        sourceRect?.height ?? source.height
      );
      if (!rect.ok) return rect;
      const sourceX = rect.value[0] ?? 0;
      const sourceY = rect.value[1] ?? 0;
      const sourceWidth = rect.value[2] ?? 0;
      const sourceHeight = rect.value[3] ?? 0;
      const left = Math.max(0, sourceX);
      const top = Math.max(0, sourceY);
      const right = Math.min(source.width, sourceX + sourceWidth);
      const bottom = Math.min(source.height, sourceY + sourceHeight);
      if (right <= left || bottom <= top) return ok(void 0);
      const snapshot = source.data.slice();
      for (let row = top; row < bottom; row += 1) {
        for (let column = left; column < right; column += 1) {
          const targetX = destination.value + column - sourceX;
          const targetY = destinationYResult.value + row - sourceY;
          if (targetX < 0 || targetY < 0 || targetX >= width.value || targetY >= height.value)
            continue;
          const sourceOffset = (row * source.width + column) * 4;
          writePixel(
            data,
            width.value,
            targetX,
            targetY,
            snapshot.subarray(sourceOffset, sourceOffset + 4)
          );
        }
      }
      return ok(void 0);
    },
    fillNoise(seed, noiseOptions) {
      if (!Number.isFinite(seed)) return invalid("noise", "seed", String(seed), "a finite number");
      const min = noiseOptions?.min ?? 0;
      const max = noiseOptions?.max ?? 255;
      const alpha = noiseOptions?.alpha ?? 255;
      for (const [field, value] of [
        ["min", min],
        ["max", max],
        ["alpha", alpha]
      ]) {
        if (!Number.isFinite(value) || value < 0 || value > 255) {
          return invalid("noise", field, value, "a finite number in [0, 255]");
        }
      }
      if (min > max) return invalid("noise", "min", min, "a value no greater than max");
      let state = Math.trunc(seed) >>> 0 || 1831565813;
      const span = max - min;
      for (let index = 0; index < data.length; index += 4) {
        state = nextRandom(state);
        const value = min + state / 4294967296 * span;
        const channel = Math.round(value);
        data[index] = channel;
        data[index + 1] = channel;
        data[index + 2] = channel;
        data[index + 3] = Math.round(alpha);
      }
      return ok(void 0);
    },
    noise(seed, noiseOptions) {
      return surface.fillNoise(seed, noiseOptions);
    },
    toDecodedImage() {
      return {
        bytes: data.slice(),
        width: width.value,
        height: height.value,
        mime: "image/png",
        colorSpace,
        mipmap
      };
    },
    toTextureAsset() {
      return {
        kind: "texture",
        shape: {
          viewDimension: "2d",
          extent: { width: width.value, height: height.value }
        },
        format: colorSpace === "srgb" ? "rgba8unorm-srgb" : "rgba8unorm",
        data: data.slice(),
        colorSpace,
        mips: mipmap ? { kind: "generate" } : { kind: "none" }
      };
    },
    toAssetPack(meta) {
      return toAssetPack(surface.toDecodedImage(), meta);
    }
  };
  return ok(surface);
}
function createPixelSurface(options) {
  return makeSurface(options);
}

// src/source-key.ts
function deriveImageSourceKey(role, _locator) {
  const normalizedRole = role.trim();
  if (normalizedRole.length === 0) return void 0;
  return `image:${normalizedRole}`;
}

// src/sub-asset-key.ts
function subAssetKey(input) {
  const indexFallback = `${input.kind}s/${input.sourceIndex}`;
  if (input.name !== void 0) {
    return { kind: input.kind, name: input.name, indexFallback };
  }
  return { kind: input.kind, indexFallback };
}
function subAssetKeyEqual(a, b) {
  if (a.kind !== b.kind) return false;
  if (a.indexFallback !== b.indexFallback) return false;
  if (a.name !== b.name) return false;
  return true;
}

// src/reimport-reuse-meta.ts
function reimportReuseMeta(decoded, existing) {
  const freshKeys = [subAssetKey({ kind: "texture", sourceIndex: 0 })];
  const out = [];
  const sourceKey = deriveImageSourceKey("texture");
  for (let i = 0; i < freshKeys.length; i++) {
    const fresh = freshKeys[i];
    if (fresh === void 0) continue;
    let reuseGuid;
    if (existing !== void 0) {
      for (const candidate of existing.subAssets) {
        if (sourceKey !== void 0 && candidate.sourceKey === sourceKey) {
          reuseGuid = candidate.guid;
          break;
        }
        const candidateKey = subAssetKey({
          kind: candidate.kind,
          sourceIndex: candidate.sourceIndex,
          ...candidate.name !== void 0 ? { name: candidate.name } : {}
        });
        if (subAssetKeyEqual(fresh, candidateKey)) {
          reuseGuid = candidate.guid;
          break;
        }
      }
    }
    const guid = reuseGuid ?? AssetGuid.format(AssetGuid.random());
    const emit = fresh.name !== void 0 ? {
      guid,
      sourceIndex: i,
      kind: fresh.kind,
      name: fresh.name,
      ...sourceKey === void 0 ? {} : { sourceKey }
    } : {
      guid,
      sourceIndex: i,
      kind: fresh.kind,
      ...sourceKey === void 0 ? {} : { sourceKey }
    };
    out.push(emit);
  }
  return out;
}
function invalid2(guid, expected, reason) {
  return err({
    code: "asset-package-invalid",
    expected,
    hint: "recook the image asset and publish its complete device-neutral payload",
    detail: { guid, reason }
  });
}
function validDimensions(width, height) {
  return Number.isSafeInteger(width) && width > 0 && Number.isSafeInteger(height) && height > 0;
}
function imageBytes(value) {
  if (value instanceof Uint8Array || value instanceof Uint8ClampedArray) return value;
  if (!Array.isArray(value)) return void 0;
  if (!value.every((item) => Number.isInteger(item) && item >= 0 && item <= 255)) {
    return void 0;
  }
  return Uint8Array.from(value);
}
function compressedImageTarget(colorSpace) {
  return colorSpace === "srgb" ? "rgba8unorm-srgb" : "rgba8unorm";
}
function validTextureSurface(value) {
  if (value === null || typeof value !== "object") return false;
  const candidate = value;
  const shape = candidate.shape;
  const extent = shape?.viewDimension === "2d" ? shape.extent : void 0;
  const mips = candidate.mips;
  return extent !== void 0 && validDimensions(extent.width, extent.height) && mips !== void 0 && (mips.kind === "none" || mips.kind === "generate" || mips.kind === "packed" && Number.isSafeInteger(mips.levelCount) && mips.levelCount > 0) && typeof candidate.format === "string" && imageBytes(candidate.data) !== void 0 && (candidate.colorSpace === "srgb" || candidate.colorSpace === "linear");
}
function validEquirectSurface(value) {
  if (value === null || typeof value !== "object") return false;
  const candidate = value;
  return validDimensions(candidate.width ?? 0, candidate.height ?? 0) && typeof candidate.format === "string" && imageBytes(candidate.data) !== void 0 && (candidate.colorSpace === "srgb" || candidate.colorSpace === "linear");
}
async function readImageSurface(input, kind, expected) {
  const { envelope, artifacts } = input;
  const payload = envelope.payload;
  if (payload === null || typeof payload !== "object" || payload.kind !== kind) {
    return invalid2(envelope.guid, expected, `${kind} owner validation failed`);
  }
  const body = envelope.artifacts.body ?? envelope.artifacts.atlas;
  let data = imageBytes(payload.data);
  if (body !== void 0) {
    const read = await artifacts.read(body);
    if (!read.ok) return err(read.error);
    const bytes = read.value;
    data = bytes;
    if (body.assetCodec?.name === "basis" && body.assetCodec.container !== void 0) {
      const candidate = payload;
      if (candidate.colorSpace !== "srgb" && candidate.colorSpace !== "linear") {
        return invalid2(envelope.guid, expected, `${kind} color space is invalid`);
      }
      const target = compressedImageTarget(candidate.colorSpace);
      const transcoded = body.assetCodec.container === "ktx2" ? await parseKtx2(bytes).then(
        (parsed) => parsed.ok ? transcodeKtx2(parsed.value, target) : parsed
      ) : await transcodeBasis(bytes, target);
      if (!transcoded.ok) {
        return invalid2(envelope.guid, expected, `codec:${transcoded.error.code}`);
      }
      const mip = transcoded.value.mips[0];
      if (mip === void 0) return invalid2(envelope.guid, expected, "codec:base-mip-missing");
      data = mip.data;
      return readDecodedSurface(
        envelope.guid,
        expected,
        kind,
        kind === "texture" ? {
          ...payload,
          shape: { viewDimension: "2d", extent: { width: mip.width, height: mip.height } },
          format: target,
          data,
          mips: { kind: "none" }
        } : { ...payload, width: mip.width, height: mip.height, format: target, data }
      );
    }
  }
  return readDecodedSurface(envelope.guid, expected, kind, {
    ...payload,
    ...data === void 0 ? {} : { data }
  });
}
function readDecodedSurface(guid, expected, kind, candidate) {
  if (kind === "texture" ? !validTextureSurface(candidate) : !validEquirectSurface(candidate)) {
    return invalid2(guid, expected, "image owner validation failed");
  }
  return ok(candidate);
}
var textureContribution = {
  kind: { kind: "texture" },
  consumer: "Image/Render DeviceScope",
  decoder: {
    async decode(input) {
      return readImageSurface(
        input,
        "texture",
        "a texture payload with dimensions, format, color space, and bytes"
      );
    }
  }
};
var equirectContribution = {
  kind: { kind: "equirect" },
  consumer: "Image/Render DeviceScope",
  decoder: {
    async decode(input) {
      return readImageSurface(
        input,
        "equirect",
        "an equirect payload with dimensions, format, color space, and bytes"
      );
    }
  }
};

export { IMAGE_ERROR_EXPECTED, ImageErrorImpl, createPixelSurface, decodeHdr, decodeImageInBrowser, deriveImageSourceKey, equirectContribution, imageError, loadJpeg, loadUpng, reimportReuseMeta, subAssetKey, subAssetKeyEqual, textureContribution, toAssetPack };
