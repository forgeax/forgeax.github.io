// src/browser-user-timing.ts
function partialCapture(captureId, phaseCatalog) {
  return {
    schemaVersion: "1.0",
    captureId,
    timeUnit: "microseconds",
    frameLimit: 1,
    eventLimit: 1,
    phaseCatalog,
    records: [],
    completeness: {
      status: "partial",
      retainedEventCount: 0,
      droppedEventCount: 0,
      incompleteReason: "user-timing-transport"
    }
  };
}
function diagnosticsEnabled(key) {
  const value = globalThis[key];
  return typeof value === "object" && value !== null && value.enabled === true;
}
function diagnosticsDetail(key) {
  const value = globalThis[key];
  if (typeof value !== "object" || value === null) return "owner";
  const detail = value.detail;
  return detail === "nested" || detail === "passes" ? detail : "owner";
}
function createUserTimingProfiler(options = {}) {
  const diagnosticsKey = options.diagnosticsKey ?? "__forgeaxFramePhaseDiagnostics";
  const captureId = options.captureId ?? "forgeax-user-timing";
  const timingEnabled = diagnosticsEnabled(diagnosticsKey);
  const detail = diagnosticsDetail(diagnosticsKey);
  const performanceApi = timingEnabled ? globalThis.performance : void 0;
  if (!timingEnabled && options.onPhaseEnd === void 0) return void 0;
  if (timingEnabled && (performanceApi === void 0 || typeof performanceApi.mark !== "function")) {
    if (options.onPhaseEnd === void 0) return void 0;
  }
  let phaseCatalog = { app: [], render: [] };
  let frameId;
  let active = true;
  let latest;
  const openPhases = [];
  function mark(name) {
    if (performanceApi === void 0) return;
    try {
      performanceApi.mark(name);
    } catch {
    }
  }
  function timingSource(source) {
    return source === "app" ? "frame" : "render";
  }
  const session = {
    captureId,
    detail,
    beginFrame(nextFrameId) {
      frameId = nextFrameId;
      openPhases.length = 0;
      return { ok: true, value: void 0 };
    },
    beginPhase(inputOrSource, phaseName) {
      if (frameId === void 0) return { ok: true, value: void 0 };
      const input = typeof inputOrSource === "string" ? { source: inputOrSource, phase: phaseName } : inputOrSource;
      openPhases.push(input);
      mark(`forgeax.${timingSource(input.source)}.phase.${frameId}.${input.phase}.begin`);
      return { ok: true, value: void 0 };
    },
    endPhase() {
      const phase = openPhases.pop();
      if (phase !== void 0) options.onPhaseEnd?.(phase);
      if (frameId !== void 0 && phase !== void 0) {
        mark(`forgeax.${timingSource(phase.source)}.phase.${frameId}.${phase.phase}.end`);
      }
      return { ok: true, value: void 0 };
    },
    recordSkip(input) {
      if (frameId !== void 0) {
        mark(
          `forgeax.${timingSource(input.source)}.phase.${frameId}.${input.phase}.skip.${input.reason}`
        );
      }
      return { ok: true, value: void 0 };
    },
    endFrame() {
      frameId = void 0;
      openPhases.length = 0;
      return { ok: true, value: void 0 };
    },
    finish() {
      latest = partialCapture(captureId, phaseCatalog);
      active = false;
      frameId = void 0;
      openPhases.length = 0;
      return { ok: true, value: latest };
    }
  };
  return {
    registerPhaseCatalog(source, phases) {
      const definition = [...phases];
      phaseCatalog = { ...phaseCatalog, [source]: definition };
      let registered = true;
      return {
        ok: true,
        value: () => {
          if (!registered) return;
          registered = false;
          if (phaseCatalog[source] !== definition) return;
          phaseCatalog = { ...phaseCatalog, [source]: [] };
        }
      };
    },
    startCapture() {
      active = true;
      latest = void 0;
      return { ok: true, value: session };
    },
    activeCaptureId() {
      return active ? captureId : void 0;
    },
    activeSession() {
      return active ? session : void 0;
    },
    latestCapture() {
      return latest;
    },
    get phaseCatalog() {
      return phaseCatalog;
    }
  };
}

export { createUserTimingProfiler };
