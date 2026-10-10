import { err, ok } from '../../types/dist/index.mjs';

// src/internal/catalog-session.ts
function invalidRow(guid, reason) {
  return err({
    code: "asset-package-invalid",
    expected: "one complete current runtime Catalog row",
    hint: "rebuild the producer Catalog and publish one Pack v2 tuple",
    detail: { guid, reason }
  });
}
function validateRuntimeRow(row) {
  if (row === null || typeof row !== "object") return invalidRow("", "row");
  const candidate = row;
  const guid = typeof candidate.guid === "string" ? candidate.guid : "";
  if (guid.trim().length === 0) return invalidRow(guid, "guid");
  if (typeof candidate.kind !== "string" || candidate.kind.trim().length === 0)
    return invalidRow(guid, "kind");
  if (typeof candidate.packageUrl !== "string" || candidate.packageUrl.trim().length === 0)
    return invalidRow(guid, "packageUrl");
  if (typeof candidate.sourcePath !== "string" || candidate.sourcePath.trim().length === 0)
    return invalidRow(guid, "sourcePath");
  if (!Number.isSafeInteger(candidate.publication?.generation))
    return invalidRow(guid, "publication generation");
  if (candidate.publication === void 0) return invalidRow(guid, "publication");
  const publication = candidate.publication;
  if (publication.schemaVersion !== "asset-publication/1" || typeof publication.sourcePath !== "string" || publication.sourcePath.trim().length === 0 || typeof publication.sourceRevision !== "string" || publication.sourceRevision.trim().length === 0 || publication.generation < 0 || typeof publication.digest !== "string" || publication.digest.trim().length === 0 || typeof publication.outputSetDigest !== "string" || publication.outputSetDigest.trim().length === 0 || !Array.isArray(publication.outputs) || publication.receipt === null || typeof publication.receipt !== "object" || !Array.isArray(publication.externalEvidence)) {
    return invalidRow(guid, "publication tuple");
  }
  return ok(Object.freeze({ ...candidate, guid, publication }));
}

// src/internal/catalog-session.ts
function runtimeError(code, guid, detail) {
  if (code === "catalog-discontinuous") {
    return {
      code,
      expected: "an ordered catalog revision window",
      hint: "reconcile the current Catalog before consuming this delta",
      detail: {
        scopeId: String(detail.scopeId ?? "unknown"),
        expectedGeneration: Number(detail.expectedGeneration ?? 0),
        actualGeneration: Number(detail.actualGeneration ?? 0)
      }
    };
  }
  return {
    code: "asset-package-invalid",
    expected: "a verified Catalog source",
    hint: "repair the producer Catalog and retry with the current publication",
    detail: { guid, reason: String(detail.reason ?? "catalog source failed") }
  };
}
function freezeSnapshot(snapshot) {
  return Object.freeze({
    ...snapshot,
    entries: Object.freeze([...snapshot.entries]),
    changed: Object.freeze([...snapshot.changed]),
    removed: Object.freeze([...snapshot.removed]),
    diagnostics: Object.freeze([...snapshot.diagnostics])
  });
}
function sameEntry(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}
function key(guid) {
  return guid.toLowerCase();
}
var CatalogSession = class {
  source;
  scopeId;
  generation;
  entries = /* @__PURE__ */ new Map();
  listeners = /* @__PURE__ */ new Set();
  unsubscribe;
  baselinePromise;
  reconcilePromise;
  pending = [];
  currentSnapshot;
  revision;
  diagnostics = [];
  listenerFailures = 0;
  changed = /* @__PURE__ */ new Set();
  removed = /* @__PURE__ */ new Set();
  epoch = 0;
  stale = false;
  staleGeneration = 0;
  started = false;
  disposed = false;
  constructor(source, options = {}) {
    this.source = source;
    this.scopeId = options.scopeId ?? source.expectedScope?.scopeId ?? "asset-runtime";
    this.generation = options.generation ?? source.expectedScope?.generation ?? 0;
    this.currentSnapshot = freezeSnapshot({
      scopeId: this.scopeId,
      generation: this.generation,
      epoch: 0,
      entries: [],
      changed: [],
      removed: [],
      diagnostics: [],
      listenerFailures: 0,
      stale: false
    });
  }
  start() {
    if (this.baselinePromise !== void 0) return this.baselinePromise;
    if (this.disposed) return Promise.resolve(err(this.disposedError()));
    this.unsubscribe = this.source.subscribe((delta) => this.receive(delta));
    const promise = this.source.enumerate().then((result) => {
      if (!result.ok) {
        this.markStale();
        this.publish();
        return err(runtimeError("asset-package-invalid", "", { reason: result.error.code }));
      }
      this.entries.clear();
      for (const entry of result.value) {
        const validated = validateRuntimeRow(entry);
        if (!validated.ok) {
          this.markStale();
          this.publish();
          return err(validated.error);
        }
        this.entries.set(key(validated.value.guid), validated.value);
      }
      this.started = true;
      this.stale = false;
      this.staleGeneration = this.generation;
      this.diagnostics = [];
      for (const delta of this.pending) this.fold(delta, false);
      this.pending = [];
      this.publish();
      return ok(this.currentSnapshot);
    }).catch((cause) => {
      this.markStale();
      this.addDiagnostic("catalog-degraded-rows", "Catalog enumeration must resolve a Result");
      this.publish();
      return err(
        runtimeError("asset-package-invalid", "", {
          reason: cause instanceof Error ? cause.message : String(cause)
        })
      );
    });
    this.baselinePromise = promise;
    void promise.then(
      (result) => {
        if (!result.ok) this.baselinePromise = void 0;
      },
      () => {
        this.baselinePromise = void 0;
      }
    );
    return promise;
  }
  reconcile() {
    if (this.disposed) return Promise.resolve(err(this.disposedError()));
    if (this.reconcilePromise !== void 0) return this.reconcilePromise;
    this.unsubscribe?.();
    this.unsubscribe = void 0;
    this.started = false;
    this.pending = [];
    this.baselinePromise = void 0;
    this.epoch += 1;
    const promise = this.start();
    this.reconcilePromise = promise;
    void promise.then(
      () => {
        if (this.reconcilePromise === promise) this.reconcilePromise = void 0;
      },
      () => {
        if (this.reconcilePromise === promise) this.reconcilePromise = void 0;
      }
    );
    return promise;
  }
  current(guid) {
    return this.entries.get(key(guid));
  }
  snapshot() {
    return this.currentSnapshot;
  }
  discontinuity() {
    if (!this.stale) return void 0;
    return {
      code: "catalog-discontinuous",
      expected: "an ordered, authoritative catalog revision window",
      hint: "reconcile the Catalog source and retry the current publication",
      detail: {
        scopeId: this.scopeId,
        expectedGeneration: this.generation,
        actualGeneration: this.staleGeneration
      }
    };
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.unsubscribe?.();
    this.unsubscribe = void 0;
    this.pending = [];
    this.listeners.clear();
  }
  receive(delta) {
    if (this.disposed) return;
    if (!this.started) {
      this.pending.push(delta);
      return;
    }
    this.fold(delta, true);
  }
  fold(delta, publish) {
    if (delta.scopeId !== void 0 && delta.scopeId !== this.scopeId || delta.generation !== void 0 && delta.generation !== this.generation) {
      this.markStale(delta.generation);
      this.addDiagnostic("catalog-scope-mismatch", "delta scope does not match the session");
      if (publish) this.publish();
      return;
    }
    if (delta.authority === "degraded") {
      this.markStale(delta.generation);
      this.addDiagnostic("catalog-degraded-rows", "degraded rows are not identity-bearing");
      if (publish) this.publish();
      return;
    }
    if (delta.revisions !== void 0) {
      const baseline = delta.revisions.baseline;
      const current = delta.revisions.current;
      const valid = baseline.length === current.length && current.every((point) => {
        const prior = baseline.find((item) => item.rootId === point.rootId);
        return prior !== void 0 && point.revision === prior.revision + 1;
      });
      if (!valid) {
        this.markStale(delta.generation);
        this.addDiagnostic("catalog-gap", "delta revision window is not contiguous");
        if (publish) this.publish();
        return;
      }
    }
    let changed = false;
    for (const entry of [...delta.added, ...delta.changed]) {
      const validated = validateRuntimeRow(entry);
      if (!validated.ok) {
        this.markStale(delta.generation);
        this.addDiagnostic("catalog-degraded-rows", "delta contains an invalid runtime row");
        if (publish) this.publish();
        return;
      }
      const entryKey = key(validated.value.guid);
      const prior = this.entries.get(entryKey);
      if (prior === void 0 || !sameEntry(prior, validated.value)) {
        this.entries.set(entryKey, validated.value);
        this.changed.add(entryKey);
        changed = true;
        if (validated.value.revision !== void 0) this.revision = validated.value.revision;
      }
    }
    for (const guid of delta.removed) {
      const entryKey = key(guid);
      if (this.entries.delete(entryKey)) {
        this.removed.add(entryKey);
        changed = true;
      }
    }
    if (changed) this.epoch += 1;
    if (publish) this.publish();
  }
  addDiagnostic(code, expected) {
    if (this.diagnostics.some((diagnostic) => diagnostic.code === code)) return;
    this.diagnostics.push({
      code,
      severity: "blocking",
      expected,
      hint: "reconcile the Catalog before loading the affected publication",
      authority: "catalog"
    });
  }
  markStale(actualGeneration = this.generation) {
    this.stale = true;
    this.staleGeneration = actualGeneration;
    this.epoch += 1;
  }
  publish() {
    this.currentSnapshot = freezeSnapshot({
      scopeId: this.scopeId,
      generation: this.generation,
      epoch: this.epoch,
      ...this.revision === void 0 ? {} : { revision: this.revision },
      entries: [...this.entries.values()].sort(
        (left, right) => key(left.guid).localeCompare(key(right.guid))
      ),
      changed: [...this.changed].sort(),
      removed: [...this.removed].sort(),
      diagnostics: this.diagnostics,
      listenerFailures: this.listenerFailures,
      stale: this.stale
    });
    this.changed.clear();
    this.removed.clear();
    for (const listener of [...this.listeners]) {
      try {
        listener(this.currentSnapshot);
      } catch {
        this.listenerFailures = Math.min(1024, this.listenerFailures + 1);
        this.currentSnapshot = freezeSnapshot({
          ...this.currentSnapshot,
          listenerFailures: this.listenerFailures
        });
      }
    }
  }
  disposedError() {
    return runtimeError("asset-runtime-disposed", "", { scopeId: this.scopeId });
  }
};
var REGISTRY_RESOLVER = /* @__PURE__ */ Symbol.for("forgeax.assets-runtime.registry-resolver");
function getAssetRegistryResolver(registry) {
  const resolver = registry[REGISTRY_RESOLVER];
  if (resolver === void 0) {
    throw new TypeError("AssetRegistry resolver is not owned by this asset runtime");
  }
  return resolver;
}

export { CatalogSession, getAssetRegistryResolver };
