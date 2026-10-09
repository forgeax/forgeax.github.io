import { err, RhiError, ok, createUnavailableR32FloatReceipt } from '../../rhi/dist/index.mjs';
export { RhiError as RhiErrorClass, err, ok } from '../../rhi/dist/index.mjs';

// src/index.ts
function featureNotEnabledError(featureName) {
  const fname = featureName;
  return new RhiError({
    code: "feature-not-enabled",
    expected: `feature ${fname} to be enabled on the active wgpu backend`,
    hint: `feature ${fname} not available on wgpu webgl backend; check engine.rhi.caps.${fname} before requesting`
  });
}
function featureNotEnabled(featureName) {
  return err(featureNotEnabledError(featureName));
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
function webgpuRuntimeError(cause) {
  const errorMessage = cause === void 0 ? "unknown" : cause instanceof Error ? cause.message : String(cause);
  return err(
    new RhiError({
      code: "webgpu-runtime-error",
      expected: "wgpu wasm runtime to complete the operation without throwing",
      // bug-20260610: surface the raw wgpu/wasm message in the hint itself —
      // previously the hint only said "inspect RhiError.detail.error" which
      // forced AI users to dig two levels deep when the message was usually
      // a one-liner like "Too many bindings of type StorageBuffers...". The
      // detail.error.message field is still populated for structured access.
      hint: `wgpu wasm runtime error: ${errorMessage} (common causes: device lost / driver crash / wasm panic; consider re-creating the device)`,
      detail: { error: { code: "unknown", message: errorMessage } }
    })
  );
}
function descriptorInvalid(cause) {
  const causeMessage = cause instanceof Error ? cause.message : cause === void 0 ? "unknown descriptor parse error" : String(cause);
  return err(
    new RhiError({
      code: "rhi-descriptor-invalid",
      expected: "caller passed well-formed descriptor data matching the wgpu-wasm serialization contract",
      hint: `wgpu-wasm descriptor parse error: ${causeMessage} (check the descriptor field named in the error message for type mismatch or missing required fields)`
    })
  );
}

// src/buffer.ts
function doubleDestroy(expected) {
  return err(
    new RhiError({
      code: "destroy-after-destroy",
      expected,
      hint: "object already destroyed; track lifecycle in caller or check isDestroyed before re-destroy"
    })
  );
}
var RhiWgpuBufferImpl = class {
  raw;
  destroyed = false;
  constructor(raw) {
    this.raw = raw;
  }
  /**
   * Destroy the underlying buffer. First call returns `Result.ok(undefined)`
   * after delegating to the wasm shim; second call on the same instance
   * returns `Result.err({ code: 'destroy-after-destroy' })` (D-7).
   *
   * Spec anchor: W3C WebGPU §gpubuffer-destroy + wgpu wasm
   * `RhiWgpuBuffer::destroy` (research §F-1; both surfaces are idempotent
   * void at the underlying GPU). The forgeax form prefers fail-fast
   * because double destroy is almost always a lifecycle bug.
   */
  destroy() {
    if (this.destroyed) {
      return doubleDestroy("GPU buffer handle has not been destroyed yet");
    }
    try {
      if (typeof this.raw.destroy === "function") {
        this.raw.destroy();
      }
    } catch (e) {
      return webgpuRuntimeError(e);
    }
    this.destroyed = true;
    return ok(void 0);
  }
  /**
   * Spec anchor: W3C WebGPU §gpubuffer-mapasync. M2 baseline routes the
   * raw handle's mapAsync into a Result-wrapped Promise. M4 dawn-node
   * integration (w24) narrows the dispatch by inspecting the thrown error
   * message into the 8 validation paths documented in @forgeax/engine-rhi Buffer.
   */
  async mapAsync(mode, offset, size) {
    if (this.raw.mapAsync === void 0) {
      return webgpuRuntimeError(new Error("underlying buffer handle does not expose mapAsync"));
    }
    try {
      await this.raw.mapAsync.call(
        this.raw,
        mode,
        offset !== void 0 ? BigInt(offset) : void 0,
        size !== void 0 ? BigInt(size) : void 0
      );
      return ok(this);
    } catch (e) {
      return webgpuRuntimeError(e);
    }
  }
  /**
   * Spec anchor: W3C WebGPU §gpubuffer-getmappedrange. Returns the
   * ArrayBuffer view of the currently-mapped region; the forgeax Result
   * wrapper surfaces mapState !== 'mapped' / detach-guard failures via
   * webgpuRuntimeError.
   */
  getMappedRange(offset, size) {
    if (this.raw.getMappedRange === void 0) {
      return webgpuRuntimeError(
        new Error("underlying buffer handle does not expose getMappedRange")
      );
    }
    try {
      const buf = this.raw.getMappedRange.call(
        this.raw,
        offset !== void 0 ? BigInt(offset) : void 0,
        size !== void 0 ? BigInt(size) : void 0
      );
      return ok(buf);
    } catch (e) {
      return webgpuRuntimeError(e);
    }
  }
  /**
   * Spec anchor: W3C WebGPU §gpubuffer-unmap. The forgeax form keeps the
   * spec void return — unmap is the single Result-shape exception in the
   * Buffer surface (research §4.4: unmap is a silent no-op when already
   * unmapped, so there is no error surface for AI users to consume).
   */
  unmap() {
    if (this.raw.unmap === void 0) return;
    this.raw.unmap.call(this.raw);
  }
  /**
   * mapState getter (research §4.1 3-state enum). Mirrors the spec
   * GPUBufferMapState transitions:
   *   - createBuffer({mappedAtCreation:true}) sets 'mapped'.
   *   - mapAsync moves 'unmapped' → 'pending' → 'mapped'.
   *   - unmap moves 'mapped' → 'unmapped'.
   *
   * Defaults to 'unmapped' when the raw handle does not expose the field
   * (charter proposition 4 explicit-failure baseline — no throw).
   */
  get mapState() {
    return this.raw.mapState ?? "unmapped";
  }
};
var BUFFER_RAW_MAP = /* @__PURE__ */ new WeakMap();
function makeRhiBuffer(raw) {
  const wrapper = new RhiWgpuBufferImpl(raw);
  BUFFER_RAW_MAP.set(wrapper, raw);
  return wrapper;
}
function unwrapBuffer(buffer) {
  return BUFFER_RAW_MAP.get(buffer) ?? buffer;
}
var RHI_CODE_PREFIX = "[rhi-code:";
function classifySubmitError(cause) {
  const message = cause instanceof Error ? cause.message : String(cause);
  if (message.startsWith(RHI_CODE_PREFIX)) {
    const close = message.indexOf("]");
    const code = message.slice(RHI_CODE_PREFIX.length, close);
    const detail = message.slice(close + 1).trim();
    if (code === "queue-submit-failed") {
      return queueSubmitFailed(detail);
    }
  }
  return webgpuRuntimeError(cause);
}
function aspectToU8(aspect) {
  if (aspect === "stencil-only") return 1;
  if (aspect === "depth-only") return 2;
  return 0;
}
function normalizeExtent(size) {
  if (Array.isArray(size)) {
    const w = size[0] ?? 1;
    const h = size[1] ?? 1;
    const d = size[2] ?? 1;
    return { width: w, height: h, depthOrArrayLayers: d };
  }
  const dict = size;
  return {
    width: dict.width,
    height: dict.height ?? 1,
    depthOrArrayLayers: dict.depthOrArrayLayers ?? 1
  };
}
var RhiWgpuQueueImpl = class {
  raw;
  constructor(raw) {
    this.raw = raw;
  }
  submit(commandBuffers) {
    if (this.raw.submit === void 0) {
      return webgpuRuntimeError(new Error("underlying queue handle does not expose submit"));
    }
    try {
      this.raw.submit.call(this.raw, commandBuffers);
      return ok(void 0);
    } catch (e) {
      return classifySubmitError(e);
    }
  }
  writeBuffer(buffer, bufferOffset, data, dataOffset, size) {
    if (this.raw.writeBuffer === void 0) {
      return webgpuRuntimeError(new Error("underlying queue handle does not expose writeBuffer"));
    }
    try {
      const rawBuffer = unwrapBuffer(buffer);
      const bytes = data instanceof Uint8Array ? data : ArrayBuffer.isView(data) ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : new Uint8Array(data);
      this.raw.writeBuffer.call(
        this.raw,
        rawBuffer,
        BigInt(bufferOffset),
        bytes,
        dataOffset !== void 0 ? BigInt(dataOffset) : void 0,
        size !== void 0 ? BigInt(size) : void 0
      );
      return ok(void 0);
    } catch (e) {
      return webgpuRuntimeError(e);
    }
  }
  writeTexture(destination, data, dataLayout, size) {
    if (this.raw.writeTexture === void 0) {
      return webgpuRuntimeError(new Error("underlying queue handle does not expose writeTexture"));
    }
    try {
      const bytes = data instanceof Uint8Array ? data : ArrayBuffer.isView(data) ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : new Uint8Array(data);
      const origin = destination.origin ?? { x: 0, y: 0, z: 0 };
      const ext = normalizeExtent(size);
      this.raw.writeTexture.call(
        this.raw,
        destination.texture,
        destination.mipLevel ?? 0,
        origin.x ?? 0,
        origin.y ?? 0,
        origin.z ?? 0,
        aspectToU8(destination.aspect),
        bytes,
        BigInt(dataLayout.offset ?? 0),
        dataLayout.bytesPerRow,
        dataLayout.rowsPerImage,
        ext.width,
        ext.height,
        ext.depthOrArrayLayers
      );
      return ok(void 0);
    } catch (e) {
      return webgpuRuntimeError(e);
    }
  }
  copyExternalImageToTexture(source, destination, copySize) {
    if (this.raw.copyExternalImageToTexture === void 0) {
      return webgpuRuntimeError(
        new Error("underlying queue handle does not expose copyExternalImageToTexture")
      );
    }
    try {
      this.raw.copyExternalImageToTexture.call(
        this.raw,
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
      return webgpuRuntimeError(e);
    }
  }
  // forgeax-async-whitelist: wasm-bindgen — wgpu-wasm `Queue.onSubmittedWorkDone()` Promise passthrough
  onSubmittedWorkDone() {
    if (this.raw.onSubmittedWorkDone === void 0) {
      return Promise.resolve(void 0);
    }
    return this.raw.onSubmittedWorkDone.call(this.raw);
  }
};
function makeRhiQueue(raw) {
  return new RhiWgpuQueueImpl(raw);
}
var RhiWgpuRenderPassEncoderImpl = class {
  raw;
  constructor(raw) {
    this.raw = raw;
  }
  setPipeline(pipeline) {
    if (this.raw.setPipeline === void 0) return;
    this.raw.setPipeline.call(this.raw, pipeline);
  }
  setVertexBuffer(slot, buffer, offset, size) {
    if (this.raw.setVertexBuffer === void 0) return;
    this.raw.setVertexBuffer.call(
      this.raw,
      slot,
      unwrapBuffer(buffer),
      offset !== void 0 ? BigInt(offset) : BigInt(0),
      size !== void 0 ? BigInt(size) : void 0
    );
  }
  setIndexBuffer(buffer, format, offset, size) {
    if (this.raw.setIndexBuffer === void 0) return;
    this.raw.setIndexBuffer.call(
      this.raw,
      unwrapBuffer(buffer),
      format,
      offset !== void 0 ? BigInt(offset) : BigInt(0),
      size !== void 0 ? BigInt(size) : void 0
    );
  }
  setBindGroup(index, bindGroup, dynamicOffsetsData, dynamicOffsetsDataStart, dynamicOffsetsDataLength) {
    if (this.raw.setBindGroup === void 0) return;
    if (dynamicOffsetsDataLength !== void 0) {
      this.raw.setBindGroup.call(
        this.raw,
        index,
        bindGroup,
        dynamicOffsetsData,
        dynamicOffsetsDataStart ?? 0,
        dynamicOffsetsDataLength
      );
    } else if (dynamicOffsetsData !== void 0) {
      this.raw.setBindGroup.call(this.raw, index, bindGroup, dynamicOffsetsData);
    } else {
      this.raw.setBindGroup.call(this.raw, index, bindGroup);
    }
  }
  draw(vertexCount, instanceCount, firstVertex, firstInstance) {
    if (this.raw.draw === void 0) return;
    this.raw.draw.call(this.raw, vertexCount, instanceCount, firstVertex, firstInstance);
  }
  drawIndexed(indexCount, instanceCount, firstIndex, baseVertex, firstInstance) {
    if (this.raw.drawIndexed === void 0) return;
    this.raw.drawIndexed.call(
      this.raw,
      indexCount,
      instanceCount,
      firstIndex,
      baseVertex,
      firstInstance
    );
  }
  drawIndirect(indirectBuffer, indirectOffset) {
    if (this.raw.drawIndirect === void 0) return;
    this.raw.drawIndirect.call(this.raw, unwrapBuffer(indirectBuffer), BigInt(indirectOffset));
  }
  drawIndexedIndirect(indirectBuffer, indirectOffset) {
    if (this.raw.drawIndexedIndirect === void 0) return;
    this.raw.drawIndexedIndirect.call(
      this.raw,
      unwrapBuffer(indirectBuffer),
      BigInt(indirectOffset)
    );
  }
  end() {
    if (this.raw.end === void 0) return;
    this.raw.end.call(this.raw);
  }
  setViewport(x, y, w, h, minDepth, maxDepth) {
    if (this.raw.setViewport === void 0) return;
    this.raw.setViewport.call(this.raw, x, y, w, h, minDepth, maxDepth);
  }
  setScissorRect(x, y, w, h) {
    if (this.raw.setScissorRect === void 0) return;
    this.raw.setScissorRect.call(this.raw, x, y, w, h);
  }
  setBlendConstant(color) {
    if (this.raw.setBlendConstant === void 0) return;
    this.raw.setBlendConstant.call(this.raw, color);
  }
  setStencilReference(reference) {
    if (this.raw.setStencilReference === void 0) return;
    this.raw.setStencilReference.call(this.raw, reference);
  }
  pushDebugGroup(groupLabel) {
    if (this.raw.pushDebugGroup === void 0) return;
    this.raw.pushDebugGroup.call(this.raw, groupLabel);
  }
  popDebugGroup() {
    if (this.raw.popDebugGroup === void 0) return;
    this.raw.popDebugGroup.call(this.raw);
  }
  insertDebugMarker(markerLabel) {
    if (this.raw.insertDebugMarker === void 0) return;
    this.raw.insertDebugMarker.call(this.raw, markerLabel);
  }
  executeBundles(bundles) {
    if (this.raw.executeBundles === void 0) {
      return webgpuRuntimeError(new Error("executeBundles not implemented at M2 baseline"));
    }
    try {
      this.raw.executeBundles.call(this.raw, bundles);
      return ok(void 0);
    } catch (e) {
      return webgpuRuntimeError(e);
    }
  }
  beginOcclusionQuery(queryIndex) {
    if (this.raw.beginOcclusionQuery === void 0) {
      return webgpuRuntimeError(new Error("beginOcclusionQuery not implemented at M2 baseline"));
    }
    try {
      this.raw.beginOcclusionQuery.call(this.raw, queryIndex);
      return ok(void 0);
    } catch (e) {
      return webgpuRuntimeError(e);
    }
  }
  endOcclusionQuery() {
    if (this.raw.endOcclusionQuery === void 0) {
      return webgpuRuntimeError(new Error("endOcclusionQuery not implemented at M2 baseline"));
    }
    try {
      this.raw.endOcclusionQuery.call(this.raw);
      return ok(void 0);
    } catch (e) {
      return webgpuRuntimeError(e);
    }
  }
};
function makeRhiRenderPassEncoder(raw) {
  return new RhiWgpuRenderPassEncoderImpl(raw);
}

// src/command-encoder.ts
function makeRhiComputePassEncoder(raw) {
  return {
    setPipeline(pipeline) {
      raw.setPipeline?.call(raw, pipeline);
    },
    setBindGroup(index, bindGroup, dynamicOffsets) {
      raw.setBindGroup?.call(raw, index, bindGroup, dynamicOffsets);
    },
    dispatchWorkgroups(x, y, z) {
      raw.dispatchWorkgroups?.call(raw, x, y, z);
    },
    dispatchWorkgroupsIndirect(indirectBuffer, indirectOffset) {
      raw.dispatchWorkgroupsIndirect?.call(
        raw,
        unwrapBuffer(indirectBuffer),
        BigInt(indirectOffset)
      );
    },
    end() {
      raw.end?.call(raw);
    }
  };
}
var RhiWgpuCommandEncoderImpl = class {
  raw;
  finished = false;
  constructor(raw) {
    this.raw = raw;
  }
  beginRenderPass(desc) {
    if (this.raw.beginRenderPass === void 0) {
      return makeRhiRenderPassEncoder({});
    }
    const raw = this.raw.beginRenderPass.call(this.raw, desc);
    return makeRhiRenderPassEncoder(raw);
  }
  beginComputePass(desc) {
    if (this.raw.beginComputePass === void 0) {
      throw featureNotEnabledError("compute");
    }
    const raw = this.raw.beginComputePass.call(this.raw, desc);
    return makeRhiComputePassEncoder(raw);
  }
  encodeEmptyComputePass(desc) {
    if (this.raw.beginComputePass === void 0) {
      throw featureNotEnabledError("compute");
    }
    const raw = this.raw.beginComputePass.call(this.raw, desc);
    raw.end?.call(raw);
  }
  copyBufferToBuffer(...args) {
    if (this.raw.copyBufferToBuffer === void 0) return;
    const unwrapped = args.map((v, i) => {
      if (i === 0 || i === 2) return unwrapBuffer(v);
      if (i === 1 || i === 3 || i === 4) {
        if (v === void 0) return v;
        if (typeof v === "bigint") return v;
        if (typeof v === "number") return BigInt(v);
      }
      return v;
    });
    this.raw.copyBufferToBuffer.call(this.raw, ...unwrapped);
  }
  copyBufferToTexture(source, destination, size) {
    if (this.raw.copyBufferToTexture === void 0) return;
    const src = source;
    const dst = destination;
    const dstOrigin = dst.origin ?? { x: 0, y: 0, z: 0 };
    const ext = normalizeExtent(size);
    this.raw.copyBufferToTexture.call(
      this.raw,
      unwrapBuffer(src.buffer),
      BigInt(src.offset ?? 0),
      src.bytesPerRow,
      src.rowsPerImage,
      dst.texture,
      dst.mipLevel ?? 0,
      dstOrigin.x ?? 0,
      dstOrigin.y ?? 0,
      dstOrigin.z ?? 0,
      aspectToU8(dst.aspect),
      ext.width,
      ext.height,
      ext.depthOrArrayLayers
    );
  }
  copyTextureToBuffer(source, destination, size) {
    if (this.raw.copyTextureToBuffer === void 0) return;
    const src = source;
    const dst = destination;
    const srcOrigin = src.origin ?? { x: 0, y: 0, z: 0 };
    const ext = normalizeExtent(size);
    this.raw.copyTextureToBuffer.call(
      this.raw,
      src.texture,
      src.mipLevel ?? 0,
      srcOrigin.x ?? 0,
      srcOrigin.y ?? 0,
      srcOrigin.z ?? 0,
      aspectToU8(src.aspect),
      unwrapBuffer(dst.buffer),
      BigInt(dst.offset ?? 0),
      dst.bytesPerRow,
      dst.rowsPerImage,
      ext.width,
      ext.height,
      ext.depthOrArrayLayers
    );
  }
  copyTextureToTexture(source, destination, size) {
    if (this.raw.copyTextureToTexture === void 0) return;
    const src = source;
    const dst = destination;
    const srcOrigin = src.origin ?? { x: 0, y: 0, z: 0 };
    const dstOrigin = dst.origin ?? { x: 0, y: 0, z: 0 };
    const ext = normalizeExtent(size);
    this.raw.copyTextureToTexture.call(
      this.raw,
      src.texture,
      src.mipLevel ?? 0,
      srcOrigin.x ?? 0,
      srcOrigin.y ?? 0,
      srcOrigin.z ?? 0,
      aspectToU8(src.aspect),
      dst.texture,
      dst.mipLevel ?? 0,
      dstOrigin.x ?? 0,
      dstOrigin.y ?? 0,
      dstOrigin.z ?? 0,
      aspectToU8(dst.aspect),
      ext.width,
      ext.height,
      ext.depthOrArrayLayers
    );
  }
  clearBuffer(buffer, offset, size) {
    if (this.raw.clearBuffer === void 0) return;
    this.raw.clearBuffer.call(
      this.raw,
      unwrapBuffer(buffer),
      offset !== void 0 ? BigInt(offset) : void 0,
      size !== void 0 ? BigInt(size) : void 0
    );
  }
  resolveQuerySet(querySet, firstQuery, queryCount, destination, destinationOffset) {
    if (this.raw.resolveQuerySet === void 0) {
      return webgpuRuntimeError(
        new Error("underlying encoder handle does not expose resolveQuerySet")
      );
    }
    try {
      this.raw.resolveQuerySet.call(
        this.raw,
        querySet,
        firstQuery,
        queryCount,
        unwrapBuffer(destination),
        destinationOffset
      );
      return ok(void 0);
    } catch (e) {
      return webgpuRuntimeError(e);
    }
  }
  pushDebugGroup(groupLabel) {
    if (this.raw.pushDebugGroup === void 0) return;
    this.raw.pushDebugGroup.call(this.raw, groupLabel);
  }
  popDebugGroup() {
    if (this.raw.popDebugGroup === void 0) return;
    this.raw.popDebugGroup.call(this.raw);
  }
  insertDebugMarker(markerLabel) {
    if (this.raw.insertDebugMarker === void 0) return;
    this.raw.insertDebugMarker.call(this.raw, markerLabel);
  }
  finish() {
    if (this.finished) {
      return webgpuRuntimeError(new Error("command encoder already finished"));
    }
    if (this.raw.finish === void 0) {
      return webgpuRuntimeError(new Error("underlying encoder handle does not expose finish"));
    }
    try {
      const buf = this.raw.finish.call(this.raw);
      this.finished = true;
      return ok(buf);
    } catch (e) {
      return webgpuRuntimeError(e);
    }
  }
};
function makeRhiCommandEncoder(raw) {
  return new RhiWgpuCommandEncoderImpl(raw);
}
function probeR32FloatCapability(deviceGeneration) {
  const receipt = createUnavailableR32FloatReceipt({
    deviceGeneration,
    failedStage: "texture-create",
    detail: "the wgpu CPU/WebGL2 lane has no real r32float profile executor"
  });
  return Promise.resolve(
    err(
      new RhiError({
        code: "rhi-texture-format-capability-unavailable",
        expected: "a real r32float profile executor for the active wgpu lane",
        hint: "retain fallback-only rendering; use a real WebGPU or Dawn device",
        detail: {
          stage: "texture-create",
          deviceGeneration,
          reason: receipt.stages[0]?.detail ?? "real executor unavailable"
        }
      })
    )
  );
}

// src/device.ts
var nextWgpuDeviceGeneration = 1;
var TEXTURE_DESTROYED_MAP = /* @__PURE__ */ new WeakMap();
var QUERY_SET_DESTROYED_MAP = /* @__PURE__ */ new WeakMap();
function projectTextureDescriptorForWasm(desc) {
  const size = desc.size;
  const extent = typeof size === "number" ? { width: size, height: 1, depthOrArrayLayers: 1 } : normalizeExtent(size);
  const projected = {
    size: extent,
    format: desc.format,
    usage: desc.usage
  };
  if (desc.label !== void 0) projected.label = desc.label;
  if (desc.mipLevelCount !== void 0) projected.mipLevelCount = desc.mipLevelCount;
  if (desc.sampleCount !== void 0) projected.sampleCount = desc.sampleCount;
  if (desc.dimension !== void 0) projected.dimension = desc.dimension;
  if (desc.viewFormats !== void 0) projected.viewFormats = Array.from(desc.viewFormats);
  if (desc.textureBindingViewDimension !== void 0) {
    projected.textureBindingViewDimension = desc.textureBindingViewDimension;
  }
  return projected;
}
function probeRgba16floatRenderable(raw) {
  let tex;
  try {
    if (raw.createTexture === void 0) return false;
    tex = raw.createTexture({
      label: "forgeax-caps-probe-rgba16float-renderable",
      format: "rgba16float",
      usage: 16,
      // GPUTextureUsage.RENDER_ATTACHMENT
      // wgpu-wasm deserializes TextureDescriptor.size as Extent3dJs;
      // preserve its named POD shape instead of relying on array coercion.
      size: { width: 1, height: 1, depthOrArrayLayers: 1 }
    });
    return true;
  } catch {
    return false;
  } finally {
    if (tex !== void 0 && typeof tex.destroy === "function") {
      tex.destroy();
    }
  }
}
function probeRg11b10ufloatRenderable(raw, features) {
  if (!features.has("rg11b10ufloat-renderable")) return false;
  let tex;
  try {
    if (raw.createTexture === void 0) return false;
    tex = raw.createTexture({
      label: "forgeax-caps-probe-rg11b10ufloat-renderable",
      format: "rg11b10ufloat",
      usage: 16,
      // GPUTextureUsage.RENDER_ATTACHMENT
      size: { width: 1, height: 1, depthOrArrayLayers: 1 }
    });
    return true;
  } catch {
    return false;
  } finally {
    if (tex !== void 0 && typeof tex.destroy === "function") {
      tex.destroy();
    }
  }
}
function probeFloat32Filterable(raw, features) {
  if (!features.has("float32-filterable")) return false;
  if (raw.createBindGroupLayout === void 0 || raw.createSampler === void 0) return false;
  try {
    raw.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: 2, sampler: { type: "filtering" } },
        // GPUShaderStage.FRAGMENT=2
        { binding: 1, visibility: 2, texture: { sampleType: "float" } }
      ]
    });
    raw.createSampler({ minFilter: "linear", magFilter: "linear" });
    return true;
  } catch {
    return false;
  }
}
var RhiWgpuDeviceImpl = class {
  features;
  limits;
  caps;
  queue;
  // forgeax-async-whitelist: wasm-bindgen — wgpu-wasm `Device.lost` Promise (spec mirror)
  lost;
  raw;
  deviceGeneration;
  r32FloatProbe;
  constructor(raw) {
    this.raw = raw;
    this.deviceGeneration = nextWgpuDeviceGeneration++;
    Object.defineProperty(this, "_internal_raw", {
      value: raw,
      writable: false,
      enumerable: false,
      configurable: false
    });
    this.features = raw.features ?? /* @__PURE__ */ new Set();
    this.limits = raw.limits ?? {};
    const rawFeatures = raw.features ?? /* @__PURE__ */ new Set();
    const rawLimits = raw.limits ?? {};
    const hasFeature = (name) => rawFeatures.has(name);
    const hdrCaps = {
      rgba16floatRenderable: probeRgba16floatRenderable(raw),
      rg11b10ufloatRenderable: probeRg11b10ufloatRenderable(raw, rawFeatures),
      float32Filterable: probeFloat32Filterable(raw, rawFeatures)
    };
    this.caps = {
      // rhi-wgpu owns the wasm GL fallback path; navigator.gpu is selected by
      // rhi-webgpu before this package is reached. Reporting the concrete
      // backend here lets runtime capability routing disable GL-incompatible
      // multisample targets instead of discovering the limitation as a panic
      // during render-graph texture allocation.
      backendKind: "wgpu-webgl2",
      // WebGL2 has no compute-shader analogue. Keep this capability false so
      // render-graph and pipeline callers receive the structured refusal
      // promised by the RHI contract instead of entering the command-encoder
      // shim's historical no-op compute pass.
      compute: false,
      // The current wgpu-wasm target is the WebGL2 fallback. WebGL2 has no
      // timestamp-query contract, even if a translated feature name appears
      // in the raw feature set.
      timestampQuery: false,
      timestampPeriodNanoseconds: null,
      // WebGL2 cannot execute wgpu's indirect draws. The wasm binding may
      // expose drawIndirect methods, but wgpu-core rejects the recorded work.
      indirectDrawing: false,
      textureCompressionBc: hasFeature("texture-compression-bc"),
      textureCompressionEtc2: hasFeature("texture-compression-etc2"),
      textureCompressionAstc: hasFeature("texture-compression-astc"),
      multiDrawIndirect: false,
      pushConstants: false,
      textureBindingArray: false,
      samplerAliasing: true,
      firstInstanceIndirect: false,
      // The wgpu GLES/WebGL2 downlevel may expose a non-zero translated
      // limit, but shader-storage buffers are not a usable WebGL2 contract.
      // Report the capability at the engine boundary rather than leaking the
      // raw adapter limit into layout/variant selection.
      storageBuffer: false,
      storageTexture: (rawLimits.maxStorageTexturesPerShaderStage ?? 0) > 0,
      // HDR / filterable caps (feat-20260608 M1):
      ...hdrCaps,
      maxColorAttachments: rawLimits.maxColorAttachments ?? 4
    };
    Object.defineProperty(this, "surfaceViewFormats", {
      value: raw.surfaceViewFormats ?? false,
      enumerable: false,
      configurable: false
    });
    this.queue = raw.queue === void 0 || raw.queue === null ? makeRhiQueue({}) : makeRhiQueue(raw.queue);
    let lostResolve;
    this.lost = raw.lost === void 0 ? new Promise((resolve) => {
      lostResolve = resolve;
    }) : raw.lost;
    if (raw.lost === void 0 && typeof raw.registerLostCallback === "function") {
      if (lostResolve !== void 0) {
        Object.defineProperty(this, "_lostResolver", {
          value: lostResolve,
          writable: false,
          enumerable: false,
          configurable: false
        });
        raw.registerLostCallback((reason, message) => {
          lostResolve?.({ reason, message });
        });
      }
    }
  }
  /**
   * The wrap helper routes the raw handle's method via try/catch into the
   * forgeax Result form. M4 dawn-node integration tests (w24) narrow the
   * dispatch into feature-not-enabled / limit-exceeded by inspecting the
   * thrown error message (mirrors @forgeax/engine-rhi-webgpu's classification path).
   *
   * F3-g (feat-20260619-wasm-fault-isolation M3 w7): exceptions carrying the
   * stable prefix `[wgpu-wasm] failed to parse` (D-1 contract) are classified
   * as `rhi-descriptor-invalid` (caller bug — malformed descriptor data);
   * exceptions without the prefix remain `webgpu-runtime-error` (runtime
   * condition). This classification applies to all 7 create* entry points that
   * route through wrap() (D-2 global semantics).
   */
  wrap(method, desc) {
    if (method === void 0) {
      return webgpuRuntimeError(new Error("underlying device handle does not expose this method"));
    }
    try {
      const handle = method.call(this.raw, desc);
      return ok(handle);
    } catch (e) {
      if (isDescriptorParseError(e)) {
        return descriptorInvalid(e);
      }
      return webgpuRuntimeError(e);
    }
  }
  createBuffer(desc) {
    if (this.raw.createBuffer === void 0) {
      return webgpuRuntimeError(new Error("underlying device handle does not expose createBuffer"));
    }
    try {
      const raw = this.raw.createBuffer.call(this.raw, desc);
      return ok(makeRhiBuffer(raw));
    } catch (e) {
      return webgpuRuntimeError(e);
    }
  }
  probeTextureFormatCapability() {
    this.r32FloatProbe ??= probeR32FloatCapability(this.deviceGeneration);
    return this.r32FloatProbe;
  }
  createTexture(desc) {
    const r = this.wrap(this.raw.createTexture, projectTextureDescriptorForWasm(desc));
    if (r.ok) {
      TEXTURE_DESTROYED_MAP.set(r.value, { destroyed: false });
    }
    return r;
  }
  destroyBuffer(buf) {
    const impl = buf;
    if (typeof impl.destroy !== "function") {
      return webgpuRuntimeError(
        new Error("Buffer brand does not expose destroy(); created outside makeRhiBuffer factory")
      );
    }
    return impl.destroy();
  }
  destroyTexture(tex) {
    const marker = TEXTURE_DESTROYED_MAP.get(tex);
    if (marker?.destroyed) {
      return doubleDestroy("GPU texture handle has not been destroyed yet");
    }
    const rawTex = tex;
    try {
      if (typeof rawTex.destroy === "function") {
        rawTex.destroy();
      }
    } catch (e) {
      return webgpuRuntimeError(e);
    }
    if (marker !== void 0) marker.destroyed = true;
    return ok(void 0);
  }
  destroyQuerySet(querySet) {
    const marker = QUERY_SET_DESTROYED_MAP.get(querySet);
    if (marker?.destroyed) return doubleDestroy("GPU query set has already been destroyed");
    const rawQuery = querySet;
    try {
      if (typeof rawQuery.destroy === "function") rawQuery.destroy();
    } catch (e) {
      return webgpuRuntimeError(e);
    }
    if (marker !== void 0) marker.destroyed = true;
    return ok(void 0);
  }
  createSampler(desc) {
    return this.wrap(this.raw.createSampler, desc);
  }
  createBindGroup(desc) {
    if (this.raw.createBindGroup === void 0) {
      return webgpuRuntimeError(
        new Error("underlying device handle does not expose createBindGroup")
      );
    }
    const mirroredEntries = [];
    for (const entry of desc.entries) {
      const resource = entry.resource;
      switch (resource.kind) {
        case "sampler": {
          mirroredEntries.push({ binding: entry.binding, resource: resource.value });
          break;
        }
        case "buffer": {
          const { buffer, offset, size } = resource.value;
          const bufferBinding = { buffer: unwrapBuffer(buffer) };
          if (offset !== void 0) bufferBinding.offset = offset;
          if (size !== void 0) bufferBinding.size = size;
          mirroredEntries.push({ binding: entry.binding, resource: bufferBinding });
          break;
        }
        case "textureView": {
          mirroredEntries.push({ binding: entry.binding, resource: resource.value });
          break;
        }
        case "externalTexture": {
          mirroredEntries.push({ binding: entry.binding, resource: resource.value });
          break;
        }
        default: {
          return webgpuRuntimeError(
            new Error("unreachable RhiBindingResource kind in rhi-wgpu createBindGroup")
          );
        }
      }
    }
    const mirroredDesc = { ...desc, entries: mirroredEntries };
    try {
      const handle = this.raw.createBindGroup.call(this.raw, mirroredDesc);
      return ok(handle);
    } catch (e) {
      return webgpuRuntimeError(e);
    }
  }
  createBindGroupLayout(desc) {
    return this.wrap(this.raw.createBindGroupLayout, desc);
  }
  createPipelineLayout(desc) {
    return this.wrap(this.raw.createPipelineLayout, desc);
  }
  createRenderPipeline(desc) {
    return this.wrap(this.raw.createRenderPipeline, desc);
  }
  createComputePipeline(desc) {
    if (!this.caps.compute) return featureNotEnabled("compute");
    return this.wrap(this.raw.createComputePipeline, desc);
  }
  createCommandEncoder(desc) {
    if (this.raw.createCommandEncoder === void 0) {
      return webgpuRuntimeError(
        new Error("underlying device handle does not expose createCommandEncoder")
      );
    }
    try {
      const raw = this.raw.createCommandEncoder.call(this.raw, desc);
      return ok(makeRhiCommandEncoder(raw));
    } catch (e) {
      return webgpuRuntimeError(e);
    }
  }
  createTextureView(texture, desc) {
    if (this.raw.createTextureView !== void 0) {
      try {
        const view = this.raw.createTextureView.call(this.raw, texture, desc);
        return ok(view);
      } catch (e) {
        if (isDescriptorParseError(e)) return descriptorInvalid(e);
        return webgpuRuntimeError(e);
      }
    }
    const texAsCreateView = texture;
    if (typeof texAsCreateView.createView !== "function") {
      return webgpuRuntimeError(
        new Error(
          "underlying device + texture handles expose neither device.createTextureView nor texture.createView"
        )
      );
    }
    try {
      const view = texAsCreateView.createView(desc);
      return ok(view);
    } catch (e) {
      if (isDescriptorParseError(e)) return descriptorInvalid(e);
      return webgpuRuntimeError(e);
    }
  }
  createQuerySet(desc) {
    if (desc.type === "timestamp" && this.caps.timestampQuery !== true) {
      return err(
        new RhiError({
          code: "feature-not-enabled",
          expected: "caps.timestampQuery === true (timestamp-query feature)",
          hint: "check device.caps.timestampQuery before creating timestamp QuerySets on the wgpu WebGL2 backend"
        })
      );
    }
    const result = this.wrap(this.raw.createQuerySet, desc);
    if (result.ok) QUERY_SET_DESTROYED_MAP.set(result.value, { destroyed: false });
    return result;
  }
};
function isDescriptorParseError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("[wgpu-wasm] failed to parse");
}
function makeRhiDevice(raw) {
  return { device: new RhiWgpuDeviceImpl(raw) };
}

// src/adapter.ts
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
      try {
        const rawDevice = await rawAdapter.requestDevice(opts);
        const { device } = makeRhiDevice(rawDevice);
        return ok(device);
      } catch (e) {
        return webgpuRuntimeError(e);
      }
    }
  };
}
function makeCanvasContext(rawContext, canvas) {
  let pendingSurfaceTexture = null;
  let pendingPresentationError;
  let surfaceDescriptor = {};
  let presentationProof;
  function presentPendingSurfaceTexture() {
    const previousError = pendingPresentationError;
    pendingPresentationError = void 0;
    if (previousError !== void 0) throw previousError;
    const pending = pendingSurfaceTexture;
    pendingSurfaceTexture = null;
    if (pending === null || typeof pending.present !== "function") return;
    try {
      pending.present();
    } catch (error) {
      pendingPresentationError = error;
    }
  }
  function scheduleSurfaceTexturePresent(surfaceTexture) {
    globalThis.queueMicrotask(() => {
      if (pendingSurfaceTexture !== surfaceTexture) return;
      pendingSurfaceTexture = null;
      try {
        surfaceTexture.present();
      } catch (error) {
        pendingPresentationError = error;
      }
    });
  }
  function annotateSurfaceTexture(texture) {
    if (texture === null || typeof texture !== "object") return;
    const target = texture;
    const metadata = {
      width: canvas?.width,
      height: canvas?.height,
      depthOrArrayLayers: 1,
      format: surfaceDescriptor.format,
      usage: surfaceDescriptor.usage
    };
    for (const [key, value] of Object.entries(metadata)) {
      if (value === void 0) continue;
      try {
        if (target[key] === void 0) {
          Object.defineProperty(target, key, {
            configurable: true,
            enumerable: false,
            value
          });
        }
      } catch {
      }
    }
  }
  const context = {
    configure(desc) {
      try {
        presentPendingSurfaceTexture();
        const mirrored = {};
        for (const key in desc) {
          mirrored[key] = desc[key];
        }
        if ("device" in mirrored) {
          const forgeaxDevice = desc.device;
          const rawDev = forgeaxDevice._internal_raw;
          if (rawDev !== void 0 && rawDev !== null) {
            mirrored.device = rawDev;
          }
        }
        if (canvas !== void 0) {
          if (mirrored.width === void 0) {
            mirrored.width = canvas.width;
          }
          if (mirrored.height === void 0) {
            mirrored.height = canvas.height;
          }
        }
        rawContext.configure(mirrored);
        surfaceDescriptor = { format: mirrored.format, usage: mirrored.usage };
        presentationProof = rawContext.probeSurfacePresentation?.();
        if (presentationProof === void 0) {
          delete context.presentationProof;
        } else {
          context.presentationProof = presentationProof;
        }
        return ok(void 0);
      } catch (e) {
        return webgpuRuntimeError(e);
      }
    },
    unconfigure() {
      try {
        presentPendingSurfaceTexture();
      } catch {
      }
      try {
        rawContext.unconfigure();
      } catch {
      }
    },
    getConfiguration() {
      const c = rawContext.getConfiguration();
      return c === null ? void 0 : c;
    },
    getCurrentTexture() {
      try {
        presentPendingSurfaceTexture();
        const raw = rawContext.getCurrentTexture();
        if (raw !== void 0 && raw !== null && typeof raw.getTexture === "function") {
          if (typeof raw.present === "function") {
            pendingSurfaceTexture = raw;
            scheduleSurfaceTexturePresent(pendingSurfaceTexture);
          }
          const texture = raw.getTexture();
          annotateSurfaceTexture(texture);
          return ok(texture);
        }
        annotateSurfaceTexture(raw);
        return ok(raw);
      } catch (e) {
        return webgpuRuntimeError(e);
      }
    }
  };
  return context;
}

// src/internal/wasm-loader.ts
var cachedPromise = null;
var cachedModule;
var defaultInitFn = async () => {
  const mod = await import('../../wgpu-wasm/dist/index.mjs');
  return mod.ensureReady();
};
function ensureRhiWgpuReady(options = {}) {
  if (cachedPromise !== null) {
    return cachedPromise;
  }
  const initFn = options.initFn ?? defaultInitFn;
  const p = initFn().then(
    (mod) => {
      cachedModule = mod;
      return mod;
    },
    (err7) => {
      cachedPromise = null;
      cachedModule = void 0;
      throw err7;
    }
  );
  cachedPromise = p;
  return p;
}
function getRhiWgpuModule() {
  return cachedModule;
}
var cachedWasmInstance;
function preCreateWebGL2ContextForWgpuGLBackend(canvas) {
  if (typeof canvas.getContext !== "function") return;
  try {
    canvas.getContext("webgl2", {
      alpha: true,
      // wgpu owns the single-sample surface resolve; avoid WebGL's default
      // multisampled drawing buffer, which makes that blit invalid in WebKit.
      antialias: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: "default"
    });
  } catch {
  }
}
async function requestAdapter(_opts, compatibleSurface) {
  const wasmModule = getRhiWgpuModule();
  if (wasmModule === void 0) {
    return err(
      new RhiError({
        code: "rhi-not-available",
        expected: "@forgeax/engine-rhi-wgpu wasm module initialized via ensureReady()",
        hint: "call ensureReady() before requestAdapter() \u2014 the wasm module must be loaded before adapter enumeration"
      })
    );
  }
  try {
    const instance = await wasmModule.RhiWgpuInstance.create();
    cachedWasmInstance = instance;
    if (compatibleSurface !== void 0) {
      preCreateWebGL2ContextForWgpuGLBackend(compatibleSurface);
    }
    const wasmAdapter = compatibleSurface !== void 0 && typeof instance.requestAdapterWithCanvas === "function" ? await instance.requestAdapterWithCanvas(compatibleSurface) : await instance.requestAdapter();
    if (typeof wasmAdapter === "string") {
      return err(
        new RhiError({
          code: "adapter-unavailable",
          expected: "a GPU adapter from wgpu-wasm backend (with compatible_surface)",
          hint: `wgpu-wasm backend failed: ${wasmAdapter}`
        })
      );
    }
    if (!wasmAdapter) {
      return err(
        new RhiError({
          code: "adapter-unavailable",
          expected: "a GPU adapter from wgpu-wasm backend",
          hint: "browser WebGPU unavailable and wgpu-wasm backend also failed to enumerate adapters \u2014 no GPU hardware accessible; display an unsupported-environment message"
        })
      );
    }
    return ok(makeRhiAdapter(wasmAdapter));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return err(
      new RhiError({
        code: "adapter-unavailable",
        expected: "wgpu-wasm RhiWgpuInstance.create() + requestAdapter() to succeed",
        hint: `browser WebGPU unavailable and wgpu-wasm backend also failed to enumerate adapters; cause: ${message}`
      })
    );
  }
}
function acquireCanvasContext(instance, canvas) {
  const nav = typeof globalThis !== "undefined" ? globalThis.navigator : void 0;
  if (nav !== void 0 && "gpu" in nav && nav.gpu !== void 0 && nav.gpu !== null) {
    let rawCtx;
    try {
      rawCtx = canvas.getContext("webgpu");
    } catch {
      rawCtx = null;
    }
    if (rawCtx !== null && rawCtx !== void 0) {
      return ok(makeCanvasContext(rawCtx, canvas));
    }
  }
  if (typeof instance.createSurface !== "function") {
    return err(
      new RhiError({
        code: "rhi-not-available",
        expected: "RhiWgpuInstance with a createSurface method \u2014 obtained from requestAdapter wasm fallback path",
        hint: "call requestAdapter() first to obtain a wasm instance, then pass it to acquireCanvasContext()"
      })
    );
  }
  preCreateWebGL2ContextForWgpuGLBackend(canvas);
  let wasmSurface;
  try {
    wasmSurface = instance.createSurface(canvas);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return err(
      new RhiError({
        code: "rhi-not-available",
        expected: "instance.createSurface(canvas) to succeed",
        hint: `wasm surface creation failed: ${message}`
      })
    );
  }
  return ok(makeCanvasContext(wasmSurface, canvas));
}
function createRawShaderModule(device, desc) {
  const rawDevice = device._internal_raw;
  const candidateRawCSM = rawDevice?.createShaderModule;
  if (typeof candidateRawCSM !== "function") {
    return err(
      new RhiError({
        code: "shader-compile-failed",
        expected: "rhi-wgpu RhiDevice carries an internal raw handle exposing createShaderModule",
        hint: "unregistered RhiDevice instance \u2014 pass an RhiDevice produced by rhi.requestAdapter() \u2192 adapter.requestDevice()"
      })
    );
  }
  const mirrored = { code: desc.code };
  if ("label" in desc && desc.label !== void 0) mirrored.label = desc.label;
  try {
    return ok(
      candidateRawCSM.call(rawDevice, mirrored)
    );
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : String(caught);
    return err(
      new RhiError({
        code: "shader-compile-failed",
        expected: "rawDevice.createShaderModule(desc) succeeds (spec: synchronous part rarely throws)",
        hint: `rhi-wgpu shim caught: ${message}`
      })
    );
  }
}
async function createShaderModule(device, desc) {
  const result = createRawShaderModule(device, desc);
  if (!result.ok) return result;
  return result;
}
function createShaderModuleImmediate(device, desc) {
  return createRawShaderModule(device, desc);
}
var rhi = {
  requestAdapter,
  // The singleton internally binds the cached wasm instance (from the last
  // requestAdapter call) as the first parameter to acquireCanvasContext.
  // AI users and the runtime call `pack.rhi.acquireCanvasContext(canvas)`
  // with a single parameter — the instance is passed implicitly
  // (plan-strategy D-3).
  acquireCanvasContext: (canvas) => {
    const instance = cachedWasmInstance ?? { createSurface: void 0 };
    return acquireCanvasContext(instance, canvas);
  },
  createShaderModule,
  createShaderModuleImmediate
};

export { acquireCanvasContext, createShaderModule, createShaderModuleImmediate, ensureRhiWgpuReady as ensureReady, requestAdapter, rhi };
