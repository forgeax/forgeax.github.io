import { AssetGuid } from '../../pack/dist/guid.mjs';
import { deriveAssetName } from '../../pack/dist/name.mjs';
import { ok as ok$1, err, RhiError } from '../../rhi/dist/index.mjs';
import { MaterialArtifactRegistry, isEngineMaterial } from '../../shader/dist/index.mjs';
import { toShared, handleSlot, BUILTIN_BASE, AssetError, ok, MATERIAL_CHILD_FORBIDDEN_FIELDS, createMaterialError, ASSET_ERROR_HINTS, resolveMaterialAsset, unwrapHandle, authoringCapabilityForAssetKind, catalogOperationsFor, err as err$1, materialGuidText, PACK_ERROR_HINTS, materialChildForbiddenFields, deriveStandardLayerPlan, projectAssetEvidence, resolveMaterialTextureCoordinates, IES_PROFILE_BYTE_LENGTH, IMAGE_ERROR_HINTS } from '../../types/dist/index.mjs';
export { BUILTIN_BASE } from '../../types/dist/index.mjs';
import { createBoxGeometry, meshFromInterleaved, createPlaneGeometry, createSphereGeometry, createCylinderGeometry, deriveVertexLayoutProjectionFromMask, createProceduralMesh, PROCEDURAL_FLOATS_PER_VERTEX, deriveVertexLayoutProjection, DEFAULT_VERTEX_ATTRIBUTE_MAP, deriveVertexCount } from '../../geometry/dist/index.mjs';
import { videoLoader } from '../../graphics-extras/dist/index.mjs';
import { createUiLoader } from '../../ui/dist/index.mjs';
import { decodeMeshBinHeader, MESH_BIN_HEADER_V4_BYTES, validateCookedMaterialRecord, createMaterialArtifactDigest, materialLayerPlanIdentity, isStandardMaterialRecord, validateArtifactPath } from '../../pack/dist/index.mjs';
import { selectTranscodeTarget, transcodeBasis, parseKtx2, ktx2ColorSpace, transcodeKtx2, decompressZstd } from '../../codec/dist/index.mjs';
import { componentSchema } from '../../ecs/dist/internal.mjs';
import { materialProgramContextKey, validateCookedMaterialRecord as validateCookedMaterialRecord$1 } from '../../pack/dist/material-cook.mjs';
import { worldSetSceneAssetResolver, worldInstantiateScene, worldInstantiateSceneFlat, worldDespawnScene } from '../../scene/dist/index.mjs';
import { defineComponent } from '../../ecs/dist/index.mjs';
import { createStateProjection } from '../../ecs/dist/projection/index.mjs';
import { box3 } from '../../math/dist/index.mjs';
import { decodeImageInBrowser } from '../../image/dist/index.mjs';

// src/asset-kind.ts
function defineAssetKind(kind) {
  return Object.freeze({ kind });
}
var builtinCubeRes = createBoxGeometry(1, 1, 1);
if (!builtinCubeRes.ok) {
  throw new Error(
    `[builtin-asset-registry] createBoxGeometry(1,1,1) failed: ${builtinCubeRes.error.code}`
  );
}
var BUILTIN_CUBE = Object.freeze(builtinCubeRes.value);
var builtinTriangleRes = meshFromInterleaved(
  new Float32Array([
    // pos.xyz                normal.xyz       uv.xy
    0,
    0.7,
    0,
    0,
    0,
    1,
    0.5,
    1,
    -0.7,
    -0.6,
    0,
    0,
    0,
    1,
    0,
    0,
    0.7,
    -0.6,
    0,
    0,
    0,
    1,
    1,
    0
  ]),
  new Uint16Array([0, 1, 2])
);
if (!builtinTriangleRes.ok) {
  throw new Error(
    `[builtin-asset-registry] builtin triangle geometry failed: ${builtinTriangleRes.error.code}`
  );
}
var BUILTIN_TRIANGLE = Object.freeze(builtinTriangleRes.value);
var builtinQuadRes = createPlaneGeometry(1, 1);
if (!builtinQuadRes.ok) {
  throw new Error(
    `[builtin-asset-registry] createPlaneGeometry(1,1) failed: ${builtinQuadRes.error.code}`
  );
}
var BUILTIN_QUAD = Object.freeze(builtinQuadRes.value);
var builtinSphereRes = createSphereGeometry(1, 16, 12);
if (!builtinSphereRes.ok) {
  throw new Error(
    `[builtin-asset-registry] createSphereGeometry(1,16,12) failed: ${builtinSphereRes.error.code}`
  );
}
var BUILTIN_SPHERE = Object.freeze(builtinSphereRes.value);
var builtinCylinderRes = createCylinderGeometry(0.5, 0.5, 1, 16, 1);
if (!builtinCylinderRes.ok) {
  throw new Error(
    `[builtin-asset-registry] createCylinderGeometry(0.5,0.5,1,16,1) failed: ${builtinCylinderRes.error.code}`
  );
}
var BUILTIN_CYLINDER = Object.freeze(builtinCylinderRes.value);
var builtinNineSliceQuadRes = createPlaneGeometry(1, 1, 3, 3);
if (!builtinNineSliceQuadRes.ok) {
  throw new Error(
    `[builtin-asset-registry] createPlaneGeometry(1,1,3,3) failed: ${builtinNineSliceQuadRes.error.code}`
  );
}
var BUILTIN_NINESLICE_QUAD = Object.freeze(builtinNineSliceQuadRes.value);
var BUILTIN_BY_SLOT = /* @__PURE__ */ new Map([
  [1, BUILTIN_CUBE],
  [2, BUILTIN_TRIANGLE],
  [3, BUILTIN_QUAD],
  [4, BUILTIN_SPHERE],
  [5, BUILTIN_NINESLICE_QUAD],
  [6, BUILTIN_CYLINDER]
]);
var BuiltinAssetRegistry = Object.freeze({
  resolve(handle) {
    const slot = handleSlot(handle);
    if (slot >= BUILTIN_BASE) return null;
    const payload = BUILTIN_BY_SLOT.get(slot);
    return payload === void 0 ? null : payload;
  }
});

// src/loader-registry.ts
var LoaderRegistry = class {
  // feat-20260623 M4 / w13: the Map stores Loader<unknown> so host custom kinds
  // (Loader<MyPayload>) are accepted. The P in Loader<P> is covariant (output
  // only: load() returns P), so Loader<Asset> is assignable to Loader<unknown>.
  loaders = /* @__PURE__ */ new Map();
  packLoaders = /* @__PURE__ */ new Map();
  /**
   * Register a loader for its `loader.kind`. Fail-fast on a malformed loader
   * (charter P3); rejects a repeated kind so the canonical owner cannot be replaced.
   *
   * @param loader the `{ kind, load }` object to register.
   * @throws TypeError when `loader.kind` is empty or `loader.load` is not a
   *   function — a wire-time misconfiguration the host must fix.
   */
  register(loader) {
    if (typeof loader.kind !== "string" || loader.kind.length === 0) {
      throw new TypeError(
        `LoaderRegistry.register: loader.kind must be a non-empty string (got ${JSON.stringify(loader.kind)})`
      );
    }
    if (typeof loader.load !== "function") {
      throw new TypeError(
        `LoaderRegistry.register: loader.load must be a function for kind "${loader.kind}"`
      );
    }
    if (this.loaders.has(loader.kind)) {
      throw new TypeError(`LoaderRegistry.register: duplicate loader kind "${loader.kind}"`);
    }
    this.loaders.set(loader.kind, loader);
    return () => {
      if (this.loaders.get(loader.kind) === loader) this.loaders.delete(loader.kind);
    };
  }
  registerPackLoader(loader) {
    if (typeof loader.kind !== "string" || loader.kind.length === 0) {
      throw new TypeError("LoaderRegistry.registerPackLoader: kind must be non-empty");
    }
    if (typeof loader.load !== "function") {
      throw new TypeError(
        `LoaderRegistry.registerPackLoader: load must be a function for ${loader.kind}`
      );
    }
    if (this.packLoaders.has(loader.kind)) {
      throw new TypeError(
        `LoaderRegistry.registerPackLoader: duplicate loader kind "${loader.kind}"`
      );
    }
    this.packLoaders.set(loader.kind, loader);
    return () => {
      if (this.packLoaders.get(loader.kind) === loader) this.packLoaders.delete(loader.kind);
    };
  }
  async loadPack(input, ctx) {
    const packLoader = this.packLoaders.get(input.kind);
    if (packLoader !== void 0) {
      const output2 = await packLoader.load(input, ctx);
      if (isPackLoadResult(output2)) return output2;
      return { ok: true, value: output2 };
    }
    const loader = this.loaders.get(input.kind);
    if (loader === void 0) {
      return { ok: false, error: new Error(`no loader registered for ${input.kind}`) };
    }
    if (loader.loadPack !== void 0) {
      const output2 = await loader.loadPack(input, ctx);
      if (isPackLoadResult(output2)) return output2;
      return { ok: true, value: output2 };
    }
    const output = await loader.load(input.payload, input.refs, ctx);
    if (isPackLoadResult(output)) return output;
    return { ok: true, value: output };
  }
  /**
   * Look up the loader registered for `kind`. Returns `undefined` when no
   * loader is wired — the `AssetRegistry` consumer maps that to a structured
   * `AssetError(code='loader-not-registered')` with the registered kinds in
   * `.detail` (charter P3).
   */
  get(kind) {
    return this.loaders.get(kind);
  }
  /**
   * The kinds currently wired, in insertion order. Fed into the
   * `loader-not-registered` error `.detail.registeredKinds` so AI users see
   * exactly what is injectable.
   */
  registeredKinds() {
    return [...this.loaders.keys()];
  }
};
function isPackLoadResult(value) {
  return value !== null && typeof value === "object" && "ok" in value && typeof value.ok === "boolean";
}
function isFiniteFloat16(bytes) {
  for (let offset = 0; offset < bytes.byteLength; offset += 2) {
    const bits = (bytes[offset] ?? 0) | (bytes[offset + 1] ?? 0) << 8;
    if ((bits >>> 10 & 31) === 31 && (bits & 1023) !== 0) return false;
  }
  return true;
}
function readPayload(payload) {
  if (payload.kind !== "ies-profile") return void 0;
  const data = payload.data;
  const bytes = data instanceof Uint8Array ? data : Array.isArray(data) && data.every((value) => Number.isInteger(value) && value >= 0 && value <= 255) ? Uint8Array.from(data) : void 0;
  if (bytes === void 0 || bytes.byteLength !== IES_PROFILE_BYTE_LENGTH) return void 0;
  return isFiniteFloat16(bytes) ? { kind: "ies-profile", data: bytes } : void 0;
}
var iesProfileLoader = {
  kind: "ies-profile",
  load(payload, _refs, _ctx) {
    const value = readPayload(payload);
    return value;
  }
};
var MeshBinAssetError = class extends AssetError {
  subject = "mesh-bin";
  sourceKey;
  actual;
  recovery = "re-cook the source with its Meta sidecar through the build-time importer";
  constructor(args) {
    const expectedFacts = args.expectedFacts ?? {
      version: 4,
      projectionVersion: 1
    };
    const actualFacts = {
      ...args.header ?? {},
      ...args.actualFacts ?? {}
    };
    const detail = {
      code: "mesh-bin-contract-violation",
      sourceKey: args.sourceKey,
      reason: args.reason ?? "header-invalid",
      expected: expectedFacts,
      actual: actualFacts
    };
    super({
      code: "mesh-bin-contract-violation",
      expected: args.expected,
      hint: "re-cook the source with its Meta sidecar through the build-time importer",
      detail
    });
    this.sourceKey = args.sourceKey;
    this.actual = args.actual;
  }
};
var MaterialResolvedEmptyPassesError = class extends Error {
  code = "material-resolved-empty-passes";
  expected;
  hint;
  detail;
  constructor(materialGuid, reason, missingParentHandle) {
    const expected = reason === "missing-parent" ? `parent handle ${missingParentHandle} present in AssetRegistry` : "at least one material in the parent chain declares passes";
    const hint = reason === "missing-parent" ? `material ${materialGuid} references parent handle ${missingParentHandle} which is not registered; inspect AssetRegistry, register the parent first, or rebuild the material chain` : `material ${materialGuid} has no passes and its entire parent chain also has no pass declarations; inspect the chain, add pass declarations to one member, then rebuild`;
    const message = reason === "missing-parent" ? `material ${materialGuid} parent handle ${missingParentHandle} not registered` : `material ${materialGuid} parent chain resolves to zero passes`;
    super(message);
    this.name = "MaterialResolvedEmptyPassesError";
    this.expected = expected;
    this.hint = hint;
    this.detail = {
      materialGuid,
      reason,
      ...reason === "missing-parent" && missingParentHandle !== void 0 ? { missingParentHandle } : {}
    };
  }
};
var MeshSsboCapacityExceededError = class extends Error {
  code = "mesh-ssbo-capacity-exceeded";
  expected;
  hint;
  detail;
  constructor(requested, capacity, ceiling) {
    const expected = `mesh SSBO slotCount >= ${requested} (currently ${capacity}; device ceiling ${ceiling} B)`;
    const hint = `mesh SSBO grow could not satisfy needed=${requested} slots (capacity=${capacity}, ceiling=${ceiling} B); reduce per-frame entity count or split work across frames (defensive fallback path)`;
    super(
      `mesh SSBO capacity exceeded: needed ${requested} slots, capacity ${capacity}, ceiling ${ceiling} B`
    );
    this.name = "MeshSsboCapacityExceededError";
    this.expected = expected;
    this.hint = hint;
    this.detail = { requested, capacity, ceiling };
  }
};
var MeshSsboCeilingReachedError = class extends Error {
  code = "mesh-ssbo-ceiling-reached";
  expected;
  hint;
  detail;
  constructor(requested, capacity, ceiling) {
    const expected = `mesh SSBO slot byte size <= device.limits.maxStorageBufferBindingSize (${ceiling} B)`;
    const hint = `requested ${requested} mesh SSBO slots would exceed device.limits.maxStorageBufferBindingSize (${ceiling} B); reduce per-frame entity count or run on an adapter with a larger storage buffer binding size`;
    super(
      `mesh SSBO ceiling reached: needed ${requested} slots; capacity ${capacity}; ceiling ${ceiling} B`
    );
    this.name = "MeshSsboCeilingReachedError";
    this.expected = expected;
    this.hint = hint;
    this.detail = { requested, capacity, ceiling };
  }
};
var SceneCollectEntityRefOutOfClosureError = class extends Error {
  code = "scene-collect-entity-ref-out-of-closure";
  expected;
  hint;
  detail;
  constructor(entity, field, target) {
    const expected = `entity ${entity}.${field} references entity ${target} which is inside the forest closure`;
    const hint = "Expand roots to include the target entity, or remove the reference.";
    super(`${expected} \u2014 ${hint}`);
    this.name = "SceneCollectEntityRefOutOfClosureError";
    this.expected = expected;
    this.hint = hint;
    this.detail = { entity, field, target };
  }
};
var SceneCollectAssetGuidUnresolvedError = class extends Error {
  code = "scene-collect-asset-guid-unresolved";
  expected;
  hint;
  detail;
  constructor(field, ref) {
    const where = typeof ref === "number" ? `handle ${ref}` : `guid '${ref}'`;
    const expected = `shared field '${field}' (${where}) resolves to an asset whose GUID is catalogued`;
    const hint = "source SceneAsset is not catalogued: call registry.catalog(guid, payload) first, or load through loadByGuid() which auto-catalogs GUID-scoped assets";
    super(`${expected} \u2014 ${hint}`);
    this.name = "SceneCollectAssetGuidUnresolvedError";
    this.expected = expected;
    this.hint = hint;
    this.detail = typeof ref === "number" ? { field, handle: ref } : { field, guid: ref };
  }
};
var HANDLE_CUBE = toShared(1);
var HANDLE_TRIANGLE = toShared(2);
var HANDLE_QUAD = toShared(3);
var HANDLE_SPHERE = toShared(4);
var HANDLE_CYLINDER = toShared(6);
var HANDLE_NINESLICE_QUAD = toShared(5);
var BUILTIN_MESH_GUIDS = [
  [HANDLE_CUBE, "cbe42beb-8975-5096-b3a1-3dda4cb4c077"],
  [HANDLE_TRIANGLE, "22592f07-d967-5116-b29c-fa9781929ba8"],
  [HANDLE_QUAD, "339338aa-a338-581c-9fc5-744267ef8a51"],
  [HANDLE_SPHERE, "95730fd2-9846-5f84-8658-0b3c971eb263"],
  [HANDLE_NINESLICE_QUAD, "692d38b4-8cac-5fb2-9dcf-f389e076d6bf"],
  // feat-20260701-editor-world-container-doc-ecs-collapse M0 / AC-16:
  // cylinder builtin handle=6, GUID = deriveBuiltin('HANDLE_CYLINDER') UUIDv5
  // (plan-strategy §5.6 builtin-guid-ssot gate)
  [HANDLE_CYLINDER, "ab20af21-0764-55be-a7f2-b80ab3d46a0a"]
];
function builtinMeshGuid(handle) {
  const slot = handleSlot(handle);
  return BUILTIN_MESH_GUIDS.find(([candidate]) => handleSlot(candidate) === slot)?.[1];
}
var HANDLE_FIELD_NAMES = /* @__PURE__ */ new Set([
  "assetHandle",
  "material",
  "skeleton",
  "clip",
  // ParticleEffectPlayer.effect (shared<ParticleEffectAsset>) uses the same
  // scene-pack refs[] index contract as every other scalar shared field.
  "effect",
  "density",
  // feat-20260630-equirect-kind-internalized-ibl-declarative-skyligh M3 / w27:
  // Skylight.equirect + SkyboxBackground.equirect (shared<EquirectAsset>). The
  // generic extractSceneEntityHandleGuids path already covers shared< fields by
  // schema; this allowlist is the second scene-parse path (parseScenePayload),
  // so the new handle field name is registered here too (R-1).
  "equirect",
  "iesProfile",
  "cookie"
]);
var HANDLE_ARRAY_FIELD_NAMES = /* @__PURE__ */ new Set(["materials", "clips"]);

// src/scene-payload.ts
function isParseSceneError(value) {
  return typeof value === "object" && value !== null && "entityKey" in value && "index" in value;
}
function resolveFields(entityKey, componentName, rawFields, refs) {
  if (refs === void 0) return { ...rawFields };
  const resolved = {};
  for (const [fieldName, value] of Object.entries(rawFields)) {
    if (HANDLE_FIELD_NAMES.has(fieldName) && typeof value === "number" && Number.isInteger(value)) {
      if (value < 0 || value >= refs.length) {
        return {
          entityKey,
          component: componentName,
          field: fieldName,
          index: value,
          refsLength: refs.length
        };
      }
      resolved[fieldName] = refs[value];
      continue;
    }
    if (HANDLE_ARRAY_FIELD_NAMES.has(fieldName) && Array.isArray(value)) {
      const values = [];
      for (const [arrayIndex, item] of value.entries()) {
        if (typeof item !== "number" || !Number.isInteger(item)) {
          values.push(item);
          continue;
        }
        if (item < 0 || item >= refs.length) {
          return {
            entityKey,
            component: componentName,
            field: `${fieldName}[${arrayIndex}]`,
            index: item,
            refsLength: refs.length
          };
        }
        values.push(refs[item]);
      }
      resolved[fieldName] = values;
      continue;
    }
    resolved[fieldName] = value;
  }
  return resolved;
}
function resolveComponents(entityKey, rawComponents, refs) {
  if (rawComponents === null || typeof rawComponents !== "object" || Array.isArray(rawComponents))
    return void 0;
  const components = {};
  for (const [componentName, rawFields] of Object.entries(
    rawComponents
  )) {
    if (rawFields === null || typeof rawFields !== "object" || Array.isArray(rawFields))
      return void 0;
    const resolved = resolveFields(
      entityKey,
      componentName,
      rawFields,
      refs
    );
    if (resolved === void 0) return void 0;
    if (isParseSceneError(resolved)) return resolved;
    components[componentName] = resolved;
  }
  return components;
}
function resolveSkinGuids(raw, refs) {
  if (!Array.isArray(raw)) return void 0;
  const out = [];
  for (const value of raw) {
    if (typeof value === "string") {
      out.push(value);
    } else if (typeof value === "number" && Number.isInteger(value) && refs !== void 0 && refs[value] !== void 0) {
      out.push(refs[value]);
    } else {
      return void 0;
    }
  }
  return out;
}
function parseScenePayload(payload, refs) {
  const rawEntities = payload.entities;
  if (rawEntities === null || typeof rawEntities !== "object" || Array.isArray(rawEntities))
    return void 0;
  const entities = {};
  for (const [entityKey, rawEntity] of Object.entries(rawEntities)) {
    if (entityKey.length === 0 || rawEntity === null || typeof rawEntity !== "object" || Array.isArray(rawEntity)) {
      return void 0;
    }
    const entity = rawEntity;
    const components = resolveComponents(entityKey, entity.components ?? {}, refs);
    if (components === void 0 || isParseSceneError(components)) return components;
    let instance;
    if (entity.instance !== void 0) {
      if (entity.instance === null || typeof entity.instance !== "object" || Array.isArray(entity.instance))
        return void 0;
      const rawInstance = entity.instance;
      let source;
      if (typeof rawInstance.source === "string") {
        source = rawInstance.source;
      } else if (typeof rawInstance.source === "number" && Number.isInteger(rawInstance.source) && refs !== void 0 && refs[rawInstance.source] !== void 0) {
        source = refs[rawInstance.source];
      } else {
        return void 0;
      }
      if (rawInstance.overrides !== void 0 && !Array.isArray(rawInstance.overrides))
        return void 0;
      const overrides = [];
      for (const rawOverride of rawInstance.overrides ?? []) {
        if (rawOverride === null || typeof rawOverride !== "object" || Array.isArray(rawOverride))
          return void 0;
        const override = rawOverride;
        if (!Array.isArray(override.target) || override.target.length === 0 || override.target.some((part) => typeof part !== "string" || part.length === 0)) {
          return void 0;
        }
        const overrideComponents = resolveComponents(entityKey, override.components ?? {}, refs);
        if (overrideComponents === void 0 || isParseSceneError(overrideComponents))
          return overrideComponents;
        overrides.push({
          target: [...override.target],
          components: overrideComponents
        });
      }
      instance = {
        source,
        ...overrides.length === 0 && rawInstance.overrides === void 0 ? {} : { overrides }
      };
    }
    entities[entityKey] = {
      components,
      ...instance === void 0 ? {} : { instance }
    };
  }
  const skinGuids = resolveSkinGuids(payload.skinGuids, refs);
  if (Array.isArray(payload.skinGuids) && skinGuids === void 0) return void 0;
  return {
    kind: "scene",
    entities,
    ...skinGuids === void 0 ? {} : { skinGuids }
  };
}
function fail(sourceKey, expected, actual, header, reason = "header-invalid", expectedFacts, actualFacts) {
  return err$1(
    new MeshBinAssetError({
      sourceKey,
      expected,
      actual,
      ...header === void 0 ? {} : { header },
      reason,
      ...expectedFacts === void 0 ? {} : { expectedFacts },
      ...actualFacts === void 0 ? {} : { actualFacts }
    })
  );
}
function copyAttributes(source, header, projection) {
  const view = new DataView(source.buffer, source.byteOffset, source.byteLength);
  const attributes = {};
  for (const entry of projection.attributes) {
    const components = entry.byteLength / (entry.format === "uint16x4" ? 2 : 4);
    const target = entry.format === "uint16x4" ? new Uint16Array(header.vertexCount * components) : new Float32Array(header.vertexCount * components);
    for (let vertex = 0; vertex < header.vertexCount; vertex++) {
      for (let component = 0; component < components; component++) {
        const offset = vertex * header.stride + entry.offset + component * (entry.format === "uint16x4" ? 2 : 4);
        if (target instanceof Uint16Array)
          target[vertex * components + component] = view.getUint16(offset, true);
        else target[vertex * components + component] = view.getFloat32(offset, true);
      }
    }
    attributes[entry.key] = target;
  }
  return attributes;
}
function unpackMeshBinV4(bytes, sourceKey) {
  const headerResult = decodeMeshBinHeader(bytes, sourceKey);
  if (!headerResult.ok) {
    const reason = headerResult.error.code === "mesh-bin-header-truncated" ? "header-truncated" : headerResult.error.code === "mesh-bin-version-unsupported" ? "version-unsupported" : "header-invalid";
    const actualFacts = {
      byteLength: bytes.byteLength,
      ...bytes.byteLength >= 4 ? {
        version: new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(
          0,
          true
        )
      } : {}
    };
    return fail(
      sourceKey,
      headerResult.error.expected,
      headerResult.error.actual,
      void 0,
      reason,
      reason === "header-truncated" ? { field: "byteLength", byteLength: MESH_BIN_HEADER_V4_BYTES } : reason === "version-unsupported" ? { field: "version", version: 4 } : void 0,
      actualFacts
    );
  }
  const header = headerResult.value;
  const projectionResult = deriveVertexLayoutProjectionFromMask(header.mask);
  if (!projectionResult.ok) {
    return fail(
      sourceKey,
      projectionResult.error.expected,
      `mask=${header.mask}`,
      header,
      "projection-mismatch",
      {
        field: "mask",
        mask: projectionResult.error.detail.knownMask
      },
      {
        field: "mask",
        mask: header.mask,
        projectionVersion: header.projectionVersion,
        stride: header.stride,
        digest: header.digest
      }
    );
  }
  const projection = projectionResult.value;
  if (projection.schemaVersion !== header.projectionVersion || projection.arrayStride !== header.stride || projection.digest !== header.digest) {
    return fail(
      sourceKey,
      "wire projection version, mask, stride, and digest to match geometry projection",
      `projection=${projection.schemaVersion}/${projection.arrayStride}/${projection.digest}; wire=${header.projectionVersion}/${header.stride}/${header.digest}`,
      header,
      "projection-mismatch",
      {
        field: "projectionVersion",
        projectionVersion: projection.schemaVersion,
        mask: projection.mask,
        stride: projection.arrayStride,
        digest: projection.digest
      }
    );
  }
  const payloadBytes = header.vertexBytes + header.indexBytes + header.jsonBytes;
  if (MESH_BIN_HEADER_V4_BYTES + payloadBytes !== bytes.byteLength) {
    return fail(
      sourceKey,
      `exactly ${MESH_BIN_HEADER_V4_BYTES + payloadBytes} bytes`,
      `${bytes.byteLength} bytes`,
      header,
      "payload-length-mismatch",
      { field: "byteLength", byteLength: MESH_BIN_HEADER_V4_BYTES + payloadBytes },
      {
        field: "byteLength",
        byteLength: bytes.byteLength,
        vertexBytes: header.vertexBytes,
        indexBytes: header.indexBytes,
        jsonBytes: header.jsonBytes
      }
    );
  }
  let offset = MESH_BIN_HEADER_V4_BYTES;
  const vertexBytes = bytes.subarray(offset, offset + header.vertexBytes);
  const vertices = new Float32Array(vertexBytes.byteLength / 4);
  new Uint8Array(vertices.buffer).set(vertexBytes);
  offset += header.vertexBytes;
  let indices;
  if (header.indexCount > 0) {
    const indexBytes = bytes.subarray(offset, offset + header.indexBytes);
    if (header.indexWidth === 2) {
      indices = new Uint16Array(header.indexCount);
      new Uint8Array(indices.buffer).set(indexBytes);
    } else {
      indices = new Uint32Array(header.indexCount);
      new Uint8Array(indices.buffer).set(indexBytes);
    }
    offset += header.indexBytes;
  }
  const jsonBytes = bytes.subarray(offset, offset + header.jsonBytes);
  let meta;
  try {
    meta = JSON.parse(new TextDecoder().decode(jsonBytes));
  } catch (error) {
    return fail(
      sourceKey,
      "valid mesh-bin v4 JSON metadata",
      error instanceof Error ? error.message : String(error),
      header,
      "metadata-invalid",
      { field: "metadata" },
      { field: "metadata" }
    );
  }
  if (!Array.isArray(meta.submeshes) || meta.submeshes.length === 0 || !Array.isArray(meta.materialSlots)) {
    return fail(
      sourceKey,
      "non-empty submeshes and materialSlots metadata",
      "metadata table missing",
      header,
      "metadata-invalid",
      { field: "metadata" },
      { field: "metadata" }
    );
  }
  let lods;
  if (meta.lods !== void 0) {
    if (!Array.isArray(meta.lods) || meta.lods.length > 7) {
      return fail(
        sourceKey,
        "LOD metadata to contain at most seven lower-detail levels",
        "lods is not an array or exceeds the level limit",
        header,
        "metadata-invalid",
        { field: "metadata" },
        { field: "metadata" }
      );
    }
    let previousCoverage = 1;
    const decodedLods = [];
    for (const [lodIndex, rawLod] of meta.lods.entries()) {
      if (rawLod === null || typeof rawLod !== "object") {
        return fail(
          sourceKey,
          `LOD ${lodIndex} metadata object`,
          "LOD entry is not an object",
          header,
          "metadata-invalid",
          { field: "metadata" },
          { field: "metadata" }
        );
      }
      const meshRef = rawLod.meshRef;
      const screenCoverage = rawLod.screenCoverage;
      if (!Number.isInteger(meshRef) || meshRef < 0) {
        return fail(
          sourceKey,
          `LOD ${lodIndex} meshRef to be a non-negative integer`,
          `meshRef=${String(meshRef)}`,
          header,
          "metadata-invalid",
          { field: "metadata" },
          { field: "metadata" }
        );
      }
      if (typeof screenCoverage !== "number" || !Number.isFinite(screenCoverage) || screenCoverage <= 0 || screenCoverage > 1 || screenCoverage >= previousCoverage) {
        return fail(
          sourceKey,
          `LOD ${lodIndex} screenCoverage to be finite, in (0, 1], and strictly decreasing`,
          `screenCoverage=${String(screenCoverage)}`,
          header,
          "metadata-invalid",
          { field: "metadata" },
          { field: "metadata" }
        );
      }
      decodedLods.push({ meshRef, screenCoverage });
      previousCoverage = screenCoverage;
    }
    lods = decodedLods;
  }
  let lodHysteresis;
  if (meta.lodHysteresis !== void 0) {
    if (typeof meta.lodHysteresis !== "number" || !Number.isFinite(meta.lodHysteresis) || meta.lodHysteresis < 0 || meta.lodHysteresis >= 1) {
      return fail(
        sourceKey,
        "lodHysteresis to be finite and in [0, 1)",
        `lodHysteresis=${String(meta.lodHysteresis)}`,
        header,
        "metadata-invalid",
        { field: "metadata" },
        { field: "metadata" }
      );
    }
    lodHysteresis = meta.lodHysteresis;
  }
  const attributes = copyAttributes(vertices, header, projection);
  for (const attribute of projection.attributes) {
    const value = attributes[attribute.key];
    if (value === void 0)
      return fail(
        sourceKey,
        `decoded ${attribute.key} attribute`,
        "attribute missing",
        header,
        "attribute-invalid",
        {
          field: "attribute",
          attribute: attribute.key,
          expectedLength: header.vertexCount * (attribute.byteLength / (attribute.format === "uint16x4" ? 2 : 4))
        },
        {
          field: "attribute",
          attribute: attribute.key,
          mask: header.mask,
          stride: header.stride,
          vertexCount: header.vertexCount
        }
      );
    if (value instanceof ArrayBuffer) continue;
    for (const component of value) {
      if (!Number.isFinite(component))
        return fail(
          sourceKey,
          "finite vertex payload",
          `non-finite ${attribute.key}`,
          header,
          "payload-non-finite",
          { field: "attribute", attribute: attribute.key },
          {
            field: "attribute",
            attribute: attribute.key,
            mask: header.mask,
            stride: header.stride,
            vertexCount: header.vertexCount,
            elementIndex: [...value].findIndex((component2) => !Number.isFinite(component2)),
            actualValue: Number.isNaN(component) ? "nan" : component === Number.POSITIVE_INFINITY ? "positive-infinity" : "negative-infinity"
          }
        );
    }
  }
  const morphTargets = meta.morphTargets?.map(
    (target) => Object.fromEntries(
      Object.entries(target).map(([key2, value]) => [key2, new Float32Array(value)])
    )
  );
  const mesh = {
    version: 4,
    projection,
    vertices,
    attributes,
    ...indices === void 0 ? {} : { indices },
    submeshes: meta.submeshes,
    materialSlots: meta.materialSlots,
    ...meta.aabb === void 0 ? {} : { aabb: new Float32Array(meta.aabb) },
    ...morphTargets === void 0 ? {} : { morphTargets },
    ...meta.morphWeights === void 0 ? {} : { morphWeights: new Float32Array(meta.morphWeights) },
    ...lods === void 0 ? {} : { lods },
    ...lodHysteresis === void 0 ? {} : { lodHysteresis }
  };
  return ok(mesh);
}

// src/registry/load-trace.ts
var TRACE_KEY = "__forgeaxAssetLoadTrace";
function traceAssetLoadPhase(phase, context = {}) {
  const sink = globalThis[TRACE_KEY];
  if (sink === void 0) return;
  try {
    sink({ phase, at: Date.now(), ...context });
  } catch {
  }
}

// src/loaders/pack-artifact.ts
function firstArtifact(input) {
  return input.artifacts.body ?? Object.values(input.artifacts)[0];
}
function payloadNumber(payload, key2, fallback) {
  const value = payload[key2];
  return typeof value === "number" ? value : fallback;
}
function payloadColorSpace(payload) {
  return payload.colorSpace === "linear" ? "linear" : "srgb";
}
function payloadTextureShape(payload) {
  const shape = payload.shape;
  if (!record(shape) || typeof shape.viewDimension !== "string" || !record(shape.extent)) {
    return void 0;
  }
  const { width, height, layers, depth } = shape.extent;
  if (!positiveInteger(width) || !positiveInteger(height)) return void 0;
  if (shape.viewDimension === "2d" && layers === void 0 && depth === void 0) {
    return { viewDimension: "2d", extent: { width, height } };
  }
  if (shape.viewDimension === "2d-array" && positiveInteger(layers) && depth === void 0) {
    return { viewDimension: "2d-array", extent: { width, height, layers } };
  }
  if (shape.viewDimension === "3d" && positiveInteger(depth) && layers === void 0) {
    return { viewDimension: "3d", extent: { width, height, depth } };
  }
  return void 0;
}
function payloadTextureMips(payload) {
  const mips = payload.mips;
  if (!record(mips) || typeof mips.kind !== "string") return void 0;
  if (mips.kind === "none") return { kind: "none" };
  if (mips.kind === "generate") return { kind: "generate" };
  if (mips.kind === "packed" && positiveInteger(mips.levelCount)) {
    return { kind: "packed", levelCount: mips.levelCount };
  }
  return void 0;
}
function invalidPackAsset(input, expected) {
  return {
    ok: false,
    error: new AssetError({
      code: "asset-parse-failed",
      expected,
      hint: `Pack v2 asset ${input.guid} must provide an asset-local artifact`,
      detail: { sourcePath: input.guid }
    })
  };
}
function record(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}
function positiveInteger(value) {
  return finiteNumber(value) && Number.isInteger(value) && value > 0;
}
function validRenderPipelineConfig(value) {
  if (!record(value)) return false;
  const passCount = value.passCount;
  if (passCount !== void 0 && !positiveInteger(passCount)) return false;
  const clusterGrid = value.clusterGrid;
  if (clusterGrid !== void 0) {
    if (!record(clusterGrid) || !["x", "y", "z"].every((axis) => {
      const size = clusterGrid[axis];
      return positiveInteger(size) && size <= 64;
    })) {
      return false;
    }
  }
  const ssao = value.ssao;
  if (ssao !== void 0 && (!record(ssao) || typeof ssao.enabled !== "boolean")) return false;
  const outputDither = value.outputDither;
  if (outputDither !== void 0 && typeof outputDither !== "boolean") return false;
  const postEffects = value.postEffects;
  return postEffects === void 0 || Array.isArray(postEffects) && postEffects.every((effect) => typeof effect === "string" && effect.length > 0);
}
function validTilesetRegion(value, atlasCount) {
  if (!record(value)) return false;
  const { x, y, width, height, atlasIndex } = value;
  return finiteNumber(x) && finiteNumber(y) && positiveInteger(width) && positiveInteger(height) && (atlasIndex === void 0 || typeof atlasIndex === "number" && Number.isInteger(atlasIndex) && atlasIndex >= 0 && atlasIndex < atlasCount);
}
function validTilesetTile(value, regionCount) {
  if (!record(value)) return false;
  const regionIndex = value.regionIndex;
  return typeof regionIndex === "number" && Number.isInteger(regionIndex) && regionIndex >= 0 && regionIndex < regionCount;
}
function validAtlasSize(value) {
  return record(value) && positiveInteger(value.pixelWidth) && positiveInteger(value.pixelHeight);
}
function readJsonArtifact(input, kind) {
  const artifact = firstArtifact(input);
  if (artifact === void 0) return void 0;
  try {
    const value = JSON.parse(new TextDecoder().decode(artifact.bytes));
    return record(value) && value.kind === kind ? value : void 0;
  } catch {
    return void 0;
  }
}
function renderPipelineDescriptor(value) {
  if (value.kind !== "render-pipeline") return void 0;
  const pipelineId = value.pipelineId;
  if (pipelineId !== "forgeax::standard") return void 0;
  const renderPath = value.renderPath;
  if (renderPath !== void 0 && renderPath !== "forward" && renderPath !== "deferred") {
    return void 0;
  }
  const config = value.config;
  if (config !== void 0 && !validRenderPipelineConfig(config)) return void 0;
  return {
    kind: "render-pipeline",
    pipelineId,
    ...renderPath === void 0 ? {} : { renderPath },
    ...config === void 0 ? {} : { config }
  };
}
function tilesetDescriptor(value, refs) {
  if (value.kind !== "tileset") return void 0;
  const rawAtlases = value.atlases;
  if (!Array.isArray(rawAtlases) || rawAtlases.length === 0) return void 0;
  if (!rawAtlases.every((atlas) => typeof atlas === "string" && atlas.length > 0)) return void 0;
  const atlases = rawAtlases;
  if (atlases.length !== refs.length || atlases.some((guid, index) => guid !== refs[index])) {
    return void 0;
  }
  const { tileWidth, tileHeight, columns, rows, regions, tiles, atlasSizes } = value;
  if (typeof tileWidth !== "number" || tileWidth <= 0 || typeof tileHeight !== "number" || tileHeight <= 0 || typeof columns !== "number" || !Number.isInteger(columns) || columns <= 0 || typeof rows !== "number" || !Number.isInteger(rows) || rows <= 0 || !Array.isArray(regions) || !regions.every((region) => record(region) && validTilesetRegion(region, atlases.length)) || !Array.isArray(tiles) || !tiles.every((tile) => validTilesetTile(tile, regions.length)) || atlasSizes !== void 0 && (!Array.isArray(atlasSizes) || atlasSizes.length !== atlases.length || !atlasSizes.every((size) => validAtlasSize(size)))) {
    return void 0;
  }
  return {
    kind: "tileset",
    atlases: [...atlases],
    tileWidth,
    tileHeight,
    columns,
    rows,
    regions,
    tiles,
    ...Array.isArray(atlasSizes) ? { atlasSizes } : {}
  };
}
function codecProfile(codec) {
  return codec?.profile;
}
function projectCodecFailureDetail(input, codec, caps, failure2, targetFormat) {
  return {
    sourcePath: input.guid,
    codecCode: failure2.code,
    codecExpected: failure2.expected,
    codecHint: failure2.hint,
    codecDetail: failure2.detail,
    container: codec.container ?? "basis",
    ...codec.profile === void 0 ? {} : { profile: codec.profile },
    ...targetFormat === void 0 ? {} : { targetFormat },
    capabilities: caps
  };
}
function codecFailure(input, codec, caps, failure2, targetFormat) {
  const detail = projectCodecFailureDetail(input, codec, caps, failure2, targetFormat);
  return new AssetError({
    code: "asset-parse-failed",
    expected: failure2.expected,
    hint: failure2.hint,
    detail
  });
}
function codecContextFailure(input, codec, caps, failure2, expected, hint, targetFormat) {
  const detail = projectCodecFailureDetail(
    input,
    codec,
    caps,
    {
      code: failure2.code,
      expected,
      hint,
      detail: failure2.detail
    },
    targetFormat
  );
  return new AssetError({
    code: "asset-parse-failed",
    expected,
    hint,
    detail
  });
}
function transcodeModel(profile) {
  if (profile === "etc1s") return "etc1s";
  if (profile === "uastc" || profile === "uastc-ldr") return "uastc-ldr";
  if (profile === "uastc-hdr") return "uastc-hdr";
  return void 0;
}
async function loadTexturePack(input, ctx) {
  traceAssetLoadPhase("texture.loader.start", {
    guid: input.guid,
    detail: { codec: input.artifacts.body?.descriptor.assetCodec?.name }
  });
  const artifact = firstArtifact(input);
  if (artifact === void 0)
    return invalidPackAsset(input, "texture asset-local image artifact");
  const payload = input.payload;
  const colorSpace = payloadColorSpace(payload);
  const codec = artifact.descriptor.assetCodec;
  const profile = codecProfile(codec);
  const model = codec?.name === "basis" && profile !== void 0 ? transcodeModel(profile) : void 0;
  if (codec?.name === "basis" && codec.container === "basis") {
    const basisCodec = codec;
    if (model === void 0) {
      return {
        ok: false,
        error: codecContextFailure(
          input,
          basisCodec,
          ctx.transcodeCaps,
          {
            code: "basis-profile-unsupported",
            detail: { profile: codec.profile ?? "missing" }
          },
          "raw Basis artifact with an explicit ETC1S or UASTC-LDR profile",
          "set assetCodec.profile to etc1s or uastc-ldr and re-cook the source"
        )
      };
    }
    try {
      const target = selectTranscodeTarget(
        { model, srgb: colorSpace === "srgb", channels: "rgba" },
        ctx.transcodeCaps
      );
      traceAssetLoadPhase("codec.basis.transcode.start", {
        guid: input.guid,
        detail: { target }
      });
      const transcoded = await transcodeBasis(artifact.bytes, target);
      traceAssetLoadPhase("codec.basis.transcode.complete", {
        guid: input.guid,
        detail: { ok: transcoded.ok, target }
      });
      if (!transcoded.ok) {
        return {
          ok: false,
          error: codecFailure(input, basisCodec, ctx.transcodeCaps, transcoded.error, target)
        };
      }
      const data = new Uint8Array(
        transcoded.value.mips.reduce((size, mip) => size + mip.data.length, 0)
      );
      let offset = 0;
      for (const mip of transcoded.value.mips) {
        data.set(mip.data, offset);
        offset += mip.data.length;
      }
      return {
        ok: true,
        value: {
          kind: "texture",
          shape: {
            viewDimension: "2d",
            extent: { width: transcoded.value.width, height: transcoded.value.height }
          },
          format: target,
          data,
          colorSpace,
          mips: { kind: "packed", levelCount: Math.max(1, transcoded.value.mips.length) }
        }
      };
    } catch (error) {
      return {
        ok: false,
        error: new AssetError({
          code: "asset-fetch-failed",
          expected: "loadable raw Basis texture artifact",
          hint: error instanceof Error ? error.message : String(error),
          detail: {
            sourcePath: input.guid,
            codecCode: "runtime-loader-exception",
            codecExpected: "loadable raw Basis texture artifact",
            codecHint: error instanceof Error ? error.message : String(error),
            codecDetail: { reason: "runtime-loader-exception" },
            container: basisCodec.container ?? "basis",
            ...basisCodec.profile === void 0 ? {} : { profile: basisCodec.profile },
            capabilities: ctx.transcodeCaps
          }
        })
      };
    }
  }
  if (model !== void 0 && codec !== void 0) {
    const ktx2Codec = codec;
    try {
      traceAssetLoadPhase("codec.ktx2.parse.start", { guid: input.guid });
      const parsed = await parseKtx2(artifact.bytes);
      traceAssetLoadPhase("codec.ktx2.parse.complete", {
        guid: input.guid,
        detail: { ok: parsed.ok }
      });
      if (!parsed.ok) {
        return {
          ok: false,
          error: codecFailure(input, ktx2Codec, ctx.transcodeCaps, parsed.error)
        };
      }
      const projectedColorSpace = ktx2ColorSpace(parsed.value);
      if (projectedColorSpace === void 0 || projectedColorSpace !== colorSpace) {
        return {
          ok: false,
          error: codecContextFailure(
            input,
            ktx2Codec,
            ctx.transcodeCaps,
            {
              code: "ktx2-color-space-mismatch",
              detail: {
                authoredColorSpace: colorSpace,
                dfdColorSpace: projectedColorSpace ?? "unknown"
              }
            },
            "Basis KTX2 DFD transfer function matching the texture colorSpace",
            "align the texture payload colorSpace with the KTX2 DFD and re-cook the source"
          )
        };
      }
      const target = selectTranscodeTarget(
        { model, srgb: colorSpace === "srgb", channels: "rgba" },
        ctx.transcodeCaps
      );
      traceAssetLoadPhase("codec.ktx2.transcode.start", {
        guid: input.guid,
        detail: { target }
      });
      const transcoded = await transcodeKtx2(parsed.value, target);
      traceAssetLoadPhase("codec.ktx2.transcode.complete", {
        guid: input.guid,
        detail: { ok: transcoded.ok, target }
      });
      if (!transcoded.ok) {
        return {
          ok: false,
          error: codecFailure(input, ktx2Codec, ctx.transcodeCaps, transcoded.error, target)
        };
      }
      const data = new Uint8Array(
        transcoded.value.mips.reduce((size, mip) => size + mip.data.length, 0)
      );
      let offset = 0;
      for (const mip of transcoded.value.mips) {
        data.set(mip.data, offset);
        offset += mip.data.length;
      }
      return {
        ok: true,
        value: {
          kind: "texture",
          shape: {
            viewDimension: "2d",
            extent: { width: transcoded.value.width, height: transcoded.value.height }
          },
          format: target,
          data,
          colorSpace,
          mips: { kind: "packed", levelCount: Math.max(1, transcoded.value.mips.length) }
        }
      };
    } catch (error) {
      if (error instanceof AssetError) return { ok: false, error };
      return {
        ok: false,
        error: new AssetError({
          code: "asset-fetch-failed",
          expected: "loadable Basis KTX2 texture artifact",
          hint: error instanceof Error ? error.message : String(error),
          detail: {
            sourcePath: input.guid,
            codecCode: "runtime-loader-exception",
            codecExpected: "loadable Basis KTX2 texture artifact",
            codecHint: error instanceof Error ? error.message : String(error),
            codecDetail: { reason: "runtime-loader-exception" },
            container: ktx2Codec.container ?? "ktx2",
            ...ktx2Codec.profile === void 0 ? {} : { profile: ktx2Codec.profile },
            capabilities: ctx.transcodeCaps
          }
        })
      };
    }
  }
  const shape = payloadTextureShape(payload);
  const mips = payloadTextureMips(payload);
  if (shape === void 0 || mips === void 0) {
    return invalidPackAsset(
      input,
      "texture payload with a valid shape and mip policy"
    );
  }
  return {
    ok: true,
    value: {
      kind: "texture",
      shape,
      format: payload.format ?? (colorSpace === "srgb" ? "rgba8unorm-srgb" : "rgba8unorm"),
      data: artifact.bytes,
      colorSpace,
      mips
    }
  };
}
async function loadEquirectPack(input) {
  const artifact = firstArtifact(input);
  if (artifact === void 0)
    return invalidPackAsset(input, "equirect asset-local image artifact");
  const payload = input.payload;
  return {
    ok: true,
    value: {
      kind: "equirect",
      width: payloadNumber(payload, "width", 0),
      height: payloadNumber(payload, "height", 0),
      format: payload.format ?? "rgba16float",
      data: artifact.bytes,
      colorSpace: payloadColorSpace(payload)
    }
  };
}
function parseGlyphs(value) {
  if (typeof value !== "object" || value === null) return {};
  const glyphs = {};
  for (const [codepoint, raw] of Object.entries(value)) {
    if (typeof raw !== "object" || raw === null) continue;
    const metric = raw;
    const size = metric.size;
    const region = metric.region;
    if (typeof metric.advance !== "number" || typeof metric.bearingX !== "number" || typeof metric.bearingY !== "number" || typeof size?.w !== "number" || typeof size.h !== "number" || typeof region?.x !== "number" || typeof region.y !== "number" || typeof region.w !== "number" || typeof region.h !== "number") {
      continue;
    }
    glyphs[Number(codepoint)] = {
      advance: metric.advance,
      bearingX: metric.bearingX,
      bearingY: metric.bearingY,
      size: { w: size.w, h: size.h },
      region: { x: region.x, y: region.y, w: region.w, h: region.h }
    };
  }
  return glyphs;
}
async function loadFontPack(input, ctx) {
  const payload = input.payload;
  const atlasGuid = payload.atlasGuid;
  const samplerGuid = payload.samplerGuid;
  const common = payload.common;
  if (typeof atlasGuid !== "string" || typeof samplerGuid !== "string" || typeof common !== "object" || common === null) {
    return invalidPackAsset(
      input,
      "font payload with atlasGuid, samplerGuid, and common"
    );
  }
  const parsedAtlas = AssetGuid.parse(atlasGuid);
  const parsedSampler = AssetGuid.parse(samplerGuid);
  if (!parsedAtlas.ok) return { ok: false, error: parsedAtlas.error };
  if (!parsedSampler.ok) return { ok: false, error: parsedSampler.error };
  const atlasResolved = await ctx.resolveRef(atlasGuid);
  if (!atlasResolved.ok) return atlasResolved;
  const samplerResolved = await ctx.resolveRef(samplerGuid);
  if (!samplerResolved.ok) return samplerResolved;
  const commonRecord = common;
  const commonFields = [
    "lineHeight",
    "base",
    "distanceRange",
    "pxRange",
    "atlasWidth",
    "atlasHeight"
  ];
  if (commonFields.some((key2) => typeof commonRecord[key2] !== "number")) {
    return invalidPackAsset(input, "font common block with numeric layout fields");
  }
  return {
    ok: true,
    value: {
      kind: "font",
      atlas: parsedAtlas.value,
      sampler: parsedSampler.value,
      glyphs: parseGlyphs(payload.glyphs),
      common: {
        lineHeight: commonRecord.lineHeight,
        base: commonRecord.base,
        distanceRange: commonRecord.distanceRange,
        pxRange: commonRecord.pxRange,
        atlasWidth: commonRecord.atlasWidth,
        atlasHeight: commonRecord.atlasHeight
      }
    }
  };
}
var textureLoader = {
  kind: "texture",
  load: () => void 0,
  loadPack: loadTexturePack
};
var equirectLoader = {
  kind: "equirect",
  load: () => void 0,
  loadPack: loadEquirectPack
};
var fontLoader = {
  kind: "font",
  load: () => void 0,
  loadPack: loadFontPack
};
var renderPipelineLoader = {
  kind: "render-pipeline",
  load: (payload) => renderPipelineDescriptor({ ...payload, kind: "render-pipeline" }),
  loadPack: async (input) => {
    if (firstArtifact(input) === void 0) {
      const value2 = renderPipelineDescriptor({ ...input.payload, kind: "render-pipeline" });
      return value2 === void 0 ? invalidPackAsset(input, "a valid render-pipeline descriptor") : { ok: true, value: value2 };
    }
    const payload = readJsonArtifact(input, "render-pipeline");
    const value = payload === void 0 ? void 0 : renderPipelineDescriptor(payload);
    return payload === void 0 ? invalidPackAsset(input, "render-pipeline JSON descriptor artifact") : value === void 0 ? invalidPackAsset(input, "a complete render-pipeline descriptor") : { ok: true, value };
  }
};
var tilesetLoader = {
  kind: "tileset",
  load: (payload, refs) => {
    const rawAtlases = payload.atlases;
    const resolved = Array.isArray(rawAtlases) ? rawAtlases.map((value) => typeof value === "number" ? refs?.[value] : value) : void 0;
    return resolved === void 0 || resolved.some((value) => typeof value !== "string") ? void 0 : tilesetDescriptor({ ...payload, kind: "tileset", atlases: resolved }, resolved);
  },
  loadPack: async (input) => {
    if (firstArtifact(input) === void 0) {
      const value2 = tilesetDescriptor({ ...input.payload, kind: "tileset" }, input.refs);
      return value2 === void 0 ? invalidPackAsset(input, "a valid tileset descriptor") : { ok: true, value: value2 };
    }
    const payload = readJsonArtifact(input, "tileset");
    const value = payload === void 0 ? void 0 : tilesetDescriptor(payload, input.refs);
    return payload === void 0 ? invalidPackAsset(input, "tileset JSON descriptor artifact") : value === void 0 ? invalidPackAsset(input, "a tileset descriptor matching envelope refs") : { ok: true, value };
  }
};
var PACK_ARTIFACT_LOADERS = [
  textureLoader,
  fontLoader,
  equirectLoader,
  renderPipelineLoader,
  tilesetLoader
];

// src/loaders/inline-pack.ts
function parseLodGuid(raw, refs) {
  if (raw instanceof Uint8Array) {
    return raw.byteLength === 16 ? raw : void 0;
  }
  if (Array.isArray(raw)) {
    if (raw.length !== 16 || raw.some((byte) => !Number.isInteger(byte) || byte < 0 || byte > 255))
      return void 0;
    return new Uint8Array(raw);
  }
  if (typeof raw === "string") {
    const parsed = AssetGuid.parse(raw);
    return parsed.ok ? parsed.value : void 0;
  }
  if (typeof raw === "number" && Number.isInteger(raw) && refs !== void 0) {
    const ref = refs[raw];
    if (ref === void 0) return void 0;
    const parsed = AssetGuid.parse(ref);
    return parsed.ok ? parsed.value : void 0;
  }
  return void 0;
}
function parseMeshLodPayload(rawLods, rawHysteresis, refs) {
  if (rawLods !== void 0 && !Array.isArray(rawLods)) return { ok: false };
  if (rawHysteresis !== void 0 && (typeof rawHysteresis !== "number" || !Number.isFinite(rawHysteresis) || rawHysteresis < 0 || rawHysteresis >= 1))
    return { ok: false };
  if (rawLods === void 0) {
    return {
      ok: true,
      value: rawHysteresis === void 0 ? {} : { lodHysteresis: rawHysteresis }
    };
  }
  if (rawLods.length > 7) return { ok: false };
  let previousCoverage = 1;
  const lods = [];
  for (const rawLod of rawLods) {
    if (rawLod === null || typeof rawLod !== "object") return { ok: false };
    const entry = rawLod;
    const mesh = parseLodGuid(entry.mesh ?? entry.meshRef, refs);
    const screenCoverage = entry.screenCoverage;
    if (mesh === void 0 || typeof screenCoverage !== "number" || !Number.isFinite(screenCoverage) || screenCoverage <= 0 || screenCoverage > 1 || screenCoverage >= previousCoverage)
      return { ok: false };
    lods.push({ mesh, screenCoverage });
    previousCoverage = screenCoverage;
  }
  return {
    ok: true,
    value: {
      lods,
      ...rawHysteresis === void 0 ? {} : { lodHysteresis: rawHysteresis }
    }
  };
}
var meshLoader = {
  kind: "mesh",
  load(payload) {
    const procedural = createProceduralMesh(payload);
    if (procedural !== void 0) return procedural.ok ? procedural.value : void 0;
    const vertexData = payload.vertices;
    const indexData = payload.indices;
    const rawAttributes = payload.attributes ?? {};
    const attributes = { ...rawAttributes };
    const rawAabb = payload.aabb;
    let aabb;
    if (rawAabb instanceof Float32Array) {
      aabb = rawAabb;
    } else if (Array.isArray(rawAabb)) {
      aabb = new Float32Array(rawAabb);
    } else if (rawAabb !== void 0) {
      return void 0;
    }
    let morphTargets;
    const rawMorphTargets = payload.morphTargets;
    if (rawMorphTargets !== void 0) {
      if (!Array.isArray(rawMorphTargets) || rawMorphTargets.length < 1 || rawMorphTargets.length > 8) {
        return void 0;
      }
      const parsedTargets = [];
      for (const rawTarget of rawMorphTargets) {
        if (typeof rawTarget !== "object" || rawTarget === null) return void 0;
        const source = rawTarget;
        const target = {};
        for (const [key2, value] of Object.entries(source)) {
          if (key2 !== "position" && key2 !== "normal" && key2 !== "tangent") return void 0;
          if (value instanceof Float32Array) target[key2] = new Float32Array(value);
          else if (Array.isArray(value)) target[key2] = new Float32Array(value);
          else return void 0;
        }
        if (Object.keys(target).length === 0) return void 0;
        parsedTargets.push(target);
      }
      morphTargets = parsedTargets;
    }
    let morphWeights;
    const rawMorphWeights = payload.morphWeights;
    if (rawMorphWeights !== void 0) {
      if (rawMorphWeights instanceof Float32Array) morphWeights = new Float32Array(rawMorphWeights);
      else if (Array.isArray(rawMorphWeights))
        morphWeights = new Float32Array(rawMorphWeights);
      else return void 0;
      if (morphTargets !== void 0 && morphWeights.length !== morphTargets.length)
        return void 0;
    }
    const parsedLods = parseMeshLodPayload(payload.lods, payload.lodHysteresis, void 0);
    if (!parsedLods.ok) return void 0;
    const skinIndexRaw = rawAttributes.skinIndex;
    if (skinIndexRaw instanceof Uint16Array) {
      attributes.skinIndex = skinIndexRaw;
    } else if (Array.isArray(skinIndexRaw)) {
      attributes.skinIndex = new Uint16Array(skinIndexRaw);
    } else if (skinIndexRaw !== void 0) {
      return void 0;
    }
    const skinWeightRaw = rawAttributes.skinWeight;
    if (skinWeightRaw instanceof Float32Array) {
      attributes.skinWeight = skinWeightRaw;
    } else if (Array.isArray(skinWeightRaw)) {
      attributes.skinWeight = new Float32Array(skinWeightRaw);
    } else if (skinWeightRaw !== void 0) {
      return void 0;
    }
    let vertices;
    let indices;
    if (vertexData instanceof Float32Array) {
      vertices = vertexData;
    } else if (Array.isArray(vertexData)) {
      vertices = new Float32Array(vertexData);
    } else {
      return void 0;
    }
    if (indexData instanceof Uint16Array || indexData instanceof Uint32Array) {
      indices = indexData.length > 0 ? indexData : void 0;
    } else if (Array.isArray(indexData)) {
      const arr = indexData;
      if (arr.length === 0) {
        indices = void 0;
      } else {
        const vertexCount = vertices.length / PROCEDURAL_FLOATS_PER_VERTEX;
        const useUint32 = vertexCount > 65535;
        indices = useUint32 ? new Uint32Array(arr) : new Uint16Array(arr);
      }
    } else if (indexData === void 0) {
      indices = void 0;
    } else {
      return void 0;
    }
    const payloadSubmeshes = payload.submeshes;
    const rawSubmeshes = Array.isArray(payloadSubmeshes) && payloadSubmeshes.length > 0 ? payloadSubmeshes : [
      {
        indexOffset: 0,
        indexCount: indices?.length ?? 0,
        vertexCount: vertices.length,
        topology: "triangle-list"
      }
    ];
    const payloadSlots = payload.materialSlots;
    const materialSlots = Array.isArray(payloadSlots) ? payloadSlots.map((raw, slotIndex) => {
      if (typeof raw !== "object" || raw === null)
        return { slotName: `LegacySlot_${slotIndex}` };
      const slot = raw;
      let defaultMaterial;
      if (slot.defaultMaterial instanceof Uint8Array) {
        defaultMaterial = slot.defaultMaterial;
      } else if (typeof slot.defaultMaterial === "string") {
        const parsed = AssetGuid.parse(slot.defaultMaterial);
        if (!parsed.ok) return { slotName: `LegacySlot_${slotIndex}` };
        defaultMaterial = parsed.value;
      }
      return {
        slotName: typeof slot.slotName === "string" && slot.slotName.trim().length > 0 ? slot.slotName : `LegacySlot_${slotIndex}`,
        ...typeof slot.sourceKey === "string" ? { sourceKey: slot.sourceKey } : {},
        ...defaultMaterial !== void 0 ? { defaultMaterial } : {}
      };
    }) : rawSubmeshes.map((_, slotIndex) => ({ slotName: `LegacySlot_${slotIndex}` }));
    const submeshes = rawSubmeshes.map((submesh, submeshIndex) => ({
      ...submesh,
      materialSlot: Number.isInteger(submesh.materialSlot) ? submesh.materialSlot : submeshIndex
    }));
    return {
      kind: "mesh",
      vertices,
      ...indices !== void 0 ? { indices } : {},
      attributes,
      ...aabb !== void 0 ? { aabb } : {},
      ...morphTargets !== void 0 ? { morphTargets } : {},
      ...morphWeights !== void 0 ? { morphWeights } : {},
      ...parsedLods.value.lods === void 0 ? {} : { lods: parsedLods.value.lods },
      ...parsedLods.value.lodHysteresis === void 0 ? {} : { lodHysteresis: parsedLods.value.lodHysteresis },
      submeshes,
      materialSlots
    };
  },
  loadPack(input, ctx) {
    const artifact = input.artifacts.body;
    if (artifact === void 0) return meshLoader.load(input.payload, input.refs, ctx);
    const decoded = unpackMeshBinV4(artifact.bytes, input.guid);
    if (!decoded.ok) return { ok: false, error: decoded.error };
    const materialSlots = decoded.value.materialSlots.map((slot) => {
      const refIndex = slot.defaultMaterialRef;
      const ref = refIndex === void 0 ? void 0 : input.refs[refIndex];
      if (refIndex !== void 0 && ref === void 0) return void 0;
      if (ref === void 0) {
        return {
          slotName: String(slot.slotName),
          ...typeof slot.sourceKey === "string" ? { sourceKey: slot.sourceKey } : {}
        };
      }
      const parsed = AssetGuid.parse(ref);
      if (!parsed.ok) return void 0;
      return {
        slotName: String(slot.slotName),
        ...typeof slot.sourceKey === "string" ? { sourceKey: slot.sourceKey } : {},
        defaultMaterial: parsed.value
      };
    });
    if (materialSlots.some((slot) => slot === void 0)) {
      return {
        ok: false,
        error: new MeshBinAssetError({
          sourceKey: input.guid,
          expected: "material slot references must resolve through the pack refs table",
          actual: "material reference is out of bounds or is not a valid AssetGuid",
          reason: "metadata-invalid",
          actualFacts: { field: "metadata" }
        })
      };
    }
    const parsedLods = parseMeshLodPayload(
      decoded.value.lods,
      decoded.value.lodHysteresis,
      input.refs
    );
    if (!parsedLods.ok) {
      return {
        ok: false,
        error: new MeshBinAssetError({
          sourceKey: input.guid,
          expected: "LOD mesh references must resolve through the pack refs table",
          actual: "LOD reference is out of bounds, malformed, or has invalid coverage metadata",
          reason: "metadata-invalid",
          actualFacts: { field: "metadata" }
        })
      };
    }
    return meshLoader.load(
      {
        vertices: decoded.value.vertices,
        ...decoded.value.indices !== void 0 ? { indices: decoded.value.indices } : {},
        submeshes: decoded.value.submeshes,
        materialSlots,
        ...decoded.value.aabb !== void 0 ? { aabb: decoded.value.aabb } : {},
        ...decoded.value.morphTargets !== void 0 ? { morphTargets: decoded.value.morphTargets } : {},
        ...decoded.value.morphWeights !== void 0 ? { morphWeights: decoded.value.morphWeights } : {},
        ...parsedLods.value.lods === void 0 ? {} : { lods: parsedLods.value.lods },
        ...parsedLods.value.lodHysteresis === void 0 ? {} : { lodHysteresis: parsedLods.value.lodHysteresis },
        attributes: decoded.value.attributes
      },
      input.refs,
      ctx
    );
  }
};
var sceneLoader = {
  kind: "scene",
  load(payload, refs, _ctx) {
    const result = parseScenePayload(payload, refs === void 0 ? void 0 : [...refs]);
    if (result === void 0) return void 0;
    if ("index" in result) {
      return { ok: false, error: result };
    }
    return result;
  }
};
function collectShaderTextureFieldNames(passesFromPayload, ctx) {
  if (!Array.isArray(passesFromPayload) || passesFromPayload.length === 0) return void 0;
  const lookup = ctx.getMaterialShaderTextureFieldNames;
  if (lookup === void 0) return void 0;
  const collected = /* @__PURE__ */ new Set();
  let anyResolved = false;
  for (const pass of passesFromPayload) {
    const shaderId = pass.program?.module;
    if (typeof shaderId !== "string" || shaderId.length === 0) continue;
    const fields = lookup(shaderId);
    if (fields === void 0) continue;
    anyResolved = true;
    for (const name of fields) collected.add(name);
  }
  return anyResolved ? collected : void 0;
}
function refGuidAt(refs, index) {
  if (!Number.isInteger(index) || index < 0 || index >= (refs?.length ?? 0)) return void 0;
  const guid = refs?.[index];
  if (typeof guid === "string") return guid;
  if (typeof guid === "object" && guid !== null && "guid" in guid) {
    const nestedGuid = guid.guid;
    return typeof nestedGuid === "string" ? nestedGuid : void 0;
  }
  return void 0;
}
function isIdentityTextureCoordinates(value) {
  if (value === void 0) return true;
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const coordinates = value;
  if (Object.keys(coordinates).some((key2) => key2 !== "set" && key2 !== "transform")) return false;
  const transform = coordinates.transform;
  if (transform !== void 0 && (typeof transform !== "object" || transform === null || Array.isArray(transform))) {
    return false;
  }
  if (transform !== void 0 && Object.keys(transform).some(
    (key2) => key2 !== "offset" && key2 !== "scale" && key2 !== "rotation"
  )) {
    return false;
  }
  const resolved = resolveMaterialTextureCoordinates(coordinates);
  return resolved.set === 0 && resolved.transform.offset[0] === 0 && resolved.transform.offset[1] === 0 && resolved.transform.scale[0] === 1 && resolved.transform.scale[1] === 1 && resolved.transform.rotation === 0;
}
function compactTextureValue(value) {
  const compact = { ...value };
  if (isIdentityTextureCoordinates(compact.coordinates)) delete compact.coordinates;
  return compact;
}
var materialLoader = {
  kind: "material",
  load(payload, refs, ctx) {
    const matPayload = payload;
    const passesFromPayload = matPayload.passes;
    const rawParamValues = matPayload.values ?? {};
    let parentGuid;
    if (typeof matPayload.parent === "string") {
      parentGuid = matPayload.parent;
    } else if (typeof matPayload.parent === "number") {
      const idx = matPayload.parent;
      const refsArr = refs ?? [];
      if (idx >= 0 && idx < refsArr.length) {
        parentGuid = refGuidAt(refsArr, idx);
      }
      if (parentGuid === void 0) {
        return void 0;
      }
    }
    if (parentGuid !== void 0 && MATERIAL_CHILD_FORBIDDEN_FIELDS.some((field) => Object.hasOwn(matPayload, field))) {
      return void 0;
    }
    const values = { ...rawParamValues };
    if (refs && refs.length > 0) {
      const shaderTextureFields = collectShaderTextureFieldNames(passesFromPayload, ctx);
      const authoredTextureFields = Array.isArray(matPayload.parameters) ? new Set(
        matPayload.parameters.filter(
          (parameter) => typeof parameter === "object" && parameter !== null && "name" in parameter && typeof parameter.name === "string" && "type" in parameter && (parameter.type === "texture" || parameter.type === "texture_cube")
        ).map((parameter) => parameter.name)
      ) : void 0;
      const textureFields = authoredTextureFields !== void 0 ? /* @__PURE__ */ new Set([...shaderTextureFields ?? [], ...authoredTextureFields]) : shaderTextureFields;
      const candidateFields = Object.keys(values);
      for (const fieldName of candidateFields) {
        const value = values[fieldName];
        if (typeof value === "number" && Number.isInteger(value)) {
          if (!textureFields?.has(fieldName)) {
            continue;
          }
          const refGuid = refGuidAt(refs, value);
          if (refGuid === void 0) {
            delete values[fieldName];
            continue;
          }
          values[fieldName] = { texture: refGuid };
          continue;
        }
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          const textureIndex = value.texture;
          if (typeof textureIndex !== "number" || !Number.isInteger(textureIndex)) continue;
          const textureGuid = refGuidAt(refs, textureIndex);
          if (textureGuid === void 0) {
            if (textureFields !== void 0) delete values[fieldName];
            continue;
          }
          const resolved = {
            ...value,
            texture: textureGuid
          };
          const samplerIndex = resolved.sampler;
          if (typeof samplerIndex === "number" && Number.isInteger(samplerIndex)) {
            const samplerGuid = refGuidAt(refs, samplerIndex);
            if (samplerGuid === void 0) delete resolved.sampler;
            else resolved.sampler = samplerGuid;
          }
          values[fieldName] = compactTextureValue(resolved);
        }
      }
    }
    if (Array.isArray(passesFromPayload) && passesFromPayload.length > 0) {
      return {
        kind: "material",
        passes: passesFromPayload,
        parameters: matPayload.parameters,
        ...matPayload.particleInputs === void 0 ? {} : { particleInputs: matPayload.particleInputs },
        ...matPayload.surface === void 0 ? {} : { surface: matPayload.surface },
        values,
        colorSpace: matPayload.colorSpace,
        parentGuid
      };
    }
    if (parentGuid !== void 0) {
      return {
        kind: "material",
        values,
        parentGuid
      };
    }
    return void 0;
  }
};
var samplerLoader = {
  kind: "sampler",
  load(payload) {
    const filters = /* @__PURE__ */ new Set(["nearest", "linear"]);
    const mipmapFilters = /* @__PURE__ */ new Set(["nearest", "linear"]);
    const addressModes = /* @__PURE__ */ new Set(["clamp-to-edge", "repeat", "mirror-repeat"]);
    const compareFunctions = /* @__PURE__ */ new Set([
      "never",
      "less",
      "equal",
      "less-equal",
      "greater",
      "not-equal",
      "greater-equal",
      "always"
    ]);
    const stringField = (key2, allowed) => {
      const value = payload[key2];
      if (value === void 0) return void 0;
      return typeof value === "string" && allowed.has(value) ? value : null;
    };
    const magFilter = stringField("magFilter", filters);
    const minFilter = stringField("minFilter", filters);
    const mipmapFilter = stringField("mipmapFilter", mipmapFilters);
    const addressModeU = stringField("addressModeU", addressModes);
    const addressModeV = stringField("addressModeV", addressModes);
    const addressModeW = stringField("addressModeW", addressModes);
    const compare = stringField("compare", compareFunctions);
    if (magFilter === null || minFilter === null || mipmapFilter === null || addressModeU === null || addressModeV === null || addressModeW === null || compare === null) {
      return void 0;
    }
    const numericField = (key2) => {
      const value = payload[key2];
      if (value === void 0) return void 0;
      return typeof value === "number" && Number.isFinite(value) ? value : null;
    };
    const lodMinClamp = numericField("lodMinClamp");
    const lodMaxClamp = numericField("lodMaxClamp");
    const maxAnisotropy = numericField("maxAnisotropy");
    if (lodMinClamp === null || lodMaxClamp === null || maxAnisotropy === null) return void 0;
    return {
      kind: "sampler",
      ...magFilter === void 0 ? {} : { magFilter },
      ...minFilter === void 0 ? {} : { minFilter },
      ...mipmapFilter === void 0 ? {} : { mipmapFilter },
      ...addressModeU === void 0 ? {} : { addressModeU },
      ...addressModeV === void 0 ? {} : { addressModeV },
      ...addressModeW === void 0 ? {} : { addressModeW },
      ...lodMinClamp === void 0 ? {} : { lodMinClamp },
      ...lodMaxClamp === void 0 ? {} : { lodMaxClamp },
      ...compare === void 0 ? {} : { compare },
      ...maxAnisotropy === void 0 ? {} : { maxAnisotropy }
    };
  }
};
var skeletonLoader = {
  kind: "skeleton",
  load(payload) {
    const ibmRaw = payload.inverseBindMatrices;
    const jointCount = typeof payload.jointCount === "number" ? payload.jointCount : 0;
    let ibm;
    if (ibmRaw instanceof Float32Array) {
      ibm = ibmRaw;
    } else if (Array.isArray(ibmRaw)) {
      ibm = new Float32Array(ibmRaw);
    } else {
      return void 0;
    }
    if (ibm.byteLength !== jointCount * 64) return void 0;
    const boundsRaw = payload.bounds;
    const bounds = boundsRaw instanceof Float32Array ? boundsRaw : Array.isArray(boundsRaw) ? new Float32Array(boundsRaw) : void 0;
    if (bounds !== void 0 && bounds.length !== 6) return void 0;
    return {
      kind: "skeleton",
      inverseBindMatrices: ibm,
      jointCount,
      ...bounds === void 0 ? {} : { bounds }
    };
  }
};
var skinLoader = {
  kind: "skin",
  load(payload) {
    const skeletonGuid = payload.skeletonGuid;
    const jointPathsRaw = payload.jointPaths;
    if (typeof skeletonGuid !== "string") return void 0;
    if (!Array.isArray(jointPathsRaw)) return void 0;
    const jointPaths = [];
    for (const item of jointPathsRaw) {
      if (typeof item !== "string") return void 0;
      jointPaths.push(item);
    }
    return { kind: "skin", skeletonGuid, jointPaths };
  }
};
var animationClipLoader = {
  kind: "animation-clip",
  load(payload) {
    const duration = typeof payload.duration === "number" ? payload.duration : 0;
    const channelsRaw = payload.channels;
    if (!Array.isArray(channelsRaw)) return void 0;
    const channels = [];
    for (const ch of channelsRaw) {
      if (typeof ch !== "object" || ch === null) return void 0;
      const chObj = ch;
      const targetId = chObj.targetId;
      const property = chObj.property;
      const samplerObj = chObj.sampler;
      if (typeof targetId !== "string" || !/^[0-9a-f]{32}$/.test(targetId) || Object.keys(chObj).some(
        (key2) => key2 !== "targetId" && key2 !== "property" && key2 !== "sampler"
      )) {
        return void 0;
      }
      if (property !== "translation" && property !== "rotation" && property !== "scale" && property !== "weights")
        return void 0;
      if (samplerObj === void 0) return void 0;
      const inputRaw = samplerObj.input;
      const outputRaw = samplerObj.output;
      const interpolation = samplerObj.interpolation;
      let input;
      if (inputRaw instanceof Float32Array) {
        input = inputRaw;
      } else if (Array.isArray(inputRaw)) {
        input = new Float32Array(inputRaw);
      } else {
        return void 0;
      }
      let output;
      if (outputRaw instanceof Float32Array) {
        output = outputRaw;
      } else if (Array.isArray(outputRaw)) {
        output = new Float32Array(outputRaw);
      } else {
        return void 0;
      }
      if (interpolation !== "LINEAR" && interpolation !== "STEP") return void 0;
      channels.push({
        targetId,
        property,
        sampler: { input, output, interpolation }
      });
    }
    return { kind: "animation-clip", duration, channels };
  }
};
var animationGraphLoader = {
  kind: "animation-graph",
  load(payload, refs) {
    const rawNodes = payload.nodes;
    const root = payload.root;
    if (!Array.isArray(rawNodes)) return void 0;
    const nodeCount = rawNodes.length;
    const isNodeIndex = (value) => typeof value === "number" && Number.isInteger(value) && value >= 0 && value < nodeCount;
    if (!isNodeIndex(root)) return void 0;
    const refsArr = refs ?? [];
    const nodes = [];
    for (const rawNode of rawNodes) {
      if (typeof rawNode !== "object" || rawNode === null) return void 0;
      const node = rawNode;
      const weight = node.weight;
      if (typeof weight !== "number" || !Number.isFinite(weight)) return void 0;
      if (node.type === "clip") {
        const refIndex = node.clip;
        if (typeof refIndex !== "number" || !Number.isInteger(refIndex)) return void 0;
        if (refIndex < 0 || refIndex >= refsArr.length) return void 0;
        const guid = refsArr[refIndex];
        if (typeof guid !== "string") return void 0;
        nodes.push({
          type: "clip",
          clip: guid,
          weight
        });
      } else if (node.type === "blend") {
        const children = node.children;
        if (!Array.isArray(children) || !children.every(isNodeIndex)) return void 0;
        nodes.push({ type: "blend", children: [...children], weight });
      } else if (node.type === "add") {
        const base = node.base;
        const additive = node.additive;
        if (!isNodeIndex(base)) return void 0;
        if (!Array.isArray(additive) || !additive.every(isNodeIndex)) return void 0;
        nodes.push({ type: "add", base, additive: [...additive], weight });
      } else {
        return void 0;
      }
    }
    return { kind: "animation-graph", nodes, root };
  }
};
var audioLoader = {
  kind: "audio",
  load(payload) {
    const sourceKey = payload.sourceKey;
    const mediaType = payload.mediaType;
    if (typeof sourceKey !== "string" || sourceKey.length === 0) return void 0;
    if (typeof mediaType !== "string" || mediaType.length === 0) return void 0;
    const rawBytes = payload.bytes;
    const bytes = rawBytes instanceof Uint8Array ? rawBytes : Array.isArray(rawBytes) ? new Uint8Array(rawBytes) : void 0;
    return {
      kind: "audio",
      sourceKey,
      mediaType,
      ...bytes === void 0 ? {} : { bytes }
    };
  }
};
var particleEffectLoader = {
  kind: "particle-effect",
  load(payload) {
    if (typeof payload.program !== "object" || payload.program === null) return void 0;
    if (typeof payload.program.fingerprint !== "string") {
      return void 0;
    }
    return { ...payload, kind: "particle-effect" };
  }
};
var INLINE_PACK_LOADERS = [
  meshLoader,
  sceneLoader,
  samplerLoader,
  materialLoader,
  skeletonLoader,
  skinLoader,
  animationClipLoader,
  animationGraphLoader,
  renderPipelineLoader,
  tilesetLoader,
  audioLoader,
  particleEffectLoader
];

// src/wire-default-loaders.ts
var uiPayloadLoader = createUiLoader();
var uiLoader = {
  kind: "ui",
  load: (payload) => {
    const result = uiPayloadLoader.load(payload);
    return result.ok ? result.value : void 0;
  }
};
function wireDefaultLoaders(registry, extraLoaders = []) {
  const extraKinds = new Set(extraLoaders.map((loader) => loader.kind));
  const seeded = /* @__PURE__ */ new Set();
  for (const loader of [...INLINE_PACK_LOADERS, ...PACK_ARTIFACT_LOADERS, iesProfileLoader]) {
    if (extraKinds.has(loader.kind)) continue;
    if (seeded.has(loader.kind)) continue;
    seeded.add(loader.kind);
    registry.register(loader);
  }
  registry.register(videoLoader);
  registry.register(uiLoader);
  for (const loader of extraLoaders) registry.register(loader);
  return registry;
}
function createDefaultLoaderRegistry(extraLoaders = []) {
  return wireDefaultLoaders(new LoaderRegistry(), extraLoaders);
}

// src/aabb.ts
function computeAABB(asset) {
  const pos = asset.attributes.position;
  let floatPos;
  if (pos instanceof Float32Array) {
    floatPos = pos;
  } else if (pos instanceof ArrayBuffer) {
    floatPos = new Float32Array(pos);
  } else {
    return emptyBox();
  }
  if (floatPos.length < 3) return emptyBox();
  let minX = floatPos[0] ?? 0;
  let minY = floatPos[1] ?? 0;
  let minZ = floatPos[2] ?? 0;
  let maxX = minX;
  let maxY = minY;
  let maxZ = minZ;
  for (let i = 3; i < floatPos.length; i += 3) {
    const x = floatPos[i] ?? 0;
    const y = floatPos[i + 1] ?? 0;
    const z = floatPos[i + 2] ?? 0;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (z < minZ) minZ = z;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    if (z > maxZ) maxZ = z;
  }
  return Float32Array.of(minX, minY, minZ, maxX, maxY, maxZ);
}
function emptyBox() {
  return Float32Array.of(Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity);
}
function hasPositionData(position) {
  if (position instanceof Float32Array) return position.length >= 3;
  return position instanceof ArrayBuffer && position.byteLength >= 3 * Float32Array.BYTES_PER_ELEMENT;
}
function isFiniteAabb(aabb) {
  if (!(aabb instanceof Float32Array) || aabb.length !== 6) return false;
  for (const value of aabb) {
    if (!Number.isFinite(value)) return false;
  }
  const minX = aabb[0];
  const minY = aabb[1];
  const minZ = aabb[2];
  const maxX = aabb[3];
  const maxY = aabb[4];
  const maxZ = aabb[5];
  return minX !== void 0 && minY !== void 0 && minZ !== void 0 && maxX !== void 0 && maxY !== void 0 && maxZ !== void 0 && minX <= maxX && minY <= maxY && minZ <= maxZ;
}
function withMeshAabb(asset) {
  if (!hasPositionData(asset.attributes.position) && isFiniteAabb(asset.aabb)) {
    return asset;
  }
  const aabb = computeAABB(asset);
  if (isFiniteAabb(asset.aabb) && isFiniteAabb(aabb)) {
    for (let axis = 0; axis < 3; axis += 1) {
      aabb[axis] = Math.min(aabb[axis] ?? Infinity, asset.aabb[axis] ?? Infinity);
      aabb[axis + 3] = Math.max(aabb[axis + 3] ?? -Infinity, asset.aabb[axis + 3] ?? -Infinity);
    }
  }
  if (Object.isExtensible(asset)) {
    asset.aabb = aabb;
    return asset;
  }
  return { ...asset, aabb };
}
function selectMaterialPassProgram(projection, passName, context, address = "direct") {
  const key2 = materialProgramContextKey(context);
  const modernPublication = projection.passes.some(
    (pass) => pass.programs.some(
      (program) => program.address !== void 0 || program.entry !== void 0 || program.abi !== void 0
    )
  );
  const matches = projection.passes.filter((pass) => pass.name === passName).flatMap(
    (pass) => pass.programs.filter(
      (program) => materialProgramContextKey(program.context) === key2 && (modernPublication ? program.address === address : (program.address ?? "direct") === address)
    )
  );
  if (matches.length !== 1 || matches[0] === void 0) {
    throw Object.assign(
      new Error(
        `Material ${projection.materialGuid} has no unique published program for ${passName} in ${key2}`
      ),
      {
        code: "material-specialization-not-cooked",
        expected: "exactly one program for the selected Pass and renderer context",
        hint: "cook the required context before rendering this material",
        retryable: false,
        recoveryActions: ["recook-material-publication"],
        detail: {
          guid: projection.materialGuid,
          specializationKey: projection.specializationKey,
          pass: passName,
          context,
          address,
          matches: matches.length
        }
      }
    );
  }
  return matches[0];
}
function materialParametersToParamSchema(parameters, material = "<runtime>") {
  return parameters.flatMap((parameter) => {
    if (parameter.type === "bool") {
      const error = createMaterialError("material-parameter-type-unsupported", {
        code: "material-parameter-type-unsupported",
        stage: "runtime",
        material,
        parameter: parameter.name,
        type: parameter.type,
        action: "use-supported-type"
      });
      throw Object.assign(new Error(error.message), error);
    }
    if (parameter.type === "texture" || parameter.type === "texture_cube") {
      return [
        {
          name: parameter.name,
          type: parameter.type === "texture_cube" ? "texture_cube" : "texture2d"
        }
      ];
    }
    const defaultValue = parameter.default;
    const numericDefault = typeof defaultValue === "number" || Array.isArray(defaultValue) && defaultValue.every((item) => typeof item === "number") ? { default: defaultValue } : {};
    return [
      {
        name: parameter.name,
        type: parameter.type,
        ...parameter.colorSpace === void 0 ? {} : { colorSpace: parameter.colorSpace },
        ...numericDefault
      }
    ];
  });
}
function runtimeMaterialShaderId(module, passName) {
  if (passName === "shadow-caster" && (module === "forgeax_material::standard" || module === "forgeax_material::unlit" || module === "forgeax::default-standard-pbr" || module === "forgeax::default-unlit")) {
    return "forgeax::default-shadow-caster";
  }
  switch (module) {
    case "forgeax_material::standard":
      return "forgeax::default-standard-pbr";
    case "forgeax_material::unlit":
      return "forgeax::default-unlit";
    case "forgeax_material::sprite":
      return "forgeax::sprite";
    case "forgeax_material::sprite-lit":
      return "forgeax::sprite-lit";
    default:
      return module;
  }
}
function projectMaterialRecord(record2) {
  return {
    materialGuid: record2.materialGuid ?? record2.guid,
    publicationGeneration: record2.publicationGeneration ?? record2.receipt.identity.cookGeneration,
    specializationKey: record2.specializationKey ?? record2.receipt.identity.artifactDigest,
    artifactHash: record2.receipt.identity.artifactDigest,
    passes: record2.resolved.passes.map((pass) => ({
      name: pass.name,
      module: pass.program.module,
      ...pass.program.vertexEntry === void 0 ? {} : { vertexEntry: pass.program.vertexEntry },
      ...pass.program.fragmentEntry === void 0 ? {} : { fragmentEntry: pass.program.fragmentEntry },
      ...pass.program.moduleSlots === void 0 ? {} : { moduleSlots: pass.program.moduleSlots },
      ...pass.renderState === void 0 ? {} : { renderState: pass.renderState },
      programs: record2.programs.flatMap(
        (program) => program.selections.filter((selection) => selection.pass === pass.name).map((selection) => ({
          context: selection.context,
          specializationKey: program.specializationKey,
          artifactHash: program.artifact.digest,
          ...selection.address === void 0 ? {} : { address: selection.address },
          ...selection.entry === void 0 ? {} : { entry: selection.entry },
          ...selection.abi === void 0 ? {} : { abi: selection.abi }
        }))
      )
    })),
    runtimeValues: record2.resolved.values,
    ...record2.resolved.surface === void 0 ? {} : { surface: record2.resolved.surface },
    staticSelection: []
  };
}
function conflictError(error) {
  return Object.assign(new Error(`${error.code}: ${error.detail.key}`), error);
}
function installMaterialReadyShaders(shaderRegistry, readiness, artifactRegistry) {
  const paramSchema = materialParametersToParamSchema(
    readiness.parameterContract.parameters,
    readiness.guid
  ).map(({ default: _default, ...parameter }) => parameter);
  const entries = readiness.programs.map((program) => {
    const source = new TextDecoder().decode(program.artifact.bytes);
    if (source.length === 0)
      throw new Error(
        `MaterialReady ${readiness.guid} contains an empty shader program ${program.specializationKey}`
      );
    const pass = readiness.record.resolved.passes.find(
      (pass2) => program.selections.some((selection) => selection.pass === pass2.name)
    );
    const abi = program.selections.find((selection) => selection.abi !== void 0)?.abi;
    const artifact = {
      key: program.specializationKey,
      bytes: new Uint8Array(program.artifact.bytes),
      digest: program.artifact.digest,
      metadata: Object.freeze({
        module: pass?.program.module,
        paramSchema,
        ...abi === void 0 ? {} : { abi, receipt: abi }
      })
    };
    return { artifact, source, ...abi === void 0 ? {} : { abi } };
  });
  const validation = new MaterialArtifactRegistry();
  for (const { artifact, source, abi } of entries) {
    const previous = artifactRegistry.get(artifact.key);
    if (previous !== void 0) validation.register(previous).unwrap();
    const checked = validation.register(artifact);
    if (!checked.ok) throw conflictError(checked.error);
    const shader = shaderRegistry.findMaterialArtifact(artifact.key);
    if (shader.ok && (shader.value.source !== source || JSON.stringify(shader.value.paramSchema) !== JSON.stringify(paramSchema) || JSON.stringify(shader.value.receipt) !== JSON.stringify(abi))) {
      throw conflictError({
        code: "material-artifact-conflict",
        expected: "one immutable source, interface, and ABI receipt per program key",
        hint: "re-cook the conflicting program",
        detail: {
          key: artifact.key,
          dimension: shader.value.source !== source ? "bytes" : JSON.stringify(shader.value.paramSchema) !== JSON.stringify(paramSchema) ? "param-schema" : "receipt"
        }
      });
    }
  }
  for (const { artifact, source, abi } of entries) {
    artifactRegistry.register(artifact).unwrap();
    if (!shaderRegistry.findMaterialArtifact(artifact.key).ok)
      shaderRegistry.installMaterialArtifact(artifact.key, {
        source,
        paramSchema,
        ...abi === void 0 ? {} : { receipt: abi }
      });
  }
  return projectMaterialRecord(readiness.record);
}
function validateMeshPayload(asset) {
  if (asset.kind !== "mesh") return null;
  const submeshes = asset.submeshes;
  if (submeshes.length === 0) {
    const guid = "<no-guid>";
    return new AssetError({
      code: "mesh-asset-submeshes-empty",
      expected: "submeshes array has at least one Submesh entry",
      hint: ASSET_ERROR_HINTS["mesh-asset-submeshes-empty"],
      detail: { meshAssetGuid: guid }
    });
  }
  const materialSlots = asset.materialSlots;
  if (!Array.isArray(materialSlots) || materialSlots.length === 0) {
    return new AssetError({
      code: "mesh-asset-material-slot-index-out-of-range",
      expected: "a non-empty materialSlots table for a mesh with submeshes",
      hint: ASSET_ERROR_HINTS["mesh-asset-material-slot-index-out-of-range"],
      detail: {
        meshAssetGuid: "<no-guid>",
        submeshIndex: 0,
        materialSlot: -1,
        materialSlotCount: 0
      }
    });
  }
  const slotNames = /* @__PURE__ */ new Set();
  const sourceKeys = /* @__PURE__ */ new Set();
  for (let slotIndex = 0; slotIndex < materialSlots.length; slotIndex++) {
    const slot = materialSlots[slotIndex];
    const slotName = slot?.slotName.trim() ?? "";
    const sourceKey = slot?.sourceKey?.trim();
    if (slotName.length === 0 || slotNames.has(slotName)) {
      return new AssetError({
        code: "asset-invalid-value",
        expected: `materialSlots[${slotIndex}].slotName is non-empty and unique`,
        hint: "give every Mesh material slot a stable unique slotName",
        detail: {
          field: `materialSlots[${slotIndex}].slotName`,
          value: slotName,
          reason: "empty-or-duplicate"
        }
      });
    }
    slotNames.add(slotName);
    if (sourceKey !== void 0 && sourceKey.length > 0) {
      if (sourceKeys.has(sourceKey)) {
        return new AssetError({
          code: "asset-invalid-value",
          expected: `materialSlots[${slotIndex}].sourceKey is unique when present`,
          hint: "derive a stable unique source identity for every imported Mesh material slot",
          detail: {
            field: `materialSlots[${slotIndex}].sourceKey`,
            value: sourceKey,
            reason: "duplicate"
          }
        });
      }
      sourceKeys.add(sourceKey);
    }
  }
  const hasIndices = (asset.indices?.length ?? 0) > 0;
  const indexBufferLength = asset.indices?.length ?? 0;
  for (let i = 0; i < submeshes.length; i++) {
    const sm = submeshes[i];
    if (sm === void 0) continue;
    const topology = sm.topology;
    if (!Number.isInteger(sm.materialSlot) || sm.materialSlot < 0 || sm.materialSlot >= materialSlots.length) {
      return new AssetError({
        code: "mesh-asset-material-slot-index-out-of-range",
        expected: `submesh[${i}].materialSlot in [0, ${materialSlots.length})`,
        hint: ASSET_ERROR_HINTS["mesh-asset-material-slot-index-out-of-range"],
        detail: {
          meshAssetGuid: "<no-guid>",
          submeshIndex: i,
          materialSlot: sm.materialSlot,
          materialSlotCount: materialSlots.length
        }
      });
    }
    if ((topology === "line-strip" || topology === "triangle-strip") && !hasIndices) {
      return new AssetError({
        code: "asset-invalid-value",
        expected: `submesh[${i}] strip topology carries an index buffer`,
        hint: "line-strip / triangle-strip meshes must provide indices; add MeshAsset.indices or use line-list / triangle-list",
        detail: {
          field: `submeshes[${i}].topology`,
          value: topology,
          reason: "strip-topology-without-indices"
        }
      });
    }
    if (asset.vertices.length === 0 && topology !== "triangle-list") {
      return new AssetError({
        code: "asset-invalid-value",
        expected: `submesh[${i}]: empty geometry uses 'triangle-list'`,
        hint: "a zero-vertex mesh has nothing to draw; change submesh topology to triangle-list or provide vertices",
        detail: {
          field: `submeshes[${i}].topology`,
          value: topology,
          reason: "empty-geometry-non-default-topology"
        }
      });
    }
    if (sm.indexOffset + sm.indexCount > indexBufferLength) {
      const guid = "<no-guid>";
      return new AssetError({
        code: "mesh-submesh-index-range-out-of-bounds",
        expected: `submesh[${i}].indexOffset + indexCount <= index buffer length (${indexBufferLength})`,
        hint: ASSET_ERROR_HINTS["mesh-submesh-index-range-out-of-bounds"],
        detail: {
          submeshIndex: i,
          indexOffset: sm.indexOffset,
          indexCount: sm.indexCount,
          indexBufferLength,
          meshAssetGuid: guid
        }
      });
    }
  }
  if (asset.vertices.length === 0 && (asset.indices?.length ?? 0) === 0) return null;
  const attrs = asset.attributes;
  const candidateProjection = attrs !== void 0 && Object.keys(attrs).length > 0 ? deriveVertexLayoutProjection(attrs) : deriveVertexLayoutProjection(DEFAULT_VERTEX_ATTRIBUTE_MAP);
  const projection = candidateProjection.attributes.length > 0 ? candidateProjection : deriveVertexLayoutProjection(DEFAULT_VERTEX_ATTRIBUTE_MAP);
  const projectedFloatsPerVertex = projection.arrayStride / Float32Array.BYTES_PER_ELEMENT;
  const isSkinned = projection.attributes.some((attribute) => attribute.key === "skinIndex") && projection.attributes.some((attribute) => attribute.key === "skinWeight");
  const expectedStride = isSkinned && projectedFloatsPerVertex === 18 ? "18 floats per vertex (= position vec3 + normal vec3 + uv vec2 + tangent vec4 + skinIndex u16x4 + skinWeight vec4)" : projectedFloatsPerVertex === 12 ? "12 floats per vertex (= position vec3 + normal vec3 + uv vec2 + tangent vec4)" : `${projectedFloatsPerVertex} floats per vertex from the geometry-owned attribute projection`;
  const vertexCount = deriveVertexCount(asset.vertices, projection);
  if (vertexCount === void 0) {
    return new AssetError({
      code: "mesh-vertex-stride-mismatch",
      expected: expectedStride,
      hint: "repack MeshAsset.vertices with the geometry-owned VertexLayoutProjection",
      detail: {
        vertexCount: 0,
        floatsPerVertex: asset.vertices.length / projectedFloatsPerVertex
      }
    });
  }
  const indices = asset.indices;
  if (indices === void 0 || indices.length === 0) return null;
  let maxIndex = 0;
  for (let i = 0; i < indices.length; i++) {
    const idx = indices[i];
    if (idx !== void 0 && idx > maxIndex) maxIndex = idx;
  }
  if (maxIndex + 1 !== vertexCount) {
    return new AssetError({
      code: "mesh-vertex-stride-mismatch",
      expected: expectedStride,
      hint: "repack MeshAsset.vertices with the geometry-owned VertexLayoutProjection",
      detail: {
        vertexCount: maxIndex + 1,
        floatsPerVertex: vertexCount > 0 ? asset.vertices.length / (maxIndex + 1) : 0
      }
    });
  }
  return null;
}
function tileEntryMalformed(args) {
  const detail = {
    code: "tileset-tile-entry-malformed",
    field: args.field,
    scope: args.scope,
    tilesetGuid: args.tilesetGuid,
    ...args.tileEntryIndex !== void 0 ? { tileEntryIndex: args.tileEntryIndex } : {},
    expected: args.expected,
    hint: ASSET_ERROR_HINTS["tileset-tile-entry-malformed"]
  };
  return new AssetError({
    code: "tileset-tile-entry-malformed",
    expected: args.expected,
    hint: ASSET_ERROR_HINTS["tileset-tile-entry-malformed"],
    detail
  });
}
function validateColliderShape(collider, tilesetGuid, tileEntryIndex) {
  if (collider.type === "none") return null;
  if (collider.type === "rect") {
    const rect = collider.rect;
    if (!Array.isArray(rect) || rect.length !== 4) {
      return tileEntryMalformed({
        tilesetGuid,
        field: "collider",
        scope: "tile-entry",
        tileEntryIndex,
        expected: `tiles[${tileEntryIndex}].collider.rect length === 4`
      });
    }
    const [rx, ry, rw, rh] = rect;
    const valid = typeof rx === "number" && typeof ry === "number" && typeof rw === "number" && typeof rh === "number" && rx >= 0 && ry >= 0 && rw > 0 && rh > 0 && rx + rw <= 1 && ry + rh <= 1;
    if (!valid) {
      return tileEntryMalformed({
        tilesetGuid,
        field: "collider",
        scope: "tile-entry",
        tileEntryIndex,
        expected: `tiles[${tileEntryIndex}].collider.rect in [0, 1]^2 with w > 0, h > 0, x + w <= 1, y + h <= 1`
      });
    }
    return null;
  }
  if (collider.type === "polygon") {
    const points = collider.points;
    if (!Array.isArray(points) || points.length < 3) {
      return tileEntryMalformed({
        tilesetGuid,
        field: "collider",
        scope: "tile-entry",
        tileEntryIndex,
        expected: `tiles[${tileEntryIndex}].collider.points length >= 3`
      });
    }
    for (let j = 0; j < points.length; j++) {
      const p = points[j];
      if (!Array.isArray(p) || p.length !== 2 || typeof p[0] !== "number" || typeof p[1] !== "number" || p[0] < 0 || p[0] > 1 || p[1] < 0 || p[1] > 1) {
        return tileEntryMalformed({
          tilesetGuid,
          field: "collider",
          scope: "tile-entry",
          tileEntryIndex,
          expected: `tiles[${tileEntryIndex}].collider.points[${j}] in [0, 1]^2`
        });
      }
    }
    return null;
  }
  return tileEntryMalformed({
    tilesetGuid,
    field: "collider",
    scope: "tile-entry",
    tileEntryIndex,
    expected: `tiles[${tileEntryIndex}].collider.type in {'none', 'rect', 'polygon'}`
  });
}
function validateTilesetPayload(asset, opts = {}) {
  const assetGuid = "<no-guid>";
  if (asset.atlases.length < 1) {
    return tileEntryMalformed({
      tilesetGuid: assetGuid,
      field: "atlases",
      scope: "tileset-asset",
      expected: "atlases.length >= 1"
    });
  }
  const regionCount = asset.regions.length;
  const atlasesLength = asset.atlases.length;
  const atlasWidth = opts.atlasWidth;
  const atlasHeight = opts.atlasHeight;
  for (let i = 0; i < regionCount; i++) {
    const region = asset.regions[i];
    if (region === void 0) continue;
    const negativeOrZero = region.x < 0 || region.y < 0 || region.width <= 0 || region.height <= 0;
    const exceedsAtlas = typeof atlasWidth === "number" && typeof atlasHeight === "number" && (region.x + region.width > atlasWidth || region.y + region.height > atlasHeight);
    if (negativeOrZero || exceedsAtlas) {
      return new AssetError({
        code: "tileset-region-index-out-of-range",
        expected: `regions[${i}] rectangle (x/y >= 0, width/height > 0${typeof atlasWidth === "number" && typeof atlasHeight === "number" ? `, x + width <= ${atlasWidth}, y + height <= ${atlasHeight}` : ""})`,
        hint: ASSET_ERROR_HINTS["tileset-region-index-out-of-range"],
        detail: {
          code: "tileset-region-index-out-of-range",
          tilesetGuid: assetGuid,
          tileId: 0,
          regionIndex: i,
          regionCount
        }
      });
    }
    if (region.atlasIndex !== void 0) {
      const ai = region.atlasIndex;
      if (!Number.isInteger(ai) || ai < 0 || ai >= atlasesLength) {
        return tileEntryMalformed({
          tilesetGuid: assetGuid,
          field: "atlasIndex",
          scope: "tileset-asset",
          expected: `regions[${i}].atlasIndex in [0, ${atlasesLength})`
        });
      }
    }
  }
  for (let i = 0; i < asset.tiles.length; i++) {
    const entry = asset.tiles[i];
    if (entry === void 0) continue;
    const ri = entry.regionIndex;
    if (!Number.isInteger(ri) || ri < 0 || ri >= regionCount) {
      return new AssetError({
        code: "tileset-region-index-out-of-range",
        expected: `tiles[${i}].regionIndex in [0, ${regionCount})`,
        hint: ASSET_ERROR_HINTS["tileset-region-index-out-of-range"],
        detail: {
          code: "tileset-region-index-out-of-range",
          tilesetGuid: assetGuid,
          tileId: i + 1,
          regionIndex: ri,
          regionCount
        }
      });
    }
  }
  for (let i = 0; i < asset.tiles.length; i++) {
    const entry = asset.tiles[i];
    if (entry === void 0) continue;
    if (entry.widthCells !== void 0) {
      const w = entry.widthCells;
      if (!Number.isFinite(w) || w <= 0 || w > 64) {
        return tileEntryMalformed({
          tilesetGuid: assetGuid,
          field: "widthCells",
          scope: "tile-entry",
          tileEntryIndex: i,
          expected: `tiles[${i}].widthCells in (0, 64]`
        });
      }
    }
    if (entry.heightCells !== void 0) {
      const h = entry.heightCells;
      if (!Number.isFinite(h) || h <= 0 || h > 64) {
        return tileEntryMalformed({
          tilesetGuid: assetGuid,
          field: "heightCells",
          scope: "tile-entry",
          tileEntryIndex: i,
          expected: `tiles[${i}].heightCells in (0, 64]`
        });
      }
    }
    if (entry.pivotX !== void 0) {
      const px = entry.pivotX;
      if (!Number.isFinite(px) || px < 0 || px > 1) {
        return tileEntryMalformed({
          tilesetGuid: assetGuid,
          field: "pivotX",
          scope: "tile-entry",
          tileEntryIndex: i,
          expected: `tiles[${i}].pivotX in [0, 1]`
        });
      }
    }
    if (entry.pivotY !== void 0) {
      const py = entry.pivotY;
      if (!Number.isFinite(py) || py < 0 || py > 1) {
        return tileEntryMalformed({
          tilesetGuid: assetGuid,
          field: "pivotY",
          scope: "tile-entry",
          tileEntryIndex: i,
          expected: `tiles[${i}].pivotY in [0, 1]`
        });
      }
    }
    if (entry.collider !== void 0) {
      const colliderErr = validateColliderShape(entry.collider, assetGuid, i);
      if (colliderErr !== null) return colliderErr;
    }
  }
  return null;
}
function inferAtlasExtent(asset) {
  return {
    atlasWidth: asset.columns * asset.tileWidth,
    atlasHeight: asset.rows * asset.tileHeight
  };
}
function failure(code, request, expected, hint, observed) {
  if (code === "asset-artifact-missing") {
    return {
      code,
      expected,
      hint,
      detail: {
        guid: request.guid,
        artifactKey: request.artifactKey,
        path: request.descriptor.path,
        observed,
        expected
      }
    };
  }
  return {
    code,
    expected,
    hint,
    detail: {
      guid: request.guid,
      artifactKey: request.artifactKey,
      observed,
      expected
    }
  };
}
function artifactUrl(packageUrl, path) {
  try {
    return new URL(path, packageUrl).toString();
  } catch {
    const queryIndex = packageUrl.search(/[?#]/);
    const cleanPackageUrl = queryIndex < 0 ? packageUrl : packageUrl.slice(0, queryIndex);
    const slash = cleanPackageUrl.lastIndexOf("/");
    return `${slash < 0 ? "" : cleanPackageUrl.slice(0, slash + 1)}${path}`;
  }
}
function encodedBytes(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return globalThis.btoa(binary);
}
function hexBytes(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function sha256(bytes) {
  const subtle = globalThis.crypto?.subtle;
  if (subtle === void 0) return void 0;
  const digest = await subtle.digest("SHA-256", bytes.slice().buffer);
  const digestBytes = new Uint8Array(digest);
  return { base64: encodedBytes(digestBytes), hex: hexBytes(digestBytes) };
}
async function decodeOuter(bytes, request) {
  const encoding = request.descriptor.contentEncoding ?? "identity";
  if (encoding === "identity") return ok(bytes);
  if (encoding !== "zstd") {
    return err$1(
      failure(
        "asset-artifact-encoding-unsupported",
        request,
        "contentEncoding 'identity' or 'zstd'",
        "change the descriptor to a supported outer content encoding and re-cook the package",
        encoding
      )
    );
  }
  const decoded = await decompressZstd(bytes);
  if (!decoded.ok) {
    return err$1(
      failure(
        "asset-artifact-decode-failed",
        request,
        "valid bytes for the declared outer content encoding",
        "re-cook the artifact and verify the stored bytes before loading again",
        JSON.stringify(decoded.error.detail)
      )
    );
  }
  return ok(decoded.value);
}
async function verifyBytes(bytes, request) {
  const expectedLength = request.descriptor.byteLength;
  if (expectedLength !== void 0 && expectedLength !== bytes.byteLength) {
    return err$1(
      failure(
        "asset-artifact-integrity-mismatch",
        request,
        `decoded artifact byteLength ${expectedLength}`,
        "re-cook the package or update its artifact descriptor to match the bytes",
        String(bytes.byteLength)
      )
    );
  }
  const integrity = request.descriptor.integrity;
  if (integrity === void 0) return ok(bytes);
  const digest = await sha256(bytes);
  if (digest === void 0) {
    return err$1(
      failure(
        "asset-artifact-integrity-mismatch",
        request,
        "a runtime with Web Crypto SHA-256 support",
        "enable Web Crypto or remove the unverifiable artifact from the package",
        "crypto.subtle unavailable"
      )
    );
  }
  const expectedDigest = integrity.digest.startsWith("sha256:") ? integrity.digest.slice("sha256:".length) : integrity.digest;
  if (expectedDigest !== digest.base64 && expectedDigest.toLowerCase() !== digest.hex) {
    return err$1(
      failure(
        "asset-artifact-integrity-mismatch",
        request,
        `sha256 digest ${integrity.digest}`,
        "re-cook the artifact or replace the corrupted stored bytes",
        digest.base64
      )
    );
  }
  return ok(bytes);
}
async function readArtifact(request, fetcher = (url) => globalThis.fetch(url)) {
  if (request.descriptor.mediaType.trim().length === 0) {
    return err$1(
      failure(
        "asset-artifact-media-unsupported",
        request,
        "a non-empty durable artifact mediaType",
        "set the artifact mediaType during production and re-publish the package",
        request.descriptor.mediaType
      )
    );
  }
  const path = validateArtifactPath(request.descriptor.path, {
    packageRoot: request.packageUrl,
    guid: request.guid,
    artifactKey: request.artifactKey
  });
  if (!path.ok) return path;
  const encoding = request.descriptor.contentEncoding ?? "identity";
  if (encoding !== "identity" && encoding !== "zstd") {
    return err$1(
      failure(
        "asset-artifact-encoding-unsupported",
        request,
        "contentEncoding 'identity' or 'zstd'",
        "change the descriptor to a supported outer content encoding and re-cook the package",
        encoding
      )
    );
  }
  const url = artifactUrl(request.packageUrl, path.value);
  traceAssetLoadPhase("artifact.fetch.start", {
    guid: request.guid,
    packageUrl: request.packageUrl,
    artifactKey: request.artifactKey,
    detail: { url }
  });
  let response;
  try {
    response = await fetcher(url);
  } catch (cause) {
    return err$1(
      failure(
        "asset-artifact-missing",
        request,
        `readable artifact at ${path.value}`,
        "publish the artifact at the declared package-relative path and retry the load",
        cause instanceof Error ? cause.message : "artifact fetch failed"
      )
    );
  }
  if (!response.ok) {
    return err$1(
      failure(
        "asset-artifact-missing",
        request,
        `HTTP 200 for artifact at ${path.value}`,
        "publish the missing artifact and retry the load",
        `HTTP ${response.status}`
      )
    );
  }
  traceAssetLoadPhase("artifact.fetch.complete", {
    guid: request.guid,
    packageUrl: request.packageUrl,
    artifactKey: request.artifactKey,
    detail: { status: response.status }
  });
  let bytes;
  try {
    bytes = new Uint8Array(await response.arrayBuffer());
    traceAssetLoadPhase("artifact.body.complete", {
      guid: request.guid,
      packageUrl: request.packageUrl,
      artifactKey: request.artifactKey,
      detail: { byteLength: bytes.byteLength }
    });
  } catch (cause) {
    return err$1(
      failure(
        "asset-artifact-missing",
        request,
        `readable artifact at ${path.value}`,
        "repair the published artifact and retry the load",
        cause instanceof Error ? cause.message : "artifact body unreadable"
      )
    );
  }
  const decoded = await decodeOuter(bytes, request);
  if (!decoded.ok) return decoded;
  traceAssetLoadPhase("artifact.decode.complete", {
    guid: request.guid,
    packageUrl: request.packageUrl,
    artifactKey: request.artifactKey,
    detail: { byteLength: decoded.value.byteLength }
  });
  const verified = await verifyBytes(decoded.value, request);
  traceAssetLoadPhase("artifact.verify.complete", {
    guid: request.guid,
    packageUrl: request.packageUrl,
    artifactKey: request.artifactKey,
    detail: { ok: verified.ok }
  });
  return verified;
}
var ArtifactReadCache = class {
  cache = /* @__PURE__ */ new Map();
  read(key2, reader) {
    const existing = this.cache.get(key2);
    if (existing !== void 0) return existing;
    const pending = reader();
    this.cache.set(key2, pending);
    void pending.then((result) => {
      if (!result.ok && this.cache.get(key2) === pending) this.cache.delete(key2);
    });
    return pending;
  }
  clear(key2) {
    if (key2 === void 0) this.cache.clear();
    else this.cache.delete(key2);
  }
  clearPrefix(prefix) {
    for (const key2 of this.cache.keys()) if (key2.startsWith(prefix)) this.cache.delete(key2);
  }
};
function missingCapability(guid) {
  return err$1({
    code: "asset-evidence-capability-missing",
    expected: "an injected runtime evidence source",
    hint: "configure an evidence source before calling inspect(guid) or verifyByGuid(guid)",
    detail: { capability: "runtime evidence source", stage: `guid:${guid}` }
  });
}
async function project(source, guid) {
  const input = await source.evidence(guid);
  if ("ok" in input) {
    if (!input.ok) return input;
    return projectAssetEvidence(input.value);
  }
  return projectAssetEvidence(input);
}
function createRuntimeAssetEvidenceAdapter(source) {
  const read = async (guid) => source === void 0 ? missingCapability(guid) : project(source, guid);
  return { inspect: read, verifyByGuid: read };
}
function parseError(expected, detail, hint = ASSET_ERROR_HINTS["asset-parse-failed"]) {
  return new AssetError({
    code: "asset-parse-failed",
    expected,
    hint,
    ...detail === void 0 ? {} : { detail }
  });
}
function sameRevision(left, right) {
  return left.digest === right.digest && left.observedAt === right.observedAt && left.rootId === right.rootId;
}
function checkExpectedRevision(records, expectedRevision) {
  if (expectedRevision === void 0 || records.length === 0) return void 0;
  const actualRevisions = records.flatMap(
    (record2) => record2.revision === void 0 ? [] : [record2.revision]
  );
  if (actualRevisions.length > 0 && actualRevisions.every((revision) => sameRevision(revision, expectedRevision))) {
    return void 0;
  }
  return parseError(
    "every catalog entry to carry the expected producer revision",
    { expectedRevision, actualRevisions },
    "restore a verified catalog revision before applying the source"
  );
}
function resolveCatalogAssetUrl(registry, packageUrl) {
  const packIndexUrl = registry.packIndexUrl;
  if (packIndexUrl === void 0) return packageUrl;
  try {
    const baseUrl = new URL(packIndexUrl, globalThis.location?.href).href;
    return new URL(packageUrl, baseUrl).href;
  } catch {
    return packageUrl;
  }
}
function isRawSourceLocator(packageUrl) {
  const path = packageUrl.split(/[?#]/, 1)[0]?.toLowerCase() ?? packageUrl.toLowerCase();
  if (path.endsWith(".pack.json")) return false;
  return /\.(bin|fbx|gltf|glb|hdr|jpg|jpeg|png|wav|mp3|ogg|ttf|otf|woff|woff2|svg)$/.test(path) || path.endsWith(".particle-effect.json");
}
function parseCatalog(raw, resolveUrl = (packageUrl) => packageUrl, expectedRevision, expectedScope) {
  let rows;
  if (expectedScope !== void 0) {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
      return err(
        parseError(
          "scoped catalog snapshot to be an object with schema, scopeId, generation, authority, and entries"
        )
      );
    }
    const snapshot = raw;
    if (snapshot.schemaVersion !== "runtime-catalog-snapshot-v1" || typeof snapshot.scopeId !== "string" || typeof snapshot.generation !== "number" || !Number.isSafeInteger(snapshot.generation) || !Array.isArray(snapshot.entries)) {
      return err(parseError("scoped catalog snapshot to satisfy its runtime schema"));
    }
    if (snapshot.scopeId !== expectedScope.scopeId || snapshot.generation !== expectedScope.generation) {
      return err(
        parseError("scoped catalog snapshot to match the active scope and generation", {
          expectedScope,
          actualScope: { scopeId: snapshot.scopeId, generation: snapshot.generation }
        })
      );
    }
    if (snapshot.authority !== "authoritative") {
      return err(
        parseError(
          "scoped catalog snapshot authority to be authoritative before identity lookup",
          { authority: snapshot.authority, diagnostics: snapshot.diagnostics },
          "repair the active game catalog before loading assets"
        )
      );
    }
    rows = snapshot.entries;
  } else if (Array.isArray(raw)) {
    rows = raw;
  } else {
    return err(parseError("pack-index.json to be a JSON array"));
  }
  const catalog = /* @__PURE__ */ new Map();
  for (const item of rows) {
    if (item === null || typeof item !== "object") {
      return err(parseError("each catalog row to be an object"));
    }
    const rawRow = item;
    const legacyLocator = ["relative", "Url"].join("");
    if (legacyLocator in rawRow || "metadata" in rawRow || "compression" in rawRow || "artifacts" in rawRow || "assetCodec" in rawRow || "contentEncoding" in rawRow) {
      return err(parseError("catalog rows to expose navigation fields only"));
    }
    if (typeof rawRow.guid !== "string" || rawRow.guid.length === 0 || typeof rawRow.packageUrl !== "string" || rawRow.packageUrl.length === 0 || typeof rawRow.kind !== "string" || rawRow.kind.length === 0) {
      return err(parseError("each catalog row to contain guid, packageUrl, and kind strings"));
    }
    if (isRawSourceLocator(rawRow.packageUrl)) {
      return err(
        parseError(`catalog packageUrl ${rawRow.packageUrl} to identify a cooked package`)
      );
    }
    const guid = rawRow.guid.toLowerCase();
    if (catalog.has(guid)) return err(parseError(`catalog GUID ${rawRow.guid} to be unique`));
    const refs = rawRow.refs;
    if (refs !== void 0 && (!Array.isArray(refs) || !refs.every((ref) => typeof ref === "string"))) {
      return err(parseError(`catalog refs for GUID ${rawRow.guid} to be a string array`));
    }
    if (rawRow.sourceOverrides !== void 0 && (rawRow.sourceOverrides === null || typeof rawRow.sourceOverrides !== "object" || Array.isArray(rawRow.sourceOverrides))) {
      return err(parseError(`catalog sourceOverrides for GUID ${rawRow.guid} to be an object`));
    }
    if (rawRow.sourceOverrideDescriptors !== void 0 && !Array.isArray(rawRow.sourceOverrideDescriptors)) {
      return err(
        parseError(`catalog sourceOverrideDescriptors for GUID ${rawRow.guid} to be an array`)
      );
    }
    let resolvedUrl;
    try {
      resolvedUrl = resolveUrl(rawRow.packageUrl);
    } catch (error) {
      return err(
        parseError(`catalog entry ${rawRow.guid} to resolve its packageUrl`, {
          packageUrl: rawRow.packageUrl,
          reason: error instanceof Error ? error.message : String(error)
        })
      );
    }
    const row = {
      packageUrl: resolvedUrl,
      kind: rawRow.kind,
      ...rawRow.authoring !== void 0 ? { authoring: rawRow.authoring } : {},
      ...typeof rawRow.name === "string" ? { name: rawRow.name } : {},
      ...typeof rawRow.sourcePath === "string" ? { sourcePath: rawRow.sourcePath } : {},
      ...refs !== void 0 ? { refs } : {},
      ...typeof rawRow.cookReceiptUrl === "string" ? { cookReceiptUrl: rawRow.cookReceiptUrl } : {},
      ...typeof rawRow.packageId === "string" ? { packageId: rawRow.packageId } : {},
      ...rawRow.provenance !== void 0 ? { provenance: rawRow.provenance } : {},
      ...rawRow.revision !== void 0 ? { revision: rawRow.revision } : {},
      ...typeof rawRow.sourceKey === "string" ? { sourceKey: rawRow.sourceKey } : {},
      ...typeof rawRow.sourceIndex === "number" ? { sourceIndex: rawRow.sourceIndex } : {},
      ...rawRow.sourceOverrides !== void 0 ? { sourceOverrides: rawRow.sourceOverrides } : {},
      ...rawRow.sourceOverrideDescriptors !== void 0 ? {
        sourceOverrideDescriptors: rawRow.sourceOverrideDescriptors
      } : {},
      ...Array.isArray(rawRow.relations) ? { relations: rawRow.relations } : {},
      ...Array.isArray(rawRow.diagnostics) ? { diagnostics: rawRow.diagnostics } : {},
      ...rawRow.subject === "internal-asset" || rawRow.subject === "imported-output" ? { subject: rawRow.subject } : {},
      ...rawRow.execution === "direct" || rawRow.execution === "cooked" ? { execution: rawRow.execution } : {},
      ...rawRow.lifecycle === "missing" || rawRow.lifecycle === "cooking" || rawRow.lifecycle === "current" || rawRow.lifecycle === "stale" || rawRow.lifecycle === "failed" ? { lifecycle: rawRow.lifecycle } : {},
      ...rawRow.projection !== void 0 ? { projection: rawRow.projection } : {},
      ...rawRow.publication !== void 0 ? { publication: rawRow.publication } : {}
    };
    catalog.set(guid, row);
  }
  const revisionError = checkExpectedRevision([...catalog.values()], expectedRevision);
  if (revisionError !== void 0) return err(revisionError);
  return ok$1(catalog);
}
async function fetchCatalog(url, fetch, resolveUrl, expectedRevision, expectedScope, requestInit) {
  let raw;
  try {
    const response = requestInit === void 0 ? await fetch(url) : await fetch(url, requestInit);
    if (!response.ok) {
      return err(
        new AssetError({
          code: "asset-fetch-failed",
          expected: `fetch(${url}) to return ok`,
          hint: ASSET_ERROR_HINTS["asset-fetch-failed"]
        })
      );
    }
    raw = await response.json();
  } catch {
    return err(
      new AssetError({
        code: "asset-fetch-failed",
        expected: `fetch(${url}) to succeed`,
        hint: ASSET_ERROR_HINTS["asset-fetch-failed"]
      })
    );
  }
  return parseCatalog(raw, resolveUrl, expectedRevision, expectedScope);
}
function fetchPackIndex(registry) {
  const expectedScope = registry.runtimeBinding !== void 0 && registry.packIndexUrl === registry.runtimeBinding.catalogUrl ? registry.runtimeBinding : void 0;
  return fetchCatalog(
    registry.packIndexUrl,
    globalThis.fetch,
    (packageUrl) => resolveCatalogAssetUrl(registry, packageUrl),
    void 0,
    expectedScope,
    { cache: "no-store" }
  );
}
function guidKey(guid) {
  return guid.toLowerCase();
}
function freezeEntry(entry) {
  return Object.freeze({ ...entry });
}
function freezeSnapshot(snapshot) {
  return Object.freeze({
    ...snapshot,
    entries: Object.freeze(snapshot.entries.map(freezeEntry)),
    diagnostics: Object.freeze([...snapshot.diagnostics])
  });
}
function revisionIsOlder(incoming, current) {
  return incoming !== void 0 && current !== void 0 && incoming.observedAt < current.observedAt;
}
function sameRevision2(left, right) {
  return left.digest === right.digest && left.observedAt === right.observedAt && left.rootId === right.rootId;
}
function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}
function diagnosticForGap() {
  return {
    code: "catalog-gap",
    severity: "blocking",
    expected: "a contiguous producer revision window",
    hint: "reconcile the catalog before consuming incremental changes",
    authority: "catalog"
  };
}
function diagnosticForDegradedRows() {
  return {
    code: "catalog-degraded-rows",
    severity: "blocking",
    expected: "a degraded catalog delta to contain no identity-bearing rows",
    hint: "keep the last verified catalog and reconcile before applying a replacement",
    authority: "catalog"
  };
}
function hasIdentityChanges(delta) {
  return delta.added.length > 0 || delta.changed.length > 0 || delta.removed.length > 0;
}
function revisionDiagnostic(revisions, hasChanges) {
  const baselineByRoot = new Map(revisions.baseline.map((point) => [point.rootId, point]));
  const currentByRoot = new Map(revisions.current.map((point) => [point.rootId, point]));
  for (const point of revisions.current) {
    const baseline = baselineByRoot.get(point.rootId);
    if (baseline === void 0) {
      return {
        code: "catalog-revision-conflict",
        severity: "blocking",
        expected: "every current root to have a verified baseline",
        actual: point.rootId,
        hint: "restore the latest verified snapshot for this root before applying the delta",
        authority: "catalog"
      };
    }
    if (point.revision < baseline.revision) {
      return {
        code: "catalog-revision-stale",
        severity: "blocking",
        expected: "current revision to be at least the verified baseline",
        actual: `${baseline.revision} -> ${point.revision}`,
        hint: "discard the stale update and request a fresh catalog snapshot",
        authority: "catalog"
      };
    }
    if (point.revision === baseline.revision && hasChanges) {
      return {
        code: "catalog-revision-conflict",
        severity: "blocking",
        expected: "a changed delta to advance the root revision",
        actual: `${baseline.revision} -> ${point.revision}`,
        hint: "keep the verified baseline and serialize concurrent updates before retrying",
        authority: "catalog"
      };
    }
    if (point.revision > baseline.revision + 1) {
      return {
        code: "catalog-revision-conflict",
        severity: "blocking",
        expected: "the next revision to be exactly baseline + 1",
        actual: `${baseline.revision} -> ${point.revision}`,
        hint: "request the missing revisions or rebuild from the latest verified snapshot",
        authority: "catalog"
      };
    }
  }
  for (const point of revisions.baseline) {
    if (!currentByRoot.has(point.rootId)) {
      return {
        code: "catalog-revision-conflict",
        severity: "blocking",
        expected: "every baseline root to be present in the current revision set",
        actual: point.rootId,
        hint: "do not apply a partial root set over the verified baseline",
        authority: "catalog"
      };
    }
  }
  return void 0;
}
function rowRevisionDiagnostic(entries, delta) {
  for (const entry of [...delta.added, ...delta.changed]) {
    const prior = entries.get(guidKey(entry.guid));
    if (prior?.revision === void 0) continue;
    if (prior !== void 0 && sameValue(prior, entry)) continue;
    if (entry.revision === void 0) {
      return {
        code: "catalog-revision-conflict",
        severity: "blocking",
        expected: "a replacement row to carry a newer producer revision",
        actual: `${prior.revision.rootId}@${prior.revision.observedAt} -> missing`,
        hint: "restore the producer revision before applying the catalog change",
        authority: "catalog"
      };
    }
    if (entry.revision.observedAt < prior.revision.observedAt) {
      return {
        code: "catalog-revision-stale",
        severity: "blocking",
        expected: "a replacement row to carry a non-decreasing producer revision",
        actual: `${prior.revision.observedAt} -> ${entry.revision.observedAt}`,
        hint: "discard the stale update and request a fresh catalog snapshot",
        authority: "catalog"
      };
    }
    if (entry.revision.observedAt === prior.revision.observedAt) {
      return {
        code: "catalog-revision-conflict",
        severity: "blocking",
        expected: "a changed row to advance its producer revision",
        actual: sameRevision2(prior.revision, entry.revision) ? `${prior.revision.observedAt} -> ${entry.revision.observedAt}` : `${prior.revision.digest} -> ${entry.revision.digest}`,
        hint: "publish a new producer revision for changed payload bytes",
        authority: "catalog"
      };
    }
  }
  return void 0;
}
function diagnosticForScopeMismatch() {
  return {
    code: "catalog-scope-mismatch",
    severity: "blocking",
    expected: "catalog delta scopeId and generation to match the active runtime binding",
    hint: "discard the stale publication and reconcile the active runtime catalog",
    authority: "catalog"
  };
}
function appendDiagnostic(diagnostics, incoming) {
  const next = [...diagnostics];
  for (const diagnostic of incoming ?? []) {
    if (!next.some((existing) => existing.code === diagnostic.code)) next.push(diagnostic);
  }
  return next;
}
var CatalogReplica = class {
  source;
  listeners = /* @__PURE__ */ new Set();
  entries = /* @__PURE__ */ new Map();
  pendingBeforeBaseline = [];
  pendingDuringReconcile;
  unsubscribe;
  startPromise;
  baselineReady = false;
  version = 0;
  stale = false;
  diagnostics = [];
  currentSnapshot;
  expectedScope;
  constructor(source) {
    this.source = source;
    this.expectedScope = source.expectedScope;
    this.currentSnapshot = freezeSnapshot({
      version: 0,
      entries: [],
      stale: false,
      diagnostics: []
    });
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  snapshot() {
    return this.currentSnapshot;
  }
  /**
   * Adopt an already accepted baseline without reading the source again.
   *
   * AssetRegistry uses this when a URL-backed pack index was loaded before a
   * CatalogSource was attached. The replica still subscribes before exposing
   * the baseline, so later deltas retain the same ordering and validation
   * semantics as a normal `start()`.
   */
  seed(entries) {
    if (this.startPromise !== void 0 || this.baselineReady) return;
    if (this.unsubscribe === void 0) {
      this.unsubscribe = this.source.subscribe((delta) => this.receive(delta));
    }
    this.entries.clear();
    for (const entry of entries) this.entries.set(guidKey(entry.guid), freezeEntry(entry));
    this.stale = false;
    this.diagnostics = [];
    this.baselineReady = true;
    const pending = this.pendingBeforeBaseline;
    this.pendingBeforeBaseline = [];
    this.pendingDuringReconcile = void 0;
    for (const delta of pending) this.fold(delta, false);
    this.currentSnapshot = this.makeSnapshot();
  }
  dispose() {
    this.unsubscribe?.();
    this.unsubscribe = void 0;
    this.startPromise = void 0;
    this.pendingBeforeBaseline = [];
    this.pendingDuringReconcile = void 0;
    this.listeners.clear();
  }
  async start() {
    if (this.startPromise !== void 0) return this.startPromise;
    if (this.baselineReady && this.unsubscribe !== void 0) {
      return Promise.resolve(ok$1(this.currentSnapshot));
    }
    if (this.unsubscribe === void 0) {
      this.unsubscribe = this.source.subscribe((delta) => this.receive(delta));
    }
    const promise = this.loadBaseline(false);
    this.startPromise = promise;
    void promise.then((result) => {
      if (!result.ok) this.startPromise = void 0;
    });
    return promise;
  }
  async reconcile() {
    if (this.unsubscribe === void 0) {
      this.unsubscribe = this.source.subscribe((delta) => this.receive(delta));
    }
    this.pendingDuringReconcile = [];
    return this.loadBaseline(true);
  }
  async loadBaseline(isReconcile) {
    const result = await this.source.enumerate();
    if (!result.ok) {
      this.stale = true;
      this.currentSnapshot = this.makeSnapshot();
      if (!isReconcile) this.pendingBeforeBaseline = [];
      this.pendingDuringReconcile = void 0;
      return result;
    }
    this.entries.clear();
    for (const entry of result.value) this.entries.set(guidKey(entry.guid), freezeEntry(entry));
    this.stale = false;
    this.diagnostics = [];
    this.baselineReady = true;
    const pending = isReconcile ? this.pendingDuringReconcile ?? [] : this.pendingBeforeBaseline;
    this.pendingBeforeBaseline = [];
    this.pendingDuringReconcile = void 0;
    for (const delta of pending) this.fold(delta, false);
    this.currentSnapshot = this.makeSnapshot();
    return ok$1(this.currentSnapshot);
  }
  receive(delta) {
    if (!this.baselineReady) {
      if (this.pendingDuringReconcile !== void 0) this.pendingDuringReconcile.push(delta);
      else this.pendingBeforeBaseline.push(delta);
      this.publish(this.safeDelta(delta));
      return;
    }
    if (this.pendingDuringReconcile !== void 0) {
      this.pendingDuringReconcile.push(delta);
      this.publish(this.safeDelta(delta));
      return;
    }
    this.fold(delta, true);
  }
  fold(delta, publish) {
    const safeDelta = this.safeDelta(delta);
    const degraded = safeDelta.authority === "degraded";
    this.stale = this.stale || degraded;
    this.diagnostics = appendDiagnostic(
      this.diagnostics,
      safeDelta.diagnostics?.some((diagnostic) => diagnostic.code === "catalog-gap") ? [...safeDelta.diagnostics ?? [], diagnosticForGap()] : safeDelta.diagnostics
    );
    if (degraded) {
      const affected = new Set(
        (safeDelta.diagnostics ?? []).filter((diagnostic) => diagnostic.code.startsWith("source-package-")).flatMap(
          (diagnostic) => (diagnostic.evidence ?? []).filter((evidence) => evidence.type === "asset").map((evidence) => guidKey(evidence.id))
        )
      );
      for (const key2 of affected) {
        const entry = this.entries.get(key2);
        if (entry?.lifecycle !== "current" || entry.revision === void 0 || entry.projection === void 0 || entry.projection.lastKnownGood !== void 0)
          continue;
        this.entries.set(
          key2,
          freezeEntry({
            ...entry,
            projection: { ...entry.projection, lastKnownGood: { packageUrl: entry.packageUrl } }
          })
        );
      }
    }
    if (!degraded) {
      let changed = false;
      for (const entry of [...safeDelta.added, ...safeDelta.changed]) {
        const key2 = guidKey(entry.guid);
        const prior = this.entries.get(key2);
        if (revisionIsOlder(entry.revision, prior?.revision)) continue;
        if (prior !== void 0 && sameValue(prior, entry)) continue;
        this.entries.set(key2, freezeEntry(entry));
        changed = true;
      }
      for (const guid of safeDelta.removed) {
        if (this.entries.delete(guidKey(guid))) changed = true;
      }
      if (changed) this.version += 1;
    }
    this.currentSnapshot = this.makeSnapshot();
    if (publish) {
      this.publish(safeDelta);
    }
  }
  safeDelta(delta) {
    const diagnostic = this.expectedScope !== void 0 && (delta.scopeId !== this.expectedScope.scopeId || delta.generation !== this.expectedScope.generation) ? diagnosticForScopeMismatch() : delta.revisions === void 0 ? rowRevisionDiagnostic(this.entries, delta) : revisionDiagnostic(delta.revisions, hasIdentityChanges(delta)) ?? rowRevisionDiagnostic(this.entries, delta);
    const degradedRows = delta.authority === "degraded" && hasIdentityChanges(delta);
    if (diagnostic === void 0 && !degradedRows) return delta;
    return {
      ...delta,
      added: [],
      changed: [],
      removed: [],
      authority: "degraded",
      diagnostics: appendDiagnostic(
        [],
        [
          ...diagnostic === void 0 ? [] : [diagnostic],
          ...degradedRows ? [diagnosticForDegradedRows()] : []
        ]
      )
    };
  }
  publish(delta) {
    for (const listener of [...this.listeners]) {
      try {
        listener(delta);
      } catch {
      }
    }
  }
  makeSnapshot() {
    const entries = [...this.entries.values()].sort(
      (left, right) => guidKey(left.guid).localeCompare(guidKey(right.guid))
    );
    this.currentSnapshot = freezeSnapshot({
      version: this.version,
      entries,
      stale: this.stale,
      diagnostics: this.diagnostics
    });
    return this.currentSnapshot;
  }
};
var RuntimeMaterialValue = defineComponent("RuntimeMaterialValue", {
  asset: "shared<MaterialAsset>",
  parameter: "string",
  kind: { type: "enum", labels: { number: 0, boolean: 1, vector: 2 }, default: 0 },
  value: "array<f32>"
});
var RuntimeMeshVertices = defineComponent("RuntimeMeshVertices", {
  asset: "shared<MeshAsset>",
  vertices: "array<f32>",
  indices: "array<u32>"
});
var projections = /* @__PURE__ */ new WeakMap();
function contentProjection(world) {
  let projection = projections.get(world);
  if (projection === void 0) {
    projection = {
      source: createStateProjection(world, [RuntimeMaterialValue, RuntimeMeshVertices]),
      rows: /* @__PURE__ */ new Map(),
      assets: /* @__PURE__ */ new Map(),
      payloads: /* @__PURE__ */ new Map()
    };
    projections.set(world, projection);
  }
  if (projection.source.isCurrent()) return projection;
  const batch = projection.source.read();
  for (const index of batch.indices) {
    const previous = projection.rows.get(index);
    if (previous !== void 0) {
      const entries2 = projection.assets.get(previous.asset);
      entries2?.delete(index);
      if (entries2?.size === 0) projection.assets.delete(previous.asset);
      projection.payloads.delete(previous.asset);
      projection.rows.delete(index);
    }
    const entity = projection.source.entity(index);
    if (entity === void 0) continue;
    const material = world.hasComponent(entity, RuntimeMaterialValue) ? world.get(entity, RuntimeMaterialValue) : void 0;
    const mesh = world.hasComponent(entity, RuntimeMeshVertices) ? world.get(entity, RuntimeMeshVertices) : void 0;
    let row;
    if (material?.ok) {
      const data = material.value;
      row = {
        kind: "material",
        entity,
        asset: Number(data.asset),
        parameter: data.parameter,
        value: data.kind === 2 ? Object.freeze(Array.from(data.value)) : data.kind === 1 ? (data.value[0] ?? 0) !== 0 : data.value[0] ?? 0
      };
    } else if (mesh?.ok) {
      row = {
        kind: "mesh",
        entity,
        asset: Number(mesh.value.asset),
        vertices: mesh.value.vertices.slice(),
        indices: mesh.value.indices.length === 0 ? void 0 : mesh.value.indices.slice()
      };
    } else continue;
    let entries = projection.assets.get(row.asset);
    if (entries === void 0) {
      entries = /* @__PURE__ */ new Map();
      projection.assets.set(row.asset, entries);
    }
    entries.set(index, row);
    projection.rows.set(index, row);
    projection.payloads.delete(row.asset);
  }
  batch.accept();
  return projection;
}
function meshContent(base, row) {
  const vertices = row.vertices;
  const layout = deriveVertexLayoutProjection(base.attributes);
  const count = deriveVertexCount(vertices, layout);
  if (count === void 0)
    throw new AssetError({
      code: "mesh-vertex-stride-mismatch",
      expected: "complete rows of the source vertex layout",
      hint: "Write a vertex buffer matching the source mesh layout, then resolve the same asset again."
    });
  const attributes = {};
  const bytes = new DataView(vertices.buffer, vertices.byteOffset, vertices.byteLength);
  for (const attribute of layout.attributes) {
    const integer = attribute.format.startsWith("uint16");
    const width = integer ? 2 : 4;
    const arity = attribute.byteLength / width;
    const values = integer ? new Uint16Array(count * arity) : new Float32Array(count * arity);
    for (let row2 = 0; row2 < count; row2++)
      for (let lane = 0; lane < arity; lane++) {
        const offset = row2 * layout.arrayStride + attribute.offset + lane * width;
        values[row2 * arity + lane] = integer ? bytes.getUint16(offset, true) : bytes.getFloat32(offset, true);
      }
    attributes[attribute.key] = values;
  }
  const position = attributes.position;
  if (position === void 0)
    throw new AssetError({
      code: "asset-invalid-value",
      expected: "runtime mesh position attribute",
      hint: "Use a source mesh with a position attribute."
    });
  return Object.freeze({
    ...base,
    vertices,
    ...row.indices === void 0 ? {} : { indices: row.indices },
    attributes: Object.freeze(attributes),
    aabb: box3.fromPositions(box3.create(), position)
  });
}
function projectRuntimeAsset(world, handle, base) {
  if (base.kind !== "material" && base.kind !== "mesh") return ok(base);
  const projection = contentProjection(world);
  const rows = projection.assets.get(handle);
  if (rows === void 0) return ok(base);
  const cached = projection.payloads.get(handle);
  if (cached?.base === base) return ok(cached.value);
  let result = base;
  if (base.kind === "material") {
    const material = base;
    const values = { ...material.values };
    const parameters = /* @__PURE__ */ new Set();
    for (const row of rows.values())
      if (row.kind === "material") {
        if (parameters.has(row.parameter))
          return err$1(
            new AssetError({
              code: "asset-invalid-value",
              expected: "one content entity per material parameter",
              hint: "Remove the duplicate RuntimeMaterialValue or rebind its asset/parameter."
            })
          );
        parameters.add(row.parameter);
        values[row.parameter] = row.value;
      }
    result = Object.freeze({ ...material, values: Object.freeze(values) });
  } else {
    try {
      let found = false;
      for (const row of rows.values())
        if (row.kind === "mesh") {
          if (found)
            return err$1(
              new AssetError({
                code: "asset-invalid-value",
                expected: "one content entity per mesh",
                hint: "Remove the duplicate RuntimeMeshVertices or rebind its asset."
              })
            );
          found = true;
          result = meshContent(base, row);
          const invalid2 = validateMeshPayload(result);
          if (invalid2 !== null) return err$1(invalid2);
        }
    } catch (cause) {
      if (cause instanceof AssetError) return err$1(cause);
      throw cause;
    }
  }
  projection.payloads.set(handle, { base, value: result });
  return ok(result);
}
function resolveAssetHandle(world, handle) {
  if ("resolveAsset" in world) return world.resolveAsset(handle);
  const slot = handleSlot(handle);
  if (slot < BUILTIN_BASE) {
    const builtin = BuiltinAssetRegistry.resolve(handle);
    if (builtin !== null)
      return projectRuntimeAsset(world, Number(handle), builtin);
    return err(
      new AssetError({
        code: "asset-not-found",
        expected: `builtin slot ${slot} present in BuiltinAssetRegistry`,
        hint: ASSET_ERROR_HINTS["asset-not-found"]
      })
    );
  }
  const res = world.sharedRefs.resolve(handle);
  if (res.ok) return projectRuntimeAsset(world, Number(handle), res.value);
  switch (res.error.code) {
    case "shared-ref-stale":
      return err(res.error);
  }
  return err(
    new AssetError({
      code: "asset-not-found",
      expected: `user-tier slot ${slot} present in world.sharedRefs`,
      hint: ASSET_ERROR_HINTS["asset-not-found"]
    })
  );
}
function walkMaterialPassesOverSharedRefs(world, handle, registry) {
  const rootRes = resolveAssetHandle(
    world,
    handle
  );
  const rootLabel = `handle-${handleSlot(handle)}`;
  if (!rootRes.ok) return err(rootRes.error);
  const table = {};
  const visited = /* @__PURE__ */ new Set();
  const collect = (label, material) => {
    if (visited.has(label)) return;
    visited.add(label);
    table[label] = material;
    if (material.parent === void 0) return;
    const parentId = materialGuidText(material.parent);
    const parent = registry.lookup(material.parent);
    if (parent?.kind === "material") collect(parentId, parent);
  };
  collect(rootLabel, rootRes.value);
  const resolved = resolveMaterialAsset(rootLabel, table);
  if (!resolved.ok) return err(resolved.error);
  return ok$1({
    passes: [...resolved.value.asset.passes ?? []],
    parameters: resolved.value.asset.parameters ?? [],
    values: {
      ...Object.fromEntries(
        (resolved.value.asset.parameters ?? []).flatMap(
          (parameter) => parameter.default === void 0 ? [] : [[parameter.name, parameter.default]]
        )
      ),
      ...resolved.value.asset.values ?? {}
    },
    colorSpace: resolved.value.asset.colorSpace,
    surface: resolved.value.asset.surface
  });
}
function extractSceneEntityHandleGuids(components, entities) {
  const entries = [];
  for (const [entityKey, node] of Object.entries(entities)) {
    const rawComponents = node.components;
    for (const compName of Object.keys(rawComponents)) {
      const rawFields = rawComponents[compName];
      if (!rawFields) continue;
      const comp = components.get(compName);
      if (!comp) continue;
      for (const fieldName of Object.keys(rawFields)) {
        forEachHandleGuid(
          componentSchema(comp)[fieldName],
          rawFields[fieldName],
          (guidString, arrayIndex) => {
            entries.push({
              entityKey,
              componentName: compName,
              fieldName,
              guidString,
              ...arrayIndex !== void 0 ? { arrayIndex } : {}
            });
          }
        );
      }
    }
  }
  return entries;
}
function forEachHandleGuid(fieldType, value, sink) {
  if (fieldType === void 0 || typeof fieldType !== "string") return;
  if (fieldType.startsWith("shared<")) {
    if (typeof value === "string") sink(value);
    return;
  }
  if (fieldType.startsWith("array<shared<") && Array.isArray(value)) {
    for (let elemIdx = 0; elemIdx < value.length; elemIdx++) {
      const elem = value[elemIdx];
      if (typeof elem === "string") sink(elem, elemIdx);
    }
  }
}
var SCENE_PUBLICATION_FENCE_SCHEMA = "scene-publication-fence/1";
var SCENE_PUBLICATION_RECOVERY_ACTIONS = Object.freeze([
  "continue-last-known-good",
  "retry-rebuild",
  "fresh-reopen"
]);
function errorFor(phase, hint, input = {}) {
  return {
    code: "asset-generation-fence-mismatch",
    phase,
    hint,
    ...input.publication === void 0 ? {} : {
      sourcePath: input.publication.sourcePath,
      sourceRevision: input.publication.sourceRevision
    },
    ...input.expected === void 0 ? {} : { expected: input.expected },
    ...input.actual === void 0 ? {} : { actual: input.actual },
    ...input.actual === void 0 ? {} : { currentGeneration: input.actual.publicationGeneration },
    ...input.lastKnownGood === void 0 ? {} : { lastKnownGood: input.lastKnownGood },
    retryable: input.retryable ?? false,
    recoveryActions: SCENE_PUBLICATION_RECOVERY_ACTIONS
  };
}
function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function sameFence(left, right) {
  return left.schemaVersion === right.schemaVersion && left.sourcePath === right.sourcePath && left.sourceRevision === right.sourceRevision && left.publicationGeneration === right.publicationGeneration && left.outputDigest === right.outputDigest && left.outputSetDigest === right.outputSetDigest && left.receiptIdentity === right.receiptIdentity;
}
function createScenePublicationFence(publication) {
  if (publication.outputs.length === 0) {
    return err(
      errorFor("publication", "publication must contain at least one output", { publication })
    );
  }
  if (!Number.isSafeInteger(publication.generation) || publication.generation < 1) {
    return err(
      errorFor("publication", "publication generation must be a positive integer", { publication })
    );
  }
  const receipt = publication.receipt;
  if (receipt.schemaVersion !== "asset-publication-receipt/1" || receipt.sourcePath !== publication.sourcePath || receipt.sourceRevision !== publication.sourceRevision || receipt.outputDigest !== publication.digest || receipt.outputSetDigest !== publication.outputSetDigest) {
    return err(
      errorFor("publication", "publication receipt does not match the complete output tuple", {
        publication
      })
    );
  }
  const outputGuids = /* @__PURE__ */ new Set();
  for (const output of publication.outputs) {
    const key2 = output.guid.toLowerCase();
    if (outputGuids.has(key2)) {
      return err(
        errorFor("publication", "publication output GUIDs must be unique", { publication })
      );
    }
    outputGuids.add(key2);
  }
  return ok$1({
    schemaVersion: SCENE_PUBLICATION_FENCE_SCHEMA,
    sourcePath: publication.sourcePath,
    sourceRevision: publication.sourceRevision,
    publicationGeneration: publication.generation,
    outputDigest: publication.digest,
    outputSetDigest: publication.outputSetDigest,
    receiptIdentity: receipt.inputFingerprint
  });
}
function parseScenePublicationFence(value) {
  if (!isRecord(value) || value.schemaVersion !== SCENE_PUBLICATION_FENCE_SCHEMA || typeof value.sourcePath !== "string" || typeof value.sourceRevision !== "string" || !Number.isSafeInteger(value.publicationGeneration) || value.publicationGeneration < 1 || typeof value.outputDigest !== "string" || typeof value.outputSetDigest !== "string" || typeof value.receiptIdentity !== "string") {
    return err(errorFor("publication", "publication fence shape is incomplete or invalid"));
  }
  const generation = value.publicationGeneration;
  return ok$1(
    Object.freeze({
      schemaVersion: SCENE_PUBLICATION_FENCE_SCHEMA,
      sourcePath: value.sourcePath,
      sourceRevision: value.sourceRevision,
      publicationGeneration: generation,
      outputDigest: value.outputDigest,
      outputSetDigest: value.outputSetDigest,
      receiptIdentity: value.receiptIdentity
    })
  );
}
function compareScenePublicationFences(expected, actual, lastKnownGood) {
  if (sameFence(expected, actual)) return ok$1(actual);
  const input = {
    expected,
    actual,
    retryable: true,
    ...lastKnownGood === void 0 ? {} : { lastKnownGood }
  };
  return err(
    errorFor("observation", "publication fence does not match the expected complete tuple", input)
  );
}
function scenePublicationFenceFromCatalog(entries, outputGuid) {
  const row = entries.find((entry) => entry.guid.toLowerCase() === outputGuid.toLowerCase());
  const publication = row?.publication;
  if (publication === void 0) {
    return err(errorFor("catalog", "Catalog row has no complete publication tuple"));
  }
  const expected = new Set(publication.outputs.map((output) => output.guid.toLowerCase()));
  const observed = entries.filter((entry) => expected.has(entry.guid.toLowerCase()));
  if (observed.length !== expected.size || observed.some(
    (entry) => entry.publication?.sourcePath !== publication.sourcePath || entry.publication?.generation !== publication.generation || entry.publication?.digest !== publication.digest || entry.publication?.outputSetDigest !== publication.outputSetDigest
  )) {
    return err(
      errorFor("catalog", "Catalog does not contain one complete publication tuple", {
        publication
      })
    );
  }
  return createScenePublicationFence(publication);
}
async function observeScenePublication(input) {
  const created = createScenePublicationFence(input.publication);
  if (!created.ok) return created;
  const timeoutMs = input.timeoutMs ?? 5e3;
  const wait = Promise.all(
    input.publication.outputs.map((output) => input.waitForOutput(output.guid))
  );
  let timer;
  try {
    await Promise.race([
      wait,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("publication-observation-timeout")), timeoutMs);
      })
    ]);
  } catch {
    const failureInput = {
      publication: input.publication,
      actual: created.value,
      retryable: true,
      ...input.lastKnownGood === void 0 ? {} : { lastKnownGood: input.lastKnownGood }
    };
    return err(
      errorFor(
        "observation",
        "publication output observation did not complete before the fence deadline",
        failureInput
      )
    );
  } finally {
    if (timer !== void 0) clearTimeout(timer);
  }
  return ok$1({
    fence: created.value,
    outputs: input.publication.outputs.map((output) => output.guid)
  });
}

// src/registry/instantiate.ts
function catalogEntriesForFence(registry) {
  const byGuid = /* @__PURE__ */ new Map();
  for (const entry of registry.catalogSnapshot()?.entries ?? []) {
    byGuid.set(entry.guid.toLowerCase(), entry);
  }
  for (const [guid, record2] of registry.packIndexCache ?? []) {
    if (record2.sourcePath === void 0) continue;
    const candidate = { ...record2, guid, sourcePath: record2.sourcePath };
    const current = byGuid.get(guid.toLowerCase());
    if (current === void 0 || candidate.publication !== void 0) {
      byGuid.set(guid.toLowerCase(), candidate);
    }
  }
  return [...byGuid.values()];
}
function sceneSourceKeyForGuid(registry, guid) {
  if (guid === void 0) return void 0;
  const key2 = guid.toLowerCase();
  const snapshotEntry = registry.catalogSnapshot()?.entries.find((entry) => entry.guid.toLowerCase() === key2);
  if (snapshotEntry?.sourceKey !== void 0) return snapshotEntry.sourceKey;
  return registry.packIndexCache?.get(key2)?.sourceKey;
}
function scenePublicationFenceFromRegistry(registry, outputGuid) {
  return scenePublicationFenceFromCatalog(catalogEntriesForFence(registry), outputGuid);
}
function validateKeyedScenePublication(registry, scene, rootGuid) {
  if (rootGuid === void 0) return ok$1(void 0);
  const entries = catalogEntriesForFence(registry);
  const byGuid = new Map(entries.map((entry) => [entry.guid.toLowerCase(), entry]));
  const rootEntry = byGuid.get(rootGuid.toLowerCase());
  const rootPublication = rootEntry?.publication;
  if (rootPublication === void 0) return ok$1(void 0);
  const visited = /* @__PURE__ */ new Set();
  const visit = (current, parentPublication, path) => {
    for (const [entityKey, node] of Object.entries(current.entities)) {
      const source = node.instance?.source;
      if (source === void 0) continue;
      const childGuid = source.toLowerCase();
      const childEntry = byGuid.get(childGuid);
      const childPublication = childEntry?.publication;
      const address = [...path, entityKey].join("/");
      if (childPublication === void 0) {
        return err({
          code: "asset-generation-fence-mismatch",
          phase: "instantiate",
          hint: `nested SceneAsset publication is unavailable at ${address}`,
          ...childEntry?.sourcePath === void 0 ? {} : { sourcePath: childEntry.sourcePath },
          retryable: true,
          recoveryActions: ["continue-last-known-good", "retry-rebuild", "fresh-reopen"]
        });
      }
      const evidence = parentPublication.externalEvidence.find(
        (item) => item.guid.toLowerCase() === childGuid
      );
      const childOutput = childPublication.outputs.find(
        (output) => output.guid.toLowerCase() === childGuid
      );
      if (evidence !== void 0 && (evidence.generation !== void 0 || evidence.digest !== void 0)) {
        if (evidence.generation !== void 0 && evidence.generation !== childPublication.generation || evidence.digest !== void 0 && (childOutput === void 0 || evidence.digest !== childOutput.digest)) {
          return err({
            code: "asset-generation-fence-mismatch",
            phase: "instantiate",
            hint: `nested SceneAsset publication changed at ${address}`,
            sourcePath: childPublication.sourcePath,
            sourceRevision: childPublication.sourceRevision,
            currentGeneration: childPublication.generation,
            retryable: true,
            recoveryActions: ["continue-last-known-good", "retry-rebuild", "fresh-reopen"]
          });
        }
      }
      if (visited.has(childGuid)) continue;
      visited.add(childGuid);
      const child = childEntry?.guid === void 0 ? void 0 : registry.assetCatalog.get(childGuid)?.payload;
      if (child?.kind === "scene") {
        const nested = visit(child, childPublication, [...path, entityKey]);
        if (!nested.ok) return nested;
      }
    }
    return ok$1(void 0);
  };
  return visit(scene, rootPublication, []);
}
function resolveHandleGuid(registry, world, guidString, guidToHandle, fieldPath, location) {
  const guidRes = AssetGuid.parse(guidString);
  if (!guidRes.ok) {
    return err(
      new AssetError({
        code: "asset-not-found",
        expected: `valid GUID string for field ${fieldPath}`,
        hint: `GUID "${guidString}" could not be parsed; at ${location}, field=${fieldPath}`
      })
    );
  }
  const guidKey2 = guidString.toLowerCase();
  let slot = guidToHandle.get(guidKey2);
  if (slot === void 0) {
    const envelope = registry.assetCatalog.get(guidKey2);
    if (envelope === void 0) {
      return err(
        new AssetError({
          code: "asset-not-found",
          expected: `GUID ${guidString} catalogued in AssetRegistry`,
          hint: `GUID ${guidString} not catalogued; call loadByGuid('${guidString}') before instantiate; at ${location}, field=${fieldPath}`
        })
      );
    }
    slot = unwrapHandle(world.internSharedRef(envelope.payload.kind, envelope.payload));
    guidToHandle.set(guidKey2, slot);
  }
  return ok$1(slot);
}
function rollbackSpawn(world, roots, allocHandles, internedHandles, sharedRefBaseline) {
  for (const root of new Set(roots)) {
    void worldDespawnScene(world, root);
  }
  for (const raw of new Set(allocHandles)) {
    const handle = raw;
    if (world.sharedRefs.refcount(handle) > 0) void world.sharedRefs.release(handle);
  }
  for (const raw of new Set(internedHandles)) {
    if (world.sharedRefs._liveCount() <= sharedRefBaseline) break;
    const handle = raw;
    if (world.sharedRefs.refcount(handle) === 1) void world.sharedRefs.release(handle);
  }
}
function instantiate(registry, handle, world, parent, expectedPublication) {
  const sharedRefBaseline = world.sharedRefs._liveCount();
  const allocHandles = [];
  const internedHandles = [];
  let instantiateResult;
  const sceneRes0 = resolveAssetHandle(
    world,
    handle
  );
  const sceneAsset = sceneRes0.ok ? sceneRes0.value : void 0;
  if (sceneAsset !== void 0 && sceneAsset.kind !== "scene") {
    return err(
      new AssetError({
        code: "asset-invalid-value",
        expected: "instantiate handle resolves to a SceneAsset",
        hint: `resolved asset kind was ${sceneAsset.kind}`
      })
    );
  }
  if (sceneAsset !== void 0 && sceneAsset.kind === "scene") {
    const sceneGuidKey = registry._guidForAsset(sceneAsset);
    const sceneSourceKey = sceneSourceKeyForGuid(registry, sceneGuidKey);
    const nestedPublication = validateKeyedScenePublication(registry, sceneAsset, sceneGuidKey);
    if (!nestedPublication.ok) return nestedPublication;
    if (expectedPublication !== void 0) {
      const entries = catalogEntriesForFence(registry);
      if (sceneGuidKey === void 0) {
        return err({
          code: "asset-generation-fence-mismatch",
          phase: "instantiate",
          hint: "generated Scene source has no Catalog identity for publication fence validation",
          retryable: true,
          recoveryActions: ["continue-last-known-good", "retry-rebuild", "fresh-reopen"]
        });
      }
      const current = scenePublicationFenceFromCatalog(entries, sceneGuidKey);
      if (!current.ok) return current;
      const matches = compareScenePublicationFences(expectedPublication, current.value);
      if (!matches.ok) return matches;
    }
    const guidToHandle = /* @__PURE__ */ new Map();
    const resolvedSceneHandles = /* @__PURE__ */ new Map();
    const sceneRes = registry._resolveSceneGuids(
      sceneAsset,
      world,
      sceneGuidKey,
      void 0,
      guidToHandle,
      resolvedSceneHandles
    );
    if (!sceneRes.ok) {
      rollbackSpawn(
        world,
        [],
        [...resolvedSceneHandles.values()],
        [...guidToHandle.values()],
        sharedRefBaseline
      );
      return sceneRes;
    }
    internedHandles.push(...guidToHandle.values());
    allocHandles.push(...resolvedSceneHandles.values());
    if (sceneGuidKey !== void 0) {
      registry._originIndex.set(sceneRes.value, sceneGuidKey);
    }
    const sharedHandle = world.allocSharedRef("SceneAsset", sceneRes.value);
    allocHandles.push(unwrapHandle(sharedHandle));
    worldSetSceneAssetResolver(world, (source, _parentHandle) => {
      if (typeof source === "number") {
        return ok$1(source);
      }
      const resolved = resolvedSceneHandles.get(source.toLowerCase());
      if (resolved !== void 0) {
        return ok$1(resolved);
      }
      return err({
        code: "asset-not-found",
        expected: `mount source GUID ${source} resolved before instantiate`,
        hint: PACK_ERROR_HINTS["pack-cyclic-reference"]
      });
    });
    const sceneInst = worldInstantiateScene(world, sharedHandle, parent, sceneSourceKey);
    if (!sceneInst.ok) {
      rollbackSpawn(world, [], allocHandles, internedHandles, sharedRefBaseline);
      return sceneInst;
    }
    instantiateResult = ok$1(sceneInst.value.root);
  } else {
    const sceneInst = worldInstantiateScene(
      world,
      handle,
      parent
    );
    if (!sceneInst.ok) {
      return sceneInst;
    }
    instantiateResult = ok$1(sceneInst.value.root);
  }
  const hook = registry.postSpawnHook;
  if (hook !== void 0) {
    const self = registry;
    const resolver = {
      resolveSkinAsset(skeletonHandleRaw) {
        const skelRes = resolveAssetHandle(
          world,
          skeletonHandleRaw
        );
        if (!skelRes.ok) return void 0;
        const skeletonPayload = skelRes.value;
        const skeletonGuid = self._guidForAsset(skeletonPayload);
        if (skeletonGuid === void 0) return void 0;
        for (const [, envelope] of self.assetCatalog) {
          const asset = envelope.payload;
          if (asset.kind !== "skin") continue;
          const skinSkeletonGuid = asset.skeletonGuid;
          if (skinSkeletonGuid === void 0) continue;
          if (skinSkeletonGuid.toLowerCase() === skeletonGuid) {
            return asset;
          }
        }
        return void 0;
      }
    };
    const jointResolveResult = hook(world, resolver, instantiateResult.value);
    if (!jointResolveResult.ok) {
      rollbackSpawn(
        world,
        [instantiateResult.value],
        allocHandles,
        internedHandles,
        sharedRefBaseline
      );
      return { ok: false, error: jointResolveResult.error };
    }
  }
  return instantiateResult;
}
function instantiateFlat(registry, handle, world, expectedPublication) {
  const sharedRefBaseline = world.sharedRefs._liveCount();
  const allocHandles = [];
  const internedHandles = [];
  let roots;
  let mountEntities;
  const sceneRes0 = resolveAssetHandle(
    world,
    handle
  );
  const sceneAsset = sceneRes0.ok ? sceneRes0.value : void 0;
  if (sceneAsset !== void 0 && sceneAsset.kind === "scene") {
    const sceneGuidKey = registry._guidForAsset(sceneAsset);
    const nestedPublication = validateKeyedScenePublication(registry, sceneAsset, sceneGuidKey);
    if (!nestedPublication.ok) return nestedPublication;
    if (expectedPublication !== void 0) {
      const entries = catalogEntriesForFence(registry);
      if (sceneGuidKey === void 0) {
        return err({
          code: "asset-generation-fence-mismatch",
          phase: "instantiate",
          hint: "generated Scene source has no Catalog identity for publication fence validation",
          retryable: true,
          recoveryActions: ["continue-last-known-good", "retry-rebuild", "fresh-reopen"]
        });
      }
      const current = scenePublicationFenceFromCatalog(entries, sceneGuidKey);
      if (!current.ok) return current;
      const matches = compareScenePublicationFences(expectedPublication, current.value);
      if (!matches.ok) return matches;
    }
    const guidToHandle = /* @__PURE__ */ new Map();
    const resolvedSceneHandles = /* @__PURE__ */ new Map();
    const sceneRes = registry._resolveSceneGuids(
      sceneAsset,
      world,
      sceneGuidKey,
      void 0,
      guidToHandle,
      resolvedSceneHandles
    );
    if (!sceneRes.ok) {
      rollbackSpawn(
        world,
        [],
        [...resolvedSceneHandles.values()],
        [...guidToHandle.values()],
        sharedRefBaseline
      );
      return sceneRes;
    }
    internedHandles.push(...guidToHandle.values());
    allocHandles.push(...resolvedSceneHandles.values());
    if (sceneGuidKey !== void 0) {
      registry._originIndex.set(sceneRes.value, sceneGuidKey);
    }
    const sharedHandle = world.allocSharedRef("SceneAsset", sceneRes.value);
    allocHandles.push(unwrapHandle(sharedHandle));
    worldSetSceneAssetResolver(world, (source, _parentHandle) => {
      if (typeof source === "number") {
        return ok$1(source);
      }
      const resolved = resolvedSceneHandles.get(source.toLowerCase());
      if (resolved !== void 0) {
        return ok$1(resolved);
      }
      return err({
        code: "asset-not-found",
        expected: `mount source GUID ${source} resolved before instantiate`,
        hint: PACK_ERROR_HINTS["pack-cyclic-reference"]
      });
    });
    const sceneInst = worldInstantiateSceneFlat(world, sharedHandle);
    if (!sceneInst.ok) {
      rollbackSpawn(world, [], allocHandles, internedHandles, sharedRefBaseline);
      return sceneInst;
    }
    roots = sceneInst.value.roots;
    mountEntities = sceneInst.value.mountEntities;
  } else {
    const sceneInst = worldInstantiateSceneFlat(world, handle);
    if (!sceneInst.ok) {
      return sceneInst;
    }
    roots = sceneInst.value.roots;
    mountEntities = sceneInst.value.mountEntities;
  }
  const hook = registry.postSpawnHook;
  if (hook !== void 0) {
    const self = registry;
    const resolver = {
      resolveSkinAsset(skeletonHandleRaw) {
        const skelRes = resolveAssetHandle(
          world,
          skeletonHandleRaw
        );
        if (!skelRes.ok) return void 0;
        const skeletonPayload = skelRes.value;
        const skeletonGuid = self._guidForAsset(skeletonPayload);
        if (skeletonGuid === void 0) return void 0;
        for (const [, envelope] of self.assetCatalog) {
          const asset = envelope.payload;
          if (asset.kind !== "skin") continue;
          const skinSkeletonGuid = asset.skeletonGuid;
          if (skinSkeletonGuid === void 0) continue;
          if (skinSkeletonGuid.toLowerCase() === skeletonGuid) {
            return asset;
          }
        }
        return void 0;
      }
    };
    const hookRoots = new Set(roots);
    for (const mountEntity of mountEntities) hookRoots.add(mountEntity);
    for (const root of hookRoots) {
      const jointResolveResult = hook(world, resolver, root);
      if (!jointResolveResult.ok) {
        rollbackSpawn(
          world,
          [...roots, ...mountEntities],
          allocHandles,
          internedHandles,
          sharedRefBaseline
        );
        return { ok: false, error: jointResolveResult.error };
      }
    }
  }
  for (const raw of new Set(allocHandles)) void world.sharedRefs.release(raw);
  return ok$1(roots);
}
function buildSceneChildContext(registry, scene, subGuidKey, sceneGuidKey) {
  let sceneEnvelope;
  if (sceneGuidKey !== void 0) {
    const env = registry.assetCatalog.get(sceneGuidKey);
    if (env?.kind === "scene") sceneEnvelope = env;
  }
  if (sceneEnvelope === void 0) {
    for (const [, env] of registry.assetCatalog) {
      if (env.kind === "scene" && env.refs !== void 0 && env.refs.length > 0) {
        sceneEnvelope = env;
        break;
      }
    }
  }
  let edgeResult;
  if (sceneEnvelope?.refs !== void 0) {
    for (const ref of sceneEnvelope.refs) {
      if (ref.guid.toLowerCase() === subGuidKey) {
        const { sceneEntityKey, sourceField } = ref;
        const result = {};
        if (sceneEntityKey !== void 0) {
          result.sceneEntityKey = sceneEntityKey;
        }
        if (sourceField?.componentName !== void 0 && sourceField?.fieldName !== void 0) {
          result.componentField = `${sourceField.componentName}.${sourceField.fieldName}` + (sourceField.arrayIndex !== void 0 ? `[${sourceField.arrayIndex}]` : "");
        }
        if (sourceField !== void 0) {
          result.sourceField = sourceField;
        }
        if (result.sceneEntityKey !== void 0 || result.componentField !== void 0) {
          return result;
        }
        edgeResult = result;
        break;
      }
    }
  }
  const entries = extractSceneEntityHandleGuids(registry.componentCatalog, scene.entities);
  for (const entry of entries) {
    if (entry.guidString.toLowerCase() === subGuidKey) {
      return {
        sceneEntityKey: entry.entityKey,
        componentField: `${entry.componentName}.${entry.fieldName}${entry.arrayIndex !== void 0 ? `[${entry.arrayIndex}]` : ""}`,
        // feat-20260622 verify r1: also surface the recovered provenance in
        // structured parts so the failure `.detail` can expose them for AI
        // property access (charter P3), not only the concatenated hint string.
        sourceField: {
          componentName: entry.componentName,
          fieldName: entry.fieldName,
          ...entry.arrayIndex !== void 0 ? { arrayIndex: entry.arrayIndex } : {}
        }
      };
    }
  }
  return edgeResult;
}
function buildBreadcrumbHint(parentGuidKey, parentKind, subGuidKey, parentContext) {
  let breadcrumb = `sub-asset ${subGuidKey} referenced by ${parentKind} ${parentGuidKey}`;
  const entity = parentContext?.sceneEntityKey;
  if (entity !== void 0 && parentContext?.componentField !== void 0) {
    breadcrumb += ` (entity ${entity}, field ${parentContext.componentField})`;
  }
  return breadcrumb;
}
function materialError(request, code, expected, hint, detail = {}, retryable = false) {
  return {
    status: "Error",
    error: {
      code,
      expected,
      hint,
      retryable,
      recoveryActions: retryable ? ["retry-material-load"] : ["recook-material-publication"],
      detail: { guid: request.guid, specializationKey: request.specializationKey, ...detail }
    }
  };
}
function missingCook(request) {
  return materialError(
    request,
    "material-specialization-not-cooked",
    "a cooked material specialization record and artifact",
    "run the build-time material cooker for this specialization before loading it at runtime",
    {},
    true
  );
}
function recordError(request, field, expected = "a complete material-cook/4 publication record") {
  return materialError(
    request,
    "material-cook-record-invalid",
    expected,
    "re-publish the material record and its artifact as one immutable publication",
    { field }
  );
}
function immutableBytes(bytes) {
  return new Uint8Array(bytes);
}
function immutableParameterContract(parameterContract) {
  return Object.freeze({
    parameters: Object.freeze([...parameterContract.parameters]),
    values: Object.freeze({ ...parameterContract.values })
  });
}
function sameBytes(left, right) {
  return left.byteLength === right.byteLength && left.every((byte, index) => byte === right[index]);
}
function completeTupleField(record2) {
  if (typeof record2.materialGuid !== "string" || !Number.isSafeInteger(record2.publicationGeneration) || record2.publicationGeneration < 1)
    return "publicationGeneration";
  if (typeof record2.specializationKey !== "string" || record2.specializationKey.length === 0)
    return "specializationKey";
  if (typeof record2.artifactDigest !== "string" || record2.artifactDigest.length === 0)
    return "artifactDigest";
  if (!Array.isArray(record2.sourceClosure) || record2.sourceClosure.some((path) => typeof path !== "string" || path.length === 0))
    return "sourceClosure";
  const parameterContract = record2.parameterContract;
  if (parameterContract === void 0 || !Array.isArray(parameterContract.parameters) || parameterContract.values === null || typeof parameterContract.values !== "object" || Array.isArray(parameterContract.values))
    return "parameterContract";
  const receipt = record2.receipt;
  if (!Array.isArray(receipt.sourceClosure) || receipt.sourceClosure.some((path) => typeof path !== "string" || path.length === 0) || receipt.sourceClosure.length !== record2.sourceClosure.length || receipt.sourceClosure.some((path, index) => path !== record2.sourceClosure?.[index]))
    return "receipt.sourceClosure";
  if (typeof receipt.profile !== "string" || receipt.profile.length === 0 || typeof receipt.compilerVersion !== "string" || receipt.compilerVersion.length === 0 || typeof receipt.identity.cookIdentity !== "string" || receipt.identity.cookIdentity.length === 0 || receipt.identity.artifactDigest !== record2.artifactDigest || receipt.identity.cookGeneration !== record2.publicationGeneration)
    return "receipt";
  if (typeof receipt.identity.layoutIdentity !== "string" || receipt.identity.layoutIdentity.length === 0 || receipt.derivedInterface?.layoutIdentity !== receipt.identity.layoutIdentity)
    return "receipt.identity.layoutIdentity";
  let expectedLayerPlanIdentity;
  try {
    expectedLayerPlanIdentity = materialLayerPlanIdentity(record2);
  } catch {
    return "resolved.layerPlanIdentity";
  }
  if (expectedLayerPlanIdentity !== void 0 && receipt.derivedInterface.layerPlanIdentity !== expectedLayerPlanIdentity)
    return "receipt.derivedInterface.layerPlanIdentity";
  return void 0;
}
function createMaterialLoader(options) {
  return {
    async load(request) {
      const publication = await options.loadPublication(request.guid, request.specializationKey);
      if (publication === void 0) return missingCook(request);
      if (publication.artifactError !== void 0) {
        return materialError(
          request,
          publication.artifactError.code,
          publication.artifactError.expected,
          "restore the published material artifact and retry the load",
          {
            expected: publication.artifactError.expected,
            ...publication.artifactError.actual === void 0 ? {} : { actual: publication.artifactError.actual }
          },
          true
        );
      }
      const parsed = validateCookedMaterialRecord(publication.record);
      if (!parsed.ok) return recordError(request, parsed.error.detail.field);
      const record2 = parsed.value;
      const invalidTupleField = completeTupleField(record2);
      if (invalidTupleField !== void 0) return recordError(request, invalidTupleField);
      const publicationGeneration = record2.publicationGeneration;
      const sourceClosure = record2.sourceClosure;
      const parameterContract = record2.parameterContract;
      const materialGuid = record2.materialGuid;
      const recordSpecializationKey = record2.specializationKey;
      const artifactDigest = record2.artifactDigest;
      if (publicationGeneration === void 0) return recordError(request, "publicationGeneration");
      if (sourceClosure === void 0) return recordError(request, "sourceClosure");
      if (parameterContract === void 0) return recordError(request, "parameterContract");
      if (materialGuid === void 0) return recordError(request, "materialGuid");
      if (recordSpecializationKey === void 0) return recordError(request, "specializationKey");
      if (artifactDigest === void 0) return recordError(request, "artifactDigest");
      if (publication.guid.toLowerCase() !== request.guid.toLowerCase() || record2.guid.toLowerCase() !== request.guid.toLowerCase()) {
        return recordError(
          request,
          "guid",
          `record GUID ${request.guid} to match the requested GUID`
        );
      }
      if (materialGuid.toLowerCase() !== request.guid.toLowerCase())
        return recordError(request, "materialGuid");
      if (recordSpecializationKey !== request.specializationKey) return missingCook(request);
      const programs = [];
      for (const program of record2.programs) {
        const artifact = program.artifact;
        const published = publication.artifacts?.[artifact.path];
        if (published === void 0)
          return materialError(
            request,
            "asset-artifact-missing",
            `published artifact ${artifact.path}`,
            "publish every program artifact before loading the material",
            { publicationGeneration, field: artifact.path },
            true
          );
        const bytes = immutableBytes(published.bytes);
        const actualDigest = createMaterialArtifactDigest(bytes);
        if (actualDigest !== artifact.digest || published.digest !== void 0 && published.digest !== actualDigest) {
          return materialError(
            request,
            "asset-artifact-integrity-mismatch",
            `artifact digest ${artifact.digest}`,
            "restore the complete published generation or re-cook the material",
            {
              publicationGeneration,
              field: artifact.path,
              expected: artifact.digest,
              actual: actualDigest
            }
          );
        }
        if (!sameBytes(artifact.bytes, bytes))
          return recordError(
            request,
            `programs.${program.specializationKey}.artifact.bytes`,
            "record bytes to match the published program artifact"
          );
        programs.push(
          Object.freeze({
            ...program,
            selections: Object.freeze(
              program.selections.map(
                (selection) => Object.freeze({ ...selection, context: Object.freeze({ ...selection.context }) })
              )
            ),
            artifact: Object.freeze({ ...artifact, bytes })
          })
        );
      }
      const refs = [
        ...record2.refs.parent,
        ...record2.refs.textures,
        ...record2.refs.samplers,
        ...record2.refs.modules
      ];
      const missing2 = options.loadReference ? (await Promise.all(
        refs.map(
          async (reference) => await options.loadReference?.(reference) ? void 0 : reference
        )
      )).filter((reference) => reference !== void 0) : [];
      if (missing2.length > 0) {
        return materialError(
          request,
          "material-reference-not-ready",
          "all cooked material references to be available",
          "load referenced parent, texture, sampler, and module assets before publishing Ready",
          { publicationGeneration, missing: missing2 },
          true
        );
      }
      return {
        status: "Ready",
        guid: request.guid,
        materialGuid,
        publicationGeneration,
        specializationKey: request.specializationKey,
        artifactDigest,
        sourceClosure: Object.freeze([...sourceClosure]),
        parameterContract: immutableParameterContract(parameterContract),
        record: { ...record2, programs: Object.freeze(programs) },
        programs: Object.freeze(programs)
      };
    }
  };
}
function projectionError(guid, expected) {
  return new AssetError({
    code: "asset-not-imported",
    expected,
    hint: `${ASSET_ERROR_HINTS["asset-not-imported"]} (GUID ${guid})`
  });
}
function resolveRuntimeProjection(guid, record2) {
  const hasAxes = record2.subject !== void 0 || record2.execution !== void 0 || record2.lifecycle !== void 0 || record2.projection !== void 0;
  if (!hasAxes) return ok$1(void 0);
  const projection = record2.projection;
  if (projection === void 0 || record2.subject === void 0 || record2.execution === void 0 || record2.lifecycle === void 0) {
    return err(
      projectionError(
        guid,
        "catalog entry to publish subject, execution, lifecycle, and projection together"
      )
    );
  }
  if (projection.subject !== record2.subject || projection.execution !== record2.execution || projection.lifecycle !== record2.lifecycle) {
    return err(projectionError(guid, "catalog projection axes to agree with their row fields"));
  }
  return ok$1({
    subject: projection.subject,
    execution: projection.execution,
    lifecycle: projection.lifecycle,
    packageUrl: record2.packageUrl
  });
}

// src/registry/load-by-guid.ts
async function loadByGuid(registry, guid, parentContext) {
  return loadByGuidInternal(registry, guid, parentContext, /* @__PURE__ */ new Set());
}
function cookedRecordFromPayload(payload) {
  if (payload.schemaVersion === "material-cook/4") return payload;
  if (payload.cooked !== null && typeof payload.cooked === "object") return payload.cooked;
  if (payload.record !== null && typeof payload.record === "object") return payload.record;
  return void 0;
}
async function loadMaterialPublicationByGuid(registry, request) {
  const parsedGuid = AssetGuid.parse(request.guid);
  if (!parsedGuid.ok) return void 0;
  const entry = await resolveCatalogEntry(registry, request.guid.toLowerCase());
  if (entry === void 0) return void 0;
  let pack = registry.packFileCache.get(entry.packageUrl);
  if (pack === void 0) {
    const fetched = await fetchAndCachePackFile(
      registry,
      entry.packageUrl,
      request.guid.toLowerCase()
    );
    if (!fetched.ok) return void 0;
    pack = registry.packFileCache.get(entry.packageUrl);
  }
  const asset = pack?.assets.find(
    (candidate) => candidate.guid.toLowerCase() === request.guid.toLowerCase()
  );
  if (asset === void 0 || asset.kind !== "material") return void 0;
  const record2 = cookedRecordFromPayload(asset.payload);
  if (record2 === void 0) return void 0;
  const parsed = validateCookedMaterialRecord$1(record2);
  if (!parsed.ok) return { guid: request.guid, record: record2 };
  const artifacts = {};
  const descriptors = Object.entries(asset.artifacts ?? {});
  for (const { artifact } of parsed.value.programs) {
    if (artifacts[artifact.path] !== void 0) continue;
    if (descriptors.length === 0) {
      artifacts[artifact.path] = { bytes: artifact.bytes, digest: artifact.digest };
      continue;
    }
    const artifactKey = artifact.path;
    const descriptor = asset.artifacts?.[artifactKey];
    if (descriptor === void 0)
      return {
        guid: request.guid,
        record: record2,
        artifactError: {
          code: "asset-artifact-missing",
          expected: `one artifact descriptor for '${artifact.path}'`
        }
      };
    const artifactCacheKey = `${request.guid.toLowerCase()}\0${entry.packageUrl}\0${artifact.path}\0${artifact.digest}`;
    const loaded = await registry.artifactCache.read(
      artifactCacheKey,
      () => readArtifact({ packageUrl: entry.packageUrl, guid: request.guid, artifactKey, descriptor })
    );
    if (!loaded.ok)
      return {
        guid: request.guid,
        record: record2,
        artifactError: {
          code: loaded.error.code === "asset-artifact-integrity-mismatch" ? loaded.error.code : "asset-artifact-missing",
          expected: loaded.error.expected,
          actual: loaded.error.detail.observed
        }
      };
    artifacts[artifact.path] = { bytes: loaded.value };
  }
  return { guid: request.guid, record: record2, artifacts };
}
async function loadMaterialReadyByGuid(registry, request) {
  const publication = await loadMaterialPublicationByGuid(registry, request);
  return loadMaterialReadyPublication(registry, request, publication);
}
function publicationSpecializationKey(publication) {
  const record2 = publication?.record;
  if (record2 === null || typeof record2 !== "object") return "";
  const specializationKey = record2.specializationKey;
  return typeof specializationKey === "string" ? specializationKey : "";
}
async function loadMaterialReadyPublication(registry, request, publication) {
  const loader = createMaterialLoader({
    loadPublication: async () => publication,
    loadReference: async (guid) => {
      const parsed = AssetGuid.parse(guid);
      if (!parsed.ok) return true;
      const result = await loadByGuid(registry, parsed.value);
      return result.ok;
    }
  });
  const readiness = await loader.load(request);
  registry.recordMaterialReadiness(request.guid, readiness);
  return readiness;
}
async function loadByGuidInternal(registry, guid, parentContext, ancestry) {
  const guidKey2 = AssetGuid.format(guid).toLowerCase();
  const existing = registry.assetCatalog.get(guidKey2);
  if (existing !== void 0) {
    const state = registry.loadState.get(guidKey2);
    if (state?.status === "provisional") {
      if (ancestry.has(guidKey2)) {
        const provisional = registry.loadState.getProvisional(guidKey2);
        if (provisional !== void 0) return ok$1(provisional);
      } else {
        const inFlight = registry.inFlight.get(guidKey2);
        if (inFlight !== void 0) {
          return inFlight;
        }
      }
      return err(
        new AssetError({
          code: "asset-parse-failed",
          expected: `GUID ${guidKey2} to be promoted to Ready before public load`,
          hint: "wait for the active load to finish or retry after the referenced assets are ready"
        })
      );
    }
    if (state?.status === "ready" || state === void 0 && registry.packIndexUrl === void 0) {
      const ready = registry.loadState.getReady(guidKey2);
      if (ready !== void 0) return ok$1(ready);
      if (state === void 0) return ok$1(existing.payload);
    }
  }
  const inFlightPromise = registry.inFlight.get(guidKey2);
  if (inFlightPromise !== void 0) {
    return inFlightPromise;
  }
  if (registry.packIndexUrl !== void 0 && typeof globalThis.fetch === "function") {
    const genAtStart = registry.generations.get(guidKey2) ?? 0;
    const globalGenAtStart = registry.globalGeneration;
    const promise = (async () => {
      const result = await loadByGuidProd(registry, guid, guidKey2, parentContext, ancestry);
      if (genAtStart !== (registry.generations.get(guidKey2) ?? 0) || globalGenAtStart !== registry.globalGeneration) {
        registry.assetCatalog.delete(guidKey2);
        registry.loadState.remove(guidKey2);
        return err(
          new AssetError({
            code: "asset-invalidated",
            expected: `GUID ${guidKey2} was invalidated during load`,
            hint: ASSET_ERROR_HINTS["asset-invalidated"]
          })
        );
      }
      return result;
    })();
    registry.inFlight.set(guidKey2, promise);
    try {
      return await promise;
    } finally {
      if (registry.inFlight.get(guidKey2) === promise) registry.inFlight.delete(guidKey2);
    }
  }
  return Promise.resolve(
    err(
      new AssetError({
        code: "asset-not-found",
        expected: `GUID ${guidKey2} catalogued in AssetRegistry`,
        hint: ASSET_ERROR_HINTS["asset-not-found"]
      })
    )
  );
}
async function loadByGuidProd(registry, guid, guidKey2, parentContext, ancestry = /* @__PURE__ */ new Set()) {
  traceAssetLoadPhase("catalog.resolve.start", { guid: guidKey2 });
  const entry = await resolveCatalogEntry(registry, guidKey2);
  traceAssetLoadPhase("catalog.resolve.complete", {
    guid: guidKey2,
    ...entry === void 0 ? {} : { packageUrl: entry.packageUrl },
    detail: { found: entry !== void 0 }
  });
  if (entry !== void 0) {
    const projection = resolveRuntimeProjection(guidKey2, entry);
    if (!projection.ok) return projection;
    if (projection.value?.lifecycle !== void 0 && projection.value.lifecycle !== "current") {
      return transportOrFail(registry, guid, guidKey2);
    }
    const result = await ddcLoad(registry, guid, guidKey2, entry, parentContext, ancestry);
    if (result.ok) return result;
    const ddcError = result.error;
    const transportEligible = ddcError instanceof AssetError && (ddcError.code === "asset-not-found" || ddcError.code === "asset-fetch-failed" || ddcError.code === "texture-source-not-imported" || // perf-20260706: the raw-container fail-fast (mesh/material/scene whose
    // packageUrl is still a .glb/.gltf/.fbx) surfaces source-not-imported;
    // it is transport-eligible so the import runs once and rewrites the row
    // to .bin/.pack.json (the shipped form, with no transport, fails fast).
    // Distinct from the generic asset-not-imported, which must stay
    // NON-eligible so the parent-missing breadcrumb is never masked.
    ddcError.code === "source-not-imported");
    if (transportEligible) {
      return transportOrFail(registry, guid, guidKey2, ddcError.code);
    }
    return result;
  }
  return transportOrFail(registry, guid, guidKey2);
}
async function resolveCatalogEntry(registry, guidKey2) {
  const key2 = guidKey2.toLowerCase();
  if (registry.packIndexCache === void 0 || !registry.packIndexCache.has(key2)) {
    const catalogResult = await registry.ensurePackIndexCache(
      registry.packIndexCache !== void 0
    );
    if (!catalogResult.ok) {
      if (registry.packIndexCache === void 0) return void 0;
    }
  }
  return registry.packIndexCache?.get(key2);
}
function registerPackagesFromIndex(registry, catalog) {
  const byPath = /* @__PURE__ */ new Map();
  for (const [guidKey2, entry] of catalog) {
    const packagePath = entry.subject === "imported-output" && entry.sourcePath !== void 0 ? entry.sourcePath : entry.packageUrl;
    let group = byPath.get(packagePath);
    if (group === void 0) {
      group = { guids: [], names: /* @__PURE__ */ new Map() };
      byPath.set(packagePath, group);
    }
    group.guids.push(guidKey2);
    if (entry.name !== void 0) group.names.set(guidKey2, entry.name);
  }
  for (const [path, group] of byPath) {
    registry._registerPackage(path, group.guids, group.names);
  }
}
async function ddcLoad(registry, guid, guidKey2, entry, parentContext, ancestry = /* @__PURE__ */ new Set()) {
  if (typeof entry.packageUrl !== "string" || entry.packageUrl.length === 0) {
    return err(
      new AssetError({
        code: "asset-not-imported",
        expected: `catalog entry for GUID ${guidKey2} to contain a packageUrl locator`,
        hint: ASSET_ERROR_HINTS["asset-not-imported"]
      })
    );
  }
  traceAssetLoadPhase("pack.load.start", {
    guid: guidKey2,
    packageUrl: entry.packageUrl
  });
  const packResult = await loadPackV2Asset(registry, guidKey2, entry.packageUrl);
  traceAssetLoadPhase("pack.load.complete", {
    guid: guidKey2,
    packageUrl: entry.packageUrl,
    detail: { ok: packResult?.ok === true }
  });
  if (packResult === void 0) {
    return err(
      new AssetError({
        code: "asset-parse-failed",
        expected: `Pack v2 package for GUID ${guidKey2}`,
        hint: "legacy top-level asset payloads are not accepted"
      })
    );
  }
  if (!packResult.ok) {
    return packResult;
  }
  const asset = packResult.value.asset;
  const packRefs = packResult.value.refs.map((g) => ({ guid: g }));
  let assetToRegister = asset;
  let parentGuidKey;
  if (asset.kind === "material" && "parentGuid" in asset && typeof asset.parentGuid === "string") {
    const parentGuidStr = asset.parentGuid;
    const parentGuid = AssetGuid.parse(parentGuidStr);
    if (!parentGuid.ok) {
      return err(
        new AssetError({
          code: "asset-parse-failed",
          expected: `valid parent GUID for child ${guidKey2}`,
          hint: `parent GUID '${parentGuidStr}' is not a valid UUID format`
        })
      );
    }
    parentGuidKey = parentGuidStr.toLowerCase();
    const rawMaterial = asset;
    const childForValidation = {
      ...rawMaterial,
      parent: parentGuid.value
    };
    const forbidden = materialChildForbiddenFields(childForValidation);
    if (forbidden.length > 0) {
      return err(
        new AssetError({
          code: "asset-parse-failed",
          expected: `parent-bearing material ${guidKey2} to contain only parent and values`,
          hint: "remove root-owned colorSpace, passes, and parameters from the child payload",
          detail: { field: "material-child-contract", got: forbidden }
        })
      );
    }
    const values = rawMaterial.values;
    assetToRegister = {
      kind: "material",
      ...values !== void 0 ? { values } : {},
      parent: parentGuid.value
    };
  }
  registry.loadState.begin(
    guidKey2,
    packRefs.map((ref) => ref.guid)
  );
  const registerResult = registerParsedAsset(registry, guid, assetToRegister, guidKey2, packRefs);
  if (!registerResult.ok) {
    purgeFailedLoad(registry, guidKey2, entry.packageUrl, registerResult.error);
    return registerResult;
  }
  const registeredPayload = registerResult.value;
  registry.loadState.resolveAsset(guidKey2, registeredPayload);
  const envelope = registry.assetCatalog.get(guidKey2);
  const refs = envelope?.refs ?? [];
  if (refs.length > 0) {
    const subResults = await Promise.all(
      refs.map((ref) => {
        const refGuidKey = ref.guid.toLowerCase();
        const parsedRef = AssetGuid.parse(ref.guid);
        if (!parsedRef.ok) {
          return Promise.resolve({
            guidKey: refGuidKey,
            result: err(
              new AssetError({
                code: "asset-parse-failed",
                expected: `valid sub-asset GUID referenced by ${asset.kind} ${guidKey2}`,
                hint: `refs[] entry '${ref.guid}' is not a valid UUID format`
              })
            ),
            childContext: void 0,
            isParentEdge: false,
            edge: ref
          });
        }
        let childContext;
        if (ref.sceneEntityKey !== void 0 || ref.sourceField !== void 0) {
          childContext = {};
          if (ref.sceneEntityKey !== void 0) childContext.sceneEntityKey = ref.sceneEntityKey;
          if (ref.sourceField?.fieldName !== void 0) {
            childContext.componentField = (ref.sourceField.componentName !== void 0 ? `${ref.sourceField.componentName}.` : "") + ref.sourceField.fieldName + (ref.sourceField.arrayIndex !== void 0 ? `[${ref.sourceField.arrayIndex}]` : "");
            childContext.sourceField = ref.sourceField;
          }
        } else if (asset.kind === "scene") {
          childContext = buildSceneChildContext(registry, asset, refGuidKey, guidKey2);
        }
        const isParentEdge = asset.kind === "material" && (ref.sourceField?.fieldName === "parent" || parentGuidKey !== void 0 && refGuidKey === parentGuidKey);
        const childAncestry = new Set(ancestry);
        childAncestry.add(guidKey2);
        return loadByGuidInternal(
          registry,
          parsedRef.value,
          childContext ?? parentContext,
          childAncestry
        ).then((r) => ({
          guidKey: refGuidKey,
          result: r,
          childContext,
          isParentEdge,
          edge: ref
        }));
      })
    );
    for (const {
      guidKey: subGuidKey,
      result: subResult,
      childContext: subChildContext,
      isParentEdge,
      edge: subEdge
    } of subResults) {
      if (isParentEdge && !subResult.ok) {
        const subErr = subResult.error;
        const code = subErr instanceof AssetError ? subErr.code : "asset-parse-failed";
        purgeFailedLoad(registry, guidKey2, entry.packageUrl, subErr);
        return err(
          new AssetError({
            code,
            expected: subErr.expected,
            hint: `loading parent material ${subGuidKey} for child ${guidKey2}: ${subErr.hint ?? ""}`,
            ...subErr instanceof AssetError && subErr.detail !== void 0 ? { detail: subErr.detail } : {}
          })
        );
      }
      if (isParentEdge && subResult.ok && subResult.value?.kind !== "material") {
        const error = new AssetError({
          code: "asset-parse-failed",
          expected: `parent GUID ${subGuidKey} to reference a MaterialAsset`,
          hint: `loading parent material ${subGuidKey} for child ${guidKey2}: referenced asset is ${subResult.value?.kind ?? "unknown"}, not 'material'`
        });
        purgeFailedLoad(registry, guidKey2, entry.packageUrl, error);
        return err(error);
      }
      if (!subResult.ok) {
        const subErr = subResult.error;
        const breadcrumb = buildBreadcrumbHint(
          guidKey2,
          asset.kind,
          subGuidKey,
          subChildContext ?? parentContext
        );
        const code = subErr instanceof AssetError ? subErr.code : "asset-fetch-failed";
        const provEntityKey = subEdge?.sceneEntityKey ?? subChildContext?.sceneEntityKey;
        const provSourceField = subEdge?.sourceField ?? subChildContext?.sourceField;
        const breadcrumbDetail = {
          referencedByGuid: guidKey2,
          referencedByKind: asset.kind,
          subAssetGuid: subGuidKey,
          ...provEntityKey !== void 0 ? { sceneEntityKey: provEntityKey } : {},
          ...provSourceField !== void 0 ? { sourceField: provSourceField } : {}
        };
        const detail = subErr instanceof AssetError && subErr.detail !== void 0 ? subErr.detail : breadcrumbDetail;
        purgeFailedLoad(registry, guidKey2, entry.packageUrl, subErr);
        return err(
          new AssetError({
            code,
            expected: subErr.expected,
            hint: `${breadcrumb} / ${subErr.hint ?? ""}`,
            detail
          })
        );
      }
    }
  }
  if (asset.kind === "mesh") {
    const directRefGuids = new Set(refs.map((ref) => ref.guid.toLowerCase()));
    const slots = asset.materialSlots;
    for (let slotIndex = 0; slotIndex < slots.length; slotIndex++) {
      const slot = slots[slotIndex];
      if (slot?.defaultMaterial === void 0) continue;
      const defaultMaterialGuid = AssetGuid.format(slot.defaultMaterial).toLowerCase();
      const loaded = directRefGuids.has(defaultMaterialGuid) ? registry.assetCatalog.get(defaultMaterialGuid)?.payload : void 0;
      if (loaded?.kind === "material") continue;
      const actualKind = directRefGuids.has(defaultMaterialGuid) ? loaded?.kind ?? "missing" : "missing-ref-edge";
      const error = new AssetError({
        code: "asset-parse-failed",
        expected: `mesh ${guidKey2} materialSlots[${slotIndex}] (${slot.slotName}) default ${defaultMaterialGuid} to reference a MaterialAsset`,
        hint: `recook mesh ${guidKey2}; slot ${slotIndex} '${slot.slotName}' resolves to ${actualKind}, not 'material'`,
        detail: {
          meshAssetGuid: guidKey2,
          slotIndex,
          slotName: slot.slotName,
          defaultMaterialGuid,
          actualKind
        }
      });
      purgeFailedLoad(registry, guidKey2, entry.packageUrl, error);
      return err(error);
    }
  }
  registry.loadState.promoteReady(guidKey2);
  traceAssetLoadPhase("catalog.promote-ready.complete", {
    guid: guidKey2,
    packageUrl: entry.packageUrl
  });
  if (registry.loadState.getReady(guidKey2) === void 0) {
    const error = new AssetError({
      code: "asset-parse-failed",
      expected: `GUID ${guidKey2} and all referenced assets to be public-ready`,
      hint: "retry after every referenced GUID has loaded successfully"
    });
    purgeFailedLoad(registry, guidKey2, entry.packageUrl, error);
    return err(error);
  }
  const registeredAsset = registeredPayload;
  if (registeredAsset.kind === "material") {
    const publication = await loadMaterialPublicationByGuid(registry, {
      guid: guidKey2});
    const hasCookedPublication = publication !== void 0 && (publication.record !== void 0 || publication.artifacts !== void 0);
    if (!isEngineMaterial(registeredAsset) || hasCookedPublication) {
      await loadMaterialReadyPublication(
        registry,
        {
          guid: guidKey2,
          specializationKey: publicationSpecializationKey(publication)
        },
        publication
      );
    }
  }
  return ok$1(registeredPayload);
}
async function loadPackV2Asset(registry, guidKey2, packageUrl) {
  traceAssetLoadPhase("pack.v2.start", { guid: guidKey2, packageUrl });
  const cached = registry.packFileCache.get(packageUrl);
  if (cached === void 0) {
    const inFlight = registry.packFileInFlight.get(packageUrl);
    if (inFlight !== void 0) await inFlight.catch(() => void 0);
    traceAssetLoadPhase("pack.fetch.start", { guid: guidKey2, packageUrl });
    const fetched = registry.packFileCache.get(packageUrl) === void 0 ? await fetchAndCachePackFile(registry, packageUrl, guidKey2) : void 0;
    traceAssetLoadPhase("pack.fetch.complete", {
      guid: guidKey2,
      packageUrl,
      detail: { cached: registry.packFileCache.has(packageUrl), ok: fetched?.ok ?? true }
    });
    if (registry.packFileCache.get(packageUrl) === void 0) {
      if (fetched === void 0) {
        return err(
          new AssetError({
            code: "asset-fetch-failed",
            expected: `pack file ${packageUrl} to be cached after its shared fetch`,
            hint: ASSET_ERROR_HINTS["asset-fetch-failed"]
          })
        );
      }
      return fetched;
    }
  }
  const pack = registry.packFileCache.get(packageUrl);
  if (pack?.schemaVersion !== "2.0.0") return void 0;
  const asset = pack.assets.find((candidate) => candidate.guid.toLowerCase() === guidKey2);
  traceAssetLoadPhase("pack.parse.complete", {
    guid: guidKey2,
    packageUrl,
    detail: { found: asset !== void 0, kind: asset?.kind }
  });
  if (asset === void 0) {
    return err(
      new AssetError({
        code: "asset-not-found",
        expected: `GUID ${guidKey2} present in Pack v2 package ${packageUrl}`,
        hint: ASSET_ERROR_HINTS["asset-not-found"]
      })
    );
  }
  const artifacts = {};
  for (const [artifactKey, descriptor] of Object.entries(asset.artifacts ?? {})) {
    const cacheKey = `${guidKey2}\0${packageUrl}\0${artifactKey}`;
    const artifact = await registry.artifactCache.read(
      cacheKey,
      () => readArtifact({ packageUrl, guid: guidKey2, artifactKey, descriptor })
    );
    if (!artifact.ok)
      return artifact;
    artifacts[artifactKey] = { descriptor, bytes: artifact.value };
  }
  traceAssetLoadPhase("loader.load.start", { guid: guidKey2, packageUrl });
  const loaded = await registry.loaders.loadPack(
    {
      guid: guidKey2,
      kind: asset.kind,
      payload: asset.payload,
      refs: asset.refs ?? [],
      artifacts
    },
    makeLoadContext(registry)
  );
  traceAssetLoadPhase("loader.load.complete", {
    guid: guidKey2,
    packageUrl,
    detail: { ok: loaded.ok }
  });
  if (!loaded.ok) return err(loaded.error);
  if (loaded.value === void 0 || typeof loaded.value !== "object") {
    return err(
      new AssetError({
        code: "asset-parse-failed",
        expected: `loader '${asset.kind}' to return an asset payload`,
        hint: "register a loader that accepts the Pack v2 asset-local input"
      })
    );
  }
  return ok$1({ asset: loaded.value, refs: asset.refs ?? [] });
}
function purgeFailedLoad(registry, guidKey2, packageUrl, error) {
  const doomed = registry.loadState.fail(guidKey2, error);
  for (const key2 of doomed) registry.assetCatalog.delete(key2);
  registry.packFileCache.delete(packageUrl);
}
async function transportOrFail(registry, guid, guidKey2, _missReason) {
  if (registry.importTransport === void 0) {
    return err(
      new AssetError({
        code: "asset-not-imported",
        expected: `GUID ${guidKey2} to have been pre-imported at build time or to have an ImportTransport wired`,
        hint: ASSET_ERROR_HINTS["asset-not-imported"]
      })
    );
  }
  const transportResult = await registry.importTransport.fetchPack(
    guidKey2,
    registry.runtimeBinding
  );
  if (!transportResult.ok) {
    return err(
      new AssetError({
        code: "asset-not-imported",
        expected: `import transport to fetch pack for GUID ${guidKey2}`,
        hint: ASSET_ERROR_HINTS["asset-not-imported"]
      })
    );
  }
  const importedEntries = "entries" in transportResult ? transportResult.entries : void 0;
  if (importedEntries !== void 0 && importedEntries.length > 0) {
    registry.packIndexCachePatchQueue = registry.packIndexCachePatchQueue.then(() => {
      if (registry.packIndexCache === void 0) registry.packIndexCache = /* @__PURE__ */ new Map();
      for (const e of importedEntries) {
        if (typeof e.packageUrl !== "string" || e.packageUrl.length === 0) continue;
        registry.packIndexCache.set(e.guid.toLowerCase(), {
          packageUrl: resolveCatalogAssetUrl(registry, e.packageUrl),
          kind: e.kind,
          // Carry the transport's derived display name into the cache row.
          // buildCatalog already resolves it through deriveAssetName (authored
          // names are preserved and the source basename is the fallback, so a
          // freshly imported GLB's 1000+ sub-assets show as "<file>.glb" in the
          // Content Browser
          // instead of blank. Dropping it here made listCatalog fall back to
          // `entry.name ?? ''` — the whole-index re-read path (else branch) kept
          // names, so only the incremental patch path was blank.
          ...e.name !== void 0 ? { name: e.name } : {},
          // Carry refs on the incremental patch path too, else an asset
          // imported via POST /__import shows missing dependency edges until
          // the next full pack-index refresh (feat: listCatalog refs).
          ...e.refs !== void 0 ? { refs: e.refs } : {},
          ...e.packageId !== void 0 ? { packageId: e.packageId } : {},
          ...e.provenance !== void 0 ? { provenance: e.provenance } : {},
          ...e.revision !== void 0 ? { revision: e.revision } : {},
          ...e.authoring !== void 0 ? { authoring: e.authoring } : {},
          ...e.sourceKey !== void 0 ? { sourceKey: e.sourceKey } : {},
          ...e.sourceIndex !== void 0 ? { sourceIndex: e.sourceIndex } : {},
          ...e.relations !== void 0 ? { relations: e.relations } : {},
          ...e.diagnostics !== void 0 ? { diagnostics: e.diagnostics } : {},
          // Carry sourcePath on the incremental patch path too (same red-line
          // as refs above): an asset imported via POST /__import would
          // otherwise expose no source-file path in listCatalog until the next
          // full pack-index refresh, breaking editor CRUD sidecar lookup for
          // freshly imported assets. `sourcePath` is a required PackIndexEntry
          // field, so it is always present on the transport row.
          ...e.sourcePath !== void 0 ? { sourcePath: e.sourcePath } : {}
        });
      }
    });
    await registry.packIndexCachePatchQueue;
  } else {
    registry.packIndexCache = void 0;
  }
  const entry = await resolveCatalogEntry(registry, guidKey2);
  if (entry === void 0) {
    return err(
      new AssetError({
        code: "asset-not-imported",
        expected: `import transport to produce a catalog entry for GUID ${guidKey2}`,
        hint: ASSET_ERROR_HINTS["asset-not-imported"]
      })
    );
  }
  return ddcLoad(registry, guid, guidKey2, entry);
}
function registerParsedAsset(registry, guid, asset, _guidKey, refs) {
  return registry.catalog(guid, asset, refs);
}
function parseAndReturnAsset(registry, assetEntry) {
  const parsed = parseAssetPayload(registry, assetEntry.kind, assetEntry.payload, assetEntry.refs);
  if (parsed !== void 0 && typeof parsed === "object" && "ok" in parsed) {
    const e = parsed.error;
    const detail = {
      entityKey: e.entityKey,
      component: e.component,
      field: e.field,
      index: e.index,
      refsLength: e.refsLength
    };
    return err(
      new AssetError({
        code: "asset-parse-failed",
        expected: `refs index ${e.index} within [0, ${e.refsLength})`,
        detail,
        hint: `at node key=${e.entityKey}, component=${e.component}, field=${e.field}: index ${e.index} is out of bounds (refs has ${e.refsLength} entries)`
      })
    );
  }
  if (parsed === void 0) {
    const parent = typeof assetEntry.payload.parent === "string" ? assetEntry.payload.parent : typeof assetEntry.payload.parent === "number" && Number.isInteger(assetEntry.payload.parent) ? assetEntry.refs?.[assetEntry.payload.parent] : void 0;
    const childForValidation = assetEntry.kind === "material" && typeof parent === "string" ? { ...assetEntry.payload, parent } : void 0;
    const forbidden = childForValidation === void 0 ? [] : materialChildForbiddenFields(childForValidation);
    return err(
      new AssetError({
        code: "asset-parse-failed",
        expected: `parseable asset payload for kind ${assetEntry.kind}`,
        hint: forbidden.length > 0 ? "remove root-owned colorSpace, passes, and parameters from the child payload" : ASSET_ERROR_HINTS["asset-parse-failed"],
        ...forbidden.length > 0 ? { detail: { field: "material-child-contract", got: forbidden } } : {}
      })
    );
  }
  return ok$1({ asset: parsed, refs: assetEntry.refs ?? [] });
}
async function fetchAndCachePackFile(registry, packageUrl, guidKey2) {
  const fetchPromise = (async () => {
    let raw;
    try {
      const res = await globalThis.fetch(packageUrl);
      if (!res.ok) {
        throw new AssetError({
          code: "asset-fetch-failed",
          expected: `fetch(${packageUrl}) to return ok`,
          hint: ASSET_ERROR_HINTS["asset-fetch-failed"]
        });
      }
      raw = await res.json();
    } catch (e) {
      if (e instanceof AssetError) throw e;
      throw new AssetError({
        code: "asset-fetch-failed",
        expected: `fetch(${packageUrl}) to succeed`,
        hint: ASSET_ERROR_HINTS["asset-fetch-failed"]
      });
    }
    if (raw === null || typeof raw !== "object" || !Array.isArray(raw.assets)) {
      throw new AssetError({
        code: "asset-fetch-failed",
        expected: `pack-file body at ${packageUrl} to be { assets: [...] }`,
        hint: ASSET_ERROR_HINTS["asset-fetch-failed"]
      });
    }
    return raw;
  })();
  registry.packFileInFlight.set(packageUrl, fetchPromise);
  try {
    const packFile = await fetchPromise;
    registry.packFileCache.set(packageUrl, packFile);
    registry.packFileInFlight.delete(packageUrl);
    const assetEntry = packFile.assets.find((a) => a.guid.toLowerCase() === guidKey2.toLowerCase());
    if (assetEntry === void 0) {
      return err(
        new AssetError({
          code: "asset-not-found",
          expected: `GUID ${guidKey2} present in pack file ${packageUrl}`,
          hint: ASSET_ERROR_HINTS["asset-not-found"]
        })
      );
    }
    return parseAndReturnAsset(registry, assetEntry);
  } catch (e) {
    registry.packFileInFlight.delete(packageUrl);
    if (e instanceof AssetError) {
      return err(e);
    }
    throw e;
  }
}
function parseAssetPayload(registry, kind, payload, refs) {
  const loader = registry.loaders.get(kind);
  if (loader === void 0) return { ...payload, kind };
  const out = loader.load(payload, refs, makeLoadContext(registry));
  if (out !== void 0 && typeof out.then === "function") {
    return void 0;
  }
  if (out !== void 0 && out !== null && typeof out === "object" && "ok" in out) {
    return out;
  }
  return out;
}
function makeLoadContext(registry) {
  return {
    /**
     * feat-20260706 M3 / w19: fetchBinary signature extended per D-2.
     * `opts?.compression` triggers the single decompression gate (AC-02).
     * 'zstd' → lazy-init codec decompressZstd · 'none' / undefined → pass-through.
     * On decompression failure, the codec error is nested in asset-fetch-failed
     * detail (D-8: runtime error union NOT extended).
     */
    fetchBinary: async (url, opts) => {
      try {
        const res = await globalThis.fetch(url);
        if (!res.ok) {
          return {
            ok: false,
            error: new AssetError({
              code: "asset-fetch-failed",
              expected: `fetch(${url}) to return ok`,
              hint: ASSET_ERROR_HINTS["asset-fetch-failed"]
            })
          };
        }
        const buf = await res.arrayBuffer();
        let bytes = new Uint8Array(buf);
        if (opts?.compression === "zstd") {
          const decRes = await decompressZstd(bytes);
          if (!decRes.ok) {
            return {
              ok: false,
              error: new AssetError({
                code: "asset-parse-failed",
                expected: `zstd decompression for ${url}`,
                hint: `[${decRes.error.code}] ${decRes.error.hint}`,
                detail: { sourcePath: url }
              })
            };
          }
          bytes = new Uint8Array(
            decRes.value.buffer,
            decRes.value.byteOffset,
            decRes.value.byteLength
          );
        }
        return { ok: true, value: bytes };
      } catch {
        return {
          ok: false,
          error: new AssetError({
            code: "asset-fetch-failed",
            expected: `fetch(${url}) to succeed`,
            hint: ASSET_ERROR_HINTS["asset-fetch-failed"]
          })
        };
      }
    },
    resolveRef: async (guid) => {
      const parsed = AssetGuid.parse(guid);
      if (!parsed.ok) {
        return { ok: false, error: parsed.error };
      }
      const r = await loadByGuid(registry, parsed.value);
      if (!r.ok) return { ok: false, error: r.error };
      return { ok: true, value: 0 };
    },
    // feat-20260613-material-paramschema-driven-binding M4 / w22 (D-5 graceful):
    // expose the registered shader's derive(paramSchema).textureFieldNames to
    // the materialLoader so it can decide which values fields carry
    // refs[] indices without a hardcoded texture-field allowlist Set
    // (AC-03). Returns `undefined` when the shader is not registered (cross-
    // worktree shader-late-register, plan R-4) — the loader then falls back
    // to a graceful "try every int paramValue" walk.
    getMaterialShaderTextureFieldNames: (shaderId) => {
      const lookup = registry.shaderRegistry.findMaterialArtifact(shaderId);
      if (!lookup.ok) return void 0;
      return lookup.value.paramSchemaProjection.derivedInterface.textureFieldNames;
    },
    transcodeCaps: registry.transcodeCaps,
    device: void 0
  };
}

// src/registry/load-state.ts
var LoadStateStore = class {
  records = /* @__PURE__ */ new Map();
  get(guid) {
    return this.records.get(guid.toLowerCase());
  }
  getReady(guid) {
    const record2 = this.records.get(guid.toLowerCase());
    return record2?.status === "ready" ? record2.value : void 0;
  }
  /**
   * Return a provisional value only for the internal SCC back-edge bridge.
   * Public callers must use getReady so promotion remains the visibility gate.
   */
  getProvisional(guid) {
    const record2 = this.records.get(guid.toLowerCase());
    return record2?.status === "provisional" ? record2.value : void 0;
  }
  begin(guid, refs) {
    const key2 = guid.toLowerCase();
    const existing = this.records.get(key2);
    if (existing?.status === "provisional" || existing?.status === "ready") return existing;
    const record2 = {
      status: "provisional",
      refs: refs.map((ref) => ref.toLowerCase())
    };
    this.records.set(key2, record2);
    return record2;
  }
  resolveAsset(guid, value) {
    const key2 = guid.toLowerCase();
    const record2 = this.records.get(key2);
    if (record2 === void 0) {
      this.records.set(key2, { status: "provisional", refs: [], value });
      return;
    }
    record2.value = value;
  }
  registerReady(guid, value) {
    this.begin(guid, []);
    this.resolveAsset(guid, value);
    this.promoteReady(guid);
  }
  promoteReady(guid) {
    const root = guid.toLowerCase();
    const group = this.provisionalGroup(root);
    if (group.size === 0) return;
    for (const key2 of group) {
      const record2 = this.records.get(key2);
      if (record2?.value === void 0) return;
      for (const ref of record2.refs) {
        const dependency = this.records.get(ref);
        if (dependency === void 0 || dependency.status !== "ready" && !group.has(ref)) return;
      }
    }
    for (const key2 of group) {
      const record2 = this.records.get(key2);
      if (record2 !== void 0) record2.status = "ready";
    }
  }
  fail(guid, error) {
    const doomed = this.provisionalGroup(guid.toLowerCase());
    if (doomed.size === 0) doomed.add(guid.toLowerCase());
    for (const key2 of doomed) {
      this.records.set(key2, { status: "unloaded", refs: [] });
    }
    const root = this.records.get(guid.toLowerCase());
    if (root !== void 0) root.error = error;
    return [...doomed];
  }
  remove(guid) {
    this.records.delete(guid.toLowerCase());
  }
  clear() {
    this.records.clear();
  }
  provisionalGroup(root) {
    const group = /* @__PURE__ */ new Set();
    const visit = (key2) => {
      if (group.has(key2)) return;
      const record2 = this.records.get(key2);
      if (record2?.status !== "provisional") return;
      group.add(key2);
      for (const ref of record2.refs) visit(ref);
    };
    visit(root);
    return group;
  }
};
function validateMaterialPasses(registry, asset) {
  const passes = asset.passes;
  if (passes === void 0 || passes.length === 0) {
    if (passes !== void 0 && passes.length === 0) {
      return new AssetError({
        code: "asset-invalid-value",
        expected: "MaterialAsset with at least one pass",
        hint: "add at least one pass descriptor to passes[] before register",
        detail: { passCount: 0 }
      });
    }
    return null;
  }
  const allSchemas = [...asset.parameters ?? []];
  for (let passIndex = 0; passIndex < passes.length; passIndex++) {
    const pass = passes[passIndex];
    if (pass === void 0) continue;
    if (pass.program.module.length === 0) {
      return new AssetError({
        code: "asset-invalid-value",
        expected: "pass.program.module to be a non-empty module identifier",
        hint: `pass[${passIndex}] has an empty program.module`
      });
    }
  }
  const seen = /* @__PURE__ */ new Set();
  const unionSchema = [];
  for (const entry of allSchemas) {
    if (!seen.has(entry.name)) {
      seen.add(entry.name);
      unionSchema.push(entry);
    }
  }
  const values = asset.values ?? {};
  const missingParams = [];
  for (const entry of unionSchema) {
    const value = values[entry.name];
    if (value === void 0) {
      if (entry.default !== void 0 || entry.optional || entry.type === "texture") {
        continue;
      }
      missingParams.push(entry.name);
      continue;
    }
    if (value === null && entry.optional) continue;
    const typeOk = validateParamType(registry, entry.name, entry.type, value);
    if (!typeOk) {
      return new AssetError({
        code: "asset-invalid-value",
        expected: `values.${entry.name} to be of type ${entry.type}`,
        hint: `values['${entry.name}'] has type ${typeof value} but paramSchema declares ${entry.type}`,
        detail: { paramName: entry.name, expectedType: entry.type, got: typeof value }
      });
    }
  }
  if (missingParams.length > 0) {
    return new AssetError({
      code: "asset-invalid-value",
      expected: `values to contain keys: ${missingParams.join(", ")}`,
      hint: `missing required params: ${missingParams.join(", ")}`,
      detail: { missingParams }
    });
  }
  return null;
}
function validateSpriteSlices(_registry, asset) {
  const passes = asset.passes;
  if (passes === void 0 || passes.length === 0) return null;
  const firstPass = passes[0];
  if (firstPass === void 0 || firstPass.program.module !== "forgeax_material::sprite")
    return null;
  const pv = asset.values ?? {};
  const slicesRaw = pv.slices;
  if (slicesRaw === void 0) return null;
  const expected = "values.slices: [number, number, number, number] with 0 \u2264 left + right < region.zw[0] and 0 \u2264 top + bottom < region.zw[1]";
  if (!Array.isArray(slicesRaw)) {
    return new AssetError({
      code: "asset-invalid-value",
      expected,
      hint: `values.slices is not an array (got ${typeof slicesRaw}); must be a 4-tuple [left, top, right, bottom]`,
      detail: { paramName: "slices", got: typeof slicesRaw }
    });
  }
  if (slicesRaw.length !== 4) {
    return new AssetError({
      code: "asset-invalid-value",
      expected,
      hint: `values.slices length is ${slicesRaw.length}; must be 4 ([left, top, right, bottom])`,
      detail: { paramName: "slices", got: slicesRaw.length }
    });
  }
  const slices = slicesRaw;
  for (let i = 0; i < 4; i++) {
    if (typeof slices[i] !== "number") {
      return new AssetError({
        code: "asset-invalid-value",
        expected,
        hint: `values.slices[${i}] is not a number (got ${typeof slices[i]})`,
        detail: { paramName: "slices", got: typeof slices[i] }
      });
    }
  }
  const left = slices[0];
  const top = slices[1];
  const right = slices[2];
  const bottom = slices[3];
  for (let i = 0; i < 4; i++) {
    if (Number.isNaN(slices[i])) {
      return new AssetError({
        code: "asset-invalid-value",
        expected,
        hint: `values.slices[${i}] is NaN; all four components must be finite non-negative numbers`,
        detail: { paramName: "slices", got: "NaN" }
      });
    }
  }
  for (let i = 0; i < 4; i++) {
    if (!Number.isFinite(slices[i])) {
      return new AssetError({
        code: "asset-invalid-value",
        expected,
        hint: `values.slices[${i}] is Infinity; all four components must be finite non-negative numbers`,
        detail: { paramName: "slices", got: "Infinity" }
      });
    }
  }
  for (let i = 0; i < 4; i++) {
    if (slices[i] < 0) {
      return new AssetError({
        code: "asset-invalid-value",
        expected,
        hint: `values.slices[${i}] = ${slices[i]}; all four components must be non-negative`,
        detail: { paramName: "slices", got: slices[i] }
      });
    }
  }
  const regionRaw = pv.region;
  let regionZ = 1;
  let regionW = 1;
  if (Array.isArray(regionRaw) && regionRaw.length >= 4) {
    const rz = regionRaw[2];
    const rw = regionRaw[3];
    if (typeof rz === "number") regionZ = rz;
    if (typeof rw === "number") regionW = rw;
  }
  const sumX = left + right;
  if (sumX >= regionZ) {
    return new AssetError({
      code: "asset-invalid-value",
      expected,
      hint: `received slices=[${left}, ${top}, ${right}, ${bottom}]; left + right = ${sumX} \u2265 ${regionZ} (region.z)`,
      detail: { paramName: "slices", got: sumX }
    });
  }
  const sumY = top + bottom;
  if (sumY >= regionW) {
    return new AssetError({
      code: "asset-invalid-value",
      expected,
      hint: `received slices=[${left}, ${top}, ${right}, ${bottom}]; top + bottom = ${sumY} \u2265 ${regionW} (region.w)`,
      detail: { paramName: "slices", got: sumY }
    });
  }
  return null;
}
function validateParamType(_registry, _name, type, value) {
  switch (type) {
    case "f32":
    case "i32":
    case "u32":
      return typeof value === "number";
    case "vec2":
      return Array.isArray(value) && value.length >= 2 && value.every((v) => typeof v === "number");
    case "vec3":
      return Array.isArray(value) && value.length >= 3 && value.every((v) => typeof v === "number");
    case "vec4":
      return Array.isArray(value) && value.length >= 4 && value.every((v) => typeof v === "number");
    case "color":
      return Array.isArray(value) && (value.length === 3 || value.length === 4) && value.every((v) => typeof v === "number");
    case "texture":
    case "texture_cube":
      return typeof value === "string" || typeof value === "object" && value !== null && !Array.isArray(value);
    case "bool":
      return typeof value === "boolean";
    default:
      return false;
  }
}
function detectTileNeedsRepeatSampler(registry, asset) {
  if (registry.metrics === null) return;
  const passes = asset.passes;
  if (passes === void 0 || passes.length === 0) return;
  const firstPass = passes[0];
  if (firstPass === void 0 || firstPass.program.module !== "forgeax_material::sprite" && firstPass.program.module !== "forgeax::sprite")
    return;
  const pv = asset.values ?? {};
  const slicesAndMode = pv.slicesAndMode;
  const encodedTile = Array.isArray(slicesAndMode) && typeof slicesAndMode[3] === "number" ? slicesAndMode[3] < 0 : false;
  const legacyTile = typeof pv.sliceMode === "number" && pv.sliceMode === 1;
  if (!encodedTile && !legacyTile) return;
  const samplerGuid = typeof pv.sampler === "string" ? pv.sampler : void 0;
  if (samplerGuid === void 0) return;
  const samplerEnvelope = registry.assetCatalog.get(samplerGuid.toLowerCase());
  if (samplerEnvelope === void 0 || samplerEnvelope.kind !== "sampler") return;
  const samplerAsset = samplerEnvelope.payload;
  if (samplerAsset.kind !== "sampler") return;
  const u = samplerAsset.addressModeU;
  const v = samplerAsset.addressModeV;
  if (u !== "repeat" || v !== "repeat") {
    registry.metrics.increment("nineslice.tile-needs-repeat-sampler");
  }
}
function materialShaderTextureFieldNames(registry, shaderId) {
  const lookup = registry.shaderRegistry.findMaterialArtifact(shaderId);
  if (!lookup.ok) return void 0;
  return lookup.value.paramSchemaProjection.derivedInterface.textureFieldNames;
}

// src/asset-registry.ts
function catalogSourceUnconfigured() {
  return err(
    new AssetError({
      code: "catalog-source-unconfigured",
      expected: "a configured catalog source",
      hint: ASSET_ERROR_HINTS["catalog-source-unconfigured"]
    })
  );
}
var AssetRegistry = class {
  /** @internal Stored for M2 validation; TS suppressor reference */
  constructor(shaderRegistry, importTransport, extraLoaders, postSpawnHook, runtimeBinding, componentCatalog = /* @__PURE__ */ new Map()) {
    this.shaderRegistry = shaderRegistry;
    void this.shaderRegistry;
    this.importTransport = importTransport;
    this.postSpawnHook = postSpawnHook;
    this.runtimeBinding = runtimeBinding;
    this.componentCatalog = componentCatalog;
    this.loaders = createDefaultLoaderRegistry(extraLoaders);
    this.registerBuiltins();
  }
  shaderRegistry;
  catalogSource;
  catalogEnumerating;
  catalogListeners = /* @__PURE__ */ new Set();
  catalogSourceDispose;
  catalogReplica;
  // feat-20260614 M8 (D-15 / D-17 / D-19): the registry is a GUID -> payload
  // catalogue. It holds NO handle concept -- it cannot mint a column handle
  // (it has no World). `loadByGuid` returns the PAYLOAD; column minting
  // (`world.allocSharedRef`) is the caller's job on the ECS/render side.
  // Sub-asset refs embedded in a payload stay as GUID strings (AssetGuid /
  // dash-form), never minted at load time. Keyed by lowercased GUID string.
  // feat-20260705-runtime-tier2-decomposition M1 / w5 (D-4): public so the
  // extracted `./registry/validate-material` free functions (detectTileNeeds-
  // RepeatSampler) can read it. No underscore + genuinely public is the
  // lint-compliant exposure (D-internal R-internal-C ties `@internal` to `_`).
  assetCatalog = /* @__PURE__ */ new Map();
  /** Owner-injected component catalog used for scene breadcrumb projection. */
  componentCatalog;
  // feat-20260618-asset-and-pack-name-fields M3 (D-1): the package index that
  // backs the two-segment asset identity `<packagePath>.<name>`. `packages`
  // maps a lowercased GUID key to its `MutablePackage` (a shared object every
  // GUID of the same import path points at), or `null` for assets with no
  // package (catalog() inline + builtin, D-5). All three registration entry
  // points (catalog / loadByGuid / builtin) funnel through the single
  // `registerPackage` primitive so the display-name invariant lands once (#1 SSOT).
  packages = /* @__PURE__ */ new Map();
  // Secondary index path -> shared MutablePackage so every GUID of the same
  // import path points at one object (the 1->N promotion + assetCount derive
  // depend on this sharing). Not a duplicate of `packages` (#2): `packages` is
  // the per-GUID lookup; this is the per-path dedup used only inside
  // registerPackage to find-or-create the shared object.
  packageByPath = /* @__PURE__ */ new Map();
  // Per-GUID stored display names now live on the asset envelope's `name` field
  // (the single home, replacing the retired storedNameOf side table; D-6).
  // resolveName reads `assetCatalog.get(key)?.name` as the `storedName` argument
  // of deriveAssetName. `pendingNames` bridges the one ordering where a name is
  // known before its envelope exists: the prod disk path registers the package
  // (entry names) during resolveCatalogEntry, then catalogues the body later --
  // catalog() drains the pending name into the new envelope, so nothing persists
  // here once the envelope is in place.
  pendingNames = /* @__PURE__ */ new Map();
  // ─── Prod pack-index fetch state (M4/w23) ──────────────────────────────
  // When packIndexUrl is configured, loadByGuid fetches pack-index.json on
  // first call, caches the parsed catalog in packIndexCache, then fetches
  // each resource URL resolved against that index and registers the asset.
  packIndexUrl = void 0;
  packIndexCache = void 0;
  /** In-flight accepted catalog projection shared by enumeration and GUID load. */
  catalogPackIndexSync;
  /** A targeted or wholesale invalidation requests one fresh source baseline. */
  catalogPackIndexNeedsRefresh = false;
  /** Fences a late catalog response after invalidation or authority replacement. */
  catalogPackIndexEpoch = 0;
  /** Current browser-facing asset realm; absent for inline/shipped legacy use. */
  runtimeBinding = void 0;
  // tweak-20260609 M1: in-flight Map for recursive loadByGuid dedup + cycle
  // prevention (D-5 / B-10). Maps guidKey → Promise<Result<Handle, ...>> so
  // concurrent calls for the same GUID share the same fetch + register chain,
  // and cycles (A→B→A) terminate when the second visit hits the in-flight
  // entry for A instead of re-entering fetch.
  inFlight = /* @__PURE__ */ new Map();
  // bug-20260610 Fix B (M3 / D-4): per-instance pack-file cache keyed by
  // packageUrl (the .pack.json URL). `packFileInFlight` de-duplicates
  // concurrent fetches; `packFileCache` stores resolved bodies so the
  // same URL is fetched at most once per AssetRegistry lifetime (CON-6).
  packFileCache = /* @__PURE__ */ new Map();
  packFileInFlight = /* @__PURE__ */ new Map();
  artifactCache = new ArtifactReadCache();
  loadState = new LoadStateStore();
  /**
   * Render-facing material readiness owned by the production GUID loader.
   * The map stores the complete tuple result, including structured failures,
   * so record code cannot silently fall back to a generic MaterialAsset.
   */
  materialReadiness = /* @__PURE__ */ new Map();
  /** Immutable cooked artifacts indexed by their specialization key. */
  materialArtifactRegistry = new MaterialArtifactRegistry();
  /** Current GUID publication projection used by the render assembly seam. */
  materialRenderProjections = /* @__PURE__ */ new Map();
  /** Payload-owned projection identity; old handles survive same-GUID recook. */
  materialPayloadProjections = /* @__PURE__ */ new WeakMap();
  materialCatalogRevisions = /* @__PURE__ */ new Map();
  materialReadinessCatalogRevisions = /* @__PURE__ */ new Map();
  assetEvidenceAdapter = createRuntimeAssetEvidenceAdapter();
  // feat-20260621-asset-registry-robustness-invalidate-inflight-cach F17c:
  // per-GUID generation counter incremented on each invalidate(guid) call.
  // loadByGuid captures this value at Promise creation and discards the
  // result (returning asset-invalidated) if the generation has changed by
  // the time the fetch completes.
  // F22: invalidateAll increments a single globalGeneration counter instead,
  // which invalidates every in-flight Promise regardless of GUID.
  generations = /* @__PURE__ */ new Map();
  globalGeneration = 0;
  /**
   * Monotonic payload-cache epoch. Render-side derived snapshots use this
   * single stamp to skip re-walking an unchanged material parent chain on
   * every frame; catalog/invalidation mutations advance it conservatively.
   */
  catalogEpoch = 0;
  // F20: per-cache Promise queue to serialise packIndexCache write operations
  // in transportOrFail. The "check -> new Map() -> set" three-step block is
  // not atomic across concurrent transportOrFail calls; chaining through a
  // single queue Promise ensures each patch completes before the next starts.
  packIndexCachePatchQueue = Promise.resolve();
  // feat-20260527-sprite-nineslice M4 / w16 + w18 (D-5 + D-9): per-Renderer
  // EngineMetrics shared with the runtime so register-time soft-warns
  // (`nineslice.tile-needs-repeat-sampler` for sliceMode=1 + sampler not
  // 'repeat') and runtime soft-warns (`nineslice.scale-too-small`) increment
  // the SAME counter map. `createRenderer.ts` calls `assets.setMetrics(metrics)`
  // immediately after constructing the registry; standalone test fixtures
  // that do not go through `createRenderer` may leave this null and the
  // soft-warn paths simply no-op (charter P9 graceful degradation: the
  // structured fail-fast branches still fire; only the metric is dropped).
  // feat-20260705-runtime-tier2-decomposition M1 / w5 (D-4): public so the
  // extracted `./registry/validate-material` free functions (detectTileNeeds-
  // RepeatSampler) can read + increment it. No underscore + genuinely public
  // is the lint-compliant exposure (D-internal R-internal-C ties `@internal`
  // to `_`).
  metrics = null;
  // feat-20260707 M5 / w33 (D-11): device texture-compression caps the Basis
  // texture / equirect arms feed to `selectTranscodeTarget`. `createRenderer`
  // projects `RhiCaps` -> `TranscodeCaps` and calls `setTranscodeCaps` right
  // after construction (D-8 one-line projection). A standalone registry (test /
  // headless) keeps the all-false default, which drives the uncompressed
  // fallback path (section 8 P3, AC-04) rather than a hard failure.
  transcodeCaps = { bc: false, etc2: false, astc: false };
  // feat-20260703-collect-nested-sceneinstance-to-mount-roundtrip M1 (D-1):
  // origin reverse-index: a payload object -> its catalog GUID, for payloads
  // that are NOT the current catalog identity. WeakMap so entries auto-GC when
  // the world despawns and the object is no longer held by sharedRefs.
  // _guidForAsset consults it after the catalog identity scan MISSes.
  // SSOT for the "payload-to-GUID provenance" fact (architecture-principles #1).
  //
  // Two writers populate it:
  //   1. instantiate (registry/instantiate.ts): the resolved SceneAsset copy ->
  //      its original catalog GUID (the deep-copied envelope is never the catalog
  //      identity).
  //   2. feat-20260713 M4 / w15 (D-6, root cause a): catalog() records the
  //      SUPERSEDED payload here when re-cataloguing a GUID with a fresh object.
  //      A handle minted before the override still points at the old object; this
  //      keeps that object reverse-lookupable so save/collect resolves its GUID
  //      instead of failing with a GUID-unresolved error (the 2026-07-06 crash).
  //
  // Key type is `object` (not `SceneAsset`) because both material and scene
  // payloads are recorded (material payloads flow through writer 2).
  /** @internal */
  _originIndex = /* @__PURE__ */ new WeakMap();
  /**
   * Construct a fresh registry pre-populated with the builtin cube + triangle
   * mesh handles (`HANDLE_CUBE` / `HANDLE_TRIANGLE`).
   *
   * feat-20260514 M3 / w15: the previous optional `RhiDevice` constructor
   * argument (consumed by the now-deleted `createInstancedBuffer` triplet)
   * is removed; the registry surface is engine-agnostic again. Per-entity
   * instance transforms now live inside the ECS `Instances { transforms:
   * 'array<f32>' }` component; the RenderSystem record stage owns GPU
   * storage buffer allocation + cap-gate.
   */
  // feat-20260603-asset-import-loader-injection M1 / w5 (D-7): the registry
  // dispatches `parseAssetPayload` / the texture+font upstream branches through
  // this `LoaderRegistry`. feat-20260623 M3 / w9: the loader registry is now
  // internally built by `createDefaultLoaderRegistry()` (public readonly field)
  // so host apps can reach `engine.assets.loaders.register(...)` without a
  // constructor-injection slot or a phantom passthrough wrapper.
  // The loader set is wired at construction from the complete ordinary Asset
  // vocabulary (including video and audio) plus caller-supplied extensions.
  // Assigned here so the optional loaders cannot appear after a load begins.
  loaders;
  // feat-20260603-asset-import-loader-injection M4 / w31 (AC-19 / AC-22):
  // the optional `ImportTransport` is the *only* difference between the studio
  // form (transport injected, dev DDC miss triggers lazy import) and the shipped
  // form (transport absent, DDC miss fails fast with `asset-not-imported`).
  // The load path AFTER a successful DDC fetch is identical in both forms --
  // zero branching on transport (AC-23 key invariant). Set at construction (no
  // setter, no illegal intermediate state), same D-7 stance as LoaderRegistry.
  importTransport;
  // feat-20260705-runtime-tier2-decomposition M1 / w9 (D-1): optional post-spawn
  // hook invoked by `instantiate` after the scene subtree spawns. The shipped
  // implementation is runtime's `postSpawnResolveJoints` (auto-wire Skin.joints),
  // injected at the sole production assembly point (createRenderer, w10). When
  // absent (standalone / test registries), instantiate skips joint wiring
  // silently. Public so the extracted `./registry/instantiate` free function can
  // read it (D-internal R-internal-C ties `@internal` to a `_` prefix;
  // genuinely-public is the lint-compliant exposure).
  postSpawnHook;
  /**
   * Restore the engine-owned GUID catalogue after a runtime-realm transition.
   *
   * Builtin meshes are process-static engine assets, not game-owned catalog
   * rows. A realm transition clears the user catalog and load caches, but must
   * leave these assets addressable so a scene in the newly bound game can keep
   * resolving its builtin mesh references.
   */
  registerBuiltins() {
    const builtinByHandle = /* @__PURE__ */ new Map([
      [handleSlot(HANDLE_CUBE), BUILTIN_CUBE],
      [handleSlot(HANDLE_TRIANGLE), BUILTIN_TRIANGLE],
      [handleSlot(HANDLE_QUAD), BUILTIN_QUAD],
      [handleSlot(HANDLE_SPHERE), BUILTIN_SPHERE],
      [handleSlot(HANDLE_NINESLICE_QUAD), BUILTIN_NINESLICE_QUAD],
      [handleSlot(HANDLE_CYLINDER), BUILTIN_CYLINDER]
    ]);
    for (const [handle, guidStr] of BUILTIN_MESH_GUIDS) {
      const parsed = AssetGuid.parse(guidStr);
      if (!parsed.ok) {
        throw new Error(`[asset-registry] builtin GUID ${guidStr} is not a valid UUID`);
      }
      const payload = builtinByHandle.get(handleSlot(handle));
      if (payload !== void 0)
        this.assetCatalog.set(guidStr.toLowerCase(), {
          guid: guidStr,
          kind: payload.kind,
          payload,
          refs: []
        });
      if (payload !== void 0) this.loadState.registerReady(guidStr, payload);
    }
    this._registerPackage(
      null,
      BUILTIN_MESH_GUIDS.map(([, guidStr]) => guidStr)
    );
  }
  /**
   * feat-20260527-sprite-nineslice M4 / w16 prep + w18 (D-5 + D-9): inject the
   * per-Renderer `EngineMetrics` so register-time soft-warns can bump the same
   * counter map the runtime reads through `renderer.metrics.snapshot()`. Called
   * by `createRenderer` after constructing both the registry and the metrics
   * instance; safe to skip in standalone tests (the soft-warn arms simply do
   * not record).
   */
  setMetrics(metrics) {
    this.metrics = metrics;
  }
  /**
   * feat-20260707 M5 / w33 (D-11): wire the device compression caps used by the
   * Basis texture / equirect transcode arms. `createRenderer` calls this right
   * after construction with `RhiCaps` projected to `TranscodeCaps` (D-8). Left
   * at the all-false default, the loaders transcode to the uncompressed
   * `rgba8unorm` / `rgba16float` fallback (AC-04, section 8 P3).
   */
  setTranscodeCaps(caps) {
    this.transcodeCaps = caps;
  }
  /**
   * Inject authoritative runtime evidence without importing CLI or Node policy.
   * `inspect(guid)` and `verifyByGuid(guid)` return the shared state model; an
   * omitted capability remains an explicit structured error, never a pass.
   */
  configureAssetEvidence(source) {
    this.assetEvidenceAdapter = createRuntimeAssetEvidenceAdapter(source);
  }
  /**
   * @internal — read the metrics handle for register-time soft-warn paths.
   * Returns `null` when no `createRenderer` wired the registry to a renderer
   * (the standalone-test path; the structured fail-fast branches still fire).
   */
  _getMetrics() {
    return this.metrics;
  }
  /**
   * @internal — reverse-lookup: find the GUID key for a catalogued asset
   * payload by identity comparison (===). Returns the GUID string if found,
   * `undefined` otherwise. This is the SSOT for the inline identity scan
   * idiom that previously existed in two places (instantiate sceneGuidKey
   * lookup and resolveSkinAsset skeleton match).
   *
   * Linear scan of the assetCatalog (Map<string, AssetEnvelope>). The O(n)
   * cost is acceptable for save-path frequencies (OOS-2).
   */
  _guidForAsset(asset) {
    for (const [key2, envelope] of this.assetCatalog) {
      if (envelope.payload === asset) {
        return key2;
      }
    }
    return this._originIndex.get(asset);
  }
  /** Public identity projection consumed by scene collection boundaries. */
  guidOf(asset) {
    return this._guidForAsset(asset);
  }
  /** Return the production MaterialReady/Error result for one material GUID. */
  getMaterialReadiness(guid) {
    return this.materialReadiness.get(guid.toLowerCase());
  }
  /** Return the current cooked render projection for one material GUID. */
  getMaterialProjection(guid) {
    return this.materialRenderProjections.get(guid.toLowerCase());
  }
  /** Resolve the program owner through the same parent catalogue as the root contract. */
  getMaterialProjectionForPayload(material) {
    const visited = /* @__PURE__ */ new Set();
    let current = material;
    while (!visited.has(current)) {
      visited.add(current);
      const projection = this.materialPayloadProjections.get(current);
      if (projection !== void 0) return projection;
      if (current.parent === void 0) return void 0;
      const parent = this.lookup(current.parent);
      if (parent?.kind !== "material") return void 0;
      current = parent;
    }
    return void 0;
  }
  /** Return one immutable cooked artifact by specialization key. */
  getMaterialArtifact(specializationKey) {
    return this.materialArtifactRegistry.get(specializationKey);
  }
  /** Record the canonical result produced by the production material loader. */
  recordMaterialReadiness(guid, readiness) {
    const key2 = guid.toLowerCase();
    if (readiness.status !== "Ready") {
      this.materialReadiness.set(key2, readiness);
      this.materialRenderProjections.delete(key2);
      return;
    }
    const projection = installMaterialReadyShaders(
      this.shaderRegistry,
      readiness,
      this.materialArtifactRegistry
    );
    this.materialReadiness.set(key2, readiness);
    this.materialRenderProjections.set(key2, projection);
    const catalogRevision = this.materialCatalogRevisions.get(key2) ?? 0;
    const previousRevision = this.materialReadinessCatalogRevisions.get(key2);
    if (previousRevision === void 0 || previousRevision !== catalogRevision) {
      const currentPayload = this.assetCatalog.get(key2)?.payload;
      if (currentPayload?.kind === "material") {
        this.materialPayloadProjections.set(currentPayload, projection);
      }
    }
    this.materialReadinessCatalogRevisions.set(key2, catalogRevision);
  }
  /**
   * Configure a catalog URL for `loadByGuid`.
   *
   * Call this once during engine initialization with the URL where
   * `pack-index.json` is served (emitted by `@forgeax/engine-vite-plugin-pack`
   * during `vite build`). In a Vite dev host, use `configureRuntimeBinding`
   * instead so the catalog remains bound to its scope and generation. The
   * index is also the canonical base URL for every
   * catalog entry: relative, root-relative, and absolute entry URLs are resolved
   * against it before the registry fetches a pack body. After configuration,
   * `loadByGuid` will fetch the catalog on its first invocation and cache it for
   * subsequent calls.
   *
   * @example
   * ```ts
   * engine.assets.configurePackIndex('/pack-index.json');
   * const payloadRes = await engine.assets.loadByGuid(guid); // payload, not a handle (D-17)
   * ```
   */
  configurePackIndex(url) {
    this.catalogPackIndexEpoch++;
    this.packIndexUrl = url;
    this.packIndexCache = void 0;
    this.catalogPackIndexSync = void 0;
    this.catalogPackIndexNeedsRefresh = false;
  }
  catalogSourceSharesPackIndex() {
    return this.catalogSource?.url !== void 0 && this.packIndexUrl !== void 0 && this.catalogSource.url === this.packIndexUrl;
  }
  /**
   * A cache loaded through the unscoped pack-index path cannot prove a later
   * source's producer admission constraints. Constrained sources must run
   * their own enumerate validation before the replica becomes authoritative.
   */
  catalogSourceCanReusePackIndex() {
    return this.catalogSource?.expectedRevision === void 0 && this.catalogSource?.expectedScope === void 0;
  }
  acceptCatalogEntries(entries) {
    const parsed = parseCatalog(entries, (packageUrl) => resolveCatalogAssetUrl(this, packageUrl));
    if (!parsed.ok) return parsed;
    this.packIndexCache = parsed.value;
    registerPackagesFromIndex(this, this.packIndexCache);
    this.catalogPackIndexNeedsRefresh = false;
    return parsed;
  }
  /**
   * Resolve the one accepted pack-index projection for this registry.
   *
   * URL-backed CatalogSource and `configurePackIndex` are joined only when
   * their explicit URL authorities are identical. Their CatalogReplica start
   * or reconcile promise is then shared by enumeration and GUID loading, so a
   * running instance accepts one baseline payload instead of fetching the same
   * URL through two independent paths. Deliberately different sources retain
   * the legacy fetch path and per-instance caches.
   */
  async ensurePackIndexCache(force = false) {
    if (!force && this.packIndexCache !== void 0 && !this.catalogPackIndexNeedsRefresh && (!this.catalogSourceSharesPackIndex() || this.catalogSourceCanReusePackIndex())) {
      return ok$1(this.packIndexCache);
    }
    if (this.catalogSourceSharesPackIndex() && this.catalogReplica !== void 0) {
      const existing2 = this.catalogPackIndexSync;
      if (existing2 !== void 0) {
        if (!force) return existing2;
        this.catalogPackIndexNeedsRefresh = true;
        return existing2.then(() => this.ensurePackIndexCache(true));
      }
      const replica = this.catalogReplica;
      const epoch2 = this.catalogPackIndexEpoch;
      const read = force || this.catalogPackIndexNeedsRefresh ? replica.reconcile() : replica.start();
      const promise2 = read.then((result) => {
        if (!result.ok) return result;
        if (epoch2 !== this.catalogPackIndexEpoch) {
          this.catalogPackIndexNeedsRefresh = true;
          return err(
            new AssetError({
              code: "asset-invalidated",
              expected: "the active catalog epoch to remain current",
              hint: "retry the load against the current runtime binding"
            })
          );
        }
        if (this.catalogReplica !== replica || !this.catalogSourceSharesPackIndex()) {
          return err(
            new AssetError({
              code: "asset-invalidated",
              expected: "the active catalog source to remain installed",
              hint: "retry the load against the current runtime binding"
            })
          );
        }
        return this.acceptCatalogEntries(result.value.entries);
      });
      this.catalogPackIndexSync = promise2;
      void promise2.then(() => {
        if (this.catalogPackIndexSync === promise2) this.catalogPackIndexSync = void 0;
      });
      return promise2;
    }
    const existing = this.catalogPackIndexSync;
    if (existing !== void 0) {
      if (!force) return existing;
      this.catalogPackIndexNeedsRefresh = true;
      return existing.then(() => this.ensurePackIndexCache(true));
    }
    const epoch = this.catalogPackIndexEpoch;
    const promise = fetchPackIndex(this).then((result) => {
      if (!result.ok) return result;
      if (epoch !== this.catalogPackIndexEpoch) {
        return err(
          new AssetError({
            code: "asset-invalidated",
            expected: "the active catalog epoch to remain current",
            hint: "retry the load against the current runtime binding"
          })
        );
      }
      this.packIndexCache = result.value;
      registerPackagesFromIndex(this, this.packIndexCache);
      return result;
    });
    this.catalogPackIndexSync = promise;
    void promise.then(() => {
      if (this.catalogPackIndexSync === promise) this.catalogPackIndexSync = void 0;
    });
    return promise;
  }
  /**
   * Atomically replace the browser-side asset realm. The binding owns the
   * catalog URL and generation; no cache from the previous game survives the
   * transition.
   */
  configureRuntimeBinding(binding) {
    this.clearCatalogSource();
    this.runtimeBinding = binding;
    this.configurePackIndex(binding.catalogUrl);
    this.invalidateAll();
    this.registerBuiltins();
  }
  /**
   * feat-20260621 F17c: invalidate a single cached asset by GUID so the next
   * `loadByGuid` performs a genuinely fresh fetch. Clears, for this GUID only:
   * the catalogue entry, the in-flight dedup entry, the cached pack-file body
   * (keyed by the index entry's packageUrl), and the pack-index entry. Then
   * increments the per-GUID generation counter so any still in-flight Promise
   * for this GUID discards its result (returns `asset-invalidated`). The body +
   * index clears are targeted (other GUIDs' cached bodies and index entries
   * survive); deleting the index entry forces `resolveCatalogEntry` to re-fetch
   * the pack-index on the next load, re-resolving the packageUrl whose body
   * cache was just dropped. No-op when the GUID is not catalogued.
   *
   * Does NOT touch `packages` (a re-load's registerPackage overwrites them; D-8)
   * and does NOT trigger GPU resource release (OOS-1,
   * q1 boundary: the asset is CPU-only; GPU resources follow the ECS).
   *
   * @param guid - Case-insensitive GUID string or AssetGuid.
   */
  invalidate(guid) {
    const guidKey2 = guid.toLowerCase();
    this.artifactCache.clearPrefix(`${guidKey2}\0`);
    const survivingEnvelope = this.assetCatalog.get(guidKey2);
    const survivingName = survivingEnvelope?.name;
    if (survivingName !== void 0) this.pendingNames.set(guidKey2, survivingName);
    if (survivingEnvelope !== void 0) this._originIndex.set(survivingEnvelope.payload, guidKey2);
    this.assetCatalog.delete(guidKey2);
    this.loadState.remove(guidKey2);
    this.materialReadiness.delete(guidKey2);
    this.materialRenderProjections.delete(guidKey2);
    this.materialReadinessCatalogRevisions.delete(guidKey2);
    this.inFlight.delete(guidKey2);
    const entry = this.packIndexCache?.get(guidKey2);
    if (entry !== void 0) this.packFileCache.delete(entry.packageUrl);
    this.packIndexCache?.delete(guidKey2);
    this.catalogPackIndexEpoch++;
    if (this.catalogSourceSharesPackIndex()) this.catalogPackIndexNeedsRefresh = true;
    this.generations.set(guidKey2, (this.generations.get(guidKey2) ?? 0) + 1);
    this.catalogEpoch++;
  }
  /**
   * Adopt freshly loaded Mesh material slots into an object that is already
   * pinned by live World shared refs. Geometry and GPU-backed fields deliberately
   * remain untouched: this primitive is only for a default-material source
   * override, never a general Mesh reimport. This is the atomic cutover: Catalog,
   * Ready load state, and payload-to-GUID provenance must all name the same
   * object after the call. Call only after invalidate(guid) + loadByGuid(guid)
   * has completed successfully.
   */
  adoptReloadedMeshMaterialSlots(guid, livePayload) {
    const key2 = guid.toLowerCase();
    const envelope = this.assetCatalog.get(key2);
    const freshPayload = this.loadState.getReady(key2);
    if (envelope === void 0 || freshPayload === void 0 || envelope.payload !== freshPayload) {
      return err(
        new AssetError({
          code: "asset-not-found",
          expected: `GUID ${key2} to have one freshly loaded Ready payload`,
          hint: "complete invalidate + loadByGuid before adopting a live Mesh identity"
        })
      );
    }
    if (livePayload.kind !== "mesh" || freshPayload.kind !== "mesh") {
      return err(
        new AssetError({
          code: "asset-parse-failed",
          expected: `GUID ${key2} live and fresh payloads to both be MeshAsset`,
          hint: "use Mesh identity adoption only for a recooked MeshAsset"
        })
      );
    }
    if (this._guidForAsset(livePayload) !== key2) {
      return err(
        new AssetError({
          code: "asset-not-found",
          expected: `live Mesh payload to retain GUID provenance for ${key2}`,
          hint: "capture the catalogued live payload before invalidating and reloading the same GUID"
        })
      );
    }
    if (livePayload === freshPayload) return ok$1(livePayload);
    livePayload.materialSlots = freshPayload.materialSlots;
    this._originIndex.set(freshPayload, key2);
    this.assetCatalog.set(key2, { ...envelope, payload: livePayload });
    this.loadState.registerReady(key2, livePayload);
    this.catalogEpoch++;
    return ok$1(livePayload);
  }
  /**
   * feat-20260621 F17c: invalidate ALL cached assets so the next `loadByGuid`
   * re-fetches both the pack-index and the asset body. Clears assetCatalog,
   * inFlight, and packFileCache (wholesale), and resets packIndexCache to
   * `undefined` (NOT `.clear()` -- an empty Map would short-circuit
   * `resolveCatalogEntry`'s `=== undefined` re-fetch guard and serve
   * asset-not-imported for every later load; undefined forces a fresh
   * fetchPackIndex). Then increments a single globalGeneration counter so every
   * in-flight Promise (regardless of GUID) discards its result. Returns the
   * number of assets that were catalogued before the call.
   *
   * Idempotent: second call on an already-empty catalogue returns clearedCount 0
   * (AC-06). Does NOT trigger GPU resource release (OOS-1).
   */
  invalidateAll() {
    const count = this.assetCatalog.size;
    this.artifactCache.clear();
    this.assetCatalog.clear();
    this.loadState.clear();
    this.materialReadiness.clear();
    this.materialRenderProjections.clear();
    this.materialCatalogRevisions.clear();
    this.materialReadinessCatalogRevisions.clear();
    this.inFlight.clear();
    this.globalGeneration++;
    this.packFileCache.clear();
    this.packIndexCache = void 0;
    this.catalogPackIndexEpoch++;
    if (this.catalogSourceSharesPackIndex()) this.catalogPackIndexNeedsRefresh = true;
    this.catalogEpoch++;
    return { clearedCount: count };
  }
  /**
   * Force a re-fetch of the configured pack-index NOW and repopulate the cache,
   * so a synchronous `listCatalog()` immediately reflects assets added on disk
   * since boot (a freshly imported GLB's sub-assets). `loadByGuid`'s lazy
   * re-fetch only fires on a per-GUID miss and `invalidateAll()` merely clears
   * the cache (leaving `listCatalog()` empty until the next load), so neither
   * makes a Content Browser or `loadByGuid`-driven "Add to Scene" see a new
   * asset without a page reload. This does.
   *
   * No-op (returns false) when no pack-index URL is configured (dev inline
   * catalogue path) or the fetch fails — callers keep the stale cache rather
   * than blanking it. Returns true when the cache was repopulated.
   */
  async refreshCatalog() {
    if (this.packIndexUrl === void 0) return false;
    const result = await this.ensurePackIndexCache(true);
    return result.ok;
  }
  setCatalogSource(source) {
    this.clearCatalogSource();
    this.catalogSource = source;
    this.catalogReplica = new CatalogReplica(source);
    this.catalogSourceDispose = this.catalogReplica.subscribe((delta) => {
      for (const listener of [...this.catalogListeners]) {
        try {
          listener(delta);
        } catch {
        }
      }
    });
    if (this.catalogSourceSharesPackIndex()) {
      if (!this.catalogSourceCanReusePackIndex()) this.catalogPackIndexNeedsRefresh = true;
      const cachedEntries = this.packIndexCache !== void 0 && !this.catalogPackIndexNeedsRefresh && this.catalogSourceCanReusePackIndex() ? [...this.packIndexCache].map(([guid, record2]) => ({ guid, ...record2 })) : void 0;
      if (cachedEntries !== void 0) this.catalogReplica.seed(cachedEntries);
      void this.ensurePackIndexCache();
    } else {
      void this.catalogReplica.start();
    }
  }
  /** Stop the catalog transport and remove its replica without clearing payload caches. */
  clearCatalogSource() {
    this.catalogPackIndexEpoch++;
    this.catalogReplica?.dispose();
    this.catalogSourceDispose?.();
    this.catalogSourceDispose = void 0;
    this.catalogSource = void 0;
    this.catalogReplica = void 0;
    this.catalogEnumerating = void 0;
    this.catalogPackIndexSync = void 0;
  }
  enumerateCatalog() {
    if (this.catalogEnumerating !== void 0) return this.catalogEnumerating;
    if (this.catalogSource === void 0 || this.catalogReplica === void 0) {
      return Promise.resolve(catalogSourceUnconfigured());
    }
    const promise = this.catalogSourceSharesPackIndex() ? this.ensurePackIndexCache().then((result) => {
      if (!result.ok) return result;
      return ok$1(this.catalogReplica?.snapshot().entries ?? []);
    }) : this.catalogReplica.start().then((result) => result.ok ? ok$1(result.value.entries) : result);
    this.catalogEnumerating = promise;
    void promise.then(() => {
      this.catalogEnumerating = void 0;
    });
    return promise;
  }
  /** Read the immutable catalog projection folded by this registry. */
  catalogSnapshot() {
    return this.catalogReplica?.snapshot();
  }
  /** Explicitly recover the registry's single catalog replica from its configured source. */
  reconcileCatalog() {
    if (this.catalogSource === void 0 || this.catalogReplica === void 0) {
      return Promise.resolve(catalogSourceUnconfigured());
    }
    if (this.catalogSourceSharesPackIndex()) {
      return this.ensurePackIndexCache(true).then((result) => {
        if (!result.ok) return result;
        return ok$1(
          this.catalogReplica?.snapshot() ?? {
            version: 0,
            entries: [],
            stale: false,
            diagnostics: []
          }
        );
      });
    }
    return this.catalogReplica.reconcile();
  }
  subscribeCatalog(listener) {
    this.catalogListeners.add(listener);
    return () => {
      this.catalogListeners.delete(listener);
    };
  }
  /**
   * Materialise a `SceneAsset` into an existing `World` and return the
   * synthetic root `Entity` (feat-20260514 w31 sugar wrapper; AC-03 +
   * requirements §IN-3; M3: returns Entity not SceneInstanceId).
   *
   * Before spawning, handle-type component fields (e.g. `assetHandle`,
   * `material`, `skeleton`) containing GUID strings are resolved to fresh
   * user-tier `Handle` numbers via `world.allocSharedRef` (feat-20260614 M8
   * D-19 instantiate-time GUID->handle mint; supersedes the pre-D-17
   * `resolveGuid` map). GUIDs that fail to parse or are not catalogued return
   * `AssetError(code='asset-not-found')` with a hint containing the GUID,
   * node localId, and field name.
   *
   * Errors propagate verbatim through the closed
   * `AssetError | PackError | EcsError` union so AI users that already
   * narrow `loadByGuid<SceneAsset>` results reuse the same `switch
   * (err.code)` exhaustively (charter proposition 3 machine-readable
   * union; plan-strategy §3.3 closed-union transparency).
   *
   * @example
   * ```ts
   * const sceneRes = await engine.assets.loadByGuid<SceneAsset>(roomGuid); // payload (D-17)
   * if (!sceneRes.ok) return;
   * const handle = world.allocSharedRef('SceneAsset', sceneRes.value);     // mint column handle
   * const r = engine.assets.instantiate(handle, world);
   * if (!r.ok) {
   *   switch (r.error.code) {
   *     case 'asset-not-found':
   *     case 'pack-cyclic-reference':
   *     // ... AssetErrorCode | PackErrorCode | EcsErrorCode exhaustive
   *   }
   * }
   * ```
   */
  instantiate(handle, world, parent) {
    return instantiate(this, handle, world, parent);
  }
  instantiateWithPublicationFence(handle, world, parent, expectedPublication) {
    return instantiate(this, handle, world, parent, expectedPublication);
  }
  /**
   * Materialise a `SceneAsset` FLAT into an existing `World` — the "open a scene
   * for authoring" registry entry (#655): NO synthetic SceneInstance root, NO
   * forced `ChildOf` on top-level members. Returns the top-level entity handles.
   * Nested prefabs (`mounts[]`) still materialise as their own SceneInstance
   * anchors. Use {@link instantiate} (anchor) at runtime / Play and for nested
   * prefabs.
   */
  instantiateFlat(handle, world) {
    return instantiateFlat(this, handle, world);
  }
  instantiateFlatWithPublicationFence(handle, world, expectedPublication) {
    return instantiateFlat(this, handle, world, expectedPublication);
  }
  resolveKeyedSceneGuids(scene, world, sceneGuidKey, visited, guidToHandle, resolvedSceneHandles) {
    const active = new Set(visited);
    if (sceneGuidKey !== void 0) active.add(sceneGuidKey.toLowerCase());
    const resolveComponents2 = (entityKey, source) => {
      const output = {};
      for (const [componentName, raw] of Object.entries(source)) {
        if (raw === void 0) continue;
        const fields = { ...raw };
        const token = world.components.resolve(componentName);
        if (token === void 0) {
          output[componentName] = fields;
          continue;
        }
        const schema = componentSchema(token);
        for (const [fieldName, value] of Object.entries(fields)) {
          const fieldType = schema[fieldName];
          if (fieldType?.startsWith("shared<") && typeof value === "string") {
            const resolved = resolveHandleGuid(
              this,
              world,
              value,
              guidToHandle,
              `${componentName}.${fieldName}`,
              `scene entity ${entityKey}`
            );
            if (!resolved.ok) return resolved;
            fields[fieldName] = resolved.value;
          } else if (fieldType?.startsWith("array<shared<") && Array.isArray(value)) {
            const array = [];
            for (const [index, item] of value.entries()) {
              if (typeof item !== "string") {
                array.push(item);
                continue;
              }
              const resolved = resolveHandleGuid(
                this,
                world,
                item,
                guidToHandle,
                `${componentName}.${fieldName}[${index}]`,
                `scene entity ${entityKey}`
              );
              if (!resolved.ok) return resolved;
              array.push(resolved.value);
            }
            fields[fieldName] = array;
          }
        }
        output[componentName] = fields;
      }
      return ok$1(output);
    };
    const entities = {};
    for (const [entityKey, node] of Object.entries(scene.entities)) {
      const components = resolveComponents2(entityKey, node.components);
      if (!components.ok) return components;
      let instance = node.instance;
      if (instance !== void 0) {
        const childKey = instance.source.toLowerCase();
        if (active.has(childKey)) {
          return err(
            new AssetError({
              code: "asset-parse-failed",
              expected: "an acyclic keyed SceneAsset instance graph",
              hint: `recursive SceneAsset instance at ${entityKey} -> ${instance.source}`
            })
          );
        }
        const child = this.assetCatalog.get(childKey)?.payload;
        if (child?.kind === "scene") {
          const childResult = this.resolveKeyedSceneGuids(
            child,
            world,
            childKey,
            /* @__PURE__ */ new Set([...active, childKey]),
            guidToHandle,
            resolvedSceneHandles
          );
          if (!childResult.ok) return childResult;
          if (!resolvedSceneHandles.has(childKey)) {
            const childHandle = unwrapHandle(world.allocSharedRef("SceneAsset", childResult.value));
            resolvedSceneHandles.set(childKey, childHandle);
            this._originIndex.set(childResult.value, childKey);
          }
          const overrides = [];
          for (const override of instance.overrides ?? []) {
            const overrideComponents = resolveComponents2(
              `${entityKey}.${override.target.join(".")}`,
              override.components
            );
            if (!overrideComponents.ok) return overrideComponents;
            overrides.push({ ...override, components: overrideComponents.value });
          }
          instance = {
            source: instance.source,
            ...overrides.length === 0 && instance.overrides === void 0 ? {} : { overrides }
          };
        }
      }
      entities[entityKey] = {
        components: components.value,
        ...instance === void 0 ? {} : { instance }
      };
    }
    return ok$1({
      kind: "scene",
      entities,
      ...scene.skinGuids === void 0 ? {} : { skinGuids: scene.skinGuids }
    });
  }
  /**
   * @internal
   * Transform a SceneAsset whose handle-type component fields hold GUID
   * strings (post-parseScenePayload intermediate state) into a copy whose
   * handle fields hold resolved Handle numbers.
   *
   * Schema-driven field detection (plan-strategy D-4): for each component
   * field whose Component.schema fieldType starts with `shared\<`, the
   * value is treated as a GUID string and resolved via `AssetGuid.parse` +
   * catalogue lookup + `world.internSharedRef` (feat-20260614 M8 D-15/D-17;
   * the registry mints nothing). Unknown component names are silently passed
   * through (the ecs layer's additionalProperties check will catch unknowns at
   * spawn if appropriate).
   *
   * Stop-on-first-error (AC-08): the first unresolvable GUID aborts
   * iteration and returns `AssetError(code='asset-not-found')` with a hint
   * containing the GUID string, node localId, and field name for AI-user
   * debuggability (P3).
   */
  _resolveSceneGuids(scene, world, sceneGuidKey, visitedMountGuids, guidToHandle, resolvedSceneHandles, _materialGraphPreflighted = false) {
    return this.resolveKeyedSceneGuids(
      scene,
      world,
      sceneGuidKey,
      visitedMountGuids ?? /* @__PURE__ */ new Set(),
      guidToHandle ?? /* @__PURE__ */ new Map(),
      resolvedSceneHandles ?? /* @__PURE__ */ new Map()
    );
  }
  /**
   * Register an asset and return a fresh
   * `Result<Handle<TagOf<T>, 'shared'>, AssetError>`. The brand `target`
   * tag is derived from the Asset's `kind` discriminator via `AssetTagMap`
   * (charter F1 single-entry indexability). The runtime representation is
   * an auto-incrementing u32 starting at 1024 (builtins reserve 1-2).
   *
   * feat-20260526 M4: `shadingModel` field is retired in favour of
   * pass-based MaterialAsset. This generic surface covers the full
   * `Asset` closed union (mesh / texture / sampler / scene / equirect
   * / material).
   */
  /**
   * feat-20260614 M8 (D-15 / D-17): catalogue a payload under its GUID.
   * Replaces the old `register` / `registerWithGuid` mint pair -- the registry
   * stores the PAYLOAD and never produces a handle (it owns no World).
   * Column minting is the caller's job via `world.allocSharedRef`.
   *
   * Validates mesh stride + material passes / sprite slices at catalogue entry
   * (same fail-fast surface as the old register path). Returns
   * `Result.err(AssetError)` on validation failure; `Result.ok(payload)` with
   * the stored payload (mesh payloads gain an `aabb`) on success.
   */
  catalog(guid, asset, refs) {
    const a = asset;
    const meshValidation = validateMeshPayload(a);
    if (meshValidation !== null) return err(meshValidation);
    if (a.kind === "tileset") {
      const tilesetAsset = a;
      const tilesetValidation = validateTilesetPayload(
        tilesetAsset,
        inferAtlasExtent(tilesetAsset)
      );
      if (tilesetValidation !== null) return err(tilesetValidation);
    }
    if (a.kind === "material") {
      const matValidation = validateMaterialPasses(this, a);
      if (matValidation !== null) return err(matValidation);
      const sliceValidation = validateSpriteSlices(this, a);
      if (sliceValidation !== null) return err(sliceValidation);
      detectTileNeedsRepeatSampler(this, a);
    }
    let stored = a;
    if (a.kind === "mesh") {
      stored = withMeshAabb(a);
    }
    const key2 = typeof guid === "string" ? guid.toLowerCase() : AssetGuid.format(guid).toLowerCase();
    const kind = a.kind;
    const pendingName = this.pendingNames.get(key2);
    const priorEnvelope = this.assetCatalog.get(key2);
    const priorName = priorEnvelope?.name;
    const name = pendingName ?? priorName;
    this.pendingNames.delete(key2);
    if (priorEnvelope !== void 0 && priorEnvelope.payload !== stored) {
      this._originIndex.set(priorEnvelope.payload, key2);
    }
    this.assetCatalog.set(key2, {
      guid: key2,
      kind,
      ...name !== void 0 ? { name } : {},
      payload: stored,
      refs: refs ?? []
    });
    if (stored.kind === "material") {
      const catalogRevision = (this.materialCatalogRevisions.get(key2) ?? 0) + 1;
      this.materialCatalogRevisions.set(key2, catalogRevision);
      const projection = this.materialRenderProjections.get(key2);
      if (projection !== void 0) this.materialPayloadProjections.set(stored, projection);
    }
    this.catalogEpoch++;
    this.loadState.registerReady(key2, stored);
    if (!this.packages.has(key2)) this.packages.set(key2, null);
    return ok$1(stored);
  }
  /**
   * @internal feat-20260618-asset-and-pack-name-fields M3 (D-1): the single
   * package-mapping write primitive. All three registration entry points funnel
   * here so the display-name invariant is implemented once (#1 SSOT):
   *   - catalog() inline path -> registerPackage(null, [guid])          (no package)
   *   - loadByGuid disk path  -> registerPackage(packageUrl, [g1,g2,...], names)
   *   - constructor builtin    -> registerPackage(null, [...guids])      (D-5 null)
   *
   * `path === null` registers the GUIDs with no package (resolveName reads their
   * storedName or returns ''). A non-null `path` finds-or-creates the shared
   * MutablePackage for that path and adds the GUIDs to it; per-GUID entry names
   * (D-2: name flows entry -> Package, never the payload) are taken from
   * `names`. The 1->N promotion branch (D-3) is added by w11. Never throws --
   * it only writes maps; resolution + validation happen in resolveName / rename.
   */
  _registerPackage(path, guids, names) {
    if (path === null) {
      for (const g of guids) {
        const key2 = g.toLowerCase();
        this.packages.set(key2, null);
        const n = names?.get(g) ?? names?.get(key2);
        if (n !== void 0) this.setStoredName(key2, n);
      }
      return;
    }
    const pkg = this.packageByPath.get(path) ?? { path, assetGuids: /* @__PURE__ */ new Set() };
    this.packageByPath.set(path, pkg);
    const addsNewMember = guids.some((g) => !pkg.assetGuids.has(g.toLowerCase()));
    if (pkg.assetGuids.size === 1 && addsNewMember) {
      const [originalKey] = pkg.assetGuids;
      if (originalKey !== void 0) {
        if (!this.hasStoredName(originalKey)) {
          this.setStoredName(originalKey, deriveAssetName(pkg.path, 1));
        }
      }
    }
    for (const g of guids) {
      const key2 = g.toLowerCase();
      pkg.assetGuids.add(key2);
      this.packages.set(key2, pkg);
      const n = names?.get(g) ?? names?.get(key2);
      if (n !== void 0) this.setStoredName(key2, n);
    }
  }
  /**
   * Read the per-GUID stored display name (D-6 home: the envelope's `name`
   * field, with `pendingNames` covering the prod-disk ordering where the name is
   * known before the body is catalogued). Single read point for resolveName /
   * the 1->N promotion stability check.
   */
  storedNameFor(key2) {
    return this.assetCatalog.get(key2)?.name ?? this.pendingNames.get(key2);
  }
  hasStoredName(key2) {
    return this.storedNameFor(key2) !== void 0;
  }
  /**
   * Write the per-GUID stored display name. When the envelope exists, replace it
   * with one carrying the new `name` (the envelope is immutable; D-6 keeps the
   * payload free of the name). Before the envelope is catalogued (prod disk
   * path), stash on `pendingNames` so catalog() can drain it into the new
   * envelope. `name === undefined` clears the name in both homes.
   */
  setStoredName(key2, name) {
    const envelope = this.assetCatalog.get(key2);
    if (envelope !== void 0) {
      const { name: _drop, ...rest } = envelope;
      this.assetCatalog.set(key2, name === void 0 ? rest : { ...rest, name });
      this.pendingNames.delete(key2);
      return;
    }
    if (name === void 0) this.pendingNames.delete(key2);
    else this.pendingNames.set(key2, name);
  }
  /**
   * Return the `Package` this GUID belongs to, or `null` when the asset has no
   * package (catalog() inline + builtin, D-5), or `undefined` when the GUID was
   * never registered. The returned `Package` is a readonly snapshot whose
   * `assetCount` is derived from the live member set (#2 Derive).
   */
  packageOf(guid) {
    const key2 = typeof guid === "string" ? guid.toLowerCase() : AssetGuid.format(guid).toLowerCase();
    const pkg = this.packages.get(key2);
    if (pkg === void 0) return void 0;
    if (pkg === null) return null;
    return { path: pkg.path, assetGuids: pkg.assetGuids, assetCount: pkg.assetGuids.size };
  }
  /**
   * Resolve an asset's human-readable display name -- the single source of truth
   * for the two-segment identity's `name` segment (D-6). Every name consumer
   * (inspect / catalog builder / CLI) reads this or the same `deriveAssetName`
   * pure function it delegates to (AC-04); no consumer re-implements the
   * display-name rule. Returns a deterministic fallback rather than throwing on a missing
   * name (AC-15): an explicit stored name wins for any packaged or no-package
   * asset; otherwise a packaged asset falls back to `basename(path)`, and a
   * no-package asset resolves to `''` (the detectable "genuinely no name"
   * signal, charter P3). An unregistered GUID is treated as the no-package
   * branch.
   */
  resolveName(guid) {
    const key2 = typeof guid === "string" ? guid.toLowerCase() : AssetGuid.format(guid).toLowerCase();
    const pkg = this.packages.get(key2);
    const storedName = this.storedNameFor(key2);
    const path = pkg == null ? null : pkg.path;
    const assetCount = pkg == null ? 0 : pkg.assetGuids.size;
    return deriveAssetName(path, assetCount, storedName);
  }
  /**
   * Rename an asset's display name in memory (D-4). Three classes by package
   * shape:
   *   - no-package asset      -> set the stored self name
   *   - multi-asset package   -> set the entry stored name
   *   - single-asset package  -> rewrite the package path's leaf segment so the
   *                              derived basename becomes `newName` (the package
   *                              stays single-asset; the leaf IS the name)
   *
   * In-memory only (OOS-1: no disk write-back). Returns structured failures via
   * the closed `AssetErrorCode` union with no new members (D-4): a name that
   * collides with another member of the same package -> `asset-invalid-value`;
   * an unregistered GUID -> `asset-not-found`. AI users consume `.code` through
   * a `switch`, not by parsing `.message` (charter P3).
   */
  rename(guid, newName) {
    const key2 = typeof guid === "string" ? guid.toLowerCase() : AssetGuid.format(guid).toLowerCase();
    if (!this.packages.has(key2)) {
      return err(
        new AssetError({
          code: "asset-not-found",
          expected: `a registered asset for GUID ${key2}`,
          hint: ASSET_ERROR_HINTS["asset-not-found"]
        })
      );
    }
    const pkg = this.packages.get(key2) ?? null;
    const collision = pkg !== null ? this.nameCollisionIn(pkg, key2, newName) : null;
    if (collision !== null) return err(collision);
    if (pkg !== null && pkg.assetGuids.size === 1) {
      const slash = pkg.path.lastIndexOf("/");
      const oldPath = pkg.path;
      pkg.path = slash >= 0 ? `${pkg.path.slice(0, slash + 1)}${newName}` : newName;
      this.packageByPath.delete(oldPath);
      this.packageByPath.set(pkg.path, pkg);
      this.setStoredName(key2, void 0);
      return ok$1(void 0);
    }
    this.setStoredName(key2, newName);
    return ok$1(void 0);
  }
  /**
   * Return an `asset-invalid-value` AssetError if another member of `pkg`
   * already resolves to `newName`, else null. Extracted from `rename` to keep
   * the collision-detection control flow flat (D-4 reuses the closed error code;
   * the detail narrows via the `{ field, value, reason }` union variant).
   */
  nameCollisionIn(pkg, selfKey, newName) {
    for (const memberKey of pkg.assetGuids) {
      if (memberKey !== selfKey && this.resolveName(memberKey) === newName) {
        return new AssetError({
          code: "asset-invalid-value",
          expected: `a name unique within package "${pkg.path}"`,
          hint: `another asset in "${pkg.path}" is already named "${newName}"; choose a distinct name`,
          detail: {
            field: "name",
            value: newName,
            reason: `duplicate name within package ${pkg.path}`
          }
        });
      }
    }
    return null;
  }
  /**
   * Parse a dash-form GUID string into an `AssetGuid`. Thin convenience over
   * `AssetGuid.parse` for the `loadByGuid` / `catalog` call sites; throws
   * `AssetError` on a malformed GUID (caller-error, mirrors `parseInt`-style
   * eager validation -- the GUID literal is author-supplied, not user data).
   */
  parseGuid(guidStr) {
    const parsed = AssetGuid.parse(guidStr);
    if (!parsed.ok) {
      throw new AssetError({
        code: "asset-parse-failed",
        expected: `valid dash-form GUID, got "${guidStr}"`,
        hint: ASSET_ERROR_HINTS["asset-parse-failed"]
      });
    }
    return parsed.value;
  }
  /**
   * Look up a catalogued payload by GUID, or `undefined` on miss. Used by the
   * ECS/render side (e.g. `walkMaterialParents` in `resolve-asset-handle.ts`)
   * to resolve a payload's embedded sub-asset GUIDs (D-19) without minting.
   */
  lookup(guid) {
    const key2 = typeof guid === "string" ? guid.toLowerCase() : AssetGuid.format(guid).toLowerCase();
    const ready = this.loadState.getReady(key2);
    if (ready !== void 0) return ready;
    if (this.packIndexUrl === void 0)
      return this.assetCatalog.get(key2)?.payload;
    return void 0;
  }
  /**
   * feat-20260613-material-paramschema-driven-binding M4 / w23 (D-5 graceful):
   * Return the texture-field name set for the given material-shader id,
   * derived from the registered shader's paramSchema via `derive(paramSchema)
   * .textureFieldNames`. Returns `undefined` when the shader is not yet
   * registered (cross-worktree shader-late-register, plan R-4).
   *
   * Used by `extractFrame` to know which values fields the shader
   * declares as texture handles; the extract layer validates handle-vs-
   * scalar typing and drops misclassified slots so the record stage's
   * MISSING_TEXTURE_HANDLE fallback can take over (white default texture)
   * rather than letting a stray handle reach `device.createBindGroup`.
   *
   * feat-20260705-runtime-tier2-decomposition M1 / w5 (D-4): delegates to the
   * extracted `./registry/validate-material` free function (signature stable).
   */
  materialShaderTextureFieldNames(shaderId) {
    return materialShaderTextureFieldNames(this, shaderId);
  }
  /**
   * Load an asset and all its transitively referenced sub-assets by GUID.
   * The result is a durable Asset payload. Consumer owners may narrow the
   * success type, then call their own World/Host projection; this registry does
   * not create a generic GUID-to-handle materializer.
   * Delegates to the load-by-guid collaboration module (w7 / D-4); see
   * registry/load-by-guid.ts for the full DDC / pack-fetch pipeline.
   */
  async loadByGuid(guid, parentContext) {
    return loadByGuid(this, guid, parentContext);
  }
  /**
   * Dispatch a pack payload through the injected LoaderRegistry. Delegates to
   * the load-by-guid collaboration module (w7 / D-4). Kept as a class method so
   * existing structural-cast test access keeps resolving.
   */
  parseAssetPayload(kind, payload, refs) {
    return parseAssetPayload(this, kind, payload, refs);
  }
  /**
   * Parse a pack asset entry and return the payload + refs. Delegates to the
   * load-by-guid collaboration module (w7 / D-4). Kept as a class method so
   * existing structural-cast test access keeps resolving.
   */
  parseAndReturnAsset(assetEntry) {
    return parseAndReturnAsset(this, assetEntry);
  }
  inspect(guid) {
    if (guid !== void 0) return this.assetEvidenceAdapter.inspect(guid);
    const assets = [];
    for (const [guid2, envelope] of this.assetCatalog) {
      assets.push({
        guid: guid2,
        kind: envelope.payload.kind,
        name: this.resolveName(guid2)
      });
    }
    return { assets };
  }
  /** Verify the same GUID evidence chain through the injected SDK capability. */
  verifyByGuid(guid) {
    return this.assetEvidenceAdapter.verifyByGuid(guid);
  }
  /**
   * Return a readonly snapshot of all catalogued assets (inlined + pack-index)
   * for enumeration by asset panels (AC-03 single source of truth).
   *
   * Merges entries from the private `packIndexCache` (prod path, carries
   * `packageUrl`) and `assetCatalog` (inlined / dev path, no URL). Each
   * GUID appears exactly once. Returns a fresh array on every call — the
   * internal Maps are never exposed (charter P4 consistent abstraction).
   *
   * plan-strategy section 2 D1; requirements AC-03; research Finding 5.
   *
   * @example
   * ```ts
   * for (const e of registry.listCatalog()) {
   *   console.log(e.guid, e.kind, e.name, e.packageUrl);
   * }
   * ```
   */
  listCatalog() {
    const seen = /* @__PURE__ */ new Set();
    const result = [];
    if (this.packIndexCache) {
      for (const [guidKey2, entry] of this.packIndexCache) {
        seen.add(guidKey2);
        result.push({
          guid: guidKey2,
          kind: entry.kind,
          ...entry.name !== void 0 ? { name: entry.name } : {},
          packageUrl: entry.packageUrl,
          ...entry.packageId !== void 0 ? { packageId: entry.packageId } : {},
          ...entry.provenance !== void 0 ? { provenance: entry.provenance } : {},
          ...entry.revision !== void 0 ? { revision: entry.revision } : {},
          ...entry.sourceKey !== void 0 ? { sourceKey: entry.sourceKey } : {},
          ...entry.sourceIndex !== void 0 ? { sourceIndex: entry.sourceIndex } : {},
          ...entry.sourceOverrides !== void 0 ? { sourceOverrides: entry.sourceOverrides } : {},
          ...entry.sourceOverrideDescriptors !== void 0 ? { sourceOverrideDescriptors: entry.sourceOverrideDescriptors } : {},
          authoring: entry.authoring ?? authoringCapabilityForAssetKind(entry.kind),
          ...entry.relations !== void 0 ? { relations: entry.relations } : {},
          ...entry.diagnostics !== void 0 ? { diagnostics: entry.diagnostics } : {},
          ...entry.refs !== void 0 ? { refs: entry.refs } : {},
          ...entry.sourcePath !== void 0 ? { sourcePath: entry.sourcePath } : {},
          ...entry.cookReceiptUrl !== void 0 ? { cookReceiptUrl: entry.cookReceiptUrl } : {},
          ...entry.subject !== void 0 ? { subject: entry.subject } : {},
          ...entry.execution !== void 0 ? { execution: entry.execution } : {},
          ...entry.lifecycle !== void 0 ? { lifecycle: entry.lifecycle } : {},
          ...entry.projection !== void 0 ? { projection: entry.projection } : {}
        });
      }
    }
    for (const [guidKey2, envelope] of this.assetCatalog) {
      if (!seen.has(guidKey2)) {
        const name = envelope.name ?? this.resolveName(guidKey2);
        result.push({
          guid: guidKey2,
          kind: envelope.payload.kind,
          name,
          packageUrl: "",
          authoring: authoringCapabilityForAssetKind(envelope.payload.kind),
          subject: "internal-asset",
          execution: "direct",
          lifecycle: "current",
          projection: {
            subject: "internal-asset",
            execution: "direct",
            lifecycle: "current",
            operations: catalogOperationsFor({
              subject: "internal-asset",
              execution: "direct",
              lifecycle: "current"
            })
          },
          ...envelope.refs.length > 0 ? { refs: envelope.refs.map((r) => r.guid) } : {}
        });
      }
    }
    return result;
  }
};
function createCatalogSource(options) {
  const entries = options.entries;
  return {
    async enumerate() {
      if (entries !== void 0) {
        if (options.expectedRevision === void 0) return ok$1(entries);
        const actualRevisions = entries.flatMap(
          (entry) => entry.revision === void 0 ? [] : [entry.revision]
        );
        const matches = actualRevisions.length > 0 && actualRevisions.every(
          (revision) => revision.digest === options.expectedRevision?.digest && revision.observedAt === options.expectedRevision?.observedAt && revision.rootId === options.expectedRevision?.rootId
        );
        if (!matches) {
          return err(
            new AssetError({
              code: "asset-parse-failed",
              expected: "static catalog entries to carry the expected producer revision",
              hint: "restore a verified catalog revision before applying the source",
              detail: { expectedRevision: options.expectedRevision, actualRevisions }
            })
          );
        }
        return ok$1(entries);
      }
      if (options.url === void 0) {
        return err(
          new AssetError({
            code: "catalog-source-unconfigured",
            expected: "a configured catalog source",
            hint: ASSET_ERROR_HINTS["catalog-source-unconfigured"]
          })
        );
      }
      const result = await fetchCatalog(
        options.url,
        options.fetch ?? globalThis.fetch,
        void 0,
        options.expectedRevision,
        options.expectedScope
      );
      if (!result.ok) return result;
      return ok$1(
        [...result.value].map(([guid, entry]) => ({ guid, ...entry }))
      );
    },
    subscribe(listener) {
      return options.subscribe?.(listener) ?? (() => {
      });
    },
    ...options.url === void 0 ? {} : { url: options.url },
    ...options.expectedRevision === void 0 ? {} : { expectedRevision: options.expectedRevision },
    ...options.expectedScope === void 0 ? {} : { expectedScope: options.expectedScope }
  };
}
var IMAGE_ERROR_EXPECTED_LOCAL = {
  "image-format-unsupported": "mime is one of ['image/png', 'image/jpeg', 'image/x-tga']; texture format <-> colorSpace family agrees"
};
var RuntimeImageError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(detail) {
    const code = detail.code;
    const expected = IMAGE_ERROR_EXPECTED_LOCAL[code];
    const hint = IMAGE_ERROR_HINTS[code];
    super(`[ImageError ${code}] expected: ${expected}; hint: ${hint}`);
    this.name = "ImageError";
    this.code = code;
    this.expected = expected;
    this.hint = hint;
    this.detail = detail;
  }
};
function makeImageError(detail) {
  return new RuntimeImageError(detail);
}

// src/decode-image-bytes.ts
var SUPPORTED_MIMES = ["image/png", "image/jpeg"];
function isSupportedMime(mime) {
  return SUPPORTED_MIMES.some((supportedMime) => supportedMime === mime);
}
async function decodeImageBytes(bytes, mime, opts = {}) {
  if (!isSupportedMime(mime)) {
    return err$1(
      makeImageError({
        code: "image-format-unsupported",
        actualMime: mime
      })
    );
  }
  const colorSpace = opts.colorSpace ?? "srgb";
  const mipmap = opts.mipmap ?? true;
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const decoded = await decodeImageInBrowser(u8, mime, { colorSpace, mipmap });
  if (!decoded.ok) {
    return err$1(decoded.error);
  }
  const dec = decoded.value;
  const format = colorSpace === "srgb" ? "rgba8unorm-srgb" : "rgba8unorm";
  const pod = {
    kind: "texture",
    shape: { viewDimension: "2d", extent: { width: dec.width, height: dec.height } },
    format,
    data: dec.bytes,
    colorSpace,
    mips: mipmap ? { kind: "generate" } : { kind: "none" }
  };
  return ok(pod);
}
var VIDEO_TEXTURE_USAGE = 2 | 4 | 16;
var VIDEO_TEXTURE_FORMAT = "rgba8unorm-srgb";
function adaptDynamicTextureDevice(device) {
  return {
    createTexture: (descriptor) => device.createTexture({
      ...descriptor,
      mipLevelCount: void 0,
      sampleCount: void 0,
      dimension: void 0,
      viewFormats: void 0,
      textureBindingViewDimension: void 0
    }),
    createTextureView: (texture) => device.createTextureView(texture, {
      label: void 0,
      format: void 0,
      dimension: void 0,
      usage: void 0,
      aspect: void 0,
      baseMipLevel: void 0,
      mipLevelCount: void 0,
      baseArrayLayer: void 0,
      arrayLayerCount: void 0
    }),
    destroyTexture: (texture) => device.destroyTexture(texture),
    queue: {
      copyExternalImageToTexture: (source, destination, copySize) => device.queue.copyExternalImageToTexture(
        { source: source.source, origin: [0, 0], flipY: source.flipY ?? false },
        { texture: destination.texture, origin: [0, 0, 0] },
        copySize
      )
    }
  };
}
var DynamicTextureStore = class {
  device = void 0;
  entries = /* @__PURE__ */ new Map();
  /**
   * Wire the GPU device the store uploads through. Called once after the
   * renderer captures its device (mirrors GpuResourceStore.configureGpuDevice).
   * A replacement device invalidates every cached texture: the handles in the
   * map belong to the old device and cannot be reused after renderer recovery.
   */
  configureGpuDevice(device) {
    if (this.device !== void 0 && this.device !== device) {
      this.destroyAll();
    }
    this.device = device;
  }
  /**
   * Upload one video frame for `clip` from the host-owned source image
   * (HTMLVideoElement / VideoFrame / ImageBitmap), (re)allocating the transient
   * texture when its size changes, and return the current-frame view to bind.
   *
   * Returns `undefined` (not an error) when the device is not yet wired or the
   * source has no decodable dimensions yet (metadata pending) — the caller binds
   * the default view that frame. A structured RhiError surfaces only when a wired
   * device rejects the allocation or the copy (charter P3).
   */
  uploadFrame(clip, source, width, height) {
    const device = this.device;
    if (device === void 0) return void 0;
    if (width <= 0 || height <= 0) return void 0;
    const id = handleSlot(clip);
    const ensured = this.ensureEntry(device, id, width, height);
    if (!ensured.ok) return ensured;
    const entry = ensured.value;
    const copyRes = device.queue.copyExternalImageToTexture(
      { source, flipY: true },
      { texture: entry.texture },
      { width, height, depthOrArrayLayers: 1 }
    );
    if (!copyRes.ok) return copyRes;
    return ok$1(entry.view);
  }
  /**
   * The current-frame view for a clip, if one has been uploaded this session,
   * else undefined. The record stage reads this when assembling the bind group
   * (a frame that has not uploaded yet falls back to the default view).
   */
  getView(clip) {
    return this.entries.get(handleSlot(clip))?.view;
  }
  /** Destroy every transient texture + drop the map (renderer teardown). */
  destroyAll() {
    const device = this.device;
    for (const entry of this.entries.values()) {
      device?.destroyTexture(entry.texture);
    }
    this.entries.clear();
  }
  /**
   * Get the entry for `id`, (re)allocating its texture + view when absent or
   * when the source dimensions changed. A same-size re-upload reuses the
   * existing texture (allocate-once for a steady clip; the per-frame cost is the
   * copyExternalImageToTexture write, not a texture create).
   */
  ensureEntry(device, id, width, height) {
    const existing = this.entries.get(id);
    if (existing !== void 0 && existing.width === width && existing.height === height) {
      return ok$1(existing);
    }
    if (existing !== void 0) device.destroyTexture(existing.texture);
    const texRes = device.createTexture({
      size: { width, height, depthOrArrayLayers: 1 },
      format: VIDEO_TEXTURE_FORMAT,
      usage: VIDEO_TEXTURE_USAGE,
      label: `video-transient-${id}`
    });
    if (!texRes.ok) return texRes;
    const viewRes = device.createTextureView(texRes.value, {});
    if (!viewRes.ok) {
      device.destroyTexture(texRes.value);
      return viewRes;
    }
    const entry = { texture: texRes.value, view: viewRes.value, width, height };
    this.entries.set(id, entry);
    return ok$1(entry);
  }
};

// src/internal/artifact-cache.ts
var ArtifactCache = class {
  values = /* @__PURE__ */ new Map();
  pending = /* @__PURE__ */ new Map();
  hits = 0;
  misses = 0;
  read(contentAddress, reader) {
    const value = this.values.get(contentAddress);
    if (value !== void 0) {
      this.hits += 1;
      return Promise.resolve({ ok: true, value: new Uint8Array(value) });
    }
    const pending = this.pending.get(contentAddress);
    if (pending !== void 0) {
      this.hits += 1;
      return pending;
    }
    this.misses += 1;
    const request = Promise.resolve().then(reader).then((result) => {
      if (result.ok) this.values.set(contentAddress, new Uint8Array(result.value));
      return result;
    }).finally(() => {
      if (this.pending.get(contentAddress) === request) this.pending.delete(contentAddress);
    });
    this.pending.set(contentAddress, request);
    return request;
  }
  clear(contentAddress) {
    if (contentAddress === void 0) {
      this.values.clear();
      this.pending.clear();
      return;
    }
    this.values.delete(contentAddress);
    this.pending.delete(contentAddress);
  }
  snapshot() {
    return Object.freeze({
      entries: this.values.size,
      pending: this.pending.size,
      hits: this.hits,
      misses: this.misses
    });
  }
};

// src/internal/immutable-payload.ts
function freezeRuntimePayload(value) {
  const seen = /* @__PURE__ */ new WeakSet();
  return freeze(value, seen);
}
function freeze(value, seen) {
  if (value === null || typeof value !== "object") return value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value;
  if (seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) freeze(child, seen);
  return Object.freeze(value);
}

// src/internal/asset-graph.ts
function cancelled(guid) {
  return {
    code: "asset-load-cancelled",
    expected: "the request AbortSignal to remain live until asset closure completes",
    hint: "retry with a live AbortSignal when the request is still needed",
    detail: { guid }
  };
}
function disposed(scopeId = "asset-runtime") {
  return {
    code: "asset-runtime-disposed",
    expected: "an active asset runtime scope",
    hint: "obtain a new Registry from the current realm",
    detail: { scopeId }
  };
}
function superseded(guid, generation) {
  return {
    code: "asset-superseded",
    expected: "the load ticket to remain current until promotion",
    hint: "load the current publication after the Catalog change",
    detail: { guid, generation }
  };
}
function thrown(guid) {
  return {
    code: "asset-decode-failed",
    expected: "the graph reader to return a Result",
    hint: "repair the owner reader and retry the current publication",
    detail: { guid, kind: "asset-graph-reader" }
  };
}
function freezeSnapshot2(snapshot) {
  return Object.freeze({
    ...snapshot,
    ready: Object.freeze([...snapshot.ready]),
    sccs: Object.freeze(snapshot.sccs.map((scc) => Object.freeze([...scc]))),
    counters: Object.freeze({ ...snapshot.counters })
  });
}
var AssetGraph = class {
  read;
  limit;
  ready = /* @__PURE__ */ new Map();
  forward = /* @__PURE__ */ new Map();
  reverse = /* @__PURE__ */ new Map();
  reads = /* @__PURE__ */ new Map();
  requests = /* @__PURE__ */ new Map();
  listeners = /* @__PURE__ */ new Set();
  sccs = [];
  activeReads = 0;
  readWaiters = [];
  disposed = false;
  epoch = 0;
  counters = {
    loads: 0,
    cacheHits: 0,
    readErrors: 0,
    noChange: 0,
    listenerFailures: 0
  };
  currentSnapshot;
  constructor(options) {
    this.read = options.read;
    this.limit = Math.max(1, Math.floor(options.maxConcurrentReads ?? 8));
    this.currentSnapshot = freezeSnapshot2({
      epoch: 0,
      ready: [],
      pending: 0,
      resources: 0,
      sccs: [],
      counters: this.counters
    });
  }
  load(guid, signal = new AbortController().signal) {
    const canonicalGuid = guid.toLowerCase();
    if (this.disposed) return Promise.resolve(err$1(disposed()));
    if (signal.aborted) return Promise.resolve(err$1(cancelled(canonicalGuid)));
    const cached = this.ready.get(canonicalGuid);
    if (cached !== void 0) {
      this.counters = {
        ...this.counters,
        cacheHits: this.counters.cacheHits + 1,
        noChange: this.counters.noChange + 1
      };
      this.publish();
      return Promise.resolve(ok(cached));
    }
    const existing = this.requests.get(canonicalGuid);
    if (existing !== void 0) {
      this.counters = { ...this.counters, cacheHits: this.counters.cacheHits + 1 };
      return existing;
    }
    this.counters = { ...this.counters, loads: this.counters.loads + 1 };
    const ticketEpoch = this.epoch;
    const request = this.loadClosure(canonicalGuid, signal, ticketEpoch).finally(() => {
      if (this.requests.get(canonicalGuid) === request) this.requests.delete(canonicalGuid);
      this.publish();
    });
    this.requests.set(canonicalGuid, request);
    this.publish();
    return request;
  }
  invalidate(guid) {
    const affected = this.collectAffected([guid.toLowerCase()]);
    this.drop(affected);
    this.epoch += 1;
    this.publish();
    return [...affected].sort();
  }
  invalidateForCatalogChange(guids) {
    if (this.disposed) return;
    const affected = guids === void 0 || guids.length === 0 ? /* @__PURE__ */ new Set([...this.ready.keys(), ...this.requests.keys(), ...this.reads.keys()]) : this.collectAffected(guids.map((item) => item.toLowerCase()));
    this.drop(affected);
    this.epoch += 1;
    this.publish();
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  snapshot() {
    return this.currentSnapshot;
  }
  lookup(guid) {
    return this.ready.get(guid.toLowerCase())?.value;
  }
  guidOf(value) {
    for (const [guid, entry] of this.ready) {
      if (entry.value === value) return guid;
    }
    return void 0;
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.epoch += 1;
    this.ready.clear();
    this.forward.clear();
    this.reverse.clear();
    this.reads.clear();
    const waiters = this.readWaiters;
    this.readWaiters = [];
    for (const resolve of waiters) resolve();
    this.publish();
  }
  async loadClosure(root, signal, ticketEpoch) {
    const values = /* @__PURE__ */ new Map();
    const visiting = /* @__PURE__ */ new Set();
    const visited = /* @__PURE__ */ new Set();
    const group = /* @__PURE__ */ new Set();
    const result = await this.visit(root, signal, visiting, visited, values, group);
    if (!result.ok) return result;
    if (this.disposed) return err$1(disposed());
    if (signal.aborted) return err$1(cancelled(root));
    if (ticketEpoch !== this.epoch) return err$1(superseded(root, ticketEpoch));
    for (const [guid, value] of values) this.promote(guid, value);
    this.recordScc();
    return ok(values.get(root));
  }
  async visit(guid, signal, visiting, visited, values, group) {
    if (visiting.has(guid)) {
      group.add(guid);
      return ok({ value: void 0, refs: [] });
    }
    if (visited.has(guid)) return ok(values.get(guid));
    const cached = this.ready.get(guid);
    if (cached !== void 0) {
      values.set(guid, cached);
      visited.add(guid);
      return ok(cached);
    }
    visiting.add(guid);
    const read = await this.readOnce(guid, signal);
    if (!read.ok) {
      visiting.delete(guid);
      return read;
    }
    values.set(guid, read.value);
    group.add(guid);
    this.link(guid, read.value.refs);
    for (const ref of read.value.refs) {
      const child = await this.visit(ref, signal, visiting, visited, values, group);
      if (!child.ok) {
        visiting.delete(guid);
        return err$1({
          code: "asset-dependency-failed",
          expected: "every referenced asset to load successfully",
          hint: "repair the dependency publication and retry the root asset",
          detail: { guid, dependencyGuid: ref }
        });
      }
    }
    visiting.delete(guid);
    visited.add(guid);
    return ok(read.value);
  }
  readOnce(guid, signal) {
    const existing = this.reads.get(guid);
    if (existing !== void 0) return existing;
    const request = this.withPermit(async () => {
      if (this.disposed) return err$1(disposed());
      if (signal.aborted) return err$1(cancelled(guid));
      try {
        const result = await this.read(guid, signal);
        if (signal.aborted) return err$1(cancelled(guid));
        if (!result.ok)
          this.counters = { ...this.counters, readErrors: this.counters.readErrors + 1 };
        return result;
      } catch {
        this.counters = { ...this.counters, readErrors: this.counters.readErrors + 1 };
        return err$1(thrown(guid));
      }
    });
    this.reads.set(guid, request);
    void request.finally(() => {
      if (this.reads.get(guid) === request) this.reads.delete(guid);
    });
    return request;
  }
  async withPermit(operation) {
    if (this.activeReads >= this.limit) {
      await new Promise((resolve) => this.readWaiters.push(resolve));
    }
    this.activeReads += 1;
    try {
      return await operation();
    } finally {
      this.activeReads -= 1;
      this.readWaiters.shift()?.();
    }
  }
  link(guid, refs) {
    const previous = this.forward.get(guid) ?? /* @__PURE__ */ new Set();
    for (const ref of previous) this.reverse.get(ref)?.delete(guid);
    const next = new Set(refs.map((ref) => ref.toLowerCase()));
    this.forward.set(guid, next);
    for (const ref of next) {
      const dependents = this.reverse.get(ref) ?? /* @__PURE__ */ new Set();
      dependents.add(guid);
      this.reverse.set(ref, dependents);
    }
  }
  collectAffected(guids) {
    const affected = /* @__PURE__ */ new Set();
    const queue = [...guids];
    while (queue.length > 0) {
      const current = queue.shift();
      if (current === void 0 || affected.has(current)) continue;
      affected.add(current);
      for (const dependent of this.reverse.get(current) ?? []) queue.push(dependent);
    }
    return affected;
  }
  drop(affected) {
    for (const item of affected) {
      for (const ref of this.forward.get(item) ?? []) this.reverse.get(ref)?.delete(item);
      for (const dependent of this.reverse.get(item) ?? []) {
        this.forward.get(dependent)?.delete(item);
      }
    }
    for (const item of affected) {
      this.ready.delete(item);
      this.requests.delete(item);
      this.reads.delete(item);
      this.forward.delete(item);
      this.reverse.delete(item);
    }
    this.sccs.splice(0, this.sccs.length);
  }
  promote(guid, value) {
    if (value === void 0) return;
    this.ready.set(
      guid,
      Object.freeze({
        ...value,
        value: freezeRuntimePayload(value.value),
        refs: Object.freeze([...value.refs])
      })
    );
  }
  recordScc() {
    const indexByGuid = /* @__PURE__ */ new Map();
    const lowByGuid = /* @__PURE__ */ new Map();
    const stack = [];
    const onStack = /* @__PURE__ */ new Set();
    let nextIndex = 0;
    const components = [];
    const visit = (guid) => {
      indexByGuid.set(guid, nextIndex);
      lowByGuid.set(guid, nextIndex);
      nextIndex += 1;
      stack.push(guid);
      onStack.add(guid);
      for (const ref of this.forward.get(guid) ?? []) {
        if (!indexByGuid.has(ref)) {
          visit(ref);
          lowByGuid.set(guid, Math.min(lowByGuid.get(guid) ?? 0, lowByGuid.get(ref) ?? 0));
        } else if (onStack.has(ref)) {
          lowByGuid.set(guid, Math.min(lowByGuid.get(guid) ?? 0, indexByGuid.get(ref) ?? 0));
        }
      }
      if (lowByGuid.get(guid) !== indexByGuid.get(guid)) return;
      const component = [];
      let member;
      do {
        member = stack.pop();
        if (member === void 0) break;
        onStack.delete(member);
        component.push(member);
      } while (member !== guid);
      if (component.length > 1 || this.forward.get(guid)?.has(guid) === true)
        components.push(component.sort());
    };
    for (const guid of this.forward.keys()) if (!indexByGuid.has(guid)) visit(guid);
    this.sccs.splice(
      0,
      this.sccs.length,
      ...components.map((component) => Object.freeze(component))
    );
  }
  publish() {
    this.currentSnapshot = freezeSnapshot2({
      epoch: this.epoch,
      ready: [...this.ready.keys()].sort(),
      pending: this.requests.size + this.reads.size,
      resources: this.ready.size,
      sccs: this.sccs,
      counters: this.counters
    });
    for (const listener of [...this.listeners]) {
      try {
        listener(this.currentSnapshot);
      } catch {
        this.counters = {
          ...this.counters,
          listenerFailures: Math.min(1024, this.counters.listenerFailures + 1)
        };
        this.currentSnapshot = freezeSnapshot2({
          ...this.currentSnapshot,
          counters: this.counters
        });
      }
    }
  }
};
function invalidRow(guid, reason) {
  return err$1({
    code: "asset-package-invalid",
    expected: "one complete current runtime Catalog row",
    hint: "rebuild the producer Catalog and publish one Pack v2 tuple",
    detail: { guid, reason }
  });
}
function validateRuntimeRow(row) {
  if (row === null || typeof row !== "object") return invalidRow("", "row");
  const candidate = row;
  const guid = typeof candidate.guid === "string" ? candidate.guid : "";
  if (guid.trim().length === 0) return invalidRow(guid, "guid");
  if (typeof candidate.kind !== "string" || candidate.kind.trim().length === 0)
    return invalidRow(guid, "kind");
  if (typeof candidate.packageUrl !== "string" || candidate.packageUrl.trim().length === 0)
    return invalidRow(guid, "packageUrl");
  if (typeof candidate.sourcePath !== "string" || candidate.sourcePath.trim().length === 0)
    return invalidRow(guid, "sourcePath");
  if (!Number.isSafeInteger(candidate.publication?.generation))
    return invalidRow(guid, "publication generation");
  if (candidate.publication === void 0) return invalidRow(guid, "publication");
  const publication = candidate.publication;
  if (publication.schemaVersion !== "asset-publication/1" || typeof publication.sourcePath !== "string" || publication.sourcePath.trim().length === 0 || typeof publication.sourceRevision !== "string" || publication.sourceRevision.trim().length === 0 || publication.generation < 0 || typeof publication.digest !== "string" || publication.digest.trim().length === 0 || typeof publication.outputSetDigest !== "string" || publication.outputSetDigest.trim().length === 0 || !Array.isArray(publication.outputs) || publication.receipt === null || typeof publication.receipt !== "object" || !Array.isArray(publication.externalEvidence)) {
    return invalidRow(guid, "publication tuple");
  }
  return ok(Object.freeze({ ...candidate, guid, publication }));
}

// src/internal/catalog-session.ts
function runtimeError(code, guid, detail) {
  if (code === "catalog-discontinuous") {
    return {
      code,
      expected: "an ordered catalog revision window",
      hint: "reconcile the current Catalog before consuming this delta",
      detail: {
        scopeId: String(detail.scopeId ?? "unknown"),
        expectedGeneration: Number(detail.expectedGeneration ?? 0),
        actualGeneration: Number(detail.actualGeneration ?? 0)
      }
    };
  }
  return {
    code: "asset-package-invalid",
    expected: "a verified Catalog source",
    hint: "repair the producer Catalog and retry with the current publication",
    detail: { guid, reason: String(detail.reason ?? "catalog source failed") }
  };
}
function freezeSnapshot3(snapshot) {
  return Object.freeze({
    ...snapshot,
    entries: Object.freeze([...snapshot.entries]),
    changed: Object.freeze([...snapshot.changed]),
    removed: Object.freeze([...snapshot.removed]),
    diagnostics: Object.freeze([...snapshot.diagnostics])
  });
}
function sameEntry(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}
function key(guid) {
  return guid.toLowerCase();
}
var CatalogSession = class {
  source;
  scopeId;
  generation;
  entries = /* @__PURE__ */ new Map();
  listeners = /* @__PURE__ */ new Set();
  unsubscribe;
  baselinePromise;
  reconcilePromise;
  pending = [];
  currentSnapshot;
  revision;
  diagnostics = [];
  listenerFailures = 0;
  changed = /* @__PURE__ */ new Set();
  removed = /* @__PURE__ */ new Set();
  epoch = 0;
  stale = false;
  staleGeneration = 0;
  started = false;
  disposed = false;
  constructor(source, options = {}) {
    this.source = source;
    this.scopeId = options.scopeId ?? source.expectedScope?.scopeId ?? "asset-runtime";
    this.generation = options.generation ?? source.expectedScope?.generation ?? 0;
    this.currentSnapshot = freezeSnapshot3({
      scopeId: this.scopeId,
      generation: this.generation,
      epoch: 0,
      entries: [],
      changed: [],
      removed: [],
      diagnostics: [],
      listenerFailures: 0,
      stale: false
    });
  }
  start() {
    if (this.baselinePromise !== void 0) return this.baselinePromise;
    if (this.disposed) return Promise.resolve(err$1(this.disposedError()));
    this.unsubscribe = this.source.subscribe((delta) => this.receive(delta));
    const promise = this.source.enumerate().then((result) => {
      if (!result.ok) {
        this.markStale();
        this.publish();
        return err$1(runtimeError("asset-package-invalid", "", { reason: result.error.code }));
      }
      this.entries.clear();
      for (const entry of result.value) {
        const validated = validateRuntimeRow(entry);
        if (!validated.ok) {
          this.markStale();
          this.publish();
          return err$1(validated.error);
        }
        this.entries.set(key(validated.value.guid), validated.value);
      }
      this.started = true;
      this.stale = false;
      this.staleGeneration = this.generation;
      this.diagnostics = [];
      for (const delta of this.pending) this.fold(delta, false);
      this.pending = [];
      this.publish();
      return ok(this.currentSnapshot);
    }).catch((cause) => {
      this.markStale();
      this.addDiagnostic("catalog-degraded-rows", "Catalog enumeration must resolve a Result");
      this.publish();
      return err$1(
        runtimeError("asset-package-invalid", "", {
          reason: cause instanceof Error ? cause.message : String(cause)
        })
      );
    });
    this.baselinePromise = promise;
    void promise.then(
      (result) => {
        if (!result.ok) this.baselinePromise = void 0;
      },
      () => {
        this.baselinePromise = void 0;
      }
    );
    return promise;
  }
  reconcile() {
    if (this.disposed) return Promise.resolve(err$1(this.disposedError()));
    if (this.reconcilePromise !== void 0) return this.reconcilePromise;
    this.unsubscribe?.();
    this.unsubscribe = void 0;
    this.started = false;
    this.pending = [];
    this.baselinePromise = void 0;
    this.epoch += 1;
    const promise = this.start();
    this.reconcilePromise = promise;
    void promise.then(
      () => {
        if (this.reconcilePromise === promise) this.reconcilePromise = void 0;
      },
      () => {
        if (this.reconcilePromise === promise) this.reconcilePromise = void 0;
      }
    );
    return promise;
  }
  current(guid) {
    return this.entries.get(key(guid));
  }
  snapshot() {
    return this.currentSnapshot;
  }
  discontinuity() {
    if (!this.stale) return void 0;
    return {
      code: "catalog-discontinuous",
      expected: "an ordered, authoritative catalog revision window",
      hint: "reconcile the Catalog source and retry the current publication",
      detail: {
        scopeId: this.scopeId,
        expectedGeneration: this.generation,
        actualGeneration: this.staleGeneration
      }
    };
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.unsubscribe?.();
    this.unsubscribe = void 0;
    this.pending = [];
    this.listeners.clear();
  }
  receive(delta) {
    if (this.disposed) return;
    if (!this.started) {
      this.pending.push(delta);
      return;
    }
    this.fold(delta, true);
  }
  fold(delta, publish) {
    if (delta.scopeId !== void 0 && delta.scopeId !== this.scopeId || delta.generation !== void 0 && delta.generation !== this.generation) {
      this.markStale(delta.generation);
      this.addDiagnostic("catalog-scope-mismatch", "delta scope does not match the session");
      if (publish) this.publish();
      return;
    }
    if (delta.authority === "degraded") {
      this.markStale(delta.generation);
      this.addDiagnostic("catalog-degraded-rows", "degraded rows are not identity-bearing");
      if (publish) this.publish();
      return;
    }
    if (delta.revisions !== void 0) {
      const baseline = delta.revisions.baseline;
      const current = delta.revisions.current;
      const valid = baseline.length === current.length && current.every((point) => {
        const prior = baseline.find((item) => item.rootId === point.rootId);
        return prior !== void 0 && point.revision === prior.revision + 1;
      });
      if (!valid) {
        this.markStale(delta.generation);
        this.addDiagnostic("catalog-gap", "delta revision window is not contiguous");
        if (publish) this.publish();
        return;
      }
    }
    let changed = false;
    for (const entry of [...delta.added, ...delta.changed]) {
      const validated = validateRuntimeRow(entry);
      if (!validated.ok) {
        this.markStale(delta.generation);
        this.addDiagnostic("catalog-degraded-rows", "delta contains an invalid runtime row");
        if (publish) this.publish();
        return;
      }
      const entryKey = key(validated.value.guid);
      const prior = this.entries.get(entryKey);
      if (prior === void 0 || !sameEntry(prior, validated.value)) {
        this.entries.set(entryKey, validated.value);
        this.changed.add(entryKey);
        changed = true;
        if (validated.value.revision !== void 0) this.revision = validated.value.revision;
      }
    }
    for (const guid of delta.removed) {
      const entryKey = key(guid);
      if (this.entries.delete(entryKey)) {
        this.removed.add(entryKey);
        changed = true;
      }
    }
    if (changed) this.epoch += 1;
    if (publish) this.publish();
  }
  addDiagnostic(code, expected) {
    if (this.diagnostics.some((diagnostic) => diagnostic.code === code)) return;
    this.diagnostics.push({
      code,
      severity: "blocking",
      expected,
      hint: "reconcile the Catalog before loading the affected publication",
      authority: "catalog"
    });
  }
  markStale(actualGeneration = this.generation) {
    this.stale = true;
    this.staleGeneration = actualGeneration;
    this.epoch += 1;
  }
  publish() {
    this.currentSnapshot = freezeSnapshot3({
      scopeId: this.scopeId,
      generation: this.generation,
      epoch: this.epoch,
      ...this.revision === void 0 ? {} : { revision: this.revision },
      entries: [...this.entries.values()].sort(
        (left, right) => key(left.guid).localeCompare(key(right.guid))
      ),
      changed: [...this.changed].sort(),
      removed: [...this.removed].sort(),
      diagnostics: this.diagnostics,
      listenerFailures: this.listenerFailures,
      stale: this.stale
    });
    this.changed.clear();
    this.removed.clear();
    for (const listener of [...this.listeners]) {
      try {
        listener(this.currentSnapshot);
      } catch {
        this.listenerFailures = Math.min(1024, this.listenerFailures + 1);
        this.currentSnapshot = freezeSnapshot3({
          ...this.currentSnapshot,
          listenerFailures: this.listenerFailures
        });
      }
    }
  }
  disposedError() {
    return runtimeError("asset-runtime-disposed", "", { scopeId: this.scopeId });
  }
};
var DecoderRegistry = class {
  dispatch = /* @__PURE__ */ new Map();
  scopeId;
  disposed = false;
  constructor(options = {}) {
    this.scopeId = options.scopeId ?? "asset-runtime";
  }
  install(kind, decoder) {
    if (this.disposed) throw new TypeError("asset runtime decoder registry is disposed");
    const normalizedDecoder = decoder;
    const existing = this.dispatch.get(kind.kind);
    if (existing !== void 0) {
      if (existing.decoder !== normalizedDecoder) {
        throw new TypeError(`duplicate decoder kind "${kind.kind}"`);
      }
      existing.references += 1;
      return this.createLease(kind.kind, existing);
    }
    const identity = Symbol(kind.kind);
    const entry = {
      identity,
      decoder: normalizedDecoder,
      decode: (input) => decoder.decode(input),
      references: 1
    };
    this.dispatch.set(kind.kind, entry);
    return this.createLease(kind.kind, entry);
  }
  createLease(kind, entry) {
    let released = false;
    return {
      kind,
      dispose: () => {
        if (released) return;
        released = true;
        entry.references -= 1;
        if (entry.references === 0 && this.dispatch.get(kind)?.identity === entry.identity) {
          this.dispatch.delete(kind);
        }
      }
    };
  }
  has(kind) {
    return this.dispatch.has(kind.kind);
  }
  load(kind, input) {
    return this.decode(kind, input);
  }
  loadByKind(kind, input) {
    if (this.disposed) return Promise.resolve(err$1(disposedError(this.scopeId)));
    const entry = this.dispatch.get(kind);
    if (entry === void 0) {
      return Promise.resolve(
        err$1({
          code: "asset-decoder-missing",
          expected: `an active decoder for kind "${kind}"`,
          hint: "install the owner decoder lease before loading this kind",
          detail: { kind }
        })
      );
    }
    return this.decodeEntry(kind, entry, input);
  }
  async decode(kind, input) {
    if (this.disposed) return err$1(disposedError(this.scopeId));
    if (input.signal.aborted) return err$1(cancelledError(input.envelope.guid));
    const entry = this.dispatch.get(kind.kind);
    if (entry === void 0) {
      return err$1({
        code: "asset-decoder-missing",
        expected: `an active decoder for kind "${kind.kind}"`,
        hint: "install the owner decoder lease before loading this kind",
        detail: { kind: kind.kind }
      });
    }
    return await this.decodeEntry(kind.kind, entry, input);
  }
  async decodeEntry(kind, entry, input) {
    if (this.disposed) return err$1(disposedError(this.scopeId));
    if (input.signal.aborted) return err$1(cancelledError(input.envelope.guid));
    try {
      const result = await entry.decode(input);
      if (this.disposed) return err$1(disposedError(this.scopeId));
      if (this.dispatch.get(kind)?.identity !== entry.identity) {
        return err$1(supersededError(input.envelope.guid, kind));
      }
      if (input.signal.aborted) return err$1(cancelledError(input.envelope.guid));
      return result.ok ? ok(freezeRuntimePayload(result.value)) : result;
    } catch {
      return err$1({
        code: "asset-decode-failed",
        expected: `decoder for kind "${kind}" to return a Result`,
        hint: "inspect the owner decoder and retry the current publication",
        detail: { guid: input.envelope.guid, kind }
      });
    }
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.dispatch.clear();
  }
};
function cancelledError(guid) {
  return {
    code: "asset-load-cancelled",
    expected: "the request AbortSignal to remain live until decode completes",
    hint: "retry with a live AbortSignal when the request is still needed",
    detail: { guid }
  };
}
function disposedError(scopeId) {
  return {
    code: "asset-runtime-disposed",
    expected: "an active asset runtime decoder scope",
    hint: "obtain a new Registry from the current realm",
    detail: { scopeId }
  };
}
function supersededError(guid, kind) {
  return {
    code: "asset-superseded",
    expected: `the decoder lease for kind "${kind}" to remain current until decode completes`,
    hint: "retry the current publication after reinstalling its owner decoder",
    detail: { guid, generation: 0 }
  };
}
function invalid(guid, reason) {
  return err$1({
    code: "asset-package-invalid",
    expected: "a verified Pack v2 envelope with complete runtime artifacts",
    hint: "re-cook the Pack v2 publication and retry the current tuple",
    detail: { guid, reason }
  });
}
function frozen(value) {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) frozen(child);
  }
  return value;
}
function sameTuple(left, right) {
  return left.scopeId === right.scopeId && left.generation === right.generation && left.digest === right.digest && left.outputSetDigest === right.outputSetDigest;
}
var PackReader = class {
  fetcher;
  verified = /* @__PURE__ */ new Map();
  pending = /* @__PURE__ */ new Map();
  constructor(options = {}) {
    this.fetcher = options.fetcher?.bind(globalThis);
  }
  async read(packageUrl, expected, signal) {
    if (signal.aborted) return err$1(this.cancelled(packageUrl));
    const key2 = this.key(packageUrl, expected);
    const cached = this.verified.get(key2);
    if (cached !== void 0) return ok(cached);
    const active = this.pending.get(key2);
    if (active !== void 0) return active;
    const request = this.fetchAndVerify(packageUrl, expected, signal);
    this.pending.set(key2, request);
    const result = await request;
    this.pending.delete(key2);
    if (result.ok) this.verified.set(key2, result.value);
    return result;
  }
  async fetchAndVerify(packageUrl, expected, signal) {
    let response;
    try {
      const fetcher = this.fetcher ?? globalThis.fetch.bind(globalThis);
      response = await fetcher(packageUrl, { signal });
    } catch (_cause) {
      if (signal.aborted) return err$1(this.cancelled(packageUrl));
      return err$1({
        code: "asset-fetch-failed",
        expected: "HTTP 200 for the current Pack URL",
        hint: "verify the package locator and republish the Pack",
        detail: { guid: packageUrl, packageUrl }
      });
    }
    if (!response.ok) {
      return err$1({
        code: "asset-fetch-failed",
        expected: "HTTP 200 for the current Pack URL",
        hint: "verify the package locator and republish the Pack",
        detail: { guid: packageUrl, packageUrl }
      });
    }
    let value;
    try {
      value = await response.json();
    } catch {
      return invalid(packageUrl, "invalid JSON");
    }
    return this.verify(value, expected);
  }
  key(packageUrl, tuple) {
    return `${packageUrl}\0${tuple.scopeId}\0${tuple.generation}\0${tuple.digest}\0${tuple.outputSetDigest}`;
  }
  verify(value, expected) {
    if (value === null || typeof value !== "object") return invalid("", "Pack is not an object");
    const pack = value;
    if (pack.schemaVersion !== "2.0.0" || pack.kind !== "internal-text-package") {
      return invalid("", "schemaVersion or kind");
    }
    if (typeof pack.scopeId !== "string" || !Number.isSafeInteger(pack.generation) || typeof pack.digest !== "string" || typeof pack.outputSetDigest !== "string" || !sameTuple(pack, expected)) {
      return invalid("", "publication tuple mismatch");
    }
    if (!Array.isArray(pack.assets)) return invalid("", "assets");
    const guids = /* @__PURE__ */ new Set();
    for (const raw of pack.assets) {
      const asset = raw;
      const guid = typeof asset.guid === "string" ? asset.guid : "";
      if (guid.length === 0 || guids.has(guid.toLowerCase()))
        return invalid(guid, "duplicate guid");
      guids.add(guid.toLowerCase());
      if (typeof asset.kind !== "string" || asset.payload === void 0 || !Array.isArray(asset.refs) || asset.refs.some((ref) => typeof ref !== "string") || asset.artifacts === null || typeof asset.artifacts !== "object") {
        return invalid(guid, "asset envelope fields");
      }
      for (const [artifactKey, descriptor] of Object.entries(asset.artifacts)) {
        if (!this.validArtifact(guid, artifactKey, descriptor)) {
          return invalid(guid, `artifact ${artifactKey}`);
        }
      }
    }
    return ok(frozen(pack));
  }
  validArtifact(_guid, key2, value) {
    if (value === null || typeof value !== "object") return false;
    const descriptor = value;
    const integrity = descriptor.integrity;
    return key2.length > 0 && typeof descriptor.path === "string" && descriptor.path.length > 0 && typeof descriptor.mediaType === "string" && descriptor.mediaType.length > 0 && (descriptor.contentEncoding === "identity" || descriptor.contentEncoding === "zstd") && Number.isSafeInteger(descriptor.byteLength) && Number(descriptor.byteLength) >= 0 && integrity !== null && typeof integrity === "object" && integrity.algorithm === "sha256" && typeof integrity.digest === "string" && /^sha256:[0-9a-f]{64}$/i.test(String(integrity.digest));
  }
  cancelled(guid) {
    return {
      code: "asset-load-cancelled",
      expected: "the request AbortSignal to remain live while reading the Pack",
      hint: "retry with a live AbortSignal when the request is still needed",
      detail: { guid }
    };
  }
};

// src/internal/load-asset.ts
var REGISTRY_RESOLVER = /* @__PURE__ */ Symbol.for("forgeax.assets-runtime.registry-resolver");
function getAssetRegistryResolver(registry) {
  const resolver = registry[REGISTRY_RESOLVER];
  if (resolver === void 0) {
    throw new TypeError("AssetRegistry resolver is not owned by this asset runtime");
  }
  return resolver;
}
function missing(guid) {
  return {
    code: "asset-not-found",
    expected: `the current Catalog to contain GUID "${guid}"`,
    hint: "inspect the producer Catalog and rebuild the missing publication",
    detail: { guid }
  };
}
function mismatch(guid, expectedKind, actualKind) {
  return {
    code: "asset-kind-mismatch",
    expected: `Catalog kind "${actualKind}" to match "${expectedKind}"`,
    hint: "pass the Catalog kind or the matching custom AssetKind token",
    detail: { guid, expectedKind, actualKind }
  };
}
function artifactError(guid, reason) {
  return {
    code: "asset-integrity-failed",
    expected: "the verified artifact byte length and digest",
    hint: "verify the artifact digest and recook the Pack",
    detail: {
      guid,
      artifactKey: reason,
      expectedDigest: "descriptor integrity",
      actualDigest: reason
    }
  };
}
var ASSET_GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function invalidGuid(guid) {
  return {
    code: "asset-guid-invalid",
    expected: "a 36-character dash-form asset GUID",
    hint: "pass the producer GUID from the current Catalog row",
    detail: { guid }
  };
}
function createAssetRegistry(options) {
  const session = new CatalogSession(options.catalog, options);
  const reader = new PackReader(options.fetcher === void 0 ? {} : { fetcher: options.fetcher });
  const cache = new ArtifactCache();
  const decoders = new DecoderRegistry(
    options.scopeId === void 0 ? {} : { scopeId: options.scopeId }
  );
  const graph = new AssetGraph({
    ...options.maxConcurrentReads === void 0 ? {} : { maxConcurrentReads: options.maxConcurrentReads },
    read: async (guid, signal) => {
      const row = session.current(guid);
      if (row === void 0) return err$1(missing(guid));
      const validated = validateRuntimeRow(row);
      if (!validated.ok) return validated;
      const publication = validated.value.publication;
      const tuple = {
        scopeId: session.snapshot().scopeId,
        generation: publication.generation,
        digest: publication.digest,
        outputSetDigest: publication.outputSetDigest
      };
      const pack = await reader.read(row.packageUrl, tuple, signal);
      if (!pack.ok) return pack;
      const envelope = pack.value.assets.find(
        (asset) => asset.guid.toLowerCase() === guid.toLowerCase()
      );
      if (envelope === void 0) return err$1(missing(guid));
      const artifacts = {
        read: (descriptor) => {
          const integrity = descriptor.integrity;
          if (integrity === void 0)
            return Promise.resolve(err$1(artifactError(guid, descriptor.path)));
          const key2 = `${tuple.scopeId}:${tuple.generation}:${tuple.outputSetDigest}:${integrity.digest}`;
          return cache.read(key2, async () => {
            const url = resolveArtifactUrl(row.packageUrl, descriptor.path);
            let response;
            try {
              response = await (options.fetcher ?? globalThis.fetch)(url, { signal });
            } catch {
              return err$1(artifactError(guid, descriptor.path));
            }
            if (!response.ok) return err$1(artifactError(guid, descriptor.path));
            const bytes = new Uint8Array(await response.arrayBuffer());
            if (descriptor.byteLength === void 0 || bytes.byteLength !== descriptor.byteLength) {
              return err$1(artifactError(guid, descriptor.path));
            }
            const actualDigest = await sha2562(bytes);
            if (actualDigest !== descriptor.integrity?.digest.toLowerCase()) {
              return err$1(artifactError(guid, `${descriptor.path}:${actualDigest}`));
            }
            return ok(bytes);
          });
        }
      };
      const input = { envelope, artifacts, signal };
      const decoded = await decoders.loadByKind(envelope.kind, input);
      if (!decoded.ok) return decoded;
      return ok({ value: freezeRuntimePayload(decoded.value), refs: envelope.refs });
    }
  });
  let catalogEpoch = session.snapshot().epoch;
  const unsubscribeCatalog = session.subscribe((snapshot) => {
    if (snapshot.epoch === catalogEpoch) return;
    catalogEpoch = snapshot.epoch;
    graph.invalidateForCatalogChange(
      snapshot.stale ? void 0 : [...snapshot.changed, ...snapshot.removed]
    );
  });
  const registry = {
    installDecoder: (kind, decoder) => decoders.install(kind, decoder),
    load: (async (guid, kind, loadOptions = {}) => {
      if (!ASSET_GUID_PATTERN.test(guid)) return err$1(invalidGuid(guid));
      const expectedKind = typeof kind === "string" ? kind : kind.kind;
      const started = await session.start();
      if (!started.ok) return err$1(started.error);
      if (session.snapshot().stale) {
        const reconciled = await session.reconcile();
        if (!reconciled.ok) return err$1(reconciled.error);
        const discontinuity = session.discontinuity();
        if (discontinuity !== void 0) return err$1(discontinuity);
      }
      const row = session.current(guid);
      if (row === void 0) return err$1(missing(guid));
      if (row.kind !== expectedKind) return err$1(mismatch(guid, expectedKind, row.kind));
      const result = await graph.load(guid, loadOptions.signal);
      return result.ok ? ok(result.value.value) : result;
    }),
    snapshot: () => graph.snapshot(),
    subscribe: (listener) => graph.subscribe(listener),
    dispose: () => {
      graph.dispose();
      unsubscribeCatalog();
      decoders.dispose();
      cache.clear();
      session.dispose();
    }
  };
  const resolver = {
    get epoch() {
      return graph.snapshot().epoch;
    },
    lookup: (guid) => graph.lookup(guid),
    guidOf: (asset) => graph.guidOf(asset)
  };
  Object.defineProperty(registry, REGISTRY_RESOLVER, {
    value: resolver,
    enumerable: false
  });
  return registry;
}
async function sha2562(bytes) {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return `sha256:${Array.from(
    new Uint8Array(digest),
    (byte) => byte.toString(16).padStart(2, "0")
  ).join("")}`;
}
function resolveArtifactUrl(packageUrl, path) {
  const separator = packageUrl.lastIndexOf("/");
  const packageDirectory = separator < 0 ? "" : packageUrl.slice(0, separator + 1);
  try {
    return new URL(path, packageDirectory).toString();
  } catch {
    return `${packageDirectory}${path.replace(/^\//, "")}`;
  }
}
function sameVector(left, right) {
  const names = /* @__PURE__ */ new Set([...Object.keys(left.dependencies), ...Object.keys(right.dependencies)]);
  return [...names].every((name) => left.dependencies[name] === right.dependencies[name]);
}
var MaterialGenerationCache = class {
  #resolved = /* @__PURE__ */ new Map();
  #resolvedByMaterial = /* @__PURE__ */ new Map();
  #resolvedKeys = /* @__PURE__ */ new Map();
  #artifacts = /* @__PURE__ */ new Map();
  #generations = /* @__PURE__ */ new Map();
  #errors = /* @__PURE__ */ new Map();
  #materialDependencies = /* @__PURE__ */ new Map();
  #dependents = /* @__PURE__ */ new Map();
  resolve(materialGuid, specializationKey, load, publicationGeneration = 0) {
    const cacheKey = `${materialGuid}:${specializationKey}:${publicationGeneration}`;
    const previous = this.#resolved.get(cacheKey);
    if (previous !== void 0) return previous;
    const promise = load();
    this.#resolved.set(cacheKey, promise);
    const resolvedKeys = this.#resolvedByMaterial.get(materialGuid) ?? /* @__PURE__ */ new Set();
    resolvedKeys.add(cacheKey);
    this.#resolvedByMaterial.set(materialGuid, resolvedKeys);
    void promise.then(
      (value) => {
        if (isStaleGenerationResult(value)) this.removeResolved(materialGuid, cacheKey, promise);
      },
      () => this.removeResolved(materialGuid, cacheKey, promise)
    );
    return promise;
  }
  linkResolved(materialGuid, specializationKey) {
    this.#resolvedKeys.set(materialGuid, specializationKey);
  }
  getResolvedKey(materialGuid) {
    return this.#resolvedKeys.get(materialGuid);
  }
  storeArtifact(key2, artifact) {
    this.#artifacts.set(key2, artifact);
  }
  getArtifact(key2) {
    return this.#artifacts.get(key2);
  }
  bump(dependency) {
    const generation = (this.#generations.get(dependency) ?? 0) + 1;
    this.#generations.set(dependency, generation);
    for (const materialGuid of this.#dependents.get(dependency) ?? []) {
      for (const cacheKey of this.#resolvedByMaterial.get(materialGuid) ?? []) {
        this.#resolved.delete(cacheKey);
      }
      this.#resolvedByMaterial.delete(materialGuid);
    }
    return generation;
  }
  generationError(materialGuid) {
    return this.#errors.get(materialGuid);
  }
  async loadWithGeneration(materialGuid, dependencies, load) {
    const dependencySet = Object.freeze([...dependencies]);
    this.trackDependencies(materialGuid, dependencySet);
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const generation = this.vector(dependencySet);
      const loaded = await load(generation);
      const observed = snapshotVector(loaded.generation);
      const current2 = this.vector(dependencySet);
      if (sameVector(observed, current2)) {
        this.#errors.delete(materialGuid);
        return ok(loaded.value);
      }
      if (attempt === 1) {
        const error = staleGenerationError(materialGuid, dependencySet, observed, current2);
        this.#errors.set(materialGuid, error);
        return err$1(error);
      }
    }
    const current = this.vector(dependencySet);
    return err$1(staleGenerationError(materialGuid, dependencySet, current, current));
  }
  trackDependencies(materialGuid, dependencies) {
    const previous = this.#materialDependencies.get(materialGuid);
    if (previous !== void 0) {
      for (const dependency of previous) this.#dependents.get(dependency)?.delete(materialGuid);
    }
    this.#materialDependencies.set(materialGuid, dependencies);
    for (const dependency of dependencies) {
      const dependents = this.#dependents.get(dependency) ?? /* @__PURE__ */ new Set();
      dependents.add(materialGuid);
      this.#dependents.set(dependency, dependents);
    }
  }
  removeResolved(materialGuid, cacheKey, promise) {
    if (this.#resolved.get(cacheKey) !== promise) return;
    this.#resolved.delete(cacheKey);
    const resolvedKeys = this.#resolvedByMaterial.get(materialGuid);
    if (resolvedKeys === void 0) return;
    resolvedKeys.delete(cacheKey);
    if (resolvedKeys.size === 0) this.#resolvedByMaterial.delete(materialGuid);
  }
  vector(dependencies) {
    return snapshotVector({
      dependencies: Object.fromEntries(
        dependencies.map((dependency) => [dependency, this.#generations.get(dependency) ?? 0])
      )
    });
  }
};
function snapshotVector(vector) {
  return Object.freeze({ dependencies: Object.freeze({ ...vector.dependencies }) });
}
function staleGenerationError(material, dependencies, observed, current) {
  const detail = Object.freeze({
    code: "material-specialization-stale-generation",
    material,
    dependencies,
    observed,
    current
  });
  return Object.freeze(createMaterialError("material-specialization-stale-generation", detail));
}
function isStaleGenerationResult(value) {
  if (value === null || typeof value !== "object") return false;
  const result = value;
  if (result.ok !== false || result.error === null || typeof result.error !== "object")
    return false;
  return result.error.code === "material-specialization-stale-generation";
}
function inspectReady(ready) {
  const standard = isStandardMaterialRecord(ready.record);
  const standardInfo = !standard ? void 0 : (() => {
    const layerPlan = deriveStandardLayerPlan(
      ready.record.resolved.parameters,
      ready.record.resolved.passes
    );
    return Object.freeze({
      mode: layerPlan.mode,
      layers: layerPlan.layers,
      passFamily: layerPlan.passFamily,
      layerPlanIdentity: layerPlan.identity,
      passNames: Object.freeze(ready.record.resolved.passes.map((pass) => pass.name))
    });
  })();
  return {
    materialGuid: ready.materialGuid,
    readiness: "ready",
    publicationGeneration: ready.publicationGeneration,
    specializationKey: ready.specializationKey,
    artifactDigest: ready.artifactDigest,
    layoutIdentity: ready.record.receipt.identity.layoutIdentity,
    dependencies: [
      ...ready.record.refs.parent,
      ...ready.record.refs.textures,
      ...ready.record.refs.samplers,
      ...ready.record.refs.modules
    ],
    profile: ready.record.receipt.profile,
    sourceClosure: ready.sourceClosure,
    parameterContract: ready.parameterContract,
    refs: ready.record.refs,
    ...ready.record.resolved.surface === void 0 ? {} : { surface: ready.record.resolved.surface },
    receipt: ready.record.receipt,
    ...standardInfo === void 0 ? {} : { standard: standardInfo },
    status: "Ready"
  };
}
function inspectMaterialRuntime(input) {
  if (input.status === "Ready") return inspectReady(input);
  if (input.status === "Error") {
    return {
      materialGuid: input.error.detail.guid,
      readiness: "failed",
      specializationKey: input.error.detail.specializationKey,
      publicationGeneration: input.error.detail.publicationGeneration,
      preparationFailure: { ...input.error },
      status: "Error"
    };
  }
  if (input.status === "Pending") {
    return {
      materialGuid: input.guid,
      readiness: "pending",
      specializationKey: input.specializationKey,
      reason: input.reason,
      status: "Pending"
    };
  }
  const lastKnownGood = inspectReady(input.ready);
  return {
    materialGuid: input.ready.materialGuid,
    readiness: "last-known-good",
    specializationKey: input.ready.specializationKey,
    lastKnownGood,
    preparationFailure: { ...input.failure.error },
    status: "LastKnownGood"
  };
}
var deviceCache = /* @__PURE__ */ new WeakMap();
var MIPMAP_WGSL = `
struct VsOut {
  @builtin(position) clip : vec4<f32>,
  @location(0)       uv   : vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vid : u32) -> VsOut {
  // 3 vertices forming an oversized triangle: (-1,-1), (-1,3), (3,-1)
  var positions = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(-1.0,  3.0),
    vec2<f32>( 3.0, -1.0),
  );
  let pos = positions[vid];
  var out : VsOut;
  out.clip = vec4<f32>(pos, 0.0, 1.0);
  // NDC -> UV with Y-flip fused into a single MAD.
  out.uv = pos * vec2<f32>(0.5, -0.5) + vec2<f32>(0.5);
  return out;
}

@group(0) @binding(0) var src_sampler : sampler;
@group(0) @binding(1) var src_texture : texture_2d<f32>;

@fragment
fn fs_main(in : VsOut) -> @location(0) vec4<f32> {
  return textureSample(src_texture, src_sampler, in.uv);
}
`;
function numMipLevels(size) {
  const max = Math.max(size.width, size.height);
  if (max <= 1) return 1;
  return Math.floor(Math.log2(max)) + 1;
}
function mipmapCacheSize(device) {
  const cache = deviceCache.get(device);
  return cache?.pipelines.size ?? 0;
}
async function getOrCreateMipmapPipeline(device, format, asyncCreateShaderModule) {
  const cache = await ensureDeviceCache(device, asyncCreateShaderModule);
  if (!cache.ok) return cache;
  const existing = cache.value.pipelines.get(format);
  if (existing !== void 0) {
    return ok$1(existing);
  }
  const layoutRes = device.createPipelineLayout({
    label: "mipmap-pl",
    bindGroupLayouts: [cache.value.layout]
  });
  if (!layoutRes.ok) return layoutRes;
  const pipelineRes = device.createRenderPipeline({
    label: `mipmap-pipeline-${format}`,
    layout: layoutRes.value,
    vertex: { module: cache.value.module, entryPoint: "vs_main" },
    fragment: {
      module: cache.value.module,
      entryPoint: "fs_main",
      targets: [{ format }]
    },
    primitive: { topology: "triangle-list" }
  });
  if (!pipelineRes.ok) return pipelineRes;
  cache.value.pipelines.set(format, pipelineRes.value);
  return pipelineRes;
}
async function ensureDeviceCache(device, asyncCreateShaderModule) {
  const existing = deviceCache.get(device);
  if (existing !== void 0) return ok$1(existing);
  const moduleRes = await asyncCreateShaderModule(device, {
    code: MIPMAP_WGSL,
    label: "mipmap-wgsl"
  });
  if (!moduleRes.ok) return moduleRes;
  const samplerRes = device.createSampler({
    magFilter: "linear",
    minFilter: "linear",
    mipmapFilter: "linear"
  });
  if (!samplerRes.ok) return samplerRes;
  const FRAGMENT_STAGE = 2;
  const layoutRes = device.createBindGroupLayout({
    label: "mipmap-bgl",
    entries: [
      { binding: 0, visibility: FRAGMENT_STAGE, sampler: { type: "filtering" } },
      {
        binding: 1,
        visibility: FRAGMENT_STAGE,
        texture: { sampleType: "float", viewDimension: "2d" }
      }
    ]
  });
  if (!layoutRes.ok) return layoutRes;
  const cache = {
    sampler: samplerRes.value,
    module: moduleRes.value,
    layout: layoutRes.value,
    pipelines: /* @__PURE__ */ new Map()
  };
  deviceCache.set(device, cache);
  return ok$1(cache);
}
function encodeMipmapBlit(device, encoder, texture, levels, pipeline, cache) {
  for (let i = 1; i < levels; i++) {
    const srcViewRes = device.createTextureView(texture, {
      baseMipLevel: i - 1,
      mipLevelCount: 1,
      dimension: "2d"
    });
    if (!srcViewRes.ok) return srcViewRes;
    const dstViewRes = device.createTextureView(texture, {
      baseMipLevel: i,
      mipLevelCount: 1,
      dimension: "2d"
    });
    if (!dstViewRes.ok) return dstViewRes;
    const bindGroupRes = device.createBindGroup({
      label: `mipmap-bg-${i}`,
      layout: cache.layout,
      entries: [
        { binding: 0, resource: { kind: "sampler", value: cache.sampler } },
        { binding: 1, resource: { kind: "textureView", value: srcViewRes.value } }
      ]
    });
    if (!bindGroupRes.ok) return bindGroupRes;
    const pass = encoder.beginRenderPass({
      label: `mipmap-pass-${i}`,
      colorAttachments: [
        {
          view: dstViewRes.value,
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store"
        }
      ]
    });
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroupRes.value);
    pass.draw(3, 1, 0, 0);
    pass.end();
  }
  return ok$1(void 0);
}
function prepareMipmaps(device, texture, descriptor) {
  const levels = descriptor.levels ?? numMipLevels(descriptor);
  if (levels <= 1) return ok$1({ finish: () => ok$1(void 0), discard: () => void 0 });
  const cache = deviceCache.get(device);
  if (cache === void 0) {
    return err(
      new RhiError({
        code: "rhi-not-available",
        expected: "mipmap pipeline cache prewarmed for this device before prepareMipmaps",
        hint: "call prewarmMipmapPipeline(device, formats) before preparing recovery mip work"
      })
    );
  }
  const pipeline = cache.pipelines.get(descriptor.format);
  if (pipeline === void 0) {
    return err(
      new RhiError({
        code: "rhi-not-available",
        expected: `mipmap pipeline for format ${descriptor.format} prewarmed`,
        hint: `format ${descriptor.format} was not prewarmed; add it to the prewarmMipmapPipeline format list`
      })
    );
  }
  const encoderRes = device.createCommandEncoder({ label: "mipmap-recovery-setup-encoder" });
  if (!encoderRes.ok) return encoderRes;
  const encoded = encodeMipmapBlit(device, encoderRes.value, texture, levels, pipeline, cache);
  if (!encoded.ok) {
    try {
      encoderRes.value.finish();
    } catch {
    }
    return encoded;
  }
  let closed = false;
  return ok$1({
    finish: () => {
      if (closed) {
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "mipmap recovery setup work is finished at most once",
            hint: "discard the candidate transaction after finish and do not reuse its encoder"
          })
        );
      }
      closed = true;
      return encoderRes.value.finish();
    },
    discard: () => {
      if (closed) return;
      closed = true;
      try {
        encoderRes.value.finish();
      } catch {
      }
    }
  });
}
function blitMipmapsSync(device, texture, descriptor) {
  const levels = descriptor.levels ?? numMipLevels(descriptor);
  if (levels <= 1) return ok$1(void 0);
  const prepared = prepareMipmaps(device, texture, descriptor);
  if (!prepared.ok) return prepared;
  const finished = prepared.value.finish();
  if (!finished.ok) return finished;
  return finished.value === void 0 ? ok$1(void 0) : device.queue.submit([finished.value]);
}
function encodeMipmapLevel(device, pass, sourceView, format) {
  const cache = deviceCache.get(device);
  if (cache === void 0) {
    return err(
      new RhiError({
        code: "rhi-not-available",
        expected: "mipmap pipeline cache prewarmed for the graph device before encoding",
        hint: "call prewarmMipmapPipeline(device, formats) at renderer.ready"
      })
    );
  }
  const pipeline = cache.pipelines.get(format);
  if (pipeline === void 0) {
    return err(
      new RhiError({
        code: "rhi-not-available",
        expected: `mipmap pipeline for format ${format} prewarmed`,
        hint: `format ${format} was not prewarmed; add it to the renderer prewarm list`
      })
    );
  }
  const bindGroup = device.createBindGroup({
    label: "mipmap-graph-bind-group",
    layout: cache.layout,
    entries: [
      { binding: 0, resource: { kind: "sampler", value: cache.sampler } },
      { binding: 1, resource: { kind: "textureView", value: sourceView } }
    ]
  });
  if (!bindGroup.ok) return bindGroup;
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup.value);
  pass.draw(3, 1, 0, 0);
  return ok$1(void 0);
}

// src/plugin.ts
function assetsPlugin(assets) {
  return {
    name: "assets",
    provide: "assets",
    apply(ctx) {
      ctx.provide("assets", assets);
    }
  };
}
function assetLoaderPlugin(loader) {
  return {
    name: `asset-loader:${loader.kind}`,
    inject: ["assets"],
    apply(ctx) {
      const assets = ctx.assets;
      if (assets === void 0) throw new Error("asset loader plugin requires the assets service");
      ctx.effect(() => assets.loaders.register(loader), `assets/loader:${loader.kind}`);
    }
  };
}
function packLoaderPlugin(loader) {
  return {
    name: `pack-loader:${loader.kind}`,
    inject: ["assets"],
    apply(ctx) {
      const assets = ctx.assets;
      if (assets === void 0) throw new Error("pack loader plugin requires the assets service");
      ctx.effect(() => assets.loaders.registerPackLoader(loader), `assets/pack:${loader.kind}`);
    }
  };
}
function resolveTilesetRuntime(world, guid, lookup) {
  if (guid.length === 0) {
    return err$1({
      code: "tileset-atlas-not-found",
      expected: "a non-empty durable atlas GUID",
      hint: "load the atlas payload before extracting the tilemap",
      detail: { guid }
    });
  }
  const payload = lookup(guid);
  if (payload === void 0) {
    return err$1({
      code: "tileset-atlas-not-found",
      expected: `a loaded texture payload for atlas GUID ${guid}`,
      hint: "load or retain the atlas before extracting the tilemap",
      detail: { guid }
    });
  }
  if ("code" in payload) {
    return err$1({
      code: "tileset-atlas-stale",
      expected: `a current texture payload for atlas GUID ${guid}`,
      hint: "rebuild the stale atlas projection before extracting the tilemap",
      detail: { guid }
    });
  }
  if (payload.kind !== "texture") {
    return err$1({
      code: "tileset-atlas-kind-mismatch",
      expected: "a texture atlas payload",
      hint: `replace atlas GUID ${guid} with a texture asset`,
      detail: { guid, actualKind: payload.kind }
    });
  }
  return ok({
    guid,
    payload,
    handle: world.internSharedRef("TextureAsset", payload)
  });
}

export { AssetRegistry, BUILTIN_CUBE, BUILTIN_CYLINDER, BUILTIN_NINESLICE_QUAD, BUILTIN_QUAD, BUILTIN_SPHERE, BUILTIN_TRIANGLE, BuiltinAssetRegistry, CatalogReplica, DynamicTextureStore, HANDLE_CUBE, HANDLE_CYLINDER, HANDLE_NINESLICE_QUAD, HANDLE_QUAD, HANDLE_SPHERE, HANDLE_TRIANGLE, INLINE_PACK_LOADERS, LoaderRegistry, MaterialGenerationCache, MaterialResolvedEmptyPassesError, MeshBinAssetError, MeshSsboCapacityExceededError, MeshSsboCeilingReachedError, PACK_ARTIFACT_LOADERS, RuntimeMaterialValue, RuntimeMeshVertices, SCENE_PUBLICATION_FENCE_SCHEMA, SCENE_PUBLICATION_RECOVERY_ACTIONS, SceneCollectAssetGuidUnresolvedError, SceneCollectEntityRefOutOfClosureError, adaptDynamicTextureDevice, animationClipLoader, animationGraphLoader, assetLoaderPlugin, assetsPlugin, audioLoader, blitMipmapsSync, buildSceneChildContext, builtinMeshGuid, compareScenePublicationFences, createAssetRegistry, createCatalogSource, createDefaultLoaderRegistry, createMaterialLoader, createRuntimeAssetEvidenceAdapter, createScenePublicationFence, decodeImageBytes, defineAssetKind, encodeMipmapLevel, equirectLoader, fontLoader, getAssetRegistryResolver, getOrCreateMipmapPipeline, inspectMaterialRuntime, installMaterialReadyShaders, loadMaterialReadyByGuid, materialLoader, materialParametersToParamSchema, meshLoader, mipmapCacheSize, numMipLevels, observeScenePublication, packLoaderPlugin, parseScenePayload, parseScenePublicationFence, particleEffectLoader, prepareMipmaps, projectMaterialRecord, renderPipelineLoader as renderPipelineArtifactLoader, renderPipelineLoader, resolveAssetHandle, resolveTilesetRuntime, runtimeMaterialShaderId, sceneLoader, scenePublicationFenceFromCatalog, scenePublicationFenceFromRegistry, selectMaterialPassProgram, skeletonLoader, skinLoader, textureLoader, tilesetLoader as tilesetArtifactLoader, tilesetLoader, unpackMeshBinV4, validateTilesetPayload, walkMaterialPassesOverSharedRefs, wireDefaultLoaders };
