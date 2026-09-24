import { Context, createToolApiPlugin, inspectCatalogPlugins } from '../../plugin/dist/browser.mjs';
import { bootstrapCatalogLoader, projectPluginEntries, installCatalogLoader } from '../../plugin/dist/loader.browser.mjs';

// src/backend.ts

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
var HOST_ASSEMBLY_CHANGED_TOPIC = "host/assembly.changed";
function createHostTransport() {
  const services = /* @__PURE__ */ new Map();
  const generations = /* @__PURE__ */ new Map();
  const clients = /* @__PURE__ */ new Set();
  const connectListeners = /* @__PURE__ */ new Set();
  const disconnectListeners = /* @__PURE__ */ new Set();
  let closed = false;
  const newCaller = (options = {}) => Object.freeze({
    connectionId: `host-connection-${crypto.randomUUID()}`,
    capability: `host-capability-${crypto.randomUUID()}`,
    kind: options.kind ?? "in-process",
    ...options.sourceId === void 0 ? {} : { sourceId: options.sourceId },
    ...options.sourceGeneration === void 0 ? {} : { sourceGeneration: options.sourceGeneration }
  });
  const closeClient = (state, reason) => {
    if (!state.connected) return;
    state.connected = false;
    for (const controller of state.pending) controller.abort();
    state.pending.clear();
    for (const callbacks of state.subscriptions.values()) callbacks.clear();
    state.subscriptions.clear();
    clients.delete(state);
    const authoritativeCaller = Object.freeze({ ...state.caller });
    for (const listener of disconnectListeners) listener(authoritativeCaller);
    const error = new HostAssemblyError(
      "host-transport-failure",
      "the host connection to remain available",
      "Reconnect the frontend host before issuing another request.",
      { service: "host/socket", reason: String(reason ?? "host connection closed") }
    );
    for (const listener of state.disconnectListeners) listener(error);
    state.disconnectListeners.clear();
  };
  const server = {
    get connectedClients() {
      return clients.size;
    },
    register(service, handler) {
      if (closed) throw new Error("host transport is closed");
      const previous = services.get(service);
      const generation = (generations.get(service) ?? 0) + 1;
      generations.set(service, generation);
      for (const controller of previous?.pending ?? []) controller.abort();
      const identity = Symbol(service);
      services.set(service, {
        identity,
        generation,
        handler,
        pending: /* @__PURE__ */ new Set()
      });
      return () => {
        const current = services.get(service);
        if (current?.identity !== identity) return;
        for (const controller of current.pending) controller.abort();
        generations.set(service, current.generation + 1);
        services.delete(service);
      };
    },
    invalidate(service) {
      const current = services.get(service);
      if (current === void 0) return;
      for (const controller of current.pending) controller.abort();
      generations.set(service, current.generation + 1);
      services.delete(service);
    },
    snapshot(service) {
      const current = services.get(service);
      return current === void 0 ? void 0 : { service, generation: current.generation };
    },
    publish(topic, payload, options = {}) {
      for (const state of clients) {
        if (options.excludeConnectionIds?.includes(state.caller.connectionId)) continue;
        if (options.connectionId !== void 0 && state.caller.connectionId !== options.connectionId)
          continue;
        for (const listener of state.subscriptions.get(topic) ?? []) listener(payload);
      }
    },
    connect(options = {}) {
      if (closed) throw new Error("host transport is closed");
      const state = {
        connected: true,
        caller: newCaller(options),
        subscriptions: /* @__PURE__ */ new Map(),
        pending: /* @__PURE__ */ new Set(),
        disconnectListeners: /* @__PURE__ */ new Set()
      };
      clients.add(state);
      for (const listener of connectListeners) listener(state.caller);
      const client = {
        get connected() {
          return state.connected;
        },
        get generation() {
          let current = 0;
          for (const service of services.values()) current = Math.max(current, service.generation);
          return current;
        },
        get caller() {
          return state.caller;
        },
        async request(service, payload, options2 = {}) {
          if (!state.connected) {
            throw new HostAssemblyError(
              "host-assembly-service-unavailable",
              `service ${service} to be available on the current connection`,
              "Reconnect the frontend host before issuing another request.",
              { service }
            );
          }
          if (options2.signal?.aborted) {
            throw new HostAssemblyError(
              "host-assembly-request-aborted",
              `request ${service} to start with a live AbortSignal`,
              "Start a fresh request with a live AbortSignal.",
              { service }
            );
          }
          const record = services.get(service);
          if (record === void 0) {
            const invalidatedGeneration = generations.get(service);
            if (options2.generation !== void 0 && invalidatedGeneration !== void 0 && options2.generation < invalidatedGeneration) {
              throw new HostAssemblyError(
                "host-assembly-stale-request",
                `request generation ${options2.generation} to match the invalidated service ${service}`,
                "Refresh the client capability after the backend service is enabled again.",
                { service, generation: options2.generation }
              );
            }
            throw new HostAssemblyError(
              "host-assembly-service-unavailable",
              `service ${service} to be registered`,
              "Wait for the backend plugin to activate before using this capability.",
              { service }
            );
          }
          const generation = options2.generation ?? record.generation;
          if (generation !== record.generation) {
            throw new HostAssemblyError(
              "host-assembly-stale-request",
              `request generation ${generation} to match service ${service}`,
              "Refresh the client capability and retry only when the owning business contract permits it.",
              { service, generation }
            );
          }
          const controller = new AbortController();
          const abortFromCaller = () => controller.abort();
          options2.signal?.addEventListener("abort", abortFromCaller, { once: true });
          record.pending.add(controller);
          state.pending.add(controller);
          let removeAbortRequest;
          try {
            if (controller.signal.aborted) {
              throw new HostAssemblyError(
                "host-assembly-request-aborted",
                `request ${service} not to be aborted before execution`,
                "Start a fresh request with a live AbortSignal.",
                { service }
              );
            }
            let abortReject;
            const aborted = new Promise((_, reject) => {
              abortReject = reject;
            });
            const abortRequest = () => {
              abortReject?.(
                new HostAssemblyError(
                  "host-assembly-request-aborted",
                  `request ${service} to finish before its service is closed or invalidated`,
                  "Treat the capability as withdrawn and refresh the service before retrying.",
                  { service }
                )
              );
            };
            controller.signal.addEventListener("abort", abortRequest, { once: true });
            removeAbortRequest = () => controller.signal.removeEventListener("abort", abortRequest);
            const result = await Promise.race([
              Promise.resolve(
                record.handler({
                  service,
                  payload,
                  generation,
                  signal: controller.signal,
                  caller: Object.freeze({ ...state.caller })
                })
              ),
              aborted
            ]);
            if (controller.signal.aborted) {
              throw new HostAssemblyError(
                "host-assembly-request-aborted",
                `request ${service} to finish before its service is invalidated`,
                "Treat the capability as withdrawn and refresh the service before retrying.",
                { service }
              );
            }
            return result;
          } finally {
            removeAbortRequest?.();
            record.pending.delete(controller);
            state.pending.delete(controller);
            options2.signal?.removeEventListener("abort", abortFromCaller);
          }
        },
        subscribe(topic, listener) {
          if (!state.connected) return () => {
          };
          const callbacks = state.subscriptions.get(topic) ?? /* @__PURE__ */ new Set();
          callbacks.add(listener);
          state.subscriptions.set(topic, callbacks);
          return () => {
            callbacks.delete(listener);
            if (callbacks.size === 0) state.subscriptions.delete(topic);
          };
        },
        onDisconnect(listener) {
          if (!state.connected) {
            listener(
              new HostAssemblyError(
                "host-transport-failure",
                "the host connection to remain available",
                "Reconnect the frontend host before issuing another request.",
                { service: "host/socket", reason: "host connection is already closed" }
              )
            );
            return () => {
            };
          }
          state.disconnectListeners.add(listener);
          return () => state.disconnectListeners.delete(listener);
        },
        close(reason) {
          closeClient(state, reason);
        }
      };
      return client;
    },
    onClientDisconnect(listener) {
      disconnectListeners.add(listener);
      return () => disconnectListeners.delete(listener);
    },
    onClientConnect(listener) {
      connectListeners.add(listener);
      return () => connectListeners.delete(listener);
    },
    close(reason) {
      if (closed) return;
      closed = true;
      for (const service of services.values())
        for (const controller of service.pending) controller.abort();
      services.clear();
      for (const client of [...clients]) closeClient(client, reason);
      generations.clear();
      connectListeners.clear();
      disconnectListeners.clear();
    }
  };
  return server;
}
function addSocketListener(socket, type, listener) {
  if (socket.addEventListener !== void 0) {
    socket.addEventListener(type, listener);
    return () => socket.removeEventListener?.(type, listener);
  }
  socket.on?.(type, listener);
  return () => socket.off?.(type, listener);
}
function socketPayload(value) {
  const data = Array.isArray(value) ? value[0] : value;
  if (typeof data === "string") return data;
  if (data instanceof ArrayBuffer) return new TextDecoder().decode(data);
  if (data instanceof Uint8Array) return new TextDecoder().decode(data);
  if (data !== null && typeof data === "object" && "data" in data)
    return socketPayload(data.data);
  return void 0;
}
function parseWire(value) {
  const source = socketPayload(value);
  if (source === void 0) return void 0;
  try {
    const parsed = JSON.parse(source);
    return parsed !== null && typeof parsed === "object" && typeof parsed.kind === "string" ? parsed : void 0;
  } catch {
    return void 0;
  }
}
function serializeError(service, error) {
  if (error !== null && typeof error === "object" && typeof error.code === "string" && typeof error.expected === "string" && typeof error.hint === "string") {
    const detail = error.detail;
    return {
      code: error.code,
      expected: error.expected,
      hint: error.hint,
      detail: detail !== null && typeof detail === "object" ? detail : { reason: String(detail ?? "unknown failure") }
    };
  }
  return {
    code: "host-transport-failure",
    expected: `service ${service} to complete without an exception`,
    hint: "Inspect the backend host process and reconnect before retrying.",
    detail: { service, reason: error instanceof Error ? error.message : String(error) }
  };
}
function errorFromSummary(service, summary) {
  const detail = summary.detail;
  const supported = /* @__PURE__ */ new Set([
    "host-assembly-invalid",
    "host-assembly-revision-mismatch",
    "host-assembly-module-missing",
    "host-assembly-module-version-mismatch",
    "host-assembly-reload-required",
    "host-assembly-service-unavailable",
    "host-assembly-stale-request",
    "host-assembly-request-aborted",
    "host-assembly-not-ready",
    "host-transport-failure"
  ]);
  if (supported.has(summary.code)) {
    return new HostAssemblyError(
      summary.code,
      summary.expected,
      summary.hint,
      detail
    );
  }
  return new HostAssemblyError("host-transport-failure", summary.expected, summary.hint, {
    ...detail,
    service,
    reason: summary.detail.reason ? String(summary.detail.reason) : summary.code,
    remoteCode: summary.code
  });
}
function transportFailure(service, reason) {
  return new HostAssemblyError(
    "host-transport-failure",
    `service ${service} to remain connected`,
    "Reconnect the frontend host and inspect the backend transport diagnostics.",
    { service, reason }
  );
}
function sendWire(socket, message) {
  socket.send(JSON.stringify(message));
}
async function createHostWebSocketClient(socket) {
  if (socket.readyState !== void 0 && socket.readyState !== 1) {
    await new Promise((resolve, reject) => {
      const removeOpen = addSocketListener(socket, "open", () => {
        removeOpen();
        removeError2();
        resolve();
      });
      const removeError2 = addSocketListener(socket, "error", (cause) => {
        removeOpen();
        removeError2();
        reject(transportFailure("host/connect", String(cause ?? "socket error")));
      });
    });
  }
  const pending = /* @__PURE__ */ new Map();
  const subscriptions = /* @__PURE__ */ new Map();
  const disconnectListeners = /* @__PURE__ */ new Set();
  let connected = true;
  let generation = 0;
  let sequence = 0;
  const caller = Object.freeze({
    connectionId: `host-client-${crypto.randomUUID()}`,
    capability: `host-client-capability-${crypto.randomUUID()}`,
    kind: "websocket"
  });
  const disconnectError = (reason) => transportFailure("host/socket", reason instanceof Error ? reason.message : String(reason));
  const failPending = (reason) => {
    if (!connected) return;
    connected = false;
    for (const request of pending.values()) {
      request.cleanup();
      request.reject(reason);
    }
    pending.clear();
    subscriptions.clear();
    const error = disconnectError(reason);
    for (const listener of disconnectListeners) listener(error);
    disconnectListeners.clear();
  };
  const removeMessage = addSocketListener(socket, "message", (event) => {
    const message = parseWire(event);
    if (message === void 0) return;
    if (message.kind === "event") {
      for (const listener of subscriptions.get(message.topic) ?? []) listener(message.payload);
      return;
    }
    if (message.kind !== "response") return;
    if (message.generation !== void 0) generation = Math.max(generation, message.generation);
    const request = pending.get(message.id);
    if (request === void 0) return;
    pending.delete(message.id);
    request.cleanup();
    if (message.ok) request.resolve(message.value);
    else
      request.reject(
        errorFromSummary(
          "host/socket",
          message.error ?? serializeError("host/socket", "unknown response failure")
        )
      );
  });
  const removeClose = addSocketListener(socket, "close", (reason) => {
    removeMessage();
    removeClose();
    removeError();
    failPending(disconnectError(reason));
  });
  const removeError = addSocketListener(socket, "error", (reason) => {
    failPending(disconnectError(reason));
  });
  const client = {
    get connected() {
      return connected;
    },
    get generation() {
      return generation;
    },
    caller,
    request(service, payload, options = {}) {
      if (!connected) return Promise.reject(disconnectError("socket is closed"));
      if (options.signal?.aborted)
        return Promise.reject(
          new HostAssemblyError(
            "host-assembly-request-aborted",
            `request ${service} to start with a live AbortSignal`,
            "Start a fresh request with a live AbortSignal.",
            { service }
          )
        );
      sequence += 1;
      const id = `${Date.now().toString(36)}-${sequence.toString(36)}`;
      return new Promise((resolve, reject) => {
        const abort = () => {
          const request = pending.get(id);
          if (request === void 0) return;
          pending.delete(id);
          request.cleanup();
          try {
            sendWire(socket, { kind: "cancel", id });
          } catch {
          }
          reject(
            new HostAssemblyError(
              "host-assembly-request-aborted",
              `request ${service} to finish before cancellation`,
              "Start a fresh request with a live AbortSignal.",
              { service }
            )
          );
        };
        const cleanup = () => options.signal?.removeEventListener("abort", abort);
        pending.set(id, {
          resolve,
          reject,
          cleanup
        });
        options.signal?.addEventListener("abort", abort, { once: true });
        if (options.signal?.aborted) {
          abort();
          return;
        }
        try {
          sendWire(socket, {
            kind: "request",
            id,
            service,
            payload,
            ...options.generation === void 0 ? {} : { generation: options.generation }
          });
        } catch (cause) {
          const request = pending.get(id);
          request?.cleanup();
          pending.delete(id);
          reject(disconnectError(cause));
        }
      });
    },
    subscribe(topic, listener) {
      if (!connected) return () => {
      };
      const listeners = subscriptions.get(topic) ?? /* @__PURE__ */ new Set();
      listeners.add(listener);
      subscriptions.set(topic, listeners);
      sendWire(socket, { kind: "subscribe", topic });
      return () => {
        if (!listeners.delete(listener)) return;
        if (listeners.size !== 0) return;
        subscriptions.delete(topic);
        if (connected && (socket.readyState === void 0 || socket.readyState === 1))
          sendWire(socket, { kind: "unsubscribe", topic });
      };
    },
    onDisconnect(listener) {
      if (!connected) {
        listener(disconnectError("socket is already closed"));
        return () => {
        };
      }
      disconnectListeners.add(listener);
      return () => disconnectListeners.delete(listener);
    },
    close(reason) {
      if (!connected) return;
      failPending(disconnectError(reason ?? "client closed the host connection"));
      removeMessage();
      removeClose();
      removeError();
      socket.close();
    }
  };
  return client;
}
async function connectHostWebSocket(url) {
  const Constructor = globalThis.WebSocket;
  if (typeof Constructor !== "function")
    throw transportFailure("host/connect", "the current runtime does not provide WebSocket");
  return createHostWebSocketClient(new Constructor(url));
}
function attachHostWebSocketServer(socket, server, options = {}) {
  const client = server.connect({ kind: "websocket", ...options });
  const pending = /* @__PURE__ */ new Map();
  const subscriptions = /* @__PURE__ */ new Map();
  let disposed = false;
  const removeMessage = addSocketListener(socket, "message", (event) => {
    const message = parseWire(event);
    if (message === void 0 || disposed) return;
    if (message.kind === "cancel") {
      pending.get(message.id)?.abort();
      return;
    }
    if (message.kind === "subscribe") {
      subscriptions.get(message.topic)?.();
      subscriptions.set(
        message.topic,
        client.subscribe(message.topic, (payload) => {
          if (!disposed) sendWire(socket, { kind: "event", topic: message.topic, payload });
        })
      );
      return;
    }
    if (message.kind === "unsubscribe") {
      subscriptions.get(message.topic)?.();
      subscriptions.delete(message.topic);
      return;
    }
    if (message.kind !== "request") return;
    const controller = new AbortController();
    pending.set(message.id, controller);
    void client.request(message.service, message.payload, {
      signal: controller.signal,
      ...message.generation === void 0 ? {} : { generation: message.generation }
    }).then((value) => {
      if (!disposed)
        sendWire(socket, {
          kind: "response",
          id: message.id,
          ok: true,
          value,
          generation: client.generation
        });
    }).catch((error) => {
      if (!disposed)
        sendWire(socket, {
          kind: "response",
          id: message.id,
          ok: false,
          error: serializeError(message.service, error),
          generation: client.generation
        });
    }).finally(() => pending.delete(message.id));
  });
  const removeClose = addSocketListener(socket, "close", () => dispose());
  const removeError = addSocketListener(socket, "error", () => dispose());
  function dispose() {
    if (disposed) return;
    disposed = true;
    removeMessage();
    removeClose();
    removeError();
    for (const controller of pending.values()) controller.abort();
    pending.clear();
    for (const unsubscribe of subscriptions.values()) unsubscribe();
    subscriptions.clear();
    client.close("host socket disconnected");
  }
  return dispose;
}

// src/backend.ts
function effectiveAssemblyInput(current, input) {
  const preservePairs = input.pairs === void 0 && input.entries === void 0 && input.modules === void 0;
  const entriesById = new Map(current.entries.map((entry) => [entry.id, entry]));
  const modulesByName = new Map(current.modules.map((module) => [module.name, module]));
  const pairs = current.pairs.flatMap((pair) => {
    const entry = entriesById.get(pair.entryId);
    const module = modulesByName.get(pair.module.name);
    return entry === void 0 || module === void 0 ? [] : [{ id: pair.id, frontend: { entry, module } }];
  });
  return {
    entries: input.entries ?? current.entries,
    modules: input.modules ?? current.modules,
    ...input.pairs !== void 0 ? { pairs: input.pairs } : preservePairs ? { pairs } : {},
    ...input.config === void 0 ? current.config === void 0 ? {} : { config: current.config } : { config: input.config },
    ...input.backendEntries === void 0 ? {} : { backendEntries: input.backendEntries }
  };
}
function authorityOf(initial, activation) {
  let current = initial;
  let generation = 1;
  const listeners = /* @__PURE__ */ new Set();
  const authority = {
    get current() {
      return current;
    },
    get generation() {
      return generation;
    },
    get activation() {
      return activation();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
  return {
    authority,
    publish(input) {
      const next = createHostAssembly(input);
      const checked = validateHostAssembly(next);
      if (!checked.ok) throw checked.error;
      current = checked.value;
      generation += 1;
      for (const listener of listeners) listener(current);
      return current;
    }
  };
}
function hostFoundationPlugin(assembly, transport) {
  return {
    name: "forgeax:backend-host-foundation",
    provide: ["hostAssembly", "hostTransport"],
    apply(ctx) {
      ctx.provide("hostAssembly", assembly);
      ctx.provide("hostTransport", transport);
    }
  };
}
function assertBackendCatalogIdentity(catalog, modules) {
  if (catalog === void 0) return;
  for (const module of modules) {
    const record = catalog.get(module.name);
    if (record !== void 0) assertHostModuleCatalogIdentity(module, record);
  }
}
async function createBackendHost(options = {}) {
  const context = options.context ?? new Context();
  const realm = options.realm ?? "engine";
  const catalog = options.catalog;
  const pairedBackendEntries = options.pairs?.flatMap((pair) => pair.backend === void 0 ? [] : [pair.backend.entry]) ?? [];
  const entries = options.entries ?? options.assembly?.entries ?? options.pairs?.flatMap((pair) => pair.frontend === void 0 ? [] : [pair.frontend.entry]) ?? [];
  const modules = options.modules ?? options.assembly?.modules ?? (options.pairs === void 0 ? catalog === void 0 ? [] : modulesFromCatalog(catalog, realm) : options.pairs.flatMap(
    (pair) => pair.frontend === void 0 ? [] : [pair.frontend.module]
  ));
  const initialAssembly = options.assembly ?? createHostAssembly({
    entries,
    modules,
    ...options.pairs === void 0 ? {} : { pairs: options.pairs },
    ...options.config === void 0 ? {} : { config: options.config }
  });
  const checkedInitial = validateHostAssembly(initialAssembly);
  if (!checkedInitial.ok) {
    if (options.context === void 0) await context.fiber.dispose();
    throw checkedInitial.error;
  }
  const backendModules = options.pairs === void 0 ? modules : options.pairs.flatMap((pair) => pair.backend === void 0 ? [] : [pair.backend.module]);
  assertBackendCatalogIdentity(catalog, backendModules);
  let activationStatus = {
    state: "created",
    revision: checkedInitial.value.revision
  };
  const authority = authorityOf(checkedInitial.value, () => activationStatus);
  const assembly = authority.authority;
  const acceptedActivationRevisions = new Set(options.acceptedActivationRevisions ?? []);
  let bootstrapRevision = checkedInitial.value.revision;
  const activationListeners = /* @__PURE__ */ new Set();
  const transport = options.transport ?? createHostTransport();
  const projections = /* @__PURE__ */ new Map();
  const removeProjectionDisconnect = transport.onClientDisconnect(
    (caller) => projections.delete(caller.connectionId)
  );
  const projectionFor = (caller) => {
    const projected = projections.get(caller.connectionId);
    if (projected && (projected.caller.capability !== caller.capability || !projected.assembly)) {
      throw new HostAssemblyError(
        "host-assembly-service-unavailable",
        "an active assembly projection for this connection",
        "Reconnect through the projection owner; do not consume another frontend assembly.",
        { service: HOST_ASSEMBLY_SERVICE }
      );
    }
    return projected;
  };
  let startup;
  let loaderFiber;
  let loader;
  let backendEntries = options.pairs === void 0 ? options.entries ?? options.assembly?.entries ?? [] : pairedBackendEntries;
  let unregisterAssemblyService;
  let unregisterActivationService;
  let unsubscribeAssembly;
  try {
    const startupPlugins = [
      hostFoundationPlugin(assembly, transport),
      ...context.get("toolApi", false) === void 0 ? [createToolApiPlugin()] : [],
      ...options.startupPlugins ?? []
    ];
    startup = await createHostStartup({ context, startupPlugins });
    activationStatus = {
      state: catalog === void 0 ? "unavailable" : "loading",
      revision: assembly.current.revision
    };
    if (catalog !== void 0) {
      const bootstrapped = await bootstrapCatalogLoader(context, catalog, realm, {
        catalogDigest: checkedInitial.value.revision,
        supportedRealms: [realm]
      });
      if (!bootstrapped.ok) throw bootstrapped.error;
      loaderFiber = bootstrapped.value.fiber;
      loader = bootstrapped.value.loader;
      if (backendEntries.length > 0) {
        await loader.root.update(projectPluginEntries(backendEntries, realm, realm));
        await loader.await();
      }
      activationStatus = {
        state: "active",
        revision: assembly.current.revision,
        entries: inspectCatalogPlugins(loader).live
      };
    }
    unregisterAssemblyService = transport.register(
      HOST_ASSEMBLY_SERVICE,
      ({ caller }) => projectionFor(caller)?.assembly ?? assembly.current
    );
    unregisterActivationService = transport.register(
      HOST_ACTIVATION_REPORT_SERVICE,
      async ({ payload, caller }) => {
        const report = payload;
        const projected = projectionFor(caller);
        if (projected ? report.revision !== projected.assembly?.revision && report.revision !== projected.bootstrapRevision : report.revision !== assembly.current.revision && report.revision !== bootstrapRevision && !acceptedActivationRevisions.has(report.revision)) {
          throw new HostAssemblyError(
            "host-assembly-revision-mismatch",
            `activation report revision ${report.revision} to match ${assembly.current.revision}`,
            "Discard the stale frontend report and fetch the current backend assembly.",
            { actual: report.revision, expected: assembly.current.revision }
          );
        }
        await options.onActivationReport?.(report, caller);
        for (const listener of activationListeners) await listener(report, caller);
        return { accepted: true };
      }
    );
    unsubscribeAssembly = assembly.subscribe((next) => {
      transport.publish(HOST_ASSEMBLY_CHANGED_TOPIC, next, {
        excludeConnectionIds: [...projections.keys()]
      });
    });
  } catch (error) {
    activationStatus = {
      state: "failed",
      revision: assembly.current.revision,
      ...loader === void 0 ? {} : { entries: inspectCatalogPlugins(loader).live },
      error
    };
    unregisterActivationService?.();
    unregisterAssemblyService?.();
    unsubscribeAssembly?.();
    removeProjectionDisconnect();
    projections.clear();
    await loaderFiber?.dispose();
    await startup?.dispose();
    throw error;
  }
  let disposed = false;
  let updateQueue = Promise.resolve();
  const disposeListeners = /* @__PURE__ */ new Set();
  const enqueueUpdate = (operation) => {
    const next = updateQueue.then(operation, operation);
    updateQueue = next.then(
      () => void 0,
      () => void 0
    );
    return next;
  };
  let disposePromise;
  const host = {
    context,
    ...loader === void 0 ? {} : { loader },
    assembly,
    get backendEntries() {
      return [...backendEntries];
    },
    transport,
    ownedContext: options.context === void 0,
    bindProjection(caller, projection) {
      if (disposed)
        throw new HostAssemblyError(
          "host-assembly-service-unavailable",
          "an active backend host",
          "Bind the projection on a live backend.",
          { service: HOST_ASSEMBLY_SERVICE }
        );
      const checked = validateHostAssembly(projection.assembly);
      if (!checked.ok) throw checked.error;
      if (projection.bootstrap) {
        const bootstrap = validateHostAssembly(projection.bootstrap);
        if (!bootstrap.ok) throw bootstrap.error;
      }
      const binding = {
        caller,
        assembly: checked.value,
        ...projection.bootstrap ? { bootstrapRevision: projection.bootstrap.revision } : {}
      };
      projections.set(caller.connectionId, binding);
      transport.publish(HOST_ASSEMBLY_CHANGED_TOPIC, binding.assembly, {
        connectionId: caller.connectionId
      });
      return () => {
        if (projections.get(caller.connectionId) !== binding) return;
        projections.set(caller.connectionId, { caller });
      };
    },
    subscribeActivationReports(listener) {
      if (disposed) {
        throw new HostAssemblyError(
          "host-assembly-service-unavailable",
          "the backend host to remain active while observing activation reports",
          "Subscribe on an active host instance.",
          { service: HOST_ACTIVATION_REPORT_SERVICE }
        );
      }
      activationListeners.add(listener);
      return () => {
        activationListeners.delete(listener);
      };
    },
    subscribeDispose(listener) {
      if (typeof listener !== "function")
        throw new TypeError("backend dispose listener must be a function");
      if (disposed) {
        try {
          const result = listener();
          if (result !== void 0) void Promise.resolve(result).catch(() => {
          });
        } catch {
        }
        return () => {
        };
      }
      disposeListeners.add(listener);
      return () => disposeListeners.delete(listener);
    },
    update(nextInput, updateOptions) {
      if (disposed) {
        return Promise.reject(
          new HostAssemblyError(
            "host-assembly-service-unavailable",
            "backend host to remain active while updating Entries",
            "Create a new host instance before updating the disposed host.",
            { service: "host-assembly" }
          )
        );
      }
      return enqueueUpdate(async () => {
        if (disposed) {
          throw new HostAssemblyError(
            "host-assembly-service-unavailable",
            "backend host to remain active while updating Entries",
            "Create a new host instance before updating the disposed host.",
            { service: "host-assembly" }
          );
        }
        if (updateOptions?.expectedRevision !== void 0 && assembly.current.revision !== updateOptions.expectedRevision) {
          throw new HostAssemblyError(
            "host-assembly-revision-mismatch",
            `backend assembly revision ${updateOptions.expectedRevision} to remain current`,
            "Discard the stale update and reconcile against the latest backend assembly.",
            { actual: assembly.current.revision, expected: updateOptions.expectedRevision }
          );
        }
        const input = Array.isArray(nextInput) ? {
          entries: nextInput,
          backendEntries: nextInput
        } : nextInput;
        const effectiveInput = effectiveAssemblyInput(assembly.current, input);
        const candidate = createHostAssembly(effectiveInput);
        const checkedCandidate = validateHostAssembly(candidate);
        if (!checkedCandidate.ok) throw checkedCandidate.error;
        const candidateBackendModules = input.pairs === void 0 ? checkedCandidate.value.modules : input.pairs.flatMap(
          (pair) => pair.backend === void 0 ? [] : [pair.backend.module]
        );
        assertBackendCatalogIdentity(catalog, candidateBackendModules);
        const nextBackendEntries = input.backendEntries ?? (input.pairs === void 0 ? input.entries ?? backendEntries : input.pairs.flatMap(
          (pair) => pair.backend === void 0 ? [] : [pair.backend.entry]
        ));
        if (loader === void 0 && nextBackendEntries.length > 0) {
          throw new HostAssemblyError(
            "host-assembly-service-unavailable",
            "a CatalogLoader to be installed before updating Entries",
            "Provide a backend Catalog when the host owns plugin Entry activation.",
            { service: "loader" }
          );
        }
        if (loader !== void 0) {
          await loader.root.update(projectPluginEntries(nextBackendEntries, realm, realm));
          await loader.await();
          activationStatus = {
            state: "active",
            revision: checkedCandidate.value.revision,
            entries: inspectCatalogPlugins(loader).live
          };
        }
        if (disposed) {
          throw new HostAssemblyError(
            "host-assembly-service-unavailable",
            "backend host to remain active while publishing an assembly",
            "Discard the completed update because the backend host is stopping.",
            { service: "host-assembly" }
          );
        }
        backendEntries = nextBackendEntries;
        if (updateOptions?.bootstrap === true) bootstrapRevision = checkedCandidate.value.revision;
        for (const revision of updateOptions?.acceptedActivationRevisions ?? []) {
          acceptedActivationRevisions.add(revision);
        }
        return authority.publish(effectiveInput);
      });
    },
    dispose() {
      if (disposePromise !== void 0) return disposePromise;
      disposed = true;
      disposePromise = (async () => {
        const errors = [];
        const continueCleanup = async (cleanup) => {
          try {
            await cleanup();
          } catch (error) {
            errors.push(error);
          }
        };
        await continueCleanup(async () => {
          await updateQueue;
        });
        const listeners = [...disposeListeners];
        disposeListeners.clear();
        for (const listener of listeners) await continueCleanup(listener);
        activationListeners.clear();
        removeProjectionDisconnect();
        projections.clear();
        await continueCleanup(async () => unsubscribeAssembly?.());
        await continueCleanup(async () => unregisterActivationService?.());
        await continueCleanup(async () => unregisterAssemblyService?.());
        await continueCleanup(async () => transport.close());
        await continueCleanup(async () => loaderFiber?.dispose());
        await continueCleanup(async () => startup?.dispose());
        activationStatus = {
          state: "disposed",
          revision: assembly.current.revision,
          ...loader === void 0 ? {} : { entries: inspectCatalogPlugins(loader).live }
        };
        if (errors.length > 0) {
          throw new AggregateError(errors, "backend host disposal failed");
        }
      })();
      return disposePromise;
    }
  };
  return host;
}
function hostFoundationPlugin2(assembly, transport) {
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
      hostFoundationPlugin2(state, options.transport),
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

export { HOST_ACTIVATION_REPORT_SERVICE, HOST_ASSEMBLY_CHANGED_TOPIC, HOST_ASSEMBLY_SCHEMA_VERSION, HOST_ASSEMBLY_SERVICE, HostAssemblyError, attachHostWebSocketServer, canonicalHostJson, connectHostWebSocket, createBackendHost, createFrontendHost, createHostAssembly, createHostStartup, createHostTransport, createHostWebSocketClient, hostRevision, modulesFromCatalog, validateHostAssembly };
