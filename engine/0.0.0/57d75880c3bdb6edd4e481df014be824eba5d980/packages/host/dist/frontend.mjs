import { Context, createToolApiPlugin, inspectCatalogPlugins } from '../../plugin/dist/browser.mjs';
import { installCatalogLoader, projectPluginEntries } from '../../plugin/dist/loader.browser.mjs';

// src/frontend.ts

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
async function createHostStartup(options = {}) {
  const context = options.context ?? new Context();
  const ownedContext = options.context === void 0;
  const fibers = [];
  let disposed = false;
  try {
    for (const plugin of options.startupPlugins ?? []) fibers.push(await context.plugin(plugin));
  } catch (error) {
    for (const fiber of fibers.reverse()) await fiber.dispose();
    if (ownedContext) await context.fiber.dispose();
    throw error;
  }
  return {
    context,
    ownedContext,
    fibers,
    async dispose() {
      if (disposed) return;
      disposed = true;
      for (const fiber of [...fibers].reverse()) await fiber.dispose();
      if (ownedContext) await context.fiber.dispose();
    }
  };
}

// src/transport.ts
var HOST_ASSEMBLY_SERVICE = "host/assembly.get";
var HOST_ACTIVATION_REPORT_SERVICE = "host/assembly.report";

// src/frontend.ts
function hostFoundationPlugin(assembly, transport) {
  return {
    name: "forgeax:frontend-host-foundation",
    provide: ["hostAssembly", "hostTransport"],
    apply(ctx) {
      ctx.provide("hostAssembly", assembly);
      if (transport !== void 0) ctx.provide("hostTransport", transport);
    }
  };
}
function dynamicModuleRecord(name, realm, version, url, digest) {
  if (url === void 0) {
    return {
      realm,
      version,
      ...digest === void 0 ? {} : { digest },
      load: async () => {
        throw new HostAssemblyError(
          "host-assembly-module-missing",
          `module ${name} to have a browser URL or static Catalog record`,
          "Add the module to the frozen Catalog or publish its browser entry from the backend.",
          { name }
        );
      }
    };
  }
  return {
    realm,
    version,
    ...digest === void 0 ? {} : { digest },
    load: () => import(
      /* @vite-ignore */
      url
    )
  };
}
function catalogForAssembly(assembly, staticCatalog) {
  const catalog = /* @__PURE__ */ new Map();
  for (const module of assembly.modules) {
    const existing = staticCatalog?.get(module.name);
    if (existing !== void 0) {
      assertHostModuleCatalogIdentity(module, existing);
      catalog.set(module.name, existing);
      continue;
    }
    catalog.set(
      module.name,
      dynamicModuleRecord(module.name, module.realm, module.version, module.url, module.digest)
    );
  }
  for (const [name, record] of staticCatalog ?? []) {
    if (!catalog.has(name)) catalog.set(name, record);
  }
  return catalog;
}
function assertModuleVersions(assembly, versions) {
  if (versions === void 0) return;
  for (const module of assembly.modules) {
    const actual = versions.get(module.name);
    if (actual === void 0 || actual === module.version) continue;
    throw new HostAssemblyError(
      "host-assembly-module-version-mismatch",
      `module ${module.name} to use version ${module.version}`,
      "Refresh the browser module graph from the same backend assembly revision.",
      { name: module.name, actual, expected: module.version }
    );
  }
}
function moduleIdentity(module) {
  return `${module.version}@${module.digest ?? module.url ?? "<catalog>"}`;
}
function assertModuleReloadBoundary(previous, next) {
  const previousModules = new Map(previous.modules.map((module) => [module.name, module]));
  const nextModules = new Map(next.modules.map((module) => [module.name, module]));
  const names = /* @__PURE__ */ new Set([...previousModules.keys(), ...nextModules.keys()]);
  for (const name of names) {
    const before = previousModules.get(name);
    const after = nextModules.get(name);
    const beforeIdentity = before === void 0 ? "<absent>" : moduleIdentity(before);
    const afterIdentity = after === void 0 ? "<absent>" : moduleIdentity(after);
    if (before === void 0 || after === void 0 || before.realm !== after.realm || beforeIdentity !== afterIdentity) {
      throw new HostAssemblyError(
        "host-assembly-reload-required",
        `module ${name} to keep its loaded code identity ${beforeIdentity}`,
        "Reload the frontend host to install the new module graph before activating this assembly.",
        { module: name, actual: beforeIdentity, expected: afterIdentity }
      );
    }
  }
}
function staticAssembly(options, realm) {
  const entries = options.entries ?? [];
  const modules = options.catalog === void 0 ? [] : modulesFromCatalog(options.catalog, realm, "static");
  return createHostAssembly({
    entries,
    modules,
    ...options.config === void 0 ? {} : { config: options.config }
  });
}
function errorSummary(error) {
  if (error === null || typeof error !== "object" || typeof error.code !== "string" || typeof error.expected !== "string" || typeof error.hint !== "string")
    return void 0;
  const detail = error.detail;
  return {
    code: error.code,
    expected: error.expected,
    hint: error.hint,
    detail: detail !== null && typeof detail === "object" ? detail : { reason: String(detail ?? "unknown failure") }
  };
}
async function fetchInitialAssembly(options, realm) {
  if (options.assembly !== void 0) return options.assembly;
  if (options.transport !== void 0)
    return options.transport.request(HOST_ASSEMBLY_SERVICE, void 0);
  if (options.entries !== void 0 || options.catalog !== void 0 || options.config !== void 0)
    return staticAssembly(options, realm);
  throw new HostAssemblyError(
    "host-assembly-service-unavailable",
    "a static assembly or backend transport to be provided",
    "Pass the frozen assembly for a static player or connect the frontend host to a backend host.",
    { service: HOST_ASSEMBLY_SERVICE }
  );
}
function readiness(loader) {
  return inspectCatalogPlugins(loader).live.map((entry) => ({
    entryId: entry.entryId,
    fiberState: entry.fiberState,
    ...entry.failure === void 0 ? {} : {
      failure: {
        code: entry.failure.code,
        expected: entry.failure.expected,
        hint: entry.failure.hint,
        detail: entry.failure.detail
      }
    }
  }));
}
function assertReady(entries) {
  const failed = entries.find(
    (entry) => entry.fiberState !== "active" && entry.fiberState !== "disabled"
  );
  if (failed === void 0) return;
  throw new HostAssemblyError(
    "host-assembly-not-ready",
    `Entry ${failed.entryId} to reach active or disabled Fiber state`,
    "Inspect the Entry failure or waiting dependency and repair the frontend package graph.",
    {
      entryId: failed.entryId,
      fiberState: failed.fiberState,
      ...failed.failure === void 0 ? {} : { failure: failed.failure }
    }
  );
}
async function createFrontendHost(options = {}) {
  const realm = options.realm ?? "engine";
  const initial = await fetchInitialAssembly(options, realm);
  const context = options.context ?? new Context();
  const ownedContext = options.context === void 0;
  const checked = validateHostAssembly(initial);
  if (!checked.ok) throw checked.error;
  let current = checked.value;
  let status = {
    state: "created",
    revision: current.revision
  };
  let inspection;
  const stateListeners = /* @__PURE__ */ new Set();
  const notifyState = () => {
    for (const listener of stateListeners) listener(state);
  };
  const state = {
    get current() {
      return current;
    },
    get status() {
      return status;
    },
    get inspection() {
      return inspection;
    },
    subscribe(listener) {
      stateListeners.add(listener);
      return () => stateListeners.delete(listener);
    }
  };
  let startup;
  let loaderFiber;
  let loader;
  let disposed = false;
  let removeTransportDisconnect;
  const report = async (next) => {
    status = next;
    notifyState();
    await options.reportStatus?.(next);
    if (options.transport !== void 0) {
      const report2 = {
        state: next.state,
        revision: next.revision
      };
      if (next.entries !== void 0) report2.entries = next.entries;
      const failure = errorSummary(next.error);
      if (failure !== void 0) report2.error = failure;
      try {
        await options.transport.request(HOST_ACTIVATION_REPORT_SERVICE, report2);
      } catch (error) {
        const failed = {
          ...next,
          state: next.state === "active" ? "failed" : next.state,
          error
        };
        status = failed;
        await options.reportStatus?.(failed);
        throw error;
      }
    }
  };
  if (options.transport !== void 0) {
    removeTransportDisconnect = options.transport.onDisconnect((error) => {
      if (disposed) return;
      const failed = {
        state: "failed",
        revision: current.revision,
        error
      };
      status = failed;
      void Promise.resolve(options.reportStatus?.(failed)).catch(() => {
      });
    });
  }
  try {
    const startupPlugins = [
      hostFoundationPlugin(state, options.transport),
      ...context.get("toolApi", false) === void 0 ? [createToolApiPlugin()] : [],
      ...options.startupPlugins ?? []
    ];
    startup = await createHostStartup({ context, startupPlugins });
    if (options.autoActivate !== false) {
      const host2 = {
        context,
        ...options.transport === void 0 ? {} : { transport: options.transport },
        assembly: state,
        ...ownedContext ? { ownedContext: true } : { ownedContext: false },
        get status() {
          return status;
        },
        activate: async (_next) => {
        },
        update: async (_next) => {
        },
        dispose: async () => {
        }
      };
      await activateFrontendHost(
        host2,
        initial,
        options,
        realm,
        () => loader,
        (value) => {
          loader = value.loader;
          loaderFiber = value.fiber;
        },
        (value) => {
          inspection = value;
          notifyState();
        },
        report,
        () => {
          current = initial;
        }
      );
    }
  } catch (error) {
    removeTransportDisconnect?.();
    await loaderFiber?.dispose();
    await startup?.dispose();
    throw error;
  }
  const host = {
    context,
    ...loader === void 0 ? {} : { loader },
    ...options.transport === void 0 ? {} : { transport: options.transport },
    assembly: state,
    ownedContext,
    get status() {
      return status;
    },
    async activate(next = current) {
      await activateFrontendHost(
        host,
        next,
        options,
        realm,
        () => loader,
        (value) => {
          loader = value.loader;
          loaderFiber = value.fiber;
          host.loader = value.loader;
        },
        (value) => {
          inspection = value;
          notifyState();
        },
        report,
        () => {
          current = next;
        }
      );
    },
    async update(next) {
      await host.activate(next);
    },
    async dispose() {
      if (disposed) return;
      disposed = true;
      removeTransportDisconnect?.();
      await loaderFiber?.dispose();
      await startup?.dispose();
      status = { state: "disposed", revision: current.revision };
      notifyState();
    }
  };
  return host;
}
async function activateFrontendHost(host, next, options, realm, getLoader, setLoader, setInspection, report, commit) {
  if (host.status.state === "disposed") {
    throw new HostAssemblyError(
      "host-assembly-service-unavailable",
      "frontend host to remain active while activating an assembly",
      "Create a new frontend host for the next browser connection.",
      { service: "host-assembly" }
    );
  }
  const checked = validateHostAssembly(next);
  if (!checked.ok) {
    await report({ state: "failed", revision: next.revision, error: checked.error });
    throw checked.error;
  }
  const activeLoader = getLoader();
  try {
    if (activeLoader !== void 0)
      assertModuleReloadBoundary(host.assembly.current, checked.value);
    await report({ state: "loading", revision: next.revision });
    assertModuleVersions(checked.value, options.moduleVersions);
    let loader = activeLoader;
    if (loader === void 0) {
      const catalog = catalogForAssembly(checked.value, options.catalog);
      const installed = await installCatalogLoader(host.context, catalog, realm);
      loader = installed.loader;
      setLoader(installed);
    }
    const entries = projectPluginEntries(checked.value.entries, realm, realm);
    await loader.root.update(entries);
    await loader.await();
    setInspection(inspectCatalogPlugins(loader));
    const actualEntries = readiness(loader);
    assertReady(actualEntries);
    commit();
    await report({ state: "active", revision: checked.value.revision, entries: actualEntries });
  } catch (error) {
    if (error instanceof HostAssemblyError && error.code === "host-assembly-reload-required") {
      throw error;
    }
    const activeLoader2 = getLoader();
    const actualEntries = activeLoader2 === void 0 ? void 0 : readiness(activeLoader2);
    await report({
      state: "failed",
      revision: next.revision,
      ...actualEntries === void 0 ? {} : { entries: actualEntries },
      error
    });
    throw error;
  }
}

export { HostAssemblyError, createFrontendHost };
