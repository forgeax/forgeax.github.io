import { err, ok, IMAGE_ERROR_HINTS } from '../../types/dist/index.mjs';

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

export { decodeHdr };
