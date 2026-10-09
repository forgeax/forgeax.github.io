// src/errors.ts
function codecError(code, detail) {
  const hints = {
    "decompression-failed": "Check catalog row compression field and asset binary consistency; re-run asset import.",
    "codec-init-failed": "Uncompressed assets are still loadable. Verify the codec module is installed correctly.",
    "ktx2-parse-failed": "Check that the KTX2 file is valid and not truncated. Re-import the texture asset.",
    "ktx2-unsupported-scheme": "This supercompression scheme requires a future codec upgrade. Check the codec README Loop 2 extension points.",
    "transcode-failed": "Basis transcode failed for this source/target format pair. Verify the KTX2 payload is a valid Basis (ETC1S / UASTC) texture and re-import the asset.",
    "ktx2-encode-failed": "Basis encode failed for this compression mode. Verify the source image dimensions / pixel format match the mode (LDR rgba8 vs HDR rgba16float) and retry the asset import."
  };
  return {
    ok: false,
    error: {
      code,
      expected: "valid compressed data or supported compression scheme",
      hint: hints[code],
      detail
    }
  };
}

// src/basis-transcoder.ts
var TRANSCODER_GLUE = new URL("../pkg/basis_transcoder.mjs", import.meta.url);
var TRANSCODER_WASM = new URL("../pkg/basis_transcoder.wasm", import.meta.url);
function traceBasisPhase(phase, detail) {
  const sink = globalThis.__forgeaxAssetLoadTrace;
  if (sink === void 0) return;
  try {
    sink({ phase: `codec.${phase}`, at: Date.now(), ...detail === void 0 ? {} : { detail } });
  } catch {
  }
}
var defaultImporter = async () => {
  traceBasisPhase("basis.glue.import.start", { url: TRANSCODER_GLUE.href });
  const factory = (await import(
    /* @vite-ignore */
    TRANSCODER_GLUE.href
  )).default;
  traceBasisPhase("basis.glue.import.complete");
  traceBasisPhase("basis.wasm.factory.start", { url: TRANSCODER_WASM.href });
  const mod = await factory({ locateFile: () => TRANSCODER_WASM.href });
  traceBasisPhase("basis.wasm.factory.complete");
  traceBasisPhase("basis.initialize.start");
  mod.initializeBasis();
  traceBasisPhase("basis.initialize.complete");
  return mod;
};
var importer = defaultImporter;
var _initPromise = null;
function initBasisTranscoder() {
  if (_initPromise !== null) return _initPromise;
  traceBasisPhase("basis.init.start");
  _initPromise = importer().catch((cause) => {
    _initPromise = null;
    throw new Error("codec-init-failed", { cause });
  });
  return _initPromise;
}
function inspectBasisSource(file, meta, profile) {
  if (meta.colorSpace !== "srgb" && meta.colorSpace !== "linear") {
    return codecError("ktx2-parse-failed", {
      reason: "raw Basis source requires Meta.colorSpace=srgb|linear"
    });
  }
  if (file.getNumImages() <= 0 || file.getNumLevels(0) <= 0) {
    return codecError("ktx2-parse-failed", { reason: "invalid raw Basis source shape" });
  }
  return {
    ok: true,
    value: {
      colorSpace: meta.colorSpace,
      profile,
      width: file.getImageWidth(0, 0),
      height: file.getImageHeight(0, 0),
      levelCount: file.getNumLevels(0),
      imageCount: file.getNumImages()
    }
  };
}
function basisTargetFor(mod, format) {
  const e = mod.transcoder_texture_format;
  switch (format) {
    case "bc7-rgba-unorm":
    case "bc7-rgba-unorm-srgb":
      return e.cTFBC7_RGBA.value;
    case "bc5-rg-unorm":
      return e.cTFBC5_RG.value;
    case "bc4-r-unorm":
      return e.cTFBC4_R.value;
    case "bc6h-rgb-ufloat":
      return e.cTFBC6H.value;
    case "etc2-rgba8unorm":
    case "etc2-rgba8unorm-srgb":
      return e.cTFETC2_RGBA.value;
    case "astc-4x4-unorm":
    case "astc-4x4-unorm-srgb":
      return e.cTFASTC_4x4_RGBA.value;
    case "rgba16float":
      return e.cTFRGBA_HALF.value;
    case "rgba8unorm":
    case "rgba8unorm-srgb":
    case "rg8unorm":
    case "r8unorm":
      return e.cTFRGBA32.value;
    default:
      return null;
  }
}
async function transcodeKtx2(parsed, targetFormat) {
  traceBasisPhase("ktx2.transcode.start", { targetFormat });
  let mod;
  try {
    mod = await initBasisTranscoder();
  } catch {
    return codecError("codec-init-failed", { stage: "dynamic-import-basis-transcoder" });
  }
  const targetEnum = basisTargetFor(mod, targetFormat);
  if (targetEnum === null) {
    return codecError("transcode-failed", {
      sourceFormat: `dfd-model-${parsed.dfd?.colorModel ?? "unknown"}`,
      targetFormat
    });
  }
  const file = new mod.KTX2File(parsed.rawBytes);
  try {
    traceBasisPhase("ktx2.file.start");
    if (!file.isValid()) {
      return codecError("transcode-failed", {
        sourceFormat: "invalid-ktx2-file",
        targetFormat
      });
    }
    if (file.startTranscoding() === 0) {
      return codecError("transcode-failed", {
        sourceFormat: "start-transcoding-failed",
        targetFormat
      });
    }
    const levels = file.getLevels();
    traceBasisPhase("ktx2.file.ready", { levels });
    const mips = [];
    for (let level = 0; level < levels; level++) {
      const info = file.getImageLevelInfo(level, 0, 0);
      const size = file.getImageTranscodedSizeInBytes(level, 0, 0, targetEnum);
      const dst = new Uint8Array(size);
      const ok = file.transcodeImage(dst, level, 0, 0, targetEnum, 0, -1, -1);
      if (ok === 0) {
        return codecError("transcode-failed", {
          sourceFormat: `dfd-model-${parsed.dfd?.colorModel ?? "unknown"}-level-${level}`,
          targetFormat
        });
      }
      traceBasisPhase("ktx2.mip.complete", { level });
      mips.push({ level, width: info.origWidth, height: info.origHeight, data: dst });
    }
    return {
      ok: true,
      value: {
        format: targetFormat,
        width: file.getWidth(),
        height: file.getHeight(),
        mips
      }
    };
  } finally {
    file.close();
  }
}
async function transcodeBasis(bytes, targetFormat) {
  let mod;
  try {
    mod = await initBasisTranscoder();
  } catch {
    return codecError("codec-init-failed", { stage: "dynamic-import-basis-transcoder" });
  }
  const targetEnum = basisTargetFor(mod, targetFormat);
  if (targetEnum === null || mod.BasisFile === void 0) {
    return codecError("transcode-failed", {
      sourceFormat: "raw-basis",
      targetFormat
    });
  }
  const file = new mod.BasisFile(bytes);
  try {
    if (file.getNumImages() <= 0 || file.getNumLevels(0) <= 0) {
      return codecError("transcode-failed", { sourceFormat: "invalid-basis-file", targetFormat });
    }
    if (file.startTranscoding() === 0) {
      return codecError("transcode-failed", {
        sourceFormat: "start-transcoding-failed",
        targetFormat
      });
    }
    const mips = [];
    for (let level = 0; level < file.getNumLevels(0); level++) {
      const width = file.getImageWidth(0, level);
      const height = file.getImageHeight(0, level);
      const size = file.getImageTranscodedSizeInBytes(0, level, targetEnum);
      const data = new Uint8Array(size);
      if (file.transcodeImage(data, 0, level, targetEnum, 0) === 0) {
        return codecError("transcode-failed", {
          sourceFormat: `raw-basis-level-${level}`,
          targetFormat
        });
      }
      mips.push({ level, width, height, data });
    }
    return {
      ok: true,
      value: {
        format: targetFormat,
        width: mips[0]?.width ?? 0,
        height: mips[0]?.height ?? 0,
        mips
      }
    };
  } finally {
    file.close();
  }
}

// src/block-format.ts
var BLOCK_TABLE = /* @__PURE__ */ new Map([
  // -- BC (S3TC / RGTC / BPTC) --
  ["bc1-rgba-unorm", { blockW: 4, blockH: 4, bytesPerBlock: 8 }],
  ["bc1-rgba-unorm-srgb", { blockW: 4, blockH: 4, bytesPerBlock: 8 }],
  ["bc2-rgba-unorm", { blockW: 4, blockH: 4, bytesPerBlock: 16 }],
  ["bc2-rgba-unorm-srgb", { blockW: 4, blockH: 4, bytesPerBlock: 16 }],
  ["bc3-rgba-unorm", { blockW: 4, blockH: 4, bytesPerBlock: 16 }],
  ["bc3-rgba-unorm-srgb", { blockW: 4, blockH: 4, bytesPerBlock: 16 }],
  ["bc4-r-unorm", { blockW: 4, blockH: 4, bytesPerBlock: 8 }],
  ["bc4-r-snorm", { blockW: 4, blockH: 4, bytesPerBlock: 8 }],
  ["bc5-rg-unorm", { blockW: 4, blockH: 4, bytesPerBlock: 16 }],
  ["bc5-rg-snorm", { blockW: 4, blockH: 4, bytesPerBlock: 16 }],
  ["bc6h-rgb-ufloat", { blockW: 4, blockH: 4, bytesPerBlock: 16 }],
  ["bc6h-rgb-float", { blockW: 4, blockH: 4, bytesPerBlock: 16 }],
  ["bc7-rgba-unorm", { blockW: 4, blockH: 4, bytesPerBlock: 16 }],
  ["bc7-rgba-unorm-srgb", { blockW: 4, blockH: 4, bytesPerBlock: 16 }],
  // -- ETC2 / EAC --
  ["etc2-rgb8unorm", { blockW: 4, blockH: 4, bytesPerBlock: 8 }],
  ["etc2-rgb8unorm-srgb", { blockW: 4, blockH: 4, bytesPerBlock: 8 }],
  ["etc2-rgb8a1unorm", { blockW: 4, blockH: 4, bytesPerBlock: 8 }],
  ["etc2-rgb8a1unorm-srgb", { blockW: 4, blockH: 4, bytesPerBlock: 8 }],
  ["etc2-rgba8unorm", { blockW: 4, blockH: 4, bytesPerBlock: 16 }],
  ["etc2-rgba8unorm-srgb", { blockW: 4, blockH: 4, bytesPerBlock: 16 }],
  ["eac-r11unorm", { blockW: 4, blockH: 4, bytesPerBlock: 8 }],
  ["eac-r11snorm", { blockW: 4, blockH: 4, bytesPerBlock: 8 }],
  ["eac-rg11unorm", { blockW: 4, blockH: 4, bytesPerBlock: 16 }],
  ["eac-rg11snorm", { blockW: 4, blockH: 4, bytesPerBlock: 16 }],
  // -- ASTC (all 16 bytes/block; block dims from the format name) --
  ["astc-4x4-unorm", { blockW: 4, blockH: 4, bytesPerBlock: 16 }],
  ["astc-4x4-unorm-srgb", { blockW: 4, blockH: 4, bytesPerBlock: 16 }],
  ["astc-5x4-unorm", { blockW: 5, blockH: 4, bytesPerBlock: 16 }],
  ["astc-5x4-unorm-srgb", { blockW: 5, blockH: 4, bytesPerBlock: 16 }],
  ["astc-5x5-unorm", { blockW: 5, blockH: 5, bytesPerBlock: 16 }],
  ["astc-5x5-unorm-srgb", { blockW: 5, blockH: 5, bytesPerBlock: 16 }],
  ["astc-6x5-unorm", { blockW: 6, blockH: 5, bytesPerBlock: 16 }],
  ["astc-6x5-unorm-srgb", { blockW: 6, blockH: 5, bytesPerBlock: 16 }],
  ["astc-6x6-unorm", { blockW: 6, blockH: 6, bytesPerBlock: 16 }],
  ["astc-6x6-unorm-srgb", { blockW: 6, blockH: 6, bytesPerBlock: 16 }],
  ["astc-8x5-unorm", { blockW: 8, blockH: 5, bytesPerBlock: 16 }],
  ["astc-8x5-unorm-srgb", { blockW: 8, blockH: 5, bytesPerBlock: 16 }],
  ["astc-8x6-unorm", { blockW: 8, blockH: 6, bytesPerBlock: 16 }],
  ["astc-8x6-unorm-srgb", { blockW: 8, blockH: 6, bytesPerBlock: 16 }],
  ["astc-8x8-unorm", { blockW: 8, blockH: 8, bytesPerBlock: 16 }],
  ["astc-8x8-unorm-srgb", { blockW: 8, blockH: 8, bytesPerBlock: 16 }],
  ["astc-10x5-unorm", { blockW: 10, blockH: 5, bytesPerBlock: 16 }],
  ["astc-10x5-unorm-srgb", { blockW: 10, blockH: 5, bytesPerBlock: 16 }],
  ["astc-10x6-unorm", { blockW: 10, blockH: 6, bytesPerBlock: 16 }],
  ["astc-10x6-unorm-srgb", { blockW: 10, blockH: 6, bytesPerBlock: 16 }],
  ["astc-10x8-unorm", { blockW: 10, blockH: 8, bytesPerBlock: 16 }],
  ["astc-10x8-unorm-srgb", { blockW: 10, blockH: 8, bytesPerBlock: 16 }],
  ["astc-10x10-unorm", { blockW: 10, blockH: 10, bytesPerBlock: 16 }],
  ["astc-10x10-unorm-srgb", { blockW: 10, blockH: 10, bytesPerBlock: 16 }],
  ["astc-12x10-unorm", { blockW: 12, blockH: 10, bytesPerBlock: 16 }],
  ["astc-12x10-unorm-srgb", { blockW: 12, blockH: 10, bytesPerBlock: 16 }],
  ["astc-12x12-unorm", { blockW: 12, blockH: 12, bytesPerBlock: 16 }],
  ["astc-12x12-unorm-srgb", { blockW: 12, blockH: 12, bytesPerBlock: 16 }]
]);
function blockParamsForFormat(format) {
  return BLOCK_TABLE.get(format) ?? null;
}
function isCompressedFormat(format) {
  return BLOCK_TABLE.has(format);
}
function bytesPerRow(format, width) {
  const params = BLOCK_TABLE.get(format);
  if (params === void 0) return null;
  return Math.ceil(width / params.blockW) * params.bytesPerBlock;
}
function rowsPerImage(format, height) {
  const params = BLOCK_TABLE.get(format);
  if (params === void 0) return null;
  return Math.ceil(height / params.blockH);
}

// src/zstd.ts
var defaultImporter2 = () => import('../../../vendor/fzstd/esm/index.mjs').then((mod) => mod.decompress);
var importer2 = defaultImporter2;
var _initPromise2 = null;
function getDecompressor() {
  if (_initPromise2 !== null) {
    return _initPromise2;
  }
  _initPromise2 = importer2().catch((cause) => {
    _initPromise2 = null;
    throw new Error("codec-init-failed", { cause });
  });
  return _initPromise2;
}
async function decompressZstd(bytes) {
  let decompress;
  try {
    decompress = await getDecompressor();
  } catch {
    return codecError("codec-init-failed", { stage: "dynamic-import-fzstd" });
  }
  try {
    const result = decompress(bytes);
    return { ok: true, value: result };
  } catch {
    return codecError("decompression-failed", {
      reason: "zstd decompression failed: corrupt or invalid compressed data"
    });
  }
}

// src/ktx2.ts
var KTX2_IDENTIFIER = new Uint8Array([
  171,
  75,
  84,
  88,
  32,
  50,
  48,
  187,
  13,
  10,
  26,
  10
]);
function ktx2ColorSpace(parsed) {
  switch (parsed.dfd?.transferFunction) {
    case 1:
      return "linear";
    case 2:
      return "srgb";
    default:
      return void 0;
  }
}
var TD = new TextDecoder();
function readU32(bytes, byteOffset) {
  return new DataView(bytes.buffer, bytes.byteOffset + byteOffset, 4).getUint32(0, true);
}
function readU64(bytes, byteOffset) {
  return Number(new DataView(bytes.buffer, bytes.byteOffset + byteOffset, 8).getBigUint64(0, true));
}
function assertBounds(bytes, offset, length, context) {
  if (offset + length > bytes.length) {
    throw new Error(
      `KTX2 parse ${context}: OOB (offset=${offset}, length=${length}, fileSize=${bytes.length})`
    );
  }
}
function parseDfd(bytes, offset, _dfdByteLength) {
  assertBounds(bytes, offset, 4, "DFD-totalSize");
  const totalSize = readU32(bytes, offset);
  assertBounds(bytes, offset, totalSize, "DFD-block");
  const dbOff = offset + 4;
  const word0 = readU32(bytes, dbOff);
  const vendorId = word0 & 131071;
  const descriptorType = word0 >>> 17 & 32767;
  const word1 = readU32(bytes, dbOff + 4);
  const versionNumber = word1 & 65535;
  const descriptorBlockSize = word1 >>> 16 & 65535;
  const word2 = readU32(bytes, dbOff + 8);
  const colorModel = word2 & 255;
  const colorPrimaries = word2 >>> 8 & 255;
  const transferFunction = word2 >>> 16 & 255;
  const flags = word2 >>> 24 & 255;
  const word3 = readU32(bytes, dbOff + 12);
  const texelBlockDim0 = word3 & 255;
  const texelBlockDim1 = word3 >>> 8 & 255;
  const texelBlockDim2 = word3 >>> 16 & 255;
  const texelBlockDim3 = word3 >>> 24 & 255;
  const word4 = readU32(bytes, dbOff + 16);
  const word5 = readU32(bytes, dbOff + 20);
  const bytesPlane = [
    word4 & 255,
    word4 >>> 8 & 255,
    word4 >>> 16 & 255,
    word4 >>> 24 & 255,
    word5 & 255,
    word5 >>> 8 & 255,
    word5 >>> 16 & 255,
    word5 >>> 24 & 255
  ];
  const sampleBase = dbOff + 24;
  const numSamples = (descriptorBlockSize - 24) / 16;
  const samples = [];
  for (let i = 0; i < numSamples; i++) {
    const so = sampleBase + i * 16;
    const sw0 = readU32(bytes, so);
    const sw1 = readU32(bytes, so + 4);
    const sw2 = readU32(bytes, so + 8);
    const sw3 = readU32(bytes, so + 12);
    samples.push({
      qualifiers: sw0 & 15,
      channelType: sw0 >>> 4 & 255,
      bitLength: (sw0 >>> 12 & 4095) + 1,
      // stored as actual-1 per spec
      bitOffset: sw0 >>> 24 & 255,
      samplePosition: [
        sw1 & 255,
        sw1 >>> 8 & 255,
        sw1 >>> 16 & 255,
        sw1 >>> 24 & 255
      ],
      sampleLower: sw2,
      sampleUpper: sw3
    });
  }
  return {
    totalSize,
    vendorId,
    descriptorType,
    versionNumber,
    descriptorBlockSize,
    colorModel,
    colorPrimaries,
    transferFunction,
    flags,
    texelBlockDimension: [texelBlockDim0, texelBlockDim1, texelBlockDim2, texelBlockDim3],
    bytesPlane,
    samples
  };
}
function parseKv(bytes, offset, kvdByteLength) {
  if (kvdByteLength === 0) return [];
  const entries = [];
  let pos = offset;
  const end = offset + kvdByteLength;
  while (pos < end) {
    assertBounds(bytes, pos, 4, "KV-keyAndValueByteLength");
    const keyAndValueByteLength = readU32(bytes, pos);
    pos += 4;
    assertBounds(bytes, pos, keyAndValueByteLength, "KV-payload");
    const raw = bytes.slice(pos, pos + keyAndValueByteLength);
    let nulIdx = raw.indexOf(0);
    if (nulIdx === -1) nulIdx = raw.length;
    const key = TD.decode(raw.slice(0, nulIdx));
    const value = raw.slice(nulIdx + 1);
    entries.push({ key, value });
    pos += keyAndValueByteLength;
    const remainder = pos & 3;
    if (remainder !== 0) {
      pos += 4 - remainder;
    }
  }
  return entries;
}
async function parseKtx2(bytes) {
  try {
    if (bytes.length < 12) {
      return codecError("ktx2-parse-failed", {
        reason: "truncated-identifier: file shorter than 12-byte KTX2 magic"
      });
    }
    for (let i = 0; i < 12; i++) {
      const expectedByte = KTX2_IDENTIFIER[i];
      if (expectedByte === void 0 || bytes[i] !== expectedByte) {
        return codecError("ktx2-parse-failed", {
          reason: "invalid-identifier: not a KTX2 2.0 file"
        });
      }
    }
    if (bytes.length < 80) {
      return codecError("ktx2-parse-failed", {
        reason: "truncated-header: file too short for KTX2 header + index (min 80 bytes)"
      });
    }
    const header = {
      vkFormat: readU32(bytes, 12),
      typeSize: readU32(bytes, 16),
      pixelWidth: readU32(bytes, 20),
      pixelHeight: readU32(bytes, 24),
      pixelDepth: readU32(bytes, 28),
      layerCount: readU32(bytes, 32),
      faceCount: readU32(bytes, 36),
      levelCount: readU32(bytes, 40),
      supercompressionScheme: readU32(bytes, 44)
    };
    const index = {
      dfdByteOffset: readU32(bytes, 48),
      dfdByteLength: readU32(bytes, 52),
      kvdByteOffset: readU32(bytes, 56),
      kvdByteLength: readU32(bytes, 60),
      sgdByteOffset: readU64(bytes, 64),
      sgdByteLength: readU64(bytes, 72)
    };
    const scheme = header.supercompressionScheme;
    if (scheme !== 0 && scheme !== 1 && scheme !== 2) {
      return codecError("ktx2-unsupported-scheme", { scheme });
    }
    const numLevels = Math.max(1, header.levelCount);
    const levelIndexStart = 80;
    assertBounds(bytes, levelIndexStart, numLevels * 24, "level-index");
    const levelIndex = [];
    for (let i = 0; i < numLevels; i++) {
      const off = levelIndexStart + i * 24;
      const byteOffset = readU64(bytes, off);
      const byteLength = readU64(bytes, off + 8);
      const uncompressedByteLength = readU64(bytes, off + 16);
      if (byteOffset + byteLength > bytes.length) {
        return codecError("ktx2-parse-failed", {
          reason: `level-index-OOB: level ${i} byteOffset=${byteOffset} byteLength=${byteLength} exceeds file size=${bytes.length}`
        });
      }
      levelIndex.push({ byteOffset, byteLength, uncompressedByteLength });
    }
    let dfd = null;
    if (index.dfdByteLength > 0) {
      assertBounds(bytes, index.dfdByteOffset, index.dfdByteLength, "DFD");
      dfd = parseDfd(bytes, index.dfdByteOffset, index.dfdByteLength);
    }
    let kvEntries = [];
    if (index.kvdByteLength > 0) {
      assertBounds(bytes, index.kvdByteOffset, index.kvdByteLength, "KVD");
      kvEntries = parseKv(bytes, index.kvdByteOffset, index.kvdByteLength);
    }
    let sgd = null;
    if (index.sgdByteLength > 0) {
      assertBounds(bytes, index.sgdByteOffset, index.sgdByteLength, "SGD");
      sgd = bytes.slice(index.sgdByteOffset, index.sgdByteOffset + index.sgdByteLength);
    }
    return {
      ok: true,
      value: {
        header,
        index,
        levelIndex,
        dfd,
        kvEntries,
        sgd,
        rawBytes: bytes
      }
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return codecError("ktx2-parse-failed", { reason: `internal: ${message}` });
  }
}
function levelIndexForMip(totalLevels, mipLevel) {
  const entryIdx = totalLevels - 1 - mipLevel;
  if (entryIdx < 0 || entryIdx >= totalLevels) return -1;
  return entryIdx;
}
async function ktx2LevelsToRGBA(parsed, level = 0) {
  const totalLevels = parsed.levelIndex.length;
  const entryIdx = levelIndexForMip(totalLevels, level);
  if (entryIdx < 0) {
    return codecError("ktx2-parse-failed", { reason: `mip level ${level} does not exist` });
  }
  const entry = parsed.levelIndex[entryIdx];
  if (!entry) {
    return codecError("ktx2-parse-failed", {
      reason: `mip level ${level} has no level index entry`
    });
  }
  if (parsed.header.supercompressionScheme === 0) {
    const slice = parsed.rawBytes.slice(entry.byteOffset, entry.byteOffset + entry.byteLength);
    return { ok: true, value: new Uint8Array(slice) };
  }
  if (parsed.header.supercompressionScheme === 2) {
    const compressedSlice = parsed.rawBytes.slice(
      entry.byteOffset,
      entry.byteOffset + entry.byteLength
    );
    const result = await decompressZstd(new Uint8Array(compressedSlice));
    if (!result.ok) {
      return codecError("ktx2-parse-failed", {
        reason: `zstd decompression failed for level ${level}: ${result.error.detail}`
      });
    }
    return result;
  }
  return codecError("ktx2-unsupported-scheme", {
    scheme: parsed.header.supercompressionScheme
  });
}

// src/transcode.ts
function selectRgba(srgb, caps) {
  if (caps.bc) return srgb ? "bc7-rgba-unorm-srgb" : "bc7-rgba-unorm";
  if (caps.astc) return srgb ? "astc-4x4-unorm-srgb" : "astc-4x4-unorm";
  if (caps.etc2) return srgb ? "etc2-rgba8unorm-srgb" : "etc2-rgba8unorm";
  return srgb ? "rgba8unorm-srgb" : "rgba8unorm";
}
function selectRg(caps) {
  if (caps.bc) return "bc5-rg-unorm";
  if (caps.etc2) return "eac-rg11unorm";
  return "rg8unorm";
}
function selectR(caps) {
  if (caps.bc) return "bc4-r-unorm";
  if (caps.etc2) return "eac-r11unorm";
  return "r8unorm";
}
function selectHdr(caps) {
  if (caps.bc) return "bc6h-rgb-ufloat";
  return "rgba16float";
}
function selectTranscodeTarget(source, caps) {
  if (source.model === "uastc-hdr") return selectHdr(caps);
  switch (source.channels) {
    case "rgba":
      return selectRgba(source.srgb, caps);
    case "rg":
      return selectRg(caps);
    case "r":
      return selectR(caps);
  }
}

export { KTX2_IDENTIFIER, blockParamsForFormat, bytesPerRow, codecError, decompressZstd, initBasisTranscoder, inspectBasisSource, isCompressedFormat, ktx2ColorSpace, ktx2LevelsToRGBA, parseKtx2, rowsPerImage, selectTranscodeTarget, transcodeBasis, transcodeKtx2 };
