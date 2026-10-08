import { unpackSlot, pack, MAX_SLOT } from '../../../types/dist/index.mjs';

// src/component.ts

// src/component-schema.ts
var COMPONENT_REGISTRY = /* @__PURE__ */ Symbol.for("forgeax.ecs.componentRegistry");
var globalSymbols = globalThis;
var definitions = globalSymbols[COMPONENT_REGISTRY] ?? (() => {
  const registry = { definitions: /* @__PURE__ */ new WeakMap() };
  globalSymbols[COMPONENT_REGISTRY] = registry;
  return registry;
})();
function registerComponentDefinition(component, definition) {
  definitions.definitions.set(component, definition);
}
function componentDefinition(component) {
  const definition = definitions.definitions.get(component);
  if (definition === void 0) {
    throw new Error(`Component definition missing for '${component.name}'.`);
  }
  return definition;
}
function deepFreeze(value) {
  if (value === null || typeof value !== "object" && typeof value !== "function") {
    return value;
  }
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
    return value;
  }
  const object = value;
  for (const key of Reflect.ownKeys(object)) {
    const child = object[key];
    if (child !== null && (typeof child === "object" || typeof child === "function")) {
      deepFreeze(child);
    }
  }
  return Object.freeze(value);
}

// src/errors/query-and-component-errors.ts
var ComponentNotDefinedError = class extends Error {
  name = "ComponentNotDefinedError";
  code = "component-not-defined";
  hint;
  expected;
  detail;
  constructor(componentName, opts) {
    const expected = opts?.expected ?? `component '${componentName}' defined before instantiate`;
    const hint = opts?.hint ?? `define the component via defineComponent('${componentName}', ...) before instantiating this SceneAsset`;
    super(
      `instantiate: component not defined.
  code: component-not-defined
  component: ${componentName}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = { name: componentName };
  }
};

// src/errors/sprite-and-shared-errors.ts
var SpriteInstancesCountMismatchError = class extends Error {
  name = "SpriteInstancesCountMismatchError";
  code = "sprite-instances-count-mismatch";
  hint;
  expected;
  detail;
  constructor(transformsLength, regionsLength) {
    const hint = "SpriteInstances.transforms (stride 16) and SpriteInstances.regions (stride 4) must describe the same instance count: ensure transforms.length / 16 === regions.length / 4 at the spawn / set site (resize both arrays together).";
    const expected = "transforms.length / 16 === regions.length / 4";
    super(
      `SpriteInstances: per-instance count mismatch between transforms and regions.
  code: sprite-instances-count-mismatch
  transformsLength: ${transformsLength} (count = ${transformsLength / 16})
  regionsLength: ${regionsLength} (count = ${regionsLength / 4})
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = {
      code: "sprite-instances-count-mismatch",
      transformsLength,
      regionsLength,
      expectedStride: { transforms: 16, regions: 4 }
    };
  }
};
var SpriteInstancesRequiresSpriteShaderError = class extends Error {
  name = "SpriteInstancesRequiresSpriteShaderError";
  code = "sprite-instances-requires-sprite-shader";
  hint;
  expected;
  detail;
  constructor(entityId, observedMaterialShaderId) {
    const hint = "bind a MaterialAsset whose first pass `shader` is 'forgeax::sprite' or 'forgeax::sprite-lit' to this entity's MeshRenderer (SpriteInstances requires a sprite-family shader so the per-instance UV region is consumed by the sprite vertex shader path).";
    const expected = "MaterialAsset.passes[0].shader === 'forgeax::sprite' || 'forgeax::sprite-lit'";
    super(
      `SpriteInstances: entity ${entityId} requires a sprite-shaded MaterialAsset.
  code: sprite-instances-requires-sprite-shader
  entityId: ${entityId}
  observedMaterialShaderId: ${observedMaterialShaderId}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = {
      code: "sprite-instances-requires-sprite-shader",
      entityId,
      observedMaterialShaderId
    };
  }
};
var SpriteInstancesMutuallyExclusiveWithInstancesError = class extends Error {
  name = "SpriteInstancesMutuallyExclusiveWithInstancesError";
  code = "sprite-instances-mutually-exclusive-with-instances";
  hint;
  expected;
  detail;
  constructor(entityId) {
    const hint = "remove Instances or replace with SpriteInstances; SpriteInstances supersedes Instances when per-instance region is needed.";
    const expected = "entity carries Instances XOR SpriteInstances (not both)";
    super(
      `SpriteInstances: entity ${entityId} carries both Instances and SpriteInstances.
  code: sprite-instances-mutually-exclusive-with-instances
  entityId: ${entityId}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = {
      code: "sprite-instances-mutually-exclusive-with-instances",
      entityId
    };
  }
};

// src/errors/validation-errors.ts
var SPAWN_LIGHT_INVALID_BOUNDS_POLICY = {
  intensity: {
    expected: "intensity is finite and >= 0",
    hint: (componentName, got) => `${componentName}.intensity must be a finite non-negative number (got ${got})`
  },
  color: {
    expected: "color is a finite non-negative [r, g, b] vector",
    hint: (componentName, got) => `${componentName}.color must contain three finite non-negative channels (got ${JSON.stringify(got)})`
  },
  width: {
    expected: "width is finite and > 0",
    hint: (componentName, got) => `${componentName}.width must be a finite positive meter value (got ${got})`
  },
  height: {
    expected: "height is finite and > 0",
    hint: (componentName, got) => `${componentName}.height must be a finite positive meter value (got ${got})`
  },
  irradiance: {
    expected: "irradiance is a finite 27-value SH vector",
    hint: (componentName, got) => `${componentName}.irradiance must contain 27 finite SH values (got ${JSON.stringify(got)})`
  },
  radius: {
    expected: "radius is finite and >= R_MIN",
    hint: (componentName, got) => `${componentName}.radius must be a finite value >= R_MIN (got ${got})`
  },
  range: {
    expected: "range >= 0 or Number.POSITIVE_INFINITY",
    hint: (componentName, got) => `${componentName}.range = ${got} is invalid; use Number.POSITIVE_INFINITY for unlimited range, or a non-negative meter value`
  },
  innerOuter: {
    expected: "outerConeDeg > innerConeDeg",
    hint: (componentName, got) => `${componentName}.outerConeDeg <= innerConeDeg (got ${got}); inner cone is the saturated bright region, outer cone is the falloff edge; outerConeDeg > innerConeDeg required`
  },
  outerNinety: {
    expected: "outerConeDeg <= 90 (KHR_lights_punctual upper bound)",
    hint: (componentName, got) => `${componentName}.outerConeDeg = ${got} > 90; a spot light cone wider than 90 degrees becomes a point light; use PointLight instead`
  },
  direction: {
    expected: "direction is a non-zero [x, y, z] vector",
    hint: (componentName, got) => `${componentName}.direction is missing or a zero vector (got ${JSON.stringify(got)}); direction has no default, provide a non-zero direction, e.g. [-0.5, -1, -0.3]`
  }
};
var SpawnLightInvalidBoundsError = class extends Error {
  name = "SpawnLightInvalidBoundsError";
  code = "spawn-light-invalid-bounds";
  hint;
  expected;
  detail;
  constructor(componentName, field, got) {
    const policy = SPAWN_LIGHT_INVALID_BOUNDS_POLICY[field];
    const hint = policy.hint(componentName, got);
    const expectedStr = policy.expected;
    super(
      `${componentName}: spawn payload bound violation.
  code: spawn-light-invalid-bounds
  component: ${componentName}
  field: ${field}
  got: ${got}
  expected: ${expectedStr}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expectedStr;
    this.detail = { field, got };
  }
};
var ResourceInvalidValueError = class extends Error {
  name = "ResourceInvalidValueError";
  code = "resource-invalid-value";
  hint;
  expected;
  detail;
  constructor(expected, hint, detail) {
    const keyClause = detail.receivedKey === void 0 ? "" : `  key: ${detail.receivedKey}
`;
    super(
      `resource: invalid value.
  code: resource-invalid-value
` + keyClause + `  receivedMode: ${detail.receivedMode}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = detail;
  }
};
var SpriteAnimationInvalidError = class _SpriteAnimationInvalidError extends Error {
  name = "SpriteAnimationInvalidError";
  code = "sprite-animation-invalid";
  hint;
  expected;
  detail;
  static resolvePolicy(detail) {
    switch (detail.field) {
      case "regions-length":
        return {
          expected: "SpriteAnimation.regions.length === frameCount * 4",
          hint: `SpriteAnimation.regions.length = ${detail.regionsLength} does not match frameCount * 4 = ${detail.frameCount * 4}; pack 4 floats [uMin, vMin, uW, vH] per frame (see <name>.atlas.meta.json sidecar 'regions' map)`
        };
      case "frame-duration":
        return {
          expected: "SpriteAnimation.frameDuration > 0",
          hint: `SpriteAnimation.frameDuration = ${detail.frameDuration} is invalid; use a positive seconds-per-frame value (e.g. 0.1 = 10 fps)`
        };
    }
  }
  constructor(detail) {
    const policy = _SpriteAnimationInvalidError.resolvePolicy(detail);
    super(
      `SpriteAnimation: invariant violated.
  code: sprite-animation-invalid
  field: ${detail.field}
  expected: ${policy.expected}
  hint: ${policy.hint}`
    );
    this.hint = policy.hint;
    this.expected = policy.expected;
    this.detail = detail;
  }
};

// src/world-internal.ts
var worldInternal = /* @__PURE__ */ Symbol.for(
  "forgeax.ecs.worldInternal"
);

// src/execution/shared-kernel.ts
var WorldPoisonedError = class extends Error {
  code = "world-poisoned";
  expected = "World health is healthy before update";
  hint = "stop scheduling this World and explicitly bootstrap a new World identity";
  detail;
  constructor(worldIdentity, fault) {
    super(`World ${worldIdentity} is poisoned and cannot update.`);
    this.name = "WorldPoisonedError";
    this.detail = { worldIdentity, fault };
  }
};

// src/errors.ts
var EntityIndexOverflowError = class extends RangeError {
  name = "EntityIndexOverflowError";
  code = "entity-index-overflow";
  hint;
  constructor(index) {
    const hint = "Entity index exceeds 24-bit max (16777215). Reduce simultaneous entity count or investigate entity leaks.";
    super(
      `Entity index ${index} exceeds 24-bit max (16777215).
  index: ${index}
  hint: ${hint}`
    );
    this.hint = hint;
  }
};
var SchemaUnsupportedFieldError = class extends Error {
  name = "SchemaUnsupportedFieldError";
  code = "schema-unsupported-field";
  hint;
  constructor(fieldName, fieldType) {
    let hint = "Supported types: f32 / f64 / i32 / u32 / i16 / u16 / i8 / u8 / bool / enum / ref.";
    if (fieldType.startsWith("handle<") && fieldType.endsWith(">")) {
      const tag = fieldType.slice(7, -1);
      hint = `'handle<${tag}>' was removed in feat-20260614 M5; use 'shared<${tag}>' instead. The brand and storage layout are unchanged; only the keyword + write-barrier dispatch (SharedRefStore retain/release) is new.`;
    } else if (fieldType.startsWith("ref<") && fieldType.endsWith(">")) {
      const tag = fieldType.slice(4, -1);
      hint = `'ref<${tag}>' was renamed in feat-20260614 M1; use 'unique<${tag}>' instead. The brand and storage layout are unchanged; the dispatch still routes through UniqueRefStore (single-holder direct release).`;
    }
    super(
      `Schema field "${fieldName}" has unsupported type "${fieldType}".
  field: ${fieldName}
  type: ${fieldType}
  hint: ${hint}`
    );
    this.hint = hint;
  }
};
var StaleEntityError = class extends Error {
  name = "StaleEntityError";
  code = "stale-entity";
  hint;
  /** Component name involved in the operation (undefined when the operation does not target a specific component). */
  component;
  /** The component-level operation that triggered this error (e.g. 'get' / 'set' / 'add' / 'remove'). Entity-level operations like `despawn` are not surfaced here — see `EntityHandle` lifecycle errors. */
  operation;
  /** The generation the caller expected (from the entity handle). */
  expectedGeneration;
  /**
   * The actual generation found in the entity pool. `-1` is the sentinel
   * value for entities never allocated (slot was never occupied), as opposed
   * to allocated-then-despawned entities which carry a real (incremented)
   * generation number.
   */
  actualGeneration;
  constructor(entityId, index, generation, enhanced) {
    const hint = enhanced ? `Entity was despawned. Operation "${enhanced.operation}" on entity ${entityId}` + (enhanced.component ? ` (component: ${enhanced.component})` : "") + ` expected generation ${enhanced.expectedGeneration}, found ${enhanced.actualGeneration}. Check entity lifecycle before access.` : "Entity was despawned. Check entity lifecycle before access.";
    super(
      `Operation on stale entity handle.
  entity: ${entityId} (index=${index}, generation=${generation})
` + (enhanced ? `  operation: ${enhanced.operation}
` : "") + (enhanced?.component ? `  component: ${enhanced.component}
` : "") + `  hint: ${hint}`
    );
    this.hint = hint;
    this.component = enhanced?.component;
    this.operation = enhanced?.operation;
    this.expectedGeneration = enhanced?.expectedGeneration;
    this.actualGeneration = enhanced?.actualGeneration;
  }
};
var ManagedBufferOutOfBoundsError = class extends RangeError {
  name = "ManagedBufferOutOfBoundsError";
  code = "managed-buffer-out-of-bounds";
  hint;
  expected;
  detail;
  constructor(index, size) {
    const hint = `Index ${index} is outside [0, ${size}). Check the field's 'buffer' / 'buffer<N>' declaration matches the access pattern.`;
    const expected = `index in [0, ${size})`;
    super(
      `BufferPool: index out of bounds.
  code: managed-buffer-out-of-bounds
  index: ${index}
  size: ${size}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = { index, size };
  }
};
var InstanceTransformsStrideMismatchError = class extends Error {
  name = "InstanceTransformsStrideMismatchError";
  code = "instance-transforms-stride-mismatch";
  hint;
  expected;
  detail;
  constructor(actualLength) {
    const hint = `Instances.transforms length ${actualLength} violates stride 16 (mat4); ensure transforms.length % 16 === 0 before render frame; verify world.set / world.push call sites`;
    const expectedStr = "actualLength % 16 === 0";
    super(
      `Instances.transforms: stride mismatch.
  code: instance-transforms-stride-mismatch
  actualLength: ${actualLength}
  expectedStride: 16
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expectedStr;
    this.detail = { actualLength, expectedStride: 16 };
  }
};
var ManagedArrayElementTypeNotAllowedError = class extends Error {
  name = "ManagedArrayElementTypeNotAllowedError";
  code = "managed-array-element-type-not-allowed";
  hint;
  expected;
  detail;
  constructor(fieldName, elementType) {
    const hint = `array<T> element type must be a scalar (f32/f64/i32/u32/i16/u16/i8/u8/bool/enum/ref) or entity. ref<X> / handle<X> / buffer:N / nested array<...> are forbidden on field "${fieldName}".`;
    const expected = "element type in {scalar | entity}";
    super(
      `managed-array: element type not allowed.
  code: managed-array-element-type-not-allowed
  field: ${fieldName}
  elementType: ${elementType}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = { fieldName, elementType, hint };
  }
};

// src/component.ts
var FIELD_SIZE_BYTES = {
  f32: 4,
  f64: 8,
  i32: 4,
  u32: 4,
  i16: 2,
  u16: 2,
  i8: 1,
  u8: 1,
  bool: 1,
  enum: 4,
  ref: 4
};
var MANAGED_ARRAY_ELEMENT_TYPES = /* @__PURE__ */ new Set([
  "f32",
  "f64",
  "i32",
  "u32",
  "i16",
  "u16",
  "i8",
  "u8",
  "bool",
  "enum",
  "ref",
  "entity"
]);
function isValidArrayElementType(elementType) {
  if (MANAGED_ARRAY_ELEMENT_TYPES.has(elementType)) return true;
  if (elementType.startsWith("shared<") && elementType.endsWith(">") && elementType.length > 9)
    return true;
  return false;
}
function parseManagedArraySchema(fieldType) {
  if (!fieldType.startsWith("array<") || !fieldType.endsWith(">")) return null;
  const inner = fieldType.slice(6, -1);
  const commaIdx = inner.indexOf(",");
  if (commaIdx === -1) {
    if (!isValidArrayElementType(inner)) return null;
    return { elementType: inner, length: void 0 };
  }
  const head = inner.slice(0, commaIdx).trim();
  const tail = inner.slice(commaIdx + 1).trim();
  if (!isValidArrayElementType(head)) return null;
  if (!/^[1-9]\d*$/.test(tail)) return null;
  return { elementType: head, length: Number.parseInt(tail, 10) };
}
function isSchemaVocabKeyword(s) {
  if (s === "string") return true;
  if (s === "entity") return true;
  if (s === "buffer") return true;
  if (s.startsWith("buffer<") && s.endsWith(">")) {
    const tail = s.slice(7, -1);
    return /^[1-9]\d*$/.test(tail);
  }
  if (s.startsWith("unique<") && s.endsWith(">")) {
    return /^\w+$/.test(s.slice(7, -1));
  }
  if (s.startsWith("shared<") && s.endsWith(">")) {
    return /^\w+$/.test(s.slice(7, -1));
  }
  if (s.startsWith("array<") && s.endsWith(">")) {
    return parseManagedArraySchema(s) !== null;
  }
  return false;
}
var COMPONENT_OWNER_REGISTRY = /* @__PURE__ */ Symbol.for("forgeax.ecs.componentOwnerRegistry");
var ownerSymbols = globalThis;
var ownerRegistry = ownerSymbols[COMPONENT_OWNER_REGISTRY] ?? (() => {
  const registry = {
    nextId: 1,
    ids: /* @__PURE__ */ new WeakMap(),
    schemas: /* @__PURE__ */ new WeakMap()
  };
  ownerSymbols[COMPONENT_OWNER_REGISTRY] = registry;
  return registry;
})();
function componentId(component) {
  const id = ownerRegistry.ids.get(component);
  if (id === void 0) throw new Error(`Component identity missing for '${component.name}'.`);
  return id;
}
function componentSchema(component) {
  const schema = ownerRegistry.schemas.get(component);
  if (schema === void 0) throw new Error(`Component schema missing for '${component.name}'.`);
  return schema;
}
var VIEW_CTORS = {
  f32: Float32Array,
  f64: Float64Array,
  i32: Int32Array,
  u32: Uint32Array,
  i16: Int16Array,
  u16: Uint16Array,
  i8: Int8Array,
  u8: Uint8Array,
  bool: Uint8Array,
  enum: Uint32Array,
  ref: Uint32Array
};
function scalarRow(t) {
  return {
    byteSize: FIELD_SIZE_BYTES[t],
    viewCtor: VIEW_CTORS[t],
    storage: t,
    isScalar: true,
    // The scalar `ref` shares its key with the vocab `ref<T>` family; mark
    // it as managed so the single row covers both.
    isManaged: t === "ref",
    isBuffer: false,
    isEntityRef: false,
    isArray: false
  };
}
var TYPE_METADATA = Object.freeze({
  f32: scalarRow("f32"),
  f64: scalarRow("f64"),
  i32: scalarRow("i32"),
  u32: scalarRow("u32"),
  i16: scalarRow("i16"),
  u16: scalarRow("u16"),
  i8: scalarRow("i8"),
  u8: scalarRow("u8"),
  bool: scalarRow("bool"),
  enum: scalarRow("enum"),
  ref: scalarRow("ref"),
  entity: {
    byteSize: 4,
    viewCtor: Uint32Array,
    storage: "u32",
    isScalar: false,
    isManaged: false,
    isBuffer: false,
    isEntityRef: true,
    isArray: false
  },
  string: {
    byteSize: 4,
    viewCtor: Uint32Array,
    storage: "u32",
    isScalar: false,
    isManaged: true,
    isBuffer: false,
    isEntityRef: false,
    isArray: false
  },
  buffer: {
    byteSize: 4,
    viewCtor: Uint32Array,
    storage: "u32",
    isScalar: false,
    isManaged: false,
    isBuffer: true,
    isEntityRef: false,
    isArray: false
  },
  // feat-20260614-ecs-shared-component-and-unique-rename M3 (plan-strategy
  // D-3): independent `'shared'` row, NOT a reuse of the `'ref'` (post-M2:
  // `'unique<T>'` family) row. `isManaged: true` so write-barrier dispatch
  // routes shared<T> fields through release on despawn / removeComponent /
  // set-overwrite, but the M4 sub-dispatch in releaseManagedFieldOnRow will
  // separate shared (rc--) from unique (direct slot drop) using the
  // fieldType.startsWith('shared<') predicate. Keeping the meta key
  // independent preserves the "meta key = release semantics" invariant
  // (architecture-principles.md #1 SSOT).
  shared: {
    byteSize: 4,
    viewCtor: Uint32Array,
    storage: "u32",
    isScalar: false,
    isManaged: true,
    isBuffer: false,
    isEntityRef: false,
    isArray: false
  },
  array: {
    byteSize: 4,
    viewCtor: Uint32Array,
    storage: "u32",
    isScalar: false,
    isManaged: false,
    isBuffer: false,
    isEntityRef: false,
    isArray: true
  }
});
function fieldSpecType(fieldName, spec) {
  if (typeof spec === "string") return spec;
  const t = spec.type;
  if (typeof t !== "string") {
    throw new SchemaUnsupportedFieldError(
      fieldName,
      `<field-descriptor missing 'type'> (expected { type, default?, meta? })`
    );
  }
  return t;
}
function defineComponent(name, fields, options) {
  const storage = "table";
  const schema = {};
  const reflectedFields = {};
  const collectedMeta = {};
  const collectedDefaults = {};
  for (const fieldName of Object.keys(fields)) {
    const spec = fields[fieldName];
    const fieldType = fieldSpecType(fieldName, spec);
    let arrayMeta;
    if (TYPE_METADATA[fieldType]?.isScalar === true) ; else if (fieldType === "string") ; else if (fieldType.startsWith("array<") && fieldType.endsWith(">")) {
      const parsed = parseManagedArraySchema(fieldType);
      if (parsed === null) {
        const elementType = fieldType.slice(6, -1);
        throw new ManagedArrayElementTypeNotAllowedError(fieldName, elementType);
      }
      arrayMeta = deepFreeze(
        parsed.length === void 0 ? { elementType: parsed.elementType } : { elementType: parsed.elementType, length: parsed.length }
      );
    } else if (!isSchemaVocabKeyword(fieldType)) {
      throw new SchemaUnsupportedFieldError(fieldName, fieldType);
    }
    schema[fieldName] = fieldType;
    const row = {
      type: fieldType
    };
    if (typeof spec !== "string") {
      const desc = spec;
      if ("default" in desc) {
        row.default = desc.default;
        collectedDefaults[fieldName] = desc.default;
      }
      if (desc.shape !== void 0) row.shape = desc.shape;
      if (desc.meta !== void 0) {
        Object.assign(collectedMeta, desc.meta);
      }
      if (desc.transient !== void 0) row.transient = desc.transient;
      if (desc.labels !== void 0) row.labels = deepFreeze({ ...desc.labels });
    }
    if (arrayMeta !== void 0) row.arrayMeta = arrayMeta;
    reflectedFields[fieldName] = Object.freeze(row);
  }
  const id = name === "Entity" ? 0 : ownerRegistry.nextId++;
  const frozenDefaults = Object.keys(collectedDefaults).length === 0 ? void 0 : deepFreeze(collectedDefaults);
  const frozenSchema = deepFreeze(schema);
  const frozenFields = deepFreeze(reflectedFields);
  const meta = collectedMeta;
  const token = Object.freeze({ name, fields: frozenFields, storage });
  ownerRegistry.ids.set(token, id);
  ownerRegistry.schemas.set(token, frozenSchema);
  registerComponentDefinition(token, {
    fields: frozenFields,
    defaults: frozenDefaults,
    policy: {
      transient: false,
      meta,
      requires: Object.freeze([...[]])
    }
  });
  return Object.freeze(token);
}
var ENTITY_MAX_INDEX = MAX_SLOT;
var ENTITY_NULL_RAW = 4294967295;
function encodeEntity(index, generation) {
  if (index < 0 || index > ENTITY_MAX_INDEX) {
    throw new EntityIndexOverflowError(index);
  }
  return pack(index, generation);
}
function entityIndex(entity) {
  return unpackSlot(entity);
}

// src/component-default-fallback.ts
function typeDefault(fieldType) {
  if (fieldType === "bool") return false;
  if (fieldType === "entity") return ENTITY_NULL_RAW;
  if (fieldType === "array<entity>") return [];
  return 0;
}
function fillComponentDefaults(token, raw) {
  const schema = componentSchema(token);
  const layer2 = componentDefinition(token).defaults;
  const out = /* @__PURE__ */ Object.create(null);
  const rawObj = raw ?? void 0;
  for (const fieldName of Object.keys(schema)) {
    const fieldType = schema[fieldName];
    if (fieldType === void 0) continue;
    if (rawObj !== void 0 && fieldName in rawObj) {
      out[fieldName] = rawObj[fieldName];
      continue;
    }
    if (layer2 !== void 0 && fieldName in layer2) {
      out[fieldName] = layer2[fieldName];
      continue;
    }
    out[fieldName] = typeDefault(fieldType);
  }
  return out;
}

// src/entity.ts
var Entity = defineComponent("Entity", {
  // Layer-2 default is never observed: `world.spawn` always overwrites `self`
  // with the freshly encoded handle for the row. `null` is the type-correct
  // "no handle yet" placeholder (`'entity'` decodes to `EntityHandle | null`).
  self: { type: "entity", default: null }
});
defineComponent("Disabled", {});
Object.freeze([
  componentId(Entity)
]);

// src/storage/change-detection.ts
var PROJECTION_BLOCK_SIZE = 256;

// src/projection/state-projection.ts
var StateProjectionExpiredError = class extends Error {
  code = "state-projection-expired";
  expected = "an unmodified source and the latest valid projection candidate";
  hint = "Read and apply the current state again before accepting the candidate.";
  constructor() {
    super("State projection candidate expired; read and apply the current state again.");
    this.name = "StateProjectionExpiredError";
  }
};
function createStateProjection(world, components, candidates = components) {
  const owner = world[worldInternal];
  const graph = owner.getGraph();
  const ids = components.map(componentId);
  const candidateIds = candidates.map(componentId);
  const sparseCandidates = candidates.some((component) => component.storage === "sparse");
  const baseline = /* @__PURE__ */ new Map();
  let acceptedEpoch = -1;
  let acceptedStructure = -1;
  let invalid = true;
  let readToken = 0;
  let stamp = new Uint32Array(64);
  let serial = 0;
  const work = [];
  function enqueue(index) {
    if (index >= stamp.length) {
      let size = stamp.length;
      while (size <= index) size *= 2;
      const next = new Uint32Array(size);
      next.set(stamp);
      stamp = next;
    }
    if (stamp[index] === serial) return;
    stamp[index] = serial;
    work.push(index);
  }
  return {
    isCurrent() {
      return world.execution.health !== "poisoned" && !invalid && acceptedEpoch === owner.getMutationEpoch() && acceptedStructure === owner.getStructureEpoch();
    },
    entity(index) {
      const record = owner.getRecords()[index];
      if (record === void 0 || record.archetypeId < 0) return void 0;
      return encodeEntity(index, record.generation);
    },
    changed(entity, component) {
      const id = componentId(component);
      if ((owner.getComponentMutationEpochs()[id] ?? 0) <= acceptedEpoch) return false;
      return (owner.getComponentChange(entity, id)?.changed ?? -1) > acceptedEpoch;
    },
    invalidate() {
      readToken++;
      invalid = true;
    },
    read() {
      if (world.execution.health === "poisoned")
        throw new WorldPoisonedError(world.identity, world.execution.fault);
      const token = ++readToken;
      const epoch = owner.getMutationEpoch();
      const structure = owner.getStructureEpoch();
      const changedComponents = components.filter(
        (component) => (owner.getComponentMutationEpochs()[componentId(component)] ?? 0) > acceptedEpoch
      );
      const membershipChanged = invalid || structure !== acceptedStructure;
      const changedRoots = invalid || structure !== acceptedStructure || ids.some((id) => (owner.getComponentMutationEpochs()[id] ?? 0) > acceptedEpoch);
      work.length = 0;
      serial = serial + 1 >>> 0;
      if (serial === 0) {
        stamp.fill(0);
        serial = 1;
      }
      let scannedRows = 0;
      let checkedBlocks = 0;
      const updates = [];
      const visited = /* @__PURE__ */ new Set();
      if (changedRoots) {
        const tables = /* @__PURE__ */ new Set();
        if (sparseCandidates) {
          for (const table of graph.activeTables) tables.add(table);
        } else {
          for (const id of candidateIds)
            for (const table of graph.activeTablesByComponent.get(id) ?? []) tables.add(table);
        }
        for (const table of tables) {
          visited.add(table);
          const prior = baseline.get(table);
          const entities = table.storage.get(componentId(Entity))?.fields.get("self")?.view;
          if (entities === void 0) continue;
          const columns = ids.flatMap((id) => {
            const epochs = table.storage.get(id)?.epochs;
            return epochs === void 0 ? [] : [epochs];
          });
          const blocks = Math.ceil(table.size / PROJECTION_BLOCK_SIZE);
          for (let block = 0; block < blocks; block++) {
            checkedBlocks++;
            const previous = prior?.get(block);
            const membership = table.membership[block] ?? 0;
            const start = block * PROJECTION_BLOCK_SIZE;
            const end = Math.min(table.size, start + PROJECTION_BLOCK_SIZE);
            if (invalid || previous === void 0 || previous.membership !== membership) {
              if (previous !== void 0) {
                for (const index of previous.ids) enqueue(index);
                scannedRows += previous.ids.length;
              }
              const current = new Uint32Array(end - start);
              for (let row = start; row < end; row++) {
                const index = entityIndex(entities[row]);
                current[row - start] = index;
                enqueue(index);
              }
              scannedRows += end - start;
              updates.push({ table, block, value: { ids: current, membership } });
            } else {
              let changedBlock = false;
              for (const column of columns) {
                if ((column.blocks[block] ?? 0) <= acceptedEpoch) continue;
                changedBlock = true;
                for (let row = start; row < end; row++) {
                  if ((column.changed[row] ?? 0) > acceptedEpoch)
                    enqueue(entityIndex(entities[row]));
                }
              }
              if (!changedBlock) continue;
              scannedRows += end - start;
            }
          }
          if (prior !== void 0) {
            for (const [block, previous] of prior) {
              if (block < blocks) continue;
              checkedBlocks++;
              for (const index of previous.ids) enqueue(index);
              scannedRows += previous.ids.length;
              updates.push({ table, block, value: void 0 });
            }
          }
        }
        for (const [table, prior] of baseline) {
          if (visited.has(table)) continue;
          for (const [block, previous] of prior) {
            checkedBlocks++;
            for (const index of previous.ids) enqueue(index);
            scannedRows += previous.ids.length;
            updates.push({ table, block, value: void 0 });
          }
        }
      }
      let accepted = false;
      const validate = () => {
        if (world.execution.health === "poisoned")
          throw new WorldPoisonedError(world.identity, world.execution.fault);
        if (token !== readToken || epoch !== owner.getMutationEpoch() || structure !== owner.getStructureEpoch()) {
          throw new StateProjectionExpiredError();
        }
      };
      return {
        indices: work,
        epoch,
        scannedRows,
        checkedBlocks,
        membershipChanged,
        changedComponents,
        validate,
        accept() {
          if (accepted) return;
          validate();
          for (const update of updates) {
            let blocks = baseline.get(update.table);
            if (update.value === void 0) {
              blocks?.delete(update.block);
              if (blocks?.size === 0) baseline.delete(update.table);
            } else {
              if (blocks === void 0) {
                blocks = /* @__PURE__ */ new Map();
                baseline.set(update.table, blocks);
              }
              blocks.set(update.block, update.value);
            }
          }
          acceptedEpoch = epoch;
          acceptedStructure = structure;
          invalid = false;
          accepted = true;
        }
      };
    }
  };
}

// src/projection/index.ts
function readRenderArrayView(world, entity, component, fieldName) {
  return world[worldInternal].getArrayView(entity, component, fieldName);
}
function readProjectionSpans(world, generation, request) {
  const queryResult = world.query({ read: request.components.map((entry) => entry.component) });
  if (!queryResult.ok) throw new Error(queryResult.error.message);
  const spansResult = queryResult.value.spans();
  if (!spansResult.ok) throw new Error(spansResult.error.message);
  const spans = [];
  for (const span of spansResult.value) {
    const fields = {};
    for (const entry of request.components) {
      const shape = span.get(entry.component);
      for (const fieldName of entry.fields) {
        const field = shape[fieldName];
        if (field === void 0) {
          throw new Error(
            `Render projection field '${entry.component.name}.${fieldName}' is unavailable.`
          );
        }
        fields[`${entry.component.name}.${fieldName}`] = field;
        if (request.components.length === 1) fields[fieldName] = field;
      }
    }
    spans.push({ length: span.length, fields: Object.freeze(fields) });
  }
  return {
    generation,
    spans: Object.freeze(spans)
  };
}
function createRenderReadLease(world, token = {}) {
  let disposed = false;
  const assertLive = () => {
    if (disposed) throw new Error("RenderReadLease is disposed.");
  };
  const captureVersion = () => {
    return {
      mutationEpoch: world[worldInternal].getMutationEpoch(),
      structureEpoch: world[worldInternal].getStructureEpoch()
    };
  };
  return {
    worldIdentity: world.identity,
    get generation() {
      return Math.max(1, world[worldInternal].getStructureEpoch());
    },
    captureVersion() {
      assertLive();
      return captureVersion();
    },
    readChanges(start) {
      assertLive();
      const toEpoch = world[worldInternal].getMutationEpoch();
      const componentEpochs = world[worldInternal].getComponentMutationEpochs();
      const changedComponentIds = [];
      for (let componentId2 = 0; componentId2 < componentEpochs.length; componentId2 += 1) {
        const epoch = componentEpochs[componentId2] ?? 0;
        if (epoch > start.mutationEpoch && epoch <= toEpoch) changedComponentIds.push(componentId2);
      }
      const worldRead = {
        fromEpoch: start.mutationEpoch,
        toEpoch,
        changedComponentIds
      };
      const version = captureVersion();
      return { version, world: worldRead };
    },
    querySpans(request) {
      assertLive();
      return readProjectionSpans(
        world,
        Math.max(1, world[worldInternal].getStructureEpoch()),
        request
      );
    },
    dispose() {
      disposed = true;
    }
  };
}
function setDerivedComponent(world, entity, component, value) {
  const result = world[worldInternal].setQueryRow(entity, component, value);
  if (!result.ok) return result;
  world[worldInternal].markComponentChanged(entity, componentId(component));
  return result;
}
function routeWorldError(world, error, context) {
  world[worldInternal].routeError(error, context);
}

export { ComponentNotDefinedError, InstanceTransformsStrideMismatchError, ManagedBufferOutOfBoundsError, ResourceInvalidValueError, SpawnLightInvalidBoundsError, SpriteAnimationInvalidError, SpriteInstancesCountMismatchError, SpriteInstancesMutuallyExclusiveWithInstancesError, SpriteInstancesRequiresSpriteShaderError, StaleEntityError, StateProjectionExpiredError, createRenderReadLease, createStateProjection, fillComponentDefaults, readRenderArrayView, routeWorldError, setDerivedComponent };
