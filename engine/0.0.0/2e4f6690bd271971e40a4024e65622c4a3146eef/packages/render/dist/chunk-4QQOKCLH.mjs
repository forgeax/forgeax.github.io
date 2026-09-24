// src/temporal/coverage.ts
function createTemporalCoverage(width, height) {
  if (!Number.isSafeInteger(width) || width <= 0) throw new RangeError("width must be positive.");
  if (!Number.isSafeInteger(height) || height <= 0)
    throw new RangeError("height must be positive.");
  return Object.freeze({ width, height, bytes: 34 * width * height, fullScreen: true });
}
function classifySceneDataCoverage(input) {
  const exactContributorIds = input.contributors.filter((c) => c.kind === "exact").map((c) => c.id);
  const reactiveContributorIds = input.contributors.filter((c) => c.kind === "reactive").map((c) => c.id);
  const available = new Set(input.contributors.map((c) => c.id));
  const missing = input.requiredContributorIds.filter((id) => !available.has(id));
  return {
    exactContributorIds: Object.freeze(exactContributorIds),
    reactiveContributorIds: Object.freeze(reactiveContributorIds),
    missingContributorIds: Object.freeze(missing.slice(0, 32)),
    omittedMissingContributorCount: Math.max(0, missing.length - 32),
    complete: missing.length === 0
  };
}
function scanSceneDataCoverage(input) {
  const classification = classifySceneDataCoverage({
    contributors: input.contributorIds.map((id) => ({ id, kind: "exact" })),
    requiredContributorIds: input.requiredContributorIds
  });
  return Object.freeze({
    schema: input.schema,
    lane: input.lane,
    producerId: input.producerId,
    ...classification,
    contributorIds: Object.freeze([...input.contributorIds])
  });
}

// src/scene/probe-blend-record.ts
var PROBE_BLEND_RECORD_BYTE_SIZE = 160;
var PROBE_BLEND_RECORD_STRIDE = 256;
var PROBE_BLEND_RECORD_CAPACITY = 64;
var PROBE_BLEND_SENTINEL = -1;
function emptyProbeBlendRecord(objectKey = PROBE_BLEND_SENTINEL, sentinel = "no-lkg") {
  const bytes = new Uint8Array(PROBE_BLEND_RECORD_BYTE_SIZE);
  return {
    objectKey,
    generation: 0,
    localBlendFraction: 0,
    shPreblend: new Array(27).fill(0),
    bytes,
    byteLength: bytes.byteLength,
    candidate: false,
    accepted: false,
    lastKnownGood: false,
    sentinel
  };
}
function probeBlendRecordOffset(objectKey) {
  if (!Number.isInteger(objectKey) || objectKey < 0) {
    throw new Error("probe blend record requires a non-negative object key");
  }
  return (objectKey + 1) * PROBE_BLEND_RECORD_STRIDE;
}

export { PROBE_BLEND_RECORD_BYTE_SIZE, PROBE_BLEND_RECORD_CAPACITY, PROBE_BLEND_RECORD_STRIDE, classifySceneDataCoverage, createTemporalCoverage, emptyProbeBlendRecord, probeBlendRecordOffset, scanSceneDataCoverage };
