// src/animation-clip-bin-contract.ts
var ANIMATION_CLIP_BIN_VERSION = 1;
var ANIMATION_CLIP_BIN_HEADER_V1_BYTES = 32;
var ANIMATION_CLIP_BIN_CHANNEL_ENTRY_V1_BYTES = 48;
var ANIMATION_CLIP_BIN_TARGET_ID_BYTES = 16;
var ANIMATION_CLIP_BIN_MEDIA_TYPE = "application/x-forgeax-animation-clip";
var ANIMATION_CLIP_BIN_CODEC_NAME = "animation-clip-binary";
var ANIMATION_CLIP_BIN_CODEC_VERSION = "1";
var ANIMATION_CLIP_BIN_EXTERNALIZE_THRESHOLD_BYTES = 16 * 1024;
var ANIMATION_CLIP_BIN_PROPERTIES = [
  "translation",
  "rotation",
  "scale",
  "weights"
];
var ANIMATION_CLIP_BIN_INTERPOLATIONS = ["LINEAR", "STEP"];
function failure(code, sourceKey, expected, actual) {
  return {
    ok: false,
    error: {
      code,
      subject: "animation-clip-bin",
      sourceKey,
      expected,
      actual,
      recovery: "re-cook the source with its Meta sidecar through the build-time importer"
    }
  };
}
function writeAnimationClipBinHeader(header, out) {
  if (out.byteLength < ANIMATION_CLIP_BIN_HEADER_V1_BYTES) {
    throw new RangeError("animation-clip-bin v1 header output is truncated");
  }
  const view = new DataView(out.buffer, out.byteOffset, out.byteLength);
  view.setUint32(0, header.version, true);
  view.setUint32(4, header.channelCount, true);
  view.setFloat32(8, header.duration, true);
  view.setUint32(12, header.tableBytes, true);
  view.setUint32(16, header.payloadBytes, true);
  view.setUint32(20, 0, true);
  view.setUint32(24, 0, true);
  view.setUint32(28, 0, true);
}
function decodeAnimationClipBinHeader(bytes, sourceKey = "<unknown animation-clip source>") {
  if (bytes.byteLength < ANIMATION_CLIP_BIN_HEADER_V1_BYTES) {
    return failure(
      "animation-clip-bin-header-truncated",
      sourceKey,
      `animation-clip-bin v1 header (${ANIMATION_CLIP_BIN_HEADER_V1_BYTES} bytes)`,
      `${bytes.byteLength} bytes`
    );
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const version = view.getUint32(0, true);
  if (version !== ANIMATION_CLIP_BIN_VERSION) {
    return failure(
      "animation-clip-bin-version-unsupported",
      sourceKey,
      "animation-clip-bin v1",
      `version ${version}`
    );
  }
  const channelCount = view.getUint32(4, true);
  const duration = view.getFloat32(8, true);
  const tableBytes = view.getUint32(12, true);
  const payloadBytes = view.getUint32(16, true);
  const expectedTableBytes = channelCount * ANIMATION_CLIP_BIN_CHANNEL_ENTRY_V1_BYTES;
  if (!Number.isSafeInteger(channelCount) || channelCount < 0 || !Number.isFinite(duration) || duration < 0 || tableBytes !== expectedTableBytes || !Number.isSafeInteger(payloadBytes) || payloadBytes < 0 || payloadBytes % 4 !== 0 || bytes.byteLength !== ANIMATION_CLIP_BIN_HEADER_V1_BYTES + tableBytes + payloadBytes) {
    return failure(
      "animation-clip-bin-header-invalid",
      sourceKey,
      "safe v1 channel table, duration, and payload byte lengths",
      `channelCount=${channelCount}; duration=${duration}; tableBytes=${tableBytes}; payloadBytes=${payloadBytes}; byteLength=${bytes.byteLength}`
    );
  }
  return {
    ok: true,
    value: {
      version: 1,
      channelCount,
      duration,
      tableBytes,
      payloadBytes
    }
  };
}
function isAnimationClipBinaryCodec(value) {
  return value.assetCodec?.name === ANIMATION_CLIP_BIN_CODEC_NAME || value.mediaType === ANIMATION_CLIP_BIN_MEDIA_TYPE;
}

export { ANIMATION_CLIP_BIN_CHANNEL_ENTRY_V1_BYTES, ANIMATION_CLIP_BIN_CODEC_NAME, ANIMATION_CLIP_BIN_CODEC_VERSION, ANIMATION_CLIP_BIN_EXTERNALIZE_THRESHOLD_BYTES, ANIMATION_CLIP_BIN_HEADER_V1_BYTES, ANIMATION_CLIP_BIN_INTERPOLATIONS, ANIMATION_CLIP_BIN_MEDIA_TYPE, ANIMATION_CLIP_BIN_PROPERTIES, ANIMATION_CLIP_BIN_TARGET_ID_BYTES, ANIMATION_CLIP_BIN_VERSION, decodeAnimationClipBinHeader, isAnimationClipBinaryCodec, writeAnimationClipBinHeader };
