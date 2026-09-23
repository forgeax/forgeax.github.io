import * as rhiWebgpu from '../../rhi-webgpu/dist/index.mjs';
export { acquireCanvasContext } from '../../rhi-webgpu/dist/index.mjs';
import { animationClipContribution, animationGraphContribution } from '../../animation/dist/index.mjs';
import { err, ok } from '../../types/dist/index.mjs';
export { AssetError, MATERIAL_PARAM_TYPES } from '../../types/dist/index.mjs';
import { defineComponent, Time, componentDefinition } from '../../ecs/dist/index.mjs';
import { sceneAssetContribution, externalizeSceneAsset, collectSubtree, worldGetSceneInstanceState, sceneEntityAddressKey, worldGetSceneAssetForInstance, SCENE_COLLECT_PROFILE } from '../../scene/dist/index.mjs';
import { fontContribution } from '../../font/dist/index.mjs';
import { meshAssetContribution } from '../../geometry/dist/index.mjs';
import { tilesetContribution, videoContribution } from '../../graphics-extras/dist/index.mjs';
import { textureContribution, equirectContribution } from '../../image/dist/index.mjs';
import { materialContribution, samplerContribution, renderPipelineContribution, SceneInstance } from '../../render/dist/index.mjs';
import { skeletonContribution, skinContribution } from '../../skinning/dist/index.mjs';
import { particleEffectContribution } from '../../vfx/dist/index.mjs';
import { EngineEnvironmentError, constructRendererHost, loadRhiPack as loadRhiPack$1 } from '../../render/dist/construct-renderer.mjs';
export { EngineEnvironmentError } from '../../render/dist/construct-renderer.mjs';
import { SceneCollectAssetGuidUnresolvedError, resolveAssetHandle, SceneCollectEntityRefOutOfClosureError, builtinMeshGuid } from '../../assets-runtime/dist/index.mjs';
import '../../audio-webaudio/dist/index.mjs';
import '../../shader/dist/index.mjs';
import { err as err$1, ok as ok$1, RhiError } from '../../rhi/dist/index.mjs';
export { RhiError } from '../../rhi/dist/index.mjs';
import { SpriteAnimationInvalidError, fillComponentDefaults } from '../../ecs/dist/projection/index.mjs';
import { SpriteAnimation, spritePlaybackModeFromU32, SpriteRegionOverride } from '../../render/dist/authoring.mjs';
export { quat } from '../../math/dist/index.mjs';
import { classifyEntityField } from '../../ecs/dist/externalization/index.mjs';
import { componentSchema } from '../../ecs/dist/internal.mjs';

// src/index.ts
var audioContribution = {
  kind: { kind: "audio" },
  consumer: "AudioBackend",
  decoder: {
    async decode({ envelope, artifacts }) {
      const payload = envelope.payload;
      if (payload !== null && typeof payload === "object") {
        const source = payload;
        let bytes = source.bytes instanceof Uint8Array ? source.bytes : Array.isArray(source.bytes) ? Uint8Array.from(source.bytes) : void 0;
        const body = envelope.artifacts.body ?? envelope.artifacts.source;
        if (body !== void 0) {
          const bodyBytes = await artifacts.read(body);
          if (!bodyBytes.ok) return bodyBytes;
          bytes = bodyBytes.value;
        }
        if (source.kind === "audio" && typeof source.mediaType === "string" && source.mediaType.startsWith("audio/") && bytes !== void 0 && bytes.byteLength > 0) {
          return ok({
            kind: "audio",
            sourceKey: typeof source.sourceKey === "string" && source.sourceKey.length > 0 ? source.sourceKey : envelope.guid,
            mediaType: source.mediaType,
            bytes
          });
        }
      }
      return err({
        code: "asset-package-invalid",
        expected: "an audio payload with non-empty source bytes and audio mediaType",
        hint: "recook the audio source with a browser-supported media type",
        detail: { guid: envelope.guid, reason: "audio owner validation failed" }
      });
    }
  }
};
defineComponent("AudioSource", {
  clip: { type: "shared<AudioClipAsset>" },
  playing: { type: "bool", default: false },
  loop: { type: "bool", default: false },
  volume: { type: "f32", default: 1 },
  spatialBlend: { type: "f32", default: 0 },
  bus: { type: "string", default: "sfx" }
});
defineComponent("AudioListener", {});
var typedDefaultAssetDecoderContributions = [
  meshAssetContribution,
  materialContribution,
  sceneAssetContribution,
  textureContribution,
  equirectContribution,
  samplerContribution,
  fontContribution,
  renderPipelineContribution,
  tilesetContribution,
  videoContribution,
  skeletonContribution,
  skinContribution,
  animationClipContribution,
  animationGraphContribution,
  audioContribution,
  particleEffectContribution
];
var defaultAssetDecoderContributions = Object.freeze(
  typedDefaultAssetDecoderContributions
);
function loadRhiPack(mod, instrumentation) {
  const backendInstrumentation = mod.instrumentation;
  const resolvedInstrumentation = instrumentation ?? backendInstrumentation;
  return loadRhiPack$1(mod, resolvedInstrumentation);
}
async function loadBackendPack(options, preferWgpu = false) {
  const explicit = options?.rhi;
  if (explicit !== void 0 && explicit !== null) {
    return ok$1(loadRhiPack({ rhi: explicit, ...explicit }, options?.rhiInstrumentation));
  }
  const nav = typeof globalThis === "undefined" ? void 0 : globalThis.navigator;
  if (!preferWgpu && nav?.gpu !== void 0 && nav.gpu !== null) {
    return ok$1(
      loadRhiPack(rhiWebgpu, options?.rhiInstrumentation)
    );
  }
  try {
    const mod = await import('../../rhi-wgpu/dist/index.mjs');
    await mod.ensureReady();
    return ok$1(loadRhiPack(mod, options?.rhiInstrumentation));
  } catch (cause) {
    return err$1(
      new RhiError({
        code: "rhi-not-available",
        expected: "a usable RHI backend is available",
        hint: `failed to load wgpu backend: ${String(cause)}`
      })
    );
  }
}

// src/renderer-host.ts
var FALLBACK_ERROR_CODES = /* @__PURE__ */ new Set([
  "adapter-unavailable",
  "request-adapter-threw",
  "feature-not-enabled",
  "limit-exceeded",
  "rhi-not-available",
  "device-lost",
  "oom"
]);
function canFallbackToWgpu(error) {
  if (!(error instanceof EngineEnvironmentError)) return false;
  const webgpuError = error.detail.webgpuError;
  if (webgpuError === void 0 || typeof webgpuError !== "object") return false;
  if (!("code" in webgpuError)) return false;
  const code = webgpuError.code;
  return typeof code === "string" && FALLBACK_ERROR_CODES.has(code);
}
async function constructRuntimeRendererHost(canvas, options, bundler) {
  const first = await loadBackendPack(options);
  if (!first.ok) throw first.error;
  const constructed = await constructRendererHost(canvas, options, bundler, first.value);
  if (constructed.ok || options?.rhi !== void 0 || typeof globalThis === "undefined" || !canFallbackToWgpu(constructed.error)) {
    return constructed;
  }
  const fallback = await loadBackendPack(options, true);
  if (!fallback.ok) return constructed;
  return constructRendererHost(canvas, options, bundler, fallback.value);
}

// src/createRenderer.ts
async function createRenderer(canvas, options, bundler) {
  if (options !== void 0 && "rhi" in options && options.rhi === void 0) {
    return err(new EngineEnvironmentError("no usable rendering backend"));
  }
  const rendererOptions = options === void 0 ? void 0 : {
    ...options.rhi === void 0 ? {} : { rhi: options.rhi },
    ...options.features === void 0 ? {} : { features: options.features },
    ...options.profiler === void 0 ? {} : { profiler: options.profiler },
    ...options.captureGpuTimings === void 0 ? {} : { captureGpuTimings: options.captureGpuTimings },
    ...options.captureReflectionFallbackReadback === void 0 ? {} : { captureReflectionFallbackReadback: options.captureReflectionFallbackReadback },
    ...options.rhiInstrumentation === void 0 ? {} : { rhiInstrumentation: options.rhiInstrumentation },
    ...options.standardProfile === void 0 ? {} : { standardProfile: options.standardProfile },
    ...options.gpuPassTiming === void 0 ? {} : { gpuPassTiming: options.gpuPassTiming },
    ...options.ssrIdentity === void 0 ? {} : { ssrIdentity: options.ssrIdentity }
  };
  try {
    const constructed = await constructRuntimeRendererHost(canvas, rendererOptions, bundler);
    if (!constructed.ok) return err(constructed.error);
    return ok(constructed.value.renderer);
  } catch (cause) {
    if (cause instanceof EngineEnvironmentError) return err(cause);
    const detail = cause instanceof Error ? cause : new Error(String(cause));
    return err(new EngineEnvironmentError("renderer construction failed", { webgpuError: detail }));
  }
}

// src/dev-import-transport.ts
function createDevImportTransport(binding) {
  return {
    async fetchPack(guid, scope) {
      const active = binding;
      if (active === void 0 || active.status !== "ready" || scope === void 0 || scope.status !== "ready" || scope.scopeId !== active.scopeId || scope.generation !== active.generation) {
        return { ok: false };
      }
      try {
        const base = active.importUrlBase.replace(/\/+$/, "");
        const response = await fetch(`${base}/${encodeURIComponent(guid)}`, { method: "POST" });
        if (!response.ok) {
          try {
            const fail = await response.json();
            console.warn(
              `[forgeax] import failed for ${guid} (HTTP ${response.status}): ${fail.code ?? fail.error ?? "import-failed"} - ${fail.reason ?? ""}` + (fail.hint ? ` | hint: ${fail.hint}` : "")
            );
          } catch {
          }
          return { ok: false };
        }
        try {
          const body = await response.json();
          if (Array.isArray(body)) return { ok: true, entries: body };
        } catch {
        }
        return { ok: true };
      } catch {
        return { ok: false };
      }
    }
  };
}
function spriteAnimationTickSystem(world) {
  const dt = world.getResource(Time).delta;
  const entities = collectAnimEntities(world);
  let firstError = null;
  for (const entity of entities) {
    const entryError = tickEntity(world, entity, dt);
    if (entryError !== null && firstError === null) {
      firstError = entryError;
    }
  }
  if (firstError !== null) {
    return err(firstError);
  }
  return ok(void 0);
}
function collectAnimEntities(world) {
  const queryResult = world.query({ with: [SpriteAnimation] });
  if (!queryResult.ok) return [];
  const entities = [];
  for (const row of queryResult.value) entities.push(row.entity);
  return entities;
}
function tickEntity(world, entity, dt) {
  const snapRes = world.get(entity, SpriteAnimation);
  if (!snapRes.ok) {
    return null;
  }
  const snap = snapRes.value;
  const frameCount = snap.frameCount;
  const frameDuration = snap.frameDuration;
  const regions = snap.regions;
  if (regions.length !== frameCount * 4) {
    return new SpriteAnimationInvalidError({
      field: "regions-length",
      regionsLength: regions.length,
      frameCount
    });
  }
  if (!(frameDuration > 0)) {
    return new SpriteAnimationInvalidError({
      field: "frame-duration",
      frameDuration
    });
  }
  const advanced = advanceFrame(
    snap.currentFrame,
    snap.accumDt + dt,
    frameDuration,
    frameCount,
    snap.playbackMode
  );
  const writeAnim = world.set(entity, SpriteAnimation, {
    currentFrame: advanced.currentFrame,
    accumDt: advanced.accumDt
  });
  if (!writeAnim.ok) return null;
  const sliceStart = advanced.currentFrame * 4;
  const region = new Float32Array([
    regions[sliceStart] ?? 0,
    regions[sliceStart + 1] ?? 0,
    regions[sliceStart + 2] ?? 0,
    regions[sliceStart + 3] ?? 0
  ]);
  writeOverride(world, entity, region);
  return null;
}
function advanceFrame(currentFrameIn, accumDtIn, frameDuration, frameCount, playbackModeRaw) {
  let currentFrame = currentFrameIn;
  let accumDt = accumDtIn;
  const playback = spritePlaybackModeFromU32(playbackModeRaw);
  while (accumDt >= frameDuration) {
    accumDt -= frameDuration;
    switch (playback) {
      case "loop": {
        currentFrame = (currentFrame + 1) % frameCount;
        break;
      }
      case "clamp": {
        if (currentFrame < frameCount - 1) {
          currentFrame += 1;
        }
        break;
      }
    }
  }
  return { currentFrame, accumDt };
}
function writeOverride(world, entity, region) {
  const added = world.addComponent(entity, {
    component: SpriteRegionOverride,
    data: { region }
  });
  if (!added.ok && added.error.code === "component-already-present") {
    world.set(entity, SpriteRegionOverride, { region });
  }
}
function excludedComponentNames() {
  return /* @__PURE__ */ new Set(["Entity", "ChildOf", "Children"]);
}
function normalize(value) {
  if (Array.isArray(value) || value instanceof Uint32Array || value instanceof Float32Array || value instanceof Int32Array || value instanceof Float64Array || value instanceof Uint8Array || value instanceof Int16Array || value instanceof Uint16Array) {
    return Array.from(value);
  }
  return value;
}
function valuesEqual(a, b) {
  return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
}
function baselineFields(comp, sourceRaw) {
  const filled = fillComponentDefaults(comp, sourceRaw ?? {});
  const out = {};
  const fields = componentDefinition(comp).fields;
  for (const fieldName of Object.keys(componentSchema(comp))) {
    if (fields[fieldName]?.transient) continue;
    out[fieldName] = filled[fieldName];
  }
  return out;
}
function liveFields(world, entity, comp) {
  const res = world.get(entity, comp);
  if (!res.ok) return void 0;
  const val = res.value;
  const out = {};
  const fields = componentDefinition(comp).fields;
  const schema = componentSchema(comp);
  for (const fieldName of Object.keys(schema)) {
    if (fields[fieldName]?.transient) continue;
    const fieldType = schema[fieldName];
    if (fieldType === "entity" || fieldType === "array<entity>") continue;
    out[fieldName] = normalize(val[fieldName]);
  }
  return out;
}
function foldMountOverrides(world, state) {
  const sourceRes = resolveAssetHandle(
    world,
    state.source
  );
  if (!sourceRes.ok) return [];
  const source = sourceRes.value;
  const excluded = excludedComponentNames();
  const registered = world.components.entries();
  const overrides = [];
  const members = [];
  for (const [entity, lid] of state.entityToLocalId) {
    members.push([entity, lid]);
  }
  members.sort((a, b) => a[1] - b[1]);
  for (const [entity, lid] of members) {
    const sourceKey = state.keyByLocalId.get(lid);
    const sourceNode = sourceKey === void 0 ? void 0 : source.entities[sourceKey];
    const sourceComps = sourceNode?.components ?? {};
    for (const [compName, compToken] of registered) {
      if (excluded.has(compName)) continue;
      if (componentDefinition(compToken).policy.transient) continue;
      const comp = compToken;
      if (Object.keys(componentSchema(comp)).length === 0) continue;
      const live = liveFields(world, entity, comp);
      if (live === void 0) continue;
      const sourceRaw = sourceComps[compName];
      if (sourceRaw === void 0) {
        overrides.push({
          localId: lid,
          comp: compName,
          value: live
        });
        continue;
      }
      const baseline = baselineFields(comp, sourceRaw);
      for (const fieldName of Object.keys(live)) {
        if (!valuesEqual(live[fieldName], baseline[fieldName])) {
          overrides.push({
            localId: lid,
            comp: compName,
            field: fieldName,
            value: live[fieldName]
          });
        }
      }
    }
  }
  return overrides;
}

// src/collect-scene-asset.ts
function _isArrayLike(value) {
  return Array.isArray(value) || ArrayBuffer.isView(value) && !(value instanceof DataView);
}
function _normalizeArray(value) {
  return Array.from(value);
}
function classifyFieldSchema(fieldType) {
  if (fieldType === void 0) return void 0;
  if (fieldType.startsWith("shared<")) return { kind: "shared", scalar: true };
  if (fieldType.startsWith("array<shared<")) return { kind: "shared", scalar: false };
  return void 0;
}
function _handleToGuid(world, registry, handle, field) {
  if (handle === 0) return ok$1(void 0);
  const builtinGuid = builtinMeshGuid(handle);
  if (builtinGuid !== void 0) return ok$1(builtinGuid);
  const assetRes = resolveAssetHandle(world, handle);
  if (!assetRes.ok) return err$1(new SceneCollectAssetGuidUnresolvedError(field, handle));
  const guid = registry.guidOf(assetRes.value);
  if (guid === void 0) return err$1(new SceneCollectAssetGuidUnresolvedError(field, handle));
  return ok$1(guid);
}
function _serializeSharedFieldValue(world, registry, classification, value, field) {
  if (classification.scalar) {
    if (typeof value !== "number") return ok$1(value);
    return _handleToGuid(world, registry, value, field);
  }
  if (!Array.isArray(value)) return ok$1(value);
  const mapped = [];
  for (const elem of value) {
    if (typeof elem !== "number") {
      mapped.push(elem);
      continue;
    }
    const g = _handleToGuid(world, registry, elem, field);
    if (!g.ok) return g;
    mapped.push(g.value ?? 0);
  }
  return ok$1(mapped);
}
function _serializeOverrideValueHandles(world, registry, ov) {
  const comp = world.components.resolve(ov.comp);
  const schema = comp === void 0 ? void 0 : componentSchema(comp);
  if (ov.field !== void 0) {
    const classification = schema ? classifyFieldSchema(schema[ov.field]) : void 0;
    if (!classification || classification.kind !== "shared") return ok$1(ov.value);
    const conv = _serializeSharedFieldValue(world, registry, classification, ov.value, ov.field);
    if (!conv.ok) return conv;
    return ok$1(conv.value ?? 0);
  }
  if (typeof ov.value !== "object" || ov.value === null || Array.isArray(ov.value)) {
    return ok$1(ov.value);
  }
  const src = ov.value;
  const out = {};
  for (const fieldName of Object.keys(src)) {
    const classification = schema ? classifyFieldSchema(schema[fieldName]) : void 0;
    if (!classification || classification.kind !== "shared") {
      out[fieldName] = src[fieldName];
      continue;
    }
    const conv = _serializeSharedFieldValue(
      world,
      registry,
      classification,
      src[fieldName],
      fieldName
    );
    if (!conv.ok) return conv;
    if (classification.scalar && conv.value === void 0) continue;
    out[fieldName] = conv.value;
  }
  return ok$1(out);
}
function isSceneEntityAddress(value) {
  return typeof value === "string" || value.length > 0;
}
function collectKeyedSceneAsset(world, registry, _roots, visited, ownedEntities, legacyEntities, mounts, anchors, memberOrigin) {
  const sceneInstanceToken = world.components.resolve("SceneInstance");
  const childOfToken = world.components.resolve("ChildOf");
  const stateInfos = [];
  if (sceneInstanceToken !== void 0) {
    const queryResult = world.query({ read: [SceneInstance] });
    if (queryResult.ok) {
      for (const row of queryResult.value) {
        const stateResult = worldGetSceneInstanceState(world, row.entity);
        if (!stateResult.ok) continue;
        const rowValue = row.get(SceneInstance);
        stateInfos.push({
          root: row.entity,
          state: stateResult.value,
          mapping: Uint32Array.from(rowValue.mapping)
        });
      }
    }
  }
  const stateByRoot = /* @__PURE__ */ new Map();
  for (const info of stateInfos) stateByRoot.set(info.root, info);
  const parentByChildRoot = /* @__PURE__ */ new Map();
  const relationCandidates = [];
  for (const child of stateInfos) {
    if (child.state.instanceKey === void 0 || childOfToken === void 0) continue;
    const parentResult = world.get(
      child.root,
      childOfToken
    );
    if (!parentResult.ok) continue;
    const carrier = parentResult.value.parent;
    if (carrier === void 0) continue;
    for (const parent of stateInfos) {
      const bound = parent.state.bindings.get(sceneEntityAddressKey(child.state.instanceKey));
      if (bound === carrier) {
        parentByChildRoot.set(child.root, parent);
        relationCandidates.push({ child, parent, key: child.state.instanceKey });
        break;
      }
    }
  }
  const findSequence = (haystack, needle, start) => {
    if (needle.length === 0) return start;
    for (let index = Math.max(0, start); index + needle.length <= haystack.length; index += 1) {
      let match = true;
      for (let offset = 0; offset < needle.length; offset += 1) {
        if (haystack[index + offset] !== needle[offset]) {
          match = false;
          break;
        }
      }
      if (match) return index;
    }
    return void 0;
  };
  const relations = [];
  for (const candidate of relationCandidates) {
    const slot = [...candidate.parent.state.keyByLocalId.entries()].find(
      ([, value]) => value === candidate.key
    )?.[0];
    if (slot === void 0) continue;
    const memberFirst = findSequence(candidate.parent.mapping, candidate.child.mapping, slot + 1);
    if (memberFirst === void 0) continue;
    relations.push({ ...candidate, memberFirst });
  }
  const relationsByParent = /* @__PURE__ */ new Map();
  for (const relation of relations) {
    const list = relationsByParent.get(relation.parent.root);
    if (list === void 0) relationsByParent.set(relation.parent.root, [relation]);
    else list.push(relation);
  }
  const statePrefixMemo = /* @__PURE__ */ new Map();
  const statePrefix = (info, stack = /* @__PURE__ */ new Set()) => {
    const prior = statePrefixMemo.get(info.root);
    if (prior !== void 0) return prior;
    if (stack.has(info.root)) return [];
    if (info.state.instanceKey === void 0) {
      statePrefixMemo.set(info.root, []);
      return [];
    }
    const next = new Set(stack);
    next.add(info.root);
    const parent = parentByChildRoot.get(info.root);
    const prefix = parent === void 0 ? [info.state.instanceKey] : [...statePrefix(parent, next), info.state.instanceKey];
    statePrefixMemo.set(info.root, prefix);
    return prefix;
  };
  const stateSlotAddress = (info, slot, prefix, stack = /* @__PURE__ */ new Set()) => {
    if (slot < 0 || stack.has(info.root)) return void 0;
    const key = info.state.keyByLocalId.get(slot);
    if (key !== void 0) return [...prefix, key];
    const next = new Set(stack);
    next.add(info.root);
    for (const relation of relationsByParent.get(info.root) ?? []) {
      const end = relation.memberFirst + relation.child.mapping.length;
      if (slot >= relation.memberFirst && slot < end) {
        return stateSlotAddress(
          relation.child,
          slot - relation.memberFirst,
          [...prefix, relation.key],
          next
        );
      }
    }
    return void 0;
  };
  const rawToAddress = /* @__PURE__ */ new Map();
  const orderedStates = [...stateInfos].sort(
    (a, b) => statePrefix(a).length - statePrefix(b).length
  );
  for (const info of orderedStates) {
    const prefix = statePrefix(info);
    for (let slot = 0; slot < info.mapping.length; slot += 1) {
      const raw = info.mapping[slot];
      if (raw === void 0 || raw === 4294967295 || !visited.has(raw)) continue;
      const address = stateSlotAddress(info, slot, prefix);
      if (address !== void 0 && !rawToAddress.has(raw)) rawToAddress.set(raw, address);
    }
  }
  for (const [raw, origin] of memberOrigin) {
    if (!visited.has(raw) || rawToAddress.has(raw)) continue;
    const child = stateByRoot.get(origin.anchorRaw);
    if (child === void 0) continue;
    const address = stateSlotAddress(child, origin.memberLocalId, statePrefix(child));
    if (address !== void 0) rawToAddress.set(raw, address);
  }
  const generatedKeys = /* @__PURE__ */ new Set();
  const keyForOwnedRaw = /* @__PURE__ */ new Map();
  for (let index = 0; index < ownedEntities.length; index += 1) {
    const raw = ownedEntities[index];
    const known = rawToAddress.get(raw);
    let key = known?.length === 1 ? known[0] : void 0;
    if (key === void 0 || key.length === 0 || generatedKeys.has(key)) {
      const base = `entity-${index}`;
      key = base;
      let suffix = 1;
      while (generatedKeys.has(key)) key = `${base}-${suffix++}`;
    }
    generatedKeys.add(key);
    keyForOwnedRaw.set(raw, key);
    rawToAddress.set(raw, [key]);
  }
  const slotAddress = (slot) => {
    if (slot >= 0 && slot < ownedEntities.length) {
      const raw = ownedEntities[slot];
      const key = raw === void 0 ? void 0 : keyForOwnedRaw.get(raw);
      return key;
    }
    const mountIndex = mounts.findIndex((mount) => mount.localId === slot);
    if (mountIndex >= 0) {
      const anchor = anchors[mountIndex];
      const child = anchor === void 0 ? void 0 : stateByRoot.get(anchor.entityRaw);
      const key = child?.state.instanceKey;
      if (key !== void 0) return key;
    }
    for (let index = 0; index < mounts.length; index += 1) {
      const mount = mounts[index];
      if (mount === void 0) continue;
      const first = mount.memberFirst;
      if (slot < first || slot >= first + mount.memberCount) continue;
      const anchor = anchors[index];
      const child = anchor === void 0 ? void 0 : stateByRoot.get(anchor.entityRaw);
      const mountKey = child?.state.instanceKey;
      if (child === void 0 || mountKey === void 0) return void 0;
      const address = stateSlotAddress(child, slot - first, []);
      if (address === void 0) return void 0;
      return [mountKey, ...address];
    }
    const top = orderedStates.find((info) => statePrefix(info).length === 0);
    if (top !== void 0) {
      const address = stateSlotAddress(top, slot, []);
      if (address !== void 0) {
        return address.length === 1 ? address[0] : address;
      }
    }
    return void 0;
  };
  const convertComponents = (entityRaw, source) => {
    const out = {};
    for (const [componentName, rawFields] of Object.entries(source)) {
      const token = world.components.resolve(componentName);
      if (token === void 0) {
        out[componentName] = { ...rawFields };
        continue;
      }
      const converted = {};
      for (const [fieldName, value] of Object.entries(rawFields)) {
        const kind = classifyEntityField(token, fieldName);
        if (kind === null) {
          converted[fieldName] = value;
          continue;
        }
        const convertSlot = (localSlot) => {
          if (typeof localSlot !== "number") return void 0;
          return slotAddress(localSlot);
        };
        if (kind.isArray) {
          if (!Array.isArray(value)) {
            return err$1(
              new SceneCollectEntityRefOutOfClosureError(
                entityRaw,
                `${componentName}.${fieldName}`,
                -1
              )
            );
          }
          const addresses = [];
          for (const item of value) {
            const address = convertSlot(item);
            if (address === void 0 || !isSceneEntityAddress(address)) {
              return err$1(
                new SceneCollectEntityRefOutOfClosureError(
                  entityRaw,
                  `${componentName}.${fieldName}`,
                  Number(item)
                )
              );
            }
            addresses.push(address);
          }
          converted[fieldName] = addresses;
        } else if (value === null) {
          converted[fieldName] = null;
        } else {
          const address = convertSlot(value);
          if (address === void 0 || !isSceneEntityAddress(address)) {
            return err$1(
              new SceneCollectEntityRefOutOfClosureError(
                entityRaw,
                `${componentName}.${fieldName}`,
                Number(value)
              )
            );
          }
          converted[fieldName] = address;
        }
      }
      out[componentName] = converted;
    }
    return ok$1(out);
  };
  const entities = {};
  for (const legacy of legacyEntities) {
    const raw = ownedEntities[legacy.localId];
    if (raw === void 0) continue;
    const key = keyForOwnedRaw.get(raw);
    const converted = convertComponents(raw, legacy.components);
    if (!converted.ok) return converted;
    entities[key] = { components: converted.value };
  }
  const resolveOverrideTarget = (child, memberFirst, localId) => {
    if (child === void 0) return void 0;
    const target = stateSlotAddress(child, localId - memberFirst, []);
    if (target === void 0 || target.length === 0) return void 0;
    return target;
  };
  const convertOverrideValue = (entityRaw, componentName, fieldName, value) => {
    const token = world.components.resolve(componentName);
    if (token === void 0) return ok$1(value);
    const schema = componentSchema(token);
    const convertFields = (field, fieldValue) => {
      const kind = classifyEntityField(token, field);
      if (kind === null) {
        const sharedType = schema[field];
        const shared = sharedType?.startsWith("shared<") ? { scalar: true } : sharedType?.startsWith("array<shared<") ? { scalar: false } : void 0;
        if (shared === void 0) return ok$1(fieldValue);
        return _serializeSharedFieldValue(world, registry, shared, fieldValue, field);
      }
      const resolveLiveOrSlot = (item) => {
        if (typeof item !== "number") return void 0;
        const live = rawToAddress.get(item);
        if (live !== void 0) {
          return live.length === 1 ? live[0] : live;
        }
        return slotAddress(item);
      };
      if (kind.isArray) {
        if (!Array.isArray(fieldValue)) return ok$1(fieldValue);
        const mapped = [];
        for (const item of fieldValue) {
          const address2 = resolveLiveOrSlot(item);
          if (address2 === void 0 || !isSceneEntityAddress(address2)) {
            return err$1(
              new SceneCollectEntityRefOutOfClosureError(
                entityRaw,
                `${componentName}.${field}`,
                Number(item)
              )
            );
          }
          mapped.push(address2);
        }
        return ok$1(mapped);
      }
      if (fieldValue === null) return ok$1(null);
      const address = resolveLiveOrSlot(fieldValue);
      if (address === void 0 || !isSceneEntityAddress(address)) {
        return err$1(
          new SceneCollectEntityRefOutOfClosureError(
            entityRaw,
            `${componentName}.${field}`,
            Number(fieldValue)
          )
        );
      }
      return ok$1(address);
    };
    if (fieldName !== void 0) return convertFields(fieldName, value);
    if (typeof value !== "object" || value === null || Array.isArray(value)) return ok$1(value);
    const result = {};
    for (const [field, fieldValue] of Object.entries(value)) {
      const converted = convertFields(field, fieldValue);
      if (!converted.ok) return converted;
      result[field] = converted.value;
    }
    return ok$1(result);
  };
  const declarationOverrides = (parent, child, mount, anchor) => {
    const memberFirst = mount.memberFirst;
    const candidates = [];
    if (parent !== void 0) {
      for (const override of parent.state.mountTimeOverrides) {
        const localId = override.localId;
        if (localId >= memberFirst && localId < memberFirst + mount.memberCount)
          candidates.push(override);
      }
      for (const [localId, records] of parent.state.overrides) {
        const numeric = localId;
        if (numeric < memberFirst || numeric >= memberFirst + mount.memberCount) continue;
        for (const record of records.values()) {
          candidates.push({
            localId,
            comp: record.comp,
            ...record.field === void 0 ? {} : { field: record.field },
            value: record.value
          });
        }
      }
    }
    if (candidates.length === 0) candidates.push(...mount.overrides ?? []);
    if (candidates.length === 0 || child === void 0) return ok$1(void 0);
    const byTarget = /* @__PURE__ */ new Map();
    for (const override of candidates) {
      const localId = override.localId;
      const target = resolveOverrideTarget(child, memberFirst, localId);
      if (target === void 0) {
        return err$1(
          new SceneCollectEntityRefOutOfClosureError(
            anchor.entityRaw,
            "instance.override.target",
            localId
          )
        );
      }
      const converted = convertOverrideValue(
        anchor.entityRaw,
        override.comp,
        override.field,
        override.value
      );
      if (!converted.ok) return converted;
      const targetKey = JSON.stringify(target);
      const prior = byTarget.get(targetKey);
      const components = {};
      if (prior !== void 0) {
        for (const [name, fields] of Object.entries(
          prior.components
        )) {
          components[name] = { ...fields };
        }
      }
      const priorFields = components[override.comp];
      const existing = { ...priorFields ?? {} };
      if (override.field === void 0 && typeof converted.value === "object" && converted.value !== null) {
        Object.assign(existing, converted.value);
      } else if (override.field !== void 0) {
        existing[override.field] = converted.value;
      }
      components[override.comp] = existing;
      byTarget.set(targetKey, { target, components });
    }
    return ok$1([...byTarget.values()]);
  };
  for (let index = 0; index < mounts.length; index += 1) {
    const mount = mounts[index];
    const anchor = anchors[index];
    if (mount === void 0 || anchor === void 0) continue;
    const child = stateByRoot.get(anchor.entityRaw);
    const parent = child === void 0 ? void 0 : parentByChildRoot.get(child.root);
    const instanceKey = child?.state.instanceKey ?? `instance-${index}`;
    const carrierRaw = childOfToken === void 0 ? void 0 : (() => {
      const parentResult = world.get(
        anchor.entityRaw,
        childOfToken
      );
      return parentResult.ok ? parentResult.value.parent : void 0;
    })();
    const converted = convertComponents(
      carrierRaw ?? anchor.entityRaw,
      mount.components ?? {}
    );
    if (!converted.ok) return converted;
    if (mount.parent !== void 0) {
      const parentAddress = slotAddress(mount.parent);
      if (parentAddress === void 0) {
        return err$1(
          new SceneCollectEntityRefOutOfClosureError(
            carrierRaw ?? anchor.entityRaw,
            "ChildOf.parent",
            mount.parent
          )
        );
      }
      converted.value.ChildOf = { parent: parentAddress };
    }
    const overrides = declarationOverrides(parent, child, mount, anchor);
    if (!overrides.ok) return overrides;
    entities[instanceKey] = {
      components: converted.value,
      instance: {
        source: String(mount.source),
        ...overrides.value === void 0 ? {} : { overrides: overrides.value }
      }
    };
  }
  return ok$1({ kind: "scene", entities });
}
function serializeSceneAssetToPack(sceneAsset, components, guid) {
  const externalized = externalizeSceneAsset(sceneAsset, (componentName) => {
    const component = components.get(componentName);
    return component === void 0 ? void 0 : componentSchema(component);
  });
  if (!externalized.ok) {
    const value = externalized.error.value;
    return err$1(
      new SceneCollectAssetGuidUnresolvedError(
        externalized.error.field,
        typeof value === "string" || typeof value === "number" ? value : String(value)
      )
    );
  }
  return ok$1({
    schemaVersion: "2.0.0",
    kind: "internal-text-package",
    assets: [
      {
        guid: guid ?? crypto.randomUUID(),
        kind: "scene",
        payload: externalized.value.payload,
        refs: externalized.value.refs.map((reference) => reference.guid),
        artifacts: {}
      }
    ]
  });
}
function rootsToSceneAsset(registry, world, roots) {
  const collectProfile = SCENE_COLLECT_PROFILE;
  const visited = /* @__PURE__ */ new Set();
  for (const root of roots) collectSubtree(world, root, visited);
  if (visited.size === 0) return ok$1({ kind: "scene", entities: {} });
  const rootRawSet = /* @__PURE__ */ new Set();
  for (const r of roots) rootRawSet.add(r);
  const anchorEntities = /* @__PURE__ */ new Set();
  for (const er of visited) {
    if (world.get(er, SceneInstance).ok) anchorEntities.add(er);
  }
  const anchorsSorted = [...anchorEntities].sort((a, b) => a - b);
  const memberEntities = /* @__PURE__ */ new Set();
  const memberOrigin = /* @__PURE__ */ new Map();
  for (const er of anchorsSorted) {
    if (rootRawSet.has(er)) continue;
    const sr = worldGetSceneInstanceState(world, er);
    if (!sr.ok) continue;
    const retainedState = sr.value;
    for (const [me, lid] of retainedState.entityToLocalId) {
      const mr = me;
      if (visited.has(mr) && !anchorEntities.has(mr) && !memberEntities.has(mr)) {
        memberEntities.add(mr);
        memberOrigin.set(mr, { anchorRaw: er, memberLocalId: lid });
      }
    }
    for (const [key, member] of retainedState.bindings) {
      const mr = member;
      const localId = [...retainedState.keyByLocalId.entries()].find(
        ([, value]) => sceneEntityAddressKey(value) === key
      )?.[0];
      if (localId !== void 0 && visited.has(mr) && !anchorEntities.has(mr) && !memberEntities.has(mr)) {
        memberEntities.add(mr);
        memberOrigin.set(mr, { anchorRaw: er, memberLocalId: localId });
      }
    }
  }
  const childOfForAnchor = world.components.resolve("ChildOf");
  if (childOfForAnchor !== void 0) {
    for (const anchorRaw of [...anchorEntities]) {
      if (rootRawSet.has(anchorRaw) || memberEntities.has(anchorRaw)) continue;
      const parentRes = world.get(
        anchorRaw,
        childOfForAnchor
      );
      if (!parentRes.ok) continue;
      const carrierRaw = parentRes.value.parent;
      const origin = carrierRaw === void 0 ? void 0 : memberOrigin.get(carrierRaw);
      if (origin !== void 0) {
        memberEntities.add(anchorRaw);
        memberOrigin.set(anchorRaw, origin);
      }
    }
  }
  for (const er of anchorEntities) {
    if (memberEntities.has(er) && !rootRawSet.has(er)) anchorEntities.delete(er);
  }
  for (const [raw, origin] of memberOrigin) {
    if (anchorEntities.has(origin.anchorRaw)) continue;
    const original = world.get(origin.anchorRaw, SceneInstance);
    const mappedRaw = original.ok ? original.value.mapping[origin.memberLocalId] : raw;
    for (const anchor of anchorEntities) {
      if (rootRawSet.has(anchor)) continue;
      const instance = world.get(anchor, SceneInstance);
      if (!instance.ok || mappedRaw === void 0) continue;
      const slot = Array.from(instance.value.mapping).indexOf(mappedRaw);
      if (slot < 0) continue;
      memberOrigin.set(raw, { anchorRaw: anchor, memberLocalId: slot });
      break;
    }
  }
  const childOfTk0 = world.components.resolve("ChildOf");
  const childrenTk0 = world.components.resolve("Children");
  const carrierAllowed = /* @__PURE__ */ new Set(["Transform", "GlobalTransform", "Children", "ChildOf", "Entity"]);
  const carrierForAnchor = /* @__PURE__ */ new Map();
  const carrierToAnchor = /* @__PURE__ */ new Map();
  const isMountCarrier = (p, anchorRaw) => {
    if (rootRawSet.has(p)) return false;
    if (anchorEntities.has(p) || memberEntities.has(p)) return false;
    if (!visited.has(p)) return false;
    for (const [compName, compToken] of world.components.entries()) {
      if (carrierAllowed.has(compName)) continue;
      if (world.get(p, compToken).ok) return false;
    }
    if (childrenTk0) {
      const cr = world.get(p, childrenTk0);
      if (cr.ok) {
        const kids = cr.value.entities;
        if (kids) {
          let visitedKidCount = 0;
          let sawAnchor = false;
          for (let i = 0; i < kids.length; i++) {
            const k = kids[i];
            if (!visited.has(k)) continue;
            visitedKidCount += 1;
            if (k === anchorRaw) sawAnchor = true;
          }
          if (!sawAnchor || visitedKidCount !== 1) return false;
        }
      }
    }
    return true;
  };
  if (childOfTk0) {
    for (const anchorRaw of anchorsSorted) {
      if (!anchorEntities.has(anchorRaw)) continue;
      if (rootRawSet.has(anchorRaw)) continue;
      const cr = world.get(anchorRaw, childOfTk0);
      if (!cr.ok) continue;
      const pRaw = cr.value.parent;
      if (pRaw === void 0) continue;
      if (!carrierToAnchor.has(pRaw) && isMountCarrier(pRaw, anchorRaw)) {
        carrierForAnchor.set(anchorRaw, pRaw);
        carrierToAnchor.set(pRaw, anchorRaw);
      }
    }
  }
  const orderedEntities = [...visited];
  const ownedEntities = [];
  for (const er of orderedEntities) {
    if (carrierToAnchor.has(er)) continue;
    if (rootRawSet.has(er) && anchorEntities.has(er)) continue;
    if (!anchorEntities.has(er) && !memberEntities.has(er)) {
      ownedEntities.push(er);
    }
  }
  const entityToLocalId = /* @__PURE__ */ new Map();
  for (let i = 0; i < ownedEntities.length; i++) {
    const e = ownedEntities[i];
    if (e !== void 0) entityToLocalId.set(e, i);
  }
  const nonRootAnchors = [];
  for (const er of anchorEntities) {
    if (rootRawSet.has(er)) continue;
    const sh = worldGetSceneAssetForInstance(world, er);
    if (!sh.ok)
      return err$1(
        new SceneCollectAssetGuidUnresolvedError(
          "SceneInstance.source",
          sh.error
        )
      );
    const pr = resolveAssetHandle(
      world,
      sh.value
    );
    if (!pr.ok)
      return err$1(
        new SceneCollectAssetGuidUnresolvedError(
          "SceneInstance.source",
          sh.value
        )
      );
    const g = registry.guidOf(pr.value);
    if (g === void 0)
      return err$1(
        new SceneCollectAssetGuidUnresolvedError(
          "SceneInstance.source",
          sh.value
        )
      );
    const sr = worldGetSceneInstanceState(world, er);
    if (!sr.ok)
      return err$1(new SceneCollectAssetGuidUnresolvedError("SceneInstance.source", "state"));
    nonRootAnchors.push({ entityRaw: er, sourceGuid: g, totalSlots: sr.value.totalSlots });
  }
  const bfsIdx = /* @__PURE__ */ new Map();
  for (let i = 0; i < orderedEntities.length; i++) {
    if (orderedEntities[i] !== void 0) bfsIdx.set(orderedEntities[i], i);
  }
  nonRootAnchors.sort((a, b) => (bfsIdx.get(a.entityRaw) ?? 0) - (bfsIdx.get(b.entityRaw) ?? 0));
  const ownedCount = ownedEntities.length;
  const outMounts = [];
  let nextMF = ownedCount + nonRootAnchors.length;
  const childOfTk = world.components.resolve("ChildOf");
  const transformTk = world.components.resolve("Transform");
  for (const a of nonRootAnchors) {
    const carrierRaw = carrierForAnchor.get(a.entityRaw);
    const parentSourceRaw = carrierRaw ?? a.entityRaw;
    let mp;
    if (childOfTk) {
      const cr = world.get(parentSourceRaw, childOfTk);
      if (cr.ok) {
        const pRaw = cr.value.parent;
        if (pRaw !== void 0) {
          const ol = entityToLocalId.get(pRaw);
          if (ol !== void 0) mp = ol;
          else {
            const mo = memberOrigin.get(pRaw);
            if (mo !== void 0) {
              const ai = nonRootAnchors.findIndex((x) => x.entityRaw === mo.anchorRaw);
              if (ai >= 0) mp = ownedCount + ai;
            }
          }
        }
      }
    }
    let mountComponents;
    if (carrierRaw !== void 0 && transformTk) {
      const tr = world.get(carrierRaw, transformTk);
      if (tr.ok) {
        mountComponents = {
          Transform: Object.fromEntries(
            Object.entries(tr.value).map(([key, value]) => [
              key,
              _isArrayLike(value) ? _normalizeArray(value) : value
            ])
          )
        };
      }
    }
    const memberFirst0 = nextMF;
    let mountOverrides;
    const foldStateRes = worldGetSceneInstanceState(world, a.entityRaw);
    if (foldStateRes.ok) {
      const rawOverrides = foldMountOverrides(world, foldStateRes.value);
      if (rawOverrides.length > 0) {
        mountOverrides = [];
        for (const ov of rawOverrides) {
          const convRes = _serializeOverrideValueHandles(world, registry, ov);
          if (!convRes.ok) return convRes;
          mountOverrides.push({
            ...ov,
            localId: memberFirst0 + ov.localId,
            value: convRes.value
          });
        }
      }
    }
    const mount = {
      localId: ownedCount + outMounts.length,
      source: a.sourceGuid,
      memberFirst: nextMF,
      memberCount: a.totalSlots,
      ...mp !== void 0 ? { parent: mp } : {},
      ...mountComponents !== void 0 ? { components: mountComponents } : {},
      ...mountOverrides !== void 0 && mountOverrides.length > 0 ? { overrides: mountOverrides } : {}
    };
    outMounts.push(mount);
    nextMF += a.totalSlots;
  }
  function _rlid(t) {
    const ol = entityToLocalId.get(t);
    if (ol !== void 0) return ol;
    const absorbedAnchor = carrierToAnchor.get(t);
    if (absorbedAnchor !== void 0) {
      for (let i = 0; i < nonRootAnchors.length; i++) {
        if (nonRootAnchors[i]?.entityRaw === absorbedAnchor) return ownedCount + i;
      }
    }
    for (let i = 0; i < nonRootAnchors.length; i++) {
      if (nonRootAnchors[i]?.entityRaw === t) return ownedCount + i;
    }
    const mo = memberOrigin.get(t);
    if (mo !== void 0) {
      for (let i = 0; i < nonRootAnchors.length; i++) {
        if (nonRootAnchors[i]?.entityRaw === mo.anchorRaw) {
          let mf = ownedCount + nonRootAnchors.length;
          for (let j = 0; j < i; j++) mf += nonRootAnchors[j]?.totalSlots ?? 0;
          return mf + mo.memberLocalId;
        }
      }
    }
    return void 0;
  }
  const registeredComps = world.components.entries();
  const legacyEntities = [];
  for (let lid = 0; lid < ownedEntities.length; lid++) {
    const entityRaw = ownedEntities[lid];
    if (entityRaw === void 0) continue;
    const entity = entityRaw;
    const components = {};
    const isRoot = rootRawSet.has(entityRaw);
    for (const [compName, compToken] of registeredComps) {
      if (!collectProfile.includeComponent(
        compName,
        componentDefinition(compToken).policy.transient === true
      ))
        continue;
      if (isRoot && compName === "ChildOf") continue;
      const valRes = world.get(entity, compToken);
      if (!valRes.ok) continue;
      const val = valRes.value;
      const comp = compToken;
      if (comp === void 0) continue;
      const schema = componentSchema(comp);
      const schemaKeys = Object.keys(schema);
      if (schemaKeys.length === 0) {
        components[compName] = {};
        continue;
      }
      const fieldValues = {};
      for (const fieldName of schemaKeys) {
        const rawValue = val[fieldName];
        if (rawValue === void 0) continue;
        if (!collectProfile.includeField(
          compName,
          fieldName,
          componentDefinition(comp).fields[fieldName]?.transient === true
        ))
          continue;
        const schemaFieldType = schema[fieldName];
        const entityKind = classifyEntityField(comp, fieldName);
        const sharedClass = schemaFieldType !== void 0 ? classifyFieldSchema(schemaFieldType) : void 0;
        if (!entityKind && !sharedClass) {
          if (_isArrayLike(rawValue)) {
            fieldValues[fieldName] = _normalizeArray(rawValue);
          } else {
            fieldValues[fieldName] = rawValue;
          }
          continue;
        }
        if (entityKind !== null) {
          if (!entityKind.isArray && typeof rawValue === "number" && rootRawSet.has(rawValue) && anchorEntities.has(rawValue)) {
            continue;
          }
          if (entityKind.isArray) {
            const arr = _isArrayLike(rawValue) ? _normalizeArray(rawValue) : rawValue;
            const mapped = [];
            for (const elem of arr) {
              const lid2 = _rlid(elem);
              if (lid2 === void 0) {
                return err$1(
                  new SceneCollectEntityRefOutOfClosureError(entityRaw, fieldName, elem)
                );
              }
              mapped.push(lid2);
            }
            fieldValues[fieldName] = mapped;
          } else {
            if (rawValue === null) continue;
            const lid2 = _rlid(rawValue);
            if (lid2 === void 0) {
              return err$1(
                new SceneCollectEntityRefOutOfClosureError(
                  entityRaw,
                  fieldName,
                  rawValue
                )
              );
            }
            fieldValues[fieldName] = lid2;
          }
        } else {
          const normalized = _isArrayLike(rawValue) ? _normalizeArray(rawValue) : rawValue;
          if (sharedClass === void 0) {
            fieldValues[fieldName] = normalized;
            continue;
          }
          const conv = _serializeSharedFieldValue(
            world,
            registry,
            sharedClass,
            normalized,
            fieldName
          );
          if (!conv.ok) return conv;
          if (sharedClass.scalar && conv.value === void 0) continue;
          fieldValues[fieldName] = conv.value;
        }
      }
      if (Object.keys(fieldValues).length > 0) components[compName] = fieldValues;
    }
    legacyEntities.push({ localId: lid, components });
  }
  return collectKeyedSceneAsset(
    world,
    registry,
    roots,
    visited,
    ownedEntities,
    legacyEntities,
    outMounts,
    nonRootAnchors,
    memberOrigin
  );
}

export { createDevImportTransport, createRenderer, defaultAssetDecoderContributions, rootsToSceneAsset, serializeSceneAssetToPack, spriteAnimationTickSystem };
