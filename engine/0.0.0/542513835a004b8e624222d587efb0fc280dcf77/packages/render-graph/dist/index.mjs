import { ok, err } from '../../types/dist/index.mjs';
export { err, ok } from '../../types/dist/index.mjs';

// src/errors.ts
var RenderGraphError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    super(`[RenderGraphError ${args.code}] expected: ${args.expected}; hint: ${args.hint}`);
    this.name = "RenderGraphError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    this.detail = args.detail;
  }
};

// src/kernel-internal.ts
function textureHandle(owner, id) {
  return Object.freeze({ owner, id, kind: "texture" });
}
function textureViewHandle(owner, id, textureId) {
  return Object.freeze({
    owner,
    id,
    kind: "texture-view",
    textureId
  });
}
function bufferHandle(owner, id) {
  return Object.freeze({ owner, id, kind: "buffer" });
}
function handleData(resource) {
  if (typeof resource !== "object" || resource === null) return void 0;
  const candidate = resource;
  if (typeof candidate.id !== "number" || typeof candidate.owner !== "object") return void 0;
  if (candidate.kind !== "texture" && candidate.kind !== "texture-view" && candidate.kind !== "buffer") {
    return void 0;
  }
  return candidate;
}
function accessResourceId(access) {
  const data = handleData(access.resource);
  if (data?.kind === "texture-view") return data.textureId;
  return data?.id;
}

// src/compiled-graph.ts
var RenderGraphAllocationLedger = class {
  live = /* @__PURE__ */ new Map();
  pending = /* @__PURE__ */ new Map();
  liveBytes = 0;
  pendingBytes = 0;
  peakBytes = 0;
  successfulAllocationCount = 0;
  successfulAllocationBytes = 0;
  retiredBytes = 0;
  unknownByteSizeCount = 0;
  importedResourceCount;
  constructor(entries, importedResourceCount) {
    this.importedResourceCount = importedResourceCount;
    for (const entry of entries) this.allocate(entry.handle, entry.bytes);
  }
  inspect() {
    return {
      unit: "engine-allocation-bytes",
      physicalResidency: "unknown",
      liveBytes: this.liveBytes,
      pendingRetirementBytes: this.pendingBytes,
      peakBytes: this.peakBytes,
      successfulAllocationCount: this.successfulAllocationCount,
      successfulAllocationBytes: this.successfulAllocationBytes,
      pendingRetirementCount: this.pending.size,
      retiredBytes: this.retiredBytes,
      failedAllocationRollbacks: 0,
      failedAllocationRollbackBytes: 0,
      unknownByteSizeCount: this.unknownByteSizeCount,
      importedResourceCount: this.importedResourceCount
    };
  }
  retireAll() {
    for (const handle of [...this.live.keys()]) this.retire(handle);
  }
  release(handle) {
    const pendingBytes = this.pending.get(handle);
    if (pendingBytes !== void 0 || this.pending.has(handle)) {
      this.pending.delete(handle);
      if (pendingBytes !== void 0) this.pendingBytes -= pendingBytes;
      if (pendingBytes === void 0) this.unknownByteSizeCount -= 1;
      this.retiredBytes += pendingBytes ?? 0;
      return;
    }
    const liveBytes = this.live.get(handle);
    if (liveBytes !== void 0 || this.live.has(handle)) {
      this.live.delete(handle);
      if (liveBytes !== void 0) this.liveBytes -= liveBytes;
      if (liveBytes === void 0) this.unknownByteSizeCount -= 1;
      this.retiredBytes += liveBytes ?? 0;
    }
  }
  allocate(handle, bytes) {
    if (this.live.has(handle) || this.pending.has(handle)) return;
    this.live.set(handle, bytes);
    this.successfulAllocationCount += 1;
    if (bytes === void 0) this.unknownByteSizeCount += 1;
    else {
      this.liveBytes += bytes;
      this.successfulAllocationBytes += bytes;
    }
    this.updatePeak();
  }
  retire(handle) {
    const bytes = this.live.get(handle);
    if (bytes === void 0 && !this.live.has(handle)) return;
    this.live.delete(handle);
    if (bytes !== void 0) {
      this.liveBytes -= bytes;
      this.pendingBytes += bytes;
    }
    this.pending.set(handle, bytes);
    this.updatePeak();
  }
  updatePeak() {
    this.peakBytes = Math.max(this.peakBytes, this.liveBytes + this.pendingBytes);
  }
};
function resolutionError(label, cause) {
  return new RenderGraphError({
    code: "resource-resolution-failed",
    expected: `resource '${label}' resolves to a live RHI handle for this frame`,
    hint: `repair the imported owner for '${label}' before executing the graph`,
    detail: { resourceLabel: label, ...cause === void 0 ? {} : { accesses: [String(cause)] } }
  });
}
var CompiledRenderGraphImpl = class {
  constructor(generation, owner, device, resources, views, passes, info, colorTargetDescriptors) {
    this.generation = generation;
    this.owner = owner;
    this.device = device;
    this.resources = resources;
    this.views = views;
    this.passes = passes;
    this.info = info;
    this.colorTargetDescriptors = colorTargetDescriptors;
    const infoByLabel = new Map(info.resources.map((resource) => [resource.label, resource]));
    const seen = /* @__PURE__ */ new Set();
    const entries = [];
    let importedResourceCount = 0;
    for (const compiled of resources.values()) {
      if (compiled.usage === 0) continue;
      const handle = compiled.texture ?? compiled.buffer;
      if (compiled.record.origin === "imported") {
        importedResourceCount += 1;
        continue;
      }
      if (handle === void 0 || seen.has(handle)) continue;
      seen.add(handle);
      entries.push({
        handle,
        bytes: infoByLabel.get(compiled.record.label)?.byteSize
      });
    }
    this.allocationLedger = new RenderGraphAllocationLedger(entries, importedResourceCount);
  }
  generation;
  owner;
  device;
  resources;
  views;
  passes;
  info;
  colorTargetDescriptors;
  retired = false;
  retireResult;
  allocationLedger;
  inspect() {
    return { ...this.info, resourceAllocation: this.allocationLedger.inspect() };
  }
  getColorTargetView(name) {
    for (const view of this.views.values()) {
      const resource = this.resources.get(view.record.textureId);
      if (resource?.record.label === name) return view.view;
    }
    return void 0;
  }
  getColorTargetTexture(name) {
    for (const resource of this.resources.values()) {
      if (resource.record.label === name) return resource.texture;
    }
    return void 0;
  }
  getColorTargetDescriptor(name) {
    return this.colorTargetDescriptors.get(name);
  }
  execute(frame, runPass, instrumentation) {
    if (this.retired) {
      return err(
        new RenderGraphError({
          code: "compiled-graph-retired",
          expected: "a compiled graph executes only before retire()",
          hint: "publish and execute the replacement compiled graph",
          detail: { generation: this.generation }
        })
      );
    }
    const resolved = this.resolveFrameResources(frame);
    if (!resolved.ok) return resolved;
    for (const [executionIndex, pass] of this.passes.entries()) {
      const resolver = this.createPassResolver(pass, resolved.value);
      try {
        if (pass.pass.descriptor.executeIf?.(frame) === false) continue;
        const execution = { name: pass.name, kind: pass.pass.kind, executionIndex };
        let encodeResult = ok(void 0);
        const encode = () => {
          const scope = instrumentation?.begin(execution, frame);
          switch (pass.pass.kind) {
            case "raster": {
              const descriptor = pass.pass.descriptor;
              const colorAttachments = [];
              for (const attachment of descriptor.colorAttachments) {
                const view = resolver.textureView(attachment.view);
                if (!view.ok) {
                  encodeResult = view;
                  return;
                }
                const resolveTarget = attachment.resolveTarget === void 0 ? void 0 : resolver.textureView(attachment.resolveTarget);
                if (resolveTarget !== void 0 && !resolveTarget.ok) {
                  encodeResult = resolveTarget;
                  return;
                }
                const clearValue = typeof attachment.clearValue === "function" ? attachment.clearValue(frame) : attachment.clearValue;
                colorAttachments.push({
                  view: view.value,
                  ...resolveTarget === void 0 ? {} : { resolveTarget: resolveTarget.value },
                  ...clearValue === void 0 ? {} : { clearValue },
                  loadOp: attachment.loadOp,
                  storeOp: attachment.storeOp,
                  ...attachment.depthSlice === void 0 ? {} : { depthSlice: attachment.depthSlice }
                });
              }
              let depthStencilAttachment;
              if (descriptor.depthStencilAttachment !== void 0) {
                const attachment = descriptor.depthStencilAttachment;
                const view = resolver.textureView(attachment.view);
                if (!view.ok) {
                  encodeResult = view;
                  return;
                }
                depthStencilAttachment = {
                  view: view.value,
                  ...attachment.depthClearValue === void 0 ? {} : { depthClearValue: attachment.depthClearValue },
                  ...attachment.depthLoadOp === void 0 ? {} : { depthLoadOp: attachment.depthLoadOp },
                  ...attachment.depthStoreOp === void 0 ? {} : { depthStoreOp: attachment.depthStoreOp },
                  ...attachment.depthReadOnly === void 0 ? {} : { depthReadOnly: attachment.depthReadOnly },
                  ...attachment.stencilClearValue === void 0 ? {} : { stencilClearValue: attachment.stencilClearValue },
                  ...attachment.stencilLoadOp === void 0 ? {} : { stencilLoadOp: attachment.stencilLoadOp },
                  ...attachment.stencilStoreOp === void 0 ? {} : { stencilStoreOp: attachment.stencilStoreOp },
                  ...attachment.stencilReadOnly === void 0 ? {} : { stencilReadOnly: attachment.stencilReadOnly }
                };
              }
              const baseDescriptor = {
                label: pass.name,
                colorAttachments,
                ...depthStencilAttachment === void 0 ? {} : { depthStencilAttachment },
                ...pass.pass.descriptor.occlusionQuerySet === void 0 ? {} : { occlusionQuerySet: pass.pass.descriptor.occlusionQuerySet }
              };
              const instrumentedDescriptor = scope?.renderPassDescriptor?.(baseDescriptor) ?? baseDescriptor;
              const encoder = frame.encoder.beginRenderPass(instrumentedDescriptor);
              try {
                descriptor.encode({ pass: encoder, frame, resources: resolver });
              } finally {
                encoder.end();
              }
              break;
            }
            case "compute": {
              const begin = pass.pass.descriptor.begin?.(frame);
              const instrumentedBegin = scope?.computePassDescriptor?.(begin ?? {}) ?? begin;
              let encoder;
              try {
                encoder = frame.encoder.beginComputePass({
                  ...instrumentedBegin ?? {},
                  label: pass.name
                });
              } catch (cause) {
                pass.pass.descriptor.onBeginError?.(frame, cause);
                throw cause;
              }
              try {
                pass.pass.descriptor.encode({ pass: encoder, frame, resources: resolver });
              } finally {
                encoder.end();
              }
              pass.pass.descriptor.after?.(frame);
              break;
            }
            case "copy":
              scope?.beforeCopy?.(frame.encoder);
              try {
                pass.pass.descriptor.encode({ encoder: frame.encoder, frame, resources: resolver });
              } finally {
                scope?.afterCopy?.(frame.encoder);
              }
              break;
          }
        };
        if (runPass === void 0) {
          encode();
        } else {
          runPass(execution, encode);
        }
        if (!encodeResult.ok) return encodeResult;
      } catch (cause) {
        return err(
          new RenderGraphError({
            code: "pass-encode-failed",
            expected: `pass '${pass.name}' encodes without throwing`,
            hint: "inspect detail.cause and repair the pass-owned RHI command",
            detail: { passName: pass.name, passKind: pass.pass.kind, cause }
          })
        );
      }
    }
    return ok(void 0);
  }
  retire() {
    if (this.retireResult !== void 0) return this.retireResult;
    this.retired = true;
    this.retireResult = this.finishRetire();
    return this.retireResult;
  }
  async finishRetire() {
    this.allocationLedger.retireAll();
    try {
      await this.device.queue.onSubmittedWorkDone();
    } catch (cause) {
      return err(
        new RenderGraphError({
          code: "resource-retire-failed",
          expected: "the GPU submission fence resolves before graph resources retire",
          hint: "recover the device before retiring the replacement generation",
          detail: { generation: this.generation, cause }
        })
      );
    }
    let firstFailure;
    for (const compiled of this.resources.values()) {
      if (compiled.record.origin === "imported") continue;
      if (compiled.texture === void 0 && compiled.buffer === void 0) continue;
      let destroyedSuccessfully = false;
      try {
        const destroyed = compiled.record.kind === "texture" ? this.device.destroyTexture(compiled.texture) : this.device.destroyBuffer(compiled.buffer);
        destroyedSuccessfully = destroyed.ok;
        if (!destroyed.ok && firstFailure === void 0) {
          firstFailure = new RenderGraphError({
            code: "resource-retire-failed",
            expected: `graph-created resource '${compiled.record.label}' retires exactly once`,
            hint: "inspect detail.cause for the RHI destroy refusal",
            detail: {
              generation: this.generation,
              resourceLabel: compiled.record.label,
              cause: destroyed.error
            }
          });
        }
      } catch (cause) {
        firstFailure ??= new RenderGraphError({
          code: "resource-retire-failed",
          expected: `graph-created resource '${compiled.record.label}' retires exactly once`,
          hint: "inspect detail.cause for the RHI destroy failure",
          detail: { generation: this.generation, resourceLabel: compiled.record.label, cause }
        });
      } finally {
        if (destroyedSuccessfully)
          this.allocationLedger.release(compiled.texture ?? compiled.buffer);
      }
    }
    return firstFailure === void 0 ? ok(void 0) : err(firstFailure);
  }
  resolveFrameResources(frame) {
    const buffers = /* @__PURE__ */ new Map();
    const textures = /* @__PURE__ */ new Map();
    const views = /* @__PURE__ */ new Map();
    for (const compiled of this.resources.values()) {
      if (compiled.usage === 0) continue;
      try {
        if (compiled.record.kind === "texture") {
          const texture = compiled.record.origin === "created" ? compiled.texture : compiled.record.resolve(frame);
          if (texture === void 0) return err(resolutionError(compiled.record.label));
          textures.set(compiled.record.id, texture);
        } else {
          const buffer = compiled.record.origin === "created" ? compiled.buffer : compiled.record.resolve(frame);
          if (buffer === void 0) return err(resolutionError(compiled.record.label));
          buffers.set(compiled.record.id, buffer);
        }
      } catch (cause) {
        return err(resolutionError(compiled.record.label, cause));
      }
    }
    for (const compiledView of this.views.values()) {
      if (this.resources.get(compiledView.record.textureId)?.usage === 0) continue;
      if (compiledView.record.resolve !== void 0) {
        try {
          views.set(compiledView.record.id, compiledView.record.resolve(frame));
        } catch (cause) {
          return err(resolutionError(compiledView.record.label, cause));
        }
        continue;
      }
      if (compiledView.view !== void 0) {
        views.set(compiledView.record.id, compiledView.view);
        continue;
      }
      const texture = textures.get(compiledView.record.textureId);
      if (texture === void 0) return err(resolutionError(compiledView.record.label));
      const created = this.device.createTextureView(texture, compiledView.record.descriptor);
      if (!created.ok) return err(resolutionError(compiledView.record.label, created.error));
      views.set(compiledView.record.id, created.value);
    }
    return ok({ buffers, textures, views });
  }
  createPassResolver(pass, frameResources) {
    const lookup = (resource, expectedKind) => {
      const data = handleData(resource);
      const resourceId = data?.kind === "texture-view" ? data.textureId : data?.id;
      if (data === void 0 || data.owner !== this.owner || data.kind !== expectedKind) {
        return err(
          new RenderGraphError({
            code: "foreign-resource-handle",
            expected: `pass '${pass.name}' resolves a handle owned by this compiled graph`,
            hint: "use only handles created by the builder that declared this pass",
            detail: { passName: pass.name }
          })
        );
      }
      if (resourceId === void 0 || !pass.resourceIds.has(resourceId)) {
        const label = this.resources.get(resourceId ?? -1)?.record.label;
        return err(
          new RenderGraphError({
            code: "resource-not-declared-by-pass",
            expected: `pass '${pass.name}' resolves only resources present in its accesses`,
            hint: "add the resource access to this pass before resolving it",
            detail: { passName: pass.name, resourceLabel: label }
          })
        );
      }
      if (data.kind === "texture-view" && !pass.viewIds.has(data.id)) {
        const label = this.views.get(data.id)?.record.label;
        return err(
          new RenderGraphError({
            code: "resource-not-declared-by-pass",
            expected: `pass '${pass.name}' resolves only texture views present in its accesses`,
            hint: "add this exact texture view to the pass accesses",
            detail: { passName: pass.name, resourceLabel: label }
          })
        );
      }
      return ok(data);
    };
    return {
      buffer: (resource) => {
        const data = lookup(resource, "buffer");
        if (!data.ok) return data;
        const buffer = frameResources.buffers.get(data.value.id);
        return buffer === void 0 ? err(resolutionError(this.resources.get(data.value.id)?.record.label ?? "buffer")) : ok(buffer);
      },
      texture: (resource) => {
        const data = lookup(resource, "texture");
        if (!data.ok) return data;
        const texture = frameResources.textures.get(data.value.id);
        return texture === void 0 ? err(resolutionError(this.resources.get(data.value.id)?.record.label ?? "texture")) : ok(texture);
      },
      textureView: (resource) => {
        const data = lookup(resource, "texture-view");
        if (!data.ok) return data;
        const view = frameResources.views.get(data.value.id);
        return view === void 0 ? err(resolutionError(this.views.get(data.value.id)?.record.label ?? "texture view")) : ok(view);
      }
    };
  }
};

// src/resource-registry.ts
function isTextureViewDimensionCompatible(allocationDimension, viewDimension) {
  if (viewDimension === void 0) return true;
  if (allocationDimension === "3d") return viewDimension === "3d";
  return viewDimension !== "3d";
}
var ResourceRegistry = class {
  resources = /* @__PURE__ */ new Map();
  add(key, descriptor) {
    const entry = {
      key,
      descriptor,
      lifetime: descriptor.lifetime
    };
    return this.register(entry);
  }
  /**
   * Register a color target resource (D-8).
   * Same semantics as addResource with kind:'texture' plus GPU texture
   * allocation metadata. Existing callers default to a transient target.
   */
  addColorTarget(name, desc) {
    const lifetime = desc.lifetime ?? "transient";
    const colorTargetMeta = {
      format: desc.format,
      size: desc.size,
      sample: desc.sample ?? 1,
      usage: desc.usage ?? 16 | 4,
      // RENDER_ATTACHMENT | TEXTURE_BINDING
      ...desc.domain !== void 0 ? { domain: desc.domain } : {},
      ...desc.viewFormats !== void 0 ? { viewFormats: desc.viewFormats } : {}
    };
    const entry = {
      key: name,
      descriptor: { kind: "texture", lifetime },
      lifetime,
      colorTarget: colorTargetMeta
    };
    return this.register(entry);
  }
  /**
   * Register a color target alias that folds into the source's physical
   * texture at compile time (KB-1 MoveNode pattern, D-2).
   * The source must already be registered via addColorTarget.
   */
  addColorTargetAlias(name, source) {
    if (this.resources.has(name)) return this.duplicateResource(name);
    const sourceMeta = this.resources.get(source)?.colorTarget;
    if (sourceMeta === void 0) {
      return err(
        new RenderGraphError({
          code: "alias-source-missing",
          expected: `alias '${name}' source '${source}' must be a registered color target`,
          hint: `call addColorTarget('${source}', ...) before retrying alias '${name}'`,
          detail: { aliasKey: name, sourceKey: source }
        })
      );
    }
    const entry = {
      key: name,
      descriptor: { kind: "texture", lifetime: "transient" },
      lifetime: "transient",
      colorTarget: {
        format: sourceMeta.format,
        size: sourceMeta.size,
        sample: sourceMeta.sample,
        usage: sourceMeta.usage,
        ...sourceMeta.domain !== void 0 ? { domain: sourceMeta.domain } : {},
        ...sourceMeta.viewFormats !== void 0 ? { viewFormats: sourceMeta.viewFormats } : {},
        aliasedFrom: source
      }
    };
    return this.register(entry);
  }
  duplicateResource(key) {
    return err(
      new RenderGraphError({
        code: "duplicate-resource",
        expected: `resource key '${key}' registered exactly once`,
        hint: `remove the duplicate resource declaration for '${key}' or use a different key`,
        detail: { resourceKey: key }
      })
    );
  }
  register(entry) {
    if (this.resources.has(entry.key)) return this.duplicateResource(entry.key);
    this.resources.set(entry.key, entry);
    return ok(entry);
  }
  get(key) {
    return this.resources.get(key);
  }
  getColorTargetMeta(key) {
    return this.resources.get(key)?.colorTarget;
  }
  has(key) {
    return this.resources.has(key);
  }
  entries() {
    return this.resources.values();
  }
};

// src/builder.ts
var BUFFER_USAGE = {
  copySrc: 4,
  copyDst: 8,
  index: 16,
  vertex: 32,
  uniform: 64,
  storage: 128,
  indirect: 256
};
var TEXTURE_USAGE = {
  copySrc: 1,
  copyDst: 2,
  textureBinding: 4,
  storageBinding: 8,
  renderAttachment: 16
};
var nextGeneration = 1;
function textureByteSize(format, dimension, extent, mipLevelCount, sampleCount) {
  const bytesPerTexel = format === "r8unorm" || format === "r8snorm" || format === "r8uint" || format === "r8sint" ? 1 : format === "rg8unorm" || format === "rg8snorm" || format === "rg8uint" || format === "rg8sint" ? 2 : format === "rgba8unorm" || format === "rgba8unorm-srgb" || format === "rgba8snorm" || format === "rgba8uint" || format === "rgba8sint" || format === "r32float" || format === "r32uint" || format === "r32sint" ? 4 : format === "rg16float" || format === "rg16uint" || format === "rg16sint" || format === "rg16snorm" || format === "rg16unorm" ? 4 : format === "rgba16float" || format === "rgba16uint" || format === "rgba16sint" || format === "rgba16snorm" || format === "rgba16unorm" || format === "rg32float" || format === "rg32uint" || format === "rg32sint" ? 8 : format === "rgba32float" || format === "rgba32uint" || format === "rgba32sint" ? 16 : void 0;
  if (bytesPerTexel === void 0) return void 0;
  let bytes = 0;
  let width = extent.width;
  let height = extent.height;
  let depth = extent.depthOrArrayLayers;
  for (let level = 0; level < mipLevelCount; level += 1) {
    bytes += width * height * depth * bytesPerTexel * sampleCount;
    width = Math.max(1, Math.floor(width / 2));
    height = Math.max(1, Math.floor(height / 2));
    if (dimension === "3d") depth = Math.max(1, Math.floor(depth / 2));
  }
  return bytes;
}
function bufferUsage(access) {
  switch (access) {
    case "uniform-read":
      return BUFFER_USAGE.uniform;
    case "storage-read":
    case "storage-write":
    case "storage-read-write":
      return BUFFER_USAGE.storage;
    case "indirect-read":
      return BUFFER_USAGE.indirect;
    case "vertex-read":
      return BUFFER_USAGE.vertex;
    case "index-read":
      return BUFFER_USAGE.index;
    case "copy-src":
      return BUFFER_USAGE.copySrc;
    case "copy-dst":
      return BUFFER_USAGE.copyDst;
  }
}
function textureUsage(access) {
  switch (access) {
    case "sampled-read":
      return TEXTURE_USAGE.textureBinding;
    case "storage-read":
    case "storage-write":
    case "storage-read-write":
      return TEXTURE_USAGE.storageBinding;
    case "sampled-storage-read-write":
    case "sampled-storage-write":
      return TEXTURE_USAGE.storageBinding | TEXTURE_USAGE.textureBinding;
    case "color-attachment":
    case "depth-stencil-read":
    case "depth-stencil-write":
      return TEXTURE_USAGE.renderAttachment;
    case "copy-src":
      return TEXTURE_USAGE.copySrc;
    case "copy-dst":
      return TEXTURE_USAGE.copyDst;
  }
}
function accessMode(access) {
  switch (access) {
    case "storage-read-write":
    case "sampled-storage-read-write":
      return { read: true, write: true };
    case "storage-write":
    case "sampled-storage-write":
    case "color-attachment":
    case "depth-stencil-write":
    case "copy-dst":
      return { read: false, write: true };
    default:
      return { read: true, write: false };
  }
}
function rangesOverlap(left, right) {
  if (left === void 0 || right === void 0) return true;
  const aspectOverlap = left.aspect === "all" || right.aspect === "all" || left.aspect === right.aspect;
  return aspectOverlap && left.mipStart < right.mipEnd && right.mipStart < left.mipEnd && left.layerStart < right.layerEnd && right.layerStart < left.layerEnd;
}
function freezeInfo(info) {
  const freezeDescriptor = (descriptor) => {
    if (descriptor.kind !== "texture") return Object.freeze({ ...descriptor });
    const size = typeof descriptor.size === "string" ? descriptor.size : Object.freeze({ ...descriptor.size });
    return Object.freeze({ ...descriptor, size });
  };
  return Object.freeze({
    generation: info.generation,
    passes: Object.freeze(
      info.passes.map(
        (pass) => Object.freeze({
          ...pass,
          accesses: Object.freeze(pass.accesses.map((access) => Object.freeze({ ...access }))),
          dependencies: Object.freeze([...pass.dependencies])
        })
      )
    ),
    resources: Object.freeze(
      info.resources.map(
        (resource) => Object.freeze({
          ...resource,
          descriptor: freezeDescriptor(resource.descriptor)
        })
      )
    )
  });
}
var RenderGraphBuilder = class {
  owner = Object.freeze({});
  labels = /* @__PURE__ */ new Set();
  resources = /* @__PURE__ */ new Map();
  views = /* @__PURE__ */ new Map();
  passes = [];
  passNames = /* @__PURE__ */ new Set();
  nextId = 1;
  sealed = false;
  createTexture(label, descriptor) {
    const writable = this.ensureWritable();
    if (!writable.ok) return writable;
    const unique = this.reserveLabel(label);
    if (!unique.ok) return unique;
    const id = this.nextId++;
    this.resources.set(id, { id, label, kind: "texture", origin: "created", descriptor });
    return ok(textureHandle(this.owner, id));
  }
  importTexture(label, descriptor, resolve) {
    const writable = this.ensureWritable();
    if (!writable.ok) return writable;
    const unique = this.reserveLabel(label);
    if (!unique.ok) return unique;
    const id = this.nextId++;
    this.resources.set(id, {
      id,
      label,
      kind: "texture",
      origin: "imported",
      descriptor,
      resolve
    });
    return ok(textureHandle(this.owner, id));
  }
  createBuffer(label, descriptor) {
    const writable = this.ensureWritable();
    if (!writable.ok) return writable;
    const unique = this.reserveLabel(label);
    if (!unique.ok) return unique;
    const id = this.nextId++;
    this.resources.set(id, { id, label, kind: "buffer", origin: "created", descriptor });
    return ok(bufferHandle(this.owner, id));
  }
  importBuffer(label, descriptor, resolve) {
    const writable = this.ensureWritable();
    if (!writable.ok) return writable;
    const unique = this.reserveLabel(label);
    if (!unique.ok) return unique;
    const id = this.nextId++;
    this.resources.set(id, {
      id,
      label,
      kind: "buffer",
      origin: "imported",
      descriptor,
      resolve
    });
    return ok(bufferHandle(this.owner, id));
  }
  view(texture, descriptor = {}) {
    const writable = this.ensureWritable();
    if (!writable.ok) return writable;
    const data = handleData(texture);
    if (data?.kind !== "texture" || data.owner !== this.owner) {
      return err(this.foreignHandleError());
    }
    const textureRecord = this.resources.get(data.id);
    if (textureRecord?.kind !== "texture") return err(this.foreignHandleError());
    const label = descriptor.label ?? `${textureRecord.label}.view.${this.nextId}`;
    const unique = this.reserveLabel(label);
    if (!unique.ok) return unique;
    const id = this.nextId++;
    this.views.set(id, { id, label, textureId: data.id, descriptor });
    return ok(textureViewHandle(this.owner, id, data.id));
  }
  importView(texture, descriptor, resolve) {
    const writable = this.ensureWritable();
    if (!writable.ok) return writable;
    const data = handleData(texture);
    if (data?.kind !== "texture" || data.owner !== this.owner) {
      return err(this.foreignHandleError());
    }
    const textureRecord = this.resources.get(data.id);
    if (textureRecord?.kind !== "texture" || textureRecord.origin !== "imported") {
      return err(
        new RenderGraphError({
          code: "resource-descriptor-invalid",
          expected: "an imported view belongs to an imported texture",
          hint: "use view() for graph-created textures and importView() for host-owned views",
          detail: {
            resourceLabel: textureRecord?.label ?? "foreign",
            field: "origin",
            expected: "imported",
            actual: textureRecord?.origin ?? "foreign"
          }
        })
      );
    }
    const label = descriptor.label ?? `${textureRecord.label}.view.${this.nextId}`;
    const unique = this.reserveLabel(label);
    if (!unique.ok) return unique;
    const id = this.nextId++;
    this.views.set(id, { id, label, textureId: data.id, descriptor, resolve });
    return ok(textureViewHandle(this.owner, id, data.id));
  }
  addRasterPass(name, descriptor) {
    return this.addPass(name, { kind: "raster", descriptor });
  }
  addComputePass(name, descriptor) {
    return this.addPass(name, { kind: "compute", descriptor });
  }
  addCopyPass(name, descriptor) {
    return this.addPass(name, { kind: "copy", descriptor });
  }
  compile(options) {
    const writable = this.ensureWritable();
    if (!writable.ok) return writable;
    this.sealed = true;
    const descriptors = this.validateDescriptors(options.surfaceSize);
    if (!descriptors.ok) return descriptors;
    const analyzed = this.analyze(options.device.caps);
    if (!analyzed.ok) return analyzed;
    const allocated = this.allocate(
      options,
      analyzed.value.usageByResource,
      analyzed.value.firstUseByResource,
      analyzed.value.lastUseByResource
    );
    if (!allocated.ok) return allocated;
    const generation = nextGeneration;
    const physicalAllocationKeys = /* @__PURE__ */ new WeakMap();
    let nextPhysicalAllocationKey = 1;
    const physicalKey = (resource) => {
      const handle = resource.texture ?? resource.buffer;
      if (handle === void 0) return void 0;
      const existing = physicalAllocationKeys.get(handle);
      if (existing !== void 0) return existing;
      const key = `allocation-${nextPhysicalAllocationKey++}`;
      physicalAllocationKeys.set(handle, key);
      return key;
    };
    const info = freezeInfo({
      generation,
      passes: analyzed.value.passes.map((pass, executionIndex) => ({
        name: pass.name,
        kind: pass.pass.kind,
        executionIndex,
        accesses: pass.pass.descriptor.accesses.map((access) => {
          const id = accessResourceId(access);
          return {
            resource: this.resources.get(id ?? -1)?.label ?? "foreign",
            usage: access.usage
          };
        }),
        dependencies: pass.dependencies.map(
          (dependency) => analyzed.value.passes[dependency]?.name ?? "unknown"
        )
      })),
      resources: [...allocated.value.resources.values()].map((resource) => {
        const texture = resource.record.kind === "texture" ? resource.record.descriptor : void 0;
        const buffer = resource.record.kind === "buffer" ? resource.record.descriptor : void 0;
        const allocationKey = physicalKey(resource);
        const extent = texture === void 0 ? void 0 : this.resolveExtent(texture.size, options.surfaceSize);
        const knownByteSize = resource.record.origin === "imported" || resource.usage === 0 ? void 0 : texture === void 0 ? buffer?.size : textureByteSize(
          texture.format,
          texture.dimension ?? "2d",
          this.resolveExtent(texture.size, options.surfaceSize),
          texture.mipLevelCount ?? 1,
          texture.sampleCount ?? 1
        );
        const byteSizeUnknownReason = resource.record.origin === "imported" ? "imported-owner" : resource.usage === 0 ? "not-allocated" : knownByteSize === void 0 ? "format-or-layout-unknown" : void 0;
        return {
          label: resource.record.label,
          kind: resource.record.kind,
          origin: resource.record.origin,
          descriptor: texture === void 0 ? {
            kind: "buffer",
            size: buffer?.size ?? 0
          } : {
            kind: "texture",
            format: texture.format,
            ...texture.domain === void 0 ? {} : { domain: texture.domain },
            size: texture.size,
            width: extent?.width ?? 1,
            height: extent?.height ?? 1,
            depthOrArrayLayers: extent?.depthOrArrayLayers ?? 1,
            mipLevelCount: texture.mipLevelCount ?? 1,
            sampleCount: texture.sampleCount ?? 1
          },
          firstUse: resource.firstUse,
          lastUse: resource.lastUse,
          derivedUsage: resource.usage,
          ...allocationKey === void 0 ? {} : { physicalAllocationKey: allocationKey },
          ...texture === void 0 ? {} : { format: texture.format },
          ...knownByteSize === void 0 ? {} : { byteSize: knownByteSize },
          ...byteSizeUnknownReason === void 0 ? {} : { byteSizeUnknownReason },
          ...texture === void 0 ? {} : {
            dimension: texture.dimension ?? "2d",
            extent
          }
        };
      })
    });
    const colorTargetDescriptors = /* @__PURE__ */ new Map();
    for (const resource of allocated.value.resources.values()) {
      if (resource.record.kind !== "texture" || resource.texture === void 0) continue;
      const extent = this.resolveExtent(resource.record.descriptor.size, options.surfaceSize);
      colorTargetDescriptors.set(resource.record.label, {
        texture: resource.texture,
        format: resource.record.descriptor.format,
        size: { width: extent.width, height: extent.height },
        usage: resource.usage,
        sample: resource.record.descriptor.sampleCount ?? 1
      });
    }
    return ok(
      new CompiledRenderGraphImpl(
        nextGeneration++,
        this.owner,
        options.device,
        allocated.value.resources,
        allocated.value.views,
        Object.freeze(analyzed.value.passes),
        info,
        colorTargetDescriptors
      )
    );
  }
  addPass(name, pass) {
    const writable = this.ensureWritable();
    if (!writable.ok) return writable;
    if (this.passNames.has(name)) {
      return err(
        new RenderGraphError({
          code: "duplicate-pass-name",
          expected: `pass name '${name}' is unique within one builder`,
          hint: `rename the second '${name}' pass; names are diagnostics, not identity`,
          detail: { passName: name }
        })
      );
    }
    for (const access of pass.descriptor.accesses) {
      const valid = this.validateAccessHandle(name, access);
      if (!valid.ok) return valid;
    }
    this.passNames.add(name);
    this.passes.push({ id: this.passes.length, name, pass });
    return ok(void 0);
  }
  validateAccessHandle(passName, access) {
    const data = handleData(access.resource);
    if (data === void 0 || data.owner !== this.owner) {
      return err(this.foreignHandleError(passName));
    }
    if (data.kind === "texture-view") {
      if (!this.views.has(data.id)) return err(this.foreignHandleError(passName));
      return ok(void 0);
    }
    if (data.kind !== "buffer" || !this.resources.has(data.id)) {
      return err(this.foreignHandleError(passName));
    }
    return ok(void 0);
  }
  analyze(caps) {
    const usageByResource = /* @__PURE__ */ new Map();
    const firstUseByResource = /* @__PURE__ */ new Map();
    const lastUseByResource = /* @__PURE__ */ new Map();
    const compiledPasses = [];
    const history = [];
    for (const resource of this.resources.values()) {
      if (resource.kind !== "texture" || resource.origin !== "created") continue;
      const usage = resource.descriptor.usage ?? 0;
      if (usage !== 0) usageByResource.set(resource.id, usage);
    }
    for (let passIndex = 0; passIndex < this.passes.length; passIndex++) {
      const pass = this.passes[passIndex];
      if (pass === void 0) continue;
      const capability = this.validateCapabilities(pass, caps);
      if (!capability.ok) return capability;
      const normalized = [];
      for (const access of pass.pass.descriptor.accesses) {
        const item = this.normalizeAccess(passIndex, pass, access);
        if (!item.ok) return item;
        normalized.push(item.value);
        const resource = this.resources.get(item.value.resourceId);
        const usage = (resource?.kind === "texture" && resource.origin === "created" ? resource.descriptor.usage ?? 0 : 0) | (resource?.kind === "buffer" ? bufferUsage(access.usage) : textureUsage(access.usage));
        usageByResource.set(
          item.value.resourceId,
          (usageByResource.get(item.value.resourceId) ?? 0) | usage
        );
        if (!firstUseByResource.has(item.value.resourceId)) {
          firstUseByResource.set(item.value.resourceId, passIndex);
        }
        lastUseByResource.set(item.value.resourceId, passIndex);
      }
      const conflict = this.validatePassAccesses(pass, normalized);
      if (!conflict.ok) return conflict;
      const attachments = this.validateAttachments(pass);
      if (!attachments.ok) return attachments;
      const dependencies = /* @__PURE__ */ new Set();
      for (const current of normalized) {
        if (current.read) {
          const priorWrite = this.findPriorWrite(history, current);
          if (priorWrite !== void 0) {
            dependencies.add(priorWrite.passIndex);
          } else if (this.resources.get(current.resourceId)?.origin === "created") {
            const label = this.resources.get(current.resourceId)?.label;
            return err(
              new RenderGraphError({
                code: "uninitialized-read",
                expected: `graph-created resource '${label}' is written before pass '${pass.name}' reads it`,
                hint: "add a clear/write/copy-dst pass before the first read, or import initialized data",
                detail: { passName: pass.name, resourceLabel: label, usage: current.usage }
              })
            );
          }
        }
        if (current.write) {
          for (const dependency of this.findWriteDependencies(history, current)) {
            dependencies.add(dependency);
          }
        }
      }
      history.push(...normalized);
      compiledPasses.push({
        ...pass,
        dependencies: Object.freeze([...dependencies].sort((left, right) => left - right)),
        resourceIds: new Set(normalized.map((access) => access.resourceId)),
        viewIds: new Set(
          normalized.flatMap((access) => access.viewId === void 0 ? [] : [access.viewId])
        )
      });
    }
    for (const [resourceId, usage] of usageByResource) {
      const resource = this.resources.get(resourceId);
      if (resource?.origin !== "imported") continue;
      if ((resource.descriptor.usage & usage) !== usage) {
        return err(
          new RenderGraphError({
            code: "import-usage-mismatch",
            expected: `imported resource '${resource.label}' physical usage contains derived graph usage ${usage}`,
            hint: "recreate the imported resource with every usage declared by graph accesses",
            detail: {
              resourceLabel: resource.label,
              field: "usage",
              expected: String(usage),
              actual: resource.descriptor.usage
            }
          })
        );
      }
    }
    return ok({
      passes: compiledPasses,
      usageByResource,
      firstUseByResource,
      lastUseByResource
    });
  }
  normalizeAccess(passIndex, pass, access) {
    const passName = pass.name;
    const data = handleData(access.resource);
    if (data === void 0 || data.owner !== this.owner) {
      return err(this.foreignHandleError(passName));
    }
    const mode = this.accessModeForPass(pass, access);
    if (data.kind === "buffer") {
      return ok({ passIndex, passName, resourceId: data.id, usage: access.usage, ...mode });
    }
    if (data.kind !== "texture-view") return err(this.foreignHandleError(passName));
    const view = this.views.get(data.id);
    const texture = this.resources.get(data.textureId);
    if (view === void 0 || texture?.kind !== "texture") {
      return err(this.foreignHandleError(passName));
    }
    const mipLevels = texture.descriptor.mipLevelCount ?? 1;
    const layers = typeof texture.descriptor.size === "object" ? texture.descriptor.size.depthOrArrayLayers ?? 1 : 1;
    const mipStart = view.descriptor.baseMipLevel ?? 0;
    const layerStart = view.descriptor.baseArrayLayer ?? 0;
    return ok({
      passIndex,
      passName,
      resourceId: data.textureId,
      viewId: data.id,
      usage: access.usage,
      ...mode,
      range: {
        mipStart,
        mipEnd: mipStart + (view.descriptor.mipLevelCount ?? mipLevels - mipStart),
        layerStart,
        layerEnd: layerStart + (view.descriptor.arrayLayerCount ?? layers - layerStart),
        aspect: view.descriptor.aspect ?? "all"
      }
    });
  }
  accessModeForPass(pass, access) {
    const base = accessMode(access.usage);
    if (pass.pass.kind !== "raster" || handleData(access.resource)?.kind !== "texture-view") {
      return base;
    }
    if (access.usage === "color-attachment") {
      const attachment = pass.pass.descriptor.colorAttachments.find(
        (candidate) => candidate.view === access.resource
      );
      return attachment?.loadOp === "load" ? { read: true, write: true } : base;
    }
    if (access.usage === "depth-stencil-write") {
      const attachment = pass.pass.descriptor.depthStencilAttachment;
      if (attachment?.view === access.resource && (attachment.depthLoadOp === "load" || attachment.stencilLoadOp === "load")) {
        return { read: true, write: true };
      }
    }
    return base;
  }
  validateCapabilities(pass, caps) {
    if (pass.pass.kind === "compute" && !caps.compute) {
      return this.capabilityError(pass.name, "compute");
    }
    for (const access of pass.pass.descriptor.accesses) {
      if ((access.usage === "storage-read" || access.usage === "storage-write" || access.usage === "storage-read-write") && handleData(access.resource)?.kind === "buffer" && !caps.storageBuffer) {
        return this.capabilityError(pass.name, "storage-buffer", access);
      }
      if ((access.usage === "storage-read" || access.usage === "storage-write" || access.usage === "storage-read-write" || access.usage === "sampled-storage-read-write" || access.usage === "sampled-storage-write") && handleData(access.resource)?.kind === "texture-view" && !caps.storageTexture) {
        return this.capabilityError(pass.name, "storage-texture", access);
      }
      if (access.usage === "indirect-read" && !caps.indirectDrawing) {
        return this.capabilityError(pass.name, "indirect", access);
      }
    }
    return ok(void 0);
  }
  capabilityError(passName, capability, access) {
    const resourceId = access === void 0 ? void 0 : accessResourceId(access);
    return err(
      new RenderGraphError({
        code: "capability-missing",
        expected: `pass '${passName}' is built only when capability '${capability}' is available`,
        hint: "select the fallback algorithm before adding this pass to the builder",
        detail: {
          passName,
          capability,
          ...resourceId === void 0 ? {} : { resourceLabel: this.resources.get(resourceId)?.label, usage: access?.usage }
        }
      })
    );
  }
  validatePassAccesses(pass, accesses) {
    for (let leftIndex = 0; leftIndex < accesses.length; leftIndex++) {
      const left = accesses[leftIndex];
      if (left === void 0) continue;
      for (let rightIndex = leftIndex + 1; rightIndex < accesses.length; rightIndex++) {
        const right = accesses[rightIndex];
        if (right === void 0 || left.resourceId !== right.resourceId || !rangesOverlap(left.range, right.range)) {
          continue;
        }
        if (!left.write && !right.write) continue;
        if (left.usage === right.usage && (left.usage === "storage-read-write" || left.usage === "sampled-storage-read-write"))
          continue;
        const label = this.resources.get(left.resourceId)?.label;
        return err(
          new RenderGraphError({
            code: "access-conflict",
            expected: `pass '${pass.name}' uses resource '${label}' in one compatible WebGPU usage scope`,
            hint: "split conflicting read/write roles into ordered passes or use storage-read-write once",
            detail: {
              passName: pass.name,
              resourceLabel: label,
              accesses: [left.usage, right.usage]
            }
          })
        );
      }
    }
    if (pass.pass.kind !== "compute") {
      const invalid = accesses.find((access) => access.usage === "sampled-storage-write");
      if (invalid !== void 0) {
        return err(
          new RenderGraphError({
            code: "access-conflict",
            expected: `pass '${pass.name}' uses ordered compute dispatches for sampled-storage-write`,
            hint: "move the write-then-sample chain into a compute pass",
            detail: { passName: pass.name, usage: invalid.usage }
          })
        );
      }
    }
    if (pass.pass.kind === "copy") {
      const invalid = accesses.find(
        (access) => access.usage !== "copy-src" && access.usage !== "copy-dst"
      );
      if (invalid !== void 0) {
        return err(
          new RenderGraphError({
            code: "access-conflict",
            expected: `copy pass '${pass.name}' declares only copy-src/copy-dst accesses`,
            hint: "move shader or attachment work into raster/compute passes",
            detail: { passName: pass.name, usage: invalid.usage }
          })
        );
      }
    }
    return ok(void 0);
  }
  validateAttachments(pass) {
    if (pass.pass.kind !== "raster") return ok(void 0);
    const accesses = pass.pass.descriptor.accesses;
    const has = (view, usage) => accesses.some((access) => access.resource === view && access.usage === usage);
    for (const attachment of pass.pass.descriptor.colorAttachments) {
      if (!has(attachment.view, "color-attachment")) {
        return this.missingAttachmentAccess(pass.name, attachment.view, "color-attachment");
      }
      if (attachment.resolveTarget !== void 0 && !has(attachment.resolveTarget, "color-attachment")) {
        return this.missingAttachmentAccess(
          pass.name,
          attachment.resolveTarget,
          "color-attachment"
        );
      }
    }
    const depth = pass.pass.descriptor.depthStencilAttachment;
    if (depth !== void 0) {
      const usage = depth.depthReadOnly === true ? "depth-stencil-read" : "depth-stencil-write";
      if (!has(depth.view, usage))
        return this.missingAttachmentAccess(pass.name, depth.view, usage);
    }
    return ok(void 0);
  }
  missingAttachmentAccess(passName, view, usage) {
    const data = handleData(view);
    const label = data?.kind === "texture-view" ? this.views.get(data.id)?.label : void 0;
    return err(
      new RenderGraphError({
        code: "resource-not-declared-by-pass",
        expected: `raster pass '${passName}' attachment '${label}' declares '${usage}' access`,
        hint: "add the attachment view and matching usage to accesses",
        detail: { passName, resourceLabel: label, usage }
      })
    );
  }
  findPriorWrite(history, current) {
    for (let index = history.length - 1; index >= 0; index--) {
      const prior = history[index];
      if (prior !== void 0 && prior.resourceId === current.resourceId && prior.write && rangesOverlap(prior.range, current.range)) {
        return prior;
      }
    }
    return void 0;
  }
  findWriteDependencies(history, current) {
    const dependencies = /* @__PURE__ */ new Set();
    for (let index = history.length - 1; index >= 0; index--) {
      const prior = history[index];
      if (prior === void 0 || prior.resourceId !== current.resourceId || !rangesOverlap(prior.range, current.range)) {
        continue;
      }
      if (prior.read) dependencies.add(prior.passIndex);
      if (prior.write) {
        dependencies.add(prior.passIndex);
        break;
      }
    }
    return [...dependencies];
  }
  validateDescriptors(surfaceSize) {
    if (surfaceSize.width <= 0 || surfaceSize.height <= 0) {
      return err(
        new RenderGraphError({
          code: "resource-descriptor-invalid",
          expected: "surfaceSize width and height are positive integers",
          hint: "compile after the render surface has a non-zero physical extent",
          detail: {
            resourceLabel: "surface",
            field: "surfaceSize",
            expected: "width > 0 and height > 0",
            actual: `${surfaceSize.width}x${surfaceSize.height}`
          }
        })
      );
    }
    for (const resource of this.resources.values()) {
      if (resource.kind === "buffer" && resource.descriptor.size <= 0) {
        return err(
          new RenderGraphError({
            code: "resource-descriptor-invalid",
            expected: `buffer '${resource.label}' size is greater than zero`,
            hint: "derive a positive byte size before creating/importing the buffer",
            detail: {
              resourceLabel: resource.label,
              field: "size",
              expected: "size > 0",
              actual: resource.descriptor.size
            }
          })
        );
      }
      if (resource.kind === "texture") {
        const extent = this.resolveExtent(resource.descriptor.size, surfaceSize);
        if (extent.width <= 0 || extent.height <= 0 || extent.depthOrArrayLayers <= 0) {
          return err(
            new RenderGraphError({
              code: "resource-descriptor-invalid",
              expected: `texture '${resource.label}' extent is positive`,
              hint: "repair the authored extent or compile surface size",
              detail: {
                resourceLabel: resource.label,
                field: "size",
                expected: "all extent axes > 0",
                actual: `${extent.width}x${extent.height}x${extent.depthOrArrayLayers}`
              }
            })
          );
        }
      }
    }
    for (const view of this.views.values()) {
      const texture = this.resources.get(view.textureId);
      if (texture?.kind !== "texture") continue;
      const allocationDimension = texture.descriptor.dimension ?? "2d";
      const viewDimension = view.descriptor.dimension;
      if (!isTextureViewDimensionCompatible(allocationDimension, viewDimension)) {
        return err(
          new RenderGraphError({
            code: "resource-descriptor-invalid",
            expected: `texture '${texture.label}' view dimension matches allocation dimension`,
            hint: "use a 3d view only for a 3d allocation and preserve array views on 2d allocations",
            detail: {
              resourceLabel: texture.label,
              field: "dimension",
              expected: allocationDimension,
              actual: viewDimension ?? "2d"
            }
          })
        );
      }
    }
    return ok(void 0);
  }
  allocate(options, usageByResource, firstUseByResource, lastUseByResource) {
    const compiledResources = /* @__PURE__ */ new Map();
    const compiledViews = /* @__PURE__ */ new Map();
    const createdTextures = [];
    const createdBuffers = [];
    const discard = () => {
      for (const texture of createdTextures) options.device.destroyTexture(texture);
      for (const buffer of createdBuffers) options.device.destroyBuffer(buffer);
    };
    for (const resource of this.resources.values()) {
      const usage = usageByResource.get(resource.id) ?? 0;
      let texture;
      let buffer;
      if (resource.origin === "created" && usage !== 0) {
        if (resource.kind === "texture") {
          const extent = this.resolveExtent(resource.descriptor.size, options.surfaceSize);
          const created = options.device.createTexture({
            label: resource.label,
            size: extent,
            mipLevelCount: resource.descriptor.mipLevelCount ?? 1,
            sampleCount: resource.descriptor.sampleCount ?? 1,
            dimension: resource.descriptor.dimension ?? "2d",
            format: resource.descriptor.format,
            usage,
            viewFormats: [...resource.descriptor.viewFormats ?? []]
          });
          if (!created.ok) {
            discard();
            return err(
              new RenderGraphError({
                code: "resource-allocation-failed",
                expected: `RHI creates graph texture '${resource.label}'`,
                hint: "inspect detail.rhiCode and repair the descriptor/capability route",
                detail: { resourceKey: resource.label, rhiCode: created.error.code }
              })
            );
          }
          texture = created.value;
          createdTextures.push(texture);
        } else {
          const created = options.device.createBuffer({
            label: resource.label,
            size: resource.descriptor.size,
            usage,
            mappedAtCreation: resource.descriptor.mappedAtCreation ?? false
          });
          if (!created.ok) {
            discard();
            return err(
              new RenderGraphError({
                code: "resource-allocation-failed",
                expected: `RHI creates graph buffer '${resource.label}'`,
                hint: "inspect detail.rhiCode and repair the descriptor/capability route",
                detail: { resourceKey: resource.label, rhiCode: created.error.code }
              })
            );
          }
          buffer = created.value;
          createdBuffers.push(buffer);
        }
      }
      compiledResources.set(resource.id, {
        record: resource,
        usage,
        firstUse: firstUseByResource.get(resource.id) ?? null,
        lastUse: lastUseByResource.get(resource.id) ?? null,
        ...texture === void 0 ? {} : { texture },
        ...buffer === void 0 ? {} : { buffer }
      });
    }
    for (const view of this.views.values()) {
      const resource = compiledResources.get(view.textureId);
      let physicalView;
      if (resource?.record.origin === "created" && resource.texture !== void 0) {
        const created = options.device.createTextureView(resource.texture, view.descriptor);
        if (!created.ok) {
          discard();
          return err(
            new RenderGraphError({
              code: "resource-allocation-failed",
              expected: `RHI creates graph texture view '${view.label}'`,
              hint: "inspect detail.rhiCode and repair the view descriptor",
              detail: { resourceKey: view.label, rhiCode: created.error.code }
            })
          );
        }
        physicalView = created.value;
      }
      compiledViews.set(view.id, {
        record: view,
        ...physicalView === void 0 ? {} : { view: physicalView }
      });
    }
    return ok({ resources: compiledResources, views: compiledViews });
  }
  resolveExtent(extent, surface) {
    if (extent === "surface") return { ...surface, depthOrArrayLayers: 1 };
    if (extent === "half-surface") {
      return {
        width: Math.ceil(surface.width / 2),
        height: Math.ceil(surface.height / 2),
        depthOrArrayLayers: 1
      };
    }
    return {
      width: extent.width,
      height: extent.height,
      depthOrArrayLayers: extent.depthOrArrayLayers ?? 1
    };
  }
  ensureWritable() {
    return this.sealed ? err(
      new RenderGraphError({
        code: "builder-sealed",
        expected: "a RenderGraphBuilder accepts declarations only before compile()",
        hint: "create a new builder for a changed topology",
        detail: {}
      })
    ) : ok(void 0);
  }
  reserveLabel(label) {
    if (this.labels.has(label)) {
      return err(
        new RenderGraphError({
          code: "duplicate-resource-label",
          expected: `resource label '${label}' is unique within one builder`,
          hint: `rename the second '${label}' declaration`,
          detail: { resourceLabel: label }
        })
      );
    }
    this.labels.add(label);
    return ok(void 0);
  }
  foreignHandleError(passName) {
    return new RenderGraphError({
      code: "foreign-resource-handle",
      expected: "every graph resource handle belongs to this builder",
      hint: "create/import/view the resource on the same builder that declares the pass",
      detail: { ...passName === void 0 ? {} : { passName } }
    });
  }
};

// src/observation.ts
var COPY_SRC = 1;
function observationError(code, expected, hint) {
  return err(new RenderGraphError({ code, expected, hint }));
}
function createCurrentFrameObservationLease(descriptor, currentFrameId) {
  if (descriptor.texture === void 0 || descriptor.texture === null) {
    return observationError(
      "observation-absent",
      "a producer-owned texture handle",
      "provide the current frame color texture before requesting an observation"
    );
  }
  if (descriptor.format !== "rgba16float") {
    return observationError(
      "observation-invalid-format",
      "current-frame observation format 'rgba16float'",
      "use the producer target format without reinterpretation"
    );
  }
  if (!Number.isInteger(descriptor.size.width) || !Number.isInteger(descriptor.size.height) || descriptor.size.width <= 0 || descriptor.size.height <= 0) {
    return observationError(
      "observation-invalid-size",
      "positive integer observation width and height",
      "capture a non-empty current-frame target"
    );
  }
  if ((descriptor.usage & COPY_SRC) === 0) {
    return observationError(
      "observation-missing-copy-src",
      "current-frame texture usage includes COPY_SRC",
      "add COPY_SRC to the producer target before requesting readback"
    );
  }
  if (descriptor.frameId !== currentFrameId) {
    return observationError(
      "observation-stale",
      `observation frame ${currentFrameId}`,
      `discard frame ${descriptor.frameId} and request the current producer target`
    );
  }
  let state = "active";
  const lifetime = {
    frameId: descriptor.frameId,
    get state() {
      return state;
    }
  };
  const lease = {
    descriptor,
    lifetime,
    get state() {
      return state;
    },
    beginReadback() {
      if (state === "retired") {
        return err(
          new RenderGraphError({
            code: "observation-retired",
            expected: "active current-frame observation lease",
            hint: "submit the eager copy before the producer retires this frame"
          })
        );
      }
      return ok({ texture: descriptor.texture, descriptor, lifetime });
    },
    retire() {
      state = "retired";
    }
  };
  return ok(lease);
}

// src/pass-registry.ts
var PassRegistry = class {
  passes = [];
  add(name, descriptor, before) {
    if (this.passes.some((pass) => pass.name === name)) {
      throw new RenderGraphError({
        code: "duplicate-pass-name",
        expected: `pass name '${name}' is unique within one graph`,
        hint: `rename the second '${name}' pass; labels are diagnostics, not identity`,
        detail: { passName: name }
      });
    }
    const entry = { name, descriptor };
    const beforeIndex = before === void 0 ? -1 : this.passes.findIndex((pass) => pass.name === before);
    if (beforeIndex < 0) this.passes.push(entry);
    else this.passes.splice(beforeIndex, 0, entry);
    return entry;
  }
  list() {
    return this.passes;
  }
  count() {
    return this.passes.length;
  }
};

// src/pipeline/color-value-domain.ts
var COLOR_VALUE_DOMAINS = ["linear-hdr", "linear-ldr", "display-encoded"];
function isColorValueDomain(value) {
  return typeof value === "string" && COLOR_VALUE_DOMAINS.includes(value);
}
function invalidDomain(value) {
  return new RenderGraphError({
    code: "invalid-color-domain",
    expected: `domain is one of ${COLOR_VALUE_DOMAINS.join(", ")}`,
    hint: "set an explicit color domain; do not infer it from the attachment format",
    detail: { value: String(value) }
  });
}
function missingDomain(resourceKey) {
  return new RenderGraphError({
    code: "missing-color-domain",
    expected: "every connected color resource has an explicit domain",
    hint: `add domain to the color resource descriptor${resourceKey === void 0 ? "" : ` '${resourceKey}'`}`,
    detail: { resourceKey: resourceKey ?? "<descriptor>" }
  });
}
function serializeColorValueDomain(domain) {
  if (!isColorValueDomain(domain)) throw invalidDomain(domain);
  return JSON.stringify(domain);
}
function deserializeColorValueDomain(value) {
  let candidate = value;
  if (typeof value === "string") {
    try {
      candidate = JSON.parse(value);
    } catch {
      candidate = value;
    }
  }
  return isColorValueDomain(candidate) ? ok(candidate) : err(invalidDomain(candidate));
}
function serializeColorResourceDescriptor(descriptor) {
  if (!isColorValueDomain(descriptor.domain)) throw invalidDomain(descriptor.domain);
  return JSON.stringify(descriptor);
}
function deserializeColorResourceDescriptor(value) {
  if (typeof value !== "object" || value === null) return err(missingDomain());
  const candidate = value;
  if (candidate.domain === void 0) return err(missingDomain());
  if (!isColorValueDomain(candidate.domain)) return err(invalidDomain(candidate.domain));
  if (typeof candidate.format !== "string" || candidate.format.length === 0) {
    return err(
      new RenderGraphError({
        code: "invalid-color-domain",
        expected: "color resource descriptor includes a non-empty format",
        hint: "set format separately from the explicit color domain",
        detail: { value: String(candidate.format) }
      })
    );
  }
  return ok({ domain: candidate.domain, format: candidate.format });
}
function conversionMatches(source, destination, conversion) {
  if (conversion.kind === "encode-srgb") {
    return (source === "linear-hdr" || source === "linear-ldr") && destination === "display-encoded";
  }
  if (conversion.kind === "decode-srgb") {
    return source === "display-encoded" && (destination === "linear-hdr" || destination === "linear-ldr");
  }
  return source === "linear-hdr" && (destination === "linear-ldr" || destination === "display-encoded");
}
function validateColorDomainConnection(source, destination, conversion) {
  if (source === void 0 || source === null) return { ok: false, error: missingDomain("source") };
  if (destination === void 0 || destination === null) {
    return { ok: false, error: missingDomain("destination") };
  }
  if (!isColorValueDomain(source)) return { ok: false, error: invalidDomain(source) };
  if (!isColorValueDomain(destination)) return { ok: false, error: invalidDomain(destination) };
  if (source === destination) return { ok: true };
  if (conversion !== void 0 && conversionMatches(source, destination, conversion)) {
    return { ok: true };
  }
  return {
    ok: false,
    error: new RenderGraphError({
      code: "color-domain-mismatch",
      expected: `source and destination share a domain or use an explicit valid conversion (${source} -> ${destination})`,
      hint: "insert an explicit linear blend or output encoding pass; never mix into an encoded destination",
      detail: { sourceDomain: source, destinationDomain: destination }
    })
  };
}

// src/graph.ts
function poolKey(meta) {
  return `${meta.format}:${meta.width}x${meta.height}:${meta.usage}:${meta.sample}:${JSON.stringify(meta.viewFormats)}`;
}
var VALID_GPU_TEXTURE_FORMATS = [
  "r8unorm",
  "r8snorm",
  "r8uint",
  "r8sint",
  "r16unorm",
  "r16snorm",
  "r16uint",
  "r16sint",
  "r16float",
  "rg8unorm",
  "rg8snorm",
  "rg8uint",
  "rg8sint",
  "r32uint",
  "r32sint",
  "r32float",
  "rg16unorm",
  "rg16snorm",
  "rg16uint",
  "rg16sint",
  "rg16float",
  "rgba8unorm",
  "rgba8unorm-srgb",
  "rgba8snorm",
  "rgba8uint",
  "rgba8sint",
  "bgra8unorm",
  "bgra8unorm-srgb",
  "rgb9e5ufloat",
  "rgb10a2uint",
  "rgb10a2unorm",
  "rg11b10ufloat",
  "rg32uint",
  "rg32sint",
  "rg32float",
  "rgba16unorm",
  "rgba16snorm",
  "rgba16uint",
  "rgba16sint",
  "rgba16float",
  "rgba32uint",
  "rgba32sint",
  "rgba32float",
  "stencil8",
  "depth16unorm",
  "depth24plus",
  "depth24plus-stencil8",
  "depth32float",
  "depth32float-stencil8",
  "bc1-rgba-unorm",
  "bc1-rgba-unorm-srgb",
  "bc2-rgba-unorm",
  "bc2-rgba-unorm-srgb",
  "bc3-rgba-unorm",
  "bc3-rgba-unorm-srgb",
  "bc4-r-unorm",
  "bc4-r-snorm",
  "bc5-rg-unorm",
  "bc5-rg-snorm",
  "bc6h-rgb-ufloat",
  "bc6h-rgb-float",
  "bc7-rgba-unorm",
  "bc7-rgba-unorm-srgb",
  "etc2-rgb8unorm",
  "etc2-rgb8unorm-srgb",
  "etc2-rgb8a1unorm",
  "etc2-rgb8a1unorm-srgb",
  "etc2-rgba8unorm",
  "etc2-rgba8unorm-srgb",
  "eac-r11unorm",
  "eac-r11snorm",
  "eac-rg11unorm",
  "eac-rg11snorm",
  "astc-4x4-unorm",
  "astc-4x4-unorm-srgb",
  "astc-5x4-unorm",
  "astc-5x4-unorm-srgb",
  "astc-5x5-unorm",
  "astc-5x5-unorm-srgb",
  "astc-6x5-unorm",
  "astc-6x5-unorm-srgb",
  "astc-6x6-unorm",
  "astc-6x6-unorm-srgb",
  "astc-8x5-unorm",
  "astc-8x5-unorm-srgb",
  "astc-8x6-unorm",
  "astc-8x6-unorm-srgb",
  "astc-8x8-unorm",
  "astc-8x8-unorm-srgb",
  "astc-10x5-unorm",
  "astc-10x5-unorm-srgb",
  "astc-10x6-unorm",
  "astc-10x6-unorm-srgb",
  "astc-10x8-unorm",
  "astc-10x8-unorm-srgb",
  "astc-10x10-unorm",
  "astc-10x10-unorm-srgb",
  "astc-12x10-unorm",
  "astc-12x10-unorm-srgb",
  "astc-12x12-unorm",
  "astc-12x12-unorm-srgb"
];
var VALID_GPU_TEXTURE_FORMAT_SET = new Set(VALID_GPU_TEXTURE_FORMATS);
var RenderGraph = class {
  resources = new ResourceRegistry();
  passes = new PassRegistry();
  compiled = null;
  /** Transient texture pool: keyed by descriptor, reused across compiles (D-2). */
  transientPool = /* @__PURE__ */ new Map();
  /**
   * Pending-destroy queue (bug-20260622): replaced textures awaiting GPU
   * retirement before actual device.destroyTexture. drainTransient(),
   * setTransientEntry(), and setPersistentEntry() push here instead of destroying immediately;
   * reclaimRetiredTransients() (called post-queue.submit in recordFrame) drains
   * the queue when the GPU signals onSubmittedWorkDone.
   */
  pendingDestroy = [];
  /** Persistent textures: keyed by resource name, kept across compiles. */
  persistentTextures = /* @__PURE__ */ new Map();
  /** Swap-chain size for resolving 'swapchain' / 'half-swapchain' sizes. */
  swapChainWidth = 800;
  swapChainHeight = 600;
  /** Last compile-time swap-chain size; diff triggers recompile-invalidation. */
  compiledWidth = 800;
  compiledHeight = 600;
  /**
   * feat-20260612 M-4 / w15: device reference stashed at compile-time so
   * drain() can release pooled textures via device.destroyTexture without
   * a separate parameter. Set by compile(); null until the first compile.
   * Render-graph stays RHI-pure (no runtime dep): the destroy bookkeeping
   * SSOT is the RHI shim, exactly as GpuTexture.destroy() routes through it.
   */
  lastDevice = null;
  /**
   * Set the current swap-chain dimensions (w7).
   * The compile allocation phase uses this to resolve 'swapchain' and
   * 'half-swapchain' size specifiers. Returns true when dimensions differ
   * from the last compile, signalling that a recompile is needed.
   */
  setSwapChainSize(width, height) {
    this.swapChainWidth = width;
    this.swapChainHeight = height;
    if (width !== this.compiledWidth || height !== this.compiledHeight) {
      return true;
    }
    return false;
  }
  /**
   * w7: resolve a color-target name to its compiled TextureView.
   * Returns the GPU view after compile, or undefined if not yet compiled
   * or the name was not registered via addColorTarget.
   */
  getColorTargetView(name) {
    return this.compiled?.resolvedTextures.get(name);
  }
  /**
   * w7: resolve a color-target name to its compiled GPU Texture handle.
   * Returns the texture after compile, or undefined if not yet compiled.
   */
  getColorTargetTexture(name) {
    return this.compiled?.resolvedTextures.get(`${name}::tex`);
  }
  getColorTargetDescriptor(name) {
    const meta = this.resources.getColorTargetMeta(name);
    const texture = this.compiled?.resolvedTextures.get(`${name}::tex`);
    if (meta === void 0 || texture === void 0) return void 0;
    return {
      texture,
      format: meta.format,
      size: {
        width: this.resolveWidth(meta.size),
        height: this.resolveHeight(meta.size)
      },
      usage: meta.usage,
      sample: meta.sample
    };
  }
  /**
   * Declare a color target alias: both names share the same physical texture.
   * The source must already be registered via addColorTarget.
   * Used for hdrComposited -> hdrColor folding (KB-1 / D-2). The returned
   * Result contains the opaque alias handle or a duplicate-resource error.
   */
  addColorTargetAlias(name, source) {
    const result = this.resources.addColorTargetAlias(name, source);
    if (!result.ok) return result;
    return ok(name);
  }
  addResource(key, descriptor) {
    return this.resources.add(key, descriptor);
  }
  /**
   * Declare a color target resource that the compiler will allocate as a
   * transient or persistent GPU texture (D-1 / D-8). A successful Result
   * contains an opaque string handle that can be referenced in pass read/write
   * arrays and resolved to a TextureView via resolve(name) inside a pass
   * execute closure. A duplicate key is rejected before registry publication.
   *
   * Omitted lifetime preserves the default `transient`; `persistent` retains
   * identity across unchanged compiles and replaces on descriptor drift.
   * format/size/sample/usage are stored on the resource entry for the compile
   * allocation phase (w6).
   */
  addColorTarget(name, desc) {
    const result = this.resources.addColorTarget(name, desc);
    if (!result.ok) return result;
    return ok(name);
  }
  addPass(name, descriptor) {
    return this.passes.add(name, descriptor);
  }
  /** @internal Renderer composition seam for declaring feature work at its semantic target. */
  _addPassBefore(name, before, descriptor) {
    return this.passes.add(name, descriptor, before);
  }
  addComputePass(name, descriptor) {
    return this.addComputePassAt(name, descriptor);
  }
  /** @internal Renderer composition seam for declaring feature work at its semantic target. */
  _addComputePassBefore(name, before, descriptor) {
    return this.addComputePassAt(name, descriptor, before);
  }
  addComputePassAt(name, descriptor, before) {
    return this.passes.add(
      name,
      {
        reads: descriptor.reads,
        writes: descriptor.writes,
        compute: true,
        storageBuffer: descriptor.storageBuffer ?? true,
        execute: (frame, resources) => {
          const encoder = frame.encoder;
          const begin = descriptor.begin?.(frame);
          let pass;
          try {
            pass = encoder.beginComputePass({
              label: name,
              ...begin?.timestampWrites === void 0 ? {} : { timestampWrites: begin.timestampWrites }
            });
          } catch (cause) {
            descriptor.onBeginError?.(frame, cause);
            return;
          }
          try {
            descriptor.encode({ pass, frame, resources });
          } finally {
            pass.end();
          }
          descriptor.after?.(frame);
        }
      },
      before
    );
  }
  /**
   * Validate a producer-scoped current-frame texture without exposing graph
   * resource names through the observation lease.
   */
  createCurrentFrameObservationLease(descriptor, currentFrameId) {
    return createCurrentFrameObservationLease(descriptor, currentFrameId);
  }
  /**
   * Compile the graph into an internalized form.
   *
   * Phases (plan-strategy 3.1):
   * 1. Cap-gate fail-fast
   * 2. Unknown-resource fail-fast (every pass read/write key is registered)
   * 3. Dangling-read fail-fast
   * 4. Preserve declaration order as the temporal authority
   * 5. Buffer-role resolution (AC-09 / D-6.1)
   * 6. GPU allocation for color targets (D-1) — when device is provided and the
   *    graph has addColorTarget resources, allocate textures via
   *    device.createTexture/createTextureView. Errors surface as
   *    'resource-alloc-failed' or 'invalid-format'.
   */
  compile(opts) {
    const passList = this.passes.list();
    const { caps, device } = opts;
    const capErr = this.validateCaps(passList, caps);
    if (capErr) return capErr;
    const colorDomainErr = this.validateColorDomains(passList);
    if (colorDomainErr) return colorDomainErr;
    const unknownErr = this.validateNoUnknownResource(passList);
    if (unknownErr) return unknownErr;
    const danglingErr = this.validateNoDanglingRead(passList);
    if (danglingErr) return danglingErr;
    const formatErr = this.validateColorTargetFormats();
    if (!formatErr.ok) return formatErr;
    const internalizedPasses = passList.map((pass) => {
      return {
        name: pass.name,
        reads: pass.descriptor.reads,
        writes: pass.descriptor.writes
      };
    });
    const resolvedBuffers = this.resolveBuffers(caps);
    const resizeDetected = this.swapChainWidth !== this.compiledWidth || this.swapChainHeight !== this.compiledHeight;
    const allocatedTextures = this.allocateColorTargets(device, resizeDetected);
    if (!allocatedTextures.ok) return allocatedTextures;
    if (resizeDetected) {
      this.drainTransient();
    }
    for (const [key, pooled] of allocatedTextures.value.transient) {
      this.setTransientEntry(key, pooled);
    }
    for (const [key, pooled] of allocatedTextures.value.persistent) {
      this.setPersistentEntry(key, pooled);
    }
    this.compiled = {
      passes: internalizedPasses,
      resolvedBuffers,
      resolvedTextures: allocatedTextures.value.resolvedTextures
    };
    this.compiledWidth = this.swapChainWidth;
    this.compiledHeight = this.swapChainHeight;
    if (device !== void 0) {
      this.lastDevice = device;
    }
    return ok(this.compiled);
  }
  /**
   * feat-20260612 M-4 / w15: release every pooled GPU texture and clear
   * the pools.
   *
   * Walks `transientPool` + `persistentTextures`, forwarding each
   * `PooledTexture.texture` opaque handle to `device.destroyTexture(...)`,
   * then clears both Maps. The destroy bookkeeping SSOT is the RHI shim
   * (architecture-principles §1 SSOT: same path GpuTexture.destroy()
   * uses); render-graph stays RHI-pure (no runtime dep).
   *
   * Plan-strategy D-7: drain covers the dispose exit path (`Renderer.dispose()`);
   * descriptor-drift replacement during compile is fenced through
   * `pendingDestroy` and `reclaimRetiredTransients()`.
   *
   * Idempotent (architecture-principles §6): a second drain on cleared
   * Maps is a no-op. drain() before any compile is also a safe no-op.
   * Per-handle errors from the RHI shim (e.g. 'destroy-after-destroy'
   * on a stale handle) are tolerated so the dispose chain can make
   * progress (mirrors gpuStore.destroyAll's swallow-and-continue
   * policy; plan-strategy D-3 / D-8). The structured error stays
   * available on the device handle for future inspector hooks.
   */
  drain() {
    const device = this.lastDevice;
    if (device === null) {
      this.transientPool.clear();
      this.persistentTextures.clear();
      this.pendingDestroy.length = 0;
      return;
    }
    for (const pooled of this.transientPool.values()) {
      try {
        device.destroyTexture(pooled.texture);
      } catch {
      }
    }
    this.transientPool.clear();
    for (const pooled of this.pendingDestroy) {
      try {
        device.destroyTexture(pooled.texture);
      } catch {
      }
    }
    this.pendingDestroy.length = 0;
    for (const pooled of this.persistentTextures.values()) {
      try {
        device.destroyTexture(pooled.texture);
      } catch {
      }
    }
    this.persistentTextures.clear();
  }
  /**
   * Relinquish every texture owned by this graph after its last frame has
   * been submitted. Unlike {@link drain}, this does not synchronously destroy
   * GPU resources: they join `pendingDestroy` and are released by
   * `reclaimRetiredTransients()` only after `onSubmittedWorkDone` resolves.
   *
   * A retired graph is no longer executable. Runtime replaces a memoized
   * per-frame graph through this entry when topology changes (rather than
   * dropping the graph and its pools), while `drain()` remains the teardown
   * path where immediate destruction is safe.
   */
  retire() {
    const device = this.lastDevice;
    if (device === null) {
      this.transientPool.clear();
      this.persistentTextures.clear();
      this.pendingDestroy.length = 0;
      this.compiled = null;
      return;
    }
    for (const pooled of this.transientPool.values()) {
      this.pendingDestroy.push(pooled);
    }
    this.transientPool.clear();
    for (const pooled of this.persistentTextures.values()) {
      this.pendingDestroy.push(pooled);
    }
    this.persistentTextures.clear();
    this.compiled = null;
  }
  /**
   * Release every transient-pool texture while keeping persistentTextures
   * intact (AC-09: resize drain, plan-strategy D-4).
   *
   * Walks `transientPool` values and forwards each `PooledTexture.texture`
   * opaque handle to `device.destroyTexture(...)`, then clears the transient
   * pool. Mirror of `drain()` but scoped to the transient pool only.
   *
   * Persistent textures survive `drainTransient` — they are only released by
   * the full `drain()` on teardown. `drainTransient` is an internal helper
   * called by `compile()` when swap-chain size changes; it is NOT a public API
   * (callers should use `drain()` for teardown).
   *
   * Idempotent (architecture-principles §6): a second drainTransient on an
   * already-cleared transient pool is a no-op.
   */
  drainTransient() {
    const device = this.lastDevice;
    if (device === null) {
      this.transientPool.clear();
      return;
    }
    for (const pooled of this.transientPool.values()) {
      this.pendingDestroy.push(pooled);
    }
    this.transientPool.clear();
  }
  /**
   * Guarded transient pool insert (AC-08, plan-strategy D-4).
   *
   * Before overwriting a key in the transient pool, destroys the old pooled
   * texture via `device.destroyTexture(...)` to prevent stranded GPU textures.
   * The guard is defensive: in current production code flow this code path is
   * unreachable (set() only follows a get() miss inside allocateColorTargets),
   * but the single-line guard costs almost nothing and closes the symmetry gap
   * (every GPU resource allocation has a paired destroy).
   *
   * When `lastDevice` is null (no device ever stashed), the old entry is
   * silently dropped without destroy (mirrors drainTransient's null-device
   * fast path).
   */
  setTransientEntry(key, pooled) {
    const old = this.transientPool.get(key);
    if (old) {
      this.pendingDestroy.push(old);
    }
    this.transientPool.set(key, pooled);
  }
  /**
   * Publish a persistent replacement only after a complete allocation succeeds.
   * The old handle remains fenced until the GPU retires work that may still
   * reference it, just like a transient replacement.
   */
  setPersistentEntry(key, pooled) {
    const old = this.persistentTextures.get(key);
    if (old && old.texture !== pooled.texture) {
      this.pendingDestroy.push(old);
    }
    this.persistentTextures.set(key, pooled);
  }
  /**
   * bug-20260622 D-2: reclaim pool textures queued in pendingDestroy after
   * the GPU has retired all prior command buffers.
   *
   * Takes a snapshot of pendingDestroy, then calls
   * `lastDevice.queue.onSubmittedWorkDone()`. When the promise resolves,
   * the snapshot items are actually destroyed via
   * `device.destroyTexture(...)` and removed from the queue.
   *
   * Idempotent (architecture-principles D-4): a second reclaim on an
   * already-drained pendingDestroy is a no-op. When lastDevice is null
   * (no device ever stashed), pendingDestroy is cleared directly.
   *
   * Per-handle destroy errors are tolerated (swallow-and-continue,
   * plan-strategy D-5) — a stale-handle destroy-after-destroy does not
   * interrupt the reclaim chain.
   */
  async reclaimRetiredTransients() {
    const device = this.lastDevice;
    if (device === null) {
      this.pendingDestroy.length = 0;
      return;
    }
    if (this.pendingDestroy.length === 0) return;
    const snapshot = this.pendingDestroy.splice(0);
    await device.queue.onSubmittedWorkDone();
    for (const pooled of snapshot) {
      try {
        device.destroyTexture(pooled.texture);
      } catch {
      }
    }
  }
  /**
   * Drop the pendingDestroy queue WITHOUT calling device.destroyTexture
   * (feat-20260622-s5 M3 / B-2 / B-AC-02).
   *
   * Used on the device-lost recover() rebuild path: the queue holds
   * PooledTexture handles minted against the now-lost device, so calling
   * destroyTexture on them against the freshly-rebuilt device is meaningless
   * (the old GPUDevice owns them; spec retires its resources implicitly when
   * it is lost). recover() calls this after `gpuStore.destroyAll()` and before
   * `tryCreateWebGPURenderer` so no stale handle reaches the new device.
   *
   * device-lost is an upstream judgement (createRenderer's health state); the
   * graph stays RHI-pure and takes no device parameter — it only exposes the
   * clear entry. Same effect as the existing null-device fast paths in drain()
   * / reclaimRetiredTransients() (`pendingDestroy.length = 0`), surfaced as a
   * method recover() can call directly. Idempotent: a second call on an
   * already-empty queue is a no-op.
   */
  clearPendingDestroy() {
    this.pendingDestroy.length = 0;
  }
  /**
   * Execute the compiled graph in declaration order, calling
   * each pass's execute closure with the provided context. Passes without an
   * execute closure are silently skipped.
   */
  execute(ctx, runPass) {
    const compiled = this.compiled;
    if (!compiled) return;
    const resolvedTextures = compiled.resolvedTextures;
    const resolveCtx = {
      resolve: (name) => resolvedTextures.get(name)
    };
    const passList = this.passes.list();
    const passByName = new Map(passList.map((p) => [p.name, p]));
    for (const internalPass of compiled.passes) {
      const entry = passByName.get(internalPass.name);
      const execute = entry?.descriptor.execute;
      if (execute) {
        if (runPass === void 0) {
          execute(ctx, resolveCtx);
        } else {
          runPass(
            internalPass.name,
            () => execute(ctx, resolveCtx)
          );
        }
      }
    }
  }
  listPasses() {
    return this.passes.list().map((p) => ({
      name: p.name,
      reads: p.descriptor.reads,
      writes: p.descriptor.writes
    }));
  }
  listResources() {
    const result = [];
    for (const entry of this.resources.entries()) {
      result.push({
        key: entry.key,
        kind: entry.descriptor.kind,
        lifetime: entry.descriptor.lifetime
      });
    }
    return result;
  }
  // ── Private helpers ────────────────────────────────────────────
  validateCaps(passList, caps) {
    for (const pass of passList) {
      const { name, descriptor } = pass;
      if (descriptor.compute && !caps.compute) {
        return err(
          new RenderGraphError({
            code: "cap-missing",
            expected: `pass '${name}' is a compute pass but caps.compute is false`,
            hint: "use a render pass path or enable compute on the backend",
            detail: { cap: "compute", passName: name }
          })
        );
      }
      if (descriptor.storageBuffer && !caps.storageBuffer) {
        return err(
          new RenderGraphError({
            code: "cap-missing",
            expected: `pass '${name}' requires storage buffer but caps.storageBuffer is false`,
            hint: "switch to uniform buffer or enable storageBuffer on the backend",
            detail: {
              cap: "storageBuffer",
              passName: name
            }
          })
        );
      }
    }
    return null;
  }
  validateColorDomains(passList) {
    for (const pass of passList) {
      for (const connection of pass.descriptor.colorConnections ?? []) {
        const source = this.resources.get(connection.source)?.colorTarget?.domain;
        const destination = this.resources.get(connection.destination)?.colorTarget?.domain;
        const validation = validateColorDomainConnection(
          source,
          destination,
          connection.conversion
        );
        if (!validation.ok) return err(validation.error);
      }
    }
    return null;
  }
  validateNoUnknownResource(passList) {
    for (const pass of passList) {
      for (const key of [...pass.descriptor.reads, ...pass.descriptor.writes]) {
        if (key === "swapchain") continue;
        if (!this.resources.has(key)) {
          return err(
            new RenderGraphError({
              code: "unknown-resource",
              expected: `pass '${pass.name}' references resource key '${key}' but it is not registered`,
              hint: `call addResource('${key}', ...) before compile, or remove '${key}' from pass '${pass.name}'`,
              detail: {
                resourceKey: key,
                passName: pass.name
              }
            })
          );
        }
      }
    }
    return null;
  }
  /**
   * Resolve every registered `kind:'buffer'` resource to a concrete RHI
   * binding type (AC-09 / D-6.1). `bufferRole='auto-storage-or-uniform'`
   * (the default when unset) picks `'read-only-storage'` when the backend
   * advertises `caps.storageBuffer`, else falls back to `'uniform'`;
   * `bufferRole='uniform'` is always `'uniform'`. Mirrors the runtime
   * `pbr-pipeline.ts` cap switch (research Finding 7), expressed here in the
   * RHI-pure graph layer so consumers never duplicate the branch.
   */
  resolveBuffers(caps) {
    const resolved = [];
    for (const entry of this.resources.entries()) {
      if (entry.descriptor.kind !== "buffer") continue;
      const role = entry.descriptor.bufferRole ?? "auto-storage-or-uniform";
      const resolvedBufferType = role === "uniform" ? "uniform" : caps.storageBuffer ? "read-only-storage" : "uniform";
      resolved.push({ key: entry.key, resolvedBufferType });
    }
    return resolved;
  }
  validateColorTargetFormats() {
    for (const entry of this.resources.entries()) {
      const meta = entry.colorTarget;
      if (!meta || VALID_GPU_TEXTURE_FORMAT_SET.has(meta.format)) continue;
      return err(
        new RenderGraphError({
          code: "invalid-format",
          expected: `addColorTarget format must be a valid GPU texture format; received '${meta.format}'`,
          hint: `replace '${meta.format}' with one of detail.expected before recompiling`,
          detail: {
            resourceKey: entry.key,
            format: meta.format,
            expected: VALID_GPU_TEXTURE_FORMATS
          }
        })
      );
    }
    return ok(void 0);
  }
  /**
   * Phase 7: allocate GPU textures for registered color targets (D-1 / D-2).
   *
   * For each addColorTarget resource, resolves the concrete size from the
   * ColorTargetSize descriptor and swapChainSize, then looks up the transient
   * pool by descriptor key. Pool hit reuses the same physical texture/view;
   * pool miss (drift) triggers device.createTexture/createTextureView rebuild.
   *
   * Alias targets (addColorTargetAlias) fold into the source's physical texture
   * (KB-1 MoveNode pattern). Persistent targets are retained across compiles
   * with size-drift rebuild.
   *
   * device === undefined is a no-op (returns an empty map).
   * Allocation is transactional: newly created textures are destroyed on any
   * failure, and pool mutations are committed only after every target succeeds.
   */
  allocateColorTargets(device, invalidateTransientPool = false) {
    const result = /* @__PURE__ */ new Map();
    if (!device || typeof device.createTexture !== "function")
      return ok({ resolvedTextures: result, transient: /* @__PURE__ */ new Map(), persistent: /* @__PURE__ */ new Map() });
    const stagedTransient = /* @__PURE__ */ new Map();
    const stagedPersistent = /* @__PURE__ */ new Map();
    const stagedAllocations = [];
    const discardStaged = () => {
      for (const pooled of stagedAllocations) {
        try {
          device.destroyTexture(pooled.texture);
        } catch {
        }
      }
    };
    for (const entry of this.resources.entries()) {
      const meta = entry.colorTarget;
      if (!meta) continue;
      if (meta.aliasedFrom !== void 0) {
        const sourceView = result.get(meta.aliasedFrom);
        const sourceTexture = result.get(`${meta.aliasedFrom}::tex`);
        if (sourceView === void 0 || sourceTexture === void 0) {
          discardStaged();
          return err(
            new RenderGraphError({
              code: "alias-source-missing",
              expected: `alias '${entry.key}' source '${meta.aliasedFrom}' must resolve to a compiled color target`,
              hint: `register color target '${meta.aliasedFrom}' before compiling alias '${entry.key}'`,
              detail: {
                aliasKey: entry.key,
                sourceKey: meta.aliasedFrom
              }
            })
          );
        }
        result.set(entry.key, sourceView);
        result.set(`${entry.key}::tex`, sourceTexture);
        continue;
      }
      const width = this.resolveWidth(meta.size);
      const height = this.resolveHeight(meta.size);
      const lifetime = entry.lifetime;
      const descriptorKey = poolKey({
        format: meta.format,
        width,
        height,
        usage: meta.usage,
        sample: meta.sample,
        viewFormats: meta.viewFormats ?? []
      });
      const key = `${entry.key}:${descriptorKey}`;
      if (lifetime === "transient") {
        const pooled2 = invalidateTransientPool ? void 0 : this.transientPool.get(key);
        if (pooled2) {
          result.set(entry.key, pooled2.view);
          result.set(`${entry.key}::tex`, pooled2.texture);
          continue;
        }
      } else if (lifetime === "persistent") {
        const persisted = this.persistentTextures.get(entry.key);
        if (persisted?.descriptorKey === descriptorKey) {
          result.set(entry.key, persisted.view);
          result.set(`${entry.key}::tex`, persisted.texture);
          continue;
        }
      }
      const texResult = device.createTexture({
        label: entry.key,
        size: { width, height, depthOrArrayLayers: 1 },
        mipLevelCount: 1,
        sampleCount: meta.sample,
        dimension: "2d",
        format: meta.format,
        usage: meta.usage,
        viewFormats: meta.viewFormats ?? []
      });
      if (!texResult.ok) {
        discardStaged();
        return err(
          new RenderGraphError({
            code: "resource-alloc-failed",
            expected: `device.createTexture must succeed for color target '${entry.key}'`,
            hint: `retry after recovering the RHI allocation failure for '${entry.key}'`,
            detail: {
              resourceKey: entry.key,
              rhiCode: texResult.error.code
            }
          })
        );
      }
      const viewResult = device.createTextureView(texResult.value, {});
      if (!viewResult.ok) {
        try {
          device.destroyTexture(texResult.value);
        } catch {
        }
        discardStaged();
        return err(
          new RenderGraphError({
            code: "resource-alloc-failed",
            expected: `device.createTextureView must succeed for color target '${entry.key}'`,
            hint: `retry after recovering the RHI view allocation failure for '${entry.key}'`,
            detail: {
              resourceKey: entry.key,
              rhiCode: viewResult.error.code
            }
          })
        );
      }
      const pooled = {
        texture: texResult.value,
        view: viewResult.value,
        descriptorKey
      };
      stagedAllocations.push(pooled);
      if (lifetime === "transient") {
        stagedTransient.set(key, pooled);
      } else {
        stagedPersistent.set(entry.key, pooled);
      }
      result.set(entry.key, viewResult.value);
      result.set(`${entry.key}::tex`, texResult.value);
    }
    return ok({
      resolvedTextures: result,
      transient: stagedTransient,
      persistent: stagedPersistent
    });
  }
  resolveWidth(size) {
    if (typeof size === "string") {
      return size === "half-swapchain" ? Math.ceil(this.swapChainWidth / 2) : this.swapChainWidth;
    }
    return size.w;
  }
  resolveHeight(size) {
    if (typeof size === "string") {
      return size === "half-swapchain" ? Math.ceil(this.swapChainHeight / 2) : this.swapChainHeight;
    }
    return size.h;
  }
  validateNoDanglingRead(passList) {
    const writers = /* @__PURE__ */ new Set();
    for (const pass of passList) {
      for (const key of pass.descriptor.reads) {
        const imported = this.resources.get(key)?.descriptor.lifetime === "persistent";
        if (key !== "swapchain" && !imported && !writers.has(key)) {
          return err(
            new RenderGraphError({
              code: "dangling-read",
              expected: `pass '${pass.name}' reads key '${key}' but no pass writes it`,
              hint: `add a pass that writes '${key}', or remove '${key}' from pass '${pass.name}' reads`,
              detail: {
                resourceKey: key,
                passName: pass.name
              }
            })
          );
        }
      }
      for (const key of pass.descriptor.writes) writers.add(key);
    }
    return null;
  }
};

export { COLOR_VALUE_DOMAINS, RenderGraph, RenderGraphBuilder, RenderGraphError, createCurrentFrameObservationLease, deserializeColorResourceDescriptor, deserializeColorValueDomain, isColorValueDomain, serializeColorResourceDescriptor, serializeColorValueDomain, validateColorDomainConnection };
