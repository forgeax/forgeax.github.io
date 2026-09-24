import { ok, err } from '../../types/dist/index.mjs';
import { RhiError, ok as ok$1, R32FLOAT_PROBE_STAGES } from '../../rhi/dist/index.mjs';

// src/index.ts
var RhiNullRenderPassEncoder = class {
  /** Number of draw* calls issued on this pass (AC-06 readback). */
  drawCount = 0;
  bindGroupCount = 0;
  /** Most recent setVertexBuffer / setBindGroup ownership validation; ok unless
   *  a foreign handle was passed (AC-09 readback). */
  lastValidation = ok(void 0);
  bookkeeper;
  counter;
  passName;
  constructor(bookkeeper, counter, passName) {
    this.bookkeeper = bookkeeper;
    this.counter = counter;
    this.passName = passName;
  }
  setPipeline(_pipeline) {
  }
  setVertexBuffer(_slot, buffer, _offset, _size) {
    this.lastValidation = this.bookkeeper.validateOwnership(buffer);
  }
  setIndexBuffer(_buffer, _format, _offset, _size) {
  }
  setBindGroup(_index, bindGroup, _dynamicOffsetsData, _dynamicOffsetsDataStart, _dynamicOffsetsDataLength) {
    this.bindGroupCount++;
    this.counter?.recordBindGroup();
    this.lastValidation = this.bookkeeper.validateOwnership(bindGroup);
  }
  draw(_vertexCount, _instanceCount, _firstVertex, _firstInstance) {
    this.drawCount++;
    this.counter?.recordDraw();
  }
  drawIndexed(_indexCount, _instanceCount, _firstIndex, _baseVertex, _firstInstance) {
    this.drawCount++;
    this.counter?.recordDraw();
  }
  end() {
    this.counter?.recordPassName(this.passName);
  }
  setViewport(_x, _y, _w, _h, _minDepth, _maxDepth) {
  }
  setScissorRect(_x, _y, _w, _h) {
  }
  setBlendConstant(_color) {
  }
  setStencilReference(_reference) {
  }
  drawIndirect(_indirectBuffer, _indirectOffset) {
    this.drawCount++;
    this.counter?.recordDraw();
  }
  drawIndexedIndirect(_indirectBuffer, _indirectOffset) {
    this.drawCount++;
    this.counter?.recordDraw();
  }
  pushDebugGroup(_groupLabel) {
  }
  popDebugGroup() {
  }
  insertDebugMarker(_markerLabel) {
  }
  executeBundles(_bundles) {
    return ok(void 0);
  }
  beginOcclusionQuery(_queryIndex) {
    return ok(void 0);
  }
  endOcclusionQuery() {
    return ok(void 0);
  }
};
var RhiNullComputePassEncoder = class {
  /** Number of dispatchWorkgroups calls issued on this pass (readback). */
  dispatchCount = 0;
  /** Most recent setBindGroup ownership validation (AC-09 readback). */
  lastValidation = ok(void 0);
  bookkeeper;
  counter;
  passName;
  constructor(bookkeeper, counter, passName) {
    this.bookkeeper = bookkeeper;
    this.counter = counter;
    this.passName = passName;
  }
  setPipeline(_pipeline) {
  }
  setBindGroup(_index, bindGroup, _dynamicOffsets) {
    this.lastValidation = this.bookkeeper.validateOwnership(bindGroup);
  }
  dispatchWorkgroups(_x, _y, _z) {
    this.dispatchCount++;
    this.counter?.recordDispatch();
  }
  dispatchWorkgroupsIndirect(indirectBuffer, _indirectOffset) {
    this.lastValidation = this.bookkeeper.validateOwnership(indirectBuffer);
    this.dispatchCount++;
    this.counter?.recordDispatch();
  }
  end() {
    this.counter?.recordPassName(this.passName);
  }
};

// src/command-encoder.ts
var DeviceCounter = class {
  constructor(device) {
    this.device = device;
  }
  device;
  recordDraw() {
    this.device.totalDrawCount++;
  }
  recordDispatch() {
    this.device.totalDispatchCount++;
  }
  recordBindGroup() {
    this.device.totalBindGroupCount++;
  }
  recordPassName(name) {
    this.device.framePassNames.push(name);
  }
};
function readPassLabel(desc) {
  if (desc && typeof desc.label === "string" && desc.label.length > 0) {
    return desc.label;
  }
  return "<unnamed>";
}
var RhiNullCommandEncoder = class {
  bookkeeper;
  counter;
  constructor(bookkeeper, device) {
    this.bookkeeper = bookkeeper;
    this.counter = new DeviceCounter(device);
  }
  beginRenderPass(desc) {
    const label = readPassLabel(desc);
    return new RhiNullRenderPassEncoder(this.bookkeeper, this.counter, label);
  }
  beginComputePass(desc) {
    const label = readPassLabel(desc);
    return new RhiNullComputePassEncoder(this.bookkeeper, this.counter, label);
  }
  encodeEmptyComputePass(desc) {
    this.counter.recordPassName(readPassLabel(desc));
  }
  copyBufferToBuffer(_source, _sourceOffsetOrDestination, _destinationOrSize, _destinationOffset, _size) {
  }
  copyBufferToTexture(_source, _destination, _copySize) {
  }
  copyTextureToBuffer(_source, _destination, _copySize) {
  }
  copyTextureToTexture(_source, _destination, _copySize) {
  }
  clearBuffer(_buffer, _offset, _size) {
  }
  resolveQuerySet(_querySet, _firstQuery, _queryCount, _destination, _destinationOffset) {
    return ok(void 0);
  }
  pushDebugGroup(_groupLabel) {
  }
  popDebugGroup() {
  }
  insertDebugMarker(_markerLabel) {
  }
  finish() {
    return ok(this.bookkeeper.register("CommandBuffer"));
  }
};
var BOOKKEEPING_KEY = /* @__PURE__ */ Symbol("forgeax-rhi-null-bookkeeping");
var Bookkeeper = class {
  deviceId;
  nextHandleId = 0;
  records = /* @__PURE__ */ new Map();
  constructor(deviceId) {
    this.deviceId = deviceId;
  }
  /**
   * Register a freshly-minted handle of the given kind, returning a plain
   * object that carries its ledger row. The caller casts the return value to
   * the concrete brand (`as unknown as Buffer` etc.).
   */
  register(kind) {
    const id = this.nextHandleId++;
    const record = {
      id,
      kind,
      destroyed: false,
      sourceDeviceId: this.deviceId
    };
    this.records.set(id, record);
    return { [BOOKKEEPING_KEY]: record };
  }
  /**
   * Mark a handle destroyed. Fail-fasts on a second destroy
   * ('destroy-after-destroy') or on a handle issued by a different device
   * ('rhi-not-available'); otherwise flips the destroyed flag and returns ok.
   */
  destroy(handle) {
    const ownership = this.validateOwnership(handle);
    if (!ownership.ok) return ownership;
    const destroyedCheck = isHandleDestroyed(handle);
    if (!destroyedCheck.ok) return destroyedCheck;
    ownership.value.destroyed = true;
    return ok(void 0);
  }
  /**
   * Report whether a handle has already been destroyed (true once destroy()
   * has flipped its flag). Used by command-stream methods that must not
   * consume a stale handle.
   */
  isDestroyed(handle) {
    return readRecord(handle)?.destroyed === true;
  }
  /**
   * Validate that a handle was issued by THIS device. Returns the ledger row on
   * success so callers can mutate it (e.g. flip destroyed); returns
   * 'rhi-not-available' for a foreign handle (AC-09 — no silent pass).
   */
  validateOwnership(handle) {
    const record = readRecord(handle);
    if (record === void 0 || record.sourceDeviceId !== this.deviceId) {
      return err(
        new RhiError({
          code: "rhi-not-available",
          expected: "handle was issued by this RhiNull device",
          hint: "do not pass a handle created on a different RhiNull device into this device; create resources on the device they are used with"
        })
      );
    }
    return ok(record);
  }
  /**
   * Return all ledger rows as a readonly array. M3 unit tests (w17) read this
   * to assert create/destroy pairing, BGL/PSO shape counts, and resource
   * lifecycle coverage (AC-05/06/07). Returns a snapshot of the current Map
   * so callers can iterate without a stale reference after further mutations.
   */
  allRecords() {
    return [...this.records.values()];
  }
  /** Report the total number of records in the ledger. */
  recordCount() {
    return this.records.size;
  }
};
function readRecord(handle) {
  if (handle === null || typeof handle !== "object") return void 0;
  const tagged = handle;
  return tagged[BOOKKEEPING_KEY];
}
function isHandleDestroyed(handle) {
  if (readRecord(handle)?.destroyed === true) {
    return err(
      new RhiError({
        code: "destroy-after-destroy",
        expected: "GPU buffer/texture handle has not been destroyed yet",
        hint: "object already destroyed; track lifecycle in caller or check isDestroyed before re-destroy"
      })
    );
  }
  return ok(void 0);
}
function probeR32FloatCapability(deviceGeneration) {
  return Promise.resolve(
    ok$1({
      profile: "r32float-mip-sampled-storage",
      verdict: "structural-only",
      evidence: "structural",
      deviceGeneration,
      stages: R32FLOAT_PROBE_STAGES.map((stage) => ({
        stage,
        verdict: "structural-only",
        evidence: "structural"
      })),
      sampleType: "unfilterable-float",
      usages: ["texture-binding", "storage-binding", "copy-src"],
      probeExecutions: 1
    })
  );
}

// src/device.ts
var nextDeviceId = 0;
var RhiNullDevice = class {
  internalBookkeeper;
  nullQueue;
  encoderFactory;
  deviceGeneration;
  r32FloatProbe;
  /** Per-frame total draw count across all pass encoders executed this frame
   *  (aggregated by the command encoder on finish, then reset). M3 unit tests
   *  (w17) read this to assert draw count >= 1 (AC-06). */
  totalDrawCount = 0;
  /** Per-frame total direct and indirect compute dispatch count. */
  totalDispatchCount = 0;
  /** Per-frame total bind group set count (AC-06 / AC-05 readback). */
  totalBindGroupCount = 0;
  /** Per-frame pass names executed this frame, in schedule order (AC-04). */
  framePassNames = [];
  /** The per-device handle ledger — exposed so M3 tests can assert create/destroy
   *  pairing and BGL/PSO shape counts (AC-05/06/07). */
  get bookkeeper() {
    return this.internalBookkeeper;
  }
  constructor(queue, encoderFactory) {
    this.deviceGeneration = nextDeviceId;
    this.internalBookkeeper = new Bookkeeper(nextDeviceId++);
    this.nullQueue = queue;
    this.encoderFactory = encoderFactory;
  }
  probeTextureFormatCapability() {
    this.r32FloatProbe ??= probeR32FloatCapability(this.deviceGeneration);
    return this.r32FloatProbe;
  }
  get caps() {
    return {
      backendKind: "null",
      compute: true,
      timestampQuery: false,
      timestampPeriodNanoseconds: null,
      indirectDrawing: true,
      textureCompressionBc: false,
      textureCompressionEtc2: false,
      textureCompressionAstc: false,
      // 3 wgpu-native-only reserved flags stay false on non-native backends
      // (D-5); the headless backend is not a native runtime.
      multiDrawIndirect: false,
      pushConstants: false,
      textureBindingArray: false,
      samplerAliasing: true,
      firstInstanceIndirect: true,
      storageBuffer: true,
      storageTexture: true,
      rgba16floatRenderable: true,
      rg11b10ufloatRenderable: true,
      float32Filterable: true,
      maxColorAttachments: 8
    };
  }
  get features() {
    return EMPTY_FEATURES;
  }
  get limits() {
    return EMPTY_LIMITS;
  }
  get queue() {
    return this.nullQueue;
  }
  // forgeax-async-whitelist: dom-native — spec `GPUDevice.lost` Promise
  // passthrough. The headless backend never loses a device (no GPU), so the
  // Promise stays unsettled for the lifetime of the device, mirroring a live
  // device that never transitions to the lost state.
  get lost() {
    return NEVER;
  }
  createBuffer(_desc) {
    return ok(this.internalBookkeeper.register("Buffer"));
  }
  createTexture(_desc) {
    return ok(this.internalBookkeeper.register("Texture"));
  }
  destroyBuffer(buf) {
    return this.internalBookkeeper.destroy(buf);
  }
  destroyQuerySet(querySet) {
    return this.internalBookkeeper.destroy(querySet);
  }
  destroyTexture(tex) {
    return this.internalBookkeeper.destroy(tex);
  }
  createTextureView(_texture, _desc) {
    return ok(this.internalBookkeeper.register("TextureView"));
  }
  createSampler(_desc) {
    return ok(this.internalBookkeeper.register("Sampler"));
  }
  createBindGroupLayout(_desc) {
    return ok(this.internalBookkeeper.register("BindGroupLayout"));
  }
  createBindGroup(_desc) {
    return ok(this.internalBookkeeper.register("BindGroup"));
  }
  createPipelineLayout(_desc) {
    return ok(this.internalBookkeeper.register("PipelineLayout"));
  }
  createRenderPipeline(_desc) {
    return ok(this.makePipeline("RenderPipeline"));
  }
  createComputePipeline(_desc) {
    return ok(this.makePipeline("ComputePipeline"));
  }
  createQuerySet(desc) {
    if (desc.type === "timestamp") {
      return err(
        new RhiError({
          code: "feature-not-enabled",
          expected: "caps.timestampQuery === true (timestamp-query feature)",
          hint: "RhiNull is structural-only and cannot produce GPU timestamp ticks"
        })
      );
    }
    return ok(this.internalBookkeeper.register("QuerySet"));
  }
  createCommandEncoder(_desc) {
    return ok(this.encoderFactory(this.internalBookkeeper, this));
  }
  /**
   * Mint a pipeline handle whose object also carries the no-op
   * `getBindGroupLayout(index)` ops method (D-2). The prod auto-layout path
   * (debug-draw.ts) and the existing mock unit tests both call
   * `pipeline.getBindGroupLayout(n)`; returning a legal BindGroupLayout brand
   * (recorded in the ledger) keeps those consumers from crashing on a missing
   * method.
   */
  makePipeline(kind) {
    const handle = this.internalBookkeeper.register(kind);
    const getBindGroupLayout = (_index) => this.internalBookkeeper.register("BindGroupLayout");
    return Object.assign(handle, { getBindGroupLayout });
  }
};
var EMPTY_FEATURES = /* @__PURE__ */ new Set();
var EMPTY_LIMITS = {};
var NEVER = new Promise(() => {
});
var RhiNullQueue = class {
  writeBuffer(_buffer, _bufferOffset, _data, _dataOffset, _size) {
    return ok(void 0);
  }
  writeTexture(_destination, _data, _dataLayout, _size) {
    return ok(void 0);
  }
  copyExternalImageToTexture(_source, _destination, _copySize) {
    return ok(void 0);
  }
  submit(_commandBuffers) {
    return ok(void 0);
  }
  // forgeax-async-whitelist: dom-native — spec `GPUQueue.onSubmittedWorkDone`
  // never rejects. The headless backend has no pending GPU work, so it resolves
  // immediately (AC-12: read-back idioms must not hang).
  onSubmittedWorkDone() {
    return Promise.resolve(void 0);
  }
};

// src/adapter.ts
var RhiNullAdapter = class {
  features = /* @__PURE__ */ new Set();
  limits = {};
  // forgeax-async-whitelist is not needed: this returns Promise<Result<...>>
  // per the spec contract; never rejects.
  requestDevice(_opts) {
    const device = new RhiNullDevice(
      new RhiNullQueue(),
      (bookkeeper, dev) => new RhiNullCommandEncoder(bookkeeper, dev)
    );
    return Promise.resolve(ok(device));
  }
};
var RhiNullCanvasContext = class {
  configure(_desc) {
    return ok(void 0);
  }
  unconfigure() {
  }
  getConfiguration() {
    return void 0;
  }
  getCurrentTexture() {
    return ok({});
  }
};
function acquireCanvasContext(_canvas) {
  return ok(new RhiNullCanvasContext());
}
function createShaderModule(_device, _desc) {
  return Promise.resolve(ok({}));
}
function createShaderModuleImmediate(_device, _desc) {
  return ok({});
}

// src/index.ts
function requestAdapter(_opts, _compatibleSurface) {
  return Promise.resolve(ok(new RhiNullAdapter()));
}
var rhi = {
  requestAdapter,
  acquireCanvasContext,
  createShaderModule,
  createShaderModuleImmediate
};

export { RhiNullAdapter, RhiNullCanvasContext, RhiNullCommandEncoder, RhiNullComputePassEncoder, RhiNullDevice, RhiNullQueue, RhiNullRenderPassEncoder, acquireCanvasContext, createShaderModule, createShaderModuleImmediate, rhi };
