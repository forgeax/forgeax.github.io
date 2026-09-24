import { defineToolCapability, defineTool } from '../../tool-runtime/dist/index.mjs';
import { defineToolPlugin } from '../../plugin/dist/browser.mjs';

// src/texture.ts
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
    recipeDigest: `canonical:${kind}:${"texture-orthographic" }`
  };
}
function canonicalPresentation(kind) {
  {
    return {
      kind: "texture-unlit",
      geometry: "aspect-quad",
      checkerboard: "linear-alpha"
    };
  }
}

// src/domains/texture.ts
function isRecord2(value) {
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
  const mips = isRecord2(asset.mips) ? asset.mips : void 0;
  if (mips?.kind === "packed") {
    const levels2 = requiredNumber(mips, "levelCount");
    return levels2 !== void 0 && Number.isInteger(levels2) && levels2 > 0 ? levels2 : void 0;
  }
  if (mips?.kind !== "generate") return mips?.kind === "none" ? 1 : void 0;
  const [width, height] = shapeDimensions ?? [void 0, void 0];
  if (width === void 0 || height === void 0) return void 0;
  const shape = isRecord2(asset.shape) ? asset.shape : void 0;
  const extent = shape !== void 0 && isRecord2(shape.extent) ? shape.extent : void 0;
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
  if (!isRecord2(input.asset) || input.asset.kind !== "texture") {
    return subjectFailure("resource-preview-kind-mismatch", "a TextureAsset with kind texture", {
      phase: "subject",
      guid: input.guid,
      actualKind: isRecord2(input.asset) && typeof input.asset.kind === "string" ? input.asset.kind : "unknown"
    });
  }
  const asset = input.asset;
  const inlineOwner = asset.ownerFacts;
  const ownerFacts = isRecord2(inlineOwner) ? inlineOwner : input.ownerFacts;
  const readString = (field) => requiredString(asset, field) ?? requiredString(ownerFacts ?? {}, field);
  const subjectDigest = readString("digest") ?? input.digest ?? readString("subjectDigest");
  const boundDigest = readString("boundDigest");
  const uvDigest = readString("uvDigest");
  const bindingDigest = readString("bindingDigest");
  const format = readString("format");
  const colorSpace = readString("colorSpace");
  const filter = readString("filter");
  const shape = isRecord2(asset.shape) ? asset.shape : void 0;
  const extent = shape !== void 0 && isRecord2(shape.extent) ? shape.extent : void 0;
  const shapeDimensions = extent !== void 0 ? [requiredNumber(extent, "width"), requiredNumber(extent, "height")] : void 0;
  const dimensionsValue = asset.dimensions;
  const dimensions = Array.isArray(dimensionsValue) ? dimensionsValue : shapeDimensions?.[0] !== void 0 && shapeDimensions[1] !== void 0 ? shapeDimensions : [requiredNumber(asset, "width"), requiredNumber(asset, "height")];
  const authoredMips = isRecord2(asset.mips) ? asset.mips : void 0;
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
      presentation: canonicalPresentation(),
      recipe: createCanonicalPreviewRecipe("texture"),
      quad: { projection: "orthographic", aspect: "preserving", stage: "unlit-checker" },
      binding: { filter: inspected.value.filter, digest: inspected.value.bindingDigest },
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
var texturePreviewPlugin = nativePreviewPlugin("texture", texturePreview);
var texture_default = texturePreviewPlugin;

export { createTexturePreviewContribution, texture_default as default, texturePreview, texturePreviewDescriptor, texturePreviewPlugin };
