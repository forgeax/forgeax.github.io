import { EndpointError, ENDPOINT_ERROR_HINTS, ENDPOINT_EXPECTED } from '../../net/dist/index.mjs';
import { ok, err } from '../../types/dist/index.mjs';

// src/websocket-client-core.ts

// src/event-queue.ts
var DEFAULT_MAX_QUEUED_EVENTS = 1024;
var BoundedEventQueue = class {
  constructor(maxQueuedEvents) {
    this.maxQueuedEvents = maxQueuedEvents;
    if (!Number.isInteger(maxQueuedEvents) || maxQueuedEvents < 1) {
      throw new RangeError("maxQueuedEvents must be a positive integer");
    }
  }
  maxQueuedEvents;
  #events = [];
  #closed = false;
  #disconnectReason;
  get closed() {
    return this.#closed;
  }
  get disconnectReason() {
    return this.#disconnectReason;
  }
  enqueue(event) {
    if (this.#closed) return false;
    if (this.#events.length === this.maxQueuedEvents) {
      this.close(`event queue overflow (maxQueuedEvents=${this.maxQueuedEvents})`);
      return false;
    }
    this.#events.push(event);
    return true;
  }
  close(reason) {
    if (this.#closed) return;
    this.#closed = true;
    this.#disconnectReason = reason;
  }
  drain() {
    return this.#events.splice(0);
  }
};

// src/websocket-client-core.ts
var CLIENT_PEER_ID = 1;
function createWebSocketClientEndpoint(WebSocket2, options) {
  return new Promise((resolve) => {
    const clientPeerId = options.peerId ?? CLIENT_PEER_ID;
    const signal = options.signal ?? new AbortController().signal;
    if (signal.aborted) {
      resolve(connectionFailed(options.url, "WebSocket connection aborted."));
      return;
    }
    let queue;
    try {
      queue = new BoundedEventQueue(options.maxQueuedEvents ?? DEFAULT_MAX_QUEUED_EVENTS);
    } catch (cause) {
      resolve(connectionFailed(options.url, cause));
      return;
    }
    let socket;
    try {
      socket = new WebSocket2(options.url);
      socket.binaryType = "arraybuffer";
    } catch (cause) {
      resolve(connectionFailed(options.url, cause));
      return;
    }
    const terminalEvents = [];
    let opened = false;
    let settled = false;
    let closed = false;
    let locallyClosed = false;
    let messageTail = Promise.resolve();
    const removeAbortListener = () => {
      signal.removeEventListener("abort", abortPendingConnection);
    };
    const abortPendingConnection = () => {
      if (opened || settled) return;
      settled = true;
      try {
        socket.close();
      } catch {
      }
      removeAbortListener();
      resolve(connectionFailed(options.url, "WebSocket connection aborted."));
    };
    signal.addEventListener("abort", abortPendingConnection, { once: true });
    if (signal.aborted) {
      abortPendingConnection();
      return;
    }
    const disconnect = (reason) => {
      if (closed) return;
      closed = true;
      queue.close(reason);
      terminalEvents.push({ kind: "peer-disconnected", peerId: clientPeerId });
    };
    const endpoint = {
      poll: () => [...queue.drain(), ...terminalEvents.splice(0)],
      send: (peerId, data) => {
        if (closed) return locallyClosed ? alreadyClosed() : connectionClosed(peerId);
        if (peerId !== clientPeerId)
          return err(
            new EndpointError({
              code: "peer-not-found",
              expected: ENDPOINT_EXPECTED["peer-not-found"],
              hint: ENDPOINT_ERROR_HINTS["peer-not-found"],
              detail: { peerId }
            })
          );
        if (socket.readyState !== socket.OPEN)
          return err(
            new EndpointError({
              code: "connection-closed",
              expected: ENDPOINT_EXPECTED["connection-closed"],
              hint: ENDPOINT_ERROR_HINTS["connection-closed"],
              detail: { peerId }
            })
          );
        try {
          socket.send(data);
          return ok(void 0);
        } catch (cause) {
          return err(
            new EndpointError({
              code: "send-failed",
              expected: ENDPOINT_EXPECTED["send-failed"],
              hint: ENDPOINT_ERROR_HINTS["send-failed"],
              detail: { peerId, cause: normalizeCause(cause) }
            })
          );
        }
      },
      close: () => {
        if (closed)
          return err(
            new EndpointError({
              code: "already-closed",
              expected: ENDPOINT_EXPECTED["already-closed"],
              hint: ENDPOINT_ERROR_HINTS["already-closed"],
              detail: { cause: "The WebSocket endpoint is already closed." }
            })
          );
        locallyClosed = true;
        disconnect("Endpoint close requested.");
        socket.close();
        return ok(void 0);
      }
    };
    socket.onopen = () => {
      if (settled) return;
      removeAbortListener();
      opened = true;
      settled = true;
      queue.enqueue({ kind: "peer-connected", peerId: clientPeerId });
      resolve(ok(endpoint));
    };
    socket.onmessage = ({ data }) => {
      messageTail = messageTail.then(async () => {
        const bytes = await options.toBytes(data);
        if (!bytes || closed) return;
        if (!queue.enqueue({ kind: "message", peerId: clientPeerId, data: bytes })) {
          socket.close();
        }
      }).catch(() => void 0);
    };
    socket.onerror = (cause) => {
      if (opened) disconnect(`WebSocket error: ${normalizeCause(cause)}`);
      else if (!settled) {
        settled = true;
        removeAbortListener();
        resolve(connectionFailed(options.url, cause));
      }
    };
    socket.onclose = (cause) => {
      if (!opened && !settled) {
        settled = true;
        removeAbortListener();
        resolve(connectionFailed(options.url, cause));
        return;
      }
      disconnect(`WebSocket closed: ${normalizeCause(cause)}`);
    };
  });
}
function connectionFailed(address, cause) {
  return err(
    new EndpointError({
      code: "connection-failed",
      expected: ENDPOINT_EXPECTED["connection-failed"],
      hint: ENDPOINT_ERROR_HINTS["connection-failed"],
      detail: { address, cause: normalizeCause(cause) }
    })
  );
}
function alreadyClosed() {
  return err(
    new EndpointError({
      code: "already-closed",
      expected: ENDPOINT_EXPECTED["already-closed"],
      hint: ENDPOINT_ERROR_HINTS["already-closed"],
      detail: { cause: "The WebSocket endpoint is closed." }
    })
  );
}
function connectionClosed(peerId) {
  return err(
    new EndpointError({
      code: "connection-closed",
      expected: ENDPOINT_EXPECTED["connection-closed"],
      hint: ENDPOINT_ERROR_HINTS["connection-closed"],
      detail: { peerId }
    })
  );
}
function normalizeCause(cause) {
  if (cause instanceof Error) return cause.message;
  if (typeof cause === "string") return cause;
  return "WebSocket operation failed without a platform error message.";
}

// src/websocket-connector.ts
function createWebSocketConnectorAdapter(runtime, url, options = {}) {
  let nextPeerId = 1;
  return {
    connect: (signal) => {
      const peerId = nextPeerId++;
      return createWebSocketClientEndpoint(runtime.WebSocket, {
        url,
        maxQueuedEvents: options.maxQueuedEvents,
        peerId,
        signal,
        toBytes: runtime.toBytes
      });
    }
  };
}

// src/browser.ts
function createWebSocketConnector(url, options = {}) {
  return createWebSocketConnectorAdapter(
    { WebSocket, toBytes },
    url,
    options
  );
}
function connectWebSocketClientEndpoint(url, options = {}) {
  return createWebSocketConnector(url, options).connect(new AbortController().signal);
}
function toBytes(data) {
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    return data.arrayBuffer().then((buffer) => new Uint8Array(buffer));
  }
  return void 0;
}

export { connectWebSocketClientEndpoint, createWebSocketConnector };
