import { ANIMATION_CLIP_BIN_CHANNEL_ENTRY_V1_BYTES, writeAnimationClipBinHeader, ANIMATION_CLIP_BIN_HEADER_V1_BYTES, ANIMATION_CLIP_BIN_EXTERNALIZE_THRESHOLD_BYTES, ANIMATION_CLIP_BIN_CODEC_VERSION, ANIMATION_CLIP_BIN_CODEC_NAME, ANIMATION_CLIP_BIN_MEDIA_TYPE, ANIMATION_CLIP_BIN_PROPERTIES, ANIMATION_CLIP_BIN_INTERPOLATIONS, ANIMATION_CLIP_BIN_TARGET_ID_BYTES } from '../../pack/dist/animation-clip-bin-contract.mjs';
import { err, ok } from '../../types/dist/index.mjs';

// src/animation-clip-bin.ts
var TARGET_ID_RE = /^[0-9a-f]{32}$/;
function failure(sourceKey, expected, actual) {
  return {
    code: "animation-clip-bin-payload-invalid",
    subject: "animation-clip-bin",
    sourceKey,
    expected,
    actual,
    recovery: "re-cook the source with its Meta sidecar through the build-time importer"
  };
}
function float32Bytes(values) {
  const floats = values instanceof Float32Array ? values : new Float32Array(Array.from(values));
  return new Uint8Array(floats.buffer, floats.byteOffset, floats.byteLength);
}
function propertyIndex(property, sourceKey) {
  const index = ANIMATION_CLIP_BIN_PROPERTIES.indexOf(property);
  if (index < 0) {
    return err(
      failure(
        sourceKey,
        "translation | rotation | scale | weights",
        `property ${JSON.stringify(property)}`
      )
    );
  }
  return ok(index);
}
function interpolationIndex(interpolation, sourceKey) {
  const index = ANIMATION_CLIP_BIN_INTERPOLATIONS.indexOf(interpolation);
  if (index < 0) {
    return err(
      failure(sourceKey, "LINEAR | STEP", `interpolation ${JSON.stringify(interpolation)}`)
    );
  }
  return ok(index);
}
function targetIdBytes(targetId, sourceKey) {
  if (!TARGET_ID_RE.test(targetId)) {
    return err(failure(sourceKey, "32-char lowercase hex targetId", JSON.stringify(targetId)));
  }
  const bytes = new Uint8Array(ANIMATION_CLIP_BIN_TARGET_ID_BYTES);
  for (let i = 0; i < ANIMATION_CLIP_BIN_TARGET_ID_BYTES; i++) {
    bytes[i] = Number.parseInt(targetId.slice(i * 2, i * 2 + 2), 16);
  }
  return ok(bytes);
}
function animationClipSamplerBytes(channels) {
  let total = 0;
  for (const channel of channels) {
    total += channel.sampler.input.length * 4 + channel.sampler.output.length * 4;
  }
  return total;
}
function packAnimationClipBinV1(clip, sourceKey) {
  if (!Number.isFinite(clip.duration) || clip.duration < 0) {
    return err(failure(sourceKey, "a finite non-negative duration", `duration=${clip.duration}`));
  }
  const tableBytes = clip.channels.length * ANIMATION_CLIP_BIN_CHANNEL_ENTRY_V1_BYTES;
  const payloadChunks = [];
  let payloadBytes = 0;
  const table = new Uint8Array(tableBytes);
  const tableView = new DataView(table.buffer);
  for (const [index, channel] of clip.channels.entries()) {
    const property = propertyIndex(channel.property, sourceKey);
    if (!property.ok) return property;
    const interpolation = interpolationIndex(channel.sampler.interpolation, sourceKey);
    if (!interpolation.ok) return interpolation;
    const targetId = targetIdBytes(channel.targetId, sourceKey);
    if (!targetId.ok) return targetId;
    const input = float32Bytes(channel.sampler.input);
    const output = float32Bytes(channel.sampler.output);
    const entry = index * ANIMATION_CLIP_BIN_CHANNEL_ENTRY_V1_BYTES;
    tableView.setUint8(entry, property.value);
    tableView.setUint8(entry + 1, interpolation.value);
    tableView.setUint16(entry + 2, 0, true);
    tableView.setUint32(entry + 4, channel.sampler.input.length, true);
    tableView.setUint32(entry + 8, channel.sampler.output.length, true);
    tableView.setUint32(entry + 12, payloadBytes, true);
    payloadChunks.push(input);
    payloadBytes += input.byteLength;
    tableView.setUint32(entry + 16, payloadBytes, true);
    payloadChunks.push(output);
    payloadBytes += output.byteLength;
    tableView.setUint32(entry + 20, 0, true);
    tableView.setUint32(entry + 24, 0, true);
    tableView.setUint32(entry + 28, 0, true);
    table.set(targetId.value, entry + 32);
  }
  const bytes = new Uint8Array(ANIMATION_CLIP_BIN_HEADER_V1_BYTES + tableBytes + payloadBytes);
  writeAnimationClipBinHeader(
    {
      version: 1,
      channelCount: clip.channels.length,
      duration: clip.duration,
      tableBytes,
      payloadBytes
    },
    bytes
  );
  bytes.set(table, ANIMATION_CLIP_BIN_HEADER_V1_BYTES);
  let offset = ANIMATION_CLIP_BIN_HEADER_V1_BYTES + tableBytes;
  for (const chunk of payloadChunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return ok(bytes);
}
function animationClipBodyArtifact(clip, sourceKey) {
  if (animationClipSamplerBytes(clip.channels) < ANIMATION_CLIP_BIN_EXTERNALIZE_THRESHOLD_BYTES) {
    return ok(void 0);
  }
  const packed = packAnimationClipBinV1(clip, sourceKey);
  if (!packed.ok) return packed;
  return ok({
    mediaType: ANIMATION_CLIP_BIN_MEDIA_TYPE,
    assetCodec: { name: ANIMATION_CLIP_BIN_CODEC_NAME, version: ANIMATION_CLIP_BIN_CODEC_VERSION },
    bytes: packed.value
  });
}

export { animationClipBodyArtifact, animationClipSamplerBytes, packAnimationClipBinV1 };
