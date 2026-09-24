// src/asset-errors.ts
var ASSET_LOAD_ERROR_HINTS = {
  "asset-guid-invalid": "provide a valid asset GUID and retry the current publication",
  "asset-kind-mismatch": "pass the Catalog kind or the matching custom AssetKind token",
  "asset-not-found": "inspect the producer Catalog and rebuild the missing publication",
  "asset-not-ready": "wait for the current publication or inspect its producer lifecycle",
  "catalog-unavailable": "inspect the scope and create a fresh Registry for a new scope",
  "catalog-discontinuous": "reconcile the Catalog baseline before loading the current row",
  "asset-fetch-failed": "verify the package locator and republish the Pack",
  "asset-integrity-failed": "verify the artifact digest and recook the Pack",
  "asset-package-invalid": "validate the Pack v2 envelope and recook invalid output",
  "asset-decoder-missing": "install the owner decoder lease for this kind",
  "asset-decode-failed": "inspect the structured decoder detail and repair the owner output",
  "asset-dependency-failed": "repair the dependency publication named in detail and retry",
  "asset-superseded": "load the current publication instead of the superseded ticket",
  "asset-load-cancelled": "retry with a live AbortSignal when the request is still needed",
  "asset-runtime-disposed": "obtain a new Registry from the current realm"
};
var ASSET_EVIDENCE_ERROR_HINTS = {
  "asset-evidence-capability-missing": "provide the missing evidence capability, then rerun asset lookup or verify",
  "asset-evidence-source-conflict": "keep one source declaration per GUID and rerun the offline evidence projection",
  "asset-evidence-locator-conflict": "keep one packageUrl per GUID and rebuild the catalog before verifying the asset",
  "asset-evidence-receipt-conflict": "keep one producer-owned receipt per GUID and rerun cook before verifying the asset",
  "asset-evidence-digest-mismatch": "recook the source or restore the package bytes, then rerun artifact verification"
};
var ASSET_STAGE_ERROR_HINTS = {
  "author-validation-failed": "read the authoring rule and apply the suggested recovery",
  "external-declaration-invalid": "repair the sourceKey declaration and retry recovery",
  "import-failed": "fix the importer input or registration, then retry recovery",
  "native-cook-failed": "fix the native producer and rerun recovery",
  "ddc-validation-failed": "repair the cooked artifact and rerun recovery",
  "runtime-parse-failed": "repair the package payload and rerun recovery",
  "editor-capability-unavailable": "register the capability and retry recovery"
};

// src/result.ts
var OK_PROTO = {
  unwrap() {
    return this.value;
  },
  unwrapOr(_defaultValue) {
    return this.value;
  }
};
var ERR_PROTO = {
  unwrap() {
    throw this.error;
  },
  unwrapOr(defaultValue) {
    return defaultValue;
  }
};
function ok(value) {
  const r = Object.create(OK_PROTO);
  r.ok = true;
  r.value = value;
  return r;
}
function err(error) {
  const r = Object.create(ERR_PROTO);
  r.ok = false;
  r.error = error;
  return r;
}

// src/asset-evidence.ts
function projectCookProductEvidence(product, locator) {
  if (product.receipt.guid !== product.guid) {
    return conflict(
      "asset-evidence-receipt-conflict",
      product.guid,
      product.receipt.guid,
      product.guid
    );
  }
  if (product.receipt.outputDigest !== product.digest) {
    return conflict(
      "asset-evidence-digest-mismatch",
      product.guid,
      product.digest,
      product.receipt.outputDigest ?? "missing receipt digest"
    );
  }
  return projectAssetEvidence({
    guid: product.guid,
    source: {
      origin: product.receipt.origin,
      inputFingerprint: product.receipt.inputFingerprint
    },
    ...locator === void 0 ? {} : { locator },
    receipt: product.receipt,
    package: {
      guid: product.guid,
      digest: product.digest,
      artifacts: Object.fromEntries(
        Object.entries(product.artifacts).map(([key, descriptor]) => [
          key,
          { descriptor, verification: "passed" }
        ])
      )
    }
  });
}
function conflict(code, guid, observed, expected) {
  return err({
    code,
    expected,
    hint: ASSET_EVIDENCE_ERROR_HINTS[code],
    detail: { guid, observed, expected }
  });
}
function distinct(values, key) {
  const result = [];
  const seen = /* @__PURE__ */ new Set();
  for (const value of values) {
    const identity = key(value);
    if (!seen.has(identity)) {
      seen.add(identity);
      result.push(value);
    }
  }
  return result;
}
function chooseSource(inputs) {
  const values = distinct(
    [inputs.source, ...inputs.sources ?? []].filter(
      (value) => value !== void 0
    ),
    (value) => JSON.stringify(value)
  );
  if (values.length > 1) {
    return conflict(
      "asset-evidence-source-conflict",
      inputs.guid,
      JSON.stringify(values),
      "one source declaration per GUID"
    );
  }
  return ok(values[0]);
}
function chooseLocator(inputs) {
  const values = distinct(
    [inputs.locator, ...inputs.locators ?? []].filter(
      (value) => value !== void 0
    ),
    (value) => JSON.stringify(value)
  );
  if (values.length > 1) {
    return conflict(
      "asset-evidence-locator-conflict",
      inputs.guid,
      JSON.stringify(values),
      "one package locator per GUID"
    );
  }
  return ok(values[0]);
}
function chooseReceipt(inputs) {
  const values = distinct(
    [inputs.receipt, ...inputs.receipts ?? []].filter(
      (value) => value !== void 0
    ),
    (value) => JSON.stringify(value)
  );
  if (values.length > 1) {
    return conflict(
      "asset-evidence-receipt-conflict",
      inputs.guid,
      JSON.stringify(values),
      "one cook receipt per GUID"
    );
  }
  const receipt = values[0];
  if (receipt !== void 0 && receipt.guid.toLowerCase() !== inputs.guid.toLowerCase()) {
    return conflict(
      "asset-evidence-receipt-conflict",
      inputs.guid,
      receipt.guid,
      `receipt GUID ${inputs.guid}`
    );
  }
  return ok(receipt);
}
function packageEvidence(inputs) {
  if (inputs.packageVerification !== void 0) return inputs.packageVerification;
  if (inputs.package === void 0) return void 0;
  const statuses = Object.values(inputs.package.artifacts).map(
    (artifact) => artifact.verification ?? "notChecked"
  );
  const status = statuses.some((value) => value === "failed") ? "failed" : statuses.length > 0 && statuses.every((value) => value === "passed") ? "passed" : "notChecked";
  return {
    status,
    ...inputs.package.digest !== void 0 ? { digest: inputs.package.digest } : {}
  };
}
function artifactsEvidence(inputs) {
  const descriptors = inputs.artifacts ?? Object.fromEntries(
    Object.entries(inputs.package?.artifacts ?? {}).map(([key, value]) => [
      key,
      value.descriptor
    ])
  );
  return Object.fromEntries(
    Object.entries(descriptors).map(([key, descriptor]) => [
      key,
      {
        descriptor,
        verification: inputs.artifactVerification?.[key] ?? inputs.package?.artifacts[key]?.verification ?? "notChecked"
      }
    ])
  );
}
function freshness(source, receipt) {
  if (source?.origin === "authoredPack") return "notApplicable";
  if (receipt === void 0) return "unknown";
  if (source?.inputFingerprint === void 0) return "unknown";
  return source.inputFingerprint === receipt.inputFingerprint ? "current" : "stale";
}
function cookStatus(source, receipt) {
  if (source?.origin === "authoredPack") return "notRequired";
  if (receipt?.status === "failed") return "failed";
  if (receipt?.status === "succeeded") return "ready";
  if (source?.origin === "sourceMeta") return "notCooked";
  return "unknown";
}
function projectAssetEvidence(inputs) {
  const sourceResult = chooseSource(inputs);
  if (!sourceResult.ok) return sourceResult;
  const locatorResult = chooseLocator(inputs);
  if (!locatorResult.ok) return locatorResult;
  const receiptResult = chooseReceipt(inputs);
  if (!receiptResult.ok) return receiptResult;
  const source = sourceResult.value;
  const locator = locatorResult.value;
  const receipt = receiptResult.value;
  const packageVerification = packageEvidence(inputs);
  if (receipt?.outputDigest !== void 0 && packageVerification?.digest !== void 0 && receipt.outputDigest !== packageVerification.digest) {
    return conflict(
      "asset-evidence-digest-mismatch",
      inputs.guid,
      packageVerification.digest,
      receipt.outputDigest
    );
  }
  return ok({
    guid: inputs.guid,
    ...locator?.packageUrl !== void 0 ? { packageUrl: locator.packageUrl } : {},
    ...locator?.cookReceiptUrl !== void 0 ? { cookReceiptUrl: locator.cookReceiptUrl } : {},
    ...source !== void 0 ? { source } : {},
    cook: {
      status: cookStatus(source, receipt),
      freshness: freshness(source, receipt),
      ...receipt !== void 0 ? { receipt } : {}
    },
    ...packageVerification !== void 0 ? { package: packageVerification } : {},
    artifacts: artifactsEvidence(inputs),
    runtime: { status: inputs.runtime?.status ?? "unknown" }
  });
}

// src/asset-error-contracts.ts
var AssetError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    super(`[AssetError ${args.code}] expected: ${args.expected}; hint: ${args.hint}`);
    this.name = "AssetError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    if (args.detail !== void 0) {
      this.detail = args.detail;
    }
  }
};
var ASSET_ERROR_HINTS = {
  "asset-fetch-failed": "check url path; verify dev server is running; in tests use data: URL fixture (data:image/png;base64,...)",
  "catalog-source-unconfigured": "call AssetRegistry.setCatalogSource(source) before enumerateCatalog(), then retry the operation",
  "asset-parse-failed": "check file bytes are not corrupted; for procedural geometry: verify all dimensions > 0 and segments >= 1",
  "asset-format-unsupported": "v1 supports png/jpg only; convert .bmp/.webp etc. via image tooling; gltf/glb supported via @forgeax/engine-gltf importer (forgeax asset import <gltf-or-glb> --root <project>)",
  "asset-not-found": "handle id not in registry; verify register() was called before get(); inspect() returns all live handles",
  "asset-invalid-value": "a register-time value failed validation; read err.hint for the case-specific fix (e.g. clamp a MaterialAsset param to [0,1], or give a strip-topology MeshAsset an index buffer) and err.detail for the offending field/value",
  "cubemap-handle-missing": "the equirect-to-cubemap projection (internal to the render-system record arm) has no live cubemap for this Skylight; ensure Skylight.equirect references a loaded EquirectAsset handle and caps.rgba16floatRenderable is true",
  "invalid-source-format": "decode .hdr via @forgeax/engine-image first; supported formats are rgba16float and rgba32float",
  "load-failed": "source asset could not be loaded; check GUID validity and file accessibility in the pack-index catalog",
  "device-unsupported": "GPU device lacks required capability; check device.caps for rgba16float renderable feature",
  "ibl-precompute-not-dispatched": "check IblPipelineCache.runIblPrecompute is called inside the internal GpuResourceStore equirect-to-cubemap projection; counters must not increment before queue.submit (plan D-7 / N-3 AC-20 invariant)",
  "mesh-vertex-stride-mismatch": "use meshFromInterleaved (packages/runtime/src/geometry/box.ts) or expand vertices buffer to canonical 12F layout (position vec3 + normal vec3 + uv vec2 + tangent vec4)",
  // === 1 new hint (feat-20260523-shader-template-instance-split M1-T02) ===
  "material-shader-ref-broken": "the materialShader identifier (path or GUID) resolves to no registered shader; check ShaderRegistry for path identifiers or AssetRegistry for GUID sub-assets",
  // === 1 new hint (feat-20260526-material-asset-multipass-renderstate M1 / w6) ===
  "material-circular-inheritance": 'circular parent chain detected; inspect parent handles \u2014 use err.detail.cycle to see the full path (e.g. "A -> B -> A")',
  // === 2 new hints (feat-20260603-asset-import-loader-injection M1 / w1) ===
  "loader-not-registered": "no loader registered for this asset kind; register it via engine.assets.loaders.register(loader) (the loader carries its own kind); err.detail.registeredKinds lists the kinds currently wired",
  "asset-not-imported": "GUID is in the catalog but its DDC artefact is missing and no ImportTransport is wired (shipped form never falls back to a runtime import); add the asset to the build-time pre-import step instead of importing at runtime",
  // === 1 new hint (feat-20260604-hdr-equirect-cube-importer-loader M2 / w4) ===
  "texture-source-not-imported": "texture source not imported yet; wire createDevImportTransport() in the studio form for dev lazy-import, or pre-import via the build-time pipeline",
  // === 1 new hint (perf-20260706-raw-container-failfast) ===
  "source-not-imported": "this mesh/material/scene sub-asset row still points at the raw source container (.glb/.gltf/.fbx); wire createDevImportTransport() for dev lazy-import (POST /__import), or pre-import via the build-time pipeline. The runtime does not parse raw containers at load time.",
  // === 3 new hints (feat-20260608-mesh-multi-section-primitive-multi-material-slot M1 / w2) ===
  "mesh-renderer-material-override-invalid": "a MeshRenderer.materials slot is stale or does not resolve to a MaterialAsset; the renderer inherited the MeshAsset default for that slot",
  "mesh-renderer-material-override-overflow": "MeshRenderer.materials contains entries beyond MeshAsset.materialSlots; extra overrides are ignored",
  "mesh-asset-submeshes-empty": "MeshAsset.submeshes must have at least one entry; every mesh must declare at least one submesh; check MeshAsset registration payload for empty submeshes array",
  "mesh-asset-material-slot-index-out-of-range": "MeshAsset submesh materialSlot must index MeshAsset.materialSlots; re-cook the mesh and inspect the offending submesh/slot topology",
  "mesh-submesh-index-range-out-of-bounds": "submesh indexOffset + indexCount exceeds the parent mesh index buffer length; check submesh index range bounds against MeshAsset.indices and MeshAsset.vertices; err.detail carries submeshIndex, indexOffset, indexCount, indexBufferLength, and meshAssetGuid",
  // === 1 new hint (feat-20260608-tilemap-object-layer-rendering M0 baseline rebuild) ===
  "tileset-region-index-out-of-range": "a TilesetAsset.regions[] rectangle escapes the atlas extent OR a TilesetAsset.tiles[].regionIndex points past TilesetAsset.regions.length; check regions[i] (x + width <= atlasWidth, y + height <= atlasHeight) and tiles[i].regionIndex in [0, regions.length); err.detail carries tilesetGuid, tileId, regionIndex, regionCount",
  // === 1 new hint (feat-20260608-tilemap-object-layer-rendering M1 schema extension) ===
  "tileset-tile-entry-malformed": "a TilesetTileEntry optional field is out of range (widthCells / heightCells in (0, 64], pivotX / pivotY in [0, 1], collider rect/polygon in normalized [0,1]^2 with rect.length === 4 and polygon.points.length >= 3) OR a top-level field is out of range (atlases.length >= 1, region.atlasIndex in [0, atlases.length)); engine fail-fast at register-time. read err.detail.field (closed enum) + err.detail.scope (tile-entry | tileset-asset) + err.detail.tileEntryIndex to locate the offending entry; switch (err.detail.field) covers the 7 variants exhaustively without default",
  // === 1 new hint (feat-20260621-asset-registry-robustness-invalidate-inflight-cach M2 / w4) ===
  "asset-invalidated": "The asset was invalidated during load; call loadByGuid(guid) again to retry with a fresh fetch",
  // === 1 new hint (feat-20260629-multi-uv-set-support M2 / m2-w5) ===
  "mesh-bin-contract-violation": "re-cook the asset via importer; the .bin sidecar v4 contract is violated \u2014 inspect err.detail.reason and its expected/actual projection, stride, cardinality, and byte-length facts",
  // === 1 new hint (feat-20260707-texture-block-compression M5 / w35, D-9) ===
  "mipgen-unsupported-compressed-format": 'compressed-texture mips must be baked offline (the GPU cannot generate mips for a non-render-target block format); re-cook with an offline mip chain, or set the sidecar .meta.json compressionMode:"none" (or mipmap:false) to keep runtime mip generation on an uncompressed texture'
};
var FontError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    super(`[FontError ${args.code}] expected: ${args.expected}; hint: ${args.hint}`);
    this.name = "FontError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    if (args.detail !== void 0) {
      this.detail = args.detail;
    }
  }
};
var TextError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    super(`[TextError ${args.code}] expected: ${args.expected}; hint: ${args.hint}`);
    this.name = "TextError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    if (args.detail !== void 0) {
      this.detail = args.detail;
    }
  }
};

// src/asset-pods.ts
var MATERIAL_TEXTURE_SLOTS = [
  "baseColorTexture",
  "normalTexture",
  "specularTintTexture",
  "metallicRoughnessTexture",
  "emissiveTexture",
  "occlusionTexture"
];

// src/audio-contracts.ts
var AudioError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    super(`[AudioError ${args.code}] expected: ${args.expected}; hint: ${args.hint}`);
    this.name = "AudioError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    if (args.detail !== void 0) {
      this.detail = args.detail;
    }
  }
};
var AUDIO_ERROR_HINTS = {
  "context-creation-failed": "check browser supports AudioContext; verify no privacy extension blocks audio; try reloading the page after user gesture",
  "decode-failed": "ensure audio file is a valid wav/mp3/ogg/flac at the GUID path; check file integrity (truncated or empty bytes)",
  "context-suspended": "call play after a user gesture (click/tap/keydown) to trigger AudioContext.resume(); if in iframe check sandbox attribute",
  "invalid-clip-handle": "verify clip was registered via AssetRegistry.register() before spawning AudioSource; inspect active handles via assetRegistry.inspect()",
  "bus-not-found": "use 'sfx' or 'music' bus literal; custom bus names are not supported in v1 (OOS-2)"
};

// src/handle.ts
function toUnique(raw) {
  return raw;
}
function toShared(raw) {
  return raw;
}
function unwrapHandle(h) {
  return h;
}
var BUILTIN_BASE = 1024;
var MAX_SLOT = (1 << 24) - 1;
var MAX_GEN = 255;
function pack(slot, gen) {
  return ((gen & 255) << 24 | slot & 16777215) >>> 0;
}
function unpackSlot(v) {
  return v & 16777215;
}
function unpackGen(v) {
  return v >>> 24 & 255;
}
function isRetiredSlot(gen) {
  return gen > MAX_GEN;
}
function handleSlot(h) {
  return unpackSlot(h);
}
function handleGeneration(h) {
  return unpackGen(h);
}

// src/image-pack-contracts.ts
var IMAGE_ERROR_HINTS = {
  "image-decode-failed": "check file integrity; re-export from DCC tool (Photoshop / GIMP / Aseprite); dimensions > 0 + valid PNG / JPG header bytes",
  "image-format-unsupported": "supports PNG / JPG / TGA true-color sources; convert unsupported formats with: magick convert <input> <output>.png; check importSettings.colorSpace consistency with format family if formatColorSpaceConflict present",
  "image-dimension-out-of-bounds": "downscale source under device caps (typical maxTextureDimension2D = 8192 / 16384); use mipmap chain instead of larger source if lod is the goal",
  "image-meta-missing": "run: forgeax asset import <path> --root <project> --json",
  "image-hdr-decode-failed": "check .hdr file integrity; verify Radiance RGBE header magic (#?RADIANCE) and FORMAT=32-bit_rle_rgbe header field; ensure file was not truncated",
  // feat-20260521-sprite-atlas-animation M1 T-02 — atlas hook hint strings
  // (plan-strategy section 2 D-2). Each hint embeds an executable recovery
  // path so AI users self-repair by copy-pasting the hint into the shell
  // or into the build config (charter P3 explicit failure + AGENTS.md
  // Error model "hint must carry executable recovery").
  "atlas-empty-input": "verify forgeax asset atlas --input <glob> --name <prefix> --output <dir> --root <project> matches at least 1 PNG on disk; run `ls <glob>` to inspect the resolved file set; add the missing sprite source or fix the glob pattern",
  "atlas-size-exceeded": "downscale the source PNG so width * height <= maxAtlasSize^2 (default 4096); or split sprites across multiple atlas runs (forgeax asset atlas --input <subset-glob> --name <other-prefix> --output <dir> --root <project>); or raise the cap via --max-atlas-size 8192 if device caps allow it",
  "atlas-region-mismatch": "shelfPack returned regions exceeding atlas footprint \u2014 packer safety net; file a forgeax-engine bug; rerun forgeax asset atlas with a smaller input set or lower --max-atlas-size as temporary recovery",
  "image-surface-invalid": "repair the PixelSurface authoring input named in err.detail; use positive integer dimensions, finite RGBA8 values, and a finite noise seed, then rerun the image producer"
};
var PACK_ERROR_HINTS = {
  "pack-malformed-meta": "check guid is a valid RFC 4122 UUID; validate with: ajv validate -s schema/meta.schema.json -d <file>",
  "pack-malformed-pack": "check all asset guid and refs[] fields are 36-char dash-form UUIDs; validate with pack.schema.json",
  "pack-guid-malformed": "use AssetGuid.random() or a UUIDv7 generator; all GUID fields must be 36-char RFC 4122 dash-form",
  "pack-orphan-meta": "remove the orphan .meta.json or add the missing source file next to it",
  "pack-meta-missing": "run forgeax asset list --root <project> --json to list source files without .meta.json",
  "pack-guid-collision": "run forgeax asset verify --root <project> --json to list all GUID collisions; each GUID must be globally unique",
  "pack-cyclic-reference": "run forgeax asset verify --root <project> --json to print the cycle path; break the cycle by removing a refs[] entry",
  "pack-subasset-index-out-of-range": "check subAssets[].sourceIndex does not exceed the actual sub-image count in the source file",
  // === 1 new hint (feat-20260523-shader-template-instance-split M1-T02) ===
  "payload-schema-mismatch": "material asset payload failed schema validation; check paramSchema entries all use valid types from MATERIAL_PARAM_TYPES and materialShader is a non-empty string",
  // === 4 new hints (feat-20260608-scene-nesting-ecs-fication M1 / w8;
  // plan-strategy D-8) ===
  "pack-mount-localid-overlap": "check parent SceneAsset.mounts[].memberFirst windows do not overlap with each other or with entities[].localId; rebuild mount sidecar after the child SceneAsset reimport",
  "pack-mount-count-mismatch": "mount.memberCount must equal the referenced child SceneAsset totalSlots (entities.length + sum(mounts[].memberCount) + mounts.length); rebuild mount sidecar via forgeax asset verify --root <project> --json after the child SceneAsset reimport",
  "pack-mount-override-localid-out-of-range": "override.localId must be in [0, mount.memberCount); shrink the override or extend memberCount to match the child SceneAsset",
  "pack-mount-override-unknown-field": "override.comp / override.field must match a defined component schema; check defineComponent registry or rebuild mount sidecar after the child SceneAsset reimport"
};

// src/lighting.ts
var IES_PROFILE_WIDTH = 256;
var IES_PROFILE_HEIGHT = 128;
var IES_PROFILE_BYTES_PER_SAMPLE = 2;
var R_MIN = 1e-4;
var IES_PROFILE_BYTE_LENGTH = IES_PROFILE_WIDTH * IES_PROFILE_HEIGHT * IES_PROFILE_BYTES_PER_SAMPLE;

// src/material/errors.ts
var MATERIAL_ERROR_CODES = [
  "material-parent-not-found",
  "material-circular-inheritance",
  "material-child-contract-invalid",
  "material-no-effective-pass",
  "material-value-unknown",
  "material-value-type-mismatch",
  "material-parameter-type-unsupported",
  "material-contract-program-mismatch",
  "shader-module-id-missing",
  "shader-module-id-duplicate",
  "shader-module-not-found",
  "shader-module-namespace-reserved",
  "material-reflection-binding-mismatch",
  "material-specialization-not-cooked",
  "material-specialization-stale-generation",
  "gltf-material-uv-set-missing",
  "material-derived-interface-mismatch",
  "material-texture-coordinate-invalid",
  "material-payload-bounds",
  "material-transmission-contract-invalid",
  "material-physical-contract-invalid",
  "material-tangent-required",
  "material-surface-slot-missing",
  "material-surface-abi-mismatch",
  "material-surface-forbidden-interface"
];
var MATERIAL_ERROR_POLICY = {
  "material-parent-not-found": {
    expected: "every parent GUID resolves to a MaterialAsset",
    hint: "fix the parent GUID and resolve the material again"
  },
  "material-circular-inheritance": {
    expected: "the parent chain is acyclic",
    hint: "remove the repeated GUID from the parent chain"
  },
  "material-child-contract-invalid": {
    expected: "a parent-bearing material child contains only parent and authored values",
    hint: "remove colorSpace, passes, parameters, and surface from the child; let the MaterialTable root provide the effective contract"
  },
  "material-no-effective-pass": {
    expected: "the resolved material has at least one pass",
    hint: "add a pass to the root material or an inherited parent"
  },
  "material-value-unknown": {
    expected: "every value name is declared by the effective contract",
    hint: "remove the value or declare the parameter in the root contract"
  },
  "material-value-type-mismatch": {
    expected: "each value matches its declared parameter type",
    hint: "change the value to the declared parameter type"
  },
  "material-parameter-type-unsupported": {
    expected: "each material parameter uses a producer-supported ABI type",
    hint: "replace the boolean parameter with a supported numeric, vector, color, or texture type and recook the material"
  },
  "material-contract-program-mismatch": {
    expected: "the program satisfies the material contract",
    hint: "align the program entries with the root contract"
  },
  "shader-module-id-missing": {
    expected: "each WGSL source declares a module ID",
    hint: "add a compiler-native module ID declaration to the WGSL source"
  },
  "shader-module-id-duplicate": {
    expected: "each module ID has one source provenance",
    hint: "rename one module or remove the duplicate source"
  },
  "shader-module-not-found": {
    expected: "every referenced module exists in the source catalog",
    hint: "add the module to the source catalog or fix the reference"
  },
  "shader-module-namespace-reserved": {
    expected: "user modules use a non-reserved namespace",
    hint: "choose a module ID outside the reserved namespace"
  },
  "material-reflection-binding-mismatch": {
    expected: "reflection matches the material contract bindings",
    hint: "update the contract or WGSL binding and cook again"
  },
  "material-specialization-not-cooked": {
    expected: "the requested specialization has a cooked artifact",
    hint: "run the build or development cook path for this selection"
  },
  "material-specialization-stale-generation": {
    expected: "all specialization dependencies share one generation",
    hint: "retry after dependent assets and sources settle"
  },
  "gltf-material-uv-set-missing": {
    expected: "each texture slot references an available primitive UV set",
    hint: "add the requested UV set to the primitive and re-import it"
  },
  "material-derived-interface-mismatch": {
    expected: "the generated material interface matches the derived schema interface",
    hint: "repair the schema or WGSL producer and recook the material"
  },
  "material-texture-coordinate-invalid": {
    expected: "every texture coordinate record is finite and complete",
    hint: "repair the texture metadata or coordinates and recook the material"
  },
  "material-payload-bounds": {
    expected: "every material payload write stays within the derived payload",
    hint: "repair the derived payload owner before submitting the draw"
  },
  "material-transmission-contract-invalid": {
    expected: "transmission material values satisfy finite ranges and Forward depth rules",
    hint: "repair the named transmission value or pass state before publishing the material"
  },
  "material-physical-contract-invalid": {
    expected: "the Standard physical contract contains complete declared layers and valid passes",
    hint: "repair the root parameters or pass policy and derive the material again"
  },
  "material-tangent-required": {
    expected: "the physical material tangent input is complete and valid before draw admission",
    hint: "provide a finite tangent: vec4 or repair the named normal, UV, and triangle topology inputs"
  },
  "material-surface-slot-missing": {
    expected: "the Standard material pass has one surface module slot",
    hint: "add moduleSlots.surface to the Standard pass and recook the material"
  },
  "material-surface-abi-mismatch": {
    expected: "the Surface module exports evaluate_surface with the input and output types required by its selected material model",
    hint: "repair the authored Surface export to the producer-reported ABI and recook the material"
  },
  "material-surface-forbidden-interface": {
    expected: "the Surface module declares no stage entry, resource binding, or vertex mutation",
    hint: "remove the forbidden interface from the Surface source and recook the material"
  }
};
var MATERIAL_ERROR_EXPECTED = Object.fromEntries(
  MATERIAL_ERROR_CODES.map((code) => [code, MATERIAL_ERROR_POLICY[code].expected])
);
var MATERIAL_ERROR_HINTS = Object.fromEntries(
  MATERIAL_ERROR_CODES.map((code) => [code, MATERIAL_ERROR_POLICY[code].hint])
);
function createMaterialError(code, detail, message = `${code}: ${MATERIAL_ERROR_EXPECTED[code]}`) {
  return {
    code,
    expected: MATERIAL_ERROR_EXPECTED[code],
    hint: MATERIAL_ERROR_HINTS[code],
    detail,
    message
  };
}

// src/material/surface-model.ts
var MATERIAL_SURFACE_MODELS = ["standard", "single-layer-medium"];
var SINGLE_LAYER_MEDIUM_SURFACE_MODEL = "single-layer-medium";
function isMaterialDynamicFieldType(value) {
  return value === "f32" || value === "u32" || value === "vec2<f32>" || value === "vec3<f32>" || value === "vec4<f32>";
}
var IDENTIFIER_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
var FIELD_FACTS = {
  f32: { size: 4, alignment: 4 },
  u32: { size: 4, alignment: 4 },
  "vec2<f32>": { size: 8, alignment: 8 },
  // WGSL vec3 values occupy a 16-byte aligned slot in a storage struct.
  "vec3<f32>": { size: 12, alignment: 16 },
  "vec4<f32>": { size: 16, alignment: 16 }
};
function materialDynamicFieldFacts(type) {
  switch (type) {
    case "f32":
      return FIELD_FACTS.f32;
    case "u32":
      return FIELD_FACTS.u32;
    case "vec2<f32>":
      return FIELD_FACTS["vec2<f32>"];
    case "vec3<f32>":
      return FIELD_FACTS["vec3<f32>"];
    case "vec4<f32>":
      return FIELD_FACTS["vec4<f32>"];
    default:
      return void 0;
  }
}
function alignTo(value, alignment) {
  return Math.ceil(value / alignment) * alignment;
}
function layoutError(code, expected, hint, field, actual) {
  return {
    code,
    expected,
    hint,
    ...field === void 0 ? {} : { field },
    ...actual === void 0 ? {} : { actual }
  };
}
function validPositiveInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}
function deriveMaterialDynamicInputLayout(schema) {
  if (schema === null || typeof schema !== "object" || Array.isArray(schema)) {
    return err(
      layoutError(
        "invalid-name",
        "the dynamic input schema is an object with a WGSL identifier name",
        "provide a plain dynamic input declaration before publishing the material",
        "schema",
        schema
      )
    );
  }
  if (typeof schema.name !== "string" || !IDENTIFIER_RE.test(schema.name)) {
    return err(
      layoutError(
        "invalid-name",
        "the dynamic input name is a WGSL identifier",
        "rename the dynamic input using ASCII letters, digits, and underscores",
        "name",
        schema.name
      )
    );
  }
  if (!Array.isArray(schema.fields) || schema.fields.length === 0) {
    return err(
      layoutError(
        "invalid-field",
        "a dynamic input declares at least one field",
        "add a scalar or vector field to the dynamic input schema",
        "fields",
        schema.fields
      )
    );
  }
  const limits = [
    ["maxRecords", schema.maxRecords],
    ["maxDomains", schema.maxDomains],
    ["maxPageBytes", schema.maxPageBytes],
    ["maxBindings", schema.maxBindings],
    ["maxEventsPerSample", schema.maxEventsPerSample]
  ];
  for (const [field, value] of limits) {
    if (!validPositiveInteger(value)) {
      return err(
        layoutError(
          "invalid-limit",
          `${field} is a positive safe integer`,
          "choose an explicit finite producer budget and retry publication",
          field,
          value
        )
      );
    }
  }
  const names = /* @__PURE__ */ new Set();
  let cursor = 0;
  let maxAlignment = 16;
  const fields = [];
  for (const [index, field] of schema.fields.entries()) {
    if (field === null || typeof field !== "object" || Array.isArray(field)) {
      return err(
        layoutError(
          "invalid-field",
          "every dynamic field is an object with a name and supported type",
          "repair the malformed dynamic input field before publishing the material",
          `fields[${index}]`,
          field
        )
      );
    }
    if (typeof field.name !== "string" || !IDENTIFIER_RE.test(field.name)) {
      return err(
        layoutError(
          "invalid-field",
          "every dynamic field name is a WGSL identifier",
          "rename the field using ASCII letters, digits, and underscores",
          `fields[${index}].name`,
          field.name
        )
      );
    }
    if (names.has(field.name)) {
      return err(
        layoutError(
          "duplicate-field",
          "dynamic field names are unique",
          "remove the duplicate field before cooking the material",
          field.name,
          field.name
        )
      );
    }
    if (!isMaterialDynamicFieldType(field.type)) {
      return err(
        layoutError(
          "invalid-field",
          "each dynamic field uses a supported scalar or vector type",
          "use f32, u32, vec2<f32>, vec3<f32>, or vec4<f32>",
          `fields[${index}].type`,
          field.type
        )
      );
    }
    const facts = materialDynamicFieldFacts(field.type);
    if (facts === void 0) {
      return err(
        layoutError(
          "invalid-field",
          "each dynamic field uses a supported scalar or vector type",
          "use f32, u32, vec2<f32>, vec3<f32>, or vec4<f32>",
          `fields[${index}].type`,
          field.type
        )
      );
    }
    names.add(field.name);
    maxAlignment = Math.max(maxAlignment, facts.alignment);
    const offset = alignTo(cursor, facts.alignment);
    fields.push({ ...field, offset, size: facts.size, alignment: facts.alignment });
    cursor = offset + facts.size;
  }
  const stride = alignTo(cursor, maxAlignment);
  const requiredBytes = stride * schema.maxRecords;
  if (!Number.isSafeInteger(requiredBytes) || stride > schema.maxPageBytes || requiredBytes > schema.maxPageBytes) {
    return err(
      layoutError(
        "page-too-small",
        "the declared page can hold maxRecords at the derived stride",
        "increase maxPageBytes or reduce maxRecords before publishing the material",
        "maxPageBytes",
        schema.maxPageBytes
      )
    );
  }
  const identity = [
    "surface-dynamic-v1",
    schema.name,
    `stride-${stride}`,
    ...fields.map((field) => `${field.name}:${field.type}@${field.offset}`),
    `records-${schema.maxRecords}`,
    `domains-${schema.maxDomains}`,
    `bytes-${schema.maxPageBytes}`,
    `bindings-${schema.maxBindings}`,
    `sample-${schema.maxEventsPerSample}`
  ].join("/");
  return ok({
    name: schema.name,
    stride,
    fields,
    maxRecords: schema.maxRecords,
    maxDomains: schema.maxDomains,
    maxPageBytes: schema.maxPageBytes,
    maxBindings: schema.maxBindings,
    maxEventsPerSample: schema.maxEventsPerSample,
    identity
  });
}
function isMaterialSurfaceDeclaration(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const declaration = value;
  if (declaration.model !== "standard" && declaration.model !== "single-layer-medium" || typeof declaration.module !== "string" || declaration.module.length === 0) {
    return false;
  }
  if (declaration.dynamicInput === void 0) return true;
  if (declaration.dynamicInput === null || typeof declaration.dynamicInput !== "object") {
    return false;
  }
  return deriveMaterialDynamicInputLayout(declaration.dynamicInput).ok;
}

// src/material/asset.ts
function resolveMaterialTextureCoordinates(coordinates) {
  return {
    set: coordinates?.set ?? 0,
    transform: {
      offset: coordinates?.transform?.offset ?? [0, 0],
      scale: coordinates?.transform?.scale ?? [1, 1],
      rotation: coordinates?.transform?.rotation ?? 0
    }
  };
}
var MATERIAL_CHILD_FORBIDDEN_FIELDS = [
  "colorSpace",
  "passes",
  "parameters",
  "surface"
];
function hasOwn(value, field) {
  return Object.hasOwn(value, field);
}
function materialChildForbiddenFields(asset) {
  if (asset.parent === void 0) return [];
  return MATERIAL_CHILD_FORBIDDEN_FIELDS.filter((field) => hasOwn(asset, field));
}
function materialParentText(value) {
  if (typeof value === "string") return value;
  if (value instanceof Uint8Array) {
    return Array.from(value, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return String(value);
}
var MaterialAssetContractError = class extends Error {
  code = "material-authoring-field-forbidden";
  expected = "material authoring contains only runtime values and source-owned module selection";
  hint = "remove the compiler macro field and use a runtime value, module slot, or compiler context";
  detail;
  constructor(detail) {
    super(`${detail.field}: material compiler macro fields are not supported`);
    this.name = "MaterialAssetContractError";
    this.detail = { code: "material-authoring-field-forbidden", ...detail };
  }
};
var MaterialChildContractError = class extends Error {
  code = "material-child-contract-invalid";
  expected = MATERIAL_ERROR_EXPECTED["material-child-contract-invalid"];
  hint = MATERIAL_ERROR_HINTS["material-child-contract-invalid"];
  detail;
  constructor(detail) {
    super(`${detail.material}: parent-bearing material contains forbidden fields`);
    this.name = "MaterialChildContractError";
    this.detail = { code: "material-child-contract-invalid", ...detail };
  }
};
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function assertMaterialAsset(value, context = "material") {
  if (!isRecord(value) || value.kind !== "material") {
    throw new Error(`${context}: expected a material asset`);
  }
  for (const field of Object.keys(value)) {
    if (![
      "kind",
      "colorSpace",
      "parent",
      "passes",
      "parameters",
      "values",
      "particleInputs",
      "surface"
    ].includes(field)) {
      throw new MaterialAssetContractError({
        owner: field === "features" || field === "defines" ? "material-authoring" : "material-runtime",
        field,
        actual: value[field],
        action: "remove-field"
      });
    }
  }
  const forbidden = materialChildForbiddenFields(value);
  if (forbidden.length > 0) {
    throw new MaterialChildContractError({
      material: context,
      parent: materialParentText(value.parent),
      forbidden,
      action: "remove-forbidden-fields"
    });
  }
  if (value.colorSpace !== void 0 && value.colorSpace !== "srgb" && value.colorSpace !== "linear") {
    throw new Error(`${context}: invalid colorSpace`);
  }
  if (value.passes !== void 0) {
    if (!Array.isArray(value.passes) || value.passes.length === 0) {
      throw new Error(`${context}: passes must be a non-empty array`);
    }
    for (const [index, pass] of value.passes.entries()) {
      if (!isRecord(pass) || typeof pass.name !== "string" || !isRecord(pass.program)) {
        throw new Error(`${context}: pass ${index} is malformed`);
      }
      if (typeof pass.program.module !== "string" || pass.program.module.length === 0) {
        throw new Error(`${context}: pass ${index} has no module identity`);
      }
      if (pass.program.vertexEntry !== void 0 && typeof pass.program.vertexEntry !== "string" || pass.program.fragmentEntry !== void 0 && typeof pass.program.fragmentEntry !== "string") {
        throw new Error(`${context}: pass ${index} has malformed entry points`);
      }
      if (pass.program.moduleSlots !== void 0) {
        if (!isRecord(pass.program.moduleSlots)) {
          throw new Error(`${context}: pass ${index} has malformed module slots`);
        }
        for (const [name, slot] of Object.entries(pass.program.moduleSlots)) {
          if (typeof slot !== "string")
            throw new Error(`${context}: module slot ${name} is not a string`);
        }
      }
    }
  }
  if (value.parameters !== void 0) {
    if (!Array.isArray(value.parameters))
      throw new Error(`${context}: parameters must be an array`);
    for (const [index, parameter] of value.parameters.entries()) {
      if (!isRecord(parameter) || typeof parameter.name !== "string" || typeof parameter.type !== "string") {
        throw new Error(`${context}: parameter ${index} is malformed`);
      }
      if (parameter.colorSpace !== void 0 && parameter.colorSpace !== "srgb" && parameter.colorSpace !== "linear") {
        throw new Error(`${context}: parameter ${index} has invalid colorSpace`);
      }
      if ("static" in parameter) {
        throw new MaterialAssetContractError({
          owner: "material-authoring",
          field: "parameters.static",
          actual: parameter.static,
          action: "remove-field"
        });
      }
    }
  }
  if (value.particleInputs !== void 0) {
    if (!Array.isArray(value.particleInputs) || value.particleInputs.length > 4) {
      throw new Error(`${context}: particleInputs must contain at most four entries`);
    }
    const names = /* @__PURE__ */ new Set();
    const lanes = /* @__PURE__ */ new Set();
    for (const [index, input] of value.particleInputs.entries()) {
      if (!isRecord(input) || typeof input.name !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(input.name) || !["f32", "vec2<f32>", "vec3<f32>", "vec4<f32>"].includes(String(input.type)) || !["vertex", "fragment", "vertex-fragment"].includes(String(input.visibility)) || !Number.isInteger(input.lane) || input.lane < 0 || input.lane >= 4) {
        throw new Error(`${context}: particle input ${index} is malformed`);
      }
      if (names.has(input.name) || lanes.has(input.lane)) {
        throw new Error(`${context}: duplicate particle input ${input.name}`);
      }
      names.add(input.name);
      lanes.add(input.lane);
    }
  }
  if (value.surface !== void 0) {
    if (!isRecord(value.surface)) throw new Error(`${context}: surface must be an object`);
    if (value.surface.model !== "standard" && value.surface.model !== "single-layer-medium") {
      throw new Error(`${context}: invalid Surface model`);
    }
    if (typeof value.surface.module !== "string" || value.surface.module.length === 0) {
      throw new Error(`${context}: Surface module must be a non-empty string`);
    }
    if (value.surface.dynamicInput !== void 0) {
      const dynamic = value.surface.dynamicInput;
      if (!isRecord(dynamic)) {
        throw new Error(`${context}: dynamicInput must be an object`);
      }
      const layout = deriveMaterialDynamicInputLayout(
        dynamic
      );
      if (!layout.ok) {
        throw new Error(`${context}: dynamicInput ${layout.error.code}: ${layout.error.expected}`);
      }
    }
  }
}

// src/material/color-space.ts
function srgbChannelToLinear(value) {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}
function linearChannelToSrgb(value) {
  return value <= 31308e-7 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;
}
function authoredColorToLinear(value, colorSpace = "srgb") {
  if (colorSpace === "linear") return [...value];
  return value.map((channel, index) => index < 3 ? srgbChannelToLinear(channel) : channel);
}
function materialParameterColorSpace(parameter, assetColorSpace) {
  const isColor = parameter.type === "color" || parameter.colorSpace !== void 0;
  if (!isColor) return void 0;
  return assetColorSpace ?? parameter.colorSpace ?? "srgb";
}
function materialValuesToLinearRuntime(values, parameters, assetColorSpace) {
  if (values === void 0) return {};
  const colorSpaces = /* @__PURE__ */ new Map();
  for (const parameter of parameters) {
    const colorSpace = materialParameterColorSpace(parameter, assetColorSpace);
    if (colorSpace !== void 0) colorSpaces.set(parameter.name, colorSpace);
  }
  const runtimeValues = {};
  for (const [name, value] of Object.entries(values)) {
    const colorSpace = colorSpaces.get(name);
    runtimeValues[name] = colorSpace !== void 0 && Array.isArray(value) ? authoredColorToLinear(value, colorSpace) : value;
  }
  return runtimeValues;
}

// src/material/standard-layer-plan.ts
var STANDARD_LAYER_PARAMETER_GROUPS = Object.freeze({
  anisotropy: ["anisotropyStrength", "anisotropyRotation"],
  iridescence: [
    "iridescence",
    "iridescenceIor",
    "iridescenceThicknessMinimum",
    "iridescenceThicknessMaximum"
  ],
  sheen: ["sheenColor", "sheenRoughness"],
  clearcoat: ["clearcoat", "clearcoatRoughness"]
});
var STANDARD_PHYSICAL_TEXTURE_FIELDS = [
  "clearcoatTexture",
  "clearcoatRoughnessTexture",
  "clearcoatNormalTexture",
  "anisotropyTexture",
  "sheenColorTexture",
  "sheenRoughnessTexture",
  "iridescenceTexture",
  "iridescenceThicknessTexture",
  "specularTexture",
  "specularColorTexture"
];
function standardPhysicalTextureFields(schema) {
  const names = new Set(schema.map((entry) => entry.name));
  return STANDARD_PHYSICAL_TEXTURE_FIELDS.filter((field) => names.has(field));
}
var STANDARD_PHYSICAL_PARAMETER_NAMES = /* @__PURE__ */ new Set([
  ...STANDARD_LAYER_PARAMETER_GROUPS.anisotropy,
  ...STANDARD_LAYER_PARAMETER_GROUPS.iridescence,
  ...STANDARD_LAYER_PARAMETER_GROUPS.sheen,
  ...STANDARD_LAYER_PARAMETER_GROUPS.clearcoat,
  "clearcoatNormalScale",
  ...STANDARD_PHYSICAL_TEXTURE_FIELDS
]);
var STANDARD_TRANSMISSION_PARAMETER_NAMES = /* @__PURE__ */ new Set([
  "transmission",
  "ior",
  "thickness",
  "attenuationColor",
  "attenuationDistance",
  "transmissionTexture",
  "thicknessTexture"
]);
var MaterialPhysicalContractError = class extends Error {
  code = "material-physical-contract-invalid";
  expected = "the Standard physical contract contains complete declared layers and valid passes";
  hint = "repair the root parameters or pass policy and derive the material again";
  detail;
  constructor(detail) {
    super(`${detail.layer}: Standard physical contract is invalid (${detail.reason})`);
    this.name = "MaterialPhysicalContractError";
    this.detail = { code: "material-physical-contract-invalid", ...detail };
  }
};
var LAYER_PARAMETERS = [
  { name: "anisotropy", parameters: STANDARD_LAYER_PARAMETER_GROUPS.anisotropy },
  { name: "iridescence", parameters: STANDARD_LAYER_PARAMETER_GROUPS.iridescence },
  { name: "sheen", parameters: STANDARD_LAYER_PARAMETER_GROUPS.sheen },
  { name: "clearcoat", parameters: STANDARD_LAYER_PARAMETER_GROUPS.clearcoat }
];
function planIdentity(mode, layers, passFamily) {
  return `standard-layer-plan-v1:${mode}:${layers.map((layer) => `${layer.name}(${layer.parameters.join(",")})`).join("|")}:${passFamily.join(",")}`;
}
function invalid(detail) {
  return new MaterialPhysicalContractError(detail);
}
function deriveStandardLayerPlan(parameters, passes) {
  const names = new Set(parameters.map((parameter) => parameter.name));
  const layers = [];
  for (const layer of LAYER_PARAMETERS) {
    const present = layer.parameters.filter((name) => names.has(name));
    if (present.length === 0) continue;
    if (present.length !== layer.parameters.length) {
      throw invalid({
        material: "Standard",
        layer: layer.name,
        missing: layer.parameters.filter((name) => !names.has(name)),
        reason: "incomplete-layer"
      });
    }
    layers.push(layer);
  }
  const hasPhysicalTexture = STANDARD_PHYSICAL_TEXTURE_FIELDS.some((field) => names.has(field));
  const mode = layers.length === 0 && !hasPhysicalTexture ? "base-only" : "physical";
  const passFamily = mode === "base-only" ? ["forward", "deferred", "shadow"] : ["forward", "shadow"];
  if (mode === "physical") {
    const deferredPass = passes?.find((pass) => {
      const tags = pass.renderState?.tags;
      return pass.name === "deferred" || typeof tags === "object" && tags !== null && "LightMode" in tags && tags.LightMode === "Deferred";
    });
    if (deferredPass !== void 0) {
      throw invalid({
        material: "Standard",
        layer: layers[0]?.name ?? "root",
        pass: deferredPass.name,
        reason: "deferred-pass"
      });
    }
  }
  return Object.freeze({
    mode,
    layers,
    passFamily,
    identity: planIdentity(mode, layers, passFamily)
  });
}
function isMaterialPhysicalContractError(value) {
  return value instanceof MaterialPhysicalContractError || typeof value === "object" && value !== null && "code" in value && value.code === "material-physical-contract-invalid";
}
function materialPhysicalContractResult(detail) {
  return createMaterialError("material-physical-contract-invalid", {
    code: "material-physical-contract-invalid",
    ...detail
  });
}

// src/material/resolve.ts
function assetGuidBytesToDashForm(value) {
  const hex = Array.from(value, (byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
}
function materialGuidText(value) {
  return typeof value === "string" ? value : assetGuidBytesToDashForm(value);
}
function valueType(value) {
  if (typeof value === "boolean") return "bool";
  if (typeof value === "number") return "number";
  if (typeof value === "string") return "string";
  if (Array.isArray(value)) return `vec${value.length}`;
  return "texture";
}
function parameterTypeMatches(parameter, value) {
  switch (parameter.type) {
    case "bool":
      return typeof value === "boolean";
    case "f32":
    case "i32":
    case "u32":
      return typeof value === "number";
    case "vec2":
      return Array.isArray(value) && value.length === 2;
    case "vec3":
      return Array.isArray(value) && value.length === 3;
    case "vec4":
    case "color":
      return Array.isArray(value) && value.length === 4;
    case "texture":
    case "texture_cube":
      return typeof value === "string" || typeof value === "number" && Number.isInteger(value) && value >= 0 || typeof value === "object" && !Array.isArray(value);
  }
}
function validateValues(material, values, parameters) {
  if (parameters === void 0) return ok(true);
  const declarations = new Map(parameters.map((parameter) => [parameter.name, parameter]));
  for (const [name, value] of Object.entries(values)) {
    const parameter = declarations.get(name);
    if (parameter === void 0) {
      return err(
        createMaterialError("material-value-unknown", {
          code: "material-value-unknown",
          material,
          parameter: name
        })
      );
    }
    if (value === null) {
      if (!parameter.optional) {
        return err(
          createMaterialError("material-value-type-mismatch", {
            code: "material-value-type-mismatch",
            material,
            parameter: name,
            expectedType: parameter.type,
            actualType: "null"
          })
        );
      }
      continue;
    }
    if (!parameterTypeMatches(parameter, value)) {
      return err(
        createMaterialError("material-value-type-mismatch", {
          code: "material-value-type-mismatch",
          material,
          parameter: name,
          expectedType: parameter.type,
          actualType: valueType(value)
        })
      );
    }
  }
  return ok(true);
}
function mergeMaterial(parent, child) {
  const values = {};
  for (const [name, value] of Object.entries(parent.values ?? {})) {
    if (value !== null) values[name] = value;
  }
  for (const [name, value] of Object.entries(child.values ?? {})) {
    if (value === null) delete values[name];
    else values[name] = value;
  }
  const particleInputs = parent.particleInputs ?? child.particleInputs;
  return {
    kind: "material",
    ...parent.colorSpace !== void 0 ? { colorSpace: parent.colorSpace } : {},
    ...parent.passes !== void 0 && parent.passes.length > 0 ? { passes: parent.passes } : {},
    ...parent.parameters !== void 0 ? { parameters: parent.parameters } : {},
    ...particleInputs === void 0 ? {} : { particleInputs },
    ...parent.surface === void 0 ? {} : { surface: parent.surface },
    ...Object.keys(values).length > 0 ? { values } : {}
  };
}
function validateChildParameters(material, parent, child) {
  if (child === void 0) return ok(true);
  const parentByName = new Map((parent ?? []).map((parameter) => [parameter.name, parameter]));
  const extras = child.filter((parameter) => !parentByName.has(parameter.name)).map((p) => p.name);
  const conflicts = child.filter((parameter) => parentByName.get(parameter.name)?.type !== parameter.type).map((parameter) => parameter.name);
  if (extras.length === 0 && conflicts.length === 0) return ok(true);
  return err(
    materialPhysicalContractResult({
      material,
      layer: "root",
      ...extras.length === 0 ? {} : { missing: extras },
      ...conflicts.length === 0 ? {} : { conflicting: conflicts },
      reason: "child-parameter"
    })
  );
}
function resolveChain(id, leaf, table, stack) {
  if (stack.includes(id)) {
    return err(
      createMaterialError("material-circular-inheritance", {
        code: "material-circular-inheritance",
        leaf,
        chain: [...stack, id]
      })
    );
  }
  const current = table[id];
  if (current === void 0) {
    return err(
      createMaterialError("material-parent-not-found", {
        code: "material-parent-not-found",
        leaf,
        missingParent: id,
        chain: [...stack, id]
      })
    );
  }
  const parent = current.parent === void 0 ? void 0 : materialGuidText(current.parent);
  if (parent === void 0) {
    if (current.passes === void 0 || current.passes.length === 0) {
      return err(
        createMaterialError("material-no-effective-pass", {
          code: "material-no-effective-pass",
          material: leaf
        })
      );
    }
    const values = {};
    for (const [name, value] of Object.entries(current.values ?? {})) {
      if (value !== null) values[name] = value;
    }
    const valid2 = validateValues(id, values, current.parameters);
    if (!valid2.ok) return valid2;
    return ok({ leaf, chain: [id], asset: { ...current, values } });
  }
  const forbidden = materialChildForbiddenFields(current);
  if (forbidden.length > 0) {
    return err(
      createMaterialError("material-child-contract-invalid", {
        code: "material-child-contract-invalid",
        material: id,
        parent,
        forbidden,
        action: "remove-forbidden-fields"
      })
    );
  }
  const parentResult = resolveChain(parent, leaf, table, [...stack, id]);
  if (!parentResult.ok) return parentResult;
  const parameterContract = validateChildParameters(
    id,
    parentResult.value.asset.parameters,
    current.parameters
  );
  if (!parameterContract.ok) return parameterContract;
  const valid = validateValues(id, current.values ?? {}, parentResult.value.asset.parameters);
  if (!valid.ok) return valid;
  const merged = mergeMaterial(parentResult.value.asset, current);
  if (merged.passes === void 0 || merged.passes.length === 0) {
    return err(
      createMaterialError("material-no-effective-pass", {
        code: "material-no-effective-pass",
        material: leaf
      })
    );
  }
  return ok({ leaf, chain: [...parentResult.value.chain, id], asset: merged });
}
function resolveMaterialAsset(leaf, table) {
  return resolveChain(leaf, leaf, table, []);
}

// src/material/standard-schema.ts
var STANDARD_MATERIAL_PARAM_SCHEMA = [
  { name: "baseColor", type: "color", default: [1, 1, 1, 1] },
  { name: "metallic", type: "f32", default: 0 },
  { name: "roughness", type: "f32", default: 0.5 },
  { name: "metallicChannel", type: "f32", default: 2 },
  { name: "roughnessChannel", type: "f32", default: 1 },
  { name: "aoChannel", type: "f32", default: 0 },
  { name: "extraChannel", type: "f32", default: 0 },
  { name: "emissive", type: "vec3", colorSpace: "srgb", default: [0, 0, 0] },
  { name: "emissiveIntensity", type: "f32", default: 0 },
  { name: "occlusionStrength", type: "f32", default: 1 },
  { name: "alphaCutoff", type: "f32", default: 0 },
  { name: "specular", type: "f32", default: 1 },
  { name: "specularColor", type: "vec3", colorSpace: "srgb", default: [1, 1, 1] },
  { name: "normalScale", type: "f32", default: 1 },
  { name: "transmission", type: "f32", default: 0 },
  { name: "ior", type: "f32", default: 1.5 },
  { name: "thickness", type: "f32", default: 0 },
  { name: "attenuationColor", type: "vec3", colorSpace: "linear", default: [1, 1, 1] },
  { name: "attenuationDistance", type: "f32" },
  { name: "baseColorTexture", type: "texture2d" },
  { name: "metallicRoughnessTexture", type: "texture2d" },
  { name: "normalTexture", type: "texture2d" },
  { name: "specularColorTexture", type: "texture2d" },
  { name: "emissiveTexture", type: "texture2d" },
  { name: "occlusionTexture", type: "texture2d" },
  { name: "transmissionTexture", type: "texture2d" },
  { name: "thicknessTexture", type: "texture2d" },
  { name: "anisotropyStrength", type: "f32", default: 0 },
  { name: "anisotropyRotation", type: "f32", default: 0 },
  { name: "iridescence", type: "f32", default: 0 },
  { name: "iridescenceIor", type: "f32", default: 1.3 },
  { name: "iridescenceThicknessMinimum", type: "f32", default: 100 },
  { name: "iridescenceThicknessMaximum", type: "f32", default: 400 },
  { name: "sheenColor", type: "vec3", colorSpace: "linear", default: [0, 0, 0] },
  { name: "sheenRoughness", type: "f32", default: 0 },
  { name: "clearcoat", type: "f32", default: 0 },
  { name: "clearcoatRoughness", type: "f32", default: 0 },
  { name: "clearcoatNormalScale", type: "f32", default: 1 },
  { name: "clearcoatTexture", type: "texture2d" },
  { name: "clearcoatRoughnessTexture", type: "texture2d" },
  { name: "clearcoatNormalTexture", type: "texture2d" },
  { name: "anisotropyTexture", type: "texture2d" },
  { name: "sheenColorTexture", type: "texture2d" },
  { name: "sheenRoughnessTexture", type: "texture2d" },
  { name: "iridescenceTexture", type: "texture2d" },
  { name: "iridescenceThicknessTexture", type: "texture2d" },
  { name: "specularTexture", type: "texture2d" }
];
var STANDARD_SURFACE_PARAM_SCHEMA = STANDARD_MATERIAL_PARAM_SCHEMA.filter(
  (entry) => !STANDARD_PHYSICAL_PARAMETER_NAMES.has(entry.name) && (!STANDARD_TRANSMISSION_PARAMETER_NAMES.has(entry.name) || entry.name === "ior")
);
function standardMaterialParameters(names) {
  return STANDARD_MATERIAL_PARAM_SCHEMA.filter((entry) => names.has(entry.name)).map((entry) => {
    const type = entry.type === "texture2d" ? "texture" : entry.type;
    const isRequired = entry.name === "baseColor" || entry.name === "metallic" || entry.name === "roughness";
    const defaultValue = entry.type === "texture2d" || entry.default === void 0 ? {} : { default: entry.default };
    return {
      name: entry.name,
      type,
      ...!("colorSpace" in entry) || entry.colorSpace === void 0 ? {} : { colorSpace: entry.colorSpace },
      ...defaultValue,
      ...isRequired ? {} : { optional: true }
    };
  });
}
function standardSurfaceParameters(parameters) {
  const authoredNames = new Set(parameters.map((parameter) => parameter.name));
  const implicitNames = new Set(STANDARD_SURFACE_PARAM_SCHEMA.map((entry) => entry.name));
  const implicit = standardMaterialParameters(implicitNames).map((parameter) => ({
    ...parameter,
    optional: true
  }));
  return [...implicit.filter((parameter) => !authoredNames.has(parameter.name)), ...parameters];
}

// src/derive-paramschema.ts
var FRAGMENT = 2;
var NUMERIC_TYPES = /* @__PURE__ */ new Set([
  "f32",
  "i32",
  "u32",
  "vec2",
  "vec3",
  "vec4",
  "color"
]);
var TEXTURE_VIEW_TYPES = /* @__PURE__ */ new Set([
  "texture2d",
  "texture2d_array",
  "texture3d",
  "texture_cube",
  "texture_depth_2d",
  "texture_cube_array"
]);
var SAMPLER_TYPES = /* @__PURE__ */ new Set([
  "sampler",
  "sampler_comparison"
]);
var ALL_TYPES = /* @__PURE__ */ new Set([
  ...NUMERIC_TYPES,
  ...TEXTURE_VIEW_TYPES,
  ...SAMPLER_TYPES,
  "storage_buffer"
]);
function numericFootprint(t) {
  switch (t) {
    case "f32":
    case "i32":
    case "u32":
      return { size: 4, align: 4 };
    case "vec2":
      return { size: 8, align: 8 };
    case "vec3":
      return { size: 12, align: 16 };
    case "vec4":
    case "color":
      return { size: 16, align: 16 };
  }
}
function alignUp(value, alignment) {
  return value + alignment - 1 & ~(alignment - 1);
}
function textureBglDescriptor(t) {
  switch (t) {
    case "texture2d":
      return { sampleType: "float", viewDimension: "2d" };
    case "texture2d_array":
      return { sampleType: "float", viewDimension: "2d-array" };
    case "texture3d":
      return { sampleType: "float", viewDimension: "3d" };
    case "texture_cube":
      return { sampleType: "float", viewDimension: "cube" };
    case "texture_depth_2d":
      return { sampleType: "depth", viewDimension: "2d" };
    case "texture_cube_array":
      return { sampleType: "float", viewDimension: "cube-array" };
    case "sampler":
    case "sampler_comparison":
      throw new Error(`derive: textureBglDescriptor called on sampler-family type '${t}'`);
  }
}
function samplerBindingType(t) {
  return t === "sampler" ? "filtering" : "comparison";
}
var ADMITTED_PARAM_SCHEMA_PROJECTIONS = /* @__PURE__ */ new WeakMap();
var UNADMITTED_PARAM_SCHEMA_PROJECTIONS = /* @__PURE__ */ new WeakMap();
var ParamSchemaProjectionOwner = class {
  #projections = /* @__PURE__ */ new Map();
  #admissions = 0;
  #derivations = 0;
  admit(args) {
    if (args.ownerId.length === 0) {
      throw new Error("ParamSchemaProjectionOwner: ownerId must be non-empty");
    }
    if (!Number.isSafeInteger(args.revision) || args.revision < 1) {
      throw new Error("ParamSchemaProjectionOwner: revision must be a positive safe integer");
    }
    this.#admissions += 1;
    const key = `${args.ownerId}\0${args.revision}`;
    const canonicalSchema = JSON.stringify(args.schema);
    const existing = this.#projections.get(key);
    if (existing !== void 0) {
      if (existing.canonicalSchema !== canonicalSchema) {
        throw new Error(
          `ParamSchemaProjectionOwner: ${args.ownerId}@${args.revision} reused with different schema content`
        );
      }
      return existing;
    }
    const schema = freezeParamSchema(args.schema);
    const derivedInterface = freezeDerivedMaterialInterface(derivePure(schema));
    this.#derivations += 1;
    ADMITTED_PARAM_SCHEMA_PROJECTIONS.set(schema, derivedInterface);
    const projection = Object.freeze({
      ownerId: args.ownerId,
      revision: args.revision,
      schema,
      derivedInterface,
      canonicalSchema
    });
    this.#projections.set(key, projection);
    return projection;
  }
  get(ownerId, revision) {
    return this.#projections.get(`${ownerId}\0${revision}`);
  }
  stats() {
    return Object.freeze({
      admissions: this.#admissions,
      derivations: this.#derivations,
      projections: this.#projections.size
    });
  }
};
function derive(schema) {
  const admitted = ADMITTED_PARAM_SCHEMA_PROJECTIONS.get(schema);
  if (admitted !== void 0) return admitted;
  return deriveUnadmitted(schema).derivedInterface;
}
function deriveObserved(schema, observer, site) {
  const admitted = ADMITTED_PARAM_SCHEMA_PROJECTIONS.get(schema);
  if (admitted !== void 0) {
    if (observer.enabled) observer.observe({ kind: "admitted-identity-hit", site });
    return admitted;
  }
  const result = deriveUnadmitted(schema);
  if (observer.enabled) {
    observer.observe({
      kind: result.cacheHit ? "fallback-cache-hit" : "unregistered-fallback-derive",
      site
    });
    if (!result.cacheHit) observer.observe({ kind: "fallback-layout-sha", site });
  }
  return result.derivedInterface;
}
function deriveUnadmitted(schema) {
  const shape = captureParamSchemaShape(schema);
  const cached = UNADMITTED_PARAM_SCHEMA_PROJECTIONS.get(schema);
  if (cached !== void 0 && matchesParamSchemaShape(shape, cached.shape)) {
    return { cacheHit: true, derivedInterface: cached.derivedInterface };
  }
  const derivedInterface = freezeDerivedMaterialInterface(derivePure(schema, shape));
  UNADMITTED_PARAM_SCHEMA_PROJECTIONS.set(schema, { shape, derivedInterface });
  return { cacheHit: false, derivedInterface };
}
function captureParamSchemaShape(schema) {
  const names = new Array(schema.length);
  const types = new Array(schema.length);
  for (let index = 0; index < schema.length; index += 1) {
    const entry = schema[index];
    names[index] = entry.name;
    types[index] = entry.type;
  }
  return Object.freeze({ names: Object.freeze(names), types: Object.freeze(types) });
}
function matchesParamSchemaShape(current, cached) {
  if (current.names.length !== cached.names.length) return false;
  for (let index = 0; index < current.names.length; index += 1) {
    if (current.names[index] !== cached.names[index] || current.types[index] !== cached.types[index]) {
      return false;
    }
  }
  return true;
}
function derivePure(schema, shape = captureParamSchemaShape(schema)) {
  const bglEntries = [];
  const uboFields = [];
  const numericMembers = [];
  const coordinateRecords = [];
  const resourceBindings = [];
  const bindingSpans = [];
  const textureFieldNames = /* @__PURE__ */ new Set();
  const samplerForTexture = /* @__PURE__ */ new Map();
  const seenNames = /* @__PURE__ */ new Set();
  const reservedSamplerNames = /* @__PURE__ */ new Set();
  let nextBinding = 0;
  let uboCursor = 0;
  let uboBinding = null;
  const ensureUboBinding = () => {
    if (uboBinding !== null) return uboBinding;
    uboBinding = nextBinding;
    nextBinding += 1;
    bglEntries.push({
      binding: uboBinding,
      visibility: FRAGMENT,
      buffer: { type: "uniform" }
    });
    bindingSpans.push({ group: 1, binding: uboBinding, start: 0, end: 0 });
    return uboBinding;
  };
  for (let index = 0; index < shape.names.length; index += 1) {
    const name = shape.names[index];
    const type = shape.types[index];
    if (name.length === 0) {
      throw new Error("derive: schema entry name must be non-empty");
    }
    if (!ALL_TYPES.has(type)) {
      throw new Error(`derive: unrecognised paramSchema type literal '${type}'`);
    }
    if (seenNames.has(name)) {
      throw new Error(`derive: duplicate paramSchema entry name '${name}'`);
    }
    if (reservedSamplerNames.has(name)) {
      throw new Error(`derive: paramSchema entry '${name}' collides with auto-paired sampler name`);
    }
    seenNames.add(name);
    if (NUMERIC_TYPES.has(type)) {
      const numericType = type;
      const { size, align } = numericFootprint(numericType);
      ensureUboBinding();
      const offset = alignUp(uboCursor, align);
      uboFields.push({ name, offset, size, type: numericType });
      numericMembers.push({ name, offset, size, alignment: align, type: numericType });
      uboCursor = offset + size;
      continue;
    }
    if (TEXTURE_VIEW_TYPES.has(type)) {
      const texType = type;
      ensureUboBinding();
      const coordinateOffset = alignUp(uboCursor, 16);
      const coordinates = {
        parameter: name,
        offset: coordinateOffset,
        size: 32,
        alignment: 16,
        transformMember: `${name}CoordinatesTransform`,
        metadataMember: `${name}CoordinatesMetadata`
      };
      coordinateRecords.push(coordinates);
      uboCursor = coordinateOffset + coordinates.size;
      const { sampleType, viewDimension } = textureBglDescriptor(texType);
      const samplerName = `${name}_sampler`;
      if (seenNames.has(samplerName)) {
        throw new Error(
          `derive: auto-paired sampler name '${samplerName}' collides with existing entry`
        );
      }
      reservedSamplerNames.add(samplerName);
      samplerForTexture.set(name, samplerName);
      const samplerBinding = nextBinding;
      nextBinding += 1;
      bglEntries.push({
        binding: samplerBinding,
        visibility: FRAGMENT,
        sampler: { type: "filtering" }
      });
      bindingSpans.push({ group: 1, binding: samplerBinding, start: 0, end: 0 });
      resourceBindings.push({
        name: samplerName,
        parameter: name,
        kind: "sampler",
        binding: samplerBinding
      });
      const texBinding = nextBinding;
      nextBinding += 1;
      bglEntries.push({
        binding: texBinding,
        visibility: FRAGMENT,
        texture: { sampleType, viewDimension, multisampled: false }
      });
      bindingSpans.push({ group: 1, binding: texBinding, start: 0, end: 0 });
      resourceBindings.push({
        name,
        parameter: name,
        kind: "texture",
        binding: texBinding
      });
      textureFieldNames.add(name);
      continue;
    }
    if (SAMPLER_TYPES.has(type)) {
      const samplerType = type;
      const samplerBinding = nextBinding;
      nextBinding += 1;
      bglEntries.push({
        binding: samplerBinding,
        visibility: FRAGMENT,
        sampler: { type: samplerBindingType(samplerType) }
      });
      bindingSpans.push({ group: 1, binding: samplerBinding, start: 0, end: 0 });
      resourceBindings.push({
        name,
        parameter: name,
        kind: "sampler",
        binding: samplerBinding
      });
      continue;
    }
    const storageBinding = nextBinding;
    nextBinding += 1;
    bglEntries.push({
      binding: storageBinding,
      visibility: FRAGMENT,
      buffer: { type: "read-only-storage" }
    });
    bindingSpans.push({ group: 1, binding: storageBinding, start: 0, end: 0 });
    resourceBindings.push({
      name,
      parameter: name,
      kind: "storage-buffer",
      binding: storageBinding
    });
  }
  const totalBytes = uboCursor === 0 ? 0 : alignUp(uboCursor, 16);
  const uniformSpan = bindingSpans.find((span) => span.binding === uboBinding);
  if (uniformSpan !== void 0) {
    const index = bindingSpans.indexOf(uniformSpan);
    bindingSpans[index] = { ...uniformSpan, end: totalBytes };
  }
  const userRegion = { group: 1, bindingStart: 0, bindingEnd: nextBinding };
  const layoutIdentity = sha256LayoutIdentity({
    numericMembers,
    coordinateRecords,
    resourceBindings,
    totalBytes,
    bindingSpans,
    userRegion
  });
  return {
    schemaVersion: "material-abi/1",
    group: 1,
    visibility: FRAGMENT,
    bglEntries,
    uboLayout: { entries: uboFields, totalBytes },
    numericMembers,
    coordinateRecords,
    resourceBindings,
    totalBytes,
    layoutIdentity,
    textureFieldNames,
    samplerForTexture,
    userRegionBindingEnd: nextBinding,
    bindingSpans,
    userRegion
  };
}
function freezeParamSchema(schema) {
  return Object.freeze(
    schema.map((entry) => {
      const defaultValue = cloneAndFreezeSchemaValue(entry.default);
      return Object.freeze({
        ...entry,
        ...entry.default === void 0 ? {} : { default: defaultValue }
      });
    })
  );
}
function cloneAndFreezeSchemaValue(value) {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => cloneAndFreezeSchemaValue(item)));
  }
  if (typeof value === "object" && value !== null) {
    return Object.freeze(
      Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, cloneAndFreezeSchemaValue(item)])
      )
    );
  }
  return value;
}
function freezeDerivedMaterialInterface(derived) {
  deepFreeze(derived.bglEntries);
  deepFreeze(derived.uboLayout);
  deepFreeze(derived.numericMembers);
  deepFreeze(derived.coordinateRecords);
  deepFreeze(derived.resourceBindings);
  deepFreeze(derived.bindingSpans);
  deepFreeze(derived.userRegion);
  return Object.freeze({
    ...derived,
    textureFieldNames: new ImmutableSetView(derived.textureFieldNames),
    samplerForTexture: new ImmutableMapView(derived.samplerForTexture)
  });
}
function deepFreeze(value) {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
var ImmutableSetView = class {
  #values;
  constructor(values) {
    this.#values = new Set(values);
    Object.freeze(this);
  }
  get size() {
    return this.#values.size;
  }
  has(value) {
    return this.#values.has(value);
  }
  entries() {
    return this.#values.entries();
  }
  keys() {
    return this.#values.keys();
  }
  values() {
    return this.#values.values();
  }
  forEach(callbackfn, thisArg) {
    for (const value of this.#values) callbackfn.call(thisArg, value, value, this);
  }
  [Symbol.iterator]() {
    return this.#values[Symbol.iterator]();
  }
};
var ImmutableMapView = class {
  #values;
  constructor(values) {
    this.#values = new Map(values);
    Object.freeze(this);
  }
  get size() {
    return this.#values.size;
  }
  get(key) {
    return this.#values.get(key);
  }
  has(key) {
    return this.#values.has(key);
  }
  entries() {
    return this.#values.entries();
  }
  keys() {
    return this.#values.keys();
  }
  values() {
    return this.#values.values();
  }
  forEach(callbackfn, thisArg) {
    for (const [key, value] of this.#values) callbackfn.call(thisArg, value, key, this);
  }
  [Symbol.iterator]() {
    return this.#values[Symbol.iterator]();
  }
};
function inferMaterialParameterKind(entry) {
  if (NUMERIC_TYPES.has(entry.type)) return "numeric";
  if (TEXTURE_VIEW_TYPES.has(entry.type)) return "texture";
  if (entry.type === "storage_buffer") return "storage-buffer";
  return "sampler";
}
function sha256LayoutIdentity(value) {
  const canonical = JSON.stringify({
    version: 1,
    numericMembers: value.numericMembers,
    coordinateRecords: value.coordinateRecords,
    resourceBindings: value.resourceBindings,
    totalBytes: value.totalBytes,
    bindingSpans: value.bindingSpans,
    userRegion: value.userRegion
  });
  return `sha256-${sha256(canonical)}`;
}
var SHA256_K = [
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
];
function sha256(input) {
  const bytes = new TextEncoder().encode(input);
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 128;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 4, bytes.length * 8, false);
  let hash = new Uint32Array([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);
  for (let block = 0; block < padded.length; block += 64) {
    const words = new Uint32Array(64);
    for (let index = 0; index < 16; index += 1)
      words[index] = view.getUint32(block + index * 4, false);
    for (let index = 16; index < 64; index += 1) {
      const a2 = words[index - 15] ?? 0;
      const b2 = words[index - 2] ?? 0;
      words[index] = smallSigma1(b2) + (words[index - 7] ?? 0) + smallSigma0(a2) + (words[index - 16] ?? 0) >>> 0;
    }
    let a = hash[0] ?? 0;
    let b = hash[1] ?? 0;
    let c = hash[2] ?? 0;
    let d = hash[3] ?? 0;
    let e = hash[4] ?? 0;
    let f = hash[5] ?? 0;
    let g = hash[6] ?? 0;
    let h = hash[7] ?? 0;
    for (let index = 0; index < 64; index += 1) {
      const choose = e & f ^ ~e & g;
      const majority = a & b ^ a & c ^ b & c;
      const t1 = h + bigSigma1(e) + choose + (SHA256_K[index] ?? 0) + (words[index] ?? 0) >>> 0;
      const t2 = bigSigma0(a) + majority >>> 0;
      [h, g, f, e, d, c, b, a] = [g, f, e, d + t1 >>> 0, c, b, a, t1 + t2 >>> 0];
    }
    const state = [a, b, c, d, e, f, g, h];
    hash = new Uint32Array(hash.map((value, index) => value + (state[index] ?? 0) >>> 0 >>> 0));
  }
  return Array.from(hash, (word) => word.toString(16).padStart(8, "0")).join("");
}
function rotateRight(value, shift) {
  return value >>> shift | value << 32 - shift;
}
function bigSigma0(value) {
  return rotateRight(value, 2) ^ rotateRight(value, 13) ^ rotateRight(value, 22);
}
function bigSigma1(value) {
  return rotateRight(value, 6) ^ rotateRight(value, 11) ^ rotateRight(value, 25);
}
function smallSigma0(value) {
  return rotateRight(value, 7) ^ rotateRight(value, 18) ^ value >>> 3;
}
function smallSigma1(value) {
  return rotateRight(value, 17) ^ rotateRight(value, 19) ^ value >>> 10;
}
var USER_REGION_TEXTURE_FIELDS = [
  "baseColorTexture",
  "metallicRoughnessTexture",
  "normalTexture"
];
function stripWgslComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}
function findUndeclaredSampledTextures(wgslSource, schema) {
  const declared = derive(schema).textureFieldNames;
  const clean = stripWgslComments(wgslSource);
  const sampleRe = /textureSample[A-Za-z]*\(\s*([A-Za-z_][A-Za-z0-9_]*)/g;
  const sampled = /* @__PURE__ */ new Set();
  for (let m = sampleRe.exec(clean); m !== null; m = sampleRe.exec(clean)) {
    const name = m[1];
    if (name !== void 0) sampled.add(name);
  }
  return USER_REGION_TEXTURE_FIELDS.filter((f) => sampled.has(f) && !declared.has(f));
}

// src/material-contracts.ts
var MATERIAL_PARAM_TYPES = [
  "f32",
  "i32",
  "u32",
  "vec2",
  "vec3",
  "vec4",
  "color",
  "texture2d",
  "texture2d_array",
  "texture3d",
  "texture_cube",
  "texture_depth_2d",
  "texture_cube_array",
  "sampler",
  "sampler_comparison",
  "storage_buffer"
];
var RenderQueue = {
  /** Skybox / backdrop draw, processed first. */
  Background: 1e3,
  /** Opaque geometry draw — default queue for solid surfaces. */
  Geometry: 2e3,
  /** Alpha-tested geometry (clip/discard in fragment shader) — drawn after opaque,
   *  before transparent to avoid overdraw. */
  AlphaTest: 2450,
  /** Transparent / alpha-blended geometry — drawn back-to-front after opaque pass. */
  Transparent: 3e3,
  /** Overlay / UI / debug lines — drawn last. */
  Overlay: 4e3
};
var KNOWN_PASS_KINDS = [
  "forward",
  "deferred",
  "temporal",
  "lighting",
  "shadow-caster",
  "point-shadow-caster",
  "post-process",
  "skybox"
];

// src/media-contracts.ts
var UV_ATTRIBUTE_KEYS = ["uv", "uv1", "uv2", "uv3", "uv4", "uv5", "uv6", "uv7"];
function countUvSets(attrs) {
  if (attrs === void 0) return 0;
  for (let i = UV_ATTRIBUTE_KEYS.length - 1; i >= 0; i--) {
    const v = attrs[UV_ATTRIBUTE_KEYS[i]];
    if (v instanceof Float32Array || v instanceof Uint16Array || v instanceof ArrayBuffer || Array.isArray(v)) {
      return i + 1;
    }
  }
  return 0;
}
function countExtraUvSets(attrs) {
  const total = countUvSets(attrs);
  return total > 0 ? total - 1 : 0;
}

// src/mesh-contracts.ts
function resolveMeshMaterialSlotDefaultGuid(slot, authoredDefaultMaterialGuid) {
  if (authoredDefaultMaterialGuid !== void 0) {
    return authoredDefaultMaterialGuid === null ? void 0 : authoredDefaultMaterialGuid;
  }
  return slot.defaultMaterialGuid;
}
function reconcileMeshMaterialSlotTopology(current, previous = []) {
  if (previous.length === 0) {
    return { ok: true, slots: [...current], currentToStableSlot: current.map((_, index) => index) };
  }
  const stable = previous.map((slot) => ({
    slotName: slot.slotName,
    ...slot.sourceKey === void 0 ? {} : { sourceKey: slot.sourceKey },
    tombstone: true
  }));
  const mapping = new Array(current.length).fill(-1);
  const usedPrevious = /* @__PURE__ */ new Set();
  const uniqueIndex = (slots, read) => {
    const first = /* @__PURE__ */ new Map();
    const duplicates = /* @__PURE__ */ new Set();
    slots.forEach((slot, index) => {
      const key = read(slot)?.trim();
      if (!key) return;
      if (first.has(key)) duplicates.add(key);
      else first.set(key, index);
    });
    for (const duplicate of duplicates) first.delete(duplicate);
    return first;
  };
  const match = (read) => {
    const oldByKey = uniqueIndex(previous, read);
    const nextByKey = uniqueIndex(current, read);
    for (const [key, nextIndex] of nextByKey) {
      if (mapping[nextIndex] !== -1) continue;
      const oldIndex = oldByKey.get(key);
      if (oldIndex === void 0 || usedPrevious.has(oldIndex)) continue;
      mapping[nextIndex] = oldIndex;
      usedPrevious.add(oldIndex);
    }
  };
  match((slot) => slot.sourceKey);
  match((slot) => slot.slotName);
  const unmatchedCurrent = mapping.map((oldIndex, index) => oldIndex === -1 ? index : -1).filter((index) => index !== -1);
  const unmatchedPrevious = previous.map((_, index) => usedPrevious.has(index) ? -1 : index).filter((index) => index !== -1);
  if (unmatchedCurrent.length === 1 && unmatchedPrevious.length === 1 && current[unmatchedCurrent[0]]?.sourceKey === void 0 && previous[unmatchedPrevious[0]]?.sourceKey === void 0) {
    mapping[unmatchedCurrent[0]] = unmatchedPrevious[0];
    usedPrevious.add(unmatchedPrevious[0]);
    unmatchedCurrent.length = 0;
    unmatchedPrevious.length = 0;
  }
  const identityInsufficient = unmatchedCurrent.some((index) => current[index]?.sourceKey === void 0) && unmatchedPrevious.some((index) => previous[index]?.sourceKey === void 0);
  if (unmatchedCurrent.length > 0 && unmatchedPrevious.length > 0 && identityInsufficient) {
    return {
      ok: false,
      error: {
        code: "mesh-material-slot-topology-change",
        previousIndices: unmatchedPrevious,
        nextIndices: unmatchedCurrent,
        hint: "name source materials uniquely or provide stable sourceKey values before reimport"
      }
    };
  }
  for (let currentIndex = 0; currentIndex < current.length; currentIndex++) {
    let stableIndex = mapping[currentIndex];
    if (stableIndex === -1) {
      stableIndex = stable.length;
      mapping[currentIndex] = stableIndex;
    }
    stable[stableIndex] = current[currentIndex];
  }
  return { ok: true, slots: stable, currentToStableSlot: mapping };
}
function migrateLegacyMeshMaterialOverrides(legacyOverrides, submeshes, materialSlotCount, context) {
  const inherited = typeof legacyOverrides[0] === "string" ? "" : 0;
  const overrides = new Array(materialSlotCount).fill(inherited);
  const sectionsBySlot = /* @__PURE__ */ new Map();
  for (let submeshIndex = 0; submeshIndex < submeshes.length; submeshIndex++) {
    const materialSlot = submeshes[submeshIndex]?.materialSlot;
    if (materialSlot === void 0 || materialSlot < 0 || materialSlot >= materialSlotCount)
      continue;
    const sections = sectionsBySlot.get(materialSlot) ?? [];
    sections.push(submeshIndex);
    sectionsBySlot.set(materialSlot, sections);
  }
  for (const [materialSlot, submeshIndices] of sectionsBySlot) {
    const handles = submeshIndices.map((index) => legacyOverrides[index] ?? inherited);
    const distinct2 = [...new Set(handles)];
    if (distinct2.length > 1) {
      return {
        ok: false,
        error: {
          code: "mesh-material-slot-override-conflict",
          ...context,
          materialSlot,
          submeshIndices,
          ...typeof handles[0] === "string" ? { overrideGuids: handles } : { overrideHandles: handles },
          hint: "split the source slot or choose one override explicitly before v2 to v3 recook"
        }
      };
    }
    overrides[materialSlot] = distinct2[0] ?? inherited;
  }
  return { ok: true, overrides };
}

// src/physics-contracts.ts
var PhysicsError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    super(`[PhysicsError ${args.code}] expected: ${args.expected}; hint: ${args.hint}`);
    this.name = "PhysicsError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    if (args.detail !== void 0) {
      this.detail = args.detail;
    }
  }
};
var PHYSICS_ERROR_HINTS = {
  "wasm-load-failed": "dynamic import() of Rapier WASM rejected; check network, file path, and that @dimforge/rapier3d-compat is installed",
  "wasm-simd-unsupported": "WebAssembly.validate returned false for the SIMD test module; ensure browser supports WASM SIMD (Chrome 91+, Firefox 89+, Safari 16.4+)",
  "step-failed": "Rapier World.step threw a WASM trap; check for invalid body parameters or NaN values in transforms",
  "invalid-body-config": "check mass > 0 for dynamic bodies and valid shape parameters; see PhysicsError.detail.field",
  "body-not-found": "the entity handle did not resolve to a Rapier rigid body; ensure RigidBody was spawned before calling physics APIs",
  "collider-not-found": "the entity handle did not resolve to a Rapier collider; ensure Collider was spawned before calling physics APIs",
  "backend-not-registered": "PhysicsWorld resource not found; use createApp(canvas, { plugins: [physicsPlugin('rapier-3d')] }) or manually register a backend",
  "teleport-invalid-body-type": "teleport is only valid for dynamic bodies; static and kinematic bodies have their position managed differently",
  "controller-requires-kinematic": "moveAndSlide requires a kinematic RigidBody; set the entity's RigidBody.type to 'kinematic'"
};

// src/runtime-scope.ts
var RUNTIME_ASSET_BINDING_SCHEMA = "runtime-asset-binding-v1";
var RUNTIME_CATALOG_SNAPSHOT_SCHEMA = "runtime-catalog-snapshot-v1";
function isRuntimeCatalogRoots(value) {
  return Array.isArray(value) && value.every(
    (root) => root !== null && typeof root === "object" && typeof root.root === "string" && typeof root.catalogPrefix === "string"
  );
}
function runtimeScopePath(binding, suffix = "") {
  const normalized = suffix.length === 0 ? "" : `/${suffix.replace(/^\/+/, "")}`;
  return `/__pack/scopes/${encodeURIComponent(binding.scopeId)}/${binding.generation}${normalized}`;
}
function createStandaloneRuntimeAssetBinding(gameId, scopeId = gameId, basePath = "") {
  const normalizedBase = basePath === "/" ? "" : basePath.replace(/\/+$/, "");
  const identity = { scopeId, generation: 1 };
  const scopedPath = runtimeScopePath(identity);
  const hostPrefix = normalizedBase.startsWith("/") ? normalizedBase : `/${normalizedBase}`;
  const prefix = normalizedBase.length === 0 ? "" : hostPrefix;
  return {
    schemaVersion: RUNTIME_ASSET_BINDING_SCHEMA,
    gameId,
    scopeId,
    generation: identity.generation,
    status: "ready",
    catalogUrl: `${prefix}${scopedPath}/catalog.json`,
    importUrlBase: `${prefix}${scopedPath}/import`,
    packageUrlBase: prefix
  };
}
function runtimeScopeMatches(binding, scopeId, generation) {
  return binding?.scopeId === scopeId && binding.generation === generation;
}

// src/texture/errors.ts
var TEXTURE_ERROR_HINTS = {
  "texture-shape-invalid": "repair the source extent and re-import the same texture GUID",
  "texture-packing-invalid": "rebuild the producer output with canonical mip-major packing",
  "texture-mip-policy-invalid": "use none or packed for this texture shape",
  "texture-format-dimension-unsupported": "choose a format supported by the requested texture dimension"
};
function textureError(code, detail, expected) {
  return {
    code,
    expected,
    hint: TEXTURE_ERROR_HINTS[code],
    detail
  };
}
function validateTextureShape(shape, mips, format) {
  const extent = shape.extent;
  for (const [field, value] of Object.entries(extent)) {
    if (!Number.isInteger(value) || value <= 0) {
      return err(
        textureError(
          "texture-shape-invalid",
          { code: "texture-shape-invalid", viewDimension: shape.viewDimension, extent, field },
          `${shape.viewDimension} ${field} must be a positive integer`
        )
      );
    }
  }
  if (mips?.kind === "packed" && (!Number.isInteger(mips.levelCount) || mips.levelCount <= 0)) {
    return err(
      textureError(
        "texture-mip-policy-invalid",
        {
          code: "texture-mip-policy-invalid",
          viewDimension: shape.viewDimension,
          policy: mips.kind
        },
        "packed mip policy requires a positive integer levelCount"
      )
    );
  }
  if (shape.viewDimension === "3d" && mips?.kind === "generate") {
    return err(
      textureError(
        "texture-mip-policy-invalid",
        {
          code: "texture-mip-policy-invalid",
          viewDimension: shape.viewDimension,
          policy: mips.kind
        },
        "3d textures require none or packed mip policy"
      )
    );
  }
  if (format !== void 0 && (format.startsWith("depth") || format.startsWith("stencil"))) {
    return err(
      textureError(
        "texture-format-dimension-unsupported",
        {
          code: "texture-format-dimension-unsupported",
          format,
          viewDimension: shape.viewDimension
        },
        "authored sampled textures cannot use depth or stencil formats"
      )
    );
  }
  if (format !== void 0 && shape.viewDimension === "3d" && isCompressedFormat(format)) {
    return err(
      textureError(
        "texture-format-dimension-unsupported",
        {
          code: "texture-format-dimension-unsupported",
          format,
          viewDimension: shape.viewDimension
        },
        "compressed 3d textures are not supported by this contract"
      )
    );
  }
  return ok(void 0);
}
function isCompressedFormat(format) {
  return format.startsWith("bc") || format.startsWith("etc2") || format.startsWith("eac") || format.startsWith("astc");
}

// src/texture/layout.ts
function formatLayout(format) {
  if (isCompressedFormat(format)) {
    if (format.startsWith("bc1") || format.startsWith("etc2-rgb8")) {
      return { bytesPerBlock: 8, blockWidth: 4, blockHeight: 4 };
    }
    return { bytesPerBlock: 16, blockWidth: 4, blockHeight: 4 };
  }
  switch (format) {
    case "r8unorm":
    case "r8snorm":
    case "r8uint":
    case "r8sint":
      return { bytesPerBlock: 1, blockWidth: 1, blockHeight: 1 };
    case "rg8unorm":
    case "rg8snorm":
    case "rg8uint":
    case "rg8sint":
    case "r16uint":
    case "r16sint":
    case "r16float":
      return { bytesPerBlock: 2, blockWidth: 1, blockHeight: 1 };
    case "rgba16uint":
    case "rgba16sint":
    case "rgba16float":
    case "rg32uint":
    case "rg32sint":
    case "rg32float":
      return { bytesPerBlock: 8, blockWidth: 1, blockHeight: 1 };
    case "rgba32uint":
    case "rgba32sint":
    case "rgba32float":
      return { bytesPerBlock: 16, blockWidth: 1, blockHeight: 1 };
    default:
      return { bytesPerBlock: 4, blockWidth: 1, blockHeight: 1 };
  }
}
function mipLevelCount(shape, mips) {
  if (mips.kind === "none") return 1;
  if (mips.kind === "packed") return mips.levelCount;
  const { width, height } = shape.extent;
  let levels = 1;
  let largest = Math.max(width, height);
  if (shape.viewDimension === "3d") largest = Math.max(largest, shape.extent.depth);
  while (largest > 1) {
    largest = Math.max(1, largest >> 1);
    levels += 1;
  }
  return levels;
}
function imagesPerMip(shape, level) {
  if (shape.viewDimension === "2d") return 1;
  if (shape.viewDimension === "2d-array") return shape.extent.layers;
  return Math.max(1, shape.extent.depth >> level);
}
function deriveTextureLayout(input) {
  const shapeResult = validateTextureShape(input.shape, input.mips, input.format);
  if (!shapeResult.ok) return shapeResult;
  if (input.order !== void 0 && input.order !== "mip-major,image-major,row-major") {
    return err(
      textureError(
        "texture-packing-invalid",
        {
          code: "texture-packing-invalid",
          expectedBytes: 0,
          actualBytes: input.actualByteLength ?? 0,
          order: input.order
        },
        "texture bytes must use mip-major, image-major, row-major order"
      )
    );
  }
  const params = formatLayout(input.format);
  const levels = [];
  let byteOffset = 0;
  const count = mipLevelCount(input.shape, input.mips);
  for (let level = 0; level < count; level++) {
    const width = Math.max(1, input.shape.extent.width >> level);
    const height = Math.max(1, input.shape.extent.height >> level);
    const blockColumns = Math.ceil(width / params.blockWidth);
    const rowsPerImage = Math.ceil(height / params.blockHeight);
    const bytesPerRow = blockColumns * params.bytesPerBlock;
    const byteLength = bytesPerRow * rowsPerImage * imagesPerMip(input.shape, level);
    levels.push({
      level,
      width,
      height,
      physicalWidth: blockColumns * params.blockWidth,
      physicalHeight: rowsPerImage * params.blockHeight,
      imagesPerMip: imagesPerMip(input.shape, level),
      bytesPerRow,
      rowsPerImage,
      byteOffset,
      byteLength
    });
    byteOffset += byteLength;
  }
  const authoredBytes = input.mips.kind === "generate" ? levels[0]?.byteLength ?? 0 : byteOffset;
  if (input.actualByteLength !== void 0 && input.actualByteLength !== authoredBytes) {
    return err(
      textureError(
        "texture-packing-invalid",
        {
          code: "texture-packing-invalid",
          expectedBytes: authoredBytes,
          actualBytes: input.actualByteLength
        },
        "texture data length must equal the derived canonical byte length"
      )
    );
  }
  return ok({
    shape: input.shape,
    format: input.format,
    levels,
    byteLength: byteOffset
  });
}

// src/material-program-abi.ts
function isDynamicInputLayout(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const layout = value;
  if (typeof layout.name !== "string" || typeof layout.stride !== "number" || !Number.isSafeInteger(layout.stride) || layout.stride <= 0 || layout.stride % 16 !== 0 || !Array.isArray(layout.fields) || typeof layout.identity !== "string" || layout.identity.length === 0)
    return false;
  const limits = [
    "maxRecords",
    "maxDomains",
    "maxPageBytes",
    "maxBindings",
    "maxEventsPerSample"
  ];
  if (limits.some((field) => !Number.isSafeInteger(layout[field]))) return false;
  const fields = layout.fields.map((field) => {
    if (field === null || typeof field !== "object" || Array.isArray(field)) return void 0;
    const candidate = field;
    if (typeof candidate.name === "string" && typeof candidate.type === "string" && Number.isSafeInteger(candidate.offset) && candidate.offset >= 0 && Number.isSafeInteger(candidate.size) && candidate.size > 0 && Number.isSafeInteger(candidate.alignment) && candidate.alignment > 0) {
      return {
        name: candidate.name,
        type: candidate.type,
        offset: candidate.offset,
        size: candidate.size,
        alignment: candidate.alignment
      };
    }
    return void 0;
  });
  if (fields.some((field) => field === void 0)) return false;
  const fieldTypes = /* @__PURE__ */ new Set([
    "f32",
    "u32",
    "vec2<f32>",
    "vec3<f32>",
    "vec4<f32>"
  ]);
  if (fields.some(
    (field) => field !== void 0 && !fieldTypes.has(field.type)
  )) {
    return false;
  }
  const schema = {
    name: layout.name,
    fields: fields.map((field) => ({
      name: field?.name ?? "",
      type: field?.type
    })),
    maxRecords: layout.maxRecords,
    maxDomains: layout.maxDomains,
    maxPageBytes: layout.maxPageBytes,
    maxBindings: layout.maxBindings,
    maxEventsPerSample: layout.maxEventsPerSample
  };
  const derived = deriveMaterialDynamicInputLayout(schema);
  if (!derived.ok || derived.value.stride !== layout.stride) return false;
  if (derived.value.maxRecords !== schema.maxRecords || derived.value.maxDomains !== schema.maxDomains || derived.value.maxPageBytes !== schema.maxPageBytes || derived.value.maxBindings !== schema.maxBindings || derived.value.maxEventsPerSample !== schema.maxEventsPerSample || derived.value.identity !== layout.identity || derived.value.fields.length !== fields.length) {
    return false;
  }
  return derived.value.fields.every((field, index) => {
    const candidate = fields[index];
    return candidate !== void 0 && field.name === candidate.name && field.type === candidate.type && field.offset === candidate.offset && field.size === candidate.size && field.alignment === candidate.alignment;
  });
}
var SURFACE_MODULE_RE = /^[A-Za-z_][A-Za-z0-9_.-]*(?:::[A-Za-z_][A-Za-z0-9_.-]*)*$/;
function isMaterialSurfaceProgramAbi(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const surface = value;
  if (surface.model !== "standard" && surface.model !== "single-layer-medium" || typeof surface.module !== "string" || !SURFACE_MODULE_RE.test(surface.module) || typeof surface.inputAbi !== "string" || typeof surface.outputAbi !== "string" || !Array.isArray(surface.passes) || surface.passes.some((pass) => pass !== "nearest-layer" && pass !== "color"))
    return false;
  const passes = surface.passes;
  const expectedPasses = surface.model === "single-layer-medium" ? ["nearest-layer", "color"] : ["color"];
  if (passes.length !== expectedPasses.length || passes.some((pass, index) => pass !== expectedPasses[index]))
    return false;
  if (surface.dynamicInput === void 0) return true;
  if (surface.dynamicInput === null || typeof surface.dynamicInput !== "object") return false;
  const dynamic = surface.dynamicInput;
  if (isDynamicInputLayout(dynamic.layout) && dynamic.group === 3 && dynamic.binding === 3 && dynamic.readOnly === true && typeof dynamic.accessor === "string" && dynamic.accessor === `read_${dynamic.layout.name}`) {
    return true;
  }
  return false;
}
function isMaterialProgramAbi(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const abi = value;
  const row = abi.materialRow;
  const reflection = abi.reflection;
  const generation = abi.generation;
  const validIndex = (candidate) => typeof candidate === "number" && Number.isSafeInteger(candidate) && candidate >= 0;
  const validInputs = (inputs) => Array.isArray(inputs) && inputs.every(
    (input) => input !== null && typeof input === "object" && typeof input.semantic === "string" && validIndex(input.location) && typeof input.format === "string"
  ) && new Set(inputs.map((input) => input.location)).size === inputs.length;
  const validRow = (candidate) => {
    if (candidate === null || typeof candidate !== "object" || Array.isArray(candidate))
      return false;
    const materialRow = candidate;
    const byteLength = materialRow.byteLength;
    if (typeof byteLength !== "number" || !Number.isSafeInteger(byteLength) || byteLength <= 0 || byteLength % 16 !== 0 || !Array.isArray(materialRow.fields) || !materialRow.fields.every((field) => typeof field === "string")) {
      return false;
    }
    return new Set(materialRow.fields).size === materialRow.fields.length;
  };
  const validResources = (resources) => Array.isArray(resources) && resources.every(
    (resource) => resource !== null && typeof resource === "object" && typeof resource.name === "string" && resource.name.length > 0 && typeof resource.parameter === "string" && resource.parameter.length > 0 && ["sampler", "texture", "storage-buffer"].includes(
      resource.kind
    ) && validIndex(resource.group) && validIndex(resource.binding)
  ) && new Set(
    resources.map((resource) => {
      const candidate = resource;
      return `${candidate.group}:${candidate.binding}`;
    })
  ).size === resources.length;
  const validSkin = abi.skinPaletteAddress === void 0 || abi.skinPaletteAddress !== null && typeof abi.skinPaletteAddress === "object" && validIndex(abi.skinPaletteAddress.group) && validIndex(abi.skinPaletteAddress.binding) && Number.isSafeInteger(abi.skinPaletteAddress.stride) && (abi.skinPaletteAddress.stride ?? 0) > 0;
  const validSurface = abi.surface === void 0 || isMaterialSurfaceProgramAbi(abi.surface);
  const validShape = typeof abi.directEntry === "string" && abi.directEntry.length > 0 && typeof abi.sceneIndexEntry === "string" && abi.sceneIndexEntry.length > 0 && validRow(row) && validResources(abi.resourceSlots) && Array.isArray(abi.uvSets) && abi.uvSets.every(
    (uv) => uv !== null && typeof uv === "object" && typeof uv.parameter === "string" && Number.isSafeInteger(uv.set) && (uv.set ?? -1) >= 0
  ) && validInputs(abi.vertexInputs) && abi.alphaMask !== null && typeof abi.alphaMask === "object" && typeof abi.alphaMask.cutoff === "string" && typeof abi.alphaMask.source === "string" && reflection !== null && typeof reflection === "object" && typeof reflection.layoutIdentity === "string" && reflection.layoutIdentity.length > 0 && validResources(reflection.resourceSlots) && validInputs(reflection.vertexInputs) && typeof abi.receiptIdentity === "string" && abi.receiptIdentity.length > 0 && Number.isSafeInteger(generation) && typeof generation === "number" && generation >= 1 && validSkin && validSurface;
  if (!validShape) return false;
  const topResources = JSON.stringify(abi.resourceSlots);
  const reflectionResources = JSON.stringify(
    reflection.resourceSlots
  );
  const topInputs = JSON.stringify(abi.vertexInputs);
  const reflectionInputs = JSON.stringify(reflection.vertexInputs);
  return topResources === reflectionResources && topInputs === reflectionInputs;
}

// src/asset-producer.ts
function catalogOperationsFor(input) {
  const imported = input.subject === "imported-output";
  const current = input.lifecycle === "current";
  const ready = current && (input.execution === "direct" || input.execution === "cooked");
  const canRebuild = input.execution === "cooked";
  const canPreview = input.execution === "cooked" && input.lifecycle !== "missing";
  const operation = (name, enabled, reason) => ({
    operation: name,
    enabled,
    ...reason === void 0 ? {} : { reason }
  });
  return {
    preview: operation("preview", canPreview, canPreview ? void 0 : "no projection to preview"),
    save: operation(
      "save",
      !imported && input.execution === "direct" && ready,
      imported ? "imported output is read-only" : "direct projection is not current"
    ),
    rebuild: operation(
      "rebuild",
      canRebuild,
      canRebuild ? void 0 : "direct assets do not require a cook"
    ),
    sourceOverride: operation(
      "sourceOverride",
      imported && canRebuild,
      imported ? canRebuild ? void 0 : "cooked projection is not available" : "only imported output has a source override"
    ),
    instanceOverride: operation(
      "instanceOverride",
      imported && current,
      imported ? current ? void 0 : "projection is not current" : "only imported output has an instance override"
    ),
    promote: operation(
      "promote",
      imported && current,
      imported ? current ? void 0 : "projection is not current" : "internal assets are already authored"
    )
  };
}
function isCatalogProjectionValid(input) {
  if (input.execution === "direct" && input.lifecycle !== "current") return false;
  if (input.subject === "imported-output" && input.execution !== "cooked") return false;
  return Object.entries(input.operations).every(
    ([name, descriptor]) => name === descriptor.operation
  );
}
var UI_AUTHORING_CAPABILITY = {
  contractVersion: "1",
  profileVersion: "1",
  preview: {
    operation: "createUiPreviewSession",
    lifecycle: "open-rebuild-retry-dispose"
  },
  mount: {
    operation: "mountUi",
    lifecycle: "mount-dispose",
    actionPort: "onAction"
  },
  state: { status: "supported", operation: "gameProjection", contractVersion: "1" },
  actions: { status: "supported", operation: "gameProjection", contractVersion: "1" },
  reads: { status: "supported", operation: "gameProjection", contractVersion: "1" },
  input: { status: "supported", operation: "dom-native", contractVersion: "1" },
  navigation: { status: "supported", operation: "dom-native", contractVersion: "1" },
  font: { status: "supported", operation: "ui-artifact-companion", contractVersion: "1" },
  localization: {
    status: "unavailable",
    reason: {
      code: "missing-producer-capability",
      hint: "UI localization resources are not yet published through the UI authoring contract."
    }
  }
};
function authoringCapabilityForAssetKind(kind) {
  switch (kind) {
    case "ui":
      return {
        placement: {
          operation: "unavailable",
          reason: {
            code: "unsupported-asset-kind",
            hint: "UI assets mount through the UI runtime and are not ECS scene placements."
          }
        },
        binding: {
          operation: "unavailable",
          reason: {
            code: "unsupported-asset-kind",
            hint: "UI assets bind through their producer-owned UI runtime contract."
          }
        },
        ui: UI_AUTHORING_CAPABILITY
      };
    case "scene":
      return {
        placement: { operation: "addSceneAssetToScene" },
        binding: {
          operation: "unavailable",
          reason: {
            code: "unsupported-asset-kind",
            hint: "Scene assets are placed as a scene mount."
          }
        }
      };
    case "mesh":
      return {
        placement: { operation: "spawnEntity" },
        binding: {
          operation: "bindAssetRef",
          target: {
            component: "MeshFilter",
            field: "assetHandle",
            assetType: "MeshAsset",
            cardinality: "single"
          },
          requiredSlots: 1
        }
      };
    case "material":
      return {
        placement: { operation: "spawnEntity" },
        binding: {
          operation: "bindAssetRef",
          target: {
            component: "MeshRenderer",
            field: "materials",
            assetType: "MaterialAsset",
            cardinality: "array"
          },
          requiredSlots: 1
        }
      };
    case "texture":
      return {
        placement: { operation: "spawnEntity" },
        binding: {
          operation: "createMaterialThenBindAssetRef",
          target: {
            component: "MeshRenderer",
            field: "materials",
            assetType: "MaterialAsset",
            cardinality: "array"
          },
          requiredSlots: 1
        }
      };
    case "particle-effect":
      return {
        placement: { operation: "spawnEntity" },
        binding: {
          operation: "bindAssetRef",
          target: {
            component: "ParticleEffectPlayer",
            field: "effect",
            assetType: "ParticleEffectAsset",
            cardinality: "single"
          },
          requiredSlots: 1
        }
      };
    default:
      return {
        placement: {
          operation: "unavailable",
          reason: {
            code: "unsupported-asset-kind",
            hint: `No placement capability is published for asset kind '${kind}'.`
          }
        },
        binding: {
          operation: "unavailable",
          reason: {
            code: "unsupported-asset-kind",
            hint: `No binding capability is published for asset kind '${kind}'.`
          }
        }
      };
  }
}
var MESH_MATERIAL_SLOT_SOURCE_OVERRIDE_PAYLOAD_SCHEMA = {
  type: "object",
  properties: {
    materialSlots: {
      type: "array",
      items: {
        type: "object",
        properties: {
          slotName: { type: "string", minLength: 1 },
          sourceKey: { type: "string", minLength: 1 },
          defaultMaterialGuid: { type: "string" }
        },
        required: ["slotName"],
        additionalProperties: true
      }
    },
    materialSlotDefaultOverrides: {
      type: "object",
      additionalProperties: { type: "string", nullable: true }
    }
  },
  additionalProperties: true
};
function sourceOverrideError(code, expected, hint, actual) {
  return {
    ok: false,
    error: { code, expected, hint, ...actual === void 0 ? {} : { actual } }
  };
}
function isSourceOverridePayload(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function canonicalizeSourceOverrides(value) {
  if (value === void 0) return void 0;
  if (!isSourceOverridePayload(value)) return void 0;
  const keys = Object.keys(value);
  if (keys.length === 0) return void 0;
  return Object.fromEntries(keys.sort().map((key) => [key, value[key]]));
}
function validateSourceOverrideEntry(sourceKey, payload, declared, seen) {
  if (seen.has(sourceKey)) {
    return {
      code: "duplicate-source-key",
      expected: "sourceKey values to be unique within sourceOverrides",
      hint: "remove the duplicate source override",
      actual: sourceKey
    };
  }
  seen.add(sourceKey);
  if (!declared.has(sourceKey)) {
    return {
      code: "unknown-source-key",
      expected: "sourceKey to be declared by the producer topology",
      hint: "request a fresh Catalog topology before writing Meta",
      actual: sourceKey
    };
  }
  if (!isSourceOverridePayload(payload)) {
    return {
      code: "invalid-source-override-payload",
      expected: "each source override payload to be a producer-owned object",
      hint: "validate the payload with the producer schema",
      actual: sourceKey
    };
  }
  return void 0;
}
function validateSourceOverrideEntries(entries, declared) {
  const seen = /* @__PURE__ */ new Set();
  for (const [sourceKey, payload] of entries) {
    const error = validateSourceOverrideEntry(sourceKey, payload, declared, seen);
    if (error !== void 0) return { ok: false, error };
  }
  return { ok: true, value: canonicalizeSourceOverrides(Object.fromEntries(entries)) };
}
function validateSourceOverrideMap(value, declaredSourceKeys) {
  const declared = /* @__PURE__ */ new Set();
  for (const sourceKey of declaredSourceKeys) {
    if (declared.has(sourceKey)) {
      return sourceOverrideError(
        "duplicate-source-key",
        "sourceKey values declared by a producer to be unique",
        "repair the producer topology before publishing Meta",
        sourceKey
      );
    }
    declared.add(sourceKey);
  }
  if (value === void 0) return { ok: true, value: void 0 };
  if (Array.isArray(value)) {
    const entries = [];
    for (const item of value) {
      if (!Array.isArray(item) || item.length !== 2 || typeof item[0] !== "string") {
        return sourceOverrideError(
          "invalid-source-overrides",
          "sourceOverrides to be an object keyed by sourceKey",
          "pass a producer-owned source override map"
        );
      }
      entries.push([item[0], item[1]]);
    }
    return validateSourceOverrideEntries(entries, declared);
  }
  if (!isSourceOverridePayload(value)) {
    return sourceOverrideError(
      "invalid-source-overrides",
      "sourceOverrides to be an object keyed by sourceKey",
      "pass a producer-owned source override map"
    );
  }
  return validateSourceOverrideEntries(Object.entries(value), declared);
}

// src/catalog.ts
function catalogInvalid(field) {
  return err({
    code: "catalog-delta-invalid",
    expected: "a CatalogDelta with complete row identity and string removals",
    hint: "discard the delta and enumerate a verified catalog snapshot",
    detail: { field }
  });
}
function isRecord2(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}
function isStringArray(value) {
  return Array.isArray(value) && value.every(isNonEmptyString);
}
function isSubjectRef(value) {
  return isRecord2(value) && (value.type === "asset" || value.type === "package" || value.type === "resource") && isNonEmptyString(value.id);
}
function isRevision(value) {
  if (!isRecord2(value)) return false;
  const observedAt = value.observedAt;
  return isNonEmptyString(value.digest) && typeof observedAt === "number" && Number.isSafeInteger(observedAt) && observedAt >= 0 && isNonEmptyString(value.rootId);
}
function isDiagnostic(value) {
  return isRecord2(value) && isNonEmptyString(value.code) && (value.severity === "info" || value.severity === "warning" || value.severity === "blocking") && (value.message === void 0 || typeof value.message === "string") && (value.subject === void 0 || isSubjectRef(value.subject)) && (value.expected === void 0 || typeof value.expected === "string") && (value.actual === void 0 || typeof value.actual === "string") && (value.hint === void 0 || typeof value.hint === "string") && (value.authority === void 0 || value.authority === "producer" || value.authority === "pack" || value.authority === "catalog") && (value.evidence === void 0 || Array.isArray(value.evidence) && value.evidence.every(isSubjectRef)) && (value.recoveryIntents === void 0 || isStringArray(value.recoveryIntents));
}
function isRevisionWindow(value) {
  if (!isRecord2(value) || !Array.isArray(value.baseline) || !Array.isArray(value.current)) {
    return false;
  }
  const isPoint = (point) => isRecord2(point) && isNonEmptyString(point.rootId) && typeof point.revision === "number" && Number.isSafeInteger(point.revision) && point.revision >= 0;
  return value.baseline.every(isPoint) && value.current.every(isPoint);
}
function isTopologyDiff(value) {
  if (!isRecord2(value)) return false;
  return ["preserved", "added", "removed", "changedKind", "ambiguous"].every(
    (field) => Array.isArray(value[field])
  );
}
function isCatalogEntry(value) {
  if (!isRecord2(value)) return false;
  if (!isNonEmptyString(value.guid) || !isNonEmptyString(value.packageUrl) || !isNonEmptyString(value.kind) || !isNonEmptyString(value.sourcePath)) {
    return false;
  }
  if (value.authoring !== void 0 && !isRecord2(value.authoring)) return false;
  if (value.packageId !== void 0 && !isNonEmptyString(value.packageId)) return false;
  if (value.provenance !== void 0) {
    if (!isRecord2(value.provenance)) return false;
    if (!isNonEmptyString(value.provenance.provider) || !isNonEmptyString(value.provenance.version)) {
      return false;
    }
    if (value.provenance.source !== void 0 && !isNonEmptyString(value.provenance.source)) {
      return false;
    }
  }
  if (value.revision !== void 0 && !isRevision(value.revision)) return false;
  if (value.sourceKey !== void 0 && !isNonEmptyString(value.sourceKey)) return false;
  const sourceIndex = value.sourceIndex;
  if (sourceIndex !== void 0 && (typeof sourceIndex !== "number" || !Number.isSafeInteger(sourceIndex) || sourceIndex < 0))
    return false;
  if (value.sourceOverrides !== void 0 && !isRecord2(value.sourceOverrides)) return false;
  if (value.sourceOverrideDescriptors !== void 0 && !Array.isArray(value.sourceOverrideDescriptors)) {
    return false;
  }
  if (value.relations !== void 0 && !Array.isArray(value.relations)) return false;
  if (value.diagnostics !== void 0 && (!Array.isArray(value.diagnostics) || !value.diagnostics.every(isDiagnostic)))
    return false;
  if (value.name !== void 0 && !isNonEmptyString(value.name)) return false;
  if (value.cookReceiptUrl !== void 0 && !isNonEmptyString(value.cookReceiptUrl)) return false;
  if (value.refs !== void 0 && !isStringArray(value.refs)) return false;
  if (value.subject !== void 0 && value.subject !== "internal-asset" && value.subject !== "imported-output") {
    return false;
  }
  if (value.execution !== void 0 && value.execution !== "direct" && value.execution !== "cooked") {
    return false;
  }
  if (value.lifecycle !== void 0 && !["missing", "cooking", "current", "stale", "failed"].includes(value.lifecycle)) {
    return false;
  }
  if (value.projection !== void 0 && !isRecord2(value.projection)) return false;
  return value.publication === void 0 || isRecord2(value.publication);
}
function validateCatalogDelta(value) {
  if (!isRecord2(value)) return catalogInvalid("delta");
  if (!Array.isArray(value.added)) return catalogInvalid("added");
  if (!Array.isArray(value.changed)) return catalogInvalid("changed");
  if (!Array.isArray(value.removed)) return catalogInvalid("removed");
  if (!value.added.every(isCatalogEntry)) return catalogInvalid("added.entry");
  if (!value.changed.every(isCatalogEntry)) return catalogInvalid("changed.entry");
  if (!value.removed.every((guid) => typeof guid === "string" && guid.length > 0)) {
    return catalogInvalid("removed.guid");
  }
  const generation = value.generation;
  if (value.scopeId !== void 0 && !isNonEmptyString(value.scopeId) || generation !== void 0 && (typeof generation !== "number" || !Number.isSafeInteger(generation) || generation < 1)) {
    return catalogInvalid("scope");
  }
  if (value.scopeId === void 0 !== (value.generation === void 0)) {
    return catalogInvalid("scope.generation");
  }
  if (value.authority !== void 0 && value.authority !== "authoritative" && value.authority !== "degraded") {
    return catalogInvalid("authority");
  }
  if (value.diagnostics !== void 0 && (!Array.isArray(value.diagnostics) || !value.diagnostics.every(isDiagnostic))) {
    return catalogInvalid("diagnostics");
  }
  if (value.revisions !== void 0 && !isRevisionWindow(value.revisions)) {
    return catalogInvalid("revisions");
  }
  if (value.topology !== void 0 && (!Array.isArray(value.topology) || !value.topology.every(isTopologyDiff))) {
    return catalogInvalid("topology");
  }
  const identityKeys = [...value.added, ...value.changed].map((entry) => entry.guid.toLowerCase());
  if (new Set(identityKeys).size !== identityKeys.length) return catalogInvalid("duplicate.guid");
  const removedKeys = value.removed.map((guid) => guid.toLowerCase());
  if (new Set(removedKeys).size !== removedKeys.length) return catalogInvalid("duplicate.removed");
  if (value.authority === "degraded" && identityKeys.length > 0) {
    return catalogInvalid("degraded.identity");
  }
  return ok(value);
}
function canonicalCatalogValue(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalCatalogValue).join(",")}]`;
  if (isRecord2(value)) {
    return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, child]) => `${JSON.stringify(key)}:${canonicalCatalogValue(child)}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}
function digestPart(value, seed) {
  let hash = seed;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= BigInt(value.charCodeAt(index));
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return hash.toString(16).padStart(16, "0");
}
var CATALOG_DIGEST_SEEDS = [
  0xcbf29ce484222325n,
  0x84222325cbf29ce4n,
  0x9e3779b185ebca87n,
  0x517cc1b727220a95n
];
function catalogDigest(value) {
  const canonical = canonicalCatalogValue(value);
  return `sha256:${CATALOG_DIGEST_SEEDS.map((seed) => digestPart(canonical, seed)).join("")}`;
}
function catalogEntryDigest(entry) {
  return catalogDigest({ ...entry, guid: entry.guid.toLowerCase() });
}
function catalogDeltaDigest(delta) {
  return catalogDigest({
    ...delta,
    added: [...delta.added].sort((left, right) => left.guid.localeCompare(right.guid)),
    changed: [...delta.changed].sort((left, right) => left.guid.localeCompare(right.guid)),
    removed: [...delta.removed].sort()
  });
}

// src/import.ts
var ImportError = class extends Error {
  code;
  expected;
  actual;
  hint;
  detail;
  constructor(args) {
    super(`[ImportError ${args.code}] expected: ${args.expected}; hint: ${args.hint}`);
    this.name = "ImportError";
    this.code = args.code;
    this.expected = args.expected;
    if (args.actual !== void 0) this.actual = args.actual;
    this.hint = args.hint;
    this.detail = args.detail;
  }
};
var IMPORT_ERROR_HINTS = {
  "importer-not-registered": "no importer registered for this meta.importer key; register one via importers.register(importer) (the importer carries its own key, e.g. gltfImporter / imageImporter); err.detail.registeredImporters lists the keys currently wired",
  "source-read-failed": "the file at meta.source could not be read; check the path is correct relative to the sidecar and the process has read access",
  "import-produced-no-assets": "the importer produced no assets, or omitted a GUID that meta.subAssets[] declared; the produced GUID set must be a superset of the declared set (GUID import-stable iron law); err.detail.missingGuids lists the declared GUIDs not produced",
  "guid-mismatch": "the importer produced a GUID that meta.subAssets[] never declared (violates the GUID import-stable iron law: GUIDs come from the external meta, never minted by the importer); err.detail.unexpectedGuids lists the offending GUIDs",
  "mesh-material-slot-topology-change": "the importer could not match previous and current Mesh material slots without ambiguity; name source materials uniquely or repair their stable sourceKey values before reimport",
  "mesh-lod-contract-invalid": "the normalized MeshAsset LOD contract is invalid; inspect err.detail.reason and repair coverage, hysteresis, references, bounds, or material slots",
  "mesh-lod-topology-change": "the source LOD topology changed in the middle of an ordered chain; preserve sourceKey identity and append or remove only at the end before reimporting",
  "mesh-lod-authority-conflict": "the format-owned LOD relation disagrees with the authored sidecar; repair the source or sidecar explicitly before publishing",
  "import-internal-error": "the importer failed at runtime; branch on err.detail: a conversion THROW carries err.detail.reason (the loaded importer threw while converting the source \u2014 an importer bug, not a meta / source problem), while a build-time module-LOAD failure carries err.detail.loadError (the host importer module / native addon could not be imported)",
  "source-validation-failed": "the source violates an import authoring rule; inspect err.detail.diagnostics fields (code, sourcePath, sourceRange, rule, expected, actual, hint, and relatedLocations) and fix the referenced source",
  "unknown-source-key": "sourceOverrides contains a key absent from meta.subAssets[]; refresh the producer topology and use one of err.detail.declaredSourceKeys",
  "duplicate-source-key": "the producer declared the same sourceKey more than once; repair the Meta topology before importing",
  "invalid-source-overrides": "sourceOverrides must be an object keyed by producer-owned sourceKey values",
  "invalid-source-override-payload": "each sourceOverrides value must be a producer-owned object validated by the importer"
};
function parseConservativeAnimatedBounds(value) {
  if (!Array.isArray(value) || value.length !== 6) return void 0;
  const bounds = value.map((entry) => typeof entry === "number" ? entry : Number.NaN);
  const [minX, minY, minZ, maxX, maxY, maxZ] = bounds;
  if (minX === void 0 || minY === void 0 || minZ === void 0 || maxX === void 0 || maxY === void 0 || maxZ === void 0 || ![minX, minY, minZ, maxX, maxY, maxZ].every(Number.isFinite) || minX > maxX || minY > maxY || minZ > maxZ) {
    return void 0;
  }
  return new Float32Array(bounds);
}
function readConservativeAnimatedBounds(importSettings, sourceIndex) {
  if (!Number.isInteger(sourceIndex) || sourceIndex < 0) return void 0;
  const rows = importSettings.conservativeAnimatedBounds;
  if (!Array.isArray(rows)) return void 0;
  return parseConservativeAnimatedBounds(rows[sourceIndex]);
}

// src/runtime-contracts.ts
function legacyInspectHint(legacyInspectTarget) {
  return `use 'forgeax dev eval --root <project> --code "return ${legacyInspectTarget}"' to inspect the live realm`;
}

export { ASSET_ERROR_HINTS, ASSET_EVIDENCE_ERROR_HINTS, ASSET_LOAD_ERROR_HINTS, ASSET_STAGE_ERROR_HINTS, AUDIO_ERROR_HINTS, AssetError, AudioError, BUILTIN_BASE, FontError, IES_PROFILE_BYTES_PER_SAMPLE, IES_PROFILE_BYTE_LENGTH, IES_PROFILE_HEIGHT, IES_PROFILE_WIDTH, IMAGE_ERROR_HINTS, IMPORT_ERROR_HINTS, ImportError, KNOWN_PASS_KINDS, MATERIAL_CHILD_FORBIDDEN_FIELDS, MATERIAL_PARAM_TYPES, MATERIAL_SURFACE_MODELS, MATERIAL_TEXTURE_SLOTS, MAX_GEN, MAX_SLOT, MESH_MATERIAL_SLOT_SOURCE_OVERRIDE_PAYLOAD_SCHEMA, MaterialAssetContractError, MaterialChildContractError, MaterialPhysicalContractError, PACK_ERROR_HINTS, PHYSICS_ERROR_HINTS, ParamSchemaProjectionOwner, PhysicsError, RUNTIME_ASSET_BINDING_SCHEMA, RUNTIME_CATALOG_SNAPSHOT_SCHEMA, R_MIN, RenderQueue, SINGLE_LAYER_MEDIUM_SURFACE_MODEL, STANDARD_LAYER_PARAMETER_GROUPS, STANDARD_MATERIAL_PARAM_SCHEMA, STANDARD_PHYSICAL_PARAMETER_NAMES, STANDARD_PHYSICAL_TEXTURE_FIELDS, STANDARD_SURFACE_PARAM_SCHEMA, STANDARD_TRANSMISSION_PARAMETER_NAMES, TEXTURE_ERROR_HINTS, TextError, UV_ATTRIBUTE_KEYS, assertMaterialAsset, authoringCapabilityForAssetKind, canonicalizeSourceOverrides, catalogDeltaDigest, catalogEntryDigest, catalogOperationsFor, countExtraUvSets, countUvSets, createMaterialError, createStandaloneRuntimeAssetBinding, derive, deriveMaterialDynamicInputLayout, deriveObserved, deriveStandardLayerPlan, deriveTextureLayout, err, findUndeclaredSampledTextures, handleGeneration, handleSlot, inferMaterialParameterKind, isCatalogProjectionValid, isCompressedFormat, isMaterialPhysicalContractError, isMaterialProgramAbi, isMaterialSurfaceDeclaration, isMaterialSurfaceProgramAbi, isRetiredSlot, isRuntimeCatalogRoots, legacyInspectHint, linearChannelToSrgb, materialChildForbiddenFields, materialGuidText, materialPhysicalContractResult, materialValuesToLinearRuntime, migrateLegacyMeshMaterialOverrides, ok, pack, parseConservativeAnimatedBounds, projectAssetEvidence, projectCookProductEvidence, readConservativeAnimatedBounds, reconcileMeshMaterialSlotTopology, resolveMaterialAsset, resolveMaterialTextureCoordinates, resolveMeshMaterialSlotDefaultGuid, runtimeScopeMatches, runtimeScopePath, srgbChannelToLinear, standardMaterialParameters, standardPhysicalTextureFields, standardSurfaceParameters, textureError, toShared, toUnique, unpackGen, unpackSlot, unwrapHandle, validateCatalogDelta, validateSourceOverrideMap, validateTextureShape };
