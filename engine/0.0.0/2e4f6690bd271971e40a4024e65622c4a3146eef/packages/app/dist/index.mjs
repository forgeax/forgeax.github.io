import { Update, World, createWorldContext, worldPlugin, Disabled, componentDefinition, Time } from '../../ecs/dist/index.mjs';
export { Context } from '../../plugin/dist/browser.mjs';
export { createFullscreenRenderFeature } from '../../render/dist/authoring.mjs';
import { createCatalogSource } from '../../assets-runtime/dist/index.mjs';
import { STANDARD_MATERIAL_PARAM_SCHEMA, STANDARD_PHYSICAL_TEXTURE_FIELDS, derive, STANDARD_PHYSICAL_PARAMETER_NAMES, err, ok } from '../../types/dist/index.mjs';
import { freezeBarrelDistortionMapping, SHADOW_ATLAS_DEFAULT_LAYERS, Camera, MeshFilter, CAMERA_PROJECTION_ORTHOGRAPHIC, perspective, getActiveCamera, setActiveCamera, cameraExposureFromColumns, validateCameraExposure, CAMERA_EXPOSURE_MODE_MANUAL, CAMERA_EXPOSURE_MODE_AUTO, CAMERA_PROJECTION_PERSPECTIVE, renderComponentsPlugin } from '../../render/dist/index.mjs';
import { RhiError } from '../../rhi/dist/index.mjs';
import { attachRecorder, decodeTape, openReplay, decodeToRgba8, buildTapeIndex, replayDeviceRequest, createRhiDebugError } from '../../rhi-debug/dist/index.mjs';
import * as rhiWebgpu from '../../rhi-webgpu/dist/index.mjs';
import * as engineRuntimeModule from '../../runtime/dist/index.mjs';
import { createDevImportTransport, EngineEnvironmentError } from '../../runtime/dist/index.mjs';
import { resolveSharedShaderBundler, loadRhiPack, constructRuntimeRendererHost } from '../../runtime/dist/renderer-host.mjs';
import { createHostAudioConsumer } from '../../audio-webaudio/dist/index.mjs';
import { INPUT_BACKEND_KEY, INPUT_SNAPSHOT_RESOURCE_KEY, createInputSnapshot, InputSet, InputFrameStartScan, attachBrowserInputBackend, createCanvasInputBoundary, FRAME_START_SCAN_SYSTEM_NAME, makeCompositeBackend, inputBackendPlugin, ownedInputBackendPlugin, INPUT_MAP_KEY } from '../../input/dist/index.mjs';
import { componentSchema } from '../../ecs/dist/internal.mjs';
import { animationPayloadsPlugin, animationRuntimePlugin } from '../../animation/dist/index.mjs';
import { Transform, Name, GlobalTransform, Children, worldDespawnScene, scenePlugin, ChildOf } from '../../scene/dist/index.mjs';
import { statePlugin } from '../../state/dist/index.mjs';
import { createDebugDraw } from '../../debug-draw/dist/index.mjs';
import { quat, vec3 } from '../../math/dist/index.mjs';
import { pickDisplay } from '../../picking/dist/index.mjs';
import { createProfiler } from '../../profiler/dist/index.mjs';
import { isSerializableValue, createPreviewArtifactManifest, validatePreviewArtifactManifest, createArtifactRef, snapshotStaleError, defineTool, toolJsonSchema } from '../../tool-runtime/dist/index.mjs';

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/internal/ecs-import.ts
function isRecord2(value) {
  return value !== null && typeof value === "object";
}
function projectEcsPublicModule(value) {
  if (!isRecord2(value)) return {};
  const projected = {};
  for (const symbol of ECS_PUBLIC_SYMBOLS) {
    if (symbol in value) projected[symbol] = value[symbol];
  }
  return projected;
}
function createEcsImportModule(importModule) {
  return async (specifier) => {
    const moduleValue = await importModule(specifier);
    return specifier === ECS_MODULE_SPECIFIER ? projectEcsPublicModule(moduleValue) : moduleValue;
  };
}
function canonicalRuntimeModule(moduleValue, world) {
  if (moduleValue === null || typeof moduleValue !== "object") return moduleValue;
  const componentsByName = /* @__PURE__ */ new Map();
  for (const [name, component] of world.components.entries()) {
    if (!componentsByName.has(name)) componentsByName.set(name, component);
  }
  const projected = { ...moduleValue };
  for (const [key, value] of Object.entries(projected)) {
    if (value === null || typeof value !== "object" || !("name" in value)) continue;
    const canonical = componentsByName.get(value.name);
    if (canonical !== void 0) projected[key] = canonical;
  }
  return projected;
}
function createCanonicalEcsImportModule(world, importModule) {
  return createEcsImportModule(
    async (specifier) => canonicalRuntimeModule(await importModule(specifier), world)
  );
}
var ECS_MODULE_SPECIFIER, ECS_PUBLIC_SYMBOLS;
var init_ecs_import = __esm({
  "src/internal/ecs-import.ts"() {
    ECS_MODULE_SPECIFIER = "@forgeax/engine-ecs";
    ECS_PUBLIC_SYMBOLS = Object.freeze([
      "World",
      "Entity",
      "Update",
      "FixedUpdate",
      "Time",
      "FixedTime"
    ]);
  }
});

// src/internal/browser-remote-bridge.ts
var browser_remote_bridge_exports = {};
__export(browser_remote_bridge_exports, {
  installBrowserExecutionBridge: () => installBrowserExecutionBridge,
  installBrowserRemoteBridge: () => installBrowserRemoteBridge,
  serializeBridgeResult: () => serializeBridgeResult
});
function revokeInputLease(input) {
  if (input !== null && typeof input === "object") {
    const value = input;
    value.revokeInjectedLease?.();
    if (value.revokeInjectedLease === void 0) value.clearInjected?.();
  }
}
function beginInputLease(input) {
  if (input !== null && typeof input === "object")
    input.beginInjectedLease?.();
}
function createInputLease(input) {
  if (input !== null && typeof input === "object") {
    const create = input.createInjectedLease;
    if (typeof create === "function") {
      const value = create.call(input);
      return { value, revoke: () => revokeInputLease(value) };
    }
  }
  return { value: input, revoke: () => revokeInputLease(input) };
}
async function installBrowserExecutionBridge(deps) {
  let ws = null;
  let backoff = 1e3;
  let stopped = false;
  const pending = /* @__PURE__ */ new Map();
  const connect = () => {
    if (stopped) return;
    try {
      ws = new WebSocket(`ws://127.0.0.1:${deps.port}/bridge`);
    } catch {
      return;
    }
    ws.addEventListener("open", () => {
      backoff = 1e3;
    });
    ws.addEventListener("message", (event) => {
      let message;
      try {
        message = JSON.parse(typeof event.data === "string" ? event.data : "");
      } catch {
        return;
      }
      if (message.type === "input-clear") {
        deps.clearInput?.();
        return;
      }
      if (message.type === "input-lease-open") {
        deps.beginInputLease?.();
        return;
      }
      if (message.type === "profile-finish") {
        deps.finishProfiler?.({
          ...message.worldIdentity === void 0 ? {} : { worldIdentity: message.worldIdentity },
          ...message.captureId === void 0 ? {} : { captureId: message.captureId }
        });
        return;
      }
      if (!Number.isSafeInteger(message.id)) return;
      const id = message.id;
      if (message.type === "cancel") {
        const call2 = pending.get(id);
        if (call2 !== void 0) {
          void call2.cancel().then((admitted) => {
            try {
              ws?.send(JSON.stringify({ type: "canceled", id, admitted }));
            } catch {
            }
          });
        }
        return;
      }
      if (message.type !== "eval" || typeof message.code !== "string") return;
      const call = deps.execute(message.code, message.worldIdentity);
      pending.set(id, call);
      void call.started.then(
        () => {
          try {
            ws?.send(JSON.stringify({ type: "started", id }));
          } catch {
          }
        },
        () => {
        }
      );
      void call.then(
        (value) => {
          pending.delete(id);
          try {
            ws?.send(
              JSON.stringify({
                type: "result",
                id,
                payload: serializeBridgeResult({ ok: true, value })
              })
            );
          } catch {
          }
        },
        (error) => {
          pending.delete(id);
          try {
            ws?.send(
              JSON.stringify({
                type: "result",
                id,
                payload: serializeBridgeResult({ ok: false, error })
              })
            );
          } catch {
          }
        }
      );
    });
    const retry = () => {
      deps.clearInput?.();
      ws = null;
      if (stopped) return;
      setTimeout(connect, backoff);
      backoff = Math.min(backoff * 2, 15e3);
    };
    ws.addEventListener("close", retry);
    ws.addEventListener("error", () => {
      try {
        ws?.close();
      } catch {
      }
    });
  };
  connect();
  const teardown = () => {
    if (stopped) return;
    stopped = true;
    deps.clearInput?.();
    for (const call of pending.values()) call.cancel();
    pending.clear();
    const current = ws;
    ws = null;
    if (current !== null) {
      current.onclose = null;
      current.close();
    }
  };
  const hot = import.meta.hot;
  if (hot) hot.dispose(teardown);
  return teardown;
}
function serializeError(error) {
  if (error !== null && typeof error === "object") {
    const e = error;
    const out = {
      code: typeof e.code === "string" ? e.code : "script-runtime-error"
    };
    if (typeof e.expected === "string") out.expected = e.expected;
    if (typeof e.hint === "string") out.hint = e.hint;
    if (e.detail !== void 0) out.detail = e.detail;
    if (out.hint === void 0 && typeof e.message === "string") out.hint = e.message;
    return out;
  }
  return { code: "script-runtime-error", hint: String(error) };
}
function isArrayIndex(key) {
  const index = Number(key);
  return Number.isInteger(index) && index >= 0 && index < 4294967295 && String(index) === key;
}
function assertJsonSafe(value, ancestors = /* @__PURE__ */ new WeakSet()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non-finite number");
    return;
  }
  if (typeof value === "undefined" || typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") {
    throw new TypeError("value is not JSON-safe");
  }
  if (typeof value !== "object") throw new TypeError("value is not JSON-safe");
  if (ancestors.has(value)) throw new TypeError("cyclic value");
  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    throw new TypeError("custom object prototype");
  }
  if (typeof value.toJSON === "function") {
    throw new TypeError("custom toJSON");
  }
  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index++) {
        if (!Object.hasOwn(value, index)) throw new TypeError("sparse array");
        assertJsonSafe(value[index], ancestors);
      }
      for (const key of Object.keys(value)) {
        if (!isArrayIndex(key)) throw new TypeError("array property is omitted by JSON");
      }
    } else {
      for (const key of Object.keys(value)) {
        assertJsonSafe(value[key], ancestors);
      }
    }
    for (const symbol of Object.getOwnPropertySymbols(value)) {
      if (Object.prototype.propertyIsEnumerable.call(value, symbol)) {
        throw new TypeError("symbol property is omitted by JSON");
      }
    }
  } finally {
    ancestors.delete(value);
  }
}
function serializeBridgeResult(result) {
  const envelope = result.ok ? { ok: true, value: result.value } : { ok: false, error: serializeError(result.error) };
  try {
    assertJsonSafe(envelope);
    const serialized = JSON.stringify(envelope);
    if (serialized === void 0) throw new TypeError("undefined JSON envelope");
    return envelope;
  } catch {
    return {
      ok: false,
      error: {
        code: "script-result-unserializable",
        expected: "a JSON-serializable eval result",
        hint: "return plain JSON data; omit cyclic values, BigInt, functions, and engine handles"
      }
    };
  }
}
async function installBrowserRemoteBridge(deps) {
  const { world, renderer, assets, rhiCapture, profiler, execution, plugins, simulation, port } = deps;
  const clearSyntheticInput = () => {
    if (simulation === void 0 || simulation === null || typeof simulation !== "object") return;
    const input = simulation.input;
    if (input !== null && typeof input === "object") {
      revokeInputLease(input);
    }
  };
  const mod = await import('../../remote/dist/execute.mjs');
  const executeScript = mod.executeScript;
  const importModule = createCanonicalEcsImportModule(
    world,
    (specifier) => {
      if (specifier === "@forgeax/engine-runtime") return Promise.resolve(deps.runtimeModule);
      const browserSpecifier = specifier.startsWith("@") ? `/@id/${specifier}` : specifier;
      return import(
        /* @vite-ignore */
        browserSpecifier
      );
    }
  );
  let ws = null;
  let backoff = 1e3;
  let stopped = false;
  const evalQueue = [];
  const cancelledEvalIds = /* @__PURE__ */ new Set();
  const runningEvalIds = /* @__PURE__ */ new Set();
  const drainEvalQueue = () => {
    if (evalQueue.length === 0) return;
    const jobs = evalQueue.splice(0, evalQueue.length);
    for (const job of jobs) {
      if (cancelledEvalIds.delete(job.id)) continue;
      if (job.worldIdentity !== world.identity) {
        try {
          ws?.send(
            JSON.stringify({
              type: "result",
              id: job.id,
              payload: {
                ok: false,
                error: {
                  code: "live-world-stale",
                  hint: "The request crossed a World replacement before admission.",
                  detail: { worldIdentity: world.identity }
                }
              }
            })
          );
        } catch {
        }
        continue;
      }
      const reply = (payload) => {
        try {
          ws?.send(JSON.stringify({ type: "result", id: job.id, payload }));
        } catch {
        }
      };
      try {
        ws?.send(JSON.stringify({ type: "started", id: job.id }));
      } catch {
      }
      void (async () => {
        runningEvalIds.add(job.id);
        const baseInput = simulation !== void 0 && simulation !== null && typeof simulation === "object" ? simulation.input : void 0;
        const inputLease = createInputLease(baseInput);
        const simulationForEval = simulation !== void 0 && simulation !== null && typeof simulation === "object" ? { ...simulation, input: inputLease.value } : simulation;
        let res;
        try {
          res = await executeScript(job.code, {
            world,
            renderer,
            assets,
            rhiCapture,
            profiler,
            execution,
            plugins,
            simulation: simulationForEval,
            importModule
          });
        } catch (e) {
          reply({
            ok: false,
            error: { code: "BRIDGE_EVAL_THREW", hint: String(e?.message ?? e) }
          });
          return;
        } finally {
          inputLease.revoke();
          runningEvalIds.delete(job.id);
        }
        reply(serializeBridgeResult(res));
      })();
    }
  };
  world.addSystem(Update, {
    name: "browser-remote-bridge-drain-eval-queue",
    queries: [],
    fn: drainEvalQueue
  }).unwrap();
  const connect = () => {
    if (stopped) return;
    try {
      ws = new WebSocket(`ws://127.0.0.1:${port}/bridge`);
    } catch {
      return;
    }
    ws.addEventListener("open", () => {
      backoff = 1e3;
    });
    ws.addEventListener("message", (ev) => {
      let msg;
      try {
        msg = JSON.parse(typeof ev.data === "string" ? ev.data : "");
      } catch {
        return;
      }
      if (msg.type === "input-clear") {
        clearSyntheticInput();
        return;
      }
      if (msg.type === "input-lease-open") {
        const input = simulation !== void 0 && simulation !== null && typeof simulation === "object" ? simulation.input : void 0;
        beginInputLease(input);
        return;
      }
      if (msg.type === "profile-finish") {
        try {
          const profilerValue = profiler !== void 0 && typeof profiler === "object" ? profiler : void 0;
          const active = profilerValue?.activeSession?.();
          const activeId = profilerValue?.activeCaptureId?.();
          if (active !== void 0 && (msg.worldIdentity === void 0 || msg.worldIdentity === world.identity) && (msg.captureId === void 0 || activeId === msg.captureId)) {
            active.finish?.();
          }
        } catch {
        }
        return;
      }
      if (typeof msg.id !== "number") return;
      if (msg.type === "cancel") {
        const index = evalQueue.findIndex((job) => job.id === msg.id);
        if (index >= 0) {
          evalQueue.splice(index, 1);
          try {
            ws?.send(JSON.stringify({ type: "canceled", id: msg.id, admitted: false }));
          } catch {
          }
        } else {
          const admitted = runningEvalIds.has(msg.id);
          if (!admitted) cancelledEvalIds.add(msg.id);
          try {
            ws?.send(JSON.stringify({ type: "canceled", id: msg.id, admitted }));
          } catch {
          }
        }
        return;
      }
      if (msg.type !== "eval" || typeof msg.code !== "string") return;
      if (msg.worldIdentity !== void 0 && msg.worldIdentity !== world.identity) {
        try {
          ws?.send(
            JSON.stringify({
              type: "result",
              id: msg.id,
              payload: {
                ok: false,
                error: {
                  code: "live-world-stale",
                  hint: "The request belongs to an older World; fetch dev status and retry.",
                  detail: { worldIdentity: world.identity }
                }
              }
            })
          );
        } catch {
        }
        return;
      }
      evalQueue.push({
        id: msg.id,
        code: msg.code,
        worldIdentity: msg.worldIdentity ?? world.identity
      });
    });
    const retry = () => {
      clearSyntheticInput();
      ws = null;
      if (stopped) return;
      setTimeout(connect, backoff);
      backoff = Math.min(backoff * 2, 15e3);
    };
    ws.addEventListener("close", retry);
    ws.addEventListener("error", () => {
      try {
        ws?.close();
      } catch {
      }
    });
  };
  connect();
  const teardown = () => {
    if (stopped) return;
    stopped = true;
    clearSyntheticInput();
    evalQueue.length = 0;
    cancelledEvalIds.clear();
    world.removeSystem(Update, "browser-remote-bridge-drain-eval-queue");
    const s = ws;
    ws = null;
    if (s) {
      try {
        s.onclose = null;
        s.close();
      } catch {
      }
    }
  };
  const hot = import.meta.hot;
  if (hot) hot.dispose(teardown);
  return teardown;
}
var init_browser_remote_bridge = __esm({
  "src/internal/browser-remote-bridge.ts"() {
    init_ecs_import();
  }
});
var DEFAULT_ASSET_CATALOG_URL = "/pack-index.json";
function defaultAssetCatalogUrl() {
  if (typeof document === "undefined" || typeof document.baseURI !== "string") {
    return DEFAULT_ASSET_CATALOG_URL;
  }
  try {
    const base = new URL(document.baseURI);
    if (base.pathname === "/" || base.pathname.length === 0) return DEFAULT_ASSET_CATALOG_URL;
    return new URL("pack-index.json", document.baseURI).href;
  } catch {
    return DEFAULT_ASSET_CATALOG_URL;
  }
}
function assemblyError(kind, cause) {
  return {
    code: "asset-assembly-failed",
    expected: "one AssetRegistry with non-conflicting decoder contributions and one catalog source",
    hint: "inspect the Registry owner, catalog source, and decoder contribution list before retrying App assembly",
    detail: { kind, cause }
  };
}
function createDefaultAssetCatalogSource(runtimeBinding, packIndexUrl = defaultAssetCatalogUrl()) {
  const expectedScope = runtimeBinding === void 0 ? void 0 : { scopeId: runtimeBinding.scopeId, generation: runtimeBinding.generation };
  return createCatalogSource({
    url: runtimeBinding?.catalogUrl ?? packIndexUrl,
    ...expectedScope === void 0 ? {} : { expectedScope }
  });
}
function assembleAssetRuntime(registry, contributions, options = {}) {
  const disposers = [];
  let catalogSource;
  try {
    for (const contribution of contributions) {
      disposers.push(registry.loaders.register(contribution));
    }
    if (options.runtimeBinding !== void 0) {
      registry.configureRuntimeBinding(options.runtimeBinding);
    } else if (registry.packIndexUrl === void 0) {
      registry.configurePackIndex(defaultAssetCatalogUrl());
    }
    catalogSource = options.catalogSource ?? createDefaultAssetCatalogSource(options.runtimeBinding, registry.packIndexUrl);
    registry.setCatalogSource(catalogSource);
  } catch (cause) {
    for (const dispose of disposers.reverse()) dispose();
    return err(assemblyError(contributions[disposers.length]?.kind ?? "catalog", cause));
  }
  const installedCatalogSource = catalogSource;
  const ownsRegistry = options.ownsRegistry === true;
  let disposed = false;
  return ok({
    registry,
    catalogSource: installedCatalogSource,
    decoderContributions: Object.freeze([...contributions]),
    ownsRegistry,
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const dispose of disposers.reverse()) dispose();
      registry.clearCatalogSource();
      if (ownsRegistry) registry.invalidateAll();
    }
  });
}
function createAssetRuntimeAssembly(rendererAssets, options = {}) {
  if (rendererAssets !== void 0 && options.registry !== void 0 && rendererAssets !== options.registry) {
    return err(
      assemblyError(
        "registry",
        new TypeError(
          "Renderer host already owns a different AssetRegistry; this App cannot be assembled with two registry owners"
        )
      )
    );
  }
  const registry = options.registry ?? rendererAssets;
  if (registry === void 0) {
    return err(
      assemblyError(
        "registry",
        new TypeError(
          "AssetRuntimeAssembly requires an AssetRegistry from the renderer host or App options"
        )
      )
    );
  }
  const contributions = options.decoderContributions ?? [];
  return assembleAssetRuntime(registry, contributions, {
    ...options.catalogSource === void 0 ? {} : { catalogSource: options.catalogSource },
    ...options.runtimeBinding === void 0 ? {} : { runtimeBinding: options.runtimeBinding }
  });
}
var FORGEAX_FRAME_SUBMITTED_DATASET = "forgeaxFrameSubmitted";
var FORGEAX_FRAME_SUBMITTED_EVENT = "forgeax:frame-submitted";
var FORGEAX_FRAME_COMPLETED_DATASET = "forgeaxFrameCompleted";
var FORGEAX_FRAME_COMPLETED_EVENT = "forgeax:frame-completed";
var submittedFrame = /* @__PURE__ */ Symbol("forgeax.submitted-frame");
function readBrowserFrameSubmitted(canvas) {
  return canvas[submittedFrame];
}
function resetBrowserFrameSubmitted(canvas) {
  delete canvas[submittedFrame];
  const documentElement = canvas.ownerDocument?.documentElement;
  if (documentElement !== void 0) {
    delete documentElement.dataset[FORGEAX_FRAME_SUBMITTED_DATASET];
    delete documentElement.dataset[FORGEAX_FRAME_COMPLETED_DATASET];
  }
}
function publishBrowserFrameSubmitted(canvas, event) {
  const published = Object.freeze({
    ...event,
    ...event.graphGeneration === void 0 ? {} : { graphGeneration: event.graphGeneration },
    ...event.barrelDistortion === void 0 ? {} : { barrelDistortion: freezeBarrelDistortionMapping(event.barrelDistortion) }
  });
  canvas[submittedFrame] = published;
  const documentElement = canvas.ownerDocument?.documentElement;
  if (documentElement !== void 0) {
    documentElement.dataset[FORGEAX_FRAME_SUBMITTED_DATASET] = String(published.frameId);
  }
  if (typeof CustomEvent === "function" && typeof canvas.dispatchEvent === "function") {
    canvas.dispatchEvent(
      new CustomEvent(FORGEAX_FRAME_SUBMITTED_EVENT, {
        detail: published
      })
    );
  }
}
function subscribeBrowserFrameSubmitted(canvas, listener) {
  if (typeof canvas.addEventListener !== "function") return () => void 0;
  const handler = (event) => {
    const detail = event.detail;
    if (detail === void 0) return;
    listener(detail);
  };
  canvas.addEventListener(FORGEAX_FRAME_SUBMITTED_EVENT, handler);
  return () => canvas.removeEventListener(FORGEAX_FRAME_SUBMITTED_EVENT, handler);
}
function publishBrowserFrameCompleted(canvas, event) {
  const documentElement = canvas.ownerDocument?.documentElement;
  if (documentElement !== void 0) {
    documentElement.dataset[FORGEAX_FRAME_COMPLETED_DATASET] = String(event.frameId);
  }
  if (typeof CustomEvent === "function" && typeof canvas.dispatchEvent === "function") {
    canvas.dispatchEvent(
      new CustomEvent(FORGEAX_FRAME_COMPLETED_EVENT, {
        detail: Object.freeze({ ...event })
      })
    );
  }
}

// src/animation-asset-lookup.ts
function createAnimationPayloadLookup(source) {
  return (guid) => source?.lookup(guid);
}

// src/errors.ts
function summarizeCause(cause) {
  if (cause === null || cause === void 0) return String(cause);
  if (typeof cause !== "object") return String(cause);
  const r = cause;
  const name = typeof r.name === "string" && r.name.length > 0 ? r.name : "Error";
  const code = typeof r.code === "string" && r.code.length > 0 ? r.code : "";
  const message = typeof r.message === "string" ? r.message : "";
  const head = code !== "" ? `${name} ${code}` : name;
  const body = message !== "" ? `: ${message}` : "";
  return `${head}${body}`.replace(/\s*\n+\s*/g, " / ");
}
var AppErrorClass = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    let causeSuffix = "";
    if (args.code === "app-system-update-failed") {
      const d = args.detail;
      const sys = typeof d.systemName === "string" && d.systemName.length > 0 ? ` (system=${d.systemName})` : "";
      causeSuffix = `; cause: ${summarizeCause(d.cause)}${sys}`;
    } else if (args.code === "app-pointer-lock-failed") {
      const d = args.detail;
      causeSuffix = `; path: ${d.path}; cause: ${summarizeCause(d.cause)}`;
    } else if (args.code === "app-plugin-activation-failed") {
      const d = args.detail;
      causeSuffix = `; cause: ${summarizeCause(d.cause)}`;
    } else if (args.code === "app-execution-bootstrap-failed") {
      const d = args.detail;
      causeSuffix = `; phase: ${d.phase}; cause: ${summarizeCause(d.cause)}`;
    } else if (args.code === "app-execution-kernel-failed") {
      const d = args.detail;
      causeSuffix = `; kernel: ${d.kernelName}; cause: ${summarizeCause(d.cause)}`;
    } else if (args.code === "app-execution-rebuild-failed") {
      const d = args.detail;
      causeSuffix = `; cause: ${summarizeCause(d.cause)}`;
    }
    super(`[AppError ${args.code}] expected: ${args.expected}; hint: ${args.hint}${causeSuffix}`);
    this.name = "AppError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    this.detail = args.detail;
  }
};
var AppError = AppErrorClass;
var appErrorPolicy = {
  "app-not-started": {
    expected: 'state must be "running" or "paused" to accept stop/pause/resume; "idle" / "stopped" terminal sinks reject',
    hint: "check getState() before calling stop/pause/resume; rebuild the handle via createApp({...}) when the previous one terminated on device-lost"
  },
  "app-already-running": {
    expected: 'state must be "idle" or "paused" to start; "running" handles ignore subsequent start() calls',
    hint: "call stop() first or audit start() call sites; the second start() is a no-op so state is preserved"
  },
  "app-canvas-detached": {
    expected: "canvas.isConnected === true at createApp(canvas) entry",
    hint: "append the canvas to the document tree before calling createApp(canvas), or use the assemble entry createApp({ renderer, world }) when the host already manages canvas lifetime"
  },
  "app-frame-step-invalid": {
    expected: "stepFrame(deltaSeconds) runs only while the App is paused and deltaSeconds is finite and non-negative",
    hint: "pause the App before deterministic stepping and pass an explicit finite delta; resume after the bounded step sequence completes"
  },
  "app-system-update-failed": {
    expected: "world.update(world), renderer.draw(world), and frame-loop callbacks complete without failure",
    hint: "inspect detail.cause for the original thrown value (EcsError / RhiError / host system bug); detail.systemName names the offending system when the call site can supply it"
  },
  "app-pointer-lock-failed": {
    expected: "pointer-lock request (W3C requestPointerLock or host lockProvider.requestLock) to succeed; failure signals the browser rejected the lock or the host provider threw",
    hint: 'remain in unlocked state; the next trusted click will automatically retry the lock request. inspect detail.path ("w3c" or "provider") and detail.cause to determine the root cause'
  },
  "app-plugin-activation-failed": {
    expected: "every requested Cordis plugin fiber reaches a stable active or pending state",
    hint: "inspect detail.cause and the plugin fiber effects; repair the failing activation before creating the App again"
  },
  "app-execution-worker-unavailable": {
    expected: "the explicitly enabled worker has its required browser capabilities and an Engine Worker owner",
    hint: "inspect detail.worker, detail.reason and detail.missingCapabilities; use auto for capability fallback or enable the Engine Worker dependency"
  },
  "app-execution-bootstrap-failed": {
    expected: "the bootstrap URL imports a module whose default export completes as an ExecutionBootstrapEntry in the selected Engine Realm",
    hint: "inspect detail.phase, moduleUrl and cause; export one default ExecutionBootstrapEntry that creates only realm-local engine state"
  },
  "app-execution-deadline-exceeded": {
    expected: "the execution startup, handshake or frame completes within its configured bounded deadline",
    hint: "inspect detail.phase and timeoutMs; the timed-out Worker has been terminated, so fix startup or frame work before creating a new App"
  },
  "app-execution-kernel-failed": {
    expected: "a shared kernel completes every dispatched shard without leaving a possibly partial World write",
    hint: "do not retry or draw the poisoned World; inspect detail.kernelName and cause, then call app.execution.rebuild()"
  },
  "app-execution-stale-world": {
    expected: "every execution message targets the currently active World identity before it can write",
    hint: "discard the late message and keep the current World; inspect expectedIdentity, receivedIdentity and messageKind"
  },
  "app-execution-rebuild-failed": {
    expected: "explicit rebuild disposes the poisoned World and bootstraps a fresh World identity in the surviving Engine Realm",
    hint: "inspect detail.cause; this App remains stopped, so fix the bootstrap failure or create a new App explicitly"
  }
};
var APP_EXPECTED = Object.fromEntries(
  Object.entries(appErrorPolicy).map(([code, policy]) => [code, policy.expected])
);
var APP_ERROR_HINTS = Object.fromEntries(
  Object.entries(appErrorPolicy).map(([code, policy]) => [code, policy.hint])
);
function isAppError(err19) {
  return err19 instanceof AppErrorClass;
}
function executionBootstrapHostPlugin(host) {
  return {
    name: "execution-bootstrap-host",
    provide: "executionBootstrapHost",
    apply(ctx) {
      ctx.provide("executionBootstrapHost", host);
    }
  };
}
function bootstrapError(phase, moduleUrl, cause) {
  return new AppError({
    code: "app-execution-bootstrap-failed",
    expected: APP_EXPECTED["app-execution-bootstrap-failed"],
    hint: APP_ERROR_HINTS["app-execution-bootstrap-failed"],
    detail: { phase, moduleUrl, cause }
  });
}
function validateExecutionBootstrapData(data, moduleUrl) {
  if (data === void 0) return ok(void 0);
  try {
    structuredClone(data);
    return ok(void 0);
  } catch (cause) {
    return err(bootstrapError("data", moduleUrl, cause));
  }
}
async function loadBootstrapEntry(moduleUrl) {
  let loaded;
  try {
    loaded = await import(
      /* @vite-ignore */
      moduleUrl
    );
  } catch (cause) {
    return err(bootstrapError("import", moduleUrl, cause));
  }
  const entry = loaded.default;
  if (typeof entry !== "function") {
    return err(
      bootstrapError(
        "export",
        moduleUrl,
        new TypeError("default export is not an ExecutionBootstrapEntry function")
      )
    );
  }
  return ok(entry);
}
async function prepareBootstrapEntry(moduleUrl, data) {
  const valid = validateExecutionBootstrapData(data, moduleUrl);
  if (!valid.ok) return valid;
  const loaded = await loadBootstrapEntry(moduleUrl);
  if (!loaded.ok) return loaded;
  try {
    const prepared = await loaded.value(data);
    if (typeof prepared !== "object" || prepared === null || prepared.features !== void 0 && !Array.isArray(prepared.features) || prepared.plugins !== void 0 && !Array.isArray(prepared.plugins) || prepared.configureRenderer !== void 0 && typeof prepared.configureRenderer !== "function") {
      return err(
        bootstrapError(
          "prepare",
          moduleUrl,
          new TypeError("execution bootstrap must return an object with feature and plugin arrays")
        )
      );
    }
    return ok(prepared);
  } catch (cause) {
    return err(bootstrapError("prepare", moduleUrl, cause));
  }
}

// src/execution/types.ts
var EXECUTION_WORKERS = ["engine", "render", "kernels"];
var EXECUTION_CAPABILITY_NAMES = [
  "worker",
  "offscreenCanvas",
  "workerAnimationFrame",
  "workerWebGpu",
  "crossOriginIsolated",
  "sharedArrayBuffer",
  "atomicsWait"
];

// src/execution/capabilities.ts
function unavailableExecutionCapabilities(reason) {
  return Object.fromEntries(
    EXECUTION_CAPABILITY_NAMES.map((name) => [name, { available: false, reason }])
  );
}
function missingExecutionCapabilities(capabilities, required) {
  return required.filter((name) => !capabilities[name].available);
}
function probeWorker(timeoutMs) {
  return new Promise((resolve) => {
    const source = `postMessage({workerAnimationFrame:typeof requestAnimationFrame==='function',workerWebGpu:typeof navigator==='object'&&navigator.gpu!==undefined,atomicsWait:typeof Atomics==='object'&&typeof Atomics.wait==='function'})`;
    const url = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
    const worker = new Worker(url);
    const finish = (result) => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(result);
    };
    const timeout = setTimeout(
      () => finish({ workerAnimationFrame: false, workerWebGpu: false, atomicsWait: false }),
      timeoutMs
    );
    worker.onmessage = (event) => {
      clearTimeout(timeout);
      finish(event.data);
    };
    worker.onerror = () => {
      clearTimeout(timeout);
      finish({ workerAnimationFrame: false, workerWebGpu: false, atomicsWait: false });
    };
  });
}
async function probeExecutionCapabilities(canvas, timeoutMs = 2e3) {
  const workerAvailable = typeof Worker === "function";
  const offscreenAvailable = typeof canvas.transferControlToOffscreen === "function";
  const isolated = globalThis.crossOriginIsolated === true;
  const sabAvailable = typeof SharedArrayBuffer === "function";
  const worker = workerAvailable ? await probeWorker(timeoutMs) : { workerAnimationFrame: false, workerWebGpu: false, atomicsWait: false };
  return {
    worker: {
      available: workerAvailable,
      reason: workerAvailable ? "Worker constructor observed" : "Worker constructor unavailable"
    },
    offscreenCanvas: {
      available: offscreenAvailable,
      reason: offscreenAvailable ? "canvas transferControlToOffscreen observed" : "canvas cannot transfer to OffscreenCanvas"
    },
    workerAnimationFrame: {
      available: worker.workerAnimationFrame,
      reason: worker.workerAnimationFrame ? "requestAnimationFrame observed in DedicatedWorker" : "requestAnimationFrame unavailable in DedicatedWorker"
    },
    workerWebGpu: {
      available: worker.workerWebGpu,
      reason: worker.workerWebGpu ? "navigator.gpu observed in DedicatedWorker" : "navigator.gpu unavailable in DedicatedWorker"
    },
    crossOriginIsolated: {
      available: isolated,
      reason: isolated ? "crossOriginIsolated is true" : "crossOriginIsolated is false"
    },
    sharedArrayBuffer: {
      available: sabAvailable,
      reason: sabAvailable ? "SharedArrayBuffer constructor observed" : "SharedArrayBuffer constructor unavailable"
    },
    atomicsWait: {
      available: worker.atomicsWait,
      reason: worker.atomicsWait ? "Atomics.wait observed in DedicatedWorker" : "Atomics.wait unavailable in DedicatedWorker"
    }
  };
}

// src/execution/schema.ts
var EXECUTION_REPORT_SCHEMA_VERSION = 2;
function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function hasExactKeys(value, keys) {
  const actual = Object.keys(value);
  return actual.length === keys.length && keys.every((key) => key in value);
}
function isMeasurement(value) {
  if (!isRecord(value) || !hasExactKeys(value, ["samples", "p50", "p95", "p99", "jitter"])) {
    return false;
  }
  return Number.isInteger(value.samples) && value.samples > 0 && ["p50", "p95", "p99", "jitter"].every(
    (key) => typeof value[key] === "number" && Number.isFinite(value[key]) && value[key] >= 0
  );
}
function isExecutionReport(value) {
  if (!isRecord(value)) return false;
  if (!hasExactKeys(value, [
    "schemaVersion",
    "workers",
    "capabilities",
    "engine",
    "world",
    "kernelDispatch",
    "frame",
    "performance",
    "audio",
    "fault",
    ..."render" in value ? ["render"] : []
  ])) {
    return false;
  }
  const report = value;
  if (report.schemaVersion !== EXECUTION_REPORT_SCHEMA_VERSION) return false;
  if (!isRecord(report.workers) || !hasExactKeys(report.workers, EXECUTION_WORKERS)) return false;
  for (const worker of EXECUTION_WORKERS) {
    const decision = report.workers[worker];
    if (!isRecord(decision) || !hasExactKeys(decision, ["requested", "enabled", "reason", "missingCapabilities"]))
      return false;
    if (decision.requested !== "auto" && typeof decision.requested !== "boolean") return false;
    if (typeof decision.enabled !== "boolean" || !["enabled", "disabled", "engine-disabled", "capability-unavailable"].includes(
      decision.reason
    ))
      return false;
    if (!Array.isArray(decision.missingCapabilities) || !decision.missingCapabilities.every((name) => EXECUTION_CAPABILITY_NAMES.includes(name)))
      return false;
    if (decision.enabled !== (decision.reason === "enabled")) return false;
    if (decision.requested === false !== (decision.reason === "disabled")) return false;
    if (decision.requested === true && !decision.enabled) return false;
    if (decision.reason === "capability-unavailable" !== decision.missingCapabilities.length > 0)
      return false;
    if (worker !== "engine" && !report.workers.engine.enabled && decision.enabled) return false;
    if (decision.reason === "engine-disabled" && (worker === "engine" || report.workers.engine.enabled))
      return false;
  }
  if (report.capabilities === void 0) return false;
  if (!EXECUTION_CAPABILITY_NAMES.every((name) => {
    const fact = report.capabilities?.[name];
    return typeof fact?.available === "boolean" && typeof fact.reason === "string";
  }))
    return false;
  if (report.render !== void 0) {
    const render = report.render;
    if (!isRecord(render) || !hasExactKeys(render, ["epoch", "state", "submittedFrame", "completedFrame"]))
      return false;
    if (!report.workers.render.enabled || !["alive", "rebuilding", "failed", "stopped"].includes(render.state))
      return false;
    if (!Number.isSafeInteger(render.epoch) || render.epoch < 1 || !Number.isSafeInteger(render.submittedFrame) || !Number.isSafeInteger(render.completedFrame) || render.completedFrame < 0 || render.submittedFrame < render.completedFrame)
      return false;
  }
  const engine = report.engine;
  const world = report.world;
  const dispatch = report.kernelDispatch;
  const frame = report.frame;
  const performance2 = report.performance;
  const audio = report.audio;
  if (!isRecord(engine) || !hasExactKeys(engine, ["realm", "health"])) return false;
  if (engine.realm !== (report.workers.engine.enabled ? "worker" : "host")) return false;
  if (!["idle", "starting", "running", "stopped", "faulted"].includes(engine.health)) {
    return false;
  }
  if (!isRecord(world) || !hasExactKeys(world, ["identity", "health", "partialWrite", "retryable"])) {
    return false;
  }
  if (world.identity !== null && typeof world.identity !== "string") return false;
  if (!["healthy", "poisoned"].includes(world.health)) return false;
  if (typeof world.partialWrite !== "boolean" || typeof world.retryable !== "boolean") return false;
  if (!isRecord(dispatch) || !hasExactKeys(dispatch, ["eligible", "usedShared", "reason", "dispatched", "completed"])) {
    return false;
  }
  if (typeof dispatch.eligible !== "boolean" || typeof dispatch.usedShared !== "boolean")
    return false;
  if (![
    "no-eligible-kernel",
    "zero-work",
    "small-span",
    "forced-inline",
    "shared",
    "poisoned"
  ].includes(dispatch.reason))
    return false;
  if (!Number.isInteger(dispatch.dispatched) || !Number.isInteger(dispatch.completed)) return false;
  if (!isRecord(frame) || !hasExactKeys(frame, ["submitted", "completed", "inFlight", "highWater", "throttledTicks"]))
    return false;
  if (!["submitted", "completed", "inFlight", "highWater", "throttledTicks"].every(
    (key) => Number.isInteger(frame[key]) && frame[key] >= 0
  ))
    return false;
  if (frame.completed > frame.submitted || frame.inFlight !== frame.submitted - frame.completed || frame.highWater < frame.inFlight)
    return false;
  if (!isRecord(performance2) || !hasExactKeys(performance2, ["hostFrameMs", "engineUpdateMs", "kernelWaitMs", "hostAudioMs"]))
    return false;
  for (const key of ["hostFrameMs", "engineUpdateMs", "kernelWaitMs", "hostAudioMs"]) {
    const measurement = performance2[key];
    if (measurement !== null && !isMeasurement(measurement)) return false;
  }
  if (!isRecord(audio) || !hasExactKeys(audio, ["owner", "contextState", "activeSourceCount", "lastError"]))
    return false;
  if (audio.owner !== "host") return false;
  if (!["running", "suspended", "closed"].includes(audio.contextState)) return false;
  if (!Number.isInteger(audio.activeSourceCount) || audio.activeSourceCount < 0)
    return false;
  if (audio.lastError !== null) {
    if (!isRecord(audio.lastError)) return false;
    if (!hasExactKeys(audio.lastError, ["code", "expected", "hint", "detail"])) return false;
    if (typeof audio.lastError.code !== "string" || typeof audio.lastError.expected !== "string" || typeof audio.lastError.hint !== "string")
      return false;
  }
  if (report.fault !== null) {
    if (!isRecord(report.fault)) return false;
    if (!hasExactKeys(report.fault, [
      "source",
      "code",
      "expected",
      "hint",
      "detail",
      "partialWrite",
      "retryable"
    ]))
      return false;
    if (!["bootstrap", "handshake", "runtime", "kernel", "world", "rebuild"].includes(
      report.fault.source
    ))
      return false;
    if (typeof report.fault.code !== "string" || typeof report.fault.expected !== "string" || typeof report.fault.hint !== "string")
      return false;
    if (typeof report.fault.partialWrite !== "boolean" || typeof report.fault.retryable !== "boolean")
      return false;
  }
  return true;
}

// src/execution/report.ts
function createExecutionFrameInspection() {
  return {
    submitted: 0,
    completed: 0,
    inFlight: 0,
    highWater: 0,
    throttledTicks: 0
  };
}
function executionAudioReport(state) {
  const error = state?.lastError ?? null;
  return {
    owner: "host",
    contextState: state?.contextState ?? "suspended",
    activeSourceCount: state?.activeSourceCount ?? 0,
    lastError: error === null ? null : {
      code: error.code,
      expected: error.expected,
      hint: error.hint,
      detail: error.detail
    }
  };
}
function createExecutionReport(capabilities, workers) {
  return {
    schemaVersion: EXECUTION_REPORT_SCHEMA_VERSION,
    workers,
    capabilities,
    engine: {
      realm: workers.engine.enabled ? "worker" : "host",
      health: "idle"
    },
    world: {
      identity: null,
      health: "healthy",
      partialWrite: false,
      retryable: true
    },
    kernelDispatch: {
      eligible: false,
      usedShared: false,
      reason: "no-eligible-kernel",
      dispatched: 0,
      completed: 0
    },
    frame: createExecutionFrameInspection(),
    performance: {
      hostFrameMs: null,
      engineUpdateMs: null,
      kernelWaitMs: null,
      hostAudioMs: null
    },
    audio: executionAudioReport(),
    fault: null
  };
}

// src/execution/control.ts
function cloneExecutionReport(report) {
  return structuredClone(report);
}
function createLocalExecutionControl(initial, providers = {}) {
  let current = cloneExecutionReport(initial);
  return {
    setEngineHealth: (health) => {
      current = { ...current, engine: { ...current.engine, health } };
    },
    report: () => cloneExecutionReport({
      ...current,
      world: providers.world?.() ?? current.world,
      frame: providers.frame?.() ?? current.frame,
      audio: executionAudioReport(providers.audio?.())
    }),
    rebuild: async () => err(
      new AppError({
        code: "app-execution-rebuild-failed",
        expected: APP_EXPECTED["app-execution-rebuild-failed"],
        hint: APP_ERROR_HINTS["app-execution-rebuild-failed"],
        detail: {
          worldIdentity: current.world.identity,
          cause: new Error("This local assembly has no bootstrap module.")
        }
      })
    )
  };
}
var ENGINE_CAPABILITIES = ["worker", "offscreenCanvas", "workerWebGpu"];
var REQUIRED = {
  engine: ENGINE_CAPABILITIES,
  render: ENGINE_CAPABILITIES,
  kernels: ["worker", "crossOriginIsolated", "sharedArrayBuffer", "atomicsWait"]
};
function selectExecutionWorkers(input) {
  const decisions = {};
  for (const worker of EXECUTION_WORKERS) {
    const requested = input.workers?.[worker] ?? "auto";
    const missingCapabilities = missingExecutionCapabilities(input.capabilities, REQUIRED[worker]);
    const reason = requested === false ? "disabled" : worker !== "engine" && !decisions.engine.enabled ? "engine-disabled" : missingCapabilities.length > 0 ? "capability-unavailable" : "enabled";
    if (requested === true && (reason === "engine-disabled" || reason === "capability-unavailable")) {
      return err(
        new AppError({
          code: "app-execution-worker-unavailable",
          expected: APP_EXPECTED["app-execution-worker-unavailable"],
          hint: APP_ERROR_HINTS["app-execution-worker-unavailable"],
          detail: { worker, reason, missingCapabilities }
        })
      );
    }
    decisions[worker] = {
      requested,
      enabled: reason === "enabled",
      reason,
      missingCapabilities: reason === "capability-unavailable" ? missingCapabilities : []
    };
  }
  return ok(decisions);
}
function normalizeExecutionBootstrapUrl(bootstrap) {
  const moduleUrl = typeof bootstrap === "string" ? bootstrap : bootstrap.href;
  try {
    return ok(new URL(bootstrap, globalThis.location?.href).href);
  } catch (cause) {
    return err(
      new AppError({
        code: "app-execution-bootstrap-failed",
        expected: APP_EXPECTED["app-execution-bootstrap-failed"],
        hint: APP_ERROR_HINTS["app-execution-bootstrap-failed"],
        detail: {
          phase: "prepare",
          moduleUrl,
          cause: cause instanceof TypeError ? cause : new TypeError(String(cause))
        }
      })
    );
  }
}

// src/internal/error-fanout.ts
var ErrorFanoutRegistry = class {
  listeners = /* @__PURE__ */ new Set();
  silenceUnhandledErrors;
  constructor(opts = {}) {
    this.silenceUnhandledErrors = opts.silenceUnhandledErrors === true;
  }
  /**
   * Register a listener. Returns an unsubscribe function. Calling
   * unsubscribe more than once is a safe no-op (Set.delete returns
   * false on the second call but does not throw). Re-registering the
   * same listener function is a no-op (Set semantics).
   */
  add(cb) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }
  /**
   * Iterate over a snapshot of the listener set so a listener that
   * mutates the set mid-fire does not perturb the iteration. When the
   * set is empty AND silenceUnhandledErrors !== true, call
   * console.error(err) so the unhandled error is visible in devtools
   * (charter P3 explicit failure: silent drop is a footgun).
   */
  fire(err19) {
    if (this.listeners.size === 0) {
      if (!this.silenceUnhandledErrors) {
        console.error(err19);
      }
      return;
    }
    const snapshot = Array.from(this.listeners);
    for (const cb of snapshot) {
      cb(err19);
    }
  }
  /**
   * Number of currently registered listeners. Reserved for diagnostics +
   * test fixtures (e.g. asserting cleanup paths reach the registry); not
   * part of the public app-shell surface.
   *
   * @internal
   */
  _size() {
    return this.listeners.size;
  }
};

// src/types.ts
var APP_PHASE_CATALOG = [
  "frame-total",
  "draw-source",
  "world-update-primary",
  "world-update-injected",
  "renderer-draw",
  "host-frame",
  "engine-update",
  "kernel-wait",
  "host-audio"
];
function shutdownWorker(worker, timeoutMs = 5e3) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      worker.removeEventListener("message", receive);
      worker.terminate();
      resolve(result);
    };
    const failed = (cause) => err(
      new AppError({
        code: "app-system-update-failed",
        expected: APP_EXPECTED["app-system-update-failed"],
        hint: APP_ERROR_HINTS["app-system-update-failed"],
        detail: { cause }
      })
    );
    const receive = (event) => {
      if (event.data.kind !== "disposed") return;
      const error = event.data.error;
      if (error?.code === "app-execution-deadline-exceeded" && error.detail?.phase === "dispose" && typeof error.detail.timeoutMs === "number") {
        finish(
          err(
            new AppError({
              code: "app-execution-deadline-exceeded",
              expected: APP_EXPECTED["app-execution-deadline-exceeded"],
              hint: APP_ERROR_HINTS["app-execution-deadline-exceeded"],
              detail: { phase: "dispose", timeoutMs: error.detail.timeoutMs }
            })
          )
        );
      } else finish(error === void 0 ? ok(void 0) : failed(error));
    };
    const deadline = setTimeout(
      () => finish(
        err(
          new AppError({
            code: "app-execution-deadline-exceeded",
            expected: APP_EXPECTED["app-execution-deadline-exceeded"],
            hint: APP_ERROR_HINTS["app-execution-deadline-exceeded"],
            detail: { phase: "dispose", timeoutMs }
          })
        )
      ),
      timeoutMs
    );
    worker.addEventListener("message", receive);
    try {
      worker.postMessage({ kind: "dispose" });
    } catch (cause) {
      finish(failed(cause));
    }
  });
}

// src/execution/engine-worker.ts
function deadlineError(timeoutMs) {
  return new AppError({
    code: "app-execution-deadline-exceeded",
    expected: APP_EXPECTED["app-execution-deadline-exceeded"],
    hint: APP_ERROR_HINTS["app-execution-deadline-exceeded"],
    detail: { phase: "handshake", timeoutMs }
  });
}
function startupFault(message, moduleUrl) {
  return new AppError({
    code: "app-execution-bootstrap-failed",
    expected: APP_EXPECTED["app-execution-bootstrap-failed"],
    hint: APP_ERROR_HINTS["app-execution-bootstrap-failed"],
    detail: { phase: "bootstrap", moduleUrl, cause: message.detail }
  });
}
async function startEngineWorker(options) {
  const validData = validateExecutionBootstrapData(options.bootstrapData, options.bootstrapUrl);
  if (!validData.ok) return validData;
  const worker = options.workerFactory?.() ?? new Worker(new URL("./engine-worker-runtime.mjs", import.meta.url), {
    type: "module",
    name: "forgeax-engine"
  });
  const listeners = /* @__PURE__ */ new Set();
  let settled = false;
  let resolveReady = () => {
  };
  const readyPromise = new Promise((resolve) => {
    resolveReady = resolve;
  });
  const timeout = setTimeout(() => {
    if (settled) return;
    settled = true;
    worker.terminate();
    resolveReady(err(deadlineError(options.timeoutMs)));
  }, options.timeoutMs);
  worker.onmessage = (event) => {
    const message = event.data;
    if (!settled && message.kind === "ready") {
      settled = true;
      clearTimeout(timeout);
      resolveReady(ok(message));
    } else if (!settled && message.kind === "fault") {
      settled = true;
      clearTimeout(timeout);
      worker.terminate();
      resolveReady(err(startupFault(message, options.bootstrapUrl)));
    }
    for (const listener of listeners) listener(message);
  };
  worker.onerror = (event) => {
    if (settled) {
      const crash = {
        kind: "fault",
        worldIdentity: null,
        source: "runtime",
        code: "worker-crashed",
        expected: "Engine Worker remains alive while the App is running",
        hint: "inspect the Worker error and create a new App; transferred canvas ownership is terminal",
        detail: { message: event.message },
        partialWrite: false,
        retryable: false
      };
      for (const listener of listeners) listener(crash);
      return;
    }
    settled = true;
    clearTimeout(timeout);
    worker.terminate();
    resolveReady(
      err(
        startupFault(
          {
            detail: { message: event.message }},
          options.bootstrapUrl
        )
      )
    );
  };
  const offscreen = options.canvas.transferControlToOffscreen();
  const init = {
    kind: "init",
    startupTimeoutMs: options.timeoutMs,
    canvas: offscreen,
    bootstrapUrl: options.bootstrapUrl,
    ...options.bootstrapData === void 0 ? {} : { bootstrapData: options.bootstrapData },
    ...options.bootstrapPort === void 0 ? {} : { bootstrapPort: options.bootstrapPort },
    ...options.assetCatalog === void 0 ? {} : { assetCatalog: options.assetCatalog },
    ...options.pluginBootstrap === void 0 ? {} : { pluginBootstrap: options.pluginBootstrap },
    ...options.shaderManifestUrl !== void 0 ? { shaderManifestUrl: options.shaderManifestUrl } : {},
    ...options.shaderIndexUrl !== void 0 ? { shaderIndexUrl: options.shaderIndexUrl } : {},
    ...options.shaderRequirementsUrl !== void 0 ? { shaderRequirementsUrl: options.shaderRequirementsUrl } : {},
    ...options.shaderManifestDeltaUrl !== void 0 ? { shaderManifestDeltaUrl: options.shaderManifestDeltaUrl } : {},
    ...options.build !== void 0 ? { build: options.build } : {},
    ...options.time !== void 0 ? { time: options.time } : {},
    ...options.diagnostics === void 0 ? {} : { diagnostics: options.diagnostics },
    workers: options.workers
  };
  worker.postMessage(init, [
    offscreen,
    ...options.bootstrapPort === void 0 ? [] : [options.bootstrapPort]
  ]);
  const ready = await readyPromise;
  if (!ready.ok) return ready;
  let disposal;
  return ok({
    worker,
    ready: ready.value,
    post(message, transfer = []) {
      worker.postMessage(message, transfer);
    },
    listen(listener) {
      if (disposal === void 0) listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      listeners.clear();
      disposal ??= shutdownWorker(worker, 1e4);
      return disposal;
    }
  });
}

// src/execution/measurement.ts
function percentile(sorted, fraction) {
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * fraction) - 1));
  return sorted[index] ?? 0;
}
function createMeasurementSeries(capacity = 240) {
  const values = [];
  let samples = 0;
  return {
    add(value) {
      samples += 1;
      values.push(value);
      if (values.length > capacity) values.shift();
      const sorted = [...values].sort((a, b) => a - b);
      let jitter = 0;
      for (let index = 1; index < values.length; index += 1) {
        jitter += Math.abs((values[index] ?? 0) - (values[index - 1] ?? 0));
      }
      return {
        samples,
        p50: percentile(sorted, 0.5),
        p95: percentile(sorted, 0.95),
        p99: percentile(sorted, 0.99),
        jitter: values.length < 2 ? 0 : jitter / (values.length - 1)
      };
    },
    clear() {
      values.length = 0;
      samples = 0;
    }
  };
}

// src/execution/protocol.ts
var FrameCreditLedger = class {
  constructor(worldIdentity) {
    this.worldIdentity = worldIdentity;
  }
  worldIdentity;
  nextFrameId = 1;
  inFlight = null;
  completed = 0;
  completedCount = 0;
  submitted = 0;
  highWater = 0;
  throttledTicks = 0;
  issue(deltaSeconds, sampleInput, canvasSize = { width: 0, height: 0 }, sampleTimeSeconds, temporalReset = false) {
    if (this.inFlight !== null) {
      this.throttledTicks += 1;
      return void 0;
    }
    const frameId = this.nextFrameId;
    this.nextFrameId += 1;
    this.inFlight = frameId;
    this.submitted += 1;
    this.highWater = Math.max(this.highWater, 1);
    return {
      kind: "frame",
      worldIdentity: this.worldIdentity,
      frameId,
      deltaSeconds,
      ...sampleTimeSeconds === void 0 ? {} : { sampleTimeSeconds },
      ...temporalReset ? { temporalReset: true } : {},
      inputSample: sampleInput(),
      canvasWidth: canvasSize.width,
      canvasHeight: canvasSize.height
    };
  }
  complete(message) {
    if (message.worldIdentity !== this.worldIdentity) return "stale-world";
    if (message.frameId <= this.completed) return "duplicate";
    if (message.frameId !== this.inFlight) return "late";
    this.completed = message.frameId;
    this.completedCount += 1;
    this.inFlight = null;
    return "accepted";
  }
  inspect() {
    return {
      submitted: this.submitted,
      completed: this.completedCount,
      inFlight: this.inFlight === null ? 0 : 1,
      highWater: this.highWater,
      throttledTicks: this.throttledTicks
    };
  }
  get hasCreditInFlight() {
    return this.inFlight !== null;
  }
};

// src/execution/host-controller.ts
function lifecycleError(code) {
  return new AppError({
    code,
    expected: APP_EXPECTED[code],
    hint: APP_ERROR_HINTS[code],
    detail: {}
  });
}
function runtimeError(message) {
  if (message.code === "shared-kernel-failed" && message.worldIdentity !== null) {
    return new AppError({
      code: "app-execution-kernel-failed",
      expected: APP_EXPECTED["app-execution-kernel-failed"],
      hint: APP_ERROR_HINTS["app-execution-kernel-failed"],
      detail: {
        kernelName: message.detail?.kernelName ?? "unknown",
        worldIdentity: message.worldIdentity,
        cause: message.detail,
        partialWrite: true,
        retryable: false
      }
    });
  }
  return new AppError({
    code: "app-system-update-failed",
    expected: APP_EXPECTED["app-system-update-failed"],
    hint: APP_ERROR_HINTS["app-system-update-failed"],
    detail: { cause: message.detail }
  });
}
async function createWorkerExecutionApp(options) {
  const executionOptions = options.appOptions.execution;
  if (executionOptions === void 0) throw new Error("execution options are required");
  const normalizedBootstrap = normalizeExecutionBootstrapUrl(executionOptions.bootstrap);
  if (!normalizedBootstrap.ok) return normalizedBootstrap;
  const bootstrapUrl = normalizedBootstrap.value;
  const startupTimeoutMs = executionOptions.startupTimeoutMs ?? 1e4;
  const frameTimeoutMs = executionOptions.frameTimeoutMs ?? 2e3;
  const syncCanvas = options.syncCanvas;
  let canvas = options.canvas;
  let renderEpoch = 1;
  resetBrowserFrameSubmitted(canvas);
  const started = await startEngineWorker({
    canvas,
    bootstrapUrl,
    ...executionOptions.bootstrapData === void 0 ? {} : { bootstrapData: executionOptions.bootstrapData },
    ...executionOptions.bootstrapPort === void 0 ? {} : { bootstrapPort: executionOptions.bootstrapPort },
    ...executionOptions.assetCatalog === void 0 ? {} : { assetCatalog: executionOptions.assetCatalog },
    ...options.bundler?.shaderManifestUrl !== void 0 ? { shaderManifestUrl: options.bundler.shaderManifestUrl } : {},
    ...options.bundler?.shaderIndexUrl !== void 0 ? { shaderIndexUrl: options.bundler.shaderIndexUrl } : {},
    ...options.bundler?.shaderRequirementsUrl !== void 0 ? { shaderRequirementsUrl: options.bundler.shaderRequirementsUrl } : {},
    ...options.bundler?.shaderManifestDeltaUrl !== void 0 ? { shaderManifestDeltaUrl: options.bundler.shaderManifestDeltaUrl } : {},
    ...options.bundler?.build !== void 0 ? { build: options.bundler.build } : {},
    ...options.appOptions.time !== void 0 ? { time: options.appOptions.time } : {},
    ...executionOptions.diagnostics === void 0 ? {} : { diagnostics: executionOptions.diagnostics },
    timeoutMs: startupTimeoutMs,
    workers: options.selection
  });
  if (!started.ok) return started;
  const session = started.value;
  const profiler = options.appOptions.profiler;
  const phaseCatalogRegistration = profiler?.registerPhaseCatalog("app", APP_PHASE_CATALOG);
  let releasePhaseCatalog = phaseCatalogRegistration?.ok === true ? phaseCatalogRegistration.value : void 0;
  const fanout = new ErrorFanoutRegistry(
    options.appOptions.silenceUnhandledErrors === void 0 ? {} : { silenceUnhandledErrors: options.appOptions.silenceUnhandledErrors }
  );
  const attachInput = () => options.appOptions.input === void 0 ? attachBrowserInputBackend(canvas, {
    ...options.appOptions.uiRoot !== void 0 ? { uiRoot: options.appOptions.uiRoot } : {},
    ...options.appOptions.pointerLockAllowed !== void 0 ? { pointerLockAllowed: options.appOptions.pointerLockAllowed } : {},
    ...options.appOptions.virtualJoysticks !== void 0 ? { virtualJoysticks: options.appOptions.virtualJoysticks } : {},
    ...options.appOptions.lockProvider !== void 0 ? { lockProvider: options.appOptions.lockProvider } : {},
    onLockError: (detail) => fanout.fire(
      new AppError({
        code: "app-pointer-lock-failed",
        expected: APP_EXPECTED["app-pointer-lock-failed"],
        hint: APP_ERROR_HINTS["app-pointer-lock-failed"],
        detail
      })
    )
  }) : void 0;
  let inputHandle = attachInput();
  const physicalInput = {
    sample: () => {
      if (inputHandle === void 0) throw new Error("Host input was detached");
      return inputHandle.backend.sample();
    },
    detach: () => inputHandle?.backend.detach()
  };
  let compositeFactory;
  try {
    const inputModule = await import('../../input/dist/index.mjs');
    compositeFactory = inputModule.makeCompositeBackend;
  } catch {
  }
  const input = options.appOptions.input ?? (inputHandle === void 0 ? void 0 : typeof compositeFactory === "function" ? compositeFactory(physicalInput) : physicalInput) ?? {
    sample: () => ({
      downKeys: /* @__PURE__ */ new Set(),
      upKeys: /* @__PURE__ */ new Set(),
      buttons: [false, false, false],
      movementX: 0,
      movementY: 0,
      wheelDelta: 0,
      focused: true,
      pointerLocked: false
    }),
    detach: () => {
    }
  };
  const clearWorkerInput = () => {
    try {
      session.post({ kind: "input-clear" });
    } catch {
    }
  };
  const beginWorkerInputLease = () => {
    try {
      session.post({ kind: "input-lease-open" });
    } catch {
    }
  };
  const finishWorkerProfiler = (expected) => {
    try {
      session.post({ kind: "profile-finish", ...expected ?? {} });
    } catch {
    }
  };
  const clearHostInjectedInput = () => {
    if (inputHandle === void 0) return;
    const value = input;
    value.revokeInjectedLease?.();
    if (value.revokeInjectedLease === void 0) value.clearInjected?.();
  };
  let report = {
    ...createExecutionReport(options.capabilities, options.selection),
    engine: { realm: "worker", health: "idle" },
    ...options.selection.render.enabled ? { render: { epoch: 1, state: "alive", submittedFrame: 0, completedFrame: 0 } } : {},
    world: {
      identity: session.ready.worldIdentity,
      health: "healthy",
      partialWrite: false,
      retryable: true
    }
  };
  let state = "idle";
  let ledger = new FrameCreditLedger(session.ready.worldIdentity);
  let rafId = 0;
  let lastTimestamp = 0;
  let temporalResetPending = false;
  let frameDeadline;
  let frameAdmission;
  let lastError;
  let rebuildResolve;
  let rebuildInFlight;
  const hostFrameMeasurements = createMeasurementSeries();
  const engineMeasurements = createMeasurementSeries();
  const kernelMeasurements = createMeasurementSeries();
  const audioMeasurements = createMeasurementSeries();
  let audio = createHostAudioConsumer();
  let frameSentAt = 0;
  let profilerCaptureId;
  let profilerFrameId = 0;
  let frameProfile = profiler?.activeSession();
  let profileFrameOpen = false;
  let hostFrameOpen = false;
  let nextInspectionId = 1;
  const pendingInspections = /* @__PURE__ */ new Map();
  const rejectPendingInspections = (error) => {
    for (const pending of pendingInspections.values()) {
      pending.reject(error);
      pending.startedReject(error);
      pending.cancelResolve?.(false);
    }
    pendingInspections.clear();
  };
  const setEngineHealth = (health) => {
    report = {
      ...report,
      engine: { ...report.engine, health },
      ...health === "stopped" && report.render !== void 0 ? { render: { ...report.render, state: "stopped" } } : {}
    };
  };
  const finishProfile = () => {
    if (hostFrameOpen) frameProfile?.endPhase();
    if (profileFrameOpen) frameProfile?.endFrame();
    frameProfile = void 0;
    profileFrameOpen = false;
    hostFrameOpen = false;
    try {
      profiler?.activeSession()?.finish();
    } catch {
    }
    releasePhaseCatalog?.();
    releasePhaseCatalog = void 0;
  };
  const clearFrameAdmissionWatchdog = (expected) => {
    if (expected !== void 0 && (frameAdmission === void 0 || frameAdmission.session !== expected.session || frameAdmission.worldIdentity !== expected.worldIdentity || frameAdmission.frameId !== expected.frameId)) {
      return;
    }
    if (frameDeadline !== void 0) clearTimeout(frameDeadline);
    frameDeadline = void 0;
    frameAdmission = void 0;
  };
  let disposal;
  const disposeSession = () => {
    rebuildResolve?.(err(lifecycleError("app-not-started")));
    rebuildResolve = void 0;
    rebuildInFlight = void 0;
    disposal ??= session.dispose();
    return disposal;
  };
  const terminalFault = (message) => {
    clearFrameAdmissionWatchdog();
    const error = runtimeError(message);
    lastError = error;
    rejectPendingInspections(error);
    state = message.partialWrite ? "faulted" : "stopped";
    report = {
      ...report,
      engine: { ...report.engine, health: "faulted" },
      ...report.render === void 0 ? {} : { render: { ...report.render, state: "failed" } },
      world: {
        identity: message.worldIdentity,
        health: message.partialWrite ? "poisoned" : report.world.health,
        partialWrite: message.partialWrite,
        retryable: message.retryable
      },
      kernelDispatch: {
        ...report.kernelDispatch,
        reason: message.partialWrite ? "poisoned" : report.kernelDispatch.reason
      },
      fault: {
        source: message.source,
        code: message.code,
        expected: message.expected,
        hint: message.hint,
        detail: message.detail,
        partialWrite: message.partialWrite,
        retryable: message.retryable
      }
    };
    fanout.fire(error);
    if (!message.partialWrite) {
      audio.dispose();
      disposeSession();
    }
    finishProfile();
  };
  const armFrameAdmission = (worldIdentity, frameId) => {
    const admission = {
      session,
      worldIdentity,
      frameId
    };
    frameAdmission = admission;
    frameDeadline = setTimeout(() => {
      if (state !== "running" || frameAdmission !== admission) return;
      terminalFault({
        worldIdentity: admission.worldIdentity,
        source: "runtime",
        code: "app-execution-deadline-exceeded",
        expected: APP_EXPECTED["app-execution-deadline-exceeded"],
        hint: APP_ERROR_HINTS["app-execution-deadline-exceeded"],
        detail: { phase: "frame", timeoutMs: frameTimeoutMs },
        partialWrite: false,
        retryable: false
      });
    }, frameTimeoutMs);
  };
  let rafPending = false;
  let renderRecoveryFloor = 0;
  const scheduleFrame = () => {
    if (rafPending) return;
    rafPending = true;
    rafId = requestAnimationFrame((timestamp) => {
      rafPending = false;
      if (state !== "running" || ledger.hasCreditInFlight) return;
      if (report.render !== void 0 && (report.render.state === "rebuilding" || ledger.inspect().submitted - Math.max(renderRecoveryFloor, report.render.completedFrame) >= 2))
        return;
      const deltaSeconds = lastTimestamp === 0 ? 0 : Math.max(0, (timestamp - lastTimestamp) / 1e3);
      lastTimestamp = timestamp;
      const canvasSize = syncCanvas?.(canvas) ?? {
        width: canvas.width,
        height: canvas.height
      };
      const frame = ledger.issue(
        deltaSeconds,
        () => input.sample(),
        canvasSize,
        timestamp / 1e3,
        temporalResetPending
      );
      report = { ...report, frame: ledger.inspect() };
      if (frame === void 0) return;
      frameProfile = profiler?.activeSession();
      if (frameProfile !== void 0 && profilerCaptureId !== frameProfile.captureId) {
        profilerCaptureId = frameProfile.captureId;
        profilerFrameId = 0;
      }
      profileFrameOpen = frameProfile?.beginFrame(++profilerFrameId).ok ?? false;
      hostFrameOpen = profileFrameOpen ? frameProfile?.beginPhase("app", "host-frame").ok ?? false : false;
      frameSentAt = performance.now();
      armFrameAdmission(frame.worldIdentity, frame.frameId);
      session.post(frame);
    });
  };
  const replaceCanvas = () => {
    const replacement = canvas.cloneNode(false);
    clearHostInjectedInput();
    inputHandle?.();
    canvas.replaceWith(replacement);
    canvas = replacement;
    inputHandle = attachInput();
    resetBrowserFrameSubmitted(canvas);
    return canvas.transferControlToOffscreen();
  };
  session.listen((message) => {
    if (disposal !== void 0) return;
    if (message.kind === "render-ready") {
      if (message.epoch !== renderEpoch || state === "stopped" || state === "faulted") return;
      if (report.render !== void 0)
        report = { ...report, render: { ...report.render, state: "alive" } };
      if (ledger.hasCreditInFlight && report.world.identity !== null)
        armFrameAdmission(report.world.identity, ledger.inspect().submitted);
      if (state === "running") scheduleFrame();
      return;
    }
    if (message.kind === "render-lost") {
      if (message.epoch <= renderEpoch || state === "stopped" || state === "faulted") return;
      renderEpoch = message.epoch;
      renderRecoveryFloor = ledger.inspect().completed;
      clearFrameAdmissionWatchdog();
      report = {
        ...report,
        render: { epoch: renderEpoch, state: "rebuilding", submittedFrame: 0, completedFrame: 0 }
      };
      const offscreen = replaceCanvas();
      session.post({ kind: "render-replace", epoch: renderEpoch, canvas: offscreen }, [offscreen]);
      return;
    }
    if (message.kind === "render-submitted" || message.kind === "render-complete") {
      if (message.epoch !== renderEpoch || message.frame.worldIdentity !== report.world.identity || state === "stopped" || state === "faulted")
        return;
      if (message.kind === "render-submitted") {
        report = {
          ...report,
          render: {
            epoch: renderEpoch,
            state: "alive",
            submittedFrame: message.frame.frameId,
            completedFrame: report.render?.completedFrame ?? 0
          }
        };
        publishBrowserFrameSubmitted(canvas, message.frame);
      } else {
        report = {
          ...report,
          render: {
            epoch: renderEpoch,
            state: "alive",
            submittedFrame: report.render?.submittedFrame ?? message.frame.frameId,
            completedFrame: message.frame.frameId
          }
        };
        publishBrowserFrameCompleted(canvas, {
          ...message.frame,
          deviceGeneration: message.frame.deviceGeneration ?? 0,
          presentation: message.frame.presentation ?? "pending"
        });
        if (state === "running") scheduleFrame();
      }
      return;
    }
    if (message.kind === "frame-submitted") {
      const admission = frameAdmission;
      if (admission === void 0 || admission.session !== session || admission.worldIdentity !== report.world.identity || admission.worldIdentity !== message.worldIdentity || admission.frameId !== message.frameId) {
        return;
      }
      clearFrameAdmissionWatchdog(admission);
      publishBrowserFrameSubmitted(canvas, message);
      return;
    }
    if (message.kind === "frame-complete" || message.kind === "simulation-complete") {
      if (ledger.complete(message) !== "accepted") return;
      temporalResetPending = false;
      if (message.kind === "frame-complete")
        publishBrowserFrameCompleted(canvas, {
          frameId: message.frameId,
          deviceGeneration: message.deviceGeneration ?? 0,
          ...message.graphGeneration === void 0 ? {} : { graphGeneration: message.graphGeneration },
          ...message.barrelDistortion === void 0 ? {} : { barrelDistortion: message.barrelDistortion },
          worldIdentity: message.worldIdentity,
          // Completion without the Render receipt's explicit presentation fact
          // is not evidence that the active scene is visible. Fail closed so a
          // protocol omission cannot dismiss the startup screen.
          presentation: message.presentation ?? "pending"
        });
      report = { ...report, frame: ledger.inspect() };
      clearFrameAdmissionWatchdog({
        session,
        worldIdentity: message.worldIdentity,
        frameId: message.frameId
      });
      if (hostFrameOpen) frameProfile?.endPhase();
      if (profileFrameOpen) {
        frameProfile?.recordSkip({
          source: "app",
          phase: "engine-update",
          reason: `worker-report:${message.engineUpdateMs.toFixed(3)}ms`
        });
        frameProfile?.recordSkip({
          source: "app",
          phase: "kernel-wait",
          reason: `worker-report:${message.kernelWaitMs.toFixed(3)}ms`
        });
      }
      const audioStarted = performance.now();
      const audioProfileOpen = profileFrameOpen ? frameProfile?.beginPhase("app", "host-audio").ok ?? false : false;
      for (const intent of message.audioIntents ?? []) audio.consume(intent);
      if (audioProfileOpen) frameProfile?.endPhase();
      const audioMs = performance.now() - audioStarted;
      report = {
        ...report,
        performance: {
          ...report.performance,
          hostFrameMs: hostFrameMeasurements.add(performance.now() - frameSentAt),
          engineUpdateMs: engineMeasurements.add(message.engineUpdateMs),
          kernelWaitMs: kernelMeasurements.add(message.kernelWaitMs),
          hostAudioMs: audioMeasurements.add(audioMs)
        }
      };
      if (message.kernelDispatch !== void 0) {
        report = { ...report, kernelDispatch: message.kernelDispatch };
      }
      if (profileFrameOpen) frameProfile?.endFrame();
      frameProfile = void 0;
      profileFrameOpen = false;
      hostFrameOpen = false;
      if (state === "running") scheduleFrame();
    } else if (message.kind === "fault") {
      terminalFault(message);
    } else if (message.kind === "rebuilt") {
      clearFrameAdmissionWatchdog();
      rejectPendingInspections(
        new Error("The previous World was replaced before inspection execution.")
      );
      audio.dispose();
      audio = createHostAudioConsumer();
      ledger = new FrameCreditLedger(message.worldIdentity);
      renderRecoveryFloor = 0;
      hostFrameMeasurements.clear();
      engineMeasurements.clear();
      kernelMeasurements.clear();
      audioMeasurements.clear();
      state = "idle";
      report = {
        ...report,
        engine: { ...report.engine, health: "idle" },
        // The rebuilt ACK follows complete source, kernel and renderer startup.
        // Its earlier render-ready event was ignored while the old World was faulted.
        ...report.render === void 0 ? {} : {
          render: {
            epoch: renderEpoch,
            state: "alive",
            submittedFrame: 0,
            completedFrame: 0
          }
        },
        world: {
          identity: message.worldIdentity,
          health: "healthy",
          partialWrite: false,
          retryable: true
        },
        kernelDispatch: {
          eligible: false,
          usedShared: false,
          reason: "no-eligible-kernel",
          dispatched: 0,
          completed: 0
        },
        fault: null,
        performance: {
          hostFrameMs: null,
          engineUpdateMs: null,
          kernelWaitMs: null,
          hostAudioMs: null
        },
        frame: ledger.inspect()
      };
      rebuildResolve?.(ok(cloneExecutionReport(report)));
      rebuildResolve = void 0;
      rebuildInFlight = void 0;
    } else if (message.kind === "host-control") {
      if (message.command === "set-pointer-lock-allowed") {
        input.setPointerLockAllowed?.(message.allowed);
      }
    } else if (message.kind === "inspect-result") {
      const pending = pendingInspections.get(message.requestId);
      if (pending === void 0) return;
      pendingInspections.delete(message.requestId);
      if (message.worldIdentity !== pending.worldIdentity) {
        const stale = Object.assign(new Error("The inspection crossed a World rebuild"), {
          code: "live-world-stale"
        });
        if (!pending.settled) {
          pending.settled = true;
          pending.reject(stale);
        }
        pending.startedReject(stale);
        pending.cancelResolve?.(true);
        return;
      }
      pending.startedResolve();
      pending.cancelResolve?.(true);
      if (!pending.settled) {
        pending.settled = true;
        if (message.result.ok) pending.resolve(message.result.value);
        else pending.reject(message.result.error);
      }
    } else if (message.kind === "inspect-started") {
      const pending = pendingInspections.get(message.requestId);
      if (pending === void 0) return;
      if (message.worldIdentity !== pending.worldIdentity) {
        const stale = Object.assign(new Error("The inspection crossed a World rebuild"), {
          code: "live-world-stale"
        });
        pending.startedReject(stale);
        return;
      }
      pending.startedResolve();
    } else if (message.kind === "inspect-canceled") {
      const pending = pendingInspections.get(message.requestId);
      if (pending === void 0) return;
      if (message.worldIdentity !== pending.worldIdentity) {
        const stale = Object.assign(new Error("The inspection crossed a World rebuild"), {
          code: "live-world-stale"
        });
        pending.cancelResolve?.(true);
        pending.startedReject(stale);
        if (!pending.settled) {
          pending.settled = true;
          pending.reject(stale);
        }
        pendingInspections.delete(message.requestId);
        return;
      }
      pending.cancelResolve?.(message.admitted);
      pending.cancelResolve = void 0;
      if (message.admitted) {
        pending.startedResolve();
      } else {
        pendingInspections.delete(message.requestId);
        const cancelled = Object.assign(
          new Error("The inspection was cancelled before Worker admission"),
          { code: "live-eval-cancelled-before-execution" }
        );
        if (!pending.settled) {
          pending.settled = true;
          pending.reject(cancelled);
        }
        pending.startedReject(cancelled);
      }
    }
  });
  const remoteEval = (code, expectedWorldIdentity = report.world.identity ?? session.ready.worldIdentity) => {
    const requestId = nextInspectionId++;
    let resolveStarted;
    let rejectStarted;
    const started2 = new Promise((resolve, reject) => {
      resolveStarted = resolve;
      rejectStarted = reject;
    });
    void started2.catch(() => void 0);
    let resolveResult;
    let rejectResult;
    const result = new Promise((resolve, reject) => {
      resolveResult = resolve;
      rejectResult = reject;
    });
    pendingInspections.set(requestId, {
      resolve: resolveResult,
      reject: rejectResult,
      startedResolve: resolveStarted,
      startedReject: rejectStarted,
      worldIdentity: expectedWorldIdentity,
      settled: false,
      cancelRequested: false,
      cancelResolve: void 0
    });
    session.post({ kind: "inspect", requestId, code, worldIdentity: expectedWorldIdentity });
    let cancelPromise;
    const cancel = () => {
      const pending = pendingInspections.get(requestId);
      if (pending === void 0) return Promise.resolve(true);
      if (cancelPromise !== void 0) return cancelPromise;
      pending.cancelRequested = true;
      cancelPromise = new Promise((resolve) => {
        pending.cancelResolve = resolve;
      });
      try {
        session.post({ kind: "inspect-cancel", requestId, worldIdentity: expectedWorldIdentity });
      } catch {
        pending.cancelResolve?.(true);
        pending.cancelResolve = void 0;
      }
      return cancelPromise;
    };
    return Object.assign(result, { started: started2, cancel });
  };
  const execution = {
    report: () => cloneExecutionReport({
      ...report,
      audio: executionAudioReport(audio.state())
    }),
    rebuild: () => {
      if (rebuildInFlight !== void 0) return rebuildInFlight;
      if (state !== "faulted" || report.world.identity === null) {
        return Promise.resolve(
          err(
            new AppError({
              code: "app-execution-rebuild-failed",
              expected: APP_EXPECTED["app-execution-rebuild-failed"],
              hint: APP_ERROR_HINTS["app-execution-rebuild-failed"],
              detail: {
                worldIdentity: report.world.identity,
                cause: new Error("World is not in a rebuildable poisoned state.")
              }
            })
          )
        );
      }
      rebuildInFlight = new Promise((resolve) => {
        rebuildResolve = resolve;
        if (options.selection.render.enabled) {
          const offscreen = replaceCanvas();
          renderEpoch = 1;
          report = {
            ...report,
            render: { epoch: 1, state: "rebuilding", submittedFrame: 0, completedFrame: 0 }
          };
          session.post(
            { kind: "rebuild", worldIdentity: report.world.identity, canvas: offscreen },
            [offscreen]
          );
        } else session.post({ kind: "rebuild", worldIdentity: report.world.identity });
        setTimeout(() => {
          if (rebuildResolve !== resolve) return;
          rebuildResolve = void 0;
          rebuildInFlight = void 0;
          resolve(
            err(
              new AppError({
                code: "app-execution-deadline-exceeded",
                expected: APP_EXPECTED["app-execution-deadline-exceeded"],
                hint: APP_ERROR_HINTS["app-execution-deadline-exceeded"],
                detail: { phase: "handshake", timeoutMs: startupTimeoutMs }
              })
            )
          );
        }, startupTimeoutMs);
      });
      return rebuildInFlight;
    }
  };
  const app = {
    get canvas() {
      return canvas;
    },
    execution,
    remoteEval,
    input,
    start: () => {
      if (state === "running") return err(lifecycleError("app-already-running"));
      if (state === "stopped" || state === "faulted") return err(lifecycleError("app-not-started"));
      const wasPaused = state === "paused";
      state = "running";
      setEngineHealth("running");
      lastTimestamp = 0;
      temporalResetPending = wasPaused;
      scheduleFrame();
      return ok(void 0);
    },
    stop: () => {
      if (state !== "running" && state !== "paused") return err(lifecycleError("app-not-started"));
      if (state === "running") cancelAnimationFrame(rafId);
      rafPending = false;
      state = "stopped";
      clearFrameAdmissionWatchdog();
      clearHostInjectedInput();
      inputHandle?.();
      clearWorkerInput();
      audio.dispose();
      rejectPendingInspections(new Error("App stopped before inspection completed."));
      void disposeSession();
      setEngineHealth("stopped");
      finishProfile();
      return ok(void 0);
    },
    dispose: async () => {
      if (state === "running" || state === "paused") {
        if (state === "running") cancelAnimationFrame(rafId);
        rafPending = false;
        clearFrameAdmissionWatchdog();
        clearHostInjectedInput();
        inputHandle?.();
        clearWorkerInput();
        audio.dispose();
        state = "stopped";
        setEngineHealth("stopped");
        finishProfile();
      } else if (state !== "stopped") {
        clearFrameAdmissionWatchdog();
        clearHostInjectedInput();
        inputHandle?.();
        clearWorkerInput();
        audio.dispose();
        state = "stopped";
        setEngineHealth("stopped");
        finishProfile();
      }
      rejectPendingInspections(new Error("App disposed before inspection completed."));
      return await disposeSession();
    },
    pause: () => {
      if (state !== "running") return err(lifecycleError("app-not-started"));
      state = "paused";
      cancelAnimationFrame(rafId);
      rafPending = false;
      return ok(void 0);
    },
    resume: () => {
      if (state !== "paused") return err(lifecycleError("app-not-started"));
      state = "running";
      lastTimestamp = 0;
      temporalResetPending = true;
      scheduleFrame();
      return ok(void 0);
    },
    onError: (listener) => fanout.add(listener),
    get lastError() {
      return lastError;
    },
    clearInput: clearWorkerInput,
    beginInputLease: beginWorkerInputLease,
    finishProfiler: finishWorkerProfiler
  };
  return ok(app);
}
function createRenderFeatureHost(host) {
  return {
    async installFeature(feature) {
      const installed = await host.installRenderFeature(feature);
      if (!installed.ok) return installed;
      let released = false;
      return {
        ok: true,
        value: {
          release: async () => {
            if (released) return { ok: true, value: void 0 };
            released = true;
            return host.uninstallRenderFeature(feature);
          }
        }
      };
    }
  };
}
var POINT_SHADOW_PLUGIN_ID = "forgeax::point-shadow";
var PointShadowRecipeError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(code, detail) {
    const policy = {
      "point-shadow-capability-missing": {
        expected: "the renderer exposes the storage-buffer lane required by the point-shadow recipe",
        hint: "choose a renderer/backend with storageBuffer support or keep point shadows disabled"
      },
      "point-shadow-budget-exceeded": {
        expected: `requested point shadows fit the atlas capacity (${SHADOW_ATLAS_DEFAULT_LAYERS})`,
        hint: `reduce PointLightShadow casters to ${SHADOW_ATLAS_DEFAULT_LAYERS} or fewer`
      },
      "point-shadow-invalid-request": {
        expected: "requested point shadows are a non-negative safe integer",
        hint: "pass a non-negative integer count to pointShadow.admit()"
      }
    };
    super(`point-shadow recipe rejected: ${code}`);
    this.name = "PointShadowRecipeError";
    this.code = code;
    this.expected = policy[code].expected;
    this.hint = policy[code].hint;
    this.detail = detail;
  }
};
var INACTIVE_POINT_SHADOW = Object.freeze({
  status: "inactive",
  requested: 0,
  admitted: 0,
  shadowed: 0,
  shadowAtlasOccupancy: 0,
  shadowAtlasCapacity: SHADOW_ATLAS_DEFAULT_LAYERS
});
function admitPointShadowBudget(requested, capabilityAvailable) {
  const detail = {
    requested,
    capacity: SHADOW_ATLAS_DEFAULT_LAYERS
  };
  if (!capabilityAvailable) {
    return err(
      new PointShadowRecipeError("point-shadow-capability-missing", {
        ...detail,
        capability: "storageBuffer"
      })
    );
  }
  if (!Number.isSafeInteger(requested) || requested < 0) {
    return err(new PointShadowRecipeError("point-shadow-invalid-request", detail));
  }
  if (requested > SHADOW_ATLAS_DEFAULT_LAYERS) {
    return err(new PointShadowRecipeError("point-shadow-budget-exceeded", detail));
  }
  return ok(requested);
}
function pointShadowPlugin() {
  return {
    name: POINT_SHADOW_PLUGIN_ID,
    inject: ["renderer"],
    provide: "pointShadow",
    apply(ctx) {
      const renderer = ctx.renderer;
      if (renderer === void 0) {
        throw new PointShadowRecipeError("point-shadow-capability-missing", {
          requested: 0,
          capacity: SHADOW_ATLAS_DEFAULT_LAYERS,
          capability: "storageBuffer"
        });
      }
      const capability = {
        inspect() {
          const inspection = renderer.inspect().pointShadow;
          return Object.freeze({ ...inspection ?? INACTIVE_POINT_SHADOW });
        },
        admit(requested) {
          return admitPointShadowBudget(
            requested,
            renderer.inspect().capabilities.storageBuffer === true
          );
        }
      };
      ctx.provide("pointShadow", capability);
    }
  };
}
function rendererPlugin(renderer) {
  return {
    name: "renderer",
    provide: "renderer",
    apply(ctx) {
      ctx.provide("renderer", renderer);
    }
  };
}
function ownedRendererPlugin(renderer) {
  return {
    name: "renderer",
    provide: "renderer",
    apply(ctx) {
      ctx.provide("renderer", renderer);
      ctx.effect(() => () => renderer.dispose(), "render/renderer");
    }
  };
}
function renderFeatureHostPlugin(host) {
  return {
    name: "render-feature-host",
    provide: "renderFeatureHost",
    apply(ctx) {
      ctx.provide("renderFeatureHost", host);
    }
  };
}
function renderFeaturePlugin(feature) {
  return {
    name: `render-feature:${feature.identity}`,
    inject: ["renderFeatureHost"],
    async apply(ctx) {
      if (ctx.renderFeatureHost === void 0) {
        throw new Error("render-feature host capability is unavailable in this App realm");
      }
      const installed = await ctx.renderFeatureHost.installFeature(feature);
      if (!installed.ok) throw installed.error;
      ctx.effect(
        () => async () => {
          const removed = await installed.value.release();
          if (!removed.ok) throw removed.error;
        },
        `render-feature/${feature.identity}`
      );
    }
  };
}

// src/internal/assets-world-plugin.ts
var ASSET_REGISTRY_RESOURCE_KEY = "AssetRegistry";
function rendererAssetsPlugin(assets) {
  return {
    name: "renderer-assets",
    inject: ["renderer"],
    provide: "assets",
    apply(ctx) {
      if (assets !== void 0) ctx.provide("assets", assets);
    }
  };
}
function assetRegistryPlugin(assembly) {
  return {
    name: "asset-registry",
    provide: "assets",
    apply(ctx) {
      ctx.provide("assets", assembly.registry);
      ctx.effect(() => () => assembly.dispose(), "assets/registry");
    }
  };
}
function assetsWorldPlugin() {
  return {
    name: "assets-world",
    inject: ["world", "assets"],
    apply(ctx) {
      if (ctx.assets === void 0) return;
      ctx.effect(() => {
        ctx.world.insertResource(ASSET_REGISTRY_RESOURCE_KEY, ctx.assets);
        return () => {
          ctx.world.removeResource(ASSET_REGISTRY_RESOURCE_KEY);
        };
      }, "assets/world-resource");
    }
  };
}

// src/internal/assembled-engine-profile.ts
function assembledEngineProfile(options) {
  return [
    rendererPlugin(options.renderer),
    ...options.assetAssembly === void 0 ? [rendererAssetsPlugin(options.assets)] : [assetRegistryPlugin(options.assetAssembly)],
    assetsWorldPlugin(),
    ...options.extensions ?? []
  ];
}
function projectJson(value, seen) {
  if (value === null) return null;
  if (typeof value === "boolean" || typeof value === "string") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : void 0;
  if (typeof value !== "object") return void 0;
  if (seen.has(value)) return void 0;
  seen.add(value);
  if (ArrayBuffer.isView(value)) {
    const values = Array.from(value);
    const projected = values.map((entry) => projectJson(entry, seen));
    seen.delete(value);
    return projected.every((entry) => entry !== void 0) ? projected : void 0;
  }
  if (Array.isArray(value)) {
    const projected = value.map((entry) => projectJson(entry, seen));
    seen.delete(value);
    return projected.every((entry) => entry !== void 0) ? projected : void 0;
  }
  const object = {};
  for (const [key, entry] of Object.entries(value)) {
    const projected = projectJson(entry, seen);
    if (projected !== void 0) object[key] = projected;
  }
  seen.delete(value);
  return object;
}
function isJsonRecord(value) {
  return value !== void 0 && value !== null && typeof value === "object" && !Array.isArray(value);
}
function projectMeta(meta) {
  const projected = projectJson(meta, /* @__PURE__ */ new Set());
  return isJsonRecord(projected) ? projected : {};
}
function projectField(reflection) {
  const field = { type: reflection.type };
  const defaultValue = projectJson(reflection.default, /* @__PURE__ */ new Set());
  if (defaultValue !== void 0) Object.assign(field, { default: defaultValue });
  if (reflection.shape !== void 0) Object.assign(field, { shape: reflection.shape });
  if (reflection.transient !== void 0) Object.assign(field, { transient: reflection.transient });
  if (reflection.arrayMeta !== void 0) {
    Object.assign(field, {
      arrayMeta: {
        elementType: reflection.arrayMeta.elementType,
        ...reflection.arrayMeta.length !== void 0 ? { length: reflection.arrayMeta.length } : {}
      }
    });
  }
  if (reflection.labels !== void 0) Object.assign(field, { labels: { ...reflection.labels } });
  return Object.freeze(field);
}
function projectComponent(component) {
  const definition = componentDefinition(component);
  const fields = {};
  for (const [name, reflection] of Object.entries(definition.fields)) {
    fields[name] = projectField(reflection);
  }
  return Object.freeze({
    name: component.name,
    schema: Object.freeze({ ...componentSchema(component) }),
    fields: Object.freeze(fields),
    meta: Object.freeze(projectMeta(definition.policy.meta))
  });
}
function projectComponentIntrospection(components) {
  return Object.freeze(
    [...components.values()].sort((left, right) => left.name.localeCompare(right.name)).map(projectComponent)
  );
}
function beginFrame(session, frameId) {
  if (session === void 0) return false;
  try {
    return session.beginFrame(frameId).ok;
  } catch {
    return false;
  }
}
function beginPhase(session, phase) {
  if (session === void 0) return false;
  try {
    return session.beginPhase("app", phase).ok;
  } catch {
    return false;
  }
}
function endPhase(session) {
  if (session === void 0) return;
  try {
    session.endPhase();
  } catch {
  }
}
function endFrame(session) {
  if (session === void 0) return;
  try {
    session.endFrame();
  } catch {
  }
}
function finishProfilerCapture(profiler) {
  const session = profiler?.activeSession();
  if (session === void 0) return;
  try {
    session.finish();
  } catch {
  }
}
function makeAppError(code, expected, hint, detail) {
  return new AppError({ code, expected, hint, detail });
}
function makeWorldUpdateError(cause) {
  return makeAppError(
    "app-system-update-failed",
    "world.update(deltaSeconds) completes successfully",
    "check detail.cause for the original structured ECS error",
    { cause }
  );
}
function isFrameReceipt(value) {
  if (value === null || typeof value !== "object") return false;
  const candidate = value;
  if (!Number.isSafeInteger(candidate.frameId) || candidate.frameId < 0) return false;
  if (!Number.isSafeInteger(candidate.deviceGeneration) || candidate.deviceGeneration < 0)
    return false;
  if (candidate.backendId !== void 0 && typeof candidate.backendId !== "string") return false;
  if (candidate.graphGeneration !== void 0 && (!Number.isSafeInteger(candidate.graphGeneration) || candidate.graphGeneration < 0))
    return false;
  const completion = candidate.completed;
  return (typeof completion === "object" || typeof completion === "function") && completion !== null && typeof completion.then === "function";
}
function fireWorldUpdateResult(result, fireError) {
  if (!result.ok && fireError !== void 0) {
    fireError(makeWorldUpdateError(result.error));
  }
  return result.ok;
}
function updateInjectedWorlds(worlds, ownWorld, deltaSeconds, fireError, attachedWorlds, updatedWorlds) {
  for (const injectedWorld of worlds) {
    if (injectedWorld === ownWorld || updatedWorlds.has(injectedWorld) || !attachedWorlds.has(injectedWorld)) {
      continue;
    }
    try {
      if (fireWorldUpdateResult(injectedWorld.update(deltaSeconds), fireError)) {
        updatedWorlds.add(injectedWorld);
      }
    } catch (cause) {
      if (fireError !== void 0) fireError(makeWorldUpdateError(cause));
    }
  }
}
function resolveNow(opts) {
  if (opts.now !== void 0) return opts.now;
  return () => {
    const perf = globalThis.performance;
    const fn = perf?.now;
    return typeof fn === "function" ? fn.call(perf) : Date.now();
  };
}
function resolveRaf(opts) {
  if (opts.raf !== void 0) return opts.raf;
  const g = globalThis;
  return typeof g.requestAnimationFrame === "function" ? g.requestAnimationFrame.bind(globalThis) : () => 0;
}
function resolveCaf(opts) {
  if (opts.caf !== void 0) return opts.caf;
  const g = globalThis;
  return typeof g.cancelAnimationFrame === "function" ? g.cancelAnimationFrame.bind(globalThis) : () => {
  };
}
function createFrameLoop(opts) {
  const { world, renderer } = opts;
  const phaseCatalogRegistration = opts.profiler?.registerPhaseCatalog("app", APP_PHASE_CATALOG);
  let releasePhaseCatalog = phaseCatalogRegistration?.ok === true ? phaseCatalogRegistration.value : void 0;
  let drawSource = opts.drawSource;
  const now = resolveNow(opts);
  const raf = resolveRaf(opts);
  const caf = resolveCaf(opts);
  let state = "idle";
  let lastTimestamp = 0;
  let lastSampleTimeSeconds = 0;
  let temporalResetPending = false;
  let pendingFrameId = 0;
  let profilerFrameId = 0;
  let profilerCaptureId;
  const leases = /* @__PURE__ */ new Map();
  const maxFramesInFlight = 2;
  let submittedFrames = 0;
  let completedFrames = 0;
  let highWaterFrames = 0;
  let throttledTicks = 0;
  let pendingReceipts = 0;
  const receiptDrainWaiters = /* @__PURE__ */ new Set();
  function inspect() {
    return {
      submitted: submittedFrames,
      completed: completedFrames,
      inFlight: pendingReceipts,
      highWater: highWaterFrames,
      throttledTicks
    };
  }
  function reportReceiptError(fireError, error) {
    try {
      fireError(error);
    } catch {
    }
  }
  function notifyReceiptDrainWaiters() {
    if (pendingReceipts !== 0 || receiptDrainWaiters.size === 0) return;
    const waiters = [...receiptDrainWaiters];
    receiptDrainWaiters.clear();
    for (const resolve of waiters) resolve();
  }
  function drainFrameReceipts() {
    if (pendingReceipts === 0) return Promise.resolve();
    return new Promise((resolve) => {
      receiptDrainWaiters.add(resolve);
      notifyReceiptDrainWaiters();
    });
  }
  function trackReceipt(receipt, fireError) {
    submittedFrames += 1;
    pendingReceipts += 1;
    highWaterFrames = Math.max(highWaterFrames, pendingReceipts);
    try {
      opts.onSubmitted?.(receipt);
    } catch {
    }
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      pendingReceipts -= 1;
      completedFrames += 1;
      notifyReceiptDrainWaiters();
    };
    const notifyCompleted = () => {
      if (state === "stopped") return;
      if (typeof renderer.state === "function" && renderer.state() !== "alive") return;
      try {
        const inspected = renderer.inspect?.();
        const generation = inspected?.frame?.deviceGeneration;
        if (Number.isSafeInteger(generation) && generation !== receipt.deviceGeneration) return;
      } catch {
      }
      try {
        opts.onCompleted?.(receipt);
      } catch {
      }
    };
    const completion = receipt.completed;
    if (completion === null || typeof completion !== "object" && typeof completion !== "function" || typeof completion.then !== "function") {
      reportReceiptError(
        fireError,
        makeWorldUpdateError(new Error("renderer returned an invalid completion Promise"))
      );
      settle();
      return;
    }
    try {
      completion.then(
        (result) => {
          if (result !== null && typeof result === "object" && "ok" in result) {
            if (result.ok === false && "error" in result) {
              reportReceiptError(fireError, result.error);
            } else if (result.ok === true) {
              notifyCompleted();
            } else {
              reportReceiptError(
                fireError,
                makeWorldUpdateError(new Error("renderer returned an invalid completion Result"))
              );
            }
          } else {
            reportReceiptError(
              fireError,
              makeWorldUpdateError(new Error("renderer returned an invalid completion Result"))
            );
          }
          settle();
        },
        (cause) => {
          reportReceiptError(fireError, makeWorldUpdateError(cause));
          settle();
        }
      );
    } catch (cause) {
      reportReceiptError(fireError, makeWorldUpdateError(cause));
      settle();
    }
  }
  function attachPrimary(fireError) {
    if (leases.has(world)) return;
    try {
      const result = renderer.attach(world);
      if (result.ok) leases.set(world, result.value);
      else fireError(result.error);
    } catch (cause) {
      fireError(makeWorldUpdateError(cause));
    }
  }
  function syncInjectedAttachments(worlds, fireError) {
    if (worlds === void 0) {
      for (const [attached, lease] of leases) {
        if (attached !== world) {
          lease.dispose();
          leases.delete(attached);
        }
      }
      return void 0;
    }
    const next = /* @__PURE__ */ new Set();
    for (const candidate of worlds) {
      if (candidate === world || next.has(candidate)) continue;
      if (leases.has(candidate)) {
        next.add(candidate);
        continue;
      }
      try {
        const result = renderer.attach(candidate);
        if (result.ok) {
          leases.set(candidate, result.value);
          next.add(candidate);
        } else fireError?.(result.error);
      } catch (cause) {
        fireError?.(makeWorldUpdateError(cause));
      }
    }
    for (const [attached, lease] of leases) {
      if (attached !== world && !next.has(attached)) {
        lease.dispose();
        leases.delete(attached);
      }
    }
    return next;
  }
  function releaseInjectedAttachments() {
    syncInjectedAttachments(void 0);
  }
  function releaseAttachments() {
    releaseInjectedAttachments();
    const lease = leases.get(world);
    if (lease !== void 0) {
      lease.dispose();
      leases.delete(world);
    }
  }
  function runProfiledPhase(session, phase, action) {
    const opened = beginPhase(session, phase);
    try {
      return action();
    } finally {
      if (opened) endPhase(session);
    }
  }
  function runFrame(deltaSeconds) {
    const manualStep = deltaSeconds !== void 0;
    const timestamp = manualStep ? lastTimestamp : now();
    const rendererState = typeof renderer.state === "function" ? renderer.state() : "alive";
    if (rendererState !== "alive") {
      lastTimestamp = timestamp;
      return ok(void 0);
    }
    if (pendingReceipts >= maxFramesInFlight) {
      throttledTicks += 1;
      return ok(void 0);
    }
    deltaSeconds ??= (timestamp - lastTimestamp) / 1e3;
    lastTimestamp = timestamp;
    const sampleTimeSeconds = manualStep ? lastSampleTimeSeconds + deltaSeconds : timestamp / 1e3;
    const session = opts.profiler?.activeSession();
    let profileFrame;
    let frameError;
    let primaryUpdated = false;
    const reportError = (error) => {
      frameError ??= error;
      opts.onError?.(error);
    };
    if (session !== void 0) {
      if (profilerCaptureId !== session.captureId) {
        profilerCaptureId = session.captureId;
        profilerFrameId = 0;
      }
      const frameId = ++profilerFrameId;
      if (beginFrame(session, frameId)) {
        profileFrame = { captureId: session.captureId, frameId };
      }
    }
    runProfiledPhase(session, "frame-total", () => {
      attachPrimary(reportError);
      runProfiledPhase(session, "world-update-primary", () => {
        try {
          if (fireWorldUpdateResult(world.update(deltaSeconds), reportError)) {
            primaryUpdated = true;
          }
        } catch (cause) {
          reportError(makeWorldUpdateError(cause));
        }
      });
      let injected;
      runProfiledPhase(session, "draw-source", () => {
        if (drawSource === void 0) return;
        try {
          injected = drawSource();
        } catch (cause) {
          reportError(makeWorldUpdateError(cause));
        }
      });
      const attachedInjectedWorlds = syncInjectedAttachments(injected?.worlds, reportError);
      const updatedWorlds = injected === void 0 ? void 0 : /* @__PURE__ */ new Set();
      if (updatedWorlds !== void 0 && primaryUpdated && leases.has(world)) {
        updatedWorlds.add(world);
      }
      runProfiledPhase(session, "world-update-injected", () => {
        if (injected !== void 0 && attachedInjectedWorlds !== void 0 && updatedWorlds !== void 0) {
          updateInjectedWorlds(
            injected.worlds,
            world,
            deltaSeconds,
            reportError,
            attachedInjectedWorlds,
            updatedWorlds
          );
        }
      });
      runProfiledPhase(session, "renderer-draw", () => {
        try {
          opts.beforeDraw?.();
          let drawResult;
          if (injected === void 0) {
            const primaryLease = leases.get(world);
            if (!primaryUpdated || primaryLease === void 0) return;
            drawResult = renderer.draw({
              leases: [primaryLease],
              camera: { lease: primaryLease },
              environment: { lease: primaryLease },
              sampleTimeSeconds,
              ...temporalResetPending ? { temporalReset: true } : {},
              ...profileFrame === void 0 ? {} : { profileFrame }
            });
          } else {
            if (updatedWorlds === void 0) return;
            const readyEntries = injected.worlds.filter((candidate) => updatedWorlds.has(candidate)).map((candidate) => ({ candidate, lease: leases.get(candidate) })).filter(
              (entry) => entry.lease !== void 0
            );
            const readyLeases = readyEntries.map((entry) => entry.lease);
            const cameraWorld = injected.worlds[injected.cameraOwner];
            const environmentWorld = injected.worlds[injected.resourceOwner];
            if (cameraWorld === void 0 || environmentWorld === void 0) return;
            const cameraLease = leases.get(cameraWorld);
            const environmentLease = leases.get(environmentWorld);
            if (readyLeases.length === 0 || cameraLease === void 0 || environmentLease === void 0)
              return;
            drawResult = renderer.draw({
              leases: readyLeases,
              camera: { lease: cameraLease },
              environment: { lease: environmentLease },
              sampleTimeSeconds,
              ...temporalResetPending ? { temporalReset: true } : {},
              ...profileFrame === void 0 ? {} : { profileFrame }
            });
          }
          if (drawResult.ok) {
            if (drawResult.value === void 0) return;
            if (isFrameReceipt(drawResult.value)) {
              trackReceipt(drawResult.value, reportError);
              lastSampleTimeSeconds = sampleTimeSeconds;
              temporalResetPending = false;
            } else {
              reportError(
                makeWorldUpdateError(new Error("renderer returned an invalid FrameReceipt"))
              );
            }
          } else {
            reportError(drawResult.error);
          }
        } catch (cause) {
          reportError(makeWorldUpdateError(cause));
        }
      });
    });
    endFrame(session);
    try {
      opts.debugRhi?.onFrameEnd();
    } catch {
    }
    return frameError === void 0 ? ok(void 0) : err(frameError);
  }
  function tick() {
    if (state !== "running") return;
    runFrame();
    if (state === "running") pendingFrameId = raf(tick);
  }
  function releaseProfiler() {
    finishProfilerCapture(opts.profiler);
    releasePhaseCatalog?.();
    releasePhaseCatalog = void 0;
  }
  return {
    setDrawSource(nextDrawSource) {
      if (drawSource !== nextDrawSource) syncInjectedAttachments(void 0);
      drawSource = nextDrawSource;
    },
    drainFrameReceipts,
    stepFrame(deltaSeconds) {
      const reason = state !== "paused" ? "state" : !Number.isFinite(deltaSeconds) || deltaSeconds < 0 ? "delta" : pendingReceipts >= maxFramesInFlight ? "credit" : void 0;
      if (reason !== void 0) {
        return err(
          makeAppError(
            "app-frame-step-invalid",
            'state is "paused", deltaSeconds is finite and non-negative, and a frame receipt credit is available',
            "pause the App, pass a finite non-negative delta, and retry after an in-flight receipt settles",
            { state, deltaSeconds, reason }
          )
        );
      }
      return runFrame(deltaSeconds);
    },
    start() {
      if (state === "running") {
        return err(
          makeAppError(
            "app-already-running",
            'state must be "idle" or "paused" to start',
            "call stop() first or check getState() before retrying",
            {}
          )
        );
      }
      if (state === "stopped") {
        return err(
          makeAppError(
            "app-not-started",
            'frame-loop is in terminal "stopped" state',
            "create a new App via createApp({...}); the existing handle is dead",
            {}
          )
        );
      }
      const wasPaused = state === "paused";
      lastTimestamp = now();
      lastSampleTimeSeconds = lastTimestamp / 1e3;
      temporalResetPending = wasPaused;
      state = "running";
      pendingFrameId = raf(tick);
      return ok(void 0);
    },
    stop() {
      if (state === "idle") {
        return err(
          makeAppError(
            "app-not-started",
            'state must be "running" to stop',
            "check getState() before calling stop(); idle handles cannot stop",
            {}
          )
        );
      }
      if (state === "stopped") {
        return err(
          makeAppError(
            "app-not-started",
            'frame-loop is in terminal "stopped" state',
            "discard this handle and create a new App",
            {}
          )
        );
      }
      caf(pendingFrameId);
      pendingFrameId = 0;
      state = "stopped";
      releaseAttachments();
      releaseProfiler();
      return ok(void 0);
    },
    pause() {
      if (state === "paused") return ok(void 0);
      if (state !== "running") {
        return err(
          makeAppError(
            "app-not-started",
            'state must be "running" or "paused" to pause',
            "call start() first; idle handles cannot pause",
            {}
          )
        );
      }
      caf(pendingFrameId);
      pendingFrameId = 0;
      state = "paused";
      return ok(void 0);
    },
    resume() {
      if (state === "idle" || state === "stopped") {
        return err(
          makeAppError(
            "app-not-started",
            'state must be "paused" to resume',
            "call start() first to leave idle; resume() expects an active handle",
            {}
          )
        );
      }
      if (state === "running") return ok(void 0);
      lastTimestamp = now();
      temporalResetPending = true;
      state = "running";
      pendingFrameId = raf(tick);
      return ok(void 0);
    },
    getState() {
      return state;
    },
    inspect,
    setStopped() {
      if (pendingFrameId !== 0) {
        caf(pendingFrameId);
        pendingFrameId = 0;
      }
      releaseAttachments();
      releaseProfiler();
      state = "stopped";
    }
  };
}
function attachInputAuto(canvas, options = {}) {
  let onLockErrorDispatch;
  const backendOpts = {
    ...options.uiRoot ? { uiRoot: options.uiRoot } : {},
    ...options.pointerLockAllowed ? { pointerLockAllowed: options.pointerLockAllowed } : {},
    ...options.virtualJoysticks ? { virtualJoysticks: options.virtualJoysticks } : {},
    ...options.lockProvider ? { lockProvider: options.lockProvider } : {},
    onLockError: (detail) => {
      if (onLockErrorDispatch) {
        const err19 = new AppError({
          code: "app-pointer-lock-failed",
          expected: APP_EXPECTED["app-pointer-lock-failed"],
          hint: APP_ERROR_HINTS["app-pointer-lock-failed"],
          detail
        });
        onLockErrorDispatch(err19);
      }
    }
  };
  const detach = attachBrowserInputBackend(canvas, backendOpts);
  const backend = makeCompositeBackend(detach.backend);
  let cleanedUp = false;
  return {
    backend,
    setOnErrorDispatch(fn) {
      onLockErrorDispatch = fn;
    },
    cleanup() {
      if (cleanedUp) {
        return;
      }
      cleanedUp = true;
      backend.revokeInjectedLease();
      detach();
    }
  };
}
function inputMapPlugin(configs) {
  const deduped = /* @__PURE__ */ new Map();
  for (const config of configs) {
    if (config.action.length > 0) deduped.set(config.action, config);
  }
  const inputMap = Object.freeze([...deduped.values()]);
  return {
    name: "input-map",
    inject: ["world"],
    apply(ctx) {
      ctx.effect(() => {
        ctx.world.insertResource(INPUT_MAP_KEY, inputMap);
        return () => ctx.world.removeResource(INPUT_MAP_KEY);
      }, "input/action-map");
    }
  };
}
function inputPlugin() {
  return {
    name: "input",
    inject: ["world", "input"],
    apply(ctx) {
      const world = ctx.world;
      const input = ctx.input;
      if (input === void 0) throw new Error("Cordis activated input without its provider");
      ctx.effect(() => {
        world.insertResource(INPUT_BACKEND_KEY, input);
        world.insertResource(INPUT_SNAPSHOT_RESOURCE_KEY, createInputSnapshot());
        return () => {
          world.removeResource(INPUT_BACKEND_KEY);
          world.removeResource(INPUT_SNAPSHOT_RESOURCE_KEY);
        };
      }, "input/resource");
      ctx.effect(() => {
        world.addSystems(Update, InputSet, [InputFrameStartScan]).unwrap();
        return () => world.removeSystem(Update, InputFrameStartScan.name);
      }, "input/frame-start-scan");
    }
  };
}
var GPU_DRIVEN_MATERIAL_ROW_BYTES = 512;
var STANDARD_PIPELINE_PARAM_SCHEMA = STANDARD_MATERIAL_PARAM_SCHEMA.filter(
  (entry) => !(entry.type.startsWith("texture") && STANDARD_PHYSICAL_TEXTURE_FIELDS.includes(
    entry.name
  ))
);
var STANDARD_PIPELINE_DERIVED = derive(STANDARD_PIPELINE_PARAM_SCHEMA);
function materialRowFields(schema, derived) {
  const coordinates = new Map(
    derived.coordinateRecords.map((record2) => [record2.parameter, record2])
  );
  return schema.flatMap((entry) => {
    if (isNumericParam(entry)) return [entry.name];
    if (entry.type.startsWith("texture")) {
      const record2 = coordinates.get(entry.name);
      if (record2 === void 0) throw new Error(`missing coordinate record for ${entry.name}`);
      return [record2.transformMember, record2.metadataMember];
    }
    return [];
  });
}
function isNumericParam(entry) {
  return entry.type === "f32" || entry.type === "i32" || entry.type === "u32" || entry.type === "vec2" || entry.type === "vec3" || entry.type === "vec4" || entry.type === "color";
}
function standardPbrMaterialRowFields() {
  return materialRowFields(STANDARD_PIPELINE_PARAM_SCHEMA, STANDARD_PIPELINE_DERIVED);
}
var STANDARD_PBR_VERTEX_INPUTS = [
  { semantic: "position", location: 0, format: "float32x3" },
  { semantic: "normal", location: 1, format: "float32x3" },
  { semantic: "uv", location: 2, format: "float32x2" },
  { semantic: "tangent", location: 3, format: "float32x4" }
];
function standardPbrResourceSlots() {
  return STANDARD_PIPELINE_DERIVED.resourceBindings.flatMap((resource) => {
    if (resource.kind !== "sampler" && resource.kind !== "texture") return [];
    return [
      {
        name: resource.name,
        parameter: resource.parameter ?? resource.name,
        kind: resource.kind,
        group: 1,
        binding: resource.binding
      }
    ];
  });
}
function createStandardPbrArtifactReceipt(skinned = false, vertexColorAvailable = false) {
  const resourceSlots = standardPbrResourceSlots();
  const uvSets = STANDARD_PIPELINE_DERIVED.coordinateRecords.map((record2) => ({
    parameter: record2.parameter,
    set: 0
  }));
  const vertexInputs = [
    ...STANDARD_PBR_VERTEX_INPUTS,
    ...skinned ? [
      { semantic: "skinIndex", location: 4, format: "uint16x4" },
      { semantic: "skinWeight", location: 5, format: "float32x4" }
    ] : [],
    ...vertexColorAvailable ? [{ semantic: "color", location: 13, format: "float32x4" }] : []
  ];
  const layoutIdentity = `standard-pbr/material-row-v3${vertexColorAvailable ? "/vertex-color" : ""}`;
  return {
    directEntry: "vs_main",
    sceneIndexEntry: "vs_scene_index",
    materialRow: {
      byteLength: GPU_DRIVEN_MATERIAL_ROW_BYTES,
      fields: [...standardPbrMaterialRowFields()]
    },
    resourceSlots,
    uvSets,
    vertexInputs,
    alphaMask: { cutoff: "alphaCutoff", source: "baseColor.a" },
    ...skinned ? { skinPaletteAddress: { group: 2, binding: 1, stride: 64 } } : {},
    reflection: {
      layoutIdentity,
      resourceSlots,
      vertexInputs
    },
    receiptIdentity: layoutIdentity,
    generation: 3
  };
}
var DEFAULT_STANDARD_PBR_PARAM_SCHEMA = STANDARD_MATERIAL_PARAM_SCHEMA;
new Map(
  DEFAULT_STANDARD_PBR_PARAM_SCHEMA.filter((entry) => entry.type === "texture2d").map(
    (entry, index) => [entry.name, 2 ** index]
  )
);
DEFAULT_STANDARD_PBR_PARAM_SCHEMA.filter(
  (entry) => STANDARD_PHYSICAL_PARAMETER_NAMES.has(entry.name)
);
DEFAULT_STANDARD_PBR_PARAM_SCHEMA.filter(
  (entry) => !STANDARD_PHYSICAL_PARAMETER_NAMES.has(entry.name) && ![
    "transmission",
    "thickness",
    "attenuationColor",
    "attenuationDistance",
    "transmissionTexture",
    "thicknessTexture"
  ].includes(entry.name)
);
var PARTICLE_SURFACE_NUMERIC_FIELDS = [
  "baseColor",
  "metallic",
  "roughness",
  "metallicChannel",
  "roughnessChannel",
  "aoChannel",
  "extraChannel",
  "emissive",
  "emissiveIntensity",
  "occlusionStrength",
  "alphaCutoff",
  "clearcoat",
  "clearcoatRoughness",
  "specularTint",
  "normalScale",
  "transmission",
  "ior",
  "thickness",
  "attenuationColor",
  "attenuationDistance"
];
var PARTICLE_SURFACE_TEXTURE_FIELDS = [
  "baseColorTexture",
  "metallicRoughnessTexture",
  "normalTexture",
  "specularTintTexture",
  "emissiveTexture",
  "occlusionTexture",
  "transmissionTexture",
  "thicknessTexture"
];
function particleSurfaceSchemaEntry(name) {
  const entry = DEFAULT_STANDARD_PBR_PARAM_SCHEMA.find((candidate) => candidate.name === name);
  if (entry !== void 0) return entry;
  if (name === "specularTint") {
    return { name, type: "vec3", colorSpace: "srgb", default: [1, 1, 1] };
  }
  if (name === "specularTintTexture") return { name, type: "texture2d" };
  throw new Error(`Particle Standard Surface schema field is missing: ${name}`);
}
Object.freeze([
  ...PARTICLE_SURFACE_NUMERIC_FIELDS.map(particleSurfaceSchemaEntry),
  ...PARTICLE_SURFACE_TEXTURE_FIELDS.map(particleSurfaceSchemaEntry)
]);
createStandardPbrArtifactReceipt();
createStandardPbrArtifactReceipt(true);
derive(DEFAULT_STANDARD_PBR_PARAM_SCHEMA).uboLayout.totalBytes;
function selectSwapChainFormat(storageBufferCapable, surfaceViewFormats = true) {
  if (!storageBufferCapable) {
    return {
      storage: "rgba8unorm",
      view: surfaceViewFormats ? "rgba8unorm-srgb" : "rgba8unorm"
    };
  }
  const nav = globalThis.navigator;
  const gpu = nav?.gpu;
  const getPreferred = gpu?.getPreferredCanvasFormat;
  if (gpu !== void 0 && typeof getPreferred === "function") {
    const storage = getPreferred.call(gpu);
    const view = storage === "rgba8unorm" ? "rgba8unorm-srgb" : storage === "bgra8unorm" ? "bgra8unorm-srgb" : storage;
    return {
      storage,
      view: surfaceViewFormats ? view : storage
    };
  }
  return {
    storage: "rgba8unorm",
    view: surfaceViewFormats ? "rgba8unorm-srgb" : "rgba8unorm",
    fallbackReason: "preferred-canvas-format-missing"
  };
}

// src/internal/debug-draw.ts
async function createDebugDrawOnReady(context, format) {
  const ready = await context.initialization;
  if (!ready.ok) throw ready.error;
  const resolvedFormat = selectSwapChainFormat(context.device.caps.storageBuffer).view;
  const result = await createDebugDraw({
    device: context.device,
    queue: context.device.queue,
    createShaderModule: context._internal_createShaderModule,
    format: resolvedFormat
  });
  if (!result.ok) throw result.error;
  context._internal_setRenderOverlay(result.value);
  return result.value;
}
function releaseDebugDraw(context, debugDraw) {
  context._internal_setRenderOverlay(void 0);
  debugDraw.destroy();
}

// src/internal/main-engine-profile.ts
function debugDrawPlugin(context, onReady) {
  return {
    name: "debug-draw",
    async apply(ctx) {
      try {
        const debugDraw = await createDebugDrawOnReady(context);
        onReady(debugDraw);
        ctx.effect(() => () => releaseDebugDraw(context, debugDraw), "render/debug-draw");
      } catch {
      }
    }
  };
}
function mainEngineProfile(options) {
  return [
    ownedRendererPlugin(options.renderer),
    renderComponentsPlugin(),
    ...options.rendererFeatureHost === void 0 ? [] : [renderFeatureHostPlugin(options.rendererFeatureHost)],
    ...options.assetAssembly === void 0 ? [rendererAssetsPlugin(options.assets)] : [assetRegistryPlugin(options.assetAssembly)],
    assetsWorldPlugin(),
    ...options.input === void 0 ? [] : [
      options.inputDispose === void 0 ? inputBackendPlugin(options.input) : ownedInputBackendPlugin(options.input, options.inputDispose)
    ],
    scenePlugin(),
    animationPayloadsPlugin(options.animationPayloads),
    animationRuntimePlugin(),
    statePlugin(),
    ...options.onDebugDrawReady === void 0 || options.rendererDebugDrawHost === void 0 ? [] : [debugDrawPlugin(options.rendererDebugDrawHost, options.onDebugDrawReady)],
    ...options.input === void 0 ? [] : [inputPlugin()],
    ...options.inputMap === void 0 ? [] : [inputMapPlugin(options.inputMap)],
    ...options.extensions ?? []
  ];
}

// src/internal/remote-serve-flag.ts
function resolveRemoteServeFlag(isDev, processEnv) {
  if (isDev === true) return true;
  if (processEnv?.FORGEAX_ENGINE_REMOTE_SERVE === "1") return true;
  return false;
}

// src/internal/remote-server-plugin.ts
function remoteServerPlugin(handle) {
  return {
    name: "remote-server",
    apply(ctx) {
      ctx.effect(() => async () => handle.close(), "remote/server");
    }
  };
}
var captureDrivers = /* @__PURE__ */ new WeakMap();
function createRhiCapture(attachment) {
  let activeCapture;
  const capture = {
    captureFrame(options) {
      const driver = captureDrivers.get(capture);
      if (driver === void 0) return captureAttachment(attachment, options);
      if (activeCapture !== void 0) {
        return Promise.resolve(
          err(
            createRhiDebugError("capture-busy", {
              stage: "capture",
              cause: "another App capture transaction is active"
            })
          )
        );
      }
      const request = captureWithAppFrame(attachment, driver, options);
      activeCapture = request;
      void request.then(
        () => {
          if (activeCapture === request) activeCapture = void 0;
        },
        () => {
          if (activeCapture === request) activeCapture = void 0;
        }
      );
      return request;
    }
  };
  return capture;
}
function bindRhiCaptureFrameDriver(capture, driver) {
  captureDrivers.set(capture, driver);
}
async function captureAttachment(attachment, options) {
  const result = await attachment.captureFrame(options);
  if (!result.ok) return result;
  return ok(toArtifact(result.value));
}
async function captureWithAppFrame(attachment, driver, options) {
  const state = driver.getState();
  if (state !== "running" && state !== "paused") {
    return err(
      createRhiDebugError("capture-unavailable", {
        stage: "capture",
        cause: `App capture requires a running or paused frame loop, received '${state}'`
      })
    );
  }
  if (options?.signal?.aborted) return captureAttachment(attachment, options);
  const resumeAfter = state === "running";
  if (resumeAfter) {
    const paused = driver.pause();
    if (!paused.ok) {
      return err(
        createRhiDebugError("capture-unavailable", {
          stage: "capture",
          cause: `App capture could not pause the frame loop: ${describeFailure(paused.error)}`
        })
      );
    }
  }
  const controller = new AbortController();
  const abortFromUser = () => controller.abort();
  options?.signal?.addEventListener("abort", abortFromUser, { once: true });
  let captureResult;
  try {
    captureResult = attachment.captureFrame({
      ...options ?? {},
      signal: controller.signal
    });
  } catch (cause) {
    options?.signal?.removeEventListener("abort", abortFromUser);
    if (resumeAfter && driver.getState() === "paused") driver.resume();
    return err(
      createRhiDebugError("capture-unavailable", {
        stage: "capture",
        cause: `App capture could not arm the recorder: ${describeFailure(cause)}`
      })
    );
  }
  let result;
  let transactionError;
  let resumedForCapture = false;
  try {
    const snapshot = await attachment.frameBoundary();
    if (!snapshot.ok) {
      result = await captureResult;
    } else if (options?.signal?.aborted) {
      controller.abort();
      result = await captureResult;
    } else if (resumeAfter) {
      const resumed = driver.resume();
      if (!resumed.ok) {
        transactionError = createRhiDebugError("capture-unavailable", {
          stage: "capture",
          cause: `App capture could not resume the frame loop: ${describeFailure(resumed.error)}`
        });
        controller.abort();
        result = await captureResult;
      } else {
        resumedForCapture = true;
        result = await captureResult;
      }
    } else {
      const stepped = driver.stepFrame(0);
      if (!stepped.ok) {
        transactionError = createRhiDebugError("capture-unavailable", {
          stage: "capture",
          cause: `App capture frame failed: ${describeFailure(stepped.error)}`
        });
        controller.abort();
        result = await captureResult;
      } else {
        result = await captureResult;
      }
    }
  } catch (cause) {
    transactionError = createRhiDebugError("capture-unavailable", {
      stage: "capture",
      cause: `App capture transaction failed: ${describeFailure(cause)}`
    });
    controller.abort();
    result = await captureResult;
  } finally {
    options?.signal?.removeEventListener("abort", abortFromUser);
    if (resumeAfter && !resumedForCapture && driver.getState() === "paused") {
      const resumed = driver.resume();
      if (!resumed.ok && transactionError === void 0) {
        transactionError = createRhiDebugError("capture-unavailable", {
          stage: "capture",
          cause: `App capture could not resume the frame loop: ${describeFailure(resumed.error)}`
        });
      }
    }
  }
  if (transactionError !== void 0) return err(transactionError);
  if (result === void 0) result = await captureResult;
  if (!result.ok) return result;
  return ok(toArtifact(result.value));
}
function describeFailure(cause) {
  if (typeof cause === "string") return cause;
  if (cause instanceof Error) return cause.message;
  if (typeof cause === "object" && cause !== null && "hint" in cause) {
    const hint = cause.hint;
    if (typeof hint === "string") return hint;
  }
  return String(cause);
}
function createRhiInstrumentation(attachment) {
  return {
    resolveSurfaceDevice(device) {
      const resolved = attachment.backend.unwrapDeviceForSurface(device);
      if (resolved.ok) return resolved;
      return err(
        new RhiError({
          code: "rhi-not-available",
          expected: "the recorder can resolve the wrapped surface device",
          hint: resolved.error.hint
        })
      );
    },
    onFrameBoundary() {
      void attachment.frameBoundary();
    },
    onDeviceLost() {
      attachment.deviceLost();
    }
  };
}
function mergeRhiInstrumentation(recorder, host) {
  if (host === void 0) return recorder;
  const onFrameBoundary = recorder.onFrameBoundary === void 0 && host.onFrameBoundary === void 0 ? void 0 : () => {
    recorder.onFrameBoundary?.();
    host.onFrameBoundary?.();
  };
  const onDeviceLost = recorder.onDeviceLost === void 0 && host.onDeviceLost === void 0 ? void 0 : () => {
    recorder.onDeviceLost?.();
    host.onDeviceLost?.();
  };
  return {
    ...recorder,
    ...host.beforeSubmit === void 0 ? {} : { beforeSubmit: host.beforeSubmit },
    ...host.deviceLost === void 0 ? {} : { deviceLost: host.deviceLost },
    ...onFrameBoundary === void 0 ? {} : { onFrameBoundary },
    ...onDeviceLost === void 0 ? {} : { onDeviceLost },
    // The recorder's resolver unwraps its own device wrapper. A host resolver
    // is retained only when no recorder resolver exists; replacing the recorder
    // resolver would make the debug attachment unable to configure the surface.
    ...recorder.resolveSurfaceDevice !== void 0 || host.resolveSurfaceDevice === void 0 ? {} : { resolveSurfaceDevice: host.resolveSurfaceDevice }
  };
}
function toArtifact(encoded) {
  return {
    kind: "rhi-tape",
    digest: encoded.digest,
    bytes: encoded.bytes
  };
}

// src/internal/rhi-debug-flag.ts
function resolveRhiDebugFlag(importMetaEnv, processEnv) {
  return importMetaEnv?.FORGEAX_ENGINE_RHI_DEBUG ?? processEnv?.FORGEAX_ENGINE_RHI_DEBUG;
}
function rotateObservationCamera(current, movementX, movementY) {
  const orientation = quat.rotateAxis(quat.create(), current, [0, 1, 0], -movementX * 3e-3);
  quat.rotateAxis(orientation, orientation, [1, 0, 0], -movementY * 3e-3);
  return orientation;
}
function finiteVector(value, length) {
  if (!Array.isArray(value) || value.length < length) return void 0;
  const vector = value.slice(0, length).map(Number);
  return vector.every(Number.isFinite) ? vector : void 0;
}
function jsonValue(value, seen = /* @__PURE__ */ new WeakSet()) {
  if (value === null || typeof value !== "object") {
    return typeof value === "bigint" ? String(value) : value;
  }
  if (ArrayBuffer.isView(value)) return Array.from(value);
  if (seen.has(value)) return null;
  seen.add(value);
  if (Array.isArray(value)) return value.map((entry) => jsonValue(entry, seen));
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) => {
      const next = jsonValue(entry, seen);
      return next === void 0 || typeof next === "function" ? [] : [[key, next]];
    })
  );
}
function createAppObservation(world, renderer, execution) {
  const observationSystem = "app-observation-camera-ownership";
  const firstCameraEntity = () => {
    const cameras = world.query({ with: [Camera, Transform] }).unwrap();
    for (const row of cameras) return row.entity;
    return void 0;
  };
  const resolveGameCameraEntity = () => {
    const active = getActiveCamera(world)?.entity;
    if (active !== void 0 && world.get(active, Camera).ok && world.get(active, Transform).ok) {
      return active;
    }
    return firstCameraEntity();
  };
  let observationEntity2;
  let gameCameraEntity;
  let ownershipInstalled = false;
  const rememberGameCamera = () => {
    const active = getActiveCamera(world)?.entity;
    if (active !== void 0 && active !== observationEntity2 && world.get(active, Camera).ok && world.get(active, Transform).ok)
      gameCameraEntity = active;
  };
  const cameraValue = (entity) => {
    const value = world.get(entity, Camera);
    if (!value.ok) throw new Error("live-camera-invalid-entity: entity has no Camera");
    const json = jsonValue(value.value);
    if (json === null || typeof json !== "object" || Array.isArray(json))
      throw new Error("live-camera-invalid-entity: Camera data is not serializable");
    return json;
  };
  const transformValue = (entity) => {
    const value = world.get(entity, Transform);
    if (!value.ok) throw new Error("live-camera-invalid-entity: entity has no Transform");
    return {
      pos: Array.from(value.value.pos),
      quat: Array.from(value.value.quat),
      scale: Array.from(value.value.scale)
    };
  };
  const acquire = (source) => {
    if (!world.get(source, Camera).ok || !world.get(source, Transform).ok) {
      throw new Error("live-camera-invalid-entity: entity does not carry Camera and Transform");
    }
    installOwnershipSystem();
    if (observationEntity2 === void 0) gameCameraEntity = source;
    if (observationEntity2 !== void 0) {
      if (observationEntity2 !== source) {
        world.set(observationEntity2, Camera, cameraValue(source)).unwrap();
        world.set(observationEntity2, Transform, transformValue(source)).unwrap();
      }
      setActiveCamera(world, observationEntity2);
      return observationEntity2;
    }
    observationEntity2 = world.spawn(
      { component: Camera, data: cameraValue(source) },
      { component: Transform, data: transformValue(source) }
    ).unwrap();
    setActiveCamera(world, observationEntity2);
    return observationEntity2;
  };
  const release = () => {
    if (observationEntity2 === void 0) return;
    rememberGameCamera();
    const current = observationEntity2;
    observationEntity2 = void 0;
    if (current !== void 0) world.despawn(current).unwrap();
    const next = gameCameraEntity !== void 0 && world.get(gameCameraEntity, Camera).ok ? gameCameraEntity : firstCameraEntity();
    if (next !== void 0) setActiveCamera(world, next);
    gameCameraEntity = void 0;
    if (ownershipInstalled) {
      world.removeSystem(Update, observationSystem);
      ownershipInstalled = false;
    }
  };
  function installOwnershipSystem() {
    if (ownershipInstalled) return;
    world.addSystem(Update, {
      name: observationSystem,
      queries: [],
      after: [FRAME_START_SCAN_SYSTEM_NAME],
      fn: () => {
        const active = observationEntity2;
        if (active === void 0) return;
        rememberGameCamera();
        const snapshot = world.hasResource(INPUT_SNAPSHOT_RESOURCE_KEY) ? world.getResource(INPUT_SNAPSHOT_RESOURCE_KEY) : void 0;
        if (snapshot?.mouse.pointerLocked) {
          const transform = world.get(active, Transform);
          if (transform.ok) {
            const { x, y } = snapshot.mouse.movementDelta;
            const orientation = rotateObservationCamera(transform.value.quat, x, y);
            world.set(active, Transform, { quat: orientation }).unwrap();
          }
        }
        setActiveCamera(world, active);
      }
    }).unwrap();
    ownershipInstalled = true;
  }
  const cameraState = () => {
    const active = resolveGameCameraEntity();
    if (active === void 0)
      throw new Error("live-camera-unavailable: no active camera is selected");
    const entity = active;
    const camera = world.get(entity, Camera);
    const transform = world.get(entity, Transform);
    if (!camera.ok || !transform.ok)
      throw new Error("live-camera-unavailable: active entity is not a camera");
    const lens = {
      projection: camera.value.projection === CAMERA_PROJECTION_ORTHOGRAPHIC ? "orthographic" : "perspective",
      fov: camera.value.fov,
      aspect: camera.value.aspect,
      near: camera.value.near,
      far: camera.value.far,
      left: camera.value.left,
      right: camera.value.right,
      bottom: camera.value.bottom,
      top: camera.value.top
    };
    return {
      entity: active,
      control: active === observationEntity2 ? "observer" : "game",
      camera: jsonValue(camera.value),
      lens,
      exposure: cameraExposureFromColumns(camera.value),
      transform: {
        pos: Array.from(transform.value.pos),
        quat: Array.from(transform.value.quat),
        scale: Array.from(transform.value.scale)
      }
    };
  };
  const setCamera = (value) => {
    if (value === null || typeof value !== "object")
      throw new TypeError("camera.set expects an object");
    const candidate = value;
    const entity = candidate.entity === void 0 ? observationEntity2 ?? resolveGameCameraEntity() : candidate.entity;
    if (entity === void 0)
      throw new Error("live-camera-unavailable: no active camera is selected");
    if (!Number.isSafeInteger(entity)) throw new TypeError("camera.set expects an integer entity");
    if (!world.get(entity, Camera).ok || !world.get(entity, Transform).ok) {
      throw new Error("live-camera-invalid-entity: entity does not carry Camera and Transform");
    }
    const transform = candidate.transform !== null && typeof candidate.transform === "object" ? candidate.transform : void 0;
    const lens = candidate.lens !== null && typeof candidate.lens === "object" ? candidate.lens : void 0;
    const projectionValue = lens?.projection;
    const projection = projectionValue === "perspective" || projectionValue === CAMERA_PROJECTION_PERSPECTIVE ? CAMERA_PROJECTION_PERSPECTIVE : projectionValue === "orthographic" || projectionValue === CAMERA_PROJECTION_ORTHOGRAPHIC ? CAMERA_PROJECTION_ORTHOGRAPHIC : void 0;
    if (projectionValue !== void 0 && projection === void 0)
      throw new TypeError("camera.set lens.projection expects 'perspective' or 'orthographic'");
    const cameraFields = [
      "fov",
      "aspect",
      "near",
      "far",
      "left",
      "right",
      "bottom",
      "top"
    ];
    const cameraPatch = {};
    for (const field of cameraFields) {
      const value2 = lens?.[field];
      if (value2 !== void 0) {
        if (typeof value2 !== "number" || !Number.isFinite(value2))
          throw new TypeError(`camera.set lens.${field} expects a finite number`);
        cameraPatch[field] = value2;
      }
    }
    if (cameraPatch.aspect !== void 0 && cameraPatch.aspect <= 0)
      throw new TypeError("camera.set lens.aspect expects a positive number");
    if (cameraPatch.near !== void 0 && cameraPatch.near <= 0)
      throw new TypeError("camera.set lens.near expects a positive number");
    if (cameraPatch.far !== void 0 && cameraPatch.far <= 0)
      throw new TypeError("camera.set lens.far expects a positive number");
    if (candidate.exposure !== void 0) {
      const exposure = validateCameraExposure(candidate.exposure);
      if (exposure.kind === "manual") {
        Object.assign(cameraPatch, {
          exposureMode: CAMERA_EXPOSURE_MODE_MANUAL,
          exposure: exposure.multiplier,
          compensationEv: 0,
          rangeEv: new Float32Array([-8, 8]),
          rates: new Float32Array([3, 1])
        });
      } else {
        Object.assign(cameraPatch, {
          exposureMode: CAMERA_EXPOSURE_MODE_AUTO,
          exposure: exposure.fallback,
          compensationEv: exposure.compensationEv,
          rangeEv: new Float32Array(exposure.rangeEv),
          rates: new Float32Array(exposure.rates)
        });
      }
    }
    const observed = acquire(entity);
    if (projection !== void 0 || Object.keys(cameraPatch).length > 0) {
      world.set(observed, Camera, {
        ...projection === void 0 ? {} : { projection },
        ...cameraPatch
      }).unwrap();
    }
    const position = finiteVector(candidate.position, 3) ?? finiteVector(transform?.pos, 3) ?? Array.from(world.get(observed, Transform).unwrap().pos);
    const target = finiteVector(candidate.target, 3);
    const up = finiteVector(candidate.up, 3);
    const directRotation = finiteVector(transform?.quat, 4) ?? finiteVector(candidate.rotation, 4) ?? finiteVector(candidate.quat, 4);
    const orientation = directRotation ?? (position !== void 0 && target !== void 0 ? quat.fromLookAt(
      quat.create(),
      position,
      target,
      up ?? [0, 1, 0]
    ) : void 0);
    const scale = finiteVector(transform?.scale, 3);
    if (position !== void 0 || orientation !== void 0 || scale !== void 0) {
      world.set(observed, Transform, {
        ...position === void 0 ? {} : { pos: position },
        ...orientation === void 0 ? {} : { quat: orientation },
        ...scale === void 0 ? {} : { scale }
      }).unwrap();
    }
    return cameraState();
  };
  return {
    worldIdentity: world.identity,
    executionReport: () => execution.report(),
    camera: { get: cameraState, set: setCamera },
    find({ name, limit = 20 }) {
      const matches = [];
      const bound = Math.max(1, Math.min(100, limit));
      const query = world.query({ read: [Name, GlobalTransform] }).unwrap();
      for (const row of query) {
        const value = row.get(Name).value;
        if (name !== void 0 && !value.toLowerCase().includes(name.toLowerCase())) continue;
        if (matches.length === bound) return { matches, truncated: true };
        matches.push({
          entity: row.entity,
          name: value,
          position: Array.from(row.get(GlobalTransform).world).slice(12, 15)
        });
      }
      return { matches, truncated: false };
    },
    prepareFrame() {
      if (observationEntity2 !== void 0) {
        rememberGameCamera();
        setActiveCamera(world, observationEntity2);
      }
    },
    async focus(value) {
      if (value === null || typeof value !== "object")
        throw new TypeError("focus expects an object");
      const candidate = value;
      let entity = candidate.entity;
      if (candidate.name !== void 0) {
        if (entity !== void 0) throw new TypeError("focus expects either name or entity");
        for (const row of world.query({ read: [Name], with: [Transform] }).unwrap()) {
          if (row.get(Name).value !== candidate.name) continue;
          if (entity !== void 0)
            throw new Error(
              "live-target-ambiguous: multiple entities have this name; use find and an exact reference"
            );
          entity = row.entity;
        }
        if (entity === void 0)
          throw new Error("live-target-not-found: no entity has this exact name; use find");
      }
      if (!Number.isSafeInteger(entity))
        throw new TypeError("focus expects an exact name or entity");
      const target = world.get(entity, GlobalTransform);
      if (!target.ok) throw new Error("live-focus-invalid-entity: target has no Transform");
      const cameraEntity = Number.isSafeInteger(candidate.camera) ? candidate.camera : resolveGameCameraEntity();
      if (cameraEntity === void 0)
        throw new Error("live-camera-unavailable: no active camera is selected");
      if (!world.get(cameraEntity, Camera).ok || !world.get(cameraEntity, Transform).ok)
        throw new Error("live-camera-invalid-entity: selected entity has no Camera");
      const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
      const pending = [entity], visited = /* @__PURE__ */ new Set();
      let hasBounds = false;
      while (pending.length > 0) {
        const child = pending.pop();
        if (child === void 0) break;
        if (visited.has(child)) continue;
        visited.add(child);
        const bounds = await renderer.bounds(world, child);
        if (bounds !== void 0) {
          for (const axis of [0, 1, 2]) {
            min[axis] = Math.min(min[axis] ?? Infinity, bounds.min[axis]);
            max[axis] = Math.max(max[axis] ?? -Infinity, bounds.max[axis]);
          }
          hasBounds = true;
        } else if (world.get(child, MeshFilter).ok) {
          throw new Error(
            "live-focus-bounds-unavailable: wait for the selected mesh to be extracted by the renderer"
          );
        }
        const children = world.get(child, Children);
        if (children.ok)
          for (const next of children.value.entities) pending.push(next);
      }
      const center = hasBounds ? min.map((lo, axis) => (lo + (max[axis] ?? -Infinity)) / 2) : Array.from(target.value.world).slice(12, 15);
      const targetPosition = finiteVector(candidate.target, 3) ?? center;
      const radius = hasBounds ? Math.hypot(...min.map((lo, axis) => ((max[axis] ?? -Infinity) - lo) / 2)) + Math.hypot(...center.map((v, axis) => v - (targetPosition[axis] ?? 0))) : 0;
      const camera = world.get(cameraEntity, Camera).unwrap();
      const orthographic = camera.projection === CAMERA_PROJECTION_ORTHOGRAPHIC;
      let fittedDistance = 5;
      if (hasBounds) {
        if (!(camera.aspect > 0) || !Number.isFinite(camera.aspect) || !orthographic && !(camera.fov > 0 && camera.fov < Math.PI)) {
          throw new Error(
            "live-camera-invalid-projection: bounds framing requires a valid aspect and projection"
          );
        }
        const halfFov = Math.min(
          camera.fov / 2,
          Math.atan(Math.tan(camera.fov / 2) * camera.aspect)
        );
        fittedDistance = orthographic ? radius * 2 + Math.max(0.01, camera.near) : Math.max(0.01, radius * 1.1 / Math.sin(halfFov), radius + camera.near);
      }
      const distance = typeof candidate.distance === "number" && Number.isFinite(candidate.distance) ? Math.max(0.01, candidate.distance) : fittedDistance;
      const observed = acquire(cameraEntity);
      if (hasBounds) {
        const halfHeight = Math.max(0.01, radius * 1.1 / Math.min(1, camera.aspect));
        world.set(observed, Camera, {
          near: Math.min(camera.near, Math.max(1e-3, distance - radius)),
          far: Math.max(camera.far, distance + radius * 1.1 + 0.01),
          ...orthographic ? {
            left: -halfHeight * camera.aspect,
            right: halfHeight * camera.aspect,
            bottom: -halfHeight,
            top: halfHeight
          } : {}
        }).unwrap();
      }
      const position = finiteVector(candidate.position, 3) ?? [targetPosition[0] ?? 0, targetPosition[1] ?? 0, (targetPosition[2] ?? 0) + distance];
      const up = finiteVector(candidate.up, 3) ?? [0, 1, 0];
      const orientation = quat.fromLookAt(
        quat.create(),
        position,
        targetPosition,
        up
      );
      world.set(observed, Transform, { pos: position, quat: orientation }).unwrap();
      return { ...cameraState(), pivot: [...targetPosition] };
    },
    release
  };
}

// src/create-app.ts
function makeAppError2(code, expected, hint, detail) {
  return new AppError({ code, expected, hint, detail });
}
function markRendererBootstrapStage(name, detail) {
  const host = globalThis;
  const previous = host.__forgeaxRendererBootstrap;
  const now = Date.now();
  host.__forgeaxRendererBootstrap = {
    name,
    startedAt: now,
    previousElapsedMs: previous === void 0 ? 0 : now - previous.startedAt,
    ...detail === void 0 ? {} : { detail }
  };
}
function createFrameInspectionRef() {
  return { current: createExecutionFrameInspection };
}
function canvasAspectPlugin(canvas) {
  return {
    name: "canvas-aspect",
    inject: ["world"],
    apply(ctx) {
      ctx.effect(() => {
        const system = {
          name: "app-sync-camera-aspect",
          queries: [],
          fn: () => {
            syncCanvasDrawingBuffer(canvas);
            syncCameraAspect(ctx.world, canvas.width, canvas.height);
          }
        };
        ctx.world.addSystem(Update, system).unwrap();
        return () => ctx.world.removeSystem(Update, system.name).unwrap();
      }, "app/canvas-aspect");
    }
  };
}
function rhiDebugHostPlugin(dispose) {
  return {
    name: "rhi-debug-host",
    apply(ctx) {
      ctx.effect(() => dispose, "rhi-debug/host");
    }
  };
}
function createApp(arg, opts, bundler) {
  if ("tagName" in arg) {
    return createAppFromCanvas(arg, opts, bundler);
  }
  return createAppFromAssemble(arg);
}
async function createAppFromCanvas(canvas, opts, bundler) {
  if (!canvas.isConnected) {
    return err(
      makeAppError2(
        "app-canvas-detached",
        "canvas.isConnected === true at createApp(canvas) entry",
        "append the canvas to the document tree before calling createApp; or use the assemble entry createApp({ renderer, world }) when the host already manages canvas lifetime",
        {}
      )
    );
  }
  syncCanvasDrawingBuffer(canvas);
  bundler = await resolveSharedShaderBundler(bundler);
  let executionBootstrapUrl;
  if (opts?.execution !== void 0) {
    const normalizedBootstrap = normalizeExecutionBootstrapUrl(opts.execution.bootstrap);
    if (!normalizedBootstrap.ok) return err(normalizedBootstrap.error);
    executionBootstrapUrl = normalizedBootstrap.value;
    const realmBoundOption = [
      ["features", opts.features],
      ["plugins", opts.plugins],
      ["rhi", opts.rhi],
      ["rhiInstrumentation", opts.rhiInstrumentation],
      ["gpuPassTiming", opts.gpuPassTiming],
      ["ssrIdentity", opts.ssrIdentity],
      ["captureReflectionFallbackReadback", opts.captureReflectionFallbackReadback],
      ["drawSource", opts.drawSource],
      ["bundler.importTransport", bundler?.importTransport]
    ].find(([, value]) => value !== void 0)?.[0];
    if (realmBoundOption !== void 0) {
      return err(
        makeAppError2(
          "app-execution-bootstrap-failed",
          APP_EXPECTED["app-execution-bootstrap-failed"],
          APP_ERROR_HINTS["app-execution-bootstrap-failed"],
          {
            phase: "prepare",
            moduleUrl: executionBootstrapUrl,
            cause: new TypeError(
              `${realmBoundOption} must be constructed by the execution bootstrap module`
            )
          }
        )
      );
    }
  }
  let executionContext;
  let preparedExecutionBootstrap;
  if (opts?.execution !== void 0) {
    const capabilities = await probeExecutionCapabilities(canvas);
    const selected = selectExecutionWorkers({
      workers: opts.execution.workers ?? {},
      capabilities
    });
    if (!selected.ok) return err(selected.error);
    executionContext = { capabilities, selection: selected.value };
    if (selected.value.engine.enabled) {
      const workerApp = await createWorkerExecutionApp({
        canvas,
        appOptions: opts,
        syncCanvas: (currentCanvas) => measureCanvasDrawingBuffer(currentCanvas),
        ...bundler !== void 0 ? { bundler } : {},
        capabilities,
        selection: selected.value
      });
      if (workerApp.ok && typeof import.meta !== "undefined" && import.meta.env?.DEV === true && import.meta.env?.VITE_FORGEAX_ENGINE_BRIDGE === "1" && workerApp.value.remoteEval !== void 0) {
        const bridgePort = import.meta.env?.VITE_FORGEAX_ENGINE_BRIDGE_PORT ?? "5733";
        const bridge = await Promise.resolve().then(() => (init_browser_remote_bridge(), browser_remote_bridge_exports));
        const teardown = await bridge.installBrowserExecutionBridge({
          execute: workerApp.value.remoteEval,
          port: bridgePort,
          ...workerApp.value.clearInput === void 0 ? {} : { clearInput: workerApp.value.clearInput },
          ...workerApp.value.beginInputLease === void 0 ? {} : { beginInputLease: workerApp.value.beginInputLease },
          ...workerApp.value.finishProfiler === void 0 ? {} : { finishProfiler: workerApp.value.finishProfiler }
        });
        const workerExecutionApp = workerApp.value;
        const stop = workerExecutionApp.stop;
        return ok({
          ...workerExecutionApp,
          stop: () => {
            const result = stop();
            teardown();
            return result;
          }
        });
      }
      return workerApp;
    }
    if (executionBootstrapUrl === void 0) {
      throw new Error("execution bootstrap URL was not normalized");
    }
    const prepared = await prepareBootstrapEntry(
      executionBootstrapUrl,
      opts.execution.bootstrapData
    );
    if (!prepared.ok) return err(prepared.error);
    preparedExecutionBootstrap = prepared.value;
    const runtimeBinding2 = opts.execution.assetCatalog?.runtimeBinding;
    if (runtimeBinding2 !== void 0) {
      bundler = { ...bundler, importTransport: createDevImportTransport(runtimeBinding2) };
    }
  }
  const rendererOpts = {};
  if (opts?.rhi !== void 0) {
    Object.assign(rendererOpts, { rhi: opts.rhi });
  }
  if (opts?.profiler !== void 0) {
    Object.assign(rendererOpts, { profiler: opts.profiler });
  }
  const rendererFeatures = preparedExecutionBootstrap?.features ?? opts?.features;
  if (rendererFeatures !== void 0) {
    Object.assign(rendererOpts, { features: rendererFeatures });
  }
  if (opts?.standardProfile !== void 0) {
    Object.assign(rendererOpts, { standardProfile: opts.standardProfile });
  }
  if (opts?.rhiInstrumentation !== void 0) {
    Object.assign(rendererOpts, { rhiInstrumentation: opts.rhiInstrumentation });
  }
  if (opts?.gpuPassTiming !== void 0) {
    Object.assign(rendererOpts, { gpuPassTiming: opts.gpuPassTiming });
  }
  if (opts?.captureReflectionFallbackReadback !== void 0) {
    Object.assign(rendererOpts, {
      captureReflectionFallbackReadback: opts.captureReflectionFallbackReadback
    });
  }
  if (opts?.ssrIdentity !== void 0) {
    Object.assign(rendererOpts, { ssrIdentity: opts.ssrIdentity });
  }
  let rhiAttachment;
  let rhiCapture;
  let rhiDebugGlobal;
  const cleanupRhiDebugHost = () => {
    const host = globalThis;
    if (host.__forgeax === rhiDebugGlobal) delete host.__forgeax;
    rhiDebugGlobal = void 0;
    const attachment = rhiAttachment;
    rhiAttachment = void 0;
    if (attachment !== void 0) void attachment.dispose();
  };
  const importMetaEnv = typeof import.meta !== "undefined" ? { FORGEAX_ENGINE_RHI_DEBUG: import.meta.env?.FORGEAX_ENGINE_RHI_DEBUG } : void 0;
  const browserBuildRhiDebugFlag = typeof import.meta !== "undefined" ? import.meta.env?.FORGEAX_ENGINE_RHI_DEBUG : void 0;
  const processEnv = globalThis.process?.env;
  const rhiDebugFlag = resolveRhiDebugFlag(importMetaEnv, processEnv);
  const nav = typeof globalThis !== "undefined" ? globalThis.navigator : void 0;
  const hasWebGPU = nav !== void 0 && "gpu" in nav && nav.gpu !== void 0;
  if ((browserBuildRhiDebugFlag === void 0 || browserBuildRhiDebugFlag === "1") && rhiDebugFlag === "1") {
    const realBackend = hasWebGPU ? rhiWebgpu : await import('../../rhi-wgpu/dist/index.mjs');
    if (!hasWebGPU && "ensureReady" in realBackend) {
      await realBackend.ensureReady();
    }
    const pack = loadRhiPack(realBackend);
    if (pack.createShaderModule === void 0) {
      throw new Error("RHI-debug requires a backend createShaderModule capability");
    }
    const attached = attachRecorder({
      rhi: pack.rhi,
      createShaderModule: pack.createShaderModule,
      ...pack.createShaderModuleImmediate === void 0 ? {} : { createShaderModuleImmediate: pack.createShaderModuleImmediate }
    });
    if (!attached.ok) throw new Error(attached.error.hint);
    rhiAttachment = attached.value;
    rhiCapture = createRhiCapture(attached.value);
    const capture = rhiCapture;
    rhiDebugGlobal = { captureFrame: (options) => capture.captureFrame(options) };
    Object.assign(rendererOpts, {
      rhi: attached.value.backend.rhi,
      rhiInstrumentation: mergeRhiInstrumentation(
        createRhiInstrumentation(attached.value),
        rendererOpts.rhiInstrumentation
      )
    });
    globalThis.__forgeax = rhiDebugGlobal;
    markRendererBootstrapStage("rhi-debug-attached");
  }
  let renderer;
  let rendererDebugDrawHost;
  let rendererFeatureHost;
  let assets;
  let assetAssembly;
  try {
    markRendererBootstrapStage("renderer-host-start");
    const constructed = await constructRuntimeRendererHost(canvas, rendererOpts, bundler);
    if (!constructed.ok) throw constructed.error;
    renderer = constructed.value.renderer;
    await preparedExecutionBootstrap?.configureRenderer?.(renderer);
    rendererDebugDrawHost = constructed.value.debugDrawHost;
    rendererFeatureHost = createRenderFeatureHost(constructed.value.featureHost);
    assets = constructed.value.assets;
    markRendererBootstrapStage("renderer-initialized");
  } catch (e) {
    markRendererBootstrapStage("renderer-host-failed", {
      message: e instanceof Error ? e.message : String(e)
    });
    cleanupRhiDebugHost();
    if (e instanceof EngineEnvironmentError) return err(e);
    const detail = e instanceof Error ? e : new Error(String(e));
    return err(
      new EngineEnvironmentError("renderer construction failed", {
        webgpuError: detail
      })
    );
  }
  const executionCatalog = opts?.execution?.assetCatalog;
  const catalogSource = opts?.assetCatalog ?? (executionCatalog === void 0 ? void 0 : createCatalogSource({
    url: executionCatalog.url,
    ...executionCatalog.expectedScope === void 0 ? {} : { expectedScope: executionCatalog.expectedScope }
  }));
  const runtimeBinding = opts?.assetRuntimeBinding ?? executionCatalog?.runtimeBinding;
  const assetAssemblyRequested = assets !== void 0 || opts?.assets !== void 0 || catalogSource !== void 0 || opts?.assetDecoders !== void 0 || runtimeBinding !== void 0;
  if (assetAssemblyRequested) {
    const assetAssemblyResult = createAssetRuntimeAssembly(assets, {
      ...opts?.assets === void 0 ? {} : { registry: opts.assets },
      ...catalogSource === void 0 ? {} : { catalogSource },
      ...opts?.assetDecoders === void 0 ? {} : { decoderContributions: opts.assetDecoders },
      ...runtimeBinding === void 0 ? {} : { runtimeBinding }
    });
    if (!assetAssemblyResult.ok) {
      cleanupRhiDebugHost();
      await renderer.dispose();
      return err(assetAssemblyResult.error);
    }
    assetAssembly = assetAssemblyResult.value;
    assets = assetAssembly.registry;
  }
  const shouldStartRemote = resolveRemoteServeFlag(
    typeof import.meta !== "undefined" ? import.meta.env?.DEV : void 0,
    globalThis.process?.env
  );
  let debugDraw;
  const world = new World(opts?.time !== void 0 ? { time: opts.time } : {});
  const frameInspection = createFrameInspectionRef();
  const inputHandle = opts?.input === void 0 ? attachInputAuto(canvas, {
    ...opts?.uiRoot ? { uiRoot: opts.uiRoot } : {},
    ...opts?.pointerLockAllowed ? { pointerLockAllowed: opts.pointerLockAllowed } : {},
    ...opts?.virtualJoysticks ? { virtualJoysticks: opts.virtualJoysticks } : {},
    ...opts?.lockProvider ? { lockProvider: opts.lockProvider } : {}
  }) : void 0;
  const inputBackend = opts?.input ?? inputHandle?.backend;
  const userPlugins = preparedExecutionBootstrap === void 0 ? opts?.plugins ?? [] : [
    executionBootstrapHostPlugin({
      canvas,
      renderTargets: renderer,
      ...opts?.execution?.bootstrapPort === void 0 ? {} : { port: opts.execution.bootstrapPort },
      setPointerLockAllowed: (allowed) => inputBackend?.setPointerLockAllowed?.(allowed)
    }),
    ...preparedExecutionBootstrap.plugins ?? []
  ];
  let pluginContext;
  const ownedAppFibers = [];
  const disposeAppContext = async () => {
    try {
      if (opts?.context === void 0) {
        await pluginContext.fiber.dispose();
        return;
      }
      for (const fiber of ownedAppFibers.reverse()) await fiber.dispose();
    } finally {
      opts?.execution?.bootstrapPort?.close();
    }
  };
  const installAppPlugin = async (plugin) => {
    const fiber = await pluginContext.plugin(plugin);
    if (opts?.context !== void 0) ownedAppFibers.push(fiber);
    return fiber;
  };
  const profile = mainEngineProfile({
    renderer,
    ...assetAssembly === void 0 ? {} : { assetAssembly },
    rendererDebugDrawHost,
    rendererFeatureHost,
    assets,
    animationPayloads: createAnimationPayloadLookup(assets),
    ...inputBackend === void 0 ? {} : { input: inputBackend },
    ...inputHandle === void 0 ? {} : { inputDispose: inputHandle.cleanup },
    ...opts?.inputMap === void 0 ? {} : { inputMap: opts.inputMap },
    onDebugDrawReady: (value) => {
      debugDraw = value;
    },
    extensions: [
      rhiDebugHostPlugin(cleanupRhiDebugHost),
      ...userPlugins,
      canvasAspectPlugin(canvas)
    ]
  });
  try {
    if (opts?.context === void 0) {
      pluginContext = await createWorldContext(world, profile);
    } else {
      pluginContext = opts.context;
      await installAppPlugin(worldPlugin(world));
      for (const plugin of profile) await installAppPlugin(plugin);
    }
  } catch (cause) {
    opts?.execution?.bootstrapPort?.close();
    cleanupRhiDebugHost();
    assetAssembly?.dispose();
    if (opts?.context !== void 0) {
      for (const fiber of ownedAppFibers.reverse()) await fiber.dispose();
    }
    return err(
      makeAppError2(
        "app-plugin-activation-failed",
        APP_EXPECTED["app-plugin-activation-failed"],
        APP_ERROR_HINTS["app-plugin-activation-failed"],
        { cause }
      )
    );
  }
  const audioBackend = pluginContext.get("audio");
  const executionControl = createLocalExecutionControl(
    executionContext === void 0 ? {
      ...createExecutionReport(
        unavailableExecutionCapabilities("local assembly"),
        selectExecutionWorkers({
          workers: { engine: false },
          capabilities: unavailableExecutionCapabilities("local assembly")
        }).unwrap()
      ),
      engine: { realm: "host", health: "idle" },
      world: {
        identity: world.identity,
        health: world.execution.health,
        partialWrite: false,
        retryable: true
      }
    } : {
      ...createExecutionReport(executionContext.capabilities, executionContext.selection),
      engine: { realm: "host", health: "idle" },
      world: {
        identity: world.identity,
        health: world.execution.health,
        partialWrite: false,
        retryable: true
      }
    },
    {
      ...audioBackend === void 0 ? {} : { audio: () => audioBackend.getState() },
      world: () => ({
        identity: world.identity,
        health: world.execution.health,
        partialWrite: world.execution.fault?.partialWrite ?? false,
        retryable: world.execution.fault?.retryable ?? true
      }),
      frame: () => frameInspection.current()
    }
  );
  const pluginProjection = createPluginProjectionBridge();
  globalThis.__forgeaxPluginProjection = pluginProjection;
  const remoteHandle = shouldStartRemote ? await startRemoteServer(
    world,
    renderer,
    assets,
    rhiCapture,
    opts?.profiler,
    executionControl,
    pluginProjection
  ) : void 0;
  if (remoteHandle !== void 0) await installAppPlugin(remoteServerPlugin(remoteHandle));
  const buildArgs = {
    renderer,
    assets,
    world,
    pluginContext,
    disposePluginContext: disposeAppContext,
    executionControl,
    frameInspection,
    onFrameSubmitted: (event) => publishBrowserFrameSubmitted(canvas, { ...event, worldIdentity: world.identity }),
    onFrameCompleted: (event) => publishBrowserFrameCompleted(canvas, { ...event, worldIdentity: world.identity }),
    ...inputBackend !== void 0 ? { inputBackend } : {},
    ...inputHandle === void 0 ? {} : {
      wireOnLockErrorDispatch: (dispatch) => {
        inputHandle.setOnErrorDispatch(dispatch);
      }
    }
  };
  if (audioBackend !== void 0) {
    Object.assign(buildArgs, {
      audioBackend
    });
  }
  if (opts?.silenceUnhandledErrors !== void 0) {
    Object.assign(buildArgs, { silenceUnhandledErrors: opts.silenceUnhandledErrors });
  }
  if (opts?.drawSource !== void 0) {
    Object.assign(buildArgs, { drawSource: opts.drawSource });
  }
  if (opts?.profiler !== void 0) {
    Object.assign(buildArgs, { profiler: opts.profiler });
  }
  if (rhiCapture !== void 0) {
    Object.assign(buildArgs, { rhiCapture });
  }
  if (debugDraw !== void 0) {
    Object.assign(buildArgs, { debugDraw });
  }
  if (remoteHandle !== void 0) {
    Object.assign(buildArgs, { remoteHandle });
  }
  resetBrowserFrameSubmitted(canvas);
  await installAppPlugin({
    name: "forgeax:browser-frame-signal",
    apply(ctx) {
      ctx.effect(() => {
        const unsubscribe = renderer.subscribe((event) => {
          if (event.kind === "error" && renderer.state() !== "alive")
            resetBrowserFrameSubmitted(canvas);
        });
        return () => {
          unsubscribe();
          resetBrowserFrameSubmitted(canvas);
        };
      });
    }
  });
  const built = await buildApp(buildArgs);
  if (!built.ok) {
    await disposeAppContext();
    return built;
  }
  if (built.ok) {
    if (typeof import.meta !== "undefined" && import.meta.env?.DEV === true && import.meta.env?.VITE_FORGEAX_ENGINE_BRIDGE === "1") {
      const bridgePort = import.meta.env?.VITE_FORGEAX_ENGINE_BRIDGE_PORT ?? "5733";
      await installAppPlugin({
        name: "browser-remote-bridge",
        inject: ["world", "renderer", "assets"],
        async apply(ctx) {
          if (ctx.renderer === void 0 || ctx.assets === void 0) {
            throw new Error("browser remote bridge requires renderer and assets services");
          }
          const bridge = await Promise.resolve().then(() => (init_browser_remote_bridge(), browser_remote_bridge_exports));
          const teardown = await bridge.installBrowserRemoteBridge({
            world: ctx.world,
            renderer: ctx.renderer,
            assets: ctx.assets,
            runtimeModule: engineRuntimeModule,
            ...rhiCapture !== void 0 ? { rhiCapture } : {},
            plugins: pluginProjection,
            simulation: built.value,
            ...opts?.profiler !== void 0 ? { profiler: opts.profiler } : {},
            execution: built.value.execution,
            port: bridgePort
          });
          ctx.effect(() => teardown, "remote/browser-bridge");
        }
      });
    }
  }
  return built;
}
function syncCanvasDrawingBuffer(canvas) {
  if (!Number.isFinite(canvas.clientWidth) || !Number.isFinite(canvas.clientHeight) || canvas.clientWidth <= 0 || canvas.clientHeight <= 0)
    return;
  const hasExplicitCssSize = (canvas.style?.width ?? "") !== "" || (canvas.style?.height ?? "") !== "";
  if (!hasExplicitCssSize && canvas.clientWidth === canvas.width && canvas.clientHeight === canvas.height) {
    return;
  }
  const dpr = Math.max(1, globalThis.devicePixelRatio || 1);
  const previous = syncedCanvasSizes.get(canvas);
  const drawingBufferIsTheLayoutMeasurement = previous !== void 0 && canvas.width === previous.drawingWidth && canvas.height === previous.drawingHeight && canvas.clientWidth === previous.drawingWidth && canvas.clientHeight === previous.drawingHeight;
  const cssWidth = drawingBufferIsTheLayoutMeasurement ? previous.cssWidth : canvas.clientWidth;
  const cssHeight = drawingBufferIsTheLayoutMeasurement ? previous.cssHeight : canvas.clientHeight;
  const width = Math.max(1, Math.round(cssWidth * dpr));
  const height = Math.max(1, Math.round(cssHeight * dpr));
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  syncedCanvasSizes.set(canvas, {
    cssWidth,
    cssHeight,
    drawingWidth: width,
    drawingHeight: height
  });
}
function measureCanvasDrawingBuffer(canvas, maxCanvasPixelRatio) {
  if (!Number.isFinite(canvas.clientWidth) || !Number.isFinite(canvas.clientHeight) || canvas.clientWidth <= 0 || canvas.clientHeight <= 0) {
    return { width: canvas.width, height: canvas.height };
  }
  const hasExplicitCssSize = (canvas.style?.width ?? "") !== "" || (canvas.style?.height ?? "") !== "";
  if (!hasExplicitCssSize && canvas.clientWidth === canvas.width && canvas.clientHeight === canvas.height) {
    return { width: canvas.width, height: canvas.height };
  }
  const devicePixelRatio = Math.max(1, globalThis.devicePixelRatio || 1);
  const dpr = maxCanvasPixelRatio === void 0 || !Number.isFinite(maxCanvasPixelRatio) || maxCanvasPixelRatio <= 0 ? devicePixelRatio : Math.min(devicePixelRatio, maxCanvasPixelRatio);
  const previous = syncedCanvasSizes.get(canvas);
  const drawingBufferIsTheLayoutMeasurement = previous !== void 0 && canvas.width === previous.drawingWidth && canvas.height === previous.drawingHeight && canvas.clientWidth === previous.drawingWidth && canvas.clientHeight === previous.drawingHeight;
  const cssWidth = drawingBufferIsTheLayoutMeasurement ? previous.cssWidth : canvas.clientWidth;
  const cssHeight = drawingBufferIsTheLayoutMeasurement ? previous.cssHeight : canvas.clientHeight;
  return {
    width: Math.max(1, Math.round(cssWidth * dpr)),
    height: Math.max(1, Math.round(cssHeight * dpr))
  };
}
var syncedCanvasSizes = /* @__PURE__ */ new WeakMap();
function syncCameraAspect(world, canvasW, canvasH) {
  if (canvasW <= 0 || canvasH <= 0) return;
  const aspect = canvasW / canvasH;
  const query = world.query({ with: [Camera] }).unwrap();
  for (const row of query) {
    const entity = row.entity;
    const r = world.get(entity, Camera);
    if (!r.ok) continue;
    if (r.value.autoAspect !== true) continue;
    if (r.value.projection !== CAMERA_PROJECTION_PERSPECTIVE) continue;
    if (r.value.aspect === Math.fround(aspect)) continue;
    world.set(entity, Camera, { aspect });
  }
}
function createPluginProjectionBridge() {
  const bridge = {
    inspect: () => bridge.current?.inspect() ?? {
      desired: [],
      live: [],
      liveState: "unavailable"
    }
  };
  return bridge;
}
async function startRemoteServer(world, renderer, assets, rhiCapture, profiler, execution, plugins) {
  try {
    const remoteServerMod = await import(
      /* @vite-ignore */
      '@forgeax/engine-remote/server'
    );
    const serverResult = await remoteServerMod.startServer({
      port: 0,
      host: "127.0.0.1",
      world,
      renderer,
      assets,
      introspection: projectComponentIntrospection(world.components.entries()),
      ...rhiCapture !== void 0 ? { rhiCapture } : {},
      ...profiler !== void 0 ? { profiler } : {},
      execution,
      ...plugins !== void 0 ? { plugins } : {}
    });
    if (serverResult.ok && serverResult.value !== void 0) {
      return { port: serverResult.value.port, close: serverResult.value.close };
    }
  } catch (_error) {
  }
  return void 0;
}
async function createAppFromAssemble(args) {
  const assetAssemblyRequested = args.assets !== void 0 || args.assetCatalog !== void 0 || args.assetDecoders !== void 0 || args.assetRuntimeBinding !== void 0;
  let assetAssembly;
  if (assetAssemblyRequested) {
    const assetAssemblyResult = createAssetRuntimeAssembly(args.assets, {
      ...args.assets === void 0 ? {} : { registry: args.assets },
      ...args.assetCatalog === void 0 ? {} : { catalogSource: args.assetCatalog },
      ...args.assetDecoders === void 0 ? {} : { decoderContributions: args.assetDecoders },
      ...args.assetRuntimeBinding === void 0 ? {} : { runtimeBinding: args.assetRuntimeBinding }
    });
    if (!assetAssemblyResult.ok) return err(assetAssemblyResult.error);
    assetAssembly = assetAssemblyResult.value;
  }
  const assets = assetAssembly?.registry ?? args.assets;
  let pluginContext;
  try {
    pluginContext = await createWorldContext(
      args.world,
      assembledEngineProfile({
        renderer: args.renderer,
        ...assets === void 0 ? {} : { assets },
        ...assetAssembly === void 0 ? {} : { assetAssembly },
        extensions: args.plugins ?? []
      })
    );
  } catch (cause) {
    assetAssembly?.dispose();
    return err(
      makeAppError2(
        "app-plugin-activation-failed",
        APP_EXPECTED["app-plugin-activation-failed"],
        APP_ERROR_HINTS["app-plugin-activation-failed"],
        { cause }
      )
    );
  }
  const shouldStartRemote = resolveRemoteServeFlag(
    void 0,
    globalThis.process?.env
  );
  const assembledAudioBackend = pluginContext.audio;
  const frameInspection = createFrameInspectionRef();
  const executionControl = createLocalExecutionControl(
    {
      ...createExecutionReport(
        unavailableExecutionCapabilities("local assembly"),
        selectExecutionWorkers({
          workers: { engine: false },
          capabilities: unavailableExecutionCapabilities("local assembly")
        }).unwrap()
      ),
      engine: { realm: "host", health: "idle" },
      world: {
        identity: args.world.identity,
        health: args.world.execution.health,
        partialWrite: false,
        retryable: true
      }
    },
    {
      ...assembledAudioBackend === void 0 ? {} : { audio: () => assembledAudioBackend.getState() },
      world: () => ({
        identity: args.world.identity,
        health: args.world.execution.health,
        partialWrite: args.world.execution.fault?.partialWrite ?? false,
        retryable: args.world.execution.fault?.retryable ?? true
      }),
      frame: () => frameInspection.current()
    }
  );
  const remoteHandle = shouldStartRemote ? await startRemoteServer(
    args.world,
    args.renderer,
    assets,
    void 0,
    args.profiler,
    executionControl
  ) : void 0;
  if (remoteHandle !== void 0) await pluginContext.plugin(remoteServerPlugin(remoteHandle));
  const buildArgs = {
    renderer: args.renderer,
    ...assets === void 0 ? {} : { assets },
    world: args.world,
    pluginContext,
    executionControl,
    frameInspection,
    ...remoteHandle !== void 0 ? { remoteHandle } : {}
  };
  const assembledInputBackend = pluginContext.input;
  if (assembledInputBackend !== void 0) {
    Object.assign(buildArgs, {
      inputBackend: assembledInputBackend
    });
  }
  if (assembledAudioBackend !== void 0) {
    Object.assign(buildArgs, {
      audioBackend: assembledAudioBackend
    });
  }
  if (args.silenceUnhandledErrors !== void 0) {
    Object.assign(buildArgs, { silenceUnhandledErrors: args.silenceUnhandledErrors });
  }
  if (args.drawSource !== void 0) {
    Object.assign(buildArgs, { drawSource: args.drawSource });
  }
  if (args.profiler !== void 0) {
    Object.assign(buildArgs, { profiler: args.profiler });
  }
  const built = await buildApp(buildArgs);
  if (!built.ok) await pluginContext.fiber.dispose();
  return built;
}
async function buildApp(args) {
  const {
    renderer,
    assets,
    world,
    pluginContext,
    inputBackend,
    audioBackend,
    silenceUnhandledErrors,
    rhiCapture,
    debugDraw,
    remoteHandle,
    profiler
  } = args;
  const frameInspection = args.frameInspection ?? createFrameInspectionRef();
  function readPhysicsWorld() {
    return pluginContext.get("physics");
  }
  const fanout = new ErrorFanoutRegistry(
    silenceUnhandledErrors !== void 0 ? { silenceUnhandledErrors } : {}
  );
  let lastError;
  const execution = args.executionControl ?? createLocalExecutionControl(
    {
      ...createExecutionReport(
        unavailableExecutionCapabilities("local assembly"),
        selectExecutionWorkers({
          workers: { engine: false },
          capabilities: unavailableExecutionCapabilities("local assembly")
        }).unwrap()
      ),
      engine: { realm: "host", health: "idle" },
      world: {
        identity: world.identity,
        health: world.execution.health,
        partialWrite: world.execution.fault?.partialWrite ?? false,
        retryable: world.execution.fault?.retryable ?? true
      }
    },
    {
      ...audioBackend === void 0 ? {} : { audio: () => audioBackend.getState() },
      world: () => ({
        identity: world.identity,
        health: world.execution.health,
        partialWrite: world.execution.fault?.partialWrite ?? false,
        retryable: world.execution.fault?.retryable ?? true
      }),
      frame: () => frameInspection.current()
    }
  );
  function dispatch(e) {
    lastError = e;
    fanout.fire(e);
  }
  if (args.wireOnLockErrorDispatch) {
    args.wireOnLockErrorDispatch(dispatch);
  }
  const observation = createAppObservation(world, renderer, execution);
  const loopOpts = {
    world,
    renderer,
    onError: dispatch,
    beforeDraw: observation.prepareFrame
  };
  if (args.onFrameSubmitted !== void 0) {
    Object.assign(loopOpts, {
      onSubmitted: (receipt) => args.onFrameSubmitted?.({
        frameId: receipt.frameId,
        deviceGeneration: receipt.deviceGeneration,
        ...receipt.graphGeneration === void 0 ? {} : { graphGeneration: receipt.graphGeneration },
        receipt,
        ...receipt.barrelDistortion === void 0 ? {} : { barrelDistortion: receipt.barrelDistortion },
        worldIdentity: world.identity
      })
    });
  }
  if (args.onFrameCompleted !== void 0) {
    Object.assign(loopOpts, {
      onCompleted: (receipt) => args.onFrameCompleted?.({
        frameId: receipt.frameId,
        deviceGeneration: receipt.deviceGeneration,
        // A receipt produced by the current Render contract always carries
        // presentation. If a legacy adapter omits it, do not turn an
        // unproven frame into startup success.
        presentation: receipt.presentation ?? "pending",
        worldIdentity: world.identity
      })
    });
  }
  if (args.drawSource !== void 0) {
    Object.assign(loopOpts, { drawSource: args.drawSource });
  }
  if (profiler !== void 0) {
    Object.assign(loopOpts, { profiler });
  }
  const loop = createFrameLoop(loopOpts);
  frameInspection.current = loop.inspect;
  if (rhiCapture !== void 0) {
    bindRhiCaptureFrameDriver(rhiCapture, {
      getState: () => loop.getState(),
      pause: () => {
        const result = loop.pause();
        if (result.ok) execution.setEngineHealth("idle");
        return result;
      },
      resume: () => {
        const result = loop.resume();
        if (result.ok) execution.setEngineHealth("running");
        return result;
      },
      stepFrame: (deltaSeconds) => loop.stepFrame(deltaSeconds)
    });
  }
  let rendererUnsubscribe;
  let resumeAfterSurfaceRestore = false;
  function subscribeRendererErrors() {
    if (rendererUnsubscribe !== void 0) {
      return;
    }
    rendererUnsubscribe = renderer.subscribe((event) => {
      if (event.kind === "frame-submitted") return;
      if (event.kind !== "error") return;
      const e = event.error;
      dispatch(e);
    });
  }
  function unsubscribeRendererErrors() {
    if (rendererUnsubscribe !== void 0) {
      rendererUnsubscribe();
      rendererUnsubscribe = void 0;
    }
  }
  const stub = {
    renderer,
    ...assets === void 0 ? {} : { assets },
    world,
    execution,
    observation,
    async releaseSurfacePreserveWorld() {
      if (loop.getState() === "running") {
        const paused = loop.pause();
        if (!paused.ok) {
          return err(
            new RhiError({
              code: "rhi-not-available",
              expected: "running App pauses before releasing its presentation surface",
              hint: paused.error.hint
            })
          );
        }
        resumeAfterSurfaceRestore = true;
        execution.setEngineHealth("idle");
      }
      await Promise.resolve();
      await loop.drainFrameReceipts();
      const released = renderer.releaseSurface();
      if (!released.ok && resumeAfterSurfaceRestore) {
        loop.resume();
        resumeAfterSurfaceRestore = false;
        execution.setEngineHealth("running");
      }
      return released.ok ? ok(void 0) : err(released.error);
    },
    async restoreSurface() {
      const restored = renderer.restoreSurface();
      if (!restored.ok) return err(restored.error);
      if (resumeAfterSurfaceRestore) {
        const resumed = loop.resume();
        if (!resumed.ok) {
          return err(
            new RhiError({
              code: "rhi-not-available",
              expected: "paused App resumes after restoring its presentation surface",
              hint: resumed.error.hint
            })
          );
        }
        resumeAfterSurfaceRestore = false;
        execution.setEngineHealth("running");
      }
      return ok(void 0);
    },
    pluginContext,
    ...inputBackend !== void 0 ? { input: inputBackend } : {},
    ...audioBackend !== void 0 ? { audio: audioBackend } : {},
    get physics() {
      return readPhysicsWorld();
    },
    start() {
      const r = loop.start();
      if (r.ok) {
        execution.setEngineHealth("running");
        subscribeRendererErrors();
      }
      return r;
    },
    stop() {
      const r = loop.stop();
      if (r.ok) {
        observation.release();
        execution.setEngineHealth("stopped");
      }
      unsubscribeRendererErrors();
      return r;
    },
    async dispose() {
      const state = loop.getState();
      if (state === "running" || state === "paused") loop.stop();
      else if (state !== "stopped") loop.setStopped();
      await loop.drainFrameReceipts();
      await (args.disposePluginContext?.() ?? pluginContext.fiber.dispose());
      observation.release();
      unsubscribeRendererErrors();
      execution.setEngineHealth("stopped");
      return ok(void 0);
    },
    pause() {
      const r = loop.pause();
      if (r.ok) execution.setEngineHealth("idle");
      return r;
    },
    resume() {
      const r = loop.resume();
      if (r.ok) execution.setEngineHealth("running");
      return r;
    },
    stepFrame(deltaSeconds) {
      return loop.stepFrame(deltaSeconds);
    },
    onError(cb) {
      return fanout.add(cb);
    },
    setDrawSource(drawSource) {
      loop.setDrawSource(drawSource);
    },
    /**
     * Most recent dispatched error retained for host self-inspection.
     */
    get lastError() {
      return lastError;
    },
    ...rhiCapture !== void 0 ? { rhiCapture } : {},
    ...debugDraw !== void 0 ? { debugDraw } : {},
    ...remoteHandle !== void 0 ? { remote: remoteHandle } : {}
  };
  return ok(stub);
}
function ensureFallbackCamera(world, aspect = 1) {
  const cameras = world.query({ with: [Camera] }).unwrap();
  if (!cameras[Symbol.iterator]().next().done) return void 0;
  return world.spawn(
    { component: Transform, data: { pos: [0, 0.6, 5] } },
    { component: Camera, data: perspective({ fov: Math.PI / 3, aspect, far: 1e3 }) }
  );
}

// src/game-context.ts
function gameHostPlugin(host) {
  return {
    name: "game-host",
    provide: "gameHost",
    apply(ctx) {
      ctx.provide("gameHost", host);
    }
  };
}
var ENGINE_WORKSPACE_SERVICE = "engine.workspace";
var ENGINE_WORKSPACE_PLUGIN_ID = "forgeax:engine-workspace";
var ENGINE_WORKSPACE_API_VERSION = "forgeax.engine.workspace/1";
var ENGINE_WORKSPACE_COMMAND_TOPIC = "engine.workspace.command";
function engineWorkspaceResultService(targetId) {
  return `engine.workspace.result:${targetId}`;
}
var ENGINE_WORKSPACE_PREVIEWABLE_KINDS = [
  "scene",
  "material",
  "mesh",
  "texture",
  "vfx"
];
var EngineWorkspaceError = class extends Error {
  constructor(code, expected, hint = expected, detail = {}) {
    super(expected);
    this.code = code;
    this.expected = expected;
    this.hint = hint;
    this.detail = detail;
    this.name = "EngineWorkspaceError";
  }
  code;
  expected;
  hint;
  detail;
};
async function loadEngineWorkspaceMaterialSlots(slots, load, allocate) {
  const materials = await Promise.all(
    slots.map(async (slot) => {
      if (slot.defaultMaterial === void 0) return void 0;
      const loaded = await load(slot);
      if (!loaded.ok) throw loaded.error;
      return loaded.value;
    })
  );
  return materials.map((material) => material === void 0 ? 0 : allocate(material));
}
function createEngineWorkspaceProvider(factory) {
  if (!factory || typeof factory.openProjectSession !== "function") {
    throw new TypeError("Engine workspace provider requires openProjectSession");
  }
  const sessionFor = (handle) => {
    if (handle === null || typeof handle !== "object" || !("target" in handle) || typeof handle.openPreview !== "function" && typeof handle.listAssets !== "function" && !("app" in handle && "assets" in handle)) {
      throw new TypeError("Engine workspace project handle is not a project session");
    }
    return handle;
  };
  return {
    async startPlay(input) {
      const session = sessionFor(input.handle);
      if (!session.startPlay)
        throw new EngineWorkspaceError(
          "engine-workspace-capability-unavailable",
          "An Engine Play provider"
        );
      return session.startPlay(input.signal ? { signal: input.signal } : {});
    },
    async openProject(input) {
      const session = await factory.openProjectSession(input);
      if (!session || typeof session !== "object") {
        throw new TypeError("Engine workspace session factory must return a session");
      }
      assertTarget(session.target);
      return {
        project: session.project,
        target: session.target,
        handle: session,
        get failure() {
          return session.failure;
        }
      };
    },
    async closeProject(input) {
      const session = sessionFor(input.handle);
      await Promise.resolve(session.close?.());
    },
    async listAssets(input) {
      const session = sessionFor(input.handle);
      if (session.listAssets !== void 0) {
        return session.listAssets(input.signal === void 0 ? {} : { signal: input.signal });
      }
      if (session.assets === void 0) {
        throw new TypeError("Engine workspace session must expose listAssets or an AssetRegistry");
      }
      return projectEngineWorkspaceAssets(session.assets.catalogSnapshot()?.entries ?? []);
    },
    async openPreview(input) {
      const session = sessionFor(input.projectHandle);
      if (session.project.id !== input.project.id) {
        throw new Error("Engine workspace project session identity mismatch");
      }
      const target = {
        ...session.target,
        width: input.width,
        height: input.height
      };
      if (typeof session.openPreview === "function") {
        return session.openPreview({
          project: input.project,
          asset: input.asset,
          target,
          width: input.width,
          height: input.height,
          ...input.signal === void 0 ? {} : { signal: input.signal }
        });
      }
      if (session.app === void 0 || session.assets === void 0) {
        throw new TypeError(
          "Engine workspace session must expose openPreview or a local App and AssetRegistry"
        );
      }
      if (input.asset.kind !== "scene") {
        throw new Error(
          `Engine workspace preview does not support asset kind ${input.asset.kind}; provide the Engine type-preview capability on the project session`
        );
      }
      return createEngineWorkspaceAppPreview({
        app: session.app,
        assets: session.assets,
        asset: input.asset,
        project: input.project,
        target,
        ...session.presentation === void 0 ? {} : { presentation: session.presentation },
        ...session.capture === void 0 ? {} : { capture: session.capture },
        ...session.applyInput === void 0 ? {} : { applyInput: session.applyInput }
      });
    }
  };
}
function abortError(signal) {
  if (!signal?.aborted) return;
  const reason = signal.reason;
  if (reason instanceof Error) throw reason;
  throw Object.assign(new Error("engine workspace operation was cancelled"), {
    name: "AbortError",
    cause: reason
  });
}
function assertTarget(target) {
  if (typeof target.targetId !== "string" || target.targetId.length === 0 || typeof target.sessionId !== "string" || target.sessionId.length === 0 || typeof target.worldId !== "string" || target.worldId.length === 0 || typeof target.headed !== "boolean" || !Number.isSafeInteger(target.width) || target.width < 1 || !Number.isSafeInteger(target.height) || target.height < 1) {
    throw new TypeError(
      "Engine workspace preview must return a stable target with session, World, extent, and headed identities"
    );
  }
}
function normalizePreview(preview) {
  if (preview === null || typeof preview !== "object") {
    throw new TypeError("Engine workspace preview must be an object");
  }
  assertTarget(preview.target);
  if (typeof preview.getCamera !== "function") {
    throw new TypeError("Engine workspace preview must expose the Engine observation camera");
  }
  return preview;
}
function record(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return void 0;
  return value;
}
function finiteInputNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
function finiteVector3(value) {
  if (value === null || typeof value !== "object" && typeof value !== "function" || !("length" in value) || typeof value.length !== "number" || value.length < 3) {
    return void 0;
  }
  const sequence = value;
  const vector = [Number(sequence[0]), Number(sequence[1]), Number(sequence[2])];
  return vector.every(Number.isFinite) ? vector : void 0;
}
function rotateWorkspaceVector(quaternion, vector) {
  const qx = Number(quaternion[0]);
  const qy = Number(quaternion[1]);
  const qz = Number(quaternion[2]);
  const qw = Number(quaternion[3]);
  const [vx, vy, vz] = vector;
  const tx = 2 * (qy * vz - qz * vy);
  const ty = 2 * (qz * vx - qx * vz);
  const tz = 2 * (qx * vy - qy * vx);
  return [
    vx + qw * tx + (qy * tz - qz * ty),
    vy + qw * ty + (qz * tx - qx * tz),
    vz + qw * tz + (qx * ty - qy * tx)
  ];
}
function createDefaultWorkspaceCameraInputController(observation, isActive, world, systemName) {
  let velocity = [0, 0, 0];
  let pivot;
  const apply = ({ input }) => {
    const sample = record(input);
    if (sample === void 0) return;
    if (sample.type === "move") {
      velocity = finiteVector3(sample.velocity) ?? [0, 0, 0];
      return;
    }
    if (!["look", "orbit", "pan", "dolly"].includes(String(sample.type)))
      throw new TypeError("Workspace camera input requires a semantic motion");
    const state = record(observation.camera.get());
    const transform = record(state?.transform);
    const entity = state?.entity;
    const quaternion = transform?.quat;
    const quaternionValues = Array.isArray(quaternion) ? quaternion : ArrayBuffer.isView(quaternion) && "length" in quaternion && typeof quaternion.length === "number" ? quaternion : void 0;
    if (!Number.isSafeInteger(entity) || quaternionValues === void 0 || quaternionValues.length < 4) {
      return;
    }
    const position = finiteVector3(transform?.pos);
    if (!position) return;
    const dx = finiteInputNumber(sample.x);
    const dy = finiteInputNumber(sample.y);
    const forward = rotateWorkspaceVector(quaternionValues, [0, 0, -1]);
    const origin = pivot ?? position.map(
      (v, i) => v + (forward[i] ?? 0) * Math.max(0.01, finiteInputNumber(sample.distance))
    );
    const distance = Math.max(0.01, Math.hypot(...position.map((v, i) => v - (origin[i] ?? 0))));
    if (sample.type === "pan") {
      const right = rotateWorkspaceVector(quaternionValues, [1, 0, 0]);
      const up = rotateWorkspaceVector(quaternionValues, [0, 1, 0]);
      pivot = origin.map((v, i) => v + (dx * (right[i] ?? 0) + dy * (up[i] ?? 0)) * distance);
      observation.camera.set({
        entity,
        transform: {
          ...transform,
          pos: position.map((v, i) => v + (dx * (right[i] ?? 0) + dy * (up[i] ?? 0)) * distance)
        }
      });
      return;
    }
    if (sample.type === "dolly") {
      const delta = finiteInputNumber(sample.amount);
      const lens = record(state?.lens);
      if (lens?.projection === "orthographic") {
        const scale = Math.exp(delta);
        observation.camera.set({
          entity,
          lens: {
            left: Number(lens.left) * scale,
            right: Number(lens.right) * scale,
            top: Number(lens.top) * scale,
            bottom: Number(lens.bottom) * scale
          }
        });
      } else {
        observation.camera.set({
          entity,
          transform: {
            ...transform,
            pos: position.map((v, i) => v - (forward[i] ?? 0) * delta * distance)
          }
        });
      }
      return;
    }
    const yaw = finiteInputNumber(sample.yaw);
    const pitch = finiteInputNumber(sample.pitch);
    let orientation = quat.rotateAxis(
      quat.create(),
      quaternionValues,
      [0, 1, 0],
      yaw
    );
    quat.rotateAxis(orientation, orientation, [1, 0, 0], pitch);
    if (typeof sample.pitchLimit === "number" && Number.isFinite(sample.pitchLimit)) {
      const limit = Math.max(0, Math.min(Math.PI / 2, sample.pitchLimit));
      orientation = quat.fromEuler(
        quat.create(),
        Math.max(-limit, Math.min(limit, Math.asin(Math.max(-1, Math.min(1, forward[1]))) + pitch)),
        Math.atan2(-forward[0], -forward[2]) + yaw,
        0,
        "YXZ"
      );
    }
    observation.camera.set({
      entity,
      transform: {
        ...transform,
        quat: Array.from(orientation),
        ...sample.type === "orbit" ? {
          pos: origin.map(
            (v, i) => v - (rotateWorkspaceVector(orientation, [0, 0, -1])[i] ?? 0) * distance
          )
        } : {}
      }
    });
  };
  const tick = () => {
    const deltaSeconds = Math.min(0.05, world.getResource(Time).delta);
    if (!isActive() || velocity.every((value) => value === 0) || deltaSeconds === 0) return;
    const state = record(observation.camera.get());
    const transform = record(state?.transform);
    const entity = state?.entity;
    const position = finiteVector3(transform?.pos);
    if (!Number.isSafeInteger(entity) || position === void 0) return;
    const quaternion = transform?.quat;
    const quaternionValues = Array.isArray(quaternion) ? quaternion : ArrayBuffer.isView(quaternion) && "length" in quaternion && typeof quaternion.length === "number" ? quaternion : void 0;
    const forward = quaternionValues !== void 0 && quaternionValues.length >= 4 ? rotateWorkspaceVector(quaternionValues, [0, 0, -1]) : [0, 0, -1];
    const right = quaternionValues !== void 0 && quaternionValues.length >= 4 ? rotateWorkspaceVector(quaternionValues, [1, 0, 0]) : [1, 0, 0];
    const direction = right.map(
      (v, i) => v * velocity[0] + (i === 1 ? velocity[1] : 0) - (forward[i] ?? 0) * velocity[2]
    );
    observation.camera.set({
      entity,
      transform: {
        ...transform,
        pos: [
          position[0] + (direction[0] ?? 0) * deltaSeconds,
          position[1] + (direction[1] ?? 0) * deltaSeconds,
          position[2] + (direction[2] ?? 0) * deltaSeconds
        ]
      }
    });
  };
  world.addSystem(Update, { name: systemName, queries: [], fn: tick }).unwrap();
  return {
    apply,
    get pivot() {
      return pivot;
    },
    setPivot(value) {
      pivot = finiteVector3(value);
    },
    reset() {
      velocity = [0, 0, 0];
    },
    dispose() {
      world.removeSystem(Update, systemName);
      velocity = [0, 0, 0];
    }
  };
}
function createEngineWorkspaceRuntime(provider) {
  if (!provider || typeof provider.openProject !== "function") {
    throw new TypeError("Engine workspace provider requires openProject");
  }
  if (typeof provider.closeProject !== "function" || typeof provider.listAssets !== "function") {
    throw new TypeError("Engine workspace provider requires closeProject and listAssets");
  }
  if (typeof provider.openPreview !== "function") {
    throw new TypeError("Engine workspace provider requires openPreview");
  }
  const state = { previews: /* @__PURE__ */ new Map(), generation: 0, disposed: false };
  let previewGeneration = 0;
  let mutation = Promise.resolve();
  const enqueue = (operation) => {
    const next = mutation.then(operation, operation);
    mutation = next.then(
      () => void 0,
      () => void 0
    );
    return next;
  };
  const closePreview = async (preview) => {
    if (state.previews.get(preview.target.targetId) !== preview) return;
    state.previews.delete(preview.target.targetId);
    await preview.close?.({ targetId: preview.target.targetId });
  };
  const closePreviews = async () => {
    for (const preview of [...state.previews.values()]) await closePreview(preview).catch(() => {
    });
  };
  const closeUnadoptedPreview = async (preview) => {
    const current = state.previews.get(preview.target.targetId);
    if (current === preview) await closePreview(preview);
    else if (!current) await preview.close?.({ targetId: preview.target.targetId });
  };
  const stopPlay = async (play) => {
    if (state.play !== play) return;
    state.play = void 0;
    await play.close?.({ targetId: play.target.targetId });
  };
  const startPlay = provider.startPlay?.bind(provider);
  const runtime = {
    apiVersion: ENGINE_WORKSPACE_API_VERSION,
    ...provider.inspectAsset === void 0 ? {} : { inspectAsset: provider.inspectAsset.bind(provider) },
    ...provider.rebuildAssetSource === void 0 ? {} : { rebuildAssetSource: provider.rebuildAssetSource.bind(provider) },
    get project() {
      return state.project;
    },
    get preview() {
      return [...state.previews.values()].at(-1);
    },
    get previews() {
      return [...state.previews.values()];
    },
    get play() {
      return state.play;
    },
    stopPlay,
    ...startPlay ? {
      startPlay: (input) => enqueue(async () => {
        abortError(input.signal);
        if (state.disposed || !state.project || input.handle !== state.project.handle)
          throw new EngineWorkspaceError(
            "engine-workspace-project-stale",
            "The current project session"
          );
        if (state.play)
          throw new EngineWorkspaceError(
            "engine-workspace-target-busy",
            "Stop the current Play before starting another"
          );
        const opened = await startPlay(input);
        try {
          abortError(input.signal);
          if (state.disposed) throw new Error("engine workspace is disposed");
          const play = {
            ...opened,
            get phase() {
              return opened.phase;
            },
            get target() {
              return { ...opened.target, generation: 1 };
            }
          };
          state.play = play;
          return play;
        } catch (error) {
          await opened.close?.();
          throw error;
        }
      })
    } : {},
    async openProject(input) {
      abortError(input.signal);
      if (state.disposed) throw new Error("engine workspace is disposed");
      if (input.expectedTargetState !== void 0 && (input.expectedTargetState !== "lost" || typeof input.expectedTargetId !== "string" || !input.expectedTargetId.trim()))
        throw new TypeError("Expected lost state requires an exact target identity");
      let generation = input.expectedTargetId === void 0 ? ++state.generation : state.generation;
      return enqueue(async () => {
        abortError(input.signal);
        if (input.expectedTargetId !== void 0) {
          if ((state.project?.target?.targetId ?? null) !== input.expectedTargetId)
            throw new EngineWorkspaceError(
              "engine-workspace-target-mismatch",
              "The expected project target must still be current",
              "Another page changed the project. Refresh state and choose explicitly."
            );
          if (input.expectedTargetState === "lost" && record(state.project?.failure)?.code !== "engine-workspace-page-lost")
            throw new EngineWorkspaceError(
              "engine-workspace-target-busy",
              "Replacement requires the identified target to be lost",
              "The current target is not known to be lost."
            );
          generation = ++state.generation;
        }
        if (state.play) await stopPlay(state.play);
        let opened;
        try {
          opened = await provider.openProject({
            root: input.root,
            ...input.signal ? { signal: input.signal } : {}
          });
          abortError(input.signal);
        } catch (error) {
          if (opened !== void 0 && (input.signal?.aborted || generation !== state.generation || state.disposed)) {
            await Promise.resolve(provider.closeProject(opened)).catch(() => {
            });
          }
          throw error;
        }
        if (generation !== state.generation || state.disposed) {
          await Promise.resolve(provider.closeProject(opened)).catch(() => {
          });
          throw new Error("engine workspace project open became stale");
        }
        await closePreviews();
        if (state.project !== void 0) {
          const oldProject = state.project;
          state.project = void 0;
          await Promise.resolve(provider.closeProject(oldProject)).catch(() => {
          });
        }
        state.project = opened;
        return opened;
      });
    },
    async closeProject(input) {
      if (state.project !== void 0 && input.project.id !== state.project.project.id) {
        throw new Error("engine workspace close targets a different project");
      }
      if (input.handle !== void 0 && state.project?.handle !== input.handle) {
        throw new EngineWorkspaceError(
          "engine-workspace-project-stale",
          "the active project handle",
          "Discard the stale project handle and refresh the workspace identity."
        );
      }
      ++state.generation;
      await enqueue(async () => {
        if (state.play) await stopPlay(state.play);
        await closePreviews();
        if (state.project !== void 0) {
          const project = state.project;
          state.project = void 0;
          await Promise.resolve(provider.closeProject(project)).catch(() => {
          });
        }
      });
    },
    async listAssets(input) {
      if (state.disposed) throw new Error("engine workspace is disposed");
      const project = state.project?.project ?? input.project;
      if (state.project !== void 0 && state.project.project.id !== input.project.id) {
        throw new Error("engine workspace asset request targets a different project");
      }
      const result = await provider.listAssets({
        ...input,
        project,
        handle: state.project?.handle ?? input.handle
      });
      return [...result];
    },
    async openPreview(input) {
      abortError(input.signal);
      if (state.disposed) throw new Error("engine workspace is disposed");
      if (state.project !== void 0 && state.project.project.id !== input.project.id) {
        throw new Error("engine workspace preview targets a different project");
      }
      const epoch = state.generation;
      return enqueue(async () => {
        abortError(input.signal);
        if (epoch !== state.generation || state.disposed)
          throw new Error("engine workspace preview open became stale");
        const opened = normalizePreview(
          await provider.openPreview({
            ...input,
            projectHandle: state.project?.handle ?? input.projectHandle
          })
        );
        const generation = ++previewGeneration;
        const preview = {
          ...opened,
          get target() {
            return { ...opened.target, generation };
          }
        };
        if (input.signal?.aborted || epoch !== state.generation || state.disposed) {
          await closeUnadoptedPreview(preview).catch(() => {
          });
          abortError(input.signal);
          throw new Error("engine workspace preview open became stale");
        }
        const replaced = state.previews.get(preview.target.targetId);
        if (replaced) await closePreview(replaced);
        state.previews.set(preview.target.targetId, preview);
        return preview;
      });
    },
    closePreview,
    async dispose() {
      if (state.disposed) return;
      state.disposed = true;
      ++state.generation;
      await enqueue(async () => {
        if (state.play) await stopPlay(state.play);
        await closePreviews();
        if (state.project !== void 0) {
          const project = state.project;
          state.project = void 0;
          await Promise.resolve(provider.closeProject(project)).catch(() => {
          });
        }
      });
      await Promise.resolve(provider.dispose?.()).catch(() => {
      });
    }
  };
  return runtime;
}
async function createEngineWorkspaceAppPreview(input) {
  assertTarget(input.target);
  if (!input.app.observation)
    throw new Error("Engine App observation is required for a workspace preview");
  let loadedScene;
  let sceneRoot;
  let fallbackCamera;
  let resourceOwner;
  if (input.asset.kind === "scene") {
    const loaded = await input.assets.loadByGuid(
      input.assets.parseGuid(input.asset.guid)
    );
    if (!loaded.ok) throw loaded.error;
    const handle = input.app.world.allocSharedRef("SceneAsset", loaded.value);
    const instantiated = input.assets.instantiate(handle, input.app.world);
    if (!instantiated.ok) {
      input.app.world.sharedRefs.release(handle);
      throw instantiated.error;
    }
    input.app.world.sharedRefs.release(handle);
    loadedScene = loaded.value;
    sceneRoot = instantiated.value;
    const fallback = ensureFallbackCamera(
      input.app.world,
      input.target.width / Math.max(1, input.target.height)
    );
    if (fallback !== void 0) {
      if (!fallback.ok) {
        const despawned = worldDespawnScene(input.app.world, sceneRoot);
        if (!despawned.ok) throw despawned.error;
        throw fallback.error;
      }
      fallbackCamera = fallback.value;
    }
  } else {
    if (input.openResourcePreview === void 0) {
      throw new Error(
        `Engine App workspace preview does not support asset kind ${input.asset.kind}; provide the Engine type-preview capability on the project session`
      );
    }
    resourceOwner = await input.openResourcePreview({
      app: input.app,
      assets: input.assets,
      asset: input.asset,
      ...input.project === void 0 ? {} : { project: input.project },
      target: input.target
    });
    if (resourceOwner === null || typeof resourceOwner !== "object") {
      throw new TypeError("Engine workspace type-preview owner must return a resource owner");
    }
  }
  const target = createEngineWorkspaceAppTarget({
    ...input,
    async close(value) {
      let failure;
      try {
        if (sceneRoot !== void 0) worldDespawnScene(input.app.world, sceneRoot).unwrap();
      } catch (error) {
        failure = error;
      }
      try {
        if (fallbackCamera !== void 0) input.app.world.despawn(fallbackCamera).unwrap();
      } catch (error) {
        failure ??= error;
      }
      try {
        await resourceOwner?.close?.();
      } catch (error) {
        failure ??= error;
      }
      try {
        await input.close?.(value);
      } catch (error) {
        failure ??= error;
      }
      if (failure !== void 0) throw failure;
    }
  });
  return {
    ...target,
    get target() {
      return target.target;
    },
    asset: input.asset,
    ...loadedScene === void 0 ? {} : { scene: loadedScene },
    handle: {
      app: input.app,
      world: input.app.world,
      ...sceneRoot === void 0 ? {} : { sceneRoot }
    }
  };
}
function createEngineWorkspaceAppTarget(input) {
  assertTarget(input.target);
  if (!input.app.observation)
    throw new Error("Engine App observation is required for a workspace target");
  let version = 0;
  let currentTarget = input.target;
  let active;
  const committedOperations = /* @__PURE__ */ new Map();
  const observation = input.app.observation;
  let closed = false;
  const defaultInput = input.applyInput === void 0 ? createDefaultWorkspaceCameraInputController(
    observation,
    () => !closed && active !== void 0,
    input.app.world,
    `workspace-camera:${input.target.targetId}`
  ) : void 0;
  let cleanupPromise;
  const assertOpen = () => {
    if (closed)
      throw new EngineWorkspaceError(
        "engine-workspace-preview-required",
        "Engine workspace preview is closed"
      );
  };
  const assertTargetInput = (value) => {
    assertOpen();
    if (value.targetId !== input.target.targetId) {
      throw new Error(
        `Engine workspace target mismatch: expected ${input.target.targetId}, received ${String(value.targetId)}`
      );
    }
  };
  const clientId = (value) => {
    if (typeof value.clientId !== "string" || value.clientId.trim() === "") {
      throw new TypeError("Engine workspace camera interaction requires clientId");
    }
    return value.clientId;
  };
  const ownsInteraction = (value) => active?.connectionId === void 0 ? value.connectionId === void 0 && active?.clientId === value.clientId : active.connectionId === value.connectionId;
  const cameraState = () => ({
    ...record(observation.camera.get()),
    ...defaultInput ? { pivot: defaultInput.pivot ?? null } : {}
  });
  const setCamera = (value) => {
    observation.camera.set(value);
    const patch = record(value);
    if (patch && "pivot" in patch) defaultInput?.setPivot(patch.pivot);
  };
  const camera = () => {
    assertOpen();
    return {
      camera: cameraState(),
      version,
      committed: active === void 0,
      interaction: active ? {
        interactionId: active.interactionId,
        clientId: active.clientId,
        baseVersion: active.baseVersion
      } : null
    };
  };
  const close = async (value = {}) => {
    if (value.targetId !== void 0 && value.targetId !== input.target.targetId) {
      throw new Error(
        `Engine workspace target mismatch: expected ${input.target.targetId}, received ${value.targetId}`
      );
    }
    if (cleanupPromise !== void 0) return cleanupPromise;
    closed = true;
    active = void 0;
    cleanupPromise = (async () => {
      let failure;
      try {
        defaultInput?.dispose();
      } catch (error) {
        failure = error;
      }
      try {
        observation.release?.();
      } catch (error) {
        failure ??= error;
      }
      try {
        await Promise.resolve(input.close?.({ targetId: input.target.targetId }));
      } catch (error) {
        failure ??= error;
      }
      if (failure !== void 0) throw failure;
    })();
    return cleanupPromise;
  };
  const resize = input.resize;
  const tools = input.tools;
  const control = tools?.control;
  const pick = tools?.pick;
  const highlight = tools?.highlight;
  const preview = {
    get target() {
      return currentTarget;
    },
    ...resize ? {
      async resize(value) {
        assertTargetInput(value);
        value.signal?.throwIfAborted();
        if (![value.width, value.height].every((size) => Number.isSafeInteger(size) && size > 0))
          throw new TypeError("Workspace resize requires positive integer output pixels");
        if (active)
          throw new EngineWorkspaceError(
            "engine-workspace-target-busy",
            "Finish the camera interaction before resizing"
          );
        await resize(value);
        assertOpen();
        currentTarget = { ...currentTarget, width: value.width, height: value.height };
        return currentTarget;
      }
    } : {},
    ...control ? {
      setControl(value) {
        assertTargetInput(value);
        if (active)
          throw new EngineWorkspaceError(
            "engine-workspace-target-busy",
            "Finish the camera interaction before changing control"
          );
        defaultInput?.reset();
        const result = control.set(value);
        version += 1;
        return result;
      }
    } : {},
    ...tools === void 0 ? {} : {
      tools: {
        ...pick ? {
          pick: (value) => {
            assertOpen();
            return pick(value);
          }
        } : {},
        ...highlight ? {
          highlight: (value) => {
            assertOpen();
            return highlight(value);
          }
        } : {},
        tree: (value) => {
          assertOpen();
          return tools.tree(value);
        },
        inspect: (value) => {
          assertOpen();
          return tools.inspect(value);
        },
        async focus(value) {
          assertOpen();
          if (active !== void 0)
            throw new EngineWorkspaceError(
              "engine-workspace-target-busy",
              "The camera interaction must finish before focus"
            );
          const result = await tools.focus(value);
          assertOpen();
          defaultInput?.setPivot(record(result)?.pivot);
          version += 1;
          return result;
        }
      }
    },
    ...input.presentation === void 0 ? {} : { presentation: input.presentation },
    // Public operations live on `preview`; this is only the opaque resource
    // bundle a host may retain for diagnostics or renderer integration.
    handle: {
      app: input.app,
      world: input.app.world
    },
    ...input.capture === void 0 ? {} : {
      capture: async (value) => {
        assertTargetInput(value);
        if (active !== void 0)
          throw new EngineWorkspaceError(
            "engine-workspace-target-busy",
            "Engine workspace preview capture is busy"
          );
        return input.capture?.(value);
      }
    },
    close,
    getCamera(value) {
      assertTargetInput(value);
      return camera();
    },
    async beginCameraInteraction(value) {
      assertTargetInput(value);
      abortError(value.signal);
      if (tools?.control?.mode() === "player")
        throw new EngineWorkspaceError(
          "engine-workspace-control-required",
          "Eject before controlling the game camera"
        );
      const id = clientId(value);
      if (active !== void 0)
        throw new EngineWorkspaceError(
          "engine-workspace-target-busy",
          "Engine workspace camera interaction is busy"
        );
      if (value.baseVersion !== void 0 && value.baseVersion !== version) {
        throw new EngineWorkspaceError(
          "engine-workspace-camera-conflict",
          "Engine workspace camera version conflict"
        );
      }
      const interactionId = value.interactionId;
      if (typeof interactionId !== "string" || interactionId.trim() === "") {
        throw new TypeError("Engine workspace camera interaction requires interactionId");
      }
      const nextInteraction = {
        interactionId,
        baseVersion: version,
        camera: cameraState(),
        clientId: id,
        ...value.connectionId === void 0 ? {} : { connectionId: value.connectionId }
      };
      active = nextInteraction;
      return { ...camera(), interactionId };
    },
    async updateCameraDraft(value) {
      assertTargetInput(value);
      abortError(value.signal);
      clientId(value);
      const interaction = active;
      if (interaction === void 0 || interaction.interactionId !== value.interactionId) {
        throw new EngineWorkspaceError(
          "engine-workspace-camera-interaction-missing",
          "Engine workspace camera interaction is missing"
        );
      }
      if (!ownsInteraction(value))
        throw new EngineWorkspaceError(
          "engine-workspace-unauthorized",
          "Engine workspace camera interaction owner mismatch"
        );
      if (value.camera !== void 0) setCamera(value.camera);
      else if (value.input !== void 0) {
        const applyInput = input.applyInput ?? defaultInput?.apply;
        if (applyInput === void 0) {
          throw new Error("Engine workspace preview does not provide camera input");
        }
        await applyInput({
          ...value,
          world: input.app.world,
          app: input.app
        });
      }
      return camera();
    },
    async commitCamera(value) {
      assertTargetInput(value);
      abortError(value.signal);
      const id = clientId(value);
      if (typeof value.operationId !== "string" || value.operationId.trim() === "") {
        throw new TypeError("Engine workspace camera commit requires operationId");
      }
      const expectedVersion = value.expectedVersion;
      if (typeof expectedVersion !== "number" || !Number.isSafeInteger(expectedVersion) || expectedVersion < 0) {
        throw new TypeError("Engine workspace camera commit requires expectedVersion");
      }
      const operationKey = JSON.stringify([
        value.connectionId ?? null,
        id,
        input.target.targetId,
        value.operationId
      ]);
      const fingerprint = JSON.stringify({
        targetId: input.target.targetId,
        interactionId: value.interactionId,
        expectedVersion,
        camera: value.camera
      });
      const previous = committedOperations.get(operationKey);
      if (previous !== void 0) {
        if (previous.fingerprint !== fingerprint) {
          throw new EngineWorkspaceError(
            "engine-workspace-operation-conflict",
            "Engine workspace camera operation payload conflict"
          );
        }
        return structuredClone(previous.result);
      }
      const interaction = active;
      if (interaction === void 0 || interaction.interactionId !== value.interactionId) {
        throw new EngineWorkspaceError(
          "engine-workspace-camera-interaction-missing",
          "Engine workspace camera interaction is missing"
        );
      }
      if (!ownsInteraction(value))
        throw new EngineWorkspaceError(
          "engine-workspace-unauthorized",
          "Engine workspace camera interaction owner mismatch"
        );
      if (expectedVersion !== version)
        throw new EngineWorkspaceError(
          "engine-workspace-camera-conflict",
          "Engine workspace camera version conflict"
        );
      if (value.camera !== void 0) setCamera(value.camera);
      version += 1;
      defaultInput?.reset();
      active = void 0;
      const result = { ...camera(), operationId: value.operationId, committed: true };
      committedOperations.set(operationKey, { fingerprint, result: structuredClone(result) });
      return result;
    },
    async abortCameraInteraction(value) {
      assertTargetInput(value);
      clientId(value);
      const interaction = active;
      if (interaction === void 0 || interaction.interactionId !== value.interactionId)
        return camera();
      if (!ownsInteraction(value))
        throw new EngineWorkspaceError(
          "engine-workspace-unauthorized",
          "Engine workspace camera interaction owner mismatch"
        );
      setCamera(interaction.camera);
      defaultInput?.reset();
      active = void 0;
      return camera();
    },
    async revokeConnection(value) {
      assertTargetInput(value);
      const interaction = active;
      if (interaction?.connectionId === value.connectionId)
        await preview.abortCameraInteraction?.({
          targetId: input.target.targetId,
          interactionId: interaction.interactionId,
          clientId: interaction.clientId,
          connectionId: value.connectionId,
          reason: "client-disconnected"
        });
      tools?.control?.revoke(value.connectionId);
      return camera();
    }
  };
  return preview;
}
function engineWorkspacePlugin(runtime) {
  if (!runtime || runtime.apiVersion !== ENGINE_WORKSPACE_API_VERSION) {
    throw new TypeError("engine workspace plugin requires a matching runtime");
  }
  return {
    name: ENGINE_WORKSPACE_PLUGIN_ID,
    provide: ["engineWorkspace"],
    apply(ctx) {
      ctx.provide("engineWorkspace", runtime);
      ctx.effect(() => async () => runtime.dispose(), "engine/workspace");
    }
  };
}
function projectEngineWorkspaceAssets(entries) {
  return entries.map((entry) => ({
    guid: String(entry.guid),
    kind: String(entry.kind),
    ...entry.name === void 0 ? {} : { name: String(entry.name) },
    path: String(entry.sourcePath),
    previewable: ENGINE_WORKSPACE_PREVIEWABLE_KINDS.includes(
      String(entry.kind)
    )
  }));
}
function projectValue(value, depth = 0) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "bigint") return String(value);
  if (depth >= 4) return { unavailable: "depth-limit" };
  if (Array.isArray(value) || ArrayBuffer.isView(value) && !(value instanceof DataView)) {
    const array = value;
    const items = Array.from(
      { length: Math.min(array.length, 128) },
      (_, i) => projectValue(array[i], depth + 1)
    );
    return array.length > 128 ? { items, truncated: true, length: array.length } : items;
  }
  if (typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const entries = Object.entries(value);
    const fields = Object.fromEntries(
      entries.slice(0, 128).map(([key, entry]) => [key, projectValue(entry, depth + 1)])
    );
    return entries.length > 128 ? { fields, truncated: true, length: entries.length } : fields;
  }
  return { unavailable: "opaque-value" };
}
function observationEntity(world, entityId, targetId) {
  const prefix = `${targetId}:${world.identity}:`;
  if (typeof entityId !== "string" || !entityId.startsWith(prefix)) {
    throw new EngineWorkspaceError(
      "engine-workspace-reference-world-mismatch",
      "The entity reference belongs to another World",
      "Refresh the target entity reference."
    );
  }
  const entity = Number(entityId.slice(prefix.length));
  if (!Number.isSafeInteger(entity) || entity < 0 || String(entity) !== entityId.slice(prefix.length)) {
    throw new EngineWorkspaceError(
      "engine-workspace-reference-invalid",
      "The entity reference is invalid",
      "Use a reference returned by the Engine target tools."
    );
  }
  if (!world.componentsOf(entity).ok)
    throw new EngineWorkspaceError(
      "engine-workspace-reference-stale",
      "The entity reference is stale",
      "Refresh the entity tree before inspecting again."
    );
  return entity;
}
function createObservationInspection(world, targetId) {
  const identity = (entity) => {
    const name = world.get(entity, Name);
    return {
      entity,
      entityId: `${targetId}:${world.identity}:${entity}`,
      name: name.ok ? name.value.value : null
    };
  };
  return {
    tree({
      offset = 0,
      limit = 500,
      revision
    } = {}) {
      if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(limit) || limit < 1 || limit > 1e3) {
        throw new EngineWorkspaceError(
          "engine-workspace-page-invalid",
          "Offset must be nonnegative and limit between 1 and 1000"
        );
      }
      const currentRevision = world.getStructureEpoch();
      if ((offset > 0 || revision !== void 0) && revision !== currentRevision)
        throw new EngineWorkspaceError(
          "engine-workspace-tree-changed",
          "The entity tree changed between pages",
          "Restart from the first page and carry its revision."
        );
      const nodes = [];
      let index = 0;
      let nextOffset = null;
      pages: for (const query of [
        world.query({}).unwrap(),
        world.query({ with: [Disabled] }).unwrap()
      ])
        for (const row of query) {
          if (index++ < offset) continue;
          if (nodes.length === limit) {
            nextOffset = offset + limit;
            break pages;
          }
          const entity = row.entity;
          const parent = world.get(entity, ChildOf);
          nodes.push({
            ...identity(entity),
            componentNames: world.componentsOf(entity).unwrap().map((component) => component.name),
            parentId: parent.ok && parent.value.parent !== null ? `${targetId}:${world.identity}:${parent.value.parent}` : null
          });
        }
      return {
        targetId,
        worldId: world.identity,
        revision: currentRevision,
        sampledAt: Date.now(),
        nodes,
        nextOffset
      };
    },
    inspect({ entityId }) {
      const entity = observationEntity(world, entityId, targetId);
      const components = world.componentsOf(entity).unwrap();
      return {
        ...identity(entity),
        targetId,
        worldId: world.identity,
        sampledAt: Date.now(),
        components: components.flatMap((component) => {
          const value = world.get(entity, component).unwrap();
          return projectComponentIntrospection(/* @__PURE__ */ new Map([[component.name, component]])).map(
            (descriptor) => ({ ...descriptor, values: projectValue(value), writable: false })
          );
        })
      };
    }
  };
}

// src/workspace-target-tools.ts
var engineWorkspaceTargetToolsPlugin = {
  name: "forgeax:workspace-target-tools",
  inject: ["world"],
  provide: ["engineWorkspaceTargetTools"],
  apply(ctx, options) {
    if (!options?.targetId?.trim()) throw new TypeError("Target tools require a target identity");
    const display = options.display;
    const boundary = options.input;
    const inspection = createObservationInspection(ctx.world, options.targetId);
    let highlight;
    const highlightSystem = `workspace-highlight:${ctx.fiber.uid}`;
    let drawing = false;
    let available = true;
    let ownsObservation = false;
    let controlOwner;
    const release = () => {
      if (ownsObservation) options.observation?.release();
      ownsObservation = false;
      controlOwner = void 0;
      options.input?.grantGame();
    };
    ctx.effect(() => () => {
      available = false;
      release();
      if (drawing) ctx.world.removeSystem(Update, highlightSystem);
    });
    const assertAvailable = () => {
      if (!available)
        throw new EngineWorkspaceError(
          "engine-workspace-capability-unavailable",
          "The target tools plugin is unavailable",
          "Enable the Engine target tools plugin on this target and refresh its capabilities."
        );
    };
    ctx.provide("engineWorkspaceTargetTools", {
      ...display ? {
        pick({ x, y }) {
          assertAvailable();
          const canvas = display.canvas;
          const frame = readBrowserFrameSubmitted(canvas);
          const reason = !frame ? "missing-frame" : frame.worldIdentity !== ctx.world.identity ? "world-mismatch" : !frame.barrelDistortion?.camera ? "missing-mapping" : frame.barrelDistortion.width !== canvas.width || frame.barrelDistortion.height !== canvas.height ? "extent-mismatch" : void 0;
          if (reason || !frame?.barrelDistortion?.camera)
            throw new EngineWorkspaceError(
              "engine-workspace-frame-unavailable",
              "A current submitted display frame from this World",
              "Wait for the current surface to submit a frame before picking.",
              {
                reason,
                worldIdentity: ctx.world.identity,
                frameWorldIdentity: frame?.worldIdentity,
                frameId: frame?.frameId,
                deviceGeneration: frame?.deviceGeneration
              }
            );
          const hit = pickDisplay(
            ctx.world,
            x,
            y,
            frame.barrelDistortion,
            canvas.width,
            canvas.height
          );
          return {
            targetId: options.targetId,
            frameId: frame.frameId,
            entityId: hit ? `${options.targetId}:${ctx.world.identity}:${hit.entity}` : null,
            granularity: "bounds"
          };
        },
        highlight(input) {
          assertAvailable();
          highlight = input.entityId === void 0 ? void 0 : observationEntity(ctx.world, input.entityId, options.targetId);
          if (!drawing && highlight !== void 0) {
            const app = display.app;
            if (!app.debugDraw)
              throw new EngineWorkspaceError(
                "engine-workspace-capability-unavailable",
                "Debug drawing on the target"
              );
            ctx.world.addSystem(Update, {
              name: highlightSystem,
              queries: [],
              fn() {
                if (highlight === void 0) return;
                if (!ctx.world.componentsOf(highlight).ok) {
                  highlight = void 0;
                  return;
                }
                const bounds = app.renderer.bounds(ctx.world, highlight);
                if (bounds)
                  app.debugDraw?.aabb(
                    vec3.create(...bounds.min),
                    vec3.create(...bounds.max),
                    [1, 0.65, 0, 1]
                  );
              }
            }).unwrap();
            drawing = true;
          }
          return { entityId: input.entityId ?? null };
        }
      } : {},
      ...boundary ? {
        control: {
          mode: () => boundary.owner() === "game" ? "player" : "observer",
          set(input) {
            assertAvailable();
            if (ownsObservation && controlOwner !== input.connectionId)
              throw new EngineWorkspaceError(
                "engine-workspace-target-busy",
                "The current observation control owner"
              );
            if (input.mode === "player") release();
            else {
              if (!options.observation)
                throw new EngineWorkspaceError(
                  "engine-workspace-capability-unavailable",
                  "App observation"
                );
              options.observation.camera.set({});
              ownsObservation = true;
              controlOwner = input.connectionId;
              boundary.revokeGame();
            }
            return { mode: input.mode, camera: options.observation?.camera.get() };
          },
          revoke(connectionId) {
            if (controlOwner === connectionId) release();
          }
        }
      } : {},
      tree(input) {
        assertAvailable();
        return inspection.tree(input);
      },
      focus(input) {
        assertAvailable();
        if (options.input?.owner() === "game")
          throw new EngineWorkspaceError(
            "engine-workspace-control-required",
            "Eject before controlling the game camera"
          );
        const entity = observationEntity(ctx.world, input.entityId, options.targetId);
        if (!options.observation)
          throw new EngineWorkspaceError(
            "engine-workspace-capability-unavailable",
            "Observation is unavailable on this target"
          );
        const result = options.observation.focus({ entity });
        ownsObservation = true;
        return result;
      },
      inspect(input) {
        assertAvailable();
        return inspection.inspect(input);
      }
    });
  }
};

// src/load-game-errors.ts
var LoadGameErrorClass = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    super(`[LoadGameError ${args.code}] expected: ${args.expected}; hint: ${args.hint}`);
    this.name = "LoadGameError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    this.detail = args.detail;
  }
};
var LoadGameError = LoadGameErrorClass;
var loadGameErrorPolicy = {
  "module-not-found": {
    expected: "resolver should return a module with a native Cordis default export for the given slug",
    hint: "verify the game slug matches an existing template directory; check the resolver import path for typos"
  },
  "invalid-format": {
    expected: "resolved module must default-export a Cordis function, class, or object plugin",
    hint: "default-export one plugin and let the Host mount it into App.pluginContext"
  },
  "import-failed": {
    expected: "resolver should complete without throwing; import path, network, and build errors are forwarded here",
    hint: "inspect detail.cause for the original error (network failure, build error, dynamic import timeout, etc.)"
  }
};
var LOAD_GAME_EXPECTED = Object.fromEntries(
  Object.entries(loadGameErrorPolicy).map(([code, policy]) => [code, policy.expected])
);
var LOAD_GAME_ERROR_HINTS = Object.fromEntries(
  Object.entries(loadGameErrorPolicy).map(([code, policy]) => [code, policy.hint])
);
function isLoadGameError(err19) {
  return err19 instanceof LoadGameErrorClass;
}
function isPlugin(value) {
  return typeof value === "function" || typeof value === "object" && value !== null && "apply" in value && typeof value.apply === "function";
}
async function loadGame(slug, resolver) {
  let module;
  try {
    module = await resolver(slug);
  } catch (thrown) {
    if (thrown instanceof Error && thrown.message.includes(slug)) {
      return err(
        new LoadGameError({
          code: "module-not-found",
          expected: LOAD_GAME_EXPECTED["module-not-found"],
          hint: LOAD_GAME_ERROR_HINTS["module-not-found"],
          detail: { slug }
        })
      );
    }
    return err(
      new LoadGameError({
        code: "import-failed",
        expected: LOAD_GAME_EXPECTED["import-failed"],
        hint: LOAD_GAME_ERROR_HINTS["import-failed"],
        detail: { cause: thrown }
      })
    );
  }
  if (!isPlugin(module.default)) {
    const exportKeys = Object.keys(module);
    return err(
      new LoadGameError({
        code: "invalid-format",
        expected: LOAD_GAME_EXPECTED["invalid-format"],
        hint: LOAD_GAME_ERROR_HINTS["invalid-format"],
        detail: { exportKeys }
      })
    );
  }
  return ok(module.default);
}
function hasWebGpu() {
  const nav = globalThis.navigator;
  return nav?.gpu !== void 0;
}
async function loadBackend() {
  const backend = hasWebGpu() ? rhiWebgpu : await import('../../rhi-wgpu/dist/index.mjs');
  if (!hasWebGpu()) await backend.ensureReady?.();
  return backend;
}
async function createBrowserRhiDebugRuntime() {
  const backend = await loadBackend();
  const attached = attachRecorder(backend);
  if (!attached.ok) throw new Error(attached.error.hint);
  const attachment = attached.value;
  return {
    rhi: attachment.backend.rhi,
    attachment,
    createShaderModule: backend.createShaderModule,
    rhiInstrumentation: createRhiInstrumentation(attachment),
    createReplayDevice: async (tape) => {
      const adapter = await backend.rhi.requestAdapter();
      if (!adapter.ok) return adapter;
      return adapter.value.requestDevice(
        replayDeviceRequest(tape, adapter.value.features, adapter.value.limits)
      );
    },
    attachRenderer(_renderer) {
      return () => {
      };
    }
  };
}
function createToolPreviewRecipe(options) {
  if (options.backend !== void 0 && options.backend !== "webgpu") {
    throw new TypeError("tool preview requires the real WebGPU backend");
  }
  const viewport = options.viewport ?? { width: 640, height: 360 };
  if (!Number.isSafeInteger(viewport.width) || !Number.isSafeInteger(viewport.height) || viewport.width <= 0 || viewport.height <= 0) {
    throw new TypeError("tool preview viewport must contain positive safe integers");
  }
  const deltaSeconds = options.deltaSeconds ?? 1 / 60;
  const frames = options.frames ?? 1;
  if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) {
    throw new TypeError("tool preview deltaSeconds must be finite and non-negative");
  }
  if (!Number.isSafeInteger(frames) || frames <= 0) {
    throw new TypeError("tool preview frames must be a positive safe integer");
  }
  const actions = (options.actions ?? []).map((action) => ({ ...action }));
  for (const action of actions) {
    if (!Number.isSafeInteger(action.frame) || action.frame < 0 || action.frame >= frames || action.name.length === 0 || action.value !== void 0 && !isSerializableValue(action.value)) {
      throw new TypeError("tool preview actions require a valid frame, name, and JSON value");
    }
  }
  return {
    backend: "webgpu",
    presentation: options.presentation ?? "hidden",
    viewport: { width: viewport.width, height: viewport.height },
    actions,
    deltaSeconds,
    frames
  };
}
var REQUIRED_EVENTS = [
  "canvas-created",
  "rhi-debug-armed",
  "renderer-created",
  "world-updated",
  "draw-submitted",
  "validation-complete"
];
function validateToolPreviewTrace(trace) {
  if (trace.backend !== "webgpu") {
    return {
      ok: false,
      error: {
        code: "tool-preview-invalid-trace",
        expected: 'trace.backend === "webgpu"',
        hint: "run the same recipe with a real WebGPU adapter; RHI-null is not a preview backend",
        detail: { missing: "webgpu-backend", index: -1 }
      }
    };
  }
  let last = -1;
  for (const event of REQUIRED_EVENTS) {
    const index = trace.events.indexOf(event);
    if (index <= last) {
      return {
        ok: false,
        error: {
          code: "tool-preview-invalid-trace",
          expected: `event '${event}' occurs after the previous recipe phase`,
          hint: "arm RHI-debug before Renderer construction and retain update/draw/validation evidence",
          detail: { missing: event, index }
        }
      };
    }
    last = index;
  }
  return { ok: true, value: trace };
}

// src/tool-preview/bootstrap.ts
function layoutCanvas(canvas, recipe) {
  canvas.width = recipe.viewport.width;
  canvas.height = recipe.viewport.height;
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = `${recipe.viewport.width}px`;
  canvas.style.height = `${recipe.viewport.height}px`;
  canvas.style.opacity = "1";
  canvas.style.visibility = "visible";
  canvas.style.pointerEvents = "auto";
}
function appendCanvas(canvas, root) {
  if (canvas.isConnected) return;
  const parent = typeof Document !== "undefined" && root instanceof Document ? root.body : root ?? (typeof document === "undefined" ? void 0 : document.body);
  parent?.appendChild(canvas);
}
function removeOwnedCanvas(canvas, owned) {
  if (owned && canvas.isConnected) canvas.remove();
}
function bytesToDataUri(bytes, mediaType) {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 8192) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  }
  return `data:${mediaType};base64,${btoa(binary)}`;
}
async function sha256(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", new Uint8Array(bytes).buffer);
  return `sha256:${[...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}
function dataUriBytes(uri) {
  const encoded = uri.slice(uri.indexOf(",") + 1);
  const binary = atob(encoded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
function generateRunId() {
  return `preview-${crypto.randomUUID()}`;
}
function countDrawCalls(tape) {
  return buildTapeIndex(tape).works.filter((work) => isRenderDraw(work.kind)).length;
}
function lastRenderDrawIndex(tape) {
  const works = buildTapeIndex(tape).works;
  return works.reduce((last, work) => isRenderDraw(work.kind) ? work.workIndex : last, -1);
}
function isRenderDraw(kind) {
  return kind === "draw" || kind === "drawIndexed" || kind === "drawIndirect" || kind === "drawIndexedIndirect";
}
function resourceSubjectDigest(resource) {
  if (resource === void 0) return void 0;
  const asset = typeof resource.asset === "object" && resource.asset !== null ? resource.asset : void 0;
  const candidates = [
    resource.observation?.subjectDigest,
    resource.digest,
    asset?.digest,
    asset?.programFingerprint
  ];
  return candidates.find((value) => typeof value === "string" && value.length > 0);
}
var TOOL_PREVIEW_SUBJECT_DRAW_MINIMUMS = {
  material: 2,
  mesh: 0,
  texture: 0,
  vfx: 2
};
function toolPreviewSubjectDrawn(kind, drawCalls) {
  return drawCalls > TOOL_PREVIEW_SUBJECT_DRAW_MINIMUMS[kind];
}
function resourceSubjectDrawn(resource, drawCalls) {
  if (resource.kind !== "vfx") return toolPreviewSubjectDrawn(resource.kind, drawCalls);
  return resource.observation !== void 0;
}
function isPreviewCapabilityUnavailable(cause) {
  return cause !== null && typeof cause === "object" && cause.code === "tool-preview-capability-unavailable";
}
var TOOL_PREVIEW_FRAME_CREDIT_TIMEOUT_MS = 3e4;
async function stepToolPreviewFrame(app, deltaSeconds) {
  const startedAtMs = performance.now();
  for (; ; ) {
    const stepped = app.stepFrame(deltaSeconds);
    if (stepped.ok) return stepped;
    if (stepped.error.code !== "app-frame-step-invalid" || stepped.error.detail.reason !== "credit") {
      return stepped;
    }
    if (performance.now() - startedAtMs >= TOOL_PREVIEW_FRAME_CREDIT_TIMEOUT_MS) return stepped;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}
async function replayToolPreviewCapture(capture) {
  const analyzeStartedAtMs = performance.now();
  const tapeBytes = dataUriBytes(capture.tape.jsonUri);
  const parsed = decodeTape(tapeBytes);
  if (!parsed.ok) {
    return err({
      code: "tool-preview-bootstrap-failed",
      expected: "the finalized tape to deserialize for fresh-device replay",
      hint: parsed.error.hint,
      detail: { phase: "tape-parse", cause: parsed.error }
    });
  }
  const drawCalls = countDrawCalls(parsed.value);
  const resource = capture.resource !== void 0 && capture.resource.kind !== "texture" && capture.resource.observation === void 0 && capture.resource.ownerFacts !== void 0 && resourceSubjectDrawn(capture.resource, drawCalls) ? { ...capture.resource, observation: capture.resource.ownerFacts } : capture.resource;
  const subjectDigest = resourceSubjectDigest(resource);
  if (resource !== void 0 && subjectDigest === void 0) {
    return err({
      code: "tool-preview-bootstrap-failed",
      expected: "the resource owner to publish a subject identity before evidence publication",
      hint: "repair AssetRegistry owner facts or post-frame observation; recipe and trace are not subject identity",
      detail: {
        phase: "resource-identity",
        cause: {
          kind: resource.kind,
          drawCalls,
          ownerFactsPublished: resource.ownerFacts !== void 0,
          observationPublished: resource.observation !== void 0
        }
      }
    });
  }
  let runtime;
  try {
    runtime = await createBrowserRhiDebugRuntime();
  } catch (cause) {
    return err({
      code: "tool-preview-capability-unavailable",
      expected: "a fresh browser WebGPU runtime for offline replay",
      hint: "Run replay in an isolated browser process; do not reuse the capture device.",
      detail: { phase: "replay-runtime", cause }
    });
  }
  const replayDevice = await runtime.createReplayDevice(parsed.value);
  if (!replayDevice.ok) {
    return err({
      code: "tool-preview-capability-unavailable",
      expected: "a fresh WebGPU device for offline replay",
      hint: "the capture device cannot be reused as a substitute for fresh-device replay",
      detail: { phase: "replay-device", cause: replayDevice.error }
    });
  }
  const replayResult = await openReplay(parsed.value, {
    device: replayDevice.value,
    createShaderModule: runtime.createShaderModule
  });
  if (!replayResult.ok) {
    return err({
      code: "tool-preview-bootstrap-failed",
      expected: "the self-contained tape to replay on a fresh WebGPU device",
      hint: replayResult.error.hint,
      detail: { phase: "replay-create", cause: replayResult.error }
    });
  }
  const replay = replayResult.value;
  if (drawCalls === 0) {
    await replay.dispose();
    return err({
      code: "tool-preview-bootstrap-failed",
      expected: "the preview recipe to submit at least one render draw",
      hint: "seed a visible mesh and camera before capturing the preview frame",
      detail: { phase: "replay-draws", cause: { appErrors: capture.appErrors } }
    });
  }
  const committedDrawIndex = lastRenderDrawIndex(parsed.value);
  if (committedDrawIndex < 0) {
    await replay.dispose();
    return err({
      code: "tool-preview-bootstrap-failed",
      expected: "the preview tape to contain a render draw after compute work",
      hint: "seed a visible render output after simulation dispatches before capturing the preview frame",
      detail: { phase: "replay-draws", cause: { appErrors: capture.appErrors } }
    });
  }
  const committed = await replay.inspectWork(committedDrawIndex, ["pixels"]);
  if (!committed.ok || committed.value.attachment === void 0) {
    await replay.dispose();
    return err({
      code: "tool-preview-bootstrap-failed",
      expected: "the fresh replay session to expose a color attachment for the final render work",
      hint: committed.ok ? "the tape contains no readable color attachment for PNG evidence" : committed.error.hint,
      detail: { phase: "replay-inspect", cause: committed.ok ? void 0 : committed.error }
    });
  }
  const attachment = committed.value.attachment;
  const width = attachment.width ?? 0;
  const height = attachment.height ?? 0;
  const rgba = attachment.format === void 0 ? void 0 : decodeToRgba8(attachment.bytes, attachment.format, width, height);
  if (rgba === null || rgba === void 0 || width <= 0 || height <= 0) {
    await replay.dispose();
    return err({
      code: "tool-preview-bootstrap-failed",
      expected: "the replayed color attachment to have a supported display format",
      hint: "move PNG encoding to the producer-owned preview shell for unsupported formats",
      detail: { phase: "png-readback", cause: { format: attachment.format, width, height } }
    });
  }
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = width;
  outputCanvas.height = height;
  const outputContext = outputCanvas.getContext("2d");
  if (outputContext === null) {
    await replay.dispose();
    return err({
      code: "tool-preview-bootstrap-failed",
      expected: "the browser to provide a 2D canvas context for replay PNG encoding",
      hint: "enable the browser canvas 2D context before running the preview host",
      detail: { phase: "png-encode" }
    });
  }
  outputContext.putImageData(new ImageData(rgba, width, height), 0, 0);
  await replay.dispose();
  const pixels = outputContext.getImageData(0, 0, width, height).data;
  let nonBlackPixels = 0;
  if (pixels !== void 0) {
    for (let offset = 0; offset < pixels.length; offset += 4) {
      if ((pixels[offset] ?? 0) + (pixels[offset + 1] ?? 0) + (pixels[offset + 2] ?? 0) > 0) {
        nonBlackPixels += 1;
      }
    }
  }
  if (nonBlackPixels === 0) {
    return err({
      code: "tool-preview-bootstrap-failed",
      expected: "the replayed PNG to contain non-black pixels",
      hint: "inspect the RHI tape and renderer draw submission before accepting the preview",
      detail: { phase: "png-non-black" }
    });
  }
  const analyzeDurationMs = performance.now() - analyzeStartedAtMs;
  const finalizeStartedAtMs = performance.now();
  const pngUri = outputCanvas.toDataURL("image/png");
  const pngBytes = dataUriBytes(pngUri);
  if (!capture.capturePng.uri.startsWith("data:image/png") || capture.capturePng.width <= 0 || capture.capturePng.height <= 0) {
    return err({
      code: "tool-preview-bootstrap-failed",
      expected: "the capture browser to provide a PNG before fresh replay",
      hint: "capture the rendered canvas before closing the capture carrier; do not reuse the replay PNG",
      detail: { phase: "capture-png" }
    });
  }
  const capturePngBytes = dataUriBytes(capture.capturePng.uri);
  if (capturePngBytes.byteLength === 0) {
    return err({
      code: "tool-preview-bootstrap-failed",
      expected: "the capture PNG to contain encoded bytes",
      hint: "repair the capture carrier readback before publishing evidence",
      detail: { phase: "capture-png" }
    });
  }
  const profileBytes = dataUriBytes(capture.profile.uri);
  const tapeDigest = await sha256(tapeBytes);
  const capturePngDigest = await sha256(capturePngBytes);
  const pngDigest = await sha256(pngBytes);
  const profileDigest = await sha256(profileBytes);
  const presentationDigest = await sha256(new TextEncoder().encode(capture.trace.presentation));
  const manifest = createPreviewArtifactManifest({
    schemaVersion: "2.0.0",
    identity: {
      runId: capture.tape.runId,
      snapshotDigest: capture.snapshot.digest,
      subjectDigest: subjectDigest ?? capture.snapshot.digest,
      presentationDigest,
      frameId: 0,
      captureId: capture.captureId
    },
    artifacts: [
      {
        owner: "rhi-debug",
        kind: "rhi-tape",
        role: "rhi-tape",
        uri: capture.tape.jsonUri,
        digest: tapeDigest,
        byteLength: tapeBytes.byteLength,
        mediaType: "application/json",
        derivedFrom: []
      },
      {
        owner: "visual",
        kind: "png",
        role: "capture",
        uri: capture.capturePng.uri,
        digest: capturePngDigest,
        byteLength: capturePngBytes.byteLength,
        mediaType: "image/png",
        derivedFrom: [tapeDigest]
      },
      {
        owner: "rhi-debug-replay",
        kind: "png",
        role: "fresh-replay",
        uri: pngUri,
        digest: pngDigest,
        byteLength: pngBytes.byteLength,
        mediaType: "image/png",
        derivedFrom: [tapeDigest, capturePngDigest]
      },
      {
        owner: "profiler",
        kind: "profile-capture",
        role: "profile-capture",
        uri: capture.profile.uri,
        digest: profileDigest,
        byteLength: profileBytes.byteLength,
        mediaType: "application/json",
        derivedFrom: []
      }
    ]
  });
  const finalizeDurationMs = performance.now() - finalizeStartedAtMs;
  const durationMs = capture.executeDurationMs + capture.captureDurationMs + analyzeDurationMs + finalizeDurationMs;
  const memory = performance.memory?.usedJSHeapSize;
  const browserJsHeapBytes = typeof memory === "number" && Number.isFinite(memory) && memory >= 0 ? Math.max(Math.round(memory), capture.browserJsHeapBytes ?? 0) : capture.browserJsHeapBytes;
  return ok({
    trace: capture.trace,
    captureId: capture.captureId,
    drawCalls,
    committedDrawIndex,
    nonBlackPixels,
    actionTrace: capture.actionTrace,
    tape: capture.tape,
    profile: capture.profile,
    capturePng: capture.capturePng,
    png: { uri: pngUri, width: outputCanvas.width, height: outputCanvas.height },
    manifest,
    artifacts: manifest.artifacts.flatMap((artifact) => {
      if (artifact.kind !== "rhi-tape" && artifact.kind !== "png" && artifact.kind !== "profile-capture") {
        return [];
      }
      return [
        {
          kind: artifact.kind,
          digest: artifact.digest,
          uri: artifact.uri,
          sizeBytes: artifact.byteLength
        }
      ];
    }),
    operationTiming: {
      startedAtMs: 0,
      endedAtMs: durationMs,
      durationMs,
      phases: {
        lookup: { status: "not-applicable" },
        lease: { status: "not-applicable" },
        transport: { status: "not-applicable" },
        execute: {
          status: "observed",
          durationMs: capture.executeDurationMs,
          workUnits: capture.recipe.frames
        },
        capture: { status: "observed", durationMs: capture.captureDurationMs },
        finalize: { status: "observed", durationMs: finalizeDurationMs },
        analyze: { status: "observed", durationMs: analyzeDurationMs }
      },
      unattributedMs: 0,
      resources: {
        "node-rss": { status: "not-applicable" },
        "browser-js-heap": browserJsHeapBytes === void 0 ? { status: "unavailable", reason: "performance.memory is not exposed" } : {
          status: "observed",
          bytes: browserJsHeapBytes,
          source: "maximum performance.memory.usedJSHeapSize across capture and replay"
        },
        "artifact-bytes": {
          status: "observed",
          bytes: tapeBytes.byteLength + dataUriBytes(capture.capturePng.uri).byteLength + pngBytes.byteLength + profileBytes.byteLength,
          source: "browser-produced artifact payloads"
        },
        "gpu-memory": {
          status: "unavailable",
          reason: "WebGPU does not expose portable allocation totals"
        }
      }
    },
    ...resource === void 0 ? {} : { resource }
  });
}
async function createToolPreviewHost(options) {
  const recipe = createToolPreviewRecipe(options.recipe);
  const runId = options.runId ?? generateRunId();
  const doc = options.root ?? (typeof document === "undefined" ? void 0 : document);
  if (options.canvas === void 0 && doc === void 0) {
    return err({
      code: "tool-preview-capability-unavailable",
      expected: "a DOM document or caller-owned HTMLCanvasElement",
      hint: "run the browser host or provide an attached canvas; headless does not mean RHI-null",
      detail: { phase: "canvas" }
    });
  }
  const canvas = options.canvas ?? (typeof Document !== "undefined" && doc instanceof Document ? doc.createElement("canvas") : void 0);
  const ownsCanvas = options.canvas === void 0;
  if (canvas === void 0) {
    return err({
      code: "tool-preview-capability-unavailable",
      expected: "root document can create an HTMLCanvasElement",
      hint: "provide a document root or an existing canvas",
      detail: { phase: "canvas" }
    });
  }
  layoutCanvas(canvas, recipe);
  appendCanvas(canvas, options.root);
  if (!canvas.isConnected) {
    return err({
      code: "tool-preview-bootstrap-failed",
      expected: "preview canvas is connected before App creation",
      hint: "attach the canvas to the document or pass a connected caller-owned canvas",
      detail: { phase: "canvas" }
    });
  }
  let runtime;
  try {
    runtime = await createBrowserRhiDebugRuntime();
  } catch (cause) {
    removeOwnedCanvas(canvas, ownsCanvas);
    return err({
      code: "tool-preview-capability-unavailable",
      expected: "a real WebGPU adapter and device",
      hint: "install or enable WebGPU; do not replace this route with RHI-null",
      detail: { phase: "rhi-debug", cause }
    });
  }
  const profiler = createProfiler();
  const appResult = await createApp(
    canvas,
    {
      ...options.app ?? {},
      rhi: runtime.rhi,
      rhiInstrumentation: runtime.rhiInstrumentation,
      profiler
    },
    options.bundler
  );
  if (!appResult.ok) {
    await runtime.attachment.dispose();
    removeOwnedCanvas(canvas, ownsCanvas);
    return err({
      code: "tool-preview-bootstrap-failed",
      expected: "createApp constructs a real WebGPU Renderer",
      hint: "inspect the structured App/RHI error; the preview must not fall back to RHI-null",
      detail: { phase: "renderer", cause: appResult.error }
    });
  }
  const app = appResult.value;
  const appErrors = [];
  const unsubscribeAppErrors = app.onError((error) => appErrors.push(error));
  let resourceFacts;
  try {
    const prepared = await options.prepare?.(app);
    if (prepared !== void 0) resourceFacts = prepared;
  } catch (cause) {
    unsubscribeAppErrors();
    await app.dispose();
    await runtime.attachment.dispose();
    removeOwnedCanvas(canvas, ownsCanvas);
    const bootstrapFailure = options.resource === void 0 ? {
      expected: "the project bootstrap to prepare the preview World",
      hint: "Repair the project Entry, assets, or scene before retrying the same recipe.",
      phase: "project-bootstrap"
    } : {
      expected: "the resource preview bootstrap to prepare the preview World",
      hint: "Repair the resource owner, cooked payload, or preview environment before retrying the same recipe.",
      phase: "resource-bootstrap"
    };
    return err({
      code: isPreviewCapabilityUnavailable(cause) ? "tool-preview-capability-unavailable" : "tool-preview-bootstrap-failed",
      expected: isPreviewCapabilityUnavailable(cause) ? cause.expected ?? "the preview resource capability" : bootstrapFailure.expected,
      hint: isPreviewCapabilityUnavailable(cause) ? cause.hint ?? "Use a supported preview representation or inspect the producer limitation." : bootstrapFailure.hint,
      detail: {
        phase: bootstrapFailure.phase,
        cause: isPreviewCapabilityUnavailable(cause) ? cause.detail ?? cause : cause
      }
    });
  }
  const attached = app.renderer.attach(app.world);
  if (!attached.ok) {
    unsubscribeAppErrors();
    await app.dispose();
    await runtime.attachment.dispose();
    removeOwnedCanvas(canvas, ownsCanvas);
    return err({
      code: "tool-preview-bootstrap-failed",
      expected: "the preview World to attach to the real Renderer before stepping",
      hint: attached.error.hint,
      detail: { phase: "world-attach", cause: attached.error }
    });
  }
  const profileSession = profiler.startCapture({ frameLimit: recipe.frames, eventLimit: 1024 });
  if (!profileSession.ok) {
    await app.dispose();
    await runtime.attachment.dispose();
    removeOwnedCanvas(canvas, ownsCanvas);
    return err({
      code: "tool-preview-bootstrap-failed",
      expected: "the App profiler to start a bounded capture",
      hint: profileSession.error.hint,
      detail: { phase: "profiler", cause: profileSession.error }
    });
  }
  const detach = runtime.attachRenderer(app.renderer);
  const trace = {
    events: ["canvas-created", "rhi-debug-armed", "renderer-created"],
    backend: "webgpu",
    adapter: "webgpu-adapter",
    presentation: recipe.presentation
  };
  let disposed = false;
  const capturePreview = async () => {
    if (disposed) {
      return err({
        code: "tool-preview-bootstrap-failed",
        expected: "preview host remains alive until capture completes",
        hint: "create a new preview host after dispose",
        detail: { phase: "capture" }
      });
    }
    const started = app.start();
    if (!started.ok)
      return err({
        ...started.error,
        code: "tool-preview-bootstrap-failed",
        detail: { phase: "start", cause: started.error }
      });
    const paused = app.pause();
    if (!paused.ok)
      return err({
        ...paused.error,
        code: "tool-preview-bootstrap-failed",
        detail: { phase: "pause", cause: paused.error }
      });
    const executeStartedAtMs = performance.now();
    const actionTrace = [];
    let encodedCapture;
    for (let frame = 0; frame < recipe.frames; frame += 1) {
      for (const action of recipe.actions.filter((candidate) => candidate.frame === frame)) {
        let accepted = false;
        try {
          accepted = await options.executeAction?.(action, app) === true;
        } catch (cause) {
          return err({
            code: "tool-preview-bootstrap-failed",
            expected: `project action '${action.name}' to execute at frame ${frame}`,
            hint: "Repair the project-owned preview action handler and rerun the same recipe.",
            detail: { phase: "action", cause }
          });
        }
        if (!accepted) {
          return err({
            code: "tool-preview-bootstrap-failed",
            expected: `project action '${action.name}' to have a registered handler`,
            hint: "Register the action in the project plugin or remove it from the recipe.",
            detail: { phase: "action", cause: { frame, name: action.name } }
          });
        }
        actionTrace.push(action);
      }
      if (frame === recipe.frames - 1) {
        encodedCapture = runtime.attachment.captureFrame();
        const snapshot = await runtime.attachment.frameBoundary();
        if (!snapshot.ok)
          return err({
            code: "tool-preview-bootstrap-failed",
            expected: "RHI-debug snapshots live resources before the captured frame",
            hint: snapshot.error.hint,
            detail: { phase: "rhi-snapshot", cause: snapshot.error }
          });
      }
      const stepped = await stepToolPreviewFrame(app, recipe.deltaSeconds);
      if (!stepped.ok)
        return err({
          ...stepped.error,
          code: "tool-preview-bootstrap-failed",
          detail: { phase: "frame", cause: stepped.error }
        });
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    const finalized = await runtime.attachment.frameBoundary();
    if (!finalized.ok)
      return err({
        code: "tool-preview-bootstrap-failed",
        expected: "RHI-debug finalizes the captured frame",
        hint: finalized.error.hint,
        detail: { phase: "rhi-finalize", cause: finalized.error }
      });
    if (options.collectResourceFacts !== void 0) {
      try {
        const collected = await options.collectResourceFacts(app, resourceFacts);
        if (collected !== void 0) resourceFacts = collected;
      } catch (cause) {
        return err({
          code: "tool-preview-bootstrap-failed",
          expected: "the resource owner to publish post-frame preview facts",
          hint: "Repair the producer-owned preview observation and retry the same recipe.",
          detail: { phase: "resource-observation", cause }
        });
      }
    }
    const executeDurationMs = performance.now() - executeStartedAtMs;
    const finalTrace = {
      ...trace,
      events: [...trace.events, "world-updated", "draw-submitted", "validation-complete"]
    };
    const captureStartedAtMs = performance.now();
    const profile = profileSession.value.finish();
    if (!profile.ok) {
      return err({
        code: "tool-preview-bootstrap-failed",
        expected: "the bounded App profiler to finish with ProfileCapture",
        hint: profile.error.hint,
        detail: { phase: "profiler-finish", cause: profile.error }
      });
    }
    if (encodedCapture === void 0) {
      return err({
        code: "tool-preview-bootstrap-failed",
        expected: "a positive-frame recipe to arm one captured frame",
        hint: "validate the recipe before running the preview host",
        detail: { phase: "rhi-capture" }
      });
    }
    const tape = await encodedCapture;
    if (!tape.ok)
      return err({
        code: "tool-preview-bootstrap-failed",
        expected: "RHI-debug produces a self-contained tape",
        hint: tape.error.hint,
        detail: { phase: "rhi-finalize", cause: tape.error }
      });
    const captureDurationMs = performance.now() - captureStartedAtMs;
    const tapeBytes = tape.value.bytes;
    const profileBytes = new TextEncoder().encode(JSON.stringify(profile.value));
    const capturePng = {
      uri: canvas.toDataURL("image/png"),
      width: canvas.width,
      height: canvas.height
    };
    const memory = performance.memory?.usedJSHeapSize;
    return ok({
      recipe,
      snapshot: options.snapshot,
      trace: finalTrace,
      captureId: profile.value.captureId,
      actionTrace,
      tape: {
        runId,
        jsonUri: bytesToDataUri(tapeBytes, "application/octet-stream"),
        blobUri: bytesToDataUri(new Uint8Array(), "application/octet-stream"),
        byteLength: tapeBytes.byteLength
      },
      profile: {
        captureId: profile.value.captureId,
        uri: bytesToDataUri(profileBytes, "application/json")
      },
      capturePng,
      executeDurationMs,
      captureDurationMs,
      ...typeof memory === "number" && Number.isFinite(memory) && memory >= 0 ? { browserJsHeapBytes: Math.round(memory) } : {},
      appErrors,
      ...resourceFacts === void 0 ? {} : { resource: resourceFacts }
    });
  };
  return ok({
    app,
    recipe,
    trace,
    capture: capturePreview,
    async run() {
      const capture = await capturePreview();
      if (!capture.ok) return capture;
      return replayToolPreviewCapture(capture.value);
    },
    async dispose() {
      if (disposed) return ok(void 0);
      disposed = true;
      detach();
      unsubscribeAppErrors();
      let disposeError;
      try {
        await options.onDispose?.(app);
      } catch (cause) {
        disposeError = cause;
      }
      const result = await app.dispose();
      removeOwnedCanvas(canvas, ownsCanvas);
      if (disposeError !== void 0) {
        return err({
          code: "tool-preview-bootstrap-failed",
          expected: "producer-owned preview attachments to dispose before the App",
          hint: "Repair the preview owner lifecycle and retry the same operation.",
          detail: { phase: "producer-dispose", cause: disposeError }
        });
      }
      return result.ok ? ok(void 0) : err({
        code: "tool-preview-bootstrap-failed",
        expected: "preview app disposes cleanly",
        hint: result.error.hint,
        detail: { phase: "dispose", cause: result.error }
      });
    }
  });
}
function joinToolPreviewEvidence(input) {
  const validated = validatePreviewArtifactManifest(input.manifest, input.required);
  if (!validated.ok) return err(validated.error);
  const artifacts = input.manifest.artifacts.map(
    (artifact) => createArtifactRef({
      kind: artifact.kind === "report" || artifact.kind === "contact-sheet" ? "tool-result" : artifact.kind,
      digest: artifact.digest,
      uri: artifact.uri,
      mediaType: artifact.mediaType,
      sizeBytes: artifact.byteLength
    })
  );
  return ok({ trace: input.trace, artifacts, manifest: input.manifest });
}
function createToolPreviewEvidence(trace, artifacts) {
  return { trace, artifacts: [...artifacts] };
}
function joinResourcePreviewEvidence(input) {
  if (input.manifest.identity.snapshotDigest !== input.snapshot.digest) {
    return err(snapshotStaleError(input.snapshot.digest, input.manifest.identity.snapshotDigest));
  }
  const validated = validatePreviewArtifactManifest(input.manifest, input.requiredRoles);
  return validated.ok ? ok(validated.value) : err(validated.error);
}

// src/tool-preview/framing.ts
function fitToolPreviewCameraToAabb(aabb, options) {
  const [minX, minY, minZ, maxX, maxY, maxZ] = aabb;
  if (![minX, minY, minZ, maxX, maxY, maxZ].every(Number.isFinite) || minX > maxX || minY > maxY || minZ > maxZ || !Number.isFinite(options.aspect) || options.aspect <= 0 || !Number.isFinite(options.fov) || options.fov <= 0 || options.fov >= Math.PI) {
    throw new TypeError("tool preview camera framing requires a finite AABB, aspect, and FOV");
  }
  const center = [
    (minX + maxX) / 2,
    (minY + maxY) / 2,
    (minZ + maxZ) / 2
  ];
  const radius = Math.max(
    Math.hypot((maxX - minX) / 2, (maxY - minY) / 2, (maxZ - minZ) / 2),
    1e-3
  );
  const verticalHalfFov = options.fov / 2;
  const horizontalHalfFov = Math.atan(Math.tan(verticalHalfFov) * options.aspect);
  const limitingHalfFov = Math.min(verticalHalfFov, horizontalHalfFov);
  const padding = options.padding ?? 1.15;
  if (!Number.isFinite(padding) || padding < 1) {
    throw new TypeError("tool preview camera framing padding must be finite and at least one");
  }
  const distance = radius / Math.sin(limitingHalfFov) * padding;
  const depthMargin = radius * (padding - 1);
  return {
    center,
    radius,
    distance,
    near: Math.max(1e-3, distance - radius - depthMargin),
    far: distance + radius + depthMargin
  };
}

// src/workspace-camera-events.ts
function bindWorkspaceCameraEvents(canvas, input, target) {
  const win = canvas.ownerDocument.defaultView;
  const previousTabIndex = canvas.getAttribute("tabindex");
  if (previousTabIndex === null) canvas.tabIndex = 0;
  let interaction;
  let dragging = false;
  const held = /* @__PURE__ */ new Set();
  let disposed = false;
  let queue = Promise.resolve();
  const identity = { targetId: target.target.targetId, clientId: "engine-browser-tools" };
  const finish = async (abort = false) => {
    held.clear();
    const current = interaction;
    interaction = void 0;
    if (!current) return;
    if (abort) await target.abortCameraInteraction?.({ ...identity, ...current });
    else await target.commitCamera?.({ ...identity, ...current, operationId: crypto.randomUUID() });
  };
  const enqueue = (run) => {
    queue = queue.then(async () => {
      if (!disposed) await run();
    }).catch(async () => {
      dragging = false;
      await finish(true).catch(() => {
      });
    });
  };
  const down = (event) => {
    if (event.button !== 2 || input.owner() !== "editor") return;
    event.preventDefault();
    dragging = true;
    canvas.focus({ preventScroll: true });
    canvas.setPointerCapture(event.pointerId);
    enqueue(async () => {
      const state = await target.getCamera(identity);
      const next = { interactionId: crypto.randomUUID(), expectedVersion: state.version ?? 0 };
      await target.beginCameraInteraction?.({
        ...identity,
        ...next,
        baseVersion: next.expectedVersion
      });
      interaction = next;
    });
  };
  const sample = (value) => enqueue(async () => {
    if (interaction)
      await target.updateCameraDraft?.({ ...identity, ...interaction, input: value });
  });
  const move = (event) => {
    if (dragging)
      sample({ type: "look", yaw: -event.movementX * 3e-3, pitch: -event.movementY * 3e-3 });
  };
  const up = () => {
    dragging = false;
    enqueue(() => finish());
  };
  const blur = () => {
    dragging = false;
    enqueue(() => finish(true));
  };
  const key = (event) => {
    if (!dragging || !["KeyW", "KeyA", "KeyS", "KeyD", "KeyQ", "KeyE"].includes(event.code)) return;
    event.preventDefault();
    if (event.type === "keydown") held.add(event.code);
    else held.delete(event.code);
    const axes = [
      Number(held.has("KeyD")) - Number(held.has("KeyA")),
      Number(held.has("KeyE")) - Number(held.has("KeyQ")),
      Number(held.has("KeyS")) - Number(held.has("KeyW"))
    ];
    const length = Math.hypot(...axes) || 1;
    sample({ type: "move", velocity: axes.map((value) => value * 4 / length) });
  };
  const menu = (event) => {
    if (input.owner() === "editor") event.preventDefault();
  };
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("contextmenu", menu);
  win?.addEventListener("pointerup", up);
  win?.addEventListener("blur", blur);
  win?.addEventListener("keydown", key);
  win?.addEventListener("keyup", key);
  return async () => {
    disposed = true;
    canvas.removeEventListener("pointerdown", down);
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("contextmenu", menu);
    win?.removeEventListener("pointerup", up);
    win?.removeEventListener("blur", blur);
    win?.removeEventListener("keydown", key);
    win?.removeEventListener("keyup", key);
    if (previousTabIndex === null) canvas.removeAttribute("tabindex");
    else canvas.setAttribute("tabindex", previousTabIndex);
    await queue;
    await finish(true);
  };
}

// src/workspace-browser.ts
function workspaceCommandFailure(cause) {
  if (cause instanceof EngineWorkspaceError) return cause;
  if (cause !== null && typeof cause === "object") {
    const value = cause;
    const code = typeof value.code === "string" ? value.code : "engine-workspace-browser-failure";
    const expected = typeof value.expected === "string" ? value.expected : "The workspace command to complete";
    const hint = typeof value.hint === "string" ? value.hint : typeof value.message === "string" ? value.message : `Inspect the structured ${code} failure details.`;
    return new EngineWorkspaceError(
      code,
      expected,
      hint,
      value.detail !== null && typeof value.detail === "object" ? value.detail : {}
    );
  }
  return new EngineWorkspaceError(
    "engine-workspace-browser-failure",
    "The workspace command to complete",
    String(cause)
  );
}
var workspaceBrowserCommandsPlugin = {
  name: "forgeax:workspace-browser-commands",
  inject: ["world", "engineWorkspaceTargetTools"],
  provide: ["engineWorkspacePresentation"],
  async apply(ctx, options) {
    const { app, canvas, target, project, transport, openResourcePreview } = options;
    if (app.world !== ctx.world) throw new Error("Workspace tools require the actual App World");
    const targetTools = ctx.engineWorkspaceTargetTools;
    if (!targetTools) throw new Error("Workspace target tools are unavailable");
    const children = /* @__PURE__ */ new Map();
    if (options.surface)
      ctx.provide("engineWorkspacePresentation", {
        createSurface: (input) => input?.target?.targetId && input.target.targetId !== target.targetId ? children.get(input.target.targetId)?.surface : options.surface
      });
    let preview;
    let previewOwner;
    let started = false;
    let presented = true;
    let disposed = false;
    let failure;
    let queue = Promise.resolve();
    let unsubscribe = () => {
    };
    let removeCameraEvents;
    if (!options.input && app.input?.setInputAllowed) {
      ctx.effect(() => {
        app.input?.setInputAllowed?.(false);
        return () => app.input?.setInputAllowed?.(true);
      });
    }
    const pending = /* @__PURE__ */ new Map();
    const errors = [];
    let submittedFrame2 = 0;
    let completedFrame = 0;
    if (typeof canvas.addEventListener === "function")
      ctx.effect(() => {
        const removeSubmitted = subscribeBrowserFrameSubmitted(canvas, (frame) => {
          submittedFrame2 = frame.frameId;
        });
        const completed = (event) => {
          completedFrame = Math.max(
            completedFrame,
            event.detail.frameId
          );
        };
        canvas.addEventListener(FORGEAX_FRAME_COMPLETED_EVENT, completed);
        return () => {
          removeSubmitted();
          canvas.removeEventListener(FORGEAX_FRAME_COMPLETED_EVENT, completed);
        };
      });
    if (!options.input && typeof IntersectionObserver === "function") {
      ctx.effect(() => {
        const observer = new IntersectionObserver(([entry]) => {
          if (!entry || disposed) return;
          presented = entry.isIntersecting;
          if (!started || !preview || failure) return;
          (presented ? app.resume() : app.pause()).unwrap();
        });
        observer.observe(canvas);
        return () => observer.disconnect();
      });
    }
    let frameFloor = submittedFrame2;
    const assertAvailable = () => {
      if (disposed)
        throw new EngineWorkspaceError(
          "engine-workspace-session-closed",
          "The workspace plugin must remain active"
        );
      if (failure) throw failure;
    };
    const closePreview = async () => {
      if (started) app.pause().unwrap();
      const old = preview;
      preview = void 0;
      previewOwner = void 0;
      await old?.close?.({ targetId: target.targetId });
    };
    const send = async (payload) => {
      if (!disposed)
        await transport.request(engineWorkspaceResultService(target.targetId), payload).catch(() => {
        });
    };
    const removeErrors = app.onError((error) => {
      if (errors.length === 32) errors.shift();
      errors.push({ code: error.code, hint: error.hint });
      if (failure || disposed || app.world.execution.health !== "poisoned") return;
      failure = new EngineWorkspaceError(
        error.code,
        error.expected,
        error.hint,
        "detail" in error ? { ...error.detail } : {}
      );
      app.pause();
      void send({
        kind: "failed",
        id: target.sessionId,
        sessionId: target.sessionId,
        targetId: target.targetId,
        error: {
          code: error.code,
          expected: error.expected,
          hint: error.hint,
          ..."detail" in error ? { detail: error.detail } : {}
        }
      });
    });
    ctx.effect(() => async () => {
      disposed = true;
      unsubscribe();
      removeErrors();
      for (const controller of pending.values()) controller.abort();
      try {
        await queue;
        await removeCameraEvents?.();
        for (const child of children.values()) await child.dispose();
        children.clear();
        await closePreview();
      } finally {
        if (!options.initialAsset)
          canvas.ownerDocument.documentElement.removeAttribute("data-forgeax-workspace-ready");
      }
    });
    const active = (input) => {
      assertAvailable();
      if (input?.targetId !== target.targetId || !preview || input.previewOwner !== previewOwner)
        throw new EngineWorkspaceError(
          "engine-workspace-target-stale",
          "The current browser target and preview owner"
        );
      return preview;
    };
    const requireTools = (input) => {
      const tools = active(input).tools;
      if (!tools)
        throw new EngineWorkspaceError(
          "engine-workspace-capability-unavailable",
          "The target tools plugin must be active"
        );
      return tools;
    };
    const capture = async (input) => {
      assertAvailable();
      const current = preview;
      if (!current)
        throw new EngineWorkspaceError("engine-workspace-preview-required", "An open preview");
      const width = input.width ?? current.target.width;
      const height = input.height ?? current.target.height;
      if (width !== current.target.width || height !== current.target.height)
        throw new Error(
          "Engine workspace capture dimensions must match the active target dimensions"
        );
      const deadline = Date.now() + 1e4;
      while (completedFrame <= frameFloor) {
        assertAvailable();
        input.signal?.throwIfAborted();
        if (!options.input && !presented) {
          const step = app.stepFrame(0);
          if (!step.ok && (step.error.code !== "app-frame-step-invalid" || step.error.detail.reason !== "credit"))
            throw step.error;
        }
        if (Date.now() >= deadline)
          throw new Error("Engine workspace did not complete a new frame before capture");
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
      const frameId = completedFrame;
      const png = canvas.toDataURL("image/png");
      if (!png.startsWith("data:image/png"))
        throw new Error("Engine workspace canvas returned an invalid PNG");
      frameFloor = frameId;
      return {
        targetId: target.targetId,
        frameId,
        width: canvas.width,
        height: canvas.height,
        png,
        ...errors.length ? { errors: errors.slice() } : {}
      };
    };
    const resize = ({ width, height }) => {
      const dpr = Math.max(1, canvas.ownerDocument.defaultView?.devicePixelRatio ?? 1);
      canvas.style.width = `${width / dpr}px`;
      canvas.style.height = `${height / dpr}px`;
      canvas.width = width;
      canvas.height = height;
      frameFloor = submittedFrame2;
    };
    const execute = async (command, signal) => {
      assertAvailable();
      signal.throwIfAborted();
      const input = { ...command.input, signal };
      switch (command.operation) {
        case "target.pick": {
          if (typeof input.x !== "number" || typeof input.y !== "number" || !Number.isFinite(input.x) || !Number.isFinite(input.y))
            throw new TypeError("Picking requires finite output pixels");
          const pick = requireTools(input).pick;
          if (!pick)
            throw new EngineWorkspaceError(
              "engine-workspace-capability-unavailable",
              "Display picking tools"
            );
          return pick({ x: input.x, y: input.y });
        }
        case "entity.highlight":
          return requireTools(input).highlight?.(input.entityId ? { entityId: input.entityId } : {}) ?? {
            available: false
          };
        case "target.control": {
          if (input.mode !== "player" && input.mode !== "observer")
            throw new TypeError("Invalid control mode");
          const setControl = active(input).setControl;
          if (!setControl)
            throw new EngineWorkspaceError(
              "engine-workspace-capability-unavailable",
              "Game input control tools"
            );
          return setControl({ ...input, mode: input.mode });
        }
        case "describe":
          return { project, target };
        case "listAssets": {
          if (!app.assets) throw new Error("Engine workspace requires AssetRegistry");
          return projectEngineWorkspaceAssets((await app.assets.enumerateCatalog()).unwrap());
        }
        case "openPreview": {
          if (input.previewTargetId && input.previewTargetId !== target.targetId) {
            if (!options.createPreviewApp || !input.asset)
              throw new EngineWorkspaceError(
                "engine-workspace-capability-unavailable",
                "Independent inline preview assembly"
              );
            const asset = input.asset;
            const childId = input.previewTargetId;
            if (children.has(childId)) throw new Error("Preview identity is already allocated");
            const surface = canvas.ownerDocument.createElement("div");
            const childCanvas = canvas.ownerDocument.createElement("canvas");
            const { url: _url, ...parentTarget } = target;
            const childTarget = {
              ...parentTarget,
              targetId: childId,
              width: input.width ?? target.width,
              height: input.height ?? target.height
            };
            childCanvas.width = childTarget.width;
            childCanvas.height = childTarget.height;
            surface.append(childCanvas);
            let opened2;
            let childApp;
            let childBrowser;
            const create = options.createPreviewApp;
            const childPlugin = {
              name: "forgeax:workspace-inline-preview",
              async apply(childContext) {
                const parking = canvas.ownerDocument.createElement("div");
                parking.hidden = true;
                parking.append(surface);
                canvas.ownerDocument.body.append(parking);
                childContext.effect(() => () => {
                  surface.remove();
                  parking.remove();
                });
                childApp = await create({
                  context: childContext,
                  canvas: childCanvas,
                  asset
                });
                childBrowser = await childContext.plugin(engineWorkspaceBrowserPlugin, {
                  app: childApp,
                  canvas: childCanvas,
                  surface,
                  target: { ...childTarget, worldId: childApp.world.identity },
                  project,
                  initialAsset: asset,
                  ...openResourcePreview ? { openResourcePreview } : {},
                  transport: {
                    async request(_service, payload) {
                      const value = payload;
                      if (value.kind === "ready") {
                        opened2 = value.preview;
                        return {};
                      }
                      return transport.request(
                        engineWorkspaceResultService(target.targetId),
                        value
                      );
                    },
                    subscribe(topic, listener) {
                      return transport.subscribe(topic, (value) => {
                        const command2 = value;
                        if (command2?.kind === "cancel" || command2?.input?.targetId === childId && command2.operation !== "closePreview")
                          listener(value);
                      });
                    }
                  }
                });
                await childBrowser.await();
              }
            };
            const scope = [
              "world",
              "renderer",
              "assets",
              "input",
              "animationPayloads",
              "renderFeatureHost",
              "audio",
              "physics",
              "engineWorkspaceTargetTools",
              "engineWorkspacePresentation"
            ].reduce((scope2, name) => scope2.isolate(name), ctx);
            const dispose = await ctx.effect(async function* () {
              const fiber = scope.plugin(childPlugin);
              yield fiber.dispose;
              yield async () => {
                await childBrowser?.dispose();
                await childApp?.dispose();
              };
              await fiber.await();
              signal.throwIfAborted();
              if (!opened2) throw new Error("Inline preview did not publish its target");
            });
            children.set(childId, { dispose, surface });
            return opened2;
          }
          if (options.input)
            throw new EngineWorkspaceError(
              "engine-workspace-operation-unavailable",
              "Asset previews belong to the editing target"
            );
          if (!app.assets || !input.asset)
            throw new TypeError("Workspace requires an asset and AssetRegistry");
          const width = input.width ?? target.width;
          const height = input.height ?? target.height;
          if (![width, height].every((v) => Number.isSafeInteger(v) && v > 0))
            throw new TypeError("Invalid target extent");
          await closePreview();
          signal.throwIfAborted();
          errors.length = 0;
          await resize({ targetId: target.targetId, width, height });
          const next = await createEngineWorkspaceAppPreview({
            app,
            assets: app.assets,
            asset: input.asset,
            project,
            target: { ...target, width, height },
            capture,
            resize,
            tools: targetTools,
            ...openResourcePreview === void 0 ? {} : {
              openResourcePreview: (input2) => openResourcePreview({ ...input2, canvas })
            }
          });
          try {
            assertAvailable();
            signal.throwIfAborted();
            (started ? app.resume() : app.start()).unwrap();
            started = true;
            if (!presented) app.pause().unwrap();
            preview = next;
            previewOwner = command.id;
            frameFloor = submittedFrame2;
            return { previewOwner, target: next.target, asset: next.asset };
          } catch (error) {
            await next.close?.();
            throw error;
          }
        }
        case "closePreview": {
          const child = input.targetId ? children.get(input.targetId) : void 0;
          if (child && input.targetId) {
            children.delete(input.targetId);
            await child.dispose();
            return { closed: true, targetId: input.targetId };
          }
          if (input.previewOwner !== previewOwner) return { closed: false, stale: true };
          await closePreview();
          return { closed: true, targetId: target.targetId };
        }
        case "scene-tree.get":
          return requireTools(input).tree(input);
        case "entity.inspect":
        case "entity.focus": {
          if (typeof input.entityId !== "string")
            throw new TypeError("An entity reference is required");
          const tools = requireTools(input);
          return command.operation === "entity.inspect" ? tools.inspect({ entityId: input.entityId }) : tools.focus({ entityId: input.entityId });
        }
        case "resize":
          if (typeof input.width !== "number" || typeof input.height !== "number")
            throw new TypeError("Workspace resize requires output dimensions");
          return {
            target: await active(input).resize?.({
              ...input,
              width: input.width,
              height: input.height
            })
          };
        case "capture":
          return active(input).capture?.(input);
        case "camera.get":
          return active(input).getCamera(input);
        case "camera.begin":
          return active(input).beginCameraInteraction?.(input);
        case "camera.update": {
          const result = await active(input).updateCameraDraft?.(input);
          frameFloor = submittedFrame2;
          return result;
        }
        case "camera.commit": {
          const result = await active(input).commitCamera?.(input);
          frameFloor = submittedFrame2;
          return result;
        }
        case "camera.abort": {
          const result = await active(input).abortCameraInteraction?.(input);
          frameFloor = submittedFrame2;
          return result;
        }
        case "camera.revoke":
          if (typeof input.connectionId !== "string")
            throw new TypeError("A connection identity is required");
          return active(input).revokeConnection?.({
            targetId: input.targetId,
            connectionId: input.connectionId
          });
        default:
          throw new EngineWorkspaceError(
            "engine-workspace-operation-unavailable",
            "An installed workspace operation"
          );
      }
    };
    if (options.input) {
      preview = createEngineWorkspaceAppTarget({ app, target, tools: targetTools, capture });
      previewOwner = target.sessionId;
      removeCameraEvents = bindWorkspaceCameraEvents(canvas, options.input, preview);
    }
    if (typeof canvas.addEventListener === "function") {
      const pick = (event) => {
        if (event.button !== 0 || event.defaultPrevented || !preview || options.input?.owner() === "game")
          return;
        const rect = canvas.getBoundingClientRect();
        const current = preview;
        void Promise.resolve().then(
          () => current.tools?.pick?.({
            x: (event.clientX - rect.left) * canvas.width / rect.width,
            y: (event.clientY - rect.top) * canvas.height / rect.height
          })
        ).then(async (result) => {
          if (preview === current && result)
            await send({
              kind: "picked",
              sessionId: target.sessionId,
              targetId: target.targetId,
              previewOwner,
              result
            });
        }).catch(async (cause) => {
          if (preview !== current || disposed) return;
          const error = workspaceCommandFailure(cause);
          await send({
            kind: "pick-error",
            sessionId: target.sessionId,
            targetId: target.targetId,
            previewOwner,
            error: {
              code: error.code,
              expected: error.expected,
              hint: error.hint,
              ..."detail" in error ? { detail: error.detail } : {}
            }
          }).catch(() => {
          });
        });
      };
      canvas.addEventListener("click", pick);
      ctx.effect(() => () => canvas.removeEventListener("click", pick));
    }
    unsubscribe = transport.subscribe(ENGINE_WORKSPACE_COMMAND_TOPIC, (value) => {
      if (!value || typeof value !== "object") return;
      const command = value;
      if (disposed || command.sessionId !== target.sessionId || typeof command.id !== "string")
        return;
      if (command.kind === "cancel") {
        pending.get(command.id)?.abort();
        return;
      }
      if (command.kind !== "command" || pending.has(command.id)) return;
      if (command.input?.targetId && command.input.targetId !== target.targetId && !(command.operation === "closePreview" && children.has(command.input.targetId)))
        return;
      const controller = new AbortController();
      pending.set(command.id, controller);
      const run = async () => {
        try {
          const result = await execute(command, controller.signal);
          if (controller.signal.aborted && previewOwner === command.id) await closePreview();
          controller.signal.throwIfAborted();
          await send({
            kind: "result",
            id: command.id,
            sessionId: target.sessionId,
            targetId: target.targetId,
            ok: true,
            value: result
          });
        } catch (cause) {
          const error = workspaceCommandFailure(cause);
          await send({
            kind: "result",
            id: command.id,
            sessionId: target.sessionId,
            targetId: target.targetId,
            ok: false,
            error: {
              code: error.code,
              expected: error.expected,
              hint: error.hint,
              ..."detail" in error ? { detail: error.detail } : {}
            }
          });
        } finally {
          pending.delete(command.id);
        }
      };
      queue = queue.then(run, run);
    });
    let opened;
    if (options.initialAsset)
      opened = await execute(
        {
          kind: "command",
          id: target.targetId,
          sessionId: target.sessionId,
          operation: "openPreview",
          input: {
            targetId: target.targetId,
            asset: options.initialAsset,
            width: target.width,
            height: target.height
          }
        },
        new AbortController().signal
      );
    canvas.ownerDocument.documentElement.dataset.forgeaxWorkspaceReady = "true";
    await send({
      kind: "ready",
      id: target.sessionId,
      sessionId: target.sessionId,
      targetId: target.targetId,
      project,
      target,
      ...opened ? { preview: opened } : {}
    });
  }
};
var engineWorkspaceBrowserPlugin = {
  name: "forgeax:workspace-browser",
  inject: ["world"],
  async apply(ctx, options) {
    await ctx.plugin(engineWorkspaceTargetToolsPlugin, {
      targetId: options.target.targetId,
      ...typeof options.canvas.addEventListener === "function" ? { display: { canvas: options.canvas, app: options.app } } : {},
      ...options.input ? { input: options.input } : {},
      ...options.app.observation === void 0 ? {} : { observation: options.app.observation }
    });
    await ctx.plugin(workspaceBrowserCommandsPlugin, options);
  }
};
var engineWorkspaceInputPlugin = {
  name: "forgeax:workspace-input",
  provide: ["engineWorkspaceInput"],
  apply(ctx, { canvas }) {
    const remove = attachBrowserInputBackend(canvas);
    ctx.effect(() => remove);
    const boundary = createCanvasInputBoundary(remove.backend);
    boundary.grantGame();
    ctx.provide("engineWorkspaceInput", boundary);
  }
};
var ENGINE_WORKSPACE_TOOL_SOURCE = "engine-workspace";
var ENGINE_WORKSPACE_STATE_TOPIC = "engine.workspace.state";
function string(args, name) {
  const value = args[name];
  if (typeof value !== "string" || !value.trim()) throw new TypeError(`workspace requires ${name}`);
  return value;
}
function snapshotEngineWorkspace(runtime) {
  const opened = runtime.project;
  const preview = runtime.preview;
  const target = (value) => {
    if (!value) return null;
    const { surface: _surface, ...identity } = value;
    return identity;
  };
  return {
    apiVersion: runtime.apiVersion,
    project: opened ? structuredClone(opened.project) : null,
    projectTarget: target(opened?.target),
    play: runtime.play ? {
      target: target(runtime.play.target),
      inputVersion: runtime.play.inputVersion,
      phase: runtime.play.phase
    } : null,
    previews: runtime.previews.map((preview2) => ({
      target: target(preview2.target),
      asset: preview2.asset ? structuredClone(preview2.asset) : null
    })),
    preview: preview ? {
      target: target(preview.target),
      asset: preview.asset ? structuredClone(preview.asset) : null
    } : null
  };
}
function createEngineWorkspaceTools(runtime, changed = () => {
}) {
  const project = (args) => {
    const current = runtime.project;
    if (!current || current.project.id !== string(args, "projectId")) {
      throw new EngineWorkspaceError(
        "engine-workspace-project-mismatch",
        "engine workspace project identity mismatch"
      );
    }
    return current;
  };
  const preview = (args) => {
    const current = [...runtime.previews, runtime.play].find(
      (owner) => owner?.target.targetId === args.targetId
    );
    if (!current || current.target.targetId !== string(args, "targetId")) {
      throw new EngineWorkspaceError(
        "engine-workspace-target-mismatch",
        "engine workspace target identity mismatch"
      );
    }
    if (args.targetGeneration !== current.target.generation) {
      throw new EngineWorkspaceError(
        "engine-workspace-target-stale",
        "the current preview generation",
        "Refresh engine.workspace.get and submit targetGeneration from preview.target.generation."
      );
    }
    return current;
  };
  const cameraInput = (args, context) => ({
    targetId: string(args, "targetId"),
    clientId: context.caller?.sourceId ?? string(args, "clientId"),
    ...context.caller === void 0 ? {} : { connectionId: context.caller.connectionId },
    signal: context.signal,
    ...typeof args.interactionId === "string" ? { interactionId: args.interactionId } : {},
    ...typeof args.operationId === "string" ? { operationId: args.operationId } : {},
    ...typeof args.expectedVersion === "number" ? { expectedVersion: args.expectedVersion } : {},
    ...typeof args.baseVersion === "number" ? { baseVersion: args.baseVersion } : {},
    ...args.camera === void 0 ? {} : { camera: args.camera },
    ...args.input === void 0 ? {} : { input: args.input }
  });
  const handlers = {
    "target.pick": {
      summary: "Pick against the actual submitted display mapping and current entity bounds.",
      async run(args) {
        const owner = preview(args);
        if (!owner.tools?.pick)
          throw new EngineWorkspaceError(
            "engine-workspace-capability-unavailable",
            "Display picking tools"
          );
        if (typeof args.x !== "number" || typeof args.y !== "number")
          throw new TypeError("Picking requires output pixels");
        const result = await owner.tools.pick({ x: args.x, y: args.y });
        if (owner !== preview(args))
          throw new EngineWorkspaceError("engine-workspace-target-stale", "The same target");
        return result;
      }
    },
    "entity.highlight": {
      summary: "Set or clear the target tools highlight without changing entity materials.",
      run(args) {
        const owner = preview(args);
        return owner.tools?.highlight?.(
          typeof args.entityId === "string" ? { entityId: args.entityId } : {}
        ) ?? { available: false };
      }
    },
    "play.start": {
      summary: "Start an isolated game from fixed project inputs, returning its Engine URL before readiness.",
      async run(args, context) {
        if (!runtime.startPlay)
          throw new EngineWorkspaceError(
            "engine-workspace-capability-unavailable",
            "An Engine Play provider"
          );
        await runtime.startPlay({ ...project(args), signal: context.signal });
        return snapshotEngineWorkspace(runtime);
      }
    },
    "play.ready": {
      summary: "Wait for the actual Play World after presenting its Engine URL.",
      async run(args, context) {
        const owner = preview(args);
        if (owner !== runtime.play)
          throw new EngineWorkspaceError(
            "engine-workspace-target-mismatch",
            "The current Play target"
          );
        await runtime.play.ready(context.signal);
        if (runtime.play !== owner)
          throw new EngineWorkspaceError("engine-workspace-target-stale", "The same Play target");
        return snapshotEngineWorkspace(runtime);
      }
    },
    "play.stop": {
      summary: "Stop only the identified Editor Play, preserving the edit target and independent runs.",
      async run(args) {
        const owner = preview(args);
        if (owner !== runtime.play)
          throw new EngineWorkspaceError(
            "engine-workspace-target-mismatch",
            "The current Play target"
          );
        await runtime.stopPlay?.(runtime.play);
        return snapshotEngineWorkspace(runtime);
      }
    },
    "target.control": {
      summary: "Hand input and camera control between the game and its observation tools.",
      async run(args, context) {
        const owner = preview(args);
        if (!owner.setControl)
          throw new EngineWorkspaceError(
            "engine-workspace-capability-unavailable",
            "Target control tools"
          );
        if (args.mode !== "player" && args.mode !== "observer")
          throw new TypeError("Control requires player or observer mode");
        return owner.setControl({ ...cameraInput(args, context), mode: args.mode });
      }
    },
    "workspace.get": {
      summary: "Read the Engine project and preview identities.",
      run: () => snapshotEngineWorkspace(runtime)
    },
    "project.open": {
      summary: "Open an Engine project and return its target URL before browser readiness.",
      async run(args, context) {
        if (args.expectedTargetId !== void 0 && args.expectedTargetId !== null && typeof args.expectedTargetId !== "string")
          throw new TypeError("expectedTargetId must be a target identity or null");
        if (args.expectedTargetState !== void 0 && args.expectedTargetState !== "lost")
          throw new TypeError("expectedTargetState must be lost");
        await runtime.openProject({
          root: string(args, "root"),
          signal: context.signal,
          ...args.expectedTargetId === void 0 ? {} : { expectedTargetId: args.expectedTargetId },
          ...args.expectedTargetState === void 0 ? {} : { expectedTargetState: "lost" }
        });
        return snapshotEngineWorkspace(runtime);
      }
    },
    "project.close": {
      summary: "Close the identified Engine workspace project and its preview.",
      async run(args) {
        await runtime.closeProject(project(args));
        return snapshotEngineWorkspace(runtime);
      }
    },
    "assets.list": {
      summary: "Read assets from the Engine project catalog.",
      async run(args, context) {
        const opened = project(args);
        const assets = await runtime.listAssets({ ...opened, signal: context.signal });
        if (runtime.project !== opened) throw new Error("engine workspace assets became stale");
        return { project: opened.project, assets };
      }
    },
    "asset.open": {
      summary: "Open an independent Engine asset preview.",
      async run(args, context) {
        const opened = project(args);
        const assets = await runtime.listAssets({ ...opened, signal: context.signal });
        if (runtime.project !== opened) throw new Error("engine workspace assets became stale");
        const asset = assets.find((value) => value.guid === string(args, "guid"));
        if (!asset)
          throw new EngineWorkspaceError(
            "engine-workspace-asset-not-found",
            "engine workspace asset not found"
          );
        const extent = (name, fallback) => {
          const value = args[name] ?? fallback;
          if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1)
            throw new TypeError(`workspace requires positive ${name}`);
          return value;
        };
        await runtime.openPreview({
          project: opened.project,
          projectHandle: opened.handle,
          asset,
          width: extent("width", 1280),
          height: extent("height", 720),
          signal: context.signal
        });
        return snapshotEngineWorkspace(runtime);
      }
    },
    "preview.close": {
      summary: "Close only the identified Engine preview.",
      async run(args) {
        const owner = preview(args);
        if (owner === runtime.play)
          throw new EngineWorkspaceError(
            "engine-workspace-operation-unavailable",
            "Use play.stop for the game target"
          );
        await runtime.closePreview(owner);
        return snapshotEngineWorkspace(runtime);
      }
    },
    "preview.resize": {
      summary: "Resize the identified preview output in pixels without replacing its World.",
      async run(args, context) {
        const owner = preview(args);
        if (owner === runtime.play || !owner.resize)
          throw new EngineWorkspaceError(
            "engine-workspace-capability-unavailable",
            "A resizable asset preview"
          );
        const width = args.width;
        const height = args.height;
        if (typeof width !== "number" || typeof height !== "number" || ![width, height].every((size) => Number.isSafeInteger(size) && size > 0))
          throw new TypeError("Workspace resize requires positive integer output pixels");
        await owner.resize({
          targetId: owner.target.targetId,
          width,
          height,
          signal: context.signal
        });
        return { target: owner.target };
      }
    },
    "preview.capture": {
      summary: "Capture the actual Engine preview surface.",
      run(args, context) {
        const owner = preview(args);
        if (!owner.capture) throw new Error("engine workspace capture capability unavailable");
        return owner.capture({
          targetId: owner.target.targetId,
          signal: context.signal,
          ...typeof args.width === "number" ? { width: args.width } : {},
          ...typeof args.height === "number" ? { height: args.height } : {}
        });
      }
    },
    "camera.get": {
      summary: "Read the authoritative Engine camera and version.",
      run(args, context) {
        const owner = preview(args);
        return owner.getCamera({ targetId: owner.target.targetId, signal: context.signal });
      }
    }
  };
  for (const [operation, method] of [
    ["camera.begin", "beginCameraInteraction"],
    ["camera.update", "updateCameraDraft"],
    ["camera.commit", "commitCamera"],
    ["camera.abort", "abortCameraInteraction"]
  ]) {
    handlers[operation] = {
      summary: `${operation} on the identified Engine preview.`,
      async run(args, context) {
        const owner = preview(args);
        const invoke = owner[method];
        if (!invoke) throw new Error(`engine workspace ${operation} capability unavailable`);
        const input = cameraInput(
          operation === "camera.begin" && args.interactionId === void 0 ? { ...args, interactionId: crypto.randomUUID() } : args,
          context
        );
        const revoke = () => {
          if (input.connectionId !== void 0)
            void Promise.resolve(
              owner.revokeConnection?.({
                targetId: owner.target.targetId,
                connectionId: input.connectionId
              })
            ).catch(() => {
            });
        };
        context.signal.addEventListener("abort", revoke, { once: true });
        try {
          context.signal.throwIfAborted();
          const result = await invoke(input);
          if (!runtime.previews.includes(owner) && runtime.play !== owner)
            throw new EngineWorkspaceError(
              "engine-workspace-target-stale",
              "the same preview owner after the operation",
              "Refresh engine.workspace.get before issuing another operation."
            );
          if (context.signal.aborted) {
            revoke();
            context.signal.throwIfAborted();
          }
          return result;
        } finally {
          context.signal.removeEventListener("abort", revoke);
        }
      }
    };
  }
  for (const [operation, method] of [
    ["scene-tree.get", "tree"],
    ["entity.inspect", "inspect"],
    ["entity.focus", "focus"]
  ]) {
    handlers[operation] = {
      summary: `${operation} on the actual Engine World through its optional tools plugin.`,
      async run(args, context) {
        const owner = preview(args);
        const tools = owner.tools;
        if (!tools)
          throw new EngineWorkspaceError(
            "engine-workspace-capability-unavailable",
            "The target tools plugin is unavailable",
            "Enable the optional Engine target tools plugin in the execution realm."
          );
        context.signal.throwIfAborted();
        const result = method === "tree" ? await tools.tree({
          ...typeof args.offset === "number" ? { offset: args.offset } : {},
          ...typeof args.limit === "number" ? { limit: args.limit } : {},
          ...typeof args.revision === "number" ? { revision: args.revision } : {}
        }) : await tools[method]({ entityId: string(args, "entityId") });
        context.signal.throwIfAborted();
        if (!runtime.previews.includes(owner) && runtime.play !== owner)
          throw new EngineWorkspaceError(
            "engine-workspace-target-stale",
            "The same target owner after the query"
          );
        return result;
      }
    };
  }
  if (runtime.inspectAsset) {
    handlers["asset.inspect"] = {
      summary: "Inspect an Engine asset using the project authority.",
      async run(args, context) {
        const opened = project(args);
        const inspection = await runtime.inspectAsset?.({
          ...opened,
          guid: string(args, "guid"),
          signal: context.signal
        });
        if (runtime.project !== opened) throw new Error("engine workspace inspection became stale");
        return { project: opened.project, inspection };
      }
    };
  }
  if (runtime.rebuildAssetSource) {
    for (const mode of ["rebuild", "cold-cook"]) {
      handlers[`asset-source.${mode}`] = {
        summary: `${mode} through the Engine asset source owner.`,
        async run(args, context) {
          const opened = project(args);
          const result = await runtime.rebuildAssetSource?.({
            ...opened,
            guid: string(args, "guid"),
            requestId: string(args, "requestId"),
            expectedRevision: string(args, "expectedRevision"),
            mode,
            signal: context.signal
          });
          if (runtime.project !== opened)
            throw new Error("engine workspace source operation became stale");
          return result;
        }
      };
    }
  }
  return Object.entries(handlers).map(([operation, handler]) => {
    const required = operation === "project.open" ? ["root"] : operation.startsWith("camera.") || operation.startsWith("preview.") || operation.startsWith("entity.") || operation.startsWith("target.") || operation === "play.ready" || operation === "play.stop" || operation === "scene-tree.get" ? ["targetId", "targetGeneration"] : operation === "workspace.get" ? [] : ["projectId"];
    const schema = {
      type: "object",
      required,
      properties: {
        root: { type: "string", minLength: 1 },
        expectedTargetId: {
          description: "Expected current target identity; null requires no open project."
        },
        expectedTargetState: { type: "string", enum: ["lost"] },
        projectId: { type: "string", minLength: 1 },
        targetId: { type: "string", minLength: 1 },
        targetGeneration: { type: "integer", minimum: 1 },
        guid: { type: "string", minLength: 1 },
        entityId: { type: "string", minLength: 1 },
        mode: { type: "string", enum: ["player", "observer"] },
        x: { type: "number" },
        y: { type: "number" },
        offset: { type: "integer", minimum: 0 },
        limit: { type: "integer", minimum: 1, maximum: 1e3 },
        revision: { type: "integer", minimum: 0 },
        width: { type: "integer", minimum: 1 },
        height: { type: "integer", minimum: 1 }
      }
    };
    return defineTool(
      {
        id: `engine.${operation}`,
        path: ["engine", ...operation.split(".")],
        title: operation,
        summary: handler.summary,
        realm: "host",
        argsSchema: toolJsonSchema(schema),
        resultSchema: toolJsonSchema({}),
        inputSchema: schema,
        outputSchema: {},
        evidence: []
      },
      async (value, context) => {
        try {
          const result = await handler.run(value, context);
          return result === void 0 ? null : JSON.parse(JSON.stringify(result));
        } catch (error) {
          if (error instanceof EngineWorkspaceError || error instanceof Error && "code" in error && "expected" in error && "hint" in error)
            return {
              ok: false,
              error: {
                code: String(error.code),
                expected: String(error.expected),
                hint: String(error.hint),
                detail: "detail" in error ? JSON.parse(JSON.stringify(error.detail)) : {}
              }
            };
          if (error instanceof TypeError)
            return {
              ok: false,
              error: {
                code: "engine-workspace-invalid-args",
                expected: error.message,
                hint: "Use the operation schema and explicit project/target identities."
              }
            };
          throw error;
        } finally {
          if (![
            "workspace.get",
            "assets.list",
            "asset.inspect",
            "scene-tree.get",
            "entity.inspect",
            "target.pick",
            "camera.get",
            "preview.capture"
          ].includes(operation))
            changed();
        }
      }
    );
  });
}

export { APP_ERROR_HINTS, APP_EXPECTED, APP_PHASE_CATALOG, AppError, DEFAULT_ASSET_CATALOG_URL, ENGINE_WORKSPACE_API_VERSION, ENGINE_WORKSPACE_COMMAND_TOPIC, ENGINE_WORKSPACE_PLUGIN_ID, ENGINE_WORKSPACE_PREVIEWABLE_KINDS, ENGINE_WORKSPACE_SERVICE, ENGINE_WORKSPACE_STATE_TOPIC, ENGINE_WORKSPACE_TOOL_SOURCE, EXECUTION_CAPABILITY_NAMES, EXECUTION_REPORT_SCHEMA_VERSION, EXECUTION_WORKERS, EngineWorkspaceError, FORGEAX_FRAME_COMPLETED_DATASET, FORGEAX_FRAME_COMPLETED_EVENT, FORGEAX_FRAME_SUBMITTED_DATASET, FORGEAX_FRAME_SUBMITTED_EVENT, LOAD_GAME_ERROR_HINTS, LOAD_GAME_EXPECTED, LoadGameError, POINT_SHADOW_PLUGIN_ID, PointShadowRecipeError, admitPointShadowBudget, assembleAssetRuntime, createApp, createAppObservation, createAssetRuntimeAssembly, createDefaultAssetCatalogSource, createEngineWorkspaceAppPreview, createEngineWorkspaceAppTarget, createEngineWorkspaceProvider, createEngineWorkspaceRuntime, createEngineWorkspaceTools, createExecutionFrameInspection, createExecutionReport, createToolPreviewEvidence, createToolPreviewHost, createToolPreviewRecipe, defaultAssetCatalogUrl, engineWorkspaceBrowserPlugin, engineWorkspaceInputPlugin, engineWorkspacePlugin, engineWorkspaceResultService, engineWorkspaceTargetToolsPlugin, ensureFallbackCamera, executionBootstrapHostPlugin, fitToolPreviewCameraToAabb, gameHostPlugin, inputPlugin, isAppError, isExecutionReport, isLoadGameError, joinResourcePreviewEvidence, joinToolPreviewEvidence, loadBootstrapEntry, loadEngineWorkspaceMaterialSlots, loadGame, measureCanvasDrawingBuffer, missingExecutionCapabilities, ownedRendererPlugin, pointShadowPlugin, prepareBootstrapEntry, probeExecutionCapabilities, projectEngineWorkspaceAssets, publishBrowserFrameCompleted, publishBrowserFrameSubmitted, renderFeatureHostPlugin, renderFeaturePlugin, rendererPlugin, replayToolPreviewCapture, resetBrowserFrameSubmitted, selectExecutionWorkers, snapshotEngineWorkspace, subscribeBrowserFrameSubmitted, syncCanvasDrawingBuffer, toolPreviewSubjectDrawn, unavailableExecutionCapabilities, validateExecutionBootstrapData, validateToolPreviewTrace };
