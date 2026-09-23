import { CLOUD_EXTINCTION_COEFFICIENT, MeshFilter, MeshRenderer, Instances, Layer, Visibility, Points, Lines, SortKey, CLOUD_QUALITY_PROFILES, cloudLayerFormationKey, CloudLayerCacheInvalidError, cloudShadowResolutionForQuality, glyphTextLayoutSystem, PointShapeValue, pointShapeFromU32, Camera, CAMERA_PROJECTION_ORTHOGRAPHIC, cloudViewDistanceForQuality } from './chunk-LP56LS4S.mjs';
import { SpriteInstances, SpriteRegionOverride, TileLayer, decodeSortScope, Tilemap } from './chunk-X2KA6WHM.mjs';
import { configureSurface } from './chunk-EQEJOMPI.mjs';
import { SPRITE_PREMULTIPLIED_ALPHA_BLEND } from './chunk-GNJVHYWM.mjs';
import { RenderTargetStateInvalidError, RenderTargetOperationFailedError, RenderTargetCapabilityMissingError, RenderTargetDescriptorInvalidError, GPU_BUFFER_USAGE_COPY_DST, GPU_BUFFER_USAGE_MAP_READ, resolveRenderTargetMaterialSource, createRenderTargetMaterialSource, PointsLinesBudgetExceededError, createVisibilityBudget, PointsLinesStyleUnsupportedError, PointsLinesMaterialUnsupportedError, GPU_TEXTURE_USAGE_RENDER_ATTACHMENT, GPU_TEXTURE_USAGE_TEXTURE_BINDING, GPU_TEXTURE_USAGE_COPY_SRC, PointsLinesInvalidStyleError, PointsLinesTopologyMismatchError } from './chunk-4IMMYRZV.mjs';
import { ok, err, deriveMaterialDynamicInputLayout, toShared, unwrapHandle } from '../../types/dist/index.mjs';
import { validateR32FloatReceipt } from '../../rhi/dist/index.mjs';
import { Update } from '../../ecs/dist/index.mjs';
import { ChildOf, MorphWeights, registerPropagateTransforms, GlobalTransform, Transform, Children } from '../../scene/dist/index.mjs';
import { RuntimeMaterialValue, RuntimeMeshVertices, HANDLE_QUAD, resolveTilesetRuntime } from '../../assets-runtime/dist/index.mjs';
import { decodeTileBits } from '../../graphics-extras/dist/index.mjs';
import { frustum, mat4 } from '../../math/dist/index.mjs';
import { createStateProjection } from '../../ecs/dist/projection/index.mjs';
import { Skin } from '../../skinning/dist/index.mjs';

// src/publication/contract.ts
function renderPublicationTransfers(packet) {
  return [
    packet.upserts.buffer,
    packet.removed.buffer,
    packet.transformEntities.buffer,
    packet.transforms.buffer
  ];
}
var RenderPublicationError = class extends Error {
  constructor(detail) {
    super(`render-publication-invalid: ${detail.reason}: ${detail.subject}`);
    this.detail = detail;
    this.name = "RenderPublicationError";
  }
  detail;
  code = "render-publication-invalid";
  expected = "one valid publication for the bound source session and accepted base";
  hint = "inspect detail.reason; repair the source or start a new session with a complete current baseline";
};

// src/typed-shadow-atlas.ts
function resolveDirectionalShadowAtlasGrid(cascadeCount) {
  const count = Math.max(1, Math.min(4, Math.round(cascadeCount)));
  if (count === 1) return { columns: 1, rows: 1 };
  if (count === 2) return { columns: 2, rows: 1 };
  return { columns: 2, rows: 2 };
}

// src/record/frame-targets.ts
function graphExecutionPhase(passName) {
  if (passName.startsWith("shadowCascade")) return "record/graph-execute/shadow";
  if (passName.startsWith("point-shadow")) return "record/graph-execute/point-shadow";
  if (passName.startsWith("spot-shadow")) return "record/graph-execute/spot-shadow";
  if (passName === "ssr-hiz-seed" || passName.startsWith("ssr-hiz-reduce-")) {
    return "record/graph-execute/ssr-hiz";
  }
  if (passName === "ssr-trace") return "record/graph-execute/ssr-trace";
  if (passName === "ssr-temporal") return "record/graph-execute/ssr-temporal";
  if (passName.startsWith("ssr-reflection-mip-")) {
    return "record/graph-execute/ssr-reflection-mip";
  }
  if (passName === "ssr-compose") return "record/graph-execute/ssr-compose";
  if (passName.startsWith("bloom-downsample-")) {
    return "record/graph-execute/bloom-downsample";
  }
  if (passName.startsWith("bloom-upsample-")) {
    return "record/graph-execute/bloom-upsample";
  }
  switch (passName) {
    case "cluster-binner-upload":
    case "cluster-membership-producer":
      return "record/graph-execute/cluster-binner-upload";
    case "g-buffer":
      return "record/graph-execute/g-buffer";
    case "ssao-calc":
      return "record/graph-execute/ssao-calc";
    case "ssao-blur":
      return "record/graph-execute/ssao-blur";
    case "lighting":
      return "record/graph-execute/lighting";
    case "forward":
    case "transmission-forward":
      return "record/graph-execute/forward";
    case "output-transform":
      return "record/graph-execute/output-transform";
    case "present":
      return "record/graph-execute/present";
    case "debug-overlay":
      return "record/graph-execute/debug-overlay";
    case "shadow":
      return "record/graph-execute/shadow";
    case "skybox":
      return "record/graph-execute/skybox";
    case "main":
      return "record/graph-execute/main";
    case "fxaa":
      return "record/graph-execute/fxaa";
    case "bloom-downsample":
      return "record/graph-execute/bloom-downsample";
    case "bloom-upsample":
      return "record/graph-execute/bloom-upsample";
    case "bloom-composite":
      return "record/graph-execute/bloom-composite";
    default:
      return "record/graph-execute/other";
  }
}
function resolveRenderTargetMipExtent(descriptor, mipLevel) {
  const mipCount2 = descriptor.mipLevels === 1 ? 1 : Math.floor(Math.log2(Math.max(descriptor.width, descriptor.height))) + 1;
  const level = Math.max(0, Math.min(mipLevel, mipCount2 - 1));
  return {
    width: Math.max(1, descriptor.width >> level),
    height: Math.max(1, descriptor.height >> level)
  };
}
function acquireSwapChainTarget(internals, pipelineState) {
  const canvasContext = internals.context;
  if (canvasContext === null) return null;
  let currentTextureResult = canvasContext.getCurrentTexture();
  if (!currentTextureResult.ok) {
    const configuredDevice = internals.resolveSurfaceDevice?.(internals.device);
    if (configuredDevice !== void 0 && !configuredDevice.ok) {
      internals.errorRegistry.fire(configuredDevice.error);
      internals.healthRegistry.fire({
        reason: "internal-fault",
        detail: { message: "surface device resolution failed; current frame skipped" },
        recoverable: true
      });
      return null;
    }
    const configured = configureSurface(
      canvasContext,
      configuredDevice?.value ?? internals.device,
      pipelineState.format,
      pipelineState.colorAttachmentFormat
    );
    if (!configured.ok) {
      internals.errorRegistry.fire(configured.error);
      internals.healthRegistry.fire({
        reason: "internal-fault",
        detail: { message: "surface configure candidate failed; current frame skipped" },
        recoverable: true
      });
      return null;
    }
    pipelineState.perPassResources.configured = true;
    globalThis.__forgeaxSwapChainFormat = pipelineState.format;
    const retry = canvasContext.getCurrentTexture();
    if (!retry.ok) {
      internals.errorRegistry.fire(retry.error);
      internals.healthRegistry.fire({
        reason: "internal-fault",
        detail: {
          message: "surface-configure-failed after retry: getCurrentTexture failed twice consecutively"
        },
        recoverable: false
      });
      return null;
    }
    currentTextureResult = retry;
  }
  const viewDescriptor = pipelineState.colorAttachmentFormat === pipelineState.format ? {} : { format: pipelineState.colorAttachmentFormat };
  const viewResult = internals.device.createTextureView(currentTextureResult.value, viewDescriptor);
  if (!viewResult.ok) {
    internals.errorRegistry.fire(viewResult.error);
    return null;
  }
  return {
    currentTexture: currentTextureResult.value,
    view: viewResult.value,
    targetW: internals.canvas.width | 0,
    targetH: internals.canvas.height | 0
  };
}
function resolveShadowMapSize(internals, lights) {
  if (lights.cascadeCount === void 0) return void 0;
  const requested = lights.shadowMapSize;
  if (!(requested !== void 0 && requested > 0)) return requested;
  const cascades = Math.max(1, Math.min(4, Math.round(lights.cascadeCount ?? 1)));
  const atlasGrid = resolveDirectionalShadowAtlasGrid(cascades);
  const maxDimension = internals.device.limits.maxTextureDimension2D;
  if (!(maxDimension > 0)) return Math.floor(requested);
  const depthTextureDimension = internals.device.caps?.backendKind === "wgpu-webgl2" ? Math.max(1, Math.floor(maxDimension / 2)) : maxDimension;
  const maxPerTile = Math.max(
    1,
    Math.floor(depthTextureDimension / Math.max(atlasGrid.columns, atlasGrid.rows))
  );
  return Math.max(1, Math.min(Math.floor(requested), maxPerTile));
}
function resolveSpotShadowMapSize(internals, lights) {
  const requested = lights.spot.find(
    (spot) => spot.shadowAtlasTile >= 0 && spot.lightViewProj !== void 0
  )?.mapSize;
  if (!(requested !== void 0 && requested > 0)) return requested;
  const maxDimension = internals.device.limits.maxTextureDimension2D;
  if (!(maxDimension > 0)) return Math.floor(requested);
  const maxPerTile = Math.max(1, Math.floor(maxDimension / 2));
  return Math.max(1, Math.min(Math.floor(requested), maxPerTile));
}

// src/targets/contracts.ts
var FORMAT_BYTES = {
  rgba16float: 8,
  rgba8unorm: 4,
  "rgba8unorm-srgb": 4
};
function mipFactor(mipLevels) {
  return mipLevels === "full" ? 4 / 3 : 1;
}
function estimatedBytes(descriptor) {
  const layers = descriptor.shape === "cube" ? 6 : 1;
  const samples = descriptor.sampleCount;
  const depthBytes = descriptor.depth === void 0 ? 0 : 4;
  return Math.ceil(
    descriptor.width * descriptor.height * FORMAT_BYTES[descriptor.format] * layers * samples * mipFactor(descriptor.mipLevels) + descriptor.width * descriptor.height * depthBytes * layers * samples * mipFactor(descriptor.mipLevels)
  );
}
function invalid(field, value, expected) {
  return {
    ok: false,
    error: new RenderTargetDescriptorInvalidError({ field, value, expected })
  };
}
function admitRenderTargetDescriptor(descriptor, limits) {
  if (!Number.isInteger(descriptor.width) || descriptor.width < 1) {
    return invalid("width", descriptor.width, "an integer >= 1");
  }
  if (!Number.isInteger(descriptor.height) || descriptor.height < 1) {
    return invalid("height", descriptor.height, "an integer >= 1");
  }
  if (descriptor.width > limits.maxTextureDimension2D || descriptor.height > limits.maxTextureDimension2D) {
    return invalid(
      "extent",
      { width: descriptor.width, height: descriptor.height },
      `width and height <= ${limits.maxTextureDimension2D}`
    );
  }
  if (descriptor.shape === "cube" && descriptor.width !== descriptor.height) {
    return invalid("shape", descriptor.shape, "cube width === height");
  }
  if (!limits.renderableFormats.includes(descriptor.format)) {
    return {
      ok: false,
      error: new RenderTargetCapabilityMissingError({
        operation: "create",
        requested: descriptor.format,
        capability: "renderableFormats",
        actual: limits.renderableFormats.join(", ")
      })
    };
  }
  if (!limits.sampleCounts.includes(descriptor.sampleCount)) {
    return {
      ok: false,
      error: new RenderTargetCapabilityMissingError({
        operation: "create",
        requested: String(descriptor.sampleCount),
        capability: "sampleCounts",
        actual: limits.sampleCounts.join(", ")
      })
    };
  }
  if (descriptor.depth !== void 0 && !limits.depthFormats.includes(descriptor.depth)) {
    return {
      ok: false,
      error: new RenderTargetCapabilityMissingError({
        operation: "create",
        requested: descriptor.depth,
        capability: "depthFormats",
        actual: limits.depthFormats.join(", ")
      })
    };
  }
  const bytes = estimatedBytes(descriptor);
  if (bytes > limits.maxBytesPerTarget) {
    return invalid("bytes", bytes, `estimated allocation <= ${limits.maxBytesPerTarget}`);
  }
  return { ok: true, value: descriptor };
}

// src/targets/owner.ts
function frozenDescriptor(descriptor) {
  return Object.freeze({ ...descriptor });
}
function invalid2(operation, reason, state, generation) {
  return {
    ok: false,
    error: new RenderTargetStateInvalidError({ operation, reason, state, generation })
  };
}
function token() {
  return Object.freeze({});
}
function createRenderTargetOwner(options) {
  const targets = /* @__PURE__ */ new WeakMap();
  const requireTarget = (target, operation) => {
    const state = targets.get(target);
    if (state === void 0) return invalid2(operation, "foreign-renderer", "destroyed", 0);
    if (state.rendererId !== options.rendererId) {
      return invalid2(operation, "foreign-renderer", state.state, state.generation);
    }
    if (state.state === "destroyed") {
      return invalid2(operation, "destroyed", state.state, state.generation);
    }
    return { ok: true, value: state };
  };
  return {
    create(descriptor) {
      const target = token();
      targets.set(target, {
        target,
        rendererId: options.rendererId,
        state: "uninitialized",
        generation: 0,
        descriptor: frozenDescriptor(descriptor),
        candidate: void 0,
        retiredGenerations: /* @__PURE__ */ new Set()
      });
      return { ok: true, value: target };
    },
    stage(target, descriptor) {
      const found = requireTarget(target, "resize");
      if (!found.ok) return found;
      const state = found.value;
      if (state.state === "rebuilding") {
        return invalid2("resize", "generation-mismatch", state.state, state.generation);
      }
      const candidate = Object.freeze({
        generation: state.state === "uninitialized" ? options.initialGeneration : state.generation,
        descriptor: frozenDescriptor(descriptor ?? state.descriptor)
      });
      state.candidate = candidate;
      state.state = "candidate";
      return { ok: true, value: candidate };
    },
    promote(target, generation) {
      const found = requireTarget(target, "resize");
      if (!found.ok) return found;
      const state = found.value;
      if (state.candidate?.generation !== generation) {
        return invalid2("resize", "generation-mismatch", state.state, state.generation);
      }
      state.descriptor = state.candidate.descriptor;
      state.generation = generation;
      state.candidate = void 0;
      state.state = "active";
      return { ok: true, value: void 0 };
    },
    rejectCandidate(target, generation, stage) {
      const found = requireTarget(target, "resize");
      if (!found.ok) return found;
      const state = found.value;
      if (state.candidate?.generation !== generation) {
        return invalid2("resize", "generation-mismatch", state.state, state.generation);
      }
      state.candidate = void 0;
      state.state = state.generation === 0 ? "uninitialized" : "active";
      return {
        ok: false,
        error: new RenderTargetOperationFailedError({
          operation: "resize",
          stage,
          generation,
          cause: new Error(`candidate ${generation} failed during ${stage}`),
          recovery: state.generation === 0 ? "retry" : "retain-last-known-good"
        })
      };
    },
    beginRecovery(target, generation) {
      const found = requireTarget(target, "resize");
      if (!found.ok) return found;
      const state = found.value;
      if (state.state !== "active" || generation <= state.generation) {
        return invalid2("resize", "generation-mismatch", state.state, state.generation);
      }
      state.generation = generation;
      state.candidate = void 0;
      state.state = "rebuilding";
      return { ok: true, value: void 0 };
    },
    finishRecovery(target) {
      const found = requireTarget(target, "resize");
      if (!found.ok) return found;
      const state = found.value;
      if (state.state !== "rebuilding") {
        return invalid2("resize", "generation-mismatch", state.state, state.generation);
      }
      state.state = "uninitialized";
      return { ok: true, value: void 0 };
    },
    retire(target, generation) {
      const found = requireTarget(target, "destroy");
      if (!found.ok) return found;
      found.value.retiredGenerations.add(generation);
      return { ok: true, value: void 0 };
    },
    destroy(target) {
      const state = targets.get(target);
      if (state === void 0) return invalid2("destroy", "foreign-renderer", "destroyed", 0);
      if (state.rendererId !== options.rendererId) {
        return invalid2("destroy", "foreign-renderer", state.state, state.generation);
      }
      if (state.state === "destroyed") return { ok: true, value: void 0 };
      state.candidate = void 0;
      state.state = "destroyed";
      return { ok: true, value: void 0 };
    },
    inspect(target) {
      const found = requireTarget(target, "inspect");
      if (!found.ok) return found;
      const state = found.value;
      return {
        ok: true,
        value: Object.freeze({
          token: state.target,
          state: state.state,
          generation: state.generation,
          descriptor: state.descriptor,
          ...state.candidate === void 0 ? {} : { candidate: state.candidate }
        })
      };
    }
  };
}

// src/targets/readback.ts
function invalidTicket(ticket, reason) {
  return {
    ok: false,
    error: new RenderTargetStateInvalidError({
      operation: "readback",
      reason,
      state: reason === "destroyed" ? "destroyed" : "active",
      generation: ticket.deviceGeneration
    })
  };
}
function bindRenderTargetReadbackTicket(ticket, receipt) {
  if (ticket.consumed) return invalidTicket(ticket, "destroyed");
  if (ticket.frameId !== void 0) {
    return invalidTicket(ticket, "generation-mismatch");
  }
  ticket.frameId = receipt.frameId;
  ticket.deviceGeneration = receipt.deviceGeneration;
  return { ok: true, value: void 0 };
}
function createRenderTargetReadbackTicket(target, input) {
  if (input.frameId !== void 0 && (!Number.isInteger(input.frameId) || input.frameId < 0) || !Number.isInteger(input.deviceGeneration) || input.deviceGeneration < 0 || !Number.isInteger(input.mipLevel) || input.mipLevel < 0 || !Number.isInteger(input.width) || input.width < 1 || !Number.isInteger(input.height) || input.height < 1 || !Number.isInteger(input.bytesPerPixel) || input.bytesPerPixel < 1) {
    return {
      ok: false,
      error: new RenderTargetOperationFailedError({
        operation: "readback",
        stage: "copy",
        generation: input.deviceGeneration,
        cause: new Error("readback dimensions and identity must be non-negative integers"),
        recovery: "retry"
      })
    };
  }
  const unalignedRowBytes = input.width * input.bytesPerPixel;
  const bytesPerRow = Math.ceil(unalignedRowBytes / 256) * 256;
  return {
    ok: true,
    value: {
      target,
      frameId: input.frameId,
      deviceGeneration: input.deviceGeneration,
      mipLevel: input.mipLevel,
      ...input.face === void 0 ? {} : { face: input.face },
      width: input.width,
      height: input.height,
      bytesPerRow,
      byteLength: bytesPerRow * input.height,
      consumed: false
    }
  };
}
function completeRenderTargetReadback(ticket, receipt, bytes) {
  if (ticket.consumed) return invalidTicket(ticket, "destroyed");
  if (ticket.frameId === void 0 || receipt.frameId !== ticket.frameId || receipt.deviceGeneration !== ticket.deviceGeneration) {
    return invalidTicket(ticket, "generation-mismatch");
  }
  if (bytes.byteLength !== ticket.byteLength) {
    return {
      ok: false,
      error: new RenderTargetOperationFailedError({
        operation: "readback",
        stage: "copy",
        generation: ticket.deviceGeneration,
        cause: new Error(`expected ${ticket.byteLength} bytes, received ${bytes.byteLength}`),
        recovery: "retry"
      })
    };
  }
  ticket.consumed = true;
  return {
    ok: true,
    value: {
      bytes,
      frameId: ticket.frameId,
      deviceGeneration: ticket.deviceGeneration,
      mipLevel: ticket.mipLevel,
      ...ticket.face === void 0 ? {} : { face: ticket.face }
    }
  };
}

// src/assembly/render-target-host.ts
var DEFAULT_LIMITS = {
  maxTextureDimension2D: 8192,
  maxBytesPerTarget: 256 * 1024 * 1024,
  renderableFormats: ["rgba16float", "rgba8unorm", "rgba8unorm-srgb"],
  sampleCounts: [1, 4],
  depthFormats: ["depth24plus-stencil8", "depth32float"]
};
function opaqueTicket() {
  return Object.freeze({});
}
function bytesPerPixel(format) {
  return format === "rgba16float" ? 8 : 4;
}
function mipCount(descriptor) {
  return descriptor.mipLevels === 1 ? 1 : Math.floor(Math.log2(Math.max(descriptor.width, descriptor.height))) + 1;
}
function makePhysical(device, descriptor, generation) {
  const layers = descriptor.shape === "cube" ? 6 : 1;
  const usage = GPU_TEXTURE_USAGE_RENDER_ATTACHMENT | (descriptor.sampled ? GPU_TEXTURE_USAGE_TEXTURE_BINDING : 0) | (descriptor.readback ? GPU_TEXTURE_USAGE_COPY_SRC : 0);
  const created = device.createTexture({
    label: `render-target.${generation}`,
    size: { width: descriptor.width, height: descriptor.height, depthOrArrayLayers: layers },
    format: descriptor.format,
    mipLevelCount: mipCount(descriptor),
    // WebGPU forbids multisampled array textures. The cube is always the
    // single-sample resolve destination; MSAA capture uses one depth=1 color
    // texture per face below.
    sampleCount: 1,
    dimension: "2d",
    usage,
    viewFormats: void 0,
    textureBindingViewDimension: descriptor.shape === "cube" ? "cube" : void 0
  });
  if (!created.ok)
    return {
      ok: false,
      error: new RenderTargetOperationFailedError({
        operation: "create",
        stage: "allocation",
        generation,
        cause: created.error,
        recovery: "retry"
      })
    };
  const texture = created.value;
  const view = device.createTextureView(texture, {
    dimension: descriptor.shape,
    baseMipLevel: 0,
    mipLevelCount: mipCount(descriptor),
    baseArrayLayer: 0,
    arrayLayerCount: layers
  });
  if (!view.ok)
    return {
      ok: false,
      error: new RenderTargetOperationFailedError({
        operation: "create",
        stage: "allocation",
        generation,
        cause: view.error,
        recovery: "retry"
      })
    };
  const mipViews = [];
  for (let mip = 0; mip < mipCount(descriptor); mip += 1) {
    const mipView = device.createTextureView(texture, {
      dimension: descriptor.shape,
      baseMipLevel: mip,
      mipLevelCount: 1,
      baseArrayLayer: 0,
      arrayLayerCount: layers
    });
    if (!mipView.ok)
      return {
        ok: false,
        error: new RenderTargetOperationFailedError({
          operation: "create",
          stage: "allocation",
          generation,
          cause: mipView.error,
          recovery: "retry"
        })
      };
    mipViews.push(mipView.value);
  }
  const resolveFaceViews = [];
  for (let face = 0; face < layers; face += 1) {
    const faceView = device.createTextureView(texture, {
      dimension: "2d",
      baseMipLevel: 0,
      mipLevelCount: 1,
      baseArrayLayer: face,
      arrayLayerCount: 1
    });
    if (!faceView.ok)
      return {
        ok: false,
        error: new RenderTargetOperationFailedError({
          operation: "create",
          stage: "allocation",
          generation,
          cause: faceView.error,
          recovery: "retry"
        })
      };
    resolveFaceViews.push(faceView.value);
  }
  const colorTextures = [];
  const faceViews = [];
  const depthTextures = [];
  const depthViews = [];
  for (let face = 0; face < layers; face += 1) {
    const depth = device.createTexture({
      label: `render-target.${generation}.depth.${face}`,
      size: {
        width: descriptor.width,
        height: descriptor.height,
        depthOrArrayLayers: descriptor.sampleCount === 4 ? 1 : layers
      },
      mipLevelCount: 1,
      sampleCount: descriptor.sampleCount,
      dimension: "2d",
      format: "depth24plus-stencil8",
      usage: GPU_TEXTURE_USAGE_RENDER_ATTACHMENT,
      viewFormats: void 0,
      textureBindingViewDimension: void 0
    });
    if (!depth.ok)
      return {
        ok: false,
        error: new RenderTargetOperationFailedError({
          operation: "create",
          stage: "allocation",
          generation,
          cause: depth.error,
          recovery: "retry"
        })
      };
    const depthView = device.createTextureView(depth.value, {
      dimension: "2d",
      baseArrayLayer: descriptor.sampleCount === 4 ? 0 : face,
      arrayLayerCount: 1
    });
    if (!depthView.ok)
      return {
        ok: false,
        error: new RenderTargetOperationFailedError({
          operation: "create",
          stage: "allocation",
          generation,
          cause: depthView.error,
          recovery: "retry"
        })
      };
    depthTextures.push(depth.value);
    depthViews.push(depthView.value);
  }
  if (descriptor.sampleCount === 4) {
    for (let face = 0; face < layers; face += 1) {
      const msaa = device.createTexture({
        label: `render-target.${generation}.msaa.${face}`,
        size: { width: descriptor.width, height: descriptor.height, depthOrArrayLayers: 1 },
        format: descriptor.format,
        mipLevelCount: 1,
        sampleCount: 4,
        dimension: "2d",
        usage: GPU_TEXTURE_USAGE_RENDER_ATTACHMENT,
        viewFormats: void 0,
        textureBindingViewDimension: void 0
      });
      if (!msaa.ok)
        return {
          ok: false,
          error: new RenderTargetOperationFailedError({
            operation: "create",
            stage: "allocation",
            generation,
            cause: msaa.error,
            recovery: "retry"
          })
        };
      const msaaView = device.createTextureView(msaa.value, {
        dimension: "2d",
        baseMipLevel: 0,
        mipLevelCount: 1,
        baseArrayLayer: 0,
        arrayLayerCount: 1
      });
      if (!msaaView.ok)
        return {
          ok: false,
          error: new RenderTargetOperationFailedError({
            operation: "create",
            stage: "allocation",
            generation,
            cause: msaaView.error,
            recovery: "retry"
          })
        };
      colorTextures.push(msaa.value);
      faceViews.push(msaaView.value);
    }
  } else {
    for (let face = 0; face < layers; face += 1) {
      colorTextures.push(texture);
      faceViews.push(resolveFaceViews[face] ?? view.value);
    }
  }
  return {
    ok: true,
    value: {
      generation,
      descriptor,
      texture,
      view: view.value,
      mipViews,
      colorTextures,
      faceViews,
      depthTextures,
      depthViews,
      ...descriptor.sampleCount === 4 ? { resolveTexture: texture } : {},
      resolveView: view.value,
      resolveFaceViews
    }
  };
}
function destroyPhysical(device, physical) {
  if (device === void 0 || physical === void 0) return;
  const textures = /* @__PURE__ */ new Set();
  textures.add(physical.texture);
  if (physical.resolveTexture !== void 0) textures.add(physical.resolveTexture);
  for (const texture of physical.colorTextures) textures.add(texture);
  for (const texture of physical.depthTextures) textures.add(texture);
  for (const texture of textures) device.destroyTexture(texture);
}
function createRenderTargetHost(options = {}) {
  let disposed = false;
  const limits = options.limits ?? DEFAULT_LIMITS;
  const owner = createRenderTargetOwner({
    rendererId: options.rendererId ?? /* @__PURE__ */ Symbol("renderer"),
    initialGeneration: options.initialGeneration ?? 0
  });
  const targets = /* @__PURE__ */ new Set();
  const staged = /* @__PURE__ */ new Set();
  const activePhysical = /* @__PURE__ */ new WeakMap();
  const candidatePhysical = /* @__PURE__ */ new WeakMap();
  const sources = /* @__PURE__ */ new WeakMap();
  const readbacks = /* @__PURE__ */ new WeakMap();
  const readbackRecords = /* @__PURE__ */ new Set();
  const currentGeneration = () => options.getGeneration?.() ?? options.initialGeneration ?? 0;
  const stagePhysical = (target, descriptor) => {
    const stagedTarget = owner.stage(target, descriptor);
    if (!stagedTarget.ok) return stagedTarget;
    const device = options.getDevice?.();
    if (device === void 0) {
      staged.add(target);
      return { ok: true, value: void 0 };
    }
    const physical = makePhysical(
      device,
      stagedTarget.value.descriptor,
      stagedTarget.value.generation
    );
    if (!physical.ok) {
      owner.rejectCandidate(target, stagedTarget.value.generation, "allocation");
      return physical;
    }
    candidatePhysical.set(target, physical.value);
    staged.add(target);
    return { ok: true, value: void 0 };
  };
  return Object.freeze({
    owner: "renderer",
    descriptions() {
      return [...targets].map((target) => {
        const state = owner.inspect(target);
        if (!state.ok) throw state.error;
        return { target, descriptor: state.value.candidate?.descriptor ?? state.value.descriptor };
      });
    },
    createRenderTarget(descriptor) {
      if (disposed) {
        return {
          ok: false,
          error: new RenderTargetStateInvalidError({
            operation: "inspect",
            reason: "destroyed",
            state: "destroyed",
            generation: currentGeneration()
          })
        };
      }
      const admitted = admitRenderTargetDescriptor(descriptor, limits);
      if (!admitted.ok) return admitted;
      const created = owner.create(admitted.value);
      if (created.ok) targets.add(created.value);
      return created;
    },
    resizeRenderTarget(target, descriptor) {
      const admitted = admitRenderTargetDescriptor(descriptor, limits);
      if (!admitted.ok) return admitted;
      return stagePhysical(target, admitted.value);
    },
    createRenderTargetTextureSource(target, sourceOptions) {
      const inspected = owner.inspect(target);
      if (!inspected.ok) return inspected;
      if (!inspected.value.descriptor.sampled) {
        return {
          ok: false,
          error: new RenderTargetCapabilityMissingError({
            operation: "source",
            requested: "sampled=true",
            capability: "sampled",
            actual: "false"
          })
        };
      }
      if (sourceOptions.dimension !== inspected.value.descriptor.shape) {
        return {
          ok: false,
          error: new RenderTargetDescriptorInvalidError({
            field: "dimension",
            value: sourceOptions.dimension,
            expected: `dimension matches ${inspected.value.descriptor.shape}`
          })
        };
      }
      if (!Number.isInteger(sourceOptions.mipLevel) || sourceOptions.mipLevel < 0 || inspected.value.descriptor.mipLevels === 1 && sourceOptions.mipLevel !== 0) {
        return {
          ok: false,
          error: new RenderTargetDescriptorInvalidError({
            field: "mipLevel",
            value: sourceOptions.mipLevel,
            expected: "an admitted mip level for the target"
          })
        };
      }
      const binding = createRenderTargetMaterialSource(target, inspected.value.descriptor, {
        ...sourceOptions,
        generation: inspected.value.generation
      });
      if (!binding.ok) return binding;
      sources.set(binding.value.source, binding.value);
      return { ok: true, value: binding.value.source };
    },
    resolveRenderTargetTextureSource(source) {
      const binding = sources.get(source) ?? resolveRenderTargetMaterialSource(source);
      if (binding === void 0) return void 0;
      const physical = activePhysical.get(binding.target);
      if (physical === void 0) return binding;
      const view = physical.mipViews[binding.view.mipLevel] ?? (binding.shape === "cube" ? physical.view : physical.resolveView);
      if (binding.generation !== physical.generation) return binding;
      return { ...binding, textureView: view };
    },
    requestTargetReadback(target, request) {
      const inspected = owner.inspect(target);
      if (!inspected.ok) return inspected;
      if (!inspected.value.descriptor.readback) {
        return {
          ok: false,
          error: new RenderTargetCapabilityMissingError({
            operation: "readback",
            requested: "readback=true",
            capability: "readback",
            actual: "false"
          })
        };
      }
      if (!Number.isInteger(request.mipLevel) || request.mipLevel < 0) {
        return {
          ok: false,
          error: new RenderTargetDescriptorInvalidError({
            field: "mipLevel",
            value: request.mipLevel,
            expected: "a non-negative integer"
          })
        };
      }
      const mipCount2 = inspected.value.descriptor.mipLevels === 1 ? 1 : Math.floor(
        Math.log2(
          Math.max(inspected.value.descriptor.width, inspected.value.descriptor.height)
        )
      ) + 1;
      if (request.mipLevel >= mipCount2) {
        return {
          ok: false,
          error: new RenderTargetDescriptorInvalidError({
            field: "mipLevel",
            value: request.mipLevel,
            expected: `mipLevel < ${mipCount2}`
          })
        };
      }
      if (request.face !== void 0 && (!Number.isInteger(request.face) || request.face < 0 || request.face > 5 || inspected.value.descriptor.shape !== "cube")) {
        return {
          ok: false,
          error: new RenderTargetDescriptorInvalidError({
            field: "face",
            value: request.face,
            expected: inspected.value.descriptor.shape === "cube" ? "an integer in [0, 5]" : "omitted for a 2d target"
          })
        };
      }
      const ticket = opaqueTicket();
      const extent = resolveRenderTargetMipExtent(inspected.value.descriptor, request.mipLevel);
      const buffer = options.getDevice?.()?.createBuffer({
        label: `render-target-readback.${request.mipLevel}.${request.face ?? 0}`,
        size: Math.ceil(extent.width * bytesPerPixel(inspected.value.descriptor.format) / 256) * 256 * extent.height,
        usage: GPU_BUFFER_USAGE_COPY_DST | GPU_BUFFER_USAGE_MAP_READ,
        mappedAtCreation: false
      });
      if (buffer !== void 0 && !buffer.ok) {
        return {
          ok: false,
          error: new RenderTargetOperationFailedError({
            operation: "readback",
            stage: "allocation",
            generation: inspected.value.generation,
            cause: buffer.error,
            recovery: "retry"
          })
        };
      }
      const internalTicket = createRenderTargetReadbackTicket(target, {
        deviceGeneration: inspected.value.generation,
        mipLevel: request.mipLevel,
        ...request.face === void 0 ? {} : { face: request.face },
        width: extent.width,
        height: extent.height,
        bytesPerPixel: bytesPerPixel(inspected.value.descriptor.format)
      });
      if (!internalTicket.ok) return internalTicket;
      const record = {
        target,
        request,
        ticket: internalTicket.value,
        ...buffer === void 0 ? {} : { buffer: buffer.value },
        encoded: false
      };
      readbacks.set(ticket, record);
      readbackRecords.add(record);
      return { ok: true, value: ticket };
    },
    async observeTargetReadbacks(receipt, tickets) {
      const results = [];
      for (const publicTicket of tickets) {
        const record = readbacks.get(publicTicket);
        if (record === void 0) {
          return {
            ok: false,
            error: new RenderTargetStateInvalidError({
              operation: "readback",
              reason: "foreign-renderer",
              state: "destroyed",
              generation: receipt.deviceGeneration
            })
          };
        }
        const inspected = owner.inspect(record.target);
        if (!inspected.ok) return inspected;
        if (inspected.value.state !== "active") {
          return {
            ok: false,
            error: new RenderTargetStateInvalidError({
              operation: "readback",
              reason: "uninitialized",
              state: inspected.value.state,
              generation: inspected.value.generation
            })
          };
        }
        if (inspected.value.generation !== receipt.deviceGeneration) {
          return {
            ok: false,
            error: new RenderTargetStateInvalidError({
              operation: "readback",
              reason: "generation-mismatch",
              state: inspected.value.state,
              generation: inspected.value.generation
            })
          };
        }
        const bound = bindRenderTargetReadbackTicket(record.ticket, receipt);
        if (!bound.ok) return bound;
        let bytes = new Uint8Array(record.ticket.byteLength);
        if (record.buffer !== void 0 && typeof record.buffer.mapAsync === "function") {
          const mapped = await record.buffer.mapAsync(1);
          if (!mapped.ok) {
            return {
              ok: false,
              error: new RenderTargetOperationFailedError({
                operation: "readback",
                stage: "copy",
                generation: receipt.deviceGeneration,
                cause: mapped.error,
                recovery: "retry"
              })
            };
          }
          const range = mapped.value.getMappedRange();
          if (!range.ok) {
            return {
              ok: false,
              error: new RenderTargetOperationFailedError({
                operation: "readback",
                stage: "copy",
                generation: receipt.deviceGeneration,
                cause: range.error,
                recovery: "retry"
              })
            };
          }
          bytes = new Uint8Array(range.value.slice(0));
          mapped.value.unmap();
        }
        const completed = completeRenderTargetReadback(record.ticket, receipt, bytes);
        if (!completed.ok) return completed;
        results.push({
          ticket: publicTicket,
          bytes: completed.value.bytes,
          frameId: completed.value.frameId,
          deviceGeneration: completed.value.deviceGeneration,
          mipLevel: completed.value.mipLevel,
          ...completed.value.face === void 0 ? {} : { face: completed.value.face },
          bytesPerRow: record.ticket.bytesPerRow,
          byteLength: record.ticket.byteLength
        });
      }
      return { ok: true, value: Object.freeze(results) };
    },
    destroyRenderTarget(target) {
      const destroyed = owner.destroy(target);
      if (destroyed.ok) {
        destroyPhysical(options.getDevice?.(), activePhysical.get(target));
        destroyPhysical(options.getDevice?.(), candidatePhysical.get(target));
        activePhysical.delete(target);
        candidatePhysical.delete(target);
        for (const record of readbackRecords) {
          if (record.target !== target) continue;
          if (record.buffer !== void 0) options.getDevice?.()?.destroyBuffer(record.buffer);
          readbacks.delete(record.ticket);
          readbackRecords.delete(record);
        }
        targets.delete(target);
      }
      return destroyed;
    },
    beginFrame() {
      if (disposed) return;
      for (const target of targets) {
        const inspected = owner.inspect(target);
        if (!inspected.ok || inspected.value.state === "active" || inspected.value.state === "candidate") {
          continue;
        }
        stagePhysical(target);
      }
    },
    onFrameSubmitted(completed = Promise.resolve({ ok: true, value: void 0 })) {
      if (disposed) return;
      const submittedTargets = [...staged];
      staged.clear();
      void completed.then((result) => {
        for (const target of submittedTargets) {
          const candidate = owner.inspect(target);
          if (!candidate.ok || candidate.value.candidate === void 0) continue;
          if (!result.ok) {
            owner.rejectCandidate(target, candidate.value.candidate.generation, "submit");
            destroyPhysical(options.getDevice?.(), candidatePhysical.get(target));
            candidatePhysical.delete(target);
            continue;
          }
          if (options.canPromoteTarget?.(target) === false) {
            staged.add(target);
            continue;
          }
          const generation = candidate.value.candidate.generation;
          const physical = candidatePhysical.get(target);
          if (physical === void 0) {
            owner.rejectCandidate(target, generation, "submit");
            continue;
          }
          const promoted = owner.promote(target, generation);
          if (!promoted.ok) {
            destroyPhysical(options.getDevice?.(), physical);
            candidatePhysical.delete(target);
            continue;
          }
          const previous = activePhysical.get(target);
          activePhysical.set(target, physical);
          candidatePhysical.delete(target);
          destroyPhysical(options.getDevice?.(), previous);
        }
      });
    },
    getPhysicalTarget(target) {
      return candidatePhysical.get(target) ?? activePhysical.get(target);
    },
    encodePendingReadbacks(encoder, faces) {
      for (const record of readbackRecords) {
        if (record.encoded || record.buffer === void 0) continue;
        if (faces !== void 0 && record.ticket.face !== void 0 && !faces.includes(record.ticket.face)) {
          continue;
        }
        const candidate = candidatePhysical.get(record.target);
        const physical = faces !== void 0 && candidate !== void 0 && record.ticket.face !== void 0 && faces.includes(record.ticket.face) ? candidate : activePhysical.get(record.target);
        if (physical === void 0) continue;
        const source = physical.resolveTexture ?? physical.texture;
        encoder.copyTextureToBuffer(
          {
            texture: source,
            mipLevel: record.ticket.mipLevel,
            origin: { x: 0, y: 0, z: record.ticket.face ?? 0 }
          },
          {
            buffer: record.buffer,
            bytesPerRow: record.ticket.bytesPerRow,
            rowsPerImage: record.ticket.height
          },
          [record.ticket.width, record.ticket.height, 1]
        );
        record.encoded = true;
      }
    },
    recover() {
      if (disposed) return;
      const generation = currentGeneration();
      for (const target of targets) {
        const inspected = owner.inspect(target);
        if (!inspected.ok || inspected.value.state !== "active") continue;
        destroyPhysical(options.getDevice?.(), activePhysical.get(target));
        destroyPhysical(options.getDevice?.(), candidatePhysical.get(target));
        activePhysical.delete(target);
        candidatePhysical.delete(target);
        for (const record of readbackRecords) {
          if (record.target !== target) continue;
          if (record.buffer !== void 0) options.getDevice?.()?.destroyBuffer(record.buffer);
          readbacks.delete(record.ticket);
          readbackRecords.delete(record);
        }
        const begun = owner.beginRecovery(target, generation);
        if (begun.ok) owner.finishRecovery(target);
      }
    },
    dispose() {
      disposed = true;
      for (const target of [...targets]) {
        destroyPhysical(options.getDevice?.(), activePhysical.get(target));
        destroyPhysical(options.getDevice?.(), candidatePhysical.get(target));
        for (const record of readbackRecords) {
          if (record.target !== target) continue;
          if (record.buffer !== void 0) options.getDevice?.()?.destroyBuffer(record.buffer);
          readbacks.delete(record.ticket);
          readbackRecords.delete(record);
        }
        activePhysical.delete(target);
        candidatePhysical.delete(target);
        owner.destroy(target);
      }
      targets.clear();
      staged.clear();
      readbackRecords.clear();
    }
  });
}

// src/publication/targets.ts
var RenderPublicationTargetOwner = class {
  host = createRenderTargetHost();
  ids = /* @__PURE__ */ new WeakMap();
  nextId = 0;
  authoring = this.host;
  snapshot() {
    return this.host.descriptions().map(({ target, descriptor }) => {
      let id = this.ids.get(target);
      if (id === void 0) {
        id = ++this.nextId;
        this.ids.set(target, id);
      }
      return { id, token: target, descriptor };
    });
  }
  dispose() {
    this.host.dispose();
  }
};
function publicationTargetSources(templates) {
  const sources = /* @__PURE__ */ new Map();
  for (const template of templates)
    for (const material of template.snapshot.materials) {
      for (const source of material.textureSources?.values() ?? []) {
        if (sources.has(source)) continue;
        const binding = resolveRenderTargetMaterialSource(source);
        if (binding === void 0)
          throw new RenderPublicationError({
            reason: "shape",
            subject: "unknown material target source"
          });
        sources.set(source, {
          token: source,
          target: binding.target,
          options: {
            aspect: "color",
            dimension: binding.view.dimension,
            mipLevel: binding.view.mipLevel
          }
        });
      }
    }
  return [...sources.values()];
}
var RenderPublicationTargetReceiver = class {
  constructor(host) {
    this.host = host;
  }
  host;
  targets = /* @__PURE__ */ new Map();
  apply(input) {
    const packet = input.packet;
    if (packet.targets.length === 0 && packet.targetSources.length === 0 && this.targets.size === 0)
      return input;
    const tokens = /* @__PURE__ */ new Map();
    const records = /* @__PURE__ */ new Map();
    const active = new Set(packet.targets.map((row) => row.id));
    for (const [id, record] of this.targets)
      if (!active.has(id)) {
        const destroyed = this.host.destroyRenderTarget(record.target);
        if (!destroyed.ok) throw destroyed.error;
        this.targets.delete(id);
      }
    for (const row of packet.targets) {
      let record = this.targets.get(row.id);
      if (record === void 0) {
        const created = this.host.createRenderTarget(row.descriptor);
        if (!created.ok) throw created.error;
        record = { target: created.value, descriptor: row.descriptor, sources: /* @__PURE__ */ new Map() };
        this.targets.set(row.id, record);
      } else if (JSON.stringify(record.descriptor) !== JSON.stringify(row.descriptor)) {
        const resized = this.host.resizeRenderTarget(record.target, row.descriptor);
        if (!resized.ok) throw resized.error;
        record.descriptor = row.descriptor;
        record.sources.clear();
      }
      tokens.set(row.token, record.target);
      records.set(row.token, record);
    }
    const resolve = (token2) => {
      const target = tokens.get(token2);
      if (target === void 0)
        throw new RenderPublicationError({ reason: "shape", subject: "missing target descriptor" });
      return target;
    };
    const sources = /* @__PURE__ */ new Map();
    for (const row of packet.targetSources) {
      const record = records.get(row.target);
      if (record === void 0)
        throw new RenderPublicationError({ reason: "shape", subject: "missing material target" });
      const key = JSON.stringify(row.options);
      let source = record.sources.get(key);
      if (source === void 0) {
        const created = this.host.createRenderTargetTextureSource(record.target, row.options);
        if (!created.ok) throw created.error;
        source = created.value;
        record.sources.set(key, source);
      }
      sources.set(row.token, source);
    }
    const camera = (row) => row.target === void 0 ? row : { ...row, target: resolve(row.target) };
    const renderables = input.frame.renderables.map((row) => {
      const materials = row.materials.map((material) => {
        if (material.textureSources === void 0) return material;
        const textureSources = new Map(
          [...material.textureSources].map(([name, token2]) => {
            const source = sources.get(token2);
            if (source === void 0)
              throw new RenderPublicationError({
                reason: "shape",
                subject: "missing material target source"
              });
            return [name, source];
          })
        );
        return { ...material, textureSources };
      });
      const first = row.materials.indexOf(row.material);
      return { ...row, materials, material: materials[Math.max(0, first)] ?? row.material };
    });
    const snapshots = new Map(renderables.map((row) => [row.entityKey, row]));
    return {
      ...input,
      frame: {
        ...input.frame,
        renderables,
        cameras: input.frame.cameras.map(camera),
        auxiliaryCameras: input.frame.auxiliaryCameras.map(camera),
        cubeCameras: input.frame.cubeCameras.map(camera)
      },
      operations: input.operations.map((operation) => {
        if (operation.kind === "remove" || operation.snapshot === void 0) return operation;
        const snapshot = snapshots.get(operation.entityKey);
        if (snapshot === void 0)
          throw new RenderPublicationError({
            reason: "shape",
            subject: "missing remapped snapshot"
          });
        return { ...operation, snapshot };
      })
    };
  }
};
var BARREL_DISTORTION_POST_PROCESS_ID = "fullscreen.forgeax.barrel-distortion";
var BARREL_DISTORTION_FEATURE_IDENTITY = BARREL_DISTORTION_POST_PROCESS_ID;
var BARREL_DISTORTION_WGSL_COORDINATE = (
  /* wgsl */
  `
struct BarrelDistortionParams {
  strength : f32,
  centerX : f32,
  centerY : f32,
  radiusSquared : f32,
};

fn barrel_distortion_display_to_scene_uv(
  inputUv : vec2<f32>,
  params : BarrelDistortionParams,
  dimensions : vec2<f32>,
) -> vec2<f32> {
  let aspect = dimensions.x / max(dimensions.y, 1.0);
  let p = vec2<f32>(
    2.0 * aspect * (inputUv.x - params.centerX),
    2.0 * (inputUv.y - params.centerY),
  );
  let t = dot(p, p) / max(params.radiusSquared, 1e-6);
  let scale = (1.0 - params.strength) / (1.0 - params.strength * t);
  return clamp(
    vec2<f32>(
      params.centerX + (inputUv.x - params.centerX) * scale,
      params.centerY + (inputUv.y - params.centerY) * scale,
    ),
    vec2<f32>(0.0),
    vec2<f32>(1.0),
  );
}
`
);
var BARREL_DISTORTION_WGSL = (
  /* wgsl */
  `${BARREL_DISTORTION_WGSL_COORDINATE}
struct FullscreenOutput {
  @builtin(position) position : vec4<f32>,
  @location(0) uv : vec2<f32>,
};

fn fullscreen_triangle(vertex_index : u32) -> FullscreenOutput {
  var x : f32 = -1.0;
  var y : f32 = -1.0;
  if (vertex_index == 1u) { x = 3.0; }
  if (vertex_index == 2u) { y = 3.0; }
  let u : f32 = (x + 1.0) * 0.5;
  let v : f32 = 1.0 - (y + 1.0) * 0.5;
  var out : FullscreenOutput;
  out.position = vec4<f32>(x, y, 0.0, 1.0);
  out.uv = vec2<f32>(u, v);
  return out;
}

@group(1) @binding(0) var sceneColor : texture_2d<f32>;
@group(1) @binding(1) var sceneSampler : sampler;

@group(1) @binding(2) var<uniform> params : BarrelDistortionParams;

@vertex
fn vs_main(@builtin(vertex_index) vertex_index : u32) -> FullscreenOutput {
  return fullscreen_triangle(vertex_index);
}

@fragment
fn fs_main(input : FullscreenOutput) -> @location(0) vec4<f32> {
  let dimensions = vec2<f32>(textureDimensions(sceneColor));
  let sampleUv = barrel_distortion_display_to_scene_uv(input.uv, params, dimensions);
  return textureSampleLevel(sceneColor, sceneSampler, sampleUv, 0.0);
}
`
);
function createBarrelDistortionRenderFeature() {
  return Object.freeze({
    identity: BARREL_DISTORTION_FEATURE_IDENTITY,
    requiredCapabilities: ["rgba16floatRenderable"],
    requiredFullscreenPostProcesses: [
      { identity: BARREL_DISTORTION_POST_PROCESS_ID, source: BARREL_DISTORTION_WGSL }
    ],
    extract: (context) => ok({ active: (context.selectedCamera?.barrelDistortion?.strength ?? 0) > 0 }),
    plan: (data, _context) => ok({
      resources: data.active ? [
        {
          kind: "fullscreen-program",
          name: BARREL_DISTORTION_POST_PROCESS_ID,
          source: BARREL_DISTORTION_WGSL,
          reads: ["ldrColor"],
          params: { byteSize: 16, defaultValue: new Uint8Array(16) }
        },
        {
          kind: "graphics-program",
          name: "barrel-distortion-pipeline",
          program: {
            shader: BARREL_DISTORTION_POST_PROCESS_ID,
            vertexLayout: "none",
            colorFormats: ["rgba16float"],
            sampleCount: 1
          }
        },
        {
          kind: "graphics-bindings",
          name: "barrel-distortion-bindings",
          program: "barrel-distortion-pipeline",
          values: {
            group: 1,
            fullscreen: true,
            shader: BARREL_DISTORTION_POST_PROCESS_ID,
            input: "barrel-input"
          },
          logicalTargets: { input: "barrel-input" }
        }
      ] : [],
      passes: data.active ? [
        {
          kind: "raster",
          name: "barrel-distortion",
          colorAttachments: [
            { target: "barrel-output", loadOp: "clear", storeOp: "store" }
          ],
          sampledTargets: ["barrel-input"],
          draws: [
            {
              program: "barrel-distortion-pipeline",
              bindings: ["barrel-distortion-bindings"],
              vertexData: [],
              vertexLayout: "none",
              draw: { kind: "draw", vertexCount: 3, instanceCount: 1 }
            }
          ]
        }
      ] : []
    })
  });
}
var CLOUD_SHAPE_CELLS = 4;
var CLOUD_WEATHER_CELLS = 2;
var CLOUD_DETAIL_CELLS = CLOUD_SHAPE_CELLS * 3;
var CLOUD_VERTICAL_CELLS = 1;
var CLOUD_VERTICAL_NOISE_CELLS = 2;
var CLOUD_DETAIL_VERTICAL_CELLS = 3;
function saturate(value) {
  return Math.min(1, Math.max(0, value));
}
function smoothstep(edge0, edge1, value) {
  const t = saturate((value - edge0) / Math.max(1e-6, edge1 - edge0));
  return t * t * (3 - 2 * t);
}
function fract(value) {
  return value - Math.floor(value);
}
function wrapInteger(value, period) {
  const wrapped2 = value % period;
  return wrapped2 < 0 ? wrapped2 + period : wrapped2;
}
function hash3(x, y, z, seed) {
  let value = Math.imul(x | 0, 73244475);
  value = Math.imul(value ^ Math.imul(y | 0, 295559667), 73244475);
  value = Math.imul(value ^ Math.imul(z | 0, 214175), 73244475);
  value ^= seed | 0;
  value = Math.imul(value ^ value >>> 16, 73244475);
  value = Math.imul(value ^ value >>> 13, 668265261);
  return ((value ^ value >>> 16) >>> 0) / 4294967296;
}
function valueNoise(x, y, z, seed, periodX = 0, periodY = 0, periodZ = 0) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const uz = fz * fz * (3 - 2 * fz);
  const lattice = (cellX, cellY, cellZ) => hash3(
    periodX > 0 ? wrapInteger(cellX, periodX) : cellX,
    periodY > 0 ? wrapInteger(cellY, periodY) : cellY,
    periodZ > 0 ? wrapInteger(cellZ, periodZ) : cellZ,
    seed
  );
  const c000 = lattice(ix, iy, iz);
  const c100 = lattice(ix + 1, iy, iz);
  const c010 = lattice(ix, iy + 1, iz);
  const c110 = lattice(ix + 1, iy + 1, iz);
  const c001 = lattice(ix, iy, iz + 1);
  const c101 = lattice(ix + 1, iy, iz + 1);
  const c011 = lattice(ix, iy + 1, iz + 1);
  const c111 = lattice(ix + 1, iy + 1, iz + 1);
  const x00 = c000 + (c100 - c000) * ux;
  const x10 = c010 + (c110 - c010) * ux;
  const x01 = c001 + (c101 - c001) * ux;
  const x11 = c011 + (c111 - c011) * ux;
  return x00 + (x10 - x00) * uy + (x01 + (x11 - x01) * uy - (x00 + (x10 - x00) * uy)) * uz;
}
function cellularNoise(x, y, z, seed, periodXZ = CLOUD_DETAIL_CELLS, periodY = 0) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;
  let nearest = Number.POSITIVE_INFINITY;
  for (let dz = -1; dz <= 1; dz += 1) {
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const random = hash3(
          wrapInteger(ix + dx, periodXZ),
          periodY > 0 ? wrapInteger(iy + dy, periodY) : iy + dy,
          wrapInteger(iz + dz, periodXZ),
          seed ^ 2654435769
        );
        const px = dx + fract(random * 17) - fx;
        const py = dy + fract(random * 31) - fy;
        const pz = dz + fract(random * 47) - fz;
        nearest = Math.min(nearest, px * px + py * py + pz * pz);
      }
    }
  }
  return 1 - saturate(Math.sqrt(nearest) * 1.25);
}
function heightEnvelope(height, body, weather) {
  const lowerEdge = 0.05 + (1 - body) * 0.1;
  const crownEdge = Math.min(0.96, 0.6 + body * 0.3 + weather * 0.08);
  return smoothstep(lowerEdge, Math.min(1, lowerEdge + 0.12), height) * (1 - smoothstep(crownEdge, Math.min(1, crownEdge + 0.14), height));
}
function composeCloudDensity(height, formation, coverage) {
  const threshold = 1 - coverage * (0.45 + formation.weather * 0.55);
  const covered = smoothstep(0, 0.4, (formation.body - threshold) / Math.max(1e-3, 1 - threshold));
  const shaped = covered * heightEnvelope(height, formation.body, formation.weather);
  const erosion = (1 - formation.erosion) * 0.18;
  return saturate((shaped - erosion) / (1 - erosion));
}
function formationField(x, y, z, seed, detailRepeat = 1) {
  const macroWarpX = valueNoise(
    x * CLOUD_WEATHER_CELLS,
    y * CLOUD_VERTICAL_NOISE_CELLS + 3,
    z * CLOUD_WEATHER_CELLS,
    seed + 41023,
    CLOUD_WEATHER_CELLS,
    2,
    CLOUD_WEATHER_CELLS
  ) - 0.5;
  const macroWarpZ = valueNoise(
    x * CLOUD_WEATHER_CELLS + 5,
    y * CLOUD_VERTICAL_NOISE_CELLS - 7,
    z * CLOUD_WEATHER_CELLS,
    seed + 41023,
    CLOUD_WEATHER_CELLS,
    2,
    CLOUD_WEATHER_CELLS
  ) - 0.5;
  const bodyX = x + macroWarpX * 0.3;
  const bodyZ = z + macroWarpZ * 0.3;
  let amplitude = 0.5;
  let frequency = 1;
  let sum = 0;
  let weight = 0;
  for (let octave = 0; octave < 4; octave += 1) {
    const tilePeriod = CLOUD_SHAPE_CELLS * frequency;
    sum += valueNoise(
      bodyX * tilePeriod,
      y * frequency * CLOUD_VERTICAL_NOISE_CELLS,
      bodyZ * tilePeriod,
      seed + octave * 1013,
      tilePeriod,
      frequency * CLOUD_VERTICAL_NOISE_CELLS,
      tilePeriod
    ) * amplitude;
    weight += amplitude;
    amplitude *= 0.4;
    frequency *= 2;
  }
  const broad = sum / weight;
  const cells = cellularNoise(
    bodyX * CLOUD_SHAPE_CELLS,
    y * CLOUD_VERTICAL_NOISE_CELLS,
    bodyZ * CLOUD_SHAPE_CELLS,
    seed + 5011,
    CLOUD_SHAPE_CELLS,
    CLOUD_VERTICAL_NOISE_CELLS
  );
  const body = saturate(broad * 0.85 + cells * 0.15 + 0.15);
  const weather = smoothstep(
    0.34,
    0.66,
    valueNoise(
      x * CLOUD_WEATHER_CELLS,
      0.37,
      z * CLOUD_WEATHER_CELLS,
      seed + 17041,
      CLOUD_WEATHER_CELLS,
      1,
      CLOUD_WEATHER_CELLS
    )
  );
  const detailX = x * detailRepeat;
  const detailY = y * detailRepeat;
  const detailZ = z * detailRepeat;
  const warpX = valueNoise(
    detailX * CLOUD_WEATHER_CELLS,
    detailY * 2 + 11,
    detailZ * CLOUD_WEATHER_CELLS,
    seed + 29011,
    CLOUD_WEATHER_CELLS,
    2,
    CLOUD_WEATHER_CELLS
  ) - 0.5;
  const warpZ = valueNoise(
    detailX * CLOUD_WEATHER_CELLS + 7,
    detailY * 2 - 5,
    detailZ * CLOUD_WEATHER_CELLS,
    seed + 29011,
    CLOUD_WEATHER_CELLS,
    2,
    CLOUD_WEATHER_CELLS
  ) - 0.5;
  const erosion = cellularNoise(
    (detailX + warpX * 0.22) * CLOUD_DETAIL_CELLS,
    detailY * CLOUD_DETAIL_VERTICAL_CELLS,
    (detailZ + warpZ * 0.22) * CLOUD_DETAIL_CELLS,
    seed + 7919,
    CLOUD_DETAIL_CELLS,
    CLOUD_DETAIL_VERTICAL_CELLS
  );
  const noise = body;
  return { weather, body, erosion, noise };
}
function evaluateCloudFormation(params, position, timeSeconds = 0) {
  const windX = (params.wind[0] ?? 0) * timeSeconds;
  const windY = (params.wind[1] ?? 0) * timeSeconds;
  const windZ = (params.wind[2] ?? 0) * timeSeconds;
  const relativeHeight = ((position[1] ?? 0) - params.baseHeight) / Math.max(1e-6, params.thickness);
  const advectedHeight = relativeHeight + windY * params.scale / Math.max(1e-6, CLOUD_VERTICAL_CELLS);
  return formationField(
    ((position[0] ?? 0) + windX) * params.scale,
    fract(advectedHeight) * CLOUD_VERTICAL_CELLS,
    ((position[2] ?? 0) + windZ) * params.scale,
    params.seed
  );
}
function evaluateCloudDensity(params, position, timeSeconds = 0) {
  const relativeHeight = ((position[1] ?? 0) - params.baseHeight) / Math.max(1e-6, params.thickness);
  if (relativeHeight <= 0 || relativeHeight >= 1 || params.density <= 0 || params.coverage <= 0) {
    return { density: 0, heightFraction: saturate(relativeHeight), noise: 0 };
  }
  const windX = (params.wind[0] ?? 0) * timeSeconds;
  const windY = (params.wind[1] ?? 0) * timeSeconds;
  const windZ = (params.wind[2] ?? 0) * timeSeconds;
  const x = ((position[0] ?? 0) + windX) * params.scale;
  const advectedHeight = relativeHeight + windY * params.scale / Math.max(1e-6, CLOUD_VERTICAL_CELLS);
  const y = fract(advectedHeight) * CLOUD_VERTICAL_CELLS;
  const z = ((position[2] ?? 0) + windZ) * params.scale;
  const formation = formationField(x, y, z, params.seed, 3);
  const noise = formation.noise;
  return {
    density: composeCloudDensity(relativeHeight, formation, params.coverage) * params.density,
    heightFraction: relativeHeight,
    noise,
    weather: formation.weather,
    body: formation.body,
    erosion: formation.erosion
  };
}
function cacheIndex(resolution, x, y, z) {
  return z * resolution * resolution + y * resolution + x;
}
function digestBytes(data) {
  let hash = 2166136261;
  for (const byte of data) {
    hash ^= byte;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
function buildCloudDensityCache(params, profile = CLOUD_QUALITY_PROFILES[params.quality]) {
  const resolution = Math.max(4, Math.floor(profile.cacheResolution));
  const data = new Uint8Array(resolution * resolution * resolution);
  const formationData = new Uint8Array(data.byteLength * 3);
  const position = [0, 0, 0];
  for (let z = 0; z < resolution; z += 1) {
    for (let y = 0; y < resolution; y += 1) {
      position[1] = params.baseHeight + (y + 0.5) / resolution * params.thickness;
      for (let x = 0; x < resolution; x += 1) {
        position[0] = (x + 0.5) / resolution / params.scale;
        position[2] = (z + 0.5) / resolution / params.scale;
        const index = cacheIndex(resolution, x, y, z);
        const formation = evaluateCloudFormation(params, position, 0);
        formationData[index] = Math.round(saturate(formation.weather) * 255);
        formationData[data.byteLength + index] = Math.round(saturate(formation.body) * 255);
        formationData[data.byteLength * 2 + index] = Math.round(saturate(formation.erosion) * 255);
      }
    }
  }
  const cache = {
    sourceKey: cloudLayerFormationKey(params),
    resolution,
    data,
    formationData,
    formationByteLength: formationData.byteLength,
    byteLength: formationData.byteLength,
    digest: digestBytes(formationData)
  };
  for (let z = 0; z < resolution; z++) {
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        position[0] = (x + 0.5) / resolution / params.scale;
        position[1] = params.baseHeight + (y + 0.5) / resolution * params.thickness;
        position[2] = (z + 0.5) / resolution / params.scale;
        data[cacheIndex(resolution, x, y, z)] = Math.round(
          saturate(sampleCloudDensity(cache, params, position)) * 255
        );
      }
    }
  }
  return Object.freeze(cache);
}
function snapshotCloudDensityCache(cache) {
  return Object.freeze({
    sourceKey: cache.sourceKey,
    resolution: cache.resolution,
    data: new Uint8Array(cache.data),
    formationData: new Uint8Array(cache.formationData),
    digest: cache.digest
  });
}
function reconstructCloudDensityCache(params, snapshot) {
  const expectedKey = cloudLayerFormationKey(params);
  if (snapshot.sourceKey !== expectedKey) {
    return err(new CloudLayerCacheInvalidError(snapshot.sourceKey, "source key mismatch"));
  }
  if (!Number.isInteger(snapshot.resolution) || snapshot.resolution < 4 || snapshot.resolution > 256 || snapshot.data.byteLength !== snapshot.resolution ** 3 || snapshot.formationData !== void 0 && snapshot.formationData.byteLength !== snapshot.resolution ** 3 * 3) {
    return err(
      new CloudLayerCacheInvalidError(snapshot.sourceKey, "resolution and payload length mismatch")
    );
  }
  const formationData = snapshot.formationData === void 0 ? new Uint8Array(snapshot.data.length * 3).fill(0) : new Uint8Array(snapshot.formationData);
  const digest = digestBytes(formationData);
  if (digest !== snapshot.digest) {
    return err(new CloudLayerCacheInvalidError(snapshot.sourceKey, "payload digest mismatch"));
  }
  const data = new Uint8Array(snapshot.data);
  return ok(
    Object.freeze({
      sourceKey: snapshot.sourceKey,
      resolution: snapshot.resolution,
      data,
      formationData,
      formationByteLength: formationData.byteLength,
      byteLength: formationData.byteLength,
      digest
    })
  );
}
function wrapped(value, resolution) {
  const result = value - Math.floor(value);
  return Math.min(resolution - 1e-6, Math.max(0, result * resolution));
}
function sampleCloudDensity(cache, params, position, timeSeconds = 0) {
  const height = ((position[1] ?? 0) - params.baseHeight) / Math.max(1e-6, params.thickness);
  if (height <= 0 || height >= 1 || params.coverage <= 0 || params.density <= 0) return 0;
  const period = 1 / Math.max(1e-6, params.scale);
  const x = wrapped(
    ((position[0] ?? 0) + (params.wind[0] ?? 0) * timeSeconds) / period - 0.5 / cache.resolution,
    cache.resolution
  );
  const z = wrapped(
    ((position[2] ?? 0) + (params.wind[2] ?? 0) * timeSeconds) / period - 0.5 / cache.resolution,
    cache.resolution
  );
  const advectedHeight = height + (params.wind[1] ?? 0) * timeSeconds * params.scale / Math.max(1e-6, CLOUD_VERTICAL_CELLS);
  const y = wrapped(advectedHeight - 0.5 / cache.resolution, cache.resolution);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const z0 = Math.floor(z);
  const x1 = (x0 + 1) % cache.resolution;
  const y1 = (y0 + 1) % cache.resolution;
  const z1 = (z0 + 1) % cache.resolution;
  const fx = x - x0;
  const fy = y - y0;
  const fz = z - z0;
  const stride = cache.resolution ** 3;
  if (cache.formationData === void 0 || cache.formationData.byteLength < stride * 3) {
    const sampleLegacy = (sx, sy, sz) => (cache.data[cacheIndex(cache.resolution, sx, sy, sz)] ?? 0) / 255;
    const c00 = sampleLegacy(x0, y0, z0) + (sampleLegacy(x1, y0, z0) - sampleLegacy(x0, y0, z0)) * fx;
    const c10 = sampleLegacy(x0, y1, z0) + (sampleLegacy(x1, y1, z0) - sampleLegacy(x0, y1, z0)) * fx;
    const c01 = sampleLegacy(x0, y0, z1) + (sampleLegacy(x1, y0, z1) - sampleLegacy(x0, y0, z1)) * fx;
    const c11 = sampleLegacy(x0, y1, z1) + (sampleLegacy(x1, y1, z1) - sampleLegacy(x0, y1, z1)) * fx;
    return (c00 + (c10 - c00) * fy + (c01 + (c11 - c01) * fy - (c00 + (c10 - c00) * fy)) * fz) * heightEnvelope(height, 1, 0.5) * params.density;
  }
  const samplePlane = (plane, sx, sy, sz) => {
    const payload = cache.formationData;
    const offset = plane * stride + cacheIndex(cache.resolution, sx, sy, sz);
    return (payload[offset] ?? 0) / 255;
  };
  const sample = (plane) => {
    const repeat = plane === 2 ? 3 : 1;
    const sx = wrapped(
      (x + 0.5) / cache.resolution * repeat - 0.5 / cache.resolution,
      cache.resolution
    );
    const sy = wrapped(
      (y + 0.5) / cache.resolution * repeat - 0.5 / cache.resolution,
      cache.resolution
    );
    const sz = wrapped(
      (z + 0.5) / cache.resolution * repeat - 0.5 / cache.resolution,
      cache.resolution
    );
    const x02 = Math.floor(sx), y02 = Math.floor(sy), z02 = Math.floor(sz);
    const x12 = (x02 + 1) % cache.resolution, y12 = (y02 + 1) % cache.resolution, z12 = (z02 + 1) % cache.resolution;
    const fx2 = sx - x02, fy2 = sy - y02, fz2 = sz - z02;
    const c00 = samplePlane(plane, x02, y02, z02) + (samplePlane(plane, x12, y02, z02) - samplePlane(plane, x02, y02, z02)) * fx2;
    const c10 = samplePlane(plane, x02, y12, z02) + (samplePlane(plane, x12, y12, z02) - samplePlane(plane, x02, y12, z02)) * fx2;
    const c01 = samplePlane(plane, x02, y02, z12) + (samplePlane(plane, x12, y02, z12) - samplePlane(plane, x02, y02, z12)) * fx2;
    const c11 = samplePlane(plane, x02, y12, z12) + (samplePlane(plane, x12, y12, z12) - samplePlane(plane, x02, y12, z12)) * fx2;
    return c00 + (c10 - c00) * fy2 + (c01 + (c11 - c01) * fy2 - (c00 + (c10 - c00) * fy2)) * fz2;
  };
  const weather = sample(0);
  const body = sample(1);
  const erosion = sample(2);
  return composeCloudDensity(height, { weather, body, erosion}, params.coverage) * params.density;
}

// src/cloud/inspection.ts
function resourceStage(input) {
  if (!input.authored || input.generation === void 0) return "none";
  if (input.candidateGeneration !== void 0) return "candidate";
  if (input.degraded === true || input.lkgGeneration !== void 0) return "lkg";
  return "accepted";
}
function inspectCloudLayer(input) {
  const capability = {
    compute: input.capability?.compute ?? false,
    storageBuffer: input.capability?.storageBuffer ?? false,
    rgba16floatRenderable: input.capability?.rgba16floatRenderable ?? false,
    physicalGpu: input.capability?.physicalGpu ?? "unknown",
    timestampQuery: input.capability?.timestampQuery ?? false
  };
  const budget = {
    measured: input.budget?.measured ?? false,
    physicalGpu: input.budget?.physicalGpu ?? capability.physicalGpu,
    gpuTimestamp: input.budget?.gpuTimestamp ?? capability.timestampQuery,
    quality: input.budget?.quality,
    warmupFrames: input.budget?.warmupFrames ?? 0,
    sampleFrames: input.budget?.sampleFrames ?? 0,
    p50GpuMs: input.budget?.p50GpuMs,
    p95GpuMs: input.budget?.p95GpuMs,
    coldGenerationMs: input.budget?.coldGenerationMs,
    frameBudgetMs: input.budget?.frameBudgetMs,
    ...input.budget?.reason === void 0 ? {} : { reason: input.budget.reason }
  };
  const available = capability.compute && capability.storageBuffer && capability.rgba16floatRenderable;
  return Object.freeze({
    status: !input.authored ? "off" : !available ? "unavailable" : input.degraded === true ? "degraded" : "available",
    resourceStage: resourceStage(input),
    sourceKey: input.sourceKey,
    generation: input.generation,
    candidateGeneration: input.candidateGeneration,
    lkgGeneration: input.lkgGeneration,
    shadowRevision: input.shadowRevision,
    temporalResets: input.temporalResets ?? 0,
    lastTemporalReset: input.lastTemporalReset,
    resourceFacts: input.resourceFacts,
    capability,
    budget
  });
}
function cloudCapabilitiesFromRhi(caps) {
  return Object.freeze({
    compute: caps.compute === true,
    storageBuffer: caps.storageBuffer === true,
    rgba16floatRenderable: caps.rgba16floatRenderable === true,
    // RHI caps intentionally do not claim a physical adapter. A browser or
    // Dawn receipt must promote this fact to available/unavailable.
    physicalGpu: "unknown",
    timestampQuery: caps.timestampQuery === true
  });
}

// src/cloud/resources.ts
var CLOUD_RGBA16FLOAT_BYTES_PER_TEXEL = 8;
var CLOUD_HISTORY_SURFACE_COUNT = 6;
function inspectCloudLayerResources(input) {
  const cacheBytes = input.cache?.byteLength ?? 0;
  const shadowResolution = input.shadow?.resolution ?? 0;
  const declaredShadowBytes = shadowResolution * shadowResolution * CLOUD_RGBA16FLOAT_BYTES_PER_TEXEL;
  const historyWidth = input.history?.width ?? 0;
  const historyHeight = input.history?.height ?? 0;
  const declaredHistoryBytes = historyWidth * historyHeight * CLOUD_HISTORY_SURFACE_COUNT * CLOUD_RGBA16FLOAT_BYTES_PER_TEXEL;
  const shadowBytes = input.shadowBytes ?? 0;
  const historyBytes = input.historyBytes ?? 0;
  const inFlightBytes = Math.max(0, input.inFlightBytes ?? 0);
  const residentBytes = cacheBytes + shadowBytes + historyBytes;
  const measuredGpuResourceCount = Number(input.shadowBytes !== void 0) + Number(input.historyBytes !== void 0);
  const gpuEvidence = measuredGpuResourceCount > 0 || input.inFlightBytes !== void 0 ? "measured" : input.shadow !== void 0 || input.history !== void 0 ? "declared" : "unavailable";
  const resourceCount = Number(input.cache !== void 0) + Number(input.shadow !== void 0) + Number(input.history !== void 0);
  return Object.freeze({
    generation: input.generation,
    cacheBytes,
    shadowBytes,
    historyBytes,
    inFlightBytes,
    residentBytes,
    resourceCount,
    gpuEvidence,
    declaredShadowBytes,
    declaredHistoryBytes,
    declaredResidentBytes: cacheBytes + declaredShadowBytes + declaredHistoryBytes,
    declaredResourceCount: resourceCount,
    measuredGpuResourceCount,
    cacheResolution: input.cache?.resolution ?? 0,
    shadowResolution
  });
}
function acceptCloudLayerGeneration(candidate, previous) {
  return Object.freeze({
    active: Object.freeze({ ...candidate, status: "active" }),
    lkg: previous === void 0 ? void 0 : Object.freeze({ ...previous, status: "lkg" })
  });
}
function retainCloudLayerAfterFailure(active, candidate) {
  return Object.freeze({
    active,
    retiring: Object.freeze({ ...candidate, status: "retiring" })
  });
}

// src/cloud/optics.ts
var EMPTY_SCATTERING = [0, 0, 0];
function normalize(vector) {
  const x = vector[0] ?? 0;
  const y = vector[1] ?? 0;
  const z = vector[2] ?? 0;
  const length = Math.hypot(x, y, z);
  return length <= 1e-8 ? [0, 1, 0] : [x / length, y / length, z / length];
}
function rayBoxInterval(ray, params) {
  const min = [Number.NEGATIVE_INFINITY, params.baseHeight, Number.NEGATIVE_INFINITY];
  const max = [
    Number.POSITIVE_INFINITY,
    params.baseHeight + params.thickness,
    Number.POSITIVE_INFINITY
  ];
  let start = 0;
  let end = Math.max(0, ray.maxDistance);
  for (let axis = 0; axis < 3; axis += 1) {
    const origin = ray.origin[axis] ?? 0;
    const direction = ray.direction[axis] ?? 0;
    const lower = min[axis] ?? 0;
    const upper = max[axis] ?? 0;
    if (Math.abs(direction) < 1e-8) {
      if (origin < lower || origin > upper) return void 0;
      continue;
    }
    const a = (lower - origin) / direction;
    const b = (upper - origin) / direction;
    start = Math.max(start, Math.min(a, b));
    end = Math.min(end, Math.max(a, b));
    if (end <= start) return void 0;
  }
  return end > start ? { start, end } : void 0;
}
function intersectCloudLayer(ray, params) {
  return rayBoxInterval(ray, params);
}
function phaseFunction(cosTheta, g) {
  const boundedG = Math.max(-0.95, Math.min(0.95, g));
  const denominator = Math.max(1e-4, 1 + boundedG * boundedG - 2 * boundedG * cosTheta);
  return (1 - boundedG * boundedG) / denominator ** 1.5 * (1 / (4 * Math.PI));
}
function cloudPhase(cosTheta, forwardG) {
  return phaseFunction(cosTheta, forwardG) * 0.8 + phaseFunction(cosTheta, -0.2) * 0.2;
}
function smoothstep2(edge0, edge1, value) {
  const t = Math.max(0, Math.min(1, (value - edge0) / Math.max(1e-6, edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
function cloudIncidentLight(solarT, cosTheta, height, forwardG = 0.55) {
  const direct = solarT * cloudPhase(cosTheta, forwardG);
  const multiple = (0.5 * Math.sqrt(solarT) + 0.25 * solarT ** 0.25) / (4 * Math.PI);
  const energy = (direct + multiple) * (4 * Math.PI);
  const skyFill = 0.025 + 0.05 * smoothstep2(0.1, 0.85, height);
  return [energy + 0.72 * skyFill, energy + 0.84 * skyFill, energy + skyFill];
}
function densityAt(input, position) {
  return input.cache === void 0 ? evaluateCloudDensity(input.params, position, input.timeSeconds ?? 0).density : sampleCloudDensity(input.cache, input.params, position, input.timeSeconds ?? 0);
}
function integrateCloudPath(input) {
  const direction = normalize(input.ray.direction);
  const interval = rayBoxInterval({ ...input.ray, direction }, input.params);
  if (interval === void 0 || input.params.density <= 0) {
    return {
      path: input.path,
      transmittance: 1,
      scattering: EMPTY_SCATTERING,
      opticalDepth: 0,
      representativeDepth: input.ray.maxDistance,
      steps: 0,
      entered: false,
      exited: false
    };
  }
  const steps = Math.max(1, Math.floor(input.steps ?? 32));
  const length = interval.end - interval.start;
  const stepLength = length / steps;
  let opticalDepth = 0;
  const scattering = [0, 0, 0];
  let weightedDepth = 0;
  let scatteringWeight = 0;
  const lighting = input.lighting;
  const lightDirection = lighting === void 0 ? void 0 : normalize(lighting.sunDirection);
  const viewDirection = normalize(input.ray.direction);
  for (let index = 0; index < steps; index += 1) {
    const distance = interval.start + (index + 0.5) * stepLength;
    const position = [
      (input.ray.origin[0] ?? 0) + direction[0] * distance,
      (input.ray.origin[1] ?? 0) + direction[1] * distance,
      (input.ray.origin[2] ?? 0) + direction[2] * distance
    ];
    const localDensity = Math.max(0, densityAt(input, position));
    const extinction = localDensity * CLOUD_EXTINCTION_COEFFICIENT * stepLength;
    const transmittanceBefore = Math.exp(-opticalDepth);
    opticalDepth += extinction;
    if (lighting !== void 0 && lightDirection !== void 0 && localDensity > 0) {
      const localShadow = integrateCloudPath({
        params: input.params,
        path: "solar-column",
        ray: {
          origin: position,
          direction: lightDirection,
          maxDistance: input.params.shadowRange
        },
        steps: Math.max(4, Math.ceil((input.steps ?? 32) * 0.5)),
        ...input.timeSeconds === void 0 ? {} : { timeSeconds: input.timeSeconds },
        ...input.cache === void 0 ? {} : { cache: input.cache }
      });
      const cosTheta = viewDirection[0] * lightDirection[0] + viewDirection[1] * lightDirection[1] + viewDirection[2] * lightDirection[2];
      const segmentWeight = transmittanceBefore * (1 - Math.exp(-extinction));
      const heightFraction = Math.max(
        0,
        Math.min(1, ((position[1] ?? 0) - input.params.baseHeight) / input.params.thickness)
      );
      const incident = cloudIncidentLight(
        localShadow.transmittance,
        cosTheta,
        heightFraction,
        lighting.phaseG
      );
      for (let channel = 0; channel < 3; channel++) {
        scattering[channel] = (scattering[channel] ?? 0) + (lighting.sunRadiance[channel] ?? 0) * (incident[channel] ?? 0) * segmentWeight;
      }
      const weight = segmentWeight;
      scatteringWeight += weight;
      weightedDepth += distance * weight;
    }
  }
  const transmittance = Math.exp(-opticalDepth);
  return {
    path: input.path,
    transmittance,
    scattering,
    opticalDepth,
    representativeDepth: scatteringWeight > 1e-6 ? weightedDepth / scatteringWeight : interval.start,
    steps,
    entered: true,
    exited: interval.end < input.ray.maxDistance
  };
}
function integrateCloudCameraPath(params, ray, options = {}) {
  return integrateCloudPath({ ...options, params, ray, path: "camera" });
}
function integrateCloudSolarColumn(params, origin, sunDirection, options = {}) {
  return integrateCloudPath({
    ...options,
    params,
    path: "solar-column",
    ray: {
      origin,
      direction: sunDirection,
      maxDistance: options.maxDistance ?? params.shadowRange
    }
  });
}
function integrateCloudInterior(params, ray, lighting, options = {}) {
  return integrateCloudPath({ ...options, params, ray, path: "cloud-interior", lighting });
}
function applyCloudSolarTransmittance(directSunRadiance, cloudTransmittance, meshVisibility = 1) {
  const factor = Math.min(1, Math.max(0, cloudTransmittance)) * Math.min(1, Math.max(0, meshVisibility));
  return [
    (directSunRadiance[0] ?? 0) * factor,
    (directSunRadiance[1] ?? 0) * factor,
    (directSunRadiance[2] ?? 0) * factor
  ];
}
function compositeCloudRadiance(sceneLinearHdr, cloud, sceneDepth, cloudDepth = cloud.representativeDepth) {
  if (!Number.isFinite(sceneDepth) || cloudDepth > sceneDepth) return sceneLinearHdr;
  const transmittance = Math.min(1, Math.max(0, cloud.transmittance));
  return [
    (sceneLinearHdr[0] ?? 0) * transmittance + (cloud.scattering[0] ?? 0),
    (sceneLinearHdr[1] ?? 0) * transmittance + (cloud.scattering[1] ?? 0),
    (sceneLinearHdr[2] ?? 0) * transmittance + (cloud.scattering[2] ?? 0),
    1
  ];
}

// src/cloud/shadow.ts
function normalize2(vector) {
  const x = vector[0] ?? 0;
  const y = vector[1] ?? 0;
  const z = vector[2] ?? 0;
  const length = Math.hypot(x, y, z);
  return length <= 1e-8 ? [0, 1, 0] : [x / length, y / length, z / length];
}
function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function dot(a, b) {
  return (a[0] ?? 0) * (b[0] ?? 0) + (a[1] ?? 0) * (b[1] ?? 0) + (a[2] ?? 0) * (b[2] ?? 0);
}
function stableRevision(input) {
  let hash = 2166136261;
  const values = [...input.center, ...input.sunDirection, input.range, input.resolution];
  for (const value of values) {
    const bits = new Float32Array([value]);
    const bytes = new Uint8Array(bits.buffer);
    for (const byte of bytes) hash = Math.imul(hash ^ byte, 16777619);
  }
  return hash >>> 0;
}
function createCloudShadowProjection(input) {
  const sunDirection = normalize2(input.sunDirection);
  const resolution = Math.max(16, Math.floor(input.resolution ?? 1024));
  const range = Math.max(1, input.range);
  const texelSize = range / resolution;
  const reference = Math.abs(sunDirection[1]) < 0.95 ? [0, 1, 0] : [1, 0, 0];
  const right = normalize2(cross(reference, sunDirection));
  const up = normalize2(cross(sunDirection, right));
  const center = input.center;
  const lightX = dot(center, right);
  const lightY = dot(center, up);
  const lightZ = dot(center, sunDirection);
  const snappedX = Math.floor(lightX / texelSize + 0.5) * texelSize;
  const snappedY = Math.floor(lightY / texelSize + 0.5) * texelSize;
  const origin = [
    right[0] * snappedX + up[0] * snappedY + sunDirection[0] * lightZ,
    right[1] * snappedX + up[1] * snappedY + sunDirection[1] * lightZ,
    right[2] * snappedX + up[2] * snappedY + sunDirection[2] * lightZ
  ];
  return Object.freeze({
    revision: stableRevision({ center, sunDirection, range, resolution }),
    resolution,
    range,
    texelSize,
    center: Object.freeze([...center]),
    origin: Object.freeze(origin),
    right,
    up,
    sunDirection,
    lowSun: sunDirection[1] <= 0.08
  });
}
function projectCloudShadowUv(projection, position) {
  const relative = [
    position[0] - projection.origin[0],
    position[1] - projection.origin[1],
    position[2] - projection.origin[2]
  ];
  const x = dot(relative, projection.right);
  const y = dot(relative, projection.up);
  const uv = [0.5 + x / projection.range, 0.5 + y / projection.range];
  return { uv, inRange: uv[0] >= 0 && uv[0] <= 1 && uv[1] >= 0 && uv[1] <= 1 };
}
function sampleCloudShadow(params, projection, worldPosition, options = {}) {
  const projected = projectCloudShadowUv(projection, worldPosition);
  if (projection.lowSun) {
    return {
      transmittance: 1,
      uv: projected.uv,
      valid: false,
      fallback: "low-sun",
      revision: projection.revision
    };
  }
  if (!projected.inRange) {
    return {
      transmittance: 1,
      uv: projected.uv,
      valid: false,
      fallback: "outside-range",
      revision: projection.revision
    };
  }
  if (params.coverage >= 1 || params.density <= 0) {
    return {
      transmittance: 1,
      uv: projected.uv,
      valid: false,
      fallback: "empty-coverage",
      revision: projection.revision
    };
  }
  const integrated = integrateCloudSolarColumn(params, worldPosition, projection.sunDirection, {
    steps: 20,
    maxDistance: projection.range,
    ...options.cache === void 0 ? {} : { cache: options.cache },
    ...options.timeSeconds === void 0 ? {} : { timeSeconds: options.timeSeconds }
  });
  return {
    transmittance: integrated.transmittance,
    uv: projected.uv,
    valid: integrated.entered,
    fallback: "none",
    revision: projection.revision
  };
}

// src/cloud/temporal.ts
function cloudTemporalSignature(input) {
  return [
    "cloud-temporal-v1",
    input.viewId,
    input.sourceKey,
    input.authoringGeneration,
    input.cloudShadowRevision,
    input.cameraRevision,
    input.deviceGeneration,
    input.width,
    input.height,
    input.timeSeconds,
    input.quality,
    input.sceneDepthVersion ?? 0
  ].join(":");
}
function sameLayout(left, right) {
  return left.viewId === right.viewId && left.width === right.width && left.height === right.height;
}
function cloudTemporalResetReasons(previous, next, options = {}) {
  if (previous === void 0) return ["history-missing"];
  const reasons = [];
  if (previous.sourceKey !== next.sourceKey || previous.authoringGeneration !== next.authoringGeneration) {
    reasons.push("authoring-generation");
  }
  if (previous.cloudShadowRevision !== next.cloudShadowRevision)
    reasons.push("cloud-shadow-revision");
  if (previous.deviceGeneration !== next.deviceGeneration) reasons.push("device-generation");
  if (previous.sceneDepthVersion !== void 0 && next.sceneDepthVersion !== void 0 && previous.sceneDepthVersion !== next.sceneDepthVersion) {
    reasons.push("scene-depth-disocclusion");
  }
  if (!sameLayout(previous, next)) reasons.push("resize");
  if (options.cameraCut === true || previous.cameraRevision !== next.cameraRevision)
    reasons.push("camera-cut");
  const dt = next.timeSeconds - previous.timeSeconds;
  if (!Number.isFinite(dt) || dt < 0 || dt > 0.5) reasons.push("time-discontinuity");
  if (options.recovery === true) reasons.push("recovery");
  return Object.freeze(reasons);
}
function createCloudHistory(signature, generation, valid = false) {
  return Object.freeze({
    width: Math.max(1, Math.floor(signature.width)),
    height: Math.max(1, Math.floor(signature.height)),
    signature: cloudTemporalSignature(signature),
    temporal: Object.freeze({ ...signature }),
    generation,
    valid
  });
}
var CloudHistoryStore = class {
  maxViews;
  entries = /* @__PURE__ */ new Map();
  constructor(maxViews = 4) {
    this.maxViews = Math.max(1, Math.floor(maxViews));
  }
  begin(signature, options = {}) {
    const key = signature.viewId;
    const previousEntry = this.entries.get(key);
    const previous = previousEntry?.history;
    const reasons = cloudTemporalResetReasons(previousEntry?.signature, signature, options);
    const reset = reasons.length > 0;
    return Object.freeze({
      reset,
      reasons,
      signature: cloudTemporalSignature(signature),
      history: reset ? void 0 : previous
    });
  }
  commit(signature, history) {
    if (history.width !== Math.max(1, Math.floor(signature.width)) || history.height !== Math.max(1, Math.floor(signature.height))) {
      this.entries.delete(signature.viewId);
      return;
    }
    this.entries.set(signature.viewId, { history, signature: Object.freeze({ ...signature }) });
    while (this.entries.size > this.maxViews) {
      const oldest = this.entries.keys().next().value;
      if (oldest === void 0) break;
      this.entries.delete(oldest);
    }
  }
  reset(viewId) {
    if (viewId === void 0) this.entries.clear();
    else this.entries.delete(viewId);
  }
  get(viewId) {
    return this.entries.get(viewId)?.history;
  }
  dispose() {
    this.entries.clear();
  }
};
function reprojectCloudHistory(input, historyWeight = 0.9) {
  const width = Math.max(1, input.historySize[0] ?? 1);
  const height = Math.max(1, input.historySize[1] ?? 1);
  const uv = [
    ((input.currentPixel[0] ?? 0) - (input.motion[0] ?? 0)) / width,
    ((input.currentPixel[1] ?? 0) - (input.motion[1] ?? 0)) / height
  ];
  if (uv[0] < 0 || uv[0] > 1 || uv[1] < 0 || uv[1] > 1) {
    return { accepted: false, historyUv: uv, weight: 0, reason: "outside" };
  }
  const depthTolerance = input.depthTolerance ?? Math.max(0.01, Math.abs(input.currentDepth) * 0.02);
  if (!Number.isFinite(input.currentDepth) || !Number.isFinite(input.historyDepth) || Math.abs(input.currentDepth - input.historyDepth) > depthTolerance) {
    return { accepted: false, historyUv: uv, weight: 0, reason: "depth-disocclusion" };
  }
  return {
    accepted: true,
    historyUv: uv,
    weight: Math.min(0.99, Math.max(0, historyWeight)),
    reason: "accepted"
  };
}
var CLOUD_LAYER_FEATURE_IDENTITY = "forgeax.cloud-layer";
var CLOUD_LAYER_DENSITY_PROGRAM = "cloud-layer-density";
var CLOUD_LAYER_DENSITY_BINDINGS = "cloud-layer-density-bindings";
var CLOUD_LAYER_DENSITY_CACHE = "cloud-layer-density-cache";
var CLOUD_LAYER_DENSITY_OUTPUT = "cloud-layer-density-output";
var COMPUTE_STAGE = 4;
var CLOUD_WORKGROUP_SIZE = 64;
var CLOUD_VIEW_PARAMS_BYTES = 176;
function packCloudDensityCache(cache) {
  const packed = new Uint32Array(Math.max(1, Math.ceil(cache.formationData.byteLength / 4)));
  for (let index = 0; index < cache.formationData.byteLength; index += 1) {
    const wordIndex = index >>> 2;
    packed[wordIndex] = (packed[wordIndex] ?? 0) | (cache.formationData[index] ?? 0) << (index & 3) * 8;
  }
  return packed;
}
var CLOUD_DENSITY_COMPUTE_WGSL = (
  /* wgsl */
  `
struct CloudCacheParams { count: u32, }
@group(0) @binding(0) var<storage, read> sourceDensity: array<u32>;
@group(0) @binding(1) var<storage, read_write> cachedDensity: array<u32>;
@group(0) @binding(2) var<uniform> params: CloudCacheParams;
@compute @workgroup_size(64)
fn cloud_density_cache(@builtin(global_invocation_id) id: vec3<u32>) {
  if (id.x >= params.count) { return; }
  cachedDensity[id.x] = sourceDensity[id.x];
}
`
);
var CLOUD_VIEW_FULLSCREEN_WGSL = (
  /* wgsl */
  `
const CLOUD_VERTICAL_CELLS: f32 = ${CLOUD_VERTICAL_CELLS};
const CLOUD_VERTICAL_NOISE_CELLS: f32 = 2.0;

struct CloudCameraView {
  worldViewProj: mat4x4<f32>,
  lightDir: vec3<f32>,
  lightColor: vec3<f32>,
  cameraPos: vec3<f32>,
  lightViewProj_A: mat4x4<f32>,
  inverseViewProj: mat4x4<f32>,
  lightViewProj_B: mat4x4<f32>,
  lightViewProj_C: mat4x4<f32>,
  lightViewProj_D: mat4x4<f32>,
  splitPlanes: array<vec4<f32>, 4>,
  cascadeCount: f32,
  cascadeBlend: f32,
  depthBias: f32,
  normalBias: f32,
  directionalShadowFilter: vec4<f32>,
  spotLightViewProj: array<mat4x4<f32>, 4>,
  temporalCurrentViewProj: mat4x4<f32>,
  temporalPreviousViewProj: mat4x4<f32>,
  temporalProjection: vec4<f32>,
  temporalPreviousCameraPos: vec4<f32>,
  ssrParams: vec4<f32>,
};

struct CloudViewParams {
  layer: vec4<f32>,       // baseHeight, thickness, scale, density
  field: vec4<f32>,       // coverage, timeSeconds, maxDistance, seed
  wind: vec4<f32>,        // xyz m/s
  sunDirection: vec4<f32>,
  sunRadiance: vec4<f32>,
  integration: vec4<u32>, // cacheResolution, viewSteps, solarSteps, reserved
  shadowOrigin: vec4<f32>,
  shadowRight: vec4<f32>,
  shadowUp: vec4<f32>,
  shadowProjection: vec4<f32>, // range, valid, lowSun, texelSize
  temporal: vec4<f32>,          // valid, reset, historyWeight, reserved
};

@group(0) @binding(0) var<uniform> view: CloudCameraView;
@group(1) @binding(0) var sceneColor: texture_2d<f32>;
@group(1) @binding(1) var sceneSampler: sampler;
@group(1) @binding(2) var<uniform> cloud: CloudViewParams;
@group(1) @binding(3) var sceneDepth: texture_depth_2d;
@group(1) @binding(4) var depthSampler: sampler;
@group(1) @binding(5) var previousRadiance: texture_2d<f32>;
@group(1) @binding(6) var previousTransmittance: texture_2d<f32>;
@group(1) @binding(7) var previousDepth: texture_2d<f32>;
@group(1) @binding(8) var<storage, read> densityCache: array<u32>;

struct CloudViewOut {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

fn cloud_hash3(cell: vec3<i32>, seed: u32) -> f32 {
  var h = bitcast<u32>(cell.x) * 0x45d9f3bu;
  h = (h ^ (bitcast<u32>(cell.y) * 0x119de1f3u)) * 0x45d9f3bu;
  h = (h ^ (bitcast<u32>(cell.z) * 0x3449fu)) * 0x45d9f3bu;
  h = h ^ seed;
  h = (h ^ (h >> 16u)) * 0x45d9f3bu;
  h = (h ^ (h >> 13u)) * 0x27d4eb2du;
  return f32(h ^ (h >> 16u)) / 4294967296.0;
}

fn cloud_wrap_cell(value: i32, period: i32) -> i32 {
  let wrapped = value % period;
  return select(wrapped, wrapped + period, wrapped < 0);
}

fn cloud_hash3_periodic(
  cell: vec3<i32>,
  seed: u32,
  periodX: i32,
  periodY: i32,
  periodZ: i32,
) -> f32 {
  return cloud_hash3(
    vec3<i32>(
      cloud_wrap_cell(cell.x, periodX),
      cloud_wrap_cell(cell.y, periodY),
      cloud_wrap_cell(cell.z, periodZ),
    ),
    seed,
  );
}

fn cloud_value_noise(
  position: vec3<f32>,
  seed: u32,
  periodX: i32,
  periodY: i32,
  periodZ: i32,
) -> f32 {
  let cell = vec3<i32>(floor(position));
  let fraction = fract(position);
  let smoothFraction = fraction * fraction * (3.0 - 2.0 * fraction);
  let c000 = cloud_hash3_periodic(cell + vec3<i32>(0, 0, 0), seed, periodX, periodY, periodZ);
  let c100 = cloud_hash3_periodic(cell + vec3<i32>(1, 0, 0), seed, periodX, periodY, periodZ);
  let c010 = cloud_hash3_periodic(cell + vec3<i32>(0, 1, 0), seed, periodX, periodY, periodZ);
  let c110 = cloud_hash3_periodic(cell + vec3<i32>(1, 1, 0), seed, periodX, periodY, periodZ);
  let c001 = cloud_hash3_periodic(cell + vec3<i32>(0, 0, 1), seed, periodX, periodY, periodZ);
  let c101 = cloud_hash3_periodic(cell + vec3<i32>(1, 0, 1), seed, periodX, periodY, periodZ);
  let c011 = cloud_hash3_periodic(cell + vec3<i32>(0, 1, 1), seed, periodX, periodY, periodZ);
  let c111 = cloud_hash3_periodic(cell + vec3<i32>(1, 1, 1), seed, periodX, periodY, periodZ);
  let x00 = mix(c000, c100, smoothFraction.x);
  let x10 = mix(c010, c110, smoothFraction.x);
  let x01 = mix(c001, c101, smoothFraction.x);
  let x11 = mix(c011, c111, smoothFraction.x);
  return mix(mix(x00, x10, smoothFraction.y), mix(x01, x11, smoothFraction.y), smoothFraction.z);
}

fn cloud_cellular_noise(position: vec3<f32>, seed: u32, periodXZ: i32, periodY: i32) -> f32 {
  let cell = vec3<i32>(floor(position));
  let fraction = fract(position);
  var nearest = 1e9;
  var dz: i32 = -1;
  loop {
    var dy: i32 = -1;
    loop {
      var dx: i32 = -1;
      loop {
        let random = cloud_hash3_periodic(
          cell + vec3<i32>(dx, dy, dz),
          seed ^ 0x9e3779b9u,
          periodXZ,
          periodY,
          periodXZ,
        );
        let point = vec3<f32>(
          f32(dx) + fract(random * 17.0) - fraction.x,
          f32(dy) + fract(random * 31.0) - fraction.y,
          f32(dz) + fract(random * 47.0) - fraction.z,
        );
        nearest = min(nearest, dot(point, point));
        if (dx >= 1) { break; }
        dx = dx + 1;
      }
      if (dy >= 1) { break; }
      dy = dy + 1;
    }
    if (dz >= 1) { break; }
    dz = dz + 1;
  }
  return 1.0 - clamp(sqrt(nearest) * 1.25, 0.0, 1.0);
}

fn cloud_weather_field(position: vec3<f32>, seed: u32) -> f32 {
  return smoothstep(
    0.34,
    0.66,
    cloud_value_noise(
      vec3<f32>(position.x * 2.0, 0.37, position.z * 2.0),
      seed + 17041u,
      2,
      1,
      2,
    ),
  );
}

fn cloud_formation_field(position: vec3<f32>, seed: u32) -> vec3<f32> {
  let macroWarpX = cloud_value_noise(
    vec3<f32>(position.x * 2.0, position.y * CLOUD_VERTICAL_NOISE_CELLS + 3.0, position.z * 2.0),
    seed + 41023u,
    2,
    2,
    2,
  ) - 0.5;
  let macroWarpZ = cloud_value_noise(
    vec3<f32>(position.x * 2.0 + 5.0, position.y * CLOUD_VERTICAL_NOISE_CELLS - 7.0, position.z * 2.0),
    seed + 41023u,
    2,
    2,
    2,
  ) - 0.5;
  let bodyX = position.x + macroWarpX * 0.3;
  let bodyZ = position.z + macroWarpZ * 0.3;
  var noise = 0.0;
  var weight = 0.0;
  var amplitude = 0.5;
  var frequency = 1.0;
  for (var octave = 0u; octave < 4u; octave = octave + 1u) {
    let tilePeriod = 4.0 * frequency;
    noise = noise + cloud_value_noise(
      vec3<f32>(bodyX * tilePeriod, position.y * frequency * CLOUD_VERTICAL_NOISE_CELLS, bodyZ * tilePeriod),
      seed + octave * 1013u,
      i32(tilePeriod),
      i32(frequency * CLOUD_VERTICAL_NOISE_CELLS),
      i32(tilePeriod),
    ) * amplitude;
    weight = weight + amplitude;
    amplitude = amplitude * 0.4;
    frequency = frequency * 2.0;
  }
  let broad = noise / max(0.0001, weight);
  let cells = cloud_cellular_noise(
    vec3<f32>(bodyX * 4.0, position.y * CLOUD_VERTICAL_NOISE_CELLS, bodyZ * 4.0),
    seed + 5011u,
    4,
    i32(CLOUD_VERTICAL_NOISE_CELLS),
  );
  // Keep the broad field responsible for the cloud silhouette and use the
  // cellular term as bounded breakup. A broad-dominant mix reads as fewer,
  // wider formations instead of evenly spaced foam balls.
  let base = clamp(broad * 0.85 + cells * 0.15 + 0.15, 0.0, 1.0);
  let weather = cloud_weather_field(position, seed);
  let detailPosition = position * 3.0;
  let warpX = cloud_value_noise(
    vec3<f32>(detailPosition.x * 2.0, detailPosition.y * 2.0 + 11.0, detailPosition.z * 2.0),
    seed + 29011u,
    2,
    2,
    2,
  ) - 0.5;
  let warpZ = cloud_value_noise(
    vec3<f32>(detailPosition.x * 2.0 + 7.0, detailPosition.y * 2.0 - 5.0, detailPosition.z * 2.0),
    seed + 29011u,
    2,
    2,
    2,
  ) - 0.5;
  let erosion = cloud_cellular_noise(
    vec3<f32>(
      (detailPosition.x + warpX * 0.22) * 12.0,
      detailPosition.y * 3.0,
      (detailPosition.z + warpZ * 0.22) * 12.0,
    ),
    seed + 7919u,
    12,
    3,
  );
  return vec3<f32>(weather, base, erosion);
}

fn cloud_height_profile(height: f32, body: f32, weather: f32) -> f32 {
  // A body-dependent crown breaks the fixed horizontal slab silhouette while
  // keeping the profile smooth enough for the bounded ray step budget.
  let lowerEdge = 0.05 + (1.0 - body) * 0.1;
  let crownEdge = min(0.96, 0.6 + body * 0.3 + weather * 0.08);
  let lower = smoothstep(lowerEdge, min(1.0, lowerEdge + 0.12), height);
  let upper = 1.0 - smoothstep(crownEdge, min(1.0, crownEdge + 0.14), height);
  return lower * upper;
}

fn cloud_compose_density(height: f32, formation: vec3<f32>, coverage: f32) -> f32 {
  let threshold = 1.0 - coverage * (0.45 + formation.x * 0.55);
  let covered = smoothstep(0.0, 0.4, (formation.y - threshold) / max(0.001, 1.0 - threshold));
  let shaped = covered * cloud_height_profile(height, formation.y, formation.x);
  let erosion = (1.0 - formation.z) * 0.18;
  return clamp((shaped - erosion) / (1.0 - erosion), 0.0, 1.0);
}

fn cloud_analytic_density(position: vec3<f32>) -> f32 {
  let height = (position.y - cloud.layer.x) / max(0.000001, cloud.layer.y);
  if (height <= 0.0 || height >= 1.0 || cloud.layer.w <= 0.0 || cloud.field.x <= 0.0) { return 0.0; }
  let advected = position + cloud.wind.xyz * cloud.field.y;
  let advectedHeight = height +
    cloud.wind.y * cloud.field.y * cloud.layer.z / max(CLOUD_VERTICAL_CELLS, 0.000001);
  let p = vec3<f32>(
    advected.x * cloud.layer.z,
    fract(advectedHeight) * CLOUD_VERTICAL_CELLS,
    advected.z * cloud.layer.z,
  );
  let formation = cloud_formation_field(p, u32(round(cloud.field.w)));
  return cloud_compose_density(height, formation, cloud.field.x) * cloud.layer.w;
}

fn cloud_cache_byte(index: u32) -> f32 {
  let word = densityCache[index >> 2u];
  let shift = (index & 3u) * 8u;
  return f32((word >> shift) & 255u) / 255.0;
}

fn cloud_cache_component(plane: u32, index: u32, stride: u32) -> f32 {
  return cloud_cache_byte(plane * stride + index);
}

fn cloud_cache_trilinear(
  plane: u32,
  resolution: u32,
  x0: u32,
  x1: u32,
  y0: u32,
  y1: u32,
  z0: u32,
  z1: u32,
  fx: f32,
  fy: f32,
  fz: f32,
) -> f32 {
  let stride = resolution * resolution * resolution;
  let layer = resolution * resolution;
  let c000 = cloud_cache_component(plane, z0 * layer + y0 * resolution + x0, stride);
  let c100 = cloud_cache_component(plane, z0 * layer + y0 * resolution + x1, stride);
  let c010 = cloud_cache_component(plane, z0 * layer + y1 * resolution + x0, stride);
  let c110 = cloud_cache_component(plane, z0 * layer + y1 * resolution + x1, stride);
  let c001 = cloud_cache_component(plane, z1 * layer + y0 * resolution + x0, stride);
  let c101 = cloud_cache_component(plane, z1 * layer + y0 * resolution + x1, stride);
  let c011 = cloud_cache_component(plane, z1 * layer + y1 * resolution + x0, stride);
  let c111 = cloud_cache_component(plane, z1 * layer + y1 * resolution + x1, stride);
  let x00 = mix(c000, c100, fx);
  let x10 = mix(c010, c110, fx);
  let x01 = mix(c001, c101, fx);
  let x11 = mix(c011, c111, fx);
  return mix(mix(x00, x10, fy), mix(x01, x11, fy), fz);
}

fn cloud_density(position: vec3<f32>) -> f32 {
  let height = (position.y - cloud.layer.x) / max(0.000001, cloud.layer.y);
  if (height <= 0.0 || height >= 1.0 || cloud.layer.w <= 0.0 || cloud.field.x <= 0.0) { return 0.0; }
  let resolution = cloud.integration.x;
  if (resolution < 4u) { return max(cloud_analytic_density(position), 0.0); }
  let periodCoordinate = fract((position.xz + cloud.wind.xz * cloud.field.y) * cloud.layer.z);
  let x = fract(periodCoordinate.x - 0.5 / f32(resolution)) * f32(resolution);
  let z = fract(periodCoordinate.y - 0.5 / f32(resolution)) * f32(resolution);
  let advectedHeight = height +
    cloud.wind.y * cloud.field.y * cloud.layer.z / max(CLOUD_VERTICAL_CELLS, 0.000001);
  let y = fract(advectedHeight - 0.5 / f32(resolution)) * f32(resolution);
  let x0 = u32(floor(x));
  let y0 = u32(floor(y));
  let z0 = u32(floor(z));
  let x1 = (x0 + 1u) % resolution;
  let y1 = (y0 + 1u) % resolution;
  let z1 = (z0 + 1u) % resolution;
  let fx = x - f32(x0);
  let fy = y - f32(y0);
  let fz = z - f32(z0);
  let weather = cloud_cache_trilinear(0u, resolution, x0, x1, y0, y1, z0, z1, fx, fy, fz);
  let body = cloud_cache_trilinear(1u, resolution, x0, x1, y0, y1, z0, z1, fx, fy, fz);
  // Repeat only the independent erosion plane: fine boundary structure with
  // the same eight packed reads and the same cache allocation.
  let detail = fract(vec3<f32>(periodCoordinate.x, advectedHeight, periodCoordinate.y) * 3.0 - vec3<f32>(0.5 / f32(resolution))) * f32(resolution);
  let d0 = vec3<u32>(floor(detail));
  let d1 = (d0 + vec3<u32>(1u)) % vec3<u32>(resolution);
  let df = fract(detail);
  let erosion = cloud_cache_trilinear(2u, resolution, d0.x, d1.x, d0.y, d1.y, d0.z, d1.z, df.x, df.y, df.z);
  return cloud_compose_density(height, vec3<f32>(weather, body, erosion), cloud.field.x) * cloud.layer.w;
}

fn cloud_layer_interval(origin: vec3<f32>, direction: vec3<f32>, maxDistance: f32) -> vec2<f32> {
  if (abs(direction.y) < 0.000001) {
    if (origin.y < cloud.layer.x || origin.y > cloud.layer.x + cloud.layer.y) {
      return vec2<f32>(1.0, 0.0);
    }
    return vec2<f32>(0.0, maxDistance);
  }
  let lower = (cloud.layer.x - origin.y) / direction.y;
  let upper = (cloud.layer.x + cloud.layer.y - origin.y) / direction.y;
  return vec2<f32>(
    max(0.0, min(lower, upper)),
    min(maxDistance, max(lower, upper)),
  );
}

fn cloud_solar_transmittance(position: vec3<f32>) -> f32 {
  let sunDirection = normalize(-view.lightDir);
  let solarDistance = select(cloud.field.z, cloud.shadowProjection.x, cloud.shadowProjection.x > 0.0);
  let interval = cloud_layer_interval(position, sunDirection, solarDistance);
  if (interval.y <= interval.x) { return 1.0; }
  let steps = min(cloud.integration.z, 64u);
  let stepLength = (interval.y - interval.x) / max(1.0, f32(steps));
  var opticalDepth = 0.0;
  let solarJitter = cloud_solar_jitter(position);
  for (var index = 0u; index < 64u; index = index + 1u) {
    if (index >= steps) { break; }
    let samplePosition = position + sunDirection * (interval.x + (f32(index) + solarJitter) * stepLength);
    opticalDepth = opticalDepth + cloud_density(samplePosition) * ${CLOUD_EXTINCTION_COEFFICIENT} * stepLength;
  }
  return exp(-max(opticalDepth, 0.0));
}

fn cloud_henyey_greenstein(cosTheta: f32, g: f32) -> f32 {
  let denominator = max(0.0001, 1.0 + g * g - 2.0 * g * cosTheta);
  return (1.0 - g * g) / (denominator * sqrt(denominator)) * 0.0795774715;
}

fn cloud_phase(cosTheta: f32) -> f32 {
  // A bounded dual lobe gives a readable forward highlight and a small
  // back-scatter rim without another solar march.
  return cloud_henyey_greenstein(cosTheta, 0.55) * 0.8 +
    cloud_henyey_greenstein(cosTheta, -0.2) * 0.2;
}

// Reuse the same remaining-path optical depth for two bounded scattering
// orders. This adds arithmetic only; no extra density or light-ray samples.
fn cloud_incident_light(solarT: f32, cosTheta: f32, height: f32) -> vec3<f32> {
  let direct = solarT * cloud_phase(cosTheta);
  let multiple = (0.5 * pow(solarT, 0.5) + 0.25 * pow(solarT, 0.25)) * 0.0795774715;
  let skyFill = mix(0.025, 0.075, smoothstep(0.1, 0.85, height));
  // Match volume-integrate: the shared DirectionalLight value uses the
  // unnormalized phase convention. Convert the normalized HG basis once.
  return cloud.sunRadiance.xyz *
    (vec3<f32>((direct + multiple) * 12.5663706144) + vec3<f32>(0.72, 0.84, 1.0) * skyFill);
}

fn cloud_ray_jitter(pixel: vec2<f32>) -> f32 {
  // A stable per-pixel offset removes view-step contour bands without adding
  // a frame-varying noise source that would fight temporal reprojection.
  return fract(sin(dot(pixel, vec2<f32>(12.9898, 78.233))) * 43758.5453);
}

fn cloud_solar_jitter(position: vec3<f32>) -> f32 {
  // Dither the light-column samples in world space so low shadow-step
  // profiles do not paint parallel contour bands across cloud bases.
  return fract(sin(dot(position.xz, vec2<f32>(19.193, 47.117))) * 15731.743);
}

fn reconstruct_world(uv: vec2<f32>, depth: f32) -> vec3<f32> {
  let ndc = vec4<f32>(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, depth, 1.0);
  let world = view.inverseViewProj * ndc;
  return world.xyz / max(abs(world.w), 0.00001);
}

@vertex
fn vs_main(@builtin(vertex_index) index: u32) -> CloudViewOut {
  var positions = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0),
  );
  var output: CloudViewOut;
  output.position = vec4<f32>(positions[index], 0.0, 1.0);
  // WebGPU clip-space Y grows upward while sampled framebuffer rows and the
  // depth texture use a top-left origin. Keep this one top-left UV for color,
  // depth and inverse-projection reconstruction; flipping only the final
  // color would leave the camera ray and depth cut mirrored.
  output.uv = vec2<f32>(
    positions[index].x * 0.5 + 0.5,
    1.0 - (positions[index].y * 0.5 + 0.5),
  );
  return output;
}

@fragment
fn fs_main(input: CloudViewOut) -> @location(0) vec4<f32> {
  // The shadow producer uses this same production density/cache contract but
  // rasterizes a camera-independent, texel-snapped light-space map. It does
  // not consume scene colour; the generic fullscreen host still supplies the
  // input binding to keep the feature binding ABI single and validated.
  if (cloud.integration.w == 1u) {
    let projection = cloud.shadowProjection;
    if (projection.y < 0.5 || projection.z > 0.5 || projection.x <= 0.0) {
      return vec4<f32>(1.0);
    }
    let offset = (input.uv - vec2<f32>(0.5)) * projection.x;
    let receiver = cloud.shadowOrigin.xyz +
      cloud.shadowRight.xyz * offset.x + cloud.shadowUp.xyz * offset.y;
    let sunDirection = normalize(-view.lightDir);
    let interval = cloud_layer_interval(receiver, sunDirection, projection.x);
    if (interval.y <= interval.x) { return vec4<f32>(1.0); }
    let steps = min(cloud.integration.z, 64u);
    let stepLength = (interval.y - interval.x) / max(1.0, f32(steps));
    var opticalDepth = 0.0;
    var firstHeight = 1.0;
    var lastHeight = 0.0;
    var occupied = false;
    let solarJitter = cloud_solar_jitter(receiver);
    for (var index = 0u; index < 64u; index = index + 1u) {
      if (index >= steps) { break; }
      let samplePosition = receiver + sunDirection *
        (interval.x + (f32(index) + solarJitter) * stepLength);
      let localDensity = cloud_density(samplePosition);
      opticalDepth = opticalDepth + localDensity * ${CLOUD_EXTINCTION_COEFFICIENT} * stepLength;
      if (localDensity > 0.0001) {
        let sampleHeight = clamp(
          (samplePosition.y - cloud.layer.x) / max(0.0001, cloud.layer.y),
          0.0,
          1.0,
        );
        if (!occupied) { firstHeight = sampleHeight; }
        lastHeight = sampleHeight;
        occupied = true;
      }
    }
    let transmittance = exp(-max(opticalDepth, 0.0));
    // R stores full-column transmittance. G/B preserve the first/last
    // occupied normalized layer heights so interior samples can estimate the
    // remaining segment without pretending optical depth is uniform through
    // the whole layer. A stores the integrated optical depth and distinguishes
    // an empty projected column from a valid, nearly-clear one.
    return vec4<f32>(
      transmittance,
      select(1.0, firstHeight, occupied),
      select(0.0, lastHeight, occupied),
      select(0.0, opticalDepth, occupied),
    );
  }
  // The shadow producer branch above is per-fragment (its light-space
  // interval depends on the rasterized receiver), so derivative-based
  // sampling here would violate WGSL uniform-control-flow rules. The cloud
  // scene path already owns an explicit level-0 sampler contract.
  // Keep point semantics for the current full-resolution scene path. The
  // half-resolution transport contract is introduced with its own resolve
  // shader so this path retains the established depth convention.
  let depthPixel = vec2<i32>(input.position.xy);
  let depth = textureLoad(sceneDepth, depthPixel, 0);
  let farWorld = reconstruct_world(input.uv, 1.0);
  let sceneWorld = reconstruct_world(input.uv, clamp(depth, 0.0, 1.0));
  let ray = normalize(farWorld - view.cameraPos);
  let rayJitter = cloud_ray_jitter(input.position.xy);
  let sceneDistance = select(cloud.field.z, length(sceneWorld - view.cameraPos), depth < 0.999999);
  let interval = cloud_layer_interval(view.cameraPos, ray, sceneDistance);

  // The depth producer shares the same camera ray, interval and density
  // contract as the display path. It writes a cloud representative world
  // position and a validity bit so history remains comparable after camera
  // translation or rotation and never uses an opaque scene distance as a
  // proxy for a participating medium.
  if (cloud.integration.w == 2u) {
    if (interval.y <= interval.x) { return vec4<f32>(sceneWorld, 0.0); }
    let depthSteps = min(cloud.integration.y, 64u);
    let depthStepLength = (interval.y - interval.x) / max(1.0, f32(depthSteps));
    var depthTransmittance = 1.0;
    var weightedDistance = 0.0;
    var opticalWeight = 0.0;
    for (var depthIndex = 0u; depthIndex < 64u; depthIndex = depthIndex + 1u) {
      if (depthIndex >= depthSteps) { break; }
      let sampleDistance = interval.x + (f32(depthIndex) + rayJitter) * depthStepLength;
      let samplePosition = view.cameraPos + ray * sampleDistance;
      let localDensity = cloud_density(samplePosition);
      let localTransmittance = exp(-max(localDensity * ${CLOUD_EXTINCTION_COEFFICIENT} * depthStepLength, 0.0));
      let weight = depthTransmittance * (1.0 - localTransmittance);
      weightedDistance = weightedDistance + sampleDistance * weight;
      opticalWeight = opticalWeight + weight;
      depthTransmittance = depthTransmittance * localTransmittance;
    }
    let hasCloud = opticalWeight > 0.00001;
    let representativeDistance = select(sceneDistance, weightedDistance / opticalWeight, hasCloud);
    let representativeWorld = view.cameraPos + ray * representativeDistance;
    return vec4<f32>(representativeWorld, select(0.0, 1.0, hasCloud));
  }

  let scene = textureSampleLevel(sceneColor, sceneSampler, input.uv, 0.0);
  if (interval.y <= interval.x) { return scene; }
  let steps = min(cloud.integration.y, 64u);
  let stepLength = (interval.y - interval.x) / max(1.0, f32(steps));
  var transmittance = 1.0;
  var scattering = vec3<f32>(0.0);
  var weightedDistance = 0.0;
  var opticalWeight = 0.0;
  let sunDirection = normalize(-view.lightDir);
  for (var index = 0u; index < 64u; index = index + 1u) {
    if (index >= steps) { break; }
    let distance = interval.x + (f32(index) + rayJitter) * stepLength;
    let samplePosition = view.cameraPos + ray * distance;
    let localDensity = cloud_density(samplePosition);
    let extinction = localDensity * ${CLOUD_EXTINCTION_COEFFICIENT} * stepLength;
    let localTransmittance = exp(-max(extinction, 0.0));
    let depthWeight = transmittance * (1.0 - localTransmittance);
    weightedDistance = weightedDistance + distance * depthWeight;
    opticalWeight = opticalWeight + depthWeight;
    // Empty samples are common in the separated-cloud field. Avoid a nested
    // solar march for them and stop once the camera path is effectively opaque.
    if (localDensity > 0.0001 && transmittance > 0.01) {
      let solarTransmittance = cloud_solar_transmittance(samplePosition);
      let cloudHeight = clamp(
        (samplePosition.y - cloud.layer.x) / max(0.0001, cloud.layer.y), 0.0, 1.0,
      );
      scattering = scattering + cloud_incident_light(
        solarTransmittance, dot(ray, sunDirection), cloudHeight,
      ) * depthWeight;
    }
    transmittance = transmittance * localTransmittance;
    if (transmittance < 0.01) { break; }
  }
  let hasCloud = opticalWeight > 0.00001;
  let representativeDistance = select(sceneDistance, weightedDistance / opticalWeight, hasCloud);
  let representativeWorld = view.cameraPos + ray * representativeDistance;
  // Wind is an advective coordinate change. Reproject the cloud point into
  // the previous frame's world before applying the previous camera matrix;
  // authored field values remain immutable.
  let windDelta = cloud.wind.xyz * max(0.0, cloud.field.y - cloud.temporal.w);
  // cloud_density evaluates the authored field at position + wind*time.
  // Keeping the same field sample in the previous frame therefore advances
  // the previous world point by the elapsed wind delta as well.
  let previousCloudWorld = representativeWorld + windDelta;
  let previousCloudClip = view.temporalPreviousViewProj * vec4<f32>(previousCloudWorld, 1.0);
  let previousCloudNdc = previousCloudClip.xyz / max(abs(previousCloudClip.w), 0.00001);
  let previousCloudUv = vec2<f32>(
    previousCloudNdc.x * 0.5 + 0.5,
    1.0 - (previousCloudNdc.y * 0.5 + 0.5),
  );
  let cloudInBounds = all(previousCloudUv >= vec2<f32>(0.0)) && all(previousCloudUv <= vec2<f32>(1.0));
  let cloudHistoryUv = clamp(previousCloudUv, vec2<f32>(0.0), vec2<f32>(1.0));
  let cloudHistoryDepthSample = textureSampleLevel(previousDepth, depthSampler, cloudHistoryUv, 0.0);
  let cloudHistoryWorld = cloudHistoryDepthSample.xyz;
  let previous = textureSampleLevel(previousRadiance, sceneSampler, cloudHistoryUv, 0.0);
  let previousTransport = textureSampleLevel(
    previousTransmittance,
    sceneSampler,
    cloudHistoryUv,
    0.0,
  );
  let worldTolerance = max(0.05, length(previousCloudWorld - view.cameraPos) * 0.02);
  let depthAccepted = cloudHistoryDepthSample.a > 0.5 &&
    distance(cloudHistoryWorld, previousCloudWorld) <= worldTolerance;
  let accepted =
    hasCloud && cloud.temporal.x > 0.5 && cloud.temporal.y < 0.5 && cloudInBounds &&
    depthAccepted && previousTransport.a > 0.0;
  let historyWeight = select(0.0, clamp(cloud.temporal.z, 0.0, 0.95), accepted);
  let cloudRadiance = mix(scattering, previous.rgb, historyWeight);
  // Preserve scene-linear HDR output for the downstream material lane. The
  // history owner receives cloudRadiance separately through the history pass.
  return vec4<f32>(scene.rgb * transmittance + cloudRadiance, transmittance);
}

// The light-space shadow producer already paid for a bounded column integral.
// Reuse that texel for camera samples instead of starting a full solar march
// for every occupied camera step. Outside the occupied interval the cached
// full-column transmittance is exact for the projected column. Inside the
// interval, the cache supplies the stable projection/bounds and a short
// residual march resolves the non-uniform density that a linear optical-depth
// interpolation would lose. Invalid/out-of-range projections retain the
// analytic path as an explicit fallback.
fn cloud_solar_cached_transmittance(position: vec3<f32>) -> f32 {
  let projection = cloud.shadowProjection;
  if (projection.y < 0.5 || projection.x <= 0.0) {
    return cloud_solar_transmittance(position);
  }
  let relative = position - cloud.shadowOrigin.xyz;
  let uv = vec2<f32>(
    dot(relative, cloud.shadowRight.xyz) / projection.x + 0.5,
    dot(relative, cloud.shadowUp.xyz) / projection.x + 0.5,
  );
  if (any(uv < vec2<f32>(0.0)) || any(uv > vec2<f32>(1.0))) {
    return cloud_solar_transmittance(position);
  }
  let cachedShadow = textureSampleLevel(previousRadiance, sceneSampler, uv, 0.0);
  let cachedOpticalDepth = max(cachedShadow.a, 0.0);
  let layerHeight = clamp(
    (position.y - cloud.layer.x) / max(0.0001, cloud.layer.y),
    0.0,
    1.0,
  );
  if (cachedOpticalDepth <= 0.0001) { return 1.0; }
  let firstHeight = clamp(cachedShadow.g, 0.0, 1.0);
  let lastHeight = clamp(cachedShadow.b, 0.0, 1.0);
  let occupiedMin = min(firstHeight, lastHeight);
  let occupiedMax = max(firstHeight, lastHeight);
  let sunDirection = normalize(-view.lightDir);
  // G/B are ordered along the light ray, not necessarily bottom-to-top. Only
  // use the cached full/empty fast paths when the light has enough vertical
  // component to make that ordering meaningful; grazing light stays on the
  // residual path so a low-sun column cannot invert the cache bounds.
  if (abs(sunDirection.y) > 0.2) {
    if (sunDirection.y > 0.0) {
      if (layerHeight <= occupiedMin) { return exp(-cachedOpticalDepth); }
      if (layerHeight >= occupiedMax) { return 1.0; }
    } else {
      if (layerHeight >= occupiedMax) { return exp(-cachedOpticalDepth); }
      if (layerHeight <= occupiedMin) { return 1.0; }
    }
  }

  // A short residual march is only paid for samples inside the projected
  // cloud span. Vertical light uses twelve taps, oblique light sixteen, and
  // grazing light up to thirty-two because the same layer projects across a
  // much longer solar segment. This removes the large error caused by
  // assuming optical depth is uniform between the first and last occupied
  // heights while keeping the normal camera path far below a second full
  // solar integration.
  let solarDistance = select(cloud.field.z, projection.x, projection.x > 0.0);
  let interval = cloud_layer_interval(position, sunDirection, solarDistance);
  if (interval.y <= interval.x) { return 1.0; }
  let absLightY = abs(sunDirection.y);
  let directionBudget = select(
    32u,
    select(16u, 12u, absLightY > 0.5),
    absLightY > 0.2,
  );
  let residualSteps = min(directionBudget, max(8u, cloud.integration.z * 3u));
  let stepLength = (interval.y - interval.x) / max(1.0, f32(residualSteps));
  var opticalDepth = 0.0;
  let solarJitter = cloud_solar_jitter(position);
  for (var index = 0u; index < 32u; index = index + 1u) {
    if (index >= residualSteps) { break; }
    let samplePosition = position + sunDirection *
      (interval.x + (f32(index) + solarJitter) * stepLength);
    opticalDepth = opticalDepth + cloud_density(samplePosition) *
      ${CLOUD_EXTINCTION_COEFFICIENT} * stepLength;
  }
  return exp(-max(opticalDepth, 0.0));
}

struct CloudTransportOutput {
  @location(0) radiance: vec4<f32>,
  @location(1) transmittance: vec4<f32>,
  @location(2) depth: vec4<f32>,
};

// One half-resolution transport pass writes all three reusable cloud fields.
// The full-resolution resolve below reconstructs colour and applies temporal
// history; no second full raymarch exists solely to obtain cloud depth.
@fragment
fn fs_transport(input: CloudViewOut) -> CloudTransportOutput {
  let depth = textureSampleLevel(sceneDepth, depthSampler, input.uv, 0u);
  let farWorld = reconstruct_world(input.uv, 1.0);
  let sceneWorld = reconstruct_world(input.uv, clamp(depth, 0.0, 1.0));
  let ray = normalize(farWorld - view.cameraPos);
  let rayJitter = cloud_ray_jitter(input.position.xy);
  let sceneDistance = select(cloud.field.z, length(sceneWorld - view.cameraPos), depth < 0.999999);
  let interval = cloud_layer_interval(view.cameraPos, ray, sceneDistance);
  var output: CloudTransportOutput;
  output.radiance = vec4<f32>(0.0, 0.0, 0.0, 0.0);
  output.transmittance = vec4<f32>(1.0, 1.0, 1.0, 1.0);
  output.depth = vec4<f32>(sceneWorld, 0.0);
  if (interval.y <= interval.x) { return output; }

  let steps = min(cloud.integration.y, 64u);
  let stepLength = (interval.y - interval.x) / max(1.0, f32(steps));
  var transmittance = 1.0;
  var scattering = vec3<f32>(0.0);
  var weightedDistance = 0.0;
  var opticalWeight = 0.0;
  let sunDirection = normalize(-view.lightDir);
  for (var index = 0u; index < 64u; index = index + 1u) {
    if (index >= steps) { break; }
    let distance = interval.x + (f32(index) + rayJitter) * stepLength;
    let samplePosition = view.cameraPos + ray * distance;
    let localDensity = cloud_density(samplePosition);
    let extinction = localDensity * ${CLOUD_EXTINCTION_COEFFICIENT} * stepLength;
    let localTransmittance = exp(-max(extinction, 0.0));
    let depthWeight = transmittance * (1.0 - localTransmittance);
    weightedDistance = weightedDistance + distance * depthWeight;
    opticalWeight = opticalWeight + depthWeight;
    if (localDensity > 0.0001 && transmittance > 0.01) {
      let solarTransmittance = cloud_solar_cached_transmittance(samplePosition);
      let cloudHeight = clamp(
        (samplePosition.y - cloud.layer.x) / max(0.0001, cloud.layer.y), 0.0, 1.0,
      );
      scattering = scattering + cloud_incident_light(
        solarTransmittance, dot(ray, sunDirection), cloudHeight,
      ) * depthWeight;
    }
    transmittance = transmittance * localTransmittance;
    if (transmittance < 0.01) { break; }
  }
  let hasCloud = opticalWeight > 0.00001;
  let representativeDistance = select(sceneDistance, weightedDistance / max(opticalWeight, 0.00001), hasCloud);
  output.radiance = vec4<f32>(scattering, select(0.0, 1.0, hasCloud));
  output.transmittance = vec4<f32>(transmittance, transmittance, transmittance, 1.0);
  output.depth = vec4<f32>(view.cameraPos + ray * representativeDistance, select(0.0, 1.0, hasCloud));
  return output;
}
`
);
var CLOUD_TRANSPORT_FULLSCREEN_WGSL = CLOUD_VIEW_FULLSCREEN_WGSL;
var CLOUD_TRANSPORT_ANALYTIC_FULLSCREEN_WGSL = CLOUD_VIEW_FULLSCREEN_WGSL.replace(
  "cloud_solar_cached_transmittance(samplePosition)",
  "cloud_solar_transmittance(samplePosition)"
);
var CLOUD_HISTORY_FULLSCREEN_WGSL = (
  /* wgsl */
  `
struct CloudCameraView {
  worldViewProj: mat4x4<f32>,
  lightDir: vec3<f32>,
  lightColor: vec3<f32>,
  cameraPos: vec3<f32>,
  lightViewProj_A: mat4x4<f32>,
  inverseViewProj: mat4x4<f32>,
  lightViewProj_B: mat4x4<f32>,
  lightViewProj_C: mat4x4<f32>,
  lightViewProj_D: mat4x4<f32>,
  splitPlanes: array<vec4<f32>, 4>,
  cascadeCount: f32,
  cascadeBlend: f32,
  depthBias: f32,
  normalBias: f32,
  directionalShadowFilter: vec4<f32>,
  spotLightViewProj: array<mat4x4<f32>, 4>,
  temporalCurrentViewProj: mat4x4<f32>,
  temporalPreviousViewProj: mat4x4<f32>,
  temporalProjection: vec4<f32>,
  temporalPreviousCameraPos: vec4<f32>,
  ssrParams: vec4<f32>,
};

struct CloudHistoryParams {
  temporal: vec4<f32>, // valid, reset, historyWeight, reserved
  windTime: vec4<f32>, // wind.xyz, elapsed seconds since previous submit
};

@group(0) @binding(0) var<uniform> view: CloudCameraView;
@group(1) @binding(0) var currentRadiance: texture_2d<f32>;
@group(1) @binding(1) var sceneSampler: sampler;
@group(1) @binding(2) var<uniform> params: CloudHistoryParams;
@group(1) @binding(3) var sceneDepth: texture_depth_2d;
@group(1) @binding(4) var depthSampler: sampler;
@group(1) @binding(5) var currentCloudDepth: texture_2d<f32>;
@group(1) @binding(6) var sceneBackground: texture_2d<f32>;

struct CloudHistoryInput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

struct CloudHistoryOutput {
  @location(0) radiance: vec4<f32>,
  @location(1) transmittance: vec4<f32>,
};

fn reconstruct_world(uv: vec2<f32>, depth: f32) -> vec3<f32> {
  let ndc = vec4<f32>(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, depth, 1.0);
  let world = view.inverseViewProj * ndc;
  return world.xyz / max(abs(world.w), 0.00001);
}

@vertex
fn vs_main(@builtin(vertex_index) index: u32) -> CloudHistoryInput {
  var positions = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0),
  );
  var output: CloudHistoryInput;
  output.position = vec4<f32>(positions[index], 0.0, 1.0);
  output.uv = vec2<f32>(
    positions[index].x * 0.5 + 0.5,
    1.0 - (positions[index].y * 0.5 + 0.5),
  );
  return output;
}

@fragment
fn fs_main(input: CloudHistoryInput) -> CloudHistoryOutput {
  let current = textureSampleLevel(currentRadiance, sceneSampler, input.uv, 0.0);
  let background = textureSampleLevel(sceneBackground, sceneSampler, input.uv, 0.0);
  let cloudDepth = textureSampleLevel(currentCloudDepth, depthSampler, input.uv, 0.0);
  let currentValid = cloudDepth.a > 0.5;
  // currentRadiance is the scene-linear cloud composite. Remove the
  // unchanged scene background before writing history so the persistent owner
  // stores raw cloud radiance only. The view pass is the sole temporal blend
  // owner; blending here as well would accumulate history twice per frame.
  let currentCloudRadiance = max(current.rgb - background.rgb * current.a, vec3<f32>(0.0));
  let currentTransmittance = vec4<f32>(current.a, current.a, current.a, 1.0);
  var output: CloudHistoryOutput;
  output.radiance = vec4<f32>(currentCloudRadiance, select(0.0, 1.0, currentValid));
  output.transmittance = currentTransmittance;
  return output;
}
`
);
var CLOUD_RESOLVE_FULLSCREEN_WGSL = (
  /* wgsl */
  `
struct CloudCameraView {
  worldViewProj: mat4x4<f32>,
  lightDir: vec3<f32>,
  lightColor: vec3<f32>,
  cameraPos: vec3<f32>,
  lightViewProj_A: mat4x4<f32>,
  inverseViewProj: mat4x4<f32>,
  lightViewProj_B: mat4x4<f32>,
  lightViewProj_C: mat4x4<f32>,
  lightViewProj_D: mat4x4<f32>,
  splitPlanes: array<vec4<f32>, 4>,
  cascadeCount: f32,
  cascadeBlend: f32,
  depthBias: f32,
  normalBias: f32,
  directionalShadowFilter: vec4<f32>,
  spotLightViewProj: array<mat4x4<f32>, 4>,
  temporalCurrentViewProj: mat4x4<f32>,
  temporalPreviousViewProj: mat4x4<f32>,
  temporalProjection: vec4<f32>,
  temporalPreviousCameraPos: vec4<f32>,
  ssrParams: vec4<f32>,
};

struct CloudResolveParams {
  layer: vec4<f32>,
  field: vec4<f32>,
  wind: vec4<f32>,
  sunDirection: vec4<f32>,
  sunRadiance: vec4<f32>,
  integration: vec4<u32>,
  shadowOrigin: vec4<f32>,
  shadowRight: vec4<f32>,
  shadowUp: vec4<f32>,
  shadowProjection: vec4<f32>,
  temporal: vec4<f32>,
};

@group(0) @binding(0) var<uniform> view: CloudCameraView;
@group(1) @binding(0) var sceneColor: texture_2d<f32>;
@group(1) @binding(1) var sceneSampler: sampler;
@group(1) @binding(2) var<uniform> cloud: CloudResolveParams;
@group(1) @binding(3) var sceneDepth: texture_depth_2d;
@group(1) @binding(4) var depthSampler: sampler;
@group(1) @binding(5) var currentRadiance: texture_2d<f32>;
@group(1) @binding(6) var currentTransmittance: texture_2d<f32>;
@group(1) @binding(7) var currentDepth: texture_2d<f32>;
@group(1) @binding(8) var previousRadiance: texture_2d<f32>;
@group(1) @binding(9) var previousTransmittance: texture_2d<f32>;
@group(1) @binding(10) var previousDepth: texture_2d<f32>;

struct CloudResolveInput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

fn reconstruct_world(uv: vec2<f32>, depth: f32) -> vec3<f32> {
  let ndc = vec4<f32>(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, depth, 1.0);
  let world = view.inverseViewProj * ndc;
  return world.xyz / max(abs(world.w), 0.00001);
}

@vertex
fn vs_main(@builtin(vertex_index) index: u32) -> CloudResolveInput {
  var positions = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0),
  );
  var output: CloudResolveInput;
  output.position = vec4<f32>(positions[index], 0.0, 1.0);
  output.uv = vec2<f32>(
    positions[index].x * 0.5 + 0.5,
    1.0 - (positions[index].y * 0.5 + 0.5),
  );
  return output;
}

@fragment
fn fs_main(input: CloudResolveInput) -> @location(0) vec4<f32> {
  let scene = textureSampleLevel(sceneColor, sceneSampler, input.uv, 0.0);
  // The resolve owns the full-resolution foreground test. Reject the current
  // low-resolution transport before any history or radiance is composited;
  // gating history alone still lets a newly sampled cloud bleed over geometry.
  let sceneDepthValue = textureLoad(sceneDepth, vec2<i32>(input.position.xy), 0);
  let sceneWorld = reconstruct_world(input.uv, clamp(sceneDepthValue, 0.0, 1.0));
  let sceneDistance = length(sceneWorld - view.cameraPos);
  let transport = textureSampleLevel(currentRadiance, sceneSampler, input.uv, 0.0);
  let transportT = textureSampleLevel(currentTransmittance, sceneSampler, input.uv, 0.0);
  // The transport depth is an rgba16float color attachment, not the scene's
  // depth texture. Sample it with the filtering color sampler; binding the
  // non-filtering scene-depth sampler here makes the shader contract depend on
  // an incompatible sampler/texture pair on strict WebGPU implementations.
  let cloudDepth = textureSampleLevel(currentDepth, sceneSampler, input.uv, 0.0);
  let currentValid = transport.a > 0.5 && cloudDepth.a > 0.5;
  let cloudDistance = length(cloudDepth.xyz - view.cameraPos);
  let foregroundAccepted = sceneDepthValue >= 0.999999 ||
    cloudDistance <= sceneDistance + max(0.05, sceneDistance * 0.01);
  if (!currentValid || !foregroundAccepted) { return scene; }

  let previousClip = view.temporalPreviousViewProj * vec4<f32>(
    cloudDepth.xyz + cloud.wind.xyz * max(0.0, cloud.field.y - cloud.temporal.w),
    1.0,
  );
  let previousNdc = previousClip.xyz / max(abs(previousClip.w), 0.00001);
  let previousUv = vec2<f32>(
    previousNdc.x * 0.5 + 0.5,
    1.0 - (previousNdc.y * 0.5 + 0.5),
  );
  let inBounds = all(previousUv >= vec2<f32>(0.0)) && all(previousUv <= vec2<f32>(1.0));
  let historyUv = clamp(previousUv, vec2<f32>(0.0), vec2<f32>(1.0));
  let historyDepth = textureSampleLevel(previousDepth, sceneSampler, historyUv, 0.0);
  let previous = textureSampleLevel(previousRadiance, sceneSampler, historyUv, 0.0);
  let previousTransport = textureSampleLevel(previousTransmittance, sceneSampler, historyUv, 0.0);
  let dims = vec2<f32>(textureDimensions(previousRadiance));
  let texel = 1.0 / max(dims, vec2<f32>(1.0));
  // Clamp reprojected history against the current low-resolution transport
  // neighborhood. Using only previous-frame neighbors (and including the
  // previous center in both extrema) is a no-op and lets stale bright cloud
  // pixels leak across a newly exposed edge.
  let c0 = transport.rgb;
  let c1 = textureSampleLevel(currentRadiance, sceneSampler, clamp(input.uv + vec2<f32>(-texel.x, 0.0), vec2<f32>(0.0), vec2<f32>(1.0)), 0.0).rgb;
  let c2 = textureSampleLevel(currentRadiance, sceneSampler, clamp(input.uv + vec2<f32>(texel.x, 0.0), vec2<f32>(0.0), vec2<f32>(1.0)), 0.0).rgb;
  let c3 = textureSampleLevel(currentRadiance, sceneSampler, clamp(input.uv + vec2<f32>(0.0, -texel.y), vec2<f32>(0.0), vec2<f32>(1.0)), 0.0).rgb;
  let c4 = textureSampleLevel(currentRadiance, sceneSampler, clamp(input.uv + vec2<f32>(0.0, texel.y), vec2<f32>(0.0), vec2<f32>(1.0)), 0.0).rgb;
  let minRadiance = min(c0, min(min(c1, c2), min(c3, c4)));
  let maxRadiance = max(c0, max(max(c1, c2), max(c3, c4)));
  let t1 = textureSampleLevel(currentTransmittance, sceneSampler, clamp(input.uv + vec2<f32>(-texel.x, 0.0), vec2<f32>(0.0), vec2<f32>(1.0)), 0.0).r;
  let t2 = textureSampleLevel(currentTransmittance, sceneSampler, clamp(input.uv + vec2<f32>(texel.x, 0.0), vec2<f32>(0.0), vec2<f32>(1.0)), 0.0).r;
  let t3 = textureSampleLevel(currentTransmittance, sceneSampler, clamp(input.uv + vec2<f32>(0.0, -texel.y), vec2<f32>(0.0), vec2<f32>(1.0)), 0.0).r;
  let t4 = textureSampleLevel(currentTransmittance, sceneSampler, clamp(input.uv + vec2<f32>(0.0, texel.y), vec2<f32>(0.0), vec2<f32>(1.0)), 0.0).r;
  let minTransport = min(transportT.r, min(min(t1, t2), min(t3, t4)));
  let maxTransport = max(transportT.r, max(max(t1, t2), max(t3, t4)));
  let worldTolerance = max(0.05, distance(cloudDepth.xyz, view.cameraPos) * 0.02);
  let depthAccepted = historyDepth.a > 0.5 && distance(historyDepth.xyz, cloudDepth.xyz) <= worldTolerance;
  let accepted = cloud.temporal.x > 0.5 && cloud.temporal.y < 0.5 && inBounds && depthAccepted;
  let historyWeight = select(0.0, clamp(cloud.temporal.z, 0.0, 0.92), accepted);
  let stableHistory = clamp(previous.rgb, minRadiance, maxRadiance);
  let stableTransport = clamp(previousTransport.r, minTransport, maxTransport);
  let radiance = mix(transport.rgb, stableHistory, historyWeight);
  let transmittance = mix(transportT.r, stableTransport, historyWeight);
  return vec4<f32>(scene.rgb * transmittance + radiance, transmittance);
}
`
);
function makeCloudViewParams(frame, cache, mode = 0) {
  const params = new ArrayBuffer(CLOUD_VIEW_PARAMS_BYTES);
  const floats = new Float32Array(params);
  const integers = new Uint32Array(params);
  const profile = CLOUD_QUALITY_PROFILES[frame.params?.quality ?? "medium"];
  const authored = frame.params;
  floats[0] = authored?.baseHeight ?? 0;
  floats[1] = authored?.thickness ?? 1;
  floats[2] = authored?.scale ?? 1;
  floats[3] = authored?.density ?? 0;
  floats[4] = authored?.coverage ?? 1;
  floats[5] = frame.timeSeconds;
  floats[6] = mode === 1 ? authored?.shadowRange ?? 0 : cloudViewDistanceForQuality(authored?.quality ?? "medium");
  floats[7] = authored?.seed ?? 0;
  floats[8] = authored?.wind[0] ?? 0;
  floats[9] = authored?.wind[1] ?? 0;
  floats[10] = authored?.wind[2] ?? 0;
  floats[12] = frame.sunDirection?.[0] ?? 0;
  floats[13] = frame.sunDirection?.[1] ?? -1;
  floats[14] = frame.sunDirection?.[2] ?? 0;
  floats[15] = 0.2;
  floats[16] = frame.sunRadiance?.[0] ?? 0;
  floats[17] = frame.sunRadiance?.[1] ?? 0;
  floats[18] = frame.sunRadiance?.[2] ?? 0;
  integers[20] = cache.resolution;
  integers[21] = Math.max(1, Math.min(64, Math.floor(profile.viewSteps)));
  integers[22] = Math.max(1, Math.min(64, Math.floor(profile.shadowSteps)));
  integers[23] = mode;
  const projection = frame.shadowProjection;
  if (projection !== void 0) {
    floats[24] = projection.origin[0];
    floats[25] = projection.origin[1];
    floats[26] = projection.origin[2];
    floats[28] = projection.right[0];
    floats[29] = projection.right[1];
    floats[30] = projection.right[2];
    floats[32] = projection.up[0];
    floats[33] = projection.up[1];
    floats[34] = projection.up[2];
    floats[36] = projection.range;
    floats[37] = projection.lowSun ? 0 : 1;
    floats[38] = projection.lowSun ? 1 : 0;
    floats[39] = projection.texelSize;
  }
  const temporal = frame.temporal;
  floats[40] = temporal !== void 0 && temporal.reset === false ? 1 : 0;
  floats[41] = temporal?.reset === true ? 1 : 0;
  floats[42] = temporal === void 0 ? 0 : profile.historyWeight;
  floats[43] = temporal?.history?.temporal.timeSeconds ?? frame.timeSeconds;
  return new Uint8Array(params);
}
function planCloudDensity(frame, packedCache, context) {
  const cacheCount = packedCache.length;
  const params = new Uint32Array([cacheCount]);
  const inputTarget = context.targets.find((target) => target.name === "motion-input");
  const outputTarget = context.targets.find((target) => target.name === "motion-output");
  const historyRadiancePrevious = context.targets.find(
    (target) => target.name === "cloud-history-radiance-previous"
  );
  const historyTransmittancePrevious = context.targets.find(
    (target) => target.name === "cloud-history-transmittance-previous"
  );
  const historyDepthPrevious = context.targets.find(
    (target) => target.name === "cloud-history-depth-previous"
  );
  const historyRadianceCurrent = context.targets.find(
    (target) => target.name === "cloud-history-radiance-current"
  );
  const historyTransmittanceCurrent = context.targets.find(
    (target) => target.name === "cloud-history-transmittance-current"
  );
  const historyDepthCurrent = context.targets.find(
    (target) => target.name === "cloud-history-depth-current"
  );
  const hasHistoryTargets = historyRadiancePrevious !== void 0 && historyTransmittancePrevious !== void 0 && historyDepthPrevious !== void 0 && historyRadianceCurrent !== void 0 && historyTransmittanceCurrent !== void 0 && historyDepthCurrent !== void 0;
  const shadowTarget = context.targets.find((target) => target.name === "cloud-shadow");
  const canShadow = shadowTarget !== void 0 && shadowTarget.sampleCount === 1 && frame.shadowProjection !== void 0 && hasHistoryTargets;
  const canCompose = inputTarget !== void 0 && outputTarget !== void 0 && inputTarget.sampleCount === 1 && outputTarget.sampleCount === 1 && hasHistoryTargets;
  const transportReads = ["motion-input", { key: "depth", sampleType: "depth" }];
  const transportCacheReads = [
    "motion-input",
    "cloud-shadow",
    { key: "depth", sampleType: "depth" }
  ];
  const historyReads = [
    "motion-input",
    "cloud-history-radiance-previous",
    "cloud-history-transmittance-previous",
    "cloud-history-depth-previous",
    { key: "depth", sampleType: "depth" }
  ];
  const historyAdditionalTextures = [
    "cloud-history-radiance-previous",
    "cloud-history-transmittance-previous",
    "cloud-history-depth-previous"
  ];
  const viewParams = makeCloudViewParams(frame, frame.cache);
  const shadowParams = canShadow ? makeCloudViewParams(frame, frame.cache, 1) : void 0;
  const transportUsesShadowCache = canCompose && canShadow;
  return {
    resources: [
      {
        kind: "compute-program",
        name: CLOUD_LAYER_DENSITY_PROGRAM,
        program: {
          wgsl: CLOUD_DENSITY_COMPUTE_WGSL,
          entryPoints: ["cloud_density_cache"],
          bindings: [
            {
              label: "forgeax.cloud-layer.cache",
              entries: [
                { binding: 0, visibility: COMPUTE_STAGE, buffer: { type: "read-only-storage" } },
                { binding: 1, visibility: COMPUTE_STAGE, buffer: { type: "storage" } },
                { binding: 2, visibility: COMPUTE_STAGE, buffer: { type: "uniform" } }
              ]
            }
          ]
        }
      },
      {
        kind: "buffer",
        name: CLOUD_LAYER_DENSITY_CACHE,
        size: packedCache.byteLength,
        usage: ["storage", "copy-src"],
        data: packedCache
      },
      {
        kind: "buffer",
        name: CLOUD_LAYER_DENSITY_OUTPUT,
        size: packedCache.byteLength,
        usage: ["storage", "copy-src"]
      },
      {
        kind: "buffer",
        name: "cloud-layer-density-params",
        size: params.byteLength,
        usage: ["uniform"],
        data: params
      },
      {
        kind: "compute-bindings",
        name: CLOUD_LAYER_DENSITY_BINDINGS,
        program: CLOUD_LAYER_DENSITY_PROGRAM,
        entries: [
          { binding: 0, resource: CLOUD_LAYER_DENSITY_CACHE },
          { binding: 1, resource: CLOUD_LAYER_DENSITY_OUTPUT },
          { binding: 2, resource: "cloud-layer-density-params" }
        ]
      },
      {
        kind: "fullscreen-program",
        name: "cloud-layer-view",
        source: CLOUD_VIEW_FULLSCREEN_WGSL,
        usesView: true,
        storageBindings: [8],
        reads: historyReads,
        params: {
          byteSize: viewParams.byteLength,
          defaultValue: viewParams
        }
      },
      ...shadowParams === void 0 ? [] : [
        {
          kind: "fullscreen-program",
          name: "cloud-layer-shadow",
          source: CLOUD_VIEW_FULLSCREEN_WGSL,
          usesView: true,
          storageBindings: [8],
          reads: historyReads,
          params: {
            byteSize: shadowParams.byteLength,
            defaultValue: shadowParams
          }
        }
      ],
      ...canCompose ? [
        {
          kind: "fullscreen-program",
          name: "cloud-layer-transport",
          source: transportUsesShadowCache ? CLOUD_TRANSPORT_FULLSCREEN_WGSL : CLOUD_TRANSPORT_ANALYTIC_FULLSCREEN_WGSL,
          fragmentEntryPoint: "fs_transport",
          usesView: true,
          storageBindings: [8],
          reads: transportUsesShadowCache ? transportCacheReads : transportReads,
          params: {
            byteSize: viewParams.byteLength,
            defaultValue: viewParams
          }
        },
        {
          kind: "fullscreen-program",
          name: "cloud-layer-resolve",
          source: CLOUD_RESOLVE_FULLSCREEN_WGSL,
          usesView: true,
          reads: [
            "motion-input",
            "cloud-history-radiance-current",
            "cloud-history-transmittance-current",
            "cloud-history-depth-current",
            "cloud-history-radiance-previous",
            "cloud-history-transmittance-previous",
            "cloud-history-depth-previous",
            { key: "depth", sampleType: "depth" }
          ],
          params: {
            byteSize: viewParams.byteLength,
            defaultValue: viewParams
          }
        }
      ] : [],
      ...canCompose ? [
        {
          kind: "graphics-program",
          name: "cloud-layer-transport-pipeline",
          program: {
            shader: "cloud-layer-transport",
            vertexLayout: "none",
            colorFormats: [
              historyRadianceCurrent.format,
              historyTransmittanceCurrent.format,
              historyDepthCurrent.format
            ],
            sampleCount: 1,
            renderState: {
              depthWriteEnabled: false,
              depthCompare: "always"
            }
          }
        },
        {
          kind: "graphics-bindings",
          name: "cloud-layer-transport-view-bindings",
          program: "cloud-layer-transport-pipeline",
          values: { group: 0, view: true }
        },
        {
          kind: "graphics-bindings",
          name: "cloud-layer-transport-bindings",
          program: "cloud-layer-transport-pipeline",
          values: {
            group: 1,
            fullscreen: true,
            shader: "cloud-layer-transport",
            input: "motion-input",
            depth: "depth",
            additionalTextures: transportUsesShadowCache ? ["cloud-shadow"] : [],
            storageBuffers: [CLOUD_LAYER_DENSITY_OUTPUT]
          },
          logicalTargets: { input: "motion-input" }
        },
        {
          kind: "graphics-program",
          name: "cloud-layer-resolve-pipeline",
          program: {
            shader: "cloud-layer-resolve",
            vertexLayout: "none",
            colorFormats: [outputTarget.format],
            sampleCount: 1,
            renderState: {
              depthWriteEnabled: false,
              depthCompare: "always"
            }
          }
        },
        {
          kind: "graphics-bindings",
          name: "cloud-layer-resolve-view-bindings",
          program: "cloud-layer-resolve-pipeline",
          values: { group: 0, view: true }
        },
        {
          kind: "graphics-bindings",
          name: "cloud-layer-resolve-bindings",
          program: "cloud-layer-resolve-pipeline",
          values: {
            group: 1,
            fullscreen: true,
            shader: "cloud-layer-resolve",
            input: "motion-input",
            depth: "depth",
            additionalTextures: [
              "cloud-history-radiance-current",
              "cloud-history-transmittance-current",
              "cloud-history-depth-current",
              "cloud-history-radiance-previous",
              "cloud-history-transmittance-previous",
              "cloud-history-depth-previous"
            ]
          }
        }
      ] : [],
      ...canShadow ? [
        {
          kind: "graphics-program",
          name: "cloud-layer-shadow-pipeline",
          program: {
            shader: "cloud-layer-shadow",
            vertexLayout: "none",
            colorFormats: [shadowTarget.format],
            sampleCount: 1,
            renderState: {
              depthWriteEnabled: false,
              depthCompare: "always",
              blend: {
                color: {
                  srcFactor: "one",
                  dstFactor: "zero",
                  operation: "add"
                },
                alpha: {
                  srcFactor: "one",
                  dstFactor: "zero",
                  operation: "add"
                }
              }
            }
          }
        },
        {
          kind: "graphics-bindings",
          name: "cloud-layer-shadow-view-bindings",
          program: "cloud-layer-shadow-pipeline",
          values: { group: 0, view: true }
        },
        {
          kind: "graphics-bindings",
          name: "cloud-layer-shadow-bindings",
          program: "cloud-layer-shadow-pipeline",
          values: {
            group: 1,
            fullscreen: true,
            shader: "cloud-layer-shadow",
            input: false,
            depth: "depth",
            // The shadow branch's WGSL keeps the shared depth binding
            // shape, but its light-space path never samples scene depth.
            // Bind the renderer-owned far-depth fallback instead of
            // introducing a read-before-main graph dependency.
            depthFallback: true,
            additionalTextures: historyAdditionalTextures,
            storageBuffers: [CLOUD_LAYER_DENSITY_OUTPUT]
          }
        }
      ] : []
    ],
    passes: context.caps.compute && context.caps.storageBuffer ? [
      {
        kind: "compute",
        name: "cloud-layer-density-cache",
        program: CLOUD_LAYER_DENSITY_PROGRAM,
        bindings: CLOUD_LAYER_DENSITY_BINDINGS,
        dispatches: [
          {
            kind: "direct",
            entryPoint: "cloud_density_cache",
            workgroups: [Math.max(1, Math.ceil(cacheCount / CLOUD_WORKGROUP_SIZE))]
          }
        ]
      },
      ...canShadow ? [
        {
          kind: "raster",
          name: "cloud-layer-shadow",
          colorAttachments: [
            {
              target: "cloud-shadow",
              loadOp: "clear",
              storeOp: "store"
            }
          ],
          sampledTargets: [
            "cloud-history-radiance-previous",
            "cloud-history-transmittance-previous",
            "cloud-history-depth-previous"
          ],
          draws: [
            {
              program: "cloud-layer-shadow-pipeline",
              bindings: [
                "cloud-layer-shadow-view-bindings",
                "cloud-layer-shadow-bindings"
              ],
              vertexData: [],
              vertexLayout: "none",
              draw: { kind: "draw", vertexCount: 3, instanceCount: 1 }
            }
          ]
        }
      ] : [],
      ...canCompose ? [
        {
          kind: "raster",
          name: "cloud-layer-transport",
          colorAttachments: [
            {
              target: "cloud-history-radiance-current",
              loadOp: "clear",
              storeOp: "store"
            },
            {
              target: "cloud-history-transmittance-current",
              loadOp: "clear",
              storeOp: "store"
            },
            {
              target: "cloud-history-depth-current",
              loadOp: "clear",
              storeOp: "store"
            }
          ],
          sampledTargets: [
            "motion-input",
            "depth",
            ...transportUsesShadowCache ? ["cloud-shadow"] : []
          ],
          draws: [
            {
              program: "cloud-layer-transport-pipeline",
              bindings: [
                "cloud-layer-transport-view-bindings",
                "cloud-layer-transport-bindings"
              ],
              vertexData: [],
              vertexLayout: "none",
              draw: { kind: "draw", vertexCount: 3, instanceCount: 1 }
            }
          ]
        },
        {
          kind: "raster",
          name: "cloud-layer-resolve",
          colorAttachments: [
            {
              target: "motion-output",
              loadOp: "clear",
              storeOp: "store"
            }
          ],
          sampledTargets: [
            "motion-input",
            "depth",
            "cloud-history-radiance-current",
            "cloud-history-transmittance-current",
            "cloud-history-depth-current",
            "cloud-history-radiance-previous",
            "cloud-history-transmittance-previous",
            "cloud-history-depth-previous"
          ],
          draws: [
            {
              program: "cloud-layer-resolve-pipeline",
              bindings: [
                "cloud-layer-resolve-view-bindings",
                "cloud-layer-resolve-bindings"
              ],
              vertexData: [],
              vertexLayout: "none",
              draw: { kind: "draw", vertexCount: 3, instanceCount: 1 }
            }
          ]
        }
      ] : []
    ] : []
  };
}
function createCloudLayerFeature(options = {}) {
  let cachedSourceKey;
  let cached;
  let packedCache;
  let generation = 0;
  const histories = new CloudHistoryStore();
  let temporalResetCount = 0;
  let lastTemporalReset;
  return Object.freeze({
    identity: CLOUD_LAYER_FEATURE_IDENTITY,
    placement: "scene",
    requiredCapabilities: ["compute", "storageBuffer", "rgba16floatRenderable"],
    // Cloud programs are generated by the feature and have no user-authored
    // manifest entry to await. Use the immediate module path so first-frame
    // feature admission does not publish a transient pending-shader failure;
    // pipeline creation remains the validation boundary for this WGSL.
    shaderModuleMode: "immediate",
    extract: (context) => {
      if (options.enabled === false) {
        histories.reset();
        return ok({
          params: void 0,
          cache: void 0,
          sourceKey: void 0,
          timeSeconds: 0,
          sunDirection: void 0,
          sunRadiance: void 0,
          shadowProjection: void 0,
          temporal: void 0,
          generation,
          inspection: inspectCloudLayer({ authored: false })
        });
      }
      const world = context.worlds[context.owner];
      if (world === void 0) {
        histories.reset();
        return ok({
          params: void 0,
          cache: void 0,
          sourceKey: void 0,
          timeSeconds: 0,
          sunDirection: void 0,
          sunRadiance: void 0,
          shadowProjection: void 0,
          temporal: void 0,
          generation,
          inspection: inspectCloudLayer({ authored: false })
        });
      }
      const cloud = context.frame?.cloudLayer;
      const capability = context.caps === void 0 ? void 0 : cloudCapabilitiesFromRhi(context.caps);
      if (cloud === void 0) {
        histories.reset();
        return ok({
          params: void 0,
          cache: void 0,
          sourceKey: void 0,
          timeSeconds: 0,
          sunDirection: void 0,
          sunRadiance: void 0,
          shadowProjection: void 0,
          temporal: void 0,
          generation,
          inspection: inspectCloudLayer({
            authored: false,
            ...capability === void 0 ? {} : { capability }
          })
        });
      }
      const formationKey = cloudLayerFormationKey(cloud.params);
      if (cached === void 0 || cachedSourceKey !== formationKey) {
        cached = buildCloudDensityCache(cloud.params);
        packedCache = packCloudDensityCache(cached);
        cachedSourceKey = formationKey;
        generation += 1;
      }
      const view = context.frame?.view;
      const shadowProjection = view === void 0 || cloud.sunDirection === void 0 ? void 0 : createCloudShadowProjection({
        center: view.shadowAnchor ?? view.cameraPosition,
        sunDirection: cloud.sunDirection,
        range: cloud.params.shadowRange,
        resolution: cloudShadowResolutionForQuality(cloud.params.quality)
      });
      const temporalSignature = view === void 0 ? void 0 : {
        sourceKey: cloud.sourceKey,
        viewId: view.identity,
        authoringGeneration: generation,
        cloudShadowRevision: shadowProjection?.revision ?? 0,
        cameraRevision: view.cameraRevision,
        deviceGeneration: view.deviceGeneration,
        width: view.width,
        height: view.height,
        timeSeconds: cloud.worldTimeSeconds,
        quality: cloud.params.quality,
        ...view.sceneDepthVersion === void 0 ? {} : { sceneDepthVersion: view.sceneDepthVersion }
      };
      const temporal = temporalSignature === void 0 ? void 0 : (() => {
        const decision = histories.begin(temporalSignature, {
          ...view?.cameraCut === void 0 ? {} : { cameraCut: view.cameraCut },
          ...view?.recovery === void 0 ? {} : { recovery: view.recovery }
        });
        const history = decision.history ?? createCloudHistory(temporalSignature, generation, false);
        return Object.freeze({
          signature: temporalSignature,
          history,
          reset: decision.reset,
          reasons: decision.reasons
        });
      })();
      const resourceFacts = inspectCloudLayerResources({
        generation,
        cache: cached,
        ...shadowProjection === void 0 ? {} : { shadow: shadowProjection },
        ...temporal?.history === void 0 ? {} : { history: temporal.history }
      });
      const temporalReset = temporal?.reasons.at(-1);
      if (temporal?.reset === true) temporalResetCount += 1;
      if (temporalReset !== void 0) lastTemporalReset = temporalReset;
      return ok({
        params: cloud.params,
        cache: cached,
        sourceKey: cloud.sourceKey,
        timeSeconds: cloud.worldTimeSeconds,
        sunDirection: cloud.sunDirection,
        sunRadiance: cloud.sunRadiance,
        shadowProjection,
        temporal,
        generation,
        inspection: inspectCloudLayer({
          authored: true,
          sourceKey: cloud.sourceKey,
          generation,
          resourceFacts,
          ...shadowProjection === void 0 ? {} : { shadowRevision: shadowProjection.revision },
          ...temporal === void 0 ? {} : {
            temporalResets: temporalResetCount,
            ...lastTemporalReset === void 0 ? {} : { lastTemporalReset }
          },
          ...capability === void 0 ? {} : { capability },
          budget: {
            quality: cloud.params.quality,
            reason: "physical GPU timing and residency receipts are unavailable until a prepared adapter submits them"
          }
        })
      });
    },
    onFrameSubmitted: (frame) => {
      if (frame.temporal?.history !== void 0) {
        histories.commit(
          frame.temporal.signature,
          createCloudHistory(frame.temporal.signature, frame.generation, true)
        );
      }
    },
    onFrameAborted: (frame) => {
    },
    plan: (frame, context) => {
      if (frame.cache === void 0 || packedCache === void 0 || frame.params === void 0) {
        return ok({ resources: [], passes: [] });
      }
      return ok(planCloudDensity(frame, packedCache, context));
    }
  });
}
var ERROR_POLICY = {
  "surface-abi-missing": {
    expected: "a producer-published single-layer-medium ABI is present",
    hint: "compose, reflect, and publish the Surface model before preparing the draw"
  },
  "surface-pass-missing": {
    expected: "the published model contains both nearest-layer and color passes",
    hint: "recook the complete model publication; do not synthesize a missing pass"
  },
  "surface-producer-not-ready": {
    expected: "scene-index, resources, and dynamic input facts are ready for the published model",
    hint: "repair the owning producer publication and retry; capability fallback does not cover stale assets"
  },
  "surface-generation-stale": {
    expected: "prepared Surface facts belong to the current device generation",
    hint: "rebuild the prepared surface resources for the current device generation"
  }
};
function failure(code, pass, owner, actual) {
  return {
    code,
    expected: ERROR_POLICY[code].expected,
    hint: ERROR_POLICY[code].hint,
    pass,
    owner,
    ...actual === void 0 ? {} : { actual }
  };
}
function capabilityFallback(caps) {
  if (!caps.compute) return "compute";
  if (!caps.storageBuffer) return "storageBuffer";
  if (!caps.indirectDrawing) return "indirectDrawing";
  return void 0;
}
function admitSingleLayerMediumSubmission(input) {
  const firstPass = "nearest-layer";
  const surface = input.abi.surface;
  if (surface === void 0 || surface.model !== "single-layer-medium") {
    return err(failure("surface-abi-missing", firstPass, "surface-producer", surface));
  }
  if (!surface.passes.includes("nearest-layer") || !surface.passes.includes("color")) {
    return err(failure("surface-pass-missing", firstPass, "surface-producer", surface.passes));
  }
  if (input.deviceGeneration !== input.preparedDeviceGeneration) {
    return err(
      failure("surface-generation-stale", firstPass, "render-generation", {
        deviceGeneration: input.deviceGeneration,
        preparedDeviceGeneration: input.preparedDeviceGeneration
      })
    );
  }
  const dynamicRequired = surface.dynamicInput !== void 0;
  if (!input.sceneIndexReady || !input.resourcesReady || dynamicRequired && !input.dynamicInputReady) {
    return err(
      failure("surface-producer-not-ready", firstPass, "surface-producer", {
        sceneIndexReady: input.sceneIndexReady,
        resourcesReady: input.resourcesReady,
        dynamicInputReady: input.dynamicInputReady
      })
    );
  }
  const fallback = capabilityFallback(input.caps);
  const admitted = fallback === void 0 ? [
    { pass: firstPass, lane: "gpu-driven" },
    { pass: "color", lane: "gpu-driven" }
  ] : [
    { pass: firstPass, lane: "direct", reason: fallback },
    { pass: "color", lane: "direct", reason: fallback }
  ];
  return ok({
    model: "single-layer-medium",
    lane: fallback === void 0 ? "gpu-driven" : "direct",
    passes: admitted,
    deviceGeneration: input.deviceGeneration
  });
}
function invalidStyle(input, component, field, value, expected) {
  return err(new PointsLinesInvalidStyleError({ entity: input.entity, component, field, value, expected }));
}
function topologyMismatch(input, submesh, expected, actual) {
  return err(new PointsLinesTopologyMismatchError({ entity: input.entity, submesh, expected, actual }));
}
function checkStyle(input) {
  const hasPoints = input.points !== void 0;
  const hasLines = input.lines !== void 0;
  if (hasPoints && hasLines) {
    return invalidStyle(
      input,
      "Points/Lines",
      "components",
      "Points + Lines",
      "exactly one style component"
    );
  }
  if (!hasPoints && !hasLines) {
    return invalidStyle(input, "Points/Lines", "components", void 0, "one style component");
  }
  if (hasPoints) {
    const sizePx = input.points?.sizePx ?? 4;
    const shapeValue = input.points?.shape ?? PointShapeValue.square;
    const shape = pointShapeFromU32(shapeValue);
    if (!Number.isFinite(sizePx) || sizePx <= 0) {
      return invalidStyle(input, "Points", "sizePx", sizePx, "finite sizePx > 0");
    }
    if (shape === void 0) {
      return invalidStyle(input, "Points", "shape", shapeValue, "shape is 'square' or 'circle'");
    }
    return ok({ component: "Points", shape, sizePx });
  }
  const widthPx = input.lines?.widthPx ?? 1;
  if (!Number.isFinite(widthPx) || widthPx <= 0) {
    return invalidStyle(input, "Lines", "widthPx", widthPx, "finite widthPx > 0");
  }
  return ok({ component: "Lines", widthPx });
}
function checkTopology(input, component) {
  const expected = component === "Points" ? "point-list" : "line-list";
  let pointCount = 0;
  let segmentCount = 0;
  const acceptedSubmeshes = [];
  let sawNonEmpty = false;
  for (const [submeshIndex, submesh] of input.mesh.submeshes.entries()) {
    const indexed = input.mesh.indices !== void 0 && submesh.indexCount > 0;
    const elementCount = indexed ? submesh.indexCount : submesh.vertexCount;
    if (elementCount === 0) continue;
    sawNonEmpty = true;
    if (component === "Lines" && submesh.topology === "line-strip") {
      return err(
        new PointsLinesStyleUnsupportedError({
          lane: "admission",
          field: "topology",
          member: "line-strip",
          supported: ["line-list"]
        })
      );
    }
    if (submesh.topology !== expected) {
      return topologyMismatch(input, submeshIndex, expected, submesh.topology);
    }
    if (component === "Lines" && elementCount % 2 !== 0) {
      return topologyMismatch(input, submeshIndex, "line-list pairs", "line-list odd tail");
    }
    acceptedSubmeshes.push(submeshIndex);
    if (component === "Points") pointCount += elementCount;
    else segmentCount += elementCount / 2;
  }
  if (!sawNonEmpty) return topologyMismatch(input, 0, expected, "empty-range");
  return ok({ pointCount, segmentCount, submeshes: acceptedSubmeshes });
}
function checkMaterial(input) {
  const passes = input.material.passes ?? [];
  const unlitModules = /* @__PURE__ */ new Set(["forgeax_material::unlit", "forgeax::default-unlit"]);
  if (passes.length !== 1 || passes[0] === void 0) {
    const pass2 = passes.find(
      (candidate) => candidate.name === "deferred" || candidate.name === "shadow-caster"
    ) ?? passes[0];
    return err(
      new PointsLinesMaterialUnsupportedError({
        entity: input.entity,
        material: input.materialId ?? "<anonymous>",
        pass: pass2?.name ?? "<empty>",
        module: pass2?.program.module ?? "<empty>",
        reason: "points-lines admission requires one unlit forward pass"
      })
    );
  }
  const pass = passes[0];
  const lightMode = pass.renderState?.tags?.LightMode;
  if (!unlitModules.has(pass.program.module) || pass.name !== "forward" || lightMode === "ShadowCaster") {
    return err(
      new PointsLinesMaterialUnsupportedError({
        entity: input.entity,
        material: input.materialId ?? "<anonymous>",
        pass: pass.name,
        module: pass.program.module,
        reason: "points-lines admission requires an engine-owned unlit forward pass"
      })
    );
  }
  return ok(void 0);
}
function admitPointsLines(input) {
  const style = checkStyle(input);
  if (!style.ok) return style;
  const topology = checkTopology(input, style.value.component);
  if (!topology.ok) return topology;
  const material = checkMaterial(input);
  if (!material.ok) return material;
  if (style.value.component === "Points" && input.limits?.maxPoints !== void 0) {
    if (topology.value.pointCount > input.limits.maxPoints) {
      return err(
        new PointsLinesBudgetExceededError({
          lane: "admission",
          requested: topology.value.pointCount,
          limit: input.limits.maxPoints,
          unit: "points"
        })
      );
    }
  }
  if (style.value.component === "Lines" && input.limits?.maxSegments !== void 0) {
    if (topology.value.segmentCount > input.limits.maxSegments) {
      return err(
        new PointsLinesBudgetExceededError({
          lane: "admission",
          requested: topology.value.segmentCount,
          limit: input.limits.maxSegments,
          unit: "segments"
        })
      );
    }
  }
  return ok({ ...style.value, ...topology.value });
}

// src/point-shadow-inspection.ts
function inspectPointShadow(snapshots, shadowAtlasCapacity) {
  const requested = snapshots.length;
  const admitted = snapshots.reduce(
    (count, snapshot) => snapshot.shadowAtlasLayer >= 0 && snapshot.shadowAtlasLayer < shadowAtlasCapacity ? count + 1 : count,
    0
  );
  const status = requested === 0 ? "inactive" : requested > shadowAtlasCapacity || admitted !== requested ? "over-budget" : "ready";
  return Object.freeze({
    status,
    requested,
    admitted,
    // A point shadow only samples an atlas after it owns an atlas layer. Keep
    // these names explicit for AI diagnostics while deriving both from the
    // one layer projection above.
    shadowed: admitted,
    shadowAtlasOccupancy: admitted,
    shadowAtlasCapacity
  });
}
var SSR_FORMAT_PROFILE = "r32float-mip-sampled-storage";
var SSR_FORMAT_STAGES = Object.freeze([
  "texture-create",
  "mip-view",
  "sampled-storage-bind-group",
  "pipeline-bind",
  "finish",
  "submit",
  "completion",
  "readback"
]);
var ZERO_WORK = Object.freeze({
  attachmentCount: 0,
  passCount: 0,
  bindingCount: 0,
  resourceCount: 0,
  historyCount: 0,
  temporalDemand: 0
});
var ADMITTED_WORK = Object.freeze({
  attachmentCount: 1,
  passCount: 1,
  bindingCount: 1,
  resourceCount: 1,
  historyCount: 0,
  temporalDemand: 0
});
var ZERO_BUDGET = Object.freeze({
  probeExecutions: 0,
  resetCount: 0,
  rebuildCount: 0
});
var ADMITTED_BUDGET = Object.freeze({
  probeExecutions: 1,
  resetCount: 0,
  rebuildCount: 0
});
function identityFieldMismatch(expected, actual) {
  for (const field of ["sourceHead", "sourceTree", "lockSha256", "buildSha256"]) {
    if (expected[field] !== actual[field]) return field;
  }
  return void 0;
}
function blocked(identity, failure3, generation = 0) {
  return Object.freeze({
    status: "fallback-only",
    identity,
    generation,
    work: ZERO_WORK,
    budget: ZERO_BUDGET,
    failure: failure3
  });
}
function failure2(code, owner, hint, detail = {}) {
  const action = recoveryActionFor(code);
  return Object.freeze({
    code,
    expected: "all producer, format, and temporal receipts share one admitted identity",
    hint,
    detail: Object.freeze({ owner, action, ...detail })
  });
}
function recoveryActionFor(code) {
  switch (code) {
    case "ssr-reflection-fallback-unavailable":
    case "ssr-receipt-identity-mismatch":
      return "rebuild";
    case "ssr-not-requested":
    case "ssr-format-unavailable":
    case "ssr-temporal-unavailable":
    case "ssr-receipt-stale":
      return "retry";
  }
}
function receiptFailure(input, receipt, owner) {
  const field = identityFieldMismatch(input.identity, receipt.identity);
  if (field === void 0) return void 0;
  return blocked(
    input.identity,
    failure2("ssr-receipt-identity-mismatch", owner, "rebuild the owner receipt for this identity", {
      identityField: field
    })
  );
}
function validFallback(receipt) {
  return receipt !== void 0 && receipt.candidateVisible === false && Number.isFinite(receipt.coverage) && receipt.coverage >= 0 && receipt.coverage <= 1 && (receipt.sourceKey === void 0 || receipt.sourceKey.length > 0) && (receipt.extent === void 0 || receipt.extent.length === 3 && receipt.extent.every((value) => Number.isFinite(value) && value > 0)) && Number.isInteger(receipt.sourceGeneration) && receipt.sourceGeneration >= 0 && Number.isInteger(receipt.projectionGeneration) && receipt.projectionGeneration >= 0 && Number.isInteger(receipt.deviceGeneration) && receipt.deviceGeneration >= 0 && receipt.brdfSignature === "standard-pbr-ibl-v1" && (receipt.source === "probe" && (receipt.state === "active" || receipt.state === "lkg") || receipt.source === "skylight" && (receipt.state === "active" || receipt.state === "lkg") || receipt.source === "neutral" && receipt.state === "neutral");
}
function validFormat(receipt) {
  if (receipt?.profile !== SSR_FORMAT_PROFILE || receipt.verdict !== "admitted" || receipt.evidence !== "real" || !Number.isInteger(receipt.deviceGeneration) || receipt.deviceGeneration < 0) {
    return false;
  }
  if (!SSR_FORMAT_STAGES.every(
    (stage) => receipt.stages.some((entry) => entry.stage === stage && entry.verdict === "admitted")
  )) {
    return false;
  }
  return validateR32FloatReceipt(receipt).ok;
}
function validTemporal(receipt) {
  return receipt?.successfulSubmit === true && Number.isInteger(receipt.generation) && receipt.generation >= 0;
}
function admitSsrM0(input) {
  if (!input.requested) {
    return blocked(
      input.identity,
      failure2("ssr-not-requested", "consumer", "request SSR before evaluating M0 admission")
    );
  }
  if (input.reflectionFallback === void 0) {
    return blocked(
      input.identity,
      failure2("ssr-reflection-fallback-unavailable", "producer", "use LKG, Skylight, or neutral")
    );
  }
  const fallbackIdentityFailure = receiptFailure(input, input.reflectionFallback, "producer");
  if (fallbackIdentityFailure !== void 0) return fallbackIdentityFailure;
  if (!validFallback(input.reflectionFallback)) {
    return blocked(
      input.identity,
      failure2(
        "ssr-reflection-fallback-unavailable",
        "producer",
        "inspect and rebuild the producer receipt"
      ),
      input.reflectionFallback.projectionGeneration
    );
  }
  if (input.format === void 0) {
    return blocked(
      input.identity,
      failure2("ssr-format-unavailable", "format", "probe the exact format profile for this device"),
      input.reflectionFallback.projectionGeneration
    );
  }
  const formatIdentityFailure = receiptFailure(input, input.format, "format");
  if (formatIdentityFailure !== void 0) return formatIdentityFailure;
  if (!validFormat(input.format)) {
    return blocked(
      input.identity,
      failure2("ssr-format-unavailable", "format", "complete the full r32float profile probe"),
      input.reflectionFallback.projectionGeneration
    );
  }
  const temporalIdentityFailure = input.temporal === void 0 ? void 0 : receiptFailure(input, input.temporal, "temporal");
  if (temporalIdentityFailure !== void 0) return temporalIdentityFailure;
  if (input.temporal !== void 0 && !validTemporal(input.temporal)) {
    return blocked(
      input.identity,
      failure2("ssr-temporal-unavailable", "temporal", "inspect and rebuild the temporal receipt"),
      input.reflectionFallback.projectionGeneration
    );
  }
  if (input.previousGeneration !== void 0 && input.previousGeneration !== input.reflectionFallback.projectionGeneration) {
    return blocked(
      input.identity,
      failure2(
        "ssr-receipt-stale",
        "consumer",
        "discard stale completion and reinspect the owners",
        {
          generation: input.reflectionFallback.projectionGeneration
        }
      ),
      input.reflectionFallback.projectionGeneration
    );
  }
  return Object.freeze({
    status: "admitted",
    identity: input.identity,
    generation: input.reflectionFallback.projectionGeneration,
    work: ADMITTED_WORK,
    budget: ADMITTED_BUDGET
  });
}
function projectSsrDependencies(input) {
  const identity = input.identity;
  const reflectionFallback = identity === void 0 || input.reflectionFallback?.identity === void 0 ? void 0 : input.reflectionFallback;
  const format = identity === void 0 || input.format === void 0 ? void 0 : { ...input.format, identity };
  const temporal = identity === void 0 || input.temporal === void 0 ? void 0 : { identity, ...input.temporal };
  const admission = identity === void 0 ? blocked(
    void 0,
    failure2(
      input.requested ? "ssr-receipt-identity-mismatch" : "ssr-not-requested",
      "consumer",
      input.requested ? "bind the exact source, tree, lock, and build identity before admission" : "request SSR before evaluating M0 admission",
      input.requested ? { identityField: "sourceHead" } : {}
    )
  ) : admitSsrM0({
    requested: input.requested,
    identity,
    ...reflectionFallback === void 0 ? {} : { reflectionFallback },
    ...format === void 0 ? {} : { format },
    ...temporal === void 0 ? {} : { temporal },
    ...input.previousGeneration === void 0 ? {} : { previousGeneration: input.previousGeneration }
  });
  return Object.freeze({
    status: admission.status,
    identity,
    requested: input.requested,
    reflectionFallback: input.reflectionFallback,
    format,
    temporal,
    admission,
    work: admission.work,
    budget: admission.budget,
    failure: admission.failure
  });
}
function zeroSsrAdmissionWork() {
  return ZERO_WORK;
}
function resolveSsrAdmissionGeneration(previousGeneration, nextGeneration) {
  return {
    changed: previousGeneration !== void 0 && nextGeneration !== void 0 && previousGeneration !== nextGeneration,
    generation: nextGeneration
  };
}
var ZERO_SPATIAL_WORK = Object.freeze({
  attachmentCount: 0,
  passCount: 0,
  bindingCount: 0,
  resourceCount: 0,
  historyCount: 0,
  temporalDemand: 0
});
var ADMITTED_SPATIAL_WORK = Object.freeze({
  attachmentCount: 3,
  passCount: 4,
  bindingCount: 4,
  resourceCount: 3,
  historyCount: 0,
  temporalDemand: 0
});
function configRange(field, viewRange, maxDistance) {
  switch (field) {
    case "maxDistance":
      return { min: 0, minInclusive: false, max: viewRange, maxInclusive: true };
    case "thickness":
      return { min: 0, minInclusive: false, max: maxDistance, maxInclusive: true };
    case "maxRoughness":
      return { min: 0, minInclusive: true, max: 1, maxInclusive: true };
  }
}
function configError(field, value, range) {
  const left = range.minInclusive ? "[" : "(";
  const right = range.maxInclusive ? "]" : ")";
  return Object.freeze({
    code: "ssr-config-invalid",
    expected: `finite ${field} in ${left}${range.min}, ${range.max}${right}`,
    hint: `set ${field} to a finite value inside the reported range before retrying`,
    detail: Object.freeze({ field, value, range: Object.freeze(range) })
  });
}
function validateScreenSpaceReflection(config, input) {
  const viewRange = input.viewRange;
  if (!Number.isFinite(viewRange) || viewRange <= 0) {
    return err(
      configError("maxDistance", config.maxDistance, configRange("maxDistance", viewRange, 0))
    );
  }
  if (!Number.isFinite(config.maxDistance) || config.maxDistance <= 0 || config.maxDistance > viewRange) {
    return err(
      configError(
        "maxDistance",
        config.maxDistance,
        configRange("maxDistance", viewRange, config.maxDistance)
      )
    );
  }
  if (!Number.isFinite(config.thickness) || config.thickness <= 0 || config.thickness > config.maxDistance) {
    return err(
      configError(
        "thickness",
        config.thickness,
        configRange("thickness", viewRange, config.maxDistance)
      )
    );
  }
  if (!Number.isFinite(config.maxRoughness) || config.maxRoughness < 0 || config.maxRoughness > 1) {
    return err(
      configError(
        "maxRoughness",
        config.maxRoughness,
        configRange("maxRoughness", viewRange, config.maxDistance)
      )
    );
  }
  return ok(
    Object.freeze({
      maxDistance: config.maxDistance,
      thickness: config.thickness,
      maxRoughness: config.maxRoughness
    })
  );
}
function unavailable(lane, reason, required, actual) {
  const recovery = reason === "lane-unsupported" || reason === "projection-unsupported" ? "select a perspective clustered or deferred Standard lane" : reason === "reflection-fallback-unavailable" ? "repair the submitted reflection fallback owner receipt" : reason === "temporal-unavailable" ? "submit the matching temporal-v1 producer receipt" : reason === "recovery-unavailable" ? "complete device and producer recovery before retrying" : "restore the required scene, capability, or format input before retrying";
  return Object.freeze({
    code: "ssr-unavailable",
    expected: "SSR spatial admission has a complete Standard input and capability set",
    hint: recovery,
    detail: Object.freeze({
      lane,
      reason,
      required: Object.freeze([...required]),
      actual: Object.freeze({ ...actual }),
      recovery
    })
  });
}
function unavailableResult(lane, viewRange, failure3) {
  return Object.freeze({
    status: "fallback-only",
    lane,
    config: void 0,
    viewRange,
    work: ZERO_SPATIAL_WORK,
    failure: failure3
  });
}
function admitSsrSpatial(input) {
  const camera = input.camera;
  const environment = input.environment;
  const viewRange = camera.far - camera.near;
  const config = camera.screenSpaceReflection;
  if (config === void 0) {
    return Object.freeze({
      status: "not-requested",
      lane: environment.lane,
      config: void 0,
      viewRange,
      work: ZERO_SPATIAL_WORK
    });
  }
  const valid = validateScreenSpaceReflection(config, { viewRange });
  if (!valid.ok) {
    return Object.freeze({
      status: "fallback-only",
      lane: environment.lane,
      config,
      viewRange,
      work: ZERO_SPATIAL_WORK,
      failure: valid.error
    });
  }
  if (environment.m0.status !== "admitted") {
    return unavailableResult(
      environment.lane,
      viewRange,
      unavailable(
        environment.lane,
        "reflection-fallback-unavailable",
        ["admitted M0 dependency receipt"],
        { m0: false }
      )
    );
  }
  if (environment.lane !== "clustered" && environment.lane !== "deferred") {
    return unavailableResult(
      environment.lane,
      viewRange,
      unavailable(environment.lane, "lane-unsupported", ["clustered or deferred Standard lane"], {
        lane: environment.lane
      })
    );
  }
  if (camera.projection !== "perspective") {
    return unavailableResult(
      environment.lane,
      viewRange,
      unavailable(environment.lane, "projection-unsupported", ["perspective camera"], {
        projection: camera.projection
      })
    );
  }
  if (!environment.sceneInputs) {
    return unavailableResult(
      environment.lane,
      viewRange,
      unavailable(
        environment.lane,
        "scene-input-unavailable",
        ["deferred Standard scene/material/fallback inputs"],
        { sceneInputs: false }
      )
    );
  }
  if (!environment.temporal) {
    return unavailableResult(
      environment.lane,
      viewRange,
      unavailable(environment.lane, "temporal-unavailable", ["temporal-v1"], { temporal: false })
    );
  }
  if (!environment.reflectionFallback) {
    return unavailableResult(
      environment.lane,
      viewRange,
      unavailable(
        environment.lane,
        "reflection-fallback-unavailable",
        ["submitted BRDF-projected fallback"],
        { reflectionFallback: false }
      )
    );
  }
  if (environment.recovery === false) {
    return unavailableResult(
      environment.lane,
      viewRange,
      unavailable(environment.lane, "recovery-unavailable", ["ready device and owners"], {
        recovery: false
      })
    );
  }
  const capabilities = environment.capabilities;
  if (!capabilities.compute || !capabilities.storageTexture || !capabilities.rgba16floatRenderable) {
    return unavailableResult(
      environment.lane,
      viewRange,
      unavailable(
        environment.lane,
        "capability-unavailable",
        ["compute", "storageTexture", "rgba16floatRenderable"],
        {
          compute: capabilities.compute,
          storageTexture: capabilities.storageTexture,
          rgba16floatRenderable: capabilities.rgba16floatRenderable
        }
      )
    );
  }
  if (!capabilities.r32floatSampledStorage) {
    return unavailableResult(
      environment.lane,
      viewRange,
      unavailable(
        environment.lane,
        "format-unavailable",
        ["r32float sampled and storage mip chain"],
        { r32floatSampledStorage: false }
      )
    );
  }
  return Object.freeze({
    status: "admitted",
    lane: environment.lane,
    config: valid.value,
    viewRange,
    work: ADMITTED_SPATIAL_WORK
  });
}

// src/volume/inspection.ts
function resourceStage2(input) {
  if (!input.authored || input.recovery === void 0) return "none";
  if (input.recovery.status === "candidate") return "candidate";
  if (input.recovery.status === "recovering") return "recovering";
  if (input.recovery.status === "degraded") return "lkg";
  return "accepted";
}
function inspectVolumetricFog(input) {
  const recovery = input.recovery;
  const status = !input.authored ? "off" : input.capability === "unavailable" ? "unavailable" : input.degraded === true || recovery?.status === "degraded" ? "degraded" : "available";
  return Object.freeze({
    ownerCount: 0,
    status,
    resourceStage: resourceStage2(input),
    guid: recovery?.guid,
    generation: recovery?.generation,
    digest: input.acceptedDigest,
    candidateGeneration: recovery?.candidateGeneration,
    candidateDigest: recovery?.candidateDigest,
    lkgGeneration: recovery?.lkgGeneration,
    candidateFailure: recovery?.candidateFailure,
    deviceEpoch: recovery?.deviceEpoch ?? 0,
    format: input.format,
    passCount: input.passCount ?? 0,
    sampleCount: input.sampleCount ?? 0,
    memoryBytes: input.memoryBytes ?? 0,
    resourceFacts: input.resourceFacts,
    selectedLight: recovery?.selectedLight,
    candidateSelectedLight: recovery?.candidateSelectedLight
  });
}
var ERROR_POLICY2 = {
  "invalid-schema": {
    expected: "the dynamic input schema has one derived bounded record layout",
    hint: "repair the root MaterialSurface dynamicInput declaration and recook it"
  },
  "invalid-record": {
    expected: "each dynamic record matches the derived scalar/vector fields",
    hint: "write finite values using the field names and types declared by the material"
  },
  "range-overflow": {
    expected: "the instance range stays within the declared read-only page",
    hint: "reduce the range or increase the producer page budget before publication"
  },
  "domain-overflow": {
    expected: "the page stays within its declared number of producer domains",
    hint: "reuse an existing domain or publish a larger bounded declaration"
  },
  "not-uploaded": {
    expected: "the current page revision was uploaded before frame consumption",
    hint: "submit the page upload receipt and retry the same frame"
  },
  "stale-generation": {
    expected: "the range, upload, and device use one current page generation",
    hint: "discard stale addresses and rebuild the producer projection for the current device"
  },
  released: {
    expected: "the read-only page is still attached to its owning Render lifecycle",
    hint: "create a new page after releasing the old owner"
  }
};
var DynamicInputError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(code, detail) {
    super(`${code}: ${ERROR_POLICY2[code].expected}`);
    this.name = "DynamicInputError";
    this.code = code;
    this.expected = ERROR_POLICY2[code].expected;
    this.hint = ERROR_POLICY2[code].hint;
    this.detail = Object.freeze({ ...detail });
  }
};
function alignRange(ranges, start, end) {
  if (start >= end) return;
  let index = 0;
  while (index < ranges.length && (ranges[index]?.byteEnd ?? 0) < start) index += 1;
  while (index < ranges.length) {
    const existing = ranges[index];
    if (existing === void 0 || existing.byteStart > end) break;
    start = Math.min(start, existing.byteStart);
    end = Math.max(end, existing.byteEnd);
    ranges.splice(index, 1);
  }
  ranges.splice(index, 0, { byteStart: start, byteEnd: end });
}
function fieldWidth(type) {
  switch (type) {
    case "f32":
    case "u32":
      return 1;
    case "vec2<f32>":
      return 2;
    case "vec3<f32>":
      return 3;
    case "vec4<f32>":
      return 4;
  }
}
function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}
function invalid3(code, operation, expected, actual, field, page) {
  return new DynamicInputError(code, {
    operation,
    expected,
    ...actual === void 0 ? {} : { actual },
    ...field === void 0 ? {} : { field },
    ...page === void 0 ? {} : page
  });
}
var ReadonlyDynamicInputPage = class _ReadonlyDynamicInputPage {
  sourceId;
  pageId;
  schema;
  layout;
  bytes;
  contentRevisionValue = 1;
  bufferGenerationValue = 1;
  deviceGenerationValue = 1;
  uploadedRevisionValue = 0;
  lastUploadedBytesValue = 0;
  released = false;
  ownedRanges = /* @__PURE__ */ new WeakSet();
  ownedUploads = /* @__PURE__ */ new WeakSet();
  dirty = [
    {
      byteStart: 0,
      byteEnd: 0
    }
  ];
  domains = /* @__PURE__ */ new Map();
  constructor(sourceId, pageId, schema, layout) {
    this.sourceId = sourceId;
    this.pageId = pageId;
    this.schema = schema;
    this.layout = layout;
    this.bytes = new Uint8Array(schema.maxPageBytes);
    this.dirty.length = 0;
  }
  static create(input) {
    if (input.sourceId.length === 0 || !Number.isSafeInteger(input.pageId) || input.pageId < 0) {
      return err(
        invalid3(
          "invalid-schema",
          "create",
          "sourceId is non-empty and pageId is non-negative",
          input.pageId
        )
      );
    }
    const layout = deriveMaterialDynamicInputLayout(input.schema);
    if (!layout.ok) {
      return err(
        invalid3(
          "invalid-schema",
          "create",
          layout.error.expected,
          layout.error.actual,
          layout.error.field
        )
      );
    }
    return ok(
      new _ReadonlyDynamicInputPage(input.sourceId, input.pageId, input.schema, layout.value)
    );
  }
  get contentRevision() {
    return this.contentRevisionValue;
  }
  get bufferGeneration() {
    return this.bufferGenerationValue;
  }
  get deviceGeneration() {
    return this.deviceGenerationValue;
  }
  get uploadedRevision() {
    return this.uploadedRevisionValue;
  }
  get lastUploadedBytes() {
    return this.lastUploadedBytesValue;
  }
  /** Write one complete record and mark only its byte interval dirty. */
  writeRecord(index, values) {
    const live = this.assertLive("write");
    if (!live.ok) return live;
    if (!Number.isSafeInteger(index) || index < 0 || index >= this.schema.maxRecords) {
      return err(
        invalid3(
          "range-overflow",
          "write",
          `record index is within [0, ${this.schema.maxRecords})`,
          index,
          "index",
          this
        )
      );
    }
    const recordOffset = index * this.layout.stride;
    const encoded = new Uint8Array(this.layout.stride);
    const view = new DataView(encoded.buffer, encoded.byteOffset, encoded.byteLength);
    for (const field of this.layout.fields) {
      const value = values[field.name];
      if (value === void 0) {
        return err(
          invalid3(
            "invalid-record",
            "write",
            `record contains field ${field.name}`,
            value,
            field.name,
            this
          )
        );
      }
      const width = fieldWidth(field.type);
      const numbers = typeof value === "number" ? [value] : value;
      if (numbers.length !== width || numbers.some((candidate) => !finiteNumber(candidate))) {
        return err(
          invalid3(
            "invalid-record",
            "write",
            `${field.name} is a finite ${field.type}`,
            value,
            field.name,
            this
          )
        );
      }
      if (field.type === "u32" && (!Number.isInteger(numbers[0]) || numbers[0] < 0 || numbers[0] > 4294967295)) {
        return err(
          invalid3(
            "invalid-record",
            "write",
            `${field.name} is an unsigned 32-bit integer`,
            value,
            field.name,
            this
          )
        );
      }
      for (const [component, number] of numbers.entries()) {
        const offset = field.offset + component * 4;
        if (field.type === "u32") view.setUint32(offset, number, true);
        else view.setFloat32(offset, number, true);
      }
    }
    this.bytes.set(encoded, recordOffset);
    this.contentRevisionValue += 1;
    alignRange(this.dirty, recordOffset, recordOffset + this.layout.stride);
    return ok(this.contentRevisionValue);
  }
  /** Reserve one explicit instance range; no skin address field is involved. */
  reserveRange(input) {
    const live = this.assertLive("reserve");
    if (!live.ok) return live;
    if (input.domain.length === 0) {
      return err(
        invalid3(
          "domain-overflow",
          "reserve",
          "domain is a non-empty identity",
          input.domain,
          "domain",
          this
        )
      );
    }
    if (!this.domains.has(input.domain) && this.domains.size >= this.schema.maxDomains) {
      return err(
        invalid3(
          "domain-overflow",
          "reserve",
          `at most ${this.schema.maxDomains} domains are active`,
          this.domains.size + 1,
          "domain",
          this
        )
      );
    }
    if (!Number.isSafeInteger(input.instanceIndex) || input.instanceIndex < 0 || input.instanceIndex > 4294967295) {
      return err(
        invalid3(
          "range-overflow",
          "reserve",
          "instance index is an exact unsigned 32-bit integer",
          input.instanceIndex,
          "instanceIndex",
          this
        )
      );
    }
    if (input.member.worldIdentity.length === 0 || !Number.isSafeInteger(input.member.entityKey) || input.member.entityKey < 0 || input.member.entityKey > 4294967295 || !Number.isSafeInteger(input.member.drawItemIndex) || input.member.drawItemIndex < 0 || input.member.drawItemIndex > 4294967295 || !Number.isSafeInteger(input.member.instanceOrdinal) || input.member.instanceOrdinal < 0 || input.member.instanceOrdinal > 4294967295) {
      return err(
        invalid3(
          "range-overflow",
          "reserve",
          "member is a stable World identity plus exact unsigned 32-bit entity, draw-item, and instance identities",
          input.member,
          "member",
          this
        )
      );
    }
    if (!Number.isSafeInteger(input.recordStart) || !Number.isSafeInteger(input.recordCount) || input.recordStart < 0 || input.recordCount <= 0 || input.recordStart + input.recordCount > this.schema.maxRecords) {
      return err(
        invalid3(
          "range-overflow",
          "reserve",
          "record range and instance index fit the declared page",
          input,
          "recordStart",
          this
        )
      );
    }
    const range = {
      pageId: this.pageId,
      sourceId: this.sourceId,
      domain: input.domain,
      byteOffset: input.recordStart * this.layout.stride,
      recordStart: input.recordStart,
      recordCount: input.recordCount,
      instanceIndex: input.instanceIndex,
      member: Object.freeze({ ...input.member }),
      contentRevision: this.contentRevisionValue,
      bufferGeneration: this.bufferGenerationValue,
      deviceGeneration: this.deviceGenerationValue
    };
    this.ownedRanges.add(range);
    this.domains.set(input.domain, {
      name: input.domain,
      start: input.recordStart,
      end: input.recordStart + input.recordCount
    });
    return ok(range);
  }
  /** Return detached dirty bytes for the existing resource owner to upload. */
  beginUpload() {
    const live = this.assertLive("upload");
    if (!live.ok) return live;
    const ranges = this.dirty.map((range) => ({ ...range }));
    const bytes = ranges.reduce((sum, range) => sum + range.byteEnd - range.byteStart, 0);
    const receipt = {
      sourceId: this.sourceId,
      pageId: this.pageId,
      contentRevision: this.contentRevisionValue,
      bufferGeneration: this.bufferGenerationValue,
      deviceGeneration: this.deviceGenerationValue,
      ranges,
      bytes
    };
    this.ownedUploads.add(receipt);
    return ok(receipt);
  }
  /**
   * Commit an upload only after the owning queue write has succeeded. A
   * producer that changed the page while a write was in flight leaves the
   * dirty bytes pending and must retry the new revision.
   */
  commitUpload(receipt) {
    const live = this.assertLive("upload");
    if (!live.ok) return live;
    if (!this.ownedUploads.has(receipt) || receipt.sourceId !== this.sourceId || receipt.pageId !== this.pageId || receipt.bufferGeneration !== this.bufferGenerationValue || receipt.deviceGeneration !== this.deviceGenerationValue || receipt.contentRevision !== this.contentRevisionValue) {
      return err(
        invalid3(
          "stale-generation",
          "upload",
          "the upload receipt still describes the current page revision and generation",
          receipt,
          "receipt",
          this
        )
      );
    }
    this.uploadedRevisionValue = receipt.contentRevision;
    this.lastUploadedBytesValue = receipt.bytes;
    for (const range of receipt.ranges) {
      const index = this.dirty.findIndex(
        (candidate) => candidate.byteStart === range.byteStart && candidate.byteEnd === range.byteEnd
      );
      if (index >= 0) this.dirty.splice(index, 1);
    }
    return ok(true);
  }
  /** CPU-only convenience: begin and commit are still explicit in production. */
  upload() {
    const receipt = this.beginUpload();
    if (!receipt.ok) return receipt;
    const committed = this.commitUpload(receipt.value);
    if (!committed.ok) return committed;
    return receipt;
  }
  /** Consume an uploaded range after graph submission has completed. */
  consume(range, frameNumber) {
    const live = this.assertLive("consume");
    if (!live.ok) return live;
    if (!this.ownedRanges.has(range) || range.sourceId !== this.sourceId || range.pageId !== this.pageId || range.bufferGeneration !== this.bufferGenerationValue || range.deviceGeneration !== this.deviceGenerationValue || range.recordStart < 0 || range.recordCount <= 0 || range.recordStart + range.recordCount > this.schema.maxRecords) {
      return err(
        invalid3(
          "stale-generation",
          "consume",
          "range belongs to this current page generation",
          range,
          "generation",
          this
        )
      );
    }
    if (this.uploadedRevisionValue < range.contentRevision) {
      return err(
        invalid3(
          "not-uploaded",
          "consume",
          "range content revision was uploaded before consumption",
          this.uploadedRevisionValue,
          "contentRevision",
          this
        )
      );
    }
    return ok({ ...range, frameNumber, uploadedRevision: this.uploadedRevisionValue });
  }
  /** Device loss/rebuild changes physical generations while source identity stays stable. */
  reconfigureDevice(deviceGeneration) {
    const live = this.assertLive("reconfigure");
    if (!live.ok) return live;
    if (!Number.isSafeInteger(deviceGeneration) || deviceGeneration < 0) {
      return err(
        invalid3(
          "stale-generation",
          "reconfigure",
          "deviceGeneration is a non-negative safe integer",
          deviceGeneration,
          "deviceGeneration",
          this
        )
      );
    }
    const rendererInitialGeneration = this.bufferGenerationValue === 1 && this.deviceGenerationValue === 1 && deviceGeneration === 0;
    if (deviceGeneration < this.deviceGenerationValue && !rendererInitialGeneration) {
      return err(
        invalid3(
          "stale-generation",
          "reconfigure",
          "deviceGeneration does not precede the current device generation",
          deviceGeneration,
          "deviceGeneration",
          this
        )
      );
    }
    this.deviceGenerationValue = deviceGeneration;
    this.bufferGenerationValue += 1;
    this.uploadedRevisionValue = 0;
    alignRange(this.dirty, 0, this.schema.maxRecords * this.layout.stride);
    return ok(this.bufferGenerationValue);
  }
  release() {
    if (this.released) return ok(true);
    this.released = true;
    this.domains.clear();
    this.dirty.length = 0;
    return ok(true);
  }
  assertLive(operation) {
    return this.released ? err(
      invalid3(
        "released",
        operation,
        ERROR_POLICY2.released.expected,
        void 0,
        void 0,
        this
      )
    ) : ok(true);
  }
};

// src/reflection/filter.ts
function createProbeFilterState(input) {
  return {
    probeIndex: input.probeIndex,
    faceCount: input.faceCount ?? 6,
    mipCount: input.mipCount,
    cursor: 0,
    activeGeneration: input.activeGeneration ?? 0
  };
}
function advanceProbeFilter(state) {
  const total = state.faceCount * state.mipCount;
  if (state.cursor >= total) return void 0;
  return {
    probeIndex: state.probeIndex,
    faceIndex: state.cursor % state.faceCount,
    mipLevel: Math.floor(state.cursor / state.faceCount)
  };
}
function commitProbeFilterStep(state, success) {
  if (!success) return state;
  const nextCursor = state.cursor + 1;
  const complete = nextCursor >= state.faceCount * state.mipCount;
  return {
    ...state,
    cursor: nextCursor,
    activeGeneration: complete ? state.activeGeneration + 1 : state.activeGeneration
  };
}
function probeFilterIsSteady(state) {
  return state.cursor >= state.faceCount * state.mipCount;
}
function normalize3(vector) {
  const length = Math.hypot(vector[0], vector[1], vector[2]);
  if (length === 0) return [0, 0, 1];
  return [vector[0] / length, vector[1] / length, vector[2] / length];
}
function boxProjectReflectionDirection(direction, boxCenter, halfExtents, point) {
  const ray = normalize3(direction);
  for (const axis of [0, 1, 2]) {
    if (Math.abs(point[axis] - boxCenter[axis]) >= halfExtents[axis]) return ray;
  }
  let distance = Number.POSITIVE_INFINITY;
  for (let axis = 0; axis < 3; axis += 1) {
    const component = ray[axis] ?? 0;
    if (component === 0) continue;
    const extent = halfExtents[axis] ?? 0;
    const edge = component > 0 ? (boxCenter[axis] ?? 0) + extent : (boxCenter[axis] ?? 0) - extent;
    const candidate = (edge - (point[axis] ?? 0)) / component;
    if (candidate > 0) distance = Math.min(distance, candidate);
  }
  if (!Number.isFinite(distance)) return ray;
  return normalize3([
    (point[0] ?? 0) + ray[0] * distance - (boxCenter[0] ?? 0),
    (point[1] ?? 0) + ray[1] * distance - (boxCenter[1] ?? 0),
    (point[2] ?? 0) + ray[2] * distance - (boxCenter[2] ?? 0)
  ]);
}

// src/reflection/gpu-table.ts
function buildReflectionProbeTable(rows) {
  const ordered = rows.slice().sort((a, b) => a.index - b.index);
  const indices = /* @__PURE__ */ new Map();
  for (const row of ordered) {
    if (row.primitiveKey !== void 0) indices.set(row.primitiveKey, row.index);
  }
  const indexFor = (primitiveKey2) => indices.get(primitiveKey2);
  return {
    rows: Object.freeze(ordered),
    cpuIndexByPrimitive: indexFor,
    gpuIndexByPrimitive: indexFor
  };
}
function reflectionProbeTableBytes(table) {
  return table.rows.length * 48;
}

// src/reflection/inspection.ts
function recoveryFor(receipt, failure3) {
  if (failure3 !== void 0) {
    const code = failure3.code.toLowerCase();
    if (code.includes("device") || code.includes("format") || code.includes("capability")) {
      return "rebuild";
    }
    if (failure3.stage === "prepare" || failure3.stage === "filter") return "recapture";
    if (failure3.stage === "build" || failure3.stage === "encode") return "rebuild";
    if (failure3.stage === "finish" || failure3.stage === "submit") return "retry";
    if (failure3.stage === "completion") {
      if (receipt.source === "probe" && (receipt.state === "active" || receipt.state === "lkg")) {
        return "use-LKG";
      }
      if (receipt.source === "skylight" && (receipt.state === "active" || receipt.state === "lkg")) {
        return "use-Skylight";
      }
      if (receipt.source === "neutral" && receipt.state === "neutral") return "use-neutral";
      return "retry";
    }
  }
  if (receipt.source === "probe" && (receipt.state === "active" || receipt.state === "lkg")) {
    return "use-LKG";
  }
  if (receipt.source === "skylight" || receipt.state === "lkg") return "use-Skylight";
  return "use-neutral";
}
function inspectReflectionFallback(receipt, failure3) {
  return {
    receipt,
    recoveryAction: recoveryFor(receipt, failure3),
    ...failure3 === void 0 ? {} : {
      failureStage: failure3.stage,
      failureCode: failure3.code,
      expected: failure3.expected,
      ...failure3.detail === void 0 ? {} : { detail: failure3.detail }
    }
  };
}

// src/reflection/projection.ts
var REFLECTION_PROBE_BYTES_PER_TEXEL = 8;
var DEFAULT_REFLECTION_PROBE_LIMITS = Object.freeze({
  maxProbes: 16,
  maxResolution: 256,
  maxBytes: 64 * 1024 * 1024
});
function validateReflectionProbeInput(input) {
  for (let index = 0; index < input.halfExtents.length; index += 1) {
    const value = input.halfExtents[index];
    if (value === void 0 || !Number.isFinite(value) || value <= 0) {
      return {
        ok: false,
        error: {
          code: "reflection-probe-input-invalid",
          field: `halfExtents[${index}]`,
          value,
          expected: "a finite number greater than zero"
        }
      };
    }
  }
  if (!Number.isFinite(input.priority)) {
    return {
      ok: false,
      error: {
        code: "reflection-probe-input-invalid",
        field: "priority",
        value: input.priority,
        expected: "a finite number"
      }
    };
  }
  if (!Number.isFinite(input.intensity) || input.intensity < 0) {
    return {
      ok: false,
      error: {
        code: "reflection-probe-input-invalid",
        field: "intensity",
        value: input.intensity,
        expected: "a finite number greater than or equal to zero"
      }
    };
  }
  if (!Number.isInteger(input.resolution) || input.resolution < 16 || (input.resolution & input.resolution - 1) !== 0) {
    return {
      ok: false,
      error: {
        code: "reflection-probe-input-invalid",
        field: "resolution",
        value: input.resolution,
        expected: "a power of two of at least 16 pixels"
      }
    };
  }
  return { ok: true };
}
function estimateReflectionProbeBytes(resolution, limits = DEFAULT_REFLECTION_PROBE_LIMITS) {
  const maxResolution = limits.maxResolution ?? DEFAULT_REFLECTION_PROBE_LIMITS.maxResolution;
  const clamped = Math.min(resolution, maxResolution);
  let filteredTexels = 0;
  for (let mip = 0; mip < 5; mip++) {
    const size = Math.max(1, Math.floor(clamped / 2 ** mip));
    filteredTexels += size * size;
  }
  return (clamped * clamped + 2 * filteredTexels) * 6 * REFLECTION_PROBE_BYTES_PER_TEXEL + 3 * clamped * clamped * 4;
}
function admitReflectionProbe(input, current, limits = DEFAULT_REFLECTION_PROBE_LIMITS) {
  const maxProbes = limits.maxProbes ?? DEFAULT_REFLECTION_PROBE_LIMITS.maxProbes;
  const maxBytes = limits.maxBytes ?? DEFAULT_REFLECTION_PROBE_LIMITS.maxBytes;
  const maxResolution = limits.maxResolution ?? DEFAULT_REFLECTION_PROBE_LIMITS.maxResolution;
  const requested = estimateReflectionProbeBytes(input.resolution, { maxResolution });
  if (input.resolution > maxResolution || current.acceptedCount >= maxProbes || current.acceptedBytes + requested > maxBytes) {
    return {
      ok: false,
      error: {
        code: "reflection-probe-budget-exceeded",
        requested,
        activeCount: current.acceptedCount,
        activeBytes: current.acceptedBytes,
        maxProbes,
        maxBytes
      }
    };
  }
  return { ok: true, acceptedBytes: current.acceptedBytes + requested };
}
function resolveReflectionFallbackSource(selection, probeReady, skylightAvailable = true) {
  if (selection.kind === "probe" && probeReady) return "probe";
  if (skylightAvailable) return "skylight";
  return "neutral";
}
function reflectionFallbackCoverage(source, fact, selection) {
  if (source === "neutral") return 0;
  if (source === "skylight") return 1;
  if (fact === void 0 || selection.kind !== "probe") return 0;
  const normalized = Math.sqrt(Math.max(0, selection.normalizedDistance));
  return Math.max(0, Math.min(1, 1 - normalized / Math.sqrt(3)));
}
function reflectionFallbackSourceKey(source, selection, skylight) {
  if (source === "probe" && selection.kind === "probe") {
    return `probe:${selection.worldId}:${selection.entityKey}`;
  }
  if (source === "skylight" && skylight !== void 0) {
    return `skylight:${skylight.entityHandle}:${skylight.equirectHandle}`;
  }
  return source;
}
function reflectionFallbackProjectionSignature(input) {
  return JSON.stringify({
    renderableKey: input.renderableKey,
    sourceKey: input.sourceKey,
    source: input.source,
    coverage: input.coverage,
    extent: input.extent,
    brdfSignature: input.brdfSignature
  });
}
function deriveReflectionFallbackProjection(input) {
  if (!Number.isFinite(input.coverage) || input.coverage < 0 || input.coverage > 1) {
    return {
      ok: false,
      error: {
        code: "reflection-fallback-input-invalid",
        field: "coverage",
        expected: "a finite number between zero and one"
      }
    };
  }
  if (input.extent?.some((value) => !Number.isFinite(value) || value <= 0)) {
    return {
      ok: false,
      error: {
        code: "reflection-fallback-input-invalid",
        field: "extent",
        expected: "three finite numbers greater than zero"
      }
    };
  }
  if (input.linearHdr.some((value) => !Number.isFinite(value))) {
    return {
      ok: false,
      error: {
        code: "reflection-fallback-input-invalid",
        field: "linearHdr",
        expected: "four finite linear HDR values"
      }
    };
  }
  if (input.brdfSignature.length === 0) {
    return {
      ok: false,
      error: {
        code: "reflection-fallback-input-invalid",
        field: "brdfSignature",
        expected: "a non-empty BRDF signature"
      }
    };
  }
  const linearHdr = input.source === "neutral" ? [0, 0, 0, 0] : [...input.linearHdr];
  return {
    ok: true,
    value: Object.freeze({
      ...input.renderableKey === void 0 ? {} : { renderableKey: input.renderableKey },
      ...input.sourceKey === void 0 ? {} : { sourceKey: input.sourceKey },
      source: input.source,
      coverage: input.coverage,
      ...input.extent === void 0 ? {} : {
        extent: Object.freeze([...input.extent])
      },
      linearHdr: Object.freeze(linearHdr),
      brdfSignature: input.brdfSignature
    })
  };
}
function contains(fact, point) {
  return fact.halfExtents.every((extent, axis) => {
    const center = fact.center[axis] ?? 0;
    const coordinate = point[axis] ?? 0;
    return Math.abs(coordinate - center) <= extent;
  });
}
function normalizedDistance(fact, point) {
  let squared = 0;
  for (let axis = 0; axis < 3; axis += 1) {
    const delta = (point[axis] ?? 0) - (fact.center[axis] ?? 0);
    const extent = fact.halfExtents[axis] ?? 1;
    squared += (delta / extent) ** 2;
  }
  return squared;
}
function isBetter(candidate, current, facts) {
  const candidateFact = facts.find(
    (fact) => fact.worldId === candidate.worldId && fact.entityKey === candidate.entityKey
  );
  const currentFact = facts.find(
    (fact) => fact.worldId === current.worldId && fact.entityKey === current.entityKey
  );
  if (candidateFact === void 0 || currentFact === void 0) return false;
  if (candidateFact.priority !== currentFact.priority)
    return candidateFact.priority > currentFact.priority;
  if (candidate.normalizedDistance !== current.normalizedDistance) {
    return candidate.normalizedDistance < current.normalizedDistance;
  }
  return candidate.worldId < current.worldId || candidate.worldId === current.worldId && candidate.entityKey < current.entityKey;
}
function selectReflectionProbe(facts, primitiveCenter) {
  let selected;
  for (const fact of facts) {
    if (!contains(fact, primitiveCenter)) continue;
    const candidate = {
      kind: "probe",
      worldId: fact.worldId,
      entityKey: fact.entityKey,
      normalizedDistance: normalizedDistance(fact, primitiveCenter)
    };
    if (selected === void 0 || isBetter(candidate, selected, facts)) selected = candidate;
  }
  return selected ?? { kind: "skylight" };
}
function primitiveKey(worldId, entityKey) {
  return `${worldId}:${entityKey}`;
}
var ReflectionProbeProjection = class {
  revision = 0;
  facts = [];
  selected = /* @__PURE__ */ new Map();
  signature = "";
  scannedPrimitives = 0;
  update(facts, primitives) {
    const nextFacts = facts.slice().sort((a, b) => a.worldId - b.worldId || a.entityKey - b.entityKey);
    const signature = JSON.stringify({ facts: nextFacts, primitives });
    if (signature === this.signature) return this.snapshot();
    this.signature = signature;
    this.facts = nextFacts;
    this.selected = /* @__PURE__ */ new Map();
    for (const primitive of primitives) {
      this.selected.set(
        primitive.renderableKey ?? primitiveKey(primitive.worldId, primitive.entityKey),
        selectReflectionProbe(nextFacts, primitive.center)
      );
    }
    this.scannedPrimitives = primitives.length;
    this.revision += 1;
    return this.snapshot();
  }
  snapshot() {
    return {
      revision: this.revision,
      facts: this.facts,
      selected: this.selected,
      scannedPrimitives: this.scannedPrimitives
    };
  }
  selection(worldId, entityKey) {
    return this.selected.get(primitiveKey(worldId, entityKey)) ?? { kind: "skylight" };
  }
};

// src/scene/visibility/inspection.ts
var LOD_OCCLUSION_INSPECTION_SCHEMA = "forgeax::lod-occlusion-inspection::v2";
var LOD_OCCLUSION_INSPECTION_MAX_BYTES = 16 * 1024;
var MAX_INSPECTION_SAMPLES = 64;
function nonNegativeInteger(name, value) {
  if (!Number.isInteger(value) || value < 0)
    throw new Error(`${name} must be a non-negative integer`);
  return value;
}
function copyError(error) {
  return Object.freeze({
    code: error.code,
    expected: error.expected,
    hint: error.hint,
    ...error.detail === void 0 ? {} : { detail: Object.freeze({ ...error.detail }) }
  });
}
function copyFallback(fallback) {
  return fallback.active ? Object.freeze({ ...fallback, error: copyError(fallback.error) }) : Object.freeze({ active: false });
}
function copySamples(samples) {
  return Object.freeze(
    [...samples].sort((left, right) => left.primitiveSlot - right.primitiveSlot).slice(0, MAX_INSPECTION_SAMPLES).map(
      (sample) => Object.freeze({
        primitiveSlot: nonNegativeInteger("sample.primitiveSlot", sample.primitiveSlot),
        level: nonNegativeInteger("sample.level", sample.level),
        visible: sample.visible
      })
    )
  );
}
function copyWorldAttribution(attribution) {
  if (attribution === void 0) {
    return Object.freeze({ status: "unavailable", reason: "projection-only" });
  }
  if (attribution.status === "same-submit") {
    if (typeof attribution.submit.build !== "string" || attribution.submit.build.length === 0) {
      throw new Error("world.attribution.submit.build must be a non-empty string");
    }
    nonNegativeInteger("world.attribution.submit.frameId", attribution.submit.frameId);
    nonNegativeInteger(
      "world.attribution.submit.deviceGeneration",
      attribution.submit.deviceGeneration
    );
    return Object.freeze({
      status: "same-submit",
      submit: Object.freeze({ ...attribution.submit })
    });
  }
  if (attribution.status !== "unavailable" || attribution.reason !== "projection-only") {
    throw new Error("world.attribution must declare same-submit or projection-only");
  }
  return Object.freeze({ status: "unavailable", reason: "projection-only" });
}
function copyRow(row) {
  for (const [name, value] of Object.entries({
    generation: row.generation,
    candidates: row.count.candidates,
    visible: row.count.visible,
    occluded: row.count.occluded,
    median: row.queryLatencyUs.median,
    p95: row.queryLatencyUs.p95,
    last: row.queryLatencyUs.last,
    pageUsed: row.pagePressure.used,
    pageCapacity: row.pagePressure.capacity
  }))
    nonNegativeInteger(`inspection.${name}`, value);
  if (row.view.cameraEntity < 0 || row.view.viewGeneration < 0 || row.slot.primitiveSlot < 0 || row.slot.slotGeneration < 0) {
    throw new Error("inspection identity values must be non-negative");
  }
  if (row.pagePressure.used > row.pagePressure.capacity) {
    throw new Error("inspection page pressure exceeds capacity");
  }
  return Object.freeze({
    root: Object.freeze({ ...row.root }),
    view: Object.freeze({ ...row.view }),
    slot: Object.freeze({ ...row.slot }),
    generation: row.generation,
    count: Object.freeze({ ...row.count }),
    lodHistogram: Object.freeze(
      row.lodHistogram.map(
        (histogram) => Object.freeze({
          level: nonNegativeInteger("histogram.level", histogram.level),
          count: nonNegativeInteger("histogram.count", histogram.count)
        })
      )
    ),
    queryLatencyUs: Object.freeze({ ...row.queryLatencyUs }),
    pagePressure: Object.freeze({ ...row.pagePressure }),
    fallback: copyFallback(row.fallback),
    degradation: Object.freeze({ ...row.degradation }),
    samples: copySamples(row.samples)
  });
}
function copyWorlds(worlds, fallback) {
  const source = worlds ?? [{ attachmentId: fallback.view.attachmentId, rows: [fallback] }];
  return Object.freeze(
    source.map(
      (world) => Object.freeze({
        attachmentId: world.attachmentId,
        rows: Object.freeze(world.rows.map((row) => copyRow(row))),
        attribution: copyWorldAttribution(world.attribution)
      })
    )
  );
}
function inspectLodOcclusion(input) {
  const row = copyRow(input);
  const defaultBudget = createVisibilityBudget();
  const budget = input.budget ?? {
    configuredQueryBudget: defaultBudget.configuredQueryBudget,
    effectiveQueryBudget: defaultBudget.effectiveQueryBudget,
    settleSubmits: defaultBudget.settleSubmits,
    retestSubmits: defaultBudget.retestSubmits,
    expirySubmits: defaultBudget.expirySubmits
  };
  for (const [name, value] of Object.entries(budget))
    nonNegativeInteger(`inspection.budget.${name}`, value);
  const submit = input.submit ?? {
    frameId: input.generation,
    build: "unknown",
    deviceGeneration: 0
  };
  nonNegativeInteger("inspection.submit.frameId", submit.frameId);
  nonNegativeInteger("inspection.submit.deviceGeneration", submit.deviceGeneration);
  if (typeof submit.build !== "string" || submit.build.length === 0) {
    throw new Error("inspection.submit.build must be a non-empty string");
  }
  const worlds = copyWorlds(input.worlds, row);
  for (const world of worlds) {
    if (world.attribution.status === "same-submit" && (world.attribution.submit.frameId !== submit.frameId || world.attribution.submit.build !== submit.build || world.attribution.submit.deviceGeneration !== submit.deviceGeneration)) {
      throw new Error("world attribution must reference the parent inspection submit");
    }
  }
  const inspection = Object.freeze({
    schema: LOD_OCCLUSION_INSPECTION_SCHEMA,
    ...row,
    submit: Object.freeze({ ...submit }),
    budget: Object.freeze({ ...budget }),
    worlds
  });
  if (JSON.stringify(inspection).length > LOD_OCCLUSION_INSPECTION_MAX_BYTES) {
    throw new Error(`LOD occlusion inspection exceeds ${LOD_OCCLUSION_INSPECTION_MAX_BYTES} bytes`);
  }
  return inspection;
}
function serializeLodOcclusionInspection(inspection) {
  const serialized = JSON.stringify(inspection);
  if (serialized.length > LOD_OCCLUSION_INSPECTION_MAX_BYTES) {
    throw new Error(`LOD occlusion inspection exceeds ${LOD_OCCLUSION_INSPECTION_MAX_BYTES} bytes`);
  }
  return serialized;
}
function consumeLodOcclusionInspection(inspection) {
  if (!inspection.fallback.active) return { action: "none" };
  const { reason, error } = inspection.fallback;
  const action = error.code.startsWith("asset-") || reason === "producer-failed" ? "rebuild" : reason === "query-failed" || reason === "page-exhausted" || reason === "device-loss" ? "retry" : "cold-cook";
  return { action, sourceKey: inspection.root.sourceKey, reason };
}

// src/ssr/inspection.ts
var SSR_INSPECTION_MAX_PASSES = 64;
function nonNegativeSafeInteger(name, value) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative safe integer`);
  }
  return value;
}
function copyHistory(history) {
  nonNegativeSafeInteger("SSR inspection history.bytes", history.bytes);
  nonNegativeSafeInteger("SSR inspection history.resetCount", history.resetCount);
  return Object.freeze({
    state: history.state,
    bytes: history.bytes,
    resetCount: history.resetCount
  });
}
function copyCoverage(coverage) {
  const result = {
    hitCount: coverage?.hitCount ?? null,
    fallbackCount: coverage?.fallbackCount ?? null,
    excludedCount: coverage?.excludedCount ?? null
  };
  for (const [key, value] of Object.entries(result)) {
    if (value !== null) nonNegativeSafeInteger(`SSR inspection coverage.${key}`, value);
  }
  return Object.freeze(result);
}
function copyPassRoster(passRoster) {
  return Object.freeze(
    [...passRoster ?? []].slice(0, SSR_INSPECTION_MAX_PASSES).map((name, index) => {
      if (typeof name !== "string" || name.length === 0) {
        throw new Error(`SSR inspection passRoster[${index}] must be a non-empty string`);
      }
      return name;
    })
  );
}
function projectSsrSpatialInspection(admission, projection = {}) {
  const config = admission.config;
  return Object.freeze({
    status: projection.status ?? admission.status,
    lane: admission.lane,
    config: config === void 0 ? void 0 : Object.freeze({
      maxDistance: config.maxDistance,
      thickness: config.thickness,
      maxRoughness: config.maxRoughness
    }),
    viewRange: admission.viewRange,
    coverage: copyCoverage(projection.coverage),
    history: copyHistory(
      projection.history ?? {
        state: "not-owned",
        bytes: 0,
        resetCount: 0
      }
    ),
    work: Object.freeze({ ...admission.work }),
    passRoster: copyPassRoster(projection.passRoster),
    fallbackSource: projection.fallbackSource,
    failure: projection.failure ?? admission.failure
  });
}
function serializeSsrSpatialInspection(inspection) {
  return JSON.stringify(inspection);
}
var DynamicGeometryError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(code, expected, hint, detail = {}) {
    super(`${code}: ${expected}`);
    this.name = "DynamicGeometryError";
    this.code = code;
    this.expected = expected;
    this.hint = hint;
    this.detail = Object.freeze({ code, ...detail });
  }
};
function sameCandidateCredential(candidate, committed) {
  return candidate.candidateId === committed.candidateId && candidate.owner === committed.owner && candidate.world === committed.world && candidate.generation === committed.generation && candidate.entity === committed.entity && candidate.physicsEntity === committed.physicsEntity && candidate.gpuReady === committed.gpuReady && candidate.meshBytes === committed.meshBytes && candidate.revision === committed.revision && candidate.topologyRevision === committed.topologyRevision && candidate.materialIdentity === committed.materialIdentity && candidate.meshHandle === committed.meshHandle && candidate.fixedStep === committed.fixedStep;
}
function cloneTypedArray(value) {
  return new value.constructor(value);
}
function cloneMesh(mesh) {
  const attributes = Object.fromEntries(
    Object.entries(mesh.attributes).map(([key, value]) => [
      key,
      value instanceof ArrayBuffer ? value.slice(0) : value === void 0 ? void 0 : cloneTypedArray(value)
    ])
  );
  return Object.freeze({
    ...mesh,
    vertices: new Float32Array(mesh.vertices),
    ...mesh.indices === void 0 ? {} : { indices: cloneTypedArray(mesh.indices) },
    attributes,
    ...mesh.aabb === void 0 ? {} : { aabb: new Float32Array(mesh.aabb) },
    submeshes: Object.freeze(mesh.submeshes.map((submesh) => Object.freeze({ ...submesh }))),
    materialSlots: Object.freeze(mesh.materialSlots.map((slot) => Object.freeze({ ...slot })))
  });
}
function cloneCandidate(candidate) {
  return Object.freeze({ ...candidate, mesh: cloneMesh(candidate.mesh) });
}
function validateMesh(mesh) {
  if (mesh.kind !== "mesh") return "MeshAsset.kind must be mesh";
  if (!(mesh.vertices instanceof Float32Array) || mesh.vertices.length === 0) {
    return "MeshAsset.vertices must be a non-empty Float32Array";
  }
  if (mesh.indices !== void 0 && !(mesh.indices instanceof Uint16Array || mesh.indices instanceof Uint32Array)) {
    return "MeshAsset.indices must be Uint16Array or Uint32Array";
  }
  if (mesh.submeshes.length === 0)
    return "MeshAsset.submeshes must contain at least one topology range";
  if (mesh.submeshes.some(
    (submesh) => !Number.isSafeInteger(submesh.materialSlot) || submesh.materialSlot < 0 || submesh.materialSlot >= mesh.materialSlots.length
  )) {
    return "MeshAsset.materialSlots must cover every referenced materialSlot";
  }
  if (mesh.vertices.some((value) => !Number.isFinite(value)))
    return "MeshAsset.vertices must be finite";
  return void 0;
}
function meshByteSize(mesh) {
  let bytes = mesh.vertices.byteLength + (mesh.indices?.byteLength ?? 0);
  for (const value of Object.values(mesh.attributes)) {
    if (value instanceof ArrayBuffer) bytes += value.byteLength;
    else if (value !== void 0 && ArrayBuffer.isView(value)) bytes += value.byteLength;
  }
  if (mesh.aabb !== void 0) bytes += mesh.aabb.byteLength;
  return bytes;
}
function createDynamicGeometryLifecycle(maxCandidates = 32, maxMeshBytes = 64 * 1024 * 1024) {
  const records = /* @__PURE__ */ new Map();
  const owner = {};
  let sequence = 0;
  let currentGeneration = 0;
  let disposed = false;
  let historyInvalidations = 0;
  let latestRevision;
  let latestFrameId;
  let retired = 0;
  let invalidated = 0;
  let meshBytes = 0;
  const latestRevisionByWorld = /* @__PURE__ */ new WeakMap();
  const latestTopologyRevisionByWorld = /* @__PURE__ */ new WeakMap();
  const publishedReceipts = /* @__PURE__ */ new Map();
  const failure3 = (code, expected, hint, detail = {}) => err(new DynamicGeometryError(code, expected, hint, detail));
  const current = (candidate) => {
    const record = records.get(candidate.candidateId);
    if (record === void 0 || candidate.owner !== owner || record.candidate.owner !== candidate.owner || record.candidate.world !== candidate.world || record.candidate.generation !== candidate.generation)
      return void 0;
    return record;
  };
  return {
    prepare(input, generation) {
      if (disposed)
        return failure3("dynamic-geometry-disposed", "renderer is alive", "rebuild the Renderer");
      if (input.world === null || typeof input.world !== "object") {
        return failure3(
          "dynamic-geometry-world-not-attached",
          "candidate belongs to an attached World",
          "attach the World before preparing geometry"
        );
      }
      if (!Number.isInteger(input.revision) || input.revision < 0) {
        return failure3(
          "dynamic-geometry-invalid",
          "geometry revision is a non-negative integer",
          "advance the consumer revision monotonically",
          { revision: input.revision }
        );
      }
      if (generation !== currentGeneration && currentGeneration !== 0) {
        return failure3(
          "dynamic-geometry-generation-mismatch",
          "candidate uses the active renderer generation",
          "discard stale generation work and prepare again",
          { generation, actual: currentGeneration }
        );
      }
      if (records.size >= maxCandidates) {
        return failure3(
          "dynamic-geometry-budget-exceeded",
          "candidate count remains within the bounded renderer budget",
          "cancel or retire an earlier candidate before retrying",
          { actual: records.size }
        );
      }
      const invalid4 = validateMesh(input.mesh);
      if (invalid4 !== void 0)
        return failure3(
          "dynamic-geometry-invalid",
          "MeshAsset satisfies the standard geometry contract",
          invalid4
        );
      const candidateBytes = meshByteSize(input.mesh);
      if (!Number.isSafeInteger(candidateBytes) || candidateBytes < 0 || meshBytes > maxMeshBytes - candidateBytes) {
        return failure3(
          "dynamic-geometry-budget-exceeded",
          "candidate mesh bytes remain within the bounded renderer resource budget",
          "cancel or retire an earlier candidate before retrying",
          { actual: { meshBytes, candidateBytes, maxMeshBytes } }
        );
      }
      const candidateId = `mesh:${generation}:${++sequence}:${input.revision}`;
      const candidate = Object.freeze({
        candidateId,
        generation,
        owner,
        world: input.world,
        ...input.entity === void 0 ? {} : { entity: input.entity },
        ...input.physicsEntity === void 0 ? {} : { physicsEntity: input.physicsEntity },
        gpuReady: input.meshHandle !== void 0,
        meshBytes: candidateBytes,
        revision: input.revision,
        topologyRevision: input.topologyRevision ?? input.revision,
        ...input.materialIdentity === void 0 ? {} : { materialIdentity: input.materialIdentity },
        ...input.meshHandle === void 0 ? {} : { meshHandle: input.meshHandle },
        ...input.fixedStep === void 0 ? {} : { fixedStep: input.fixedStep },
        mesh: cloneMesh(input.mesh),
        state: "prepared"
      });
      records.set(candidateId, {
        world: input.world,
        candidate,
        historyInvalidated: false
      });
      meshBytes += candidateBytes;
      currentGeneration = generation;
      return ok(cloneCandidate(candidate));
    },
    accept(candidate, ordering) {
      if (disposed)
        return failure3("dynamic-geometry-disposed", "renderer is alive", "rebuild the Renderer");
      const record = current(candidate);
      if (record === void 0)
        return failure3(
          "dynamic-geometry-candidate-not-found",
          "candidate is owned by this renderer",
          "discard the stale credential"
        );
      if (candidate.generation !== currentGeneration) {
        return failure3(
          "dynamic-geometry-generation-mismatch",
          "candidate generation matches the active renderer generation",
          "prepare against the current renderer generation",
          { candidateId: candidate.candidateId }
        );
      }
      if (record.candidate.state !== "prepared") {
        return failure3(
          "dynamic-geometry-candidate-state",
          "candidate is prepared exactly once before acceptance",
          "retain the accepted or published receipt",
          { candidateId: candidate.candidateId }
        );
      }
      if (!sameCandidateCredential(candidate, record.candidate)) {
        return failure3(
          "dynamic-geometry-receipt-mismatch",
          "acceptance uses the exact prepared candidate credential",
          "discard the altered credential and use the value returned by prepare",
          { candidateId: candidate.candidateId }
        );
      }
      if (ordering !== void 0) {
        if (ordering.world !== record.world || !Number.isInteger(ordering.fixedStep) || ordering.fixedStep < 0) {
          return failure3(
            "dynamic-geometry-ordering-required",
            "acceptance ordering names the candidate World and a non-negative fixed step",
            "submit the PhysicsWorld publication ordering for the same attached World",
            { candidateId: candidate.candidateId, actual: ordering }
          );
        }
      }
      const newest = [...records.values()].filter(
        (entry) => entry.candidate.candidateId !== candidate.candidateId && entry.world === record.world && entry.candidate.entity === record.candidate.entity && (entry.candidate.state === "prepared" || entry.candidate.state === "accepted")
      ).map((entry) => entry.candidate.revision).concat(latestRevisionByWorld.get(record.world)?.get(record.candidate.entity) ?? -1).sort((a, b) => b - a)[0];
      if (newest !== void 0 && record.candidate.revision <= newest) {
        return failure3(
          "dynamic-geometry-stale",
          "accepted geometry revision is newer than the active candidate",
          "advance topology revision before accepting",
          { candidateId: candidate.candidateId }
        );
      }
      const accepted = Object.freeze({
        ...record.candidate,
        ...ordering === void 0 ? {} : { fixedStep: ordering.fixedStep },
        state: "accepted"
      });
      const previousTopologies = [...records.values()].filter(
        (entry) => entry.candidate.candidateId !== candidate.candidateId && entry.world === record.world && entry.candidate.entity === record.candidate.entity
      ).map((entry) => entry.candidate.topologyRevision);
      const previousLatestTopology = latestTopologyRevisionByWorld.get(record.world)?.get(record.candidate.entity);
      const newestTopology = previousTopologies.concat(previousLatestTopology === void 0 ? [] : [previousLatestTopology]).sort((a, b) => b - a)[0];
      if (newestTopology !== void 0 && accepted.topologyRevision < newestTopology) {
        return failure3(
          "dynamic-geometry-stale",
          "accepted topology revision is not older than the active geometry history",
          "advance topology revision before accepting a replacement candidate",
          { candidateId: candidate.candidateId }
        );
      }
      if (newestTopology !== void 0 && accepted.topologyRevision > newestTopology) {
        historyInvalidations += 1;
        for (const previous of records.values()) {
          if (previous.world !== record.world || previous.candidate.entity !== record.candidate.entity || previous.candidate.candidateId === candidate.candidateId || previous.candidate.topologyRevision >= accepted.topologyRevision)
            continue;
          if (!previous.historyInvalidated) {
            previous.historyInvalidated = true;
            invalidated += 1;
          }
        }
      }
      record.candidate = accepted;
      return ok(cloneCandidate(accepted));
    },
    cancel(candidate, completion) {
      const record = current(candidate);
      if (record === void 0)
        return failure3(
          "dynamic-geometry-candidate-not-found",
          "candidate is owned by this renderer",
          "discard the stale credential"
        );
      if (!sameCandidateCredential(candidate, record.candidate))
        return failure3(
          "dynamic-geometry-receipt-mismatch",
          "cancellation uses the exact prepared candidate credential",
          "discard the altered credential and use the value returned by prepare",
          { candidateId: candidate.candidateId }
        );
      if (record.candidate.state !== "prepared" && record.candidate.state !== "accepted") {
        return failure3(
          "dynamic-geometry-candidate-state",
          "only prepared or accepted geometry can be cancelled once",
          "retire published geometry or await the existing terminal cleanup"
        );
      }
      record.candidate = Object.freeze({ ...record.candidate, state: "cancelled" });
      const release = () => {
        if (records.get(candidate.candidateId) !== record) return;
        records.delete(candidate.candidateId);
        meshBytes = Math.max(0, meshBytes - record.candidate.meshBytes);
      };
      if (completion === void 0) release();
      else void completion.then(release, release);
      return ok(void 0);
    },
    retire(candidate) {
      const record = current(candidate);
      if (record === void 0)
        return failure3(
          "dynamic-geometry-candidate-not-found",
          "retirement uses a published candidate owned by this renderer",
          "discard the stale credential and do not evict any unrelated mesh",
          { candidateId: candidate.candidateId }
        );
      if (!sameCandidateCredential(candidate, record.candidate))
        return failure3(
          "dynamic-geometry-receipt-mismatch",
          "retirement uses the exact published candidate credential",
          "discard the altered credential and use the value returned by publish",
          { candidateId: candidate.candidateId }
        );
      if (record.candidate.state !== "published") {
        return failure3(
          "dynamic-geometry-candidate-state",
          "only published geometry can enter receipt-bound retirement",
          "publish the candidate from a submitted frame first"
        );
      }
      record.candidate = Object.freeze({ ...record.candidate, state: "retired" });
      publishedReceipts.delete(candidate.candidateId);
      retired += 1;
      return ok(void 0);
    },
    finalizeRetirement(candidate) {
      const record = current(candidate);
      if (record === void 0)
        return failure3(
          "dynamic-geometry-candidate-not-found",
          "retirement finalization uses a candidate retained by this lifecycle",
          "discard the stale credential or finish the current receipt-bound retirement"
        );
      if (!sameCandidateCredential(candidate, record.candidate))
        return failure3(
          "dynamic-geometry-receipt-mismatch",
          "retirement finalization uses the exact published candidate credential",
          "discard the altered credential and use the value returned by publication",
          { candidateId: candidate.candidateId }
        );
      if (record.candidate.state !== "retired")
        return failure3(
          "dynamic-geometry-candidate-state",
          "only a retired candidate can release its deferred budget",
          "retire the published candidate before finalizing its receipt-bound cleanup",
          { candidateId: candidate.candidateId }
        );
      records.delete(candidate.candidateId);
      meshBytes = Math.max(0, meshBytes - record.candidate.meshBytes);
      return ok(void 0);
    },
    publishFrame(frame, worlds, fixedStep, canPublish, recordStageLane) {
      if (disposed || frame.deviceGeneration !== currentGeneration) return [];
      const receipts = [];
      for (const record of records.values()) {
        const canRepeatPublished = record.candidate.state === "published" && // Attached Renderer publication revalidates the entity binding in
        // `canPublish`, so a history-invalidated candidate can still record
        // a real draw for its live entity. Detached lifecycle publication
        // remains one-shot once that history is invalidated.
        (canPublish !== void 0 || !record.historyInvalidated);
        if (record.candidate.state !== "accepted" && !canRepeatPublished) continue;
        if (worlds !== void 0 && !worlds.includes(record.world)) continue;
        if (record.candidate.fixedStep !== void 0 && (fixedStep === void 0 || record.candidate.fixedStep > fixedStep)) {
          continue;
        }
        if (canPublish !== void 0 && !canPublish(record.candidate)) continue;
        const consumedLane = canPublish === void 0 ? void 0 : recordStageLane?.(record.candidate);
        record.candidate = Object.freeze({ ...record.candidate, state: "published" });
        const receipt = Object.freeze({
          candidateId: record.candidate.candidateId,
          generation: record.candidate.generation,
          revision: record.candidate.revision,
          topologyRevision: record.candidate.topologyRevision,
          ...record.candidate.fixedStep === void 0 ? {} : { fixedStep: record.candidate.fixedStep },
          frameId: frame.frameId,
          deviceGeneration: frame.deviceGeneration,
          recordStageConsumed: canPublish !== void 0,
          ...consumedLane === void 0 ? {} : { recordStageLane: consumedLane },
          ...fixedStep === void 0 ? {} : { publicationFixedStep: fixedStep },
          frame: Object.freeze({ ...frame })
        });
        receipts.push(receipt);
        publishedReceipts.set(record.candidate.candidateId, receipt);
        latestRevision = record.candidate.revision;
        latestFrameId = frame.frameId;
        if (!latestRevisionByWorld.has(record.world))
          latestRevisionByWorld.set(record.world, /* @__PURE__ */ new Map());
        latestRevisionByWorld.get(record.world)?.set(record.candidate.entity, record.candidate.revision);
        if (!latestTopologyRevisionByWorld.has(record.world))
          latestTopologyRevisionByWorld.set(record.world, /* @__PURE__ */ new Map());
        latestTopologyRevisionByWorld.get(record.world)?.set(record.candidate.entity, record.candidate.topologyRevision);
      }
      return receipts;
    },
    invalidateWorld(world, completion) {
      for (const [id, record] of records) {
        if (record.world !== world) continue;
        if (record.candidate.state === "cancelled" || record.candidate.state === "retired")
          continue;
        publishedReceipts.delete(id);
        record.candidate = Object.freeze({ ...record.candidate, state: "cancelled" });
        const release = () => {
          if (records.get(id) !== record) return;
          records.delete(id);
          meshBytes = Math.max(0, meshBytes - record.candidate.meshBytes);
        };
        if (completion === void 0) release();
        else void completion.then(release, release);
        invalidated += 1;
      }
      latestRevisionByWorld.delete(world);
      latestTopologyRevisionByWorld.delete(world);
    },
    invalidateGeneration(generation) {
      if (generation === currentGeneration) return;
      currentGeneration = generation;
      const invalidatedWorlds = /* @__PURE__ */ new Set();
      for (const [id, record] of records) {
        if (record.candidate.generation !== generation) {
          records.delete(id);
          publishedReceipts.delete(id);
          meshBytes = Math.max(0, meshBytes - record.candidate.meshBytes);
          invalidatedWorlds.add(record.world);
          invalidated += 1;
        }
      }
      for (const world of invalidatedWorlds) {
        latestRevisionByWorld.delete(world);
        latestTopologyRevisionByWorld.delete(world);
      }
    },
    receipt(candidate) {
      const receipt = publishedReceipts.get(candidate.candidateId);
      const record = records.get(candidate.candidateId);
      if (record === void 0 || !sameCandidateCredential(candidate, record.candidate)) {
        return void 0;
      }
      return receipt?.generation === candidate.generation ? receipt : void 0;
    },
    inspect() {
      let prepared = 0;
      let accepted = 0;
      let published = 0;
      for (const record of records.values()) {
        if (record.candidate.state === "prepared") prepared += 1;
        else if (record.candidate.state === "accepted") accepted += 1;
        else if (record.candidate.state === "published") published += 1;
      }
      return Object.freeze({
        generation: currentGeneration,
        prepared,
        accepted,
        published,
        retired,
        ...latestRevision === void 0 ? {} : { latestRevision },
        ...latestFrameId === void 0 ? {} : { latestFrameId },
        historyInvalidations,
        invalidated,
        meshBytes,
        maxMeshBytes
      });
    },
    dispose() {
      disposed = true;
      records.clear();
      publishedReceipts.clear();
      meshBytes = 0;
    }
  };
}

// src/publication/dependencies.ts
function publicationDependencies(row) {
  const handles = /* @__PURE__ */ new Set([row.assetHandle]);
  for (const material of row.materials) {
    for (const handle of [
      material.materialHandle,
      material.baseColorTexture,
      material.metallicRoughnessTexture,
      material.normalTexture,
      material.emissiveTexture,
      material.occlusionTexture
    ]) {
      if (handle) handles.add(handle);
    }
    for (const handle of material.textureHandles?.values() ?? []) handles.add(handle);
    for (const handle of material.samplerHandles?.values() ?? []) handles.add(handle);
  }
  return [...handles];
}
function publicationFrameDependencies(frame) {
  const handles = /* @__PURE__ */ new Set();
  const add = (handle) => {
    if (handle) handles.add(handle);
  };
  add(frame.skylight?.equirectHandle);
  add(frame.skybox?.equirectHandle);
  for (const camera of [...frame.cameras, ...frame.auxiliaryCameras]) add(camera.output?.colorLut);
  for (const light of frame.lights.spot) {
    add(light.iesProfileHandle);
    add(light.cookieHandle);
    add(light.projectorHandle);
  }
  const fogs = frame.volumetricFog === void 0 ? [] : [frame.volumetricFog, ...frame.volumetricFog.additional ?? []];
  for (const fog of fogs) {
    add(fog.densityHandle);
    add(fog.projectorHandle);
  }
  return [...handles];
}
var atlasMaterialCache = /* @__PURE__ */ new WeakMap();
var atlasOnlyMaterialCache = /* @__PURE__ */ new WeakMap();
var streamingCacheByWorld = /* @__PURE__ */ new WeakMap();
function streamingCache(world) {
  let cache = streamingCacheByWorld.get(world);
  if (cache === void 0) {
    cache = {
      layers: /* @__PURE__ */ new Map(),
      chunkEntities: /* @__PURE__ */ new Map(),
      activeChunks: /* @__PURE__ */ new Map()
    };
    streamingCacheByWorld.set(world, cache);
  }
  return cache;
}
function encodeTilemapLayerValue(layerOrder, chunkIndex, sortScope = "layer") {
  if (sortScope === "per-cell") return layerOrder << 20 | 0;
  return layerOrder << 20 | chunkIndex & 1048575 | 0;
}
function resolveTilesetMaterial(world, tileset, regionIndex, lookup) {
  const region = tileset.regions[regionIndex];
  if (region === void 0) return toShared(0);
  const atlasIndex = region.atlasIndex ?? 0;
  const atlasGuid = tileset.atlases[atlasIndex];
  if (atlasGuid === void 0) return toShared(0);
  const atlas = resolveTilesetRuntime(world, atlasGuid, lookup);
  if (!atlas.ok) return toShared(0);
  const atlasHandle = atlas.value.handle;
  const atlasId = unwrapHandle(atlasHandle);
  const cacheKey = `${atlasId}|${regionIndex}`;
  const cache = atlasMaterialCache.get(world) ?? /* @__PURE__ */ new Map();
  atlasMaterialCache.set(world, cache);
  const cached = cache.get(cacheKey);
  if (cached !== void 0) return cached;
  const atlasSize = tileset.atlasSizes?.[atlasIndex];
  const atlasWidth = Math.max(
    1,
    atlasSize !== void 0 ? atlasSize.pixelWidth : tileset.columns * tileset.tileWidth
  );
  const atlasHeight = Math.max(
    1,
    atlasSize !== void 0 ? atlasSize.pixelHeight : tileset.rows * tileset.tileHeight
  );
  const halfTexelU = 0.5 / atlasWidth;
  const halfTexelV = 0.5 / atlasHeight;
  const u = region.x / atlasWidth + halfTexelU;
  const v = region.y / atlasHeight + halfTexelV;
  const w = region.width / atlasWidth - 2 * halfTexelU;
  const h = region.height / atlasHeight - 2 * halfTexelV;
  const matPayload = {
    kind: "material",
    passes: [
      {
        name: "Forward",
        program: { module: "forgeax::sprite" },
        renderState: {
          ...{ blend: SPRITE_PREMULTIPLIED_ALPHA_BLEND },
          tags: { LightMode: "Forward" },
          queue: 3e3
        }
      }
    ],
    values: {
      colorTint: [1, 1, 1, 1],
      baseColorTexture: atlasHandle,
      region: [u, v, w, h],
      pivotAndSize: [0.5, 0.5, 1, 1],
      flipY: 1
    }
  };
  const matHandle = world.allocSharedRef(
    "MaterialAsset",
    matPayload
  );
  cache.set(cacheKey, matHandle);
  return matHandle;
}
function resolveAtlasOnlyMaterial(world, tileset, atlasIndex, lookup) {
  const atlasGuid = tileset.atlases[atlasIndex];
  if (atlasGuid === void 0) return toShared(0);
  const atlas = resolveTilesetRuntime(world, atlasGuid, lookup);
  if (!atlas.ok) return toShared(0);
  const atlasHandle = atlas.value.handle;
  const atlasId = unwrapHandle(atlasHandle);
  const cacheKey = String(atlasId);
  const cache = atlasOnlyMaterialCache.get(world) ?? /* @__PURE__ */ new Map();
  atlasOnlyMaterialCache.set(world, cache);
  const cached = cache.get(cacheKey);
  if (cached !== void 0) return cached;
  const matPayload = {
    kind: "material",
    passes: [
      {
        name: "Forward",
        program: { module: "forgeax::sprite" },
        renderState: {
          ...{ blend: SPRITE_PREMULTIPLIED_ALPHA_BLEND },
          tags: { LightMode: "Forward" },
          queue: 3e3
        }
      }
    ],
    values: {
      colorTint: [1, 1, 1, 1],
      baseColorTexture: atlasHandle,
      region: [0, 0, 1, 1],
      pivotAndSize: [0.5, 0.5, 1, 1],
      flipY: 1
    }
  };
  const matHandle = world.allocSharedRef(
    "MaterialAsset",
    matPayload
  );
  cache.set(cacheKey, matHandle);
  return matHandle;
}
function computeRegionUv(tileset, region, atlasIndex) {
  const atlasSize = tileset.atlasSizes?.[atlasIndex];
  const atlasWidth = Math.max(
    1,
    atlasSize !== void 0 ? atlasSize.pixelWidth : tileset.columns * tileset.tileWidth
  );
  const atlasHeight = Math.max(
    1,
    atlasSize !== void 0 ? atlasSize.pixelHeight : tileset.rows * tileset.tileHeight
  );
  const halfTexelU = 0.5 / atlasWidth;
  const halfTexelV = 0.5 / atlasHeight;
  return [
    region.x / atlasWidth + halfTexelU,
    region.y / atlasHeight + halfTexelV,
    region.width / atlasWidth - 2 * halfTexelU,
    region.height / atlasHeight - 2 * halfTexelV
  ];
}
var SQRT1_2 = Math.SQRT1_2;
function effectivePivotYForTilemapFlip(pivotY, pivotX, flipV, flipDiagonal) {
  const base = flipDiagonal ? pivotX : pivotY;
  return flipV ? 1 - base : base;
}
function specFor(layerCols, chunkSize, cellIndex, packedTile, materialHandle, entry, atlasIndex) {
  const cellX = cellIndex % layerCols;
  const cellY = Math.floor(cellIndex / layerCols);
  const chunkX = Math.floor(cellX / chunkSize);
  const chunkY = Math.floor(cellY / chunkSize);
  const chunksPerRow = Math.max(1, Math.ceil(layerCols / chunkSize));
  const chunkIndex = chunkY * chunksPerRow + chunkX;
  const { tileId } = decodeTileBits(packedTile);
  return {
    cellX,
    cellY,
    tileId,
    packedTile,
    materialHandle,
    chunkIndex,
    widthCells: entry.widthCells ?? 1,
    heightCells: entry.heightCells ?? 1,
    pivotX: entry.pivotX ?? 0.5,
    pivotY: entry.pivotY ?? 0.5,
    atlasIndex,
    regionIndex: entry.regionIndex
  };
}
function computeTileTrs(tilemap, spec, packedTile) {
  const { flipH, flipV, flipDiagonal } = decodeTileBits(packedTile);
  const basePivotForX = flipDiagonal ? spec.pivotY : spec.pivotX;
  const effectivePivotX = flipH ? 1 - basePivotForX : basePivotForX;
  const effectivePivotY = effectivePivotYForTilemapFlip(
    spec.pivotY,
    spec.pivotX,
    flipV,
    flipDiagonal
  );
  const tileSizeX = tilemap.tileSize[0] ?? 1;
  const tileSizeY = tilemap.tileSize[1] ?? 1;
  return {
    posX: (spec.cellX + effectivePivotX + (0.5 - effectivePivotX) * spec.widthCells) * tileSizeX,
    posY: (spec.cellY + effectivePivotY + (0.5 - effectivePivotY) * spec.heightCells) * tileSizeY,
    scaleX: (flipH ? -1 : 1) * spec.widthCells * tileSizeX,
    scaleY: (flipV ? -1 : 1) * spec.heightCells * tileSizeY,
    quatZ: flipDiagonal ? SQRT1_2 : 0,
    quatW: flipDiagonal ? SQRT1_2 : 1
  };
}
function spawnDerivedRenderEntities(world, tilemap, layerEntity, layerOrder, spec, packedTile, sortScope = "layer") {
  const { posX, posY, scaleX, scaleY, quatZ, quatW } = computeTileTrs(tilemap, spec, packedTile);
  const layerValue = encodeTilemapLayerValue(layerOrder, spec.chunkIndex, sortScope);
  return world.spawn(
    {
      component: Transform,
      data: {
        pos: [posX, posY, 0],
        quat: [0, 0, quatZ, quatW],
        scale: [scaleX, scaleY, 1]
      }
    },
    { component: MeshFilter, data: { assetHandle: HANDLE_QUAD } },
    {
      component: MeshRenderer,
      data: {
        materials: [spec.materialHandle]
      }
    },
    { component: Layer, data: { value: layerValue } },
    { component: ChildOf, data: { parent: layerEntity } }
  ).unwrap();
}
function spawnSpriteInstancesGroup(world, tilemap, tileset, layerEntity, layerOrder, chunkIndex, atlasIndex, materialHandle, cellSpecs) {
  if (cellSpecs.length === 0) return void 0;
  const N = cellSpecs.length;
  const transforms = new Float32Array(N * 16);
  const regions = new Float32Array(N * 4);
  const tmpMat = mat4.create();
  const tmpT = [0, 0, 0];
  const tmpR = [0, 0, 0, 1];
  const tmpS = [1, 1, 1];
  const chunksPerRow = Math.max(1, Math.ceil(tilemap.cols / tilemap.chunkSize));
  const chunkX = chunkIndex % chunksPerRow;
  const chunkY = Math.floor(chunkIndex / chunksPerRow);
  const chunkScaleX = tilemap.chunkSize * (tilemap.tileSize[0] ?? 1);
  const chunkScaleY = tilemap.chunkSize * (tilemap.tileSize[1] ?? 1);
  const chunkCenterX = (chunkX + 0.5) * chunkScaleX;
  const chunkCenterY = (chunkY + 0.5) * chunkScaleY;
  const invSX = chunkScaleX > 0 ? 1 / chunkScaleX : 1;
  const invSY = chunkScaleY > 0 ? 1 / chunkScaleY : 1;
  for (let i = 0; i < N; i++) {
    const spec = cellSpecs[i];
    const { posX, posY, scaleX, scaleY, quatZ, quatW } = computeTileTrs(
      tilemap,
      spec,
      spec.packedTile
    );
    tmpT[0] = posX;
    tmpT[1] = posY;
    tmpT[2] = 0;
    tmpR[0] = 0;
    tmpR[1] = 0;
    tmpR[2] = quatZ;
    tmpR[3] = quatW;
    tmpS[0] = scaleX;
    tmpS[1] = scaleY;
    tmpS[2] = 1;
    mat4.compose(tmpMat, tmpT, tmpR, tmpS);
    const dst = i * 16;
    for (let c = 0; c < 4; c++) {
      const base = c * 4;
      const w3 = tmpMat[base + 3] ?? 0;
      transforms[dst + base + 0] = ((tmpMat[base + 0] ?? 0) - chunkCenterX * w3) * invSX;
      transforms[dst + base + 1] = ((tmpMat[base + 1] ?? 0) - chunkCenterY * w3) * invSY;
      transforms[dst + base + 2] = tmpMat[base + 2] ?? 0;
      transforms[dst + base + 3] = w3;
    }
    const region = tileset.regions[spec.regionIndex];
    if (region !== void 0) {
      const [u, v, w, h] = computeRegionUv(tileset, region, atlasIndex);
      regions[i * 4 + 0] = u;
      regions[i * 4 + 1] = v;
      regions[i * 4 + 2] = w;
      regions[i * 4 + 3] = h;
    }
  }
  const layerValue = encodeTilemapLayerValue(layerOrder, chunkIndex, "layer");
  return world.spawn(
    {
      component: Transform,
      data: {
        pos: [chunkCenterX, chunkCenterY, 0],
        quat: [0, 0, 0, 1],
        scale: [chunkScaleX, chunkScaleY, 1]
      }
    },
    { component: MeshFilter, data: { assetHandle: HANDLE_QUAD } },
    {
      component: MeshRenderer,
      data: {
        materials: [materialHandle]
      }
    },
    { component: SpriteInstances, data: { transforms, regions } },
    { component: Layer, data: { value: layerValue } },
    { component: ChildOf, data: { parent: layerEntity } }
  ).unwrap();
}
function bucketTileLayer(world, layerEntity, parentEntity, lookup) {
  const tilemapRes = world.get(parentEntity, Tilemap);
  if (!tilemapRes.ok) return void 0;
  const tilemap = tilemapRes.value;
  const tilesetPayload = lookup(tilemap.tileset);
  if (tilesetPayload === void 0 || "code" in tilesetPayload) return void 0;
  if (tilesetPayload.kind !== "tileset") return void 0;
  const tileset = tilesetPayload;
  const layerRes = world.get(layerEntity, TileLayer);
  if (!layerRes.ok) return void 0;
  const layer = layerRes.value;
  const tiles = layer.tiles;
  const sortScope = decodeSortScope(layer.sortScope);
  const useSpriteInstances = sortScope === "layer";
  const specs = [];
  for (let i = 0; i < tiles.length; i++) {
    const packed = tiles[i] ?? 0;
    if (packed === 0) continue;
    const { tileId } = decodeTileBits(packed);
    if (tileId === 0) continue;
    const entry = tileset.tiles[tileId - 1];
    if (entry === void 0) continue;
    const region = tileset.regions[entry.regionIndex];
    if (region === void 0) continue;
    const atlasIndex = region.atlasIndex ?? 0;
    const materialHandle = useSpriteInstances ? resolveAtlasOnlyMaterial(world, tileset, atlasIndex, lookup) : resolveTilesetMaterial(world, tileset, entry.regionIndex, lookup);
    const spec = specFor(
      tilemap.cols,
      tilemap.chunkSize,
      i,
      packed,
      materialHandle,
      entry,
      atlasIndex
    );
    specs.push(spec);
  }
  return {
    tilemap,
    layerOrder: layer.layerOrder,
    sortScope,
    tileset,
    specs
  };
}
function buildCameraFrustumPlanes(world) {
  const query = world.query({ with: [Camera, Transform, GlobalTransform] }).unwrap();
  let result = null;
  for (const row of query) {
    const camEntity = row.entity;
    const camRes = world.get(camEntity, Camera);
    const trRes = world.get(camEntity, GlobalTransform);
    if (!camRes.ok || !trRes.ok) continue;
    const cam = camRes.value;
    const tr = trRes.value;
    const { near, far } = cam;
    if (near >= far) continue;
    const proj = mat4.create();
    if (cam.projection === CAMERA_PROJECTION_ORTHOGRAPHIC) {
      mat4.orthographic(
        proj,
        cam.left,
        cam.right,
        cam.top,
        cam.bottom,
        near,
        far
      );
    } else {
      mat4.perspective(
        proj,
        cam.fov,
        cam.aspect,
        near,
        far
      );
    }
    const view = mat4.create();
    mat4.invert(
      view,
      tr.world
    );
    const vp = mat4.create();
    mat4.multiply(
      vp,
      proj,
      view
    );
    const f = frustum.create();
    frustum.fromViewProjection(f, vp);
    result = f;
    break;
  }
  return result;
}
function computeChunkStreamBounds(tilemap, specs) {
  let minX = Number.MAX_VALUE;
  let minY = Number.MAX_VALUE;
  let maxX = -Number.MAX_VALUE;
  let maxY = -Number.MAX_VALUE;
  for (const spec of specs) {
    const { posX, posY, scaleX, scaleY } = computeTileTrs(tilemap, spec, spec.packedTile);
    const halfW = Math.abs(scaleX) * 0.5;
    const halfH = Math.abs(scaleY) * 0.5;
    const x0 = posX - halfW;
    const x1 = posX + halfW;
    const y0 = posY - halfH;
    const y1 = posY + halfH;
    if (x0 < minX) minX = x0;
    if (y0 < minY) minY = y0;
    if (x1 > maxX) maxX = x1;
    if (y1 > maxY) maxY = y1;
  }
  return [minX, minY, -1, maxX, maxY, 1];
}
function purgeDerivedEntities(world, layerEntity) {
  const r = world.get(layerEntity, Children);
  if (!r.ok) return;
  const snap = r.value.entities;
  for (let i = 0; i < snap.length; i++) {
    const e = snap[i];
    if (e !== void 0) world.despawn(e);
  }
}
function evictDeadPerCellStreamingCaches(work, world) {
  const cache = streamingCache(world);
  const aliveLayerKeys = /* @__PURE__ */ new Set();
  for (const w of work) {
    aliveLayerKeys.add(String(w.layerEntity));
  }
  const deadLayerKeys = /* @__PURE__ */ new Set();
  for (const layerKey of cache.activeChunks.keys()) {
    if (!aliveLayerKeys.has(layerKey)) deadLayerKeys.add(layerKey);
  }
  for (const layerKey of cache.layers.keys()) {
    if (!aliveLayerKeys.has(layerKey)) deadLayerKeys.add(layerKey);
  }
  for (const deadKey of deadLayerKeys) {
    const activeSet = cache.activeChunks.get(deadKey);
    if (activeSet !== void 0) {
      for (const chunkIdx of activeSet) {
        cache.chunkEntities.delete(`${deadKey}:${chunkIdx}`);
      }
      cache.activeChunks.delete(deadKey);
    }
    cache.layers.delete(deadKey);
  }
}
function tilemapChunkExtractSystem(world, lookup = () => void 0) {
  const streaming = streamingCache(world);
  const work = [];
  const tileLayerQuery = world.query({ read: [TileLayer, ChildOf] }).unwrap();
  for (const row of tileLayerQuery) {
    const layer = row.get(TileLayer);
    const parent = row.get(ChildOf).parent;
    if (parent === null) continue;
    work.push({
      layerEntity: row.entity,
      parentEntity: parent,
      dirty: layer.dirty,
      sortScopeRaw: layer.sortScope
    });
  }
  evictDeadPerCellStreamingCaches(work, world);
  let frustumPlanes;
  for (const w of work) {
    const layerKey = String(w.layerEntity);
    const isStreaming = decodeSortScope(w.sortScopeRaw) === "per-cell";
    if (!isStreaming) {
      const childrenRes = world.get(w.layerEntity, Children);
      const childCount = childrenRes.ok ? childrenRes.value.entities.length : 0;
      if (childCount > 0 && w.dirty === 0) continue;
      purgeDerivedEntities(world, w.layerEntity);
      const bucket = bucketTileLayer(world, w.layerEntity, w.parentEntity, lookup);
      if (bucket === void 0) continue;
      const byChunkAtlas = /* @__PURE__ */ new Map();
      for (const spec of bucket.specs) {
        const key = (spec.chunkIndex & 1048575) << 16 | spec.atlasIndex & 65535;
        const list = byChunkAtlas.get(key);
        if (list === void 0) {
          byChunkAtlas.set(key, [spec]);
        } else {
          list.push(spec);
        }
      }
      for (const groupSpecs of byChunkAtlas.values()) {
        const first = groupSpecs[0];
        if (first === void 0) continue;
        spawnSpriteInstancesGroup(
          world,
          bucket.tilemap,
          bucket.tileset,
          w.layerEntity,
          bucket.layerOrder,
          first.chunkIndex,
          first.atlasIndex,
          first.materialHandle,
          groupSpecs
        );
      }
      if (w.dirty !== 0) {
        world.set(w.layerEntity, TileLayer, { dirty: 0 }).unwrap();
      }
      continue;
    }
    if (w.dirty !== 0 || !streaming.layers.has(layerKey)) {
      const activeSet2 = streaming.activeChunks.get(layerKey);
      if (activeSet2 !== void 0) {
        for (const chunkIdx of activeSet2) {
          const key = `${layerKey}:${chunkIdx}`;
          const entities = streaming.chunkEntities.get(key);
          if (entities !== void 0) {
            for (const e of entities) world.despawn(e);
            streaming.chunkEntities.delete(key);
          }
        }
        activeSet2.clear();
      }
      streaming.layers.delete(layerKey);
      const bucket = bucketTileLayer(world, w.layerEntity, w.parentEntity, lookup);
      if (bucket !== void 0) {
        const byChunkSpecs = /* @__PURE__ */ new Map();
        for (const spec of bucket.specs) {
          const list = byChunkSpecs.get(spec.chunkIndex);
          if (list === void 0) {
            byChunkSpecs.set(spec.chunkIndex, [spec]);
          } else {
            list.push(spec);
          }
        }
        const byChunk = /* @__PURE__ */ new Map();
        for (const [chunkIdx, specs] of byChunkSpecs) {
          byChunk.set(chunkIdx, {
            specs,
            bounds: computeChunkStreamBounds(bucket.tilemap, specs)
          });
        }
        streaming.layers.set(layerKey, {
          byChunk,
          tilemap: bucket.tilemap,
          layerOrder: bucket.layerOrder,
          sortScope: bucket.sortScope
        });
      }
      if (w.dirty !== 0) {
        world.set(w.layerEntity, TileLayer, { dirty: 0 }).unwrap();
      }
    }
    const cache = streaming.layers.get(layerKey);
    if (cache === void 0) continue;
    if (frustumPlanes === void 0) {
      frustumPlanes = buildCameraFrustumPlanes(world);
    }
    const activeSet = streaming.activeChunks.get(layerKey) ?? /* @__PURE__ */ new Set();
    streaming.activeChunks.set(layerKey, activeSet);
    const { tilemap } = cache;
    for (const [chunkIdx, entry] of cache.byChunk) {
      const { specs, bounds } = entry;
      const visible = frustumPlanes === null || frustum.intersectsBox(frustumPlanes, bounds);
      const wasActive = activeSet.has(chunkIdx);
      if (visible && !wasActive) {
        const spawned = [];
        for (const spec of specs) {
          const e = spawnDerivedRenderEntities(
            world,
            tilemap,
            w.layerEntity,
            cache.layerOrder,
            spec,
            spec.packedTile,
            cache.sortScope
          );
          spawned.push(e);
        }
        streaming.chunkEntities.set(`${layerKey}:${chunkIdx}`, spawned);
        activeSet.add(chunkIdx);
      } else if (!visible && wasActive) {
        const key = `${layerKey}:${chunkIdx}`;
        const entities = streaming.chunkEntities.get(key);
        if (entities !== void 0) {
          for (const e of entities) world.despawn(e);
          streaming.chunkEntities.delete(key);
        }
        activeSet.delete(chunkIdx);
      }
    }
  }
}

// src/scene/source-systems.ts
var nextId = 0;
function registerRenderSourceSystems(world, assets, meshes) {
  const releaseTransforms = registerPropagateTransforms(world);
  const name = `renderDerived:${++nextId}`;
  const result = world.addSystem(Update, {
    name,
    queries: [],
    fn: (world2) => {
      tilemapChunkExtractSystem(world2, (guid) => assets.lookup(guid));
      glyphTextLayoutSystem(world2, meshes).unwrap();
    }
  });
  if (!result.ok) {
    releaseTransforms();
    throw result.error;
  }
  return () => {
    world.removeSystem(Update, name).unwrap();
    releaseTransforms();
  };
}

// src/extract/material-context.ts
function renderMaterialContext(caps) {
  if (caps.backendKind === "null") return {};
  return {
    materialContext: {
      backend: caps.backendKind === "wgpu-webgl2" ? "webgl2" : caps.backendKind,
      capability: caps.storageBuffer ? "storage-buffer" : "uniform-fallback",
      pipeline: "forward",
      geometry: "mesh",
      pass: "forward",
      profile: "forgeax-material-wgsl-v1",
      toolchain: "naga-oil",
      instrumentation: "none"
    }
  };
}
var RENDERABLE_SOURCE_COMPONENTS = [
  ChildOf,
  MeshFilter,
  MeshRenderer,
  Instances,
  SpriteInstances,
  SpriteRegionOverride,
  Skin,
  Layer,
  Visibility,
  MorphWeights,
  Points,
  Lines,
  SortKey
];
function createGlobalTransformChangeQuery(world) {
  const result = world.query({ read: [GlobalTransform], changed: [GlobalTransform] });
  if (!result.ok) throw result.error;
  const query = result.value;
  for (const _span of query.spans().unwrap()) {
  }
  return query;
}
function createRenderSourceState(world, additional = []) {
  const components = [
    ...RENDERABLE_SOURCE_COMPONENTS,
    RuntimeMaterialValue,
    RuntimeMeshVertices,
    ...additional
  ];
  const projection = createStateProjection(world, components, [
    ...components,
    Transform,
    GlobalTransform
  ]);
  const entities = /* @__PURE__ */ new Map();
  const contentHandles = /* @__PURE__ */ new Map();
  const batch = projection.read();
  for (const index of batch.indices) {
    const entity = projection.entity(index);
    if (entity !== void 0) {
      entities.set(index, entity);
      const handles = [];
      const material = world.hasComponent(entity, RuntimeMaterialValue) ? world.get(entity, RuntimeMaterialValue) : void 0;
      const mesh = world.hasComponent(entity, RuntimeMeshVertices) ? world.get(entity, RuntimeMeshVertices) : void 0;
      if (material?.ok) handles.push(Number(material.value.asset));
      if (mesh?.ok) handles.push(Number(mesh.value.asset));
      if (handles.length > 0) contentHandles.set(index, handles);
    }
  }
  return { projection, entities, contentHandles, batch };
}
function isRenderableMember(world, entity) {
  return world.hasComponent(entity, MeshRenderer) && world.hasComponent(entity, Transform) && world.hasComponent(entity, MeshFilter);
}

export { BARREL_DISTORTION_FEATURE_IDENTITY, BARREL_DISTORTION_POST_PROCESS_ID, BARREL_DISTORTION_WGSL, BARREL_DISTORTION_WGSL_COORDINATE, CLOUD_DENSITY_COMPUTE_WGSL, CLOUD_HISTORY_FULLSCREEN_WGSL, CLOUD_HISTORY_SURFACE_COUNT, CLOUD_LAYER_DENSITY_BINDINGS, CLOUD_LAYER_DENSITY_CACHE, CLOUD_LAYER_DENSITY_OUTPUT, CLOUD_LAYER_DENSITY_PROGRAM, CLOUD_LAYER_FEATURE_IDENTITY, CLOUD_RGBA16FLOAT_BYTES_PER_TEXEL, CLOUD_VIEW_FULLSCREEN_WGSL, CLOUD_VIEW_PARAMS_BYTES, CloudHistoryStore, DEFAULT_REFLECTION_PROBE_LIMITS, DynamicGeometryError, DynamicInputError, LOD_OCCLUSION_INSPECTION_MAX_BYTES, LOD_OCCLUSION_INSPECTION_SCHEMA, RENDERABLE_SOURCE_COMPONENTS, ReadonlyDynamicInputPage, ReflectionProbeProjection, RenderPublicationError, RenderPublicationTargetOwner, RenderPublicationTargetReceiver, SSR_FORMAT_PROFILE, SSR_FORMAT_STAGES, acceptCloudLayerGeneration, acquireSwapChainTarget, admitPointsLines, admitReflectionProbe, admitSingleLayerMediumSubmission, admitSsrM0, admitSsrSpatial, advanceProbeFilter, applyCloudSolarTransmittance, boxProjectReflectionDirection, buildCloudDensityCache, buildReflectionProbeTable, cloudCapabilitiesFromRhi, cloudTemporalResetReasons, cloudTemporalSignature, commitProbeFilterStep, compositeCloudRadiance, consumeLodOcclusionInspection, createBarrelDistortionRenderFeature, createCloudHistory, createCloudLayerFeature, createCloudShadowProjection, createDynamicGeometryLifecycle, createGlobalTransformChangeQuery, createProbeFilterState, createRenderSourceState, createRenderTargetHost, deriveReflectionFallbackProjection, estimateReflectionProbeBytes, evaluateCloudDensity, graphExecutionPhase, inspectCloudLayer, inspectCloudLayerResources, inspectLodOcclusion, inspectPointShadow, inspectReflectionFallback, inspectVolumetricFog, integrateCloudCameraPath, integrateCloudInterior, integrateCloudPath, integrateCloudSolarColumn, intersectCloudLayer, isRenderableMember, probeFilterIsSteady, projectCloudShadowUv, projectSsrDependencies, projectSsrSpatialInspection, publicationDependencies, publicationFrameDependencies, publicationTargetSources, reconstructCloudDensityCache, reflectionFallbackCoverage, reflectionFallbackProjectionSignature, reflectionFallbackSourceKey, reflectionProbeTableBytes, registerRenderSourceSystems, renderMaterialContext, renderPublicationTransfers, reprojectCloudHistory, resolveDirectionalShadowAtlasGrid, resolveReflectionFallbackSource, resolveShadowMapSize, resolveSpotShadowMapSize, resolveSsrAdmissionGeneration, retainCloudLayerAfterFailure, sameCandidateCredential, sampleCloudDensity, sampleCloudShadow, selectReflectionProbe, serializeLodOcclusionInspection, serializeSsrSpatialInspection, snapshotCloudDensityCache, validateReflectionProbeInput, validateScreenSpaceReflection, zeroSsrAdmissionWork };
