import { defineToolCapability, defineTool } from '../../tool-runtime/dist/index.mjs';
import { defineToolPlugin } from '../../plugin/dist/browser.mjs';

// src/mesh.ts

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

// src/domains/mesh.ts
function isRecord2(value) {
  return typeof value === "object" && value !== null;
}
function digest(value) {
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
  if (!isRecord2(input.asset) || input.asset.kind !== "mesh") {
    return subjectFailure("resource-preview-kind-mismatch", "a MeshAsset with kind mesh", {
      phase: "subject",
      guid: input.guid,
      actualKind: isRecord2(input.asset) && typeof input.asset.kind === "string" ? input.asset.kind : "unknown"
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
    if (!isRecord2(submesh)) {
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
  const ownerFacts = isRecord2(owner) ? owner : input.ownerFacts;
  const subjectDigest = digest(input.asset.digest ?? input.digest ?? ownerFacts?.subjectDigest);
  const vertexDigest = digest(input.asset.vertexDigest ?? ownerFacts?.vertexDigest);
  const indexDigest = digest(input.asset.indexDigest ?? ownerFacts?.indexDigest);
  const submeshDigest = digest(input.asset.submeshDigest ?? ownerFacts?.submeshDigest);
  const aabbDigest = digest(input.asset.aabbDigest ?? ownerFacts?.aabbDigest);
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
    subjectDigest: digest(renderer.observation.subjectDigest) ?? "",
    vertexDigest: digest(renderer.observation.vertexDigest) ?? "",
    indexDigest: digest(renderer.observation.indexDigest) ?? "",
    submeshDigest: digest(renderer.observation.submeshDigest) ?? "",
    aabbDigest: digest(renderer.observation.aabbDigest) ?? "",
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
var meshPreviewPlugin = nativePreviewPlugin("mesh", meshPreview);
var mesh_default = meshPreviewPlugin;

export { createMeshPreviewContribution, mesh_default as default, meshPreview, meshPreviewDescriptor, meshPreviewPlugin };
