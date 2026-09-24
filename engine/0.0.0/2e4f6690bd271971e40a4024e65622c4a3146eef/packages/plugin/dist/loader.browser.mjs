import { Service, Inject, composeError, Context, isConstructor } from '../../../vendor/@deepseek-ai/cordis/lib/index.js';
import { createCapabilityResolver } from '../../tool-runtime/dist/index.mjs';

// ../../node_modules/.pnpm/@deepseek-ai+cordis-plugin-loader@1.0.2_patch_hash=6e77a3b82171afbdac249c0e31290cc06386_1a14a168fdebad14b739afc92f305e1c/node_modules/@deepseek-ai/cordis-plugin-loader/lib/index.js

// ../../node_modules/.pnpm/@deepseek-ai+cosmokit@1.8.2/node_modules/@deepseek-ai/cosmokit/lib/index.js
function isNullable(value) {
  return value === null || value === void 0;
}
function isNonNullable(value) {
  return !isNullable(value);
}
function mapValues(object, transform) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
}
function defineProperty(object, key, value) {
  return Object.defineProperty(object, key, {
    writable: true,
    value,
    enumerable: false
  });
}
function is(type, value) {
  if (arguments.length === 1) return (value2) => is(type, value2);
  return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
}
function isArrayBufferLike(value) {
  return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
}
function isArrayBufferSource(value) {
  return isArrayBufferLike(value) || ArrayBuffer.isView(value);
}
var Binary;
(function(Binary2) {
  Binary2.is = isArrayBufferLike;
  Binary2.isSource = isArrayBufferSource;
  function fromSource(source) {
    if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
    else return source;
  }
  Binary2.fromSource = fromSource;
  function toBase64(source) {
    source = fromSource(source);
    if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
    let binary = "";
    const bytes = new Uint8Array(source);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  Binary2.toBase64 = toBase64;
  function fromBase64(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
    return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
  }
  Binary2.fromBase64 = fromBase64;
  function toHex(source) {
    source = fromSource(source);
    if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
    return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  Binary2.toHex = toHex;
  function fromHex(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
    const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
    const buffer = [];
    for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
    return Uint8Array.from(buffer).buffer;
  }
  Binary2.fromHex = fromHex;
})(Binary || (Binary = {}));
Binary.fromBase64;
Binary.toBase64;
Binary.fromHex;
Binary.toHex;
function deepEqual(a, b, strict) {
  if (a === b) return true;
  if (isNullable(a) && isNullable(b)) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;
  if (!a || !b) return false;
  function check(test, then) {
    return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
  }
  return check(Array.isArray, (a2, b2) => a2.length === b2.length && a2.every((item, index) => deepEqual(item, b2[index]))) ?? check(is("Date"), (a2, b2) => a2.valueOf() === b2.valueOf()) ?? check(is("RegExp"), (a2, b2) => a2.source === b2.source && a2.flags === b2.flags) ?? check(isArrayBufferLike, (a2, b2) => {
    if (a2.byteLength !== b2.byteLength) return false;
    const viewA = new Uint8Array(a2);
    const viewB = new Uint8Array(b2);
    for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
    return true;
  }) ?? Object.keys({
    ...a,
    ...b
  }).every((key) => deepEqual(a[key], b[key]));
}
var Time;
(function(Time2) {
  Time2.millisecond = 1;
  Time2.second = 1e3;
  Time2.minute = Time2.second * 60;
  Time2.hour = Time2.minute * 60;
  Time2.day = Time2.hour * 24;
  Time2.week = Time2.day * 7;
  let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
  function setTimezoneOffset(offset) {
    timezoneOffset = offset;
  }
  Time2.setTimezoneOffset = setTimezoneOffset;
  function getTimezoneOffset() {
    return timezoneOffset;
  }
  Time2.getTimezoneOffset = getTimezoneOffset;
  function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
    if (typeof date === "number") date = new Date(date);
    if (offset === void 0) offset = timezoneOffset;
    return Math.floor((date.valueOf() / Time2.minute - offset) / 1440);
  }
  Time2.getDateNumber = getDateNumber;
  function fromDateNumber(value, offset) {
    const date = new Date(value * Time2.day);
    if (offset === void 0) offset = timezoneOffset;
    return new Date(+date + offset * Time2.minute);
  }
  Time2.fromDateNumber = fromDateNumber;
  const numeric = /\d+(?:\.\d+)?/.source;
  const timeRegExp = new RegExp(`^${[
    "w(?:eek(?:s)?)?",
    "d(?:ay(?:s)?)?",
    "h(?:our(?:s)?)?",
    "m(?:in(?:ute)?(?:s)?)?",
    "s(?:ec(?:ond)?(?:s)?)?"
  ].map((unit) => `(${numeric}${unit})?`).join("")}$`);
  function parseTime(source) {
    const capture = timeRegExp.exec(source);
    if (!capture) return 0;
    return (parseFloat(capture[1]) * Time2.week || 0) + (parseFloat(capture[2]) * Time2.day || 0) + (parseFloat(capture[3]) * Time2.hour || 0) + (parseFloat(capture[4]) * Time2.minute || 0) + (parseFloat(capture[5]) * Time2.second || 0);
  }
  Time2.parseTime = parseTime;
  function parseDate(date) {
    const parsed = parseTime(date);
    if (parsed) date = Date.now() + parsed;
    else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
    else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
    return date ? new Date(date) : /* @__PURE__ */ new Date();
  }
  Time2.parseDate = parseDate;
  function format(ms) {
    const abs = Math.abs(ms);
    if (abs >= Time2.day - Time2.hour / 2) return Math.round(ms / Time2.day) + "d";
    else if (abs >= Time2.hour - Time2.minute / 2) return Math.round(ms / Time2.hour) + "h";
    else if (abs >= Time2.minute - Time2.second / 2) return Math.round(ms / Time2.minute) + "m";
    else if (abs >= Time2.second) return Math.round(ms / Time2.second) + "s";
    return ms + "ms";
  }
  Time2.format = format;
  function toDigits(source, length = 2) {
    return source.toString().padStart(length, "0");
  }
  Time2.toDigits = toDigits;
  function template(template2, time = /* @__PURE__ */ new Date()) {
    return template2.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
  }
  Time2.template = template;
})(Time || (Time = {}));

// ../../node_modules/.pnpm/@deepseek-ai+cordis-plugin-loader@1.0.2_patch_hash=6e77a3b82171afbdac249c0e31290cc06386_1a14a168fdebad14b739afc92f305e1c/node_modules/@deepseek-ai/cordis-plugin-loader/lib/index.js
var ModuleLoader;
(function(ModuleLoader2) {
  function fromInternal() {
  }
  ModuleLoader2.fromInternal = fromInternal;
})(ModuleLoader || (ModuleLoader = {}));
var EntryGroup = class {
  ctx;
  tree;
  static key = /* @__PURE__ */ Symbol.for("cordis.group");
  data = [];
  constructor(ctx, tree) {
    this.ctx = ctx;
    this.tree = tree;
    const entry = ctx.fiber.entry;
    if (entry) entry.subgroup = this;
  }
  get context() {
    return this.ctx;
  }
  async create(options) {
    const id = this.tree.ensureId(options);
    const existing = this.tree.store[id];
    const entry = existing ?? (this.tree.store[id] = new Entry(this.ctx.loader));
    const previousParent = entry.parent;
    entry.parent = this;
    try {
      await entry.update(options, true, true);
    } catch (error) {
      if (existing) entry.parent = previousParent;
      else delete this.tree.store[id];
      throw error;
    }
    return entry.id;
  }
  unlink(options) {
    const config = this.data;
    const index = config.indexOf(options);
    if (index >= 0) config.splice(index, 1);
  }
  async remove(id, isDispose = false) {
    const entry = this.tree.store[id];
    if (!entry) return;
    await entry._dispose();
    if (!isDispose) this.unlink(entry.options);
    delete this.tree.store[id];
    this.context.emit("loader/partial-dispose", entry, entry.options, false);
  }
  async update(config) {
    const oldConfig = this.data;
    const seen = /* @__PURE__ */ new Set();
    for (const options of config) {
      const id = this.tree.ensureId(options);
      if (seen.has(id)) throw new TypeError(`duplicate loader entry id: ${id}`);
      seen.add(id);
    }
    const oldMap = Object.fromEntries(oldConfig.map((options) => [options.id, options]));
    const newMap = Object.fromEntries(config.map((options) => [options.id, options]));
    try {
      const outcomes = await Promise.allSettled(config.map((options) => this.create(options)));
      if (this.ctx.fiber.uid === null) return;
      const failures = outcomes.filter((outcome) => outcome.status === "rejected").map((outcome) => outcome.reason);
      if (failures.length === 1) throw failures[0];
      if (failures.length > 1) throw new AggregateError(failures, "loader entries failed to apply");
      for (const id of Object.keys(oldMap)) if (!newMap[id]) await this.remove(id, true);
      this.data = config;
    } catch (error) {
      const rollbackErrors = [];
      for (const id of Object.keys(newMap).reverse()) {
        if (oldMap[id]) continue;
        try {
          await this.remove(id, true);
        } catch (rollbackError) {
          rollbackErrors.push(rollbackError);
        }
      }
      for (const options of oldConfig) try {
        await this.create(options);
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
      this.data = oldConfig;
      if (rollbackErrors.length) throw new AggregateError([error, ...rollbackErrors], "loader entry rollback failed");
      throw error;
    }
  }
  async stop() {
    for (const options of this.data) await this.remove(options.id, true);
  }
};
var Group = class extends EntryGroup {
  ctx;
  config;
  static initial = [];
  static [EntryGroup.key] = true;
  constructor(ctx, config) {
    super(ctx, ctx.fiber.entry.parent.tree);
    this.ctx = ctx;
    this.config = config;
    ctx.on("internal/update", (config2) => this.update(config2));
  }
  async *[Service.init]() {
    yield () => this.stop();
    await this.update(this.config);
  }
};
var __rewriteRelativeImportExtension = function(path, preserveJsx) {
  if (typeof path === "string" && /^\.\.?\//.test(path)) return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(m, tsx, d, ext, cm) {
    return tsx ? ".js" : d && (!ext || !cm) ? m : d + ext + "." + cm.toLowerCase() + "js";
  });
  return path;
};
var EntryTree = class EntryTree2 {
  static sep = ":";
  ctx;
  enableLogs;
  root;
  store = /* @__PURE__ */ Object.create(null);
  constructor(ctx) {
    this.ctx = ctx.extend({ baseUrl: ctx.baseUrl });
    this.root = new EntryGroup(this.ctx, this);
    const entry = this.ctx.fiber.entry;
    if (entry) entry.subtree = this;
  }
  get context() {
    return this.ctx;
  }
  /** Iterate entries in this tree and any nested subtrees. */
  *entries() {
    for (const entry of Object.values(this.store)) {
      yield entry;
      if (!entry.subtree) continue;
      yield* entry.subtree.entries();
    }
  }
  /** Return pending import and lifecycle tasks owned by this tree. */
  getTasks() {
    return [...this.entries()].map((entry) => entry._initTask || entry.fiber?.inertia).filter(isNonNullable);
  }
  /**
  * Wait until this tree has no active import or lifecycle tasks.
  * @throws a settled fiber failure, or an aggregate when several fibers failed.
  */
  async await() {
    while (true) {
      const tasks = this.getTasks();
      if (tasks.length) {
        await Promise.allSettled(tasks);
        continue;
      }
      const failures = (await Promise.allSettled([...this.entries()].map((entry) => entry._await()))).filter((outcome) => outcome.status === "rejected").map((outcome) => outcome.reason);
      if (failures.length === 1) throw failures[0];
      if (failures.length > 1) throw new AggregateError(failures, "loader fibers failed");
      this.ctx.reflect.notify(["loader"]);
      if (!this.getTasks().length) return;
    }
  }
  ensureId(options) {
    if (!options.id) do
      options.id = Math.random().toString(16).slice(2, 10);
    while (this.store[options.id]);
    return options.id;
  }
  /** Resolve an entry by id, including nested ids separated by `EntryTree.sep`. */
  resolve(id) {
    const parts = id.split(EntryTree2.sep);
    let tree = this;
    const final = parts.pop();
    for (const part of parts) {
      tree = tree.store[part]?.subtree;
      if (!tree) throw new Error(`cannot resolve entry ${id}`);
    }
    const entry = tree.store[final];
    if (!entry) throw new Error(`cannot resolve entry ${id}`);
    return entry;
  }
  resolveGroup(id) {
    if (!id) return this.root;
    const entry = this.resolve(id);
    if (!entry.subgroup) throw new Error(`entry ${id} is not a group`);
    return entry.subgroup;
  }
  /** Create an entry in the root group or a nested group. */
  async create(options, parent = null, position = Infinity) {
    const group = this.resolveGroup(parent);
    const id = await group.create(options);
    const entry = this.resolve(id);
    group.data.splice(position, 0, entry.options);
    group.tree.write();
    return id;
  }
  /** Stop and remove an entry from its parent group. */
  async remove(id) {
    const entry = this.resolve(id);
    await entry.parent.remove(id);
    entry.parent.tree.write();
  }
  /** Update an entry and optionally move it to another group. */
  async update(id, options, parent, position) {
    const entry = this.resolve(id);
    const source = entry.parent;
    const sourceIndex = source.data.indexOf(entry.options);
    let target = source;
    if (parent !== void 0) {
      target = this.resolveGroup(parent);
      source.unlink(entry.options);
      target.data.splice(position ?? Infinity, 0, entry.options);
      entry.parent = target;
    }
    try {
      await entry.update(options, false, true);
    } catch (error) {
      if (parent !== void 0) {
        target.unlink(entry.options);
        source.data.splice(sourceIndex < 0 ? source.data.length : sourceIndex, 0, entry.options);
        entry.parent = source;
        try {
          await entry.update({}, false, true);
        } catch (rollbackError) {
          throw new AggregateError([error, rollbackError], `failed to roll back loader entry move ${id}`);
        }
      }
      throw error;
    }
    source.tree.write();
    if (target !== source) target.tree.write();
  }
  /** Import a plugin module from a specifier or `cordis:` builtin. */
  import(name, getOuterStack) {
    if (name.startsWith("cordis:")) return this.ctx.loader.builtins[name.slice(7)];
    return composeError(async (info) => {
      info.offset += 3;
      if (this.ctx.loader.internal) return await this.ctx.loader.internal.import(name, this.ctx.baseUrl, {});
      else if (name.startsWith(".")) return await import(__rewriteRelativeImportExtension(
        /* @vite-ignore */
        new URL(name, this.ctx.baseUrl).href
      ));
      else return await import(__rewriteRelativeImportExtension(
        /* @vite-ignore */
        name
      ));
    }, getOuterStack);
  }
};
var evaluate = new Function("ctx", "expr", `
  with (ctx) {
    return eval(expr)
  }
`);
function interpolate(ctx, value) {
  if (isJsExpr(value)) return evaluate(ctx, value.__jsExpr);
  else if (!value || typeof value !== "object") return value;
  else if (Array.isArray(value)) return value.map((item) => interpolate(ctx, item));
  else return mapValues(value, (item) => interpolate(ctx, item));
}
function isJsExpr(value) {
  return value instanceof Object && "__jsExpr" in value;
}
function updateError(stage, options, cause) {
  const detail = cause instanceof Error ? cause.message : String(cause);
  return new Error(`failed to ${stage} loader entry ${options.id} (${options.name}): ${detail}`, { cause });
}
function takeEntries(object, keys) {
  const result = [];
  for (const key of keys) {
    if (!(key in object)) continue;
    result.push([key, object[key]]);
    delete object[key];
  }
  return result;
}
function sortKeys(object, prepend = ["id", "name"], append = ["config"]) {
  const part1 = takeEntries(object, prepend);
  const part2 = takeEntries(object, append);
  const rest = takeEntries(object, Object.keys(object)).sort(([a], [b]) => a.localeCompare(b));
  return Object.assign(object, Object.fromEntries([
    ...part1,
    ...rest,
    ...part2
  ]));
}
function replaceKeys(target, source) {
  for (const key of Object.keys(target)) Reflect.deleteProperty(target, key);
  return Object.assign(target, source);
}
var Entry = class Entry2 {
  loader;
  static key = /* @__PURE__ */ Symbol.for("cordis.entry");
  ctx;
  fiber;
  parent;
  options = {};
  subgroup;
  subtree;
  _initTask;
  _disposing = 0;
  constructor(loader) {
    this.loader = loader;
    this.ctx = loader.ctx.extend({ [Entry2.key]: this });
    this.context.emit("loader/entry-init", this);
  }
  get context() {
    return this.ctx;
  }
  get id() {
    let id = this.options.id;
    if (this.parent.tree.ctx.fiber.entry) id = this.parent.tree.ctx.fiber.entry.id + EntryTree.sep + id;
    return id;
  }
  /** True when this entry or any owning parent entry is disabled. */
  get disabled() {
    return this._disabled(this.options);
  }
  _disabled(options) {
    if (options.group) return false;
    if (this.disabledOf(options)) return true;
    let entry = this.parent.ctx.fiber.entry;
    while (entry) {
      if (this.disabledOf(entry.options)) return true;
      entry = entry.parent.ctx.fiber.entry;
    }
    return false;
  }
  /**
  * Effective disabled state: a `!!js` expression evaluates against the loader
  * context. The raw node stays in the options, so write-back keeps the form.
  */
  disabledOf(options) {
    return isJsExpr(options.disabled) ? Boolean(this.evaluate(options.disabled.__jsExpr)) : Boolean(options.disabled);
  }
  evaluate(expr) {
    return evaluate(this.ctx, expr);
  }
  async _patchContext(diff) {
    await this.context.waterfall("loader/patch-context", this, async () => {
      Object.setPrototypeOf(this.ctx, this.parent.ctx);
      if (this.fiber?.uid && (diff.includes("config") || this.options.group)) await this.fiber.update(this.options.config, true);
    });
  }
  async refresh() {
    if (this.fiber) return;
    if (this.disabled) return;
    await this.init();
  }
  async _dispose(fiber = this.fiber) {
    if (!fiber) return;
    if (this.fiber === fiber) this.fiber = void 0;
    this._disposing += 1;
    try {
      await fiber.dispose();
    } finally {
      this._disposing -= 1;
    }
  }
  /** Merge new options, restart as needed, and persist through the parent tree. */
  async update(options, create = false, force = false) {
    const previousOptions = this.options;
    const legacy = { ...previousOptions };
    const candidate = create ? options : { ...previousOptions };
    if (!create) for (const [key, value] of Object.entries(options)) if (isNullable(value)) delete candidate[key];
    else candidate[key] = value;
    sortKeys(candidate);
    const diff = Object.keys({
      ...candidate,
      ...legacy
    }).filter((key) => !deepEqual(candidate[key], legacy[key]));
    if (!diff.length && !force) return;
    const commit = () => {
      if (create) return;
      this.options = replaceKeys(previousOptions, candidate);
    };
    const previous = this.fiber;
    if (!previous?.uid) {
      this.fiber = void 0;
      this.options = candidate;
      try {
        if (!this._disabled(candidate)) await this.init();
      } catch (error) {
        this.options = previousOptions;
        throw error;
      }
      commit();
      return;
    }
    if (this._disabled(candidate)) {
      this.options = candidate;
      try {
        await this._dispose(previous);
      } catch (error) {
        this.options = previousOptions;
        throw updateError("dispose", candidate, error);
      }
      commit();
      this.context.emit("loader/partial-dispose", this, legacy, true);
      return;
    }
    if (!diff.some((key) => key === "name" || key === "inject" || key === "group")) {
      this.options = candidate;
      try {
        await this._patchContext(diff);
      } catch (error) {
        this.options = previousOptions;
        try {
          await this._patchContext(diff);
        } catch (rollbackError) {
          throw updateError("rollback", legacy, new AggregateError([error, rollbackError]));
        }
        this.context.emit("loader/partial-dispose", this, candidate, true);
        throw updateError("apply", candidate, error);
      }
      commit();
      this.context.emit("loader/partial-dispose", this, legacy, true);
      return;
    }
    let plugin;
    try {
      plugin = diff.includes("name") ? this.loader.unwrapExports(await this.parent.tree.import(candidate.name, this.getOuterStack)) : previous.runtime.callback;
    } catch (error) {
      throw updateError("import", candidate, error);
    }
    const previousPlugin = previous.runtime.callback;
    this.options = candidate;
    try {
      await this._dispose(previous);
    } catch (error) {
      this.options = previousOptions;
      throw updateError("dispose", candidate, error);
    }
    try {
      await this._start(plugin);
    } catch (error) {
      this.options = previousOptions;
      try {
        await this._start(previousPlugin);
      } catch (rollbackError) {
        throw updateError("rollback", legacy, new AggregateError([error, rollbackError]));
      }
      this.context.emit("loader/partial-dispose", this, candidate, true);
      throw updateError("apply", candidate, error);
    }
    commit();
    this.context.emit("loader/partial-dispose", this, legacy, true);
  }
  getOuterStack = () => {
    let entry = this;
    const result = [];
    do {
      result.push(`    at ${entry.parent.tree.ctx.baseUrl}#${entry.options.id}`);
      entry = entry.parent.ctx.fiber.entry;
    } while (entry);
    return result;
  };
  /** Import and start the configured plugin if it is not already running. */
  async init() {
    try {
      await (this._initTask ??= this._init());
    } finally {
      this._initTask = void 0;
      if (!this.loader.getTasks().length) this.ctx.reflect.notify(["loader"]);
    }
    await this._await();
  }
  async _await() {
    try {
      await this.fiber?.await();
    } catch (error) {
      throw updateError("apply", this.options, error);
    }
  }
  async _init() {
    let plugin;
    try {
      plugin = this.loader.unwrapExports(await this.parent.tree.import(this.options.name, this.getOuterStack));
    } catch (error) {
      throw updateError("import", this.options, error);
    }
    try {
      await this._start(plugin);
    } catch (error) {
      throw updateError("apply", this.options, error);
    }
  }
  async _start(plugin) {
    let fiber;
    try {
      await this._patchContext([]);
      this.loader.showLog(this, "apply");
      fiber = this.fiber = this.ctx.registry.plugin(plugin, this.options.config, this.getOuterStack);
      await fiber.await();
    } catch (error) {
      await this._dispose(fiber);
      throw error;
    }
  }
};
function swap(target, source) {
  for (const key of Reflect.ownKeys(target)) Reflect.deleteProperty(target, key);
  for (const key of Reflect.ownKeys(source || {})) Reflect.defineProperty(target, key, Reflect.getOwnPropertyDescriptor(source, key));
}
var Realm = class {
  store = /* @__PURE__ */ Object.create(null);
  access(key, create = false) {
    if (create) return this.store[key] ??= /* @__PURE__ */ Symbol(`${key}${this.suffix}`);
    else return this.store[key] ?? /* @__PURE__ */ Symbol(`${key}${this.suffix}`);
  }
  delete(key) {
    delete this.store[key];
  }
  get size() {
    return Object.keys(this.store).length;
  }
};
var LocalRealm = class extends Realm {
  entry;
  constructor(entry) {
    super();
    this.entry = entry;
  }
  get suffix() {
    return "#" + this.entry.options.id;
  }
};
var GlobalRealm = class extends Realm {
  label;
  constructor(label) {
    super();
    this.label = label;
  }
  get suffix() {
    return "@" + this.label;
  }
};
function isolate(ctx) {
  const realms = /* @__PURE__ */ Object.create(null);
  const delims = /* @__PURE__ */ Object.create(null);
  function access(entry, name, create = false) {
    let realm;
    const label = entry.options.isolate?.[name];
    if (!label) return;
    if (label === true) realm = entry.realm ??= new LocalRealm(entry);
    else if (create) realm = realms[label] ??= new GlobalRealm(label);
    else realm = realms[label];
    return realm?.access(name, create);
  }
  ctx.on("loader/entry-init", (entry) => {
    entry.ctx[Context.intercept] = Object.create(entry.ctx[Context.intercept]);
    entry.ctx[Context.isolate] = Object.create(entry.ctx[Context.isolate]);
  });
  ctx.on("loader/patch-context", async (entry, next) => {
    const newMap = Object.create(entry.parent.ctx[Context.isolate]);
    for (const name of Object.keys(entry.options.isolate ?? {})) newMap[name] = access(entry, name, true);
    const diff = /* @__PURE__ */ Object.create(null);
    const oldMap = entry.ctx[Context.isolate];
    for (const name in {
      ...newMap,
      ...delims
    }) {
      if (newMap[name] === oldMap[name]) continue;
      const delim = delims[name] ??= /* @__PURE__ */ Symbol(`delim:${name}`);
      entry.ctx[delim] = /* @__PURE__ */ Symbol(`${name}#${entry.id}`);
      for (const symbol of [oldMap[name], newMap[name]]) {
        const impl = symbol && entry.ctx.reflect.store[symbol];
        if (!impl) continue;
        if (!impl.fiber) {
          entry.ctx.logger.warn(/* @__PURE__ */ new Error(`expected service ${name} to be implemented`));
          continue;
        }
        diff[name] = [
          oldMap[name],
          newMap[name],
          entry.ctx[delim],
          impl.fiber.ctx[delim]
        ];
        if (entry.ctx[delim] !== impl.fiber.ctx[delim]) break;
      }
    }
    Object.setPrototypeOf(entry.ctx[Context.isolate], entry.parent.ctx[Context.isolate]);
    Object.setPrototypeOf(entry.ctx[Context.intercept], entry.parent.ctx[Context.intercept]);
    swap(entry.ctx[Context.isolate], newMap);
    swap(entry.ctx[Context.intercept], entry.options.intercept);
    await next();
    for (const [symbol1, symbol2, flag1, flag2] of Object.values(diff)) if (flag1 === flag2 && entry.ctx.reflect.store[symbol1] && !entry.ctx.reflect.store[symbol2]) {
      entry.ctx.reflect.store[symbol2] = entry.ctx.reflect.store[symbol1];
      delete entry.ctx.reflect.store[symbol1];
    }
    ctx.reflect.notify(Object.keys(diff), (ctx2, name) => {
      const [symbol1, symbol2, flag1, flag2] = diff[name];
      const symbol3 = ctx2[Context.isolate][name];
      const flag3 = ctx2[delims[name]];
      return (symbol1 === symbol3 || symbol2 === symbol3) && flag1 === flag3 !== (flag1 === flag2);
    });
    for (const name in delims) if (!Reflect.ownKeys(newMap).includes(name)) delete entry.ctx[delims[name]];
  });
  ctx.on("loader/partial-dispose", (entry, legacy, active) => {
    for (const [name, label] of Object.entries(legacy.isolate ?? {})) {
      if (label === true) continue;
      if (active && entry.options.isolate?.[name] === label) continue;
      const realm = realms[label];
      if (!realm) continue;
      for (const entry2 of ctx.loader.entries()) if (entry2.options.isolate?.[name] === realm.label) return;
      realm.delete(name);
      if (!realm.size) delete realms[realm.label];
    }
  });
}
var Loader = class extends EntryTree {
  config;
  envData = { startTime: Date.now() };
  name = "loader";
  internal = ModuleLoader.fromInternal();
  builtins = /* @__PURE__ */ Object.create(null);
  constructor(ctx, config = {}) {
    super(ctx);
    this.config = config;
    if (config.baseUrl) this.ctx.baseUrl = config.baseUrl;
    const self = this;
    defineProperty(this, Service.tracker, {
      associate: "loader",
      property: "ctx",
      noShadow: true
    });
    ctx.reflect.provide("loader", this, this[Service.check]);
    ctx.on("internal/config", function(_config, next) {
      const config2 = next();
      if (!this.entry || this.parent.fiber?.entry === this.entry) return config2;
      if (this.runtime?.callback?.[EntryGroup.key]) return config2;
      return interpolate(this.ctx, config2);
    }, { global: true });
    ctx.on("internal/update", async function(config2, noSave, next) {
      if (!this.entry || noSave || this.parent.fiber?.entry === this.entry) return next();
      await next();
      const unparse = this.runtime?.Config?.["simplify"];
      this.entry.options.config = unparse ? unparse(config2) : config2;
      this.entry.parent.tree.write();
    }, {
      global: true,
      prepend: true
    });
    ctx.on("internal/update", function(config2, _, next) {
      if (!this.entry || this.parent.fiber?.entry === this.entry) return next();
      self.showLog(this.entry, "reload");
      return next();
    }, { global: true });
    ctx.on("internal/plugin", (fiber) => {
      if (fiber.parent[Entry.key] && !fiber.entry) {
        fiber.entry = fiber.parent[Entry.key];
        Inject.resolve(fiber.entry.options.inject, fiber.inject);
      }
      if (fiber.uid) return;
      if (!fiber.entry) return;
      if (fiber.parent.fiber?.entry === fiber.entry) return;
      if (!ctx.registry.has(fiber.runtime.callback)) return;
      const treeOwner = fiber.entry.parent.tree.ctx.fiber;
      if (!treeOwner.uid || treeOwner.state === 5) return;
      if (fiber.entry._disposing) return;
      this.showLog(fiber.entry, "unload");
      if (fiber.entry.disabled) return;
      fiber.entry.options.disabled = true;
      fiber.entry.parent.tree.write();
    });
    ctx.plugin(isolate);
  }
  write() {
  }
  [Service.check]() {
    if (Service.prototype[Service.resolveConfig].call(this).await && this.getTasks().length) return false;
    return true;
  }
  showLog(entry, type) {
    if (entry.options.group || !entry.parent.tree.enableLogs) return;
    this.ctx.root.logger?.("loader").info("%s plugin %C", type, entry.options.name);
  }
  /** Return the loader entry id that owns `fiber`, if any. */
  locate(fiber = this.ctx.fiber) {
    while (1) {
      if (fiber.entry) return fiber.entry.id;
      const next = fiber.parent.fiber;
      if (fiber === next) return;
      fiber = next;
    }
  }
  /** Hook for hosts that can restart the process on full-reload requests. */
  exit() {
  }
  /** Normalize ESM/CJS/default export shapes before applying a plugin. */
  unwrapExports(exports) {
    if (isNullable(exports)) return exports;
    exports = exports.default ?? exports;
    if (!exports.__esModule) return exports;
    return exports.default ?? exports;
  }
};
var TOOL_API_SERVICE = "toolApi";
function fiberState(ctx) {
  return ["pending", "loading", "active", "failed", "disposed", "unloading"][ctx.fiber.state] ?? "unknown";
}
function failureFiberState(ctx) {
  const state = fiberState(ctx);
  return state === "failed" || state === "disposed" ? state : "failed";
}
function isThenable(value) {
  return value !== null && (typeof value === "object" || typeof value === "function") && typeof value.then === "function";
}
function gatedEffect(value, wait) {
  if (typeof value === "function") {
    return async () => {
      await wait();
      return value();
    };
  }
  if (isThenable(value)) {
    return Promise.resolve(value).then((resolved) => gatedEffect(resolved, wait));
  }
  if (value !== null && typeof value === "object" && Symbol.iterator in value) {
    return (function* () {
      for (const item of value) yield gatedEffect(item, wait);
    })();
  }
  if (value !== null && typeof value === "object" && Symbol.asyncIterator in value) {
    return (async function* () {
      for await (const item of value) yield gatedEffect(item, wait);
    })();
  }
  return value;
}
function registerToolProvider(value, options, ctx, initialState) {
  const api = ctx.get(TOOL_API_SERVICE, false);
  if (api === void 0) return void 0;
  const fiberId = ctx.fiber.uid;
  const entryId = ctx.fiber.entry?.id;
  const pluginName = value.plugin.name ?? "tool-plugin";
  const providerId = options.providerId ?? `${entryId ?? pluginName}:${fiberId === null ? "disposed" : String(fiberId)}`;
  const input = {
    providerId,
    sourceId: options.sourceId ?? "local",
    realm: options.realm ?? "engine",
    ...fiberId === null ? {} : { fiberId },
    ...options.module === void 0 ? {} : { module: options.module },
    fiberState: fiberState(ctx),
    initialState,
    tools: value.tools
  };
  return api.registerProvider(input);
}
function applyWithToolProvider(value, options, ctx, invoke) {
  const handle = registerToolProvider(value, options, ctx, "pending");
  if (handle === void 0) return invoke();
  const fiber = ctx.fiber;
  const hadOwnEffect = Object.hasOwn(fiber, "effect");
  const previousEffect = fiber.effect;
  const callEffect = (execute, label) => previousEffect.call(
    fiber,
    execute,
    label
  );
  const waitForRevocation = () => handle.revoke("ToolPlugin Fiber disposed");
  fiber.effect = ((execute, label) => callEffect(() => gatedEffect(execute(), waitForRevocation), label));
  const restoreEffect = () => {
    if (hadOwnEffect) fiber.effect = previousEffect;
    else Reflect.deleteProperty(fiber, "effect");
  };
  const installProviderCleanup = () => {
    callEffect(
      () => async () => {
        try {
          await waitForRevocation();
        } finally {
          restoreEffect();
        }
      },
      "tool-api/provider"
    );
  };
  const fail = (cause) => {
    handle.fail(cause instanceof Error ? cause.message : String(cause), failureFiberState(ctx));
    restoreEffect();
    throw cause;
  };
  try {
    const result = invoke();
    if (isThenable(result)) {
      return Promise.resolve(result).then(
        (resolved) => {
          handle.activate("active");
          installProviderCleanup();
          return gatedEffect(resolved, waitForRevocation);
        },
        (cause) => fail(cause)
      );
    }
    handle.activate("active");
    installProviderCleanup();
    return gatedEffect(result, waitForRevocation);
  } catch (cause) {
    return fail(cause);
  }
}
function copyPluginMetadata(target, source) {
  for (const key of ["name", "Config", "inject", "provide", "intercept"]) {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (descriptor === void 0) continue;
    Object.defineProperty(target, key, descriptor);
  }
}
function bindToolPlugin(value, options = {}) {
  const plugin = value.plugin;
  if (typeof plugin === "function") {
    if (isConstructor(plugin)) {
      const wrapped3 = function(ctx, config) {
        return applyWithToolProvider(
          value,
          options,
          ctx,
          () => Reflect.construct(plugin, [ctx, config])
        );
      };
      copyPluginMetadata(wrapped3, plugin);
      return wrapped3;
    }
    const wrapped2 = ((ctx, config) => {
      return applyWithToolProvider(value, options, ctx, () => plugin(ctx, config));
    });
    copyPluginMetadata(wrapped2, plugin);
    return wrapped2;
  }
  const wrapped = {
    ...plugin,
    apply(ctx, config) {
      return applyWithToolProvider(value, options, ctx, () => plugin.apply(ctx, config));
    }
  };
  copyPluginMetadata(wrapped, plugin);
  return wrapped;
}

// src/tool-plugin.ts
function defineToolPlugin(plugin, tools) {
  return { plugin, tools: [...tools] };
}
function isToolPlugin(value) {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value;
  return candidate.plugin !== void 0 && Array.isArray(candidate.tools);
}
function createContextCapabilityResolver(ctx) {
  return createCapabilityResolver((capability) => Reflect.get(ctx, capability.id));
}

// src/loader.ts
var CatalogLoaderErrorClass = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    super(`${args.code}: ${args.expected}`);
    this.name = "CatalogLoaderError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    this.detail = args.detail;
  }
};
var CatalogLoaderError = class extends CatalogLoaderErrorClass {
  constructor(code, expected, hint, detail) {
    super({ code, expected, hint, detail });
  }
};
var CatalogLoader = class extends Loader {
  catalog;
  realm;
  constructor(ctx, config) {
    super(ctx, config.baseUrl === void 0 ? {} : { baseUrl: config.baseUrl });
    this.catalog = config.catalog;
    this.realm = config.realm;
    this.internal = void 0;
    this.builtins.group = Group;
  }
  import(name, getOuterStack) {
    if (name.startsWith("cordis:")) return super.import(name, getOuterStack);
    const record = this.catalog.get(name);
    if (record === void 0) {
      throw new CatalogLoaderError(
        "plugin-catalog-missing",
        `plugin ${name} to exist in the generated catalog`,
        "Install the package, add the Entry to forge.json, and rebuild the generated catalog.",
        { name, realm: this.realm }
      );
    }
    if (record.realm !== this.realm) {
      throw new CatalogLoaderError(
        "plugin-realm-mismatch",
        `plugin ${name} to target the ${this.realm} realm`,
        "Use a realm-specific plugin export and Entry.",
        { actual: record.realm, expected: this.realm, name }
      );
    }
    return record.load();
  }
  unwrapExports(exports) {
    const value = super.unwrapExports(exports);
    return isToolPlugin(value) ? bindToolPlugin(value, { realm: this.realm }) : value;
  }
};
async function installCatalogLoader(ctx, catalog, realm) {
  const fiber = await ctx.plugin(CatalogLoader, { catalog, realm });
  return { fiber, loader: ctx.loader };
}
async function bootstrapCatalogLoader(ctx, catalog, realm, options) {
  if (!options.supportedRealms.includes(realm)) {
    return {
      ok: false,
      error: new CatalogLoaderError(
        "plugin-realm-unsupported",
        `the ${realm} realm to be supported by this host`,
        "Select a realm advertised by the capability matrix before module evaluation.",
        { realm, supportedRealms: options.supportedRealms }
      )
    };
  }
  const handle = await installCatalogLoader(ctx, catalog, realm);
  return {
    ok: true,
    value: { ...handle, catalogDigest: options.catalogDigest, realm }
  };
}
function effectiveRealm(entry, inherited) {
  return entry.realm ?? inherited;
}
function assertSingleRealmGroup(entry, inheritedRealm) {
  const realm = effectiveRealm(entry, inheritedRealm);
  if (!entry.group) return;
  const children = entry.config ?? [];
  for (const child of children) {
    const childRealm = effectiveRealm(child, realm);
    if (childRealm !== realm) {
      throw new CatalogLoaderError(
        "plugin-entry-realm-mixed",
        `group ${entry.id} to contain entries for only the ${realm} physical realm`,
        "Split Host and Engine capabilities into separate top-level groups.",
        { actual: childRealm, expected: realm, group: entry.id }
      );
    }
    assertSingleRealmGroup(child, realm);
  }
}
function projectEntry(entry, inherited) {
  const realm = effectiveRealm(entry, inherited);
  const config = entry.group ? projectPluginEntries(entry.config ?? [], realm, realm) : entry.config;
  return {
    id: entry.id,
    name: entry.name,
    ...config === void 0 ? {} : { config },
    ...entry.group == null ? {} : { group: entry.group },
    ...entry.disabled == null ? {} : { disabled: entry.disabled },
    ...entry.inject == null ? {} : { inject: entry.inject }
  };
}
function projectPluginEntries(entries, realm, inheritedRealm = "engine") {
  const projected = [];
  for (const entry of entries) {
    const current = effectiveRealm(entry, inheritedRealm);
    assertSingleRealmGroup(entry, inheritedRealm);
    if (current === realm) projected.push(projectEntry(entry, current));
  }
  return projected;
}

export { CatalogLoader, CatalogLoaderError, Entry, EntryGroup, EntryTree, Group, Loader, bootstrapCatalogLoader, createContextCapabilityResolver, defineToolPlugin, installCatalogLoader, isToolPlugin, projectPluginEntries };
