import { deriveStandardLayerPlan, MATERIAL_TEXTURE_SLOTS, isMaterialSurfaceDeclaration, isMaterialProgramAbi, ok, err } from '../../types/dist/index.mjs';
import { sha256 } from '../../../vendor/@noble/hashes/sha2.js';
import { bytesToHex } from '../../../vendor/@noble/hashes/utils.js';

// src/evidence/material-cook.ts
var STANDARD_ROOT_MODULES = /* @__PURE__ */ new Set([
  "forgeax::default-standard-pbr",
  "forgeax::pbr-skin",
  "forgeax_material::standard",
  "forgeax_material::pbr-skin"
]);
function isStandardRootModule(module) {
  return STANDARD_ROOT_MODULES.has(module);
}
function isStandardMaterialRecord(record) {
  return record.resolved.passes.some((pass) => isStandardRootModule(pass.program.module));
}
function materialLayerPlanIdentity(record) {
  if (!isStandardMaterialRecord(record)) {
    return void 0;
  }
  return deriveStandardLayerPlan(record.resolved.parameters, record.resolved.passes).identity;
}
function unique(values) {
  return [...new Set(values)].sort();
}
function guidText(value) {
  return typeof value === "string" ? value : Array.from(value, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function cookGuidText(value) {
  return typeof value === "number" ? void 0 : guidText(value);
}
function textureValues(values, textureFields) {
  return Object.entries(values ?? {}).flatMap(([name, value]) => {
    if (value === null) return [];
    if (typeof value === "string") {
      return textureFields.has(name) ? [{ texture: value }] : [];
    }
    return value !== null && typeof value === "object" && !Array.isArray(value) && "texture" in value ? [value] : [];
  });
}
function collectMaterialCookRefs(material) {
  const textureFields = material.parameters === void 0 ? new Set(MATERIAL_TEXTURE_SLOTS) : new Set(
    material.parameters.filter(
      (parameter) => parameter.type === "texture" || parameter.type === "texture_cube"
    ).map((parameter) => parameter.name)
  );
  const textures = textureValues(material.values, textureFields);
  return {
    parent: material.parent ? [guidText(material.parent)] : [],
    textures: unique(
      textures.flatMap((value) => {
        const guid = cookGuidText(value.texture);
        return guid === void 0 ? [] : [guid];
      })
    ),
    samplers: unique(
      textures.flatMap((value) => {
        if (value.sampler === void 0) return [];
        const guid = cookGuidText(value.sampler);
        return guid === void 0 ? [] : [guid];
      })
    ),
    modules: unique([
      ...(material.passes ?? []).map((pass) => pass.program.module),
      ...material.surface === void 0 ? [] : [material.surface.module]
    ])
  };
}
function createMaterialArtifactDigest(bytes) {
  return `sha256:${bytesToHex(sha256(bytes))}`;
}
function jsonValue(value) {
  if (value instanceof Uint8Array) return [...value];
  if (Array.isArray(value)) return value.map(jsonValue);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).filter(([, entry]) => entry !== void 0).sort(([a], [b]) => a.localeCompare(b)).map(([key, entry]) => [key, jsonValue(entry)])
    );
  }
  return value;
}
function createMaterialCookIdentity(input) {
  const cookIdentity = createMaterialArtifactDigest(
    new TextEncoder().encode(
      JSON.stringify(
        jsonValue({
          materialContractDigest: input.materialContractDigest,
          sourceRevision: input.sourceRevision,
          sourceClosureDigest: input.sourceClosureDigest,
          layoutIdentity: input.layoutIdentity,
          programIdentity: input.programIdentity,
          pipelineIdentity: input.pipelineIdentity,
          compilerFingerprint: input.compilerFingerprint,
          wasm: input.wasm,
          artifactDigest: input.artifactDigest
        })
      )
    )
  );
  return { ...input, cookIdentity };
}
function serializeCookedMaterialRecord(record) {
  return JSON.stringify(jsonValue(record));
}
function serializeMaterialCookReceipt(receipt) {
  return JSON.stringify(jsonValue({ ...receipt, sourceClosure: unique(receipt.sourceClosure) }));
}
function invalid(field, actual) {
  return err({
    code: "material-cook-record-invalid",
    expected: "a complete material-cook/4 record with layered identity and provenance",
    hint: "re-cook the material and publish its record, artifact, references, and receipt together",
    detail: {
      field,
      ...actual === void 0 ? {} : { actual },
      action: "inspect the named field and recook the material generation"
    }
  });
}
function normalizeArtifactBytes(value) {
  if (Array.isArray(value)) {
    return value.every((byte) => Number.isInteger(byte) && byte >= 0 && byte <= 255) ? Uint8Array.from(value) : void 0;
  }
  if (!ArrayBuffer.isView(value)) return void 0;
  const view = value;
  return new Uint8Array(view.buffer, view.byteOffset, view.byteLength).slice();
}
var IDENTITY_FIELDS = [
  "materialContractDigest",
  "sourceRevision",
  "sourceClosureDigest",
  "layoutIdentity",
  "programIdentity",
  "pipelineIdentity",
  "materialPublicationIdentity",
  "cookIdentity",
  "compilerFingerprint",
  "artifactDigest"
];
function isGeneration(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 1;
}
function validateIdentity(value) {
  if (value === null || typeof value !== "object") return invalid("receipt.identity", value);
  const candidate = value;
  for (const field of IDENTITY_FIELDS) {
    if (typeof candidate[field] !== "string" || candidate[field].length === 0) {
      return invalid(`receipt.identity.${field}`, candidate[field]);
    }
  }
  if (candidate.wasm === null || typeof candidate.wasm !== "object") {
    return invalid("receipt.identity.wasm", candidate.wasm);
  }
  const wasm = candidate.wasm;
  for (const field of ["sourceContentKey", "artifactSha256", "glueSha256"]) {
    if (typeof wasm[field] !== "string" || wasm[field].length === 0) {
      return invalid(`receipt.identity.wasm.${field}`, wasm[field]);
    }
  }
  for (const field of ["valueGeneration", "dependencyGeneration", "cookGeneration"]) {
    if (!isGeneration(candidate[field]))
      return invalid(`receipt.identity.${field}`, candidate[field]);
  }
  return ok({
    ...candidate,
    wasm
  });
}
function validateMaterialCookReceipt(value, expected = {}) {
  if (value === null || typeof value !== "object") return invalid("receipt");
  const candidate = value;
  if (candidate.schemaVersion !== "material-cook/4")
    return invalid("receipt.schemaVersion", candidate.schemaVersion);
  const identityResult = validateIdentity(candidate.identity);
  if (!identityResult.ok) return identityResult;
  const identity = identityResult.value;
  if (candidate.derivedInterface === null || typeof candidate.derivedInterface !== "object") {
    return invalid("receipt.derivedInterface", candidate.derivedInterface);
  }
  const derivedInterface = candidate.derivedInterface;
  if (derivedInterface.layoutIdentity !== identity.layoutIdentity) {
    return invalid("receipt.derivedInterface.layoutIdentity", derivedInterface.layoutIdentity);
  }
  if (derivedInterface.layerPlanIdentity !== void 0 && (typeof derivedInterface.layerPlanIdentity !== "string" || derivedInterface.layerPlanIdentity.length === 0)) {
    return invalid(
      "receipt.derivedInterface.layerPlanIdentity",
      derivedInterface.layerPlanIdentity
    );
  }
  for (const field of ["sourceClosure", "profile", "compilerVersion"]) {
    const fieldValue = candidate[field];
    if (field === "sourceClosure" && !Array.isArray(fieldValue) || field !== "sourceClosure" && typeof fieldValue !== "string") {
      return invalid(`receipt.${field}`, fieldValue);
    }
  }
  const sourceClosure = candidate.sourceClosure;
  if (Array.isArray(sourceClosure) && sourceClosure.some((path) => typeof path !== "string")) {
    return invalid("receipt.sourceClosure", sourceClosure);
  }
  if (expected.layoutIdentity !== void 0 && identity.layoutIdentity !== expected.layoutIdentity) {
    return invalid("receipt.identity.layoutIdentity", identity.layoutIdentity);
  }
  if (expected.artifactDigest !== void 0 && identity.artifactDigest !== expected.artifactDigest) {
    return invalid("receipt.identity.artifactDigest", identity.artifactDigest);
  }
  if (expected.inputDigest !== void 0 && identity.cookIdentity !== expected.inputDigest) {
    return invalid("receipt.identity.cookIdentity", identity.cookIdentity);
  }
  return ok({
    schemaVersion: "material-cook/4",
    sourceClosure: candidate.sourceClosure,
    profile: candidate.profile,
    compilerVersion: candidate.compilerVersion,
    identity,
    derivedInterface: {
      layoutIdentity: derivedInterface.layoutIdentity,
      ...derivedInterface.layerPlanIdentity === void 0 ? {} : { layerPlanIdentity: derivedInterface.layerPlanIdentity }
    }
  });
}
function validateCookedMaterialRecord(value) {
  if (value === null || typeof value !== "object") return invalid("record");
  const candidate = value;
  if (candidate.schemaVersion !== "material-cook/4")
    return invalid("schemaVersion", candidate.schemaVersion);
  if (typeof candidate.guid !== "string" || !candidate.guid) return invalid("guid");
  if (candidate.materialGuid !== void 0 && typeof candidate.materialGuid !== "string")
    return invalid("materialGuid");
  if (candidate.publicationGeneration !== void 0 && !isGeneration(candidate.publicationGeneration))
    return invalid("publicationGeneration", candidate.publicationGeneration);
  if (candidate.specializationKey !== void 0 && typeof candidate.specializationKey !== "string")
    return invalid("specializationKey");
  if ("artifact" in candidate || "variants" in candidate || "variantContext" in candidate)
    return invalid("programs", "legacy single-artifact publication");
  if (candidate.artifactDigest !== void 0 && typeof candidate.artifactDigest !== "string")
    return invalid("artifactDigest");
  if (candidate.sourceClosure !== void 0 && (!Array.isArray(candidate.sourceClosure) || candidate.sourceClosure.some((path) => typeof path !== "string")))
    return invalid("sourceClosure");
  if (candidate.parameterContract !== void 0) {
    if (candidate.parameterContract === null || typeof candidate.parameterContract !== "object")
      return invalid("parameterContract");
    const parameterContract = candidate.parameterContract;
    if (!Array.isArray(parameterContract.parameters))
      return invalid("parameterContract.parameters");
    if (parameterContract.values === null || typeof parameterContract.values !== "object" || Array.isArray(parameterContract.values))
      return invalid("parameterContract.values");
  }
  if (candidate.resolved === null || typeof candidate.resolved !== "object")
    return invalid("resolved");
  if (candidate.refs === null || typeof candidate.refs !== "object") return invalid("refs");
  if (candidate.receipt === null || typeof candidate.receipt !== "object")
    return invalid("receipt");
  const resolved = candidate.resolved;
  if (!Array.isArray(resolved.passes)) return invalid("resolved.passes", resolved.passes);
  if (!Array.isArray(resolved.parameters))
    return invalid("resolved.parameters", resolved.parameters);
  if (resolved.values === null || typeof resolved.values !== "object" || Array.isArray(resolved.values))
    return invalid("resolved.values", resolved.values);
  if (resolved.surface !== void 0 && !isMaterialSurfaceDeclaration(resolved.surface))
    return invalid("resolved.surface", resolved.surface);
  const passes = resolved.passes;
  const passNames = /* @__PURE__ */ new Set();
  for (const [index, pass] of passes.entries()) {
    if (pass === null || typeof pass !== "object" || typeof pass.name !== "string" || !pass.name || passNames.has(pass.name) || pass.program === null || typeof pass.program !== "object" || typeof pass.program.module !== "string")
      return invalid(`resolved.passes[${index}]`);
    passNames.add(pass.name);
  }
  if (!Array.isArray(candidate.programs) || candidate.programs.length === 0)
    return invalid("programs");
  const programs = [];
  const programKeys = /* @__PURE__ */ new Set();
  const selections = /* @__PURE__ */ new Set();
  const submissionSelections = /* @__PURE__ */ new Map();
  let modernPublication = false;
  let legacySelectionField;
  const selectedPasses = /* @__PURE__ */ new Set();
  for (const [index, entry] of candidate.programs.entries()) {
    const field = `programs[${index}]`;
    if (entry === null || typeof entry !== "object") return invalid(field);
    const program = entry;
    if (typeof program.specializationKey !== "string" || !program.specializationKey || programKeys.has(program.specializationKey))
      return invalid(`${field}.specializationKey`);
    programKeys.add(program.specializationKey);
    if (program.artifact === null || typeof program.artifact !== "object")
      return invalid(`${field}.artifact`);
    const artifact = program.artifact;
    const bytes = normalizeArtifactBytes(artifact.bytes);
    if (artifact.mediaType !== "text/wgsl" || typeof artifact.path !== "string" || !artifact.path || typeof artifact.digest !== "string" || !artifact.digest || bytes === void 0)
      return invalid(`${field}.artifact`);
    if (!Array.isArray(program.selections) || program.selections.length === 0)
      return invalid(`${field}.selections`);
    const programSelections = [];
    for (const [selectionIndex, rawSelection] of program.selections.entries()) {
      const selectionField = `${field}.selections[${selectionIndex}]`;
      if (rawSelection === null || typeof rawSelection !== "object") return invalid(selectionField);
      const selection = rawSelection;
      if (typeof selection.pass !== "string" || !passNames.has(selection.pass))
        return invalid(selectionField);
      const context = validateMaterialCookProgramContext(selection.context);
      if (!context.ok)
        return invalid(
          `${selectionField}.${context.error.detail.field}`,
          context.error.detail.actual
        );
      const address = selection.address === void 0 ? "direct" : selection.address;
      if (address !== "direct" && address !== "scene-index")
        return invalid(`${selectionField}.address`, selection.address);
      const hasAddressFacts = selection.address !== void 0 || selection.entry !== void 0 || selection.abi !== void 0;
      modernPublication ||= hasAddressFacts;
      if (!hasAddressFacts) legacySelectionField ??= selectionField;
      const rawEntry = selection.entry;
      const entry2 = typeof rawEntry === "string" ? rawEntry : void 0;
      if (hasAddressFacts && selection.address === void 0)
        return invalid(
          `${selectionField}.address`,
          "modern ABI selections require an explicit address"
        );
      if (hasAddressFacts && (entry2 === void 0 || entry2.length === 0))
        return invalid(`${selectionField}.entry`, rawEntry);
      if (hasAddressFacts && !isMaterialProgramAbi(selection.abi))
        return invalid(`${selectionField}.abi`, selection.abi);
      if (hasAddressFacts) {
        const abi = selection.abi;
        const expectedEntry = address === "direct" ? abi.directEntry : abi.sceneIndexEntry;
        if (entry2 !== expectedEntry)
          return invalid(`${selectionField}.entry`, "entry does not match published ABI");
        const submissionKey = JSON.stringify([
          selection.pass,
          materialProgramContextKey(context.value)
        ]);
        const addresses = submissionSelections.get(submissionKey) ?? /* @__PURE__ */ new Set();
        addresses.add(address);
        submissionSelections.set(submissionKey, addresses);
      }
      const key = JSON.stringify([
        selection.pass,
        materialProgramContextKey(context.value),
        address
      ]);
      if (selections.has(key)) return invalid(selectionField, "ambiguous Pass/context selection");
      selections.add(key);
      selectedPasses.add(selection.pass);
      programSelections.push({
        pass: selection.pass,
        context: context.value,
        ...selection.address === void 0 ? {} : { address },
        ...entry2 === void 0 ? {} : { entry: entry2 },
        ...selection.abi === void 0 ? {} : { abi: selection.abi }
      });
    }
    programs.push({
      specializationKey: program.specializationKey,
      artifact: { mediaType: "text/wgsl", path: artifact.path, digest: artifact.digest, bytes },
      selections: programSelections
    });
  }
  if (modernPublication && legacySelectionField !== void 0) {
    return invalid(
      legacySelectionField,
      "modern material publications require address, entry, and ABI facts on every selection"
    );
  }
  for (const [selectionKey, addresses] of submissionSelections) {
    if (addresses.size !== 2) {
      return invalid("programs.selections", `incomplete submission address pair: ${selectionKey}`);
    }
  }
  if ([...passNames].some((pass) => !selectedPasses.has(pass)))
    return invalid("programs.selections", "unpublished Pass");
  const manifestDigest = createMaterialProgramSetDigest(programs, passes);
  const receiptResult = validateMaterialCookReceipt(candidate.receipt, {
    artifactDigest: manifestDigest
  });
  if (!receiptResult.ok) return receiptResult;
  let expectedLayerPlanIdentity;
  try {
    expectedLayerPlanIdentity = materialLayerPlanIdentity({
      resolved
    });
  } catch (error) {
    return invalid("resolved.layerPlanIdentity", error instanceof Error ? error.message : error);
  }
  if (expectedLayerPlanIdentity !== void 0 && receiptResult.value.derivedInterface.layerPlanIdentity !== expectedLayerPlanIdentity) {
    return invalid(
      "receipt.derivedInterface.layerPlanIdentity",
      receiptResult.value.derivedInterface.layerPlanIdentity
    );
  }
  if (candidate.artifactDigest !== void 0 && candidate.artifactDigest !== manifestDigest)
    return invalid("artifactDigest", candidate.artifactDigest);
  if (candidate.publicationGeneration !== void 0 && receiptResult.value.identity.cookGeneration !== candidate.publicationGeneration)
    return invalid("receipt.identity.cookGeneration", receiptResult.value.identity.cookGeneration);
  return ok({
    ...candidate,
    programs,
    receipt: receiptResult.value
  });
}
function projectCookedMaterialRecord(record) {
  return {
    resolved: record.resolved,
    refs: record.refs,
    programs: record.programs,
    receipt: record.receipt,
    schemaVersion: record.schemaVersion
  };
}
function materialProgramContextKey(context) {
  return JSON.stringify(jsonValue(context));
}
function validateMaterialCookProgramContext(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    return invalid("context", value);
  const context = value;
  const fields = {
    backend: ["webgpu", "webgl2", "wgpu-native"],
    capability: ["storage-buffer", "uniform-fallback"],
    pipeline: ["forward", "deferred"],
    geometry: ["mesh", "skinned", "sprite"],
    pass: ["forward", "shadow", "depth"],
    profile: ["forgeax-material-wgsl-v1"],
    toolchain: ["naga-oil"],
    instrumentation: ["none", "validation"]
  };
  for (const field of Object.keys(context)) {
    if (!(field in fields)) return invalid(`context.${field}`, context[field]);
  }
  for (const [field, allowed] of Object.entries(fields)) {
    if (!allowed.includes(context[field]))
      return invalid(`context.${field}`, context[field]);
  }
  return ok({ ...context });
}
function createMaterialProgramSetDigest(programs, passes) {
  const manifest = {
    passes,
    programs: programs.map((program) => ({
      specializationKey: program.specializationKey,
      artifact: {
        path: program.artifact.path,
        mediaType: program.artifact.mediaType,
        digest: program.artifact.digest
      },
      selections: [...program.selections].sort(
        (a, b) => JSON.stringify(jsonValue(a)).localeCompare(JSON.stringify(jsonValue(b)))
      )
    })).sort((a, b) => a.specializationKey.localeCompare(b.specializationKey))
  };
  return createMaterialArtifactDigest(
    new TextEncoder().encode(JSON.stringify(jsonValue(manifest)))
  );
}

export { collectMaterialCookRefs, createMaterialArtifactDigest, createMaterialCookIdentity, createMaterialProgramSetDigest, materialLayerPlanIdentity, materialProgramContextKey, projectCookedMaterialRecord, serializeCookedMaterialRecord, serializeMaterialCookReceipt, validateCookedMaterialRecord, validateMaterialCookProgramContext };
