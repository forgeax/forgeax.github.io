import { defineToolPlugin } from '../../plugin/dist/browser.mjs';
import { defineToolCapability, defineTool, validatePreviewArtifactManifest, createPreviewArtifactManifest } from '../../tool-runtime/dist/index.mjs';
export { createPreviewArtifactManifest, validatePreviewArtifactManifest } from '../../tool-runtime/dist/index.mjs';

// src/domains/subject.ts
var previewHostCapability = defineToolCapability("preview.host");
function previewHostPlugin(host) {
  return {
    name: "forgeax-preview-host",
    provide: previewHostCapability.id,
    apply(ctx) {
      ctx.provide(previewHostCapability.id, host);
    }
  };
}
function bindPreviewHost(plugin, host) {
  return defineToolPlugin(previewHostPlugin(host), plugin.tools);
}
function createPreviewHost(input) {
  let active = true;
  return {
    async withSession(execute) {
      if (!active || input.signal.aborted) throw new Error("preview-host-session-terminal");
      try {
        return await execute(input);
      } finally {
        active = false;
      }
    }
  };
}

// src/domains/subject.ts
var RESOURCE_PREVIEW_DEFAULT_SIZE = 512;
var RESOURCE_PREVIEW_MIN_SIZE = 64;
var RESOURCE_PREVIEW_MAX_SIZE = 4096;
function isResourcePreviewSize(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= RESOURCE_PREVIEW_MIN_SIZE && value <= RESOURCE_PREVIEW_MAX_SIZE && (value & value - 1) === 0;
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isString(value) {
  return typeof value === "string" && value.length > 0;
}
function isResourcePreviewResult(value) {
  if (!isRecord(value)) return false;
  const subject = value.subject;
  if (!isRecord(subject) || !isString(subject.kind) || !isString(subject.guid) || !isString(subject.digest))
    return false;
  if (!isRecord(value.presentation) || !isString(value.presentation.kind)) return false;
  if (!isRecord(value.recipe) || !isString(value.recipe.schemaVersion) || !isString(value.recipe.recipeDigest))
    return false;
  if (!isRecord(value.oracle) || !isString(value.oracle.status)) return false;
  return Array.isArray(value.artifacts);
}
var resourcePreviewResultSchema = {
  parse(value) {
    return isResourcePreviewResult(value) ? { ok: true, value } : {
      ok: false,
      error: "resource preview result must include subject, presentation, recipe, oracle, and artifacts"
    };
  },
  describe: '{"type":"object","required":["subject","presentation","recipe","oracle","artifacts"]}'
};
var resourcePreviewArgsSchema = {
  parse(value) {
    if (value === null || typeof value !== "object" || typeof Reflect.get(value, "guid") !== "string") {
      return { ok: false, error: "expected { guid: string }" };
    }
    const guid = Reflect.get(value, "guid");
    if (guid.length === 0) return { ok: false, error: "guid must not be empty" };
    const size = Reflect.get(value, "size");
    if (size === void 0) return { ok: true, value: { guid } };
    return isResourcePreviewSize(size) ? { ok: true, value: { guid, size } } : {
      ok: false,
      error: `size must be a power of two between ${RESOURCE_PREVIEW_MIN_SIZE} and ${RESOURCE_PREVIEW_MAX_SIZE}`
    };
  },
  describe: `{"type":"object","required":["guid"],"properties":{"guid":{"type":"string"},"size":{"type":"integer","minimum":${RESOURCE_PREVIEW_MIN_SIZE},"maximum":${RESOURCE_PREVIEW_MAX_SIZE},"description":"square power-of-two screenshot edge; defaults to ${RESOURCE_PREVIEW_DEFAULT_SIZE}"}}}`
};
function subjectDescriptor(kind) {
  return {
    id: `${kind}.preview`,
    title: `Preview ${kind}`,
    summary: `Preview one ${kind} asset in the Engine-owned resource host.`,
    realm: "host",
    argsSchema: resourcePreviewArgsSchema,
    resultSchema: resourcePreviewResultSchema,
    evidence: ["rhi-tape", "profile-capture", "png"]
  };
}
function subjectFailure(code, expected, detail) {
  return {
    ok: false,
    error: {
      code,
      expected,
      hint: "Load the requested GUID through AssetRegistry.loadByGuid and repair the owner facts before retrying.",
      detail
    }
  };
}
function assetLoadFailure(expected, runId, error) {
  const owner = isRecord(error) ? error : void 0;
  const ownerCode = typeof owner?.code === "string" ? owner.code : void 0;
  const ownerExpected = typeof owner?.expected === "string" ? owner.expected : void 0;
  const ownerHint = typeof owner?.hint === "string" ? owner.hint : void 0;
  const ownerDetail = owner?.detail;
  return subjectFailure("resource-preview-subject-invalid", expected, {
    phase: "asset-load",
    runId,
    ...ownerCode === void 0 ? {} : { ownerCode },
    ...ownerExpected === void 0 ? {} : { ownerExpected },
    ...ownerHint === void 0 ? {} : { ownerHint },
    ...ownerDetail === void 0 ? {} : { ownerDetail: toJsonValue(ownerDetail) }
  });
}
function toJsonValue(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (Array.isArray(value)) return value.map((entry) => toJsonValue(entry));
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, toJsonValue(entry)])
    );
  }
  return String(value);
}
function nativePreviewPlugin(kind, contribution) {
  return defineToolPlugin({ name: `forgeax-preview-${kind}`, apply() {
  } }, [
    contribution
  ]);
}

// src/evidence/errors.ts
function isResourcePreviewFailureCode(value) {
  return value === "resource-preview-kind-mismatch" || value === "resource-preview-subject-invalid" || value === "resource-preview-oracle-failed";
}
function isRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function suggestedOperation(payload) {
  const actualKind = payload.actualKind;
  if (actualKind !== "material" && actualKind !== "mesh" && actualKind !== "vfx" && actualKind !== "texture")
    return void 0;
  return `${actualKind}.preview`;
}
function exhaustive(value) {
  throw new Error(`unhandled resource preview failure: ${String(value)}`);
}
function describeResourcePreviewFailure(failure) {
  if (failure.code !== "tool-domain-failed") return void 0;
  const code = failure.detail.code;
  if (!isResourcePreviewFailureCode(code)) return void 0;
  const detail = isRecord2(failure.detail.payload) ? failure.detail.payload : {};
  const base2 = {
    code,
    expected: failure.expected,
    hint: failure.hint,
    detail
  };
  switch (code) {
    case "resource-preview-kind-mismatch": {
      const operation = suggestedOperation(detail);
      return {
        failure: base2,
        ...operation === void 0 ? {} : { suggestedOperation: operation },
        actions: [
          ...operation === void 0 ? [] : [
            {
              action: "switch-operation",
              operation,
              hint: "Run the suggested operation for the loaded asset kind."
            }
          ],
          {
            action: "repair-owner",
            hint: "Repair the asset owner kind facts and reload the GUID."
          },
          {
            action: "stop",
            hint: "Stop when the GUID does not belong to a supported preview kind."
          }
        ]
      };
    }
    case "resource-preview-subject-invalid":
      return {
        failure: base2,
        actions: [
          {
            action: "repair-owner",
            hint: "Repair the owner facts or recook the subject, then retry."
          },
          {
            action: "retry",
            hint: "Retry the same operation after the producer publishes a new digest."
          },
          { action: "stop", hint: "Stop when the owner cannot produce a valid subject." }
        ]
      };
    case "resource-preview-oracle-failed":
      return {
        failure: base2,
        actions: [
          {
            action: "inspect-evidence",
            hint: "Inspect the report and RHI diagnostics before retrying."
          },
          {
            action: "retry",
            hint: "Retry only after the renderer or binding producer is repaired."
          },
          {
            action: "stop",
            hint: "Stop publication when fresh evidence still falsifies the oracle."
          }
        ]
      };
  }
  return exhaustive(code);
}
function createAtomicPreviewPublisher() {
  let staged;
  let committed;
  return {
    stage(manifest) {
      staged = createPreviewArtifactManifest(manifest);
    },
    publish(requiredRoles) {
      if (staged === void 0) {
        const invalid2 = validatePreviewArtifactManifest(
          { schemaVersion: "2.0.0", identity: void 0, artifacts: [] },
          requiredRoles
        );
        if (invalid2.ok) throw new Error("preview publisher rejected an empty stage");
        return invalid2;
      }
      const validated = validatePreviewArtifactManifest(staged, requiredRoles);
      if (!validated.ok) {
        staged = void 0;
        return validated;
      }
      committed = validated.value;
      staged = void 0;
      return { ok: true, value: committed };
    },
    discard() {
      staged = void 0;
    },
    published: () => committed
  };
}

// src/evidence/oracle.ts
function passedPreviewOracle(input) {
  return {
    status: "passed",
    subjectBound: true,
    drawCalls: input.drawCalls,
    dispatches: input.dispatches ?? 0,
    rendererHealthy: true,
    detail: { ...input.detail }
  };
}
function failedPreviewOracle(input) {
  return {
    status: "failed",
    subjectBound: false,
    drawCalls: input.drawCalls ?? 0,
    dispatches: input.dispatches ?? 0,
    rendererHealthy: input.rendererHealthy ?? false,
    detail: { ...input.detail }
  };
}
function oracleDetail(kind, requested, observed, mismatch) {
  return {
    kind,
    mismatch: mismatch ?? "none",
    requestedSubjectDigest: typeof requested.subjectDigest === "string" ? requested.subjectDigest : "unknown",
    observedSubjectDigest: typeof observed.subjectDigest === "string" ? observed.subjectDigest : "unknown",
    requestedOwnerDigest: JSON.stringify(requested),
    observedOwnerDigest: JSON.stringify(observed)
  };
}
function firstMismatch(requested, observed) {
  for (const key of Object.keys(requested)) {
    const requestedValue = requested[key];
    const observedValue = observed[key];
    if (Array.isArray(requestedValue) || Array.isArray(observedValue) || typeof requestedValue === "object" || typeof observedValue === "object") {
      if (JSON.stringify(requestedValue) !== JSON.stringify(observedValue)) return key;
    } else if (requestedValue !== observedValue) {
      return key;
    }
  }
  return void 0;
}
function evaluateMaterialOracle(input) {
  const requested = input.requested;
  const observed = input.observed;
  const mismatch = firstMismatch(requested, observed);
  const healthy = input.observed.rendererHealthy && input.observed.drawCalls > 0;
  const detail = oracleDetail("material", requested, observed, mismatch);
  if (mismatch !== void 0 || !healthy) {
    return failedPreviewOracle({
      drawCalls: input.observed.drawCalls,
      rendererHealthy: input.observed.rendererHealthy,
      detail: { ...detail, rendererHealthy: input.observed.rendererHealthy }
    });
  }
  return passedPreviewOracle({
    drawCalls: input.observed.drawCalls,
    detail: { ...detail, rendererHealthy: true }
  });
}
function evaluateMeshOracle(input) {
  const requested = input.requested;
  const observed = input.observed;
  const mismatch = firstMismatch(requested, observed);
  const healthy = input.observed.rendererHealthy && input.observed.drawCalls > 0;
  const detail = oracleDetail("mesh", requested, observed, mismatch);
  if (mismatch !== void 0 || !healthy) {
    return failedPreviewOracle({
      drawCalls: input.observed.drawCalls,
      rendererHealthy: input.observed.rendererHealthy,
      detail: { ...detail, rendererHealthy: input.observed.rendererHealthy }
    });
  }
  return passedPreviewOracle({
    drawCalls: input.observed.drawCalls,
    detail: { ...detail, rendererHealthy: true }
  });
}
function identityRecord(input) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      Array.isArray(value) ? JSON.stringify(value) : String(value)
    ])
  );
}
function evaluateIdentityOracle(kind, requestedInput, observedInput, healthy, drawCalls, dispatches, detailOverrides) {
  const requested = identityRecord(requestedInput);
  const observed = identityRecord(observedInput);
  const mismatch = firstMismatch(requested, observed);
  const detail = {
    kind,
    mismatch: mismatch ?? "none",
    requestedSubjectDigest: requested.subjectDigest ?? "unknown",
    observedSubjectDigest: observed.subjectDigest ?? "unknown",
    requestedOwnerDigest: JSON.stringify(requested),
    observedOwnerDigest: JSON.stringify(observed),
    ...detailOverrides
  };
  if (mismatch !== void 0 || !healthy) {
    return failedPreviewOracle({ drawCalls, dispatches, rendererHealthy: healthy, detail });
  }
  return passedPreviewOracle({ drawCalls, dispatches, detail });
}
function evaluateVfxOracle(input) {
  const observed = input.observed;
  const healthy = observed.rendererHealthy && observed.dispatches > 0 && observed.indirectDraws > 0 && observed.subjectOutputs > 0;
  return evaluateIdentityOracle(
    "vfx",
    input.requested,
    input.observed,
    healthy,
    observed.indirectDraws,
    observed.dispatches,
    {
      rendererHealthy: observed.rendererHealthy,
      indirectDraws: observed.indirectDraws,
      subjectOutputs: observed.subjectOutputs,
      nonBlackPixels: observed.nonBlackPixels
    }
  );
}
function evaluateTextureOracle(input) {
  const observed = input.observed;
  return evaluateIdentityOracle(
    "texture",
    input.requested,
    input.observed,
    observed.rendererHealthy && observed.drawCalls > 0,
    observed.drawCalls,
    0,
    {
      rendererHealthy: observed.rendererHealthy,
      payloadClass: observed.payloadClass,
      nonBlackPixels: observed.nonBlackPixels
    }
  );
}

// src/evidence/report.ts
function createResourcePreviewReport(input) {
  return {
    mediaType: "application/vnd.forgeax.resource-preview+json",
    schemaVersion: "1.0.0",
    ...input,
    artifacts: input.artifacts.map((artifact) => ({
      ...artifact,
      derivedFrom: [...artifact.derivedFrom]
    }))
  };
}

// src/host.ts
var REQUIRED_PREVIEW_EVIDENCE = [
  "rhi-tape",
  "png",
  "profile-capture"
];
function domainFailure(code, expected, hint, detail) {
  return { ok: false, error: { code, expected, hint, detail } };
}
function previewRuntimeUnavailable(subject, snapshot, domain) {
  return domainFailure(
    "preview-runtime-unavailable",
    "a Project GUID cold-load and an active PreviewHost/Browser/Dawn runner",
    "Install the Project preview provider and retry; no synthetic artifact is published.",
    {
      domain,
      subjectKind: subject.kind,
      subjectGuid: subject.guid,
      snapshotRevision: snapshot.revision,
      snapshotDigest: snapshot.digest,
      requiredEvidence: REQUIRED_PREVIEW_EVIDENCE
    }
  );
}
function validateDomainValue(value, request) {
  if (value.subject.kind !== request.subject.kind || value.subject.guid !== request.subject.guid || value.snapshot.revision !== request.snapshot.revision || value.snapshot.digest !== request.snapshot.digest) {
    return domainFailure(
      "preview-subject-identity-mismatch",
      "the terminal subject and snapshot to match the request",
      "Repair the domain producer so evidence remains bound to the requested subject.",
      {
        requestGuid: request.subject.guid,
        resultGuid: value.subject.guid,
        requestSnapshot: request.snapshot.digest,
        resultSnapshot: value.snapshot.digest
      }
    );
  }
  const kinds = new Set(value.artifacts.map((artifact) => artifact.kind));
  const missing = REQUIRED_PREVIEW_EVIDENCE.filter((kind) => !kinds.has(kind));
  if (missing.length > 0) {
    return domainFailure(
      "preview-evidence-incomplete",
      "one subject-bound artifact for each required evidence kind",
      "Repair the RHI, PNG, and profile producers before retrying.",
      { missing }
    );
  }
  return { ok: true, value };
}
var PreviewCleanupError = class extends Error {
  code = "preview-cleanup-live-resources";
  census;
  constructor(census, failures = []) {
    super(
      failures.length === 0 ? "preview session left live resources after disposal" : `preview session cleanup failed: ${failures.join("; ")}`
    );
    this.name = "PreviewCleanupError";
    this.census = census;
  }
};
function hasLiveResources(census) {
  return Object.values(census).some((count) => count !== 0);
}
function createPreviewHost2(adapterOrInput) {
  if ("runId" in adapterOrInput) return createPreviewHost(adapterOrInput);
  const adapter = adapterOrInput;
  const withSession = async (request, run) => {
    const session = await adapter.open(request);
    let result;
    try {
      result = await run(session);
    } finally {
      await session.dispose();
    }
    const cleanup = { census: session.census(), failures: [] };
    if (hasLiveResources(cleanup.census)) {
      throw new PreviewCleanupError(cleanup.census, cleanup.failures);
    }
    return { value: result, cleanup };
  };
  return {
    withSession
  };
}

// src/kit/canonical.ts
function createCanonicalPreviewRecipe(kind) {
  const texture = kind === "texture";
  return {
    schemaVersion: "1.0.0",
    rig: kind === "mesh" ? "asset-mesh" : texture ? "asset-quad" : "handle-sphere",
    environment: texture ? "black" : "engine-canonical",
    skybox: texture ? "none" : "engine-canonical",
    skylight: texture ? "none" : "engine-canonical",
    directionalLight: texture ? "none" : "engine-canonical",
    stage: texture ? "texture-unlit-black" : "neutral-material-checker-unlit",
    camera: texture ? "texture-orthographic" : "bounds-derived",
    recipeDigest: `canonical:${kind}:${texture ? "texture-orthographic" : "bounds-derived"}`
  };
}
function canonicalPresentation(kind) {
  if (kind === "texture") {
    return {
      kind: "texture-unlit",
      geometry: "aspect-quad",
      checkerboard: "linear-alpha"
    };
  }
  return {
    kind: "lit-asset",
    geometry: kind === "mesh" ? "asset-mesh" : "handle-sphere",
    skylight: "engine-canonical",
    directionalLight: "engine-canonical",
    skybox: "engine-canonical"
  };
}

// src/kit/presentation.ts
var MATERIAL_PRESENTATION = {
  kind: "lit-asset",
  geometry: "handle-sphere",
  skylight: "engine-canonical",
  directionalLight: "engine-canonical",
  skybox: "engine-canonical"
};
var MESH_PRESENTATION = {
  kind: "lit-asset",
  geometry: "asset-mesh",
  skylight: "engine-canonical",
  directionalLight: "engine-canonical",
  skybox: "engine-canonical"
};
var VFX_PRESENTATION = MATERIAL_PRESENTATION;
var TEXTURE_PRESENTATION = {
  kind: "texture-unlit",
  geometry: "aspect-quad",
  checkerboard: "linear-alpha"
};

// src/kit/receipt.ts
var digestPattern = /^sha256:[0-9a-f]{64}$/;
function invalid(field) {
  return {
    ok: false,
    error: {
      code: "preview-kit-receipt-invalid",
      expected: `canonical kit receipt field ${field} to be producer-owned and content-addressed`,
      hint: "Run the canonical kit producer and consume its current receipt; do not derive identity from a path or project preset.",
      detail: { field, phase: "receipt" }
    }
  };
}
function isRecord3(value) {
  return typeof value === "object" && value !== null;
}
function validateCanonicalKitReceipt(value) {
  if (!isRecord3(value)) return invalid("root");
  if (value.schemaVersion !== "1.0.0") return invalid("schemaVersion");
  if (value.producer !== "packages/preview/scripts/build-canonical-kit.mjs")
    return invalid("producer");
  const source = value.source;
  if (!isRecord3(source)) return invalid("source");
  if (typeof source.sourceKey !== "string" || !source.sourceKey.endsWith("sky.hdr") || typeof source.guid !== "string" || !digestPattern.test(String(source.digest)) || !digestPattern.test(String(source.metaDigest)))
    return invalid("source");
  const recipe = value.recipe;
  if (!isRecord3(recipe) || !digestPattern.test(String(recipe.digest)) || !isRecord3(recipe.value))
    return invalid("recipe");
  const recipeValue = recipe.value;
  const recipeFields = {
    schemaVersion: "1.0.0",
    rig: "handle-sphere",
    environment: "engine-canonical",
    skybox: "engine-canonical",
    skylight: "engine-canonical",
    directionalLight: "engine-canonical",
    stage: "neutral-material-checker-unlit",
    camera: "bounds-derived"
  };
  for (const [field, expected] of Object.entries(recipeFields)) {
    if (recipeValue[field] !== expected) return invalid(`recipe.value.${field}`);
  }
  const cooked = value.cooked;
  if (!isRecord3(cooked) || cooked.importer !== "image" || cooked.kind !== "equirect" || !digestPattern.test(String(cooked.sourceDigest)) || !digestPattern.test(String(cooked.metaDigest)) || cooked.sourceDigest !== source.digest || cooked.metaDigest !== source.metaDigest)
    return invalid("cooked");
  const packageValue = value.package;
  if (!isRecord3(packageValue) || packageValue.name !== "@forgeax/engine-preview" || packageValue.root !== "assets/canonical-kit")
    return invalid("package");
  const transport = value.transport;
  if (!isRecord3(transport) || transport.dev !== "pluginPack" || transport.build !== "pluginPack" || transport.sdk !== "files/assets/canonical-kit" || transport.source !== "sky.hdr" || transport.meta !== "sky.hdr.meta.json")
    return invalid("transport");
  return { ok: true, value };
}

// src/domains/material.ts
function isRecord4(value) {
  return typeof value === "object" && value !== null;
}
function digest(value) {
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function inspectMaterialSubject(input) {
  if (!isRecord4(input.asset) || input.asset.kind !== "material") {
    return subjectFailure("resource-preview-kind-mismatch", "a MaterialAsset with kind material", {
      phase: "subject",
      guid: input.guid,
      actualKind: isRecord4(input.asset) && typeof input.asset.kind === "string" ? input.asset.kind : "unknown"
    });
  }
  const passes = input.asset.passes;
  if (!Array.isArray(passes) || passes.length === 0) {
    return subjectFailure(
      "resource-preview-subject-invalid",
      "a MaterialAsset with at least one pass",
      {
        phase: "subject",
        guid: input.guid,
        field: "passes"
      }
    );
  }
  const first = passes.find((pass) => {
    if (!isRecord4(pass)) return false;
    const tags = isRecord4(pass.renderState) && isRecord4(pass.renderState.tags) ? pass.renderState.tags : void 0;
    const mode = tags?.LightMode ?? pass.name;
    return !/shadow|depth/i.test(String(mode));
  }) ?? passes[0];
  if (!isRecord4(first) || typeof first.name !== "string" || !isRecord4(first.program)) {
    return subjectFailure(
      "resource-preview-subject-invalid",
      "every material pass to declare a program",
      {
        phase: "subject",
        guid: input.guid,
        field: "passes[0]"
      }
    );
  }
  if (typeof first.program.module !== "string" || first.program.module.length === 0) {
    return subjectFailure(
      "resource-preview-subject-invalid",
      "the material program module identity to be present",
      {
        phase: "subject",
        guid: input.guid,
        field: "passes[0].program.module"
      }
    );
  }
  const owner = input.asset.ownerFacts;
  const ownerFacts = isRecord4(owner) ? owner : input.ownerFacts;
  const subjectDigest = digest(input.asset.digest ?? input.digest ?? ownerFacts?.subjectDigest);
  const bindingsDigest = digest(input.asset.bindingsDigest ?? ownerFacts?.bindingsDigest);
  const closureDigest = digest(input.asset.closureDigest ?? ownerFacts?.closureDigest);
  if (subjectDigest === void 0 || bindingsDigest === void 0 || closureDigest === void 0) {
    return subjectFailure(
      "resource-preview-subject-invalid",
      "the MaterialAsset owner to publish subject, bindings, and closure digests",
      { phase: "subject", guid: input.guid, field: "ownerFacts" }
    );
  }
  return {
    ok: true,
    value: {
      subjectDigest,
      program: first.program.module,
      pass: first.name,
      bindingsDigest,
      closureDigest
    }
  };
}
async function executeMaterialPreview(args, input) {
  if (input.assets === void 0)
    return subjectFailure(
      "resource-preview-subject-invalid",
      "resource preview host to expose the existing AssetRegistry",
      { phase: "asset-registry", runId: input.runId }
    );
  const loaded = await input.assets.loadByGuid(args.guid);
  if (!loaded.ok)
    return assetLoadFailure(
      "AssetRegistry.loadByGuid to resolve the requested material",
      input.runId,
      loaded.error
    );
  const inspected = inspectMaterialSubject({
    guid: args.guid,
    asset: loaded.value,
    ...loaded.digest === void 0 ? {} : { digest: loaded.digest },
    ...loaded.ownerFacts === void 0 ? {} : { ownerFacts: loaded.ownerFacts }
  });
  if (!inspected.ok) return inspected;
  const renderer = input.renderer;
  if (!input.rendererReady || !input.worldReady || renderer === void 0 || renderer.drawCalls <= 0 || renderer.nonBlackPixels <= 0 || renderer.observation === void 0)
    return subjectFailure(
      "resource-preview-oracle-failed",
      "shared World and Renderer to be ready",
      { phase: "renderer", runId: input.runId }
    );
  const observed = {
    subjectDigest: digest(renderer.observation.subjectDigest) ?? "",
    program: digest(renderer.observation.program) ?? "",
    pass: digest(renderer.observation.pass) ?? "",
    bindingsDigest: digest(renderer.observation.bindingsDigest) ?? "",
    closureDigest: digest(renderer.observation.closureDigest) ?? "",
    rendererHealthy: input.rendererReady && input.worldReady,
    drawCalls: renderer.drawCalls,
    nonBlackPixels: renderer.nonBlackPixels
  };
  const oracle = evaluateMaterialOracle({ requested: inspected.value, observed });
  if (oracle.status !== "passed") {
    return subjectFailure(
      "resource-preview-oracle-failed",
      "the rendered material observation to match the loaded owner facts",
      { phase: "oracle", runId: input.runId, ...oracle.detail }
    );
  }
  return {
    ok: true,
    value: {
      subject: {
        kind: "material",
        guid: args.guid,
        digest: inspected.value.subjectDigest
      },
      presentation: canonicalPresentation("material"),
      recipe: createCanonicalPreviewRecipe("material"),
      oracle,
      artifacts: input.artifacts ?? []
    },
    artifacts: input.artifacts ?? []
  };
}

// src/material.ts
var materialPreviewArgsSchema = {
  parse(value) {
    if (value === null || typeof value !== "object")
      return { ok: false, error: "expected a material preview request object" };
    const request = value;
    if (request.subject?.kind !== "MaterialAsset" || typeof request.subject.guid !== "string")
      return { ok: false, error: "expected a MaterialAsset subject" };
    if (request.snapshot === void 0 || !Number.isSafeInteger(request.snapshot.revision) || typeof request.snapshot.digest !== "string")
      return { ok: false, error: "expected a revisioned snapshot" };
    const binding = request.binding;
    if (binding === void 0 || binding.guid !== request.subject.guid || binding.programDigest.length === 0 || binding.bindings.length === 0)
      return { ok: false, error: "expected a bound MaterialAsset program and bindings" };
    return { ok: true, value: request };
  },
  describe: '{"type":"object","required":["subject","snapshot","binding"],"properties":{"subject":{"type":"object","required":["kind","guid"],"properties":{"kind":{"const":"MaterialAsset"},"guid":{"type":"string"}}},"snapshot":{"type":"object","required":["revision","digest"]},"binding":{"type":"object","required":["guid","programDigest","bindings"]}}}'
};
var materialPreviewResultSchema = {
  parse: (value) => ({ ok: true, value }),
  describe: '{"type":"object","required":["subject","snapshot","report","artifacts"]}'
};
var materialPreviewDescriptor = {
  id: "material.preview",
  title: "Preview material asset",
  summary: "Renders one bound MaterialAsset on the fixed studio sphere presentation.",
  realm: "engine",
  argsSchema: materialPreviewArgsSchema,
  resultSchema: materialPreviewResultSchema,
  evidence: ["rhi-tape", "png", "profile-capture"],
  preview: {
    realm: "engine",
    subject: { kind: "MaterialAsset", guid: "<request>" },
    snapshot: { revision: 0, digest: "<request>" },
    requiredEvidence: ["rhi-tape", "png", "profile-capture"]
  }
};
function defaultMaterialRunner(request) {
  return Promise.resolve(previewRuntimeUnavailable(request.subject, request.snapshot, "material"));
}
function createMaterialPreviewContribution(runner = async (request) => defaultMaterialRunner(request)) {
  return defineTool(materialPreviewDescriptor, async (request, context) => {
    const result = await runner(request, context);
    if (!result.ok) return result;
    if (result.value.report.bindingGuid !== request.subject.guid || result.value.report.subjectNonBlackPixels <= 0 || result.value.report.backgroundNonBlackPixels <= 0 || result.value.report.presentation !== "sphere-studio") {
      return domainFailure(
        "preview-subject-falsified",
        "the requested material subject to render with a non-background studio presentation",
        "Reject fallback geometry, disconnected bindings, and background-only captures.",
        {
          requestGuid: request.subject.guid,
          reportBindingGuid: result.value.report.bindingGuid,
          subjectNonBlackPixels: result.value.report.subjectNonBlackPixels,
          backgroundNonBlackPixels: result.value.report.backgroundNonBlackPixels
        }
      );
    }
    const validated = validateDomainValue(result.value, request);
    if (!validated.ok) return validated;
    return { ok: true, value: validated.value };
  });
}
var materialPreview = defineTool(
  subjectDescriptor("material"),
  (args, context) => (async () => {
    const host = context.require(previewHostCapability);
    if (!host.ok) return host;
    return host.value.withSession(
      async (mechanisms) => executeMaterialPreview(args, {
        ...mechanisms.assets === void 0 ? {} : { assets: mechanisms.assets },
        ...mechanisms.renderer === void 0 ? {} : { renderer: mechanisms.renderer },
        rendererReady: mechanisms.renderer?.rendererReady === true,
        worldReady: mechanisms.renderer?.worldReady === true,
        runId: mechanisms.runId,
        ...mechanisms.artifacts === void 0 ? {} : { artifacts: mechanisms.artifacts }
      })
    );
  })()
);
nativePreviewPlugin("material", materialPreview);

// src/domains/mesh.ts
function isRecord5(value) {
  return typeof value === "object" && value !== null;
}
function digest2(value) {
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function observedAabb(observation) {
  const value = observation.aabb;
  if (!Array.isArray(value) || value.length !== 6 || value.some((entry) => typeof entry !== "number" || !Number.isFinite(entry)))
    return void 0;
  const [minX, minY, minZ, maxX, maxY, maxZ] = value;
  if (minX > maxX || minY > maxY || minZ > maxZ) return void 0;
  return [minX, minY, minZ, maxX, maxY, maxZ];
}
function inspectMeshSubject(input) {
  if (!isRecord5(input.asset) || input.asset.kind !== "mesh") {
    return subjectFailure("resource-preview-kind-mismatch", "a MeshAsset with kind mesh", {
      phase: "subject",
      guid: input.guid,
      actualKind: isRecord5(input.asset) && typeof input.asset.kind === "string" ? input.asset.kind : "unknown"
    });
  }
  const aabbValue = input.asset.aabb;
  const aabb = aabbValue instanceof Float32Array ? [...aabbValue] : Array.isArray(aabbValue) ? aabbValue : [];
  if (aabb.length !== 6 || aabb.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return subjectFailure("resource-preview-subject-invalid", "a finite six-value MeshAsset AABB", {
      phase: "subject",
      guid: input.guid,
      field: "aabb"
    });
  }
  const [minX, minY, minZ, maxX, maxY, maxZ] = aabb;
  if (minX > maxX || minY > maxY || minZ > maxZ) {
    return subjectFailure("resource-preview-subject-invalid", "a non-empty MeshAsset AABB", {
      phase: "subject",
      guid: input.guid,
      field: "aabb"
    });
  }
  const slots = input.asset.materialSlots;
  const submeshes = input.asset.submeshes;
  if (!Array.isArray(slots) || slots.length === 0) {
    return subjectFailure(
      "resource-preview-subject-invalid",
      "every mesh submesh to have a material slot",
      {
        phase: "subject",
        guid: input.guid,
        field: "materialSlots"
      }
    );
  }
  if (!Array.isArray(submeshes) || submeshes.length === 0) {
    return subjectFailure(
      "resource-preview-subject-invalid",
      "every MeshAsset to declare at least one submesh",
      {
        phase: "subject",
        guid: input.guid,
        field: "submeshes"
      }
    );
  }
  for (const submesh of submeshes) {
    if (!isRecord5(submesh)) {
      return subjectFailure(
        "resource-preview-subject-invalid",
        "each mesh submesh to be structured",
        {
          phase: "subject",
          guid: input.guid,
          field: "submeshes"
        }
      );
    }
    const materialSlot = submesh.materialSlot;
    const indexOffset = submesh.indexOffset;
    const indexCount = submesh.indexCount;
    if (typeof materialSlot !== "number" || materialSlot < 0 || materialSlot >= slots.length || typeof indexOffset !== "number" || typeof indexCount !== "number" || indexOffset < 0 || indexCount <= 0) {
      return subjectFailure(
        "resource-preview-subject-invalid",
        "every submesh range and material slot to be valid",
        {
          phase: "subject",
          guid: input.guid,
          field: "submeshes"
        }
      );
    }
  }
  const owner = input.asset.ownerFacts;
  const ownerFacts = isRecord5(owner) ? owner : input.ownerFacts;
  const subjectDigest = digest2(input.asset.digest ?? input.digest ?? ownerFacts?.subjectDigest);
  const vertexDigest = digest2(input.asset.vertexDigest ?? ownerFacts?.vertexDigest);
  const indexDigest = digest2(input.asset.indexDigest ?? ownerFacts?.indexDigest);
  const submeshDigest = digest2(input.asset.submeshDigest ?? ownerFacts?.submeshDigest);
  const aabbDigest = digest2(input.asset.aabbDigest ?? ownerFacts?.aabbDigest);
  if (subjectDigest === void 0 || vertexDigest === void 0 || indexDigest === void 0 || submeshDigest === void 0 || aabbDigest === void 0) {
    return subjectFailure(
      "resource-preview-subject-invalid",
      "the MeshAsset owner to publish vertex, index, submesh, AABB, and subject digests",
      { phase: "subject", guid: input.guid, field: "ownerFacts" }
    );
  }
  return {
    ok: true,
    value: {
      subjectDigest,
      vertexDigest,
      indexDigest,
      submeshDigest,
      aabbDigest,
      aabb: [minX, minY, minZ, maxX, maxY, maxZ],
      submeshCount: submeshes.length,
      materialSlotCount: slots.length
    }
  };
}
async function executeMeshPreview(args, input) {
  if (input.assets === void 0)
    return subjectFailure(
      "resource-preview-subject-invalid",
      "resource preview host to expose the existing AssetRegistry",
      { phase: "asset-registry", runId: input.runId }
    );
  const loaded = await input.assets.loadByGuid(args.guid);
  if (!loaded.ok)
    return assetLoadFailure(
      "AssetRegistry.loadByGuid to resolve the requested mesh",
      input.runId,
      loaded.error
    );
  const inspected = inspectMeshSubject({
    guid: args.guid,
    asset: loaded.value,
    ...loaded.digest === void 0 ? {} : { digest: loaded.digest },
    ...loaded.ownerFacts === void 0 ? {} : { ownerFacts: loaded.ownerFacts }
  });
  if (!inspected.ok) return inspected;
  const renderer = input.renderer;
  if (!input.rendererReady || !input.worldReady || renderer === void 0 || renderer.drawCalls <= 0 || renderer.nonBlackPixels <= 0 || renderer.observation === void 0)
    return subjectFailure(
      "resource-preview-oracle-failed",
      "shared World and Renderer to be ready",
      { phase: "renderer", runId: input.runId }
    );
  const aabb = observedAabb(renderer.observation);
  const submeshCount = renderer.observation.submeshCount;
  const materialSlotCount = renderer.observation.materialSlotCount;
  if (aabb === void 0 || typeof submeshCount !== "number" || typeof materialSlotCount !== "number") {
    return subjectFailure(
      "resource-preview-oracle-failed",
      "the rendered mesh observation to include AABB and material-slot facts",
      { phase: "renderer-observation", runId: input.runId }
    );
  }
  const observed = {
    ...inspected.value,
    subjectDigest: digest2(renderer.observation.subjectDigest) ?? "",
    vertexDigest: digest2(renderer.observation.vertexDigest) ?? "",
    indexDigest: digest2(renderer.observation.indexDigest) ?? "",
    submeshDigest: digest2(renderer.observation.submeshDigest) ?? "",
    aabbDigest: digest2(renderer.observation.aabbDigest) ?? "",
    aabb,
    submeshCount,
    materialSlotCount,
    rendererHealthy: input.rendererReady && input.worldReady,
    drawCalls: renderer.drawCalls,
    nonBlackPixels: renderer.nonBlackPixels
  };
  const oracle = evaluateMeshOracle({ requested: inspected.value, observed });
  if (oracle.status !== "passed") {
    return subjectFailure(
      "resource-preview-oracle-failed",
      "the rendered mesh observation to match the loaded owner facts",
      { phase: "oracle", runId: input.runId, ...oracle.detail }
    );
  }
  return {
    ok: true,
    value: {
      subject: { kind: "mesh", guid: args.guid, digest: inspected.value.subjectDigest },
      presentation: canonicalPresentation("mesh"),
      recipe: createCanonicalPreviewRecipe("mesh"),
      oracle,
      artifacts: input.artifacts ?? []
    },
    artifacts: input.artifacts ?? []
  };
}

// src/mesh.ts
var meshPreviewArgsSchema = {
  parse(value) {
    if (value === null || typeof value !== "object")
      return { ok: false, error: "expected a mesh preview request object" };
    const request = value;
    const binding = request.binding;
    if (request.subject?.kind !== "MeshAsset" || typeof request.subject.guid !== "string")
      return { ok: false, error: "expected a MeshAsset subject" };
    if (request.snapshot === void 0 || !Number.isSafeInteger(request.snapshot.revision) || typeof request.snapshot.digest !== "string")
      return { ok: false, error: "expected a revisioned snapshot" };
    if (binding === void 0 || binding.guid !== request.subject.guid || binding.vertexDigest.length === 0 || binding.indexDigest.length === 0 || binding.submeshes.length === 0 || binding.submeshes.some(
      (submesh) => submesh.id.length === 0 || submesh.vertexCount <= 0 || submesh.indexCount <= 0
    ) || binding.aabb.min.some((value2) => !Number.isFinite(value2)) || binding.aabb.max.some((value2) => !Number.isFinite(value2)) || binding.aabb.min.some((value2, index) => value2 >= (binding.aabb.max[index] ?? Number.NaN)))
      return { ok: false, error: "expected complete mesh buffers and a valid AABB" };
    return { ok: true, value: request };
  },
  describe: '{"type":"object","required":["subject","snapshot","binding"],"properties":{"subject":{"type":"object","required":["kind","guid"],"properties":{"kind":{"const":"MeshAsset"},"guid":{"type":"string"}}},"snapshot":{"type":"object","required":["revision","digest"]},"binding":{"type":"object","required":["guid","vertexDigest","indexDigest","submeshes","aabb"]}}}'
};
var meshPreviewResultSchema = {
  parse: (value) => ({ ok: true, value }),
  describe: '{"type":"object","required":["subject","snapshot","report","artifacts"]}'
};
var meshPreviewDescriptor = {
  id: "mesh.preview",
  title: "Preview mesh asset",
  summary: "Draws every bound mesh submesh with neutral material and AABB framing.",
  realm: "engine",
  argsSchema: meshPreviewArgsSchema,
  resultSchema: meshPreviewResultSchema,
  evidence: ["rhi-tape", "png", "profile-capture"],
  preview: {
    realm: "engine",
    subject: { kind: "MeshAsset", guid: "<request>" },
    snapshot: { revision: 0, digest: "<request>" },
    requiredEvidence: ["rhi-tape", "png", "profile-capture"]
  }
};
function defaultMeshRunner(request) {
  return Promise.resolve(previewRuntimeUnavailable(request.subject, request.snapshot, "mesh"));
}
function createMeshPreviewContribution(runner = async (request) => defaultMeshRunner(request)) {
  return defineTool(meshPreviewDescriptor, async (request, context) => {
    const result = await runner(request, context);
    if (!result.ok) return result;
    const report = result.value.report;
    if (report.bindingGuid !== request.subject.guid || report.submeshCount !== report.expectedSubmeshCount || report.submeshCount !== request.binding.submeshes.length || report.vertexCount !== request.binding.submeshes.reduce((sum, submesh) => sum + submesh.vertexCount, 0) || report.indexCount !== request.binding.submeshes.reduce((sum, submesh) => sum + submesh.indexCount, 0) || report.framing !== "aabb") {
      return domainFailure(
        "preview-subject-falsified",
        "all requested submeshes and the source AABB to drive the presentation",
        "Reject partial geometry, fallback meshes, and inverted framing before publishing evidence.",
        {
          requestGuid: request.subject.guid,
          reportBindingGuid: report.bindingGuid,
          expectedSubmeshCount: request.binding.submeshes.length,
          actualSubmeshCount: report.submeshCount,
          framing: report.framing
        }
      );
    }
    const validated = validateDomainValue(result.value, request);
    if (!validated.ok) return validated;
    return { ok: true, value: validated.value };
  });
}
var meshPreview = defineTool(
  subjectDescriptor("mesh"),
  (args, context) => (async () => {
    const host = context.require(previewHostCapability);
    if (!host.ok) return host;
    return host.value.withSession(
      async (mechanisms) => executeMeshPreview(args, {
        ...mechanisms.assets === void 0 ? {} : { assets: mechanisms.assets },
        ...mechanisms.renderer === void 0 ? {} : { renderer: mechanisms.renderer },
        rendererReady: mechanisms.renderer?.rendererReady === true,
        worldReady: mechanisms.renderer?.worldReady === true,
        runId: mechanisms.runId,
        ...mechanisms.artifacts === void 0 ? {} : { artifacts: mechanisms.artifacts }
      })
    );
  })()
);
nativePreviewPlugin("mesh", meshPreview);

// src/domains/texture.ts
function isRecord6(value) {
  return typeof value === "object" && value !== null;
}
function requiredString(asset, field) {
  const value = asset[field];
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function requiredNumber(asset, field) {
  const value = asset[field];
  return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function authoredMipCount(asset, shapeDimensions) {
  const mips = isRecord6(asset.mips) ? asset.mips : void 0;
  if (mips?.kind === "packed") {
    const levels2 = requiredNumber(mips, "levelCount");
    return levels2 !== void 0 && Number.isInteger(levels2) && levels2 > 0 ? levels2 : void 0;
  }
  if (mips?.kind !== "generate") return mips?.kind === "none" ? 1 : void 0;
  const [width, height] = shapeDimensions ?? [void 0, void 0];
  if (width === void 0 || height === void 0) return void 0;
  const shape = isRecord6(asset.shape) ? asset.shape : void 0;
  const extent = shape !== void 0 && isRecord6(shape.extent) ? shape.extent : void 0;
  const depth = shape?.viewDimension === "3d" && extent !== void 0 ? requiredNumber(extent, "depth") ?? 1 : 1;
  let largest = Math.max(width, height, depth);
  let levels = 1;
  while (largest > 1) {
    largest = Math.max(1, Math.floor(largest / 2));
    levels += 1;
  }
  return levels;
}
function isTexturePayloadClass(value) {
  return value === "black" || value === "transparent" || value === "single-channel" || value === "color";
}
function classifyPayload(data, format) {
  const bytes = data instanceof Uint8Array || data instanceof Uint8ClampedArray ? [...data] : Array.isArray(data) && data.every((value) => typeof value === "number") ? data : void 0;
  if (bytes === void 0 || bytes.length === 0) return void 0;
  const normalizedFormat = format?.toLowerCase() ?? "";
  const singleChannel = normalizedFormat.startsWith("r") && !normalizedFormat.startsWith("rg");
  if (bytes.every((value) => value === 0)) return "black";
  if (singleChannel) return "single-channel";
  if (normalizedFormat.startsWith("rgba") || normalizedFormat.startsWith("bgra")) {
    const alpha = bytes.filter((_, index) => (index + 1) % 4 === 0);
    if (alpha.length > 0 && alpha.every((value) => value === 0)) return "transparent";
  }
  return "color";
}
function observationString(observation, field) {
  const value = observation[field];
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function observationDimensions(observation) {
  const value = observation.dimensions;
  if (!Array.isArray(value) || value.length !== 2 || value.some((entry) => typeof entry !== "number" || !Number.isInteger(entry) || entry <= 0))
    return void 0;
  return [value[0], value[1]];
}
function observationPayloadClass(observation) {
  const value = observation.payloadClass;
  return isTexturePayloadClass(value) ? value : void 0;
}
function inspectTextureSubject(input) {
  if (!isRecord6(input.asset) || input.asset.kind !== "texture") {
    return subjectFailure("resource-preview-kind-mismatch", "a TextureAsset with kind texture", {
      phase: "subject",
      guid: input.guid,
      actualKind: isRecord6(input.asset) && typeof input.asset.kind === "string" ? input.asset.kind : "unknown"
    });
  }
  const asset = input.asset;
  const inlineOwner = asset.ownerFacts;
  const ownerFacts = isRecord6(inlineOwner) ? inlineOwner : input.ownerFacts;
  const readString = (field) => requiredString(asset, field) ?? requiredString(ownerFacts ?? {}, field);
  const subjectDigest = readString("digest") ?? input.digest ?? readString("subjectDigest");
  const boundDigest = readString("boundDigest");
  const uvDigest = readString("uvDigest");
  const bindingDigest = readString("bindingDigest");
  const format = readString("format");
  const colorSpace = readString("colorSpace");
  const filter = readString("filter");
  const shape = isRecord6(asset.shape) ? asset.shape : void 0;
  const extent = shape !== void 0 && isRecord6(shape.extent) ? shape.extent : void 0;
  const shapeDimensions = extent !== void 0 ? [requiredNumber(extent, "width"), requiredNumber(extent, "height")] : void 0;
  const dimensionsValue = asset.dimensions;
  const dimensions = Array.isArray(dimensionsValue) ? dimensionsValue : shapeDimensions?.[0] !== void 0 && shapeDimensions[1] !== void 0 ? shapeDimensions : [requiredNumber(asset, "width"), requiredNumber(asset, "height")];
  const authoredMips = isRecord6(asset.mips) ? asset.mips : void 0;
  const packedLevelCount = authoredMips?.kind === "packed" ? requiredNumber(authoredMips, "levelCount") : void 0;
  if (authoredMips?.kind === "packed" && (packedLevelCount === void 0 || !Number.isInteger(packedLevelCount) || packedLevelCount <= 0)) {
    return subjectFailure("resource-preview-subject-invalid", "TextureAsset packed mip metadata", {
      phase: "subject",
      guid: input.guid,
      field: "mips.levelCount"
    });
  }
  const mipCount = authoredMipCount(asset, shapeDimensions) ?? requiredNumber(asset, "mipCount") ?? requiredNumber(asset, "mipLevelCount") ?? requiredNumber(ownerFacts ?? {}, "mipCount") ?? requiredNumber(ownerFacts ?? {}, "mipLevelCount") ?? 1;
  const payloadClass = readString("payloadClass") ?? classifyPayload(asset.data, format) ?? void 0;
  if (subjectDigest === void 0 || boundDigest === void 0 || uvDigest === void 0 || bindingDigest === void 0 || format === void 0 || colorSpace === void 0 || filter === void 0 || dimensions.length !== 2 || dimensions.some(
    (value) => typeof value !== "number" || !Number.isInteger(value) || value <= 0
  ) || !Number.isInteger(mipCount) || mipCount <= 0 || !isTexturePayloadClass(payloadClass)) {
    return subjectFailure(
      "resource-preview-subject-invalid",
      "TextureAsset dimensions and owner binding facts",
      {
        phase: "subject",
        guid: input.guid,
        field: "digest/dimensions/format/colorSpace/mipCount/uv/filter/binding"
      }
    );
  }
  const [width = 0, height = 0] = dimensions;
  return {
    ok: true,
    value: {
      subjectDigest,
      boundDigest,
      dimensions: [width, height],
      format,
      colorSpace,
      mipCount,
      uvDigest,
      filter,
      bindingDigest,
      payloadClass
    }
  };
}
async function executeTexturePreview(args, input) {
  if (input.assets === void 0)
    return subjectFailure(
      "resource-preview-subject-invalid",
      "the existing AssetRegistry capability",
      {
        phase: "asset-registry",
        runId: input.runId
      }
    );
  const loaded = await input.assets.loadByGuid(args.guid);
  if (!loaded.ok)
    return assetLoadFailure(
      "AssetRegistry.loadByGuid to resolve the texture",
      input.runId,
      loaded.error
    );
  const inspected = inspectTextureSubject({
    guid: args.guid,
    asset: loaded.value,
    ...loaded.digest === void 0 ? {} : { digest: loaded.digest },
    ...loaded.ownerFacts === void 0 ? {} : { ownerFacts: loaded.ownerFacts }
  });
  if (!inspected.ok) return inspected;
  const renderer = input.renderer;
  const drawCalls = renderer?.texture?.drawCalls ?? renderer?.drawCalls ?? 0;
  if (renderer?.rendererReady !== true || renderer.worldReady !== true || drawCalls <= 0 || renderer.observation === void 0) {
    return subjectFailure(
      "resource-preview-oracle-failed",
      "shared World and Renderer texture stage to produce an observed output",
      {
        phase: "renderer",
        runId: input.runId
      }
    );
  }
  const observation = renderer.observation;
  const observedPayloadClass = observationPayloadClass(observation);
  if (observedPayloadClass === void 0) {
    return subjectFailure(
      "resource-preview-oracle-failed",
      "the rendered texture observation to classify the actual payload",
      { phase: "renderer-observation", runId: input.runId }
    );
  }
  if (observation.rendererTextureResident !== true) {
    return subjectFailure(
      "resource-preview-oracle-failed",
      "the Renderer to report a resident texture binding for the preview draw",
      { phase: "renderer-texture-binding", runId: input.runId }
    );
  }
  const observed = {
    subjectDigest: observationString(observation, "subjectDigest") ?? "",
    boundDigest: observationString(observation, "boundDigest") ?? "",
    dimensions: observationDimensions(observation) ?? [0, 0],
    format: observationString(observation, "format") ?? "",
    colorSpace: observationString(observation, "colorSpace") ?? "",
    mipCount: typeof observation.mipCount === "number" ? observation.mipCount : 0,
    uvDigest: observationString(observation, "uvDigest") ?? "",
    filter: observationString(observation, "filter") ?? "",
    bindingDigest: observationString(observation, "bindingDigest") ?? "",
    rendererHealthy: renderer.rendererReady && renderer.worldReady,
    drawCalls,
    nonBlackPixels: renderer.nonBlackPixels,
    payloadClass: observedPayloadClass
  };
  const oracle = evaluateTextureOracle({ requested: inspected.value, observed });
  if (oracle.status !== "passed") {
    return subjectFailure(
      "resource-preview-oracle-failed",
      "the rendered texture binding observation to match the loaded owner facts",
      { phase: "oracle", runId: input.runId, ...oracle.detail }
    );
  }
  return {
    ok: true,
    value: {
      subject: { kind: "texture", guid: args.guid, digest: inspected.value.subjectDigest },
      presentation: canonicalPresentation("texture"),
      recipe: createCanonicalPreviewRecipe("texture"),
      quad: { projection: "orthographic", aspect: "preserving", stage: "unlit-checker" },
      binding: { filter: inspected.value.filter, digest: inspected.value.bindingDigest },
      oracle,
      artifacts: input.artifacts ?? []
    },
    artifacts: input.artifacts ?? []
  };
}

// src/texture.ts
var texturePreviewArgsSchema = {
  parse(value) {
    if (value === null || typeof value !== "object")
      return { ok: false, error: "expected a texture preview request object" };
    const request = value;
    const binding = request.binding;
    if (request.subject?.kind !== "TextureAsset" || typeof request.subject.guid !== "string")
      return { ok: false, error: "expected a TextureAsset subject" };
    if (request.snapshot === void 0 || !Number.isSafeInteger(request.snapshot.revision) || typeof request.snapshot.digest !== "string")
      return { ok: false, error: "expected a revisioned snapshot" };
    if (binding === void 0 || binding.guid !== request.subject.guid || !Number.isSafeInteger(binding.width) || binding.width < 1 || !Number.isSafeInteger(binding.height) || binding.height < 1 || binding.format.length === 0 || !["linear", "srgb", "hdr"].includes(binding.colorSpace) || !Number.isSafeInteger(binding.mipLevels) || binding.mipLevels < 1 || !Number.isSafeInteger(binding.channels) || binding.channels < 1 || binding.channels > 4)
      return {
        ok: false,
        error: "expected complete texture dimensions, format, and color-space facts"
      };
    return { ok: true, value: request };
  },
  describe: '{"type":"object","required":["subject","snapshot","binding"],"properties":{"subject":{"type":"object","required":["kind","guid"],"properties":{"kind":{"const":"TextureAsset"},"guid":{"type":"string"}}},"snapshot":{"type":"object","required":["revision","digest"]},"binding":{"type":"object","required":["guid","width","height","format","colorSpace","alpha","mipLevels","channels"]}}}'
};
var texturePreviewResultSchema = {
  parse: (value) => ({ ok: true, value }),
  describe: '{"type":"object","required":["subject","snapshot","report","artifacts"]}'
};
var texturePreviewDescriptor = {
  id: "texture.preview",
  title: "Preview texture asset",
  summary: "Presents one texture on an aspect-correct quad with alpha checker evidence.",
  realm: "engine",
  argsSchema: texturePreviewArgsSchema,
  resultSchema: texturePreviewResultSchema,
  evidence: ["rhi-tape", "png", "profile-capture"],
  preview: {
    realm: "engine",
    subject: { kind: "TextureAsset", guid: "<request>" },
    snapshot: { revision: 0, digest: "<request>" },
    requiredEvidence: ["rhi-tape", "png", "profile-capture"]
  }
};
function defaultTextureRunner(request) {
  return Promise.resolve(previewRuntimeUnavailable(request.subject, request.snapshot, "texture"));
}
function createTexturePreviewContribution(runner = async (request) => defaultTextureRunner(request)) {
  return defineTool(texturePreviewDescriptor, async (request, context) => {
    const result = await runner(request, context);
    if (!result.ok) return result;
    const report = result.value.report;
    const binding = request.binding;
    if (report.bindingGuid !== request.subject.guid || report.width !== binding.width || report.height !== binding.height || report.format !== binding.format || report.colorSpace !== binding.colorSpace || report.alpha !== binding.alpha || report.mipLevels !== binding.mipLevels || report.channels !== binding.channels || report.aspectRatio !== binding.width / binding.height || report.checkerPixels <= 0 || report.subjectNonBlackPixels <= 0) {
      return domainFailure(
        "preview-subject-falsified",
        "the texture binding facts and aspect-correct checker presentation to agree",
        "Reject texture replacement, color-space drift, and background-only captures.",
        {
          requestGuid: request.subject.guid,
          reportBindingGuid: report.bindingGuid,
          expectedFormat: binding.format,
          actualFormat: report.format,
          expectedColorSpace: binding.colorSpace,
          actualColorSpace: report.colorSpace,
          expectedAspectRatio: binding.width / binding.height,
          actualAspectRatio: report.aspectRatio
        }
      );
    }
    const validated = validateDomainValue(result.value, request);
    if (!validated.ok) return validated;
    return { ok: true, value: validated.value };
  });
}
var texturePreview = defineTool(subjectDescriptor("texture"), (args, context) => {
  const host = context.require(previewHostCapability);
  if (!host.ok) return host;
  return host.value.withSession(
    async (mechanisms) => executeTexturePreview(args, {
      ...mechanisms.assets === void 0 ? {} : { assets: mechanisms.assets },
      ...mechanisms.renderer === void 0 ? {} : { renderer: mechanisms.renderer },
      runId: mechanisms.runId,
      ...mechanisms.artifacts === void 0 ? {} : { artifacts: mechanisms.artifacts }
    })
  );
});
nativePreviewPlugin("texture", texturePreview);

// src/domains/vfx.ts
function isRecord7(value) {
  return typeof value === "object" && value !== null;
}
function requiredString2(value) {
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function finiteVector(value, length) {
  if (!Array.isArray(value) || value.length !== length || value.some((entry) => typeof entry !== "number" || !Number.isFinite(entry)))
    return void 0;
  return value;
}
function authoredBounds(emitters) {
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (const emitter of emitters) {
    const bounds = emitter.bounds;
    if (!isRecord7(bounds) || typeof bounds.kind !== "string") return void 0;
    if (bounds.kind === "sphere") {
      const center = finiteVector(bounds.center, 3);
      const radius = bounds.radius;
      if (center === void 0 || typeof radius !== "number" || !Number.isFinite(radius) || radius < 0)
        return void 0;
      const [x, y, z] = center;
      if (x === void 0 || y === void 0 || z === void 0) return void 0;
      minX = Math.min(minX, x - radius);
      minY = Math.min(minY, y - radius);
      minZ = Math.min(minZ, z - radius);
      maxX = Math.max(maxX, x + radius);
      maxY = Math.max(maxY, y + radius);
      maxZ = Math.max(maxZ, z + radius);
      continue;
    }
    if (bounds.kind === "aabb") {
      const min = finiteVector(bounds.min, 3);
      const max = finiteVector(bounds.max, 3);
      if (min === void 0 || max === void 0 || min.some((entry, index) => entry > (max[index] ?? entry)))
        return void 0;
      const [loX, loY, loZ] = min;
      const [hiX, hiY, hiZ] = max;
      if (loX === void 0 || loY === void 0 || loZ === void 0 || hiX === void 0 || hiY === void 0 || hiZ === void 0)
        return void 0;
      minX = Math.min(minX, loX);
      minY = Math.min(minY, loY);
      minZ = Math.min(minZ, loZ);
      maxX = Math.max(maxX, hiX);
      maxY = Math.max(maxY, hiY);
      maxZ = Math.max(maxZ, hiZ);
      continue;
    }
    return void 0;
  }
  if (![minX, minY, minZ, maxX, maxY, maxZ].every(Number.isFinite)) return void 0;
  return [minX, minY, minZ, maxX, maxY, maxZ];
}
function jsonDigest(value) {
  const encoded = JSON.stringify(value);
  return typeof encoded === "string" && encoded.length > 0 ? encoded : void 0;
}
function inspectVfxSubject(input) {
  if (!isRecord7(input.asset) || input.asset.kind !== "particle-effect") {
    return subjectFailure(
      "resource-preview-kind-mismatch",
      "a ParticleEffectAsset with kind particle-effect",
      {
        phase: "subject",
        guid: input.guid,
        actualKind: isRecord7(input.asset) && typeof input.asset.kind === "string" ? input.asset.kind : "unknown"
      }
    );
  }
  if (input.asset.schemaVersion !== 3) {
    return subjectFailure("resource-preview-subject-invalid", "a schema-v3 ParticleEffectAsset", {
      phase: "subject",
      guid: input.guid,
      field: "schemaVersion"
    });
  }
  const program = input.asset.program;
  const programFingerprint = requiredString2(input.asset.programFingerprint);
  if (!isRecord7(program) || program.format !== "forgeax-vfx-program-4") {
    return subjectFailure(
      "resource-preview-subject-invalid",
      "a cooked forgeax-vfx-program-4 payload",
      {
        phase: "subject",
        guid: input.guid,
        field: "program"
      }
    );
  }
  if (programFingerprint === void 0 || requiredString2(program.fingerprint) !== programFingerprint) {
    return subjectFailure("resource-preview-subject-invalid", "non-empty authored VFX bounds", {
      phase: "subject",
      guid: input.guid,
      field: "programFingerprint"
    });
  }
  const rawEmitters = Array.isArray(program.emitters) ? program.emitters : [];
  const emitters = rawEmitters.filter(isRecord7);
  const definitions = Array.isArray(input.asset.emitters) ? input.asset.emitters.filter(isRecord7) : [];
  if (emitters.length === 0 || emitters.length !== rawEmitters.length || definitions.length !== emitters.length) {
    return subjectFailure(
      "resource-preview-subject-invalid",
      "the ParticleEffectAsset to publish matching cooked emitter definitions",
      { phase: "subject", guid: input.guid, field: "emitters" }
    );
  }
  for (const [index, emitter] of emitters.entries()) {
    const id = requiredString2(emitter.id);
    const module = requiredString2(emitter.module);
    const capacity = emitter.capacity;
    const backend = emitter.backend;
    const renderers = emitter.renderers;
    if (id === void 0 || module === void 0 || typeof capacity !== "number" || !Number.isSafeInteger(capacity) || capacity <= 0 || !isRecord7(backend) || backend.required !== "gpu" || !isRecord7(emitter.schedule) || !Array.isArray(renderers) || !isRecord7(definitions[index]) || definitions[index].id !== id || definitions[index].capacity !== capacity) {
      return subjectFailure(
        "resource-preview-subject-invalid",
        "each cooked emitter to match its ParticleEffectAsset definition",
        { phase: "subject", guid: input.guid, field: `emitters[${index}]` }
      );
    }
  }
  const bounds = authoredBounds(emitters);
  if (bounds === void 0) {
    return subjectFailure(
      "resource-preview-subject-invalid",
      "finite authored VFX emitter bounds",
      {
        phase: "subject",
        guid: input.guid,
        field: "program.emitters[].bounds"
      }
    );
  }
  const emitterDigest = jsonDigest(
    emitters.map(({ id, module, capacity }) => ({ id, module, capacity }))
  );
  const sampleDigest = jsonDigest(emitters.map(({ id, schedule }) => ({ id, schedule })));
  const boundsDigest = jsonDigest(
    emitters.map(({ id, bounds: emitterBounds }) => ({ id, bounds: emitterBounds }))
  );
  const indirectDigest = jsonDigest(
    emitters.map(({ id, renderers }) => ({
      id,
      renderers: renderers.filter(isRecord7).map((renderer) => ({
        kind: renderer.kind,
        enabled: renderer.enabled ?? true
      }))
    }))
  );
  if (emitterDigest === void 0 || sampleDigest === void 0 || boundsDigest === void 0 || indirectDigest === void 0) {
    return subjectFailure(
      "resource-preview-subject-invalid",
      "the cooked VFX program to publish stable emitter, schedule, bounds, and renderer facts",
      { phase: "subject", guid: input.guid, field: "program.emitters" }
    );
  }
  const ownerFacts = isRecord7(input.asset.ownerFacts) ? input.asset.ownerFacts : input.ownerFacts;
  const subjectDigest = requiredString2(input.asset.digest) ?? requiredString2(input.digest) ?? requiredString2(ownerFacts?.subjectDigest) ?? programFingerprint;
  const contactSheetDigest = requiredString2(ownerFacts?.contactSheetDigest);
  return {
    ok: true,
    value: {
      subjectDigest,
      programFingerprint,
      emitterDigest,
      sampleDigest,
      boundsDigest,
      computeDigest: programFingerprint,
      indirectDigest,
      ...contactSheetDigest === void 0 ? {} : { contactSheetDigest },
      authoredBounds: bounds
    }
  };
}
async function executeVfxPreview(args, input) {
  if (input.assets === void 0)
    return subjectFailure(
      "resource-preview-subject-invalid",
      "the existing AssetRegistry capability",
      {
        phase: "asset-registry",
        runId: input.runId
      }
    );
  const loaded = await input.assets.loadByGuid(args.guid);
  if (!loaded.ok)
    return assetLoadFailure(
      "AssetRegistry.loadByGuid to resolve the VFX",
      input.runId,
      loaded.error
    );
  const inspected = inspectVfxSubject({
    guid: args.guid,
    asset: loaded.value,
    ...loaded.digest === void 0 ? {} : { digest: loaded.digest },
    ...loaded.ownerFacts === void 0 ? {} : { ownerFacts: loaded.ownerFacts }
  });
  if (!inspected.ok) return inspected;
  const renderer = input.renderer;
  const runtime = input.renderer?.vfx;
  if (renderer?.rendererReady !== true || renderer.worldReady !== true || runtime === void 0 || renderer.observation === void 0) {
    return subjectFailure(
      "resource-preview-oracle-failed",
      "shared World, Renderer, and VFX compute runtime",
      {
        phase: "renderer",
        runId: input.runId
      }
    );
  }
  const observation = renderer.observation;
  const observedString = (field) => typeof observation[field] === "string" ? observation[field] : "";
  const authoredBounds2 = observation.authoredBounds;
  const seed = observation.seed;
  const fixedDelta = observation.fixedDelta;
  const timelineFrames = observation.timelineFrames;
  if (!Array.isArray(authoredBounds2) || authoredBounds2.length !== 6 || authoredBounds2.some((value) => typeof value !== "number" || !Number.isFinite(value)) || typeof seed !== "number" || typeof fixedDelta !== "number" || typeof timelineFrames !== "number" || !Number.isInteger(timelineFrames) || timelineFrames <= 0 || !Number.isFinite(seed) || !Number.isFinite(fixedDelta) || fixedDelta <= 0) {
    return subjectFailure(
      "resource-preview-oracle-failed",
      "the VFX render observation to include authored bounds and timeline facts",
      { phase: "renderer-observation", runId: input.runId }
    );
  }
  const observed = {
    ...inspected.value,
    subjectDigest: observedString("subjectDigest"),
    programFingerprint: observedString("programFingerprint"),
    emitterDigest: observedString("emitterDigest"),
    sampleDigest: observedString("sampleDigest"),
    boundsDigest: observedString("boundsDigest"),
    computeDigest: observedString("computeDigest"),
    indirectDigest: observedString("indirectDigest"),
    ...observedString("contactSheetDigest") === "" ? {} : { contactSheetDigest: observedString("contactSheetDigest") },
    authoredBounds: authoredBounds2,
    seed,
    fixedDelta,
    timelineFrames,
    rendererHealthy: renderer.rendererReady && renderer.worldReady,
    dispatches: runtime.dispatches,
    indirectDraws: runtime.indirectDraws,
    subjectOutputs: runtime.subjectOutputs,
    nonBlackPixels: renderer.nonBlackPixels
  };
  const oracle = evaluateVfxOracle({ requested: inspected.value, observed });
  if (oracle.status !== "passed") {
    return subjectFailure(
      "resource-preview-oracle-failed",
      "the VFX compute and indirect observation to match the loaded owner facts",
      { phase: "oracle", runId: input.runId, ...oracle.detail }
    );
  }
  return {
    ok: true,
    value: {
      subject: { kind: "vfx", guid: args.guid, digest: inspected.value.subjectDigest },
      presentation: canonicalPresentation("vfx"),
      recipe: createCanonicalPreviewRecipe("vfx"),
      authoredBounds: inspected.value.authoredBounds,
      timeline: {
        seed,
        fixedDelta,
        frames: timelineFrames
      },
      oracle,
      artifacts: input.artifacts ?? []
    },
    artifacts: input.artifacts ?? []
  };
}

// src/vfx.ts
var vfxPreviewArgsSchema = {
  parse(value) {
    if (value === null || typeof value !== "object")
      return { ok: false, error: "expected a VFX preview request object" };
    const request = value;
    const binding = request.binding;
    const simulation = request.simulation;
    if (request.subject?.kind !== "ParticleEffectAsset" || typeof request.subject.guid !== "string")
      return { ok: false, error: "expected a ParticleEffectAsset subject" };
    if (request.snapshot === void 0 || !Number.isSafeInteger(request.snapshot.revision) || typeof request.snapshot.digest !== "string")
      return { ok: false, error: "expected a revisioned snapshot" };
    if (binding === void 0 || binding.guid !== request.subject.guid || binding.effectDigest.length === 0 || simulation === void 0 || !Number.isSafeInteger(simulation.seed) || simulation.deltaSeconds <= 0 || !Number.isFinite(simulation.deltaSeconds) || !Number.isSafeInteger(simulation.frames) || simulation.frames < 1 || simulation.frames > 240)
      return { ok: false, error: "expected a bound effect and bounded deterministic timeline" };
    return { ok: true, value: request };
  },
  describe: '{"type":"object","required":["subject","snapshot","binding","simulation"],"properties":{"subject":{"type":"object","required":["kind","guid"],"properties":{"kind":{"const":"ParticleEffectAsset"},"guid":{"type":"string"}}},"snapshot":{"type":"object","required":["revision","digest"]},"binding":{"type":"object","required":["guid","effectDigest"]},"simulation":{"type":"object","required":["seed","deltaSeconds","frames"]}}}'
};
var vfxPreviewResultSchema = {
  parse: (value) => ({ ok: true, value }),
  describe: '{"type":"object","required":["subject","snapshot","report","artifacts"]}'
};
var vfxPreviewDescriptor = {
  id: "vfx.preview",
  title: "Preview particle effect asset",
  summary: "Runs a fixed-seed particle compute/draw timeline and captures its subject output.",
  realm: "engine",
  argsSchema: vfxPreviewArgsSchema,
  resultSchema: vfxPreviewResultSchema,
  evidence: ["rhi-tape", "png", "profile-capture"],
  preview: {
    realm: "engine",
    subject: { kind: "ParticleEffectAsset", guid: "<request>" },
    snapshot: { revision: 0, digest: "<request>" },
    requiredEvidence: ["rhi-tape", "png", "profile-capture"]
  }
};
function vfxDeterministicDigest(request) {
  return `sha256:vfx:${request.binding.effectDigest}:${request.simulation.seed}:${request.simulation.deltaSeconds}:${request.simulation.frames}`;
}
function defaultVfxRunner(request) {
  return Promise.resolve(previewRuntimeUnavailable(request.subject, request.snapshot, "vfx"));
}
function createVfxPreviewContribution(runner = async (request) => defaultVfxRunner(request)) {
  return defineTool(vfxPreviewDescriptor, async (request, context) => {
    const result = await runner(request, context);
    if (!result.ok) return result;
    const report = result.value.report;
    const expectedDigest = vfxDeterministicDigest(request);
    if (report.bindingGuid !== request.subject.guid || report.seed !== request.simulation.seed || report.deltaSeconds !== request.simulation.deltaSeconds || report.frames !== request.simulation.frames || report.computeSteps !== request.simulation.frames || report.drawCalls !== request.simulation.frames || report.subjectOutputDigest.length === 0 || report.deterministicDigest !== expectedDigest || report.captureNonBlackPixels <= 0) {
      return domainFailure(
        "preview-subject-falsified",
        "the effect binding, fixed simulation input, compute/draw steps, and subject output to agree",
        "Reject stale seed/delta reports and captures without a subject output.",
        {
          requestGuid: request.subject.guid,
          reportBindingGuid: report.bindingGuid,
          expectedDigest,
          actualDigest: report.deterministicDigest,
          computeSteps: report.computeSteps,
          drawCalls: report.drawCalls
        }
      );
    }
    const validated = validateDomainValue(result.value, request);
    if (!validated.ok) return validated;
    return { ok: true, value: validated.value };
  });
}
var vfxPreview = defineTool(
  subjectDescriptor("vfx"),
  (args, context) => (async () => {
    const host = context.require(previewHostCapability);
    if (!host.ok) return host;
    return host.value.withSession(
      async (mechanisms) => executeVfxPreview(args, {
        ...mechanisms.assets === void 0 ? {} : { assets: mechanisms.assets },
        ...mechanisms.renderer === void 0 ? {} : { renderer: mechanisms.renderer },
        runId: mechanisms.runId,
        ...mechanisms.artifacts === void 0 ? {} : { artifacts: mechanisms.artifacts }
      })
    );
  })()
);
nativePreviewPlugin("vfx", vfxPreview);

// src/primitive.ts
function previewSnapshot(subjectGuid, revision = 0) {
  if (subjectGuid.length === 0 || !Number.isSafeInteger(revision) || revision < 0) {
    throw new Error("preview primitive requires a stable subject snapshot");
  }
  return { revision, digest: `project-snapshot:${subjectGuid}:${revision}` };
}
function materialBindingFromPayload(guid, payload) {
  if (payload.kind !== "material" || payload.passes === void 0 || payload.passes.length === 0)
    return void 0;
  const program = payload.passes[0]?.program;
  if (!program?.module || payload.parameters === void 0 || payload.parameters.length === 0)
    return void 0;
  return {
    guid,
    programDigest: `material-program:${program.module}`,
    bindings: payload.parameters.map((parameter) => parameter.name)
  };
}
function meshBindingFromPayload(guid, payload) {
  if (payload.kind !== "mesh" || payload.vertices.length === 0 || !payload.aabb || payload.aabb.length !== 6)
    return void 0;
  const indices = payload.indices?.length ?? payload.vertices.length / 3;
  const [minX, minY, minZ, maxX, maxY, maxZ] = payload.aabb;
  if (minX === void 0 || minY === void 0 || minZ === void 0 || maxX === void 0 || maxY === void 0 || maxZ === void 0)
    return void 0;
  const submeshes = payload.submeshes.length > 0 ? payload.submeshes.map((submesh, index) => ({
    id: `submesh-${index}`,
    vertexCount: submesh.vertexCount,
    indexCount: submesh.indexCount
  })) : [{ id: "mesh", vertexCount: payload.vertices.length / 3, indexCount: indices }];
  if (submeshes.some((submesh) => submesh.vertexCount <= 0 || submesh.indexCount <= 0))
    return void 0;
  return {
    guid,
    vertexDigest: `mesh-vertices:${payload.vertices.length}`,
    indexDigest: `mesh-indices:${indices}`,
    submeshes,
    aabb: {
      min: [minX, minY, minZ],
      max: [maxX, maxY, maxZ]
    }
  };
}
function assertSnapshot(snapshot) {
  if (!Number.isSafeInteger(snapshot.revision) || snapshot.revision < 0 || snapshot.digest.length === 0)
    throw new Error("preview primitive requires a revisioned snapshot");
}
function assertSubject(subjectGuid, bindingGuid, domain) {
  if (subjectGuid.length === 0 || bindingGuid !== subjectGuid)
    throw new Error(`${domain} preview primitive subject and binding are disconnected`);
}
function subjectKind(operationId) {
  if (operationId === "material.preview") return "MaterialAsset";
  if (operationId === "mesh.preview") return "MeshAsset";
  if (operationId === "vfx.preview") return "ParticleEffectAsset";
  return "TextureAsset";
}
function base(operationId, subjectGuid, snapshot, binding, value) {
  assertSnapshot(snapshot);
  assertSubject(subjectGuid, binding.guid, operationId);
  return Object.freeze({
    ...value,
    operationId,
    source: "engine",
    subject: { kind: subjectKind(operationId), guid: subjectGuid },
    snapshot,
    binding
  });
}
function createMaterialPreviewPrimitive(input) {
  if (input.binding.programDigest.length === 0 || input.binding.bindings.length === 0)
    throw new Error("material preview primitive requires program bindings");
  return base(
    materialPreviewDescriptor.id,
    input.subjectGuid,
    input.snapshot,
    input.binding,
    {}
  );
}
function createMeshPreviewPrimitive(input) {
  if (input.binding.vertexDigest.length === 0 || input.binding.indexDigest.length === 0 || input.binding.submeshes.length === 0)
    throw new Error("mesh preview primitive requires complete geometry bindings");
  return base(
    meshPreviewDescriptor.id,
    input.subjectGuid,
    input.snapshot,
    input.binding,
    {}
  );
}
function createVfxPreviewPrimitive(input) {
  if (input.binding.effectDigest.length === 0 || input.simulation.frames < 1)
    throw new Error("vfx preview primitive requires a bounded effect simulation");
  return base(
    vfxPreviewDescriptor.id,
    input.subjectGuid,
    input.snapshot,
    input.binding,
    { simulation: input.simulation }
  );
}
function createTexturePreviewPrimitive(input) {
  if (input.binding.width < 1 || input.binding.height < 1 || input.binding.format.length === 0 || input.binding.mipLevels < 1 || input.binding.channels < 1)
    throw new Error("texture preview primitive requires complete dimensions and format facts");
  return base(
    texturePreviewDescriptor.id,
    input.subjectGuid,
    input.snapshot,
    input.binding,
    {}
  );
}

export { MATERIAL_PRESENTATION, MESH_PRESENTATION, PreviewCleanupError, RESOURCE_PREVIEW_DEFAULT_SIZE, RESOURCE_PREVIEW_MAX_SIZE, RESOURCE_PREVIEW_MIN_SIZE, TEXTURE_PRESENTATION, VFX_PRESENTATION, bindPreviewHost, canonicalPresentation, createAtomicPreviewPublisher, createCanonicalPreviewRecipe, createMaterialPreviewContribution, createMaterialPreviewPrimitive, createMeshPreviewContribution, createMeshPreviewPrimitive, createPreviewHost as createNativePreviewHost, createPreviewHost2 as createPreviewHost, createResourcePreviewReport, createTexturePreviewContribution, createTexturePreviewPrimitive, createVfxPreviewContribution, createVfxPreviewPrimitive, describeResourcePreviewFailure, evaluateMaterialOracle, evaluateMeshOracle, evaluateTextureOracle, evaluateVfxOracle, failedPreviewOracle, isResourcePreviewSize, materialBindingFromPayload, materialPreviewDescriptor, meshBindingFromPayload, meshPreviewDescriptor, passedPreviewOracle, previewHostCapability, previewHostPlugin, previewRuntimeUnavailable, previewSnapshot, texturePreviewDescriptor, validateCanonicalKitReceipt, vfxDeterministicDigest, vfxPreviewDescriptor };
