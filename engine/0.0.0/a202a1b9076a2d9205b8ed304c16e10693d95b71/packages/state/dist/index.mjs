import { defineSystemSet, defineSystem, Update, defineComponent } from '../../ecs/dist/index.mjs';
import { worldDespawnScene } from '../../scene/dist/index.mjs';
import { err, ok } from '../../types/dist/index.mjs';

// src/resources.ts
var STATE_PREFIX = "__state__";
var NEXT_STATE_PREFIX = "__nextState__";
var PREVIOUS_STATE_PREFIX = "__previousState__";
function stateResourceKey(token) {
  return `${STATE_PREFIX}${token.name}`;
}
function nextStateResourceKey(token) {
  return `${NEXT_STATE_PREFIX}${token.name}`;
}
function previousStateResourceKey(token) {
  return `${PREVIOUS_STATE_PREFIX}${token.name}`;
}

// src/conditions.ts
function inState(token, variant) {
  const key = stateResourceKey(token);
  const expectedIdx = token.nameToIdx.get(variant);
  if (expectedIdx === void 0) {
    return (_world) => false;
  }
  return (world) => {
    if (!world.hasResource(key)) return false;
    const currentIdx = world.getResource(key);
    return currentIdx === expectedIdx;
  };
}

// src/errors.ts
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
function throwStateError(code, expected, hint, detail) {
  throw makeError(code, expected, hint, detail);
}
function stateNotRegistered(name) {
  return makeError(
    "state-not-registered",
    "registerStatesPlugin(world) must be called before using setNextState / getState",
    `State "${name}" has not been registered via registerStatesPlugin. createApp auto-registers the plugin in both canvas and assemble forms.`,
    { code: "state-not-registered", name }
  );
}
function invalidVariant(name, got, valid) {
  const validSnapshot = [...valid];
  return makeError(
    "invalid-variant",
    `Variant must be one of: ${validSnapshot.join(", ")}`,
    `"${got}" is not a valid variant for state "${name}". Did you mean one of: ${validSnapshot.join(", ")}? Check for typos.`,
    { code: "invalid-variant", name, got, valid: validSnapshot }
  );
}

// src/define-state.ts
var STATE_REGISTRY = /* @__PURE__ */ new Map();
var STATE_DEFINED_LISTENERS = /* @__PURE__ */ new Set();
function getRegisteredTokens() {
  return STATE_REGISTRY;
}
function onStateDefined(listener) {
  STATE_DEFINED_LISTENERS.add(listener);
  return () => STATE_DEFINED_LISTENERS.delete(listener);
}
function defineState(name, variants) {
  if (STATE_REGISTRY.has(name)) {
    throwStateError(
      "state-already-defined",
      "Each StateToken name must be registered exactly once at module level",
      `State "${name}" is already defined. Use the existing token.`,
      { code: "state-already-defined", name, firstDefinedAt: void 0 }
    );
  }
  if (variants.length === 0) {
    throwStateError(
      "state-default-required",
      "defineState requires at least one variant (non-empty array)",
      `State "${name}" was defined with an empty variants array. Provide at least one variant, e.g. defineState("${name}", ["default"] as const).`,
      { code: "state-default-required", name }
    );
  }
  const seen = /* @__PURE__ */ new Set();
  for (const v of variants) {
    if (seen.has(v)) {
      throwStateError(
        "state-default-required",
        "Variants must be unique within a state token",
        `State "${name}" has duplicate variant "${v}". Each variant must appear exactly once.`,
        { code: "state-default-required", name }
      );
    }
    seen.add(v);
  }
  const nameToIdx = /* @__PURE__ */ new Map();
  for (let i = 0; i < variants.length; i++) {
    nameToIdx.set(variants[i], i);
  }
  const token = {
    __forgeaxState: void 0,
    name,
    variants,
    nameToIdx,
    defaultValue: variants[0]
  };
  STATE_REGISTRY.set(name, token);
  for (const listener of STATE_DEFINED_LISTENERS) listener(token);
  return token;
}

// src/on-enter-on-exit.ts
var ON_ENTER_LABEL_PREFIX = "__OnEnter__";
var ON_EXIT_LABEL_PREFIX = "__OnExit__";
var _registry = /* @__PURE__ */ new Map();
function makeLabel(tokenName, prefix, variant) {
  return `${tokenName}${prefix}${variant}`;
}
function OnEnter(token, variant) {
  return makeLabel(token.name, ON_ENTER_LABEL_PREFIX, variant);
}
function OnExit(token, variant) {
  return makeLabel(token.name, ON_EXIT_LABEL_PREFIX, variant);
}
function addOnEnter(token, variant, fn) {
  const label = OnEnter(token, variant);
  return _add(label, fn);
}
function addOnExit(token, variant, fn) {
  const label = OnExit(token, variant);
  return _add(label, fn);
}
function _add(label, fn) {
  let entries = _registry.get(label);
  if (!entries) {
    entries = [];
    _registry.set(label, entries);
  }
  const id = /* @__PURE__ */ Symbol();
  entries.push({ id, fn });
  return () => {
    const list = _registry.get(label);
    if (!list) return;
    const idx = list.findIndex((e) => e.id === id);
    if (idx !== -1) {
      list.splice(idx, 1);
    }
  };
}
function getCallbacks(label) {
  const entries = _registry.get(label);
  if (!entries) return [];
  return entries.map((e) => e.fn);
}
var SCOPED_COMPONENTS = /* @__PURE__ */ new Map();
var SCOPED_MODE_VALUE = { exit: 0, enter: 1 };
function getOrCreateScopedComponent(token) {
  const existing = SCOPED_COMPONENTS.get(token.name);
  if (existing) return existing;
  const valueLabels = {};
  token.variants.forEach((v, i) => {
    valueLabels[v] = i;
  });
  const comp = defineComponent(`__scopedTo__${token.name}`, {
    value: { type: "enum", default: 0, labels: valueLabels },
    mode: { type: "enum", default: SCOPED_MODE_VALUE.exit, labels: SCOPED_MODE_VALUE }
  });
  SCOPED_COMPONENTS.set(token.name, comp);
  return comp;
}
function getScopedComponent(token) {
  return getOrCreateScopedComponent(token);
}
function resolveVariantIndex(token, variant) {
  const idx = token.nameToIdx.get(variant);
  if (idx === void 0) {
    throw new Error(
      `Invalid variant "${variant}" for state "${token.name}". Valid: ${token.variants.join(", ")}`
    );
  }
  return idx;
}
function addScopedComponent(world, entity, scoped, value, mode) {
  return world.addComponent(entity, {
    component: scoped,
    // generic ComponentSchema loses the concrete {value, mode} enum-field
    // types; data is u32 at runtime.
    data: { value, mode }
  });
}
function despawnOnExit(world, entity, token, variant) {
  const idx = resolveVariantIndex(token, variant);
  const scoped = getOrCreateScopedComponent(token);
  const result = addScopedComponent(world, entity, scoped, idx, SCOPED_MODE_VALUE.exit);
  if (!result.ok) {
    throw result.error;
  }
}
function despawnOnEnter(world, entity, token, variant) {
  const idx = resolveVariantIndex(token, variant);
  const scoped = getOrCreateScopedComponent(token);
  const result = addScopedComponent(world, entity, scoped, idx, SCOPED_MODE_VALUE.enter);
  if (!result.ok) {
    throw result.error;
  }
}
function registerScopedComponents() {
  for (const token of getRegisteredTokens().values()) {
    getOrCreateScopedComponent(token);
  }
}
function scopeDespawn(world, scopedComponent, mode, value) {
  const query = world.query({ read: [scopedComponent] }).unwrap();
  const despawns = [];
  for (const row of query) {
    const scoped = row.get(scopedComponent);
    if (scoped.mode === mode && scoped.value === value) despawns.push(row.entity);
  }
  const sceneInstance = world.components.resolve("SceneInstance");
  if (sceneInstance !== void 0) {
    for (const e of despawns) {
      if (world.get(e, sceneInstance).ok) worldDespawnScene(world, e);
    }
  }
  for (const e of despawns) {
    world.despawn(e);
  }
}
function transitionStatesSystem(world) {
  for (const token of getRegisteredTokens().values()) {
    const nsKey = nextStateResourceKey(token);
    if (!world.hasResource(nsKey)) continue;
    const ns = world.getResource(nsKey);
    if (ns === void 0) continue;
    const sKey = stateResourceKey(token);
    const prevIdx = world.getResource(sKey);
    const nextIdx = ns.value;
    const force = ns.force;
    if (prevIdx === nextIdx && !force) {
      world.insertResource(nsKey, void 0);
      continue;
    }
    const psKey = previousStateResourceKey(token);
    world.insertResource(psKey, prevIdx);
    world.insertResource(sKey, nextIdx);
    const scopedComponent = world.components.resolve(`__scopedTo__${token.name}`);
    if (scopedComponent) {
      scopeDespawn(world, scopedComponent, SCOPED_MODE_VALUE.exit, prevIdx);
      const prevVariant = token.variants[prevIdx];
      if (prevVariant !== void 0) {
        const exitLabel = OnExit(token, prevVariant);
        for (const fn of getCallbacks(exitLabel)) {
          fn(world);
        }
      }
      scopeDespawn(world, scopedComponent, SCOPED_MODE_VALUE.enter, nextIdx);
      const nextVariant = token.variants[nextIdx];
      if (nextVariant !== void 0) {
        const enterLabel = OnEnter(token, nextVariant);
        for (const fn of getCallbacks(enterLabel)) {
          fn(world);
        }
      }
    }
    const nsAfterCallbacks = world.getResource(nsKey);
    if (nsAfterCallbacks !== void 0 && nsAfterCallbacks.value === ns.value && nsAfterCallbacks.force === ns.force) {
      world.insertResource(nsKey, void 0);
    }
  }
}

// src/register-plugin.ts
var FRAME_START_SCAN_SYSTEM_NAME = "input-frame-start-scan";
var PROPAGATE_TRANSFORMS_SYSTEM = "propagateTransforms";
var TRANSITION_STATES_SYSTEM_NAME = "transitionStates";
var StateSet = defineSystemSet({ name: "state" });
var ACTIVE_STATE_RUNTIMES = /* @__PURE__ */ new WeakSet();
var TransitionStates = defineSystem({
  name: TRANSITION_STATES_SYSTEM_NAME,
  queries: [],
  after: [FRAME_START_SCAN_SYSTEM_NAME],
  before: [PROPAGATE_TRANSFORMS_SYSTEM],
  fn: transitionStatesSystem
});
function registerStatesPlugin(world) {
  if (ACTIVE_STATE_RUNTIMES.has(world)) return () => {
  };
  const resourceKeys = /* @__PURE__ */ new Set();
  const componentLeases = /* @__PURE__ */ new Map();
  const registerToken = (token) => {
    registerScopedComponents();
    const scopedComponent = getScopedComponent(token);
    if (!componentLeases.has(token.name)) {
      const lease = world.components.register(scopedComponent);
      if (!lease.ok) throw lease.error;
      componentLeases.set(token.name, lease.value);
    }
    const defaultValueIdx = token.nameToIdx.get(token.defaultValue);
    if (defaultValueIdx === void 0) return;
    const stateKey = stateResourceKey(token);
    const nextKey = nextStateResourceKey(token);
    const previousKey = previousStateResourceKey(token);
    if (world.hasResource(stateKey)) return;
    resourceKeys.add(stateKey);
    resourceKeys.add(nextKey);
    resourceKeys.add(previousKey);
    world.insertResource(stateKey, defaultValueIdx);
    world.insertResource(nextKey, void 0);
    world.insertResource(previousKey, defaultValueIdx);
  };
  for (const token of getRegisteredTokens().values()) registerToken(token);
  const installed = world.addSystems(Update, StateSet, [TransitionStates]);
  if (!installed.ok) {
    for (const key of resourceKeys) {
      world.removeResource(key);
    }
    throw installed.error;
  }
  const unsubscribe = onStateDefined(registerToken);
  ACTIVE_STATE_RUNTIMES.add(world);
  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    unsubscribe();
    ACTIVE_STATE_RUNTIMES.delete(world);
    world.removeSystem(Update, TRANSITION_STATES_SYSTEM_NAME);
    for (const key of resourceKeys) {
      world.removeResource(key);
    }
    for (const lease of componentLeases.values()) {
      lease.dispose();
    }
  };
}

// src/plugin-factory.ts
function statePlugin() {
  return {
    name: "state",
    inject: ["world"],
    apply(ctx) {
      ctx.effect(() => registerStatesPlugin(ctx.world), "state/systems");
    }
  };
}
function setNextState(world, token, variant) {
  return _runCheckAndWrite(world, token, variant, false);
}
function setNextStateForce(world, token, variant) {
  return _runCheckAndWrite(world, token, variant, true);
}
function _runCheckAndWrite(world, token, variant, force) {
  const nsKey = nextStateResourceKey(token);
  if (!world.hasResource(nsKey)) {
    return err(stateNotRegistered(token.name));
  }
  const idx = token.nameToIdx.get(variant);
  if (idx === void 0) {
    return err(invalidVariant(token.name, variant, token.variants));
  }
  world.insertResource(nsKey, { value: idx, force });
  return ok(void 0);
}
function getState(world, token) {
  const key = stateResourceKey(token);
  if (!world.hasResource(key)) {
    return err(stateNotRegistered(token.name));
  }
  const idx = world.getResource(key);
  const variant = token.variants[idx];
  if (variant === void 0) {
    return err(invalidVariant(token.name, String(idx), token.variants));
  }
  return ok(variant);
}
function getPreviousState(world, token) {
  const key = previousStateResourceKey(token);
  if (!world.hasResource(key)) {
    return err(stateNotRegistered(token.name));
  }
  const idx = world.getResource(key);
  const variant = token.variants[idx];
  if (variant === void 0) {
    return err(invalidVariant(token.name, String(idx), token.variants));
  }
  return ok(variant);
}

export { OnEnter, OnExit, StateSet, addOnEnter, addOnExit, defineState, despawnOnEnter, despawnOnExit, getPreviousState, getState, inState, registerStatesPlugin, setNextState, setNextStateForce, statePlugin };
