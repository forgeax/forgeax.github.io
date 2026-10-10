import { ensureReady } from '../../wgpu-wasm/dist/index.mjs';
import { err, ok } from '../../types/dist/index.mjs';
export { err, ok } from '../../types/dist/index.mjs';

// src/index.ts
var ShaderError = class extends Error {
  name = "ShaderError";
  code;
  expected;
  hint;
  lineNum;
  linePos;
  detail;
  constructor(init) {
    super(init.message);
    this.code = init.code;
    this.expected = init.expected;
    this.hint = init.hint;
    this.lineNum = init.lineNum;
    this.linePos = init.linePos;
    this.detail = init.detail;
  }
};
function compileFailed(args) {
  return new ShaderError({
    code: "shader-compile-failed",
    expected: "WGSL source parses + validates against naga IR",
    message: args.message,
    hint: args.hint,
    ...args.lineNum !== void 0 ? { lineNum: args.lineNum } : {},
    ...args.linePos !== void 0 ? { linePos: args.linePos } : {},
    ...args.compilerMessages !== void 0 ? {
      detail: {
        code: "shader-compile-failed",
        compilerMessages: args.compilerMessages,
        ...args.reason !== void 0 ? { reason: args.reason } : {}
      }
    } : {}
  });
}
function initFailed(args) {
  return new ShaderError({
    code: "compiler-init-failed",
    expected: "@forgeax/engine-wgpu-wasm ensureReady() resolves with naga raw bindings available",
    message: args.message,
    hint: args.hint,
    detail: {
      code: "compiler-init-failed",
      ...args.reason !== void 0 ? { reason: args.reason } : {}
    }
  });
}
function manifestMalformed(args) {
  return new ShaderError({
    code: "manifest-malformed",
    expected: "manifest.json parses + every entry has {hash, wgsl, glsl, bindings}",
    message: args.message,
    hint: args.hint,
    detail: {
      code: "manifest-malformed",
      ...args.reason !== void 0 ? { reason: args.reason } : {}
    }
  });
}
function shaderNotFound(args) {
  return new ShaderError({
    code: "shader-not-found",
    expected: `manifest.entries contains entry with hash '${args.hash}'`,
    message: `ShaderRegistry: hash '${args.hash}' not present in manifest`,
    hint: args.hint
  });
}
function wrapShaderError(e, hint) {
  if (e instanceof Error) {
    try {
      const payload = JSON.parse(e.message);
      return compileFailed({
        message: payload.summary ?? payload.message ?? e.message,
        hint: hint ?? "fix the WGSL source at the indicated line/column; see ShaderError.detail.compilerMessages for full diagnostic frame",
        ...typeof payload.line_num === "number" ? { lineNum: payload.line_num } : {},
        ...typeof payload.line_pos === "number" ? { linePos: payload.line_pos } : {}
      });
    } catch {
      return compileFailed({
        message: e.message,
        hint: hint ?? "check WGSL syntax + validation rules; consult naga error output for details"
      });
    }
  }
  return compileFailed({
    message: String(e),
    hint: hint ?? "unknown error type from @forgeax/engine-wgpu-wasm; report as @forgeax/engine-naga bug"
  });
}

// src/index.ts
function reflectionMalformed(reason) {
  return manifestMalformed({
    message: `shader-reflection/2 is malformed: ${reason}`,
    hint: "rebuild the shader with the current Naga/WASM producer and preserve every bound-global fact",
    reason
  });
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function requiredNonNegativeInteger(record, key) {
  const value = record[key];
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw reflectionMalformed(`boundGlobals entry requires non-negative integer '${key}'`);
  }
  return value;
}
function readMember(value, index) {
  if (!isRecord(value)) throw reflectionMalformed(`member ${index} is not an object`);
  const name = value.name;
  const type = value.type;
  if (typeof name !== "string" || name.length === 0 || typeof type !== "string" || type.length === 0) {
    throw reflectionMalformed(`member ${index} requires name and type`);
  }
  return {
    name,
    type,
    offset: requiredNonNegativeInteger(value, "offset"),
    size: requiredNonNegativeInteger(value, "size"),
    alignment: requiredNonNegativeInteger(value, "alignment")
  };
}
function readBoundGlobal(value, index) {
  if (!isRecord(value)) throw reflectionMalformed(`boundGlobals entry ${index} is not an object`);
  const addressSpace = value.addressSpace;
  const resourceKind = value.resourceKind;
  if (typeof addressSpace !== "string" || addressSpace.length === 0) {
    throw reflectionMalformed(`boundGlobals entry ${index} requires addressSpace`);
  }
  if (typeof resourceKind !== "string" || resourceKind.length === 0) {
    throw reflectionMalformed(`boundGlobals entry ${index} requires resourceKind`);
  }
  const visibility = requiredNonNegativeInteger(value, "visibility");
  const membersValue = value.members;
  const hasMembers = membersValue !== void 0;
  if (hasMembers && !Array.isArray(membersValue)) {
    throw reflectionMalformed(`boundGlobals entry ${index} members must be an array`);
  }
  const hasSpan = value.span !== void 0;
  const hasElementStride = value.elementStride !== void 0;
  if (resourceKind === "buffer" || resourceKind === "storage-buffer") {
    if (!hasMembers || !hasSpan) {
      throw reflectionMalformed(`buffer boundGlobals entry ${index} requires members and span`);
    }
  } else if (hasMembers !== hasSpan) {
    throw reflectionMalformed(`boundGlobals entry ${index} members and span must be paired`);
  }
  if (hasElementStride) {
    if (resourceKind !== "storage-buffer") {
      throw reflectionMalformed(
        `boundGlobals entry ${index} elementStride is only valid for storage-buffer resources`
      );
    }
    const elementStride = value.elementStride;
    if (typeof elementStride !== "number" || !Number.isSafeInteger(elementStride) || elementStride <= 0) {
      throw reflectionMalformed(
        `boundGlobals entry ${index} elementStride must be a positive integer`
      );
    }
  }
  if (value.name !== void 0 && typeof value.name !== "string") {
    throw reflectionMalformed(`boundGlobals entry ${index} diagnostic name must be a string`);
  }
  return {
    group: requiredNonNegativeInteger(value, "group"),
    binding: requiredNonNegativeInteger(value, "binding"),
    addressSpace,
    resourceKind,
    visibility,
    ...value.name !== void 0 ? { name: value.name } : {},
    ...hasMembers ? {
      members: membersValue.map(
        (member, memberIndex) => readMember(member, memberIndex)
      ),
      span: requiredNonNegativeInteger(value, "span")
    } : {},
    ...hasElementStride ? { elementStride: requiredNonNegativeInteger(value, "elementStride") } : {}
  };
}
function parseReflectionWire(json) {
  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch (cause) {
    throw reflectionMalformed(cause instanceof Error ? cause.message : "JSON.parse failed");
  }
  if (!isRecord(parsed) || parsed.schemaVersion !== "shader-reflection/2") {
    throw reflectionMalformed("schemaVersion must equal 'shader-reflection/2'");
  }
  if ("material" in parsed) throw reflectionMalformed("legacy material projection is not accepted");
  if (!Array.isArray(parsed.boundGlobals)) {
    throw reflectionMalformed("boundGlobals must be an array");
  }
  if (typeof parsed.uvSetCount !== "number" || !Number.isSafeInteger(parsed.uvSetCount) || parsed.uvSetCount < 0) {
    throw reflectionMalformed("uvSetCount must be a non-negative integer");
  }
  const boundGlobals = parsed.boundGlobals.map((global, index) => readBoundGlobal(global, index));
  const coordinates = /* @__PURE__ */ new Set();
  for (const global of boundGlobals) {
    const coordinate = `${global.group}:${global.binding}`;
    if (coordinates.has(coordinate))
      throw reflectionMalformed(`duplicate bound-global coordinate ${coordinate}`);
    coordinates.add(coordinate);
  }
  return { schemaVersion: "shader-reflection/2", boundGlobals, uvSetCount: parsed.uvSetCount };
}
function readReflectionWire(json) {
  if (json === void 0) {
    return err(
      initFailed({
        message: "shader-reflection/2 is unavailable before the Naga producer emits a wire",
        hint: "run the validated compose -> reflect path and retain its raw reflection bytes",
        reason: "reflection wire unavailable"
      })
    );
  }
  try {
    return ok(parseReflectionWire(json));
  } catch (error) {
    return err(error instanceof ShaderError ? error : reflectionMalformed(String(error)));
  }
}
async function parse(source) {
  let wasm;
  try {
    wasm = await ensureReady();
  } catch (e) {
    return err(
      wrapShaderError(
        e,
        "rerun bash packages/wgpu-wasm/build.sh and verify packages/wgpu-wasm/pkg contains a fresh .wasm"
      )
    );
  }
  try {
    const parsed = wasm.parse(source);
    return ok(parsed);
  } catch (e) {
    return err(wrapShaderError(e));
  }
}
async function validate(parsed) {
  let wasm;
  try {
    wasm = await ensureReady();
  } catch (e) {
    return err(
      wrapShaderError(
        e,
        "rerun bash packages/wgpu-wasm/build.sh and verify packages/wgpu-wasm/pkg contains a fresh .wasm"
      )
    );
  }
  try {
    const validated = wasm.validate(parsed);
    return ok(validated);
  } catch (e) {
    return err(wrapShaderError(e));
  }
}
async function validateRenderEntries(module, vertex, fragment) {
  try {
    const wasm = await ensureReady();
    wasm.validate_render_entries(
      module,
      vertex,
      fragment
    );
    return ok(void 0);
  } catch (error) {
    return err(wrapShaderError(error));
  }
}
async function composeShader(entry, imports, defines) {
  const wasm = await ensureReady();
  const compose = wasm.compose_shader;
  return compose(entry, JSON.stringify(imports), JSON.stringify(defines));
}
async function emit_reflection(validated, options_json) {
  let wasm;
  try {
    wasm = await ensureReady();
  } catch (e) {
    return err(
      wrapShaderError(
        e,
        "rerun bash packages/wgpu-wasm/build.sh and verify packages/wgpu-wasm/pkg contains a fresh .wasm"
      )
    );
  }
  try {
    const reflectionJson = wasm.emit_reflection(
      validated,
      options_json
    );
    return ok(reflectionJson);
  } catch (e) {
    return err(wrapShaderError(e));
  }
}

export { ShaderError, compileFailed, composeShader, emit_reflection, initFailed, manifestMalformed, parse, parseReflectionWire, readReflectionWire, shaderNotFound, validate, validateRenderEntries };
