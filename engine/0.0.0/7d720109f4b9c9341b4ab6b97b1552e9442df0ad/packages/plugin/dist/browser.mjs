import { isConstructor } from '../../../vendor/@deepseek-ai/cordis/lib/index.js';
export * from '../../../vendor/@deepseek-ai/cordis/lib/index.js';
import { createCapabilityResolver, createToolApi } from '../../tool-runtime/dist/index.mjs';

// src/browser.ts
function createContextCapabilityResolver(ctx) {
  return createCapabilityResolver((capability) => Reflect.get(ctx, capability.id));
}

// src/composition.ts
var PluginCompositionErrorClass = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    super(`${args.code}: ${args.expected}`);
    this.name = "PluginCompositionError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    this.detail = args.detail;
  }
};
var PluginCompositionError = PluginCompositionErrorClass;
function usePlugin(plugin, ...args) {
  const config = args[0];
  const options = args[1];
  return {
    plugin,
    config,
    ...options?.key === void 0 ? {} : { key: options.key }
  };
}
var ChildOperationFailure = class extends Error {
  constructor(child, reason, cleanupFailures = []) {
    super(`child operation failed: ${pluginName(child.plugin)}`);
    this.child = child;
    this.reason = reason;
    this.cleanupFailures = cleanupFailures;
  }
  child;
  reason;
  cleanupFailures;
};
var groupStateKey = /* @__PURE__ */ Symbol("forgeax.plugin.group.state");
function pluginName(plugin) {
  return plugin.name ?? "anonymous";
}
function dependencyNames(plugin) {
  const inject = plugin.inject;
  if (inject === void 0) return [];
  return Array.isArray(inject) ? inject : Object.keys(inject);
}
function providedNames(plugin) {
  const provide = plugin.provide;
  if (provide === void 0) return [];
  return Array.isArray(provide) ? provide : [provide];
}
function keyFor(child) {
  if (child.key !== void 0) return child.key;
  return child.plugin;
}
function validateKeys(children) {
  const keys = /* @__PURE__ */ new Map();
  for (const child of children) {
    const key = keyFor(child);
    const previous = keys.get(key);
    if (previous !== void 0) {
      if (child.key === void 0 && previous.key === void 0) {
        throw new PluginCompositionError({
          code: "plugin-group-key-required",
          expected: "repeated Plugin references to declare a stable child key",
          hint: "assign a unique key to each repeated child before activation.",
          detail: { plugin: pluginName(child.plugin) }
        });
      }
      throw new PluginCompositionError({
        code: "plugin-group-key-duplicate",
        expected: "stable child key to be unique within its Group",
        hint: "assign a unique key to each child declaration.",
        detail: { key: String(child.key) }
      });
    }
    keys.set(key, child);
  }
}
function orderedChildren(ctx, children, groupOwnedServices) {
  const providers = /* @__PURE__ */ new Map();
  children.forEach((child, index) => {
    for (const service of providedNames(child.plugin)) {
      if (!providers.has(service)) providers.set(service, index);
    }
  });
  const graph = children.map(() => []);
  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];
    if (child === void 0) continue;
    for (const service of dependencyNames(child.plugin)) {
      const provider = providers.get(service);
      const externalServiceAvailable = !groupOwnedServices.has(service) && ctx.reflect.get(service, false) !== void 0;
      if (provider === void 0 && !externalServiceAvailable) {
        throw new PluginCompositionError({
          code: "plugin-group-provider-missing",
          expected: "an inject/provide dependency to be available before the child starts",
          hint: "provide the service in the Group or install the owning plugin first.",
          detail: { service }
        });
      }
      if (provider !== void 0 && provider !== index) graph[index]?.push(provider);
      if (provider === index) graph[index]?.push(index);
    }
  }
  const state = children.map(() => 0);
  const sorted = [];
  const visit = (index, path) => {
    if (state[index] === 1) {
      const cycleStart = path.indexOf(index);
      const cycle = [...path.slice(cycleStart), index].map((item) => {
        const child = children[item];
        return child === void 0 ? "unknown" : pluginName(child.plugin);
      });
      throw new PluginCompositionError({
        code: "plugin-group-dependency-cycle",
        expected: "an acyclic inject/provide dependency graph",
        hint: "break the dependency cycle before activating the Group.",
        detail: { path: cycle }
      });
    }
    if (state[index] === 2) return;
    state[index] = 1;
    for (const dependency of graph[index] ?? []) visit(dependency, [...path, index]);
    state[index] = 2;
    sorted.push(index);
  };
  for (let index = 0; index < children.length; index += 1) visit(index, []);
  return sorted.map((index) => children[index]).filter((child) => child !== void 0);
}
async function validateConfig(child) {
  const schema = child.plugin.Config;
  if (schema === void 0) return;
  const result = await schema["~standard"].validate(child.config);
  if ("issues" in result && result.issues) {
    throw new PluginCompositionError({
      code: "plugin-config-invalid",
      expected: `${pluginName(child.plugin)} Plugin.Config to validate the child config`,
      hint: "provide a valid config before the child side effect runs.",
      detail: { plugin: pluginName(child.plugin) }
    });
  }
}
async function validateChildren(children) {
  const results = await Promise.allSettled(children.map((child) => validateConfig(child)));
  const failure = results.find(
    (result) => result.status === "rejected"
  );
  if (failure !== void 0) throw failure.reason;
}
function childFailure(child, _reason) {
  return new PluginCompositionError({
    code: "plugin-group-child-failed",
    expected: `${pluginName(child.plugin)} to activate under its owning Group`,
    hint: "repair the child and retry the Group update.",
    detail: { child: pluginName(child.plugin) }
  });
}
function sameConfig(left, right) {
  return sameDataValue(left, right, /* @__PURE__ */ new Set());
}
function sameDataValue(left, right, active) {
  if (Object.is(left, right)) return true;
  if (left === null || right === null || typeof left !== "object" || typeof right !== "object") {
    return false;
  }
  const leftArray = Array.isArray(left);
  if (leftArray !== Array.isArray(right)) return false;
  const leftPrototype = Object.getPrototypeOf(left);
  const rightPrototype = Object.getPrototypeOf(right);
  if (leftArray) {
    if (leftPrototype !== Array.prototype || rightPrototype !== Array.prototype) return false;
  } else if (!((leftPrototype === Object.prototype || leftPrototype === null) && (rightPrototype === Object.prototype || rightPrototype === null) && leftPrototype === rightPrototype)) {
    return false;
  }
  if (active.has(left)) return false;
  active.add(left);
  try {
    const leftKeys = Reflect.ownKeys(left).filter((key) => !leftArray || key !== "length");
    const rightKeys = Reflect.ownKeys(right).filter((key) => !leftArray || key !== "length");
    if (leftKeys.length !== rightKeys.length) return false;
    for (const key of leftKeys) {
      if (!Object.hasOwn(right, key)) return false;
      const leftDescriptor = Object.getOwnPropertyDescriptor(left, key);
      const rightDescriptor = Object.getOwnPropertyDescriptor(right, key);
      if (leftDescriptor === void 0 || rightDescriptor === void 0 || !("value" in leftDescriptor) || !("value" in rightDescriptor) || !sameDataValue(leftDescriptor.value, rightDescriptor.value, active)) {
        return false;
      }
    }
    return true;
  } finally {
    active.delete(left);
  }
}
function startChild(ctx, child) {
  let fiber;
  try {
    fiber = ctx.plugin(child.plugin, child.config).ctx.fiber;
    return { key: keyFor(child), plugin: child.plugin, config: child.config, fiber };
  } catch (reason) {
    if (fiber !== void 0) void fiber.dispose();
    if (reason instanceof PluginCompositionError) throw reason;
    throw childFailure(child);
  }
}
async function activateChild(ctx, child) {
  const record = startChild(ctx, child);
  await record.fiber.await();
  return record;
}
function recordUse(record) {
  return {
    plugin: record.plugin,
    config: record.config,
    ...typeof record.key === "string" ? { key: record.key } : {}
  };
}
function sharesProvidedService(left, right) {
  const rightServices = new Set(providedNames(right));
  return providedNames(left).some((service) => rightServices.has(service));
}
async function restoreRecord(ctx, record, config) {
  try {
    await record.fiber.update(config);
    await record.fiber.await();
    return { ...record, config };
  } catch (updateReason) {
    if (record.fiber.uid !== null) await record.fiber.dispose();
    try {
      return await activateChild(ctx, { ...recordUse(record), config });
    } catch (restoreReason) {
      throw restoreReason ?? updateReason;
    }
  }
}
async function settleRecords(records, abort, updates, candidates) {
  if (records.length === 0) return;
  const providers = /* @__PURE__ */ new Map();
  const outcomes = records.map((record, index) => {
    const dependencies = dependencyNames(record.plugin).flatMap((service) => {
      const provider = providers.get(service);
      return provider === void 0 ? [] : [provider];
    });
    const update = updates.get(record);
    if (update !== void 0) dependencies.push(update);
    const outcome = Promise.all(dependencies).then(() => record.fiber.await()).then(
      () => ({ index, reason: void 0 }),
      (reason) => ({ index, reason })
    );
    for (const service of providedNames(record.plugin)) {
      if (!providers.has(service)) providers.set(service, outcome);
    }
    return outcome;
  });
  const candidateOutcomes = records.flatMap((record, index) => {
    const outcome = outcomes[index];
    return candidates.includes(record) && outcome !== void 0 ? [outcome] : [];
  });
  const pending = new Set(outcomes);
  const abortSignal = abort === void 0 ? void 0 : abort.then((reason) => ({ index: -1, reason, aborted: true }));
  while (pending.size > 0) {
    const outcome = await Promise.race([
      ...pending,
      ...abortSignal === void 0 ? [] : [abortSignal]
    ]);
    if ("aborted" in outcome) {
      const cleanupFailures = await disposeRecordsInReverse(candidates);
      await Promise.allSettled(candidateOutcomes);
      if (outcome.reason instanceof ChildOperationFailure) {
        throw new ChildOperationFailure(
          outcome.reason.child,
          outcome.reason.reason,
          cleanupFailures
        );
      }
      throw outcome.reason;
    }
    const completed = outcomes[outcome.index];
    if (completed !== void 0) pending.delete(completed);
    if (outcome.reason !== void 0) {
      const record = records[outcome.index];
      if (record !== void 0) {
        const cleanupFailures = await disposeRecordsInReverse(candidates);
        await Promise.allSettled(candidateOutcomes);
        throw new ChildOperationFailure(recordUse(record), outcome.reason, cleanupFailures);
      }
      throw outcome.reason;
    }
  }
}
async function disposeRecordsInReverse(records) {
  const failures = [];
  for (const record of [...records].reverse()) {
    try {
      await record.fiber.dispose();
    } catch (reason) {
      failures.push(reason);
    }
  }
  return failures;
}
async function reconcile(ctx, state, children) {
  validateKeys(children);
  const groupOwnedServices = /* @__PURE__ */ new Set();
  for (const record of state.records.values()) {
    for (const service of providedNames(record.plugin)) groupOwnedServices.add(service);
  }
  const ordered = orderedChildren(ctx, children, groupOwnedServices);
  await validateChildren(ordered);
  const desired = new Map(ordered.map((child) => [keyFor(child), child]));
  const removed = [...state.records.values()].filter((record) => !desired.has(record.key));
  const changed = [];
  const candidateChildren = [];
  const replacements = [];
  const released = [];
  const retired = [];
  const candidates = [];
  for (const child of ordered) {
    const current = state.records.get(keyFor(child));
    if (current === void 0) {
      candidateChildren.push(child);
    } else if (current.plugin !== child.plugin) {
      candidateChildren.push(child);
      replacements.push({ old: current, child });
    } else if (!sameConfig(current.config, child.config)) {
      changed.push({ record: current, child, config: current.config });
    }
  }
  const desiredServiceProviders = candidateChildren.filter(
    (child) => providedNames(child.plugin).length > 0
  );
  for (const record of removed) {
    if (desiredServiceProviders.some((child) => sharesProvidedService(record.plugin, child.plugin))) {
      released.push(record);
    }
  }
  for (const { old, child } of replacements) {
    if (sharesProvidedService(old.plugin, child.plugin) && !released.includes(old)) {
      released.push(old);
    }
  }
  try {
    const releaseResults = await Promise.allSettled(
      released.map((record) => record.fiber.dispose())
    );
    const releaseFailureIndex = releaseResults.findIndex(
      (result) => result.status === "rejected"
    );
    if (releaseFailureIndex !== -1) {
      const releaseFailure = releaseResults[releaseFailureIndex];
      const releasedRecord = released[releaseFailureIndex];
      if (releaseFailure?.status === "rejected" && releasedRecord !== void 0) {
        throw new ChildOperationFailure(recordUse(releasedRecord), releaseFailure.reason);
      }
      throw releaseFailure;
    }
    const updateTasks = changed.map(({ record, child }) => {
      return Promise.resolve().then(() => record.fiber.update(child.config)).then(() => record.fiber.await()).catch((reason) => {
        throw new ChildOperationFailure(child, reason);
      });
    });
    const updates = /* @__PURE__ */ new Map();
    changed.forEach(({ record }, index) => {
      const task = updateTasks[index];
      if (task !== void 0)
        updates.set(
          record,
          task.then(
            () => void 0,
            () => void 0
          )
        );
    });
    for (const child of candidateChildren) candidates.push(startChild(ctx, child));
    const desiredRecords = new Map(state.records);
    for (const record of candidates) desiredRecords.set(record.key, record);
    const readiness = ordered.map((child) => {
      const record = desiredRecords.get(keyFor(child));
      if (record === void 0) throw new Error(`Group child record missing: ${keyFor(child)}`);
      return record;
    });
    const updateFailure = updateTasks.length === 0 ? void 0 : Promise.race(
      updateTasks.map(
        (task) => task.then(
          () => new Promise(() => {
          }),
          (reason) => reason
        )
      )
    );
    const results = await Promise.allSettled([
      settleRecords(readiness, updateFailure, updates, candidates),
      ...updateTasks
    ]);
    const failure = results.find(
      (result) => result.status === "rejected"
    );
    if (failure !== void 0) throw failure.reason;
    for (const record of removed) {
      if (released.includes(record)) continue;
      retired.push(record);
      try {
        await record.fiber.dispose();
      } catch (retirementReason) {
        throw new ChildOperationFailure(recordUse(record), retirementReason);
      }
    }
    for (const { old } of replacements) {
      if (released.includes(old)) continue;
      retired.push(old);
      try {
        await old.fiber.dispose();
      } catch (retirementReason) {
        throw new ChildOperationFailure(recordUse(old), retirementReason);
      }
    }
  } catch (reason) {
    const operation = reason instanceof ChildOperationFailure ? reason : void 0;
    const primary = operation?.reason ?? reason;
    const rollbackFailures = operation?.cleanupFailures ? [...operation.cleanupFailures] : await disposeRecordsInReverse(candidates);
    for (const { record, config } of changed.reverse()) {
      try {
        const restored = await restoreRecord(ctx, record, config);
        state.records.set(record.key, restored);
      } catch (restoreReason) {
        rollbackFailures.push(restoreReason);
      }
    }
    for (const record of released.reverse()) {
      try {
        const restored = await activateChild(ctx, recordUse(record));
        state.records.set(record.key, restored);
      } catch (restoreReason) {
        rollbackFailures.push(restoreReason);
      }
    }
    for (const record of retired.reverse()) {
      try {
        const restored = await activateChild(ctx, recordUse(record));
        state.records.set(record.key, restored);
      } catch (restoreReason) {
        rollbackFailures.push(restoreReason);
      }
    }
    const fallback = operation?.child ?? ordered[0];
    const primaryError = primary instanceof PluginCompositionError ? primary : fallback === void 0 ? primary : childFailure(fallback);
    if (rollbackFailures.length > 0) {
      throw new AggregateError(
        [primaryError, ...rollbackFailures],
        "plugin Group reconciliation and rollback both failed"
      );
    }
    throw primaryError;
  }
  for (const record of removed) state.records.delete(record.key);
  for (const { old, child } of replacements) {
    state.records.delete(old.key);
    const next = candidates.find((record) => record.key === keyFor(child));
    if (next !== void 0) state.records.set(next.key, next);
  }
  for (const record of candidates) state.records.set(record.key, record);
  for (const { record, child } of changed) record.config = child.config;
}
function definePluginGroup(options) {
  const group = {
    name: options.name,
    async apply(ctx, config) {
      const owner = ctx.fiber;
      let state = owner[groupStateKey];
      if (state === void 0) {
        state = { records: /* @__PURE__ */ new Map() };
        owner[groupStateKey] = state;
      }
      ctx.effect(
        () => async () => {
          state.records.clear();
          delete owner[groupStateKey];
        },
        "plugin-group-state"
      );
      ctx.on(
        "internal/update",
        (nextConfig, _noSave, _next) => reconcile(ctx, state, options.children(nextConfig))
      );
      await reconcile(ctx, state, options.children(config));
    }
  };
  return group;
}

// src/inspection.ts
var FIBER_STATE_BY_CODE = [
  "pending",
  "loading",
  "active",
  "failed",
  "disposed",
  "unloading"
];
function canonicalJson(value) {
  if (value === void 0) return "undefined";
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(",")}}`;
}
function configDigest(value) {
  let hash = 2166136261;
  for (const char of canonicalJson(value)) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
function requiredServices(inject) {
  if (Array.isArray(inject)) {
    return inject.filter((name) => typeof name === "string").sort();
  }
  if (inject !== null && typeof inject === "object") return Object.keys(inject).sort();
  return [];
}
function providedServices(fiber) {
  const names = /* @__PURE__ */ new Set();
  const stores = [
    fiber.store,
    fiber.ctx.reflect.store
  ];
  for (const store of stores) {
    if (store === void 0) continue;
    for (const key of Reflect.ownKeys(store)) {
      const value = store[key];
      if (value !== null && typeof value === "object" && "fiber" in value && (value.fiber === fiber || value.fiber?.uid === fiber.uid) && "name" in value && typeof value.name === "string") {
        names.add(value.name);
      }
    }
  }
  return [...names].sort();
}
function failureFromFiber(fiber) {
  if (fiber.state !== 3) return void 0;
  const cause = fiber._error;
  if (cause !== null && typeof cause === "object" && typeof cause.code === "string" && typeof cause.expected === "string" && typeof cause.hint === "string" && cause.detail !== null && typeof cause.detail === "object") {
    return {
      code: cause.code,
      expected: cause.expected,
      hint: cause.hint,
      detail: cause.detail
    };
  }
  return {
    code: "plugin-fiber-failed",
    expected: "the native Plugin Fiber to settle in an active state",
    hint: "Read the owning Entry, repair its module/config or required service, then reconcile again.",
    detail: {
      reason: cause instanceof Error ? cause.message : String(cause ?? "unknown failure")
    }
  };
}
function projectLiveEntry(loader, entry) {
  const options = entry.options;
  const fiber = entry.fiber;
  const disabled = entry.disabled;
  const state = disabled ? "disabled" : fiber === void 0 ? "missing" : FIBER_STATE_BY_CODE[fiber.state] ?? "unavailable";
  const parent = entry.parent?.ctx.fiber.entry?.id;
  const failure = fiber === void 0 ? void 0 : failureFromFiber(fiber);
  return {
    ...options,
    entryId: entry.id,
    module: options.name,
    realm: loader.realm,
    desiredState: disabled ? "disabled" : "enabled",
    fiberState: state,
    ...parent === void 0 ? {} : { parent },
    requiredServices: requiredServices(fiber?.inject ?? options.inject),
    providedServices: fiber === void 0 ? [] : providedServices(fiber),
    configDigest: configDigest(options.config),
    ...failure === void 0 ? {} : { failure }
  };
}
function inspectCatalogPlugins(loader) {
  return { live: [...loader.entries()].map((entry) => projectLiveEntry(loader, entry)) };
}
var TOOL_API_SERVICE = "toolApi";
function createToolApiPlugin() {
  return {
    name: "forgeax:tool-api",
    provide: TOOL_API_SERVICE,
    apply(ctx) {
      const api = createToolApi();
      ctx.provide(TOOL_API_SERVICE, api);
      ctx.effect(() => async () => {
        await api.dispose();
      });
    }
  };
}
function fiberState(ctx) {
  return ["pending", "loading", "active", "failed", "disposed", "unloading"][ctx.fiber.state] ?? "unknown";
}
function failureFiberState(ctx) {
  const state = fiberState(ctx);
  return state === "failed" || state === "disposed" ? state : "failed";
}
function isThenable(value) {
  return value !== null && (typeof value === "object" || typeof value === "function") && typeof value.then === "function";
}
function gatedEffect(value, wait) {
  if (typeof value === "function") {
    return async () => {
      await wait();
      return value();
    };
  }
  if (isThenable(value)) {
    return Promise.resolve(value).then((resolved) => gatedEffect(resolved, wait));
  }
  if (value !== null && typeof value === "object" && Symbol.iterator in value) {
    return (function* () {
      for (const item of value) yield gatedEffect(item, wait);
    })();
  }
  if (value !== null && typeof value === "object" && Symbol.asyncIterator in value) {
    return (async function* () {
      for await (const item of value) yield gatedEffect(item, wait);
    })();
  }
  return value;
}
function registerToolProvider(value, options, ctx, initialState) {
  const api = ctx.get(TOOL_API_SERVICE, false);
  if (api === void 0) return void 0;
  const fiberId = ctx.fiber.uid;
  const entryId = ctx.fiber.entry?.id;
  const pluginName2 = value.plugin.name ?? "tool-plugin";
  const providerId = options.providerId ?? `${entryId ?? pluginName2}:${fiberId === null ? "disposed" : String(fiberId)}`;
  const input = {
    providerId,
    sourceId: options.sourceId ?? "local",
    realm: options.realm ?? "engine",
    ...fiberId === null ? {} : { fiberId },
    ...options.module === void 0 ? {} : { module: options.module },
    fiberState: fiberState(ctx),
    initialState,
    tools: value.tools
  };
  return api.registerProvider(input);
}
function applyWithToolProvider(value, options, ctx, invoke) {
  const handle = registerToolProvider(value, options, ctx, "pending");
  if (handle === void 0) return invoke();
  const fiber = ctx.fiber;
  const hadOwnEffect = Object.hasOwn(fiber, "effect");
  const previousEffect = fiber.effect;
  const callEffect = (execute, label) => previousEffect.call(
    fiber,
    execute,
    label
  );
  const waitForRevocation = () => handle.revoke("ToolPlugin Fiber disposed");
  fiber.effect = ((execute, label) => callEffect(() => gatedEffect(execute(), waitForRevocation), label));
  const restoreEffect = () => {
    if (hadOwnEffect) fiber.effect = previousEffect;
    else Reflect.deleteProperty(fiber, "effect");
  };
  const installProviderCleanup = () => {
    callEffect(
      () => async () => {
        try {
          await waitForRevocation();
        } finally {
          restoreEffect();
        }
      },
      "tool-api/provider"
    );
  };
  const fail = (cause) => {
    handle.fail(cause instanceof Error ? cause.message : String(cause), failureFiberState(ctx));
    restoreEffect();
    throw cause;
  };
  try {
    const result = invoke();
    if (isThenable(result)) {
      return Promise.resolve(result).then(
        (resolved) => {
          handle.activate("active");
          installProviderCleanup();
          return gatedEffect(resolved, waitForRevocation);
        },
        (cause) => fail(cause)
      );
    }
    handle.activate("active");
    installProviderCleanup();
    return gatedEffect(result, waitForRevocation);
  } catch (cause) {
    return fail(cause);
  }
}
function copyPluginMetadata(target, source) {
  for (const key of ["name", "Config", "inject", "provide", "intercept"]) {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (descriptor === void 0) continue;
    Object.defineProperty(target, key, descriptor);
  }
}
function bindToolPlugin(value, options = {}) {
  const plugin = value.plugin;
  if (typeof plugin === "function") {
    if (isConstructor(plugin)) {
      const wrapped3 = function(ctx, config) {
        return applyWithToolProvider(
          value,
          options,
          ctx,
          () => Reflect.construct(plugin, [ctx, config])
        );
      };
      copyPluginMetadata(wrapped3, plugin);
      return wrapped3;
    }
    const wrapped2 = ((ctx, config) => {
      return applyWithToolProvider(value, options, ctx, () => plugin(ctx, config));
    });
    copyPluginMetadata(wrapped2, plugin);
    return wrapped2;
  }
  const wrapped = {
    ...plugin,
    apply(ctx, config) {
      return applyWithToolProvider(value, options, ctx, () => plugin.apply(ctx, config));
    }
  };
  copyPluginMetadata(wrapped, plugin);
  return wrapped;
}

// src/tool-contract.ts
function defineToolCommandContract(commands) {
  return { schemaVersion: "1.0.0", commands: [...commands] };
}
function isToolCommandContract(value) {
  if (value === null || typeof value !== "object") return false;
  const candidate = value;
  return candidate.schemaVersion === "1.0.0" && Array.isArray(candidate.commands);
}

// src/tool-plugin.ts
function defineToolPlugin(plugin, tools) {
  return { plugin, tools: [...tools] };
}
function isToolPlugin(value) {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value;
  return candidate.plugin !== void 0 && Array.isArray(candidate.tools);
}

export { PluginCompositionError, TOOL_API_SERVICE, bindToolPlugin, createContextCapabilityResolver, createToolApiPlugin, definePluginGroup, defineToolCommandContract, defineToolPlugin, inspectCatalogPlugins, isToolCommandContract, isToolPlugin, usePlugin };
