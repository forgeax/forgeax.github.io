import { defineToolCapability, defineTool } from '../../tool-runtime/dist/index.mjs';
import { defineToolPlugin } from '../../plugin/dist/browser.mjs';

// src/vfx.ts
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

// src/domains/vfx.ts
function isRecord2(value) {
  return typeof value === "object" && value !== null;
}
function requiredString(value) {
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
    if (!isRecord2(bounds) || typeof bounds.kind !== "string") return void 0;
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
  if (!isRecord2(input.asset) || input.asset.kind !== "particle-effect") {
    return subjectFailure(
      "resource-preview-kind-mismatch",
      "a ParticleEffectAsset with kind particle-effect",
      {
        phase: "subject",
        guid: input.guid,
        actualKind: isRecord2(input.asset) && typeof input.asset.kind === "string" ? input.asset.kind : "unknown"
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
  const programFingerprint = requiredString(input.asset.programFingerprint);
  if (!isRecord2(program) || program.format !== "forgeax-vfx-program-4") {
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
  if (programFingerprint === void 0 || requiredString(program.fingerprint) !== programFingerprint) {
    return subjectFailure("resource-preview-subject-invalid", "non-empty authored VFX bounds", {
      phase: "subject",
      guid: input.guid,
      field: "programFingerprint"
    });
  }
  const rawEmitters = Array.isArray(program.emitters) ? program.emitters : [];
  const emitters = rawEmitters.filter(isRecord2);
  const definitions = Array.isArray(input.asset.emitters) ? input.asset.emitters.filter(isRecord2) : [];
  if (emitters.length === 0 || emitters.length !== rawEmitters.length || definitions.length !== emitters.length) {
    return subjectFailure(
      "resource-preview-subject-invalid",
      "the ParticleEffectAsset to publish matching cooked emitter definitions",
      { phase: "subject", guid: input.guid, field: "emitters" }
    );
  }
  for (const [index, emitter] of emitters.entries()) {
    const id = requiredString(emitter.id);
    const module = requiredString(emitter.module);
    const capacity = emitter.capacity;
    const backend = emitter.backend;
    const renderers = emitter.renderers;
    if (id === void 0 || module === void 0 || typeof capacity !== "number" || !Number.isSafeInteger(capacity) || capacity <= 0 || !isRecord2(backend) || backend.required !== "gpu" || !isRecord2(emitter.schedule) || !Array.isArray(renderers) || !isRecord2(definitions[index]) || definitions[index].id !== id || definitions[index].capacity !== capacity) {
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
      renderers: renderers.filter(isRecord2).map((renderer) => ({
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
  const ownerFacts = isRecord2(input.asset.ownerFacts) ? input.asset.ownerFacts : input.ownerFacts;
  const subjectDigest = requiredString(input.asset.digest) ?? requiredString(input.digest) ?? requiredString(ownerFacts?.subjectDigest) ?? programFingerprint;
  const contactSheetDigest = requiredString(ownerFacts?.contactSheetDigest);
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
var vfxPreviewPlugin = nativePreviewPlugin("vfx", vfxPreview);
var vfx_default = vfxPreviewPlugin;

export { createVfxPreviewContribution, vfx_default as default, vfxDeterministicDigest, vfxPreview, vfxPreviewDescriptor, vfxPreviewPlugin };
