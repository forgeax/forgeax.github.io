// src/errors.ts
function invalidArgsError(message, value) {
  return {
    code: "tool-invalid-args",
    expected: "arguments accepted by the contribution argsSchema",
    hint: "Read the descriptor schema and retry with typed arguments.",
    detail: { message, value }
  };
}
function capabilityUnavailableError(capability, realm) {
  return {
    code: "tool-capability-unavailable",
    expected: `capability ${capability} in realm ${realm}`,
    hint: "Inspect the capability matrix and select an available realm or path.",
    detail: { capability, realm }
  };
}
function snapshotStaleError(expectedDigest, actualDigest) {
  return {
    code: "tool-snapshot-stale",
    expected: "the supplied snapshot to match the current authority",
    hint: "Refresh the authority snapshot and retry the write.",
    detail: { expectedDigest, actualDigest }
  };
}
function domainFailureError(code, expected = "the producer operation to succeed", hint = "Inspect detail and repair the owning producer before retrying.", payload) {
  return {
    code: "tool-domain-failed",
    expected,
    hint,
    detail: { code, ...payload === void 0 ? {} : { payload } }
  };
}
function artifactIncompleteError(missing, runId) {
  return {
    code: "tool-artifact-incomplete",
    expected: "the requested evidence artifacts to be produced by their owners",
    hint: "Request only supported evidence and inspect the artifact manifest before retrying.",
    detail: { missing: [...missing], runId }
  };
}
function cancellationError(reason) {
  return {
    code: "tool-run-cancelled",
    expected: "the tool run not to be cancelled",
    hint: "Retry the command after resolving the cancellation source.",
    detail: { reason }
  };
}
function timeoutError(deadlineMs) {
  return {
    code: "tool-run-timeout",
    expected: `the tool run to complete within ${deadlineMs}ms`,
    hint: "Increase the deadline only when the operation is expected to be bounded.",
    detail: { deadlineMs }
  };
}
function disconnectedError(transport) {
  return {
    code: "tool-run-disconnected",
    expected: "the tool transport to remain connected",
    hint: "Reconnect the transport and retry from the last serialized snapshot.",
    detail: { transport }
  };
}
function terminalError(runId, outcome) {
  return {
    code: "tool-run-terminal",
    expected: "a non-terminal ToolRun",
    hint: "Use the existing terminal and do not attach another executor.",
    detail: { runId, outcome }
  };
}
function cleanupError(runId, message) {
  return {
    code: "tool-cleanup-failed",
    expected: "all ToolRun cleanup callbacks to complete",
    hint: "Inspect the cleanup detail and release the owning resource.",
    detail: { runId, message }
  };
}
function artifactManifestError(expected, hint, detail) {
  return { code: "tool-artifact-manifest-invalid", expected, hint, detail };
}

// src/artifacts.ts
function createArtifactManifest(manifest) {
  const result = validateArtifactManifest(manifest, []);
  if (!result.ok) throw new TypeError("artifact manifest is invalid");
  return {
    schemaVersion: "1.0.0",
    identity: { ...manifest.identity },
    artifacts: manifest.artifacts.map((artifact) => ({ ...artifact }))
  };
}
function validateArtifactManifest(manifest, required) {
  const fail = (reason, expected) => ({
    ok: false,
    error: artifactManifestError(
      expected,
      "regenerate the complete manifest from the owning producers",
      {
        reason,
        ...typeof manifest?.identity?.runId === "string" ? { runId: manifest.identity.runId } : {}
      }
    )
  });
  if (manifest?.schemaVersion !== "1.0.0")
    return fail("unsupported schemaVersion", 'schemaVersion === "1.0.0"');
  const identity = manifest.identity;
  if (identity === void 0 || identity.runId.length === 0 || identity.snapshotDigest.length === 0 || identity.stepId.length === 0 || identity.captureId.length === 0 || !Number.isSafeInteger(identity.frameId) || identity.frameId < 0)
    return fail(
      "identity is incomplete",
      "runId/snapshotDigest/stepId/captureId and non-negative frameId"
    );
  const seen = /* @__PURE__ */ new Set();
  for (const artifact of manifest.artifacts) {
    if (artifact.owner.length === 0 || artifact.uri.length === 0 || artifact.digest.length === 0 || !Number.isSafeInteger(artifact.byteLength) || artifact.byteLength < 0)
      return fail(
        `invalid ${artifact.kind} artifact entry`,
        "owner/uri/digest and byteLength are complete"
      );
    if (seen.has(artifact.kind))
      return fail(
        `duplicate artifact kind '${artifact.kind}'`,
        "one owner entry per evidence kind"
      );
    seen.add(artifact.kind);
  }
  for (const kind of required)
    if (!seen.has(kind))
      return fail(
        `missing artifact kind '${kind}'`,
        `manifest includes requested '${kind}' evidence`
      );
  return { ok: true, value: manifest };
}
var PREVIEW_ROLE_KINDS = {
  report: "report",
  "rhi-tape": "rhi-tape",
  capture: "png",
  "fresh-replay": "png",
  "profile-capture": "profile-capture",
  "contact-sheet": "contact-sheet"
};
function createPreviewArtifactManifest(manifest) {
  const result = validatePreviewArtifactManifest(manifest, []);
  if (!result.ok) throw new TypeError("preview artifact manifest is invalid");
  return {
    schemaVersion: "2.0.0",
    identity: { ...manifest.identity },
    artifacts: manifest.artifacts.map((artifact) => ({
      ...artifact,
      derivedFrom: [...artifact.derivedFrom]
    }))
  };
}
function validatePreviewArtifactManifest(manifest, requiredRoles) {
  const fail = (reason) => ({
    ok: false,
    error: artifactManifestError(
      "schemaVersion 2.0.0 with one complete identity and role per artifact",
      "regenerate the staged report and evidence from one lexical ToolRun",
      {
        reason,
        ...typeof manifest?.identity?.runId === "string" ? { runId: manifest.identity.runId } : {}
      }
    )
  });
  if (manifest?.schemaVersion !== "2.0.0") return fail("v1 manifest or unsupported schemaVersion");
  const identity = manifest.identity;
  if (identity === void 0 || [
    identity.runId,
    identity.snapshotDigest,
    identity.subjectDigest,
    identity.presentationDigest,
    identity.captureId
  ].some((value) => typeof value !== "string" || value.length === 0) || !Number.isSafeInteger(identity.frameId) || identity.frameId < 0) {
    return fail("identity is incomplete or stale");
  }
  const seenRoles = /* @__PURE__ */ new Set();
  const digests = /* @__PURE__ */ new Set();
  for (const artifact of manifest.artifacts) {
    if (seenRoles.has(artifact.role)) return fail(`duplicate role '${artifact.role}'`);
    if (PREVIEW_ROLE_KINDS[artifact.role] !== artifact.kind) {
      return fail(`role '${artifact.role}' does not match kind '${artifact.kind}'`);
    }
    if (artifact.owner.length === 0 || artifact.uri.length === 0 || artifact.digest.length === 0 || artifact.mediaType.length === 0 || !Number.isSafeInteger(artifact.byteLength) || artifact.byteLength < 0 || artifact.derivedFrom.some((digest) => digest.length === 0)) {
      return fail(`incomplete '${artifact.role}' artifact`);
    }
    seenRoles.add(artifact.role);
    digests.add(artifact.digest);
  }
  for (const artifact of manifest.artifacts) {
    if (artifact.derivedFrom.some((digest) => !digests.has(digest))) {
      return fail(`'${artifact.role}' derivedFrom references an unpublished artifact`);
    }
  }
  for (const role of requiredRoles) {
    if (!seenRoles.has(role)) return fail(`missing required role '${role}'`);
  }
  return { ok: true, value: manifest };
}
function isSerializableValue(value, seen = /* @__PURE__ */ new Set()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object") return false;
  if (seen.has(value)) return false;
  seen.add(value);
  if (Array.isArray(value)) return value.every((entry) => isSerializableValue(entry, seen));
  if (Object.getPrototypeOf(value) !== Object.prototype) return false;
  return Object.entries(value).every(
    ([key, entry]) => typeof key === "string" && isSerializableValue(entry, seen)
  );
}
function createArtifactRef(input) {
  if (input.digest.length === 0) throw new TypeError("ArtifactRef digest must not be empty");
  if (input.sizeBytes !== void 0 && (!Number.isSafeInteger(input.sizeBytes) || input.sizeBytes < 0)) {
    throw new TypeError("ArtifactRef sizeBytes must be a non-negative safe integer");
  }
  return { ...input };
}
function createSnapshotRef(input) {
  if (!Number.isSafeInteger(input.revision) || input.revision < 0) {
    throw new TypeError("SnapshotRef revision must be a non-negative safe integer");
  }
  if (input.digest.length === 0) throw new TypeError("SnapshotRef digest must not be empty");
  return { revision: input.revision, digest: input.digest };
}
function validateArtifactRefs(value) {
  return Array.isArray(value) && value.every(
    (entry) => typeof entry === "object" && entry !== null && typeof Reflect.get(entry, "kind") === "string" && typeof Reflect.get(entry, "digest") === "string" && (Reflect.get(entry, "uri") === void 0 || typeof Reflect.get(entry, "uri") === "string")
  );
}

// src/lease.ts
function createLexicalLease(runId) {
  const cleanups = [];
  let state = "active";
  let terminalId;
  let termination;
  const terminate = (reason) => {
    if (termination !== void 0) return termination;
    terminalId = `${runId}:terminal:${crypto.randomUUID()}`;
    state = "terminating";
    termination = (async () => {
      const failures = [];
      for (let index = cleanups.length - 1; index >= 0; index -= 1) {
        const entry = cleanups[index];
        if (entry === void 0) continue;
        try {
          await entry.cleanup();
        } catch (cause) {
          failures.push({
            owner: entry.owner,
            message: cause instanceof Error ? cause.message : String(cause)
          });
        }
      }
      state = "terminated";
      return { terminalId, reason, failures };
    })();
    return termination;
  };
  return {
    get state() {
      return state;
    },
    register(owner, cleanup) {
      if (state !== "active") return false;
      cleanups.push({ owner, cleanup });
      return true;
    },
    terminate
  };
}

// src/timing.ts
var PHASES = [
  "lookup",
  "lease",
  "transport",
  "execute",
  "capture",
  "finalize",
  "analyze"
];
function createExclusiveTiming(now = () => performance.now()) {
  const phases = Object.fromEntries(
    PHASES.map((phase) => [phase, { status: "not-applicable" }])
  );
  const closed = /* @__PURE__ */ new Set();
  let active;
  let startedAtMs;
  let endedAtMs;
  return {
    begin(phase) {
      if (active !== void 0) throw new TypeError(`phase '${active.phase}' is still open`);
      if (closed.has(phase)) throw new TypeError(`phase '${phase}' was already closed`);
      const at = now();
      startedAtMs ??= at;
      active = { phase, startedAtMs: at };
    },
    end(phase) {
      if (active?.phase !== phase) throw new TypeError(`phase '${phase}' is not the active phase`);
      const at = now();
      phases[phase] = { status: "observed", durationMs: Math.max(0, at - active.startedAtMs) };
      closed.add(phase);
      active = void 0;
      endedAtMs = at;
    },
    record(phase, durationMs) {
      if (!Number.isFinite(durationMs) || durationMs < 0)
        throw new TypeError("phase duration must be finite and non-negative");
      if (closed.has(phase)) throw new TypeError(`phase '${phase}' was already closed`);
      const at = now();
      startedAtMs ??= at - durationMs;
      phases[phase] = { status: "observed", durationMs };
      closed.add(phase);
      endedAtMs = at;
    },
    finish() {
      if (active !== void 0) throw new TypeError(`phase '${active.phase}' is still open`);
      const start = startedAtMs ?? now();
      const end = endedAtMs ?? start;
      return {
        startedAtMs: start,
        endedAtMs: end,
        totalMs: Math.max(0, end - start),
        phases: { ...phases }
      };
    }
  };
}
function startToolTiming() {
  return performance.now();
}
function finishToolTiming(startedAtMs, operationTiming) {
  const endedAtMs = performance.now();
  const result = operationTiming?.finish();
  const durationMs = Math.max(0, endedAtMs - startedAtMs);
  const attributedMs = result === void 0 ? 0 : Object.values(result.phases).reduce(
    (sum, observation) => observation.status === "observed" ? sum + observation.durationMs : sum,
    0
  );
  return {
    startedAtMs,
    endedAtMs,
    durationMs,
    ...result === void 0 ? {} : { phases: result.phases, unattributedMs: Math.max(0, durationMs - attributedMs) }
  };
}

// src/runtime.ts
function defineTool(descriptor, execute) {
  if (!/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/.test(descriptor.id)) {
    throw new TypeError(`Tool id must use a stable lower-case path: ${descriptor.id}`);
  }
  if (descriptor.title.trim().length === 0 || descriptor.summary.trim().length === 0) {
    throw new TypeError("Tool title and summary must not be empty");
  }
  if (!Array.isArray(descriptor.evidence)) throw new TypeError("Tool evidence must be an array");
  if (descriptor.preview !== void 0 && descriptor.preview.realm !== descriptor.realm) {
    throw new TypeError(
      `Tool ${descriptor.id} preview contract declares ${descriptor.preview.realm} but descriptor declares ${descriptor.realm}`
    );
  }
  const argsSchema = descriptor.argsSchema;
  const resultSchema = descriptor.resultSchema;
  return {
    descriptor: { ...descriptor, argsSchema, resultSchema, evidence: [...descriptor.evidence] },
    execute
  };
}
function eventChannel() {
  const queue = [];
  const waiters = [];
  let closed = false;
  const emit = (event) => {
    const waiter = waiters.shift();
    if (waiter !== void 0) waiter({ done: false, value: event });
    else queue.push(event);
  };
  const close = () => {
    closed = true;
    while (waiters.length > 0) waiters.shift()?.({ done: true, value: void 0 });
  };
  const events = {
    [Symbol.asyncIterator]() {
      return {
        next: async () => {
          const event = queue.shift();
          if (event !== void 0) return { done: false, value: event };
          if (closed) return { done: true, value: void 0 };
          return new Promise((resolve) => waiters.push(resolve));
        }
      };
    }
  };
  return { emit, close, events };
}
function isTerminal(value) {
  if (typeof value !== "object" || value === null) return false;
  const outcome = Reflect.get(value, "outcome");
  return outcome === "succeeded" || outcome === "failed";
}
function serializablePreview(value) {
  return isSerializableValue(value) ? value : null;
}
function domainError(error) {
  return domainFailureError(
    error.code,
    error.expected ?? "the producer operation to succeed",
    error.hint ?? "Inspect detail and repair the owning producer before retrying.",
    error.detail
  );
}
function hasOkField(value) {
  return typeof value === "object" && value !== null && typeof Reflect.get(value, "ok") === "boolean";
}
function isToolRuntimeError(value) {
  return typeof value === "object" && value !== null && typeof Reflect.get(value, "code") === "string" && Reflect.get(value, "code").startsWith("tool-");
}
function createToolRuntime(contributions) {
  const byId = /* @__PURE__ */ new Map();
  for (const candidate of contributions) {
    if (typeof candidate !== "object" || candidate === null) {
      throw new TypeError("Tool contributions must be objects");
    }
    const contribution = candidate;
    if (typeof contribution.execute !== "function") {
      throw new TypeError("Tool contributions must provide an executor");
    }
    const id = contribution.descriptor.id;
    if (byId.has(id)) throw new TypeError(`Duplicate tool contribution id: ${id}`);
    byId.set(id, contribution);
  }
  const list = () => [...byId.values()].map((contribution) => contribution.descriptor);
  const run = (contribution, args, options = {}) => {
    const runId = `${contribution.descriptor.id}:${crypto.randomUUID()}`;
    const channel = eventChannel();
    const controller = new AbortController();
    const startedAtMs = startToolTiming();
    const operationTiming = createExclusiveTiming();
    const lookupStartedAtMs = startToolTiming();
    operationTiming.record("lookup", Math.max(0, startToolTiming() - lookupStartedAtMs));
    const lease = createLexicalLease(runId);
    const leaseStartedAtMs = startToolTiming();
    operationTiming.record("lease", Math.max(0, startToolTiming() - leaseStartedAtMs));
    let terminalStarted = false;
    let cleanupReport = {
      census: { worlds: 0, renderers: 0, canvases: 0, leases: 0 },
      failures: []
    };
    let cancelReason = "cancelled by caller";
    let resolveTerminal;
    const terminal = new Promise((resolve) => {
      resolveTerminal = resolve;
    });
    let resolveExecutorExited;
    const executorExited = new Promise((resolve) => {
      resolveExecutorExited = resolve;
    });
    const settle = async (candidate, reason = "terminal") => {
      if (terminalStarted) return;
      terminalStarted = true;
      controller.abort();
      const finalizeStartedAtMs = startToolTiming();
      const cleanupResult = await lease.terminate(reason);
      const cleanupFailure = cleanupResult.failures[0];
      const liveResources = Object.entries(cleanupReport.census).filter(([, count]) => count !== 0);
      const reportFailure = cleanupReport.failures[0] ?? (liveResources.length === 0 ? void 0 : `live resources remain: ${liveResources.map(([kind, count]) => `${kind}=${count}`).join(", ")}`);
      operationTiming.record("finalize", Math.max(0, startToolTiming() - finalizeStartedAtMs));
      const finalTerminal = cleanupFailure || candidate.outcome === "succeeded" && reportFailure !== void 0 ? {
        outcome: "failed",
        failure: cleanupError(
          runId,
          cleanupFailure === void 0 ? reportFailure : `${cleanupFailure.owner}: ${cleanupFailure.message}`
        ),
        artifacts: candidate.artifacts,
        cleanup: cleanupReport,
        ...candidate.snapshotAfter === void 0 ? {} : { snapshotAfter: candidate.snapshotAfter },
        timing: finishToolTiming(startedAtMs, operationTiming)
      } : {
        ...candidate,
        cleanup: cleanupReport,
        timing: finishToolTiming(startedAtMs, operationTiming)
      };
      resolveTerminal(finalTerminal);
      channel.emit({
        kind: "terminal",
        runId,
        outcome: finalTerminal.outcome,
        atMs: performance.now()
      });
      channel.close();
    };
    const context = {
      runId,
      signal: controller.signal,
      ...options.owner === void 0 ? {} : { owner: options.owner },
      ...options.caller === void 0 ? {} : { caller: options.caller },
      ...options.snapshot === void 0 ? {} : { snapshot: options.snapshot },
      emit: (event) => {
        if (!terminalStarted) channel.emit({ ...event, runId });
      },
      addCleanup: (cleanup) => {
        if (!lease.register(`cleanup:${lease.state}`, cleanup)) void cleanup();
      },
      setCleanupReport: (report) => {
        cleanupReport = {
          census: { ...report.census },
          failures: [...report.failures]
        };
      },
      require: (capability) => {
        if (terminalStarted) {
          return { ok: false, error: terminalError(runId, "succeeded") };
        }
        const resolved = options.capabilityResolver?.(capability);
        if (resolved !== void 0) return resolved;
        return {
          ok: false,
          error: capabilityUnavailableError(capability.id, contribution.descriptor.realm)
        };
      },
      runChild: async (childContribution, childArgs, childOptions = {}) => {
        if (terminalStarted) {
          return {
            outcome: "failed",
            failure: terminalError(runId, "failed"),
            artifacts: []
          };
        }
        const childRun = runtime.run(childContribution, childArgs, {
          ...childOptions,
          signal: controller.signal,
          ...childOptions.capabilityResolver === void 0 && options.capabilityResolver !== void 0 ? { capabilityResolver: options.capabilityResolver } : {},
          ...options.snapshot === void 0 ? {} : { snapshot: options.snapshot }
        });
        channel.emit({
          kind: "child-started",
          runId,
          childRunId: childRun.id,
          atMs: performance.now()
        });
        lease.register(`child:${childRun.id}`, () => {
          childRun.cancel("parent terminal");
        });
        return childRun.terminal;
      }
    };
    const fail = (failure) => {
      void settle({ outcome: "failed", failure, artifacts: [] });
    };
    const cancel = (reason = "cancelled by caller") => {
      cancelReason = reason;
      void settle(
        { outcome: "failed", failure: cancellationError(reason), artifacts: [] },
        "cancel"
      );
    };
    const disconnect = (transport = "tool transport") => {
      void settle(
        { outcome: "failed", failure: disconnectedError(transport), artifacts: [] },
        "disconnect"
      );
    };
    const providerExit = (provider = "provider") => {
      void settle(
        {
          outcome: "failed",
          failure: domainFailureError(
            "provider-exit",
            "the provider to remain alive until terminal",
            "Restart the provider and retry from the serialized snapshot.",
            provider
          ),
          artifacts: []
        },
        "provider-exit"
      );
    };
    const timeout = options.deadlineMs === void 0 ? void 0 : setTimeout(
      () => void settle(
        {
          outcome: "failed",
          failure: timeoutError(options.deadlineMs),
          artifacts: []
        },
        "timeout"
      ),
      options.deadlineMs
    );
    channel.emit({ kind: "started", runId, atMs: performance.now() });
    void (async () => {
      try {
        let parsedArgs;
        try {
          parsedArgs = contribution.descriptor.argsSchema.parse(args);
        } catch (cause) {
          await settle({
            outcome: "failed",
            failure: invalidArgsError(
              cause instanceof Error ? cause.message : String(cause),
              serializablePreview(args)
            ),
            artifacts: []
          });
          return;
        }
        if (!parsedArgs.ok) {
          fail(invalidArgsError(parsedArgs.error, serializablePreview(args)));
          return;
        }
        if (options.signal?.aborted) {
          cancelReason = "aborted by caller";
          fail(cancellationError(cancelReason));
          return;
        }
        const onAbort = () => cancel("aborted by caller");
        options.signal?.addEventListener("abort", onAbort, { once: true });
        let produced;
        const executeStartedAtMs = startToolTiming();
        try {
          produced = await contribution.execute(parsedArgs.value, context);
        } finally {
          operationTiming.record("execute", Math.max(0, startToolTiming() - executeStartedAtMs));
          options.signal?.removeEventListener("abort", onAbort);
        }
        if (terminalStarted) return;
        if (controller.signal.aborted) {
          fail(cancellationError(cancelReason));
          return;
        }
        let result = produced;
        let snapshotAfter = options.snapshot;
        let artifacts = [];
        if (isTerminal(produced)) {
          if (produced.outcome === "failed") {
            await settle(produced);
            return;
          }
          result = produced.result;
          snapshotAfter = produced.snapshotAfter;
          artifacts = produced.artifacts;
          cleanupReport = produced.cleanup ?? cleanupReport;
        } else if (hasOkField(produced)) {
          if (produced.ok === false) {
            const error = Reflect.get(produced, "error");
            const failureArtifacts = Reflect.get(produced, "artifacts") ?? [];
            if (!validateArtifactRefs(failureArtifacts)) {
              await settle({
                outcome: "failed",
                failure: domainFailureError(
                  "artifact-ref-invalid",
                  "failure artifact refs to be serializable ArtifactRef values",
                  "Return refs created by createArtifactRef."
                ),
                artifacts: []
              });
              return;
            }
            if (isToolRuntimeError(error)) {
              await settle({ outcome: "failed", failure: error, artifacts: failureArtifacts });
              return;
            }
            await settle({
              outcome: "failed",
              failure: domainError(error),
              artifacts: failureArtifacts
            });
            return;
          }
          result = Reflect.get(produced, "value");
          snapshotAfter = Reflect.get(produced, "snapshotAfter");
          artifacts = Reflect.get(produced, "artifacts") ?? [];
        }
        if (!isSerializableValue(result)) {
          await settle({
            outcome: "failed",
            failure: domainFailureError(
              "terminal-not-serializable",
              "the result to be JSON serializable",
              "Return plain JSON data and ArtifactRef values instead of live handles."
            ),
            artifacts: []
          });
          return;
        }
        const parsedResult = contribution.descriptor.resultSchema.parse(result);
        if (!parsedResult.ok) {
          await settle({
            outcome: "failed",
            failure: domainFailureError(
              "result-schema-invalid",
              "the result to satisfy resultSchema",
              parsedResult.error
            ),
            artifacts: []
          });
          return;
        }
        if (!validateArtifactRefs(artifacts)) {
          await settle({
            outcome: "failed",
            failure: domainFailureError(
              "artifact-ref-invalid",
              "artifact refs to be serializable ArtifactRef values",
              "Return refs created by createArtifactRef."
            ),
            artifacts: []
          });
          return;
        }
        const requiredEvidence = [
          .../* @__PURE__ */ new Set([...contribution.descriptor.evidence ?? [], ...options.evidence ?? []])
        ];
        const missingEvidence = requiredEvidence.filter(
          (kind) => !artifacts.some((artifact) => artifact.kind === kind)
        );
        if (missingEvidence.length > 0) {
          await settle({
            outcome: "failed",
            failure: artifactIncompleteError(missingEvidence, runId),
            artifacts
          });
          return;
        }
        await settle({
          outcome: "succeeded",
          result: parsedResult.value,
          artifacts,
          ...snapshotAfter === void 0 ? {} : { snapshotAfter }
        });
      } catch (cause) {
        await settle({
          outcome: "failed",
          failure: domainFailureError(
            "executor-threw",
            "the contribution executor to return a result",
            cause instanceof Error ? cause.message : String(cause)
          ),
          artifacts: []
        });
      } finally {
        if (timeout !== void 0) clearTimeout(timeout);
        resolveExecutorExited();
      }
    })();
    const runtimeRun = {
      id: runId,
      events: channel.events,
      terminal,
      executorExited,
      cancel,
      disconnect,
      providerExit
    };
    return runtimeRun;
  };
  const runtime = {
    list,
    describe: (id) => byId.get(id)?.descriptor,
    get: (id) => byId.get(id),
    run
  };
  return runtime;
}

// src/api.ts
function assertName(value, label) {
  if (typeof value !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9._:/-]*$/.test(value)) {
    throw new TypeError(`${label} must be a stable non-empty identity`);
  }
}
function operationPath(descriptor) {
  return (descriptor.path ?? descriptor.id.split(".")).join(" ");
}
function providerKey(sourceId, providerId) {
  return `${sourceId}\0${providerId}`;
}
function apiFailure(code, expected, hint, detail) {
  return domainFailureError(code, expected, hint, detail);
}
function failedRun(failure) {
  const id = `api:${crypto.randomUUID()}`;
  const terminal = Promise.resolve({
    outcome: "failed",
    failure,
    artifacts: []
  });
  const events = {
    async *[Symbol.asyncIterator]() {
      yield { kind: "started", runId: id, atMs: performance.now() };
      yield { kind: "terminal", runId: id, outcome: "failed", atMs: performance.now() };
    }
  };
  return {
    id,
    events,
    terminal,
    executorExited: Promise.resolve(),
    cancel() {
    },
    disconnect() {
    },
    providerExit() {
    }
  };
}
function validateProvider(input) {
  assertName(input.providerId, "providerId");
  assertName(input.sourceId, "sourceId");
  if (!["build", "host", "engine", "frontend"].includes(input.realm))
    throw new TypeError(`unsupported Tool API realm ${String(input.realm)}`);
  if (!Array.isArray(input.tools) || input.tools.length === 0)
    throw new TypeError("Tool API providers must publish at least one contribution");
  const ids = /* @__PURE__ */ new Set();
  const paths = /* @__PURE__ */ new Set();
  if (input.initialState !== void 0 && input.initialState !== "pending" && input.initialState !== "active")
    throw new TypeError("Tool API provider initialState must be pending or active");
  for (const contribution of input.tools) {
    if (contribution === null || typeof contribution !== "object")
      throw new TypeError("Tool API contributions must be objects");
    if (typeof contribution.execute !== "function")
      throw new TypeError(
        `Tool API contribution ${String(contribution.descriptor?.id)} needs an executor`
      );
    const descriptor = contribution.descriptor;
    if (descriptor.realm !== input.realm)
      throw new TypeError(
        `Tool API ${descriptor.id} declares ${descriptor.realm} but provider is ${input.realm}`
      );
    if (ids.has(descriptor.id))
      throw new TypeError(`duplicate Tool API operation id ${descriptor.id}`);
    ids.add(descriptor.id);
    const path = operationPath(descriptor);
    if (paths.has(path)) throw new TypeError(`duplicate Tool API command path ${path}`);
    paths.add(path);
  }
}
function createToolApi() {
  const providers = /* @__PURE__ */ new Map();
  const listeners = /* @__PURE__ */ new Set();
  let providerGeneration = 0;
  let disposed = false;
  const notify = () => {
    const value = api.snapshot();
    for (const listener of listeners) {
      try {
        listener(value);
      } catch {
      }
    }
  };
  const snapshot = () => {
    const providerSnapshots = [];
    const operations = [];
    for (const record of providers.values()) {
      providerSnapshots.push({
        owner: record.owner,
        state: record.state,
        ...record.fiberState === void 0 ? {} : { fiberState: record.fiberState },
        callable: record.state === "active",
        operationIds: record.input.tools.map(({ descriptor }) => descriptor.id)
      });
      for (const contribution of record.input.tools) {
        operations.push({
          descriptor: contribution.descriptor,
          owner: record.owner,
          providerState: record.state,
          declared: true,
          callable: record.state === "active",
          ...record.fiberState === void 0 ? {} : { fiberState: record.fiberState }
        });
      }
    }
    providerSnapshots.sort(
      (left, right) => providerKey(left.owner.sourceId, left.owner.providerId).localeCompare(
        providerKey(right.owner.sourceId, right.owner.providerId)
      )
    );
    operations.sort((left, right) => {
      const source = left.owner.sourceId.localeCompare(right.owner.sourceId);
      return source !== 0 ? source : left.descriptor.id.localeCompare(right.descriptor.id);
    });
    return { providers: providerSnapshots, operations };
  };
  const registerProvider = (input) => {
    if (disposed) throw new Error("Tool API is disposed");
    validateProvider(input);
    const key = providerKey(input.sourceId, input.providerId);
    if (providers.get(key)?.state === "active" || providers.get(key)?.state === "revoking") {
      throw new TypeError(
        `Tool API provider ${input.sourceId}/${input.providerId} is already registered`
      );
    }
    const operationKeys = /* @__PURE__ */ new Set();
    for (const contribution of input.tools) {
      const operationKey = `${input.sourceId}\0${contribution.descriptor.id}`;
      const pathKey2 = `${input.sourceId}\0${operationPath(contribution.descriptor)}`;
      if (operationKeys.has(operationKey) || operationKeys.has(pathKey2))
        throw new TypeError(`Tool API contribution conflict for ${contribution.descriptor.id}`);
      operationKeys.add(operationKey);
      operationKeys.add(pathKey2);
      for (const record2 of providers.values()) {
        if (!["pending", "active", "revoking"].includes(record2.state) || record2.owner.sourceId !== input.sourceId)
          continue;
        if (record2.input.tools.some(({ descriptor }) => descriptor.id === contribution.descriptor.id)) {
          throw new TypeError(
            `Tool API operation ${contribution.descriptor.id} already exists for source ${input.sourceId}`
          );
        }
        if (record2.input.tools.some(
          ({ descriptor }) => operationPath(descriptor) === operationPath(contribution.descriptor)
        )) {
          throw new TypeError(
            `Tool API command path ${operationPath(contribution.descriptor)} already exists for source ${input.sourceId}`
          );
        }
      }
    }
    const generation = input.generation ?? ++providerGeneration;
    if (!Number.isSafeInteger(generation) || generation <= 0)
      throw new TypeError("Tool API provider generation must be a positive integer");
    providerGeneration = Math.max(providerGeneration, generation);
    const owner = {
      providerId: input.providerId,
      sourceId: input.sourceId,
      generation,
      realm: input.realm,
      ...input.fiberId === void 0 ? {} : { fiberId: input.fiberId },
      ...input.module === void 0 ? {} : { module: input.module }
    };
    const runtime = createToolRuntime(input.tools);
    const record = {
      input: { ...input, tools: [...input.tools] },
      owner,
      runtime,
      runs: /* @__PURE__ */ new Set(),
      state: input.initialState ?? "active",
      ...input.fiberState === void 0 ? {} : { fiberState: input.fiberState }
    };
    providers.set(key, record);
    notify();
    const activate = (fiberState = "active") => {
      if (record.state !== "pending") return;
      record.state = "active";
      record.fiberState = fiberState;
      notify();
    };
    const fail = (reason = "provider failed", fiberState = "failed") => {
      if (record.state !== "pending" && record.state !== "active") return;
      record.state = "failed";
      record.reason = reason;
      record.fiberState = fiberState;
      for (const run2 of record.runs) run2.cancel(reason);
      notify();
    };
    const revoke = async (reason = "provider revoked") => {
      if (record.state === "revoked") return;
      if (record.state === "active" || record.state === "pending") {
        record.state = "revoking";
        record.reason = reason;
        record.fiberState = "unloading";
        notify();
        for (const run2 of record.runs) run2.cancel(reason);
      }
      await Promise.all([...record.runs].map((run2) => run2.executorExited));
      if (record.state !== "failed") {
        record.state = "revoked";
        record.fiberState = "disposed";
      }
      notify();
    };
    return Object.freeze({
      owner,
      activate,
      fail,
      snapshot: () => ({
        owner,
        state: record.state,
        ...record.fiberState === void 0 ? {} : { fiberState: record.fiberState },
        callable: record.state === "active",
        operationIds: record.input.tools.map(({ descriptor }) => descriptor.id)
      }),
      revoke
    });
  };
  const findRecords = (id, sourceId) => [...providers.values()].filter(
    (record) => (sourceId === void 0 || record.owner.sourceId === sourceId) && record.input.tools.some(({ descriptor }) => descriptor.id === id)
  );
  const run = (id, args, options = {}) => {
    if (disposed) {
      return failedRun(
        apiFailure(
          "api-disposed",
          "the Tool API owner to remain available",
          "Create a fresh owner and retry the operation.",
          { operation: id }
        )
      );
    }
    if (options.providerId !== void 0 && options.sourceId === void 0) {
      return failedRun(
        apiFailure(
          "api-source-required",
          `operation ${id} to include its explicit sourceId with providerId`,
          "Refresh Tool API sources and pass both sourceId and providerId from one snapshot.",
          { operation: id, providerId: options.providerId }
        )
      );
    }
    const matches = findRecords(id, options.sourceId);
    const active = matches.filter((record) => record.state === "active");
    const selected = options.providerId === void 0 ? active.length === 1 ? active[0] : void 0 : active.find((record) => record.owner.providerId === options.providerId);
    if (selected === void 0) {
      const code = matches.length === 0 || active.length === 0 ? "api-operation-unavailable" : "api-provider-route-required";
      return failedRun(
        apiFailure(
          code,
          `operation ${id} to have one active, explicitly routable provider`,
          "Refresh Tool API sources and select the providerId/sourceId returned by discovery.",
          {
            operation: id,
            ...options.providerId === void 0 ? {} : { providerId: options.providerId },
            providers: matches.map((record) => record.owner.providerId)
          }
        )
      );
    }
    if (options.generation !== void 0 && options.generation !== selected.owner.generation) {
      return failedRun(
        apiFailure(
          "api-stale-generation",
          `provider ${selected.owner.providerId} generation ${options.generation} to match ${selected.owner.generation}`,
          "Refresh the source snapshot before retrying the operation.",
          {
            operation: id,
            providerId: selected.owner.providerId,
            expectedGeneration: selected.owner.generation,
            actualGeneration: options.generation
          }
        )
      );
    }
    const contribution = selected.input.tools.find(({ descriptor }) => descriptor.id === id);
    if (contribution === void 0) {
      return failedRun(
        apiFailure(
          "api-operation-unavailable",
          `operation ${id} to remain published by its provider`,
          "Refresh Tool API sources before retrying.",
          { operation: id }
        )
      );
    }
    if (selected.input.authorize?.(options.caller, contribution.descriptor) === false) {
      return failedRun(
        apiFailure(
          "api-unauthorized",
          `caller to be authorized for operation ${id}`,
          "Use the authenticated Host connection and the capability it was granted.",
          { operation: id, providerId: selected.owner.providerId }
        )
      );
    }
    const runOptions = {
      ...options,
      owner: selected.owner,
      ...options.caller === void 0 ? {} : { caller: options.caller }
    };
    const activeRun = selected.runtime.run(contribution, args, runOptions);
    selected.runs.add(activeRun);
    void activeRun.executorExited.finally(
      () => selected.runs.delete(activeRun)
    );
    return activeRun;
  };
  const api = {
    snapshot,
    list: () => snapshot().operations,
    describe: (id, sourceId) => findRecords(id, sourceId).flatMap((record) => {
      const contribution = record.input.tools.find(({ descriptor }) => descriptor.id === id);
      return contribution === void 0 ? [] : [
        {
          descriptor: contribution.descriptor,
          owner: record.owner,
          providerState: record.state,
          declared: true,
          callable: record.state === "active",
          ...record.fiberState === void 0 ? {} : { fiberState: record.fiberState }
        }
      ];
    }),
    registerProvider,
    run,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async dispose() {
      if (disposed) return;
      disposed = true;
      const pending = [...providers.values()].map((record) => {
        if (record.state === "active" || record.state === "pending") {
          record.state = "revoking";
          record.fiberState = "unloading";
          for (const run2 of record.runs) run2.cancel("Tool API owner disposed");
        }
        return Promise.all([...record.runs].map((run2) => run2.executorExited)).then(() => {
          if (record.state !== "failed") {
            record.state = "revoked";
            record.fiberState = "disposed";
          }
        });
      });
      await Promise.all(pending);
      notify();
      listeners.clear();
    }
  };
  return api;
}

// src/capability.ts
var capabilityIdPattern = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;
function defineToolCapability(id) {
  if (!capabilityIdPattern.test(id)) {
    throw new TypeError(`Tool capability id must use a stable lower-case path: ${id}`);
  }
  return Object.freeze({ id });
}
function createCapabilityResolver(resolve) {
  return (capability) => {
    const value = resolve(capability);
    return value === void 0 ? void 0 : { ok: true, value };
  };
}
function admissionFailure(admission, expected) {
  if (admission === void 0) return "no workload-scoped admission report was supplied";
  if (admission.schema !== "forgeax.tool-service-admission-ref.v1" || !/^sha256:[0-9a-f]{64}$/.test(admission.reportDigest)) {
    return "admission report identity is invalid";
  }
  for (const key of [
    "toolId",
    "descriptorDigest",
    "recipeDigest",
    "workloadClass",
    "codeDigest",
    "browserVersion",
    "backend"
  ]) {
    if (admission[key] !== expected[key]) return `admission ${key} does not match this run`;
  }
  if (admission.frameCount < 300) return "admission workload ran fewer than 300 frames";
  if (Object.values(admission.samples).some((count) => count < 30)) {
    return "admission sample set is incomplete";
  }
  if (!admission.correctness.terminalEquivalent || !admission.correctness.artifactIntegrity || !admission.correctness.freshReplay || !admission.correctness.hiddenParity || admission.correctness.drawCalls <= 0 || admission.correctness.nonBlackPixels <= 0) {
    return "admission correctness gate failed";
  }
  const performance2 = admission.performance;
  if (Object.values(performance2).some((value) => !Number.isFinite(value) || value <= 0) || performance2.serviceMedianMs > performance2.privateMedianMs * 0.8 || performance2.serviceP95Ms > performance2.privateP95Ms * 0.9 || performance2.serviceMaxMs > performance2.privateMaxMs * 1.1 || performance2.serviceRssBytes > performance2.privateRssBytes * 1.25) {
    return "admission performance threshold failed";
  }
  if (!admission.cleanupPassed) return "admission cleanup gate failed";
  if (!admission.evictionPassed) return "admission eviction gate failed";
  return void 0;
}
function createServiceCapability(admission, expected) {
  const reason = admissionFailure(admission, expected);
  if (reason === void 0 && admission !== void 0) {
    return { available: true, reportDigest: admission.reportDigest };
  }
  return {
    available: false,
    code: "tool-service-capability-absent",
    expected: "an admitted acceleration service",
    hint: "Use the private executor and rerun benchmark admission before enabling service.",
    detail: { reason: reason ?? "benchmark admission did not pass" }
  };
}
function createRealmCapabilityMatrix(input) {
  const realms = ["build", "host", "engine", "frontend"].reduce(
    (result, realm) => {
      const supported = input.supported[realm];
      result[realm] = supported ? { realm, supported: true } : { realm, supported: false, reason: "realm-capability-unavailable" };
      return result;
    },
    {}
  );
  return { catalogDigest: input.catalogDigest, realms };
}
function bootstrapNotCloneSafeError(detail) {
  return {
    code: "tool-bootstrap-not-clone-safe",
    expected: "bootstrap input to contain structured-clone-safe data",
    hint: "Remove live handles, functions, ports, and realm-owned objects from bootstrap input.",
    detail
  };
}
function validateRealmBootstrapPayload(value) {
  try {
    structuredClone(value);
    return { ok: true };
  } catch (cause) {
    return {
      ok: false,
      error: bootstrapNotCloneSafeError({
        message: cause instanceof Error ? cause.message : String(cause)
      })
    };
  }
}

// src/carrier.ts
function token() {
  return crypto.randomUUID().replaceAll("-", "");
}
function carrierError(code, expected, hint, detail) {
  return { code, expected, hint, detail };
}
function containsLiveKey(value, seen = /* @__PURE__ */ new Set()) {
  if (typeof value !== "object" || value === null) return false;
  if (seen.has(value)) return false;
  seen.add(value);
  if (Array.isArray(value)) return value.some((entry) => containsLiveKey(entry, seen));
  return Object.entries(value).some(([key, nested]) => {
    if (["world", "renderer", "canvas", "ui", "profile", "liveHandle", "context", "fiber"].includes(
      key
    ))
      return true;
    return containsLiveKey(nested, seen);
  });
}
function validateOptions(options) {
  if (options.projectId.length === 0 || options.consumerId.length === 0) {
    throw new TypeError("carrier projectId and consumerId must not be empty");
  }
  const endpoint = new URL(options.endpoint);
  if (endpoint.protocol !== "http:" || !["127.0.0.1", "localhost"].includes(endpoint.hostname)) {
    throw new TypeError("carrier endpoint must be loopback HTTP");
  }
  if (!Number.isFinite(options.now) || !Number.isFinite(options.ttlMs) || options.ttlMs <= 0) {
    throw new TypeError("carrier clock and ttl must be finite and positive");
  }
  if (containsLiveKey(options.payload)) throw new TypeError("carrier-payload-live-state");
}
function createCarrierStateMachine(options) {
  validateOptions(options);
  const offer = {
    schemaVersion: "1.0.0",
    projectId: options.projectId,
    consumerId: options.consumerId,
    offerId: `offer:${token()}`,
    endpoint: options.endpoint,
    bearerToken: token(),
    livenessToken: token(),
    expiresAt: options.now + options.ttlMs,
    ...options.descriptorDigest === void 0 ? {} : { descriptorDigest: options.descriptorDigest },
    ...options.recipeDigest === void 0 ? {} : { recipeDigest: options.recipeDigest },
    state: "offered"
  };
  let state = { state: "offered" };
  let lease;
  const leaseOffer = (requestOrId, maybeRequest) => {
    const request = typeof requestOrId === "string" ? maybeRequest : requestOrId;
    const requestedLeaseId = typeof requestOrId === "string" ? requestOrId : void 0;
    if (request === void 0) {
      return {
        ok: false,
        error: carrierError(
          "carrier-token-invalid",
          "a complete lease request",
          "Provide consumer identity, bearer token, and current time.",
          {}
        )
      };
    }
    if (state.state === "started") {
      return {
        ok: false,
        error: carrierError(
          "carrier-started",
          "a started carrier not to be retried",
          "Report one terminal failure and clean up the existing started lease.",
          {}
        )
      };
    }
    if (state.state === "exited") {
      return {
        ok: false,
        error: carrierError(
          "carrier-exited",
          "an exited carrier not to be retried",
          "Re-run the operation from a serialized snapshot instead of migrating live state.",
          {}
        )
      };
    }
    if (request.consumerId !== offer.consumerId) {
      return {
        ok: false,
        error: carrierError(
          "carrier-consumer-mismatch",
          "the offer consumer identity to match",
          "Use the consumer identity that was authenticated for this project offer.",
          { expected: offer.consumerId, actual: request.consumerId }
        )
      };
    }
    if (request.bearerToken !== offer.bearerToken) {
      return {
        ok: false,
        error: carrierError(
          "carrier-token-invalid",
          "the bearer token to match the ephemeral offer",
          "Request a fresh visible offer; never persist or guess bearer tokens.",
          {}
        )
      };
    }
    if (offer.descriptorDigest !== void 0 && request.descriptorDigest !== offer.descriptorDigest) {
      return {
        ok: false,
        error: carrierError(
          "carrier-descriptor-mismatch",
          "the descriptor digest to match the authenticated offer",
          "Refresh the descriptor and request a new visible offer before retrying.",
          { expected: offer.descriptorDigest, actual: request.descriptorDigest }
        )
      };
    }
    if (offer.recipeDigest !== void 0 && request.recipeDigest !== offer.recipeDigest) {
      return {
        ok: false,
        error: carrierError(
          "carrier-recipe-mismatch",
          "the recipe digest to match the authenticated offer",
          "Serialize the current snapshot and request a fresh visible offer before retrying.",
          { expected: offer.recipeDigest, actual: request.recipeDigest }
        )
      };
    }
    if (request.now >= offer.expiresAt) {
      state = { state: "expired" };
      return {
        ok: false,
        error: carrierError(
          "carrier-offer-expired",
          "the offer to be within its expiry window",
          "Fall back to the ordinary visible carrier before retrying.",
          { expiresAt: offer.expiresAt, now: request.now }
        )
      };
    }
    if (requestedLeaseId !== void 0 && requestedLeaseId !== lease?.leaseId) {
      return {
        ok: false,
        error: carrierError(
          "carrier-token-invalid",
          "the lease id to match the authenticated offer",
          "Use the lease id returned by the first successful lease.",
          {}
        )
      };
    }
    lease = {
      leaseId: `lease:${token()}`,
      offerId: offer.offerId,
      consumerId: request.consumerId,
      state: "leased"
    };
    state = { state: "leased", leaseId: lease.leaseId };
    return { ok: true, value: lease, state: "leased" };
  };
  const started = (leaseId) => {
    if (lease?.leaseId !== leaseId) {
      return {
        ok: false,
        error: carrierError(
          "carrier-lease-required",
          "a valid lease before started",
          "Lease the authenticated offer before reporting provider started.",
          {}
        )
      };
    }
    state = { state: "started", leaseId };
    return { ok: true, value: state, state: "started" };
  };
  const exit = (leaseId) => {
    if (lease?.leaseId !== leaseId || state.state !== "started") {
      return {
        ok: false,
        error: carrierError(
          "carrier-lease-required",
          "a started lease before provider exit",
          "Provider exit is terminal only after started has been acknowledged.",
          {}
        )
      };
    }
    state = { state: "exited", leaseId };
    return { ok: true, value: state, state: "exited" };
  };
  const fallback = () => {
    if (state.state === "started" || state.state === "exited") {
      return {
        ok: false,
        error: carrierError(
          "carrier-started",
          "fallback to happen before provider started",
          "Do not retry or migrate a carrier after started; return its terminal failure.",
          { state: state.state }
        )
      };
    }
    state = { state: "fallback" };
    return { ok: true, value: state, state: "fallback" };
  };
  return {
    offer,
    lease: leaseOffer,
    started,
    exit,
    fallback,
    snapshot: () => state
  };
}

// src/command-tree.ts
var ToolCommandError = class extends Error {
  code;
  path;
  detail;
  constructor(code, path, message, detail = {}) {
    super(`${code}: ${message}`);
    this.name = "ToolCommandError";
    this.code = code;
    this.path = path;
    this.detail = detail;
  }
};
function normalizePath(path) {
  const segments = typeof path === "string" ? path.split(/\s+/).filter(Boolean) : [...path];
  if (segments.length === 0 && typeof path === "string" || segments.some((segment) => !/^[a-z][a-z0-9-]*$/.test(segment))) {
    throw new ToolCommandError(
      "tool-command-invalid-path",
      typeof path === "string" ? path : segments.join(" "),
      "command paths must contain lower-case name segments"
    );
  }
  return segments;
}
function descriptorPath(descriptor) {
  const path = normalizePath(descriptor.path ?? descriptor.id.split("."));
  if (path.length === 0) {
    throw new ToolCommandError(
      "tool-command-invalid-path",
      "",
      "command declarations must contain at least one name segment"
    );
  }
  return path;
}
function pathKey(path) {
  return path.join(" ");
}
function schemaValue(describe) {
  if (describe === void 0) return void 0;
  try {
    const value = JSON.parse(describe);
    return value !== null && typeof value === "object" ? value : void 0;
  } catch {
    return void 0;
  }
}
function nodeForDescriptor(descriptor, path, includeLeaf = true) {
  const inputSchema = descriptor.inputSchema ?? schemaValue(descriptor.argsSchema.describe);
  const outputSchema = descriptor.outputSchema ?? schemaValue(descriptor.resultSchema.describe);
  const node = {
    name: path[path.length - 1],
    path: pathKey(path),
    summary: descriptor.summary
  };
  if (includeLeaf) {
    return {
      ...node,
      leaf: {
        title: descriptor.title,
        realm: descriptor.realm,
        ...inputSchema === void 0 ? descriptor.argsSchema.describe === void 0 ? {} : { inputDescription: descriptor.argsSchema.describe } : { inputSchema },
        ...outputSchema === void 0 ? descriptor.resultSchema.describe === void 0 ? {} : { outputDescription: descriptor.resultSchema.describe } : { outputSchema },
        capabilities: [...descriptor.capabilities ?? []],
        errors: [...descriptor.errors ?? []],
        ...descriptor.example === void 0 ? {} : { example: descriptor.example }
      }
    };
  }
  return node;
}
function compareRegistered(left, right) {
  return pathKey(left.path).localeCompare(pathKey(right.path));
}
function hasPrefix(left, right) {
  return left.length < right.length && left.every((segment, index) => segment === right[index]);
}
function findNode(registered, path) {
  return registered.find(
    (candidate) => candidate.path.length === path.length && candidate.path.every((segment, index) => segment === path[index])
  );
}
function descendants(registered, path) {
  return registered.filter((candidate) => hasPrefix(path, candidate.path));
}
function projectNodes(registered, path, recursive) {
  const children = /* @__PURE__ */ new Map();
  for (const candidate of registered) {
    if (candidate.path.length <= path.length || !path.every((segment, index) => candidate.path[index] === segment))
      continue;
    const next = candidate.path[path.length];
    const existing = children.get(next);
    if (existing === void 0 || candidate.path.length < (existing?.path.length ?? Number.MAX_SAFE_INTEGER))
      children.set(next, candidate.path.length === path.length + 1 ? candidate : void 0);
  }
  return [...children.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([name, exact]) => {
    const childPath = [...path, name];
    if (exact !== void 0)
      return nodeForDescriptor(exact.contribution.descriptor, childPath, false);
    const node = {
      name,
      path: pathKey(childPath),
      summary: descendants(registered, childPath)[0]?.contribution.descriptor.summary ?? ""
    };
    if (recursive) return { ...node, children: projectNodes(registered, childPath, true) };
    return node;
  });
}
function commandPath(descriptor) {
  return descriptorPath(descriptor);
}
function defineCommand(descriptor, execute) {
  const path = descriptorPath(descriptor);
  return {
    descriptor: {
      ...descriptor,
      id: descriptor.id ?? path.join("."),
      path
    },
    execute
  };
}
function createToolCommandRegistry(contributions) {
  const registered = [];
  const byPath = /* @__PURE__ */ new Map();
  for (const contribution of contributions) {
    const path = descriptorPath(contribution.descriptor);
    const key = pathKey(path);
    if (byPath.has(key) || registered.some(
      (candidate) => hasPrefix(candidate.path, path) || hasPrefix(path, candidate.path)
    )) {
      throw new ToolCommandError(
        "tool-command-conflict",
        key,
        "command paths cannot collide with a leaf or its descendants",
        { path: key }
      );
    }
    byPath.set(key, contribution);
    registered.push({ path, contribution });
  }
  registered.sort(compareRegistered);
  const runtime = createToolRuntime(registered.map((entry) => entry.contribution));
  const find = (pathInput) => {
    const path = normalizePath(pathInput);
    return findNode(registered, path);
  };
  const help = (pathInput, recursive = false) => {
    const path = pathInput === void 0 ? [] : normalizePath(pathInput);
    const exact = path.length === 0 ? void 0 : findNode(registered, path);
    const descendant = path.length === 0 ? registered : descendants(registered, path);
    if (path.length > 0 && exact === void 0 && descendant.length === 0) {
      let parent = path.slice(0, -1);
      while (parent.length > 0 && descendants(registered, parent).length === 0)
        parent = parent.slice(0, -1);
      throw new ToolCommandError(
        "tool-command-not-found",
        pathKey(path),
        "command path was not found",
        {
          parent: pathKey(parent),
          candidates: projectNodes(registered, parent, false).map((node) => node.name)
        }
      );
    }
    const leaf = exact === void 0 ? void 0 : nodeForDescriptor(exact.contribution.descriptor, path).leaf;
    const summary = exact?.contribution.descriptor.summary;
    return {
      path: pathKey(path),
      ...summary === void 0 ? {} : { summary },
      nodes: projectNodes(registered, path, recursive || exact !== void 0),
      ...leaf === void 0 ? {} : { leaf }
    };
  };
  return {
    contributions: registered.map((entry) => entry.contribution),
    list: (path = []) => projectNodes(registered, path, false),
    tree: (path = []) => projectNodes(registered, normalizePath(path), true),
    describe: (pathInput) => find(pathInput)?.contribution.descriptor,
    help,
    get: (pathInput) => find(pathInput)?.contribution,
    run: (pathInput, args, options) => {
      const contribution = find(pathInput)?.contribution;
      if (contribution === void 0) return void 0;
      return runtime.run(contribution, args, options);
    }
  };
}

// src/json-schema.ts
function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}
function typeMatches(type, value) {
  switch (type) {
    case void 0:
      return true;
    case "null":
      return value === null;
    case "array":
      return Array.isArray(value);
    case "object":
      return isRecord(value);
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && Number.isFinite(value);
    case "integer":
      return typeof value === "number" && Number.isSafeInteger(value);
    case "boolean":
      return typeof value === "boolean";
  }
}
function validate(value, schema, path) {
  if (!typeMatches(schema.type, value))
    return { path, message: `expected ${schema.type ?? "a value"}` };
  if (schema.enum !== void 0 && !schema.enum.some((candidate) => sameJson(candidate, value))) {
    return { path, message: "expected one of the declared enum values" };
  }
  if (schema.const !== void 0 && !sameJson(schema.const, value)) {
    return { path, message: "expected the declared constant value" };
  }
  if (typeof value === "string" && schema.minLength !== void 0 && value.length < schema.minLength) {
    return { path, message: `must contain at least ${schema.minLength} characters` };
  }
  if (typeof value === "number") {
    if (schema.minimum !== void 0 && value < schema.minimum)
      return { path, message: `must be at least ${schema.minimum}` };
    if (schema.maximum !== void 0 && value > schema.maximum)
      return { path, message: `must be at most ${schema.maximum}` };
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== void 0 && value.length < schema.minItems)
      return { path, message: `must contain at least ${schema.minItems} items` };
    if (schema.items !== void 0) {
      for (let index = 0; index < value.length; index += 1) {
        const failure = validate(value[index], schema.items, `${path}[${index}]`);
        if (failure !== void 0) return failure;
      }
    }
  }
  if (isRecord(value)) {
    const properties = schema.properties ?? {};
    for (const key of schema.required ?? []) {
      if (!(key in value)) return { path: `${path}.${key}`, message: "is required" };
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in properties)) return { path: `${path}.${key}`, message: "is not declared" };
      }
    }
    for (const [key, child] of Object.entries(properties)) {
      if (!(key in value)) continue;
      const failure = validate(value[key], child, `${path}.${key}`);
      if (failure !== void 0) return failure;
    }
  }
  return void 0;
}
function parseToolJsonSchema(value, schema) {
  const failure = validate(value, schema, "$");
  return failure === void 0 ? { ok: true, value } : { ok: false, error: `${failure.path}: ${failure.message}` };
}
function toolJsonSchema(schema) {
  return {
    parse: (value) => parseToolJsonSchema(value, schema),
    describe: JSON.stringify(schema)
  };
}

// src/migration.ts
var liveStateKeys = /* @__PURE__ */ new Set([
  "world",
  "renderer",
  "canvas",
  "context",
  "fiber",
  "page",
  "carrier",
  "ui",
  "selection",
  "draft",
  "undo",
  "session"
]);
function liveStateError(path, key) {
  return {
    code: "tool-migration-live-state",
    expected: "migration payload to contain only recipe, snapshot, and artifact references",
    hint: "Recreate the operation from serializable authority facts; do not migrate live state.",
    detail: { path, key }
  };
}
function createCapabilityToken(operation, source, version, target) {
  if (source.catalogDigest.length === 0 || target.catalogDigest.length === 0)
    throw new TypeError("capability probe catalogDigest must not be empty");
  return {
    kind: "forgeax-tool-capability",
    version,
    operation,
    source: { ...source, evidence: [...source.evidence] },
    target: { ...target, evidence: [...target.evidence] }
  };
}
function probeMigrationTarget(token2, target) {
  const sameEvidence = token2.target.evidence.every((kind) => target.evidence.includes(kind));
  const matches = token2.target.realm === target.realm && token2.target.catalogDigest === target.catalogDigest && token2.target.rhiBackend === target.rhiBackend && sameEvidence;
  if (!matches) {
    return {
      ok: false,
      error: capabilityUnavailableError(`migration:${token2.operation}`, target.realm)
    };
  }
  return { ok: true, value: { ...target, evidence: [...target.evidence] } };
}
function createMigrationRecipe(input) {
  const recipe = {
    operation: input.operation,
    args: input.args,
    ...input.snapshot === void 0 ? {} : { snapshot: { ...input.snapshot } },
    artifacts: (input.artifacts ?? []).map((artifact) => ({ ...artifact }))
  };
  const validation = validateMigrationPayload(recipe);
  if (!validation.ok) {
    const path = validation.error.code === "tool-migration-live-state" ? validation.error.detail.path : "$";
    throw new TypeError(path);
  }
  return recipe;
}
function validateMigrationPayload(value) {
  const visit = (candidate, path) => {
    if (!isSerializableValue(candidate)) {
      return { ok: false, error: liveStateError(path, path.split(".").at(-1) ?? "<root>") };
    }
    if (candidate === null || typeof candidate !== "object") return { ok: true };
    if (Array.isArray(candidate)) {
      for (const [index, child] of candidate.entries()) {
        const result = visit(child, `${path}[${index}]`);
        if (!result.ok) return result;
      }
      return { ok: true };
    }
    for (const [key, child] of Object.entries(candidate)) {
      const normalized = key.replaceAll("_", "").replaceAll("-", "").toLowerCase();
      if (liveStateKeys.has(normalized)) return { ok: false, error: liveStateError(path, key) };
      const result = visit(child, `${path}.${key}`);
      if (!result.ok) return result;
    }
    return { ok: true };
  };
  return visit(value, "$");
}

// src/snapshot.ts
function terminalSnapshot(terminal) {
  return terminal.snapshotAfter;
}
function isSnapshotRef(value) {
  return typeof value === "object" && value !== null && Number.isSafeInteger(Reflect.get(value, "revision")) && Reflect.get(value, "revision") >= 0 && typeof Reflect.get(value, "digest") === "string" && Reflect.get(value, "digest").length > 0;
}

// src/transport.ts
var CarrierTransportError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(error) {
    super(error.code);
    this.name = "CarrierTransportError";
    this.code = error.code;
    if (error.expected !== void 0) this.expected = error.expected;
    if (error.hint !== void 0) this.hint = error.hint;
    if (error.detail !== void 0) this.detail = error.detail;
  }
};
function createAuthenticatedCarrierTransport(options) {
  const url = new URL(options.endpoint);
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost"].includes(url.hostname))
    throw new TypeError("carrier transport endpoint must be loopback HTTP");
  if (options.bearerToken.length < 8) throw new TypeError("carrier bearer token is too short");
  let connected = true;
  async function request(path, payload) {
    if (!connected)
      throw new CarrierTransportError({
        code: "carrier-exited",
        expected: "a connected carrier transport",
        hint: "Request a fresh visible offer after provider exit."
      });
    let response;
    try {
      response = await fetch(`${options.endpoint}${path}`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${options.bearerToken}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    } catch (cause) {
      throw new CarrierTransportError({
        code: "carrier-provider-exit",
        expected: "the carrier provider to remain reachable",
        hint: "Offer a fresh carrier; do not fallback after started.",
        detail: { cause: cause instanceof Error ? cause.message : String(cause) }
      });
    }
    const value = await response.json().catch(() => ({}));
    if (!response.ok || typeof value !== "object" || value === null || !("ok" in value) || value.ok !== true) {
      const error = typeof value === "object" && value !== null && "error" in value && typeof value.error === "object" && value.error !== null ? value.error : {
        code: "carrier-provider-exit",
        expected: "a successful carrier response",
        hint: "Offer a fresh carrier and retry from a serialized snapshot."
      };
      const normalized = {
        code: typeof error.code === "string" ? error.code : "carrier-provider-exit",
        ...typeof error.expected === "string" ? { expected: error.expected } : {},
        ...typeof error.hint === "string" ? { hint: error.hint } : {},
        ...typeof error.detail === "object" && error.detail !== null ? { detail: error.detail } : {}
      };
      throw new CarrierTransportError(normalized);
    }
    return value;
  }
  return {
    endpoint: options.endpoint,
    get connected() {
      return connected;
    },
    lease: (payload) => request("/lease", payload),
    started: (payload) => request("/start", payload),
    execute: (payload) => request("/execute", payload),
    exit: (payload) => request("/exit", payload),
    close() {
      connected = false;
    }
  };
}
function createLoopbackTransport(endpoint) {
  const url = new URL(endpoint);
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost"].includes(url.hostname)) {
    throw new TypeError("carrier transport endpoint must be loopback HTTP");
  }
  let connected = true;
  return {
    endpoint,
    get connected() {
      return connected;
    },
    send(payload) {
      if (!connected || !validateRealmBootstrapPayload(payload).ok) return false;
      return true;
    },
    close() {
      connected = false;
    }
  };
}
function createAuthenticatedLoopbackTransport(options) {
  const url = new URL(options.endpoint);
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost"].includes(url.hostname)) {
    throw new TypeError("service transport endpoint must be loopback HTTP");
  }
  if (options.bearerToken.length < 8) throw new TypeError("service bearer token is too short");
  let connected = true;
  return {
    endpoint: options.endpoint,
    get connected() {
      return connected;
    },
    async request(request, bearerToken, requestOptions = {}) {
      if (!connected) throw new Error("service transport is disconnected");
      if (bearerToken !== options.bearerToken) throw new Error("service bearer token rejected");
      if (!validateRealmBootstrapPayload(request).ok) {
        throw new Error("service request is not structured-clone safe");
      }
      const response = await fetch(options.endpoint, {
        method: "POST",
        headers: {
          authorization: `Bearer ${bearerToken}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(request),
        ...requestOptions.signal === void 0 ? {} : { signal: requestOptions.signal }
      });
      const payload = await response.json();
      if (!response.ok) {
        const detail = typeof payload === "object" && payload !== null && "error" in payload ? String(payload.error) : `HTTP ${response.status}`;
        throw new Error(`service request failed: ${detail}`);
      }
      return payload;
    },
    close() {
      connected = false;
    }
  };
}

export { CarrierTransportError, ToolCommandError, artifactIncompleteError, cancellationError, capabilityUnavailableError, cleanupError, commandPath, createArtifactManifest, createArtifactRef, createAuthenticatedCarrierTransport, createAuthenticatedLoopbackTransport, createCapabilityResolver, createCapabilityToken, createCarrierStateMachine, createExclusiveTiming, createLexicalLease, createLoopbackTransport, createMigrationRecipe, createPreviewArtifactManifest, createRealmCapabilityMatrix, createServiceCapability, createSnapshotRef, createToolApi, createToolCommandRegistry, createToolRuntime, defineCommand, defineTool, defineToolCapability, disconnectedError, domainFailureError, finishToolTiming, invalidArgsError, isSerializableValue, isSnapshotRef, parseToolJsonSchema, probeMigrationTarget, snapshotStaleError, startToolTiming, terminalError, terminalSnapshot, timeoutError, toolJsonSchema, validateArtifactManifest, validateArtifactRefs, validateMigrationPayload, validatePreviewArtifactManifest, validateRealmBootstrapPayload };
