import { freezeBarrelDistortionMapping } from './chunk-ZPN33BZC.mjs';
import { PROBE_BLEND_RECORD_CAPACITY, PROBE_BLEND_RECORD_BYTE_SIZE } from './chunk-4QQOKCLH.mjs';
import { GPU_BUFFER_USAGE_MAP_READ, GPU_BUFFER_USAGE_VERTEX, GPU_BUFFER_USAGE_COPY_DST, GPU_BUFFER_USAGE_UNIFORM, GPU_BUFFER_USAGE_QUERY_RESOLVE, GPU_BUFFER_USAGE_COPY_SRC, GPU_TEXTURE_USAGE_COPY_SRC, GPU_TEXTURE_USAGE_COPY_DST, GPU_TEXTURE_USAGE_TEXTURE_BINDING, GPU_TEXTURE_USAGE_STORAGE_BINDING, GPU_TEXTURE_USAGE_RENDER_ATTACHMENT } from './chunk-OYW4NIWJ.mjs';
import { R_MIN, ok, err } from '../../types/dist/index.mjs';
import { err as err$1, ok as ok$1, RhiError } from '../../rhi/dist/index.mjs';

// src/ssr/hiz.ts
var SSR_HIZ_FORMAT = "r32float";
function validExtent(extent) {
  return Number.isInteger(extent.width) && Number.isInteger(extent.height) && extent.width > 0 && extent.height > 0;
}
function requireExtent(extent) {
  if (!validExtent(extent)) {
    throw new RangeError("SSR Hi-Z extent must contain positive integer width and height");
  }
}
function nextSsrHiZMipExtent(extent) {
  requireExtent(extent);
  return {
    width: Math.max(1, Math.floor(extent.width / 2)),
    height: Math.max(1, Math.floor(extent.height / 2))
  };
}
function buildSsrHiZPlan(extent) {
  requireExtent(extent);
  const levels = [];
  let current = { width: extent.width, height: extent.height };
  let level = 0;
  while (true) {
    levels.push({ level, ...current });
    if (current.width === 1 && current.height === 1) break;
    current = nextSsrHiZMipExtent(current);
    level += 1;
  }
  return Object.freeze({
    extent: Object.freeze({ width: extent.width, height: extent.height }),
    format: SSR_HIZ_FORMAT,
    mipLevelCount: levels.length,
    levels: Object.freeze(levels.map((entry) => Object.freeze(entry))),
    graphSize: Object.freeze({ width: extent.width, height: extent.height })
  });
}

// src/ssr/resources.ts
var SSR_TRACE_FORMAT = "rgba16float";
var SSR_R32FLOAT_BYTES_PER_PIXEL = 4;
var SSR_RGBA16FLOAT_BYTES_PER_PIXEL = 8;
var SSR_TEMPORAL_PARAMS_BYTES = 32;
var SSR_SPATIAL_MEMORY_BUDGET_BYTES = 45088768;
function halfExtent(extent) {
  return {
    width: Math.max(1, Math.floor(extent.width / 2)),
    height: Math.max(1, Math.floor(extent.height / 2))
  };
}
function byteCount(width, height, bytesPerPixel) {
  const bytes = width * height * bytesPerPixel;
  if (!Number.isSafeInteger(bytes)) {
    throw new RangeError("SSR spatial descriptor byte count exceeds safe integer range");
  }
  return bytes;
}
function estimateSsrSpatialMemory(extent, options = {}) {
  const half = halfExtent(extent);
  const plan = buildSsrHiZPlan(half);
  const temporal = options.temporal !== false;
  const hizBytes = plan.levels.reduce(
    (sum, level) => sum + byteCount(level.width, level.height, SSR_R32FLOAT_BYTES_PER_PIXEL),
    0
  );
  const traceBytes = byteCount(half.width, half.height, SSR_RGBA16FLOAT_BYTES_PER_PIXEL);
  const hitReactivityBytes = byteCount(half.width, half.height, SSR_R32FLOAT_BYTES_PER_PIXEL);
  const resolvedBytes = temporal ? plan.levels.reduce(
    (sum, level) => sum + byteCount(level.width, level.height, SSR_RGBA16FLOAT_BYTES_PER_PIXEL),
    0
  ) : 0;
  const historyBytes = temporal ? half.width * half.height * 12 * 2 : 0;
  const temporalParamsBytes = temporal ? SSR_TEMPORAL_PARAMS_BYTES : 0;
  const fallbackInputBytes = byteCount(
    extent.width,
    extent.height,
    SSR_RGBA16FLOAT_BYTES_PER_PIXEL
  );
  const ssrOwnedBytes = hizBytes + traceBytes + hitReactivityBytes + resolvedBytes + historyBytes + temporalParamsBytes + fallbackInputBytes;
  return Object.freeze({
    width: extent.width,
    height: extent.height,
    halfWidth: half.width,
    halfHeight: half.height,
    hizBytes,
    traceBytes,
    hitReactivityBytes,
    resolvedBytes,
    historyBytes,
    temporalParamsBytes,
    fallbackInputBytes,
    ssrOwnedBytes,
    budgetBytes: SSR_SPATIAL_MEMORY_BUDGET_BYTES,
    withinBudget: ssrOwnedBytes <= SSR_SPATIAL_MEMORY_BUDGET_BYTES
  });
}
function texture(graph, label, format, extent) {
  const created = graph.createTexture(label, {
    format,
    size: { width: extent.width, height: extent.height },
    domain: "linear-hdr"
  });
  if (!created.ok) return created;
  const view = graph.view(created.value, { label: `${label}.view`, dimension: "2d" });
  if (!view.ok) return view;
  return ok({
    texture: created.value,
    view: view.value,
    width: extent.width,
    height: extent.height,
    format
  });
}
function createSsrHiZResources(graph, extent) {
  const plan = buildSsrHiZPlan(halfExtent(extent));
  const created = graph.createTexture("ssr-hiz", {
    format: SSR_HIZ_FORMAT,
    size: plan.graphSize,
    mipLevelCount: plan.mipLevelCount
  });
  if (!created.ok) return created;
  const levels = [];
  for (const entry of plan.levels) {
    const view = graph.view(created.value, {
      label: `ssr-hiz.mip-${entry.level}.view`,
      dimension: "2d",
      baseMipLevel: entry.level,
      mipLevelCount: 1
    });
    if (!view.ok) return view;
    levels.push(view.value);
  }
  return ok({ plan, texture: created.value, levels: Object.freeze(levels) });
}
function createSsrSpatialResources(graph, extent) {
  const hiz = createSsrHiZResources(graph, extent);
  if (!hiz.ok) return hiz;
  const traceExtent = halfExtent(extent);
  const trace = texture(graph, "ssr-trace", SSR_TRACE_FORMAT, traceExtent);
  if (!trace.ok) return trace;
  const hitTexture = graph.createTexture("ssr-hit-reactivity", {
    format: "r32float",
    size: traceExtent
  });
  if (!hitTexture.ok) return hitTexture;
  const hitReactivity = graph.view(hitTexture.value, {
    label: "ssr-hit-reactivity.view",
    dimension: "2d"
  });
  if (!hitReactivity.ok) return hitReactivity;
  return ok({ hiz: hiz.value, trace: trace.value, hitReactivity: hitReactivity.value });
}

// src/inspection-types.ts
function projectLightInspection(input) {
  return Object.freeze({
    generation: input.generation,
    candidate: input.candidate,
    accepted: input.accepted,
    lastKnownGood: input.lastKnownGood,
    failure: input.failure,
    failureKeys: [...input.failureKeys],
    resourceCount: input.resourceCount,
    uploadBytes: input.uploadBytes
  });
}
function lightInspectionIdentity(topology, generation) {
  return `${topology}:generation-${generation}`;
}
var emptyBloomInspection = () => ({
  graphStatus: "empty",
  enabled: false,
  levelCount: 0,
  levelDimensions: [],
  downsamplePassCount: 0,
  upsamplePassCount: 0,
  targetCount: 0,
  targetBytes: 0,
  resourceCount: 0,
  passCount: 0,
  encodeCount: 0,
  bindGroupCount: 0,
  uploadCount: 0,
  residentChildBytes: 0,
  generation: 0,
  state: "off"
});
function projectBarrelDistortionInspection(input) {
  const effectiveMapping = input.effectiveMapping === void 0 ? void 0 : freezeBarrelDistortionMapping(input.effectiveMapping);
  return Object.freeze({
    effectiveMapping,
    extent: effectiveMapping === void 0 ? void 0 : Object.freeze({ width: effectiveMapping.width, height: effectiveMapping.height }),
    frameId: input.frameId,
    deviceGeneration: input.deviceGeneration,
    graphGeneration: input.graphGeneration,
    lastKnownGood: input.lastKnownGood
  });
}

// src/prepare/extended-lighting/state.ts
function createExtendedLightingState(generation) {
  return {
    enabled: false,
    generation,
    status: "empty",
    candidate: void 0,
    accepted: void 0,
    lastKnownGood: void 0,
    resourceCount: 0,
    descriptorBytes: 0,
    uploadCount: 0,
    passCount: 0,
    bindGroupCount: 0,
    failure: void 0,
    failureKeys: []
  };
}
function promoteExtendedLightingCandidate(state, candidate) {
  if (candidate === void 0) return state;
  return {
    ...state,
    enabled: true,
    generation: candidate.generation,
    status: "accepted",
    candidate: void 0,
    accepted: candidate,
    lastKnownGood: candidate,
    resourceCount: 4,
    descriptorBytes: candidate.descriptorBytes,
    uploadCount: candidate.uploadCount
  };
}
function recordExtendedLightingFailure(state, failure2) {
  const key = `${failure2.detail.entity}:${failure2.detail.feature}:${failure2.detail.generation}`;
  if (state.failureKeys.includes(key)) return state;
  return {
    ...state,
    failure: failure2,
    failureKeys: [...state.failureKeys, key]
  };
}
function projectExtendedLightingInspection(state) {
  const identity = (candidate) => candidate === void 0 ? void 0 : lightInspectionIdentity(candidate.topology, candidate.generation);
  return projectLightInspection({
    generation: state.generation,
    candidate: identity(state.candidate),
    accepted: identity(state.accepted),
    lastKnownGood: identity(state.lastKnownGood),
    failure: state.failure?.code,
    failureKeys: state.failureKeys,
    resourceCount: state.resourceCount,
    uploadBytes: state.descriptorBytes
  });
}
var SSR_HISTORY_FORMAT = "rgba16float";
var HISTORY_USAGE = GPU_TEXTURE_USAGE_COPY_SRC | GPU_TEXTURE_USAGE_COPY_DST | GPU_TEXTURE_USAGE_TEXTURE_BINDING | GPU_TEXTURE_USAGE_STORAGE_BINDING | GPU_TEXTURE_USAGE_RENDER_ATTACHMENT;
function positiveDimension(value, field) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${field} must be a positive safe integer.`);
  }
  return value;
}
function createResources(device, scope, width, height) {
  const halfWidth = Math.max(1, Math.floor(width / 2));
  const halfHeight = Math.max(1, Math.floor(height / 2));
  const descriptor = {
    label: "ssr-history-rgba16float",
    size: { width: halfWidth, height: halfHeight, depthOrArrayLayers: 1 },
    format: SSR_HISTORY_FORMAT,
    usage: HISTORY_USAGE,
    mipLevelCount: 1,
    sampleCount: 1,
    dimension: "2d",
    viewFormats: void 0,
    textureBindingViewDimension: void 0
  };
  const childScope = scope.createChild(`${scope.owner}:ssr-history`);
  const slots = [];
  for (const index of [0, 1]) {
    const texture2 = device.createTexture({
      ...descriptor,
      label: `ssr-history-rgba16float-${index}`
    });
    if (!texture2.ok) {
      childScope.abandon();
      return texture2;
    }
    childScope._adopt("texture", texture2.value, (value) => {
      device.destroyTexture(value);
    });
    const view = device.createTextureView(texture2.value, {
      label: `ssr-history-rgba16float-${index}.view`,
      dimension: "2d",
      baseMipLevel: 0,
      mipLevelCount: 1,
      baseArrayLayer: 0,
      arrayLayerCount: 1
    });
    if (!view.ok) {
      childScope.abandon();
      return view;
    }
    const surfaceTexture = device.createTexture({
      ...descriptor,
      label: `ssr-history-surface-${index}`,
      format: "rgba8unorm"
    });
    if (!surfaceTexture.ok) {
      childScope.abandon();
      return surfaceTexture;
    }
    childScope._adopt("texture", surfaceTexture.value, (value) => {
      device.destroyTexture(value);
    });
    const surfaceView = device.createTextureView(surfaceTexture.value, { dimension: "2d" });
    if (!surfaceView.ok) {
      childScope.abandon();
      return surfaceView;
    }
    slots.push({
      texture: texture2.value,
      view: view.value,
      surfaceTexture: surfaceTexture.value,
      surfaceView: surfaceView.value
    });
  }
  const params = device.createBuffer({
    label: "ssr-temporal-params",
    size: 32,
    usage: GPU_BUFFER_USAGE_UNIFORM | GPU_BUFFER_USAGE_COPY_DST,
    mappedAtCreation: false
  });
  if (!params.ok) {
    childScope.abandon();
    return params;
  }
  childScope._adopt("buffer", params.value, (value) => {
    device.destroyBuffer(value);
  });
  const cleared = device.queue.writeBuffer(params.value, 0, new Uint8Array(32));
  if (!cleared.ok) {
    childScope.abandon();
    return cleared;
  }
  return ok({
    width,
    height,
    halfWidth,
    halfHeight,
    bytes: halfWidth * halfHeight * 12 * 2,
    descriptor,
    slots,
    paramsBuffer: params.value,
    childScope
  });
}
function failure(code, expected, hint, detail) {
  return { code, expected, hint, ...{}  };
}
var SsrHistoryOwner = class _SsrHistoryOwner {
  constructor(device, scope, resources) {
    this.device = device;
    this.scope = scope;
    this.activeResources = resources;
  }
  device;
  scope;
  activeResources;
  retiringResources = /* @__PURE__ */ new Set();
  retirementFencePending = false;
  activeCandidate;
  readIndex = 0;
  valid = false;
  state = "first-frame";
  resetReason = "first-enable";
  lastFailure;
  resetCount = 0;
  static create(input) {
    const width = positiveDimension(input.width, "width");
    const height = positiveDimension(input.height, "height");
    const resources = createResources(input.device, input.scope, width, height);
    return resources.ok ? ok(new _SsrHistoryOwner(input.device, input.scope, resources.value)) : resources;
  }
  get resources() {
    if (this.activeResources === void 0) throw new Error("SSR history resources are retired.");
    return this.activeResources;
  }
  beginFrame() {
    if (this.activeResources === void 0 || this.state === "retired" || this.state === "disposed") {
      return err(
        failure(
          "ssr-history-retired",
          "SSR history resources are active",
          "recreate the renderer-owned SSR history after device recovery"
        )
      );
    }
    if (this.activeCandidate !== void 0) {
      return err(
        failure(
          "ssr-history-active",
          "one SSR history candidate is active",
          "commit or abort the active SSR history candidate before beginning another"
        )
      );
    }
    const writeSlot = this.valid ? this.readIndex === 0 ? 1 : 0 : 0;
    const candidate = Object.freeze({
      readSlot: this.valid ? this.readIndex : null,
      writeSlot,
      historyValid: this.valid && this.resetReason === void 0
    });
    this.activeCandidate = candidate;
    this.state = this.valid ? "stable" : this.state === "aborted" ? "aborted" : "first-frame";
    this.lastFailure = void 0;
    return ok(candidate);
  }
  commitFrame(candidate) {
    if (this.activeCandidate !== candidate) {
      return err(
        failure(
          "ssr-history-not-active",
          "commit the candidate returned by beginFrame",
          "keep one candidate from beginFrame until the shared queue submit succeeds"
        )
      );
    }
    this.readIndex = candidate.writeSlot;
    this.valid = true;
    this.activeCandidate = void 0;
    this.state = "stable";
    this.resetReason = void 0;
    this.lastFailure = void 0;
    return ok(void 0);
  }
  abortFrame(candidate, stage) {
    if (this.activeCandidate !== candidate) return;
    this.activeCandidate = void 0;
    this.state = "aborted";
    this.lastFailure = stage;
  }
  reset(reason) {
    this.activeCandidate = void 0;
    this.valid = false;
    this.readIndex = 0;
    this.resetReason = reason;
    this.lastFailure = void 0;
    this.resetCount += 1;
    if (this.activeResources !== void 0) this.state = "reset";
  }
  resize(width, height) {
    const next = createResources(
      this.device,
      this.scope,
      positiveDimension(width, "width"),
      positiveDimension(height, "height")
    );
    if (!next.ok) return next;
    if (this.activeResources !== void 0) this.retiringResources.add(this.activeResources);
    this.activeResources = next.value;
    this.activeCandidate = void 0;
    this.valid = false;
    this.readIndex = 0;
    this.resetReason = "resize";
    this.lastFailure = void 0;
    this.resetCount += 1;
    this.state = "reset";
    return ok(void 0);
  }
  /** Retire pending allocations after the queue's already-submitted work. */
  retireAfterFence(queue, onFailure) {
    if (this.retirementFencePending) return;
    if (this.retiringResources.size === 0 && this.activeResources !== void 0) {
      this.retiringResources.add(this.activeResources);
      this.activeCandidate = void 0;
      this.valid = false;
      this.state = "retiring";
    }
    const pending = [...this.retiringResources];
    for (const resources of pending) resources.childScope.beginRetire();
    if (pending.length === 0) return;
    this.retirementFencePending = true;
    const finish = () => {
      this.retirementFencePending = false;
      for (const resources of pending) {
        this.retiringResources.delete(resources);
        resources.childScope.retire();
        if (this.activeResources === resources) this.activeResources = void 0;
      }
      if (this.activeResources === void 0 && this.retiringResources.size === 0) {
        this.state = "retired";
      }
      if (this.retiringResources.size > 0) this.retireAfterFence(queue, onFailure);
    };
    void queue.onSubmittedWorkDone().then(finish, (cause) => {
      onFailure(cause);
      finish();
    });
  }
  retire() {
    this.retirementFencePending = false;
    this.activeCandidate = void 0;
    if (this.activeResources !== void 0) {
      this.activeResources.childScope.retire();
      this.activeResources = void 0;
    }
    for (const resources of this.retiringResources) resources.childScope.retire();
    this.retiringResources.clear();
    this.valid = false;
    this.state = "retired";
  }
  dispose() {
    if (this.state === "disposed") return;
    this.retire();
    this.state = "disposed";
  }
  inspect() {
    const active = this.activeResources;
    return Object.freeze({
      state: this.state,
      width: active?.width ?? 0,
      height: active?.height ?? 0,
      halfWidth: active?.halfWidth ?? 0,
      halfHeight: active?.halfHeight ?? 0,
      format: SSR_HISTORY_FORMAT,
      historyCount: active === void 0 ? 0 : 2,
      historyValid: this.valid,
      readSlot: active === void 0 ? null : this.valid ? this.readIndex : null,
      writeSlot: active === void 0 ? 0 : this.valid ? this.readIndex === 0 ? 1 : 0 : 0,
      activeBytes: active?.bytes ?? 0,
      candidateBytes: 0,
      retiringBytes: [...this.retiringResources].filter((entry) => entry !== active).reduce((sum, entry) => sum + entry.bytes, 0),
      resetCount: this.resetCount,
      resetReason: this.resetReason,
      lastFailure: this.lastFailure
    });
  }
};
function createSsrHistoryOwner(input) {
  return SsrHistoryOwner.create(input);
}

// src/scene/visibility/occlusion-query-pool.ts
var OCCLUSION_QUERY_PAGE_COUNT = 3;
var OCCLUSION_QUERY_PAGE_INDEX_LIMIT = 4096;
var OCCLUSION_QUERY_RESULT_BYTES = 8;
var OCCLUSION_QUERY_PAGE_BYTES = OCCLUSION_QUERY_PAGE_INDEX_LIMIT * OCCLUSION_QUERY_RESULT_BYTES;
function identityKey(identity) {
  return [
    identity.viewKey,
    identity.attachmentId,
    identity.deviceGeneration,
    identity.worldGeneration,
    identity.primitiveSlot,
    identity.slotGeneration
  ].join("|");
}
var OcclusionQueryPool = class {
  pages = Array.from(
    { length: OCCLUSION_QUERY_PAGE_COUNT },
    (_, index) => ({ index, nextQueryIndex: 0, pendingCount: 0, inFlightCount: 0 })
  );
  pending = /* @__PURE__ */ new Map();
  tickets = /* @__PURE__ */ new Map();
  nextReservationId = 1;
  disposed = false;
  reserve(identity) {
    if (this.disposed) return void 0;
    const page = this.pages.find(
      (candidate) => candidate.inFlightCount === 0 && candidate.nextQueryIndex < OCCLUSION_QUERY_PAGE_INDEX_LIMIT
    );
    if (page === void 0 || page.nextQueryIndex >= OCCLUSION_QUERY_PAGE_INDEX_LIMIT) {
      return void 0;
    }
    const reservation = Object.freeze({
      ...identity,
      pageIndex: page.index,
      queryIndex: page.nextQueryIndex,
      reservationId: this.nextReservationId++
    });
    page.nextQueryIndex += 1;
    page.pendingCount += 1;
    this.pending.set(reservation.reservationId, reservation);
    return reservation;
  }
  publish(reservation, result) {
    const pending = this.pending.get(reservation.reservationId);
    if (pending === void 0 || this.disposed) {
      return void 0;
    }
    if (!result.submitted) return void 0;
    this.pending.delete(reservation.reservationId);
    const page = this.pages[pending.pageIndex];
    if (page !== void 0) {
      page.pendingCount = Math.max(0, page.pendingCount - 1);
      page.inFlightCount += 1;
    }
    const ticket = Object.freeze({ ...pending, submissionGeneration: result.submissionGeneration });
    this.tickets.set(ticket.reservationId, ticket);
    return ticket;
  }
  /** Return an unsubmitted reservation to its bounded page. */
  cancel(reservation) {
    const pending = this.pending.get(reservation.reservationId);
    if (pending === void 0) return false;
    this.pending.delete(reservation.reservationId);
    const page = this.pages[pending.pageIndex];
    if (page !== void 0) {
      page.pendingCount = Math.max(0, page.pendingCount - 1);
      this.releasePage(pending.pageIndex);
    }
    return true;
  }
  complete(ticket, _samples) {
    const current = this.tickets.get(ticket.reservationId);
    if (current !== void 0) {
      this.tickets.delete(ticket.reservationId);
      const page = this.pages[current.pageIndex];
      if (page !== void 0) page.inFlightCount = Math.max(0, page.inFlightCount - 1);
      this.releasePage(current.pageIndex);
    }
    if (this.disposed || current === void 0 || identityKey(current) !== identityKey(ticket)) {
      return { status: "stale", visible: true };
    }
    return { status: "accepted", visible: true };
  }
  inspect() {
    return {
      pageCount: OCCLUSION_QUERY_PAGE_COUNT,
      pageIndexLimit: OCCLUSION_QUERY_PAGE_INDEX_LIMIT,
      resolveBytes: OCCLUSION_QUERY_PAGE_BYTES,
      stagingBytes: OCCLUSION_QUERY_PAGE_BYTES,
      availablePages: this.disposed ? 0 : this.pages.filter(
        (page) => page.inFlightCount === 0 && page.nextQueryIndex < OCCLUSION_QUERY_PAGE_INDEX_LIMIT
      ).length,
      inFlight: this.tickets.size,
      disposed: this.disposed
    };
  }
  dispose() {
    this.disposed = true;
    this.pending.clear();
    this.tickets.clear();
    for (const page of this.pages) {
      page.pendingCount = 0;
      page.inFlightCount = 0;
    }
  }
  releasePage(pageIndex) {
    const page = this.pages[pageIndex];
    if (page !== void 0 && page.pendingCount === 0 && page.inFlightCount === 0) {
      page.nextQueryIndex = 0;
    }
  }
};

// src/scene/visibility/occlusion-pass.ts
function createOcclusionQueryResources(device, pageIndex) {
  const querySet = device.createQuerySet({
    label: `occlusion-page-${pageIndex}`,
    type: "occlusion",
    count: OCCLUSION_QUERY_PAGE_INDEX_LIMIT
  });
  if (!querySet.ok) return querySet;
  const resolveBuffer = device.createBuffer({
    label: `occlusion-page-${pageIndex}-resolve`,
    size: OCCLUSION_QUERY_PAGE_BYTES,
    usage: GPU_BUFFER_USAGE_QUERY_RESOLVE | GPU_BUFFER_USAGE_COPY_SRC
  });
  if (!resolveBuffer.ok) {
    device.destroyQuerySet(querySet.value);
    return resolveBuffer;
  }
  const stagingBuffer = device.createBuffer({
    label: `occlusion-page-${pageIndex}-staging`,
    size: OCCLUSION_QUERY_PAGE_BYTES,
    usage: GPU_BUFFER_USAGE_MAP_READ | GPU_BUFFER_USAGE_COPY_DST
  });
  if (!stagingBuffer.ok) {
    device.destroyBuffer(resolveBuffer.value);
    device.destroyQuerySet(querySet.value);
    return stagingBuffer;
  }
  return ok$1({
    pageIndex,
    querySet: querySet.value,
    resolveBuffer: resolveBuffer.value,
    stagingBuffer: stagingBuffer.value
  });
}
function recordOcclusionResolve(encoder, resources, firstQuery, queryCount) {
  if (!Number.isSafeInteger(firstQuery) || !Number.isSafeInteger(queryCount) || firstQuery < 0 || queryCount <= 0 || firstQuery + queryCount > OCCLUSION_QUERY_PAGE_INDEX_LIMIT) {
    return err$1(
      new RhiError({
        code: "webgpu-runtime-error",
        expected: "query range stays within one 4096-index page",
        hint: "allocate a bounded page before recording occlusion resolve"
      })
    );
  }
  const resolved = encoder.resolveQuerySet(
    resources.querySet,
    firstQuery,
    queryCount,
    resources.resolveBuffer,
    0
  );
  if (!resolved.ok) return resolved;
  encoder.copyBufferToBuffer(resources.resolveBuffer, resources.stagingBuffer, queryCount * 8);
  return ok$1(void 0);
}

// src/scene/visibility/types.ts
function viewKeyId(key) {
  return `${key.attachmentId}:${key.cameraEntity}:${key.viewRole}:${key.viewGeneration}`;
}
function primitiveKeyId(key) {
  return `${key.attachmentId}:${key.worldGeneration}:${key.primitiveSlot}:${key.slotGeneration}`;
}
function viewKey(input) {
  return Object.freeze({ ...input });
}
function primitiveKey(input) {
  return Object.freeze({ ...input });
}

// src/scene/visibility/occlusion-runtime.ts
var PROXY_VERTEX_FLOATS_PER_CANDIDATE = 36 * 4;
var PROXY_GEOMETRY_BYTES = OCCLUSION_QUERY_PAGE_INDEX_LIMIT * PROXY_VERTEX_FLOATS_PER_CANDIDATE * 4;
var runtimeTestHooks;
function setOcclusionRuntimeTestHooks(hooks) {
  runtimeTestHooks = hooks;
}
var OcclusionRenderRuntime = class {
  constructor(device, facets, shaderModuleFactory, budget = facets.visibilityBudget()) {
    this.device = device;
    this.facets = facets;
    this.shaderModuleFactory = shaderModuleFactory;
    this.budget = budget;
    const runtime = this;
    this.proxyScratch = new Float32Array(
      Math.min(this.budget.effectiveQueryBudget, OCCLUSION_QUERY_PAGE_INDEX_LIMIT) * PROXY_VERTEX_FLOATS_PER_CANDIDATE
    );
    this.projection = {
      get querySet() {
        return runtime.pendingFrame?.resources.querySet;
      },
      get queryIndex() {
        return runtime.pendingFrame?.reservations[0]?.queryIndex ?? 0;
      },
      get queryCount() {
        return runtime.pendingFrame?.reservations.length ?? 0;
      },
      get sampleCount() {
        return runtime.pendingFrame?.sampleCount ?? 1;
      },
      get pageIndex() {
        return runtime.pendingFrame?.reservations[0]?.pageIndex ?? 0;
      },
      get reservationId() {
        return runtime.pendingFrame?.reservations[0]?.reservationId ?? 0;
      },
      encodeProxyBounds: (pass) => {
        const pending = runtime.pendingFrame;
        return pending === void 0 ? err$1(runtimeError("the current RenderSystem frame owns the occlusion candidate")) : runtime.encodeProxyBounds(pass, pending);
      },
      beginCandidate: (pass) => {
        const pending = runtime.pendingFrame;
        if (pending === void 0 || pending.endedCount >= pending.reservations.length) {
          return err$1(runtimeError("the current RenderSystem frame owns the occlusion candidate"));
        }
        return pass.beginOcclusionQuery(pending.reservations[pending.endedCount]?.queryIndex ?? 0);
      },
      endCandidate: (pass) => {
        const pending = runtime.pendingFrame;
        if (pending === void 0 || pending.endedCount >= pending.reservations.length) {
          return err$1(runtimeError("the current RenderSystem frame owns the occlusion candidate"));
        }
        const ended = pass.endOcclusionQuery();
        if (ended.ok) pending.endedCount += 1;
        return ended;
      },
      recordResolve: (encoder) => {
        const pending = runtime.pendingFrame;
        if (pending === void 0 || pending.endedCount !== pending.reservations.length) {
          return err$1(runtimeError("the real geometry pass must end its occlusion query first"));
        }
        return recordOcclusionResolve(
          encoder,
          pending.resources,
          pending.reservations[0]?.queryIndex ?? 0,
          pending.reservations.length
        );
      },
      commit: (submitted, submissionGeneration, profilePhase) => {
        const pending = runtime.pendingFrame;
        if (pending !== void 0)
          runtime.commit(pending, submitted, submissionGeneration, profilePhase);
      }
    };
  }
  device;
  facets;
  shaderModuleFactory;
  budget;
  pool = new OcclusionQueryPool();
  resources = /* @__PURE__ */ new Map();
  activeCompletions = /* @__PURE__ */ new Map();
  retiredResources = /* @__PURE__ */ new Set();
  /** Candidate descriptors are rebuilt only when the extracted frame changes. */
  candidateSource;
  validCandidates = [];
  candidateByKey = /* @__PURE__ */ new Map();
  lastPrepareUnavailable = false;
  pendingFrame;
  disposed = false;
  proxyBuffer;
  proxyScratch;
  proxyPipeline;
  proxyPipelineSampleCount;
  queryLatencySamplesUs = [];
  lastQueryLatencyUs = 0;
  projection;
  prepare(candidate) {
    return this.prepareBatch([candidate], 1, false);
  }
  prepareBatch(candidates, sampleCount = 1, useReadyQueue = true) {
    this.lastPrepareUnavailable = false;
    if (this.disposed || candidates.length === 0) return void 0;
    if (this.pendingFrame !== void 0) {
      this.lastPrepareUnavailable = true;
      return void 0;
    }
    if (this.candidateSource !== candidates) {
      this.candidateSource = candidates;
      this.candidateByKey.clear();
      const valid2 = [];
      for (const candidate of candidates) {
        this.candidateByKey.set(candidateKey(candidate.view, candidate.primitive), candidate);
        if (finiteBounds(candidate.bounds)) valid2.push(candidate);
      }
      this.validCandidates = valid2;
    }
    const valid = this.validCandidates;
    if (valid.length === 0) return void 0;
    let selectedCandidates;
    if (!useReadyQueue) {
      selectedCandidates = valid.slice(0, this.budget.effectiveQueryBudget);
    } else {
      const firstView = valid[0]?.view;
      if (firstView === void 0) return void 0;
      selectedCandidates = [];
      for (const entry of this.facets.dequeueQueryCandidates(
        firstView,
        this.budget.effectiveQueryBudget
      )) {
        const candidate = this.candidateByKey.get(candidateKey(entry.view, entry.primitive));
        if (candidate === void 0 || !finiteBounds(candidate.bounds)) {
          this.facets.requeueQueryCandidate(entry.view, entry.primitive);
          continue;
        }
        selectedCandidates.push(candidate);
      }
      if (selectedCandidates.length === 0) return void 0;
    }
    const reservations = [];
    let selectedCount = 0;
    while (selectedCount < selectedCandidates.length) {
      const candidate = selectedCandidates[selectedCount];
      if (candidate === void 0) break;
      const reservation = this.pool.reserve({
        viewKey: viewKeyId(candidate.view),
        attachmentId: candidate.view.attachmentId,
        deviceGeneration: candidate.deviceGeneration,
        worldGeneration: candidate.primitive.worldGeneration,
        primitiveSlot: candidate.primitive.primitiveSlot,
        slotGeneration: candidate.primitive.slotGeneration
      });
      if (reservation === void 0) {
        this.lastPrepareUnavailable = true;
        break;
      }
      if (reservations.length > 0 && reservation.pageIndex !== reservations[0]?.pageIndex) {
        this.pool.cancel(reservation);
        this.lastPrepareUnavailable = true;
        break;
      }
      reservations.push(reservation);
      selectedCount += 1;
      if (reservations.length >= this.budget.effectiveQueryBudget) break;
    }
    if (reservations.length === 0) {
      for (const candidate of selectedCandidates) {
        if (useReadyQueue) this.facets.requeueQueryCandidate(candidate.view, candidate.primitive);
      }
      return void 0;
    }
    if (reservations.length < selectedCandidates.length) {
      for (const reservation of reservations) this.pool.cancel(reservation);
      for (const candidate of selectedCandidates) {
        if (useReadyQueue) this.facets.requeueQueryCandidate(candidate.view, candidate.primitive);
      }
      return void 0;
    }
    const resources = this.ensureResources(reservations[0]?.pageIndex ?? 0);
    if (resources === void 0) {
      for (const reservation of reservations) this.pool.cancel(reservation);
      this.lastPrepareUnavailable = true;
      for (const candidate of selectedCandidates) {
        if (useReadyQueue) this.facets.requeueQueryCandidate(candidate.view, candidate.primitive);
      }
      return void 0;
    }
    const selected = selectedCandidates;
    let proxyFloatCount = 0;
    for (const candidate of selected) {
      const vertices = candidate.proxyVertices;
      if (vertices === void 0) continue;
      if (proxyFloatCount + vertices.length > this.proxyScratch.length) {
        for (const reservation of reservations) this.pool.cancel(reservation);
        for (const queuedCandidate of selectedCandidates) {
          if (useReadyQueue) {
            this.facets.requeueQueryCandidate(queuedCandidate.view, queuedCandidate.primitive);
          }
        }
        this.lastPrepareUnavailable = true;
        return void 0;
      }
      this.proxyScratch.set(vertices, proxyFloatCount);
      proxyFloatCount += vertices.length;
    }
    const pending = {
      reservations,
      resources,
      candidates: selected,
      sampleCount,
      endedCount: 0,
      proxyFloatCount
    };
    this.pendingFrame = pending;
    return this.projection;
  }
  inspect() {
    return this.pool.inspect();
  }
  get prepareUnavailable() {
    return this.lastPrepareUnavailable;
  }
  /** Map-only latency from the submitted query page; queue wait is excluded. */
  inspectQueryLatency() {
    if (this.queryLatencySamplesUs.length === 0) {
      return { median: 0, p95: 0, last: this.lastQueryLatencyUs };
    }
    const sorted = [...this.queryLatencySamplesUs].sort((left, right) => left - right);
    const rank = (percentile) => sorted[Math.max(0, Math.ceil(sorted.length * percentile) - 1)] ?? 0;
    return {
      median: rank(0.5),
      p95: rank(0.95),
      last: this.lastQueryLatencyUs
    };
  }
  /**
   * Wait until query readbacks submitted before the current observation have
   * settled. The renderer receipt only fences command submission; query
   * completion also includes the asynchronous map/unmap transition. Keeping
   * that fence here makes `renderer.observe()` publish the latest visibility
   * result and measured map latency instead of racing the readback promise.
   */
  async waitForCompletions() {
    for (; ; ) {
      const completions = [...this.activeCompletions.values()];
      if (completions.length === 0) return;
      await Promise.all(completions);
    }
  }
  /** Count a successful frame for hidden rows that were not queried this frame. */
  advanceSuccessfulSubmit(submissionGeneration) {
    this.facets.advanceSuccessfulSubmits(submissionGeneration);
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.pool.dispose();
    for (const resource of this.resources.values()) {
      const completion = this.activeCompletions.get(resource);
      if (completion === void 0) {
        this.destroyResources(resource);
      } else {
        void completion.then(() => this.destroyResources(resource));
      }
    }
    this.resources.clear();
    if (this.proxyBuffer !== void 0) this.device.destroyBuffer(this.proxyBuffer);
    this.proxyBuffer = void 0;
    this.proxyPipeline = void 0;
    this.proxyPipelineSampleCount = void 0;
    this.candidateSource = void 0;
    this.validCandidates = [];
    this.candidateByKey.clear();
    this.lastPrepareUnavailable = false;
    this.pendingFrame = void 0;
  }
  ensureResources(pageIndex) {
    const existing = this.resources.get(pageIndex);
    if (existing !== void 0) return existing;
    const created = createOcclusionQueryResources(this.device, pageIndex);
    if (!created.ok) return void 0;
    this.resources.set(pageIndex, created.value);
    return created.value;
  }
  commit(pending, submitted, submissionGeneration, profilePhase) {
    if (this.pendingFrame !== pending) return;
    this.pendingFrame = void 0;
    const tickets = [];
    const accepted = profilePhase === void 0 ? this.publishAndApplySubmit(pending, submitted, submissionGeneration, tickets) : profilePhase(
      "record/occlusion-query-submit",
      () => this.publishAndApplySubmit(pending, submitted, submissionGeneration, tickets)
    );
    if (!accepted) {
      for (const reservation of pending.reservations) this.pool.cancel(reservation);
      for (const candidate of pending.candidates) {
        this.facets.applyConfidence(candidate.view, candidate.primitive, {
          type: "failure",
          submissionGeneration
        });
      }
      return;
    }
    if (profilePhase === void 0) {
      this.facets.advanceSuccessfulSubmits(submissionGeneration);
    } else {
      profilePhase(
        "record/occlusion-global-advance",
        () => this.facets.advanceSuccessfulSubmits(submissionGeneration)
      );
    }
    const completion = this.completeAfterSubmit(tickets, pending);
    this.activeCompletions.set(pending.resources, completion);
    void completion.then(() => {
      if (this.activeCompletions.get(pending.resources) === completion) {
        this.activeCompletions.delete(pending.resources);
      }
    });
  }
  publishAndApplySubmit(pending, submitted, submissionGeneration, tickets) {
    for (const reservation of pending.reservations) {
      const ticket = this.pool.publish(reservation, { submitted, submissionGeneration });
      if (ticket !== void 0) tickets.push(ticket);
    }
    if (!submitted || tickets.length !== pending.reservations.length) return false;
    const submitEvent = Object.freeze({ type: "submit", submissionGeneration });
    for (const candidate of pending.candidates) {
      this.facets.applyConfidence(candidate.view, candidate.primitive, submitEvent);
    }
    return true;
  }
  destroyResources(resource) {
    if (this.retiredResources.has(resource)) return;
    this.retiredResources.add(resource);
    this.device.destroyBuffer(resource.resolveBuffer);
    this.device.destroyBuffer(resource.stagingBuffer);
    this.device.destroyQuerySet(resource.querySet);
  }
  async completeAfterSubmit(tickets, pending) {
    try {
      await this.device.queue.onSubmittedWorkDone();
      const mapStart = performance.now();
      await runtimeTestHooks?.beforeMap?.();
      const mapped = await pending.resources.stagingBuffer.mapAsync(
        GPU_BUFFER_USAGE_MAP_READ,
        0,
        pending.reservations.length * 8
      );
      if (!mapped.ok) throw mapped.error;
      this.lastQueryLatencyUs = Math.max(0, Math.round((performance.now() - mapStart) * 1e3));
      this.queryLatencySamplesUs.push(this.lastQueryLatencyUs);
      if (this.queryLatencySamplesUs.length > 64) this.queryLatencySamplesUs.shift();
      const bytes = mapped.value.getMappedRange(0, pending.reservations.length * 8);
      if (!bytes.ok) throw bytes.error;
      const data = new Uint8Array(bytes.value.slice(0));
      const dataView = new DataView(data.buffer);
      const firstQuery = pending.reservations[0]?.queryIndex ?? 0;
      mapped.value.unmap();
      for (let ticketIndex = tickets.length - 1; ticketIndex >= 0; ticketIndex -= 1) {
        const ticket = tickets[ticketIndex];
        if (ticket === void 0) continue;
        const candidateIndex = ticket.queryIndex - firstQuery;
        const samples = dataView.getUint32(candidateIndex * 8, true);
        const completion = this.pool.complete(ticket, samples);
        if (completion.status !== "accepted") continue;
        const candidate = pending.candidates[candidateIndex];
        if (candidate === void 0) continue;
        this.facets.applyConfidence(candidate.view, candidate.primitive, {
          type: "result",
          samples,
          submissionGeneration: ticket.submissionGeneration
        });
        this.facets.applyCompletion(
          candidate.view,
          candidate.primitive,
          candidate.epoch,
          candidate.candidate
        );
      }
    } catch {
      for (const ticket of tickets) {
        this.pool.complete(ticket, Number.NaN);
        const candidate = pending.candidates[ticket.queryIndex - (pending.reservations[0]?.queryIndex ?? 0)];
        if (candidate !== void 0) {
          this.facets.applyConfidence(candidate.view, candidate.primitive, {
            type: "failure",
            submissionGeneration: ticket.submissionGeneration
          });
        }
      }
    }
  }
  encodeProxyBounds(pass, pending) {
    if (pending.proxyFloatCount === 0) {
      return err$1(runtimeError("every occlusion candidate needs conservative proxy geometry"));
    }
    const pipeline = this.ensureProxyPipeline(pending.sampleCount);
    if (pipeline === void 0) {
      for (const reservation of pending.reservations) {
        const began = pass.beginOcclusionQuery(reservation.queryIndex);
        if (!began.ok) return began;
        const ended = pass.endOcclusionQuery();
        if (!ended.ok) return ended;
      }
      pending.endedCount = pending.reservations.length;
      return ok$1(void 0);
    }
    const buffer = this.ensureProxyBuffer(pending.proxyFloatCount * Float32Array.BYTES_PER_ELEMENT);
    if (buffer === void 0) {
      return err$1(runtimeError("the backend must allocate the bounded proxy geometry buffer"));
    }
    const uploaded = this.device.queue.writeBuffer(
      buffer,
      0,
      this.proxyScratch.subarray(0, pending.proxyFloatCount)
    );
    if (!uploaded.ok) return uploaded;
    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, buffer);
    let vertexOffset = 0;
    for (let index = 0; index < pending.reservations.length; index += 1) {
      const vertices = pending.candidates[index]?.proxyVertices;
      if (vertices === void 0 || vertices.length === 0) continue;
      const began = pass.beginOcclusionQuery(pending.reservations[index]?.queryIndex ?? 0);
      if (!began.ok) return began;
      pass.draw(vertices.length / 4, 1, vertexOffset / 4, 0);
      const ended = pass.endOcclusionQuery();
      if (!ended.ok) return ended;
      vertexOffset += vertices.length;
    }
    pending.endedCount = pending.reservations.length;
    return ok$1(void 0);
  }
  ensureProxyBuffer(byteLength) {
    if (this.proxyBuffer !== void 0) return this.proxyBuffer;
    const created = this.device.createBuffer({
      label: "occlusion-bounds-proxy-geometry",
      size: Math.max(16, PROXY_GEOMETRY_BYTES, byteLength),
      usage: GPU_BUFFER_USAGE_VERTEX | GPU_BUFFER_USAGE_COPY_DST
    });
    if (!created.ok) return void 0;
    this.proxyBuffer = created.value;
    return created.value;
  }
  ensureProxyPipeline(sampleCount) {
    if (this.proxyPipelineSampleCount === sampleCount && this.proxyPipeline !== void 0) {
      return this.proxyPipeline;
    }
    if (this.shaderModuleFactory === void 0) return void 0;
    const module = this.shaderModuleFactory.createShaderModule({
      label: "occlusion-bounds-proxy",
      code: PROXY_BOUNDS_WGSL
    });
    if (!module.ok) return void 0;
    const created = this.device.createRenderPipeline({
      label: "occlusion-bounds-proxy",
      layout: "auto",
      vertex: {
        module: module.value,
        entryPoint: "vs_main",
        buffers: [
          {
            arrayStride: 16,
            stepMode: "vertex",
            attributes: [{ shaderLocation: 0, offset: 0, format: "float32x4" }]
          }
        ]
      },
      // The proxy is recorded in the typed main pass, whose color attachment
      // remains RGBA16Float. Keep the pass compatible while suppressing all
      // color writes; occlusion only consumes depth samples.
      fragment: {
        module: module.value,
        entryPoint: "fs_main",
        targets: [{ format: "rgba16float", writeMask: 0 }]
      },
      primitive: { topology: "triangle-list" },
      depthStencil: {
        format: "depth24plus-stencil8",
        depthWriteEnabled: false,
        depthCompare: "less-equal"
      },
      multisample: { count: sampleCount }
    });
    if (!created.ok) return void 0;
    this.proxyPipeline = created.value;
    this.proxyPipelineSampleCount = sampleCount;
    return created.value;
  }
};
var PROXY_BOUNDS_WGSL = `
@vertex
fn vs_main(@location(0) position: vec4f) -> @builtin(position) vec4f {
  return position;
}
@fragment
fn fs_main() -> @location(0) vec4f {
  return vec4f(0.0);
}
`;
function candidateKey(view, primitive) {
  return `${viewKeyId(view)}|${primitiveKeyId(primitive)}`;
}
function finiteBounds(bounds) {
  return [...bounds.min, ...bounds.max].every((value) => Number.isFinite(value));
}
function runtimeError(hint) {
  return new RhiError({
    code: "webgpu-runtime-error",
    expected: "RenderSystem owns one active occlusion candidate for the shared frame",
    hint
  });
}
var PROBE_R_MIN = R_MIN;
var PROBE_MAX_CONTRIBUTORS = PROBE_BLEND_RECORD_CAPACITY;
var SH_C0 = 0.28209479177387814;
var SH_C1 = 0.4886025119029199;
var SH_C2 = 1.0925484305920792;
var SH_C20 = 0.31539156525252005;
var SH_C22 = 0.5462742152960396;
function finiteVector(values, length) {
  if (values.length !== length) return false;
  for (let index = 0; index < values.length; index += 1) {
    if (!Number.isFinite(values[index])) return false;
  }
  return true;
}
function contributorIsActive(probe, radiusMinimum) {
  return probe.admitted && Number.isFinite(probe.distance) && probe.distance >= 0 && Number.isFinite(probe.radius) && probe.radius >= radiusMinimum && probe.distance < probe.radius && finiteVector(probe.irradiance, 27);
}
function emptyReceipt(radiusMinimum) {
  return {
    activeIdentities: [],
    admittedIdentities: [],
    rejectedIdentities: [],
    stableOrder: [],
    capacity: PROBE_MAX_CONTRIBUTORS,
    scaleRadius: radiusMinimum,
    finite: true
  };
}
function admitProbeContributors(candidates, radiusMinimum = PROBE_R_MIN) {
  const active = candidates.filter((candidate) => contributorIsActive(candidate, radiusMinimum));
  const overflowed = active.length > PROBE_MAX_CONTRIBUTORS;
  const stableActive = active.slice().sort((left, right) => left.identity.localeCompare(right.identity));
  const admitted = stableActive.slice(0, PROBE_MAX_CONTRIBUTORS);
  const rejected = stableActive.slice(PROBE_MAX_CONTRIBUTORS);
  const scaleRadius = active.reduce(
    (minimum, candidate) => Math.min(minimum, candidate.radius),
    active[0]?.radius ?? radiusMinimum
  );
  const receipt = {
    activeIdentities: stableActive.map((candidate) => candidate.identity),
    admittedIdentities: admitted.map((candidate) => candidate.identity),
    rejectedIdentities: rejected.map((candidate) => candidate.identity),
    stableOrder: admitted.map((candidate) => candidate.identity),
    capacity: PROBE_MAX_CONTRIBUTORS,
    ...overflowed ? { overflowReason: "active-count-exceeds-capacity" } : {},
    scaleRadius,
    finite: stableActive.every((candidate) => Number.isFinite(candidate.radius))
  };
  return {
    active: stableActive,
    admitted,
    rejected,
    receipt,
    ...overflowed ? {
      error: {
        code: "capacity-exceeded",
        activeCount: active.length,
        capacity: PROBE_MAX_CONTRIBUTORS,
        receipt
      }
    } : {}
  };
}
function invalidInputResult(radiusMinimum, code) {
  const receipt = emptyReceipt(radiusMinimum);
  return {
    terms: [],
    rStar: radiusMinimum,
    Q: 0,
    C: 0,
    S: 1,
    SHPreblend: new Array(27).fill(0),
    skyIrradiance: [0, 0, 0],
    diffuse: [0, 0, 0],
    finite: false,
    receipt,
    scaledQLogOffset: 0,
    error: { code, activeCount: 0, capacity: PROBE_MAX_CONTRIBUTORS, receipt }
  };
}
function neumaierSum(values) {
  let sum = 0;
  let correction = 0;
  for (const value of values) {
    const next = sum + value;
    if (Math.abs(sum) >= Math.abs(value)) correction += sum - next + value;
    else correction += value - next + sum;
    sum = next;
  }
  return sum + correction;
}
function roundProbeToF32(value) {
  return Number.isFinite(value) ? new Float32Array([value])[0] : void 0;
}
function scaledProbeWeight(distance, radius, radiusMinimum = PROBE_R_MIN) {
  if (!Number.isFinite(distance) || distance < 0 || !Number.isFinite(radius) || radius < radiusMinimum || distance >= radius) {
    return { coverage: 0, q: 0 };
  }
  const ratio = distance / radius;
  const coverage = 1 - ratio * ratio;
  return { coverage, q: coverage / (radius * radius) };
}
function sh9Irradiance(coefficients, normal) {
  const x = normal[0];
  const y = normal[1];
  const z = normal[2];
  const basis = [
    SH_C0,
    SH_C1 * y,
    SH_C1 * z,
    SH_C1 * x,
    SH_C2 * x * y,
    SH_C2 * y * z,
    SH_C20 * (3 * z * z - 1),
    SH_C2 * x * z,
    SH_C22 * (x * x - y * y)
  ];
  const result = [0, 0, 0];
  for (let band = 0; band < basis.length; band += 1) {
    const factor = basis[band] ?? 0;
    const offset = band * 3;
    result[0] = (result[0] ?? 0) + (coefficients[offset] ?? 0) * factor;
    result[1] = (result[1] ?? 0) + (coefficients[offset + 1] ?? 0) * factor;
    result[2] = (result[2] ?? 0) + (coefficients[offset + 2] ?? 0) * factor;
  }
  return result;
}
function vectorNeumaierSum(values, width) {
  return Array.from(
    { length: width },
    (_, channel) => neumaierSum(values.map((value) => value[channel] ?? 0))
  );
}
function blendProbeCoefficients(contributors, radiusMinimum) {
  if (contributors.length > PROBE_MAX_CONTRIBUTORS || contributors.some((contributor) => !contributorIsActive(contributor, radiusMinimum))) {
    return void 0;
  }
  const rStar = contributors.reduce(
    (minimum, contributor) => Math.min(minimum, contributor.radius),
    contributors[0]?.radius ?? radiusMinimum
  );
  const rawTerms = contributors.map((contributor) => {
    const { coverage } = scaledProbeWeight(contributor.distance, contributor.radius, radiusMinimum);
    const scaledRatio = rStar / contributor.radius;
    return {
      contributor,
      coverage,
      // Diagnostic q is never used for Q, alpha, C, or SH accumulation.
      q: coverage / (contributor.radius * contributor.radius),
      scaledQ: coverage * scaledRatio * scaledRatio
    };
  });
  const scaledQLogOffset = 0;
  const finiteTerms = rawTerms;
  if (finiteTerms.some((term) => !Number.isFinite(term.scaledQ))) return void 0;
  const Q = neumaierSum(finiteTerms.map((term) => term.scaledQ));
  const terms = finiteTerms.map((term) => ({
    identity: term.contributor.identity,
    distance: term.contributor.distance,
    radius: term.contributor.radius,
    coverage: term.coverage,
    q: term.q,
    scaledQ: term.scaledQ,
    qHat: term.scaledQ,
    alpha: Q > 0 ? term.scaledQ / Q : 0
  }));
  let product = 1;
  for (const term of finiteTerms) product *= 1 - term.coverage;
  const C = 1 - product;
  const S = 1 - C;
  const weightedSh = finiteTerms.map(
    (term) => Array.from(term.contributor.irradiance, (value) => value * (Q > 0 ? term.scaledQ / Q : 0))
  );
  const SHPreblend = vectorNeumaierSum(weightedSh, 27).map((value) => value * C);
  const finite = Number.isFinite(Q) && Number.isFinite(C) && Number.isFinite(S) && SHPreblend.every(Number.isFinite) && finiteTerms.every((term) => Number.isFinite(term.scaledQ));
  const receipt = {
    activeIdentities: contributors.map((contributor) => contributor.identity),
    admittedIdentities: contributors.map((contributor) => contributor.identity),
    rejectedIdentities: [],
    stableOrder: contributors.map((contributor) => contributor.identity),
    capacity: PROBE_MAX_CONTRIBUTORS,
    scaleRadius: rStar,
    finite
  };
  return {
    terms,
    rStar,
    Q,
    C,
    S,
    SHPreblend,
    finite,
    receipt,
    scaledQLogOffset
  };
}
function blendLightProbes(input) {
  const radiusMinimum = input.radiusMinimum ?? PROBE_R_MIN;
  const normal = input.normal;
  const sky = input.skyIrradiance;
  if (!finiteVector(normal, 3) || !finiteVector(sky, 3)) {
    return invalidInputResult(radiusMinimum, "invalid-admitted-prefix");
  }
  const coefficients = blendProbeCoefficients(input.contributors, radiusMinimum);
  if (coefficients === void 0)
    return invalidInputResult(radiusMinimum, "invalid-admitted-prefix");
  const shIrradiance = sh9Irradiance(coefficients.SHPreblend, normal);
  const diffuse = [0, 1, 2].map(
    (channel) => Math.max(shIrradiance[channel] ?? 0, 0) + coefficients.S * (sky[channel] ?? 0)
  );
  return {
    ...coefficients,
    skyIrradiance: [sky[0], sky[1], sky[2]],
    diffuse,
    finite: coefficients.finite && diffuse.every(Number.isFinite)
  };
}
function vectorDistance(left, right) {
  const dx = left[0] - right[0];
  const dy = left[1] - right[1];
  const dz = left[2] - right[2];
  return Math.hypot(dx, dy, dz);
}
function encodeProbeRecord(objectKey, generation, localBlendFraction, shPreblend, candidate, accepted, lastKnownGood, sentinel) {
  const values = new Float32Array(PROBE_BLEND_RECORD_BYTE_SIZE / Float32Array.BYTES_PER_ELEMENT);
  values[0] = objectKey;
  values[1] = generation;
  values[2] = roundProbeToF32(localBlendFraction) ?? 0;
  values[3] = (1 ) | (accepted ? 2 : 0) | (lastKnownGood ? 4 : 0);
  for (let band = 0; band < 9; band += 1) {
    const lane = 4 + band * 4;
    values[lane] = roundProbeToF32(shPreblend[band * 3] ?? 0) ?? 0;
    values[lane + 1] = roundProbeToF32(shPreblend[band * 3 + 1] ?? 0) ?? 0;
    values[lane + 2] = roundProbeToF32(shPreblend[band * 3 + 2] ?? 0) ?? 0;
    values[lane + 3] = 0;
  }
  const packedSh = new Array(27);
  for (let band = 0; band < 9; band += 1) {
    packedSh[band * 3] = values[4 + band * 4] ?? 0;
    packedSh[band * 3 + 1] = values[5 + band * 4] ?? 0;
    packedSh[band * 3 + 2] = values[6 + band * 4] ?? 0;
  }
  return {
    objectKey,
    generation,
    localBlendFraction: values[2] ?? 0,
    shPreblend: packedSh,
    bytes: new Uint8Array(values.buffer),
    byteLength: values.byteLength,
    candidate,
    accepted,
    lastKnownGood,
    ...sentinel === void 0 ? {} : { sentinel }
  };
}
function sameList(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
function sameVector3(left, right) {
  return left[0] === right[0] && left[1] === right[1] && left[2] === right[2];
}
function sameProbeFacts(left, right) {
  if (left.length !== right.length) return false;
  return left.every((probe, index) => {
    const other = right[index];
    if (other === void 0 || probe.identity !== other.identity || probe.radius !== other.radius || probe.admitted !== other.admitted || !sameVector3(probe.position, other.position) || probe.irradiance.length !== other.irradiance.length)
      return false;
    for (let value = 0; value < probe.irradiance.length; value += 1) {
      if (probe.irradiance[value] !== other.irradiance[value]) return false;
    }
    return true;
  });
}
function sameSkyFacts(left, right) {
  const leftSky = left.sky;
  const rightSky = right.sky;
  if (leftSky === void 0 !== (rightSky === void 0)) return false;
  if (leftSky !== void 0 && rightSky !== void 0 && (leftSky.available !== rightSky.available || leftSky.identity !== rightSky.identity || leftSky.sourceKey !== rightSky.sourceKey || leftSky.fallbackReason !== rightSky.fallbackReason || !sameVector3(leftSky.irradiance, rightSky.irradiance)))
    return false;
  if (left.skyIrradiance === void 0 !== (right.skyIrradiance === void 0)) return false;
  return left.skyIrradiance === void 0 || right.skyIrradiance !== void 0 && sameVector3(left.skyIrradiance, right.skyIrradiance);
}
var ProbeBlendSceneProjection = class {
  previous;
  records = /* @__PURE__ */ new Map();
  lastError;
  lastReceipt = emptyReceipt(PROBE_R_MIN);
  lastActiveContributorCount = 0;
  lastAdmittedProbeCount = 0;
  lastCoverage = 0;
  lastFinite = true;
  lastSky = {
    available: false,
    irradiance: [0, 0, 0],
    fallbackReason: "no-skylight"
  };
  lastDirtyVisitCount = 0;
  lastDirtyReasons = [];
  bufferProjectionSource = Object.freeze({});
  bufferProjection = Object.freeze({
    sourceIdentity: this.bufferProjectionSource,
    revision: 0,
    baseRevision: 0,
    capacity: 1,
    records: Object.freeze([]),
    dirtyRecords: Object.freeze([]),
    removedCacheKeys: Object.freeze([])
  });
  resultRecords = Object.freeze([]);
  recordFacts = /* @__PURE__ */ new Map();
  getRecord(objectKey) {
    return this.records.get(objectKey);
  }
  hasRecords() {
    return this.records.size > 0;
  }
  /** Stable upload projection; rebuilt only when probe/object facts change. */
  recordBufferProjection() {
    return this.bufferProjection;
  }
  inspect() {
    return {
      activeContributorCount: this.lastActiveContributorCount,
      admittedProbeCount: this.lastAdmittedProbeCount,
      coverage: this.lastCoverage,
      skyResidualFraction: 1 - this.lastCoverage,
      finite: this.lastFinite,
      errorCode: this.lastError?.code,
      records: [...this.records.values()].map((record) => {
        const facts = this.recordFacts.get(record.objectKey);
        return {
          objectKey: record.objectKey,
          generation: record.generation,
          localBlendFraction: record.localBlendFraction,
          shPreblend: [...record.shPreblend],
          byteLength: record.byteLength,
          candidate: record.candidate,
          accepted: record.accepted,
          lastKnownGood: record.lastKnownGood,
          sentinel: record.sentinel,
          probeBlendIndex: record.objectKey,
          contributors: (facts?.contributors ?? []).map((term) => ({
            identity: term.identity,
            distance: term.distance,
            radius: term.radius,
            coverage: term.coverage,
            q: term.q,
            qHat: term.qHat,
            alpha: term.alpha
          })),
          qHatSum: facts?.qHatSum ?? 0,
          rStar: facts?.rStar ?? PROBE_R_MIN,
          fallbackReason: facts?.fallbackReason
        };
      }),
      sky: {
        available: this.lastSky?.available ?? false,
        identity: this.lastSky?.identity,
        sourceKey: this.lastSky?.sourceKey,
        irradiance: [...this.lastSky?.irradiance ?? [0, 0, 0]],
        fallbackReason: this.lastSky?.fallbackReason
      },
      dirtyVisitCount: this.lastDirtyVisitCount,
      dirtyReasons: [...this.lastDirtyReasons],
      receipt: {
        activeIdentities: [...this.lastReceipt.activeIdentities],
        admittedIdentities: [...this.lastReceipt.admittedIdentities],
        rejectedIdentities: [...this.lastReceipt.rejectedIdentities],
        stableOrder: [...this.lastReceipt.stableOrder],
        capacity: this.lastReceipt.capacity,
        scaleRadius: this.lastReceipt.scaleRadius,
        finite: this.lastReceipt.finite,
        overflowReason: this.lastReceipt.overflowReason
      }
    };
  }
  apply(input) {
    const dirtyReasons = [];
    const affectedObjectKeys = /* @__PURE__ */ new Set();
    const previous = this.previous;
    if (previous !== void 0 && previous.objects === input.objects && input.worldRevision === previous.worldRevision && input.retainSkyResidualRecords === previous.retainSkyResidualRecords && sameProbeFacts(input.probes, previous.probes) && sameSkyFacts(input, previous)) {
      return {
        records: this.resultRecords,
        contributors: [],
        activeContributorCount: this.lastActiveContributorCount,
        admittedProbeCount: this.lastAdmittedProbeCount,
        coverage: this.lastCoverage,
        skyResidualFraction: 1 - this.lastCoverage,
        dirtyReasons: [],
        affectedObjectKeys: [],
        visits: 0,
        allocations: 0,
        uploads: 0,
        receipt: this.lastReceipt,
        ...this.lastError === void 0 ? {} : { error: this.lastError }
      };
    }
    const objectKeys = input.objects.map((object) => String(object.objectKey)).sort();
    const previousObjectKeys = previous?.objects.map((object) => String(object.objectKey)).sort() ?? [];
    if (previous === void 0 || !sameList(objectKeys, previousObjectKeys)) {
      dirtyReasons.push("object-boundary");
      for (const object of input.objects) affectedObjectKeys.add(object.objectKey);
    }
    if (previous !== void 0 && input.worldRevision !== previous.worldRevision)
      dirtyReasons.push("world");
    if (previous !== void 0 && (!sameProbeFacts(input.probes, previous.probes) || input.retainSkyResidualRecords !== previous.retainSkyResidualRecords))
      dirtyReasons.push("probe-fact");
    if (previous !== void 0 && !sameSkyFacts(input, previous)) dirtyReasons.push("sky");
    const previousObjects = new Map(previous?.objects.map((object) => [object.objectKey, object]));
    for (const object of input.objects) {
      const oldObject = previousObjects.get(object.objectKey);
      if (oldObject === void 0) {
        affectedObjectKeys.add(object.objectKey);
        continue;
      }
      if (!sameVector3(object.position, oldObject.position)) {
        dirtyReasons.push("object-position");
        affectedObjectKeys.add(object.objectKey);
      }
      if (object.generation !== oldObject.generation) {
        dirtyReasons.push("generation");
        affectedObjectKeys.add(object.objectKey);
      }
    }
    if (dirtyReasons.includes("world") || dirtyReasons.includes("probe-fact") || dirtyReasons.includes("sky"))
      for (const object of input.objects) affectedObjectKeys.add(object.objectKey);
    const uniqueDirtyReasons = [...new Set(dirtyReasons)];
    if (previous !== void 0 && uniqueDirtyReasons.length === 0) {
      return {
        records: [...this.records.values()],
        contributors: [],
        activeContributorCount: this.lastActiveContributorCount,
        admittedProbeCount: this.lastAdmittedProbeCount,
        coverage: this.lastCoverage,
        skyResidualFraction: 1 - this.lastCoverage,
        dirtyReasons: [],
        affectedObjectKeys: [],
        visits: 0,
        allocations: 0,
        uploads: 0,
        receipt: this.lastReceipt,
        ...this.lastError === void 0 ? {} : { error: this.lastError }
      };
    }
    const nextRecords = new Map(this.records);
    const currentObjectKeys = new Set(input.objects.map((object) => object.objectKey));
    for (const objectKey of nextRecords.keys()) {
      if (!currentObjectKeys.has(objectKey)) {
        nextRecords.delete(objectKey);
        this.recordFacts.delete(objectKey);
      }
    }
    let firstTerms = [];
    let firstReceipt = emptyReceipt(PROBE_R_MIN);
    let firstError;
    let firstActiveCount = 0;
    let firstAdmittedCount = 0;
    let firstCoverage = 0;
    let firstObjectSeen = false;
    let visited = 0;
    for (const object of input.objects) {
      if (!affectedObjectKeys.has(object.objectKey)) continue;
      visited += 1;
      const candidates = input.probes.map((probe) => ({
        identity: probe.identity,
        admitted: probe.admitted,
        distance: vectorDistance(object.position, probe.position),
        radius: probe.radius,
        irradiance: probe.irradiance
      }));
      const admission = admitProbeContributors(candidates);
      if (!firstObjectSeen) {
        firstObjectSeen = true;
        firstActiveCount = admission.active.length;
        firstAdmittedCount = admission.admitted.length;
        firstReceipt = admission.receipt;
      }
      const previousRecord = this.records.get(object.objectKey);
      const lastKnownGood = input.lastKnownGood ?? previousRecord?.lastKnownGood ?? false;
      let record;
      if (admission.error !== void 0) firstError ??= admission.error;
      if (admission.admitted.length === 0) {
        if (input.probes.length === 0 && input.retainSkyResidualRecords !== true) {
          nextRecords.delete(object.objectKey);
          this.recordFacts.delete(object.objectKey);
          continue;
        }
        const sentinel = lastKnownGood ? "no-active" : "no-lkg";
        record = encodeProbeRecord(
          object.objectKey,
          object.generation,
          0,
          new Array(27).fill(0),
          true,
          false,
          lastKnownGood,
          sentinel
        );
        this.recordFacts.set(object.objectKey, {
          contributors: [],
          qHatSum: 0,
          rStar: PROBE_R_MIN,
          fallbackReason: admission.error?.code ?? sentinel
        });
      } else {
        const blend = blendProbeCoefficients(admission.admitted, PROBE_R_MIN);
        if (blend === void 0) {
          firstError ??= {
            code: "invalid-admitted-prefix",
            activeCount: admission.active.length,
            capacity: PROBE_MAX_CONTRIBUTORS,
            receipt: admission.receipt
          };
          firstReceipt = admission.receipt;
          continue;
        }
        record = encodeProbeRecord(
          object.objectKey,
          object.generation,
          blend.C,
          blend.SHPreblend,
          true,
          true,
          true,
          void 0
        );
        this.recordFacts.set(object.objectKey, {
          contributors: blend.terms,
          qHatSum: blend.Q,
          rStar: blend.rStar,
          fallbackReason: admission.error === void 0 ? void 0 : "capacity-exceeded-stable-prefix"
        });
        if (firstTerms.length === 0) firstTerms = blend.terms;
        firstCoverage = blend.C;
      }
      nextRecords.set(object.objectKey, record);
      firstError ??= admission.error;
    }
    const allocations = previous === void 0 ? nextRecords.size : 0;
    const resultRecords = Object.freeze([...nextRecords.values()]);
    const result = {
      records: resultRecords,
      contributors: firstTerms,
      activeContributorCount: firstActiveCount,
      admittedProbeCount: firstAdmittedCount,
      coverage: firstCoverage,
      skyResidualFraction: 1 - firstCoverage,
      dirtyReasons: uniqueDirtyReasons,
      affectedObjectKeys: [...affectedObjectKeys].sort((left, right) => left - right),
      visits: visited,
      allocations,
      uploads: nextRecords.size,
      receipt: firstReceipt,
      ...firstError === void 0 ? {} : { error: firstError }
    };
    const projectedRecords = Object.freeze(
      [...nextRecords].map(([objectKey, record]) => Object.freeze({ cacheKey: objectKey, record }))
    );
    const dirtyRecords = Object.freeze(
      projectedRecords.filter(({ record }) => affectedObjectKeys.has(record.objectKey))
    );
    const removedCacheKeys = Object.freeze(
      [...this.records.keys()].filter((objectKey) => !nextRecords.has(objectKey))
    );
    const capacity = projectedRecords.reduce(
      (value, { record }) => Math.max(value, record.objectKey + 2),
      1
    );
    this.previous = input;
    this.records = nextRecords;
    this.resultRecords = resultRecords;
    const baseRevision = this.bufferProjection.revision;
    this.bufferProjection = Object.freeze({
      sourceIdentity: this.bufferProjectionSource,
      revision: baseRevision + 1,
      baseRevision,
      capacity,
      records: projectedRecords,
      dirtyRecords,
      removedCacheKeys
    });
    this.lastError = firstError;
    this.lastReceipt = firstReceipt;
    this.lastActiveContributorCount = firstActiveCount;
    this.lastAdmittedProbeCount = firstAdmittedCount;
    this.lastCoverage = firstCoverage;
    this.lastFinite = this.resultRecords.every(
      (record) => record.bytes.length === PROBE_BLEND_RECORD_BYTE_SIZE
    );
    this.lastSky = input.sky ?? (input.skyIrradiance === void 0 ? { available: false, irradiance: [0, 0, 0], fallbackReason: "no-skylight" } : { available: true, irradiance: input.skyIrradiance });
    this.lastDirtyVisitCount = visited;
    this.lastDirtyReasons = uniqueDirtyReasons;
    return result;
  }
};

export { OcclusionRenderRuntime, PROBE_MAX_CONTRIBUTORS, ProbeBlendSceneProjection, SSR_HISTORY_FORMAT, SsrHistoryOwner, admitProbeContributors, blendLightProbes, createExtendedLightingState, createSsrHistoryOwner, createSsrSpatialResources, emptyBloomInspection, estimateSsrSpatialMemory, primitiveKey, primitiveKeyId, projectBarrelDistortionInspection, projectExtendedLightingInspection, promoteExtendedLightingCandidate, recordExtendedLightingFailure, scaledProbeWeight, setOcclusionRuntimeTestHooks, viewKey, viewKeyId };
