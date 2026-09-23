import { registerRenderSourceSystems, createRenderSourceState, createGlobalTransformChangeQuery, isRenderableMember, renderMaterialContext, publicationDependencies, publicationFrameDependencies, publicationTargetSources, RenderPublicationError, RENDERABLE_SOURCE_COMPONENTS } from './chunk-L6HFU6QS.mjs';
export { BARREL_DISTORTION_FEATURE_IDENTITY, BARREL_DISTORTION_POST_PROCESS_ID, BARREL_DISTORTION_WGSL, BARREL_DISTORTION_WGSL_COORDINATE, CLOUD_DENSITY_COMPUTE_WGSL, CLOUD_HISTORY_FULLSCREEN_WGSL, CLOUD_HISTORY_SURFACE_COUNT, CLOUD_LAYER_DENSITY_BINDINGS, CLOUD_LAYER_DENSITY_CACHE, CLOUD_LAYER_DENSITY_OUTPUT, CLOUD_LAYER_DENSITY_PROGRAM, CLOUD_LAYER_FEATURE_IDENTITY, CLOUD_RGBA16FLOAT_BYTES_PER_TEXEL, CLOUD_VIEW_FULLSCREEN_WGSL, CLOUD_VIEW_PARAMS_BYTES, CloudHistoryStore, DEFAULT_REFLECTION_PROBE_LIMITS, DynamicGeometryError, DynamicInputError, LOD_OCCLUSION_INSPECTION_MAX_BYTES, LOD_OCCLUSION_INSPECTION_SCHEMA, ReadonlyDynamicInputPage, ReflectionProbeProjection, RenderPublicationError, RenderPublicationTargetOwner, SSR_FORMAT_PROFILE, SSR_FORMAT_STAGES, acceptCloudLayerGeneration, admitPointsLines, admitReflectionProbe, admitSingleLayerMediumSubmission, admitSsrM0, admitSsrSpatial, advanceProbeFilter, applyCloudSolarTransmittance, boxProjectReflectionDirection, buildCloudDensityCache, buildReflectionProbeTable, cloudCapabilitiesFromRhi, cloudTemporalResetReasons, cloudTemporalSignature, commitProbeFilterStep, compositeCloudRadiance, consumeLodOcclusionInspection, createBarrelDistortionRenderFeature, createCloudHistory, createCloudLayerFeature, createCloudShadowProjection, createDynamicGeometryLifecycle, createProbeFilterState, estimateReflectionProbeBytes, evaluateCloudDensity, inspectCloudLayer, inspectCloudLayerResources, inspectLodOcclusion, inspectPointShadow, inspectReflectionFallback, inspectVolumetricFog, integrateCloudCameraPath, integrateCloudInterior, integrateCloudPath, integrateCloudSolarColumn, intersectCloudLayer, probeFilterIsSteady, projectCloudShadowUv, projectSsrDependencies, projectSsrSpatialInspection, reconstructCloudDensityCache, reflectionProbeTableBytes, renderPublicationTransfers, reprojectCloudHistory, resolveSsrAdmissionGeneration, retainCloudLayerAfterFailure, sampleCloudDensity, sampleCloudShadow, selectReflectionProbe, serializeLodOcclusionInspection, serializeSsrSpatialInspection, snapshotCloudDensityCache, validateReflectionProbeInput, validateScreenSpaceReflection, zeroSsrAdmissionWork } from './chunk-L6HFU6QS.mjs';
import { Visibility, extractFrames, internSharedRefFromGuid, resolveMaterialSnapshot, Atmosphere, BarrelDistortion, Camera, CloudLayer, DirectionalLight, DynamicResolution, DepthOfField, Instances, Layer, LightProbe, MeshFilter, MeshRenderer, MotionBlur, PointLight, PointLightShadow, Points, Lines, PostProcessParams, RectAreaLight, SceneInstance, SkyboxBackground, Skylight, SortKey, SpotLight } from './chunk-LP56LS4S.mjs';
export { ANTIALIAS_FXAA, ANTIALIAS_MSAA, ANTIALIAS_NONE, ANTIALIAS_TAA, Atmosphere, BLOOM_DISABLED, BLOOM_ENABLED, BarrelDistortion, CAMERA_BLOOM_INTENSITY_MAX, CAMERA_BLOOM_INTENSITY_MIN, CAMERA_BLOOM_SCATTER_MAX, CAMERA_BLOOM_SCATTER_MIN, CAMERA_BLOOM_SOFT_KNEE_MAX, CAMERA_BLOOM_SOFT_KNEE_MIN, CAMERA_BLOOM_THRESHOLD_MAX, CAMERA_BLOOM_THRESHOLD_MIN, CAMERA_EXPOSURE_MODE_AUTO, CAMERA_EXPOSURE_MODE_MANUAL, CAMERA_PROJECTION_ORTHOGRAPHIC, CAMERA_PROJECTION_PERSPECTIVE, CAMERA_TEMPERATURE_MAX, CAMERA_TEMPERATURE_MIN, CAMERA_TINT_MAX, CAMERA_TINT_MIN, CLOUD_QUALITY_PROFILES, CUBE_CAMERA_FACE_ORDER, CUBE_CAMERA_UPDATE_CONTINUOUS, CUBE_CAMERA_UPDATE_ONCE, CUBE_CAMERA_UPDATE_ON_DEMAND, Camera, CameraError, CloudLayer, CloudLayerCacheInvalidError, CloudLayerCapabilityMissingError, CloudLayerInvalidParameterError, CloudLayerOwnerConflictError, CloudLayerResourceFailureError, CloudQualityValue, CubeCamera, DEFAULT_CLOUD_LAYER, DEFAULT_DEPTH_OF_FIELD_PARAMS, DEPTH_OF_FIELD_PARAMS_BYTE_SIZE, DepthOfField, DepthOfFieldQualityValue, DepthOfFieldSideValue, DepthOfFieldValidationError, DirectionalLight, DirectionalShadowFilterValue, DynamicResolution, Fog, Instances, Layer, LightProbe, Lines, MAX_VOLUMETRIC_FOG_OWNERS, MeshFilter, MeshRenderer, MotionBlur, PointLight, PointLightShadow, PointShapeValue, Points, PostProcessParams, REFLECTION_PROBE_UPDATE_CONTINUOUS, REFLECTION_PROBE_UPDATE_ONCE, REFLECTION_PROBE_UPDATE_ON_CHANGE, RectAreaLight, ReflectionProbe, SKYBOX_MODE_CUBEMAP, SceneInstance, ScreenSpaceReflection, SkyboxBackground, Skylight, SortKey, SpotLight, SunCardinalityError, TONEMAP_ACES_FILMIC, TONEMAP_AGX, TONEMAP_CINEON, TONEMAP_LINEAR, TONEMAP_NEUTRAL, TONEMAP_NONE, TONEMAP_REINHARD, TONEMAP_REINHARD_EXTENDED, Visibility, VisibilityStateValue, VolumetricFog, VolumetricFogSamplingValue, attachBarrelDistortionCameraFrame, buildCubeCameraFaceViews, cameraExposureFromColumns, cameraProjectionFromF32, cloudLayerSourceKey, cloudQualityFromF32, computeInvRangeSquared, createBarrelDistortionMapping, cubeCameraUpdateIntentFromF32, cubeCameraUpdateIntentToF32, degToCos, depthOfFieldQualityCode, depthOfFieldQualityFromF32, depthOfFieldRequestFailure, depthOfFieldSideCode, depthOfFieldSideFromF32, depthOfFieldTapCount, directionalShadowQualityFromF32, extractCloudLayer, extractVolumetricFog, freezeBarrelDistortionMapping, hasVolumetricFogCapability, mapDisplayToScene, mapDisplayUvToSceneUv, mapSceneToDisplay, mapSceneUvToDisplayUv, orthographic, packDepthOfFieldParams, perspective, pointShapeFromU32, projectMeshMaterialBindingObservation, reflectionProbeUpdateIntentFromF32, reflectionProbeUpdateIntentToF32, resolveDepthOfFieldParams, resolveIntegratedVolumeConsumer, resolveSelectedVolumetricLight, resolveVisibility, resolveVolumetricFogLightPair, selectCloudLayerFrame, signedDepthOfFieldCoC, summarizeMeshMaterialBindings, validateBarrelDistortionParameters, validateCameraBloom, validateCameraColorGrading, validateCameraExposure, validateCloudLayer, validateDepthOfFieldFrameParams, validateDepthOfFieldParams, validateDirection, validateDirectionalLightData, validateDynamicResolutionCamera, validateDynamicResolutionParameters, validateLightProbeData, validatePointLightData, validatePointLightShadowData, validateRectAreaLightData, validateSpotLightData, validateVolumetricFog, visibilityStateFromU32 } from './chunk-LP56LS4S.mjs';
import { SpriteAnimation, SpriteInstances, SpriteRegionOverride, TileLayer, Tilemap } from './chunk-X2KA6WHM.mjs';
export { getActiveCamera, setActiveCamera } from './chunk-X2KA6WHM.mjs';
export { DEFAULT_STANDARD_PROFILE, REFLECTION_PROBE_IBL_STAGES, SCENE_DATA_TEMPORAL_V1_DESCRIPTOR, SCENE_DATA_TEMPORAL_V1_SCHEMA, beginProbeIblUpdate, createIblKernelCache, createProbeIblOutput, createSceneDataCatalog, publishProbeIblOutput, resetIblKernelCaches } from './chunk-EQEJOMPI.mjs';
import { getTransparentSortConfig } from './chunk-GNJVHYWM.mjs';
export { MaterialAuthoringContractError, MaterialTransmissionContractError, Materials, srgb } from './chunk-GNJVHYWM.mjs';
import { renderTargetMaterialSourceIdentity } from './chunk-4IMMYRZV.mjs';
export { AtmosphereInvalidParameterError, AutoExposureCapabilityUnavailableError, AutoExposureInvalidParameterError, AutoExposureStageFailedError, AutoExposureStaleGenerationError, BarrelDistortionInvalidParameterError, DEFAULT_MOTION_BLUR_PARAMS, DynamicResolutionInvalidParameterError, DynamicResolutionRequiresTaaError, DynamicResolutionTimingUnavailableError, EnvironmentGenerationFailedError, EnvironmentSourceConflictError, FogCardinalityError, GpuDrivenPreparationError, InstanceTransformsError, MotionBlurValidationError, OwnerStageFailedError, RENDER_PHASE_CATALOG, RendererOperationError, SHADOW_ATLAS_DEFAULT_FACE_SIZE, SHADOW_ATLAS_DEFAULT_LAYERS, SceneDataUnavailableError, ShadowAtlas, TaaCapsInsufficientError, createAutoExposureError, createAutoExposureInspection, effectiveMotionBlurSampleCount, isMotionBlurIntervalValid, motionBlurExposureScale, motionBlurSampleDelta, motionBlurTemporalDemand, resolveMotionBlurParams, validateMotionBlurParams } from './chunk-4IMMYRZV.mjs';
import { validateCookedMaterialRecord } from '../../pack/dist/index.mjs';
import { ok, err, MATERIAL_TEXTURE_SLOTS } from '../../types/dist/index.mjs';
import { RuntimeMaterialValue, RuntimeMeshVertices, resolveAssetHandle } from '../../assets-runtime/dist/index.mjs';
import { Time } from '../../ecs/dist/index.mjs';
import { AssetGuid } from '../../pack/dist/guid.mjs';
import { ChildOf, Children, GlobalTransform } from '../../scene/dist/index.mjs';
import { VIDEO_SOURCE_PROVIDER_KEY, videoSourceExtent } from '../../graphics-extras/dist/index.mjs';

function invalid(guid, expected, reason) {
  return err({
    code: "asset-package-invalid",
    expected,
    hint: "recook the render asset and publish its complete cooked payload",
    detail: { guid, reason }
  });
}
function record(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function validMaterial(value) {
  if (!record(value) || value.kind !== "material") return false;
  if (value.cooked !== void 0 && !validateCookedMaterialRecord(value.cooked).ok) {
    return false;
  }
  if (value.passes !== void 0 && !Array.isArray(value.passes)) return false;
  if (value.parameters !== void 0 && !Array.isArray(value.parameters)) return false;
  if (value.parent !== void 0 && ["colorSpace", "passes", "parameters"].some((field) => Object.hasOwn(value, field))) {
    return false;
  }
  return value.values === void 0 || record(value.values);
}
function resolveMaterialWireRef(value, refs, field, guid) {
  if (typeof value !== "number") return ok(value);
  if (!Number.isSafeInteger(value) || value < 0 || refs[value] === void 0) {
    return err({
      code: "asset-package-invalid",
      expected: `${field} to reference a GUID through the material Pack refs[] table`,
      hint: "recook the material so every texture or sampler ref has a matching refs[] entry",
      detail: { guid, reason: `${field} refs[${value}] is out of bounds` }
    });
  }
  return ok(refs[value]);
}
function resolveMaterialWireRefs(value, refs, guid) {
  if (refs.length === 0) return ok(value);
  let changed = false;
  const wire = value;
  let parent = wire.parent;
  if (typeof parent === "number") {
    const resolved = resolveMaterialWireRef(parent, refs, "parent", guid);
    if (!resolved.ok) return resolved;
    parent = resolved.value;
    changed = true;
  }
  if (value.values === void 0) {
    if (!changed) return ok(value);
    if (parent !== void 0) {
      const child = value;
      return ok({ ...child, parent });
    }
    return ok(value);
  }
  const textureFields = new Set(
    value.parameters === void 0 ? MATERIAL_TEXTURE_SLOTS : value.parameters.filter((parameter) => parameter.type === "texture" || parameter.type === "texture_cube").map((parameter) => parameter.name)
  );
  const values = { ...value.values };
  for (const [field, raw] of Object.entries(values)) {
    if (typeof raw === "number" && textureFields.has(field)) {
      const resolved = resolveMaterialWireRef(raw, refs, field, guid);
      if (!resolved.ok) return resolved;
      values[field] = resolved.value;
      changed = true;
      continue;
    }
    if (!record(raw)) continue;
    const rawRecord = raw;
    let rewritten;
    for (const key of ["texture", "sampler"]) {
      if (!(key in rawRecord)) continue;
      const resolved = resolveMaterialWireRef(rawRecord[key], refs, `${field}.${key}`, guid);
      if (!resolved.ok) return resolved;
      if (resolved.value !== rawRecord[key]) {
        rewritten ??= { ...rawRecord };
        rewritten[key] = resolved.value;
        changed = true;
      }
    }
    if (rewritten !== void 0) {
      values[field] = rewritten;
    }
  }
  if (!changed) return ok(value);
  if (parent !== void 0) {
    const child = value;
    return ok({
      ...child,
      parent,
      values
    });
  }
  return ok({ ...value, values });
}
var materialContribution = {
  kind: { kind: "material" },
  consumer: "Render MaterialScene",
  decoder: {
    async decode({ envelope }) {
      if (!validMaterial(envelope.payload)) {
        return invalid(
          envelope.guid,
          "a material payload with cooked passes, parameters, and values",
          "material owner validation failed"
        );
      }
      return resolveMaterialWireRefs(envelope.payload, envelope.refs, envelope.guid);
    }
  }
};
var samplerContribution = {
  kind: { kind: "sampler" },
  consumer: "Render DeviceScope",
  decoder: {
    async decode({ envelope }) {
      return envelope.payload.kind === "sampler" ? ok(envelope.payload) : invalid(envelope.guid, "a sampler payload", "sampler owner validation failed");
    }
  }
};
var renderPipelineContribution = {
  kind: { kind: "render-pipeline" },
  consumer: "Render Pipeline",
  decoder: {
    async decode({ envelope }) {
      const payload = envelope.payload;
      return payload.kind === "render-pipeline" && payload.pipelineId.trim().length > 0 ? ok(payload) : invalid(
        envelope.guid,
        "a render-pipeline payload with a pipelineId",
        "render-pipeline owner validation failed"
      );
    }
  }
};

// src/examples/single-layer-medium-surface.ts
var SINGLE_LAYER_MEDIUM_SURFACE_EXAMPLE = {
  kind: "material",
  surface: {
    model: "single-layer-medium",
    module: "game::water_surface_a",
    dynamicInput: {
      name: "waterEvents",
      fields: [
        { name: "position", type: "vec3<f32>" },
        { name: "time", type: "f32" },
        { name: "eventId", type: "u32" }
      ],
      maxRecords: 64,
      maxDomains: 8,
      maxPageBytes: 2048,
      maxBindings: 1,
      maxEventsPerSample: 8
    }
  },
  passes: [
    {
      name: "color",
      program: { module: "forgeax::single-layer-medium" }
    }
  ],
  parameters: [],
  values: {}
};
var SINGLE_LAYER_MEDIUM_SURFACE_EXAMPLES = [
  {
    module: "game::water_surface_a",
    source: `#define_import_path game::water_surface_a
#import forgeax_material::single_layer_medium_surface_v1::{SingleLayerMediumSurfaceInput, SingleLayerMediumSurfaceData}
fn evaluate_surface(input : SingleLayerMediumSurfaceInput) -> SingleLayerMediumSurfaceData {
  let event = read_waterEvents(input.eventRangeStart);
  let normal = normalize(input.geometricNormalWS + vec3<f32>(0.0, 0.0, event.time * 0.02));
  return SingleLayerMediumSurfaceData(normal, 0.18, 1.0, 0.0, vec3<f32>(0.18, 0.06, 0.02), vec3<f32>(0.02, 0.04, 0.08), 1.333, 0.2, 1000.0);
}`
  },
  {
    module: "game::water_surface_b",
    source: `#define_import_path game::water_surface_b
#import forgeax_material::single_layer_medium_surface_v1::{SingleLayerMediumSurfaceInput, SingleLayerMediumSurfaceData}
fn evaluate_surface(input : SingleLayerMediumSurfaceInput) -> SingleLayerMediumSurfaceData {
  let event = read_waterEvents(input.eventRangeStart);
  let normal = normalize(input.geometricNormalWS + vec3<f32>(event.position.xy * 0.01, 0.0));
  return SingleLayerMediumSurfaceData(normal, 0.32, 1.0, clamp(event.time * 0.1, 0.0, 1.0), vec3<f32>(0.04, 0.02, 0.01), vec3<f32>(0.08, 0.05, 0.02), 1.333, -0.1, 800.0);
}`
  }
];

// src/plugin.ts
var RENDER_COMPONENTS = [
  Atmosphere,
  BarrelDistortion,
  Camera,
  CloudLayer,
  DirectionalLight,
  DynamicResolution,
  DepthOfField,
  Instances,
  Layer,
  LightProbe,
  MeshFilter,
  MeshRenderer,
  MotionBlur,
  PointLight,
  PointLightShadow,
  Points,
  Lines,
  PostProcessParams,
  RectAreaLight,
  SceneInstance,
  SkyboxBackground,
  Skylight,
  SortKey,
  SpotLight,
  SpriteAnimation,
  SpriteInstances,
  SpriteRegionOverride,
  TileLayer,
  Tilemap,
  Visibility
];
function registerRenderComponents(world) {
  const leases = RENDER_COMPONENTS.map(
    (component) => world.components.register(component).unwrap()
  );
  return () => {
    for (let index = leases.length - 1; index >= 0; index -= 1) leases[index]?.dispose();
  };
}
function renderComponentsPlugin() {
  return {
    name: "render-components",
    inject: ["world"],
    apply(ctx) {
      ctx.effect(() => registerRenderComponents(ctx.world), "render/components");
    }
  };
}
function publicationVideoFrames(world, consumers) {
  if (consumers.size === 0 || !world.hasResource(VIDEO_SOURCE_PROVIDER_KEY)) return [];
  const provider = world.getResource(VIDEO_SOURCE_PROVIDER_KEY);
  const frames = [];
  try {
    for (const [entity, clips] of consumers)
      for (const clip of clips) {
        const source = provider.getSource(
          entity,
          clip
        );
        if (source === void 0 || videoSourceExtent(source) === void 0) continue;
        frames.push({ entity, clip, frame: new VideoFrame(source) });
      }
    return frames;
  } catch (cause) {
    for (const row of frames) row.frame.close();
    throw cause;
  }
}

// src/publication/publisher.ts
function createRenderPublisher(world, assets, identity, capabilities, features = [], targetOwner) {
  const pendingMeshContent = /* @__PURE__ */ new Set();
  const releaseTransforms = registerRenderSourceSystems(world, assets, {
    updateMesh: (handle) => pendingMeshContent.add(handle)
  });
  const source = createRenderSourceState(world);
  const transforms = createGlobalTransformChangeQuery(world);
  const caches = /* @__PURE__ */ new WeakMap();
  const members = /* @__PURE__ */ new Set();
  const publishedPrograms = /* @__PURE__ */ new Set();
  const dependencies = /* @__PURE__ */ new Map();
  const consumers = /* @__PURE__ */ new Map();
  const pending = /* @__PURE__ */ new Set();
  let videoConsumers = /* @__PURE__ */ new Map();
  const flights = /* @__PURE__ */ new Map();
  const jointsByEntity = /* @__PURE__ */ new Map();
  const skinConsumers = /* @__PURE__ */ new Map();
  let frameDependencies = /* @__PURE__ */ new Set();
  let catalogEpoch = -1, revision = 0, disposed = false, active = false;
  let lastScannedRows = 0, allocations = 0;
  let storage = [new ArrayBuffer(0), new ArrayBuffer(0), new ArrayBuffer(0), new ArrayBuffer(0)];
  const spareStorage = [];
  const buffer = (index, bytes) => {
    let value = storage[index];
    if (value.byteLength < bytes) {
      let capacity = Math.max(16, value.byteLength);
      while (capacity < bytes) capacity *= 2;
      value = new ArrayBuffer(capacity);
      storage[index] = value;
      allocations++;
    }
    return value;
  };
  const fail = (reason, subject) => err(new RenderPublicationError({ reason, subject }));
  return {
    identity,
    inspect: () => ({
      revision,
      members: members.size,
      assetCount: consumers.size,
      scannedRows: lastScannedRows,
      inFlight: flights.size > 0,
      inFlightCount: flights.size,
      allocations
    }),
    prepare(sampleTimeSeconds, temporalReset = false) {
      if (disposed) return fail("disposed", "publisher");
      if (active || flights.size === 2)
        return fail("in-flight", "both publication slots are occupied");
      const baseline = revision === 0;
      const featureSources = [...features];
      const batch = source.projection.read();
      lastScannedRows = batch.scannedRows;
      const changed = new Set(pending), removed = /* @__PURE__ */ new Set();
      const invalidated = new Set(pendingMeshContent);
      const runtimeChanged = batch.membershipChanged || batch.changedComponents.includes(RuntimeMaterialValue) || batch.changedComponents.includes(RuntimeMeshVertices);
      for (const index of batch.indices) {
        const previous = source.entities.get(index), current = source.projection.entity(index);
        if (previous !== void 0 && members.has(previous) && (current !== previous || !isRenderableMember(world, previous)))
          removed.add(previous);
        if (runtimeChanged) {
          for (const handle of source.contentHandles.get(index) ?? [])
            invalidated.add(handle);
          if (current !== void 0) {
            if (world.hasComponent(current, RuntimeMaterialValue))
              invalidated.add(world.get(current, RuntimeMaterialValue).unwrap().asset);
            if (world.hasComponent(current, RuntimeMeshVertices))
              invalidated.add(world.get(current, RuntimeMeshVertices).unwrap().asset);
          }
        }
        if (previous !== void 0)
          for (const consumer of skinConsumers.get(previous) ?? []) changed.add(consumer);
        if (current === void 0) continue;
        if (isRenderableMember(world, current) && (baseline || !members.has(current) || RENDERABLE_SOURCE_COMPONENTS.some(
          (component) => source.projection.changed(current, component)
        )))
          changed.add(current);
        if (batch.membershipChanged || source.projection.changed(current, ChildOf) || source.projection.changed(current, Visibility)) {
          const queue = [current], visited = /* @__PURE__ */ new Set();
          while (queue.length) {
            const entity = queue.pop();
            if (visited.has(entity)) continue;
            visited.add(entity);
            if (isRenderableMember(world, entity)) changed.add(entity);
            if (world.hasComponent(entity, Children))
              queue.push(
                ...Array.from(
                  world.get(entity, Children).unwrap().entities,
                  (child) => child
                )
              );
          }
        }
      }
      if (baseline || catalogEpoch !== assets.catalogEpoch) {
        for (const entity of members) changed.add(entity);
        for (const entity of source.entities.values())
          if (isRenderableMember(world, entity)) changed.add(entity);
      }
      for (const handle of invalidated)
        for (const entity of consumers.get(handle) ?? []) changed.add(entity);
      const matrixRows = /* @__PURE__ */ new Map();
      for (const span of transforms.spans().unwrap()) {
        const values = span.get(GlobalTransform).world;
        for (let row = 0; row < span.entities.length; row++) {
          const entity = span.entities[row];
          for (const consumer of skinConsumers.get(entity) ?? []) changed.add(consumer);
          if (members.has(entity) && !removed.has(entity)) {
            matrixRows.set(entity, values.subarray(row * 16, row * 16 + 16));
            pending.add(entity);
          }
        }
      }
      for (const entity of changed) pending.add(entity);
      let videoFrames = [];
      try {
        const frame = extractFrames(
          [world],
          { cameraOwner: 0, resourceOwner: 0 },
          assets,
          void 0,
          caches,
          {
            ...capabilities === void 0 ? {} : renderMaterialContext(capabilities),
            cull: "none",
            retainHidden: true,
            renderables: changed.size ? { kind: "partial", entitiesByWorld: [changed] } : "none"
          }
        );
        const templates = [], templateIds = /* @__PURE__ */ new Map();
        const upserts = [];
        const programs = /* @__PURE__ */ new Map();
        const nextDependencies = /* @__PURE__ */ new Map();
        const assetRows = /* @__PURE__ */ new Map();
        const byRenderable = /* @__PURE__ */ new Map();
        for (const { entityIndex: _entity, renderableIndex, ...dispatch } of frame.dispatch) {
          const rows = byRenderable.get(renderableIndex) ?? [];
          rows.push(dispatch);
          byRenderable.set(renderableIndex, rows);
        }
        const publishPrograms = (materials) => {
          for (const material of materials) {
            const keys = /* @__PURE__ */ new Set([
              ...Object.values(material.materialProgramKeys ?? {}),
              ...Object.values(material.materialSceneIndexProgramKeys ?? {}).map(
                (program) => program.specializationKey
              ),
              ...material.materialShaderId === void 0 || material.materialShaderId.startsWith("forgeax::") ? [] : [material.materialShaderId]
            ]);
            for (const key of keys) {
              if (publishedPrograms.has(key) || programs.has(key)) continue;
              const shader = assets.shaderRegistry.findMaterialArtifact(key);
              if (!shader.ok) throw shader.error;
              const artifact = assets.getMaterialArtifact(key);
              programs.set(key, {
                key,
                shader: {
                  source: shader.value.source,
                  paramSchema: shader.value.paramSchema,
                  ...shader.value.receipt === void 0 ? {} : { receipt: shader.value.receipt }
                },
                ...artifact === void 0 ? {} : { artifact }
              });
            }
          }
        };
        for (let i = 0; i < frame.renderables.length; i++) {
          const row = frame.renderables[i];
          if (row.skin) return fail("unsupported", "source GPU skin receipt");
          const { worldId: _world, entityKey, transform, ...snapshot } = row;
          const template = { snapshot, dispatch: byRenderable.get(i) ?? [] };
          const key = JSON.stringify(
            template,
            (_key, value) => value instanceof Map ? _key === "textureSources" ? [...value].map(([name, source2]) => [
              name,
              renderTargetMaterialSourceIdentity(source2)
            ]) : [...value] : ArrayBuffer.isView(value) ? Array.from(value) : value
          );
          let templateId = templateIds.get(key);
          if (templateId === void 0) {
            templateId = templates.length;
            templateIds.set(key, templateId);
            templates.push(template);
          }
          upserts.push(entityKey, templateId);
          matrixRows.set(entityKey, transform.world);
          publishPrograms(row.materials);
          const handles = publicationDependencies(row);
          for (const lod of row.lods ?? []) {
            const handle = internSharedRefFromGuid(
              world,
              assets,
              AssetGuid.format(lod.mesh),
              "MeshAsset"
            );
            if (handle !== void 0) handles.push(handle);
          }
          nextDependencies.set(entityKey, handles);
          for (const handle of handles) {
            if (!baseline && (consumers.has(handle) || frameDependencies.has(handle)) && !invalidated.has(handle) && catalogEpoch === assets.catalogEpoch)
              continue;
            const value = resolveAssetHandle(world, handle);
            if (!value.ok) throw value.error;
            assetRows.set(handle, value.value);
          }
        }
        const featureRows = featureSources.map((feature) => {
          const data = feature.extract({
            worlds: [world],
            owner: 0,
            frameNumber: revision + 1,
            ...capabilities === void 0 ? {} : { caps: capabilities },
            ...frame.cameras[0] === void 0 ? {} : { selectedCamera: frame.cameras[0] },
            visibilitySnapshots: frame.featureVisibilitySnapshots,
            ...frame.cloudLayer === void 0 ? {} : { frame: { cloudLayer: frame.cloudLayer } }
          }).unwrap();
          return { identity: feature.identity, data };
        });
        const nextFrameDependencies = new Set(publicationFrameDependencies(frame));
        const pendingGuids = featureSources.flatMap((feature) => {
          const row = featureRows.find((row2) => row2.identity === feature.identity);
          return row === void 0 ? [] : [...feature.assetDependencies?.(row.data) ?? []];
        });
        const seenGuids = /* @__PURE__ */ new Set();
        for (const guid of pendingGuids) {
          const key = guid.toLowerCase();
          if (seenGuids.has(key)) continue;
          seenGuids.add(key);
          const asset = assets.lookup(key);
          const handle = internSharedRefFromGuid(
            world,
            assets,
            key,
            asset?.kind === "material" ? "MaterialAsset" : asset?.kind === "mesh" ? "MeshAsset" : "RenderFeatureAsset"
          );
          if (asset === void 0 || handle === void 0)
            throw new Error(`Missing feature asset ${guid}`);
          nextFrameDependencies.add(handle);
          for (const ref of assets.assetCatalog.get(key)?.refs ?? []) pendingGuids.push(ref.guid);
          if (asset.kind === "material") {
            const material = resolveMaterialSnapshot(
              handle,
              world,
              assets,
              void 0,
              void 0,
              capabilities === void 0 ? void 0 : renderMaterialContext(capabilities).materialContext
            );
            publishPrograms([material]);
            for (const dependency of publicationDependencies({
              assetHandle: handle,
              materials: [material]
            }))
              nextFrameDependencies.add(dependency);
          }
        }
        for (const handle of nextFrameDependencies) {
          if (!baseline && (consumers.has(handle) || frameDependencies.has(handle)) && !invalidated.has(handle) && catalogEpoch === assets.catalogEpoch)
            continue;
          const value = resolveAssetHandle(world, handle);
          if (!value.ok) throw value.error;
          assetRows.set(handle, value.value);
        }
        const emitted = new Set(frame.renderables.map((row) => row.entityKey));
        for (const entity of changed)
          if (members.has(entity) && !emitted.has(entity)) removed.add(entity);
        for (const entity of removed) matrixRows.delete(entity);
        const nextVideoConsumers = new Map(videoConsumers);
        for (const entity of removed) nextVideoConsumers.delete(entity);
        for (const row of frame.renderables) {
          const clips = [
            ...new Set(
              row.materials.flatMap((material) => [
                ...material.videoTextureFields?.values() ?? []
              ])
            )
          ];
          if (clips.length > 0) nextVideoConsumers.set(row.entityKey, clips);
          else nextVideoConsumers.delete(row.entityKey);
        }
        videoFrames = publicationVideoFrames(world, nextVideoConsumers);
        const transformEntities = new Uint32Array(
          buffer(2, matrixRows.size * 4),
          0,
          matrixRows.size
        ), matrices = new Float32Array(buffer(3, matrixRows.size * 64), 0, matrixRows.size * 16);
        let index = 0;
        for (const [entity, matrix] of matrixRows) {
          transformEntities[index] = entity;
          matrices.set(matrix, index * 16);
          index++;
        }
        const {
          renderables: _rows,
          dispatch: _dispatch,
          visibilitySnapshots: _visibility,
          featureVisibilitySnapshots: _features,
          hiddenEntityReports: _hidden,
          shadowCasterEntityKeys: _casters,
          shadowCasterDrawKeys: _draws,
          shadowCasterMembership: _membership,
          ...metadata
        } = frame;
        const retired = /* @__PURE__ */ new Set();
        const removedConsumers = /* @__PURE__ */ new Set([...removed, ...nextDependencies.keys()]);
        const nextHandles = new Set([...nextDependencies.values()].flat());
        const removedCounts = /* @__PURE__ */ new Map();
        for (const entity of removedConsumers)
          for (const handle of dependencies.get(entity) ?? [])
            removedCounts.set(handle, (removedCounts.get(handle) ?? 0) + 1);
        for (const [handle, count] of removedCounts)
          if (count === consumers.get(handle)?.size && !nextHandles.has(handle) && !nextFrameDependencies.has(handle))
            retired.add(handle);
        for (const handle of frameDependencies) {
          if (!nextFrameDependencies.has(handle) && !nextHandles.has(handle) && (consumers.get(handle)?.size ?? 0) === (removedCounts.get(handle) ?? 0))
            retired.add(handle);
        }
        const upsertColumn = new Uint32Array(buffer(0, upserts.length * 4), 0, upserts.length);
        upsertColumn.set(upserts);
        const removedColumn = new Uint32Array(buffer(1, removed.size * 4), 0, removed.size);
        removedColumn.set([...removed]);
        const packet = {
          ...identity,
          revision: revision + 1,
          base: revision,
          baseline,
          time: { ...world.getResource(Time) },
          sampleTimeSeconds,
          temporalReset,
          transparentSort: getTransparentSortConfig(world),
          metadata,
          templates,
          videoFrames,
          targets: targetOwner?.snapshot() ?? [],
          targetSources: publicationTargetSources(templates),
          features: featureRows,
          programs: [...programs.values()],
          upserts: upsertColumn,
          removed: removedColumn,
          transformEntities,
          transforms: matrices,
          assets: [...assetRows].map(([handle, value]) => {
            const source2 = world.sharedRefs.resolve(handle);
            const guid = assets.guidOf(source2.ok ? source2.value : value);
            return { handle, value, ...guid === void 0 ? {} : { guid } };
          }),
          retiredAssets: [...retired],
          invalidatedAssets: [...invalidated]
        };
        batch.validate();
        active = true;
        let closed = false;
        return ok({
          packet,
          accept: () => {
            if (closed)
              throw new RenderPublicationError({ reason: "revision", subject: "closed candidate" });
            batch.accept();
            for (const handle of invalidated) pendingMeshContent.delete(handle);
            for (const key of programs.keys()) publishedPrograms.add(key);
            closed = true;
            active = false;
            revision++;
            flights.set(revision, {
              features: featureRows,
              owners: featureSources,
              submitted: false
            });
            storage = spareStorage.pop() ?? [
              new ArrayBuffer(0),
              new ArrayBuffer(0),
              new ArrayBuffer(0),
              new ArrayBuffer(0)
            ];
            for (const row of videoFrames) row.frame.close();
            videoConsumers = nextVideoConsumers;
            frameDependencies = nextFrameDependencies;
            catalogEpoch = assets.catalogEpoch;
            for (const entity of removedConsumers) {
              for (const handle of dependencies.get(entity) ?? []) {
                consumers.get(handle)?.delete(entity);
                if (consumers.get(handle)?.size === 0) consumers.delete(handle);
              }
              dependencies.delete(entity);
            }
            for (const entity of removedConsumers) {
              for (const joint of jointsByEntity.get(entity) ?? []) {
                const users = skinConsumers.get(joint);
                users?.delete(entity);
                if (users?.size === 0) skinConsumers.delete(joint);
              }
              jointsByEntity.delete(entity);
            }
            for (const row of frame.renderables) {
              if (row.skinJointEntities === void 0) continue;
              jointsByEntity.set(row.entityKey, row.skinJointEntities);
              for (const joint of row.skinJointEntities) {
                let users = skinConsumers.get(joint);
                if (users === void 0) {
                  users = /* @__PURE__ */ new Set();
                  skinConsumers.set(joint, users);
                }
                users.add(row.entityKey);
              }
            }
            for (const entity of removed) members.delete(entity);
            for (const [entity, handles] of nextDependencies) {
              members.add(entity);
              dependencies.set(entity, handles);
              for (const handle of handles) {
                let users = consumers.get(handle);
                if (!users) {
                  users = /* @__PURE__ */ new Set();
                  consumers.set(handle, users);
                }
                users.add(entity);
              }
            }
            for (const entity of matrixRows.keys()) pending.delete(entity);
            for (const entity of removed) pending.delete(entity);
            for (const sourceIndex of batch.indices) {
              const entity = source.projection.entity(sourceIndex);
              if (entity === void 0) {
                source.entities.delete(sourceIndex);
                source.contentHandles.delete(sourceIndex);
              } else {
                source.entities.set(sourceIndex, entity);
                const handles = [];
                if (world.hasComponent(entity, RuntimeMaterialValue))
                  handles.push(world.get(entity, RuntimeMaterialValue).unwrap().asset);
                if (world.hasComponent(entity, RuntimeMeshVertices))
                  handles.push(world.get(entity, RuntimeMeshVertices).unwrap().asset);
                if (handles.length) source.contentHandles.set(sourceIndex, handles);
                else source.contentHandles.delete(sourceIndex);
              }
            }
          },
          discard: () => {
            if (!closed) {
              closed = true;
              active = false;
              for (const row of videoFrames) row.frame.close();
            }
          }
        });
      } catch (cause) {
        for (const row of videoFrames) row.frame.close();
        return fail("unsupported", cause instanceof Error ? cause.message : String(cause));
      }
    },
    acknowledgeFeatures(acceptedRevision, receipts) {
      if (disposed) return fail("disposed", "publisher");
      const flight = flights.get(acceptedRevision);
      if (flight === void 0 || flight.submitted)
        return fail("revision", "feature acknowledgment");
      const identities = /* @__PURE__ */ new Set();
      for (const receipt of receipts) {
        if (identities.has(receipt.identity))
          return fail("revision", "duplicate feature acknowledgment");
        const row = flight.features.find((row2) => row2.identity === receipt.identity);
        const feature = flight.owners.find((feature2) => feature2.identity === receipt.identity);
        if (row === void 0 || feature === void 0)
          return fail("shape", "unknown feature acknowledgment");
        identities.add(receipt.identity);
      }
      flight.submitted = true;
      for (const receipt of receipts) {
        const row = flight.features.find((row2) => row2.identity === receipt.identity);
        const feature = flight.owners.find((feature2) => feature2.identity === receipt.identity);
        feature?.onSourceFrameSubmitted?.(row?.data, receipt.feedback);
      }
      return ok(void 0);
    },
    recycle(acceptedRevision, buffers) {
      if (disposed) return fail("disposed", "publisher");
      if (flights.keys().next().value !== acceptedRevision)
        return fail("revision", "returned storage revision");
      if (buffers.length !== 4 || buffers.some((value) => !(value instanceof ArrayBuffer)))
        return fail("shape", "returned storage");
      if (active || storage.some((buffer2) => buffer2.byteLength > 0))
        spareStorage.push([...buffers]);
      else storage = [...buffers];
      flights.delete(acceptedRevision);
      return ok(void 0);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      releaseTransforms();
      members.clear();
      dependencies.clear();
      consumers.clear();
      pending.clear();
      pendingMeshContent.clear();
      videoConsumers.clear();
      flights.clear();
      spareStorage.length = 0;
      frameDependencies.clear();
      jointsByEntity.clear();
      skinConsumers.clear();
    }
  };
}

// src/scene/visibility/gpu-frame-timing.ts
var PROTOCOL = Object.freeze({
  firstMarker: "frame.first-pass",
  terminalMarker: "occlusion.resolve-copy",
  sameGraph: true,
  sameSubmit: true
});
function createGpuFrameTiming(input) {
  return { ...input, protocol: PROTOCOL, aborted: false, submitId: void 0 };
}
function recordGpuFrameTiming(timing, record2) {
  if (!record2.submitted) {
    timing.aborted = true;
    throw new Error("GPU frame timing requires a submitted frame");
  }
  if (timing.aborted) throw new Error("GPU frame timing cannot cross a failed submit");
  if (timing.submitId !== void 0 && timing.submitId !== record2.submitId) {
    throw new Error("GPU frame timing markers must share one submit");
  }
  if (!Number.isFinite(record2.firstPassTimestampNs) || !Number.isFinite(record2.occlusionResolveTimestampNs)) {
    throw new Error("GPU frame timing requires finite timestamps");
  }
  if (record2.occlusionResolveTimestampNs < record2.firstPassTimestampNs) {
    throw new Error("GPU frame timing terminal marker precedes first marker");
  }
  timing.submitId = record2.submitId;
  return Object.freeze({
    frameId: timing.frameId,
    deviceGeneration: timing.deviceGeneration,
    durationUs: (record2.occlusionResolveTimestampNs - record2.firstPassTimestampNs) / 1e3,
    protocol: PROTOCOL,
    graphGeneration: record2.graphGeneration,
    submitId: record2.submitId
  });
}
function nearestRank(values, percentile) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.max(0, Math.ceil(percentile * sorted.length) - 1)] ?? 0;
}
function summarizeGpuFrameTiming(samples) {
  const values = samples.map((sample) => sample.durationUs);
  return Object.freeze({
    medianUs: nearestRank(values, 0.5),
    p95Us: nearestRank(values, 0.95),
    samples: values.length
  });
}
function finiteColor(value) {
  return value.length === 3 && value.every(Number.isFinite);
}
function invalid2(field, expected) {
  return err({
    code: "ssr-composition-input-invalid",
    expected,
    hint: "preserve linear HDR and the bounded SSR confidence before composing",
    detail: Object.freeze({ field })
  });
}
function composeSsrReflection(input) {
  if (!Number.isFinite(input.c) || input.c < 0 || input.c > 1) {
    return invalid2("c", "a finite confidence in the inclusive range 0..1");
  }
  for (const [field, value] of [
    ["baseSpecular", input.baseSpecular],
    ["screenSpecular", input.screenSpecular],
    ["fallbackSpecular", input.fallbackSpecular]
  ]) {
    if (!finiteColor(value)) {
      return invalid2(field, "three finite linear HDR RGB channels");
    }
  }
  const c = input.c;
  return ok(
    Object.freeze([
      input.baseSpecular[0] + c * (input.screenSpecular[0] - input.fallbackSpecular[0]),
      input.baseSpecular[1] + c * (input.screenSpecular[1] - input.fallbackSpecular[1]),
      input.baseSpecular[2] + c * (input.screenSpecular[2] - input.fallbackSpecular[2])
    ])
  );
}

// src/transmission/oracle.ts
var clamp01 = (value) => Math.min(Math.max(value, 0), 1);
function fresnelReflectance(cosTheta, eta) {
  if (!Number.isFinite(cosTheta) || !Number.isFinite(eta) || eta <= 0) return 1;
  const cosIncident = clamp01(cosTheta);
  const sinTransmittedSquared = eta * eta * (1 - cosIncident * cosIncident);
  if (sinTransmittedSquared >= 1) return 1;
  const cosTransmitted = Math.sqrt(Math.max(0, 1 - sinTransmittedSquared));
  const perpendicularDenominator = cosIncident + eta * cosTransmitted;
  const parallelDenominator = eta * cosIncident + cosTransmitted;
  if (perpendicularDenominator === 0 || parallelDenominator === 0) return 1;
  const perpendicular = (cosIncident - eta * cosTransmitted) / perpendicularDenominator;
  const parallel = (eta * cosIncident - cosTransmitted) / parallelDenominator;
  return clamp01((perpendicular * perpendicular + parallel * parallel) / 2);
}

// src/transmission/single-layer-medium.ts
var DEFAULT_MAX_DISTANCE_METERS = 1e3;
var DEFAULT_DEPTH_TOLERANCE_METERS = 1e-3;
var DEFAULT_IOR = 1.333;
var finiteOr = (value, fallback) => Number.isFinite(value) ? value : fallback;
function oneMinusExpNeg(value) {
  const x = Math.max(finiteOr(value, 0), 0);
  if (x < 1e-3) {
    const x2 = x * x;
    return x * (1 - x * 0.5 + x2 / 6 - x * x2 / 24);
  }
  return -Math.expm1(-x);
}
function singleScatterIntegral(sigmaS, sigmaT, distance) {
  const scattering = Math.max(finiteOr(sigmaS, 0), 0);
  const extinction = Math.max(finiteOr(sigmaT, 0), 0);
  const path = Math.max(finiteOr(distance, 0), 0);
  if (extinction === 0) return scattering * path;
  return scattering * oneMinusExpNeg(extinction * path) / extinction;
}
var nonNegative = (value) => Math.max(finiteOr(value, 0), 0);
var clamp012 = (value) => Math.min(Math.max(finiteOr(value, 0), 0), 1);
function vector3(input) {
  return [nonNegative(input?.[0] ?? 0), nonNegative(input?.[1] ?? 0), nonNegative(input?.[2] ?? 0)];
}
function finiteColor2(input) {
  return input !== void 0 && input.length === 3 && input.every(Number.isFinite);
}
function finiteUv(input) {
  return input.length === 2 && input.every(Number.isFinite);
}
function safeDistance(value, maxDistance) {
  return Math.min(Math.max(finiteOr(value, 0), 0), maxDistance);
}
function integrateSingleLayerMedium(input) {
  const absorption = vector3(input.coefficients.absorption);
  const scattering = vector3(input.coefficients.scattering);
  const sigmaT = [
    absorption[0] + scattering[0],
    absorption[1] + scattering[1],
    absorption[2] + scattering[2]
  ];
  const maxDistanceMeters = Math.min(
    Math.max(
      finiteOr(input.maxDistanceMeters ?? DEFAULT_MAX_DISTANCE_METERS, DEFAULT_MAX_DISTANCE_METERS),
      0
    ),
    1e5
  );
  const distanceMeters = safeDistance(input.distanceMeters, maxDistanceMeters);
  const transmittance = [
    Number.isFinite(sigmaT[0]) && sigmaT[0] > 0 ? Math.exp(-sigmaT[0] * distanceMeters) : 1,
    Number.isFinite(sigmaT[1]) && sigmaT[1] > 0 ? Math.exp(-sigmaT[1] * distanceMeters) : 1,
    Number.isFinite(sigmaT[2]) && sigmaT[2] > 0 ? Math.exp(-sigmaT[2] * distanceMeters) : 1
  ];
  const singleScatter = [
    singleScatterIntegral(scattering[0], sigmaT[0], distanceMeters),
    singleScatterIntegral(scattering[1], sigmaT[1], distanceMeters),
    singleScatterIntegral(scattering[2], sigmaT[2], distanceMeters)
  ];
  const iorCandidate = finiteOr(input.coefficients.ior, DEFAULT_IOR);
  const ior = iorCandidate >= 1 ? iorCandidate : DEFAULT_IOR;
  const reflectance = fresnelReflectance(input.cosTheta, 1 / ior);
  const transmissionWeight = 1 - reflectance;
  const phaseG = Math.min(Math.max(finiteOr(input.coefficients.phaseG ?? 0, 0), -1), 1);
  const phaseCosTheta = clamp012(input.phaseCosTheta ?? input.cosTheta);
  const phaseDenominator = Math.max(1 + phaseG * phaseG - 2 * phaseG * phaseCosTheta, 1e-6);
  const phase = (1 - phaseG * phaseG) / (4 * Math.PI * phaseDenominator ** 1.5);
  return {
    sigmaT,
    transmittance,
    singleScatter,
    reflectance,
    transmissionWeight,
    phase: finiteOr(phase, 1 / (4 * Math.PI)),
    distanceMeters
  };
}
function composeSingleLayerMediumColor(input) {
  const coverage = clamp012(input.coverage ?? 1);
  const foam = clamp012(input.foam ?? 0) * coverage;
  const foamColor = finiteColor2(input.foamColor) ? input.foamColor : [1, 1, 1];
  const background = finiteColor2(input.background) ? input.background : [0, 0, 0];
  const reflection = finiteColor2(input.reflection) ? input.reflection : [0, 0, 0];
  const medium = [
    background[0] * input.optics.transmittance[0] + input.optics.singleScatter[0],
    background[1] * input.optics.transmittance[1] + input.optics.singleScatter[1],
    background[2] * input.optics.transmittance[2] + input.optics.singleScatter[2]
  ];
  const waterWeight = input.optics.transmissionWeight * coverage * (1 - foam);
  const reflectionWeight = input.optics.reflectance * coverage;
  const foamWeight = foam;
  return [
    finiteOr(
      reflection[0] * reflectionWeight + medium[0] * waterWeight + foamColor[0] * foamWeight,
      0
    ),
    finiteOr(
      reflection[1] * reflectionWeight + medium[1] * waterWeight + foamColor[1] * foamWeight,
      0
    ),
    finiteOr(
      reflection[2] * reflectionWeight + medium[2] * waterWeight + foamColor[2] * foamWeight,
      0
    )
  ];
}
function validCandidate(candidate, maxDistance) {
  return candidate !== void 0 && finiteColor2(candidate.color) && finiteUv(candidate.uv) && Number.isFinite(candidate.depthMeters) && candidate.depthMeters >= 0 && candidate.depthMeters <= maxDistance;
}
function resolveSingleLayerMediumBackground(input) {
  const maxDistance = Math.max(finiteOr(input.maxDistanceMeters, DEFAULT_MAX_DISTANCE_METERS), 0);
  const tolerance = Math.max(
    finiteOr(
      input.depthToleranceMeters ?? DEFAULT_DEPTH_TOLERANCE_METERS,
      DEFAULT_DEPTH_TOLERANCE_METERS
    ),
    0
  );
  const surfaceDepth = finiteOr(input.surfaceDepthMeters, 0);
  if (validCandidate(input.refracted, maxDistance) && input.refracted.uv.every((coordinate) => coordinate >= 0 && coordinate <= 1)) {
    if (input.refracted.depthMeters + tolerance < surfaceDepth) {
      return {
        source: "unrefracted",
        reason: "front",
        candidate: validCandidate(input.original, maxDistance) ? input.original : void 0,
        color: validCandidate(input.original, maxDistance) ? input.original.color : [0, 0, 0],
        distanceMeters: validCandidate(input.original, maxDistance) ? Math.max(input.original.depthMeters - surfaceDepth, 0) : 0
      };
    }
    return {
      source: "refracted",
      candidate: input.refracted,
      color: input.refracted.color,
      distanceMeters: Math.max(input.refracted.depthMeters - surfaceDepth, 0)
    };
  }
  if (validCandidate(input.original, maxDistance)) {
    const reason = input.refracted === void 0 ? "shore" : finiteUv(input.refracted.uv) && input.refracted.uv.some((coordinate) => coordinate < 0 || coordinate > 1) ? "edge" : "shore";
    return {
      source: "unrefracted",
      reason,
      candidate: input.original,
      color: input.original.color,
      distanceMeters: Math.max(input.original.depthMeters - surfaceDepth, 0)
    };
  }
  if (finiteColor2(input.environment)) {
    return {
      source: "environment",
      reason: "sky-miss",
      candidate: void 0,
      color: input.environment,
      distanceMeters: maxDistance
    };
  }
  return {
    source: "environment",
    reason: "sky-miss",
    candidate: void 0,
    color: [0, 0, 0],
    distanceMeters: maxDistance
  };
}
function estimateSingleLayerPathLength(input) {
  const maxDistance = Math.max(finiteOr(input.maxDistanceMeters, DEFAULT_MAX_DISTANCE_METERS), 0);
  if (input.surfacePosition.length !== 3 || input.backgroundPosition === void 0 || input.backgroundPosition.length !== 3 || !input.surfacePosition.every(Number.isFinite) || !input.backgroundPosition.every(Number.isFinite)) {
    return { distanceMeters: maxDistance, valid: false };
  }
  const distance = Math.hypot(
    (input.backgroundPosition[0] ?? 0) - (input.surfacePosition[0] ?? 0),
    (input.backgroundPosition[1] ?? 0) - (input.surfacePosition[1] ?? 0),
    (input.backgroundPosition[2] ?? 0) - (input.surfacePosition[2] ?? 0)
  );
  return {
    distanceMeters: Math.min(Math.max(finiteOr(distance, maxDistance), 0), maxDistance),
    valid: Number.isFinite(distance)
  };
}

export { SINGLE_LAYER_MEDIUM_SURFACE_EXAMPLE, SINGLE_LAYER_MEDIUM_SURFACE_EXAMPLES, composeSingleLayerMediumColor, composeSsrReflection, createGpuFrameTiming, createRenderPublisher, estimateSingleLayerPathLength, integrateSingleLayerMedium, materialContribution, recordGpuFrameTiming, renderComponentsPlugin, renderPipelineContribution, resolveSingleLayerMediumBackground, samplerContribution, summarizeGpuFrameTiming };
