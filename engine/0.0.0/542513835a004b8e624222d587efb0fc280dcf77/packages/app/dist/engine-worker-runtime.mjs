import { createCatalogSource } from '../../assets-runtime/dist/index.mjs';
import { createAudioIntentBackend, audioBackendPlugin } from '../../audio/dist/index.mjs';
import { World, createWorldContext, Update } from '../../ecs/dist/index.mjs';
import { makeCompositeBackend, inputBackendPlugin, INPUT_BACKEND_KEY, INPUT_SNAPSHOT_RESOURCE_KEY, createInputSnapshot, InputSet, InputFrameStartScan, FRAME_START_SCAN_SYSTEM_NAME } from '../../input/dist/index.mjs';
import { Inject } from '../../plugin/dist/browser.mjs';
import { createProfiler } from '../../profiler/dist/index.mjs';
import { RenderPublicationTargetOwner, RenderPublicationError, Camera, CAMERA_PROJECTION_PERSPECTIVE, renderComponentsPlugin, createRenderPublisher, renderPublicationTransfers, MeshFilter, CAMERA_PROJECTION_ORTHOGRAPHIC, validateCameraExposure, CAMERA_EXPOSURE_MODE_MANUAL, CAMERA_EXPOSURE_MODE_AUTO, cameraExposureFromColumns, getActiveCamera, setActiveCamera } from '../../render/dist/index.mjs';
import { createDevImportTransport } from '../../runtime/dist/index.mjs';
import { constructRuntimeRendererHost, createPublicationAssets, loadRhiPack } from '../../runtime/dist/renderer-host.mjs';
import { err, ok } from '../../types/dist/index.mjs';
import { RhiError } from '../../rhi/dist/index.mjs';
import { attachRecorder, createRhiDebugError } from '../../rhi-debug/dist/index.mjs';
import { animationPayloadsPlugin, animationRuntimePlugin } from '../../animation/dist/index.mjs';
import { scenePlugin, Transform, Name, GlobalTransform, Children } from '../../scene/dist/index.mjs';
import { statePlugin } from '../../state/dist/index.mjs';
import * as rhiWebgpu from '../../rhi-webgpu/dist/index.mjs';
import { quat } from '../../math/dist/index.mjs';
import { splitSharedSpan, bindSharedSpan, isSharedSpan } from '../../ecs/dist/shared.mjs';

// src/execution/engine-worker-runtime.ts

// src/animation-asset-lookup.ts
function createAnimationPayloadLookup(source) {
  return (guid) => source?.lookup(guid);
}
var DEFAULT_ASSET_CATALOG_URL = "/pack-index.json";
function assemblyError(kind, cause) {
  return {
    code: "asset-assembly-failed",
    expected: "one AssetRegistry with non-conflicting decoder contributions and one catalog source",
    hint: "inspect the Registry owner, catalog source, and decoder contribution list before retrying App assembly",
    detail: { kind, cause }
  };
}
function createDefaultAssetCatalogSource(runtimeBinding, packIndexUrl = DEFAULT_ASSET_CATALOG_URL) {
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
      registry.configurePackIndex(DEFAULT_ASSET_CATALOG_URL);
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
function syncCameraAspect(world, canvasW, canvasH) {
  if (canvasW <= 0 || canvasH <= 0) return;
  const aspect = canvasW / canvasH;
  const query = world.query({ with: [Camera] }).unwrap();
  for (const row of query) {
    const camera = world.get(row.entity, Camera);
    if (!camera.ok) continue;
    if (camera.value.autoAspect !== true) continue;
    if (camera.value.projection !== CAMERA_PROJECTION_PERSPECTIVE) continue;
    if (camera.value.aspect === Math.fround(aspect)) continue;
    world.set(row.entity, Camera, { aspect });
  }
}

// src/internal/ecs-import.ts
var ECS_MODULE_SPECIFIER = "@forgeax/engine-ecs";
var ECS_PUBLIC_SYMBOLS = Object.freeze([
  "World",
  "Entity",
  "Update",
  "FixedUpdate",
  "Time",
  "FixedTime"
]);
function isRecord(value) {
  return value !== null && typeof value === "object";
}
function projectEcsPublicModule(value) {
  if (!isRecord(value)) return {};
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
function toArtifact(encoded) {
  return {
    kind: "rhi-tape",
    digest: encoded.digest,
    bytes: encoded.bytes
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
function ownedRendererPlugin(renderer2) {
  return {
    name: "renderer",
    provide: "renderer",
    apply(ctx) {
      ctx.provide("renderer", renderer2);
      ctx.effect(() => () => renderer2.dispose(), "render/renderer");
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

// src/internal/assets-world-plugin.ts
var ASSET_REGISTRY_RESOURCE_KEY = "AssetRegistry";
function rendererAssetsPlugin(assets2) {
  return {
    name: "renderer-assets",
    inject: ["renderer"],
    provide: "assets",
    apply(ctx) {
      if (assets2 !== void 0) ctx.provide("assets", assets2);
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

// src/internal/worker-engine-profile.ts
function workerEngineProfile(options) {
  return [
    ...options.renderer === void 0 ? [] : [ownedRendererPlugin(options.renderer)],
    renderComponentsPlugin(),
    ...options.rendererFeatureHost === void 0 ? [] : [renderFeatureHostPlugin(options.rendererFeatureHost)],
    ...options.assetAssembly === void 0 ? [rendererAssetsPlugin(options.assets)] : [assetRegistryPlugin(options.assetAssembly)],
    assetsWorldPlugin(),
    inputBackendPlugin(options.input),
    audioBackendPlugin(options.audio),
    scenePlugin(),
    animationPayloadsPlugin(options.animationPayloads),
    animationRuntimePlugin(),
    statePlugin(),
    inputPlugin(),
    ...options.extensions ?? []
  ];
}
async function attachWorkerRhiRecorder() {
  const nav = globalThis;
  const backend = nav.navigator?.gpu === void 0 ? await import('../../rhi-wgpu/dist/index.mjs') : rhiWebgpu;
  if (nav.navigator?.gpu === void 0 && typeof backend.ensureReady === "function")
    await backend.ensureReady();
  const pack = loadRhiPack(backend);
  if (pack.createShaderModule === void 0)
    throw new Error("Worker RHI capture requires a shader-module capability");
  const attached = attachRecorder({
    rhi: pack.rhi,
    createShaderModule: pack.createShaderModule,
    ...pack.createShaderModuleImmediate === void 0 ? {} : { createShaderModuleImmediate: pack.createShaderModuleImmediate }
  });
  if (!attached.ok) throw attached.error;
  return attached.value;
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
function createAppObservation(world, renderer2, execution) {
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
  let observationEntity;
  let gameCameraEntity;
  let ownershipInstalled = false;
  const rememberGameCamera = () => {
    const active = getActiveCamera(world)?.entity;
    if (active !== void 0 && active !== observationEntity && world.get(active, Camera).ok && world.get(active, Transform).ok)
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
    if (observationEntity === void 0) gameCameraEntity = source;
    if (observationEntity !== void 0) {
      if (observationEntity !== source) {
        world.set(observationEntity, Camera, cameraValue(source)).unwrap();
        world.set(observationEntity, Transform, transformValue(source)).unwrap();
      }
      setActiveCamera(world, observationEntity);
      return observationEntity;
    }
    observationEntity = world.spawn(
      { component: Camera, data: cameraValue(source) },
      { component: Transform, data: transformValue(source) }
    ).unwrap();
    setActiveCamera(world, observationEntity);
    return observationEntity;
  };
  const release = () => {
    if (observationEntity === void 0) return;
    rememberGameCamera();
    const current = observationEntity;
    observationEntity = void 0;
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
        const active = observationEntity;
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
      control: active === observationEntity ? "observer" : "game",
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
    const entity = candidate.entity === void 0 ? observationEntity ?? resolveGameCameraEntity() : candidate.entity;
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
      if (observationEntity !== void 0) {
        rememberGameCamera();
        setActiveCamera(world, observationEntity);
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
        const bounds = await renderer2.bounds(world, child);
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

// src/execution/attached-world-swap.ts
var SerializedRebuildQueue = class {
  tail = Promise.resolve();
  enqueue(action) {
    const current = this.tail.then(action, action);
    this.tail = current.catch(() => void 0);
    return current;
  }
};
async function commitAttachedWorld(renderer2, nextWorld, initializeCandidate) {
  const attached = renderer2.attach(nextWorld);
  if (!attached.ok) throw attached.error;
  try {
    if (!await initializeCandidate()) {
      attached.value.dispose();
      return false;
    }
  } catch (cause) {
    attached.value.dispose();
    throw cause;
  }
  return true;
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

// src/execution/bootstrap-entry.ts
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
function createKernelPool(options = {}) {
  const hardware = globalThis.navigator?.hardwareConcurrency ?? 2;
  const laneCount = Math.max(1, Math.min(options.lanes ?? hardware - 1, 8));
  const timeoutMs = options.timeoutMs ?? 5e3;
  const workers = Array.from(
    { length: laneCount },
    () => options.workerFactory?.() ?? new Worker(new URL("./kernel-worker-runtime.mjs", import.meta.url), {
      type: "module",
      name: "forgeax-kernel"
    })
  );
  let latest = null;
  let ready = false;
  const preflights = /* @__PURE__ */ new Map();
  const readyControl = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
  const initMessage = { kind: "kernel-init", ready: readyControl };
  for (const worker of workers) worker.postMessage(initMessage);
  const waitFor = (control, expected, label) => new Promise((resolve, reject) => {
    const started = performance.now();
    const poll = () => {
      if (Atomics.load(control, 0) === expected) {
        resolve();
        return;
      }
      if (performance.now() - started >= timeoutMs) {
        for (const worker of workers) worker.terminate();
        reject(new Error(`${label} did not complete within ${timeoutMs}ms.`));
        return;
      }
      setTimeout(poll, 1);
    };
    poll();
  });
  const readyPromise = waitFor(
    readyControl,
    workers.length,
    "SharedKernel worker initialization"
  ).then(async () => {
    for (const [moduleUrl, preflight] of preflights) {
      await waitFor(
        preflight.control,
        workers.length,
        `SharedKernel module preflight for ${moduleUrl}`
      );
      if (preflight.status.some((status) => status !== 1)) {
        throw new Error(`SharedKernel module preflight failed for ${moduleUrl}.`);
      }
    }
    ready = true;
  });
  return {
    laneCount,
    ready: () => readyPromise,
    warmup(kernel) {
      if (preflights.has(kernel.moduleUrl)) return;
      const control = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
      const status = new Int32Array(
        new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * workers.length)
      );
      preflights.set(kernel.moduleUrl, { control, status });
      for (const [jobIndex, worker] of workers.entries()) {
        const message = {
          kind: "kernel-preload",
          moduleUrl: kernel.moduleUrl,
          control,
          status,
          jobIndex
        };
        worker.postMessage(message);
      }
    },
    takeLastDispatch: () => {
      const dispatch = latest;
      latest = null;
      return dispatch;
    },
    execute(kernel, spans) {
      const preflight = preflights.get(kernel.moduleUrl);
      if (preflight === void 0) {
        this.warmup?.(kernel);
        latest = { mode: "forced-inline", dispatched: 0, completed: 0, waitMs: 0 };
        return {
          cause: new Error("SharedKernel module was not preflighted before frame dispatch."),
          dispatched: 0,
          completed: 0,
          partialWrite: false
        };
      }
      if (Atomics.load(preflight.control, 0) !== workers.length || preflight.status.some((status2) => status2 !== 1)) {
        latest = { mode: "forced-inline", dispatched: 0, completed: 0, waitMs: 0 };
        return {
          cause: new Error("SharedKernel module preflight is incomplete or failed."),
          dispatched: 0,
          completed: 0,
          partialWrite: false
        };
      }
      if (!ready && Atomics.load(readyControl, 0) === workers.length) ready = true;
      if (!ready) {
        latest = { mode: "forced-inline", dispatched: 0, completed: 0, waitMs: 0 };
        return {
          cause: new Error("SharedKernel workers were not warmed before frame dispatch."),
          dispatched: 0,
          completed: 0,
          partialWrite: false
        };
      }
      const bindings = spans.flatMap(
        ({ queryIndex, span }) => splitSharedSpan(bindSharedSpan(kernel, span, queryIndex), laneCount)
      );
      if (bindings.length === 0) {
        latest = { mode: "forced-inline", dispatched: 0, completed: 0, waitMs: 0 };
        return latest;
      }
      if (!bindings.every(isSharedSpan)) {
        latest = { mode: "forced-inline", dispatched: 0, completed: 0, waitMs: 0 };
        return {
          cause: new Error("SharedKernel received a non-SAB QuerySpan."),
          dispatched: 0,
          completed: 0,
          partialWrite: false
        };
      }
      const control = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
      const status = new Int32Array(
        new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * bindings.length)
      );
      const started = performance.now();
      for (const [index, binding] of bindings.entries()) {
        const message = {
          kind: "kernel-job",
          moduleUrl: kernel.moduleUrl,
          binding,
          control,
          status,
          jobIndex: index
        };
        workers[index % workers.length]?.postMessage(message);
      }
      while (true) {
        const observed = Atomics.load(control, 0);
        if (observed >= bindings.length) break;
        const wait = Atomics.wait(control, 0, observed, timeoutMs);
        if (wait === "timed-out") {
          for (const worker of workers) worker.terminate();
          return {
            cause: new Error(`SharedKernel deadline exceeded after ${timeoutMs}ms.`),
            dispatched: bindings.length,
            completed: observed,
            partialWrite: bindings.length > 0
          };
        }
      }
      const completed = status.reduce((count, value) => count + (value === 1 ? 1 : 0), 0);
      const failed = status.some((value) => value === -1);
      if (failed) {
        return {
          cause: new Error("SharedKernel worker failed."),
          dispatched: bindings.length,
          completed,
          partialWrite: bindings.length > 0
        };
      }
      latest = {
        mode: "shared",
        dispatched: bindings.length,
        completed,
        waitMs: performance.now() - started
      };
      return latest;
    },
    dispose() {
      for (const worker of workers) worker.terminate();
    }
  };
}

// src/execution/worker-error.ts
function serializableDetail(cause, seen = /* @__PURE__ */ new WeakSet()) {
  if (typeof cause === "function" || typeof cause === "symbol") return String(cause);
  if (typeof cause !== "object" || cause === null) return cause;
  if (seen.has(cause)) return "[Circular]";
  seen.add(cause);
  if (Array.isArray(cause)) return cause.map((value) => serializableDetail(value, seen));
  const fields = cause instanceof Error ? {
    ...cause,
    name: cause.name,
    message: cause.message,
    stack: cause.stack,
    cause: cause.cause,
    code: Reflect.get(cause, "code"),
    expected: Reflect.get(cause, "expected"),
    hint: Reflect.get(cause, "hint"),
    detail: Reflect.get(cause, "detail")
  } : cause;
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, serializableDetail(value, seen)])
  );
}
function workerError(cause) {
  const value = typeof cause === "object" && cause !== null ? cause : {};
  return {
    code: typeof value.code === "string" ? value.code : "render-worker-failed",
    expected: typeof value.expected === "string" ? value.expected : "Render Worker completes the requested operation",
    hint: typeof value.hint === "string" ? value.hint : "inspect the original cause and repair the failing producer",
    detail: serializableDetail(value.detail === void 0 ? cause : value.detail)
  };
}
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

// src/execution/source-render-worker.ts
var SourceRenderWorker = class {
  constructor(world, assets2, init, post, features = [], targets) {
    this.world = world;
    this.assets = assets2;
    this.init = init;
    this.post = post;
    this.features = features;
    this.targets = targets;
  }
  world;
  assets;
  init;
  post;
  features;
  targets;
  worker;
  publisher;
  deadline;
  epoch = 1;
  source = crypto.randomUUID();
  disposed = false;
  disposal;
  readyWait = Promise.resolve();
  resolveReady;
  replacementsWithoutFrame = 0;
  nextRequestId = 0;
  boundsRequests = /* @__PURE__ */ new Map();
  captureRequest;
  latestGpuPassTiming;
  async start(canvas) {
    if (this.disposed) return;
    const epoch = this.epoch;
    const worker = new Worker(new URL("./render-worker-runtime.mjs", import.meta.url), {
      type: "module",
      name: "forgeax-render"
    });
    this.worker = worker;
    await new Promise((resolve, reject) => {
      let ready = false;
      const failure = (cause, failure2, recoverable = failure2?.recoverable ?? true) => {
        const error = failure2?.error ?? workerError(cause);
        const detail = {
          ...error,
          stage: failure2?.stage ?? "transport",
          publication: failure2?.publication
        };
        if (this.worker !== worker) return;
        this.clear();
        if (!ready) {
          reject(Object.assign(new Error(typeof cause === "string" ? cause : error.code), error));
          return;
        }
        if (!recoverable || ++this.replacementsWithoutFrame > 1) {
          this.post({
            kind: "fault",
            source: "runtime",
            worldIdentity: this.world.identity,
            ...error,
            detail: { cause: error.detail, stage: detail.stage, publication: detail.publication },
            partialWrite: false,
            retryable: false
          });
          return;
        }
        this.readyWait = new Promise((resolve2) => {
          this.resolveReady = resolve2;
        });
        this.epoch++;
        this.post({ kind: "render-lost", epoch: this.epoch, detail: JSON.stringify(detail) });
      };
      this.deadline = setTimeout(
        () => failure("Render Worker initialization timed out"),
        this.init.startupTimeoutMs
      );
      worker.onerror = (event) => failure(event.message);
      worker.onmessage = (event) => {
        if (this.worker !== worker || this.epoch !== epoch) return;
        const message = event.data;
        if (message.kind === "bounds-result") {
          this.boundsRequests.get(message.requestId)?.finish(message.bounds);
          return;
        }
        if (message.kind === "capture-result") {
          if (this.captureRequest?.id === message.requestId)
            this.captureRequest.finish(
              message.result.ok ? ok(message.result.value) : err(message.result.error)
            );
          return;
        }
        if (message.kind === "failed") {
          failure(message.error, message);
          return;
        }
        if (message.kind === "ready") {
          clearTimeout(this.deadline);
          this.publisher = createRenderPublisher(
            this.world,
            this.assets,
            {
              source: this.source,
              epoch
            },
            message.capabilities,
            this.features,
            this.targets
          );
          ready = true;
          this.resolveReady?.();
          this.resolveReady = void 0;
          this.post({ kind: "render-ready", epoch });
          resolve();
        } else if (message.kind === "submitted") {
          try {
            const accepted = this.publisher?.acknowledgeFeatures(
              message.revision,
              message.features
            );
            if (accepted?.ok !== true) {
              failure(
                accepted?.error ?? new Error("Invalid feature acknowledgment"),
                void 0,
                false
              );
              return;
            }
          } catch (cause) {
            failure(cause, void 0, false);
            return;
          }
          this.post({ kind: "render-submitted", epoch, frame: message.frame });
        } else if (message.kind === "completed") {
          clearTimeout(this.deadline);
          const recycled = this.publisher?.recycle(message.revision, message.buffers);
          if (recycled?.ok !== true) {
            failure(
              recycled?.error ?? new Error("Invalid Render Worker buffer return"),
              void 0,
              false
            );
            return;
          }
          this.replacementsWithoutFrame = 0;
          if (message.gpuPassTiming !== void 0) {
            this.latestGpuPassTiming = {
              frameId: message.frame.frameId,
              observation: message.gpuPassTiming
            };
          }
          this.post({ kind: "render-complete", epoch, frame: message.frame });
          if (this.publisher?.inspect().inFlight) this.armFrameDeadline();
        }
      };
      worker.postMessage(
        {
          kind: "init",
          ...this.init.diagnostics?.rhiCapture === true ? { rhiCapture: true } : {},
          ...this.init.diagnostics?.gpuPassTiming === void 0 ? {} : { gpuPassTiming: this.init.diagnostics.gpuPassTiming },
          bootstrapUrl: this.init.bootstrapUrl,
          ...this.init.bootstrapData === void 0 ? {} : { bootstrapData: this.init.bootstrapData },
          canvas,
          identity: { source: this.source, epoch },
          ...this.init.shaderManifestUrl === void 0 ? {} : { shaderManifestUrl: this.init.shaderManifestUrl },
          ...this.init.build === void 0 ? {} : { build: this.init.build }
        },
        [canvas]
      );
      this.armFrameDeadline = () => {
        this.deadline = setTimeout(() => failure("Render Worker frame timed out"), 3e4);
      };
    });
  }
  armFrameDeadline = () => {
  };
  async waitUntilReady() {
    await this.readyWait;
    return !this.disposed;
  }
  publish(frame, sampleTimeSeconds) {
    const publisher = this.publisher, worker = this.worker;
    if (publisher === void 0 || worker === void 0)
      throw new Error("Render Worker is not ready");
    const wasIdle = !publisher.inspect().inFlight;
    const candidate = publisher.prepare(sampleTimeSeconds, frame.temporalReset === true).unwrap();
    try {
      worker.postMessage(
        {
          kind: "draw",
          worldIdentity: this.world.identity,
          frameId: frame.frameId,
          width: frame.canvasWidth,
          height: frame.canvasHeight,
          publication: candidate.packet
        },
        renderPublicationTransfers(candidate.packet)
      );
      candidate.accept();
      if (wasIdle) this.armFrameDeadline();
    } catch (cause) {
      candidate.discard();
      throw cause;
    }
  }
  bounds(entity) {
    const worker = this.worker;
    if (worker === void 0) return Promise.reject(new Error("Render Worker session ended"));
    const requestId = ++this.nextRequestId;
    return new Promise((resolve, reject) => {
      const remove = () => {
        clearTimeout(deadline);
        this.boundsRequests.delete(requestId);
      };
      const fail = (cause) => {
        remove();
        reject(cause);
      };
      const deadline = setTimeout(
        () => fail(new Error("Render Worker bounds request timed out")),
        3e4
      );
      this.boundsRequests.set(requestId, {
        finish: (bounds) => {
          remove();
          resolve(bounds);
        },
        fail
      });
      try {
        worker.postMessage({ kind: "bounds", requestId, entity });
      } catch (cause) {
        fail(cause instanceof Error ? cause : new Error(String(cause)));
      }
    });
  }
  captureFrame(options = {}) {
    const unavailable = (cause) => err(createRhiDebugError("capture-unavailable", { stage: "capture", cause }));
    const worker = this.worker;
    if (worker === void 0 || this.init.diagnostics?.rhiCapture !== true || options.signal?.aborted)
      return Promise.resolve(unavailable("Render Worker capture is unavailable or cancelled"));
    if (this.captureRequest !== void 0)
      return Promise.resolve(
        err(
          createRhiDebugError("capture-busy", {
            stage: "capture",
            cause: "a Render Worker capture is active"
          })
        )
      );
    const id = ++this.nextRequestId;
    return new Promise((resolve) => {
      const cancel = () => {
        worker.postMessage({ kind: "capture-cancel", requestId: id });
        finish(
          unavailable(
            "Render Worker capture was cancelled or did not complete before its deadline"
          )
        );
      };
      const deadline = setTimeout(cancel, (options.snapshotTimeoutMs ?? 3e4) + 3e4);
      const finish = (result) => {
        if (this.captureRequest?.id !== id) return;
        this.captureRequest = void 0;
        clearTimeout(deadline);
        options.signal?.removeEventListener("abort", cancel);
        resolve(result);
      };
      this.captureRequest = { id, finish };
      options.signal?.addEventListener("abort", cancel, { once: true });
      const { signal: _signal, ...configuration } = options;
      try {
        worker.postMessage({
          kind: "capture",
          requestId: id,
          options: configuration
        });
      } catch (cause) {
        finish(unavailable(String(cause)));
      }
    });
  }
  inspectGpuPassTiming() {
    return this.latestGpuPassTiming;
  }
  async replace(epoch, canvas) {
    if (epoch !== this.epoch || this.worker !== void 0 || this.disposed) return;
    await this.start(canvas);
  }
  clear() {
    for (const request of this.boundsRequests.values())
      request.fail(new Error("Render Worker session ended"));
    this.captureRequest?.finish(
      err(
        createRhiDebugError("capture-unavailable", {
          stage: "capture",
          cause: "Render Worker session ended"
        })
      )
    );
    clearTimeout(this.deadline);
    this.worker?.terminate();
    this.worker = void 0;
    this.latestGpuPassTiming = void 0;
    this.publisher?.dispose();
    this.publisher = void 0;
  }
  dispose() {
    if (this.disposal !== void 0) return this.disposal;
    this.disposed = true;
    this.resolveReady?.();
    clearTimeout(this.deadline);
    const worker = this.worker;
    this.worker = void 0;
    this.disposal = (async () => {
      try {
        if (worker !== void 0) (await shutdownWorker(worker)).unwrap();
      } finally {
        this.clear();
      }
    })();
    return this.disposal;
  }
};

// src/execution/engine-worker-runtime.ts
var scope = globalThis;
var renderer;
var assets;
var currentSample = {
  downKeys: /* @__PURE__ */ new Set(),
  upKeys: /* @__PURE__ */ new Set(),
  buttons: [false, false, false],
  movementX: 0,
  movementY: 0,
  wheelDelta: 0,
  focused: true,
  pointerLocked: false
};
var lastFrameId = 0;
var renderSampleTimeSeconds = 0;
var engineCanvas;
var realm;
var rebuildQueue = new SerializedRebuildQueue();
var inspectionQueue = [];
var activeInspectionIds = /* @__PURE__ */ new Set();
var executeScriptPromise;
function serializableEvalError(error) {
  if (error !== null && typeof error === "object") {
    const candidate = error;
    return {
      code: typeof candidate.code === "string" ? candidate.code : "worker-eval-error",
      hint: typeof candidate.message === "string" ? candidate.message : String(error)
    };
  }
  return { code: "worker-eval-error", hint: String(error) };
}
function profilePhase(session, phase, action) {
  const opened = session?.beginPhase("app", phase).ok ?? false;
  try {
    return action();
  } finally {
    if (opened) {
      try {
        session?.endPhase();
      } catch {
      }
    }
  }
}
async function executeInspection(job, target) {
  if (job.worldIdentity !== target.world.identity) {
    scope.postMessage({
      kind: "inspect-result",
      requestId: job.requestId,
      worldIdentity: target.world.identity,
      result: {
        ok: false,
        error: {
          code: "live-world-stale",
          hint: "The inspection belongs to an older World; fetch status and retry.",
          detail: { expected: job.worldIdentity, actual: target.world.identity }
        }
      }
    });
    return;
  }
  activeInspectionIds.add(job.requestId);
  let inputLease;
  try {
    scope.postMessage({
      kind: "inspect-started",
      requestId: job.requestId,
      worldIdentity: target.world.identity
    });
    executeScriptPromise ??= import('../../remote/dist/execute.mjs').then(
      (module2) => module2
    );
    const module = await executeScriptPromise;
    const importModule = createCanonicalEcsImportModule(target.world, async (specifier) => {
      const browserSpecifier = specifier.startsWith("@") ? `/@id/${specifier}` : specifier;
      return import(
        /* @vite-ignore */
        browserSpecifier
      );
    });
    inputLease = inputBackend.createInjectedLease();
    const simulation = {
      world: target.world,
      renderer,
      assets,
      input: inputLease,
      rhiCapture: target.rhiCapture,
      profiler: target.profiler,
      execution: {
        report: () => ({
          workers: target.init.workers,
          engine: { realm: "worker" },
          world: { identity: target.world.identity }
        }),
        gpuPassTiming: () => target.renderWorker?.inspectGpuPassTiming()
      }
    };
    target.observation ??= createAppObservation(
      target.world,
      renderer ?? {
        bounds: (_world, entity) => {
          if (target.renderWorker === void 0) throw new Error("Render Worker session ended");
          return target.renderWorker.bounds(entity);
        }
      },
      simulation.execution
    );
    const observation = target.observation;
    const result = await module.executeScript(job.code, {
      world: target.world,
      renderer,
      assets,
      simulation: { ...simulation, observation },
      rhiCapture: target.rhiCapture,
      profiler: target.profiler,
      execution: simulation.execution,
      importModule
    });
    scope.postMessage({
      kind: "inspect-result",
      requestId: job.requestId,
      worldIdentity: target.world.identity,
      result
    });
  } catch (error) {
    scope.postMessage({
      kind: "inspect-result",
      requestId: job.requestId,
      worldIdentity: target.world.identity,
      result: { ok: false, error: serializableEvalError(error) }
    });
  } finally {
    inputLease?.revokeInjectedLease();
    activeInspectionIds.delete(job.requestId);
  }
}
var inputBackendBase = {
  sample: () => currentSample,
  detach: () => {
  }
};
var inputBackend = makeCompositeBackend(inputBackendBase);
function sharedKernelPlugin(target) {
  return {
    name: "shared-kernel-executor",
    inject: ["world"],
    apply(ctx) {
      const executor = {
        warmup(kernel) {
          target.kernelPool ??= createKernelPool();
          target.kernelPool.warmup?.(kernel);
        },
        execute(kernel, spans) {
          target.kernelPool ??= createKernelPool();
          return target.kernelPool.execute(kernel, spans);
        }
      };
      ctx.effect(() => {
        ctx.world.insertResource("SharedKernelExecutor", executor);
        return () => {
          ctx.world.removeResource("SharedKernelExecutor");
          target.kernelPool?.dispose();
          target.kernelPool = void 0;
        };
      }, "execution/shared-kernel");
    }
  };
}
function postFault(source, code, expected, hint, cause, partialWrite = false) {
  scope.postMessage({
    kind: "fault",
    worldIdentity: realm?.world.identity ?? null,
    source,
    code,
    expected,
    hint,
    detail: serializableDetail(cause),
    partialWrite,
    retryable: false
  });
}
async function disposeRealm(target) {
  let renderFailure;
  try {
    await target.renderWorker?.dispose();
  } catch (cause) {
    renderFailure = cause;
  }
  target.observation?.release();
  target.observation = void 0;
  try {
    target.profiler?.activeSession()?.finish();
  } catch {
  }
  target.releaseProfilerCatalog?.();
  target.releaseProfilerCatalog = void 0;
  try {
    await target.pluginContext?.fiber.dispose();
  } finally {
    target.pluginContext = void 0;
    target.publicationTargets?.dispose();
    target.assetAssembly?.dispose();
    target.assetAssembly = void 0;
    await target.rhiAttachment?.dispose();
    target.rhiAttachment = void 0;
    target.rhiCapture = void 0;
    target.pendingAudioIntents = [];
  }
  if (renderFailure !== void 0) throw renderFailure;
}
function postBootstrapFault(error) {
  postFault("bootstrap", error.code, error.expected, error.hint, error.detail);
}
async function createRealm(init) {
  const preparedResult = await prepareBootstrapEntry(init.bootstrapUrl, init.bootstrapData);
  if (!preparedResult.ok) {
    postBootstrapFault(preparedResult.error);
    return false;
  }
  const prepared = preparedResult.value;
  const sourceFeatures = [...prepared.features ?? []];
  const nextWorld = new World({
    ...init.time !== void 0 ? { time: init.time } : {},
    storage: init.workers.kernels.enabled ? "shared" : "local"
  });
  const profiler = init.diagnostics?.profiler === true ? createProfiler() : void 0;
  const profilerCatalog = profiler?.registerPhaseCatalog("app", APP_PHASE_CATALOG);
  const candidate = {
    world: nextWorld,
    init,
    assetAssembly: void 0,
    pendingAudioIntents: [],
    kernelPool: void 0,
    pluginContext: void 0,
    observation: void 0,
    profiler,
    releaseProfilerCatalog: profilerCatalog?.ok === true ? profilerCatalog.value : void 0,
    rhiCapture: void 0,
    rhiAttachment: void 0,
    profilerCaptureId: void 0,
    profilerFrameId: 0
  };
  const audioBackend = createAudioIntentBackend({
    emit: (intent) => candidate.pendingAudioIntents.push(intent)
  });
  let candidateRenderer;
  let rendererLifecycleTransferred = false;
  let rhiLifecycleTransferred = false;
  const previousRenderer = renderer;
  let previousSurfaceReleased = false;
  try {
    if (previousRenderer !== void 0) {
      const released = previousRenderer.releaseSurface();
      if (!released.ok) throw released.error;
      previousSurfaceReleased = true;
    }
    const runtimeBinding = init.assetCatalog?.runtimeBinding;
    const bundler = init.shaderManifestUrl === void 0 && init.build === void 0 && runtimeBinding === void 0 ? void 0 : {
      ...init.shaderManifestUrl === void 0 ? {} : { shaderManifestUrl: init.shaderManifestUrl },
      ...init.build === void 0 ? {} : { build: init.build },
      ...runtimeBinding === void 0 ? {} : { importTransport: createDevImportTransport(runtimeBinding) }
    };
    const rendererOptions = {
      ...prepared.features === void 0 ? {} : { features: prepared.features },
      ...profiler === void 0 ? {} : { profiler },
      ...init.diagnostics?.gpuPassTiming === void 0 ? {} : { gpuPassTiming: init.diagnostics.gpuPassTiming }
    };
    if (init.diagnostics?.rhiCapture === true && !init.workers.render.enabled) {
      const attachment = await attachWorkerRhiRecorder();
      candidate.rhiAttachment = attachment;
      candidate.rhiCapture = createRhiCapture(attachment);
      Object.assign(rendererOptions, {
        rhi: attachment.backend.rhi,
        rhiInstrumentation: createRhiInstrumentation(attachment)
      });
    }
    const split = init.workers.render.enabled;
    if (split) candidate.publicationTargets = new RenderPublicationTargetOwner();
    if (split) {
      for (const plugin of prepared.plugins ?? []) {
        if ("renderer" in Inject.resolve(plugin.inject))
          throw new RenderPublicationError({
            reason: "unsupported",
            subject: `source plugin ${plugin.name ?? "anonymous"} requires the child Renderer`
          });
      }
    }
    const constructed = split ? void 0 : await constructRuntimeRendererHost(init.canvas, rendererOptions, bundler);
    if (constructed !== void 0 && !constructed.ok) throw constructed.error;
    const host = constructed?.ok === true ? constructed.value : void 0;
    candidateRenderer = host?.renderer;
    if (candidateRenderer !== void 0) await prepared.configureRenderer?.(candidateRenderer);
    assets = host?.assets ?? await createPublicationAssets(bundler);
    const catalogSource = init.assetCatalog === void 0 ? void 0 : createCatalogSource({
      url: init.assetCatalog.url,
      ...init.assetCatalog.expectedScope === void 0 ? {} : { expectedScope: init.assetCatalog.expectedScope }
    });
    const assetAssemblyResult = createAssetRuntimeAssembly(assets, {
      ...catalogSource === void 0 ? {} : { catalogSource },
      ...runtimeBinding === void 0 ? {} : { runtimeBinding }
    });
    if (!assetAssemblyResult.ok) throw assetAssemblyResult.error;
    candidate.assetAssembly = assetAssemblyResult.value;
    rendererLifecycleTransferred = true;
    const renderTargets = candidate.publicationTargets?.authoring ?? candidateRenderer;
    const pluginContext = await createWorldContext(
      nextWorld,
      workerEngineProfile({
        ...candidateRenderer === void 0 ? {} : { renderer: candidateRenderer },
        rendererFeatureHost: host === void 0 ? {
          async installFeature(feature) {
            if (prepared.features?.includes(feature)) {
              if (!sourceFeatures.includes(feature)) sourceFeatures.push(feature);
              let released = false;
              return {
                ok: true,
                value: {
                  async release() {
                    if (!released) {
                      released = true;
                      const index = sourceFeatures.indexOf(feature);
                      if (index >= 0) sourceFeatures.splice(index, 1);
                    }
                    return { ok: true, value: void 0 };
                  }
                }
              };
            }
            return {
              ok: false,
              error: new RenderPublicationError({
                reason: "unsupported",
                subject: `RenderFeature ${feature.identity}`
              })
            };
          }
        } : createRenderFeatureHost(host.featureHost),
        assets,
        input: inputBackend,
        audio: audioBackend,
        assetAssembly: assetAssemblyResult.value,
        animationPayloads: createAnimationPayloadLookup(assetAssemblyResult.value.registry),
        extensions: [
          ...init.workers.kernels.enabled ? [sharedKernelPlugin(candidate)] : [],
          executionBootstrapHostPlugin({
            ...renderTargets === void 0 ? {} : { renderTargets },
            ...split ? {} : { canvas: init.canvas },
            ...init.bootstrapPort === void 0 ? {} : { port: init.bootstrapPort },
            setPointerLockAllowed(allowed) {
              scope.postMessage({
                kind: "host-control",
                command: "set-pointer-lock-allowed",
                allowed
              });
            }
          }),
          ...prepared.plugins ?? []
        ]
      })
    );
    candidate.pluginContext = pluginContext;
    const activeRenderer = candidateRenderer;
    const previousRealm = realm;
    await candidate.kernelPool?.ready();
    const committed = candidateRenderer === void 0 ? true : await commitAttachedWorld(candidateRenderer, nextWorld, async () => true);
    if (!committed) {
      await disposeRealm(candidate);
      if (previousSurfaceReleased) previousRenderer?.restoreSurface();
      return false;
    }
    if (split) {
      candidate.renderWorker = new SourceRenderWorker(
        nextWorld,
        assets,
        init,
        (message) => scope.postMessage(message),
        sourceFeatures,
        candidate.publicationTargets
      );
      await candidate.renderWorker.start(init.canvas);
      if (init.diagnostics?.rhiCapture === true) candidate.rhiCapture = candidate.renderWorker;
      engineCanvas = void 0;
    }
    inputBackend.revokeInjectedLease();
    realm = candidate;
    renderer = activeRenderer;
    rhiLifecycleTransferred = candidate.rhiAttachment !== void 0;
    lastFrameId = 0;
    renderSampleTimeSeconds = 0;
    if (previousRealm !== void 0) await disposeRealm(previousRealm);
    return true;
  } catch (cause) {
    await disposeRealm(candidate);
    if (!rendererLifecycleTransferred) candidateRenderer?.dispose();
    if (!rhiLifecycleTransferred) candidate.rhiAttachment = void 0;
    if (previousSurfaceReleased) previousRenderer?.restoreSurface();
    throw cause;
  }
}
async function initialize(message) {
  try {
    engineCanvas = message.canvas;
    if (!await createRealm(message)) return;
    scope.postMessage({
      kind: "ready",
      worldIdentity: realm?.world.identity ?? "",
      realm: "worker",
      workerWebGpu: typeof navigator === "object" && navigator.gpu !== void 0
    });
  } catch (cause) {
    postFault(
      "bootstrap",
      "app-execution-bootstrap-failed",
      "Engine Worker creates a realm-local World, Renderer and GPU owner",
      "inspect the worker bootstrap cause and module URL",
      cause
    );
  }
}
async function runFrame(message) {
  const activeRealm = realm;
  const activeRenderer = renderer;
  if (activeRealm === void 0 || activeRenderer === void 0 && activeRealm.renderWorker === void 0)
    return;
  const { world } = activeRealm;
  if (message.worldIdentity !== world.identity || message.frameId <= lastFrameId) return;
  if (activeRenderer !== void 0 && activeRenderer.state() !== "alive") return;
  if (activeRealm.renderWorker !== void 0 && !await activeRealm.renderWorker.waitUntilReady())
    return;
  if (realm !== activeRealm) return;
  currentSample = message.inputSample;
  const sampleTimeSeconds = message.sampleTimeSeconds === void 0 ? renderSampleTimeSeconds + message.deltaSeconds : message.sampleTimeSeconds;
  const canvasWidth = Number.isFinite(message.canvasWidth) && message.canvasWidth > 0 ? Math.max(1, Math.floor(message.canvasWidth)) : void 0;
  const canvasHeight = Number.isFinite(message.canvasHeight) && message.canvasHeight > 0 ? Math.max(1, Math.floor(message.canvasHeight)) : void 0;
  if (canvasWidth !== void 0 && canvasHeight !== void 0) {
    if (engineCanvas !== void 0) {
      if (engineCanvas.width !== canvasWidth) engineCanvas.width = canvasWidth;
      if (engineCanvas.height !== canvasHeight) engineCanvas.height = canvasHeight;
    }
    syncCameraAspect(world, canvasWidth, canvasHeight);
  }
  const inspections = inspectionQueue.splice(0, inspectionQueue.length);
  for (const inspection of inspections) void executeInspection(inspection, activeRealm);
  const started = performance.now();
  const profileSession = activeRealm.profiler?.activeSession();
  let profileFrame;
  if (profileSession !== void 0) {
    if (activeRealm.profilerCaptureId !== profileSession.captureId) {
      activeRealm.profilerCaptureId = profileSession.captureId;
      activeRealm.profilerFrameId = 0;
    }
    const frame = profileSession.beginFrame(++activeRealm.profilerFrameId);
    if (frame.ok) {
      profileFrame = {
        captureId: profileSession.captureId,
        frameId: activeRealm.profilerFrameId
      };
    }
  }
  try {
    const update = profilePhase(
      profileSession,
      "world-update-primary",
      () => world.update(message.deltaSeconds)
    );
    if (!update.ok) throw update.error;
    if (world.execution.health === "poisoned") {
      const fault = world.execution.fault;
      postFault(
        "world",
        fault?.code ?? "world-poisoned",
        "World remains healthy through update",
        "rebuild the poisoned World explicitly",
        fault,
        fault?.partialWrite ?? true
      );
      return;
    }
    const updateFinished = performance.now();
    const kernelDispatch = activeRealm.kernelPool?.takeLastDispatch() ?? null;
    const kernelMetrics = kernelDispatch === null ? {} : {
      kernelDispatch: {
        eligible: true,
        usedShared: kernelDispatch.mode === "shared",
        reason: kernelDispatch.mode === "shared" ? "shared" : "forced-inline",
        dispatched: kernelDispatch.dispatched,
        completed: kernelDispatch.completed
      }
    };
    activeRealm.observation?.prepareFrame();
    if (activeRealm.renderWorker !== void 0) {
      activeRealm.renderWorker.publish(message, sampleTimeSeconds);
      renderSampleTimeSeconds = sampleTimeSeconds;
      lastFrameId = message.frameId;
      const audioIntents2 = activeRealm.pendingAudioIntents;
      activeRealm.pendingAudioIntents = [];
      scope.postMessage({
        kind: "simulation-complete",
        worldIdentity: world.identity,
        frameId: message.frameId,
        engineUpdateMs: updateFinished - started,
        kernelWaitMs: kernelDispatch?.waitMs ?? 0,
        ...kernelMetrics,
        ...audioIntents2.length ? { audioIntents: audioIntents2 } : {}
      });
      return;
    }
    if (activeRenderer === void 0) return;
    const attached = activeRenderer.attach(world);
    if (!attached.ok) throw attached.error;
    const draw = profilePhase(
      profileSession,
      "renderer-draw",
      () => activeRenderer.draw({
        leases: [attached.value],
        camera: { lease: attached.value },
        environment: { lease: attached.value },
        sampleTimeSeconds,
        ...message.temporalReset ? { temporalReset: true } : {},
        ...profileFrame === void 0 ? {} : { profileFrame }
      })
    );
    if (!draw.ok) throw draw.error;
    if (Number.isFinite(sampleTimeSeconds)) renderSampleTimeSeconds = sampleTimeSeconds;
    scope.postMessage({
      kind: "frame-submitted",
      worldIdentity: world.identity,
      frameId: message.frameId,
      deviceGeneration: draw.value.deviceGeneration,
      ...draw.value.graphGeneration === void 0 ? {} : { graphGeneration: draw.value.graphGeneration },
      ...draw.value.barrelDistortion === void 0 ? {} : { barrelDistortion: draw.value.barrelDistortion }
    });
    const completed = await draw.value.completed;
    if (!completed.ok) throw completed.error;
    lastFrameId = message.frameId;
    const audioIntents = activeRealm.pendingAudioIntents;
    activeRealm.pendingAudioIntents = [];
    scope.postMessage({
      kind: "frame-complete",
      worldIdentity: world.identity,
      frameId: message.frameId,
      deviceGeneration: draw.value.deviceGeneration,
      ...draw.value.graphGeneration === void 0 ? {} : { graphGeneration: draw.value.graphGeneration },
      ...draw.value.barrelDistortion === void 0 ? {} : { barrelDistortion: draw.value.barrelDistortion },
      presentation: draw.value.presentation,
      engineUpdateMs: updateFinished - started,
      kernelWaitMs: kernelDispatch?.waitMs ?? 0,
      ...audioIntents.length > 0 ? { audioIntents } : {},
      ...kernelMetrics
    });
  } catch (cause) {
    const fault = world.execution.fault;
    postFault(
      fault === null ? "runtime" : "world",
      fault?.code ?? "app-system-update-failed",
      "World update completes before Renderer draw",
      fault === null ? "inspect the runtime cause" : "rebuild the poisoned World explicitly",
      cause,
      fault?.partialWrite ?? false
    );
  } finally {
    if (profileFrame !== void 0) {
      try {
        profileSession?.endFrame();
      } catch {
      }
    }
  }
}
async function rebuild(message) {
  const activeRealm = realm;
  if (activeRealm === void 0 || renderer === void 0 && activeRealm.renderWorker === void 0 || message.worldIdentity !== activeRealm.world.identity)
    return;
  const previousWorldIdentity = activeRealm.world.identity;
  try {
    const cancelled = inspectionQueue.splice(0, inspectionQueue.length);
    for (const job of cancelled) {
      scope.postMessage({
        kind: "inspect-result",
        requestId: job.requestId,
        worldIdentity: previousWorldIdentity,
        result: {
          ok: false,
          error: {
            code: "live-world-stale",
            hint: "The World was rebuilt before inspection admission.",
            detail: { worldIdentity: previousWorldIdentity }
          }
        }
      });
    }
    const canvas = message.canvas ?? engineCanvas;
    if (canvas === void 0) throw new Error("World rebuild requires a fresh rendering canvas");
    await activeRealm.renderWorker?.dispose();
    const init = { ...activeRealm.init, canvas };
    if (!await createRealm(init)) return;
    scope.postMessage({
      kind: "rebuilt",
      previousWorldIdentity,
      worldIdentity: realm?.world.identity ?? ""
    });
  } catch (cause) {
    postFault(
      "rebuild",
      "app-execution-rebuild-failed",
      "bootstrap creates a fresh World identity",
      "inspect the bootstrap cause or create a new App",
      cause
    );
  }
}
scope.onmessage = (event) => {
  const message = event.data;
  if (message.kind === "render-replace") {
    void realm?.renderWorker?.replace(message.epoch, message.canvas).catch(
      (cause) => postFault(
        "runtime",
        "render-worker-recovery-failed",
        "replacement Renderer starts",
        "inspect replacement failure",
        cause
      )
    );
  } else if (message.kind === "init") void initialize(message);
  else if (message.kind === "frame") void runFrame(message);
  else if (message.kind === "inspect") inspectionQueue.push(message);
  else if (message.kind === "inspect-cancel") {
    const index = inspectionQueue.findIndex((job) => job.requestId === message.requestId);
    if (index >= 0) {
      const [cancelled] = inspectionQueue.splice(index, 1);
      if (cancelled !== void 0) {
        scope.postMessage({
          kind: "inspect-canceled",
          requestId: cancelled.requestId,
          worldIdentity: realm?.world.identity ?? cancelled.worldIdentity,
          admitted: false
        });
      }
    } else {
      scope.postMessage({
        kind: "inspect-canceled",
        requestId: message.requestId,
        worldIdentity: realm?.world.identity ?? message.worldIdentity,
        admitted: true
      });
    }
  } else if (message.kind === "rebuild") {
    void rebuildQueue.enqueue(() => rebuild(message));
  } else if (message.kind === "dispose") {
    void (async () => {
      const target = realm;
      realm = void 0;
      inspectionQueue.length = 0;
      try {
        if (target !== void 0) await disposeRealm(target);
        scope.postMessage({ kind: "disposed" });
      } catch (cause) {
        scope.postMessage({ kind: "disposed", error: serializableDetail(cause) });
      } finally {
        target?.init.bootstrapPort?.close();
        scope.close();
      }
    })();
  } else if (message.kind === "input-clear") {
    inputBackend.revokeInjectedLease();
  } else if (message.kind === "input-lease-open") {
    inputBackend.beginInjectedLease();
  } else if (message.kind === "profile-finish") {
    try {
      const current = realm;
      const active = current?.profiler?.activeSession();
      if (active !== void 0 && (message.worldIdentity === void 0 || current?.world.identity === message.worldIdentity) && (message.captureId === void 0 || active.captureId === message.captureId)) {
        active.finish();
      }
    } catch {
    }
  }
};
