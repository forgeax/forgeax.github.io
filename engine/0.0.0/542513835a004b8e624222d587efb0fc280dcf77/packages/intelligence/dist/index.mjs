import { ok, err } from '../../types/dist/index.mjs';

// src/errors.ts
var policy = {
  "intelligence-invalid-request": {
    expected: "activity input must be a non-empty string within the configured bound",
    hint: "validate and bound player input before submitting the activity"
  },
  "intelligence-session-provider-mismatch": {
    expected: "a session reference must be resumed by the provider that created it",
    hint: "discard the incompatible session or select its original provider"
  },
  "intelligence-capacity-exceeded": {
    expected: "active intelligence work must remain within the configured concurrency bound",
    hint: "wait for an activity to finish or raise the explicit provider capacity"
  },
  "intelligence-activity-not-found": {
    expected: "the activity must still be running when cancellation is requested",
    hint: "ignore an already observed terminal activity or retain the correct ActivityId"
  },
  "intelligence-provider-failed": {
    expected: "the selected provider must complete or report a structured failure",
    hint: "inspect detail.cause and provider configuration, then retry or select another provider"
  },
  "intelligence-output-overflow": {
    expected: "incremental and final output must remain within configured queue and text bounds",
    hint: "consume events every frame or raise the explicit bound for this application"
  },
  "intelligence-closed": {
    expected: "the intelligence service must be open for submit and cancel operations",
    hint: "create a new service after its Cordis realm or owner has been disposed"
  }
};
var INTELLIGENCE_EXPECTED = Object.fromEntries(
  Object.entries(policy).map(([code, value]) => [code, value.expected])
);
var INTELLIGENCE_ERROR_HINTS = Object.fromEntries(
  Object.entries(policy).map(([code, value]) => [code, value.hint])
);
var IntelligenceErrorClass = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    const selected = policy[args.code];
    super(
      `[IntelligenceError ${args.code}] expected: ${selected.expected}; hint: ${selected.hint}`
    );
    this.name = "IntelligenceError";
    this.code = args.code;
    this.expected = selected.expected;
    this.hint = selected.hint;
    this.detail = args.detail;
  }
};
var IntelligenceError = IntelligenceErrorClass;
function intelligenceFailure(error) {
  if (error.code === "intelligence-provider-failed") {
    return {
      code: error.code,
      expected: error.expected,
      hint: error.hint,
      detail: {
        providerId: error.detail.providerId,
        cause: error.detail.cause instanceof Error ? error.detail.cause.message : String(error.detail.cause)
      }
    };
  }
  return {
    code: error.code,
    expected: error.expected,
    hint: error.hint,
    detail: error.detail
  };
}
function providerError(providerId, cause) {
  return new IntelligenceError({
    code: "intelligence-provider-failed",
    detail: { providerId, cause }
  });
}

// src/plugin.ts
function intelligencePlugin(service) {
  return {
    name: "intelligence",
    provide: "intelligence",
    apply(ctx) {
      ctx.provide("intelligence", service);
      ctx.effect(() => () => service.close(), "intelligence/service");
    }
  };
}

// src/types.ts
var DEFAULT_INTELLIGENCE_LIMITS = {
  maxInputChars: 16384,
  maxOutputChars: 65536,
  maxConcurrentActivities: 8,
  maxPendingEventsPerActivity: 256,
  maxPollEvents: 64
};
function activityId(value) {
  return value;
}

// src/runtime.ts
var fallbackIdentity = 0;
function nextIdentity(prefix) {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid !== void 0) return `${prefix}-${uuid}`;
  fallbackIdentity += 1;
  return `${prefix}-${Date.now().toString(36)}-${fallbackIdentity.toString(36)}`;
}
function resolveIntelligenceLimits(overrides) {
  const limits = { ...DEFAULT_INTELLIGENCE_LIMITS, ...overrides };
  for (const [name, value] of Object.entries(limits)) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new RangeError(`${name} must be a positive integer`);
    }
  }
  if (limits.maxPendingEventsPerActivity < 2) {
    throw new RangeError(
      "maxPendingEventsPerActivity must reserve at least one data and terminal event"
    );
  }
  return limits;
}
var IntelligenceRuntime = class {
  constructor(provider, options = {}) {
    this.provider = provider;
    this.providerId = provider.id;
    this.limits = resolveIntelligenceLimits(options.limits);
    this.createActivityId = options.createActivityId ?? (() => activityId(nextIdentity("activity")));
    this.createSessionId = options.createSessionId ?? (() => nextIdentity("session"));
  }
  provider;
  providerId;
  limits;
  records = /* @__PURE__ */ new Map();
  createActivityId;
  createSessionId;
  closed = false;
  closeTask;
  submit(request) {
    const validated = this.validateRequest(request);
    if (!validated.ok) return validated;
    const ref = {
      id: this.createActivityId(),
      session: request.session ?? { providerId: this.providerId, id: this.createSessionId() }
    };
    const accepted = this.accept({ ...ref, input: request.input });
    return accepted.ok ? ok(ref) : accepted;
  }
  /** Accept an already identified request from a realm transport. */
  accept(submission) {
    const validated = this.validateRequest({
      input: submission.input,
      session: submission.session
    });
    if (!validated.ok) return validated;
    if (this.records.has(submission.id)) {
      return err(
        providerError(this.providerId, `duplicate activity identity: ${String(submission.id)}`)
      );
    }
    if (this.runningCount >= this.limits.maxConcurrentActivities) {
      return err(
        new IntelligenceError({
          code: "intelligence-capacity-exceeded",
          detail: { limit: this.limits.maxConcurrentActivities }
        })
      );
    }
    const record = {
      ref: { id: submission.id, session: submission.session },
      events: [],
      sequence: 0,
      outputChars: 0,
      terminal: false
    };
    this.records.set(submission.id, record);
    let started;
    try {
      started = this.provider.start(submission, this.createSink(record));
    } catch (cause) {
      this.records.delete(submission.id);
      return err(providerError(this.providerId, cause));
    }
    if (!started.ok) {
      this.records.delete(submission.id);
      return started;
    }
    return ok(void 0);
  }
  poll(maxEvents = this.limits.maxPollEvents) {
    if (!Number.isInteger(maxEvents) || maxEvents <= 0) return [];
    const bounded = Math.min(maxEvents, this.limits.maxPollEvents);
    const events = [];
    for (const [id, record] of this.records) {
      while (record.events.length > 0 && events.length < bounded) {
        const event = record.events.shift();
        if (event !== void 0) events.push(event);
      }
      if (record.terminal && record.events.length === 0) this.records.delete(id);
      if (events.length === bounded) break;
    }
    return events;
  }
  cancel(activity) {
    if (this.closed) return err(this.closedError());
    const record = this.records.get(activity);
    if (record === void 0 || record.terminal) {
      return err(
        new IntelligenceError({
          code: "intelligence-activity-not-found",
          detail: { activityId: activity }
        })
      );
    }
    try {
      return this.provider.cancel(activity);
    } catch (cause) {
      return err(providerError(this.providerId, cause));
    }
  }
  close() {
    this.closeTask ??= this.performClose();
    return this.closeTask;
  }
  async performClose() {
    this.closed = true;
    try {
      await this.provider.close();
    } catch {
    }
    this.records.clear();
  }
  get runningCount() {
    let count = 0;
    for (const record of this.records.values()) if (!record.terminal) count += 1;
    return count;
  }
  validateRequest(request) {
    if (this.closed) return err(this.closedError());
    if (request.input.length === 0 || request.input.length > this.limits.maxInputChars) {
      return err(
        new IntelligenceError({
          code: "intelligence-invalid-request",
          detail: {
            field: "input",
            reason: request.input.length === 0 ? "input is empty" : `input exceeds ${this.limits.maxInputChars} characters`
          }
        })
      );
    }
    if (request.session !== void 0 && request.session.providerId !== this.providerId) {
      return err(
        new IntelligenceError({
          code: "intelligence-session-provider-mismatch",
          detail: {
            expectedProviderId: this.providerId,
            receivedProviderId: request.session.providerId
          }
        })
      );
    }
    return ok(void 0);
  }
  createSink(record) {
    return {
      text: (text) => {
        if (this.closed || record.terminal || text.length === 0) return;
        if (record.outputChars + text.length > this.limits.maxOutputChars) {
          this.overflow(record, "output-chars", this.limits.maxOutputChars);
          return;
        }
        if (record.events.length >= this.limits.maxPendingEventsPerActivity - 1) {
          this.overflow(record, "pending-events", this.limits.maxPendingEventsPerActivity);
          return;
        }
        record.outputChars += text.length;
        this.push(record, { type: "text-delta", text });
      },
      complete: (output) => {
        if (this.closed || record.terminal) return;
        if (output.length > this.limits.maxOutputChars) {
          this.overflow(record, "output-chars", this.limits.maxOutputChars);
          return;
        }
        record.terminal = true;
        this.push(record, { type: "completed", session: record.ref.session, output });
      },
      fail: (cause) => {
        if (this.closed || record.terminal) return;
        record.terminal = true;
        const error = providerError(this.providerId, cause);
        this.push(record, { type: "failed", error: intelligenceFailure(error) });
      },
      cancelled: () => {
        if (this.closed || record.terminal) return;
        record.terminal = true;
        this.push(record, { type: "cancelled" });
      }
    };
  }
  overflow(record, bound, limit) {
    if (record.terminal) return;
    record.terminal = true;
    const error = new IntelligenceError({
      code: "intelligence-output-overflow",
      detail: { activityId: record.ref.id, bound, limit }
    });
    if (record.events.length >= this.limits.maxPendingEventsPerActivity) record.events.pop();
    this.push(record, { type: "failed", error: intelligenceFailure(error) });
    try {
      this.provider.cancel(record.ref.id);
    } catch {
    }
  }
  push(record, event) {
    record.sequence += 1;
    record.events.push({
      ...event,
      activityId: record.ref.id,
      sequence: record.sequence
    });
  }
  closedError() {
    return new IntelligenceError({ code: "intelligence-closed", detail: {} });
  }
};
function createIntelligenceRuntime(provider, options = {}) {
  return new IntelligenceRuntime(provider, options);
}
function bindIntelligencePort(port, runtime) {
  let closed = false;
  let closeTask;
  const listener = (event) => {
    if (closed) return;
    const message = event.data;
    if (message.kind === "intelligence-submit") {
      const accepted = runtime.accept(message.submission);
      if (!accepted.ok) {
        const failure = importFailure(accepted.error);
        port.postMessage({
          kind: "intelligence-rejected",
          activityId: message.submission.id,
          error: failure
        });
      }
      return;
    }
    if (message.kind === "intelligence-poll") {
      const events = runtime.poll(message.maxEvents);
      try {
        port.postMessage({ kind: "intelligence-events", events });
      } catch {
        void close().catch(() => void 0);
      }
      return;
    }
    if (message.kind === "intelligence-cancel") {
      runtime.cancel(message.activityId);
      return;
    }
    if (message.kind === "intelligence-close") void close();
  };
  const close = () => {
    if (closeTask !== void 0) return closeTask;
    closed = true;
    port.removeEventListener("message", listener);
    closeTask = (async () => {
      await runtime.close();
      try {
        port.postMessage({ kind: "intelligence-closed" });
      } catch {
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
      port.close();
    })();
    return closeTask;
  };
  port.addEventListener("message", listener);
  port.start?.();
  return { close };
}
function importFailure(error) {
  if (error.code === "intelligence-provider-failed") {
    return {
      code: error.code,
      expected: error.expected,
      hint: error.hint,
      detail: {
        providerId: error.detail.providerId,
        cause: error.detail.cause instanceof Error ? error.detail.cause.message : String(error.detail.cause)
      }
    };
  }
  return {
    code: error.code,
    expected: error.expected,
    hint: error.hint,
    detail: error.detail
  };
}
var portIdentity = 0;
function nextPortIdentity(prefix) {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid !== void 0) return `${prefix}-${uuid}`;
  portIdentity += 1;
  return `${prefix}-${portIdentity}`;
}
var IntelligencePortClient = class {
  constructor(providerId, port, options = {}) {
    this.providerId = providerId;
    this.port = port;
    this.limits = resolveIntelligenceLimits(options.limits);
    this.createActivityId = options.createActivityId ?? (() => activityId(nextPortIdentity("activity")));
    this.createSessionId = options.createSessionId ?? (() => nextPortIdentity("session"));
    this.listener = (event) => {
      const message = event.data;
      if (this.closed && message.kind !== "intelligence-closed") return;
      if (message.kind === "intelligence-events") {
        this.pollPending = false;
        for (const item of message.events) {
          this.received.push(item);
          if (item.type !== "text-delta") this.active.delete(item.activityId);
        }
      } else if (message.kind === "intelligence-rejected") {
        this.active.delete(message.activityId);
        this.rejected.set(message.activityId, message);
      } else if (message.kind === "intelligence-closed") {
        this.markClosed();
        this.releaseTransport();
        this.closeResolve?.();
        this.closeResolve = void 0;
        this.closeTask ??= Promise.resolve();
      }
    };
    port.addEventListener("message", this.listener);
    port.start?.();
  }
  providerId;
  port;
  limits;
  received = [];
  active = /* @__PURE__ */ new Set();
  rejected = /* @__PURE__ */ new Map();
  createActivityId;
  createSessionId;
  listener;
  closed = false;
  pollPending = false;
  closeTask;
  closeResolve;
  transportReleased = false;
  markClosed() {
    this.closed = true;
    this.received.length = 0;
    this.active.clear();
    this.rejected.clear();
    this.pollPending = false;
  }
  releaseTransport() {
    if (this.transportReleased) return;
    this.transportReleased = true;
    this.port.removeEventListener("message", this.listener);
    this.port.close();
  }
  submit(request) {
    if (this.closed) return err(new IntelligenceError({ code: "intelligence-closed", detail: {} }));
    if (request.input.length === 0 || request.input.length > this.limits.maxInputChars) {
      return err(
        new IntelligenceError({
          code: "intelligence-invalid-request",
          detail: {
            field: "input",
            reason: request.input.length === 0 ? "input is empty" : `input exceeds ${this.limits.maxInputChars} characters`
          }
        })
      );
    }
    if (request.session !== void 0 && request.session.providerId !== this.providerId) {
      return err(
        new IntelligenceError({
          code: "intelligence-session-provider-mismatch",
          detail: {
            expectedProviderId: this.providerId,
            receivedProviderId: request.session.providerId
          }
        })
      );
    }
    if (this.active.size >= this.limits.maxConcurrentActivities) {
      return err(
        new IntelligenceError({
          code: "intelligence-capacity-exceeded",
          detail: { limit: this.limits.maxConcurrentActivities }
        })
      );
    }
    const ref = {
      id: this.createActivityId(),
      session: request.session ?? { providerId: this.providerId, id: this.createSessionId() }
    };
    this.active.add(ref.id);
    try {
      this.port.postMessage({
        kind: "intelligence-submit",
        submission: { ...ref, input: request.input }
      });
    } catch {
      this.markClosed();
      this.releaseTransport();
      return err(new IntelligenceError({ code: "intelligence-closed", detail: {} }));
    }
    return ok(ref);
  }
  poll(maxEvents = this.limits.maxPollEvents) {
    if (this.closed || !Number.isInteger(maxEvents) || maxEvents <= 0) return [];
    const count = Math.min(maxEvents, this.limits.maxPollEvents);
    const events = this.received.splice(0, count);
    for (const [id, rejection] of this.rejected) {
      if (events.length >= count) break;
      this.rejected.delete(id);
      events.push({
        type: "failed",
        activityId: id,
        sequence: 1,
        error: rejection.error
      });
    }
    if (!this.pollPending) {
      this.pollPending = true;
      try {
        this.port.postMessage({ kind: "intelligence-poll", maxEvents: count });
      } catch {
        this.markClosed();
        this.releaseTransport();
        return [];
      }
    }
    return events;
  }
  cancel(id) {
    if (this.closed) return err(new IntelligenceError({ code: "intelligence-closed", detail: {} }));
    if (!this.active.has(id)) {
      return err(
        new IntelligenceError({
          code: "intelligence-activity-not-found",
          detail: { activityId: id }
        })
      );
    }
    try {
      this.port.postMessage({ kind: "intelligence-cancel", activityId: id });
    } catch {
      this.markClosed();
      this.releaseTransport();
      return err(new IntelligenceError({ code: "intelligence-closed", detail: {} }));
    }
    return ok(void 0);
  }
  close() {
    if (this.closeTask !== void 0) return this.closeTask;
    if (this.closed) {
      this.closeTask = Promise.resolve();
      return this.closeTask;
    }
    this.markClosed();
    this.closeTask = new Promise((resolve) => {
      this.closeResolve = resolve;
      try {
        this.port.postMessage({ kind: "intelligence-close" });
      } catch {
        this.releaseTransport();
        this.closeResolve = void 0;
        resolve();
      }
    });
    return this.closeTask;
  }
};
function createIntelligencePortClient(providerId, port, options = {}) {
  return new IntelligencePortClient(providerId, port, options);
}

export { DEFAULT_INTELLIGENCE_LIMITS, INTELLIGENCE_ERROR_HINTS, INTELLIGENCE_EXPECTED, IntelligenceError, IntelligencePortClient, IntelligenceRuntime, activityId, bindIntelligencePort, createIntelligencePortClient, createIntelligenceRuntime, intelligenceFailure, intelligencePlugin, providerError };
