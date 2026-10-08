import { DEFAULT_CLUSTER_GRID, DEFAULT_STANDARD_PROFILE, createIblKernelCache, STANDARD_PBR_UBO_SIZE, MATERIAL_PER_ENTITY_STRIDE, MAX_LIGHTS, CLUSTER_GRID_STRIDE_U32, LIGHT_INDEX_LIST_CAPACITY, createStandardClusterLayout } from './chunk-Z2BUHPZZ.mjs';
import { TRANSPARENT_SORT_MODE_LAYER_Z, TRANSPARENT_SORT_MODE_LAYER_Y, SPRITE_PREMULTIPLIED_ALPHA_BLEND } from './chunk-GNJVHYWM.mjs';
import { probeBlendRecordOffset, PROBE_BLEND_RECORD_BYTE_SIZE, PROBE_BLEND_RECORD_STRIDE } from './chunk-4QQOKCLH.mjs';
import { GPU_TEXTURE_USAGE_RENDER_ATTACHMENT, GPU_TEXTURE_USAGE_COPY_SRC, VertexColorVariantConflictError, GPU_SHADER_STAGE_COMPUTE, GPU_BUFFER_USAGE_STORAGE, GPU_BUFFER_USAGE_COPY_DST, GPU_BUFFER_USAGE_UNIFORM, createHdrpBindGroupLayoutDescriptor, EquirectProjectionFailedError, SHADOW_ATLAS_DEFAULT_LAYERS, COOKIE_MATRIX_BYTES, SHADOW_ATLAS_DEFAULT_FACE_SIZE, ShadowAtlas, PointShadowAtlasUninitializedError, PointShadowAtlasBoundsViolationError, IES_SLICE_WIDTH, IES_SLICE_HEIGHT, COOKIE_SLICE_SIZE, StandardClusterTransportUnavailableError, GPU_SHADER_STAGE_VERTEX, GPU_SHADER_STAGE_FRAGMENT, GPU_TEXTURE_USAGE_RENDER_ATTACHMENT_AND_TEXTURE_BINDING, GPU_TEXTURE_USAGE_COPY_DST, pipelineUsesProbeBlend, GPU_TEXTURE_USAGE_TEXTURE_BINDING, GPU_BUFFER_USAGE_INDEX, GPU_BUFFER_USAGE_VERTEX, isStandardPbrMaterialShader, worldEntityKey, instanceCollectionCacheKey, instanceUploadRangesForResident, createVisibilityBudget, GPU_BUFFER_USAGE_MAP_READ, getOpaqueResourceIdentity, pbrSkinMeshDynamicOffsets, gpuDrivenShadowDrawKey, SHADOW_CASTER_SHADER_ID, shadowCasterVariantSet, buildPbrMaterialUserRegionEntries, buildBindGroupLayoutDescriptor, STANDARD_OUTPUT_TRANSFORM_FEATURE_ID, GPU_BUFFER_USAGE_COPY_SRC, GPU_BUFFER_USAGE_INDIRECT, StandardLightBudgetExceededError, EXTENDED_LIGHTING_REQUIRED_SAMPLED_TEXTURES, gpuDrivenSourceDrawItemIndex, matchPass, deriveInstancesUnionBounds, createPbrSkinMeshBindGroupEntries, physicalTextureFields, isCanonicalStandardPbrMaterialShader, RendererOperationError, resolveRenderTargetMaterialSource, VideoUploadUnsupportedError, SPRITE_PASS_PER_INSTANCE_REGION_VARIANT_SET, StandardClusterIndexOverflowError, isStandardPbrSkinMaterialShader, SKIN_MATERIAL_SHADER_ID, FXAA_POST_PROCESS_ID, gpuDrivenDrawKey, materialBindGroupLayoutIdentity } from './chunk-OYW4NIWJ.mjs';
import { derive, ok, err as err$1, toShared, ASSET_ERROR_HINTS, deriveTextureLayout, handleSlot, resolveMaterialTextureCoordinates, KNOWN_PASS_KINDS } from '../../types/dist/index.mjs';
import { RenderGraphError } from '../../render-graph/dist/index.mjs';
import { ok as ok$1, err, RhiError } from '../../rhi/dist/index.mjs';
import { mat3, vec3, mat4, box3, frustum } from '../../math/dist/index.mjs';
import { deriveVertexLayoutProjection, DEFAULT_VERTEX_ATTRIBUTE_MAP, deriveVertexBufferLayout, deriveVertexBufferLayoutFromProjection } from '../../geometry/dist/index.mjs';
import { resolveAssetHandle } from '../../assets-runtime/dist/index.mjs';
import { probeVideoHighPerfUpload, VIDEO_SOURCE_PROVIDER_KEY, videoSourceExtent } from '../../graphics-extras/dist/index.mjs';
import { STANDARD_PIPELINE_PARAM_SCHEMA, GPU_DRIVEN_MATERIAL_ROW_BYTES, findVariantByKey, DEFAULT_MSDF_TEXT_PARAM_SCHEMA, DEFAULT_SPRITE_PARAM_SCHEMA, DEFAULT_UNLIT_PARAM_SCHEMA, STANDARD_PHYSICAL_TEXTURE_FIELDS, STANDARD_TEXTURE_MASK_OVERRIDE } from '../../shader/dist/index.mjs';
import { isCompressedFormat, bytesPerRow, blockParamsForFormat } from '../../codec/dist/index.mjs';

// src/pipeline/render-extent.ts
function renderExtentSize(extent, domain) {
  if (domain === "internal") {
    return { width: extent.internalWidth, height: extent.internalHeight };
  }
  return { width: extent.outputWidth, height: extent.outputHeight };
}
var MIN_SCALE = 0.5;
var MAX_SCALE = 1;
var SCALE_STEPS = 32;
var AXIS_ALIGNMENT = 8;
function alignedAxis(output, scale) {
  return Math.max(AXIS_ALIGNMENT, Math.floor(output * scale / AXIS_ALIGNMENT) * AXIS_ALIGNMENT);
}
function finiteDimension(value) {
  return Math.max(1, Math.floor(value));
}
function deriveRenderExtent(input) {
  const outputWidth = finiteDimension(input.outputWidth);
  const outputHeight = finiteDimension(input.outputHeight);
  const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, input.requestedScale));
  const scale = Math.round(clamped * SCALE_STEPS) / SCALE_STEPS;
  const nativeSurface = outputWidth < AXIS_ALIGNMENT || outputHeight < AXIS_ALIGNMENT;
  const internalWidth = nativeSurface ? outputWidth : alignedAxis(outputWidth, scale);
  const internalHeight = nativeSurface ? outputHeight : alignedAxis(outputHeight, scale);
  return Object.freeze({
    outputWidth,
    outputHeight,
    internalWidth,
    internalHeight,
    scale: nativeSurface ? 1 : scale,
    generation: input.generation
  });
}
function resolveOutputDither(config) {
  return config?.outputDither ?? true;
}
function createRenderPipelineTarget(graph, label, descriptor, viewDescriptor = {}) {
  const texture = graph.createTexture(label, descriptor);
  if (!texture.ok) return texture;
  const view = graph.view(texture.value, { label: `${label}.view`, ...viewDescriptor });
  if (!view.ok) return view;
  return ok({
    texture: texture.value,
    view: view.value,
    format: viewDescriptor.format ?? descriptor.format,
    sampleCount: descriptor.sampleCount === 4 ? 4 : 1,
    ...descriptor.domain === void 0 ? {} : { domain: descriptor.domain }
  });
}
function importRenderPipelineSurface(graph, topology) {
  const texture = graph.importTexture(
    "surface",
    {
      format: topology.surface.storageFormat,
      size: "surface",
      // The imported surface is the final encoded endpoint.  Keeping this
      // semantic fact on the graph resource lets detached inspection project
      // from the compiled graph instead of re-inferring it from format names.
      domain: "display-encoded",
      usage: GPU_TEXTURE_USAGE_RENDER_ATTACHMENT | (topology.surface.profile?.kind === "raw-only" ? 0 : GPU_TEXTURE_USAGE_COPY_SRC),
      viewFormats: [
        ...topology.surface.profile?.viewFormats ?? (topology.surface.storageFormat === topology.surface.viewFormat ? [] : [topology.surface.viewFormat])
      ]
    },
    (frame) => frame.currentTexture
  );
  if (!texture.ok) return texture;
  const display = topology.surface.profile?.hasDisplayEndpoint === false ? void 0 : graph.importView(
    texture.value,
    { label: "surface.display", format: topology.surface.viewFormat },
    (frame) => frame.view
  );
  if (display !== void 0 && !display.ok) return display;
  const storage = graph.importView(
    texture.value,
    { label: "surface.storage", format: topology.surface.storageFormat },
    (frame) => {
      if (topology.surface.storageFormat === topology.surface.viewFormat) return frame.view;
      const resolved = frame.runtime.device.createTextureView(frame.currentTexture, {
        format: topology.surface.storageFormat
      });
      if (!resolved.ok) throw resolved.error;
      return resolved.value;
    }
  );
  if (!storage.ok) return storage;
  return ok({
    ...display === void 0 ? {} : {
      display: {
        texture: texture.value,
        view: display.value,
        format: topology.surface.viewFormat,
        sampleCount: 1,
        domain: "display-encoded"
      }
    },
    storage: {
      texture: texture.value,
      view: storage.value,
      format: topology.surface.storageFormat,
      sampleCount: 1,
      domain: "display-encoded"
    }
  });
}
function renderPipelineCloudHistoryTargets(input) {
  const entries = [
    ["cloud-history-radiance-previous", input.previousRadiance],
    ["cloud-history-radiance-current", input.currentRadiance],
    ["cloud-history-transmittance-previous", input.previousTransmittance],
    ["cloud-history-transmittance-current", input.currentTransmittance],
    ["cloud-history-depth-previous", input.previousDepth],
    ["cloud-history-depth-current", input.currentDepth]
  ];
  return entries.map(([name, target]) => ({ name, kind: "scene-color", ...target }));
}
var STORAGE_BUFFER_MIN_REQUIRED = 4;
var BYTES_PER_DIRECT_LIGHT_SLOT = 80;
var DirectLightSlotKind = {
  POINT: 0,
  SPOT: 1,
  RECT_AREA: 2
};
var DIRECT_LIGHT_SLOT_METADATA_SENTINEL = 4294967295;
var DIRECT_LIGHT_SLOT_PROJECTOR_FLAG = 1073741824;
var DIRECT_LIGHT_SLOT_TILE_MASK = DIRECT_LIGHT_SLOT_PROJECTOR_FLAG - 1;
var DIRECT_LIGHT_SLOT_FLOAT_COUNT = BYTES_PER_DIRECT_LIGHT_SLOT / Float32Array.BYTES_PER_ELEMENT;
function directLightMetadata(value) {
  return value === void 0 ? DIRECT_LIGHT_SLOT_METADATA_SENTINEL : value >>> 0;
}
function packDirectLightSlot(snapshot, projectorSelected) {
  const out = new Float32Array(DIRECT_LIGHT_SLOT_FLOAT_COUNT);
  out[0] = snapshot.position[0] ?? 0;
  out[1] = snapshot.position[1] ?? 0;
  out[2] = snapshot.position[2] ?? 0;
  out[3] = snapshot.invRangeSquared;
  out[4] = snapshot.color[0] ?? 0;
  out[5] = snapshot.color[1] ?? 0;
  out[6] = snapshot.color[2] ?? 0;
  if (snapshot.kind === "point") {
    out[7] = 1;
  } else if (snapshot.kind === "spot") {
    out[7] = snapshot.cosInner;
    out[8] = snapshot.direction[0] ?? 0;
    out[9] = snapshot.direction[1] ?? 0;
    out[10] = snapshot.direction[2] ?? 0;
    out[11] = snapshot.cosOuter;
    out[12] = snapshot.depthBias ?? 5e-3;
    out[13] = snapshot.normalBias ?? 0.05;
    out[14] = snapshot.shadowIntensity ?? 1;
    out[15] = snapshot.rollDeg ?? 0;
  } else {
    out[7] = snapshot.halfWidth;
    out[8] = snapshot.axisY[0] ?? 0;
    out[9] = snapshot.axisY[1] ?? 0;
    out[10] = snapshot.axisY[2] ?? 0;
    out[11] = snapshot.halfHeight;
    out[12] = snapshot.axisX[0] ?? 0;
    out[13] = snapshot.axisX[1] ?? 0;
    out[14] = snapshot.axisX[2] ?? 0;
  }
  const metadata = new Uint32Array(out.buffer);
  metadata[16] = snapshot.kind === "point" ? DirectLightSlotKind.POINT : snapshot.kind === "spot" ? DirectLightSlotKind.SPOT : DirectLightSlotKind.RECT_AREA;
  const spotProjectorSelected = snapshot.kind === "spot" && (projectorSelected ?? (snapshot.projectorAsset !== void 0 && snapshot.lightViewProj !== void 0));
  const spotShadowMetadata = snapshot.kind === "spot" ? spotProjectorSelected ? DIRECT_LIGHT_SLOT_PROJECTOR_FLAG | (snapshot.shadowAtlasTile >= 0 ? snapshot.shadowAtlasTile : 0) & DIRECT_LIGHT_SLOT_TILE_MASK : directLightMetadata(snapshot.shadowAtlasTile) : void 0;
  metadata[17] = directLightMetadata(
    snapshot.kind === "point" ? snapshot.shadowAtlasLayer : snapshot.kind === "spot" ? spotShadowMetadata : void 0
  );
  metadata[18] = directLightMetadata(snapshot.iesProfileSlice);
  metadata[19] = directLightMetadata(
    spotProjectorSelected && snapshot.kind === "spot" ? snapshot.projectorSlice : snapshot.cookieSlice
  );
  return out;
}
function assertStorageBufferCap(cap) {
  if (cap >= STORAGE_BUFFER_MIN_REQUIRED) {
    return ok$1(true);
  }
  if (cap === 0) {
    return ok$1(false);
  }
  return err(
    new RhiError({
      code: "limit-exceeded",
      expected: `device.limits.maxStorageBuffersPerShaderStage >= ${STORAGE_BUFFER_MIN_REQUIRED}, or exactly 0 for the mesh-only fallback`,
      hint: `device.limits.maxStorageBuffersPerShaderStage = ${cap} < ${STORAGE_BUFFER_MIN_REQUIRED} and != 0. WebGPU spec default minimum is 8; this adapter cannot run the unified Cluster local-light path.`,
      detail: {
        maxStorageBufferBindingSize: cap,
        requestedBytes: STORAGE_BUFFER_MIN_REQUIRED
      }
    })
  );
}
var DEFERRED_COLOR_FORMATS = [
  "rgba16float",
  "r32uint",
  "r32uint",
  "r32uint",
  "r32uint"
];
function colorFormatsForPassKind(passKind, defaultColorFormat) {
  if (passKindPolicyTable[passKind]?.shape === "depth-only") return [];
  if (passKind === "deferred") return DEFERRED_COLOR_FORMATS;
  return [defaultColorFormat];
}
var PipelineSpecError = class extends Error {
  code;
  /**
   * Narrowed detail payload — shape depends on `code`.
   *
   * - `'spec-inconsistent'`: `{ reason: string }`
   * - `'unknown-pass-kind'`: `{ expected: readonly string[]; actual: string; hint?: string }`
   * - `'shader-bgl-reflection-mismatch'`: `{ reflected: unknown; declared: unknown }`
   * - `'attachment-format-incompatible'`: `{ reason: string; expected?: string; actual?: string }`
   * - `'unsupported-vertex-layout'`: `{ specAttrs: string[]; shaderAttrs: string[] }`
   * - `'pipeline-build-failed'`: `{ gpuMessage?: string; cause?: unknown }`
   * - `'shader-not-registered'`: `{ shaderId: string; hint?: string }`
   */
  detail;
  constructor(args) {
    super(
      args.hint !== void 0 ? `PipelineSpecError [${args.code}]: ${args.hint}` : `PipelineSpecError [${args.code}]`
    );
    this.name = "PipelineSpecError";
    this.code = args.code;
    this.detail = args.detail;
  }
};
var RENDER_STATE_HASH_CACHE = /* @__PURE__ */ new WeakMap();
function renderStateHash(renderState) {
  if (renderState === void 0) return "";
  const cached = RENDER_STATE_HASH_CACHE.get(renderState);
  if (cached !== void 0) return cached;
  const sorted = Object.keys(renderState).sort();
  if (sorted.length === 0) {
    RENDER_STATE_HASH_CACHE.set(renderState, "");
    return "";
  }
  const payload = {};
  for (const k of sorted) {
    const v = renderState[k];
    if (v !== void 0) payload[k] = v;
  }
  const result = `:${JSON.stringify(payload)}`;
  RENDER_STATE_HASH_CACHE.set(renderState, result);
  return result;
}
function cacheKeyOf(spec) {
  const { shader, attachments, geometry, renderState } = spec;
  const topoSegment = geometry.topology;
  const stripSegment = (topoSegment === "line-strip" || topoSegment === "triangle-strip") && geometry.stripIndexFormat !== void 0 ? `:${geometry.stripIndexFormat}` : "";
  const vlDigest = geometry.vertexLayoutProjection?.digest ?? deriveVertexLayoutProjection(geometry.vertexLayout).digest;
  const uvSetCountSegment = geometry.shaderUvSetCount !== void 0 ? `:uvsc${geometry.shaderUvSetCount}` : "";
  const vertexBuffersSegment = geometry.vertexBuffers === void 0 ? "" : `:vbs:${JSON.stringify(
    geometry.vertexBuffers.map((buffer) => ({
      arrayStride: buffer.arrayStride,
      stepMode: buffer.stepMode ?? "vertex",
      attributes: [...buffer.attributes].map((attribute) => ({
        shaderLocation: attribute.shaderLocation,
        offset: attribute.offset,
        format: attribute.format
      }))
    }))
  )}`;
  const variantSegment = shader.variantSet === void 0 ? "~" : shader.variantSet;
  return [
    shader.id,
    shader.passKind,
    variantSegment,
    attachments.colorFormats.join(","),
    attachments.depthFormat ?? "",
    String(attachments.sampleCount),
    topoSegment,
    stripSegment,
    `vl:${vlDigest}`,
    renderStateHash(renderState)
  ].join(":") + vertexBuffersSegment + uvSetCountSegment + (shader.fragmentConstants === void 0 ? "" : `:fragment-constants:${JSON.stringify(
    Object.entries(shader.fragmentConstants).sort(
      ([left], [right]) => left.localeCompare(right)
    )
  )}`) + (shader.vertexEntry === void 0 && shader.fragmentEntry === void 0 ? "" : `:entries:${JSON.stringify([shader.vertexEntry ?? null, shader.fragmentEntry ?? null])}`);
}
function variantSetFromVertexLayoutProjection(projection, authoredVariantSet) {
  const projected = projection.attributes.some((attribute) => attribute.key === "color");
  const axis = `VERTEX_COLOR_AVAILABLE=${projected ? "true" : "false"}`;
  if (authoredVariantSet === void 0) return ok(axis);
  if (projected && authoredVariantSet === "") return ok(authoredVariantSet);
  const authoredParts = authoredVariantSet.split("+");
  const authoredColorPart = authoredParts.find(
    (part) => part.startsWith("VERTEX_COLOR_AVAILABLE=")
  );
  if (authoredColorPart === void 0) {
    const parts2 = authoredParts.filter((part) => part.length > 0);
    parts2.push(axis);
    return ok(parts2.join("+"));
  }
  const authoredValue = authoredColorPart.slice("VERTEX_COLOR_AVAILABLE=".length);
  const authored = authoredValue === "true";
  if (authoredValue !== "true" && authoredValue !== "false" || authored !== projected) {
    return err$1(new VertexColorVariantConflictError(authoredValue, projected));
  }
  const parts = authoredParts.filter(
    (part) => part.length > 0 && !part.startsWith("VERTEX_COLOR_AVAILABLE=")
  );
  parts.push(axis);
  return ok(parts.join("+"));
}
function standardCapabilityVariantSet(clustered, storageBuffer, vertexColorAvailable) {
  return `CLUSTER_FORWARD_AVAILABLE=${clustered}+STORAGE_BUFFER_AVAILABLE=${storageBuffer}+VERTEX_COLOR_AVAILABLE=${vertexColorAvailable}`;
}
function standardTopologyVariantSet(topology, storageBuffer, vertexColorAvailable, probeBlendAvailable = false) {
  const capabilityVariantSet = standardCapabilityVariantSet(
    topology?.kind === "clustered",
    storageBuffer,
    vertexColorAvailable
  );
  if (!probeBlendAvailable || !storageBuffer) return capabilityVariantSet;
  return `${capabilityVariantSet}+PROBE_BLEND_AVAILABLE=true`;
}
function standardTopologyBindGroupReady(topology, clusterBindGroup) {
  return topology?.kind !== "clustered" || clusterBindGroup !== null && clusterBindGroup !== void 0;
}
function standardStorageVariantSet(storageBuffer, vertexColorAvailable) {
  if (storageBuffer && vertexColorAvailable) return "";
  return `STORAGE_BUFFER_AVAILABLE=${storageBuffer}+VERTEX_COLOR_AVAILABLE=${vertexColorAvailable}`;
}
function buildPipelineDescriptor(spec, modules) {
  const { attachments, geometry, renderState } = spec;
  const vertexBuffers = geometry.vertexBuffers ?? (geometry.vertexLayoutProjection === void 0 ? deriveVertexBufferLayout(geometry.vertexLayout, {
    ...geometry.shaderUvSetCount !== void 0 ? { shaderUvSetCount: geometry.shaderUvSetCount } : {}
  }) : deriveVertexBufferLayoutFromProjection(geometry.vertexLayoutProjection, {
    ...geometry.shaderUvSetCount !== void 0 ? { shaderUvSetCount: geometry.shaderUvSetCount } : {}
  }));
  const descriptor = {
    vertex: {
      module: modules.vertex,
      entryPoint: spec.shader.vertexEntry ?? modules.vertexEntryPoint ?? "vs_main",
      buffers: vertexBuffers
    }
  };
  if (attachments.colorFormats.length > 0) {
    descriptor.fragment = {
      module: modules.fragment,
      entryPoint: spec.shader.fragmentEntry ?? modules.fragmentEntryPoint ?? "fs_main",
      ...spec.shader.fragmentConstants === void 0 ? {} : { constants: spec.shader.fragmentConstants },
      targets: attachments.colorFormats.map((fmt) => {
        const target = { format: fmt };
        if (renderState?.blend !== void 0) {
          target.blend = renderState.blend;
        }
        return target;
      })
    };
  }
  if (modules.layout !== void 0) {
    descriptor.layout = modules.layout;
  }
  const primitive = {
    topology: geometry.topology,
    cullMode: renderState?.cullMode ?? "back",
    frontFace: renderState?.frontFace ?? "ccw"
  };
  if (geometry.topology.endsWith("strip") && geometry.stripIndexFormat !== void 0) {
    primitive.stripIndexFormat = geometry.stripIndexFormat;
  }
  descriptor.primitive = primitive;
  if (attachments.depthFormat !== void 0) {
    const ds = {
      format: attachments.depthFormat,
      depthWriteEnabled: renderState?.depthWriteEnabled ?? true,
      depthCompare: renderState?.depthCompare ?? "less"
    };
    if (renderState?.stencilReadMask !== void 0) {
      ds.stencilReadMask = renderState.stencilReadMask;
    }
    if (renderState?.stencilWriteMask !== void 0) {
      ds.stencilWriteMask = renderState.stencilWriteMask;
    }
    if (renderState?.stencil !== void 0) {
      ds.stencilFront = renderState.stencil;
      ds.stencilBack = renderState.stencil;
    }
    descriptor.depthStencil = ds;
  }
  if (attachments.sampleCount > 1) {
    descriptor.multisample = {
      count: attachments.sampleCount,
      ...renderState?.alphaToCoverageEnabled === true && { alphaToCoverageEnabled: true }
    };
  }
  return descriptor;
}
var passKindPolicyTable = {
  forward: {
    shape: "color-and-depth",
    defaultColorOps: {
      loadOp: "clear",
      storeOp: "store",
      clearValue: { r: 0, g: 0, b: 0, a: 1 }
    },
    defaultDepthOps: { loadOp: "clear", storeOp: "store", clearValue: 1 }
  },
  deferred: {
    shape: "color-and-depth",
    defaultColorOps: {
      loadOp: "clear",
      storeOp: "store",
      clearValue: { r: 0, g: 0, b: 0, a: 0 }
    },
    defaultDepthOps: { loadOp: "clear", storeOp: "store", clearValue: 1 }
  },
  temporal: {
    shape: "color-and-depth",
    defaultColorOps: {
      loadOp: "clear",
      storeOp: "store",
      clearValue: { r: 0, g: 0, b: -1, a: 1 }
    },
    defaultDepthOps: { loadOp: "clear", storeOp: "store", clearValue: 1 }
  },
  "shadow-caster": {
    shape: "depth-only",
    defaultColorOps: void 0,
    defaultDepthOps: { loadOp: "clear", storeOp: "store", clearValue: 1 }
  },
  "point-shadow-caster": {
    shape: "depth-only",
    defaultColorOps: void 0,
    defaultDepthOps: { loadOp: "clear", storeOp: "store", clearValue: 1 }
  },
  skybox: {
    shape: "color-only",
    defaultColorOps: {
      loadOp: "clear",
      storeOp: "store",
      clearValue: { r: 0, g: 0, b: 0, a: 1 }
    },
    defaultDepthOps: void 0
  },
  tonemap: {
    shape: "color-only",
    defaultColorOps: {
      loadOp: "clear",
      storeOp: "store",
      clearValue: { r: 0, g: 0, b: 0, a: 1 }
    },
    defaultDepthOps: void 0
  },
  "bloom-downsample": {
    shape: "color-only",
    defaultColorOps: {
      loadOp: "clear",
      storeOp: "store",
      clearValue: { r: 0, g: 0, b: 0, a: 1 }
    },
    defaultDepthOps: void 0
  },
  "bloom-upsample": {
    shape: "color-only",
    defaultColorOps: {
      loadOp: "clear",
      storeOp: "store",
      clearValue: { r: 0, g: 0, b: 0, a: 1 }
    },
    defaultDepthOps: void 0
  },
  "bloom-composite": {
    shape: "color-only",
    defaultColorOps: {
      loadOp: "load",
      storeOp: "store",
      clearValue: { r: 0, g: 0, b: 0, a: 1 }
    },
    defaultDepthOps: void 0
  },
  fxaa: {
    shape: "color-only",
    defaultColorOps: {
      loadOp: "clear",
      storeOp: "store",
      clearValue: { r: 0, g: 0, b: 0, a: 1 }
    },
    defaultDepthOps: void 0
  },
  "post-process": {
    shape: "color-only",
    defaultColorOps: {
      loadOp: "clear",
      storeOp: "store",
      clearValue: { r: 0, g: 0, b: 0, a: 1 }
    },
    defaultDepthOps: void 0
  }
};
function buildBeginRenderPassDescriptor(specAttachments, viewBindings, passKind, options) {
  const policy = passKindPolicyTable[passKind];
  if (policy === void 0) {
    throw new PipelineSpecError({
      code: "unknown-pass-kind",
      detail: { expected: Object.keys(passKindPolicyTable), actual: passKind },
      hint: `passKind '${passKind}' is not in passKindPolicyTable; register an attachment policy or pick an existing one (e.g. 'post-process' for fullscreen-quad passes)`
    });
  }
  const out = {};
  if (options?.label !== void 0) {
    out.label = options.label;
  }
  if (policy.shape === "depth-only") {
    out.colorAttachments = [];
  } else {
    const colorOps = policy.defaultColorOps;
    if (colorOps === void 0) {
      throw new PipelineSpecError({
        code: "spec-inconsistent",
        detail: {
          reason: "policy-shape-color-without-colorOps",
          actual: passKind
        },
        hint: `passKind '${passKind}' has shape='${policy.shape}' but no defaultColorOps; fix passKindPolicyTable entry`
      });
    }
    const loadOp = options?.colorLoadOp ?? colorOps.loadOp;
    const storeOp = options?.colorStoreOp ?? colorOps.storeOp;
    const clearValue = options?.clearColor ?? colorOps.clearValue;
    out.colorAttachments = viewBindings.colorViews.map((view, i) => {
      const slot = {
        view,
        loadOp,
        storeOp
      };
      const resolveTarget = viewBindings.resolveTargets?.[i];
      if (resolveTarget !== void 0) {
        slot.resolveTarget = resolveTarget;
      }
      if (loadOp === "clear" && clearValue !== void 0) {
        slot.clearValue = clearValue;
      }
      return slot;
    });
  }
  if (policy.shape !== "color-only" && policy.defaultDepthOps !== void 0) {
    const dOps = policy.defaultDepthOps;
    const depthLoadOp = options?.depthLoadOp ?? dOps.loadOp;
    const depthStoreOp = options?.depthStoreOp ?? dOps.storeOp;
    const ds = {
      view: viewBindings.depthView,
      depthLoadOp,
      depthStoreOp
    };
    if (depthLoadOp === "clear") {
      ds.depthClearValue = dOps.clearValue;
    }
    if (specAttachments.depthFormat === "depth24plus-stencil8") {
      ds.stencilClearValue = 0;
      ds.stencilLoadOp = "clear";
      ds.stencilStoreOp = "discard";
    }
    out.depthStencilAttachment = ds;
  }
  return out;
}
function validateSpec(spec) {
  if (spec.attachments.sampleCount === 4 && spec.attachments.colorFormats.length === 0) {
    return {
      ok: false,
      code: "spec-inconsistent",
      detail: { reason: "sample-count-format-incompatible" },
      hint: "sampleCount=4 requires at least one colorFormat; shadow-caster (depth-only) passes should use sampleCount=1"
    };
  }
  if (!KNOWN_PASS_KINDS.includes(spec.shader.passKind)) {
    return {
      ok: false,
      code: "unknown-pass-kind",
      detail: { expected: KNOWN_PASS_KINDS, actual: spec.shader.passKind },
      hint: `passKind '${spec.shader.passKind}' is not in KNOWN_PASS_KINDS; register custom pass kinds via ShaderCatalog`
    };
  }
  const depthOnly = passKindPolicyTable[spec.shader.passKind]?.shape === "depth-only";
  const depthRequired = !!spec.renderState?.depthCompare || depthOnly;
  if (!spec.attachments.depthFormat && depthRequired) {
    return {
      ok: false,
      code: "attachment-format-incompatible",
      detail: {
        reason: "depth-requirement-without-depth-format",
        expected: "depthFormat must be set when depth testing or a depth-only pass is requested",
        actual: `depthFormat=${String(spec.attachments.depthFormat)}, depthCompare=${spec.renderState?.depthCompare}`
      },
      hint: "set attachments.depthFormat (e.g. depth24plus-stencil8 or depth32float) when renderState specifies depthCompare"
    };
  }
  return { ok: true };
}
function getOrBuildPipeline(spec, deviceProvider, cache3, modules) {
  const key = cacheKeyOf(spec);
  const cached = cache3.get(key);
  if (cached !== void 0) return cached;
  const validation = validateSpec(spec);
  if (!validation.ok) {
    throw new PipelineSpecError({
      code: validation.code,
      detail: validation.detail,
      ...validation.hint !== void 0 ? { hint: validation.hint } : {}
    });
  }
  const descriptor = buildPipelineDescriptor(
    spec,
    modules ?? { vertex: void 0, fragment: void 0 }
  );
  const result = deviceProvider.createRenderPipeline(descriptor);
  if (!result.ok) {
    throw new PipelineSpecError({
      code: "pipeline-build-failed",
      detail: { cause: result.error },
      hint: "device.createRenderPipeline failed for spec; inspect gpuMessage on the error detail"
    });
  }
  cache3.set(key, result.value);
  return result.value;
}
var PROCEDURAL_ATTR_LAYOUT = DEFAULT_VERTEX_ATTRIBUTE_MAP;
var HDR_FORMAT = "rgba16float";
var DEPTH_DS = "depth24plus-stencil8";
var TRI_GEOMETRY = {
  topology: "triangle-list",
  stripIndexFormat: void 0,
  vertexLayout: PROCEDURAL_ATTR_LAYOUT
};
var TRI_GEOMETRY_PBR = {
  topology: "triangle-list",
  stripIndexFormat: void 0,
  vertexLayout: PROCEDURAL_ATTR_LAYOUT,
  shaderUvSetCount: 8
};
var STANDARD_BOOT_VARIANT_SET = standardCapabilityVariantSet(false, true, false);
function buildSpecConstTable(ldrViewFormat) {
  const TRI_ATTACHMENTS_LDR_S1 = {
    colorFormats: [ldrViewFormat],
    depthFormat: DEPTH_DS,
    sampleCount: 1
  };
  const TRI_ATTACHMENTS_LDR_S4 = {
    colorFormats: [ldrViewFormat],
    depthFormat: DEPTH_DS,
    sampleCount: 4
  };
  const TRI_ATTACHMENTS_HDR_S1 = {
    colorFormats: [HDR_FORMAT],
    depthFormat: DEPTH_DS,
    sampleCount: 1
  };
  const TRI_ATTACHMENTS_HDR_S4 = {
    colorFormats: [HDR_FORMAT],
    depthFormat: DEPTH_DS,
    sampleCount: 4
  };
  return [
    // unlit LDR S1
    {
      shader: { id: "forgeax::default-unlit", passKind: "forward", variantSet: void 0 },
      attachments: TRI_ATTACHMENTS_LDR_S1,
      geometry: TRI_GEOMETRY,
      renderState: void 0
    },
    // unlit LDR S4
    {
      shader: { id: "forgeax::default-unlit", passKind: "forward", variantSet: void 0 },
      attachments: TRI_ATTACHMENTS_LDR_S4,
      geometry: TRI_GEOMETRY,
      renderState: void 0
    },
    // unlit HDR S1
    {
      shader: { id: "forgeax::default-unlit", passKind: "forward", variantSet: void 0 },
      attachments: TRI_ATTACHMENTS_HDR_S1,
      geometry: TRI_GEOMETRY,
      renderState: void 0
    },
    // unlit HDR S4
    {
      shader: { id: "forgeax::default-unlit", passKind: "forward", variantSet: void 0 },
      attachments: TRI_ATTACHMENTS_HDR_S4,
      geometry: TRI_GEOMETRY,
      renderState: void 0
    },
    // standard LDR S1
    {
      shader: { id: "forgeax::default-standard-pbr", passKind: "forward", variantSet: void 0 },
      attachments: TRI_ATTACHMENTS_LDR_S1,
      geometry: TRI_GEOMETRY_PBR,
      renderState: void 0
    },
    // standard LDR S4
    {
      shader: { id: "forgeax::default-standard-pbr", passKind: "forward", variantSet: void 0 },
      attachments: TRI_ATTACHMENTS_LDR_S4,
      geometry: TRI_GEOMETRY_PBR,
      renderState: void 0
    },
    // standard HDR S1
    {
      shader: { id: "forgeax::default-standard-pbr", passKind: "forward", variantSet: void 0 },
      attachments: TRI_ATTACHMENTS_HDR_S1,
      geometry: TRI_GEOMETRY_PBR,
      renderState: void 0
    },
    // standard HDR S4
    {
      shader: { id: "forgeax::default-standard-pbr", passKind: "forward", variantSet: void 0 },
      attachments: TRI_ATTACHMENTS_HDR_S4,
      geometry: TRI_GEOMETRY_PBR,
      renderState: void 0
    },
    // ── M6 fix-up: non-clustered standard-pbr prewarm ─────────────────────────
    // The default record path (`getMaterialShaderPipeline`) requests
    // `variantSet=STANDARD_BOOT_VARIANT_SET` for standard-shading entities; pre-M6
    // the silent `selectStandardFallbackPipeline` shim served the no-variant
    // boot prewarm during the 1-frame async-compile warmup. With M6's
    // explicit-failure surface, those requests must hit the boot prewarm
    // by their own variantSet — these 4 entries close that gap.
    // standard PBR URP LDR S1
    {
      shader: {
        id: "forgeax::default-standard-pbr",
        passKind: "forward",
        variantSet: STANDARD_BOOT_VARIANT_SET
      },
      attachments: TRI_ATTACHMENTS_LDR_S1,
      geometry: TRI_GEOMETRY_PBR,
      renderState: void 0
    },
    // standard PBR URP LDR S4
    {
      shader: {
        id: "forgeax::default-standard-pbr",
        passKind: "forward",
        variantSet: STANDARD_BOOT_VARIANT_SET
      },
      attachments: TRI_ATTACHMENTS_LDR_S4,
      geometry: TRI_GEOMETRY_PBR,
      renderState: void 0
    },
    // standard PBR URP HDR S1
    {
      shader: {
        id: "forgeax::default-standard-pbr",
        passKind: "forward",
        variantSet: STANDARD_BOOT_VARIANT_SET
      },
      attachments: TRI_ATTACHMENTS_HDR_S1,
      geometry: TRI_GEOMETRY_PBR,
      renderState: void 0
    },
    // standard PBR URP HDR S4
    {
      shader: {
        id: "forgeax::default-standard-pbr",
        passKind: "forward",
        variantSet: STANDARD_BOOT_VARIANT_SET
      },
      attachments: TRI_ATTACHMENTS_HDR_S4,
      geometry: TRI_GEOMETRY_PBR,
      renderState: void 0
    },
    // feat-20260625-refactor-sprite-as-transparent-mesh M3 / w14 (AC-12 / D-7):
    // the four `forgeax::default-sprite` boot-time pre-warm entries (LDR S1
    // + LDR S4 + HDR S1 + HDR S4) are gone. Sprite PSO lands lazily through
    // the generic per-MaterialShader pipeline cache keyed on
    // `forgeax::sprite` + premultiplied-alpha renderState; SPEC_CONST_TABLE
    // shrinks from 19 to 15 entries (-4 boot-time PSOs).
    // ── M2-T4: fullscreen-post boot-time pre-warm (tonemap + skybox) ──────────
    //
    // Tonemap (LDR S1): fullscreen triangle writes to swap-chain LDR view format
    // (parameterised — `ldrViewFormat`; see buildSpecConstTable jsdoc + bug-20260615).
    // Skybox (HDR S1 + S4): fullscreen triangle writes to rgba16float; MSAA variant
    // has sampleCount=4. Both use empty vertexLayout (fullscreen triangle, no
    // attributes) and cullMode='none' (forward cull for fullscreen-quad passthrough).
    //
    // Shadow-probe / fxaa / Bloom 10-pass / SSAO 2-stage are lazy-build — not in
    // SPEC_CONST_TABLE (R-D4 decision: only entries that are always-present on
    // every boot).
    // tonemap LDR S1 (writes to runtime-resolved swap-chain LDR view format)
    {
      shader: { id: "forgeax::post::tonemap", passKind: "post-process", variantSet: void 0 },
      attachments: {
        colorFormats: [ldrViewFormat],
        depthFormat: void 0,
        sampleCount: 1
      },
      geometry: {
        topology: "triangle-list",
        stripIndexFormat: void 0,
        vertexLayout: {}
      },
      renderState: {
        cullMode: "none"
      }
    },
    // skybox HDR S1 (writes to rgba16float, no depth)
    {
      shader: { id: "forgeax::skybox::cube", passKind: "skybox", variantSet: void 0 },
      attachments: {
        colorFormats: [HDR_FORMAT],
        depthFormat: void 0,
        sampleCount: 1
      },
      geometry: {
        topology: "triangle-list",
        stripIndexFormat: void 0,
        vertexLayout: {}
      },
      renderState: {
        cullMode: "none"
      }
    },
    // skybox HDR S4 (MSAA variant)
    {
      shader: { id: "forgeax::skybox::cube", passKind: "skybox", variantSet: void 0 },
      attachments: {
        colorFormats: [HDR_FORMAT],
        depthFormat: void 0,
        sampleCount: 4
      },
      geometry: {
        topology: "triangle-list",
        stripIndexFormat: void 0,
        vertexLayout: {}
      },
      renderState: {
        cullMode: "none"
      }
    }
  ];
}
function buildLinearLdrMaterialSpecTable(ldrViewFormat) {
  return buildSpecConstTable(ldrViewFormat).filter(
    (spec) => spec.shader.passKind === "forward" && spec.attachments.colorFormats[0] === ldrViewFormat
  ).map((spec) => ({
    ...spec,
    attachments: {
      ...spec.attachments,
      colorFormats: [HDR_FORMAT]
    }
  }));
}
var MESH_PER_ENTITY_STRIDE = 256;
var MESH_SSBO_BYTES = 192;
var MESH_UBO_FULL_ARRAY_BYTES = 112 * 128;
var INSTANCE_UBO_FULL_ARRAY_BYTES = 80 * 128;
var MAX_UNIFORM_INSTANCES = 128;
var INSTANCE_STORAGE_STRIDE_FLOATS = 32;
function hasStableGenerationColumn(generations, count) {
  if (generations === void 0 || generations.length !== count) return false;
  const seen = /* @__PURE__ */ new Set();
  for (const generation of generations) {
    if (generation === 0 || seen.has(generation)) return false;
    seen.add(generation);
  }
  return true;
}
function packInstanceStorageBuffer(transforms, previousTransforms = transforms, generations, previousGenerations) {
  const count = Math.floor(transforms.length / 16);
  const out = new Float32Array(count * INSTANCE_STORAGE_STRIDE_FLOATS);
  const previousCount = Math.floor(previousTransforms.length / 16);
  const generationInput = generations !== void 0 || previousGenerations !== void 0;
  const identityProof = hasStableGenerationColumn(generations, count) && hasStableGenerationColumn(previousGenerations, previousCount);
  const previousIndexByGeneration = identityProof ? new Map(
    Array.from(previousGenerations ?? [], (generation, index) => [generation, index])
  ) : void 0;
  for (let i = 0; i < count; i++) {
    const sourceBase = i * 16;
    const targetBase = i * INSTANCE_STORAGE_STRIDE_FLOATS;
    const previousIndex = identityProof ? previousIndexByGeneration?.get(generations?.[i] ?? 0) : !generationInput && previousCount === count ? i : void 0;
    const sameIdentity = previousIndex !== void 0 && previousIndex < previousCount;
    const previousBase = (previousIndex ?? i) * 16;
    for (let k = 0; k < 16; k++) {
      const value = transforms[sourceBase + k] ?? 0;
      out[targetBase + k] = value;
      out[targetBase + 16 + k] = sameIdentity ? previousTransforms[previousBase + k] ?? value : value;
    }
  }
  return out;
}
function extractEntryResourceHandle(entry) {
  const v = entry.resource.value;
  if (typeof v === "object" && v !== null && "buffer" in v) {
    return v.buffer;
  }
  return v;
}
var BIND_GROUP_CHAIN_LEAF_KEY = {};
function getOrCreateFromChain(root, handles, variant, factory, counts) {
  let node = root;
  for (const h of handles) {
    let next = node.get(h);
    if (next === void 0) {
      next = /* @__PURE__ */ new WeakMap();
      node.set(h, next);
    }
    node = next;
  }
  let leaf = node.get(BIND_GROUP_CHAIN_LEAF_KEY);
  if (leaf === void 0) {
    leaf = /* @__PURE__ */ new Map();
    node.set(BIND_GROUP_CHAIN_LEAF_KEY, leaf);
  }
  const hit = leaf.get(variant);
  if (hit !== void 0) return hit;
  const bg = factory();
  counts.createBindGroup += 1;
  counts.keys.push(variant);
  leaf.set(variant, bg);
  return bg;
}
function getOrCreateFromChainResult(root, handles, variant, factory, counts) {
  let node = root;
  for (const h of handles) {
    let next = node.get(h);
    if (next === void 0) {
      next = /* @__PURE__ */ new WeakMap();
      node.set(h, next);
    }
    node = next;
  }
  let leaf = node.get(BIND_GROUP_CHAIN_LEAF_KEY);
  if (leaf === void 0) {
    leaf = /* @__PURE__ */ new Map();
    node.set(BIND_GROUP_CHAIN_LEAF_KEY, leaf);
  }
  const hit = leaf.get(variant);
  if (hit !== void 0) return ok(hit);
  const created = factory();
  if (!created.ok) return created;
  counts.createBindGroup += 1;
  counts.keys.push(variant);
  leaf.set(variant, created.value);
  return created;
}
function findFromChain(root, handles, variant) {
  let node = root;
  for (const handle of handles) {
    const next = node.get(handle);
    if (next === void 0) return void 0;
    node = next;
  }
  const leaf = node.get(BIND_GROUP_CHAIN_LEAF_KEY);
  return leaf?.get(variant);
}
function getOrCreatePerEntity(outerMap, outerKey, handles, variant, factory, counts) {
  let inner = outerMap.get(outerKey);
  if (inner === void 0) {
    inner = /* @__PURE__ */ new WeakMap();
    outerMap.set(outerKey, inner);
  }
  return getOrCreateFromChain(inner, handles, variant, factory, counts);
}
function cleanPerEntityCache(cache3, validatedEntityKeys) {
  for (const ek of cache3.keys()) {
    if (!validatedEntityKeys.has(ek)) {
      cache3.delete(ek);
    }
  }
}
function ensureMeshSsboCapacity(internals, neededSlots) {
  if (neededSlots <= 0) return { ok: true };
  const grow = internals.growMeshSsbo;
  if (grow === void 0) return { ok: true };
  const before = internals.meshSsboState?.slotCount ?? 0;
  if (before > 0 && before >= neededSlots) return { ok: true };
  const result = grow(neededSlots);
  if (!result.ok) return result;
  const after = internals.meshSsboState?.slotCount ?? before;
  if (after !== before) {
    if (meshSsboDevModeProbe()) {
      console.info(
        "[mesh-ssbo] grew slotCount: %d -> %d (requested=%d)",
        before,
        after,
        neededSlots
      );
    }
  }
  return result;
}
var meshSsboDevModeProbe = isMeshSsboDevMode;
function isMeshSsboDevMode() {
  const importMetaDev = import.meta.env?.DEV;
  if (importMetaDev) return true;
  const proc = globalThis.process;
  if (proc !== void 0 && proc.env?.NODE_ENV === "production") return false;
  if (proc === void 0) return false;
  return true;
}
var _meshSsboScratch = new Uint8Array(0);
var _meshSsboScratchFloats = new Float32Array(0);
function uploadMeshSsboBatch(queue, meshStorageBuffer, validatedOrdered, foldDispatchPlan, startSlot = 0) {
  const slotCount = validatedOrdered.length;
  const neededBytes = slotCount * MESH_PER_ENTITY_STRIDE;
  if (_meshSsboScratch.length < neededBytes) {
    _meshSsboScratch = new Uint8Array(neededBytes);
    _meshSsboScratchFloats = new Float32Array(_meshSsboScratch.buffer);
  } else {
    _meshSsboScratch.fill(0, 0, neededBytes);
  }
  const normalMatrixScratch = mat3.create();
  const strideFloats = MESH_PER_ENTITY_STRIDE / Float32Array.BYTES_PER_ELEMENT;
  for (let i = 0; i < slotCount; i++) {
    const entry = validatedOrdered[i];
    if (entry === void 0) continue;
    const slot = i * strideFloats;
    const isFoldHead = foldDispatchPlan?.headBuckets.has(i) === true;
    if (isFoldHead) {
      _meshSsboScratchFloats[slot] = 1;
      _meshSsboScratchFloats[slot + 5] = 1;
      _meshSsboScratchFloats[slot + 10] = 1;
      _meshSsboScratchFloats[slot + 15] = 1;
      _meshSsboScratchFloats[slot + 16] = 1;
      _meshSsboScratchFloats[slot + 20] = 1;
      _meshSsboScratchFloats[slot + 24] = 1;
      _meshSsboScratchFloats[slot + 28] = 1;
      _meshSsboScratchFloats[slot + 33] = 1;
      _meshSsboScratchFloats[slot + 38] = 1;
      _meshSsboScratchFloats[slot + 43] = 1;
      _meshSsboScratchFloats[slot + 44] = 1;
      _meshSsboScratchFloats[slot + 45] = 1;
    } else {
      const worldFromLocal = entry.source.transform.world;
      for (let k = 0; k < 16; k++) _meshSsboScratchFloats[slot + k] = worldFromLocal[k] ?? 0;
      const normal = mat3.normalMatrix(normalMatrixScratch, worldFromLocal);
      _meshSsboScratchFloats[slot + 16] = normal[0] ?? 0;
      _meshSsboScratchFloats[slot + 17] = normal[1] ?? 0;
      _meshSsboScratchFloats[slot + 18] = normal[2] ?? 0;
      _meshSsboScratchFloats[slot + 20] = normal[3] ?? 0;
      _meshSsboScratchFloats[slot + 21] = normal[4] ?? 0;
      _meshSsboScratchFloats[slot + 22] = normal[5] ?? 0;
      _meshSsboScratchFloats[slot + 24] = normal[6] ?? 0;
      _meshSsboScratchFloats[slot + 25] = normal[7] ?? 0;
      _meshSsboScratchFloats[slot + 26] = normal[8] ?? 0;
      const previousWorld = entry.source.temporal?.previousTransform.world ?? worldFromLocal;
      for (let k = 0; k < 16; k++) {
        _meshSsboScratchFloats[slot + 28 + k] = previousWorld[k] ?? 0;
      }
      let reactiveMaterial = false;
      for (const material of entry.source.materials) {
        const shader = material.materialShaderId;
        if (material.transparent === true || shader === "forgeax::sprite" || shader === "forgeax::sprite-lit" || shader !== void 0 && !shader.startsWith("forgeax::")) {
          reactiveMaterial = true;
          break;
        }
      }
      _meshSsboScratchFloats[slot + 44] = entry.source.temporal?.reactive === true || reactiveMaterial ? 1 : 0;
      _meshSsboScratchFloats[slot + 45] = entry.source.temporal?.motionValid === false ? 0 : 1;
    }
  }
  if (neededBytes > 0) {
    const meshUpload = queue.writeBuffer(
      meshStorageBuffer.buffer,
      startSlot * MESH_PER_ENTITY_STRIDE,
      _meshSsboScratch,
      0,
      neededBytes
    );
    if (!meshUpload.ok) throw meshUpload.error;
  }
}
var FOLDABLE_TRANSPARENT_SHADER_IDS = /* @__PURE__ */ new Set(["forgeax::sprite", "forgeax::sprite-lit"]);
function isFoldEligible(entry, renderables) {
  return renderables[entry.renderableIndex]?.material.transparent === true && entry.materialShaderId !== void 0 && FOLDABLE_TRANSPARENT_SHADER_IDS.has(entry.materialShaderId);
}
function foldDispatchBuckets(orderedEntries, mode, renderables) {
  if (orderedEntries.length === 0) return [];
  if (mode !== TRANSPARENT_SORT_MODE_LAYER_Z && mode !== TRANSPARENT_SORT_MODE_LAYER_Y) {
    const out = [];
    for (let i = 0; i < orderedEntries.length; i++) {
      const e = orderedEntries[i];
      if (e === void 0) continue;
      out.push(makeSingletonBucket(e, renderables, mode));
    }
    return out;
  }
  const buckets = [];
  let runStart = 0;
  while (runStart < orderedEntries.length) {
    const head = orderedEntries[runStart];
    if (head === void 0) {
      runStart += 1;
      continue;
    }
    if (!isFoldEligible(head, renderables)) {
      buckets.push(makeSingletonBucket(head, renderables, mode));
      runStart += 1;
      continue;
    }
    const headSortKey = readSortKey(mode, head.renderableIndex, renderables);
    let runEnd = runStart + 1;
    while (runEnd < orderedEntries.length) {
      const cand = orderedEntries[runEnd];
      if (cand === void 0) break;
      if (cand.layer !== head.layer) break;
      if (cand.materialHandle !== head.materialHandle) break;
      if (!isFoldEligible(cand, renderables)) break;
      const candSortKey = readSortKey(mode, cand.renderableIndex, renderables);
      if (candSortKey !== headSortKey) break;
      runEnd += 1;
    }
    const run = orderedEntries.slice(runStart, runEnd);
    const transforms = assembleTransforms(run, renderables);
    buckets.push({
      entries: run,
      bucketSize: run.length,
      transforms,
      materialHandle: head.materialHandle,
      layer: head.layer,
      sortKey: headSortKey
    });
    runStart = runEnd;
  }
  return buckets;
}
function makeSingletonBucket(entry, renderables, mode) {
  const transforms = new Float32Array(16);
  const w = renderables[entry.renderableIndex]?.transform.world;
  if (w !== void 0) transforms.set(w);
  const sortKey = readSortKey(mode, entry.renderableIndex, renderables);
  return {
    entries: [entry],
    bucketSize: 1,
    transforms,
    materialHandle: entry.materialHandle,
    layer: entry.layer,
    sortKey
  };
}
function assembleTransforms(run, renderables) {
  const out = new Float32Array(run.length * 16);
  for (let i = 0; i < run.length; i++) {
    const e = run[i];
    if (e === void 0) continue;
    const w = renderables[e.renderableIndex]?.transform.world;
    if (w !== void 0) out.set(w, i * 16);
  }
  return out;
}
function readSortKey(mode, renderableIndex, renderables) {
  const w = renderables[renderableIndex]?.transform.world;
  if (w === void 0) return 0;
  return (mode === TRANSPARENT_SORT_MODE_LAYER_Z ? w[14] : w[13]) ?? 0;
}
function buildFoldDispatchPlan(buckets, renderableIndexToValidatedIndex) {
  const headBuckets = /* @__PURE__ */ new Map();
  const skipIndices = /* @__PURE__ */ new Set();
  let foldedBucketCount = 0;
  for (const bucket of buckets) {
    if (bucket.bucketSize <= 1) continue;
    const headEntry = bucket.entries[0];
    if (headEntry === void 0) continue;
    const headValidatedIdx = renderableIndexToValidatedIndex.get(headEntry.renderableIndex);
    if (headValidatedIdx === void 0) continue;
    headBuckets.set(headValidatedIdx, bucket);
    foldedBucketCount += 1;
    for (let i = 1; i < bucket.entries.length; i++) {
      const memberEntry = bucket.entries[i];
      if (memberEntry === void 0) continue;
      const memberValidatedIdx = renderableIndexToValidatedIndex.get(memberEntry.renderableIndex);
      if (memberValidatedIdx === void 0) continue;
      skipIndices.add(memberValidatedIdx);
    }
  }
  return { headBuckets, skipIndices, foldedBucketCount };
}
var FOLD_UNIFORM_INSTANCE_CAP = 128;
function evaluateFoldBucketUniformCap(bucket, caps, scope) {
  if (caps.storageBuffer) return { fallback: false, error: void 0 };
  if (bucket.bucketSize <= FOLD_UNIFORM_INSTANCE_CAP) {
    return { fallback: false, error: void 0 };
  }
  const error = new RhiError({
    code: "instancing-exceeds-uniform-cap",
    expected: `bucket instance count <= ${FOLD_UNIFORM_INSTANCE_CAP} (uniform fallback cap)`,
    hint: `reduce the bucket size (smaller layer/material groupings), switch to a WebGPU-capable backend (storage buffers lift the cap), or accept the per-cell drawIndexed fallback for ${scope}`,
    detail: {
      requested: bucket.bucketSize,
      limit: FOLD_UNIFORM_INSTANCE_CAP,
      scope
    }
  });
  return { fallback: true, error };
}
var FOLDED_DRAWS_METRIC_KEY = "render.instancing.foldedDraws";
function incrementFoldedDrawsMetric(plan, metrics) {
  for (let i = 0; i < plan.foldedBucketCount; i++) {
    metrics.increment(FOLDED_DRAWS_METRIC_KEY);
  }
}

// src/ssao-buffers.ts
var SSAO_KERNEL_SAMPLE_COUNT = 64;
var NOISE_SIZE = 16;
function mulberry32(seed) {
  let state = seed | 0;
  return () => {
    state = state + 1831565813 | 0;
    let t = Math.imul(state ^ state >>> 15, 1 | state);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function lerp(a, b, t) {
  return a + t * (b - a);
}
function generateSsaoKernel(seed = 0) {
  const rand = mulberry32(seed);
  const kernel = [];
  for (let i = 0; i < SSAO_KERNEL_SAMPLE_COUNT; i++) {
    let x = rand() * 2 - 1;
    let y = rand() * 2 - 1;
    let z = rand();
    const len = Math.sqrt(x * x + y * y + z * z);
    x /= len;
    y /= len;
    z /= len;
    const r = rand();
    x *= r;
    y *= r;
    z *= r;
    const scale = lerp(0.1, 1, (i / SSAO_KERNEL_SAMPLE_COUNT) ** 2);
    const sample = new Float32Array(3);
    sample[0] = x * scale;
    sample[1] = y * scale;
    sample[2] = z * scale;
    kernel.push(sample);
  }
  return kernel;
}
function generateSsaoNoise(seed = 0) {
  const rand = mulberry32(seed);
  const noise = new Float32Array(NOISE_SIZE * 3);
  for (let i = 0; i < NOISE_SIZE; i++) {
    noise[i * 3 + 0] = rand() * 2 - 1;
    noise[i * 3 + 1] = rand() * 2 - 1;
    noise[i * 3 + 2] = 0;
  }
  return noise;
}
var BYTES_PER_KERNEL_ELEMENT = 16;
var UNIFORM_BYTES = 256;
var fallbackCache = /* @__PURE__ */ new WeakMap();
function destroyBuffer(runtime, device, buffer) {
  const destroyed = device.destroyBuffer(buffer);
  if (!destroyed.ok) runtime.errorRegistry.fire(destroyed.error);
}
function destroyTexture(runtime, device, texture) {
  const destroyed = device.destroyTexture(texture);
  if (!destroyed.ok) runtime.errorRegistry.fire(destroyed.error);
}
function retireSsaoResources(device, release) {
  const queue = device.queue;
  if (typeof queue.onSubmittedWorkDone === "function") {
    try {
      void queue.onSubmittedWorkDone().then(release, release);
      return;
    } catch {
    }
  }
  release();
}
function destroySsaoFallbackResources(runtime, resources) {
  destroyTexture(runtime, resources.device, resources.texture);
}
function getOrCreateSsaoFallbackTexture(runtime) {
  const cached = fallbackCache.get(runtime);
  if (cached !== void 0 && cached.device === runtime.device) return cached;
  if (cached !== void 0) {
    fallbackCache.delete(runtime);
    retireSsaoResources(cached.device, () => destroySsaoFallbackResources(runtime, cached));
  }
  const device = runtime.device;
  const texRes = device.createTexture({
    label: "hdrp-ssao-fallback-white",
    size: { width: 1, height: 1, depthOrArrayLayers: 1 },
    mipLevelCount: 1,
    sampleCount: 1,
    dimension: "2d",
    format: "r8unorm",
    usage: GPU_TEXTURE_USAGE_TEXTURE_BINDING | GPU_TEXTURE_USAGE_COPY_DST,
    textureBindingViewDimension: void 0
  });
  if (!texRes.ok) {
    runtime.errorRegistry.fire(texRes.error);
    return null;
  }
  const whitePixel = new Uint8Array([255]);
  const writeRes = device.queue.writeTexture(
    {
      texture: texRes.value,
      mipLevel: 0,
      origin: { x: 0, y: 0, z: 0 }
    },
    whitePixel,
    { offset: 0, bytesPerRow: 256, rowsPerImage: 1 },
    { width: 1, height: 1, depthOrArrayLayers: 1 }
  );
  if (!writeRes.ok) {
    runtime.errorRegistry.fire(writeRes.error);
    destroyTexture(runtime, device, texRes.value);
    return null;
  }
  const viewRes = device.createTextureView(texRes.value, {
    label: "hdrp-ssao-fallback-white-view",
    format: "r8unorm",
    dimension: "2d",
    aspect: "all",
    baseMipLevel: 0,
    mipLevelCount: 1,
    baseArrayLayer: 0,
    arrayLayerCount: 1
  });
  if (!viewRes.ok) {
    runtime.errorRegistry.fire(viewRes.error);
    destroyTexture(runtime, device, texRes.value);
    return null;
  }
  const samplerRes = device.createSampler({
    label: "hdrp-ssao-fallback-sampler",
    magFilter: "linear",
    minFilter: "linear",
    mipmapFilter: "linear",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
    addressModeW: "clamp-to-edge"
  });
  if (!samplerRes.ok) {
    runtime.errorRegistry.fire(samplerRes.error);
    destroyTexture(runtime, device, texRes.value);
    return null;
  }
  const resources = {
    device,
    texture: texRes.value,
    view: viewRes.value,
    sampler: samplerRes.value
  };
  fallbackCache.set(runtime, resources);
  return resources;
}
var cache = /* @__PURE__ */ new WeakMap();
function destroySsaoBufferResources(runtime, buffers) {
  for (const buffer of [buffers.kernelBuffer, buffers.uniformBuffer]) {
    destroyBuffer(runtime, buffers.device, buffer);
  }
  destroyTexture(runtime, buffers.device, buffers.noiseTexture);
}
function destroyCreatedSsaoResources(runtime, device, buffers, textures) {
  for (const buffer of buffers) destroyBuffer(runtime, device, buffer);
  for (const texture of textures) destroyTexture(runtime, device, texture);
}
function resetSsaoResources(runtime) {
  const buffers = cache.get(runtime);
  if (buffers !== void 0) {
    cache.delete(runtime);
    retireSsaoResources(buffers.device, () => destroySsaoBufferResources(runtime, buffers));
  }
  const fallback = fallbackCache.get(runtime);
  if (fallback !== void 0) {
    fallbackCache.delete(runtime);
    retireSsaoResources(fallback.device, () => destroySsaoFallbackResources(runtime, fallback));
  }
}
function getOrCreateSsaoBuffers(runtime) {
  const cached = cache.get(runtime);
  if (cached !== void 0 && cached.device === runtime.device) return cached;
  if (cached !== void 0) {
    cache.delete(runtime);
    retireSsaoResources(cached.device, () => destroySsaoBufferResources(runtime, cached));
  }
  const device = runtime.device;
  const kernelSamples = generateSsaoKernel();
  const kernelData = new Float32Array(SSAO_KERNEL_SAMPLE_COUNT * 4);
  for (let i = 0; i < SSAO_KERNEL_SAMPLE_COUNT; i++) {
    const s = kernelSamples[i];
    if (s === void 0) continue;
    kernelData[i * 4 + 0] = s[0] ?? 0;
    kernelData[i * 4 + 1] = s[1] ?? 0;
    kernelData[i * 4 + 2] = s[2] ?? 0;
  }
  const kernelBufferRes = device.createBuffer({
    label: "hdrp-ssao-kernel",
    size: SSAO_KERNEL_SAMPLE_COUNT * BYTES_PER_KERNEL_ELEMENT,
    usage: GPU_BUFFER_USAGE_UNIFORM | GPU_BUFFER_USAGE_COPY_DST,
    mappedAtCreation: false
  });
  if (!kernelBufferRes.ok) {
    runtime.errorRegistry.fire(kernelBufferRes.error);
    return null;
  }
  const kernelWriteRes = device.queue.writeBuffer(kernelBufferRes.value, 0, kernelData);
  if (!kernelWriteRes.ok) {
    runtime.errorRegistry.fire(kernelWriteRes.error);
    destroyBuffer(runtime, device, kernelBufferRes.value);
    return null;
  }
  const noiseData = generateSsaoNoise();
  const noiseRgba = new Float32Array(16 * 4);
  for (let i = 0; i < 16; i++) {
    noiseRgba[i * 4 + 0] = noiseData[i * 3 + 0] ?? 0;
    noiseRgba[i * 4 + 1] = noiseData[i * 3 + 1] ?? 0;
    noiseRgba[i * 4 + 2] = 0;
    noiseRgba[i * 4 + 3] = 1;
  }
  const noiseTexRes = device.createTexture({
    label: "hdrp-ssao-noise",
    size: { width: 4, height: 4, depthOrArrayLayers: 1 },
    mipLevelCount: 1,
    sampleCount: 1,
    dimension: "2d",
    format: "rgba32float",
    usage: GPU_TEXTURE_USAGE_COPY_DST | GPU_TEXTURE_USAGE_TEXTURE_BINDING,
    textureBindingViewDimension: void 0
  });
  if (!noiseTexRes.ok) {
    runtime.errorRegistry.fire(noiseTexRes.error);
    destroyBuffer(runtime, device, kernelBufferRes.value);
    return null;
  }
  const noiseCopyRes = device.queue.writeTexture(
    {
      texture: noiseTexRes.value,
      mipLevel: 0,
      origin: { x: 0, y: 0, z: 0 }
    },
    noiseRgba,
    { offset: 0, bytesPerRow: 4 * 4 * 4, rowsPerImage: 4 },
    { width: 4, height: 4, depthOrArrayLayers: 1 }
  );
  if (!noiseCopyRes.ok) {
    runtime.errorRegistry.fire(noiseCopyRes.error);
    destroyCreatedSsaoResources(runtime, device, [kernelBufferRes.value], [noiseTexRes.value]);
    return null;
  }
  const uniformBufRes = device.createBuffer({
    label: "hdrp-ssao-uniform",
    size: UNIFORM_BYTES,
    usage: GPU_BUFFER_USAGE_UNIFORM | GPU_BUFFER_USAGE_COPY_DST,
    mappedAtCreation: false
  });
  if (!uniformBufRes.ok) {
    runtime.errorRegistry.fire(uniformBufRes.error);
    destroyCreatedSsaoResources(runtime, device, [kernelBufferRes.value], [noiseTexRes.value]);
    return null;
  }
  const buffers = {
    device,
    kernelBuffer: kernelBufferRes.value,
    kernelBytes: SSAO_KERNEL_SAMPLE_COUNT * BYTES_PER_KERNEL_ELEMENT,
    noiseTexture: noiseTexRes.value,
    uniformBuffer: uniformBufRes.value,
    uniformBytes: UNIFORM_BYTES
  };
  cache.set(runtime, buffers);
  return buffers;
}

// src/hdrp-buffers.ts
function createHdrpClusterMembershipBindGroupLayoutDescriptor() {
  return {
    label: "hdrp-cluster-membership-bgl",
    entries: [
      {
        binding: 0,
        visibility: GPU_SHADER_STAGE_COMPUTE,
        buffer: { type: "read-only-storage", hasDynamicOffset: false }
      },
      {
        binding: 1,
        visibility: GPU_SHADER_STAGE_COMPUTE,
        buffer: { type: "storage", hasDynamicOffset: false }
      },
      {
        binding: 2,
        visibility: GPU_SHADER_STAGE_COMPUTE,
        buffer: { type: "uniform", hasDynamicOffset: false }
      },
      {
        binding: 3,
        visibility: GPU_SHADER_STAGE_COMPUTE,
        buffer: { type: "read-only-storage", hasDynamicOffset: false }
      }
    ]
  };
}
var cache2 = /* @__PURE__ */ new WeakMap();
function getOrCreateHdrpBuffers(runtime, grid = DEFAULT_CLUSTER_GRID) {
  if (runtime.device.caps?.storageBuffer !== true) return null;
  const deviceSurface = runtime.device;
  if (typeof deviceSurface.createBuffer !== "function" || typeof deviceSurface.createBindGroupLayout !== "function" || typeof deviceSurface.destroyBuffer !== "function") {
    return null;
  }
  const cached = cache2.get(runtime);
  if (cached !== void 0 && cached.device === runtime.device) {
    const requestedCells = grid.x * grid.y * grid.z;
    const cachedCells = cached.grid.x * cached.grid.y * cached.grid.z;
    if (requestedCells <= cachedCells) return cached;
  }
  const device = runtime.device;
  const clusterUniformBytes = 32;
  const lightDataBytes = MAX_LIGHTS * BYTES_PER_DIRECT_LIGHT_SLOT;
  const clusterCells = grid.x * grid.y * grid.z;
  const clusterGridBytes = clusterCells * CLUSTER_GRID_STRIDE_U32 * 4;
  const lightIndexListBytes = LIGHT_INDEX_LIST_CAPACITY * 4;
  const lightBoundsBytes = MAX_LIGHTS * 6 * 4;
  const created = [];
  const releaseCreated = () => {
    for (const buffer of created) {
      const result = device.destroyBuffer(buffer);
      if (!result.ok) runtime.errorRegistry.fire(result.error);
    }
    created.length = 0;
  };
  const failAllocation = (error) => {
    runtime.errorRegistry.fire(error);
    releaseCreated();
    return null;
  };
  const lightData = device.createBuffer({
    label: "hdrp-light-data",
    size: lightDataBytes,
    usage: GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_DST,
    mappedAtCreation: false
  });
  if (!lightData.ok) {
    return failAllocation(lightData.error);
  }
  created.push(lightData.value);
  const clusterGrid = device.createBuffer({
    label: "hdrp-cluster-grid",
    size: clusterGridBytes,
    usage: GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_DST,
    mappedAtCreation: false
  });
  if (!clusterGrid.ok) {
    return failAllocation(clusterGrid.error);
  }
  created.push(clusterGrid.value);
  const lightIndexList = device.createBuffer({
    label: "hdrp-light-index-list",
    size: lightIndexListBytes,
    usage: GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_DST,
    mappedAtCreation: false
  });
  if (!lightIndexList.ok) {
    return failAllocation(lightIndexList.error);
  }
  created.push(lightIndexList.value);
  const clusterUniform = device.createBuffer({
    label: "hdrp-cluster-uniform",
    size: clusterUniformBytes,
    usage: GPU_BUFFER_USAGE_UNIFORM | GPU_BUFFER_USAGE_COPY_DST,
    mappedAtCreation: false
  });
  if (!clusterUniform.ok) {
    return failAllocation(clusterUniform.error);
  }
  created.push(clusterUniform.value);
  const lightBounds = device.createBuffer({
    label: "hdrp-light-bounds",
    size: lightBoundsBytes,
    usage: GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_DST,
    mappedAtCreation: false
  });
  if (!lightBounds.ok) {
    return failAllocation(lightBounds.error);
  }
  created.push(lightBounds.value);
  const unifiedBglRes = device.createBindGroupLayout(createHdrpBindGroupLayoutDescriptor());
  if (!unifiedBglRes.ok) {
    return failAllocation(unifiedBglRes.error);
  }
  const buffers = {
    device,
    lightDataBuffer: lightData.value,
    lightDataBytes,
    clusterGridBuffer: clusterGrid.value,
    clusterGridBytes,
    lightIndexListBuffer: lightIndexList.value,
    lightIndexListBytes,
    clusterUniformBuffer: clusterUniform.value,
    clusterUniformBytes,
    lightBoundsBuffer: lightBounds.value,
    lightBoundsBytes,
    grid: { x: grid.x, y: grid.y, z: grid.z },
    unifiedBindGroupLayout: unifiedBglRes.value
  };
  cache2.set(runtime, buffers);
  if (cached !== void 0) {
    retireHdrpBuffers(runtime, cached);
  }
  return buffers;
}
function resetHdrpBuffers(runtime) {
  const cached = cache2.get(runtime);
  if (cached === void 0) return;
  cache2.delete(runtime);
  retireHdrpBuffers(runtime, cached);
}
function retireHdrpBuffers(runtime, buffers) {
  const device = buffers.device;
  const destroy = () => {
    for (const buffer of [
      buffers.lightDataBuffer,
      buffers.clusterGridBuffer,
      buffers.lightIndexListBuffer,
      buffers.clusterUniformBuffer,
      buffers.lightBoundsBuffer
    ]) {
      const result = device.destroyBuffer(buffer);
      if (!result.ok) runtime.errorRegistry.fire(result.error);
    }
  };
  const queue = device.queue;
  if (typeof queue.onSubmittedWorkDone === "function") {
    queue.onSubmittedWorkDone().then(destroy, destroy);
  } else {
    destroy();
  }
}
function packClusterUniform(grid, near, far, ssaoIntensity = 0, lightCount = 0) {
  const buf = new ArrayBuffer(32);
  const u32 = new Uint32Array(buf);
  const f32 = new Float32Array(buf);
  u32[0] = grid.x >>> 0;
  u32[1] = grid.y >>> 0;
  u32[2] = grid.z >>> 0;
  u32[3] = Math.min(Math.max(lightCount, 0), MAX_LIGHTS) >>> 0;
  f32[4] = near;
  f32[5] = far;
  f32[6] = near > 0 && far > near ? Math.log(far / near) : 0;
  f32[7] = ssaoIntensity;
  return buf;
}
function standardLightingEntries(hdrpBuffers, ssaoTexView, ssaoSampler) {
  return [
    {
      binding: 3,
      resource: {
        kind: "buffer",
        value: { buffer: hdrpBuffers.lightDataBuffer }
      }
    },
    {
      binding: 4,
      resource: {
        kind: "buffer",
        value: { buffer: hdrpBuffers.clusterGridBuffer }
      }
    },
    {
      binding: 5,
      resource: {
        kind: "buffer",
        value: { buffer: hdrpBuffers.lightIndexListBuffer }
      }
    },
    {
      binding: 6,
      resource: {
        kind: "buffer",
        value: { buffer: hdrpBuffers.clusterUniformBuffer }
      }
    },
    {
      binding: 7,
      resource: { kind: "textureView", value: ssaoTexView }
    },
    {
      binding: 8,
      resource: { kind: "sampler", value: ssaoSampler }
    }
  ];
}
var sceneLightingBindings = /* @__PURE__ */ new WeakMap();
function createGpuDrivenLightingBindGroup(runtime, buffers, layout, binding, ssaoView) {
  const fallback = getOrCreateSsaoFallbackTexture(runtime);
  if (fallback === null) return null;
  const ssao = ssaoView ?? fallback.view;
  let cache3 = sceneLightingBindings.get(buffers);
  if (cache3 === void 0) {
    cache3 = /* @__PURE__ */ new WeakMap();
    sceneLightingBindings.set(buffers, cache3);
  }
  const cached = cache3.get(binding.meshBuffer);
  if (cached?.layout === layout && cached.palette === binding.paletteBuffer && cached.ssao === ssao)
    return cached.bindGroup;
  const result = runtime.device.createBindGroup({
    label: "gpu-driven-scene-lighting",
    layout,
    entries: [
      {
        binding: 0,
        resource: {
          kind: "buffer",
          value: { buffer: binding.meshBuffer, size: binding.meshBytes }
        }
      },
      ...binding.paletteBuffer === void 0 ? [] : [1, 2].map((index) => ({
        binding: index,
        resource: {
          kind: "buffer",
          value: { buffer: binding.paletteBuffer }
        }
      })),
      ...standardLightingEntries(buffers, ssao, fallback.sampler)
    ]
  });
  if (!result.ok) {
    runtime.errorRegistry.fire(result.error);
    return null;
  }
  cache3.set(binding.meshBuffer, {
    layout,
    palette: binding.paletteBuffer,
    ssao,
    bindGroup: result.value
  });
  return result.value;
}
function createStandardSurfaceLightingBindGroup(runtime, layout, grid, ssaoOptions = { enabled: false }) {
  const buffers = getOrCreateHdrpBuffers(runtime, grid);
  const fallback = getOrCreateSsaoFallbackTexture(runtime);
  if (buffers === null || fallback === null) return null;
  const result = runtime.device.createBindGroup({
    label: "standard-surface-lighting",
    layout,
    entries: standardLightingEntries(
      buffers,
      ssaoOptions.enabled ? ssaoOptions.ssaoBlurredView : fallback.view,
      fallback.sampler
    )
  });
  if (!result.ok) {
    runtime.errorRegistry.fire(result.error);
    return null;
  }
  return result.value;
}
function createHdrpUnifiedBindGroup(runtime, hdrpBuffers, meshStorageBuffer, ssaoOptions = { enabled: false }, meshBindingBytes = MESH_PER_ENTITY_STRIDE) {
  const fallback = getOrCreateSsaoFallbackTexture(runtime);
  if (fallback === null) return null;
  const ssaoTexView = ssaoOptions.enabled ? ssaoOptions.ssaoBlurredView : fallback.view;
  const ssaoSampler = fallback.sampler;
  const result = runtime.device.createBindGroup({
    label: "hdrp-unified-bg-group2",
    layout: hdrpBuffers.unifiedBindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          kind: "buffer",
          value: {
            buffer: meshStorageBuffer,
            offset: 0,
            size: meshBindingBytes
          }
        }
      },
      ...standardLightingEntries(hdrpBuffers, ssaoTexView, ssaoSampler)
    ]
  });
  if (!result.ok) {
    runtime.errorRegistry.fire(result.error);
    return null;
  }
  return result.value;
}
function createHdrpSkinUnifiedBindGroup(runtime, hdrpBuffers, layout, meshStorageBuffer, paletteBuffer, paletteBindingWindowBytes, ssaoOptions = { enabled: false }, meshBindingBytes = MESH_PER_ENTITY_STRIDE) {
  const fallback = getOrCreateSsaoFallbackTexture(runtime);
  if (fallback === null) return null;
  const result = runtime.device.createBindGroup({
    label: "hdrp-skin-unified-bg-group2",
    layout,
    entries: [
      ...createPbrSkinMeshBindGroupEntries(
        meshStorageBuffer,
        meshBindingBytes,
        paletteBuffer,
        paletteBindingWindowBytes
      ),
      { binding: 3, resource: { kind: "buffer", value: { buffer: hdrpBuffers.lightDataBuffer } } },
      {
        binding: 4,
        resource: { kind: "buffer", value: { buffer: hdrpBuffers.clusterGridBuffer } }
      },
      {
        binding: 5,
        resource: { kind: "buffer", value: { buffer: hdrpBuffers.lightIndexListBuffer } }
      },
      {
        binding: 6,
        resource: { kind: "buffer", value: { buffer: hdrpBuffers.clusterUniformBuffer } }
      },
      {
        binding: 7,
        resource: {
          kind: "textureView",
          value: ssaoOptions.enabled ? ssaoOptions.ssaoBlurredView : fallback.view
        }
      },
      { binding: 8, resource: { kind: "sampler", value: fallback.sampler } }
    ]
  });
  if (!result.ok) {
    runtime.errorRegistry.fire(result.error);
    return null;
  }
  return result.value;
}
function createHdrpClusterMembershipBindGroup(runtime, hdrpBuffers, layout) {
  const result = runtime.device.createBindGroup({
    label: "hdrp-cluster-membership-bg",
    layout,
    entries: [
      {
        binding: 0,
        resource: { kind: "buffer", value: { buffer: hdrpBuffers.clusterGridBuffer } }
      },
      {
        binding: 1,
        resource: { kind: "buffer", value: { buffer: hdrpBuffers.lightIndexListBuffer } }
      },
      {
        binding: 2,
        resource: { kind: "buffer", value: { buffer: hdrpBuffers.clusterUniformBuffer } }
      },
      {
        binding: 3,
        resource: { kind: "buffer", value: { buffer: hdrpBuffers.lightBoundsBuffer } }
      }
    ]
  });
  if (!result.ok) {
    runtime.errorRegistry.fire(result.error);
    return null;
  }
  return result.value;
}
function runClusterBinProfilePhase(runner, phase, action) {
  return action() ;
}
function createClusterBinScratch() {
  return {
    clusterCounts: new Uint32Array(0),
    clusterCursors: new Uint32Array(0),
    lightBounds: new Int32Array(0),
    clusterDeltas: new Int32Array(0),
    aabbOutput: {
      min: vec3.create(0, 0, 0),
      max: vec3.create(0, 0, 0)
    },
    boundsOutput: {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 }
    }
  };
}
function ensureScratchCapacity(scratch, clusterCount, lightCount, gridX, gridY, gridZ) {
  if (scratch.clusterCounts.length < clusterCount) {
    scratch.clusterCounts = new Uint32Array(clusterCount);
    scratch.clusterCursors = new Uint32Array(clusterCount);
  }
  if (scratch.lightBounds.length < lightCount * 6) {
    scratch.lightBounds = new Int32Array(lightCount * 6);
  }
  const differenceVolumeSize = (gridX + 1) * (gridY + 1) * (gridZ + 1);
  if (scratch.clusterDeltas.length < differenceVolumeSize) {
    scratch.clusterDeltas = new Int32Array(differenceVolumeSize);
  }
}
function deriveCullingRadius(range, intensity, threshold = 1e-3) {
  if (Number.isFinite(range)) {
    return Math.max(0, range);
  }
  const derived = Math.sqrt(intensity / threshold);
  return Math.min(derived, 1e3);
}
function viewZToZSlice(viewZ, gridZ, near, far) {
  if (viewZ >= -near) {
    return 0;
  }
  const logFarOverNear = Math.log(far / near);
  const slice = Math.floor(Math.log(-viewZ / near) / logFarOverNear * gridZ);
  if (slice < 0) return 0;
  if (slice >= gridZ) return gridZ - 1;
  return slice;
}
function clusterSpaceObjectAabb(center, radius, view, proj, output) {
  const result = output ?? {
    min: vec3.create(0, 0, 0),
    max: vec3.create(0, 0, 0)
  };
  const cx = center[0] ?? 0;
  const cy = center[1] ?? 0;
  const cz = center[2] ?? 0;
  const v00 = view[0] ?? 0;
  const v01 = view[1] ?? 0;
  const v02 = view[2] ?? 0;
  const v10 = view[4] ?? 0;
  const v11 = view[5] ?? 0;
  const v12 = view[6] ?? 0;
  const v20 = view[8] ?? 0;
  const v21 = view[9] ?? 0;
  const v22 = view[10] ?? 0;
  const v30 = view[12] ?? 0;
  const v31 = view[13] ?? 0;
  const v32 = view[14] ?? 0;
  const vx = v00 * cx + v10 * cy + v20 * cz + v30;
  const vy = v01 * cx + v11 * cy + v21 * cz + v31;
  const vz = v02 * cx + v12 * cy + v22 * cz + v32;
  const viewScaleX = Math.hypot(v00, v01, v02);
  const viewScaleY = Math.hypot(v10, v11, v12);
  const viewScaleZ = Math.hypot(v20, v21, v22);
  const rx = radius * viewScaleX;
  const ry = radius * viewScaleY;
  const rz = radius * viewScaleZ;
  const vMinX = vx - rx;
  const vMaxX = vx + rx;
  const vMinY = vy - ry;
  const vMaxY = vy + ry;
  const vMinZ = vz - rz;
  const vMaxZ = vz + rz;
  const minViewZ = vMinZ;
  const maxViewZ = Math.min(vMaxZ, -1e-5);
  if (minViewZ > maxViewZ) {
    result.min[0] = 1;
    result.min[1] = 1;
    result.min[2] = -1e-5;
    result.max[0] = -1;
    result.max[1] = -1;
    result.max[2] = -1e-5;
    return result;
  }
  let ndcMinX = Infinity;
  let ndcMaxX = -Infinity;
  let ndcMinY = Infinity;
  let ndcMaxY = -Infinity;
  const p00 = proj[0] ?? 0;
  const p10 = proj[4] ?? 0;
  const p20 = proj[8] ?? 0;
  const p30 = proj[12] ?? 0;
  const p01 = proj[1] ?? 0;
  const p11 = proj[5] ?? 0;
  const p21 = proj[9] ?? 0;
  const p31 = proj[13] ?? 0;
  const p23 = proj[11] ?? 0;
  const perspectiveWOnlyZ = Math.abs(proj[3] ?? 0) < 1e-8 && Math.abs(proj[7] ?? 0) < 1e-8 && Math.abs(proj[15] ?? 0) < 1e-8 && Math.abs(p23) >= 1e-5;
  if (perspectiveWOnlyZ) {
    const xExtent = Math.abs(p00) * rx + Math.abs(p10) * ry;
    const yExtent = Math.abs(p01) * rx + Math.abs(p11) * ry;
    for (let face = 0; face < 2; face++) {
      const zTest = face === 0 ? minViewZ : maxViewZ;
      if (zTest > 0) continue;
      const invW = 1 / (p23 * zTest);
      const xCenter = p20 * zTest + p30;
      const yCenter = p21 * zTest + p31;
      const x0 = (xCenter - xExtent) * invW;
      const x1 = (xCenter + xExtent) * invW;
      const y0 = (yCenter - yExtent) * invW;
      const y1 = (yCenter + yExtent) * invW;
      ndcMinX = Math.min(ndcMinX, x0, x1);
      ndcMaxX = Math.max(ndcMaxX, x0, x1);
      ndcMinY = Math.min(ndcMinY, y0, y1);
      ndcMaxY = Math.max(ndcMaxY, y0, y1);
    }
  } else {
    const corners = [
      [vMinX, vMinY],
      [vMinX, vMaxY],
      [vMaxX, vMinY],
      [vMaxX, vMaxY]
    ];
    for (const zTest of [minViewZ, maxViewZ]) {
      if (zTest <= 0) {
        for (const corner of corners) {
          const sx = corner[0];
          const sy = corner[1];
          const ndc = projectToNdc(sx, sy, zTest, proj);
          ndcMinX = Math.min(ndcMinX, ndc[0]);
          ndcMaxX = Math.max(ndcMaxX, ndc[0]);
          ndcMinY = Math.min(ndcMinY, ndc[1]);
          ndcMaxY = Math.max(ndcMaxY, ndc[1]);
        }
      }
    }
  }
  ndcMinX = Math.max(ndcMinX, -1);
  ndcMinY = Math.max(ndcMinY, -1);
  ndcMaxX = Math.min(ndcMaxX, 1);
  ndcMaxY = Math.min(ndcMaxY, 1);
  result.min[0] = ndcMinX;
  result.min[1] = ndcMinY;
  result.min[2] = minViewZ;
  result.max[0] = ndcMaxX;
  result.max[1] = ndcMaxY;
  result.max[2] = maxViewZ;
  return result;
}
function projectToNdc(vx, vy, vz, proj) {
  const p00 = proj[0] ?? 0;
  const p10 = proj[4] ?? 0;
  const p20 = proj[8] ?? 0;
  const p30 = proj[12] ?? 0;
  const p01 = proj[1] ?? 0;
  const p11 = proj[5] ?? 0;
  const p21 = proj[9] ?? 0;
  const p31 = proj[13] ?? 0;
  const p02 = proj[2] ?? 0;
  const p12 = proj[6] ?? 0;
  const p22 = proj[10] ?? 0;
  const p32 = proj[14] ?? 0;
  const p03 = proj[3] ?? 0;
  const p13 = proj[7] ?? 0;
  const p23 = proj[11] ?? 0;
  const p33 = proj[15] ?? 0;
  const cx = p00 * vx + p10 * vy + p20 * vz + p30;
  const cy = p01 * vx + p11 * vy + p21 * vz + p31;
  const cz = p02 * vx + p12 * vy + p22 * vz + p32;
  const cw = p03 * vx + p13 * vy + p23 * vz + p33;
  if (Math.abs(cw) < 1e-10) {
    return [vx < 0 ? -1 : 1, vy < 0 ? -1 : 1, cz];
  }
  const invW = 1 / cw;
  return [cx * invW, cy * invW, cz * invW];
}
function ndcPositionToCluster(ndc, viewZ, gridX, gridY, gridZ, near, far) {
  const ndcX = ndc[0] ?? 0;
  const ndcY = ndc[1] ?? 0;
  let cx = Math.floor((ndcX * 0.5 + 0.5) * gridX);
  let cy = Math.floor((ndcY * 0.5 + 0.5) * gridY);
  if (cx < 0) cx = 0;
  if (cx >= gridX) cx = gridX - 1;
  if (cy < 0) cy = 0;
  if (cy >= gridY) cy = gridY - 1;
  const cz = viewZToZSlice(viewZ, gridZ, near, far);
  return { x: cx, y: cy, z: cz };
}
function calculateSphereClusterBounds(aabb, gridX, gridY, gridZ, near, far, output) {
  const result = output ?? {
    min: { x: 0, y: 0, z: 0 },
    max: { x: 0, y: 0, z: 0 }
  };
  const minZ = aabb.min[2] ?? 0;
  const maxZ = aabb.max[2] ?? 0;
  const idxMin = ndcPositionToCluster(aabb.min, minZ, gridX, gridY, gridZ, near, far);
  const idxMax = ndcPositionToCluster(aabb.max, maxZ, gridX, gridY, gridZ, near, far);
  result.min.x = Math.min(idxMin.x, idxMax.x);
  result.min.y = Math.min(idxMin.y, idxMax.y);
  result.min.z = Math.min(idxMin.z, idxMax.z);
  result.max.x = Math.max(idxMin.x, idxMax.x);
  result.max.y = Math.max(idxMin.y, idxMax.y);
  result.max.z = Math.max(idxMin.z, idxMax.z);
  return result;
}
function bin(lights, view, proj, grid, near, far, clusterGrid, lightIndexList, capacity, scratch, profile, options = {}) {
  const gridX = grid.x;
  const gridY = grid.y;
  const gridZ = grid.z;
  const clusterCount = gridX * gridY * gridZ;
  const binScratch = scratch ?? createClusterBinScratch();
  ensureScratchCapacity(binScratch, clusterCount, lights.length, gridX, gridY, gridZ);
  const { clusterCounts, clusterCursors, lightBounds, clusterDeltas } = binScratch;
  clusterGrid.fill(0, 0, clusterCount * 2);
  clusterCounts.fill(0, 0, clusterCount);
  let attemptedTotal = 0;
  runClusterBinProfilePhase(profile, "light-bounds-and-occupancy", () => {
    runClusterBinProfilePhase(profile, "light-bounds-and-occupancy/light-aabb", () => {
      for (let lightIdx = 0; lightIdx < lights.length; lightIdx++) {
        const boundsOffset = lightIdx * 6;
        lightBounds[boundsOffset] = -1;
        const light = lights[lightIdx];
        if (!light) continue;
        const radius = deriveCullingRadius(light.range, 1);
        if (radius <= 0) {
          continue;
        }
        const aabb = clusterSpaceObjectAabb(
          light.position,
          radius,
          view,
          proj,
          binScratch.aabbOutput
        );
        const bounds = calculateSphereClusterBounds(
          aabb,
          gridX,
          gridY,
          gridZ,
          near,
          far,
          binScratch.boundsOutput
        );
        if (bounds.min.x > bounds.max.x || bounds.min.y > bounds.max.y || bounds.min.z > bounds.max.z) {
          continue;
        }
        lightBounds[boundsOffset] = bounds.min.x;
        lightBounds[boundsOffset + 1] = bounds.min.y;
        lightBounds[boundsOffset + 2] = bounds.min.z;
        lightBounds[boundsOffset + 3] = bounds.max.x;
        lightBounds[boundsOffset + 4] = bounds.max.y;
        lightBounds[boundsOffset + 5] = bounds.max.z;
      }
    });
    runClusterBinProfilePhase(profile, "light-bounds-and-occupancy/cluster-occupancy", () => {
      const diffX = gridX + 1;
      const diffY = gridY + 1;
      const diffRow = diffX * diffY;
      clusterDeltas.fill(0, 0, diffRow * (gridZ + 1));
      const addDifference = (x, y, z, delta) => {
        const index = z * diffRow + y * diffX + x;
        clusterDeltas[index] = (clusterDeltas[index] ?? 0) + delta;
      };
      for (let lightIdx = 0; lightIdx < lights.length; lightIdx++) {
        const boundsOffset = lightIdx * 6;
        if ((lightBounds[boundsOffset] ?? -1) < 0) continue;
        const minX = lightBounds[boundsOffset] ?? 0;
        const minY = lightBounds[boundsOffset + 1] ?? 0;
        const minZ = lightBounds[boundsOffset + 2] ?? 0;
        const maxX = lightBounds[boundsOffset + 3] ?? -1;
        const maxY = lightBounds[boundsOffset + 4] ?? -1;
        const maxZ = lightBounds[boundsOffset + 5] ?? -1;
        const endX = maxX + 1;
        const endY = maxY + 1;
        const endZ = maxZ + 1;
        addDifference(minX, minY, minZ, 1);
        addDifference(endX, minY, minZ, -1);
        addDifference(minX, endY, minZ, -1);
        addDifference(minX, minY, endZ, -1);
        addDifference(endX, endY, minZ, 1);
        addDifference(endX, minY, endZ, 1);
        addDifference(minX, endY, endZ, 1);
        addDifference(endX, endY, endZ, -1);
      }
      for (let cz = 0; cz < gridZ; cz++) {
        for (let cy = 0; cy < gridY; cy++) {
          for (let cx = 0; cx < gridX; cx++) {
            const diffIdx = cz * diffRow + cy * diffX + cx;
            let count = clusterDeltas[diffIdx] ?? 0;
            if (cx > 0) count += clusterDeltas[diffIdx - 1] ?? 0;
            if (cy > 0) count += clusterDeltas[diffIdx - diffX] ?? 0;
            if (cz > 0) count += clusterDeltas[diffIdx - diffRow] ?? 0;
            if (cx > 0 && cy > 0) count -= clusterDeltas[diffIdx - diffX - 1] ?? 0;
            if (cx > 0 && cz > 0) count -= clusterDeltas[diffIdx - diffRow - 1] ?? 0;
            if (cy > 0 && cz > 0) count -= clusterDeltas[diffIdx - diffRow - diffX] ?? 0;
            if (cx > 0 && cy > 0 && cz > 0) {
              count += clusterDeltas[diffIdx - diffRow - diffX - 1] ?? 0;
            }
            clusterDeltas[diffIdx] = count;
            const clusterIdx = cz * gridY * gridX + cy * gridX + cx;
            clusterCounts[clusterIdx] = count;
            attemptedTotal += count;
          }
        }
      }
    });
  });
  if (attemptedTotal > capacity) {
    return err({
      code: "index-overflow",
      expected: `writeCount <= ${capacity}`,
      hint: `light index list overflow: needed ${attemptedTotal} entries, capacity ${capacity}; reduce lights, shrink grid, or shrink ranges (overrun = ${attemptedTotal - capacity})`,
      detail: { actual: attemptedTotal, capacity }
    });
  }
  const writeCount = runClusterBinProfilePhase(profile, "cluster-reserve", () => {
    let reserved = 0;
    for (let ci = 0; ci < clusterCount; ci++) {
      const base = ci * 2;
      clusterGrid[base] = reserved;
      clusterGrid[base + 1] = clusterCounts[ci] ?? 0;
      clusterCursors[ci] = reserved;
      reserved += clusterCounts[ci] ?? 0;
    }
    return reserved;
  });
  if (options.writeMembership !== false) {
    runClusterBinProfilePhase(profile, "light-index-write", () => {
      for (let lightIdx = 0; lightIdx < lights.length; lightIdx++) {
        const boundsOffset = lightIdx * 6;
        let valid = false;
        let minX = 0;
        let minY = 0;
        let minZ = 0;
        let maxX = -1;
        let maxY = -1;
        let maxZ = -1;
        runClusterBinProfilePhase(profile, "light-index-write/bounds-read", () => {
          if ((lightBounds[boundsOffset] ?? -1) < 0) return;
          valid = true;
          minX = lightBounds[boundsOffset] ?? 0;
          minY = lightBounds[boundsOffset + 1] ?? 0;
          minZ = lightBounds[boundsOffset + 2] ?? 0;
          maxX = lightBounds[boundsOffset + 3] ?? -1;
          maxY = lightBounds[boundsOffset + 4] ?? -1;
          maxZ = lightBounds[boundsOffset + 5] ?? -1;
        });
        if (!valid) continue;
        runClusterBinProfilePhase(profile, "light-index-write/cluster-write", () => {
          for (let cz = minZ; cz <= maxZ; cz++) {
            for (let cy = minY; cy <= maxY; cy++) {
              for (let cx = minX; cx <= maxX; cx++) {
                const clusterIdx = cz * gridY * gridX + cy * gridX + cx;
                const cursor = clusterCursors[clusterIdx] ?? 0;
                lightIndexList[cursor] = lightIdx;
                clusterCursors[clusterIdx] = cursor + 1;
              }
            }
          }
        });
      }
    });
  }
  return ok$1(writeCount);
}

// src/pipeline/standard-lighting/errors.ts
function fromClusterBinError(error) {
  return new StandardClusterIndexOverflowError(error.detail.actual, error.detail.capacity);
}

// src/pipeline/standard-lighting/membership.ts
function deriveStandardMembership(frame, layout, scratch = createClusterBinScratch()) {
  const clusterGrid = new Uint32Array(layout.clusterGridU32Length);
  const lightIndexList = new Uint32Array(layout.lightIndexListCapacity);
  const result = bin(
    frame.local,
    frame.view,
    frame.projection,
    layout.grid,
    frame.near,
    frame.far,
    clusterGrid,
    lightIndexList,
    layout.lightIndexListCapacity,
    scratch
  );
  if (!result.ok) return err$1(fromClusterBinError(result.error));
  return ok({
    clusterGrid,
    lightIndexList,
    lightBounds: scratch.lightBounds.slice(0, frame.local.length * 6),
    membershipEntryCount: result.value,
    scratch
  });
}

// src/pipeline/standard-lighting/prepare.ts
function prepareStandardLighting(frame) {
  if (frame.local.length > frame.lightCount || frame.local.length > MAX_LIGHTS) {
    return err$1(new StandardLightBudgetExceededError(frame.local.length, frame.lightCount));
  }
  const layout = createStandardClusterLayout(frame.grid);
  const membership = deriveStandardMembership(frame, layout);
  if (!membership.ok) return membership;
  return ok({
    ...membership.value,
    directional: frame.directional,
    local: frame.local,
    layout,
    membershipLightCount: frame.local.length,
    renderPath: frame.renderPath,
    maxLights: frame.lightCount
  });
}
function occupiedClusterCount(prepared) {
  let occupied = 0;
  for (let index = 1; index < prepared.clusterGrid.length; index += 2) {
    if ((prepared.clusterGrid[index] ?? 0) > 0) occupied += 1;
  }
  return occupied;
}
function selectStandardClusterTransport(capabilities, prepared) {
  const requested = prepared.local.length;
  if (!capabilities.storageBuffer) {
    return err$1(
      new StandardClusterTransportUnavailableError(
        requested,
        "enable a proven storage-buffer Cluster transport; compute without storage is not a membership path"
      )
    );
  }
  const producer = capabilities.compute && capabilities.membershipPipelineReady ? "gpu" : "cpu";
  const kind = producer === "gpu" ? "compute-storage" : "cpu-storage";
  return ok({
    kind,
    producer,
    layout: prepared.layout,
    requestedLightCount: requested,
    admittedLightCount: requested,
    membershipEntryCount: prepared.membershipEntryCount,
    occupiedClusterCount: occupiedClusterCount(prepared),
    clusterGridBytes: prepared.layout.clusterGridU32Length * Uint32Array.BYTES_PER_ELEMENT,
    lightIndexListBytes: prepared.membershipEntryCount * Uint32Array.BYTES_PER_ELEMENT,
    lightDataBytes: requested * BYTES_PER_DIRECT_LIGHT_SLOT,
    lightBoundsBytes: prepared.lightBounds.byteLength
  });
}

// src/post-process-errors.ts
var POST_PROCESS_POLICY = {
  "post-process-already-registered": {
    expected: "each post-process id is registered at most once",
    hint: (detail) => `post-process id '${detail.id}' is already registered; same-id re-register is forbidden. Pick a distinct id (engine builtins use the forgeax:: prefix; user passes use <package>::<id>).`
  },
  "post-process-not-found": {
    expected: "typed fullscreen plan references a registered post-process id",
    hint: (detail) => `no post-process is registered for id '${detail.id}'. For Engine-owned effects, rebuild the shader manifest with that Engine entry enabled. For custom effects, register '${detail.id}' with the feature host ({source, reads?}), then reference it from a typed fullscreen RenderFeaturePlan.`
  },
  "fullscreen-input-not-found": {
    expected: "reads key must be a graph-declared colorTarget with TEXTURE_BINDING",
    hint: (detail) => {
      const d = detail;
      return `fullscreen pass '${d.passName}' references reads key '${d.readsKey}' but that key is not declared as a graph color target, or the target is not sampleable as a texture. First declare graph color target '${d.readsKey}' with its format and size (or check spelling) before the typed fullscreen pass '${d.passName}' reads it. If '${d.readsKey}' is a depth target, ensure it has TEXTURE_BINDING usage (0x04) and is declared via graph.addColorTarget. Consider switching pipeline if your pipeline does not expose a sampleable depth target.`;
    }
  },
  "ssao-parameter-invalid": {
    expected: "finite non-negative SSAO intensity and low, medium, or high quality",
    hint: () => "Set ssao.intensity to a finite non-negative value and ssao.quality to low, medium, or high."
  },
  "ssao-radius-non-positive": {
    expected: "SSAO radius must be > 0",
    hint: (detail) => {
      const d = detail;
      return `SSAO parameter '${d.paramName}' is ${d.value}, must be greater than 0. Set config.ssao.${d.paramName} to a positive value (default 0.5) or disable SSAO with config.ssao.enabled = false.`;
    }
  },
  "ssao-bias-negative": {
    expected: "SSAO bias must be >= 0",
    hint: (detail) => {
      const d = detail;
      return `SSAO parameter '${d.paramName}' is ${d.value}, must be >= 0. Set config.ssao.${d.paramName} to a non-negative value (default 0.025) or disable SSAO.`;
    }
  },
  "params-size-mismatch": {
    expected: "params.byteSize >= 16 and defaultValue.length === byteSize",
    hint: (detail) => {
      const d = detail;
      return `params.byteSize is ${d.byteSize} but defaultValue.length is ${d.actualLength}. The UBO byteSize must be >= 16 B and defaultValue.length must equal byteSize. Pass a defaultValue Uint8Array whose .length matches byteSize exactly.`;
    }
  },
  "params-update-size-mismatch": {
    expected: "PostProcessParams.data byteLength === registered params.byteSize",
    hint: (detail) => {
      const d = detail;
      return `PostProcessParams.data byteLength is ${d.actualLength} but the registered params.byteSize is ${d.byteSize}. The per-frame data-driven write must match the registered byteSize exactly; check the PostProcessParams.data you assign each frame.`;
    }
  }
};
var PostProcessErrorClass = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    const policy = POST_PROCESS_POLICY[args.code];
    const hint = policy.hint(args.detail);
    super(`post-process: ${args.code} (${hint})`);
    this.name = "PostProcessError";
    this.code = args.code;
    this.expected = policy.expected;
    this.hint = hint;
    this.detail = args.detail;
  }
};
var PostProcessError = PostProcessErrorClass;

// src/ssao-config.ts
var SSAO_DEFAULT_RADIUS = 0.5;
var SSAO_DEFAULT_BIAS = 0.025;
var SSAO_DEFAULT_INTENSITY = 1;
var SSAO_SAMPLE_COUNTS = { low: 16, medium: 32, high: 64 };
function getSsaoParameters(config) {
  return {
    radius: config?.radius ?? SSAO_DEFAULT_RADIUS,
    bias: config?.bias ?? SSAO_DEFAULT_BIAS,
    intensity: config?.intensity ?? SSAO_DEFAULT_INTENSITY,
    quality: config?.quality ?? "high"
  };
}
function resolveSsaoParameters(config) {
  const resolved = getSsaoParameters(config);
  if (!Number.isFinite(resolved.radius) || resolved.radius <= 0) {
    return err$1(
      new PostProcessError({
        code: "ssao-radius-non-positive",
        detail: { paramName: "radius", value: resolved.radius }
      })
    );
  }
  if (!Number.isFinite(resolved.bias) || resolved.bias < 0) {
    return err$1(
      new PostProcessError({
        code: "ssao-bias-negative",
        detail: { paramName: "bias", value: resolved.bias }
      })
    );
  }
  if (!Number.isFinite(resolved.intensity) || resolved.intensity < 0 || !Object.hasOwn(SSAO_SAMPLE_COUNTS, resolved.quality)) {
    const paramName = !Number.isFinite(resolved.intensity) || resolved.intensity < 0 ? "intensity" : "quality";
    return err$1(
      new PostProcessError({
        code: "ssao-parameter-invalid",
        detail: { paramName, value: resolved[paramName] }
      })
    );
  }
  return ok(resolved);
}
function variantSetFromDefines(defines) {
  if (defines === void 0) return void 0;
  const entries = Object.entries(defines);
  if (entries.length === 0) return void 0;
  return entries.sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([name, value]) => `${name}=${value}`).join("+");
}
function selectLazyEquirectHandle(skylight, skybox) {
  const skylightHandle = skylight?.equirectHandle ?? 0;
  return skylightHandle !== 0 ? skylightHandle : skybox?.equirectHandle ?? 0;
}
function warnMultiLightDirectional(frameState, directionalCount, envOverride) {
  if (!frameState.warnedMultiLightDirectional && directionalCount > 1) {
    frameState.warnedMultiLightDirectional = true;
    const env = globalThis.process;
    if (env?.env?.NODE_ENV !== "production") {
      console.warn(
        "[forgeax] render-system-multi-light directional: at most 1 entity (got N=" + directionalCount + "). First entity used; rest dropped.",
        {
          code: "render-system-multi-light",
          expected: "at most 1 directional",
          detail: { type: "directional", got: directionalCount }
        }
      );
    }
  }
}
function warnMultiSkylight(frameState, skylightCount, winningEntityHandle) {
  if (!frameState.warnedMultiSkylight && skylightCount > 1) {
    frameState.warnedMultiSkylight = true;
    console.warn(
      `[forgeax] Skylight: ${skylightCount} Skylight entities found; using entity ${winningEntityHandle} (first by archetype order) for IBL ambient. The other ${skylightCount - 1} Skylight ${skylightCount - 1 === 1 ? "entity is" : "entities are"} ignored. Keep a single Skylight per scene, or reorder so the intended one is first.`
    );
  }
}
function warnMultiSkybox(frameState, skyboxCount, winningEntityHandle) {
  if (!frameState.warnedMultiSkybox && skyboxCount > 1) {
    frameState.warnedMultiSkybox = true;
    console.warn(
      `[forgeax] SkyboxBackground: ${skyboxCount} SkyboxBackground entities found; using entity ${winningEntityHandle} (first by archetype order). The other ${skyboxCount - 1} ${skyboxCount - 1 === 1 ? "entity is" : "entities are"} ignored. Keep a single SkyboxBackground per scene.`
    );
  }
}
function driveLazyEquirectProjection(internals, world, frameState, equirectHandle) {
  const store = internals.gpuStore;
  const handle = toShared(equirectHandle);
  const status = store.getCubemapStatus(handle);
  if (status === "failed") {
    if (!frameState.firedEquirectProjectionFailedHandles.has(equirectHandle)) {
      frameState.firedEquirectProjectionFailedHandles.add(equirectHandle);
      internals.errorRegistry.fire(new EquirectProjectionFailedError(equirectHandle));
    }
    return;
  }
  if (status !== void 0) return;
  const podRes = resolveAssetHandle(world, handle);
  if (!podRes.ok || podRes.value.kind !== "equirect") {
    return;
  }
  void store._uploadCubemapFromEquirect(world, handle, podRes.value);
}
function isLitMaterialSnapshot(material) {
  return isStandardPbrMaterialShader(material.materialShaderId);
}
function computeViewMatrix(camera) {
  const cameraFromWorld = mat4.create();
  mat4.invert(cameraFromWorld, camera.world);
  return cameraFromWorld;
}
function computeProjectionMatrix(camera) {
  const proj = mat4.create();
  if (camera.projection === "orthographic") {
    mat4.orthographic(
      proj,
      camera.orthoLeft,
      camera.orthoRight,
      camera.orthoTop,
      camera.orthoBottom,
      camera.near,
      camera.far
    );
  } else {
    mat4.perspective(proj, camera.fov, camera.aspect, camera.near, camera.far);
  }
  return proj;
}
var VIEW_UNIFORM_BYTES = 1024;
var POINTS_LINES_VIEW_BYTES = 160;
var POINTS_LINES_VIEW_SLOT_STRIDE = 256;
var POINTS_LINES_VIEW_SLOT_COUNT = 1024;
var POINTS_LINES_VIEW_BUFFER_SIZE = POINTS_LINES_VIEW_SLOT_STRIDE * POINTS_LINES_VIEW_SLOT_COUNT;
var VIEW_UNIFORM_SLOT_STRIDE = 1024;
var POINT_SHADOW_VIEW_SLOT_COUNT = 24;
var CUBE_CAPTURE_VIEW_SLOT_BASE = 1 + POINT_SHADOW_VIEW_SLOT_COUNT;
var REFLECTION_PROBE_VIEW_SLOT_BASE = CUBE_CAPTURE_VIEW_SLOT_BASE + 6 + 1;
var REFLECTION_PROBE_VIEW_SLOT_COUNT = 16;
var VIEW_UNIFORM_BUFFER_SIZE = VIEW_UNIFORM_SLOT_STRIDE * (REFLECTION_PROBE_VIEW_SLOT_BASE + REFLECTION_PROBE_VIEW_SLOT_COUNT);
function pointShadowViewOffset(layer, face) {
  return VIEW_UNIFORM_SLOT_STRIDE * (1 + layer * 6 + face);
}
function directionalShadowFilterCarrier(quality) {
  if (quality === void 0) return [0, 0, 0, 0];
  if (quality.kind === "pcss") {
    return [
      quality.preset === "medium" ? 4 : 5,
      quality.angularRadiusRadians,
      quality.maxPenumbraTexels,
      0
    ];
  }
  switch (quality.kernel) {
    case 1:
      return [1, 0, 0, 0];
    case 3:
      return [2, 0, 0, 0];
    case 5:
      return [3, 0, 0, 0];
  }
}
function writePointsLinesViewUbo(queue, buffer, camera, width, height, model, style, byteOffset = 0) {
  const projection = computeProjectionMatrix(camera);
  const view = computeViewMatrix(camera);
  const worldViewProj = mat4.create();
  mat4.multiply(worldViewProj, projection, view);
  const payload = new Float32Array(40);
  payload.set(worldViewProj);
  if (model === void 0) {
    payload[16] = 1;
    payload[21] = 1;
    payload[26] = 1;
    payload[31] = 1;
  } else {
    for (let index = 0; index < 16; index += 1) {
      payload[16 + index] = model[index] ?? 0;
    }
  }
  payload[32] = width;
  payload[33] = height;
  if (style?.kind === "points") {
    payload[36] = style.sizePx;
    payload[38] = style.shape === "circle" ? 1 : 0;
  } else if (style?.kind === "lines") {
    payload[36] = style.widthPx;
    payload[37] = 1;
  } else {
    payload[36] = 1;
  }
  const uploaded = queue.writeBuffer(buffer, byteOffset, payload);
  if (!uploaded.ok) throw uploaded.error;
}
function writeViewUbo(queue, viewUniformBuffer, camera, light, lights, spotShadowSnapshots, temporalOrOffset, projectorSpotIndex, cloudShadowProjection) {
  const byteOffset = typeof temporalOrOffset === "number" ? temporalOrOffset : 0;
  const resolvedTemporal = typeof temporalOrOffset === "number" ? void 0 : temporalOrOffset;
  const projMatrix = computeProjectionMatrix(camera);
  const viewMatrix = computeViewMatrix(camera);
  const unjitteredViewProjection = mat4.create();
  mat4.multiply(unjitteredViewProjection, projMatrix, viewMatrix);
  const jitteredProjection = mat4.create();
  if (resolvedTemporal?.currentJitterUv !== void 0) {
    const jitter = mat4.identity(mat4.create());
    jitter[12] = resolvedTemporal.currentJitterUv[0] * 2;
    jitter[13] = resolvedTemporal.currentJitterUv[1] * -2;
    mat4.multiply(jitteredProjection, jitter, projMatrix);
  } else {
    for (let i = 0; i < 16; i += 1) jitteredProjection[i] = projMatrix[i] ?? 0;
  }
  const mainProjection = mat4.create();
  mat4.multiply(mainProjection, jitteredProjection, viewMatrix);
  const VIEW_PAYLOAD_FLOATS = 256;
  const viewPayload = new Float32Array(VIEW_PAYLOAD_FLOATS);
  for (let i = 0; i < 16; i++) viewPayload[i] = mainProjection[i] ?? 0;
  viewPayload[16] = light.direction[0] ?? 0;
  viewPayload[17] = light.direction[1] ?? -1;
  viewPayload[18] = light.direction[2] ?? 0;
  viewPayload[20] = light.color[0] ?? 0;
  viewPayload[21] = light.color[1] ?? 0;
  viewPayload[22] = light.color[2] ?? 0;
  viewPayload[24] = camera.position[0] ?? 0;
  viewPayload[25] = camera.position[1] ?? 0;
  viewPayload[26] = camera.position[2] ?? 0;
  if (lights.lightViewProj !== void 0 && lights.lightViewProj[0] !== void 0) {
    for (let i = 0; i < 16; i++) viewPayload[28 + i] = lights.lightViewProj[0][i] ?? 0;
  }
  const inverseViewProj = mat4.create();
  mat4.invert(inverseViewProj, mainProjection);
  for (let i = 0; i < 16; i++) viewPayload[44 + i] = inverseViewProj[i] ?? 0;
  if (lights.lightViewProj !== void 0) {
    for (let c = 1; c <= 3; c++) {
      const base = 60 + (c - 1) * 16;
      const lvp = lights.lightViewProj[c];
      if (lvp !== void 0) {
        for (let i = 0; i < 16; i++) viewPayload[base + i] = lvp[i] ?? 0;
      }
    }
  }
  const previous = resolvedTemporal?.previousUnjitteredViewProjection;
  for (let i = 0; i < 16; i += 1) {
    viewPayload[196 + i] = unjitteredViewProjection[i] ?? 0;
    viewPayload[212 + i] = previous?.[i] ?? 0;
  }
  viewPayload[228] = camera.near;
  viewPayload[229] = camera.far;
  viewPayload[230] = camera.projection === "orthographic" ? 1 : 0;
  const previousCameraPosition = resolvedTemporal !== void 0 && "previousCameraPosition" in resolvedTemporal ? resolvedTemporal.previousCameraPosition : void 0;
  if (previousCameraPosition !== void 0) {
    viewPayload[232] = previousCameraPosition[0] ?? 0;
    viewPayload[233] = previousCameraPosition[1] ?? 0;
    viewPayload[234] = previousCameraPosition[2] ?? 0;
    viewPayload[235] = 1;
  }
  const ssr = camera.screenSpaceReflection;
  if (ssr !== void 0) {
    viewPayload[236] = ssr.maxDistance;
    viewPayload[237] = ssr.thickness;
    viewPayload[238] = ssr.maxRoughness;
    viewPayload[239] = 1;
  }
  if (cloudShadowProjection !== void 0) {
    viewPayload[240] = cloudShadowProjection.origin[0] ?? 0;
    viewPayload[241] = cloudShadowProjection.origin[1] ?? 0;
    viewPayload[242] = cloudShadowProjection.origin[2] ?? 0;
    viewPayload[244] = cloudShadowProjection.right[0] ?? 0;
    viewPayload[245] = cloudShadowProjection.right[1] ?? 0;
    viewPayload[246] = cloudShadowProjection.right[2] ?? 0;
    viewPayload[248] = cloudShadowProjection.up[0] ?? 0;
    viewPayload[249] = cloudShadowProjection.up[1] ?? 0;
    viewPayload[250] = cloudShadowProjection.up[2] ?? 0;
    viewPayload[252] = cloudShadowProjection.range;
    viewPayload[253] = cloudShadowProjection.lowSun ? 0 : 1;
    viewPayload[254] = cloudShadowProjection.lowSun ? 1 : 0;
  }
  if (lights.splitPlanes !== void 0) {
    for (let s = 0; s < 4; s++) {
      for (let lane = 0; lane < 4; lane++) {
        viewPayload[108 + s * 4 + lane] = lights.splitPlanes[s * 4 + lane] ?? 0;
      }
    }
  }
  viewPayload[124] = lights.cascadeCount ?? 0;
  viewPayload[125] = lights.cascadeBlend ?? 0;
  viewPayload[126] = lights.depthBias ?? 1e-5;
  viewPayload[127] = lights.normalBias ?? 0.05;
  const filterCarrier = directionalShadowFilterCarrier(lights.directionalShadowQuality);
  viewPayload[128] = filterCarrier[0] ?? 0;
  viewPayload[129] = filterCarrier[1] ?? 0;
  viewPayload[130] = filterCarrier[2] ?? 0;
  viewPayload[131] = filterCarrier[3] ?? 0;
  {
    const SPOT_LVP_BASE_FLOAT = 132;
    const SPOT_LVP_LANE_COUNT = 4;
    const SPOT_LVP_FLOATS_PER_LANE = 16;
    const spotSnaps = spotShadowSnapshots;
    for (let i = 0; i < spotSnaps.length; i++) {
      const ss = spotSnaps[i];
      if (ss === void 0) continue;
      const tile = ss.shadowAtlasTile;
      const lvp = ss.lightViewProj;
      if (lvp === void 0) continue;
      const lane = tile >= 0 && tile < SPOT_LVP_LANE_COUNT ? tile : i === projectorSpotIndex ? 0 : -1;
      if (lane < 0) continue;
      const base = SPOT_LVP_BASE_FLOAT + lane * SPOT_LVP_FLOATS_PER_LANE;
      for (let f = 0; f < SPOT_LVP_FLOATS_PER_LANE; f++) {
        viewPayload[base + f] = lvp[f] ?? 0;
      }
    }
  }
  const viewUploadResult = queue.writeBuffer(viewUniformBuffer, byteOffset, viewPayload);
  if (!viewUploadResult.ok) throw viewUploadResult.error;
  for (const snapshot of lights.pointShadow ?? []) {
    if (snapshot.shadowAtlasLayer < 0 || snapshot.shadowAtlasLayer >= SHADOW_ATLAS_DEFAULT_LAYERS)
      continue;
    for (let face = 0; face < 6; face += 1) {
      const facePayload = viewPayload.slice();
      const matrix = snapshot.shadowMatrices.subarray(face * 16, (face + 1) * 16);
      facePayload.set(matrix, 28);
      const uploaded = queue.writeBuffer(
        viewUniformBuffer,
        pointShadowViewOffset(snapshot.shadowAtlasLayer, face),
        facePayload
      );
      if (!uploaded.ok) throw uploaded.error;
    }
  }
}

// src/record/frame-lighting.ts
function resolveReflectionProbeBinding(selection, table) {
  if (selection.kind !== "probe") return { probeIndex: void 0, useSkylight: true };
  const primitiveKey = `${selection.worldId}:${selection.entityKey}`;
  const tableIndex = table?.cpuIndexByPrimitive(primitiveKey);
  return { probeIndex: tableIndex ?? selection.entityKey, useSkylight: false };
}
function projectDeviceOwnedBindGroup(state, device, layout) {
  return state !== null && state !== void 0 && state.device === device && state.layout === layout ? state.bindGroup : null;
}
function runHdrpClusterProfilePhase(runner, phase, action) {
  return runner === void 0 ? action() : runner(phase, action);
}
function mapClusterUploadFailure(resource, error) {
  return new RendererOperationError("device-operation-failed", {
    operation: "draw",
    cause: {
      code: error.code,
      expected: `queue.writeBuffer succeeds for Standard Cluster ${resource}`,
      hint: `repair the device write for Standard Cluster ${resource} and retry the frame`,
      detail: error
    }
  });
}
function buildPerFrameBindGroups(internals, frameState, pipelineState, hasValidated, bindGroupCounts, graphTargets, includeView = true, standardLighting) {
  let viewBindGroup = null;
  let meshBindGroup = null;
  let hdrpClusterBindGroup = null;
  const clusteredLighting = standardLighting?.kind === "clustered";
  const membershipLayout = pipelineState.hdrpClusterMembershipBindGroupLayout;
  const membership = frameState.hdrpClusterMembership;
  const expectedHdrpBuffers = clusteredLighting ? getOrCreateHdrpBuffers(internals, frameState.installedPipelineConfig?.clusterGrid) : null;
  const currentMembership = expectedHdrpBuffers !== null && membership?.clusterGridBuffer === expectedHdrpBuffers.clusterGridBuffer ? projectDeviceOwnedBindGroup(membership, internals.device, membershipLayout) : null;
  if (membership !== null && currentMembership === null) {
    frameState.hdrpClusterMembership = null;
  }
  const hdrpClusterMembershipBindGroup = clusteredLighting ? currentMembership : null;
  if (hasValidated) {
    if (includeView) {
      const shadowSampler = pipelineState.perPassResources.shadowSampler;
      if (shadowSampler === null) {
        return {
          viewBindGroup: null,
          meshBindGroup: null,
          hdrpClusterBindGroup: null,
          hdrpClusterMembershipBindGroup
        };
      }
      const graphShadowView = graphTargets?.directionalShadow;
      const b3View = graphShadowView !== void 0 ? graphShadowView : pipelineState.shadowFallbackTextureView;
      const pointShadowAtlas = frameState.pointShadowAtlas;
      const atlasViewMaybe = pointShadowAtlas?.isAllocated() ? pointShadowAtlas.getAtlasView() : null;
      const b5View = atlasViewMaybe !== null ? atlasViewMaybe : pipelineState.shadowAtlasFallbackTextureView;
      const graphSpotShadowView = graphTargets?.spotShadow;
      const b8View = graphSpotShadowView !== void 0 ? graphSpotShadowView : pipelineState.shadowFallbackTextureView;
      const cloudShadowView = graphTargets?.cloudShadow ?? pipelineState.defaultWhiteTextureView;
      const extendedLighting = pipelineState.extendedLightingAvailable ?? true;
      const iesProfileTextureView = pipelineState.iesProfileTextureView;
      const cookieTextureView = pipelineState.cookieTextureView;
      const cookieMatrixBuffer = pipelineState.cookieMatrixBuffer;
      const ltcLambertTextureView = pipelineState.ltcLambertTextureView;
      const ltcGgxTextureView = pipelineState.ltcGgxTextureView;
      const extendedLightingResources = extendedLighting && iesProfileTextureView !== void 0 && cookieTextureView !== void 0 && cookieMatrixBuffer !== void 0 && ltcLambertTextureView !== void 0 && ltcGgxTextureView !== void 0 ? {
        sampler: pipelineState.defaultSampler,
        iesProfileTextureView,
        cookieTextureView,
        ltcLambertTextureView,
        ltcGgxTextureView,
        cookieMatrixBuffer
      } : void 0;
      if (extendedLighting && extendedLightingResources === void 0) {
        return {
          viewBindGroup: null,
          meshBindGroup: null,
          hdrpClusterBindGroup: null,
          hdrpClusterMembershipBindGroup
        };
      }
      const extendedLightingViews = extendedLightingResources !== void 0 ? [
        extendedLightingResources.sampler,
        extendedLightingResources.iesProfileTextureView,
        extendedLightingResources.cookieTextureView,
        extendedLightingResources.ltcLambertTextureView,
        extendedLightingResources.ltcGgxTextureView,
        extendedLightingResources.cookieMatrixBuffer
      ] : [];
      const projectorAvailable = pipelineState.projectorAvailable !== false;
      const lowLimitCloudBindings = !extendedLighting && !projectorAvailable;
      const b11View = graphTargets?.projector ?? pipelineState.defaultWhiteTextureView;
      const b12Sampler = graphTargets?.projectorSampler ?? pipelineState.defaultSampler;
      viewBindGroup = getOrCreateFromChain(
        frameState.viewBindGroupCache,
        [
          pipelineState.viewUniformBuffer,
          b3View,
          shadowSampler,
          b5View,
          pipelineState.shadowParamsBuffer,
          b8View,
          ...extendedLightingViews,
          ...extendedLightingResources === void 0 && projectorAvailable ? [b11View, b12Sampler] : [],
          pipelineState.pointsLinesViewBuffer ?? pipelineState.viewUniformBuffer,
          ...lowLimitCloudBindings ? [] : [cloudShadowView, pipelineState.defaultSampler]
        ],
        "view-main",
        () => {
          const entries = [
            {
              binding: 0,
              resource: {
                kind: "buffer",
                value: { buffer: pipelineState.viewUniformBuffer, size: VIEW_UNIFORM_BYTES }
              }
            },
            {
              binding: 3,
              resource: {
                kind: "textureView",
                value: b3View
              }
            },
            {
              binding: 4,
              resource: {
                kind: "sampler",
                value: shadowSampler
              }
            },
            // feat-20260612-point-light-shadows-urp-hdrp Round-2 F-1:
            // cube_array shadow atlas view (real ShadowAtlas when point
            // shadows are active; else 1x1x6 fallback).
            {
              binding: 5,
              resource: {
                kind: "textureView",
                value: b5View
              }
            },
            // feat-20260612-point-light-shadows-urp-hdrp Round-2 F-1:
            // shadowParams UBO (`array<vec4<f32>, 4>` = 64 B). Lane N
            // stores `(near, far, depthBias, normalBias)` for the point light
            // with shadowAtlasLayer === N. Updated per frame from
            // `pointShadowSnapshots` below.
            {
              binding: 6,
              resource: {
                kind: "buffer",
                value: { buffer: pipelineState.shadowParamsBuffer }
              }
            },
            // feat-20260613-csm-cascaded-shadow-maps M5 / w28 (rebased to
            // binding 7 on 2026-06-13 to make room for point-shadow 5/6):
            // forward shaders declare binding 7 in common.wgsl (shared
            // view BGL) but never reference it; only shadow_caster.wgsl
            // reads it. Host writes a stable singleton buffer so every
            // forward bind group entry stays populated.
            {
              binding: 7,
              resource: {
                kind: "buffer",
                value: { buffer: pipelineState.shadowCasterCascadeBuffer }
              }
            },
            // feat-20260625-spot-light-shadow-mapping M3 / w21 (D-5):
            // spot shadow 2D atlas (real spotShadowDepth view when spot
            // shadows run this frame, else the 1x1 depth fallback). Always-on.
            {
              binding: 8,
              resource: {
                kind: "textureView",
                value: b8View
              }
            },
            {
              binding: 10,
              resource: {
                kind: "buffer",
                value: {
                  buffer: pipelineState.pointsLinesViewBuffer ?? pipelineState.viewUniformBuffer,
                  size: POINTS_LINES_VIEW_BYTES
                }
              }
            },
            ...extendedLightingResources === void 0 && projectorAvailable ? [
              {
                binding: 11,
                resource: {
                  kind: "textureView",
                  value: b11View
                }
              },
              {
                binding: 12,
                resource: {
                  kind: "sampler",
                  value: b12Sampler
                }
              }
            ] : [],
            ...extendedLightingResources !== void 0 ? [
              {
                binding: 9,
                resource: {
                  kind: "sampler",
                  value: extendedLightingResources.sampler
                }
              },
              {
                binding: 11,
                resource: {
                  kind: "textureView",
                  value: extendedLightingResources.iesProfileTextureView
                }
              },
              {
                binding: 12,
                resource: {
                  kind: "textureView",
                  value: extendedLightingResources.cookieTextureView
                }
              },
              {
                binding: 13,
                resource: {
                  kind: "textureView",
                  value: extendedLightingResources.ltcLambertTextureView
                }
              },
              {
                binding: 14,
                resource: {
                  kind: "textureView",
                  value: extendedLightingResources.ltcGgxTextureView
                }
              },
              {
                binding: 15,
                resource: {
                  kind: "buffer",
                  value: {
                    buffer: extendedLightingResources.cookieMatrixBuffer,
                    size: COOKIE_MATRIX_BYTES
                  }
                }
              }
            ] : [],
            ...lowLimitCloudBindings ? [] : [
              {
                binding: 16,
                resource: {
                  kind: "textureView",
                  value: cloudShadowView
                }
              },
              {
                binding: 17,
                resource: {
                  kind: "sampler",
                  value: pipelineState.defaultSampler
                }
              }
            ]
            // feat-20260625-spot-light-shadow-mapping w25: the per-spot
            // fragment-read lightViewProj matrices fold into the View UBO
            // (binding 0, `view.spotLightViewProj`) — no standalone binding 9
            // (WebGL2 fragment uniform-buffer budget). binding 10 is the
            // dedicated vertex-only Points/Lines viewport UBO.
          ];
          const viewBindGroupResult = internals.device.createBindGroup({
            label: "pbr-view-bg",
            layout: pipelineState.viewBindGroupLayout,
            entries
          });
          if (!viewBindGroupResult.ok) throw viewBindGroupResult.error;
          return viewBindGroupResult.value;
        },
        bindGroupCounts
      );
    }
    meshBindGroup = getOrCreateFromChain(
      frameState.meshBindGroupCache,
      [pipelineState.meshStorageBuffer.buffer],
      "mesh",
      () => {
        const meshBindSize = internals.device.caps.storageBuffer ? MESH_SSBO_BYTES : MESH_UBO_FULL_ARRAY_BYTES;
        const meshBindGroupResult = internals.device.createBindGroup({
          label: "pbr-mesh-bg",
          layout: pipelineState.meshBindGroupLayout,
          entries: [
            {
              binding: 0,
              resource: {
                kind: "buffer",
                value: {
                  buffer: pipelineState.meshStorageBuffer.buffer,
                  offset: 0,
                  size: meshBindSize
                }
              }
            }
          ]
        });
        if (!meshBindGroupResult.ok) throw meshBindGroupResult.error;
        return meshBindGroupResult.value;
      },
      bindGroupCounts
    );
    if (clusteredLighting) {
      const hdrpBuffers = expectedHdrpBuffers;
      if (hdrpBuffers !== null) {
        hdrpClusterBindGroup = getOrCreateFromChain(
          frameState.meshBindGroupCache,
          [
            pipelineState.meshStorageBuffer.buffer,
            hdrpBuffers.lightDataBuffer,
            hdrpBuffers.clusterGridBuffer,
            hdrpBuffers.lightIndexListBuffer,
            hdrpBuffers.clusterUniformBuffer
          ],
          "hdrp-unified",
          () => {
            const bg = createHdrpUnifiedBindGroup(
              internals,
              hdrpBuffers,
              pipelineState.meshStorageBuffer.buffer
            );
            if (bg === null) {
              throw new RhiError({
                code: "webgpu-runtime-error",
                expected: "HDRP unified BindGroup creation succeeds when HDRP is active",
                hint: "inspect prior errorRegistry events for createBindGroup failure detail"
              });
            }
            return bg;
          },
          bindGroupCounts
        );
      }
    }
  }
  return { viewBindGroup, meshBindGroup, hdrpClusterBindGroup, hdrpClusterMembershipBindGroup };
}
function prepareFrameLighting(internals, frameState, lights, camera, pipelineState) {
  if (lights.directionalCount > 1) {
    warnMultiLightDirectional(frameState, lights.directionalCount);
  }
  frameState.pointShadowSnapshots = lights.pointShadow;
  frameState.spotShadowSnapshots = lights.spot;
  if (lights.pointShadow.length > 0) {
    if (frameState.pointShadowAtlas === null) {
      const firstSnap = lights.pointShadow[0];
      const faceSize = firstSnap?.mapSize ?? SHADOW_ATLAS_DEFAULT_FACE_SIZE;
      frameState.pointShadowAtlas = new ShadowAtlas(internals.device, {
        faceSize,
        layers: SHADOW_ATLAS_DEFAULT_LAYERS
      });
    }
    try {
      frameState.pointShadowAtlas.ensure();
    } catch (e) {
      if (e instanceof PointShadowAtlasUninitializedError || e instanceof PointShadowAtlasBoundsViolationError) {
        internals.errorRegistry.fire(e);
      } else {
        throw e;
      }
    }
  }
  const directionalLight = lights.directional;
  const pointLights = lights.point;
  const spotLights = lights.spot;
  const rectLights = lights.rect;
  const light = directionalLight ?? {
    kind: "directional",
    direction: vec3.create(0, -1, 0),
    color: vec3.create(0, 0, 0),
    intensity: 0
  };
  const totalLightCount = (directionalLight !== void 0 ? 1 : 0) + pointLights.length + spotLights.length + rectLights.length;
  const clusterGrid = frameState.installedPipelineConfig?.clusterGrid ?? DEFAULT_CLUSTER_GRID;
  const local = [
    ...pointLights.map((source) => ({
      kind: "point",
      shadowed: source.shadowAtlasLayer !== void 0 && source.shadowAtlasLayer >= 0,
      position: source.position,
      range: Number.isFinite(source.invRangeSquared) && source.invRangeSquared > 0 ? Math.sqrt(1 / source.invRangeSquared) : 1e3,
      source
    })),
    ...spotLights.map((source) => ({
      kind: "spot",
      shadowed: source.castShadow && source.shadowAtlasTile >= 0 && source.lightViewProj !== void 0,
      position: source.position,
      range: Number.isFinite(source.invRangeSquared) && source.invRangeSquared > 0 ? Math.sqrt(1 / source.invRangeSquared) : 1e3,
      source
    })),
    ...rectLights.map((source) => ({
      kind: "rect-area",
      shadowed: false,
      position: source.position,
      range: (Number.isFinite(source.invRangeSquared) && source.invRangeSquared > 0 ? Math.sqrt(1 / source.invRangeSquared) : 1e3) + Math.hypot(source.halfWidth, source.halfHeight),
      source
    }))
  ];
  const prepared = prepareStandardLighting({
    directional: directionalLight,
    local,
    view: computeViewMatrix(camera),
    projection: computeProjectionMatrix(camera),
    near: camera.near,
    far: camera.far,
    grid: clusterGrid,
    lightCount: internals.standardProfile?.lightCount ?? DEFAULT_STANDARD_PROFILE.lightCount,
    renderPath: internals.standardProfile?.renderPath ?? DEFAULT_STANDARD_PROFILE.renderPath
  });
  if (!prepared.ok) return prepared;
  if (prepared.value.local.length === 0 && !internals.device.caps.storageBuffer) {
    return ok({
      light,
      pointLights,
      spotLights,
      rectLights,
      totalLightCount,
      standard: { kind: "no-local-lights", prepared: prepared.value }
    });
  }
  const transport = selectStandardClusterTransport(
    {
      compute: internals.device.caps.compute,
      storageBuffer: internals.device.caps.storageBuffer,
      membershipPipelineReady: pipelineState !== void 0 && pipelineState.hdrpClusterMembershipPipeline !== null && pipelineState.hdrpClusterMembershipBindGroupLayout !== null
    },
    prepared.value
  );
  if (!transport.ok) return transport;
  return ok({
    light,
    pointLights,
    spotLights,
    rectLights,
    totalLightCount,
    standard: { kind: "clustered", prepared: prepared.value, transport: transport.value }
  });
}
function modifierDigest(data) {
  let hash = 2166136261;
  for (let index = 0; index < data.length; index += 1) {
    hash ^= data[index] ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function writeSpotModifierTextures(internals, pipelineState, spots) {
  const iesTexture = pipelineState.iesProfileTexture;
  const cookieTexture = pipelineState.cookieTexture;
  const cookieMatrixBuffer = pipelineState.cookieMatrixBuffer;
  if (iesTexture === void 0 && cookieTexture === void 0 && cookieMatrixBuffer === void 0)
    return;
  let state = pipelineState.spotModifierUploadState;
  if (state === void 0) {
    state = { ies: /* @__PURE__ */ new Map(), cookie: /* @__PURE__ */ new Map(), cookieMatrix: /* @__PURE__ */ new Map() };
    pipelineState.spotModifierUploadState = state;
  } else if (state.cookieMatrix === void 0) {
    state = { ...state, cookieMatrix: /* @__PURE__ */ new Map() };
    pipelineState.spotModifierUploadState = state;
  }
  for (const spot of spots) {
    if (spot.iesProfileSlice !== void 0 && spot.iesProfileData !== void 0 && iesTexture) {
      if (spot.iesProfileData.byteLength === IES_SLICE_WIDTH * IES_SLICE_HEIGHT * 2) {
        const digest = modifierDigest(spot.iesProfileData);
        if (state.ies.get(spot.iesProfileSlice) !== digest) {
          const result = internals.device.queue.writeTexture(
            { texture: iesTexture, mipLevel: 0, origin: { x: 0, y: 0, z: spot.iesProfileSlice } },
            spot.iesProfileData,
            { offset: 0, bytesPerRow: IES_SLICE_WIDTH * 2, rowsPerImage: IES_SLICE_HEIGHT },
            { width: IES_SLICE_WIDTH, height: IES_SLICE_HEIGHT, depthOrArrayLayers: 1 }
          );
          if (!result.ok) throw result.error;
          state.ies.set(spot.iesProfileSlice, digest);
        }
      }
    }
    for (const modifier of [
      {
        slice: spot.cookieSlice,
        data: spot.cookieData,
        matrix: spot.cookieMatrix
      },
      {
        slice: spot.projectorSlice,
        data: spot.projectorData,
        matrix: spot.projectorMatrix
      }
    ]) {
      if (modifier.slice !== void 0 && modifier.data !== void 0 && cookieTexture) {
        if (modifier.data.byteLength === COOKIE_SLICE_SIZE * COOKIE_SLICE_SIZE * 4) {
          const digest = modifierDigest(modifier.data);
          if (state.cookie.get(modifier.slice) !== digest) {
            const result = internals.device.queue.writeTexture(
              { texture: cookieTexture, mipLevel: 0, origin: { x: 0, y: 0, z: modifier.slice } },
              modifier.data,
              { offset: 0, bytesPerRow: COOKIE_SLICE_SIZE * 4, rowsPerImage: COOKIE_SLICE_SIZE },
              { width: COOKIE_SLICE_SIZE, height: COOKIE_SLICE_SIZE, depthOrArrayLayers: 1 }
            );
            if (!result.ok) throw result.error;
            state.cookie.set(modifier.slice, digest);
          }
        }
      }
      if (modifier.slice !== void 0 && modifier.matrix !== void 0 && cookieMatrixBuffer) {
        const matrixBytes = new Uint8Array(
          modifier.matrix.buffer,
          modifier.matrix.byteOffset,
          modifier.matrix.byteLength
        );
        const digest = modifierDigest(matrixBytes);
        if (state.cookieMatrix.get(modifier.slice) !== digest) {
          const result = internals.device.queue.writeBuffer(
            cookieMatrixBuffer,
            modifier.slice * 16 * Float32Array.BYTES_PER_ELEMENT,
            modifier.matrix
          );
          if (!result.ok) throw result.error;
          state.cookieMatrix.set(modifier.slice, digest);
        }
      }
    }
  }
}
function writeShadowParamsBuffer(internals, frameState, pipelineState) {
  const SHADOW_PARAMS_LANE_COUNT = 4;
  const SHADOW_PARAMS_FLOATS_PER_LANE = 4;
  const shadowParamsArr = new Float32Array(
    SHADOW_PARAMS_LANE_COUNT * SHADOW_PARAMS_FLOATS_PER_LANE
  );
  for (let i = 0; i < frameState.pointShadowSnapshots.length; i++) {
    const ps = frameState.pointShadowSnapshots[i];
    if (ps === void 0) continue;
    const layer = ps.shadowAtlasLayer;
    if (layer < 0 || layer >= SHADOW_PARAMS_LANE_COUNT) continue;
    const base = layer * SHADOW_PARAMS_FLOATS_PER_LANE;
    const near = ps.nearPlane;
    const far = ps.farPlane;
    shadowParamsArr[base] = near;
    shadowParamsArr[base + 1] = far;
    shadowParamsArr[base + 2] = ps.depthBias;
    shadowParamsArr[base + 3] = ps.normalBias;
  }
  const shadowParamsWriteRes = internals.device.queue.writeBuffer(
    pipelineState.shadowParamsBuffer,
    0,
    shadowParamsArr
  );
  if (!shadowParamsWriteRes.ok) {
    internals.errorRegistry.fire(shadowParamsWriteRes.error);
  }
}
function warnZeroLightStandard(frameState, renderables, skylight, totalLightCount) {
  const hasStandardMaterial = renderables.some((r) => isLitMaterialSnapshot(r.material));
  if (skylight === void 0 && totalLightCount === 0 && hasStandardMaterial && !frameState.warnedZeroLightStandard) {
    frameState.warnedZeroLightStandard = true;
    const env = globalThis.process;
    if (env?.env?.NODE_ENV !== "production") {
      console.warn(
        "[forgeax] standard material renders black with 0 lights of every type (no Skylight, and directional + point + spot all empty); spawn at least one light (Skylight, DirectionalLight, PointLight, or SpotLight) or switch material to an unlit shader (Materials.unlit(...)). See AGENTS.md section Breaking changes 2026-05-19."
      );
    }
  }
}
function writeHdrpClusterAndSsaoBuffers(internals, frameState, camera, prepared, transport, profilePhase, gpuMembershipPipelineReady = false, membershipBindGroupLayout = null, projectorLightSlotIndex, pipelineState) {
  const configuredClusterGrid = prepared.layout.grid;
  const gpuMembership = transport.producer === "gpu";
  if (gpuMembership && (!gpuMembershipPipelineReady || membershipBindGroupLayout === null)) {
    return err$1(
      new StandardClusterTransportUnavailableError(
        prepared.local.length,
        "the selected GPU Cluster producer requires a ready membership pipeline and bind-group layout"
      )
    );
  }
  const hdrpBuffers = getOrCreateHdrpBuffers(internals, configuredClusterGrid);
  if (hdrpBuffers === null) {
    return err$1(
      new StandardClusterTransportUnavailableError(
        prepared.local.length,
        "the selected Standard Cluster transport could not allocate its persistent buffers"
      )
    );
  }
  const existingMembership = projectDeviceOwnedBindGroup(
    frameState.hdrpClusterMembership,
    internals.device,
    membershipBindGroupLayout
  );
  const membershipMatchesBuffers = existingMembership !== null && frameState.hdrpClusterMembership?.clusterGridBuffer === hdrpBuffers.clusterGridBuffer;
  if (!membershipMatchesBuffers) frameState.hdrpClusterMembership = null;
  if (gpuMembership && membershipBindGroupLayout !== null && frameState.hdrpClusterMembership === null) {
    const bindGroup = createHdrpClusterMembershipBindGroup(
      internals,
      hdrpBuffers,
      membershipBindGroupLayout
    );
    if (bindGroup === null) {
      return err$1(
        new StandardClusterTransportUnavailableError(
          prepared.local.length,
          "the selected GPU Cluster producer could not create its membership bind group"
        )
      );
    }
    frameState.hdrpClusterMembership = {
      device: internals.device,
      layout: membershipBindGroupLayout,
      bindGroup,
      clusterGridBuffer: hdrpBuffers.clusterGridBuffer
    };
  }
  if (pipelineState !== void 0) {
    const preparedSpots = [];
    for (const local of prepared.local) {
      if (local.source?.kind === "spot") preparedSpots.push(local.source);
    }
    writeSpotModifierTextures(internals, pipelineState, preparedSpots);
  }
  const gridX = prepared.layout.grid.x;
  const gridY = prepared.layout.grid.y;
  const gridZ = prepared.layout.grid.z;
  const clusterGridBuf = prepared.clusterGrid;
  const lightIndexListBuf = prepared.lightIndexList;
  const lightIndexCount = prepared.membershipEntryCount;
  const envFalsify = globalThis.process?.env;
  if (envFalsify?.FORGEAX_HDRP_FALSIFY_CLUSTER_GRID_ZERO) clusterGridBuf.fill(0);
  const hdrpPayload = runHdrpClusterProfilePhase(
    profilePhase,
    "record/scene-state/hdrp-cluster/payload-packing",
    () => {
      const lightDataPayload = new Float32Array(
        prepared.layout.lightDataSlotCount * DIRECT_LIGHT_SLOT_FLOAT_COUNT
      );
      let slotIdx = 0;
      for (const local of prepared.local) {
        const source = local.source;
        if (source === void 0) return null;
        const projectorSelected = projectorLightSlotIndex === void 0 ? void 0 : projectorLightSlotIndex === slotIdx;
        const packed = packDirectLightSlot(source, projectorSelected);
        lightDataPayload.set(packed, slotIdx * DIRECT_LIGHT_SLOT_FLOAT_COUNT);
        slotIdx += 1;
      }
      const clusterSsaoConfig = frameState.installedPipelineConfig?.ssao;
      const clusterSsaoIntensity = clusterSsaoConfig !== void 0 && clusterSsaoConfig.enabled === true ? clusterSsaoConfig.intensity ?? 1 : 0;
      const clusterUniformPayload = packClusterUniform(
        { x: gridX, y: gridY, z: gridZ },
        camera.near,
        camera.far,
        clusterSsaoIntensity,
        transport.admittedLightCount
      );
      return {
        hdrpBuffers,
        lightDataUploadPayload: lightDataPayload.subarray(
          0,
          slotIdx * DIRECT_LIGHT_SLOT_FLOAT_COUNT
        ),
        clusterUniformPayload: new Uint8Array(clusterUniformPayload)
      };
    }
  );
  if (hdrpPayload === null) {
    return err$1(
      new StandardClusterTransportUnavailableError(
        prepared.local.length,
        "the prepared Standard Cluster payload could not be materialized"
      )
    );
  }
  const bufferUpload = runHdrpClusterProfilePhase(
    profilePhase,
    "record/scene-state/hdrp-cluster/buffer-upload",
    () => {
      const { hdrpBuffers: hdrpBuffers2, lightDataUploadPayload, clusterUniformPayload } = hdrpPayload;
      const lightDataUpload = internals.device.queue.writeBuffer(
        hdrpBuffers2.lightDataBuffer,
        0,
        lightDataUploadPayload
      );
      if (!lightDataUpload.ok)
        return err$1(mapClusterUploadFailure("light-data", lightDataUpload.error));
      if (gpuMembership) {
        const lightBoundsUpload = internals.device.queue.writeBuffer(
          hdrpBuffers2.lightBoundsBuffer,
          0,
          prepared.lightBounds
        );
        if (!lightBoundsUpload.ok)
          return err$1(mapClusterUploadFailure("light-bounds", lightBoundsUpload.error));
      }
      const clusterGridUpload = internals.device.queue.writeBuffer(
        hdrpBuffers2.clusterGridBuffer,
        0,
        clusterGridBuf.subarray(0, gridX * gridY * gridZ * 2)
      );
      if (!clusterGridUpload.ok)
        return err$1(mapClusterUploadFailure("cluster-grid", clusterGridUpload.error));
      if (!gpuMembership && lightIndexCount > 0) {
        const lightIndexListUpload = internals.device.queue.writeBuffer(
          hdrpBuffers2.lightIndexListBuffer,
          0,
          lightIndexListBuf.subarray(0, lightIndexCount)
        );
        if (!lightIndexListUpload.ok) {
          return err$1(mapClusterUploadFailure("light-index-list", lightIndexListUpload.error));
        }
      }
      const clusterUniformUpload = internals.device.queue.writeBuffer(
        hdrpBuffers2.clusterUniformBuffer,
        0,
        clusterUniformPayload
      );
      if (!clusterUniformUpload.ok) {
        return err$1(mapClusterUploadFailure("cluster-uniform", clusterUniformUpload.error));
      }
      return ok(void 0);
    }
  );
  if (!bufferUpload.ok) return bufferUpload;
  const ssaoUpload = runHdrpClusterProfilePhase(
    profilePhase,
    "record/scene-state/hdrp-cluster/buffer-upload",
    () => {
      if (frameState.installedPipelineConfig?.ssao?.enabled !== true) return ok(void 0);
      const ssaoBufs = getOrCreateSsaoBuffers(internals);
      if (ssaoBufs === null) return ok(void 0);
      const sProj = computeProjectionMatrix(camera);
      const sView = computeViewMatrix(camera);
      const invProjOnly = mat4.create();
      mat4.invert(invProjOnly, sProj);
      const ssaoUniformPayload = new Float32Array(64);
      ssaoUniformPayload.set(sView, 0);
      ssaoUniformPayload.set(sProj, 16);
      ssaoUniformPayload.set(invProjOnly, 32);
      const ssaoConfig = frameState.installedPipelineConfig?.ssao;
      const parameters = getSsaoParameters(
        ssaoConfig !== void 0 && ssaoConfig.enabled === true ? ssaoConfig : void 0
      );
      ssaoUniformPayload[48] = parameters.intensity;
      ssaoUniformPayload[49] = parameters.radius;
      ssaoUniformPayload[50] = parameters.bias;
      ssaoUniformPayload[51] = SSAO_SAMPLE_COUNTS[parameters.quality];
      const ssaoUniformRes = internals.device.queue.writeBuffer(
        ssaoBufs.uniformBuffer,
        0,
        ssaoUniformPayload
      );
      if (!ssaoUniformRes.ok)
        return err$1(mapClusterUploadFailure("ssao-uniform", ssaoUniformRes.error));
      return ok(void 0);
    }
  );
  if (!ssaoUpload.ok) return ssaoUpload;
  return ok(void 0);
}
function resolveSkyboxActive(internals, frameState, camera, skybox) {
  const tonemapActive = camera.tonemap !== "none";
  let skyboxActive = skybox !== void 0 && tonemapActive;
  if (skybox !== void 0 && !tonemapActive && !frameState.warnedSkyboxTonemapNone) {
    frameState.warnedSkyboxTonemapNone = true;
    console.warn(
      '[forgeax] SkyboxBackground: skybox requires tonemap active (camera.tonemap !== "none") to write HDR target. The skybox pass will be skipped for this frame.'
    );
  }
  if (skybox !== void 0 && tonemapActive) {
    const cubemapView = internals.gpuStore.getCubemapGpuView(
      toShared(skybox.equirectHandle)
    );
    if (cubemapView === void 0) {
      skyboxActive = false;
    }
  }
  return { tonemapActive, skyboxActive };
}
var scopeCaches = /* @__PURE__ */ new WeakMap();
function getOrCreateIblCache(scope) {
  const existing = scopeCaches.get(scope);
  if (existing !== void 0) return existing;
  const cache3 = {
    probeKernel: createIblKernelCache(scope.generation),
    irradianceBakeCount: 0,
    prefilterBakeCount: 0,
    brdfLutBakeCount: 0
  };
  scopeCaches.set(scope, cache3);
  return cache3;
}
var iblComposedShadersCache;
function getIblProbeBackgroundSource() {
  return iblComposedShadersCache?.probeBackground;
}
function setIblComposedShaders(sources) {
  iblComposedShadersCache = sources;
}
var CUBEMAP_FACE_VERTICES = new Float32Array([
  // +X face (+1, 0, 0)
  1,
  -1,
  -1,
  1,
  -1,
  1,
  1,
  1,
  1,
  1,
  -1,
  -1,
  1,
  1,
  1,
  1,
  1,
  -1,
  // -X face (-1, 0, 0)
  -1,
  -1,
  1,
  -1,
  -1,
  -1,
  -1,
  1,
  -1,
  -1,
  -1,
  1,
  -1,
  1,
  -1,
  -1,
  1,
  1,
  // +Y face (0, +1, 0)
  -1,
  1,
  -1,
  -1,
  1,
  1,
  1,
  1,
  1,
  -1,
  1,
  -1,
  1,
  1,
  1,
  1,
  1,
  -1,
  // -Y face (0, -1, 0)
  -1,
  -1,
  1,
  -1,
  -1,
  -1,
  1,
  -1,
  -1,
  -1,
  -1,
  1,
  1,
  -1,
  -1,
  1,
  -1,
  1,
  // +Z face (0, 0, +1)
  -1,
  -1,
  1,
  -1,
  1,
  1,
  1,
  1,
  1,
  -1,
  -1,
  1,
  1,
  1,
  1,
  1,
  -1,
  1,
  // -Z face (0, 0, -1)
  1,
  -1,
  -1,
  1,
  1,
  -1,
  -1,
  1,
  -1,
  1,
  -1,
  -1,
  -1,
  1,
  -1,
  -1,
  -1,
  -1
]);
var CAPTURE_VIEW_PROJS = buildCaptureViewProjs();
function buildCaptureViewProjs() {
  const targets = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1]
  ];
  const ups = [
    [0, -1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
    [0, -1, 0],
    [0, -1, 0]
  ];
  const proj = cubemapCaptureProjection(Math.PI / 2, 0.1, 10);
  return targets.map((_t, i) => {
    const t = _t;
    const u = ups[i] ?? [0, -1, 0];
    const view = lookAtMatrix([0, 0, 0], t, u);
    return mulMat4(proj, view);
  });
}
function cubemapCaptureProjection(fovy, near, far) {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f,
    0,
    0,
    0,
    0,
    -f,
    0,
    0,
    0,
    0,
    (far + near) * nf,
    -1,
    0,
    0,
    2 * far * near * nf,
    0
  ]);
}
function lookAtMatrix(eye, target, up) {
  const [ex, ey0, ez] = [eye[0] ?? 0, eye[1] ?? 0, eye[2] ?? 0];
  const [tx, ty, tz] = [target[0] ?? 0, target[1] ?? 0, target[2] ?? 0];
  const [upx, upy, upz] = [up[0] ?? 0, up[1] ?? 0, up[2] ?? 0];
  let fx = ex - tx, fy = ey0 - ty, fz = ez - tz;
  const fLen = Math.sqrt(fx * fx + fy * fy + fz * fz);
  fx /= fLen;
  fy /= fLen;
  fz /= fLen;
  let rx = upy * fz - upz * fy;
  let ry = upz * fx - upx * fz;
  let rz = upx * fy - upy * fx;
  const rLen = Math.sqrt(rx * rx + ry * ry + rz * rz);
  rx /= rLen;
  ry /= rLen;
  rz /= rLen;
  const ux = fy * rz - fz * ry;
  const uy = fz * rx - fx * rz;
  const uz = fx * ry - fy * rx;
  return new Float32Array([
    rx,
    ux,
    fx,
    0,
    ry,
    uy,
    fy,
    0,
    rz,
    uz,
    fz,
    0,
    -(rx * ex + ry * ey0 + rz * ez),
    -(ux * ex + uy * ey0 + uz * ez),
    -(fx * ex + fy * ey0 + fz * ez),
    1
  ]);
}
function mulMat4(a, b) {
  const r = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += (a[k * 4 + row] ?? 0) * (b[c * 4 + k] ?? 0);
      }
      r[c * 4 + row] = sum;
    }
  }
  return r;
}
var IRRADIANCE_SIZE = 32;
var PREFILTER_SIZE = 128;
var PREFILTER_MIP_LEVELS = 5;
var BRDF_LUT_SIZE = 256;
async function createIblPipelines(scope, device, factory, cubeOutputFormat = "rgba16float") {
  const cache3 = getOrCreateIblCache(scope);
  if (cache3.equirectToCubePipeline !== void 0 && cache3.irradiancePipeline !== void 0 && cache3.prefilterPipeline !== void 0 && cache3.brdfLutPipeline !== void 0) {
    return ok$1({
      equirectToCubePipeline: cache3.equirectToCubePipeline,
      irradiancePipeline: cache3.irradiancePipeline,
      prefilterPipeline: cache3.prefilterPipeline,
      brdfLutPipeline: cache3.brdfLutPipeline
    });
  }
  const outputFormat = cubeOutputFormat;
  cache3.outputFormat = outputFormat;
  const composed = iblComposedShadersCache;
  const fallbackCode = "@vertex fn vs() -> @builtin(position) vec4<f32> { return vec4<f32>(0.0); }";
  const src = composed ?? {
    equirectToCube: fallbackCode,
    irradiance: fallbackCode,
    prefilter: fallbackCode,
    brdfLut: fallbackCode
  };
  const modules = await Promise.all([
    factory(device, { code: src.equirectToCube, label: "ibl-equirect-to-cube" }),
    factory(device, { code: src.irradiance, label: "ibl-irradiance" }),
    factory(device, { code: src.prefilter, label: "ibl-prefilter" }),
    factory(device, { code: src.brdfLut, label: "ibl-brdf-lut" })
  ]);
  for (const m of modules) {
    if (!m.ok) return err(m.error);
  }
  const shaderModules = modules.flatMap((module) => module.ok ? [module.value] : []);
  if (shaderModules.length !== 4) {
    return err(iblPipelineError("shader-modules", "ibl-shader-module-missing"));
  }
  const [mEq, mIr, mPr, mBr] = shaderModules;
  if (mEq === void 0 || mIr === void 0 || mPr === void 0 || mBr === void 0) {
    return err(iblPipelineError("shader-modules", "ibl-shader-module-missing"));
  }
  const faceBgl = device.createBindGroupLayout({
    label: "ibl-face-uniforms-bgl",
    entries: [{ binding: 0, visibility: GPU_SHADER_STAGE_VERTEX, buffer: { type: "uniform" } }]
  });
  if (!faceBgl.ok) return err(faceBgl.error);
  cache3.faceUniformsBgl = faceBgl.value;
  const prefilterGroup0 = device.createBindGroupLayout({
    label: "ibl-prefilter-group0-bgl",
    entries: [
      { binding: 0, visibility: GPU_SHADER_STAGE_VERTEX, buffer: { type: "uniform" } },
      { binding: 1, visibility: GPU_SHADER_STAGE_FRAGMENT, buffer: { type: "uniform" } }
    ]
  });
  if (!prefilterGroup0.ok) return err(prefilterGroup0.error);
  cache3.prefilterGroup0Bgl = prefilterGroup0.value;
  const equirectGroup1 = device.createBindGroupLayout({
    label: "ibl-equirect-group1-bgl",
    entries: [
      {
        binding: 0,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        texture: { sampleType: "float", viewDimension: "2d" }
      },
      {
        binding: 1,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        sampler: { type: "filtering" }
      }
    ]
  });
  if (!equirectGroup1.ok) return err(equirectGroup1.error);
  cache3.equirectGroup1Bgl = equirectGroup1.value;
  const cubeGroup1 = device.createBindGroupLayout({
    label: "ibl-cube-group1-bgl",
    entries: [
      {
        binding: 0,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        texture: { sampleType: "float", viewDimension: "cube" }
      },
      {
        binding: 1,
        visibility: GPU_SHADER_STAGE_FRAGMENT,
        sampler: { type: "filtering" }
      }
    ]
  });
  if (!cubeGroup1.ok) return err(cubeGroup1.error);
  cache3.cubeGroup1Bgl = cubeGroup1.value;
  const equirectLayout = device.createPipelineLayout({
    label: "ibl-equirect-pipeline-layout",
    bindGroupLayouts: [faceBgl.value, equirectGroup1.value]
  });
  if (!equirectLayout.ok) return err(equirectLayout.error);
  const irradianceLayout = device.createPipelineLayout({
    label: "ibl-irradiance-pipeline-layout",
    bindGroupLayouts: [faceBgl.value, cubeGroup1.value]
  });
  if (!irradianceLayout.ok) return err(irradianceLayout.error);
  const prefilterLayout = device.createPipelineLayout({
    label: "ibl-prefilter-pipeline-layout",
    bindGroupLayouts: [prefilterGroup0.value, cubeGroup1.value]
  });
  if (!prefilterLayout.ok) return err(prefilterLayout.error);
  const brdfLutLayout = device.createPipelineLayout({
    label: "ibl-brdf-lut-pipeline-layout",
    bindGroupLayouts: []
  });
  if (!brdfLutLayout.ok) return err(brdfLutLayout.error);
  const vertexLayout3F = {
    arrayStride: 12,
    attributes: [{ shaderLocation: 0, offset: 0, format: "float32x3" }]
  };
  const pipeEquirect = device.createRenderPipeline({
    label: "ibl-equirect-to-cube-pipeline",
    layout: equirectLayout.value,
    vertex: { module: mEq, entryPoint: "cubemap_vs", buffers: [vertexLayout3F] },
    fragment: {
      module: mEq,
      entryPoint: "equirectToCube_fs",
      targets: [{ format: cubeOutputFormat }]
    },
    primitive: { topology: "triangle-list", cullMode: "none" }
  });
  if (!pipeEquirect.ok) return err(pipeEquirect.error);
  cache3.equirectToCubePipeline = pipeEquirect.value;
  const pipeIrradiance = device.createRenderPipeline({
    label: "ibl-irradiance-pipeline",
    layout: irradianceLayout.value,
    vertex: { module: mIr, entryPoint: "cubemap_vs", buffers: [vertexLayout3F] },
    fragment: {
      module: mIr,
      entryPoint: "irradianceConvolve_fs",
      targets: [{ format: cubeOutputFormat }]
    },
    primitive: { topology: "triangle-list", cullMode: "none" }
  });
  if (!pipeIrradiance.ok) return err(pipeIrradiance.error);
  cache3.irradiancePipeline = pipeIrradiance.value;
  const pipePrefilter = device.createRenderPipeline({
    label: "ibl-prefilter-pipeline",
    layout: prefilterLayout.value,
    vertex: { module: mPr, entryPoint: "cubemap_vs", buffers: [vertexLayout3F] },
    fragment: {
      module: mPr,
      entryPoint: "prefilterEnv_fs",
      targets: [{ format: cubeOutputFormat }]
    },
    primitive: { topology: "triangle-list", cullMode: "none" }
  });
  if (!pipePrefilter.ok) return err(pipePrefilter.error);
  cache3.prefilterPipeline = pipePrefilter.value;
  const pipeBrdfLut = device.createRenderPipeline({
    label: "ibl-brdf-lut-pipeline",
    layout: brdfLutLayout.value,
    vertex: { module: mBr, entryPoint: "fullscreen_vs", buffers: [] },
    fragment: {
      module: mBr,
      entryPoint: "brdfLutBake_fs",
      targets: [{ format: cubeOutputFormat }]
    },
    primitive: { topology: "triangle-list", cullMode: "none" }
  });
  if (!pipeBrdfLut.ok) return err(pipeBrdfLut.error);
  cache3.brdfLutPipeline = pipeBrdfLut.value;
  return ok$1({
    equirectToCubePipeline: pipeEquirect.value,
    irradiancePipeline: pipeIrradiance.value,
    prefilterPipeline: pipePrefilter.value,
    brdfLutPipeline: pipeBrdfLut.value
  });
}
function iblPipelineError(stage, code, cause) {
  return {
    code,
    expected: `${stage} completed through the RHI Result contract`,
    hint: `inspect the ${stage} RHI error before retrying IBL pipeline creation`,
    detail: { stage, ...{}  }
  };
}
async function runIblPrecompute(opts) {
  const { device, scope } = opts;
  const cache3 = getOrCreateIblCache(scope);
  const outputFormat = cache3.outputFormat ?? "rgba16float";
  const generation = scope.generation;
  const candidate = {};
  const fail = (stage, cause) => {
    return Promise.resolve(err(badAlloc(stage, cause)));
  };
  if (cache3.equirectToCubePipeline === void 0 || cache3.irradiancePipeline === void 0 || cache3.prefilterPipeline === void 0 || cache3.brdfLutPipeline === void 0) {
    return err({
      code: "ibl-precompute-not-dispatched",
      expected: "4 IBL pipelines created via createIblPipelines",
      hint: "check IblPipelineCache.createIblPipelines was called before runIblPrecompute; counters must not increment before queue.submit",
      detail: { stage: "pipeline-cache" }
    });
  }
  {
    const textureResult = device.createTexture({
      label: "ibl-irradiance-cube",
      size: { width: IRRADIANCE_SIZE, height: IRRADIANCE_SIZE, depthOrArrayLayers: 6 },
      mipLevelCount: 1,
      sampleCount: 1,
      dimension: "2d",
      format: outputFormat,
      usage: GPU_TEXTURE_USAGE_RENDER_ATTACHMENT_AND_TEXTURE_BINDING | GPU_TEXTURE_USAGE_COPY_DST | GPU_TEXTURE_USAGE_COPY_SRC,
      viewFormats: [],
      textureBindingViewDimension: void 0
    });
    if (!textureResult.ok) return fail("irradiance-texture", textureResult.error);
    candidate.irradianceTexture = adoptIblTexture(scope, device, textureResult.value);
    const cubeViewResult = device.createTextureView(textureResult.value, {
      label: "ibl-irradiance-cube-view",
      dimension: "cube",
      arrayLayerCount: 6
    });
    if (!cubeViewResult.ok) return fail("irradiance-view", cubeViewResult.error);
    candidate.irradianceView = cubeViewResult.value;
    const faceViews = [];
    for (let f = 0; f < 6; f++) {
      const viewResult = device.createTextureView(textureResult.value, {
        label: `ibl-irradiance-face-${f}`,
        dimension: "2d",
        baseArrayLayer: f,
        arrayLayerCount: 1
      });
      if (!viewResult.ok) return fail("irradiance-face-view", viewResult.error);
      faceViews.push(viewResult.value);
    }
    candidate.irradianceFaceViews = faceViews;
  }
  {
    const textureResult = device.createTexture({
      label: "ibl-prefilter-cube",
      size: { width: PREFILTER_SIZE, height: PREFILTER_SIZE, depthOrArrayLayers: 6 },
      mipLevelCount: PREFILTER_MIP_LEVELS,
      sampleCount: 1,
      dimension: "2d",
      format: outputFormat,
      usage: GPU_TEXTURE_USAGE_RENDER_ATTACHMENT_AND_TEXTURE_BINDING | GPU_TEXTURE_USAGE_COPY_DST | GPU_TEXTURE_USAGE_COPY_SRC,
      viewFormats: [],
      textureBindingViewDimension: void 0
    });
    if (!textureResult.ok) return fail("prefilter-texture", textureResult.error);
    candidate.prefilterTexture = adoptIblTexture(scope, device, textureResult.value);
    const cubeViewResult = device.createTextureView(textureResult.value, {
      label: "ibl-prefilter-cube-view",
      dimension: "cube",
      arrayLayerCount: 6,
      baseMipLevel: 0,
      mipLevelCount: PREFILTER_MIP_LEVELS
    });
    if (!cubeViewResult.ok) return fail("prefilter-view", cubeViewResult.error);
    candidate.prefilterView = cubeViewResult.value;
    const mipViews = [];
    for (let m = 0; m < PREFILTER_MIP_LEVELS; m++) {
      const faces = [];
      for (let f = 0; f < 6; f++) {
        const viewResult = device.createTextureView(textureResult.value, {
          label: `ibl-prefilter-mip${m}-face${f}`,
          dimension: "2d",
          baseMipLevel: m,
          mipLevelCount: 1,
          baseArrayLayer: f,
          arrayLayerCount: 1
        });
        if (!viewResult.ok) return fail("prefilter-face-view", viewResult.error);
        faces.push(viewResult.value);
      }
      mipViews.push(faces);
    }
    candidate.prefilterFaceViewsByMip = mipViews;
  }
  {
    const textureResult = device.createTexture({
      label: "ibl-brdf-lut",
      size: { width: BRDF_LUT_SIZE, height: BRDF_LUT_SIZE, depthOrArrayLayers: 1 },
      mipLevelCount: 1,
      sampleCount: 1,
      dimension: "2d",
      format: outputFormat,
      usage: GPU_TEXTURE_USAGE_RENDER_ATTACHMENT_AND_TEXTURE_BINDING | GPU_TEXTURE_USAGE_COPY_DST | GPU_TEXTURE_USAGE_COPY_SRC,
      viewFormats: [],
      textureBindingViewDimension: void 0
    });
    if (!textureResult.ok) return fail("brdf-lut-texture", textureResult.error);
    candidate.brdfLutTexture = adoptIblTexture(scope, device, textureResult.value);
    const viewResult = device.createTextureView(textureResult.value, {
      label: "ibl-brdf-lut-view",
      dimension: "2d"
    });
    if (!viewResult.ok) return fail("brdf-lut-view", viewResult.error);
    candidate.brdfLutView = viewResult.value;
  }
  const samplerResult = device.createSampler({
    label: "ibl-precompute-sampler",
    magFilter: "linear",
    minFilter: "linear",
    mipmapFilter: "linear",
    addressModeU: "repeat",
    addressModeV: "clamp-to-edge",
    addressModeW: "clamp-to-edge"
  });
  if (!samplerResult.ok) return fail("sampler", samplerResult.error);
  const sampler = samplerResult.value;
  let encoderResult = device.createCommandEncoder({
    label: "ibl-precompute-encoder-equirect-to-cube"
  });
  if (!encoderResult.ok) return fail("encoder-equirect-to-cube", encoderResult.error);
  let encoder = encoderResult.value;
  const submitStage = async (stage, createNextEncoder) => {
    const finishRes = encoder.finish();
    if (!finishRes.ok) return err(badAlloc(`${stage}-finish`, finishRes.error));
    const submitRes = device.queue.submit([finishRes.value]);
    if (!submitRes.ok) return err(badAlloc(`${stage}-submit`, submitRes.error));
    try {
      await device.queue.onSubmittedWorkDone();
    } catch {
      return err(badAlloc(`${stage}-fence`));
    }
    if (!scope.isAlive() || scope.generation !== generation) {
      return err(badAlloc(`${stage}-device-scope-generation`));
    }
    if (createNextEncoder) {
      encoderResult = device.createCommandEncoder({ label: `ibl-precompute-encoder-${stage}` });
      if (!encoderResult.ok) return err(badAlloc(`${stage}-next-encoder`, encoderResult.error));
      encoder = encoderResult.value;
    }
    return ok$1(true);
  };
  const faceUniformsBgl = cache3.faceUniformsBgl;
  const equirectGroup1Bgl = cache3.equirectGroup1Bgl;
  const cubeGroup1Bgl = cache3.cubeGroup1Bgl;
  const prefilterGroup0Bgl = cache3.prefilterGroup0Bgl;
  const equirectPipeline = cache3.equirectToCubePipeline;
  const irradiancePipeline = cache3.irradiancePipeline;
  const prefilterPipeline = cache3.prefilterPipeline;
  const brdfLutPipeline = cache3.brdfLutPipeline;
  const candidateIrradianceTexture = candidate.irradianceTexture;
  const candidateIrradianceView = candidate.irradianceView;
  const irrFaceViews = candidate.irradianceFaceViews;
  const candidatePrefilterTexture = candidate.prefilterTexture;
  const candidatePrefilterView = candidate.prefilterView;
  const prefMipViews = candidate.prefilterFaceViewsByMip;
  const candidateBrdfLutTexture = candidate.brdfLutTexture;
  const brdfLutView = candidate.brdfLutView;
  if (faceUniformsBgl === void 0 || equirectGroup1Bgl === void 0 || cubeGroup1Bgl === void 0 || prefilterGroup0Bgl === void 0 || equirectPipeline === void 0 || irradiancePipeline === void 0 || prefilterPipeline === void 0 || brdfLutPipeline === void 0 || candidateIrradianceTexture === void 0 || candidateIrradianceView === void 0 || irrFaceViews === void 0 || candidatePrefilterTexture === void 0 || candidatePrefilterView === void 0 || prefMipViews === void 0 || candidateBrdfLutTexture === void 0 || brdfLutView === void 0) {
    return fail("ibl-cache-resources");
  }
  const equirectBgResult = device.createBindGroup({
    label: "ibl-equirect-bg",
    layout: equirectGroup1Bgl,
    entries: [
      { binding: 0, resource: { kind: "textureView", value: opts.equirectView } },
      { binding: 1, resource: { kind: "sampler", value: sampler } }
    ]
  });
  if (!equirectBgResult.ok) return fail("equirect-bg", equirectBgResult.error);
  const equirectBg = equirectBgResult.value;
  const cubeBgResult = device.createBindGroup({
    label: "ibl-cube-bg",
    layout: cubeGroup1Bgl,
    entries: [
      { binding: 0, resource: { kind: "textureView", value: opts.cubeView } },
      { binding: 1, resource: { kind: "sampler", value: sampler } }
    ]
  });
  if (!cubeBgResult.ok) return fail("cube-bg", cubeBgResult.error);
  const cubeBg = cubeBgResult.value;
  const cubeFaceViews = opts.cubeFaceViews;
  for (let face = 0; face < 6; face++) {
    const cubeFaceView = cubeFaceViews[face];
    if (cubeFaceView === void 0) return fail("cube-face-view");
    const pass = encoder.beginRenderPass({
      label: "ibl-equirect-to-cube",
      colorAttachments: [
        {
          view: cubeFaceView,
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store"
        }
      ]
    });
    const faceBgResult = device.createBindGroup({
      label: `ibl-face-bg-${face}`,
      layout: faceUniformsBgl,
      entries: [
        {
          binding: 0,
          resource: {
            kind: "buffer",
            value: {
              buffer: opts.faceUniformsBuffer,
              offset: face * 256,
              size: 64
            }
          }
        }
      ]
    });
    if (!faceBgResult.ok) return fail("face-bg", faceBgResult.error);
    pass.setPipeline(equirectPipeline);
    pass.setBindGroup(0, faceBgResult.value);
    pass.setBindGroup(1, equirectBg);
    pass.setVertexBuffer(0, opts.cubeVertexBuffer);
    pass.draw(6, 1, face * 6, 0);
    pass.end();
  }
  const cubeStage = await submitStage("equirect-to-cube", true);
  if (!cubeStage.ok) return err(cubeStage.error);
  for (let face = 0; face < 6; face++) {
    const irrFaceView = irrFaceViews[face];
    if (irrFaceView === void 0) return fail("irradiance-face-view");
    const pass = encoder.beginRenderPass({
      label: "ibl-irradiance",
      colorAttachments: [
        {
          view: irrFaceView,
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store"
        }
      ]
    });
    const faceBgResult = device.createBindGroup({
      label: `ibl-irr-face-bg-${face}`,
      layout: faceUniformsBgl,
      entries: [
        {
          binding: 0,
          resource: {
            kind: "buffer",
            value: {
              buffer: opts.faceUniformsBuffer,
              offset: face * 256,
              size: 64
            }
          }
        }
      ]
    });
    if (!faceBgResult.ok) return fail("irr-face-bg", faceBgResult.error);
    pass.setPipeline(irradiancePipeline);
    pass.setBindGroup(0, faceBgResult.value);
    pass.setBindGroup(1, cubeBg);
    pass.setVertexBuffer(0, opts.cubeVertexBuffer);
    pass.draw(6, 1, face * 6, 0);
    pass.end();
    const irradianceFaceStage = await submitStage(`irradiance-face-${face}`, true);
    if (!irradianceFaceStage.ok) return err(irradianceFaceStage.error);
  }
  for (let mip = 0; mip < PREFILTER_MIP_LEVELS; mip++) {
    const mipFaceViews = prefMipViews[mip];
    if (mipFaceViews === void 0) return fail("prefilter-mip-views");
    for (let face = 0; face < 6; face++) {
      const subIdx = mip * 6 + face;
      const mipFaceView = mipFaceViews[face];
      if (mipFaceView === void 0) return fail("prefilter-face-view");
      const pass = encoder.beginRenderPass({
        label: "ibl-prefilter",
        colorAttachments: [
          {
            view: mipFaceView,
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: "clear",
            storeOp: "store"
          }
        ]
      });
      const bgResult = device.createBindGroup({
        label: `ibl-pref-bg-${subIdx}`,
        layout: prefilterGroup0Bgl,
        entries: [
          {
            binding: 0,
            resource: {
              kind: "buffer",
              value: {
                buffer: opts.faceUniformsBuffer,
                offset: face * 256,
                size: 64
              }
            }
          },
          {
            binding: 1,
            resource: {
              kind: "buffer",
              value: {
                buffer: opts.prefilterUniformsBuffer,
                offset: subIdx * 256,
                size: 16
              }
            }
          }
        ]
      });
      if (!bgResult.ok) return fail("pref-bg", bgResult.error);
      pass.setPipeline(prefilterPipeline);
      pass.setBindGroup(0, bgResult.value);
      pass.setBindGroup(1, cubeBg);
      pass.setVertexBuffer(0, opts.cubeVertexBuffer);
      pass.draw(6, 1, face * 6, 0);
      pass.end();
      const faceStage = await submitStage(`prefilter-mip-${mip}-face-${face}`, true);
      if (!faceStage.ok) return err(faceStage.error);
    }
  }
  {
    const pass = encoder.beginRenderPass({
      label: "ibl-brdf-lut",
      colorAttachments: [
        {
          view: brdfLutView,
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store"
        }
      ]
    });
    pass.setPipeline(brdfLutPipeline);
    pass.draw(3, 1, 0, 0);
    pass.end();
  }
  const brdfStage = await submitStage("brdf-lut", false);
  if (!brdfStage.ok) return err(brdfStage.error);
  const promoted = {
    irradianceTexture: candidateIrradianceTexture,
    irradianceView: candidateIrradianceView,
    irradianceFaceViews: irrFaceViews,
    prefilterTexture: candidatePrefilterTexture,
    prefilterView: candidatePrefilterView,
    prefilterFaceViewsByMip: prefMipViews,
    brdfLutTexture: candidateBrdfLutTexture,
    brdfLutView
  };
  cache3.irradianceTexture = promoted.irradianceTexture;
  cache3.irradianceView = promoted.irradianceView;
  cache3.irradianceFaceViews = promoted.irradianceFaceViews;
  cache3.prefilterTexture = promoted.prefilterTexture;
  cache3.prefilterView = promoted.prefilterView;
  cache3.prefilterFaceViewsByMip = promoted.prefilterFaceViewsByMip;
  cache3.brdfLutTexture = promoted.brdfLutTexture;
  cache3.brdfLutView = promoted.brdfLutView;
  cache3.irradianceBakeCount += 1;
  cache3.prefilterBakeCount += 1;
  cache3.brdfLutBakeCount += 1;
  return ok$1({ submitted: true });
}
function adoptIblTexture(scope, device, texture) {
  scope._adopt("texture", texture, (value) => {
    device.destroyTexture(value);
  });
  return texture;
}
function badAlloc(stage, cause) {
  return {
    code: "ibl-precompute-not-dispatched",
    expected: `${stage} allocated successfully`,
    hint: `check the RHI Result for ${stage}; counters must not increment before queue.submit`,
    ...cause === void 0 ? {} : { detail: { stage, rhiCode: cause.code } }
  };
}

// src/points-lines/record.ts
var POINTS_LINES_MATERIAL_SHADER_ID = "forgeax::points-lines";
function createPointsLinesLaneContract(lane, backend) {
  return {
    lane,
    backend,
    authoring: "shared",
    evidence: backend === "null" ? "structural-only" : "runtime",
    material: {
      source: "MaterialAsset",
      shaderId: POINTS_LINES_MATERIAL_SHADER_ID,
      shadingModel: "unlit",
      clusteredLighting: false,
      lit: false
    },
    graph: { additionalAttachments: 0, additionalPasses: 0 },
    shadowDrawCount: 0,
    capabilities: { compute: false, storage: false, indirect: false }
  };
}
function createPointsLinesRecordPlan(snapshot, geometry, contract) {
  const primitiveCount = geometry.pointCount + geometry.segmentCount;
  const visible = snapshot.visible && primitiveCount > 0;
  const conservativeMarginPx = snapshot.style?.kind === "points" ? snapshot.style.sizePx * 0.5 : (snapshot.style?.widthPx ?? 0) * 0.5;
  return {
    lane: contract.lane,
    backend: contract.backend,
    materialShaderId: POINTS_LINES_MATERIAL_SHADER_ID,
    component: geometry.component,
    meshGeneration: snapshot.meshGeneration,
    materialGeneration: snapshot.materialGeneration,
    vertexCount: primitiveCount * 4,
    indexCount: primitiveCount * 6,
    drawCount: visible ? 1 : 0,
    shadowDrawCount: 0,
    conservativeMarginPx,
    graph: contract.graph
  };
}
function createPointsLinesLaneAdapter(lane, backend) {
  const contract = createPointsLinesLaneContract(lane, backend);
  return {
    contract,
    createRecordPlan: (snapshot, geometry) => createPointsLinesRecordPlan(snapshot, geometry, contract)
  };
}

// src/assembly/material/artifact-probe-blend.ts
function requiresProbeBlendRecord(artifact) {
  return artifact.programIdentity?.source === artifact.wgsl && artifact.probeBlendRecordRequired !== void 0 ? artifact.probeBlendRecordRequired : pipelineUsesProbeBlend(artifact.wgsl);
}

// src/gpu-resource.ts
var GpuBuffer = class {
  device;
  handle;
  // SSOT note: the canonical destroyed: boolean lives on the RHI shim's
  // BUFFER_META_MAP. This local flag is a derived view written only on
  // the success branch of `device.destroyBuffer(...)`; charter §F1.
  destroyed = false;
  releaseScope;
  constructor(device, handle, scope) {
    this.device = device;
    this.handle = handle;
    if (scope !== void 0) {
      const ref = scope._adopt("buffer", this, (value) => {
        if (!value.isDestroyed) value.destroy();
      });
      this.releaseScope = () => scope._release(ref);
    }
  }
  get isDestroyed() {
    return this.destroyed;
  }
  /**
   * Destroy the underlying GPU buffer. Forwards to
   * `device.destroyBuffer(handle)`; on ok flips `isDestroyed` to true,
   * on err leaves the flag unchanged so a downstream second destroy
   * still surfaces the underlying RHI fail-fast.
   */
  destroy() {
    const r = this.device.destroyBuffer(this.handle);
    if (r.ok) {
      this.destroyed = true;
      this.releaseScope?.();
      this.releaseScope = void 0;
    }
    return r;
  }
};
var GpuTexture = class {
  device;
  handle;
  destroyed = false;
  releaseScope;
  constructor(device, handle, scope) {
    this.device = device;
    this.handle = handle;
    if (scope !== void 0) {
      const ref = scope._adopt("texture", this, (value) => {
        if (!value.isDestroyed) value.destroy();
      });
      this.releaseScope = () => scope._release(ref);
    }
  }
  get isDestroyed() {
    return this.destroyed;
  }
  /**
   * Destroy the underlying GPU texture. Forwards to
   * `device.destroyTexture(handle)`; ok branch sets `isDestroyed=true`.
   */
  destroy() {
    const r = this.device.destroyTexture(this.handle);
    if (r.ok) {
      this.destroyed = true;
      this.releaseScope?.();
      this.releaseScope = void 0;
    }
    return r;
  }
};

// src/record/sprite-instance-buffer.ts
function interleaveSpriteInstanceBuffer(transforms, regions, includePrevious = false) {
  const count = transforms.length / 16;
  const stride = includePrevious ? 36 : 20;
  const regionOffset = includePrevious ? 32 : 16;
  const out = new Float32Array(count * stride);
  for (let i = 0; i < count; i++) {
    const dstBase = i * stride;
    const transformBase = i * 16;
    const regionBase = i * 4;
    for (let k = 0; k < 16; k++) out[dstBase + k] = transforms[transformBase + k] ?? 0;
    if (includePrevious) {
      for (let k = 0; k < 16; k++) {
        out[dstBase + 16 + k] = transforms[transformBase + k] ?? 0;
      }
    }
    for (let k = 0; k < 4; k++) {
      out[dstBase + regionOffset + k] = regions[regionBase + k] ?? 0;
    }
  }
  return out;
}
function spriteInstancesCacheHit(entry, snapshot, requestedBytes) {
  return entry !== void 0 && entry.uploadedArchVersion === snapshot.archVersion && entry.uploadedByteLength === requestedBytes;
}
function resolveSpriteInstancesBuffer(c, spriteEntry, fallbackBuffer, fallbackCount) {
  const { runtime, frameState } = c;
  let buffer = fallbackBuffer;
  let count = fallbackCount;
  const spriteInstancesSnap = spriteEntry.source.spriteInstances;
  if (spriteInstancesSnap !== void 0) {
    if (spriteInstancesSnap.instanceCount === 0) return { buffer, count: 0 };
    const uniformFallback = runtime.device.caps.storageBuffer === false;
    const interleaved = interleaveSpriteInstanceBuffer(
      spriteInstancesSnap.transforms,
      spriteInstancesSnap.regions,
      !uniformFallback
    );
    const requestedBytes = interleaved.byteLength;
    const cap = runtime.device.limits.maxStorageBufferBindingSize;
    if (typeof cap === "number" && requestedBytes > cap) {
      runtime.errorRegistry.fire(
        new RhiError({
          code: "limit-exceeded",
          expected: `requestedBytes (${requestedBytes}) <= maxStorageBufferBindingSize (${cap})`,
          hint: "reduce SpriteInstances instance count to fit within device.limits.maxStorageBufferBindingSize (144 bytes per instance: current mat4 64B + previous mat4 64B + region 16B)",
          detail: {
            maxStorageBufferBindingSize: cap,
            requestedBytes
          }
        })
      );
    } else {
      const cachedSpriteInst = frameState.instanceBuffers.get(
        worldEntityKey(spriteEntry.source.worldId, spriteInstancesSnap.cacheKey)
      );
      let activeSpriteInst = null;
      if (spriteInstancesCacheHit(cachedSpriteInst, spriteInstancesSnap, requestedBytes)) {
        activeSpriteInst = cachedSpriteInst ?? null;
      } else if (requestedBytes > 0) {
        const bufRes = runtime.device.createBuffer({
          size: requestedBytes,
          usage: (uniformFallback ? GPU_BUFFER_USAGE_UNIFORM : GPU_BUFFER_USAGE_STORAGE) | GPU_BUFFER_USAGE_COPY_DST,
          mappedAtCreation: false
        });
        if (!bufRes.ok) {
          runtime.errorRegistry.fire(bufRes.error);
        } else {
          if (cachedSpriteInst !== void 0 && !cachedSpriteInst.buffer.isDestroyed) {
            const r = cachedSpriteInst.buffer.destroy();
            if (!r.ok) runtime.errorRegistry.fire(r.error);
          }
          const newBuf = new GpuBuffer(runtime.device, bufRes.value);
          activeSpriteInst = {
            buffer: newBuf,
            uploadedArchVersion: spriteInstancesSnap.archVersion,
            uploadedByteLength: requestedBytes
          };
          frameState.instanceBuffers.set(
            worldEntityKey(spriteEntry.source.worldId, spriteInstancesSnap.cacheKey),
            activeSpriteInst
          );
        }
      }
      if (activeSpriteInst !== null && requestedBytes > 0) {
        const writeRes = runtime.device.queue.writeBuffer(
          activeSpriteInst.buffer.handle,
          0,
          interleaved
        );
        if (!writeRes.ok) {
          runtime.errorRegistry.fire(writeRes.error);
        } else {
          buffer = activeSpriteInst.buffer.handle;
          count = spriteInstancesSnap.instanceCount;
        }
      }
    }
  }
  return { buffer, count };
}

// src/record/fold-instance-buffer.ts
function resolveFoldInstanceBuffer(c, bucket, headIndex) {
  const { runtime, frameState } = c;
  const key = -1 - ((bucket.materialHandle & 65535) << 16 | headIndex & 65535);
  const uniform = runtime.device.caps.storageBuffer === false;
  const payload = uniform ? bucket.transforms : packInstanceStorageBuffer(bucket.transforms);
  let resident = frameState.instanceBuffers.get(key);
  if (resident === void 0 || resident.uploadedByteLength !== payload.byteLength) {
    const created = runtime.device.createBuffer({
      size: payload.byteLength,
      usage: (uniform ? GPU_BUFFER_USAGE_UNIFORM : GPU_BUFFER_USAGE_STORAGE) | GPU_BUFFER_USAGE_COPY_DST,
      mappedAtCreation: false
    });
    if (!created.ok) {
      runtime.errorRegistry.fire(created.error);
      return null;
    }
    if (resident !== void 0 && !resident.buffer.isDestroyed) {
      const destroyed = resident.buffer.destroy();
      if (!destroyed.ok) runtime.errorRegistry.fire(destroyed.error);
    }
    resident = {
      buffer: new GpuBuffer(runtime.device, created.value),
      uploadedArchVersion: bucket.bucketSize,
      uploadedByteLength: payload.byteLength
    };
    frameState.instanceBuffers.set(key, resident);
  }
  const written = runtime.device.queue.writeBuffer(resident.buffer.handle, 0, payload);
  if (!written.ok) {
    runtime.errorRegistry.fire(written.error);
    return null;
  }
  return resident.buffer.handle;
}
var STANDARD_PBR_REQUIRED_SAMPLED_TEXTURES = 18;
function isOrdinaryMaterialVariant(variant) {
  return variant.defines.COVERAGE_ONLY !== true;
}
function selectHdrpPbrPrewarmVariants(manifestEntry, storageBufferCapable, extendedLightingShaderAvailableOrTransmissionCapable = true, transmissionCapable = true, directionalPcssAvailable = true, projectorAvailable = true) {
  const variants = manifestEntry?.variants ?? [];
  const hasExtendedLightingAxis = variants.some(
    (variant) => "EXTENDED_LIGHTING_AVAILABLE" in variant.defines
  );
  const extendedLightingShaderAvailable = hasExtendedLightingAxis ? extendedLightingShaderAvailableOrTransmissionCapable : true;
  const effectiveTransmissionCapable = hasExtendedLightingAxis ? transmissionCapable : extendedLightingShaderAvailableOrTransmissionCapable;
  if (!storageBufferCapable) return [];
  return variants.filter(
    (variant) => isOrdinaryMaterialVariant(variant) && variant.defines.STORAGE_BUFFER_AVAILABLE === storageBufferCapable && (!("EXTENDED_LIGHTING_AVAILABLE" in variant.defines) || variant.defines.EXTENDED_LIGHTING_AVAILABLE === extendedLightingShaderAvailable) && variant.defines.CLUSTER_FORWARD_AVAILABLE === true && (!("DIRECTIONAL_PCSS_AVAILABLE" in variant.defines) || variant.defines.DIRECTIONAL_PCSS_AVAILABLE === directionalPcssAvailable) && (!("PROJECTOR_AVAILABLE" in variant.defines) || variant.defines.PROJECTOR_AVAILABLE === projectorAvailable) && variant.defines.PROBE_BLEND_AVAILABLE !== true && (effectiveTransmissionCapable || variant.defines.TRANSMISSION_AVAILABLE !== true)
  ) ?? [];
}
function selectSkinPrewarmVariants(manifestEntry, storageBufferCapable, extendedLightingAvailable = true, directionalPcssAvailable = true, projectorAvailable = true, transmissionCapable = true) {
  return manifestEntry?.variants.filter(
    ({ defines }) => defines.COVERAGE_ONLY !== true && defines.STORAGE_BUFFER_AVAILABLE === storageBufferCapable && (storageBufferCapable || defines.CLUSTER_FORWARD_AVAILABLE !== true) && defines.PROBE_BLEND_AVAILABLE !== true && (!("EXTENDED_LIGHTING_AVAILABLE" in defines) || defines.EXTENDED_LIGHTING_AVAILABLE === extendedLightingAvailable) && (!("DIRECTIONAL_PCSS_AVAILABLE" in defines) || defines.DIRECTIONAL_PCSS_AVAILABLE === directionalPcssAvailable) && (!("PROJECTOR_AVAILABLE" in defines) || defines.PROJECTOR_AVAILABLE === projectorAvailable) && (transmissionCapable || defines.TRANSMISSION_AVAILABLE !== true)
  ) ?? [];
}
function selectGpuDrivenSceneIndexVariant(manifestEntry, extendedLightingAvailable, directionalPcssAvailable, projectorAvailable, vertexColorAvailable = false) {
  return manifestEntry?.variants.find(
    (variant) => isOrdinaryMaterialVariant(variant) && variant.defines.STORAGE_BUFFER_AVAILABLE === true && variant.defines.GPU_DRIVEN_SCENE_INDEX_AVAILABLE === true && (!("CLUSTER_FORWARD_AVAILABLE" in variant.defines) || variant.defines.CLUSTER_FORWARD_AVAILABLE === false) && variant.defines.VERTEX_COLOR_AVAILABLE === true === vertexColorAvailable && (!("PROBE_BLEND_AVAILABLE" in variant.defines) || variant.defines.PROBE_BLEND_AVAILABLE === false) && (!("EXTENDED_LIGHTING_AVAILABLE" in variant.defines) || variant.defines.EXTENDED_LIGHTING_AVAILABLE === extendedLightingAvailable) && (!("DIRECTIONAL_PCSS_AVAILABLE" in variant.defines) || variant.defines.DIRECTIONAL_PCSS_AVAILABLE === directionalPcssAvailable) && (!("PROJECTOR_AVAILABLE" in variant.defines) || variant.defines.PROJECTOR_AVAILABLE === projectorAvailable) && (!("REFLECTION_FALLBACK_AVAILABLE" in variant.defines) || variant.defines.REFLECTION_FALLBACK_AVAILABLE === false) && (!("TRANSMISSION_AVAILABLE" in variant.defines) || variant.defines.TRANSMISSION_AVAILABLE === false)
  );
}
function selectProbePrewarmVariants(manifestEntry, storageBufferCapable, extendedLightingShaderAvailable = true, transmissionCapable = true, directionalPcssAvailable = true, projectorAvailable = true, webgl2Downlevel = false) {
  if (!storageBufferCapable) return [];
  return manifestEntry?.variants.filter((variant) => {
    const defines = variant.defines;
    return isOrdinaryMaterialVariant(variant) && defines.PROBE_BLEND_AVAILABLE === true && defines.STORAGE_BUFFER_AVAILABLE === storageBufferCapable && (!("WEBGL2_COMPAT" in defines) || defines.WEBGL2_COMPAT === webgl2Downlevel) && (!("EXTENDED_LIGHTING_AVAILABLE" in defines) || defines.EXTENDED_LIGHTING_AVAILABLE === extendedLightingShaderAvailable) && (!("DIRECTIONAL_PCSS_AVAILABLE" in defines) || defines.DIRECTIONAL_PCSS_AVAILABLE === directionalPcssAvailable) && (!("PROJECTOR_AVAILABLE" in defines) || defines.PROJECTOR_AVAILABLE === projectorAvailable) && (transmissionCapable || defines.TRANSMISSION_AVAILABLE !== true);
  }) ?? [];
}
async function prewarmMaterialShaderVariants(variants, prewarmedModules, compile, seed) {
  for (const variant of variants) {
    const moduleLabel = `module-forgeax::default-standard-pbr#${variant.definesKey}`;
    let module = prewarmedModules.get(variant.composedWgsl);
    if (module === void 0) {
      const result = await compile(variant, moduleLabel);
      if (!result.ok) throw result.error;
      module = result.value;
      prewarmedModules.set(variant.composedWgsl, module);
    }
    seed(moduleLabel, module);
  }
}
function selectStandardPbrTransmissionPrewarmVariants(manifestEntry, storageBufferCapable, directionalPcssAvailable = true, projectorAvailable = true, extendedLightingShaderAvailable = true) {
  if (manifestEntry === void 0) {
    throw new Error("Standard material shader manifest row is missing");
  }
  const selected = [];
  for (const transmissionAvailable of [false, true]) {
    const declared = manifestEntry.variants.find(
      (variant) => isOrdinaryMaterialVariant(variant) && variant.defines.STORAGE_BUFFER_AVAILABLE === storageBufferCapable && variant.defines.CLUSTER_FORWARD_AVAILABLE === standardBootClusterAxis() && variant.defines.VERTEX_COLOR_AVAILABLE === false && (!("DIRECTIONAL_PCSS_AVAILABLE" in variant.defines) || variant.defines.DIRECTIONAL_PCSS_AVAILABLE === directionalPcssAvailable) && (!("PROJECTOR_AVAILABLE" in variant.defines) || variant.defines.PROJECTOR_AVAILABLE === projectorAvailable) && (!("EXTENDED_LIGHTING_AVAILABLE" in variant.defines) || variant.defines.EXTENDED_LIGHTING_AVAILABLE === extendedLightingShaderAvailable) && variant.defines.PROBE_BLEND_AVAILABLE !== true && variant.defines.TRANSMISSION_AVAILABLE === transmissionAvailable
    );
    if (declared === void 0) {
      throw new Error(
        `Standard material shader manifest lacks exact TRANSMISSION_AVAILABLE=${transmissionAvailable} prewarm variant`
      );
    }
    const exact = findVariantByKey(manifestEntry, declared.definesKey);
    if (exact === void 0) {
      throw new Error(
        `Standard material shader manifest exact lookup failed for TRANSMISSION_AVAILABLE=${transmissionAvailable}`
      );
    }
    selected.push(exact);
  }
  return selected;
}
function standardBootClusterAxis() {
  return false;
}

// src/assembly/device-feature-admission.ts
var COMPRESSION_FEATURES = [
  "texture-compression-bc",
  "texture-compression-etc2",
  "texture-compression-astc"
];
function transmissionBackdropAvailable(limit) {
  return limit === void 0 || limit >= STANDARD_PBR_REQUIRED_SAMPLED_TEXTURES;
}
var STANDARD_PHYSICAL_REQUIRED_SAMPLED_TEXTURES = 23;
function deriveDeviceFeatureAdmission(adapter, options) {
  const requiredFeatures = COMPRESSION_FEATURES.filter((feature) => adapter.features.has(feature));
  const timestampRequested = options?.gpuPassTiming !== void 0 || options?.captureGpuTimings === true;
  if (timestampRequested && adapter.features.has("timestamp-query")) {
    requiredFeatures.push("timestamp-query");
  }
  const adapterSampledTextureLimit = adapter.limits?.maxSampledTexturesPerShaderStage ?? 0;
  const requiredSampledTextureLimit = adapterSampledTextureLimit >= STANDARD_PHYSICAL_REQUIRED_SAMPLED_TEXTURES ? STANDARD_PHYSICAL_REQUIRED_SAMPLED_TEXTURES : adapterSampledTextureLimit >= EXTENDED_LIGHTING_REQUIRED_SAMPLED_TEXTURES ? EXTENDED_LIGHTING_REQUIRED_SAMPLED_TEXTURES : adapterSampledTextureLimit >= STANDARD_PBR_REQUIRED_SAMPLED_TEXTURES ? STANDARD_PBR_REQUIRED_SAMPLED_TEXTURES : void 0;
  return {
    requiredFeatures,
    ...requiredSampledTextureLimit === void 0 ? {} : {
      requiredLimits: {
        maxSampledTexturesPerShaderStage: requiredSampledTextureLimit
      }
    }
  };
}
function deviceOptionsForAdapter(adapter, options) {
  const admission = deriveDeviceFeatureAdmission(adapter, options);
  return admission.requiredFeatures.length === 0 && admission.requiredLimits === void 0 ? void 0 : admission;
}

// src/ibl/skylight-bind-group.ts
var FALLBACK_BYTES_PER_ROW = 256;
function assembleMaterialWithSkylightEntries(materialEntries, skylight, transmission, textureInjections = [], surfaceMedium) {
  const iblStart = materialEntries.length;
  const result = [
    ...materialEntries,
    {
      binding: iblStart,
      resource: { kind: "textureView", value: skylight.irradianceView }
    },
    {
      binding: iblStart + 1,
      resource: { kind: "sampler", value: skylight.irradianceSampler }
    },
    {
      binding: iblStart + 2,
      resource: { kind: "textureView", value: skylight.prefilterView }
    },
    {
      binding: iblStart + 3,
      resource: { kind: "sampler", value: skylight.prefilterSampler }
    },
    {
      binding: iblStart + 4,
      resource: { kind: "textureView", value: skylight.brdfLutView }
    },
    {
      binding: iblStart + 5,
      resource: { kind: "buffer", value: { buffer: skylight.intensityBuffer } }
    }
  ];
  const transmissionSampler = transmission?.sampler ?? skylight.irradianceSampler;
  const transmissionView = transmission?.backdropView ?? skylight.brdfLutView;
  const transmissionStart = result.length;
  if (transmission !== null)
    result.push(
      {
        binding: transmissionStart,
        resource: { kind: "sampler", value: transmissionSampler }
      },
      {
        binding: transmissionStart + 1,
        resource: { kind: "textureView", value: transmissionView }
      }
    );
  if (surfaceMedium !== void 0) {
    const surfaceStart = result.length;
    result.push(
      {
        binding: surfaceStart,
        resource: { kind: "sampler", value: surfaceMedium.rawDepthSampler }
      },
      {
        binding: surfaceStart + 1,
        resource: { kind: "textureView", value: surfaceMedium.rawDepthView }
      },
      {
        binding: surfaceStart + 2,
        resource: { kind: "sampler", value: surfaceMedium.nearestLayerSampler }
      },
      {
        binding: surfaceStart + 3,
        resource: { kind: "textureView", value: surfaceMedium.nearestLayerView }
      },
      {
        binding: surfaceStart + 4,
        resource: { kind: "sampler", value: surfaceMedium.nearestDepthSampler }
      },
      {
        binding: surfaceStart + 5,
        resource: { kind: "textureView", value: surfaceMedium.nearestDepthView }
      }
    );
  }
  const physicalStart = 26;
  for (let index = 0; index < textureInjections.length; index += 1) {
    const resource = textureInjections[index];
    if (resource === void 0) continue;
    const binding = physicalStart + resource.slot * 2;
    result.push(
      {
        binding,
        resource: { kind: "sampler", value: resource.sampler }
      },
      {
        binding: binding + 1,
        resource: { kind: "textureView", value: resource.view }
      }
    );
  }
  if (surfaceMedium === void 0) {
    result.push({
      binding: 47,
      resource: {
        kind: "textureView",
        value: skylight.skylightPrefilterView ?? skylight.prefilterView
      }
    });
  }
  return result;
}
function createSkylightFallback(device, queue) {
  const samplerResult = device.createSampler({
    label: "skylight-fallback-sampler",
    magFilter: "linear",
    minFilter: "linear",
    mipmapFilter: "linear",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
    addressModeW: "clamp-to-edge"
  });
  if (!samplerResult.ok) throw samplerResult.error;
  const sampler = samplerResult.value;
  const irradianceTexResult = device.createTexture({
    label: "skylight-fallback-irradiance-cube",
    size: { width: 1, height: 1, depthOrArrayLayers: 6 },
    mipLevelCount: 1,
    sampleCount: 1,
    dimension: "2d",
    format: "rgba16float",
    usage: GPU_TEXTURE_USAGE_TEXTURE_BINDING | GPU_TEXTURE_USAGE_COPY_DST,
    viewFormats: [],
    textureBindingViewDimension: "cube"
  });
  if (!irradianceTexResult.ok) throw irradianceTexResult.error;
  const irradianceTexture = irradianceTexResult.value;
  const prefilterTexResult = device.createTexture({
    label: "skylight-fallback-prefilter-cube",
    size: { width: 1, height: 1, depthOrArrayLayers: 6 },
    mipLevelCount: 1,
    sampleCount: 1,
    dimension: "2d",
    format: "rgba16float",
    usage: GPU_TEXTURE_USAGE_TEXTURE_BINDING | GPU_TEXTURE_USAGE_COPY_DST,
    viewFormats: [],
    textureBindingViewDimension: "cube"
  });
  if (!prefilterTexResult.ok) throw prefilterTexResult.error;
  const prefilterTexture = prefilterTexResult.value;
  const brdfLutTexResult = device.createTexture({
    label: "skylight-fallback-brdf-lut",
    size: { width: 1, height: 1, depthOrArrayLayers: 1 },
    mipLevelCount: 1,
    sampleCount: 1,
    dimension: "2d",
    format: "rg16float",
    usage: GPU_TEXTURE_USAGE_TEXTURE_BINDING | GPU_TEXTURE_USAGE_COPY_DST,
    viewFormats: [],
    textureBindingViewDimension: void 0
  });
  if (!brdfLutTexResult.ok) throw brdfLutTexResult.error;
  const brdfLutTexture = brdfLutTexResult.value;
  const whitePixel = new Uint8Array(FALLBACK_BYTES_PER_ROW);
  {
    const dv = new DataView(whitePixel.buffer);
    dv.setUint16(0, 15360, true);
    dv.setUint16(2, 15360, true);
    dv.setUint16(4, 15360, true);
    dv.setUint16(6, 15360, true);
  }
  const brdfApproxPixel = new Uint8Array(FALLBACK_BYTES_PER_ROW);
  new DataView(brdfApproxPixel.buffer).setUint16(0, 15360, true);
  for (const face of [0, 1, 2, 3, 4, 5]) {
    queue.writeTexture(
      {
        texture: irradianceTexture,
        mipLevel: 0,
        origin: { x: 0, y: 0, z: face }
      },
      whitePixel,
      { offset: 0, bytesPerRow: FALLBACK_BYTES_PER_ROW, rowsPerImage: 1 },
      { width: 1, height: 1, depthOrArrayLayers: 1 }
    );
    queue.writeTexture(
      {
        texture: prefilterTexture,
        mipLevel: 0,
        origin: { x: 0, y: 0, z: face }
      },
      whitePixel,
      { offset: 0, bytesPerRow: FALLBACK_BYTES_PER_ROW, rowsPerImage: 1 },
      { width: 1, height: 1, depthOrArrayLayers: 1 }
    );
  }
  queue.writeTexture(
    {
      texture: brdfLutTexture,
      mipLevel: 0,
      origin: { x: 0, y: 0, z: 0 }
    },
    brdfApproxPixel,
    { offset: 0, bytesPerRow: FALLBACK_BYTES_PER_ROW, rowsPerImage: 1 },
    { width: 1, height: 1, depthOrArrayLayers: 1 }
  );
  const irradianceViewResult = device.createTextureView(irradianceTexture, {
    label: "skylight-fallback-irradiance-cube-view",
    dimension: "cube",
    arrayLayerCount: 6
  });
  if (!irradianceViewResult.ok) throw irradianceViewResult.error;
  const irradianceView = irradianceViewResult.value;
  const prefilterViewResult = device.createTextureView(prefilterTexture, {
    label: "skylight-fallback-prefilter-cube-view",
    dimension: "cube",
    arrayLayerCount: 6
  });
  if (!prefilterViewResult.ok) throw prefilterViewResult.error;
  const prefilterView = prefilterViewResult.value;
  const brdfLutViewResult = device.createTextureView(brdfLutTexture, {
    label: "skylight-fallback-brdf-lut-view",
    dimension: "2d"
  });
  if (!brdfLutViewResult.ok) throw brdfLutViewResult.error;
  const brdfLutView = brdfLutViewResult.value;
  const intensityBufResult = device.createBuffer({
    label: "skylight-fallback-intensity",
    size: 64,
    usage: GPU_BUFFER_USAGE_UNIFORM | GPU_BUFFER_USAGE_COPY_DST
  });
  if (!intensityBufResult.ok) throw intensityBufResult.error;
  const intensityBuffer = intensityBufResult.value;
  queue.writeBuffer(intensityBuffer, 0, new Float32Array([0, 0, 0, 0, 0, 0, 0, 1]));
  return {
    irradianceTexture,
    irradianceView,
    prefilterTexture,
    prefilterView,
    brdfLutTexture,
    brdfLutView,
    sampler,
    intensityBuffer
  };
}
var ProjectionAssetError = class extends Error {
  code;
  expected;
  hint;
  constructor(fields) {
    super(`[AssetError ${fields.code}] expected: ${fields.expected}; hint: ${fields.hint}`);
    this.name = "AssetError";
    this.code = fields.code;
    this.expected = fields.expected;
    this.hint = fields.hint;
  }
};
function projectionError(fields) {
  return new ProjectionAssetError(fields);
}
function deriveTextureExtent(format, width, height) {
  const params = blockParamsForFormat(format);
  const physicalWidth = params === null ? width : Math.ceil(width / params.blockW) * params.blockW;
  const physicalHeight = params === null ? height : Math.ceil(height / params.blockH) * params.blockH;
  return {
    logicalExtent: { width, height },
    physicalExtent: { width: physicalWidth, height: physicalHeight },
    uvScale: [width / physicalWidth, height / physicalHeight]
  };
}
function deriveRenderDataMesh(mesh) {
  const indices = mesh.indices;
  const indexBytesUnpadded = indices === void 0 ? 0 : indices.byteLength;
  const indexByteLength = indexBytesUnpadded + 3 >> 2 << 2;
  const layoutProjection = deriveVertexLayoutProjection(mesh.attributes);
  return ok$1({
    vertexByteLength: mesh.vertices.byteLength,
    layoutProjection,
    indexByteLength,
    indexCount: indices === void 0 ? 0 : indices.length,
    indexFormat: indices instanceof Uint32Array ? "uint32" : "uint16",
    vertexUsage: GPU_BUFFER_USAGE_VERTEX | GPU_BUFFER_USAGE_COPY_DST,
    indexUsage: GPU_BUFFER_USAGE_INDEX | GPU_BUFFER_USAGE_COPY_DST,
    submeshes: mesh.submeshes
  });
}
function deriveRenderDataTexture(tex) {
  const width = tex.shape.extent.width;
  const height = tex.shape.extent.height;
  const isSrgbFormat = tex.format.endsWith("-srgb");
  const expectedColorSpace = isSrgbFormat ? "srgb" : "linear";
  if (tex.colorSpace !== expectedColorSpace) {
    return err(
      projectionError({
        code: "invalid-source-format",
        expected: "format ends in '-srgb' iff colorSpace is 'srgb' (linear otherwise)",
        hint: ASSET_ERROR_HINTS["invalid-source-format"]
      })
    );
  }
  const compressed = isCompressedFormat(tex.format);
  const layout = deriveTextureLayout({ shape: tex.shape, format: tex.format, mips: tex.mips });
  if (!layout.ok) {
    return err(
      projectionError({
        code: "invalid-source-format",
        expected: layout.error.expected,
        hint: layout.error.hint
      })
    );
  }
  if (compressed && tex.mips.kind === "generate") {
    return err(
      projectionError({
        code: "mipgen-unsupported-compressed-format",
        expected: "a compressed texture requesting mipmap:true must carry an offline mip chain (mipLevelCount > 1)",
        hint: ASSET_ERROR_HINTS["mipgen-unsupported-compressed-format"]
      })
    );
  }
  const mipLevelCount = layout.value.levels.length;
  const baseLevel = layout.value.levels[0];
  if (baseLevel === void 0) {
    return err(
      projectionError({
        code: "invalid-source-format",
        expected: "texture layout contains a base mip level",
        hint: ASSET_ERROR_HINTS["invalid-source-format"]
      })
    );
  }
  if (!compressed && tex.data.byteLength < baseLevel.byteLength) {
    return err(
      projectionError({
        code: "invalid-source-format",
        expected: "uncompressed texture data contains at least one complete base mip",
        hint: ASSET_ERROR_HINTS["invalid-source-format"]
      })
    );
  }
  const bytesPerRow$1 = compressed ? bytesPerRow(tex.format, width) ?? baseLevel.bytesPerRow : baseLevel.bytesPerRow;
  const usage = compressed ? GPU_TEXTURE_USAGE_TEXTURE_BINDING | GPU_TEXTURE_USAGE_COPY_DST | GPU_TEXTURE_USAGE_COPY_SRC : GPU_TEXTURE_USAGE_RENDER_ATTACHMENT_AND_TEXTURE_BINDING | GPU_TEXTURE_USAGE_COPY_DST | GPU_TEXTURE_USAGE_COPY_SRC;
  return ok$1({
    width,
    height,
    shape: tex.shape,
    depthOrArrayLayers: tex.shape.viewDimension === "2d" ? 1 : tex.shape.viewDimension === "2d-array" ? tex.shape.extent.layers : tex.shape.extent.depth,
    ...deriveTextureExtent(tex.format, width, height),
    format: tex.format,
    mipLevelCount,
    usage,
    bytesPerRow: bytesPerRow$1,
    compressed
  });
}
function deriveRenderDataCubemap(source) {
  const isAcceptedHdr = source.format === "rgba16float" || source.format === "rgba32float";
  if (!isAcceptedHdr || source.colorSpace !== "linear") {
    return err(
      projectionError({
        code: "invalid-source-format",
        expected: "format 'rgba16float' or 'rgba32float' with colorSpace 'linear'",
        hint: ASSET_ERROR_HINTS["invalid-source-format"]
      })
    );
  }
  const sourceHeight = source.shape.viewDimension === "2d" ? source.shape.extent.height : 0;
  return ok$1({
    cubeFaceSize: sourceHeight,
    outputFormat: "rgba16float",
    needsHalfConversion: source.format === "rgba32float",
    cubeUsage: GPU_TEXTURE_USAGE_RENDER_ATTACHMENT_AND_TEXTURE_BINDING | GPU_TEXTURE_USAGE_COPY_DST | GPU_TEXTURE_USAGE_COPY_SRC
  });
}

// src/record/main-pass-material.ts
function selectMaterialGroup2(clusterGroup, meshGroup, group2Contract) {
  if (group2Contract === "cluster") return clusterGroup;
  if (group2Contract === "mesh") return meshGroup;
  return null;
}
var DERIVED_PARAM_SCHEMA_CACHE = /* @__PURE__ */ new WeakMap();
function derivedParamSchema(schema) {
  const cached = DERIVED_PARAM_SCHEMA_CACHE.get(schema);
  if (cached !== void 0) return cached;
  const derived = derive(schema);
  DERIVED_PARAM_SCHEMA_CACHE.set(schema, derived);
  return derived;
}
function geometryRenderStateForTopology(topology, renderState) {
  if (topology !== "line-list" && topology !== "line-strip") return renderState;
  return {
    ...renderState,
    depthWriteEnabled: false,
    depthCompare: "less-equal"
  };
}
function selectGeometryPipeline(pipelineState, tonemapActive, msaaActive) {
  if (tonemapActive) {
    return msaaActive ? pipelineState.unlitPipelineHdrMsaa : pipelineState.unlitPipelineHdr;
  }
  return msaaActive ? pipelineState.unlitPipelineMsaa : pipelineState.unlitPipeline;
}
function isEntityFullyTransparent(source) {
  const mats = source.materials;
  if (mats === void 0 || mats.length === 0) return source.material.transparent === true;
  for (let j = 0; j < mats.length; j++) {
    if (mats[j]?.transparent !== true) return false;
  }
  return true;
}
function isImageError(error) {
  if (typeof error !== "object" || error === null) return false;
  const code = error.code;
  return typeof code === "string" && code.startsWith("image-");
}
function materialDiagnosticsEnabled() {
  if (typeof globalThis !== "object" || globalThis === null || !("process" in globalThis)) {
    return false;
  }
  const processValue = globalThis.process;
  return processValue?.env?.FORGEAX_MATERIAL_DIAGNOSTICS === "1";
}
function residentTextureView(world, store, runtime, handle, worldId = world) {
  const podRes = resolveAssetHandle(world, handle);
  const diagnosticsEnabled = materialDiagnosticsEnabled();
  if (!podRes.ok) {
    if (diagnosticsEnabled) {
      console.error(
        `[render-material] texture resolve failed: ${JSON.stringify({ handle: handleSlot(handle), error: podRes.error })}`
      );
    }
    return void 0;
  }
  const residentRes = store.ensureResident(handle, podRes.value, worldId);
  if (!residentRes.ok) {
    if (residentRes.error instanceof RhiError || isImageError(residentRes.error)) {
      runtime.errorRegistry.fire(residentRes.error);
    }
    if (diagnosticsEnabled) {
      console.error(
        `[render-material] texture residency failed: ${JSON.stringify({
          handle: handleSlot(handle),
          pod: {
            kind: podRes.value.kind,
            shape: podRes.value.shape,
            format: podRes.value.format,
            dataByteLength: podRes.value.data.byteLength,
            mips: podRes.value.mips
          },
          error: residentRes.error
        })}`
      );
    }
    return void 0;
  }
  const view = store.getTextureGpuView(handle, worldId);
  if (diagnosticsEnabled) {
    console.error(
      `[render-material] texture residency ready: ${JSON.stringify({
        handle: handleSlot(handle),
        pod: {
          kind: podRes.value.kind,
          shape: podRes.value.shape,
          format: podRes.value.format,
          dataByteLength: podRes.value.data.byteLength,
          mips: podRes.value.mips
        },
        receipt: "receipt" in residentRes.value ? residentRes.value.receipt : void 0,
        viewReady: view !== void 0
      })}`
    );
  }
  return view;
}
function residentSampler(world, store, runtime, handle, worldId = world) {
  const podRes = resolveAssetHandle(world, handle);
  if (!podRes.ok) return void 0;
  const residentRes = store.ensureSamplerResident(handle, podRes.value, worldId);
  if (!residentRes.ok) {
    runtime.errorRegistry.fire(residentRes.error);
    return void 0;
  }
  return residentRes.value;
}
var VIDEO_UPLOAD_FAILURE_EPISODES = /* @__PURE__ */ new WeakMap();
function markVideoUploadFailureEpisode(store, entityKey, clip) {
  let clips = VIDEO_UPLOAD_FAILURE_EPISODES.get(store);
  if (clips === void 0) {
    clips = /* @__PURE__ */ new Map();
    VIDEO_UPLOAD_FAILURE_EPISODES.set(store, clips);
  }
  let episodes = clips.get(entityKey);
  if (episodes === void 0) {
    episodes = /* @__PURE__ */ new Set();
    clips.set(entityKey, episodes);
  }
  const clipId = handleSlot(clip);
  if (episodes.has(clipId)) return false;
  episodes.add(clipId);
  return true;
}
function clearVideoUploadFailureEpisode(store, entityKey, clip) {
  const clips = VIDEO_UPLOAD_FAILURE_EPISODES.get(store);
  const episodes = clips?.get(entityKey);
  if (episodes === void 0) return;
  episodes.delete(handleSlot(clip));
  if (episodes.size === 0) clips?.delete(entityKey);
  if (clips?.size === 0) VIDEO_UPLOAD_FAILURE_EPISODES.delete(store);
}
function videoTextureView(world, store, runtime, entityKey, clip, highPerfAvailable) {
  if (store === void 0) return void 0;
  const provider = !("resolveAsset" in world) && world.hasResource(VIDEO_SOURCE_PROVIDER_KEY) ? world.getResource(VIDEO_SOURCE_PROVIDER_KEY) : void 0;
  const element = "resolveAsset" in world ? world.videoFrame(entityKey, clip) : provider?.getSource(entityKey, clip);
  if (element === void 0 && !highPerfAvailable) {
    if (markVideoUploadFailureEpisode(store, entityKey, clip)) {
      runtime.errorRegistry.fire(new VideoUploadUnsupportedError());
    }
    return store.getView(clip);
  }
  if (element === void 0) {
    clearVideoUploadFailureEpisode(store, entityKey, clip);
    return store.getView(clip);
  }
  const extent = videoSourceExtent(element);
  if (extent === void 0) return store.getView(clip);
  const { width, height } = extent;
  const uploaded = store.uploadFrame(clip, element, width, height);
  if (uploaded === void 0) return store.getView(clip);
  if (!uploaded.ok) {
    runtime.errorRegistry.fire(uploaded.error);
    return store.getView(clip);
  }
  clearVideoUploadFailureEpisode(store, entityKey, clip);
  return uploaded.value;
}
var BUILTIN_USER_REGION_TEXTURE_FIELDS = [
  "baseColorTexture",
  "metallicRoughnessTexture",
  "normalTexture",
  "emissiveTexture",
  "occlusionTexture",
  "transmissionTexture",
  "thicknessTexture"
];
var LEGACY_MATERIAL_TEXTURE_SCALE_OFFSET = 80;
var LEGACY_MATERIAL_TEXTURE_SCALE_FIELDS = [
  "baseColorTexture",
  "metallicRoughnessTexture",
  "normalTexture",
  "emissiveTexture",
  "occlusionTexture"
];
var DEFAULT_LEGACY_TEXTURE_SCALES = new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
function materialTextureUvScale(texture) {
  if (texture === void 0) return [1, 1];
  return deriveTextureExtent(
    texture.format,
    texture.shape.extent.width,
    texture.shape.extent.height
  ).uvScale;
}
function materialTextureForField(material, field) {
  if (field === "emissiveTexture") return material.emissiveTexture;
  if (field === "occlusionTexture") return material.occlusionTexture;
  return material.textureHandles?.get(field);
}
function materialRenderTargetSourceForField(material, field, resolveSource) {
  const source = material.textureSources?.get(field);
  return source === void 0 ? void 0 : resolveSource?.(source) ?? resolveRenderTargetMaterialSource(source);
}
function materialUboFloatView(payload) {
  if (payload instanceof Float32Array) return payload;
  return payload instanceof Uint8Array ? new Float32Array(payload.buffer, payload.byteOffset, payload.byteLength / 4) : new Float32Array(payload);
}
function materialUboDataView(payload) {
  if (payload instanceof Float32Array || payload instanceof Uint8Array) {
    return new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
  }
  return new DataView(payload);
}
function writeNumericParamValue(view, entry, value) {
  const values = typeof value === "number" ? [value] : value;
  const width = entry.size / 4;
  const writeCount = Math.min(values.length, width);
  for (let index = 0; index < writeCount; index += 1) {
    const component = values[index];
    if (typeof component !== "number") continue;
    const byteOffset = entry.offset + index * 4;
    switch (entry.type) {
      case "i32":
        view.setInt32(byteOffset, component, true);
        break;
      case "u32":
        view.setUint32(byteOffset, component, true);
        break;
      case "f32":
      case "vec2":
      case "vec3":
      case "vec4":
      case "color":
        view.setFloat32(byteOffset, component, true);
        break;
    }
  }
}
function applyMaterialTextureUvScales(payload, material, world) {
  const f32 = materialUboFloatView(payload);
  const coordinateSchema = materialCoordinateSchema(material);
  if (coordinateSchema !== void 0) {
    const coordinateRecords = derivedParamSchema(coordinateSchema).coordinateRecords;
    for (const record of coordinateRecords) {
      const field = record.parameter;
      const handle = materialTextureForField(material, field);
      const resolvedTexture = handle === void 0 ? void 0 : resolveAssetHandle(world, handle);
      const texture = resolvedTexture?.ok === true ? resolvedTexture.value : void 0;
      const [u, v] = materialTextureUvScale(texture);
      const coordinates = resolveMaterialTextureCoordinates(
        material.textureCoordinates?.get(field)
      );
      const offset = record.offset / 4;
      f32[offset] = coordinates.transform.offset[0];
      f32[offset + 1] = coordinates.transform.offset[1];
      f32[offset + 2] = coordinates.transform.scale[0];
      f32[offset + 3] = coordinates.transform.scale[1];
      f32[offset + 4] = coordinates.set;
      f32[offset + 5] = coordinates.transform.rotation;
      f32[offset + 6] = u;
      f32[offset + 7] = v;
    }
    return;
  }
  const textureScaleOffset = LEGACY_MATERIAL_TEXTURE_SCALE_OFFSET;
  const hasTextureMetadata = material.textureCoordinates !== void 0 || material.textureHandles !== void 0 || material.videoTextureFields !== void 0 || material.baseColorTexture !== void 0 || material.metallicRoughnessTexture !== void 0 || material.normalTexture !== void 0 || material.emissiveTexture !== void 0 || material.occlusionTexture !== void 0;
  if (!hasTextureMetadata) {
    f32.set(DEFAULT_LEGACY_TEXTURE_SCALES, textureScaleOffset / 4);
    return;
  }
  const fields = LEGACY_MATERIAL_TEXTURE_SCALE_FIELDS;
  for (let index = 0; index < fields.length; index++) {
    const field = fields[index];
    if (field === void 0) continue;
    const handle = materialTextureForField(material, field);
    const resolved = handle === void 0 ? void 0 : resolveAssetHandle(world, handle);
    const texture = resolved?.ok === true ? resolved.value : void 0;
    const [u, v] = materialTextureUvScale(texture);
    const offset = textureScaleOffset / 4 + index * 2;
    f32[offset] = u;
    f32[offset + 1] = v;
  }
}
function materialCoordinateSchema(material) {
  if (material.materialParamSchema !== void 0 && material.materialParamSchema.length > 0) {
    return material.materialParamSchema;
  }
  if (isStandardPbrMaterialShader(material.materialShaderId)) return STANDARD_PIPELINE_PARAM_SCHEMA;
  switch (material.materialShaderId) {
    case "forgeax::default-unlit":
      return DEFAULT_UNLIT_PARAM_SCHEMA;
    case "forgeax::sprite":
    case "forgeax::sprite-lit":
      return DEFAULT_SPRITE_PARAM_SCHEMA;
    case "forgeax::msdf-text":
      return DEFAULT_MSDF_TEXT_PARAM_SCHEMA;
    default:
      return void 0;
  }
}
function userRegionTextureFieldOrder(schema) {
  if (schema === void 0) return BUILTIN_USER_REGION_TEXTURE_FIELDS;
  const fields = [...derivedParamSchema(schema).textureFieldNames];
  return fields;
}
function defaultViewForUserRegionField(field, pipelineState, schema) {
  const parameter = schema?.find((entry) => entry.name === field);
  if (parameter?.type === "texture_cube") {
    return pipelineState.skylightFallback?.prefilterView ?? pipelineState.defaultWhiteTextureView;
  }
  if (field === "normalTexture") return pipelineState.defaultNormalTextureView;
  if (field === "baseColorTexture") return pipelineState.fallbackTextureView;
  if (field === "anisotropyTexture") {
    return pipelineState.defaultAnisotropyTextureView ?? pipelineState.defaultNormalTextureView;
  }
  return pipelineState.defaultWhiteTextureView;
}
function detectNineSliceScaleTooSmall(transformWorld, slices, renderableIndex, seenIndices, metrics) {
  const anyNonZero = slices[0] !== 0 || slices[1] !== 0 || slices[2] !== 0 || slices[3] !== 0;
  if (!anyNonZero) return;
  const sx = Math.hypot(transformWorld[0] ?? 1, transformWorld[1] ?? 0, transformWorld[2] ?? 0);
  const sy = Math.hypot(transformWorld[4] ?? 0, transformWorld[5] ?? 1, transformWorld[6] ?? 0);
  const horizontalAnchor = Math.abs(slices[0]) + Math.abs(slices[2]);
  const verticalAnchor = Math.abs(slices[1]) + Math.abs(slices[3]);
  if (sx < horizontalAnchor || sy < verticalAnchor) {
    if (!seenIndices.has(renderableIndex)) {
      seenIndices.add(renderableIndex);
      metrics.increment("nineslice.scale-too-small");
    }
  }
}
function writePbrMaterialUboPayload(buf, material) {
  if (buf.byteLength < STANDARD_PBR_UBO_SIZE) {
    throw new RangeError(
      `writePbrMaterialUboPayload: expected at least ${STANDARD_PBR_UBO_SIZE} bytes, got ${buf.byteLength}`
    );
  }
  buf.fill(0);
  const dataView = materialUboDataView(buf);
  const schema = material.materialParamSchema === void 0 || material.materialParamSchema.length === 0 ? STANDARD_PIPELINE_PARAM_SCHEMA : material.materialParamSchema;
  const snapshot = material.paramSnapshot;
  const fallback = (name, entry) => {
    switch (name) {
      case "baseColor":
        return [
          material.baseColor[0] ?? 1,
          material.baseColor[1] ?? 1,
          material.baseColor[2] ?? 1,
          1
        ];
      case "metallic":
        return material.metallic;
      case "roughness":
        return material.roughness;
      case "specularColor":
        return material.specularColor ?? [1, 1, 1];
      case "normalScale":
        return material.normalScale ?? 1;
      case "emissive":
        return material.emissive ?? [0, 0, 0];
      case "emissiveIntensity":
        return material.emissiveIntensity ?? 0;
      case "occlusionStrength":
        return material.occlusionStrength ?? 1;
      default:
        return entry.default;
    }
  };
  for (const entry of derivedParamSchema(schema).uboLayout.entries) {
    const value = snapshot?.[entry.name] ?? fallback(entry.name, schema.find((item) => item.name === entry.name) ?? entry);
    if (typeof value === "number") {
      writeNumericParamValue(dataView, entry, value);
    } else if (Array.isArray(value)) {
      writeNumericParamValue(dataView, entry, value);
    }
  }
}
function applyParamSnapshotToUbo(payload, paramSchema, paramSnapshot) {
  if (paramSchema === void 0) return;
  if (paramSnapshot === void 0) return;
  const dataView = materialUboDataView(payload);
  const { uboLayout } = derivedParamSchema(paramSchema);
  for (const entry of uboLayout.entries) {
    const value = paramSnapshot[entry.name];
    if (value === void 0) continue;
    if (typeof value === "number") {
      writeNumericParamValue(dataView, entry, value);
      continue;
    }
    if (Array.isArray(value)) {
      const arr = value;
      writeNumericParamValue(dataView, entry, arr);
    }
  }
}
function applyParamSchemaDefaultsToUbo(payload, paramSchema) {
  if (paramSchema === void 0) return;
  const defaults = {};
  for (const entry of derivedParamSchema(paramSchema).uboLayout.entries) {
    const schemaEntry = paramSchema.find((candidate) => candidate.name === entry.name);
    const value = schemaEntry?.default;
    if (typeof value === "number" || Array.isArray(value)) {
      defaults[entry.name] = value;
    }
  }
  applyParamSnapshotToUbo(payload, paramSchema, defaults);
}
function recordIblMaterialBinding(frameState, materialBgl, bindGroup, entries, iblStart, cache3) {
  const receipt = frameState.iblBindingInspection;
  if (receipt === void 0) return;
  const skylightBindingStart = entries.findIndex((entry) => entry.binding === iblStart);
  if (skylightBindingStart < 0) return;
  const iblEntries = entries.slice(skylightBindingStart, skylightBindingStart + 6);
  const projected = [];
  for (const entry of iblEntries) {
    if (entry.resource.kind === "externalTexture") continue;
    const value = entry.resource.kind === "buffer" ? entry.resource.value.buffer : entry.resource.value;
    if (typeof value !== "object" || value === null) continue;
    projected.push({
      binding: entry.binding,
      kind: entry.resource.kind,
      resourceIdentity: getOpaqueResourceIdentity(value)
    });
  }
  frameState.iblBindingInspection = {
    ...receipt,
    material: {
      bindGroupIdentity: getOpaqueResourceIdentity(bindGroup),
      materialBglIdentity: getOpaqueResourceIdentity(materialBgl),
      cache: cache3,
      skylightBindingStart: iblEntries[0]?.binding ?? 0,
      entries: projected,
      reflectionBindings: projected.map((entry) => entry.binding)
    },
    errors: []
  };
}
function isMaterialBgAssemblyCacheHit(cached, material, materialBgl, materialBuffer, skylightResources, materialResourceEpoch, transmissionBackdropView, sceneMaterialBuffer, surfaceRawDepthView) {
  if (transmissionBackdropView != null || surfaceRawDepthView != null || (material.textureSources?.size ?? 0) > 0)
    return false;
  return cached?.material === material && cached.materialResourceEpoch === materialResourceEpoch && cached.materialBgl === materialBgl && cached.materialBuffer === materialBuffer && cached.sceneMaterialBuffer === sceneMaterialBuffer && cached.skylightResources.irradianceView === skylightResources.irradianceView && cached.skylightResources.irradianceSampler === skylightResources.irradianceSampler && cached.skylightResources.prefilterView === skylightResources.prefilterView && cached.skylightResources.skylightPrefilterView === skylightResources.skylightPrefilterView && cached.skylightResources.prefilterSampler === skylightResources.prefilterSampler && cached.skylightResources.brdfLutView === skylightResources.brdfLutView && cached.skylightResources.intensityBuffer === skylightResources.intensityBuffer;
}
function buildPerSubmeshMaterialBg(deps, submeshMaterial, entityKey, materialWorld = deps.world, materialShaderId = submeshMaterial.materialShaderId) {
  const {
    runtime,
    pipelineState,
    store,
    materialSlice,
    videoHighPerfAvailable,
    skylightResources,
    resolveRenderTargetTextureSource,
    resolveReflectionProbeResources,
    materialBgShared,
    materialBgAssemblyCache,
    transmissionBackdropView,
    surfaceRawDepthView,
    surfaceNearestLayerView,
    surfaceNearestDepthView,
    bindGroupCounts,
    frameState
  } = deps;
  const selectedProbe = resolveReflectionProbeResources?.(materialWorld, entityKey);
  const effectiveSkylightResources = selectedProbe?.resources ?? skylightResources;
  const smMaterialHandle = submeshMaterial.materialHandle;
  const materialCacheKey = smMaterialHandle === void 0 ? void 0 : `${materialWorld.identity}:${smMaterialHandle}:${materialShaderId ?? ""}:${selectedProbe?.probeIndex ?? "sky"}`;
  const smHasVideoFields = (submeshMaterial.videoTextureFields?.size ?? 0) > 0;
  const smShaderId = materialShaderId;
  const selectedMaterialShaderArtifact = smShaderId === void 0 ? void 0 : runtime.getMaterialShaderArtifact?.(smShaderId);
  const selectedMediumShader = smShaderId === "forgeax::single-layer-medium" || selectedMaterialShaderArtifact?.receipt?.surface?.model === "single-layer-medium";
  let surfaceMediumResources;
  if (selectedMediumShader) {
    if (surfaceRawDepthView == null) {
      throw new RhiError({
        code: "rhi-descriptor-invalid",
        expected: "single-layer medium material bind group has producer-owned raw depth",
        hint: "admit the Surface material only from a graph pass with an available raw-depth pair"
      });
    }
    const nearestLayerView = surfaceNearestLayerView ?? transmissionBackdropView;
    const nearestDepthView = surfaceNearestDepthView ?? pipelineState.shadowFallbackTextureView;
    if (nearestLayerView == null || pipelineState.surfaceMediumDepthSampler === void 0) {
      throw new RhiError({
        code: "rhi-descriptor-invalid",
        expected: "single-layer medium material bind group has paired nearest resources and depth sampler",
        hint: "publish the nearest-layer target and the non-filtering raw-depth sampler before recording the Surface pass"
      });
    }
    surfaceMediumResources = {
      rawDepthSampler: pipelineState.surfaceMediumDepthSampler,
      rawDepthView: surfaceRawDepthView,
      nearestLayerSampler: effectiveSkylightResources.prefilterSampler,
      nearestLayerView,
      nearestDepthSampler: pipelineState.surfaceMediumDepthSampler,
      nearestDepthView
    };
  }
  const smSchema = (smShaderId !== void 0 ? runtime.getParamSchema?.(smShaderId) : void 0) ?? submeshMaterial.materialParamSchema;
  const smPerShaderBgl = smShaderId !== void 0 ? runtime.getMaterialBindGroupLayout?.(smShaderId, smSchema) : void 0;
  const smMaterialBgl = smPerShaderBgl ?? pipelineState.materialBindGroupLayout;
  const standardMaterial = isStandardPbrMaterialShader(smShaderId);
  const physicalFields = standardMaterial && smSchema !== void 0 ? physicalTextureFields(smSchema) : [];
  const smUserRegionFields = smPerShaderBgl === void 0 || isCanonicalStandardPbrMaterialShader(smShaderId) ? BUILTIN_USER_REGION_TEXTURE_FIELDS : userRegionTextureFieldOrder(smSchema).filter((field) => !physicalFields.includes(field));
  const hasActiveTransmissionBackdrop = transmissionBackdropView != null;
  const sceneMaterialBuffer = runtime.device.caps.storageBuffer ? deps.sceneMaterialBuffer ?? pipelineState.meshStorageBuffer.buffer : void 0;
  const diagnosticsEnabled = materialDiagnosticsEnabled();
  if (smMaterialHandle !== void 0 && !smHasVideoFields && !hasActiveTransmissionBackdrop) {
    const cached = materialCacheKey === void 0 ? void 0 : materialBgAssemblyCache.get(materialCacheKey);
    if (isMaterialBgAssemblyCacheHit(
      cached,
      submeshMaterial,
      smMaterialBgl,
      pipelineState.materialUniformBuffer.buffer,
      effectiveSkylightResources,
      store.materialResourceEpoch,
      transmissionBackdropView,
      sceneMaterialBuffer,
      surfaceRawDepthView
    )) {
      if (diagnosticsEnabled) {
        recordIblMaterialBinding(
          frameState,
          smMaterialBgl,
          cached.bindGroup,
          [
            {
              binding: 1 + smUserRegionFields.length * 2,
              resource: { kind: "textureView", value: effectiveSkylightResources.irradianceView }
            },
            {
              binding: 2 + smUserRegionFields.length * 2,
              resource: { kind: "sampler", value: effectiveSkylightResources.irradianceSampler }
            },
            {
              binding: 3 + smUserRegionFields.length * 2,
              resource: { kind: "textureView", value: effectiveSkylightResources.prefilterView }
            },
            {
              binding: 4 + smUserRegionFields.length * 2,
              resource: { kind: "sampler", value: effectiveSkylightResources.prefilterSampler }
            },
            {
              binding: 5 + smUserRegionFields.length * 2,
              resource: { kind: "textureView", value: effectiveSkylightResources.brdfLutView }
            },
            {
              binding: 6 + smUserRegionFields.length * 2,
              resource: {
                kind: "buffer",
                value: { buffer: effectiveSkylightResources.intensityBuffer }
              }
            }
          ],
          1 + smUserRegionFields.length * 2,
          "hit"
        );
      }
      return cached.bindGroup;
    }
  }
  let materialResourcesResident = true;
  const smSamplerForField = (field) => {
    const handle = field === void 0 ? void 0 : submeshMaterial.samplerHandles?.get(field);
    if (handle === void 0) return pipelineState.defaultSampler;
    const sampler = residentSampler(materialWorld, store, runtime, handle);
    if (sampler === void 0) materialResourcesResident = false;
    return sampler ?? pipelineState.defaultSampler;
  };
  const smBaseEntries = [
    {
      binding: 0,
      resource: {
        kind: "buffer",
        value: {
          buffer: pipelineState.materialUniformBuffer.buffer,
          offset: 0,
          size: materialSlice
        }
      }
    }
  ];
  const smBglPairCount = smUserRegionFields.length;
  for (let fi = 0; fi < smBglPairCount; fi++) {
    const field = smUserRegionFields[fi];
    const samplerBinding = 1 + fi * 2;
    const textureBinding = samplerBinding + 1;
    let smView = field !== void 0 ? defaultViewForUserRegionField(field, pipelineState, smSchema) : pipelineState.defaultWhiteTextureView;
    const smVideoClip = field !== void 0 ? submeshMaterial.videoTextureFields?.get(field) : void 0;
    const smTargetSource = field === void 0 ? void 0 : materialRenderTargetSourceForField(
      submeshMaterial,
      field,
      resolveRenderTargetTextureSource
    );
    if (smTargetSource !== void 0) {
      if (smTargetSource.textureView !== void 0) smView = smTargetSource.textureView;
      else materialResourcesResident = false;
    } else if (smVideoClip !== void 0) {
      const view = videoTextureView(
        materialWorld,
        runtime.dynamicTextureStore,
        runtime,
        entityKey,
        smVideoClip,
        videoHighPerfAvailable
      );
      if (view !== void 0) smView = view;
    } else {
      const smHandle = field === "emissiveTexture" ? submeshMaterial.emissiveTexture : field === "occlusionTexture" ? submeshMaterial.occlusionTexture : field !== void 0 ? submeshMaterial.textureHandles?.get(field) : void 0;
      if (smHandle !== void 0) {
        const view = residentTextureView(materialWorld, store, runtime, smHandle);
        if (view !== void 0) smView = view;
        else materialResourcesResident = false;
      }
    }
    smBaseEntries.push(
      {
        binding: samplerBinding,
        resource: { kind: "sampler", value: smSamplerForField(field) }
      },
      {
        binding: textureBinding,
        resource: { kind: "textureView", value: smView }
      }
    );
  }
  const physicalTextureInjections = [];
  for (let slot = 0; slot < physicalFields.length; slot += 1) {
    const field = physicalFields[slot];
    if (field === void 0) continue;
    let view = defaultViewForUserRegionField(field, pipelineState, smSchema);
    const targetSource = materialRenderTargetSourceForField(
      submeshMaterial,
      field,
      resolveRenderTargetTextureSource
    );
    if (targetSource !== void 0) {
      if (targetSource.textureView !== void 0) view = targetSource.textureView;
      else materialResourcesResident = false;
    } else {
      const handle = submeshMaterial.textureHandles?.get(field);
      if (handle !== void 0) {
        const resident = residentTextureView(materialWorld, store, runtime, handle);
        if (resident !== void 0) view = resident;
        else materialResourcesResident = false;
      }
    }
    physicalTextureInjections.push({
      slot: STANDARD_PHYSICAL_TEXTURE_FIELDS.indexOf(
        field
      ),
      sampler: smSamplerForField(field),
      view
    });
  }
  const transmissionSampler = transmissionBackdropView != null ? effectiveSkylightResources.prefilterSampler : pipelineState.defaultSampler;
  const keepMediumBackdropSlots = surfaceMediumResources !== void 0;
  const smMergedEntries = assembleMaterialWithSkylightEntries(
    smBaseEntries,
    effectiveSkylightResources,
    transmissionBackdropAvailable(runtime.device.limits.maxSampledTexturesPerShaderStage) || keepMediumBackdropSlots ? {
      sampler: transmissionSampler,
      ...transmissionBackdropView === void 0 ? { backdropView: pipelineState.defaultWhiteTextureView } : { backdropView: transmissionBackdropView }
    } : null,
    physicalTextureInjections,
    surfaceMediumResources
  );
  if (runtime.device.caps.storageBuffer) {
    smMergedEntries.push({
      binding: 46,
      resource: {
        kind: "buffer",
        value: {
          buffer: deps.sceneMaterialBuffer ?? pipelineState.meshStorageBuffer.buffer
        }
      }
    });
  }
  const createBindGroup = () => {
    const result = runtime.device.createBindGroup({
      label: "pbr-material-skylight-bg",
      layout: smMaterialBgl,
      entries: smMergedEntries
    });
    if (!result.ok) throw result.error;
    return result.value;
  };
  const materialCacheHandles = smMergedEntries.map((entry) => extractEntryResourceHandle(entry));
  if (diagnosticsEnabled && submeshMaterial.textureHandles === void 0 && smMaterialHandle !== void 0) {
    console.error(
      `[render-material] scalar material cache handles: ${JSON.stringify({
        entityKey,
        materialHandle: smMaterialHandle,
        shader: smShaderId,
        surfaceModel: submeshMaterial.surfaceModel,
        layoutIdentity: getOpaqueResourceIdentity(smMaterialBgl),
        bindings: smMergedEntries.map((entry) => entry.binding),
        graphResources: {
          rawDepth: surfaceRawDepthView != null,
          nearestLayer: surfaceNearestLayerView != null,
          nearestDepth: surfaceNearestDepthView != null
        },
        paramSnapshot: submeshMaterial.paramSnapshot,
        handleTypes: materialCacheHandles.map((handle) => typeof handle)
      })}`
    );
  }
  if (diagnosticsEnabled && materialCacheHandles.some((handle) => typeof handle !== "object" || handle === null)) {
    console.error(
      `[render-material] invalid material cache handle: ${JSON.stringify({
        entityKey,
        materialHandle: smMaterialHandle,
        shader: smShaderId,
        entries: smMergedEntries.map((entry, index) => ({
          index,
          binding: entry.binding,
          kind: entry.resource.kind,
          handleType: typeof materialCacheHandles[index]
        }))
      })}`
    );
  }
  const smBindGroup = hasActiveTransmissionBackdrop ? createBindGroup() : getOrCreatePerEntity(
    materialBgShared,
    smShaderId ?? "",
    materialCacheHandles,
    "material-shared",
    createBindGroup,
    bindGroupCounts
  );
  if (diagnosticsEnabled) {
    recordIblMaterialBinding(
      frameState,
      smMaterialBgl,
      smBindGroup,
      smMergedEntries,
      smBaseEntries.length,
      "miss"
    );
  }
  if (smMaterialHandle !== void 0 && !smHasVideoFields && (submeshMaterial.textureSources?.size ?? 0) === 0 && materialResourcesResident && !hasActiveTransmissionBackdrop) {
    if (materialCacheKey !== void 0) {
      materialBgAssemblyCache.set(materialCacheKey, {
        material: submeshMaterial,
        materialResourceEpoch: store.materialResourceEpoch,
        materialBgl: smMaterialBgl,
        materialBuffer: pipelineState.materialUniformBuffer.buffer,
        ...sceneMaterialBuffer === void 0 ? {} : { sceneMaterialBuffer },
        skylightResources: effectiveSkylightResources,
        bindGroup: smBindGroup
      });
    }
  }
  return smBindGroup;
}
var ZERO_SKYLIGHT_PAYLOAD = new Float32Array([0, 0, 0, 0, 0, 0, 0, 1]);
function resolveMaterialSkylight(runtime, pipelineState, skylight, skylightCount, environmentIbl) {
  const skylightFallback = pipelineState.skylightFallback;
  if (skylightFallback === null) {
    throw new RhiError({
      code: "webgpu-runtime-error",
      expected: "pipelineState.skylightFallback != null when PBR pipeline is active",
      hint: "createRenderer must allocate skylightFallback alongside the PBR pipeline (D-5 round-4)"
    });
  }
  let activeViews;
  runtime.device.queue.writeBuffer(skylightFallback.intensityBuffer, 0, ZERO_SKYLIGHT_PAYLOAD);
  if (skylight !== void 0 && skylightCount >= 1) {
    const [cr, cg, cb] = skylight.color;
    const [qx, qy, qz, qw] = skylight.rotation;
    const uniformPayload = new Float32Array([skylight.intensity, cr, cg, cb, qx, qy, qz, qw]);
    runtime.device.queue.writeBuffer(skylightFallback.intensityBuffer, 0, uniformPayload);
    const cache3 = getOrCreateIblCache(runtime.deviceScope);
    if (cache3.irradianceView !== void 0 && cache3.prefilterView !== void 0 && cache3.brdfLutView !== void 0) {
      activeViews = {
        irr: cache3.irradianceView,
        pref: cache3.prefilterView,
        brdf: cache3.brdfLutView
      };
    }
  }
  if (environmentIbl !== void 0 && skylight !== void 0 && skylight.equirectHandle === 0) {
    activeViews = {
      irr: environmentIbl.irradiance,
      pref: environmentIbl.prefilter,
      brdf: activeViews?.brdf ?? skylightFallback.brdfLutView
    };
  }
  const skylightResources = activeViews !== void 0 ? {
    irradianceView: activeViews.irr,
    irradianceSampler: skylightFallback.sampler,
    prefilterView: activeViews.pref,
    prefilterSampler: skylightFallback.sampler,
    brdfLutView: activeViews.brdf,
    intensityBuffer: skylightFallback.intensityBuffer
  } : {
    irradianceView: skylightFallback.irradianceView,
    irradianceSampler: skylightFallback.sampler,
    prefilterView: skylightFallback.prefilterView,
    prefilterSampler: skylightFallback.sampler,
    brdfLutView: skylightFallback.brdfLutView,
    intensityBuffer: skylightFallback.intensityBuffer
  };
  return { skylightResources, activeViews };
}
function prepareMaterialSkylight(c) {
  return resolveMaterialSkylight(
    c.runtime,
    c.pipelineState,
    c.skylight,
    c.skylightCount,
    c.environmentIbl
  );
}

// src/record/probe-blend-buffer.ts
function isProbeBlendProjection(input) {
  return !Array.isArray(input);
}
function retireProbeBlendRecordBuffer(buffer) {
  const destroy = () => {
    if (!buffer.isDestroyed) void buffer.destroy();
  };
  void buffer.device.queue.onSubmittedWorkDone().then(destroy, destroy);
}
function createCompleteProbeBlendBuffer(device, requiredCapacity, records) {
  const created = device.createBuffer({
    label: "probe-blend-records",
    size: requiredCapacity * PROBE_BLEND_RECORD_STRIDE,
    usage: (device.caps.storageBuffer ? GPU_BUFFER_USAGE_STORAGE : GPU_BUFFER_USAGE_UNIFORM) | GPU_BUFFER_USAGE_COPY_DST,
    mappedAtCreation: false
  });
  if (!created.ok) throw created.error;
  const candidate = new GpuBuffer(device, created.value);
  const cache3 = /* @__PURE__ */ new Map();
  try {
    for (const { cacheKey, record } of records) {
      const uploaded = device.queue.writeBuffer(
        candidate.handle,
        probeBlendRecordOffset(record.objectKey),
        record.bytes
      );
      if (!uploaded.ok) throw uploaded.error;
      cache3.set(cacheKey, {
        generation: record.generation,
        bytes: new Uint8Array(record.bytes)
      });
    }
  } catch (cause) {
    void candidate.destroy();
    throw cause;
  }
  return { buffer: candidate, cache: cache3 };
}
function ensureProbeBlendRecordBuffer(device, frameState, input) {
  const projection = input !== void 0 && isProbeBlendProjection(input) ? input : void 0;
  const records = input === void 0 ? [] : projection?.records ?? input;
  let buffer = frameState.probeBlendRecordBuffer;
  const accepted = frameState.probeBlendRecordProjection;
  if (projection !== void 0 && accepted?.projection === projection && accepted.device === device) {
    if (accepted.buffer === buffer && buffer !== void 0 && !buffer.isDestroyed) {
      return buffer.handle;
    }
  }
  const requiredCapacity = Math.max(
    1,
    projection?.capacity ?? records.reduce((capacity, { record }) => Math.max(capacity, record.objectKey + 2), 1)
  );
  const grows = buffer === void 0 || buffer.isDestroyed || buffer.device !== device || frameState.probeBlendRecordBufferCapacity < requiredCapacity;
  const hasAcceptedBaseline = projection !== void 0 && accepted !== void 0 && accepted.device === device && accepted.buffer === buffer && buffer !== void 0 && !buffer.isDestroyed && accepted.projection.sourceIdentity === projection.sourceIdentity && accepted.projection.revision === projection.baseRevision;
  const requiresCompletePublish = grows || projection !== void 0 && (!hasAcceptedBaseline || projection.dirtyRecords.length > 1);
  if (requiresCompletePublish) {
    const candidate = createCompleteProbeBlendBuffer(device, requiredCapacity, records);
    const previous = buffer;
    buffer = candidate.buffer;
    frameState.probeBlendRecordBuffer = candidate.buffer;
    frameState.probeBlendRecordBufferCapacity = requiredCapacity;
    frameState.probeBlendBuffers.clear();
    for (const [key, value] of candidate.cache) frameState.probeBlendBuffers.set(key, value);
    if (projection === void 0) delete frameState.probeBlendRecordProjection;
    else frameState.probeBlendRecordProjection = { projection, device, buffer: candidate.buffer };
    if (previous !== void 0) retireProbeBlendRecordBuffer(previous);
    return candidate.buffer.handle;
  }
  if (buffer === void 0) throw new Error("probe blend record buffer allocation failed");
  if (input === void 0) return buffer.handle;
  const changed = projection?.dirtyRecords ?? records;
  const cacheUpdates = [];
  for (const { cacheKey, record } of changed) {
    const cached = frameState.probeBlendBuffers.get(cacheKey);
    const unchanged = cached !== void 0 && cached.generation === record.generation && cached.bytes.length === record.bytes.length && cached.bytes.every((value, index) => value === record.bytes[index]);
    if (unchanged) continue;
    const uploaded = device.queue.writeBuffer(
      buffer.handle,
      probeBlendRecordOffset(record.objectKey),
      record.bytes
    );
    if (!uploaded.ok) throw uploaded.error;
    cacheUpdates.push([
      cacheKey,
      { generation: record.generation, bytes: new Uint8Array(record.bytes) }
    ]);
  }
  for (const [cacheKey, value] of cacheUpdates) frameState.probeBlendBuffers.set(cacheKey, value);
  for (const cacheKey of projection?.removedCacheKeys ?? []) {
    frameState.probeBlendBuffers.delete(cacheKey);
  }
  if (projection === void 0) delete frameState.probeBlendRecordProjection;
  else frameState.probeBlendRecordProjection = { projection, device, buffer };
  return buffer.handle;
}

// src/record/main-pass-geometry.ts
function sameOpaqueTemporalDraw(a, b) {
  return (isStandardPbrMaterialShader(a.materialShaderId) || a.tags.SurfaceKind === "standard" && b.tags.SurfaceKind === "standard" && a.tags.SurfaceModule === b.tags.SurfaceModule) && a.materialShaderId === b.materialShaderId && a.renderState?.blend === void 0 && b.renderState?.blend === void 0 && a.renderState?.stencil === void 0 && b.renderState?.stencil === void 0 && a.stencilReference === b.stencilReference && renderStateHash(a.renderState) === renderStateHash(b.renderState);
}
function materialDiagnosticsEnabled2() {
  if (typeof globalThis !== "object" || globalThis === null || !("process" in globalThis)) {
    return false;
  }
  const processValue = globalThis.process;
  return processValue?.env?.FORGEAX_MATERIAL_DIAGNOSTICS === "1";
}
function variantSetForCoveragePass(variantSet, coverageOnly) {
  if (!coverageOnly) return variantSet;
  if (variantSet?.includes("COVERAGE_ONLY=")) return variantSet;
  return variantSet === void 0 || variantSet === "" ? "COVERAGE_ONLY=true" : `${variantSet}+COVERAGE_ONLY=true`;
}
function isHdrGeometryTarget(tonemapActive, colorFormatOverride) {
  return colorFormatOverride === void 0 ? tonemapActive : colorFormatOverride === "rgba16float";
}
function gpuDrivenDrawIndicesBySubmesh(source, mesh) {
  const draws = source.gpuDrivenDraws;
  if (draws === void 0 || draws.length === 0) return /* @__PURE__ */ new Map();
  const indices = /* @__PURE__ */ new Map();
  let hasStableSourceIdentity = false;
  for (const [compactIndex, draw] of draws.entries()) {
    const drawItemIndex = draw.drawItemIndex;
    if (drawItemIndex === void 0) continue;
    hasStableSourceIdentity = true;
    if (mesh.submeshes[drawItemIndex] !== void 0) indices.set(drawItemIndex, compactIndex);
  }
  if (hasStableSourceIdentity) return indices;
  let nonIndexedFirst = 0;
  let drawCursor = 0;
  for (const [submeshIndex, submesh] of mesh.submeshes.entries()) {
    const first = mesh.indexed ? submesh.indexOffset : nonIndexedFirst;
    const count = mesh.indexed ? submesh.indexCount : submesh.vertexCount;
    if (!mesh.indexed) nonIndexedFirst += submesh.vertexCount;
    const draw = draws[drawCursor];
    if (draw !== void 0 && draw.first === first && draw.count === count && draw.materialSlot === submesh.materialSlot && draw.topology === submesh.topology) {
      indices.set(submeshIndex, drawCursor);
      drawCursor += 1;
    }
  }
  return indices;
}
function isGpuDrivenMainClaimedSubmesh(c, source, submeshIndex, drawIndices) {
  const drawItemIndex = drawIndices.get(submeshIndex);
  const draw = drawItemIndex === void 0 ? void 0 : source.gpuDrivenDraws?.[drawItemIndex];
  if (drawItemIndex === void 0 || draw === void 0) return false;
  const material = source.materials[draw.materialSlot] ?? source.material;
  const sourceDrawItemIndex = gpuDrivenSourceDrawItemIndex(draw, drawItemIndex);
  const stableWorld = c.gpuDrivenWorldKeys?.[source.worldId] ?? source.worldId;
  return c.gpuDrivenDrawKeys?.has(
    gpuDrivenDrawKey(
      worldEntityKey(stableWorld, source.entityKey),
      material.materialHandle ?? -1,
      sourceDrawItemIndex
    )
  ) === true;
}
function requestsStandardTransmissionVariant(material) {
  return material.materialShaderId === "forgeax::default-standard-pbr" && material.paramSnapshot?.transmission !== void 0;
}
function recordIblPipelineBinding(c, material, pipeline, materialGroup) {
  const receipt = c.frameState.iblBindingInspection;
  if (receipt === void 0 || !isStandardPbrMaterialShader(material.materialShaderId)) return;
  const materialBgl = c.runtime.getMaterialBindGroupLayout?.(
    material.materialShaderId ?? "forgeax::default-standard-pbr"
  ) ?? c.pipelineState.materialBindGroupLayout;
  c.frameState.iblBindingInspection = {
    ...receipt,
    pipeline: {
      pipelineIdentity: getOpaqueResourceIdentity(pipeline),
      effectiveMaterialLayoutIdentity: effectiveMaterialLayoutIdentity(
        material.materialShaderId ?? "forgeax::default-standard-pbr",
        material.materialParamSchema
      ),
      materialBglIdentity: getOpaqueResourceIdentity(materialBgl),
      bindGroupIdentity: getOpaqueResourceIdentity(materialGroup),
      drawFrameId: c.frameState.frameNumber
    }
  };
  const materialReceipt = c.frameState.iblBindingInspection.material;
  const errors = [];
  if (materialReceipt !== void 0 && materialReceipt.materialBglIdentity !== getOpaqueResourceIdentity(materialBgl)) {
    errors.push("material-pipeline-bgl-identity-mismatch");
  }
  if (materialReceipt !== void 0 && materialReceipt.bindGroupIdentity !== getOpaqueResourceIdentity(materialGroup)) {
    errors.push("material-bind-group-identity-mismatch");
  }
  if (materialReceipt !== void 0) {
    const expectedResourceIdentities = [
      receipt.resources.irradiance.viewIdentity,
      receipt.resources.irradiance.samplerIdentity,
      receipt.resources.prefilter.viewIdentity,
      receipt.resources.prefilter.samplerIdentity,
      receipt.resources.brdfLut.viewIdentity,
      receipt.resources.brdfLut.samplerIdentity,
      receipt.resources.intensityBufferIdentity
    ];
    const actualResourceIdentities = materialReceipt.entries.filter((entry) => entry.binding >= materialReceipt.skylightBindingStart).slice(0, expectedResourceIdentities.length).map((entry) => entry.resourceIdentity);
    if (actualResourceIdentities.length !== expectedResourceIdentities.length || actualResourceIdentities.some(
      (identity, index) => identity !== expectedResourceIdentities[index]
    )) {
      errors.push("material-ibl-resource-identity-mismatch");
    }
  }
  c.frameState.iblBindingInspection = {
    ...c.frameState.iblBindingInspection,
    status: errors.length === 0 ? "binding-chain-consistent" : "binding-chain-mismatch",
    errors
  };
}
var SHARED_BOOT_MATERIAL_SHADER_IDS = /* @__PURE__ */ new Set([
  "forgeax::default-unlit",
  "forgeax::default-shadow-caster",
  "forgeax::sprite",
  "forgeax::sprite-lit",
  "forgeax::default-sprite",
  "forgeax::msdf-text",
  "forgeax::default-standard-pbr",
  "forgeax::pbr-skin",
  "forgeax::default-standard-pbr-skin"
]);
function effectiveMaterialLayoutIdentity(materialShaderId, materialParamSchema) {
  if (materialParamSchema === void 0) return void 0;
  const hasStandardPhysicalMaps = isStandardPbrMaterialShader(materialShaderId) && physicalTextureFields(materialParamSchema).length > 0;
  if (SHARED_BOOT_MATERIAL_SHADER_IDS.has(materialShaderId) && !hasStandardPhysicalMaps) {
    return void 0;
  }
  return materialBindGroupLayoutIdentity(materialShaderId, materialParamSchema);
}
function geometryRenderStateForPass(base, passKind, coverageOnly = false) {
  if (passKind !== "temporal") return base;
  return {
    ...base,
    depthWriteEnabled: coverageOnly,
    depthCompare: "less-equal"
  };
}
function authoredTransparentDepthWrite(transparent, renderState) {
  return (transparent === true || renderState?.blend !== void 0) && renderState?.depthWriteEnabled === true;
}
function geometryRecordPhase(passKind, segment) {
  const pass = passKind === "deferred" ? "g-buffer" : "forward";
  return `record/graph-execute/${pass}/${segment}`;
}
function profileGeometrySegment(c, passKind, segment, action) {
  const profilePhase = c.profilePhase;
  return profilePhase === void 0 ? action() : profilePhase(geometryRecordPhase(passKind, segment), action);
}
function submitSubmeshDraws(pass, state, pipeline, instanceDraws, indexed, indexCount, vertexCount, indexOffset, onDraw) {
  if (state.pipeline !== pipeline) {
    pass.setPipeline(pipeline);
    state.pipeline = pipeline;
  }
  for (const instanceDraw of instanceDraws) {
    if (instanceDraw.instanceBuffer !== state.instancesBuffer || instanceDraw.instanceBindGroup !== state.instanceBindGroup || instanceDraw.probeOffset !== state.probeOffset) {
      if (instanceDraw.dynamicOffsets !== void 0) {
        pass.setBindGroup(3, instanceDraw.instanceBindGroup, instanceDraw.dynamicOffsets);
      } else if (instanceDraw.probeOffset < 0) {
        pass.setBindGroup(3, instanceDraw.instanceBindGroup);
      } else {
        pass.setBindGroup(3, instanceDraw.instanceBindGroup, [instanceDraw.probeOffset]);
      }
      state.instancesBuffer = instanceDraw.instanceBuffer;
      state.instanceBindGroup = instanceDraw.instanceBindGroup;
      state.probeOffset = instanceDraw.probeOffset;
    }
    if (indexed) {
      pass.drawIndexed(indexCount, instanceDraw.instanceCount, indexOffset, 0, 0);
    } else {
      pass.draw(vertexCount, instanceDraw.instanceCount, 0, 0);
    }
    onDraw?.(instanceDraw, indexed ? "draw-indexed" : "draw");
  }
}
function recordPointsLinesDraw(pass, plan) {
  if (plan.drawCount === 0) return;
  if (plan.indexCount > 0) {
    pass.drawIndexed(plan.indexCount, 1, 0, 0, 0);
    return;
  }
  pass.draw(plan.vertexCount, 1, 0, 0);
}
function recordGeometryDraws(c, pass, matchedMaterials, materialSlotIndices, sampleCount, meshGroup2, meshBindGroup, resolveMaterialBindGroup, passKind = "forward", selectedDispatch, colorFormats = [], coverageOnly = false, fragmentEntryPoint, surfacePass, transparentDepthWrite = false) {
  const {
    runtime,
    pipelineState,
    frameState,
    bindGroupCounts,
    dispatchCounts,
    tonemapActive,
    msaaActive,
    validatedOrdered,
    splitLdrSprite,
    viewBindGroup,
    viewBindGroupDynamicOffset = 0
  } = c;
  const materialPasses = /* @__PURE__ */ new Map();
  for (const dispatch of selectedDispatch ?? []) {
    let byMaterial = materialPasses.get(dispatch.renderableIndex);
    if (byMaterial === void 0) {
      byMaterial = /* @__PURE__ */ new Map();
      materialPasses.set(dispatch.renderableIndex, byMaterial);
    }
    const passes = byMaterial.get(dispatch.materialHandle);
    if (passes === void 0) byMaterial.set(dispatch.materialHandle, [dispatch]);
    else if (passKind !== "temporal" || !passes.some((previous) => sameOpaqueTemporalDraw(previous, dispatch)))
      passes.push(dispatch);
  }
  const diagnosticsEnabled = materialDiagnosticsEnabled2();
  const colorFormatOverride = c.transparentColorFormat;
  const clusteredLighting = c.standardLighting?.kind === "clustered";
  const isHdrTarget = isHdrGeometryTarget(tonemapActive, colorFormatOverride);
  const withCoverageVariant = (variantSet) => variantSetForCoveragePass(variantSet, coverageOnly);
  let lastVertexBuffer = null;
  let lastIndexBuffer = null;
  const bindingState = {
    pipeline: null,
    instancesBuffer: null,
    instanceBindGroup: null,
    probeOffset: -1
  };
  const identityInstanceBuffer = pipelineState.identityInstanceBuffer;
  const identityInstanceDraws = [
    {
      instanceBuffer: identityInstanceBuffer,
      instanceBindGroup: resolveGeometryInstancesBindGroup(c, identityInstanceBuffer, void 0),
      probeOffset: -1,
      instanceCount: 1
    }
  ];
  const profilePhase = c.profilePhase;
  const materialGroup1DynamicOffsets = new Uint32Array(1);
  const meshGroup2DynamicOffsets = [0];
  let lastStencilReference = null;
  const materialPipelineLookupCache = /* @__PURE__ */ new Map();
  const recordOcclusionCandidate = (draw) => {
    draw();
  };
  const resolveMaterialPipeline = (materialShaderId, renderState, topology, indexFormat, variantSet, colorFormat, layoutProjection, vertexEntry, fragmentEntry, textureMask, layoutKind) => {
    const pipelineVariantSet = withCoverageVariant(variantSet);
    const reflectionFallbackFormats = materialShaderId === "forgeax::default-standard-pbr" && c.reflectionFallbackColorFormat !== void 0 ? passKind === "deferred" ? colorFormats.slice(1) : [c.reflectionFallbackColorFormat] : void 0;
    const renderStateKey = renderStateHash(renderState);
    const shaderLookupCache = materialPipelineLookupCache.get(materialShaderId);
    const cachedLookups = shaderLookupCache?.get(renderStateKey);
    if (cachedLookups !== void 0) {
      for (const cached of cachedLookups) {
        if (cached.isHdrTarget === isHdrTarget && cached.renderStateKey === renderStateKey && cached.topology === topology && cached.indexFormat === indexFormat && cached.variantSet === pipelineVariantSet && cached.vertexEntry === vertexEntry && cached.fragmentEntry === fragmentEntry && cached.textureMask === textureMask && cached.layoutKind === layoutKind && cached.passKind === passKind && cached.layoutProjection.digest === layoutProjection.digest && cached.sampleCount === sampleCount && cached.colorFormatOverride === colorFormat && cached.additionalColorFormats?.join(",") === reflectionFallbackFormats?.join(",")) {
          return cached.handle;
        }
      }
    }
    const resolvedVariantSetResult = runtime.getMaterialArtifact?.(materialShaderId) !== void 0 && layoutKind === void 0 ? { ok: true, value: void 0 } : pipelineVariantSet === void 0 && (materialShaderId === "forgeax::sprite" || materialShaderId === "forgeax::sprite-lit") ? { ok: true, value: void 0 } : variantSetFromVertexLayoutProjection(layoutProjection, pipelineVariantSet);
    if (!resolvedVariantSetResult.ok) {
      runtime.errorRegistry.fire(resolvedVariantSetResult.error);
      return null;
    }
    const resolvedVariantSet = resolvedVariantSetResult.value;
    const fallbackVariantSet = materialShaderId !== "forgeax::default-standard-pbr" ? resolvedVariantSet : c.reflectionFallbackColorFormat !== void 0 && resolvedVariantSet === "" ? "" : `${resolvedVariantSet === void 0 || resolvedVariantSet === "" ? "" : `${resolvedVariantSet}+`}REFLECTION_FALLBACK_AVAILABLE=${c.reflectionFallbackColorFormat !== void 0}`;
    const resolvePipeline = () => runtime.getMaterialShaderPipelineEntry?.(
      materialShaderId,
      isHdrTarget,
      renderState,
      topology,
      indexFormat,
      fallbackVariantSet,
      passKind,
      void 0,
      sampleCount,
      colorFormat,
      void 0,
      void 0,
      void 0,
      layoutProjection,
      void 0,
      layoutKind,
      void 0,
      reflectionFallbackFormats,
      vertexEntry,
      fragmentEntry,
      void 0,
      textureMask === void 0 ? void 0 : { [STANDARD_TEXTURE_MASK_OVERRIDE]: textureMask }
    ) ?? null;
    const handle = profilePhase === void 0 ? resolvePipeline() : profileGeometrySegment(c, passKind, "pipeline-selection", resolvePipeline);
    if (handle !== null) {
      const nextLookup = {
        materialShaderId,
        isHdrTarget,
        renderStateKey,
        topology,
        indexFormat,
        variantSet: pipelineVariantSet,
        vertexEntry,
        fragmentEntry,
        passKind,
        layoutProjection,
        sampleCount,
        colorFormatOverride: colorFormat,
        additionalColorFormats: reflectionFallbackFormats,
        textureMask,
        layoutKind,
        handle
      };
      if (shaderLookupCache === void 0) {
        materialPipelineLookupCache.set(
          materialShaderId,
          /* @__PURE__ */ new Map([[renderStateKey, [nextLookup]]])
        );
      } else if (cachedLookups === void 0) {
        shaderLookupCache.set(renderStateKey, [nextLookup]);
      } else {
        cachedLookups.push(nextLookup);
      }
    }
    return handle;
  };
  for (let i = 0; i < validatedOrdered.length; i++) {
    const entry = validatedOrdered[i];
    if (entry === void 0) continue;
    if (c.foldDispatchPlan?.skipIndices.has(i) === true) continue;
    const pointsLinesSubmission = c.pointsLines?.prepare(entry, clusteredLighting);
    if (entry.source.pointsLines !== void 0 && pointsLinesSubmission?.plan.drawCount !== 1)
      continue;
    if (matchedMaterials !== null && !matchedMaterials.has(entry.renderableIndex)) continue;
    if (selectedDispatch === void 0 && splitLdrSprite && isEntityFullyTransparent(entry.source))
      continue;
    const stencilReference = entry.stencilReference ?? 0;
    if (stencilReference !== lastStencilReference) {
      pass.setStencilReference(stencilReference);
      lastStencilReference = stencilReference;
    }
    if (pointsLinesSubmission !== void 0 && entry.source.pointsLines !== void 0) {
      const pointsLinesMaterial = {
        ...entry.source.material,
        materialShaderId: POINTS_LINES_MATERIAL_SHADER_ID,
        materialParamSchema: runtime.getParamSchema?.(POINTS_LINES_MATERIAL_SHADER_ID) ?? entry.source.material.materialParamSchema
      };
      const materialSlot = materialSlotIndices[i]?.[0] ?? 0;
      const pointsLinesBindGroup = resolveMaterialBindGroup(
        materialSlot,
        pointsLinesMaterial,
        entry.source.entityKey,
        entry.world ?? c.world
      );
      const pointsLinesPipelineEntry = resolveMaterialPipeline(
        POINTS_LINES_MATERIAL_SHADER_ID,
        {
          ...pointsLinesMaterial.renderState,
          cullMode: "none"
        },
        "triangle-list",
        "uint32",
        void 0,
        colorFormatOverride,
        pointsLinesSubmission.layoutProjection
      );
      if (pointsLinesPipelineEntry === null) continue;
      const pointsLinesPipeline = pointsLinesPipelineEntry.pipeline;
      if (pipelineState.pointsLinesViewBuffer === void 0) continue;
      writePointsLinesViewUbo(
        runtime.device.queue,
        pipelineState.pointsLinesViewBuffer,
        c.camera,
        c.targetW,
        c.targetH,
        entry.source.transform.world,
        entry.source.pointsLines.style,
        i * POINTS_LINES_VIEW_SLOT_STRIDE
      );
      pass.setBindGroup(
        0,
        viewBindGroup,
        new Uint32Array([0, i * POINTS_LINES_VIEW_SLOT_STRIDE]),
        0,
        2
      );
      pass.setPipeline(pointsLinesPipeline);
      pass.setVertexBuffer(0, pointsLinesSubmission.vertexBuffer);
      pass.setIndexBuffer(pointsLinesSubmission.indexBuffer, "uint32");
      materialGroup1DynamicOffsets[0] = materialSlot * MATERIAL_PER_ENTITY_STRIDE;
      pass.setBindGroup(1, pointsLinesBindGroup, materialGroup1DynamicOffsets, 0, 1);
      const pointsLinesMeshGroup = meshBindGroup ?? meshGroup2;
      if (pointsLinesMeshGroup === null) continue;
      pass.setBindGroup(2, pointsLinesMeshGroup, meshGroup2DynamicOffsets);
      const pointsLinesInstancesBg = identityInstanceDraws[0]?.instanceBindGroup ?? resolveGeometryInstancesBindGroup(c, identityInstanceBuffer, void 0);
      pass.setBindGroup(3, pointsLinesInstancesBg);
      recordOcclusionCandidate(() => recordPointsLinesDraw(pass, pointsLinesSubmission.plan));
      c.onRenderableDraw?.(entry);
      pass.setBindGroup(0, viewBindGroup, [viewBindGroupDynamicOffset, 0]);
      continue;
    }
    if (entry.mesh.vertexBuffer !== lastVertexBuffer) {
      pass.setVertexBuffer(0, entry.mesh.vertexBuffer.handle);
      lastVertexBuffer = entry.mesh.vertexBuffer;
    }
    if (entry.mesh.indexed && entry.mesh.indexBuffer !== lastIndexBuffer) {
      if (entry.mesh.indexBuffer !== null) {
        pass.setIndexBuffer(entry.mesh.indexBuffer.handle, entry.mesh.indexFormat);
        lastIndexBuffer = entry.mesh.indexBuffer;
      }
    }
    dispatchCounts.unlit += 1;
    const fold = c.foldDispatchPlan?.headBuckets.get(i);
    const foldBuffer = fold === void 0 ? null : resolveFoldInstanceBuffer(c, fold, i);
    const baseInstanceDraws = fold === void 0 ? resolveGeometryInstanceBuffer(c, entry, identityInstanceDraws, false) : foldBuffer === null ? null : [
      {
        instanceBuffer: foldBuffer,
        instanceBindGroup: resolveGeometryInstancesBindGroup(c, foldBuffer, void 0),
        probeOffset: -1,
        instanceCount: fold.bucketSize
      }
    ];
    if (baseInstanceDraws === null) continue;
    let group2BindGroup = meshGroup2;
    meshGroup2DynamicOffsets[0] = i * MESH_PER_ENTITY_STRIDE;
    let group2DynamicOffsets = meshGroup2DynamicOffsets;
    const isSkinEntry = entry.source.skin !== void 0;
    const probeBlendRecordAvailable = runtime.device.caps.storageBuffer && entry.source.probeBlendRecord !== void 0;
    const skinAllocator = pipelineState.skinPaletteAllocator;
    const skinSlice = entry.source.skin;
    const clusteredSkin = clusteredLighting && entry.source.materials.every((material) => {
      const shaderId = material.materialShaderId;
      return !isStandardPbrSkinMaterialShader(shaderId) || isCanonicalStandardPbrMaterialShader(shaderId);
    });
    const skinMeshBindGroupLayout = clusteredSkin ? pipelineState.hdrpSkinMeshBindGroupLayout : pipelineState.pbrSkinMeshBindGroupLayout;
    const hdrpSkinBuffers = isSkinEntry && clusteredSkin ? getOrCreateHdrpBuffers(runtime, frameState.installedPipelineConfig?.clusterGrid) : null;
    const skinResources = isSkinEntry && skinMeshBindGroupLayout !== null && skinAllocator !== null && skinSlice !== void 0 && (!clusteredSkin || hdrpSkinBuffers !== null) ? {
      meshArrayBgl: skinMeshBindGroupLayout,
      paletteBuffer: skinSlice.buffer,
      paletteBindingWindowBytes: skinAllocator.bindingWindowBytes,
      hdrpBuffers: hdrpSkinBuffers
    } : null;
    const skinVariantSetResult = variantSetFromVertexLayoutProjection(
      entry.mesh.layoutProjection,
      standardTopologyVariantSet(
        c.standardLighting,
        runtime.device.caps.storageBuffer,
        entry.mesh.layoutProjection.attributes.some((attribute) => attribute.key === "color"),
        probeBlendRecordAvailable
      )
    );
    if (!skinVariantSetResult.ok) runtime.errorRegistry.fire(skinVariantSetResult.error);
    const skinVariantSet = skinVariantSetResult.ok ? withCoverageVariant(skinVariantSetResult.value) : void 0;
    const skinPsoProbe = skinResources !== null && skinVariantSetResult.ok ? runtime.getMaterialShaderPipeline?.(
      SKIN_MATERIAL_SHADER_ID,
      isHdrTarget,
      entry.source.material.renderState,
      entry.mesh.submeshes[0]?.topology ?? "triangle-list",
      entry.mesh.indexFormat,
      skinVariantSet,
      passKind,
      void 0,
      // meshAttributes — skin probe uses first submesh, derive from entry
      sampleCount,
      colorFormatOverride,
      void 0,
      void 0,
      void 0,
      entry.mesh.layoutProjection,
      void 0,
      void 0,
      void 0
    ) ?? null : null;
    if (skinResources !== null && skinPsoProbe !== null) {
      const meshBindSize = runtime.device.caps.storageBuffer ? MESH_SSBO_BYTES : MESH_UBO_FULL_ARRAY_BYTES;
      const skinStats = pipelineState._skinBgCacheStats;
      const skinMissesBefore = bindGroupCounts.createBindGroup;
      const skinBindGroup = getOrCreateFromChain(
        frameState.meshBindGroupCache,
        [
          pipelineState.meshStorageBuffer.buffer,
          skinResources.paletteBuffer,
          ...skinResources.hdrpBuffers === null ? [] : [
            skinResources.hdrpBuffers.lightDataBuffer,
            skinResources.hdrpBuffers.clusterGridBuffer,
            skinResources.hdrpBuffers.lightIndexListBuffer,
            skinResources.hdrpBuffers.clusterUniformBuffer
          ]
        ],
        "pbr-skin-mesh",
        () => {
          if (skinResources.hdrpBuffers !== null) {
            const result2 = createHdrpSkinUnifiedBindGroup(
              runtime,
              skinResources.hdrpBuffers,
              skinResources.meshArrayBgl,
              pipelineState.meshStorageBuffer.buffer,
              skinResources.paletteBuffer,
              skinResources.paletteBindingWindowBytes
            );
            if (result2 === null) {
              throw new RhiError({
                code: "webgpu-runtime-error",
                expected: "HDRP clustered skin BindGroup creation succeeds",
                hint: "inspect prior errorRegistry events for createBindGroup failure detail"
              });
            }
            return result2;
          }
          const result = runtime.device.createBindGroup({
            label: "pbr-skin-mesh-bg",
            layout: skinResources.meshArrayBgl,
            entries: createPbrSkinMeshBindGroupEntries(
              pipelineState.meshStorageBuffer.buffer,
              meshBindSize,
              skinResources.paletteBuffer,
              skinResources.paletteBindingWindowBytes
            )
          });
          if (!result.ok) throw result.error;
          return result.value;
        },
        bindGroupCounts
      );
      if (skinStats !== void 0) {
        if (bindGroupCounts.createBindGroup > skinMissesBefore) skinStats.miss += 1;
        else skinStats.hit += 1;
      }
      group2BindGroup = skinBindGroup;
      group2DynamicOffsets = pbrSkinMeshDynamicOffsets(
        i * MESH_PER_ENTITY_STRIDE,
        entry.source.skin?.byteOffset ?? 0
      );
    } else if (isSkinEntry) {
      if (diagnosticsEnabled) {
        console.error(
          `[render-material] skin draw skipped: ${JSON.stringify({
            entityKey: entry.source.entityKey,
            materialHandle: entry.source.material.materialHandle,
            reason: "skin-pipeline-unavailable",
            skinResourcesReady: skinResources !== null,
            skinPsoReady: skinPsoProbe !== null,
            paletteBufferReady: skinSlice?.buffer !== void 0,
            paletteByteOffset: skinSlice?.byteOffset
          })}`
        );
      }
      continue;
    }
    let perSubmeshBg = null;
    const gpuDrivenDrawIndices = gpuDrivenDrawIndicesBySubmesh(entry.source, entry.mesh);
    const matsForRebind = entry.source.materials;
    for (let smIdx = 0; smIdx < entry.mesh.submeshes.length; smIdx++) {
      const sm = entry.mesh.submeshes[smIdx];
      if (sm === void 0) continue;
      const matSlotIdx = sm.materialSlot;
      const submeshMaterial = matsForRebind[matSlotIdx] ?? entry.source.material;
      if (matchedMaterials !== null) {
        const materialHandles = matchedMaterials.get(entry.renderableIndex);
        const materialHandle = submeshMaterial.materialHandle ?? 0;
        if (materialHandles === void 0 || !materialHandles.has(materialHandle)) continue;
      }
      if ((passKind === "forward" || passKind === "deferred") && isGpuDrivenMainClaimedSubmesh(c, entry.source, smIdx, gpuDrivenDrawIndices)) {
        continue;
      }
      const selectedMaterialPasses = materialPasses.get(entry.renderableIndex)?.get(submeshMaterial.materialHandle ?? 0);
      const draws = selectedDispatch === void 0 || selectedMaterialPasses === void 0 && submeshMaterial.surfaceModel === "single-layer-medium" && matchedMaterials?.get(entry.renderableIndex)?.has(submeshMaterial.materialHandle ?? 0) ? [void 0] : selectedMaterialPasses ?? [];
      for (const selectedPass of draws) {
        const vertexEntry = passKind === "temporal" ? void 0 : selectedPass?.vertexEntry;
        const fragmentEntry = passKind === "temporal" ? void 0 : fragmentEntryPoint ?? selectedPass?.fragmentEntry;
        const selectedShaderId = selectedPass === void 0 ? submeshMaterial.materialShaderId : selectedPass.materialShaderId;
        const selectedRenderState = selectedPass === void 0 ? submeshMaterial.renderState : selectedPass.renderState;
        const selectedStencil = (selectedPass === void 0 ? entry.stencilReference : selectedPass.stencilReference) ?? 0;
        if (selectedStencil !== lastStencilReference) {
          pass.setStencilReference(selectedStencil);
          lastStencilReference = selectedStencil;
        }
        if (splitLdrSprite && (selectedPass === void 0 ? submeshMaterial.transparent === true : selectedRenderState?.blend !== void 0)) {
          continue;
        }
        const materialSlot = materialSlotIndices[i]?.[matSlotIdx] ?? materialSlotIndices[i]?.[0] ?? 0;
        const processValue = globalThis.process;
        if (processValue?.env?.FORGEAX_MATERIAL_PIPELINE_DIAGNOSTICS === "1" && (submeshMaterial.materialShaderId === "forgeax::default-standard-pbr" || submeshMaterial.materialShaderId === "forgeax::pbr-skin")) {
          console.error(
            `[render-material] draw receipt: ${JSON.stringify({
              entityIndex: entry.renderableIndex,
              materialSlot,
              materialHandle: submeshMaterial.materialHandle,
              clearcoat: submeshMaterial.paramSnapshot?.clearcoat,
              shader: submeshMaterial.materialShaderId
            })}`
          );
        }
        perSubmeshBg = profilePhase === void 0 ? resolveMaterialBindGroup(
          materialSlot,
          submeshMaterial,
          entry.source.entityKey,
          entry.world ?? c.world,
          selectedShaderId
        ) : profileGeometrySegment(
          c,
          passKind,
          "material-bind-groups",
          () => resolveMaterialBindGroup(
            materialSlot,
            submeshMaterial,
            entry.source.entityKey,
            entry.world ?? c.world,
            selectedShaderId
          )
        );
        materialGroup1DynamicOffsets[0] = materialSlot * MATERIAL_PER_ENTITY_STRIDE;
        pass.setBindGroup(1, perSubmeshBg, materialGroup1DynamicOffsets, 0, 1);
        const smTopology = sm.topology;
        const smMaterialShaderId = selectedPass !== void 0 ? selectedShaderId : entry.source.skin !== void 0 ? isStandardPbrSkinMaterialShader(submeshMaterial.materialShaderId) ? submeshMaterial.materialShaderId : SKIN_MATERIAL_SHADER_ID : submeshMaterial.materialShaderId;
        const shaderArtifact = smMaterialShaderId === void 0 ? void 0 : runtime.getMaterialShaderArtifact?.(smMaterialShaderId);
        const cookedProbeBlend = shaderArtifact !== void 0 && shaderArtifact.variantSet === void 0 && requiresProbeBlendRecord(shaderArtifact);
        const probeBlendAvailable = runtime.device.caps.storageBuffer && (cookedProbeBlend || probeBlendRecordAvailable && (isStandardPbrMaterialShader(smMaterialShaderId) || submeshMaterial.surfaceModel === "single-layer-medium"));
        const isSpriteShader = smMaterialShaderId === "forgeax::sprite" || smMaterialShaderId === "forgeax::sprite-lit";
        const basePipelineRenderState = isSpriteShader ? {
          ...selectedRenderState,
          depthWriteEnabled: false,
          depthCompare: "less-equal",
          cullMode: "none",
          blend: selectedRenderState?.blend ?? SPRITE_PREMULTIPLIED_ALPHA_BLEND
        } : geometryRenderStateForTopology(smTopology, selectedRenderState);
        let pipelineRenderState = geometryRenderStateForPass(
          basePipelineRenderState,
          passKind,
          coverageOnly
        );
        if (transparentDepthWrite && passKind === "forward" && (submeshMaterial.transparent === true || selectedRenderState?.blend !== void 0)) {
          pipelineRenderState = {
            ...pipelineRenderState,
            depthWriteEnabled: authoredTransparentDepthWrite(
              submeshMaterial.transparent,
              selectedRenderState
            ),
            depthCompare: "less-equal"
          };
        }
        let smPipelineHandle;
        let materialGroup2Contract;
        let materialPipelineEntry = null;
        if (smMaterialShaderId === void 0 || smMaterialShaderId === "forgeax::default-unlit") {
          const unlitShaderId = smMaterialShaderId ?? "forgeax::default-unlit";
          const unlitProjectionVariantResult = variantSetFromVertexLayoutProjection(
            entry.mesh.layoutProjection,
            void 0
          );
          if (!unlitProjectionVariantResult.ok) {
            runtime.errorRegistry.fire(unlitProjectionVariantResult.error);
            continue;
          }
          const unlitHasColor = unlitProjectionVariantResult.value === "VERTEX_COLOR_AVAILABLE=true";
          const unlitVariantSet = standardStorageVariantSet(
            runtime.device.caps.storageBuffer,
            unlitHasColor
          );
          const unlitRsp = resolveMaterialPipeline(
            unlitShaderId,
            pipelineRenderState,
            smTopology,
            entry.mesh.indexFormat,
            unlitVariantSet,
            colorFormatOverride,
            entry.mesh.layoutProjection,
            vertexEntry,
            fragmentEntry,
            submeshMaterial.standardTextureMask
          );
          materialPipelineEntry = unlitRsp;
          smPipelineHandle = unlitRsp?.pipeline ?? (colorFormatOverride === void 0 ? selectGeometryPipeline(pipelineState, isHdrTarget, msaaActive) : null);
        } else if (smMaterialShaderId !== void 0) {
          const hasVertexColor = entry.mesh.layoutProjection.attributes.some(
            (attribute) => attribute.key === "color"
          );
          const capabilityVariantSet = standardTopologyVariantSet(
            c.standardLighting,
            runtime.device.caps.storageBuffer,
            hasVertexColor,
            probeBlendAvailable
          );
          const transmissionAvailable = requestsStandardTransmissionVariant(submeshMaterial);
          const materialCapabilityVariantSet = transmissionAvailable && !capabilityVariantSet.includes("TRANSMISSION_AVAILABLE=") ? `${capabilityVariantSet}+TRANSMISSION_AVAILABLE=true` : capabilityVariantSet;
          const variantSet = isSpriteShader ? smMaterialShaderId === "forgeax::sprite-lit" ? materialCapabilityVariantSet : entry.source.spriteInstances !== void 0 ? "" : void 0 : entry.variantSet === void 0 ? materialCapabilityVariantSet : `${materialCapabilityVariantSet}+${entry.variantSet}`;
          const cachedPipeline = resolveMaterialPipeline(
            smMaterialShaderId,
            pipelineRenderState,
            smTopology,
            entry.mesh.indexFormat,
            variantSet,
            colorFormatOverride,
            entry.mesh.layoutProjection,
            vertexEntry,
            fragmentEntry,
            submeshMaterial.standardTextureMask,
            submeshMaterial.surfaceModel === "single-layer-medium" && passKind === "forward" ? capabilityVariantSet.includes("CLUSTER_FORWARD_AVAILABLE=true") ? "surface-direct-cluster-pbr" : "surface-direct-pbr" : void 0
          );
          materialPipelineEntry = cachedPipeline;
          smPipelineHandle = cachedPipeline?.pipeline ?? null;
        } else {
          smPipelineHandle = selectGeometryPipeline(pipelineState, isHdrTarget, msaaActive);
        }
        if (smPipelineHandle === null) {
          if (diagnosticsEnabled) {
            console.error(
              `[render-material] draw skipped: ${JSON.stringify({
                entityKey: entry.source.entityKey,
                materialHandle: submeshMaterial.materialHandle,
                shader: smMaterialShaderId,
                reason: "pipeline-unavailable"
              })}`
            );
          }
          continue;
        }
        const resolvedInstanceDraws = probeBlendAvailable ? resolveGeometryInstanceBuffer(c, entry, identityInstanceDraws, true) : baseInstanceDraws;
        if (resolvedInstanceDraws === null) continue;
        const compactDrawIndex = gpuDrivenDrawIndices.get(smIdx);
        const compactDraw = compactDrawIndex === void 0 ? void 0 : entry.source.gpuDrivenDraws?.[compactDrawIndex];
        const sourceDrawItemIndex = compactDrawIndex === void 0 || compactDraw === void 0 ? smIdx : gpuDrivenSourceDrawItemIndex(compactDraw, compactDrawIndex);
        const instanceDraws = submeshMaterial.surfaceModel === "single-layer-medium" && passKind === "forward" ? resolveSurfaceDirectInstanceDraws(
          c,
          entry,
          sourceDrawItemIndex,
          resolvedInstanceDraws
        ) : resolvedInstanceDraws;
        if (instanceDraws === null) continue;
        if (!isSkinEntry) {
          materialGroup2Contract = materialPipelineEntry?.group2Contract;
          if (materialGroup2Contract === void 0) continue;
          const selectedGroup = selectMaterialGroup2(
            meshGroup2,
            meshBindGroup,
            materialGroup2Contract
          );
          if (selectedGroup === null) continue;
          group2BindGroup = selectedGroup;
        }
        if (diagnosticsEnabled && submeshMaterial.textureHandles !== void 0) {
          console.error(
            `[render-material] draw submitted: ${JSON.stringify({
              entityKey: entry.source.entityKey,
              materialHandle: submeshMaterial.materialHandle,
              shader: smMaterialShaderId,
              textureHandles: [...submeshMaterial.textureHandles.entries()].map(
                ([field, handle]) => ({
                  field,
                  handle
                })
              ),
              skin: isSkinEntry ? {
                resourcesReady: skinResources !== null,
                psoReady: skinPsoProbe !== null,
                paletteBufferReady: skinSlice?.buffer !== void 0,
                paletteByteOffset: skinSlice?.byteOffset,
                dynamicOffsets: [...group2DynamicOffsets]
              } : void 0,
              pipelineReady: true
            })}`
          );
        }
        pass.setBindGroup(2, group2BindGroup, group2DynamicOffsets);
        if (profilePhase === void 0) {
          recordOcclusionCandidate(
            () => submitSubmeshDraws(
              pass,
              bindingState,
              smPipelineHandle,
              instanceDraws,
              entry.mesh.indexed,
              sm.indexCount,
              sm.vertexCount,
              sm.indexOffset,
              (draw, command) => {
                c.onRenderableDraw?.(entry, smIdx);
                if (surfacePass === void 0 || draw.surfaceFrameBase === void 0) return;
                c.frameState.surfaceSubmissionObservation?.record(surfacePass, {
                  kind: command,
                  count: entry.mesh.indexed ? sm.indexCount : sm.vertexCount,
                  first: entry.mesh.indexed ? sm.indexOffset : 0,
                  instanceCount: draw.instanceCount,
                  firstInstance: 0,
                  surfaceFrameBase: draw.surfaceFrameBase,
                  memberIds: draw.surfaceMemberIds ?? [],
                  pipelineIdentity: getOpaqueResourceIdentity(smPipelineHandle),
                  ...materialPipelineEntry?.receipt === void 0 ? {} : {
                    receiptIdentity: materialPipelineEntry.receipt.identity,
                    receiptGeneration: materialPipelineEntry.receipt.generation
                  }
                });
              }
            )
          );
        } else {
          profileGeometrySegment(
            c,
            passKind,
            "draw-submit",
            () => recordOcclusionCandidate(
              () => submitSubmeshDraws(
                pass,
                bindingState,
                smPipelineHandle,
                instanceDraws,
                entry.mesh.indexed,
                sm.indexCount,
                sm.vertexCount,
                sm.indexOffset,
                (draw, command) => {
                  c.onRenderableDraw?.(entry, smIdx);
                  if (surfacePass === void 0 || draw.surfaceFrameBase === void 0) return;
                  c.frameState.surfaceSubmissionObservation?.record(surfacePass, {
                    kind: command,
                    count: entry.mesh.indexed ? sm.indexCount : sm.vertexCount,
                    first: entry.mesh.indexed ? sm.indexOffset : 0,
                    instanceCount: draw.instanceCount,
                    firstInstance: 0,
                    surfaceFrameBase: draw.surfaceFrameBase,
                    memberIds: draw.surfaceMemberIds ?? [],
                    pipelineIdentity: getOpaqueResourceIdentity(smPipelineHandle),
                    ...materialPipelineEntry?.receipt === void 0 ? {} : {
                      receiptIdentity: materialPipelineEntry.receipt.identity,
                      receiptGeneration: materialPipelineEntry.receipt.generation
                    }
                  });
                }
              )
            )
          );
        }
        if (diagnosticsEnabled && perSubmeshBg !== null) {
          recordIblPipelineBinding(c, submeshMaterial, smPipelineHandle, perSubmeshBg);
        }
      }
    }
  }
}
function uploadInstanceRanges(c, inst, buffer, ranges, storageBacked, sourceOffsetInstances = 0, previousInst = void 0) {
  const strideBytes = (storageBacked ? INSTANCE_STORAGE_STRIDE_FLOATS : 16) * Float32Array.BYTES_PER_ELEMENT;
  const uploadedRanges = [];
  let uploadedBytes = 0;
  for (const range of ranges) {
    const start = Math.max(0, Math.min(inst.instanceCount, range.start));
    const end = Math.max(start, Math.min(inst.instanceCount, range.end));
    if (end <= start) continue;
    const source = inst.transforms.subarray(
      (sourceOffsetInstances + start) * 16,
      (sourceOffsetInstances + end) * 16
    );
    const hasIdentityProof = inst.generations !== void 0 && previousInst?.generations !== void 0;
    const previousSource = hasIdentityProof ? previousInst?.transforms : previousInst?.transforms.subarray(
      (sourceOffsetInstances + start) * 16,
      (sourceOffsetInstances + end) * 16
    );
    const currentGenerations = inst.generations?.subarray(
      sourceOffsetInstances + start,
      sourceOffsetInstances + end
    );
    const previousGenerations = hasIdentityProof ? previousInst?.generations : previousInst?.generations?.subarray(
      sourceOffsetInstances + start,
      sourceOffsetInstances + end
    );
    const payload = storageBacked ? packInstanceStorageBuffer(source, previousSource, currentGenerations, previousGenerations) : source;
    const written = c.runtime.device.queue.writeBuffer(buffer, start * strideBytes, payload);
    if (!written.ok) {
      c.runtime.errorRegistry.fire(written.error);
      return { ok: false, ranges: uploadedRanges, bytes: uploadedBytes };
    }
    uploadedRanges.push({ start, end });
    uploadedBytes += payload.byteLength;
  }
  return { ok: true, ranges: uploadedRanges, bytes: uploadedBytes };
}
function reportInstanceResidency(c, inst, input) {
  if (inst.collectionId === void 0) return;
  c.frameState.instanceCollections?._reportResidency({
    collectionId: inst.collectionId,
    frameNumber: c.frameState.frameNumber,
    residentGeneration: c.runtime.deviceScope.generation,
    lane: input.lane,
    requestedBytes: input.requestedBytes,
    supportedBytes: input.supportedBytes,
    uploadRanges: input.uploadRanges,
    uploadedBytes: input.uploadedBytes,
    backend: c.runtime.device.caps.backendKind
  });
}
function reportInstanceFailure(c, inst, error, requestedBytes, supportedBytes) {
  if (inst.collectionId === void 0) return;
  c.frameState.instanceCollections?._reportFailure({
    collectionId: inst.collectionId,
    code: error.code,
    expected: error.expected,
    hint: error.hint,
    facts: {
      requestedBytes,
      supportedBytes,
      backend: c.runtime.device.caps.backendKind,
      owner: "renderer.instances",
      cause: error.code,
      recovery: error.hint
    }
  });
}
function clearInstanceChunksForOwner(c, ownerKey) {
  const chunks = c.frameState.instanceBufferChunks;
  if (chunks === void 0) return;
  const prefix = `${ownerKey}:`;
  for (const [key, entry] of chunks.entries()) {
    if (!key.startsWith(prefix)) continue;
    if (!entry.buffer.isDestroyed) {
      const destroyed = entry.buffer.destroy();
      if (!destroyed.ok) c.runtime.errorRegistry.fire(destroyed.error);
    }
    chunks.delete(key);
  }
}
function resolveStorageInstanceChunks(c, entry, inst, cap, probeBuffer, probeOffset) {
  const { runtime, frameState } = c;
  const strideBytes = INSTANCE_STORAGE_STRIDE_FLOATS * Float32Array.BYTES_PER_ELEMENT;
  const chunkCapacity = Math.floor(cap / strideBytes);
  if (chunkCapacity < 1) {
    reportInstanceFailure(
      c,
      inst,
      {
        code: "limit-exceeded",
        expected: `maxStorageBufferBindingSize (${cap}) >= ${strideBytes}`,
        hint: "use a backend with storage-buffer bindings large enough for one InstanceData record"
      },
      inst.instanceCount * strideBytes,
      cap
    );
    runtime.errorRegistry.fire(
      new RhiError({
        code: "limit-exceeded",
        expected: `maxStorageBufferBindingSize (${cap}) >= ${strideBytes}`,
        hint: "use a backend with storage-buffer bindings large enough for one InstanceData record",
        detail: { maxStorageBufferBindingSize: cap, requestedBytes: strideBytes }
      })
    );
    return null;
  }
  const ownerKey = instanceCollectionCacheKey(entry.source.worldId, inst);
  const chunks = frameState.instanceBufferChunks;
  const activeKeys = /* @__PURE__ */ new Set();
  const draws = [];
  const uploadedRanges = [];
  let uploadedBytes = 0;
  const dirtyRanges = inst.dirtyRanges ?? [{ start: 0, end: inst.instanceCount }];
  for (let start = 0; start < inst.instanceCount; start += chunkCapacity) {
    const end = Math.min(inst.instanceCount, start + chunkCapacity);
    const count = end - start;
    const chunkKey = `${ownerKey}:${start}`;
    activeKeys.add(chunkKey);
    const payloadBytes = count * strideBytes;
    const previous = chunks?.get(chunkKey);
    let active = previous !== void 0 && previous.uploadedArchVersion === inst.archVersion && previous.uploadedByteLength === payloadBytes ? previous : void 0;
    let activeIsNew = false;
    if (active === void 0) {
      const created = runtime.device.createBuffer({
        size: payloadBytes,
        usage: GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_DST,
        mappedAtCreation: false
      });
      if (!created.ok) {
        runtime.errorRegistry.fire(created.error);
        reportInstanceFailure(c, inst, created.error, inst.instanceCount * strideBytes, cap);
        return null;
      }
      if (previous !== void 0 && !previous.buffer.isDestroyed) {
        const destroyed = previous.buffer.destroy();
        if (!destroyed.ok) runtime.errorRegistry.fire(destroyed.error);
      }
      active = {
        buffer: new GpuBuffer(runtime.device, created.value),
        uploadedArchVersion: inst.archVersion,
        uploadedByteLength: payloadBytes
      };
      activeIsNew = true;
      chunks?.set(chunkKey, active);
      if (chunks === void 0) frameState.transientInstanceBuffers.push(active);
    }
    if (active === void 0) return null;
    const localRanges = dirtyRanges.map((range) => ({
      start: Math.max(start, range.start) - start,
      end: Math.min(end, range.end) - start
    })).filter((range) => range.end > range.start);
    const needsUpload = activeIsNew || active.uploadedRevision !== inst.revision;
    const rangesToUpload = instanceUploadRangesForResident(activeIsNew, localRanges, {
      start: 0,
      end: count
    });
    if (needsUpload && rangesToUpload.length > 0) {
      const upload = uploadInstanceRanges(
        c,
        inst,
        active.buffer.handle,
        rangesToUpload,
        true,
        start,
        entry.source.temporal?.previousInstances
      );
      for (const range of upload.ranges) {
        uploadedRanges.push({ start: range.start + start, end: range.end + start });
      }
      uploadedBytes += upload.bytes;
      if (!upload.ok) {
        reportInstanceFailure(
          c,
          inst,
          {
            code: "queue-write-buffer-failed",
            expected: "the renderer-owned instance storage buffer accepts the dirty range",
            hint: "retry after the active device is healthy or recover the renderer"
          },
          inst.instanceCount * strideBytes,
          cap
        );
        return null;
      }
    }
    if (needsUpload) {
      if (inst.revision !== void 0) {
        const published = { ...active, uploadedRevision: inst.revision };
        active = published;
        chunks?.set(chunkKey, published);
      }
    }
    const activeBuffer = active;
    draws.push({
      instanceBuffer: activeBuffer.buffer.handle,
      instanceBindGroup: resolveGeometryInstancesBindGroup(
        c,
        activeBuffer.buffer.handle,
        probeBuffer
      ),
      ...probeBuffer === void 0 ? {} : { probeBuffer },
      probeOffset,
      instanceCount: count,
      firstInstanceOrdinal: start
    });
  }
  if (chunks !== void 0) {
    const prefix = `${ownerKey}:`;
    for (const [key, stale] of chunks.entries()) {
      if (!key.startsWith(prefix) || activeKeys.has(key)) continue;
      if (!stale.buffer.isDestroyed) {
        const destroyed = stale.buffer.destroy();
        if (!destroyed.ok) runtime.errorRegistry.fire(destroyed.error);
      }
      chunks.delete(key);
    }
  }
  reportInstanceResidency(c, inst, {
    lane: "chunked-storage",
    requestedBytes: inst.instanceCount * strideBytes,
    supportedBytes: cap,
    uploadRanges: uploadedRanges,
    uploadedBytes
  });
  return draws;
}
function resolveGeometryInstanceBuffer(c, entry, identityInstanceDraws, useProbeBlend) {
  const { runtime, pipelineState, frameState } = c;
  const inst = entry.source.instances;
  if (entry.source.spriteInstances !== void 0) {
    const { buffer, count } = resolveSpriteInstancesBuffer(
      c,
      entry,
      pipelineState.identityInstanceBuffer,
      0
    );
    return count === 0 ? [] : [
      {
        instanceBuffer: buffer,
        instanceBindGroup: resolveGeometryInstancesBindGroup(c, buffer, void 0),
        probeOffset: -1,
        instanceCount: count
      }
    ];
  }
  const probeBinding = !useProbeBlend || !runtime.device.caps.storageBuffer ? void 0 : entry.source.probeBlendRecord === void 0 ? { buffer: ensureProbeBlendRecordBuffer(runtime.device, frameState, void 0), offset: 0 } : resolveProbeBlendBuffer(
    c,
    entry.source.probeBlendRecord,
    worldEntityKey(entry.source.worldId, entry.source.entityKey)
  );
  if (inst === void 0) {
    const identity = identityInstanceDraws[0];
    if (identity === void 0) return null;
    return [
      {
        ...identity,
        instanceBindGroup: resolveGeometryInstancesBindGroup(
          c,
          pipelineState.identityInstanceBuffer,
          probeBinding?.buffer
        ),
        ...probeBinding?.buffer === void 0 ? {} : { probeBuffer: probeBinding.buffer },
        probeOffset: probeBinding?.offset ?? -1
      }
    ];
  }
  if (inst.instanceCount === 0) return [];
  const entityCacheKey = instanceCollectionCacheKey(entry.source.worldId, inst);
  const revision = inst.revision;
  const dirtyRanges = inst.dirtyRanges;
  const sameRevision = (cached) => revision === void 0 ? cached.uploadedRevision === void 0 : cached.uploadedRevision === revision;
  const fullRange = [{ start: 0, end: inst.instanceCount }];
  let instanceBuffer = pipelineState.identityInstanceBuffer;
  let instanceCount = 1;
  {
    const uniformFallback = runtime.device.caps.storageBuffer === false;
    let instanceBufferUsage = GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_DST;
    if (uniformFallback && inst.instanceCount > MAX_UNIFORM_INSTANCES) {
      const ownerKey = instanceCollectionCacheKey(entry.source.worldId, inst);
      const chunks = frameState.instanceBufferChunks;
      const activeKeys = /* @__PURE__ */ new Set();
      const draws = [];
      const uniformStrideBytes = 16 * Float32Array.BYTES_PER_ELEMENT;
      const dirty = inst.dirtyRanges ?? fullRange;
      const uploadedRanges = [];
      let uploadedBytes = 0;
      for (let start = 0; start < inst.instanceCount; start += MAX_UNIFORM_INSTANCES) {
        const count = Math.min(MAX_UNIFORM_INSTANCES, inst.instanceCount - start);
        const chunkKey = `${ownerKey}:${start}`;
        activeKeys.add(chunkKey);
        const payloadBytes = count * uniformStrideBytes;
        const previous = chunks?.get(chunkKey);
        let active = previous !== void 0 && previous.uploadedArchVersion === inst.archVersion && previous.uploadedByteLength === payloadBytes ? previous : void 0;
        let activeIsNew = false;
        if (active === void 0) {
          const created = runtime.device.createBuffer({
            size: INSTANCE_UBO_FULL_ARRAY_BYTES,
            usage: GPU_BUFFER_USAGE_UNIFORM | GPU_BUFFER_USAGE_COPY_DST,
            mappedAtCreation: false
          });
          if (!created.ok) {
            runtime.errorRegistry.fire(created.error);
            reportInstanceFailure(
              c,
              inst,
              created.error,
              inst.instanceCount * uniformStrideBytes,
              MAX_UNIFORM_INSTANCES * uniformStrideBytes
            );
            return null;
          }
          if (previous !== void 0 && !previous.buffer.isDestroyed) {
            const destroyed = previous.buffer.destroy();
            if (!destroyed.ok) runtime.errorRegistry.fire(destroyed.error);
          }
          active = {
            buffer: new GpuBuffer(runtime.device, created.value),
            uploadedArchVersion: inst.archVersion,
            uploadedByteLength: payloadBytes
          };
          activeIsNew = true;
          chunks?.set(chunkKey, active);
          if (chunks === void 0) frameState.transientInstanceBuffers.push(active);
        }
        const localRanges = dirty.map((range) => ({
          start: Math.max(start, range.start) - start,
          end: Math.min(start + count, range.end) - start
        })).filter((range) => range.end > range.start);
        const needsUpload = activeIsNew || !sameRevision(active);
        const rangesToUpload = instanceUploadRangesForResident(activeIsNew, localRanges, {
          start: 0,
          end: count
        });
        if (needsUpload && rangesToUpload.length > 0) {
          const upload = uploadInstanceRanges(
            c,
            inst,
            active.buffer.handle,
            rangesToUpload,
            false,
            start,
            entry.source.temporal?.previousInstances
          );
          for (const range of upload.ranges) {
            uploadedRanges.push({ start: range.start + start, end: range.end + start });
          }
          uploadedBytes += upload.bytes;
          if (!upload.ok) {
            reportInstanceFailure(
              c,
              inst,
              {
                code: "queue-write-buffer-failed",
                expected: "the renderer-owned instance uniform buffer accepts the dirty range",
                hint: "retry after the active device is healthy or recover the renderer"
              },
              inst.instanceCount * uniformStrideBytes,
              MAX_UNIFORM_INSTANCES * uniformStrideBytes
            );
            return null;
          }
        }
        if (needsUpload) {
          const published = revision === void 0 ? active : { ...active, uploadedRevision: revision };
          active = published;
          chunks?.set(chunkKey, published);
        }
        draws.push({
          instanceBuffer: active.buffer.handle,
          instanceBindGroup: resolveGeometryInstancesBindGroup(
            c,
            active.buffer.handle,
            probeBinding?.buffer
          ),
          ...probeBinding?.buffer === void 0 ? {} : { probeBuffer: probeBinding.buffer },
          probeOffset: probeBinding?.offset ?? -1,
          instanceCount: count,
          firstInstanceOrdinal: start
        });
      }
      if (chunks !== void 0) {
        const prefix = `${ownerKey}:`;
        for (const [key, stale] of chunks.entries()) {
          if (!key.startsWith(prefix) || activeKeys.has(key)) continue;
          if (!stale.buffer.isDestroyed) {
            const destroyed = stale.buffer.destroy();
            if (!destroyed.ok) runtime.errorRegistry.fire(destroyed.error);
          }
          chunks.delete(key);
        }
      }
      reportInstanceResidency(c, inst, {
        lane: "chunked-uniform",
        requestedBytes: inst.instanceCount * uniformStrideBytes,
        supportedBytes: MAX_UNIFORM_INSTANCES * uniformStrideBytes,
        uploadRanges: uploadedRanges,
        uploadedBytes
      });
      return draws;
    }
    if (uniformFallback) {
      instanceBufferUsage = GPU_BUFFER_USAGE_UNIFORM | GPU_BUFFER_USAGE_COPY_DST;
    }
    {
      const requestedBytes = inst.instanceCount * (uniformFallback ? 16 : INSTANCE_STORAGE_STRIDE_FLOATS) * Float32Array.BYTES_PER_ELEMENT;
      const cap = runtime.device.limits.maxStorageBufferBindingSize;
      if (!uniformFallback && typeof cap === "number" && cap > 0 && requestedBytes > cap) {
        const chunked = resolveStorageInstanceChunks(
          c,
          entry,
          inst,
          cap,
          probeBinding?.buffer,
          probeBinding?.offset ?? -1
        );
        return chunked;
      } else {
        const cached = frameState.instanceBuffers.get(entityCacheKey);
        let active = null;
        let activeIsNew = false;
        if (cached !== void 0 && cached.uploadedArchVersion === inst.archVersion && cached.uploadedByteLength === requestedBytes) {
          active = cached;
        } else if (requestedBytes > 0) {
          const bufRes = runtime.device.createBuffer({
            size: uniformFallback ? INSTANCE_UBO_FULL_ARRAY_BYTES : requestedBytes,
            usage: instanceBufferUsage,
            mappedAtCreation: false
          });
          if (!bufRes.ok) {
            runtime.errorRegistry.fire(bufRes.error);
            reportInstanceFailure(c, inst, bufRes.error, requestedBytes, cap);
            return null;
          } else {
            if (cached !== void 0 && !cached.buffer.isDestroyed) {
              const r = cached.buffer.destroy();
              if (!r.ok) runtime.errorRegistry.fire(r.error);
            }
            const newBuffer = new GpuBuffer(runtime.device, bufRes.value);
            active = {
              buffer: newBuffer,
              uploadedArchVersion: inst.archVersion,
              uploadedByteLength: requestedBytes
            };
            activeIsNew = true;
            if (active !== null) {
              frameState.instanceBuffers.set(entityCacheKey, active);
            }
          }
        }
        if (active !== null) {
          const needsUpload = activeIsNew || !sameRevision(active);
          const ranges = instanceUploadRangesForResident(
            activeIsNew,
            dirtyRanges ?? fullRange,
            fullRange[0]
          );
          let uploadRanges = [];
          let uploadedBytes = 0;
          if (needsUpload && ranges.length > 0) {
            const upload = uploadInstanceRanges(
              c,
              inst,
              active.buffer.handle,
              ranges,
              !uniformFallback,
              0,
              entry.source.temporal?.previousInstances
            );
            uploadRanges = upload.ranges;
            uploadedBytes = upload.bytes;
            if (!upload.ok) {
              reportInstanceFailure(
                c,
                inst,
                {
                  code: "queue-write-buffer-failed",
                  expected: "the renderer-owned instance buffer accepts the dirty ranges",
                  hint: "retry after the active device is healthy or recover the renderer"
                },
                requestedBytes,
                uniformFallback ? MAX_UNIFORM_INSTANCES * Float32Array.BYTES_PER_ELEMENT * 16 : typeof cap === "number" ? cap : void 0
              );
              return null;
            }
          }
          if (needsUpload) {
            const published = revision === void 0 ? active : { ...active, uploadedRevision: revision };
            frameState.instanceBuffers.set(entityCacheKey, published);
            active = published;
          }
          instanceBuffer = active.buffer.handle;
          instanceCount = Math.max(1, inst.instanceCount);
          reportInstanceResidency(c, inst, {
            lane: uniformFallback ? "direct-uniform" : "direct-storage",
            requestedBytes,
            supportedBytes: uniformFallback ? MAX_UNIFORM_INSTANCES * Float32Array.BYTES_PER_ELEMENT * 16 : typeof cap === "number" ? cap : void 0,
            uploadRanges,
            uploadedBytes
          });
          clearInstanceChunksForOwner(c, entityCacheKey);
        }
      }
    }
  }
  return [
    {
      instanceBuffer,
      instanceBindGroup: resolveGeometryInstancesBindGroup(c, instanceBuffer, probeBinding?.buffer),
      ...probeBinding?.buffer === void 0 ? {} : { probeBuffer: probeBinding.buffer },
      probeOffset: probeBinding?.offset ?? -1,
      instanceCount
    }
  ];
}
function resolveSurfaceDirectInstanceDraws(c, entry, drawItemIndex, draws) {
  const resolve = c.gpuDrivenStandardPbrFrameResources?.surfaceDirectInstances;
  if (resolve === void 0) {
    c.runtime.errorRegistry.fire(
      new RhiError({
        code: "rhi-not-available",
        expected: "the prepared Surface producer publishes the direct slot-3 resource closure",
        hint: "prepare the retained Surface frame before recording direct medium draws"
      })
    );
    return null;
  }
  const resolved = [];
  for (const draw of draws) {
    const direct = resolve({
      worldId: entry.source.worldId,
      entityKey: entry.source.entityKey,
      drawItemIndex,
      instanceCount: draw.instanceCount,
      firstInstanceOrdinal: draw.firstInstanceOrdinal ?? 0,
      instanceBuffer: draw.instanceBuffer,
      ...draw.probeBuffer === void 0 ? {} : { probeBuffer: draw.probeBuffer },
      ...draw.probeOffset < 0 ? {} : {
        probeOffset: draw.probeOffset
      }
    });
    if (!direct.ok) {
      c.runtime.errorRegistry.fire(direct.error);
      return null;
    }
    resolved.push({
      ...draw,
      instanceBindGroup: direct.value.bindGroup,
      dynamicOffsets: direct.value.dynamicOffsets,
      surfaceFrameBase: direct.value.frameBase,
      surfaceMemberIds: direct.value.memberIds
    });
  }
  return resolved;
}
function resolveProbeBlendBuffer(c, record, entityKey) {
  const { runtime, frameState } = c;
  if (record === void 0) throw new Error("probe blend record is required for probe allocation");
  if (entityKey === void 0) throw new Error("probe blend record requires an entity key");
  const buffer = ensureProbeBlendRecordBuffer(runtime.device, frameState, [
    { cacheKey: entityKey, record }
  ]);
  if (buffer === void 0) throw new Error("probe blend record buffer allocation failed");
  return { buffer, offset: probeBlendRecordOffset(record.objectKey) };
}
function resolveGeometryInstancesBindGroup(c, instanceBuffer, probeBuffer) {
  const { runtime, pipelineState, frameState, bindGroupCounts } = c;
  const layout = probeBuffer === void 0 ? pipelineState.instancesBindGroupLayout : pipelineState.probeInstancesBindGroupLayout;
  if (layout === void 0) throw new Error("probe instances bind-group layout is unavailable");
  const instancesBgShared = frameState.instancesBgShared ?? /* @__PURE__ */ new WeakMap();
  return getOrCreateFromChain(
    instancesBgShared,
    probeBuffer === void 0 ? [layout, instanceBuffer] : [layout, instanceBuffer, probeBuffer],
    probeBuffer === void 0 ? "instances-no-probe" : "instances-probe",
    () => {
      const result = runtime.device.createBindGroup({
        label: "pbr-instances-bg",
        layout,
        entries: [
          {
            binding: 0,
            resource: {
              kind: "buffer",
              value: { buffer: instanceBuffer }
            }
          },
          ...probeBuffer === void 0 ? [] : [
            {
              binding: 1,
              resource: {
                kind: "buffer",
                value: { buffer: probeBuffer, offset: 0, size: PROBE_BLEND_RECORD_BYTE_SIZE }
              }
            }
          ]
        ]
      });
      if (!result.ok) throw result.error;
      return result.value;
    },
    bindGroupCounts
  );
}
function computeSplitLdrSprite(validatedOrdered, tonemapActive, dispatch) {
  if (tonemapActive) return false;
  if (dispatch !== void 0 && dispatch.length > 0) {
    return dispatch.some(
      (pass) => pass.tags.LightMode === "Forward" && pass.renderState?.blend !== void 0
    );
  }
  for (const entry of validatedOrdered) {
    if (entry === void 0) continue;
    const materials = entry.source.materials;
    if (materials !== void 0) {
      if (materials.some((material) => material.transparent === true)) return true;
    } else if (entry.source.material.transparent === true) {
      return true;
    }
  }
  return false;
}
function recordSpritePass(c, pass, matchedIndices, materialSlotIndices, sampleCount, resolveMaterialBindGroup, graphPass, selectedDispatch) {
  const {
    runtime,
    pipelineState,
    encoder,
    msaaActive,
    ldrSpritePassView,
    ldrSpriteColorView,
    geometryDepthView,
    viewBindGroup,
    meshBindGroup,
    hdrpClusterBindGroup,
    viewBindGroupDynamicOffset = 0,
    splitLdrSprite
  } = c;
  const clusteredLighting = c.standardLighting?.kind === "clustered";
  const meshGroup2 = clusteredLighting ? hdrpClusterBindGroup : meshBindGroup;
  const spriteIsHdr = c.tonemapActive || transparentPassColorFormat(c, pipelineState) === "rgba16float";
  let geometryPassEnded = false;
  if (splitLdrSprite && (graphPass !== void 0 || ldrSpritePassView !== null)) {
    if (graphPass === void 0) {
      pass.end();
      geometryPassEnded = true;
    }
    const spriteColorView = msaaActive ? ldrSpriteColorView : ldrSpritePassView;
    const spritePass = graphPass ?? encoder.beginRenderPass(
      buildBeginRenderPassDescriptor(
        {
          // SSOT for the sprite-pass color format is the resolved transparent
          // attachment. Native linear-LDR frames use graph-owned `ldrColor`
          // (possibly rgba16float); swap-chain fallback frames use their raw
          // storage format. WebGPU requires the attachment format and PSO
          // target to match, so both are resolved by the same helper.
          colorFormats: [transparentPassColorFormat(c)],
          depthFormat: "depth24plus-stencil8"},
        {
          colorViews: [spriteColorView],
          depthView: geometryDepthView,
          ...msaaActive ? { resolveTargets: [ldrSpritePassView] } : {}
        },
        "forward",
        { colorLoadOp: "load", depthLoadOp: "load" }
      )
    );
    spritePass.setBindGroup(0, viewBindGroup, [viewBindGroupDynamicOffset, 0]);
    const spritePremulBlend = {
      depthWriteEnabled: false,
      depthCompare: "less-equal",
      cullMode: "none",
      blend: SPRITE_PREMULTIPLIED_ALPHA_BLEND
    };
    const spritePH = runtime.getMaterialShaderPipeline?.(
      "forgeax::sprite",
      spriteIsHdr,
      spritePremulBlend,
      "triangle-list",
      void 0,
      void 0,
      "forward",
      void 0,
      msaaActive ? 4 : 1,
      // feat-20260625-refactor-sprite-as-transparent-mesh R2 fix-up:
      // the split sub-pass PSO must use the same attachment format as the
      // encoder. Native linear-LDR frames resolve graph-owned `ldrColor`
      // (possibly rgba16float); swap-chain fallback frames resolve their raw
      // storage format. `transparentPassColorFormat` is the single owner for
      // this format so lazy PSO construction cannot fall back to the geometry
      // sRGB view.
      transparentPassColorFormat(c, pipelineState)
    ) ?? null;
    const spritePH_withRegion = runtime.getMaterialShaderPipeline?.(
      "forgeax::sprite",
      spriteIsHdr,
      spritePremulBlend,
      "triangle-list",
      void 0,
      SPRITE_PASS_PER_INSTANCE_REGION_VARIANT_SET,
      "forward",
      void 0,
      msaaActive ? 4 : 1,
      transparentPassColorFormat(c)
    ) ?? null;
    let spriteUnavailableReported = false;
    const reportSpriteUnavailable = () => {
      if (spriteUnavailableReported) return;
      spriteUnavailableReported = true;
      runtime.errorRegistry.fire(
        new RhiError({
          code: "shader-compile-failed",
          expected: "manifest entries include sprite.wgsl + the engine triple (pbr + unlit + tonemap)",
          hint: "verify @forgeax/engine-vite-plugin-shader emits manifest.json with the 4 engine entries (sprite.wgsl is required when spawning sprite materials); check vite plugin engineEntries option"
        })
      );
    };
    const spriteLitPH = runtime.getMaterialShaderPipeline?.(
      "forgeax::sprite-lit",
      spriteIsHdr,
      spritePremulBlend,
      "triangle-list",
      void 0,
      // sprite-lit declares the same Standard capability axes as PBR. The
      // boot artifact is intentionally the direct compatibility variant,
      // so a clustered frame must request its explicit Cluster artifact;
      // otherwise the host binds the unified group(2) while the shader
      // still reads the now-cleared direct-light headers.
      standardTopologyVariantSet(c.standardLighting, runtime.device.caps.storageBuffer, false),
      "forward",
      void 0,
      msaaActive ? 4 : 1,
      transparentPassColorFormat(c)
    ) ?? null;
    recordSpriteEntityDraws(
      c,
      spritePass,
      matchedIndices,
      resolveMaterialBindGroup,
      spritePH,
      spritePH_withRegion,
      spriteLitPH,
      reportSpriteUnavailable
    );
    recordSpriteTransparentPbrDraws(
      c,
      spritePass,
      matchedIndices,
      materialSlotIndices,
      sampleCount,
      resolveMaterialBindGroup,
      meshGroup2,
      selectedDispatch
    );
    if (graphPass === void 0) spritePass.end();
  }
  return geometryPassEnded;
}
function recordSpriteTransparentPbrDraws(c, pass, matchedIndices, materialSlotIndices, sampleCount, resolveMaterialBindGroup, meshGroup2, selectedDispatch) {
  const isSprite = (shader) => shader === "forgeax::sprite" || shader === "forgeax::sprite-lit";
  const passes = selectedDispatch?.filter(
    (entry) => entry.renderState?.blend !== void 0 && !isSprite(entry.materialShaderId) && (matchedIndices === null || matchedIndices.has(entry.renderableIndex))
  );
  const matched = /* @__PURE__ */ new Map();
  const add = (index, handle) => {
    let handles = matched.get(index);
    if (handles === void 0) {
      handles = /* @__PURE__ */ new Set();
      matched.set(index, handles);
    }
    handles.add(handle);
  };
  if (passes !== void 0) {
    for (const entry of passes) add(entry.renderableIndex, entry.materialHandle);
  } else {
    for (const entry of c.validatedOrdered) {
      if (matchedIndices !== null && !matchedIndices.has(entry.renderableIndex)) continue;
      if (isSprite(entry.source.material.materialShaderId)) continue;
      for (const material of entry.source.materials) {
        if (material.transparent === true) add(entry.renderableIndex, material.materialHandle ?? 0);
      }
    }
  }
  recordGeometryDraws(
    {
      ...c,
      splitLdrSprite: false,
      transparentColorFormat: transparentPassColorFormat(c)
    },
    pass,
    matched,
    materialSlotIndices,
    sampleCount,
    meshGroup2,
    c.meshBindGroup,
    resolveMaterialBindGroup,
    "forward",
    passes
  );
}
function recordSpriteEntityDraws(c, spritePass, matchedIndices, resolveMaterialBindGroup, spritePH, spritePH_withRegion, spriteLitPH, reportSpriteUnavailable) {
  const {
    runtime,
    world,
    pipelineState,
    frameState,
    validatedOrdered,
    meshBindGroup,
    foldDispatchPlan,
    materialSlotIndices
  } = c;
  let lastSpritePipelineHandle = null;
  let lastSpriteVertexBuffer = null;
  let lastSpriteIndexBuffer = null;
  for (let i = 0; i < validatedOrdered.length; i++) {
    const spriteEntry = validatedOrdered[i];
    if (spriteEntry === void 0 || spriteEntry.source.material.transparent !== true) continue;
    {
      const sid = spriteEntry.source.material.materialShaderId;
      const isSpriteShader = sid === "forgeax::sprite" || sid === "forgeax::sprite-lit";
      if (!isSpriteShader) continue;
    }
    if (foldDispatchPlan?.skipIndices.has(i) === true) {
      continue;
    }
    const foldHeadBucket = foldDispatchPlan?.headBuckets.get(i);
    if (matchedIndices !== null && !matchedIndices.has(spriteEntry.renderableIndex)) {
      continue;
    }
    const entityShaderId = spriteEntry.source.material.materialShaderId;
    const useRegionVariant = entityShaderId !== "forgeax::sprite-lit" && spriteEntry.source.spriteInstances !== void 0;
    const activeSpritePH = entityShaderId === "forgeax::sprite-lit" ? spriteLitPH : useRegionVariant ? spritePH_withRegion : spritePH;
    if (activeSpritePH === null) {
      if (entityShaderId === "forgeax::sprite") {
        reportSpriteUnavailable();
      } else if (entityShaderId === "forgeax::sprite-lit") {
        runtime.errorRegistry.fire(
          new RhiError({
            code: "shader-compile-failed",
            expected: "manifest entries include sprite.wgsl + sprite-lit.wgsl (when sprite-lit materials are used) + the engine triple (pbr + unlit + tonemap)",
            hint: "verify @forgeax/engine-vite-plugin-shader emits manifest.json with sprite.wgsl AND sprite-lit.wgsl entries; check vite plugin engineEntries option"
          })
        );
      }
      continue;
    }
    if (lastSpritePipelineHandle !== activeSpritePH) {
      spritePass.setPipeline(activeSpritePH);
      lastSpritePipelineHandle = activeSpritePH;
    }
    if (spriteEntry.mesh.vertexBuffer !== lastSpriteVertexBuffer) {
      spritePass.setVertexBuffer(0, spriteEntry.mesh.vertexBuffer.handle);
      lastSpriteVertexBuffer = spriteEntry.mesh.vertexBuffer;
    }
    const indexBuffer = spriteEntry.mesh.indexBuffer;
    if (indexBuffer !== null && indexBuffer !== lastSpriteIndexBuffer) {
      spritePass.setIndexBuffer(indexBuffer.handle, spriteEntry.mesh.indexFormat);
      lastSpriteIndexBuffer = indexBuffer;
    }
    let spriteInstanceBuffer = pipelineState.identityInstanceBuffer;
    let spriteInstanceCount = 1;
    const spriteInst = spriteEntry.source.instances;
    const useFold = foldHeadBucket !== void 0 && spriteInst === void 0;
    if (useFold && foldHeadBucket !== void 0) {
      const buffer = resolveFoldInstanceBuffer(c, foldHeadBucket, i);
      if (buffer === null) continue;
      spriteInstanceBuffer = buffer;
      spriteInstanceCount = foldHeadBucket.bucketSize;
    } else if (spriteInst !== void 0) {
      const uniformFallback = runtime.device.caps.storageBuffer === false;
      let spriteBufUsage = GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_DST;
      if (uniformFallback) {
        if (spriteInst.instanceCount > MAX_UNIFORM_INSTANCES) {
          runtime.errorRegistry.fire(
            new RhiError({
              code: "limit-exceeded",
              expected: `instance count <= ${MAX_UNIFORM_INSTANCES} (uniform fallback cap)`,
              hint: `reduce instance count to ${MAX_UNIFORM_INSTANCES} or use a WebGPU-capable backend`,
              detail: {
                maxStorageBufferBindingSize: MAX_UNIFORM_INSTANCES * 64,
                requestedBytes: spriteInst.instanceCount * 64
              }
            })
          );
          spriteInstanceCount = spriteInst.instanceCount;
          spriteInstanceBuffer = pipelineState.identityInstanceBuffer;
          const spriteInstBg = resolveGeometryInstancesBindGroup(
            c,
            spriteInstanceBuffer,
            void 0
          );
          spritePass.setBindGroup(3, spriteInstBg);
          spritePass.drawIndexed(spriteEntry.mesh.indexCount, spriteInstanceCount, 0, 0, 0);
          c.onRenderableDraw?.(spriteEntry, 0);
          continue;
        }
        spriteBufUsage = GPU_BUFFER_USAGE_UNIFORM | GPU_BUFFER_USAGE_COPY_DST;
      }
      {
        const instancePayload = uniformFallback ? spriteInst.transforms : packInstanceStorageBuffer(
          spriteInst.transforms,
          spriteEntry.source.temporal?.previousInstances?.transforms,
          spriteInst.generations,
          spriteEntry.source.temporal?.previousInstances?.generations
        );
        const requestedBytes = instancePayload.byteLength;
        const cap = runtime.device.limits.maxStorageBufferBindingSize;
        if (typeof cap === "number" && requestedBytes > cap) {
          runtime.errorRegistry.fire(
            new RhiError({
              code: "limit-exceeded",
              expected: `requestedBytes (${requestedBytes}) <= maxStorageBufferBindingSize (${cap})`,
              hint: "reduce the sprite batch to fit within device.limits.maxStorageBufferBindingSize or use a storage-capable backend",
              detail: {
                maxStorageBufferBindingSize: cap,
                requestedBytes
              }
            })
          );
        } else {
          const cachedSprite = frameState.instanceBuffers.get(
            worldEntityKey(spriteEntry.source.worldId, spriteInst.cacheKey)
          );
          let activeSprite = null;
          if (cachedSprite !== void 0 && cachedSprite.uploadedArchVersion === spriteInst.archVersion && cachedSprite.uploadedByteLength === requestedBytes) {
            activeSprite = cachedSprite;
          } else if (requestedBytes > 0) {
            const bufRes = runtime.device.createBuffer({
              size: requestedBytes,
              usage: spriteBufUsage,
              mappedAtCreation: false
            });
            if (!bufRes.ok) {
              runtime.errorRegistry.fire(bufRes.error);
            } else {
              if (cachedSprite !== void 0 && !cachedSprite.buffer.isDestroyed) {
                const r = cachedSprite.buffer.destroy();
                if (!r.ok) runtime.errorRegistry.fire(r.error);
              }
              const newBuf = new GpuBuffer(runtime.device, bufRes.value);
              activeSprite = {
                buffer: newBuf,
                uploadedArchVersion: spriteInst.archVersion,
                uploadedByteLength: requestedBytes
              };
              frameState.instanceBuffers.set(
                worldEntityKey(spriteEntry.source.worldId, spriteInst.cacheKey),
                activeSprite
              );
            }
          }
          if (activeSprite !== null) {
            const writeRes = runtime.device.queue.writeBuffer(
              activeSprite.buffer.handle,
              0,
              instancePayload
            );
            if (!writeRes.ok) {
              runtime.errorRegistry.fire(writeRes.error);
            } else {
              spriteInstanceBuffer = activeSprite.buffer.handle;
              spriteInstanceCount = Math.max(1, spriteInst.instanceCount);
            }
          }
        }
      }
    }
    const _si = resolveSpriteInstancesBuffer(
      c,
      spriteEntry,
      spriteInstanceBuffer,
      spriteInstanceCount
    );
    spriteInstanceBuffer = _si.buffer;
    spriteInstanceCount = _si.count;
    const spriteGroup2 = entityShaderId === "forgeax::sprite-lit" && c.standardLighting?.kind === "clustered" ? c.hdrpClusterBindGroup : meshBindGroup;
    const spriteInstancesBg = resolveGeometryInstancesBindGroup(c, spriteInstanceBuffer, void 0);
    spritePass.setBindGroup(2, spriteGroup2, [i * MESH_PER_ENTITY_STRIDE]);
    const materialSlot = materialSlotIndices[i]?.[0] ?? 0;
    const spritePassBg = resolveMaterialBindGroup(
      materialSlot,
      spriteEntry.source.material,
      spriteEntry.source.entityKey,
      spriteEntry.world ?? world
    );
    spritePass.setBindGroup(1, spritePassBg, [materialSlot * MATERIAL_PER_ENTITY_STRIDE]);
    spritePass.setBindGroup(3, spriteInstancesBg);
    spritePass.drawIndexed(spriteEntry.mesh.indexCount, spriteInstanceCount, 0, 0, 0);
    c.onRenderableDraw?.(spriteEntry, 0);
  }
}
function transparentPassColorFormat(c, pipelineState = c.pipelineState) {
  if (c.transparentColorFormat !== void 0) return c.transparentColorFormat;
  if (!c.runtime.device.caps.storageBuffer) return pipelineState.colorAttachmentFormat;
  return pipelineState.format;
}
var TYPE_LAYOUT = {
  u32: { size: 4, alignment: 4 },
  i32: { size: 4, alignment: 4 },
  f32: { size: 4, alignment: 4 },
  "vec3<f32>": { size: 12, alignment: 16 },
  "vec4<f32>": { size: 16, alignment: 16 },
  "mat4x4<f32>": { size: 64, alignment: 16 }
};
function align(value, alignment) {
  return Math.ceil(value / alignment) * alignment;
}
function deriveGpuSceneTableLayout(schema) {
  let cursor = 0;
  let tableAlignment = 4;
  const fields = schema.fields.map((field) => {
    const typeLayout = TYPE_LAYOUT[field.type];
    cursor = align(cursor, typeLayout.alignment);
    tableAlignment = Math.max(tableAlignment, typeLayout.alignment);
    const layout = { ...field, offset: cursor, ...typeLayout };
    cursor += typeLayout.size;
    return layout;
  });
  return { name: schema.name, stride: align(cursor, tableAlignment), fields };
}
function gpuSceneFieldOffset(layout, name) {
  const field = layout.fields.find((candidate) => candidate.name === name);
  if (field === void 0) throw new RangeError(`${layout.name} has no field named ${name}`);
  return field.offset;
}
function gpuSceneWgsl(layout) {
  const fields = layout.fields.map((field) => `  ${field.name}: ${field.type},`).join("\n");
  return `struct ${layout.name} {
${fields}
};`;
}
function gpuSceneTypeForNumeric(type) {
  switch (type) {
    case "f32":
      return "f32";
    case "i32":
      return "i32";
    case "u32":
      return "u32";
    case "vec3":
      return "vec3<f32>";
    case "vec4":
    case "color":
      return "vec4<f32>";
    case "vec2":
      throw new Error("Standard PBR GPU Scene material ABI does not admit vec2 fields");
  }
}
function deriveStandardMaterialFields() {
  const derived = derive(STANDARD_PIPELINE_PARAM_SCHEMA);
  const fields = [
    ...derived.numericMembers.map((member) => ({
      offset: member.offset,
      field: { name: member.name, type: gpuSceneTypeForNumeric(member.type) }
    })),
    ...derived.coordinateRecords.flatMap((record) => [
      {
        offset: record.offset,
        field: { name: record.transformMember, type: "vec4<f32>" }
      },
      {
        offset: record.offset + 16,
        field: { name: record.metadataMember, type: "vec4<f32>" }
      }
    ])
  ];
  fields.sort((left, right) => left.offset - right.offset);
  return [
    ...fields.map(({ field }) => field),
    ...Array.from(
      { length: (GPU_DRIVEN_MATERIAL_ROW_BYTES - derived.totalBytes) / 16 },
      (_, index) => ({ name: `_gpuDrivenPadding${index}`, type: "vec4<f32>" })
    )
  ];
}
var GPU_SCENE_SCHEMAS = Object.freeze({
  lod: {
    name: "GpuSceneLod",
    fields: [
      { name: "generation", type: "u32" },
      { name: "level", type: "u32" },
      { name: "firstIndex", type: "u32" },
      { name: "indexCount", type: "u32" },
      { name: "baseVertex", type: "i32" },
      { name: "screenCoverage", type: "f32" },
      { name: "hysteresis", type: "f32" },
      { name: "ready", type: "u32" }
    ]
  },
  primitive: {
    name: "GpuScenePrimitive",
    fields: [
      { name: "generation", type: "u32" },
      { name: "flags", type: "u32" },
      { name: "transformIndex", type: "u32" },
      { name: "materialIndex", type: "u32" },
      { name: "drawTemplateIndex", type: "u32" },
      { name: "instanceStart", type: "u32" },
      { name: "instanceCount", type: "u32" },
      { name: "assetHandle", type: "u32" },
      { name: "localBoundsMin", type: "vec4<f32>" },
      { name: "localBoundsMax", type: "vec4<f32>" }
    ]
  },
  instance: {
    name: "GpuSceneInstance",
    fields: [
      { name: "primitiveIndex", type: "u32" },
      { name: "transformIndex", type: "u32" },
      { name: "customDataStart", type: "u32" },
      { name: "flags", type: "u32" }
    ]
  },
  transform: {
    name: "GpuSceneTransform",
    fields: [
      { name: "currentWorld", type: "mat4x4<f32>" },
      { name: "previousWorld", type: "mat4x4<f32>" }
    ]
  },
  drawTemplate: {
    name: "GpuSceneDrawTemplate",
    fields: [
      { name: "pipelineClass", type: "u32" },
      { name: "materialIndex", type: "u32" },
      { name: "firstIndex", type: "u32" },
      { name: "indexCount", type: "u32" },
      { name: "baseVertex", type: "i32" },
      { name: "firstInstance", type: "u32" },
      { name: "passFlags", type: "u32" },
      { name: "reserved", type: "u32" }
    ]
  },
  material: {
    name: "GpuSceneMaterial",
    fields: deriveStandardMaterialFields()
  }
});
var GPU_SCENE_LAYOUTS = Object.freeze(
  Object.fromEntries(
    Object.entries(GPU_SCENE_SCHEMAS).map(([name, schema]) => [
      name,
      deriveGpuSceneTableLayout(schema)
    ])
  )
);
Object.values(GPU_SCENE_LAYOUTS).map(gpuSceneWgsl).join("\n\n");

// src/scene/visibility/lod-selector.ts
function projectedHeight(input) {
  if (!Number.isFinite(input.radius) || input.radius <= 0 || !Number.isFinite(input.depth)) {
    return Number.NaN;
  }
  if (input.projection === "perspective") {
    if (!Number.isFinite(input.fov) || (input.fov ?? 0) <= 0 || input.depth <= 0) return Number.NaN;
    return 2 * input.radius / (input.depth * Math.tan((input.fov ?? 0) / 2));
  }
  if (!Number.isFinite(input.orthoHeight) || (input.orthoHeight ?? 0) <= 0) return Number.NaN;
  return 2 * input.radius / (input.orthoHeight ?? 0);
}
function rawLevel(levels, height) {
  for (let index = 0; index < levels.length; index += 1) {
    const threshold = levels[index]?.screenCoverage;
    if (threshold !== void 0 && height >= threshold) return index;
  }
  return levels.length;
}
function hysteresisLevel(input, raw) {
  if (!input.historyValid || input.previousLevel < 0 || input.previousLevel > input.levels.length) {
    return raw;
  }
  const previous = input.previousLevel;
  if (raw === previous) return previous;
  const clampedHysteresis = Math.min(Math.max(input.hysteresis, 0), 0.99);
  const thresholdIndex = raw > previous ? Math.min(previous, input.levels.length - 1) : Math.min(previous, input.levels.length) - 1;
  const threshold = thresholdIndex < 0 ? input.levels[0]?.screenCoverage : input.levels[thresholdIndex]?.screenCoverage;
  if (threshold === void 0 || !Number.isFinite(threshold)) return raw;
  const height = input.projectedHeight;
  if (raw > previous && height >= threshold * (1 - clampedHysteresis)) return previous;
  if (raw < previous && height < threshold * (1 + clampedHysteresis)) return previous;
  return raw;
}
function selectLod(input) {
  const root = 0;
  if (!Number.isFinite(input.projectedHeight) || input.projectedHeight <= 0) {
    return { level: root, confidence: 1 };
  }
  const raw = rawLevel(input.levels, input.projectedHeight);
  const selected = Math.max(root, Math.min(input.levels.length, hysteresisLevel(input, raw)));
  if (input.ready[selected] === true) return { level: selected, confidence: 1 };
  for (let level = selected - 1; level >= root; level -= 1) {
    if (input.ready[level] === true) return { level, confidence: 1 };
  }
  return { level: root, confidence: 1 };
}

// src/gpu-driven/batch-topology.ts
var GPU_DRIVEN_SKIN_FLAG = 2147483648;
function inspectResourceClassSplits(plan) {
  const groups = /* @__PURE__ */ new Map();
  for (const batch of plan.batches) {
    const resourceIdentity = batch.key.resourceIdentity ?? batch.key.materialResourceClass;
    const group = groups.get(resourceIdentity) ?? { batchIds: [], candidateCount: 0 };
    group.batchIds.push(batch.batchId);
    group.candidateCount += batch.candidates.length;
    groups.set(resourceIdentity, group);
  }
  const resourceClassSplits = [...groups.entries()].sort(([left], [right]) => left.localeCompare(right)).map(
    ([resourceIdentity, group]) => Object.freeze({
      resourceIdentity,
      batchIds: Object.freeze([...group.batchIds].sort((left, right) => left - right)),
      candidateCount: group.candidateCount
    })
  );
  const resourceClassSplitReasons = resourceClassSplits.length <= 1 ? [] : resourceClassSplits.map(({ resourceIdentity }) => `resource-class:${resourceIdentity}`);
  return Object.freeze({
    resourceClassCount: resourceClassSplits.length,
    resourceClassSplits: Object.freeze(resourceClassSplits),
    resourceClassSplitReasons: Object.freeze(resourceClassSplitReasons)
  });
}
var submissionCandidateMembershipCache = /* @__PURE__ */ new WeakMap();
function buildSubmissionCandidateMembership(source) {
  const cached = submissionCandidateMembershipCache.get(source);
  if (cached !== void 0) return cached;
  const mutable = /* @__PURE__ */ new Map();
  for (const batch of source.batches) {
    for (const candidate of batch.candidates) {
      const entries = mutable.get(candidate.primitiveIndex) ?? [];
      entries.push({ batchId: batch.batchId, candidate });
      mutable.set(candidate.primitiveIndex, entries);
    }
  }
  const byPrimitiveIndex = /* @__PURE__ */ new Map();
  for (const [primitiveIndex, entries] of mutable) {
    byPrimitiveIndex.set(primitiveIndex, Object.freeze(entries));
  }
  const membership = {
    source,
    byPrimitiveIndex
  };
  submissionCandidateMembershipCache.set(source, membership);
  return membership;
}
function buildBatchAlignedSubmission(source, candidatesByBatch) {
  let visibleBase = 0;
  const batches = [];
  for (const sourceBatch of source.batches) {
    const candidates = candidatesByBatch.get(sourceBatch.batchId) ?? [];
    if (candidates.length === 0) continue;
    visibleBase = alignInstanceBase(visibleBase);
    batches.push(
      Object.freeze({
        ...sourceBatch,
        candidates: Object.freeze([...candidates]),
        visibleBase,
        visibleCapacity: candidates.length
      })
    );
    visibleBase += candidates.length;
  }
  return Object.freeze({
    revision: source.revision,
    payloadRevision: source.payloadRevision,
    batches: Object.freeze(batches),
    candidateCount: batches.reduce((total, batch) => total + batch.candidates.length, 0),
    visibleCapacity: visibleBase
  });
}
function hasActiveAlphaMask(material, prepared) {
  const { cutoff, source } = prepared.alphaMask;
  if (cutoff.length === 0 || source.length === 0) return false;
  if (prepared.identity.material === "forgeax::default-standard-pbr" || prepared.identity.material === "forgeax::pbr-skin" || prepared.identity.material === "forgeax::default-standard-pbr-skin") {
    const value = material.paramSnapshot?.[cutoff];
    return typeof value === "number" && value > 0;
  }
  return true;
}
function eligibleDraws(slot) {
  const snapshot = slot.snapshot;
  const draws = snapshot.gpuDrivenDraws;
  if (draws === void 0 || draws.length === 0 || snapshot.instances?.instanceCount === 0 || snapshot.localAabb === void 0 || snapshot.morph !== void 0 || snapshot.spriteInstances !== void 0) {
    return [];
  }
  const result = [];
  for (let compactIndex = 0; compactIndex < draws.length; compactIndex += 1) {
    const draw = draws[compactIndex];
    if (draw === void 0) continue;
    const drawItemIndex = gpuDrivenSourceDrawItemIndex(draw, compactIndex);
    const prepared = draw.prepared;
    const material = snapshot.materials[draw.materialSlot] ?? snapshot.material;
    if (prepared !== void 0) {
      const materialIdentityMatches = material.materialShaderId === void 0 || prepared.identity.material === material.materialShaderId;
      const isAlphaBlend = material.transparent === true || material.renderState?.blend !== void 0;
      const cpuOnlyMaterialResources = (material.textureSources?.size ?? 0) > 0 || (material.videoTextureFields?.size ?? 0) > 0;
      const skinReady = prepared.identity.deformation !== "skin" || snapshot.skin?.storageOrUniform === "storage" && snapshot.skin.customDataStart >= 0 && Number.isInteger(snapshot.skin.customDataStart) && hasFiniteOrderedBounds(snapshot.skin.bounds) && prepared.skinPaletteAddress !== void 0;
      if (!materialIdentityMatches || isAlphaBlend || cpuOnlyMaterialResources || prepared.identity.deformation !== "rigid" && prepared.identity.deformation !== "skin" || !skinReady)
        continue;
      const preparedIdentity = [
        prepared.identity.material,
        prepared.identity.geometry,
        prepared.identity.deformation,
        ...prepared.receiptIdentity === void 0 ? [] : [prepared.receiptIdentity]
      ].join("|");
      const admission = hasActiveAlphaMask(material, prepared) ? "alpha-mask" : "opaque";
      result.push({
        sourceDrawIndex: drawItemIndex,
        key: {
          assetHandle: snapshot.assetHandle,
          drawKind: draw.kind,
          first: prepared.first,
          count: prepared.count,
          baseVertex: prepared.baseVertex,
          materialSlot: draw.materialSlot,
          topology: prepared.topology,
          pipelineClass: preparedIdentity,
          materialResourceClass: draw.materialResourceClass,
          preparedIdentity,
          resourceIdentity: draw.materialResourceClass,
          admission,
          materialPass: material.deferredPass === true ? "deferred" : "forward-only"
        },
        prepared,
        ...candidatePayload(draw, snapshot)
      });
      continue;
    }
    result.push({
      sourceDrawIndex: drawItemIndex,
      key: {
        assetHandle: snapshot.assetHandle,
        drawKind: draw.kind,
        first: draw.first,
        count: draw.count,
        baseVertex: draw.baseVertex,
        materialSlot: draw.materialSlot,
        topology: draw.topology,
        pipelineClass: draw.pipelineClass,
        materialResourceClass: draw.materialResourceClass
      },
      ...candidatePayload(draw, snapshot)
    });
  }
  return result;
}
function candidatePayload(draw, snapshot) {
  const lodCoverages = snapshot.lods === void 0 ? void 0 : [1, ...snapshot.lods.map((lod) => lod.screenCoverage)];
  const lodRanges = draw.lodRanges;
  const lodHysteresis = snapshot.lodHysteresis;
  const payloadRevision = JSON.stringify({
    projectedHeight: draw.projectedHeight,
    lodCoverages,
    lodHysteresis,
    lodRanges,
    prepared: draw.prepared
  });
  return {
    ...draw.projectedHeight === void 0 ? {} : { projectedHeight: draw.projectedHeight },
    ...lodCoverages === void 0 ? {} : { lodCoverages },
    ...lodHysteresis === void 0 ? {} : { lodHysteresis },
    ...lodRanges === void 0 ? {} : { lodRanges },
    payloadRevision
  };
}
function hasFiniteOrderedBounds(bounds) {
  if (bounds === void 0 || bounds.length < 6) return false;
  const minX = bounds[0];
  const minY = bounds[1];
  const minZ = bounds[2];
  const maxX = bounds[3];
  const maxY = bounds[4];
  const maxZ = bounds[5];
  return minX !== void 0 && minY !== void 0 && minZ !== void 0 && maxX !== void 0 && maxY !== void 0 && maxZ !== void 0 && Number.isFinite(minX) && Number.isFinite(minY) && Number.isFinite(minZ) && Number.isFinite(maxX) && Number.isFinite(maxY) && Number.isFinite(maxZ) && minX <= maxX && minY <= maxY && minZ <= maxZ;
}
function keyText(key) {
  return JSON.stringify(key);
}
function candidateBatchText(key, primitiveIndex, drawItemIndex, instanceOrdinal, hasLod) {
  return hasLod ? `${keyText(key)}|lod:${primitiveIndex}:${drawItemIndex}:${instanceOrdinal}` : keyText(key);
}
function drawBatchText(key, primitiveIndex, drawItemIndex, hasLod) {
  return hasLod ? `${keyText(key)}|lod:${primitiveIndex}:${drawItemIndex}` : keyText(key);
}
function membershipProjection(slot, draws = eligibleDraws(slot)) {
  const instanceCount = slot.snapshot.instances?.instanceCount ?? 1;
  const hasLod = (slot.snapshot.lods?.length ?? 0) > 0;
  return {
    instanceCount,
    hasLod,
    draws: draws.map((draw) => ({
      sourceDrawIndex: draw.sourceDrawIndex,
      key: draw.key,
      batchText: drawBatchText(draw.key, slot.slot, draw.sourceDrawIndex, hasLod),
      candidateKeyPrefix: `${slot.slot}:${draw.sourceDrawIndex}:`,
      payloadRevision: draw.payloadRevision
    }))
  };
}
function alignInstanceBase(value) {
  return Math.ceil(value / 64) * 64;
}
function projectedHeightForCandidate(slot, camera) {
  const aabb = slot.snapshot.localAabb;
  if (aabb === void 0 || aabb.length < 6) return Number.NaN;
  const halfX = Math.abs((aabb[3] ?? 0) - (aabb[0] ?? 0)) * 0.5;
  const halfY = Math.abs((aabb[4] ?? 0) - (aabb[1] ?? 0)) * 0.5;
  const halfZ = Math.abs((aabb[5] ?? 0) - (aabb[2] ?? 0)) * 0.5;
  const world = slot.snapshot.transform.world;
  const worldHalfX = Math.abs(world[0] ?? 0) * halfX + Math.abs(world[4] ?? 0) * halfY + Math.abs(world[8] ?? 0) * halfZ;
  const worldHalfY = Math.abs(world[1] ?? 0) * halfX + Math.abs(world[5] ?? 0) * halfY + Math.abs(world[9] ?? 0) * halfZ;
  const worldHalfZ = Math.abs(world[2] ?? 0) * halfX + Math.abs(world[6] ?? 0) * halfY + Math.abs(world[10] ?? 0) * halfZ;
  const radius = Math.hypot(worldHalfX, worldHalfY, worldHalfZ);
  const dx = (world[12] ?? 0) - (camera.position[0] ?? 0);
  const dy = (world[13] ?? 0) - (camera.position[1] ?? 0);
  const dz = (world[14] ?? 0) - (camera.position[2] ?? 0);
  return projectedHeight({
    radius,
    depth: Math.hypot(dx, dy, dz),
    projection: camera.projection,
    fov: camera.fov,
    orthoHeight: Math.abs(camera.orthoTop - camera.orthoBottom)
  });
}
var BatchTopology = class {
  batches = /* @__PURE__ */ new Map();
  membershipByPrimitive = /* @__PURE__ */ new Map();
  ineligiblePrimitives = /* @__PURE__ */ new Set();
  generationByBatchId = [];
  freeBatchIds = [];
  revision = 0;
  payloadRevision = 0;
  rebuilds = 0;
  patches = 0;
  payloadPatches = 0;
  membershipChecks = 0;
  membershipAllocations = 0;
  candidateAdds = 0;
  candidateRemoves = 0;
  cachedPlan;
  rebuild(slots) {
    this.batches.clear();
    this.membershipByPrimitive.clear();
    this.ineligiblePrimitives.clear();
    this.generationByBatchId.length = 0;
    this.freeBatchIds.length = 0;
    for (const slot of slots) this.add(slot);
    this.revision += 1;
    this.payloadRevision += 1;
    this.rebuilds += 1;
    this.cachedPlan = void 0;
  }
  apply(delta) {
    let changed = false;
    let topologyChanged = false;
    for (const removed of delta.removedSlots) {
      const removedChanged = this.remove(removed.slot);
      changed = removedChanged || changed;
      topologyChanged = removedChanged || topologyChanged;
    }
    for (const slot of delta.recreatedSlots) {
      const removedChanged = this.remove(slot.slot);
      const addedChanged = this.add(slot);
      changed = removedChanged || addedChanged || changed;
      topologyChanged = removedChanged || addedChanged || topologyChanged;
    }
    const contentUpdatedSlots = delta.contentUpdatedSlots;
    const instanceUpdatedSlots = delta.instanceUpdatedSlots;
    const membershipUpdates = /* @__PURE__ */ new Map();
    for (const slot of contentUpdatedSlots) {
      membershipUpdates.set(slot.slot, { slot, content: true });
    }
    for (const slot of instanceUpdatedSlots) {
      if (!membershipUpdates.has(slot.slot)) {
        membershipUpdates.set(slot.slot, { slot, content: false });
      }
    }
    for (const update of membershipUpdates.values()) {
      const { slot, content } = update;
      const eligible = eligibleDraws(slot);
      const next = membershipProjection(slot, eligible);
      this.membershipAllocations += next.draws.length;
      const previous = this.membershipByPrimitive.get(slot.slot);
      this.membershipChecks += 1;
      const topologyStable = previous !== void 0 && previous.instanceCount === next.instanceCount && previous.hasLod === next.hasLod && previous.draws.length === next.draws.length && previous.draws.every((membership, index) => {
        const candidate = next.draws[index];
        return candidate !== void 0 && membership.sourceDrawIndex === candidate.sourceDrawIndex && membership.batchText === candidate.batchText;
      });
      if (!topologyStable) {
        const removedChanged = this.remove(slot.slot);
        const addedChanged = this.add(slot);
        changed = removedChanged || addedChanged || changed;
        topologyChanged = removedChanged || addedChanged || topologyChanged;
        continue;
      }
      if (!content) {
        this.membershipByPrimitive.set(slot.slot, next);
        continue;
      }
      let payloadChanged = false;
      let topologyFallback = false;
      for (let index = 0; index < next.draws.length; index += 1) {
        const oldMembership = previous.draws[index];
        const newMembership = next.draws[index];
        const draw = eligible[index];
        if (oldMembership === void 0 || newMembership === void 0 || draw === void 0) {
          continue;
        }
        if (oldMembership.payloadRevision === newMembership.payloadRevision) continue;
        for (let instanceOrdinal = 0; instanceOrdinal < next.instanceCount; instanceOrdinal += 1) {
          const batchText = candidateBatchText(
            draw.key,
            slot.slot,
            draw.sourceDrawIndex,
            instanceOrdinal,
            next.hasLod
          );
          const batch = this.batches.get(batchText);
          const candidateKey = `${newMembership.candidateKeyPrefix}${instanceOrdinal}`;
          if (batch === void 0 || !batch.candidates.has(candidateKey)) {
            const removedChanged = this.remove(slot.slot);
            const addedChanged = this.add(slot);
            changed = removedChanged || addedChanged || changed;
            topologyChanged = removedChanged || addedChanged || topologyChanged;
            topologyFallback = true;
            break;
          }
          batch.candidates.set(
            candidateKey,
            this.candidateFromEligible(slot, instanceOrdinal, draw)
          );
        }
        if (topologyFallback) break;
        payloadChanged = true;
      }
      this.membershipByPrimitive.set(slot.slot, next);
      if (payloadChanged) {
        changed = true;
        this.payloadRevision += 1;
        this.payloadPatches += 1;
        this.cachedPlan = void 0;
      }
    }
    for (const slot of delta.createdSlots) {
      const addedChanged = this.add(slot);
      changed = addedChanged || changed;
      topologyChanged = addedChanged || topologyChanged;
    }
    if (topologyChanged) {
      this.revision += 1;
      this.payloadRevision += 1;
      this.patches += 1;
      this.cachedPlan = void 0;
    }
    return changed;
  }
  plan() {
    if (this.cachedPlan !== void 0) return this.cachedPlan;
    const ordered = [...this.batches.values()].sort((left, right) => left.batchId - right.batchId);
    let visibleBase = 0;
    const batches = ordered.map((batch) => {
      visibleBase = alignInstanceBase(visibleBase);
      const candidates = [...batch.candidates.values()].sort(
        (left, right) => left.primitiveIndex - right.primitiveIndex || left.drawItemIndex - right.drawItemIndex || left.instanceOrdinal - right.instanceOrdinal
      );
      const result = {
        batchId: batch.batchId,
        generation: batch.generation,
        key: batch.key,
        candidates,
        visibleBase,
        visibleCapacity: candidates.length,
        indirectOffset: batch.batchId * 20
      };
      visibleBase += candidates.length;
      return Object.freeze(result);
    });
    this.cachedPlan = Object.freeze({
      revision: this.revision,
      payloadRevision: this.payloadRevision,
      batches: Object.freeze(batches),
      candidateCount: batches.reduce((total, batch) => total + batch.candidates.length, 0),
      visibleCapacity: visibleBase
    });
    return this.cachedPlan;
  }
  inspect() {
    let candidateCount = 0;
    for (const batch of this.batches.values()) candidateCount += batch.candidates.size;
    const resourceClasses = inspectResourceClassSplits(this.plan());
    return {
      revision: this.revision,
      batchCount: this.batches.size,
      candidateCount,
      rebuilds: this.rebuilds,
      patches: this.patches,
      ineligible: this.ineligiblePrimitives.size,
      payloadPatches: this.payloadPatches,
      membershipChecks: this.membershipChecks,
      membershipAllocations: this.membershipAllocations,
      candidateAdds: this.candidateAdds,
      candidateRemoves: this.candidateRemoves,
      resourceClassCount: resourceClasses.resourceClassCount,
      resourceClassSplits: resourceClasses.resourceClassSplits,
      resourceClassSplitReasons: resourceClasses.resourceClassSplitReasons
    };
  }
  add(slot) {
    const draws = eligibleDraws(slot);
    if (draws.length === 0) {
      this.ineligiblePrimitives.add(slot.slot);
      return false;
    }
    this.ineligiblePrimitives.delete(slot.slot);
    const memberships = membershipProjection(slot, draws);
    const instanceCount = memberships.instanceCount;
    const hasLod = memberships.hasLod;
    this.membershipAllocations += memberships.draws.length;
    for (const draw of draws) {
      for (let instanceOrdinal = 0; instanceOrdinal < instanceCount; instanceOrdinal += 1) {
        const text = candidateBatchText(
          draw.key,
          slot.slot,
          draw.sourceDrawIndex,
          instanceOrdinal,
          hasLod
        );
        let batch = this.batches.get(text);
        if (batch === void 0) {
          const reused = this.freeBatchIds.pop();
          const batchId = reused ?? this.generationByBatchId.length;
          const generation = reused === void 0 ? 0 : (this.generationByBatchId[batchId] ?? -1) + 1;
          this.generationByBatchId[batchId] = generation;
          batch = { batchId, generation, key: draw.key, candidates: /* @__PURE__ */ new Map() };
          this.batches.set(text, batch);
        }
        const candidateKey = `${slot.slot}:${draw.sourceDrawIndex}:${instanceOrdinal}`;
        batch.candidates.set(candidateKey, this.candidateFromEligible(slot, instanceOrdinal, draw));
        this.candidateAdds += 1;
      }
    }
    this.membershipByPrimitive.set(slot.slot, memberships);
    return true;
  }
  remove(primitiveIndex) {
    this.ineligiblePrimitives.delete(primitiveIndex);
    const memberships = this.membershipByPrimitive.get(primitiveIndex);
    this.membershipByPrimitive.delete(primitiveIndex);
    if (memberships === void 0) return false;
    for (const membership of memberships.draws) {
      const batchTexts = /* @__PURE__ */ new Set();
      for (let instanceOrdinal = 0; instanceOrdinal < memberships.instanceCount; instanceOrdinal += 1) {
        const batchText = candidateBatchText(
          membership.key,
          primitiveIndex,
          membership.sourceDrawIndex,
          instanceOrdinal,
          memberships.hasLod
        );
        batchTexts.add(batchText);
        const batch = this.batches.get(batchText);
        if (batch === void 0) continue;
        const candidateKey = `${membership.candidateKeyPrefix}${instanceOrdinal}`;
        if (!batch.candidates.delete(candidateKey)) continue;
        this.candidateRemoves += 1;
      }
      for (const batchText of batchTexts) {
        const batch = this.batches.get(batchText);
        if (batch !== void 0 && batch.candidates.size === 0) {
          this.batches.delete(batchText);
          this.freeBatchIds.push(batch.batchId);
        }
      }
    }
    return true;
  }
  candidateFromEligible(slot, instanceOrdinal, draw) {
    return {
      primitiveIndex: slot.slot,
      generation: slot.generation,
      drawItemIndex: draw.sourceDrawIndex,
      instanceOrdinal,
      ...draw.projectedHeight === void 0 ? {} : { projectedHeight: draw.projectedHeight },
      ...draw.lodCoverages === void 0 ? {} : { lodCoverages: draw.lodCoverages },
      ...draw.lodRanges === void 0 ? {} : { lodRanges: draw.lodRanges },
      ...draw.lodHysteresis === void 0 ? {} : { lodHysteresis: draw.lodHysteresis },
      ...draw.prepared === void 0 ? {} : { prepared: draw.prepared }
    };
  }
};
function decodeSurfaceIndirectParameters(input) {
  const ranges = input.recording.passes.flatMap(
    (pass) => pass.ranges.map((range) => ({ pass: pass.pass, ...range }))
  );
  if (input.byteOffset < 0 || input.byteLength < 0 || input.byteOffset + input.byteLength > input.bytes.byteLength) {
    return err$1({
      code: "indirect-readback-truncated",
      expected: "the indirect readback range is contained by the mapped buffer",
      hint: "retain the complete GPU indirect command copy before mapping it",
      actual: {
        byteOffset: input.byteOffset,
        byteLength: input.byteLength,
        bufferBytes: input.bytes.byteLength
      }
    });
  }
  const values = new DataView(input.bytes, input.byteOffset, input.byteLength);
  const decoded = [];
  for (const range of ranges) {
    if (range.indirectBufferIdentity !== input.indirectBufferIdentity) {
      return err$1({
        code: "indirect-readback-metadata-mismatch",
        expected: "every Surface indirect range names the copied indirect buffer",
        hint: "discard the readback and wait for the matching resource generation",
        actual: {
          pass: range.pass,
          expectedBufferIdentity: input.indirectBufferIdentity,
          actualBufferIdentity: range.indirectBufferIdentity
        }
      });
    }
    const offset = range.indirectOffset;
    if (!Number.isInteger(offset) || offset < 0 || offset % 4 !== 0 || offset + 20 > values.byteLength) {
      return err$1({
        code: "indirect-readback-truncated",
        expected: "each indirect range is a 20-byte aligned command inside the copied buffer",
        hint: "discard truncated selector readback instead of publishing partial draw parameters",
        actual: { pass: range.pass, indirectOffset: offset, readbackBytes: values.byteLength }
      });
    }
    const indexed = range.kind === "draw-indexed-indirect";
    decoded.push(
      Object.freeze({
        sequence: input.recording.sequence,
        frameId: input.recording.frameId,
        deviceGeneration: input.recording.deviceGeneration,
        resourceGeneration: input.recording.resourceGeneration,
        viewIdentity: input.recording.viewIdentity,
        pass: range.pass,
        kind: range.kind,
        indirectBufferIdentity: range.indirectBufferIdentity,
        indirectOffset: offset,
        count: values.getUint32(offset, true),
        first: values.getUint32(offset + 8, true),
        instanceCount: values.getUint32(offset + 4, true),
        baseVertex: indexed ? values.getInt32(offset + 12, true) : 0,
        firstInstance: values.getUint32(indexed ? offset + 16 : offset + 12, true)
      })
    );
  }
  return ok(Object.freeze(decoded));
}
var MAX_COMMANDS_PER_PASS = 32;
function isIndirect(command) {
  return command.kind === "draw-indirect" || command.kind === "draw-indexed-indirect";
}
function sameReadbackPass(receipt, snapshot) {
  if (receipt.pass !== snapshot.pass || receipt.totalCommandCount !== snapshot.totalCommandCount || receipt.savedCommandCount !== snapshot.savedCommandCount || receipt.droppedCommandCount !== snapshot.droppedCommandCount || receipt.truncated !== snapshot.truncated) {
    return false;
  }
  const ranges = receipt.commands.flatMap(
    (command) => command.kind === "draw-indirect" || command.kind === "draw-indexed-indirect" ? [
      {
        kind: command.kind,
        indirectBufferIdentity: command.indirectBufferIdentity,
        indirectOffset: command.indirectOffset
      }
    ] : []
  );
  return ranges.length === snapshot.ranges.length && ranges.every((range, index) => {
    const expected = snapshot.ranges[index];
    return expected !== void 0 && range.kind === expected.kind && range.indirectBufferIdentity === expected.indirectBufferIdentity && range.indirectOffset === expected.indirectOffset;
  });
}
function sameIndirectParameters(recording, parameters) {
  const expected = recording.passes.flatMap(
    (pass) => pass.ranges.map((range) => ({ pass: pass.pass, ...range }))
  );
  return expected.length === parameters.length && expected.every((range, index) => {
    const actual = parameters[index];
    return actual !== void 0 && actual.sequence === recording.sequence && actual.frameId === recording.frameId && actual.deviceGeneration === recording.deviceGeneration && actual.resourceGeneration === recording.resourceGeneration && actual.viewIdentity === recording.viewIdentity && actual.pass === range.pass && actual.kind === range.kind && actual.indirectBufferIdentity === range.indirectBufferIdentity && actual.indirectOffset === range.indirectOffset;
  });
}
var SurfaceSubmissionCandidate = class {
  constructor(owner, sequence, frameId, requestedLane, deviceGeneration, viewIdentity, resourceGeneration) {
    this.owner = owner;
    this.sequence = sequence;
    this.frameId = frameId;
    this.requestedLane = requestedLane;
    this.deviceGeneration = deviceGeneration;
    this.viewIdentity = viewIdentity;
    this.resolvedResourceGeneration = resourceGeneration;
  }
  owner;
  sequence;
  frameId;
  requestedLane;
  deviceGeneration;
  viewIdentity;
  passes = /* @__PURE__ */ new Map();
  state = "recording";
  resolvedResourceGeneration;
  actualLaneReason;
  setResourceGeneration(generation) {
    if (this.state === "recording") this.resolvedResourceGeneration = generation;
  }
  get resourceGeneration() {
    return this.resolvedResourceGeneration;
  }
  setActualLaneReason(reason) {
    if (this.state === "recording") this.actualLaneReason = reason;
  }
  record(pass, command) {
    if (this.state !== "recording") return;
    let recording = this.passes.get(pass);
    if (recording === void 0) {
      recording = { commands: [], totalCommandCount: 0, sawIndirect: false };
      this.passes.set(pass, recording);
    }
    recording.totalCommandCount += 1;
    recording.sawIndirect ||= isIndirect(command);
    if (recording.commands.length >= MAX_COMMANDS_PER_PASS) return;
    const programEvidence = command.receiptIdentity === void 0 || command.receiptGeneration === void 0 ? "missing" : "producer-receipt";
    recording.commands.push(Object.freeze({ ...command, programEvidence }));
  }
  /** Snapshot consumed only by the readback copy encoded for this candidate. */
  gpuReadbackSnapshot() {
    if (this.state !== "submitted") return void 0;
    const passes = ["nearest-layer", "color"].flatMap((pass) => {
      const recording = this.passes.get(pass);
      if (recording === void 0) return [];
      if (!recording.sawIndirect) return [];
      const ranges = recording.commands.flatMap(
        (command) => isIndirect(command) ? [
          Object.freeze({
            kind: command.kind,
            indirectBufferIdentity: command.indirectBufferIdentity,
            indirectOffset: command.indirectOffset
          })
        ] : []
      );
      const savedCommandCount = recording.commands.length;
      return [
        Object.freeze({
          pass,
          totalCommandCount: recording.totalCommandCount,
          savedCommandCount,
          droppedCommandCount: recording.totalCommandCount - savedCommandCount,
          truncated: recording.totalCommandCount > savedCommandCount,
          ranges: Object.freeze(ranges)
        })
      ];
    });
    return Object.freeze({
      sequence: this.sequence,
      frameId: this.frameId,
      deviceGeneration: this.deviceGeneration,
      resourceGeneration: this.resourceGeneration,
      viewIdentity: this.viewIdentity,
      passes: Object.freeze(passes)
    });
  }
  get laneReason() {
    return this.actualLaneReason;
  }
  submit(completed, graphGeneration) {
    if (this.state !== "recording") return;
    this.state = "submitted";
    this.owner.submit(this, completed, graphGeneration, this.passes);
  }
  abort() {
    if (this.state === "recording") this.state = "aborted";
  }
};
var SurfaceSubmissionObservationOwner = class {
  constructor(currentDeviceGeneration) {
    this.currentDeviceGeneration = currentDeviceGeneration;
  }
  currentDeviceGeneration;
  sequence = 0;
  acceptedSequence = 0;
  latest;
  begin(input) {
    this.sequence += 1;
    return new SurfaceSubmissionCandidate(
      this,
      this.sequence,
      input.frameId,
      input.requestedLane,
      input.deviceGeneration,
      "main:0",
      input.resourceGeneration
    );
  }
  inspect() {
    return this.latest;
  }
  /** Attach only selector-visible members copied for this exact completed recording. */
  publishGpuMembers(readback, targetOrLegacyMembers) {
    const target = targetOrLegacyMembers === void 0 || Array.isArray(targetOrLegacyMembers) ? void 0 : targetOrLegacyMembers;
    if (typeof readback === "number" || target === void 0) return;
    const latest = this.latest;
    const recording = readback.recording;
    if (latest === void 0 || latest.status !== "completed" || latest.actualLane !== "gpu-driven" || latest.sequence !== recording.sequence || latest.frameId !== recording.frameId || latest.deviceGeneration !== recording.deviceGeneration || latest.resourceGeneration !== recording.resourceGeneration || latest.viewIdentity !== recording.viewIdentity || latest.frameId !== target.frameId || latest.deviceGeneration !== target.deviceGeneration || latest.passes.length !== recording.passes.length || !latest.passes.every((pass, index) => {
      const snapshot = recording.passes[index];
      return snapshot !== void 0 && sameReadbackPass(pass, snapshot);
    })) {
      return;
    }
    if (readback.indirectParameters === void 0 || !sameIndirectParameters(recording, readback.indirectParameters)) {
      return;
    }
    this.latest = Object.freeze({
      ...latest,
      passes: Object.freeze(
        latest.passes.map((pass) => {
          const passParameters = readback.indirectParameters?.filter(
            (parameter) => parameter.pass === pass.pass
          );
          return Object.freeze({
            ...pass,
            memberEvidence: readback.indirectParameters === void 0 ? "indirect-readback-required" : pass.truncated ? "indirect-visible-readback-truncated" : "indirect-visible-readback",
            memberIds: Object.freeze([...readback.memberIds]),
            ...pass.truncated || passParameters === void 0 ? {} : { indirectParameters: Object.freeze(passParameters) }
          });
        })
      )
    });
  }
  submit(candidate, completed, graphGeneration, recordings) {
    const sequence = candidate.sequence;
    const passes = ["nearest-layer", "color"].flatMap((pass) => {
      const recording = recordings.get(pass);
      if (recording === void 0 || recording.totalCommandCount === 0) return [];
      const savedCommandCount = recording.commands.length;
      const truncated = recording.totalCommandCount > savedCommandCount;
      return [
        Object.freeze({
          pass,
          commandCount: recording.totalCommandCount,
          totalCommandCount: recording.totalCommandCount,
          savedCommandCount,
          droppedCommandCount: recording.totalCommandCount - savedCommandCount,
          truncated,
          memberEvidence: recording.sawIndirect ? "indirect-readback-required" : truncated ? "direct-command-members-truncated" : "direct-command-members",
          commands: Object.freeze([...recording.commands])
        })
      ];
    });
    if (passes.length === 0) return;
    const actualLane = [...recordings.values()].some((recording) => recording.sawIndirect) ? "gpu-driven" : "direct";
    const submitted = Object.freeze({
      sequence,
      frameId: candidate.frameId,
      requestedLane: candidate.requestedLane,
      actualLane,
      ...candidate.laneReason === void 0 ? {} : { actualLaneReason: candidate.laneReason },
      deviceGeneration: candidate.deviceGeneration,
      graphGeneration,
      viewIdentity: candidate.viewIdentity,
      resourceGeneration: candidate.resourceGeneration,
      status: "submitted",
      passes: Object.freeze(passes)
    });
    this.latest = submitted;
    void completed.then(
      () => {
        if (sequence !== this.sequence || sequence < this.acceptedSequence || this.currentDeviceGeneration() !== candidate.deviceGeneration) {
          return;
        }
        this.acceptedSequence = sequence;
        this.latest = Object.freeze({ ...submitted, status: "completed" });
      },
      () => void 0
    );
  }
};

// src/gpu-driven/resource-allocation.ts
var GpuResourceAllocationLedger = class {
  nextId = 1;
  live = /* @__PURE__ */ new Map();
  pending = /* @__PURE__ */ new Map();
  liveBytes = 0;
  pendingBytes = 0;
  peakBytes = 0;
  successfulAllocationCount = 0;
  successfulAllocationBytes = 0;
  retiredBytes = 0;
  failedAllocationRollbacks = 0;
  failedAllocationRollbackBytes = 0;
  allocate(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) {
      throw new RangeError(`GPU allocation bytes must be finite and non-negative (got ${bytes})`);
    }
    const token = { id: this.nextId++, bytes };
    this.live.set(token.id, token.bytes);
    this.liveBytes += token.bytes;
    this.successfulAllocationCount += 1;
    this.successfulAllocationBytes += token.bytes;
    this.updatePeak();
    return token;
  }
  retire(token) {
    const bytes = this.live.get(token.id);
    if (bytes === void 0) return;
    this.live.delete(token.id);
    this.liveBytes -= bytes;
    this.pending.set(token.id, bytes);
    this.pendingBytes += bytes;
    this.updatePeak();
  }
  release(token) {
    const pendingBytes = this.pending.get(token.id);
    if (pendingBytes !== void 0) {
      this.pending.delete(token.id);
      this.pendingBytes -= pendingBytes;
      this.retiredBytes += pendingBytes;
      return;
    }
    const liveBytes = this.live.get(token.id);
    if (liveBytes !== void 0) {
      this.live.delete(token.id);
      this.liveBytes -= liveBytes;
      this.retiredBytes += liveBytes;
    }
  }
  rollback(token) {
    const bytes = this.live.get(token.id);
    if (bytes === void 0) return;
    this.live.delete(token.id);
    this.liveBytes -= bytes;
    this.failedAllocationRollbacks += 1;
    this.failedAllocationRollbackBytes += bytes;
  }
  inspect() {
    return {
      unit: "engine-allocation-bytes",
      physicalResidency: "unknown",
      liveBytes: this.liveBytes,
      pendingRetirementBytes: this.pendingBytes,
      peakBytes: this.peakBytes,
      successfulAllocationCount: this.successfulAllocationCount,
      successfulAllocationBytes: this.successfulAllocationBytes,
      pendingRetirementCount: this.pending.size,
      retiredBytes: this.retiredBytes,
      failedAllocationRollbacks: this.failedAllocationRollbacks,
      failedAllocationRollbackBytes: this.failedAllocationRollbackBytes
    };
  }
  updatePeak() {
    this.peakBytes = Math.max(this.peakBytes, this.liveBytes + this.pendingBytes);
  }
};
function combineGpuResourceAllocationInspections(inspections) {
  if (inspections.length === 0) return void 0;
  const liveBytes = inspections.reduce((sum, value) => sum + value.liveBytes, 0);
  const pendingRetirementBytes = inspections.reduce(
    (sum, value) => sum + value.pendingRetirementBytes,
    0
  );
  const peakBytes = Math.max(
    liveBytes + pendingRetirementBytes,
    ...inspections.map((value) => value.peakBytes)
  );
  return {
    unit: "engine-allocation-bytes",
    physicalResidency: "unknown",
    liveBytes,
    pendingRetirementBytes,
    peakBytes,
    successfulAllocationCount: inspections.reduce(
      (sum, value) => sum + value.successfulAllocationCount,
      0
    ),
    successfulAllocationBytes: inspections.reduce(
      (sum, value) => sum + value.successfulAllocationBytes,
      0
    ),
    pendingRetirementCount: inspections.reduce(
      (sum, value) => sum + value.pendingRetirementCount,
      0
    ),
    retiredBytes: inspections.reduce((sum, value) => sum + value.retiredBytes, 0),
    failedAllocationRollbacks: inspections.reduce(
      (sum, value) => sum + value.failedAllocationRollbacks,
      0
    ),
    failedAllocationRollbackBytes: inspections.reduce(
      (sum, value) => sum + value.failedAllocationRollbackBytes,
      0
    )
  };
}

// src/scene/visibility/occlusion-confidence.ts
function createConfidenceState() {
  return {
    status: "visible",
    zeroStreak: 0,
    successfulSubmits: 0,
    queryable: true,
    dirty: true,
    lastResultGeneration: void 0
  };
}
function applyConfidenceEvent(state, event, budget = createVisibilityBudget()) {
  if (event.type === "result") {
    if (!Number.isFinite(event.samples) || event.samples < 0) {
      return { ...state, status: "visible", dirty: true, queryable: true };
    }
    if (event.samples > 0) {
      return {
        ...state,
        status: "visible",
        zeroStreak: 0,
        successfulSubmits: 0,
        queryable: true,
        dirty: false,
        lastResultGeneration: event.submissionGeneration
      };
    }
    const zeroStreak = state.zeroStreak + 1;
    const hidden = zeroStreak >= 2;
    return {
      ...state,
      status: hidden ? "hidden" : "visible",
      zeroStreak,
      successfulSubmits: 0,
      queryable: true,
      // A first zero is only provisional evidence. Keep it dirty so the
      // producer naturally submits the second query; suppression requires two
      // real zero results rather than two hand-applied state transitions.
      dirty: !hidden,
      lastResultGeneration: event.submissionGeneration
    };
  }
  if (event.type === "submit") {
    const successfulSubmits = state.successfulSubmits + 1;
    if (successfulSubmits >= budget.expirySubmits) {
      return {
        ...state,
        status: "visible",
        zeroStreak: 0,
        successfulSubmits: 0,
        queryable: true,
        dirty: true
      };
    }
    return { ...state, successfulSubmits, dirty: state.dirty };
  }
  if (event.type === "failure") {
    return {
      ...state,
      status: "visible",
      zeroStreak: 0,
      successfulSubmits: 0,
      queryable: true,
      dirty: true
    };
  }
  return {
    ...state,
    status: "visible",
    zeroStreak: 0,
    successfulSubmits: 0,
    queryable: event.reason !== "transparent" && event.reason !== "detach",
    dirty: true,
    lastResultGeneration: void 0
  };
}
function shouldIssueRetest(state, budget = createVisibilityBudget()) {
  return state.status === "hidden" && state.queryable && state.successfulSubmits >= budget.retestSubmits;
}
function shouldQueryState(state, budget) {
  return state.dirty && state.successfulSubmits === 0 || shouldIssueRetest(state, budget);
}
var OcclusionConfidenceScheduler = class {
  constructor(budget = createVisibilityBudget()) {
    this.budget = budget;
  }
  budget;
  states = /* @__PURE__ */ new Map();
  wakeByGeneration = /* @__PURE__ */ new Map();
  expireByGeneration = /* @__PURE__ */ new Map();
  wakeHeap = [];
  expireHeap = [];
  wakeHeapMembers = /* @__PURE__ */ new Set();
  expireHeapMembers = /* @__PURE__ */ new Set();
  retestKeys = /* @__PURE__ */ new Set();
  scheduleByKey = /* @__PURE__ */ new Map();
  ensure(key) {
    const existing = this.states.get(key);
    if (existing !== void 0) return existing;
    const state = createConfidenceState();
    this.states.set(key, state);
    return state;
  }
  apply(key, event) {
    this.unschedule(key);
    const next = applyConfidenceEvent(this.ensure(key), event, this.budget);
    this.states.set(key, next);
    this.refreshRetestKey(key, next);
    const anchor = event.type === "result" || event.type === "submit" || event.type === "failure" ? event.submissionGeneration : next.lastResultGeneration;
    this.schedule(key, next, anchor);
    return next;
  }
  /** Apply an in-flight query submit without scheduling a same-generation wake. */
  applyInFlightSubmit(key, event) {
    this.unschedule(key);
    const next = applyConfidenceEvent(this.ensure(key), event, this.budget);
    this.states.set(key, next);
    this.refreshRetestKey(key, next);
    this.scheduleExpiryOnly(key, next, event.submissionGeneration);
    return next;
  }
  drainRetests(limit) {
    if (!Number.isSafeInteger(limit) || limit <= 0) return [];
    const result = [];
    for (const key of this.retestKeys) {
      if (result.length >= limit) break;
      result.push(key);
    }
    return result;
  }
  get(key) {
    return this.states.get(key);
  }
  remove(key) {
    this.unschedule(key);
    this.retestKeys.delete(key);
    this.states.delete(key);
  }
  /** Advance hidden evidence on a successful frame even when no query was issued for it. */
  advanceSuccessfulSubmits(submissionGeneration, excludedKeys) {
    let changed = false;
    const drawChangedKeys = [];
    const queryChangedKeys = [];
    const expireKeys = this.takeDue(
      this.expireByGeneration,
      this.expireHeap,
      this.expireHeapMembers,
      submissionGeneration
    );
    for (const key of expireKeys) {
      const state = this.states.get(key);
      if (state === void 0 || state.status !== "hidden" || !state.queryable) continue;
      if (excludedKeys?.has(key)) {
        this.unschedule(key);
        this.schedule(key, state, submissionGeneration);
        continue;
      }
      const beforeQuery = shouldQueryState(state, this.budget);
      this.unschedule(key);
      const expiring = state.successfulSubmits >= this.budget.expirySubmits - 1 ? state : { ...state, successfulSubmits: this.budget.expirySubmits - 1 };
      const expired = applyConfidenceEvent(
        expiring,
        {
          type: "submit",
          submissionGeneration
        },
        this.budget
      );
      this.states.set(key, expired);
      this.refreshRetestKey(key, expired);
      changed = true;
      if (state.status !== expired.status || state.queryable !== expired.queryable) {
        drawChangedKeys.push(key);
      }
      if (beforeQuery !== shouldQueryState(expired, this.budget)) queryChangedKeys.push(key);
    }
    const wakeKeys = this.takeDue(
      this.wakeByGeneration,
      this.wakeHeap,
      this.wakeHeapMembers,
      submissionGeneration
    );
    for (const key of wakeKeys) {
      const state = this.states.get(key);
      if (state === void 0 || state.status !== "hidden" || !state.queryable) continue;
      if (excludedKeys?.has(key)) {
        this.unschedule(key);
        this.schedule(key, state, submissionGeneration);
        continue;
      }
      const beforeQuery = shouldQueryState(state, this.budget);
      this.unschedule(key);
      const next = state.successfulSubmits >= this.budget.retestSubmits ? state : { ...state, successfulSubmits: this.budget.retestSubmits };
      this.states.set(key, next);
      this.refreshRetestKey(key, next);
      changed = changed || next !== state;
      if (state.status !== next.status || state.queryable !== next.queryable) {
        drawChangedKeys.push(key);
      }
      if (beforeQuery !== shouldQueryState(next, this.budget)) queryChangedKeys.push(key);
      this.scheduleExpiry(
        key,
        submissionGeneration + Math.max(1, this.budget.expirySubmits - next.successfulSubmits)
      );
    }
    return { changed, drawChangedKeys, queryChangedKeys };
  }
  clear() {
    this.states.clear();
    this.wakeByGeneration.clear();
    this.expireByGeneration.clear();
    this.scheduleByKey.clear();
    this.retestKeys.clear();
    this.wakeHeap.length = 0;
    this.expireHeap.length = 0;
    this.wakeHeapMembers.clear();
    this.expireHeapMembers.clear();
  }
  schedule(key, state, anchorGeneration) {
    if (state.status !== "hidden" || !state.queryable || state.lastResultGeneration === void 0) {
      return;
    }
    const anchor = anchorGeneration ?? state.lastResultGeneration;
    const wake = anchor + Math.max(0, this.budget.retestSubmits - state.successfulSubmits);
    const expire = anchor + Math.max(1, this.budget.expirySubmits - state.successfulSubmits);
    this.scheduleExpiry(key, expire);
    const entry = this.scheduleByKey.get(key);
    if (entry !== void 0 && entry.wake === wake) return;
    this.addDue(this.wakeByGeneration, this.wakeHeap, this.wakeHeapMembers, wake, key);
    this.scheduleByKey.set(key, {
      wake,
      expire: entry?.expire ?? expire
    });
  }
  scheduleExpiry(key, expire) {
    this.addDue(this.expireByGeneration, this.expireHeap, this.expireHeapMembers, expire, key);
    const entry = this.scheduleByKey.get(key);
    this.scheduleByKey.set(key, {
      wake: entry?.wake ?? Number.POSITIVE_INFINITY,
      expire
    });
  }
  scheduleExpiryOnly(key, state, anchorGeneration) {
    if (state.status !== "hidden" || !state.queryable || state.lastResultGeneration === void 0) {
      return;
    }
    const expire = anchorGeneration + Math.max(1, this.budget.expirySubmits - state.successfulSubmits);
    this.addDue(this.expireByGeneration, this.expireHeap, this.expireHeapMembers, expire, key);
    this.scheduleByKey.set(key, { wake: Number.POSITIVE_INFINITY, expire });
  }
  unschedule(key) {
    const entry = this.scheduleByKey.get(key);
    if (entry === void 0) return;
    if (Number.isFinite(entry.wake)) {
      removeDue(this.wakeByGeneration, this.wakeHeapMembers, entry.wake, key);
    }
    if (Number.isFinite(entry.expire)) {
      removeDue(this.expireByGeneration, this.expireHeapMembers, entry.expire, key);
    }
    this.scheduleByKey.delete(key);
  }
  takeDue(source, heap, heapMembers, generation) {
    const result = [];
    while (heap[0] !== void 0 && heap[0] <= generation) {
      const due = popMin(heap);
      heapMembers.delete(due);
      const keys = source.get(due);
      if (keys === void 0) continue;
      source.delete(due);
      result.push(...keys);
    }
    return result;
  }
  addDue(source, heap, heapMembers, generation, key) {
    const set = source.get(generation) ?? /* @__PURE__ */ new Set();
    if (!source.has(generation)) {
      source.set(generation, set);
      if (!heapMembers.has(generation)) {
        heapMembers.add(generation);
        pushMin(heap, generation);
      }
    }
    set.add(key);
  }
  refreshRetestKey(key, state) {
    if (shouldIssueRetest(state, this.budget)) this.retestKeys.add(key);
    else this.retestKeys.delete(key);
  }
};
function removeDue(source, heapMembers, generation, key) {
  const keys = source.get(generation);
  if (keys === void 0) return;
  keys.delete(key);
  if (keys.size === 0) {
    source.delete(generation);
    heapMembers.delete(generation);
  }
}
function pushMin(heap, value) {
  heap.push(value);
  let index = heap.length - 1;
  while (index > 0) {
    const parent = Math.floor((index - 1) / 2);
    if (heap[parent] <= value) break;
    heap[index] = heap[parent];
    index = parent;
  }
  heap[index] = value;
}
function popMin(heap) {
  const first = heap[0];
  const last = heap.pop();
  if (last !== void 0 && heap.length > 0) {
    let index = 0;
    while (true) {
      const left = index * 2 + 1;
      if (left >= heap.length) break;
      const right = left + 1;
      const child = right < heap.length && heap[right] < heap[left] ? right : left;
      if (heap[child] >= last) break;
      heap[index] = heap[child];
      index = child;
    }
    heap[index] = last;
  }
  return first;
}
function decideVisibility(input) {
  if (!input.authorVisible) return { draw: false, stage: "author" };
  if (!input.validBounds) return { draw: true, stage: "bounds" };
  if (!input.frustumVisible) return { draw: false, stage: "frustum" };
  if (!input.lodReady) return { draw: true, stage: "lod" };
  if (input.occlusion.status === "hidden" && input.occlusion.queryable) {
    return { draw: false, stage: "occlusion" };
  }
  return { draw: true, stage: "occlusion" };
}

// src/gpu-driven/view-gpu.ts
var COMPUTE_STAGE = 4;
var WORKGROUP_SIZE = 64;
var LOD_ROW_STRIDE = GPU_SCENE_LAYOUTS.lod.stride;
var LOD_ROW_CAPACITY = 8;
var CANDIDATE_STRIDE = 48 + LOD_ROW_CAPACITY * LOD_ROW_STRIDE;
var BATCH_STRIDE = 32;
var VIEW_BYTES = 112;
var COUNTER_WORDS = 2 + LOD_ROW_CAPACITY + 2;
var GEOMETRY_WORK_COUNTER_OFFSET = 2 + LOD_ROW_CAPACITY;
var ROOT_GEOMETRY_WORK_COUNTER_OFFSET = GEOMETRY_WORK_COUNTER_OFFSET + 1;
var COUNTER_STRIDE = COUNTER_WORDS * 4;
var INDIRECT_COMMAND_BYTES = 20;
function selectGpuLodLane(caps) {
  return caps.compute && caps.storageBuffer && caps.indirectDrawing ? "gpu" : "cpu";
}
var GPU_DRIVEN_VIEW_WGSL = (
  /* wgsl */
  `
struct PrimitiveRecord {
  generation: u32,
  flags: u32,
  transformIndex: u32,
  materialIndex: u32,
  drawTemplateIndex: u32,
  instanceStart: u32,
  instanceCount: u32,
  assetHandle: u32,
  localBoundsMin: vec4<f32>,
  localBoundsMax: vec4<f32>,
};

struct TransformRecord {
  currentWorld: mat4x4<f32>,
  previousWorld: mat4x4<f32>,
};

struct LodRecord {
  generation: u32,
  level: u32,
  firstIndex: u32,
  indexCount: u32,
  baseVertex: i32,
  screenCoverage: f32,
  hysteresis: f32,
  ready: u32,
};

struct CandidateRecord {
  primitiveIndex: u32,
  generation: u32,
  instanceOrdinal: u32,
  materialSlot: u32,
  batchIndex: u32,
  visibleBase: u32,
  visibleCapacity: u32,
  // Low bit is admission; upper bits carry the batch-local projected Mesh row.
  // Suppressed candidates still contribute to the all-candidate LOD histogram,
  // but never enter the compacted visible stream. Packing both facts here
  // keeps the candidate ABI single-source when visibility compacts rows.
  submitAdmission: u32,
  projectedHeight: f32,
  previousLevel: u32,
  historyValid: u32,
  lodCount: u32,
  lodRows: array<LodRecord, 8>,
};

struct InstanceRecord {
  primitiveIndex: u32,
  transformIndex: u32,
  customDataStart: u32,
  flags: u32,
};

struct ViewConstants {
  planes: array<vec4<f32>, 6>,
  candidateCount: u32,
  batchCount: u32,
  batchCapacity: u32,
  pad1: u32,
};

fn selectLodLevel(
  projectedHeight: f32,
  previousLevel: u32,
  historyValid: bool,
  rows: array<LodRecord, 8>,
  levelCount: u32,
) -> u32 {
  // Row zero is the implicit root and has no transition threshold. Lower
  // levels carry the absolute boundary that introduces the preceding row.
  // This mirrors the CPU selector: height >= rows[1] selects root, height
  // between rows[2] and rows[1] selects level 1, and so on.
  var selected = levelCount - 1u;
  for (var level = 1u; level < levelCount; level += 1u) {
    if (projectedHeight >= rows[level].screenCoverage) {
      selected = level - 1u;
      break;
    }
  }
  if (historyValid && previousLevel < levelCount && selected != previousLevel) {
    var boundary = rows[previousLevel + 1u].screenCoverage;
    if (selected < previousLevel) { boundary = rows[previousLevel].screenCoverage; }
    let band = boundary * rows[previousLevel].hysteresis;
    if (abs(projectedHeight - boundary) <= band) { selected = previousLevel; }
  }
  if (selected >= levelCount || rows[selected].ready == 0u) { return 0u; }
  return selected;
}

@group(0) @binding(0) var<storage, read> primitives: array<PrimitiveRecord>;
@group(0) @binding(1) var<storage, read> instances: array<InstanceRecord>;
@group(0) @binding(2) var<storage, read> transforms: array<TransformRecord>;
@group(0) @binding(3) var<storage, read> candidates: array<CandidateRecord>;
@group(0) @binding(4) var<storage, read> batchWords: array<u32>;
@group(0) @binding(5) var<uniform> view: ViewConstants;
@group(0) @binding(6) var<storage, read_write> counters: array<atomic<u32>>;
@group(0) @binding(7) var<storage, read_write> visibleIndices: array<vec4<u32>>;
@group(0) @binding(8) var<storage, read_write> indirectArgs: array<u32>;

fn batchWord(batchIndex: u32, word: u32) -> u32 {
  return batchWords[batchIndex * ${BATCH_STRIDE / 4}u + word];
}

fn projectedHeight(candidateIndex: u32) -> f32 {
  let payloadBase = view.batchCapacity * ${BATCH_STRIDE / 4}u;
  return bitcast<f32>(batchWords[payloadBase + candidateIndex]);
}

fn counterIndex(batchIndex: u32) -> u32 { return batchIndex * ${COUNTER_WORDS}u; }
fn overflowIndex(batchIndex: u32) -> u32 { return counterIndex(batchIndex) + 1u; }
fn lodCounterIndex(batchIndex: u32, level: u32) -> u32 {
  return counterIndex(batchIndex) + 2u + level;
}

fn isVisible(primitive: PrimitiveRecord, world: mat4x4<f32>) -> bool {
  // GPU Scene bounds are optional. A producer that has not published local
  // bounds still belongs in the GPU lane; keep it conservatively visible
  // instead of silently dropping a valid draw.
  if ((primitive.flags & 5u) != 5u) { return false; }
  if ((primitive.flags & 2u) == 0u) { return true; }
  let localCenter = (primitive.localBoundsMin.xyz + primitive.localBoundsMax.xyz) * 0.5;
  let localExtent = (primitive.localBoundsMax.xyz - primitive.localBoundsMin.xyz) * 0.5;
  let worldCenter = (world * vec4<f32>(localCenter, 1.0)).xyz;
  let worldExtent =
    abs(world[0].xyz) * localExtent.x +
    abs(world[1].xyz) * localExtent.y +
    abs(world[2].xyz) * localExtent.z;
  for (var planeIndex = 0u; planeIndex < 6u; planeIndex += 1u) {
    let plane = view.planes[planeIndex];
    let radius = dot(abs(plane.xyz), worldExtent);
    if (dot(plane.xyz, worldCenter) + plane.w < -radius) { return false; }
  }
  return true;
}

@compute @workgroup_size(${WORKGROUP_SIZE})
fn resetView(@builtin(global_invocation_id) id: vec3<u32>) {
  let batchIndex = id.x;
  if (batchIndex >= view.batchCount) { return; }
  atomicStore(&counters[counterIndex(batchIndex)], 0u);
  atomicStore(&counters[overflowIndex(batchIndex)], 0u);
  for (var level = 0u; level < ${LOD_ROW_CAPACITY}u; level += 1u) {
    atomicStore(&counters[lodCounterIndex(batchIndex, level)], 0u);
  }
  atomicStore(&counters[counterIndex(batchIndex) + ${GEOMETRY_WORK_COUNTER_OFFSET}u], 0u);
  atomicStore(&counters[counterIndex(batchIndex) + ${ROOT_GEOMETRY_WORK_COUNTER_OFFSET}u], 0u);
}

@compute @workgroup_size(${WORKGROUP_SIZE})
fn cullView(@builtin(global_invocation_id) id: vec3<u32>) {
  let candidateIndex = id.x;
  if (candidateIndex >= view.candidateCount) { return; }
  let candidate = candidates[candidateIndex];
  let primitive = primitives[candidate.primitiveIndex];
  if (primitive.generation != candidate.generation) { return; }
  if (candidate.instanceOrdinal >= primitive.instanceCount) { return; }
  let instanceIndex = primitive.instanceStart + candidate.instanceOrdinal;
  let instance = instances[instanceIndex];
  let world = transforms[primitive.transformIndex].currentWorld * transforms[instance.transformIndex].currentWorld;
  let selectedLod = selectLodLevel(
    projectedHeight(candidateIndex),
    candidate.previousLevel,
    candidate.historyValid != 0u,
    candidate.lodRows,
    candidate.lodCount,
  );
  if (candidate.lodRows[selectedLod].ready == 0u) { return; }
  // Selector counters describe the complete LOD population, including
  // candidates outside the frustum and candidates suppressed by the CPU
  // visibility facet. Submission counters below remain compacted draw facts.
  atomicAdd(&counters[lodCounterIndex(candidate.batchIndex, selectedLod)], 1u);
  if ((candidate.submitAdmission & 1u) == 0u) { return; }
  if (!isVisible(primitive, world)) { return; }
  atomicAdd(
    &counters[counterIndex(candidate.batchIndex) + ${GEOMETRY_WORK_COUNTER_OFFSET}u],
    candidate.lodRows[selectedLod].indexCount,
  );
  atomicAdd(
    &counters[counterIndex(candidate.batchIndex) + ${ROOT_GEOMETRY_WORK_COUNTER_OFFSET}u],
    candidate.lodRows[0u].indexCount,
  );
  let localVisible = atomicAdd(&counters[counterIndex(candidate.batchIndex)], 1u);
  if (localVisible >= candidate.visibleCapacity) {
    atomicStore(&counters[overflowIndex(candidate.batchIndex)], 1u);
    return;
  }
  var materialOrPalette = primitive.materialIndex + (candidate.materialSlot & 0x7fffffffu);
  if ((candidate.materialSlot & 0x80000000u) != 0u) {
    materialOrPalette = instance.customDataStart;
  }
  visibleIndices[candidate.visibleBase + localVisible] = vec4<u32>(
    candidate.submitAdmission >> 1u,
    materialOrPalette,
    candidate.primitiveIndex + 1u,
    candidate.generation,
  );
}

@compute @workgroup_size(${WORKGROUP_SIZE})
fn finalizeView(@builtin(global_invocation_id) id: vec3<u32>) {
  let batchIndex = id.x;
  if (batchIndex >= view.batchCount) { return; }
  var visibleCount = min(
    atomicLoad(&counters[counterIndex(batchIndex)]),
    batchWord(batchIndex, 1u),
  );
  // Overflow is a failed generation, never a partially valid draw. Keep the
  // telemetry flag for the producer retry path but emit zero instances so no
  // subset of a visible batch reaches the rasterizer.
  if (atomicLoad(&counters[overflowIndex(batchIndex)]) != 0u) {
    visibleCount = 0u;
  }
  let args = batchWord(batchIndex, 5u) * 5u;
  let candidateBase = batchWord(batchIndex, 7u);
  let candidate = candidates[candidateBase];
  let selectedLod = selectLodLevel(projectedHeight(candidateBase), candidate.previousLevel, candidate.historyValid != 0u, candidate.lodRows, candidate.lodCount);
  let lod = candidate.lodRows[selectedLod];
  var drawCount = batchWord(batchIndex, 2u);
  var drawFirst = batchWord(batchIndex, 3u);
  var drawBaseVertex: i32 = 0;
  if (candidate.lodCount > 0u) {
    drawCount = lod.indexCount;
    if (batchWord(batchIndex, 6u) != 0u) {
      drawFirst = lod.firstIndex;
      drawBaseVertex = lod.baseVertex;
    }
  } else if (batchWord(batchIndex, 6u) != 0u) {
    drawBaseVertex = bitcast<i32>(batchWord(batchIndex, 4u));
  }
  indirectArgs[args] = drawCount;
  indirectArgs[args + 1u] = visibleCount;
  indirectArgs[args + 2u] = drawFirst;
  indirectArgs[args + 3u] = bitcast<u32>(drawBaseVertex);
  indirectArgs[args + 4u] = 0u;
}
`
);
function nextCapacity(required) {
  return 2 ** Math.ceil(Math.log2(Math.max(1, required)));
}
function admittedRasterBatchCount(plan) {
  return plan.batches.reduce((count, batch) => count + (batch.visibleCapacity > 0 ? 1 : 0), 0);
}
function deriveGpuDrivenViewBufferCapacities(plan) {
  return Object.freeze({
    candidate: nextCapacity(plan.candidateCount),
    visible: nextCapacity(plan.visibleCapacity),
    batch: nextCapacity(plan.batches.length),
    indirect: nextCapacity(
      plan.batches.reduce((maximum, batch) => Math.max(maximum, batch.batchId + 1), 0)
    )
  });
}
function bufferBinding(buffer) {
  return { kind: "buffer", value: { buffer } };
}
var GpuDrivenView = class _GpuDrivenView {
  constructor(device, bindGroupLayout, pipelineLayout, resetPipeline, cullPipeline, finalizePipeline, labelPrefix) {
    this.device = device;
    this.bindGroupLayout = bindGroupLayout;
    this.pipelineLayout = pipelineLayout;
    this.resetPipeline = resetPipeline;
    this.cullPipeline = cullPipeline;
    this.finalizePipeline = finalizePipeline;
    this.labelPrefix = labelPrefix;
  }
  device;
  bindGroupLayout;
  pipelineLayout;
  resetPipeline;
  cullPipeline;
  finalizePipeline;
  labelPrefix;
  buffers;
  supersededBuffers = [];
  bindGroup;
  candidateCapacity = 0;
  visibleBufferCapacity = 0;
  batchCapacity = 0;
  indirectCapacity = 0;
  plan;
  scenePrimitive;
  sceneInstance;
  sceneTransform;
  sceneMaterial;
  sceneCapacity = 0;
  updateCount = 0;
  uploadBytes = 0;
  candidateUploadBytes = 0;
  lodPayloadUploadBytes = 0;
  batchUploadBytes = 0;
  viewConstantsUploadBytes = 0;
  bindGroupCreates = 0;
  bufferRebuilds = 0;
  resourceGeneration = 0;
  allocationLedger = new GpuResourceAllocationLedger();
  allocationTokens = /* @__PURE__ */ new WeakMap();
  /** The last readback copy that was actually encoded and is not consumed. */
  telemetryPending;
  /** Receipt identity for the copy pass encoded by the current frame. */
  telemetrySubmit;
  /** Coalesce observers while the readback buffer is map-pending. */
  lodSelectionReadback;
  lodSelection;
  setTelemetrySubmit(identity) {
    this.telemetrySubmit = identity;
  }
  static create(input) {
    const { device, shaderModuleFactory } = input;
    const labelPrefix = input.labelPrefix ?? "gpu-driven-view";
    if (!device.caps.compute || !device.caps.storageBuffer || !device.caps.indirectDrawing) {
      return err(
        new RhiError({
          code: "feature-not-enabled",
          expected: "compute && storageBuffer && indirectDrawing",
          hint: "use the CPU projection and direct submission fallback on this device"
        })
      );
    }
    const layout = device.createBindGroupLayout({
      label: `${labelPrefix}-bgl`,
      entries: [
        { binding: 0, visibility: COMPUTE_STAGE, buffer: { type: "read-only-storage" } },
        { binding: 1, visibility: COMPUTE_STAGE, buffer: { type: "read-only-storage" } },
        { binding: 2, visibility: COMPUTE_STAGE, buffer: { type: "read-only-storage" } },
        { binding: 3, visibility: COMPUTE_STAGE, buffer: { type: "read-only-storage" } },
        { binding: 4, visibility: COMPUTE_STAGE, buffer: { type: "read-only-storage" } },
        { binding: 5, visibility: COMPUTE_STAGE, buffer: { type: "uniform" } },
        { binding: 6, visibility: COMPUTE_STAGE, buffer: { type: "storage" } },
        { binding: 7, visibility: COMPUTE_STAGE, buffer: { type: "storage" } },
        { binding: 8, visibility: COMPUTE_STAGE, buffer: { type: "storage" } }
      ]
    });
    if (!layout.ok) return layout;
    const pipelineLayout = device.createPipelineLayout({
      label: `${labelPrefix}-pl`,
      bindGroupLayouts: [layout.value]
    });
    if (!pipelineLayout.ok) return pipelineLayout;
    const module = shaderModuleFactory.createShaderModule({
      label: "gpu-driven-view",
      code: GPU_DRIVEN_VIEW_WGSL
    });
    if (!module.ok) return module;
    const createPipeline = (entryPoint) => device.createComputePipeline({
      label: `${labelPrefix}.${entryPoint}`,
      layout: pipelineLayout.value,
      compute: { module: module.value, entryPoint }
    });
    const reset = createPipeline("resetView");
    if (!reset.ok) return reset;
    const cull = createPipeline("cullView");
    if (!cull.ok) return cull;
    const finalize = createPipeline("finalizeView");
    if (!finalize.ok) return finalize;
    return ok$1(
      new _GpuDrivenView(
        device,
        layout.value,
        pipelineLayout.value,
        reset.value,
        cull.value,
        finalize.value,
        labelPrefix
      )
    );
  }
  update(plan, scene, planes, lodProjectedHeights) {
    this.candidateUploadBytes = 0;
    this.lodPayloadUploadBytes = 0;
    this.batchUploadBytes = 0;
    this.viewConstantsUploadBytes = 0;
    this.bindGroupCreates = 0;
    this.lodSelection = void 0;
    const topologyChanged = this.plan !== plan;
    let buffersRebuilt = false;
    if (topologyChanged || this.buffers === void 0) {
      const capacities = deriveGpuDrivenViewBufferCapacities(plan);
      if (this.buffers === void 0 || capacities.candidate > this.candidateCapacity || capacities.visible > this.visibleBufferCapacity || capacities.batch > this.batchCapacity || capacities.indirect > this.indirectCapacity) {
        const rebuilt = this.rebuildBuffers(
          capacities.candidate,
          capacities.visible,
          capacities.batch,
          capacities.indirect
        );
        if (!rebuilt.ok) return rebuilt;
        buffersRebuilt = true;
      }
    }
    const buffers = this.buffers;
    if (buffers === void 0) return ok$1(void 0);
    if (topologyChanged || buffersRebuilt) {
      const candidateBytes = new ArrayBuffer(Math.max(1, plan.candidateCount) * CANDIDATE_STRIDE);
      const candidates = new DataView(candidateBytes);
      const batchBytes = new ArrayBuffer(Math.max(1, plan.batches.length) * BATCH_STRIDE);
      const batches = new DataView(batchBytes);
      let candidateIndex = 0;
      for (let batchIndex = 0; batchIndex < plan.batches.length; batchIndex += 1) {
        const batch = plan.batches[batchIndex];
        if (batch === void 0) continue;
        const batchOffset = batchIndex * BATCH_STRIDE;
        batches.setUint32(batchOffset, batch.visibleBase, true);
        batches.setUint32(batchOffset + 4, batch.visibleCapacity, true);
        batches.setUint32(batchOffset + 8, batch.key.count, true);
        batches.setUint32(batchOffset + 12, batch.key.first, true);
        batches.setInt32(batchOffset + 16, batch.key.baseVertex, true);
        batches.setUint32(batchOffset + 20, batch.batchId, true);
        batches.setUint32(batchOffset + 24, batch.key.drawKind === "indexed" ? 1 : 0, true);
        batches.setUint32(batchOffset + 28, candidateIndex, true);
        let visibleProjectionIndex = 0;
        for (const candidate of batch.candidates) {
          const admissionCandidate = candidate;
          const candidateOffset = candidateIndex * CANDIDATE_STRIDE;
          candidates.setUint32(candidateOffset, candidate.primitiveIndex, true);
          candidates.setUint32(candidateOffset + 4, candidate.generation, true);
          candidates.setUint32(candidateOffset + 8, candidate.instanceOrdinal, true);
          const isSkin = candidate.prepared?.identity.deformation === "skin";
          candidates.setUint32(
            candidateOffset + 12,
            batch.key.materialSlot | (isSkin ? GPU_DRIVEN_SKIN_FLAG : 0),
            true
          );
          candidates.setUint32(candidateOffset + 16, batchIndex, true);
          candidates.setUint32(candidateOffset + 20, batch.visibleBase, true);
          candidates.setUint32(candidateOffset + 24, batch.visibleCapacity, true);
          const coverages = candidate.lodCoverages ?? [1];
          const ranges = [
            { first: batch.key.first, count: batch.key.count, baseVertex: batch.key.baseVertex },
            ...candidate.lodRanges ?? []
          ];
          const lodCount = Math.min(LOD_ROW_CAPACITY, Math.max(1, coverages.length, ranges.length));
          const admitted = admissionCandidate.submitAdmission !== false;
          candidates.setUint32(
            candidateOffset + 28,
            visibleProjectionIndex << 1 | (admitted ? 1 : 0),
            true
          );
          candidates.setFloat32(
            candidateOffset + 32,
            candidate.projectedHeight ?? Number.NaN,
            true
          );
          candidates.setUint32(candidateOffset + 36, 0, true);
          candidates.setUint32(candidateOffset + 40, 0, true);
          candidates.setUint32(candidateOffset + 44, lodCount, true);
          for (let level = 0; level < lodCount; level += 1) {
            const rowOffset = candidateOffset + 48 + level * LOD_ROW_STRIDE;
            candidates.setUint32(rowOffset, candidate.generation, true);
            candidates.setUint32(rowOffset + 4, level, true);
            candidates.setUint32(rowOffset + 8, ranges[level]?.first ?? batch.key.first, true);
            candidates.setUint32(rowOffset + 12, ranges[level]?.count ?? batch.key.count, true);
            candidates.setInt32(
              rowOffset + 16,
              ranges[level]?.baseVertex ?? batch.key.baseVertex,
              true
            );
            candidates.setFloat32(rowOffset + 20, coverages[level] ?? 0, true);
            candidates.setFloat32(rowOffset + 24, candidate.lodHysteresis ?? 0.08, true);
            candidates.setUint32(rowOffset + 28, 1, true);
          }
          if (admitted) visibleProjectionIndex += 1;
          candidateIndex += 1;
        }
      }
      const candidateWrite = this.device.queue.writeBuffer(
        buffers.candidates,
        0,
        new Uint8Array(candidateBytes)
      );
      if (!candidateWrite.ok) return candidateWrite;
      const batchWrite = this.device.queue.writeBuffer(
        buffers.batches,
        0,
        new Uint8Array(batchBytes)
      );
      if (!batchWrite.ok) return batchWrite;
      this.candidateUploadBytes = candidateBytes.byteLength;
      this.batchUploadBytes = batchBytes.byteLength;
      this.uploadBytes += candidateBytes.byteLength + batchBytes.byteLength;
    }
    if (topologyChanged || buffersRebuilt || lodProjectedHeights !== void 0) {
      const heightBytes = new Float32Array(Math.max(1, plan.candidateCount));
      let candidateIndex = 0;
      for (const batch of plan.batches) {
        for (const candidate of batch.candidates) {
          heightBytes[candidateIndex] = lodProjectedHeights?.get(candidate.primitiveIndex) ?? candidate.projectedHeight ?? Number.NaN;
          candidateIndex += 1;
        }
      }
      const heightWrite = this.device.queue.writeBuffer(
        buffers.batches,
        this.batchCapacity * BATCH_STRIDE,
        new Uint8Array(heightBytes.buffer)
      );
      if (!heightWrite.ok) return heightWrite;
      this.lodPayloadUploadBytes = heightBytes.byteLength;
      this.uploadBytes += heightBytes.byteLength;
    }
    const viewBytes = new ArrayBuffer(VIEW_BYTES);
    const viewFloats = new Float32Array(viewBytes);
    viewFloats.set(planes.subarray(0, 24));
    const viewU32 = new Uint32Array(viewBytes);
    viewU32[24] = plan.candidateCount;
    viewU32[25] = plan.batches.length;
    viewU32[26] = this.batchCapacity;
    const viewWrite = this.device.queue.writeBuffer(buffers.view, 0, new Uint8Array(viewBytes));
    if (!viewWrite.ok) return viewWrite;
    this.viewConstantsUploadBytes = viewBytes.byteLength;
    this.uploadBytes += viewBytes.byteLength;
    const sceneChanged = this.scenePrimitive !== scene.primitiveBuffer || this.sceneInstance !== scene.instanceBuffer || this.sceneTransform !== scene.transformBuffer || this.sceneMaterial !== scene.materialBuffer;
    if (this.bindGroup === void 0 || sceneChanged || buffersRebuilt) {
      const binding = this.device.createBindGroup({
        label: `${this.labelPrefix}-bg`,
        layout: this.bindGroupLayout,
        entries: [
          { binding: 0, resource: bufferBinding(scene.primitiveBuffer) },
          { binding: 1, resource: bufferBinding(scene.instanceBuffer) },
          { binding: 2, resource: bufferBinding(scene.transformBuffer) },
          { binding: 3, resource: bufferBinding(buffers.candidates) },
          { binding: 4, resource: bufferBinding(buffers.batches) },
          { binding: 5, resource: bufferBinding(buffers.view) },
          { binding: 6, resource: bufferBinding(buffers.counters) },
          { binding: 7, resource: bufferBinding(buffers.visible) },
          { binding: 8, resource: bufferBinding(buffers.indirect) }
        ]
      });
      if (!binding.ok) return binding;
      this.bindGroup = binding.value;
      this.bindGroupCreates = 1;
      this.resourceGeneration += 1;
    }
    this.plan = plan;
    this.scenePrimitive = scene.primitiveBuffer;
    this.sceneInstance = scene.instanceBuffer;
    this.sceneTransform = scene.transformBuffer;
    this.sceneMaterial = scene.materialBuffer;
    this.sceneCapacity = scene.inspect().capacity;
    this.updateCount += 1;
    return ok$1(void 0);
  }
  inspect() {
    return {
      topologyRevision: this.plan?.revision,
      candidateCount: this.plan?.candidateCount ?? 0,
      batchCount: this.plan?.batches.length ?? 0,
      visibleCapacity: this.plan?.visibleCapacity ?? 0,
      candidateCapacity: this.candidateCapacity,
      visibleBufferCapacity: this.visibleBufferCapacity,
      batchCapacity: this.batchCapacity,
      indirectCapacity: this.indirectCapacity,
      updateCount: this.updateCount,
      uploadBytes: this.uploadBytes,
      candidateUploadBytes: this.candidateUploadBytes,
      lodPayloadUploadBytes: this.lodPayloadUploadBytes,
      batchUploadBytes: this.batchUploadBytes,
      viewConstantsUploadBytes: this.viewConstantsUploadBytes,
      bindGroupCreates: this.bindGroupCreates,
      bufferRebuilds: this.bufferRebuilds,
      resourceGeneration: this.resourceGeneration,
      resourceAllocation: this.allocationLedger.inspect()
    };
  }
  get visibleBuffer() {
    return this.buffers?.visible;
  }
  get indirectBuffer() {
    return this.buffers?.indirect;
  }
  get overflowBuffer() {
    return this.buffers?.counters;
  }
  get overflowByteOffset() {
    return 4;
  }
  /** Read selected levels written by the GPU cull pass for the last submit. */
  readLodSelection() {
    const inFlight = this.lodSelectionReadback;
    if (inFlight !== void 0) return inFlight.promise;
    const buffers = this.buffers;
    const plan = this.plan;
    const copy = this.telemetryPending;
    if (buffers === void 0 || plan === void 0 || copy === void 0 || copy.buffers !== buffers || copy.plan !== plan || copy.resourceGeneration !== this.resourceGeneration || typeof buffers.lodReadback.mapAsync !== "function" || buffers.lodReadback.mapState !== "unmapped") {
      return Promise.resolve(this.lodSelection);
    }
    const promise = this.readLodSelectionCopy(buffers, plan, copy).finally(() => {
      if (this.lodSelectionReadback?.promise === promise) this.lodSelectionReadback = void 0;
    });
    this.lodSelectionReadback = { promise };
    return promise;
  }
  async readLodSelectionCopy(buffers, plan, copy) {
    const mapped = await buffers.lodReadback.mapAsync(GPU_BUFFER_USAGE_MAP_READ);
    if (!mapped.ok) return void 0;
    const range = mapped.value.getMappedRange();
    if (!range.ok) {
      mapped.value.unmap();
      return void 0;
    }
    try {
      const values = new DataView(range.value);
      let visible = 0;
      let overflow = false;
      let geometryWork = 0;
      let rootGeometryWork = 0;
      const actualMembers = [];
      const histogram = /* @__PURE__ */ new Map();
      for (let batchIndex = 0; batchIndex < plan.batches.length; batchIndex += 1) {
        const offset = batchIndex * COUNTER_STRIDE;
        const batchOverflow = values.getUint32(offset + 4, true) !== 0;
        const batchVisible = batchOverflow ? 0 : Math.min(
          values.getUint32(offset, true),
          plan.batches[batchIndex]?.visibleCapacity ?? 0
        );
        const batch = plan.batches[batchIndex];
        const admitted = batch?.candidates.filter(
          (candidate) => candidate.submitAdmission !== false
        ) ?? [];
        for (let visibleIndex = 0; visibleIndex < batchVisible; visibleIndex += 1) {
          const visibleOffset = this.batchCapacity * COUNTER_STRIDE + ((batch?.visibleBase ?? 0) + visibleIndex) * 16;
          const projectionIndex = values.getUint32(visibleOffset, true);
          const primitiveIndex = values.getUint32(visibleOffset + 8, true) - 1;
          const generation = values.getUint32(visibleOffset + 12, true);
          const candidate = admitted[projectionIndex];
          if (batch !== void 0 && candidate !== void 0 && candidate.primitiveIndex === primitiveIndex && candidate.generation === generation) {
            actualMembers.push({
              batchId: batch.batchId,
              primitiveIndex,
              generation,
              drawItemIndex: candidate.drawItemIndex,
              instanceOrdinal: candidate.instanceOrdinal
            });
          }
        }
        visible += batchVisible;
        overflow ||= batchOverflow;
        geometryWork += values.getUint32(offset + GEOMETRY_WORK_COUNTER_OFFSET * 4, true);
        rootGeometryWork += values.getUint32(offset + ROOT_GEOMETRY_WORK_COUNTER_OFFSET * 4, true);
        for (let level = 0; level < LOD_ROW_CAPACITY; level += 1) {
          const count = values.getUint32(offset + (2 + level) * 4, true);
          if (count > 0) histogram.set(level, (histogram.get(level) ?? 0) + count);
        }
      }
      if (this.buffers !== buffers || this.plan !== plan || this.resourceGeneration !== copy.resourceGeneration || this.telemetryPending !== copy) {
        return void 0;
      }
      const candidateCount = plan.candidateCount;
      const surfaceReadback = copy.surfaceReadbackSnapshot?.();
      const surfaceIndirectReadback = surfaceReadback === void 0 ? void 0 : decodeSurfaceIndirectParameters({
        bytes: range.value,
        byteOffset: copy.indirectReadbackOffset,
        byteLength: this.indirectCapacity * INDIRECT_COMMAND_BYTES,
        indirectBufferIdentity: copy.indirectBufferIdentity,
        recording: surfaceReadback
      });
      this.lodSelection = Object.freeze({
        resourceGeneration: copy.resourceGeneration,
        candidateCount,
        batchCount: plan.batches.length,
        // Selector-only batches remain in the plan/readback but the production
        // raster skips them. Report the actual nonzero-admission command count
        // so a benchmark cannot mistake selector batches for raster draws.
        indirectDrawCount: admittedRasterBatchCount(plan),
        visible,
        // A LOD histogram counts candidates that reached the selector, while
        // `visible` is the actual compacted submission count. Occlusion is the
        // difference between those candidate/visibility totals; using the
        // histogram here would mislabel a visible candidate dropped only by an
        // indirect-capacity overflow as occluded.
        occluded: Math.max(0, candidateCount - visible),
        overflow,
        lodHistogram: Object.freeze(
          [...histogram.entries()].sort(([left], [right]) => left - right).map(([level, count]) => Object.freeze({ level, count }))
        ),
        batches: Object.freeze(
          plan.batches.map((batch, batchIndex) => {
            const offset = batchIndex * COUNTER_STRIDE;
            const batchHistogram = /* @__PURE__ */ new Map();
            for (let level = 0; level < LOD_ROW_CAPACITY; level += 1) {
              const count = values.getUint32(offset + (2 + level) * 4, true);
              if (count > 0) batchHistogram.set(level, count);
            }
            const batchOverflow = values.getUint32(offset + 4, true) !== 0;
            const batchVisible = batchOverflow ? 0 : Math.min(values.getUint32(offset, true), batch.visibleCapacity);
            return Object.freeze({
              batchId: batch.batchId,
              candidateCount: batch.candidates.length,
              visible: batchVisible,
              occluded: Math.max(0, batch.candidates.length - batchVisible),
              overflow: batchOverflow,
              lodHistogram: Object.freeze(
                [...batchHistogram.entries()].sort(([left], [right]) => left - right).map(([level, count]) => Object.freeze({ level, count }))
              )
            });
          })
        ),
        geometryWork,
        rootGeometryWork,
        actualMembers: Object.freeze(actualMembers),
        ...surfaceReadback === void 0 ? {} : { surfaceReadback },
        ...surfaceIndirectReadback === void 0 ? {} : surfaceIndirectReadback.ok ? { surfaceIndirectParameters: surfaceIndirectReadback.value } : { surfaceIndirectReadbackError: surfaceIndirectReadback.error },
        ...copy.submit === void 0 ? {} : { submit: copy.submit }
      });
      this.telemetryPending = void 0;
      return this.lodSelection;
    } finally {
      mapped.value.unmap();
    }
  }
  addPasses(builder, labelPrefix = "gpu-driven", includeCompute = true, surfaceSubmissionObservation, executeIf) {
    const buffers = this.buffers;
    const bindGroup = this.bindGroup;
    const plan = this.plan;
    if (buffers === void 0 || bindGroup === void 0 || plan === void 0) {
      return err(
        new RenderGraphError({
          code: "resource-descriptor-invalid",
          expected: "GpuDrivenView.update(...) precedes addPasses(...)",
          hint: "publish the current SubmissionPlan and view planes first",
          detail: {
            resourceLabel: "gpu-driven-view",
            field: "state",
            expected: "updated",
            actual: "not-updated"
          }
        })
      );
    }
    const importBuffer = (name, buffer, size, usage) => builder.importBuffer(name, { size, usage }, () => buffer);
    const scenePrefix = labelPrefix === "gpu-driven" ? "gpu-scene" : `${labelPrefix}.scene`;
    const primitive = importBuffer(
      `${scenePrefix}.primitive`,
      this.scenePrimitive,
      this.sceneCapacity * GPU_SCENE_LAYOUTS.primitive.stride,
      GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_DST | GPU_BUFFER_USAGE_COPY_SRC
    );
    if (!primitive.ok) return primitive;
    const transform = importBuffer(
      `${scenePrefix}.transform`,
      this.sceneTransform,
      this.sceneCapacity * GPU_SCENE_LAYOUTS.transform.stride,
      GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_DST | GPU_BUFFER_USAGE_COPY_SRC
    );
    if (!transform.ok) return transform;
    const instance = importBuffer(
      `${scenePrefix}.instance`,
      this.sceneInstance,
      this.sceneCapacity * GPU_SCENE_LAYOUTS.instance.stride,
      GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_DST | GPU_BUFFER_USAGE_COPY_SRC
    );
    if (!instance.ok) return instance;
    const material = importBuffer(
      `${scenePrefix}.material`,
      this.sceneMaterial,
      this.sceneCapacity * GPU_SCENE_LAYOUTS.material.stride,
      GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_DST | GPU_BUFFER_USAGE_COPY_SRC
    );
    if (!material.ok) return material;
    const candidates = importBuffer(
      `${labelPrefix}.candidates`,
      buffers.candidates,
      this.candidateCapacity * CANDIDATE_STRIDE,
      GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_DST
    );
    if (!candidates.ok) return candidates;
    const batches = importBuffer(
      `${labelPrefix}.batches`,
      buffers.batches,
      this.batchCapacity * BATCH_STRIDE + this.candidateCapacity * 4,
      GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_DST
    );
    if (!batches.ok) return batches;
    const view = importBuffer(
      `${labelPrefix}.view`,
      buffers.view,
      VIEW_BYTES,
      GPU_BUFFER_USAGE_UNIFORM | GPU_BUFFER_USAGE_COPY_DST
    );
    if (!view.ok) return view;
    const counters = importBuffer(
      `${labelPrefix}.counters`,
      buffers.counters,
      this.batchCapacity * COUNTER_STRIDE,
      GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_SRC
    );
    if (!counters.ok) return counters;
    const lodReadback = importBuffer(
      `${labelPrefix}.lod-selection-readback`,
      buffers.lodReadback,
      this.batchCapacity * COUNTER_STRIDE + this.visibleBufferCapacity * 16 + this.indirectCapacity * INDIRECT_COMMAND_BYTES,
      GPU_BUFFER_USAGE_MAP_READ | GPU_BUFFER_USAGE_COPY_DST
    );
    if (!lodReadback.ok) return lodReadback;
    const visible = importBuffer(
      `${labelPrefix}.visible`,
      buffers.visible,
      this.visibleBufferCapacity * 16,
      GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_SRC
    );
    if (!visible.ok) return visible;
    const indirect = importBuffer(
      `${labelPrefix}.indirect`,
      buffers.indirect,
      this.indirectCapacity * 20,
      GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_INDIRECT | GPU_BUFFER_USAGE_COPY_SRC
    );
    if (!indirect.ok) return indirect;
    if (!includeCompute) {
      return ok$1({
        visible: visible.value,
        primitive: primitive.value,
        instance: instance.value,
        transform: transform.value,
        material: material.value,
        indirect: indirect.value,
        overflow: counters.value
      });
    }
    const reset = builder.addComputePass(`${labelPrefix}.view-reset`, {
      accesses: [
        { resource: view.value, usage: "uniform-read" },
        { resource: counters.value, usage: "storage-read-write" }
      ],
      ...executeIf === void 0 ? {} : { executeIf },
      encode: ({ pass }) => {
        pass.setPipeline(this.resetPipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(Math.ceil(Math.max(1, plan.batches.length) / WORKGROUP_SIZE));
      }
    });
    if (!reset.ok) return reset;
    const cull = builder.addComputePass(`${labelPrefix}.frustum-compact`, {
      accesses: [
        { resource: primitive.value, usage: "storage-read" },
        { resource: instance.value, usage: "storage-read" },
        { resource: transform.value, usage: "storage-read" },
        { resource: candidates.value, usage: "storage-read" },
        { resource: batches.value, usage: "storage-read" },
        { resource: view.value, usage: "uniform-read" },
        { resource: counters.value, usage: "storage-read-write" },
        { resource: visible.value, usage: "storage-read-write" }
      ],
      ...executeIf === void 0 ? {} : { executeIf },
      encode: ({ pass }) => {
        pass.setPipeline(this.cullPipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(Math.ceil(Math.max(1, plan.candidateCount) / WORKGROUP_SIZE));
      }
    });
    if (!cull.ok) return cull;
    const finalize = builder.addComputePass(`${labelPrefix}.finalize-indirect`, {
      accesses: [
        { resource: batches.value, usage: "storage-read" },
        { resource: view.value, usage: "uniform-read" },
        { resource: counters.value, usage: "storage-read" },
        { resource: indirect.value, usage: "storage-read-write" }
      ],
      ...executeIf === void 0 ? {} : { executeIf },
      encode: ({ pass }) => {
        pass.setPipeline(this.finalizePipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(Math.ceil(Math.max(1, plan.batches.length) / WORKGROUP_SIZE));
      }
    });
    if (!finalize.ok) return finalize;
    const graphResourceGeneration = this.resourceGeneration;
    const indirectReadbackOffset = this.batchCapacity * COUNTER_STRIDE + this.visibleBufferCapacity * 16;
    const indirectBufferIdentity = getOpaqueResourceIdentity(buffers.indirect);
    const readback = builder.addCopyPass(`${labelPrefix}.lod-selection-readback`, {
      accesses: [
        { resource: counters.value, usage: "copy-src" },
        { resource: visible.value, usage: "copy-src" },
        { resource: indirect.value, usage: "copy-src" },
        { resource: lodReadback.value, usage: "copy-dst" }
      ],
      ...executeIf === void 0 ? {} : { executeIf },
      encode: ({ encoder, resources }) => {
        const mapState = buffers.lodReadback.mapState;
        if (mapState !== void 0 && mapState !== "unmapped") return;
        encoder.copyBufferToBuffer(
          resources.buffer(counters.value).unwrap(),
          resources.buffer(lodReadback.value).unwrap(),
          this.batchCapacity * COUNTER_STRIDE
        );
        encoder.copyBufferToBuffer(
          resources.buffer(visible.value).unwrap(),
          0,
          resources.buffer(lodReadback.value).unwrap(),
          this.batchCapacity * COUNTER_STRIDE,
          this.visibleBufferCapacity * 16
        );
        encoder.copyBufferToBuffer(
          resources.buffer(indirect.value).unwrap(),
          0,
          resources.buffer(lodReadback.value).unwrap(),
          indirectReadbackOffset,
          this.indirectCapacity * INDIRECT_COMMAND_BYTES
        );
        const submittedPlan = this.plan;
        if (this.buffers === buffers && submittedPlan !== void 0 && this.resourceGeneration === graphResourceGeneration) {
          const submittedObservation = surfaceSubmissionObservation?.();
          this.telemetryPending = {
            buffers,
            plan: submittedPlan,
            resourceGeneration: graphResourceGeneration,
            indirectBufferIdentity,
            indirectReadbackOffset,
            ...submittedObservation === void 0 ? {} : {
              surfaceReadbackSnapshot: () => submittedObservation.gpuReadbackSnapshot()
            },
            ...this.telemetrySubmit === void 0 ? {} : { submit: this.telemetrySubmit }
          };
        }
      }
    });
    if (!readback.ok) return readback;
    return ok$1({
      visible: visible.value,
      primitive: primitive.value,
      instance: instance.value,
      transform: transform.value,
      material: material.value,
      indirect: indirect.value,
      overflow: counters.value
    });
  }
  dispose() {
    const buffers = [
      ...this.supersededBuffers,
      ...this.buffers === void 0 ? [] : [this.buffers]
    ];
    this.supersededBuffers = [];
    this.buffers = void 0;
    this.bindGroup = void 0;
    this.plan = void 0;
    this.visibleBufferCapacity = 0;
    this.scenePrimitive = void 0;
    this.sceneInstance = void 0;
    this.sceneTransform = void 0;
    this.sceneMaterial = void 0;
    this.sceneCapacity = 0;
    this.telemetryPending = void 0;
    this.telemetrySubmit = void 0;
    this.lodSelectionReadback = void 0;
    this.lodSelection = void 0;
    for (const generation of buffers) this.retireGeneration(generation);
    this.destroyAfterSubmittedWork(buffers);
    void this.pipelineLayout;
  }
  /**
   * @internal
   * Accept the current buffer generation after its typed graph compiles.
   * Superseded imports stay alive while the last-known-good graph remains
   * executable, then retire behind the queue fence only after promotion.
   */
  _commitResourceReplacement() {
    const buffers = this.supersededBuffers;
    if (buffers.length === 0) return;
    this.supersededBuffers = [];
    this.destroyAfterSubmittedWork(buffers);
  }
  /**
   * @internal
   * Grow every view buffer after a GPU overflow was observed. The next
   * `update` rewrites the same plan into the replacement generation, so the
   * failed generation cannot be reused even when topology identity is stable.
   */
  _recoverFromOverflow() {
    if (this.buffers === void 0) return ok$1(void 0);
    return this.rebuildBuffers(
      this.candidateCapacity * 2,
      this.visibleBufferCapacity * 2,
      this.batchCapacity * 2,
      this.indirectCapacity * 2
    );
  }
  rebuildBuffers(candidateCapacity, visibleCapacity, batchCapacity, indirectCapacity) {
    const nextCandidate = nextCapacity(candidateCapacity);
    const nextVisible = nextCapacity(visibleCapacity);
    const nextBatch = nextCapacity(batchCapacity);
    const nextIndirect = nextCapacity(indirectCapacity);
    const created = {};
    const createdTokens = [];
    const allocate = (name, size, usage) => {
      const buffer = this.device.createBuffer({
        label: `gpu-driven-view-${name}`,
        size,
        usage,
        mappedAtCreation: false
      });
      if (!buffer.ok) return buffer;
      created[name] = buffer.value;
      const token = this.allocationLedger.allocate(size);
      this.allocationTokens.set(buffer.value, token);
      createdTokens.push(token);
      return ok$1(void 0);
    };
    const storage = GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_SRC;
    const requests = [
      {
        name: "candidates",
        size: nextCandidate * CANDIDATE_STRIDE,
        usage: storage | GPU_BUFFER_USAGE_COPY_DST,
        storage: true
      },
      {
        name: "batches",
        size: nextBatch * BATCH_STRIDE + nextCandidate * 4,
        usage: storage | GPU_BUFFER_USAGE_COPY_DST,
        storage: true
      },
      {
        name: "view",
        size: VIEW_BYTES,
        usage: GPU_BUFFER_USAGE_UNIFORM | GPU_BUFFER_USAGE_COPY_DST,
        storage: false
      },
      { name: "counters", size: nextBatch * COUNTER_STRIDE, usage: storage, storage: true },
      { name: "visible", size: nextVisible * 16, usage: storage, storage: true },
      {
        name: "indirect",
        size: nextIndirect * 20,
        usage: storage | GPU_BUFFER_USAGE_INDIRECT,
        storage: true
      },
      {
        name: "lodReadback",
        size: nextBatch * COUNTER_STRIDE + nextVisible * 16 + nextIndirect * INDIRECT_COMMAND_BYTES,
        usage: GPU_BUFFER_USAGE_MAP_READ | GPU_BUFFER_USAGE_COPY_DST,
        storage: false
      }
    ];
    const maxBufferSize = Number(this.device.limits.maxBufferSize);
    const maxStorageBufferBindingSize = Number(this.device.limits.maxStorageBufferBindingSize);
    for (const request of requests) {
      const limit = request.storage ? maxStorageBufferBindingSize : maxBufferSize;
      if (!Number.isFinite(limit) || limit <= 0 || request.size <= limit) continue;
      return err(
        new RhiError({
          code: "limit-exceeded",
          expected: `GPU-driven ${request.name} buffer (${request.size} B) fits within ${request.storage ? "device.limits.maxStorageBufferBindingSize" : "device.limits.maxBufferSize"} (${limit} B)`,
          hint: "reduce the visible/candidate workload or split the GPU-driven buffer plan before retrying",
          detail: {
            maxStorageBufferBindingSize: limit,
            requestedBytes: request.size
          }
        })
      );
    }
    for (const request of requests) {
      const result = allocate(request.name, request.size, request.usage);
      if (!result.ok) {
        for (const buffer of Object.values(created)) this.device.destroyBuffer(buffer);
        for (const token of createdTokens) this.allocationLedger.rollback(token);
        return result;
      }
    }
    if (this.buffers !== void 0) {
      this.supersededBuffers.push(this.buffers);
      this.retireGeneration(this.buffers);
    }
    this.buffers = created;
    this.candidateCapacity = nextCandidate;
    this.visibleBufferCapacity = nextVisible;
    this.batchCapacity = nextBatch;
    this.indirectCapacity = nextIndirect;
    this.bufferRebuilds += 1;
    this.bindGroup = void 0;
    this.telemetryPending = void 0;
    return ok$1(void 0);
  }
  destroyAfterSubmittedWork(generations) {
    if (generations.length === 0) return;
    const release = () => {
      for (const buffers of generations) {
        for (const buffer of Object.values(buffers)) {
          this.device.destroyBuffer(buffer);
          const token = this.allocationTokens.get(buffer);
          if (token !== void 0) this.allocationLedger.release(token);
        }
      }
    };
    void this.device.queue.onSubmittedWorkDone().then(release, release);
  }
  retireGeneration(generation) {
    for (const buffer of Object.values(generation)) {
      const token = this.allocationTokens.get(buffer);
      if (token !== void 0) this.allocationLedger.retire(token);
    }
  }
};

// src/gpu-driven/shadow-views.ts
function identityKey(identity) {
  return `${identity.kind}:${identity.index}:${identity.face ?? ""}`;
}
function shadowViewIdentityKey(identity) {
  return identityKey(identity);
}
function validateIdentity(identity) {
  if (!Number.isInteger(identity.index) || identity.index < 0) {
    return new RhiError({
      code: "internal-error",
      expected: "shadow view index is a non-negative integer",
      hint: "publish a stable directional cascade, point face, or spot atlas index"
    });
  }
  if (identity.face !== void 0 && (!Number.isInteger(identity.face) || identity.face < 0 || identity.face > 5)) {
    return new RhiError({
      code: "internal-error",
      expected: "point shadow face is an integer from 0 through 5",
      hint: "publish a valid cube face for the point shadow view"
    });
  }
  return void 0;
}
function copyPlanes(planes) {
  if (planes.length < 24) {
    return err(
      new RhiError({
        code: "internal-error",
        expected: "shadow view publishes six clipping planes",
        hint: "provide a 24-float frustum plane array before updating the view"
      })
    );
  }
  return ok$1(new Float32Array(planes.subarray(0, 24)));
}
function samePlanes(left, right) {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}
function sameProjectedHeights(left, right) {
  if (left === right) return true;
  if (left === void 0 || right === void 0 || left.size !== right.size) return false;
  for (const [primitiveIndex, height] of left) {
    if (!Object.is(right.get(primitiveIndex), height)) return false;
  }
  return true;
}
function sceneBuffers(scene) {
  return {
    primitive: scene.primitiveBuffer,
    instance: scene.instanceBuffer,
    transform: scene.transformBuffer,
    material: scene.materialBuffer
  };
}
function sameSceneBuffers(left, right) {
  return left.primitive === right.primitive && left.instance === right.instance && left.transform === right.transform && left.material === right.material;
}
function candidateIndices(values) {
  if (values === void 0) return ok$1(void 0);
  const entries = Array.from(values);
  for (const entry of entries) {
    if (!Number.isInteger(entry) || entry < 0) {
      return err(
        new RhiError({
          code: "internal-error",
          expected: "shadow candidate primitive indices are non-negative integers",
          hint: "derive ShadowCaster membership from the shared BatchTopology channel index"
        })
      );
    }
  }
  return ok$1(Object.freeze([...new Set(entries)].sort((left, right) => left - right)));
}
function projectPlan(source, primitiveIndices) {
  if (primitiveIndices === void 0) return source;
  const membership = buildSubmissionCandidateMembership(source);
  const candidatesByBatch = /* @__PURE__ */ new Map();
  for (const primitiveIndex of primitiveIndices) {
    for (const entry of membership.byPrimitiveIndex.get(primitiveIndex) ?? []) {
      const candidates = candidatesByBatch.get(entry.batchId) ?? [];
      candidates.push(entry.candidate);
      candidatesByBatch.set(entry.batchId, candidates);
    }
  }
  const immutableCandidates = /* @__PURE__ */ new Map();
  for (const [batchId, candidates] of candidatesByBatch) {
    immutableCandidates.set(batchId, Object.freeze(candidates));
  }
  return buildBatchAlignedSubmission(source, immutableCandidates);
}
function candidateSignature(primitiveIndices) {
  return primitiveIndices === void 0 ? "*" : primitiveIndices.join(",");
}
function shadowViewLabelPrefix(identity) {
  switch (identity.kind) {
    case "directional":
      return `gpu-driven.shadow.directional-cascade-${identity.index}`;
    case "point":
      return `gpu-driven.shadow.point-cube-face-${identity.index}${identity.face === void 0 ? "" : `-${identity.face}`}`;
    case "spot":
      return `gpu-driven.shadow.spot-atlas-${identity.index}`;
  }
}
function shadowViewRasterAccesses(resources) {
  return Object.freeze([
    { resource: resources.primitive, usage: "storage-read" },
    { resource: resources.instance, usage: "storage-read" },
    { resource: resources.transform, usage: "storage-read" },
    { resource: resources.material, usage: "storage-read" },
    { resource: resources.visible, usage: "storage-read" },
    { resource: resources.indirect, usage: "indirect-read" }
  ]);
}
function passNames(identity) {
  const prefix = shadowViewLabelPrefix(identity);
  return Object.freeze([
    `${prefix}.view-reset`,
    `${prefix}.frustum-compact`,
    `${prefix}.finalize-indirect`
  ]);
}
function graphStateError(identity) {
  return new RenderGraphError({
    code: "resource-descriptor-invalid",
    expected: "ShadowViewStatePool.update(...) precedes project(...)",
    hint: "publish the shared scene, topology channel, and view planes before graph projection",
    detail: {
      resourceLabel: identityKey(identity),
      field: "state",
      expected: "updated",
      actual: "not-updated"
    }
  });
}
var ShadowViewStatePool = class _ShadowViewStatePool {
  constructor(device, shaderModuleFactory) {
    this.device = device;
    this.shaderModuleFactory = shaderModuleFactory;
  }
  device;
  shaderModuleFactory;
  records = /* @__PURE__ */ new Map();
  activeKeys = /* @__PURE__ */ new Set();
  retiring = /* @__PURE__ */ new Map();
  pendingPublication = /* @__PURE__ */ new Set();
  static create(input) {
    return ok$1(new _ShadowViewStatePool(input.device, input.shaderModuleFactory));
  }
  update(input) {
    const identityError = validateIdentity(input.identity);
    if (identityError !== void 0) return err(identityError);
    const planes = copyPlanes(input.planes);
    if (!planes.ok) return planes;
    const indices = candidateIndices(input.candidatePrimitiveIndices);
    if (!indices.ok) return indices;
    const key = identityKey(input.identity);
    this.activeKeys.add(key);
    this.retiring.delete(key);
    const previous = this.records.get(key);
    const token = input.cacheToken ?? "";
    const contentRevision = input.scene.contentRevision;
    const signature = candidateSignature(indices.value);
    const currentSceneBuffers = sceneBuffers(input.scene);
    const structureMatches = previous !== void 0 && !previous.invalidated && previous.sourcePlan === input.sourcePlan && previous.scene === input.scene && previous.published && previous.cacheToken === token && previous.contentRevision === contentRevision && previous.candidateSignature === signature && sameSceneBuffers(previous.sceneBuffers, currentSceneBuffers) && previous.resourceGeneration === previous.view.inspect().resourceGeneration;
    const cacheHit = structureMatches && previous !== void 0 && samePlanes(previous.planes, planes.value) && sameProjectedHeights(previous.lodProjectedHeights, input.lodProjectedHeights);
    if (cacheHit && previous !== void 0) {
      previous.cache = "hit";
      return ok$1({
        identity: previous.identity,
        cache: "hit",
        generation: previous.generation,
        sourcePlan: previous.sourcePlan,
        plan: previous.plan,
        view: previous.view
      });
    }
    const selectedPlan = structureMatches && previous !== void 0 ? previous.plan : projectPlan(input.sourcePlan, indices.value);
    let view = previous?.view;
    if (view === void 0) {
      const created = GpuDrivenView.create({
        device: this.device,
        shaderModuleFactory: this.shaderModuleFactory,
        labelPrefix: `${shadowViewLabelPrefix(input.identity)}.view`
      });
      if (!created.ok) return created;
      view = created.value;
    }
    const updated = view.update(selectedPlan, input.scene, planes.value, input.lodProjectedHeights);
    if (!updated.ok) return updated;
    const generation = (previous?.generation ?? 0) + 1;
    const record = {
      identity: Object.freeze({ ...input.identity }),
      view,
      sourcePlan: input.sourcePlan,
      plan: selectedPlan,
      scene: input.scene,
      cacheToken: token,
      contentRevision,
      planes: planes.value,
      candidateSignature: signature,
      ...input.lodProjectedHeights === void 0 ? {} : { lodProjectedHeights: input.lodProjectedHeights },
      generation,
      cache: "invalidated",
      invalidated: false,
      published: false,
      resourceGeneration: view.inspect().resourceGeneration,
      sceneBuffers: currentSceneBuffers
    };
    this.records.set(key, record);
    this.pendingPublication.add(key);
    return ok$1({
      identity: record.identity,
      cache: "invalidated",
      generation,
      sourcePlan: record.sourcePlan,
      plan: record.plan,
      view: record.view
    });
  }
  project(builder, identity, forceCompute = false) {
    const record = this.records.get(identityKey(identity));
    if (record === void 0) return err(graphStateError(identity));
    const cacheHit = record.cache === "hit" && !record.invalidated;
    const includeCompute = forceCompute || !cacheHit;
    let forceComputePending = forceCompute;
    let lastFrame;
    let executeForFrame = false;
    const executeCompute = (frame) => {
      if (frame !== lastFrame) {
        lastFrame = frame;
        const currentRecord = this.records.get(identityKey(record.identity));
        executeForFrame = forceComputePending || currentRecord === void 0 || currentRecord.cache !== "hit" || currentRecord.invalidated;
        forceComputePending = false;
      }
      return executeForFrame;
    };
    const projected = record.view.addPasses(
      builder,
      shadowViewLabelPrefix(record.identity),
      includeCompute,
      void 0,
      includeCompute ? executeCompute : void 0
    );
    if (!projected.ok) return projected;
    return ok$1({
      identity: record.identity,
      cache: cacheHit ? "hit" : "invalidated",
      generation: record.generation,
      plan: record.plan,
      view: record.view,
      passNames: includeCompute ? passNames(record.identity) : Object.freeze([]),
      graphResources: projected.value
    });
  }
  invalidate(identity) {
    if (identity === void 0) {
      for (const record2 of this.records.values()) {
        record2.invalidated = true;
        record2.cache = "invalidated";
      }
      return;
    }
    const record = this.records.get(identityKey(identity));
    if (record !== void 0) {
      record.invalidated = true;
      record.cache = "invalidated";
    }
  }
  cacheState(identity) {
    const record = this.records.get(identityKey(identity));
    if (record === void 0) return void 0;
    return record.invalidated ? "invalidated" : record.cache;
  }
  cacheHit(identity) {
    return this.activeKeys.has(identityKey(identity)) && this.cacheState(identity) === "hit";
  }
  isActive(identity) {
    return this.activeKeys.has(identityKey(identity));
  }
  submission(identity) {
    const key = identityKey(identity);
    if (!this.activeKeys.has(key)) return void 0;
    const record = this.records.get(key);
    if (record === void 0) return void 0;
    return {
      identity: record.identity,
      cache: record.cache,
      generation: record.generation,
      plan: record.plan,
      view: record.view
    };
  }
  /**
   * Keep only the active view identities for the current frame. Removed light
   * views are disposed through their own queue-fenced resource owner instead
   * of remaining in inspection or changing the compiled topology forever.
   */
  retain(identities) {
    const active = new Set(identities.map(identityKey));
    for (const [key, record] of this.records) {
      if (active.has(key)) continue;
      this.activeKeys.delete(key);
      this.retiring.set(key, record);
    }
  }
  /** @internal Commit every view resource replacement after a successful submit. */
  _commitResourceReplacement() {
    for (const record of this.records.values()) record.view._commitResourceReplacement();
    for (const key of this.pendingPublication) {
      const record = this.records.get(key);
      if (record !== void 0) record.published = true;
    }
    this.pendingPublication.clear();
    for (const [key, record] of this.retiring) {
      record.view.dispose();
      this.records.delete(key);
      this.retiring.delete(key);
    }
  }
  /**
   * Abort a staged frame before its queue submit barrier. A candidate view
   * must not become a cache hit merely because graph encoding succeeded: the
   * next frame has to rebuild it after any submit/finish failure.
   */
  _abortResourceReplacement() {
    for (const key of this.pendingPublication) {
      const record = this.records.get(key);
      if (record === void 0) continue;
      record.published = false;
      record.invalidated = true;
      record.cache = "invalidated";
    }
    this.pendingPublication.clear();
  }
  inspect() {
    return Object.freeze(
      [...this.records.values()].filter((record) => this.activeKeys.has(identityKey(record.identity))).sort(
        (left, right) => identityKey(left.identity).localeCompare(identityKey(right.identity))
      ).map((record) => {
        const view = record.view.inspect();
        return Object.freeze({
          identity: record.identity,
          cache: record.cache,
          generation: record.generation,
          sourceRevision: record.sourcePlan.revision,
          candidateCount: record.plan.candidateCount,
          batchCount: record.plan.batches.length,
          resourceGeneration: view.resourceGeneration
        });
      })
    );
  }
  dispose() {
    const views = new Set([...this.records.values()].map((record) => record.view));
    for (const view of views) view.dispose();
    this.records.clear();
    this.activeKeys.clear();
    this.retiring.clear();
    this.pendingPublication.clear();
  }
};

// src/record/shadow-pass.ts
var SHADOW_CASTER_SLOT_STRIDE = 256;
var SHADOW_CASTER_BUFFER_SIZE = SHADOW_CASTER_SLOT_STRIDE * 8;
function directionalShadowCasterOffset(cascadeIndex) {
  return SHADOW_CASTER_SLOT_STRIDE * cascadeIndex;
}
function spotShadowCasterOffset(tile) {
  return SHADOW_CASTER_SLOT_STRIDE * (4 + tile);
}
function writeShadowCasterUniforms(queue, buffer, lights) {
  for (let cascade = 0; cascade < 4; cascade += 1) {
    const written = queue.writeBuffer(
      buffer,
      directionalShadowCasterOffset(cascade),
      new Uint32Array([cascade, 0, 0, 0])
    );
    if (!written.ok) throw written.error;
  }
  for (const snapshot of lights.spot) {
    const tile = snapshot.shadowAtlasTile;
    if (tile < 0 || tile >= 4 || snapshot.lightViewProj === void 0) continue;
    const offset = spotShadowCasterOffset(tile);
    const header = queue.writeBuffer(buffer, offset, new Uint32Array([0, 1, 0, 0]));
    if (!header.ok) throw header.error;
    const matrix = queue.writeBuffer(buffer, offset + 16, snapshot.lightViewProj);
    if (!matrix.ok) throw matrix.error;
  }
}
function ensureTypedShadowViewBg(c, viewOffset, cascadeOffset, variant) {
  const { runtime, frameState, pipelineState } = c;
  const shadowSampler = pipelineState.perPassResources.shadowSampler;
  if (shadowSampler === null) return null;
  const extendedLighting = pipelineState.extendedLightingAvailable ?? false;
  const iesProfileTextureView = pipelineState.iesProfileTextureView;
  const cookieTextureView = pipelineState.cookieTextureView;
  const cookieMatrixBuffer = pipelineState.cookieMatrixBuffer;
  const ltcLambertTextureView = pipelineState.ltcLambertTextureView;
  const ltcGgxTextureView = pipelineState.ltcGgxTextureView;
  const extendedLightingCacheKeys = [];
  const extendedLightingEntries = [];
  if (extendedLighting) {
    if (iesProfileTextureView === void 0 || cookieTextureView === void 0 || cookieMatrixBuffer === void 0 || ltcLambertTextureView === void 0 || ltcGgxTextureView === void 0) {
      return null;
    }
    extendedLightingCacheKeys.push(
      pipelineState.defaultSampler,
      iesProfileTextureView,
      cookieTextureView,
      ltcLambertTextureView,
      ltcGgxTextureView,
      cookieMatrixBuffer
    );
    extendedLightingEntries.push(
      {
        binding: 9,
        resource: { kind: "sampler", value: pipelineState.defaultSampler }
      },
      {
        binding: 11,
        resource: { kind: "textureView", value: iesProfileTextureView }
      },
      {
        binding: 12,
        resource: { kind: "textureView", value: cookieTextureView }
      },
      {
        binding: 13,
        resource: { kind: "textureView", value: ltcLambertTextureView }
      },
      {
        binding: 14,
        resource: { kind: "textureView", value: ltcGgxTextureView }
      },
      {
        binding: 15,
        resource: {
          kind: "buffer",
          value: { buffer: cookieMatrixBuffer, size: COOKIE_MATRIX_BYTES }
        }
      }
    );
  }
  const projectorAvailable = pipelineState.projectorAvailable !== false;
  const lowLimitCloudBindings = !extendedLighting && !projectorAvailable;
  try {
    return getOrCreateFromChain(
      frameState.viewBindGroupCache,
      [
        pipelineState.viewUniformBuffer,
        pipelineState.shadowFallbackTextureView,
        shadowSampler,
        pipelineState.shadowAtlasFallbackTextureView,
        pipelineState.shadowParamsBuffer,
        pipelineState.shadowCasterCascadeBuffer,
        pipelineState.shadowFallbackTextureView,
        ...extendedLighting ? extendedLightingCacheKeys : projectorAvailable ? [pipelineState.defaultWhiteTextureView, pipelineState.defaultSampler] : [],
        pipelineState.pointsLinesViewBuffer ?? pipelineState.viewUniformBuffer,
        ...lowLimitCloudBindings ? [] : [pipelineState.defaultWhiteTextureView, pipelineState.defaultSampler]
      ],
      variant,
      () => {
        const created = runtime.device.createBindGroup({
          label: variant,
          layout: pipelineState.viewBindGroupLayout,
          entries: [
            {
              binding: 0,
              resource: {
                kind: "buffer",
                value: {
                  buffer: pipelineState.viewUniformBuffer,
                  offset: viewOffset,
                  size: VIEW_UNIFORM_BYTES
                }
              }
            },
            {
              binding: 3,
              resource: { kind: "textureView", value: pipelineState.shadowFallbackTextureView }
            },
            {
              binding: 4,
              resource: { kind: "sampler", value: shadowSampler }
            },
            {
              binding: 5,
              resource: {
                kind: "textureView",
                value: pipelineState.shadowAtlasFallbackTextureView
              }
            },
            {
              binding: 6,
              resource: { kind: "buffer", value: { buffer: pipelineState.shadowParamsBuffer } }
            },
            {
              binding: 7,
              resource: {
                kind: "buffer",
                value: {
                  buffer: pipelineState.shadowCasterCascadeBuffer,
                  offset: cascadeOffset,
                  size: POINTS_LINES_VIEW_BYTES
                }
              }
            },
            {
              binding: 8,
              resource: { kind: "textureView", value: pipelineState.shadowFallbackTextureView }
            },
            ...extendedLightingEntries,
            {
              binding: 10,
              resource: {
                kind: "buffer",
                value: {
                  buffer: pipelineState.pointsLinesViewBuffer ?? pipelineState.viewUniformBuffer,
                  size: 80
                }
              }
            },
            ...!extendedLighting && projectorAvailable ? [
              {
                binding: 11,
                resource: {
                  kind: "textureView",
                  value: pipelineState.defaultWhiteTextureView
                }
              },
              {
                binding: 12,
                resource: { kind: "sampler", value: pipelineState.defaultSampler }
              }
            ] : [],
            ...lowLimitCloudBindings ? [] : [
              {
                binding: 16,
                resource: {
                  kind: "textureView",
                  value: pipelineState.defaultWhiteTextureView
                }
              },
              {
                binding: 17,
                resource: {
                  kind: "sampler",
                  value: pipelineState.defaultSampler
                }
              }
            ]
          ]
        });
        if (!created.ok) throw created.error;
        return created.value;
      },
      c.bindGroupCounts
    );
  } catch (error) {
    if (error instanceof RhiError) {
      runtime.errorRegistry.fire(error);
      return null;
    }
    throw error;
  }
}
function shadowDispatchEntries(c) {
  return c.shadowDispatch ?? c.dispatch;
}
function shadowShaderMap(c) {
  const shaders = /* @__PURE__ */ new Map();
  const shadowRows = c.shadowDispatch !== void 0;
  const rows = (shadowRows ? c.shadowValidatedOrdered : c.validatedOrdered) ?? [];
  const base = shadowRows ? c.validatedOrdered.length : 0;
  const slotsByRenderable = new Map(
    rows.map((row, index) => [row.renderableIndex, c.materialSlotIndices?.[base + index] ?? []])
  );
  for (const entry of shadowDispatchEntries(c)) {
    if (entry.tags.LightMode !== "ShadowCaster" || entry.materialShaderId === void 0) continue;
    let byMaterial = shaders.get(entry.renderableIndex);
    if (byMaterial === void 0) {
      byMaterial = /* @__PURE__ */ new Map();
      shaders.set(entry.renderableIndex, byMaterial);
    }
    const candidateSlots = slotsByRenderable.get(entry.renderableIndex) ?? [];
    const materialSlot = candidateSlots.find(
      (slot) => c.materialSlots?.[slot]?.materialHandle === entry.materialHandle
    );
    const dispatches = byMaterial.get(entry.materialHandle) ?? [];
    dispatches.push({
      passIndex: entry.passIndex,
      materialHandle: entry.materialHandle,
      vertexEntry: entry.vertexEntry,
      fragmentEntry: entry.fragmentEntry,
      materialShaderId: entry.materialShaderId === "forgeax::default-standard-pbr" ? SHADOW_CASTER_SHADER_ID : entry.materialShaderId,
      renderState: entry.renderState,
      materialSlot,
      paramSnapshot: entry.paramSnapshot
    });
    byMaterial.set(entry.materialHandle, dispatches);
  }
  return shaders;
}
function shadowRasterState(state, reflected) {
  return reflected ? { ...state, frontFace: state?.frontFace === "cw" ? "ccw" : "cw" } : state;
}
function shadowPipeline(c, reflected = false) {
  return c.runtime.getMaterialShaderPipeline?.(
    SHADOW_CASTER_SHADER_ID,
    false,
    shadowRasterState(void 0, reflected),
    "triangle-list",
    void 0,
    shadowCasterVariantSet(c.runtime.device.caps.storageBuffer, false),
    "shadow-caster",
    void 0,
    void 0,
    void 0,
    void 0,
    void 0,
    void 0,
    void 0,
    void 0,
    "pbr"
  ) ?? null;
}
function skinnedShadowMeshBindGroup(c, entry) {
  const skin = entry.source.skin;
  const layout = c.pipelineState.pbrSkinMeshBindGroupLayout;
  const allocator = c.pipelineState.skinPaletteAllocator;
  if (skin === void 0 || layout === null || allocator === null) return null;
  return getOrCreateFromChain(
    c.frameState.meshBindGroupCache,
    [c.pipelineState.meshStorageBuffer.buffer, skin.buffer],
    "shadow-pbr-skin-mesh",
    () => {
      const created = c.runtime.device.createBindGroup({
        label: "shadow-pbr-skin-mesh-bg",
        layout,
        entries: createPbrSkinMeshBindGroupEntries(
          c.pipelineState.meshStorageBuffer.buffer,
          c.runtime.device.caps.storageBuffer ? MESH_SSBO_BYTES : MESH_UBO_FULL_ARRAY_BYTES,
          skin.buffer,
          allocator.bindingWindowBytes
        )
      });
      if (!created.ok) throw created.error;
      return created.value;
    },
    c.bindGroupCounts
  );
}
function recordGpuDrivenShadowIndirect(pass, submission) {
  const indirect = submission.view.indirectBuffer;
  if (indirect === void 0) {
    throw new RhiError({
      code: "internal-error",
      expected: "GPU-driven shadow view indirect buffer",
      hint: "publish a prepared view generation before recording a capable shadow pass"
    });
  }
  const indexed = /* @__PURE__ */ new Map();
  for (const [batchId, batch] of submission.batches) indexed.set(batchId, batch);
  let currentPipeline;
  let currentVertex;
  let currentIndex;
  for (const batch of submission.plan.batches) {
    const raster = indexed.get(batch.batchId);
    if (raster === void 0) {
      throw new RhiError({
        code: "internal-error",
        expected: `prepared shadow raster batch ${batch.batchId}`,
        hint: "keep the shadow view plan and prepared batch projection on one generation"
      });
    }
    if (currentPipeline !== raster.pipeline) {
      pass.setPipeline(raster.pipeline);
      currentPipeline = raster.pipeline;
    }
    if (currentVertex !== raster.vertexBuffer) {
      pass.setVertexBuffer(0, raster.vertexBuffer);
      currentVertex = raster.vertexBuffer;
    }
    pass.setBindGroup(1, raster.materialGroup, [0]);
    if (raster.indexBuffer !== void 0) {
      if (raster.indexFormat === void 0) {
        throw new RhiError({
          code: "internal-error",
          expected: `index format for prepared shadow raster batch ${batch.batchId}`,
          hint: "publish the geometry layout projection with the capable shadow batch"
        });
      }
      if (currentIndex !== raster.indexBuffer) {
        pass.setIndexBuffer(raster.indexBuffer, raster.indexFormat);
        currentIndex = raster.indexBuffer;
      }
      pass.setBindGroup(2, raster.meshBindGroup, raster.deformation === "skin" ? [0, 0, 0] : [0]);
      pass.setBindGroup(3, raster.visibleBindGroup);
      pass.drawIndexedIndirect(indirect, batch.indirectOffset);
    } else {
      pass.setBindGroup(2, raster.meshBindGroup, raster.deformation === "skin" ? [0, 0, 0] : [0]);
      pass.setBindGroup(3, raster.visibleBindGroup);
      pass.drawIndirect(indirect, batch.indirectOffset);
    }
  }
}
function shadowDrawIndicesBySubmesh(source, mesh) {
  const draws = source.gpuDrivenDraws;
  if (draws === void 0 || draws.length === 0) return /* @__PURE__ */ new Map();
  const indices = /* @__PURE__ */ new Map();
  let hasStableSourceIdentity = false;
  for (const [compactIndex, draw] of draws.entries()) {
    const drawItemIndex = draw.drawItemIndex;
    if (drawItemIndex === void 0) continue;
    hasStableSourceIdentity = true;
    if (mesh.submeshes[drawItemIndex] !== void 0) indices.set(drawItemIndex, compactIndex);
  }
  if (hasStableSourceIdentity) return indices;
  let nonIndexedFirst = 0;
  let drawCursor = 0;
  for (const [submeshIndex, submesh] of mesh.submeshes.entries()) {
    const first = mesh.indexed ? submesh.indexOffset : nonIndexedFirst;
    const count = mesh.indexed ? submesh.indexCount : submesh.vertexCount;
    if (!mesh.indexed) nonIndexedFirst += submesh.vertexCount;
    const draw = draws[drawCursor];
    if (draw !== void 0 && draw.first === first && draw.count === count && draw.materialSlot === submesh.materialSlot && draw.topology === submesh.topology) {
      indices.set(submeshIndex, drawCursor);
      drawCursor += 1;
    }
  }
  return indices;
}
function isGpuShadowClaimedSubmesh(source, renderableIndex, submeshIndex, drawIndices, gpuDrivenShadowDrawKeys, shadowDispatchByRenderableIdx, shadowCasterMembership, shadowCasterWorldKeys) {
  if (gpuDrivenShadowDrawKeys === void 0) return false;
  const drawItemIndex = drawIndices.get(submeshIndex);
  const draw = drawItemIndex === void 0 ? void 0 : source.gpuDrivenDraws?.[drawItemIndex];
  if (drawItemIndex === void 0 || draw === void 0) return false;
  const material = source.materials[draw.materialSlot] ?? source.material;
  const worldEntity = worldEntityKey(
    shadowCasterWorldKeys?.[source.worldId] ?? source.worldId,
    source.entityKey
  );
  const sourceDrawItemIndex = draw.drawItemIndex ?? drawItemIndex;
  if (shadowCasterMembership !== void 0) {
    const matching = shadowCasterMembership.filter(
      (membership) => membership.worldEntity === worldEntity && membership.materialHandle === (material.materialHandle ?? -1) && membership.drawItemIndex === sourceDrawItemIndex
    );
    if (matching.length === 0 || matching.some((membership) => membership.cpuReason !== void 0)) {
      return false;
    }
    return matching.every(
      (membership) => gpuDrivenShadowDrawKeys.has(
        gpuDrivenShadowDrawKey(
          membership.worldEntity,
          membership.materialHandle,
          membership.drawItemIndex,
          membership.passIndex
        )
      )
    );
  }
  const dispatches = shadowDispatchByRenderableIdx.get(renderableIndex)?.get(material.materialHandle ?? 0) ?? [];
  if (dispatches.length > 0) {
    return dispatches.every(
      (dispatch) => gpuDrivenShadowDrawKeys.has(
        gpuDrivenShadowDrawKey(
          worldEntity,
          material.materialHandle ?? -1,
          draw.drawItemIndex ?? drawItemIndex,
          dispatch.passIndex
        )
      )
    );
  }
  const base = gpuDrivenShadowDrawKey(
    worldEntity,
    material.materialHandle ?? -1,
    sourceDrawItemIndex,
    0
  ).split(":");
  return [...gpuDrivenShadowDrawKeys].some((key) => {
    const parts = key.split(":");
    return parts.length === 4 && parts[0] === base[0] && parts[1] === base[1] && parts[2] === base[2];
  });
}
function shadowCasterKeys(c) {
  if (c.shadowCasterMembership !== void 0) {
    const keys = /* @__PURE__ */ new Set();
    for (const membership of c.shadowCasterMembership) {
      keys.add(
        gpuDrivenShadowDrawKey(
          membership.worldEntity,
          membership.materialHandle,
          membership.drawItemIndex,
          membership.passIndex
        )
      );
    }
    return keys;
  }
  return c.gpuDrivenShadowDrawKeys ?? /* @__PURE__ */ new Set();
}
function shadowViewContains(source, planes) {
  if (planes === void 0 || planes.length === 0 || source.localAabb === void 0) return true;
  if (source.skin !== void 0) return true;
  if (source.spriteInstances !== void 0) return true;
  let worldBounds;
  if (source.instances !== void 0) {
    if (source.instances.instanceCount === 0) return false;
    const derived = deriveInstancesUnionBounds({
      meshAabb: source.localAabb,
      entityWorld: source.transform.world,
      transforms: source.instances.transforms
    });
    if (derived === void 0) return true;
    worldBounds = derived;
  } else {
    worldBounds = box3.transformBox3(box3.create(), source.localAabb, source.transform.world);
  }
  return frustum.intersectsBox(planes, worldBounds);
}
function validateShadowOwnership(c, identity, claimedKeys, recordedKeys) {
  if (c.shadowCasterMembership === void 0 && (c.gpuDrivenShadowDrawKeys === void 0 || c.gpuDrivenShadowDrawKeys.size === 0))
    return;
  const viewPlanes = c.shadowViewPlanesByView?.get(shadowViewIdentityKey(identity));
  const visibleRenderableIndices = viewPlanes === void 0 ? void 0 : new Set(
    (c.shadowValidatedOrdered ?? c.validatedOrdered).filter((entry) => shadowViewContains(entry.source, viewPlanes)).map((entry) => entry.renderableIndex)
  );
  const allExpectedKeys = shadowCasterKeys(c);
  const visibleExpectedKeys = visibleRenderableIndices === void 0 || c.shadowCasterMembership === void 0 ? allExpectedKeys : new Set(
    c.shadowCasterMembership.filter((membership) => visibleRenderableIndices.has(membership.renderableIndex)).map(
      (membership) => gpuDrivenShadowDrawKey(
        membership.worldEntity,
        membership.materialHandle,
        membership.drawItemIndex,
        membership.passIndex
      )
    )
  );
  const claimed = claimedKeys ?? /* @__PURE__ */ new Set();
  const overlap = [...claimed].filter((key) => recordedKeys.has(key));
  const union = /* @__PURE__ */ new Set([...claimed, ...recordedKeys]);
  const missing = [...visibleExpectedKeys].filter((key) => !union.has(key));
  const unexpectedClaims = [...claimed].filter((key) => !allExpectedKeys.has(key));
  if (overlap.length === 0 && missing.length === 0 && unexpectedClaims.length === 0) return;
  throw new RhiError({
    code: "internal-error",
    expected: `disjoint ShadowCaster ownership for ${shadowViewIdentityKey(identity)}`,
    hint: `expected=${[...allExpectedKeys].sort().join(",")} visibleExpected=${[...visibleExpectedKeys].sort().join(",")} claimed=${[...claimed].sort().join(",")} recorded=${[...recordedKeys].sort().join(",")} missing=${missing.sort().join(",")} unexpectedClaims=${unexpectedClaims.sort().join(",")}`
  });
}
function hasUnclaimedShadowCasters(c, claimedKeys) {
  const extractedKeys = c.shadowCasterMembership === void 0 ? [...c.gpuDrivenShadowDrawKeys ?? []] : c.shadowCasterMembership.map(
    (membership) => gpuDrivenShadowDrawKey(
      membership.worldEntity,
      membership.materialHandle,
      membership.drawItemIndex,
      membership.passIndex
    )
  );
  if (extractedKeys.length === 0) return false;
  return claimedKeys === void 0 || extractedKeys.some((key) => !claimedKeys.has(key));
}
function hasExpectedShadowCasters(c) {
  if ((c.shadowCasterMembership?.length ?? 0) > 0) return true;
  if ((c.gpuDrivenShadowDrawKeys?.size ?? 0) > 0) return true;
  return shadowDispatchEntries(c).some((entry) => entry.tags.LightMode === "ShadowCaster");
}
function recordGpuDrivenShadowIfPublished(c, pass, identity) {
  const viewSubmission = c.gpuDrivenShadowViews?.submission(identity);
  const projections = c.gpuDrivenShadowBatchProjections?.get(shadowViewIdentityKey(identity));
  if (viewSubmission === void 0) {
    return void 0;
  }
  if (projections === void 0) {
    throw new RhiError({
      code: "rhi-not-available",
      expected: `GPU-driven shadow projection for ${shadowViewIdentityKey(identity)}`,
      hint: "terminate the capable shadow frame instead of falling through to CPU caster enumeration"
    });
  }
  const batches = /* @__PURE__ */ new Map();
  for (const batch of viewSubmission.plan.batches) {
    const projection = projections.get(batch.batchId);
    if (projection === void 0) {
      throw new RhiError({
        code: "internal-error",
        expected: `projected mesh binding for GPU-driven shadow batch ${batch.batchId}`,
        hint: "keep shadow batch scene rows aligned with the shared SubmissionPlan"
      });
    }
    const shadowArtifact = projection.shadowArtifact;
    const shadowReceipt = shadowArtifact.receipt;
    if (shadowReceipt === void 0) {
      throw new RhiError({
        code: "rhi-not-available",
        expected: `published shadow MaterialProgramAbi for batch ${batch.batchId}`,
        hint: "keep the shadow draw out of the capable lane until its producer receipt is ready"
      });
    }
    const shadowVariantSet = shadowArtifact.variantSet ?? (shadowArtifact.material === SHADOW_CASTER_SHADER_ID ? shadowCasterVariantSet(
      c.runtime.device.caps.storageBuffer,
      projection.deformation === "skin",
      true,
      batch.key.admission === "alpha-mask",
      projection.vertexColorAvailable
    ) : void 0);
    const pipeline = c.runtime.getMaterialShaderPipeline?.(
      // A scene-index shadow artifact may retain the logical material id for
      // batching while its specialization key owns the actual WGSL module.
      shadowArtifact.specializationKey ?? shadowArtifact.material,
      false,
      shadowRasterState(void 0, identity.kind === "point"),
      batch.key.topology,
      batch.key.drawKind === "indexed" ? projection.mesh.indexFormat : void 0,
      shadowVariantSet,
      "shadow-caster",
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      projection.mesh.layoutProjection,
      // The shadow projection carries the producer-validated receipt. Select
      // the immediate module adapter so a newly loaded custom Surface cannot
      // lose its first capable shadow draw to async pre-bake warm-up.
      "immediate",
      projection.deformation === "skin" ? "gpu-driven-skin" : "gpu-driven-pbr",
      shadowReceipt.sceneIndexEntry,
      void 0,
      projection.shadowVertexEntry,
      projection.shadowFragmentEntry
    );
    if (pipeline === null || pipeline === void 0) {
      throw new RhiError({
        code: "rhi-not-available",
        expected: `GPU-driven shadow pipeline variant for batch ${batch.batchId}`,
        hint: "publish the exact scene-index shadow variant before entering the capable lane"
      });
    }
    if (batch.key.drawKind === "indexed" && projection.mesh.indexBuffer === null) {
      throw new RhiError({
        code: "internal-error",
        expected: `indexed mesh buffer for GPU-driven shadow batch ${batch.batchId}`,
        hint: "keep the geometry residency and topology draw kind aligned before capable recording"
      });
    }
    const materialGroup = shadowArtifact.material !== SHADOW_CASTER_SHADER_ID ? ensureGpuDrivenCustomShadowMaterialBg(c, projection) : batch.key.admission === "alpha-mask" ? ensureGpuDrivenAlphaMaskMaterialBg(c, projection) : ensureSpotShadowMaterialBg(c);
    if (materialGroup === null) {
      throw new RhiError({
        code: "rhi-not-available",
        expected: "material resources for every GPU shadow batch",
        hint: "publish the shadow material binding before recording the indirect batch"
      });
    }
    batches.set(batch.batchId, {
      pipeline,
      meshBindGroup: projection.meshBindGroup,
      visibleBindGroup: projection.visibleBindGroup,
      deformation: projection.deformation,
      materialGroup,
      ...batch.key.admission === "alpha-mask" ? { alphaMaskMaterialGroup: materialGroup } : {},
      vertexBuffer: projection.mesh.vertexBuffer.handle,
      ...batch.key.drawKind === "indexed" && projection.mesh.indexBuffer !== null ? {
        indexBuffer: projection.mesh.indexBuffer.handle,
        indexFormat: projection.mesh.indexFormat
      } : {}
    });
  }
  const submission = {
    view: viewSubmission.view,
    plan: viewSubmission.plan,
    batches
  };
  recordGpuDrivenShadowIndirect(pass, submission);
  const viewKey = shadowViewIdentityKey(identity);
  const viewClaims = c.gpuDrivenShadowDrawKeysByView;
  return {
    claimedKeys: viewClaims === void 0 ? c.gpuDrivenShadowDrawKeys ?? /* @__PURE__ */ new Set() : viewClaims.get(viewKey) ?? /* @__PURE__ */ new Set()
  };
}
function encodeDirectionalShadowPass(c, pass, cascadeIndex, viewport, drawFeatures, forceRaster = false) {
  const directionalIdentity = { kind: "directional", index: cascadeIndex };
  if (!forceRaster && (c.gpuDrivenShadowViews?.cacheHit(directionalIdentity) === true || c.gpuDrivenShadowViews === void 0 && c.directionalShadowCacheReuse) && drawFeatures === void 0)
    return;
  const pipeline = shadowPipeline(c);
  const viewBg = ensureTypedShadowViewBg(
    c,
    0,
    directionalShadowCasterOffset(cascadeIndex),
    `view-shadow-directional-${cascadeIndex}`
  );
  const materialBg = viewBg === null ? null : ensureSpotShadowMaterialBg(c);
  const capable = c.gpuDrivenShadowViews?.submission(directionalIdentity) !== void 0;
  if (viewBg === null || materialBg === null) {
    c.frameState.directionalShadowCacheRecorded = false;
    if (capable || hasExpectedShadowCasters(c)) {
      throw new RhiError({
        code: "rhi-not-available",
        expected: "directional ShadowCaster bind groups",
        hint: "publish the view/material resources before recording the shadow lane"
      });
    }
    return;
  }
  c.frameState.directionalShadowCacheRecorded = true;
  pass.setViewport(viewport.x, viewport.y, viewport.w, viewport.h, 0, 1);
  drawFeatures?.(viewBg);
  pass.setBindGroup(0, viewBg, [0, 0]);
  pass.setBindGroup(1, materialBg, [0]);
  const gpuRecord = recordGpuDrivenShadowIfPublished(c, pass, directionalIdentity);
  const gpuRecorded = gpuRecord !== void 0;
  const claimedKeys = gpuRecord?.claimedKeys;
  if (capable && !gpuRecorded) {
    throw new RhiError({
      code: "rhi-not-available",
      expected: "capable directional GPU-driven shadow projection",
      hint: "terminate the capable shadow frame instead of enumerating CPU casters"
    });
  }
  if (!hasUnclaimedShadowCasters(c, claimedKeys)) {
    if (gpuRecorded || !capable && !hasExpectedShadowCasters(c)) {
      validateShadowOwnership(c, directionalIdentity, claimedKeys, /* @__PURE__ */ new Set());
      return;
    }
  }
  if (pipeline === null) {
    if (gpuRecorded && !hasUnclaimedShadowCasters(c, claimedKeys)) {
      validateShadowOwnership(c, directionalIdentity, claimedKeys, /* @__PURE__ */ new Set());
      return;
    }
    if (gpuRecorded) {
      throw new RhiError({
        code: "rhi-not-available",
        expected: "CPU residual directional shadow pipeline",
        hint: "publish the legacy residual caster pipeline alongside the partial GPU shadow lane"
      });
    }
    throw new RhiError({
      code: "rhi-not-available",
      expected: "directional ShadowCaster pipeline",
      hint: "publish the CPU ShadowCaster pipeline before recording residual casters"
    });
  }
  pass.setPipeline(pipeline);
  const legacyMeshBindGroup = c.meshBindGroup;
  if (legacyMeshBindGroup === null) {
    if (gpuRecorded && !hasUnclaimedShadowCasters(c, claimedKeys)) {
      validateShadowOwnership(c, directionalIdentity, claimedKeys, /* @__PURE__ */ new Set());
      return;
    }
    if (gpuRecorded) {
      throw new RhiError({
        code: "rhi-not-available",
        expected: "CPU residual directional shadow mesh binding",
        hint: "publish legacy mesh resources for the unclaimed ShadowCaster residual"
      });
    }
    throw new RhiError({
      code: "rhi-not-available",
      expected: "directional ShadowCaster mesh binding",
      hint: "publish the CPU mesh binding before recording residual casters"
    });
  }
  if (gpuRecorded) pass.setBindGroup(1, materialBg, [0]);
  const recordedKeys = recordShadowCasterDraws(
    c,
    pass,
    pipeline,
    legacyMeshBindGroup,
    buildMatchedRenderableIndices(shadowDispatchEntries(c), { LightMode: ["ShadowCaster"] }),
    buildMatchedMaterialHandlesByRenderable(shadowDispatchEntries(c), {
      LightMode: ["ShadowCaster"]
    }),
    shadowShaderMap(c),
    claimedKeys,
    false,
    c.shadowViewPlanesByView?.get(shadowViewIdentityKey(directionalIdentity))
  );
  validateShadowOwnership(c, directionalIdentity, claimedKeys, recordedKeys);
  c.frameState.directionalShadowCacheRecorded = cascadeIndex === 0 ? true : c.frameState.directionalShadowCacheRecorded;
}
function encodePointShadowPass(c, pass, snapshotIndex, face, drawFeatures) {
  const snapshot = c.frameState.pointShadowSnapshots[snapshotIndex];
  if (snapshot === void 0) return;
  const pipeline = shadowPipeline(c, true);
  const viewBg = ensureTypedShadowViewBg(
    c,
    pointShadowViewOffset(snapshot.shadowAtlasLayer, face),
    0,
    `view-shadow-point-${snapshot.shadowAtlasLayer}-${face}`
  );
  const materialBg = viewBg === null ? null : ensureSpotShadowMaterialBg(c);
  const pointIdentity = { kind: "point", index: snapshotIndex, face };
  const capable = c.gpuDrivenShadowViews?.submission(pointIdentity) !== void 0;
  if (viewBg === null || materialBg === null) {
    if (capable || hasExpectedShadowCasters(c))
      throw new RhiError({
        code: "rhi-not-available",
        expected: "point ShadowCaster bind groups",
        hint: "publish the view/material resources before recording the shadow lane"
      });
    return;
  }
  if (pipeline === null && !capable && !hasExpectedShadowCasters(c) && drawFeatures === void 0)
    return;
  drawFeatures?.(viewBg);
  pass.setBindGroup(0, viewBg, [0, 0]);
  pass.setBindGroup(1, materialBg, [0]);
  const gpuRecord = recordGpuDrivenShadowIfPublished(c, pass, pointIdentity);
  const gpuRecorded = gpuRecord !== void 0;
  const claimedKeys = gpuRecord?.claimedKeys;
  if (capable && !gpuRecorded) {
    throw new RhiError({
      code: "rhi-not-available",
      expected: "capable point GPU-driven shadow projection",
      hint: "terminate the capable shadow frame instead of enumerating CPU casters"
    });
  }
  if (!hasUnclaimedShadowCasters(c, claimedKeys)) {
    if (gpuRecorded || !capable && !hasExpectedShadowCasters(c)) {
      validateShadowOwnership(c, pointIdentity, claimedKeys, /* @__PURE__ */ new Set());
      return;
    }
  }
  if (pipeline === null) {
    if (gpuRecorded && !hasUnclaimedShadowCasters(c, claimedKeys)) {
      validateShadowOwnership(c, pointIdentity, claimedKeys, /* @__PURE__ */ new Set());
      return;
    }
    if (gpuRecorded) {
      throw new RhiError({
        code: "rhi-not-available",
        expected: "CPU residual point shadow pipeline",
        hint: "publish the legacy residual caster pipeline alongside the partial GPU shadow lane"
      });
    }
    throw new RhiError({
      code: "rhi-not-available",
      expected: "point ShadowCaster pipeline",
      hint: "publish the CPU ShadowCaster pipeline before recording residual casters"
    });
  }
  pass.setPipeline(pipeline);
  const legacyMeshBindGroup = c.meshBindGroup;
  if (legacyMeshBindGroup === null) {
    if (gpuRecorded && !hasUnclaimedShadowCasters(c, claimedKeys)) {
      validateShadowOwnership(c, pointIdentity, claimedKeys, /* @__PURE__ */ new Set());
      return;
    }
    if (gpuRecorded) {
      throw new RhiError({
        code: "rhi-not-available",
        expected: "CPU residual point shadow mesh binding",
        hint: "publish legacy mesh resources for the unclaimed ShadowCaster residual"
      });
    }
    throw new RhiError({
      code: "rhi-not-available",
      expected: "point ShadowCaster mesh binding",
      hint: "publish the CPU mesh binding before recording residual casters"
    });
  }
  if (gpuRecorded) pass.setBindGroup(1, materialBg, [0]);
  const recordedKeys = recordShadowCasterDraws(
    c,
    pass,
    pipeline,
    legacyMeshBindGroup,
    buildMatchedRenderableIndices(shadowDispatchEntries(c), { LightMode: ["ShadowCaster"] }),
    buildMatchedMaterialHandlesByRenderable(shadowDispatchEntries(c), {
      LightMode: ["ShadowCaster"]
    }),
    shadowShaderMap(c),
    claimedKeys,
    true,
    c.shadowViewPlanesByView?.get(shadowViewIdentityKey(pointIdentity))
  );
  validateShadowOwnership(c, pointIdentity, claimedKeys, recordedKeys);
}
function encodeSpotShadowPass(c, pass, snapshotIndex, drawFeatures) {
  const snapshot = c.frameState.spotShadowSnapshots.filter(
    (candidate) => candidate.shadowAtlasTile >= 0 && candidate.lightViewProj !== void 0
  )[snapshotIndex];
  if (snapshot === void 0 || snapshot.shadowAtlasTile < 0 || snapshot.lightViewProj === void 0) {
    return;
  }
  const pipeline = shadowPipeline(c);
  const viewBg = ensureTypedShadowViewBg(
    c,
    0,
    spotShadowCasterOffset(snapshot.shadowAtlasTile),
    `view-shadow-spot-${snapshot.shadowAtlasTile}`
  );
  const materialBg = viewBg === null ? null : ensureSpotShadowMaterialBg(c);
  const spotIdentity = { kind: "spot", index: snapshotIndex };
  const capable = c.gpuDrivenShadowViews?.submission(spotIdentity) !== void 0;
  if (viewBg === null || materialBg === null) {
    if (capable || hasExpectedShadowCasters(c))
      throw new RhiError({
        code: "rhi-not-available",
        expected: "spot ShadowCaster bind groups",
        hint: "publish the view/material resources before recording the shadow lane"
      });
    return;
  }
  if (pipeline === null && !capable && !hasExpectedShadowCasters(c) && drawFeatures === void 0)
    return;
  const tileSize = c.pipelineState.perPassResources.shadowMapSize;
  const tile = snapshot.shadowAtlasTile;
  pass.setViewport(
    tile % 2 * tileSize,
    Math.floor(tile / 2) * tileSize,
    tileSize,
    tileSize,
    0,
    1
  );
  drawFeatures?.(viewBg);
  pass.setBindGroup(0, viewBg, [0, 0]);
  pass.setBindGroup(1, materialBg, [0]);
  const gpuRecord = recordGpuDrivenShadowIfPublished(c, pass, spotIdentity);
  const gpuRecorded = gpuRecord !== void 0;
  const claimedKeys = gpuRecord?.claimedKeys;
  if (capable && !gpuRecorded) {
    throw new RhiError({
      code: "rhi-not-available",
      expected: "capable spot GPU-driven shadow projection",
      hint: "terminate the capable shadow frame instead of enumerating CPU casters"
    });
  }
  if (!hasUnclaimedShadowCasters(c, claimedKeys)) {
    if (gpuRecorded || !capable && !hasExpectedShadowCasters(c)) {
      validateShadowOwnership(c, spotIdentity, claimedKeys, /* @__PURE__ */ new Set());
      return;
    }
  }
  if (pipeline === null) {
    if (gpuRecorded && !hasUnclaimedShadowCasters(c, claimedKeys)) {
      validateShadowOwnership(c, spotIdentity, claimedKeys, /* @__PURE__ */ new Set());
      return;
    }
    if (gpuRecorded) {
      throw new RhiError({
        code: "rhi-not-available",
        expected: "CPU residual spot shadow pipeline",
        hint: "publish the legacy residual caster pipeline alongside the partial GPU shadow lane"
      });
    }
    throw new RhiError({
      code: "rhi-not-available",
      expected: "spot ShadowCaster pipeline",
      hint: "publish the CPU ShadowCaster pipeline before recording residual casters"
    });
  }
  pass.setPipeline(pipeline);
  const legacyMeshBindGroup = c.meshBindGroup;
  if (legacyMeshBindGroup === null) {
    if (gpuRecorded && !hasUnclaimedShadowCasters(c, claimedKeys)) {
      validateShadowOwnership(c, spotIdentity, claimedKeys, /* @__PURE__ */ new Set());
      return;
    }
    if (gpuRecorded) {
      throw new RhiError({
        code: "rhi-not-available",
        expected: "CPU residual spot shadow mesh binding",
        hint: "publish legacy mesh resources for the unclaimed ShadowCaster residual"
      });
    }
    throw new RhiError({
      code: "rhi-not-available",
      expected: "spot ShadowCaster mesh binding",
      hint: "publish the CPU mesh binding before recording residual casters"
    });
  }
  if (gpuRecorded) pass.setBindGroup(1, materialBg, [0]);
  const recordedKeys = recordShadowCasterDraws(
    c,
    pass,
    pipeline,
    legacyMeshBindGroup,
    buildMatchedRenderableIndices(shadowDispatchEntries(c), { LightMode: ["ShadowCaster"] }),
    buildMatchedMaterialHandlesByRenderable(shadowDispatchEntries(c), {
      LightMode: ["ShadowCaster"]
    }),
    shadowShaderMap(c),
    claimedKeys,
    false,
    c.shadowViewPlanesByView?.get(shadowViewIdentityKey(spotIdentity))
  );
  validateShadowOwnership(c, spotIdentity, claimedKeys, recordedKeys);
}
function filterDispatchBySelector(dispatch, selector) {
  if (Object.keys(selector).length === 0) return dispatch;
  return dispatch.filter((e) => matchPass(e.tags, selector));
}
function buildMatchedRenderableIndices(dispatch, selector) {
  if (dispatch.length === 0) return null;
  const filtered = filterDispatchBySelector(dispatch, selector);
  const set = /* @__PURE__ */ new Set();
  for (const e of filtered) {
    set.add(e.renderableIndex);
  }
  return set;
}
function buildMatchedMaterialHandlesByRenderable(dispatch, selector, excludeSelector) {
  if (dispatch.length === 0) return null;
  const matched = filterDispatchBySelector(dispatch, selector);
  const excluded = excludeSelector === void 0 ? void 0 : new Set(
    filterDispatchBySelector(dispatch, excludeSelector).map(
      (entry) => `${entry.renderableIndex}:${entry.materialHandle}`
    )
  );
  const handlesByRenderable = /* @__PURE__ */ new Map();
  for (const entry of matched) {
    if (excluded?.has(`${entry.renderableIndex}:${entry.materialHandle}`)) continue;
    const handles = handlesByRenderable.get(entry.renderableIndex);
    if (handles === void 0) {
      handlesByRenderable.set(entry.renderableIndex, /* @__PURE__ */ new Set([entry.materialHandle]));
    } else {
      handles.add(entry.materialHandle);
    }
  }
  return handlesByRenderable;
}
function recordShadowCasterDraws(c, shadowPass, shadowPipeline2, shadowMeshBindGroup, matchedIndices, matchedMaterialHandles, shadowDispatchByRenderableIdx, gpuDrivenShadowDrawKeys, reflected = false, viewPlanes) {
  const {
    runtime,
    pipelineState,
    validatedOrdered: mainValidatedOrdered,
    shadowValidatedOrdered
  } = c;
  const validatedOrdered = shadowValidatedOrdered ?? mainValidatedOrdered;
  const meshSsboBase = c.shadowMeshSsboBase ?? 0;
  let shadowLastVertexBuffer = null;
  let shadowLastIndexBuffer = null;
  const recordedKeys = /* @__PURE__ */ new Set();
  let shadowLastPipeline = shadowPipeline2;
  let materialDeps;
  for (let i = 0; i < validatedOrdered.length; i++) {
    const entry = validatedOrdered[i];
    if (entry === void 0) continue;
    if (!shadowViewContains(entry.source, viewPlanes)) continue;
    if (matchedIndices !== null && !matchedIndices.has(entry.renderableIndex)) continue;
    const drawIndices = shadowDrawIndicesBySubmesh(entry.source, entry.mesh);
    const shadowSubmeshes = entry.mesh.submeshes.flatMap((submesh, submeshIndex) => {
      if (submesh.topology !== "triangle-list" && submesh.topology !== "triangle-strip") {
        return [];
      }
      if (matchedMaterialHandles !== null) {
        const handles = matchedMaterialHandles.get(entry.renderableIndex);
        const material = entry.source.materials[submesh.materialSlot] ?? entry.source.material;
        if (handles === void 0 || !handles.has(material.materialHandle ?? -1)) return [];
      }
      return isGpuShadowClaimedSubmesh(
        entry.source,
        entry.renderableIndex,
        submeshIndex,
        drawIndices,
        gpuDrivenShadowDrawKeys,
        shadowDispatchByRenderableIdx,
        c.shadowCasterMembership,
        c.shadowCasterWorldKeys
      ) ? [] : [{ submesh, submeshIndex }];
    });
    if (shadowSubmeshes.length === 0) continue;
    if (entry.mesh.vertexBuffer !== shadowLastVertexBuffer) {
      shadowPass.setVertexBuffer(0, entry.mesh.vertexBuffer.handle);
      shadowLastVertexBuffer = entry.mesh.vertexBuffer;
    }
    if (entry.mesh.indexed && entry.mesh.indexBuffer !== shadowLastIndexBuffer) {
      if (entry.mesh.indexBuffer !== null) {
        shadowPass.setIndexBuffer(entry.mesh.indexBuffer.handle, entry.mesh.indexFormat);
        shadowLastIndexBuffer = entry.mesh.indexBuffer;
      }
    }
    if (entry.source.skin !== void 0) {
      const skinMeshBindGroup = skinnedShadowMeshBindGroup(c, entry);
      if (skinMeshBindGroup === null) {
        throw new RhiError({
          code: "rhi-not-available",
          expected: "CPU skinned ShadowCaster mesh binding",
          hint: "publish the skin mesh/palette bind group before recording the residual"
        });
      }
      shadowPass.setBindGroup(
        2,
        skinMeshBindGroup,
        pbrSkinMeshDynamicOffsets(
          (meshSsboBase + i) * MESH_PER_ENTITY_STRIDE,
          entry.source.skin.byteOffset
        )
      );
    } else {
      shadowPass.setBindGroup(2, shadowMeshBindGroup, [
        (meshSsboBase + i) * MESH_PER_ENTITY_STRIDE
      ]);
    }
    let shadowInstanceDraws = [
      { buffer: pipelineState.identityInstanceBuffer, count: 1 }
    ];
    const shadowInst = entry.source.instances;
    if (shadowInst?.instanceCount === 0) continue;
    if (shadowInst !== void 0) {
      const uniformFallback = runtime.device.caps.storageBuffer === false;
      if (uniformFallback && shadowInst.instanceCount > MAX_UNIFORM_INSTANCES) {
        const ownerKey = instanceCollectionCacheKey(entry.source.worldId, shadowInst);
        const chunks = c.frameState.instanceBufferChunks;
        const activeKeys = /* @__PURE__ */ new Set();
        const draws = [];
        const strideBytes = 16 * Float32Array.BYTES_PER_ELEMENT;
        const dirtyRanges = shadowInst.dirtyRanges ?? [{ start: 0, end: shadowInst.instanceCount }];
        const uploadedRanges = [];
        let uploadedBytes = 0;
        let failed = false;
        for (let start = 0; start < shadowInst.instanceCount; start += MAX_UNIFORM_INSTANCES) {
          const count = Math.min(MAX_UNIFORM_INSTANCES, shadowInst.instanceCount - start);
          const chunkKey = `${ownerKey}:${start}`;
          activeKeys.add(chunkKey);
          const payloadBytes = count * strideBytes;
          const previous = chunks?.get(chunkKey);
          let active = previous !== void 0 && previous.uploadedArchVersion === shadowInst.archVersion && previous.uploadedByteLength === payloadBytes ? previous : void 0;
          let activeIsNew = false;
          if (active === void 0) {
            const created = runtime.device.createBuffer({
              size: INSTANCE_UBO_FULL_ARRAY_BYTES,
              usage: GPU_BUFFER_USAGE_UNIFORM | GPU_BUFFER_USAGE_COPY_DST,
              mappedAtCreation: false
            });
            if (!created.ok) {
              runtime.errorRegistry.fire(created.error);
              failed = true;
              break;
            }
            if (previous !== void 0 && !previous.buffer.isDestroyed) {
              const destroyed = previous.buffer.destroy();
              if (!destroyed.ok) runtime.errorRegistry.fire(destroyed.error);
            }
            active = {
              buffer: new GpuBuffer(runtime.device, created.value),
              uploadedArchVersion: shadowInst.archVersion,
              uploadedByteLength: payloadBytes
            };
            activeIsNew = true;
            chunks?.set(chunkKey, active);
            if (chunks === void 0) c.frameState.transientInstanceBuffers.push(active);
          }
          const localRanges = dirtyRanges.map((range) => ({
            start: Math.max(start, range.start) - start,
            end: Math.min(start + count, range.end) - start
          })).filter((range) => range.end > range.start);
          const rangesToUpload = instanceUploadRangesForResident(activeIsNew, localRanges, {
            start: 0,
            end: count
          });
          const needsUpload = activeIsNew || shadowInst.revision !== void 0 && active.uploadedRevision !== shadowInst.revision;
          if (needsUpload && rangesToUpload.length > 0) {
            for (const range of rangesToUpload) {
              const source = shadowInst.transforms.subarray(
                (start + range.start) * 16,
                (start + range.end) * 16
              );
              const written = runtime.device.queue.writeBuffer(
                active.buffer.handle,
                range.start * strideBytes,
                source
              );
              if (!written.ok) {
                runtime.errorRegistry.fire(written.error);
                failed = true;
                break;
              }
              uploadedRanges.push({ start: start + range.start, end: start + range.end });
              uploadedBytes += source.byteLength;
            }
            if (failed) break;
          }
          if (needsUpload && shadowInst.revision !== void 0) {
            active = { ...active, uploadedRevision: shadowInst.revision };
            chunks?.set(chunkKey, active);
          }
          draws.push({ buffer: active.buffer.handle, count });
        }
        shadowInstanceDraws = failed ? [{ buffer: pipelineState.identityInstanceBuffer, count: 1 }] : draws;
        if (chunks !== void 0) {
          const prefix = `${ownerKey}:`;
          for (const [key, stale] of chunks.entries()) {
            if (!key.startsWith(prefix) || activeKeys.has(key)) continue;
            if (!stale.buffer.isDestroyed) {
              const destroyed = stale.buffer.destroy();
              if (!destroyed.ok) runtime.errorRegistry.fire(destroyed.error);
            }
            chunks.delete(key);
          }
        }
        if (!failed) {
          reportInstanceResidency(c, shadowInst, {
            lane: "chunked-uniform",
            requestedBytes: shadowInst.instanceCount * strideBytes,
            supportedBytes: MAX_UNIFORM_INSTANCES * strideBytes,
            uploadRanges: uploadedRanges,
            uploadedBytes
          });
        }
      } else {
        const bufUsage = uniformFallback ? GPU_BUFFER_USAGE_UNIFORM | GPU_BUFFER_USAGE_COPY_DST : GPU_BUFFER_USAGE_STORAGE | GPU_BUFFER_USAGE_COPY_DST;
        const instancePayload = uniformFallback ? shadowInst.transforms : packInstanceStorageBuffer(
          shadowInst.transforms,
          entry.source.temporal?.previousInstances?.transforms,
          shadowInst.generations,
          entry.source.temporal?.previousInstances?.generations
        );
        const requestedBytes = instancePayload.byteLength;
        const cap = runtime.device.limits.maxStorageBufferBindingSize;
        if (!uniformFallback && typeof cap === "number" && cap > 0 && requestedBytes > cap) {
          const chunked = resolveStorageInstanceChunks(c, entry, shadowInst, cap, void 0, -1);
          if (chunked !== null) {
            shadowInstanceDraws = chunked.map((draw) => ({
              buffer: draw.instanceBuffer,
              count: draw.instanceCount
            }));
          }
        } else {
          const instanceCacheKey = instanceCollectionCacheKey(entry.source.worldId, shadowInst);
          const cached = c.frameState.instanceBuffers.get(instanceCacheKey);
          let active = null;
          let activeIsNew = false;
          if (cached !== void 0 && cached.uploadedArchVersion === shadowInst.archVersion && cached.uploadedByteLength === requestedBytes && (shadowInst.revision === void 0 ? cached.uploadedRevision === void 0 : cached.uploadedRevision === shadowInst.revision)) {
            active = cached;
          } else if (requestedBytes > 0) {
            const bufRes = runtime.device.createBuffer({
              size: requestedBytes,
              usage: bufUsage,
              mappedAtCreation: false
            });
            if (!bufRes.ok) {
              runtime.errorRegistry.fire(bufRes.error);
            } else {
              if (cached !== void 0 && !cached.buffer.isDestroyed) {
                const r = cached.buffer.destroy();
                if (!r.ok) runtime.errorRegistry.fire(r.error);
              }
              const newBuffer = new GpuBuffer(runtime.device, bufRes.value);
              active = {
                buffer: newBuffer,
                uploadedArchVersion: shadowInst.archVersion,
                uploadedByteLength: requestedBytes
              };
              activeIsNew = true;
              if (active !== null) {
                c.frameState.instanceBuffers.set(instanceCacheKey, active);
              }
            }
          }
          if (active !== null) {
            const needsUpload = activeIsNew || shadowInst.revision !== void 0 && active.uploadedRevision !== shadowInst.revision;
            if (needsUpload) {
              const writeRes = runtime.device.queue.writeBuffer(
                active.buffer.handle,
                0,
                instancePayload
              );
              if (!writeRes.ok) {
                runtime.errorRegistry.fire(writeRes.error);
                continue;
              }
              if (shadowInst.revision !== void 0) {
                const published = { ...active, uploadedRevision: shadowInst.revision };
                c.frameState.instanceBuffers.set(instanceCacheKey, published);
                active = published;
              }
            }
            reportInstanceResidency(c, shadowInst, {
              lane: uniformFallback ? "direct-uniform" : "direct-storage",
              requestedBytes,
              supportedBytes: uniformFallback ? MAX_UNIFORM_INSTANCES * Float32Array.BYTES_PER_ELEMENT * 16 : typeof cap === "number" ? cap : void 0,
              uploadRanges: needsUpload ? [{ start: 0, end: shadowInst.instanceCount }] : [],
              uploadedBytes: needsUpload ? instancePayload.byteLength : 0
            });
            shadowInstanceDraws = [
              { buffer: active.buffer.handle, count: Math.max(1, shadowInst.instanceCount) }
            ];
          }
        }
      }
    }
    for (const { submesh: sm, submeshIndex } of shadowSubmeshes) {
      if (sm.topology !== "triangle-list" && sm.topology !== "triangle-strip") {
        continue;
      }
      const submeshMaterial = entry.source.materials[sm.materialSlot] ?? entry.source.material;
      const shadowDispatches = shadowDispatchByRenderableIdx.get(entry.renderableIndex)?.get(submeshMaterial.materialHandle ?? 0) ?? [];
      const compactDrawIndex = drawIndices.get(submeshIndex);
      const draw = compactDrawIndex === void 0 ? void 0 : entry.source.gpuDrivenDraws?.[compactDrawIndex];
      const drawItemIndex = draw?.drawItemIndex ?? compactDrawIndex ?? submeshIndex;
      const worldEntity = worldEntityKey(
        c.shadowCasterWorldKeys?.[entry.source.worldId] ?? entry.source.worldId,
        entry.source.entityKey
      );
      const residualDispatches = gpuDrivenShadowDrawKeys === void 0 ? shadowDispatches : shadowDispatches.filter(
        (dispatch) => !gpuDrivenShadowDrawKeys.has(
          gpuDrivenShadowDrawKey(
            worldEntity,
            submeshMaterial.materialHandle ?? -1,
            drawItemIndex,
            dispatch.passIndex
          )
        )
      );
      const passes = residualDispatches.length === 0 ? [void 0] : residualDispatches;
      if (gpuDrivenShadowDrawKeys !== void 0 && residualDispatches.length === 0) continue;
      for (const shadowDispatch of passes) {
        const entryShadowShaderId = shadowDispatch?.materialShaderId;
        const entryShadowRenderState = shadowRasterState(shadowDispatch?.renderState, reflected);
        const skinned = entry.source.skin !== void 0;
        let entryShadowPipeline = shadowPipeline2;
        const needsDedicatedPipeline = shadowDispatch !== void 0 || skinned || sm.topology !== "triangle-list";
        if (shadowDispatch !== void 0 && entryShadowShaderId === void 0) {
          throw new RhiError({
            code: "rhi-not-available",
            expected: "material shader identity for CPU ShadowCaster residual",
            hint: "publish a producer-owned ShadowCaster shader identity before recording the residual"
          });
        }
        if (needsDedicatedPipeline) {
          entryShadowPipeline = runtime.getMaterialShaderPipeline?.(
            entryShadowShaderId ?? SHADOW_CASTER_SHADER_ID,
            false,
            entryShadowRenderState,
            sm.topology,
            entry.mesh.indexFormat,
            shadowCasterVariantSet(
              runtime.device.caps.storageBuffer,
              skinned,
              false,
              Number(shadowDispatch?.paramSnapshot?.alphaCutoff ?? 0) > 0,
              entry.mesh.layoutProjection.attributes.some(
                (attribute) => attribute.key === "color"
              )
            ),
            "shadow-caster",
            void 0,
            // meshAttributes
            1,
            // sampleCount
            void 0,
            void 0,
            void 0,
            void 0,
            entry.mesh.layoutProjection,
            // Built-in variants reuse validated prewarm modules, including
            // adapters with no synchronous shader factory. Authored residual
            // programs use their synchronous manifest producer at first draw.
            entryShadowShaderId === void 0 || entryShadowShaderId === SHADOW_CASTER_SHADER_ID ? "validated" : "immediate",
            skinned ? "pbr-skin" : "pbr",
            void 0,
            // vertexEntryPoint
            void 0,
            // additionalColorFormats
            shadowDispatch?.vertexEntry,
            shadowDispatch?.fragmentEntry
          ) ?? null;
        }
        if (entryShadowPipeline === null) {
          throw new RhiError({
            code: "rhi-not-available",
            expected: `CPU ShadowCaster pipeline ${entryShadowShaderId ?? "<missing>"}`,
            hint: "publish the exact residual ShadowCaster pipeline; do not substitute the default shader"
          });
        }
        if (entryShadowPipeline !== shadowLastPipeline && entryShadowPipeline !== null) {
          shadowPass.setPipeline(entryShadowPipeline);
          shadowLastPipeline = entryShadowPipeline;
        }
        if (shadowDispatch !== void 0 && entryShadowShaderId !== void 0) {
          materialDeps ??= {
            runtime,
            pipelineState,
            world: c.world,
            store: c.store,
            materialSlice: STANDARD_PBR_UBO_SIZE,
            videoHighPerfAvailable: probeVideoHighPerfUpload(runtime.device),
            skylightResources: prepareMaterialSkylight(c).skylightResources,
            resolveRenderTargetTextureSource: runtime.resolveRenderTargetTextureSource,
            materialBgShared: c.frameState.materialBgShared,
            materialBgAssemblyCache: c.materialBgAssemblyCache,
            frameState: c.frameState,
            bindGroupCounts: c.bindGroupCounts
          };
          const materialSlot = shadowDispatch?.materialSlot ?? c.materialSlotIndices[i]?.[sm.materialSlot] ?? c.materialSlotIndices[i]?.[0];
          if (materialSlot === void 0) {
            throw new RhiError({
              code: "rhi-descriptor-invalid",
              expected: "a prepared material slot for each shadow submesh",
              hint: "repair material slot preparation before recording shadows"
            });
          }
          const materialGroup = buildPerSubmeshMaterialBg(
            materialDeps,
            submeshMaterial,
            entry.source.entityKey,
            entry.world ?? c.world,
            entryShadowShaderId
          );
          shadowPass.setBindGroup(1, materialGroup, [materialSlot * MATERIAL_PER_ENTITY_STRIDE]);
        } else {
          const materialGroup = ensureSpotShadowMaterialBg(c);
          if (materialGroup === null) {
            throw new RhiError({
              code: "rhi-not-available",
              expected: "CPU residual shadow material bind group",
              hint: "publish the residual material resources before recording shadows"
            });
          }
          shadowPass.setBindGroup(1, materialGroup, [0]);
        }
        for (const instanceDraw of shadowInstanceDraws) {
          const shadowInstancesBg = resolveGeometryInstancesBindGroup(c, instanceDraw.buffer);
          shadowPass.setBindGroup(3, shadowInstancesBg);
          if (entry.mesh.indexed) {
            shadowPass.drawIndexed(sm.indexCount, instanceDraw.count, sm.indexOffset, 0, 0);
          } else {
            shadowPass.draw(sm.vertexCount, instanceDraw.count, 0, 0);
          }
        }
        if (shadowDispatch !== void 0) {
          recordedKeys.add(
            gpuDrivenShadowDrawKey(
              worldEntity,
              submeshMaterial.materialHandle ?? -1,
              drawItemIndex,
              shadowDispatch.passIndex
            )
          );
        }
      }
    }
  }
  return recordedKeys;
}
function ensureSpotShadowMaterialBg(c) {
  const { runtime, frameState, pipelineState } = c;
  const fb = pipelineState.skylightFallback;
  const sceneMaterialBuffer = c.gpuDrivenStandardPbrFrameResources?.sceneMaterialBuffer ?? pipelineState.meshStorageBuffer.buffer;
  const handles = [
    pipelineState.materialBindGroupLayout,
    pipelineState.materialUniformBuffer.buffer,
    pipelineState.defaultSampler,
    pipelineState.defaultNormalTextureView,
    pipelineState.fallbackTextureView,
    sceneMaterialBuffer,
    ...fb === null ? [] : [fb]
  ];
  const cached = findFromChain(
    frameState.shadowMaterialBindGroups,
    handles,
    "shadow-material-singleton"
  );
  if (cached !== void 0) return cached;
  const fallbackEntries = buildPbrMaterialUserRegionEntries().map((entry) => {
    if (entry.buffer !== void 0) {
      return {
        binding: entry.binding,
        resource: {
          kind: "buffer",
          value: {
            buffer: pipelineState.materialUniformBuffer.buffer,
            offset: 0,
            size: STANDARD_PBR_UBO_SIZE
          }
        }
      };
    }
    if (entry.sampler !== void 0) {
      return {
        binding: entry.binding,
        resource: { kind: "sampler", value: pipelineState.defaultSampler }
      };
    }
    return {
      binding: entry.binding,
      resource: {
        kind: "textureView",
        value: entry.binding === 6 ? pipelineState.defaultNormalTextureView : pipelineState.fallbackTextureView
      }
    };
  });
  const merged = fb !== null ? assembleMaterialWithSkylightEntries(
    fallbackEntries,
    {
      irradianceView: fb.irradianceView,
      irradianceSampler: fb.sampler,
      prefilterView: fb.prefilterView,
      prefilterSampler: fb.sampler,
      brdfLutView: fb.brdfLutView,
      intensityBuffer: fb.intensityBuffer
    },
    transmissionBackdropAvailable(runtime.device.limits.maxSampledTexturesPerShaderStage) ? void 0 : null
  ) : fallbackEntries;
  if (runtime.device.caps.storageBuffer) {
    merged.push({
      binding: 46,
      resource: {
        kind: "buffer",
        value: { buffer: sceneMaterialBuffer }
      }
    });
  }
  const r = getOrCreateFromChainResult(
    frameState.shadowMaterialBindGroups,
    handles,
    "shadow-material-singleton",
    () => runtime.device.createBindGroup({
      label: "shadow-material-bg",
      layout: pipelineState.materialBindGroupLayout,
      entries: merged
    }),
    c.bindGroupCounts
  );
  if (!r.ok) {
    runtime.errorRegistry.fire(r.error);
    return null;
  }
  return r.value;
}
function ensureGpuDrivenAlphaMaskMaterialBg(c, projection) {
  const sceneMaterialBuffer = c.gpuDrivenStandardPbrFrameResources?.sceneMaterialBuffer;
  if (sceneMaterialBuffer === void 0) {
    throw new RhiError({
      code: "rhi-not-available",
      expected: "GPU Scene material buffer for alpha-mask shadow recording",
      hint: "publish the receipt-derived scene material table before the capable shadow pass"
    });
  }
  const fallback = c.pipelineState.skylightFallback;
  if (fallback === null) {
    throw new RhiError({
      code: "webgpu-runtime-error",
      expected: "pipelineState.skylightFallback for alpha-mask shadow material layout",
      hint: "create the merged Standard PBR material resources before recording shadows"
    });
  }
  const skylightResources = {
    irradianceView: fallback.irradianceView,
    irradianceSampler: fallback.sampler,
    prefilterView: fallback.prefilterView,
    prefilterSampler: fallback.sampler,
    brdfLutView: fallback.brdfLutView,
    intensityBuffer: fallback.intensityBuffer
  };
  const deps = {
    runtime: c.runtime,
    pipelineState: c.pipelineState,
    world: c.world,
    store: c.store,
    materialSlice: STANDARD_PBR_UBO_SIZE,
    videoHighPerfAvailable: false,
    skylightResources,
    materialBgShared: c.frameState.materialBgShared,
    materialBgAssemblyCache: c.materialBgAssemblyCache,
    sceneMaterialBuffer,
    bindGroupCounts: c.bindGroupCounts,
    frameState: c.frameState
  };
  const bindGroup = buildPerSubmeshMaterialBg(
    deps,
    projection.material,
    projection.materialEntityKey,
    c.world
  );
  return bindGroup;
}
function ensureGpuDrivenCustomShadowMaterialBg(c, projection) {
  const shaderId = projection.shadowArtifact.specializationKey ?? projection.shadowArtifact.material;
  const materialKey = `shadow-material-custom:${shaderId}:${projection.materialEntityKey}:${projection.material.materialHandle ?? -1}:${c.store.materialResourceEpoch}`;
  const cached = c.materialBgAssemblyCache.get(materialKey);
  if (cached !== void 0) return cached.bindGroup;
  const fallback = c.pipelineState.skylightFallback;
  if (fallback === null) {
    throw new RhiError({
      code: "rhi-not-available",
      expected: "skylight resources for custom shadow material binding",
      hint: "publish the custom material resource owner before recording the shadow lane"
    });
  }
  const sceneMaterialBuffer = c.gpuDrivenStandardPbrFrameResources?.sceneMaterialBuffer;
  if (sceneMaterialBuffer === void 0) {
    throw new RhiError({
      code: "rhi-not-available",
      expected: "producer-owned scene material buffer for custom shadow ABI",
      hint: "publish the selected shadow MaterialProgramAbi scene-index resource before recording"
    });
  }
  const skylightResources = {
    irradianceView: fallback.irradianceView,
    irradianceSampler: fallback.sampler,
    prefilterView: fallback.prefilterView,
    prefilterSampler: fallback.sampler,
    brdfLutView: fallback.brdfLutView,
    intensityBuffer: fallback.intensityBuffer
  };
  const deps = {
    runtime: c.runtime,
    pipelineState: c.pipelineState,
    world: c.world,
    store: c.store,
    materialSlice: STANDARD_PBR_UBO_SIZE,
    videoHighPerfAvailable: false,
    skylightResources,
    materialBgShared: c.frameState.materialBgShared,
    materialBgAssemblyCache: c.materialBgAssemblyCache,
    bindGroupCounts: c.bindGroupCounts,
    frameState: c.frameState,
    sceneMaterialBuffer
  };
  const bindGroup = buildPerSubmeshMaterialBg(
    deps,
    projection.material,
    projection.materialEntityKey,
    c.world,
    shaderId
  );
  return bindGroup;
}

// src/record/main-pass.ts
function materialDiagnosticsEnabled3() {
  if (typeof globalThis !== "object" || globalThis === null || !("process" in globalThis)) {
    return false;
  }
  const processValue = globalThis.process;
  return processValue?.env?.FORGEAX_MATERIAL_DIAGNOSTICS === "1";
}
function isTransmissionMaterial(material) {
  return material.materialShaderId === "forgeax::default-standard-pbr" && typeof material.paramSnapshot?.transmission === "number" && material.paramSnapshot.transmission > 0;
}
function matchesRecordMode(material, mode) {
  const medium = material.surfaceModel === "single-layer-medium" || material.materialShaderId === "forgeax::single-layer-medium";
  if (mode === "single-layer-medium-nearest-layer" || mode === "single-layer-medium-color") {
    return medium;
  }
  const transmission = isTransmissionMaterial(material);
  if (mode === "transmission") return transmission;
  if (mode === "transparent") return material.transparent === true && !transmission && !medium;
  return !transmission && material.transparent !== true && !medium;
}
function matchedMaterialsForRecordMode(c, matchedMaterials, mode) {
  if (mode === void 0) return matchedMaterials;
  const surfaceMode = mode === "single-layer-medium-nearest-layer" || mode === "single-layer-medium-color";
  const filtered = /* @__PURE__ */ new Map();
  for (const entry of c.validatedOrdered) {
    const dispatchHandles = matchedMaterials?.get(entry.renderableIndex);
    if (!surfaceMode && matchedMaterials !== null && dispatchHandles === void 0) continue;
    const candidateHandles = surfaceMode ? entry.source.materials.map((material) => material.materialHandle ?? 0) : dispatchHandles ?? (mode === "transmission" ? [] : entry.source.materials.map((material) => material.materialHandle ?? 0));
    const handles = /* @__PURE__ */ new Set();
    for (const handle of candidateHandles) {
      const material = entry.source.materials.find((candidate) => (candidate.materialHandle ?? 0) === handle) ?? entry.source.material;
      if (matchesRecordMode(material, mode)) handles.add(handle);
    }
    if (handles.size > 0) filtered.set(entry.renderableIndex, handles);
  }
  return filtered;
}
function recordMainPass(c, selector, options, graphPass) {
  const {
    runtime,
    world,
    store,
    pipelineState,
    encoder,
    clear,
    geometryColorView,
    geometryDepthView,
    validatedOrdered,
    viewBindGroup,
    viewBindGroupDynamicOffset = 0,
    meshBindGroup,
    frameState,
    bindGroupCounts,
    skyboxActive,
    splitLdrSprite,
    msaaActive,
    geometryColorResolveView,
    dispatch,
    hdrpClusterBindGroup,
    materialSlotIndices,
    materialSlots,
    materialSlotOwners,
    materialSlotCount,
    gpuDrivenStandardPbrFrameResources,
    gpuDrivenSceneMaterialBuffer
  } = c;
  const sampleCount = msaaActive ? 4 : 1;
  const passKind = options?.passKind ?? "forward";
  const recordMode = options?.recordMode;
  const transmissionBackdropView = options?.transmissionBackdropView;
  const surfaceRawDepthView = options?.surfaceRawDepthView;
  const surfaceNearestLayerView = options?.surfaceNearestLayerView;
  const surfaceNearestDepthView = options?.surfaceNearestDepthView;
  if ((recordMode === "transmission" || recordMode === "single-layer-medium-nearest-layer" || recordMode === "single-layer-medium-color") && transmissionBackdropView == null) {
    throw new RhiError({
      code: "webgpu-runtime-error",
      expected: "transmissionBackdropView != null for a backdrop-consuming record mode",
      hint: "the typed Standard backdrop pass must resolve its graph-paired color view"
    });
  }
  const colorViews = options?.colorViews ?? [geometryColorView];
  const colorFormats = options?.colorFormats ?? [
    c.tonemapActive || c.transparentColorFormat === "rgba16float" ? "rgba16float" : pipelineState.colorAttachmentFormat
  ];
  const targetDepthView = options?.depthView ?? geometryDepthView;
  const clearColor = options?.clearColor ?? clear;
  const videoHighPerfAvailable = probeVideoHighPerfUpload(runtime.device);
  const clusteredLighting = c.standardLighting?.kind === "clustered";
  const clusteredBindGroupMissing = validatedOrdered.length > 0 && !standardTopologyBindGroupReady(c.standardLighting, hdrpClusterBindGroup);
  const hdrpBuffers = clusteredLighting ? getOrCreateHdrpBuffers(runtime, frameState.installedPipelineConfig?.clusterGrid) : null;
  let hdrpSsaoBindGroup = null;
  if (hdrpClusterBindGroup !== null && c.hdrpSsaoBlurredView !== void 0) {
    if (hdrpBuffers !== null) {
      hdrpSsaoBindGroup = createHdrpUnifiedBindGroup(
        runtime,
        hdrpBuffers,
        pipelineState.meshStorageBuffer.buffer,
        { enabled: true, ssaoBlurredView: c.hdrpSsaoBlurredView }
      );
    }
  }
  const meshGroup2 = clusteredLighting ? hdrpSsaoBindGroup ?? hdrpClusterBindGroup : meshBindGroup;
  if (gpuDrivenStandardPbrFrameResources !== void 0) {
    gpuDrivenStandardPbrFrameResources.clusterBindGroup = clusteredLighting && meshGroup2 !== null ? meshGroup2 : void 0;
    if (hdrpBuffers === null) {
      gpuDrivenStandardPbrFrameResources.clusterBindGroupForMesh = void 0;
      gpuDrivenStandardPbrFrameResources.clusterBindGroupForSkin = void 0;
    } else {
      const projectedGroups = /* @__PURE__ */ new Map();
      gpuDrivenStandardPbrFrameResources.clusterBindGroupForMesh = (meshBuffer, bindingBytes) => {
        const cached = projectedGroups.get(meshBuffer);
        if (cached !== void 0) return cached;
        const created = createHdrpUnifiedBindGroup(
          runtime,
          hdrpBuffers,
          meshBuffer,
          c.hdrpSsaoBlurredView === void 0 ? { enabled: false } : { enabled: true, ssaoBlurredView: c.hdrpSsaoBlurredView },
          bindingBytes
        );
        if (created !== null) projectedGroups.set(meshBuffer, created);
        return created ?? void 0;
      };
      const projectedSkinGroups = /* @__PURE__ */ new Map();
      gpuDrivenStandardPbrFrameResources.clusterBindGroupForSkin = (meshBuffer, meshBindingBytes, paletteBuffer, paletteBindingWindowBytes) => {
        let meshGroups = projectedSkinGroups.get(meshBuffer);
        if (meshGroups === void 0) {
          meshGroups = /* @__PURE__ */ new Map();
          projectedSkinGroups.set(meshBuffer, meshGroups);
        }
        let paletteGroups = meshGroups.get(paletteBuffer);
        if (paletteGroups === void 0) {
          paletteGroups = /* @__PURE__ */ new Map();
          meshGroups.set(paletteBuffer, paletteGroups);
        }
        const bindingKey = `${meshBindingBytes}:${paletteBindingWindowBytes}`;
        const cached = paletteGroups.get(bindingKey);
        if (cached !== void 0) return cached;
        const skinLayout = pipelineState.hdrpSkinMeshBindGroupLayout;
        if (skinLayout === null) return void 0;
        const created = createHdrpSkinUnifiedBindGroup(
          runtime,
          hdrpBuffers,
          skinLayout,
          meshBuffer,
          paletteBuffer,
          paletteBindingWindowBytes,
          c.hdrpSsaoBlurredView === void 0 ? { enabled: false } : { enabled: true, ssaoBlurredView: c.hdrpSsaoBlurredView },
          meshBindingBytes
        );
        if (created !== null) paletteGroups.set(bindingKey, created);
        return created ?? void 0;
      };
    }
  }
  let geometryPassEnded = false;
  const mainColorLoadOp = skyboxActive ? "load" : "clear";
  const mainPassResolves = passKind === "forward" && msaaActive && geometryColorResolveView !== null && !splitLdrSprite;
  const pass = graphPass ?? encoder.beginRenderPass(
    buildBeginRenderPassDescriptor(
      {
        depthFormat: "depth24plus-stencil8"},
      {
        colorViews,
        depthView: targetDepthView,
        ...mainPassResolves ? { resolveTargets: [geometryColorResolveView] } : {}
      },
      passKind,
      {
        colorLoadOp: mainColorLoadOp,
        clearColor: {
          r: clearColor[0] ?? 0,
          g: clearColor[1] ?? 0,
          b: clearColor[2] ?? 0,
          a: clearColor[3] ?? 1
        }
      }
    )
  );
  const matchedIndices = selector !== void 0 ? buildMatchedRenderableIndices(dispatch, selector) : null;
  const selectorMatchedMaterials = selector !== void 0 ? buildMatchedMaterialHandlesByRenderable(dispatch, selector, options?.excludeSelector) : null;
  const matchedMaterials = matchedMaterialsForRecordMode(c, selectorMatchedMaterials, recordMode);
  const selectedDispatch = dispatch.length === 0 ? void 0 : filterDispatchBySelector(
    dispatch,
    selector ?? { LightMode: [passKind === "deferred" ? "Deferred" : "Forward"] }
  );
  const recordContext = recordMode === void 0 ? c : {
    ...c,
    splitLdrSprite: recordMode === "transparent" ? false : c.splitLdrSprite
  };
  if (clusteredBindGroupMissing) {
    runtime.errorRegistry.fire(
      new RhiError({
        code: "webgpu-runtime-error",
        expected: "clustered Standard frame has a unified group(2) BindGroup",
        hint: "repair the clustered buffer/layout admission before retrying the frame; direct URP fallback is unsafe"
      })
    );
  }
  if (validatedOrdered.length > 0 && !clusteredBindGroupMissing) {
    const MATERIAL_SLICE = STANDARD_PBR_UBO_SIZE;
    const { skylightResources, activeViews } = prepareMaterialSkylight(c);
    if (materialDiagnosticsEnabled3()) {
      const activeCache = activeViews === void 0 ? void 0 : getOrCreateIblCache(runtime.deviceScope);
      const prefilterViewMipCount = activeCache?.prefilterFaceViewsByMip?.length ?? (activeViews === void 0 ? 1 : 0);
      frameState.iblBindingInspection = {
        status: "binding-chain-consistent",
        frameId: frameState.frameNumber,
        deviceGeneration: runtime.deviceScope.generation,
        active: activeViews === void 0 ? "fallback" : "active",
        cache: {
          identity: getOpaqueResourceIdentity(
            activeCache ?? pipelineState.skylightFallback
          ),
          generation: runtime.deviceScope.generation,
          prefilterMipCount: prefilterViewMipCount,
          prefilterViewMipCount
        },
        sampler: {
          expected: {
            magFilter: "linear",
            minFilter: "linear",
            mipmapFilter: "linear",
            addressModeU: "clamp-to-edge",
            addressModeV: "clamp-to-edge",
            addressModeW: "clamp-to-edge"
          },
          identities: [
            getOpaqueResourceIdentity(skylightResources.irradianceSampler),
            getOpaqueResourceIdentity(skylightResources.prefilterSampler),
            getOpaqueResourceIdentity(skylightResources.irradianceSampler)
          ]
        },
        resources: {
          irradiance: {
            viewIdentity: getOpaqueResourceIdentity(skylightResources.irradianceView),
            samplerIdentity: getOpaqueResourceIdentity(
              skylightResources.irradianceSampler
            ),
            deviceGeneration: runtime.deviceScope.generation
          },
          prefilter: {
            viewIdentity: getOpaqueResourceIdentity(skylightResources.prefilterView),
            samplerIdentity: getOpaqueResourceIdentity(
              skylightResources.prefilterSampler
            ),
            deviceGeneration: runtime.deviceScope.generation
          },
          brdfLut: {
            viewIdentity: getOpaqueResourceIdentity(skylightResources.brdfLutView),
            samplerIdentity: getOpaqueResourceIdentity(
              skylightResources.irradianceSampler
            ),
            deviceGeneration: runtime.deviceScope.generation
          },
          intensityBufferIdentity: getOpaqueResourceIdentity(
            skylightResources.intensityBuffer
          )
        },
        errors: []
      };
    }
    const hasProbeBindings = (c.reflectionProbes?.table.rows.length ?? 0) > 0;
    const worldIndices = hasProbeBindings ? new Map(
      validatedOrdered.map((entry) => [entry.world ?? world, entry.source.worldId])
    ) : void 0;
    const perSubmeshMaterialBgDeps = {
      runtime,
      pipelineState,
      world,
      store,
      materialSlice: MATERIAL_SLICE,
      videoHighPerfAvailable,
      skylightResources,
      resolveRenderTargetTextureSource: runtime.resolveRenderTargetTextureSource,
      resolveReflectionProbeResources: (materialWorld, entityKey) => {
        const reflectionProbes = c.reflectionProbes;
        if (reflectionProbes === void 0 || !hasProbeBindings) return void 0;
        const selection = reflectionProbes.selections.get(
          `${worldIndices?.get(materialWorld)}:${entityKey}`
        );
        if (selection === void 0) return void 0;
        const binding = resolveReflectionProbeBinding(selection, reflectionProbes.table);
        if (binding.useSkylight || binding.probeIndex === void 0) return void 0;
        const row = reflectionProbes.table.rows.find(
          (candidate) => candidate.index === binding.probeIndex
        );
        if (row?.filteredView === void 0 || row.sampler === void 0 || row.uniformBuffer === void 0) {
          return void 0;
        }
        const probeResources = {
          irradianceView: skylightResources.irradianceView,
          irradianceSampler: skylightResources.irradianceSampler,
          prefilterView: row.filteredView,
          skylightPrefilterView: skylightResources.prefilterView,
          prefilterSampler: row.sampler,
          brdfLutView: skylightResources.brdfLutView,
          intensityBuffer: row.uniformBuffer
        };
        return { resources: probeResources, probeIndex: row.index };
      },
      materialBgShared: frameState.materialBgShared,
      materialBgAssemblyCache: c.materialBgAssemblyCache,
      frameState,
      bindGroupCounts,
      ...gpuDrivenStandardPbrFrameResources?.sceneMaterialBuffer === void 0 && gpuDrivenSceneMaterialBuffer === void 0 ? {} : {
        sceneMaterialBuffer: gpuDrivenStandardPbrFrameResources?.sceneMaterialBuffer ?? gpuDrivenSceneMaterialBuffer
      },
      ...transmissionBackdropView === void 0 ? {} : { transmissionBackdropView },
      ...surfaceRawDepthView === void 0 ? {} : { surfaceRawDepthView },
      ...surfaceNearestLayerView === void 0 ? {} : { surfaceNearestLayerView },
      ...surfaceNearestDepthView === void 0 ? {} : { surfaceNearestDepthView }
    };
    const buildPerSubmeshMaterialBg2 = (submeshMaterial, entityKey, materialWorld = world, materialShaderId = submeshMaterial.materialShaderId) => buildPerSubmeshMaterialBg(
      perSubmeshMaterialBgDeps,
      submeshMaterial,
      entityKey,
      materialWorld,
      materialShaderId
    );
    const preparedMaterialBindGroups = new Array(materialSlotCount);
    for (let materialSlot = 0; materialSlot < materialSlotCount; materialSlot += 1) {
      const material = materialSlots[materialSlot];
      if (material === void 0 || (material.videoTextureFields?.size ?? 0) > 0) continue;
      if (recordMode !== void 0 && !matchesRecordMode(material, recordMode)) continue;
      const owner = materialSlotOwners[materialSlot];
      if (owner === void 0) continue;
      preparedMaterialBindGroups[materialSlot] = buildPerSubmeshMaterialBg2(
        material,
        owner.source.entityKey,
        owner.world ?? world
      );
    }
    if (gpuDrivenStandardPbrFrameResources !== void 0) {
      gpuDrivenStandardPbrFrameResources.resolveClusteredMeshBindGroup = (binding) => {
        const buffers = getOrCreateHdrpBuffers(
          runtime,
          frameState.installedPipelineConfig?.clusterGrid
        );
        const layout = binding.paletteBuffer === void 0 ? pipelineState.hdrpMeshBindGroupLayout : pipelineState.hdrpSkinMeshBindGroupLayout;
        const group = buffers === null || layout == null ? null : createGpuDrivenLightingBindGroup(
          runtime,
          buffers,
          layout,
          binding,
          c.hdrpSsaoBlurredView
        );
        if (group === null)
          throw new RhiError({
            code: "rhi-not-available",
            expected: "scene-index clustered lighting binding",
            hint: "publish scene rows and the current lighting/AO resources before indirect drawing"
          });
        return group;
      };
      gpuDrivenStandardPbrFrameResources.materialBindGroups.length = 0;
      gpuDrivenStandardPbrFrameResources.materialBindGroups.push(...preparedMaterialBindGroups);
      gpuDrivenStandardPbrFrameResources.colorFormats = colorFormats;
      const selectedMaterialSlots = /* @__PURE__ */ new Set();
      if (matchedMaterials === null)
        delete gpuDrivenStandardPbrFrameResources.selectedMaterialSlots;
      else gpuDrivenStandardPbrFrameResources.selectedMaterialSlots = selectedMaterialSlots;
      gpuDrivenStandardPbrFrameResources.materialSlotIndicesByEntity.clear();
      for (let index = 0; index < validatedOrdered.length; index += 1) {
        const entry = validatedOrdered[index];
        if (entry === void 0) continue;
        const selected = matchedMaterials?.get(entry.renderableIndex);
        const materials = entry.source.materials.length > 0 ? entry.source.materials : [entry.source.material];
        for (let slot = 0; slot < materials.length; slot += 1) {
          const handle = materials[slot]?.materialHandle ?? -1;
          const globalSlot = materialSlotIndices[index]?.[slot];
          if (globalSlot !== void 0 && selected?.has(handle))
            selectedMaterialSlots.add(globalSlot);
        }
        gpuDrivenStandardPbrFrameResources.materialSlotIndicesByEntity.set(
          worldEntityKey(entry.source.worldId, entry.source.entityKey),
          materialSlotIndices[index] ?? []
        );
      }
    }
    const resolveMaterialBindGroup = (materialSlot, material, entityKey, materialWorld = world, materialShaderId = material.materialShaderId) => !hasProbeBindings && materialShaderId === material.materialShaderId && materialShaderId !== POINTS_LINES_MATERIAL_SHADER_ID ? preparedMaterialBindGroups[materialSlot] ?? buildPerSubmeshMaterialBg2(material, entityKey, materialWorld, materialShaderId) : buildPerSubmeshMaterialBg2(material, entityKey, materialWorld, materialShaderId);
    pass.setBindGroup(0, viewBindGroup, [viewBindGroupDynamicOffset, 0]);
    const recordGeometry = () => {
      recordGeometryDraws(
        recordContext,
        pass,
        matchedMaterials,
        materialSlotIndices,
        sampleCount,
        meshGroup2,
        meshBindGroup,
        resolveMaterialBindGroup,
        passKind,
        selectedDispatch,
        colorFormats,
        options?.coverageOnly ?? false,
        options?.fragmentEntryPoint,
        recordMode === "single-layer-medium-nearest-layer" ? "nearest-layer" : recordMode === "single-layer-medium-color" ? "color" : void 0,
        options?.transparentDepthWrite ?? false
      );
    };
    if (c.profilePhase === void 0) {
      recordGeometry();
    } else {
      const passName = passKind === "deferred" ? "g-buffer" : "forward";
      c.profilePhase(
        `record/graph-execute/${passName}/geometry-loop`,
        recordGeometry
      );
    }
    if (options?.gpuDriven !== void 0) {
      if (viewBindGroup === null) {
        throw new RhiError({
          code: "rhi-not-available",
          expected: "main-pass Standard PBR view bind group for GPU-driven encode",
          hint: "publish the current frame view/light/shadow bind group before GPU raster"
        });
      }
      if (gpuDrivenStandardPbrFrameResources === void 0 || gpuDrivenStandardPbrFrameResources.materialBindGroups.length === 0) {
        throw new RhiError({
          code: "rhi-not-available",
          expected: "complete main-pass Standard PBR material bind-group receipt",
          hint: "finish frame material producer assembly before GPU-driven encode"
        });
      }
      options.gpuDriven.projection.encode(
        viewBindGroup,
        pass,
        options.gpuDriven.resources,
        gpuDrivenStandardPbrFrameResources,
        options.gpuDrivenFilter,
        options?.fragmentEntryPoint
      );
    }
    if (passKind === "forward" && recordMode === void 0) {
      geometryPassEnded = recordSpritePass(
        c,
        pass,
        matchedIndices,
        materialSlotIndices,
        sampleCount,
        resolveMaterialBindGroup,
        graphPass,
        selectedDispatch
      );
    }
  }
  if (!geometryPassEnded && graphPass === void 0) {
    pass.end();
  }
  return gpuDrivenStandardPbrFrameResources;
}
function encodeMainPass(c, pass, selector, options) {
  return recordMainPass(c, selector, options, pass);
}

// src/assembly/webgpu-ready-contract.ts
var VIEW_UBO_BYTES = VIEW_UNIFORM_BUFFER_SIZE;
var MIPMAP_PREWARM_FORMATS = [
  "rgba8unorm-srgb",
  "rgba8unorm",
  "rgba16float"
];
var BLOOM_UNIFORM_PARAMS_STRIDE_BYTES = 256;
var BLOOM_DOWNSAMPLE_PARAMS_BYTES = 5 * BLOOM_UNIFORM_PARAMS_STRIDE_BYTES;
var BLOOM_UPSAMPLE_PARAMS_BYTES = 4 * BLOOM_UNIFORM_PARAMS_STRIDE_BYTES;
var BLOOM_COMPOSITE_PARAMS_BYTES = 16;
var HDR_COLOR_ATTACHMENT_FORMAT = "rgba16float";
var DEPTH_TEXTURE_FORMAT = "depth24plus-stencil8";

// src/bloom-admission.ts
function standardBloomAdmitted(camera) {
  return camera !== void 0 && camera.bloom === "on" && camera.bloomIntensity > 0 && camera.tonemap !== "none";
}

// src/record/skybox-post-pass.ts
function recordSkyboxPass(c, graphPass) {
  if (!c.skyboxActive) return;
  const skyboxSnapshot = c.skybox;
  if (skyboxSnapshot === void 0) return;
  const { runtime, store, encoder, pipelineState } = c;
  const hdrColorView = pipelineState.perPassResources.hdrColorView;
  if (graphPass === void 0 && hdrColorView === null) return;
  const skyboxColorView = graphPass === void 0 ? c.msaaActive ? pipelineState.perPassResources.hdrColorMsaaView : hdrColorView : null;
  if (graphPass === void 0 && skyboxColorView === null) return;
  const skyboxPipeline = c.msaaActive ? pipelineState.perPassResources.skyboxPipelineMsaa : pipelineState.perPassResources.skyboxPipeline;
  const skyboxBgl = pipelineState.perPassResources.skyboxBindGroupLayout;
  const skyboxSampler = pipelineState.perPassResources.skyboxSampler;
  const skyboxRotationBuffer = pipelineState.perPassResources.skyboxRotationBuffer;
  if (skyboxPipeline === null || skyboxBgl === null || skyboxSampler === null || skyboxRotationBuffer === null)
    return;
  const rotation = skyboxSnapshot.rotation;
  const rotationUpload = runtime.device.queue.writeBuffer(
    skyboxRotationBuffer,
    0,
    new Float32Array([rotation[0], rotation[1], rotation[2], rotation[3]])
  );
  if (!rotationUpload.ok) throw rotationUpload.error;
  const cubemapView = store.getCubemapGpuView(
    toShared(skyboxSnapshot.equirectHandle)
  );
  if (cubemapView === void 0) return;
  const skyboxBg = getOrCreateFromChain(
    c.frameState.postProcessBgCache,
    [cubemapView],
    "skybox",
    () => {
      const skyboxBgRes = runtime.device.createBindGroup({
        label: "skybox-bg",
        layout: skyboxBgl,
        entries: [
          {
            binding: 0,
            resource: { kind: "textureView", value: cubemapView }
          },
          {
            binding: 1,
            resource: { kind: "sampler", value: skyboxSampler }
          },
          {
            binding: 2,
            resource: {
              kind: "buffer",
              value: { buffer: pipelineState.viewUniformBuffer, size: VIEW_UNIFORM_BYTES }
            }
          },
          {
            binding: 3,
            resource: {
              kind: "buffer",
              value: { buffer: skyboxRotationBuffer }
            }
          }
        ]
      });
      if (!skyboxBgRes.ok) throw skyboxBgRes.error;
      return skyboxBgRes.value;
    },
    c.bindGroupCounts
  );
  const skyboxPass = graphPass ?? encoder.beginRenderPass(
    buildBeginRenderPassDescriptor(
      { depthFormat: void 0},
      { colorViews: [skyboxColorView] },
      "skybox"
    )
  );
  skyboxPass.setPipeline(skyboxPipeline);
  skyboxPass.setBindGroup(0, skyboxBg);
  skyboxPass.draw(3);
  if (graphPass === void 0) skyboxPass.end();
}
function encodeSkyboxPass(c, pass) {
  recordSkyboxPass(c, pass);
}
var EMPTY_BLOOM_RECEIPTS = {
  uploadCount: 0,
  bindGroupCount: 0,
  encodeCount: 0
};
function updateBloomReceipts(c, field) {
  const current = c.frameState.bloomFrameReceipts ?? EMPTY_BLOOM_RECEIPTS;
  c.frameState.bloomFrameReceipts = {
    ...current,
    [field]: current[field] + 1
  };
}
function stageBloomUpload(c) {
  updateBloomReceipts(c, "uploadCount");
}
function stageBloomBindGroup(c) {
  updateBloomReceipts(c, "bindGroupCount");
}
function stageBloomEncode(c) {
  updateBloomReceipts(c, "encodeCount");
}
function throwBloomRecordFailure(expected) {
  throw new RhiError({
    code: "webgpu-runtime-error",
    expected,
    hint: "repair the Bloom candidate resources before retrying the frame"
  });
}
function bloomRecordActive(c) {
  return standardBloomAdmitted(c.camera) && c.tonemapActive;
}
function assertBloomGraphPassActive(c, graphPass) {
  if (graphPass === void 0 || bloomRecordActive(c)) return;
  throwBloomRecordFailure(
    "Bloom graph pass encodes when Standard Bloom is admitted and tone mapping is active"
  );
}
function recordBloomDownsamplePass(_c, resolve, graphPass, level = 0, destinationSize) {
  const { runtime, encoder, camera, frameState, bindGroupCounts } = _c;
  const pp = _c.bloomResources;
  assertBloomGraphPassActive(_c, graphPass);
  if (!bloomRecordActive(_c)) return;
  if (pp === void 0 || pp === null || pp.bloomDownsamplePipeline === null || pp.bloomDownsampleBindGroupLayout === null || pp.bloomSampler === null || pp.bloomDownsampleParamsBuffer === null) {
    throwBloomRecordFailure("Bloom downsample resources are ready before encoding");
  }
  const downsamplePipeline = pp.bloomDownsamplePipeline;
  const downsampleLayout = pp.bloomDownsampleBindGroupLayout;
  const bloomSampler = pp.bloomSampler;
  const downsampleParamsBuffer = pp.bloomDownsampleParamsBuffer;
  const sourceName = level === 0 ? "hdrColor" : `bloomDownsample${level - 1}`;
  const targetName = `bloomDownsample${level}`;
  const sourceView = resolve?.resolve(sourceName);
  const targetView = resolve?.resolve(targetName);
  if (sourceView === void 0 || targetView === void 0) {
    throwBloomRecordFailure(`Bloom downsample level ${level} resolves source and target views`);
  }
  const size = destinationSize ?? {
    width: Math.max(1, Math.ceil(_c.targetW / 2)),
    height: Math.max(1, Math.ceil(_c.targetH / 2))
  };
  const params = new Float32Array([
    camera.bloomThreshold,
    camera.bloomSoftKnee,
    size.width,
    size.height,
    level,
    0,
    0,
    0
  ]);
  const offset = level * BLOOM_UNIFORM_PARAMS_STRIDE_BYTES;
  const upload = runtime.device.queue.writeBuffer(pp.bloomDownsampleParamsBuffer, offset, params);
  if (!upload.ok) throw upload.error;
  stageBloomUpload(_c);
  const bindGroup = getOrCreateFromChain(
    frameState.postProcessBgCache,
    [sourceView, downsampleParamsBuffer],
    `bloom-downsample-${level}`,
    () => {
      const created = runtime.device.createBindGroup({
        label: `bloom-downsample-${level}-bg`,
        layout: downsampleLayout,
        entries: [
          { binding: 0, resource: { kind: "textureView", value: sourceView } },
          { binding: 1, resource: { kind: "sampler", value: bloomSampler } },
          {
            binding: 2,
            resource: {
              kind: "buffer",
              value: { buffer: downsampleParamsBuffer, offset, size: 32 }
            }
          }
        ]
      });
      if (!created.ok) throw created.error;
      return created.value;
    },
    bindGroupCounts
  );
  const pass = graphPass ?? encoder.beginRenderPass(
    buildBeginRenderPassDescriptor(
      { depthFormat: void 0},
      { colorViews: [targetView] },
      "bloom-downsample"
    )
  );
  pass.setPipeline(downsamplePipeline);
  pass.setBindGroup(0, bindGroup);
  stageBloomBindGroup(_c);
  pass.draw(3, 1, 0, 0);
  stageBloomEncode(_c);
  if (graphPass === void 0) pass.end();
}
function recordBloomUpsamplePass(_c, resolve, graphPass, level = 0) {
  const { runtime, encoder, frameState, bindGroupCounts } = _c;
  const pp = _c.bloomResources;
  assertBloomGraphPassActive(_c, graphPass);
  if (!bloomRecordActive(_c)) return;
  if (pp === void 0 || pp === null || pp.bloomUpsamplePipeline === null || pp.bloomUpsampleBindGroupLayout === null || pp.bloomSampler === null || pp.bloomUpsampleParamsBuffer === null) {
    throwBloomRecordFailure("Bloom upsample resources are ready before encoding");
  }
  const upsamplePipeline = pp.bloomUpsamplePipeline;
  const upsampleLayout = pp.bloomUpsampleBindGroupLayout;
  const bloomSampler = pp.bloomSampler;
  const upsampleParamsBuffer = pp.bloomUpsampleParamsBuffer;
  const currentView = resolve?.resolve(`bloomDownsample${level}`);
  const nextUpsampleView = resolve?.resolve(`bloomUpsample${level + 1}`);
  const coarseView = nextUpsampleView ?? resolve?.resolve(`bloomDownsample${level + 1}`);
  const targetView = resolve?.resolve(`bloomUpsample${level}`);
  if (currentView === void 0 || coarseView === void 0 || targetView === void 0) {
    throwBloomRecordFailure(`Bloom upsample level ${level} resolves adjacent pyramid views`);
  }
  const params = new Float32Array([_c.camera.bloomScatter, 0, 0, 0]);
  const offset = level * BLOOM_UNIFORM_PARAMS_STRIDE_BYTES;
  const upload = runtime.device.queue.writeBuffer(pp.bloomUpsampleParamsBuffer, offset, params);
  if (!upload.ok) throw upload.error;
  stageBloomUpload(_c);
  const bindGroup = getOrCreateFromChain(
    frameState.postProcessBgCache,
    [currentView, coarseView, upsampleParamsBuffer],
    `bloom-upsample-${level}`,
    () => {
      const created = runtime.device.createBindGroup({
        label: `bloom-upsample-${level}-bg`,
        layout: upsampleLayout,
        entries: [
          { binding: 0, resource: { kind: "textureView", value: currentView } },
          { binding: 1, resource: { kind: "textureView", value: coarseView } },
          { binding: 2, resource: { kind: "sampler", value: bloomSampler } },
          {
            binding: 3,
            resource: { kind: "buffer", value: { buffer: upsampleParamsBuffer, offset, size: 16 } }
          }
        ]
      });
      if (!created.ok) throw created.error;
      return created.value;
    },
    bindGroupCounts
  );
  const pass = graphPass ?? encoder.beginRenderPass(
    buildBeginRenderPassDescriptor(
      { depthFormat: void 0},
      { colorViews: [targetView] },
      "bloom-upsample"
    )
  );
  pass.setPipeline(upsamplePipeline);
  pass.setBindGroup(0, bindGroup);
  stageBloomBindGroup(_c);
  pass.draw(3, 1, 0, 0);
  stageBloomEncode(_c);
  if (graphPass === void 0) pass.end();
}
function recordBloomCompositePass(_c, resolve, graphPass) {
  const { runtime, encoder, camera, frameState, bindGroupCounts } = _c;
  const pp = _c.bloomResources;
  assertBloomGraphPassActive(_c, graphPass);
  if (!bloomRecordActive(_c)) return;
  if (pp === null || pp === void 0) {
    throwBloomRecordFailure("Bloom persistent resources are ready before composite encoding");
  }
  if (pp.bloomCompositePipeline === null || pp.bloomCompositeBindGroupLayout === null || pp.bloomSampler === null || pp.bloomCompositeParamsBuffer === null) {
    throwBloomRecordFailure(
      "Bloom composite pass has pipeline, layout, sampler, and params buffer"
    );
  }
  const hdrColorView = resolve?.resolve("hdrColor");
  const bloomView = resolve?.resolve("bloomUpsample0");
  const finestBloomView = bloomView ?? resolve?.resolve("bloomDownsample0");
  const hdrCompositedView = resolve?.resolve("hdrComposited");
  if (!hdrColorView || !finestBloomView || !hdrCompositedView) {
    throwBloomRecordFailure("Bloom composite pass resolves scene, finest Bloom, and target views");
  }
  const bglComposite = pp.bloomCompositeBindGroupLayout;
  const bloomSampler = pp.bloomSampler;
  const paramsBuffer = pp.bloomCompositeParamsBuffer;
  const compositeParams = new Float32Array(4);
  compositeParams[0] = camera.bloomIntensity;
  compositeParams[1] = 0;
  compositeParams[2] = 0;
  compositeParams[3] = 0;
  const paramsWrite = runtime.device.queue.writeBuffer(paramsBuffer, 0, compositeParams);
  if (!paramsWrite.ok) throw paramsWrite.error;
  stageBloomUpload(_c);
  const bindGroup = getOrCreateFromChain(
    frameState.postProcessBgCache,
    [hdrColorView, finestBloomView],
    "bloom-composite",
    () => {
      const bgRes = runtime.device.createBindGroup({
        label: "bloom-composite-bg",
        layout: bglComposite,
        entries: [
          { binding: 0, resource: { kind: "textureView", value: hdrColorView } },
          { binding: 1, resource: { kind: "textureView", value: finestBloomView } },
          { binding: 2, resource: { kind: "sampler", value: bloomSampler } },
          {
            binding: 3,
            resource: { kind: "buffer", value: { buffer: paramsBuffer } }
          }
        ]
      });
      if (!bgRes.ok) throw bgRes.error;
      return bgRes.value;
    },
    bindGroupCounts
  );
  const pass = graphPass ?? encoder.beginRenderPass(
    buildBeginRenderPassDescriptor(
      { depthFormat: void 0},
      { colorViews: [hdrCompositedView] },
      "bloom-composite",
      { colorLoadOp: "clear" }
    )
  );
  pass.setPipeline(pp.bloomCompositePipeline);
  pass.setBindGroup(0, bindGroup);
  stageBloomBindGroup(_c);
  pass.draw(3, 1, 0, 0);
  stageBloomEncode(_c);
  if (graphPass === void 0) pass.end();
}
function recordFxaaPass(c, resolve, graphPass, paramsOverride, graphOutputFormat) {
  const { runtime, pipelineState, encoder, camera, currentTexture } = c;
  const fxaaActive = camera.antialias === "fxaa";
  if (fxaaActive && pipelineState.perPassResources.fxaaPipeline !== null && pipelineState.perPassResources.fxaaBindGroupLayout !== null && pipelineState.perPassResources.fxaaSampler !== null && runtime.getPostProcessParamsBuffer !== void 0) {
    const inputView = resolve.resolve("input") ?? resolve.resolve("ldrColor");
    if (inputView === void 0) return;
    const fxaaParams = runtime.getPostProcessParamsBuffer(FXAA_POST_PROCESS_ID);
    if (fxaaParams === void 0) return;
    const params = paramsOverride?.byteLength === 16 ? paramsOverride : new Float32Array(4);
    if (paramsOverride === void 0) {
      params[0] = resolveOutputDither(c.frameState.installedPipelineConfig) ? 1 : 0;
    }
    const paramsWrite = runtime.device.queue.writeBuffer(fxaaParams, 0, params);
    if (!paramsWrite.ok) throw paramsWrite.error;
    const fxaaBglLayout = pipelineState.perPassResources.fxaaBindGroupLayout;
    const fxaaSampler = pipelineState.perPassResources.fxaaSampler;
    const fxaaBg = getOrCreateFromChain(
      c.frameState.postProcessBgCache,
      [inputView, fxaaParams],
      "fxaa",
      () => {
        const fxaaBgRes = runtime.device.createBindGroup({
          label: "fxaa-bg",
          layout: fxaaBglLayout,
          entries: [
            {
              binding: 0,
              resource: {
                kind: "textureView",
                value: inputView
              }
            },
            {
              binding: 1,
              resource: { kind: "sampler", value: fxaaSampler }
            },
            {
              binding: 2,
              resource: { kind: "buffer", value: { buffer: fxaaParams } }
            }
          ]
        });
        if (!fxaaBgRes.ok) throw fxaaBgRes.error;
        return fxaaBgRes.value;
      },
      c.bindGroupCounts
    );
    const fxaaColorFormat = graphPass !== void 0 && graphOutputFormat !== void 0 ? graphOutputFormat : runtime.device.caps.storageBuffer ? pipelineState.format : pipelineState.colorAttachmentFormat;
    let fxaaPass = graphPass;
    if (fxaaPass === void 0) {
      const fxaaOutputView = runtime.device.createTextureView(currentTexture, {
        format: fxaaColorFormat
      });
      if (!fxaaOutputView.ok) {
        runtime.errorRegistry.fire(fxaaOutputView.error);
        return;
      }
      fxaaPass = encoder.beginRenderPass(
        buildBeginRenderPassDescriptor(
          {
            depthFormat: void 0},
          { colorViews: [fxaaOutputView.value] },
          "fxaa"
        )
      );
    }
    let fxaaPipeline = pipelineState.perPassResources.fxaaPipeline;
    if (graphPass !== void 0 && graphOutputFormat !== void 0) {
      const entry = runtime.lookupPostProcess?.(FXAA_POST_PROCESS_ID);
      const rebuilt = entry === void 0 || runtime.getPostProcessPipeline === void 0 ? null : runtime.getPostProcessPipeline(
        FXAA_POST_PROCESS_ID,
        fxaaBglLayout,
        [graphOutputFormat],
        entry
      );
      if (rebuilt !== null) fxaaPipeline = rebuilt;
    }
    if (fxaaPipeline === null) return;
    fxaaPass.setPipeline(fxaaPipeline);
    fxaaPass.setBindGroup(0, fxaaBg);
    fxaaPass.draw(3, 1, 0, 0);
    if (graphPass === void 0) fxaaPass.end();
  }
}

// src/fullscreen-post-process-pass.ts
var FULLSCREEN_DEFAULT_SPEC = Object.freeze({
  shader: { id: "", passKind: "forward", variantSet: void 0 },
  attachments: {
    colorFormats: ["rgba16float"],
    depthFormat: void 0,
    sampleCount: 1
  },
  geometry: { topology: "triangle-list", vertexLayout: {} },
  renderState: void 0
});
function postProcessSourceDigest(source) {
  let first = 2166136261;
  let second = 2654435769;
  for (let index = 0; index < source.length; index += 1) {
    const code = source.charCodeAt(index);
    first = Math.imul(first ^ code, 16777619);
    second = Math.imul(second ^ code + index, 16777619);
  }
  return `${source.length.toString(16)}-${(first >>> 0).toString(16).padStart(8, "0")}-${(second >>> 0).toString(16).padStart(8, "0")}`;
}
function postProcessShaderPipelineLabel(identity, source) {
  return `post-process-${identity}-pso-${postProcessSourceDigest(source)}`;
}
function postProcessShaderModuleLabel(source) {
  return `post-process-module-${postProcessSourceDigest(source)}`;
}
var postProcessSources = /* @__PURE__ */ new WeakMap();
function postProcessShaderEntrySignature(entry) {
  let cached = postProcessSources.get(entry);
  if (cached?.source !== entry.source) {
    cached = { source: entry.source, digest: postProcessSourceDigest(entry.source) };
    postProcessSources.set(entry, cached);
  }
  return JSON.stringify({
    source: cached.digest,
    fragmentEntryPoint: entry.fragmentEntryPoint,
    params: entry.params === void 0 ? void 0 : {
      byteSize: entry.params.byteSize,
      defaultValue: Array.from(entry.params.defaultValue)
    },
    reads: entry.reads,
    usesView: entry.usesView,
    storageBindings: entry.storageBindings
  });
}
function isTemporalFullscreenBinding(values) {
  return values.temporal !== void 0 || values.shader === "forgeax.taa-resolve" || values.shader === "forgeax.motion-blur";
}
function createFullscreenSampler(device) {
  const res = device.createSampler({
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
    magFilter: "linear",
    minFilter: "linear"
  });
  if (!res.ok) return null;
  return res.value;
}
function createDepthSampler(device) {
  const res = device.createSampler({
    magFilter: "nearest",
    minFilter: "nearest",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge"
  });
  if (!res.ok) return null;
  return res.value;
}
function entryHasDepthRead(entry) {
  if (!entry.reads) return false;
  return entry.reads.some((r) => typeof r !== "string" && r.sampleType === "depth");
}
var DEPTH_MIN_PARAMS_BYTE_SIZE = 16;
function buildFullscreenPostProcessPass(ctx, entry, depthMultisampled = false) {
  const { device } = ctx;
  const hasDepth = entryHasDepthRead(entry);
  const hasMultisampledColor = (entry.reads ?? []).some(
    (read) => typeof read !== "string" && read.sampleType === "multisampled-float"
  );
  const bglKind = hasDepth ? depthMultisampled ? hasMultisampledColor ? "fullscreen-post-with-paired-msaa" : "fullscreen-post-with-scene-depth-msaa" : "fullscreen-post-with-scene-depth" : entry.params !== void 0 ? "fullscreen-post-with-params" : "fullscreen-post";
  const descriptor = buildBindGroupLayoutDescriptor(FULLSCREEN_DEFAULT_SPEC, { kind: bglKind });
  const colorReads = (entry.reads ?? []).filter(
    (read) => typeof read === "string" || read.sampleType !== "depth"
  );
  const extraColorCount = Math.max(0, colorReads.length - 1);
  const firstExtraBinding = hasDepth ? 5 : entry.params === void 0 ? 2 : 3;
  for (let index = 0; index < extraColorCount; index += 1) {
    descriptor.entries.push({
      binding: firstExtraBinding + index,
      visibility: GPU_SHADER_STAGE_FRAGMENT,
      texture: { sampleType: "float", viewDimension: "2d" }
    });
  }
  const firstStorageBinding = firstExtraBinding + extraColorCount;
  for (const [index, binding] of (entry.storageBindings ?? []).entries()) {
    descriptor.entries.push({
      binding: binding ?? firstStorageBinding + index,
      visibility: GPU_SHADER_STAGE_FRAGMENT,
      buffer: { type: "read-only-storage" }
    });
  }
  const bglRes = device.createBindGroupLayout(descriptor);
  if (!bglRes.ok) {
    ctx.errorRegistry.fire(bglRes.error);
    return null;
  }
  const sampler = createFullscreenSampler(device);
  const depthSampler = hasDepth ? createDepthSampler(device) : null;
  return {
    bindGroupLayout: bglRes.value,
    sampler,
    depthSampler,
    extraColorBindings: Object.freeze(
      Array.from({ length: extraColorCount }, (_, index) => firstExtraBinding + index)
    ),
    extraStorageBindings: Object.freeze(
      (entry.storageBindings ?? []).map((binding, index) => binding ?? firstStorageBinding + index)
    ),
    createHandle: (name, pipeline, paramsBuffer) => ({
      name,
      paramsBuffer,
      draw(encoder, _inputView) {
        encoder.setPipeline(pipeline);
        encoder.draw(3, 1, 0, 0);
      }
    })
  };
}
function createFullscreenBindGroup(device, bgl, inputView, sampler, paramsBuffer, depthTexView, depthSampler, additionalViews = [], additionalBuffers = []) {
  const entries = [
    { binding: 0, resource: { kind: "textureView", value: inputView } }
  ];
  if (sampler) {
    entries.push({ binding: 1, resource: { kind: "sampler", value: sampler } });
  }
  if (paramsBuffer) {
    entries.push({ binding: 2, resource: { kind: "buffer", value: { buffer: paramsBuffer } } });
  }
  if (depthTexView && depthSampler) {
    entries.push({ binding: 3, resource: { kind: "textureView", value: depthTexView } });
    entries.push({ binding: 4, resource: { kind: "sampler", value: depthSampler } });
  }
  for (const additional of additionalViews) {
    entries.push({
      binding: additional.binding,
      resource: { kind: "textureView", value: additional.view }
    });
  }
  for (const additional of additionalBuffers) {
    entries.push({
      binding: additional.binding,
      resource: { kind: "buffer", value: { buffer: additional.buffer } }
    });
  }
  const res = device.createBindGroup({
    label: "fullscreen-post-process-bg",
    layout: bgl,
    entries
  });
  if (!res.ok) return null;
  return res.value;
}

// src/render-graph-primitives.ts
function requireRenderGraphRecordContext(ctx) {
  if (!("frameState" in ctx) || !("bindGroupCounts" in ctx) || !("geometryDepthKey" in ctx)) {
    throw new Error("typed render graph frame lacks the built-in record context");
  }
  return ctx;
}
function resolveDepthOnlyView(internals, key, label, preferredKey) {
  const graph = internals.frameState.perFrameGraph;
  if (graph === null || graph === void 0) return null;
  const preferredTexture = preferredKey === null || preferredKey === void 0 ? void 0 : graph.getColorTargetTexture(preferredKey);
  const tex = preferredTexture ?? graph.getColorTargetTexture(key);
  if (tex === void 0) return null;
  const res = internals.runtime.device.createTextureView(tex, {
    label,
    dimension: "2d",
    aspect: "depth-only",
    baseMipLevel: 0,
    mipLevelCount: 1,
    baseArrayLayer: 0,
    arrayLayerCount: 1
  });
  if (!res.ok) {
    internals.runtime.errorRegistry.fire(res.error);
    return null;
  }
  return res.value;
}
function resolveHdrDepthDepthOnlyView(internals, hdrDepthKey) {
  return resolveDepthOnlyView(internals, hdrDepthKey, "ssao-hdr-depth-only-view");
}
function ensureSsaoRecordCompanions(internals) {
  const pp = internals.pipelineState.perPassResources;
  if (pp.ssaoFilteringSampler !== null && pp.ssaoDepthSampler !== null && pp.ssaoFallbackRawView !== null) {
    return {
      filteringSampler: pp.ssaoFilteringSampler,
      depthSampler: pp.ssaoDepthSampler,
      fallbackRawView: pp.ssaoFallbackRawView
    };
  }
  const device = internals.runtime.device;
  if (pp.ssaoFilteringSampler === null) {
    const res = device.createSampler({
      label: "ssao-noise-sampler",
      magFilter: "nearest",
      minFilter: "nearest",
      mipmapFilter: "nearest",
      addressModeU: "repeat",
      addressModeV: "repeat"
    });
    if (!res.ok) {
      internals.runtime.errorRegistry.fire(res.error);
      return null;
    }
    pp.ssaoFilteringSampler = res.value;
  }
  if (pp.ssaoDepthSampler === null) {
    const res = device.createSampler({
      label: "ssao-depth-sampler",
      magFilter: "nearest",
      minFilter: "nearest",
      mipmapFilter: "nearest",
      addressModeU: "clamp-to-edge",
      addressModeV: "clamp-to-edge"
    });
    if (!res.ok) {
      internals.runtime.errorRegistry.fire(res.error);
      return null;
    }
    pp.ssaoDepthSampler = res.value;
  }
  if (pp.ssaoFallbackRawView === null) {
    const fb = getOrCreateSsaoFallbackTexture(internals.runtime);
    if (fb === null) return null;
    pp.ssaoFallbackRawView = fb.view;
  }
  return {
    filteringSampler: pp.ssaoFilteringSampler,
    depthSampler: pp.ssaoDepthSampler,
    fallbackRawView: pp.ssaoFallbackRawView
  };
}
function buildSsaoUniformPayload(internals) {
  const { camera, frameState } = internals;
  const sProj = computeProjectionMatrix(camera);
  if (camera.temporal?.currentJitterUv !== void 0) {
    const jitter = mat4.identity(mat4.create());
    jitter[12] = camera.temporal.currentJitterUv[0] * 2;
    jitter[13] = camera.temporal.currentJitterUv[1] * -2;
    mat4.multiply(sProj, jitter, sProj);
  }
  const sView = computeViewMatrix(camera);
  const invProj = mat4.create();
  mat4.invert(invProj, sProj);
  const out = new Float32Array(64);
  out.set(sView, 0);
  out.set(sProj, 16);
  out.set(invProj, 32);
  const ssaoConfig = frameState.installedPipelineConfig?.ssao;
  const parameters = getSsaoParameters(
    ssaoConfig !== void 0 && ssaoConfig.enabled === true ? ssaoConfig : void 0
  );
  out[48] = parameters.intensity;
  out[49] = parameters.radius;
  out[50] = parameters.bias;
  out[51] = SSAO_SAMPLE_COUNTS[parameters.quality];
  return out;
}
function recordSsaoCalcPass(_c, resolveCtx, ssaoRawKey, gbuf0Key, hdrDepthKey, graphPass, graphViews) {
  const { runtime, pipelineState, encoder } = _c;
  const pp = pipelineState.perPassResources;
  if (runtime.device.caps.backendKind === "wgpu-webgl2") {
    throw new RhiError({
      code: "feature-not-enabled",
      expected: "SSAO raw depth sampling on a WebGPU-capable backend",
      hint: "use WebGPU for SSAO or disable StandardProfile.ssao on the GLES fallback"
    });
  }
  if (pp.ssaoCalcPipeline === null || pp.ssaoBgl === null) {
    throw new PostProcessError({
      code: "post-process-not-found",
      detail: { id: "forgeax::post::ssao-calc" }
    });
  }
  if (graphViews === void 0 && (resolveCtx === void 0)) return;
  const ssaoRawView = graphViews?.output ?? resolveCtx?.resolve(ssaoRawKey);
  const gbuf0View = graphViews?.normal ?? (void 0);
  if (!ssaoRawView || !gbuf0View || graphViews === void 0 && hdrDepthKey === void 0) return;
  const hdrDepthView = graphViews?.depth ?? resolveHdrDepthDepthOnlyView(_c, hdrDepthKey);
  if (hdrDepthView === null) return;
  const hdrDepthPooledView = graphViews?.depthCacheKey ?? resolveCtx?.resolve(hdrDepthKey);
  if (hdrDepthPooledView === void 0) return;
  const ssaoBufs = getOrCreateSsaoBuffers(runtime);
  if (ssaoBufs === null) return;
  const noiseViewRes = runtime.device.createTextureView(ssaoBufs.noiseTexture, {
    label: "hdrp-ssao-noise-view",
    format: "rgba32float",
    dimension: "2d",
    aspect: "all",
    baseMipLevel: 0,
    mipLevelCount: 1,
    baseArrayLayer: 0,
    arrayLayerCount: 1
  });
  if (!noiseViewRes.ok) {
    runtime.errorRegistry.fire(noiseViewRes.error);
    return;
  }
  const companions = ensureSsaoRecordCompanions(_c);
  if (companions === null) return;
  const payload = buildSsaoUniformPayload(_c);
  const writeRes = runtime.device.queue.writeBuffer(ssaoBufs.uniformBuffer, 0, payload);
  if (!writeRes.ok) {
    runtime.errorRegistry.fire(writeRes.error);
    return;
  }
  const ssaoBgl = pp.ssaoBgl;
  const bindGroup = getOrCreateFromChain(
    _c.frameState.postProcessBgCache,
    [gbuf0View, hdrDepthPooledView],
    "ssao-calc",
    () => {
      const bgRes = runtime.device.createBindGroup({
        label: "ssao-calc-bg",
        layout: ssaoBgl,
        entries: [
          { binding: 0, resource: { kind: "buffer", value: { buffer: ssaoBufs.uniformBuffer } } },
          { binding: 1, resource: { kind: "buffer", value: { buffer: ssaoBufs.kernelBuffer } } },
          { binding: 2, resource: { kind: "textureView", value: noiseViewRes.value } },
          {
            binding: 3,
            resource: { kind: "sampler", value: companions.filteringSampler }
          },
          { binding: 4, resource: { kind: "textureView", value: gbuf0View } },
          { binding: 5, resource: { kind: "textureView", value: hdrDepthView } },
          { binding: 6, resource: { kind: "sampler", value: companions.depthSampler } },
          { binding: 7, resource: { kind: "textureView", value: companions.fallbackRawView } },
          { binding: 8, resource: { kind: "sampler", value: companions.filteringSampler } }
        ]
      });
      if (!bgRes.ok) throw bgRes.error;
      return bgRes.value;
    },
    _c.bindGroupCounts
  );
  const pass = graphPass ?? encoder.beginRenderPass(
    buildBeginRenderPassDescriptor(
      { depthFormat: void 0},
      { colorViews: [ssaoRawView] },
      "post-process"
    )
  );
  pass.setPipeline(pp.ssaoCalcPipeline);
  pass.setBindGroup(0, bindGroup);
  pass.draw(3, 1, 0, 0);
  if (graphPass === void 0) pass.end();
}
function recordSsaoBlurPass(_c, resolveCtx, ssaoBlurredKey, ssaoRawKey, gbuf0Key, hdrDepthKey, graphPass, graphViews) {
  const { runtime, pipelineState, encoder } = _c;
  const pp = pipelineState.perPassResources;
  if (pp.ssaoBlurPipeline === null || pp.ssaoBgl === null) {
    throw new PostProcessError({
      code: "post-process-not-found",
      detail: { id: "forgeax::post::ssao-blur" }
    });
  }
  if (graphViews === void 0 && (resolveCtx === void 0))
    return;
  const ssaoBlurredView = graphViews?.output ?? resolveCtx?.resolve(ssaoBlurredKey);
  const ssaoRawView = graphViews?.raw ?? resolveCtx?.resolve(ssaoRawKey);
  const gbuf0View = graphViews?.normal ?? (void 0);
  if (!ssaoBlurredView || !ssaoRawView) return;
  const hdrDepthView = graphViews?.depth ?? (null);
  const hdrDepthPooledView = graphViews?.depthCacheKey ?? (void 0);
  const ssaoBufs = getOrCreateSsaoBuffers(runtime);
  if (ssaoBufs === null) return;
  const noiseViewRes = runtime.device.createTextureView(ssaoBufs.noiseTexture, {
    label: "hdrp-ssao-noise-view",
    format: "rgba32float",
    dimension: "2d",
    aspect: "all",
    baseMipLevel: 0,
    mipLevelCount: 1,
    baseArrayLayer: 0,
    arrayLayerCount: 1
  });
  if (!noiseViewRes.ok) {
    runtime.errorRegistry.fire(noiseViewRes.error);
    return;
  }
  const companions = ensureSsaoRecordCompanions(_c);
  if (companions === null) return;
  if (gbuf0View === void 0 || hdrDepthView === null || hdrDepthPooledView === void 0) return;
  const ssaoBgl = pp.ssaoBgl;
  const bindGroup = getOrCreateFromChain(
    _c.frameState.postProcessBgCache,
    [ssaoRawView, gbuf0View, hdrDepthPooledView],
    "ssao-blur",
    () => {
      const bgRes = runtime.device.createBindGroup({
        label: "ssao-blur-bg",
        layout: ssaoBgl,
        entries: [
          { binding: 0, resource: { kind: "buffer", value: { buffer: ssaoBufs.uniformBuffer } } },
          { binding: 1, resource: { kind: "buffer", value: { buffer: ssaoBufs.kernelBuffer } } },
          { binding: 2, resource: { kind: "textureView", value: noiseViewRes.value } },
          {
            binding: 3,
            resource: { kind: "sampler", value: companions.filteringSampler }
          },
          { binding: 4, resource: { kind: "textureView", value: gbuf0View } },
          { binding: 5, resource: { kind: "textureView", value: hdrDepthView } },
          { binding: 6, resource: { kind: "sampler", value: companions.depthSampler } },
          { binding: 7, resource: { kind: "textureView", value: ssaoRawView } },
          { binding: 8, resource: { kind: "sampler", value: companions.filteringSampler } }
        ]
      });
      if (!bgRes.ok) throw bgRes.error;
      return bgRes.value;
    },
    _c.bindGroupCounts
  );
  const pass = graphPass ?? encoder.beginRenderPass(
    buildBeginRenderPassDescriptor(
      { depthFormat: void 0},
      { colorViews: [ssaoBlurredView] },
      "post-process"
    )
  );
  pass.setPipeline(pp.ssaoBlurPipeline);
  pass.setBindGroup(0, bindGroup);
  pass.draw(3, 1, 0, 0);
  if (graphPass === void 0) pass.end();
}
function dispatchFullscreenPass(ctx, name, shader, color, reads, resolveCtx, compositeOverSwapchain = false, rawSwapchainOutput = false, graphPass, graphOutputFormat, graphDepthView, paramsOverride, fragmentEntryPoint, msaaActive = false) {
  if (shader === "fxaa") {
    if (resolveCtx === void 0) {
      throw new PostProcessError({
        code: "fullscreen-input-not-found",
        detail: { readsKey: reads[0] ?? "ldrColor", passName: name }
      });
    }
    recordFxaaPass(
      requireRenderGraphRecordContext(ctx),
      resolveCtx,
      graphPass,
      paramsOverride,
      graphOutputFormat
    );
    return;
  }
  const lookup = ctx.runtime.lookupPostProcess;
  const entry = lookup === void 0 ? void 0 : lookup(shader);
  if (entry === void 0) {
    throw new PostProcessError({
      code: "post-process-not-found",
      detail: { id: shader }
    });
  }
  let inputView;
  if (compositeOverSwapchain) {
    const scratchTex = resolveCtx?.resolve(`${color}::tex`);
    const scratchView = resolveCtx?.resolve(color);
    if (scratchTex === void 0 || scratchView === void 0) {
      throw new PostProcessError({
        code: "fullscreen-input-not-found",
        detail: { readsKey: color, passName: name }
      });
    }
    ctx.encoder.copyTextureToTexture(
      { texture: ctx.currentTexture, mipLevel: 0, origin: { x: 0, y: 0, z: 0 } },
      { texture: scratchTex, mipLevel: 0, origin: { x: 0, y: 0, z: 0 } },
      { width: ctx.targetW, height: ctx.targetH, depthOrArrayLayers: 1 }
    );
    inputView = scratchView;
  } else if (reads.length === 0) {
    inputView = ctx.view;
  } else {
    const readsKey = reads[0];
    const resolved = resolveCtx?.resolve(readsKey);
    if (resolved === void 0) {
      throw new PostProcessError({
        code: "fullscreen-input-not-found",
        detail: { readsKey, passName: name }
      });
    }
    inputView = resolved;
  }
  if (inputView === null) return;
  const built = buildFullscreenPostProcessPass(
    { device: ctx.runtime.device, errorRegistry: ctx.runtime.errorRegistry },
    entry,
    msaaActive
  );
  if (built === null) return;
  let depthTexView = graphDepthView ?? null;
  let depthSampler = null;
  if (entry.reads && entry.reads.length > 0) {
    const internals = requireRenderGraphRecordContext(ctx);
    for (const read of entry.reads) {
      if (typeof read !== "string" && read.sampleType === "depth") {
        const depthKey = read.key;
        depthTexView ??= resolveDepthOnlyView(
          internals,
          depthKey,
          "post-process-scene-depth-only-view",
          internals.geometryDepthKey
        );
        if (depthTexView === null) {
          throw new PostProcessError({
            code: "fullscreen-input-not-found",
            detail: { readsKey: depthKey, passName: name }
          });
        }
        depthSampler = built.depthSampler;
      }
    }
  }
  let writeView;
  let writeFormat = ctx.pipelineState?.colorAttachmentFormat ?? "rgba8unorm-srgb";
  if (graphPass !== void 0) {
    writeView = resolveCtx?.resolve(color) ?? ctx.view;
    writeFormat = graphOutputFormat ?? writeFormat;
  } else if (rawSwapchainOutput && color === "swapchain") {
    const rawViewRes = ctx.runtime.device.createTextureView(ctx.currentTexture, {});
    if (!rawViewRes.ok) {
      ctx.runtime.errorRegistry.fire(rawViewRes.error);
      return;
    }
    writeView = rawViewRes.value;
    writeFormat = ctx.pipelineState?.format ?? "rgba8unorm";
  } else if (compositeOverSwapchain) {
    const storageViewRes = ctx.runtime.device.createTextureView(ctx.currentTexture, {});
    if (!storageViewRes.ok) {
      ctx.runtime.errorRegistry.fire(storageViewRes.error);
      return;
    }
    writeView = storageViewRes.value;
    writeFormat = ctx.pipelineState?.format ?? "rgba8unorm";
  } else {
    const legacyGraph = requireRenderGraphRecordContext(ctx).frameState.perFrameGraph;
    const graphColorFormat = legacyGraph?.getColorTargetDescriptor(color)?.format;
    if (graphColorFormat !== void 0) writeFormat = graphColorFormat;
    const resolvedColor = resolveCtx?.resolve(color) ?? null;
    writeView = legacyGraph?.getColorTargetView(color) ?? resolvedColor ?? ctx.view;
  }
  if (writeView === null || writeView === void 0) return;
  let paramsBuffer = null;
  if (entry.params !== void 0) {
    const ubo = ctx.runtime.getPostProcessParamsBuffer?.(shader);
    if (ubo !== void 0) {
      const data = paramsOverride ?? ctx.postProcessParams.get(shader);
      if (data !== void 0) {
        if (data.byteLength !== entry.params.byteSize) {
          throw new PostProcessError({
            code: "params-update-size-mismatch",
            detail: { byteSize: entry.params.byteSize, actualLength: data.byteLength }
          });
        }
        const writeResult = ctx.runtime.device.queue.writeBuffer(ubo, 0, data);
        if (!writeResult.ok) return;
      } else {
        const writeResult = ctx.runtime.device.queue.writeBuffer(ubo, 0, entry.params.defaultValue);
        if (!writeResult.ok) return;
      }
      paramsBuffer = ubo;
    }
  } else if (entryHasDepthRead(entry)) {
    paramsBuffer = ctx.runtime.getPostProcessParamsBuffer?.(shader) ?? null;
  }
  const bindGroup = createFullscreenBindGroup(
    ctx.runtime.device,
    built.bindGroupLayout,
    inputView,
    built.sampler,
    paramsBuffer,
    depthTexView,
    depthSampler,
    built.extraColorBindings.map((binding, index) => {
      const read = entry.reads?.filter(
        (candidate) => typeof candidate === "string" || candidate.sampleType !== "depth"
      )[index + 1];
      const key = typeof read === "string" ? read : read?.key;
      const view = key === void 0 ? void 0 : resolveCtx?.resolve(key);
      if (view === void 0) {
        throw new PostProcessError({
          code: "fullscreen-input-not-found",
          detail: { readsKey: key ?? "additional-read", passName: name }
        });
      }
      return { binding, view };
    })
  );
  if (bindGroup === null) return;
  const lookupPipeline = ctx.runtime.getPostProcessPipeline;
  if (lookupPipeline === void 0) return;
  const postColorFormat = writeFormat;
  const pipelineEntry = fragmentEntryPoint === void 0 ? entry : { ...entry, fragmentEntryPoint };
  const pipeline = lookupPipeline(shader, built.bindGroupLayout, [postColorFormat], pipelineEntry);
  if (pipeline === null) return;
  const handle = built.createHandle(name, pipeline, paramsBuffer);
  const pass = graphPass ?? ctx.encoder.beginRenderPass(
    buildBeginRenderPassDescriptor(
      {
        depthFormat: void 0},
      { colorViews: [writeView] },
      "post-process"
    )
  );
  pass.setBindGroup(1, bindGroup);
  handle.draw(pass, inputView);
  if (graphPass === void 0) pass.end();
}
function encodeFullscreenPass(ctx, pass, input) {
  dispatchFullscreenPass(
    ctx,
    input.name,
    input.shader,
    input.color,
    input.reads,
    input.resolve,
    false,
    input.rawSwapchainOutput ?? false,
    pass,
    input.outputFormat,
    input.depthView,
    input.paramsOverride,
    input.fragmentEntryPoint,
    // Legacy callers rely on the frame context's MSAA state. Typed callers
    // pass the actual depth target sample count explicitly so a single-sample
    // view can never select the multisampled shader by camera policy alone.
    input.msaaActive ?? ctx.msaaActive
  );
}

// src/temporal/gpu.ts
var TEMPORAL_HISTORY_FORMATS = Object.freeze({
  color: "rgba16float",
  temporal: "rgba16float",
  stability: "r8unorm"
});
var CLOUD_HISTORY_FORMATS = Object.freeze({
  radiance: "rgba16float",
  transmittance: "rgba16float",
  depth: "rgba16float"
});
function createSurface(device, childScope, label, width, height, format = TEMPORAL_HISTORY_FORMATS.color) {
  const texture = device.createTexture({
    label,
    size: { width, height, depthOrArrayLayers: 1 },
    format,
    textureBindingViewDimension: void 0,
    usage: GPU_TEXTURE_USAGE_COPY_SRC | GPU_TEXTURE_USAGE_RENDER_ATTACHMENT | GPU_TEXTURE_USAGE_TEXTURE_BINDING
  });
  if (!texture.ok) throw texture.error;
  childScope._adopt("texture", texture.value, (value) => {
    device.destroyTexture(value);
  });
  const view = device.createTextureView(texture.value, {
    label: `${label}.view`,
    dimension: "2d",
    baseMipLevel: 0,
    mipLevelCount: 1,
    baseArrayLayer: 0,
    arrayLayerCount: 1
  });
  if (!view.ok) throw view.error;
  return { texture: texture.value, view: view.value };
}
function cloudHistoryExtent(width, height) {
  return {
    width: Math.max(1, Math.ceil(width / 2)),
    height: Math.max(1, Math.ceil(height / 2))
  };
}
function createState(device, scope, width, height, cloudHistoryEnabled) {
  const childScope = scope.createChild(`${scope.owner}:temporal`);
  const cloudExtent = cloudHistoryExtent(width, height);
  try {
    return {
      device,
      scope,
      childScope,
      width,
      height,
      valid: false,
      readIndex: 0,
      pendingIndex: void 0,
      color: [
        createSurface(device, childScope, "taa-history-color-a", width, height),
        createSurface(device, childScope, "taa-history-color-b", width, height)
      ],
      temporal: [
        createSurface(
          device,
          childScope,
          "taa-history-temporal-a",
          width,
          height,
          TEMPORAL_HISTORY_FORMATS.temporal
        ),
        createSurface(
          device,
          childScope,
          "taa-history-temporal-b",
          width,
          height,
          TEMPORAL_HISTORY_FORMATS.temporal
        )
      ],
      stability: [
        createSurface(
          device,
          childScope,
          "taa-history-stability-a",
          width,
          height,
          TEMPORAL_HISTORY_FORMATS.stability
        ),
        createSurface(
          device,
          childScope,
          "taa-history-stability-b",
          width,
          height,
          TEMPORAL_HISTORY_FORMATS.stability
        )
      ],
      cloudHistoryEnabled,
      cloudRadiance: cloudHistoryEnabled ? [
        createSurface(
          device,
          childScope,
          "cloud-history-radiance-a",
          cloudExtent.width,
          cloudExtent.height
        ),
        createSurface(
          device,
          childScope,
          "cloud-history-radiance-b",
          cloudExtent.width,
          cloudExtent.height
        )
      ] : void 0,
      cloudTransmittance: cloudHistoryEnabled ? [
        createSurface(
          device,
          childScope,
          "cloud-history-transmittance-a",
          cloudExtent.width,
          cloudExtent.height,
          CLOUD_HISTORY_FORMATS.transmittance
        ),
        createSurface(
          device,
          childScope,
          "cloud-history-transmittance-b",
          cloudExtent.width,
          cloudExtent.height,
          CLOUD_HISTORY_FORMATS.transmittance
        )
      ] : void 0,
      cloudDepth: cloudHistoryEnabled ? [
        createSurface(
          device,
          childScope,
          "cloud-history-depth-a",
          cloudExtent.width,
          cloudExtent.height,
          CLOUD_HISTORY_FORMATS.depth
        ),
        createSurface(
          device,
          childScope,
          "cloud-history-depth-b",
          cloudExtent.width,
          cloudExtent.height,
          CLOUD_HISTORY_FORMATS.depth
        )
      ] : void 0,
      bindGroupLayout: void 0,
      sampler: void 0,
      temporalSampler: void 0,
      paramsBuffer: void 0,
      committed: false
    };
  } catch (cause) {
    childScope.abandon();
    throw cause;
  }
}
function getTemporalParamsBuffer(state) {
  if (state.paramsBuffer !== void 0) return state.paramsBuffer;
  const created = state.device.createBuffer({
    label: "taa-resolve-params",
    size: 32,
    usage: GPU_BUFFER_USAGE_UNIFORM | GPU_BUFFER_USAGE_COPY_DST,
    mappedAtCreation: false
  });
  if (!created.ok) {
    if (!state.committed) state.childScope.abandon();
    throw created.error;
  }
  state.childScope._adopt("buffer", created.value, (value) => {
    state.device.destroyBuffer(value);
  });
  const written = state.device.queue.writeBuffer(created.value, 0, new Uint8Array(32));
  if (!written.ok) {
    if (!state.committed) state.childScope.abandon();
    throw written.error;
  }
  state.paramsBuffer = created.value;
  return created.value;
}
function getTemporalGpuState(frameState, device, scope, width, height, cloudHistoryRequested = false) {
  const wantsCloudHistory = cloudHistoryRequested || frameState.pendingCloudHistoryActive === true || frameState.cloudHistoryActive === true;
  const matches = (state) => state !== void 0 && state.scope === scope && state.width === width && state.height === height && // Cloud history is a demand-shaped part of the temporal allocation. Keep
  // the two shapes distinct so turning CloudLayer off retires its six HDR
  // surfaces instead of retaining them on an otherwise TAA-only frame.
  state.cloudHistoryEnabled === wantsCloudHistory;
  const staged = frameState.temporalGpuState;
  if (matches(staged)) return staged;
  const existing = frameState.activeTemporalGpuState;
  if (matches(existing)) return existing;
  const next = createState(device, scope, width, height, wantsCloudHistory);
  frameState.temporalGpuState = next;
  return next;
}
function getTemporalBindGroupResources(state) {
  if (state.bindGroupLayout !== void 0) {
    return {
      layout: state.bindGroupLayout,
      sampler: state.sampler ?? null,
      temporalSampler: state.temporalSampler ?? null
    };
  }
  try {
    const layout = state.device.createBindGroupLayout({
      label: "taa-resolve-bind-group",
      entries: [
        {
          binding: 0,
          visibility: 2,
          texture: { sampleType: "float", viewDimension: "2d" }
        },
        { binding: 1, visibility: 2, sampler: { type: "filtering" } },
        {
          binding: 2,
          visibility: 2,
          texture: { sampleType: "float", viewDimension: "2d" }
        },
        { binding: 3, visibility: 2, sampler: { type: "filtering" } },
        {
          binding: 4,
          visibility: 2,
          texture: { sampleType: "unfilterable-float", viewDimension: "2d" }
        },
        { binding: 5, visibility: 2, sampler: { type: "non-filtering" } },
        {
          binding: 6,
          visibility: 2,
          texture: { sampleType: "unfilterable-float", viewDimension: "2d" }
        },
        { binding: 7, visibility: 2, sampler: { type: "non-filtering" } },
        { binding: 8, visibility: 2, buffer: { type: "uniform" } },
        { binding: 9, visibility: 2, texture: { sampleType: "float", viewDimension: "2d" } },
        {
          binding: 10,
          visibility: 2,
          texture: { sampleType: "unfilterable-float", viewDimension: "2d" }
        },
        {
          binding: 11,
          visibility: 2,
          texture: { sampleType: "unfilterable-float", viewDimension: "2d" }
        }
      ]
    });
    if (!layout.ok) throw layout.error;
    state.childScope._adopt("binding", layout.value, () => void 0);
    const sampler = state.device.createSampler({
      addressModeU: "clamp-to-edge",
      addressModeV: "clamp-to-edge",
      magFilter: "linear",
      minFilter: "linear"
    });
    if (!sampler.ok) throw sampler.error;
    state.childScope._adopt("binding", sampler.value, () => void 0);
    const temporalSampler = state.device.createSampler({
      addressModeU: "clamp-to-edge",
      addressModeV: "clamp-to-edge",
      magFilter: "nearest",
      minFilter: "nearest"
    });
    if (!temporalSampler.ok) throw temporalSampler.error;
    state.childScope._adopt("binding", temporalSampler.value, () => void 0);
    state.bindGroupLayout = layout.value;
    state.sampler = sampler.value;
    state.temporalSampler = temporalSampler.value;
    return { layout: layout.value, sampler: sampler.value, temporalSampler: temporalSampler.value };
  } catch (cause) {
    if (!state.committed) {
      state.childScope.abandon();
      state.bindGroupLayout = void 0;
      state.sampler = void 0;
      state.temporalSampler = void 0;
    }
    throw cause;
  }
}
function temporalReadIndex(state) {
  return state.readIndex;
}
function temporalWriteIndex(state) {
  return state.readIndex === 0 ? 1 : 0;
}
function stageTemporalGpuSubmit(state) {
  state.pendingIndex = state.readIndex === 0 ? 1 : 0;
}
function hasPendingTemporalGpuSubmit(state) {
  return state.pendingIndex !== void 0;
}
function commitTemporalGpuSubmit(state) {
  if (state.pendingIndex === void 0) return false;
  state.readIndex = state.pendingIndex;
  state.pendingIndex = void 0;
  state.valid = true;
  state.committed = true;
  return true;
}
function abortTemporalGpuSubmit(state) {
  state.pendingIndex = void 0;
}
function retireTemporalGpuState(state) {
  state.pendingIndex = void 0;
  state.childScope.retire();
  state.valid = false;
  state.committed = false;
  state.bindGroupLayout = void 0;
  state.sampler = void 0;
  state.temporalSampler = void 0;
  state.paramsBuffer = void 0;
}
function retireTemporalGpuStateAfterFence(state, queue, retiring, onFailure) {
  if (state.childScope.state === "retired" || state.childScope.state === "abandoned") return;
  state.childScope.beginRetire();
  retiring.add(state);
  void queue.onSubmittedWorkDone().then(
    () => {
      retiring.delete(state);
      retireTemporalGpuState(state);
    },
    (cause) => {
      retiring.delete(state);
      onFailure(cause);
      retireTemporalGpuState(state);
    }
  );
}

// src/typed-render-graph-primitives.ts
function resolvedView(resources, view) {
  const result = resources.textureView(view);
  if (!result.ok) throw result.error;
  return result.value;
}
function throwTemporalEncodeFailure(expected, cause) {
  throw new RhiError({
    code: "webgpu-runtime-error",
    expected,
    hint: cause === void 0 ? "retry the temporal frame after repairing its GPU resource" : String(cause)
  });
}
function typedFrameClearColor(frame) {
  return {
    r: frame.clear[0] ?? 0,
    g: frame.clear[1] ?? 0,
    b: frame.clear[2] ?? 0,
    a: frame.clear[3] ?? 1
  };
}
function resolvedDepthView(frame, resources, target) {
  const texture = resources.texture(target.texture);
  if (!texture.ok) throw texture.error;
  const view = frame.runtime.device.createTextureView(texture.value, {
    label: "typed-ssao-depth-only-view",
    // Multisampled WebGPU textures still use a `2d` view dimension; the
    // sample count is carried by the source texture and WGSL type.
    dimension: "2d",
    aspect: "depth-only",
    baseMipLevel: 0,
    mipLevelCount: 1,
    baseArrayLayer: 0,
    arrayLayerCount: 1
  });
  if (!view.ok) throw view.error;
  return view.value;
}
function observationBytesPerPixel(format) {
  return format === "rgba16float" ? 8 : 4;
}
function observationBytesPerRow(width, format) {
  const unaligned = width * observationBytesPerPixel(format);
  return Math.ceil(unaligned / 256) * 256;
}
function addObservationCapturePass(graph, target, domain) {
  return graph.addCopyPass(`${domain}-observation`, {
    accesses: [{ resource: target.view, usage: "copy-src" }],
    encode: ({ encoder, frame, resources }) => {
      const texture = resources.texture(target.texture);
      if (!texture.ok) throw texture.error;
      const internal = frame;
      if (domain === "linear-hdr") {
        internal.frameState.currentFrameObservationSource = {
          texture: texture.value,
          descriptor: {
            texture: texture.value,
            format: target.format,
            size: { width: frame.targetW, height: frame.targetH },
            usage: GPU_TEXTURE_USAGE_COPY_SRC | GPU_TEXTURE_USAGE_RENDER_ATTACHMENT | GPU_TEXTURE_USAGE_TEXTURE_BINDING,
            sample: target.sampleCount
          },
          frameId: internal.frameState.frameNumber,
          pipelineId: "forgeax::standard",
          backendId: frame.runtime.device.caps.backendKind
        };
      }
      const owner = frame.runtime.observationCaptureOwner;
      if (owner === void 0) {
        return;
      }
      if (!frame.runtime.observationCaptureDomains?.includes(domain)) return;
      const width = frame.targetW;
      const height = frame.targetH;
      const bytesPerRow = observationBytesPerRow(width, target.format);
      const created = frame.runtime.device.createBuffer({
        label: `${domain}-observation-readback`,
        size: bytesPerRow * height,
        usage: GPU_BUFFER_USAGE_COPY_DST | GPU_BUFFER_USAGE_MAP_READ,
        mappedAtCreation: false
      });
      if (!created.ok) throw created.error;
      try {
        encoder.copyTextureToBuffer(
          { texture: texture.value, mipLevel: 0, origin: { x: 0, y: 0, z: 0 } },
          { buffer: created.value, bytesPerRow, rowsPerImage: height },
          { width, height, depthOrArrayLayers: 1 }
        );
        frame.runtime.observationGraphGeneration = internal.frameState.graphGeneration;
        owner.register({
          domain,
          format: target.format,
          device: frame.runtime.device,
          texture: texture.value,
          buffer: created.value,
          // The assembly reserves this public receipt identity before encoding.
          // The frame-state counter is an internal record counter and is not an
          // identity source when non-receipt frames are recorded.
          frameNumber: frame.runtime.observationFrameId ?? internal.frameState.frameNumber,
          deviceGeneration: frame.runtime.deviceGeneration ?? 0,
          graphGeneration: internal.frameState.graphGeneration,
          backendId: frame.runtime.device.caps.backendKind,
          width,
          height,
          bytesPerRow
        });
      } catch (cause) {
        const destroyed = frame.runtime.device.destroyBuffer(created.value);
        if (!destroyed.ok) throw destroyed.error;
        throw cause;
      }
    }
  });
}
function legacyResolver(resources, targets) {
  return {
    resolve: (name) => {
      const target = targets[name];
      return target === void 0 ? void 0 : resolvedView(resources, target.view);
    }
  };
}
function addTypedSkyboxPass(graph, color) {
  return graph.addRasterPass("skybox", {
    accesses: [{ resource: color.view, usage: "color-attachment" }],
    colorAttachments: [
      {
        view: color.view,
        loadOp: "clear",
        storeOp: "store",
        clearValue: typedFrameClearColor
      }
    ],
    encode: ({ pass, frame }) => encodeSkyboxPass(frame, pass)
  });
}
function addTypedScenePass(graph, options) {
  const colorTargets = options.colorTargets ?? [options.color];
  const accesses = [
    ...colorTargets.map((target) => ({
      resource: target.view,
      usage: "color-attachment"
    })),
    { resource: options.depth.view, usage: "depth-stencil-write" },
    ...(options.sampled ?? []).map((target) => ({
      resource: target.view,
      usage: "sampled-read"
    })),
    ...options.cloudShadow === void 0 ? [] : [{ resource: options.cloudShadow.view, usage: "sampled-read" }],
    ...options.transmissionBackdrop === void 0 ? [] : [{ resource: options.transmissionBackdrop, usage: "sampled-read" }],
    ...options.surfacePair?.rawDepth.status === "available" ? [{ resource: options.surfacePair.rawDepth.view, usage: "sampled-read" }] : [],
    ...options.recordMode === "single-layer-medium-color" && options.surfaceNearestLayer !== void 0 ? [{ resource: options.surfaceNearestLayer, usage: "sampled-read" }] : [],
    ...options.recordMode === "single-layer-medium-color" && options.surfaceNearestDepth !== void 0 ? [{ resource: options.surfaceNearestDepth, usage: "sampled-read" }] : [],
    ...options.environment === void 0 ? [] : [options.environment.irradiance, options.environment.prefilter].map((resource) => ({
      resource,
      usage: "sampled-read"
    })),
    ...options.extraAccesses ?? [],
    ...options.gpuDriven?.accesses ?? []
  ];
  if (options.resolve !== void 0) {
    accesses.push({ resource: options.resolve.view, usage: "color-attachment" });
  }
  return graph.addRasterPass(options.name, {
    accesses,
    colorAttachments: colorTargets.map((target, index) => ({
      view: target.view,
      ...index === 0 && options.resolve !== void 0 ? { resolveTarget: options.resolve.view } : {},
      loadOp: (typeof options.colorLoadOp === "string" ? options.colorLoadOp : options.colorLoadOp?.[index]) ?? "clear",
      storeOp: "store",
      clearValue: {
        r: options.clearColor?.[0] ?? 0,
        g: options.clearColor?.[1] ?? 0,
        b: options.clearColor?.[2] ?? 0,
        a: options.clearColor?.[3] ?? 1
      }
    })),
    depthStencilAttachment: {
      view: options.depth.view,
      depthClearValue: 1,
      depthLoadOp: options.depthLoadOp ?? "clear",
      depthStoreOp: "store",
      stencilClearValue: 0,
      stencilLoadOp: options.depthLoadOp ?? "clear",
      stencilStoreOp: "store"
    },
    occlusionQuerySet: options.occlusion?.querySet,
    encode: ({ pass, frame, resources }) => {
      const colorViews = colorTargets.map((target) => resolvedView(resources, target.view));
      const depthView = resolvedView(resources, options.depth.view);
      const resolveView = options.resolve === void 0 ? null : resolvedView(resources, options.resolve.view);
      const internal = frame;
      const directionalShadow = options.directionalShadow === void 0 ? void 0 : resolvedView(resources, options.directionalShadow.view);
      const spotShadow = options.spotShadow === void 0 ? void 0 : resolvedView(resources, options.spotShadow.view);
      const cloudShadow = options.cloudShadow === void 0 ? void 0 : resolvedView(resources, options.cloudShadow.view);
      const ssao = options.ssao === void 0 ? void 0 : resolvedView(resources, options.ssao.view);
      const transmissionBackdrop = options.transmissionBackdrop === void 0 ? null : resolvedView(resources, options.transmissionBackdrop);
      const surfaceRawDepth = options.surfacePair?.rawDepth.status === "available" ? resolvedView(resources, options.surfacePair.rawDepth.view) : null;
      const surfaceNearestLayer = options.surfaceNearestLayer === void 0 ? null : resolvedView(resources, options.surfaceNearestLayer);
      const surfaceNearestDepth = options.surfaceNearestDepth === void 0 ? null : resolvedView(resources, options.surfaceNearestDepth);
      internal.frameState.currentDirectionalShadowView = directionalShadow ?? null;
      internal.frameState.currentSpotShadowView = spotShadow ?? null;
      const groups = buildPerFrameBindGroups(
        internal.runtime,
        internal.frameState,
        internal.pipelineState,
        internal.validated.length > 0 || options.gpuDriven !== void 0,
        internal.bindGroupCounts,
        {
          directionalShadow,
          spotShadow,
          cloudShadow,
          projector: internal.spotLightProjector?.view ?? internal.volumetricFog?.projectorView,
          projectorSampler: internal.spotLightProjector?.sampler ?? internal.volumetricFog?.projectorSampler
        },
        true,
        internal.standardLighting
      );
      const activeOcclusion = options.occlusion;
      const { gpuDrivenDrawKeys, ...directContext } = internal;
      const passContext = {
        ...directContext,
        ...options.gpuDriven === void 0 || gpuDrivenDrawKeys === void 0 ? {} : { gpuDrivenDrawKeys },
        ...options.environment === void 0 ? {} : {
          environmentIbl: {
            irradiance: resolvedView(resources, options.environment.irradiance),
            prefilter: resolvedView(resources, options.environment.prefilter)
          }
        },
        ...activeOcclusion === void 0 ? {} : { occlusion: activeOcclusion },
        geometryColorView: colorViews[0] ?? null,
        geometryDepthView: depthView,
        geometryColorResolveView: resolveView,
        transparentColorFormat: colorTargets[0]?.format,
        ...options.passKind !== "deferred" && colorTargets[1]?.format === "rgba16float" ? { reflectionFallbackColorFormat: "rgba16float" } : {},
        msaaActive: colorTargets[0]?.sampleCount === 4,
        viewBindGroup: groups.viewBindGroup,
        meshBindGroup: groups.meshBindGroup,
        hdrpClusterBindGroup: groups.hdrpClusterBindGroup,
        hdrpClusterMembershipBindGroup: groups.hdrpClusterMembershipBindGroup,
        ...ssao === void 0 ? {} : { hdrpSsaoBlurredView: ssao }
      };
      encodeMainPass(passContext, pass, options.selector, {
        colorViews,
        colorFormats: colorTargets.map((target) => target.format),
        depthView,
        passKind: options.passKind ?? "forward",
        ...options.clearColor === void 0 ? {} : { clearColor: options.clearColor },
        ...options.recordMode === void 0 ? {} : { recordMode: options.recordMode },
        ...options.transparentDepthWrite === void 0 ? {} : { transparentDepthWrite: options.transparentDepthWrite },
        ...options.coverageOnly === void 0 ? {} : { coverageOnly: options.coverageOnly },
        ...options.excludeSelector === void 0 ? {} : { excludeSelector: options.excludeSelector },
        ...options.transmissionBackdrop === void 0 ? {} : { transmissionBackdropView: transmissionBackdrop },
        ...surfaceRawDepth === null ? {} : { surfaceRawDepthView: surfaceRawDepth },
        ...surfaceNearestLayer === null ? {} : { surfaceNearestLayerView: surfaceNearestLayer },
        ...surfaceNearestDepth === null ? {} : { surfaceNearestDepthView: surfaceNearestDepth },
        ...options.passKind === "deferred" ? { fragmentEntryPoint: "fs_gbuffer" } : options.recordMode === "single-layer-medium-nearest-layer" ? { fragmentEntryPoint: "fs_nearest_layer" } : options.recordMode === "single-layer-medium-color" ? { fragmentEntryPoint: "fs_color" } : {},
        ...options.gpuDriven === void 0 ? {} : { gpuDriven: { projection: options.gpuDriven, resources } },
        ...options.gpuDrivenFilter === void 0 ? {} : { gpuDrivenFilter: options.gpuDrivenFilter }
      });
      if (passContext.materialUboPayloadCache !== void 0) {
        internal.materialUboPayloadCache = passContext.materialUboPayloadCache;
      }
      if (activeOcclusion !== void 0) {
        const proxyResult = activeOcclusion.encodeProxyBounds(pass);
        if (!proxyResult.ok) throw proxyResult.error;
      }
    }
  });
}
function addTypedFrameObservationPass(graph, target, pipelineId) {
  return addObservationCapturePass(graph, target, "linear-hdr");
}
function addReflectionFallbackObservationPass(graph, target) {
  return graph.addCopyPass("reflection-fallback-observation", {
    accesses: [{ resource: target.view, usage: "copy-src" }],
    encode: ({ frame, resources }) => {
      const internal = frame;
      const texture = resources.texture(target.texture);
      if (!texture.ok) throw texture.error;
      internal.frameState.reflectionFallbackObservationSource = {
        texture: texture.value,
        descriptor: {
          texture: texture.value,
          format: target.format,
          size: { width: frame.targetW, height: frame.targetH },
          usage: GPU_TEXTURE_USAGE_COPY_SRC | GPU_TEXTURE_USAGE_RENDER_ATTACHMENT | GPU_TEXTURE_USAGE_TEXTURE_BINDING,
          sample: target.sampleCount
        },
        frameId: internal.frameState.frameNumber,
        pipelineId: "forgeax::standard",
        backendId: internal.runtime.device.caps.backendKind
      };
    }
  });
}
var TYPED_BLOOM_PASS_NAMES = {
  downsample: "bloom-downsample",
  upsample: "bloom-upsample",
  composite: "bloom-composite"
};
function typedBloomLevelPassName(kind, level) {
  return `${TYPED_BLOOM_PASS_NAMES[kind]}-${level}`;
}
function addTypedBloomPasses(graph, targets) {
  const named = {
    hdrColor: targets.scene,
    hdrComposited: targets.composited
  };
  targets.downsample.forEach((target, level) => {
    named[`bloomDownsample${level}`] = target;
  });
  targets.upsample.forEach((target, level) => {
    named[`bloomUpsample${level}`] = target;
  });
  const add = (name, reads, write, encode, level) => {
    const descriptor = {
      name,
      reads,
      write,
      encode,
      level
    };
    const added = graph.addRasterPass(descriptor.name, {
      accesses: [
        ...descriptor.reads.map((target) => ({
          resource: target.view,
          usage: "sampled-read"
        })),
        { resource: descriptor.write.view, usage: "color-attachment" }
      ],
      colorAttachments: [
        {
          view: descriptor.write.view,
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 0 }
        }
      ],
      encode: ({ pass, frame, resources }) => descriptor.encode(
        frame,
        legacyResolver(resources, named),
        pass,
        descriptor.level,
        descriptor.level === void 0 ? void 0 : targets.levelDimensions[descriptor.level]
      )
    });
    return added.ok ? ok(void 0) : added;
  };
  for (const [level, write] of targets.downsample.entries()) {
    const source = level === 0 ? targets.scene : targets.downsample[level - 1];
    if (source === void 0) {
      return err$1(
        new RenderGraphError({
          code: "resource-resolution-failed",
          expected: "Bloom downsample levels form one adjacent pyramid",
          hint: "rebuild the Standard Bloom target declaration from one level list",
          detail: { resourceLabel: `bloom-level-${level}` }
        })
      );
    }
    const added = add(
      typedBloomLevelPassName("downsample", level),
      [source],
      write,
      (frame, resolve, pass, passLevel) => recordBloomDownsamplePass(
        frame,
        resolve,
        pass,
        passLevel ?? level,
        targets.levelDimensions[passLevel ?? level]
      ),
      level
    );
    if (!added.ok) return added;
  }
  for (let level = targets.upsample.length - 1; level >= 0; level -= 1) {
    const current = targets.downsample[level];
    const coarse = level === targets.downsample.length - 2 ? targets.downsample[level + 1] : targets.upsample[level + 1];
    const write = targets.upsample[level];
    if (current === void 0 || coarse === void 0 || write === void 0) {
      return err$1(
        new RenderGraphError({
          code: "resource-resolution-failed",
          expected: "Bloom downsample and upsample levels form one adjacent pyramid",
          hint: "rebuild the Standard Bloom target declaration from one level list",
          detail: { resourceLabel: `bloom-level-${level}` }
        })
      );
    }
    const added = add(
      typedBloomLevelPassName("upsample", level),
      [current, coarse],
      write,
      (frame, resolve, pass, passLevel) => recordBloomUpsamplePass(frame, resolve, pass, passLevel ?? level),
      level
    );
    if (!added.ok) return added;
  }
  const finest = targets.upsample[0] ?? targets.downsample[0];
  if (finest === void 0) {
    return err$1(
      new RenderGraphError({
        code: "resource-resolution-failed",
        expected: "Bloom has at least one downsample level",
        hint: "derive Bloom levels from a positive output extent",
        detail: { resourceLabel: "bloom-downsample-0" }
      })
    );
  }
  return add(
    TYPED_BLOOM_PASS_NAMES.composite,
    [targets.scene, finest],
    targets.composited,
    (frame, resolve, pass) => recordBloomCompositePass(frame, resolve, pass)
  );
}
function addTypedSsaoPasses(graph, targets) {
  const calc = graph.addRasterPass("ssao-calc", {
    accesses: [
      { resource: targets.normal.view, usage: "sampled-read" },
      { resource: targets.depth.view, usage: "sampled-read" },
      { resource: targets.raw.view, usage: "color-attachment" }
    ],
    colorAttachments: [
      {
        view: targets.raw.view,
        loadOp: "clear",
        storeOp: "store",
        clearValue: { r: 1, g: 1, b: 1, a: 1 }
      }
    ],
    encode: ({ pass, frame, resources }) => {
      const normal = resolvedView(resources, targets.normal.view);
      const depthCacheKey = resolvedView(resources, targets.depth.view);
      recordSsaoCalcPass(
        frame,
        void 0,
        void 0,
        void 0,
        void 0,
        pass,
        {
          output: resolvedView(resources, targets.raw.view),
          normal,
          depth: resolvedDepthView(frame, resources, targets.depth),
          depthCacheKey
        }
      );
    }
  });
  if (!calc.ok) return calc;
  return graph.addRasterPass("ssao-blur", {
    accesses: [
      { resource: targets.raw.view, usage: "sampled-read" },
      { resource: targets.normal.view, usage: "sampled-read" },
      { resource: targets.depth.view, usage: "sampled-read" },
      { resource: targets.blurred.view, usage: "color-attachment" }
    ],
    colorAttachments: [
      {
        view: targets.blurred.view,
        loadOp: "clear",
        storeOp: "store",
        clearValue: { r: 1, g: 1, b: 1, a: 1 }
      }
    ],
    encode: ({ pass, frame, resources }) => {
      const normal = resolvedView(resources, targets.normal.view);
      const depthCacheKey = resolvedView(resources, targets.depth.view);
      recordSsaoBlurPass(
        frame,
        void 0,
        void 0,
        void 0,
        void 0,
        void 0,
        pass,
        {
          output: resolvedView(resources, targets.blurred.view),
          raw: resolvedView(resources, targets.raw.view),
          normal,
          depth: resolvedDepthView(frame, resources, targets.depth),
          depthCacheKey
        }
      );
    }
  });
}
function addTypedTemporalResolvePass(graph, targets) {
  const added = graph.addRasterPass("taa-resolve", {
    accesses: [
      { resource: targets.scene.view, usage: "sampled-read" },
      { resource: targets.currentTemporal.view, usage: "sampled-read" },
      ...targets.coverage === void 0 ? [] : [{ resource: targets.coverage.view, usage: "sampled-read" }],
      ...targets.coverageDepth === void 0 ? [] : [{ resource: targets.coverageDepth.view, usage: "sampled-read" }],
      { resource: targets.historyColor.view, usage: "sampled-read" },
      { resource: targets.historyTemporal.view, usage: "sampled-read" },
      { resource: targets.historyStability.view, usage: "sampled-read" },
      ...targets.secondaryReactivity === void 0 ? [] : [{ resource: targets.secondaryReactivity, usage: "sampled-read" }],
      { resource: targets.writeColor.view, usage: "color-attachment" },
      { resource: targets.writeTemporal.view, usage: "color-attachment" },
      { resource: targets.writeStability.view, usage: "color-attachment" }
    ],
    colorAttachments: [
      {
        view: targets.writeColor.view,
        loadOp: "clear",
        storeOp: "store",
        clearValue: { r: 0, g: 0, b: 0, a: 1 }
      },
      {
        view: targets.writeTemporal.view,
        loadOp: "clear",
        storeOp: "store",
        clearValue: { r: 0, g: 0, b: 0, a: 0 }
      },
      {
        view: targets.writeStability.view,
        loadOp: "clear",
        storeOp: "store",
        clearValue: { r: 0, g: 0, b: 0, a: 0 }
      }
    ],
    encode: ({ pass, frame, resources }) => {
      const internal = frame;
      const state = getTemporalGpuState(
        internal.frameState,
        frame.runtime.device,
        frame.runtime.deviceScope,
        frame.targetW,
        frame.targetH
      );
      const built = getTemporalBindGroupResources(state);
      const current = resolvedView(resources, targets.scene.view);
      const currentTemporal = resolvedView(resources, targets.currentTemporal.view);
      const historyColor = resolvedView(resources, targets.historyColor.view);
      const historyTemporal = resolvedView(resources, targets.historyTemporal.view);
      const historyStability = resolvedView(resources, targets.historyStability.view);
      const params = getTemporalParamsBuffer(state);
      if (params === void 0 || built.sampler === null || built.temporalSampler === null) {
        throwTemporalEncodeFailure("TAA resolve has an admitted params buffer and sampler");
      }
      const payload = new ArrayBuffer(32);
      new Float32Array(payload).set([
        frame.camera.temporal?.currentJitterUv?.[0] ?? 0,
        frame.camera.temporal?.currentJitterUv?.[1] ?? 0
      ]);
      const words = new Uint32Array(payload);
      words[2] = state.valid && (frame.camera.temporal?.historyValid ?? true) ? 1 : 0;
      words[3] = frame.camera.temporal?.temporalFrameIndex ?? 0;
      words[4] = Number(targets.secondaryReactivity !== void 0);
      words[5] = Number(targets.coverage !== void 0);
      const written = frame.runtime.device.queue.writeBuffer(params, 0, new Uint8Array(payload));
      if (!written.ok)
        throwTemporalEncodeFailure("TAA resolve params upload succeeds", written.error);
      const bindGroup = frame.runtime.device.createBindGroup({
        label: "taa-resolve-bind-group",
        layout: built.layout,
        entries: [
          { binding: 0, resource: { kind: "textureView", value: current } },
          { binding: 1, resource: { kind: "sampler", value: built.sampler } },
          { binding: 2, resource: { kind: "textureView", value: historyColor } },
          { binding: 3, resource: { kind: "sampler", value: built.sampler } },
          { binding: 4, resource: { kind: "textureView", value: historyTemporal } },
          { binding: 5, resource: { kind: "sampler", value: built.temporalSampler } },
          { binding: 6, resource: { kind: "textureView", value: currentTemporal } },
          { binding: 7, resource: { kind: "sampler", value: built.temporalSampler } },
          { binding: 8, resource: { kind: "buffer", value: { buffer: params } } },
          { binding: 9, resource: { kind: "textureView", value: historyStability } },
          {
            binding: 10,
            resource: {
              kind: "textureView",
              value: targets.secondaryReactivity === void 0 ? currentTemporal : resolvedView(resources, targets.secondaryReactivity)
            }
          },
          {
            binding: 11,
            resource: {
              kind: "textureView",
              value: targets.coverage === void 0 ? currentTemporal : resolvedView(resources, targets.coverage.view)
            }
          }
        ]
      });
      if (!bindGroup.ok) {
        throwTemporalEncodeFailure("TAA resolve bind group creation succeeds", bindGroup.error);
      }
      const pipeline = frame.runtime.getPostProcessPipeline?.("forgeax.taa-resolve", built.layout, [
        targets.writeColor.format,
        targets.writeTemporal.format,
        targets.writeStability.format
      ]);
      if (pipeline === null || pipeline === void 0) {
        throwTemporalEncodeFailure("TAA resolve pipeline is ready before frame encoding");
      }
      pass.setPipeline(pipeline);
      pass.setBindGroup(1, bindGroup.value);
      pass.draw(3, 1, 0, 0);
      stageTemporalGpuSubmit(state);
      internal.frameState.temporalGpuState = state;
    }
  });
  return added;
}
function addTypedFullscreenPass(graph, options) {
  return graph.addRasterPass(options.name, {
    accesses: [
      { resource: options.input.view, usage: "sampled-read" },
      { resource: options.output.view, usage: "color-attachment" },
      ...options.depth === void 0 ? [] : [{ resource: options.depth.view, usage: "sampled-read" }],
      ...options.additionalReads?.map((read) => ({
        resource: read.target.view,
        usage: "sampled-read"
      })) ?? []
    ],
    colorAttachments: [
      {
        view: options.output.view,
        loadOp: "clear",
        storeOp: "store",
        clearValue: { r: 0, g: 0, b: 0, a: 1 }
      }
    ],
    encode: ({ pass, frame, resources }) => {
      if (options.outputOnly && frame.runtime.lookupPostProcess?.(options.shader) === void 0) {
        return;
      }
      encodeFullscreenPass(frame, pass, {
        name: options.name,
        shader: options.shader,
        color: "output",
        reads: ["input"],
        resolve: legacyResolver(resources, {
          input: options.input,
          output: options.output,
          ldrColor: options.input,
          "scene-color": options.input,
          ...options.depth === void 0 ? {} : { "scene-depth": options.depth },
          ...options.additionalReads === void 0 ? {} : Object.fromEntries(options.additionalReads.map((read) => [read.key, read.target]))
        }),
        outputFormat: options.output.format,
        ...options.depth === void 0 ? {} : { depthView: resolvedDepthView(frame, resources, options.depth) },
        ...options.rawSwapchainOutput === void 0 ? {} : { rawSwapchainOutput: options.rawSwapchainOutput },
        ...options.paramsTransform === void 0 ? {} : {
          paramsOverride: options.paramsTransform(frame.postProcessParams.get(options.shader))
        },
        ...options.fragmentEntryPoint === void 0 ? {} : { fragmentEntryPoint: options.fragmentEntryPoint },
        ...options.depth === void 0 ? {} : { msaaActive: options.depth.sampleCount === 4 }
      });
    }
  });
}
function addTypedCompositePostEffects(graph, effects, input, output, depth, size) {
  let currentInput = input;
  for (let index = 0; index < effects.length; index += 1) {
    const shader = effects[index];
    if (shader === void 0) continue;
    const effectInput = currentInput;
    const scratch = createRenderPipelineTarget(graph, `post-effect-scratch-${index}`, {
      format: output.format,
      size: "surface"
    });
    if (!scratch.ok) return scratch;
    const effectOutput = index === effects.length - 1 ? ok(output) : createRenderPipelineTarget(graph, `post-effect-output-${index}`, {
      format: output.format,
      size: "surface"
    });
    if (!effectOutput.ok) return effectOutput;
    const copied = graph.addCopyPass(`post-effect-copy-${index}`, {
      accesses: [
        { resource: effectInput.view, usage: "copy-src" },
        { resource: scratch.value.view, usage: "copy-dst" }
      ],
      encode: ({ encoder, resources }) => {
        const source = resources.texture(effectInput.texture);
        if (!source.ok) throw source.error;
        const destination = resources.texture(scratch.value.texture);
        if (!destination.ok) throw destination.error;
        encoder.copyTextureToTexture(
          { texture: source.value, mipLevel: 0, origin: { x: 0, y: 0, z: 0 } },
          { texture: destination.value, mipLevel: 0, origin: { x: 0, y: 0, z: 0 } },
          { width: size.width, height: size.height, depthOrArrayLayers: 1 }
        );
      }
    });
    if (!copied.ok) return copied;
    const effect = addTypedFullscreenPass(graph, {
      name: `post-effect-${index}`,
      shader,
      input: scratch.value,
      output: effectOutput.value,
      depth
    });
    if (!effect.ok) return effect;
    currentInput = effectOutput.value;
  }
  return ok(void 0);
}
function addTypedOutputTransformPass(graph, input, output, options = {}) {
  const outputOnly = options.outputOnly ?? false;
  if (options.fragmentEntryPoint === "fs_encode_only") {
    const ldrCapture = addObservationCapturePass(graph, input, "linear-ldr");
    if (!ldrCapture.ok) return ldrCapture;
  }
  const transformed = addTypedFullscreenPass(graph, {
    name: options.name ?? (outputOnly ? "present" : "output-transform"),
    shader: STANDARD_OUTPUT_TRANSFORM_FEATURE_ID,
    input,
    output,
    outputOnly,
    rawSwapchainOutput: outputOnly,
    ...options.dither !== void 0 ? {
      paramsTransform: (params) => {
        if (params === void 0 || params.byteLength !== 16) return params;
        const transformed2 = params.slice();
        new DataView(
          transformed2.buffer,
          transformed2.byteOffset,
          transformed2.byteLength
        ).setFloat32(12, options.dither === true ? 1 : 0, true);
        return transformed2;
      }
    } : {},
    ...options.fragmentEntryPoint === void 0 ? {} : { fragmentEntryPoint: options.fragmentEntryPoint }
  });
  if (!transformed.ok) return transformed;
  if (options.fragmentEntryPoint === "fs_encode_only") {
    const finalCapture = addObservationCapturePass(graph, output, "final-srgb");
    if (!finalCapture.ok) return finalCapture;
  }
  return ok(void 0);
}

// src/temporal/standard-scene-data.ts
function aggregateTemporalDemand(input) {
  const consumerIds = [
    ...input.taa ? ["taa"] : [],
    ...input.motionBlur ? ["motion-blur"] : [],
    ...input.ssr ? ["ssr"] : []
  ];
  const requested = consumerIds.length > 0;
  return Object.freeze({
    consumerIds: Object.freeze(consumerIds),
    targetCount: requested ? 1 : 0,
    producerPassCount: requested ? 1 : 0,
    historyCount: input.taa ? 1 : 0
  });
}
function describeTemporalDemand(demand) {
  return {
    consumerCount: demand.consumerIds.length,
    targetCount: demand.targetCount,
    producerPassCount: demand.producerPassCount,
    historyCount: demand.historyCount,
    byteLength: demand.targetCount
  };
}
function standardTemporalLaneAdmission(input) {
  if (input.demand.targetCount === 0) return { status: "unavailable", reason: "no-demand" };
  if (input.capabilities.producerPresent === false)
    return { status: "unavailable", reason: "producer-missing" };
  if (!input.capabilities.rgba16floatRenderable || input.capabilities.filterable === false || input.capabilities.copy === false || input.capabilities.readback === false) {
    return { status: "unavailable", reason: "capability-missing" };
  }
  return {
    status: "available",
    schema: "forgeax::scene-data::temporal-v1",
    producerId: "forgeax::standard::scene-data",
    structuralOnly: input.lane === "rhi-null",
    format: "rgba16float"
  };
}
function standardTemporalPostOrder(input) {
  const order = ["scene"];
  if (input.taa || input.motionBlur) order.push("standard-scene-data");
  if (input.taa) order.push("taa-resolve");
  if (input.motionBlur) order.push("motion-blur");
  if (input.bloom) order.push("bloom", "tone");
  order.push("output");
  return Object.freeze(order);
}
var TEMPORAL_TARGET = {
  format: "rgba16float",
  size: "surface",
  sampleCount: 1
};
function createStandardSceneDataTarget(graph, extent) {
  const temporal = createRenderPipelineTarget(graph, "standard-scene-temporal", {
    ...TEMPORAL_TARGET,
    size: extent === void 0 ? TEMPORAL_TARGET.size : renderExtentSize(extent, "internal")
  });
  return temporal.ok ? ok({ temporal: temporal.value }) : temporal;
}
function addStandardSceneDataPass(graph, target, depth) {
  return addTypedScenePass(graph, {
    name: "standard-scene-data",
    color: target,
    depth,
    selector: { LightMode: ["Deferred", "Forward"] },
    // The temporal producer runs before the Surface raw-depth/nearest-layer
    // pair. Keep it on the ordinary opaque Standard lane rather than asking
    // a medium material to assemble a bind group from resources that this
    // pass cannot own yet.
    recordMode: "opaque",
    passKind: "temporal",
    // The temporal producer re-rasterizes the current scene after the main
    // color pass has populated depth. Its output is a semantic motion target;
    // it must cover the same fragments even when TAA jitter moves the raster
    // edge by a subpixel, while the loaded scene depth remains the consumer's
    // depth-rejection source for Motion Blur/TAA.
    clearColor: [0, 0, -1, 1],
    colorLoadOp: "clear",
    depthLoadOp: "load"
  });
}
function addTaaResolvePass(graph, current, currentTemporal, previousColor, previousTemporal, output) {
  return addTypedFullscreenPass(graph, {
    name: "taa-resolve",
    shader: "forgeax.taa-resolve",
    input: current,
    output,
    additionalReads: [
      { key: "scene-temporal", target: currentTemporal },
      { key: "taa-history-color", target: previousColor },
      { key: "taa-history-temporal", target: previousTemporal }
    ]
  });
}

export { BLOOM_COMPOSITE_PARAMS_BYTES, BLOOM_DOWNSAMPLE_PARAMS_BYTES, BLOOM_UPSAMPLE_PARAMS_BYTES, BYTES_PER_DIRECT_LIGHT_SLOT, BatchTopology, CAPTURE_VIEW_PROJS, CLOUD_HISTORY_FORMATS, CUBEMAP_FACE_VERTICES, CUBE_CAPTURE_VIEW_SLOT_BASE, DEFERRED_COLOR_FORMATS, DEPTH_MIN_PARAMS_BYTE_SIZE, DEPTH_TEXTURE_FORMAT, FALLBACK_BYTES_PER_ROW, GPU_DRIVEN_VIEW_WGSL, GPU_SCENE_LAYOUTS, GpuBuffer, GpuDrivenView, GpuResourceAllocationLedger, GpuTexture, HDR_COLOR_ATTACHMENT_FORMAT, MESH_PER_ENTITY_STRIDE, MESH_SSBO_BYTES, MIPMAP_PREWARM_FORMATS, OcclusionConfidenceScheduler, POINTS_LINES_MATERIAL_SHADER_ID, POINTS_LINES_VIEW_BUFFER_SIZE, PREFILTER_MIP_LEVELS, PREFILTER_SIZE, PipelineSpecError, PostProcessError, REFLECTION_PROBE_VIEW_SLOT_BASE, SHADOW_CASTER_BUFFER_SIZE, STANDARD_PBR_REQUIRED_SAMPLED_TEXTURES, ShadowViewStatePool, SurfaceSubmissionObservationOwner, TEMPORAL_HISTORY_FORMATS, TYPED_BLOOM_PASS_NAMES, VIEW_UBO_BYTES, VIEW_UNIFORM_BYTES, VIEW_UNIFORM_SLOT_STRIDE, abortTemporalGpuSubmit, addReflectionFallbackObservationPass, addStandardSceneDataPass, addTaaResolvePass, addTypedBloomPasses, addTypedCompositePostEffects, addTypedFrameObservationPass, addTypedFullscreenPass, addTypedOutputTransformPass, addTypedScenePass, addTypedSkyboxPass, addTypedSsaoPasses, addTypedTemporalResolvePass, aggregateTemporalDemand, applyMaterialTextureUvScales, applyParamSchemaDefaultsToUbo, applyParamSnapshotToUbo, assembleMaterialWithSkylightEntries, assertStorageBufferCap, buildFoldDispatchPlan, buildFullscreenPostProcessPass, buildLinearLdrMaterialSpecTable, buildPerFrameBindGroups, buildSpecConstTable, cacheKeyOf, cleanPerEntityCache, colorFormatsForPassKind, combineGpuResourceAllocationInspections, commitTemporalGpuSubmit, computeProjectionMatrix, computeSplitLdrSprite, computeViewMatrix, createClusterBinScratch, createFullscreenBindGroup, createHdrpClusterMembershipBindGroupLayoutDescriptor, createIblPipelines, createPointsLinesLaneAdapter, createPointsLinesLaneContract, createRenderPipelineTarget, createSkylightFallback, createStandardSceneDataTarget, createStandardSurfaceLightingBindGroup, decideVisibility, defaultViewForUserRegionField, deriveRenderDataCubemap, deriveRenderDataMesh, deriveRenderDataTexture, deriveRenderExtent, describeTemporalDemand, detectNineSliceScaleTooSmall, deviceOptionsForAdapter, driveLazyEquirectProjection, encodeDirectionalShadowPass, encodeMainPass, encodePointShadowPass, encodeSpotShadowPass, ensureMeshSsboCapacity, ensureProbeBlendRecordBuffer, entryHasDepthRead, evaluateFoldBucketUniformCap, foldDispatchBuckets, geometryRenderStateForPass, geometryRenderStateForTopology, getIblProbeBackgroundSource, getOrBuildPipeline, getOrCreateFromChain, getOrCreateHdrpBuffers, getOrCreateIblCache, getTemporalBindGroupResources, getTemporalGpuState, getTemporalParamsBuffer, gpuSceneFieldOffset, hasPendingTemporalGpuSubmit, importRenderPipelineSurface, incrementFoldedDrawsMetric, inspectResourceClassSplits, isTemporalFullscreenBinding, packInstanceStorageBuffer, passKindPolicyTable, postProcessShaderEntrySignature, postProcessShaderModuleLabel, postProcessShaderPipelineLabel, prepareFrameLighting, prepareMaterialSkylight, prewarmMaterialShaderVariants, projectedHeightForCandidate, renderExtentSize, renderPipelineCloudHistoryTargets, requiresProbeBlendRecord, resetHdrpBuffers, resetSsaoResources, residentTextureView, resolveGeometryInstanceBuffer, resolveMaterialSkylight, resolveOutputDither, resolveReflectionProbeBinding, resolveSkyboxActive, resolveSsaoParameters, retireTemporalGpuState, retireTemporalGpuStateAfterFence, runIblPrecompute, selectGpuDrivenSceneIndexVariant, selectGpuLodLane, selectHdrpPbrPrewarmVariants, selectLazyEquirectHandle, selectLod, selectProbePrewarmVariants, selectSkinPrewarmVariants, selectStandardPbrTransmissionPrewarmVariants, setIblComposedShaders, shadowViewIdentityKey, shadowViewRasterAccesses, shouldIssueRetest, stageTemporalGpuSubmit, standardBloomAdmitted, standardStorageVariantSet, standardTemporalLaneAdmission, standardTemporalPostOrder, standardTopologyVariantSet, temporalReadIndex, temporalWriteIndex, transmissionBackdropAvailable, uploadMeshSsboBatch, variantSetFromDefines, variantSetFromVertexLayoutProjection, warnMultiSkybox, warnMultiSkylight, warnZeroLightStandard, writeHdrpClusterAndSsaoBuffers, writePbrMaterialUboPayload, writePointsLinesViewUbo, writeShadowCasterUniforms, writeShadowParamsBuffer, writeSpotModifierTextures, writeViewUbo };
