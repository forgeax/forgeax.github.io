import { renderPublicationTransfers } from '../../render/dist/index.mjs';
import { createRhiDebugError, attachRecorder } from '../../rhi-debug/dist/index.mjs';
import { constructRuntimeRendererHost, loadRhiPack } from '../../runtime/dist/renderer-host.mjs';
import { RhiError } from '../../rhi/dist/index.mjs';
import { err, ok } from '../../types/dist/index.mjs';
import * as rhiWebgpu from '../../rhi-webgpu/dist/index.mjs';

// src/execution/render-worker-runtime.ts
var captureDrivers = /* @__PURE__ */ new WeakMap();
function createRhiCapture(attachment2) {
  let activeCapture;
  const capture2 = {
    captureFrame(options) {
      const driver = captureDrivers.get(capture2);
      if (driver === void 0) return captureAttachment(attachment2, options);
      if (activeCapture !== void 0) {
        return Promise.resolve(
          err(
            createRhiDebugError("capture-busy", {
              stage: "capture",
              cause: "another App capture transaction is active"
            })
          )
        );
      }
      const request = captureWithAppFrame(attachment2, driver, options);
      activeCapture = request;
      void request.then(
        () => {
          if (activeCapture === request) activeCapture = void 0;
        },
        () => {
          if (activeCapture === request) activeCapture = void 0;
        }
      );
      return request;
    }
  };
  return capture2;
}
async function captureAttachment(attachment2, options) {
  const result = await attachment2.captureFrame(options);
  if (!result.ok) return result;
  return ok(toArtifact(result.value));
}
async function captureWithAppFrame(attachment2, driver, options) {
  const state = driver.getState();
  if (state !== "running" && state !== "paused") {
    return err(
      createRhiDebugError("capture-unavailable", {
        stage: "capture",
        cause: `App capture requires a running or paused frame loop, received '${state}'`
      })
    );
  }
  if (options?.signal?.aborted) return captureAttachment(attachment2, options);
  const resumeAfter = state === "running";
  if (resumeAfter) {
    const paused = driver.pause();
    if (!paused.ok) {
      return err(
        createRhiDebugError("capture-unavailable", {
          stage: "capture",
          cause: `App capture could not pause the frame loop: ${describeFailure(paused.error)}`
        })
      );
    }
  }
  const controller = new AbortController();
  const abortFromUser = () => controller.abort();
  options?.signal?.addEventListener("abort", abortFromUser, { once: true });
  let captureResult;
  try {
    captureResult = attachment2.captureFrame({
      ...options ?? {},
      signal: controller.signal
    });
  } catch (cause) {
    options?.signal?.removeEventListener("abort", abortFromUser);
    if (resumeAfter && driver.getState() === "paused") driver.resume();
    return err(
      createRhiDebugError("capture-unavailable", {
        stage: "capture",
        cause: `App capture could not arm the recorder: ${describeFailure(cause)}`
      })
    );
  }
  let result;
  let transactionError;
  let resumedForCapture = false;
  try {
    const snapshot = await attachment2.frameBoundary();
    if (!snapshot.ok) {
      result = await captureResult;
    } else if (options?.signal?.aborted) {
      controller.abort();
      result = await captureResult;
    } else if (resumeAfter) {
      const resumed = driver.resume();
      if (!resumed.ok) {
        transactionError = createRhiDebugError("capture-unavailable", {
          stage: "capture",
          cause: `App capture could not resume the frame loop: ${describeFailure(resumed.error)}`
        });
        controller.abort();
        result = await captureResult;
      } else {
        resumedForCapture = true;
        result = await captureResult;
      }
    } else {
      const stepped = driver.stepFrame(0);
      if (!stepped.ok) {
        transactionError = createRhiDebugError("capture-unavailable", {
          stage: "capture",
          cause: `App capture frame failed: ${describeFailure(stepped.error)}`
        });
        controller.abort();
        result = await captureResult;
      } else {
        result = await captureResult;
      }
    }
  } catch (cause) {
    transactionError = createRhiDebugError("capture-unavailable", {
      stage: "capture",
      cause: `App capture transaction failed: ${describeFailure(cause)}`
    });
    controller.abort();
    result = await captureResult;
  } finally {
    options?.signal?.removeEventListener("abort", abortFromUser);
    if (resumeAfter && !resumedForCapture && driver.getState() === "paused") {
      const resumed = driver.resume();
      if (!resumed.ok && transactionError === void 0) {
        transactionError = createRhiDebugError("capture-unavailable", {
          stage: "capture",
          cause: `App capture could not resume the frame loop: ${describeFailure(resumed.error)}`
        });
      }
    }
  }
  if (transactionError !== void 0) return err(transactionError);
  if (result === void 0) result = await captureResult;
  if (!result.ok) return result;
  return ok(toArtifact(result.value));
}
function describeFailure(cause) {
  if (typeof cause === "string") return cause;
  if (cause instanceof Error) return cause.message;
  if (typeof cause === "object" && cause !== null && "hint" in cause) {
    const hint = cause.hint;
    if (typeof hint === "string") return hint;
  }
  return String(cause);
}
function createRhiInstrumentation(attachment2) {
  return {
    resolveSurfaceDevice(device) {
      const resolved = attachment2.backend.unwrapDeviceForSurface(device);
      if (resolved.ok) return resolved;
      return err(
        new RhiError({
          code: "rhi-not-available",
          expected: "the recorder can resolve the wrapped surface device",
          hint: resolved.error.hint
        })
      );
    },
    onFrameBoundary() {
      void attachment2.frameBoundary();
    },
    onDeviceLost() {
      attachment2.deviceLost();
    }
  };
}
function toArtifact(encoded) {
  return {
    kind: "rhi-tape",
    digest: encoded.digest,
    bytes: encoded.bytes
  };
}
async function attachWorkerRhiRecorder() {
  const nav = globalThis;
  const backend = nav.navigator?.gpu === void 0 ? await import('../../rhi-wgpu/dist/index.mjs') : rhiWebgpu;
  if (nav.navigator?.gpu === void 0 && typeof backend.ensureReady === "function")
    await backend.ensureReady();
  const pack = loadRhiPack(backend);
  if (pack.createShaderModule === void 0)
    throw new Error("Worker RHI capture requires a shader-module capability");
  const attached = attachRecorder({
    rhi: pack.rhi,
    createShaderModule: pack.createShaderModule,
    ...pack.createShaderModuleImmediate === void 0 ? {} : { createShaderModuleImmediate: pack.createShaderModuleImmediate }
  });
  if (!attached.ok) throw attached.error;
  return attached.value;
}

// src/errors.ts
function summarizeCause(cause) {
  if (cause === null || cause === void 0) return String(cause);
  if (typeof cause !== "object") return String(cause);
  const r = cause;
  const name = typeof r.name === "string" && r.name.length > 0 ? r.name : "Error";
  const code = typeof r.code === "string" && r.code.length > 0 ? r.code : "";
  const message = typeof r.message === "string" ? r.message : "";
  const head = code !== "" ? `${name} ${code}` : name;
  const body = message !== "" ? `: ${message}` : "";
  return `${head}${body}`.replace(/\s*\n+\s*/g, " / ");
}
var AppErrorClass = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    let causeSuffix = "";
    if (args.code === "app-system-update-failed") {
      const d = args.detail;
      const sys = typeof d.systemName === "string" && d.systemName.length > 0 ? ` (system=${d.systemName})` : "";
      causeSuffix = `; cause: ${summarizeCause(d.cause)}${sys}`;
    } else if (args.code === "app-pointer-lock-failed") {
      const d = args.detail;
      causeSuffix = `; path: ${d.path}; cause: ${summarizeCause(d.cause)}`;
    } else if (args.code === "app-plugin-activation-failed") {
      const d = args.detail;
      causeSuffix = `; cause: ${summarizeCause(d.cause)}`;
    } else if (args.code === "app-execution-bootstrap-failed") {
      const d = args.detail;
      causeSuffix = `; phase: ${d.phase}; cause: ${summarizeCause(d.cause)}`;
    } else if (args.code === "app-execution-kernel-failed") {
      const d = args.detail;
      causeSuffix = `; kernel: ${d.kernelName}; cause: ${summarizeCause(d.cause)}`;
    } else if (args.code === "app-execution-rebuild-failed") {
      const d = args.detail;
      causeSuffix = `; cause: ${summarizeCause(d.cause)}`;
    }
    super(`[AppError ${args.code}] expected: ${args.expected}; hint: ${args.hint}${causeSuffix}`);
    this.name = "AppError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    this.detail = args.detail;
  }
};
var AppError = AppErrorClass;
var appErrorPolicy = {
  "app-not-started": {
    expected: 'state must be "running" or "paused" to accept stop/pause/resume; "idle" / "stopped" terminal sinks reject',
    hint: "check getState() before calling stop/pause/resume; rebuild the handle via createApp({...}) when the previous one terminated on device-lost"
  },
  "app-already-running": {
    expected: 'state must be "idle" or "paused" to start; "running" handles ignore subsequent start() calls',
    hint: "call stop() first or audit start() call sites; the second start() is a no-op so state is preserved"
  },
  "app-canvas-detached": {
    expected: "canvas.isConnected === true at createApp(canvas) entry",
    hint: "append the canvas to the document tree before calling createApp(canvas), or use the assemble entry createApp({ renderer, world }) when the host already manages canvas lifetime"
  },
  "app-frame-step-invalid": {
    expected: "stepFrame(deltaSeconds) runs only while the App is paused and deltaSeconds is finite and non-negative",
    hint: "pause the App before deterministic stepping and pass an explicit finite delta; resume after the bounded step sequence completes"
  },
  "app-system-update-failed": {
    expected: "world.update(world), renderer.draw(world), and frame-loop callbacks complete without failure",
    hint: "inspect detail.cause for the original thrown value (EcsError / RhiError / host system bug); detail.systemName names the offending system when the call site can supply it"
  },
  "app-pointer-lock-failed": {
    expected: "pointer-lock request (W3C requestPointerLock or host lockProvider.requestLock) to succeed; failure signals the browser rejected the lock or the host provider threw",
    hint: 'remain in unlocked state; the next trusted click will automatically retry the lock request. inspect detail.path ("w3c" or "provider") and detail.cause to determine the root cause'
  },
  "app-plugin-activation-failed": {
    expected: "every requested Cordis plugin fiber reaches a stable active or pending state",
    hint: "inspect detail.cause and the plugin fiber effects; repair the failing activation before creating the App again"
  },
  "app-execution-worker-unavailable": {
    expected: "the explicitly enabled worker has its required browser capabilities and an Engine Worker owner",
    hint: "inspect detail.worker, detail.reason and detail.missingCapabilities; use auto for capability fallback or enable the Engine Worker dependency"
  },
  "app-execution-bootstrap-failed": {
    expected: "the bootstrap URL imports a module whose default export completes as an ExecutionBootstrapEntry in the selected Engine Realm",
    hint: "inspect detail.phase, moduleUrl and cause; export one default ExecutionBootstrapEntry that creates only realm-local engine state"
  },
  "app-execution-deadline-exceeded": {
    expected: "the execution startup, handshake or frame completes within its configured bounded deadline",
    hint: "inspect detail.phase and timeoutMs; the timed-out Worker has been terminated, so fix startup or frame work before creating a new App"
  },
  "app-execution-kernel-failed": {
    expected: "a shared kernel completes every dispatched shard without leaving a possibly partial World write",
    hint: "do not retry or draw the poisoned World; inspect detail.kernelName and cause, then call app.execution.rebuild()"
  },
  "app-execution-stale-world": {
    expected: "every execution message targets the currently active World identity before it can write",
    hint: "discard the late message and keep the current World; inspect expectedIdentity, receivedIdentity and messageKind"
  },
  "app-execution-rebuild-failed": {
    expected: "explicit rebuild disposes the poisoned World and bootstraps a fresh World identity in the surviving Engine Realm",
    hint: "inspect detail.cause; this App remains stopped, so fix the bootstrap failure or create a new App explicitly"
  }
};
var APP_EXPECTED = Object.fromEntries(
  Object.entries(appErrorPolicy).map(([code, policy]) => [code, policy.expected])
);
var APP_ERROR_HINTS = Object.fromEntries(
  Object.entries(appErrorPolicy).map(([code, policy]) => [code, policy.hint])
);

// src/execution/bootstrap-entry.ts
function bootstrapError(phase, moduleUrl, cause) {
  return new AppError({
    code: "app-execution-bootstrap-failed",
    expected: APP_EXPECTED["app-execution-bootstrap-failed"],
    hint: APP_ERROR_HINTS["app-execution-bootstrap-failed"],
    detail: { phase, moduleUrl, cause }
  });
}
function validateExecutionBootstrapData(data, moduleUrl) {
  if (data === void 0) return ok(void 0);
  try {
    structuredClone(data);
    return ok(void 0);
  } catch (cause) {
    return err(bootstrapError("data", moduleUrl, cause));
  }
}
async function loadBootstrapEntry(moduleUrl) {
  let loaded;
  try {
    loaded = await import(
      /* @vite-ignore */
      moduleUrl
    );
  } catch (cause) {
    return err(bootstrapError("import", moduleUrl, cause));
  }
  const entry = loaded.default;
  if (typeof entry !== "function") {
    return err(
      bootstrapError(
        "export",
        moduleUrl,
        new TypeError("default export is not an ExecutionBootstrapEntry function")
      )
    );
  }
  return ok(entry);
}
async function prepareBootstrapEntry(moduleUrl, data) {
  const valid = validateExecutionBootstrapData(data, moduleUrl);
  if (!valid.ok) return valid;
  const loaded = await loadBootstrapEntry(moduleUrl);
  if (!loaded.ok) return loaded;
  try {
    const prepared = await loaded.value(data);
    if (typeof prepared !== "object" || prepared === null || prepared.features !== void 0 && !Array.isArray(prepared.features) || prepared.plugins !== void 0 && !Array.isArray(prepared.plugins) || prepared.configureRenderer !== void 0 && typeof prepared.configureRenderer !== "function") {
      return err(
        bootstrapError(
          "prepare",
          moduleUrl,
          new TypeError("execution bootstrap must return an object with feature and plugin arrays")
        )
      );
    }
    return ok(prepared);
  } catch (cause) {
    return err(bootstrapError("prepare", moduleUrl, cause));
  }
}

// src/execution/worker-error.ts
function serializableDetail(cause, seen = /* @__PURE__ */ new WeakSet()) {
  if (typeof cause === "function" || typeof cause === "symbol") return String(cause);
  if (typeof cause !== "object" || cause === null) return cause;
  if (seen.has(cause)) return "[Circular]";
  seen.add(cause);
  if (Array.isArray(cause)) return cause.map((value) => serializableDetail(value, seen));
  const fields = cause instanceof Error ? {
    ...cause,
    name: cause.name,
    message: cause.message,
    stack: cause.stack,
    cause: cause.cause,
    code: Reflect.get(cause, "code"),
    expected: Reflect.get(cause, "expected"),
    hint: Reflect.get(cause, "hint"),
    detail: Reflect.get(cause, "detail")
  } : cause;
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, serializableDetail(value, seen)])
  );
}
function workerError(cause) {
  const value = typeof cause === "object" && cause !== null ? cause : {};
  return {
    code: typeof value.code === "string" ? value.code : "render-worker-failed",
    expected: typeof value.expected === "string" ? value.expected : "Render Worker completes the requested operation",
    hint: typeof value.hint === "string" ? value.hint : "inspect the original cause and repair the failing producer",
    detail: serializableDetail(value.detail === void 0 ? cause : value.detail)
  };
}

// src/execution/render-worker-runtime.ts
var scope = globalThis;
var renderer;
var publicationIdentity;
var canvas;
var busy = false;
var framesInFlight = 0;
var failed = false;
var shuttingDown = false;
var initializing;
var completing = Promise.resolve();
var attachment;
var capture;
var gpuPassTimingEnabled = false;
var captureRequests = /* @__PURE__ */ new Map();
var synchronizeFeatures = async () => {
};
function closeVideoFrames(message) {
  for (const row of message.publication.videoFrames) row.frame.close();
}
function fail(message, cause) {
  if (failed) return;
  failed = true;
  const operationError = cause;
  scope.postMessage({
    kind: "failed",
    error: workerError(cause),
    stage: message.kind,
    ...message.kind === "draw" ? {
      publication: {
        source: message.publication.source,
        epoch: message.publication.epoch,
        revision: message.publication.revision,
        frameId: message.frameId
      }
    } : {},
    // Native destroy can fence a receipt before renderer health changes.
    recoverable: renderer?.state() === "device-lost" || operationError?.code === "device-operation-failed" && operationError.detail?.operation === "complete-frame" && ["device-lost", "disposed", "stale-generation"].some(
      (code) => code === operationError.detail.cause?.code
    )
  });
}
async function completeFrame(message, frameRenderer, receipt, previous) {
  try {
    const observedTiming = gpuPassTimingEnabled ? frameRenderer.observe(receipt, { include: ["timings"] }) : void 0;
    const completion = receipt.completed.then((result) => {
      if (!result.ok) throw result.error;
    });
    const [, timingResult] = await Promise.all([completion, observedTiming]);
    await previous;
    if (failed) return;
    const gpuPassTiming = timingResult?.ok === true ? timingResult.value.timings : void 0;
    const buffers = renderPublicationTransfers(message.publication);
    scope.postMessage(
      {
        kind: "completed",
        revision: message.publication.revision,
        buffers,
        ...gpuPassTiming === void 0 ? {} : { gpuPassTiming },
        frame: {
          kind: "frame-complete",
          worldIdentity: message.worldIdentity,
          frameId: message.frameId,
          deviceGeneration: receipt.deviceGeneration,
          ...receipt.graphGeneration === void 0 ? {} : { graphGeneration: receipt.graphGeneration },
          ...receipt.barrelDistortion === void 0 ? {} : { barrelDistortion: receipt.barrelDistortion },
          presentation: receipt.presentation,
          engineUpdateMs: 0,
          kernelWaitMs: 0
        }
      },
      buffers
    );
  } catch (cause) {
    fail(message, cause);
  } finally {
    await Promise.allSettled([previous, receipt.completed]);
    closeVideoFrames(message);
    framesInFlight--;
  }
}
async function receive(message) {
  if (message.kind === "dispose") {
    shuttingDown = true;
    for (const controller of captureRequests.values()) controller.abort();
    try {
      await initializing;
      await drawing;
      await completing;
      renderer?.dispose();
      await attachment?.dispose();
      scope.postMessage({ kind: "disposed" });
    } catch (cause) {
      scope.postMessage({ kind: "disposed", error: serializableDetail(cause) });
    } finally {
      scope.close();
    }
    return;
  }
  if (failed) {
    if (message.kind === "draw") {
      closeVideoFrames(message);
      framesInFlight--;
    }
    return;
  }
  let completionOwnsFrame = false;
  try {
    if (message.kind === "bounds") {
      scope.postMessage({
        kind: "bounds-result",
        requestId: message.requestId,
        bounds: publicationIdentity === void 0 ? void 0 : renderer?.bounds(publicationIdentity, message.entity)
      });
      return;
    }
    if (message.kind === "capture-cancel") {
      captureRequests.get(message.requestId)?.abort();
      return;
    }
    if (message.kind === "capture") {
      if (capture === void 0) {
        scope.postMessage({
          kind: "capture-result",
          requestId: message.requestId,
          result: {
            ok: false,
            error: createRhiDebugError("capture-unavailable", {
              stage: "capture",
              cause: "Render Worker recorder is disabled"
            })
          }
        });
        return;
      }
      const controller = new AbortController();
      captureRequests.set(message.requestId, controller);
      const result = await capture.captureFrame({ ...message.options, signal: controller.signal });
      captureRequests.delete(message.requestId);
      scope.postMessage({
        kind: "capture-result",
        requestId: message.requestId,
        result: result.ok ? { ok: true, value: result.value } : { ok: false, error: result.error }
      });
      return;
    }
    if (message.kind === "init") {
      if (renderer !== void 0 || busy) throw new Error("Duplicate Render Worker initialization");
      busy = true;
      canvas = message.canvas;
      gpuPassTimingEnabled = message.gpuPassTiming !== void 0;
      const prepared = await prepareBootstrapEntry(message.bootstrapUrl, message.bootstrapData);
      if (!prepared.ok) throw prepared.error;
      if (message.rhiCapture === true) {
        attachment = await attachWorkerRhiRecorder();
        capture = createRhiCapture(attachment);
      }
      const constructed = await constructRuntimeRendererHost(
        canvas,
        {
          ...attachment === void 0 ? {} : {
            rhi: attachment.backend.rhi,
            rhiInstrumentation: createRhiInstrumentation(attachment)
          },
          publicationSource: message.identity,
          ...message.gpuPassTiming === void 0 ? {} : { gpuPassTiming: message.gpuPassTiming },
          ...prepared.value.features === void 0 ? {} : { features: prepared.value.features }
        },
        {
          ...message.shaderManifestUrl === void 0 ? {} : { shaderManifestUrl: message.shaderManifestUrl },
          ...message.shaderIndexUrl === void 0 ? {} : { shaderIndexUrl: message.shaderIndexUrl },
          ...message.shaderRequirementsUrl === void 0 ? {} : { shaderRequirementsUrl: message.shaderRequirementsUrl },
          ...message.shaderManifestDeltaUrl === void 0 ? {} : { shaderManifestDeltaUrl: message.shaderManifestDeltaUrl },
          ...message.build === void 0 ? {} : { build: message.build }
        }
      );
      if (!constructed.ok) throw constructed.error;
      renderer = constructed.value.renderer;
      publicationIdentity = message.identity;
      await prepared.value.configureRenderer?.(renderer);
      const declared = prepared.value.features ?? [];
      const active = new Set(declared.map((feature) => feature.identity));
      synchronizeFeatures = async (identities) => {
        for (const feature of declared) {
          if (identities.has(feature.identity) === active.has(feature.identity)) continue;
          const result = identities.has(feature.identity) ? await constructed.value.featureHost.installRenderFeature(feature) : await constructed.value.featureHost.uninstallRenderFeature(feature);
          if (!result.ok) throw result.error;
          if (identities.has(feature.identity)) active.add(feature.identity);
          else active.delete(feature.identity);
        }
      };
      busy = false;
      scope.postMessage({ kind: "ready", capabilities: renderer.inspect().capabilities });
      return;
    }
    if (renderer === void 0 || canvas === void 0 || busy)
      throw new Error("Render Worker has no publication credit");
    busy = true;
    if (message.width > 0 && message.height > 0) {
      if (canvas.width !== message.width) canvas.width = message.width;
      if (canvas.height !== message.height) canvas.height = message.height;
    }
    await synchronizeFeatures(
      new Set(message.publication.features.map((feature) => feature.identity))
    );
    if (failed) return;
    const features = [];
    const draw = renderer.draw({
      publication: message.publication,
      onFeatureSourceSubmitted: (identity, feedback) => features.push({ identity, feedback })
    });
    if (!draw.ok) throw draw.error;
    const receipt = draw.value;
    completionOwnsFrame = true;
    completing = completeFrame(message, renderer, receipt, completing);
    if (failed) return;
    scope.postMessage({
      kind: "submitted",
      revision: message.publication.revision,
      features,
      frame: {
        kind: "frame-submitted",
        worldIdentity: message.worldIdentity,
        frameId: message.frameId,
        deviceGeneration: receipt.deviceGeneration,
        ...receipt.graphGeneration === void 0 ? {} : { graphGeneration: receipt.graphGeneration },
        ...receipt.barrelDistortion === void 0 ? {} : { barrelDistortion: receipt.barrelDistortion }
      }
    });
  } catch (cause) {
    fail(message, cause);
  } finally {
    if (message.kind === "draw") {
      busy = false;
      if (!completionOwnsFrame) {
        closeVideoFrames(message);
        framesInFlight--;
      }
    }
  }
}
var drawing;
var queued;
scope.onmessage = (event) => {
  const message = event.data;
  if (shuttingDown || failed) {
    if (message.kind === "draw") closeVideoFrames(message);
    if (message.kind === "dispose" && !shuttingDown) void receive(message);
    return;
  }
  if (message.kind === "init") {
    initializing = receive(message);
    return;
  }
  if (message.kind !== "draw") {
    void receive(message);
    return;
  }
  if (framesInFlight >= 2) {
    fail(message, new Error("Render Worker has no publication credit"));
    closeVideoFrames(message);
    return;
  }
  framesInFlight++;
  if (drawing !== void 0) {
    queued = message;
    return;
  }
  const drain = async (first) => {
    await receive(first);
    while (queued !== void 0) {
      const next = queued;
      queued = void 0;
      await receive(next);
    }
    drawing = void 0;
  };
  drawing = drain(message);
};
