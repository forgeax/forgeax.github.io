import { frustum } from '../../math/dist/index.mjs';
import { GlobalTransform } from '../../scene/dist/index.mjs';
import { err, ok } from '../../types/dist/index.mjs';
import { vfxGpuEffectContribution, vfxGpuEffectPackLoader, vfxGpuRuntimePlugin, VFX_GPU_RUNTIME_RESOURCE_KEY, resolveVfxDataInterfaces, buildVfxRecoveryIntents, VFX_PARTICLE_CORE_STRIDE, ParticleEffectPlayer } from '../../vfx/dist/index.mjs';
import { getAssetRegistryResolver, selectMaterialPassProgram } from '../../assets-runtime/dist/index.mjs';
import { createWorldContext } from '../../ecs/dist/index.mjs';

// src/feature/event-resources.ts
var VFX_EVENT_INPUT_BYTES = 32;
var VFX_EVENT_BYTES = 32;
var VFX_EVENT_COUNTER_BYTES = 16;
function channelFanOut(emitter, channel) {
  return Math.max(
    1,
    ...(emitter.events ?? []).filter((event) => event.channel === channel).map((event) => event.fanOut)
  );
}
function eventInputCapacity(emitter) {
  return Math.max(
    1,
    (emitter.channels ?? []).reduce((total, channel) => total + channel.capacity, 0)
  );
}
function eventCapacity(emitter) {
  const capacity = (emitter.channels ?? []).reduce(
    (total, channel) => total + channel.capacity * channelFanOut(emitter, channel.id),
    0
  );
  return Math.max(1, Math.min(emitter.capacity, capacity));
}
function channelKey(channel) {
  let hash = 2166136261;
  for (const code of channel) {
    hash ^= code.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function encodeEventInputs(intent) {
  const capacity = eventInputCapacity(intent.emitter);
  const data = new ArrayBuffer(capacity * VFX_EVENT_INPUT_BYTES);
  const bytes = new Uint8Array(data);
  bytes.fill(255);
  const view = new DataView(data);
  for (const [index, input] of intent.channelInputs.entries()) {
    if (index >= capacity) break;
    const offset = index * VFX_EVENT_INPUT_BYTES;
    view.setFloat32(offset, input.payload.position[0], true);
    view.setFloat32(offset + 4, input.payload.position[1], true);
    view.setFloat32(offset + 8, input.payload.position[2], true);
    view.setFloat32(offset + 16, input.payload.strength, true);
    view.setUint32(offset + 20, input.sequence, true);
    view.setUint32(offset + 24, channelKey(input.channel), true);
    view.setUint32(offset + 28, channelFanOut(intent.emitter, input.channel), true);
  }
  return bytes;
}
function encodeEventBuffer(intent) {
  const inputBytes = encodeEventInputs(intent);
  const outputBytes = eventCapacity(intent.emitter) * VFX_EVENT_BYTES;
  const data = new Uint8Array(inputBytes.byteLength + outputBytes);
  data.set(inputBytes);
  return data;
}
function eventCounterData() {
  return new Uint8Array(VFX_EVENT_COUNTER_BYTES);
}

// ../render/src/errors/render.ts
var renderFeatureRecoveryHintByRecovery = {
  "next-frame": (featureIdentity, stage) => `correct '${featureIdentity}' ${stage} data and retry on the next frame`,
  "renderer-recover": (featureIdentity, _stage) => `wait for renderer recovery before retrying '${featureIdentity}'`,
  registration: (featureIdentity, _stage) => `correct '${featureIdentity}' registration before retrying`
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
var RENDER_FEATURE_VERTEX_LAYOUTS = Object.freeze({
  positionSizeColorInstance: "position-size-color-instance",
  billboardMaterialInstance: "billboard-material-instance",
  billboardMaterialInputInstance: "billboard-material-input-instance",
  topologySegmentInstance: "topology-segment-instance",
  topologySegmentMaterialInputInstance: "topology-segment-material-input-instance",
  meshGeometryMaterialInstance: "mesh-geometry-material-instance",
  meshGeometryMaterialInputInstance: "mesh-geometry-material-input-instance"
});
var ATTRIBUTE_FORMAT_MAP = {
  position: "float32x3",
  normal: "float32x3",
  uv: "float32x2",
  tangent: "float32x4",
  skinIndex: "uint16x4",
  skinWeight: "float32x4",
  uv1: "float32x2",
  uv2: "float32x2",
  uv3: "float32x2",
  uv4: "float32x2",
  uv5: "float32x2",
  uv6: "float32x2",
  uv7: "float32x2",
  color: "float32x4"
};
var isAttributeKey = (key) => key in ATTRIBUTE_FORMAT_MAP;
var CANONICAL_KEYS = Object.keys(ATTRIBUTE_FORMAT_MAP).filter(isAttributeKey);
CANONICAL_KEYS.filter(
  (key) => key === "uv" || key.startsWith("uv")
);
var EMPTY_FLOAT32 = new Float32Array(0);
var EMPTY_UINT16 = new Uint16Array(0);
var DEFAULT_VERTEX_ATTRIBUTE_MAP = Object.freeze({
  position: EMPTY_FLOAT32,
  normal: EMPTY_FLOAT32,
  uv: EMPTY_FLOAT32,
  tangent: EMPTY_FLOAT32
});
Object.freeze({
  ...DEFAULT_VERTEX_ATTRIBUTE_MAP,
  skinIndex: EMPTY_UINT16,
  skinWeight: EMPTY_FLOAT32
});
function bytesForFormat(format) {
  if (format === "uint16x4" || format === "float32x2") return 8;
  if (format === "float32x3") return 12;
  return 16;
}
function fnv1a(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `vlp-v1-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
var layoutsByMask = /* @__PURE__ */ new Map();
function deriveVertexLayoutProjection(map) {
  let mask = 0;
  for (let index = 0; index < CANONICAL_KEYS.length; index += 1) {
    const key = CANONICAL_KEYS[index];
    if (key !== void 0 && map[key] !== void 0) mask |= 1 << index;
  }
  return layoutFromMask(mask);
}
function layoutFromMask(mask) {
  const cached = layoutsByMask.get(mask);
  if (cached !== void 0) return cached;
  const attributes = [];
  let offset = 0;
  for (let index = 0; index < CANONICAL_KEYS.length; index += 1) {
    const key = CANONICAL_KEYS[index];
    if (key === void 0 || (mask & 1 << index) === 0) continue;
    const format = ATTRIBUTE_FORMAT_MAP[key];
    const byteLength = bytesForFormat(format);
    attributes.push(Object.freeze({ key, shaderLocation: index, offset, format, byteLength }));
    offset += byteLength;
  }
  const digestInput = [
    "1",
    String(mask),
    String(offset),
    ...attributes.map(
      (entry) => `${entry.key},${entry.shaderLocation},${entry.offset},${entry.format}`
    )
  ].join("|");
  const projection = Object.freeze({
    schemaVersion: 1,
    attributes: Object.freeze(attributes),
    mask,
    arrayStride: offset,
    digest: fnv1a(digestInput)
  });
  layoutsByMask.set(mask, projection);
  return projection;
}

// ../render/src/features/particle-mesh-layout.ts
var PARTICLE_MESH_DEFAULTS = {
  position: [0, 0, 0],
  normal: [0, 0, 1],
  uv: [0, 0],
  tangent: [1, 0, 0, 1],
  uv1: [0, 0],
  color: [1, 1, 1, 1]
};
var PARTICLE_MESH_GEOMETRY = deriveVertexLayoutProjection(
  Object.fromEntries(Object.keys(PARTICLE_MESH_DEFAULTS).map((key) => [key, new Float32Array()]))
);
({
  arrayStride: PARTICLE_MESH_GEOMETRY.arrayStride,
  attributes: PARTICLE_MESH_GEOMETRY.attributes.map(({ key, shaderLocation, offset, format }) => ({
    shaderLocation: key === "color" ? 14 : key === "uv1" ? 15 : shaderLocation,
    offset,
    format
  }))
});

// src/feature/particle-resources.ts
var PARTICLE_SHADER_IDENTIFIERS = Object.freeze({
  billboard: "forgeax::vfx-render.particles.billboard",
  mesh: "forgeax::vfx-render.particles.mesh",
  ribbon: "forgeax::vfx-render.particles.ribbon",
  trail: "forgeax::vfx-render.particles.trail",
  beam: "forgeax::vfx-render.particles.beam"
});
var PARTICLE_INPUT_SHADER_IDENTIFIERS = Object.freeze({
  billboard: "forgeax::vfx-render.particles.billboard-inputs",
  mesh: "forgeax::vfx-render.particles.mesh-inputs",
  ribbon: "forgeax::vfx-render.particles.ribbon-inputs",
  trail: "forgeax::vfx-render.particles.trail-inputs",
  beam: "forgeax::vfx-render.particles.beam-inputs"
});
function createTopologyResourcePlan(renderer) {
  if (renderer === null || typeof renderer !== "object" || Array.isArray(renderer))
    return err({
      code: "vfx-topology-resource-invalid",
      expected: "a topology renderer object",
      hint: "declare a ribbon, trail, or beam renderer",
      detail: { path: "renderer" }
    });
  const value = renderer;
  if (value.kind !== "ribbon" && value.kind !== "trail" && value.kind !== "beam")
    return err({
      code: "vfx-topology-resource-invalid",
      expected: "ribbon, trail, or beam",
      hint: "do not alias topology output to billboard or mesh",
      detail: { path: "renderer.kind" }
    });
  if (typeof value.capacity !== "number" || !Number.isInteger(value.capacity) || value.capacity <= 0 || value.capacity > 65536)
    return err({
      code: "vfx-topology-resource-invalid",
      expected: "capacity in the range 1..65536",
      hint: "bound topology resources before allocating them",
      detail: { path: "renderer.capacity" }
    });
  const capacity = value.capacity;
  if (value.kind === "ribbon" && value.stripKey !== "alive-index")
    return err({
      code: "vfx-topology-resource-invalid",
      expected: "stripKey 'alive-index'",
      hint: "use the managed alive-list order until a custom WGSL topology stage owns grouping",
      detail: { path: "renderer.stripKey" }
    });
  if (value.kind === "trail" && (typeof value.historyLength !== "number" || !Number.isInteger(value.historyLength) || value.historyLength <= 0 || value.historyLength > 256))
    return err({
      code: "vfx-topology-resource-invalid",
      expected: "historyLength in the range 1..256",
      hint: "bound trail history storage",
      detail: { path: "renderer.historyLength" }
    });
  if (value.kind === "beam" && value.endpointField !== "velocity")
    return err({
      code: "vfx-topology-resource-invalid",
      expected: "endpointField 'velocity'",
      hint: "use the managed velocity endpoint until a custom WGSL topology stage owns endpoints",
      detail: { path: "renderer.endpointField" }
    });
  const vertexStride = 12 * 4;
  const segments = value.kind === "trail" ? capacity * Math.max(1, value.historyLength - 1) : capacity;
  return ok({
    topology: value.kind,
    capacity,
    vertexBytes: Math.max(vertexStride, segments * vertexStride),
    indexBytes: 0,
    indirectBytes: 20,
    resourceKey: `vfx-topology-${value.kind}`,
    ...value.kind === "ribbon" ? { stripKey: "alive-index" } : {},
    ...value.kind === "trail" ? { historyLength: value.historyLength } : {},
    ...value.kind === "beam" ? { endpointField: "velocity" } : {}
  });
}
function topologyCapacitySnapshot(plan, input) {
  const produced = Math.max(0, Math.min(plan.capacity, input.produced));
  const requested = Math.max(0, input.requested);
  return {
    topology: plan.topology,
    capacity: plan.capacity,
    produced,
    dropped: Math.max(0, requested - produced),
    overflow: Math.max(0, requested - plan.capacity),
    degenerate: Math.max(0, input.degenerate ?? 0)
  };
}
var PARTICLE_PREMULTIPLIED_ALPHA_BLEND = {
  color: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" },
  alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" }
};
var PARTICLE_ADDITIVE_BLEND = {
  color: { srcFactor: "one", dstFactor: "one", operation: "add" },
  alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" }
};
function particleMaterialPass(kind, material, hasParticleInputs = false, publication) {
  const passName = `particle-${kind}`;
  const cookedPass = publication?.projection.passes.find(
    (candidate) => candidate.name === passName
  );
  if (cookedPass !== void 0 && publication !== void 0) {
    if (publication.context === void 0)
      throw new Error(
        "Published particle material selection requires renderer-owned compiler context"
      );
    const selected = selectMaterialPassProgram(
      publication.projection,
      passName,
      publication.context
    );
    return {
      shader: selected.specializationKey,
      ...cookedPass.renderState === void 0 ? {} : { renderState: cookedPass.renderState }
    };
  }
  const pass = material?.passes?.find((candidate) => candidate.name === passName);
  const renderState = pass?.renderState ?? (kind === "mesh" ? material?.passes?.find((candidate) => {
    const tags = candidate.renderState?.tags;
    return candidate.name === "forward" || typeof tags === "object" && tags !== null && "LightMode" in tags && tags.LightMode === "Forward";
  })?.renderState : void 0);
  return {
    shader: pass?.program.module ?? (hasParticleInputs ? PARTICLE_INPUT_SHADER_IDENTIFIERS[kind] : PARTICLE_SHADER_IDENTIFIERS[kind]),
    ...renderState === void 0 ? {} : { renderState }
  };
}
var EMPTY_PARTICLE_MATERIAL_INPUTS = Object.freeze({
  definitions: Object.freeze([]),
  lanes: 0,
  stride: 0
});
function particleInputFailure(code, expected, hint, detail) {
  return err({ code, expected, hint, detail });
}
function isParticleInputType(value) {
  return value === "f32" || value === "vec2<f32>" || value === "vec3<f32>" || value === "vec4<f32>";
}
function isParticleInputVisibility(value) {
  return value === "vertex" || value === "fragment" || value === "vertex-fragment";
}
function validParticleInput(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const input = value;
  return typeof input.name === "string" && /^[A-Za-z_][A-Za-z0-9_]*$/.test(input.name) && isParticleInputType(input.type) && isParticleInputVisibility(input.visibility) && typeof input.lane === "number" && Number.isInteger(input.lane) && input.lane >= 0 && input.lane < 4;
}
function sameParticleInput(left, right) {
  return left.name === right.name && left.type === right.type && left.visibility === right.visibility && left.lane === right.lane;
}
function prepareParticleMaterialInputs(renderer, material, reflected) {
  const requested = renderer.materialInputs ?? [];
  if (requested.length === 0) return ok(EMPTY_PARTICLE_MATERIAL_INPUTS);
  if (new Set(requested).size !== requested.length) {
    return particleInputFailure(
      "vfx-material-input-duplicate",
      "unique particle input names per renderer",
      "remove the duplicate renderer material input and recook the effect",
      { material: renderer.material, path: "renderer.materialInputs" }
    );
  }
  const definitions = material?.particleInputs;
  if (definitions === void 0) {
    return particleInputFailure(
      "vfx-material-input-missing",
      `material ${renderer.material} to declare particleInputs`,
      "add the requested typed input to MaterialAsset and recook the material before the VFX effect",
      { material: renderer.material, path: "material.particleInputs" }
    );
  }
  const names = /* @__PURE__ */ new Set();
  const lanes = /* @__PURE__ */ new Set();
  for (const [index, candidate] of definitions.entries()) {
    if (!validParticleInput(candidate)) {
      return particleInputFailure(
        "vfx-material-input-wrong-type",
        "particleInputs entries with a supported type, visibility, and lane",
        "repair the material particleInputs declaration and recook it",
        { material: renderer.material, path: `material.particleInputs[${index}]` }
      );
    }
    if (names.has(candidate.name) || lanes.has(candidate.lane)) {
      return particleInputFailure(
        "vfx-material-input-duplicate",
        "unique particle input names and lanes",
        "assign one lane to one input name and recook the material",
        { material: renderer.material, name: candidate.name, lane: candidate.lane }
      );
    }
    names.add(candidate.name);
    lanes.add(candidate.lane);
  }
  const selectedDefinitions = [];
  for (const name of requested) {
    const input = definitions.find((candidate) => candidate.name === name);
    if (input === void 0) {
      return particleInputFailure(
        "vfx-material-input-missing",
        `material ${renderer.material} to declare particle input ${name}`,
        "add the requested input to MaterialAsset.particleInputs and recook both assets",
        { material: renderer.material, name, path: "renderer.materialInputs" }
      );
    }
    selectedDefinitions.push(input);
  }
  if (reflected === void 0) {
    return particleInputFailure(
      "vfx-material-input-stale",
      "cooked renderer reflection to carry the material input declarations",
      "recook the VFX effect with the current material artifact catalog",
      { material: renderer.material, path: "effect.reflection.renderers.materialInputDefinitions" }
    );
  }
  for (const input of selectedDefinitions) {
    const cooked = reflected.find((candidate) => candidate.name === input.name);
    if (cooked === void 0 || !sameParticleInput(input, cooked)) {
      return particleInputFailure(
        "vfx-material-input-stale",
        `the cooked declaration for material input ${input.name} to match MaterialAsset`,
        "recook the VFX effect and material together so names, types, visibility, and lanes agree",
        { material: renderer.material, name: input.name, lane: input.lane }
      );
    }
  }
  const lanesUsed = selectedDefinitions.map((input) => input.lane);
  const lanesCount = Math.max(...lanesUsed, -1) + 1;
  return ok({
    definitions: Object.freeze([...selectedDefinitions]),
    lanes: lanesCount,
    stride: lanesCount * 16
  });
}
function particleRendererRenderState(kind, blend, authored) {
  if (authored !== void 0) return authored;
  const isTopology = kind === "ribbon" || kind === "trail" || kind === "beam";
  if (kind !== "billboard" && !isTopology) return void 0;
  const mode = kind === "billboard" ? blend ?? "alpha" : "alpha";
  if (mode === "opaque-cutout") {
    return {
      cullMode: "none",
      depthCompare: "less-equal",
      depthWriteEnabled: true
    };
  }
  return {
    cullMode: "none",
    depthCompare: "less-equal",
    depthWriteEnabled: false,
    blend: mode === "additive" ? PARTICLE_ADDITIVE_BLEND : PARTICLE_PREMULTIPLIED_ALPHA_BLEND
  };
}
function particleMaterialUsesBindings(material) {
  return (material?.parameters?.length ?? 0) > 0;
}
function particleMaterialSceneDepthBinding(contract) {
  if (contract === "group-0-resource" || contract === "render-material-with-scene-depth") return 0;
  if (contract === "view-and-scene-depth" || contract === "render-material-and-scene-depth")
    return 1;
  return void 0;
}
function floatAttribute(value) {
  if (value instanceof Float32Array) return value;
  if (value instanceof Uint16Array) return Float32Array.from(value);
  return value === void 0 ? new Float32Array() : new Float32Array(value);
}
function particleMeshVertices(mesh) {
  const positions = floatAttribute(mesh.attributes.position);
  if (positions.length % 3 !== 0) return new Float32Array();
  const vertexCount = positions.length / 3;
  const stride = PARTICLE_MESH_GEOMETRY.arrayStride / Float32Array.BYTES_PER_ELEMENT;
  const result = new Float32Array(vertexCount * stride);
  for (const attribute of PARTICLE_MESH_GEOMETRY.attributes) {
    const key = attribute.key;
    const source = floatAttribute(mesh.attributes[key]);
    const width = attribute.byteLength / Float32Array.BYTES_PER_ELEMENT;
    if (source.length !== 0 && source.length !== vertexCount * width) return new Float32Array();
    for (let vertex = 0; vertex < vertexCount; vertex += 1) {
      result.set(
        source.length >= (vertex + 1) * width ? source.subarray(vertex * width, (vertex + 1) * width) : PARTICLE_MESH_DEFAULTS[key],
        vertex * stride + attribute.offset / Float32Array.BYTES_PER_ELEMENT
      );
    }
  }
  return result;
}
function particleMeshIndices(mesh) {
  const indices = mesh.indices;
  if (indices === void 0 || indices.byteLength % 4 === 0) return indices;
  const aligned = new Uint16Array(indices.length + 1);
  aligned.set(indices);
  return aligned;
}
var particleMeshVertexCache = /* @__PURE__ */ new WeakMap();
function particleMeshVerticesCached(mesh) {
  if (!Object.isFrozen(mesh)) return particleMeshVertices(mesh);
  const cached = particleMeshVertexCache.get(mesh);
  if (cached !== void 0) return cached;
  const derived = particleMeshVertices(mesh);
  particleMeshVertexCache.set(mesh, derived);
  return derived;
}

// src/feature/stage-plan.ts
var MANAGED_STAGES = /* @__PURE__ */ new Set(["spawn", "update", "scan", "compact"]);
var RESOURCE_NAMES = /* @__PURE__ */ new Set([
  "particles",
  "runtime",
  "aliveIndices",
  "counters",
  "indirect",
  "scratch",
  "billboardInstances",
  "channelInputs",
  "events",
  "eventCounters"
]);
var STAGE_ID = /^[a-z][a-z0-9-]{0,31}$/;
var ENTRY_POINT = /^forgeax_vfx_stage_[a-z][a-z0-9-]{0,31}_main$/;
var MAX_ITERATIONS = 64;
function failure(code, stageId, hint) {
  return { ok: false, error: { code, stageId, hint } };
}
function stableStage(stage) {
  return {
    id: stage.id,
    entry: stage.entry,
    entryPoint: stage.entryPoint,
    domain: stage.domain,
    resources: Object.freeze(
      stage.resources.map((resource) => ({ name: resource.name, access: resource.access }))
    ),
    dependsOn: Object.freeze([...stage.dependsOn]),
    iterationBudget: stage.iterationBudget
  };
}
function validatedStagePlan(reflection, generation) {
  const source = reflection ?? [];
  const ids = /* @__PURE__ */ new Set();
  const stages = [];
  for (const stage of source) {
    if (!STAGE_ID.test(stage.id) || ids.has(stage.id)) {
      return failure(
        "stage-id-invalid",
        stage.id,
        "recook the effect with unique bounded stage ids"
      );
    }
    ids.add(stage.id);
    if (stage.domain !== "particle" || MANAGED_STAGES.has(stage.domain)) {
      return failure("stage-domain-invalid", stage.id, "use the managed particle dispatch domain");
    }
    if (!ENTRY_POINT.test(stage.entryPoint)) {
      return failure(
        "stage-entry-point-invalid",
        stage.id,
        "use the compiler-generated stage entry point"
      );
    }
    if (!Number.isInteger(stage.iterationBudget) || stage.iterationBudget < 1 || stage.iterationBudget > MAX_ITERATIONS) {
      return failure(
        "stage-budget-invalid",
        stage.id,
        "use an integer iteration budget from 1 through 64"
      );
    }
    const resources = /* @__PURE__ */ new Set();
    for (const resource of stage.resources) {
      if (!RESOURCE_NAMES.has(resource.name) || !["read", "write", "read-write"].includes(resource.access)) {
        return failure(
          "stage-resource-invalid",
          stage.id,
          "declare only managed VFX resources with a supported access mode"
        );
      }
      if (resources.has(resource.name)) {
        return failure(
          "stage-resource-invalid",
          stage.id,
          "declare each managed VFX resource once"
        );
      }
      resources.add(resource.name);
    }
    stages.push(stableStage(stage));
  }
  const byId = new Map(stages.map((stage) => [stage.id, stage]));
  const visiting = /* @__PURE__ */ new Set();
  const visited = /* @__PURE__ */ new Set();
  const ordered = [];
  const visit = (stage) => {
    if (visited.has(stage.id)) return void 0;
    if (visiting.has(stage.id))
      return {
        code: "stage-cycle",
        stageId: stage.id,
        hint: "remove the stage dependency cycle and recook the effect"
      };
    visiting.add(stage.id);
    for (const dependency of stage.dependsOn) {
      if (MANAGED_STAGES.has(dependency)) continue;
      const dependencyStage = byId.get(dependency);
      if (dependencyStage === void 0) {
        return {
          code: "stage-dependency-invalid",
          stageId: stage.id,
          hint: "declare every stage dependency or use a managed stage"
        };
      }
      const error = visit(dependencyStage);
      if (error !== void 0) return error;
    }
    visiting.delete(stage.id);
    visited.add(stage.id);
    ordered.push(stage);
    return void 0;
  };
  for (const stage of stages) {
    const error = visit(stage);
    if (error !== void 0) return { ok: false, error };
  }
  const normalized = Object.freeze(ordered);
  return {
    ok: true,
    value: Object.freeze({
      stages: normalized,
      fingerprint: JSON.stringify(normalized),
      generation
    })
  };
}
function stageDispatches(plan, workgroups, bindings) {
  return plan.stages.map((stage) => ({
    entryPoint: stage.entryPoint,
    workgroups: [workgroups],
    bindings
  }));
}
function observeStagePlan(candidate, generation, lastKnownGoodStage) {
  if (candidate.ok) {
    return {
      validatedStagePlan: candidate.value,
      stageReadiness: candidate.value.stages.map((stage) => ({
        id: stage.id,
        state: "ready",
        generation,
        lastKnownGoodGeneration: generation,
        retryable: false
      })),
      stageOutput: candidate.value.stages.length === 0 ? "empty" : "active",
      lastKnownGoodStage: candidate.value.stages.length === 0 ? lastKnownGoodStage === void 0 ? void 0 : {
        fingerprint: lastKnownGoodStage.fingerprint,
        generation: lastKnownGoodStage.generation
      } : { fingerprint: candidate.value.fingerprint, generation }
    };
  }
  const retained = lastKnownGoodStage ?? { stages: [], fingerprint: "", generation };
  return {
    validatedStagePlan: retained,
    stageReadiness: [
      {
        id: candidate.error.stageId,
        state: "candidate-rejected",
        generation,
        ...lastKnownGoodStage === void 0 ? {} : { lastKnownGoodGeneration: lastKnownGoodStage.generation },
        retryable: true,
        error: candidate.error.code
      }
    ],
    stageOutput: lastKnownGoodStage === void 0 ? "empty" : "last-known-good",
    lastKnownGoodStage: lastKnownGoodStage === void 0 ? void 0 : {
      fingerprint: lastKnownGoodStage.fingerprint,
      generation: lastKnownGoodStage.generation
    }
  };
}
function stageRecoveryReadiness(plan, generation, recovery) {
  return plan.stages.map((stage) => ({
    id: stage.id,
    state: recovery === "stale" ? "stale" : "rebuilding",
    generation,
    lastKnownGoodGeneration: plan.generation,
    retryable: true,
    error: recovery
  }));
}

// src/feature/gpu-particle-feature.ts
var IDENTITY = "forgeax.vfx-render.gpu-particles";
var WORKGROUP_SIZE = 256;
var BILLBOARD_INSTANCE_BYTES = 31 * 4;
var MESH_INSTANCE_BYTES = 18 * 4;
var COUNTERS_BYTES = 24;
var RUNTIME_BYTES = 76 * 4;
var IDENTITY_MATRIX = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
var rendererOnlyEntryPoints = /* @__PURE__ */ new Map([
  ["forgeax_vfx_billboard_main", "billboard"],
  ["forgeax_vfx_mesh_main", "mesh"],
  ["forgeax_vfx_ribbon_main", "ribbon"],
  ["forgeax_vfx_trail_main", "trail"],
  ["forgeax_vfx_beam_main", "beam"],
  ["forgeax_vfx_trail_history_main", "trail"],
  ["forgeax_vfx_trail_offsets_main", "trail"]
]);
function createVfxRenderInspectSnapshot(input) {
  return {
    topology: input.topology,
    counters: { capacity: input.capacity, produced: input.produced, dropped: input.dropped },
    stageReadiness: input.stageReadiness,
    stageOutput: input.stageOutput ?? "empty",
    providerReadiness: input.providerReadiness,
    gpuTiming: input.gpuTiming
  };
}
function resolveBillboardAdvancedState(renderer, sample) {
  if (renderer.softParticle !== void 0 && !sample.depthAvailable) {
    return err({
      code: "vfx-renderer-depth-missing",
      expected: "a scene-depth provider for soft particles",
      hint: "attach the scene-depth data interface or disable soft particles",
      detail: { path: "renderer.softParticle" }
    });
  }
  const sheet = renderer.textureSheet;
  const frameCount = sheet?.frameCount ?? (sheet === void 0 ? 1 : sheet.columns * sheet.rows);
  const frameIndex = sheet === void 0 || sheet.frameRate === 0 ? 0 : Math.min(
    frameCount - 1,
    Math.max(0, Math.floor(Math.max(0, sample.age) * sheet.frameRate))
  );
  const softParticleFade = renderer.softParticle === void 0 ? 1 : Math.max(
    0,
    Math.min(
      1,
      (sample.sceneDepth - sample.particleDepth) / renderer.softParticle.fadeDistance
    )
  );
  return ok({
    frameIndex,
    pivot: renderer.pivot ?? [0, 0],
    softParticleFade,
    sortingKey: renderer.sorting === "view-depth" || renderer.sorting === "view-distance" ? sample.particleDepth : 0
  });
}
function topologyRecoveryHint(topology, reason) {
  if (reason === "capacity")
    return `${topology} capacity overflow was bounded; increase its explicit capacity`;
  if (reason === "broken")
    return `${topology} continuity broke; inspect its explicit source key and keep the last valid segment`;
  if (reason === "degenerate")
    return `${topology} produced no drawable segment; preserve zero output and inspect source endpoints`;
  return `${topology} device resources recovered from the last known good generation`;
}
function finite(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function rendererSortingMode(renderer) {
  if (renderer?.kind !== "billboard" && renderer?.kind !== "mesh") return 0;
  switch (renderer.sorting) {
    case "view-depth":
      return 2;
    case "view-distance":
      return 5;
    case "custom-ascending":
      return 3;
    case "custom-descending":
      return 4;
    default:
      return 0;
  }
}
function vector(value, fallback, size) {
  return Array.isArray(value) ? Array.from({ length: size }, (_, index) => finite(value[index], fallback[index] ?? 0)) : fallback;
}
function runtimeData(intent, camera, material, localToWorld, renderer, rendererIndex = 0, particleInputLanes = renderer?.materialInputs?.length ?? 0, meshDraw) {
  const storage = new ArrayBuffer(RUNTIME_BYTES);
  const floats = new Float32Array(storage);
  const words = new Uint32Array(storage);
  floats[0] = intent.fixedDelta;
  words[1] = intent.phaseTick;
  words[2] = intent.seed;
  words[3] = intent.playCycle;
  words[4] = intent.emitter.capacity;
  words[5] = intent.spawnCount;
  words[6] = intent.firstParticleId;
  words[7] = intent.emitter.renderers.length;
  floats.set(camera.viewProjection, 8);
  floats.set(camera.right, 24);
  floats.set(camera.up, 28);
  floats.set(camera.position, 72);
  const values = material?.values ?? {};
  floats.set(vector(values.baseColor, [1, 1, 1, 1], 4), 32);
  const emissive = vector(values.emissive, [0, 0, 0], 3);
  floats.set(emissive, 36);
  floats[39] = finite(values.emissiveIntensity, 0);
  floats[40] = finite(values.metallic, 0);
  floats[41] = finite(values.roughness, 0.5);
  floats[42] = finite(values.clearcoat, 0);
  floats[43] = finite(values.clearcoatRoughness, 0.5);
  floats.set(localToWorld, 44);
  words[60] = rendererIndex;
  words[61] = renderer === void 0 && ((intent.emitter.reflection.resources ?? []).includes("eventBuffer") || (intent.emitter.reflection.entryPoints ?? []).includes("forgeax_vfx_event_main")) ? eventInputCapacity(intent.emitter) : renderer?.kind === "trail" ? renderer.historyLength : meshDraw?.count ?? 0;
  words[62] = renderer?.kind === "ribbon" || renderer?.kind === "trail" || renderer?.kind === "beam" ? renderer.capacity : intent.emitter.capacity;
  words[63] = meshDraw?.firstIndex ?? 0;
  words[75] = rendererSortingMode(renderer);
  floats[64] = renderer?.kind === "billboard" ? renderer.pivot?.[0] ?? 0 : renderer?.kind === "ribbon" || renderer?.kind === "trail" || renderer?.kind === "beam" ? renderer.width ?? 0.1 : 0.1;
  floats[65] = renderer?.kind === "billboard" ? renderer.pivot?.[1] ?? 0 : 0;
  floats[66] = renderer?.kind === "billboard" ? renderer.softParticle?.fadeDistance ?? 0 : 0;
  floats[67] = particleInputLanes;
  const sheet = renderer?.kind === "billboard" ? renderer.textureSheet : void 0;
  floats[68] = sheet?.columns ?? 1;
  floats[69] = sheet?.rows ?? 1;
  floats[70] = sheet?.frameRate ?? 0;
  floats[71] = sheet?.frameCount ?? (sheet === void 0 ? 1 : sheet.columns * sheet.rows);
  return new Uint8Array(storage);
}
function emitterTransform(world, intent) {
  if (intent.emitter.space === "world") return IDENTITY_MATRIX;
  const transform = world.get(intent.player, GlobalTransform);
  return transform.ok ? transform.value.world : IDENTITY_MATRIX;
}
function emitterVisible(emitter, camera, localToWorld) {
  const bounds = emitter.bounds;
  const center = bounds.kind === "sphere" ? bounds.center : [
    (bounds.min[0] + bounds.max[0]) * 0.5,
    (bounds.min[1] + bounds.max[1]) * 0.5,
    (bounds.min[2] + bounds.max[2]) * 0.5
  ];
  const radius = bounds.kind === "sphere" ? bounds.radius : Math.hypot(
    (bounds.max[0] - bounds.min[0]) * 0.5,
    (bounds.max[1] - bounds.min[1]) * 0.5,
    (bounds.max[2] - bounds.min[2]) * 0.5
  );
  const matrix = (index) => localToWorld[index] ?? 0;
  const worldCenter = new Float32Array([
    matrix(0) * center[0] + matrix(4) * center[1] + matrix(8) * center[2] + matrix(12),
    matrix(1) * center[0] + matrix(5) * center[1] + matrix(9) * center[2] + matrix(13),
    matrix(2) * center[0] + matrix(6) * center[1] + matrix(10) * center[2] + matrix(14)
  ]);
  const scale = Math.max(
    Math.hypot(matrix(0), matrix(1), matrix(2)),
    Math.hypot(matrix(4), matrix(5), matrix(6)),
    Math.hypot(matrix(8), matrix(9), matrix(10))
  );
  const planes = frustum.fromViewProjection(frustum.create(), camera.viewProjection);
  return frustum.intersectsSphere(planes, worldCenter, radius * scale);
}
function resetData(size) {
  return new Uint8Array(size);
}
function requiresSceneDepth(intent) {
  return (intent.emitter.reflection.dataInterfaces ?? []).some(
    (requirement) => requirement.kind === "scene-depth"
  );
}
function dataInterfacesExecutable(intent, registry) {
  const requirements = intent.emitter.reflection.dataInterfaces ?? [];
  if (requirements.length === 0) return true;
  const resolved = registry?.resolve(requirements, intent.instanceGeneration);
  if (resolved === void 0) return true;
  if (!resolved.ok) {
    const error = resolved.error;
    if (error === void 0) return false;
    return error.code === "vfx-data-interface-missing" && (error.detail.providerId === void 0 || error.expected.includes("resident"));
  }
  if (resolved.value === void 0) return true;
  return resolved.value.resources.every((resource) => resource.resource !== void 0);
}
function preparedDataInterfaceResources(requirements, generation, prepared) {
  if (prepared === void 0) return void 0;
  const resources = [];
  for (const requirement of requirements) {
    const value = prepared[requirement.kind];
    if (value === void 0) return void 0;
    resources.push({
      token: requirement.token,
      kind: requirement.kind,
      bindingType: requirement.bindingType,
      generation,
      ...requirement.sampleCount === void 0 ? {} : { sampleCount: requirement.sampleCount },
      resource: value
    });
  }
  return resources;
}
function planFailure() {
  return new RenderFeatureStageFailedError(IDENTITY, -1, "plan", "next-frame");
}
function planName(value, maxLength = 24) {
  const normalized = value.toLowerCase().replaceAll(/[^a-z0-9.-]/g, "-");
  return (normalized.length === 0 ? "unnamed" : normalized).slice(0, maxLength);
}
function computeBindingEntries(intent, resources) {
  const declared = new Set(
    (intent.emitter.reflection.bindings[0]?.entries ?? []).filter(
      (entry) => entry.buffer !== void 0 || entry.texture !== void 0 || entry.sampler !== void 0 || entry.storageTexture !== void 0
    ).map((entry) => entry.binding)
  );
  return Object.entries(resources).flatMap(
    ([binding, resource]) => declared.has(Number(binding)) ? [{ binding: Number(binding), resource }] : []
  );
}
function simulationDispatches(intent, stages) {
  const groups = Math.max(1, Math.ceil(intent.emitter.capacity / WORKGROUP_SIZE));
  const compact = [
    { kind: "direct", entryPoint: "forgeax_vfx_scan_blocks_main", workgroups: [groups] },
    { kind: "direct", entryPoint: "forgeax_vfx_scan_block_offsets_main", workgroups: [1] },
    { kind: "direct", entryPoint: "forgeax_vfx_add_offsets_main", workgroups: [groups] },
    { kind: "direct", entryPoint: "forgeax_vfx_compact_main", workgroups: [groups] }
  ];
  return [
    { kind: "direct", entryPoint: "forgeax_vfx_spawn_main", workgroups: [groups] },
    { kind: "direct", entryPoint: "forgeax_vfx_update_main", workgroups: [groups] },
    ...stages.stages.map((stage) => ({
      kind: "direct",
      entryPoint: stage.entryPoint,
      workgroups: [groups]
    })),
    ...compact,
    ...intent.emitter.reflection.entryPoints.includes("forgeax_vfx_event_main") ? [
      {
        kind: "direct",
        entryPoint: "forgeax_vfx_event_main",
        workgroups: [1]
      },
      ...compact
    ] : []
  ];
}
function gpuParticleRenderFeature(options) {
  const pendingFrames = /* @__PURE__ */ new Map();
  const submittedDeviceGenerationByRuntime = /* @__PURE__ */ new Map();
  const submittedIntents = /* @__PURE__ */ new Map();
  const sourceRuntimes = /* @__PURE__ */ new Map();
  let lastObservation = Object.freeze({
    frameNumber: -1,
    dispatches: 0,
    indirectDraws: 0,
    subjectOutputs: 0
  });
  const worldIds = /* @__PURE__ */ new WeakMap();
  const runtimeIds = /* @__PURE__ */ new WeakMap();
  const resourcesByEmitter = /* @__PURE__ */ new Map();
  let nextEmitterResourceId = 0;
  const emitterResource = (states, key) => {
    let state = states.get(key);
    if (state === void 0) {
      state = { id: nextEmitterResourceId++, epoch: 0 };
      states.set(key, state);
    }
    return state;
  };
  const resetEpochByIntent = /* @__PURE__ */ new Map();
  let nextWorldId = 0;
  let nextRuntimeId = 0;
  const worldId = (world) => {
    const prior = worldIds.get(world);
    if (prior !== void 0) return prior;
    const assigned = nextWorldId++;
    worldIds.set(world, assigned);
    return assigned;
  };
  const runtimeId = (runtime) => {
    const prior = runtimeIds.get(runtime);
    if (prior !== void 0) return prior;
    const assigned = nextRuntimeId++;
    runtimeIds.set(runtime, assigned);
    return assigned;
  };
  const feature = {
    identity: IDENTITY,
    requiredCapabilities: ["compute", "indirectDrawing"],
    // Generated emitter programs are first-use assets. They must hand a
    // WebGPU module to the prepared feature pipeline without waiting for the
    // diagnostic-only getCompilationInfo() round trip; pipeline creation still
    // validates the module before the pass is submitted.
    shaderModuleMode: "immediate",
    requiredMaterialShaders: Object.freeze([
      ...Object.values(PARTICLE_SHADER_IDENTIFIERS),
      ...Object.values(PARTICLE_INPUT_SHADER_IDENTIFIERS)
    ]),
    extract: (context) => {
      for (const frameNumber of pendingFrames.keys()) {
        if (frameNumber + 4 < context.frameNumber) pendingFrames.delete(frameNumber);
      }
      sourceRuntimes.clear();
      const extracted = [];
      for (const world of context.worlds) {
        if (!world.hasResource(VFX_GPU_RUNTIME_RESOURCE_KEY)) continue;
        const camera = options.camera.read(world);
        if (camera === void 0) continue;
        const runtime = world.getResource(VFX_GPU_RUNTIME_RESOURCE_KEY);
        sourceRuntimes.set(runtimeId(runtime), runtime);
        const retained = [];
        const emitterState = /* @__PURE__ */ new Map();
        const materials = /* @__PURE__ */ new Map();
        const meshes = /* @__PURE__ */ new Map();
        const captureEmitter = (player, emitter, localToWorld) => {
          emitterState.set(`${Number(player)}:${emitter.id}`, {
            enabled: (options.playerConsumption?.isEnabled(world, player) ?? true) && runtime.isEmitterSessionEnabled(player, emitter.id),
            localToWorld: new Float32Array(localToWorld)
          });
          for (const renderer of emitter.renderers) {
            const material = options.material?.read(world, renderer.material);
            if (material !== void 0) {
              const projection = options.material?.projection?.(world, material);
              materials.set(renderer.material, {
                asset: material,
                ...projection === void 0 ? {} : { projection }
              });
            }
            if (renderer.kind === "mesh") {
              const mesh = options.mesh?.read(world, renderer.mesh);
              if (mesh !== void 0) meshes.set(renderer.mesh, mesh);
            }
          }
        };
        runtime.forEachEmitterSource(({ player, emitter }) => {
          const sourceIntent = runtime.lastCommittedEmitter(player, emitter.id);
          const localToWorld = sourceIntent === void 0 ? emitter.space === "world" ? IDENTITY_MATRIX : (() => {
            const transform = world.get(player, GlobalTransform);
            return transform.ok ? transform.value.world : IDENTITY_MATRIX;
          })() : emitterTransform(world, sourceIntent);
          const visible = emitterVisible(emitter, camera, localToWorld);
          runtime.setEmitterCameraVisibility(player, emitter.id, visible);
          captureEmitter(player, emitter, localToWorld);
          const intent = runtime.lastCommittedEmitter(player, emitter.id);
          if (intent !== void 0) {
            retained.push({
              player,
              emitter,
              intent,
              localToWorld: new Float32Array(localToWorld),
              visible
            });
          }
        });
        const intents = runtime.snapshot();
        for (const intent of intents) {
          const localToWorld = emitterTransform(world, intent);
          captureEmitter(intent.player, intent.emitter, localToWorld);
          runtime.setEmitterCameraVisibility(
            intent.player,
            intent.emitter.id,
            emitterVisible(intent.emitter, camera, localToWorld)
          );
        }
        extracted.push({
          worldId: worldId(world),
          runtimeId: runtimeId(runtime),
          renderGeneration: runtime.renderGeneration ?? 0,
          camera,
          intents,
          retained,
          emitterState,
          materials,
          meshes
        });
      }
      return ok({ worlds: extracted, frameNumber: context.frameNumber });
    },
    assetDependencies: (frame) => [
      ...new Set(
        frame.worlds.flatMap((world) => [...world.materials.keys(), ...world.meshes.keys()])
      )
    ],
    plan: (sourceFrame, context) => {
      const frame = {
        ...sourceFrame,
        worlds: sourceFrame.worlds.map((entry) => {
          let submitted = submittedIntents.get(entry.runtimeId);
          if (submitted?.generation !== entry.renderGeneration || submitted.device !== context.generation) {
            submitted = {
              generation: entry.renderGeneration,
              device: context.generation,
              terminal: /* @__PURE__ */ new Map()
            };
            submittedIntents.set(entry.runtimeId, submitted);
          }
          const live = new Set(entry.intents.map((intent) => intent.sequence));
          for (const sequence of submitted.terminal.keys())
            if (!live.has(sequence)) submitted.terminal.delete(sequence);
          const retained = new Map(
            entry.retained.map((row) => [`${Number(row.player)}:${row.emitter.id}`, row])
          );
          const intents = entry.intents.filter((intent) => {
            const state = submitted.terminal.get(intent.sequence);
            if (state === void 0) return true;
            if (state === "dispatched") {
              const key = `${Number(intent.player)}:${intent.emitter.id}`;
              const prior = retained.get(key);
              const localToWorld = entry.emitterState.get(key)?.localToWorld ?? IDENTITY_MATRIX;
              if (prior === void 0 || prior.intent.sequence < intent.sequence)
                retained.set(key, {
                  player: intent.player,
                  emitter: intent.emitter,
                  intent,
                  localToWorld,
                  visible: emitterVisible(intent.emitter, entry.camera, localToWorld)
                });
            }
            return false;
          });
          return { ...entry, intents, retained: [...retained.values()] };
        })
      };
      const presentRuntimes = new Set(frame.worlds.map((entry) => entry.runtimeId));
      for (const identity of submittedIntents.keys())
        if (!presentRuntimes.has(identity)) submittedIntents.delete(identity);
      for (const frameNumber of pendingFrames.keys())
        if (frameNumber + 4 < frame.frameNumber) pendingFrames.delete(frameNumber);
      const liveRuntimes = new Set(frame.worlds.map((entry) => entry.runtimeId));
      for (const map of [
        submittedDeviceGenerationByRuntime,
        resourcesByEmitter,
        resetEpochByIntent
      ])
        for (const identity of map.keys()) if (!liveRuntimes.has(identity)) map.delete(identity);
      const resources = [];
      const passes = [];
      const colorTarget = context.targets.find((candidate) => candidate.kind === "color") ?? context.targets.find((candidate) => candidate.kind === "swapchain");
      const depthTarget = context.targets.find((candidate) => candidate.kind === "depth");
      const groups = /* @__PURE__ */ new Map();
      const outcomesByEntry = /* @__PURE__ */ new Map();
      for (const [worldIndex, entry] of frame.worlds.entries()) {
        const outcomes = [];
        outcomesByEntry.set(entry, outcomes);
        const effectiveEpochByEmitter = /* @__PURE__ */ new Map();
        const renderGeneration = entry.renderGeneration;
        const attachmentId = entry.runtimeId;
        let emitterEpochs = resourcesByEmitter.get(entry.runtimeId);
        if (emitterEpochs === void 0) {
          emitterEpochs = /* @__PURE__ */ new Map();
          resourcesByEmitter.set(entry.runtimeId, emitterEpochs);
        }
        let reservations = resetEpochByIntent.get(entry.runtimeId);
        if (reservations === void 0) {
          reservations = /* @__PURE__ */ new Map();
          resetEpochByIntent.set(entry.runtimeId, reservations);
        }
        const liveResetSequences = new Set(
          entry.intents.filter((intent) => intent.reset).map((intent) => intent.sequence)
        );
        for (const [sequence, reservation] of reservations) {
          if (reservation.generation !== renderGeneration || !liveResetSequences.has(sequence)) {
            reservations.delete(sequence);
          }
        }
        const blockedEmitters = /* @__PURE__ */ new Set();
        for (const intent of entry.intents) {
          const baseKey = `${entry.worldId}:${renderGeneration}:${Number(intent.player)}:${intent.emitter.id}`;
          let priorReservedEpoch;
          let priorReservedSequence = -1;
          let exactReservation;
          for (const [sequence, reservation] of reservations) {
            if (reservation.generation === renderGeneration && reservation.emitterKey === baseKey) {
              if (sequence === intent.sequence) {
                exactReservation = reservation;
              } else if (sequence < intent.sequence && sequence > priorReservedSequence) {
                priorReservedEpoch = reservation.epoch;
                priorReservedSequence = sequence;
              }
            }
          }
          const committedEpoch = effectiveEpochByEmitter.get(baseKey) ?? Math.max(emitterResource(emitterEpochs, baseKey).epoch, priorReservedEpoch ?? 0);
          let resetEpoch = committedEpoch;
          if (intent.reset) {
            resetEpoch = exactReservation?.generation === renderGeneration && exactReservation.emitterKey === baseKey ? exactReservation.epoch : committedEpoch + 1;
            reservations.set(intent.sequence, {
              generation: renderGeneration,
              emitterKey: baseKey,
              epoch: resetEpoch
            });
          }
          if (blockedEmitters.has(baseKey)) {
            outcomes.push({
              intent,
              state: "deferred",
              ...intent.reset ? { resetEpoch } : {}
            });
            continue;
          }
          if (entry.emitterState.get(`${Number(intent.player)}:${intent.emitter.id}`)?.enabled === false) {
            const state = intent.reset ? "deferred" : "skipped";
            outcomes.push({
              intent,
              state,
              ...intent.reset ? { resetEpoch } : {}
            });
            if (intent.reset) blockedEmitters.add(baseKey);
            continue;
          }
          const localToWorld = entry.emitterState.get(`${Number(intent.player)}:${intent.emitter.id}`)?.localToWorld ?? IDENTITY_MATRIX;
          const visible = emitterVisible(intent.emitter, entry.camera, localToWorld);
          if (!visible && intent.emitter.simulationWhenCulled !== "continue") {
            const state = intent.reset ? "deferred" : "skipped";
            outcomes.push({
              intent,
              state,
              ...intent.reset ? { resetEpoch } : {}
            });
            if (intent.reset) blockedEmitters.add(baseKey);
            continue;
          }
          if (visible && requiresSceneDepth(intent) && (depthTarget === void 0 || depthTarget.sampleCount !== 1)) {
            outcomes.push({
              intent,
              state: "deferred",
              ...intent.reset ? { resetEpoch } : {}
            });
            blockedEmitters.add(baseKey);
            continue;
          }
          const requirements = intent.emitter.reflection.dataInterfaces ?? [];
          if (requirements.length > 0 && !dataInterfacesExecutable(intent, options.dataInterfaces)) {
            outcomes.push({
              intent,
              state: "deferred",
              ...intent.reset ? { resetEpoch } : {}
            });
            blockedEmitters.add(baseKey);
            continue;
          }
          const stagePlan = validatedStagePlan(
            intent.emitter.reflection.stages,
            intent.instanceGeneration
          );
          if (!stagePlan.ok) return err(planFailure());
          const entryPoints = new Set(intent.emitter.reflection.entryPoints);
          const dispatches = simulationDispatches(intent, stagePlan.value).filter(
            (dispatch) => entryPoints.has(dispatch.entryPoint)
          );
          if (dispatches.length === 0 && intent.emitter.renderers.length === 0) {
            outcomes.push({
              intent,
              state: "skipped",
              ...intent.reset ? { resetEpoch } : {}
            });
            continue;
          }
          effectiveEpochByEmitter.set(baseKey, resetEpoch);
          const key = `vfx.w-${planName(entry.worldId.toString(36), 8)}.a-${planName(attachmentId.toString(36), 8)}.r-${entry.renderGeneration}.p-${planName(Number(intent.player).toString(36), 16)}.e-${emitterResource(emitterEpochs, baseKey).id.toString(36)}.g-${resetEpoch}`;
          let group = groups.get(key);
          if (group === void 0) {
            group = {
              key,
              worldIndex,
              entry,
              intents: [],
              // Reset data is a per-frame boundary, not a property of the
              // epoch.  Once a reset-created group is warm, later ticks in
              // the same epoch must retain its particle state.
              initialReset: intent.reset
            };
            groups.set(key, group);
          } else if (group.entry !== entry || group.intents[0]?.intent.emitter.wgsl !== intent.emitter.wgsl || group.intents[0]?.intent.emitter.capacity !== intent.emitter.capacity) {
            return err(planFailure());
          }
          group.intents.push({
            intent,
            localToWorld,
            stagePlan: stagePlan.value,
            visible,
            retained: false
          });
          outcomes.push({
            intent,
            state: dispatches.length > 0 ? "dispatched" : "skipped",
            ...intent.reset ? { resetEpoch } : {}
          });
          if (dispatches.length === 0) effectiveEpochByEmitter.delete(baseKey);
        }
      }
      for (const [worldIndex, entry] of frame.worlds.entries()) {
        const renderGeneration = entry.renderGeneration;
        const attachmentId = entry.runtimeId;
        const submittedDeviceGeneration = submittedDeviceGenerationByRuntime.get(entry.runtimeId);
        const rebuildingDeviceState = submittedDeviceGeneration !== context.generation;
        let emitterEpochs = resourcesByEmitter.get(entry.runtimeId);
        if (emitterEpochs === void 0) {
          emitterEpochs = /* @__PURE__ */ new Map();
          resourcesByEmitter.set(entry.runtimeId, emitterEpochs);
        }
        for (const retained of entry.retained ?? []) {
          const baseKey = `${entry.worldId}:${renderGeneration}:${Number(retained.player)}:${retained.emitter.id}`;
          const resetEpoch = emitterResource(emitterEpochs, baseKey).epoch;
          const key = `vfx.w-${planName(entry.worldId.toString(36), 8)}.a-${planName(attachmentId.toString(36), 8)}.r-${renderGeneration}.p-${planName(Number(retained.player).toString(36), 16)}.e-${emitterResource(emitterEpochs, baseKey).id.toString(36)}.g-${resetEpoch}`;
          const admittedGroup = groups.get(key);
          const hasAdmittedGroup = [...groups.values()].some(
            (group) => group.worldIndex === worldIndex && group.entry === entry && group.intents.some(
              (planned) => planned.intent.player === retained.player && planned.intent.emitter.id === retained.emitter.id
            )
          );
          const stagePlan = validatedStagePlan(
            retained.intent.emitter.reflection.stages,
            retained.intent.instanceGeneration
          );
          if (!stagePlan.ok) return err(planFailure());
          const visible = retained.visible && (entry.emitterState.get(`${Number(retained.player)}:${retained.emitter.id}`)?.enabled ?? true);
          const recoveryIntents = rebuildingDeviceState ? buildVfxRecoveryIntents(retained.intent) : [];
          if (admittedGroup !== void 0) {
            const sameCommittedSession = admittedGroup.intents.every(
              (planned) => planned.intent.player === retained.player && planned.intent.emitter.id === retained.emitter.id && planned.intent.playCycle === retained.intent.playCycle
            );
            if (recoveryIntents.length > 0 && sameCommittedSession) {
              groups.set(key, {
                ...admittedGroup,
                intents: [
                  ...recoveryIntents.map((intent) => ({
                    intent,
                    localToWorld: retained.localToWorld,
                    stagePlan: stagePlan.value,
                    visible,
                    retained: false
                  })),
                  ...admittedGroup.intents
                ],
                initialReset: true
              });
            }
            continue;
          }
          if (hasAdmittedGroup) continue;
          groups.set(key, {
            key,
            worldIndex,
            entry,
            intents: recoveryIntents.length === 0 ? [
              {
                intent: retained.intent,
                localToWorld: retained.localToWorld,
                stagePlan: stagePlan.value,
                visible,
                retained: true
              }
            ] : recoveryIntents.map((intent) => ({
              intent,
              localToWorld: retained.localToWorld,
              stagePlan: stagePlan.value,
              visible,
              retained: false
            })),
            initialReset: recoveryIntents.length > 0
          });
        }
      }
      for (const group of groups.values()) {
        const first = group.intents[0];
        if (first === void 0) continue;
        const firstIntent = first.intent;
        const prefix = group.key;
        const program = `${prefix}.compute-program`;
        const particles = `${prefix}.particles`;
        const aliveIndices = `${prefix}.alive-indices`;
        const counters = `${prefix}.counters`;
        const indirect = `${prefix}.indirect`;
        const scratch = `${prefix}.scratch`;
        const sharedInstances = `${prefix}.shared-instances`;
        const projectionEventInputs = `${prefix}.projection-event-inputs`;
        const capacity = firstIntent.emitter.capacity;
        const renderers = firstIntent.emitter.renderers;
        const authoredRendererKinds = new Set(renderers.map((renderer) => renderer.kind));
        const preparedEntryPoints = firstIntent.emitter.reflection.entryPoints.filter(
          (entryPoint) => {
            const kind = rendererOnlyEntryPoints.get(entryPoint);
            return kind === void 0 || authoredRendererKinds.has(kind);
          }
        );
        const layout = firstIntent.emitter.reflection.layout;
        const parameterBytes = layout?.parameters.size ?? 0;
        const customStride = layout?.customLayout?.stride ?? 0;
        const hasEvents = (firstIntent.emitter.reflection.resources ?? []).includes("eventBuffer") || (firstIntent.emitter.reflection.entryPoints ?? []).includes("forgeax_vfx_event_main") || (firstIntent.emitter.reflection.bindings[0]?.entries ?? []).some(
          (entry) => entry.binding === 8
        );
        const diBindings = {};
        const diResources = [];
        const reflectedBindings = new Set(
          firstIntent.emitter.reflection.bindings.flatMap(
            (group2) => group2.entries.map((entry) => entry.binding)
          )
        );
        const requirements = (firstIntent.emitter.reflection.dataInterfaces ?? []).filter(
          (requirement) => reflectedBindings.has(requirement.binding)
        );
        if (requirements.length > 0) {
          let resolved = options.dataInterfaces?.resolve(
            requirements,
            firstIntent.instanceGeneration
          );
          if ((resolved === void 0 || !resolved.ok && resolved.error.code === "vfx-data-interface-missing" && (resolved.error.detail.providerId === void 0 || resolved.error.expected.includes("resident"))) && context.preparedDataInterfaces !== void 0) {
            const fallback = preparedDataInterfaceResources(
              requirements,
              firstIntent.instanceGeneration,
              context.preparedDataInterfaces
            );
            if (fallback !== void 0) {
              resolved = ok({
                generation: firstIntent.instanceGeneration,
                readiness: "ready",
                resources: fallback
              });
            }
          }
          if (resolved === void 0 || !resolved.ok) return err(planFailure());
          for (const requirement of requirements) {
            const resource = resolved.value.resources.find(
              (candidate) => candidate.token === requirement.token
            );
            const prepared = resource?.resource;
            if (resource === void 0 || prepared === void 0) return err(planFailure());
            const name = `${prefix}.di-${planName(requirement.kind)}`;
            if (prepared.kind === "buffer") {
              if (prepared.size === void 0 || prepared.size <= 0) return err(planFailure());
              diResources.push({
                kind: "prepared-gpu-resource",
                name,
                resource: {
                  kind: "buffer",
                  value: prepared.value,
                  size: prepared.size,
                  usage: prepared.usage === "storage" ? ["storage"] : ["uniform"]
                }
              });
            } else {
              const external = prepared.kind === "texture-view" ? { kind: "texture-view", value: prepared.value } : { kind: "sampler", value: prepared.value };
              diResources.push({
                kind: "prepared-gpu-resource",
                name,
                resource: external,
                ...requirement.kind === "scene-depth" && depthTarget !== void 0 ? { logicalTarget: depthTarget.name } : {}
              });
            }
            diBindings[requirement.binding] = name;
          }
        }
        const meshes = renderers.map(
          (renderer) => renderer.kind === "mesh" ? group.entry.meshes.get(renderer.mesh) : void 0
        );
        const indirectWords = new Uint32Array(Math.max(1, renderers.length) * 5);
        for (const [rendererIndex, renderer] of renderers.entries()) {
          const mesh = meshes[rendererIndex];
          const submesh = renderer.kind === "mesh" ? mesh?.submeshes[renderer.submesh ?? 0] : void 0;
          if (renderer.kind === "mesh" && submesh === void 0) return err(planFailure());
          if ((renderer.kind === "ribbon" || renderer.kind === "trail" || renderer.kind === "beam") && !createTopologyResourcePlan(renderer).ok) {
            return err(planFailure());
          }
          indirectWords[rendererIndex * 5] = renderer.kind === "mesh" ? mesh?.indices === void 0 ? submesh?.vertexCount ?? 0 : submesh?.indexCount ?? 0 : 6;
          indirectWords[rendererIndex * 5 + 2] = renderer.kind === "mesh" && mesh?.indices !== void 0 ? submesh?.indexOffset ?? 0 : 0;
        }
        const scratchBytes = (capacity * 2 + Math.ceil(capacity / WORKGROUP_SIZE)) * 4;
        const eventBufferBytes = Math.max(
          4,
          eventInputCapacity(firstIntent.emitter) * VFX_EVENT_INPUT_BYTES + eventCapacity(firstIntent.emitter) * VFX_EVENT_BYTES
        );
        const particleBytes = VFX_PARTICLE_CORE_STRIDE;
        const maxParticleInputBytes = Math.max(
          0,
          ...renderers.map((renderer) => (renderer.materialInputs?.length ?? 0) * 16)
        );
        resources.push(
          ...diResources,
          {
            kind: "compute-program",
            name: program,
            program: {
              wgsl: firstIntent.emitter.wgsl,
              entryPoints: preparedEntryPoints,
              bindings: firstIntent.emitter.reflection.bindings
            }
          },
          {
            kind: "buffer",
            name: particles,
            size: capacity * particleBytes,
            usage: ["storage"],
            ...group.initialReset ? { data: resetData(capacity * particleBytes) } : {}
          },
          ...parameterBytes === 0 ? [] : [
            {
              kind: "buffer",
              name: `${prefix}.parameters`,
              size: parameterBytes,
              usage: ["uniform"],
              data: firstIntent.parameterBlock
            }
          ],
          ...customStride === 0 ? [] : [
            {
              kind: "buffer",
              name: `${prefix}.custom`,
              size: capacity * customStride,
              usage: ["storage"],
              ...group.initialReset ? { data: resetData(capacity * customStride) } : {}
            }
          ],
          { kind: "buffer", name: aliveIndices, size: capacity * 4, usage: ["storage"] },
          {
            kind: "buffer",
            name: counters,
            size: COUNTERS_BYTES,
            usage: ["storage"],
            ...group.initialReset ? { data: resetData(COUNTERS_BYTES) } : {}
          },
          {
            kind: "buffer",
            name: indirect,
            size: indirectWords.byteLength,
            usage: ["storage", "indirect"],
            ...group.initialReset ? { data: indirectWords } : {}
          },
          {
            kind: "buffer",
            name: scratch,
            size: scratchBytes,
            usage: ["storage"],
            ...group.initialReset ? { data: resetData(scratchBytes) } : {}
          },
          {
            kind: "buffer",
            name: sharedInstances,
            size: capacity * (Math.max(BILLBOARD_INSTANCE_BYTES, MESH_INSTANCE_BYTES) + maxParticleInputBytes),
            usage: ["storage", "vertex"]
          },
          ...hasEvents ? [
            {
              kind: "buffer",
              name: projectionEventInputs,
              size: eventBufferBytes,
              usage: ["storage"],
              data: encodeEventBuffer(firstIntent)
            }
          ] : []
        );
        const entryPoints = new Set(firstIntent.emitter.reflection.entryPoints);
        for (const [tickIndex, planned] of group.intents.entries()) {
          if (planned.retained) continue;
          const tickPrefix = `${prefix}.tick-${tickIndex}`;
          const tickRuntime = `${tickPrefix}.runtime`;
          const tickEventInputs = `${tickPrefix}.event-inputs`;
          const tickBindings = `${tickPrefix}.simulation-bindings`;
          resources.push(
            {
              kind: "buffer",
              name: tickRuntime,
              size: RUNTIME_BYTES,
              usage: ["uniform"],
              data: runtimeData(
                planned.intent,
                group.entry.camera,
                void 0,
                planned.localToWorld
              )
            },
            ...hasEvents ? [
              {
                kind: "buffer",
                name: tickEventInputs,
                size: eventBufferBytes,
                usage: ["storage"],
                data: encodeEventBuffer(planned.intent)
              }
            ] : [],
            ...parameterBytes === 0 ? [] : [
              {
                kind: "buffer",
                name: `${tickPrefix}.parameters`,
                size: parameterBytes,
                usage: ["uniform"],
                data: planned.intent.parameterBlock
              }
            ],
            {
              kind: "compute-bindings",
              name: tickBindings,
              program,
              entries: computeBindingEntries(planned.intent, {
                0: particles,
                1: tickRuntime,
                2: aliveIndices,
                3: counters,
                4: indirect,
                5: scratch,
                6: sharedInstances,
                ...hasEvents ? { 8: tickEventInputs } : {},
                ...parameterBytes === 0 ? {} : { 10: `${tickPrefix}.parameters` },
                ...customStride === 0 ? {} : { 11: `${prefix}.custom` },
                ...diBindings
              })
            }
          );
          const dispatches = simulationDispatches(planned.intent, planned.stagePlan).filter(
            (dispatch) => entryPoints.has(dispatch.entryPoint)
          );
          if (dispatches.length === 0) continue;
          passes.push({
            kind: "compute",
            name: `${tickPrefix}.simulate`,
            program,
            bindings: tickBindings,
            dispatches
          });
          for (const [rendererIndex, renderer] of renderers.entries()) {
            if (renderer.enabled === false) continue;
            if (renderer.kind !== "trail") continue;
            if (!entryPoints.has("forgeax_vfx_trail_history_main")) continue;
            const rendererPrefix = `${prefix}.renderer-${rendererIndex}`;
            const history = `${rendererPrefix}.history`;
            const historyRuntime = `${tickPrefix}.renderer-${rendererIndex}.history-runtime`;
            const historyBindings = `${tickPrefix}.renderer-${rendererIndex}.history-bindings`;
            resources.push(
              {
                kind: "buffer",
                name: historyRuntime,
                size: RUNTIME_BYTES,
                usage: ["uniform"],
                data: runtimeData(
                  planned.intent,
                  group.entry.camera,
                  void 0,
                  planned.localToWorld,
                  renderer,
                  rendererIndex
                )
              },
              {
                kind: "compute-bindings",
                name: historyBindings,
                program,
                entries: computeBindingEntries(planned.intent, {
                  0: particles,
                  1: historyRuntime,
                  2: aliveIndices,
                  3: counters,
                  4: indirect,
                  5: history,
                  6: sharedInstances,
                  ...hasEvents ? { 8: tickEventInputs } : {},
                  ...parameterBytes === 0 ? {} : { 10: `${tickPrefix}.parameters` },
                  ...customStride === 0 ? {} : { 11: `${prefix}.custom` },
                  ...diBindings
                })
              }
            );
            passes.push({
              kind: "compute",
              name: `${historyBindings}.write`,
              program,
              bindings: historyBindings,
              dispatches: [
                {
                  kind: "direct",
                  entryPoint: "forgeax_vfx_trail_history_main",
                  workgroups: [Math.max(1, Math.ceil(renderer.capacity / WORKGROUP_SIZE))]
                }
              ]
            });
          }
        }
        const latest = group.intents.at(-1) ?? first;
        for (const [rendererIndex, renderer] of renderers.entries()) {
          if (renderer.enabled === false) continue;
          const rendererPrefix = `${prefix}.renderer-${rendererIndex}`;
          const isBillboard = renderer.kind === "billboard";
          const isTopology = renderer.kind === "ribbon" || renderer.kind === "trail" || renderer.kind === "beam";
          const topologyPlan = isTopology ? createTopologyResourcePlan(renderer) : void 0;
          if (topologyPlan !== void 0 && !topologyPlan.ok) return err(planFailure());
          const publishedMaterial = group.entry.materials.get(renderer.material);
          const material = publishedMaterial?.asset;
          const reflectedRenderer = firstIntent.emitter.reflection.renderers?.[rendererIndex];
          const preparedInputs = prepareParticleMaterialInputs(
            renderer,
            material,
            reflectedRenderer?.materialInputDefinitions
          );
          if (!preparedInputs.ok) return err(planFailure());
          const hasParticleInputs = preparedInputs.value.lanes > 0;
          const materialPass = particleMaterialPass(
            renderer.kind,
            material,
            hasParticleInputs,
            publishedMaterial?.projection === void 0 ? void 0 : {
              projection: publishedMaterial.projection,
              context: context.materialContext
            }
          );
          const mesh = meshes[rendererIndex];
          const submesh = renderer.kind === "mesh" ? mesh?.submeshes[renderer.submesh ?? 0] : void 0;
          const indexFormat = mesh?.indices instanceof Uint32Array ? "uint32" : "uint16";
          const sceneDepthBinding = particleMaterialSceneDepthBinding(
            context.materialShaderBindingContract?.(materialPass.shader) ?? (materialPass.shader === PARTICLE_SHADER_IDENTIFIERS.billboard ? "view-and-scene-depth" : void 0)
          );
          const instances = `${rendererPrefix}.instances`;
          const history = `${rendererPrefix}.history`;
          const projectionRuntime = `${rendererPrefix}.runtime`;
          const projectionBindings = `${rendererPrefix}.compute-bindings`;
          const vertexLayout = isBillboard ? hasParticleInputs ? RENDER_FEATURE_VERTEX_LAYOUTS.billboardMaterialInputInstance : RENDER_FEATURE_VERTEX_LAYOUTS.billboardMaterialInstance : isTopology ? hasParticleInputs ? RENDER_FEATURE_VERTEX_LAYOUTS.topologySegmentMaterialInputInstance : RENDER_FEATURE_VERTEX_LAYOUTS.topologySegmentInstance : hasParticleInputs ? RENDER_FEATURE_VERTEX_LAYOUTS.meshGeometryMaterialInputInstance : RENDER_FEATURE_VERTEX_LAYOUTS.meshGeometryMaterialInstance;
          const inputBytes = preparedInputs.value.stride;
          const instanceBytes = isTopology ? (() => {
            const vertexCount = Math.max(
              1,
              Math.floor((topologyPlan?.value.vertexBytes ?? 16) / 48)
            );
            return vertexCount * (48 + inputBytes);
          })() : capacity * ((isBillboard ? BILLBOARD_INSTANCE_BYTES : MESH_INSTANCE_BYTES) + inputBytes);
          const historyBytes = renderer.kind === "trail" ? capacity * (Math.max(2, renderer.historyLength) + 1) * 16 : 16;
          resources.push(
            {
              kind: "buffer",
              name: instances,
              size: instanceBytes,
              usage: ["storage", "vertex"]
            },
            {
              kind: "buffer",
              name: history,
              size: historyBytes,
              usage: ["storage"],
              ...group.initialReset ? { data: resetData(historyBytes) } : {}
            }
          );
          const castsShadow = renderer.kind === "mesh" && renderer.castShadows;
          if (!latest.visible && !castsShadow) continue;
          resources.push(
            {
              kind: "buffer",
              name: projectionRuntime,
              size: RUNTIME_BYTES,
              usage: ["uniform"],
              data: runtimeData(
                { ...latest.intent, fixedDelta: 0, spawnCount: 0 },
                group.entry.camera,
                material,
                latest.localToWorld,
                renderer,
                rendererIndex,
                preparedInputs.value.lanes,
                renderer.kind === "mesh" && submesh !== void 0 ? {
                  count: mesh?.indices === void 0 ? submesh.vertexCount : submesh.indexCount,
                  firstIndex: mesh?.indices === void 0 ? 0 : submesh.indexOffset
                } : void 0
              )
            },
            {
              kind: "compute-bindings",
              name: projectionBindings,
              program,
              entries: computeBindingEntries(latest.intent, {
                0: particles,
                1: projectionRuntime,
                2: aliveIndices,
                3: counters,
                4: indirect,
                5: history,
                6: instances,
                ...hasEvents ? { 8: projectionEventInputs } : {},
                ...parameterBytes === 0 ? {} : { 10: `${prefix}.parameters` },
                ...customStride === 0 ? {} : { 11: `${prefix}.custom` },
                ...diBindings
              })
            }
          );
          const projectionDispatches = [];
          const pushProjection = (entryPoint, workgroups) => {
            if (!entryPoints.has(entryPoint)) return;
            projectionDispatches.push({
              kind: "direct",
              entryPoint,
              workgroups: [Math.max(1, workgroups)]
            });
          };
          if ((isBillboard || renderer.kind === "mesh") && (renderer.sorting === "view-depth" || renderer.sorting === "view-distance" || renderer.sorting === "custom-ascending" || renderer.sorting === "custom-descending")) {
            pushProjection("forgeax_vfx_sort_main", 1);
          }
          if (renderer.kind === "trail") pushProjection("forgeax_vfx_trail_offsets_main", 1);
          const projectionCount = renderer.kind === "trail" ? renderer.capacity * Math.max(1, renderer.historyLength - 1) : isTopology ? renderer.capacity : capacity;
          pushProjection(
            renderer.kind === "billboard" ? "forgeax_vfx_billboard_main" : renderer.kind === "mesh" ? "forgeax_vfx_mesh_main" : `forgeax_vfx_${renderer.kind}_main`,
            Math.ceil(projectionCount / WORKGROUP_SIZE)
          );
          if (projectionDispatches.length > 0) {
            passes.push({
              kind: "compute",
              name: `${rendererPrefix}.project`,
              program,
              bindings: projectionBindings,
              dispatches: projectionDispatches
            });
          }
          const graphicsProgram = `${rendererPrefix}.graphics-program`;
          const graphicsBindings = `${rendererPrefix}.graphics-bindings`;
          const vertexData = `${rendererPrefix}.vertex-data`;
          const defaultRenderState = particleRendererRenderState(
            renderer.kind,
            renderer.kind === "billboard" ? renderer.blend : void 0,
            materialPass.renderState
          );
          const renderState = isBillboard && depthTarget !== void 0 ? { ...defaultRenderState ?? {}, depthWriteEnabled: false } : defaultRenderState;
          resources.push(
            {
              kind: "graphics-program",
              name: graphicsProgram,
              program: {
                shader: materialPass.shader,
                vertexLayout,
                ...hasParticleInputs ? { particleInputLanes: preparedInputs.value.lanes } : {},
                colorFormats: [colorTarget?.format ?? "rgba8unorm-srgb"],
                ...depthTarget === void 0 ? {} : { depthFormat: depthTarget.format },
                sampleCount: colorTarget?.sampleCount ?? 1,
                topology: submesh?.topology ?? "triangle-list",
                ...mesh?.indices === void 0 ? {} : { indexFormat },
                ...renderState === void 0 ? {} : { renderState }
              }
            },
            {
              kind: "graphics-bindings",
              name: graphicsBindings,
              program: graphicsProgram,
              values: {
                group: 0,
                runtime: projectionRuntime,
                instances,
                ...sceneDepthBinding === void 0 ? {} : { sceneDepthBinding }
              },
              ...sceneDepthBinding !== void 0 && depthTarget !== void 0 ? { logicalTargets: { sceneDepth: depthTarget.name } } : {}
            },
            { kind: "vertex-data", name: vertexData, layout: vertexLayout, buffer: instances }
          );
          const drawBindings = [graphicsBindings];
          if (particleMaterialUsesBindings(material) || materialPass.shader === PARTICLE_SHADER_IDENTIFIERS.mesh || materialPass.shader === PARTICLE_INPUT_SHADER_IDENTIFIERS.mesh) {
            const materialBindings = `${rendererPrefix}.material-bindings.w-${group.worldIndex}`;
            resources.push({
              kind: "graphics-bindings",
              name: materialBindings,
              program: graphicsProgram,
              values: {
                group: 1,
                material: { world: group.worldIndex, guid: renderer.material }
              }
            });
            drawBindings.push(materialBindings);
          }
          const vertexBindings = [];
          let indexData;
          if (renderer.kind === "mesh") {
            if (mesh === void 0) return err(planFailure());
            const geometryBuffer = `${rendererPrefix}.geometry-buffer`;
            const geometry = `${rendererPrefix}.geometry`;
            const geometryData = particleMeshVerticesCached(mesh);
            if (geometryData.length === 0) return err(planFailure());
            resources.push(
              {
                kind: "buffer",
                name: geometryBuffer,
                size: geometryData.byteLength,
                usage: ["vertex"],
                data: geometryData
              },
              {
                kind: "vertex-data",
                name: geometry,
                layout: vertexLayout,
                buffer: geometryBuffer
              }
            );
            vertexBindings.push({ slot: 0, resource: geometry }, { slot: 1, resource: vertexData });
            const indexUpload = particleMeshIndices(mesh);
            if (indexUpload !== void 0) {
              const indexBuffer = `${rendererPrefix}.index-buffer`;
              const indices = `${rendererPrefix}.indices`;
              resources.push(
                {
                  kind: "buffer",
                  name: indexBuffer,
                  size: indexUpload.byteLength,
                  usage: ["index"],
                  data: indexUpload
                },
                {
                  kind: "index-data",
                  name: indices,
                  format: indexFormat,
                  buffer: indexBuffer
                }
              );
              indexData = { resource: indices, format: indexFormat };
            }
          } else {
            vertexBindings.push({ slot: 0, resource: vertexData });
          }
          if (castsShadow) {
            const shadowProgram = `${rendererPrefix}.shadow-program`;
            const shadowBindings = `${rendererPrefix}.shadow-bindings`;
            resources.push(
              {
                kind: "graphics-program",
                name: shadowProgram,
                program: {
                  shader: "forgeax::vfx-render.particles.mesh-shadow",
                  vertexLayout,
                  ...hasParticleInputs ? { particleInputLanes: preparedInputs.value.lanes } : {},
                  colorFormats: [],
                  depthFormat: "depth32float",
                  topology: submesh?.topology ?? "triangle-list",
                  ...mesh?.indices === void 0 ? {} : { indexFormat },
                  renderState: { depthWriteEnabled: true, cullMode: "none" }
                }
              },
              {
                kind: "graphics-bindings",
                name: shadowBindings,
                program: shadowProgram,
                values: { group: 0, runtime: projectionRuntime, instances }
              }
            );
            passes.push({
              kind: "shadow-caster",
              name: `${rendererPrefix}.shadow`,
              draws: [
                {
                  program: shadowProgram,
                  bindings: [shadowBindings],
                  vertexData: vertexBindings,
                  ...indexData === void 0 ? {} : { indexData },
                  draw: {
                    kind: indexData === void 0 ? "draw-indirect" : "draw-indexed-indirect",
                    resource: indirect,
                    offset: rendererIndex * 20
                  }
                }
              ]
            });
          }
          if (latest.visible)
            passes.push({
              kind: "raster",
              name: `${rendererPrefix}.raster`,
              colorAttachments: [
                {
                  target: colorTarget?.name ?? "swapchain",
                  loadOp: "load",
                  storeOp: "store"
                }
              ],
              ...depthTarget === void 0 ? {} : {
                depthStencilAttachment: {
                  target: depthTarget.name,
                  depthLoadOp: "load",
                  depthStoreOp: "store"
                }
              },
              ...sceneDepthBinding !== void 0 && depthTarget !== void 0 ? { sampledTargets: [depthTarget.name] } : {},
              draws: [
                {
                  program: graphicsProgram,
                  bindings: drawBindings,
                  vertexData: vertexBindings,
                  ...indexData === void 0 ? {} : { indexData },
                  draw: {
                    kind: indexData === void 0 ? "draw-indirect" : "draw-indexed-indirect",
                    resource: indirect,
                    offset: rendererIndex * 20
                  }
                }
              ]
            });
        }
      }
      const observation = Object.freeze({
        frameNumber: frame.frameNumber,
        dispatches: passes.reduce(
          (count, pass) => count + (pass.kind === "compute" ? pass.dispatches.length : 0),
          0
        ),
        indirectDraws: passes.reduce(
          (count, pass) => count + (pass.kind === "raster" ? pass.draws.filter(
            (draw) => draw.draw.kind === "draw-indirect" || draw.draw.kind === "draw-indexed-indirect"
          ).length : 0),
          0
        ),
        subjectOutputs: passes.reduce(
          (count, pass) => pass.kind === "raster" ? count + pass.draws.length : count,
          0
        )
      });
      pendingFrames.set(
        frame.frameNumber,
        frame.worlds.map((entry) => ({
          source: entry,
          generation: context.generation,
          outcomes: outcomesByEntry.get(entry) ?? entry.intents.map((intent) => ({ intent, state: "deferred" })),
          observation
        }))
      );
      const sourceFeedback = frame.worlds.map((entry) => ({
        runtimeId: entry.runtimeId,
        renderGeneration: entry.renderGeneration,
        acknowledged: (outcomesByEntry.get(entry) ?? []).filter((row) => row.state !== "deferred").map((row) => row.intent.sequence),
        published: (outcomesByEntry.get(entry) ?? []).filter((row) => row.state === "dispatched").map((row) => row.intent.sequence)
      }));
      return ok({ resources, passes, sourceFeedback });
    },
    onFrameSubmitted: (frame, submission) => {
      const pending = pendingFrames.get(frame.frameNumber);
      if (pending === void 0) return;
      pendingFrames.delete(frame.frameNumber);
      for (const entry of pending) {
        submittedDeviceGenerationByRuntime.set(entry.source.runtimeId, entry.generation);
        for (const outcome of entry.outcomes) {
          if (outcome.state === "deferred") continue;
          submittedIntents.get(entry.source.runtimeId)?.terminal.set(outcome.intent.sequence, outcome.state);
          if (outcome.state === "dispatched") {
            if (outcome.resetEpoch !== void 0) {
              const baseKey = `${entry.source.worldId}:${entry.source.renderGeneration}:${Number(outcome.intent.player)}:${outcome.intent.emitter.id}`;
              const state = resourcesByEmitter.get(entry.source.runtimeId)?.get(baseKey);
              if (state !== void 0) state.epoch = outcome.resetEpoch;
              resetEpochByIntent.get(entry.source.runtimeId)?.delete(outcome.intent.sequence);
            }
          } else if (outcome.state === "skipped" && outcome.resetEpoch !== void 0) {
            resetEpochByIntent.get(entry.source.runtimeId)?.delete(outcome.intent.sequence);
          }
        }
      }
      const planned = pending[0]?.observation;
      if (planned === void 0) {
        lastObservation = Object.freeze({
          frameNumber: frame.frameNumber,
          dispatches: 0,
          indirectDraws: 0,
          subjectOutputs: 0
        });
      } else {
        lastObservation = submission === void 0 ? planned : Object.freeze({
          frameNumber: frame.frameNumber,
          dispatches: submission.passes.reduce(
            (count, pass) => count + (pass.gpuCompute?.dispatches.length ?? 0),
            0
          ),
          indirectDraws: submission.passes.reduce(
            (count, pass) => count + (pass.shadowCaster === true || pass.graphics === void 0 ? 0 : pass.graphics.draws.filter(
              (draw) => draw.kind === "draw-indirect" || draw.kind === "draw-indexed-indirect"
            ).length),
            0
          ),
          subjectOutputs: submission.passes.reduce(
            (count, pass) => count + (pass.shadowCaster === true || pass.graphics === void 0 ? 0 : pass.graphics.draws.length),
            0
          )
        });
      }
    },
    onSourceFrameSubmitted: (frame, feedback) => {
      if (!Array.isArray(feedback)) return;
      for (const row of feedback) {
        const source = frame.worlds.find((entry) => entry.runtimeId === row.runtimeId);
        const runtime = sourceRuntimes.get(row.runtimeId);
        if (source === void 0 || runtime === void 0 || runtime.renderGeneration !== row.renderGeneration)
          continue;
        const published = new Set(row.published);
        for (const intent of source.intents)
          if (published.has(intent.sequence))
            runtime.markEventDispatched(intent.player, intent.eventCounters);
        if (row.acknowledged.length > 0) runtime.commit(row.acknowledged, row.published);
      }
    },
    onFrameAborted: (frame) => {
      pendingFrames.delete(frame.frameNumber);
    },
    inspect: () => lastObservation
  };
  return feature;
}
function duplicate(token, providerId) {
  return {
    code: "vfx-data-interface-duplicate",
    expected: "at most one provider for each reflected Data Interface token",
    hint: `remove provider ${providerId} or the existing provider for ${token} and retry`,
    detail: { token, providerId }
  };
}
function availableProvider(token, kind, bindingType, source) {
  return {
    id: `${token}-provider`,
    token,
    kind,
    bindingType,
    provide: (generation) => {
      if (!source.available(generation)) {
        return err({
          code: "vfx-data-interface-missing",
          expected: `an available ${kind} provider for ${token}`,
          hint: `make ${token} available for generation ${generation} and retry rendering`,
          detail: { token, providerId: `${token}-provider` }
        });
      }
      const prepared = source.resource?.(generation);
      if (prepared === void 0) {
        return err({
          code: "vfx-data-interface-missing",
          expected: `a resident ${kind} resource for ${token}`,
          hint: `provide the generation-owned ${kind} resource before rendering`,
          detail: { token, providerId: `${token}-provider` }
        });
      }
      const resource = {
        token,
        kind,
        bindingType,
        generation,
        ...source.sampleCount === void 0 ? {} : { sampleCount: source.sampleCount },
        resource: prepared
      };
      return ok(resource);
    }
  };
}
function createCameraProvider(source) {
  return availableProvider("vfx:camera", "camera", "uniform", source);
}
function createSceneDepthProvider(source) {
  return availableProvider("vfx:scene-depth", "scene-depth", "sampled-depth", source);
}
function createNoiseProvider(source) {
  return availableProvider("vfx:noise", "noise", "sampled-float", source);
}
function createVfxDataInterfaceRegistry(initialProviders = []) {
  const entries = /* @__PURE__ */ new Map();
  let registrationError;
  let lastSnapshot;
  const registry = {
    get providers() {
      return Object.freeze([...entries.values()]);
    },
    get snapshot() {
      return lastSnapshot;
    },
    register(provider) {
      if (entries.has(provider.token)) {
        const error = duplicate(provider.token, provider.id);
        registrationError ??= error;
        return err(error);
      }
      entries.set(provider.token, provider);
      return ok(void 0);
    },
    resolve(requirements, generation) {
      const result = registrationError === void 0 ? resolveVfxDataInterfaces(requirements, [...entries.values()], generation) : err(registrationError);
      lastSnapshot = Object.freeze({ generation, result });
      return result;
    }
  };
  for (const provider of initialProviders) registry.register(provider);
  return registry;
}
function installVfxRuntimeDecoder(registry) {
  return registry.installDecoder(vfxGpuEffectContribution.kind, vfxGpuEffectContribution.decoder);
}
function failure2(code, expected, hint, cause) {
  return { code, expected, hint, detail: { cause } };
}
function controlFailure(code, expected, hint, detail = {}) {
  return { code, expected, hint, detail };
}
function createVfxRuntimeHost(options) {
  const registries = /* @__PURE__ */ new WeakSet();
  const worlds = /* @__PURE__ */ new WeakMap();
  const pausedPlayers = /* @__PURE__ */ new WeakMap();
  let nextGeneration = 1;
  const dataInterfaces = createVfxDataInterfaceRegistry(options.providers);
  const readRenderAsset = (world, guid, kind) => {
    const attached = worlds.get(world);
    if (attached === void 0) return void 0;
    const key = `${kind}:${guid.toLowerCase()}`;
    const cached = attached.renderAssets.get(key);
    if (cached?.kind === kind) return cached;
    if ("lookup" in attached.assets) {
      const lookup = attached.assets.lookup;
      const legacy = lookup.call(attached.assets, guid);
      if (legacy?.kind === kind) {
        attached.renderAssets.set(key, legacy);
        return legacy;
      }
    }
    const resolved = attached.resolver?.lookup(guid);
    if (resolved?.kind === kind) {
      attached.renderAssets.set(key, resolved);
      return resolved;
    }
    if ("load" in attached.assets && typeof attached.assets.load === "function" && !attached.pendingRenderAssets.has(key)) {
      const epoch = attached.catalogEpoch;
      const load = attached.assets.load;
      const request = load(guid, kind).then((result) => {
        if (!result.ok || worlds.get(world) !== attached || attached.catalogEpoch !== epoch)
          return;
        attached.renderAssets.set(key, result.value);
      }).catch(() => void 0);
      attached.pendingRenderAssets.set(key, request);
      void request.finally(() => {
        if (attached.pendingRenderAssets.get(key) === request) {
          attached.pendingRenderAssets.delete(key);
        }
      });
    }
    return void 0;
  };
  const feature = gpuParticleRenderFeature({
    camera: options.camera,
    dataInterfaces,
    material: {
      read: (world, guid) => readRenderAsset(world, guid, "material"),
      projection: (world, material) => {
        const assets = worlds.get(world)?.assets;
        return assets !== void 0 && "getMaterialProjectionForPayload" in assets ? assets.getMaterialProjectionForPayload(material) : void 0;
      }
    },
    mesh: { read: (world, guid) => readRenderAsset(world, guid, "mesh") },
    playerConsumption: {
      isEnabled: (world, player) => !pausedPlayers.get(world)?.has(player)
    }
  });
  return {
    feature,
    dataInterfaces,
    inspect: (world) => {
      const attached = worlds.get(world);
      if (attached === void 0 || !world.hasResource(VFX_GPU_RUNTIME_RESOURCE_KEY))
        return void 0;
      const runtime = world.getResource(VFX_GPU_RUNTIME_RESOURCE_KEY);
      return Object.freeze({
        generation: attached.generation,
        renderGeneration: runtime.renderGeneration,
        players: runtime.inspectPlayers(),
        diagnostics: runtime.diagnostics()
      });
    },
    acquireControl: (world) => {
      const attached = worlds.get(world);
      if (attached === void 0) {
        return err(
          controlFailure(
            "vfx-host-control-world-detached",
            "an attached VFX Runtime World",
            "attach the World to this VfxRuntimeHost before acquiring controls"
          )
        );
      }
      const requestedGeneration = attached.generation;
      const withRuntime = (player, action) => {
        const current = worlds.get(world);
        if (current === void 0) {
          return err(
            controlFailure(
              "vfx-host-control-world-detached",
              `VFX host generation ${requestedGeneration} to remain attached`,
              "reacquire controls after the World is attached again",
              { requestedGeneration }
            )
          );
        }
        if (current.generation !== requestedGeneration) {
          return err(
            controlFailure(
              "vfx-host-control-stale-generation",
              `VFX host generation ${requestedGeneration}`,
              "discard this stale control lease and acquire one from the current host generation",
              { requestedGeneration, currentGeneration: current.generation }
            )
          );
        }
        if (!world.hasResource(VFX_GPU_RUNTIME_RESOURCE_KEY)) {
          return err(
            controlFailure(
              "vfx-host-control-runtime-unavailable",
              "the attached World to own its VFX GPU runtime resource",
              "repair the host attachment before retrying the preview command",
              { requestedGeneration, currentGeneration: current.generation }
            )
          );
        }
        if (!world.get(player, ParticleEffectPlayer).ok) {
          return err(
            controlFailure(
              "vfx-host-control-player-unavailable",
              "a live entity with ParticleEffectPlayer in the attached World",
              "discard the stale player handle or target a VFX player owned by this World",
              { requestedGeneration, currentGeneration: current.generation, player }
            )
          );
        }
        return ok(action(world.getResource(VFX_GPU_RUNTIME_RESOURCE_KEY)));
      };
      const withInstance = (player, action) => {
        const result = withRuntime(player, (runtime) => {
          const instance = runtime.getInstance(player);
          if (instance === void 0) {
            return { kind: "error", causeCode: "vfx-instance-unavailable" };
          }
          const outcome = action(instance);
          return outcome.ok ? { kind: "value", value: outcome.value } : { kind: "error", causeCode: outcome.error.code };
        });
        if (!result.ok) return result;
        if (result.value.kind === "error") {
          return err(
            controlFailure(
              "vfx-host-control-instance-rejected",
              "the live typed VFX instance to accept this control input",
              "run one fixed tick or repair the reflected instance contract before retrying",
              {
                requestedGeneration,
                currentGeneration: requestedGeneration,
                player,
                causeCode: result.value.causeCode
              }
            )
          );
        }
        return ok(result.value.value);
      };
      const control = {
        generation: requestedGeneration,
        replay: ({ player, replayInput }) => withRuntime(player, (runtime) => {
          runtime.replay(player, replayInput);
          return Object.freeze({ state: "queued", generation: requestedGeneration });
        }),
        setEmitterSessionEnabled: ({ player, emitterId, enabled }) => withRuntime(player, (runtime) => {
          runtime.setEmitterSessionEnabled(player, emitterId, enabled);
          return Object.freeze({
            state: enabled ? "enabled" : "disabled",
            generation: requestedGeneration
          });
        }),
        setPlayerRenderConsumption: ({ player, enabled }) => withRuntime(player, () => {
          let paused = pausedPlayers.get(world);
          if (enabled) {
            paused?.delete(player);
            if (paused !== void 0 && paused.size === 0) pausedPlayers.delete(world);
          } else {
            paused ??= /* @__PURE__ */ new Set();
            paused.add(player);
            pausedPlayers.set(world, paused);
          }
          return Object.freeze({
            state: enabled ? "enabled" : "paused",
            generation: requestedGeneration
          });
        }),
        patchPlayerParameters: ({ player, values }) => withInstance(player, (instance) => {
          const patched = instance.patch(values);
          if (!patched.ok) return patched;
          return ok({
            state: "queued",
            generation: requestedGeneration,
            parameterGeneration: instance.generation,
            pendingPatchCount: instance.pendingPatchCount
          });
        }),
        submitChannel: ({ player, channel, payload, sequence }) => withInstance(player, (instance) => {
          const submitted = instance.submit({ channel, payload, sequence });
          if (!submitted.ok) return submitted;
          return ok({ state: "queued", generation: requestedGeneration });
        })
      };
      return ok(Object.freeze(control));
    },
    resolveDataInterfaces: ({ requirements, generation }) => dataInterfaces.resolve(requirements, generation),
    attachWorld: async ({ world, assets }) => {
      if (worlds.has(world)) return ok({ state: "already-attached" });
      if (!registries.has(assets)) {
        try {
          if ("loaders" in assets) {
            assets.loaders.registerPackLoader(vfxGpuEffectPackLoader);
          } else if ("installDecoder" in assets) {
            assets.installDecoder(vfxGpuEffectContribution.kind, vfxGpuEffectContribution.decoder);
          } else {
            throw new TypeError("VFX assets registry exposes neither loaders nor installDecoder");
          }
          registries.add(assets);
        } catch (cause) {
          return err(
            failure2(
              "vfx-host-loader-install-failed",
              "the Program v3 VFX loader to be registered once",
              "remove a conflicting particle-effect loader and retry attachWorld",
              cause
            )
          );
        }
      }
      let pluginContext;
      try {
        pluginContext = await createWorldContext(world, [
          vfxGpuRuntimePlugin(
            options.maxQueuedTicks === void 0 ? {} : { maxQueuedTicks: options.maxQueuedTicks }
          )
        ]);
      } catch (cause) {
        return err(
          failure2(
            "vfx-host-world-attach-failed",
            "the World FixedUpdate VFX intent producer to install",
            "repair the reported World registration conflict and retry",
            cause
          )
        );
      }
      let resolver;
      if (!("loaders" in assets) && "installDecoder" in assets) {
        try {
          resolver = getAssetRegistryResolver(assets);
        } catch {
          resolver = void 0;
        }
      }
      const attached = {
        assets,
        resolver,
        pluginContext,
        generation: nextGeneration++,
        renderAssets: /* @__PURE__ */ new Map(),
        pendingRenderAssets: /* @__PURE__ */ new Map(),
        catalogEpoch: "snapshot" in assets && typeof assets.snapshot === "function" ? assets.snapshot().epoch : 0,
        unsubscribeAssets: () => {
        }
      };
      if ("subscribe" in assets && typeof assets.subscribe === "function") {
        attached.unsubscribeAssets = assets.subscribe((snapshot) => {
          if (snapshot.epoch === attached.catalogEpoch) return;
          attached.catalogEpoch = snapshot.epoch;
          attached.renderAssets.clear();
          attached.pendingRenderAssets.clear();
        });
      }
      worlds.set(world, attached);
      return ok({ state: "attached" });
    },
    detachWorld: async ({ world }) => {
      const attached = worlds.get(world);
      if (attached === void 0) return ok({ state: "not-attached" });
      try {
        await attached.pluginContext.fiber.dispose();
      } catch (cause) {
        return err(
          failure2(
            "vfx-host-world-detach-failed",
            "the VFX FixedUpdate producer to detach exactly once",
            "inspect the World schedule and retry detachWorld",
            cause
          )
        );
      }
      pausedPlayers.delete(world);
      attached.unsubscribeAssets();
      attached.renderAssets.clear();
      attached.pendingRenderAssets.clear();
      worlds.delete(world);
      return ok({ state: "detached" });
    }
  };
}

export { PARTICLE_INPUT_SHADER_IDENTIFIERS, PARTICLE_SHADER_IDENTIFIERS, VFX_EVENT_BYTES, VFX_EVENT_COUNTER_BYTES, VFX_EVENT_INPUT_BYTES, createCameraProvider, createNoiseProvider, createSceneDepthProvider, createTopologyResourcePlan, createVfxDataInterfaceRegistry, createVfxRenderInspectSnapshot, createVfxRuntimeHost, encodeEventBuffer, encodeEventInputs, eventCapacity, eventCounterData, eventInputCapacity, gpuParticleRenderFeature, installVfxRuntimeDecoder, observeStagePlan, prepareParticleMaterialInputs, resolveBillboardAdvancedState, stageDispatches, stageRecoveryReadiness, topologyCapacitySnapshot, topologyRecoveryHint, validatedStagePlan };
