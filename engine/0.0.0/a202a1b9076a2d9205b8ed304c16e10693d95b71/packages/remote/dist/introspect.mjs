// src/error-messages.ts
var REMOTE_ERROR_MESSAGES = {
  "script-syntax-error": "Script syntax error",
  "script-runtime-error": "Script runtime error",
  "server-startup-failed": "Server startup failed",
  "server-not-running": "Server not reachable",
  "eval-result-not-serializable": "Eval result not serializable"
};

// src/errors.ts
var REMOTE_ERROR_CODE_TO_JSONRPC = {
  "script-syntax-error": -32001,
  "script-runtime-error": -32002,
  "server-startup-failed": -32003,
  "server-not-running": -32004,
  "eval-result-not-serializable": -32005
};

// src/introspect.ts
function isProfilerRoot(value) {
  if (value === null || typeof value !== "object") return false;
  const root = value;
  return typeof root.startCapture === "function" && typeof root.latestCapture === "function" && typeof root.activeSession === "function" && root.phaseCatalog !== void 0;
}
function isExecutionRoot(value) {
  return value !== null && typeof value === "object" && typeof value.report === "function";
}
function profilerPhaseCatalog(value) {
  if (value === null || typeof value !== "object") return void 0;
  const catalog = value.phaseCatalog;
  return catalog === void 0 ? void 0 : catalog;
}
function projectRoot(name, value) {
  const descriptions = {
    world: { type: "World", description: "The host World instance." },
    renderer: { type: "Renderer", description: "The host Renderer instance." },
    assets: { type: "AssetRegistry", description: "The host AssetRegistry instance." },
    rhiCapture: {
      type: "RhiCapture",
      description: "The opt-in RHI frame capture capability."
    },
    profiler: {
      type: "Profiler",
      description: "The opt-in CPU profiler for bounded App and Render capture."
    },
    execution: {
      type: "ExecutionReportProvider",
      description: "The host execution report provider for tier, health, performance, and fault."
    },
    simulation: {
      type: "SimulationInspection",
      description: "A read-only World-owned simulation record, participant, trace, and report summary."
    },
    plugins: {
      type: "PluginProjection",
      description: "The desired and live plugin Entry/Fiber projection owned by DevKit."
    }
  };
  const descriptor = descriptions[name] ?? { type: "unknown", description: "A live eval root." };
  return {
    available: true,
    ...descriptor,
    ...name === "profiler" ? {
      capability: "cpu-profile-v1",
      operations: {
        startCapture: "profiler.startCapture({ frameLimit, eventLimit })",
        latestCapture: "profiler.latestCapture() after the host reaches the frame boundary"
      },
      ...profilerPhaseCatalog(value) === void 0 ? {} : { phaseCatalog: profilerPhaseCatalog(value) }
    } : name === "execution" ? {
      capability: "execution-report-v1"
    } : name === "rhiCapture" ? {
      capability: "rhi-capture-v1"
    } : {}
  };
}
function projectRoots(roots) {
  const projected = {};
  for (const [name, value] of Object.entries(roots)) {
    if (value !== void 0 && (name !== "profiler" || isProfilerRoot(value)) && (name !== "execution" || isExecutionRoot(value))) {
      projected[name] = projectRoot(name, value);
    }
  }
  return projected;
}
function profilerCapability(roots) {
  if (roots.profiler !== void 0) {
    return {
      enabled: true,
      capability: "cpu-profile-v1",
      limits: {
        frameLimit: "positive-safe-integer",
        eventLimit: "positive-safe-integer"
      }
    };
  }
  return {
    enabled: false,
    code: "profiler-not-enabled",
    expected: "an explicitly opted-in profiler root",
    hint: "Pass profiler: createProfiler() to createApp or startServer in development, then retry.",
    detail: { enabled: false },
    limits: {
      frameLimit: "positive-safe-integer",
      eventLimit: "positive-safe-integer"
    }
  };
}
function buildErrorProjection() {
  const errors = {};
  for (const [code, numericCode] of Object.entries(REMOTE_ERROR_CODE_TO_JSONRPC)) {
    errors[code] = { code: numericCode, message: REMOTE_ERROR_MESSAGES[code] };
  }
  return errors;
}
function buildIntrospectDoc(host, port, roots) {
  const projectedRoots = projectRoots(roots);
  const schemas = {
    World: { type: "object", description: "The host World instance." },
    Renderer: { type: "object", description: "The host Renderer instance." },
    Assets: { type: "object", description: "The host AssetRegistry instance." }
  };
  for (const [name, root] of Object.entries(projectedRoots)) {
    schemas[root.type] = { type: "object", description: root.description };
    if (name === "profiler") {
      schemas.ProfilerCapture = {
        type: "object",
        description: "A bounded ProfileCapture v1 artifact returned through eval."
      };
    }
  }
  for (const descriptor of roots.introspection ?? []) {
    schemas[descriptor.name] = descriptor;
  }
  return {
    openrpc: "1.3.2",
    info: {
      title: "@forgeax/engine-remote remote eval",
      version: "0.0.0",
      description: "Remote eval server. Methods: eval / introspect. Errors map to JSON-RPC -32001..-32006."
    },
    servers: [{ name: "in-process", url: `ws://${host}:${port}/inspector` }],
    methods: [
      {
        name: "eval",
        summary: "Evaluate a JavaScript script against live eval roots.",
        params: [
          {
            name: "script",
            required: true,
            schema: { type: "string" }
          }
        ],
        result: { name: "value", schema: { type: "object" } }
      },
      {
        name: "introspect",
        summary: "Return this OpenRPC L2 subset document.",
        params: [],
        result: { name: "document", schema: { type: "object" } }
      }
    ],
    roots: projectedRoots,
    capabilities: { profiler: profilerCapability(projectedRoots) },
    components: {
      schemas,
      errors: buildErrorProjection()
    }
  };
}

export { buildIntrospectDoc, isExecutionRoot, isProfilerRoot };
