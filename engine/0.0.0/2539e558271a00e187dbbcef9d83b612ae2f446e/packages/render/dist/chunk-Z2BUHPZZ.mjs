import { RenderFeaturePreparedStateMismatchError, GPU_TEXTURE_USAGE_RENDER_ATTACHMENT, GPU_TEXTURE_USAGE_TEXTURE_BINDING, GPU_TEXTURE_USAGE_COPY_SRC, SceneDataUnavailableError } from './chunk-OYW4NIWJ.mjs';
import { derive, err, ok } from '../../types/dist/index.mjs';
import { ok as ok$1, err as err$1, RhiError } from '../../rhi/dist/index.mjs';
import { DEFAULT_STANDARD_PBR_PARAM_SCHEMA } from '../../shader/dist/index.mjs';

// src/pipeline/standard-lighting/layout.ts
var DEFAULT_CLUSTER_GRID = { x: 16, y: 9, z: 24 };
var CLUSTER_GRID_STRIDE_U32 = 2;
var LIGHT_INDEX_LIST_CAPACITY = 1048576;
var MAX_LIGHTS = 256;
function createStandardClusterLayout(grid = DEFAULT_CLUSTER_GRID) {
  const clusterCount = grid.x * grid.y * grid.z;
  return Object.freeze({
    grid,
    clusterCount,
    clusterGridStrideU32: CLUSTER_GRID_STRIDE_U32,
    clusterGridU32Length: clusterCount * CLUSTER_GRID_STRIDE_U32,
    lightIndexListCapacity: LIGHT_INDEX_LIST_CAPACITY,
    lightDataSlotCount: MAX_LIGHTS,
    lightBoundsInt32Length: MAX_LIGHTS * 6
  });
}
createStandardClusterLayout();

// src/pipeline/standard-profile.ts
var STANDARD_PIPELINE_ID = "forgeax::standard";
var STANDARD_LIGHT_COUNTS = [1, 32, 256];
var STANDARD_POST_STAGE_NAMES = [
  "transparent-blend",
  "bloom",
  "output-transform",
  "fxaa",
  "post-effect",
  "present"
];
var DEFAULT_STANDARD_PROFILE = Object.freeze({
  pipelineId: STANDARD_PIPELINE_ID,
  lightCount: 32,
  renderPath: "forward",
  shadows: "filtered",
  pbr: true,
  ibl: true,
  ssao: false,
  postStages: STANDARD_POST_STAGE_NAMES
});
function resolveVolumetricFogProfile(profile) {
  return profile.volumetricFog ?? { quality: "high", depth: 64, tileSize: 4 };
}

// src/ibl/kernel-cache.ts
var REFLECTION_PROBE_IBL_STAGES = ["raw", "filtered", "publish"];
var kernelCaches = /* @__PURE__ */ new Map();
function createIblKernelCache(generation) {
  const existing = kernelCaches.get(generation);
  if (existing !== void 0) return existing;
  const created = {
    generation,
    pipelineIdentity: {},
    samplerIdentity: {},
    brdfLutIdentity: {}
  };
  kernelCaches.set(generation, created);
  return created;
}
function createProbeIblOutput(input) {
  return {
    ...input,
    raw: {},
    filtered: {},
    rawGeneration: 0,
    filteredGeneration: 0,
    lkg: true
  };
}
function beginProbeIblUpdate(output) {
  return {
    ...output,
    stages: REFLECTION_PROBE_IBL_STAGES,
    nextStage: "raw",
    candidateGeneration: output.filteredGeneration + 1
  };
}
function publishProbeIblOutput(update, result) {
  if (!result.ok || result.stage !== update.nextStage) return update;
  if (result.stage === "raw") {
    return {
      ...update,
      rawGeneration: update.candidateGeneration
    };
  }
  if (result.stage === "filtered") return update;
  return {
    ...update,
    filteredGeneration: update.candidateGeneration,
    lkg: true
  };
}
function resetIblKernelCaches() {
  kernelCaches.clear();
}

// src/temporal/scene-data.ts
var SCENE_DATA_TEMPORAL_V1_SCHEMA = "forgeax::scene-data::temporal-v1";
var SCENE_DATA_TEMPORAL_V1_DESCRIPTOR = Object.freeze({
  schema: SCENE_DATA_TEMPORAL_V1_SCHEMA,
  format: "rgba16float",
  sampleCount: 1,
  extent: "render-resolution",
  clearValue: [0, 0, -1, 1],
  channels: Object.freeze({
    motionUv: "rg",
    viewDepth: "b-log2-1-plus-depth",
    reactive: "a"
  })
});
var targetOwners = /* @__PURE__ */ new WeakMap();
function registerSceneDataTarget(target, owner) {
  targetOwners.set(target, owner);
}
function sceneDataTargetOwner(target) {
  return typeof target === "object" && target !== null ? targetOwners.get(target) : void 0;
}
function sceneDataTokenMismatch(operation, reason, owner, target) {
  const detail = reason === "generation-mismatch" ? {
    featureIdentity: owner.featureIdentity,
    order: -1,
    stage: "contribute",
    operation,
    resourceKind: "attachment",
    reason,
    expectedGeneration: owner.generation,
    actualGeneration: targetOwners.get(target)?.generation ?? -1,
    recovery: "renderer-recover"
  } : reason === "foreign-feature" ? {
    featureIdentity: owner.featureIdentity,
    order: -1,
    stage: "contribute",
    operation,
    resourceKind: "attachment",
    reason,
    expectedFeatureIdentity: owner.featureIdentity,
    actualFeatureIdentity: targetOwners.get(target)?.featureIdentity ?? "unknown",
    recovery: "next-frame"
  } : reason === "foreign-kind" ? {
    featureIdentity: owner.featureIdentity,
    order: -1,
    stage: "contribute",
    operation,
    resourceKind: "attachment",
    reason,
    expectedKind: "attachment",
    actualKind: "pipeline",
    recovery: "next-frame"
  } : {
    featureIdentity: owner.featureIdentity,
    order: -1,
    stage: "contribute",
    operation,
    resourceKind: "attachment",
    reason,
    expectedLayout: "sampled-read-temporal-v1",
    actualLayout: target?.access ?? "unknown",
    recovery: "next-frame"
  };
  return new RenderFeaturePreparedStateMismatchError(detail);
}
function isSceneDataTarget(value) {
  if (value === null || typeof value !== "object") return false;
  const candidate = value;
  return candidate.kind === "scene-data" && candidate.schema === SCENE_DATA_TEMPORAL_V1_SCHEMA && candidate.access === "sampled-read" && candidate.format === "rgba16float" && candidate.sampleCount === 1 && candidate.extent === "render-resolution" && targetOwners.has(value);
}
function sceneDataTargetAsAttachment(_target) {
  throw new TypeError("SceneDataTarget is sampled-read-only and cannot be used as an attachment");
}
function sceneDataError(error) {
  return error;
}
function availability(options) {
  if (options.recovering) return { status: "unavailable", reason: "renderer-recovering" };
  if (!options.rgba16floatRenderable)
    return { status: "unavailable", reason: "capability-missing" };
  if (options.producerPresent === false)
    return { status: "unavailable", reason: "producer-missing" };
  if (options.coverageComplete === false)
    return { status: "unavailable", reason: "coverage-incomplete" };
  return {
    status: "available",
    completeness: options.reactiveFallback ? "exact-with-reactive-fallback" : "exact"
  };
}
function createTarget(owner) {
  const target = Object.freeze({
    kind: "scene-data",
    schema: SCENE_DATA_TEMPORAL_V1_SCHEMA,
    access: "sampled-read",
    format: "rgba16float",
    sampleCount: 1,
    extent: "render-resolution"
  });
  registerSceneDataTarget(target, {
    featureIdentity: owner.featureIdentity,
    planIdentity: owner.planIdentity,
    generation: owner.generation
  });
  return target;
}
function tokenError(catalog, operation) {
  return sceneDataTokenMismatch(
    operation,
    "foreign-kind",
    {
      featureIdentity: catalog.featureIdentity,
      planIdentity: catalog.planIdentity,
      generation: catalog.generation
    },
    void 0
  );
}
function unavailableError(options, reason) {
  const recovery = reason === "capability-missing" ? "enable-capability" : reason === "renderer-recovering" ? "renderer-recover" : "next-frame";
  return new SceneDataUnavailableError({
    featureIdentity: options.featureIdentity,
    schema: SCENE_DATA_TEMPORAL_V1_SCHEMA,
    lane: options.lane ?? "direct",
    reason,
    missingContributorIds: options.missingContributorIds ?? [],
    omittedMissingContributorCount: 0,
    recovery
  });
}
function createSceneDataCatalog(options) {
  const state = availability(options);
  const owner = {
    featureIdentity: options.featureIdentity,
    planIdentity: options.planIdentity,
    generation: options.generation
  };
  const missing = [...options.missingContributorIds ?? []];
  const inspectionBase = {
    schema: SCENE_DATA_TEMPORAL_V1_SCHEMA,
    generation: options.generation,
    planIdentity: options.planIdentity,
    lane: options.lane ?? "direct",
    missingContributorIds: Object.freeze(missing.slice(0, 32)),
    omittedMissingContributorCount: Math.max(0, missing.length - 32)
  };
  return {
    schema: SCENE_DATA_TEMPORAL_V1_SCHEMA,
    generation: options.generation,
    planIdentity: options.planIdentity,
    availability: state,
    require(schema) {
      if (schema !== SCENE_DATA_TEMPORAL_V1_SCHEMA || state.status !== "available") {
        if (state.status === "unavailable") throw unavailableError(options, state.reason);
        throw tokenError(options, "require scene-data target");
      }
      return createTarget(options);
    },
    validate(target, generation = options.generation) {
      const targetOwner = sceneDataTargetOwner(target);
      if (targetOwner === void 0) {
        return err(
          sceneDataTokenMismatch("validate scene-data target", "foreign-feature", owner, target)
        );
      }
      if (targetOwner.planIdentity !== owner.planIdentity || targetOwner.featureIdentity !== owner.featureIdentity) {
        return err(
          sceneDataTokenMismatch("validate scene-data target", "foreign-feature", owner, target)
        );
      }
      if (generation !== owner.generation || targetOwner.generation !== owner.generation) {
        return err(
          sceneDataTokenMismatch(
            "validate scene-data target",
            "generation-mismatch",
            owner,
            target
          )
        );
      }
      if (target.access !== "sampled-read") {
        return err(
          sceneDataTokenMismatch("validate scene-data target", "layout-mismatch", owner, target)
        );
      }
      return ok(target);
    },
    inspect() {
      return Object.freeze(
        state.status === "available" ? { ...inspectionBase, status: state.status, completeness: state.completeness } : { ...inspectionBase, status: state.status, reason: state.reason }
      );
    }
  };
}
var STANDARD_PBR_UBO_SIZE = derive(DEFAULT_STANDARD_PBR_PARAM_SCHEMA).uboLayout.totalBytes;
var MATERIAL_PER_ENTITY_STRIDE = Math.ceil(STANDARD_PBR_UBO_SIZE / 256) * 256;
function resolveSurfaceProfile(storageFormat, viewFormat, facts) {
  if (facts.surfaceViewFormats) {
    return ok$1({
      kind: "dual-view",
      storageFormat,
      viewFormat,
      viewFormats: [viewFormat],
      hasDisplayEndpoint: true
    });
  }
  if (!facts.rawAttachment || !facts.floatRenderAttachment) {
    return err$1(
      new RhiError({
        code: "webgpu-runtime-error",
        expected: "raw surface attachment and rgba16float render attachment capabilities",
        hint: "surface profile cannot establish a raw-only linear output route",
        detail: {
          error: {
            code: "surface-raw-endpoint-failed",
            message: "raw-only surface capabilities are incomplete"
          }
        }
      })
    );
  }
  return ok$1({
    kind: "raw-only",
    storageFormat,
    viewFormat: storageFormat,
    viewFormats: [],
    hasDisplayEndpoint: false
  });
}
function resolveSurfaceFormatPair(_backendKind, storage, view) {
  return { storage, view };
}
function surfaceCapabilityFacts(device, storageFormat) {
  const internal = device;
  return {
    surfaceViewFormats: internal.surfaceViewFormats ?? device.caps?.backendKind !== "wgpu-webgl2",
    rawAttachment: storageFormat === "rgba8unorm" || storageFormat === "bgra8unorm",
    floatRenderAttachment: device.caps?.rgba16floatRenderable ?? true
  };
}
function configureSurface(context, device, format, colorAttachmentFormat) {
  const backendKind = device.caps?.backendKind ?? "webgpu";
  const isWebGl2 = backendKind === "wgpu-webgl2";
  const surfaceFormats = resolveSurfaceFormatPair(
    backendKind,
    format,
    colorAttachmentFormat
  );
  const profile = resolveSurfaceProfile(
    surfaceFormats.storage,
    surfaceFormats.view,
    surfaceCapabilityFacts(device, surfaceFormats.storage)
  );
  if (!profile.ok) return profile;
  const supportsTextureBinding = backendKind !== "wgpu-webgl2" && (device.caps?.storageBuffer ?? true);
  const configured = context.configure({
    device,
    format: surfaceFormats.storage,
    alphaMode: isWebGl2 ? "opaque" : "premultiplied",
    usage: GPU_TEXTURE_USAGE_RENDER_ATTACHMENT | (supportsTextureBinding ? GPU_TEXTURE_USAGE_TEXTURE_BINDING : 0) | (isWebGl2 ? 0 : GPU_TEXTURE_USAGE_COPY_SRC),
    viewFormats: [...profile.value.viewFormats]
  });
  if (!configured.ok) return configured;
  if (isWebGl2 && (context.presentationProof === void 0 || !context.presentationProof.descriptor || !context.presentationProof.acquisition || !context.presentationProof.validation || typeof context.presentationProof.surfaceIdentity !== "string" || context.presentationProof.surfaceIdentity.length === 0 || context.presentationProof.requested === void 0 || context.presentationProof.validated === void 0 || JSON.stringify(context.presentationProof.requested) !== JSON.stringify(context.presentationProof.validated))) {
    return err$1(
      new RhiError({
        code: "webgpu-runtime-error",
        expected: "WebGL2 surface storage has descriptor, acquisition, and validation proof",
        hint: "run the concrete presentation probe and retain the last-known-good graph when proof is absent",
        detail: {
          error: {
            code: "surface-raw-endpoint-failed",
            message: "surface storage raw endpoint proof is incomplete"
          }
        }
      })
    );
  }
  return ok$1(void 0);
}
function selectSwapChainFormat(storageBufferCapable, surfaceViewFormats = true) {
  if (!storageBufferCapable) {
    return {
      storage: "rgba8unorm",
      view: surfaceViewFormats ? "rgba8unorm-srgb" : "rgba8unorm"
    };
  }
  const nav = globalThis.navigator;
  const gpu = nav?.gpu;
  const getPreferred = gpu?.getPreferredCanvasFormat;
  if (gpu !== void 0 && typeof getPreferred === "function") {
    const storage = getPreferred.call(gpu);
    const view = storage === "rgba8unorm" ? "rgba8unorm-srgb" : storage === "bgra8unorm" ? "bgra8unorm-srgb" : storage;
    return {
      storage,
      view: surfaceViewFormats ? view : storage
    };
  }
  return {
    storage: "rgba8unorm",
    view: surfaceViewFormats ? "rgba8unorm-srgb" : "rgba8unorm",
    fallbackReason: "preferred-canvas-format-missing"
  };
}

export { CLUSTER_GRID_STRIDE_U32, DEFAULT_CLUSTER_GRID, DEFAULT_STANDARD_PROFILE, LIGHT_INDEX_LIST_CAPACITY, MATERIAL_PER_ENTITY_STRIDE, MAX_LIGHTS, REFLECTION_PROBE_IBL_STAGES, SCENE_DATA_TEMPORAL_V1_DESCRIPTOR, SCENE_DATA_TEMPORAL_V1_SCHEMA, STANDARD_LIGHT_COUNTS, STANDARD_PBR_UBO_SIZE, STANDARD_PIPELINE_ID, STANDARD_POST_STAGE_NAMES, beginProbeIblUpdate, configureSurface, createIblKernelCache, createProbeIblOutput, createSceneDataCatalog, createStandardClusterLayout, isSceneDataTarget, publishProbeIblOutput, registerSceneDataTarget, resetIblKernelCaches, resolveSurfaceFormatPair, resolveSurfaceProfile, resolveVolumetricFogProfile, sceneDataError, sceneDataTargetAsAttachment, sceneDataTargetOwner, sceneDataTokenMismatch, selectSwapChainFormat };
