// src/protocol.ts
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

export { HOST_ACTIVATION_REPORT_SERVICE, HOST_ASSEMBLY_CHANGED_TOPIC, HOST_ASSEMBLY_SERVICE, attachHostWebSocketServer, connectHostWebSocket, createHostTransport, createHostWebSocketClient };
