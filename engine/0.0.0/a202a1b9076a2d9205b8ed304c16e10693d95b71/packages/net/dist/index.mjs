import { err, ok } from '../../types/dist/index.mjs';
import { validateProfileComponents, projectComponentData, classifyEntityField } from '../../ecs/dist/externalization/index.mjs';
import { componentSchema } from '../../ecs/dist/internal.mjs';
import { Update, FixedUpdate } from '../../ecs/dist/index.mjs';

// src/endpoint/errors.ts
var EndpointErrorClass = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    let suffix = "";
    if (args.code === "peer-not-found") {
      const d = args.detail;
      suffix = ` (peerId=${d.peerId})`;
    } else if (args.code === "connection-closed") {
      const d = args.detail;
      suffix = ` (peerId=${d.peerId})`;
    } else if (args.code === "send-failed") {
      const d = args.detail;
      suffix = ` (peerId=${d.peerId}, cause=${d.cause})`;
    } else if (args.code === "already-closed") {
      const d = args.detail;
      suffix = ` (cause=${d.cause})`;
    } else if (args.code === "connection-failed") {
      const d = args.detail;
      suffix = ` (address=${d.address}, cause=${d.cause})`;
    }
    super(`[EndpointError ${args.code}] expected: ${args.expected}; hint: ${args.hint}${suffix}`);
    this.name = "EndpointError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    this.detail = args.detail;
  }
};
var EndpointError = EndpointErrorClass;
var endpointErrorPolicy = {
  "peer-not-found": {
    expected: "the target peer must exist in the current connection set",
    hint: "verify the PeerId is from a connect event; check that the peer has not disconnected"
  },
  "connection-closed": {
    expected: "the peer connection must be alive for the operation",
    hint: "the peer disconnected; poll for a disconnect event and handle the lifecycle"
  },
  "send-failed": {
    expected: "message bytes must be delivered to the target peer or the connection must fail",
    hint: "the memory connection is broken; the peer may have disconnected or the buffer is full"
  },
  "already-closed": {
    expected: "the endpoint must be open for any operation",
    hint: "the endpoint is closed; create a new endpoint pair for further communication"
  },
  "connection-failed": {
    expected: "the endpoint factory must successfully establish a connection or bind to the listen address",
    hint: "the initial connection or bind failed; verify the address is reachable and the port is not in use, then retry"
  }
};
var ENDPOINT_EXPECTED = Object.fromEntries(
  Object.entries(endpointErrorPolicy).map(([code, policy]) => [code, policy.expected])
);
var ENDPOINT_ERROR_HINTS = Object.fromEntries(
  Object.entries(endpointErrorPolicy).map(([code, policy]) => [code, policy.hint])
);
function isEndpointError(err9) {
  return err9 instanceof EndpointErrorClass;
}
var MemoryEndpoint = class {
  _peerId;
  _remote = null;
  _closed = false;
  _remoteConnected = false;
  _incoming = [];
  _delayed = [];
  _state = { delayNext: false, duplicateNext: false, malformNext: false };
  constructor(peerId) {
    this._peerId = peerId;
  }
  poll() {
    if (this._closed) return [];
    const events = this._incoming.splice(0);
    this._incoming = this._delayed.splice(0);
    return events;
  }
  send(peerId, data) {
    if (this._closed) {
      return err(
        new EndpointError({
          code: "already-closed",
          expected: ENDPOINT_EXPECTED["already-closed"],
          hint: ENDPOINT_ERROR_HINTS["already-closed"],
          detail: { cause: "endpoint is closed" }
        })
      );
    }
    if (!this._remote || this._remote._peerId !== peerId) {
      return err(
        new EndpointError({
          code: "peer-not-found",
          expected: ENDPOINT_EXPECTED["peer-not-found"],
          hint: ENDPOINT_ERROR_HINTS["peer-not-found"],
          detail: { peerId }
        })
      );
    }
    if (!this._remoteConnected) {
      return err(
        new EndpointError({
          code: "connection-closed",
          expected: ENDPOINT_EXPECTED["connection-closed"],
          hint: ENDPOINT_ERROR_HINTS["connection-closed"],
          detail: { peerId }
        })
      );
    }
    const deliver = (bytes) => {
      if (this._state.delayNext) {
        this._remote?._delayed.push({ kind: "message", peerId: this._peerId, data: bytes });
        this._state.delayNext = false;
      } else {
        this._remote?._incoming.push({ kind: "message", peerId: this._peerId, data: bytes });
      }
    };
    if (this._state.malformNext) {
      const corrupted = new Uint8Array(data);
      if (corrupted.length > 0) {
        const firstByte = corrupted[0];
        if (firstByte !== void 0) corrupted[0] = firstByte ^ 255;
      }
      deliver(corrupted);
      this._state.malformNext = false;
    } else {
      deliver(data);
      if (this._state.duplicateNext) {
        this._state.duplicateNext = false;
        if (this._state.delayNext) {
          this._remote?._delayed.push({ kind: "message", peerId: this._peerId, data });
          this._state.delayNext = false;
        } else {
          this._remote?._incoming.push({ kind: "message", peerId: this._peerId, data });
        }
      }
    }
    return ok(void 0);
  }
  close() {
    if (this._closed) {
      return err(
        new EndpointError({
          code: "already-closed",
          expected: ENDPOINT_EXPECTED["already-closed"],
          hint: ENDPOINT_ERROR_HINTS["already-closed"],
          detail: { cause: "endpoint is already closed" }
        })
      );
    }
    this._closed = true;
    this._remoteConnected = false;
    if (this._remote && !this._remote._closed) {
      this._remote._remoteConnected = false;
      this._remote._incoming.push({ kind: "peer-disconnected", peerId: this._peerId });
    }
    return ok(void 0);
  }
  _forceDisconnect() {
    if (this._remote && !this._remote._closed) {
      this._remote._remoteConnected = false;
      this._remote._incoming.push({ kind: "peer-disconnected", peerId: this._peerId });
    }
    this._remoteConnected = false;
  }
};
function createMemoryEndpointPair() {
  const epA = new MemoryEndpoint(1);
  const epB = new MemoryEndpoint(2);
  epA._remote = epB;
  epB._remote = epA;
  epA._remoteConnected = true;
  epB._remoteConnected = true;
  epA._incoming.push({ kind: "peer-connected", peerId: 2 });
  epB._incoming.push({ kind: "peer-connected", peerId: 1 });
  return [epA, epB];
}
function createMemoryEndpointPairWithController() {
  const [epA, epB] = createMemoryEndpointPair();
  const controller = {
    delayNextDelivery(_ms) {
      epA._state.delayNext = true;
    },
    duplicateNextDelivery() {
      epA._state.duplicateNext = true;
    },
    malformNextDelivery() {
      epA._state.malformNext = true;
    },
    disconnectPeer(endpoint) {
      endpoint._forceDisconnect();
    }
  };
  return { endpoints: [epA, epB], controller };
}
function createMemoryEndpointConnector(createEndpoint) {
  return {
    connect(signal) {
      if (signal.aborted)
        return Promise.resolve(
          err(
            new EndpointError({
              code: "connection-failed",
              expected: ENDPOINT_EXPECTED["connection-failed"],
              hint: ENDPOINT_ERROR_HINTS["connection-failed"],
              detail: { address: "memory", cause: "connect aborted" }
            })
          )
        );
      return Promise.resolve(ok(createEndpoint()));
    }
  };
}

// src/replication/constants.ts
var REPLICATION_PROTOCOL_VERSION = 2;
var REPLICATION_PROTOCOL_PREFIX = "FXRP2";

// src/replication/errors.ts
var NetErrorClass = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    super(`[NetError ${args.code}] expected: ${args.expected}; hint: ${args.hint}`);
    this.name = "NetError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    this.detail = args.detail;
  }
};
var NetError = NetErrorClass;

// src/replication/codec.ts
var TYPED_ARRAYS = {
  Float32Array,
  Float64Array,
  Int8Array,
  Int16Array,
  Int32Array,
  Uint8Array,
  Uint8ClampedArray,
  Uint16Array,
  Uint32Array
};
var PACKET_KINDS = [
  "session-open",
  "session-resume",
  "baseline",
  "delta",
  "ack",
  "rejection"
];
var REPLICATION_ENTITY_KINDS = [
  "upsert",
  "despawn"
];
function isPacketKind(value) {
  return PACKET_KINDS.some((kind) => kind === value);
}
function isReplicationEntityKind(value) {
  return REPLICATION_ENTITY_KINDS.some((kind) => kind === value);
}
function isSafeNonNegativeInteger(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}
function isSessionId(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}
function typedArrayName(value) {
  for (const [name, typedArrayConstructor] of Object.entries(TYPED_ARRAYS)) {
    if (value instanceof typedArrayConstructor) return name;
  }
  return void 0;
}
function canonicalize(value) {
  const name = typedArrayName(value);
  if (name !== void 0)
    return { $typedArray: name, values: Array.from(value) };
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, canonicalize(value[key])])
    );
  return value;
}
function reviveTypedArrays(value) {
  if (Array.isArray(value)) {
    const values = [];
    for (const item of value) {
      const revived2 = reviveTypedArrays(item);
      if ("reason" in revived2) return revived2;
      values.push(revived2.value);
    }
    return { value: values };
  }
  if (value === null || typeof value !== "object") return { value };
  const record = value;
  if ("$typedArray" in record) {
    if (Object.keys(record).length !== 2 || typeof record.$typedArray !== "string" || !Array.isArray(record.values))
      return { reason: "typed-array tag must contain only an allowlisted name and values array" };
    const typedArrayConstructor = TYPED_ARRAYS[record.$typedArray];
    if (typedArrayConstructor === void 0 || record.values.some((item) => typeof item !== "number"))
      return { reason: "typed-array tag contains an unsupported type or non-numeric value" };
    return { value: new typedArrayConstructor(record.values) };
  }
  const revived = {};
  for (const [key, item] of Object.entries(record)) {
    const nested = reviveTypedArrays(item);
    if ("reason" in nested) return nested;
    revived[key] = nested.value;
  }
  return { value: revived };
}
function limitError(limit, actual, maximum) {
  return new NetError({
    code: "decode-limit-exceeded",
    expected: `${limit} must not exceed ${maximum}`,
    hint: "reduce the replicated payload or configure matching declared limits",
    detail: { limit, actual, maximum }
  });
}
function invalid(reason) {
  return new NetError({
    code: "decode-invalid-payload",
    expected: `a version ${REPLICATION_PROTOCOL_VERSION} ${REPLICATION_PROTOCOL_PREFIX} packet`,
    hint: "send bytes produced by the protocol-v2 replication codec",
    detail: { reason }
  });
}
function validateEntities(entities) {
  const ids = /* @__PURE__ */ new Set();
  for (const [entityIndex, entity] of entities.entries()) {
    if (entity === null || typeof entity !== "object" || !isSafeNonNegativeInteger(entity.id) || !isReplicationEntityKind(entity.kind) || !Array.isArray(entity.components) || ids.has(entity.id))
      return `entity record ${entityIndex} has an invalid or duplicate identity`;
    ids.add(entity.id);
    for (const [componentIndex, component] of entity.components.entries()) {
      if (component === null || typeof component !== "object" || typeof component.name !== "string" || component.name.length === 0 || component.operation !== void 0 && component.operation !== "replace" && component.operation !== "remove" || component.data === null || typeof component.data !== "object" || Array.isArray(component.data) || component.operation === "remove" && Object.keys(component.data).length !== 0)
        return `component record ${entityIndex}:${componentIndex} has invalid fields`;
    }
  }
  return void 0;
}
function validatePacket(packet) {
  if (packet.version !== REPLICATION_PROTOCOL_VERSION)
    return "packet protocol version is unsupported";
  if (!isPacketKind(packet.kind)) return "packet kind is unsupported";
  if (!isSessionId(packet.sessionId)) return "sessionId must be a positive safe integer";
  if (!isSafeNonNegativeInteger(packet.epoch)) return "epoch must be a non-negative safe integer";
  if (packet.kind === "session-open" || packet.kind === "session-resume")
    return packet.sequence === 0 ? void 0 : "session control sequence must be zero";
  if (packet.kind === "ack")
    return isSafeNonNegativeInteger(packet.acknowledgedSequence) ? void 0 : "acknowledgedSequence must be a non-negative safe integer";
  if (!isSafeNonNegativeInteger(packet.sequence) || packet.sequence === 0)
    return "sequence must be a positive safe integer";
  if (packet.kind === "baseline" && packet.sequence !== 1) return "baseline sequence must be one";
  if (packet.kind === "rejection") {
    if (!isPacketKind(packet.rejectedKind) || typeof packet.reason !== "string")
      return "rejection details are invalid";
    return void 0;
  }
  if (packet.kind !== "baseline" && packet.kind !== "delta")
    return "packet kind does not carry a data payload";
  if (typeof packet.tick !== "number" || !Number.isSafeInteger(packet.tick))
    return "tick must be a safe integer";
  if (typeof packet.fingerprint !== "string") return "fingerprint must be a string";
  return validateEntities(packet.entities);
}
function validateLimits(packet, bytes, limits) {
  if (bytes !== void 0 && bytes.byteLength > limits.maxMessageBytes)
    return limitError("maxMessageBytes", bytes.byteLength, limits.maxMessageBytes);
  if (packet.entities.length > limits.maxEntities)
    return limitError("maxEntities", packet.entities.length, limits.maxEntities);
  let operations = 0;
  const visit = (value) => {
    if (typeof value === "string" && new TextEncoder().encode(value).byteLength > limits.maxStringBytes)
      return limitError(
        "maxStringBytes",
        new TextEncoder().encode(value).byteLength,
        limits.maxStringBytes
      );
    const typedArray = typedArrayName(value);
    if (typedArray !== void 0) {
      const contents = value;
      if (contents.byteLength > limits.maxBufferBytes)
        return limitError("maxBufferBytes", contents.byteLength, limits.maxBufferBytes);
      if (contents.length > limits.maxArrayElements)
        return limitError("maxArrayElements", contents.length, limits.maxArrayElements);
      return null;
    }
    if (Array.isArray(value)) {
      if (value.length > limits.maxArrayElements)
        return limitError("maxArrayElements", value.length, limits.maxArrayElements);
      for (const item of value) {
        const problem = visit(item);
        if (problem) return problem;
      }
    }
    if (value !== null && typeof value === "object" && !(value instanceof Uint8Array))
      for (const item of Object.values(value)) {
        const problem = visit(item);
        if (problem) return problem;
      }
    return null;
  };
  for (const entity of packet.entities) {
    operations += entity.components.length;
    for (const component of entity.components) {
      const problem = visit(component.data);
      if (problem) return problem;
    }
  }
  return operations > limits.maxComponentOperations ? limitError("maxComponentOperations", operations, limits.maxComponentOperations) : null;
}
function parse(bytes) {
  const text = new TextDecoder().decode(bytes);
  const separator = text.indexOf("\n");
  if (separator < 0 || text.slice(0, separator) !== REPLICATION_PROTOCOL_PREFIX)
    return { error: invalid("packet prefix does not match protocol-v2") };
  try {
    const decoded = JSON.parse(text.slice(separator + 1));
    const revived = reviveTypedArrays(decoded);
    if ("reason" in revived) return { error: invalid(revived.reason) };
    if (revived.value === null || typeof revived.value !== "object")
      return { error: invalid("packet must be an object") };
    const packet = revived.value;
    const reason = validatePacket(packet);
    if (reason !== void 0) {
      if (typeof packet.version === "number" && packet.version !== REPLICATION_PROTOCOL_VERSION)
        return {
          error: new NetError({
            code: "protocol-unsupported-version",
            expected: `protocol version ${REPLICATION_PROTOCOL_VERSION}`,
            hint: "upgrade the peer before sending replicated bytes",
            detail: {
              receivedVersion: packet.version,
              supportedVersion: REPLICATION_PROTOCOL_VERSION
            }
          })
        };
      return { error: invalid(reason) };
    }
    return { packet };
  } catch {
    return { error: invalid("payload is not valid JSON") };
  }
}
function isDataPacket(packet) {
  return packet.kind === "baseline" || packet.kind === "delta";
}
function encodeReplicationPacket(packet, limits) {
  const reason = validatePacket(packet);
  if (reason !== void 0) return err(invalid(reason));
  const body = JSON.stringify(canonicalize(packet));
  const bytes = new TextEncoder().encode(`${REPLICATION_PROTOCOL_PREFIX}
${body}`);
  const failure = isDataPacket(packet) ? validateLimits(packet, bytes, limits) : null;
  return failure ? err(failure) : ok(bytes);
}
function decodeReplicationPacket(bytes, limits) {
  if (bytes.byteLength > limits.maxMessageBytes)
    return err(limitError("maxMessageBytes", bytes.byteLength, limits.maxMessageBytes));
  const parsed = parse(bytes);
  if ("error" in parsed) return err(parsed.error);
  const failure = isDataPacket(parsed.packet) ? validateLimits(parsed.packet, bytes, limits) : null;
  return failure ? err(failure) : ok(parsed.packet);
}
var DEFAULT_REPLICATION_LIMITS = {
  maxMessageBytes: 64 * 1024,
  maxEntities: 1024,
  maxComponentOperations: 4096,
  maxStringBytes: 4096,
  maxBufferBytes: 16 * 1024,
  maxArrayElements: 1024
};
function hash(text) {
  let value = 2166136261;
  for (const char of text) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return (value >>> 0).toString(16).padStart(8, "0");
}
function immutableProfile(options, limits, fingerprint) {
  const entities = Object.freeze({
    with: Object.freeze([...options.entities.with]),
    ...options.entities.without === void 0 ? {} : { without: Object.freeze([...options.entities.without]) }
  });
  return Object.freeze({
    name: options.name,
    entities,
    components: Object.freeze([...options.components]),
    limits: Object.freeze({ ...limits }),
    fingerprint
  });
}
function defineReplication(options) {
  const portable = validateProfileComponents(options.components);
  if (!portable.valid) {
    const first = portable.errors[0];
    if (first === void 0) {
      return err(
        new NetError({
          code: "schema-invalid",
          expected: "portable replication components",
          hint: "select only components accepted by the ECS externalization kernel",
          detail: { component: "", reason: "portable validation failed without a diagnostic" }
        })
      );
    }
    return err(
      new NetError({
        code: "schema-invalid",
        expected: first.expected,
        hint: first.hint,
        detail: { component: first.component, reason: first.code }
      })
    );
  }
  const limits = { ...DEFAULT_REPLICATION_LIMITS, ...options.limits };
  const signature = JSON.stringify({
    name: options.name,
    query: {
      with: options.entities.with.map((component) => component.name),
      ...options.entities.without === void 0 ? {} : { without: options.entities.without.map((component) => component.name) }
    },
    components: options.components.map((component) => ({
      name: component.name,
      schema: componentSchema(component)
    })),
    limits
  });
  return ok(immutableProfile(options, limits, hash(signature)));
}

// src/replication/authority.ts
function stable(value) {
  return JSON.stringify(value);
}
var AuthorityCoordinator = class {
  #world;
  #profile;
  #ids = /* @__PURE__ */ new Map();
  #known = /* @__PURE__ */ new Map();
  #nextId = 1;
  #tick = 0;
  #epoch = 0;
  #sequence = 0;
  #sessionId;
  constructor(world, profile, sessionId = 1) {
    this.#world = world;
    this.#profile = profile;
    this.#sessionId = sessionId;
  }
  idFor(entity) {
    return this.#ids.get(entity) ?? 0;
  }
  publish() {
    return this.#publish(false);
  }
  publishFull() {
    return this.#publish(true);
  }
  nextPublicationEpoch(forceFull = false) {
    return forceFull && this.#tick > 0 ? this.#epoch + 1 : this.#epoch;
  }
  #publish(forceFull) {
    const candidateIds = new Map(this.#ids);
    let candidateNextId = this.#nextId;
    const current = /* @__PURE__ */ new Map();
    const query = this.#world.query(this.#profile.entities).unwrap();
    for (const row of query) {
      if (!candidateIds.has(row.entity)) candidateIds.set(row.entity, candidateNextId++);
    }
    for (const row of query) {
      const entity = row.entity;
      const components = [];
      for (const component of this.#profile.components) {
        const raw = this.#world.get(entity, component);
        if (raw.ok) {
          components.push({
            name: component.name,
            data: projectComponentData(
              component,
              raw.value,
              (reference) => candidateIds.get(reference) ?? 0
            )
          });
        }
      }
      const id = candidateIds.get(entity);
      if (id !== void 0) current.set(entity, { id, components });
    }
    const full = forceFull || this.#tick === 0;
    let nextEpoch = this.#epoch;
    let nextSequence = this.#sequence;
    if (forceFull && this.#tick > 0) {
      nextEpoch += 1;
      nextSequence = 0;
    }
    if (full && nextSequence === 0) nextSequence = 1;
    else nextSequence += 1;
    const entities = [];
    for (const [entity, entry] of current) {
      const prior = this.#known.get(entity);
      const components = full || prior === void 0 ? entry.components : [
        ...entry.components.filter(
          (component) => prior.components.get(component.name) !== stable(component.data)
        ),
        ...[...prior.components.keys()].filter((name) => !entry.components.some((component) => component.name === name)).map((name) => ({ name, operation: "remove", data: {} }))
      ];
      if (full || prior === void 0 || components.length > 0)
        entities.push({ id: entry.id, kind: "upsert", components });
    }
    if (!full)
      for (const [entity, prior] of this.#known) {
        if (!current.has(entity)) entities.push({ id: prior.id, kind: "despawn", components: [] });
      }
    const candidateKnown = /* @__PURE__ */ new Map();
    for (const [entity, entry] of current) {
      candidateKnown.set(entity, {
        id: entry.id,
        components: new Map(
          entry.components.map((component) => [component.name, stable(component.data)])
        )
      });
    }
    for (const [entity] of candidateIds) {
      if (!current.has(entity)) candidateIds.delete(entity);
    }
    const packet = full ? {
      version: REPLICATION_PROTOCOL_VERSION,
      kind: "baseline",
      sessionId: this.#sessionId,
      epoch: nextEpoch,
      sequence: nextSequence,
      fingerprint: this.#profile.fingerprint,
      tick: this.#tick + 1,
      entities
    } : {
      version: REPLICATION_PROTOCOL_VERSION,
      kind: "delta",
      sessionId: this.#sessionId,
      epoch: nextEpoch,
      sequence: nextSequence,
      fingerprint: this.#profile.fingerprint,
      tick: this.#tick + 1,
      entities
    };
    const encoded = encodeReplicationPacket(
      packet,
      this.#profile.limits ?? DEFAULT_REPLICATION_LIMITS
    );
    if (!encoded.ok) return err(encoded.error);
    this.#ids.clear();
    for (const [entity, id] of candidateIds) this.#ids.set(entity, id);
    this.#known.clear();
    for (const [entity, known] of candidateKnown) this.#known.set(entity, known);
    this.#nextId = candidateNextId;
    this.#tick = packet.tick;
    this.#epoch = nextEpoch;
    this.#sequence = nextSequence;
    return ok({ ...packet, bytes: encoded.value });
  }
};
function createAuthorityCoordinator(world, profile) {
  return new AuthorityCoordinator(world, profile);
}
function validateHandshake(local, remote) {
  if (local.fingerprint !== remote.fingerprint)
    return err(
      new NetError({
        code: "handshake-profile-mismatch",
        expected: "matching protocol, profile, and declared limits",
        hint: "use identical ordered replication components and limits on both peers",
        detail: { localFingerprint: local.fingerprint, remoteFingerprint: remote.fingerprint }
      })
    );
  return ok(void 0);
}
var ReplicaCoordinator = class {
  #world;
  #profile;
  #entities = /* @__PURE__ */ new Map();
  #lastTick = 0;
  #epoch = -1;
  #lastSequence = 0;
  #lastPacketOutcome = "accepted";
  #stopped = false;
  constructor(world, profile, _endpoint) {
    this.#world = world;
    this.#profile = profile;
  }
  entityFor(id) {
    return this.#entities.get(id);
  }
  readComponent(id, component) {
    const entity = this.#entities.get(id);
    if (entity === void 0) return void 0;
    const read = this.#world.get(entity, component);
    return read.ok ? read.value : void 0;
  }
  snapshot() {
    return [...this.#entities].map(([id, entity]) => ({
      id,
      components: this.#profile.components.filter((component) => this.#world.get(entity, component).ok).map((component) => component.name)
    })).sort((a, b) => a.id - b.id);
  }
  disconnect() {
  }
  /** Remove the last replica baseline when the authority connection closes. */
  clear() {
    for (const entity of this.#entities.values()) this.#world.despawn(entity).unwrap();
    this.#entities.clear();
  }
  get stopped() {
    return this.#stopped;
  }
  get tick() {
    return this.#lastTick;
  }
  /** Report the last accepted, duplicate, or stale-epoch packet decision. */
  get lastPacketOutcome() {
    return this.#lastPacketOutcome;
  }
  getPendingUnresolvedReferences() {
    return 0;
  }
  #entityReferences(value) {
    if (Array.isArray(value) || ArrayBuffer.isView(value)) {
      return Array.from(value);
    }
    return [];
  }
  validate(packet) {
    this.#lastPacketOutcome = "accepted";
    if (this.#stopped)
      return new NetError({
        code: "apply-invariant-failed",
        expected: "an active replica coordinator",
        hint: "create a new session after a fatal apply failure",
        detail: { reason: "replication stopped" }
      });
    if (packet.fingerprint !== this.#profile.fingerprint)
      return new NetError({
        code: "schema-invalid",
        expected: "a batch for the negotiated replication profile",
        hint: "complete handshake before applying replication bytes",
        detail: { component: "", reason: "fingerprint mismatch" }
      });
    const newEpoch = packet.epoch > this.#epoch;
    if (this.#epoch < 0 && packet.kind !== "baseline")
      return new NetError({
        code: "session-illegal-transition",
        expected: "a baseline before any delta in a session epoch",
        hint: "accept a complete authoritative baseline before applying deltas",
        detail: { from: "connecting", to: packet.kind }
      });
    if (packet.epoch > this.#epoch && (packet.kind !== "baseline" || packet.sequence !== 1))
      return new NetError({
        code: "session-illegal-transition",
        expected: "a sequence-one baseline at the start of a new epoch",
        hint: "request a fresh baseline before applying the next delta",
        detail: { from: "resyncing", to: packet.kind }
      });
    if (packet.epoch < this.#epoch) return null;
    if (packet.kind === "baseline" && !newEpoch && this.#lastSequence >= 1) {
      this.#lastPacketOutcome = "duplicate";
      return null;
    }
    if (packet.kind === "delta" && packet.sequence <= this.#lastSequence) {
      this.#lastPacketOutcome = "duplicate";
      return null;
    }
    if (packet.kind === "delta" && packet.sequence !== this.#lastSequence + 1)
      return new NetError({
        code: "ordering-invalid-tick",
        expected: "the next contiguous replication sequence",
        hint: "request a fresh baseline when a sequence gap is detected",
        detail: { receivedTick: packet.sequence, lastTick: this.#lastSequence }
      });
    if (!newEpoch && packet.tick <= this.#lastTick)
      return new NetError({
        code: "ordering-invalid-tick",
        expected: "a strictly monotonic authority tick",
        hint: "discard duplicate, stale, and out-of-order batches",
        detail: { receivedTick: packet.tick, lastTick: this.#lastTick }
      });
    const batchIds = /* @__PURE__ */ new Set();
    const knownIds = newEpoch ? /* @__PURE__ */ new Set() : new Set(this.#entities.keys());
    for (const record of packet.entities) {
      if (!Number.isSafeInteger(record.id) || record.id <= 0 || batchIds.has(record.id))
        return new NetError({
          code: "identity-invalid",
          expected: "unique non-zero NetEntityId values",
          hint: "use session-issued identity values exactly once per batch",
          detail: { id: record.id, reason: "zero, invalid, or duplicate identity" }
        });
      batchIds.add(record.id);
    }
    for (const record of packet.entities) {
      if (record.kind === "despawn" && !knownIds.has(record.id))
        return new NetError({
          code: "identity-invalid",
          expected: "a known identity for despawn",
          hint: "do not reuse or despawn unknown network identities",
          detail: { id: record.id, reason: "unknown identity" }
        });
      for (const entry of record.components) {
        const component = this.#profile.components.find(
          (candidate) => candidate.name === entry.name
        );
        if (component === void 0)
          return new NetError({
            code: "schema-invalid",
            expected: "a component selected by the negotiated profile",
            hint: "send only components from the ordered replication profile",
            detail: { component: entry.name, reason: "unselected component" }
          });
        if (entry.operation === "remove") continue;
        for (const [field, value] of Object.entries(entry.data)) {
          if (!(field in componentSchema(component)))
            return new NetError({
              code: "schema-invalid",
              expected: "component fields declared by the negotiated ECS schema",
              hint: "send only fields declared by the replicated component token",
              detail: { component: entry.name, reason: `unknown field ${field}` }
            });
          const kind = classifyEntityField(component, field);
          const refs = kind?.isArray ? this.#entityReferences(value) : kind ? [value] : [];
          for (const reference of refs)
            if (reference !== null && (typeof reference !== "number" || reference === 0 || !knownIds.has(reference) && !batchIds.has(reference)))
              return new NetError({
                code: "remap-unresolved-reference",
                expected: "every entity reference to resolve in the current or same batch",
                hint: "include the referenced spawn in this batch; cross-batch pending references are unsupported",
                detail: { id: record.id, referencedId: Number(reference) }
              });
        }
      }
    }
    return null;
  }
  apply(packet) {
    const failure = this.validate(packet);
    if (failure) {
      return err(failure);
    }
    if (packet.epoch < this.#epoch) {
      this.#lastPacketOutcome = "ignored-old-epoch";
      return ok(void 0);
    }
    if (this.#lastPacketOutcome === "duplicate") return ok(void 0);
    const replacingEpoch = packet.epoch > this.#epoch;
    try {
      if (replacingEpoch) {
        for (const entity of this.#entities.values()) this.#world.despawn(entity).unwrap();
        this.#entities.clear();
      }
      for (const record of packet.entities)
        if (record.kind === "upsert" && !this.#entities.has(record.id))
          this.#entities.set(record.id, this.#world.spawn().unwrap());
      for (const record of packet.entities)
        if (record.kind === "upsert") {
          const entity = this.#entities.get(record.id);
          if (entity === void 0) throw new Error(`missing allocated entity ${record.id}`);
          for (const entry of record.components) {
            const component = this.#profile.components.find(
              (candidate) => candidate.name === entry.name
            );
            if (component === void 0) throw new Error(`missing profile component ${entry.name}`);
            if (entry.operation === "remove") {
              const removal = this.#world.removeComponent(entity, component);
              if (!removal.ok) throw removal.error;
              continue;
            }
            const data = Object.fromEntries(
              Object.entries(entry.data).map(([field, value]) => {
                const kind = classifyEntityField(component, field);
                if (kind === null) return [field, value];
                const mapped = kind.isArray ? this.#entityReferences(value).map((id) => {
                  if (id === null) return null;
                  const reference = this.#entities.get(id);
                  if (reference === void 0)
                    throw new Error(`missing entity reference ${id}`);
                  return reference;
                }) : value === null ? null : this.#entities.get(value);
                if (mapped === void 0) throw new Error(`missing entity reference ${value}`);
                return [field, mapped];
              })
            );
            const typedData = data;
            const exists = this.#world.get(entity, component);
            const write = exists.ok ? this.#world.set(entity, component, typedData) : this.#world.addComponent(entity, { component, data: typedData });
            if (!write.ok) throw write.error;
          }
        }
      for (const record of packet.entities)
        if (record.kind === "despawn") {
          const entity = this.#entities.get(record.id);
          if (entity === void 0) throw new Error(`missing despawn entity ${record.id}`);
          this.#world.despawn(entity).unwrap();
          this.#entities.delete(record.id);
        }
      this.#epoch = packet.epoch;
      this.#lastSequence = packet.sequence;
      this.#lastTick = packet.tick;
      this.#lastPacketOutcome = "accepted";
      return ok(void 0);
    } catch (cause) {
      this.#stopped = true;
      return err(
        new NetError({
          code: "apply-invariant-failed",
          expected: "ECS apply invariants to accept a validated batch",
          hint: "stop this replication session and inspect the ECS error",
          detail: { reason: cause instanceof Error ? cause.message : String(cause) }
        })
      );
    }
  }
};
function createReplicaCoordinator(world, profile, endpoint) {
  return new ReplicaCoordinator(world, profile, endpoint);
}
function applyReplicationPacket(replica, packet) {
  return replica.apply(packet);
}
function decodeAndApplyReplicationPacket(replica, bytes, limits) {
  const decoded = decodeReplicationPacket(bytes, limits);
  if (!decoded.ok) {
    return err(decoded.error);
  }
  if (decoded.value.kind !== "baseline" && decoded.value.kind !== "delta") {
    return err(
      new NetError({
        code: "decode-invalid-payload",
        expected: "a baseline or delta replication packet",
        hint: "apply only data packets through the replica coordinator",
        detail: { reason: "control packet cannot be applied as ECS data" }
      })
    );
  }
  return replica.apply(decoded.value);
}
var DEFAULT_NET_RECOVERY_POLICY = Object.freeze({
  maxSessions: 64,
  maxPendingPackets: 32,
  ackTimeoutMs: 250,
  maxPacketRetries: 3,
  maxReconnectAttempts: 5,
  reconnectDeadlineMs: 1e4,
  reconnectDelaysMs: Object.freeze([0, 100, 200, 400, 800])
});
function policyError(field, reason) {
  return new NetError({
    code: "recovery-policy-invalid",
    expected: "finite positive recovery policy bounds",
    hint: "provide positive safe integers and a finite non-negative delay sequence",
    detail: { field, reason }
  });
}
function isPositiveSafeInteger(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}
function validateNetRecoveryPolicy(policy) {
  const positiveFields = [
    "maxSessions",
    "maxPendingPackets",
    "ackTimeoutMs",
    "maxPacketRetries",
    "maxReconnectAttempts",
    "reconnectDeadlineMs"
  ];
  for (const field of positiveFields) {
    if (!isPositiveSafeInteger(policy[field]))
      return err(policyError(field, "value must be a positive safe integer"));
  }
  if (!Array.isArray(policy.reconnectDelaysMs) || policy.reconnectDelaysMs.length === 0 || policy.reconnectDelaysMs.some((delay) => !Number.isSafeInteger(delay) || delay < 0))
    return err(
      policyError("reconnectDelaysMs", "values must be a non-empty finite delay sequence")
    );
  return ok(void 0);
}
function resolveNetRecoveryPolicy(overrides = {}) {
  const policy = {
    ...DEFAULT_NET_RECOVERY_POLICY,
    ...overrides,
    reconnectDelaysMs: overrides.reconnectDelaysMs === void 0 ? DEFAULT_NET_RECOVERY_POLICY.reconnectDelaysMs : [...overrides.reconnectDelaysMs]
  };
  const valid = validateNetRecoveryPolicy(policy);
  return valid.ok ? ok(Object.freeze(policy)) : err(valid.error);
}
function createSessionId(value) {
  if (!isPositiveSafeInteger(value))
    return err(
      new NetError({
        code: "recovery-policy-invalid",
        expected: "a positive safe integer SessionId",
        hint: "use the authority-issued application session identity",
        detail: { field: "sessionId", reason: "SessionId must be a positive safe integer" }
      })
    );
  return ok(value);
}
var LEGAL_TRANSITIONS = {
  connecting: ["recovering", "resyncing", "failed", "retired"],
  resyncing: ["active", "recovering", "failed", "retired"],
  active: ["active", "recovering", "failed", "retired"],
  recovering: ["recovering", "resyncing", "failed", "retired"],
  failed: ["retired"],
  retired: ["retired"]
};
function isLegalNetSessionTransition(from, to) {
  return LEGAL_TRANSITIONS[from].includes(to);
}
function transitionNetSessionState(from, to) {
  if (from.sessionId !== to.sessionId || !isLegalNetSessionTransition(from.kind, to.kind))
    return err(
      new NetError({
        code: "session-illegal-transition",
        expected: "a legal transition for the same SessionId",
        hint: "wait for the current session state or retire the session before replacing it",
        detail: { from: from.kind, to: to.kind }
      })
    );
  return ok(to);
}
var RECOVERY_ERROR_CODES = [
  "protocol-unsupported-version",
  "session-illegal-transition",
  "recovery-policy-invalid",
  "recovery-rejected",
  "recovery-exhausted"
];

// src/session/net-session.ts
var defaultClock = {
  now: () => Date.now(),
  schedule: (delayMs, callback) => {
    const id = globalThis.setTimeout(callback, delayMs);
    return { cancel: () => globalThis.clearTimeout(id) };
  }
};
function recoveryFailure(reason) {
  return new NetError({
    code: "recovery-rejected",
    expected: "a recoverable NetSession lifecycle operation",
    hint: "inspect the current snapshot and retire the session after terminal failure",
    detail: { reason }
  });
}
function initialState(sessionId, endpoint) {
  return endpoint === void 0 ? { kind: "connecting", sessionId } : { kind: "resyncing", sessionId, epoch: 0 };
}
var NetSession = class {
  #endpoint;
  #connector;
  #clock;
  #policy;
  #sessionId;
  #peerIds = /* @__PURE__ */ new Set();
  #sessionPeers = /* @__PURE__ */ new Map();
  #announcedPeers = /* @__PURE__ */ new Set();
  #sessionAnnounced = false;
  #rawMessages = [];
  #maxRawMessages;
  #authority;
  #pendingFullPeers = /* @__PURE__ */ new Set();
  #replica;
  #state;
  #lastError;
  #epoch = 0;
  #sequence = 0;
  #acknowledgedSequence = 0;
  #reconnectAttempts = 0;
  #pendingConnect;
  #retryTimer;
  #ledger = /* @__PURE__ */ new Map();
  #deferredEvents = [];
  #deferReplicaMessages = false;
  #disposed = false;
  constructor(config) {
    this.#endpoint = config.endpoint;
    this.#connector = config.connector;
    this.#clock = config.clock ?? defaultClock;
    this.#maxRawMessages = config.maxRawMessages;
    const resolvedSessionId = this.#resolveSessionId(config.sessionId);
    this.#sessionId = resolvedSessionId.ok ? resolvedSessionId.value : 1;
    const policy = resolveNetRecoveryPolicy(config.recovery);
    this.#policy = policy.ok ? policy.value : DEFAULT_NET_RECOVERY_POLICY;
    this.#state = initialState(this.#sessionId, this.#endpoint);
    if (!resolvedSessionId.ok) this.#setFailure(resolvedSessionId.error);
    else if (!policy.ok) this.#setFailure(policy.error);
  }
  #resolveSessionId(value) {
    return createSessionId(value ?? 1);
  }
  #setState(next) {
    const transition = transitionNetSessionState(this.#state, next);
    if (transition.ok) {
      this.#state = transition.value;
      return;
    }
    this.#setFailure(transition.error);
  }
  #setFailure(failure) {
    this.#lastError = failure;
    if (this.#state.kind !== "failed" && this.#state.kind !== "retired")
      this.#setState({ kind: "failed", sessionId: this.#sessionId, error: failure });
    this.#authority = void 0;
    this.#peerIds.clear();
    this.#sessionPeers.clear();
    this.#announcedPeers.clear();
    this.#sessionAnnounced = false;
    this.#pendingFullPeers.clear();
    this.#rawMessages = [];
    this.#deferredEvents = [];
    this.#deferReplicaMessages = false;
    this.#clearRecoveryWork();
    this.#endpoint?.close();
  }
  #clearRecoveryWork() {
    this.#retryTimer?.cancel();
    this.#retryTimer = void 0;
    this.#pendingConnect?.abort();
    this.#pendingConnect = void 0;
    this.#ledger.clear();
  }
  #beginRecovery() {
    const previousEndpoint = this.#endpoint;
    this.#endpoint = void 0;
    previousEndpoint?.close();
    if (this.#state.kind === "connecting" || this.#state.kind === "active" || this.#state.kind === "resyncing")
      this.#setState({
        kind: "recovering",
        sessionId: this.#sessionId,
        epoch: this.#epoch,
        attempt: 0
      });
    this.#ledger.clear();
    this.#sequence = 0;
    this.#acknowledgedSequence = 0;
    this.#peerIds.clear();
    this.#sessionPeers.clear();
    this.#announcedPeers.clear();
    this.#sessionAnnounced = false;
    this.#pendingFullPeers.clear();
    this.#rawMessages = [];
    this.#deferredEvents = [];
    this.#deferReplicaMessages = false;
  }
  #attemptRecovery() {
    if (this.#disposed || this.#state.kind !== "recovering" || this.#pendingConnect) return;
    if (this.#reconnectAttempts >= this.#policy.maxReconnectAttempts) {
      this.#setFailure(
        new NetError({
          code: "recovery-exhausted",
          expected: "reconnect attempts within the configured finite bound",
          hint: "inspect the failure and create a new session after exhaustion",
          detail: {
            attempts: this.#reconnectAttempts,
            maxAttempts: this.#policy.maxReconnectAttempts
          }
        })
      );
      return;
    }
    this.#reconnectAttempts += 1;
    this.#setState({
      kind: "recovering",
      sessionId: this.#sessionId,
      epoch: this.#epoch,
      attempt: this.#reconnectAttempts
    });
    if (this.#connector === void 0) {
      if (this.#reconnectAttempts >= this.#policy.maxReconnectAttempts) this.#attemptRecovery();
      return;
    }
    const controller = new AbortController();
    this.#pendingConnect = { abort: () => controller.abort() };
    void this.#connector.connect(controller.signal).then(
      (result) => this.#connected(result),
      (cause) => this.#connectFailed(cause)
    );
  }
  #connected(result) {
    this.#pendingConnect = void 0;
    if (this.#disposed || this.#state.kind !== "recovering") {
      if (result.ok) result.value.close();
      return;
    }
    if (!result.ok) {
      this.#connectFailed(result.error);
      return;
    }
    this.#endpoint?.close();
    this.#endpoint = result.value;
    this.#lastError = void 0;
    this.#epoch += 1;
    this.#sequence = 0;
    this.#acknowledgedSequence = 0;
    this.#ledger.clear();
    this.#deferReplicaMessages = this.#replica !== void 0;
    this.#setState({ kind: "resyncing", sessionId: this.#sessionId, epoch: this.#epoch });
  }
  #connectFailed(cause) {
    this.#pendingConnect = void 0;
    if (this.#disposed || this.#state.kind !== "recovering") return;
    const failure = cause instanceof NetError ? cause : isEndpointError(cause) ? cause : recoveryFailure("connector attempt failed");
    if (this.#reconnectAttempts >= this.#policy.maxReconnectAttempts) {
      this.#setFailure(
        new NetError({
          code: "recovery-exhausted",
          expected: "reconnect attempts within the configured finite bound",
          hint: "inspect the endpoint failure and create a new session after exhaustion",
          detail: {
            attempts: this.#reconnectAttempts,
            maxAttempts: this.#policy.maxReconnectAttempts
          }
        })
      );
      return;
    }
    this.#lastError = failure;
    this.advanceRecovery();
  }
  #handleAck(packet) {
    if (packet.sessionId !== this.#sessionId && !this.#sessionPeers.has(packet.sessionId))
      return err(
        new NetError({
          code: "recovery-rejected",
          expected: "an ACK for the current SessionId",
          hint: "discard ACKs from another logical session",
          detail: { reason: "ACK SessionId does not match the current session" }
        })
      );
    if (packet.epoch !== this.#epoch || packet.acknowledgedSequence > this.#sequence)
      return ok(void 0);
    if (packet.acknowledgedSequence <= this.#acknowledgedSequence) return ok(void 0);
    this.#acknowledgedSequence = packet.acknowledgedSequence;
    for (const sequence of this.#ledger.keys())
      if (sequence <= packet.acknowledgedSequence) this.#ledger.delete(sequence);
    return ok(void 0);
  }
  #receiveMessage(peerId, data, errors) {
    if (this.#state.kind === "recovering" || this.#state.kind === "failed" || this.#state.kind === "retired")
      return;
    const limits = this.#replica?.limits ?? DEFAULT_REPLICATION_LIMITS;
    const decoded = decodeReplicationPacket(data, limits);
    if (!decoded.ok) {
      if (this.#replica === void 0) {
        this.#queueRawMessage(peerId, data);
        return;
      }
      errors.push(decoded.error);
      this.#setFailure(decoded.error);
      return;
    }
    if (decoded.value.kind === "session-open" || decoded.value.kind === "session-resume") {
      this.#bindSession(decoded.value.sessionId, peerId);
      return;
    }
    if (decoded.value.kind === "ack") {
      const handled = this.#handleAck(decoded.value);
      if (!handled.ok) {
        errors.push(handled.error);
        this.#setFailure(handled.error);
      }
      return;
    }
    if (decoded.value.kind !== "baseline" && decoded.value.kind !== "delta") {
      if (decoded.value.kind === "rejection") {
        const failure = recoveryFailure(
          `peer rejected ${decoded.value.rejectedKind}: ${decoded.value.reason}`
        );
        errors.push(failure);
        this.#setFailure(failure);
      }
      return;
    }
    if (this.#replica === void 0) {
      this.#queueRawMessage(peerId, data);
      return;
    }
    const applied = decodeAndApplyReplicationPacket(
      this.#replica.coordinator,
      data,
      this.#replica.limits
    );
    if (!applied.ok) {
      errors.push(applied.error);
      this.#setFailure(applied.error);
      return;
    }
    const packetOutcome = this.#replica.coordinator.lastPacketOutcome;
    if (packetOutcome === "accepted") {
      this.#epoch = decoded.value.epoch;
      this.#sequence = decoded.value.sequence;
      this.#acknowledgedSequence = decoded.value.sequence;
      this.#setState({
        kind: "active",
        sessionId: this.#sessionId,
        epoch: this.#epoch,
        sequence: this.#sequence
      });
    }
    if (packetOutcome === "accepted" || packetOutcome === "duplicate")
      this.#sendReplicationAck(peerId, decoded.value);
  }
  receiveEvents() {
    const errors = [];
    if (this.#disposed || this.#state.kind === "failed" || this.#state.kind === "retired")
      return errors;
    const events = [...this.#deferredEvents, ...this.#endpoint?.poll() ?? []];
    this.#deferredEvents = [];
    const deferMessages = this.#deferReplicaMessages;
    this.#deferReplicaMessages = false;
    for (const event of events) {
      if (event.kind === "peer-connected") {
        this.#peerIds.add(event.peerId);
        if (this.#replica !== void 0) this.#bindSession(this.#sessionId, event.peerId);
        else this.#bindSession(this.#sessionForPeer(event.peerId), event.peerId);
        this.#pendingFullPeers.add(event.peerId);
      } else if (event.kind === "peer-disconnected") {
        this.#forgetPeer(event.peerId);
        if (this.#replica !== void 0) {
          this.#replica.coordinator.clear();
          this.#beginRecovery();
          this.advanceRecovery();
        }
      } else if (deferMessages) {
        this.#deferredEvents.push(event);
      } else this.#receiveMessage(event.peerId, event.data, errors);
    }
    return errors;
  }
  drainRawMessages() {
    return this.#rawMessages.splice(0);
  }
  getPeerSnapshot() {
    const peerIds = [...this.#peerIds].sort((left, right) => left - right);
    return { peerIds, connected: peerIds.length > 0 };
  }
  getSessionSnapshot() {
    const sessionIds = [...this.#sessionPeers.keys()].sort((left, right) => left - right);
    return { sessionIds, connected: sessionIds.length > 0 };
  }
  /** Return lifecycle, epoch, sequence, ledger, and owned-resource evidence. */
  getRecoverySnapshot() {
    return {
      sessionId: this.#sessionId,
      state: this.#state,
      pendingPackets: this.#ledger.size,
      maxPendingPackets: this.#policy.maxPendingPackets,
      acknowledgedSequence: this.#acknowledgedSequence,
      reconnectAttempts: this.#reconnectAttempts,
      epoch: this.#epoch,
      sequence: this.#sequence,
      ...this.#lastError === void 0 ? {} : { lastError: this.#lastError },
      ownedResources: {
        pendingConnects: this.#pendingConnect === void 0 ? 0 : 1,
        timers: this.#retryTimer === void 0 ? 0 : 1,
        ledgers: this.#ledger.size === 0 ? 0 : 1,
        callbacks: 0
      }
    };
  }
  getResourceSnapshot() {
    return this.getRecoverySnapshot().ownedResources;
  }
  recover() {
    if (this.#state.kind === "retired" || this.#state.kind === "failed")
      return { kind: "retired", sessionId: this.#sessionId };
    if (this.#state.kind === "recovering")
      return { kind: "already-recovering", sessionId: this.#sessionId };
    this.#beginRecovery();
    return { kind: "started", sessionId: this.#sessionId };
  }
  advanceRecovery() {
    if (this.#state.kind !== "recovering") return;
    const delay = this.#policy.reconnectDelaysMs[Math.min(this.#reconnectAttempts, this.#policy.reconnectDelaysMs.length - 1)];
    if (delay === void 0 || delay === 0) this.#attemptRecovery();
    else {
      this.#retryTimer?.cancel();
      this.#retryTimer = this.#clock.schedule(delay, () => {
        this.#retryTimer = void 0;
        this.#attemptRecovery();
      });
    }
  }
  sendRaw(peerId, data) {
    if (this.#state.kind !== "active") return err(recoveryFailure("session is not active"));
    return this.#sendToPeer(peerId, data);
  }
  /** Send one application command through the current replica attachment. */
  sendToAuthority(sessionId, data) {
    if (sessionId !== this.#sessionId)
      return err(recoveryFailure("session id does not belong to this NetSession"));
    if (this.#state.kind === "recovering" || this.#state.kind === "failed" || this.#state.kind === "retired")
      return err(recoveryFailure("session is not connected to the authority"));
    const peerId = this.#peerForSession(sessionId);
    if (peerId === void 0) return err(recoveryFailure("authority peer is not connected"));
    if (this.#replica !== void 0) {
      const announced = this.#announceSession(peerId);
      if (!announced.ok) return announced;
    }
    return this.#sendToPeer(peerId, data);
  }
  /** Send one application message to an authority-owned logical session. */
  sendToSession(sessionId, data) {
    if (this.#state.kind === "failed" || this.#state.kind === "retired")
      return err(recoveryFailure("session is not connected to the authority"));
    const peerId = this.#peerForSession(sessionId);
    if (peerId === void 0) return err(recoveryFailure("logical session is not connected"));
    return this.#sendToPeer(peerId, data);
  }
  attachAuthority(authority) {
    this.#authority = authority;
  }
  requestFullBaseline(peerId) {
    if (this.#peerIds.has(peerId)) this.#pendingFullPeers.add(peerId);
  }
  requestFullBaselineForSession(sessionId) {
    const peerId = this.#sessionPeers.get(sessionId);
    if (peerId !== void 0) this.requestFullBaseline(peerId);
  }
  attachReplica(coordinator, limits) {
    this.#replica = { coordinator, limits };
  }
  #ledgerBoundError() {
    return new NetError({
      code: "recovery-rejected",
      expected: "published packets within the configured finite ACK bound",
      hint: "wait for a cumulative ACK before publishing more packets",
      detail: { reason: "ACK ledger bound reached" }
    });
  }
  #ensurePublicationCapacity(expectedEpoch) {
    if (expectedEpoch === this.#epoch && this.#ledger.size >= this.#policy.maxPendingPackets)
      return err(this.#ledgerBoundError());
    return ok(void 0);
  }
  #reservePublished(packet) {
    if (packet.epoch !== this.#epoch) {
      this.#ledger.clear();
      this.#acknowledgedSequence = 0;
      this.#epoch = packet.epoch;
    }
    if (this.#ledger.size >= this.#policy.maxPendingPackets && !this.#ledger.has(packet.sequence))
      return err(this.#ledgerBoundError());
    this.#sequence = packet.sequence;
    this.#ledger.set(packet.sequence, packet.bytes);
    return ok(void 0);
  }
  #sendPublished(packet, peerIds) {
    const reserved = this.#reservePublished(packet);
    if (!reserved.ok) return reserved;
    if (this.#endpoint === void 0) return err(recoveryFailure("session has no endpoint"));
    let delivered = false;
    for (const peerId of peerIds) {
      const sent = this.#endpoint.send(peerId, packet.bytes);
      if (!sent.ok) {
        if (sent.error.code === "connection-closed") {
          this.#forgetPeer(peerId);
          continue;
        }
        this.#ledger.delete(packet.sequence);
        return err(sent.error);
      }
      delivered = true;
    }
    if (!delivered) this.#ledger.delete(packet.sequence);
    return ok(void 0);
  }
  publish() {
    if (this.#authority === void 0 || this.#endpoint === void 0 || this.#peerIds.size === 0)
      return ok(void 0);
    if (this.#pendingFullPeers.size > 0) {
      const capacity2 = this.#ensurePublicationCapacity(this.#authority.nextPublicationEpoch(true));
      if (!capacity2.ok) return capacity2;
      const published2 = this.#authority.publishFull();
      if (!published2.ok) return err(published2.error);
      const sent2 = this.#sendPublished(published2.value, [...this.#peerIds]);
      if (!sent2.ok) return err(sent2.error);
      this.#pendingFullPeers.clear();
      return ok(void 0);
    }
    const capacity = this.#ensurePublicationCapacity(this.#authority.nextPublicationEpoch());
    if (!capacity.ok) return capacity;
    const published = this.#authority.publish();
    if (!published.ok) return err(published.error);
    const sent = this.#sendPublished(published.value, [...this.#peerIds]);
    if (!sent.ok) return err(sent.error);
    return ok(void 0);
  }
  dispose() {
    if (this.#disposed) return;
    this.#disposed = true;
    this.#clearRecoveryWork();
    this.#endpoint?.close();
    this.#endpoint = void 0;
    this.#replica?.coordinator.clear();
    this.#replica = void 0;
    this.#authority = void 0;
    this.#peerIds.clear();
    this.#sessionPeers.clear();
    this.#announcedPeers.clear();
    this.#sessionAnnounced = false;
    this.#pendingFullPeers.clear();
    this.#rawMessages = [];
    this.#deferredEvents = [];
    this.#deferReplicaMessages = false;
    if (this.#state.kind !== "retired")
      this.#setState({ kind: "retired", sessionId: this.#sessionId, reason: "disposed" });
  }
  #queueRawMessage(peerId, data) {
    if (this.#rawMessages.length >= this.#maxRawMessages) return;
    this.#rawMessages.push({
      peerId,
      sessionId: this.#sessionForPeer(peerId),
      data: new Uint8Array(data)
    });
  }
  #sessionForPeer(peerId) {
    for (const [sessionId2, mappedPeerId] of this.#sessionPeers)
      if (mappedPeerId === peerId) return sessionId2;
    if (this.#replica !== void 0) {
      this.#bindSession(this.#sessionId, peerId);
      return this.#sessionId;
    }
    const created = createSessionId(peerId);
    const sessionId = created.ok ? created.value : this.#sessionId;
    this.#bindSession(sessionId, peerId);
    return sessionId;
  }
  #bindSession(sessionId, peerId) {
    for (const [mappedSessionId, mappedPeerId] of this.#sessionPeers)
      if (mappedSessionId === sessionId || mappedPeerId === peerId)
        this.#sessionPeers.delete(mappedSessionId);
    this.#sessionPeers.set(sessionId, peerId);
  }
  #forgetPeer(peerId) {
    this.#peerIds.delete(peerId);
    for (const [sessionId, mappedPeerId] of this.#sessionPeers)
      if (mappedPeerId === peerId) this.#sessionPeers.delete(sessionId);
    this.#announcedPeers.delete(peerId);
    this.#pendingFullPeers.delete(peerId);
  }
  #peerForSession(sessionId) {
    const mapped = this.#sessionPeers.get(sessionId);
    if (mapped !== void 0 && this.#peerIds.has(mapped)) return mapped;
    if (this.#replica !== void 0 && this.#peerIds.size === 1) {
      const peerId = [...this.#peerIds][0];
      if (peerId !== void 0) {
        this.#bindSession(sessionId, peerId);
        return peerId;
      }
    }
    return void 0;
  }
  #announceSession(peerId) {
    if (this.#announcedPeers.has(peerId)) return ok(void 0);
    const packet = {
      version: 2,
      kind: this.#sessionAnnounced ? "session-resume" : "session-open",
      sessionId: this.#sessionId,
      epoch: this.#epoch,
      sequence: 0
    };
    const encoded = encodeReplicationPacket(packet, DEFAULT_REPLICATION_LIMITS);
    if (!encoded.ok) return err(encoded.error);
    const sent = this.#sendToPeer(peerId, encoded.value);
    if (!sent.ok) return sent;
    this.#announcedPeers.add(peerId);
    this.#sessionAnnounced = true;
    return ok(void 0);
  }
  #sendToPeer(peerId, data) {
    const result = this.#endpoint?.send(peerId, data);
    if (result === void 0) return err(recoveryFailure("session has no endpoint"));
    return result.ok ? ok(void 0) : err(result.error);
  }
  /** ACK accepted data at the session boundary; consumers should not reimplement this wire step. */
  #sendReplicationAck(peerId, packet) {
    const encoded = encodeReplicationPacket(
      {
        version: 2,
        kind: "ack",
        sessionId: packet.sessionId,
        epoch: packet.epoch,
        acknowledgedSequence: packet.sequence
      },
      DEFAULT_REPLICATION_LIMITS
    );
    if (!encoded.ok) {
      this.#setFailure(encoded.error);
      return;
    }
    const sent = this.#sendToPeer(peerId, encoded.value);
    if (!sent.ok) this.#lastError = sent.error;
  }
};
function netPlugin(config) {
  return {
    name: "net-session",
    inject: ["world"],
    apply(ctx) {
      const world = ctx.world;
      const session = new NetSession({
        ...config.endpoint === void 0 ? {} : { endpoint: config.endpoint },
        ...config.connector === void 0 ? {} : { connector: config.connector },
        ...config.sessionId === void 0 ? {} : { sessionId: config.sessionId },
        ...config.recovery === void 0 ? {} : { recovery: config.recovery },
        ...config.clock === void 0 ? {} : { clock: config.clock },
        maxRawMessages: config.maxRawMessages ?? 256
      });
      ctx.effect(() => {
        world.insertResource("net-session", session);
        if (config.connector !== void 0 && config.endpoint === void 0) {
          session.recover();
          session.advanceRecovery();
        }
        return () => {
          session.dispose();
          world.removeResource("net-session");
        };
      }, "net/session-resource");
      ctx.effect(() => {
        world.addSystem(Update, {
          name: "net-receive",
          queries: [],
          before: [FixedUpdate],
          fn: (world2) => world2.getResource("net-session").receiveEvents()
        }).unwrap();
        return () => world.removeSystem(Update, "net-receive");
      }, "net/receive");
      ctx.effect(() => {
        world.addSystem(Update, {
          name: "net-publish",
          queries: [],
          after: [FixedUpdate],
          fn: (world2) => {
            const published = world2.getResource("net-session").publish();
            if (!published.ok && published.error.code === "recovery-rejected" && published.error.detail.reason === "ACK ledger bound reached")
              return;
            return published;
          }
        }).unwrap();
        return () => world.removeSystem(Update, "net-publish");
      }, "net/publish");
    }
  };
}

export { AuthorityCoordinator, DEFAULT_NET_RECOVERY_POLICY, DEFAULT_REPLICATION_LIMITS, ENDPOINT_ERROR_HINTS, ENDPOINT_EXPECTED, EndpointError, NetError, NetSession, RECOVERY_ERROR_CODES, REPLICATION_PROTOCOL_PREFIX, REPLICATION_PROTOCOL_VERSION, ReplicaCoordinator, applyReplicationPacket, createAuthorityCoordinator, createMemoryEndpointConnector, createMemoryEndpointPair, createMemoryEndpointPairWithController, createReplicaCoordinator, createSessionId, decodeAndApplyReplicationPacket, decodeReplicationPacket, defineReplication, encodeReplicationPacket, isEndpointError, isLegalNetSessionTransition, netPlugin, resolveNetRecoveryPolicy, transitionNetSessionState, validateHandshake, validateNetRecoveryPolicy };
