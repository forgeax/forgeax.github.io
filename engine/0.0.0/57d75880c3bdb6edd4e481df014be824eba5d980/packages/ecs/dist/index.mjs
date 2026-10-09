import { MAX_GEN, MAX_SLOT, err, ok, unwrapHandle, isRetiredSlot, toUnique, BUILTIN_BASE, toShared, pack, handleSlot, handleGeneration, unpackSlot, unpackGen } from '../../types/dist/index.mjs';
import { Context } from '../../plugin/dist/browser.mjs';

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
function componentRequirements(component) {
  return definitions.definitions.get(component)?.policy.requires ?? [];
}
function expandComponentRequirements(componentDatas) {
  let hasRequirements = false;
  for (const entry of componentDatas) {
    if (componentRequirements(entry.component).length !== 0) {
      hasRequirements = true;
      break;
    }
  }
  if (!hasRequirements) return componentDatas;
  const expanded = [...componentDatas];
  const seen = new Set(expanded.map((entry) => entry.component));
  for (let index = 0; index < expanded.length; index++) {
    const component = expanded[index]?.component;
    if (component === void 0) continue;
    for (const required of componentRequirements(component)) {
      if (seen.has(required)) continue;
      seen.add(required);
      expanded.push({ component: required, data: {} });
    }
  }
  return expanded;
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
function assertComponentStorage(value) {
  if (value !== "table" && value !== "sparse") {
    throw new Error(`Unsupported component storage '${value}'. Expected 'table' or 'sparse'.`);
  }
}

// src/errors/query-and-component-errors.ts
var RemoveEssentialComponentError = class extends Error {
  name = "RemoveEssentialComponentError";
  code = "remove-essential-component";
  hint;
  expected;
  detail;
  constructor(componentName) {
    const hint = `Component "${componentName}" is essential (every entity carries it unconditionally) and cannot be removed. Despawn the entity instead if you want to retire it.`;
    const expected = "non-essential component";
    super(
      `removeComponent: essential component cannot be removed.
  code: remove-essential-component
  component: ${componentName}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = { componentName };
  }
};
var SpawnDataUnknownFieldError = class extends Error {
  name = "SpawnDataUnknownFieldError";
  code = "spawn-data-unknown-field";
  hint;
  expected;
  detail;
  constructor(componentName, fieldName, knownFields) {
    const sortedKnown = [...knownFields].sort();
    const expected = `field name in {${sortedKnown.join(", ")}}`;
    const hint = `'${fieldName}' is not a schema field of '${componentName}'. Known fields: ${sortedKnown.join(", ")}. Check for a typo or a stale single-vs-plural rename (e.g. 'material' vs 'materials').`;
    super(
      `${componentName}: spawn data carries unknown field.
  code: spawn-data-unknown-field
  component: ${componentName}
  field: ${fieldName}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = { component: componentName, field: fieldName, knownFields: sortedKnown };
  }
};
var QueryDescriptorConflictError = class extends Error {
  name = "QueryDescriptorConflictError";
  code = "query-descriptor-conflict";
  expected = "each component occupies one descriptor role";
  hint;
  detail;
  constructor(componentName, roles2) {
    const hint = `Remove ${componentName} from all but one of: ${roles2.join(", ")}.`;
    super(`Query descriptor roles conflict for ${componentName}.
  hint: ${hint}`);
    this.hint = hint;
    this.detail = { componentName, roles: roles2 };
  }
};
var QueryDataRequiresFieldsError = class extends Error {
  name = "QueryDataRequiresFieldsError";
  code = "query-data-requires-fields";
  expected = "a component with at least one data field";
  hint;
  detail;
  constructor(componentName) {
    const hint = `Move tag ${componentName} to with or without.`;
    super(`Query data access requires fields on ${componentName}.
  hint: ${hint}`);
    this.hint = hint;
    this.detail = { componentName };
  }
};
var QuerySpanUnavailableError = class extends Error {
  name = "QuerySpanUnavailableError";
  code = "query-span-unavailable";
  expected = "a descriptor whose rows form contiguous table ranges";
  hint = "Use row iteration or split the query.";
  detail;
  constructor(reason) {
    super(`Query spans are unavailable: ${reason}.
  hint: Use row iteration or split the query.`);
    this.detail = { reason };
  }
};
var QueryIterationInvalidatedError = class extends Error {
  name = "QueryIterationInvalidatedError";
  code = "query-iteration-invalidated";
  expected;
  hint = "Use deferred Commands for structural mutation, then restart iteration.";
  detail;
  constructor(expectedStructureEpoch, actualStructureEpoch) {
    const expected = `structure epoch ${expectedStructureEpoch}`;
    super(
      `Query iteration was invalidated by structure epoch ${actualStructureEpoch}.
  hint: ${"Use deferred Commands for structural mutation, then restart iteration."}`
    );
    this.expected = expected;
    this.detail = { expectedStructureEpoch, actualStructureEpoch };
  }
};
var QueryIterationActiveError = class extends Error {
  name = "QueryIterationActiveError";
  code = "query-iteration-active";
  expected = "one active iterator per Query";
  hint = "Complete the active iterator or create an independent Query.";
  detail = {};
  constructor() {
    super("Query already has an active iterator.\n  hint: Complete it before iterating again.");
  }
};

// src/errors/relationship-errors.ts
var RelationshipSelfCycleError = class extends Error {
  name = "RelationshipSelfCycleError";
  code = "relationship-self-cycle";
  hint;
  expected;
  detail;
  constructor(component, entity, ancestor) {
    const hint = `Linking entity ${entity} via "${component}" would close a cycle through ancestor ${ancestor}. Reparent to an entity that is not a descendant of ${entity}.`;
    const expected = "acyclic parent chain";
    super(
      `relationship: cycle detected.
  code: relationship-self-cycle
  component: ${component}
  entity: ${entity}
  ancestor: ${ancestor}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = { component, entity, ancestor };
  }
};
var RelationshipDetachMismatchError = class extends Error {
  name = "RelationshipDetachMismatchError";
  code = "relationship-detach-mismatch";
  hint;
  expected;
  detail;
  constructor(component, child, expectedParent, actualParent) {
    const hint = `removeChild(${expectedParent}, ${child}) via "${component}": child's current parent is ${actualParent}, not ${expectedParent}. Detach from the actual parent or re-read the current relationship.`;
    const expected = `child's "${component}" parent === ${expectedParent}`;
    super(
      `relationship: detach parent mismatch.
  code: relationship-detach-mismatch
  component: ${component}
  child: ${child}
  expectedParent: ${expectedParent}
  actualParent: ${actualParent}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = { component, child, expectedParent, actualParent };
  }
};
var RelationshipTargetReadonlyError = class extends Error {
  name = "RelationshipTargetReadonlyError";
  code = "component-field-invalid-value";
  expected = "relationship source mutation";
  hint;
  detail;
  constructor(component, operation) {
    const hint = `Component "${component}" is an engine-maintained relationship target. Mutate its source component instead of ${operation}.`;
    super(`[RelationshipTargetReadonlyError component-field-invalid-value] ${hint}`);
    this.hint = hint;
    this.detail = { component, operation };
  }
};

// src/errors/sprite-and-shared-errors.ts
var SharedFieldInvalidValueError = class extends Error {
  name = "SharedFieldInvalidValueError";
  code = "shared-field-invalid-value";
  hint;
  expected;
  detail;
  constructor(componentName, fieldName, fieldType, actualValue, index) {
    const at = index === void 0 ? "" : `[${index}]`;
    const expected = `a resolved numeric Handle for shared field '${fieldName}${at}'`;
    const hint = `'${fieldName}${at}' on '${componentName}' is a ${fieldType} reference; got ${typeof actualValue} (${JSON.stringify(actualValue)}). Resolve the GUID to a handle first: AssetRegistry.load(guid, kind) then allocSharedRef(...), and bind the returned numeric handle \u2014 not the raw GUID / sidecar object.`;
    super(
      `${componentName}.${fieldName}${at}: shared field bound to a non-handle value.
  code: shared-field-invalid-value
  component: ${componentName}
  field: ${fieldName}${at}
  fieldType: ${fieldType}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = index === void 0 ? { component: componentName, field: fieldName, fieldType, actualValue } : { component: componentName, field: fieldName, fieldType, actualValue, index };
  }
};

// src/errors/validation-errors.ts
var TimeDeltaInvalidError = class extends Error {
  name = "TimeDeltaInvalidError";
  code = "time-delta-invalid";
  expected = "a finite delta greater than or equal to 0";
  hint = "Call world.update(deltaSeconds) with a finite non-negative delta.";
  detail;
  constructor(received) {
    super(
      `Invalid world.update delta: ${received}.
  expected: a finite delta greater than or equal to 0
  hint: Call world.update(deltaSeconds) with a finite non-negative delta.`
    );
    this.detail = { received };
  }
};
var TimeConfigInvalidError = class extends Error {
  name = "TimeConfigInvalidError";
  code = "time-config-invalid";
  expected;
  hint = "Increase maxDeltaSeconds or decrease maxStepsPerUpdate or fixedDeltaSeconds.";
  detail;
  constructor(detail) {
    const expected = "maxDeltaSeconds >= (maxStepsPerUpdate + 1) * fixedDeltaSeconds";
    super(
      `Invalid World time policy.
  expected: ${expected}
  hint: Increase maxDeltaSeconds or decrease maxStepsPerUpdate or fixedDeltaSeconds.`
    );
    this.expected = expected;
    this.detail = detail;
  }
};
var ScheduleScopeMismatchError = class extends Error {
  name = "ScheduleScopeMismatchError";
  code = "schedule-scope-mismatch";
  expected;
  hint;
  detail;
  constructor(sourceSchedule, targetSchedule, reference) {
    const expected = `a reference owned by ${sourceSchedule}`;
    const hint = `The referenced item belongs to ${targetSchedule}; register and order it in ${sourceSchedule}.`;
    super(`Schedule scope mismatch.
  expected: ${expected}
  hint: ${hint}`);
    this.expected = expected;
    this.hint = hint;
    this.detail = { sourceSchedule, targetSchedule, ...reference ? { reference } : {} };
  }
};
var ComponentFieldInvalidValueError = class extends Error {
  name = "ComponentFieldInvalidValueError";
  code = "component-field-invalid-value";
  hint;
  expected;
  detail;
  constructor(entity, component, field, received, allowedValues) {
    const entries = Object.entries(allowedValues).map(([label, value]) => `${label}=${value}`).join(", ");
    const expected = `${component}.${field} in { ${entries} }`;
    const hint = `Set ${component}.${field} to one of the reflected enum values: ${entries}`;
    super(
      `${component}.${field} received an invalid enum value.
  code: component-field-invalid-value
  component: ${component}
  field: ${field}
  received: ${String(received)}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = { entity, component, field, received, allowedValues };
  }
};
var ComponentNumericValueInvalidError = class extends Error {
  name = "ComponentNumericValueInvalidError";
  code = "component-numeric-value-invalid";
  expected = "a numeric value other than NaN";
  hint;
  detail;
  constructor(entity, component, field, received, index) {
    const location = index === void 0 ? `${component}.${field}` : `${component}.${field}[${index}]`;
    const hint = `Replace NaN at ${location} with an authored numeric value; Number.POSITIVE_INFINITY remains valid where the component domain permits it.`;
    super(
      `${location} received NaN.
  code: component-numeric-value-invalid
  expected: a numeric value other than NaN
  hint: ${hint}`
    );
    this.hint = hint;
    this.detail = {
      entity,
      component,
      field,
      received,
      ...index === void 0 ? {} : { index }
    };
  }
};
var NUMERIC_FIELD_TYPES = /* @__PURE__ */ new Set(["f32", "f64", "i32", "u32", "i16", "u16", "i8", "u8", "enum"]);
function validateNumericFieldValues(component, raw, entity) {
  if (raw === void 0) return null;
  const fields = componentDefinition(component).fields;
  const rawValues = raw;
  for (const fieldName of Object.keys(rawValues)) {
    const reflection = fields[fieldName];
    if (reflection === void 0) continue;
    const value = rawValues[fieldName];
    if (NUMERIC_FIELD_TYPES.has(reflection.type)) {
      if (typeof value === "number" && Number.isNaN(value)) {
        return new ComponentNumericValueInvalidError(entity, component.name, fieldName, value);
      }
      continue;
    }
    if (reflection.arrayMeta === void 0 || !NUMERIC_FIELD_TYPES.has(reflection.arrayMeta.elementType)) {
      continue;
    }
    const length = Array.isArray(value) || ArrayBuffer.isView(value) ? value.length : void 0;
    if (length === void 0) continue;
    const values = value;
    for (let index = 0; index < length; index++) {
      const received = values[index];
      if (typeof received === "number" && Number.isNaN(received)) {
        return new ComponentNumericValueInvalidError(
          entity,
          component.name,
          fieldName,
          received,
          index
        );
      }
    }
  }
  return null;
}
var ManagedArrayInvalidValueError = class extends Error {
  name = "ManagedArrayInvalidValueError";
  code = "managed-array-invalid-value";
  expected = "an Array or TypedArray payload (or null/undefined to clear it)";
  hint;
  detail;
  constructor(componentName, fieldName, fieldType, actualValue) {
    const hint = `Set ${componentName}.${fieldName} to a plain array or TypedArray matching ${fieldType}; use null or undefined to clear the managed value.`;
    super(
      `${componentName}.${fieldName}: managed array received an invalid value.
  code: managed-array-invalid-value
  fieldType: ${fieldType}
  expected: an Array or TypedArray payload (or null/undefined to clear it)
  hint: ${hint}`
    );
    this.hint = hint;
    this.detail = { component: componentName, field: fieldName, fieldType, actualValue };
  }
};
function validateEnumFieldValues(component, raw, entity) {
  if (raw === void 0) return null;
  const fields = componentDefinition(component).fields;
  const rawValues = raw;
  for (const fieldName of Object.keys(rawValues)) {
    const reflection = fields[fieldName];
    if (reflection?.type !== "enum" || reflection.labels === void 0) continue;
    const value = rawValues[fieldName];
    const allowedValues = Object.values(reflection.labels);
    if (typeof value !== "number" || !Number.isInteger(value) || !allowedValues.includes(value)) {
      return new ComponentFieldInvalidValueError(
        entity,
        component.name,
        fieldName,
        value,
        reflection.labels
      );
    }
  }
  return null;
}

// src/world-internal.ts
var worldInternal = /* @__PURE__ */ Symbol.for(
  "forgeax.ecs.worldInternal"
);

// src/execution/shared-kernel.ts
var SHARED_KERNEL_EXECUTOR_RESOURCE_KEY = "SharedKernelExecutor";
var nextWorldIdentity = 1;
function createWorldIdentity() {
  const identity = `world-${nextWorldIdentity}`;
  nextWorldIdentity += 1;
  return identity;
}
function healthyWorldExecutionState(identity) {
  return Object.freeze({ identity, health: "healthy", fault: null });
}
function poisonedWorldExecutionState(identity, fault) {
  return Object.freeze({ identity, health: "poisoned", fault: Object.freeze(fault) });
}
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
var SparseStorageRequiresTagError = class extends Error {
  name = "SparseStorageRequiresTagError";
  code = "sparse-storage-requires-tag";
  expected = "sparse components have an empty schema and no relationship metadata";
  hint = "remove all fields and relationship metadata, or use storage: table";
  detail;
  constructor(componentName) {
    super(
      `Sparse component "${componentName}" must be a zero-field, non-relationship tag.
  component: ${componentName}
  hint: remove all fields and relationship metadata, or use storage: table`
    );
    this.detail = { componentName };
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
var ComponentAlreadyPresentError = class extends Error {
  name = "ComponentAlreadyPresentError";
  code = "component-already-present";
  hint;
  constructor(entityId, componentName) {
    const hint = "Entity already has this component. Use set() to update values.";
    super(
      `Entity ${entityId} already has component "${componentName}".
  entity: ${entityId}
  component: ${componentName}
  hint: ${hint}`
    );
    this.hint = hint;
  }
};
var ComponentNotPresentError = class extends Error {
  name = "ComponentNotPresentError";
  code = "component-not-present";
  hint;
  constructor(entityId, componentName) {
    const hint = "Entity does not have this component. Check with query or inspect().";
    super(
      `Entity ${entityId} does not have component "${componentName}".
  entity: ${entityId}
  component: ${componentName}
  hint: ${hint}`
    );
    this.hint = hint;
  }
};
var CyclicDependencyError = class extends Error {
  name = "CyclicDependencyError";
  code = "cyclic-dependency";
  expected = "the schedule dependency graph is acyclic";
  hint;
  /** Structured cycle path — programmatic consumers read this, not the message. */
  detail;
  constructor(cycle) {
    const cycleStr = cycle.join(" -> ");
    const hint = `Cycle path: ${cycleStr}. Remove one ordering constraint to break the cycle.`;
    super(`DAG Schedule has a cyclic dependency.
  cycle: ${cycleStr}
  hint: ${hint}`);
    this.hint = hint;
    this.detail = { code: "cyclic-dependency", cycle };
  }
};
var SystemSetNotRegisteredError = class extends Error {
  name = "SystemSetNotRegisteredError";
  code = "system-set-not-registered";
  /** The name carried by the rejected token. */
  expected;
  hint;
  /** Deterministic snapshot of the current World-local schedule for repair. */
  detail;
  constructor(name, registered) {
    const hint = `SystemSet "${name}" is not valid for the current World schedule. Pass a non-empty SystemSet token owned by this World schedule.`;
    const message = `SystemSet "${name}" is not registered.
  expected: ${name}
  registered: [${registered.join(", ")}]
  hint: ${hint}`;
    super(message);
    this.expected = name;
    this.hint = hint;
    this.detail = { code: "system-set-not-registered", name, registered };
  }
};
function systemSetNotRegistered(name, registered) {
  return new SystemSetNotRegisteredError(name, registered);
}
var ScheduleMutationError = class extends Error {
  name = "ScheduleMutationError";
  code;
  hint;
  detail;
  constructor(code, message, hint, detail = {}) {
    super(`${message}
  code: ${code}
  hint: ${hint}`);
    this.code = code;
    this.hint = hint;
    this.detail = detail;
  }
};
var ResourceNotFoundError = class extends Error {
  name = "ResourceNotFoundError";
  code = "resource-not-found";
  hint;
  constructor(key) {
    const hint = `Resource "${key}" not found. Insert with world.insertResource() first.`;
    super(`Resource "${key}" not found.
  key: ${key}
  hint: ${hint}`);
    this.hint = hint;
  }
};
var ChangeEpochExhaustedError = class extends Error {
  name = "ChangeEpochExhaustedError";
  code = "change-epoch-exhausted";
  expected = "mutationEpoch < Number.MAX_SAFE_INTEGER";
  hint = "Rebuild the World before performing another mutation.";
  detail;
  constructor(epoch) {
    super(`World mutation epoch is exhausted at ${epoch}.
  hint: Rebuild the World.`);
    this.detail = { epoch };
  }
};
var DerivedRangeOutOfBoundsError = class extends Error {
  name = "DerivedRangeOutOfBoundsError";
  code = "derived-range-out-of-bounds";
  expected = "a non-negative span-relative range with start + count <= span.length";
  hint = "check start and count against the QuerySpan length, then retry without changing World state";
  detail;
  constructor(start, count, spanLength) {
    super(`Derived range [${start}, ${start + count}) exceeds QuerySpan length ${spanLength}.`);
    this.detail = { start, count, spanLength };
  }
};
var ProtectedResourceError = class extends Error {
  name = "ProtectedResourceError";
  code = "resource-protected";
  hint;
  expected;
  constructor(resourceName2, operation) {
    const hint = operation === "insert" ? `"${resourceName2}" is a World-owned protected resource. It is advanced by world.update(delta); read it via world.getResource(${resourceName2}).` : `"${resourceName2}" is a World-owned protected resource. It is owned by the World scheduler and cannot be removed.`;
    const expected = `a user-owned resource key (not ${resourceName2})`;
    super(
      `Protected resource "${resourceName2}" cannot be ${operation}ed.
  code: resource-protected
  resource: ${resourceName2}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
  }
};
var UniqueRefReleasedError = class extends Error {
  name = "UniqueRefReleasedError";
  code = "unique-ref-released";
  hint;
  expected;
  detail;
  constructor(handle, target) {
    const hint = `Handle ${handle} (target ${target}) was released before this access. Re-acquire via the producing system or re-spawn the asset before reading.`;
    const expected = "live (refcount >= 1) managed handle";
    super(
      `UniqueRefStore: handle is already released.
  code: unique-ref-released
  handle: ${handle}
  target: ${target}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = { handle, target };
  }
};
var UniqueRefDoubleReleaseError = class extends Error {
  name = "UniqueRefDoubleReleaseError";
  code = "unique-ref-double-release";
  hint;
  expected;
  detail;
  constructor(handle, target) {
    const hint = `Handle ${handle} (target ${target}) was released twice. Only one of {despawn / removeComponent / set} should release a managed handle per lifecycle.`;
    const expected = "first release of a managed handle (refcount transition 1 -> 0)";
    super(
      `UniqueRefStore: double release on handle.
  code: unique-ref-double-release
  handle: ${handle}
  target: ${target}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = { handle, target };
  }
};
var SharedRefReleasedError = class extends Error {
  name = "SharedRefReleasedError";
  code = "shared-ref-released";
  hint;
  expected;
  detail;
  constructor(handle, target) {
    const hint = `Handle ${handle} (target ${target}) was released (refcount reached 0). Re-acquire via the producing system or re-spawn the asset before reading.`;
    const expected = "live (refcount >= 1) shared handle";
    super(
      `SharedRefStore: handle is already released.
  code: shared-ref-released
  handle: ${handle}
  target: ${target}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = { handle, target };
  }
};
var SharedRefDoubleReleaseError = class extends Error {
  name = "SharedRefDoubleReleaseError";
  code = "shared-ref-double-release";
  hint;
  expected;
  detail;
  constructor(handle, target, rc) {
    const hint = `Handle ${handle} (target ${target}) released with rc=${rc}. Each shared handle must have a matching alloc/retain for every release; audit the producer / consumer release pairs.`;
    const expected = "rc >= 1 before release";
    super(
      `SharedRefStore: double release on handle.
  code: shared-ref-double-release
  handle: ${handle}
  target: ${target}
  rc: ${rc}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = { handle, target, rc };
  }
};
var SharedRefPayloadInvalidError = class extends Error {
  name = "SharedRefPayloadInvalidError";
  code = "shared-ref-payload-invalid";
  expected = "a non-null, non-undefined shared payload";
  hint = "Allocate a concrete payload and let its owning effect dispose it.";
  detail;
  constructor(target, actual) {
    super(`SharedRefStore: ${actual} payload is not a valid shared reference for ${target}.`);
    this.detail = { target, actual };
  }
};
var BuiltinSlotNotOwnedError = class extends Error {
  name = "BuiltinSlotNotOwnedError";
  code = "builtin-slot-not-owned";
  hint;
  expected;
  detail;
  constructor(slot) {
    const hint = `Slot ${slot} is a builtin-tier handle (< BUILTIN_BASE). World.sharedRefs manages only user-tier handles (>= BUILTIN_BASE). Obtain the builtin payload from the package that authored the handle; builtin payloads are process-static and never reference-counted by this World.`;
    const expected = "user-tier slot (>= BUILTIN_BASE)";
    super(
      `SharedRefStore: builtin slot is not owned by this store.
  code: builtin-slot-not-owned
  slot: ${slot}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = { slot };
  }
};
var SharedRefStaleError = class extends Error {
  name = "SharedRefStaleError";
  code = "shared-ref-stale";
  hint;
  expected;
  detail;
  constructor(slot, expectedGeneration, actualGeneration) {
    const hint = `Handle for slot ${slot} is stale: expected generation ${expectedGeneration}, but the store has generation ${actualGeneration} (slot was released and re-allocated). Re-acquire the handle from AssetRegistry.`;
    const expected = `generation === ${actualGeneration} (current store generation)`;
    super(
      `SharedRefStore: stale handle.
  code: shared-ref-stale
  slot: ${slot}
  expectedGeneration: ${expectedGeneration}
  actualGeneration: ${actualGeneration}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = { slot, expectedGeneration, actualGeneration };
  }
};
var UniqueRefStaleError = class extends Error {
  name = "UniqueRefStaleError";
  code = "unique-ref-stale";
  hint;
  expected;
  detail;
  constructor(slot, expectedGeneration, actualGeneration) {
    const hint = `Handle for slot ${slot} is stale: expected generation ${expectedGeneration}, but the store has generation ${actualGeneration} (slot was released and re-allocated). Re-acquire the handle via the producing system or re-spawn the asset.`;
    const expected = `generation === ${actualGeneration} (current store generation)`;
    super(
      `UniqueRefStore: stale handle.
  code: unique-ref-stale
  slot: ${slot}
  expectedGeneration: ${expectedGeneration}
  actualGeneration: ${actualGeneration}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = { slot, expectedGeneration, actualGeneration };
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
var ManagedBufferShrinkNotSupportedError = class extends Error {
  name = "ManagedBufferShrinkNotSupportedError";
  code = "managed-buffer-shrink-not-supported";
  hint;
  expected;
  detail;
  constructor(requested, current) {
    const hint = `BufferPool only grows. Requested ${requested} bytes < current ${current}; allocate a fresh slot if a smaller buffer is required.`;
    const expected = `requested >= ${current}`;
    super(
      `BufferPool: shrink not supported.
  code: managed-buffer-shrink-not-supported
  requested: ${requested}
  current: ${current}
  expected: ${expected}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expected;
    this.detail = { requested, current };
  }
};
var FixedSizeMismatchError = class extends Error {
  name = "FixedSizeMismatchError";
  code = "fixed-size-mismatch";
  hint;
  expected;
  detail;
  constructor(fieldName, expected, actual) {
    const hint = `buffer<${expected}> set with byteLength ${actual} (expected ${expected}); resize your Uint8Array to exactly ${expected} bytes before world.set`;
    const expectedStr = `byteLength === ${expected}`;
    super(
      `buffer<N>: fixed-size mismatch.
  code: fixed-size-mismatch
  field: ${fieldName}
  expected: ${expected}
  actual: ${actual}
  hint: ${hint}`
    );
    this.hint = hint;
    this.expected = expectedStr;
    this.detail = { expected, actual };
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
var CommandFailedError = class extends Error {
  name = "CommandFailedError";
  code = "command-failed";
  expected = "all deferred commands pass preflight before commit";
  hint = "Inspect detail.cause, repair the command at detail.commandIndex, and run the World again.";
  cause;
  detail;
  constructor(systemName, schedule, commandIndex, commandKind, cause) {
    super(
      `Deferred command failed before commit in ${schedule}/${systemName} at command ${commandIndex} (${commandKind}).`
    );
    this.cause = cause;
    this.detail = { systemName, schedule, commandIndex, commandKind, cause };
  }
};
var SystemFailedError = class extends Error {
  name = "SystemFailedError";
  code = "system-failed";
  expected = "a system completes without throwing or returning a failed Result";
  hint = "Inspect detail.cause, stop using this poisoned World, and rebuild it from the owning App.";
  cause;
  detail;
  constructor(systemName, schedule, cause, lastCommittedCommand = null) {
    super(`System ${schedule}/${systemName} failed; World is poisoned.`);
    this.cause = cause;
    this.detail = { systemName, schedule, cause, lastCommittedCommand };
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
function fieldTypeToMetaKey(fieldType) {
  if (fieldType === "entity" || fieldType === "string" || fieldType === "buffer") {
    return fieldType;
  }
  if (fieldType.startsWith("unique<") && fieldType.endsWith(">")) return "ref";
  if (fieldType.startsWith("shared<") && fieldType.endsWith(">")) return "shared";
  if (fieldType.startsWith("buffer<") && fieldType.endsWith(">")) return "buffer";
  if (fieldType.startsWith("array<") && fieldType.endsWith(">")) return "array";
  if (TYPE_METADATA[fieldType] !== void 0) return fieldType;
  return null;
}
function isManagedField(fieldType) {
  return TYPE_METADATA[fieldTypeToMetaKey(fieldType) ?? ""]?.isManaged ?? false;
}
function isManagedBufferField(fieldType) {
  return TYPE_METADATA[fieldTypeToMetaKey(fieldType) ?? ""]?.isBuffer ?? false;
}
function isEntityField(fieldType) {
  return TYPE_METADATA[fieldTypeToMetaKey(fieldType) ?? ""]?.isEntityRef ?? false;
}
function isManagedArrayField(fieldType) {
  return TYPE_METADATA[fieldTypeToMetaKey(fieldType) ?? ""]?.isArray ?? false;
}
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
function bufferFieldByteLength(fieldType) {
  if (!fieldType.startsWith("buffer<") || !fieldType.endsWith(">")) return Number.NaN;
  const tail = fieldType.slice(7, -1);
  if (!/^[1-9]\d*$/.test(tail)) return Number.NaN;
  return Number.parseInt(tail, 10);
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
var entityDefinitionSeen = false;
var componentDefinedBeforeEntity = false;
function isComponentDefinitionOrderValid() {
  return !componentDefinedBeforeEntity;
}
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
  const storage = options?.storage ?? "table";
  assertComponentStorage(storage);
  if (storage === "sparse" && Object.keys(fields).length !== 0) {
    throw new SparseStorageRequiresTagError(name);
  }
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
  if (name === "Entity") {
    entityDefinitionSeen = true;
  } else if (!entityDefinitionSeen) {
    componentDefinedBeforeEntity = true;
  }
  const id = name === "Entity" ? 0 : ownerRegistry.nextId++;
  const frozenDefaults = Object.keys(collectedDefaults).length === 0 ? void 0 : deepFreeze(collectedDefaults);
  if (options?.meta !== void 0) {
    Object.assign(collectedMeta, options.meta);
  }
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
      transient: options?.transient ?? false,
      meta,
      requires: Object.freeze([...options?.requires ?? []])
    }
  });
  return Object.freeze(token);
}
var ComponentInUseError = class extends Error {
  name = "ComponentInUseError";
  code = "component-in-use";
  expected = "the component to have no live entity or scheduled-system references";
  hint = "Remove owning systems and component values before disposing the registration lease.";
  detail;
  constructor(componentName) {
    super(`Component ${componentName} is still in use.`);
    this.detail = { componentName };
  }
};
var ComponentNameConflictError = class extends Error {
  name = "ComponentNameConflictError";
  code = "component-name-conflict";
  expected = "one component token per name in a World";
  hint = "Use the token already registered in this World or choose a distinct component name.";
  detail;
  constructor(componentName) {
    super(`Component ${componentName} is already registered with a different token.`);
    this.detail = { componentName };
  }
};
var ComponentCatalog = class {
  constructor(inUse) {
    this.inUse = inUse;
  }
  inUse;
  registrations = /* @__PURE__ */ new Map();
  register(component) {
    const current = this.registrations.get(component.name);
    if (current !== void 0 && current.component !== component) {
      return err(new ComponentNameConflictError(component.name));
    }
    if (current === void 0) {
      this.registrations.set(component.name, { component, owners: 1 });
    } else {
      current.owners += 1;
    }
    let active = true;
    return ok({
      component,
      dispose: () => {
        if (!active) return ok(void 0);
        const registration = this.registrations.get(component.name);
        if (registration === void 0 || registration.component !== component) {
          active = false;
          return ok(void 0);
        }
        if (registration.owners > 1) {
          registration.owners -= 1;
          active = false;
          return ok(void 0);
        }
        if (this.inUse(component)) return err(new ComponentInUseError(component.name));
        this.registrations.delete(component.name);
        active = false;
        return ok(void 0);
      }
    });
  }
  resolve(name) {
    return this.registrations.get(name)?.component;
  }
  entries() {
    return new Map(
      [...this.registrations].map(([name, registration]) => [name, registration.component])
    );
  }
};

// src/entity.ts
var Entity = defineComponent("Entity", {
  // Layer-2 default is never observed: `world.spawn` always overwrites `self`
  // with the freshly encoded handle for the row. `null` is the type-correct
  // "no handle yet" placeholder (`'entity'` decodes to `EntityHandle | null`).
  self: { type: "entity", default: null }
});
var Disabled = defineComponent("Disabled", {});
var ESSENTIAL_COMPONENT_IDS = Object.freeze([
  componentId(Entity)
]);
function foldEssentials(ids) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const essential of ESSENTIAL_COMPONENT_IDS) {
    if (!seen.has(essential)) {
      seen.add(essential);
      out.push(essential);
    }
  }
  for (const id of ids) {
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}
function worldPlugin(world) {
  return {
    name: "world",
    provide: "world",
    apply(ctx) {
      ctx.provide("world", world);
    }
  };
}
async function createWorldContext(world, plugins = []) {
  const ctx = new Context();
  try {
    await ctx.plugin(worldPlugin(world));
    for (const plugin of plugins) await ctx.plugin(plugin);
    return ctx;
  } catch (error) {
    await ctx.fiber.dispose();
    throw error;
  }
}

// src/relationship-index.ts
var roles = /* @__PURE__ */ new WeakMap();
function defineRelationship(options) {
  const targetFields = {
    [options.targetField]: { type: "array<entity>", transient: true }
  };
  const target = defineComponent(options.targetName, targetFields);
  const sourceFields = { [options.sourceField]: { type: "entity" } };
  const source = defineComponent(
    options.sourceName,
    sourceFields,
    options.sourceRequires === void 0 ? void 0 : { requires: options.sourceRequires }
  );
  roles.set(source, {
    kind: "source",
    target,
    sourceField: options.sourceField,
    targetField: options.targetField,
    exclusive: options.exclusive ?? true,
    linkedSpawn: options.linkedSpawn ?? false,
    allowSelf: options.allowSelf ?? false
  });
  roles.set(target, {
    kind: "target",
    source,
    sourceField: options.sourceField,
    targetField: options.targetField
  });
  return { source, target };
}
function relationshipRole(component) {
  return roles.get(component);
}
function relationshipMirror(component) {
  const role = roles.get(component);
  return role?.kind === "source" ? role.target : void 0;
}
function relationshipSource(component) {
  const role = roles.get(component);
  return role?.kind === "target" ? role.source : void 0;
}
function isRelationshipTarget(component) {
  return roles.get(component)?.kind === "target";
}
var RelationshipIndex = class {
  slots = /* @__PURE__ */ new Map();
  epochValue = 0;
  get epoch() {
    return this.epochValue;
  }
  attach(source, target, slot) {
    this.slots.set(source, { target, slot });
    this.epochValue++;
    return slot;
  }
  detach(source) {
    if (!this.slots.delete(source)) return false;
    this.epochValue++;
    return true;
  }
  reparent(source, target, slot) {
    return this.attach(source, target, slot);
  }
  slotOf(source) {
    return this.slots.get(source)?.slot;
  }
  targetOf(source) {
    return this.slots.get(source)?.target;
  }
  /** Bind the source that swap-remove moved into `slot`. */
  updateSlot(source, target, slot) {
    const location = this.slots.get(source);
    if (location === void 0) return;
    location.target = target;
    location.slot = slot;
    this.epochValue++;
  }
  /** Cold recovery path only: rebuild from R source records. */
  recover(records) {
    this.slots.clear();
    const nextSlots = /* @__PURE__ */ new Map();
    for (const [source, target] of records) {
      const slot = nextSlots.get(target) ?? 0;
      nextSlots.set(target, slot + 1);
      this.attach(source, target, slot);
    }
    this.epochValue++;
  }
};

// src/schedule-token.ts
function createScheduleToken(name) {
  const registry = globalThis;
  const key = /* @__PURE__ */ Symbol.for(`forgeax.ecs.schedule-token.${name}`);
  const existing = registry[key];
  if (existing !== void 0) return existing;
  const token = Object.freeze({ name });
  Object.defineProperty(registry, key, {
    configurable: false,
    enumerable: false,
    value: token,
    writable: false
  });
  return token;
}
var Update = createScheduleToken("Update");
var FixedUpdate = createScheduleToken("FixedUpdate");
function isScheduleToken(value) {
  return value === Update || value === FixedUpdate;
}

// src/time.ts
var Time = Object.freeze({ name: "Time" });
var FixedTime = Object.freeze({ name: "FixedTime" });
var TIME_RESOURCE_KEY = Time.name;
var FIXED_TIME_RESOURCE_KEY = FixedTime.name;
var DEFAULT_TIME_POLICY = {
  fixedDeltaSeconds: 1 / 60,
  maxStepsPerUpdate: 4,
  maxDeltaSeconds: 0.1
};
function createTimeResource(policy) {
  return { delta: 0, elapsed: 0, maxDeltaSeconds: policy.maxDeltaSeconds };
}
function createFixedTimeResource(policy) {
  return {
    delta: policy.fixedDeltaSeconds,
    maxStepsPerUpdate: policy.maxStepsPerUpdate,
    tick: 0,
    overstep: 0,
    droppedSeconds: 0,
    droppedUpdates: 0
  };
}
function createWorldClock(policy) {
  const time = createTimeResource(policy);
  const fixed = createFixedTimeResource(policy);
  const timeView = Object.freeze({
    get delta() {
      return time.delta;
    },
    get elapsed() {
      return time.elapsed;
    },
    get maxDeltaSeconds() {
      return time.maxDeltaSeconds;
    }
  });
  const fixedView = Object.freeze({
    get delta() {
      return fixed.delta;
    },
    get maxStepsPerUpdate() {
      return fixed.maxStepsPerUpdate;
    },
    get tick() {
      return fixed.tick;
    },
    get overstep() {
      return fixed.overstep;
    },
    get droppedSeconds() {
      return fixed.droppedSeconds;
    },
    get droppedUpdates() {
      return fixed.droppedUpdates;
    }
  });
  return {
    time: timeView,
    fixed: fixedView,
    writer: { time, fixed }
  };
}
var ENTITY_MAX_INDEX = MAX_SLOT;
var ENTITY_MAX_GENERATION = MAX_GEN;
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
function entityGeneration(entity) {
  return unpackGen(entity);
}

// src/storage/archetype.ts
var INITIAL_CAPACITY = 64;
function archetypeKey(componentIds) {
  return [...foldEssentials(componentIds)].sort((a, b) => a - b).join("+");
}
function createArchetype(components, id, tableId) {
  const byId = /* @__PURE__ */ new Map();
  for (const component of components) byId.set(componentId(component), component);
  const sorted = [...byId.values()].sort((a, b) => componentId(a) - componentId(b));
  return {
    id,
    key: archetypeKey(sorted.map((component) => componentId(component))),
    components: sorted,
    tableId,
    rows: new Uint32Array(INITIAL_CAPACITY),
    size: 0,
    capacity: INITIAL_CAPACITY,
    addEdges: /* @__PURE__ */ new Map(),
    removeEdges: /* @__PURE__ */ new Map()
  };
}
function appendArchetypeRow(archetype, tableRow2) {
  if (archetype.size === archetype.capacity) growArchetype(archetype, archetype.capacity * 2);
  const row = archetype.size;
  archetype.rows[row] = tableRow2;
  archetype.size = row + 1;
  return row;
}
function removeArchetypeRow(archetype, row) {
  const lastRow = archetype.size - 1;
  if (row === lastRow) {
    archetype.size = lastRow;
    return null;
  }
  const movedTableRow = archetype.rows[lastRow] ?? 0;
  archetype.rows[row] = movedTableRow;
  archetype.size = lastRow;
  return { movedTableRow, newRow: row };
}
function growArchetype(archetype, targetCapacity) {
  let capacity = archetype.capacity;
  while (capacity < targetCapacity) capacity *= 2;
  if (capacity === archetype.capacity) return;
  const rows = new Uint32Array(capacity);
  rows.set(archetype.rows);
  archetype.rows = rows;
  archetype.capacity = capacity;
}

// src/storage/column.ts
function arrayCountColumnName(fieldName) {
  return `${fieldName}:count`;
}
function createFieldView(Ctor, buffer) {
  return new Ctor(buffer);
}
function isSharedBuffer(buffer) {
  return typeof SharedArrayBuffer !== "undefined" && buffer instanceof SharedArrayBuffer;
}
function createColumn(fieldType, capacity, arity = 1, shared = false) {
  const meta = TYPE_METADATA[fieldType];
  if (!meta) throw new Error(`Missing TYPE_METADATA entry for scalar field type ${fieldType}`);
  const bytesPerElement = (
    // biome-ignore lint/style/noNonNullAssertion: ScalarFieldType rows always carry a byteSize
    meta.byteSize
  );
  const buffer = shared ? new SharedArrayBuffer(bytesPerElement * capacity * arity) : new ArrayBuffer(bytesPerElement * capacity * arity);
  const Ctor = meta.viewCtor;
  const view = createFieldView(Ctor, buffer);
  return { buffer, view, capacity, fieldType, arity };
}
var HAS_TRANSFER = typeof ArrayBuffer.prototype.transfer === "function";
function growColumn(col, newCapacity) {
  const meta = TYPE_METADATA[col.fieldType];
  if (!meta) throw new Error(`Missing TYPE_METADATA entry for scalar field type ${col.fieldType}`);
  const bytesPerElement = (
    // biome-ignore lint/style/noNonNullAssertion: ScalarFieldType rows always carry a byteSize
    meta.byteSize
  );
  const newByteLength = bytesPerElement * newCapacity * col.arity;
  const Ctor = meta.viewCtor;
  let buffer;
  if (isSharedBuffer(col.buffer)) {
    buffer = new SharedArrayBuffer(newByteLength);
    new Uint8Array(buffer).set(new Uint8Array(col.buffer));
  } else if (HAS_TRANSFER) {
    buffer = col.buffer.transfer(
      newByteLength
    );
  } else {
    buffer = new ArrayBuffer(newByteLength);
    new Uint8Array(buffer).set(new Uint8Array(col.buffer));
  }
  const view = createFieldView(Ctor, buffer);
  return { buffer, view, capacity: newCapacity, fieldType: col.fieldType, arity: col.arity };
}
function normalizeBufferWrite(raw) {
  if (raw instanceof Uint8Array) {
    return raw;
  }
  if (ArrayBuffer.isView(raw)) {
    return new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
  }
  if (raw instanceof ArrayBuffer) {
    return new Uint8Array(raw);
  }
  if (typeof SharedArrayBuffer !== "undefined" && raw instanceof SharedArrayBuffer) {
    return new Uint8Array(raw);
  }
  return null;
}

// src/storage/table.ts
var INITIAL_CAPACITY2 = 64;
function tableKey(componentIds) {
  return [...foldEssentials(componentIds)].sort((a, b) => a - b).join("+");
}
function canonicalComponents(components) {
  const byId = /* @__PURE__ */ new Map();
  byId.set(componentId(Entity), Entity);
  for (const component of components) byId.set(componentId(component), component);
  return [...byId.values()].sort((a, b) => componentId(a) - componentId(b));
}
function createTable(components, id, shared = false, activeDirectories = [/* @__PURE__ */ new Set()]) {
  const sortedComponents = canonicalComponents(components);
  const capacity = INITIAL_CAPACITY2;
  const storage = /* @__PURE__ */ new Map();
  for (const component of sortedComponents) {
    const fields = /* @__PURE__ */ new Map();
    for (const [fieldName, fieldType] of Object.entries(componentSchema(component))) {
      const arrayMeta = parseManagedArraySchema(fieldType);
      if (arrayMeta !== null && arrayMeta.length !== void 0) {
        const metaKey2 = fieldTypeToMetaKey(arrayMeta.elementType);
        const scalarType2 = metaKey2 === null ? null : TYPE_METADATA[metaKey2]?.storage ?? null;
        if (scalarType2 !== null) {
          fields.set(fieldName, createColumn(scalarType2, capacity, arrayMeta.length, shared));
        }
        continue;
      }
      if (isManagedBufferField(fieldType) && fieldType !== "buffer") {
        fields.set(
          fieldName,
          createColumn("u8", capacity, bufferFieldByteLength(fieldType), shared)
        );
        continue;
      }
      const metaKey = fieldTypeToMetaKey(fieldType);
      const scalarType = metaKey === null ? null : TYPE_METADATA[metaKey]?.storage ?? null;
      if (scalarType === null) continue;
      fields.set(fieldName, createColumn(scalarType, capacity, 1, shared));
      if (arrayMeta !== null && arrayMeta.length === void 0) {
        fields.set(arrayCountColumnName(fieldName), createColumn("u32", capacity, 1, shared));
      }
    }
    storage.set(componentId(component), {
      component,
      fields,
      epochs: createComponentEpochColumns(capacity)
    });
  }
  return {
    id,
    key: tableKey(sortedComponents.map((component) => componentId(component))),
    components: sortedComponents,
    storage,
    size: 0,
    capacity,
    version: 0,
    membership: new Float64Array(Math.ceil(capacity / PROJECTION_BLOCK_SIZE)),
    activeDirectories
  };
}
function appendTableRow(table, entity, epoch = 0) {
  if (table.size === table.capacity) growTable(table, table.capacity * 2);
  const row = table.size;
  const self = table.storage.get(componentId(Entity))?.fields.get("self");
  if (self !== void 0) self.view[row] = entity;
  table.size = row + 1;
  if (row === 0) for (const directory of table.activeDirectories) directory.add(table);
  markTableMembership(table, row, epoch);
  return row;
}
function removeTableRow(table, row, epoch = 0) {
  const lastRow = table.size - 1;
  markTableMembership(table, row, epoch);
  markTableMembership(table, lastRow, epoch);
  if (lastRow === 0) for (const directory of table.activeDirectories) directory.delete(table);
  if (row === lastRow) {
    table.size = lastRow;
    return null;
  }
  const movedEntity = table.storage.get(componentId(Entity))?.fields.get("self")?.view[lastRow] ?? 0;
  for (const componentStorage of table.storage.values()) {
    for (const column of componentStorage.fields.values()) {
      const arity = column.arity;
      column.view.set(column.view.subarray(lastRow * arity, lastRow * arity + arity), row * arity);
    }
    copyComponentEpoch(componentStorage.epochs, lastRow, componentStorage.epochs, row);
  }
  table.size = lastRow;
  return { movedEntity, newRow: row };
}
function growTable(table, targetCapacity) {
  let capacity = table.capacity;
  while (capacity < targetCapacity) capacity *= 2;
  if (capacity === table.capacity) return;
  for (const componentStorage of table.storage.values()) {
    const fields = /* @__PURE__ */ new Map();
    for (const [fieldName, column] of componentStorage.fields) {
      fields.set(fieldName, growColumn(column, capacity));
    }
    componentStorage.fields = fields;
    componentStorage.epochs = growComponentEpochColumns(componentStorage.epochs, capacity);
  }
  const membership = new Float64Array(Math.ceil(capacity / PROJECTION_BLOCK_SIZE));
  membership.set(table.membership);
  table.membership = membership;
  table.capacity = capacity;
  table.version += 1;
}
function markTableMembership(table, row, epoch) {
  table.membership[Math.floor(row / PROJECTION_BLOCK_SIZE)] = epoch;
}

// src/storage/archetype-graph.ts
function createArchetypeGraph(shared = false) {
  return {
    archetypes: [],
    dedupByKey: /* @__PURE__ */ new Map(),
    generation: 0,
    tables: [],
    activeTables: /* @__PURE__ */ new Set(),
    activeTablesByComponent: /* @__PURE__ */ new Map(),
    tableDedupByKey: /* @__PURE__ */ new Map(),
    tableGeneration: 0,
    sparseTags: /* @__PURE__ */ new Map(),
    shared
  };
}
function getTable(graph, id) {
  const table = graph.tables[id];
  if (table === void 0) throw new Error(`Table ${id} does not exist.`);
  return table;
}
function getOrCreateTable(graph, components) {
  const tableComponents = canonicalComponents(
    components.filter((component) => component.storage === "table")
  );
  const key = tableKey(tableComponents.map((component) => componentId(component)));
  const existingId = graph.tableDedupByKey.get(key);
  if (existingId !== void 0) return getTable(graph, existingId);
  const directories = [graph.activeTables];
  for (const component of tableComponents) {
    const id = componentId(component);
    let directory = graph.activeTablesByComponent.get(id);
    if (directory === void 0) {
      directory = /* @__PURE__ */ new Set();
      graph.activeTablesByComponent.set(id, directory);
    }
    directories.push(directory);
  }
  const table = createTable(tableComponents, graph.tables.length, graph.shared, directories);
  graph.tables.push(table);
  graph.tableDedupByKey.set(key, table.id);
  graph.tableGeneration += 1;
  return table;
}
function getOrCreateSparseTagSet(graph, component) {
  const current = graph.sparseTags.get(componentId(component));
  if (current !== void 0) return current;
  const set = createSparseTagSet(component);
  graph.sparseTags.set(componentId(component), set);
  return set;
}
function getOrCreateArchetype(graph, componentIds, components) {
  const key = archetypeKey(componentIds);
  const existingId = graph.dedupByKey.get(key);
  if (existingId !== void 0) {
    return graph.archetypes[existingId];
  }
  const fullComponents = canonicalComponents(components);
  const table = getOrCreateTable(graph, fullComponents);
  const archId = graph.archetypes.length;
  const arch = createArchetype(fullComponents, archId, table.id);
  graph.archetypes.push(arch);
  graph.dedupByKey.set(key, archId);
  graph.generation += 1;
  return arch;
}
function getAddEdge(graph, src, componentId2, component) {
  const cached = src.addEdges.get(componentId2);
  if (cached !== void 0) {
    const target2 = graph.archetypes[cached];
    if (target2) {
      return target2;
    }
  }
  const newIds = [...src.components.map((c) => componentId(c)), componentId2];
  const newComponents = [...src.components, component];
  const target = getOrCreateArchetype(graph, newIds, newComponents);
  src.addEdges.set(componentId2, target.id);
  return target;
}
function getRemoveEdge(graph, src, componentId2) {
  const cached = src.removeEdges.get(componentId2);
  if (cached !== void 0) {
    const target2 = graph.archetypes[cached];
    if (target2) {
      return target2;
    }
  }
  const newIds = src.components.map((c) => componentId(c)).filter((id) => id !== componentId2);
  const newComponents = src.components.filter((c) => componentId(c) !== componentId2);
  const target = getOrCreateArchetype(graph, newIds, newComponents);
  src.removeEdges.set(componentId2, target.id);
  return target;
}

// src/storage/change-detection.ts
var PROJECTION_BLOCK_SIZE = 256;
var INITIAL_SPARSE_CAPACITY = 64;
function createComponentEpochColumns(capacity) {
  return {
    added: new Float64Array(capacity),
    changed: new Float64Array(capacity),
    blocks: new Float64Array(Math.ceil(capacity / PROJECTION_BLOCK_SIZE))
  };
}
function growComponentEpochColumns(columns, capacity) {
  const added = new Float64Array(capacity);
  const changed = new Float64Array(capacity);
  added.set(columns.added);
  changed.set(columns.changed);
  const blocks = new Float64Array(Math.ceil(capacity / PROJECTION_BLOCK_SIZE));
  blocks.set(columns.blocks);
  return { added, changed, blocks };
}
function copyComponentEpoch(source, sourceRow, target, targetRow) {
  target.added[targetRow] = source.added[sourceRow] ?? 0;
  target.changed[targetRow] = source.changed[sourceRow] ?? 0;
  const block = Math.floor(targetRow / PROJECTION_BLOCK_SIZE);
  target.blocks[block] = Math.max(target.blocks[block] ?? 0, target.changed[targetRow] ?? 0);
}
function createSparseTagSet(component) {
  const sparse = new Int32Array(INITIAL_SPARSE_CAPACITY);
  sparse.fill(-1);
  return {
    component,
    sparse,
    dense: new Uint32Array(INITIAL_SPARSE_CAPACITY),
    added: new Float64Array(INITIAL_SPARSE_CAPACITY),
    changed: new Float64Array(INITIAL_SPARSE_CAPACITY),
    size: 0
  };
}
function sparseTagIndex(set, entity) {
  const denseIndex = set.sparse[entityIndex(entity)] ?? -1;
  return denseIndex >= 0 && set.dense[denseIndex] === entity ? denseIndex : -1;
}
function insertSparseTag(set, entity, epoch) {
  const present = sparseTagIndex(set, entity);
  if (present >= 0) {
    set.changed[present] = epoch;
    return present;
  }
  growSparseSlots(set, entityIndex(entity) + 1);
  if (set.size === set.dense.length) growSparseDense(set, set.size + 1);
  const denseIndex = set.size;
  set.dense[denseIndex] = entity;
  set.added[denseIndex] = epoch;
  set.changed[denseIndex] = epoch;
  set.sparse[entityIndex(entity)] = denseIndex;
  set.size += 1;
  return denseIndex;
}
function removeSparseTag(set, entity) {
  const denseIndex = sparseTagIndex(set, entity);
  if (denseIndex < 0) return false;
  const lastIndex = set.size - 1;
  set.sparse[entityIndex(entity)] = -1;
  if (denseIndex !== lastIndex) {
    const movedEntity = set.dense[lastIndex];
    set.dense[denseIndex] = movedEntity;
    set.added[denseIndex] = set.added[lastIndex] ?? 0;
    set.changed[denseIndex] = set.changed[lastIndex] ?? 0;
    set.sparse[entityIndex(movedEntity)] = denseIndex;
  }
  set.size = lastIndex;
  return true;
}
function growSparseSlots(set, targetCapacity) {
  if (targetCapacity <= set.sparse.length) return;
  let capacity = set.sparse.length;
  while (capacity < targetCapacity) capacity *= 2;
  const sparse = new Int32Array(capacity);
  sparse.fill(-1);
  sparse.set(set.sparse);
  set.sparse = sparse;
}
function growSparseDense(set, targetCapacity) {
  let capacity = set.dense.length;
  while (capacity < targetCapacity) capacity *= 2;
  const dense = new Uint32Array(capacity);
  dense.set(set.dense);
  set.dense = dense;
  const added = new Float64Array(capacity);
  added.set(set.added);
  set.added = added;
  const changed = new Float64Array(capacity);
  changed.set(set.changed);
  set.changed = changed;
}
function readComponentChange(graph, location, entity, componentId2) {
  const sparseSet = graph.sparseTags.get(componentId2);
  if (sparseSet !== void 0) {
    const denseIndex = sparseTagIndex(sparseSet, entity);
    if (denseIndex < 0) return void 0;
    return {
      added: sparseSet.added[denseIndex] ?? 0,
      changed: sparseSet.changed[denseIndex] ?? 0
    };
  }
  const archetype = graph.archetypes[location.archetypeId];
  if (archetype === void 0) return void 0;
  const epochs = graph.tables[archetype.tableId]?.storage.get(componentId2)?.epochs;
  if (epochs === void 0) return void 0;
  const tableRow2 = archetype.rows[location.archetypeRow] ?? -1;
  return {
    added: epochs.added[tableRow2] ?? 0,
    changed: epochs.changed[tableRow2] ?? 0
  };
}
function markComponentsAdded(graph, location, entity, componentIds, epoch) {
  const archetype = graph.archetypes[location.archetypeId];
  const table = archetype === void 0 ? void 0 : graph.tables[archetype.tableId];
  const tableRow2 = archetype?.rows[location.archetypeRow] ?? -1;
  for (const componentId2 of componentIds) {
    const component = archetype?.components.find(
      (candidate) => componentId(candidate) === componentId2
    );
    if (component?.storage === "sparse") {
      insertSparseTag(getOrCreateSparseTagSet(graph, component), entity, epoch);
      continue;
    }
    const epochs = table?.storage.get(componentId2)?.epochs;
    if (epochs === void 0) continue;
    epochs.added[tableRow2] = epoch;
    publishComponentRange(epochs, tableRow2, 1, epoch);
  }
}
function markComponentChanged(graph, location, entity, componentId2, epoch) {
  const sparseSet = graph.sparseTags.get(componentId2);
  if (sparseSet !== void 0) {
    const denseIndex = sparseTagIndex(sparseSet, entity);
    if (denseIndex >= 0) sparseSet.changed[denseIndex] = epoch();
    return;
  }
  const archetype = graph.archetypes[location.archetypeId];
  if (archetype === void 0) return;
  const epochs = graph.tables[archetype.tableId]?.storage.get(componentId2)?.epochs;
  if (epochs === void 0) return;
  const tableRow2 = archetype.rows[location.archetypeRow] ?? -1;
  publishComponentRange(epochs, tableRow2, 1, epoch());
}
function publishComponentRange(columns, start, count, epoch) {
  if (count === 0) return;
  if (count === 1) {
    columns.changed[start] = epoch;
    columns.blocks[Math.floor(start / PROJECTION_BLOCK_SIZE)] = epoch;
    return;
  }
  columns.changed.fill(epoch, start, start + count);
  columns.blocks.fill(
    epoch,
    Math.floor(start / PROJECTION_BLOCK_SIZE),
    Math.ceil((start + count) / PROJECTION_BLOCK_SIZE)
  );
}
var SIZE_CLASSES = Object.freeze([
  16,
  64,
  256,
  1024,
  4096,
  16384,
  65536,
  262144
]);
var HAS_TRANSFER2 = typeof ArrayBuffer.prototype.transfer === "function";
function bucketIndex(byteLength) {
  if (byteLength === 0) return -1;
  for (let i = 0; i < SIZE_CLASSES.length; i++) {
    const b = SIZE_CLASSES[i];
    if (b !== void 0 && byteLength <= b) return i;
  }
  return SIZE_CLASSES.length;
}
var BufferPool = class {
  slots = /* @__PURE__ */ new Map();
  /**
   * Per-bucket free-lists: `freeBuckets[i]` is a LIFO stack of slot ids
   * whose backing buffer is parked on bucket `i`. Released slots stay on
   * their original bucket's free-list - v1 never moves a slot between
   * buckets on release (D-7 no trim).
   */
  freeBuckets = SIZE_CLASSES.map(() => []);
  nextId = 1;
  /**
   * Allocate a managed buffer slot of at least `byteLength` bytes.
   *
   * Routes:
   *   - invalid byteLength -> structured out-of-bounds error.
   *   - byteLength == 0 -> ok({ id, view: zero-length Uint8Array }) (no bucket).
   *   - byteLength <= 262144 -> ok({ id, view }), bucket = smallest >= byteLength.
   *   - byteLength > 262144 -> a dedicated allocation; allocation failure is structured.
   *
   * D-5: size classes are radix-4 (16 / 64 / 256 / 1K / 4K / 16K / 64K / 256K).
   * Free-list pop reuses the most recently released slot id at the same bucket;
   * miss falls through to a fresh allocation.
   */
  alloc(byteLength) {
    if (byteLength === 0) {
      const id2 = this.nextId++;
      const buffer2 = new ArrayBuffer(0);
      const view2 = new Uint8Array(buffer2);
      this.slots.set(id2, { sizeClassIdx: -1, buffer: buffer2, view: view2, byteLength: 0, live: true });
      return ok({ id: id2, view: view2 });
    }
    if (!Number.isSafeInteger(byteLength) || byteLength < 0) {
      return err(new ManagedBufferOutOfBoundsError(byteLength, 0));
    }
    const idx = bucketIndex(byteLength);
    if (idx === SIZE_CLASSES.length) {
      try {
        const buffer2 = new ArrayBuffer(byteLength);
        const view2 = new Uint8Array(buffer2);
        const id2 = this.nextId++;
        this.slots.set(id2, { sizeClassIdx: idx, buffer: buffer2, view: view2, byteLength, live: true });
        return ok({ id: id2, view: view2 });
      } catch {
        return err(new ManagedBufferOutOfBoundsError(byteLength, 0));
      }
    }
    const bucketBytes = SIZE_CLASSES[idx];
    if (bucketBytes === void 0) {
      return err(new ManagedBufferOutOfBoundsError(byteLength, 0));
    }
    const free = this.freeBuckets[idx];
    if (free !== void 0 && free.length > 0) {
      const id2 = free.pop();
      const slot = this.slots.get(id2);
      if (slot === void 0) {
        return err(new ManagedBufferOutOfBoundsError(byteLength, 0));
      }
      slot.byteLength = byteLength;
      slot.view = new Uint8Array(slot.buffer, 0, byteLength);
      slot.live = true;
      new Uint8Array(slot.buffer).fill(0);
      return ok({ id: id2, view: slot.view });
    }
    const id = this.nextId++;
    const buffer = new ArrayBuffer(bucketBytes);
    const view = new Uint8Array(buffer, 0, byteLength);
    this.slots.set(id, {
      sizeClassIdx: idx,
      buffer,
      view,
      byteLength,
      live: true
    });
    return ok({ id, view });
  }
  /**
   * Grow slot `id` to `newBytes`. Returns the post-grow Uint8Array view.
   *
   * Routes (D-6 / D-7):
   *   - newBytes < current  -> err(managed-buffer-shrink-not-supported).
   *   - newBytes == current -> ok(current view) (no-op, identity preserved).
   *   - newBytes > current && same bucket -> ok(re-sliced view) (no transfer).
   *   - newBytes > current && cross bucket -> ok(new view) backed by a fresh
   *     bucket buffer; the prior ArrayBuffer is detached via transfer (ES2024)
   *     or replaced via allocate-and-copy fallback. Old `view`s captured by
   *     the caller become detached / orphaned - callers must use `pool.view(id)`
   *     after grow to read the refreshed view (the `release` loop refreshes
   *     automatically).
   *   - newBytes beyond the last pooled class -> dedicated allocation.
   */
  grow(id, newBytes) {
    const slot = this.slots.get(id);
    if (slot === void 0) {
      return err(new ManagedBufferOutOfBoundsError(newBytes, 0));
    }
    if (newBytes < slot.byteLength) {
      return err(new ManagedBufferShrinkNotSupportedError(newBytes, slot.byteLength));
    }
    if (newBytes === slot.byteLength) {
      return ok(slot.view);
    }
    if (!Number.isSafeInteger(newBytes) || newBytes < 0) {
      return err(new ManagedBufferOutOfBoundsError(newBytes, slot.buffer.byteLength));
    }
    const newIdx = bucketIndex(newBytes);
    if (newBytes <= slot.buffer.byteLength) {
      slot.byteLength = newBytes;
      slot.view = new Uint8Array(slot.buffer, 0, newBytes);
      return ok(slot.view);
    }
    const newBucketBytes = SIZE_CLASSES[newIdx] ?? Math.max(newBytes, slot.buffer.byteLength * 2);
    const oldByteLength = slot.byteLength;
    let nextBuffer;
    try {
      if (HAS_TRANSFER2) {
        nextBuffer = slot.buffer.transfer(newBucketBytes);
      } else {
        nextBuffer = new ArrayBuffer(newBucketBytes);
        new Uint8Array(nextBuffer).set(new Uint8Array(slot.buffer, 0, oldByteLength));
      }
    } catch {
      return err(new ManagedBufferOutOfBoundsError(newBytes, slot.buffer.byteLength));
    }
    slot.sizeClassIdx = newIdx;
    slot.buffer = nextBuffer;
    slot.byteLength = newBytes;
    slot.view = new Uint8Array(nextBuffer, 0, newBytes);
    return ok(slot.view);
  }
  /**
   * Release slot `id` back to its bucket's free-list. Releasing an unknown id
   * is a no-op - World's release loop drives this and idempotency keeps the
   * despawn chain free of bookkeeping noise. Bucket free-lists are NEVER
   * trimmed in v1 (D-7 no trim).
   */
  release(id) {
    const slot = this.slots.get(id);
    if (slot === void 0) return ok(void 0);
    if (!slot.live) return ok(void 0);
    slot.live = false;
    if (slot.sizeClassIdx >= 0 && slot.sizeClassIdx < SIZE_CLASSES.length) {
      const bucket = this.freeBuckets[slot.sizeClassIdx];
      if (bucket !== void 0) bucket.push(id);
    } else {
      this.slots.delete(id);
    }
    return ok(void 0);
  }
  /**
   * Return the live view for slot `id`. Used by World after `grow` to
   * refresh the column's stored view reference. Returns a zero-length view
   * for unknown / released ids so callers never crash on use-after-release.
   */
  view(id) {
    const slot = this.slots.get(id);
    if (slot === void 0 || !slot.live) return new Uint8Array(0);
    return slot.view;
  }
  /**
   * Return the bucket-rounded byte capacity for slot `id` --- i.e.
   * `SIZE_CLASSES[slot.sizeClassIdx]`. Used by managed-buffer view callers
   * (D-4 no-cache: re-queried per accessor). Returns `0` for the zero-length
   * (`alloc(0)`) slot; returns `0` for unknown / released ids (mirrors
   * `view(id)` use-after-release semantics).
   */
  byteCapacity(id) {
    const slot = this.slots.get(id);
    if (slot === void 0 || !slot.live) return 0;
    if (slot.sizeClassIdx < 0) return 0;
    return slot.buffer.byteLength;
  }
  /**
   * Reset the logical byteLength of slot `id` to `newByteLength` while
   * keeping the same bucket allocation (no transfer, no release). Only
   * legal when `newByteLength <= bucketBytes`; the slot's bucket index
   * does not move (D-7 v1 forbids cross-bucket shrink). Used by managed-
   * buffer clear paths so the slot retains its `byteCapacity` while the
   * live view becomes zero-length. Bytes past the new logical length are
   * zero-filled defensively.
   *
   * Returns `err(ManagedBufferShrinkNotSupportedError)` when called on a
   * `sizeClassIdx === -1` slot (alloc(0)) with `newByteLength > 0`, or
   * when `newByteLength` exceeds the bucket capacity.
   */
  setLogicalLength(id, newByteLength) {
    const slot = this.slots.get(id);
    if (slot === void 0) {
      return err(new ManagedBufferOutOfBoundsError(newByteLength, 0));
    }
    if (slot.sizeClassIdx < 0) {
      if (newByteLength === 0) {
        slot.byteLength = 0;
        slot.view = new Uint8Array(slot.buffer);
        return ok(slot.view);
      }
      return err(new ManagedBufferOutOfBoundsError(newByteLength, 0));
    }
    const bucketBytes = slot.buffer.byteLength;
    if (newByteLength > bucketBytes) {
      return err(new ManagedBufferOutOfBoundsError(newByteLength, bucketBytes));
    }
    if (newByteLength < slot.byteLength) {
      new Uint8Array(slot.buffer, newByteLength, slot.byteLength - newByteLength).fill(0);
    }
    slot.byteLength = newByteLength;
    slot.view = new Uint8Array(slot.buffer, 0, newByteLength);
    return ok(slot.view);
  }
  /** @internal Diagnostic count of live slots. Exposed for tests + inspector. */
  _liveCount() {
    let n = 0;
    for (const s of this.slots.values()) if (s.live) n += 1;
    return n;
  }
};

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
function validateComponentDataKeys(token, raw) {
  if (raw === void 0) return null;
  const schema = componentSchema(token);
  const rawObj = raw;
  for (const fieldName of Object.keys(rawObj)) {
    if (!(fieldName in schema)) {
      return new SpawnDataUnknownFieldError(token.name, fieldName, Object.keys(schema));
    }
  }
  return null;
}

// src/component-value-validate.ts
function isNumericHandle(v) {
  return typeof v === "number";
}
function isSharedScalarType(fieldType) {
  return fieldType.startsWith("shared<") && fieldType.endsWith(">");
}
function isSharedArrayType(fieldType) {
  if (!fieldType.startsWith("array<") || !fieldType.endsWith(">")) return false;
  const inner = fieldType.slice(6, -1);
  const head = inner.indexOf(",") === -1 ? inner : inner.slice(0, inner.indexOf(",")).trim();
  return head.startsWith("shared<") && head.endsWith(">");
}
function isArrayPayload(value) {
  if (Array.isArray(value)) return true;
  return ArrayBuffer.isView(value) && typeof value.length === "number";
}
function validateManagedArrayValues(token, raw) {
  if (raw === void 0) return null;
  const fields = componentDefinition(token).fields;
  const rawObj = raw;
  for (const fieldName of Object.keys(rawObj)) {
    const reflection = fields[fieldName];
    if (reflection?.arrayMeta === void 0) continue;
    const value = rawObj[fieldName];
    if (value === 0) continue;
    if (value === void 0 || value === null || isArrayPayload(value)) continue;
    return new ManagedArrayInvalidValueError(token.name, fieldName, reflection.type, value);
  }
  return null;
}
function validateSharedFieldValues(token, raw) {
  if (raw === void 0) return null;
  const schema = componentSchema(token);
  const rawObj = raw;
  for (const fieldName of Object.keys(rawObj)) {
    const fieldType = schema[fieldName];
    if (fieldType === void 0) continue;
    const value = rawObj[fieldName];
    if (value === void 0 || value === null) continue;
    if (isSharedScalarType(fieldType)) {
      if (!isNumericHandle(value)) {
        return new SharedFieldInvalidValueError(token.name, fieldName, fieldType, value);
      }
    } else if (isSharedArrayType(fieldType)) {
      if (!Array.isArray(value)) continue;
      for (let i = 0; i < value.length; i++) {
        const el = value[i];
        if (el === void 0 || el === null) continue;
        if (!isNumericHandle(el)) {
          return new SharedFieldInvalidValueError(token.name, fieldName, fieldType, el, i);
        }
      }
    }
  }
  return null;
}

// src/internal.ts
var DERIVED_WRITER = /* @__PURE__ */ Symbol.for(
  "forgeax.ecs.query.derivedWriter"
);
function createDerivedRangeWriter(world, component, source) {
  let boundEpoch = -1;
  let bindingTables = [];
  let bindings = [];
  let bindingByTable = /* @__PURE__ */ new Map();
  let runStartBuffers = [];
  let runCountBuffers = [];
  const rebind = () => {
    const tables = source.tables();
    const nextBindings = [];
    const nextRunStartBuffers = [];
    const nextRunCountBuffers = [];
    for (const table of tables) {
      nextBindings.push({
        tableId: table.id,
        entities: table.storage.get(componentId(Entity))?.fields.get("self")?.view ?? new Uint32Array(0),
        read: buildWholeColumnShape(table, source.readComponents),
        write: buildWholeColumnShape(table, source.writeComponents),
        rowCapacity: table.size
      });
      const runCapacity = Math.max(1, table.size);
      nextRunStartBuffers.push(new Int32Array(runCapacity));
      nextRunCountBuffers.push(new Int32Array(runCapacity));
    }
    bindingTables = tables;
    bindings = nextBindings;
    bindingByTable = /* @__PURE__ */ new Map();
    for (let index = 0; index < nextBindings.length; index += 1) {
      const binding = nextBindings[index];
      if (binding !== void 0) bindingByTable.set(binding.tableId, index);
    }
    runStartBuffers = nextRunStartBuffers;
    runCountBuffers = nextRunCountBuffers;
    boundEpoch = source.structureEpoch();
  };
  rebind();
  const writer = {
    get bindings() {
      if (boundEpoch !== source.structureEpoch()) rebind();
      return bindings;
    },
    locateEntity(entity, cursor) {
      if (world.execution.health === "poisoned") return false;
      if (boundEpoch !== source.structureEpoch()) rebind();
      const archetype = world[worldInternal].getEntityArchetype(entity);
      if (archetype === void 0) return false;
      const bindingIndex = bindingByTable.get(archetype.tableId);
      if (bindingIndex === void 0) return false;
      const record = world[worldInternal].getRecords()[entity & 16777215];
      if (record === void 0 || record.archetypeId !== archetype.id) return false;
      const row = archetype.rows[record.archetypeRow];
      const binding = bindings[bindingIndex];
      if (binding === void 0 || row === void 0 || row < 0 || row >= binding.rowCapacity) {
        return false;
      }
      cursor.bindingIndex = bindingIndex;
      cursor.row = row;
      return true;
    },
    publishChangedRows(bindingIndex, changed) {
      if (world.execution.health === "poisoned") {
        return err(new WorldPoisonedError(world.identity, world.execution.fault));
      }
      if (boundEpoch !== source.structureEpoch()) rebind();
      const binding = bindings[bindingIndex];
      const table = bindingTables[bindingIndex];
      const runStarts = runStartBuffers[bindingIndex];
      const runCounts = runCountBuffers[bindingIndex];
      if (binding === void 0 || table === void 0 || runStarts === void 0 || runCounts === void 0 || !Number.isSafeInteger(bindingIndex) || bindingIndex < 0 || changed.length < binding.rowCapacity || table.storage.get(componentId(component)) === void 0) {
        return err(new DerivedRangeOutOfBoundsError(0, changed.length, binding?.rowCapacity ?? 0));
      }
      let runCount = 0;
      let runStart = -1;
      for (let row = 0; row < binding.rowCapacity; row += 1) {
        if ((changed[row] ?? 0) !== 0) {
          if (runStart < 0) runStart = row;
        } else if (runStart >= 0) {
          runStarts[runCount] = runStart;
          runCounts[runCount] = row - runStart;
          runCount += 1;
          runStart = -1;
        }
      }
      if (runStart >= 0) {
        runStarts[runCount] = runStart;
        runCounts[runCount] = binding.rowCapacity - runStart;
        runCount += 1;
      }
      if (runCount === 0) return ok(void 0);
      const previousEpoch = world[worldInternal].getMutationEpoch();
      let epoch;
      try {
        epoch = world[worldInternal].nextMutationEpoch();
        const componentIdentifier = componentId(component);
        for (let index = 0; index < runCount; index += 1) {
          world[worldInternal].publishDerivedRange(
            table,
            componentIdentifier,
            runStarts[index] ?? 0,
            runCounts[index] ?? 0,
            epoch
          );
        }
        changed.fill(0, 0, binding.rowCapacity);
        return ok(void 0);
      } catch (cause) {
        world[worldInternal].restoreMutationEpoch(previousEpoch);
        world[worldInternal].poisonExecution({
          code: "shared-kernel-failed",
          kernelName: `derived-range:${component.name}:publish`,
          cause,
          partialWrite: true,
          retryable: false
        });
        return err(new SharedKernelFailureError(component.name, world.identity, cause, true));
      }
    },
    writeRange(bindingIndex, base, start, count, kernel, context) {
      if (world.execution.health === "poisoned") {
        return err(new WorldPoisonedError(world.identity, world.execution.fault));
      }
      if (boundEpoch !== source.structureEpoch()) rebind();
      const binding = bindings[bindingIndex];
      const table = bindingTables[bindingIndex];
      if (binding === void 0 || table === void 0 || !Number.isSafeInteger(bindingIndex) || !Number.isSafeInteger(base) || !Number.isSafeInteger(start) || !Number.isSafeInteger(count) || bindingIndex < 0 || base < 0 || start < 0 || count < 0 || base + start + count > binding.rowCapacity || table.storage.get(componentId(component)) === void 0) {
        return err(new DerivedRangeOutOfBoundsError(start, count, binding?.rowCapacity ?? 0));
      }
      if (count === 0) return ok(void 0);
      const previousEpoch = world[worldInternal].getMutationEpoch();
      let epoch;
      try {
        epoch = world[worldInternal].nextMutationEpoch();
      } catch (cause) {
        return err(cause);
      }
      try {
        kernel(binding, base, start, count, context);
        world[worldInternal].publishDerivedRange(
          table,
          componentId(component),
          base + start,
          count,
          epoch
        );
        return ok(void 0);
      } catch (cause) {
        world[worldInternal].restoreMutationEpoch(previousEpoch);
        world[worldInternal].poisonExecution({
          code: "shared-kernel-failed",
          kernelName: `derived-range:${component.name}`,
          cause,
          partialWrite: true,
          retryable: false
        });
        return err(new SharedKernelFailureError(component.name, world.identity, cause, true));
      }
    },
    probeAndCommitRange(bindingIndex, base, start, count, probe, commit, context) {
      if (world.execution.health === "poisoned") {
        return err(new WorldPoisonedError(world.identity, world.execution.fault));
      }
      if (boundEpoch !== source.structureEpoch()) rebind();
      const binding = bindings[bindingIndex];
      const table = bindingTables[bindingIndex];
      const runStarts = runStartBuffers[bindingIndex];
      const runCounts = runCountBuffers[bindingIndex];
      if (binding === void 0 || table === void 0 || runStarts === void 0 || runCounts === void 0 || !Number.isSafeInteger(bindingIndex) || !Number.isSafeInteger(base) || !Number.isSafeInteger(start) || !Number.isSafeInteger(count) || bindingIndex < 0 || base < 0 || start < 0 || count < 0 || base + start + count > binding.rowCapacity || table.storage.get(componentId(component)) === void 0) {
        return err(new DerivedRangeOutOfBoundsError(start, count, binding?.rowCapacity ?? 0));
      }
      if (count === 0) return ok(void 0);
      const previousEpoch = world[worldInternal].getMutationEpoch();
      let runCount = 0;
      let epoch = 0;
      let epochReserved = false;
      let runStart = -1;
      try {
        for (let offset = 0; offset < count; offset += 1) {
          const row = base + start + offset;
          const changed = probe(binding, row, context);
          if (changed) {
            if (!epochReserved) {
              try {
                epoch = world[worldInternal].nextMutationEpoch();
                epochReserved = true;
              } catch (cause) {
                return err(cause);
              }
            }
            if (runStart < 0) runStart = row;
            commit(binding, row, context);
          } else if (runStart >= 0) {
            runStarts[runCount] = runStart;
            runCounts[runCount] = row - runStart;
            runCount += 1;
            runStart = -1;
          }
        }
        if (runStart >= 0) {
          runStarts[runCount] = runStart;
          runCounts[runCount] = base + start + count - runStart;
          runCount += 1;
        }
        if (runCount > 0) {
          const componentIdentifier = componentId(component);
          for (let index = 0; index < runCount; index += 1) {
            const runStartValue = runStarts[index] ?? 0;
            const runLength = runCounts[index] ?? 0;
            world[worldInternal].publishDerivedRange(
              table,
              componentIdentifier,
              runStartValue,
              runLength,
              epoch
            );
          }
        }
        return ok(void 0);
      } catch (cause) {
        if (epochReserved) world[worldInternal].restoreMutationEpoch(previousEpoch);
        world[worldInternal].poisonExecution({
          code: "shared-kernel-failed",
          kernelName: `derived-range:${component.name}:probe`,
          cause,
          partialWrite: true,
          retryable: false
        });
        return err(new SharedKernelFailureError(component.name, world.identity, cause, true));
      }
    }
  };
  return writer;
}
function buildWholeColumnShape(table, components) {
  const shape = {};
  for (const component of components) {
    const fields = table.storage.get(componentId(component))?.fields;
    if (fields === void 0) continue;
    for (const [fieldName, column] of fields) shape[fieldName] = column.view;
  }
  return shape;
}

// src/query/query.ts
function compileDescriptor(descriptor) {
  const read = descriptor.read ?? [];
  const write = descriptor.write ?? [];
  const optional = descriptor.optional ?? [];
  const withComponents = descriptor.with ?? [];
  const withoutComponents = [...descriptor.without ?? []];
  const roles2 = /* @__PURE__ */ new Map();
  const addRole = (component, role) => {
    const current = roles2.get(component);
    if (current === void 0) roles2.set(component, [role]);
    else current.push(role);
  };
  for (const component of read) addRole(component, "read");
  for (const component of write) addRole(component, "write");
  for (const component of optional) addRole(component, "optional");
  for (const component of withComponents) addRole(component, "with");
  for (const component of withoutComponents) addRole(component, "without");
  for (const [component, componentRoles] of roles2) {
    if (componentRoles.length > 1) {
      return err(new QueryDescriptorConflictError(component.name, componentRoles));
    }
  }
  for (const component of [...read, ...write, ...optional]) {
    if (Object.keys(componentSchema(component)).length === 0) {
      return err(new QueryDataRequiresFieldsError(component.name));
    }
  }
  const required = [
    ...read,
    ...write,
    ...withComponents,
    ...descriptor.changed ?? [],
    ...descriptor.added ?? []
  ];
  const requiredIds = [...new Set(required.map((component) => componentId(component)))];
  const withoutIds = [...new Set(withoutComponents.map((component) => componentId(component)))];
  if (!requiredIds.includes(componentId(Disabled)) && !withoutIds.includes(componentId(Disabled))) {
    withoutIds.push(componentId(Disabled));
  }
  return ok({
    descriptor,
    requiredIds,
    withoutIds,
    changedIds: [...new Set((descriptor.changed ?? []).map((component) => componentId(component)))],
    addedIds: [...new Set((descriptor.added ?? []).map((component) => componentId(component)))],
    sparseRoute: [
      ...required,
      ...withoutComponents,
      ...descriptor.changed ?? [],
      ...descriptor.added ?? []
    ].some((component) => component.storage === "sparse")
  });
}
var QueryRowFacade = class _QueryRowFacade {
  constructor(world) {
    this.world = world;
  }
  world;
  entity = 0;
  archetype;
  bind(entity, archetype) {
    this.entity = entity;
    this.archetype = archetype;
    return this;
  }
  snapshot() {
    if (this.archetype === void 0) throw new Error("Query row is not bound.");
    return new _QueryRowFacade(this.world).bind(this.entity, this.archetype);
  }
  has(component) {
    const id = componentId(component);
    return this.archetype?.components.some((candidate) => componentId(candidate) === id) === true;
  }
  get(component) {
    if (!this.has(component)) {
      return void 0;
    }
    const result = this.world[worldInternal].getQueryRow(this.entity, component);
    if (!result.ok) throw result.error;
    return result.value;
  }
  mut(component) {
    const current = this.get(component);
    if (current === void 0) throw new Error(`Query row lacks ${component.name}.`);
    if (isRelationshipTarget(component)) {
      throw new RelationshipTargetReadonlyError(component.name, "query row");
    }
    const relationshipSource2 = relationshipRole(component)?.kind === "source";
    if (!relationshipSource2) {
      this.world[worldInternal].markComponentChanged(this.entity, componentId(component));
    }
    return new Proxy(current, {
      set: (target, property, value) => {
        if (typeof property !== "string") return false;
        const result = this.world[worldInternal].setQueryRow(this.entity, component, {
          [property]: value
        });
        if (!result.ok) throw result.error;
        target[property] = value;
        return true;
      }
    });
  }
};
var QuerySpanFacade = class {
  constructor(world, table, rowStart, length) {
    this.world = world;
    this.table = table;
    this.rowStart = rowStart;
    this.length = length;
    const entityColumn = table.storage.get(componentId(Entity))?.fields.get("self");
    this.entities = entityColumn === void 0 ? new Uint32Array(0) : rowStart === 0 && length === entityColumn.view.length ? entityColumn.view : entityColumn.view.subarray(rowStart, rowStart + length);
  }
  world;
  table;
  rowStart;
  length;
  entities;
  get(component) {
    return buildColumnShape(
      this.table,
      component,
      this.rowStart,
      this.length
    );
  }
  mut(component) {
    if (relationshipRole(component) !== void 0) {
      throw new RelationshipTargetReadonlyError(component.name, "query span");
    }
    this.world[worldInternal].markComponentRangeChanged(
      this.table,
      componentId(component),
      this.rowStart,
      this.length
    );
    return buildColumnShape(
      this.table,
      component,
      this.rowStart,
      this.length
    );
  }
};
function makeManagedColumnReader(view, length, fieldType) {
  const slots = view.length === length ? view : view.subarray(0, length);
  return Object.freeze({
    length,
    get(i) {
      return slots[i] ?? 0;
    },
    __managed: fieldType
  });
}
function buildColumnShape(table, component, rowStart, rowCount) {
  const shape = {};
  const fields = table.storage.get(componentId(component))?.fields;
  if (fields === void 0) return shape;
  for (const [fieldName, column] of fields) {
    const start = rowStart * column.arity;
    const end = start + rowCount * column.arity;
    const view = start === 0 && end === column.view.length ? column.view : column.view.subarray(start, end);
    const fieldType = componentSchema(component)[fieldName];
    shape[fieldName] = fieldType !== void 0 && isManagedField(fieldType) ? makeManagedColumnReader(view, view.length, fieldType) : view;
  }
  return shape;
}
var ExecutableQuery = class {
  constructor(world, compiled) {
    this.world = world;
    this.compiled = compiled;
  }
  world;
  compiled;
  matchedArchetypes = [];
  matchedTables = [];
  matchedTableObjects = [];
  lastGraphGeneration = -1;
  lastObservedEpoch = 0;
  active = false;
  [Symbol.iterator]() {
    this.beginIteration();
    this.refreshMatches();
    const structureEpoch = this.world[worldInternal].getStructureEpoch();
    const upperBound = this.world[worldInternal].getMutationEpoch();
    const row = new QueryRowFacade(this.world);
    const unchanged = this.hasUnchangedInput();
    let archetypeIndex = unchanged ? this.matchedArchetypes.length : 0;
    let tableIndex = unchanged ? this.matchedTables.length : 0;
    let rowIndex = 0;
    let finished = false;
    const close = (commit) => {
      if (finished) return;
      finished = true;
      this.active = false;
      if (commit) this.lastObservedEpoch = upperBound;
    };
    return {
      next: () => {
        if (finished) return { done: true, value: void 0 };
        if (this.world[worldInternal].getStructureEpoch() !== structureEpoch) {
          close(false);
          throw new QueryIterationInvalidatedError(
            structureEpoch,
            this.world[worldInternal].getStructureEpoch()
          );
        }
        if (!this.compiled.sparseRoute) {
          while (tableIndex < this.matchedTables.length) {
            const table = this.world[worldInternal].getGraph().tables[this.matchedTables[tableIndex] ?? -1];
            if (table === void 0 || rowIndex >= table.size) {
              tableIndex += 1;
              rowIndex = 0;
              continue;
            }
            const currentTableRow = rowIndex++;
            const entityColumn = table.storage.get(componentId(Entity))?.fields.get("self");
            if (entityColumn === void 0) continue;
            const entity = entityColumn.view[currentTableRow] ?? 0;
            if (!this.changeMatches(entity, table, currentTableRow, upperBound)) continue;
            const recordArchetype = this.world[worldInternal].getEntityArchetype(entity);
            if (recordArchetype === void 0) continue;
            return { done: false, value: row.bind(entity, recordArchetype) };
          }
          close(true);
          return { done: true, value: void 0 };
        }
        while (archetypeIndex < this.matchedArchetypes.length) {
          const archetype = this.world[worldInternal].getGraph().archetypes[this.matchedArchetypes[archetypeIndex] ?? -1];
          if (archetype === void 0 || rowIndex >= archetype.size) {
            archetypeIndex += 1;
            rowIndex = 0;
            continue;
          }
          const currentArchetypeRow = rowIndex++;
          const currentTableRow = archetype.rows[currentArchetypeRow] ?? 0;
          const table = this.world[worldInternal].getGraph().tables[archetype.tableId];
          if (table === void 0) continue;
          const entityColumn = table.storage.get(componentId(Entity))?.fields.get("self");
          if (entityColumn === void 0) continue;
          const entity = entityColumn.view[currentTableRow] ?? 0;
          if (!this.changeMatches(entity, table, currentTableRow, upperBound)) continue;
          return { done: false, value: row.bind(entity, archetype) };
        }
        close(true);
        return { done: true, value: void 0 };
      },
      return: () => {
        close(false);
        return { done: true, value: void 0 };
      }
    };
  }
  at(entity) {
    const archetype = this.world[worldInternal].getEntityArchetype(entity);
    if (archetype === void 0 || !this.archetypeMatches(archetype)) return void 0;
    return new QueryRowFacade(this.world).bind(entity, archetype);
  }
  spans() {
    const reason = this.spanUnavailableReason();
    if (reason !== void 0) return err(new QuerySpanUnavailableError(reason));
    const query = this;
    return ok({
      [Symbol.iterator]() {
        query.beginIteration();
        query.refreshMatches();
        const structureEpoch = query.world[worldInternal].getStructureEpoch();
        const upperBound = query.world[worldInternal].getMutationEpoch();
        const filterIds = [...query.compiled.changedIds, ...query.compiled.addedIds];
        let tableIndex = query.hasUnchangedInput() ? query.matchedTables.length : 0;
        let rowIndex = 0;
        let finished = false;
        const close = (commit) => {
          if (finished) return;
          finished = true;
          query.active = false;
          if (commit) query.lastObservedEpoch = upperBound;
        };
        return {
          next() {
            if (finished) return { done: true, value: void 0 };
            if (query.world[worldInternal].getStructureEpoch() !== structureEpoch) {
              close(false);
              throw new QueryIterationInvalidatedError(
                structureEpoch,
                query.world[worldInternal].getStructureEpoch()
              );
            }
            while (tableIndex < query.matchedTables.length) {
              const table = query.world[worldInternal].getGraph().tables[query.matchedTables[tableIndex] ?? -1];
              if (table === void 0 || table.size === 0) {
                tableIndex += 1;
                rowIndex = 0;
                continue;
              }
              if (query.compiled.changedIds.length === 0 && query.compiled.addedIds.length === 0) {
                tableIndex += 1;
                rowIndex = 0;
                return {
                  done: false,
                  value: new QuerySpanFacade(query.world, table, 0, table.size)
                };
              }
              while (rowIndex < table.size && !query.denseChangeMatches(table, rowIndex, upperBound)) {
                const block = Math.floor(rowIndex / PROJECTION_BLOCK_SIZE);
                const unchanged = filterIds.some(
                  (id) => (table.storage.get(id)?.epochs.blocks[block] ?? 0) <= query.lastObservedEpoch
                );
                rowIndex = unchanged ? (block + 1) * PROJECTION_BLOCK_SIZE : rowIndex + 1;
              }
              if (rowIndex >= table.size) {
                tableIndex += 1;
                rowIndex = 0;
                continue;
              }
              const start = rowIndex;
              rowIndex += 1;
              while (rowIndex < table.size && query.denseChangeMatches(table, rowIndex, upperBound)) {
                rowIndex += 1;
              }
              return {
                done: false,
                value: new QuerySpanFacade(query.world, table, start, rowIndex - start)
              };
            }
            close(true);
            return { done: true, value: void 0 };
          },
          return() {
            close(false);
            return { done: true, value: void 0 };
          }
        };
      }
    });
  }
  [DERIVED_WRITER](component) {
    const reason = this.spanUnavailableReason();
    if (reason !== void 0) return err(new QuerySpanUnavailableError(reason));
    return ok(
      createDerivedRangeWriter(
        this.world,
        component,
        {
          structureEpoch: () => this.world[worldInternal].getStructureEpoch(),
          tables: () => {
            this.refreshMatches();
            return this.matchedTableObjects;
          },
          readComponents: this.compiled.descriptor.read ?? [],
          writeComponents: this.compiled.descriptor.write ?? []
        }
      )
    );
  }
  combinations(k = 2) {
    const query = this;
    return {
      *[Symbol.iterator]() {
        if (!Number.isInteger(k) || k < 1) return;
        const previousObservedEpoch = query.lastObservedEpoch;
        const structureEpoch = query.world[worldInternal].getStructureEpoch();
        const rows = [];
        for (const row of query) {
          rows.push(row.snapshot());
        }
        query.active = true;
        let completed = false;
        try {
          if (k <= rows.length) {
            const indices = Array.from({ length: k }, (_, index) => index);
            while (true) {
              if (query.world[worldInternal].getStructureEpoch() !== structureEpoch) {
                throw new QueryIterationInvalidatedError(
                  structureEpoch,
                  query.world[worldInternal].getStructureEpoch()
                );
              }
              yield indices.map((index) => rows[index]);
              let pivot = k - 1;
              while (pivot >= 0 && (indices[pivot] ?? 0) === rows.length - k + pivot) pivot -= 1;
              if (pivot < 0) break;
              indices[pivot] = (indices[pivot] ?? 0) + 1;
              for (let index = pivot + 1; index < k; index++) {
                indices[index] = (indices[index - 1] ?? 0) + 1;
              }
            }
          }
          completed = true;
        } finally {
          query.active = false;
          if (!completed) query.lastObservedEpoch = previousObservedEpoch;
        }
      }
    };
  }
  hasUnchangedInput() {
    const epochs = this.world[worldInternal].getComponentMutationEpochs();
    return this.compiled.changedIds.some((id) => (epochs[id] ?? 0) <= this.lastObservedEpoch);
  }
  beginIteration() {
    if (this.active) throw new QueryIterationActiveError();
    this.active = true;
  }
  refreshMatches() {
    const graph = this.world[worldInternal].getGraph();
    if (this.lastGraphGeneration === graph.generation) return;
    this.matchedArchetypes = graph.archetypes.filter((archetype) => this.archetypeMatches(archetype)).map((archetype) => archetype.id);
    this.matchedTables = graph.tables.filter((table) => this.tableMatches(table)).map((table) => table.id);
    this.matchedTableObjects = this.matchedTables.flatMap((id) => {
      const table = graph.tables[id];
      return table === void 0 ? [] : [table];
    });
    this.lastGraphGeneration = graph.generation;
  }
  archetypeMatches(archetype) {
    for (const requiredId of this.compiled.requiredIds) {
      if (!archetype.components.some((component) => componentId(component) === requiredId))
        return false;
    }
    for (const excludedId of this.compiled.withoutIds) {
      if (archetype.components.some((component) => componentId(component) === excludedId))
        return false;
    }
    return true;
  }
  tableMatches(table) {
    for (const componentId2 of this.compiled.requiredIds) {
      if (!table.storage.has(componentId2)) return false;
    }
    for (const componentId2 of this.compiled.withoutIds) {
      if (table.storage.has(componentId2)) return false;
    }
    return true;
  }
  changeMatches(entity, table, row, upperBound) {
    const graph = this.world[worldInternal].getGraph();
    for (const componentId2 of this.compiled.changedIds) {
      const sparseSet = graph.sparseTags.get(componentId2);
      const denseIndex = sparseSet === void 0 ? -1 : sparseTagIndex(sparseSet, entity);
      const epoch = denseIndex >= 0 ? sparseSet?.changed[denseIndex] ?? 0 : table.storage.get(componentId2)?.epochs.changed[row] ?? 0;
      if (epoch <= this.lastObservedEpoch || epoch > upperBound) return false;
    }
    for (const componentId2 of this.compiled.addedIds) {
      const sparseSet = graph.sparseTags.get(componentId2);
      const denseIndex = sparseSet === void 0 ? -1 : sparseTagIndex(sparseSet, entity);
      const epoch = denseIndex >= 0 ? sparseSet?.added[denseIndex] ?? 0 : table.storage.get(componentId2)?.epochs.added[row] ?? 0;
      if (epoch <= this.lastObservedEpoch || epoch > upperBound) return false;
    }
    return true;
  }
  denseChangeMatches(table, row, upperBound) {
    for (const componentId2 of this.compiled.changedIds) {
      const epoch = table.storage.get(componentId2)?.epochs.changed[row] ?? 0;
      if (epoch <= this.lastObservedEpoch || epoch > upperBound) return false;
    }
    for (const componentId2 of this.compiled.addedIds) {
      const epoch = table.storage.get(componentId2)?.epochs.added[row] ?? 0;
      if (epoch <= this.lastObservedEpoch || epoch > upperBound) return false;
    }
    return true;
  }
  spanUnavailableReason() {
    if (this.compiled.sparseRoute) return "sparse-component";
    if ((this.compiled.descriptor.optional?.length ?? 0) > 0) return "optional-data";
    if ((this.compiled.descriptor.write ?? []).some((component) => relationshipRole(component))) {
      return "relationship-component";
    }
    return void 0;
  }
};
function createQuery(world, descriptor) {
  const compiled = compileDescriptor(descriptor);
  if (!compiled.ok) return compiled;
  return ok(new ExecutableQuery(world, compiled.value));
}

// src/resource.ts
function createResourceStore() {
  return { entries: /* @__PURE__ */ new Map() };
}
function insertResource(store, key, value, epoch = 0) {
  const current = store.entries.get(key);
  if (current === void 0) {
    store.entries.set(key, { value, added: epoch, changed: epoch });
  } else {
    current.value = value;
    current.changed = epoch;
  }
}
function getResource(store, key) {
  const entry = store.entries.get(key);
  if (entry === void 0) {
    throw new ResourceNotFoundError(key);
  }
  return entry.value;
}
function hasResource(store, key) {
  return store.entries.has(key);
}
function removeResource(store, key) {
  return store.entries.delete(key);
}

// src/commands.ts
function createCommandBuffer(world, context = {}) {
  const queue = [];
  const pendingEntities = /* @__PURE__ */ new Set();
  let status = "open";
  let queueError = null;
  const ensureOpen = () => {
    if (status !== "open") throw new Error(`CommandBuffer is ${status}`);
  };
  const recordQueueError = (index, kind, cause) => {
    if (queueError === null) queueError = { index, kind, cause };
  };
  const buffer = {
    _queue: queue,
    _pendingEntities: pendingEntities,
    _systemName: context.systemName ?? "<unknown-system>",
    _scheduleName: context.scheduleName ?? "<unknown-schedule>",
    get status() {
      return status;
    },
    get _queueError() {
      return queueError;
    },
    _setStatus(next) {
      if (status === "open") status = next;
    },
    commit() {
      ensureOpen();
      status = "committed";
      queue.length = 0;
      pendingEntities.clear();
      queueError = null;
    },
    abort() {
      if (status !== "open") return;
      for (const raw of pendingEntities) {
        world[worldInternal].cancelPendingEntity(raw);
      }
      status = "aborted";
      queue.length = 0;
      pendingEntities.clear();
      queueError = null;
    },
    spawn(...componentDatas) {
      ensureOpen();
      for (const cd of componentDatas) {
        const keyErr = validateComponentDataKeys(cd.component, cd.data);
        if (keyErr !== null) recordQueueError(queue.length, "spawn", keyErr);
      }
      const entity = world[worldInternal].allocatePendingEntity();
      pendingEntities.add(entity);
      queue.push({ type: "spawn", componentDatas, entity });
      return entity;
    },
    despawn(entity) {
      ensureOpen();
      queue.push({ type: "despawn", entity });
    },
    addComponent(entity, componentData) {
      ensureOpen();
      const keyErr = validateComponentDataKeys(
        componentData.component,
        componentData.data
      );
      if (keyErr !== null) recordQueueError(queue.length, "addComponent", keyErr);
      queue.push({ type: "addComponent", entity, componentData });
    },
    removeComponent(entity, component) {
      ensureOpen();
      queue.push({ type: "removeComponent", entity, component });
    },
    isDeferred(entity) {
      return pendingEntities.has(entity);
    }
  };
  return buffer;
}
function commandFailure(buffer, index, kind, cause) {
  return new CommandFailedError(buffer._systemName, buffer._scheduleName, index, kind, cause);
}
function relationshipTarget(component, data) {
  const role = relationshipRole(component);
  if (role?.kind !== "source") return null;
  const raw = data[role.sourceField];
  if (raw === null || raw === void 0 || raw === ENTITY_NULL_RAW) return null;
  return raw;
}
function overlayTarget(overlay, entity, component) {
  return overlay.get(entity)?.get(componentId(component));
}
function setOverlayTarget(overlay, entity, component, target) {
  let entries = overlay.get(entity);
  if (entries === void 0) {
    entries = /* @__PURE__ */ new Map();
    overlay.set(entity, entries);
  }
  entries.set(componentId(component), target);
}
function relationshipCycle(world, holder, component, target, overlay) {
  if (target === null) return void 0;
  const role = relationshipRole(component);
  const allowSelf = role?.kind === "source" && role.allowSelf;
  if (holder === target && !allowSelf) {
    return new RelationshipSelfCycleError(component.name, holder, target);
  }
  const visited = /* @__PURE__ */ new Set();
  let current = target;
  while (current !== null) {
    const raw = current;
    if (raw === holder && !(holder === target && allowSelf)) {
      return new RelationshipSelfCycleError(component.name, holder, raw);
    }
    if (visited.has(raw)) return void 0;
    visited.add(raw);
    const staged = overlayTarget(overlay, current, component);
    if (staged !== void 0 || overlay.get(raw)?.has(componentId(component)) === true) {
      current = staged ?? null;
      continue;
    }
    const row = world[worldInternal].getQueryRow(current, component);
    if (!row.ok) return void 0;
    current = relationshipTarget(component, row.value);
  }
  return void 0;
}
function preflightCommands(buffer, world) {
  if (buffer._queueError !== null) {
    const { index, kind, cause } = buffer._queueError;
    throw commandFailure(buffer, index, kind, cause);
  }
  const shadows = /* @__PURE__ */ new Map();
  const relationshipOverlay = /* @__PURE__ */ new Map();
  const unavailableEntities = /* @__PURE__ */ new Set();
  const availablePendingEntities = /* @__PURE__ */ new Set();
  const shadowFor = (entity) => {
    const raw = entity;
    const current = shadows.get(raw);
    if (current !== void 0) return current;
    const shadow = {
      components: /* @__PURE__ */ new Set(),
      added: /* @__PURE__ */ new Set(),
      removed: /* @__PURE__ */ new Set(),
      dead: false,
      pending: false
    };
    shadows.set(raw, shadow);
    return shadow;
  };
  const validateData = (holder, componentData) => {
    const result = world[worldInternal].preflightComponentData(
      holder,
      componentData,
      availablePendingEntities,
      unavailableEntities
    );
    return result.ok ? void 0 : result.error;
  };
  const liveError = (entity, operation, component) => {
    const result = world[worldInternal].lookupAlive(entity, operation, component?.name);
    return result.ok ? void 0 : result.error;
  };
  for (const [index, command] of buffer._queue.entries()) {
    switch (command.type) {
      case "spawn": {
        const raw = command.entity;
        const shadow = shadowFor(command.entity);
        shadow.pending = true;
        availablePendingEntities.add(raw);
        for (const componentData of command.componentDatas) {
          const dataError = validateData(command.entity, componentData);
          if (dataError !== void 0) throw commandFailure(buffer, index, command.type, dataError);
          if (shadow.components.has(componentId(componentData.component))) {
            throw commandFailure(
              buffer,
              index,
              command.type,
              new ComponentAlreadyPresentError(raw, componentData.component.name)
            );
          }
          shadow.components.add(componentId(componentData.component));
          const role = relationshipRole(componentData.component);
          if (role?.kind === "source") {
            const filled = fillComponentDefaults(
              componentData.component,
              componentData.data
            );
            const target = relationshipTarget(componentData.component, filled);
            setOverlayTarget(relationshipOverlay, command.entity, componentData.component, target);
            const cycle = relationshipCycle(
              world,
              command.entity,
              componentData.component,
              target,
              relationshipOverlay
            );
            if (cycle !== void 0) throw commandFailure(buffer, index, command.type, cycle);
          }
        }
        break;
      }
      case "despawn": {
        const shadow = shadowFor(command.entity);
        if (!shadow.pending && !world.hasComponent(command.entity, Entity)) {
          shadow.dead = true;
          unavailableEntities.add(command.entity);
          availablePendingEntities.delete(command.entity);
          break;
        }
        shadow.dead = true;
        unavailableEntities.add(command.entity);
        availablePendingEntities.delete(command.entity);
        break;
      }
      case "addComponent": {
        const raw = command.entity;
        const shadow = shadowFor(command.entity);
        const dataError = validateData(command.entity, command.componentData);
        if (dataError !== void 0) throw commandFailure(buffer, index, command.type, dataError);
        if (!shadow.pending) {
          const stale = liveError(
            command.entity,
            "command.addComponent",
            command.componentData.component
          );
          if (stale !== void 0) throw commandFailure(buffer, index, command.type, stale);
        }
        const role = relationshipRole(command.componentData.component);
        const present = shadow.pending ? shadow.components.has(componentId(command.componentData.component)) : shadow.removed.has(componentId(command.componentData.component)) ? false : shadow.added.has(componentId(command.componentData.component)) || world.hasComponent(command.entity, command.componentData.component);
        if (shadow.dead) {
          throw commandFailure(
            buffer,
            index,
            command.type,
            liveError(command.entity, "command.addComponent", command.componentData.component) ?? new StaleEntityError(
              raw,
              entityIndex(command.entity),
              entityGeneration(command.entity),
              {
                operation: "command.addComponent",
                expectedGeneration: entityGeneration(command.entity),
                actualGeneration: -1
              }
            )
          );
        }
        const reparent = present && role?.kind === "source" && role.exclusive === true && !shadow.pending;
        if (present && !reparent) {
          throw commandFailure(
            buffer,
            index,
            command.type,
            new ComponentAlreadyPresentError(raw, command.componentData.component.name)
          );
        }
        shadow.components.add(componentId(command.componentData.component));
        if (!reparent) shadow.added.add(componentId(command.componentData.component));
        shadow.removed.delete(componentId(command.componentData.component));
        if (role?.kind === "source") {
          const filled = fillComponentDefaults(
            command.componentData.component,
            command.componentData.data
          );
          const target = relationshipTarget(command.componentData.component, filled);
          setOverlayTarget(
            relationshipOverlay,
            command.entity,
            command.componentData.component,
            target
          );
          const cycle = relationshipCycle(
            world,
            command.entity,
            command.componentData.component,
            target,
            relationshipOverlay
          );
          if (cycle !== void 0) throw commandFailure(buffer, index, command.type, cycle);
        }
        break;
      }
      case "removeComponent": {
        const raw = command.entity;
        if (isRelationshipTarget(command.component)) {
          throw commandFailure(
            buffer,
            index,
            command.type,
            new RelationshipTargetReadonlyError(command.component.name, "removeComponent")
          );
        }
        if (componentId(command.component) === 0) {
          throw commandFailure(
            buffer,
            index,
            command.type,
            new RemoveEssentialComponentError(command.component.name)
          );
        }
        const shadow = shadowFor(command.entity);
        if (shadow.dead) {
          throw commandFailure(
            buffer,
            index,
            command.type,
            liveError(command.entity, "command.removeComponent", command.component) ?? new StaleEntityError(
              raw,
              entityIndex(command.entity),
              entityGeneration(command.entity),
              {
                operation: "command.removeComponent",
                expectedGeneration: entityGeneration(command.entity),
                actualGeneration: -1
              }
            )
          );
        }
        if (!shadow.pending) {
          const stale = liveError(command.entity, "command.removeComponent", command.component);
          if (stale !== void 0) throw commandFailure(buffer, index, command.type, stale);
        }
        const present = shadow.pending ? shadow.components.has(componentId(command.component)) : shadow.removed.has(componentId(command.component)) ? false : shadow.added.has(componentId(command.component)) || world.hasComponent(command.entity, command.component);
        if (!present) {
          throw commandFailure(
            buffer,
            index,
            command.type,
            new ComponentNotPresentError(raw, command.component.name)
          );
        }
        shadow.components.delete(componentId(command.component));
        shadow.removed.add(componentId(command.component));
        shadow.added.delete(componentId(command.component));
        if (relationshipRole(command.component)?.kind === "source") {
          setOverlayTarget(relationshipOverlay, command.entity, command.component, null);
        }
        break;
      }
    }
  }
}
function flushCommands(buffer, world) {
  if (buffer.status !== "open") return;
  const queue = buffer._queue;
  try {
    preflightCommands(buffer, world);
  } catch (error) {
    buffer.abort(error);
    throw error;
  }
  let applied = 0;
  let mutationStarted = false;
  let commandIndex = -1;
  let currentCommand;
  let lastCommittedCommand = null;
  try {
    const requireSuccess = (result) => {
      if (result !== null && typeof result === "object" && "ok" in result && result.ok === false) {
        throw result.error ?? new Error("Command failed");
      }
    };
    while (queue.length > 0) {
      const cmd = queue.shift();
      commandIndex += 1;
      currentCommand = cmd;
      switch (cmd.type) {
        case "spawn":
          mutationStarted = true;
          requireSuccess(
            world[worldInternal].materializePendingEntity(cmd.entity, cmd.componentDatas)
          );
          buffer._pendingEntities.delete(cmd.entity);
          applied += 1;
          lastCommittedCommand = { index: commandIndex, kind: cmd.type };
          break;
        case "despawn":
          mutationStarted = true;
          requireSuccess(world.despawn(cmd.entity));
          applied += 1;
          lastCommittedCommand = { index: commandIndex, kind: cmd.type };
          break;
        case "addComponent":
          mutationStarted = true;
          requireSuccess(world.addComponent(cmd.entity, cmd.componentData));
          applied += 1;
          lastCommittedCommand = { index: commandIndex, kind: cmd.type };
          break;
        case "removeComponent":
          mutationStarted = true;
          requireSuccess(world.removeComponent(cmd.entity, cmd.component));
          applied += 1;
          lastCommittedCommand = { index: commandIndex, kind: cmd.type };
          break;
      }
    }
    buffer.commit();
  } catch (error) {
    buffer.abort(error);
    if (error instanceof CommandFailedError) throw error;
    if (!mutationStarted && applied === 0) {
      throw commandFailure(
        buffer,
        Math.max(commandIndex, 0),
        currentCommand?.type ?? "spawn",
        error
      );
    }
    if (world.execution.health === "healthy") {
      const poison = world[worldInternal].poisonExecution;
      poison({
        code: "shared-kernel-failed",
        kernelName: "CommandBuffer.flush",
        cause: error,
        partialWrite: true,
        retryable: false
      });
    }
    throw new SystemFailedError(
      buffer._systemName,
      buffer._scheduleName,
      error,
      lastCommittedCommand
    );
  }
}

// src/schedule.ts
function createSchedule(token) {
  return {
    token,
    systems: /* @__PURE__ */ new Map(),
    sets: /* @__PURE__ */ new Map(),
    nextIndex: 0,
    dirty: true,
    sortedOrder: [],
    predecessors: /* @__PURE__ */ new Map()
  };
}
function addSystem(schedule, descriptor) {
  const record = {
    descriptor,
    registrationIndex: schedule.nextIndex++,
    queries: null
  };
  schedule.systems.set(descriptor.name, record);
  schedule.dirty = true;
}
function defineSystem(descriptor) {
  const handle = Object.freeze(descriptor);
  return handle;
}
function defineSystemSet(opts) {
  const token = {
    __forgeaxSystemSet: void 0,
    name: opts.name
  };
  if (opts.runIf !== void 0) {
    token.runIf = opts.runIf;
  }
  if (opts.chained !== void 0) {
    token.chained = opts.chained;
  }
  const frozen = Object.freeze(token);
  return frozen;
}
function validateSystemSetTokens(tokens) {
  for (const token of tokens) {
    if (token.name.length === 0) {
      return err(systemSetNotRegistered(token.name, []));
    }
  }
  return ok(void 0);
}
function removeSystem(schedule, name) {
  if (!schedule.systems.has(name)) {
    return err(
      new ScheduleMutationError(
        "system-before-unknown",
        `Cannot removeSystem: no system registered as "${name}".`,
        "Call world.inspect().systems to discover registered names.",
        { candidates: [...schedule.systems.keys()] }
      )
    );
  }
  schedule.systems.delete(name);
  for (const [, setRecord] of schedule.sets) {
    setRecord.members.delete(name);
  }
  schedule.dirty = true;
  return ok(void 0);
}
function replaceSystem(schedule, name, descriptor) {
  const record = schedule.systems.get(name);
  if (!record) {
    return err(
      new ScheduleMutationError(
        "system-before-unknown",
        `Cannot replaceSystem: no system registered as "${name}".`,
        "Call world.inspect().systems to discover registered names; or addSystem(descriptor) to register a new system.",
        { candidates: [...schedule.systems.keys()] }
      )
    );
  }
  record.descriptor = descriptor;
  record.queries = null;
  schedule.dirty = true;
  return ok(void 0);
}
function addSystems(schedule, set, systems) {
  const validated = validateSystemSetTokens([set]);
  if (!validated.ok) {
    return err(validated.error);
  }
  const setName = set.name;
  let record = schedule.sets.get(setName);
  if (!record) {
    record = {
      members: /* @__PURE__ */ new Set(),
      runIf: set.runIf,
      chained: set.chained ?? false
    };
    schedule.sets.set(setName, record);
  }
  for (const system of systems) {
    const name = system.name;
    if (!schedule.systems.has(name)) {
      addSystem(schedule, system);
    }
    record.members.add(name);
  }
  schedule.dirty = true;
  return ok(void 0);
}
function buildSchedule(schedule) {
  const systems = schedule.systems;
  const names = [...systems.keys()];
  if (schedule.token.name === "Update") names.push("FixedUpdate");
  const nameSet = new Set(names);
  const adj = /* @__PURE__ */ new Map();
  const inDegree = /* @__PURE__ */ new Map();
  const predecessors = /* @__PURE__ */ new Map();
  for (const name of names) {
    adj.set(name, []);
    inDegree.set(name, 0);
    predecessors.set(name, /* @__PURE__ */ new Set());
  }
  const addEdge = (source, target) => {
    adj.get(source)?.push(target);
    predecessors.get(target)?.add(source);
    inDegree.set(target, (inDegree.get(target) ?? 0) + 1);
  };
  const orderReferenceName = (reference) => typeof reference === "string" ? reference : reference.name;
  for (const [name, record] of systems) {
    const desc = record.descriptor;
    if (desc.after) {
      for (const reference of desc.after) {
        const dep = orderReferenceName(reference);
        if (!nameSet.has(dep)) continue;
        addEdge(dep, name);
      }
    }
    if (desc.before) {
      for (const reference of desc.before) {
        const target = orderReferenceName(reference);
        if (!nameSet.has(target)) continue;
        addEdge(name, target);
      }
    }
  }
  for (const [, setRecord] of schedule.sets) {
    if (setRecord.chained) {
      const members = [...setRecord.members];
      for (let i = 0; i < members.length - 1; i++) {
        const m1 = members[i];
        const m2 = members[i + 1];
        if (!m1 || !m2 || !nameSet.has(m1) || !nameSet.has(m2)) continue;
        addEdge(m1, m2);
      }
    }
  }
  const queue = [];
  for (const name of names) {
    if (inDegree.get(name) === 0) {
      queue.push(name);
    }
  }
  queue.sort(
    (a, b) => (systems.get(a)?.registrationIndex ?? Number.MAX_SAFE_INTEGER) - (systems.get(b)?.registrationIndex ?? Number.MAX_SAFE_INTEGER)
  );
  const sorted = [];
  while (queue.length > 0) {
    const current = queue.shift();
    sorted.push(current);
    const neighbors = adj.get(current) ?? [];
    const freed = [];
    for (const neighbor of neighbors) {
      const newDeg = (inDegree.get(neighbor) ?? 0) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) {
        freed.push(neighbor);
      }
    }
    freed.sort(
      (a, b) => (systems.get(a)?.registrationIndex ?? Number.MAX_SAFE_INTEGER) - (systems.get(b)?.registrationIndex ?? Number.MAX_SAFE_INTEGER)
    );
    queue.push(...freed);
  }
  if (sorted.length < names.length) {
    const remaining = names.filter((n) => !sorted.includes(n));
    const cyclePath = findCyclePath(remaining, adj);
    throw new CyclicDependencyError(cyclePath);
  }
  schedule.sortedOrder = sorted;
  schedule.predecessors = predecessors;
  schedule.dirty = false;
  return sorted;
}
function findCyclePath(remaining, adj) {
  const remainSet = new Set(remaining);
  const visited = /* @__PURE__ */ new Set();
  const path = [];
  function dfs(node) {
    if (visited.has(node)) {
      const cycleStart = path.indexOf(node);
      const cycle = path.slice(cycleStart);
      cycle.push(node);
      return cycle;
    }
    visited.add(node);
    path.push(node);
    for (const neighbor of adj.get(node) ?? []) {
      if (!remainSet.has(neighbor)) continue;
      const result = dfs(neighbor);
      if (result) return result;
    }
    path.pop();
    return null;
  }
  for (const start of remaining) {
    visited.clear();
    path.length = 0;
    const result = dfs(start);
    if (result) return result;
  }
  return remaining;
}
function poisonSystemFailure(world, systemName, cause) {
  const poison = world[worldInternal].poisonExecution;
  poison({
    code: "shared-kernel-failed",
    kernelName: `system:${systemName}`,
    cause,
    partialWrite: true,
    retryable: false
  });
}
function abortOutstandingCommands(commandsBySystem) {
  for (const commands of commandsBySystem.values()) {
    if (commands.status === "open") commands.abort();
  }
}
function runScheduleBody(schedule, world, selectedNames, commandsBySystem, finalDrain = true) {
  if (schedule.dirty) {
    buildSchedule(schedule);
  }
  if (selectedNames === void 0 && schedule.sets.size === 0 && commandsBySystem.size === 0 && schedule.sortedOrder.every((name) => {
    const record = schedule.systems.get(name);
    return record !== void 0 && record.descriptor.queries.length === 0 && record.descriptor.runIf === void 0 && (schedule.predecessors.get(name)?.size ?? 0) === 0;
  })) {
    for (const name of schedule.sortedOrder) {
      const record = schedule.systems.get(name);
      if (!record) continue;
      const commands = createCommandBuffer(world, {
        systemName: name,
        scheduleName: schedule.token.name
      });
      commandsBySystem.set(name, commands);
      let returnValue;
      try {
        returnValue = record.descriptor.fn(world, [], commands);
      } catch (error) {
        abortOutstandingCommands(commandsBySystem);
        poisonSystemFailure(world, name, error);
        throw new SystemFailedError(name, schedule.token.name, error);
      }
      if (returnValue && typeof returnValue === "object" && "ok" in returnValue) {
        const result = returnValue;
        if (result.ok === false && result.error !== void 0) {
          abortOutstandingCommands(commandsBySystem);
          poisonSystemFailure(world, name, result.error);
          throw new SystemFailedError(name, schedule.token.name, result.error);
        }
      }
    }
    if (finalDrain) {
      try {
        for (const commands of commandsBySystem.values()) {
          flushCommands(commands, world);
        }
      } catch (error) {
        abortOutstandingCommands(commandsBySystem);
        throw error;
      }
    }
    return;
  }
  const selected = selectedNames ? new Set(selectedNames) : void 0;
  const systemToSets = /* @__PURE__ */ new Map();
  for (const [setName, setRecord] of schedule.sets) {
    for (const memberName of setRecord.members) {
      if (schedule.systems.has(memberName)) {
        let list = systemToSets.get(memberName);
        if (!list) {
          list = [];
          systemToSets.set(memberName, list);
        }
        list.push(setName);
      }
    }
  }
  const setRunIfCache = /* @__PURE__ */ new Map();
  for (const name of schedule.sortedOrder) {
    if (selected && !selected.has(name)) continue;
    const record = schedule.systems.get(name);
    if (!record) continue;
    for (const predecessor of schedule.predecessors.get(name) ?? []) {
      const producerCommands = commandsBySystem.get(predecessor);
      if (producerCommands) {
        try {
          flushCommands(producerCommands, world);
        } catch (error) {
          abortOutstandingCommands(commandsBySystem);
          throw error;
        }
      }
    }
    if (record.queries === null) {
      record.queries = record.descriptor.queries.map((descriptor) => {
        const result = world.query(descriptor);
        if (!result.ok) throw result.error;
        return result.value;
      });
    }
    const setNames = systemToSets.get(name);
    let allSetConditionsPass = true;
    if (setNames) {
      for (const setName of setNames) {
        const setRecord = schedule.sets.get(setName);
        if (setRecord?.runIf) {
          let cached = setRunIfCache.get(setName);
          if (cached === void 0) {
            cached = setRecord.runIf(world);
            setRunIfCache.set(setName, cached);
          }
          if (!cached) {
            allSetConditionsPass = false;
            break;
          }
        }
      }
    }
    if (!allSetConditionsPass) {
      continue;
    }
    if (record.descriptor.runIf && !record.descriptor.runIf(world)) {
      continue;
    }
    const commands = createCommandBuffer(world, {
      systemName: name,
      scheduleName: schedule.token.name
    });
    commandsBySystem.set(name, commands);
    let returnValue;
    try {
      returnValue = record.descriptor.fn(
        world,
        record.queries,
        commands
      );
    } catch (error) {
      abortOutstandingCommands(commandsBySystem);
      poisonSystemFailure(world, name, error);
      throw new SystemFailedError(name, schedule.token.name, error);
    }
    if (returnValue && typeof returnValue === "object" && "ok" in returnValue) {
      const result = returnValue;
      if (result.ok === false && result.error !== void 0) {
        abortOutstandingCommands(commandsBySystem);
        poisonSystemFailure(world, name, result.error);
        throw new SystemFailedError(name, schedule.token.name, result.error);
      }
    }
  }
  if (finalDrain) {
    try {
      for (const commands of commandsBySystem.values()) {
        flushCommands(commands, world);
      }
    } catch (error) {
      abortOutstandingCommands(commandsBySystem);
      throw error;
    }
  }
}
function runSchedule(schedule, world, selectedNames, commandsBySystem = /* @__PURE__ */ new Map(), finalDrain = true) {
  let completed = false;
  try {
    runScheduleBody(schedule, world, selectedNames, commandsBySystem, finalDrain);
    completed = true;
  } finally {
    if (!completed || finalDrain) abortOutstandingCommands(commandsBySystem);
  }
}
var SharedRefStore = class {
  payloads = /* @__PURE__ */ new Map();
  refcounts = /* @__PURE__ */ new Map();
  freeSlots = [];
  internedByTarget = /* @__PURE__ */ new Map();
  internedKeys = /* @__PURE__ */ new Map();
  nextSlot = BUILTIN_BASE;
  /** Latest published mutation epoch per live handle; not an event journal. */
  /**
   * Generation table indexed by slot (D-6). Each entry tracks the current
   * generation for the slot — written to during alloc (welded into the
   * returned handle via pack) and incremented on release (M4).
   *
   * @internal
   */
  // biome-ignore lint/style/useNamingConvention: internal field — @internal JSDoc suppresses lint:internal gate
  _generations = [];
  /**
   * Allocate a fresh shared handle for `payload`, branded against `target`.
   * Refcount starts at 1 (the alloc-grant). Nullish payloads are rejected
   * before a slot or free-list is touched.
   *
   * The returned handle carries a generation tag welded via codec.pack
   * (D-8, OOS-2): first allocation gen=0 (AC-06), reused slot gen = the
   * current generation from _generations[slot]. The toShared brand cast
   * happens internally — external callers no longer construct Handle<...>
   * directly.
   *
   * Minted slots are user-tier (`>= BUILTIN_BASE`); builtin slots are never
   * produced here (D-15).
   */
  alloc(target, payload) {
    if (payload === null || payload === void 0) {
      throw new SharedRefPayloadInvalidError(target, payload === null ? "null" : "undefined");
    }
    const slot = this.freeSlots.pop() ?? this.nextSlot++;
    if (slot > MAX_SLOT) {
      throw new RangeError(
        `SharedRefStore: slot index ${slot} exceeds 24-bit max (${MAX_SLOT}). Reduce simultaneous shared handles or investigate handle leaks.`
      );
    }
    const gen = this._generations[slot] ?? 0;
    const raw = pack(slot, gen);
    this.payloads.set(raw, payload);
    this.refcounts.set(raw, 1);
    return toShared(raw);
  }
  /**
   * Return the idempotent producer handle for one object payload in this
   * store. Identity includes `target`, so the same object branded for two
   * asset kinds does not alias.
   *
   * A cache hit deliberately does not retain: this is one producer grant,
   * discovered repeatedly by an asset catalogue. Actual holders retain and
   * release through the ECS write barrier. Callers needing independent
   * grants or a per-handle deleter must use {@link alloc}.
   */
  intern(target, payload) {
    let byPayload = this.internedByTarget.get(target);
    if (byPayload === void 0) {
      byPayload = /* @__PURE__ */ new WeakMap();
      this.internedByTarget.set(target, byPayload);
    }
    const existingRaw = byPayload.get(payload);
    if (existingRaw !== void 0 && this.payloads.has(existingRaw)) {
      return toShared(existingRaw);
    }
    const handle = this.alloc(target, payload);
    const raw = unwrapHandle(handle);
    byPayload.set(payload, raw);
    this.internedKeys.set(raw, { target, payload });
    return handle;
  }
  /**
   * Look up `payload` by handle. Returns `err(shared-ref-released)` when
   * the handle's slot has no live payload (rc reached 0, no re-alloc has
   * filled the slot); `err(builtin-slot-not-owned)` for a builtin slot.
   *
   * §contract - mirrors UniqueRefStore: a stale handle whose slot has been
   * released and re-allocated returns `err(shared-ref-stale)` - the handle's
   * welded generation no longer matches `_generations[slot]`. The gen check
   * runs before payload lookup, so stale-by-reuse is caught deterministically.
   */
  resolve(handle) {
    const raw = unwrapHandle(handle);
    if (raw < BUILTIN_BASE) return err(new BuiltinSlotNotOwnedError(raw));
    const slot = handleSlot(handle);
    const handleGen = handleGeneration(handle);
    const storeGen = this._generations[slot] ?? 0;
    if (handleGen !== storeGen) {
      return err(new SharedRefStaleError(slot, handleGen, storeGen));
    }
    const payload = this.payloads.get(raw);
    if (payload === void 0) {
      return err(new SharedRefReleasedError(raw, "<unknown>"));
    }
    return ok(payload);
  }
  /**
   * Publish that a live payload was mutated in place. Consumers that retain
   * projections of shared payload data compare the monotonic epoch and
   * explicitly refresh instead of rescanning every payload each frame.
   */
  /**
   * Increment the refcount of a live shared handle. Returns
   * `err(shared-ref-released)` when the handle is not live - retain MUST
   * NOT resurrect a released slot (charter P3 explicit failure; would
   * defeat the rc=0 -> drop invariant); `err(builtin-slot-not-owned)` for a
   * builtin slot.
   */
  retain(handle) {
    const raw = unwrapHandle(handle);
    if (raw < BUILTIN_BASE) return err(new BuiltinSlotNotOwnedError(raw));
    const slot = handleSlot(handle);
    const handleGen = handleGeneration(handle);
    const storeGen = this._generations[slot] ?? 0;
    if (handleGen !== storeGen) {
      return err(new SharedRefStaleError(slot, handleGen, storeGen));
    }
    const rc = this.refcounts.get(raw);
    if (rc === void 0) {
      return err(new SharedRefReleasedError(raw, "<unknown>"));
    }
    this.refcounts.set(raw, rc + 1);
    return ok(void 0);
  }
  /**
   * Decrement the refcount. When rc transitions 1 -> 0, the slot is dropped
   * and one structured release-evidence record is published. The evidence
   * captures the payload, zero refcount, next generation and `released` marker
   * after the store has removed the live slot.
   *
   * Returns `err(shared-ref-double-release, rc=0)` when the handle has
   * already reached rc=0 (or was never live); `err(builtin-slot-not-owned)`
   * for a builtin slot. AI users branch on `.code` and route the
   * second-release log to Layer 3 ErrorHandler without aborting the despawn
   * chain.
   */
  release(handle) {
    const raw = unwrapHandle(handle);
    if (raw < BUILTIN_BASE) return err(new BuiltinSlotNotOwnedError(raw));
    const slot = handleSlot(handle);
    const handleGen = handleGeneration(handle);
    const storeGen = this._generations[slot] ?? 0;
    if (handleGen !== storeGen) {
      return err(new SharedRefStaleError(slot, handleGen, storeGen));
    }
    const rc = this.refcounts.get(raw);
    if (rc === void 0) {
      return err(new SharedRefDoubleReleaseError(raw, "<unknown>", 0));
    }
    if (rc > 1) {
      this.refcounts.set(raw, rc - 1);
      return ok(void 0);
    }
    const payload = this.payloads.get(raw);
    const internedKey = this.internedKeys.get(raw);
    if (internedKey !== void 0) {
      const byPayload = this.internedByTarget.get(internedKey.target);
      if (byPayload?.get(internedKey.payload) === raw) {
        byPayload.delete(internedKey.payload);
      }
      this.internedKeys.delete(raw);
    }
    this.refcounts.delete(raw);
    this.payloads.delete(raw);
    const generation = storeGen + 1;
    this._generations[slot] = generation;
    if (!isRetiredSlot(generation)) {
      this.freeSlots.push(slot);
    }
    const evidence = Object.freeze({
      payload,
      refcount: 0,
      generation,
      evidence: "released"
    });
    return ok(evidence);
  }
  /**
   * Return the current refcount for `handle`. Returns 0 for a released
   * (or never-allocated) slot. Primarily a debug + tests entry point;
   * production code rarely reads rc directly (the rc=0 -> drop invariant
   * is the surface AI users consume via release / the per-handle deleter).
   */
  refcount(handle) {
    const raw = unwrapHandle(handle);
    return this.refcounts.get(raw) ?? 0;
  }
  /** @internal Diagnostic count of live slots. Exposed for tests + inspector. */
  _liveCount() {
    return this.payloads.size;
  }
};
var UniqueRefStore = class {
  payloads = /* @__PURE__ */ new Map();
  freeSlots = [];
  releaseCallbacks = /* @__PURE__ */ new Map();
  nextSlot = 1;
  /**
   * Generation table indexed by slot (D-6). Each entry tracks the current
   * generation for the slot — written to during alloc (welded into the
   * returned handle via pack) and incremented on release (M4).
   *
   * Slot 0 is the sentinel and always has gen=0 — it is never allocated
   * and never incremented (R6).
   *
   * @internal
   */
  // biome-ignore lint/style/useNamingConvention: internal field — @internal JSDoc suppresses lint:internal gate
  _generations = [];
  /**
   * Allocate a fresh managed handle for `payload`, branded against `target`.
   *
   * Slot 0 is reserved as the "null/unset" sentinel - schema-vocab `ref<T>`
   * fields default to this sentinel before the first write, and World's
   * release loop uses it to short-circuit (`shouldRelease(0) === false`).
   *
   * The returned handle carries a generation tag welded via codec.pack
   * (D-8, OOS-2): first allocation gen=0 (AC-06), reused slot gen = the
   * current generation from _generations[slot]. The toUnique brand cast
   * happens internally — external callers no longer construct Handle<...>
   * directly.
   *
   * @returns a `Handle<T, 'unique'>` u32. The branded number is safe to
   *   widen to `number` for GPU upload (charter consistent abstraction).
   */
  alloc(target, payload, onRelease) {
    const slot = this.freeSlots.pop() ?? this.nextSlot++;
    if (slot > MAX_SLOT) {
      throw new RangeError(
        `UniqueRefStore: slot index ${slot} exceeds 24-bit max (${MAX_SLOT}). Reduce simultaneous managed handles or investigate handle leaks.`
      );
    }
    const gen = this._generations[slot] ?? 0;
    const raw = pack(slot, gen);
    this.payloads.set(raw, payload);
    if (onRelease !== void 0) {
      this.releaseCallbacks.set(raw, onRelease);
    }
    return toUnique(raw);
  }
  /**
   * Look up `payload` by handle. Returns `err(unique-ref-released)` when
   * the handle's slot has no live payload (release happened in between, and
   * no re-alloc has filled the slot). Resolves the same payload object on
   * every call - identity-stable until release.
   *
   * §contract: a stale handle whose slot has been released and re-allocated
   * returns `err(unique-ref-stale)` — the generation welded into the handle
   * no longer matches `_generations[slot]`. The gen check runs before the
   * payload lookup, so stale-by-reuse is caught deterministically — see
   * README §"Managed handles carry a generation".
   *
   * `T` flows from the caller's `Handle<T, 'unique'>` type; the store erases
   * payload types at the storage layer and the call boundary re-narrows.
   */
  resolve(handle) {
    const raw = unwrapHandle(handle);
    const slot = handleSlot(handle);
    const handleGen = handleGeneration(handle);
    const storeGen = this._generations[slot] ?? 0;
    if (handleGen !== storeGen) {
      return err(new UniqueRefStaleError(slot, handleGen, storeGen));
    }
    const payload = this.payloads.get(raw);
    if (payload === void 0) {
      return err(new UniqueRefReleasedError(raw, "<unknown>"));
    }
    return ok(payload);
  }
  /**
   * Release `handle` - drop the payload and push the slot onto the free list.
   * Releasing the same handle twice surfaces `unique-ref-double-release`
   * (D-1) so World's release loop can route the second release to Layer 3
   * ErrorHandler without aborting the despawn chain. Detection is by
   * payload-presence, not generation (§contract — managed handles are
   * operational, not persistent).
   *
   * Releasing the slot-0 sentinel is a no-op - World's release loop calls
   * `shouldRelease` first to filter sentinels.
   */
  release(handle) {
    const raw = unwrapHandle(handle);
    const slot = handleSlot(handle);
    const handleGen = handleGeneration(handle);
    const storeGen = this._generations[slot] ?? 0;
    if (handleGen !== storeGen) {
      return err(new UniqueRefStaleError(slot, handleGen, storeGen));
    }
    const payload = this.payloads.get(raw);
    if (payload === void 0) {
      return err(new UniqueRefDoubleReleaseError(raw, "<unknown>"));
    }
    const cb = this.releaseCallbacks.get(raw);
    this.releaseCallbacks.delete(raw);
    this.payloads.delete(raw);
    this._generations[slot] = storeGen + 1;
    if (!isRetiredSlot(this._generations[slot])) {
      this.freeSlots.push(slot);
    }
    if (cb !== void 0) {
      cb(payload);
    }
    return ok(void 0);
  }
  /** @internal Replace the payload of a live slot without changing its handle. */
  _setPayload(handle, payload) {
    const raw = unwrapHandle(handle);
    if (!this.payloads.has(raw)) {
      throw new Error(`UniqueRefStore: cannot replace released payload ${raw}.`);
    }
    this.payloads.set(raw, payload);
  }
  /**
   * `true` if `handle` references a live slot - used by World's release loop
   * to decide whether to call `release` (skips sentinel + already-released).
   *
   * The release loop differentiates "expected sentinel" (no error) from
   * "leaked already-released handle" (`unique-ref-double-release`) at the
   * caller layer; this helper handles only the no-op short-circuit.
   */
  isLive(handle) {
    const raw = unwrapHandle(handle);
    if (raw === 0) return false;
    return this.payloads.has(raw);
  }
  /** @internal Diagnostic count of live slots. Exposed for tests + inspector. */
  _liveCount() {
    return this.payloads.size;
  }
};
function tableRow(world, record) {
  const archetype = world[worldInternal].getGraph().archetypes[record.archetypeId];
  return archetype?.rows[record.archetypeRow] ?? -1;
}
function spawnCore(world, componentDatas) {
  componentDatas = expandComponentRequirements(componentDatas);
  for (const cd of componentDatas) {
    const preflight = world[worldInternal].preflightComponentData(null, cd);
    if (!preflight.ok) return preflight;
  }
  const spawnedEntity = world[worldInternal].allocatePendingEntity();
  const materialized = world[worldInternal].materializeEntity(spawnedEntity, componentDatas);
  if (!materialized.ok) return materialized;
  return ok(spawnedEntity);
}
function worldAddChild(world, parent, child, component, data) {
  const holderComp = component;
  if (relationshipRole(holderComp)?.kind !== "source") {
    return err(new ComponentNotPresentError(child, component.name));
  }
  const parentResult = world[worldInternal].lookupAlive(parent, "addChild", component.name);
  if (!parentResult.ok) return parentResult;
  const parentSlot = entityIndex(parent);
  const parentGeneration = entityGeneration(parent);
  const childResult = world[worldInternal].lookupAlive(child, "addChild", component.name);
  if (!childResult.ok) return childResult;
  const childSlot = entityIndex(child);
  const role = relationshipRole(holderComp);
  if (child === parent && !(role?.kind === "source" && role.allowSelf)) {
    return err(new RelationshipSelfCycleError(component.name, child, child));
  }
  const cycleHit = child === parent && role?.kind === "source" && role.allowSelf ? null : relationshipChainCycleHit(world, holderComp, parentSlot, parentGeneration, childSlot);
  if (cycleHit !== null) {
    return err(new RelationshipSelfCycleError(component.name, child, cycleHit));
  }
  return world.addComponent(child, { component, data });
}
function worldRemoveChild(world, parent, child, component) {
  const holderComp = component;
  const childResult = world[worldInternal].lookupAlive(child, "removeChild", component.name);
  if (!childResult.ok) return childResult;
  const childRecord = childResult.value;
  const childArch = world[worldInternal].getGraph().archetypes[childRecord.archetypeId];
  if (!childArch) {
    return err(
      new StaleEntityError(child, entityIndex(child), entityGeneration(child), {
        operation: "removeChild",
        component: component.name,
        expectedGeneration: entityGeneration(child),
        actualGeneration: childRecord.generation
      })
    );
  }
  if (!childArch.components.some((component2) => componentId(component2) === componentId(holderComp))) {
    return err(
      new RelationshipDetachMismatchError(component.name, child, parent, 0)
    );
  }
  const oldValue = world[worldInternal].readRow(
    childArch,
    holderComp,
    tableRow(world, childRecord)
  );
  const currentTarget = relationshipTargetEntity(holderComp, oldValue);
  if (currentTarget !== parent) {
    return err(
      new RelationshipDetachMismatchError(
        component.name,
        child,
        parent,
        currentTarget ?? 0
      )
    );
  }
  return world.removeComponent(child, component);
}
function worldReparent(world, child, newParent, component, data) {
  const holderComp = component;
  const role = relationshipRole(holderComp);
  if (role?.kind !== "source") {
    return err(new ComponentNotPresentError(child, component.name));
  }
  if (child === newParent && !role.allowSelf) {
    return err(
      new RelationshipSelfCycleError(component.name, child, newParent)
    );
  }
  const cycleHit = child === newParent && role.allowSelf ? null : relationshipChainCycleHit(
    world,
    holderComp,
    entityIndex(newParent),
    entityGeneration(newParent),
    entityIndex(child)
  );
  if (cycleHit !== null) {
    return err(new RelationshipSelfCycleError(component.name, child, cycleHit));
  }
  const childResult = world[worldInternal].lookupAlive(child, "reparent", component.name);
  if (!childResult.ok) return childResult;
  const childRecord = childResult.value;
  const childArch = world[worldInternal].getGraph().archetypes[childRecord.archetypeId];
  if (!childArch) {
    return err(
      new StaleEntityError(child, entityIndex(child), entityGeneration(child), {
        operation: "reparent",
        component: component.name,
        expectedGeneration: entityGeneration(child),
        actualGeneration: childRecord.generation
      })
    );
  }
  const payload = {
    ...data,
    [role.sourceField]: newParent
  };
  if (childArch.components.some((component2) => componentId(component2) === componentId(holderComp))) {
    return world.set(child, component, payload);
  }
  return world.addComponent(child, { component, data: payload });
}
function worldIterAncestors(world, entity) {
  return {
    *[Symbol.iterator]() {
      const records = world[worldInternal].getRecords();
      const slot = entityIndex(entity);
      const generation = entityGeneration(entity);
      if (!world[worldInternal].recordIsLive(records[slot], generation)) return;
      const visited = /* @__PURE__ */ new Set();
      let currentSlot = slot;
      let currentGeneration = generation;
      while (true) {
        const key = pack(currentSlot, currentGeneration);
        if (visited.has(key)) return;
        visited.add(key);
        const currentRecord = records[currentSlot];
        if (!world[worldInternal].recordIsLive(currentRecord, currentGeneration)) return;
        const currentArch = world[worldInternal].getGraph().archetypes[currentRecord.archetypeId];
        if (!currentArch) return;
        let foundParent = false;
        for (const component of currentArch.components) {
          if (relationshipRole(component)?.kind !== "source" || !currentArch.components.some(
            (candidate) => componentId(candidate) === componentId(component)
          ))
            continue;
          const value = world[worldInternal].readRow(
            currentArch,
            component,
            tableRow(world, currentRecord)
          );
          const target = relationshipTargetEntity(component, value);
          if (target === null) continue;
          yield target;
          currentSlot = entityIndex(target);
          currentGeneration = entityGeneration(target);
          if (!world[worldInternal].recordIsLive(records[currentSlot], currentGeneration)) return;
          foundParent = true;
          break;
        }
        if (!foundParent) return;
      }
    }
  };
}
function worldIterDescendants(world, entity) {
  return {
    *[Symbol.iterator]() {
      const records = world[worldInternal].getRecords();
      const slot = entityIndex(entity);
      const generation = entityGeneration(entity);
      if (!world[worldInternal].recordIsLive(records[slot], generation)) return;
      const visited = /* @__PURE__ */ new Set();
      const stack = [slot];
      while (stack.length > 0) {
        const currentSlot = stack.pop();
        if (currentSlot === void 0) break;
        const currentRecord = records[currentSlot];
        if (!currentRecord || currentRecord.archetypeId === -1) continue;
        const currentArch = world[worldInternal].getGraph().archetypes[currentRecord.archetypeId];
        if (!currentArch) continue;
        for (const child of descendantChildren(
          world,
          currentArch,
          tableRow(world, currentRecord)
        )) {
          const childSlot = entityIndex(child);
          const childGeneration = entityGeneration(child);
          const key = pack(childSlot, childGeneration);
          if (visited.has(key) || !world[worldInternal].recordIsLive(records[childSlot], childGeneration)) {
            continue;
          }
          visited.add(key);
          yield child;
          stack.push(childSlot);
        }
      }
    }
  };
}
function descendantChildren(world, arch, row) {
  const children = [];
  for (const component of arch.components) {
    const value = world[worldInternal].readRow(arch, component, row);
    for (const [fieldName, fieldType] of Object.entries(componentSchema(component))) {
      if (fieldType !== "array<entity>") continue;
      const list = value[fieldName];
      if (!(list instanceof Uint32Array)) continue;
      for (const raw of list) children.push(raw);
    }
  }
  return children;
}
function relationshipTargetEntity(component, value) {
  for (const [fieldName, fieldType] of Object.entries(componentSchema(component))) {
    if (fieldType !== "entity") continue;
    const raw = value[fieldName];
    if (raw === null || raw === void 0 || raw === ENTITY_NULL_RAW) return null;
    return raw;
  }
  return null;
}
function relationshipChainCycleHit(world, holderComponent, startSlot, startGeneration, targetSlot) {
  const visited = /* @__PURE__ */ new Set();
  let currentSlot = startSlot;
  let currentGeneration = startGeneration;
  while (true) {
    const key = pack(currentSlot, currentGeneration);
    if (visited.has(key)) return null;
    visited.add(key);
    const currentRecord = world[worldInternal].getRecords()[currentSlot];
    if (!world[worldInternal].recordIsLive(currentRecord, currentGeneration)) return null;
    const currentArchetype = world[worldInternal].getGraph().archetypes[currentRecord.archetypeId];
    if (!currentArchetype?.components.some(
      (candidate) => componentId(candidate) === componentId(holderComponent)
    ))
      return null;
    const value = world[worldInternal].readRow(
      currentArchetype,
      holderComponent,
      tableRow(world, currentRecord)
    );
    const target = relationshipTargetEntity(holderComponent, value);
    if (target === null) return null;
    const targetEntitySlot = entityIndex(target);
    if (targetEntitySlot === targetSlot) return target;
    currentSlot = targetEntitySlot;
    currentGeneration = entityGeneration(target);
  }
}

// src/world-read.ts
var worldRead = /* @__PURE__ */ Symbol.for(
  "forgeax.ecs.worldRead"
);
var FIXED_ANCHOR_NAME = FixedUpdate.name;
function resourceName(key) {
  return typeof key === "string" ? key : key.name;
}
function warmSharedKernel(world, descriptor) {
  if (descriptor.kind !== "shared-kernel" || !world.hasResource(SHARED_KERNEL_EXECUTOR_RESOURCE_KEY))
    return;
  world.getResource(SHARED_KERNEL_EXECUTOR_RESOURCE_KEY).warmup?.(descriptor);
}
function scheduleFor(world, token) {
  const schedule = isScheduleToken(token) ? world[worldInternal].getSchedule(token) : void 0;
  if (schedule) return ok(schedule);
  return err(new ScheduleScopeMismatchError(token?.name ?? "Unknown", Update.name));
}
function setOwner(world, set) {
  for (const [token, schedule] of world[worldInternal].getSchedules()) {
    if (schedule.sets.has(set.name)) return token;
  }
  return void 0;
}
function scopeError(source, target, reference) {
  return err(new ScheduleScopeMismatchError(source.name, target.name, reference));
}
function worldAddSystem(world, token, descriptor) {
  const target = scheduleFor(world, token);
  if (!target.ok) return target;
  addSystem(target.value, descriptor);
  warmSharedKernel(world, descriptor);
  return ok(void 0);
}
function worldRemoveSystem(world, token, name) {
  const target = scheduleFor(world, token);
  if (!target.ok) return target;
  return removeSystem(target.value, name);
}
function worldReplaceSystem(world, token, name, descriptor) {
  const target = scheduleFor(world, token);
  if (!target.ok) return target;
  const replaced = replaceSystem(target.value, name, descriptor);
  if (replaced.ok) warmSharedKernel(world, descriptor);
  return replaced;
}
function worldAddSystems(world, token, set, systems) {
  const target = scheduleFor(world, token);
  if (!target.ok) return target;
  const owner = setOwner(world, set);
  if (owner && owner !== token) return scopeError(token, owner, set.name);
  const added = addSystems(target.value, set, systems);
  if (added.ok) {
    for (const system of systems) warmSharedKernel(world, system);
  }
  return added;
}
function validateScheduleReferences(world, token, schedule) {
  for (const record of schedule.systems.values()) {
    for (const reference of [
      ...record.descriptor.before ?? [],
      ...record.descriptor.after ?? []
    ]) {
      if (isScheduleToken(reference)) {
        const isFixedAnchor = token === Update && reference === FixedUpdate;
        if (reference !== token && !isFixedAnchor) {
          return new ScheduleScopeMismatchError(token.name, reference.name, reference.name);
        }
        continue;
      }
      if (typeof reference === "string") {
        for (const [otherToken, other] of world[worldInternal].getSchedules()) {
          if (otherToken !== token && other.systems.has(reference)) {
            return new ScheduleScopeMismatchError(token.name, otherToken.name, reference);
          }
        }
      }
    }
  }
  return void 0;
}
function runFixed(world, fixed, accumulator) {
  const fixedSchedule = world[worldInternal].getSchedule(FixedUpdate);
  if (!fixedSchedule) return;
  if (fixedSchedule.systems.size === 0) {
    discardFixedOverflow(fixed, accumulator);
    return;
  }
  let steps = 0;
  while (accumulator.value >= fixed.delta && steps < fixed.maxStepsPerUpdate) {
    accumulator.value = Math.round((accumulator.value - fixed.delta) * 1e12) / 1e12;
    fixed.overstep = accumulator.value;
    fixed.tick += 1;
    runSchedule(fixedSchedule, world);
    steps += 1;
  }
  if (steps === fixed.maxStepsPerUpdate && accumulator.value >= fixed.delta) {
    const remainder = accumulator.value % fixed.delta;
    const dropped = accumulator.value - remainder;
    accumulator.value = remainder;
    fixed.droppedSeconds += dropped;
    fixed.droppedUpdates += 1;
  }
}
function discardFixedOverflow(fixed, accumulator) {
  if (accumulator.value < fixed.delta) return;
  const remainder = accumulator.value % fixed.delta;
  const dropped = accumulator.value - remainder;
  accumulator.value = remainder;
  fixed.droppedSeconds += dropped;
  fixed.droppedUpdates += 1;
}
function worldUpdate(world, deltaSeconds = 0) {
  if (world.execution.health === "poisoned") {
    return err(new WorldPoisonedError(world.identity, world.execution.fault));
  }
  if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0)
    return err(new TimeDeltaInvalidError(deltaSeconds));
  const writer = world[worldInternal].getClockWriter();
  const time = writer.time;
  const fixed = writer.fixed;
  if (time.maxDeltaSeconds < (fixed.maxStepsPerUpdate + 1) * fixed.delta) {
    return err(
      new TimeConfigInvalidError({
        fixedDeltaSeconds: fixed.delta,
        maxStepsPerUpdate: fixed.maxStepsPerUpdate,
        maxDeltaSeconds: time.maxDeltaSeconds
      })
    );
  }
  for (const [token, schedule] of world[worldInternal].getSchedules()) {
    const mismatch = validateScheduleReferences(world, token, schedule);
    if (mismatch) return err(mismatch);
  }
  const measured = Math.min(deltaSeconds, time.maxDeltaSeconds);
  time.delta = measured;
  time.elapsed += measured;
  const accumulator = { value: world[worldInternal].getFixedAccumulator() + measured };
  const update = world[worldInternal].getSchedule(Update);
  if (!update) return err(new ScheduleScopeMismatchError("World", Update.name));
  try {
    if (update.dirty) buildSchedule(update);
    const order = update.sortedOrder;
    const anchor = order.indexOf(FIXED_ANCHOR_NAME);
    const fixedSchedule = world[worldInternal].getSchedule(FixedUpdate);
    const hasFixedSystems = (fixedSchedule?.systems.size ?? 0) > 0;
    if (anchor < 0 || !hasFixedSystems) {
      runSchedule(
        update,
        world,
        order.filter((name) => name !== FIXED_ANCHOR_NAME)
      );
      if (measured > 0) discardFixedOverflow(fixed, accumulator);
    } else {
      const updateCommands = /* @__PURE__ */ new Map();
      runSchedule(update, world, order.slice(0, anchor), updateCommands, false);
      if (measured > 0) runFixed(world, fixed, accumulator);
      runSchedule(update, world, order.slice(anchor + 1), updateCommands);
    }
  } catch (error) {
    if (error instanceof CommandFailedError || error instanceof SystemFailedError) {
      return err(error);
    }
    if (error instanceof CyclicDependencyError || error instanceof SharedKernelFailureError) {
      return err(error);
    }
    if (world.execution.health === "healthy") {
      world[worldInternal].poisonExecution({
        code: "shared-kernel-failed",
        kernelName: `schedule:${Update.name}`,
        cause: error,
        partialWrite: true,
        retryable: false
      });
    }
    return err(new SystemFailedError("<schedule>", Update.name, error));
  }
  world[worldInternal].setFixedAccumulator(accumulator.value);
  fixed.overstep = accumulator.value;
  return ok(void 0);
}
function worldInsertResource(world, key, value) {
  const name = resourceName(key);
  if (name === TIME_RESOURCE_KEY || name === FIXED_TIME_RESOURCE_KEY) {
    throw new ProtectedResourceError(name, "insert");
  }
  insertResource(
    world[worldInternal].getResources(),
    name,
    value,
    world[worldInternal].nextMutationEpoch()
  );
}
function worldGetResource(world, key) {
  return getResource(world[worldInternal].getResources(), resourceName(key));
}
function worldHasResource(world, key) {
  return hasResource(world[worldInternal].getResources(), resourceName(key));
}
function worldRemoveResource(world, key) {
  const name = resourceName(key);
  if (name === TIME_RESOURCE_KEY || name === FIXED_TIME_RESOURCE_KEY) {
    throw new ProtectedResourceError(name, "remove");
  }
  if (hasResource(world[worldInternal].getResources(), name)) {
    removeResource(world[worldInternal].getResources(), name);
    world[worldInternal].nextMutationEpoch();
  }
}
function worldInspect(world) {
  const graph = world[worldInternal].getGraph();
  const resources = world[worldInternal].getResources();
  let entityCount = 0;
  const archetypes = [];
  const activeComponentSet = /* @__PURE__ */ new Set();
  for (const arch of graph.archetypes) {
    if (!arch) continue;
    entityCount += arch.size;
    const componentNames2 = arch.components.map((component) => component.name);
    archetypes.push({
      key: arch.key,
      componentNames: componentNames2,
      entityCount: arch.size,
      tableId: arch.tableId
    });
    if (arch.size > 0) for (const name of componentNames2) activeComponentSet.add(name);
  }
  const schedules = [
    ...world[worldInternal].getSchedules()
  ].map(([token, schedule]) => {
    const systems2 = [...schedule.systems.entries()].filter(([name]) => name !== FIXED_ANCHOR_NAME).map(([name]) => ({
      name,
      sets: [...schedule.sets].flatMap(
        ([setName, record]) => record.members.has(name) ? [setName] : []
      )
    }));
    return { schedule: token, systems: systems2 };
  });
  const systems = schedules.flatMap((entry) => entry.systems);
  const tables = graph.tables.map((table) => ({
    id: table.id,
    key: table.key,
    componentNames: table.components.map((component) => component.name),
    entityCount: table.size,
    capacity: table.capacity
  }));
  return {
    entityCount,
    archetypeCount: archetypes.length,
    archetypes,
    tableCount: tables.length,
    tables,
    activeComponents: [...activeComponentSet],
    systemCount: systems.length,
    systems,
    resourceKeys: [...resources.entries.keys()],
    schedules,
    scheduleSystemCount(token) {
      return schedules.find((entry) => entry.schedule === token)?.systems.length ?? 0;
    }
  };
}
function referenceName(reference) {
  return typeof reference === "string" ? reference : reference.name;
}
function componentNames(components) {
  return (components ?? []).map((component) => component.name);
}
function queryData(query) {
  return {
    with: componentNames(query.with),
    without: componentNames(query.without),
    optional: componentNames(query.optional),
    changed: componentNames(query.changed),
    added: componentNames(query.added)
  };
}
function worldScheduleData(world) {
  return [...world[worldInternal].getSchedules()].map(
    ([token, schedule]) => {
      if (schedule.dirty) buildSchedule(schedule);
      const systems = [...schedule.systems.entries()].filter(([name]) => name !== FIXED_ANCHOR_NAME).map(([name, record]) => {
        const descriptor = record.descriptor;
        const queries = descriptor.queries.map(queryData);
        return {
          name,
          sets: [...schedule.sets].flatMap(
            ([setName, set]) => set.members.has(name) ? [setName] : []
          ),
          before: (descriptor.before ?? []).map((reference) => referenceName(reference)),
          after: (descriptor.after ?? []).map((reference) => referenceName(reference)),
          queries,
          resources: []
        };
      });
      const systemSets = [...schedule.sets].map(([name, set]) => ({
        name,
        members: [...set.members].filter((member) => schedule.systems.has(member)),
        before: [],
        after: [],
        chained: set.chained
      }));
      const dependencies = [...schedule.predecessors].flatMap(
        ([target, predecessors]) => [...predecessors].map((source) => [source, target])
      );
      return { name: token.name, systems, systemSets, dependencies };
    }
  );
}
function queryUsesComponent(query, component) {
  return [
    query.read,
    query.write,
    query.optional,
    query.with,
    query.without,
    query.changed,
    query.added
  ].some((items) => items?.includes(component) === true);
}
function worldScheduleUsesComponent(world, component) {
  for (const schedule of world[worldInternal].getSchedules().values()) {
    for (const record of schedule.systems.values()) {
      if (record.descriptor.queries.some((query) => queryUsesComponent(query, component)))
        return true;
    }
  }
  return false;
}

// src/world-storage-primitives.ts
function detachWorldInspection(snapshot) {
  return freezeInspection(snapshot);
}
function freezeInspection(value) {
  if (value === null || typeof value !== "object" && typeof value !== "function") {
    return value;
  }
  for (const key of Reflect.ownKeys(value)) {
    const child = value[key];
    if (child !== null && (typeof child === "object" || typeof child === "function")) {
      freezeInspection(child);
    }
  }
  return Object.freeze(value);
}
function elementByteSize(elementType) {
  const key = fieldTypeToMetaKey(elementType);
  return TYPE_METADATA[key].byteSize;
}
function reinterpretSlotBytes(bytes, elementType, elementCount) {
  return reinterpretBufferRegion(bytes.buffer, bytes.byteOffset, elementType, elementCount);
}
function reinterpretBufferRegion(buffer, byteOffset, elementType, elementCount) {
  if (elementType.startsWith("shared<")) {
    return new Uint32Array(buffer, byteOffset, elementCount);
  }
  switch (elementType) {
    case "f32":
      return new Float32Array(buffer, byteOffset, elementCount);
    case "f64":
      return new Float64Array(buffer, byteOffset, elementCount);
    case "i32":
      return new Int32Array(buffer, byteOffset, elementCount);
    case "u32":
    case "enum":
    case "ref":
    case "entity":
      return new Uint32Array(buffer, byteOffset, elementCount);
    case "i16":
      return new Int16Array(buffer, byteOffset, elementCount);
    case "u16":
      return new Uint16Array(buffer, byteOffset, elementCount);
    case "i8":
      return new Int8Array(buffer, byteOffset, elementCount);
    case "u8":
    case "bool":
      return new Uint8Array(buffer, byteOffset, elementCount);
  }
  return new Uint32Array(buffer, byteOffset, elementCount);
}
function writeArrayElementAt(bytes, idx, elementType, value) {
  const buf = bytes.buffer;
  const offset = bytes.byteOffset;
  const byteLen = bytes.byteLength;
  switch (elementType) {
    case "f32":
      new Float32Array(buf, offset, byteLen >>> 2)[idx] = value;
      return;
    case "f64":
      new Float64Array(buf, offset, byteLen >>> 3)[idx] = value;
      return;
    case "i32":
      new Int32Array(buf, offset, byteLen >>> 2)[idx] = value;
      return;
    case "u32":
    case "enum":
    case "ref":
    case "entity":
      new Uint32Array(buf, offset, byteLen >>> 2)[idx] = value;
      return;
    case "i16":
      new Int16Array(buf, offset, byteLen >>> 1)[idx] = value;
      return;
    case "u16":
      new Uint16Array(buf, offset, byteLen >>> 1)[idx] = value;
      return;
    case "i8":
      new Int8Array(buf, offset, byteLen)[idx] = value;
      return;
    case "u8":
    case "bool":
      new Uint8Array(buf, offset, byteLen)[idx] = value;
      return;
  }
}
function readArrayElementAt(bytes, idx, elementType) {
  const buf = bytes.buffer;
  const offset = bytes.byteOffset;
  const byteLen = bytes.byteLength;
  if (elementType.startsWith("shared<")) {
    return new Uint32Array(buf, offset, byteLen >>> 2)[idx] ?? 0;
  }
  switch (elementType) {
    case "f32":
      return new Float32Array(buf, offset, byteLen >>> 2)[idx] ?? 0;
    case "f64":
      return new Float64Array(buf, offset, byteLen >>> 3)[idx] ?? 0;
    case "i32":
      return new Int32Array(buf, offset, byteLen >>> 2)[idx] ?? 0;
    case "u32":
    case "enum":
    case "ref":
    case "entity":
      return new Uint32Array(buf, offset, byteLen >>> 2)[idx] ?? 0;
    case "i16":
      return new Int16Array(buf, offset, byteLen >>> 1)[idx] ?? 0;
    case "u16":
      return new Uint16Array(buf, offset, byteLen >>> 1)[idx] ?? 0;
    case "i8":
      return new Int8Array(buf, offset, byteLen)[idx] ?? 0;
    case "u8":
    case "bool":
      return new Uint8Array(buf, offset, byteLen)[idx] ?? 0;
  }
  return 0;
}

// src/world.ts
var World = class {
  [worldRead];
  // ── Internal state ──
  /** World-local state is kept together so one owner closes each mutation. */
  executionState = healthyWorldExecutionState(createWorldIdentity());
  graph;
  records = [];
  freeIndices = [];
  /** BufferPool for schema-declared variable buffers and arrays. */
  bufferPool = new BufferPool();
  /** Per-World managed unique-ref store used by lifecycle mutations. */
  uniqueRefs = new UniqueRefStore();
  /** Per-World shared-ref store; public read-only for direct handle operations. */
  sharedRefs = new SharedRefStore();
  componentMutationEpochs = [];
  /** One packed reverse index per relationship source component. */
  relationshipIndexes = /* @__PURE__ */ new Map();
  mutationEpoch = 0;
  structureEpoch = 0;
  /** Keep identity as a prototype getter; it is a diagnostic capability, not enumerable state. */
  get identity() {
    return this.executionState.identity;
  }
  /** Plugin-owned component discovery scoped to this World and removed through leases. */
  components = new ComponentCatalog((component) => this.componentIsInUse(component));
  /** DAG schedules for the two built-in execution scopes. */
  schedules = /* @__PURE__ */ new Map([
    [Update, createSchedule(Update)],
    [FixedUpdate, createSchedule(FixedUpdate)]
  ]);
  /** Resource store: typed key-value global singletons. */
  resources = createResourceStore();
  clock;
  /** Remainder carried between fixed-step runs. */
  fixedAccumulator = 0;
  constructor(options = {}) {
    this.graph = createArchetypeGraph(options.storage === "shared");
    this.clock = createWorldClock({ ...DEFAULT_TIME_POLICY, ...options.time });
    this.resources.entries.set(TIME_RESOURCE_KEY, {
      value: this.clock.time,
      added: 0,
      changed: 0
    });
    this.resources.entries.set(FIXED_TIME_RESOURCE_KEY, {
      value: this.clock.fixed,
      added: 0,
      changed: 0
    });
    this[worldInternal] = {
      allocatePendingEntity: this.allocatePendingEntity.bind(this),
      cancelPendingEntity: this.cancelPendingEntity.bind(this),
      getArrayView: this.getArrayView.bind(this),
      getBufferPool: () => this.bufferPool,
      getClockWriter: () => this.clock.writer,
      getComponentChange: this.internalgetComponentChange.bind(this),
      getComponentMutationEpochs: () => this.componentMutationEpochs,
      getEntityArchetype: this.internalgetEntityArchetype.bind(this),
      getFixedAccumulator: () => this.fixedAccumulator,
      getGraph: () => this.graph,
      getMutationEpoch: () => this.mutationEpoch,
      getQueryRow: (entity, component) => this.get(entity, component),
      getRecords: () => this.records,
      getRelationshipEpoch: (component) => this.relationshipIndexes.get(componentId(component))?.epoch ?? 0,
      getRelationshipTargetEntities: this.relationshipTargetEntries.bind(this),
      getResources: () => this.resources,
      getSchedule: (token) => this.schedules.get(token),
      getSchedules: () => this.schedules,
      getSharedRefs: () => this.sharedRefs,
      getStructureEpoch: this.getStructureEpoch.bind(this),
      lookupAlive: this.lookupAlive.bind(this),
      markComponentChanged: this.internalmarkComponentChanged.bind(this),
      markComponentRangeChanged: this.internalmarkComponentRangeChanged.bind(this),
      materializeEntity: this.materializeEntity.bind(this),
      materializePendingEntity: this.materializePendingEntity.bind(this),
      nextMutationEpoch: this.internalnextMutationEpoch.bind(this),
      poisonExecution: this.internalpoisonExecution.bind(this),
      publishDerivedRange: this.internalpublishDerivedRange.bind(this),
      preflightComponentData: this.preflightComponentData.bind(this),
      readRow: this.readRow.bind(this),
      recordIsLive: this.recordIsLive.bind(this),
      routeError: this.routeError.bind(this),
      restoreMutationEpoch: this.internalrestoreMutationEpoch.bind(this),
      setFixedAccumulator: (value) => {
        this.fixedAccumulator = value;
      },
      setQueryRow: this.internalsetQueryRow.bind(this)
    };
    this[worldRead] = {
      getFieldValue: this.internalgetFieldValue.bind(this),
      getArrayLength: this.internalgetArrayLength.bind(this),
      getArrayElement: this.internalgetArrayElement.bind(this)
    };
  }
  /** Immutable integrity state for execution coordinators and headless callers. */
  get execution() {
    return this.executionState;
  }
  /** Resolve a schedule token owned by this World realm without package singleton identity. */
  scheduleToken(name) {
    if (name === "Update") return Update;
    if (name === "FixedUpdate") return FixedUpdate;
    return FixedUpdate;
  }
  /** Seal the first execution fault; application code recovers with a new World. */
  internalpoisonExecution(fault) {
    if (this.executionState.health === "healthy") {
      this.executionState = poisonedWorldExecutionState(this.identity, fault);
    }
  }
  /**
   * A poisoned identity is diagnostic evidence, not a mutable recovery path.
   * Public entity mutation therefore returns the same structured fence as
   * `update()` instead of allocating a new reservation or touching a partial
   * row. Recovery remains construction of a fresh World.
   */
  poisonedResult() {
    if (this.executionState.health !== "poisoned") return void 0;
    return err(new WorldPoisonedError(this.identity, this.executionState.fault));
  }
  query(descriptor) {
    return createQuery(this, descriptor);
  }
  // ──────────────────────────────────────────────────────────────────────────
  // Internal access — query engine
  // ──────────────────────────────────────────────────────────────────────────
  componentIsInUse(component) {
    if (this.graph.archetypes.some(
      (archetype) => archetype.size > 0 && archetype.components.some((candidate) => candidate === component)
    )) {
      return true;
    }
    return worldScheduleUsesComponent(this, component);
  }
  /** Resolve current logical identity for a packed entity handle. */
  internalgetEntityArchetype(entity) {
    const record = this.records[entityIndex(entity)];
    if (!this.recordIsLive(record, entityGeneration(entity))) return void 0;
    return this.graph.archetypes[record.archetypeId];
  }
  /** Component change state for query filters. */
  internalgetComponentChange(entity, componentId2) {
    const record = this.records[entityIndex(entity)];
    if (!this.recordIsLive(record, entityGeneration(entity))) return void 0;
    return readComponentChange(this.graph, record, entity, componentId2);
  }
  /** Allocate one epoch after a mutation has succeeded. */
  internalnextMutationEpoch() {
    if (this.mutationEpoch >= Number.MAX_SAFE_INTEGER) {
      throw new ChangeEpochExhaustedError(this.mutationEpoch);
    }
    this.mutationEpoch += 1;
    return this.mutationEpoch;
  }
  internalrestoreMutationEpoch(epoch) {
    this.mutationEpoch = epoch;
  }
  internalpublishDerivedRange(table, componentId2, rowStart, rowCount, epoch) {
    const epochs = table.storage.get(componentId2)?.epochs;
    if (epochs === void 0) {
      throw new Error(`Derived component ${componentId2} is not in the table.`);
    }
    publishComponentRange(epochs, rowStart, rowCount, epoch);
    this.componentMutationEpochs[componentId2] = epoch;
  }
  /** Record one successful structural mutation. */
  advanceStructureEpoch() {
    this.structureEpoch += 1;
  }
  /** Current structural revision for mounted World projections. */
  getStructureEpoch() {
    return this.structureEpoch;
  }
  /** Mark one mutation's component instances with a shared epoch. */
  internalmarkComponentsAdded(entity, componentIds) {
    const record = this.records[entityIndex(entity)];
    if (!this.recordIsLive(record, entityGeneration(entity))) return;
    const epoch = this.internalnextMutationEpoch();
    markComponentsAdded(this.graph, record, entity, componentIds, epoch);
    for (const componentId2 of componentIds) {
      this.componentMutationEpochs[componentId2] = epoch;
    }
  }
  /** Mark an existing component as changed at the current tick. */
  internalmarkComponentChanged(entity, componentId2) {
    const record = this.records[entityIndex(entity)];
    if (!this.recordIsLive(record, entityGeneration(entity))) return;
    let epoch;
    markComponentChanged(this.graph, record, entity, componentId2, () => {
      epoch = this.internalnextMutationEpoch();
      return epoch;
    });
    if (epoch !== void 0) {
      this.componentMutationEpochs[componentId2] = epoch;
    }
  }
  /** Mark one contiguous component range with a single epoch. */
  internalmarkComponentRangeChanged(table, componentId2, rowStart, rowCount) {
    const epochs = table.storage.get(componentId2)?.epochs;
    if (epochs === void 0 || rowCount === 0) return;
    const epoch = this.internalnextMutationEpoch();
    publishComponentRange(epochs, rowStart, rowCount, epoch);
    this.componentMutationEpochs[componentId2] = epoch;
  }
  /** Query facade write after the facade has already marked evidence. */
  internalsetQueryRow(entity, component, value) {
    const result = this.set(entity, component, value, false);
    if (result.ok && relationshipRole(component)?.kind === "source") {
      this.markComponentChanged(entity, component);
    }
    return result;
  }
  /** Return resource change ticks for diagnostics and resource-driven systems. */
  getResourceChange(name) {
    const entry = this.resources.entries.get(name);
    return entry === void 0 ? void 0 : { added: entry.added, changed: entry.changed };
  }
  /** Route an expected internal failure through the host-owned error channel. */
  routeError(err11, ctx) {
    console.error(`[${ctx?.systemName ?? "World"}]`, err11);
  }
  // ──────────────────────────────────────────────────────────────────────────
  // System registration + update (M3)
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Register a system with query descriptor and optional ordering constraints.
   *
   * `const Qs` mirrors the free `addSystem` signature so the call-site
   * `queries` tuple is locked literal-form, letting `descriptor.fn`'s first
   * parameter recover per-query row access shapes (S-5, KD-3 — class method
   * generic, not free function double track).
   *
   * @example
   * ```ts
   * const Position = defineComponent('Position', { x: 'f32', y: 'f32' });
   * const world = new World();
   * world.addSystem(Update, {
   *   name: 'read-pos',
   *   queries: [{ with: [Position] }],
   *   fn: (world, queries) => { void world; for (const row of queries[0]) { void row.entity; } },
   * });
   * ```
   */
  addSystem(schedule, descriptor) {
    return worldAddSystem(this, schedule, descriptor);
  }
  /**
   * Remove a registered system by name (M2 — plan-strategy D-3).
   *
   * Returns `Result<void, ScheduleMutationError>`:
   * - ok branch: the slot is dropped and the schedule will rebuild on the
   *   next `update()`.
   * - err branch with `.code === 'system-before-unknown'`: no system carries
   *   this name; `.detail.candidates` lists the registered names.
   *
   * Designed to support `@forgeax/engine-remote`'s typed `injectSystem` /
   * `removeSystem` channel and the WS-disconnect reverse-remove path.
   *
   * @example
   * ```ts
   * const r = world.removeSystem(Update, 'movement');
   * if (!r.ok) console.error(r.error.code, r.error.detail.candidates);
   * ```
   */
  removeSystem(schedule, name) {
    return worldRemoveSystem(this, schedule, name);
  }
  /**
   * Replace a registered system in-place (M2 — plan-strategy D-3 atomic semantics).
   *
   * Overwrites the descriptor stored under `name` while preserving the
   * registration slot — `before / after` references that target this name
   * remain bound.
   *
   * Returns `Result<void, ScheduleMutationError>`:
   * - ok branch: descriptor swapped, schedule marked dirty.
   * - err branch with `.code === 'system-before-unknown'`: no system carries
   *   this name; use `addSystem(descriptor)` to register a new one instead.
   *
   * @example
   * ```ts
   * const r = world.replaceSystem(Update, 'movement', {
   *   name: 'movement',
   *   queries: [{ with: [Position] }],
   *   fn: (world, queryResults) => { ... },
   * });
   * ```
   */
  replaceSystem(schedule, name, descriptor) {
    return worldReplaceSystem(this, schedule, name, descriptor);
  }
  /**
   * Batch-register systems to a set. Validates the set token before writing.
   *
   * - First call for a system name: registers it via the existing `addSystem` path.
   * - Subsequent calls: only adds the system name to the set's members (dedup).
   *
   * Returns `Result.err` with `SystemSetNotRegisteredError` if the set token
   * fails identity validation.
   *
   * @example
   * ```ts
   * const GameplaySet = defineSystemSet({ name: 'gameplay' });
   * const world = new World();
   * const r = world.addSystems(Update, GameplaySet, [movement, collision]);
   * if (!r.ok) console.error(r.error.code, r.error.hint);
   * ```
   */
  addSystems(schedule, set, systems) {
    return worldAddSystems(this, schedule, set, systems);
  }
  /**
   * Execute one frame: run all systems in DAG order, then flush deferred commands.
   * Empty world (no systems) completes silently (E-09).
   *
   * @example
   * ```ts
   * const Position = defineComponent('Position', { x: 'f32', y: 'f32' });
   * const world = new World();
   * world.spawn({ component: Position, data: { x: 0, y: 0 } }).unwrap();
   * world.update(); // run all systems + flush commands
   * ```
   */
  update(deltaSeconds = 0) {
    return worldUpdate(this, deltaSeconds);
  }
  // ──────────────────────────────────────────────────────────────────────────
  // Resource CRUD (M3)
  // ──────────────────────────────────────────────────────────────────────────
  /** Insert or overwrite a resource (idempotent, E-13). */
  insertResource(key, value) {
    worldInsertResource(this, key, value);
  }
  getResource(key) {
    return worldGetResource(this, key);
  }
  /** Check if a resource exists. */
  hasResource(key) {
    return worldHasResource(this, key);
  }
  /** Remove a resource by key. */
  removeResource(key) {
    worldRemoveResource(this, key);
  }
  // ──────────────────────────────────────────────────────────────────────────
  // Inspection / diagnostics (M4)
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Return a typed diagnostic snapshot of the World state.
   * All fields are non-undefined. Useful for AI users to programmatically
   * introspect entity count, archetypes, registered components, systems,
   * and resources without console.log or a debugger.
   *
   * @example
   * ```ts
   * const Position = defineComponent('Position', { x: 'f32', y: 'f32' });
   * const world = new World();
   * world.spawn({ component: Position, data: { x: 0, y: 0 } }).unwrap();
   * const snap = world.inspect();
   * console.log(snap.entityCount, snap.activeComponents);
   * ```
   */
  inspect() {
    return detachWorldInspection(worldInspect(this));
  }
  /** Read the actual component vocabulary of one live entity, including sparse tags. */
  componentsOf(entity) {
    const record = this.lookupAlive(entity, "componentsOf");
    if (!record.ok) return record;
    return ok([...this.graph.archetypes[record.value.archetypeId]?.components ?? []]);
  }
  /** Return the registered schedule graphs and their declared access metadata. */
  scheduleData() {
    return worldScheduleData(this);
  }
  // ──────────────────────────────────────────────────────────────────────────
  // Managed-ref public API (feat-20260528-rapier-physics M1 / t4)
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Allocate a standalone managed reference handle with an optional release
   * callback. Returns a branded {@link Handle}<Target, 'unique'> that can be
   * stored in schema-vocab `ref<T>` fields or resolved through
   * {@link UniqueRefStore.resolve} (via `world.get` on a component with
   * `ref<T>` fields).
   *
   * When the handle is released (despawn / removeComponent / set-overwrite),
   * the `onRelease` callback fires with the payload (captured on the stack);
   * by then the slot's bookkeeping (callback table, payload map, freelist) is
   * already cleared, so a *throwing* `onRelease` re-propagates from the first
   * `release` call without leaving the store inconsistent — a second `release`
   * of the same handle returns `UniqueRefDoubleReleaseError` as expected. RAII
   * cleanup semantics preserved (plan-strategy D-5; throw-safety AC-01/02).
   *
   * Handles are *operational, not persistent*: caching them across release
   * boundaries (despawn / removeComponent / set-overwrite) is undefined
   * behavior — the same `u32` may silently resolve to a freshly allocated
   * payload after slot reuse. See `packages/ecs/README.md` § "Managed handles
   * are operational, not persistent" and `docs/specs/2026-06-14-ecs-managed-
   * lifecycle-ssot-design.md` § 3.3.
   *
   * @typeParam Target - phantom string branding the handle (type-level only).
   * @typeParam T - the payload type stored alongside the handle.
   * @param target - phantom target string (type-level discriminant).
   * @param payload - the value to store. Identity-stable until release.
   * @param onRelease - optional cleanup hook called with the payload on release.
   * @returns a branded `Handle<Target, 'unique'>` u32.
   *
   * @example
   * ```ts
   * const world = new World();
   * const handle = world.allocUniqueRef<'PhysicsBody', RigidBodyHandle>(
   *   'PhysicsBody',
   *   rapierHandle,
   *   (h) => rapierWorld.removeRigidBody(h),
   * );
   * const Holder = defineComponent('Holder', { body: 'unique<PhysicsBody>' });
   * world.spawn(Holder, { body: handle });
   * // Despawn triggers onRelease -> Rapier body is cleaned up.
   * ```
   */
  allocUniqueRef(target, payload, onRelease) {
    return this.uniqueRefs.alloc(target, payload, onRelease);
  }
  /**
   * Allocate a shared (refcount-tracked) handle through the per-World
   * {@link SharedRefStore}. Returns a `Handle<Target, 'shared'>` u32 with
   * rc=1 (the alloc-grant). Consumers retain/release via `world.sharedRefs`.
   *
   * Final release publishes structured evidence through the owning
   * {@link SharedRefStore}; payload disposal remains with the
   * renderer/assets/plugin owner and is not a user callback.
   *
   * Intended for asset-registry-style producers — anything whose lifecycle
   * is shared across multiple holders (ECS components + external systems).
   * The single-holder one-shot release pattern stays on
   * {@link World.allocUniqueRef} (`Handle<T, 'unique'>`).
   *
   * @typeParam Target - phantom string branding the handle (type-level only).
   * @typeParam T - the payload type stored alongside the handle.
   * @param target - phantom target string (type-level discriminant).
   * @param payload - the value to store. Identity-stable until final release.
   * @returns a branded `Handle<Target, 'shared'>` u32 with rc=1.
   *
   * @example
   * ```ts
   * const world = new World();
   * const handle = world.allocSharedRef<'MaterialAsset', MaterialPayload>(
   *   'MaterialAsset',
   *   payload,
   * );
   * const M = defineComponent('M', { asset: 'shared<MaterialAsset>' });
   * world.spawn({ component: M, data: { asset: handle } });
   * // The write-barrier dispatch retains/releases automatically on spawn / despawn.
   * ```
   */
  allocSharedRef(target, payload) {
    return this.sharedRefs.alloc(target, payload);
  }
  /**
   * Return one producer-owned shared handle per `(target, payload object)` in
   * this World. Repeated discovery does not retain; ECS holders still retain
   * and release through the normal write barrier. Asset catalogues use this
   * when repeated scene instantiation resolves the same catalogued payload.
   * Use {@link World.allocSharedRef} for independent resources or deleters.
   */
  internSharedRef(target, payload) {
    return this.sharedRefs.intern(target, payload);
  }
  // ──────────────────────────────────────────────────────────────────────────
  // ──────────────────────────────────────────────────────────────────────────
  // Component access and storage — World owns mutation state and coordination.
  // Independent table/column algorithms remain private methods so all mutation
  // paths share one state owner and publication boundary.
  // ──────────────────────────────────────────────────────────────────────────
  relationshipTargetWriteError(component, operation) {
    return err(new RelationshipTargetReadonlyError(component.name, operation));
  }
  relationshipTargetPayloadWrites(data) {
    return Object.values(data).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (ArrayBuffer.isView(value)) return value.byteLength > 0;
      return true;
    });
  }
  /** Test live component presence without constructing a Result error. */
  hasComponent(entity, component) {
    const archetype = this.internalgetEntityArchetype(entity);
    return archetype?.components.some(
      (candidate) => componentId(candidate) === componentId(component)
    ) === true;
  }
  table(archetype) {
    return getTable(this.graph, archetype.tableId);
  }
  tableRow(record) {
    return this.graph.archetypes[record.archetypeId]?.rows[record.archetypeRow] ?? -1;
  }
  markComponentChanged(entity, component) {
    this.internalmarkComponentChanged(entity, componentId(component));
  }
  relationshipIndex(component) {
    if (relationshipRole(component)?.kind !== "source") return void 0;
    let index = this.relationshipIndexes.get(componentId(component));
    if (index === void 0) {
      index = new RelationshipIndex();
      this.relationshipIndexes.set(componentId(component), index);
    }
    return index;
  }
  /** Read the World-owned materialized target array; never consults a shadow list. */
  relationshipTargetEntries(source, target) {
    const role = relationshipRole(source);
    if (role?.kind !== "source") return [];
    const mirror = relationshipMirror(source);
    if (mirror === void 0) return [];
    return this.getArrayView(target, mirror, role.targetField) ?? [];
  }
  /** Read a relationship target length without materialising its array view. */
  relationshipTargetLength(source, target) {
    const role = relationshipRole(source);
    if (role?.kind !== "source") return 0;
    const mirror = relationshipMirror(source);
    if (mirror === void 0) return 0;
    return this.internalgetArrayLength(target, mirror, role.targetField) ?? 0;
  }
  relationshipTargetEntity(component, value) {
    for (const [fieldName, fieldType] of Object.entries(componentSchema(component))) {
      if (isEntityField(fieldType)) {
        const raw = value[fieldName];
        if (raw === null || raw === void 0) return null;
        const asNum = raw;
        if (asNum === ENTITY_NULL_RAW) return null;
        return asNum;
      }
    }
    return null;
  }
  preflightComponentFieldValues(holder, componentData) {
    const data = componentData.data;
    const arrayError = validateManagedArrayValues(componentData.component, data);
    if (arrayError !== null) return err(arrayError);
    const sharedError = validateSharedFieldValues(componentData.component, data);
    if (sharedError !== null) return err(sharedError);
    const numericError = validateNumericFieldValues(
      componentData.component,
      data,
      holder === null ? void 0 : holder
    );
    if (numericError !== null) return err(numericError);
    return ok(void 0);
  }
  /**
   * Validate one structural component payload without touching archetypes,
   * columns, relationship mirrors, epochs, or managed-reference stores.
   * CommandBuffer uses this same owner-level gate as the direct World facade;
   * the optional pending set lets a batch refer to an entity reserved earlier
   * in that batch without mistaking it for a stale live handle.
   */
  preflightComponentData(holder, componentData, pendingEntities, unavailableEntities) {
    const data = componentData.data;
    const keyError = validateComponentDataKeys(componentData.component, data);
    if (keyError !== null) return err(keyError);
    const valuePreflight = this.preflightComponentFieldValues(holder, componentData);
    if (!valuePreflight.ok) return valuePreflight;
    if (isRelationshipTarget(componentData.component) && this.relationshipTargetPayloadWrites(data)) {
      return err(new RelationshipTargetReadonlyError(componentData.component.name, "command"));
    }
    const filled = fillComponentDefaults(componentData.component, data);
    const enumError = validateEnumFieldValues(
      componentData.component,
      filled,
      holder === null ? void 0 : holder
    );
    if (enumError !== null) return err(enumError);
    const role = relationshipRole(componentData.component);
    if (role?.kind !== "source") return ok(void 0);
    const target = this.relationshipTargetEntity(componentData.component, filled);
    if (target === null) return ok(void 0);
    const targetRaw = target;
    if (unavailableEntities?.has(targetRaw) === true) {
      const targetRecord2 = this.records[entityIndex(target)];
      return err(
        new StaleEntityError(target, entityIndex(target), entityGeneration(target), {
          operation: "relationship-insert",
          component: componentData.component.name,
          expectedGeneration: entityGeneration(target),
          actualGeneration: targetRecord2?.generation ?? -1
        })
      );
    }
    const targetIsPending = pendingEntities?.has(targetRaw) === true;
    const targetRecord = this.records[entityIndex(target)];
    const actualGeneration = targetRecord?.generation ?? -1;
    const targetLive = this.recordIsLive(targetRecord, entityGeneration(target));
    const holderIsPending = holder === null || pendingEntities?.has(holder) === true;
    if (!targetIsPending && !targetLive && !holderIsPending) {
      return err(
        new StaleEntityError(target, entityIndex(target), entityGeneration(target), {
          operation: "relationship-insert",
          component: componentData.component.name,
          expectedGeneration: entityGeneration(target),
          actualGeneration
        })
      );
    }
    if (holder === null || pendingEntities?.has(holder) === true) {
      return ok(void 0);
    }
    const roleAllowsSelf = role?.kind === "source" && role.allowSelf;
    if (holder === target && !roleAllowsSelf) {
      return err(
        new RelationshipSelfCycleError(
          componentData.component.name,
          holder,
          target
        )
      );
    }
    const cycleHit = holder === target && roleAllowsSelf ? null : this.relationshipCycleHit(componentData.component, target, holder);
    if (cycleHit !== null) {
      return err(
        new RelationshipSelfCycleError(
          componentData.component.name,
          holder,
          cycleHit
        )
      );
    }
    return ok(void 0);
  }
  relationshipCycleHit(holderComponent, start, holder) {
    const visited = /* @__PURE__ */ new Set();
    let current = start;
    while (true) {
      if (current === holder) return current;
      const raw = current;
      if (visited.has(raw)) return null;
      visited.add(raw);
      const record = this.records[entityIndex(current)];
      if (!this.recordIsLive(record, entityGeneration(current))) return null;
      const archetype = this.graph.archetypes[record.archetypeId];
      if (!archetype?.components.some(
        (candidate) => componentId(candidate) === componentId(holderComponent)
      )) {
        return null;
      }
      const value = this.readRow(archetype, holderComponent, this.tableRow(record));
      const next = this.relationshipTargetEntity(holderComponent, value);
      if (next === null) return null;
      current = next;
    }
  }
  /**
   * Commit a relationship source through its owner-specific write path.
   * Relationship sources have one entity field, so dispatching before the
   * generic field loop avoids paying the ordinary component-field traversal on
   * every hierarchy reparent while keeping mirror/index publication here.
   */
  setRelationshipSource(entity, component, value, record, arch, markChanged) {
    const role = relationshipRole(component);
    if (role?.kind !== "source") return ok(void 0);
    const row = this.tableRow(record);
    const currentValue = this.readRow(arch, component, row);
    const valuePreflight = this.preflightComponentFieldValues(entity, {
      component,
      data: value
    });
    if (!valuePreflight.ok) return valuePreflight;
    const mergedValue = {
      ...currentValue,
      ...value
    };
    const enumError = validateEnumFieldValues(component, mergedValue, entity);
    if (enumError !== null) return err(enumError);
    const oldRelationshipTarget = this.relationshipTargetEntity(component, currentValue);
    const nextRelationshipTarget = this.relationshipTargetEntity(component, mergedValue);
    const relationshipChanged = oldRelationshipTarget !== nextRelationshipTarget;
    let preparedMirrorAdded;
    if (relationshipChanged && nextRelationshipTarget !== null) {
      const targetRecord = this.records[entityIndex(nextRelationshipTarget)];
      const actualGeneration = targetRecord?.generation ?? -1;
      if (!this.recordIsLive(targetRecord, entityGeneration(nextRelationshipTarget))) {
        return err(
          new StaleEntityError(
            nextRelationshipTarget,
            entityIndex(nextRelationshipTarget),
            entityGeneration(nextRelationshipTarget),
            {
              operation: "relationship-insert",
              component: component.name,
              expectedGeneration: entityGeneration(nextRelationshipTarget),
              actualGeneration
            }
          )
        );
      }
      if (entity === nextRelationshipTarget && !role.allowSelf) {
        return err(
          new RelationshipSelfCycleError(
            component.name,
            entity,
            nextRelationshipTarget
          )
        );
      }
      const cycleHit = entity === nextRelationshipTarget ? null : this.relationshipCycleHit(component, nextRelationshipTarget, entity);
      if (cycleHit !== null) {
        return err(
          new RelationshipSelfCycleError(component.name, entity, cycleHit)
        );
      }
      const prepared = this.prepareRelationshipInsert(component, mergedValue);
      if (!prepared.ok) return prepared;
      preparedMirrorAdded = prepared.value;
    }
    if (relationshipChanged && oldRelationshipTarget !== null) {
      const removed = this.relationshipOnRemove(entity, component, currentValue);
      if (!removed.ok) {
        this.poisonAfterEntityMutation("World.set", removed.error);
        return removed;
      }
    }
    if (relationshipChanged && nextRelationshipTarget !== null) {
      const inserted = this.relationshipOnInsert(
        entity,
        component,
        mergedValue,
        preparedMirrorAdded
      );
      if (!inserted.ok) {
        this.poisonAfterEntityMutation("World.set", inserted.error);
        return inserted;
      }
    }
    const fieldCols = this.table(arch).storage.get(componentId(component))?.fields;
    const sourceColumn = fieldCols?.get(role.sourceField);
    if (sourceColumn === void 0) {
      return err(new ComponentNotPresentError(entity, component.name));
    }
    sourceColumn.view[row] = nextRelationshipTarget === null ? ENTITY_NULL_RAW : nextRelationshipTarget;
    if (markChanged) this.markComponentChanged(entity, component);
    return ok(void 0);
  }
  /** Prepare the target side before a source archetype mutation commits. */
  prepareRelationshipInsert(component, value) {
    const role = relationshipRole(component);
    if (role?.kind !== "source") return ok(false);
    const target = this.relationshipTargetEntity(component, value);
    if (target === null) return ok(false);
    const mirror = relationshipMirror(component);
    if (mirror === void 0) return ok(false);
    const targetRec = this.records[entityIndex(target)];
    const actualGeneration = targetRec?.generation ?? -1;
    if (!this.recordIsLive(targetRec, entityGeneration(target))) {
      return err(
        new StaleEntityError(target, entityIndex(target), entityGeneration(target), {
          operation: "relationship-insert",
          component: component.name,
          expectedGeneration: entityGeneration(target),
          actualGeneration
        })
      );
    }
    const targetArch = this.graph.archetypes[targetRec.archetypeId];
    const hasMirror = targetArch?.components.some((candidate) => componentId(candidate) === componentId(mirror)) ?? false;
    let mirrorAdded = false;
    if (!hasMirror) {
      const added = this.addComponentCore(
        target,
        { component: mirror, data: {} },
        true,
        false
      );
      if (!added.ok) return added;
      mirrorAdded = true;
    }
    const length = this.relationshipTargetLength(component, target);
    const capacity = this.ensureArrayCapacity(target, mirror, role.targetField, length + 1);
    if (capacity.ok) return ok(mirrorAdded);
    if (mirrorAdded) {
      const rolledBack = this.removeComponentCore(target, mirror, true);
      if (!rolledBack.ok) {
        this.poisonAfterEntityMutation("World.prepareRelationshipInsert", rolledBack.error);
        return rolledBack;
      }
    }
    return capacity;
  }
  /** Append `holder` to the materialized target list. */
  relationshipOnInsert(holder, component, value, preparedMirrorAdded) {
    const role = relationshipRole(component);
    if (role?.kind !== "source") return ok(void 0);
    const target = this.relationshipTargetEntity(component, value);
    if (target === null) return ok(void 0);
    const mirror = relationshipMirror(component);
    if (mirror === void 0) return ok(void 0);
    let mirrorAdded = preparedMirrorAdded ?? false;
    if (preparedMirrorAdded === void 0) {
      const prepared = this.prepareRelationshipInsert(component, value);
      if (!prepared.ok) {
        if (prepared.error.code === "stale-entity") return ok(void 0);
        return prepared;
      }
      mirrorAdded = prepared.value;
    }
    const targetSlot = entityIndex(target);
    const targetRec = this.records[targetSlot];
    if (!this.recordIsLive(targetRec, entityGeneration(target))) return ok(void 0);
    const targetArch = this.graph.archetypes[targetRec.archetypeId];
    const mirrorLocalId = componentId(mirror);
    const hasMirror = targetArch?.components.some((component2) => componentId(component2) === mirrorLocalId) ?? false;
    if (!hasMirror) {
      const added = this.addComponentCore(
        target,
        {
          component: mirror,
          data: {}
        },
        true,
        false
      );
      if (!added.ok) return added;
      mirrorAdded = true;
    }
    const slot = this.relationshipTargetLength(component, target);
    const mirrored = this.appendArrayElement(target, mirror, role.targetField, holder);
    if (!mirrored.ok) return mirrored;
    this.relationshipIndex(component)?.attach(holder, target, slot);
    if (mirrorAdded) {
      this.internalmarkComponentsAdded(target, [mirrorLocalId]);
      this.advanceStructureEpoch();
    }
    return ok(void 0);
  }
  /** Remove `holder` from the materialized target list. */
  relationshipOnRemove(holder, component, oldValue) {
    const role = relationshipRole(component);
    if (role?.kind !== "source") return ok(void 0);
    const target = this.relationshipTargetEntity(component, oldValue);
    if (target === null) return ok(void 0);
    const mirror = relationshipMirror(component);
    if (mirror === void 0) return ok(void 0);
    const targetSlot = entityIndex(target);
    const targetRec = this.records[targetSlot];
    if (!this.recordIsLive(targetRec, entityGeneration(target))) return ok(void 0);
    const index = this.relationshipIndex(component);
    if (index === void 0) return ok(void 0);
    const slot = index.slotOf(holder);
    if (slot === void 0 || index.targetOf(holder) !== target) return ok(void 0);
    const mirrored = this.removeArrayElementAt(target, mirror, role.targetField, slot);
    if (!mirrored.ok) return mirrored;
    index.detach(holder);
    if (mirrored.value !== void 0) index.updateSlot(mirrored.value, target, slot);
    return ok(void 0);
  }
  linkedSpawnMirrorField(mirror) {
    const source = relationshipSource(mirror);
    const role = source === void 0 ? void 0 : relationshipRole(source);
    return role?.kind === "source" && role.linkedSpawn ? role.targetField : void 0;
  }
  relationshipLinkedSpawnChildren(entity, archetype) {
    const record = this.records[entityIndex(entity)];
    const row = record === void 0 ? -1 : this.tableRow(record);
    const collected = [];
    for (const component of archetype.components) {
      const mirrorField = this.linkedSpawnMirrorField(component);
      if (mirrorField === void 0) continue;
      const snapshot = this.readRow(archetype, component, row);
      const list = snapshot[mirrorField];
      if (!(list instanceof Uint32Array)) continue;
      for (const raw of list) {
        if (raw !== ENTITY_NULL_RAW) collected.push(raw);
      }
    }
    return collected;
  }
  /**
   * Read component data from an entity.
   *
   * **Transient view contract (feat-20260602):** for fixed-capacity
   * `array<T,N>` and `buffer<N>` fields, the returned `TypedArray` (and any
   * subarray of it) aliases the archetype column buffer directly. The view is
   * valid only until the next structural change (`spawn` / `despawn` /
   * `addComponent` / `removeComponent`). Holding a view across a structural
   * change is undefined behaviour -- the backing `ArrayBuffer` is detached on
   * column growth, and swap-remove at the same row index points to the wrong
   * entity. **Re-fetch `world.get(e, C)` on every access.** See
   * `packages/ecs/README.md` Transient view contract section.
   *
   * @returns `Result<ShapeOf<S>, EcsError>` —
   *   `ok(ShapeOf<S>)` on success;
   *   `err(StaleEntityError)` (`.code = 'stale-entity'`) if entity is dead;
   *   `err(ComponentNotPresentError)` (`.code = 'component-not-present'`) if
   *   the entity does not have the component (a never-present component on
   *   this entity degrades to the same `component-not-present` path — there is
   *   no separate "not registered" failure; components are global at
   *   `defineComponent` time).
   *
   * @example
   * ```ts
   * const Position = defineComponent('Position', { x: 'f32', y: 'f32' });
   * const world = new World();
   * const e = world.spawn({ component: Position, data: { x: 1, y: 2 } }).unwrap();
   * const r = world.get(e, Position);
   * if (!r.ok) { return; } // r.error.code === 'stale-entity' on dead handle
   * const pos = r.value;
   * ```
   */
  get(entity, component) {
    const record = this.lookupAlive(entity, "get", component.name);
    if (!record.ok) return record;
    const rec = record.value;
    const arch = this.graph.archetypes[rec.archetypeId];
    if (!arch) {
      return err(
        new StaleEntityError(entity, entityIndex(entity), entityGeneration(entity), {
          operation: "get",
          component: component.name,
          expectedGeneration: entityGeneration(entity),
          actualGeneration: rec.generation
        })
      );
    }
    const localId = componentId(component);
    if (!arch.components.some((candidate) => componentId(candidate) === localId)) {
      return err(new ComponentNotPresentError(entity, component.name));
    }
    return ok(this.readRow(arch, component, this.tableRow(rec)));
  }
  /**
   * Column-level zero-copy view of an `array<T, N>` / `array<T>` field.
   *
   * Resolves the live byte region for `(entity, component, fieldName)`
   * directly at the column level and returns the element-typed TypedArray
   * aliasing it (`view.buffer` is the SSOT byte region; mutations route
   * through `world.set`). Unlike `get`, this does NOT build the
   * `{}` whole-component object nor walk every schema field. Per-frame
   * consumers that need one column (the resolved world mat4) take this path to
   * avoid the `get` overhead (1 `{}` alloc + N-field readRow walk).
   *
   * Fixed `array<T,N>` columns (feat-20260602) store their elements inline, so
   * the view aliases the archetype column buffer directly (no BufferPool
   * indirection); variable `array<T>` columns still alias the BufferPool slot.
   * The returned view's element type follows the schema element type
   * (`array<entity,N>` -> `Uint32Array`, `array<f32,N>` -> `Float32Array`,
   * etc.) -- the prior f32-only early-return gate is removed.
   *
   * **Transient view contract:** the returned `TypedArray` aliases the column
   * buffer and is valid only until the next structural change (`spawn` /
   * `despawn` / `addComponent` / `removeComponent`). Column growth
   * (`growColumn`) detaches the old `ArrayBuffer` via `transfer()`; a
   * swap-remove at the same row index leaves the view pointing to the wrong
   * entity. **Callers must re-fetch `getArrayView` on every access** and must
   * not hold the view across any operation that may cause archetype migration.
   * All existing per-frame consumers (`propagateTransforms` / `render-extract`
   * / `pick`) already conform -- they fetch the view inside a single pass with
   * no intervening structural changes.
   *
   * Returns `undefined` when the entity is dead, the component is absent, the
   * field does not exist, or the field is not an `array<...>` column.
   *
   * Engine-internal fast path; AI users read the typed view through
   * `world.get(e, GlobalTransform).world`. The accessor is the zero-materialization
   * route the propagate kernel and render walk use.
   */
  getArrayView(entity, component, fieldName) {
    const record = this.lookupAlive(entity, "getArrayView", component.name);
    if (!record.ok) return void 0;
    const rec = record.value;
    const arch = this.graph.archetypes[rec.archetypeId];
    if (!arch) return void 0;
    return this.readArrayView(arch, component, this.tableRow(rec), fieldName);
  }
  /**
   * Write (partial) component data to an entity.
   *
   * @returns `Result<void, EcsError>` —
   *   `ok(void)` on success;
   *   `err(StaleEntityError)` (`.code = 'stale-entity'`) if entity is dead;
   *   `err(ComponentNotPresentError)` (`.code = 'component-not-present'`) if
   *   entity does not have the component (F-02: no longer silently ignores).
   *
   * @example
   * ```ts
   * const Position = defineComponent('Position', { x: 'f32', y: 'f32' });
   * const world = new World();
   * const e = world.spawn({ component: Position, data: { x: 0, y: 0 } }).unwrap();
   * const r = world.set(e, Position, { x: 10 });
   * if (!r.ok) { return; } // r.error.code === 'stale-entity' on dead handle
   * r.unwrap();
   * ```
   */
  set(entity, component, value, markChanged = true) {
    const poisoned = this.poisonedResult();
    if (poisoned !== void 0) return poisoned;
    if (isRelationshipTarget(component)) return this.relationshipTargetWriteError(component, "set");
    const record = this.lookupAlive(entity, "set", component.name);
    if (!record.ok) return record;
    const rec = record.value;
    const arch = this.graph.archetypes[rec.archetypeId];
    if (!arch) {
      return err(
        new StaleEntityError(entity, entityIndex(entity), entityGeneration(entity), {
          operation: "set",
          component: component.name,
          expectedGeneration: entityGeneration(entity),
          actualGeneration: rec.generation
        })
      );
    }
    const row = this.tableRow(rec);
    const localId = componentId(component);
    if (!arch.components.some((candidate) => componentId(candidate) === localId)) {
      return err(new ComponentNotPresentError(entity, component.name));
    }
    const relationship = relationshipRole(component);
    if (relationship?.kind === "source") {
      return this.setRelationshipSource(
        entity,
        component,
        value,
        rec,
        arch,
        markChanged
      );
    }
    const valuePreflight = this.preflightComponentFieldValues(entity, {
      component,
      data: value
    });
    if (!valuePreflight.ok) return valuePreflight;
    const enumError = validateEnumFieldValues(component, value, entity);
    if (enumError !== null) return err(enumError);
    if (component.storage === "sparse") {
      if (markChanged) this.markComponentChanged(entity, component);
      return ok(void 0);
    }
    const fieldCols = this.table(arch).storage.get(localId)?.fields;
    if (fieldCols === void 0) {
      throw new Error(`Table storage for ${component.name} does not exist.`);
    }
    for (const fieldName of Object.keys(value)) {
      const col = fieldCols.get(fieldName);
      if (!col) {
        continue;
      }
      const fieldType = componentSchema(component)[fieldName] ?? "";
      if (isManagedField(fieldType)) {
        this.releaseManagedFieldOnRow(arch, component, row, fieldName);
      }
      const raw = value[fieldName];
      if (fieldType === "bool") {
        col.view[row] = raw ? 1 : 0;
      } else if (isEntityField(fieldType)) {
        col.view[row] = raw === null || raw === void 0 ? ENTITY_NULL_RAW : raw;
      } else if (isManagedBufferField(fieldType)) {
        const isFixedBuffer = fieldType !== "buffer";
        const bytes = normalizeBufferWrite(raw);
        if (bytes !== null) {
          if (isFixedBuffer) {
            const expected = bufferFieldByteLength(fieldType);
            if (bytes.byteLength !== expected) {
              return err(new FixedSizeMismatchError(fieldName, expected, bytes.byteLength));
            }
            const arity = col.arity;
            col.view.set(bytes.subarray(0, arity), row * arity);
          } else {
            this.releaseManagedFieldOnRow(arch, component, row, fieldName);
            const allocR = this.bufferPool.alloc(bytes.byteLength);
            if (!allocR.ok) {
              const ctx = {
                systemName: `World.set (${component.name}.${fieldName})`
              };
              this.routeError(allocR.error, ctx);
              col.view[row] = 0;
              continue;
            }
            const slot = allocR.value;
            slot.view.set(bytes);
            col.view[row] = slot.id;
          }
        }
      } else if (fieldType === "string") {
        const text = typeof raw === "string" ? raw : "";
        const handle = this.uniqueRefs.alloc("String", text);
        col.view[row] = unwrapHandle(handle);
      } else {
        const arrayMeta = componentDefinition(component).fields[fieldName]?.arrayMeta;
        if (arrayMeta !== void 0) {
          this.releaseManagedFieldOnRow(arch, component, row, fieldName);
          this.writeArrayField(arch, component, row, fieldName, fieldType, arrayMeta, raw);
        } else {
          col.view[row] = raw;
          if (fieldType.startsWith("shared<") && raw !== 0) {
            this.retainSharedScalarHandle(raw, component.name, fieldName);
          }
        }
      }
    }
    if (markChanged) this.markComponentChanged(entity, component);
    return ok(void 0);
  }
  // ──────────────────────────────────────────────────────────────────────────
  // Internal relationship array maintenance. Public array mutation is always
  // expressed as one `world.set` payload; these helpers only implement the
  // engine-owned target projection and backpointer swap-remove path.
  //
  // Append/remove are engine-owned relationship maintenance only.
  //
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Append `value` to the variable `array<T>` field `fieldName` on `entity`.
   *
   * BufferPool grow is amortized O(1) via the size-class freelist (research
   * Finding 5). Relationship target arrays grow byte-wise.
   *
   * @returns `Result<void, EcsError>` with the normal stale/component errors.
   *
   * The helper is called only by relationship synchronization.
   */
  appendArrayElement(entity, component, fieldName, value) {
    const record = this.lookupAlive(entity, "relationship-append", component.name);
    if (!record.ok) return record;
    const rec = record.value;
    const arch = this.graph.archetypes[rec.archetypeId];
    if (!arch) {
      return err(
        new StaleEntityError(entity, entityIndex(entity), entityGeneration(entity), {
          operation: "relationship-append",
          component: component.name,
          expectedGeneration: entityGeneration(entity),
          actualGeneration: rec.generation
        })
      );
    }
    const row = this.tableRow(rec);
    const localId = componentId(component);
    const fieldCols = this.table(arch).storage.get(localId)?.fields;
    if (!fieldCols) {
      return err(new ComponentNotPresentError(entity, component.name));
    }
    const col = fieldCols.get(fieldName);
    if (!col) return err(new ComponentNotPresentError(entity, component.name));
    const arrayMeta = componentDefinition(component).fields[fieldName]?.arrayMeta;
    if (arrayMeta === void 0) {
      return err(new ComponentNotPresentError(entity, component.name));
    }
    const meta = TYPE_METADATA[arrayMeta.elementType];
    if (!meta) return err(new ComponentNotPresentError(entity, component.name));
    const elementBytes = meta.byteSize;
    const slotId = col.view[row];
    const countCol = fieldCols.get(arrayCountColumnName(fieldName));
    if (countCol === void 0) {
      return err(new ComponentNotPresentError(entity, component.name));
    }
    const count = countCol.view[row];
    const newCount = count + 1;
    const newByteLength = newCount * elementBytes;
    let liveSlotId = slotId;
    if (liveSlotId === 0) {
      const allocR = this.bufferPool.alloc(newByteLength);
      if (!allocR.ok) return err(allocR.error);
      liveSlotId = allocR.value.id;
      col.view[row] = liveSlotId;
    } else {
      if (newByteLength > this.bufferPool.view(liveSlotId).byteLength) {
        const growR = this.bufferPool.grow(liveSlotId, newByteLength);
        if (!growR.ok) return err(growR.error);
      }
    }
    const liveBytes = this.bufferPool.view(liveSlotId);
    writeArrayElementAt(liveBytes, count, arrayMeta.elementType, value);
    countCol.view[row] = newCount;
    this.markComponentChanged(entity, component);
    return ok(void 0);
  }
  ensureArrayCapacity(entity, component, fieldName, minimum) {
    const record = this.lookupAlive(entity, "relationship-capacity", component.name);
    if (!record.ok) return record;
    const rec = record.value;
    const arch = this.graph.archetypes[rec.archetypeId];
    if (!arch) {
      return err(
        new StaleEntityError(entity, entityIndex(entity), entityGeneration(entity), {
          operation: "relationship-capacity",
          component: component.name,
          expectedGeneration: entityGeneration(entity),
          actualGeneration: rec.generation
        })
      );
    }
    const row = this.tableRow(rec);
    const fieldCols = this.table(arch).storage.get(componentId(component))?.fields;
    if (!fieldCols) return err(new ComponentNotPresentError(entity, component.name));
    const col = fieldCols.get(fieldName);
    if (!col) return err(new ComponentNotPresentError(entity, component.name));
    const arrayMeta = componentDefinition(component).fields[fieldName]?.arrayMeta;
    if (arrayMeta === void 0) {
      return err(new ComponentNotPresentError(entity, component.name));
    }
    const meta = TYPE_METADATA[arrayMeta.elementType];
    if (!meta?.byteSize) {
      return err(new ComponentNotPresentError(entity, component.name));
    }
    const maximum = Math.floor(262144 / meta.byteSize);
    if (!Number.isSafeInteger(minimum) || minimum < 0 || minimum > maximum) {
      return err(new ManagedBufferOutOfBoundsError(minimum, maximum));
    }
    const byteLength = minimum * meta.byteSize;
    const slotId = col.view[row];
    if (slotId === 0) {
      if (minimum === 0) return ok(void 0);
      const allocated = this.bufferPool.alloc(byteLength);
      if (!allocated.ok) return allocated;
      col.view[row] = allocated.value.id;
      return ok(void 0);
    }
    if (this.bufferPool.view(slotId).byteLength >= byteLength) return ok(void 0);
    const grown = this.bufferPool.grow(slotId, byteLength);
    return grown.ok ? ok(void 0) : grown;
  }
  /**
   * Remove one variable-array element at a known slot. Relationship holders
   * supply the slot from their backpointer, so this is O(1) and never scans
   * the materialized target array.
   */
  removeArrayElementAt(entity, component, fieldName, slot) {
    const record = this.lookupAlive(entity, "removeArrayElementAt", component.name);
    if (!record.ok) return record;
    const rec = record.value;
    const arch = this.graph.archetypes[rec.archetypeId];
    if (!arch) return err(new ComponentNotPresentError(entity, component.name));
    const fieldCols = this.table(arch).storage.get(componentId(component))?.fields;
    if (!fieldCols) return err(new ComponentNotPresentError(entity, component.name));
    const col = fieldCols.get(fieldName);
    const arrayMeta = componentDefinition(component).fields[fieldName]?.arrayMeta;
    const countCol = fieldCols.get(arrayCountColumnName(fieldName));
    if (!col || !arrayMeta || arrayMeta.length !== void 0 || !countCol) {
      return err(new ComponentNotPresentError(entity, component.name));
    }
    const row = this.tableRow(rec);
    const count = countCol.view[row];
    if (slot < 0 || slot >= count) return ok(void 0);
    const slotId = col.view[row];
    if (slotId === 0) return ok(void 0);
    const liveBytes = this.bufferPool.view(slotId);
    const last = count - 1;
    const moved = slot === last ? void 0 : readArrayElementAt(liveBytes, last, arrayMeta.elementType);
    if (slot !== last) {
      writeArrayElementAt(liveBytes, slot, arrayMeta.elementType, moved);
    }
    countCol.view[row] = last;
    this.markComponentChanged(entity, component);
    return ok(moved);
  }
  // ──────────────────────────────────────────────────────────────────────────
  // addComponent / removeComponent (archetype migration via edges, AC-07)
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Add a component to an existing entity, triggering archetype migration.
   *
   * @returns `Result<void, EcsError>` —
   *   `ok(void)` on success;
   *   `err(StaleEntityError)` (`.code = 'stale-entity'`) if entity is dead;
   *   `err(ComponentAlreadyPresentError)` (`.code = 'component-already-present'`)
   *   if entity already has the component (E-03).
   *
   * @example
   * ```ts
   * const Position = defineComponent('Position', { x: 'f32', y: 'f32' });
   * const Velocity = defineComponent('Velocity', { dx: 'f32', dy: 'f32' });
   * const world = new World();
   * const e = world.spawn({ component: Position, data: { x: 0, y: 0 } }).unwrap();
   * const r = world.addComponent(e, { component: Velocity, data: { dx: 1, dy: 0 } });
   * if (!r.ok) { return; } // r.error.code === 'stale-entity' on dead handle
   * r.unwrap();
   * ```
   */
  addComponent(entity, componentData) {
    const poisoned = this.poisonedResult();
    if (poisoned !== void 0) return poisoned;
    if (isRelationshipTarget(componentData.component) && this.relationshipTargetPayloadWrites(componentData.data))
      return this.relationshipTargetWriteError(componentData.component, "addComponent");
    return this.addComponentCore(entity, componentData, false);
  }
  /**
   * Core implementation of `addComponent` with reentry guard.
   *
   * @param internal — `true` when called from relationship maintenance
   *   (lazy mirror create or exclusive reparent).
   */
  addComponentCore(entity, componentData, internal, resolveRequirements = true, preparedMirrorAdded) {
    const record = this.lookupAlive(entity, "addComponent", componentData.component.name);
    if (!record.ok) return record;
    const rec = record.value;
    let srcArch = this.graph.archetypes[rec.archetypeId];
    if (!srcArch) {
      return err(
        new StaleEntityError(entity, entityIndex(entity), entityGeneration(entity), {
          operation: "addComponent",
          component: componentData.component.name,
          expectedGeneration: entityGeneration(entity),
          actualGeneration: rec.generation
        })
      );
    }
    const preflight = this.preflightComponentData(entity, componentData);
    if (!preflight.ok) return preflight;
    const filled = fillComponentDefaults(
      componentData.component,
      componentData.data
    );
    let relationshipMirrorAdded = preparedMirrorAdded;
    const componentAlreadyPresent = srcArch.components.some(
      (candidate) => componentId(candidate) === componentId(componentData.component)
    );
    if (!componentAlreadyPresent && !internal && relationshipRole(componentData.component)?.kind === "source" && relationshipMirrorAdded === void 0) {
      const prepared = this.prepareRelationshipInsert(
        componentData.component,
        filled
      );
      if (!prepared.ok) return prepared;
      relationshipMirrorAdded = prepared.value;
      srcArch = this.graph.archetypes[rec.archetypeId];
      if (srcArch === void 0) {
        return err(
          new StaleEntityError(entity, entityIndex(entity), entityGeneration(entity), {
            operation: "addComponent",
            component: componentData.component.name,
            expectedGeneration: rec.generation,
            actualGeneration: rec.generation
          })
        );
      }
    }
    if (resolveRequirements) {
      const required = expandComponentRequirements([componentData]).slice(1);
      for (const requirement of required) {
        if (srcArch.components.some(
          (candidate) => componentId(candidate) === componentId(requirement.component)
        )) {
          continue;
        }
        const added = this.addComponentCore(entity, requirement, internal, false);
        if (!added.ok) return added;
        srcArch = this.graph.archetypes[rec.archetypeId];
        if (!srcArch) {
          return err(
            new StaleEntityError(entity, entityIndex(entity), entityGeneration(entity), {
              operation: "addComponent",
              component: componentData.component.name,
              expectedGeneration: rec.generation,
              actualGeneration: rec.generation
            })
          );
        }
      }
    }
    const localId = componentId(componentData.component);
    if (srcArch.components.some((candidate) => componentId(candidate) === localId)) {
      const role = relationshipRole(componentData.component);
      if (role?.kind === "source" && role.exclusive && !internal) {
        const prepared = this.prepareRelationshipInsert(
          componentData.component,
          filled
        );
        if (!prepared.ok) return prepared;
        const removeR = this.removeComponentCore(
          entity,
          componentData.component,
          false
        );
        if (!removeR.ok) return removeR;
        return this.addComponentCore(entity, componentData, false, true, prepared.value);
      }
      return err(new ComponentAlreadyPresentError(entity, componentData.component.name));
    }
    const targetArch = getAddEdge(
      this.graph,
      srcArch,
      localId,
      componentData.component
    );
    if (componentData.component.storage === "sparse") {
      this.moveEntityArchetype(rec, srcArch, targetArch);
    } else {
      this.migrateEntity(rec, srcArch, targetArch);
    }
    if (componentData.component.storage === "table") {
      this.writeRow(targetArch, componentData.component, this.tableRow(rec), filled);
    }
    if (!internal && relationshipRole(componentData.component)?.kind === "source") {
      const relationshipResult = this.relationshipOnInsert(
        entity,
        componentData.component,
        filled,
        relationshipMirrorAdded
      );
      if (!relationshipResult.ok) {
        this.poisonAfterEntityMutation("World.addComponent", relationshipResult.error);
        return relationshipResult;
      }
    }
    if (!internal) {
      this.internalmarkComponentsAdded(entity, [componentId(componentData.component)]);
      this.advanceStructureEpoch();
    }
    return ok(void 0);
  }
  /**
   * Remove a component from an existing entity, triggering archetype migration.
   *
   * @returns `Result<void, EcsError>` —
   *   `ok(void)` on success;
   *   `err(StaleEntityError)` (`.code = 'stale-entity'`) if entity is dead;
   *   `err(ComponentNotPresentError)` (`.code = 'component-not-present'`)
   *   if entity doesn't have the component (E-04).
   *
   * @example
   * ```ts
   * const Position = defineComponent('Position', { x: 'f32', y: 'f32' });
   * const world = new World();
   * const e = world.spawn({ component: Position, data: { x: 0, y: 0 } }).unwrap();
   * const r = world.removeComponent(e, Position);
   * if (!r.ok) { return; } // r.error.code === 'stale-entity' on dead handle
   * r.unwrap();
   * ```
   */
  removeComponent(entity, component) {
    const poisoned = this.poisonedResult();
    if (poisoned !== void 0) return poisoned;
    if (isRelationshipTarget(component))
      return this.relationshipTargetWriteError(component, "removeComponent");
    return this.removeComponentCore(entity, component, false);
  }
  /**
   * Core implementation of `removeComponent` with reentry guard.
   *
   * @param internal — `true` when called from relationship maintenance
   *   (exclusive reparent).
   */
  removeComponentCore(entity, component, internal) {
    if (componentId(component) === componentId(Entity)) {
      return err(new RemoveEssentialComponentError(component.name));
    }
    const record = this.lookupAlive(entity, "removeComponent", component.name);
    if (!record.ok) return record;
    const rec = record.value;
    const srcArch = this.graph.archetypes[rec.archetypeId];
    if (!srcArch) {
      return err(
        new StaleEntityError(entity, entityIndex(entity), entityGeneration(entity), {
          operation: "removeComponent",
          component: component.name,
          expectedGeneration: entityGeneration(entity),
          actualGeneration: rec.generation
        })
      );
    }
    const localId = componentId(component);
    if (!srcArch.components.some((candidate) => componentId(candidate) === localId)) {
      return err(new ComponentNotPresentError(entity, component.name));
    }
    const role = relationshipRole(component);
    const needsOldValue = role?.kind === "source" && !internal;
    if (needsOldValue) {
      const oldValue = this.readRow(srcArch, component, this.tableRow(rec));
      if (role?.kind === "source" && !internal) {
        const relation = this.relationshipOnRemove(entity, component, oldValue);
        if (!relation.ok) {
          this.poisonAfterEntityMutation("World.removeComponent", relation.error);
          return relation;
        }
      }
    }
    if (component.storage === "table") {
      this.releaseManagedRefsOnRow(srcArch, component, this.tableRow(rec));
    }
    const targetArch = getRemoveEdge(this.graph, srcArch, localId);
    if (component.storage === "sparse") {
      this.moveEntityArchetype(rec, srcArch, targetArch);
      const set = this.graph.sparseTags.get(componentId(component));
      if (set !== void 0) removeSparseTag(set, entity);
    } else {
      this.migrateEntity(rec, srcArch, targetArch);
    }
    if (!internal) {
      this.internalnextMutationEpoch();
      this.advanceStructureEpoch();
    }
    return ok(void 0);
  }
  // ──────────────────────────────────────────────────────────────────────────
  // Internal — deferred command support (CommandBuffer interface)
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Allocate a pending entity for deferred spawn.
   * Returns an Entity handle. The entity is "pending" because
   * archetypeId === -1 (set by allocateIndex); no separate flag needed.
   */
  allocatePendingEntity() {
    const indexSlot = this.allocateIndex();
    return encodeEntity(indexSlot, this.records[indexSlot].generation);
  }
  /**
   * Return a deferred-spawn reservation to the free-list without publishing a
   * row or advancing an epoch.  CommandBuffer.abort is the sole caller; a
   * materialized entity is intentionally left untouched so an unexpected
   * post-write failure poisons the World instead of attempting an unsafe undo.
   */
  cancelPendingEntity(entity) {
    const slot = entityIndex(entity);
    const record = this.records[slot];
    if (record === void 0 || record.generation !== entityGeneration(entity)) return;
    if (record.archetypeId !== -1 || record.archetypeRow !== -1) return;
    record.generation += 1;
    if (!isRetiredSlot(record.generation)) this.freeIndices.push(slot);
  }
  /**
   * Materialize one already-reserved entity. Synchronous spawn and deferred
   * command flush share this exact insertion/publication path; only the
   * caller's validation and reservation boundary differs.
   *
   */
  materializeEntity(entity, componentDatas) {
    const poisoned = this.poisonedResult();
    if (poisoned !== void 0) return poisoned;
    const slot = entityIndex(entity);
    const record = this.records[slot];
    if (!record || record.archetypeId !== -1) return ok(void 0);
    let storageTouched = false;
    try {
      const componentIds = componentDatas.map((cd) => componentId(cd.component));
      const components = componentDatas.map((cd) => cd.component);
      const arch = getOrCreateArchetype(this.graph, componentIds, components);
      record.archetypeId = arch.id;
      storageTouched = true;
      const table = this.table(arch);
      const tableRow2 = appendTableRow(table, entity, this.mutationEpoch + 1);
      const archetypeRow = appendArchetypeRow(arch, tableRow2);
      record.archetypeRow = archetypeRow;
      for (const cd of componentDatas) {
        const filled = fillComponentDefaults(cd.component, cd.data);
        this.writeRow(arch, cd.component, tableRow2, filled);
      }
      this.writeEntitySelf(arch, tableRow2, entity);
      for (const cd of componentDatas) {
        if (relationshipRole(cd.component)?.kind !== "source") continue;
        const filled = fillComponentDefaults(cd.component, cd.data);
        const relationshipResult = this.relationshipOnInsert(
          entity,
          cd.component,
          filled
        );
        if (!relationshipResult.ok) {
          this.poisonAfterEntityMutation("World.materializeEntity", relationshipResult.error);
          return relationshipResult;
        }
      }
      this.internalmarkComponentsAdded(entity, [
        componentId(Entity),
        ...componentDatas.map((cd) => componentId(cd.component))
      ]);
      this.advanceStructureEpoch();
      return ok(void 0);
    } catch (error) {
      if (storageTouched) this.poisonAfterEntityMutation("World.materializeEntity", error);
      throw error;
    }
  }
  poisonAfterEntityMutation(kernelName, cause) {
    this.internalpoisonExecution({
      code: "shared-kernel-failed",
      kernelName,
      cause,
      partialWrite: true,
      retryable: false
    });
  }
  /** Deferred commands use the common materialization owner. */
  materializePendingEntity(entity, componentDatas) {
    return this.materializeEntity(entity, expandComponentRequirements(componentDatas));
  }
  // ──────────────────────────────────────────────────────────────────────────
  // Internal — entity index allocation
  // ──────────────────────────────────────────────────────────────────────────
  allocateIndex() {
    if (this.executionState.health === "poisoned") {
      throw new WorldPoisonedError(this.identity, this.executionState.fault);
    }
    const recycled = this.freeIndices.pop();
    if (recycled !== void 0) {
      return recycled;
    }
    const slot = this.records.length;
    if (slot > ENTITY_MAX_INDEX) {
      throw new EntityIndexOverflowError(slot);
    }
    this.records.push({ generation: 0, archetypeId: -1, archetypeRow: -1 });
    return slot;
  }
  /**
   * Single liveness predicate (feat-20260602 / plan-strategy D-4): a slot is
   * live for a given handle generation iff the record exists, its generation
   * still matches the handle (despawn bumps generation, so a stale or recycled
   * handle fails here), and the slot is materialized into an archetype
   * (archetypeId !== -1). Replaces the former `record.alive && record.generation
   * === gen` conjunction and the intermediate `!record.pending` clause. An
   * append in progress keeps `archetypeRow === -1` until both storage indexes
   * exist.
   */
  recordIsLive(record, gen) {
    return record !== void 0 && record.generation === gen && record.archetypeId !== -1 && record.archetypeRow !== -1;
  }
  lookupAlive(entity, operation, component) {
    const slot = entityIndex(entity);
    const gen = entityGeneration(entity);
    const record = this.records[slot];
    if (!this.recordIsLive(record, gen)) {
      return err(
        new StaleEntityError(entity, slot, gen, {
          operation,
          ...component !== void 0 ? { component } : {},
          expectedGeneration: gen,
          actualGeneration: this.records[slot]?.generation ?? -1
        })
      );
    }
    return ok(record);
  }
  readArrayView(arch, component, row, fieldName) {
    const fieldCols = this.table(arch).storage.get(componentId(component))?.fields;
    if (!fieldCols) return void 0;
    const fieldType = componentSchema(component)[fieldName];
    if (fieldType === void 0) return void 0;
    const arrayMeta = componentDefinition(component).fields[fieldName]?.arrayMeta;
    if (arrayMeta === void 0) return void 0;
    const col = fieldCols.get(fieldName);
    if (!col) return void 0;
    const elementCount = arrayMeta.length ?? fieldCols.get(arrayCountColumnName(fieldName))?.view[row] ?? 0;
    return this.materializeArrayView(col, row, arrayMeta, elementCount);
  }
  /** Read one scalar column without constructing a component snapshot. */
  internalgetFieldValue(entity, component, fieldName) {
    const record = this.lookupAlive(entity, "world-read", component.name);
    if (!record.ok) return void 0;
    const arch = this.graph.archetypes[record.value.archetypeId];
    if (arch === void 0) return void 0;
    const fieldCols = this.table(arch).storage.get(componentId(component))?.fields;
    return fieldCols?.get(fieldName)?.view[this.tableRow(record.value)];
  }
  /** Read an array's live logical length without allocating a TypedArray. */
  internalgetArrayLength(entity, component, fieldName) {
    const record = this.lookupAlive(entity, "world-read", component.name);
    if (!record.ok) return void 0;
    const arch = this.graph.archetypes[record.value.archetypeId];
    if (arch === void 0) return void 0;
    const row = this.tableRow(record.value);
    const fieldCols = this.table(arch).storage.get(componentId(component))?.fields;
    if (fieldCols === void 0) return void 0;
    const arrayMeta = componentDefinition(component).fields[fieldName]?.arrayMeta;
    if (arrayMeta === void 0) return void 0;
    if (arrayMeta.length !== void 0) return arrayMeta.length;
    const count = fieldCols.get(arrayCountColumnName(fieldName))?.view[row];
    return typeof count === "number" ? count : 0;
  }
  /** Read one array element directly from its column or BufferPool slot. */
  internalgetArrayElement(entity, component, fieldName, index) {
    if (!Number.isSafeInteger(index) || index < 0) return void 0;
    const record = this.lookupAlive(entity, "world-read", component.name);
    if (!record.ok) return void 0;
    const arch = this.graph.archetypes[record.value.archetypeId];
    if (arch === void 0) return void 0;
    const row = this.tableRow(record.value);
    const fieldCols = this.table(arch).storage.get(componentId(component))?.fields;
    if (fieldCols === void 0) return void 0;
    const arrayMeta = componentDefinition(component).fields[fieldName]?.arrayMeta;
    if (arrayMeta === void 0) return void 0;
    const length = arrayMeta.length ?? fieldCols.get(arrayCountColumnName(fieldName))?.view[row];
    if (length === void 0 || index >= length) return void 0;
    const col = fieldCols.get(fieldName);
    if (col === void 0) return void 0;
    if (arrayMeta.length !== void 0) return col.view[row * col.arity + index];
    const slotId = col.view[row];
    const bytes = this.bufferPool.view(slotId);
    if (arrayMeta.elementType === "entity") {
      const byteOffset = index * 4;
      if (byteOffset + 4 > bytes.byteLength) return void 0;
      return ((bytes[byteOffset] ?? 0) | (bytes[byteOffset + 1] ?? 0) << 8 | (bytes[byteOffset + 2] ?? 0) << 16 | (bytes[byteOffset + 3] ?? 0) << 24) >>> 0;
    }
    return readArrayElementAt(bytes, index, arrayMeta.elementType);
  }
  // ──────────────────────────────────────────────────────────────────────────
  // Internal — archetype data read/write
  // ──────────────────────────────────────────────────────────────────────────
  readRow(arch, component, row) {
    const localId = componentId(component);
    const fieldCols = this.table(arch).storage.get(localId)?.fields;
    const out = {};
    if (!fieldCols) {
      return out;
    }
    for (const [fieldName, fieldType] of Object.entries(componentSchema(component))) {
      const col = fieldCols.get(fieldName);
      if (!col) {
        continue;
      }
      const raw = col.view[row];
      if (fieldType === "bool") {
        out[fieldName] = raw === 1;
      } else if (isEntityField(fieldType)) {
        out[fieldName] = raw === ENTITY_NULL_RAW ? null : raw;
      } else if (isManagedBufferField(fieldType)) {
        if (fieldType !== "buffer") {
          const arity = col.arity;
          out[fieldName] = col.view.subarray(
            row * arity,
            row * arity + arity
          );
        } else {
          out[fieldName] = this.bufferPool.view(raw);
        }
      } else if (fieldType === "string") {
        const resolveR = this.uniqueRefs.resolve(toUnique(raw));
        out[fieldName] = resolveR.ok ? resolveR.value : "";
      } else {
        const arrayMeta = componentDefinition(component).fields[fieldName]?.arrayMeta;
        if (arrayMeta !== void 0) {
          const elementCount = arrayMeta.length ?? fieldCols.get(arrayCountColumnName(fieldName))?.view[row] ?? 0;
          const materialized = this.materializeArrayView(col, row, arrayMeta, elementCount);
          out[fieldName] = isRelationshipTarget(component) ? materialized.slice() : materialized;
        } else {
          out[fieldName] = raw;
        }
      }
    }
    return out;
  }
  /**
   * Write the full packed entity handle into the row's essential id=0 `Entity`
   * column (`self` field). Called by `spawn` / `materializePendingEntity`
   * after the row is appended (feat-20260602 / plan-strategy D-3). The column
   * always exists -- `createArchetype` folds the Entity column into every
   * archetype -- so this is a direct u32 store, no readRow/writeRow walk.
   */
  writeEntitySelf(arch, row, handle) {
    const col = this.table(arch).storage.get(componentId(Entity))?.fields.get("self");
    if (!col) return;
    col.view[row] = handle;
  }
  writeRow(arch, component, row, value) {
    const localId = componentId(component);
    const fieldCols = this.table(arch).storage.get(localId)?.fields;
    if (!fieldCols) {
      return;
    }
    for (const [fieldName, fieldType] of Object.entries(componentSchema(component))) {
      const col = fieldCols.get(fieldName);
      if (!col) {
        continue;
      }
      const raw = value[fieldName];
      if (fieldType === "bool") {
        col.view[row] = raw ? 1 : 0;
      } else if (isEntityField(fieldType)) {
        col.view[row] = raw === null || raw === void 0 ? ENTITY_NULL_RAW : raw;
      } else if (isManagedBufferField(fieldType)) {
        const bytes = normalizeBufferWrite(raw);
        if (fieldType !== "buffer") {
          const arity = col.arity;
          if (bytes !== null) {
            const copyLen = Math.min(bytes.byteLength, arity);
            col.view.set(bytes.subarray(0, copyLen), row * arity);
          }
        } else {
          const allocBytes = bytes !== null ? bytes.byteLength : 0;
          const allocR = this.bufferPool.alloc(allocBytes);
          if (!allocR.ok) {
            const ctx = {
              systemName: `World.spawn (${component.name}.${fieldName})`
            };
            this.routeError(allocR.error, ctx);
            col.view[row] = 0;
            continue;
          }
          const slot = allocR.value;
          if (bytes !== null) {
            const copyLen = Math.min(bytes.byteLength, slot.view.byteLength);
            slot.view.set(bytes.subarray(0, copyLen));
          }
          col.view[row] = slot.id;
        }
      } else if (fieldType === "string") {
        const text = typeof raw === "string" ? raw : "";
        const handle = this.uniqueRefs.alloc("String", text);
        col.view[row] = unwrapHandle(handle);
      } else {
        const arrayMeta = componentDefinition(component).fields[fieldName]?.arrayMeta;
        if (arrayMeta !== void 0) {
          this.writeArrayField(arch, component, row, fieldName, fieldType, arrayMeta, raw);
        } else {
          col.view[row] = raw;
          if (fieldType.startsWith("shared<") && raw !== 0) {
            this.retainSharedScalarHandle(raw, component.name, fieldName);
          }
        }
      }
    }
  }
  // ──────────────────────────────────────────────────────────────────────────
  // Internal — managed-ref + managed-buffer release loop (M1 / M2)
  // ──────────────────────────────────────────────────────────────────────────
  /** Release all ECS-owned field handles before a row is removed or overwritten. */
  releaseManagedRefsOnRow(arch, component, row) {
    const fieldCols = this.table(arch).storage.get(componentId(component))?.fields;
    if (!fieldCols) return;
    for (const fieldName of Object.keys(componentSchema(component))) {
      this.releaseManagedFieldOnRow(arch, component, row, fieldName);
    }
  }
  /**
   * Release one ECS-owned field according to its schema. Inline buffers have
   * no pool slot; shared-array elements still release their handles. Store
   * failures use the host error channel so row cleanup remains total.
   */
  releaseManagedFieldOnRow(arch, component, row, fieldName) {
    const fieldCols = this.table(arch).storage.get(componentId(component))?.fields;
    if (!fieldCols) return;
    const col = fieldCols.get(fieldName);
    if (!col) return;
    const fieldType = componentSchema(component)[fieldName] ?? "";
    if (isManagedField(fieldType)) {
      const handleU32 = col.view[row];
      if (fieldType.startsWith("shared<")) {
        this.releaseSharedRefHandle(handleU32, component.name, fieldName);
        return;
      }
      this.releaseManagedRefHandle(handleU32, component.name, fieldName);
      return;
    }
    if (isManagedBufferField(fieldType)) {
      if (fieldType === "buffer") {
        const slotId = col.view[row];
        this.releaseManagedBufferSlot(slotId);
        col.view[row] = 0;
      }
      return;
    }
    if (isManagedArrayField(fieldType)) {
      const arrayMeta = componentDefinition(component).fields[fieldName]?.arrayMeta;
      if (arrayMeta === void 0) return;
      const isSharedElement = arrayMeta.elementType.startsWith("shared<");
      if (arrayMeta.length === void 0) {
        const slotId = col.view[row];
        const countCol = fieldCols.get(arrayCountColumnName(fieldName));
        if (isSharedElement && slotId !== 0) {
          const liveCount = countCol !== void 0 ? countCol.view[row] : 0;
          const slotView = liveCount > 0 ? this.bufferPool.view(slotId) : null;
          if (slotView !== null && slotView.byteLength > 0) {
            this.releaseSharedArrayElements(slotView, liveCount);
          }
        }
        this.releaseManagedBufferSlot(slotId);
        col.view[row] = 0;
        if (countCol !== void 0) countCol.view[row] = 0;
        return;
      }
      if (isSharedElement) {
        const arity = col.arity;
        const elementBytes = TYPE_METADATA.shared?.byteSize ?? 4;
        const rowByteOffset = col.view.byteOffset + row * arity * elementBytes;
        const rowBytes = new Uint8Array(col.view.buffer, rowByteOffset, arity * elementBytes);
        this.releaseSharedArrayElements(rowBytes, arity);
        rowBytes.fill(0);
      }
    }
  }
  /** Release one unique-ref handle; sentinel 0 is ignored. */
  releaseManagedRefHandle(handleU32, componentName, fieldName) {
    if (handleU32 === 0) return;
    const r = this.uniqueRefs.release(handleU32);
    if (r.ok) return;
    const ctx = {
      systemName: `World.release (${componentName}.${fieldName})`
    };
    this.routeError(r.error, ctx);
  }
  /** Release one shared-ref handle, preserving builtin slots and refcounts. */
  releaseSharedRefHandle(handleU32, componentName, fieldName) {
    if (handleU32 < BUILTIN_BASE) return;
    const r = this.sharedRefs.release(toShared(handleU32));
    if (r.ok) return;
    const ctx = {
      systemName: `World.release (${componentName}.${fieldName})`
    };
    this.routeError(r.error, ctx);
  }
  /** Retain one shared-ref scalar handle for a World-owned field. */
  retainSharedScalarHandle(handleU32, componentName, fieldName) {
    if (handleU32 < BUILTIN_BASE) return;
    const r = this.sharedRefs.retain(toShared(handleU32));
    if (r.ok) return;
    const ctx = {
      systemName: `World.write (${componentName}.${fieldName} shared scalar retain)`
    };
    this.routeError(r.error, ctx);
  }
  /** Release one variable-buffer slot; id 0 is the unallocated sentinel. */
  releaseManagedBufferSlot(slotId) {
    if (slotId === 0) return;
    this.bufferPool.release(slotId);
  }
  // ──────────────────────────────────────────────────────────────────────────
  // Internal — array<T> / array<T,N> spawn / set helpers (M1 / w7)
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Attach field context to a `ManagedArrayErrorEnvelope`.
   * The envelope shape (`code / hint / expected / detail`) already mirrors
   * the EcsError contract; this helper only attaches the systemName context
   * so AI users can correlate the error with the holder component / field.
   */
  routeArrayError(err11, componentName, fieldName) {
    const ctx = {
      systemName: `World.write (${componentName}.${fieldName})`
    };
    this.routeError(err11, ctx);
  }
  /**
   * Write an array field for spawn or set. Fixed arrays stay inline; variable
   * arrays use one BufferPool slot plus a live-count sidecar.
   */
  writeArrayField(arch, component, row, fieldName, _fieldType, arrayMeta, raw) {
    const fieldCols = this.table(arch).storage.get(componentId(component))?.fields;
    if (!fieldCols) return;
    const col = fieldCols.get(fieldName);
    if (!col) return;
    const elementType = arrayMeta.elementType;
    const metaKey = elementType.startsWith("shared<") ? "shared" : elementType;
    const meta = TYPE_METADATA[metaKey];
    if (!meta) return;
    const elementBytes = meta.byteSize;
    const isVariable = arrayMeta.length === void 0;
    const fixedLength = arrayMeta.length ?? 0;
    if (!isVariable && metaKey !== "shared" && meta.viewCtor !== void 0 && col.view instanceof meta.viewCtor && (raw == null || Array.isArray(raw) || raw instanceof meta.viewCtor)) {
      const start = row * col.arity;
      const count = raw == null ? 0 : Math.min(raw.length, col.arity);
      if (Array.isArray(raw)) {
        for (let i = 0; i < count; i++)
          col.view[start + i] = typeof raw[i] === "number" ? raw[i] : 0;
      } else if (raw != null) {
        col.view.set(raw.length <= col.arity ? raw : raw.subarray(0, count), start);
      }
      col.view.fill(0, start + count, start + col.arity);
      return;
    }
    let payloadCount = 0;
    let payloadBytes = null;
    if (raw !== null && raw !== void 0) {
      if (raw instanceof Float32Array || raw instanceof Float64Array || raw instanceof Int32Array || raw instanceof Uint32Array || raw instanceof Int16Array || raw instanceof Uint16Array || raw instanceof Int8Array || raw instanceof Uint8Array) {
        payloadCount = raw.length;
        payloadBytes = new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
      } else if (Array.isArray(raw)) {
        payloadCount = raw.length;
        if (payloadCount > 0 && meta.viewCtor !== void 0) {
          const typed = new meta.viewCtor(payloadCount);
          for (let i = 0; i < payloadCount; i++) {
            const val = raw[i];
            typed[i] = typeof val === "number" ? val : 0;
          }
          payloadBytes = new Uint8Array(typed.buffer, typed.byteOffset, typed.byteLength);
        }
      }
    }
    const effectiveCount = isVariable ? payloadCount : fixedLength;
    if (!isVariable) {
      const arity = col.arity;
      const rowByteOffset = col.view.byteOffset + row * arity * elementBytes;
      const rowBytes = new Uint8Array(col.view.buffer, rowByteOffset, arity * elementBytes);
      const copyLen = payloadBytes === null ? 0 : Math.min(payloadBytes.byteLength, rowBytes.byteLength);
      if (copyLen > 0 && payloadBytes !== null) {
        rowBytes.set(payloadBytes.subarray(0, copyLen));
      }
      if (copyLen < rowBytes.byteLength) {
        rowBytes.fill(0, copyLen);
      }
      if (metaKey === "shared" && copyLen > 0) {
        this.retainSharedArrayElements(rowBytes, copyLen >>> 2);
      }
      return;
    }
    const byteLength = effectiveCount * elementBytes;
    const allocR = this.bufferPool.alloc(byteLength);
    if (!allocR.ok) {
      this.routeArrayError(
        {
          code: allocR.error.code,
          hint: allocR.error.hint,
          expected: allocR.error.expected,
          detail: allocR.error.detail
        },
        component.name,
        fieldName
      );
      col.view[row] = 0;
      if (isVariable) {
        const countCol = fieldCols.get(arrayCountColumnName(fieldName));
        if (countCol !== void 0) countCol.view[row] = 0;
      }
      return;
    }
    const slot = allocR.value;
    if (payloadBytes !== null) {
      const copyLen = Math.min(payloadBytes.byteLength, slot.view.byteLength);
      slot.view.set(payloadBytes.subarray(0, copyLen));
    }
    col.view[row] = slot.id;
    if (isVariable) {
      const countCol = fieldCols.get(arrayCountColumnName(fieldName));
      if (countCol !== void 0) countCol.view[row] = effectiveCount;
    }
    if (metaKey === "shared" && effectiveCount > 0) {
      this.retainSharedArrayElements(slot.view, effectiveCount);
    }
  }
  /**
   * Walk the first `count` u32 handles in `bytes` and call
   * `SharedRefStore.retain` on each non-sentinel slot id (feat-20260614 M4 /
   * D-3). Failures route via the error channel so the write chain stays
   * total; charter explicit-failure boundary lets AI users see structured
   * `shared-ref-released` payloads when retaining a stale handle.
   *
   * Helper-internal -- only called from `writeArrayField`'s `'shared'` arm.
   */
  retainSharedArrayElements(bytes, count) {
    const view = new Uint32Array(bytes.buffer, bytes.byteOffset, count);
    for (let i = 0; i < count; i++) {
      const raw = view[i];
      if (raw === void 0) continue;
      this.retainSharedScalarHandle(raw, "array<shared<T>>", "element");
    }
  }
  /**
   * Walk the first `count` u32 handles in `bytes` and call
   * `SharedRefStore.release` on each non-sentinel slot id (feat-20260614 M4 /
   * D-3). Mirrors `retainSharedArrayElements`; called from
   * `releaseManagedFieldOnRow`'s array arm BEFORE the BufferPool slot is
   * released so the underlying bytes are still valid.
   */
  releaseSharedArrayElements(bytes, count) {
    const view = new Uint32Array(bytes.buffer, bytes.byteOffset, count);
    for (let i = 0; i < count; i++) {
      const raw = view[i];
      if (raw === void 0) continue;
      this.releaseSharedRefHandle(raw, "array<shared<T>>", "element");
    }
  }
  /**
   * Materialize an array snapshot. Fixed arrays alias their inline column;
   * variable arrays alias the live BufferPool slot and use the count sidecar.
   * Both views are transient and must not be held across structural changes.
   */
  materializeArrayView(col, row, arrayMeta, elementCount) {
    if (arrayMeta.length !== void 0) {
      const elementBytes = elementByteSize(arrayMeta.elementType);
      const arity = col.arity;
      const rowByteOffset = col.view.byteOffset + row * arity * elementBytes;
      return reinterpretBufferRegion(
        col.view.buffer,
        rowByteOffset,
        arrayMeta.elementType,
        arrayMeta.length
      );
    }
    return reinterpretSlotBytes(
      this.bufferPool.view(col.view[row]),
      arrayMeta.elementType,
      elementCount
    );
  }
  // ──────────────────────────────────────────────────────────────────────────
  // Internal — archetype migration
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Copy surviving component columns into the target row, then swap-remove
   * the source row. Managed handles and variable-array sidecars are copied
   * verbatim; release remains the responsibility of remove/despawn paths.
   */
  migrateEntity(record, srcArch, targetArch) {
    const oldArchetypeRow = record.archetypeRow;
    const oldTableRow = srcArch.rows[oldArchetypeRow] ?? 0;
    const srcTable = this.table(srcArch);
    const targetTable = this.table(targetArch);
    const entity = srcTable.storage.get(componentId(Entity))?.fields.get("self")?.view[oldTableRow] ?? 0;
    const newTableRow = appendTableRow(targetTable, entity, this.mutationEpoch + 1);
    const newArchetypeRow = appendArchetypeRow(targetArch, newTableRow);
    for (const [compId, srcComponentStorage] of srcTable.storage) {
      const srcFieldCols = srcComponentStorage.fields;
      const targetComponentStorage = targetTable.storage.get(compId);
      const targetFieldCols = targetComponentStorage?.fields;
      if (!targetFieldCols) {
        continue;
      }
      for (const [fieldName, srcCol] of srcFieldCols) {
        const targetCol = targetFieldCols.get(fieldName);
        if (!targetCol) {
          continue;
        }
        const arity = srcCol.arity;
        targetCol.view.set(
          srcCol.view.subarray(oldTableRow * arity, oldTableRow * arity + arity),
          newTableRow * arity
        );
      }
      if (targetComponentStorage !== void 0) {
        copyComponentEpoch(
          srcComponentStorage.epochs,
          oldTableRow,
          targetComponentStorage.epochs,
          newTableRow
        );
      }
    }
    const archetypeSwap = removeArchetypeRow(srcArch, oldArchetypeRow);
    if (archetypeSwap !== null) {
      const movedEntity = srcTable.storage.get(componentId(Entity))?.fields.get("self")?.view[archetypeSwap.movedTableRow] ?? 0;
      const movedRecord = this.records[entityIndex(movedEntity)];
      if (movedRecord?.generation === entityGeneration(movedEntity)) {
        movedRecord.archetypeRow = archetypeSwap.newRow;
      }
    }
    const tableSwap = removeTableRow(srcTable, oldTableRow, this.mutationEpoch + 1);
    if (tableSwap !== null) {
      const movedRecord = this.records[entityIndex(tableSwap.movedEntity)];
      if (movedRecord?.generation === entityGeneration(tableSwap.movedEntity)) {
        const movedArchetype = this.graph.archetypes[movedRecord.archetypeId];
        if (movedArchetype !== void 0) {
          movedArchetype.rows[movedRecord.archetypeRow] = tableSwap.newRow;
        }
      }
    }
    record.archetypeId = targetArch.id;
    record.archetypeRow = newArchetypeRow;
  }
  moveEntityArchetype(record, srcArch, targetArch) {
    const table = this.table(srcArch);
    if (srcArch.tableId !== targetArch.tableId) {
      throw new Error("Logical archetype move requires a shared Table.");
    }
    const oldArchetypeRow = record.archetypeRow;
    const tableRow2 = srcArch.rows[oldArchetypeRow] ?? 0;
    const archetypeSwap = removeArchetypeRow(srcArch, oldArchetypeRow);
    if (archetypeSwap !== null) {
      const movedEntity = table.storage.get(componentId(Entity))?.fields.get("self")?.view[archetypeSwap.movedTableRow] ?? 0;
      const movedRecord = this.records[entityIndex(movedEntity)];
      if (movedRecord?.generation === entityGeneration(movedEntity)) {
        movedRecord.archetypeRow = archetypeSwap.newRow;
      }
    }
    record.archetypeId = targetArch.id;
    record.archetypeRow = appendArchetypeRow(targetArch, tableRow2);
    markTableMembership(table, tableRow2, this.mutationEpoch + 1);
  }
  /**
   * Retire one live entity and any linked-spawn descendants. The complete
   * row/relationship/managed-data mutation stays on World so a failure after
   * the first write can poison this identity instead of crossing an extraction
   * owner boundary.
   */
  despawnEntity(entity, internal) {
    const slot = entityIndex(entity);
    const generation = entityGeneration(entity);
    const record = this.records[slot];
    if (!this.recordIsLive(record, generation)) return ok(void 0);
    const archetype = this.graph.archetypes[record.archetypeId];
    const linkedChildren = archetype === void 0 ? [] : this.relationshipLinkedSpawnChildren(entity, archetype);
    let mutationStarted = false;
    try {
      if (archetype !== void 0) {
        const table = this.table(archetype);
        const archetypeRow = record.archetypeRow;
        const tableRow2 = archetype.rows[archetypeRow] ?? 0;
        mutationStarted = true;
        for (const component of archetype.components) {
          const role = relationshipRole(component);
          if (role?.kind === "source" && !internal) {
            const oldValue = this.readRow(archetype, component, tableRow2);
            const relation = this.relationshipOnRemove(entity, component, oldValue);
            if (!relation.ok) {
              this.poisonAfterEntityMutation("World.despawn", relation.error);
              return relation;
            }
          }
          this.releaseManagedRefsOnRow(archetype, component, tableRow2);
        }
        for (const component of archetype.components) {
          if (component.storage !== "sparse") continue;
          const sparse = this.graph.sparseTags.get(componentId(component));
          if (sparse !== void 0) removeSparseTag(sparse, entity);
        }
        const archetypeSwap = removeArchetypeRow(archetype, archetypeRow);
        if (archetypeSwap !== null) {
          const movedEntity = table.storage.get(componentId(Entity))?.fields.get("self")?.view[archetypeSwap.movedTableRow] ?? 0;
          const movedRecord = this.records[entityIndex(movedEntity)];
          if (movedRecord?.generation === entityGeneration(movedEntity)) {
            movedRecord.archetypeRow = archetypeSwap.newRow;
          }
        }
        const tableSwap = removeTableRow(table, tableRow2, this.mutationEpoch + 1);
        if (tableSwap !== null) {
          const movedRecord = this.records[entityIndex(tableSwap.movedEntity)];
          if (movedRecord?.generation === entityGeneration(tableSwap.movedEntity)) {
            const movedArchetype = this.graph.archetypes[movedRecord.archetypeId];
            if (movedArchetype !== void 0) {
              movedArchetype.rows[movedRecord.archetypeRow] = tableSwap.newRow;
            }
          }
        }
      }
      record.archetypeId = -1;
      record.archetypeRow = -1;
      record.generation += 1;
      if (!isRetiredSlot(record.generation)) this.freeIndices.push(slot);
      for (const child of linkedChildren) {
        const childResult = this.despawnEntity(child, true);
        if (!childResult.ok) return childResult;
      }
      this.internalnextMutationEpoch();
      this.advanceStructureEpoch();
      return ok(void 0);
    } catch (error) {
      if (mutationStarted) this.poisonAfterEntityMutation("World.despawn", error);
      throw error;
    }
  }
  spawn(...componentDatas) {
    const poisoned = this.poisonedResult();
    if (poisoned !== void 0) return poisoned;
    const target = componentDatas.find(
      (data) => isRelationshipTarget(data.component) && this.relationshipTargetPayloadWrites(data.data)
    );
    if (target !== void 0) return this.relationshipTargetWriteError(target.component, "spawn");
    return spawnCore(this, componentDatas);
  }
  // ──────────────────────────────────────────────────────────────────────────
  // Despawn (D-08: generation retirement)
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Despawn an entity. Stale handles are silently ignored (E-01, AC-17).
   * Generation retirement: gen=255 → index permanently retired (D-08/E-08).
   *
   * @returns `Result<void, EcsError>` — `ok(void)` always (idempotent on stale handles).
   *
   * @example
   * ```ts
   * const Position = defineComponent('Position', { x: 'f32', y: 'f32' });
   * const world = new World();
   * const e = world.spawn({ component: Position, data: { x: 0, y: 0 } }).unwrap();
   * const r = world.despawn(e);
   * r.unwrap(); // idempotent: ok(void) even on stale handle
   * ```
   */
  despawn(entity) {
    const poisoned = this.poisonedResult();
    if (poisoned !== void 0) return poisoned;
    return this.despawnEntity(entity, false);
  }
  /** Despawn every live entity through the normal lifecycle and ref cleanup path. */
  despawnAll() {
    const poisoned = this.poisonedResult();
    if (poisoned !== void 0) return poisoned;
    const entities = [];
    for (let index = 0; index < this.records.length; index += 1) {
      const record = this.records[index];
      if (record !== void 0 && record.archetypeId >= 0) {
        entities.push(encodeEntity(index, record.generation));
      }
    }
    for (const entity of entities) {
      const result = this.despawn(entity);
      if (!result.ok) return result;
    }
    return ok(void 0);
  }
  // ──────────────────────────────────────────────────────────────────────────
  // Hierarchy facade — lifecycle orchestration lives in world-entity-lifecycle.
  // World owns the component storage and relationship mutation primitives.
  // ──────────────────────────────────────────────────────────────────────────
  addChild(parent, child, component, data) {
    const poisoned = this.poisonedResult();
    if (poisoned !== void 0) return poisoned;
    return worldAddChild(this, parent, child, component, data);
  }
  removeChild(parent, child, component) {
    const poisoned = this.poisonedResult();
    if (poisoned !== void 0) return poisoned;
    return worldRemoveChild(this, parent, child, component);
  }
  reparent(child, newParent, component, data) {
    const poisoned = this.poisonedResult();
    if (poisoned !== void 0) return poisoned;
    return worldReparent(this, child, newParent, component, data);
  }
  iterAncestors(entity) {
    return worldIterAncestors(this, entity);
  }
  iterDescendants(entity) {
    return worldIterDescendants(this, entity);
  }
};

// src/index.ts
if (!isComponentDefinitionOrderValid() || ESSENTIAL_COMPONENT_IDS.length !== 1 || ESSENTIAL_COMPONENT_IDS[0] !== 0) {
  throw new Error(
    `forgeax-engine-ecs: ESSENTIAL_COMPONENT_IDS invariant violated (expected [0], got [${ESSENTIAL_COMPONENT_IDS.join(", ")}]). A defineComponent() call evaluated before the @forgeax/engine-ecs barrel forced the id counter past 0. Ensure no module defines a component at import time before importing from the barrel.`
  );
}

export { Disabled, ENTITY_MAX_GENERATION, ENTITY_MAX_INDEX, ENTITY_NULL_RAW, ESSENTIAL_COMPONENT_IDS, Entity, FixedTime, FixedUpdate, SharedRefStaleError, Time, UniqueRefStaleError, Update, World, componentDefinition, createWorldContext, defineComponent, defineRelationship, defineSystem, defineSystemSet, foldEssentials, worldPlugin };
