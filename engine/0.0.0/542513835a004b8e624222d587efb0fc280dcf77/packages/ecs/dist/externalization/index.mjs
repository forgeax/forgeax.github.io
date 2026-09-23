import '../../../types/dist/index.mjs';

// src/component.ts

// src/component-schema.ts
var COMPONENT_REGISTRY = /* @__PURE__ */ Symbol.for("forgeax.ecs.componentRegistry");
var globalSymbols = globalThis;
var definitions = globalSymbols[COMPONENT_REGISTRY] ?? (() => {
  const registry = { definitions: /* @__PURE__ */ new WeakMap() };
  globalSymbols[COMPONENT_REGISTRY] = registry;
  return registry;
})();
function componentDefinition(component) {
  const definition = definitions.definitions.get(component);
  if (definition === void 0) {
    throw new Error(`Component definition missing for '${component.name}'.`);
  }
  return definition;
}

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
Object.freeze({
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
var ENTITY_NULL_RAW = 4294967295;

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

// src/externalization/index.ts
function classifyEntityField(token, fieldName) {
  const field = componentDefinition(token).fields[fieldName];
  if (field === void 0) return null;
  if (field.arrayMeta !== void 0) {
    return field.arrayMeta.elementType === "entity" ? { kind: "entity", isArray: true } : null;
  }
  return componentSchema(token)[fieldName] === "entity" ? { kind: "entity", isArray: false } : null;
}
function remapEntityFieldValue(value, kind, remapFn) {
  if (kind === null) return value;
  if (kind.isArray) return Array.isArray(value) ? value.map((entity) => remapFn(entity)) : value;
  return typeof value === "number" ? remapFn(value) : value;
}
function createEntityRemap(mapping, options = {}) {
  return (entity) => {
    const mapped = entity >= 0 && entity < mapping.length ? mapping[entity] : void 0;
    if (mapped !== void 0) return mapped;
    if (options.missing === "error") {
      throw new Error(`Entity mapping is missing source entity ${entity}.`);
    }
    return entity;
  };
}
function deepCopyValue(value) {
  if (Array.isArray(value)) return [...value];
  if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
    const view = value;
    const ViewCtor = value.constructor;
    return new ViewCtor(view);
  }
  return value;
}
function projectComponentDataInMode(token, raw, entityRemap) {
  const definition = componentDefinition(token);
  if (definition.policy.transient) return {};
  const fields = definition.fields;
  const rawObj = raw;
  const filtered = {};
  for (const fieldName of Object.keys(componentSchema(token))) {
    const reflection = fields?.[fieldName];
    if (reflection?.transient === true || rawObj === void 0 || !(fieldName in rawObj)) continue;
    const value = rawObj[fieldName];
    if (value === void 0) continue;
    const kind = classifyEntityField(token, fieldName);
    if (kind?.isArray && (Array.isArray(value) || ArrayBuffer.isView(value))) {
      filtered[fieldName] = Array.from(
        value,
        (entity) => entityRemap === void 0 ? entity : entityRemap(entity)
      );
    } else if (kind !== null && typeof value === "number") {
      filtered[fieldName] = entityRemap === void 0 ? value : entityRemap(value);
    } else {
      filtered[fieldName] = deepCopyValue(value);
    }
  }
  const result = fillComponentDefaults(token, filtered);
  for (const fieldName of Object.keys(componentSchema(token))) {
    if (fields?.[fieldName]?.transient === true) delete result[fieldName];
  }
  return result;
}
function projectComponentData(token, raw, entityRemap) {
  return projectComponentDataInMode(token, raw, entityRemap);
}
function isComponentPortable(token) {
  const definition = componentDefinition(token);
  if (definition.policy.transient) return false;
  const fields = definition.fields;
  if (fields === void 0) return true;
  return Object.keys(componentSchema(token)).some((name) => fields[name]?.transient !== true);
}
function isComponentFullyTransient(token) {
  return !isComponentPortable(token);
}
function isFieldPortable(fieldType) {
  if (fieldType === "ref" || fieldType.startsWith("unique<") || fieldType.startsWith("shared<")) {
    return false;
  }
  if (fieldType.startsWith("array<") && fieldType.endsWith(">")) {
    const body = fieldType.slice(6, -1).replace(/,\s*\d+$/u, "").trim();
    return body.length > 0 && isFieldPortable(body);
  }
  return true;
}
function validateProfileComponents(components) {
  const errors = [];
  for (const token of components) {
    if (isComponentFullyTransient(token)) {
      errors.push({
        component: token.name,
        code: "component-fully-transient",
        expected: `Component '${token.name}' must have at least one non-transient, portable field`,
        hint: "Remove the component-level transient flag or declare a non-transient field"
      });
      continue;
    }
    const fields = componentDefinition(token).fields;
    for (const fieldName of Object.keys(componentSchema(token))) {
      const fieldType = componentSchema(token)[fieldName];
      if (fieldType === void 0 || fields?.[fieldName]?.transient === true) continue;
      if (!isFieldPortable(fieldType)) {
        errors.push({
          component: token.name,
          code: "field-not-portable",
          field: fieldName,
          fieldType,
          expected: `Field '${fieldName}' of component '${token.name}' must be portable`,
          hint: `Field type '${fieldType}' is a process-local reference`
        });
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

export { classifyEntityField, createEntityRemap, isComponentFullyTransient, isComponentPortable, isFieldPortable, projectComponentData, remapEntityFieldValue, validateProfileComponents };
