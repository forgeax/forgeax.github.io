import { err, ok, derive } from '../../types/dist/index.mjs';
import { cubeArrayDepthDescriptor, comparisonSamplerDescriptor, cubeArrayDepthFaceView } from '../../rhi/dist/index.mjs';
import { vec3 } from '../../math/dist/index.mjs';
import { InstanceTransformsStrideMismatchError } from '../../ecs/dist/projection/index.mjs';
import { STANDARD_PIPELINE_PARAM_SCHEMA, standardPhysicalTextureFields, STANDARD_PHYSICAL_TEXTURE_FIELDS } from '../../shader/dist/index.mjs';
import { deriveVertexLayoutProjection } from '../../geometry/dist/index.mjs';

// src/pipeline/standard-output/auto-exposure/inspection.ts
var AutoExposureInvalidParameterError = class extends Error {
  constructor(detail) {
    super(`auto-exposure-invalid-parameter: ${detail.field}`);
    this.detail = detail;
    this.name = "AutoExposureInvalidParameterError";
  }
  detail;
  code = "auto-exposure-invalid-parameter";
  expected = ERROR_POLICY[this.code].expected;
  hint = ERROR_POLICY[this.code].hint;
};
var AutoExposureCapabilityUnavailableError = class extends Error {
  constructor(detail) {
    super(`auto-exposure-capability-unavailable: ${detail.capability}`);
    this.detail = detail;
    this.name = "AutoExposureCapabilityUnavailableError";
  }
  detail;
  code = "auto-exposure-capability-unavailable";
  expected = ERROR_POLICY[this.code].expected;
  hint = ERROR_POLICY[this.code].hint;
};
var AutoExposureStaleGenerationError = class extends Error {
  constructor(detail) {
    super(
      `auto-exposure-stale-generation: ${detail.actualGeneration} != ${detail.expectedGeneration}`
    );
    this.detail = detail;
    this.name = "AutoExposureStaleGenerationError";
  }
  detail;
  code = "auto-exposure-stale-generation";
  expected = ERROR_POLICY[this.code].expected;
  hint = ERROR_POLICY[this.code].hint;
};
var AutoExposureStageFailedError = class extends Error {
  constructor(detail) {
    super(`auto-exposure-stage-failed: ${detail.operation}`);
    this.detail = detail;
    this.name = "AutoExposureStageFailedError";
  }
  detail;
  code = "auto-exposure-stage-failed";
  expected = ERROR_POLICY[this.code].expected;
  hint = ERROR_POLICY[this.code].hint;
};
var ERROR_POLICY = {
  "auto-exposure-invalid-parameter": {
    expected: "camera auto-exposure parameters are finite and within their declared ranges",
    hint: "inspect the field and provide a finite value before rebuilding the camera output"
  },
  "auto-exposure-capability-unavailable": {
    expected: "the auto-exposure stage has the required device capability",
    hint: "inspect live capabilities and retry the same camera generation"
  },
  "auto-exposure-stale-generation": {
    expected: "the prepared auto-exposure state matches the camera target generation",
    hint: "discard stale prepared state and rebuild from the latest camera snapshot"
  },
  "auto-exposure-stage-failed": {
    expected: "the auto-exposure stage completes its declared operation",
    hint: "inspect the structured cause, preserve lastKnownGood, and retry the stage"
  }
};
function createAutoExposureError(input) {
  if (input instanceof AutoExposureInvalidParameterError || input instanceof AutoExposureCapabilityUnavailableError || input instanceof AutoExposureStaleGenerationError || input instanceof AutoExposureStageFailedError) {
    return input;
  }
  switch (input.code) {
    case "auto-exposure-invalid-parameter":
      return new AutoExposureInvalidParameterError(input.detail);
    case "auto-exposure-capability-unavailable":
      return new AutoExposureCapabilityUnavailableError(input.detail);
    case "auto-exposure-stale-generation":
      return new AutoExposureStaleGenerationError(input.detail);
    case "auto-exposure-stage-failed":
      return new AutoExposureStageFailedError(input.detail);
  }
}
function cloneExposure(exposure) {
  if (exposure.kind === "manual") return { ...exposure };
  return {
    ...exposure,
    rangeEv: [exposure.rangeEv[0], exposure.rangeEv[1]],
    rates: [exposure.rates[0], exposure.rates[1]]
  };
}
function cloneFailure(error) {
  if (error === void 0) return void 0;
  return Object.freeze({
    ...error,
    detail: Object.freeze({ ...error.detail })
  });
}
function createAutoExposureInspection(input) {
  const base = {
    requested: cloneExposure(input.requested),
    actual: input.actual,
    actualState: input.actualState ?? (input.actual === null ? "gpu-resident" : "accepted"),
    fallback: input.fallback,
    lastKnownGood: input.lastKnownGood,
    targetGeneration: input.targetGeneration,
    reset: Object.freeze([...input.reset]),
    cost: Object.freeze({ ...input.cost }),
    receipt: Object.freeze({ ...input.receipt })
  };
  if (input.recentFailure === void 0) return Object.freeze(base);
  const recentFailure = cloneFailure(createAutoExposureError(input.recentFailure));
  if (recentFailure === void 0) return Object.freeze(base);
  return Object.freeze({ ...base, recentFailure });
}

// src/errors/render.ts
var LifecycleConstructionError = class extends Error {
  code = "lifecycle-construction-failed";
  expected = "all DeviceScope resources establish and terminate in order";
  hint = "inspect detail and cleanupFailures, then recover or rebuild the DeviceScope";
  detail;
  constructor(detail) {
    super(`lifecycle-construction-failed: ${detail.resourceKind} lifecycle transaction failed`);
    this.name = "LifecycleConstructionError";
    this.detail = detail;
  }
};
var LightResourceUnavailableError = class extends Error {
  code = "light-resource-unavailable";
  expected;
  hint;
  detail;
  constructor(detail, expected, actual, hint) {
    super(`light-resource-unavailable: ${detail.feature} ${actual}`);
    this.name = "LightResourceUnavailableError";
    this.expected = expected;
    this.hint = hint;
    this.detail = detail;
  }
};
function createLightResourceUnavailable(input) {
  return new LightResourceUnavailableError(
    {
      entity: input.entity,
      feature: input.feature,
      generation: input.generation,
      sourceKey: input.sourceKey,
      reason: input.reason
    },
    input.expected,
    input.actual,
    input.hint
  );
}
var TemporalFrameSubmitError = class extends Error {
  code = "temporal-frame-submit-rejected";
  expected = "the staged frame is accepted by queue.submit before temporal facts advance";
  hint = "inspect the queue submission and retry the frame after the device is available";
  detail;
  constructor(reason) {
    super(`temporal-frame-submit-rejected: ${reason}`);
    this.name = "TemporalFrameSubmitError";
    this.detail = { reason };
  }
};
var ShadowInvalidConfigError = class extends Error {
  code = "shadow-invalid-config";
  expected;
  hint;
  detail;
  constructor(field, actual, minOrBound, maxOrComparator, reason) {
    const bound = typeof minOrBound === "number" ? typeof maxOrComparator === "number" ? { kind: "range", min: minOrBound, max: maxOrComparator } : {
      kind: "lower-bound",
      operator: maxOrComparator === ">" ? ">" : ">=",
      value: minOrBound
    } : minOrBound;
    const resolvedReason = reason ?? shadowBoundReason(bound);
    const expected = shadowBoundExpected(field, bound);
    const hint = `set ${field} to ${resolvedReason}; got ${actual}`;
    super(`shadow component .${field} is invalid: ${resolvedReason}; got ${actual}`);
    this.name = "ShadowInvalidConfigError";
    this.hint = hint;
    this.expected = expected;
    this.detail = { field, actual, bound, reason: resolvedReason };
  }
};
function shadowBoundExpected(field, bound) {
  switch (bound.kind) {
    case "range":
      return `${field} in [${bound.min}, ${bound.max}]`;
    case "lower-bound":
      return `${field} ${bound.operator} ${bound.value}`;
    case "allowed-values":
      return `${field} in {${bound.values.join(", ")}}`;
  }
}
function shadowBoundReason(bound) {
  switch (bound.kind) {
    case "range":
      return `a value in [${bound.min}, ${bound.max}]`;
    case "lower-bound":
      return `a value ${bound.operator} ${bound.value}`;
    case "allowed-values":
      return `one of [${bound.values.join(", ")}]`;
  }
}
var EquirectProjectionFailedError = class extends Error {
  code = "equirect-projection-failed";
  expected;
  hint;
  detail;
  constructor(handle) {
    const expected = `equirect handle ${handle} projects to a GPU cubemap + IBL precompute`;
    const hint = `equirect handle ${handle} referenced by Skylight/SkyboxBackground failed projection; declare Skylight{equirect} with a valid HDR equirect source and check device.caps.rgba16floatRenderable. The projection is internal (no user upload call); the record arm does not retry`;
    super(`equirect handle ${handle} cubemap projection failed`);
    this.name = "EquirectProjectionFailedError";
    this.expected = expected;
    this.hint = hint;
    this.detail = { handle };
  }
};
var StandardLightBudgetExceededError = class extends Error {
  code = "standard-light-budget-exceeded";
  expected;
  hint;
  detail;
  constructor(actual, budget) {
    const expected = `light count <= ${budget}`;
    const hint = `${actual} finite local lights exceed Standard budget ${budget}; reduce the local-light set or select a profile with a supported budget`;
    super(`Standard light budget exceeded: ${actual} > ${budget}`);
    this.name = "StandardLightBudgetExceededError";
    this.expected = expected;
    this.hint = hint;
    this.detail = { actual, budget };
  }
};
var StandardClusterIndexOverflowError = class extends Error {
  code = "standard-cluster-index-overflow";
  expected;
  hint;
  detail;
  constructor(actual, capacity) {
    const expected = `light index list entries <= ${capacity}`;
    const hint = `cluster binner overflow: writeCount ${actual} exceeds capacity ${capacity}; reduce finite local lights or choose a supported cluster layout`;
    super(`Standard cluster index list overflow: ${actual} > ${capacity}`);
    this.name = "StandardClusterIndexOverflowError";
    this.expected = expected;
    this.hint = hint;
    this.detail = { actual, capacity };
  }
};
var StandardClusterTransportUnavailableError = class extends Error {
  code = "standard-cluster-transport-unavailable";
  expected = "all requested local lights have a proven Cluster transport";
  hint;
  detail;
  constructor(requested, hint = "enable a proven Cluster storage transport before drawing") {
    super(`Standard Cluster transport unavailable for ${requested} local lights`);
    this.name = "StandardClusterTransportUnavailableError";
    this.hint = hint;
    this.detail = { requested, admitted: 0 };
  }
};
var StandardProfileInvalidError = class extends Error {
  code = "standard-profile-invalid";
  expected;
  hint;
  detail;
  constructor(message, detail) {
    super(message);
    this.name = "StandardProfileInvalidError";
    this.detail = detail ?? { field: "profile", actual: message };
    if (this.detail.field === "clusterGrid") {
      this.expected = "clusterGrid.{x,y,z} each positive integer in [1, 64]";
      this.hint = "set clusterGrid.x, clusterGrid.y, and clusterGrid.z to positive integers in [1, 64]";
    } else {
      this.expected = "StandardProfile contains only supported fields and values";
      this.hint = "repair the Standard profile fields and retry setProfile";
    }
  }
};
var PointShadowAtlasUninitializedError = class extends Error {
  code = "point-shadow-atlas-uninitialized";
  expected;
  hint;
  constructor() {
    const expected = "ShadowAtlas.ensure() invoked before faceView()";
    const hint = "Gate faceView on isAllocated() or call ensure() once in the per-frame extract step before iterating face views";
    super("ShadowAtlas.faceView called before ensure(); the cube_array texture is not allocated");
    this.name = "PointShadowAtlasUninitializedError";
    this.expected = expected;
    this.hint = hint;
  }
};
var PointShadowAtlasBoundsViolationError = class extends Error {
  code = "point-shadow-atlas-bounds-violation";
  expected;
  hint;
  detail;
  constructor(axis, value, max) {
    const expected = `0 <= ${axis} < ${max}`;
    const hint = axis === "layer" ? `clamp PointLight.shadowAtlasLayer to [0, ${max}); the cap on layers equals PointLightShadow cardinality (4)` : `clamp face index to [0, ${max}); cube faces are indexed 0..5 in +X/-X/+Y/-Y/+Z/-Z order`;
    super(`ShadowAtlas.faceView ${axis} out of range: ${value} (must be in [0, ${max}))`);
    this.name = "PointShadowAtlasBoundsViolationError";
    this.expected = expected;
    this.hint = hint;
    this.detail = { axis, value, max };
  }
};
var VideoUploadUnsupportedError = class extends Error {
  code = "video-upload-unsupported";
  expected;
  hint;
  constructor() {
    const expected = "at least one video upload path available: a host HTMLVideoElement (general copyExternalImageToTexture path) or GPUExternalTexture capability (high-perf path)";
    const hint = "this backend exposes no usable video upload path; render a static texture instead, or switch to a WebGPU backend that supports video texture upload";
    super("video upload unsupported \u2014 no general or high-perf path available");
    this.name = "VideoUploadUnsupportedError";
    this.expected = expected;
    this.hint = hint;
  }
};
var VertexColorVariantConflictError = class extends Error {
  code = "vertex-color-variant-conflict";
  expected;
  hint;
  detail;
  constructor(authoredValue, projected) {
    const expected = `VERTEX_COLOR_AVAILABLE=${projected ? "true" : "false"}`;
    const hint = "derive the shader variant from the mesh VertexLayoutProjection; COLOR_0 presence is a geometry fact";
    super(`authored vertex-color variant ${authoredValue} disagrees with projected ${expected}`);
    this.name = "VertexColorVariantConflictError";
    this.expected = expected;
    this.hint = hint;
    this.detail = { authored: true, authoredValue, projected };
  }
};
var SkinPaletteOverflowError = class extends Error {
  code = "skin-palette-overflow";
  expected;
  hint;
  detail;
  constructor(requestedBytes, limit) {
    const expected = `skinned joint palette (${requestedBytes} B) fits within device.limits.maxStorageBufferBindingSize (${limit} B)`;
    const hint = "palette buffer exceeds device maxStorageBufferBindingSize; reduce skinned entity count or split into multiple palette buffers (OOS-skin-palette-batch)";
    super(`skin palette buffer needs ${requestedBytes} B, exceeds device limit ${limit} B`);
    this.name = "SkinPaletteOverflowError";
    this.expected = expected;
    this.hint = hint;
    this.detail = { requestedBytes, limit };
  }
};
var SkinMaterialMismatchError = class extends Error {
  code = "skin-material-mismatch";
  expected;
  hint;
  detail;
  constructor(entity, actualShader) {
    const expected = "Skin entity's first material program module === 'forgeax::pbr-skin'";
    const hint = `entity ${entity} has Skin but the first material program module is ${actualShader ?? "<empty>"}; load the mesh via the gltf importer (cooker auto-routes 'forgeax::pbr-skin' for skinned primitives), or remove the Skin component to render the entity unskinned with Materials.standard / Materials.unlit`;
    super(
      `Skin / material mismatch on entity ${entity}: expected forgeax::pbr-skin, got ${actualShader ?? "<empty>"}`
    );
    this.name = "SkinMaterialMismatchError";
    this.expected = expected;
    this.hint = hint;
    this.detail = { entity, actualShader };
  }
};
var MaterialSkinAttrMissingError = class extends Error {
  code = "material-skin-attr-missing";
  expected;
  hint;
  detail;
  constructor(entity, missing) {
    const expected = "pbr-skin material requires mesh.attributes.skinIndex + skinWeight";
    const hint = `entity ${entity} uses forgeax::pbr-skin but its MeshAsset is missing ${missing}; switch the entity to a skinned glTF mesh authored with JOINTS_0 + WEIGHTS_0, or change the material to a non-skin shader via Materials.standard / Materials.unlit`;
    super(
      `material/skin attribute mismatch on entity ${entity}: pbr-skin material with mesh missing ${missing}`
    );
    this.name = "MaterialSkinAttrMissingError";
    this.expected = expected;
    this.hint = hint;
    this.detail = { entity, missing };
  }
};
var TransmissionCapabilityMissingError = class extends Error {
  code = "transmission-capability-missing";
  expected = "the renderer exposes the transmission capability for this material";
  hint = "disable transmission or provide the renderer capability before drawing";
  detail;
  constructor(material, stage, evidence) {
    super(`transmission capability is missing for material '${material}'`);
    this.name = "TransmissionCapabilityMissingError";
    this.detail = { material, capability: "transmission", stage, ...evidence };
  }
};
var renderFeatureRecoveryHintByRecovery = {
  "next-frame": (featureIdentity, stage) => `correct '${featureIdentity}' ${stage} data and retry on the next frame`,
  "renderer-recover": (featureIdentity, _stage) => `wait for renderer recovery before retrying '${featureIdentity}'`,
  registration: (featureIdentity, _stage) => `correct '${featureIdentity}' registration before retrying`
};
var RenderFeatureRegistrationConflictError = class extends Error {
  code = "render-feature-registration-conflict";
  expected;
  hint;
  detail;
  constructor(featureIdentity, order, conflictingOrder) {
    const expected = `feature identity '${featureIdentity}' is unique`;
    const hint = `rename '${featureIdentity}' or remove the duplicate feature before registration`;
    super(`render feature registration conflict for '${featureIdentity}'`);
    this.name = "RenderFeatureRegistrationConflictError";
    this.expected = expected;
    this.hint = hint;
    this.detail = { featureIdentity, order, conflictingOrder };
  }
};
var RenderFeatureStageFailedError = class extends Error {
  code = "render-feature-stage-failed";
  expected;
  hint;
  detail;
  constructor(featureIdentity, order, stage, recovery, cause) {
    const expected = `feature '${featureIdentity}' completes its ${stage} stage without an error`;
    const hint = renderFeatureRecoveryHintByRecovery[recovery](featureIdentity, stage);
    super(`render feature '${featureIdentity}' failed during ${stage}`);
    this.name = "RenderFeatureStageFailedError";
    this.expected = expected;
    this.hint = hint;
    this.detail = {
      featureIdentity,
      order,
      stage,
      recovery,
      ...cause === void 0 ? {} : { cause }
    };
  }
};
var RenderFeatureCapabilityMissingError = class extends Error {
  code = "render-feature-capability-missing";
  expected;
  hint;
  detail;
  constructor(featureIdentity, order, capability) {
    const expected = `device capability '${capability}' is available for feature '${featureIdentity}'`;
    const hint = `disable '${featureIdentity}' or use a device with '${capability}' capability`;
    super(`render feature '${featureIdentity}' requires missing capability '${capability}'`);
    this.name = "RenderFeatureCapabilityMissingError";
    this.expected = expected;
    this.hint = hint;
    this.detail = { featureIdentity, order, capability };
  }
};
var RenderFeaturePreparationFailedError = class extends Error {
  code = "render-feature-preparation-failed";
  expected;
  hint;
  detail;
  constructor(featureIdentity, order, operation, resourceKind, resourceName, reason, recovery) {
    const expected = `${resourceKind} '${resourceName}' is prepared during ${operation}`;
    const hint = `repair '${resourceName}' and retry feature '${featureIdentity}' on ${recovery}`;
    super(`render feature '${featureIdentity}' preparation failed for '${resourceName}'`);
    this.name = "RenderFeaturePreparationFailedError";
    this.expected = expected;
    this.hint = hint;
    this.detail = {
      featureIdentity,
      order,
      stage: "prepare",
      operation,
      resourceKind,
      resourceName,
      reason,
      recovery
    };
  }
};
var RenderFeaturePreparedStateMismatchError = class extends Error {
  code = "render-feature-prepared-state-mismatch";
  expected;
  hint;
  detail;
  constructor(detail) {
    const expected = `${detail.resourceKind} state is compatible for '${detail.operation}'`;
    const hint = `repair '${detail.reason}' for feature '${detail.featureIdentity}' and retry`;
    super(`render feature '${detail.featureIdentity}' prepared state mismatch`);
    this.name = "RenderFeaturePreparedStateMismatchError";
    this.expected = expected;
    this.hint = hint;
    this.detail = detail;
  }
};
var RenderFeatureDrawRecordingFailedError = class extends Error {
  code = "render-feature-draw-recording-failed";
  expected;
  hint;
  detail;
  constructor(featureIdentity, order, operation, resourceKind, reason, backendReason, recovery) {
    const expected = `${resourceKind} recording succeeds for '${operation}'`;
    const hint = `repair '${reason}' and retry feature '${featureIdentity}' after ${recovery}`;
    super(`render feature '${featureIdentity}' draw recording failed`);
    this.name = "RenderFeatureDrawRecordingFailedError";
    this.expected = expected;
    this.hint = hint;
    this.detail = {
      featureIdentity,
      order,
      stage: "record",
      operation,
      resourceKind,
      reason,
      backendReason,
      recovery
    };
  }
};
var ObservationUnavailableError = class extends Error {
  code = "observation-unavailable";
  expected;
  hint;
  detail;
  constructor(reason, hint) {
    let recovery;
    if (reason === "copy-src") recovery = "enable-copy-src";
    else if (reason === "resource" || reason === "readback-failed") recovery = "retry-readback";
    else recovery = "draw-current-frame";
    super(`current-frame observation unavailable: ${reason}`);
    this.name = "ObservationUnavailableError";
    this.expected = "a fresh producer-owned rgba16float current-frame observation";
    this.hint = hint;
    this.detail = { reason, recovery };
  }
};
var SceneDataUnavailableError = class extends Error {
  code = "scene-data-unavailable";
  expected = "the requested semantic scene data is available for the active plan";
  hint;
  detail;
  constructor(detail) {
    const hint = detail.recovery === "enable-capability" ? "enable rgba16floatRenderable and retry the current frame" : detail.recovery === "renderer-recover" ? "wait for renderer recovery, then retry the frame" : "restore the producer coverage and retry on the next frame";
    super(`scene data '${detail.schema}' unavailable for '${detail.featureIdentity}'`);
    this.name = "SceneDataUnavailableError";
    this.hint = hint;
    this.detail = Object.freeze({
      ...detail,
      missingContributorIds: Object.freeze([...detail.missingContributorIds].slice(0, 32)),
      omittedMissingContributorCount: Math.max(
        detail.omittedMissingContributorCount,
        Math.max(0, detail.missingContributorIds.length - 32)
      )
    });
  }
};
var FrameReceiptStaleError = class extends Error {
  code = "frame-receipt-stale";
  expected = "the observation receipt belongs to the active device generation";
  hint = "draw a new frame and call observe with its returned FrameReceipt";
  detail;
  constructor(detail) {
    super("frame receipt belongs to a retired device generation");
    this.name = "FrameReceiptStaleError";
    this.detail = detail;
  }
};
var RendererContractFailureError = class extends Error {
  code = "renderer-contract-failed";
  expected = "renderer owner contracts remain valid at the public boundary";
  hint = "repair the owner contract and retry the operation";
  detail;
  constructor(operation, cause) {
    super(`renderer ${operation} contract failed: ${cause}`);
    this.name = "RendererContractFailureError";
    this.detail = { operation, cause };
  }
};
var EnvironmentSourceConflictError = class extends Error {
  code = "environment-source-conflict";
  expected = "exactly one environment source owns the frame";
  hint = "remove all but one image or atmosphere environment owner";
  detail;
  constructor(owners) {
    super("environment source owners conflict");
    this.name = "EnvironmentSourceConflictError";
    this.detail = { owners: owners.map((owner) => Object.freeze({ ...owner })) };
  }
};
var FogCardinalityError = class extends Error {
  code = "fog-cardinality";
  expected = "zero or one Fog owner contributes to a frame";
  hint = "remove extra Fog owners so the resource owner has at most one";
  detail;
  constructor(count) {
    super(`Fog owner cardinality is ${count}`);
    this.name = "FogCardinalityError";
    this.detail = { count };
  }
};
var TaaCapsInsufficientError = class extends Error {
  code = "taa-caps-insufficient";
  expected = "the backend exposes the capabilities required by TAA";
  hint = "select a backend with the required TAA capabilities or disable TAA on Camera";
  detail;
  constructor(required, available) {
    super("TAA capabilities are insufficient");
    this.name = "TaaCapsInsufficientError";
    this.detail = { required: [...required], available: [...available] };
  }
};
var EnvironmentGenerationFailedError = class extends Error {
  code = "environment-generation-failed";
  expected = "the selected environment generation completes its owner stage";
  hint = "inspect the stage and sourceKey, then retry after correcting the environment";
  detail;
  constructor(sourceKey, stage) {
    super(`environment generation failed during ${stage}`);
    this.name = "EnvironmentGenerationFailedError";
    this.detail = { sourceKey, stage };
  }
};
var AtmosphereInvalidParameterError = class extends Error {
  code = "atmosphere-invalid-parameter";
  expected;
  hint;
  detail;
  constructor(field, value, range) {
    super(`Atmosphere.${field} is invalid`);
    this.name = "AtmosphereInvalidParameterError";
    this.detail = { field, value };
    const rangeText = Number.isFinite(range.max) ? `[${range.min}, ${range.max}]` : `>= ${range.min}`;
    this.expected = `Atmosphere.${field} must be finite and ${rangeText}`;
    this.hint = `set Atmosphere.${field} to a finite value ${rangeText}`;
  }
};
var DynamicResolutionInvalidParameterError = class extends Error {
  code = "dynamic-resolution-invalid-parameter";
  expected;
  hint;
  detail;
  constructor(detail) {
    super(`DynamicResolution.${detail.field} is invalid`);
    this.name = "DynamicResolutionInvalidParameterError";
    this.expected = `DynamicResolution.${detail.field} must be ${detail.expected}`;
    this.hint = `set DynamicResolution.${detail.field} to a value that is ${detail.expected}`;
    this.detail = detail;
  }
};
var DynamicResolutionRequiresTaaError = class extends Error {
  code = "dynamic-resolution-requires-taa";
  expected = "DynamicResolution requires Camera.antialias to be 'taa'";
  hint = "set Camera.antialias to 'taa' or remove DynamicResolution before retrying";
  detail;
  constructor(detail) {
    super("DynamicResolution requires TAA");
    this.name = "DynamicResolutionRequiresTaaError";
    this.detail = detail;
  }
};
var DynamicResolutionTimingUnavailableError = class extends Error {
  code = "dynamic-resolution-timing-unavailable";
  expected = "adaptive resolution receives a completed GPU timing sample";
  hint = "use fixed minScale=maxScale or retry after timestamp support is available";
  detail;
  constructor(detail) {
    super(`DynamicResolution timing is unavailable for generation ${detail.generation}`);
    this.name = "DynamicResolutionTimingUnavailableError";
    this.detail = detail;
  }
};
var BarrelDistortionInvalidParameterError = class extends Error {
  code = "barrel-distortion-invalid-parameter";
  expected;
  hint;
  detail;
  constructor(detail) {
    super(`BarrelDistortion.${detail.field} is invalid`);
    this.name = "BarrelDistortionInvalidParameterError";
    this.expected = `BarrelDistortion.${detail.field} must be ${detail.expected}`;
    this.hint = `set BarrelDistortion.${detail.field} to a value that is ${detail.expected}`;
    this.detail = detail;
  }
};
var OwnerStageFailedError = class extends Error {
  code = "owner-stage-failed";
  expected = "the owner completes its current frame stage";
  hint = "inspect the owner and stage, keep the last-known-good frame, and retry";
  detail;
  constructor(owner, stage) {
    super(`${owner} owner failed during ${stage}`);
    this.name = "OwnerStageFailedError";
    this.detail = { owner, stage };
  }
};
var RENDERER_OPERATION_ERROR_POLICY = {
  "world-lease-invalid": {
    expected: "every render World is represented by a live lease owned by this Renderer",
    hint: "attach the World to this Renderer and use the returned lease"
  },
  "frame-input-invalid": {
    expected: "the frame input references attached leases and a valid immutable RenderProfile",
    hint: "repair the frame input and retry draw or setProfile"
  },
  "scene-projection-failed": {
    expected: "the attached World projects into the renderer-owned RenderScene",
    hint: "inspect the structured cause, repair the World publication, and retry draw"
  },
  "asset-binding-failed": {
    expected: "all frame assets resolve to valid renderer-owned bindings",
    hint: "inspect the structured cause, rebuild or cold-cook the asset, and retry draw"
  },
  "feature-plan-failed": {
    expected: "every installed RenderFeature produces a valid declarative plan",
    hint: "inspect the feature cause, repair its plan, and retry draw"
  },
  "graph-build-failed": {
    expected: "the Standard graph builds from the active profile and feature plans",
    hint: "inspect the graph cause, repair the profile or plan, and retry"
  },
  "device-operation-failed": {
    expected: "the active device generation completes the renderer-owned operation",
    hint: "inspect renderer state and the structured cause, then retry or recover"
  },
  "surface-unavailable": {
    expected: "the presentation surface accepts the requested lifecycle operation",
    hint: "inspect renderer state, then restore the surface or create a new Renderer"
  },
  "renderer-state-invalid": {
    expected: "the Renderer is in a state that accepts the requested operation",
    hint: "inspect renderer state and choose retry, restoreSurface, recover, or stop"
  },
  "recovery-failed": {
    expected: "one recovery attempt publishes a complete replacement device generation",
    hint: "inspect the structured cause and retry recover after the host-selected delay"
  },
  "cleanup-failed": {
    expected: "Renderer disposal completes every registered cleanup in reverse ownership order",
    hint: "inspect the ordered cleanup causes; the Renderer remains disposed and must not be reused"
  }
};
function formatNestedRendererCause(cause, depth = 0) {
  if (depth > 8) return "...";
  if (typeof cause === "string") return cause;
  if (cause instanceof Error) {
    const gpuMessage = Reflect.get(cause, "gpuMessage");
    const parts = [
      `${cause.name}: ${cause.message}`,
      typeof gpuMessage === "string" && gpuMessage.length > 0 && !cause.message.includes(gpuMessage) ? gpuMessage : void 0
    ].filter((value) => value !== void 0);
    if (cause.cause !== void 0) {
      parts.push(formatNestedRendererCause(cause.cause, depth + 1));
    } else {
      const detail = Reflect.get(cause, "detail");
      if (detail !== void 0) parts.push(formatNestedRendererCause(detail, depth + 1));
    }
    return parts.join(" <- ");
  }
  if (typeof cause === "object" && cause !== null) {
    const record = cause;
    const head = [
      typeof record.code === "string" ? record.code : void 0,
      typeof record.expected === "string" ? record.expected : void 0,
      typeof record.message === "string" ? record.message : void 0,
      typeof record.gpuMessage === "string" ? record.gpuMessage : void 0,
      typeof record.hint === "string" ? record.hint : void 0,
      typeof record.reason === "string" ? record.reason : void 0
    ].filter((value) => value !== void 0 && value.length > 0).join(": ");
    const inner = record.cause !== void 0 ? formatNestedRendererCause(record.cause, depth + 1) : void 0;
    const detailCause = record.detail !== void 0 && record.detail !== record.cause ? formatNestedRendererCause(record.detail, depth + 1) : void 0;
    return [head.length > 0 ? head : void 0, inner, detailCause].filter((value) => value !== void 0 && value.length > 0).join(" <- ");
  }
  return String(cause);
}
function rendererOperationMessage(code, expected, detail) {
  const nested = formatNestedRendererCause(detail);
  return nested.length > 0 ? `${code}: ${expected}; cause: ${nested}` : `${code}: ${expected}`;
}
var RendererOperationError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(code, detail) {
    const policy = RENDERER_OPERATION_ERROR_POLICY[code];
    super(rendererOperationMessage(code, policy.expected, detail));
    this.name = "RendererOperationError";
    this.code = code;
    this.expected = policy.expected;
    this.hint = policy.hint;
    this.detail = detail;
    if (typeof detail === "object" && detail !== null && "cause" in detail) {
      this.cause = detail.cause;
    }
  }
};
var PointsLinesInvalidStyleError = class extends Error {
  code = "points-lines-invalid-style";
  expected;
  hint;
  detail;
  constructor(detail) {
    super(`invalid ${detail.component} style at ${detail.field}`);
    this.name = "PointsLinesInvalidStyleError";
    this.expected = detail.expected;
    this.hint = `repair entity ${detail.entity} ${detail.component}.${detail.field} and retry admission`;
    this.detail = detail;
  }
};
var PointsLinesTopologyMismatchError = class extends Error {
  code = "points-lines-topology-mismatch";
  expected;
  hint;
  detail;
  constructor(detail) {
    super(`Points/Lines topology mismatch at submesh ${detail.submesh}`);
    this.name = "PointsLinesTopologyMismatchError";
    this.expected = `submesh ${detail.submesh} topology is ${detail.expected}`;
    this.hint = `rebuild entity ${detail.entity} with ${detail.expected} geometry before retrying Points/Lines admission`;
    this.detail = detail;
  }
};
var PointsLinesStyleUnsupportedError = class extends Error {
  code = "points-lines-style-unsupported";
  expected;
  hint;
  detail;
  constructor(detail) {
    super(`unsupported Points/Lines ${detail.field} member ${detail.member}`);
    this.name = "PointsLinesStyleUnsupportedError";
    this.expected = `${detail.field} is one of ${detail.supported.join(", ")}`;
    this.hint = `use a supported Points/Lines ${detail.field} member or wait for a later milestone`;
    this.detail = detail;
  }
};
var PointsLinesMaterialUnsupportedError = class extends Error {
  code = "points-lines-material-unsupported";
  expected = "one engine-owned unlit forward MaterialAsset pass";
  hint;
  detail;
  constructor(detail) {
    super(`Points/Lines material is unsupported on entity ${detail.entity}`);
    this.name = "PointsLinesMaterialUnsupportedError";
    this.hint = `use Materials.unlit without a shadow-caster pass for entity ${detail.entity}`;
    this.detail = detail;
  }
};
var PointsLinesBudgetExceededError = class extends Error {
  code = "points-lines-budget-exceeded";
  expected;
  hint;
  detail;
  constructor(detail) {
    super(`Points/Lines ${detail.unit} budget exceeded`);
    this.name = "PointsLinesBudgetExceededError";
    this.expected = `${detail.unit} <= ${detail.limit}`;
    this.hint = `reduce Points/Lines ${detail.unit} or split the entity into bounded equivalent batches`;
    this.detail = detail;
  }
};
var PointsLinesPrepareFailedError = class extends Error {
  code = "points-lines-prepare-failed";
  expected = "the complete Points/Lines candidate validates before publication";
  hint;
  detail;
  constructor(detail) {
    super(`Points/Lines prepare failed at generation ${detail.generation}`);
    this.name = "PointsLinesPrepareFailedError";
    this.hint = detail.lastKnownGood ? "retain the last known good candidate, repair the producer, and retry prepare" : "repair the producer and retry prepare; the failed first candidate produces zero draw";
    this.detail = detail;
  }
};
var RenderTargetDescriptorInvalidError = class extends Error {
  code = "render-target-descriptor-invalid";
  expected;
  hint;
  detail;
  constructor(detail) {
    super(`render-target-descriptor-invalid: ${detail.field} does not satisfy ${detail.expected}`);
    this.name = "RenderTargetDescriptorInvalidError";
    this.expected = detail.expected;
    this.hint = `set RenderTargetDescriptor.${detail.field} to the expected value, then retry create or resize`;
    this.detail = detail;
  }
};
var RenderTargetCapabilityMissingError = class extends Error {
  code = "render-target-capability-missing";
  expected;
  hint;
  detail;
  constructor(detail) {
    super(
      `render-target-capability-missing: ${detail.capability} does not admit ${detail.requested}`
    );
    this.name = "RenderTargetCapabilityMissingError";
    this.expected = `${detail.capability} admits ${detail.requested}`;
    this.hint = `choose an admitted target descriptor or use a backend providing ${detail.capability}`;
    this.detail = detail;
  }
};
var RenderTargetStateInvalidError = class extends Error {
  code = "render-target-state-invalid";
  expected;
  hint;
  detail;
  constructor(detail) {
    super(`render-target-state-invalid: ${detail.operation} cannot use ${detail.reason}`);
    this.name = "RenderTargetStateInvalidError";
    this.expected = `target state permits ${detail.operation}`;
    this.hint = "use the Renderer that created the target, then initialize, recover, or stop using the destroyed token";
    this.detail = detail;
  }
};
var RenderTargetOperationFailedError = class extends Error {
  code = "render-target-operation-failed";
  expected;
  hint;
  detail;
  constructor(detail) {
    super(`render-target-operation-failed: ${detail.operation} failed during ${detail.stage}`);
    this.name = "RenderTargetOperationFailedError";
    this.expected = `${detail.operation} completes ${detail.stage}`;
    this.hint = "inspect detail.cause, then retry, recover the Renderer, or retain the last-known-good generation";
    this.detail = detail;
  }
};
var RenderIntentInvalidError = class extends Error {
  code = "render-intent-invalid";
  expected;
  hint;
  detail;
  constructor(component, value) {
    super(`render-intent-invalid: ${component}.updateIntent is not an admitted value`);
    this.name = "RenderIntentInvalidError";
    this.expected = `${component}.updateIntent is one of 0, 1, or 2`;
    this.hint = `set ${component}.updateIntent to 0, 1, or 2`;
    this.detail = { component, field: "updateIntent", value, allowed: [0, 1, 2] };
  }
};
var VolumeOwnerConflictError = class extends Error {
  code = "volume-owner-conflict";
  expected = "at most eight local VolumetricFog owners per rendered World";
  hint = "reduce simultaneously visible volume owners and retry extraction";
  detail;
  constructor(ownerCount) {
    super(`volume-owner-conflict: received ${ownerCount} owners`);
    this.name = "VolumeOwnerConflictError";
    this.detail = { ownerCount };
  }
};
var VolumeDensityShapeMismatchError = class extends Error {
  code = "volume-density-shape-mismatch";
  expected = "density is a linear 3D TextureAsset";
  hint = "bind a verified linear texture with viewDimension 3d";
  detail;
  constructor(guid, viewDimension) {
    super(`volume-density-shape-mismatch: ${viewDimension} density is not 3d`);
    this.name = "VolumeDensityShapeMismatchError";
    this.detail = { guid, viewDimension };
  }
};
var VolumeInvalidBoundsError = class extends Error {
  code = "volume-invalid-bounds";
  expected = "bounds are finite and max is greater than min on every axis";
  hint = "set finite non-degenerate volume bounds";
  detail;
  constructor(bounds) {
    super("volume-invalid-bounds: bounds must be finite and non-degenerate");
    this.name = "VolumeInvalidBoundsError";
    this.detail = bounds;
  }
};
var VolumeInvalidParametersError = class extends Error {
  code = "volume-invalid-parameters";
  expected = "volume parameters remain finite and inside their closed ranges";
  hint = "repair extinction, albedo, emission, anisotropy, maxDistance, or sampling";
  detail;
  constructor(input) {
    const invalidSampling = input.sampling !== void 0 && input.sampling !== "noise" && input.sampling !== "density";
    const field = invalidSampling ? "sampling" : input.maxDistance !== void 0 && input.maxDistance <= 0 ? "maxDistance" : "parameters";
    const value = invalidSampling ? input.sampling : field === "maxDistance" ? input.maxDistance : input.anisotropy;
    super(`volume-invalid-parameters: ${field} is outside the authored range`);
    this.name = "VolumeInvalidParametersError";
    this.detail = { field, value };
  }
};
var MOTION_BLUR_PARAMS_BYTE_SIZE = 32;
var DEFAULT_MOTION_BLUR_PARAMS = Object.freeze({
  shutterAngle: 180,
  maxRadiusPixels: 32,
  sampleCount: 8,
  targetFps: 60
});
var MotionBlurValidationError = class extends Error {
  code = "motion-blur-invalid-params";
  expected;
  hint;
  detail;
  constructor(detail) {
    const integer = detail.integer === true ? "integer " : "";
    const expected = `${detail.field} ${integer}in [${detail.min}, ${detail.max}]`;
    super(`motion-blur-invalid-params: ${expected}`);
    this.name = "MotionBlurValidationError";
    this.expected = expected;
    this.hint = `set ${detail.field} to an ${integer}value in [${detail.min}, ${detail.max}]`;
    this.detail = detail;
  }
};
function validateField(field, value, min, max, integer = false) {
  if (!Number.isFinite(value) || value < min || value > max || integer && !Number.isInteger(value)) {
    return new MotionBlurValidationError({
      field,
      value,
      min,
      max,
      ...integer ? { integer } : {}
    });
  }
  return void 0;
}
function validateMotionBlurParams(input) {
  const value = input ?? {};
  const shutterAngle = value.shutterAngle ?? DEFAULT_MOTION_BLUR_PARAMS.shutterAngle;
  const maxRadiusPixels = value.maxRadiusPixels ?? DEFAULT_MOTION_BLUR_PARAMS.maxRadiusPixels;
  const sampleCount = value.sampleCount ?? DEFAULT_MOTION_BLUR_PARAMS.sampleCount;
  const targetFps = value.targetFps ?? DEFAULT_MOTION_BLUR_PARAMS.targetFps;
  const shutterError = validateField("shutterAngle", shutterAngle, 0, 360);
  if (shutterError !== void 0) return err(shutterError);
  const radiusError = validateField("maxRadiusPixels", maxRadiusPixels, 0, 64);
  if (radiusError !== void 0) return err(radiusError);
  const sampleError = validateField("sampleCount", sampleCount, 4, 16, true);
  if (sampleError !== void 0) return err(sampleError);
  const targetFpsError = validateField("targetFps", targetFps, 0, 240, true);
  if (targetFpsError !== void 0) return err(targetFpsError);
  return ok(Object.freeze({ shutterAngle, maxRadiusPixels, sampleCount, targetFps }));
}
function motionBlurTemporalDemand(params) {
  return params !== void 0 && params.shutterAngle > 0 && params.maxRadiusPixels > 0;
}
function effectiveMotionBlurSampleCount(sampleCount) {
  if (!Number.isFinite(sampleCount) || sampleCount < 4) return 0;
  if (sampleCount < 8) return 4;
  if (sampleCount < 16) return 8;
  return 16;
}
function isMotionBlurIntervalValid(frameDeltaSeconds) {
  return Number.isFinite(frameDeltaSeconds) && frameDeltaSeconds > 0 && frameDeltaSeconds <= 0.1;
}
function motionBlurExposureScale(frameDeltaSeconds, targetFps) {
  if (!isMotionBlurIntervalValid(frameDeltaSeconds)) return 0;
  if (!Number.isFinite(targetFps) || targetFps < 0 || targetFps > 240 || !Number.isInteger(targetFps)) {
    return 0;
  }
  if (targetFps === 0) return 1;
  return 1 / (targetFps * frameDeltaSeconds);
}
function motionBlurSampleDelta(sampleTimeSeconds, previousSampleTimeSeconds, fallbackDeltaSeconds) {
  if (sampleTimeSeconds !== void 0 && !Number.isFinite(sampleTimeSeconds) || previousSampleTimeSeconds !== void 0 && !Number.isFinite(previousSampleTimeSeconds)) {
    return Number.NaN;
  }
  if (Number.isFinite(sampleTimeSeconds) && Number.isFinite(previousSampleTimeSeconds)) {
    return sampleTimeSeconds - previousSampleTimeSeconds;
  }
  return fallbackDeltaSeconds;
}
function resolveMotionBlurParams(input) {
  if (input === void 0) return ok(void 0);
  return validateMotionBlurParams(input);
}
var DeviceResourceRef = class {
  kind;
  owner;
  generation;
  value;
  constructor(kind, owner, generation, value) {
    this.kind = kind;
    this.owner = owner;
    this.generation = generation;
    this.value = value;
  }
  isCurrent(scope) {
    return scope.accepts(this);
  }
  isStale(scope) {
    return !this.isCurrent(scope);
  }
};
function idempotentCleanup(cleanup) {
  let cleaned = false;
  return (value) => {
    if (cleaned) return;
    cleaned = true;
    return cleanup(value);
  };
}
var DeviceScope = class _DeviceScope {
  generation;
  owner;
  parent;
  lifecycleState = "active";
  resources = /* @__PURE__ */ new Map();
  children = [];
  constructor(generation, owner, parent) {
    this.generation = generation;
    this.owner = owner;
    this.parent = parent;
    parent?.children.push(this);
  }
  static create(generation, owner) {
    if (!Number.isSafeInteger(generation) || generation < 0) {
      throw new RangeError("DeviceScope generation must be a non-negative safe integer.");
    }
    if (owner.length === 0) throw new TypeError("DeviceScope owner must not be empty.");
    return new _DeviceScope(generation, owner);
  }
  get state() {
    return this.lifecycleState;
  }
  get childrenSnapshot() {
    return [...this.children];
  }
  /** Create a renderer-owned child scope without exposing a second device owner. */
  createChild(owner) {
    if (this.lifecycleState !== "active") {
      throw new Error("Cannot create a child DeviceScope from an inactive scope.");
    }
    if (owner.length === 0) throw new TypeError("DeviceScope child owner must not be empty.");
    return new _DeviceScope(this.generation, owner, this);
  }
  ref(kind, value) {
    const ref = new DeviceResourceRef(kind, this.owner, this.generation, value);
    this.resources.set(ref, { ref, cleanup: () => void 0 });
    return ref;
  }
  accepts(ref) {
    return this.lifecycleState === "active" && ref.owner === this.owner && ref.generation === this.generation;
  }
  isAlive() {
    return this.lifecycleState === "active";
  }
  resourceDelta() {
    return this.resources.size;
  }
  /** @internal */
  _adopt(kind, value, cleanup) {
    const ref = new DeviceResourceRef(kind, this.owner, this.generation, value);
    this.resources.set(ref, {
      ref,
      cleanup: idempotentCleanup(cleanup)
    });
    return ref;
  }
  /** @internal Remove ownership only after the resource's cleanup succeeded. */
  _release(ref) {
    this.resources.delete(ref);
  }
  /** @internal */
  _clearResources() {
    const resources = [...this.resources.values()];
    this.resources.clear();
    for (const resource of resources.reverse()) {
      try {
        const pending = resource.cleanup(resource.ref.value);
        if (pending instanceof Promise) void pending.catch(() => void 0);
      } catch {
      }
    }
    return resources;
  }
  /** Mark an active child as retiring without releasing in-flight resources. */
  beginRetire() {
    if (this.lifecycleState === "active") this.lifecycleState = "retiring";
  }
  clearChildren() {
    for (const child of [...this.children].reverse()) {
      child.retire();
    }
  }
  detachChild(child) {
    const index = this.children.indexOf(child);
    if (index >= 0) this.children.splice(index, 1);
  }
  retire() {
    if (this.lifecycleState !== "active" && this.lifecycleState !== "retiring") return;
    this.lifecycleState = "retiring";
    this.clearChildren();
    this._clearResources();
    this.lifecycleState = "retired";
    this.parent?.detachChild(this);
  }
  abandon() {
    if (this.lifecycleState !== "active") return;
    this.lifecycleState = "abandoned";
    this.clearChildren();
    this._clearResources();
    this.parent?.detachChild(this);
  }
  dispose() {
    if (this.lifecycleState === "disposed") return;
    this.lifecycleState = "disposed";
    this.clearChildren();
    this._clearResources();
    this.parent?.detachChild(this);
  }
  async replace(generation, resources) {
    const replacement = new _DeviceScope(generation, this.owner, this);
    const transaction = new LifecycleTransaction(replacement);
    for (const resource of resources) transaction.add(resource);
    const result = await transaction.commit();
    if (!result.ok) {
      replacement.abandon();
      return result;
    }
    if (!this.isAlive()) {
      replacement.dispose();
      return transaction.failure("dispose");
    }
    this.detachChild(replacement);
    this.retire();
    return ok(replacement);
  }
  /** @internal */
  _receipt() {
    return {
      owner: this.owner,
      generation: this.generation,
      resourceCount: this.resources.size
    };
  }
};
var LifecycleTransaction = class {
  constructor(scope, options = {}) {
    this.scope = scope;
    this.options = options;
  }
  scope;
  resources = [];
  options;
  committed = false;
  add(spec) {
    if (this.committed) throw new Error("LifecycleTransaction is already committed.");
    this.resources.push(spec);
    return this;
  }
  async commit() {
    if (this.committed) return this.failure("create");
    this.committed = true;
    const created = [];
    for (let index = 0; index < this.resources.length; index += 1) {
      const spec = this.resources[index];
      if (spec === void 0) continue;
      try {
        if (this.options.failureAt === index + 1) {
          throw new Error(`injected lifecycle failure at ${index + 1}`);
        }
        const value = await spec.create();
        if (!this.scope.isAlive()) {
          await this.cleanupOne(value, created, idempotentCleanup(spec.cleanup));
          return this.failure("dispose");
        }
        created.push({ spec, value, cleanup: idempotentCleanup(spec.cleanup) });
      } catch (cause) {
        const cleanupFailures = await this.cleanupCreated(created);
        return this.failure("create", spec.kind, cleanupFailures, cause);
      }
    }
    if (!this.scope.isAlive()) {
      const cleanupFailures = await this.cleanupCreated(created);
      return this.failure("dispose", this.resources.at(-1)?.kind ?? "listener", cleanupFailures);
    }
    for (const item of created) this.scope._adopt(item.spec.kind, item.value, item.spec.cleanup);
    return ok(this.scope);
  }
  failure(operation, resourceKind = this.resources.at(-1)?.kind ?? "listener", cleanupFailures = [], cause = void 0) {
    return err({
      primary: new LifecycleConstructionError({
        owner: this.scope.owner,
        generation: this.scope.generation,
        operation,
        resourceKind,
        cause,
        cleanupFailures,
        receipt: this.scope._receipt()
      }),
      cleanupFailures,
      receipt: this.scope._receipt()
    });
  }
  async cleanupCreated(created) {
    const failures = [];
    for (let index = created.length - 1; index >= 0; index -= 1) {
      const item = created[index];
      if (item === void 0) continue;
      try {
        await item.cleanup(item.value);
      } catch (cause) {
        failures.push({ resourceKind: item.spec.kind, cause });
      }
    }
    return failures;
  }
  async cleanupOne(value, created, cleanup) {
    await this.cleanupCreated(created);
    try {
      await cleanup(value);
    } catch {
    }
  }
};

// src/gpu-texture-usage.ts
var GPU_TEXTURE_USAGE_COPY_SRC = 1;
var GPU_TEXTURE_USAGE_COPY_DST = 2;
var GPU_TEXTURE_USAGE_TEXTURE_BINDING = 4;
var GPU_TEXTURE_USAGE_STORAGE_BINDING = 8;
var GPU_TEXTURE_USAGE_RENDER_ATTACHMENT = 16;
var GPU_TEXTURE_USAGE_RENDER_ATTACHMENT_AND_TEXTURE_BINDING = GPU_TEXTURE_USAGE_RENDER_ATTACHMENT | GPU_TEXTURE_USAGE_TEXTURE_BINDING;

// src/gpu-usage.ts
var GPU_BUFFER_USAGE_VERTEX = 32;
var GPU_BUFFER_USAGE_INDEX = 16;
var GPU_BUFFER_USAGE_COPY_DST = 8;
var GPU_BUFFER_USAGE_COPY_SRC = 4;
var GPU_BUFFER_USAGE_UNIFORM = 64;
var GPU_BUFFER_USAGE_STORAGE = 128;
var GPU_BUFFER_USAGE_INDIRECT = 256;
var GPU_BUFFER_USAGE_MAP_READ = 1;
var GPU_BUFFER_USAGE_QUERY_RESOLVE = 512;

// src/prepare/extended-lighting/resources.ts
var EXTENDED_LIGHTING_TOPOLOGY = "extendedLighting";
var IES_SLICE_CAPACITY = 32;
var COOKIE_SLICE_CAPACITY = 32;
var IES_SLICE_WIDTH = 256;
var IES_SLICE_HEIGHT = 128;
var COOKIE_SLICE_SIZE = 256;
var COOKIE_MATRIX_BYTES = 32 * 16 * Float32Array.BYTES_PER_ELEMENT;
var EXTENDED_LIGHTING_REQUIRED_SAMPLED_TEXTURES = 21;
function extendedLightingSampledTextureCapacityAvailable(maxSampledTexturesPerShaderStage) {
  return maxSampledTexturesPerShaderStage !== void 0 && maxSampledTexturesPerShaderStage >= EXTENDED_LIGHTING_REQUIRED_SAMPLED_TEXTURES;
}
function deriveExtendedLightingCapability(device) {
  const maxSampledTextures = device.limits.maxSampledTexturesPerShaderStage;
  if (!extendedLightingSampledTextureCapacityAvailable(maxSampledTextures)) {
    return {
      admitted: false,
      topology: EXTENDED_LIGHTING_TOPOLOGY,
      reason: `maxSampledTexturesPerShaderStage ${maxSampledTextures ?? 0} < ${EXTENDED_LIGHTING_REQUIRED_SAMPLED_TEXTURES}`
    };
  }
  const maxLayers = device.limits.maxTextureArrayLayers ?? 0;
  const maxUniformBuffers = device.limits.maxUniformBuffersPerShaderStage ?? 0;
  if (maxLayers < IES_SLICE_CAPACITY) {
    return {
      admitted: false,
      topology: EXTENDED_LIGHTING_TOPOLOGY,
      reason: `maxTextureArrayLayers ${maxLayers} < ${IES_SLICE_CAPACITY}`
    };
  }
  if (maxUniformBuffers < 1) {
    return {
      admitted: false,
      topology: EXTENDED_LIGHTING_TOPOLOGY,
      reason: `maxUniformBuffersPerShaderStage ${maxUniformBuffers} < 1`
    };
  }
  if (!device.caps.storageBuffer || !device.caps.rgba16floatRenderable || !device.caps.samplerAliasing) {
    return {
      admitted: false,
      topology: EXTENDED_LIGHTING_TOPOLOGY,
      reason: "required storage-buffer, rgba16float, or sampler capability is unavailable"
    };
  }
  return { admitted: true, topology: EXTENDED_LIGHTING_TOPOLOGY, reason: void 0 };
}
var SHADOW_ATLAS_DEFAULT_FACE_SIZE = 512;
var SHADOW_ATLAS_DEFAULT_LAYERS = 4;
var ShadowAtlas = class {
  /** Backing cube_array depth texture. `null` until `ensure()` has run. */
  texture = null;
  /**
   * Whole-atlas cube_array sampling view used by URP shaders that bind the
   * atlas at `@group(0) @binding(5)`. `null` until `ensure()` has run.
   */
  cubeArrayView = null;
  /** Comparison sampler for `texture_depth_cube_array`. */
  compareSampler = null;
  /** Per-face 2D depth view cache, keyed by `layer * 6 + face`. */
  faceViews = /* @__PURE__ */ new Map();
  /** Per-face label cache (debug aid). Reused on re-creation. */
  device;
  /** Per-face square size in pixels. */
  faceSize;
  /** Cube layer count. */
  layers;
  constructor(device, options = {}) {
    this.device = device;
    this.faceSize = options.faceSize ?? SHADOW_ATLAS_DEFAULT_FACE_SIZE;
    this.layers = options.layers ?? SHADOW_ATLAS_DEFAULT_LAYERS;
  }
  /**
   * Returns `true` once the atlas texture is allocated. Used by the extract /
   * record path to gate "no PointLightShadow → no allocation" (AC-09) — the
   * caller calls {@link ensure} on a frame that has at least one snapshot;
   * before that, `isAllocated()` stays `false` and tests can assert no GPU
   * resources were created.
   */
  isAllocated() {
    return this.texture !== null;
  }
  /**
   * Lazy-allocate the atlas texture + cube_array sampling view + comparison
   * sampler. Idempotent: subsequent calls are zero-cost no-ops once the
   * resources exist.
   *
   * Throws (via the RHI error registry) on allocation failure. This is the
   * only path that touches the GPU — keeping it inside one method makes the
   * "zero-shadow scene = zero allocation" gate easy to enforce: the renderer
   * never calls this method on a frame with no PointLightShadow entities.
   */
  ensure() {
    if (this.texture !== null) return;
    const usage = GPU_TEXTURE_USAGE_RENDER_ATTACHMENT_AND_TEXTURE_BINDING;
    const texDesc = cubeArrayDepthDescriptor(this.faceSize, this.layers, usage);
    const texRes = this.device.createTexture(texDesc);
    if (!texRes.ok) throw texRes.error;
    this.texture = texRes.value;
    const viewRes = this.device.createTextureView(this.texture, {
      label: "shadow-atlas-cube-array-view",
      dimension: "cube-array",
      aspect: "depth-only",
      baseArrayLayer: 0,
      arrayLayerCount: 6 * this.layers,
      baseMipLevel: 0,
      mipLevelCount: 1
    });
    if (!viewRes.ok) {
      this.device.destroyTexture(this.texture);
      this.texture = null;
      throw viewRes.error;
    }
    this.cubeArrayView = viewRes.value;
    const sampRes = this.device.createSampler(comparisonSamplerDescriptor());
    if (!sampRes.ok) {
      this.device.destroyTexture(this.texture);
      this.texture = null;
      this.cubeArrayView = null;
      throw sampRes.error;
    }
    this.compareSampler = sampRes.value;
  }
  /**
   * Whole-atlas cube_array sampling view (`texture_depth_cube_array`). Returns
   * `null` if the atlas is not yet allocated; the caller should gate on a
   * non-null pointShadow array before calling {@link ensure} + this getter.
   */
  getAtlasView() {
    return this.cubeArrayView;
  }
  /**
   * Comparison sampler (`compare: 'less'`) for cube_array depth sampling.
   * Returns `null` if the atlas is not yet allocated.
   */
  getComparisonSampler() {
    return this.compareSampler;
  }
  /**
   * Backing texture handle. Returns `null` if the atlas is not yet allocated.
   */
  getTexture() {
    return this.texture;
  }
  /**
   * Lazy 2D depth view selecting `(layer, face)` (the caller passes
   * `shadowAtlasLayer` from the snapshot and a face index 0..5). Used as the
   * depth attachment of the shadow-caster render pass for one cube face.
   *
   * Caches per `(layer, face)` so the per-frame shadow loop pays zero
   * `createTextureView` cost after the first allocation. Cache is cleared on
   * {@link dispose}.
   *
   * @throws PointShadowAtlasUninitializedError if the atlas is not yet
   *   allocated (caller must call {@link ensure} first).
   * @throws PointShadowAtlasBoundsViolationError if `layer` or `face` is out
   *   of range.
   * @throws RhiError if the underlying `createTextureView` fails.
   */
  faceView(layer, face) {
    if (this.texture === null) {
      throw new PointShadowAtlasUninitializedError();
    }
    if (layer < 0 || layer >= this.layers) {
      throw new PointShadowAtlasBoundsViolationError("layer", layer, this.layers);
    }
    if (face < 0 || face >= 6) {
      throw new PointShadowAtlasBoundsViolationError("face", face, 6);
    }
    const key = layer * 6 + face;
    const cached = this.faceViews.get(key);
    if (cached !== void 0) return cached;
    const desc = cubeArrayDepthFaceView(layer, face);
    const r = this.device.createTextureView(this.texture, desc);
    if (!r.ok) throw r.error;
    this.faceViews.set(key, r.value);
    return r.value;
  }
  /**
   * Release the GPU resources and clear the per-face view cache. Idempotent;
   * subsequent calls are zero-cost. After dispose, `isAllocated()` returns
   * `false` and the next `ensure()` re-allocates from scratch.
   */
  dispose() {
    this.faceViews.clear();
    if (this.texture !== null) {
      this.device.destroyTexture(this.texture);
      this.texture = null;
    }
    this.cubeArrayView = null;
    this.compareSampler = null;
  }
};
function worldEntityKey(worldId, entityKey) {
  return worldId * 4294967296 + entityKey;
}
function instanceCollectionCacheKey(worldId, instance) {
  return -(4294967296 + worldEntityKey(worldId, instance.collectionId ?? instance.cacheKey));
}
var ZERO_CAMERA_CLEAR_FALLBACK = [0, 0, 0, 1];
var textureIdentities = /* @__PURE__ */ new WeakMap();
var nextTextureIdentity = 1;
var opaqueResourceIdentities = /* @__PURE__ */ new WeakMap();
var nextOpaqueResourceIdentity = 1;
function getOpaqueResourceIdentity(resource) {
  const existing = opaqueResourceIdentities.get(resource);
  if (existing !== void 0) return existing;
  const identity = nextOpaqueResourceIdentity++;
  opaqueResourceIdentities.set(resource, identity);
  return identity;
}
function getTextureIdentity(texture) {
  const object = texture;
  const existing = textureIdentities.get(object);
  if (existing !== void 0) return existing;
  const identity = nextTextureIdentity++;
  textureIdentities.set(object, identity);
  return identity;
}
function validateGraphTargetCaptureReadback(input) {
  const { bytes, expectedByteLength, sentinel, allowZero = false } = input;
  if (bytes.byteLength !== expectedByteLength)
    return { ok: false, code: "capture-readback-length" };
  if (sentinel?.every((value, index2) => bytes[index2] === value)) {
    return { ok: false, code: "capture-readback-untouched-sentinel" };
  }
  if (!allowZero && bytes.every((value) => value === 0)) {
    return { ok: false, code: "capture-readback-empty" };
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let index = 0;
  for (; index + 3 < bytes.byteLength; index += 4) {
    const word = view.getUint32(index, true);
    if ((word & 31744) === 31744 || (word & 2080374784) === 2080374784)
      return { ok: false, code: "capture-readback-non-finite" };
  }
  if (index + 1 < bytes.byteLength && (view.getUint16(index, true) & 31744) === 31744)
    return { ok: false, code: "capture-readback-non-finite" };
  return { ok: true };
}
function makeZeroCameraFallbackSnapshot() {
  const identityWorld = new Float32Array(16);
  identityWorld[0] = 1;
  identityWorld[5] = 1;
  identityWorld[10] = 1;
  identityWorld[15] = 1;
  return {
    position: vec3.create(0, 0, 0),
    world: identityWorld,
    fov: Math.PI / 4,
    aspect: 1,
    near: 0.1,
    far: 100,
    // feat-20260613 M6 / w20: synthetic camera defaults to perspective so
    // the CSM extract path stays consistent with the previously-implicit
    // perspective shape (unchanged behavior; explicit field).
    projection: "perspective",
    orthoLeft: -1,
    orthoRight: 1,
    orthoBottom: -1,
    orthoTop: 1,
    tonemap: "none",
    exposure: 1,
    whitePoint: 4,
    antialias: "none",
    bloom: "off",
    bloomThreshold: 1,
    bloomIntensity: 1,
    bloomSoftKnee: 0.5,
    bloomScatter: 0.7,
    clearColor: ZERO_CAMERA_CLEAR_FALLBACK
  };
}

// src/errors/gpu-driven.ts
var ERROR_POLICY2 = {
  "missing-material-receipt": {
    expected: "a producer-owned material program receipt is present",
    hint: "cook and load the selected material program artifact, then retry preparation",
    recovery: "rebuild-producer"
  },
  "material-abi-not-executable": {
    expected: "the published material ABI fits the GPU Scene submission layout",
    hint: "recook the material with a scene-index ABI supported by the GPU-driven owner or keep it on its authored lane",
    recovery: "route-cpu-lane"
  },
  "missing-uv": {
    expected: "the geometry exposes every UV set named by the material receipt",
    hint: "repair the geometry UV semantic or route the draw to the CPU semantic lane",
    recovery: "route-cpu-lane"
  },
  "reflection-mismatch": {
    expected: "the loaded reflection receipt matches the artifact layout identity",
    hint: "rebuild the material artifact and reflection from one source, then retry",
    recovery: "rebuild-producer"
  },
  "vertex-input-mismatch": {
    expected: "geometry vertex semantics match the material reflection receipt",
    hint: "repair the geometry vertex semantic layout or route the draw to the CPU lane",
    recovery: "route-cpu-lane"
  },
  "alpha-mask-mismatch": {
    expected: "the Alpha Mask cutoff is present in the material receipt",
    hint: "declare the pass coverage cutoff in the material schema and recook it",
    recovery: "rebuild-producer"
  },
  "resource-not-ready": {
    expected: "all material resource slots have resolved handles",
    hint: "resolve the declared texture and sampler resources before recording",
    recovery: "retry-same-draw"
  },
  "stale-generation": {
    expected: "receipt and prepared inputs belong to the requested generation",
    hint: "discard stale GPU facts, rebuild the producer receipt, and retry the same draw",
    recovery: "rebuild-generation"
  },
  "skin-receipt-mismatch": {
    expected: "skinned geometry has a current palette address receipt",
    hint: "rebuild the Skin palette receipt for this generation before recording",
    recovery: "rebuild-producer"
  },
  "shadow-ownership": {
    expected: "every declared ShadowCaster pass has one GPU-compatible draw-item owner",
    hint: "repair the ShadowCaster producer membership or keep the residual on its explicit CPU lane",
    recovery: "route-cpu-lane"
  }
};
var GpuDrivenPreparationError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(code, detail) {
    const policy = ERROR_POLICY2[code];
    super(`[GpuDrivenPreparationError ${code}] ${policy.expected}`);
    this.name = "GpuDrivenPreparationError";
    this.code = code;
    this.expected = policy.expected;
    this.hint = policy.hint;
    this.detail = Object.freeze({
      ...detail,
      recovery: detail.recovery ?? policy.recovery
    });
  }
};
var MATRIX_STRIDE = 16;
var InstanceTransformsError = class extends Error {
  constructor(detail) {
    super("Instances.transforms must contain complete finite matrices");
    this.detail = detail;
    this.name = "InstanceTransformsError";
  }
  detail;
  code = "instance-transforms-invalid";
  expected = "finite column-major mat4 values, with transforms.length a multiple of 16";
  hint = "repair Instances.transforms in the World or source SceneAsset and retry";
};
function validateInstanceTransforms(transforms) {
  if (transforms.length % MATRIX_STRIDE !== 0)
    return new InstanceTransformsStrideMismatchError(transforms.length);
  for (let index = 0; index < transforms.length; index++) {
    if (!Number.isFinite(transforms[index]))
      return new InstanceTransformsError({
        actualLength: transforms.length,
        nonFiniteIndex: index
      });
  }
  return void 0;
}
function instanceUploadRangesForResident(activeIsNew, dirtyRanges, fullRange) {
  return activeIsNew ? [fullRange] : dirtyRanges;
}
var InstanceProjectionStore = class {
  nextId = 1;
  nextGeneration = 1;
  identities = /* @__PURE__ */ new WeakMap();
  records = /* @__PURE__ */ new Map();
  residency = /* @__PURE__ */ new Map();
  project(world, entity, transforms) {
    const collectionId = this.identities.get(world)?.get(entity) ?? this.nextId++;
    const previous = this.records.get(collectionId);
    if (previous !== void 0 && previous.transforms.length === transforms.length && previous.transforms.every((value, index) => Object.is(value, transforms[index])))
      return previous;
    const count = transforms.length / MATRIX_STRIDE;
    const generations = previous?.count === count ? previous.generations : Uint32Array.from({ length: count }, () => this.nextGeneration++);
    const record = {
      collectionId,
      world,
      entity,
      transforms: new Float32Array(transforms),
      generations,
      count,
      revision: (previous?.revision ?? 0) + 1
    };
    return record;
  }
  /** Called only after the owning RenderScene accepts its prepared changes. */
  accept(world, entity, snapshot) {
    const { collectionId, revision, transforms, generations } = snapshot;
    if (collectionId === void 0 || revision === void 0 || generations === void 0) return;
    let entities = this.identities.get(world);
    if (entities === void 0) {
      entities = /* @__PURE__ */ new Map();
      this.identities.set(world, entities);
    }
    entities.set(entity, collectionId);
    this.records.set(collectionId, {
      collectionId,
      revision,
      transforms,
      generations,
      count: transforms.length / MATRIX_STRIDE,
      world,
      entity
    });
  }
  release(world, entity) {
    const entities = this.identities.get(world);
    const id = entities?.get(entity);
    if (id === void 0) return;
    entities?.delete(entity);
    this.records.delete(id);
    this.residency.delete(id);
  }
  retain(ids) {
    for (const record of this.records.values()) {
      if (!ids.has(record.collectionId)) this.release(record.world, record.entity);
    }
  }
  dispose() {
    this.records.clear();
    this.residency.clear();
    this.identities = /* @__PURE__ */ new WeakMap();
  }
  _resetResidency() {
    this.residency.clear();
  }
  _reportResidency(input) {
    if (!this.records.has(input.collectionId)) return;
    const previous = this.residency.get(input.collectionId);
    const sameFrame = previous?.frameNumber === input.frameNumber && previous.error === void 0;
    const ranges = [...sameFrame ? previous.uploadRanges : [], ...input.uploadRanges].map((range) => ({ ...range })).sort((a, b) => a.start - b.start);
    const uploadRanges = [];
    for (const range of ranges) {
      const last = uploadRanges.at(-1);
      if (last !== void 0 && range.start <= last.end) last.end = Math.max(last.end, range.end);
      else uploadRanges.push(range);
    }
    this.residency.set(input.collectionId, {
      ...input,
      uploadRanges,
      uploadedBytes: input.uploadedBytes + (sameFrame ? previous.uploadedBytes : 0),
      error: void 0
    });
  }
  _reportFailure(input) {
    if (!this.records.has(input.collectionId)) return;
    this.residency.set(input.collectionId, {
      frameNumber: -1,
      residentGeneration: void 0,
      lane: "unavailable",
      uploadRanges: [],
      uploadedBytes: 0,
      requestedBytes: input.facts.requestedBytes,
      supportedBytes: input.facts.supportedBytes,
      backend: input.facts.backend,
      error: {
        code: input.code,
        expected: input.expected,
        hint: input.hint,
        detail: { ...input.facts }
      }
    });
  }
  _inspections(frameNumber) {
    return [...this.records.values()].map((record) => {
      const resident = this.residency.get(record.collectionId);
      const current = resident?.frameNumber === frameNumber;
      return {
        collectionId: record.collectionId,
        count: record.count,
        revision: record.revision,
        residentGeneration: resident?.residentGeneration,
        lane: resident?.lane ?? "unresident",
        uploadRanges: current ? resident.uploadRanges.map((range) => ({ ...range })) : [],
        uploadedBytes: current ? resident.uploadedBytes : 0,
        requestedBytes: resident?.requestedBytes ?? record.transforms.byteLength,
        supportedBytes: resident?.supportedBytes,
        backend: resident?.backend ?? "unknown",
        owner: "renderer.instances",
        error: resident?.error
      };
    });
  }
};

// src/scene/visibility/budget.ts
var DEFAULT_CONFIGURED_QUERY_BUDGET = 2048;
var MAX_QUERY_BUDGET = 4096;
var VISIBILITY_CANDIDATE_COUNT = 1e5;
var VISIBILITY_OCCLUDED_COUNT = 9e4;
function createVisibilityBudget(configuredQueryBudget = DEFAULT_CONFIGURED_QUERY_BUDGET) {
  if (!Number.isSafeInteger(configuredQueryBudget) || configuredQueryBudget <= 0) {
    throw new RangeError("configuredQueryBudget must be a positive safe integer");
  }
  const effectiveQueryBudget = Math.min(configuredQueryBudget, MAX_QUERY_BUDGET);
  const oneSweepCandidates = oneSweep(VISIBILITY_CANDIDATE_COUNT, effectiveQueryBudget);
  const oneSweepOccluded = oneSweep(VISIBILITY_OCCLUDED_COUNT, effectiveQueryBudget);
  const retestSubmits = Math.max(6, oneSweepOccluded);
  return Object.freeze({
    configuredQueryBudget,
    effectiveQueryBudget,
    oneSweepCandidates,
    oneSweepOccluded,
    settleSubmits: 2 * oneSweepCandidates,
    retestSubmits,
    expirySubmits: Math.max(8, retestSubmits + oneSweepOccluded)
  });
}
function oneSweep(candidateCount, effectiveQueryBudget) {
  return Math.ceil(candidateCount / effectiveQueryBudget);
}

// src/render-contract.ts
var STANDARD_OUTPUT_TRANSFORM_FEATURE_ID = "forgeax::standard::output-transform";
var FXAA_POST_PROCESS_ID = "forgeax::post::fxaa";
var RENDER_GRAPH_EXECUTION_PHASE_CATALOG = [
  "record/graph-execute/point-shadow",
  "record/graph-execute/cluster-binner-upload",
  "record/graph-execute/g-buffer",
  "record/graph-execute/g-buffer/geometry-loop",
  "record/graph-execute/g-buffer/material-bind-groups",
  "record/graph-execute/g-buffer/pipeline-selection",
  "record/graph-execute/g-buffer/draw-submit",
  "record/graph-execute/ssao-calc",
  "record/graph-execute/ssao-blur",
  "record/graph-execute/lighting",
  "record/graph-execute/forward",
  "record/graph-execute/forward/geometry-loop",
  "record/graph-execute/forward/material-bind-groups",
  "record/graph-execute/forward/pipeline-selection",
  "record/graph-execute/forward/draw-submit",
  "record/graph-execute/output-transform",
  "record/graph-execute/present",
  "record/graph-execute/debug-overlay",
  "record/graph-execute/shadow",
  "record/graph-execute/spot-shadow",
  "record/graph-execute/skybox",
  "record/graph-execute/main",
  "record/graph-execute/fxaa",
  "record/graph-execute/bloom-downsample",
  "record/graph-execute/bloom-upsample",
  "record/graph-execute/bloom-composite",
  "record/graph-execute/ssr-hiz",
  "record/graph-execute/ssr-trace",
  "record/graph-execute/ssr-temporal",
  "record/graph-execute/ssr-reflection-mip",
  "record/graph-execute/ssr-compose",
  "record/graph-execute/other"
];
var RENDER_HDRP_BINNER_PHASE_CATALOG = [
  "record/scene-state/hdrp-cluster/binner/light-bounds-and-occupancy",
  "record/scene-state/hdrp-cluster/binner/light-bounds-and-occupancy/light-aabb",
  "record/scene-state/hdrp-cluster/binner/light-bounds-and-occupancy/cluster-occupancy",
  "record/scene-state/hdrp-cluster/binner/cluster-reserve",
  "record/scene-state/hdrp-cluster/binner/input-preparation",
  "record/scene-state/hdrp-cluster/binner/bin-core",
  "record/scene-state/hdrp-cluster/binner/light-index-write",
  "record/scene-state/hdrp-cluster/binner/light-index-write/bounds-read",
  "record/scene-state/hdrp-cluster/binner/light-index-write/cluster-write"
];
var RENDER_HDRP_CLUSTER_PHASE_CATALOG = [
  "record/scene-state/hdrp-cluster/binner",
  ...RENDER_HDRP_BINNER_PHASE_CATALOG,
  "record/scene-state/hdrp-cluster/payload-packing",
  "record/scene-state/hdrp-cluster/buffer-upload"
];
var RENDER_SCENE_STATE_PHASE_CATALOG = [
  "record/scene-state/fold-buckets",
  "record/scene-state/lighting-prep",
  "record/scene-state/ambient-resolution",
  "record/scene-state/directional-shadow-cache",
  "record/scene-state/hdrp-cluster",
  ...RENDER_HDRP_CLUSTER_PHASE_CATALOG
];
var RENDER_RECORD_PHASE_CATALOG = [
  "record/occlusion-query-submit",
  "record/occlusion-global-advance",
  "record/scene-state",
  ...RENDER_SCENE_STATE_PHASE_CATALOG,
  "record/swapchain",
  "record/render-graph",
  "record/target-views",
  "record/validation",
  "record/dispatch-plan",
  "record/uploads",
  "record/bind-groups",
  "record/graph-execute",
  ...RENDER_GRAPH_EXECUTION_PHASE_CATALOG
];
var RENDER_PHASE_CATALOG = [
  "extract",
  "occlusion-prepare",
  "bind-groups",
  "features",
  "sort",
  "record",
  ...RENDER_RECORD_PHASE_CATALOG
];

// src/targets/material-source.ts
var sourceBindings = /* @__PURE__ */ new WeakMap();
var targetIdentities = /* @__PURE__ */ new WeakMap();
var nextTargetIdentity = 1;
function targetIdentity(target) {
  const object = target;
  const existing = targetIdentities.get(object);
  if (existing !== void 0) return existing;
  const identity = nextTargetIdentity;
  nextTargetIdentity += 1;
  targetIdentities.set(object, identity);
  return identity;
}
function sourceToken() {
  return Object.freeze({});
}
function resolveRenderTargetMaterialSource(source) {
  return sourceBindings.get(source);
}
function renderTargetMaterialSourceIdentity(source) {
  const binding = resolveRenderTargetMaterialSource(source);
  if (binding === void 0) return void 0;
  return [
    targetIdentity(binding.target),
    binding.generation,
    binding.shape,
    binding.format,
    binding.view.dimension,
    binding.view.mipLevel,
    binding.view.resolveRequired ? 1 : 0
  ].join(":");
}
function invalid(field, value, expected) {
  return {
    ok: false,
    error: new RenderTargetDescriptorInvalidError({ field, value, expected })
  };
}
function createRenderTargetMaterialSource(target, descriptor, options) {
  if (options.aspect !== "color") return invalid("aspect", options.aspect, "color");
  if (options.dimension !== descriptor.shape) {
    return invalid("dimension", options.dimension, `dimension matches ${descriptor.shape}`);
  }
  const mipCount = descriptor.mipLevels === 1 ? 1 : Math.floor(Math.log2(Math.max(descriptor.width, descriptor.height))) + 1;
  if (!Number.isInteger(options.mipLevel) || options.mipLevel < 0 || options.mipLevel >= mipCount) {
    return invalid("mipLevel", options.mipLevel, `an admitted mip level below ${mipCount}`);
  }
  if (!Number.isInteger(options.generation) || options.generation < 0) {
    return invalid("generation", options.generation, "a non-negative device generation");
  }
  const result = {
    ok: true,
    value: Object.freeze({
      source: sourceToken(),
      target,
      generation: options.generation,
      shape: descriptor.shape,
      format: descriptor.format,
      view: Object.freeze({
        dimension: options.dimension,
        mipLevel: options.mipLevel,
        resolveRequired: descriptor.sampleCount === 4
      })
    })
  };
  sourceBindings.set(result.value.source, result.value);
  return result;
}

// src/gpu-stage.ts
var GPU_SHADER_STAGE_VERTEX = 1;
var GPU_SHADER_STAGE_FRAGMENT = 2;
var GPU_SHADER_STAGE_COMPUTE = 4;
var BGL_ONLY_SPEC_STUB = Object.freeze({
  shader: { id: "", passKind: "forward", variantSet: void 0 },
  attachments: { colorFormats: [], depthFormat: void 0, sampleCount: 1 },
  geometry: { topology: "triangle-list", vertexLayout: {} },
  renderState: void 0
});
function buildPbrMaterialUserRegionEntries(paramSchema = STANDARD_PIPELINE_PARAM_SCHEMA, excludedTextureFields = []) {
  const excluded = new Set(excludedTextureFields);
  for (const field of standardPhysicalTextureFields(paramSchema)) excluded.add(field);
  const derived = derive(
    excluded.size === 0 ? paramSchema : paramSchema.filter(
      (entry) => !excluded.has(entry.name) || !entry.type.startsWith("texture")
    )
  );
  let entries = derived.bglEntries.map(
    (entry) => ({
      binding: entry.binding,
      visibility: entry.texture !== void 0 || entry.sampler !== void 0 ? GPU_SHADER_STAGE_VERTEX | GPU_SHADER_STAGE_FRAGMENT : entry.visibility,
      ...entry.buffer === void 0 ? {} : { buffer: entry.buffer },
      ...entry.sampler === void 0 ? {} : { sampler: entry.sampler },
      ...entry.texture === void 0 ? {} : { texture: entry.texture },
      ...entry.storageTexture === void 0 ? {} : { storageTexture: entry.storageTexture }
    })
  );
  const ubo = entries[0];
  if (ubo !== void 0 && ubo.binding === 0 && ubo.buffer?.type === "uniform") {
    entries[0] = {
      binding: 0,
      visibility: GPU_SHADER_STAGE_VERTEX | GPU_SHADER_STAGE_FRAGMENT,
      buffer: { type: "uniform", hasDynamicOffset: true }
    };
  } else {
    entries = [
      {
        binding: 0,
        visibility: GPU_SHADER_STAGE_VERTEX | GPU_SHADER_STAGE_FRAGMENT,
        buffer: { type: "uniform", hasDynamicOffset: true }
      },
      ...entries.map((entry) => ({ ...entry, binding: entry.binding + 1 }))
    ];
  }
  return entries;
}
function appendInjection(bgl, kind) {
  const start = bgl.length;
  switch (kind) {
    case "ibl":
      return [
        // binding start+0: irradianceMap (texture_cube)
        {
          binding: start,
          visibility: GPU_SHADER_STAGE_FRAGMENT,
          texture: { sampleType: "float", viewDimension: "cube" }
        },
        // binding start+1: irradianceSampler
        {
          binding: start + 1,
          visibility: GPU_SHADER_STAGE_FRAGMENT,
          sampler: { type: "filtering" }
        },
        // binding start+2: prefilterMap (texture_cube)
        {
          binding: start + 2,
          visibility: GPU_SHADER_STAGE_FRAGMENT,
          texture: { sampleType: "float", viewDimension: "cube" }
        },
        // binding start+3: prefilterSampler
        {
          binding: start + 3,
          visibility: GPU_SHADER_STAGE_FRAGMENT,
          sampler: { type: "filtering" }
        },
        // binding start+4: brdfLut (texture_2d)
        {
          binding: start + 4,
          visibility: GPU_SHADER_STAGE_FRAGMENT,
          texture: { sampleType: "float", viewDimension: "2d" }
        },
        // binding start+5: uniform { intensity: f32 }
        {
          binding: start + 5,
          visibility: GPU_SHADER_STAGE_FRAGMENT,
          buffer: { type: "uniform" }
        }
      ];
    case "lightmap":
      return [
        // emissive sampler + texture pair
        {
          binding: start,
          visibility: GPU_SHADER_STAGE_FRAGMENT,
          sampler: { type: "filtering" }
        },
        {
          binding: start + 1,
          visibility: GPU_SHADER_STAGE_FRAGMENT,
          texture: { sampleType: "float", viewDimension: "2d" }
        },
        // occlusion sampler + texture pair
        {
          binding: start + 2,
          visibility: GPU_SHADER_STAGE_FRAGMENT,
          sampler: { type: "filtering" }
        },
        {
          binding: start + 3,
          visibility: GPU_SHADER_STAGE_FRAGMENT,
          texture: { sampleType: "float", viewDimension: "2d" }
        }
      ];
    case "shadow":
      return [
        {
          binding: start,
          visibility: GPU_SHADER_STAGE_FRAGMENT,
          sampler: { type: "comparison" }
        },
        {
          binding: start + 1,
          visibility: GPU_SHADER_STAGE_FRAGMENT,
          texture: { sampleType: "depth", viewDimension: "2d" }
        }
      ];
    case "transmission":
      return [
        {
          binding: start,
          visibility: GPU_SHADER_STAGE_FRAGMENT,
          sampler: { type: "filtering" }
        },
        {
          binding: start + 1,
          visibility: GPU_SHADER_STAGE_FRAGMENT,
          texture: { sampleType: "float", viewDimension: "2d" }
        }
      ];
  }
}
function appendSingleLayerMediumInjection(bgl) {
  const start = bgl.length;
  return [
    {
      binding: start,
      visibility: GPU_SHADER_STAGE_FRAGMENT,
      sampler: { type: "non-filtering" }
    },
    {
      binding: start + 1,
      visibility: GPU_SHADER_STAGE_FRAGMENT,
      texture: { sampleType: "unfilterable-float", viewDimension: "2d" }
    },
    {
      binding: start + 2,
      visibility: GPU_SHADER_STAGE_FRAGMENT,
      sampler: { type: "filtering" }
    },
    {
      binding: start + 3,
      visibility: GPU_SHADER_STAGE_FRAGMENT,
      texture: { sampleType: "float", viewDimension: "2d" }
    },
    {
      binding: start + 4,
      visibility: GPU_SHADER_STAGE_FRAGMENT,
      sampler: { type: "non-filtering" }
    },
    {
      binding: start + 5,
      visibility: GPU_SHADER_STAGE_FRAGMENT,
      texture: { sampleType: "unfilterable-float", viewDimension: "2d" }
    }
  ];
}
function physicalTextureFields(paramSchema) {
  return standardPhysicalTextureFields(paramSchema);
}
function appendTextureInjection(_bgl, fields) {
  const fieldSet = new Set(fields);
  return standardPhysicalTextureFields(
    STANDARD_PIPELINE_PARAM_SCHEMA.concat(
      fields.map((name) => ({ name, type: "texture2d" }))
    )
  ).flatMap((field) => {
    if (!fieldSet.has(field)) return [];
    const canonicalIndex = STANDARD_PHYSICAL_TEXTURE_FIELDS.indexOf(field);
    const binding = 26 + canonicalIndex * 2;
    return [
      {
        binding,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        sampler: { type: "filtering" }
      },
      {
        binding: binding + 1,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        texture: { sampleType: "float", viewDimension: "2d" }
      }
    ];
  });
}
function materialBindGroupLayoutIdentity(shaderId, paramSchema) {
  const descriptor = buildBindGroupLayoutDescriptor(
    {
      shader: { id: shaderId, passKind: "forward", variantSet: void 0 },
      attachments: { colorFormats: [], depthFormat: void 0, sampleCount: 1 }},
    { kind: "pbr-material-merged", materialParamSchema: paramSchema }
  );
  return JSON.stringify({
    entries: descriptor.entries,
    physicalTextureFields: physicalTextureFields(paramSchema)
  });
}
function buildPbrViewBglEntries(caps) {
  const entries = [
    {
      binding: 0,
      visibility: GPU_SHADER_STAGE_VERTEX | GPU_SHADER_STAGE_FRAGMENT,
      // View captures use the same bind group with a per-face view slot.
      // Keeping this dynamic is also valid for the display slot at offset 0.
      buffer: { type: "uniform", hasDynamicOffset: true }
    },
    {
      binding: 3,
      visibility: GPU_SHADER_STAGE_VERTEX | GPU_SHADER_STAGE_FRAGMENT,
      texture: { sampleType: "depth", viewDimension: "2d" }
    },
    {
      binding: 4,
      visibility: GPU_SHADER_STAGE_FRAGMENT,
      sampler: { type: "comparison" }
    },
    // feat-20260612-point-light-shadows-urp-hdrp Round-2 F-1: point shadow
    // cube_array depth atlas. Bound to either the real ShadowAtlas
    // cube_array view (when point shadows are active) or a 1x1x6 fallback
    // cube_array view cleared to 1.0 (fully lit). Visibility is FRAGMENT
    // only -- the directional binding 3 is VERTEX|FRAGMENT for shadow
    // probe-debug sampling, but the cube atlas has no host-side probe path.
    {
      binding: 5,
      visibility: GPU_SHADER_STAGE_FRAGMENT,
      texture: { sampleType: "depth", viewDimension: "cube-array" }
    },
    // feat-20260612-point-light-shadows-urp-hdrp Round-2 F-1: point shadow
    // params UBO. Carries `array<vec4<f32>, 4>` = 64 B with one lane per
    // shadow-casting point light slot (shadowAtlasLayer in [0, 4)). Each
    // lane stores `(near, far, depthBias, normalBias)` so the fragment-shader
    // depth-ref reconstruction (lighting-punctual.wgsl evalPointShadowed)
    // can avoid sampling DirectLightSlot for the URP path. The shared
    // DirectLightSlot metadata remains the identity owner, so binding 6 is
    // unused on HDRP shaders even though the BGL declares it (charter P4 single SSOT
    // BGL across pipelines; the HDRP variant simply doesn't reference the
    // binding in WGSL, which is allowed).
    {
      binding: 6,
      visibility: GPU_SHADER_STAGE_FRAGMENT,
      buffer: { type: "uniform" }
    },
    // feat-20260613-csm-cascaded-shadow-maps M5 / w28: shadowCasterCascade
    // UBO (16 B). Carries the 0-based cascade index of the shadow pass
    // currently being rasterized so `shadow_caster.wgsl` can index into
    // `view.lightViewProj_X` per cascade. Shifted from binding 5 to
    // binding 7 on 2026-06-13 to make room for point-shadow bindings 5/6
    // (they predate this feat in main; CSM's slot was the optimal-yield
    // give since point-shadow needs FRAGMENT-only and the cascade UBO
    // needs vertex-stage too — keeping cascade higher avoids interleaving
    // visibility flags within the contiguous shadow-binding cluster).
    {
      binding: 7,
      visibility: GPU_SHADER_STAGE_VERTEX | GPU_SHADER_STAGE_FRAGMENT,
      buffer: { type: "uniform" }
    },
    // feat-20260625-spot-light-shadow-mapping M3 / w14 (D-5): spot shadow
    // atlas. A single `texture_depth_2d` holding up to 4 spot shadows in a 2x2
    // tile grid (urp-pipeline.ts spotShadowDepth). FRAGMENT-only — the spot
    // shadow factor is reconstructed at fragment time via perspective-divide in
    // `evalSpotShadowed` (lighting-punctual.wgsl).
    //
    // ALWAYS-ON (no caps gate, unlike the point cube_array atlas at binding 5
    // which rides POINT_SHADOW_AVAILABLE): spot uses `texture_depth_2d` which is
    // compat-safe in every WebGPU profile, so the binding is unconditionally
    // declared. The matching WGSL declaration is `spotShadowMap` at @group(0)
    // binding 8 in common.wgsl (also unconditional) — the two must stay in
    // lock-step or WebGPU validation rejects the bind group at smoke time
    // (memory: BGL shape mismatch is a browser-path-only bug). No binding 9
    // sampler: spot reuses the comparison sampler at binding 4.
    // feat-20260625-spot-light-shadow-mapping M3 / w14 (D-5): spot shadow 2D
    // atlas, the LAST view-BG binding. The per-spot fragment-read perspective
    // lightViewProj matrices that w24 originally declared at a standalone
    // binding 9 uniform buffer were folded into the View UBO (binding 0,
    // `view.spotLightViewProj`) in w25 (scope-amend webkit-fallback): the
    // standalone binding pushed the WebGL2 fallback fragment uniform-buffer
    // count to 12, over GLES 3.0's `max_uniform_buffers_per_shader_stage = 11`,
    // crashing pipeline-layout creation on the compat path (this feat's target).
    {
      binding: 8,
      visibility: GPU_SHADER_STAGE_FRAGMENT,
      texture: { sampleType: "depth", viewDimension: "2d" }
    }
  ];
  const extendedLighting = caps.extendedLighting ?? true;
  const lowLimitCloudBindings = extendedLighting === false && caps.projectorAvailable === false;
  if (extendedLighting) {
    entries.push(
      {
        binding: 9,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        sampler: { type: "filtering" }
      },
      {
        binding: 11,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        texture: { sampleType: "float", viewDimension: "2d-array" }
      },
      {
        binding: 12,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        texture: { sampleType: "float", viewDimension: "2d-array" }
      },
      {
        binding: 13,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        texture: { sampleType: "float", viewDimension: "2d" }
      },
      {
        binding: 14,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        texture: { sampleType: "float", viewDimension: "2d" }
      },
      {
        binding: 15,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        buffer: { type: "uniform" }
      }
    );
  } else if (caps.projectorAvailable !== false) {
    entries.push(
      {
        binding: 11,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        texture: { sampleType: "float", viewDimension: "2d" }
      },
      {
        binding: 12,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        sampler: { type: "filtering" }
      }
    );
  }
  entries.push({
    binding: 10,
    visibility: GPU_SHADER_STAGE_VERTEX,
    buffer: { type: "uniform", hasDynamicOffset: true }
  });
  if (!lowLimitCloudBindings) {
    entries.push(
      {
        binding: 16,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        texture: { sampleType: "float", viewDimension: "2d" }
      },
      {
        binding: 17,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        sampler: { type: "filtering" }
      }
    );
  }
  return entries;
}
function buildPbrPipelineLayouts(device, caps) {
  const viewBglRes = device.createBindGroupLayout(
    buildBindGroupLayoutDescriptor(BGL_ONLY_SPEC_STUB, { kind: "pbr-view", caps })
  );
  if (!viewBglRes.ok) throw viewBglRes.error;
  const materialBglRes = device.createBindGroupLayout(
    buildBindGroupLayoutDescriptor(BGL_ONLY_SPEC_STUB, {
      kind: "pbr-material-merged",
      caps
    })
  );
  if (!materialBglRes.ok) throw materialBglRes.error;
  const meshArrayBglRes = device.createBindGroupLayout(
    buildBindGroupLayoutDescriptor(BGL_ONLY_SPEC_STUB, { kind: "pbr-mesh-array", caps })
  );
  if (!meshArrayBglRes.ok) throw meshArrayBglRes.error;
  const instancesBglRes = device.createBindGroupLayout(
    buildBindGroupLayoutDescriptor(BGL_ONLY_SPEC_STUB, {
      kind: "pbr-instances",
      caps: { ...caps, probeBlend: false }
    })
  );
  if (!instancesBglRes.ok) throw instancesBglRes.error;
  const probeInstancesBglRes = caps.storageBuffer ? device.createBindGroupLayout(
    buildBindGroupLayoutDescriptor(BGL_ONLY_SPEC_STUB, {
      kind: "pbr-instances",
      caps: { ...caps, probeBlend: true }
    })
  ) : { ok: true, value: instancesBglRes.value };
  if (!probeInstancesBglRes.ok) throw probeInstancesBglRes.error;
  const layouts = [
    viewBglRes.value,
    materialBglRes.value,
    meshArrayBglRes.value,
    instancesBglRes.value
  ];
  const pipelineLayoutRes = device.createPipelineLayout({
    label: "pbr-pl",
    bindGroupLayouts: layouts
  });
  if (!pipelineLayoutRes.ok) throw pipelineLayoutRes.error;
  const probeLayouts = [viewBglRes.value, materialBglRes.value, meshArrayBglRes.value, probeInstancesBglRes.value];
  let probePipelineLayout = null;
  if (caps.storageBuffer) {
    const probePipelineLayoutRes = device.createPipelineLayout({
      label: "pbr-probe-pl",
      bindGroupLayouts: probeLayouts
    });
    if (!probePipelineLayoutRes.ok) throw probePipelineLayoutRes.error;
    probePipelineLayout = probePipelineLayoutRes.value;
  }
  return {
    pipelineLayout: pipelineLayoutRes.value,
    viewBgl: viewBglRes.value,
    materialBgl: materialBglRes.value,
    meshArrayBgl: meshArrayBglRes.value,
    instancesBgl: instancesBglRes.value,
    probeInstancesBgl: probeInstancesBglRes.value,
    probePipelineLayout,
    bindGroupLayouts: layouts
  };
}
var SKIN_MATERIAL_SHADER_ID = "forgeax::pbr-skin";
var SHADOW_CASTER_SHADER_ID = "forgeax::default-shadow-caster";
var AUTHORED_STANDARD_ID_RE = /::(?:standard|pbr-skin)(?:-|$)/;
function isStandardPbrSkinMaterialShader(shaderId) {
  return shaderId === SKIN_MATERIAL_SHADER_ID || shaderId === "forgeax::default-standard-pbr-skin" || shaderId !== void 0 && /::pbr-skin(?:-|$)/.test(shaderId);
}
function shadowCasterVariantSet(storageBuffer, skinned, gpuDrivenSceneIndex = false, alphaMask = false, vertexColorAvailable = false) {
  const skinningDisabled = !skinned;
  const defines = {
    ALPHA_MASK: alphaMask,
    GPU_DRIVEN_SCENE_INDEX_AVAILABLE: gpuDrivenSceneIndex,
    GPU_DRIVEN_SCENE_INDEX_EXPLICIT: false,
    SKINNING_DISABLED: skinningDisabled,
    STORAGE_BUFFER_AVAILABLE: storageBuffer
  };
  if (vertexColorAvailable) defines.VERTEX_COLOR_AVAILABLE = true;
  return Object.entries(defines).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0).map(([name, value]) => `${name}=${String(value)}`).join("+");
}
function pipelineUsesProbeBlend(source) {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//gu, "").replace(/\/\/.*$/gmu, "");
  return /@group\s*\(\s*3\s*\)\s*@binding\s*\(\s*1\s*\)\s*var\s*<\s*storage\s*(?:,\s*read\s*)?>\s*\w+\s*:\s*array\s*<\s*vec4\s*<\s*f32\s*>\s*>/u.test(
    withoutComments
  );
}
function resolvePipelineGroup2Contract(source) {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//gu, "").replace(/\/\/.*$/gmu, "");
  const bindings = [
    ...withoutComments.matchAll(/@group\s*\(\s*2\s*\)\s*@binding\s*\(\s*(\d+)\s*\)/gu)
  ].map((match) => Number(match[1]));
  const hasSkinBindings = bindings.includes(1) || bindings.includes(2);
  const hasClusterBindings = bindings.some((binding) => binding >= 3);
  if (hasSkinBindings && hasClusterBindings) return "skin-cluster";
  if (hasSkinBindings) return "skin";
  if (hasClusterBindings) return "cluster";
  return "mesh";
}
function isStandardPbrMaterialShader(shaderId) {
  return shaderId === "forgeax::default-standard-pbr" || shaderId === SKIN_MATERIAL_SHADER_ID || shaderId === "forgeax::default-standard-pbr-skin" || shaderId !== void 0 && AUTHORED_STANDARD_ID_RE.test(shaderId);
}
function isCanonicalStandardPbrMaterialShader(shaderId) {
  return shaderId === "forgeax::default-standard-pbr" || shaderId === SKIN_MATERIAL_SHADER_ID || shaderId === "forgeax::default-standard-pbr-skin";
}
function buildPbrSkinLayouts(device, caps, pbr) {
  const skinMeshArrayBglRes = device.createBindGroupLayout(
    buildBindGroupLayoutDescriptor(BGL_ONLY_SPEC_STUB, {
      kind: "pbr-skin-mesh-array",
      caps
    })
  );
  if (!skinMeshArrayBglRes.ok) throw skinMeshArrayBglRes.error;
  const layouts = [
    pbr.viewBgl,
    pbr.materialBgl,
    skinMeshArrayBglRes.value,
    pbr.instancesBgl
  ];
  const pipelineLayoutRes = device.createPipelineLayout({
    label: "pbr-skin-pl",
    bindGroupLayouts: layouts
  });
  if (!pipelineLayoutRes.ok) throw pipelineLayoutRes.error;
  const probeLayouts = [pbr.viewBgl, pbr.materialBgl, skinMeshArrayBglRes.value, pbr.probeInstancesBgl];
  let probePipelineLayout = null;
  if (caps.storageBuffer) {
    const probePipelineLayoutRes = device.createPipelineLayout({
      label: "pbr-skin-probe-pl",
      bindGroupLayouts: probeLayouts
    });
    if (!probePipelineLayoutRes.ok) throw probePipelineLayoutRes.error;
    probePipelineLayout = probePipelineLayoutRes.value;
  }
  return {
    pipelineLayout: pipelineLayoutRes.value,
    viewBgl: pbr.viewBgl,
    materialBgl: pbr.materialBgl,
    meshArrayBgl: skinMeshArrayBglRes.value,
    instancesBgl: pbr.instancesBgl,
    probeInstancesBgl: pbr.probeInstancesBgl,
    probePipelineLayout,
    bindGroupLayouts: layouts
  };
}
function buildGpuDrivenPbrInstancesBindGroupLayout(device, caps) {
  if (!caps.storageBuffer) {
    throw new Error("GPU-driven PBR instances layout requires storage-buffer capability");
  }
  const result = device.createBindGroupLayout(
    buildBindGroupLayoutDescriptor(BGL_ONLY_SPEC_STUB, {
      kind: "pbr-gpu-driven-instances",
      caps
    })
  );
  if (!result.ok) throw result.error;
  return result.value;
}
function buildSurfaceDirectInstancesBindGroupLayout(device, caps) {
  if (!caps.storageBuffer) {
    throw new Error("Direct Surface instances layout requires storage-buffer capability");
  }
  const result = device.createBindGroupLayout(
    buildBindGroupLayoutDescriptor(BGL_ONLY_SPEC_STUB, {
      kind: "pbr-surface-direct-instances",
      caps
    })
  );
  if (!result.ok) throw result.error;
  return result.value;
}
function buildGpuDrivenPbrPipelineLayout(device, pbr, gpuDrivenInstancesBgl) {
  const result = device.createPipelineLayout({
    label: "pbr-gpu-driven-pl",
    bindGroupLayouts: [pbr.viewBgl, pbr.materialBgl, pbr.meshArrayBgl, gpuDrivenInstancesBgl]
  });
  if (!result.ok) throw result.error;
  return result.value;
}
function buildGpuDrivenPbrSkinPipelineLayout(device, pbrSkin, gpuDrivenInstancesBgl) {
  const result = device.createPipelineLayout({
    label: "pbr-skin-gpu-driven-pl",
    bindGroupLayouts: [
      pbrSkin.viewBgl,
      pbrSkin.materialBgl,
      pbrSkin.meshArrayBgl,
      gpuDrivenInstancesBgl
    ]
  });
  if (!result.ok) throw result.error;
  return result.value;
}
function createPbrSkinMeshBindGroupEntries(meshBuffer, meshSize, paletteBuffer, paletteWindowBytes) {
  return [
    {
      binding: 0,
      resource: { kind: "buffer", value: { buffer: meshBuffer, offset: 0, size: meshSize } }
    },
    ...[1, 2].map((binding) => ({
      binding,
      resource: {
        kind: "buffer",
        value: {
          buffer: paletteBuffer,
          offset: 0,
          size: paletteWindowBytes
        }
      }
    }))
  ];
}
function pbrSkinMeshDynamicOffsets(meshOffset, paletteOffset) {
  return [meshOffset, paletteOffset, paletteOffset];
}
var SPRITE_PASS_PER_INSTANCE_REGION_VARIANT_SET = "";
function createHdrpBindGroupLayoutDescriptor() {
  const meshBufType = "read-only-storage";
  const clusterBufType = "read-only-storage";
  return {
    label: "hdrp-unified-bgl-group2",
    entries: [
      {
        binding: 0,
        // Standard fragment lighting (transmission/refraction and clustered
        // evaluation) reads the same mesh transform window as the vertex
        // stage. Keep this visibility in the HDRP descriptor aligned with
        // the URP mesh-array descriptor; restricting it to vertex makes the
        // HDRP pipeline invalid when fs_main accesses `meshes[0]`.
        visibility: GPU_SHADER_STAGE_VERTEX | GPU_SHADER_STAGE_FRAGMENT,
        buffer: { type: meshBufType, hasDynamicOffset: true }
      },
      // Bindings 1 and 2 stay absent for the URP physical isolation gap.
      {
        binding: 3,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        buffer: { type: clusterBufType, hasDynamicOffset: false }
      },
      {
        binding: 4,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        buffer: { type: clusterBufType, hasDynamicOffset: false }
      },
      {
        binding: 5,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        buffer: { type: clusterBufType, hasDynamicOffset: false }
      },
      {
        binding: 6,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        buffer: { type: "uniform", hasDynamicOffset: false }
      },
      {
        binding: 7,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        texture: { sampleType: "float", viewDimension: "2d", multisampled: false }
      },
      {
        binding: 8,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        sampler: { type: "filtering" }
      }
    ]
  };
}
function createHdrpSkinBindGroupLayoutDescriptor() {
  const base = createHdrpBindGroupLayoutDescriptor();
  const baseEntries = base.entries;
  if (baseEntries === void 0 || baseEntries[0] === void 0) {
    throw new Error("HDRP base group(2) layout must declare mesh binding 0");
  }
  const paletteType = "read-only-storage";
  return {
    label: "hdrp-skin-unified-bgl-group2",
    entries: [
      baseEntries[0],
      {
        binding: 1,
        visibility: GPU_SHADER_STAGE_VERTEX,
        buffer: { type: paletteType, hasDynamicOffset: true }
      },
      {
        binding: 2,
        visibility: GPU_SHADER_STAGE_VERTEX,
        buffer: { type: paletteType, hasDynamicOffset: true }
      },
      ...baseEntries.slice(1)
    ]
  };
}
function resolveMaterialParamSchema(spec, options) {
  if (options.materialParamSchema !== void 0) return options.materialParamSchema;
  if (options.registry !== void 0) {
    const lookup = options.registry.findMaterialArtifact(spec.shader.id);
    if (lookup.ok) return lookup.value.paramSchema;
  }
  return void 0;
}
function buildBindGroupLayoutDescriptor(spec, options) {
  switch (options.kind) {
    case "pbr-view": {
      const caps = options.caps ?? { };
      return {
        label: "pbr-view-bgl",
        entries: buildPbrViewBglEntries(caps)
      };
    }
    case "pbr-mesh-array": {
      const caps = options.caps ?? { storageBuffer: true };
      const meshBufType = caps.storageBuffer ? "read-only-storage" : "uniform";
      return {
        label: "pbr-mesh-array-bgl",
        entries: [
          {
            binding: 0,
            visibility: GPU_SHADER_STAGE_VERTEX | GPU_SHADER_STAGE_FRAGMENT,
            buffer: { type: meshBufType, hasDynamicOffset: true }
          }
        ]
      };
    }
    case "pbr-instances": {
      const caps = options.caps ?? { storageBuffer: true };
      const meshBufType = caps.storageBuffer ? "read-only-storage" : "uniform";
      const entries = [
        {
          binding: 0,
          visibility: GPU_SHADER_STAGE_VERTEX,
          buffer: { type: meshBufType, hasDynamicOffset: false }
        },
        ...caps.probeBlend === true ? [
          {
            // Per-object fragment lane; the record is always exactly 160B.
            binding: 1,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            buffer: { type: meshBufType, hasDynamicOffset: true }
          }
        ] : []
      ];
      return {
        label: caps.probeBlend === true ? "pbr-probe-instances-bgl" : "pbr-instances-bgl",
        entries: entries.map(
          (entry) => entry.binding === 0 ? {
            ...entry,
            // Standard transmission reads the same per-instance transform in
            // fs_main to convert glTF unit-space thickness into world metres.
            visibility: GPU_SHADER_STAGE_VERTEX | GPU_SHADER_STAGE_FRAGMENT
          } : entry
        )
      };
    }
    case "pbr-gpu-driven-instances": {
      const caps = options.caps ?? { storageBuffer: true };
      const meshBufType = caps.storageBuffer ? "read-only-storage" : "uniform";
      return {
        label: "pbr-gpu-driven-instances-bgl",
        entries: [
          {
            binding: 0,
            visibility: GPU_SHADER_STAGE_VERTEX,
            buffer: { type: meshBufType, hasDynamicOffset: false }
          },
          {
            // ShadowCaster's scene-index entry still reads the visible row
            // through binding(1). Keep this alias in the dedicated layout so
            // the shared visible bind group can serve both the Standard PBR
            // (binding(2)) and depth-only shadow (binding(1)) consumers.
            binding: 1,
            visibility: GPU_SHADER_STAGE_VERTEX | GPU_SHADER_STAGE_FRAGMENT,
            buffer: { type: meshBufType, hasDynamicOffset: false }
          },
          {
            binding: 2,
            visibility: GPU_SHADER_STAGE_VERTEX,
            buffer: { type: meshBufType, hasDynamicOffset: false }
          },
          {
            // Generic Surface dynamic pages are read by authored Surface
            // accessors. The binding is present for every scene-index group
            // so Standard and custom Surface batches share one owner shape.
            binding: 3,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            buffer: { type: meshBufType, hasDynamicOffset: false }
          },
          {
            // Frame time, explicit event ranges, and paired background/depth
            // facts use separate read-only pages. This keeps live state out
            // of the material row and leaves skin's address lane untouched.
            binding: 4,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            buffer: { type: meshBufType, hasDynamicOffset: false }
          },
          {
            // Frame time is one frame-global fact. Keeping it outside the
            // member row prevents a stable frame from issuing one 4-byte
            // queue write for every visible Surface member.
            binding: 5,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            buffer: { type: "uniform", hasDynamicOffset: false }
          }
        ]
      };
    }
    case "pbr-surface-direct-instances": {
      return {
        label: "pbr-surface-direct-instances-bgl",
        entries: [
          {
            binding: 0,
            // Direct instance transforms are consumed only by vs_main. Keep
            // them out of the fragment-stage storage budget; Surface already
            // needs the retained ProbeBlend/page/frame records there and the
            // portable WebGPU limit is eight storage buffers per stage.
            visibility: GPU_SHADER_STAGE_VERTEX,
            buffer: { type: "read-only-storage", hasDynamicOffset: false }
          },
          {
            binding: 1,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            buffer: { type: "read-only-storage", hasDynamicOffset: true }
          },
          {
            binding: 3,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            buffer: { type: "read-only-storage", hasDynamicOffset: false }
          },
          {
            binding: 4,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            buffer: { type: "read-only-storage", hasDynamicOffset: false }
          },
          {
            binding: 5,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            buffer: { type: "uniform", hasDynamicOffset: false }
          },
          {
            binding: 6,
            visibility: GPU_SHADER_STAGE_VERTEX,
            buffer: { type: "uniform", hasDynamicOffset: false }
          }
        ]
      };
    }
    case "pbr-skin-mesh-array": {
      const caps = options.caps ?? { storageBuffer: true };
      const meshBufType = caps.storageBuffer ? "read-only-storage" : "uniform";
      return {
        label: "pbr-skin-mesh-array-bgl",
        entries: [
          {
            binding: 0,
            visibility: GPU_SHADER_STAGE_VERTEX | GPU_SHADER_STAGE_FRAGMENT,
            buffer: { type: meshBufType, hasDynamicOffset: true }
          },
          {
            binding: 1,
            visibility: GPU_SHADER_STAGE_VERTEX,
            buffer: { type: meshBufType, hasDynamicOffset: true }
          },
          {
            binding: 2,
            visibility: GPU_SHADER_STAGE_VERTEX,
            buffer: { type: meshBufType, hasDynamicOffset: true }
          }
        ]
      };
    }
    case "pbr-material-merged": {
      const resolvedSchema = resolveMaterialParamSchema(spec, options);
      const effectiveSchema = resolvedSchema ?? STANDARD_PIPELINE_PARAM_SCHEMA;
      const physicalFields = physicalTextureFields(effectiveSchema);
      const userRegionSchema = isCanonicalStandardPbrMaterialShader(spec.shader.id) ? STANDARD_PIPELINE_PARAM_SCHEMA : effectiveSchema;
      const userRegion = buildPbrMaterialUserRegionEntries(userRegionSchema);
      const afterIbl = [...userRegion, ...appendInjection(userRegion, "ibl")];
      const afterTransmission = [...afterIbl, ...appendInjection(afterIbl, "transmission")];
      const engineRegion = options.caps?.transmissionBackdrop === false && spec.shader.id !== "forgeax::single-layer-medium" ? afterIbl : afterTransmission;
      const afterSurfaceMedium = spec.shader.id === "forgeax::single-layer-medium" ? [...engineRegion, ...appendSingleLayerMediumInjection(engineRegion)] : engineRegion;
      const merged = [
        ...afterSurfaceMedium,
        ...appendTextureInjection(afterSurfaceMedium, physicalFields)
      ];
      if (options.caps?.storageBuffer ?? true) {
        merged.push({
          binding: 46,
          visibility: GPU_SHADER_STAGE_VERTEX | GPU_SHADER_STAGE_FRAGMENT,
          buffer: { type: "read-only-storage", hasDynamicOffset: false }
        });
      }
      const entries = [
        ...merged,
        ...spec.shader.id === "forgeax::single-layer-medium" ? [] : [
          {
            binding: 47,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            texture: { sampleType: "float", viewDimension: "cube" }
          }
        ]
      ];
      return {
        label: "pbr-material-skylight-bgl",
        entries
      };
    }
    case "unlit-material": {
      const resolvedSchema = resolveMaterialParamSchema(spec, options);
      return {
        label: "unlit-material-bgl",
        entries: buildPbrMaterialUserRegionEntries(resolvedSchema)
      };
    }
    case "hdrp-7-slot": {
      const desc = createHdrpBindGroupLayoutDescriptor();
      return {
        label: desc.label ?? "hdrp-unified-bgl-group2",
        entries: [...desc.entries ?? []]
      };
    }
    case "fullscreen-post": {
      return {
        label: "fullscreen-post-bgl",
        entries: buildFullscreenPostInputEntries(spec)
      };
    }
    case "fullscreen-post-with-params": {
      return {
        label: "fullscreen-post-with-params-bgl",
        entries: [
          ...buildFullscreenPostInputEntries(spec),
          {
            binding: 2,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            buffer: { type: "uniform" }
          }
        ]
      };
    }
    case "fullscreen-post-with-scene-depth": {
      return {
        label: "fullscreen-post-with-scene-depth-bgl",
        entries: [
          ...buildFullscreenPostInputEntries(spec),
          {
            binding: 2,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            buffer: { type: "uniform" }
          },
          {
            binding: 3,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            texture: { sampleType: "depth", viewDimension: "2d" }
          },
          {
            binding: 4,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            sampler: { type: "non-filtering" }
          }
        ]
      };
    }
    case "fullscreen-post-with-scene-depth-msaa": {
      return {
        label: "fullscreen-post-with-scene-depth-msaa-bgl",
        entries: [
          ...buildFullscreenPostInputEntries(spec),
          {
            binding: 2,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            buffer: { type: "uniform" }
          },
          {
            binding: 3,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            texture: { sampleType: "depth", viewDimension: "2d", multisampled: true }
          },
          {
            binding: 4,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            sampler: { type: "non-filtering" }
          }
        ]
      };
    }
    case "fullscreen-post-with-paired-msaa": {
      return {
        label: "fullscreen-post-with-paired-msaa-bgl",
        entries: [
          {
            binding: 0,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            texture: {
              sampleType: "unfilterable-float",
              viewDimension: "2d",
              multisampled: true
            }
          },
          {
            binding: 1,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            sampler: { type: "filtering" }
          },
          {
            binding: 2,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            buffer: { type: "uniform" }
          },
          {
            binding: 3,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            texture: { sampleType: "depth", viewDimension: "2d", multisampled: true }
          },
          {
            binding: 4,
            visibility: GPU_SHADER_STAGE_FRAGMENT,
            sampler: { type: "non-filtering" }
          }
        ]
      };
    }
  }
}
function buildFullscreenPostInputEntries(spec) {
  const inputFormat = spec.attachments.depthFormat ?? spec.attachments.colorFormats[0];
  const sampleType = inputFormat === "depth32float" || inputFormat === "depth24plus" || inputFormat === "depth24plus-stencil8" || inputFormat === "depth16unorm" ? "depth" : inputFormat === "r32float" ? "unfilterable-float" : "float";
  return [
    {
      binding: 0,
      visibility: GPU_SHADER_STAGE_FRAGMENT,
      texture: { sampleType, viewDimension: "2d" }
    },
    {
      binding: 1,
      visibility: GPU_SHADER_STAGE_FRAGMENT,
      sampler: {
        type: sampleType === "depth" ? "comparison" : "filtering"
      }
    }
  ];
}

// src/systems/pass-selector.ts
function matchPass(tags, selector) {
  if (Object.keys(selector).length === 0) return true;
  for (const [key, allowedValues] of Object.entries(selector)) {
    const passValue = tags[key];
    if (passValue === void 0) return false;
    if (allowedValues.length === 0) return false;
    if (!allowedValues.includes(passValue)) return false;
  }
  return true;
}
function selectPasses(passes, selector) {
  if (Object.keys(selector).length === 0) return passes;
  return passes.filter(
    (p) => matchPass(p.renderState?.tags ?? {}, selector)
  );
}

// src/gpu-driven/prepared-draw.ts
function failure(code, detail) {
  return { ok: false, error: new GpuDrivenPreparationError(code, detail) };
}
function hasRequiredVertexInputs(expected, actual) {
  return expected.every(
    (input) => actual.some(
      (candidate) => candidate.semantic === input.semantic && candidate.location === input.location && candidate.format === input.format
    )
  );
}
function hasMaterialResources(snapshot, receipt) {
  if ((snapshot.material.textureSources?.size ?? 0) > 0 || (snapshot.material.videoTextureFields?.size ?? 0) > 0) {
    return false;
  }
  const textures = snapshot.material.textureHandles;
  const samplers = snapshot.material.samplerHandles;
  const authoredTextures = snapshot.material.authoredTextureFields;
  const authoredSamplers = snapshot.material.authoredSamplerFields;
  return receipt.resourceSlots.every((slot) => {
    if (slot.kind === "storage-buffer") {
      return receipt.surface?.dynamicInput?.group === slot.group && receipt.surface.dynamicInput.binding === slot.binding && slot.group === 3 && slot.binding === 3;
    }
    if (slot.kind === "texture") {
      if (!authoredTextures?.has(slot.parameter)) return true;
      return textures?.has(slot.parameter) === true || snapshot.material.textureSources?.has(slot.parameter) === true || snapshot.material.videoTextureFields?.has(slot.parameter) === true;
    }
    if (!authoredSamplers?.has(slot.parameter)) return true;
    return samplers?.has(slot.parameter) === true;
  });
}
function prepareGpuDrivenDraw(input) {
  const receipt = input.artifact.receipt;
  if (receipt === void 0) {
    return failure("missing-material-receipt", {
      reason: "material-receipt-missing",
      owner: "material",
      expected: "MaterialShaderArtifact.receipt"
    });
  }
  if (receipt.generation !== input.generation) {
    return failure("stale-generation", {
      reason: "generation-stale",
      owner: "generation",
      expectedGeneration: input.generation,
      actualGeneration: receipt.generation
    });
  }
  if (receipt.reflection.layoutIdentity !== input.artifact.layoutIdentity) {
    return failure("reflection-mismatch", {
      reason: "reflection-receipt-mismatch",
      owner: "material",
      expected: input.artifact.layoutIdentity,
      actual: receipt.reflection.layoutIdentity
    });
  }
  if (receipt.uvSets.some((uv) => uv.set > 0) && input.geometry.vertexInputs.length < 3) {
    return failure("missing-uv", {
      reason: "uv-set-missing",
      owner: "geometry",
      expected: `${receipt.uvSets.length} material UV sets`,
      actual: `${input.geometry.vertexInputs.filter((vertex) => vertex.semantic.startsWith("uv")).length} geometry UV sets`
    });
  }
  if (!hasRequiredVertexInputs(receipt.vertexInputs, input.geometry.vertexInputs)) {
    return failure("vertex-input-mismatch", {
      reason: "vertex-semantic-mismatch",
      owner: "geometry",
      expected: receipt.vertexInputs.map((input2) => input2.semantic).join(","),
      actual: input.geometry.vertexInputs.map((input2) => input2.semantic).join(",")
    });
  }
  const hasAlphaMask = receipt.alphaMask.cutoff.length > 0 || receipt.alphaMask.source.length > 0;
  if (hasAlphaMask && (receipt.alphaMask.cutoff.length === 0 || receipt.alphaMask.source.length === 0)) {
    return failure("alpha-mask-mismatch", {
      reason: "alpha-mask-receipt-missing",
      owner: "material",
      expected: "alphaMask.cutoff and alphaMask.source for a masked Pass"
    });
  }
  if (!hasMaterialResources(input.snapshot, receipt)) {
    return failure("resource-not-ready", {
      reason: "material-resource-missing",
      owner: "material",
      expected: receipt.resourceSlots.map((slot) => slot.parameter).join(",")
    });
  }
  const deformation = input.snapshot.skin === void 0 ? "rigid" : "skin";
  if (deformation === "skin") {
    if (input.skinReceipt === void 0 || receipt.skinPaletteAddress === void 0) {
      return failure("skin-receipt-mismatch", {
        reason: "skin-address-missing",
        owner: "skin",
        expected: "skinPaletteAddress and skinReceipt"
      });
    }
    if (input.skinReceipt.identity !== input.snapshot.skin?.identity || input.skinReceipt.generation !== input.snapshot.skin?.generation || input.skinReceipt.group !== receipt.skinPaletteAddress.group || input.skinReceipt.binding !== receipt.skinPaletteAddress.binding) {
      return failure("skin-receipt-mismatch", {
        reason: "skin-address-missing",
        owner: "skin",
        expected: `${receipt.skinPaletteAddress.group}:${receipt.skinPaletteAddress.binding}@${input.snapshot.skin?.generation ?? "<missing>"}`,
        actual: `${input.skinReceipt.group}:${input.skinReceipt.binding}@${input.skinReceipt.generation}`
      });
    }
  }
  return {
    ok: true,
    value: {
      identity: {
        material: input.artifact.material,
        geometry: input.geometry.identity,
        deformation
      },
      receiptGeneration: receipt.generation,
      receiptIdentity: receipt.receiptIdentity,
      directEntry: receipt.directEntry,
      sceneIndexEntry: receipt.sceneIndexEntry,
      materialRow: receipt.materialRow,
      resourceSlots: receipt.resourceSlots,
      uvSets: receipt.uvSets,
      vertexInputs: receipt.vertexInputs,
      alphaMask: receipt.alphaMask,
      skinPaletteAddress: receipt.skinPaletteAddress,
      topology: input.draw.topology,
      indexed: input.draw.kind === "indexed",
      first: input.draw.first,
      count: input.draw.count,
      baseVertex: input.draw.baseVertex
    }
  };
}

// src/extract/gpu-driven.ts
function gpuDrivenDrawKey(worldEntity, materialHandle, drawItemIndex) {
  return `${worldEntity}:${materialHandle}:${drawItemIndex}`;
}
function gpuDrivenShadowDrawKey(worldEntity, materialHandle, drawItemIndex, passIndex) {
  return `${gpuDrivenDrawKey(worldEntity, materialHandle, drawItemIndex)}:${passIndex}`;
}
function gpuDrivenMaterialArtifactKey(input) {
  return [
    input.material,
    input.deformation,
    input.receiptIdentity ?? "<legacy-receipt>",
    input.receiptGeneration
  ].join("|");
}
function gpuDrivenSourceDrawItemIndex(draw, compactIndex) {
  return draw.drawItemIndex ?? compactIndex;
}
function resolvePreparedGpuDrivenDraw(input) {
  return prepareGpuDrivenDraw(input);
}
function gpuDrivenMaterialResourceClass(material) {
  const textures = [...material.textureHandles?.entries() ?? []].map(([name, handle]) => [name, Number(handle)]).sort(([left], [right]) => left.localeCompare(right));
  const samplers = [...material.samplerHandles?.entries() ?? []].map(([name, handle]) => [name, Number(handle)]).sort(([left], [right]) => left.localeCompare(right));
  return JSON.stringify({
    textures,
    samplers
  });
}
function hasCpuOnlyMaterialResources(material) {
  return (material.textureSources?.size ?? 0) > 0 || (material.videoTextureFields?.size ?? 0) > 0;
}
function buildGpuDrivenDraws(input) {
  const legacy = "submeshes" in input;
  if (!legacy && input.mesh === void 0) return [];
  const parsedMesh = legacy ? void 0 : input.mesh;
  if (!legacy && parsedMesh === void 0) return [];
  const indexed = legacy ? input.indexed : parsedMesh?.indices !== void 0;
  const submeshes = legacy ? input.submeshes : parsedMesh?.submeshes ?? [];
  const layoutProjection = parsedMesh === void 0 ? void 0 : deriveVertexLayoutProjection(parsedMesh.attributes);
  const geometry = {
    identity: parsedMesh === void 0 ? "<no-mesh>" : `${parsedMesh.guid ?? "<no-guid>"}:${layoutProjection?.digest ?? ""}`,
    vertexInputs: (layoutProjection?.attributes ?? []).map((attribute) => ({
      semantic: attribute.key,
      location: attribute.shaderLocation,
      format: attribute.format
    })),
    topology: submeshes[0]?.topology ?? "triangle-list",
    indexed
  };
  let nonIndexedFirst = 0;
  return submeshes.flatMap((submesh, drawItemIndex) => {
    const drawMaterial = input.materials[submesh.materialSlot] ?? input.fallbackMaterial;
    const first = indexed ? submesh.indexOffset : nonIndexedFirst;
    nonIndexedFirst += submesh.vertexCount;
    if (drawMaterial.transparent === true) return [];
    const draw = {
      drawItemIndex,
      kind: indexed ? "indexed" : "non-indexed",
      first,
      count: indexed ? submesh.indexCount : submesh.vertexCount,
      baseVertex: 0,
      materialSlot: submesh.materialSlot,
      topology: submesh.topology,
      pipelineClass: `${drawMaterial.materialShaderId ?? "forgeax::default-unlit"}|${submesh.topology}|${JSON.stringify(drawMaterial.renderState ?? null)}`,
      materialResourceClass: gpuDrivenMaterialResourceClass(drawMaterial)
    };
    const lodRanges = !legacy ? input.lodMeshes?.map((lodMesh) => {
      if (lodMesh === void 0) return void 0;
      const lower = lodMesh.submeshes[drawItemIndex];
      if (lower === void 0) return void 0;
      const lowerIndexed = lodMesh.indices !== void 0;
      const lowerFirst = lowerIndexed ? lower.indexOffset : lodMesh.submeshes.slice(0, drawItemIndex).reduce((offset, entry) => offset + entry.vertexCount, 0);
      return {
        first: lowerFirst,
        count: lowerIndexed ? lower.indexCount : lower.vertexCount,
        baseVertex: 0
      };
    }) : void 0;
    const withLodRanges = lodRanges?.length !== 0 && lodRanges?.every((range) => range !== void 0) ? { lodRanges } : {};
    const prepared = legacy ? input.prepare?.(draw, drawMaterial) : hasCpuOnlyMaterialResources(drawMaterial) ? void 0 : (() => {
      const materialShaderId = drawMaterial.materialShaderId;
      const vertexColorAvailable = geometry.vertexInputs.some(
        (input2) => input2.semantic === "color"
      );
      const sceneIndexProgramKey = Object.entries(
        drawMaterial.materialSceneIndexProgramKeys ?? {}
      ).find(
        ([passName, program]) => program.pass === "forward" && drawMaterial.materialProgramKeys?.[passName] === materialShaderId
      )?.[1]?.specializationKey;
      const artifact = materialShaderId === void 0 ? void 0 : input.getMaterialShaderArtifact?.(sceneIndexProgramKey ?? materialShaderId, {
        vertexColorAvailable,
        deformation: input.baseSnapshot.skin === void 0 ? "rigid" : "skin",
        pass: "forward",
        address: "scene-index"
      });
      const requiresReceipt = isCanonicalStandardPbrMaterialShader(materialShaderId) || sceneIndexProgramKey !== void 0;
      if (artifact === void 0) {
        return input.getMaterialShaderArtifact !== void 0 && requiresReceipt ? new GpuDrivenPreparationError("missing-material-receipt", {
          reason: "material-receipt-missing",
          owner: "material",
          expected: `artifact for ${materialShaderId}`
        }) : void 0;
      }
      const receipt = artifact.receipt;
      if (receipt === void 0) {
        return requiresReceipt ? new GpuDrivenPreparationError("missing-material-receipt", {
          reason: "material-receipt-missing",
          owner: "material",
          expected: `receipt for ${materialShaderId}`
        }) : void 0;
      }
      const skinReceipt = input.baseSnapshot.skin !== void 0 && receipt.skinPaletteAddress !== void 0 ? {
        identity: input.baseSnapshot.skin.identity,
        generation: input.baseSnapshot.skin.generation,
        group: receipt.skinPaletteAddress.group,
        binding: receipt.skinPaletteAddress.binding,
        byteOffset: input.baseSnapshot.skin.byteOffset
      } : void 0;
      const selectedArtifact = artifact === void 0 || sceneIndexProgramKey === void 0 || materialShaderId === void 0 ? artifact : {
        ...artifact,
        material: materialShaderId,
        specializationKey: sceneIndexProgramKey
      };
      const result = resolvePreparedGpuDrivenDraw({
        snapshot: { ...input.baseSnapshot, material: drawMaterial },
        artifact: selectedArtifact ?? artifact,
        geometry: { ...geometry, topology: draw.topology, indexed: draw.kind === "indexed" },
        generation: receipt.generation,
        draw,
        ...skinReceipt === void 0 ? {} : { skinReceipt }
      });
      return result.ok ? result.value : result.error;
    })();
    if (prepared instanceof GpuDrivenPreparationError) {
      return [{ ...draw, preparationError: prepared, ...withLodRanges }];
    }
    return [
      prepared === void 0 ? { ...draw, ...withLodRanges } : { ...draw, prepared, ...withLodRanges }
    ];
  });
}

// src/instances-derived-bounds.ts
var fingerprintScalar = new Float32Array(1);
var fingerprintBits = new Uint32Array(fingerprintScalar.buffer);
function fingerprintNumericArray(values) {
  let hash = 2166136261;
  for (let index = 0; index < values.length; index += 1) {
    fingerprintScalar[0] = Number(values[index]);
    hash = Math.imul(hash ^ (fingerprintBits[0] ?? 0), 16777619) >>> 0;
  }
  return hash >>> 0;
}
function finiteAabb(aabb) {
  if (aabb === void 0 || aabb.length < 6) return false;
  const minX = aabb[0];
  const minY = aabb[1];
  const minZ = aabb[2];
  const maxX = aabb[3];
  const maxY = aabb[4];
  const maxZ = aabb[5];
  return Number.isFinite(minX) && Number.isFinite(minY) && Number.isFinite(minZ) && Number.isFinite(maxX) && Number.isFinite(maxY) && Number.isFinite(maxZ) && minX <= maxX && minY <= maxY && minZ <= maxZ;
}
function finiteMatrix(matrix) {
  if (matrix.length < 16) return false;
  for (let index = 0; index < 16; index += 1) {
    if (!Number.isFinite(matrix[index])) return false;
  }
  return true;
}
function multiplyMat4(out, left, right, rightOffset = 0) {
  for (let column = 0; column < 4; column += 1) {
    const rightColumn = rightOffset + column * 4;
    const right0 = Number(right[rightColumn] ?? 0);
    const right1 = Number(right[rightColumn + 1] ?? 0);
    const right2 = Number(right[rightColumn + 2] ?? 0);
    const right3 = Number(right[rightColumn + 3] ?? 0);
    const outOffset = column * 4;
    out[outOffset] = Number(left[0] ?? 0) * right0 + Number(left[4] ?? 0) * right1 + Number(left[8] ?? 0) * right2 + Number(left[12] ?? 0) * right3;
    out[outOffset + 1] = Number(left[1] ?? 0) * right0 + Number(left[5] ?? 0) * right1 + Number(left[9] ?? 0) * right2 + Number(left[13] ?? 0) * right3;
    out[outOffset + 2] = Number(left[2] ?? 0) * right0 + Number(left[6] ?? 0) * right1 + Number(left[10] ?? 0) * right2 + Number(left[14] ?? 0) * right3;
    out[outOffset + 3] = Number(left[3] ?? 0) * right0 + Number(left[7] ?? 0) * right1 + Number(left[11] ?? 0) * right2 + Number(left[15] ?? 0) * right3;
  }
}
function finiteMatrixAt(values, offset) {
  if (values.length - offset < 16) return false;
  for (let index = 0; index < 16; index += 1) {
    if (!Number.isFinite(values[offset + index])) return false;
  }
  return true;
}
function isAffine(matrix) {
  return matrix[3] === 0 && matrix[7] === 0 && matrix[11] === 0 && matrix[15] === 1;
}
function includeBox(out, candidate, initialized) {
  const minX = candidate[0];
  const minY = candidate[1];
  const minZ = candidate[2];
  const maxX = candidate[3];
  const maxY = candidate[4];
  const maxZ = candidate[5];
  if (!initialized) {
    out[0] = minX;
    out[1] = minY;
    out[2] = minZ;
    out[3] = maxX;
    out[4] = maxY;
    out[5] = maxZ;
    return true;
  }
  if (minX < (out[0] ?? Number.POSITIVE_INFINITY)) out[0] = minX;
  if (minY < (out[1] ?? Number.POSITIVE_INFINITY)) out[1] = minY;
  if (minZ < (out[2] ?? Number.POSITIVE_INFINITY)) out[2] = minZ;
  if (maxX > (out[3] ?? Number.NEGATIVE_INFINITY)) out[3] = maxX;
  if (maxY > (out[4] ?? Number.NEGATIVE_INFINITY)) out[4] = maxY;
  if (maxZ > (out[5] ?? Number.NEGATIVE_INFINITY)) out[5] = maxZ;
  return true;
}
function transformAabb(out, local, matrix) {
  const minX = local[0];
  const minY = local[1];
  const minZ = local[2];
  const maxX = local[3];
  const maxY = local[4];
  const maxZ = local[5];
  const centerX = (minX + maxX) * 0.5;
  const centerY = (minY + maxY) * 0.5;
  const centerZ = (minZ + maxZ) * 0.5;
  const extentX = (maxX - minX) * 0.5;
  const extentY = (maxY - minY) * 0.5;
  const extentZ = (maxZ - minZ) * 0.5;
  if (isAffine(matrix)) {
    const centerWorldX = matrix[0] * centerX + matrix[4] * centerY + matrix[8] * centerZ + matrix[12];
    const centerWorldY = matrix[1] * centerX + matrix[5] * centerY + matrix[9] * centerZ + matrix[13];
    const centerWorldZ = matrix[2] * centerX + matrix[6] * centerY + matrix[10] * centerZ + matrix[14];
    const extentWorldX = Math.abs(matrix[0]) * extentX + Math.abs(matrix[4]) * extentY + Math.abs(matrix[8]) * extentZ;
    const extentWorldY = Math.abs(matrix[1]) * extentX + Math.abs(matrix[5]) * extentY + Math.abs(matrix[9]) * extentZ;
    const extentWorldZ = Math.abs(matrix[2]) * extentX + Math.abs(matrix[6]) * extentY + Math.abs(matrix[10]) * extentZ;
    out[0] = centerWorldX - extentWorldX;
    out[1] = centerWorldY - extentWorldY;
    out[2] = centerWorldZ - extentWorldZ;
    out[3] = centerWorldX + extentWorldX;
    out[4] = centerWorldY + extentWorldY;
    out[5] = centerWorldZ + extentWorldZ;
    return finiteAabb(out);
  }
  let minimumW = Number.POSITIVE_INFINITY;
  let maximumW = Number.NEGATIVE_INFINITY;
  for (let corner = 0; corner < 8; corner += 1) {
    const x = (corner & 1) === 0 ? minX : maxX;
    const y = (corner & 2) === 0 ? minY : maxY;
    const z = (corner & 4) === 0 ? minZ : maxZ;
    const w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
    if (!Number.isFinite(w)) return false;
    if (w < minimumW) minimumW = w;
    if (w > maximumW) maximumW = w;
  }
  if (minimumW <= 0 && maximumW >= 0) return false;
  let unionMinX = Number.POSITIVE_INFINITY;
  let unionMinY = Number.POSITIVE_INFINITY;
  let unionMinZ = Number.POSITIVE_INFINITY;
  let unionMaxX = Number.NEGATIVE_INFINITY;
  let unionMaxY = Number.NEGATIVE_INFINITY;
  let unionMaxZ = Number.NEGATIVE_INFINITY;
  for (let corner = 0; corner < 8; corner += 1) {
    const x = (corner & 1) === 0 ? minX : maxX;
    const y = (corner & 2) === 0 ? minY : maxY;
    const z = (corner & 4) === 0 ? minZ : maxZ;
    const rawX = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12];
    const rawY = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13];
    const rawZ = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];
    const w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
    const projectedX = rawX / w;
    const projectedY = rawY / w;
    const projectedZ = rawZ / w;
    if (!Number.isFinite(projectedX) || !Number.isFinite(projectedY) || !Number.isFinite(projectedZ)) {
      return false;
    }
    if (projectedX < unionMinX) unionMinX = projectedX;
    if (projectedY < unionMinY) unionMinY = projectedY;
    if (projectedZ < unionMinZ) unionMinZ = projectedZ;
    if (projectedX > unionMaxX) unionMaxX = projectedX;
    if (projectedY > unionMaxY) unionMaxY = projectedY;
    if (projectedZ > unionMaxZ) unionMaxZ = projectedZ;
  }
  out[0] = unionMinX;
  out[1] = unionMinY;
  out[2] = unionMinZ;
  out[3] = unionMaxX;
  out[4] = unionMaxY;
  out[5] = unionMaxZ;
  return finiteAabb(out);
}
function deriveInstancesUnionBounds(input) {
  const { meshAabb, entityWorld, transforms } = input;
  if (!finiteAabb(meshAabb) || !finiteMatrix(entityWorld) || transforms === void 0) {
    return void 0;
  }
  if (transforms.length === 0 || transforms.length % 16 !== 0) return void 0;
  const local = meshAabb;
  const union = new Float32Array(6);
  const composed = new Float32Array(16);
  const transformed = new Float32Array(6);
  let initialized = false;
  for (let offset = 0; offset < transforms.length; offset += 16) {
    if (!finiteMatrixAt(transforms, offset)) return void 0;
    multiplyMat4(composed, entityWorld, transforms, offset);
    if (!finiteMatrix(composed) || !transformAabb(transformed, local, composed)) return void 0;
    initialized = includeBox(union, transformed, initialized);
  }
  return initialized && finiteAabb(union) ? union : void 0;
}
var InstanceBoundsCache = class {
  entries = /* @__PURE__ */ new Map();
  hits = 0;
  misses = 0;
  derives = 0;
  invalidations = 0;
  key(input) {
    return `${input.worldId === void 0 ? "" : `${input.worldId}:`}${input.entityKey}`;
  }
  get(input) {
    const previous = this.entries.get(this.key(input));
    if (previous !== void 0 && previous.meshGeneration === input.meshGeneration && previous.transformGeneration === input.transformGeneration && previous.matrixGeneration === input.matrixGeneration) {
      this.hits += 1;
      return previous.bounds;
    }
    this.misses += 1;
    this.derives += 1;
    const bounds = deriveInstancesUnionBounds(input);
    this.entries.set(this.key(input), {
      ...input.worldId === void 0 ? {} : { worldId: input.worldId },
      entityKey: input.entityKey,
      meshGeneration: input.meshGeneration,
      transformGeneration: input.transformGeneration,
      matrixGeneration: input.matrixGeneration,
      bounds
    });
    return bounds;
  }
  invalidate(entityKey, worldId) {
    if (entityKey === void 0) {
      if (this.entries.size > 0) this.invalidations += this.entries.size;
      this.entries.clear();
    } else {
      if (this.entries.delete(this.key({ entityKey, ...worldId === void 0 ? {} : { worldId } }))) {
        this.invalidations += 1;
      }
    }
  }
  inspect() {
    return {
      hits: this.hits,
      misses: this.misses,
      derives: this.derives,
      invalidations: this.invalidations
    };
  }
};

export { AtmosphereInvalidParameterError, AutoExposureCapabilityUnavailableError, AutoExposureInvalidParameterError, AutoExposureStageFailedError, AutoExposureStaleGenerationError, BarrelDistortionInvalidParameterError, COOKIE_MATRIX_BYTES, COOKIE_SLICE_CAPACITY, COOKIE_SLICE_SIZE, DEFAULT_MOTION_BLUR_PARAMS, DeviceScope, DynamicResolutionInvalidParameterError, DynamicResolutionRequiresTaaError, DynamicResolutionTimingUnavailableError, EXTENDED_LIGHTING_REQUIRED_SAMPLED_TEXTURES, EXTENDED_LIGHTING_TOPOLOGY, EnvironmentGenerationFailedError, EnvironmentSourceConflictError, EquirectProjectionFailedError, FXAA_POST_PROCESS_ID, FogCardinalityError, FrameReceiptStaleError, GPU_BUFFER_USAGE_COPY_DST, GPU_BUFFER_USAGE_COPY_SRC, GPU_BUFFER_USAGE_INDEX, GPU_BUFFER_USAGE_INDIRECT, GPU_BUFFER_USAGE_MAP_READ, GPU_BUFFER_USAGE_QUERY_RESOLVE, GPU_BUFFER_USAGE_STORAGE, GPU_BUFFER_USAGE_UNIFORM, GPU_BUFFER_USAGE_VERTEX, GPU_SHADER_STAGE_COMPUTE, GPU_SHADER_STAGE_FRAGMENT, GPU_SHADER_STAGE_VERTEX, GPU_TEXTURE_USAGE_COPY_DST, GPU_TEXTURE_USAGE_COPY_SRC, GPU_TEXTURE_USAGE_RENDER_ATTACHMENT, GPU_TEXTURE_USAGE_RENDER_ATTACHMENT_AND_TEXTURE_BINDING, GPU_TEXTURE_USAGE_STORAGE_BINDING, GPU_TEXTURE_USAGE_TEXTURE_BINDING, GpuDrivenPreparationError, IES_SLICE_CAPACITY, IES_SLICE_HEIGHT, IES_SLICE_WIDTH, InstanceBoundsCache, InstanceProjectionStore, InstanceTransformsError, LifecycleTransaction, MOTION_BLUR_PARAMS_BYTE_SIZE, MaterialSkinAttrMissingError, MotionBlurValidationError, ObservationUnavailableError, OwnerStageFailedError, PointShadowAtlasBoundsViolationError, PointShadowAtlasUninitializedError, PointsLinesBudgetExceededError, PointsLinesInvalidStyleError, PointsLinesMaterialUnsupportedError, PointsLinesPrepareFailedError, PointsLinesStyleUnsupportedError, PointsLinesTopologyMismatchError, RENDER_PHASE_CATALOG, RenderFeatureCapabilityMissingError, RenderFeatureDrawRecordingFailedError, RenderFeaturePreparationFailedError, RenderFeaturePreparedStateMismatchError, RenderFeatureRegistrationConflictError, RenderFeatureStageFailedError, RenderIntentInvalidError, RenderTargetCapabilityMissingError, RenderTargetDescriptorInvalidError, RenderTargetOperationFailedError, RenderTargetStateInvalidError, RendererContractFailureError, RendererOperationError, SHADOW_ATLAS_DEFAULT_FACE_SIZE, SHADOW_ATLAS_DEFAULT_LAYERS, SHADOW_CASTER_SHADER_ID, SKIN_MATERIAL_SHADER_ID, SPRITE_PASS_PER_INSTANCE_REGION_VARIANT_SET, STANDARD_OUTPUT_TRANSFORM_FEATURE_ID, SceneDataUnavailableError, ShadowAtlas, ShadowInvalidConfigError, SkinMaterialMismatchError, SkinPaletteOverflowError, StandardClusterIndexOverflowError, StandardClusterTransportUnavailableError, StandardLightBudgetExceededError, StandardProfileInvalidError, TaaCapsInsufficientError, TemporalFrameSubmitError, TransmissionCapabilityMissingError, VertexColorVariantConflictError, VideoUploadUnsupportedError, VolumeDensityShapeMismatchError, VolumeInvalidBoundsError, VolumeInvalidParametersError, VolumeOwnerConflictError, buildBindGroupLayoutDescriptor, buildGpuDrivenDraws, buildGpuDrivenPbrInstancesBindGroupLayout, buildGpuDrivenPbrPipelineLayout, buildGpuDrivenPbrSkinPipelineLayout, buildPbrMaterialUserRegionEntries, buildPbrPipelineLayouts, buildPbrSkinLayouts, buildSurfaceDirectInstancesBindGroupLayout, createAutoExposureError, createAutoExposureInspection, createHdrpBindGroupLayoutDescriptor, createHdrpSkinBindGroupLayoutDescriptor, createLightResourceUnavailable, createPbrSkinMeshBindGroupEntries, createRenderTargetMaterialSource, createVisibilityBudget, deriveExtendedLightingCapability, deriveInstancesUnionBounds, effectiveMotionBlurSampleCount, extendedLightingSampledTextureCapacityAvailable, fingerprintNumericArray, getOpaqueResourceIdentity, getTextureIdentity, gpuDrivenDrawKey, gpuDrivenMaterialArtifactKey, gpuDrivenShadowDrawKey, gpuDrivenSourceDrawItemIndex, hasRequiredVertexInputs, instanceCollectionCacheKey, instanceUploadRangesForResident, isCanonicalStandardPbrMaterialShader, isMotionBlurIntervalValid, isStandardPbrMaterialShader, isStandardPbrSkinMaterialShader, makeZeroCameraFallbackSnapshot, matchPass, materialBindGroupLayoutIdentity, motionBlurExposureScale, motionBlurSampleDelta, motionBlurTemporalDemand, pbrSkinMeshDynamicOffsets, physicalTextureFields, pipelineUsesProbeBlend, renderTargetMaterialSourceIdentity, resolveMotionBlurParams, resolvePipelineGroup2Contract, resolveRenderTargetMaterialSource, selectPasses, shadowCasterVariantSet, validateGraphTargetCaptureReadback, validateInstanceTransforms, validateMotionBlurParams, worldEntityKey };
