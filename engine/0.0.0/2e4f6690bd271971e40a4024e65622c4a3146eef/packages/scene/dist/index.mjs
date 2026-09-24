// src/assets/scene-decoder.ts
import {
  err,
  ok
} from "../../types/dist/index.mjs";

// src/instances/legacy.ts
function migrateLegacySceneComponentFields(componentName, source, addressByLocalId) {
  const fields = { ...source };
  const address = (value) => Number.isSafeInteger(value) ? addressByLocalId?.get(value) ?? String(value) : value;
  if (componentName === "DirectionalLight" && Object.hasOwn(fields, "pcfKernelSize")) {
    const kernel = fields.pcfKernelSize;
    const shadowFilter = kernel === 1 ? 1 : kernel === 3 ? 2 : kernel === 5 ? 3 : void 0;
    if (shadowFilter !== void 0 && !Object.hasOwn(fields, "shadowFilter")) {
      delete fields.pcfKernelSize;
      fields.shadowFilter = shadowFilter;
    }
  }
  if (componentName === "ChildOf" && Number.isSafeInteger(fields.parent)) {
    fields.parent = address(fields.parent);
  }
  if (componentName === "Children" && Array.isArray(fields.entities)) {
    fields.entities = fields.entities.map(address);
  }
  return fields;
}
function normalizeLegacySceneAsset(scene) {
  if (scene === null || typeof scene !== "object") return scene;
  const candidate = scene;
  if (!Array.isArray(candidate.entities))
    return scene;
  const rows = candidate.entities;
  const addressByLocalId = /* @__PURE__ */ new Map();
  const rowKeys = [];
  const used = /* @__PURE__ */ new Set();
  for (const [index, row] of rows.entries()) {
    const localId = Number.isSafeInteger(row?.localId) ? row.localId : index;
    const bindingKey = typeof row?.bindingKey === "string" && row.bindingKey.length > 0 ? row.bindingKey : String(localId);
    const key = used.has(bindingKey) ? String(localId) : bindingKey;
    used.add(key);
    addressByLocalId.set(localId, key);
    rowKeys.push(key);
  }
  const entities = {};
  for (const [index, row] of rows.entries()) {
    const key = rowKeys[index];
    const rawComponents = row?.components;
    const components = {};
    if (rawComponents !== null && typeof rawComponents === "object" && !Array.isArray(rawComponents)) {
      for (const [componentName, rawFields] of Object.entries(
        rawComponents
      )) {
        if (rawFields === null || typeof rawFields !== "object" || Array.isArray(rawFields))
          continue;
        components[componentName] = migrateLegacySceneComponentFields(
          componentName,
          rawFields,
          addressByLocalId
        );
      }
    }
    entities[key] = {
      components,
      ...row?.instance === void 0 ? {} : { instance: row.instance }
    };
  }
  return {
    ...scene,
    entities
  };
}

// src/assets/scene-decoder.ts
var sceneAssetKind = {
  kind: "scene"
};
function invalidScene(guid, reason) {
  return err({
    code: "asset-package-invalid",
    expected: "a scene payload with keyed entities",
    hint: "recook the SceneAsset and publish its complete envelope",
    detail: { guid, reason }
  });
}
var sceneWireRefs = /* @__PURE__ */ new WeakMap();
function resolveWireRef(refs, value, location) {
  const guid = refs[value];
  if (!Number.isInteger(value) || value < 0 || guid === void 0) {
    return {
      ok: false,
      reason: `${location} references refs[${value}], but refs contains ${refs.length} entries`
    };
  }
  return { ok: true, value: guid };
}
function resolveInstanceSource(source, refs, location) {
  if (typeof source === "string" && source.length > 0) return { ok: true, value: source };
  if (typeof source !== "number" || !Number.isInteger(source)) {
    return { ok: false, reason: `${location} must be a GUID or refs index` };
  }
  return resolveWireRef(refs, source, location);
}
function resolveSkinGuids(skinGuids, refs) {
  if (skinGuids === void 0) return { ok: true, value: void 0 };
  const resolved = [];
  for (let index = 0; index < skinGuids.length; index += 1) {
    const value = skinGuids[index];
    if (typeof value === "string") {
      resolved.push(value);
      continue;
    }
    if (typeof value !== "number" || !Number.isInteger(value)) {
      return { ok: false, reason: `skinGuids[${index}] is not a GUID or refs index` };
    }
    const ref = resolveWireRef(refs, value, `skinGuids[${index}]`);
    if (!ref.ok) return ref;
    resolved.push(ref.value);
  }
  return { ok: true, value: resolved };
}
function resolveSceneWireRefs(payload, refs) {
  const normalized = normalizeLegacySceneAsset({ kind: "scene", entities: payload.entities });
  const rawEntities = normalized.entities;
  if (rawEntities === null || typeof rawEntities !== "object" || Array.isArray(rawEntities)) {
    return { ok: false, reason: "entities must be a keyed object" };
  }
  const entities = {};
  for (const [key, rawEntity] of Object.entries(rawEntities)) {
    const entity = rawEntity;
    if (key.length === 0 || entity === void 0 || typeof entity !== "object") {
      return { ok: false, reason: `entities[${JSON.stringify(key)}] is malformed` };
    }
    if (entity.components === null || typeof entity.components !== "object" || Array.isArray(entity.components)) {
      return { ok: false, reason: `entities.${key}.components must be an object` };
    }
    const components = {};
    for (const [componentName, rawFields] of Object.entries(
      entity.components
    )) {
      if (rawFields === null || typeof rawFields !== "object" || Array.isArray(rawFields)) {
        return {
          ok: false,
          reason: `entities.${key}.components.${componentName} must be an object`
        };
      }
      components[componentName] = { ...rawFields };
    }
    const instance = entity.instance;
    let resolvedInstance;
    if (instance !== void 0) {
      if (instance === null || typeof instance !== "object") {
        return { ok: false, reason: `entities.${key}.instance must be an object` };
      }
      const source = resolveInstanceSource(
        instance.source,
        refs,
        `entities.${key}.instance.source`
      );
      if (!source.ok) return source;
      if (instance.overrides !== void 0 && !Array.isArray(instance.overrides)) {
        return { ok: false, reason: `entities.${key}.instance.overrides must be an array` };
      }
      let overrides;
      if (instance.overrides === void 0) {
        overrides = void 0;
      } else {
        const resolvedOverrides = [];
        for (const [index, rawOverride] of instance.overrides.entries()) {
          if (rawOverride === null || typeof rawOverride !== "object" || Array.isArray(rawOverride) || !Array.isArray(rawOverride.target) || rawOverride.target?.some(
            (part) => typeof part !== "string" || part.length === 0
          )) {
            return {
              ok: false,
              reason: `entities.${key}.instance.overrides[${index}] is malformed`
            };
          }
          const target = rawOverride.target;
          const rawComponents = rawOverride.components;
          if (rawComponents === null || typeof rawComponents !== "object" || Array.isArray(rawComponents)) {
            return {
              ok: false,
              reason: `entities.${key}.instance.overrides[${index}].components is malformed`
            };
          }
          resolvedOverrides.push({
            target: [...target],
            components: rawComponents
          });
        }
        overrides = resolvedOverrides;
      }
      resolvedInstance = {
        source: source.value,
        ...overrides === void 0 ? {} : { overrides }
      };
    }
    entities[key] = {
      components,
      ...resolvedInstance === void 0 ? {} : { instance: resolvedInstance }
    };
  }
  const skinGuids = resolveSkinGuids(
    Array.isArray(payload.skinGuids) ? payload.skinGuids : payload.skinGuids === void 0 ? void 0 : [],
    refs
  );
  if (!skinGuids.ok) return skinGuids;
  return {
    ok: true,
    value: {
      kind: "scene",
      entities,
      ...skinGuids.value === void 0 ? {} : { skinGuids: skinGuids.value }
    }
  };
}
var sceneAssetDecoder = {
  async decode({ envelope }) {
    const payload = envelope.payload;
    if (payload.kind !== "scene" || payload.entities === null || typeof payload.entities !== "object") {
      return invalidScene(envelope.guid, "scene payload is missing keyed entities");
    }
    const resolved = resolveSceneWireRefs(payload, envelope.refs);
    if (!resolved.ok) return invalidScene(envelope.guid, resolved.reason);
    sceneWireRefs.set(resolved.value, Object.freeze([...envelope.refs]));
    return ok(resolved.value);
  }
};
var sceneAssetContribution = {
  kind: sceneAssetKind,
  decoder: sceneAssetDecoder,
  consumer: "Scene"
};

// src/components/children.ts
import { defineRelationship } from "../../ecs/dist/index.mjs";

// src/components/transform.ts
import { defineComponent } from "../../ecs/dist/index.mjs";
var IDENTITY_MAT4 = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
var GlobalTransform = defineComponent(
  "GlobalTransform",
  {
    world: { type: "array<f32, 16>", default: IDENTITY_MAT4 }
  },
  { transient: true }
);
var Transform = defineComponent(
  "Transform",
  {
    pos: { type: "array<f32, 3>", default: new Float32Array([0, 0, 0]) },
    // Component order [x, y, z, w] is shared with glTF.
    quat: { type: "array<f32, 4>", default: new Float32Array([0, 0, 0, 1]) },
    scale: { type: "array<f32, 3>", default: new Float32Array([1, 1, 1]) }
  },
  { requires: [GlobalTransform] }
);

// src/components/children.ts
var { source: ChildOf, target: Children } = defineRelationship({
  sourceName: "ChildOf",
  sourceField: "parent",
  targetName: "Children",
  targetField: "entities",
  // Every scene hierarchy node is spatial.  Adding ChildOf therefore
  // materializes the local/derived transform pair at the same structural
  // boundary, so render- and scene-authored children cannot enter a frame
  // with an incomplete hierarchy node.
  sourceRequires: [Transform],
  exclusive: true,
  linkedSpawn: true
});

// src/collect-subtree.ts
function collectSubtree(world, spawnRoot, visited) {
  if (visited === void 0) visited = /* @__PURE__ */ new Set();
  if (visited.has(spawnRoot)) return visited;
  const queue = [spawnRoot];
  visited.add(spawnRoot);
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const current = queue[cursor];
    const children = world.get(current, Children);
    if (!children.ok) continue;
    const entities = children.value.entities;
    for (let index = 0; index < entities.length; index += 1) {
      const child = entities[index];
      if (visited.has(child)) continue;
      visited.add(child);
      queue.push(child);
    }
  }
  return visited;
}

// src/components/morph-weights.ts
import { defineComponent as defineComponent2 } from "../../ecs/dist/index.mjs";
var MorphWeights = defineComponent2("MorphWeights", {
  weights: { type: "array<f32>" }
});

// src/components/name.ts
import { defineComponent as defineComponent3 } from "../../ecs/dist/index.mjs";
var Name = defineComponent3("Name", { value: { type: "string" } });

// src/errors.ts
import { ComponentNotDefinedError } from "../../ecs/dist/projection/index.mjs";
var SceneError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    super(`[SceneError ${args.code}] expected: ${args.expected}; hint: ${args.hint}`);
    this.name = "SceneError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    this.detail = args.detail;
  }
};

// src/instances/binding.ts
import { err as err2, ok as ok2 } from "../../types/dist/index.mjs";
function validateSceneEntityKeys(sceneSourceKey, entityKeys) {
  if (sceneSourceKey.length === 0) {
    return err2({
      code: "scene-binding-source-missing",
      expected: "a non-empty scene sourceKey",
      hint: "declare the scene sourceKey in the author inventory",
      detail: {}
    });
  }
  const seen = /* @__PURE__ */ new Set();
  for (const entityKey of entityKeys) {
    if (entityKey.length === 0 || seen.has(entityKey)) {
      return err2({
        code: "scene-binding-duplicate",
        expected: "unique non-empty entity keys within one scene",
        hint: "rename the duplicate entity key in the scene producer",
        detail: { sceneSourceKey, address: entityKey }
      });
    }
    seen.add(entityKey);
  }
  return ok2([...entityKeys]);
}
function sceneEntity(sceneSourceKey, address) {
  return { sceneSourceKey, address };
}
function sceneEntityAddressKey(address) {
  if (typeof address === "string") return `s:${JSON.stringify(address)}`;
  if (address.length === 1) return `s:${JSON.stringify(address[0] ?? "")}`;
  return `a:${JSON.stringify(address)}`;
}
function resolveSceneEntity(ref, instance) {
  if (ref.sceneSourceKey !== instance.sceneSourceKey) {
    return err2({
      code: "scene-binding-wrong-instance",
      expected: `scene instance ${ref.sceneSourceKey}`,
      hint: "resolve the SceneEntityRef against its owning SceneInstance",
      detail: { sceneSourceKey: ref.sceneSourceKey, address: ref.address }
    });
  }
  const value = instance.bindings.get(sceneEntityAddressKey(ref.address));
  if (value === void 0) {
    return err2({
      code: "scene-binding-missing",
      expected: "entity key declared by the scene producer",
      hint: "declare the entity key in the scene producer before consuming it",
      detail: { sceneSourceKey: ref.sceneSourceKey, address: ref.address }
    });
  }
  return ok2(value);
}

// src/instances/collect-profile.ts
var SCENE_COLLECT_PROFILE = Object.freeze({
  includeComponent: (_componentName, transient) => !transient,
  includeField: (_componentName, _fieldName, transient) => !transient
});

// src/instances/externalization.ts
import { err as err3, ok as ok3 } from "../../types/dist/index.mjs";
function sharedKind(type) {
  if (type?.startsWith("shared<")) return "one";
  if (type?.startsWith("array<shared<")) return "many";
  return void 0;
}
function addRef(context, guid, sourceField, sceneEntityKey) {
  const prior = context.indexByGuid.get(guid);
  if (prior !== void 0) return prior;
  const index = context.refs.length;
  context.refs.push({
    guid,
    sourceField,
    ...sceneEntityKey === void 0 ? {} : { sceneEntityKey }
  });
  context.indexByGuid.set(guid, index);
  return index;
}
function externalizeFields(componentName, source, resolveSchema, context, sceneEntityKey) {
  const schema = resolveSchema(componentName);
  const fields = {};
  for (const [fieldName, value] of Object.entries(
    migrateLegacySceneComponentFields(componentName, source)
  )) {
    if (value === void 0) continue;
    const kind = sharedKind(schema?.[fieldName]);
    if (kind === "one" && typeof value === "string") {
      fields[fieldName] = addRef(context, value, { componentName, fieldName }, sceneEntityKey);
    } else if (kind === "many" && Array.isArray(value)) {
      fields[fieldName] = value.map(
        (item, arrayIndex) => typeof item === "string" ? addRef(context, item, { componentName, fieldName, arrayIndex }, sceneEntityKey) : item
      );
    } else {
      fields[fieldName] = value;
    }
  }
  return fields;
}
function externalizeOverride(override, resolveSchema, context, sceneEntityKey) {
  const components = {};
  for (const [componentName, rawFields] of Object.entries(override.components)) {
    components[componentName] = externalizeFields(
      componentName,
      { ...rawFields },
      resolveSchema,
      context,
      sceneEntityKey
    );
  }
  return {
    target: [...override.target],
    components
  };
}
function externalizeSceneAsset(scene, resolveSchema) {
  const normalized = normalizeLegacySceneAsset(scene);
  const context = { refs: [], indexByGuid: /* @__PURE__ */ new Map() };
  const entities = {};
  for (const [key, entity] of Object.entries(normalized.entities)) {
    const components = {};
    for (const [componentName, raw] of Object.entries(entity.components)) {
      const source = raw;
      if (source === void 0) continue;
      components[componentName] = externalizeFields(
        componentName,
        source,
        resolveSchema,
        context,
        key
      );
    }
    const instance = entity.instance;
    entities[key] = {
      components,
      ...instance === void 0 ? {} : {
        instance: {
          source: addRef(
            context,
            instance.source,
            { componentName: "SceneInstance", fieldName: "source" },
            key
          ),
          ...instance.overrides === void 0 ? {} : {
            overrides: instance.overrides.map(
              (override) => externalizeOverride(override, resolveSchema, context, key)
            )
          }
        }
      }
    };
  }
  for (const [arrayIndex, guid] of (normalized.skinGuids ?? []).entries()) {
    if (typeof guid !== "string") return err3({ field: "skinGuids", value: guid });
    addRef(context, guid, { componentName: "<scene>", fieldName: "skinGuids", arrayIndex });
  }
  return ok3({
    payload: {
      kind: "scene",
      entities,
      ...normalized.skinGuids === void 0 ? {} : {
        skinGuids: normalized.skinGuids.map((guid) => context.indexByGuid.get(guid))
      }
    },
    refs: context.refs
  });
}

// src/instances/keyed.ts
import { classifyEntityField, remapEntityFieldValue } from "../../ecs/dist/externalization/index.mjs";
import { componentSchema } from "../../ecs/dist/internal.mjs";
import {
  err as err4,
  ok as ok4,
  PACK_ERROR_HINTS
} from "../../types/dist/index.mjs";
function fail(reason, detail = {}) {
  return err4({
    code: "asset-package-invalid",
    expected: "a keyed SceneAsset with valid entity and instance addresses",
    hint: "repair the SceneAsset source and recook the asset",
    detail: { reason, ...detail }
  });
}
function keyList(entities) {
  return Object.keys(entities).sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
}
function addressParts(value) {
  if (typeof value === "string" && value.length > 0) return [value];
  if (Number.isSafeInteger(value)) return [String(value)];
  if (!Array.isArray(value) || value.length === 0) return void 0;
  if (!value.every((part) => typeof part === "string" && part.length > 0)) return void 0;
  return value;
}
function fieldRemap(world, componentName, fields, resolveAddress, entityKey) {
  const token = world.components.resolve(componentName);
  if (token === void 0) return fail("unknown component", { component: componentName });
  const schema = componentSchema(token);
  const out = {};
  for (const [fieldName, value] of Object.entries(
    migrateLegacySceneComponentFields(componentName, fields)
  )) {
    const fieldType = schema[fieldName];
    if (fieldType === void 0) {
      return fail("unknown component field", {
        component: componentName,
        field: fieldName,
        ...entityKey === void 0 ? {} : { entity: entityKey }
      });
    }
    const kind = classifyEntityField(token, fieldName);
    if (kind === null) {
      out[fieldName] = value;
      continue;
    }
    const remap = (address) => resolveAddress(address, `${componentName}.${fieldName}`) ?? address;
    if (kind.isArray) {
      if (!Array.isArray(value))
        return fail("array entity field is not an array", {
          component: componentName,
          field: fieldName
        });
      const numeric = [];
      for (const item of value) {
        const parts2 = addressParts(item);
        if (parts2 === void 0)
          return fail("invalid entity address", {
            component: componentName,
            field: fieldName,
            address: item
          });
        const slot2 = resolveAddress(parts2, `${componentName}.${fieldName}`);
        if (slot2 === void 0)
          return fail("missing entity address target", {
            component: componentName,
            field: fieldName,
            address: parts2
          });
        numeric.push(slot2);
      }
      out[fieldName] = remapEntityFieldValue(numeric, kind, remap);
      continue;
    }
    if (value === null) {
      out[fieldName] = null;
      continue;
    }
    const parts = addressParts(value);
    if (parts === void 0)
      return fail("invalid entity address", {
        component: componentName,
        field: fieldName,
        address: value
      });
    const slot = resolveAddress(parts, `${componentName}.${fieldName}`);
    if (slot === void 0)
      return fail("missing entity address target", {
        component: componentName,
        field: fieldName,
        address: parts
      });
    out[fieldName] = remapEntityFieldValue(slot, kind, remap);
  }
  return ok4(out);
}
function compileKeyedSceneAsset(world, handle, asset, context) {
  asset = normalizeLegacySceneAsset(asset);
  if (asset.kind !== "scene" || asset.entities === null || typeof asset.entities !== "object" || Array.isArray(asset.entities)) {
    return fail("entities must be a keyed object");
  }
  const currentRaw = Number(handle);
  const activeStack = context.stack.has(currentRaw) ? context.stack : /* @__PURE__ */ new Set([...context.stack, currentRaw]);
  const keys = keyList(asset.entities);
  if (keys.some((key) => key.length === 0)) return fail("entity keys must be non-empty");
  const ownKeys = keys.filter((key) => asset.entities[key]?.instance === void 0);
  const instanceKeys = keys.filter((key) => asset.entities[key]?.instance !== void 0);
  const ownSlotByKey = /* @__PURE__ */ new Map();
  const instanceSlotByKey = /* @__PURE__ */ new Map();
  const keyByLocalId = /* @__PURE__ */ new Map();
  for (let index = 0; index < ownKeys.length; index += 1) {
    const key = ownKeys[index];
    ownSlotByKey.set(key, index);
    keyByLocalId.set(index, key);
  }
  for (let index = 0; index < instanceKeys.length; index += 1) {
    const key = instanceKeys[index];
    const slot = ownKeys.length + index;
    instanceSlotByKey.set(key, slot);
    keyByLocalId.set(slot, key);
  }
  const childCompiled = /* @__PURE__ */ new Map();
  for (const key of instanceKeys) {
    const declaration = asset.entities[key]?.instance;
    if (declaration === void 0 || typeof declaration.source !== "string" || declaration.source.length === 0) {
      return fail("instance source must be a non-empty GUID", { entity: key });
    }
    const childHandle = context.resolveSource(declaration.source, handle);
    if (!childHandle.ok) return childHandle;
    const childRaw = Number(childHandle.value);
    if (activeStack.has(childRaw)) {
      return err4({
        code: "pack-cyclic-reference",
        expected: "acyclic SceneAsset instance graph",
        hint: PACK_ERROR_HINTS["pack-cyclic-reference"],
        detail: {
          code: "pack-cyclic-reference",
          kind: "mount-asset",
          cycle: [...activeStack, childRaw].map(String)
        }
      });
    }
    const childAsset = context.resolveAsset(childHandle.value);
    if (!childAsset.ok) return childAsset;
    const childContext = {
      ...context,
      stack: activeStack
    };
    const compiled = compileKeyedSceneAsset(
      world,
      childHandle.value,
      childAsset.value,
      childContext
    );
    if (!compiled.ok) return compiled;
    childCompiled.set(key, { handle: childHandle.value, compiled: compiled.value });
  }
  const mountKeyByLocalId = /* @__PURE__ */ new Map();
  const mounts = [];
  let nextMemberFirst = ownKeys.length + instanceKeys.length;
  for (let index = 0; index < instanceKeys.length; index += 1) {
    const key = instanceKeys[index];
    const slot = instanceSlotByKey.get(key);
    const child = childCompiled.get(key);
    const node = asset.entities[key];
    mountKeyByLocalId.set(slot, key);
    mounts.push({
      localId: slot,
      source: Number(child.handle),
      memberFirst: nextMemberFirst,
      memberCount: child.compiled.asset.entities.length + (child.compiled.asset.mounts?.length ?? 0) + (child.compiled.asset.mounts ?? []).reduce((sum, mount) => sum + mount.memberCount, 0),
      ...Object.keys(node.components).length > 0 ? { components: node.components } : {}
    });
    nextMemberFirst += mounts[index]?.memberCount ?? 0;
  }
  const mountByKey = /* @__PURE__ */ new Map();
  for (const mount of mounts)
    mountByKey.set(mountKeyByLocalId.get(Number(mount.localId)), mount);
  const resolveInChild = (childResult, value, _field) => {
    const parts = addressParts(value);
    if (parts === void 0) return void 0;
    return childResult.resolveAddress(parts);
  };
  const resolveAddress = (value, field) => {
    const parts = addressParts(value);
    if (parts === void 0) return void 0;
    const first = parts[0];
    if (first === void 0) return void 0;
    const own = ownSlotByKey.get(first) ?? instanceSlotByKey.get(first);
    if (own !== void 0 && parts.length === 1) return own;
    const mount = mountByKey.get(first);
    if (mount === void 0) return void 0;
    const child = childCompiled.get(first);
    if (child === void 0) return void 0;
    const childSlot = resolveInChild(child.compiled, parts.slice(1), field);
    return childSlot === void 0 ? void 0 : mount.memberFirst + childSlot;
  };
  for (const key of instanceKeys) {
    const node = asset.entities[key];
    const mount = mountByKey.get(key);
    const convertedFields = Object.fromEntries(
      Object.entries(node.components).map(([componentName, raw]) => [
        componentName,
        fieldRemap(
          world,
          componentName,
          { ...raw },
          resolveAddress,
          key
        )
      ])
    );
    const bad = Object.values(convertedFields).find((result) => !result.ok);
    if (bad !== void 0 && !bad.ok) return bad;
    const components = {};
    for (const [componentName, result] of Object.entries(convertedFields)) {
      if (!result.ok) return result;
      components[componentName] = result.value;
    }
    const index = mounts.findIndex((item) => item.localId === mount.localId);
    if (index >= 0) {
      const childOf = components.ChildOf?.parent;
      if (typeof childOf === "number") {
        const { ChildOf: _ignored, ...mountComponents } = components;
        void _ignored;
        mounts[index] = { ...mount, components: mountComponents, parent: childOf };
      } else {
        mounts[index] = { ...mount, components };
      }
    }
  }
  const converted = [];
  for (const key of ownKeys) {
    const node = asset.entities[key];
    const components = {};
    for (const [componentName, raw] of Object.entries(node.components)) {
      const convertedFields = fieldRemap(
        world,
        componentName,
        { ...raw },
        resolveAddress,
        key
      );
      if (!convertedFields.ok) return convertedFields;
      components[componentName] = convertedFields.value;
    }
    converted.push({ localId: ownSlotByKey.get(key), components });
  }
  const childHasComponent = (result, target, componentName) => {
    const own = result.asset.entities.find((entity) => Number(entity.localId) === target);
    if (own !== void 0 && own.components[componentName] !== void 0) return true;
    const mount = result.asset.mounts?.find((entry) => Number(entry.localId) === target);
    return mount?.components?.[componentName] !== void 0;
  };
  for (const key of instanceKeys) {
    const node = asset.entities[key];
    const declaration = node.instance;
    const mount = mountByKey.get(key);
    const child = childCompiled.get(key);
    const childSlot = (target) => resolveInChild(child.compiled, target, `${key}.instance`);
    const overrides = [];
    for (const override of declaration.overrides ?? []) {
      const target = childSlot(override.target);
      if (target === void 0)
        return fail("instance override target does not exist", {
          entity: key,
          target: override.target
        });
      for (const [componentName, fields] of Object.entries(override.components)) {
        const convertedFields = fieldRemap(
          world,
          componentName,
          { ...fields },
          resolveAddress,
          `${key}.instance.${override.target.join(".")}`
        );
        if (!convertedFields.ok) return convertedFields;
        if (!childHasComponent(child.compiled, target, componentName)) {
          overrides.push({
            localId: mount.memberFirst + target,
            comp: componentName,
            value: convertedFields.value
          });
        } else {
          overrides.push(
            ...Object.entries(convertedFields.value).map(([field, value]) => ({
              localId: mount.memberFirst + target,
              comp: componentName,
              field,
              value
            }))
          );
        }
      }
    }
    if (overrides.length > 0) {
      const index = mounts.findIndex((item) => item.localId === mount.localId);
      const existing = mounts[index];
      if (index >= 0 && existing !== void 0) mounts[index] = { ...existing, overrides };
    }
  }
  const rootLocalIds = [
    ...convertedRootLocalIds(converted),
    ...mounts.filter((mount) => mount.parent === void 0).map((mount) => Number(mount.localId))
  ];
  const hierarchyParentByLocalId = /* @__PURE__ */ new Map();
  for (const node of converted) {
    const parent = node.components.ChildOf?.parent;
    if (typeof parent === "number" && parent >= 0) {
      hierarchyParentByLocalId.set(Number(node.localId), parent);
    }
  }
  for (const mount of mounts) {
    if (mount.parent !== void 0) {
      hierarchyParentByLocalId.set(Number(mount.localId), mount.parent);
    }
    const key = mountKeyByLocalId.get(Number(mount.localId));
    const child = key === void 0 ? void 0 : childCompiled.get(key);
    if (child !== void 0) {
      for (const [childLocalId, childParent] of child.compiled.hierarchyParentByLocalId) {
        hierarchyParentByLocalId.set(
          Number(mount.memberFirst) + childLocalId,
          Number(mount.memberFirst) + childParent
        );
      }
      for (const childRoot of child.compiled.rootLocalIds) {
        hierarchyParentByLocalId.set(Number(mount.memberFirst) + childRoot, Number(mount.localId));
      }
    }
    for (const override of mount.overrides ?? []) {
      if (override.comp !== "ChildOf") continue;
      if (override.field === "parent" && typeof override.value === "number") {
        hierarchyParentByLocalId.set(Number(override.localId), override.value);
      } else if (override.field === void 0 && typeof override.value === "object" && override.value !== null) {
        const parentValue = override.value.parent;
        if (typeof parentValue === "number") {
          hierarchyParentByLocalId.set(Number(override.localId), parentValue);
        }
      }
    }
  }
  for (const start of hierarchyParentByLocalId.keys()) {
    const seen = /* @__PURE__ */ new Set();
    let current = start;
    while (current !== void 0 && hierarchyParentByLocalId.has(current)) {
      if (seen.has(current))
        return fail("hierarchy cycle", { entity: keyByLocalId.get(start), address: [...seen] });
      seen.add(current);
      current = hierarchyParentByLocalId.get(current);
    }
  }
  return ok4({
    asset: {
      kind: "scene",
      entities: converted,
      ...mounts.length > 0 ? { mounts } : {},
      ...asset.skinGuids === void 0 ? {} : { skinGuids: asset.skinGuids }
    },
    keyByLocalId,
    mountKeyByLocalId,
    rootLocalIds,
    hierarchyParentByLocalId,
    resolveAddress
  });
}
function convertedRootLocalIds(nodes) {
  return nodes.filter((node) => node.components.ChildOf === void 0).map((node) => Number(node.localId));
}

// src/instances/scene-instances.ts
import {
  ENTITY_NULL_RAW
} from "../../ecs/dist/index.mjs";
import { classifyEntityField as classifyEntityField2, remapEntityFieldValue as remapEntityFieldValue2 } from "../../ecs/dist/externalization/index.mjs";
import { componentSchema as componentSchema2 } from "../../ecs/dist/internal.mjs";
import { fillComponentDefaults, StaleEntityError } from "../../ecs/dist/projection/index.mjs";
import {
  err as err5,
  ok as ok5,
  PACK_ERROR_HINTS as PACK_ERROR_HINTS2,
  toUnique,
  unwrapHandle
} from "../../types/dist/index.mjs";

// src/instances/state.ts
var sceneWorldStates = /* @__PURE__ */ new WeakMap();
function sceneWorldState(world) {
  const current = sceneWorldStates.get(world);
  if (current !== void 0) return current;
  const created = { resolver: null, statePayloads: /* @__PURE__ */ new Map() };
  sceneWorldStates.set(world, created);
  return created;
}
function mountOverrideStateKey(ov) {
  return ov.field !== void 0 ? `${ov.comp}:${ov.field}` : ov.comp;
}
function isPrimitiveScalarFieldType(fieldType) {
  if (fieldType === "f32" || fieldType === "f64" || fieldType === "u32" || fieldType === "i32" || fieldType === "u8" || fieldType === "i8" || fieldType === "u16" || fieldType === "i16" || fieldType === "bool" || fieldType === "string") {
    return true;
  }
  return fieldType.startsWith("enum<");
}
function primitiveJsType(fieldType) {
  if (fieldType === "bool") return "boolean";
  if (fieldType === "string") return "string";
  return "number";
}

// src/instances/scene-instances.ts
var entityIndex = (entity) => entity & 16777215;
var entityGeneration = (entity) => entity >>> 24 & 255;
function collectSceneEntityBindings(world, root, prefix, bindings, visited = /* @__PURE__ */ new Set()) {
  const rootRaw = root;
  if (visited.has(rootRaw)) return;
  visited.add(rootRaw);
  const state = worldResolveSceneInstanceStatePayload(world, root);
  if (!state.ok) return;
  const sceneInstance = world.components.resolve("SceneInstance");
  if (sceneInstance === void 0) return;
  const component = world.get(root, sceneInstance);
  if (!component.ok) return;
  const mapping = component.value.mapping;
  for (const [slot, key] of state.value.keyByLocalId) {
    const raw = mapping[slot];
    if (raw === void 0 || raw === ENTITY_NULL_RAW) continue;
    const address = prefix.length === 0 ? key : [...prefix, key];
    bindings.set(sceneEntityAddressKey(address), raw);
  }
  for (const childRoot of state.value.mountRoots) {
    const childState = worldResolveSceneInstanceStatePayload(world, childRoot);
    const childKey = childState.ok ? childState.value.instanceKey : void 0;
    if (childKey === void 0) continue;
    collectSceneEntityBindings(world, childRoot, [...prefix, childKey], bindings, visited);
  }
}
function worldSetSceneAssetResolver(world, resolver) {
  sceneWorldState(world).resolver = resolver;
}
function worldGetSceneAssetResolver(world) {
  return sceneWorldState(world).resolver;
}
function worldInstantiateScene(world, handle, parent, sceneSourceKey) {
  const stack = /* @__PURE__ */ new Set();
  const diagnostics = [];
  const r = worldInstantiateSceneRec(
    world,
    handle,
    parent,
    stack,
    diagnostics,
    void 0,
    sceneSourceKey
  );
  if (!r.ok) return r;
  return ok5({ root: r.value, diagnostics });
}
function worldInstantiateScenePayload(world, asset, parent) {
  const handle = world.allocSharedRef("SceneAsset", asset);
  try {
    return worldInstantiateScene(world, handle, parent);
  } finally {
    world.sharedRefs.release(handle);
  }
}
function worldInstantiateSceneFlat(world, handle) {
  const stack = /* @__PURE__ */ new Set();
  const diagnostics = [];
  const handleKey = unwrapHandle(handle);
  const resolved = worldResolveSceneAsset(world, handle);
  if (!resolved.ok) return resolved;
  stack.add(handleKey);
  let r;
  try {
    r = worldInstantiateSceneAssetFlat(world, handle, resolved.value, stack, diagnostics);
  } finally {
    stack.delete(handleKey);
  }
  if (!r.ok) return r;
  return ok5({ ...r.value, diagnostics });
}
function worldInstantiateSceneRec(world, handle, parent, stack, diagnostics, instanceKey, sceneSourceKey) {
  const handleKey = unwrapHandle(handle);
  if (stack.has(handleKey)) {
    const cycleArr = [];
    for (const k of stack) cycleArr.push(String(k));
    cycleArr.push(String(handleKey));
    const detail = {
      code: "pack-cyclic-reference",
      kind: "mount-asset",
      cycle: cycleArr
    };
    return err5({
      code: "pack-cyclic-reference",
      expected: "acyclic SceneAsset mount graph",
      hint: PACK_ERROR_HINTS2["pack-cyclic-reference"],
      detail
    });
  }
  const resolved = worldResolveSceneAsset(world, handle);
  if (!resolved.ok) return resolved;
  const asset = resolved.value;
  stack.add(handleKey);
  try {
    return worldInstantiateSceneAsset(
      world,
      handle,
      asset,
      parent,
      stack,
      diagnostics,
      instanceKey,
      sceneSourceKey
    );
  } finally {
    stack.delete(handleKey);
  }
}
function worldResolveSceneAsset(world, handle) {
  const r = world.sharedRefs.resolve(handle);
  if (!r.ok) {
    return err5(r.error);
  }
  return ok5(r.value);
}
function worldSpawnSceneMembers(world, handle, asset, stack, diagnostics, mountKeys) {
  const sceneInstanceToken = world.components.resolve("SceneInstance");
  if (sceneInstanceToken === void 0) {
    return err5(new ComponentNotDefinedError("SceneInstance"));
  }
  const childOfToken = world.components.resolve("ChildOf");
  const ownEntities = asset.entities;
  const ownMounts = asset.mounts ?? [];
  const memberSum = ownMounts.reduce((s, m) => s + m.memberCount, 0);
  const countBaseline = ownEntities.length + ownMounts.length + memberSum;
  let maxLocalId = ownEntities.reduce((m, e) => Math.max(m, e.localId), -1);
  for (const mount of ownMounts) {
    maxLocalId = Math.max(maxLocalId, mount.localId);
    const last = mount.memberFirst + mount.memberCount - 1;
    maxLocalId = Math.max(maxLocalId, last);
  }
  const totalSlots = Math.max(countBaseline, maxLocalId + 1);
  {
    const claims = /* @__PURE__ */ new Map();
    const overlapLids = /* @__PURE__ */ new Set();
    const overlapSources = [];
    const claim = (lid, src) => {
      const prior = claims.get(lid);
      if (prior !== void 0) {
        if (!overlapLids.has(lid)) {
          overlapLids.add(lid);
          overlapSources.push(prior);
          overlapSources.push(src);
        } else {
          overlapSources.push(src);
        }
        return;
      }
      claims.set(lid, src);
    };
    for (const ent of ownEntities) {
      claim(ent.localId, `entities[${ent.localId}]`);
    }
    for (const mount of ownMounts) {
      const mLid = mount.localId;
      claim(mLid, `mount[${mLid}]`);
      const first = mount.memberFirst;
      for (let k = 0; k < mount.memberCount; k += 1) {
        claim(first + k, `mount[${mLid}].member[${k}]`);
      }
    }
    if (overlapLids.size > 0) {
      const overlapping = Array.from(overlapLids).sort((a, b) => a - b);
      return err5({
        code: "pack-mount-localid-overlap",
        expected: "each LocalEntityId claimed by exactly one entity or mount slot",
        hint: PACK_ERROR_HINTS2["pack-mount-localid-overlap"],
        detail: {
          code: "pack-mount-localid-overlap",
          overlapping,
          sources: overlapSources
        }
      });
    }
  }
  const mapping = new Uint32Array(totalSlots).fill(ENTITY_NULL_RAW);
  const entityToLocalId = /* @__PURE__ */ new Map();
  const rootEntities = [];
  const mountEntities = [];
  const mountEntitiesNeedingRootParent = [];
  const mountEntitiesNeedingDeferredParent = [];
  const mountInstances = [];
  for (const mount of ownMounts) {
    const overrideValidationRes = worldValidateMountOverrides(world, mount);
    if (!overrideValidationRes.ok) {
      return overrideValidationRes;
    }
    const mountLid = mount.localId;
    const mountSpawnRes = worldSpawnMountEntity(world, mount, mapping, diagnostics);
    if (!mountSpawnRes.ok) return mountSpawnRes;
    const mountEntity = mountSpawnRes.value;
    mountEntities.push(mountEntity);
    mapping[mountLid] = mountEntity;
    const childHandleRes = worldResolveMountSource(world, mount.source, handle);
    if (!childHandleRes.ok) return childHandleRes;
    const childHandle = childHandleRes.value;
    const childRes = worldInstantiateSceneRec(
      world,
      childHandle,
      mountEntity,
      stack,
      diagnostics,
      mountKeys?.get(mountLid)
    );
    if (!childRes.ok) return childRes;
    const childInstRes = world.get(childRes.value, sceneInstanceToken);
    if (!childInstRes.ok) return childInstRes;
    const childMapping = childInstRes.value.mapping;
    mountInstances.push({
      mount,
      root: childRes.value,
      mapping: childMapping,
      ...mountKeys?.get(mountLid) === void 0 ? {} : { key: mountKeys.get(mountLid) }
    });
    if (childMapping.length !== mount.memberCount) {
      return err5({
        code: "pack-mount-count-mismatch",
        expected: "mount.memberCount === child SceneAsset totalSlots",
        hint: PACK_ERROR_HINTS2["pack-mount-count-mismatch"],
        detail: {
          code: "pack-mount-count-mismatch",
          mountLocalId: mountLid,
          declared: mount.memberCount,
          actual: childMapping.length
        }
      });
    }
    const window = mount.memberCount;
    for (let k = 0; k < window; k += 1) {
      mapping[mount.memberFirst + k] = childMapping[k] ?? ENTITY_NULL_RAW;
    }
    if (childOfToken !== void 0) {
      if (mount.parent !== void 0) {
        const parentSlot = mount.parent;
        const parentEntity = mapping[parentSlot];
        if (parentEntity !== void 0 && parentEntity !== ENTITY_NULL_RAW) {
          const r = world.addComponent(mountEntity, {
            component: childOfToken,
            data: { parent: parentEntity }
          });
          if (!r.ok) {
            const set = world.set(mountEntity, childOfToken, {
              parent: parentEntity
            });
            if (!set.ok) return set;
          }
        } else {
          mountEntitiesNeedingDeferredParent.push([mountEntity, parentSlot]);
        }
      } else {
        mountEntitiesNeedingRootParent.push(mountEntity);
      }
    }
  }
  const order = sceneTopoSort(ownEntities);
  for (const idx of order) {
    const node = ownEntities[idx];
    if (node === void 0) continue;
    const lid = node.localId;
    const compDataRes = worldBuildSceneEntityComponentDatas(world, node, mapping, diagnostics);
    if (!compDataRes.ok) return compDataRes;
    const sp = world.spawn(
      ...compDataRes.value
    );
    if (!sp.ok) return sp;
    const e = sp.value;
    mapping[lid] = e;
    entityToLocalId.set(e, lid);
    if (node.components.ChildOf === void 0) {
      rootEntities.push(e);
    }
  }
  if (childOfToken !== void 0) {
    for (const [mountEntity, parentSlot] of mountEntitiesNeedingDeferredParent) {
      const parentEntity = mapping[parentSlot];
      if (parentEntity === void 0 || parentEntity === ENTITY_NULL_RAW) continue;
      const set = world.set(mountEntity, childOfToken, { parent: parentEntity });
      if (!set.ok) {
        const r = world.addComponent(mountEntity, {
          component: childOfToken,
          data: { parent: parentEntity }
        });
        if (!r.ok) return r;
      }
    }
  }
  return ok5({
    mapping,
    entityToLocalId,
    rootEntities,
    mountEntitiesNeedingRootParent,
    mountEntities,
    mountInstances,
    totalSlots
  });
}
function worldInstantiateSceneAsset(world, handle, asset, parent, stack, diagnostics, instanceKey, sceneSourceKey) {
  const sceneInstanceToken = world.components.resolve("SceneInstance");
  if (sceneInstanceToken === void 0) {
    return err5(new ComponentNotDefinedError("SceneInstance"));
  }
  const childOfToken = world.components.resolve("ChildOf");
  const compiled = compileKeyedSceneAsset(world, handle, asset, {
    resolveSource: (source, parentHandle) => worldResolveMountSource(world, source, parentHandle),
    resolveAsset: (childHandle) => worldResolveSceneAsset(world, childHandle),
    stack
  });
  if (!compiled.ok) return err5(compiled.error);
  const compiledAsset = compiled.value.asset;
  const membersRes = worldSpawnSceneMembers(
    world,
    handle,
    compiledAsset,
    stack,
    diagnostics,
    compiled.value.mountKeyByLocalId
  );
  if (!membersRes.ok) return membersRes;
  const { mapping, entityToLocalId, rootEntities, mountEntitiesNeedingRootParent, totalSlots } = membersRes.value;
  const { mountInstances } = membersRes.value;
  const ownMounts = compiledAsset.mounts ?? [];
  let stateRef;
  stateRef = world.allocUniqueRef("SceneInstanceState", null, () => {
    sceneWorldState(world).statePayloads.delete(Number(stateRef));
  });
  const mappingPlain = Array.from(mapping);
  const rootComponents = [
    {
      component: sceneInstanceToken,
      data: {
        source: handle,
        mapping: mappingPlain,
        state: stateRef
      }
    }
  ];
  const transformToken = world.components.resolve("Transform");
  if (transformToken !== void 0) {
    rootComponents.push({
      component: transformToken,
      data: {}
    });
  }
  const rootSpawn = world.spawn(
    ...rootComponents
  );
  if (!rootSpawn.ok) {
    return rootSpawn;
  }
  const rootEntity = rootSpawn.value;
  const overrides = /* @__PURE__ */ new Map();
  for (const mount of ownMounts) {
    for (const ov of mount.overrides ?? []) {
      const lid = ov.localId;
      let fieldMap = overrides.get(lid);
      if (fieldMap === void 0) {
        fieldMap = /* @__PURE__ */ new Map();
        overrides.set(lid, fieldMap);
      }
      fieldMap.set(mountOverrideStateKey(ov), ov);
      const memberEntityRaw = mapping[lid];
      if (memberEntityRaw !== void 0 && memberEntityRaw !== ENTITY_NULL_RAW) {
        const memberEntity = memberEntityRaw;
        const applyRes = worldApplyMountOverride(
          world,
          memberEntity,
          worldRemapMountOverride(world, ov, mapping)
        );
        if (!applyRes.ok) {
          return applyRes;
        }
      }
    }
  }
  const detached = /* @__PURE__ */ new Set();
  const bindings = /* @__PURE__ */ new Map();
  const state = {
    source: handle,
    ...sceneSourceKey === void 0 ? {} : { sceneSourceKey },
    keyByLocalId: new Map(compiled.value.keyByLocalId),
    ...instanceKey === void 0 ? {} : { instanceKey },
    bindings,
    entityToLocalId,
    detachedLocalIds: detached,
    // Convert overrides Map<LocalEntityId, Map<string, MountOverride>>
    // into Map<LocalEntityId, Map<string, SceneInstanceOverrideRecord>>
    overrides: worldMountOverridesToStateMap(overrides),
    rootEntities,
    mountRoots: mountInstances.map(({ root }) => root),
    totalSlots,
    mountTimeOverrides: ownMounts.flatMap((m) => m.overrides ?? [])
  };
  worldSetUniqueRefPayload(world, stateRef, state);
  collectSceneEntityBindings(world, rootEntity, [], bindings);
  if (childOfToken !== void 0) {
    for (const rootE of rootEntities) {
      const has = world.get(rootE, childOfToken);
      if (!has.ok) {
        const r = world.addComponent(rootE, {
          component: childOfToken,
          data: { parent: rootEntity }
        });
        if (!r.ok) return r;
      }
    }
    for (const mountE of mountEntitiesNeedingRootParent) {
      const set = world.set(mountE, childOfToken, { parent: rootEntity });
      if (!set.ok) {
        const r = world.addComponent(mountE, {
          component: childOfToken,
          data: { parent: rootEntity }
        });
        if (!r.ok) return r;
      }
    }
    if (parent !== void 0) {
      const r = world.addComponent(rootEntity, {
        component: childOfToken,
        data: { parent }
      });
      if (!r.ok) return r;
    }
  }
  return ok5(rootEntity);
}
function worldInstantiateSceneAssetFlat(world, handle, asset, stack, diagnostics) {
  const compiled = compileKeyedSceneAsset(world, handle, asset, {
    resolveSource: (source, parentHandle) => worldResolveMountSource(world, source, parentHandle),
    resolveAsset: (childHandle) => worldResolveSceneAsset(world, childHandle),
    stack
  });
  if (!compiled.ok) return err5(compiled.error);
  const membersRes = worldSpawnSceneMembers(
    world,
    handle,
    compiled.value.asset,
    stack,
    diagnostics,
    compiled.value.mountKeyByLocalId
  );
  if (!membersRes.ok) return membersRes;
  const { rootEntities, mountEntitiesNeedingRootParent, mountEntities, mountInstances } = membersRes.value;
  const childOfToken = world.components.resolve("ChildOf");
  for (const { mount, root, mapping: childMapping } of mountInstances) {
    const childStateRes = worldGetSceneInstanceState(world, root);
    if (!childStateRes.ok) return childStateRes;
    for (const ov of mount.overrides ?? []) {
      const childLocalId = ov.localId - mount.memberFirst;
      const memberEntityRaw = childMapping[childLocalId];
      if (memberEntityRaw === void 0 || memberEntityRaw === ENTITY_NULL_RAW) continue;
      const memberEntity = memberEntityRaw;
      const applyRes = worldApplyMountOverride(
        world,
        memberEntity,
        worldRemapMountOverride(world, ov, childMapping)
      );
      if (!applyRes.ok) {
        return applyRes;
      }
      let fieldMap = childStateRes.value.overrides.get(childLocalId);
      if (fieldMap === void 0) {
        fieldMap = /* @__PURE__ */ new Map();
        childStateRes.value.overrides.set(childLocalId, fieldMap);
      }
      fieldMap.set(mountOverrideStateKey(ov), {
        comp: ov.comp,
        ...ov.field === void 0 ? {} : { field: ov.field },
        value: ov.value
      });
    }
  }
  if (childOfToken !== void 0) {
    for (const mountE of mountEntitiesNeedingRootParent) {
      const co = world.get(mountE, childOfToken);
      if (co.ok && co.value.parent === ENTITY_NULL_RAW) {
        world.removeComponent(mountE, childOfToken);
      }
    }
  }
  return ok5({ roots: [...rootEntities, ...mountEntitiesNeedingRootParent], mountEntities });
}
function worldBuildSceneEntityComponentDatas(world, node, mapping, _diagnostics) {
  const out = [];
  const nodeLocalId = node.localId;
  for (const compName of Object.keys(node.components)) {
    const token = world.components.resolve(compName);
    if (token === void 0) {
      return err5(new ComponentNotDefinedError(compName));
    }
    const raw = node.components[compName] ?? {};
    const schema = componentSchema2(token);
    const remappedRaw = {};
    for (const fieldName of Object.keys(raw)) {
      const fieldType = schema[fieldName];
      if (fieldType === void 0) {
        return err5({
          code: "spawn-data-unknown-field",
          expected: `field name in {${Object.keys(schema).sort().join(", ")}}`,
          hint: `unknown field '${fieldName}' on component '${compName}' at scene localId ${nodeLocalId}`,
          detail: {
            component: compName,
            field: fieldName,
            entity: nodeLocalId,
            knownFields: Object.keys(schema).sort()
          }
        });
      }
      const value = raw[fieldName];
      const kind = classifyEntityField2(token, fieldName);
      if (kind !== null) {
        const sceneRemap = (localId) => {
          if (localId < 0 || localId >= mapping.length) return ENTITY_NULL_RAW;
          const live = mapping[localId];
          return live === void 0 || live === ENTITY_NULL_RAW ? ENTITY_NULL_RAW : live;
        };
        remappedRaw[fieldName] = remapEntityFieldValue2(value, kind, sceneRemap);
      } else {
        remappedRaw[fieldName] = value;
      }
    }
    const filled = fillComponentDefaults(token, remappedRaw);
    out.push({ component: token, data: filled });
  }
  return ok5(out);
}
function worldRemapMountOverride(world, override, mapping) {
  const token = world.components.resolve(override.comp);
  if (token === void 0) return override;
  const remapField = (field, value2) => {
    const kind = classifyEntityField2(token, field);
    if (kind === null) return value2;
    const toLive = (slot) => {
      if (slot < 0 || slot >= mapping.length) return ENTITY_NULL_RAW;
      return mapping[slot] ?? ENTITY_NULL_RAW;
    };
    return remapEntityFieldValue2(value2, kind, toLive);
  };
  if (override.field !== void 0) {
    return { ...override, value: remapField(override.field, override.value) };
  }
  if (typeof override.value !== "object" || override.value === null || Array.isArray(override.value)) {
    return override;
  }
  const value = {};
  for (const [field, fieldValue] of Object.entries(override.value)) {
    value[field] = remapField(field, fieldValue);
  }
  return { ...override, value };
}
function worldApplyMountOverride(world, member, ov) {
  const ovToken = world.components.resolve(ov.comp);
  if (ovToken === void 0) return ok5(void 0);
  if (ov.field !== void 0) {
    return world.set(member, ovToken, { [ov.field]: ov.value });
  }
  const rawValue = ov.value ?? {};
  const filled = fillComponentDefaults(ovToken, rawValue);
  const has = world.get(member, ovToken);
  if (has.ok) {
    return world.set(member, ovToken, filled);
  }
  return world.addComponent(member, { component: ovToken, data: filled });
}
function worldValidateMountOverrides(world, mount) {
  const overrides = mount.overrides;
  if (overrides === void 0) return ok5(void 0);
  const memberFirst = mount.memberFirst;
  const memberCount = mount.memberCount;
  const memberLast = memberFirst + memberCount;
  const mountLid = mount.localId;
  for (const ov of overrides) {
    const ovLid = ov.localId;
    if (ovLid < memberFirst || ovLid >= memberLast) {
      return err5({
        code: "pack-mount-override-localid-out-of-range",
        expected: `override.localId in [${memberFirst}, ${memberLast})`,
        hint: PACK_ERROR_HINTS2["pack-mount-override-localid-out-of-range"],
        detail: {
          code: "pack-mount-override-localid-out-of-range",
          overrideLocalId: ovLid,
          mountLocalId: mountLid,
          memberCount
        }
      });
    }
    const ovToken = world.components.resolve(ov.comp);
    if (ov.field !== void 0) {
      if (ovToken !== void 0) {
        const schema = componentSchema2(ovToken);
        if (!(ov.field in schema)) {
          return err5({
            code: "pack-mount-override-unknown-field",
            expected: `override.field defined on component '${ov.comp}'`,
            hint: PACK_ERROR_HINTS2["pack-mount-override-unknown-field"],
            detail: {
              code: "pack-mount-override-unknown-field",
              comp: ov.comp,
              field: ov.field,
              mountLocalId: mountLid
            }
          });
        }
      }
    } else {
      if (ovToken === void 0) {
        return err5(new ComponentNotDefinedError(ov.comp));
      }
      const schema = componentSchema2(ovToken);
      const valueMap = ov.value ?? {};
      for (const key of Object.keys(valueMap)) {
        if (!(key in schema)) {
          return err5({
            code: "pack-mount-override-unknown-field",
            expected: `override.value keys defined on component '${ov.comp}'`,
            hint: PACK_ERROR_HINTS2["pack-mount-override-unknown-field"],
            detail: {
              code: "pack-mount-override-unknown-field",
              comp: ov.comp,
              field: key,
              mountLocalId: mountLid
            }
          });
        }
      }
    }
  }
  return ok5(void 0);
}
function worldSpawnMountEntity(world, mount, mapping, diagnostics) {
  const fakeNode = {
    localId: mount.localId,
    components: mount.components ?? {}
  };
  const cdRes = worldBuildSceneEntityComponentDatas(world, fakeNode, mapping, diagnostics);
  if (!cdRes.ok) return cdRes;
  const transformToken = world.components.resolve("Transform");
  if (transformToken !== void 0) {
    const hasTransform = cdRes.value.some((c) => c.component === transformToken);
    if (!hasTransform) {
      cdRes.value.push({ component: transformToken, data: {} });
    }
  }
  if (cdRes.value.length === 0) {
    const childOfToken = world.components.resolve("ChildOf");
    if (childOfToken === void 0) {
      return err5(new ComponentNotDefinedError("ChildOf"));
    }
    cdRes.value.push({
      component: childOfToken,
      data: { parent: ENTITY_NULL_RAW }
    });
  }
  return world.spawn(...cdRes.value);
}
function worldResolveMountSource(world, source, parentHandle) {
  const resolver = worldGetSceneAssetResolver(world);
  if (resolver === null) {
    return err5({
      code: "stale-entity",
      expected: "wired SceneAssetResolver (auto-wired by engine.assets.instantiate)",
      hint: "engine.assets.instantiate sugar wires this for you; call worldSetSceneAssetResolver before nested scene expansion.",
      detail: { entity: 0, slot: 0, generation: 0 }
    });
  }
  const r = resolver(source, parentHandle);
  if (!r.ok) {
    return err5(r.error);
  }
  return ok5(r.value);
}
function worldMountOverridesToStateMap(src) {
  const out = /* @__PURE__ */ new Map();
  for (const [lid, fields] of src) {
    const m = /* @__PURE__ */ new Map();
    for (const [k, v] of fields) {
      m.set(k, {
        comp: v.comp,
        value: v.value,
        ...v.field !== void 0 ? { field: v.field } : {}
      });
    }
    out.set(lid, m);
  }
  return out;
}
function worldSetUniqueRefPayload(world, handle, payload) {
  sceneWorldState(world).statePayloads.set(Number(handle), payload);
}
function worldResolveSceneInstanceStatePayload(world, root) {
  const sceneInstanceToken = world.components.resolve("SceneInstance");
  if (sceneInstanceToken === void 0) {
    return err5(new ComponentNotDefinedError("SceneInstance"));
  }
  const r = world.get(root, sceneInstanceToken);
  if (!r.ok) return r;
  const stateRefRaw = r.value.state;
  const stateRefHandle = toUnique(stateRefRaw);
  const payload = sceneWorldState(world).statePayloads.get(Number(stateRefHandle));
  if (payload === void 0) {
    return err5(
      new StaleEntityError(root, entityIndex(root), entityGeneration(root), {
        operation: "resolveSceneInstanceState",
        component: "SceneInstance",
        expectedGeneration: entityGeneration(root),
        actualGeneration: entityGeneration(root)
      })
    );
  }
  return ok5(payload);
}
function worldGetSceneInstanceState(world, root) {
  return worldResolveSceneInstanceStatePayload(world, root);
}
function worldResolveSceneEntity(world, root, ref) {
  const state = worldResolveSceneInstanceStatePayload(world, root);
  if (!state.ok) return state;
  const resolved = resolveSceneEntity(ref, {
    sceneSourceKey: state.value.sceneSourceKey ?? "",
    bindings: state.value.bindings
  });
  if (!resolved.ok) return err5(resolved.error);
  return ok5(resolved.value);
}
function worldDespawnScene(world, root, opts) {
  const dRes = worldDespawnDescendants(world, root, opts);
  if (!dRes.ok) return dRes;
  const drop = world.despawn(root);
  if (!drop.ok) return drop;
  return ok5(dRes.value + 1);
}
function worldDespawnDescendants(world, root, opts) {
  let detached = null;
  let entityToLocalId = null;
  if (opts?.keepDetached === true) {
    const stateRes = worldResolveSceneInstanceStatePayload(world, root);
    if (stateRes.ok) {
      detached = stateRes.value.detachedLocalIds;
      entityToLocalId = stateRes.value.entityToLocalId;
    }
  }
  let count = 0;
  const list = [];
  const seen = /* @__PURE__ */ new Set();
  const collect = (anchor) => {
    for (const e of world.iterDescendants(anchor)) {
      const raw = e;
      if (!seen.has(raw)) {
        seen.add(raw);
        list.push(e);
      }
    }
    const stateRes = worldResolveSceneInstanceStatePayload(world, anchor);
    if (!stateRes.ok) return;
    for (const e of stateRes.value.entityToLocalId.keys()) {
      const raw = e;
      if (!seen.has(raw)) {
        seen.add(raw);
        list.push(e);
      }
    }
    for (const nestedRoot of stateRes.value.mountRoots) {
      const raw = nestedRoot;
      if (seen.has(raw)) continue;
      seen.add(raw);
      list.push(nestedRoot);
      collect(nestedRoot);
    }
  };
  collect(root);
  const childOfToken = world.components.resolve("ChildOf");
  const owned = new Set(list.map((entity) => Number(entity)));
  const ownedDepth = (entity) => {
    if (childOfToken === void 0) return 0;
    let current = entity;
    let depth = 0;
    const visited = /* @__PURE__ */ new Set();
    while (!visited.has(Number(current))) {
      visited.add(Number(current));
      const parentRes = world.get(current, childOfToken);
      if (!parentRes.ok) break;
      const parent = parentRes.value.parent;
      if (!owned.has(Number(parent))) break;
      depth += 1;
      current = parent;
    }
    return depth;
  };
  list.sort((a, b) => ownedDepth(b) - ownedDepth(a));
  for (const e of list) {
    if (detached !== null) {
      const lid = entityToLocalId?.get(e);
      if (lid !== void 0 && detached.has(lid)) {
        if (childOfToken !== void 0) {
          world.removeComponent(e, childOfToken);
        }
        continue;
      }
    }
    const r = world.despawn(e);
    if (!r.ok) {
      if (r.error.code === "stale-entity") continue;
      return r;
    }
    count += 1;
  }
  return ok5(count);
}
function worldSetSceneOverride(world, root, member, component, field, value) {
  const stateRes = worldResolveSceneInstanceStatePayload(world, root);
  if (!stateRes.ok) return stateRes;
  const state = stateRes.value;
  const lid = state.entityToLocalId.get(member);
  if (lid === void 0) {
    return err5(
      new StaleEntityError(
        member,
        entityIndex(member),
        entityGeneration(member),
        {
          operation: "setSceneOverride",
          component: component.name,
          expectedGeneration: entityGeneration(member),
          actualGeneration: entityGeneration(member)
        }
      )
    );
  }
  const schemaType = componentSchema2(component)[field];
  if (schemaType !== void 0 && isPrimitiveScalarFieldType(schemaType)) {
    const expectJsType = primitiveJsType(schemaType);
    const actualJsType = typeof value;
    if (expectJsType !== actualJsType) {
      return err5({
        code: "scene-override-type-mismatch",
        expected: `value typeof === ${expectJsType}`,
        hint: `setSceneOverride(${component.name}.${field}) expected ${expectJsType}, got ${actualJsType}; coerce or pick a different override path.`,
        detail: {
          code: "scene-override-type-mismatch",
          comp: component.name,
          field,
          expectedType: schemaType,
          actualType: actualJsType
        }
      });
    }
  }
  const setRes = world.set(member, component, { [field]: value });
  if (!setRes.ok) return setRes;
  let fieldMap = state.overrides.get(lid);
  if (fieldMap === void 0) {
    fieldMap = /* @__PURE__ */ new Map();
    state.overrides.set(lid, fieldMap);
  }
  fieldMap.set(`${component.name}:${field}`, {
    comp: component.name,
    field,
    value
  });
  return ok5(void 0);
}
function worldRemoveSceneOverride(world, root, member, component, field) {
  const stateRes = worldResolveSceneInstanceStatePayload(world, root);
  if (!stateRes.ok) return stateRes;
  const state = stateRes.value;
  const lid = state.entityToLocalId.get(member);
  if (lid === void 0) return ok5(void 0);
  const fieldMap = state.overrides.get(lid);
  if (fieldMap !== void 0) {
    fieldMap.delete(`${component.name}:${field}`);
    if (fieldMap.size === 0) state.overrides.delete(lid);
  }
  const assetRes = worldResolveSceneAsset(world, state.source);
  if (!assetRes.ok) return assetRes;
  const key = state.keyByLocalId.get(lid);
  const node = key === void 0 ? void 0 : assetRes.value.entities[key];
  const layer1 = node?.components[component.name];
  if (layer1 !== void 0 && field in layer1) {
    const r = world.set(member, component, { [field]: layer1[field] });
    if (!r.ok) return r;
  }
  return ok5(void 0);
}
function worldDetachSceneMember(world, root, member) {
  const sceneInstanceToken = world.components.resolve("SceneInstance");
  if (sceneInstanceToken === void 0) {
    return err5(new ComponentNotDefinedError("SceneInstance"));
  }
  const stateRes = worldResolveSceneInstanceStatePayload(world, root);
  if (!stateRes.ok) return stateRes;
  const state = stateRes.value;
  const lid = state.entityToLocalId.get(member);
  if (lid === void 0) return ok5(void 0);
  state.detachedLocalIds.add(lid);
  return ok5(void 0);
}
function worldReattachSceneMember(world, root, member) {
  const stateRes = worldResolveSceneInstanceStatePayload(world, root);
  if (!stateRes.ok) return stateRes;
  const state = stateRes.value;
  const lid = state.entityToLocalId.get(member);
  if (lid === void 0) return ok5(void 0);
  state.detachedLocalIds.delete(lid);
  return ok5(void 0);
}
function worldGetSceneAssetForInstance(world, root) {
  const stateRes = worldResolveSceneInstanceStatePayload(world, root);
  if (!stateRes.ok) return stateRes;
  return ok5(stateRes.value.source);
}
function sceneTopoSort(nodes) {
  const n = nodes.length;
  const childrenOf = Array.from({ length: n }, () => []);
  const indeg = new Uint32Array(n);
  const localIdToIdx = /* @__PURE__ */ new Map();
  for (let i = 0; i < n; i += 1) {
    const node = nodes[i];
    if (node === void 0) continue;
    localIdToIdx.set(node.localId, i);
  }
  for (let i = 0; i < n; i += 1) {
    const node = nodes[i];
    if (node === void 0) continue;
    const child = node.components.ChildOf;
    if (child === void 0) continue;
    const p = child.parent;
    if (typeof p === "number") {
      const parentIdx = localIdToIdx.get(p);
      if (parentIdx !== void 0 && parentIdx !== i) {
        childrenOf[parentIdx]?.push(i);
        indeg[i] = (indeg[i] ?? 0) + 1;
      }
    }
  }
  const order = [];
  const queue = [];
  for (let i = 0; i < n; i += 1) if ((indeg[i] ?? 0) === 0) queue.push(i);
  while (queue.length > 0) {
    const head = queue.shift();
    if (head === void 0) break;
    order.push(head);
    for (const c of childrenOf[head] ?? []) {
      indeg[c] = (indeg[c] ?? 0) - 1;
      if ((indeg[c] ?? 0) === 0) queue.push(c);
    }
  }
  for (let i = 0; i < n; i += 1) {
    if (!order.includes(i) && nodes[i] !== void 0) order.push(i);
  }
  return order;
}

// src/systems/propagate-transforms.ts
import {
  defineSystem,
  defineSystemSet,
  ENTITY_NULL_RAW as ENTITY_NULL_RAW2,
  FixedUpdate,
  Update
} from "../../ecs/dist/index.mjs";
import {
  getDerivedWriter
} from "../../ecs/dist/internal.mjs";
import { worldRead } from "../../ecs/dist/world-read.mjs";
import { mat4 } from "../../math/dist/index.mjs";
import { err as err6, ok as ok6 } from "../../types/dist/index.mjs";
var PROPAGATE_TRANSFORMS_SYSTEM = "propagateTransforms";
var PROPAGATE_TRANSFORMS_FIXED_SYSTEM = "propagateTransformsFixed";
var TransformSet = defineSystemSet({ name: "transform" });
var TransformFixedSet = defineSystemSet({ name: "transform-fixed" });
var propagationTrace;
var hierarchyRootCursorAllocationCount = 0;
function createHierarchyRootCursor() {
  hierarchyRootCursorAllocationCount += 1;
  return { bindingIndex: -1, row: -1 };
}
function countPropagation(name) {
  const trace = propagationTrace;
  if (trace !== void 0) trace[name] += 1;
}
var SCRATCH = /* @__PURE__ */ new WeakMap();
var REGISTRATION_LEASES = /* @__PURE__ */ new WeakMap();
function pairError(entity, expected) {
  return err6(
    new SceneError({
      code: "hierarchy-broken",
      expected,
      hint: "attach both Transform and GlobalTransform at scene authoring or import time, then retry propagation",
      detail: { entity, parent: entity }
    })
  );
}
function ensureQueries(world, scratch) {
  if (scratch.flatQuery !== void 0 && scratch.hierarchyQuery !== void 0 && scratch.transformQuery !== void 0 && scratch.hierarchyWriter !== void 0 && scratch.transformWriter !== void 0 && scratch.missingGlobalQuery !== void 0 && scratch.missingTransformQuery !== void 0) {
    return ok6(void 0);
  }
  const flatOutput = world.query({
    read: [Transform],
    write: [GlobalTransform],
    without: [ChildOf],
    changed: [Transform]
  });
  scratch.dirtyTransforms ??= world.query({ read: [Transform], changed: [Transform] }).unwrap();
  scratch.dirtyParents ??= world.query({ read: [ChildOf], changed: [ChildOf] }).unwrap();
  scratch.dirtyGlobals ??= world.query({ read: [GlobalTransform], changed: [GlobalTransform] }).unwrap();
  const hierarchy = world.query({ read: [Transform, ChildOf], write: [GlobalTransform] });
  const transform = world.query({ read: [Transform], write: [GlobalTransform] });
  const missingGlobal = world.query({ with: [Transform], without: [GlobalTransform] });
  const missingTransform = world.query({ with: [GlobalTransform], without: [Transform] });
  if (!flatOutput.ok || !hierarchy.ok || !transform.ok || !missingGlobal.ok || !missingTransform.ok) {
    return pairError(0, "valid Transform and GlobalTransform pair queries");
  }
  const hierarchyWriter = getDerivedWriter(hierarchy.value, GlobalTransform);
  const transformWriter = getDerivedWriter(transform.value, GlobalTransform);
  if (!hierarchyWriter.ok || !transformWriter.ok) {
    return pairError(0, "dense Transform and ChildOf derived bindings");
  }
  scratch.flatQuery = flatOutput.value;
  scratch.hierarchyQuery = hierarchy.value;
  scratch.transformQuery = transform.value;
  scratch.hierarchyWriter = hierarchyWriter.value;
  scratch.transformWriter = transformWriter.value;
  scratch.missingGlobalQuery = missingGlobal.value;
  scratch.missingTransformQuery = missingTransform.value;
  return ok6(void 0);
}
function validateTransformPairs(world, scratch) {
  const queryResult = ensureQueries(world, scratch);
  if (!queryResult.ok) return queryResult;
  const missingGlobal = scratch.missingGlobalQuery;
  const missingTransform = scratch.missingTransformQuery;
  if (missingGlobal === void 0 || missingTransform === void 0) {
    return pairError(0, "valid Transform and GlobalTransform pair queries");
  }
  for (const row of missingGlobal) {
    return pairError(row.entity, "each Transform entity to carry a GlobalTransform pair");
  }
  for (const row of missingTransform) {
    return pairError(row.entity, "each GlobalTransform entity to carry a Transform pair");
  }
  return ok6(void 0);
}
function scratchFor(world) {
  const existing = SCRATCH.get(world);
  if (existing !== void 0) return existing;
  const created = {
    position: new Float32Array(3),
    rotation: new Float32Array(4),
    scale: new Float32Array(3),
    local: mat4.create(),
    parent: mat4.create(),
    candidate: mat4.create(),
    hierarchyStackEntities: [],
    hierarchyStackChildren: [],
    hierarchyProbeEntities: [],
    hierarchyCurrentCursor: { bindingIndex: -1, row: -1 },
    hierarchyParentCursor: { bindingIndex: -1, row: -1 },
    hierarchyChildCursor: { bindingIndex: -1, row: -1 },
    hierarchyResidualCursor: { bindingIndex: -1, row: -1 },
    hierarchyResidualParentCursor: { bindingIndex: -1, row: -1 },
    hierarchyRootCursor: createHierarchyRootCursor(),
    hierarchyStates: [],
    hierarchyChanged: [],
    hierarchyBindingTables: [],
    hierarchyBindingRows: [],
    flatChanged: [],
    flatBindingTables: [],
    flatBindingRows: [],
    flatStructureEpoch: -1,
    hierarchyStructureEpoch: -1
  };
  SCRATCH.set(world, created);
  return created;
}
function composeColumns(position, rotation, scale, out, scratch, positionStart = 0, rotationStart = 0) {
  scratch.position[0] = position[positionStart] ?? 0;
  scratch.position[1] = position[positionStart + 1] ?? 0;
  scratch.position[2] = position[positionStart + 2] ?? 0;
  scratch.rotation[0] = rotation[rotationStart] ?? 0;
  scratch.rotation[1] = rotation[rotationStart + 1] ?? 0;
  scratch.rotation[2] = rotation[rotationStart + 2] ?? 0;
  scratch.rotation[3] = rotation[rotationStart + 3] ?? 1;
  scratch.scale[0] = scale[positionStart] ?? 1;
  scratch.scale[1] = scale[positionStart + 1] ?? 1;
  scratch.scale[2] = scale[positionStart + 2] ?? 1;
  mat4.compose(out, scratch.position, scratch.rotation, scratch.scale);
}
function composeFlatColumns(positions, rotations, scales, worlds, count) {
  for (let row = 0; row < count; row += 1) {
    const position = row * 3;
    const rotation = row * 4;
    const world = row * 16;
    const x = rotations[rotation] ?? 0;
    const y = rotations[rotation + 1] ?? 0;
    const z = rotations[rotation + 2] ?? 0;
    const w = rotations[rotation + 3] ?? 1;
    const x2 = x + x;
    const y2 = y + y;
    const z2 = z + z;
    const xx = x * x2;
    const xy = x * y2;
    const xz = x * z2;
    const yy = y * y2;
    const yz = y * z2;
    const zz = z * z2;
    const wx = w * x2;
    const wy = w * y2;
    const wz = w * z2;
    const sx = scales[position] ?? 1;
    const sy = scales[position + 1] ?? 1;
    const sz = scales[position + 2] ?? 1;
    worlds[world] = (1 - (yy + zz)) * sx;
    worlds[world + 1] = (xy + wz) * sx;
    worlds[world + 2] = (xz - wy) * sx;
    worlds[world + 3] = 0;
    worlds[world + 4] = (xy - wz) * sy;
    worlds[world + 5] = (1 - (xx + zz)) * sy;
    worlds[world + 6] = (yz + wx) * sy;
    worlds[world + 7] = 0;
    worlds[world + 8] = (xz + wy) * sz;
    worlds[world + 9] = (yz - wx) * sz;
    worlds[world + 10] = (1 - (xx + yy)) * sz;
    worlds[world + 11] = 0;
    worlds[world + 12] = positions[position] ?? 0;
    worlds[world + 13] = positions[position + 1] ?? 0;
    worlds[world + 14] = positions[position + 2] ?? 0;
    worlds[world + 15] = 1;
  }
}
function propagateFlat(world, scratch) {
  const query = scratch.flatQuery;
  if (query === void 0)
    return err6(
      new SceneError({
        code: "hierarchy-broken",
        expected: "a valid changed Transform write query",
        hint: "register the scene components before running TransformPropagation"
      })
    );
  const spans = query.spans();
  if (!spans.ok) return pairError(0, "dense numeric Transform spans");
  let bindingIndex = 0;
  try {
    for (const span of spans.value) {
      const local = span.get(Transform);
      const world2 = span.mut(GlobalTransform).world;
      composeFlatColumns(local.pos, local.quat, local.scale, world2, span.length);
      bindingIndex += 1;
    }
  } catch (cause) {
    const error = cause;
    return err6(derivedWriteError(error, bindingIndex));
  }
  const transformWriter = scratch.transformWriter;
  if (transformWriter === void 0) {
    return pairError(0, "dense Transform and GlobalTransform derived bindings");
  }
  const transformBindings = transformWriter.bindings;
  const structureEpoch = world.getStructureEpoch();
  if (scratch.flatStructureEpoch === structureEpoch) return ok6(void 0);
  ensureFlatBuffers(scratch, transformBindings);
  resetFlatBuffers(scratch);
  for (let bindingIndex2 = 0; bindingIndex2 < transformBindings.length; bindingIndex2 += 1) {
    const binding = transformBindings[bindingIndex2];
    const changed = scratch.flatChanged[bindingIndex2];
    if (binding === void 0 || changed === void 0) continue;
    for (let row = 0; row < binding.rowCapacity; row += 1) {
      const entity = binding.entities[row] ?? 0;
      const parentRaw = world[worldRead].getFieldValue(entity, ChildOf, "parent");
      if (parentRaw !== void 0 && parentRaw !== ENTITY_NULL_RAW2) continue;
      countPropagation("flatStructuralRootRows");
      composeBindingRow(binding, row, void 0, 0, scratch, changed);
    }
  }
  for (let bindingIndex2 = 0; bindingIndex2 < transformBindings.length; bindingIndex2 += 1) {
    const changed = scratch.flatChanged[bindingIndex2];
    if (changed === void 0) continue;
    const published = transformWriter.publishChangedRows(bindingIndex2, changed);
    if (!published.ok) return err6(derivedWriteError(published.error, bindingIndex2));
  }
  scratch.flatStructureEpoch = structureEpoch;
  return ok6(void 0);
}
function transformColumns(binding) {
  return binding.read;
}
function hierarchyColumns(binding) {
  return binding.read;
}
function worldColumn(binding) {
  return binding.write.world;
}
function hierarchyError(code, entity, parent, expected, hint) {
  return new SceneError({ code, expected, hint, detail: { entity, parent } });
}
function writeCandidate(binding, row, candidate, changed) {
  const worlds = worldColumn(binding);
  const base = row * 16;
  for (let index = 0; index < 16; index += 1) {
    if (worlds[base + index] !== candidate[index]) {
      worlds.set(candidate, base);
      changed[row] = 1;
      return;
    }
  }
}
function composeBindingRow(binding, row, parentBinding, parentRow, scratch, changed) {
  if ("parent" in binding.read) countPropagation("hierarchyRowsEvaluated");
  const local = transformColumns(binding);
  const offset = row * 3;
  composeColumns(local.pos, local.quat, local.scale, scratch.local, scratch, offset, row * 4);
  if (parentBinding === void 0) {
    scratch.candidate.set(scratch.local);
  } else {
    const parentWorld = worldColumn(parentBinding);
    const parentOffset = parentRow * 16;
    for (let index = 0; index < 16; index += 1) {
      scratch.parent[index] = parentWorld[parentOffset + index] ?? 0;
    }
    mat4.multiply(scratch.candidate, scratch.parent, scratch.local);
  }
  writeCandidate(binding, row, scratch.candidate, changed);
}
function ensureHierarchyBuffers(scratch, bindings) {
  let same = scratch.hierarchyBindingTables.length === bindings.length;
  if (same) {
    for (let index = 0; index < bindings.length; index += 1) {
      const binding = bindings[index];
      if (binding === void 0 || scratch.hierarchyBindingTables[index] !== binding.tableId || scratch.hierarchyBindingRows[index] !== binding.rowCapacity) {
        same = false;
        break;
      }
    }
  }
  if (same) return;
  scratch.hierarchyBindingTables = bindings.map((binding) => binding.tableId);
  scratch.hierarchyBindingRows = bindings.map((binding) => binding.rowCapacity);
  scratch.hierarchyStates = bindings.map((binding) => new Uint8Array(binding.rowCapacity));
  scratch.hierarchyChanged = bindings.map((binding) => new Uint8Array(binding.rowCapacity));
}
function resetHierarchyBuffers(scratch) {
  for (let index = 0; index < scratch.hierarchyStates.length; index += 1) {
    scratch.hierarchyStates[index]?.fill(0);
    scratch.hierarchyChanged[index]?.fill(0);
  }
}
function ensureFlatBuffers(scratch, bindings) {
  let same = scratch.flatBindingTables.length === bindings.length;
  if (same) {
    for (let index = 0; index < bindings.length; index += 1) {
      const binding = bindings[index];
      if (binding === void 0 || scratch.flatBindingTables[index] !== binding.tableId || scratch.flatBindingRows[index] !== binding.rowCapacity) {
        same = false;
        break;
      }
    }
  }
  if (same) return;
  scratch.flatBindingTables = bindings.map((binding) => binding.tableId);
  scratch.flatBindingRows = bindings.map((binding) => binding.rowCapacity);
  scratch.flatChanged = bindings.map((binding) => new Uint8Array(binding.rowCapacity));
}
function resetFlatBuffers(scratch) {
  for (const changed of scratch.flatChanged) changed.fill(0);
}
function derivedWriteError(cause, bindingIndex) {
  return new SceneError({
    code: "hierarchy-broken",
    expected: "derived GlobalTransform range publication to succeed",
    hint: cause.hint ?? "retry propagation on a healthy World",
    detail: {
      kind: "derived-write",
      entity: 0,
      parent: 0,
      bindingIndex,
      base: 0,
      start: 0,
      count: 0,
      cause
    }
  });
}
function findHierarchyLocation(writer, bindings, entity, cursor) {
  countPropagation("hierarchyEntityLookups");
  if (!writer.locateEntity(entity, cursor)) return void 0;
  return bindings[cursor.bindingIndex];
}
function findTransformLocation(writer, bindings, entity, cursor) {
  countPropagation("hierarchyEntityLookups");
  if (!writer.locateEntity(entity, cursor)) return void 0;
  return bindings[cursor.bindingIndex];
}
function countPublishedRows(changed) {
  const trace = propagationTrace;
  if (trace === void 0) return;
  let runOpen = false;
  for (let row = 0; row < changed.length; row += 1) {
    if ((changed[row] ?? 0) !== 0) {
      trace.hierarchyPublishedRows += 1;
      if (!runOpen) {
        trace.hierarchyPublishedRuns += 1;
        runOpen = true;
      }
    } else {
      runOpen = false;
    }
  }
}
function noteHierarchyError(current, next) {
  if (current === void 0) return next;
  const currentEntity = Number(current.detail?.entity ?? Number.MAX_SAFE_INTEGER);
  const nextEntity = Number(next.detail?.entity ?? Number.MAX_SAFE_INTEGER);
  return nextEntity < currentEntity || nextEntity === currentEntity && next.code.localeCompare(current.code) < 0 ? next : current;
}
function composeLocalHierarchyEntity(writer, bindings, entity, scratch, changed) {
  const cursor = scratch.hierarchyCurrentCursor;
  const binding = findHierarchyLocation(writer, bindings, entity, cursor);
  if (binding === void 0) return false;
  composeBindingRow(
    binding,
    cursor.row,
    void 0,
    0,
    scratch,
    changed[cursor.bindingIndex]
  );
  const states = scratch.hierarchyStates[cursor.bindingIndex];
  if (states !== void 0) states[cursor.row] = 3;
  return true;
}
function handleActiveCycle(repeated, stackEntities, stackChildren, writer, bindings, scratch, changed, report) {
  let cycleStart = -1;
  for (let index = 0; index < stackEntities.length; index += 1) {
    if (stackEntities[index] === repeated) {
      cycleStart = index;
      break;
    }
  }
  if (cycleStart < 0) return;
  const repeatedCursor = { bindingIndex: -1, row: -1 };
  const repeatedBinding = findHierarchyLocation(writer, bindings, repeated, repeatedCursor);
  const repeatedParent = repeatedBinding === void 0 ? repeated : hierarchyColumns(repeatedBinding).parent[repeatedCursor.row] ?? ENTITY_NULL_RAW2;
  report(
    hierarchyError(
      "hierarchy-cycle",
      repeated,
      repeatedParent,
      "a parent-before-child Transform hierarchy",
      "repair the ChildOf cycle and retry TransformPropagation"
    )
  );
  for (let index = cycleStart; index < stackEntities.length; index += 1) {
    const cycleEntity = stackEntities[index];
    if (cycleEntity === void 0) continue;
    composeLocalHierarchyEntity(writer, bindings, cycleEntity, scratch, changed);
    stackChildren[index] = 0;
  }
}
function walkChildren(world, root, writer, bindings, transformWriter, transformBindings, scratch, report, allowCompletedRoot, refresh = false) {
  countPropagation("hierarchyRootInvocations");
  const stackEntities = scratch.hierarchyStackEntities;
  const stackChildren = scratch.hierarchyStackChildren;
  stackEntities.length = 0;
  stackChildren.length = 0;
  if (allowCompletedRoot) {
    const rootCursor = scratch.hierarchyRootCursor;
    const rootBinding = findHierarchyLocation(writer, bindings, root, rootCursor);
    if (rootBinding !== void 0) {
      const state = scratch.hierarchyStates[rootCursor.bindingIndex]?.[rootCursor.row] ?? 0;
      if (state === 4) return;
    }
  } else {
    const rootCursor = scratch.hierarchyRootCursor;
    countPropagation("hierarchyRootCursorReuses");
    const rootBinding = findHierarchyLocation(writer, bindings, root, rootCursor);
    if (rootBinding !== void 0) {
      const state = scratch.hierarchyStates[rootCursor.bindingIndex]?.[rootCursor.row] ?? 0;
      if (state !== 0 && !refresh) return;
    }
  }
  stackEntities.push(root);
  stackChildren.push(-1);
  const currentCursor = scratch.hierarchyCurrentCursor;
  const parentCursor = scratch.hierarchyParentCursor;
  const childCursor = scratch.hierarchyChildCursor;
  while (stackEntities.length > 0) {
    const top = stackEntities.length - 1;
    const current = stackEntities[top];
    if (current === void 0) {
      stackEntities.pop();
      stackChildren.pop();
      continue;
    }
    const hierarchyBinding = findHierarchyLocation(writer, bindings, current, currentCursor);
    const nextChild = stackChildren[top] ?? -1;
    if (nextChild < 0) {
      if (hierarchyBinding !== void 0) {
        if (refresh) {
          const states = scratch.hierarchyStates[currentCursor.bindingIndex];
          if (states !== void 0) states[currentCursor.row] = 0;
        }
        const state = scratch.hierarchyStates[currentCursor.bindingIndex]?.[currentCursor.row] ?? 0;
        if (state === 0) {
          const states = scratch.hierarchyStates[currentCursor.bindingIndex];
          if (states !== void 0) states[currentCursor.row] = 1;
          const parentRaw = hierarchyColumns(hierarchyBinding).parent[currentCursor.row] ?? ENTITY_NULL_RAW2;
          let completed = false;
          if (parentRaw === ENTITY_NULL_RAW2) {
            composeBindingRow(
              hierarchyBinding,
              currentCursor.row,
              void 0,
              0,
              scratch,
              scratch.hierarchyChanged[currentCursor.bindingIndex]
            );
            completed = true;
          } else {
            const parent = parentRaw;
            const parentBinding = findTransformLocation(
              transformWriter,
              transformBindings,
              parent,
              parentCursor
            );
            const parentHierarchy = findHierarchyLocation(writer, bindings, parent, childCursor);
            if (parentBinding === void 0) {
              report(
                hierarchyError(
                  "hierarchy-broken",
                  current,
                  parent,
                  "each ChildOf parent to carry Transform and GlobalTransform",
                  "repair the missing parent pair before retrying propagation"
                )
              );
              composeBindingRow(
                hierarchyBinding,
                currentCursor.row,
                void 0,
                0,
                scratch,
                scratch.hierarchyChanged[currentCursor.bindingIndex]
              );
              completed = true;
            } else if (parentHierarchy !== void 0) {
              const parentState = scratch.hierarchyStates[childCursor.bindingIndex]?.[childCursor.row] ?? 0;
              if (parentState === 1) {
                handleActiveCycle(
                  parent,
                  stackEntities,
                  stackChildren,
                  writer,
                  bindings,
                  scratch,
                  scratch.hierarchyChanged,
                  report
                );
                completed = true;
              } else if (parentState === 0) {
                report(
                  hierarchyError(
                    "hierarchy-broken",
                    current,
                    parent,
                    "Children to enumerate every parent-before-child edge",
                    "repair the Children mirror and retry TransformPropagation"
                  )
                );
                composeBindingRow(
                  hierarchyBinding,
                  currentCursor.row,
                  void 0,
                  0,
                  scratch,
                  scratch.hierarchyChanged[currentCursor.bindingIndex]
                );
                completed = true;
              } else {
                composeBindingRow(
                  hierarchyBinding,
                  currentCursor.row,
                  parentBinding,
                  parentCursor.row,
                  scratch,
                  scratch.hierarchyChanged[currentCursor.bindingIndex]
                );
                completed = true;
              }
            } else {
              composeBindingRow(
                hierarchyBinding,
                currentCursor.row,
                parentBinding,
                parentCursor.row,
                scratch,
                scratch.hierarchyChanged[currentCursor.bindingIndex]
              );
              completed = true;
            }
          }
          if (completed && states !== void 0 && states[currentCursor.row] === 1) {
            states[currentCursor.row] = 2;
          }
        }
      }
      stackChildren[top] = 0;
      continue;
    }
    const childrenLength = world[worldRead].getArrayLength(current, Children, "entities") ?? 0;
    if (nextChild >= childrenLength) {
      stackEntities.pop();
      stackChildren.pop();
      if (allowCompletedRoot) {
        const completedCursor = scratch.hierarchyResidualCursor;
        const completedBinding = findHierarchyLocation(writer, bindings, current, completedCursor);
        const completedStates = completedBinding === void 0 ? void 0 : scratch.hierarchyStates[completedCursor.bindingIndex];
        if (completedStates !== void 0 && completedStates[completedCursor.row] === 3) {
          completedStates[completedCursor.row] = 4;
        }
      }
      continue;
    }
    stackChildren[top] = nextChild + 1;
    countPropagation("hierarchyEdgesVisited");
    const childRaw = world[worldRead].getArrayElement(current, Children, "entities", nextChild);
    if (childRaw === void 0 || childRaw === ENTITY_NULL_RAW2) {
      report(
        hierarchyError(
          "hierarchy-broken",
          current,
          current,
          "Children.entities to contain live child handles",
          "repair the Children mirror and retry TransformPropagation"
        )
      );
      continue;
    }
    const child = childRaw;
    const childBinding = findHierarchyLocation(writer, bindings, child, childCursor);
    if (childBinding === void 0) {
      report(
        hierarchyError(
          "hierarchy-broken",
          child,
          current,
          "each Children entry to carry Transform, GlobalTransform, and ChildOf",
          "repair the child component pair before retrying propagation"
        )
      );
      continue;
    }
    const childParent = hierarchyColumns(childBinding).parent[childCursor.row] ?? ENTITY_NULL_RAW2;
    const childState = scratch.hierarchyStates[childCursor.bindingIndex]?.[childCursor.row] ?? 0;
    if (childParent !== current) {
      if (childState === 0) continue;
      report(
        hierarchyError(
          "hierarchy-broken",
          child,
          current,
          "Children and ChildOf to describe the same parent",
          "repair the relationship mirror and retry TransformPropagation"
        )
      );
      continue;
    }
    if (childState === 1) {
      handleActiveCycle(
        child,
        stackEntities,
        stackChildren,
        writer,
        bindings,
        scratch,
        scratch.hierarchyChanged,
        report
      );
    } else if (childState === 0 || refresh) {
      stackEntities.push(child);
      stackChildren.push(-1);
    }
  }
}
function fallbackResidualPath(world, path, writer, bindings, transformWriter, transformBindings, scratch, report) {
  for (const entity of path) {
    composeLocalHierarchyEntity(writer, bindings, entity, scratch, scratch.hierarchyChanged);
  }
  for (const entity of path) {
    walkChildren(
      world,
      entity,
      writer,
      bindings,
      transformWriter,
      transformBindings,
      scratch,
      report,
      true
    );
  }
}
function resolveResidualPath(world, entity, writer, bindings, transformWriter, transformBindings, scratch, report) {
  const path = scratch.hierarchyProbeEntities;
  path.length = 0;
  const cursor = scratch.hierarchyResidualCursor;
  const parentTransformCursor = scratch.hierarchyParentCursor;
  const parentHierarchyCursor = scratch.hierarchyResidualParentCursor;
  let current = entity;
  while (true) {
    countPropagation("hierarchyResidualParentProbes");
    const binding = findHierarchyLocation(writer, bindings, current, cursor);
    if (binding === void 0) break;
    const states = scratch.hierarchyStates[cursor.bindingIndex];
    const state = states?.[cursor.row] ?? 0;
    if (state !== 0) {
      const columns = hierarchyColumns(binding);
      const parentRaw2 = columns.parent[cursor.row] ?? ENTITY_NULL_RAW2;
      report(
        hierarchyError(
          "hierarchy-cycle",
          current,
          parentRaw2 === ENTITY_NULL_RAW2 ? current : parentRaw2,
          "a parent-before-child Transform hierarchy",
          "repair the ChildOf cycle and retry TransformPropagation"
        )
      );
      fallbackResidualPath(
        world,
        path,
        writer,
        bindings,
        transformWriter,
        transformBindings,
        scratch,
        report
      );
      return;
    }
    if (states !== void 0) states[cursor.row] = 1;
    path.push(current);
    const parentRaw = hierarchyColumns(binding).parent[cursor.row] ?? ENTITY_NULL_RAW2;
    if (parentRaw === ENTITY_NULL_RAW2) {
      report(
        hierarchyError(
          "hierarchy-broken",
          current,
          current,
          "Children to enumerate every parent-before-child edge",
          "repair the Children mirror and retry TransformPropagation"
        )
      );
      fallbackResidualPath(
        world,
        path,
        writer,
        bindings,
        transformWriter,
        transformBindings,
        scratch,
        report
      );
      return;
    }
    const parent = parentRaw;
    const parentTransform = findTransformLocation(
      transformWriter,
      transformBindings,
      parent,
      parentTransformCursor
    );
    const parentHierarchy = findHierarchyLocation(writer, bindings, parent, parentHierarchyCursor);
    if (parentHierarchy === void 0) {
      report(
        hierarchyError(
          "hierarchy-broken",
          current,
          parent,
          parentTransform === void 0 ? "each ChildOf parent to carry Transform and GlobalTransform" : "Children to enumerate every parent-before-child edge",
          parentTransform === void 0 ? "repair the missing parent pair before retrying propagation" : "repair the Children mirror and retry TransformPropagation"
        )
      );
      fallbackResidualPath(
        world,
        path,
        writer,
        bindings,
        transformWriter,
        transformBindings,
        scratch,
        report
      );
      return;
    }
    const parentState = scratch.hierarchyStates[parentHierarchyCursor.bindingIndex]?.[parentHierarchyCursor.row] ?? 0;
    if (parentState === 0) {
      current = parent;
      continue;
    }
    if (parentState === 1) {
      report(
        hierarchyError(
          "hierarchy-cycle",
          parent,
          current,
          "a parent-before-child Transform hierarchy",
          "repair the ChildOf cycle and retry TransformPropagation"
        )
      );
    } else {
      report(
        hierarchyError(
          "hierarchy-broken",
          current,
          parent,
          "Children to enumerate every parent-before-child edge",
          "repair the Children mirror and retry TransformPropagation"
        )
      );
    }
    fallbackResidualPath(
      world,
      path,
      writer,
      bindings,
      transformWriter,
      transformBindings,
      scratch,
      report
    );
    return;
  }
}
function propagateHierarchy(world, scratch, globalEdited) {
  const hierarchyWriter = scratch.hierarchyWriter;
  const transformWriter = scratch.transformWriter;
  if (hierarchyWriter === void 0 || transformWriter === void 0) {
    return err6(
      new SceneError({
        code: "hierarchy-broken",
        expected: "paired Transform and GlobalTransform derived bindings",
        hint: "register the scene components before running TransformPropagation"
      })
    );
  }
  const hierarchyBindings = hierarchyWriter.bindings;
  const transformBindings = transformWriter.bindings;
  if (hierarchyBindings.length === 0) {
    scratch.hierarchyBindingTables.length = 0;
    scratch.hierarchyBindingRows.length = 0;
    scratch.hierarchyStates.length = 0;
    scratch.hierarchyChanged.length = 0;
    scratch.hierarchyStructureEpoch = world.getStructureEpoch();
    return ok6(void 0);
  }
  const dirty = /* @__PURE__ */ new Set();
  for (const row of scratch.dirtyTransforms ?? []) dirty.add(row.entity);
  let rebuild = scratch.hierarchyStructureEpoch !== world.getStructureEpoch();
  for (const _row of scratch.dirtyParents ?? []) rebuild = true;
  rebuild ||= globalEdited;
  if (!rebuild && dirty.size === 0) return ok6(void 0);
  ensureHierarchyBuffers(scratch, hierarchyBindings);
  if (rebuild) resetHierarchyBuffers(scratch);
  else for (const changed of scratch.hierarchyChanged) changed.fill(0);
  let firstError;
  const report = (error) => {
    firstError = noteHierarchyError(firstError, error);
  };
  if (!rebuild) {
    for (const entity of dirty) {
      let parent = world[worldRead].getFieldValue(entity, ChildOf, "parent");
      let covered = false;
      while (parent !== void 0 && parent !== ENTITY_NULL_RAW2) {
        if (dirty.has(parent)) {
          covered = true;
          break;
        }
        parent = world[worldRead].getFieldValue(parent, ChildOf, "parent");
      }
      if (!covered)
        walkChildren(
          world,
          entity,
          hierarchyWriter,
          hierarchyBindings,
          transformWriter,
          transformBindings,
          scratch,
          report,
          false,
          true
        );
    }
  } else {
    for (const binding of transformBindings) {
      const entities = binding.entities;
      for (let row = 0; row < binding.rowCapacity; row += 1) {
        const entity = entities[row] ?? 0;
        const parentRaw = world[worldRead].getFieldValue(entity, ChildOf, "parent");
        if (parentRaw === void 0 || parentRaw === ENTITY_NULL_RAW2) {
          walkChildren(
            world,
            entity,
            hierarchyWriter,
            hierarchyBindings,
            transformWriter,
            transformBindings,
            scratch,
            report,
            false
          );
        }
      }
    }
    for (let bindingIndex = 0; bindingIndex < hierarchyBindings.length; bindingIndex += 1) {
      const binding = hierarchyBindings[bindingIndex];
      if (binding === void 0) continue;
      const entities = binding.entities;
      const states = scratch.hierarchyStates[bindingIndex];
      for (let row = 0; row < binding.rowCapacity; row += 1) {
        if ((states?.[row] ?? 0) !== 0) continue;
        const entity = entities[row] ?? 0;
        resolveResidualPath(
          world,
          entity,
          hierarchyWriter,
          hierarchyBindings,
          transformWriter,
          transformBindings,
          scratch,
          report
        );
      }
    }
  }
  for (let bindingIndex = 0; bindingIndex < hierarchyBindings.length; bindingIndex += 1) {
    const changed = scratch.hierarchyChanged[bindingIndex];
    if (changed === void 0) continue;
    countPublishedRows(changed);
    const published = hierarchyWriter.publishChangedRows(bindingIndex, changed);
    if (!published.ok) {
      const cause = published.error;
      report(derivedWriteError(cause, bindingIndex));
    }
  }
  scratch.hierarchyStructureEpoch = firstError === void 0 ? world.getStructureEpoch() : -1;
  return firstError === void 0 ? ok6(void 0) : err6(firstError);
}
function propagateTransforms(world) {
  const scratch = scratchFor(world);
  const pairs = validateTransformPairs(world, scratch);
  if (!pairs.ok) return pairs;
  let globalEdited = false;
  for (const _span of scratch.dirtyGlobals?.spans().unwrap() ?? []) globalEdited = true;
  const flat = propagateFlat(world, scratch);
  if (!flat.ok) return flat;
  const hierarchy = propagateHierarchy(world, scratch, globalEdited);
  for (const _span of scratch.dirtyGlobals?.spans().unwrap() ?? []) {
  }
  return hierarchy;
}
var PropagateTransforms = defineSystem({
  name: PROPAGATE_TRANSFORMS_SYSTEM,
  queries: [],
  fn: (world) => {
    const result = propagateTransforms(world);
    if (!result.ok) throw result.error;
  }
});
var PropagateTransformsFixed = defineSystem({
  name: PROPAGATE_TRANSFORMS_FIXED_SYSTEM,
  queries: [],
  fn: PropagateTransforms.fn
});
function registerPropagateTransforms(world, options = {}) {
  const existing = REGISTRATION_LEASES.get(world);
  if (existing !== void 0) {
    existing.refs += 1;
    let active2 = true;
    return () => {
      if (!active2) return;
      active2 = false;
      existing.refs -= 1;
      if (existing.refs === 0) {
        world.removeSystem(FixedUpdate, PROPAGATE_TRANSFORMS_FIXED_SYSTEM);
        world.removeSystem(Update, PROPAGATE_TRANSFORMS_SYSTEM);
        REGISTRATION_LEASES.delete(world);
        SCRATCH.delete(world);
      }
    };
  }
  if (options.beforeSystemName === void 0) {
    world.addSystems(Update, TransformSet, [PropagateTransforms]).unwrap();
  } else {
    world.addSystems(Update, TransformSet, [
      {
        name: PROPAGATE_TRANSFORMS_SYSTEM,
        queries: [],
        fn: PropagateTransforms.fn,
        before: [options.beforeSystemName]
      }
    ]).unwrap();
  }
  world.addSystems(FixedUpdate, TransformFixedSet, [PropagateTransformsFixed]).unwrap();
  REGISTRATION_LEASES.set(world, { refs: 1 });
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    const lease = REGISTRATION_LEASES.get(world);
    if (lease === void 0) return;
    lease.refs -= 1;
    if (lease.refs !== 0) return;
    world.removeSystem(FixedUpdate, PROPAGATE_TRANSFORMS_FIXED_SYSTEM);
    world.removeSystem(Update, PROPAGATE_TRANSFORMS_SYSTEM);
    REGISTRATION_LEASES.delete(world);
    SCRATCH.delete(world);
  };
}

// src/plugin.ts
var SCENE_COMPONENTS = [
  ChildOf,
  Children,
  MorphWeights,
  Name,
  Transform,
  GlobalTransform
];
function registerSceneComponents(world) {
  const leases = SCENE_COMPONENTS.map((component) => world.components.register(component).unwrap());
  return () => {
    for (let index = leases.length - 1; index >= 0; index -= 1) leases[index]?.dispose();
  };
}
function scenePlugin() {
  return {
    name: "scene",
    inject: ["world"],
    apply(ctx) {
      ctx.effect(() => registerSceneComponents(ctx.world), "scene/components");
      ctx.effect(() => registerPropagateTransforms(ctx.world), "scene/propagate-transforms");
    }
  };
}

// src/systems/hierarchy-projection.ts
import { Entity } from "../../ecs/dist/index.mjs";
var HIERARCHY_PROJECTION_CACHE = /* @__PURE__ */ new WeakMap();
function createChildOfChangeQuery(world) {
  const result = world.query({ changed: [ChildOf] });
  if (!result.ok) throw result.error;
  return result.value;
}
function drainChanges(query) {
  let changed = false;
  for (const span of query.spans().unwrap()) changed ||= span.length > 0;
  return changed;
}
function diagnostic(code, entity, parent) {
  if (code === "hierarchy-cycle") {
    return {
      code,
      expected: "ChildOf parent edges form an acyclic live hierarchy",
      hint: "remove one ChildOf edge from the reported cycle, then re-run the extract",
      detail: { entity, parent }
    };
  }
  return {
    code,
    expected: "ChildOf.parent references a live entity in the same World",
    hint: "remove the stale ChildOf component or restore the referenced parent in this World",
    detail: { entity, parent }
  };
}
function projectHierarchy(world) {
  const cached = HIERARCHY_PROJECTION_CACHE.get(world);
  if (cached !== void 0 && cached.structureEpoch === world.getStructureEpoch() && !drainChanges(cached.childOfChanges)) {
    return cached.snapshot;
  }
  const liveEntities = /* @__PURE__ */ new Set();
  const authoredParents = /* @__PURE__ */ new Map();
  const query = world.query({ read: [Entity], optional: [ChildOf] });
  if (query.ok) {
    for (const row of query.value) {
      liveEntities.add(row.entity);
      const parent = row.get(ChildOf)?.parent;
      if (parent !== void 0 && parent !== null) authoredParents.set(row.entity, parent);
    }
  }
  const parentOf = /* @__PURE__ */ new Map();
  const diagnostics = [];
  for (const [entity, parent] of authoredParents) {
    if (liveEntities.has(parent)) {
      parentOf.set(entity, parent);
    } else {
      diagnostics.push(diagnostic("hierarchy-broken", entity, parent));
    }
  }
  const state = /* @__PURE__ */ new Map();
  const stack = [];
  const cycleMembers = /* @__PURE__ */ new Set();
  const visit = (entity) => {
    const currentState = state.get(entity) ?? 0;
    if (currentState === 2) return;
    if (currentState === 1) {
      const cycleStart = stack.indexOf(entity);
      for (let index = cycleStart; index >= 0 && index < stack.length; index++) {
        const member = stack[index];
        if (member !== void 0) cycleMembers.add(member);
      }
      return;
    }
    state.set(entity, 1);
    stack.push(entity);
    const parent = parentOf.get(entity);
    if (parent !== void 0) visit(parent);
    stack.pop();
    state.set(entity, 2);
  };
  for (const entity of liveEntities) visit(entity);
  for (const entity of cycleMembers) {
    const parent = authoredParents.get(entity);
    if (parent !== void 0) diagnostics.push(diagnostic("hierarchy-cycle", entity, parent));
    parentOf.delete(entity);
  }
  diagnostics.sort((left, right) => {
    const entityDelta = left.detail.entity - right.detail.entity;
    if (entityDelta !== 0) return entityDelta;
    return left.code.localeCompare(right.code);
  });
  const stableParentOf = new Map(parentOf);
  const stableDiagnostics = Object.freeze(diagnostics.slice());
  const snapshot = {
    parentOf: stableParentOf,
    diagnostics: stableDiagnostics,
    getParent(entity) {
      return stableParentOf.get(entity);
    }
  };
  const childOfChanges = createChildOfChangeQuery(world);
  drainChanges(childOfChanges);
  HIERARCHY_PROJECTION_CACHE.set(world, {
    structureEpoch: world.getStructureEpoch(),
    childOfChanges,
    snapshot
  });
  return snapshot;
}
export {
  ChildOf,
  Children,
  ComponentNotDefinedError,
  GlobalTransform,
  MorphWeights,
  Name,
  PROPAGATE_TRANSFORMS_SYSTEM,
  SCENE_COLLECT_PROFILE,
  SceneError,
  Transform,
  TransformSet,
  collectSubtree,
  compileKeyedSceneAsset,
  externalizeSceneAsset,
  projectHierarchy,
  propagateTransforms,
  registerPropagateTransforms,
  resolveSceneEntity,
  sceneAssetContribution,
  sceneEntity,
  sceneEntityAddressKey,
  scenePlugin,
  validateSceneEntityKeys,
  worldApplyMountOverride,
  worldBuildSceneEntityComponentDatas,
  worldDespawnDescendants,
  worldDespawnScene,
  worldDetachSceneMember,
  worldGetSceneAssetForInstance,
  worldGetSceneAssetResolver,
  worldGetSceneInstanceState,
  worldInstantiateScene,
  worldInstantiateSceneAsset,
  worldInstantiateSceneAssetFlat,
  worldInstantiateSceneFlat,
  worldInstantiateScenePayload,
  worldInstantiateSceneRec,
  worldMountOverridesToStateMap,
  worldReattachSceneMember,
  worldRemoveSceneOverride,
  worldResolveMountSource,
  worldResolveSceneAsset,
  worldResolveSceneEntity,
  worldResolveSceneInstanceStatePayload,
  worldSetSceneAssetResolver,
  worldSetSceneOverride,
  worldSpawnMountEntity,
  worldSpawnSceneMembers,
  worldValidateMountOverrides
};
