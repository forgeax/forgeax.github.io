import { ok, err, toShared } from '../../types/dist/index.mjs';
import { defineComponent, FixedUpdate, Entity, FixedTime } from '../../ecs/dist/index.mjs';

// src/assets/particle-effect-decoder.ts
var particleEffectContribution = {
  kind: { kind: "particle-effect" },
  consumer: "VfxGpuRuntime",
  decoder: {
    async decode({ envelope }) {
      const payload = envelope.payload;
      if (payload.kind === "particle-effect" && payload.schemaVersion === 3 && payload.program.format === "forgeax-vfx-program-4" && payload.emitters.length === payload.program.emitters.length && payload.programFingerprint === payload.program.fingerprint) {
        return ok(payload);
      }
      return err({
        code: "asset-package-invalid",
        expected: "a schemaVersion 3 particle payload matching its cooked program format 4",
        hint: "cold-cook the legacy payload with the current VFX compiler and publish atomically",
        detail: { guid: envelope.guid, reason: "particle owner validation failed" }
      });
    }
  }
};

// src/authoring-descriptor.ts
var V3_CAPABILITIES = Object.freeze([
  Object.freeze({ id: "wgsl-behavior", state: "executable" }),
  Object.freeze({ id: "multi-emitter", state: "executable" }),
  Object.freeze({ id: "deterministic-replay", state: "executable" }),
  Object.freeze({ id: "emitter-visibility", state: "executable" }),
  Object.freeze({ id: "runtime-parameters", state: "executable" }),
  Object.freeze({ id: "custom-attributes", state: "executable" }),
  Object.freeze({ id: "renderer-semantics", state: "executable" }),
  Object.freeze({ id: "material-particle-inputs", state: "executable" }),
  Object.freeze({
    id: "data-interfaces",
    state: "partial",
    reason: "camera, single-sample scene depth, and noise require generation-owned providers"
  })
]);
function isVfxGpuEffectAsset(value) {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value;
  const program = candidate.program;
  return candidate.kind === "particle-effect" && candidate.schemaVersion === 3 && typeof candidate.guid === "string" && candidate.guid.length > 0 && typeof program === "object" && program !== null && program.format === "forgeax-vfx-program-4" && typeof program.fingerprint === "string" && Array.isArray(program.emitters);
}
function label(path) {
  const leaf = path.split(".").at(-1) ?? path;
  return leaf.replaceAll(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (value) => value.toUpperCase());
}
function authoringValue(value) {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) return Object.freeze(value.map(authoringValue));
  if (typeof value === "object") {
    const out = {};
    for (const [key, child] of Object.entries(value)) out[key] = authoringValue(child);
    return Object.freeze(out);
  }
  return String(value);
}
function valueType(value) {
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (Array.isArray(value) && value.every((entry) => typeof entry === "number")) return "vector";
  if (typeof value === "object" && value !== null) return "object";
  return "text";
}
function field(path, value) {
  const normalized = authoringValue(value);
  return Object.freeze({
    path,
    label: label(path),
    value: normalized,
    valueType: valueType(normalized)
  });
}
function fields(path, value, omit = []) {
  const excluded = new Set(omit);
  return Object.freeze(
    Object.entries(value).filter(([key, child]) => !excluded.has(key) && child !== void 0).map(([key, child]) => field(`${path}.${key}`, child))
  );
}
function node(input) {
  return Object.freeze({ ...input, children: Object.freeze([...input.children ?? []]) });
}
function reflectionNodes(emitter, path) {
  const nodes = [];
  const layout = emitter.reflection.layout;
  if (layout !== void 0 && layout.parameters.fields.length > 0) {
    nodes.push(
      node({
        id: `parameters:${emitter.id}`,
        role: "parameters",
        label: layout.parameters.name,
        sourcePath: `${path}.program`,
        fields: Object.freeze(
          layout.parameters.fields.map(
            (entry) => field(`parameters.${entry.name}`, {
              type: entry.type,
              offset: entry.offset,
              size: entry.size,
              alignment: entry.alignment,
              defaultValue: entry.defaultValue ?? null
            })
          )
        )
      })
    );
  }
  if (layout !== void 0 && layout.custom.fields.length > 0) {
    nodes.push(
      node({
        id: `custom:${emitter.id}`,
        role: "custom",
        label: layout.custom.name,
        sourcePath: `${path}.program`,
        fields: Object.freeze(
          layout.custom.fields.map(
            (entry) => field(`custom.${entry.name}`, {
              type: entry.type,
              offset: entry.offset,
              size: entry.size,
              alignment: entry.alignment,
              defaultValue: entry.defaultValue ?? null
            })
          )
        )
      })
    );
  }
  for (const stage of emitter.reflection.stages ?? []) {
    nodes.push(
      node({
        id: `stage:${emitter.id}:${stage.id}`,
        role: "stage",
        label: stage.id,
        sourcePath: `${path}.program`,
        fields: fields(`stages.${stage.id}`, stage, ["id", "entryPoint"])
      })
    );
  }
  return nodes;
}
function emitterNode(emitter, index) {
  const path = `emitters[${index}]`;
  const children = [
    node({
      id: `program:${emitter.id}`,
      role: "program",
      label: emitter.module,
      sourcePath: `${path}.program.module`,
      fields: Object.freeze([
        field(`${path}.program.module`, emitter.module),
        field(`${path}.program.imports`, emitter.reflection.imports)
      ])
    }),
    ...reflectionNodes(emitter, path),
    ...(emitter.channels ?? []).map(
      (channel, channelIndex) => node({
        id: `channel:${emitter.id}:${channel.id}`,
        role: "channel",
        label: channel.id,
        sourcePath: `${path}.channels[${channelIndex}]`,
        fields: fields(`${path}.channels[${channelIndex}]`, channel, ["id"])
      })
    ),
    ...(emitter.events ?? []).map(
      (event, eventIndex) => node({
        id: `event:${emitter.id}:${event.id}`,
        role: "event",
        label: event.id,
        sourcePath: `${path}.events[${eventIndex}]`,
        fields: fields(`${path}.events[${eventIndex}]`, event, ["id"])
      })
    ),
    ...emitter.renderers.map(
      (renderer, rendererIndex) => node({
        id: `renderer:${emitter.id}:${rendererIndex}`,
        role: "renderer",
        label: `${renderer.kind} renderer`,
        sourcePath: `${path}.renderers[${rendererIndex}]`,
        fields: fields(`${path}.renderers[${rendererIndex}]`, renderer, ["kind"])
      })
    )
  ];
  return Object.freeze({
    id: `emitter:${emitter.id}`,
    role: "emitter",
    label: emitter.id,
    module: emitter.module,
    sourcePath: path,
    fields: Object.freeze([
      field(`${path}.capacity`, emitter.capacity),
      field(`${path}.space`, emitter.space),
      field(`${path}.bounds`, emitter.bounds),
      field(`${path}.simulationWhenCulled`, emitter.simulationWhenCulled)
    ]),
    children: Object.freeze(children)
  });
}
function dependencies(effect) {
  const entries = [];
  const seen = /* @__PURE__ */ new Set();
  const add = (entry) => {
    const key = `${entry.kind}:${entry.identity}`;
    if (seen.has(key)) return;
    seen.add(key);
    entries.push(Object.freeze(entry));
  };
  for (const [emitterIndex, emitter] of effect.program.emitters.entries()) {
    const path = `emitters[${emitterIndex}]`;
    add({ kind: "module", identity: emitter.module, sourcePath: `${path}.program.module` });
    for (const identity of emitter.reflection.imports) {
      add({ kind: "module", identity, sourcePath: `${path}.program.imports` });
    }
    for (const [rendererIndex, renderer] of emitter.renderers.entries()) {
      add({
        kind: "asset",
        identity: renderer.material,
        sourcePath: `${path}.renderers[${rendererIndex}].material`
      });
      if (renderer.kind === "mesh") {
        add({
          kind: "asset",
          identity: renderer.mesh,
          sourcePath: `${path}.renderers[${rendererIndex}].mesh`
        });
      }
    }
    for (const requirement of emitter.reflection.dataInterfaces ?? []) {
      add({ kind: "data-interface", identity: requirement.token, sourcePath: `${path}.program` });
    }
  }
  return Object.freeze(entries);
}
function describeVfxGpuEffect(effect) {
  return Object.freeze({
    version: 1,
    assetGuid: effect.guid,
    schemaVersion: effect.schemaVersion,
    artifactFingerprint: effect.program.fingerprint,
    emitters: Object.freeze(effect.program.emitters.map(emitterNode)),
    timeline: Object.freeze(
      effect.program.emitters.map(
        (emitter) => Object.freeze({
          emitterId: emitter.id,
          rate: emitter.schedule.rate,
          bursts: Object.freeze([...emitter.schedule.bursts ?? []]),
          ...emitter.schedule.loopDuration === void 0 ? {} : { loopDuration: emitter.schedule.loopDuration }
        })
      )
    ),
    dependencies: dependencies(effect),
    capabilities: V3_CAPABILITIES
  });
}
var PARTICLE_CODE_DEFAULT_MODULE_ID = "forgeax_vfx::default";
var PARTICLE_STAGE_RESOURCE_NAMES = Object.freeze([
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
function invalid(path, expected, emitterId, code = "vfx-source-invalid") {
  return err({
    code,
    expected,
    hint: `repair ${path} and recook the particle effect`,
    detail: emitterId === void 0 ? { path } : { path, emitterId }
  });
}
function eventInvalid(code, path, expected, emitterId) {
  return invalid(path, expected, emitterId, code);
}
function record(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function finite(value) {
  return typeof value === "number" && Number.isFinite(value);
}
function positiveInteger(value) {
  return finite(value) && Number.isInteger(value) && value > 0;
}
function nonNegativeInteger(value) {
  return finite(value) && Number.isInteger(value) && value >= 0;
}
function text(value) {
  return typeof value === "string" && value.length > 0;
}
function vector(value, size) {
  return Array.isArray(value) && value.length === size && value.every(finite);
}
function allowed(value, keys) {
  const set = new Set(keys);
  return Object.keys(value).find((key) => !set.has(key));
}
function stageInvalid(path, expected, stageId, resource) {
  return err({
    code: "vfx-source-stage-invalid",
    expected,
    hint: `repair stage ${path} and recook the stage declaration`,
    detail: {
      path,
      ...stageId === void 0 ? {} : { stageId },
      ...resource === void 0 ? {} : { resource }
    }
  });
}
var STAGE_FIELDS = ["entry", "domain", "resources", "dependsOn", "iterationBudget"];
var STAGE_RESOURCE_NAMES = new Set(PARTICLE_STAGE_RESOURCE_NAMES);
function parseStageResources(value, path, stageId) {
  if (value.length === 0)
    return stageInvalid(path, "at least one explicit stage resource", stageId);
  const resources = [];
  const names = /* @__PURE__ */ new Set();
  for (const item of value.split(",")) {
    const [name, access, extra2] = item.split(":");
    if (name === void 0 || access === void 0 || extra2 !== void 0 || !STAGE_RESOURCE_NAMES.has(name) || access !== "read" && access !== "write" && access !== "read-write" || names.has(name)) {
      return stageInvalid(
        path,
        "known resources with unique read, write, or read-write access",
        stageId,
        name
      );
    }
    names.add(name);
    resources.push({ name, access });
  }
  return ok(Object.freeze(resources));
}
function parseVfxStageDeclarations(source) {
  const stages = [];
  const ids = /* @__PURE__ */ new Set();
  const pattern = /^\s*\/\/\s*#vfx\s+stage\s+([^\s]+)\s+(.+)$/gm;
  for (const match of source.matchAll(pattern)) {
    const id = match[1];
    const fieldsText = match[2];
    if (id === void 0 || fieldsText === void 0 || !/^[A-Za-z_]\w*$/.test(id) || ids.has(id)) {
      return stageInvalid(
        `stage.${id ?? "unknown"}`,
        "a unique stage id and supported stage declaration",
        id
      );
    }
    const fields2 = {};
    for (const token of fieldsText.trim().split(/\s+/)) {
      const separator = token.indexOf("=");
      const key = separator < 0 ? void 0 : token.slice(0, separator);
      const value = separator < 0 ? void 0 : token.slice(separator + 1);
      if (key === void 0 || value === void 0 || !STAGE_FIELDS.includes(key) || fields2[key] !== void 0) {
        return stageInvalid(
          `stage.${id}`,
          "a supported stage declaration with entry, domain, resources, dependsOn, and iterationBudget fields",
          id
        );
      }
      fields2[key] = value;
    }
    const entry = fields2.entry;
    const domain = fields2.domain;
    const resourcesValue = fields2.resources;
    const dependsOnValue = fields2.dependsOn;
    const budgetValue = fields2.iterationBudget;
    if (entry === void 0 || !/^[A-Za-z_]\w*$/.test(entry) || entry.startsWith("forgeax_vfx_") || domain !== "particle" || resourcesValue === void 0 || dependsOnValue === void 0 || budgetValue === void 0) {
      return stageInvalid(
        `stage.${id}`,
        "a particle-domain stage with an author entry and explicit fields",
        id
      );
    }
    const resources = parseStageResources(resourcesValue, `stage.${id}.resources`, id);
    if (!resources.ok) return resources;
    const iterationBudget = Number(budgetValue);
    if (!Number.isInteger(iterationBudget) || iterationBudget < 1 || iterationBudget > 64) {
      return stageInvalid(
        `stage.${id}.iterationBudget`,
        "an integer iteration budget from 1 through 64",
        id
      );
    }
    const dependsOn = dependsOnValue === "none" ? [] : dependsOnValue.split(",").filter((dependency) => dependency.length > 0);
    if (dependsOn.some((dependency) => !/^[A-Za-z_]\w*$/.test(dependency))) {
      return stageInvalid(`stage.${id}.dependsOn`, "stage identifiers or none", id);
    }
    ids.add(id);
    stages.push({
      id,
      entry,
      domain: "particle",
      resources: resources.value,
      dependsOn: Object.freeze(dependsOn),
      iterationBudget
    });
  }
  return ok(Object.freeze(stages));
}
function parseEmitter(value, index, ids) {
  const path = `emitters[${index}]`;
  if (!record(value)) return invalid(path, "a Program v3 emitter object");
  const extra2 = allowed(value, [
    "id",
    "capacity",
    "backend",
    "space",
    "bounds",
    "schedule",
    "program",
    "renderers",
    "channels",
    "events",
    "simulationWhenCulled"
  ]);
  if (extra2 !== void 0) return invalid(`${path}.${extra2}`, "a Program v3 emitter field");
  if (!text(value.id) || ids.has(value.id)) return invalid(`${path}.id`, "a unique non-empty id");
  const id = value.id;
  ids.add(id);
  if (!positiveInteger(value.capacity))
    return invalid(`${path}.capacity`, "a positive integer", id);
  if (!record(value.backend) || value.backend.required !== "gpu") {
    return invalid(`${path}.backend`, "the explicit policy { required: 'gpu' }", id);
  }
  const backendExtra = allowed(value.backend, ["required"]);
  if (backendExtra !== void 0) {
    return invalid(`${path}.backend.${backendExtra}`, "the required GPU policy", id);
  }
  if (value.space !== "local" && value.space !== "world") {
    return invalid(`${path}.space`, "local or world", id);
  }
  if (!record(value.bounds)) return invalid(`${path}.bounds`, "fixed aabb or sphere bounds", id);
  const boundsExtra = allowed(
    value.bounds,
    value.bounds.kind === "aabb" ? ["kind", "min", "max"] : value.bounds.kind === "sphere" ? ["kind", "center", "radius"] : ["kind"]
  );
  if (boundsExtra !== void 0) {
    return invalid(`${path}.bounds.${boundsExtra}`, "a supported bounds field", id);
  }
  const boundsOk = value.bounds.kind === "aabb" && vector(value.bounds.min, 3) && vector(value.bounds.max, 3) || value.bounds.kind === "sphere" && vector(value.bounds.center, 3) && finite(value.bounds.radius) && value.bounds.radius > 0;
  if (!boundsOk) return invalid(`${path}.bounds`, "valid fixed aabb or sphere bounds", id);
  if (!record(value.schedule) || !finite(value.schedule.rate) || value.schedule.rate < 0) {
    return invalid(`${path}.schedule`, "a non-negative spawn schedule", id);
  }
  const scheduleExtra = allowed(value.schedule, ["rate", "bursts", "loopDuration"]);
  if (scheduleExtra !== void 0) {
    return invalid(`${path}.schedule.${scheduleExtra}`, "a supported schedule field", id);
  }
  if (value.schedule.bursts !== void 0 && (!Array.isArray(value.schedule.bursts) || value.schedule.bursts.some(
    (burst) => !record(burst) || !finite(burst.time) || burst.time < 0 || !positiveInteger(burst.count)
  ))) {
    return invalid(`${path}.schedule.bursts`, "non-negative timed positive bursts", id);
  }
  if (Array.isArray(value.schedule.bursts)) {
    for (const [burstIndex, burst] of value.schedule.bursts.entries()) {
      if (!record(burst)) continue;
      const burstExtra = allowed(burst, ["time", "count"]);
      if (burstExtra !== void 0) {
        return invalid(
          `${path}.schedule.bursts[${burstIndex}].${burstExtra}`,
          "a supported burst field",
          id
        );
      }
    }
  }
  if (value.schedule.loopDuration !== void 0 && (!finite(value.schedule.loopDuration) || value.schedule.loopDuration <= 0)) {
    return invalid(`${path}.schedule.loopDuration`, "a positive finite duration", id);
  }
  if (!record(value.program) || !text(value.program.module)) {
    return invalid(`${path}.program.module`, "a WGSL module identity", id);
  }
  const programExtra = allowed(value.program, ["module"]);
  if (programExtra !== void 0) {
    return invalid(`${path}.program.${programExtra}`, "a supported program field", id);
  }
  if (!Array.isArray(value.renderers) || value.renderers.length === 0) {
    return invalid(`${path}.renderers`, "at least one renderer", id);
  }
  for (const [rendererIndex, renderer] of value.renderers.entries()) {
    const rendererPath = `${path}.renderers[${rendererIndex}]`;
    if (!record(renderer) || !text(renderer.material) || !text(renderer.kind))
      return invalid(
        rendererPath,
        "a supported renderer object",
        id,
        "vfx-source-renderer-invalid"
      );
    const common = ["kind", "material", "enabled", "capacity", "overflow", "width"];
    const rendererExtra = allowed(
      renderer,
      renderer.kind === "billboard" ? [...common, "blend", "textureSheet", "pivot", "softParticle", "sorting"] : renderer.kind === "mesh" ? ["kind", "material", "mesh", "submesh", "enabled"] : renderer.kind === "ribbon" ? [...common, "stripKey"] : renderer.kind === "trail" ? [...common, "historyLength"] : renderer.kind === "beam" ? [...common, "endpointField"] : ["kind"]
    );
    if (rendererExtra !== void 0)
      return invalid(
        `${rendererPath}.${rendererExtra}`,
        "a supported renderer field",
        id,
        "vfx-source-renderer-invalid"
      );
    if (renderer.kind === "mesh") {
      if (!text(renderer.mesh) || renderer.submesh !== void 0 && !nonNegativeInteger(renderer.submesh))
        return invalid(
          rendererPath,
          "a mesh renderer with a non-negative submesh",
          id,
          "vfx-source-renderer-invalid"
        );
      continue;
    }
    if (renderer.enabled !== void 0 && typeof renderer.enabled !== "boolean")
      return invalid(
        `${rendererPath}.enabled`,
        "a boolean enabled flag",
        id,
        "vfx-source-renderer-invalid"
      );
    if (renderer.capacity !== void 0 && (!positiveInteger(renderer.capacity) || renderer.capacity > 65536))
      return invalid(
        `${rendererPath}.capacity`,
        "a positive capacity no greater than 65536",
        id,
        "vfx-source-renderer-invalid"
      );
    if (renderer.overflow !== void 0 && renderer.overflow !== "drop-newest" && renderer.overflow !== "drop-oldest")
      return invalid(
        `${rendererPath}.overflow`,
        "drop-newest or drop-oldest",
        id,
        "vfx-source-renderer-invalid"
      );
    if (renderer.width !== void 0 && (!finite(renderer.width) || renderer.width <= 0))
      return invalid(
        `${rendererPath}.width`,
        "a positive finite width",
        id,
        "vfx-source-renderer-invalid"
      );
    if (renderer.kind === "billboard") {
      if (renderer.blend !== void 0 && renderer.blend !== "additive" && renderer.blend !== "alpha" && renderer.blend !== "opaque-cutout")
        return invalid(
          `${rendererPath}.blend`,
          "additive, alpha, or opaque-cutout",
          id,
          "vfx-source-renderer-invalid"
        );
      if (renderer.sorting !== void 0 && renderer.sorting !== "none" && renderer.sorting !== "emitter" && renderer.sorting !== "back-to-front")
        return invalid(
          `${rendererPath}.sorting`,
          "none, emitter, or back-to-front",
          id,
          "vfx-source-renderer-invalid"
        );
      if (renderer.pivot !== void 0 && (!vector(renderer.pivot, 2) || renderer.pivot.some((value2) => value2 < -1 || value2 > 1)))
        return invalid(
          `${rendererPath}.pivot`,
          "two finite values in the -1..1 range",
          id,
          "vfx-source-renderer-invalid"
        );
      if (renderer.textureSheet !== void 0 && !record(renderer.textureSheet))
        return invalid(
          `${rendererPath}.textureSheet`,
          "a texture sheet object",
          id,
          "vfx-source-renderer-invalid"
        );
      if (renderer.textureSheet !== void 0 && record(renderer.textureSheet)) {
        const sheet = renderer.textureSheet;
        const sheetExtra = allowed(sheet, ["columns", "rows", "frameRate", "frameCount"]);
        if (sheetExtra !== void 0 || !positiveInteger(sheet.columns) || !positiveInteger(sheet.rows) || sheet.columns > 64 || sheet.rows > 64 || !finite(sheet.frameRate) || sheet.frameRate < 0 || sheet.frameCount !== void 0 && (!positiveInteger(sheet.frameCount) || sheet.frameCount > sheet.columns * sheet.rows))
          return invalid(
            `${rendererPath}.textureSheet`,
            "a bounded texture sheet declaration",
            id,
            "vfx-source-renderer-invalid"
          );
      }
      if (renderer.softParticle !== void 0 && !record(renderer.softParticle))
        return invalid(
          `${rendererPath}.softParticle`,
          "a soft-particle object",
          id,
          "vfx-source-renderer-invalid"
        );
      if (renderer.softParticle !== void 0 && record(renderer.softParticle)) {
        const softExtra = allowed(renderer.softParticle, ["fadeDistance"]);
        if (softExtra !== void 0 || !finite(renderer.softParticle.fadeDistance) || renderer.softParticle.fadeDistance <= 0)
          return invalid(
            `${rendererPath}.softParticle`,
            "a positive scene-depth fade distance",
            id,
            "vfx-source-renderer-invalid"
          );
      }
    } else if (renderer.kind === "ribbon") {
      if (renderer.stripKey !== "alive-index" || !positiveInteger(renderer.capacity))
        return invalid(
          rendererPath,
          "stripKey 'alive-index' and positive capacity",
          id,
          "vfx-source-renderer-invalid"
        );
    } else if (renderer.kind === "trail") {
      if (!positiveInteger(renderer.historyLength) || renderer.historyLength > 256 || !positiveInteger(renderer.capacity))
        return invalid(
          rendererPath,
          "a bounded trail historyLength and positive capacity",
          id,
          "vfx-source-renderer-invalid"
        );
    } else if (renderer.kind === "beam") {
      if (renderer.endpointField !== "velocity" || !positiveInteger(renderer.capacity))
        return invalid(
          rendererPath,
          "endpointField 'velocity' and positive capacity",
          id,
          "vfx-source-renderer-invalid"
        );
    } else {
      return invalid(
        rendererPath,
        "billboard, mesh, ribbon, trail, or beam",
        id,
        "vfx-source-renderer-invalid"
      );
    }
  }
  if (value.channels !== void 0) {
    if (!Array.isArray(value.channels) || value.channels.length === 0) {
      return eventInvalid(
        "vfx-source-channel-invalid",
        `${path}.channels`,
        "a non-empty bounded channel list",
        id
      );
    }
    const channelIds = /* @__PURE__ */ new Set();
    for (const [channelIndex, channel] of value.channels.entries()) {
      const channelPath = `${path}.channels[${channelIndex}]`;
      if (!record(channel)) {
        return eventInvalid("vfx-source-channel-invalid", channelPath, "a channel object", id);
      }
      const channelExtra = allowed(channel, ["id", "payload", "capacity", "overflow"]);
      if (channelExtra !== void 0) {
        return eventInvalid(
          "vfx-source-channel-invalid",
          `${channelPath}.${channelExtra}`,
          "a supported channel field",
          id
        );
      }
      if (!text(channel.id) || channelIds.has(channel.id)) {
        return eventInvalid(
          "vfx-source-channel-invalid",
          `${channelPath}.id`,
          "a unique non-empty channel id",
          id
        );
      }
      if (!positiveInteger(channel.capacity) || channel.capacity > 65536 || channel.payload !== void 0 && channel.payload !== "impact" || channel.overflow !== "drop-newest" && channel.overflow !== "drop-oldest") {
        return eventInvalid(
          "vfx-source-channel-invalid",
          channelPath,
          "an impact channel with capacity 1..65536 and explicit overflow policy",
          id
        );
      }
      channelIds.add(channel.id);
    }
  }
  if (value.events !== void 0) {
    if (!Array.isArray(value.events)) {
      return eventInvalid("vfx-source-event-invalid", `${path}.events`, "an event list", id);
    }
    const eventIds = /* @__PURE__ */ new Set();
    for (const [eventIndex, event] of value.events.entries()) {
      const eventPath = `${path}.events[${eventIndex}]`;
      if (!record(event)) {
        return eventInvalid("vfx-source-event-invalid", eventPath, "an event object", id);
      }
      const eventExtra = allowed(event, [
        "id",
        "channel",
        "subEmitter",
        "fanOut",
        "recursionDepth"
      ]);
      if (eventExtra !== void 0) {
        return eventInvalid(
          "vfx-source-event-invalid",
          `${eventPath}.${eventExtra}`,
          "a supported event field",
          id
        );
      }
      if (!text(event.id) || eventIds.has(event.id)) {
        return eventInvalid("vfx-source-event-invalid", `${eventPath}.id`, "a unique event id", id);
      }
      if (!text(event.channel) || !text(event.subEmitter) || !positiveInteger(event.fanOut) || event.fanOut > 16 || !positiveInteger(event.recursionDepth) || event.recursionDepth > 8) {
        return eventInvalid(
          "vfx-source-event-invalid",
          eventPath,
          "an event with bounded fanOut 1..16 and recursionDepth 1..8",
          id
        );
      }
      eventIds.add(event.id);
    }
  }
  if (value.simulationWhenCulled !== void 0 && value.simulationWhenCulled !== "continue" && value.simulationWhenCulled !== "pause" && value.simulationWhenCulled !== "restart-on-visible") {
    return invalid(`${path}.simulationWhenCulled`, "continue, pause, or restart-on-visible", id);
  }
  return ok(value);
}
function parseParticleEffectSourceStructure(value) {
  if (!record(value)) return invalid("$", "a particle effect source object");
  const extra2 = allowed(value, ["schemaVersion", "emitters"]);
  if (extra2 !== void 0) return invalid(extra2, "a root field: emitters");
  if (!Array.isArray(value.emitters) || value.emitters.length === 0) {
    return invalid("emitters", "at least one Program v3 emitter");
  }
  const ids = /* @__PURE__ */ new Set();
  const emitters = [];
  for (const [index, emitter] of value.emitters.entries()) {
    const parsed = parseEmitter(emitter, index, ids);
    if (!parsed.ok) return parsed;
    emitters.push(parsed.value);
  }
  const emitterIds = new Set(emitters.map((emitter) => emitter.id));
  for (const emitter of emitters) {
    const channels = new Set((emitter.channels ?? []).map((channel) => channel.id));
    for (const event of emitter.events ?? []) {
      if (!channels.has(event.channel)) {
        return eventInvalid(
          "vfx-source-event-invalid",
          `emitters[${emitters.indexOf(emitter)}].events.${event.id}.channel`,
          "the id of a channel declared on the same emitter",
          emitter.id
        );
      }
      if (!emitterIds.has(event.subEmitter)) {
        return eventInvalid(
          "vfx-source-event-invalid",
          `emitters[${emitters.indexOf(emitter)}].events.${event.id}.subEmitter`,
          "the id of an emitter in the same cooked effect",
          emitter.id
        );
      }
    }
  }
  return ok(
    Object.freeze({
      schemaVersion: 3,
      emitters: Object.freeze(emitters)
    })
  );
}
var PARTICLE_RENDERER_SEMANTICS = Object.freeze({
  billboard: Object.freeze([
    "position",
    "color",
    "size",
    "rotation",
    "age",
    "subImage",
    "sort",
    "visibility"
  ]),
  mesh: Object.freeze(["position", "color", "orientation", "scale", "sort", "visibility"]),
  ribbon: Object.freeze(["position", "color", "width"]),
  trail: Object.freeze(["position", "color", "width", "taper"]),
  beam: Object.freeze(["position", "endpoint", "color", "width"])
});
function coreAttribute(name) {
  return { source: "core", name };
}
function defaultParticleRendererAttributes(kind) {
  switch (kind) {
    case "billboard":
      return {
        position: coreAttribute("position"),
        color: coreAttribute("color"),
        size: coreAttribute("sprite_size"),
        rotation: coreAttribute("sprite_rotation"),
        age: coreAttribute("age"),
        visibility: coreAttribute("alive")
      };
    case "mesh":
      return {
        position: coreAttribute("position"),
        color: coreAttribute("color"),
        orientation: coreAttribute("mesh_orientation"),
        scale: coreAttribute("mesh_scale"),
        visibility: coreAttribute("alive")
      };
    case "ribbon":
      return {
        position: coreAttribute("position"),
        color: coreAttribute("color")
      };
    case "trail":
      return {
        position: coreAttribute("position"),
        color: coreAttribute("color")
      };
    case "beam":
      return {
        position: coreAttribute("position"),
        endpoint: coreAttribute("velocity"),
        color: coreAttribute("color")
      };
  }
}
function record2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function fail(path, expected) {
  return err({
    code: "vfx-source-invalid",
    expected,
    hint: `repair ${path} and recook the Program v3 particle effect`,
    detail: { path }
  });
}
function extra(value, allowed2) {
  const keys = new Set(allowed2);
  return Object.keys(value).find((key) => !keys.has(key));
}
var CORE_NAMES = /* @__PURE__ */ new Set([
  "position",
  "age",
  "velocity",
  "lifetime",
  "color",
  "sprite_size",
  "sprite_rotation",
  "sub_image",
  "mesh_orientation",
  "mesh_scale",
  "material_random",
  "id",
  "alive"
]);
function validateAttributes(value, path) {
  if (value === void 0) return ok(void 0);
  if (!record2(value)) return fail(path, "a semantic-to-attribute object");
  for (const [semantic, reference] of Object.entries(value)) {
    if (!record2(reference) || reference.source !== "core" && reference.source !== "custom") {
      return fail(`${path}.${semantic}`, "{ source: 'core' | 'custom', name: string }");
    }
    if (typeof reference.name !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(reference.name)) {
      return fail(`${path}.${semantic}.name`, "a non-empty identifier");
    }
    if (reference.source === "core" && !CORE_NAMES.has(reference.name)) {
      return fail(`${path}.${semantic}.name`, "a VfxParticle core attribute");
    }
    const referenceExtra = extra(reference, ["source", "name"]);
    if (referenceExtra !== void 0)
      return fail(`${path}.${semantic}.${referenceExtra}`, "source and name only");
  }
  return ok(value);
}
function validateMaterialInputs(value, path) {
  if (value === void 0) return ok(void 0);
  if (!Array.isArray(value) || value.length > 4 || value.some((entry) => typeof entry !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(entry))) {
    return fail(path, "at most four unique particle input names");
  }
  if (new Set(value).size !== value.length) return fail(path, "unique particle input names");
  return ok(Object.freeze([...value]));
}
function rendererAllowed(kind) {
  const common = [
    "kind",
    "material",
    "enabled",
    "capacity",
    "overflow",
    "width",
    "attributes",
    "materialInputs"
  ];
  switch (kind) {
    case "billboard":
      return [...common, "blend", "textureSheet", "pivot", "softParticle", "sorting"];
    case "mesh":
      return [
        "kind",
        "material",
        "mesh",
        "submesh",
        "sorting",
        "enabled",
        "attributes",
        "materialInputs",
        "lighting",
        "castShadows",
        "receiveShadows"
      ];
    case "ribbon":
      return [...common, "stripKey", "twist", "facing"];
    case "trail":
      return [...common, "historyLength", "taper"];
    case "beam":
      return [...common, "endpointField", "taper"];
    default:
      return ["kind"];
  }
}
function asStructureRenderer(value) {
  const common = ["kind", "material", "enabled", "capacity", "overflow", "width"];
  const result = {};
  for (const key of common) if (value[key] !== void 0) result[key] = value[key];
  switch (value.kind) {
    case "billboard":
      for (const key of ["blend", "textureSheet", "pivot", "softParticle"])
        if (value[key] !== void 0) result[key] = value[key];
      if (value.sorting === "view-depth" || value.sorting === "view-distance")
        result.sorting = "back-to-front";
      else if (value.sorting === "custom-ascending" || value.sorting === "custom-descending")
        result.sorting = "emitter";
      else if (value.sorting !== void 0) result.sorting = value.sorting;
      break;
    case "mesh":
      for (const key of ["mesh", "submesh"])
        if (value[key] !== void 0) result[key] = value[key];
      break;
    case "ribbon":
      result.stripKey = value.stripKey;
      break;
    case "trail":
      result.historyLength = value.historyLength;
      break;
    case "beam":
      result.endpointField = value.endpointField;
      break;
  }
  return result;
}
function validateRenderer(value, emitterIndex, index) {
  const path = `emitters[${emitterIndex}].renderers[${index}]`;
  if (!record2(value) || typeof value.kind !== "string" || typeof value.material !== "string") {
    return fail(path, "a Program v3 renderer object");
  }
  const unknown = extra(value, rendererAllowed(value.kind));
  if (unknown !== void 0)
    return fail(`${path}.${unknown}`, "a supported Program v3 renderer field");
  if (value.lighting !== void 0 && value.lighting !== "unlit" && value.lighting !== "standard")
    return fail(`${path}.lighting`, "unlit or standard");
  for (const field2 of ["castShadows", "receiveShadows"]) {
    if (value[field2] !== void 0 && typeof value[field2] !== "boolean")
      return fail(`${path}.${field2}`, "a boolean");
  }
  for (const field2 of ["twist", "taper"]) {
    if (value[field2] !== void 0 && (typeof value[field2] !== "number" || !Number.isFinite(value[field2])))
      return fail(`${path}.${field2}`, "a finite number");
  }
  if (value.facing !== void 0 && value.facing !== "camera" && value.facing !== "velocity" && value.facing !== "custom")
    return fail(`${path}.facing`, "camera, velocity, or custom");
  if (value.sorting !== void 0 && (value.kind === "billboard" || value.kind === "mesh") && !["none", "view-depth", "view-distance", "custom-ascending", "custom-descending"].includes(
    value.sorting
  ))
    return fail(`${path}.sorting`, "a Program v3 sorting mode");
  const attrs = validateAttributes(value.attributes, `${path}.attributes`);
  if (!attrs.ok) return attrs;
  if (attrs.value !== void 0) {
    for (const semantic of Object.keys(attrs.value)) {
      if (!PARTICLE_RENDERER_SEMANTICS[value.kind]?.includes(
        semantic
      )) {
        return fail(
          `${path}.attributes.${semantic}`,
          "a semantic supported by this renderer topology"
        );
      }
    }
  }
  const inputs = validateMaterialInputs(value.materialInputs, `${path}.materialInputs`);
  if (!inputs.ok) return inputs;
  return ok({
    ...value,
    ...attrs.value === void 0 ? {} : { attributes: attrs.value },
    ...inputs.value === void 0 ? {} : { materialInputs: inputs.value }
  });
}
function parseParticleEffectSourceV3(value) {
  if (!record2(value)) return fail("$", "a Program v3 particle effect source object");
  if (value.schemaVersion !== 3) {
    return err({
      code: "vfx-source-version-unsupported",
      expected: "ParticleEffectSource schemaVersion 3",
      hint: "cold-cook the source with the Program v3 compiler; older versions are not executable",
      detail: { path: "schemaVersion" }
    });
  }
  const rootExtra = extra(value, ["schemaVersion", "emitters"]);
  if (rootExtra !== void 0) return fail(rootExtra, "schemaVersion and emitters only");
  if (!Array.isArray(value.emitters) || value.emitters.length === 0)
    return fail("emitters", "at least one Program v3 emitter");
  const renderers = /* @__PURE__ */ new Map();
  for (const [emitterIndex, emitter] of value.emitters.entries()) {
    if (record2(emitter) && Array.isArray(emitter.renderers)) {
      const parsed2 = [];
      for (const [index, renderer] of emitter.renderers.entries()) {
        const result = validateRenderer(renderer, emitterIndex, index);
        if (!result.ok) return result;
        parsed2.push(result.value);
      }
      renderers.set(typeof emitter.id === "string" ? emitter.id : String(renderers.size), parsed2);
    }
  }
  const structuralInput = {
    schemaVersion: 3,
    emitters: value.emitters.map((emitter) => {
      if (!record2(emitter)) return emitter;
      return {
        ...emitter,
        renderers: Array.isArray(emitter.renderers) ? emitter.renderers.map(
          (renderer) => record2(renderer) ? asStructureRenderer(renderer) : renderer
        ) : emitter.renderers
      };
    })
  };
  const parsed = parseParticleEffectSourceStructure(structuralInput);
  if (!parsed.ok) return parsed;
  const emitters = parsed.value.emitters.map((emitter) => ({
    ...emitter,
    renderers: renderers.get(emitter.id) ?? []
  }));
  return ok(Object.freeze({ schemaVersion: 3, emitters: Object.freeze(emitters) }));
}
function defineParticleEffectSourceV3(source) {
  const parsed = parseParticleEffectSourceV3(source);
  if (!parsed.ok) throw new TypeError(`${parsed.error.code}: ${parsed.error.expected}`);
  return source;
}
function expectedResourceKind(kind) {
  switch (kind) {
    case "camera":
      return "buffer";
    case "scene-depth":
    case "noise":
      return "texture-view";
  }
}
function failure(code, requirement, expected, hint, detail = {}) {
  return { code, expected, hint, detail: { token: requirement.token, ...detail } };
}
function resolveVfxDataInterfaces(requirements, providers, generation) {
  const byToken = /* @__PURE__ */ new Map();
  for (const provider of providers) {
    const prior = byToken.get(provider.token);
    if (prior !== void 0) {
      const requirement = requirements.find((entry) => entry.token === provider.token) ?? {
        token: provider.token,
        kind: provider.kind,
        bindingType: provider.bindingType};
      return err(
        failure(
          "vfx-data-interface-duplicate",
          requirement,
          "at most one provider for each reflected Data Interface token",
          `remove duplicate providers ${prior.id} and ${provider.id} and retry`,
          { providerId: provider.id }
        )
      );
    }
    byToken.set(provider.token, provider);
  }
  const resources = [];
  for (const requirement of requirements) {
    const provider = byToken.get(requirement.token);
    if (provider === void 0) {
      return err(
        failure(
          "vfx-data-interface-missing",
          requirement,
          `a registered ${requirement.kind} provider for ${requirement.token}`,
          `register ${requirement.token} for generation ${generation} before starting the effect`
        )
      );
    }
    if (provider.kind !== requirement.kind || provider.bindingType !== requirement.bindingType) {
      return err(
        failure(
          "vfx-data-interface-wrong-type",
          requirement,
          `${requirement.kind} with ${requirement.bindingType} binding semantics`,
          `replace provider ${provider.id} with a ${requirement.token} provider matching reflection`,
          {
            providerId: provider.id,
            expectedBindingType: requirement.bindingType,
            actualBindingType: provider.bindingType
          }
        )
      );
    }
    const provided = provider.provide(generation);
    if (!provided.ok) return provided;
    const resource = provided.value;
    if (resource.token !== requirement.token || resource.kind !== requirement.kind) {
      return err(
        failure(
          "vfx-data-interface-wrong-type",
          requirement,
          `${requirement.kind} resource for ${requirement.token}`,
          `repair provider ${provider.id} so its resource matches its reflected token`,
          { providerId: provider.id }
        )
      );
    }
    if (resource.bindingType !== requirement.bindingType) {
      return err(
        failure(
          "vfx-data-interface-wrong-type",
          requirement,
          `resource binding type ${requirement.bindingType}`,
          `repair provider ${provider.id} resource binding metadata`,
          {
            providerId: provider.id,
            expectedBindingType: requirement.bindingType,
            actualBindingType: resource.bindingType
          }
        )
      );
    }
    const expectedKind = expectedResourceKind(requirement.kind);
    if (resource.resource === void 0) {
      return err(
        failure(
          "vfx-data-interface-missing",
          requirement,
          `${requirement.kind} backed by a resident ${expectedKind} resource`,
          `refresh provider ${provider.id} with a generation-owned resource before dispatch`,
          { providerId: provider.id, expectedResourceKind: expectedKind }
        )
      );
    }
    if (resource.resource.kind !== expectedKind) {
      return err(
        failure(
          "vfx-data-interface-wrong-type",
          requirement,
          `${requirement.kind} backed by a ${expectedKind} resource`,
          `repair provider ${provider.id} so its opaque resource matches the reflected binding kind`,
          {
            providerId: provider.id,
            expectedResourceKind: expectedKind,
            actualResourceKind: resource.resource.kind
          }
        )
      );
    }
    if (requirement.sampleCount !== void 0 && resource.sampleCount !== requirement.sampleCount) {
      return err(
        failure(
          "vfx-data-interface-wrong-type",
          requirement,
          `a scene-depth resource with sampleCount=${requirement.sampleCount}`,
          `provide a single-sample scene depth target for ${provider.id}; MSAA resolve is not implicit`,
          { providerId: provider.id }
        )
      );
    }
    if (resource.generation !== generation) {
      return err(
        failure(
          "vfx-data-interface-stale",
          requirement,
          `a resource from generation ${generation}`,
          `refresh provider ${provider.id} for generation ${generation} before rendering`,
          {
            providerId: provider.id,
            expectedGeneration: generation,
            actualGeneration: resource.generation
          }
        )
      );
    }
    resources.push(resource);
  }
  return ok({ generation, readiness: "ready", resources: Object.freeze(resources) });
}
var VECTOR_LENGTH = {
  f32: 1,
  i32: 1,
  u32: 1,
  "vec2<f32>": 2,
  "vec3<f32>": 3,
  "vec4<f32>": 4
};
function fieldList(reflection, includeCustom = false) {
  return includeCustom ? [...reflection.parameters.fields, ...reflection.custom.fields] : reflection.parameters.fields;
}
function zeroValue(type) {
  const length = VECTOR_LENGTH[type];
  return length === 1 ? 0 : Array.from({ length }, () => 0);
}
function valueMatches(type, value) {
  const length = VECTOR_LENGTH[type];
  if (length === 1) return typeof value === "number" && Number.isFinite(value);
  return Array.isArray(value) && value.length === length && value.every((component) => typeof component === "number" && Number.isFinite(component));
}
function fail2(code, path, expected, hint, actual) {
  return err({
    code,
    expected,
    hint,
    detail: actual === void 0 ? { path } : { path, actual }
  });
}
function validateReflection(reflection) {
  if (reflection.version !== 3 || typeof reflection.fingerprint !== "string" || !reflection.fingerprint.startsWith("sha256:")) {
    return fail2(
      "vfx-reflection-invalid",
      "reflection",
      "a version 3 reflection with a sha256 fingerprint",
      "recook the effect with the current VFX compiler"
    );
  }
  if (reflection.core.name !== "VfxParticle" || reflection.core.stride !== 112 || reflection.core.fields.length === 0 || reflection.customLayout.name !== "VfxCustom" || reflection.customLayout.stride < 0 || reflection.customLayout.lanes < 0) {
    return fail2(
      "vfx-reflection-invalid",
      "reflection.core",
      "Program v3 Core and Custom layouts derived from the particle schema",
      "recook the effect with the current VFX compiler"
    );
  }
  const names = /* @__PURE__ */ new Set();
  for (const field2 of fieldList(reflection)) {
    if (names.has(field2.name)) {
      return fail2(
        "vfx-reflection-invalid",
        field2.name,
        "unique field names across parameters and custom data",
        "rename the duplicate WGSL field and recook"
      );
    }
    names.add(field2.name);
  }
  return ok(true);
}
function defaultsFor(reflection) {
  const defaults = {};
  for (const field2 of fieldList(reflection)) {
    defaults[field2.name] = field2.defaultValue === void 0 ? zeroValue(field2.type) : field2.defaultValue;
  }
  return Object.freeze(defaults);
}
function validateMap(reflection, values) {
  return validateMapAgainstFields(fieldList(reflection), values);
}
function validateMapAgainstFields(reflectedFields, values) {
  const fields2 = new Map(reflectedFields.map((field2) => [field2.name, field2]));
  for (const name of Object.keys(values)) {
    const field2 = fields2.get(name);
    if (field2 === void 0) {
      return fail2(
        "vfx-value-unknown-field",
        name,
        "a field declared by the selected VFX data scope",
        `remove ${name} or declare it in the authored WGSL struct`,
        values[name]
      );
    }
    if (!valueMatches(field2.type, values[name])) {
      return fail2(
        "vfx-value-type-mismatch",
        name,
        field2.type,
        `provide ${name} as ${field2.type}`,
        values[name]
      );
    }
  }
  return ok(Object.freeze({ ...values }));
}
function writeValue(view, offset, type, value) {
  const values = typeof value === "number" ? [value] : value;
  for (let index = 0; index < values.length; index += 1) {
    const component = values[index] ?? 0;
    if (type === "i32") view.setInt32(offset + index * 4, component, true);
    else if (type === "u32") view.setUint32(offset + index * 4, component, true);
    else view.setFloat32(offset + index * 4, component, true);
  }
}
function createVfxEffectContract(reflection) {
  const checked = validateReflection(reflection);
  if (!checked.ok) throw new TypeError(checked.error.hint);
  const defaults = defaultsFor(reflection);
  const customBase = reflection.parameters.size;
  const parameterSize = reflection.parameters.size;
  const customStride = reflection.customLayout.stride;
  const packedSize = customBase;
  const packFields = (values, selected, size, baseOffset) => {
    const checkedValues = validateMapAgainstFields(selected, values);
    if (!checkedValues.ok) return checkedValues;
    const bytes = new Uint8Array(size);
    const view = new DataView(bytes.buffer);
    for (const field2 of selected) {
      const value = checkedValues.value[field2.name];
      if (value === void 0) continue;
      writeValue(view, baseOffset + field2.offset, field2.type, value);
    }
    return ok(bytes);
  };
  return {
    reflection,
    fingerprint: reflection.fingerprint,
    packedSize,
    parameterSize: reflection.parameters.size,
    customStride,
    defaults,
    createValues(initial = {}) {
      const merged = { ...defaults, ...initial };
      return validateMap(reflection, merged);
    },
    validateValues(values) {
      return validateMap(reflection, values);
    },
    pack(values) {
      return packFields(values, reflection.parameters.fields, parameterSize, 0);
    },
    packParameters(values) {
      return packFields(values, reflection.parameters.fields, parameterSize, 0);
    },
    packCustom(values) {
      return packFields(values, reflection.custom.fields, customStride, 0);
    }
  };
}
function validateVfxEffectValues(reflection, values) {
  return validateMap(reflection, values);
}

// src/gpu-program.ts
var VFX_GPU_PROGRAM_FORMAT = "forgeax-vfx-program-4";
var VFX_GPU_PROGRAM_ARTIFACT_KEY = "particle-effect/program.json";

// src/gpu-loader.ts
function failure2(code, guid, path, expected, hint) {
  return err({ code, expected, hint, detail: { guid, path } });
}
function record3(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function hex(bytes) {
  return [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, "0")).join("");
}
async function fingerprint(bytes) {
  const source = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  );
  return `sha256:${hex(await globalThis.crypto.subtle.digest("SHA-256", source))}`;
}
function validReflectionLayout(value) {
  if (value === void 0) return true;
  if (!record3(value) || value.version !== 3) return false;
  if (!record3(value.parameters) || !Array.isArray(value.parameters.fields)) return false;
  if (!record3(value.custom) || !Array.isArray(value.custom.fields)) return false;
  if (value.version === 3) {
    if (!record3(value.core) || value.core.name !== "VfxParticle" || value.core.stride !== 112) {
      return false;
    }
    if (!record3(value.customLayout) || value.customLayout.name !== "VfxCustom") return false;
  }
  return typeof value.fingerprint === "string" && value.fingerprint.startsWith("sha256:");
}
function stableLayouts(emitters) {
  const fingerprints = emitters.map((emitter) => emitter.reflection.layout?.fingerprint).filter((fingerprint2) => fingerprint2 !== void 0);
  return fingerprints.every((fingerprint2) => fingerprint2 === fingerprints[0]);
}
function validEmitter(value) {
  const reflection = record3(value) && record3(value.reflection) ? value.reflection : void 0;
  const layout = reflection !== void 0 ? reflection.layout : void 0;
  return record3(value) && typeof value.id === "string" && typeof value.module === "string" && value.module.length > 0 && Number.isInteger(value.capacity) && value.capacity > 0 && record3(value.backend) && value.backend.required === "gpu" && Object.keys(value.backend).length === 1 && typeof value.wgsl === "string" && value.wgsl.length > 0 && record3(value.reflection) && validReflectionLayout(layout) && Array.isArray(value.reflection.entryPoints) && value.reflection.entryPoints.includes("forgeax_vfx_spawn_main") && value.reflection.entryPoints.includes("forgeax_vfx_compact_main") && value.reflection.entryPoints.includes("forgeax_vfx_billboard_main") && value.reflection.entryPoints.includes("forgeax_vfx_mesh_main") && value.reflection.entryPoints.includes("forgeax_vfx_ribbon_main") && value.reflection.entryPoints.includes("forgeax_vfx_trail_main") && value.reflection.entryPoints.includes("forgeax_vfx_beam_main") && layout !== void 0 && record3(layout) && Array.isArray(reflection?.bindings) && Array.isArray(reflection?.dataInterfaces) && Array.isArray(reflection?.renderers) && Array.isArray(reflection?.resources);
}
var vfxGpuEffectPackLoader = {
  kind: "particle-effect",
  async load(input, _context) {
    const schemaVersion = input.payload.schemaVersion;
    if (schemaVersion !== 3) {
      return failure2(
        "vfx-asset-version-unsupported",
        input.guid,
        "schemaVersion",
        "schemaVersion 3 / forgeax-vfx-program-4",
        "cold-cook the older source and publish a program format 4 payload; older versions are not executable"
      );
    }
    const invalidCode = "vfx-asset-v3-invalid";
    const missingCode = "vfx-asset-v3-program-missing";
    const fingerprintCode = "vfx-asset-v3-fingerprint-mismatch";
    const expectedFormat = VFX_GPU_PROGRAM_FORMAT;
    if (input.payload.kind !== "particle-effect" || !Array.isArray(input.payload.emitters) || typeof input.payload.programFingerprint !== "string" || !record3(input.payload.program)) {
      return failure2(
        invalidCode,
        input.guid,
        "payload",
        "a schemaVersion 3 particle payload with its complete cooked program and fingerprint",
        "cold-cook the source with the current VFX compiler and retry the load"
      );
    }
    const artifact = input.artifacts[VFX_GPU_PROGRAM_ARTIFACT_KEY];
    if (artifact === void 0) {
      return failure2(
        missingCode,
        input.guid,
        VFX_GPU_PROGRAM_ARTIFACT_KEY,
        "the asset-local cooked VFX program",
        "recook the particle effect and retry the load"
      );
    }
    let decoded;
    try {
      decoded = JSON.parse(new TextDecoder().decode(artifact.bytes));
    } catch {
      return failure2(
        invalidCode,
        input.guid,
        VFX_GPU_PROGRAM_ARTIFACT_KEY,
        "canonical JSON program bytes",
        "recook the particle effect and retry the load"
      );
    }
    if (!record3(decoded) || decoded.format !== expectedFormat || !Array.isArray(decoded.emitters) || !decoded.emitters.every((emitter) => validEmitter(emitter)) || !stableLayouts(decoded.emitters)) {
      return failure2(
        invalidCode,
        input.guid,
        VFX_GPU_PROGRAM_ARTIFACT_KEY,
        `a ${expectedFormat} managed GPU program`,
        "recook with the current VFX compiler ABI"
      );
    }
    const decodedEmitters = decoded.emitters;
    if (input.payload.program.format !== expectedFormat || input.payload.program.fingerprint !== input.payload.programFingerprint || !Array.isArray(input.payload.program.emitters)) {
      return failure2(
        invalidCode,
        input.guid,
        "payload.program",
        "the complete canonical program matching payload.programFingerprint",
        "recook the particle effect atomically"
      );
    }
    const actualFingerprint = await fingerprint(artifact.bytes);
    if (actualFingerprint !== input.payload.programFingerprint) {
      return failure2(
        fingerprintCode,
        input.guid,
        "payload.programFingerprint",
        "payload and program artifact fingerprints to match",
        "cold-cook the particle asset so payload and artifact publish atomically"
      );
    }
    const emitters = input.payload.emitters.map((value) => {
      if (!record3(value) || typeof value.id !== "string" || !Number.isInteger(value.capacity)) {
        return void 0;
      }
      return { id: value.id, capacity: value.capacity };
    });
    if (emitters.some((value) => value === void 0) || emitters.length !== decodedEmitters.length || emitters.some(
      (value, index) => value?.id !== decodedEmitters[index]?.id || value?.capacity !== decodedEmitters[index]?.capacity
    )) {
      return failure2(
        invalidCode,
        input.guid,
        "payload.emitters",
        "payload emitter identities and capacities to match the program",
        "recook the particle effect atomically"
      );
    }
    return ok(
      Object.freeze({
        guid: input.guid,
        kind: "particle-effect",
        schemaVersion: 3,
        programFingerprint: actualFingerprint,
        emitters: Object.freeze(emitters),
        program: Object.freeze({
          format: expectedFormat,
          fingerprint: actualFingerprint,
          emitters: Object.freeze(decodedEmitters)
        })
      })
    );
  }
};
var vfxGpuEffectContribution = {
  kind: { kind: "particle-effect" },
  consumer: "VfxGpuRuntime",
  decoder: {
    async decode({ envelope, artifacts }) {
      const descriptor = envelope.artifacts[VFX_GPU_PROGRAM_ARTIFACT_KEY];
      const bytes = descriptor === void 0 ? void 0 : await artifacts.read(descriptor);
      if (bytes !== void 0 && !bytes.ok) return bytes;
      const result = await vfxGpuEffectPackLoader.load(
        {
          guid: envelope.guid,
          kind: envelope.kind,
          payload: envelope.payload,
          artifacts: bytes === void 0 || descriptor === void 0 ? {} : {
            [VFX_GPU_PROGRAM_ARTIFACT_KEY]: {
              descriptor: { path: descriptor.path, mediaType: descriptor.mediaType },
              bytes: bytes.value
            }
          }
        },
        {}
      );
      if (result.ok) return result;
      const error = {
        code: "asset-package-invalid",
        expected: result.error.expected,
        hint: result.error.hint,
        detail: { guid: envelope.guid, reason: result.error.code }
      };
      return err(error);
    }
  }
};
async function loadVfxGpuEffect(registry, guid) {
  if ("load" in registry) {
    return registry.load(guid, vfxGpuEffectContribution.kind);
  }
  let parsed;
  try {
    parsed = registry.parseGuid(guid);
  } catch (error) {
    return err(error);
  }
  return registry.loadByGuid(parsed);
}
function failure3(code, path, expected, hint, actual) {
  return err({
    code,
    expected,
    hint,
    detail: actual === void 0 ? { path } : { path, actual }
  });
}
function allFields(contract) {
  return [...contract.reflection.parameters.fields, ...contract.reflection.custom.fields];
}
function normalizeValue(type, value) {
  const normalize = (component) => {
    if (type === "i32" || type === "u32") return Math.trunc(component);
    return Math.fround(component);
  };
  return typeof value === "number" ? normalize(value) : value.map(normalize);
}
function canonicalBytes(contract, values) {
  const fields2 = allFields(contract).map((field2) => ({ name: field2.name, type: field2.type, value: values[field2.name] })).sort((left, right) => left.name.localeCompare(right.name)).map((field2) => ({
    name: field2.name,
    type: field2.type,
    value: field2.value === void 0 ? void 0 : normalizeValue(field2.type, field2.value)
  }));
  return new TextEncoder().encode(JSON.stringify({ fields: fields2 }));
}
function sameBytes(left, right) {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}
function cloneValue(value) {
  return typeof value === "number" ? value : [...value];
}
function cloneValues(values) {
  const clone = {};
  for (const [name, value] of Object.entries(values)) clone[name] = cloneValue(value);
  return Object.freeze(clone);
}
function cloneBytes(bytes) {
  return bytes.slice();
}
function validChannelPayload(payload) {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return false;
  const value = payload;
  const position = value.position;
  return Array.isArray(position) && position.length === 3 && position.every((component) => typeof component === "number" && Number.isFinite(component)) && typeof value.strength === "number" && Number.isFinite(value.strength);
}
function withTick(input, tick) {
  const result = { ...input };
  Object.defineProperty(result, "tick", { value: tick, enumerable: false });
  return Object.freeze(result);
}
var ParticleEffectInstance = class {
  contract;
  #values;
  #generation = 0;
  #sequence = 0;
  #pendingPatches = [];
  #pendingChannels = [];
  #channelCapacities = /* @__PURE__ */ new Map([["impact", 32]]);
  #droppedCount = 0;
  constructor(contract, options = {}) {
    this.contract = contract;
    if (options.parent?.fingerprint !== void 0 && options.parent.fingerprint !== contract.fingerprint) {
      throw new TypeError(
        `ParticleEffectInstance parent fingerprint ${options.parent.fingerprint} does not match ${contract.fingerprint}`
      );
    }
    const parentDefaults = options.parent?.defaults ?? contract.defaults;
    const initial = { ...parentDefaults, ...options.initialValues };
    const checked = contract.createValues(initial);
    if (!checked.ok) throw new TypeError(checked.error.hint);
    this.#values = cloneValues(checked.value);
    for (const channel of options.channels ?? []) {
      this.#channelCapacities.set(channel.id, channel.capacity);
    }
  }
  get values() {
    return this.#values;
  }
  get generation() {
    return this.#generation;
  }
  get pendingPatchCount() {
    return this.#pendingPatches.length;
  }
  setChannelCapacity(channel, capacity) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new RangeError("channel capacity must be a positive integer");
    }
    this.#channelCapacities.set(channel, capacity);
  }
  submit(input) {
    if (typeof input.channel !== "string" || input.channel.length === 0 || !Number.isInteger(input.sequence) || input.sequence < 0 || !validChannelPayload(input.payload)) {
      return failure3(
        "vfx-channel-invalid",
        `channels.${input.channel || "unknown"}`,
        "a named channel with a finite impact payload and non-negative integer sequence",
        "repair the typed channel payload before the next FixedUpdate"
      );
    }
    const capacity = this.#channelCapacities.get(input.channel) ?? 32;
    if (this.#pendingChannels.length >= capacity) {
      this.#droppedCount += 1;
      return failure3(
        "vfx-channel-overflow",
        `channels.${input.channel}`,
        `at most ${capacity} pending inputs for this channel`,
        "reduce the input rate or increase the reflected channel capacity and recook",
        input.sequence
      );
    }
    this.#pendingChannels.push(
      Object.freeze({
        channel: input.channel,
        payload: Object.freeze({
          position: [...input.payload.position],
          strength: input.payload.strength
        }),
        sequence: input.sequence
      })
    );
    return ok(void 0);
  }
  patch(patch) {
    const candidate = { ...this.#values, ...patch };
    const checked = this.contract.validateValues(candidate);
    if (!checked.ok) return checked;
    this.#pendingPatches.push(Object.freeze({ ...patch }));
    return ok(void 0);
  }
  commit(options) {
    const candidate = { ...this.#values };
    for (const patch of this.#pendingPatches) Object.assign(candidate, patch);
    const checked = this.contract.validateValues(candidate);
    if (!checked.ok) return checked;
    const nextValues = cloneValues(checked.value);
    const packed = this.contract.pack(nextValues);
    if (!packed.ok) return packed;
    const patchCount = this.#pendingPatches.length;
    const droppedCount = this.#droppedCount;
    const channelInputs = Object.freeze(
      [...this.#pendingChannels].sort((left, right) => left.sequence - right.sequence).map((input) => withTick(input, options.tick))
    );
    this.#pendingPatches = [];
    this.#pendingChannels = [];
    this.#droppedCount = 0;
    if (patchCount > 0) this.#generation += 1;
    this.#values = nextValues;
    const canonicalPayload = canonicalBytes(this.contract, nextValues);
    const sequence = this.#sequence++;
    const replayInput = Object.freeze({
      seed: options.seed,
      tick: options.tick,
      generation: this.#generation,
      sequence,
      fingerprint: this.contract.fingerprint,
      payload: cloneBytes(canonicalPayload),
      values: nextValues,
      channelInputs,
      droppedCount
    });
    return ok({
      seed: options.seed,
      tick: options.tick,
      generation: this.#generation,
      sequence,
      values: nextValues,
      parameterBlock: cloneBytes(packed.value),
      canonicalPayload,
      replayInput,
      patchCount,
      channelInputs,
      droppedCount
    });
  }
  replay(input) {
    if (input.fingerprint !== this.contract.fingerprint) {
      return failure3(
        "vfx-instance-replay-mismatch",
        "replay.fingerprint",
        this.contract.fingerprint,
        "replay the input with the matching cooked effect contract",
        input.fingerprint
      );
    }
    const checked = this.contract.validateValues(input.values);
    if (!checked.ok) return checked;
    const canonicalPayload = canonicalBytes(this.contract, checked.value);
    if (!sameBytes(canonicalPayload, input.payload)) {
      return failure3(
        "vfx-instance-replay-mismatch",
        "replay.payload",
        "canonical payload bytes for replay.values",
        "record and replay normalized values from the same fixed-tick input"
      );
    }
    const packed = this.contract.pack(checked.value);
    if (!packed.ok) return packed;
    this.#values = cloneValues(checked.value);
    this.#generation = input.generation;
    this.#sequence = Math.max(this.#sequence, input.sequence + 1);
    this.#pendingPatches = [];
    this.#pendingChannels = [...input.channelInputs].map(
      (channel) => withTick(channel, input.tick)
    );
    this.#droppedCount = 0;
    const values = this.#values;
    const replayInput = Object.freeze({
      ...input,
      payload: cloneBytes(input.payload),
      values,
      channelInputs: this.#pendingChannels,
      droppedCount: input.droppedCount
    });
    return ok({
      seed: input.seed,
      tick: input.tick,
      generation: input.generation,
      sequence: input.sequence,
      values,
      parameterBlock: cloneBytes(packed.value),
      canonicalPayload,
      replayInput,
      patchCount: 0,
      channelInputs: this.#pendingChannels,
      droppedCount: input.droppedCount
    });
  }
};
function createParticleEffectInstance(contract, options = {}) {
  return new ParticleEffectInstance(contract, options);
}
var ParticleEffectPlayer = defineComponent("ParticleEffectPlayer", {
  // The VFX render owner re-resolves the compiled effect on the target world;
  // playback intent remains portable simulation state.
  effect: { type: "shared<ParticleEffectAsset>" },
  playing: { type: "bool", default: true },
  seed: { type: "u32", default: 0 },
  timeScale: { type: "f32", default: 1 }
});

// src/gpu-runtime.ts
var VFX_GPU_RUNTIME_RESOURCE_KEY = "VfxGpuRuntime";
function createVfxInspectSnapshot(input) {
  return {
    layout: { fingerprint: input.layoutFingerprint },
    values: { generation: input.parameterGeneration, patchCount: input.patchCount },
    ...input.dataInterfaces === void 0 ? {} : { dataInterfaces: input.dataInterfaces },
    ...input.channels === void 0 ? {} : { channels: input.channels },
    ...input.stages === void 0 ? {} : { stages: input.stages },
    ...input.renderers === void 0 ? {} : { renderers: input.renderers },
    ...input.hmr === void 0 ? {} : { hmr: input.hmr },
    ...input.gpuTiming === void 0 ? {} : { gpuTiming: input.gpuTiming },
    ...input.error === void 0 ? {} : { error: input.error }
  };
}
function eventCounters(intent, dropped, eventSources) {
  const inputs = intent.channelInputs;
  const events = [...intent.emitter.events ?? [], ...eventSources];
  return Object.freeze({
    queued: inputs.length,
    produced: (intent.emitter.events?.length ?? 0) > 0 ? inputs.length : 0,
    consumed: eventSources.length > 0 ? inputs.length * eventSources.reduce((total, event) => total + event.fanOut, 0) : 0,
    dropped,
    overflow: dropped > 0 ? 1 : 0,
    fanOut: events.reduce((total, event) => total + event.fanOut, 0),
    recursionDepth: events.reduce((depth, event) => Math.max(depth, event.recursionDepth), 0),
    lastSequence: inputs.at(-1)?.sequence ?? -1
  });
}
var VfxGpuRuntime = class {
  #maxQueuedTicks;
  #players = /* @__PURE__ */ new Map();
  #instances = /* @__PURE__ */ new Map();
  #seen = /* @__PURE__ */ new Set();
  #intents = [];
  #diagnostics = [];
  #lastCommitted = /* @__PURE__ */ new Map();
  #lastCommittedByEmitter = /* @__PURE__ */ new Map();
  #eventCounters = /* @__PURE__ */ new Map();
  #cameraVisibility = /* @__PURE__ */ new Map();
  #sessionEnabled = /* @__PURE__ */ new Map();
  #replayRequests = /* @__PURE__ */ new Set();
  #replayInputs = /* @__PURE__ */ new Map();
  #sequence = 0;
  #renderGeneration = 0;
  constructor(options = {}) {
    this.#maxQueuedTicks = options.maxQueuedTicks ?? 8;
  }
  /** Resource generation owned by the current VFX render attachment. */
  get renderGeneration() {
    return this.#renderGeneration;
  }
  snapshot() {
    return this.#intents;
  }
  diagnostics() {
    return this.#diagnostics;
  }
  /**
   * Visit every live emitter source.  The renderer uses this on render frames
   * where pause/restart culling has no pending simulation intent, so a camera
   * move back into the bounds can refresh visibility before the next tick.
   */
  forEachEmitterSource(visitor) {
    for (const [player, state] of this.#players) {
      for (const emitter of state.emitters) visitor({ player, emitter });
    }
  }
  lastCommitted(player) {
    return this.#lastCommitted.get(player);
  }
  /**
   * Return the last submitted fixed-tick state for one emitter.  Renderers
   * retain this projection between fixed ticks; simulation intents are a
   * queue, while a drawable emitter remains live until the player is reset.
   */
  lastCommittedEmitter(player, emitterId) {
    return this.#lastCommittedByEmitter.get(player)?.get(emitterId);
  }
  /**
   * Rebuild the deterministic fixed-tick inputs needed to rehydrate one
   * retained emitter on a replacement GPU device. This is a renderer-only
   * projection: it does not enqueue work, advance World time, allocate a new
   * play cycle, or publish channel/event counters.
   */
  inspectPlayers() {
    return Object.freeze(
      [...this.#players.keys()].sort((left, right) => Number(left) - Number(right)).flatMap((player) => {
        const snapshot = this.inspectPlayer(player);
        return snapshot === void 0 ? [] : [snapshot];
      })
    );
  }
  inspectPlayer(player) {
    const state = this.#players.get(player);
    if (state === void 0) return void 0;
    const instance = this.#instances.get(player);
    const latest = state.emitters.map((emitter) => this.#latestIntent(player, emitter.id));
    const lastIntent = latest.reduce(
      (current, intent) => intent !== void 0 && (current === void 0 || intent.sequence > current.sequence) ? intent : current,
      void 0
    );
    const layoutFingerprint = state.emitters.find((emitter) => emitter.reflection.layout !== void 0)?.reflection.layout?.fingerprint ?? state.programFingerprint;
    const lastCommitted = this.#lastCommitted.get(player);
    const queuedTicks = /* @__PURE__ */ new Set();
    let queuedIntents = 0;
    for (const intent of this.#intents) {
      if (intent.player !== player) continue;
      queuedIntents += 1;
      queuedTicks.add(intent.tick);
    }
    return Object.freeze({
      player,
      assetGuid: state.assetGuid,
      programFingerprint: state.programFingerprint,
      seed: lastIntent?.seed ?? state.seed,
      fixedDelta: lastIntent?.fixedDelta ?? 0,
      playing: state.playing,
      values: Object.freeze({
        layoutFingerprint,
        generation: instance?.generation ?? lastIntent?.instanceGeneration ?? 0,
        pendingPatchCount: instance?.pendingPatchCount ?? 0
      }),
      queuedIntents,
      queuedTicks: queuedTicks.size,
      lastCommitted: lastCommitted === void 0 ? null : Object.freeze({
        sequence: lastCommitted.sequence,
        tick: lastCommitted.tick,
        phaseTick: lastCommitted.phaseTick,
        playCycle: lastCommitted.playCycle,
        spawnCount: lastCommitted.spawnCount,
        firstParticleId: lastCommitted.firstParticleId,
        reset: lastCommitted.reset,
        instanceGeneration: lastCommitted.instanceGeneration,
        instancePatchCount: lastCommitted.instancePatchCount
      }),
      channels: this.eventCounters(player),
      emitters: Object.freeze(
        state.emitters.map((emitter, index) => {
          const intent = latest[index];
          return Object.freeze({
            id: emitter.id,
            module: emitter.module,
            capacity: emitter.capacity,
            cameraVisible: this.#cameraVisibility.get(`${player}:${emitter.id}`) ?? true,
            sessionEnabled: this.isEmitterSessionEnabled(player, emitter.id),
            phaseTick: intent?.phaseTick ?? null,
            tick: intent?.tick ?? null,
            playCycle: intent?.playCycle ?? null,
            spawnCount: intent?.spawnCount ?? 0,
            firstParticleId: intent?.firstParticleId ?? 0,
            reset: intent?.reset ?? false,
            schedule: emitter.schedule,
            bounds: emitter.bounds,
            simulationWhenCulled: emitter.simulationWhenCulled,
            renderers: Object.freeze(
              emitter.renderers.map(
                (renderer, rendererIndex) => Object.freeze({
                  index: rendererIndex,
                  kind: renderer.kind,
                  enabled: renderer.enabled ?? true
                })
              )
            ),
            stages: Object.freeze((emitter.reflection.stages ?? []).map((stage) => stage.id)),
            dataInterfaces: Object.freeze(
              (emitter.reflection.dataInterfaces ?? []).map((requirement) => requirement.token)
            )
          });
        })
      ),
      diagnostics: Object.freeze(
        this.#diagnostics.filter((diagnostic) => diagnostic.detail.player === player)
      )
    });
  }
  eventCounters(player) {
    return this.#eventCounters.get(player) ?? this.#lastCommitted.get(player)?.eventCounters ?? {
      queued: 0,
      produced: 0,
      consumed: 0,
      dropped: 0,
      overflow: 0,
      fanOut: 0,
      recursionDepth: 0,
      lastSequence: -1
    };
  }
  markEventDispatched(player, counters) {
    const prior = this.#eventCounters.get(player);
    if (counters.produced === 0 && prior !== void 0) {
      this.#eventCounters.set(
        player,
        Object.freeze({
          ...prior,
          queued: 0,
          consumed: Math.max(prior.consumed, counters.consumed)
        })
      );
      return;
    }
    this.#eventCounters.set(
      player,
      Object.freeze({ ...counters, queued: 0, consumed: counters.produced })
    );
  }
  hasPlayer(player) {
    return this.#players.has(player);
  }
  attachInstance(player, instance) {
    this.#instances.set(player, instance);
  }
  detachInstance(player) {
    this.#instances.delete(player);
  }
  getInstance(player) {
    return this.#instances.get(player);
  }
  setEmitterCameraVisibility(player, emitterId, visible) {
    this.#cameraVisibility.set(`${player}:${emitterId}`, visible);
  }
  setEmitterSessionEnabled(player, emitterId, enabled) {
    this.#sessionEnabled.set(`${player}:${emitterId}`, enabled);
  }
  isEmitterSessionEnabled(player, emitterId) {
    return this.#sessionEnabled.get(`${player}:${emitterId}`) ?? true;
  }
  /** Restart from tick zero without changing authored `ParticleEffectPlayer.playing`. */
  replay(player, input) {
    this.#discardQueuedIntents(player);
    this.#clearDiagnostics(player, "vfx-intent-queue-overflow");
    this.#replayInputs.delete(player);
    if (input === void 0) {
      this.#instances.delete(player);
    } else {
      this.#replayInputs.set(player, input);
    }
    this.#replayRequests.add(player);
  }
  /**
   * Acknowledge queued intents. A scalar acknowledges the contiguous prefix;
   * an array acknowledges only those terminal sequences, which lets unrelated
   * player/emitter streams progress while another stream is deferred. When the
   * renderer supplies `publishedSequences`, only intents that reached GPU
   * submission update the retained last-committed projection; skipped intents
   * are queue acknowledgements, not new GPU state.
   */
  commit(sequence, publishedSequences) {
    const prefix = typeof sequence === "number" ? sequence : void 0;
    const acknowledged = typeof sequence === "number" ? void 0 : new Set(sequence);
    const published = publishedSequences === void 0 ? void 0 : new Set(publishedSequences);
    const committedPlayers = /* @__PURE__ */ new Set();
    const retained = [];
    for (const intent of this.#intents) {
      const shouldAcknowledge = prefix === void 0 ? acknowledged?.has(intent.sequence) === true : intent.sequence <= prefix;
      if (!shouldAcknowledge) {
        retained.push(intent);
        continue;
      }
      const state = this.#players.get(intent.player);
      committedPlayers.add(intent.player);
      if (published === void 0 || published.has(intent.sequence)) {
        if (state !== void 0) state.hasCommitted = true;
        const priorCommitted = this.#lastCommitted.get(intent.player);
        if (priorCommitted === void 0 || priorCommitted.sequence < intent.sequence) {
          this.#lastCommitted.set(intent.player, intent);
        }
        let emitters = this.#lastCommittedByEmitter.get(intent.player);
        if (emitters === void 0) {
          emitters = /* @__PURE__ */ new Map();
          this.#lastCommittedByEmitter.set(intent.player, emitters);
        }
        const priorEmitter = emitters.get(intent.emitter.id);
        if (priorEmitter === void 0 || priorEmitter.sequence < intent.sequence) {
          emitters.set(intent.emitter.id, intent);
        }
      }
    }
    this.#intents.splice(0, this.#intents.length, ...retained);
    for (const player of committedPlayers) {
      this.#clearDiagnostics(player, "vfx-intent-queue-overflow");
    }
  }
  reset(player) {
    this.#discardQueuedIntents(player);
    this.#clearDiagnostics(player);
    this.#players.delete(player);
    this.#instances.delete(player);
    this.#replayRequests.delete(player);
    this.#lastCommitted.delete(player);
    this.#lastCommittedByEmitter.delete(player);
    this.#eventCounters.delete(player);
    this.#replayInputs.delete(player);
    const prefix = `${player}:`;
    for (const key of this.#cameraVisibility.keys()) {
      if (key.startsWith(prefix)) this.#cameraVisibility.delete(key);
    }
    for (const key of this.#sessionEnabled.keys()) {
      if (key.startsWith(prefix)) this.#sessionEnabled.delete(key);
    }
  }
  /**
   * Drop every generation-owned VFX runtime value after device recovery.
   * Authored ParticleEffectPlayer state remains the restart source on the next
   * FixedUpdate; no queued intent or stale instance crosses the boundary.
   */
  recover() {
    this.#renderGeneration += 1;
    this.#players.clear();
    this.#instances.clear();
    this.#seen.clear();
    this.#intents.length = 0;
    this.#diagnostics.length = 0;
    this.#lastCommitted.clear();
    this.#lastCommittedByEmitter.clear();
    this.#eventCounters.clear();
    this.#cameraVisibility.clear();
    this.#sessionEnabled.clear();
    this.#replayRequests.clear();
    this.#replayInputs.clear();
  }
  #report(diagnostic) {
    const alreadyActive = this.#diagnostics.some(
      (prior) => prior.code === diagnostic.code && prior.detail.player === diagnostic.detail.player
    );
    if (alreadyActive) return;
    if (this.#diagnostics.length === 64) this.#diagnostics.shift();
    this.#diagnostics.push(diagnostic);
  }
  #clearDiagnostics(player, code) {
    for (let index = this.#diagnostics.length - 1; index >= 0; index -= 1) {
      const diagnostic = this.#diagnostics[index];
      if (diagnostic?.detail.player === player && (code === void 0 || diagnostic.code === code)) {
        this.#diagnostics.splice(index, 1);
      }
    }
  }
  #discardQueuedIntents(player) {
    let retained = 0;
    for (const intent of this.#intents) {
      if (intent.player !== player) {
        this.#intents[retained] = intent;
        retained += 1;
      }
    }
    this.#intents.length = retained;
  }
  advance(world, tick, fixedDelta, players) {
    this.#seen.clear();
    for (const input of players) {
      this.#seen.add(input.player);
      if (!Number.isFinite(input.timeScale) || input.timeScale < 0) {
        this.#report({
          code: "vfx-player-invalid",
          expected: "a finite non-negative particle timeScale",
          hint: "repair ParticleEffectPlayer.timeScale and restart the player",
          detail: { player: input.player }
        });
        continue;
      }
      this.#clearDiagnostics(input.player, "vfx-player-invalid");
      const resolved = world.sharedRefs.resolve(
        input.effect
      );
      if (!resolved.ok || resolved.value.schemaVersion !== 3) {
        this.#report({
          code: "vfx-effect-unavailable",
          expected: "a loaded schemaVersion 3 GPU particle effect",
          hint: "cold-cook the legacy effect as Program v3 before the first FixedUpdate",
          detail: { player: input.player }
        });
        continue;
      }
      this.#clearDiagnostics(input.player, "vfx-effect-unavailable");
      const previous = this.#players.get(input.player);
      const replayRequested = this.#replayRequests.delete(input.player);
      const restartRequested = previous === void 0 || previous.effect !== input.effect || previous.seed !== input.seed || replayRequested || !previous.playing && input.playing;
      const restart = restartRequested;
      const state = restartRequested ? {
        effect: input.effect,
        assetGuid: resolved.value.guid,
        programFingerprint: resolved.value.program.fingerprint,
        emitters: resolved.value.program.emitters,
        seed: input.seed,
        playing: input.playing,
        playCycle: (previous?.playCycle ?? -1) + 1,
        elapsed: resolved.value.program.emitters.map(() => 0),
        rateRemainders: resolved.value.program.emitters.map(() => 0),
        nextParticleIds: resolved.value.program.emitters.map(() => 0),
        playCycles: resolved.value.program.emitters.map(() => (previous?.playCycle ?? -1) + 1),
        cameraVisible: resolved.value.program.emitters.map(() => true),
        phaseTicks: resolved.value.program.emitters.map(() => 0),
        hasCommitted: false,
        pendingResets: resolved.value.program.emitters.map(() => false)
      } : previous;
      this.#players.set(input.player, state);
      state.playing = input.playing;
      if (!input.playing && !replayRequested) {
        if (restart) state.pendingResets.fill(true);
        continue;
      }
      const queuedForPlayer = this.#intents.reduce(
        (count, intent) => count + (intent.player === input.player ? 1 : 0),
        0
      );
      if (queuedForPlayer >= this.#maxQueuedTicks * Math.max(1, resolved.value.program.emitters.length)) {
        if (restart) state.pendingResets.fill(true);
        if (state.hasCommitted) {
          this.#report({
            code: "vfx-intent-queue-overflow",
            expected: `at most ${this.#maxQueuedTicks} unconsumed fixed ticks`,
            hint: "recover or restart the renderer; VFX does not silently discard simulation ticks",
            detail: { player: input.player, maxQueuedTicks: this.#maxQueuedTicks }
          });
        }
        continue;
      }
      const instance = this.#instances.get(input.player) ?? this.#createInstance(input.player, resolved.value);
      if (instance === void 0) {
        if (restart) state.pendingResets.fill(true);
        continue;
      }
      const hasActiveEmitter = resolved.value.program.emitters.some((emitter) => {
        if (!this.isEmitterSessionEnabled(input.player, emitter.id)) return false;
        const cameraVisible = this.#cameraVisibility.get(`${input.player}:${emitter.id}`) ?? true;
        return cameraVisible || emitter.simulationWhenCulled === "continue";
      });
      if (!hasActiveEmitter) {
        if (restart) state.pendingResets.fill(true);
        for (const [index, emitter] of resolved.value.program.emitters.entries()) {
          state.cameraVisible[index] = this.#cameraVisibility.get(`${input.player}:${emitter.id}`) ?? true;
        }
        continue;
      }
      const replayInput = this.#replayInputs.get(input.player);
      this.#replayInputs.delete(input.player);
      const committed = replayInput === void 0 ? instance.commit({ seed: input.seed, tick }) : instance.replay(replayInput);
      if (!committed.ok) {
        if (restart) state.pendingResets.fill(true);
        this.#report({
          code: "vfx-instance-commit-failed",
          expected: "the current typed instance values to pack into the reflected GPU block",
          hint: "repair the instance patch and retry at the next FixedUpdate",
          detail: { player: input.player }
        });
        continue;
      }
      const delta = fixedDelta * input.timeScale;
      const committedChannels = committed.value.channelInputs;
      for (const [index, emitter] of resolved.value.program.emitters.entries()) {
        const cameraVisible = this.#cameraVisibility.get(`${input.player}:${emitter.id}`) ?? true;
        const becameVisible = cameraVisible && state.cameraVisible[index] === false;
        state.cameraVisible[index] = cameraVisible;
        const emitterRestart = restart || state.pendingResets[index] === true;
        if (!this.isEmitterSessionEnabled(input.player, emitter.id)) {
          if (emitterRestart) state.pendingResets[index] = true;
          continue;
        }
        if (!cameraVisible && emitter.simulationWhenCulled !== "continue") {
          if (emitterRestart) state.pendingResets[index] = true;
          continue;
        }
        const visibilityRestart = becameVisible && emitter.simulationWhenCulled === "restart-on-visible";
        if (visibilityRestart) {
          state.elapsed[index] = 0;
          state.rateRemainders[index] = 0;
          state.nextParticleIds[index] = 0;
          state.playCycles[index] = (state.playCycles[index] ?? state.playCycle) + 1;
          state.phaseTicks[index] = 0;
        }
        if (delta === 0 && !emitterRestart && !visibilityRestart && committed.value.patchCount === 0 && committedChannels.length === 0)
          continue;
        const previousElapsed = state.elapsed[index] ?? 0;
        const scheduled = spawnCount(
          emitter,
          previousElapsed,
          previousElapsed + delta,
          emitterRestart || visibilityRestart,
          state.rateRemainders[index] ?? 0
        );
        state.rateRemainders[index] = scheduled.remainder;
        const firstParticleId = state.nextParticleIds[index] ?? 0;
        state.nextParticleIds[index] = firstParticleId + scheduled.count;
        const consumesEvent = resolved.value.program.emitters.some(
          (source) => (source.events ?? []).some((event) => event.subEmitter === emitter.id)
        );
        const eventSources = resolved.value.program.emitters.flatMap(
          (source) => (source.events ?? []).filter((event) => event.subEmitter === emitter.id)
        );
        const channelInputs = (emitter.events?.length ?? 0) > 0 || consumesEvent ? committedChannels : [];
        const phaseTick = state.phaseTicks[index] ?? 0;
        this.#intents.push(
          Object.freeze({
            sequence: this.#sequence++,
            player: input.player,
            emitter,
            programFingerprint: resolved.value.program.fingerprint,
            reset: emitterRestart || visibilityRestart,
            fixedDelta: delta,
            phaseTick,
            tick,
            seed: input.seed,
            playCycle: state.playCycles[index] ?? state.playCycle,
            spawnCount: scheduled.count,
            firstParticleId,
            instanceGeneration: committed.value.generation,
            instancePatchCount: committed.value.patchCount,
            parameterBlock: committed.value.parameterBlock,
            canonicalPayload: committed.value.canonicalPayload,
            replayInput: committed.value.replayInput,
            channelInputs,
            eventCounters: eventCounters(
              { channelInputs, emitter },
              channelInputs.length === 0 ? 0 : committed.value.droppedCount,
              eventSources
            )
          })
        );
        state.elapsed[index] = previousElapsed + delta;
        state.phaseTicks[index] = phaseTick + 1;
        state.pendingResets[index] = false;
      }
    }
    for (const player of this.#players.keys()) {
      if (!this.#seen.has(player)) this.reset(player);
    }
  }
  #createInstance(player, effect) {
    const layout = effect.program.emitters.find(
      (emitter) => emitter.reflection.layout !== void 0
    )?.reflection.layout;
    if (layout === void 0) {
      this.#report({
        code: "vfx-effect-unavailable",
        expected: "a Program v3 emitter reflection layout",
        hint: "recook the effect with Program v3 reflection before starting the player",
        detail: { player }
      });
      return void 0;
    }
    const reflection = layout;
    try {
      const instance = new ParticleEffectInstance(createVfxEffectContract(reflection), {
        channels: effect.program.emitters.flatMap((emitter) => emitter.channels ?? [])
      });
      this.#instances.set(player, instance);
      return instance;
    } catch {
      this.#report({
        code: "vfx-instance-commit-failed",
        expected: "a valid reflected VFX instance contract",
        hint: "recook the effect with a valid reflection layout before starting the player",
        detail: { player }
      });
      return void 0;
    }
  }
  #latestIntent(player, emitterId) {
    let latest = this.#lastCommittedByEmitter.get(player)?.get(emitterId);
    for (let index = this.#intents.length - 1; index >= 0; index -= 1) {
      const intent = this.#intents[index];
      if (intent?.player !== player || intent.emitter.id !== emitterId) continue;
      if (latest === void 0 || intent.sequence > latest.sequence) latest = intent;
      break;
    }
    return latest;
  }
};
function spawnCount(emitter, previous, next, firstTick, priorRemainder) {
  const exactRate = emitter.schedule.rate * Math.max(0, next - previous) + priorRemainder;
  let count = Math.floor(exactRate);
  const loop = emitter.schedule.loopDuration;
  for (const burst of emitter.schedule.bursts ?? []) {
    if (loop === void 0) {
      if (firstTick && burst.time === 0 || burst.time > previous && burst.time <= next) {
        count += burst.count;
      }
      continue;
    }
    const firstOccurrence = Math.max(0, Math.floor((previous - burst.time) / loop) + 1);
    const lastOccurrence = Math.floor((next - burst.time) / loop);
    const occurrences = Math.max(0, lastOccurrence - firstOccurrence + 1);
    count += occurrences * burst.count;
    if (firstTick && burst.time === 0) count += burst.count;
  }
  return { count, remainder: exactRate - Math.floor(exactRate) };
}
function vfxGpuRuntimePlugin(options = {}) {
  const rows = [];
  return {
    name: "vfx-gpu-runtime",
    inject: ["world"],
    apply(ctx) {
      const world = ctx.world;
      if (world.hasResource(VFX_GPU_RUNTIME_RESOURCE_KEY)) {
        throw new TypeError(`${VFX_GPU_RUNTIME_RESOURCE_KEY} already exists`);
      }
      const runtime = new VfxGpuRuntime(options);
      ctx.effect(() => {
        world.insertResource(VFX_GPU_RUNTIME_RESOURCE_KEY, runtime);
        return () => {
          world.removeResource(VFX_GPU_RUNTIME_RESOURCE_KEY);
        };
      }, "vfx/runtime-resource");
      ctx.effect(() => {
        world.addSystem(FixedUpdate, {
          name: "vfx-gpu-runtime",
          queries: [{ with: [Entity, ParticleEffectPlayer] }],
          fn: (world2, queryResults) => {
            rows.length = 0;
            for (const row of queryResults[0]) {
              const player = row.get(ParticleEffectPlayer);
              rows.push({
                player: row.entity,
                effect: toShared(player.effect),
                playing: player.playing,
                seed: player.seed,
                timeScale: player.timeScale
              });
            }
            const fixed = world2.getResource(FixedTime);
            runtime.advance(world2, fixed.tick, fixed.delta, rows);
          }
        }).unwrap();
        return () => world.removeSystem(FixedUpdate, "vfx-gpu-runtime");
      }, "vfx/tick-system");
    }
  };
}
function buildVfxRecoveryIntents(latest) {
  if (latest === void 0) return [];
  const intents = [];
  let elapsed = 0;
  let remainder = 0;
  let firstParticleId = 0;
  for (let phaseTick = 0; phaseTick <= latest.phaseTick; phaseTick += 1) {
    const next = elapsed + latest.fixedDelta;
    const scheduled = spawnCount(latest.emitter, elapsed, next, phaseTick === 0, remainder);
    intents.push(
      Object.freeze({
        ...latest,
        reset: phaseTick === 0,
        phaseTick,
        tick: latest.tick - latest.phaseTick + phaseTick,
        spawnCount: scheduled.count,
        firstParticleId,
        // Recovery restores GPU state from retained authored inputs. It
        // never republishes the World-facing event/channel stream.
        channelInputs: Object.freeze([]),
        eventCounters: Object.freeze({
          queued: 0,
          produced: 0,
          consumed: 0,
          dropped: 0,
          overflow: 0,
          fanOut: 0,
          recursionDepth: 0,
          lastSequence: -1
        })
      })
    );
    elapsed = next;
    remainder = scheduled.remainder;
    firstParticleId += scheduled.count;
  }
  return Object.freeze(intents);
}

// src/particle-layout.ts
var CORE_FIELDS = Object.freeze([
  { name: "position", type: "vec3<f32>", offset: 0, size: 12, alignment: 16 },
  { name: "age", type: "f32", offset: 12, size: 4, alignment: 4 },
  { name: "velocity", type: "vec3<f32>", offset: 16, size: 12, alignment: 16 },
  { name: "lifetime", type: "f32", offset: 28, size: 4, alignment: 4 },
  { name: "color", type: "vec4<f32>", offset: 32, size: 16, alignment: 16 },
  { name: "sprite_size", type: "vec2<f32>", offset: 48, size: 8, alignment: 8 },
  { name: "sprite_rotation", type: "f32", offset: 56, size: 4, alignment: 4 },
  { name: "sub_image", type: "f32", offset: 60, size: 4, alignment: 4 },
  { name: "mesh_orientation", type: "vec4<f32>", offset: 64, size: 16, alignment: 16 },
  { name: "mesh_scale", type: "vec3<f32>", offset: 80, size: 12, alignment: 16 },
  { name: "material_random", type: "f32", offset: 92, size: 4, alignment: 4 },
  { name: "id", type: "u32", offset: 96, size: 4, alignment: 4 },
  { name: "alive", type: "u32", offset: 100, size: 4, alignment: 4 }
]);
var VFX_PARTICLE_CORE_LAYOUT = Object.freeze({
  name: "VfxParticle",
  fields: CORE_FIELDS,
  size: 112,
  alignment: 16,
  stride: 112,
  fingerprint: "sha256:9e3c1566f6d0600cedb94bd3c4b76c4e7c456fd563b37065220d4e33cf83c777"
});
var VFX_PARTICLE_CORE_STRIDE = VFX_PARTICLE_CORE_LAYOUT.stride;
var CORE_FIELD_BY_NAME = new Map(CORE_FIELDS.map((field2) => [field2.name, field2]));
function vfxParticleCoreField(name) {
  const field2 = CORE_FIELD_BY_NAME.get(name);
  if (field2 === void 0) throw new Error(`unknown VFX particle core field ${name}`);
  return field2;
}
function vfxParticleCoreWgsl() {
  return [
    "struct VfxParticle {",
    ...CORE_FIELDS.map((field2) => `  ${field2.name}: ${field2.type},`),
    "}"
  ].join("\n");
}
var VALUE_LAYOUT = {
  f32: { alignment: 4, size: 4 },
  i32: { alignment: 4, size: 4 },
  u32: { alignment: 4, size: 4 },
  "vec2<f32>": { alignment: 8, size: 8 },
  "vec3<f32>": { alignment: 16, size: 12 },
  "vec4<f32>": { alignment: 16, size: 16 }
};
function alignUp(value, alignment) {
  return Math.ceil(value / alignment) * alignment;
}
function deriveVfxCustomLayout(struct, maxLanes = 4) {
  if (struct.name !== "VfxCustom") {
    throw new TypeError(`expected VfxCustom reflection, received ${struct.name}`);
  }
  const fields2 = [];
  let offset = 0;
  let alignment = 1;
  for (const field2 of struct.fields) {
    const layout = VALUE_LAYOUT[field2.type];
    offset = alignUp(offset, layout.alignment);
    fields2.push({ ...field2, offset, size: layout.size, alignment: layout.alignment });
    offset += layout.size;
    alignment = Math.max(alignment, layout.alignment);
  }
  const size = fields2.length === 0 ? 0 : alignUp(offset, alignment);
  const stride = size;
  const lanes = Math.ceil(stride / 16);
  if (lanes > maxLanes) {
    throw new RangeError(`VfxCustom consumes ${lanes} vec4 lanes; maximum is ${maxLanes}`);
  }
  return Object.freeze({
    name: "VfxCustom",
    fields: Object.freeze(fields2),
    size,
    alignment,
    stride,
    lanes
  });
}
function finite2(value) {
  return Number.isFinite(value);
}
function encodeVfxParticleCore(value) {
  const bytes = new Uint8Array(VFX_PARTICLE_CORE_STRIDE);
  const view = new DataView(bytes.buffer);
  const write = (name, values) => {
    const field2 = vfxParticleCoreField(name);
    for (const component of values) {
      if (!finite2(component)) throw new TypeError(`non-finite VFX particle field ${name}`);
      if (field2.type === "u32" && (!Number.isInteger(component) || component < 0 || component > 4294967295)) {
        throw new RangeError(`u32 VFX particle field ${name} is outside its valid range`);
      }
    }
    for (let index = 0; index < values.length; index += 1) {
      const component = values[index] ?? 0;
      if (field2.type === "u32") view.setUint32(field2.offset + index * 4, component, true);
      else view.setFloat32(field2.offset + index * 4, component, true);
    }
  };
  write("position", value.position);
  write("age", [value.age]);
  write("velocity", value.velocity);
  write("lifetime", [value.lifetime]);
  write("color", value.color);
  write("sprite_size", value.sprite_size);
  write("sprite_rotation", [value.sprite_rotation]);
  write("sub_image", [value.sub_image]);
  write("mesh_orientation", value.mesh_orientation);
  write("mesh_scale", value.mesh_scale);
  write("material_random", [value.material_random]);
  write("id", [value.id]);
  write("alive", [value.alive]);
  return bytes;
}
function normalizedVfxParticleAge(age, lifetime) {
  if (!finite2(age) || !finite2(lifetime) || lifetime <= 0) return 0;
  return Math.min(1, Math.max(0, age / lifetime));
}

export { PARTICLE_CODE_DEFAULT_MODULE_ID, PARTICLE_RENDERER_SEMANTICS, PARTICLE_STAGE_RESOURCE_NAMES, ParticleEffectInstance, ParticleEffectPlayer, VFX_GPU_PROGRAM_ARTIFACT_KEY, VFX_GPU_PROGRAM_FORMAT, VFX_GPU_RUNTIME_RESOURCE_KEY, VFX_PARTICLE_CORE_LAYOUT, VFX_PARTICLE_CORE_STRIDE, VfxGpuRuntime, buildVfxRecoveryIntents, createParticleEffectInstance, createVfxEffectContract, createVfxInspectSnapshot, defaultParticleRendererAttributes, defineParticleEffectSourceV3, deriveVfxCustomLayout, describeVfxGpuEffect, encodeVfxParticleCore, isVfxGpuEffectAsset, loadVfxGpuEffect, normalizedVfxParticleAge, parseParticleEffectSourceV3, parseVfxStageDeclarations, particleEffectContribution, resolveVfxDataInterfaces, validateVfxEffectValues, vfxGpuEffectContribution, vfxGpuEffectPackLoader, vfxGpuRuntimePlugin, vfxParticleCoreField, vfxParticleCoreWgsl };
