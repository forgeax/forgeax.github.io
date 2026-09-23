import { defineToolCapability, defineTool } from '../../tool-runtime/dist/index.mjs';
import { defineToolPlugin } from '../../plugin/dist/browser.mjs';

// src/material.ts

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
    recipeDigest: `canonical:${kind}:${"bounds-derived"}`
  };
}
function canonicalPresentation(kind) {
  return {
    kind: "lit-asset",
    geometry: kind === "mesh" ? "asset-mesh" : "handle-sphere",
    skylight: "engine-canonical",
    directionalLight: "engine-canonical",
    skybox: "engine-canonical"
  };
}
var previewHostCapability = defineToolCapability("preview.host");

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

// src/domains/material.ts
function isRecord2(value) {
  return typeof value === "object" && value !== null;
}
function digest(value) {
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function inspectMaterialSubject(input) {
  if (!isRecord2(input.asset) || input.asset.kind !== "material") {
    return subjectFailure("resource-preview-kind-mismatch", "a MaterialAsset with kind material", {
      phase: "subject",
      guid: input.guid,
      actualKind: isRecord2(input.asset) && typeof input.asset.kind === "string" ? input.asset.kind : "unknown"
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
    if (!isRecord2(pass)) return false;
    const tags = isRecord2(pass.renderState) && isRecord2(pass.renderState.tags) ? pass.renderState.tags : void 0;
    const mode = tags?.LightMode ?? pass.name;
    return !/shadow|depth/i.test(String(mode));
  }) ?? passes[0];
  if (!isRecord2(first) || typeof first.name !== "string" || !isRecord2(first.program)) {
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
  const ownerFacts = isRecord2(owner) ? owner : input.ownerFacts;
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
var materialPreviewPlugin = nativePreviewPlugin("material", materialPreview);
var material_default = materialPreviewPlugin;

export { createMaterialPreviewContribution, material_default as default, materialPreview, materialPreviewDescriptor, materialPreviewPlugin };
