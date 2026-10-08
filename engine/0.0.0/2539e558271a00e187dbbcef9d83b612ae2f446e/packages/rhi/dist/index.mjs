import { err, ok } from '../../types/dist/index.mjs';
export { err, ok } from '../../types/dist/index.mjs';

// src/errors.ts
var RhiError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    super(`[RhiError ${args.code}] expected: ${args.expected}; hint: ${args.hint}`);
    this.name = "RhiError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    this.detail = args.detail;
  }
};
function validateDrawArgs(worldCount, owner) {
  if (worldCount === 0) {
    return err(
      new RhiError({
        code: "render-system-empty-worlds",
        expected: "worlds array has at least one world",
        hint: "pass at least one world: draw([world], { cameraOwner: 0, resourceOwner: 0 })"
      })
    );
  }
  const { cameraOwner, resourceOwner } = owner;
  const outOfRange = (index) => !Number.isInteger(index) || index < 0 || index >= worldCount;
  if (outOfRange(cameraOwner)) {
    return err(
      new RhiError({
        code: "render-system-owner-out-of-range",
        expected: "cameraOwner is an index into worlds (0 <= cameraOwner < worlds.length)",
        hint: "cameraOwner must be in 0..worlds.length-1; the cameraOwner world supplies the surfaced cameras",
        detail: { role: "camera", owner: cameraOwner, worldCount }
      })
    );
  }
  if (outOfRange(resourceOwner)) {
    return err(
      new RhiError({
        code: "render-system-owner-out-of-range",
        expected: "resourceOwner is an index into worlds (0 <= resourceOwner < worlds.length)",
        hint: "resourceOwner must be in 0..worlds.length-1; the resourceOwner world supplies skylight/skybox/postProcess",
        detail: { role: "resource", owner: resourceOwner, worldCount }
      })
    );
  }
  return ok(void 0);
}

// src/capability/texture-format.ts
var R32FLOAT_MIP_SAMPLED_STORAGE_PROFILE = "r32float-mip-sampled-storage";
var R32FLOAT_PROBE_STAGES = [
  "texture-create",
  "mip-view",
  "sampled-storage-bind-group",
  "pipeline-bind",
  "finish",
  "submit",
  "completion",
  "readback"
];
function createUnavailableR32FloatReceipt(options) {
  const failureIndex = R32FLOAT_PROBE_STAGES.indexOf(options.failedStage);
  const evidence = options.evidence ?? "real";
  return {
    profile: R32FLOAT_MIP_SAMPLED_STORAGE_PROFILE,
    verdict: "unavailable",
    evidence,
    deviceGeneration: options.deviceGeneration,
    stages: R32FLOAT_PROBE_STAGES.map((stage, index) => ({
      stage,
      verdict: index < failureIndex ? "admitted" : "unavailable",
      evidence,
      ...stage === options.failedStage ? { detail: options.detail } : {}
    })),
    sampleType: "unfilterable-float",
    usages: ["texture-binding", "storage-binding", "copy-src"],
    probeExecutions: 1
  };
}
function validateR32FloatReceipt(receipt) {
  const missing = R32FLOAT_PROBE_STAGES.find(
    (stage) => !receipt.stages.some((entry) => entry.stage === stage)
  );
  if (missing !== void 0) {
    return unavailable(receipt, missing, `required stage ${missing} is missing`);
  }
  if (receipt.profile !== R32FLOAT_MIP_SAMPLED_STORAGE_PROFILE) {
    return unavailable(receipt, "texture-create", "profile is not the closed r32float profile");
  }
  if (receipt.sampleType !== "unfilterable-float") {
    return unavailable(
      receipt,
      "sampled-storage-bind-group",
      "sample type must be unfilterable-float"
    );
  }
  if (receipt.usages.length !== 3 || receipt.usages[0] !== "texture-binding" || receipt.usages[1] !== "storage-binding" || receipt.usages[2] !== "copy-src") {
    return unavailable(
      receipt,
      "sampled-storage-bind-group",
      "sampled, storage, and readback usages are required"
    );
  }
  if (receipt.verdict === "admitted" && receipt.readback === void 0) {
    return unavailable(receipt, "readback", "admitted profiles require real readback evidence");
  }
  return ok(receipt);
}
function unavailable(receipt, stage, detail) {
  return err(
    new RhiError({
      code: "rhi-texture-format-capability-unavailable",
      expected: `r32float profile stage ${stage} to be complete`,
      hint: "retain fallback-only rendering and retry the owner-owned device probe",
      detail: {
        stage,
        deviceGeneration: receipt.deviceGeneration,
        reason: detail
      }
    })
  );
}

// src/index.ts
function cubeArrayDepthDescriptor(faceSize = 512, layers = 4, usage = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING) {
  return {
    size: { width: faceSize, height: faceSize, depthOrArrayLayers: 6 * layers },
    format: "depth32float",
    dimension: "2d",
    usage
  };
}
function comparisonSamplerDescriptor() {
  return {
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
    addressModeW: "clamp-to-edge",
    magFilter: "linear",
    minFilter: "linear",
    compare: "less"
  };
}
function cubeArrayDepthFaceView(layerIndex, faceIndex) {
  return {
    format: "depth32float",
    dimension: "2d",
    aspect: "depth-only",
    baseArrayLayer: layerIndex * 6 + faceIndex,
    arrayLayerCount: 1,
    baseMipLevel: 0,
    mipLevelCount: 1
  };
}

export { R32FLOAT_MIP_SAMPLED_STORAGE_PROFILE, R32FLOAT_PROBE_STAGES, RhiError, comparisonSamplerDescriptor, createUnavailableR32FloatReceipt, cubeArrayDepthDescriptor, cubeArrayDepthFaceView, validateDrawArgs, validateR32FloatReceipt };
