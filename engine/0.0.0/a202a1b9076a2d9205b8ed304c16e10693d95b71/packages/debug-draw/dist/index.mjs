import { ok, err } from '../../types/dist/index.mjs';
import { mat4, vec3, quat } from '../../math/dist/index.mjs';

// src/constants.ts
var INITIAL_VERTEX_CAPACITY = 1024;
var MAX_VERTEX_CAPACITY = 1e6;
var VERTEX_STRIDE_BYTES = 16;
function makeError(code, expected, hint, detail) {
  const error = {
    code,
    expected,
    hint,
    detail,
    get message() {
      return `[${code}] ${hint}`;
    }
  };
  return error;
}
function pipelineCreateFailed(rhiError) {
  return err(
    makeError(
      "pipeline-create-failed",
      "PSO creation should succeed with valid WGSL + layout",
      `Pipeline creation failed: ${rhiError}. Check WGSL syntax, vertex layout, and depth-stencil state.`,
      { code: "pipeline-create-failed", rhiError }
    )
  );
}
function bufferAllocationFailed(rhiError) {
  return err(
    makeError(
      "buffer-allocation-failed",
      "GPU vertex buffer allocation should succeed for the requested byte size",
      `Buffer allocation failed: ${rhiError}. Check available device memory and buffer usage flags.`,
      { code: "buffer-allocation-failed", rhiError }
    )
  );
}
function flushedAfterDestroy() {
  return err(
    makeError(
      "flushed-after-destroy",
      "DebugDraw instance is alive and not yet destroyed",
      "DebugDraw was destroyed; create a new instance via createDebugDraw().",
      { code: "flushed-after-destroy" }
    )
  );
}
function viewProjRequired() {
  return err(
    makeError(
      "viewProj-required",
      "viewProj must be provided as a Mat4 for flush to transform vertices",
      "Pass a viewProj Mat4 to flush(encoder, view, viewProj).",
      { code: "viewProj-required" }
    )
  );
}

// src/shapes/aabb.ts
function a(v, i) {
  return v[i];
}
function aabbVertices(min, max) {
  const mnx = a(min, 0);
  const mny = a(min, 1);
  const mnz = a(min, 2);
  const mxx = a(max, 0);
  const mxy = a(max, 1);
  const mxz = a(max, 2);
  const c = [
    [mnx, mny, mnz],
    // 0
    [mxx, mny, mnz],
    // 1
    [mnx, mxy, mnz],
    // 2
    [mxx, mxy, mnz],
    // 3
    [mnx, mny, mxz],
    // 4
    [mxx, mny, mxz],
    // 5
    [mnx, mxy, mxz],
    // 6
    [mxx, mxy, mxz]
    // 7
  ];
  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [4, 5],
    [4, 6],
    [5, 7],
    [6, 7],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7]
  ];
  const result = [];
  for (const [ai, bi] of edges) {
    const ac = c[ai];
    const bc = c[bi];
    result.push([ac[0], ac[1], ac[2]]);
    result.push([bc[0], bc[1], bc[2]]);
  }
  return result;
}
var TIP_DIRS = [
  [-1, 1, 0],
  [-1, 0, 1],
  [-1, -1, 0],
  [-1, 0, -1]
];
var UNIT_X = [1, 0, 0];
function arrowVertices(start, end, tipLength) {
  const sx = start[0];
  const sy = start[1];
  const sz = start[2];
  const ex = end[0];
  const ey = end[1];
  const ez = end[2];
  const verts = [
    [sx, sy, sz],
    [ex, ey, ez]
  ];
  const dir = vec3.create();
  vec3.set(dir, ex - sx, ey - sy, ez - sz);
  const len = vec3.length(dir);
  if (len < 1e-6) return verts;
  const headLen = tipLength ?? len / 10;
  vec3.normalize(dir, dir);
  const rot = quat.fromUnitVectors(quat.create(), UNIT_X, dir);
  const tipLocal = vec3.create();
  const tipWorld = vec3.create();
  for (const [tx, ty, tz] of TIP_DIRS) {
    vec3.set(tipLocal, tx, ty, tz);
    vec3.normalize(tipLocal, tipLocal);
    vec3.scale(tipLocal, tipLocal, headLen);
    quat.transformVec3(tipWorld, rot, tipLocal);
    verts.push([ex, ey, ez]);
    verts.push([
      ex + tipWorld[0],
      ey + tipWorld[1],
      ez + tipWorld[2]
    ]);
  }
  return verts;
}

// src/shapes/axes.ts
var AXES_COLORS = [
  [1, 0, 0, 1],
  [0, 1, 0, 1],
  [0, 0, 1, 1]
];
function axesArrowSets(worldMat, length) {
  const m = worldMat;
  const ox = m[12];
  const oy = m[13];
  const oz = m[14];
  const origin = [ox, oy, oz];
  const cols = [
    [m[0], m[1], m[2]],
    [m[4], m[5], m[6]],
    [m[8], m[9], m[10]]
  ];
  const sets = [];
  for (let i = 0; i < 3; i++) {
    const c = cols[i];
    const color = AXES_COLORS[i];
    const end = [ox + c[0] * length, oy + c[1] * length, oz + c[2] * length];
    sets.push({ vertices: arrowVertices(origin, end), color });
  }
  return sets;
}
function at(m, i) {
  return m[i];
}
function frustumVertices(viewProj) {
  const m = viewProj;
  const det = at(m, 0) * (at(m, 5) * (at(m, 10) * at(m, 15) - at(m, 14) * at(m, 11)) - at(m, 9) * (at(m, 6) * at(m, 15) - at(m, 14) * at(m, 7)) + at(m, 13) * (at(m, 6) * at(m, 11) - at(m, 10) * at(m, 7))) - at(m, 4) * (at(m, 1) * (at(m, 10) * at(m, 15) - at(m, 14) * at(m, 11)) - at(m, 9) * (at(m, 2) * at(m, 15) - at(m, 14) * at(m, 3)) + at(m, 13) * (at(m, 2) * at(m, 11) - at(m, 10) * at(m, 3))) + at(m, 8) * (at(m, 1) * (at(m, 6) * at(m, 15) - at(m, 14) * at(m, 7)) - at(m, 5) * (at(m, 2) * at(m, 15) - at(m, 14) * at(m, 3)) + at(m, 13) * (at(m, 2) * at(m, 7) - at(m, 6) * at(m, 3))) - at(m, 12) * (at(m, 1) * (at(m, 6) * at(m, 11) - at(m, 10) * at(m, 7)) - at(m, 5) * (at(m, 2) * at(m, 11) - at(m, 10) * at(m, 3)) + at(m, 9) * (at(m, 2) * at(m, 7) - at(m, 6) * at(m, 3)));
  if (Math.abs(det) < 1e-10) {
    return null;
  }
  const invDet = 1 / det;
  const inv = mat4.create();
  inv[0] = (at(m, 5) * (at(m, 10) * at(m, 15) - at(m, 14) * at(m, 11)) - at(m, 9) * (at(m, 6) * at(m, 15) - at(m, 14) * at(m, 7)) + at(m, 13) * (at(m, 6) * at(m, 11) - at(m, 10) * at(m, 7))) * invDet;
  inv[1] = -(at(m, 1) * (at(m, 10) * at(m, 15) - at(m, 14) * at(m, 11)) - at(m, 9) * (at(m, 2) * at(m, 15) - at(m, 14) * at(m, 3)) + at(m, 13) * (at(m, 2) * at(m, 11) - at(m, 10) * at(m, 3))) * invDet;
  inv[2] = (at(m, 1) * (at(m, 6) * at(m, 15) - at(m, 14) * at(m, 7)) - at(m, 5) * (at(m, 2) * at(m, 15) - at(m, 14) * at(m, 3)) + at(m, 13) * (at(m, 2) * at(m, 7) - at(m, 6) * at(m, 3))) * invDet;
  inv[3] = -(at(m, 1) * (at(m, 6) * at(m, 11) - at(m, 10) * at(m, 7)) - at(m, 5) * (at(m, 2) * at(m, 11) - at(m, 10) * at(m, 3)) + at(m, 9) * (at(m, 2) * at(m, 7) - at(m, 6) * at(m, 3))) * invDet;
  inv[4] = -(at(m, 4) * (at(m, 10) * at(m, 15) - at(m, 14) * at(m, 11)) - at(m, 8) * (at(m, 6) * at(m, 15) - at(m, 14) * at(m, 7)) + at(m, 12) * (at(m, 6) * at(m, 11) - at(m, 10) * at(m, 7))) * invDet;
  inv[5] = (at(m, 0) * (at(m, 10) * at(m, 15) - at(m, 14) * at(m, 11)) - at(m, 8) * (at(m, 2) * at(m, 15) - at(m, 14) * at(m, 3)) + at(m, 12) * (at(m, 2) * at(m, 11) - at(m, 10) * at(m, 3))) * invDet;
  inv[6] = -(at(m, 0) * (at(m, 6) * at(m, 15) - at(m, 14) * at(m, 7)) - at(m, 4) * (at(m, 2) * at(m, 15) - at(m, 14) * at(m, 3)) + at(m, 12) * (at(m, 2) * at(m, 7) - at(m, 6) * at(m, 3))) * invDet;
  inv[7] = (at(m, 0) * (at(m, 6) * at(m, 11) - at(m, 10) * at(m, 7)) - at(m, 4) * (at(m, 2) * at(m, 11) - at(m, 10) * at(m, 3)) + at(m, 8) * (at(m, 2) * at(m, 7) - at(m, 6) * at(m, 3))) * invDet;
  inv[8] = (at(m, 4) * (at(m, 9) * at(m, 15) - at(m, 13) * at(m, 11)) - at(m, 8) * (at(m, 5) * at(m, 15) - at(m, 13) * at(m, 7)) + at(m, 12) * (at(m, 5) * at(m, 11) - at(m, 9) * at(m, 7))) * invDet;
  inv[9] = -(at(m, 0) * (at(m, 9) * at(m, 15) - at(m, 13) * at(m, 11)) - at(m, 8) * (at(m, 1) * at(m, 15) - at(m, 13) * at(m, 3)) + at(m, 12) * (at(m, 1) * at(m, 11) - at(m, 9) * at(m, 3))) * invDet;
  inv[10] = (at(m, 0) * (at(m, 5) * at(m, 15) - at(m, 13) * at(m, 7)) - at(m, 4) * (at(m, 1) * at(m, 15) - at(m, 13) * at(m, 3)) + at(m, 12) * (at(m, 1) * at(m, 7) - at(m, 5) * at(m, 3))) * invDet;
  inv[11] = -(at(m, 0) * (at(m, 5) * at(m, 11) - at(m, 9) * at(m, 7)) - at(m, 4) * (at(m, 1) * at(m, 11) - at(m, 9) * at(m, 3)) + at(m, 8) * (at(m, 1) * at(m, 7) - at(m, 5) * at(m, 3))) * invDet;
  inv[12] = -(at(m, 4) * (at(m, 9) * at(m, 14) - at(m, 13) * at(m, 10)) - at(m, 8) * (at(m, 5) * at(m, 14) - at(m, 13) * at(m, 6)) + at(m, 12) * (at(m, 5) * at(m, 10) - at(m, 9) * at(m, 6))) * invDet;
  inv[13] = (at(m, 0) * (at(m, 9) * at(m, 14) - at(m, 13) * at(m, 10)) - at(m, 8) * (at(m, 1) * at(m, 14) - at(m, 13) * at(m, 2)) + at(m, 12) * (at(m, 1) * at(m, 10) - at(m, 9) * at(m, 2))) * invDet;
  inv[14] = -(at(m, 0) * (at(m, 5) * at(m, 14) - at(m, 13) * at(m, 6)) - at(m, 4) * (at(m, 1) * at(m, 14) - at(m, 13) * at(m, 2)) + at(m, 12) * (at(m, 1) * at(m, 6) - at(m, 5) * at(m, 2))) * invDet;
  inv[15] = (at(m, 0) * (at(m, 5) * at(m, 10) - at(m, 9) * at(m, 6)) - at(m, 4) * (at(m, 1) * at(m, 10) - at(m, 9) * at(m, 2)) + at(m, 8) * (at(m, 1) * at(m, 6) - at(m, 5) * at(m, 2))) * invDet;
  const ndc = [
    [-1, -1, 0, 1],
    [1, -1, 0, 1],
    [-1, 1, 0, 1],
    [1, 1, 0, 1],
    [-1, -1, 1, 1],
    [1, -1, 1, 1],
    [-1, 1, 1, 1],
    [1, 1, 1, 1]
  ];
  const corners = ndc.map(([nx, ny, nz, nw]) => {
    const cx = at(inv, 0) * nx + at(inv, 4) * ny + at(inv, 8) * nz + at(inv, 12) * nw;
    const cy = at(inv, 1) * nx + at(inv, 5) * ny + at(inv, 9) * nz + at(inv, 13) * nw;
    const cz = at(inv, 2) * nx + at(inv, 6) * ny + at(inv, 10) * nz + at(inv, 14) * nw;
    const cw = at(inv, 3) * nx + at(inv, 7) * ny + at(inv, 11) * nz + at(inv, 15) * nw;
    const iw = 1 / cw;
    return [cx * iw, cy * iw, cz * iw];
  });
  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [4, 5],
    [4, 6],
    [5, 7],
    [6, 7],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7]
  ];
  const result = [];
  for (const [ai, bi] of edges) {
    const ac = corners[ai];
    const bc = corners[bi];
    result.push([ac[0], ac[1], ac[2]]);
    result.push([bc[0], bc[1], bc[2]]);
  }
  return result;
}

// src/shapes/line.ts
function lineVertices(a3, b) {
  return [
    [a3[0], a3[1], a3[2]],
    [b[0], b[1], b[2]]
  ];
}

// src/shapes/sphere.ts
function a2(v, i) {
  return v[i];
}
function sphereVertices(center, radius, segments) {
  const cx = a2(center, 0);
  const cy = a2(center, 1);
  const cz = a2(center, 2);
  const step = 2 * Math.PI / segments;
  const result = [];
  for (let plane = 0; plane < 3; plane++) {
    for (let i = 0; i < segments; i++) {
      const angle0 = i * step;
      const angle1 = (i + 1) % segments;
      let p0x;
      let p0y;
      let p0z;
      let p1x;
      let p1y;
      let p1z;
      if (plane === 0) {
        p0x = cx + radius * Math.cos(angle0);
        p0y = cy + radius * Math.sin(angle0);
        p0z = cz;
        p1x = cx + radius * Math.cos(angle1);
        p1y = cy + radius * Math.sin(angle1);
        p1z = cz;
      } else if (plane === 1) {
        p0x = cx + radius * Math.cos(angle0);
        p0y = cy;
        p0z = cz + radius * Math.sin(angle0);
        p1x = cx + radius * Math.cos(angle1);
        p1y = cy;
        p1z = cz + radius * Math.sin(angle1);
      } else {
        p0x = cx;
        p0y = cy + radius * Math.cos(angle0);
        p0z = cz + radius * Math.sin(angle0);
        p1x = cx;
        p1y = cy + radius * Math.cos(angle1);
        p1z = cz + radius * Math.sin(angle1);
      }
      result.push([p0x, p0y, p0z]);
      result.push([p1x, p1y, p1z]);
    }
  }
  return result;
}

// src/debug-draw.ts
var VERTEX_SHADER = (
  /* wgsl */
  `
struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) color: vec4<f32>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
}

struct Uniforms {
  viewProj: mat4x4<f32>,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn vs_main(in: VertexInput) -> VertexOutput {
  var out: VertexOutput;
  out.position = uniforms.viewProj * vec4<f32>(in.position, 1.0);
  out.color = in.color;
  return out;
}
`
);
var FRAGMENT_SHADER = (
  /* wgsl */
  `
struct FragmentInput {
  @location(0) color: vec4<f32>,
}

@fragment
fn fs_main(in: FragmentInput) -> @location(0) vec4<f32> {
  return in.color;
}
`
);
function at2(a3, i) {
  return a3[i];
}
function normalizeCapacity(value, fallback) {
  const finiteValue = Number.isFinite(value) ? Math.floor(value) : fallback;
  return Math.max(1, finiteValue);
}
var DebugDraw = class {
  stagingArr;
  stagingLen = 0;
  lastFlushedVertexCount = 0;
  capVal;
  gpuVbo = null;
  gpuPipeline = null;
  gpuUniformBuffer = null;
  gpuBindGroup = null;
  maxCapVal;
  rhiDevice;
  isDestroyed = false;
  // Whether the destroy-after-shape warning has been emitted (plan-strategy D-11).
  // private (no underscore, no @internal) — purely class-internal state, not part of
  // package-internal API surface. Biome R-internal-A forbids `_x` on private fields;
  // lint:internal R-internal-C requires `_x` for `@internal`. Drop both markers since
  // there is no package-internal use for this field — accessing it from outside the
  // class is meaningless.
  destroyedWarnedOnce = false;
  // Hard-cap diagnostics are per frame: flush() clears this flag with staging.
  truncationWarned = false;
  /**
   * Depth texture view for less-equal depth mode.
   * Set via {@link _setDepthView} before flush() when depthMode is 'less-equal'.
   * The runtime auto-attach path receives depth from the render-graph context;
   * low-path callers (test harnesses, smoke runners) set this explicitly.
   */
  depthView = null;
  constructor(device, pipeline, vbo, uniformBuffer, bindGroup, initialCapacity, maxCapacity) {
    const boundedMaxCapacity = normalizeCapacity(maxCapacity, MAX_VERTEX_CAPACITY);
    const boundedInitialCapacity = Math.min(
      normalizeCapacity(initialCapacity, INITIAL_VERTEX_CAPACITY),
      boundedMaxCapacity
    );
    this.rhiDevice = device;
    this.gpuPipeline = pipeline;
    this.gpuVbo = vbo;
    this.gpuUniformBuffer = uniformBuffer;
    this.gpuBindGroup = bindGroup;
    this.capVal = boundedInitialCapacity;
    this.maxCapVal = boundedMaxCapacity;
    this.stagingArr = new Float32Array(boundedInitialCapacity * (VERTEX_STRIDE_BYTES / 4));
  }
  /** @internal CPU staging vertex count (exposed for unit tests). */
  get _stagingVertexCount() {
    return this.stagingLen;
  }
  /** @internal Vertex count passed to the most recent non-empty draw call. */
  get _lastFlushVertexCount() {
    return this.lastFlushedVertexCount;
  }
  /** @internal Current GPU vertex buffer capacity in vertex count. */
  get _capacity() {
    return this.capVal;
  }
  hasWork() {
    return !this.isDestroyed && this.stagingLen > 0;
  }
  /** @internal Whether destroy() has been called. */
  get _destroyed() {
    return this.isDestroyed;
  }
  /**
   * @internal Set the depth texture view for less-equal depth mode.
   * Required before flush() when depthMode is 'less-equal'.
   * Used by test harnesses and smoke runners that don't have a scene
   * depth buffer; the runtime auto-attach path receives depth from
   * the render-graph context.
   */
  _setDepthView(view) {
    this.depthView = view;
  }
  /** @internal Read position of vertex at `index` in CPU staging (for unit tests). */
  _getVertexPosition(index) {
    const idx = index * 4;
    return [
      this.stagingArr[idx + 0],
      this.stagingArr[idx + 1],
      this.stagingArr[idx + 2]
    ];
  }
  /** @internal Read color of vertex at `index` as packed u32 (for unit tests). */
  _getVertexPackedColor(index) {
    const byteOff = index * VERTEX_STRIDE_BYTES + 12;
    const bytes = new Uint8Array(this.stagingArr.buffer, byteOff, 4);
    return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
  }
  postDestroyWarnOnce() {
    if (!this.destroyedWarnedOnce) {
      this.destroyedWarnedOnce = true;
      console.warn(
        "[DebugDraw] Shape call after destroy() is a no-op. Create a new instance via createDebugDraw()."
      );
    }
  }
  pushVertex(px, py, pz, rc, gc, bc, ac) {
    if (this.isDestroyed) {
      this.postDestroyWarnOnce();
      return;
    }
    if (this.stagingLen >= this.maxCapVal) return;
    const idx = this.stagingLen * 4;
    this.stagingArr[idx + 0] = px;
    this.stagingArr[idx + 1] = py;
    this.stagingArr[idx + 2] = pz;
    const u8r = Math.round(Math.max(0, Math.min(1, rc)) * 255);
    const u8g = Math.round(Math.max(0, Math.min(1, gc)) * 255);
    const u8bc = Math.round(Math.max(0, Math.min(1, bc)) * 255);
    const u8a = Math.round(Math.max(0, Math.min(1, ac)) * 255);
    const byteOff = this.stagingLen * VERTEX_STRIDE_BYTES + 12;
    const colorView = new Uint8Array(this.stagingArr.buffer, byteOff, 4);
    colorView[0] = u8r;
    colorView[1] = u8g;
    colorView[2] = u8bc;
    colorView[3] = u8a;
    this.stagingLen++;
  }
  warnTruncationOnce() {
    if (this.truncationWarned) return;
    this.truncationWarned = true;
    console.warn(
      `[DebugDraw] Vertex count would exceed MAX_VERTEX_CAPACITY=${this.maxCapVal}; vertices beyond the limit are discarded.`
    );
  }
  ensureCapacity(needed) {
    if (this.isDestroyed) return;
    if (needed <= this.capVal) return;
    if (needed > this.maxCapVal) {
      this.warnTruncationOnce();
    }
    let newCap = this.capVal;
    while (newCap < needed && newCap < this.maxCapVal) {
      newCap = Math.min(newCap * 2, this.maxCapVal);
    }
    if (newCap > this.capVal) {
      const newVbo = this.rhiDevice.createBuffer({
        size: newCap * VERTEX_STRIDE_BYTES,
        usage: 8 | 32,
        // COPY_DST | VERTEX (mirrors createDebugDraw factory)
        label: "debug-draw-vbo"
      });
      if (!newVbo.ok) {
        console.warn(
          `[DebugDraw] GPU vertex buffer grow to ${newCap} failed (${newVbo.error.code}); keeping ${this.capVal} -- excess vertices are truncated this frame.`
        );
        return;
      }
      console.warn(`[DebugDraw] Resizing vertex buffer from ${this.capVal} to ${newCap} vertices.`);
      if (this.gpuVbo !== null) this.rhiDevice.destroyBuffer(this.gpuVbo);
      this.gpuVbo = newVbo.value;
      this.capVal = newCap;
      const newStaging = new Float32Array(newCap * (VERTEX_STRIDE_BYTES / 4));
      newStaging.set(this.stagingArr.subarray(0, this.stagingLen * 4));
      this.stagingArr = newStaging;
    }
  }
  colorToRGBA(color) {
    if (Array.isArray(color)) {
      return [at2(color, 0), at2(color, 1), at2(color, 2), color[3] ?? 1];
    }
    return [at2(color, 0), at2(color, 1), at2(color, 2), color[3] ?? 1];
  }
  // -- Public shape API --
  line(a3, b, color) {
    if (this.isDestroyed) {
      this.postDestroyWarnOnce();
      return;
    }
    const [r, g, bc, alpha] = this.colorToRGBA(color);
    this.ensureCapacity(this.stagingLen + 2);
    for (const [x, y, z] of lineVertices(a3, b)) {
      this.pushVertex(x, y, z, r, g, bc, alpha);
    }
  }
  aabb(min, max, color) {
    if (this.isDestroyed) {
      this.postDestroyWarnOnce();
      return;
    }
    const [r, g, bc, alpha] = this.colorToRGBA(color);
    const verts = aabbVertices(min, max);
    this.ensureCapacity(this.stagingLen + verts.length);
    for (const [x, y, z] of verts) {
      this.pushVertex(x, y, z, r, g, bc, alpha);
    }
  }
  sphere(center, radius, color, segments = 16) {
    if (this.isDestroyed) {
      this.postDestroyWarnOnce();
      return;
    }
    const [r, g, bc, alpha] = this.colorToRGBA(color);
    const verts = sphereVertices(center, radius, segments);
    this.ensureCapacity(this.stagingLen + verts.length);
    for (const [x, y, z] of verts) {
      this.pushVertex(x, y, z, r, g, bc, alpha);
    }
  }
  frustum(viewProj, color) {
    if (this.isDestroyed) {
      this.postDestroyWarnOnce();
      return;
    }
    const verts = frustumVertices(viewProj);
    if (verts === null) {
      console.warn(
        "[DebugDraw] frustum() received a near-singular viewProj matrix; skipping this frame."
      );
      return;
    }
    const [r, g, bc, alpha] = this.colorToRGBA(color);
    this.ensureCapacity(this.stagingLen + verts.length);
    for (const [x, y, z] of verts) {
      this.pushVertex(x, y, z, r, g, bc, alpha);
    }
  }
  arrow(start, end, color, tipLength) {
    if (this.isDestroyed) {
      this.postDestroyWarnOnce();
      return;
    }
    const [r, g, bc, alpha] = this.colorToRGBA(color);
    const verts = arrowVertices(start, end, tipLength);
    this.ensureCapacity(this.stagingLen + verts.length);
    for (const [x, y, z] of verts) {
      this.pushVertex(x, y, z, r, g, bc, alpha);
    }
  }
  axes(worldMat, length) {
    if (this.isDestroyed) {
      this.postDestroyWarnOnce();
      return;
    }
    for (const { vertices, color } of axesArrowSets(worldMat, length)) {
      const [r, g, bc, alpha] = this.colorToRGBA(color);
      this.ensureCapacity(this.stagingLen + vertices.length);
      for (const [x, y, z] of vertices) {
        this.pushVertex(x, y, z, r, g, bc, alpha);
      }
    }
  }
  // -- flush (w13) --
  flush(encoder, view, viewProj) {
    if (this.isDestroyed) return flushedAfterDestroy();
    if (viewProj === void 0 || viewProj === null) return viewProjRequired();
    if (this.stagingLen === 0) {
      this.lastFlushedVertexCount = 0;
      return ok(void 0);
    }
    const passDesc = {
      colorAttachments: [
        {
          // biome-ignore lint/suspicious/noExplicitAny: opaque RHI handle
          view,
          loadOp: "load",
          storeOp: "store"
        }
      ]
    };
    if (this.depthView !== null) {
      passDesc.depthStencilAttachment = {
        // biome-ignore lint/suspicious/noExplicitAny: opaque depth view
        view: this.depthView,
        depthLoadOp: "load",
        depthStoreOp: "store"
      };
    }
    const pass = encoder.beginRenderPass(passDesc);
    const encoded = this.encode(pass, viewProj);
    pass.end();
    return encoded;
  }
  encode(pass, viewProj) {
    if (this.isDestroyed) return flushedAfterDestroy();
    if (viewProj === void 0 || viewProj === null) return viewProjRequired();
    if (this.stagingLen === 0) {
      this.lastFlushedVertexCount = 0;
      return ok(void 0);
    }
    const vertexCount = Math.min(this.stagingLen, this.maxCapVal);
    const vbo = this.gpuVbo;
    const pipeline = this.gpuPipeline;
    const uniformBuf = this.gpuUniformBuffer;
    const bindGroup = this.gpuBindGroup;
    const byteCount = vertexCount * VERTEX_STRIDE_BYTES;
    this.rhiDevice.queue.writeBuffer(
      vbo,
      0,
      new Uint8Array(this.stagingArr.buffer, 0, byteCount),
      0,
      byteCount
    );
    const uniformData = new Float32Array(16);
    for (let i = 0; i < 16; i++) uniformData[i] = viewProj[i];
    this.rhiDevice.queue.writeBuffer(uniformBuf, 0, new Uint8Array(uniformData.buffer), 0, 64);
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.setVertexBuffer(0, vbo);
    pass.draw(vertexCount);
    this.lastFlushedVertexCount = vertexCount;
    this.stagingLen = 0;
    this.truncationWarned = false;
    return ok(void 0);
  }
  // -- destroy (w14) --
  destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    if (this.gpuVbo) {
      this.rhiDevice.destroyBuffer(this.gpuVbo);
      this.gpuVbo = null;
    }
    if (this.gpuUniformBuffer) {
      this.rhiDevice.destroyBuffer(this.gpuUniformBuffer);
      this.gpuUniformBuffer = null;
    }
    this.gpuBindGroup = null;
    this.gpuPipeline = null;
    this.stagingArr = new Float32Array(0);
    this.stagingLen = 0;
    this.lastFlushedVertexCount = 0;
  }
};
async function createDebugDraw(opts) {
  const device = opts.device;
  const fmt = opts.format ?? "bgra8unorm";
  const depthFormat = opts.depthFormat;
  const depthMode = opts.depthMode ?? "always";
  const maxCap = normalizeCapacity(
    opts.maxVertexCapacity ?? MAX_VERTEX_CAPACITY,
    MAX_VERTEX_CAPACITY
  );
  const initialCap = Math.min(
    normalizeCapacity(
      opts.initialVertexCapacity ?? INITIAL_VERTEX_CAPACITY,
      INITIAL_VERTEX_CAPACITY
    ),
    maxCap
  );
  const vboByteSize = initialCap * VERTEX_STRIDE_BYTES;
  const vboResult = device.createBuffer({
    size: vboByteSize,
    usage: 8 | 32,
    // COPY_DST | VERTEX
    label: "debug-draw-vbo"
  });
  if (!vboResult.ok) {
    return bufferAllocationFailed(
      `createBuffer(COPY_DST|VERTEX, ${vboByteSize}B): ${vboResult.error.code}`
    );
  }
  const vbo = vboResult.value;
  const uniformBufResult = device.createBuffer({
    size: 64,
    usage: 64 | 8,
    // UNIFORM | COPY_DST
    label: "debug-draw-uniform"
  });
  if (!uniformBufResult.ok) {
    device.destroyBuffer(vbo);
    return bufferAllocationFailed(
      `createBuffer(UNIFORM|COPY_DST, 64B): ${uniformBufResult.error.code}`
    );
  }
  const uniformBuf = uniformBufResult.value;
  const vsResult = await opts.createShaderModule(device, {
    label: "debug-draw-vs",
    code: VERTEX_SHADER
  });
  if (!vsResult.ok) {
    device.destroyBuffer(vbo);
    return pipelineCreateFailed(`createShaderModule(vertex): ${vsResult.error.code}`);
  }
  const vsModule = vsResult.value;
  const fsResult = await opts.createShaderModule(device, {
    label: "debug-draw-fs",
    code: FRAGMENT_SHADER
  });
  if (!fsResult.ok) {
    device.destroyBuffer(vbo);
    return pipelineCreateFailed(`createShaderModule(fragment): ${fsResult.error.code}`);
  }
  const fsModule = fsResult.value;
  const bglResult = device.createBindGroupLayout({
    label: "debug-draw-bind-group-layout",
    entries: [
      {
        binding: 0,
        visibility: 1,
        buffer: { type: "uniform", minBindingSize: 64 }
      }
    ]
  });
  if (!bglResult.ok) {
    device.destroyBuffer(vbo);
    device.destroyBuffer(uniformBuf);
    return pipelineCreateFailed(`createBindGroupLayout: ${bglResult.error.code}`);
  }
  const pipelineLayoutResult = device.createPipelineLayout({
    label: "debug-draw-pipeline-layout",
    bindGroupLayouts: [bglResult.value]
  });
  if (!pipelineLayoutResult.ok) {
    device.destroyBuffer(vbo);
    device.destroyBuffer(uniformBuf);
    return pipelineCreateFailed(`createPipelineLayout: ${pipelineLayoutResult.error.code}`);
  }
  const depthStencil = depthMode === "less-equal" ? {
    format: depthFormat ?? "depth24plus",
    depthWriteEnabled: false,
    depthCompare: "less-equal"
  } : void 0;
  const vertexBuffers = [
    {
      arrayStride: VERTEX_STRIDE_BYTES,
      stepMode: "vertex",
      attributes: [
        {
          format: "float32x3",
          offset: 0,
          shaderLocation: 0
        },
        {
          format: "unorm8x4",
          offset: 12,
          shaderLocation: 1
        }
      ]
    }
  ];
  const pipelineDesc = {
    label: "debug-draw-pso",
    layout: pipelineLayoutResult.value,
    vertex: {
      module: vsModule,
      entryPoint: "vs_main",
      buffers: [...vertexBuffers]
    },
    primitive: {
      topology: "line-list"
    },
    depthStencil,
    fragment: {
      module: fsModule,
      entryPoint: "fs_main",
      targets: [{ format: fmt }]
    }
  };
  const psoResult = device.createRenderPipeline(pipelineDesc);
  if (!psoResult.ok) {
    device.destroyBuffer(vbo);
    device.destroyBuffer(uniformBuf);
    return pipelineCreateFailed(`createRenderPipeline: ${psoResult.error.code}`);
  }
  const pipeline = psoResult.value;
  const bgResult = device.createBindGroup({
    layout: bglResult.value,
    entries: [
      {
        binding: 0,
        resource: {
          kind: "buffer",
          value: { buffer: uniformBuf, offset: 0, size: 64 }
        }
      }
    ],
    label: "debug-draw-bindgroup"
    // biome-ignore lint/suspicious/noExplicitAny: forgeax opaque BGL -> createBindGroup descriptor
  });
  if (!bgResult.ok) {
    device.destroyBuffer(vbo);
    device.destroyBuffer(uniformBuf);
    return pipelineCreateFailed(`createBindGroup: ${bgResult.error.code}`);
  }
  return ok(new DebugDraw(device, pipeline, vbo, uniformBuf, bgResult.value, initialCap, maxCap));
}

// src/render-feature.ts
function createDebugDrawRenderFeaturePlan(input) {
  const program = "debug-draw.program";
  const bindings = "debug-draw.bindings";
  const vertices = "debug-draw.vertices";
  const vertexData = "debug-draw.vertex-data";
  return {
    resources: [
      {
        kind: "graphics-program",
        name: program,
        program: {
          shader: "forgeax::debug-draw.line",
          vertexLayout: "debug-draw-line",
          colorFormats: [input.colorFormat ?? "bgra8unorm"],
          topology: "line-list"
        }
      },
      {
        kind: "graphics-bindings",
        name: bindings,
        program,
        values: {
          viewProjection: input.viewProjection ?? "debug-draw.view-projection"
        }
      },
      {
        kind: "buffer",
        name: vertices,
        size: Math.max(1, input.vertexCapacity) * 16,
        usage: ["vertex"]
      },
      {
        kind: "vertex-data",
        name: vertexData,
        layout: "debug-draw-line",
        buffer: vertices
      }
    ],
    passes: [
      {
        kind: "raster",
        name: "debug-draw.raster",
        colorAttachments: [{ target: input.target, loadOp: "load", storeOp: "store" }],
        draws: [
          {
            program,
            bindings: [bindings],
            vertexData: [{ slot: 0, resource: vertexData }],
            draw: {
              kind: "draw",
              vertexCount: Math.max(0, input.vertexCount ?? input.vertexCapacity),
              instanceCount: 1
            }
          }
        ]
      }
    ]
  };
}

export { DebugDraw, INITIAL_VERTEX_CAPACITY, MAX_VERTEX_CAPACITY, VERTEX_STRIDE_BYTES, createDebugDraw, createDebugDrawRenderFeaturePlan };
