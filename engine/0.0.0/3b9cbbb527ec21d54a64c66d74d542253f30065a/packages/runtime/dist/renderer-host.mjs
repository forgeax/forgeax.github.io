import { AssetRegistry } from '../../assets-runtime/dist/index.mjs';
import { audioLoader } from '../../audio-webaudio/dist/index.mjs';
import { loadRhiPack as loadRhiPack$1, constructRendererHost, EngineEnvironmentError } from '../../render/dist/construct-renderer.mjs';
import { ShaderRegistry } from '../../shader/dist/index.mjs';
import { ok, err, RhiError } from '../../rhi/dist/index.mjs';
import * as rhiWebgpu from '../../rhi-webgpu/dist/index.mjs';
import { collectSubtree, Name } from '../../scene/dist/index.mjs';
import { Skin } from '../../skinning/dist/index.mjs';

// src/renderer-host.ts
function loadRhiPack(mod, instrumentation) {
  const backendInstrumentation = mod.instrumentation;
  const resolvedInstrumentation = instrumentation ?? backendInstrumentation;
  return loadRhiPack$1(mod, resolvedInstrumentation);
}
async function loadBackendPack(options, preferWgpu = false) {
  const explicit = options?.rhi;
  if (explicit !== void 0 && explicit !== null) {
    return ok(loadRhiPack({ rhi: explicit, ...explicit }, options?.rhiInstrumentation));
  }
  const nav = typeof globalThis === "undefined" ? void 0 : globalThis.navigator;
  if (!preferWgpu && nav?.gpu !== void 0 && nav.gpu !== null) {
    return ok(
      loadRhiPack(rhiWebgpu, options?.rhiInstrumentation)
    );
  }
  try {
    const mod = await import('../../rhi-wgpu/dist/index.mjs');
    await mod.ensureReady();
    return ok(loadRhiPack(mod, options?.rhiInstrumentation));
  } catch (cause) {
    return err(
      new RhiError({
        code: "rhi-not-available",
        expected: "a usable RHI backend is available",
        hint: `failed to load wgpu backend: ${String(cause)}`
      })
    );
  }
}
function postSpawnResolveJoints(world, resolver, spawnRoot) {
  const subtree = collectSubtree(world, spawnRoot);
  const nameIndex = /* @__PURE__ */ new Map();
  const nameQuery = world.query({ read: [Name] });
  if (nameQuery.ok) {
    for (const row of nameQuery.value) {
      if (!subtree.has(row.entity)) continue;
      const nameVal = row.get(Name).value;
      const list = nameIndex.get(nameVal) ?? [];
      list.push(row.entity);
      nameIndex.set(nameVal, list);
    }
  }
  const skinQuery = world.query({ read: [Skin] });
  if (!skinQuery.ok) return { ok: true };
  for (const queryRow of skinQuery.value) {
    const entity = queryRow.entity;
    if (!subtree.has(entity)) continue;
    const skeletonHandle = queryRow.get(Skin).skeleton;
    const skinAsset = resolver.resolveSkinAsset(skeletonHandle);
    if (skinAsset === void 0) {
      return {
        ok: false,
        error: {
          code: "skin-asset-unresolved",
          expected: `SkinAsset registered for skeleton handle ${skeletonHandle} when instantiate triggers postSpawnResolveJoints`,
          hint: `SkinAsset matching skeletonGuid for handle ${skeletonHandle} was not found in AssetRegistry; verify the SceneAsset.skinGuids[] cross-edge is populated by the importer (gltfImporter scene branch) and that loadByGuid<SceneAsset> recursively loaded each SkinAsset before instantiate (browser-async-pack-fetch path)`,
          detail: { skinEntity: entity, skeletonHandle }
        }
      };
    }
    const jointEntityList = [];
    for (const jointPath of skinAsset.jointPaths) {
      const pathSegments = jointPath.split("/").filter(Boolean);
      if (pathSegments.length === 0) continue;
      const leafName = pathSegments[pathSegments.length - 1];
      if (leafName === void 0) continue;
      const nameMatches = nameIndex.get(leafName);
      if (nameMatches === void 0 || nameMatches.length === 0) {
        return {
          ok: false,
          error: {
            code: "skin-joint-path-unresolved",
            expected: `joint entity with Name="${leafName}" exists in the spawned subtree (root entity ${spawnRoot})`,
            hint: `joint path "${jointPath}" for skin entity ${entity} could not be resolved within spawnRoot ${spawnRoot}'s ChildOf-subtree; verify glTF node names are preserved and instantiateScene seeded a Children mirror`,
            detail: {
              skinEntity: entity,
              path: pathSegments,
              failedAtIndex: pathSegments.length - 1
            }
          }
        };
      }
      if (nameMatches.length > 1) {
        console.warn(
          `[Skin] same-name sibling: "${leafName}" matches ${nameMatches.length} entities within spawn subtree of root ${spawnRoot}; using first-match (entity ${nameMatches[0]}) per D-6a`
        );
      }
      jointEntityList.push(nameMatches[0]);
    }
    world.set(entity, Skin, {
      joints: new Uint32Array(jointEntityList)
    });
  }
  return { ok: true };
}

// src/shared-shader-bundler.ts
var APP_BUILD_INFO = "forgeax-app-build-info.json";
var APP_SHARED_KIND = "forgeax-app-shared-web-runtime";
function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function appDocumentBase() {
  if (typeof document === "undefined") return void 0;
  if (typeof document.baseURI !== "string" || document.baseURI.length === 0) return void 0;
  return document.baseURI;
}
function hasSharedShaderUrls(bundler) {
  return typeof bundler?.shaderIndexUrl === "string" && bundler.shaderIndexUrl.length > 0 && typeof bundler?.shaderRequirementsUrl === "string" && bundler.shaderRequirementsUrl.length > 0;
}
function resolveAppUrl(value, base) {
  if (/^https?:\/\//i.test(value) || value.startsWith("/")) return value;
  return new URL(value, base).href;
}
async function resolveSharedShaderBundler(bundler) {
  if (hasSharedShaderUrls(bundler)) return bundler;
  if (bundler !== void 0 && "shaderManifestUrl" in bundler) return bundler;
  const base = appDocumentBase();
  if (base === void 0) return bundler;
  try {
    const response = await fetch(new URL(APP_BUILD_INFO, base).href);
    if (!response.ok) return bundler;
    const value = await response.json();
    if (!isRecord(value) || value.kind !== APP_SHARED_KIND || typeof value.shaderIndexUrl !== "string" || value.shaderIndexUrl.length === 0) {
      return bundler;
    }
    const requirements = typeof value.shaderRequirementsUrl === "string" && value.shaderRequirementsUrl.length > 0 ? resolveAppUrl(value.shaderRequirementsUrl, base) : resolveAppUrl("shaders/requirements.json", base);
    const delta = typeof value.shaderManifestDeltaUrl === "string" && value.shaderManifestDeltaUrl.length > 0 ? resolveAppUrl(value.shaderManifestDeltaUrl, base) : void 0;
    return {
      ...bundler,
      shaderManifestUrl: void 0,
      shaderIndexUrl: value.shaderIndexUrl,
      shaderRequirementsUrl: requirements,
      ...delta === void 0 ? {} : { shaderManifestDeltaUrl: delta }
    };
  } catch {
    return bundler;
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
  const resolvedBundler = await resolveSharedShaderBundler(bundler);
  const first = await loadBackendPack(options);
  if (!first.ok) throw first.error;
  const constructed = await constructRendererHost(canvas, options, resolvedBundler, first.value);
  if (constructed.ok || options?.rhi !== void 0 || typeof globalThis === "undefined" || !canFallbackToWgpu(constructed.error)) {
    return constructed;
  }
  const fallback = await loadBackendPack(options, true);
  if (!fallback.ok) return constructed;
  return constructRendererHost(canvas, options, resolvedBundler, fallback.value);
}
async function createPublicationAssets(bundler) {
  const resolvedBundler = await resolveSharedShaderBundler(bundler);
  const shaders = new ShaderRegistry({
    manifestUrl: resolvedBundler !== void 0 && "shaderManifestUrl" in resolvedBundler ? resolvedBundler.shaderManifestUrl : "/shaders/manifest.json",
    manifestDeltaUrl: resolvedBundler?.shaderManifestDeltaUrl,
    indexUrl: resolvedBundler?.shaderIndexUrl,
    requirementsUrl: resolvedBundler?.shaderRequirementsUrl
  });
  const loaded = await shaders.loadManifest();
  if (!loaded.ok) throw loaded.error;
  return new AssetRegistry(
    shaders,
    resolvedBundler?.importTransport,
    [audioLoader],
    postSpawnResolveJoints
  );
}

export { constructRuntimeRendererHost, createPublicationAssets, loadRhiPack, resolveSharedShaderBundler };
