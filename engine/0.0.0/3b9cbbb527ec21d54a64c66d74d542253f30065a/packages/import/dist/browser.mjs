import { err, ok, validateSourceOverrideMap, ImportError, IMPORT_ERROR_HINTS, canonicalizeSourceOverrides } from '../../types/dist/index.mjs';
export { IMPORT_ERROR_HINTS, ImportError } from '../../types/dist/index.mjs';
import { deriveVertexLayoutProjection } from '../../geometry/dist/index.mjs';
import { AssetGuid } from '../../pack/dist/guid.mjs';
import { MESH_BIN_HEADER_V4_BYTES, writeMeshBinHeader } from '../../pack/dist/mesh-bin-contract.mjs';

// src/browser.ts
function invalidProduct(field) {
  return err({
    code: "import-product-invalid",
    expected: "a complete terminal import product with source identity",
    hint: "preserve refs, artifacts, receipts, diagnostics, and source revision at the product boundary",
    detail: { field }
  });
}
function createImportProduct(input) {
  if (!Array.isArray(input.assets)) return invalidProduct("assets");
  if (!Array.isArray(input.sourceDependencies)) return invalidProduct("sourceDependencies");
  if (input.sourceRevision.trim().length === 0) return invalidProduct("sourceRevision");
  if (!Array.isArray(input.refs)) return invalidProduct("refs");
  if (input.artifacts === null || typeof input.artifacts !== "object") {
    return invalidProduct("artifacts");
  }
  if (!Array.isArray(input.receipts)) return invalidProduct("receipts");
  if (!Array.isArray(input.diagnostics)) return invalidProduct("diagnostics");
  return ok({ ...input });
}
async function sha256Hex(bytes) {
  const subtle = globalThis.crypto?.subtle;
  if (subtle === void 0) throw new Error("Web Crypto API is required for importer digests");
  const owned = new Uint8Array(bytes.byteLength);
  owned.set(bytes);
  const digest = await subtle.digest("SHA-256", owned.buffer);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function artifactDigest(bytes) {
  return `sha256:${await sha256Hex(bytes)}`;
}
function concatBytes(chunks) {
  const encoder = new TextEncoder();
  const encoded = chunks.map(
    (chunk) => typeof chunk === "string" ? encoder.encode(chunk) : chunk
  );
  const totalLength = encoded.reduce((total, chunk) => total + chunk.byteLength, 0);
  const bytes = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of encoded) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}
async function productDigest(asset, artifacts) {
  const chunks = [
    JSON.stringify(projectImportedAssetPayload(asset)),
    JSON.stringify(asset.refs.map((ref) => ref.guid)),
    JSON.stringify(artifacts)
  ];
  for (const [key, artifact] of Object.entries(asset.artifacts).sort(
    ([left], [right]) => left.localeCompare(right)
  )) {
    chunks.push(key, artifact.bytes);
  }
  return `sha256:${await sha256Hex(concatBytes(chunks))}`;
}
async function artifactDescriptors(artifacts) {
  const entries = [];
  for (const [path, artifact] of Object.entries(artifacts)) {
    entries.push([
      path,
      {
        path,
        mediaType: artifact.mediaType,
        byteLength: artifact.bytes.byteLength,
        integrity: { algorithm: "sha256", digest: await artifactDigest(artifact.bytes) },
        ...artifact.assetCodec === void 0 ? {} : { assetCodec: artifact.assetCodec }
      }
    ]);
  }
  return Object.fromEntries(entries);
}
function projectImportedAssetPayload(asset) {
  const payload = asset.payload;
  if (Object.keys(asset.artifacts).length === 0) return payload;
  if (asset.kind === "mesh") return { kind: "mesh" };
  if (asset.kind === "texture" || asset.kind === "equirect") {
    const { data: _runtimeBytes, ...metadata } = payload;
    return metadata;
  }
  return payload;
}
function finalizeImportProducts(product, inputFingerprint) {
  return (async () => {
    const products = [];
    for (const asset of product.assets) {
      const artifacts = await artifactDescriptors(asset.artifacts);
      const digest = await productDigest(asset, artifacts);
      products.push({
        guid: asset.guid,
        payload: asset.payload,
        refs: asset.refs.map((ref) => ref.guid),
        artifacts,
        digest,
        receipt: {
          guid: asset.guid,
          origin: "sourceMeta",
          status: "succeeded",
          inputFingerprint,
          outputDigest: digest
        }
      });
    }
    return products;
  })();
}
function deriveDefaultLodScreenCoverages(levelCount) {
  if (!Number.isInteger(levelCount) || levelCount < 1 || levelCount > 8) {
    throw new RangeError("levelCount must be an integer in [1, 8]");
  }
  return Array.from(
    { length: levelCount - 1 },
    (_, index) => Math.round(0.5 * 0.4 ** index * 1e6) / 1e6
  );
}
function validateMeshLodContract(input) {
  if (input.lods.length > 7) {
    return err({
      code: "mesh-lod-contract-invalid",
      reason: "at most seven lower-detail levels are supported"
    });
  }
  if (input.lodHysteresis !== void 0 && (!Number.isFinite(input.lodHysteresis) || input.lodHysteresis < 0 || input.lodHysteresis >= 1)) {
    return err({
      code: "mesh-lod-contract-invalid",
      reason: "lodHysteresis must be finite and in [0, 1)"
    });
  }
  if (input.generation !== void 0 && (!Number.isSafeInteger(input.generation) || input.generation < 0)) {
    return err({
      code: "mesh-lod-contract-invalid",
      reason: "generation must be a non-negative safe integer"
    });
  }
  const guids = /* @__PURE__ */ new Set();
  let previous = 1;
  for (const level of input.lods) {
    if (level.meshGuid.trim() === "" || guids.has(level.meshGuid)) {
      return err({
        code: "mesh-lod-contract-invalid",
        reason: "LOD mesh GUIDs must be unique and non-empty"
      });
    }
    if (!Number.isFinite(level.screenCoverage) || level.screenCoverage <= 0 || level.screenCoverage > 1) {
      return err({
        code: "mesh-lod-contract-invalid",
        reason: "screenCoverage must be finite and in (0, 1]"
      });
    }
    if (level.screenCoverage >= previous) {
      return err({
        code: "mesh-lod-contract-invalid",
        reason: "screenCoverage must strictly decrease by level"
      });
    }
    guids.add(level.meshGuid);
    previous = level.screenCoverage;
  }
  if (input.refs !== void 0) {
    const refs = new Set(input.refs);
    for (const level of input.lods) {
      if (!refs.has(level.meshGuid)) {
        return err({
          code: "mesh-lod-contract-invalid",
          reason: "every lower-detail mesh GUID must be enclosed by root refs"
        });
      }
    }
  }
  if (input.rootMeshGuid !== void 0 && input.refs !== void 0 && !input.refs.includes(input.rootMeshGuid)) {
    return err({
      code: "mesh-lod-contract-invalid",
      reason: "root mesh GUID must be included in refs"
    });
  }
  if (input.rootBounds !== void 0) {
    if (!validBounds(input.rootBounds)) {
      return err({
        code: "mesh-lod-contract-invalid",
        reason: "root bounds must be finite and ordered"
      });
    }
    for (const bounds of input.lodBounds ?? []) {
      if (!validBounds(bounds) || !encloses(input.rootBounds, bounds)) {
        return err({
          code: "mesh-lod-contract-invalid",
          reason: "root bounds must enclose every lower-detail bounds"
        });
      }
    }
  }
  if (input.lodBounds !== void 0 && input.lodBounds.length !== input.lods.length) {
    return err({
      code: "mesh-lod-contract-invalid",
      reason: "lod bounds must cover every lower level"
    });
  }
  if (input.rootMaterialSlots !== void 0 || input.lodMaterialSlots !== void 0) {
    const rootSlots = input.rootMaterialSlots ?? [];
    const lowerSlots = input.lodMaterialSlots ?? [];
    if (lowerSlots.length !== input.lods.length || lowerSlots.some((slots) => !sameSlots(rootSlots, slots))) {
      return err({
        code: "mesh-lod-contract-invalid",
        reason: "lower-detail material slots must preserve root sourceKey order"
      });
    }
  }
  if (input.relations !== void 0 && hasCycle(input.relations)) {
    return err({ code: "mesh-lod-contract-invalid", reason: "LOD relations must be acyclic" });
  }
  return ok({ lods: input.lods });
}
function validBounds(bounds) {
  const [minX, minY, minZ] = bounds.min;
  const [maxX, maxY, maxZ] = bounds.max;
  return [minX, minY, minZ, maxX, maxY, maxZ].every(Number.isFinite) && minX <= maxX && minY <= maxY && minZ <= maxZ;
}
function encloses(root, child) {
  return child.min[0] >= root.min[0] && child.min[1] >= root.min[1] && child.min[2] >= root.min[2] && child.max[0] <= root.max[0] && child.max[1] <= root.max[1] && child.max[2] <= root.max[2];
}
function sameSlots(root, child) {
  return root.length === child.length && root.every((slot, index) => slot.sourceKey === child[index]?.sourceKey);
}
function hasCycle(relations) {
  const edges = /* @__PURE__ */ new Map();
  for (const relation of relations)
    edges.set(relation.from, [...edges.get(relation.from) ?? [], relation.to]);
  const visiting = /* @__PURE__ */ new Set();
  const visited = /* @__PURE__ */ new Set();
  const visit = (node) => {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;
    visiting.add(node);
    for (const next of edges.get(node) ?? []) if (visit(next)) return true;
    visiting.delete(node);
    visited.add(node);
    return false;
  };
  return [...edges.keys()].some(visit);
}
function reconcileMeshLodMeta(previous, next) {
  const overlap = Math.min(previous.length, next.length);
  for (let index = 0; index < overlap; index++) {
    const oldEntry = previous[index];
    const nextEntry = next[index];
    if (oldEntry?.sourceKey !== nextEntry?.sourceKey) {
      return err({
        code: "mesh-lod-topology-change",
        reason: "existing LOD source keys must remain prefix-stable",
        previousIndices: [index],
        nextIndices: [index]
      });
    }
    if (oldEntry?.meshGuid !== nextEntry?.meshGuid) {
      return err({
        code: "mesh-lod-authority-conflict",
        reason: `sourceKey ${nextEntry?.sourceKey ?? "<missing>"} changed mesh GUID`
      });
    }
  }
  const defaults = deriveDefaultLodScreenCoverages(next.length + 1);
  const lods = next.map((entry, index) => ({
    ...entry,
    screenCoverage: previous[index]?.screenCoverage ?? entry.screenCoverage ?? defaults[index] ?? 0
  }));
  const valid = validateMeshLodContract({
    lods: lods.map(({ meshGuid, screenCoverage }) => ({ meshGuid, screenCoverage }))
  });
  if (!valid.ok) return valid;
  return ok({ lods });
}

// src/import-runner.ts
var SHADER_RESERVED_IMPORTER_KEY = "shader";
function isModuleLoadFailure(e) {
  if (!(e instanceof Error)) return false;
  const code = e.code;
  if (code === "MODULE_NOT_FOUND" || code === "ERR_MODULE_NOT_FOUND" || code === "ERR_DLOPEN_FAILED") {
    return true;
  }
  const msg = e.message;
  return msg.includes("Cannot find module") || msg.includes("native addon") || msg.includes(".node");
}
function declarationsSourceKey(declarations, guid) {
  return declarations.find((declaration) => declaration.guid === guid)?.sourceKey;
}
function normaliseForPack(value) {
  if (value === null || value === void 0) return value;
  if (value instanceof Float32Array || value instanceof Float64Array || value instanceof Uint8Array || value instanceof Uint16Array || value instanceof Uint32Array || value instanceof Int8Array || value instanceof Int16Array || value instanceof Int32Array) {
    return Array.from(value);
  }
  if (Array.isArray(value)) {
    return value.map(normaliseForPack);
  }
  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = normaliseForPack(v);
    }
    return out;
  }
  return value;
}
function declarationFields(declaration) {
  if (declaration === void 0) return {};
  return {
    sourceIndex: declaration.sourceIndex,
    ...declaration.sourceKey !== void 0 ? { sourceKey: declaration.sourceKey } : {},
    ...declaration.relations !== void 0 ? { relations: declaration.relations } : {}
  };
}
function joinSiblingPath(sourcePath, uri) {
  const slash = Math.max(sourcePath.lastIndexOf("/"), sourcePath.lastIndexOf("\\"));
  const dir = slash >= 0 ? sourcePath.slice(0, slash + 1) : "";
  return `${dir}${uri}`;
}
function normalizeDependencyPath(path) {
  const slash = path.replaceAll("\\", "/");
  const parts = [];
  for (const part of slash.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      parts.pop();
    } else {
      parts.push(part);
    }
  }
  return parts.join("/");
}
function dependencyIdentity(fs, sourcePath) {
  return normalizeDependencyPath(fs.sourceIdentityFor?.(sourcePath) ?? sourcePath);
}
function errResult(error) {
  return { ok: false, error };
}
function sourceKeyActual(value) {
  if (typeof value === "string") return JSON.stringify(value);
  if (value === void 0) return "missing";
  return typeof value;
}
function sourceReadFailureReason(error) {
  if (typeof error !== "object" || error === null) {
    return typeof error === "string" ? error : "unknown";
  }
  const metadata = error;
  const token = typeof metadata.code === "string" ? metadata.code : typeof metadata.name === "string" ? metadata.name : void 0;
  switch (token) {
    case "ENOENT":
    case "NotFoundError":
      return "not-found";
    case "EACCES":
    case "EPERM":
    case "PermissionDeniedError":
    case "NotAllowedError":
    case "SecurityError":
      return "permission-denied";
    case "EAGAIN":
    case "EBUSY":
    case "EINTR":
    case "ECONNABORTED":
    case "ECONNREFUSED":
    case "ECONNRESET":
    case "EHOSTUNREACH":
    case "ENETDOWN":
    case "ENETUNREACH":
    case "ETIMEDOUT":
    case "EPIPE":
    case "ABORT_ERR":
    case "AbortError":
    case "TimeoutError":
      return "transient";
    default:
      if (typeof metadata.detail === "object" && metadata.detail !== null) {
        const reason = metadata.detail.reason;
        if (typeof reason === "string" && reason.length > 0) return reason;
      }
      if (typeof metadata.message === "string" && metadata.message.length > 0) {
        return metadata.message;
      }
      return "unknown";
  }
}
function validateOutputSourceKeys(meta) {
  if (meta.subAssets.length <= 1) return void 0;
  const diagnostics = [];
  const seen = /* @__PURE__ */ new Map();
  for (const [index, declaration] of meta.subAssets.entries()) {
    const sourcePath = `${meta.source}#subAssets[${index}]`;
    const sourceRange = { start: 0, end: 0, line: 1, column: 1 };
    const sourceKey = declaration.sourceKey;
    if (typeof sourceKey !== "string" || sourceKey.trim().length === 0) {
      diagnostics.push({
        code: "source-key-required",
        severity: "error",
        sourcePath,
        sourceRange,
        rule: "import-output-source-key",
        expected: "a non-empty producer-owned sourceKey",
        actual: sourceKeyActual(sourceKey),
        hint: "publish a stable semantic sourceKey; sourceIndex is only a locator"
      });
      continue;
    }
    const prior = seen.get(sourceKey);
    if (prior !== void 0) {
      diagnostics.push({
        code: "duplicate-source-key",
        severity: "error",
        sourcePath,
        sourceRange,
        rule: "import-output-source-key-unique",
        expected: "sourceKey to be unique within one imported package",
        actual: `${JSON.stringify(sourceKey)} duplicates subAssets[${prior}]`,
        hint: "rename the duplicate semantic output before writing Meta"
      });
      continue;
    }
    seen.set(sourceKey, index);
  }
  if (diagnostics.length === 0) return void 0;
  return new ImportError({
    code: "source-validation-failed",
    expected: "every writable imported output to declare a unique non-empty sourceKey",
    hint: IMPORT_ERROR_HINTS["source-validation-failed"],
    detail: { diagnostics }
  });
}
async function runImport(meta, registry, fs) {
  if (meta.importer === SHADER_RESERVED_IMPORTER_KEY) {
    return { ok: true, value: { skipped: "shader" } };
  }
  const sourceKeyError = validateOutputSourceKeys(meta);
  if (sourceKeyError !== void 0) return errResult(sourceKeyError);
  const declaredSourceKeys = meta.subAssets.flatMap(
    (subAsset) => subAsset.sourceKey === void 0 ? [] : [subAsset.sourceKey]
  );
  const sourceOverridesResult = validateSourceOverrideMap(meta.sourceOverrides, declaredSourceKeys);
  if (!sourceOverridesResult.ok) {
    const error = new ImportError({
      code: sourceOverridesResult.error.code,
      expected: sourceOverridesResult.error.expected,
      hint: IMPORT_ERROR_HINTS[sourceOverridesResult.error.code],
      detail: {
        sourceKey: sourceOverridesResult.error.actual,
        declaredSourceKeys,
        reason: sourceOverridesResult.error.hint
      }
    });
    if (sourceOverridesResult.error.actual !== void 0) {
      Object.assign(error, { actual: sourceOverridesResult.error.actual });
    }
    return errResult(error);
  }
  const importer = registry.get(meta.importer);
  if (importer === void 0) {
    return errResult(
      new ImportError({
        code: "importer-not-registered",
        expected: `an importer registered for meta.importer "${meta.importer}"`,
        hint: IMPORT_ERROR_HINTS["importer-not-registered"],
        detail: {
          importer: meta.importer,
          registeredImporters: registry.registeredImporters()
        }
      })
    );
  }
  const dependencies = /* @__PURE__ */ new Set();
  const readSource = async (sourcePath) => {
    dependencies.add(dependencyIdentity(fs, sourcePath));
    try {
      return await fs.readSource(sourcePath);
    } catch (error) {
      return { ok: false, error };
    }
  };
  const readSibling = async (uri) => {
    let inner;
    try {
      if (fs.readSibling) {
        dependencies.add(dependencyIdentity(fs, joinSiblingPath(meta.source, uri)));
        inner = await fs.readSibling(meta.source, uri);
      } else {
        inner = await readSource(joinSiblingPath(meta.source, uri));
      }
    } catch (error) {
      inner = { ok: false, error };
    }
    if (inner.ok) {
      return { ok: true, value: inner.value };
    }
    return {
      ok: false,
      error: new ImportError({
        code: "source-read-failed",
        expected: `readable sibling file "${uri}" co-located with meta.source "${meta.source}"`,
        hint: IMPORT_ERROR_HINTS["source-read-failed"],
        detail: {
          source: uri,
          reason: sourceReadFailureReason(inner.error)
        }
      })
    };
  };
  const decodeImage = fs.decodeImage ?? (async () => {
    throw new Error(
      "ImportRunnerFs.decodeImage was not provided; gltfImporter texture extraction requires the host (vite-plugin-pack / cli-gltf / test) to bind decodeImage when constructing the ImportRunnerFs"
    );
  });
  const canonicalSourceOverrides = canonicalizeSourceOverrides(sourceOverridesResult.value);
  const ctx = {
    source: meta.source,
    readSource: () => readSource(meta.source),
    readSibling,
    decodeImage,
    subAssets: meta.subAssets.map(({ guid, sourceIndex, sourceKey, kind }) => ({
      guid,
      sourceIndex,
      ...sourceKey === void 0 ? {} : { sourceKey },
      kind
    })),
    importSettings: meta.importSettings ?? {},
    ...canonicalSourceOverrides === void 0 ? {} : { sourceOverrides: canonicalSourceOverrides }
  };
  const sourceProbe = await readSource(meta.source);
  if (!sourceProbe.ok) {
    return errResult(
      new ImportError({
        code: "source-read-failed",
        expected: `readable source file at meta.source "${meta.source}"`,
        hint: IMPORT_ERROR_HINTS["source-read-failed"],
        detail: {
          source: meta.source,
          reason: sourceReadFailureReason(sourceProbe.error)
        }
      })
    );
  }
  let product;
  try {
    const imported = await importer.import(ctx);
    if (imported === void 0 || imported === null || typeof imported !== "object" || !("ok" in imported)) {
      throw new Error(
        "importer returned a legacy or malformed result; expected ImportResult<ImportProduct>"
      );
    } else {
      if (!imported.ok) {
        if (imported.error === void 0)
          throw new Error("importer returned an invalid failure result");
        if (imported.error instanceof ImportError) return errResult(imported.error);
        return errResult(
          new ImportError({
            code: "import-internal-error",
            expected: `importer "${meta.importer}" to return a structured ImportError`,
            hint: IMPORT_ERROR_HINTS["import-internal-error"],
            detail: { reason: String(imported.error) }
          })
        );
      }
      if (imported.value === void 0)
        throw new Error("importer returned an invalid success result");
      const value = imported.value;
      if (value === void 0 || !Array.isArray(value.assets) || !Array.isArray(value.sourceDependencies) || "artifacts" in value) {
        throw new Error("importer returned an invalid ImportProduct");
      }
      for (const asset of value.assets) {
        if (asset === null || typeof asset !== "object" || !("artifacts" in asset) || asset.artifacts === null || typeof asset.artifacts !== "object" || Array.isArray(asset.artifacts)) {
          throw new Error("importer returned an asset without local artifacts");
        }
      }
      product = value;
    }
  } catch (e) {
    if (e instanceof ImportError) return errResult(e);
    const message = e instanceof Error ? e.message : String(e);
    if (isModuleLoadFailure(e)) {
      return errResult(
        new ImportError({
          code: "import-internal-error",
          expected: `importer module "${meta.importer}" to load (module + native addon present)`,
          hint: IMPORT_ERROR_HINTS["import-internal-error"],
          detail: { loadError: message }
        })
      );
    }
    return errResult(
      new ImportError({
        code: "import-internal-error",
        expected: `importer "${meta.importer}" to convert the source without throwing`,
        hint: IMPORT_ERROR_HINTS["import-internal-error"],
        detail: { reason: message }
      })
    );
  }
  const produced = product.assets;
  for (const asset of produced) {
    if (asset.kind !== "mesh" || asset.payload === null || typeof asset.payload !== "object")
      continue;
    const payload = asset.payload;
    if (payload.lods === void 0) continue;
    const lods = payload.lods.map((level) => ({
      meshGuid: typeof level.meshGuid === "string" ? level.meshGuid : typeof level.mesh === "string" ? level.mesh : JSON.stringify(level.mesh),
      screenCoverage: level.screenCoverage
    }));
    const validated = validateMeshLodContract({
      lods,
      ...payload.lodHysteresis === void 0 ? {} : { lodHysteresis: payload.lodHysteresis }
    });
    if (!validated.ok) {
      return errResult(
        new ImportError({
          code: validated.error.code,
          expected: "MeshAsset LOD facts to satisfy the shared contract",
          hint: IMPORT_ERROR_HINTS[validated.error.code],
          detail: {
            meshLodSourceKey: declarationsSourceKey(meta.subAssets, asset.guid),
            reason: validated.error.reason,
            ...validated.error.code === "mesh-lod-topology-change" ? {
              previousIndices: validated.error.previousIndices,
              nextIndices: validated.error.nextIndices
            } : {}
          }
        })
      );
    }
  }
  const declared = new Set(meta.subAssets.map((s) => s.guid));
  const producedGuids = new Set(produced.map((a) => a.guid));
  const unexpectedGuids = [...producedGuids].filter((g) => !declared.has(g));
  if (unexpectedGuids.length > 0) {
    return errResult(
      new ImportError({
        code: "guid-mismatch",
        expected: "every produced GUID to be declared in meta.subAssets[]",
        hint: IMPORT_ERROR_HINTS["guid-mismatch"],
        detail: { unexpectedGuids }
      })
    );
  }
  const missingGuids = [...declared].filter((g) => !producedGuids.has(g));
  if (produced.length === 0 || missingGuids.length > 0) {
    return errResult(
      new ImportError({
        code: "import-produced-no-assets",
        expected: produced.length === 0 ? "the importer to produce at least one ImportedAsset" : "the produced GUID set to be a superset of meta.subAssets[]",
        hint: IMPORT_ERROR_HINTS["import-produced-no-assets"],
        detail: { missingGuids }
      })
    );
  }
  const declarations = new Map(
    meta.subAssets.map((declaration) => [declaration.guid, declaration])
  );
  const productWithDependencies = {
    ...product,
    sourceDependencies: [...dependencies]
  };
  const inputFingerprint = `source:${[...dependencies].sort().join("|")}`;
  let cookProducts;
  try {
    cookProducts = await finalizeImportProducts(productWithDependencies, inputFingerprint);
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    return errResult(
      new ImportError({
        code: "import-internal-error",
        expected: `importer "${meta.importer}" finalization to produce complete CookProduct digests`,
        hint: IMPORT_ERROR_HINTS["import-internal-error"],
        detail: { reason: `finalization/digest: ${reason}` }
      })
    );
  }
  const terminalProduct = createImportProduct({
    ...productWithDependencies,
    refs: productWithDependencies.assets.flatMap((asset) => asset.refs),
    artifacts: Object.fromEntries(
      productWithDependencies.assets.flatMap(
        (asset) => Object.entries(asset.artifacts).map(([key, artifact]) => [
          `${asset.guid}/${key}`,
          artifact
        ])
      )
    ),
    receipts: cookProducts.map((product2) => product2.receipt),
    diagnostics: meta.diagnostics ?? [],
    sourceRevision: inputFingerprint
  });
  if (!terminalProduct.ok) {
    return errResult(
      new ImportError({
        code: "import-internal-error",
        expected: "the import product to retain complete terminal producer facts",
        hint: "preserve source identity and producer evidence when returning the import product",
        detail: { reason: terminalProduct.error.detail.field }
      })
    );
  }
  if (meta.buildPack === false) {
    return {
      ok: true,
      value: { product: terminalProduct.value, cookProducts }
    };
  }
  const assets = produced.map((a) => {
    const outputFields = declarationFields(declarations.get(a.guid));
    return {
      guid: a.guid,
      kind: a.kind,
      ...outputFields,
      ...a.name !== void 0 ? { name: a.name } : {},
      // bug-20260610: mesh / scene / animation-clip payloads carry Float32Array
      // / Uint16Array / Uint32Array fields. JSON.stringify on a typed array
      // serialises to `{ "0": v0, "1": v1, ... }` (a plain object), which the
      // runtime mesh / animation loaders reject (`vertexData instanceof
      // Float32Array` and `Array.isArray(vertexData)` both fail). Convert
      // every typed-array field to a plain Array here so the pack is JSON-
      // roundtrip safe end-to-end.  This matches the convention every
      // existing pack-fixture test uses (`vertices: Array.from(...)`).
      payload: normaliseForPack(a.payload),
      refs: a.refs.map((r) => r.guid),
      artifacts: a.artifacts
    };
  });
  const pack = {
    schemaVersion: "2.0.0",
    kind: "internal-text-package",
    ...meta.packageId !== void 0 ? { packageId: meta.packageId } : {},
    ...meta.provenance !== void 0 ? { provenance: meta.provenance } : {},
    ...meta.revision !== void 0 ? { revision: meta.revision } : {},
    ...meta.diagnostics !== void 0 ? { diagnostics: meta.diagnostics } : {},
    assets
  };
  return {
    ok: true,
    value: {
      product: terminalProduct.value,
      cookProducts,
      pack
    }
  };
}

// src/importer-registry.ts
var ImporterRegistry = class {
  importers = /* @__PURE__ */ new Map();
  /**
   * Register an importer for its `importer.key`. Fail-fast on a malformed
   * importer (charter P3); idempotent on a repeated key (last write wins).
   *
   * @param importer the `{ key, import }` object to register.
   * @throws TypeError when `importer.key` is empty or `importer.import` is not
   *   a function - a wire-time misconfiguration the host must fix.
   */
  register(importer) {
    if (typeof importer.key !== "string" || importer.key.length === 0) {
      throw new TypeError(
        `ImporterRegistry.register: importer.key must be a non-empty string (got ${JSON.stringify(importer.key)})`
      );
    }
    if (typeof importer.import !== "function") {
      throw new TypeError(
        `ImporterRegistry.register: importer.import must be a function for key "${importer.key}"`
      );
    }
    this.importers.set(importer.key, importer);
  }
  /**
   * Look up the importer registered for `key`. Returns `undefined` when no
   * importer is wired - the import runner maps that to a structured
   * `ImportError(code='importer-not-registered')` with the registered keys in
   * `.detail.registeredImporters` (charter P3).
   */
  get(key) {
    return this.importers.get(key);
  }
  /**
   * The importer keys currently wired, in insertion order. Fed into the
   * `importer-not-registered` error `.detail.registeredImporters` so AI users
   * see exactly what is injectable.
   */
  registeredImporters() {
    return [...this.importers.keys()];
  }
  /** Project the first registered producer capability into the runner context. */
  contextCapabilities() {
    for (const importer of this.importers.values()) {
      const decoder = importer.capabilities?.decodeImage;
      if (decoder !== void 0) return { decodeImage: decoder };
    }
    return {};
  }
  /** Ask the registered producer whether a declaration has a Catalog product. */
  shouldPublishCatalog(input) {
    return this.get(input.importer)?.capabilities?.catalog?.publish?.({
      importSettings: input.importSettings,
      subAssets: input.subAssets
    }) ?? true;
  }
};
function failure(sourceKey, expected, actual) {
  return {
    code: "mesh-bin-payload-invalid",
    subject: "mesh-bin",
    sourceKey,
    expected,
    actual,
    recovery: "re-cook the source with its Meta sidecar through the build-time importer"
  };
}
function asAttributeMap(value) {
  return value ?? {};
}
function jsonValue(value) {
  if (value instanceof Float32Array || value instanceof Uint16Array) return Array.from(value);
  if (Array.isArray(value)) return value.map(jsonValue);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, jsonValue(nested)])
    );
  }
  return value;
}
function refsMeta(payload, refs) {
  const materialSlots = (payload.materialSlots ?? [{ slotName: "Default" }]).map(
    (slot, slotIndex) => {
      const defaultMaterial = slot.defaultMaterial;
      let defaultMaterialRef;
      if (defaultMaterial !== void 0) {
        const guid = AssetGuid.format(defaultMaterial);
        defaultMaterialRef = refs.findIndex((candidate) => candidate.toLowerCase() === guid);
        if (defaultMaterialRef < 0) {
          throw new Error(
            `material slot ${slotIndex} default material ${guid} is absent from refs`
          );
        }
      }
      return {
        slotName: slot.slotName,
        ...slot.sourceKey === void 0 ? {} : { sourceKey: slot.sourceKey },
        ...defaultMaterialRef === void 0 ? {} : { defaultMaterialRef }
      };
    }
  );
  if (payload.lods !== void 0 && payload.lods.length > 7) {
    throw new Error("MeshAsset LOD chain supports at most seven lower-detail levels");
  }
  let previousCoverage = 1;
  const seenLodGuids = /* @__PURE__ */ new Set();
  const lods = payload.lods?.map((lod, lodIndex) => {
    const guid = AssetGuid.format(lod.mesh).toLowerCase();
    const meshRef = refs.findIndex((candidate) => candidate.toLowerCase() === guid);
    if (meshRef < 0) {
      throw new Error(`LOD ${lodIndex} mesh ${guid} is absent from refs`);
    }
    if (seenLodGuids.has(guid)) {
      throw new Error(`LOD ${lodIndex} mesh ${guid} is duplicated`);
    }
    if (!Number.isFinite(lod.screenCoverage) || lod.screenCoverage <= 0 || lod.screenCoverage > 1 || lod.screenCoverage >= previousCoverage) {
      throw new Error(
        `LOD ${lodIndex} screenCoverage must be finite, in (0, 1], and strictly decreasing`
      );
    }
    seenLodGuids.add(guid);
    previousCoverage = lod.screenCoverage;
    return { meshRef, screenCoverage: lod.screenCoverage };
  });
  if (payload.lodHysteresis !== void 0 && (!Number.isFinite(payload.lodHysteresis) || payload.lodHysteresis < 0 || payload.lodHysteresis >= 1)) {
    throw new Error("lodHysteresis must be finite and in [0, 1)");
  }
  return {
    submeshes: payload.submeshes === void 0 || payload.submeshes.length === 0 ? [{ indexOffset: 0, indexCount: payload.indices?.length ?? 0, materialSlot: 0 }] : payload.submeshes,
    materialSlots,
    ...payload.aabb === void 0 ? {} : { aabb: jsonValue(payload.aabb) },
    ...payload.morphTargets === void 0 ? {} : { morphTargets: jsonValue(payload.morphTargets) },
    ...payload.morphWeights === void 0 ? {} : { morphWeights: jsonValue(payload.morphWeights) },
    ...lods === void 0 ? {} : { lods },
    ...payload.lodHysteresis === void 0 ? {} : { lodHysteresis: payload.lodHysteresis }
  };
}
function packMeshBinV4(payload, sourceKey, refs = []) {
  try {
    const vertices = payload.vertices;
    const indices = payload.indices;
    if (!(vertices instanceof Float32Array)) {
      return err(
        failure(sourceKey, "Float32Array interleaved vertices", "vertices is not Float32Array")
      );
    }
    if (indices !== void 0 && !(indices instanceof Uint16Array || indices instanceof Uint32Array)) {
      return err(
        failure(sourceKey, "Uint16Array or Uint32Array indices", "indices has an unsupported type")
      );
    }
    const attributes = asAttributeMap(payload.attributes);
    const projection = deriveVertexLayoutProjection(attributes);
    if (projection.attributes.length === 0 || projection.arrayStride === 0) {
      return err(
        failure(
          sourceKey,
          "a non-empty canonical geometry projection",
          "projection has no attributes"
        )
      );
    }
    const vertexCount = payload.vertexCount ?? vertices.byteLength / projection.arrayStride;
    if (!Number.isSafeInteger(vertexCount) || vertexCount < 0) {
      return err(
        failure(sourceKey, "a non-negative safe vertex cardinality", `vertexCount=${vertexCount}`)
      );
    }
    if (vertices.byteLength !== vertexCount * projection.arrayStride) {
      return err(
        failure(
          sourceKey,
          `vertices.byteLength=${vertexCount * projection.arrayStride}`,
          `vertices.byteLength=${vertices.byteLength}; stride=${projection.arrayStride}`
        )
      );
    }
    for (const attribute of projection.attributes) {
      const value = attributes[attribute.key];
      const components = attribute.byteLength / (attribute.format === "uint16x4" ? 2 : 4);
      if (value === void 0 || !(value instanceof Float32Array) && !(value instanceof Uint16Array) || value.length !== vertexCount * components) {
        return err(
          failure(
            sourceKey,
            `${attribute.key} cardinality=${vertexCount * components}`,
            `${attribute.key} cardinality=${value?.byteLength ?? "missing"}`
          )
        );
      }
    }
    const interleaved = new Uint8Array(vertexCount * projection.arrayStride);
    const interleavedView = new DataView(interleaved.buffer);
    for (const attribute of projection.attributes) {
      const value = attributes[attribute.key];
      if (value === void 0) continue;
      const components = attribute.byteLength / (attribute.format === "uint16x4" ? 2 : 4);
      for (let vertex = 0; vertex < vertexCount; vertex++) {
        for (let component = 0; component < components; component++) {
          const sourceIndex = vertex * components + component;
          const targetOffset = vertex * projection.arrayStride + attribute.offset + component * (attribute.format === "uint16x4" ? 2 : 4);
          if (attribute.format === "uint16x4") {
            interleavedView.setUint16(targetOffset, value[sourceIndex] ?? 0, true);
          } else {
            interleavedView.setFloat32(
              targetOffset,
              value[sourceIndex] ?? 0,
              true
            );
          }
        }
      }
    }
    const indexCount = indices?.length ?? 0;
    const indexWidth = indices === void 0 || indexCount === 0 ? 0 : indices.BYTES_PER_ELEMENT;
    const indexBytes = indexCount * indexWidth;
    if (!Number.isSafeInteger(indexBytes) || indexBytes > 4294967295) {
      return err(failure(sourceKey, "safe index payload byte length", `indexBytes=${indexBytes}`));
    }
    const meta = new TextEncoder().encode(JSON.stringify(refsMeta(payload, refs)));
    const header = {
      version: 4,
      projectionVersion: projection.schemaVersion,
      mask: projection.mask,
      digest: projection.digest,
      stride: projection.arrayStride,
      vertexCount,
      vertexBytes: interleaved.byteLength,
      indexCount,
      indexWidth,
      indexBytes,
      jsonBytes: meta.byteLength
    };
    const total = MESH_BIN_HEADER_V4_BYTES + interleaved.byteLength + indexBytes + meta.byteLength;
    if (!Number.isSafeInteger(total) || total > 4294967295) {
      return err(failure(sourceKey, "safe mesh binary byte length", `total=${total}`));
    }
    const out = new Uint8Array(total);
    writeMeshBinHeader(header, out);
    let offset = MESH_BIN_HEADER_V4_BYTES;
    out.set(interleaved, offset);
    offset += interleaved.byteLength;
    if (indices !== void 0 && indexBytes > 0) {
      out.set(new Uint8Array(indices.buffer, indices.byteOffset, indices.byteLength), offset);
      offset += indexBytes;
    }
    out.set(meta, offset);
    return ok(out);
  } catch (error) {
    return err(
      failure(
        sourceKey,
        "valid canonical mesh payload",
        error instanceof Error ? error.message : String(error)
      )
    );
  }
}

export { ImporterRegistry, SHADER_RESERVED_IMPORTER_KEY, deriveDefaultLodScreenCoverages, normaliseForPack, packMeshBinV4, reconcileMeshLodMeta, runImport, validateMeshLodContract };
