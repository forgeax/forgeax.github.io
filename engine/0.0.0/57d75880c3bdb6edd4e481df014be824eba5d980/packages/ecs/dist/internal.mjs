import '../../types/dist/index.mjs';

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

// src/internal.ts
var DERIVED_WRITER = /* @__PURE__ */ Symbol.for(
  "forgeax.ecs.query.derivedWriter"
);
function getDerivedWriter(query, component) {
  const internalQuery = query;
  return internalQuery[DERIVED_WRITER](component);
}

export { DERIVED_WRITER, componentDefinition, componentId, componentSchema, getDerivedWriter };
