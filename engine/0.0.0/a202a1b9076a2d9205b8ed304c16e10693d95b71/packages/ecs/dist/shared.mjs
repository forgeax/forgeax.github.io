import '../../types/dist/index.mjs';

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

// src/world-internal.ts
var worldInternal = /* @__PURE__ */ Symbol.for(
  "forgeax.ecs.worldInternal"
);

// src/execution/shared-kernel.ts
var SHARED_KERNEL_EXECUTOR_RESOURCE_KEY = "SharedKernelExecutor";
function isKernelDispatchFailure(value) {
  return "cause" in value;
}
var SHARED_KERNEL_ELIGIBILITY_REASONS = [
  "callback-not-module-function",
  "dom-access",
  "missing-access-declaration",
  "descriptor-conflict",
  "object-field",
  "span-unavailable"
];
var SharedKernelEligibilityError = class extends Error {
  code = "shared-kernel-ineligible";
  expected = "a module-loadable named kernel with one or more numeric QuerySpan read/write declarations";
  hint = "export a named function from the kernel module and use only dense numeric QuerySpan columns";
  detail;
  constructor(kernelName, reason) {
    super(`Shared kernel "${kernelName}" is ineligible: ${reason}.`);
    this.name = "SharedKernelEligibilityError";
    this.detail = { kernelName, reason };
  }
};
var SharedKernelFailureError = class extends Error {
  code = "shared-kernel-failed";
  expected = "every dispatched shard completes without a possible partial write";
  hint = "do not retry this World; inspect detail.cause and rebuild with a new World identity";
  detail;
  constructor(kernelName, worldIdentity, cause, partialWrite) {
    super(`Shared kernel "${kernelName}" failed; World ${worldIdentity} is poisoned.`);
    this.name = "SharedKernelFailureError";
    this.detail = { kernelName, worldIdentity, cause, partialWrite, retryable: false };
  }
};
var NUMERIC_FIELDS = /* @__PURE__ */ new Set([
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
function components(descriptor) {
  return [
    ...descriptor.read ?? [],
    ...descriptor.write ?? [],
    ...descriptor.optional ?? [],
    ...descriptor.with ?? [],
    ...descriptor.without ?? [],
    ...descriptor.changed ?? [],
    ...descriptor.added ?? []
  ];
}
function descriptorReason(descriptor) {
  if ((descriptor.read?.length ?? 0) + (descriptor.write?.length ?? 0) === 0) {
    return "missing-access-declaration";
  }
  if ((descriptor.optional?.length ?? 0) > 0 || (descriptor.changed?.length ?? 0) > 0 || (descriptor.added?.length ?? 0) > 0) {
    return "span-unavailable";
  }
  const seen = /* @__PURE__ */ new Set();
  for (const component of components(descriptor)) {
    if (seen.has(componentId(component))) return "descriptor-conflict";
    seen.add(componentId(component));
    if (component.storage === "sparse") return "span-unavailable";
    if (Object.values(componentSchema(component)).some((field) => !NUMERIC_FIELDS.has(field))) {
      return "object-field";
    }
  }
  return void 0;
}
function sharedKernelEligibility(moduleUrl, definition) {
  try {
    new URL(moduleUrl);
  } catch {
    return "callback-not-module-function";
  }
  const source = Function.prototype.toString.call(definition.run);
  if (definition.run.name.length === 0 || source.includes("=>")) {
    return "callback-not-module-function";
  }
  if (/\b(?:document|window|globalThis|HTMLElement|GPUDevice|AudioContext)\b/u.test(source)) {
    return "dom-access";
  }
  for (const query of definition.queries) {
    const reason = descriptorReason(query);
    if (reason !== void 0) return reason;
  }
  return void 0;
}
function defineSharedKernel(moduleUrl, definition) {
  const reason = sharedKernelEligibility(moduleUrl, definition);
  if (reason !== void 0) throw new SharedKernelEligibilityError(definition.name, reason);
  const handle = Object.freeze({
    kind: "shared-kernel",
    moduleUrl,
    name: definition.name,
    queries: definition.queries,
    minimumRows: definition.minimumRows ?? 16384,
    run: definition.run,
    ...definition.before !== void 0 ? { before: definition.before } : {},
    ...definition.after !== void 0 ? { after: definition.after } : {},
    fn: (world, queries) => {
      const dispatchSpans = [];
      for (const [queryIndex, query] of queries.entries()) {
        const result = query.spans();
        if (!result.ok) throw new SharedKernelEligibilityError(definition.name, "span-unavailable");
        for (const span of result.value) dispatchSpans.push({ queryIndex, span });
      }
      const spans = dispatchSpans.map((entry) => entry.span);
      const totalRows = spans.reduce((sum, span) => sum + span.length, 0);
      try {
        if (totalRows < (definition.minimumRows ?? 16384) || !world.hasResource(SHARED_KERNEL_EXECUTOR_RESOURCE_KEY)) {
          definition.run(spans);
          return;
        }
        const executor = world.getResource(
          SHARED_KERNEL_EXECUTOR_RESOURCE_KEY
        );
        const result = executor.execute(handle, dispatchSpans);
        if (isKernelDispatchFailure(result)) {
          if (!result.partialWrite) {
            definition.run(spans);
            return;
          }
          world[worldInternal].poisonExecution({
            code: "shared-kernel-failed",
            kernelName: definition.name,
            cause: result.cause,
            partialWrite: result.partialWrite,
            retryable: false
          });
          throw new SharedKernelFailureError(
            definition.name,
            world.execution.identity,
            result.cause,
            result.partialWrite
          );
        }
      } catch (cause) {
        if (world.execution.health !== "poisoned") {
          world[worldInternal].poisonExecution({
            code: "shared-kernel-failed",
            kernelName: definition.name,
            cause,
            partialWrite: true,
            retryable: false
          });
        }
        if (cause instanceof SharedKernelFailureError) throw cause;
        throw new SharedKernelFailureError(definition.name, world.execution.identity, cause, true);
      }
    }
  });
  return handle;
}
function sliceFields(fields, start, end) {
  return Object.fromEntries(
    Object.entries(fields).map(([name, view]) => [name, view.subarray(start, end)])
  );
}
function bindSharedSpan(kernel, span, queryIndex) {
  const descriptor = kernel.queries[queryIndex];
  if (descriptor === void 0) throw new Error(`Missing query descriptor ${queryIndex}.`);
  const read = Object.fromEntries(
    (descriptor.read ?? []).map((component) => [
      component.name,
      span.get(component)
    ])
  );
  const write = Object.fromEntries(
    (descriptor.write ?? []).map((component) => [
      component.name,
      span.mut(component)
    ])
  );
  return { entities: span.entities, length: span.length, read, write };
}
function splitSharedSpan(binding, shardCount) {
  if (binding.length === 0 || shardCount <= 0) return [];
  const count = Math.min(binding.length, shardCount);
  const shards = [];
  for (let index = 0; index < count; index += 1) {
    const start = Math.floor(binding.length * index / count);
    const end = Math.floor(binding.length * (index + 1) / count);
    shards.push({
      entities: binding.entities.subarray(start, end),
      length: end - start,
      read: Object.fromEntries(
        Object.entries(binding.read).map(([component, fields]) => [
          component,
          sliceFields(fields, start, end)
        ])
      ),
      write: Object.fromEntries(
        Object.entries(binding.write).map(([component, fields]) => [
          component,
          sliceFields(fields, start, end)
        ])
      )
    });
  }
  return shards;
}
function isSharedSpan(binding) {
  if (typeof SharedArrayBuffer === "undefined") return false;
  if (!(binding.entities.buffer instanceof SharedArrayBuffer)) return false;
  return [...Object.values(binding.read), ...Object.values(binding.write)].every(
    (fields) => Object.values(fields).every((view) => view.buffer instanceof SharedArrayBuffer)
  );
}

export { SHARED_KERNEL_ELIGIBILITY_REASONS, SHARED_KERNEL_EXECUTOR_RESOURCE_KEY, bindSharedSpan, defineSharedKernel, isKernelDispatchFailure, isSharedSpan, sharedKernelEligibility, splitSharedSpan };
