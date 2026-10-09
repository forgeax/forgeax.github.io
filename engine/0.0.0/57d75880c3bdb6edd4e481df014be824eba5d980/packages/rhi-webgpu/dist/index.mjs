import { err, RhiError, ok, R32FLOAT_PROBE_STAGES, validateR32FloatReceipt, createUnavailableR32FloatReceipt } from '../../rhi/dist/index.mjs';
export { RhiError as RhiErrorClass, err, ok } from '../../rhi/dist/index.mjs';

// src/index.ts
function adapterUnavailable() {
  return err(
    new RhiError({
      code: "adapter-unavailable",
      expected: "an available browser-native WebGPU adapter",
      hint: "this only reports the browser-native WebGPU channel; ForgeaX may continue through its wgpu/WebGL2 fallback, so do not conclude that the browser or machine is unsupported unless both backend causes fail"
    })
  );
}
function requestAdapterFailed(cause) {
  const record = cause !== null && typeof cause === "object" ? cause : void 0;
  const name = typeof record?.name === "string" && record.name.length > 0 ? record.name : void 0;
  let message = typeof record?.message === "string" && record.message.length > 0 ? record.message : typeof cause === "string" ? cause : "";
  if (message.length === 0 && cause !== void 0) {
    try {
      const serialized = JSON.stringify(cause);
      message = serialized && serialized !== "{}" ? serialized : "unknown thrown object";
    } catch {
      message = "unserializable thrown object";
    }
  }
  if (message.length === 0) message = "unknown requestAdapter failure";
  return err(
    new RhiError({
      code: "webgpu-runtime-error",
      expected: "navigator.gpu.requestAdapter() resolves with an adapter or null",
      hint: "inspect detail.error before assigning the failure to WebGPU capability; the ForgeaX runtime can still attempt its wgpu/WebGL2 fallback",
      detail: {
        error: {
          code: "request-adapter-threw",
          ...name === void 0 ? {} : { name },
          message
        }
      }
    })
  );
}
function featureNotEnabled(featureName) {
  const fname = "compute";
  return err(
    new RhiError({
      code: "feature-not-enabled",
      expected: `feature ${fname} to be enabled`,
      hint: `verify device.features.${fname} before calling this entry point`
    })
  );
}
function limitExceeded(limitName) {
  const lname = "maxBindGroups";
  return err(
    new RhiError({
      code: "limit-exceeded",
      expected: `${lname} to be within bounds`,
      hint: `verify device.limits.${lname}`
    })
  );
}
function shaderCompileFailed(compilerMessages) {
  const detail = { compilerMessages };
  return err(
    new RhiError({
      code: "shader-compile-failed",
      expected: "valid WGSL source",
      hint: "inspect RhiError.detail.compilerMessages (each entry: { message, type, lineNum, linePos, offset, length } per WebGPU GPUCompilationMessage shape)",
      detail
    })
  );
}
function commandEncoderFinished() {
  return err(
    new RhiError({
      code: "command-encoder-finished",
      expected: "command encoder must not be finished before recording new commands",
      hint: "create a new command encoder via device.createCommandEncoder() for each frame; do not reuse a finished encoder"
    })
  );
}
function renderPassNotEnded() {
  return err(
    new RhiError({
      code: "render-pass-not-ended",
      expected: "previous render pass must be ended before beginning a new pass or finishing the encoder",
      hint: "call pass.end() before beginRenderPass() or encoder.finish()"
    })
  );
}
function queueSubmitFailed(detailMessage) {
  const baseHint = "check if any referenced buffer / pipeline / texture has been destroyed before submit";
  const hint = detailMessage !== void 0 && detailMessage.length > 0 ? `${baseHint}; underlying GPU error: ${detailMessage}` : baseHint;
  return err(
    new RhiError({
      code: "queue-submit-failed",
      expected: "command buffer references must be valid at submit time (not destroyed; not from a different device)",
      hint
    })
  );
}
function queueWriteBufferOutOfBounds(args) {
  return err(
    new RhiError({
      code: "queue-write-buffer-out-of-bounds",
      expected: "writeBuffer offset + data.byteLength must be <= buffer.size; offset must be 4-byte aligned",
      hint: `verify offset alignment and bounds: offset (got ${args.offset}) + data.byteLength (got ${args.byteLength}) must be <= buffer.size (got ${args.bufferSize})`
    })
  );
}
var TEXTURE_BINDING = 4;
var STORAGE_BINDING = 8;
var COPY_SRC = 1;
var COPY_DST = 2;
var MAP_READ = 1;
var BUFFER_COPY_DST = 8;
async function probeR32FloatCapability(rawDevice, deviceGeneration) {
  let stage = "texture-create";
  let texture;
  let readback;
  rawDevice.pushErrorScope("validation");
  try {
    texture = rawDevice.createTexture({
      size: { width: 2, height: 2, depthOrArrayLayers: 1 },
      format: "r32float",
      mipLevelCount: 2,
      usage: TEXTURE_BINDING | STORAGE_BINDING | COPY_SRC | COPY_DST
    });
    stage = "mip-view";
    const sourceView = texture.createView({ baseMipLevel: 0, mipLevelCount: 1 });
    const destinationView = texture.createView({ baseMipLevel: 1, mipLevelCount: 1 });
    stage = "sampled-storage-bind-group";
    const layout = rawDevice.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: 4,
          texture: { sampleType: "unfilterable-float", viewDimension: "2d" }
        },
        {
          binding: 1,
          visibility: 4,
          storageTexture: { access: "write-only", format: "r32float", viewDimension: "2d" }
        }
      ]
    });
    const bindGroup = rawDevice.createBindGroup({
      layout,
      entries: [
        { binding: 0, resource: sourceView },
        { binding: 1, resource: destinationView }
      ]
    });
    stage = "pipeline-bind";
    const shader = rawDevice.createShaderModule({
      code: `
        @group(0) @binding(0) var source: texture_2d<f32>;
        @group(0) @binding(1) var destination: texture_storage_2d<r32float, write>;
        @compute @workgroup_size(1) fn main() {
          let value = textureLoad(source, vec2i(0, 0), 0).r;
          textureStore(destination, vec2i(0, 0), vec4f(value));
        }
      `
    });
    const pipeline = rawDevice.createComputePipeline({
      layout: rawDevice.createPipelineLayout({ bindGroupLayouts: [layout] }),
      compute: { module: shader, entryPoint: "main" }
    });
    const encoder = rawDevice.createCommandEncoder({ label: "r32float-profile" });
    const pass = encoder.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(1);
    pass.end();
    stage = "finish";
    readback = rawDevice.createBuffer({ size: 256, usage: MAP_READ | BUFFER_COPY_DST });
    encoder.copyTextureToBuffer(
      { texture, mipLevel: 1 },
      { buffer: readback, bytesPerRow: 256, rowsPerImage: 1 },
      { width: 1, height: 1, depthOrArrayLayers: 1 }
    );
    const commandBuffer = encoder.finish();
    stage = "submit";
    rawDevice.queue.submit([commandBuffer]);
    stage = "completion";
    await rawDevice.queue.onSubmittedWorkDone();
    const validationError = await rawDevice.popErrorScope();
    if (validationError !== null) {
      throw new Error(`WebGPU validation: ${validationError.message}`);
    }
    stage = "readback";
    await readback.mapAsync(MAP_READ);
    const values = Array.from(new Float32Array(readback.getMappedRange(0, 4).slice(0)));
    readback.unmap();
    const receipt = {
      profile: "r32float-mip-sampled-storage",
      verdict: "admitted",
      evidence: "real",
      deviceGeneration,
      stages: R32FLOAT_PROBE_STAGES.map((entry) => ({
        stage: entry,
        verdict: "admitted",
        evidence: "real"
      })),
      sampleType: "unfilterable-float",
      usages: ["texture-binding", "storage-binding", "copy-src"],
      readback: { byteLength: 4, values },
      probeExecutions: 1
    };
    const validated = validateR32FloatReceipt(receipt);
    return validated.ok ? ok(validated.value) : validated;
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    createUnavailableR32FloatReceipt({
      deviceGeneration,
      failedStage: stage,
      detail: message
    });
    return err(
      new RhiError({
        code: "rhi-texture-format-capability-unavailable",
        expected: `r32float profile stage ${stage} to complete on the live WebGPU device`,
        hint: "retain fallback-only rendering and inspect the device validation error",
        detail: {
          stage,
          deviceGeneration,
          reason: message
        }
      })
    );
  } finally {
    texture?.destroy();
    readback?.destroy();
  }
}
function resolveTimestampQueries(args) {
  try {
    args.rawEncoder.resolveQuerySet(
      args.rawQuerySet,
      args.firstQuery,
      args.queryCount,
      args.rawDestination,
      args.destinationOffset
    );
    return ok(void 0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return err(
      new RhiError({
        code: "webgpu-runtime-error",
        expected: "underlying GPUCommandEncoder.resolveQuerySet to succeed",
        hint: `resolveQuerySet raised: ${message}`
      })
    );
  }
}

// src/device.ts
function mirror(src, keys) {
  const out = {};
  for (const k of keys) {
    if (k in src) {
      out[k] = src[k];
    }
  }
  return out;
}
var BUFFER_KEYS = ["label", "size", "usage", "mappedAtCreation"];
var TEXTURE_KEYS = [
  "label",
  "size",
  "mipLevelCount",
  "sampleCount",
  "dimension",
  "format",
  "usage",
  "viewFormats",
  "textureBindingViewDimension"
];
var SAMPLER_KEYS = [
  "label",
  "addressModeU",
  "addressModeV",
  "addressModeW",
  "magFilter",
  "minFilter",
  "mipmapFilter",
  "lodMinClamp",
  "lodMaxClamp",
  "compare",
  "maxAnisotropy"
];
var BGL_KEYS = ["label", "entries"];
var PL_KEYS = ["label", "bindGroupLayouts"];
var ENC_KEYS = ["label"];
var TEXTURE_VIEW_KEYS = [
  "label",
  "format",
  "dimension",
  "usage",
  "aspect",
  "baseMipLevel",
  "mipLevelCount",
  "baseArrayLayer",
  "arrayLayerCount"
];
var CP_KEYS = ["label", "layout", "compute"];
var QS_KEYS = ["label", "type", "count"];
var QUERY_SET_COUNT_LIMIT = 4096;
var RAW_DEVICE_MAP = /* @__PURE__ */ new WeakMap();
var RAW_DEVICE_GENERATION_MAP = /* @__PURE__ */ new WeakMap();
var R32FLOAT_PROBE_CACHE = /* @__PURE__ */ new WeakMap();
var NEXT_DEVICE_GENERATION = 1;
var BUFFER_RAW_MAP = /* @__PURE__ */ new WeakMap();
var TEXTURE_VIEW_RAW_MAP = /* @__PURE__ */ new WeakMap();
var ENCODER_STATE = /* @__PURE__ */ new WeakMap();
var PASS_STATE = /* @__PURE__ */ new WeakMap();
var COMMAND_BUFFER_RAW_MAP = /* @__PURE__ */ new WeakMap();
var TEXTURE_META_MAP = /* @__PURE__ */ new WeakMap();
var QUERY_SET_RAW_MAP = /* @__PURE__ */ new WeakMap();
var QUERY_SET_DESTROYED_MAP = /* @__PURE__ */ new WeakMap();
var BUFFER_META_MAP = /* @__PURE__ */ new WeakMap();
var BUFFER_USAGE_QUERY_RESOLVE = 512;
var QUERY_RESOLVE_ALIGNMENT = 256;
function _internal_getRawDevice(device) {
  return RAW_DEVICE_MAP.get(device);
}
function probeRgba16floatRenderable(device) {
  let tex;
  try {
    tex = device.createTexture({
      label: "forgeax-caps-probe-rgba16float-renderable",
      format: "rgba16float",
      usage: 16,
      // GPUTextureUsage.RENDER_ATTACHMENT
      size: [1, 1, 1]
    });
    return true;
  } catch {
    return false;
  } finally {
    tex?.destroy?.();
  }
}
function probeRg11b10ufloatRenderable(device, features) {
  if (!features.has("rg11b10ufloat-renderable")) return false;
  let tex;
  try {
    tex = device.createTexture({
      label: "forgeax-caps-probe-rg11b10ufloat-renderable",
      format: "rg11b10ufloat",
      usage: 16,
      // GPUTextureUsage.RENDER_ATTACHMENT
      size: [1, 1, 1]
    });
    return true;
  } catch {
    return false;
  } finally {
    tex?.destroy?.();
  }
}
function probeFloat32Filterable(device, features) {
  if (!features.has("float32-filterable")) return false;
  try {
    device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: 2, sampler: { type: "filtering" } },
        // GPUShaderStage.FRAGMENT = 2
        { binding: 1, visibility: 2, texture: { sampleType: "float" } }
      ]
    });
    device.createSampler({ minFilter: "linear", magFilter: "linear" });
    return true;
  } catch {
    return false;
  }
}
function deriveCaps(rawDevice, features, limits) {
  const has = (name) => features.has(name);
  const textureCompressionBc = has("texture-compression-bc");
  const textureCompressionEtc2 = has("texture-compression-etc2");
  const textureCompressionAstc = has("texture-compression-astc");
  const hdrCaps = {
    rgba16floatRenderable: probeRgba16floatRenderable(rawDevice),
    rg11b10ufloatRenderable: probeRg11b10ufloatRenderable(rawDevice, features),
    float32Filterable: probeFloat32Filterable(rawDevice, features)
  };
  return {
    backendKind: "webgpu",
    compute: true,
    // WebGPU spec mandates compute-pipeline support.
    timestampQuery: has("timestamp-query"),
    timestampPeriodNanoseconds: has("timestamp-query") ? 1 : null,
    indirectDrawing: true,
    // WebGPU spec mandates drawIndirect / drawIndexedIndirect.
    textureCompressionBc,
    textureCompressionEtc2,
    textureCompressionAstc,
    multiDrawIndirect: false,
    // wgpu native extension; unavailable on WebGPU browser path.
    pushConstants: false,
    // wgpu native extension; unavailable on WebGPU browser path.
    textureBindingArray: false,
    // wgpu native extension; unavailable on WebGPU browser path.
    // 4 new fields (D-P3 / R-03 §3.1):
    samplerAliasing: true,
    // spec mandatory on browser backends.
    firstInstanceIndirect: has("indirect-first-instance"),
    storageBuffer: (limits.maxStorageBuffersPerShaderStage ?? 0) > 0,
    storageTexture: (limits.maxStorageTexturesPerShaderStage ?? 0) > 0,
    // HDR / filterable caps (feat-20260608 M1):
    ...hdrCaps,
    maxColorAttachments: limits.maxColorAttachments ?? 4
  };
}
function makeRenderPassEncoder(rawPass, encoder, occlusionQuerySet) {
  const pass = {
    setPipeline(pipeline) {
      rawPass.setPipeline(pipeline);
    },
    setVertexBuffer(slot, buffer, offset, size) {
      const rawBuf = BUFFER_RAW_MAP.get(buffer) ?? buffer;
      rawPass.setVertexBuffer(slot, rawBuf, offset, size);
    },
    setIndexBuffer(buffer, format, offset, size) {
      const rawBuf = BUFFER_RAW_MAP.get(buffer) ?? buffer;
      rawPass.setIndexBuffer(rawBuf, format, offset, size);
    },
    setBindGroup(index, bindGroup, arg3, arg4, arg5) {
      if (arg3 instanceof Uint32Array) {
        rawPass.setBindGroup(
          index,
          bindGroup,
          arg3,
          arg4 ?? 0,
          arg5 ?? arg3.length
        );
      } else if (arg3 === void 0) {
        rawPass.setBindGroup(index, bindGroup);
      } else {
        rawPass.setBindGroup(index, bindGroup, arg3);
      }
    },
    draw(vertexCount, instanceCount, firstVertex, firstInstance) {
      rawPass.draw(vertexCount, instanceCount, firstVertex, firstInstance);
    },
    drawIndexed(indexCount, instanceCount, firstIndex, baseVertex, firstInstance) {
      rawPass.drawIndexed(indexCount, instanceCount, firstIndex, baseVertex, firstInstance);
    },
    setViewport(x, y, w, h, minDepth, maxDepth) {
      rawPass.setViewport(x, y, w, h, minDepth, maxDepth);
    },
    setScissorRect(x, y, w, h) {
      rawPass.setScissorRect(x, y, w, h);
    },
    setBlendConstant(color) {
      rawPass.setBlendConstant(color);
    },
    setStencilReference(reference) {
      rawPass.setStencilReference(reference);
    },
    drawIndirect(indirectBuffer, indirectOffset) {
      const rawBuf = BUFFER_RAW_MAP.get(indirectBuffer) ?? indirectBuffer;
      rawPass.drawIndirect(rawBuf, indirectOffset);
    },
    drawIndexedIndirect(indirectBuffer, indirectOffset) {
      const rawBuf = BUFFER_RAW_MAP.get(indirectBuffer) ?? indirectBuffer;
      rawPass.drawIndexedIndirect(rawBuf, indirectOffset);
    },
    pushDebugGroup(groupLabel) {
      rawPass.pushDebugGroup(groupLabel);
    },
    popDebugGroup() {
      rawPass.popDebugGroup();
    },
    insertDebugMarker(markerLabel) {
      rawPass.insertDebugMarker(markerLabel);
    },
    executeBundles(_bundles) {
      return err(
        new RhiError({
          code: "rhi-not-available",
          expected: "render bundle creation requires future closed loop",
          hint: "see feat-future-rhi-render-bundle"
        })
      );
    },
    beginOcclusionQuery(queryIndex) {
      const state = PASS_STATE.get(pass);
      if (state === void 0) {
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "render pass state must exist",
            hint: "beginOcclusionQuery called on an untracked render pass"
          })
        );
      }
      if (state.occlusionQuerySet === null) {
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "GPURenderPassDescriptor.occlusionQuerySet must be set",
            hint: "pass occlusionQuerySet in RenderPassDescriptor before beginOcclusionQuery"
          })
        );
      }
      if (state.occlusionQueryActive) {
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "[[occlusion_query_active]] == false; pair beginOcclusionQuery / endOcclusionQuery",
            hint: "call endOcclusionQuery() before beginOcclusionQuery() again; occlusion queries cannot nest (spec \xA7render-passes)"
          })
        );
      }
      const rawQs = QUERY_SET_RAW_MAP.get(state.occlusionQuerySet);
      const qsCount = rawQs !== void 0 && typeof rawQs.count === "number" ? rawQs.count : Number.MAX_SAFE_INTEGER;
      if (queryIndex < 0 || queryIndex >= qsCount) {
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "queryIndex < querySet.count",
            hint: `got queryIndex=${queryIndex}; querySet.count=${qsCount}`
          })
        );
      }
      if (state.occlusionQueryWritten.has(queryIndex)) {
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "queryIndex must not have been written in this pass",
            hint: `queryIndex=${queryIndex} was already written; cross-pass reuse on the same querySet is legal but in-pass reuse is not (spec \xA7queries)`
          })
        );
      }
      try {
        rawPass.beginOcclusionQuery(queryIndex);
        state.occlusionQueryActive = true;
        state.occlusionQueryWritten.add(queryIndex);
        return ok(void 0);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "underlying GPURenderPassEncoder.beginOcclusionQuery to succeed",
            hint: `beginOcclusionQuery raised: ${message}`
          })
        );
      }
    },
    endOcclusionQuery() {
      const state = PASS_STATE.get(pass);
      if (state === void 0) {
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "render pass state must exist",
            hint: "endOcclusionQuery called on an untracked render pass"
          })
        );
      }
      if (!state.occlusionQueryActive) {
        return renderPassNotEnded();
      }
      try {
        rawPass.endOcclusionQuery();
        state.occlusionQueryActive = false;
        return ok(void 0);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "underlying GPURenderPassEncoder.endOcclusionQuery to succeed",
            hint: `endOcclusionQuery raised: ${message}`
          })
        );
      }
    },
    end() {
      const state = PASS_STATE.get(pass);
      if (state !== void 0) {
        state.ended = true;
      }
      rawPass.end();
      const encState = ENCODER_STATE.get(encoder);
      if (encState !== void 0 && encState.activePass === pass) {
        encState.activePass = null;
      }
    }
  };
  PASS_STATE.set(pass, {
    raw: rawPass,
    ended: false,
    encoder,
    occlusionQuerySet,
    occlusionQueryActive: false,
    occlusionQueryWritten: /* @__PURE__ */ new Set()
  });
  return pass;
}
var ENCODER_FINISHED_ERROR_ARGS = {
  code: "command-encoder-finished",
  expected: "command encoder must not be finished before recording new commands",
  hint: "create a new command encoder via device.createCommandEncoder() for each frame; do not reuse a finished encoder"
};
function throwIfFinished(state) {
  if (state?.finished) {
    throw new RhiError(ENCODER_FINISHED_ERROR_ARGS);
  }
}
function rawTextureView(view) {
  return TEXTURE_VIEW_RAW_MAP.get(view) ?? view;
}
function mirrorRenderPassDescriptor(desc) {
  const colorAttachments = [];
  for (const attachment of desc.colorAttachments) {
    if (attachment === null || attachment === void 0) {
      colorAttachments.push(null);
      continue;
    }
    if (attachment.loadOp === void 0 || attachment.storeOp === void 0) {
      throw new TypeError("RHI render-pass color attachments require loadOp and storeOp");
    }
    colorAttachments.push({
      view: rawTextureView(attachment.view),
      ...attachment.depthSlice === void 0 ? {} : { depthSlice: attachment.depthSlice },
      ...attachment.resolveTarget === void 0 ? {} : { resolveTarget: rawTextureView(attachment.resolveTarget) },
      ...attachment.clearValue === void 0 ? {} : { clearValue: attachment.clearValue },
      loadOp: attachment.loadOp,
      storeOp: attachment.storeOp
    });
  }
  return {
    ...desc.label === void 0 ? {} : { label: desc.label },
    colorAttachments,
    ...desc.depthStencilAttachment === void 0 ? {} : {
      depthStencilAttachment: {
        view: rawTextureView(desc.depthStencilAttachment.view),
        ...desc.depthStencilAttachment.depthClearValue === void 0 ? {} : { depthClearValue: desc.depthStencilAttachment.depthClearValue },
        ...desc.depthStencilAttachment.depthLoadOp === void 0 ? {} : { depthLoadOp: desc.depthStencilAttachment.depthLoadOp },
        ...desc.depthStencilAttachment.depthStoreOp === void 0 ? {} : { depthStoreOp: desc.depthStencilAttachment.depthStoreOp },
        ...desc.depthStencilAttachment.depthReadOnly === void 0 ? {} : { depthReadOnly: desc.depthStencilAttachment.depthReadOnly },
        ...desc.depthStencilAttachment.stencilClearValue === void 0 ? {} : { stencilClearValue: desc.depthStencilAttachment.stencilClearValue },
        ...desc.depthStencilAttachment.stencilLoadOp === void 0 ? {} : { stencilLoadOp: desc.depthStencilAttachment.stencilLoadOp },
        ...desc.depthStencilAttachment.stencilStoreOp === void 0 ? {} : { stencilStoreOp: desc.depthStencilAttachment.stencilStoreOp },
        ...desc.depthStencilAttachment.stencilReadOnly === void 0 ? {} : { stencilReadOnly: desc.depthStencilAttachment.stencilReadOnly }
      }
    },
    ...desc.occlusionQuerySet === void 0 ? {} : {
      occlusionQuerySet: QUERY_SET_RAW_MAP.get(desc.occlusionQuerySet) ?? desc.occlusionQuerySet
    },
    ...desc.timestampWrites === void 0 ? {} : {
      timestampWrites: {
        querySet: QUERY_SET_RAW_MAP.get(desc.timestampWrites.querySet) ?? desc.timestampWrites.querySet,
        ...desc.timestampWrites.beginningOfPassWriteIndex === void 0 ? {} : { beginningOfPassWriteIndex: desc.timestampWrites.beginningOfPassWriteIndex },
        ...desc.timestampWrites.endOfPassWriteIndex === void 0 ? {} : { endOfPassWriteIndex: desc.timestampWrites.endOfPassWriteIndex }
      }
    },
    ...desc.maxDrawCount === void 0 ? {} : { maxDrawCount: desc.maxDrawCount }
  };
}
function mirrorRenderPipelineDescriptor(desc) {
  const vertex = {
    module: desc.vertex.module,
    ...desc.vertex.buffers === void 0 ? {} : { buffers: Array.from(desc.vertex.buffers) },
    ...desc.vertex.entryPoint === void 0 ? {} : { entryPoint: desc.vertex.entryPoint },
    ...desc.vertex.constants === void 0 ? {} : { constants: desc.vertex.constants }
  };
  const fragment = desc.fragment === void 0 ? void 0 : {
    module: desc.fragment.module,
    targets: Array.from(desc.fragment.targets),
    ...desc.fragment.entryPoint === void 0 ? {} : { entryPoint: desc.fragment.entryPoint },
    ...desc.fragment.constants === void 0 ? {} : { constants: desc.fragment.constants }
  };
  return {
    ...desc.label === void 0 ? {} : { label: desc.label },
    layout: desc.layout === "auto" ? "auto" : desc.layout,
    vertex,
    ...desc.primitive === void 0 ? {} : { primitive: desc.primitive },
    ...desc.depthStencil === void 0 ? {} : { depthStencil: desc.depthStencil },
    ...desc.multisample === void 0 ? {} : { multisample: desc.multisample },
    ...fragment === void 0 ? {} : { fragment }
  };
}
function makeCommandEncoder(rawEncoder) {
  function mirrorComputePassDescriptor(desc) {
    if (desc === void 0) return void 0;
    const out = mirror(desc, ["label"]);
    if ("timestampWrites" in desc) {
      const writes = desc.timestampWrites;
      out.timestampWrites = writes === void 0 ? void 0 : {
        querySet: QUERY_SET_RAW_MAP.get(writes.querySet) ?? writes.querySet,
        ...writes.beginningOfPassWriteIndex === void 0 ? {} : { beginningOfPassWriteIndex: writes.beginningOfPassWriteIndex },
        ...writes.endOfPassWriteIndex === void 0 ? {} : { endOfPassWriteIndex: writes.endOfPassWriteIndex }
      };
    }
    return out;
  }
  const enc = {
    beginRenderPass(desc) {
      const state = ENCODER_STATE.get(enc);
      throwIfFinished(state);
      const rawPass = rawEncoder.beginRenderPass(mirrorRenderPassDescriptor(desc));
      const occlusionQuerySet = desc.occlusionQuerySet ?? null;
      const pass = makeRenderPassEncoder(rawPass, enc, occlusionQuerySet);
      if (state !== void 0) state.activePass = pass;
      return pass;
    },
    beginComputePass(desc) {
      const state = ENCODER_STATE.get(enc);
      throwIfFinished(state);
      const rawDescriptor = mirrorComputePassDescriptor(desc);
      const rawPass = rawDescriptor === void 0 ? rawEncoder.beginComputePass() : rawEncoder.beginComputePass(rawDescriptor);
      const pass = {
        setPipeline(pipeline) {
          rawPass.setPipeline(pipeline);
        },
        setBindGroup(index, bindGroup, dynamicOffsets) {
          if (dynamicOffsets === void 0) {
            rawPass.setBindGroup(index, bindGroup);
          } else {
            rawPass.setBindGroup(index, bindGroup, dynamicOffsets);
          }
        },
        dispatchWorkgroups(x, y, z) {
          rawPass.dispatchWorkgroups(x, y, z);
        },
        dispatchWorkgroupsIndirect(indirectBuffer, indirectOffset) {
          const rawBuffer = BUFFER_RAW_MAP.get(indirectBuffer) ?? indirectBuffer;
          rawPass.dispatchWorkgroupsIndirect(rawBuffer, indirectOffset);
        },
        end() {
          rawPass.end();
        }
      };
      return pass;
    },
    encodeEmptyComputePass(desc) {
      const state = ENCODER_STATE.get(enc);
      throwIfFinished(state);
      const rawPass = rawEncoder.beginComputePass(mirrorComputePassDescriptor(desc));
      rawPass.end();
    },
    copyBufferToBuffer(source, arg2, arg3, arg4, arg5) {
      const state = ENCODER_STATE.get(enc);
      throwIfFinished(state);
      const rawSource = BUFFER_RAW_MAP.get(source) ?? source;
      if (typeof arg2 === "number") {
        const dst = arg3;
        const rawDst = BUFFER_RAW_MAP.get(dst) ?? dst;
        rawEncoder.copyBufferToBuffer(rawSource, arg2, rawDst, arg4 ?? 0, arg5 ?? 0);
      } else {
        const dst = arg2;
        const rawDst = BUFFER_RAW_MAP.get(dst) ?? dst;
        rawEncoder.copyBufferToBuffer(rawSource, rawDst, arg3);
      }
    },
    copyBufferToTexture(source, destination, copySize) {
      const state = ENCODER_STATE.get(enc);
      throwIfFinished(state);
      const rawSrc = {
        ...source,
        buffer: BUFFER_RAW_MAP.get(source.buffer) ?? source.buffer
      };
      rawEncoder.copyBufferToTexture(rawSrc, destination, copySize);
    },
    copyTextureToBuffer(source, destination, copySize) {
      const state = ENCODER_STATE.get(enc);
      throwIfFinished(state);
      const rawSource = {
        texture: source.texture
      };
      if (source.mipLevel !== void 0) rawSource.mipLevel = source.mipLevel;
      if (source.origin !== void 0) rawSource.origin = source.origin;
      if (source.aspect !== void 0) rawSource.aspect = source.aspect;
      const rawDst = {
        buffer: BUFFER_RAW_MAP.get(destination.buffer) ?? destination.buffer
      };
      if (destination.offset !== void 0) rawDst.offset = destination.offset;
      if (destination.bytesPerRow !== void 0) rawDst.bytesPerRow = destination.bytesPerRow;
      if (destination.rowsPerImage !== void 0) rawDst.rowsPerImage = destination.rowsPerImage;
      rawEncoder.copyTextureToBuffer(rawSource, rawDst, copySize);
    },
    copyTextureToTexture(source, destination, copySize) {
      const state = ENCODER_STATE.get(enc);
      throwIfFinished(state);
      rawEncoder.copyTextureToTexture(source, destination, copySize);
    },
    clearBuffer(buffer, offset, size) {
      const state = ENCODER_STATE.get(enc);
      throwIfFinished(state);
      const rawBuf = BUFFER_RAW_MAP.get(buffer) ?? buffer;
      rawEncoder.clearBuffer(rawBuf, offset, size);
    },
    resolveQuerySet(querySet, firstQuery, queryCount, destination, destinationOffset) {
      const state = ENCODER_STATE.get(enc);
      if (state?.finished) {
        return commandEncoderFinished();
      }
      if (destinationOffset % QUERY_RESOLVE_ALIGNMENT !== 0) {
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "destinationOffset % 256 == 0 (spec normative)",
            hint: `got destinationOffset=${destinationOffset}; align to a multiple of 256 bytes (kQueryResolveAlignment)`
          })
        );
      }
      const dstMeta = BUFFER_META_MAP.get(destination);
      if (dstMeta !== void 0 && (dstMeta.usage & BUFFER_USAGE_QUERY_RESOLVE) === 0) {
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "destination.usage must contain QUERY_RESOLVE",
            hint: `got destination.usage=0x${dstMeta.usage.toString(16)}; create the buffer with GPUBufferUsage.QUERY_RESOLVE (0x200)`
          })
        );
      }
      const rawQs = QUERY_SET_RAW_MAP.get(querySet);
      const qsCount = rawQs !== void 0 && typeof rawQs.count === "number" ? rawQs.count : Number.MAX_SAFE_INTEGER;
      if (firstQuery < 0 || firstQuery + queryCount > qsCount) {
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "firstQuery + queryCount <= querySet.count",
            hint: `got firstQuery=${firstQuery}, queryCount=${queryCount}; querySet.count=${qsCount}`
          })
        );
      }
      if (dstMeta !== void 0) {
        const requiredBytes = destinationOffset + 8 * queryCount;
        if (requiredBytes > dstMeta.size) {
          return err(
            new RhiError({
              code: "webgpu-runtime-error",
              expected: "destinationOffset + 8 * queryCount <= destination.size",
              hint: `got destinationOffset=${destinationOffset}, queryCount=${queryCount} (8 * queryCount = ${8 * queryCount}); destination.size=${dstMeta.size}`
            })
          );
        }
      }
      const rawQsHandle = QUERY_SET_RAW_MAP.get(querySet) ?? querySet;
      const rawDstHandle = BUFFER_RAW_MAP.get(destination) ?? destination;
      return resolveTimestampQueries({
        rawEncoder,
        rawQuerySet: rawQsHandle,
        firstQuery,
        queryCount,
        rawDestination: rawDstHandle,
        destinationOffset
      });
    },
    pushDebugGroup(groupLabel) {
      rawEncoder.pushDebugGroup(groupLabel);
    },
    popDebugGroup() {
      rawEncoder.popDebugGroup();
    },
    insertDebugMarker(markerLabel) {
      rawEncoder.insertDebugMarker(markerLabel);
    },
    finish() {
      const state = ENCODER_STATE.get(enc);
      if (state === void 0) {
        return commandEncoderFinished();
      }
      if (state.finished) {
        return commandEncoderFinished();
      }
      if (state.activePass !== null) {
        const passState = PASS_STATE.get(state.activePass);
        if (passState !== void 0 && !passState.ended) {
          return renderPassNotEnded();
        }
      }
      const rawCommandBuffer = rawEncoder.finish();
      state.finished = true;
      const cb = rawCommandBuffer;
      COMMAND_BUFFER_RAW_MAP.set(cb, rawCommandBuffer);
      return ok(cb);
    }
  };
  ENCODER_STATE.set(enc, { raw: rawEncoder, finished: false, activePass: null });
  return enc;
}
var MAP_MODE_READ = 1;
var MAP_MODE_WRITE = 2;
var BUFFER_USAGE_MAP_READ = 1;
var BUFFER_USAGE_MAP_WRITE = 2;
function rangeError(args) {
  return err(
    new RhiError({
      code: "webgpu-runtime-error",
      expected: args.expected,
      hint: args.hint
    })
  );
}
function makeBufferWrapper(raw, size, usage) {
  const initialState = typeof raw.mapState === "string" ? raw.mapState : "unmapped";
  let mapState = initialState;
  const wrapper = {
    get mapState() {
      const rs = raw.mapState;
      if (typeof rs === "string") {
        mapState = rs;
        return rs;
      }
      return mapState;
    },
    async mapAsync(mode, offset, sizeArg) {
      const cur = wrapper.mapState;
      if (cur !== "unmapped") {
        return rangeError({
          expected: 'buffer.mapState === "unmapped" before mapAsync',
          hint: `got mapState=${cur}; call buffer.unmap() before mapAsync, or wait for the previous mapAsync to settle`
        });
      }
      const off = offset ?? 0;
      const rangeSize = sizeArg === void 0 ? Math.max(0, size - off) : sizeArg;
      if (off % 8 !== 0) {
        return rangeError({
          expected: "mapAsync offset % 8 == 0 (spec normative)",
          hint: `got offset=${off}; align offset to 8 bytes`
        });
      }
      if (rangeSize % 4 !== 0) {
        return rangeError({
          expected: "mapAsync rangeSize % 4 == 0 (spec normative)",
          hint: `got rangeSize=${rangeSize}; align rangeSize to 4 bytes`
        });
      }
      if (off + rangeSize > size) {
        return rangeError({
          expected: "mapAsync offset + rangeSize <= buffer.size",
          hint: `got offset=${off}, rangeSize=${rangeSize}; buffer.size=${size}`
        });
      }
      if ((mode & -4) !== 0) {
        return rangeError({
          expected: "mapAsync mode contains only READ or WRITE bits",
          hint: `got mode=0x${mode.toString(16)}; pass GPUMapMode.READ (0x1) or GPUMapMode.WRITE (0x2)`
        });
      }
      if (mode !== MAP_MODE_READ && mode !== MAP_MODE_WRITE) {
        return rangeError({
          expected: "mapAsync mode is exactly one of READ | WRITE (not both)",
          hint: `got mode=0x${mode.toString(16)}; pass GPUMapMode.READ (0x1) or GPUMapMode.WRITE (0x2), not the OR-combined mask`
        });
      }
      if ((mode & MAP_MODE_READ) !== 0 && (usage & BUFFER_USAGE_MAP_READ) === 0) {
        return rangeError({
          expected: "mapAsync mode READ requires buffer.usage to contain MAP_READ",
          hint: `got mode=READ, buffer.usage=0x${usage.toString(16)}; create buffer with GPUBufferUsage.MAP_READ`
        });
      }
      if ((mode & MAP_MODE_WRITE) !== 0 && (usage & BUFFER_USAGE_MAP_WRITE) === 0) {
        return rangeError({
          expected: "mapAsync mode WRITE requires buffer.usage to contain MAP_WRITE",
          hint: `got mode=WRITE, buffer.usage=0x${usage.toString(16)}; create buffer with GPUBufferUsage.MAP_WRITE`
        });
      }
      mapState = "pending";
      try {
        if (typeof raw.mapAsync === "function") {
          if (sizeArg === void 0 && offset === void 0) {
            await raw.mapAsync(mode);
          } else if (sizeArg === void 0) {
            await raw.mapAsync(mode, off);
          } else {
            await raw.mapAsync(mode, off, sizeArg);
          }
        }
        mapState = "mapped";
        return ok(wrapper);
      } catch (e) {
        mapState = "unmapped";
        const message = e instanceof Error ? e.message : String(e);
        return rangeError({
          expected: "underlying GPUBuffer.mapAsync to succeed",
          hint: `mapAsync raised: ${message}`
        });
      }
    },
    getMappedRange(offset, sizeArg) {
      const cur = wrapper.mapState;
      if (cur !== "mapped") {
        return rangeError({
          expected: 'buffer.mapState === "mapped" before getMappedRange',
          hint: "call buffer.mapAsync(MODE) and await it before getMappedRange"
        });
      }
      try {
        if (typeof raw.getMappedRange !== "function") {
          return rangeError({
            expected: "underlying GPUBuffer.getMappedRange to be available",
            hint: "mock or driver does not expose getMappedRange; use a real GPUBuffer"
          });
        }
        const view = sizeArg === void 0 ? offset === void 0 ? raw.getMappedRange() : raw.getMappedRange(offset) : raw.getMappedRange(offset ?? 0, sizeArg);
        return ok(view);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return rangeError({
          expected: "underlying GPUBuffer.getMappedRange to succeed",
          hint: `getMappedRange raised: ${message}`
        });
      }
    },
    unmap() {
      try {
        if (typeof raw.unmap === "function") {
          raw.unmap();
        }
      } catch {
      }
      mapState = "unmapped";
    }
  };
  return wrapper;
}
function makeQueue(rawQueue) {
  return {
    writeBuffer(buffer, bufferOffset, data, dataOffset, size) {
      const rawBuffer = BUFFER_RAW_MAP.get(buffer) ?? buffer;
      const bufferSize = typeof rawBuffer.size === "number" ? rawBuffer.size : Number.MAX_SAFE_INTEGER;
      if (bufferOffset % 4 !== 0) {
        return queueWriteBufferOutOfBounds({
          offset: bufferOffset,
          byteLength: data instanceof ArrayBuffer ? data.byteLength : data.byteLength,
          bufferSize
        });
      }
      const dataByteLength = data instanceof ArrayBuffer ? data.byteLength : data.byteLength;
      const writeStart = dataOffset ?? 0;
      const writeSize = size ?? dataByteLength - writeStart;
      if (bufferOffset + writeSize > bufferSize) {
        return queueWriteBufferOutOfBounds({
          offset: bufferOffset,
          byteLength: writeSize,
          bufferSize
        });
      }
      try {
        if (size !== void 0) {
          rawQueue.writeBuffer(
            rawBuffer,
            bufferOffset,
            data,
            writeStart,
            size
          );
        } else if (dataOffset !== void 0) {
          rawQueue.writeBuffer(
            rawBuffer,
            bufferOffset,
            data,
            writeStart
          );
        } else {
          rawQueue.writeBuffer(rawBuffer, bufferOffset, data);
        }
        return ok(void 0);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (/out of (bounds|range)|exceed/i.test(message)) {
          return queueWriteBufferOutOfBounds({
            offset: bufferOffset,
            byteLength: writeSize,
            bufferSize
          });
        }
        return queueSubmitFailed(message);
      }
    },
    submit(commandBuffers) {
      const rawList = [];
      for (const cb of commandBuffers) {
        const raw = COMMAND_BUFFER_RAW_MAP.get(cb);
        if (raw !== void 0) {
          rawList.push(raw);
        } else {
          rawList.push(cb);
        }
      }
      try {
        rawQueue.submit(rawList);
        return ok(void 0);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return queueSubmitFailed(message);
      }
    },
    writeTexture(destination, data, dataLayout, size) {
      try {
        const rawDestination = {
          texture: destination.texture
        };
        if (destination.mipLevel !== void 0) rawDestination.mipLevel = destination.mipLevel;
        if (destination.origin !== void 0) rawDestination.origin = destination.origin;
        if (destination.aspect !== void 0) rawDestination.aspect = destination.aspect;
        rawQueue.writeTexture(
          rawDestination,
          data,
          dataLayout,
          size
        );
        return ok(void 0);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "underlying GPUQueue.writeTexture to succeed",
            hint: `writeTexture raised: ${message}`
          })
        );
      }
    },
    copyExternalImageToTexture(source, destination, copySize) {
      try {
        rawQueue.copyExternalImageToTexture(
          source,
          {
            texture: destination.texture,
            ...destination.mipLevel === void 0 ? {} : { mipLevel: destination.mipLevel },
            ...destination.origin === void 0 ? {} : { origin: destination.origin },
            ...destination.aspect === void 0 ? {} : { aspect: destination.aspect },
            ...destination.colorSpace === void 0 ? {} : { colorSpace: destination.colorSpace },
            ...destination.premultipliedAlpha === void 0 ? {} : { premultipliedAlpha: destination.premultipliedAlpha }
          },
          copySize
        );
        return ok(void 0);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "underlying GPUQueue.copyExternalImageToTexture to succeed",
            hint: `copyExternalImageToTexture raised: ${message}`
          })
        );
      }
    },
    // forgeax-async-whitelist: dom-native — spec `GPUQueue.onSubmittedWorkDone()` Promise passthrough
    onSubmittedWorkDone() {
      return rawQueue.onSubmittedWorkDone();
    }
  };
}
function makeRhiDevice(rawDevice) {
  const caps = deriveCaps(rawDevice, rawDevice.features, rawDevice.limits);
  const features = rawDevice.features;
  const limits = rawDevice.limits;
  const queue = makeQueue(rawDevice.queue);
  const deviceGeneration = RAW_DEVICE_GENERATION_MAP.get(rawDevice) ?? (() => {
    const generation = NEXT_DEVICE_GENERATION++;
    RAW_DEVICE_GENERATION_MAP.set(rawDevice, generation);
    return generation;
  })();
  const device = {
    caps,
    features,
    limits,
    probeTextureFormatCapability() {
      const cached = R32FLOAT_PROBE_CACHE.get(device);
      if (cached !== void 0) return cached;
      const probe = probeR32FloatCapability(rawDevice, deviceGeneration);
      R32FLOAT_PROBE_CACHE.set(device, probe);
      return probe;
    },
    queue,
    // The raw backend owns the only real loss-injection seam. Keep this
    // Promise as a transparent observation boundary; a test provider must
    // operate on the backend before this shim and must never be added to the
    // public RHI surface.
    lost: rawDevice.lost,
    createBuffer(desc) {
      const out = rawDevice.createBuffer(
        mirror(desc, BUFFER_KEYS)
      );
      const sizeField = typeof desc.size === "number" ? desc.size : 0;
      const usageField = desc.usage ?? 0;
      const handle = makeBufferWrapper(out, sizeField, usageField);
      BUFFER_RAW_MAP.set(handle, out);
      BUFFER_META_MAP.set(handle, {
        size: sizeField,
        usage: usageField,
        destroyed: false
      });
      return ok(handle);
    },
    createTexture(desc) {
      const out = rawDevice.createTexture(
        mirror(desc, TEXTURE_KEYS)
      );
      const handle = out;
      const viewFormats = desc.viewFormats === void 0 ? [] : Array.from(desc.viewFormats);
      TEXTURE_META_MAP.set(handle, {
        format: desc.format,
        usage: desc.usage,
        viewFormats,
        destroyed: false
      });
      return ok(handle);
    },
    destroyBuffer(buf) {
      const meta = BUFFER_META_MAP.get(buf);
      if (meta?.destroyed) {
        return err(
          new RhiError({
            code: "destroy-after-destroy",
            expected: "GPU buffer handle has not been destroyed yet",
            hint: "object already destroyed; track lifecycle in caller or check isDestroyed before re-destroy"
          })
        );
      }
      const rawBuf = BUFFER_RAW_MAP.get(buf);
      try {
        if (rawBuf !== void 0 && typeof rawBuf.destroy === "function") {
          rawBuf.destroy();
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "underlying GPUBuffer.destroy() to succeed",
            hint: `destroy raised: ${message}`
          })
        );
      }
      if (meta !== void 0) meta.destroyed = true;
      return ok(void 0);
    },
    destroyTexture(tex) {
      const meta = TEXTURE_META_MAP.get(tex);
      if (meta?.destroyed) {
        return err(
          new RhiError({
            code: "destroy-after-destroy",
            expected: "GPU texture handle has not been destroyed yet",
            hint: "object already destroyed; track lifecycle in caller or check isDestroyed before re-destroy"
          })
        );
      }
      const rawTex = tex;
      try {
        if (typeof rawTex.destroy === "function") {
          rawTex.destroy();
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "underlying GPUTexture.destroy() to succeed",
            hint: `destroy raised: ${message}`
          })
        );
      }
      if (meta !== void 0) meta.destroyed = true;
      return ok(void 0);
    },
    createTextureView(texture, desc) {
      const meta = TEXTURE_META_MAP.get(texture);
      if (meta !== void 0) {
        const fmt = desc.format;
        if (fmt !== void 0 && fmt !== meta.format && !meta.viewFormats.includes(fmt)) {
          return err(
            new RhiError({
              code: "webgpu-runtime-error",
              expected: "createTextureView format must be the source texture format or one of source.viewFormats",
              hint: `got format='${fmt}'; source.format='${meta.format}'; source.viewFormats=[${meta.viewFormats.join(", ")}]`
            })
          );
        }
        const reqUsage = desc.usage;
        if (reqUsage !== void 0 && reqUsage !== 0 && (reqUsage & ~meta.usage) !== 0) {
          return err(
            new RhiError({
              code: "webgpu-runtime-error",
              expected: "createTextureView usage must be a subset of source.usage",
              hint: `got usage=0x${reqUsage.toString(16)}; source.usage=0x${meta.usage.toString(16)}`
            })
          );
        }
      }
      const rawTexture = texture;
      try {
        const rawView = rawTexture.createView(
          mirror(desc, TEXTURE_VIEW_KEYS)
        );
        const handle = rawView;
        TEXTURE_VIEW_RAW_MAP.set(handle, rawView);
        return ok(handle);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "underlying GPUTexture.createView to succeed",
            hint: `createView raised: ${message}`
          })
        );
      }
    },
    createSampler(desc) {
      if (desc === void 0) {
        const out2 = rawDevice.createSampler();
        return ok(out2);
      }
      const out = rawDevice.createSampler(
        mirror(desc, SAMPLER_KEYS)
      );
      return ok(out);
    },
    createBindGroupLayout(desc) {
      const out = rawDevice.createBindGroupLayout(
        mirror(desc, BGL_KEYS)
      );
      return ok(out);
    },
    createBindGroup(desc) {
      const mirrored = {
        layout: desc.layout,
        entries: []
      };
      if ("label" in desc && desc.label !== void 0) mirrored.label = desc.label;
      for (const entry of desc.entries) {
        const resource = entry.resource;
        switch (resource.kind) {
          case "sampler": {
            mirrored.entries.push({
              binding: entry.binding,
              resource: resource.value
            });
            break;
          }
          case "buffer": {
            const { buffer, offset, size } = resource.value;
            const rawBuf = BUFFER_RAW_MAP.get(buffer) ?? buffer;
            const bufferBinding = { buffer: rawBuf };
            if (offset !== void 0) bufferBinding.offset = offset;
            if (size !== void 0) bufferBinding.size = size;
            mirrored.entries.push({ binding: entry.binding, resource: bufferBinding });
            break;
          }
          case "textureView": {
            mirrored.entries.push({
              binding: entry.binding,
              resource: resource.value
            });
            break;
          }
          case "externalTexture": {
            mirrored.entries.push({
              binding: entry.binding,
              resource: resource.value
            });
            break;
          }
          default: {
            throw new Error(`rhi-webgpu: unreachable RhiBindingResource kind in createBindGroup`);
          }
        }
      }
      const out = rawDevice.createBindGroup(mirrored);
      return ok(out);
    },
    createPipelineLayout(desc) {
      const out = rawDevice.createPipelineLayout(
        mirror(desc, PL_KEYS)
      );
      return ok(out);
    },
    createRenderPipeline(desc) {
      try {
        const out = rawDevice.createRenderPipeline(mirrorRenderPipelineDescriptor(desc));
        return ok(out);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (/compile|shader|wgsl/i.test(message)) {
          return err(
            new RhiError({
              code: "shader-compile-failed",
              expected: "render shader modules + entry points to be valid",
              hint: `compile error: ${message}`
            })
          );
        }
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "underlying GPUDevice.createRenderPipeline to succeed",
            hint: `createRenderPipeline raised: ${message}`
          })
        );
      }
    },
    createComputePipeline(desc) {
      if (caps.compute === false) {
        return err(
          new RhiError({
            code: "feature-not-enabled",
            expected: "caps.compute === true",
            hint: "check device.caps.compute before calling createComputePipeline"
          })
        );
      }
      try {
        const out = rawDevice.createComputePipeline(
          mirror(desc, CP_KEYS)
        );
        return ok(out);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (/compile|shader|wgsl/i.test(message)) {
          return err(
            new RhiError({
              code: "shader-compile-failed",
              expected: "compute shader module + entry point to be valid",
              hint: `compile error: ${message}`
            })
          );
        }
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "underlying GPUDevice.createComputePipeline to succeed",
            hint: `createComputePipeline raised: ${message}`
          })
        );
      }
    },
    createQuerySet(desc) {
      const count = desc.count;
      if (typeof count === "number" && count > QUERY_SET_COUNT_LIMIT) {
        return err(
          new RhiError({
            code: "limit-exceeded",
            expected: "count <= 4096 (spec normative)",
            hint: "create multiple QuerySet instances if more than 4096 queries needed"
          })
        );
      }
      if (desc.type === "timestamp" && caps.timestampQuery !== true) {
        return err(
          new RhiError({
            code: "feature-not-enabled",
            expected: "caps.timestampQuery === true (timestamp-query feature)",
            hint: "request the timestamp-query feature at requestDevice and check device.caps.timestampQuery before creating timestamp QuerySets"
          })
        );
      }
      try {
        const out = rawDevice.createQuerySet(
          mirror(desc, QS_KEYS)
        );
        const handle = out;
        QUERY_SET_RAW_MAP.set(handle, out);
        QUERY_SET_DESTROYED_MAP.set(handle, { destroyed: false });
        return ok(handle);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "underlying GPUDevice.createQuerySet to succeed",
            hint: `createQuerySet raised: ${message}`
          })
        );
      }
    },
    destroyQuerySet(querySet) {
      const marker = QUERY_SET_DESTROYED_MAP.get(querySet);
      if (marker?.destroyed) {
        return err(
          new RhiError({
            code: "destroy-after-destroy",
            expected: "GPU query-set handle has not been destroyed yet",
            hint: "object already destroyed; release each timestamp QuerySet exactly once"
          })
        );
      }
      const rawQuery = QUERY_SET_RAW_MAP.get(querySet);
      try {
        if (rawQuery !== void 0 && typeof rawQuery.destroy === "function") rawQuery.destroy();
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "underlying GPUQuerySet.destroy() to succeed",
            hint: `destroy raised: ${message}`
          })
        );
      }
      if (marker !== void 0) marker.destroyed = true;
      return ok(void 0);
    },
    createCommandEncoder(desc) {
      const rawEnc = desc === void 0 ? rawDevice.createCommandEncoder() : rawDevice.createCommandEncoder(
        mirror(desc, ENC_KEYS)
      );
      return ok(makeCommandEncoder(rawEnc));
    }
    // fix-f3: synchronous createShaderModule placeholder removed; the
    // shader-compile-failed path lives in the top-level async factory
    // (see ../index.ts).
  };
  RAW_DEVICE_MAP.set(device, rawDevice);
  return { device, raw: rawDevice };
}
var SUPPORTED_CONTEXT_FORMATS = /* @__PURE__ */ new Set([
  "bgra8unorm",
  "rgba8unorm",
  "rgba16float"
]);
var CANVAS_CONFIG_KEYS = [
  "device",
  "format",
  "usage",
  "viewFormats",
  "colorSpace",
  "toneMapping",
  "alphaMode"
];
function makeCanvasContext(rawContext) {
  return {
    configure(desc) {
      const fmt = desc.format;
      if (typeof fmt === "string" && !SUPPORTED_CONTEXT_FORMATS.has(fmt)) {
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "one of bgra8unorm/rgba8unorm/rgba16float",
            hint: `got format='${fmt}'; canvas configuration cannot use srgb formats \u2014 use the non-srgb form (e.g. 'bgra8unorm') and put the srgb format in viewFormats, then createView with the srgb format`
          })
        );
      }
      try {
        const mirrored = mirror(
          desc,
          CANVAS_CONFIG_KEYS
        );
        if ("device" in mirrored) {
          const forgeaxDevice = desc.device;
          const rawDev = RAW_DEVICE_MAP.get(forgeaxDevice);
          if (rawDev === void 0) {
            return err(
              new RhiError({
                code: "rhi-not-available",
                expected: "CanvasConfiguration.device must be a RhiDevice produced by rhi.requestAdapter().requestDevice() (or the deprecated rhi.requestDevice factory)",
                hint: "pass the device returned by the forgeax rhi.requestAdapter() / rhi.requestDevice() entries; passing a foreign RhiDevice or a raw GPUDevice is rejected because the canvas-context spec requires the same raw GPUDevice that the forgeax shim wraps"
              })
            );
          }
          mirrored.device = rawDev;
        }
        rawContext.configure(mirrored);
        return ok(void 0);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (e instanceof Error && (e.name === "InvalidStateError" || /lost|destroyed/i.test(msg))) {
          return err(
            new RhiError({
              code: "rhi-not-available",
              expected: "CanvasConfiguration.device must be valid (not lost / destroyed)",
              hint: `configure raised: ${msg}`
            })
          );
        }
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "underlying GPUCanvasContext.configure to succeed",
            hint: `configure raised: ${msg}`
          })
        );
      }
    },
    unconfigure() {
      rawContext.unconfigure();
    },
    getConfiguration() {
      const conf = rawContext.getConfiguration();
      if (conf === null) return void 0;
      const out = {};
      for (const k of CANVAS_CONFIG_KEYS) {
        if (k in conf) {
          out[k] = conf[k];
        }
      }
      return out;
    },
    getCurrentTexture() {
      try {
        const rawTex = rawContext.getCurrentTexture();
        return ok(rawTex);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "GPUCanvasContext.getCurrentTexture to succeed (context configured)",
            hint: `getCurrentTexture raised: ${msg}`
          })
        );
      }
    }
  };
}
function translateErrorEventToRhiError(event) {
  if (typeof event === "object" && event !== null && "reason" in event && typeof event.reason === "string") {
    const info = event;
    return err(
      new RhiError({
        code: "device-lost",
        expected: "device must remain alive (driver / browser must not destroy the GPUDevice)",
        hint: `device-lost reason: ${info.reason}; message: ${info.message ?? "<empty>"}`
      })
    );
  }
  if (typeof event === "object" && event !== null && "error" in event && typeof event.error === "object" && event.error !== null) {
    const error = event.error;
    const message = typeof error.message === "string" ? error.message : "<no message>";
    const withGpuMessage = (value) => {
      Object.assign(value, { gpuMessage: message });
      return value;
    };
    if (error.constructor.name === "GPUOutOfMemoryError") {
      return err(
        withGpuMessage(
          new RhiError({
            code: "oom",
            expected: "sufficient GPU memory to satisfy the allocation",
            hint: `GPU out-of-memory: ${message}`
          })
        )
      );
    }
    if (error.constructor.name === "GPUInternalError") {
      return err(
        withGpuMessage(
          new RhiError({
            code: "internal-error",
            expected: "driver / browser must report a recognised validation error",
            hint: `GPU internal error: ${message}`
          })
        )
      );
    }
    if (error.constructor.name === "GPUValidationError") {
      if (/shader|compile|wgsl/i.test(message)) {
        return err(
          withGpuMessage(
            new RhiError({
              code: "shader-compile-failed",
              expected: "valid WGSL source + matching pipeline layout",
              hint: `GPU validation: ${message}`
            })
          )
        );
      }
      if (/size|alignment|out of bounds/i.test(message)) {
        return err(
          withGpuMessage(
            new RhiError({
              code: "queue-write-buffer-out-of-bounds",
              expected: "writeBuffer offset + data.byteLength must be within buffer.size",
              hint: `GPU validation: ${message}`
            })
          )
        );
      }
      if (/encoder.*finished|finished encoder/i.test(message)) {
        return err(
          withGpuMessage(
            new RhiError({
              code: "command-encoder-finished",
              expected: "command encoder must not be finished before recording new commands",
              hint: `GPU validation: ${message}`
            })
          )
        );
      }
      if (/render pass.*not ended|pass.*not ended/i.test(message)) {
        return err(
          withGpuMessage(
            new RhiError({
              code: "render-pass-not-ended",
              expected: "previous render pass must be ended before beginning a new pass",
              hint: `GPU validation: ${message}`
            })
          )
        );
      }
      if (/submit/i.test(message)) {
        return err(
          withGpuMessage(
            new RhiError({
              code: "queue-submit-failed",
              expected: "command buffer references must be valid at submit time",
              hint: `GPU validation: ${message}`
            })
          )
        );
      }
      return err(
        withGpuMessage(
          new RhiError({
            code: "limit-exceeded",
            expected: "descriptor field values within device limits",
            hint: `GPU validation: ${message}`
          })
        )
      );
    }
  }
  const repr = typeof event === "object" && event !== null && "toString" in event ? String(event) : "<unknown>";
  return err(
    new RhiError({
      code: "webgpu-runtime-error",
      expected: "spec-recognised GPUUncapturedErrorEvent or GPUDeviceLostInfo",
      hint: `unrecognised async-dispatch event: ${repr}`
    })
  );
}

// src/index.ts
var DYNAMIC_DEVICE_LIMIT_KEYS = [
  "maxDynamicUniformBuffersPerPipelineLayout",
  "maxDynamicStorageBuffersPerPipelineLayout"
];
var SYNTHETIC_DAWN_DYNAMIC_LIMIT_DEFAULT = 1e6;
function normalizeDeviceDescriptor(adapter, descriptor) {
  const adapterLimits = adapter.limits;
  if (adapterLimits === void 0 || adapterLimits === null) return descriptor;
  const requiredLimits = { ...descriptor?.requiredLimits ?? {} };
  let changed = false;
  for (const key of DYNAMIC_DEVICE_LIMIT_KEYS) {
    const value = adapterLimits[key];
    if (!Number.isFinite(value) || value < 1) continue;
    const requested = requiredLimits[key];
    if (requested !== void 0 && (requested <= value || requested !== SYNTHETIC_DAWN_DYNAMIC_LIMIT_DEFAULT)) {
      continue;
    }
    requiredLimits[key] = value;
    changed = true;
  }
  return changed ? { ...descriptor ?? {}, requiredLimits } : descriptor;
}
function classifyRequestDeviceError(e) {
  const msg = e instanceof Error ? e.message : String(e);
  if (/feature/i.test(msg)) return featureNotEnabled();
  if (/limit/i.test(msg)) return limitExceeded();
  return featureNotEnabled();
}
async function requestDevice(opts = {}) {
  const injected = opts.gpu;
  const ambient = typeof globalThis !== "undefined" ? globalThis.navigator?.gpu : void 0;
  const gpu = injected ?? ambient;
  if (gpu === void 0 || gpu === null) {
    return adapterUnavailable();
  }
  const adapter = await gpu.requestAdapter(opts.adapterOptions);
  if (adapter === null) {
    return adapterUnavailable();
  }
  let rawDevice;
  try {
    rawDevice = await adapter.requestDevice(
      normalizeDeviceDescriptor(adapter, opts.deviceDescriptor)
    );
  } catch (e) {
    return classifyRequestDeviceError(e);
  }
  const { device } = makeRhiDevice(rawDevice);
  return ok(device);
}
function createRawShaderModule(device, desc) {
  const rawDevice = _internal_getRawDevice(device);
  if (rawDevice === void 0) {
    return shaderCompileFailed([
      {
        type: "error",
        message: "rhi-webgpu: createShaderModule called with unregistered RhiDevice",
        lineNum: 0,
        linePos: 0,
        offset: 0,
        length: 0
      }
    ]);
  }
  const mirrored = { code: desc.code };
  if ("label" in desc && desc.label !== void 0) mirrored.label = desc.label;
  try {
    return ok(rawDevice.createShaderModule(mirrored));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return shaderCompileFailed([
      {
        type: "error",
        message,
        lineNum: 0,
        linePos: 0,
        offset: 0,
        length: 0
      }
    ]);
  }
}
async function createShaderModule(device, desc) {
  const rawResult = createRawShaderModule(device, desc);
  if (!rawResult.ok) return rawResult;
  const handle = rawResult.value;
  const handleWithInfo = handle;
  if (typeof handleWithInfo.getCompilationInfo !== "function") {
    return ok(handle);
  }
  let info;
  try {
    info = await handleWithInfo.getCompilationInfo();
  } catch {
    return ok(handle);
  }
  const errors = info.messages.filter((m) => m.type === "error");
  if (errors.length > 0) {
    const sourcePrefix = desc.label === void 0 ? "" : ` source=${JSON.stringify(desc.code.slice(0, 24))}`;
    const labeledMessages = info.messages.map((message) => ({
      message: desc.label === void 0 ? message.message : `[${desc.label}]${sourcePrefix} ${message.message}`,
      type: message.type,
      lineNum: message.lineNum,
      linePos: message.linePos,
      offset: message.offset,
      length: message.length
    }));
    return shaderCompileFailed(labeledMessages);
  }
  return ok(handle);
}
function createShaderModuleImmediate(device, desc) {
  const result = createRawShaderModule(device, desc);
  return result.ok ? ok(result.value) : result;
}
function makeRhiAdapter(rawAdapter) {
  const rawFeatures = rawAdapter.features;
  const features = rawFeatures !== void 0 && rawFeatures !== null ? new Set(rawFeatures) : /* @__PURE__ */ new Set();
  const limitsRaw = rawAdapter.limits ?? {};
  const limits = {};
  for (const key in limitsRaw) {
    const v = limitsRaw[key];
    if (typeof v === "number") {
      limits[key] = v;
    }
  }
  return {
    features,
    limits,
    async requestDevice(opts) {
      let rawDevice;
      try {
        rawDevice = await rawAdapter.requestDevice(
          normalizeDeviceDescriptor(rawAdapter, opts)
        );
      } catch (e) {
        return classifyRequestDeviceError(e);
      }
      const { device } = makeRhiDevice(rawDevice);
      return ok(device);
    }
  };
}
async function requestAdapter(opts, _compatibleSurface) {
  const ambient = typeof globalThis !== "undefined" ? globalThis.navigator?.gpu : void 0;
  if (ambient === void 0 || ambient === null) {
    return adapterUnavailable();
  }
  let adapter;
  try {
    adapter = await ambient.requestAdapter(opts);
  } catch (cause) {
    return requestAdapterFailed(cause);
  }
  if (adapter === null) {
    return adapterUnavailable();
  }
  return ok(
    makeRhiAdapter(
      adapter
    )
  );
}
function acquireCanvasContext(canvas) {
  let rawContext;
  try {
    rawContext = canvas.getContext("webgpu");
  } catch {
    rawContext = null;
  }
  if (rawContext === null) {
    return err(
      new RhiError({
        code: "rhi-not-available",
        expected: 'canvas.getContext("webgpu") to return a non-null GPUCanvasContext',
        hint: 'canvas does not support WebGPU \u2014 pass an HTMLCanvasElement (or OffscreenCanvas) whose getContext("webgpu") returns a valid GPUCanvasContext'
      })
    );
  }
  return ok(makeCanvasContext(rawContext));
}
var rhi = {
  requestAdapter,
  createShaderModule,
  createShaderModuleImmediate,
  acquireCanvasContext
};

export { _internal_getRawDevice, acquireCanvasContext, createShaderModule, createShaderModuleImmediate, requestAdapter, requestDevice, rhi, translateErrorEventToRhiError };
