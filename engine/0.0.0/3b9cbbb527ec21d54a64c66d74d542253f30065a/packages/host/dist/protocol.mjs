// src/protocol.ts
var HOST_ASSEMBLY_SCHEMA_VERSION = 1;
var HostAssemblyError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(code, expected, hint, detail) {
    super(`${code}: ${expected}`);
    this.name = "HostAssemblyError";
    this.code = code;
    this.expected = expected;
    this.hint = hint;
    this.detail = detail;
  }
};
function assertHostModuleCatalogIdentity(module, record) {
  if (record.version !== void 0 && record.version !== module.version) {
    throw new HostAssemblyError(
      "host-assembly-module-version-mismatch",
      `module ${module.name} to load catalog version ${module.version}`,
      "Regenerate the static Catalog from the same backend package revision.",
      { name: module.name, actual: record.version, expected: module.version }
    );
  }
  if (record.digest !== void 0 && module.digest !== void 0 && record.digest !== module.digest) {
    throw new HostAssemblyError(
      "host-assembly-module-version-mismatch",
      `module ${module.name} to load catalog digest ${module.digest ?? "none"}`,
      "Regenerate the static Catalog from the same backend package bytes.",
      { name: module.name, actual: record.digest, expected: module.digest ?? "none" }
    );
  }
  const versionMatches = record.version !== void 0 && record.version === module.version;
  const digestMatches = module.digest !== void 0 && record.digest !== void 0 && record.digest === module.digest;
  const staticWithoutIdentity = module.version === "static" && module.digest === void 0 && record.version === void 0 && record.digest === void 0;
  if (!versionMatches && !digestMatches && !staticWithoutIdentity) {
    throw new HostAssemblyError(
      "host-assembly-module-version-mismatch",
      `module ${module.name} to have a matching catalog code identity for ${module.version}`,
      "Add the generated module version or digest to the static Catalog.",
      {
        name: module.name,
        actual: record.version ?? record.digest ?? "unknown",
        expected: module.version
      }
    );
  }
}
function canonicalHostJson(value) {
  if (value === void 0) return "undefined";
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalHostJson).join(",")}]`;
  return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => `${JSON.stringify(key)}:${canonicalHostJson(item)}`).join(",")}}`;
}
function hostRevision(value) {
  let hash = 2166136261;
  for (const char of canonicalHostJson(value)) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
function cloneEntry(entry) {
  const config = entry.group ? entry.config?.map(cloneEntry) : entry.config;
  return {
    id: entry.id,
    name: entry.name,
    ...config === void 0 ? {} : { config },
    ...entry.group === void 0 ? {} : { group: entry.group },
    ...entry.disabled === void 0 ? {} : { disabled: entry.disabled },
    ...entry.inject === void 0 ? {} : { inject: entry.inject },
    ...entry.realm === void 0 ? {} : { realm: entry.realm }
  };
}
function projectPairs(pairs) {
  const entries = [];
  const modules = [];
  const projections = [];
  for (const pair of pairs) {
    if (pair.backend !== void 0 && pair.frontend !== void 0 && pair.backend.module.version !== pair.frontend.module.version) {
      throw new HostAssemblyError(
        "host-assembly-module-version-mismatch",
        `paired module ${pair.id} to use one code version on both hosts`,
        "Resolve backend and frontend package entries from the same locked package revision.",
        {
          name: pair.id,
          actual: pair.backend.module.version,
          expected: pair.frontend.module.version
        }
      );
    }
    if (pair.frontend === void 0) continue;
    entries.push(pair.frontend.entry);
    modules.push(pair.frontend.module);
    projections.push({
      id: pair.id,
      entryId: pair.frontend.entry.id,
      module: pair.frontend.module
    });
  }
  return { entries, modules, projections };
}
function assemblyPairsFromInput(input) {
  if (input.pairs !== void 0) {
    const projected = projectPairs(input.pairs);
    return {
      entries: input.entries ?? projected.entries,
      modules: input.modules ?? projected.modules,
      pairs: projected.projections
    };
  }
  const entries = input.entries ?? [];
  const modules = [...input.modules ?? []];
  for (const [index, entry] of entries.entries()) {
    if (modules[index] !== void 0 || modules.some((module) => module.name === entry.name))
      continue;
    modules.push({
      name: entry.name,
      realm: entry.realm ?? "engine",
      version: "unknown"
    });
  }
  return {
    entries,
    modules,
    pairs: entries.map((entry, index) => ({
      id: entry.id,
      entryId: entry.id,
      module: modules[index]?.name === entry.name ? modules[index] : modules.find((module) => module.name === entry.name) ?? {
        name: entry.name,
        realm: entry.realm ?? "engine",
        version: "unknown"
      }
    }))
  };
}
function createHostAssembly(input) {
  const projected = assemblyPairsFromInput(input);
  const entries = projected.entries.map(cloneEntry);
  const modules = projected.modules.map((module) => ({ ...module }));
  const pairs = projected.pairs.map((pair) => ({ ...pair, module: { ...pair.module } }));
  const identity = {
    schemaVersion: HOST_ASSEMBLY_SCHEMA_VERSION,
    entries,
    modules,
    pairs,
    ...input.config === void 0 ? {} : { config: input.config }
  };
  return {
    ...identity,
    revision: hostRevision(identity)
  };
}
function validateEntry(entry, path) {
  if (entry === null || typeof entry !== "object") return `${path} must be an Entry object`;
  if (typeof entry.id !== "string" || entry.id.length === 0) return `${path}.id must be non-empty`;
  if (typeof entry.name !== "string" || entry.name.length === 0)
    return `${path}.name must be non-empty`;
  if (entry.group === true) {
    if (!Array.isArray(entry.config)) return `${path}.config must be an Entry array for a Group`;
    for (const [index, child] of entry.config.entries()) {
      const reason = validateEntry(child, `${path}.config[${index}]`);
      if (reason !== void 0) return reason;
    }
  }
  return void 0;
}
function validateHostAssembly(assembly) {
  if (assembly === null || typeof assembly !== "object") {
    return {
      ok: false,
      error: new HostAssemblyError(
        "host-assembly-invalid",
        "assembly to be an object",
        "Regenerate the frontend assembly from the active backend authority.",
        { reason: "assembly is not an object" }
      )
    };
  }
  if (assembly.schemaVersion !== HOST_ASSEMBLY_SCHEMA_VERSION) {
    return {
      ok: false,
      error: new HostAssemblyError(
        "host-assembly-invalid",
        `assembly schema ${HOST_ASSEMBLY_SCHEMA_VERSION}`,
        "Regenerate the frontend assembly with the matching Engine host package.",
        { reason: `unsupported schema ${String(assembly.schemaVersion)}` }
      )
    };
  }
  if (!Array.isArray(assembly.entries) || !Array.isArray(assembly.modules)) {
    return {
      ok: false,
      error: new HostAssemblyError(
        "host-assembly-invalid",
        "assembly entries and modules to be arrays",
        "Regenerate the frontend assembly from the active backend authority.",
        { reason: "entries or modules is not an array" }
      )
    };
  }
  if (!Array.isArray(assembly.pairs)) {
    return {
      ok: false,
      error: new HostAssemblyError(
        "host-assembly-invalid",
        "assembly pairs to be an array",
        "Regenerate the assembly from the backend host using the matching host package.",
        { reason: "pairs is not an array" }
      )
    };
  }
  const seen = /* @__PURE__ */ new Set();
  for (const [index, entry] of assembly.entries.entries()) {
    const reason = validateEntry(entry, `entries[${index}]`);
    if (reason !== void 0) {
      return {
        ok: false,
        error: new HostAssemblyError(
          "host-assembly-invalid",
          "all assembly entries to be valid native EntryOptions",
          "Repair the backend Entry projection before publishing it to a browser.",
          { reason }
        )
      };
    }
    if (seen.has(entry.id)) {
      return {
        ok: false,
        error: new HostAssemblyError(
          "host-assembly-invalid",
          "assembly Entry ids to be unique",
          "Give repeated plugin instances independent stable ids.",
          { reason: `duplicate Entry id ${entry.id}` }
        )
      };
    }
    seen.add(entry.id);
  }
  const seenModules = /* @__PURE__ */ new Map();
  for (const [index, module] of assembly.modules.entries()) {
    if (module === null || typeof module !== "object" || typeof module.name !== "string" || typeof module.realm !== "string" || typeof module.version !== "string" || module.name.length === 0 || module.version.length === 0 || module.url !== void 0 && typeof module.url !== "string" || module.digest !== void 0 && (typeof module.digest !== "string" || module.digest.length === 0)) {
      return {
        ok: false,
        error: new HostAssemblyError(
          "host-assembly-invalid",
          "module names and versions to be non-empty",
          "Regenerate the module projection from the resolved package metadata.",
          { reason: `invalid module at index ${index}` }
        )
      };
    }
    const previousModule = seenModules.get(module.name);
    if (previousModule !== void 0 && (previousModule.realm !== module.realm || previousModule.version !== module.version || previousModule.url !== module.url || previousModule.digest !== module.digest)) {
      return {
        ok: false,
        error: new HostAssemblyError(
          "host-assembly-invalid",
          "assembly module identity to be consistent for repeated Entries",
          "Reuse one resolved module identity when a package has multiple Entry instances.",
          { reason: `module ${module.name} has conflicting identities` }
        )
      };
    }
    seenModules.set(module.name, module);
  }
  const seenPairIds = /* @__PURE__ */ new Set();
  for (const [index, pair] of assembly.pairs.entries()) {
    const pairModule = pair?.module;
    if (pair === null || typeof pair !== "object" || typeof pair.id !== "string" || pair.id.length === 0 || typeof pair.entryId !== "string" || pair.entryId.length === 0 || pairModule === null || pairModule === void 0 || typeof pairModule !== "object" || typeof pairModule.name !== "string" || typeof pairModule.realm !== "string" || typeof pairModule.version !== "string" || pairModule.name.length === 0 || pairModule.version.length === 0 || pairModule.url !== void 0 && typeof pairModule.url !== "string" || pairModule.digest !== void 0 && (typeof pairModule.digest !== "string" || pairModule.digest.length === 0)) {
      return {
        ok: false,
        error: new HostAssemblyError(
          "host-assembly-invalid",
          "assembly pair identities and modules to be valid",
          "Regenerate paired frontend entries from the backend package manifest.",
          { reason: `invalid pair at index ${index}` }
        )
      };
    }
    if (seenPairIds.has(pair.id)) {
      return {
        ok: false,
        error: new HostAssemblyError(
          "host-assembly-invalid",
          "assembly pair ids to be unique",
          "Give each paired package instance an independent stable id.",
          { reason: `duplicate pair ${pair.id}` }
        )
      };
    }
    seenPairIds.add(pair.id);
    if (!assembly.entries.some((entry) => entry.id === pair.entryId)) {
      return {
        ok: false,
        error: new HostAssemblyError(
          "host-assembly-invalid",
          `pair ${pair.id} to reference an assembly Entry`,
          "Keep paired identity and frontend Entry projection under one backend authority.",
          { reason: `missing frontend Entry ${pair.entryId}` }
        )
      };
    }
    const module = assembly.modules.find(
      (candidate) => candidate.name === pairModule.name && candidate.realm === pairModule.realm && candidate.version === pairModule.version && candidate.url === pairModule.url && candidate.digest === pairModule.digest
    );
    if (module === void 0) {
      return {
        ok: false,
        error: new HostAssemblyError(
          "host-assembly-invalid",
          `pair ${pair.id} to reference a resolved frontend module`,
          "Keep module/code identity in the backend-derived assembly projection.",
          { reason: `missing frontend module ${pairModule.name}` }
        )
      };
    }
  }
  const expected = hostRevision({
    schemaVersion: assembly.schemaVersion,
    entries: assembly.entries,
    modules: assembly.modules,
    pairs: assembly.pairs,
    ...assembly.config === void 0 ? {} : { config: assembly.config }
  });
  if (expected !== assembly.revision) {
    return {
      ok: false,
      error: new HostAssemblyError(
        "host-assembly-revision-mismatch",
        "assembly revision to match its entries and modules",
        "Discard the stale response and request the current backend assembly again.",
        { actual: assembly.revision, expected }
      )
    };
  }
  return { ok: true, value: assembly };
}
function modulesFromCatalog(catalog, realm, version = "static") {
  return [...catalog.entries()].filter(([, record]) => record.realm === realm).map(([name, record]) => ({
    name,
    realm,
    version: record.version ?? version,
    ...record.digest === void 0 ? {} : { digest: record.digest }
  }));
}

export { HOST_ASSEMBLY_SCHEMA_VERSION, HostAssemblyError, assertHostModuleCatalogIdentity, canonicalHostJson, createHostAssembly, hostRevision, modulesFromCatalog, validateHostAssembly };
