// src/target-id.ts
import { blake3 } from "../../../vendor/@noble/hashes/blake3.js";
var NAMESPACE = Uint8Array.of(
  49,
  121,
  245,
  25,
  217,
  39,
  79,
  242,
  181,
  150,
  111,
  208,
  119,
  2,
  57,
  17
);
var TARGET_ID_PATTERN = /^[0-9a-f]{32}$/;
var textEncoder = new TextEncoder();
function deriveAnimationTargetId(path) {
  const segments = path.map((segment) => textEncoder.encode(segment));
  const input = new Uint8Array(
    NAMESPACE.length + segments.reduce((length, segment) => length + 4 + segment.length, 0)
  );
  input.set(NAMESPACE);
  const view = new DataView(input.buffer);
  let offset = NAMESPACE.length;
  for (const segment of segments) {
    view.setUint32(offset, segment.length, true);
    offset += 4;
    input.set(segment, offset);
    offset += segment.length;
  }
  const bytes = blake3(input).slice(0, 16);
  bytes[6] = (bytes[6] ?? 0) & 15 | 128;
  bytes[8] = (bytes[8] ?? 0) & 63 | 128;
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}
function isAnimationTargetId(value) {
  return typeof value === "string" && TARGET_ID_PATTERN.test(value);
}

export {
  deriveAnimationTargetId,
  isAnimationTargetId
};
